import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71B validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag71b-pilot-runtime-validation.mjs",
  "scripts/validate-ag71b-pilot-runtime-validation.mjs",
  "data/knowledge-base/location-intelligence/production/ag71b-pilot-runtime-validation.json",
  "data/knowledge-base/location-intelligence/production/ag71b-dropdown-resolver-runtime-validation.json",
  "data/knowledge-base/location-intelligence/production/ag71b-coordinate-first-runtime-validation.json",
  "data/knowledge-base/location-intelligence/production/ag71b-panchang-pilot-runtime-validation.json",
  "data/knowledge-base/location-intelligence/production/ag71b-star-reflection-pilot-runtime-validation.json",
  "data/knowledge-base/location-intelligence/production/ag71b-ui-coordinate-input-readiness-record.json",
  "data/knowledge-base/location-intelligence/production/ag71b-pilot-runtime-safety-audit.json",
  "data/knowledge-base/location-intelligence/production/ag71b-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag71b-pilot-runtime-validation.json",
  "data/content-intelligence/quality-registry/ag71b-ag71c-pilot-ui-coordinate-input-surface-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag71b-to-ag71c-pilot-ui-coordinate-input-surface-boundary.json",
  "data/quality/ag71b-pilot-runtime-validation.json",
  "data/quality/ag71b-pilot-runtime-validation-preview.json",
  "docs/quality/AG71B_PILOT_RUNTIME_VALIDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag71b"]) fail("Missing generate:ag71b script.");
if (!pkg.scripts?.["validate:ag71b"]) fail("Missing validate:ag71b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag71b")) fail("validate:project must include validate:ag71b.");

const validation = readJson("data/knowledge-base/location-intelligence/production/ag71b-pilot-runtime-validation.json");
if (validation.status !== "pilot_runtime_validation_completed_internal_only") fail("Pilot runtime validation status mismatch.");
if (validation.public_ui_change_performed_now !== false) fail("Public UI change must be false.");
if (validation.runtime_computation_executed_now !== false) fail("Runtime computation must be false.");

const dropdown = readJson("data/knowledge-base/location-intelligence/production/ag71b-dropdown-resolver-runtime-validation.json");
if (dropdown.status !== "dropdown_resolver_runtime_validation_passed_internal_only") fail("Dropdown resolver status mismatch.");
if (dropdown.record_count !== 4) fail("Dropdown resolver should validate 4 pilot records.");
if (dropdown.passed_count !== 4) fail("Dropdown resolver passed count must be 4.");
if (dropdown.public_dropdown_ui_exposed_now !== false) fail("Dropdown UI exposure must be false.");

const coord = readJson("data/knowledge-base/location-intelligence/production/ag71b-coordinate-first-runtime-validation.json");
if (coord.status !== "coordinate_first_runtime_validation_passed_internal_only") fail("Coordinate-first status mismatch.");
if (coord.record_count < 2) fail("At least 2 coordinate-first records expected.");
if (coord.passed_count < 2) fail("At least 2 coordinate-first records must pass.");
if (coord.place_name_required !== false) fail("Place name must not be required.");
if (coord.public_ui_exposed_now !== false) fail("Coordinate-first public UI exposure must be false.");

const panchang = readJson("data/knowledge-base/location-intelligence/production/ag71b-panchang-pilot-runtime-validation.json");
if (panchang.status !== "panchang_pilot_runtime_input_contract_validation_passed") fail("Panchang runtime status mismatch.");
if (panchang.pilot_record_count < 6) fail("Panchang validation should include dropdown + coordinate-first records.");
if (panchang.passed_count !== panchang.pilot_record_count) fail("All Panchang contract validations must pass.");
if (panchang.astronomical_computation_executed_now !== false) fail("Astronomical computation must be false.");
if (panchang.public_panchang_output_created_now !== false) fail("Public Panchang output must be false.");

const star = readJson("data/knowledge-base/location-intelligence/production/ag71b-star-reflection-pilot-runtime-validation.json");
if (star.status !== "star_reflection_pilot_runtime_input_contract_validation_passed") fail("Star Reflection runtime status mismatch.");
if (star.pilot_record_count < 6) fail("Star Reflection validation should include dropdown + coordinate-first records.");
if (star.passed_count !== star.pilot_record_count) fail("All Star Reflection contract validations must pass.");
if (star.star_reflection_computation_executed_now !== false) fail("Star Reflection computation must be false.");
if (star.public_star_reflection_output_created_now !== false) fail("Public Star output must be false.");

const ui = readJson("data/knowledge-base/location-intelligence/production/ag71b-ui-coordinate-input-readiness-record.json");
if (ui.status !== "ui_coordinate_input_readiness_record_created") fail("UI readiness status mismatch.");
if (ui.current_frontend_gap_confirmed !== true) fail("Frontend lat/long gap must be confirmed.");
if (ui.ready_for_ag71c_ui_surface !== true) fail("AG71C UI readiness must be true.");
if (ui.public_ui_change_performed_now !== false) fail("UI change must be false.");
if (!ui.panchang_required_modes.includes("enter_coordinates")) fail("Panchang enter-coordinates mode missing.");
if (!ui.star_reflection_required_modes.includes("enter_birth_coordinates")) fail("Star Reflection enter-birth-coordinates mode missing.");

const safety = readJson("data/knowledge-base/location-intelligence/production/ag71b-pilot-runtime-safety-audit.json");
if (safety.status !== "pilot_runtime_safety_audit_passed") fail("Safety audit status mismatch.");
for (const key of [
  "actual_astronomical_computation_executed_now",
  "actual_star_reflection_computation_executed_now",
  "public_ui_change_performed_now",
  "full_location_bank_activation_performed",
  "unrestricted_runtime_allowed_now",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (safety[key] !== false) fail(`${key} must be false.`);
}

const noPublic = readJson("data/knowledge-base/location-intelligence/production/ag71b-no-public-output-audit.json");
if (noPublic.status !== "no_public_output_audit_passed") fail("No-public audit status mismatch.");
for (const key of [
  "public_panchang_output_allowed_now",
  "public_star_reflection_output_allowed_now",
  "public_location_dropdown_activation_performed",
  "coordinate_input_ui_added_now",
  "panchang_computation_executed_now",
  "star_reflection_computation_executed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "backend_runtime_activated",
  "supabase_activation_performed",
  "full_scale_location_activation_performed"
]) {
  if (noPublic[key] !== false) fail(`${key} must be false.`);
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
if (manifest.status !== "production_bank_manifest_created_pilot_runtime_validation") fail("Panchang manifest status mismatch.");
if (manifest.current_counts.ag71b_dropdown_resolver_test_records !== 4) fail("Dropdown resolver count must be 4.");
if (manifest.current_counts.ag71b_coordinate_first_test_records < 2) fail("Coordinate-first count mismatch.");
if (manifest.current_counts.ag71b_public_ui_change_records !== 0) fail("Public UI change records must be zero.");
if (manifest.current_counts.ag71b_runtime_computation_execution_records !== 0) fail("Runtime computation execution count must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag71b-pilot-runtime-validation.json");
if (review.status !== "ag71b_pilot_runtime_validation_completed") fail("Review status mismatch.");
for (const key of [
  "dropdown_resolver_validated",
  "coordinate_first_resolver_validated",
  "panchang_input_contract_validated",
  "star_reflection_input_contract_validated",
  "ui_coordinate_input_gap_confirmed",
  "ui_coordinate_input_next_stage_required",
  "ready_for_ag71c"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "public_ui_change_performed_now",
  "panchang_runtime_computation_executed_now",
  "star_reflection_runtime_computation_executed_now",
  "generated_word_json_modified",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag71b-ag71c-pilot-ui-coordinate-input-surface-readiness-record.json");
if (readiness.ready_for_ag71c !== true) fail("AG71C readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag71b-to-ag71c-pilot-ui-coordinate-input-surface-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG71C boundary must not auto-start.");
if (!boundary.allowed_next_scope_after_user_confirmation.some((x) => x.includes("latitude"))) fail("AG71C boundary must include latitude UI scope.");
if (!boundary.allowed_next_scope_after_user_confirmation.some((x) => x.includes("longitude"))) fail("AG71C boundary must include longitude UI scope.");

pass("AG71B pilot runtime validation is valid.");
pass("Frontend lat/long input gap is confirmed and queued for AG71C.");
pass("No public UI/runtime/backend/Supabase activation performed.");
