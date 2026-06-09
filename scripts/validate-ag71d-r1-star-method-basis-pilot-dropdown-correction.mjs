import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71D-R1 validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "package.json",
  "scripts/generate-ag71d-r1-star-method-basis-pilot-dropdown-correction.mjs",
  "scripts/validate-ag71d-r1-star-method-basis-pilot-dropdown-correction.mjs",
  "data/methodology/star-reflection/ag71d-r1-star-reflection-method-audit.json",
  "data/methodology/star-reflection/ag71d-r1-star-reflection-method-basis-clarification.json",
  "data/knowledge-base/location-intelligence/production/ag71d-r1-pilot-dropdown-option-correction-record.json",
  "data/knowledge-base/location-intelligence/production/ag71d-r1-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag71d-r1-star-method-basis-pilot-dropdown-correction.json",
  "data/content-intelligence/quality-registry/ag71d-r1-ag71e-pilot-runtime-output-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag71d-r1-to-ag71e-pilot-runtime-output-test-boundary.json",
  "data/quality/ag71d-r1-star-method-basis-pilot-dropdown-correction.json",
  "data/quality/ag71d-r1-star-method-basis-pilot-dropdown-correction-preview.json",
  "docs/quality/AG71D_R1_STAR_METHOD_BASIS_PILOT_DROPDOWN_CORRECTION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag71d-r1"]) fail("Missing generate:ag71d-r1 script.");
if (!pkg.scripts?.["validate:ag71d-r1"]) fail("Missing validate:ag71d-r1 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag71d-r1")) fail("validate:project must include validate:ag71d-r1.");

const html = fs.readFileSync(full("index.html"), "utf8");

for (const marker of [
  "AG71D_R1_PILOT_DROPDOWN_RUNTIME_FIX_START",
  "window.drishvaraAg71dR1ApplyPilotDropdowns",
  'id="star-birth-place-select"',
  'id="panchang-place-select"',
  'data-ag71d-location-select="star-reflection"',
  'data-ag71d-location-select="panchang"',
  "Itanagar",
  "New Delhi",
  "Ranchi",
  "Tokyo"
]) {
  if (!html.includes(marker)) fail(`index.html missing required marker: ${marker}`);
}

function extractSelect(id) {
  const re = new RegExp(`<select\\b(?=[^>]*id="${id}")[\\s\\S]*?<\\/select>`, "i");
  const match = html.match(re);
  if (!match) fail(`Missing select id="${id}"`);
  return match[0];
}

const starSelect = extractSelect("star-birth-place-select");
const panchangSelect = extractSelect("panchang-place-select");

for (const label of ["Itanagar", "New Delhi", "Ranchi", "Tokyo"]) {
  if (!starSelect.includes(`>${label}</option>`)) fail(`Star Birth Place dropdown missing ${label}`);
  if (!panchangSelect.includes(`>${label}</option>`)) fail(`Panchang Location dropdown missing ${label}`);
}

if (/Reflection Method Under Review/i.test(starSelect)) {
  fail("Star Birth Place dropdown must not contain Reflection Method Under Review.");
}
if (!panchangSelect.includes('id="panchang-place-select"')) {
  fail("Panchang select must preserve AG64B canonical id panchang-place-select.");
}

const methodAudit = readJson("data/methodology/star-reflection/ag71d-r1-star-reflection-method-audit.json");
if (methodAudit.status !== "single_active_method_confirmed") fail("Method audit must confirm single active method.");
if (methodAudit.unique_method_versions_found.length !== 1 || methodAudit.unique_method_versions_found[0] !== "star_reflection_method_v1") {
  fail("Only star_reflection_method_v1 should be found.");
}

const methodBasis = readJson("data/methodology/star-reflection/ag71d-r1-star-reflection-method-basis-clarification.json");
if (methodBasis.status !== "moon_led_panchanga_supported_basis_recorded") fail("Method basis status mismatch.");
if (!methodBasis.clarification.includes("not a star-only calculation")) fail("Method basis must clarify not star-only.");
if (!methodBasis.calculation_basis.panchanga_elements.includes("Nakshatra")) fail("Panchanga elements must include Nakshatra.");
if (!methodBasis.calculation_basis.panchanga_elements.includes("Tithi")) fail("Panchanga elements must include Tithi.");

const dropdown = readJson("data/knowledge-base/location-intelligence/production/ag71d-r1-pilot-dropdown-option-correction-record.json");
if (dropdown.status !== "pilot_dropdown_options_corrected") fail("Dropdown correction status mismatch.");
if (dropdown.star_birth_place_select_id !== "star-birth-place-select") fail("Star select id mismatch.");
if (dropdown.panchang_location_select_id !== "panchang-place-select") fail("Panchang select id mismatch.");
if (dropdown.pilot_locations.length !== 4) fail("Pilot location count must be 4.");
if (dropdown.public_runtime_activation_performed !== false) fail("Public runtime activation must be false.");

const noPublic = readJson("data/knowledge-base/location-intelligence/production/ag71d-r1-no-public-output-audit.json");
for (const key of [
  "public_panchang_output_allowed_now",
  "public_star_reflection_output_allowed_now",
  "full_location_bank_activation_performed",
  "runtime_panchang_computation_performed",
  "runtime_star_reflection_computation_performed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (noPublic[key] !== false) fail(`${key} must be false.`);
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
if (manifest.current_counts.ag71d_r1_star_method_audit_records !== 1) fail("Method audit count must be 1.");
if (manifest.current_counts.ag71d_r1_method_basis_clarification_records !== 1) fail("Method basis count must be 1.");
if (manifest.current_counts.ag71d_r1_pilot_dropdown_correction_records !== 1) fail("Pilot dropdown correction count must be 1.");
if (manifest.current_counts.ag71d_r1_pilot_dropdown_location_count !== 4) fail("Pilot dropdown location count must be 4.");
if (manifest.current_counts.ag71d_r1_public_runtime_output_records !== 0) fail("Public runtime output count must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag71d-r1-star-method-basis-pilot-dropdown-correction.json");
if (review.status !== "ag71d_r1_completed") fail("Review status mismatch.");
for (const key of [
  "single_active_star_reflection_method_confirmed",
  "star_reflection_basis_clarified_as_moon_led_panchanga_supported",
  "star_birth_place_dropdown_corrected",
  "panchang_location_dropdown_corrected",
  "panchang_ag64b_canonical_id_preserved",
  "reflection_method_dropdown_deferred",
  "ready_for_ag71e"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "public_runtime_activation_performed",
  "runtime_panchang_computation_performed",
  "runtime_star_reflection_computation_performed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag71d-r1-ag71e-pilot-runtime-output-test-readiness-record.json");
if (readiness.ready_for_ag71e !== true) fail("AG71E readiness must be true.");

pass("AG71D-R1 Star Reflection method basis and pilot dropdown correction is valid.");
pass("Single active Star Reflection method confirmed.");
pass("Moon-led Panchanga-supported basis recorded.");
pass("Pilot dropdowns corrected without public/runtime/backend/Supabase activation.");
