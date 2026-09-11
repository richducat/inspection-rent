const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'assets/marketing-analytics.js'), 'utf8');

function setup(page = '/forms.html', layer = [{traffic_type: 'internal'}]) {
  const listeners = [];
  const window = {location: new URL('https://inspection.rent' + page), dataLayer: layer};
  const document = {baseURI: window.location.href, addEventListener(name, callback) {
    assert.equal(name, 'click'); listeners.push(callback);
  }};
  const context = vm.createContext({window, document, URL});
  vm.runInContext(script, context);
  return {window, context, listeners, click(href, attrs = {}, section = {id:'', tagName:'HEADER'}) {
    const anchor = {
      id: attrs.id || '',
      getAttribute(name) {return name === 'href' ? href : attrs[name] || null;},
      hasAttribute(name) {return Boolean(attrs[name]);},
      closest(selector) {return selector === 'a' ? this : section;}
    };
    listeners.forEach(callback => callback({target: anchor}));
    return window.dataLayer;
  }};
}

test('relative, root-relative, absolute and campaign app links produce one intent event each', () => {
  const s = setup('/forms.html?email=private%40example.com');
  for (const href of ['app/', '/app/', 'https://inspection.rent/app/', '/app?v=lp05&address=private#report']) s.click(href);
  assert.equal(s.window.dataLayer.length, 5);
  for (const event of s.window.dataLayer.slice(1)) {
    assert.equal(event.event, 'app_open_click');
    assert.equal(event.source_page, '/forms.html');
    assert.equal(event.cta_location, 'header');
  }
  assert.ok(!JSON.stringify(s.window.dataLayer).includes('private'));
  assert.equal(s.window.dataLayer[0].traffic_type, 'internal');
});

test('non-app, external, email, script and download links do not count as app intent', () => {
  const s = setup();
  for (const href of ['pricing.html', '#app', 'https://other.example/app/', 'mailto:hello@example.com', 'javascript:alert(1)', '/app/not-an-entry', null]) s.click(href);
  s.click('/app/', {download:true});
  assert.equal(s.window.dataLayer.length, 1);
});

test('nested campaign pages and result CTAs retain useful static locations', () => {
  const lp = setup('/lp/lp05.html'); lp.click('/app/?v=lp05', {'data-cta-location':'four_point_hero'});
  assert.equal(lp.window.dataLayer[1].cta_location, 'four_point_hero');
  assert.equal(lp.window.dataLayer[1].source_page, '/lp/lp05.html');
  const check = setup('/check.html'); check.click('app/', {id:'rAppCta'});
  assert.equal(check.window.dataLayer[1].cta_location, 'check_results');
  check.click('app/'); assert.equal(check.window.dataLayer[2].cta_location, 'check_page');
});

test('duplicate script loads do not duplicate events and invalid labels contain no free text', () => {
  const s = setup(); vm.runInContext(script, s.context);
  assert.equal(s.listeners.length, 1);
  s.click('app/', {'data-cta-location':'customer@example.com'});
  assert.equal(s.window.dataLayer.length, 2);
  assert.equal(s.window.dataLayer[1].cta_location, 'page');
});

test('a failed analytics queue cannot throw into the navigation click', () => {
  const s = setup('/pricing.html', {push() {throw new Error('Tag failure');}});
  assert.doesNotThrow(() => s.click('app/'));
});

test('every marketing page with an app entry loads the shared tracker once with no duplicate inline event', () => {
  const files = fs.readdirSync(root).filter(f => f.endsWith('.html'))
    .concat(fs.readdirSync(path.join(root, 'lp')).filter(f => f.endsWith('.html')).map(f => 'lp/' + f));
  for (const file of files) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    if (!/href=["'][^"']*app\//.test(html)) continue;
    assert.equal((html.match(/src=["'][^"']*marketing-analytics\.js["']/g) || []).length, 1, file);
    assert.ok(!html.includes('event: "app_open_click"'), file);
    const relative = file.startsWith('lp/') ? '../assets/marketing-analytics.js' : 'assets/marketing-analytics.js';
    assert.ok(html.includes('src="' + relative + '"'), file);
  }
});
