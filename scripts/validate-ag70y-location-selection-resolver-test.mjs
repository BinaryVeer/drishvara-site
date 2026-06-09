import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70Y validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70y-location-selection-resolver-test.mjs",
  "scripts/validate-ag70y-location-selection-resolver-test.mjs",
  "data/knowledge-base/location-intelligence/production/ag70y-location-selection-resolver-test.json",
  "data/knowledge-base/location-intelligence/production/ag70y-named-location-resolver-test-report.json",
  "data/knowledge-base/location-intelligence/production/ag70y-coordinate-first-resolver-test-report.json",
  "data/knowledge-base/location-intelligence/production/ag70y-panchang-input-contract-mapping-test.json",
  "data/knowledge-base/location-intelligence/production/ag70y-star-reflection-input-contract-mapping-test.json",
  "data/knowledge-base/location-intelligence/production/ag70y-resolution-blocking-safety-audit.json",
  "data/knowledge-base/location-intelligence/production/ag70y-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag70y-location-selection-resolver-test.json",
  "data/content-intelligence/quality-registry/ag70y-ag70z-location-intelligence-foundation-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70y-to-ag70z-location-intelligence-foundation-closure-boundary.json",
  "data/quality/ag70y-location-selection-resolver-test.json",
  "data/quality/ag70y-location-selection-resolver-test-preview.json",
  "docs/quality/AG70Y_LOCATION_SELECTION_RESOLVER_TEST.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70y"]) fail("Missing generate:ag70y script.");
if (!pkg.scripts?.["validate:ag70y"]) fail("Missing validate:ag70y script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70y")) fail("validate:project must include validate:ag70y.");

const resolver = readJson("data/knowledge-base/location-intelligence/production/ag70y-location-selection-resolver-test.json");
if (resolver.status !== "location_selection_resolver_test_created_internal_only") fail("Resolver test status mismatch.");
if (resolver.public_output_allowed_now !== false) fail("Resolver public output must be false.");
if (!Array.isArray(resolver.named_location_tests) || resolver.named_location_tests.length < 5) fail("Named resolver tests missing.");
if (!Array.isArray(resolver.coordinate_first_tests) || resolver.coordinate_first_tests.length < 3) fail("Coordinate-first tests missing.");

const named = readJson("data/knowledge-base/location-intelligence/production/ag70y-named-location-resolver-test-report.json");
if (named.status !== "named_location_resolver_test_report_created") fail("Named resolver report status mismatch.");
if (named.test_count < 5) fail("Named test count should be at least 5.");
if (named.resolved_count < 5) fail("Named resolved count should be at least 5.");
if (named.computation_approved_count !== 0) fail("Named computation approved count must be zero.");
if (named.public_dropdown_activation_count !== 0) fail("Named public dropdown activation count must be zero.");
if (!named.results.some((x) => x.input_label === "Bhawanathpur-Garhwa-Jharkhand-India" && x.resolution_type === "identity_only_coordinate_pending")) fail("Bhawanathpur coordinate-pending identity test missing.");

const coord = readJson("data/knowledge-base/location-intelligence/production/ag70y-coordinate-first-resolver-test-report.json");
if (coord.status !== "coordinate_first_resolver_test_report_created") fail("Coordinate-first report status mismatch.");
if (coord.place_name_required !== false) fail("Place name must not be required.");
if (coord.valid_contract_count < 2) fail("At least two coordinate-first valid contracts expected.");
if (coord.invalid_contract_count < 1) fail("At least one invalid coordinate-first guard expected.");
if (coord.computation_executed_now !== false) fail("Coordinate-first computation must not execute.");
if (coord.public_output_allowed_now !== false) fail("Coordinate-first public output must be false.");

const panchang = readJson("data/knowledge-base/location-intelligence/production/ag70y-panchang-input-contract-mapping-test.json");
if (panchang.status !== "panchang_input_contract_mapping_test_created") fail("Panchang mapping status mismatch.");
if (panchang.mapping_count < 4) fail("Panchang mapping count should be at least 4.");
if (panchang.all_mappings_have_lat_long_timezone !== true) fail("All Panchang mappings must have lat/long/timezone.");
if (panchang.panchang_computation_executed_now !== false) fail("Panchang computation must not execute.");
if (panchang.public_output_allowed_now !== false) fail("Panchang public output must be false.");

const star = readJson("data/knowledge-base/location-intelligence/production/ag70y-star-reflection-input-contract-mapping-test.json");
if (star.status !== "star_reflection_input_contract_mapping_test_created") fail("Star Reflection mapping status mismatch.");
if (star.mapping_count < 2) fail("Star Reflection mapping count should be at least 2.");
if (star.star_reflection_computation_executed_now !== false) fail("Star Reflection computation must not execute.");
if (star.public_output_allowed_now !== false) fail("Star Reflection public output must be false.");

const safety = readJson("data/knowledge-base/location-intelligence/production/ag70y-resolution-blocking-safety-audit.json");
if (safety.status !== "resolution_blocking_safety_audit_passed") fail("Safety audit status mismatch.");
for (const key of [
  "computation_approval_granted_now",
  "public_dropdown_activation_granted_now",
  "candidate_coordinates_promoted_to_verified_now",
  "panchang_computation_executed_now",
  "star_reflection_computation_executed_now",
  "public_output_allowed_now"
]) {
  if (safety[key] !== false) fail(`${key} must be false.`);
}
if (safety.unresolved_or_coordinate_pending_records_block_computation !== true) fail("Coordinate-pending records must block computation.");

const noPublic = readJson("data/knowledge-base/location-intelligence/production/ag70y-no-public-output-audit.json");
if (noPublic.status !== "no_public_output_audit_passed") fail("No-public audit status mismatch.");
for (const key of [
  "public_panchang_output_allowed_now",
  "public_star_reflection_output_allowed_now",
  "public_location_dropdown_activation_performed",
  "panchang_recomputation_performed_now",
  "star_reflection_computation_performed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (noPublic[key] !== false) fail(`${key} must be false.`);
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_location_selection_resolver_test",
  "production_bank_manifest_created_location_intelligence_foundation_closure",
  "production_bank_manifest_created_verified_four_location_pilot_activation",
  "production_bank_manifest_created_pilot_runtime_validation"
];
if (!allowedPanchangManifestStatuses.includes(manifest.status)) fail("Panchang manifest status mismatch.");
if (manifest.current_counts.location_resolver_named_test_records < 5) fail("Manifest named test count mismatch.");
if (manifest.current_counts.location_resolver_coordinate_first_test_records < 3) fail("Manifest coordinate-first test count mismatch.");
if (manifest.current_counts.resolver_computation_executed_records !== 0) fail("Resolver computation executed count must be zero.");
if (manifest.current_counts.public_panchang_outputs !== 0) fail("Public Panchang outputs must be zero.");
if (manifest.current_counts.word_output_records !== 0) fail("Word outputs must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70y-location-selection-resolver-test.json");
if (review.status !== "ag70y_location_selection_resolver_test_completed") fail("Review status mismatch.");
for (const key of [
  "named_location_resolver_test_created",
  "coordinate_first_resolver_test_created",
  "panchang_input_contract_mapping_created",
  "star_reflection_input_contract_mapping_created",
  "safety_audit_created",
  "ready_for_ag70z"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "computation_approval_granted_now",
  "public_dropdown_activation_performed_now",
  "panchang_computation_executed_now",
  "star_reflection_computation_executed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag70y-ag70z-location-intelligence-foundation-closure-readiness-record.json");
if (readiness.ready_for_ag70z !== true) fail("AG70Z readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70y-to-ag70z-location-intelligence-foundation-closure-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70Z boundary must not auto-start.");

pass("AG70Y location selection resolver test is valid.");
pass("Named-location and coordinate-first resolver paths mapped internally.");
pass("Panchang/Star Reflection computation and public/UI/backend/Supabase activation remain blocked.");
