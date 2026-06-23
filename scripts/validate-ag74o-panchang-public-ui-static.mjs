import fs from "node:fs";
import crypto from "node:crypto";

const fail = (message) => {
  console.error("❌ AG74O-R2 static validation failed: " + message);
  process.exit(1);
};
const pass = (message) => console.log("✅ " + message);
const read = (path) => fs.readFileSync(path, "utf8");
const json = (path) => JSON.parse(read(path));

const required = [
  "index.html",
  "assets/vendor/astronomy-engine-2.1.19.min.js",
  "assets/vendor/astronomy-engine-2.1.19.LICENSE.txt",
  "assets/js/ag74o-panchang-public-controller.js",
  "scripts/ag74o-panchang-browser-qa.html",
  "scripts/run-ag74o-panchang-browser-qa.sh",
  "data/knowledge-base/panchang-festival/production/ag74o-panchang-public-runtime-contract.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r2-browser-approved-location-projection.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r2-selector-query-resolution-contract.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r2-calculation-approval-resolver-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74o-r2-result-state-contract.json",
];
for (const path of required) if (!fs.existsSync(path)) fail("Missing " + path);

const index = read("index.html");
const controller = read("assets/js/ag74o-panchang-public-controller.js");
const pkg = json("package.json");
const runtime = json(
  "data/knowledge-base/panchang-festival/production/ag74o-panchang-public-runtime-contract.json"
);
const projection = json(
  "data/knowledge-base/location-intelligence/production/ag74o-r2-browser-approved-location-projection.json"
);

for (const marker of [
  "AG74O_PANCHANG_PUBLIC_UI_STYLE_START",
  'data-ag74o-panchang-public-runtime="true"',
  "panchang-place-alias",
  "panchang-tithi-transition",
  "ag74o-book-status",
  "astronomy-engine-2.1.19.min.js",
  "ag74o-panchang-public-controller.js",
  'data-ag74i-panchang-public-surface="true"',
  'data-ag74i-varanasi-calendar-book="true"',
  'data-ag74o-place-selection="governed-dropdown-only"',
  'data-ag74o-daily-result-surface="true"',
  'data-ag74o-r2-approved-option-count="0"',
  'data-ag74o-r2-ui-state-only="true"',
  'id="panchang-location-provenance"',
  'id="panchang-coordinate-provenance"',
  'id="panchang-timezone-provenance"',
  'id="panchang-approval-provenance"',
  "AG74O_R2_SELECTOR_CALCULATION_STYLE_START",
]) if (!index.includes(marker)) fail("Index marker missing: " + marker);

for (const marker of [
  "drishvaraAg74oApplySelection",
  "SearchRiseSet",
  "EclipticGeoMoon",
  "SetDeltaTFunction",
  "requestToken",
  "AbortController",
  "final_observance_date_approved===true",
  "public_output_allowed===true",
  "data-ag74o-book-slot",
  "SUPPORTED_START",
  "SUPPORTED_END",
  "APPROVED_LOCATION_PATH",
  "hardenUiStateSelector",
  "installSelectorHardening",
  "MutationObserver",
  "resolveApprovedGovernedRecord",
  "requestFromApprovedRecord",
  "computeDay(approvedRequest)",
  "calculation_pending",
  "ui_state_only",
]) if (!controller.includes(marker)) fail("Controller marker missing: " + marker);

for (const forbidden of [
  "localStorage.setItem",
  "sessionStorage.setItem",
  'fetch("https',
  "fetch('https",
  "supabase",
  "service_role",
  "var LOCATION_MAP = {",
  "var ALIASES = {",
  'LOCATION_MAP[value]||LOCATION_MAP["varanasi-uttar-pradesh-india"]',
  'request.timezone&&validTimezone(request.timezone)?request.timezone:"Asia/Kolkata"',
]) if (controller.includes(forbidden)) fail("Forbidden runtime dependency or fallback: " + forbidden);

const boot = controller.match(/function boot\(\) \{([\s\S]*?)\n  \}/)?.[1] || "";
if (!boot || boot.includes("applySelection(")) {
  fail("Boot must not invoke the public calculation path.");
}

const selectorTag =
  index.match(/<select\b[^>]*id=["']panchang-place-select["'][^>]*>/i)?.[0] || "";
if (!selectorTag) fail("Panchang place selector is missing.");
if (/\sdisabled(?:\s|=|>)/i.test(selectorTag)) {
  fail("Searchable location control must remain active at the zero-approval baseline.");
}
if (
  !selectorTag.includes('data-ag74o-r2-approved-option-count="0"') ||
  !selectorTag.includes('data-ag74o-r2-ui-state-only="true"')
) fail("Active zero-approval selector markers are missing.");
if (
  !index.includes('data-ag74o-r2-public-approved="false"') ||
  !index.includes('data-ag74o-r2-computation-approved="false"')
) fail("UI-state option approval-block markers are missing.");
for (const legacyLabel of ["Itanagar", "New Delhi", "Ranchi", "Tokyo"]) {
  if (!index.includes(`>${legacyLabel}</option>`)) {
    fail(`Legacy AG71D-R1 static compatibility option missing: ${legacyLabel}`);
  }
}
if (
  (index.match(/data-ag74o-r2-legacy-compat-option="true"/g) || []).length !== 4
) fail("Exactly four legacy AG71D-R1 static compatibility options are required.");

const dailySurfaceTags =
  index.match(/<(?:section|div)\b[^>]*\bdata-ag74o-daily-result-surface="true"[^>]*>/gi) || [];
if (dailySurfaceTags.length !== 1) {
  fail(`Exactly one AG74O daily result surface is required; observed ${dailySurfaceTags.length}`);
}

const dailyResultIds = [
  "panchang-calculation-source","panchang-method-basis","panchang-moonrise",
  "panchang-moonset","panchang-sunrise","panchang-sunset","panchang-vara",
  "panchang-tithi","panchang-tithi-transition","panchang-nakshatra",
  "panchang-nakshatra-transition","panchang-yoga","panchang-yoga-transition",
  "panchang-karana","panchang-karana-transition","panchang-paksha",
];
for (const id of dailyResultIds) {
  const count = (index.match(new RegExp(`id=["']${id}["']`, "g")) || []).length;
  if (count !== 1) fail(`Daily Panchang result id ${id} must occur exactly once; observed ${count}`);
}

if (!/data-ag71e-preview-action-shell="panchang"[^>]*hidden[^>]*aria-hidden="true"[^>]*inert/.test(index)) {
  fail("Legacy AG71E Panchang panel must remain hidden, aria-hidden and inert.");
}
if ((index.match(/data-ag74i-book-page=\"[1-4]\"/g) || []).length !== 4) {
  fail("Exactly four book pages are required.");
}
if (!/html,body\{[^}]*overflow-x:(?:hidden|clip)/.test(index)) {
  fail("Global right-overflow guard missing.");
}
if (!index.includes("container-type:inline-size") ||
    !index.includes("@container panchang-card (max-width:700px)")) {
  fail("Panchang card container-aware responsive guard missing.");
}
if (!/#panchang-festival-card\{[^}]*max-width:100%/.test(index)) {
  fail("Panchang card containment rule missing.");
}
if (!/data-ag71d-r4-location-options="panchang"[^>]*data-ag74o-compat-only="true"[^>]*hidden[^>]*aria-hidden="true"/.test(index)) {
  fail("Legacy pilot quick-pick locations are not governed-hidden.");
}

const vendor = fs.readFileSync("assets/vendor/astronomy-engine-2.1.19.min.js");
const source = fs.readFileSync("node_modules/astronomy-engine/astronomy.browser.min.js");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
if (hash(vendor) !== "f41139a87941ea017ab902b954c9389fa27ea72083d7fab4971756d7769d14e6") {
  fail("Vendored browser bundle hash mismatch.");
}
if (hash(vendor) !== hash(source)) {
  fail("Vendored browser bundle differs from installed pinned package.");
}
if (!read("assets/vendor/astronomy-engine-2.1.19.LICENSE.txt").includes("MIT License")) {
  fail("Vendored licence notice missing.");
}

if (pkg.dependencies?.["astronomy-engine"] !== "2.1.19") {
  fail("Astronomy Engine dependency is not exact-pinned.");
}
if (
  pkg.scripts?.["validate:ag74o:static"] !==
  "node scripts/validate-ag74o-panchang-public-ui-static.mjs"
) fail("Static script mismatch.");
if (
  pkg.scripts?.["qa:ag74o:browser"] !==
  "bash scripts/run-ag74o-panchang-browser-qa.sh"
) fail("Browser QA script mismatch.");
if (
  pkg.scripts?.["validate:ag74o-r2"] !==
  "node scripts/validate-ag74o-r2-selector-calculation-correction.mjs"
) fail("R2 validation script mismatch.");

if (
  runtime.status !==
    "ag74o_r2_governed_selector_calculation_gate_active_runtime_approval_blocked" ||
  runtime.runtime?.automatic_calculation_on_boot !== false ||
  runtime.runtime?.approved_browser_projection_record_count !== 0 ||
  runtime.runtime?.public_runtime_activation_allowed_now !== false ||
  runtime.external_api_used !== false ||
  runtime.persistence_enabled !== false ||
  runtime.supabase_activation_performed !== false
) fail("R2 runtime boundary mismatch.");

if (
  projection.record_count !== 0 ||
  projection.default_ui_state?.automatic_result_allowed !== false
) fail("R2 approved projection boundary mismatch.");

pass("AG74O-R2 static runtime, approval gate, UI-only landing state, provenance and fallback prohibitions are valid.");
