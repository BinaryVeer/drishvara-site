import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

// Shared navigation is required on the homepage and every dedicated route.
const shell = fs.readFileSync('assets/js/drishvara-v2-shell.js', 'utf8');
const dedicated = fs.readFileSync('assets/js/drishvara-dedicated-pages.js', 'utf8');
const css = fs.readFileSync('assets/css/drishvara-v2-shell.css', 'utf8');
const routes = [
  ['index.html', 'today'],
  ['panchang.html', 'time'],
  ['what-stars-say.html', 'reflect'],
  ['sports.html', 'sports']
];

for (const [page, active] of routes) {
  const dom = new JSDOM('<!doctype html><html><body><main></main></body></html>', {
    url: 'https://www.drishvara.com/' + page,
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.eval(shell);
  const api = window.DrishvaraV2Shell;
  assert.ok(api?.ensureHeader, 'Shared header must initialize on ' + page);
  api.ensureHeader(active);
  api.ensureHeader(active); // repeated mounts must be idempotent

  const desktop = window.document.querySelectorAll('.dv2-nav a[href="sports.html"]');
  const mobile = window.document.querySelectorAll('.dv2-mobile-menu__list a[href="sports.html"]');
  assert.equal(desktop.length, 1, page + ': exactly one desktop Sports link');
  assert.equal(mobile.length, 1, page + ': exactly one mobile Sports link');
  assert.equal(desktop[0].textContent.trim(), 'Sports');
  assert.match(mobile[0].textContent, /Sports/);
  assert.equal(desktop[0].getAttribute('aria-current') === 'true', active === 'sports',
    page + ': Sports active indicator');

  const menuButton = window.document.querySelector('[data-dv2-open-menu]');
  assert.ok(menuButton, page + ': mobile menu trigger');
  menuButton.click();
  assert.equal(window.document.getElementById('dv2-mobile-menu').getAttribute('data-open'), 'true');

  const html = fs.readFileSync(page, 'utf8');
  assert.match(html, /assets\/js\/drishvara-v2-shell\.js\?v=20261105-sports-nav/,
    page + ': versioned shared shell');
  assert.match(html, /assets\/css\/drishvara-v2-shell\.css\?v=20261105-sports-nav/,
    page + ': versioned responsive CSS');
  if (page !== 'index.html') {
    assert.match(html, /assets\/js\/drishvara-dedicated-pages\.js\?v=20261105-sports-nav/,
      page + ': versioned dedicated-page JS');
  }
  window.close();
}

assert.doesNotMatch(dedicated, /function pageNavigation\s*\(/,
  'Dedicated pages must not duplicate the shared nav');
assert.match(css, /@media \(max-width: 1160px\)/,
  'Keep the seven-entry desktop nav from crowding medium widths');
assert.match(css, /height: 100dvh;[\s\S]*?overflow-y: auto;/,
  'Mobile navigation must be scrollable at short viewport heights');

console.log('PASS: Sports navigation exists once on all four routes; active state, mobile menu, and cache busting are governed by the shared shell.');
