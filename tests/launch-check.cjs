#!/usr/bin/env node
/*
 * Launch-day check for the $50 / $500 offer (branch claude/pricing-50-500).
 *
 * The branch is built to sit unlaunched, so two dates cannot be known in advance:
 *   - the visible "Effective <date>." line in terms.html (a token until launch day)
 *   - the <lastmod> of every sitemap page that carries the new prices
 * Run this on launch day, after setting both, and before merging:
 *
 *   npm run launchcheck -- 2026-10-14        (the launch date, UTC, YYYY-MM-DD)
 *
 * It exits 1 and lists what is wrong if the token is still in any page, if terms.html
 * does not say "Effective <Month D, YYYY>." for that date, or if a price-carrying page in
 * sitemap.xml has a different lastmod. It is NOT part of `npm test`: it must fail until
 * launch day. Options: --root <dir> to check another checkout.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const TOKEN = 'LAUNCH-DATE-NOT-SET';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];

// Pure so it can be unit-tested: files is { 'terms.html': '...', 'sitemap.xml': '...', ... }.
function launchProblems(files, isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || '');
  const d = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
  if (!d || d.toISOString().slice(0, 10) !== isoDate) {
    return ['Give the launch date as YYYY-MM-DD, for example: npm run launchcheck -- 2026-10-14'];
  }
  const problems = [];
  for (const [name, text] of Object.entries(files)) {
    if (text.includes(TOKEN)) problems.push(`${name}: still contains the token ${TOKEN}`);
  }
  const effective = `Effective ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}.`;
  if (!(files['terms.html'] || '').includes(effective)) {
    problems.push(`terms.html: does not say "${effective}"`);
  }
  const entry = /<loc>https:\/\/inspection\.rent\/([^<]*)<\/loc>\s*<lastmod>([^<]*)<\/lastmod>/g;
  let seen = 0;
  for (const [, loc, lastmod] of (files['sitemap.xml'] || '').matchAll(entry)) {
    const page = loc || 'index.html';
    // A page "carries the new prices" when its HTML mentions $50 (which also matches $500).
    if (!(files[page] || '').includes('$50')) continue;
    seen += 1;
    if (lastmod !== isoDate) problems.push(`sitemap.xml: ${page} has lastmod ${lastmod}, expected ${isoDate}`);
  }
  if (!seen) problems.push('sitemap.xml: found no page that carries the new prices (wrong --root?)');
  return problems;
}

module.exports = { launchProblems, TOKEN };

if (require.main === module) {
  const args = process.argv.slice(2);
  const rootAt = args.indexOf('--root');
  const root = rootAt >= 0 ? path.resolve(args.splice(rootAt, 2)[1]) : path.resolve(__dirname, '..');
  const files = { 'sitemap.xml': fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8') };
  for (const dir of ['', 'lp']) {
    for (const f of fs.readdirSync(path.join(root, dir)).filter((n) => n.endsWith('.html'))) {
      const rel = dir ? `${dir}/${f}` : f;
      files[rel] = fs.readFileSync(path.join(root, rel), 'utf8');
    }
  }
  const problems = launchProblems(files, args[0]);
  if (problems.length) {
    console.error(`launchcheck: ${problems.length} problem(s)`);
    for (const p of problems) console.error('  - ' + p);
    process.exit(1);
  }
  console.log(`launchcheck: ok, terms.html and the sitemap both say ${args[0]}`);
}
