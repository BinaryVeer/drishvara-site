import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71A validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag71a-verified-four-location-pilot-activation.mjs",
  "scripts/validate-ag71a-verified-four-location-pilot-activation.mjs",
  "data/knowledge-base/location-intelligence/production/ag71a-verified-four-location-pilot-activation.json",
  "data/knowledge-base/location-intelligence/production/ag71a-pilot-approved-location-records.json",
  "data/knowledge-base/location-intelligence/production/ag71a-pilot-coordinate-timezone-basis.json",
  "data/knowledge-base/location-intelligence/production/ag71a-pilot-source-review-record.json",
  "data/knowledge-base/location-intelligence/production/ag71a-pilot-dropdown-permission-record.json",
  "data/knowledge-base/location-intelligence/production/ag71a-pilot-runtime-permission-record.json",
  "data/knowledge-base/location-intelligence/production/ag71a-coordinate-first-pilot-input-record.json",
  "data/knowledge-base/location-intelligence/production/ag71a-pilot-scope-safety-audit.json",
  "data/knowledge-base/location-intelligence/production/ag71a-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag71a-verified-four-location-pilot-activation.json",
  "data/content-intelligence/quality-registry/ag71a-ag71b-pilot-runtime-validation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag71a-to-ag71b-pilot-runtime-validation-boundary.json",
  "data/quality/ag71a-verified-four-location-pilot-activation.json",
  "data/quality/ag71a-verified-four-location-pilot-activation-preview.json",
  "docs/quality/AG71A_VERIFIED_FOUR_LOCATION_PILOT_ACTIVATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag71a"]) fail("Missing generate:ag71a script.");
if (!pkg.scripts?.["validate:ag71a"]) fail("Missing validate:ag71a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag71a")) fail("validate:project must include validate:ag71a.");

const activation = readJson("data/knowledge-base/location-intelligence/production/ag71a-verified-four-location-pilot-activation.json");
if (activation.status !== "verified_four_location_pilot_activation_created_limited_scope") fail("Activation status mismatch.");
if (activation.activation_scope !== "four_location_pilot_only") fail("Activation scope must be pilot only.");
if (activation.full_bank_activation_performed !== false) fail("Full bank activation must be false.");
if (activation.public_dropdown_ui_activation_performed !== false) fail("Public dropdown UI activation must be false.");
if (activation.panchang_runtime_computation_performed_now !== false) fail("Panchang runtime computation must be false.");
if (activation.star_reflection_runtime_computation_performed_now !== false) fail("Star Reflection runtime computation must be false.");
if (activation.pilot_record_count !== 4) fail("Pilot record count must be 4.");
if (activation.pilot_computation_allowed_record_count !== 4) fail("Pilot computation allowed count must be 4.");
if (activation.pilot_dropdown_allowed_record_count !== 4) fail("Pilot dropdown allowed count must be 4.");

const approved = readJson("data/knowledge-base/location-intelligence/production/ag71a-pilot-approved-location-records.json");
if (approved.status !== "pilot_approved_location_records_created") fail("Approved record status mismatch.");
if (approved.record_count !== 4) fail("Approved record count must be 4.");
for (const label of ["Itanagar-Arunachal Pradesh-India", "New Delhi-Delhi-India", "Ranchi-Jharkhand-India", "Tokyo-Japan"]) {
  if (!approved.records.some((x) => x.display_label === label)) fail(`Pilot approved location missing: ${label}`);
}
for (const record of approved.records) {
  if (record.pilot_computation_allowed !== true) fail(`Pilot computation must be true: ${record.display_label}`);
  if (record.pilot_dropdown_allowed !== true) fail(`Pilot dropdown must be true: ${record.display_label}`);
  if (record.full_bank_computation_allowed !== false) fail(`Full bank computation must be false: ${record.display_label}`);
  if (record.full_public_dropdown_allowed !== false) fail(`Full public dropdown must be false: ${record.display_label}`);
  if (record.public_ui_change_performed_now !== false) fail(`UI change must be false: ${record.display_label}`);
}

const basis = readJson("data/knowledge-base/location-intelligence/production/ag71a-pilot-coordinate-timezone-basis.json");
if (basis.status !== "pilot_coordinate_timezone_basis_created") fail("Coordinate basis status mismatch.");
if (basis.record_count !== 4) fail("Coordinate basis count must be 4.");
if (basis.all_records_have_lat_long_timezone !== true) fail("All pilot records must have lat/long/timezone.");

const sourceReview = readJson("data/knowledge-base/location-intelligence/production/ag71a-pilot-source-review-record.json");
if (sourceReview.status !== "pilot_source_review_record_created_limited_scope") fail("Source review status mismatch.");
if (sourceReview.full_official_source_verification_completed_for_all_location_banks !== false) fail("Full official source verification must be false.");
if (sourceReview.record_count !== 4) fail("Source review count must be 4.");

const dropdown = readJson("data/knowledge-base/location-intelligence/production/ag71a-pilot-dropdown-permission-record.json");
if (dropdown.status !== "pilot_dropdown_permission_record_created") fail("Dropdown permission status mismatch.");
if (dropdown.permission_scope !== "pilot_data_flag_only_no_ui_change") fail("Dropdown permission scope mismatch.");
if (dropdown.pilot_dropdown_allowed_record_count !== 4) fail("Pilot dropdown count must be 4.");
if (dropdown.public_dropdown_ui_activation_performed_now !== false) fail("Public dropdown UI activation must be false.");
if (dropdown.full_dropdown_activation_allowed_now !== false) fail("Full dropdown activation must be false.");
if (!dropdown.dropdown_mode_required.includes("enter_coordinates")) fail("Coordinate entry mode must be required.");

const runtime = readJson("data/knowledge-base/location-intelligence/production/ag71a-pilot-runtime-permission-record.json");
if (runtime.status !== "pilot_runtime_permission_record_created") fail("Runtime permission status mismatch.");
if (runtime.permission_scope !== "pilot_validation_only_no_runtime_execution_now") fail("Runtime permission scope mismatch.");
if (runtime.panchang_pilot_runtime_permission_prepared !== true) fail("Panchang pilot runtime permission must be prepared.");
if (runtime.star_reflection_pilot_runtime_permission_prepared !== true) fail("Star Reflection pilot runtime permission must be prepared.");
if (runtime.panchang_runtime_computation_executed_now !== false) fail("Panchang runtime computation must not execute.");
if (runtime.star_reflection_runtime_computation_executed_now !== false) fail("Star Reflection runtime computation must not execute.");
if (runtime.unrestricted_runtime_allowed_now !== false) fail("Unrestricted runtime must be false.");

const coordinateFirst = readJson("data/knowledge-base/location-intelligence/production/ag71a-coordinate-first-pilot-input-record.json");
if (coordinateFirst.status !== "coordinate_first_pilot_input_record_created") fail("Coordinate-first pilot status mismatch.");
if (coordinateFirst.input_record_count < 2) fail("At least two coordinate-first pilot inputs expected.");
for (const record of coordinateFirst.records) {
  if (record.place_name_required !== false) fail(`Place name must be false: ${record.pilot_input_id}`);
  if (typeof record.latitude_decimal !== "number") fail(`Latitude must be numeric: ${record.pilot_input_id}`);
  if (typeof record.longitude_decimal !== "number") fail(`Longitude must be numeric: ${record.pilot_input_id}`);
  if (!record.timezone) fail(`Timezone missing: ${record.pilot_input_id}`);
  if (record.public_ui_change_performed_now !== false) fail(`Public UI change must be false: ${record.pilot_input_id}`);
}

const safety = readJson("data/knowledge-base/location-intelligence/production/ag71a-pilot-scope-safety-audit.json");
if (safety.status !== "pilot_scope_safety_audit_passed") fail("Safety audit status mismatch.");
if (safety.four_location_scope_only !== true) fail("Four-location scope must be true.");
if (safety.pilot_record_count !== 4) fail("Safety pilot count must be 4.");
for (const key of [
  "full_bank_activation_performed",
  "public_dropdown_ui_activation_performed_now",
  "unrestricted_panchang_runtime_allowed_now",
  "unrestricted_star_reflection_runtime_allowed_now",
  "candidate_coordinates_bulk_promoted_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (safety[key] !== false) fail(`${key} must be false.`);
}

const noPublic = readJson("data/knowledge-base/location-intelligence/production/ag71a-no-public-output-audit.json");
if (noPublic.status !== "no_public_output_audit_passed") fail("No-public audit status mismatch.");
for (const key of [
  "public_panchang_output_allowed_now",
  "public_star_reflection_output_allowed_now",
  "public_location_dropdown_activation_performed",
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
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_verified_four_location_pilot_activation",
  "production_bank_manifest_created_pilot_runtime_validation",
  "production_bank_manifest_created_pilot_ui_coordinate_input_surface"
];
if (!allowedPanchangManifestStatuses.includes(manifest.status)) fail("Panchang manifest status mismatch.");
if (manifest.current_counts.ag71a_pilot_approved_location_records !== 4) fail("Pilot approved count must be 4.");
if (manifest.current_counts.ag71a_pilot_computation_allowed_records !== 4) fail("Pilot computation allowed count must be 4.");
if (manifest.current_counts.ag71a_coordinate_first_pilot_input_records < 2) fail("Coordinate-first pilot input count mismatch.");
if (manifest.current_counts.ag71a_full_bank_activation_records !== 0) fail("Full bank activation records must be zero.");
if (manifest.current_counts.ag71a_public_dropdown_ui_activation_records !== 0) fail("Public dropdown UI activation records must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag71a-verified-four-location-pilot-activation.json");
if (review.status !== "ag71a_verified_four_location_pilot_activation_completed") fail("Review status mismatch.");
for (const key of [
  "verified_four_location_pilot_activation_created",
  "pilot_approved_location_records_created",
  "pilot_coordinate_timezone_basis_created",
  "pilot_source_review_record_created",
  "pilot_dropdown_permission_record_created",
  "pilot_runtime_permission_record_created",
  "coordinate_first_pilot_input_record_created",
  "pilot_scope_safety_audit_created",
  "ready_for_ag71b"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "full_bank_activation_performed",
  "public_dropdown_ui_activation_performed_now",
  "panchang_runtime_computation_executed_now",
  "star_reflection_runtime_computation_executed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag71a-ag71b-pilot-runtime-validation-readiness-record.json");
if (readiness.ready_for_ag71b !== true) fail("AG71B readiness must be true.");
if (readiness.pilot_locations.length !== 4) fail("AG71B pilot location count must be 4.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag71a-to-ag71b-pilot-runtime-validation-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG71B boundary must not auto-start.");
for (const blocker of [
  "full location-bank activation",
  "public full dropdown activation",
  "unrestricted Panchang runtime computation",
  "unrestricted Star Reflection runtime computation",
  "Supabase/database writes",
  "backend/Auth activation"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) fail(`Boundary blocker missing: ${blocker}`);
}

pass("AG71A verified 4-location pilot activation is valid.");
pass("Four pilot records and coordinate-first inputs are prepared for AG71B.");
pass("Full bank/public UI/runtime/backend/Supabase activation remain blocked.");
