#!/usr/bin/env node
/**
 * Mobile horizontal-overflow check for the marketing pages.
 *
 * Loads every top-level *.html and lp/*.html page (skipping redirect stubs and
 * the app shell) in headless Chromium at phone widths and fails if the document
 * is wider than the viewport, naming the elements that stick out.
 *
 *   npm run mobilecheck                      # 320px and 375px, exit 1 on overflow
 *   node tests/mobile-overflow-check.cjs --widths 320,375,390 --shots /tmp/shots
 *   node tests/mobile-overflow-check.cjs --only pricing.html,coverage.html
 *
 * Two measurement details matter and both have bitten this repo before:
 *  1. Desktop emulation (isMobile: false). Mobile emulation zooms the visual
 *     viewport out to fit wide content, so window.innerWidth grows to match the
 *     page and the overflow disappears from the numbers while the phone shows a
 *     tiny page. Desktop emulation at a phone width keeps innerWidth fixed.
 *  2. Real webfonts. The fallback sans-serif is narrower than Archivo / Public
 *     Sans, so with fonts blocked the top-bar nav "fits" and the report is green.
 *     The Google Fonts CSS and woff2 files are fetched with curl (honours the
 *     sandbox proxy) into a temp cache and served to the browser from there. The
 *     per-page "fonts=N" column shows how many webfonts actually loaded (0 is
 *     normal on the lp/ pages that link the fonts but never use them); a font
 *     that fails to load prints a warning because the run may under-report.
 *
 * Needs playwright (npm i -D playwright && npx playwright install chromium, or a
 * global install). MOBILECHECK_CHROMIUM=/path/to/chrome overrides the binary.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const root = path.resolve(flag('--root') ?? path.join(__dirname, '..'));
const widths = (flag('--widths') ?? '320,375').split(',').map(Number);
const shotsDir = flag('--shots');
const only = flag('--only') ? flag('--only').split(',') : null;
const TOLERANCE = 1;

function loadPlaywright() {
  try { return require('playwright'); } catch { /* not local */ }
  try {
    const g = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
    return require(path.join(g, 'playwright'));
  } catch { /* not global */ }
  console.error('playwright is not installed. Run: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}
const { chromium } = loadPlaywright();
const executablePath = process.env.MOBILECHECK_CHROMIUM
  || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

function listPages() {
  const top = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
  const lpDir = path.join(root, 'lp');
  const lp = fs.existsSync(lpDir) ? fs.readdirSync(lpDir).filter((f) => f.endsWith('.html')).map((f) => 'lp/' + f) : [];
  return [...top, ...lp].sort().filter((p) => {
    if (only && !only.includes(p)) return false;
    const html = fs.readFileSync(path.join(root, p), 'utf8');
    return !/http-equiv="refresh"/i.test(html); // redirect stubs such as refunds.html
  });
}

function hash(s) { let h = 5381; for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return h.toString(16); }

function buildFontCache(pages) {
  const cacheDir = path.join(os.tmpdir(), 'ir-mobilecheck-fonts');
  fs.mkdirSync(cacheDir, { recursive: true });
  const sources = pages.map((p) => path.join(root, p));
  const assetsDir = path.join(root, 'assets');
  if (fs.existsSync(assetsDir)) for (const f of fs.readdirSync(assetsDir)) if (f.endsWith('.css')) sources.push(path.join(assetsDir, f));
  const cssUrls = new Set();
  for (const f of sources) for (const m of fs.readFileSync(f, 'utf8').matchAll(/https:\/\/fonts\.googleapis\.com\/css[^"' )]*/g)) cssUrls.add(m[0].replace(/&amp;/g, '&'));
  const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
  const curl = (url, out) => {
    try { execFileSync('curl', ['-sS', '--max-time', '30', '-A', UA, url, '-o', out], { stdio: 'ignore' }); } catch { /* offline */ }
    return fs.existsSync(out) && fs.statSync(out).size > 0;
  };
  const cssFile = new Map();
  for (const url of cssUrls) {
    const f = path.join(cacheDir, `css-${hash(url)}.css`);
    if (!fs.existsSync(f) && !curl(url, f)) continue;
    cssFile.set(url, f);
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/https:\/\/fonts\.gstatic\.com\/[^)]+/g)) {
      const woff = path.join(cacheDir, path.basename(m[0]));
      if (!fs.existsSync(woff)) curl(m[0], woff);
    }
  }
  return { cacheDir, cssFile, linked: cssUrls.size };
}

// Runs in the page: document width plus the visible elements that extend past the
// viewport and are not inside an ancestor that scrolls or clips horizontally on purpose.
function measure(W) {
  const desc = (e) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
  const contained = (el) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const ox = getComputedStyle(a).overflowX;
      if ((ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') && a.getBoundingClientRect().right <= W + 1) return true;
    }
    return false;
  };
  const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  const culprits = [];
  if (scrollWidth > W + 1) {
    for (const el of document.querySelectorAll('body *')) {
      const b = el.getBoundingClientRect();
      if (b.width > 0 && b.height > 0 && b.right > W + 1 && !contained(el)) { culprits.push(`${desc(el)}@${Math.round(b.right)}`); if (culprits.length >= 3) break; }
    }
  }
  const faces = [...document.fonts];
  const fontsLoaded = faces.filter((f) => f.status === 'loaded').length;
  const fontsFailed = faces.filter((f) => f.status === 'error').length;
  return { scrollWidth, culprits, fontsLoaded, fontsFailed };
}

(async () => {
  const pages = listPages();
  if (!pages.length) { console.error('no pages found under ' + root); process.exit(2); }
  const fonts = buildFontCache(pages);
  if (shotsDir) fs.mkdirSync(shotsDir, { recursive: true });
  const browser = await chromium.launch({ executablePath });
  const rows = [];
  for (const W of widths) {
    const ctx = await browser.newContext({ viewport: { width: W, height: 800 }, deviceScaleFactor: 2, isMobile: false });
    await ctx.route('**/*', (r) => {
      const u = r.request().url();
      if (u.startsWith('file://')) return r.continue();
      if (fonts.cssFile.has(u)) return r.fulfill({ status: 200, contentType: 'text/css', body: fs.readFileSync(fonts.cssFile.get(u)) });
      if (u.startsWith('https://fonts.gstatic.com/')) {
        const f = path.join(fonts.cacheDir, path.basename(u));
        if (fs.existsSync(f)) return r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(f) });
        return r.continue();
      }
      return r.abort(); // GTM, analytics, anything else: not part of layout
    });
    for (const p of pages) {
      const page = await ctx.newPage();
      try {
        await page.goto('file://' + path.join(root, p), { waitUntil: 'load', timeout: 20000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(150);
        const m = await page.evaluate(measure, W);
        rows.push({ W, p, ...m, over: m.scrollWidth > W + TOLERANCE });
        if (shotsDir) await page.screenshot({ path: path.join(shotsDir, `${p.replace(/[\/.]/g, '_')}-${W}.png`), fullPage: true });
      } catch (e) {
        rows.push({ W, p, error: String(e).split('\n')[0].slice(0, 100) });
      }
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();

  let bad = 0, errors = 0, fontWarn = false;
  for (const r of rows) {
    if (r.error) { errors++; console.log(`${r.W}px  ${r.p.padEnd(36)} ERROR ${r.error}`); continue; }
    if (r.over) bad++;
    if (r.fontsFailed > 0) fontWarn = true;
    console.log(`${r.W}px  ${r.p.padEnd(36)} fonts=${String(r.fontsLoaded).padStart(2)}  ${r.over ? `OVERFLOW ${r.scrollWidth}>${r.W}  ${r.culprits.join(' | ') || '(text or pseudo-element)'}` : 'ok'}`);
  }
  console.log(`\n${bad} overflowing of ${rows.length} page-widths (${pages.length} pages x ${widths.length} widths)${errors ? `, ${errors} errors` : ''}`);
  if (fontWarn) console.log('WARNING: at least one webfont failed to load (no network?). Fallback fonts are narrower; overflow may be under-reported.');
  process.exit(bad || errors ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
