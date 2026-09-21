'use strict';
// Unit tests for tests/launch-check.cjs (the launch-day date check). No install needed.
const test = require('node:test');
const assert = require('node:assert');
const { launchProblems, TOKEN } = require('./launch-check.cjs');

const sitemap = (pricingDate, privacyDate) => `<urlset>
  <url><loc>https://inspection.rent/</loc>
    <lastmod>${pricingDate}</lastmod></url>
  <url><loc>https://inspection.rent/privacy.html</loc>
    <lastmod>${privacyDate}</lastmod></url>
</urlset>`;
const launched = {
  'terms.html': '<strong>Effective October 4, 2026.</strong>',
  'index.html': '$50 a month or $500 a year',
  'privacy.html': 'no prices here',
  'sitemap.xml': sitemap('2026-10-04', '2026-07-18'),
};

test('a fully dated checkout passes, and pages without prices keep their own lastmod', () => {
  assert.deepStrictEqual(launchProblems(launched, '2026-10-04'), []);
});

test('the placeholder token is refused wherever it is', () => {
  const files = { ...launched, 'terms.html': `<strong>Effective ${TOKEN}.</strong>` };
  const problems = launchProblems(files, '2026-10-04');
  assert.ok(problems.some((p) => p.includes(TOKEN)));
  assert.ok(problems.some((p) => p.includes('Effective October 4, 2026.')));
});

test('a month without a day is not a date', () => {
  const files = { ...launched, 'terms.html': '<strong>Effective October 2026.</strong>' };
  assert.strictEqual(launchProblems(files, '2026-10-04').length, 1);
});

test('a price-carrying page with an older lastmod is reported', () => {
  const files = { ...launched, 'sitemap.xml': sitemap('2026-09-21', '2026-07-18') };
  assert.deepStrictEqual(launchProblems(files, '2026-10-04'),
    ['sitemap.xml: index.html has lastmod 2026-09-21, expected 2026-10-04']);
});

test('a missing or impossible date is refused', () => {
  assert.strictEqual(launchProblems(launched, undefined).length, 1);
  assert.strictEqual(launchProblems(launched, '2026-02-30').length, 1);
});
