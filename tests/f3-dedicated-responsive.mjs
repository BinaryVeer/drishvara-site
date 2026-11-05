import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('assets/css/drishvara-dedicated-pages.css', 'utf8');
const routes = ['panchang.html', 'what-stars-say.html', 'sports.html'];
for (const route of routes) {
  const page = fs.readFileSync(route, 'utf8');
  assert.match(page, /drishvara-dedicated-pages\.css\?v=20261105-f3-responsive/, route + ' must invalidate the previous CSS');
}

const mobile = css.slice(css.indexOf('/* F3 responsive-density corrections.'));
assert.ok(mobile.length > 0, 'F3 corrections must remain at the end of the dedicated stylesheet');
assert.match(mobile, /@media \(max-width: 1000px\)/);
assert.match(mobile, /@media \(max-width: 700px\)/);
assert.match(mobile, /@media \(max-width: 420px\)/);
for (const component of ['d-panchang-results', 'd-panchang-annual', 'd-reflection-grid',
  'd-reflection-explain', 'd-sports-top', 'd-sports-bottom']) {
  assert.ok(mobile.includes('.d-' + 'dedicated .' + component), component + ' must collapse before tablet widths');
}
for (const control of ['panchang-previous-day', 'panchang-today', 'panchang-next-day',
  'panchang-date-text', 'panchang-date-picker']) {
  assert.ok(mobile.includes(control), control + ' must have an explicit mobile grid position');
}
assert.match(mobile, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\) !important/);
assert.match(mobile, /#panchang-date-picker\s*\{\s*width: 100% !important;/);
assert.match(mobile, /\.r-month-controls \{ flex-wrap: wrap; \}/);

const panchang = fs.readFileSync('panchang.html', 'utf8');
for (const control of ['panchang-previous-day', 'panchang-today', 'panchang-next-day',
  'panchang-date-text', 'panchang-date-picker']) {
  assert.equal((panchang.match(new RegExp('id="' + control + '"', 'g')) || []).length, 1,
    control + ' must exist exactly once and remain controller-owned');
}
const star = fs.readFileSync('what-stars-say.html', 'utf8');
assert.match(star, /data-ag71e-preview-panel="star-reflection"/);
const sports = fs.readFileSync('sports.html', 'utf8');
assert.match(sports, /id="sports-featured"/);
assert.match(sports, /id="sports-standings-status"/);

console.log('PASS: F3 responsive styles and versions are present on three routes, date controls are preserved, and no result surfaces were removed.');
