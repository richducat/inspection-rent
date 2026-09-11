const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'assets/marketing-analytics.js'), 'utf8');

function setup(page = '/forms.html', layer = [{traffic_type: 'internal'}]) {
  const listeners = [];
  const navigations = [], events = [], timers = new Map();
  let nextTimer = 0, now = 0;
  const window = {location: new URL('https://inspection.rent' + page), dataLayer: layer,
    setTimeout(callback, delay) {const id = ++nextTimer; timers.set(id, {callback, at:now + delay}); return id;},
    clearTimeout(id) {timers.delete(id);}
  };
  window.location.assign = href => navigations.push(href);
  const document = {baseURI: window.location.href, addEventListener(name, callback) {
    assert.equal(name, 'click'); listeners.push(callback);
  }};
  const context = vm.createContext({window, document, URL});
  vm.runInContext(script, context);
  return {window, document, context, listeners, navigations, events, timers,
    advance(ms) {
      now += ms;
      for (const [id, timer] of [...timers]) {
        if (timer.at <= now) {timers.delete(id); timer.callback();}
      }
    },
    click(href, attrs = {}, section = {id:'', tagName:'HEADER'}, options = {}) {
    const anchor = {
      id: attrs.id || '',
      getAttribute(name) {return name === 'href' ? href : attrs[name] || null;},
      hasAttribute(name) {return Object.hasOwn(attrs, name);},
      closest(selector) {return selector === 'a' ? this : section;}
    };
    const event = {target: anchor, button:0, cancelable:true, defaultPrevented:false,
      preventDefault() {this.defaultPrevented = true;}, ...options};
    events.push(event);
    listeners.forEach(callback => callback(event));
    return window.dataLayer;
  }};
}

test('relative, root-relative, absolute and campaign app links produce one intent event each', () => {
  const s = setup('/forms.html?email=private%40example.com');
  for (const href of ['app/', '/app/', 'https://inspection.rent/app/', '/app?v=lp05&address=private#report']) {
    s.click(href); s.advance(300);
  }
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
  check.advance(300);
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
  assert.equal(s.events[0].defaultPrevented, true);
  assert.deepEqual(s.navigations, ['https://inspection.rent/app/']);
  s.advance(300); assert.equal(s.navigations.length, 1);
});

test('same-tab callback releases navigation early, preserving the complete destination once', () => {
  const s = setup(); s.click('/app/?v=four-point&utm_source=partner#sample');
  const payload = s.window.dataLayer[1];
  assert.equal(s.events[0].defaultPrevented, true);
  assert.equal(payload.eventTimeout, 250);
  assert.equal(typeof payload.eventCallback, 'function');
  assert.equal(s.navigations.length, 0);
  payload.eventCallback('GTM-PX3ZXWR6');
  payload.eventCallback('another-container');
  s.advance(1000);
  assert.deepEqual(s.navigations, ['https://inspection.rent/app/?v=four-point&utm_source=partner#sample']);
  assert.equal(s.timers.size, 0);
});

test('blocked or unresponsive GTM has an independent 300ms navigation fallback', () => {
  const s = setup(); s.click('app/');
  const payload = s.window.dataLayer[1];
  s.advance(299); assert.equal(s.navigations.length, 0);
  s.advance(1); assert.deepEqual(s.navigations, ['https://inspection.rent/app/']);
  payload.eventCallback(); s.advance(1000);
  assert.equal(s.navigations.length, 1);
});

test('synchronous callbacks and an exception after callback cannot navigate twice', () => {
  const s = setup('/pricing.html', {push(payload) {payload.eventCallback(); throw new Error('Later tag failure');}});
  assert.doesNotThrow(() => s.click('/app/?plan=annual'));
  s.advance(300);
  assert.deepEqual(s.navigations, ['https://inspection.rent/app/?plan=annual']);
});

test('modified, non-primary, targeted and noncancelable clicks retain native behavior', () => {
  for (const options of [{metaKey:true}, {ctrlKey:true}, {shiftKey:true}, {altKey:true}, {button:1}, {button:2}, {cancelable:false}, {defaultPrevented:true}]) {
    const s = setup(); s.click('app/', {}, undefined, options);
    assert.equal(s.events[0].defaultPrevented, options.defaultPrevented || false);
    assert.equal(s.window.dataLayer[1].eventCallback, undefined);
    assert.equal(s.timers.size, 0);
    assert.equal(s.navigations.length, 0);
  }
  for (const target of ['_blank', '_parent', '_top', 'named-window']) {
    const s = setup(); s.click('app/', {target});
    assert.equal(s.events[0].defaultPrevented, false);
    assert.equal(s.timers.size, 0);
  }
  const base = setup(); base.document.querySelector = () => ({getAttribute() {return '_blank';}});
  base.click('app/'); assert.equal(base.events[0].defaultPrevented, false);
  const download = setup(); download.click('app/', {download:''});
  assert.equal(download.events[0].defaultPrevented, false);
  assert.equal(download.window.dataLayer.length, 1);
});

test('rapid duplicate clicks share a single handoff and tracker load remains idempotent', () => {
  const s = setup(); vm.runInContext(script, s.context);
  s.click('/app/?v=first'); s.click('/app/?v=first');
  assert.equal(s.events[1].defaultPrevented, true);
  assert.equal(s.window.dataLayer.length, 2);
  s.advance(300);
  assert.deepEqual(s.navigations, ['https://inspection.rent/app/?v=first']);
});

test('timer creation/cleanup failures still release a canceled click', () => {
  const creation = setup(); creation.window.setTimeout = () => {throw new Error('Timer unavailable');};
  assert.doesNotThrow(() => creation.click('app/'));
  assert.deepEqual(creation.navigations, ['https://inspection.rent/app/']);
  const cleanup = setup(); cleanup.window.clearTimeout = () => {throw new Error('Cleanup failed');};
  cleanup.click('app/'); cleanup.window.dataLayer[1].eventCallback(); cleanup.advance(300);
  assert.deepEqual(cleanup.navigations, ['https://inspection.rent/app/']);
});

test('location.assign failure falls back to href with the query and fragment intact', () => {
  const s = setup();
  const original = s.window.location.href;
  Object.defineProperty(s.window.location, 'href', {get() {return original;}, set(value) {s.navigations.push(value);}});
  s.window.location.assign = () => {throw new Error('assign unavailable');};
  s.click('/app/?v=fallback#sample');
  s.window.dataLayer[1].eventCallback(); s.advance(300);
  assert.deepEqual(s.navigations, ['https://inspection.rent/app/?v=fallback#sample']);
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
