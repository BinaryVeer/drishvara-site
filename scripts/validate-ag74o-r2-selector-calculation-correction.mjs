import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const full = (relativePath) => path.join(root, relativePath);
const read = (relativePath) => fs.readFileSync(full(relativePath), "utf8");
const json = (relativePath) => JSON.parse(read(relativePath));
const exists = (relativePath) => fs.existsSync(full(relativePath));

function fail(message) {
  console.error(`❌ AG74O-R2 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "package.json",
  "index.html",
  "assets/js/ag74o-panchang-public-controller.js",
  "scripts/validate-ag74o-panchang-public-ui-static.mjs",
  "scripts/ag74o-panchang-browser-qa.html",
  "scripts/run-ag74o-panchang-browser-qa.sh",
  "data/knowledge-base/panchang-festival/production/ag74o-panchang-public-runtime-contract.json",
  "scripts/generate-ag74o-r2-selector-calculation-correction.mjs",
  "scripts/validate-ag74o-r2-selector-calculation-correction.mjs",
  "data/knowledge-base/location-intelligence/production/ag74o-r2-browser-approved-location-projection.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r2-selector-query-resolution-contract.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r2-calculation-approval-resolver-contract.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r2-location-provenance-display-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74o-r2-result-state-contract.json",
  "data/content-intelligence/quality-reviews/ag74o-r2-selector-calculation-correction.json",
  "data/content-intelligence/quality-registry/ag74o-r2-ag74o-r3-calendar-activation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag74o-r2-to-ag74o-r3-calendar-activation-boundary.json",
  "data/quality/ag74o-r2-selector-calculation-correction.json",
  "docs/quality/AG74O_R2_SELECTOR_CALCULATION_CORRECTION.md",
];
for (const relativePath of required) {
  if (!exists(relativePath)) fail(`Missing required file: ${relativePath}`);
}

const pkg = json("package.json");
if (
  pkg.scripts?.["generate:ag74o-r2"] !==
  "node scripts/generate-ag74o-r2-selector-calculation-correction.mjs"
) fail("generate:ag74o-r2 package script mismatch.");
if (
  pkg.scripts?.["validate:ag74o-r2"] !==
  "node scripts/validate-ag74o-r2-selector-calculation-correction.mjs"
) fail("validate:ag74o-r2 package script mismatch.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag74o-r2")) {
  fail("validate:project must include validate:ag74o-r2.");
}

const index = read("index.html");
const controller = read("assets/js/ag74o-panchang-public-controller.js");
const staticValidator = read("scripts/validate-ag74o-panchang-public-ui-static.mjs");
const browserQa = read("scripts/ag74o-panchang-browser-qa.html");
const browserRunner = read("scripts/run-ag74o-panchang-browser-qa.sh");
const runtime = json(
  "data/knowledge-base/panchang-festival/production/ag74o-panchang-public-runtime-contract.json"
);
const projection = json(required[9]);
const selector = json(required[10]);
const calculation = json(required[11]);
const provenance = json(required[12]);
const resultStates = json(required[13]);
const review = json(required[14]);
const readiness = json(required[15]);
const boundary = json(required[16]);
const quality = json(required[17]);

if (
  projection.record_count !== 0 ||
  projection.search_label_count !== 0 ||
  projection.records.length !== 0 ||
  projection.search_labels.length !== 0
) fail("Browser-approved projection must remain empty at the zero-approval baseline.");

if (
  projection.default_ui_state.selector_value !==
    "varanasi-uttar-pradesh-india" ||
  projection.default_ui_state.public_selection_approved !== false ||
  projection.default_ui_state.computation_approved !== false ||
  projection.default_ui_state.automatic_result_allowed !== false
) fail("Varanasi default UI-state boundary mismatch.");

for (const value of Object.values(projection.approval_counts)) {
  if (value !== 0) fail("Projection contains a non-zero approval count.");
}

if (
  selector.exact_resolution_outcomes?.exact_candidate_or_unapproved_ui_state !==
    "calculation_pending" ||
  selector.exact_resolution_outcomes?.unknown_named_place_or_alias !==
    "governed_unavailable" ||
  selector.governance?.fallback_to_default_place_allowed !== false ||
  selector.governance?.fallback_to_default_timezone_allowed !== false
) fail("Selector-resolution contract mismatch.");

if (
  calculation.current_computation_approved_record_count !== 0 ||
  calculation.compute_day_may_run_before_gate !== false ||
  calculation.public_unapproved_calculation_allowed !== false ||
  calculation.automatic_calculation_on_page_boot_allowed !== false
) fail("Calculation-gate contract mismatch.");

const expectedStates = [
  "ui_state_only",
  "loading",
  "governed_unavailable",
  "calculation_pending",
  "calculated",
  "invalid_input",
];
for (const state of expectedStates) {
  if (!resultStates.states?.[state]) fail(`Missing result state: ${state}`);
}
if (
  resultStates.default_state !== "ui_state_only" ||
  resultStates.default_varanasi_today_calculation_allowed !== false ||
  resultStates.unapproved_coordinate_calculation_allowed !== false
) fail("Result-state boundary mismatch.");

for (const marker of [
  'data-ag74o-r2-approved-option-count="0"',
  'data-ag74o-r2-ui-state-only="true"',
  'id="panchang-location-provenance"',
  'id="panchang-coordinate-provenance"',
  'id="panchang-timezone-provenance"',
  'id="panchang-approval-provenance"',
  "AG74O_R2_SELECTOR_CALCULATION_STYLE_START",
]) {
  if (!index.includes(marker)) fail(`Index R2 marker missing: ${marker}`);
}
const selectorTag =
  index.match(/<select\b[^>]*id=["']panchang-place-select["'][^>]*>/i)?.[0] || "";
if (!selectorTag) fail("Panchang place selector is missing.");
if (/\sdisabled(?:\s|=|>)/i.test(selectorTag)) {
  fail("Panchang place/search control must remain active; zero approved records must not disable the query control.");
}
if (
  !selectorTag.includes('data-ag74o-r2-approved-option-count="0"') ||
  !selectorTag.includes('data-ag74o-r2-ui-state-only="true"')
) fail("Active selector zero-approval/UI-state markers are missing.");
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
if ((index.match(/id=["']panchang-place-select["']/g) || []).length !== 1) {
  fail("Panchang place selector must occur exactly once.");
}

for (const marker of [
  "APPROVED_LOCATION_PATH",
  "hardenUiStateSelector",
  "installSelectorHardening",
  "MutationObserver",
  "resolveApprovedGovernedRecord",
  "requestFromApprovedRecord",
  "computeDay(approvedRequest)",
  '"calculation_pending"',
  '"ui_state_only"',
  "No alternate date, place or timezone has been substituted.",
  "panchang-location-provenance",
]) {
  if (!controller.includes(marker)) fail(`Controller R2 marker missing: ${marker}`);
}
for (const forbidden of [
  "var LOCATION_MAP = {",
  "var ALIASES = {",
  'LOCATION_MAP[value]||LOCATION_MAP["varanasi-uttar-pradesh-india"]',
  'request.timezone&&validTimezone(request.timezone)?request.timezone:"Asia/Kolkata"',
  'choosePlace("varanasi-uttar-pradesh-india");syncDate(todayInTimezone("Asia/Kolkata"));setBookPage(1);applySelection();',
]) {
  if (controller.includes(forbidden)) fail(`Forbidden legacy controller marker: ${forbidden}`);
}
const boot = controller.match(/function boot\(\) \{([\s\S]*?)\n  \}/)?.[1] || "";
if (!boot || boot.includes("applySelection(")) {
  fail("Boot must establish UI state without invoking public calculation.");
}

if (
  runtime.status !==
    "ag74o_r2_governed_selector_calculation_gate_active_runtime_approval_blocked" ||
  runtime.runtime?.automatic_calculation_on_boot !== false ||
  runtime.runtime?.approved_browser_projection_record_count !== 0 ||
  runtime.runtime?.public_runtime_activation_allowed_now !== false ||
  runtime.date_location?.nearest_substitution !== false ||
  runtime.date_location?.timezone_substitution !== false
) fail("Public runtime contract mismatch.");

if (
  !staticValidator.includes("AG74O-R2") ||
  !browserQa.includes("default_ui_state_only") ||
  !browserQa.includes("coordinate_calculation_pending") ||
  !browserRunner.includes("AG74O_BROWSER_QA_OUTPUT")
) fail("R2 static/browser QA wiring mismatch.");

if (
  provenance.required_dom_ids?.length !== 4 ||
  provenance.candidate_value_may_be_described_as_approved !== false
) fail("Provenance-display contract mismatch.");

if (
  review.status !== "ag74o_r2_selector_calculation_correction_completed" ||
  review.issue_count !== 0 ||
  review.summary?.critical_findings_corrected !== 4 ||
  review.summary?.major_findings_corrected !== 4 ||
  review.summary?.public_location_selector_activated !== false ||
  review.summary?.panchang_computation_activated !== false
) fail("R2 quality review mismatch.");

if (
  readiness.ready_for_ag74o_r3_planning !== true ||
  readiness.ready_for_public_runtime_activation !== false ||
  readiness.browser_approved_location_records !== 0 ||
  readiness.public_selection_approved_records !== 0 ||
  readiness.computation_approved_records !== 0 ||
  readiness.next_stage_not_auto_started !== true
) fail("R3 readiness boundary mismatch.");

if (
  boundary.next_stage !== "AG74O-R3" ||
  boundary.next_stage_not_auto_started !== true
) fail("R2-to-R3 boundary mismatch.");

if (
  quality.status !== "pass" ||
  quality.issue_count !== 0 ||
  !Object.values(quality.checks).every(Boolean)
) fail("R2 quality record mismatch.");

pass("AG74O-R2 selector and calculation correction is valid.");
pass("Varanasi/today remains UI state only; automatic calculation is removed.");
pass("The browser-approved projection contains zero records at the governed baseline.");
pass("Unknown named places are unavailable and valid unapproved coordinates remain calculation-pending.");
pass("Public selection and Panchang computation approvals remain zero.");
pass("AG74O-R3 is ready for planning but public runtime activation remains blocked.");
