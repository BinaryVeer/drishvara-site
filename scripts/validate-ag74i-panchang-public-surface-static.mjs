import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error("❌ AG74I static validation failed: " + message);
  process.exit(1);
}
function pass(message) { console.log("✅ " + message); }
function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
function starFingerprint(index) {
  const select = index.match(/<select\b[^>]*id="star-birth-place-select"[\s\S]*?<\/select>/i);
  const buttons = [...index.matchAll(/<button\b[^>]*data-ag71d-r4-select-kind="star-reflection"[^>]*>[\s\S]*?<\/button>/gi)].map((match) => match[0]);
  if (!select || !buttons.length) fail("Star Reflection fingerprint source missing.");
  return select[0] + "\n" + buttons.join("\n");
}
function functionGuarded(source, signature) {
  const index = source.indexOf(signature);
  if (index < 0) return false;
  return source.slice(index, index + 240).includes("window.drishvaraAg74iPublicSurfaceActive === true");
}

const required = [
  "data/knowledge-base/panchang-festival/production/ag74i-panchang-public-surface-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74i-panchang-date-navigation-ui-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74i-varanasi-annual-calendar-book-shell-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74i-observance-window-placeholder-contract.json",
  "data/knowledge-base/location-intelligence/production/ag74i-varanasi-default-location-alias-record.json",
  "data/knowledge-base/panchang-festival/production/ag74i-panchang-dom-ownership-contract.json",
  "data/content-intelligence/mutation-plans/ag74i-to-ag74j-panchang-contract-lock-boundary.json",
  "data/content-intelligence/quality-registry/ag74i-ag74j-panchang-contract-lock-readiness-record.json",
  "data/content-intelligence/quality-reviews/ag74i-panchang-public-surface-stabilization.json",
  "data/quality/ag74i-panchang-public-surface-stabilization.json",
  "data/quality/ag74i-panchang-public-surface-stabilization-preview.json",
  "docs/quality/AG74I_PANCHANG_PUBLIC_SURFACE_STABILIZATION.md",
  "index.html",
  "package.json",
  "scripts/build-static-release-candidate.mjs",
  "assets/js/daily-basis-guard.js",
  "scripts/ag74i-panchang-browser-qa.html",
  "scripts/run-ag74i-panchang-browser-qa.sh",
  "scripts/extract-ag74i-panchang-browser-qa-report.mjs",
  "scripts/finalize-ag74i-panchang-public-surface.mjs"
];

for (const file of required) {
  if (!exists(file)) fail("Missing required file: " + file);
}

const index = read("index.html");
for (const marker of [
  "AG74I_PANCHANG_PUBLIC_SURFACE_START",
  "AG74I_PANCHANG_PUBLIC_SURFACE_END",
  "AG74I_PANCHANG_PUBLIC_SURFACE_CONTROLLER_START",
  'data-ag74i-panchang-public-surface="true"',
  'data-ag74i-default-location="varanasi_in"',
  'data-ag74i-default-timezone="Asia/Kolkata"',
  'data-ag74i-exact-record-only="true"',
  'data-ag74i-public-approval-required="true"',
  'data-ag74i-nearest-record-substitution="false"',
  "panchang-date-text",
  "panchang-date-picker",
  "panchang-previous-day",
  "panchang-today",
  "panchang-next-day",
  'data-ag74i-varanasi-calendar-book="true"',
  "upcoming-observance-begins",
  "upcoming-observance-ends",
  "upcoming-observance-ritual-window",
  "record.ag74i_public_display_allowed === true",
  "record.public_output_allowed === true",
  "record.ui_output_allowed === true",
  "record.exact_value_publication_allowed === true",
  "record.index_html_wiring_allowed === true",
  "recordTimezone(record) === place.timezone",
  'return "conflict"',
  "Governed place selection"
]) {
  if (!index.includes(marker)) fail("Missing index marker: " + marker);
}

const cardStart = index.indexOf('<div class="card" id="panchang-festival-card"');
const cardEnd = index.indexOf('<div class="card" id="open-day-card"', cardStart);
if (cardStart < 0 || cardEnd < 0) fail("Panchang card boundaries missing.");

const card = index.slice(cardStart, cardEnd);
const select = card.match(/<select\b[^>]*id="panchang-place-select"[\s\S]*?<\/select>/i);
if (!select) fail("Scoped Panchang select missing.");

const varanasiOptions = [...select[0].matchAll(/<option\b[^>]*value="varanasi-uttar-pradesh-india"[^>]*>/gi)];
if (varanasiOptions.length !== 1) fail("Expected exactly one Varanasi option.");
if (!/\sselected\b/i.test(varanasiOptions[0][0])) fail("Varanasi option must be selected.");

const itanagarOption = select[0].match(/<option\b[^>]*value="itanagar-arunachal-pradesh-india"[^>]*>/i);
if (!itanagarOption) fail("Itanagar option missing.");
if (/\sselected\b/i.test(itanagarOption[0])) fail("Itanagar must not remain selected.");

const review = readJson("data/content-intelligence/quality-reviews/ag74i-panchang-public-surface-stabilization.json");
const currentStarHash = sha256(starFingerprint(index));
if (review.star_reflection_selector_sha256_before !== currentStarHash) {
  fail("Star Reflection selector differs from the pre-AG74I fingerprint.");
}
if (review.star_reflection_selector_sha256_after !== currentStarHash) {
  fail("Star Reflection post-AG74I fingerprint mismatch.");
}

if ((index.match(/data-ag74i-book-page="[1-4]"/g) || []).length !== 4) {
  fail("Expected exactly four annual-book pages.");
}

const controller = index.match(/AG74I_PANCHANG_PUBLIC_SURFACE_CONTROLLER_START([\s\S]*?)AG74I_PANCHANG_PUBLIC_SURFACE_CONTROLLER_END/);
if (!controller) fail("AG74I controller block missing.");

for (const forbidden of ["localStorage", "sessionStorage", "document.cookie", "indexedDB", "https://", "http://"]) {
  if (controller[1].includes(forbidden)) fail("Forbidden AG74I controller dependency: " + forbidden);
}
if (controller[1].includes("records[0]") || controller[1].includes("list[0]")) {
  fail("AG74I controller contains first-record fallback.");
}

for (const [signature, label] of [
  ["function applyPanchang(panchang) {", "applyPanchang"],
  ["function applyFestivals(festivals) {", "applyFestivals"],
  ["function applyAg64bPanchangFestival(data) {", "applyAg64bPanchangFestival"],
  ["async function loadAg64bPanchangFestival() {", "loadAg64bPanchangFestival"],
  ["function updatePanchangMiniTable(basis) {", "updatePanchangMiniTable"],
  ["function updateUpcomingObservanceNote(basis) {", "updateUpcomingObservanceNote"],
  ["function updatePanchangInlineStatus(basis) {", "updatePanchangInlineStatus"],
  ["function previewPanchang() {", "previewPanchang"],
  ["function renderRecord(record) {", "AG71Q renderRecord"],
  ["function previewPanchangAg71qR1() {", "AG71Q preview"]
]) {
  if (!functionGuarded(index, signature)) fail(label + " is not guarded by AG74I ownership.");
}

const ag71q = index.match(/AG71Q_R1_PUBLIC_PILOT_PANCHANG_PREVIEW_CONTROLLER_START([\s\S]*?)AG71Q_R1_PUBLIC_PILOT_PANCHANG_PREVIEW_CONTROLLER_END/);
if (!ag71q) fail("AG71Q block missing.");
if (ag71q[1].includes("return list[0]") || ag71q[1].includes("return records[0]")) {
  fail("AG71Q first-record fallback remains.");
}

const dailyBasisGuard = read("assets/js/daily-basis-guard.js");
for (const marker of [
  "overlapsAg74iOwnedPanchang",
  "window.drishvaraAg74iPublicSurfaceActive === true",
  "card.contains(owned)",
  "owned.contains(card)"
]) {
  if (!dailyBasisGuard.includes(marker)) {
    fail("Daily-basis AG74I DOM-identity guard missing marker: " + marker);
  }
}

const build = read("scripts/build-static-release-candidate.mjs");
if (build.includes("Active calculated Panchang pilot result is available for approved pilot locations and remains under verification.")) {
  fail("Build script still requires obsolete Panchang pilot doctrine.");
}
for (const marker of [
  "ag74i_varanasi_default",
  "ag74i_exact_only",
  "ag74i_public_approval_required",
  "ag74i_governed_unavailable_copy",
  "ag74i_no_visible_transition_copy",
  "ag74i_browser_qa_passed"
]) {
  if (!build.includes(marker)) fail("Build script missing AG74I check: " + marker);
}

const location = readJson("data/knowledge-base/location-intelligence/production/ag74i-varanasi-default-location-alias-record.json");
if (location.canonical_location_id !== "varanasi_in") fail("Varanasi alias canonical ID mismatch.");
if (!Array.isArray(location.aliases) || !["Varanasi", "Banaras", "Benares", "Kashi"].every((alias) => location.aliases.includes(alias))) {
  fail("Varanasi alias inventory incomplete.");
}

const publicContract = readJson("data/knowledge-base/panchang-festival/production/ag74i-panchang-public-surface-contract.json");
if (publicContract.exact_record_policy.unique_match_required !== true) fail("Unique match must be required.");
if (publicContract.exact_record_policy.nearest_date_substitution_allowed !== false) fail("Nearest-date substitution must be false.");
if (publicContract.exact_record_policy.alternate_location_substitution_allowed !== false) fail("Alternate-location substitution must be false.");

const dateContract = readJson("data/knowledge-base/panchang-festival/production/ag74i-panchang-date-navigation-ui-contract.json");
if (dateContract.behaviour_at_ag74i.universal_recalculation_enabled !== false) fail("Universal calculation must remain false.");
if (dateContract.privacy.local_storage_write !== false) fail("Panchang input must not use local storage.");

const bookContract = readJson("data/knowledge-base/panchang-festival/production/ag74i-varanasi-annual-calendar-book-shell-contract.json");
if (bookContract.pagination_shell.physical_page_count !== 4) fail("Annual book page count mismatch.");
if (bookContract.pagination_shell.physical_month_record_count_fixed !== false) fail("Physical month count must remain variable.");
if (bookContract.pagination_shell.gregorian_quarter_language_used !== false) fail("Gregorian quarter language must not be used.");

const observance = readJson("data/knowledge-base/panchang-festival/production/ag74i-observance-window-placeholder-contract.json");
if (observance.placeholder_policy.fabricate_timing !== false) fail("Observance timing fabrication must remain false.");

const ownership = readJson("data/knowledge-base/panchang-festival/production/ag74i-panchang-dom-ownership-contract.json");
if (ownership.ag74i_is_sole_runtime_owner !== true) fail("AG74I must own the Panchang DOM.");

const pkg = readJson("package.json");
for (const script of ["validate:ag74i:static", "qa:ag74i:browser", "validate:ag74i"]) {
  if (!pkg.scripts?.[script]) fail("package.json missing " + script);
}

pass("AG74I static structure and ownership validation passed.");
pass("Panchang mutations are scoped and Star Reflection remains unchanged.");
pass("Public-display approval, timezone and duplicate-match controls are enforced.");
