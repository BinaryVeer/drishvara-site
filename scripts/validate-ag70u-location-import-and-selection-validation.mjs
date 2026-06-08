import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70U validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70u-location-import-and-selection-validation.mjs",
  "scripts/validate-ag70u-location-import-and-selection-validation.mjs",
  "data/knowledge-base/location-intelligence/production/ag70u-location-selection-validation-report.json",
  "data/knowledge-base/location-intelligence/production/ag70u-coordinate-first-validation-report.json",
  "data/knowledge-base/location-intelligence/production/ag70u-display-label-validation-report.json",
  "data/knowledge-base/location-intelligence/production/ag70u-usage-map-compatibility-validation-report.json",
  "data/knowledge-base/location-intelligence/production/ag70u-import-readiness-validation-report.json",
  "data/knowledge-base/location-intelligence/production/ag70u-itanagar-normalisation-validation-report.json",
  "data/knowledge-base/location-intelligence/production/ag70u-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag70u-location-import-and-selection-validation.json",
  "data/content-intelligence/quality-registry/ag70u-ag70v-india-administrative-location-import-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70u-to-ag70v-india-administrative-location-import-bank-boundary.json",
  "data/quality/ag70u-location-import-and-selection-validation.json",
  "data/quality/ag70u-location-import-and-selection-validation-preview.json",
  "docs/quality/AG70U_LOCATION_IMPORT_AND_SELECTION_VALIDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70u"]) fail("Missing generate:ag70u script.");
if (!pkg.scripts?.["validate:ag70u"]) fail("Missing validate:ag70u script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70u")) fail("validate:project must include validate:ag70u.");

const selection = readJson("data/knowledge-base/location-intelligence/production/ag70u-location-selection-validation-report.json");
if (selection.status !== "location_selection_validation_report_created") fail("Selection validation status mismatch.");
if (selection.named_selection_check_count < 5) fail("Named selection checks should be at least 5.");
if (selection.named_selection_all_passed !== true) fail("Named selection checks must pass.");
if (selection.computation_enabled_records_now !== 0) fail("Computation enabled records must be zero.");
if (selection.full_dropdown_population_performed_now !== false) fail("Full dropdown population must be false.");

const coordinate = readJson("data/knowledge-base/location-intelligence/production/ag70u-coordinate-first-validation-report.json");
if (coordinate.status !== "coordinate_first_validation_report_created") fail("Coordinate validation status mismatch.");
if (coordinate.coordinate_first_supported !== true) fail("Coordinate-first must be supported.");
if (coordinate.coordinate_first_place_name_required !== false) fail("Place name must not be required.");
if (coordinate.minimum_contract_check.passed !== true) fail("Minimum coordinate contract must pass.");
if (coordinate.timezone_guard_check.passed !== true) fail("Timezone guard must pass.");
if (coordinate.public_output_allowed_now !== false) fail("Coordinate public output must be false.");

const display = readJson("data/knowledge-base/location-intelligence/production/ag70u-display-label-validation-report.json");
if (display.status !== "display_label_validation_report_created") fail("Display validation status mismatch.");
if (display.display_all_passed !== true) fail("Display checks must pass.");

const usage = readJson("data/knowledge-base/location-intelligence/production/ag70u-usage-map-compatibility-validation-report.json");
if (usage.status !== "location_usage_map_compatibility_validation_report_created") fail("Usage validation status mismatch.");
if (usage.usage_all_passed !== true) fail("Usage checks must pass.");
if (usage.duplicate_location_logic_outside_registry_allowed !== false) fail("Duplicate location logic must be false.");

const imports = readJson("data/knowledge-base/location-intelligence/production/ag70u-import-readiness-validation-report.json");
if (imports.status !== "location_import_readiness_validation_report_created") fail("Import readiness status mismatch.");
if (imports.import_contracts_all_ready !== true) fail("Import contracts must be ready.");
if (imports.ag70v_ready_for_india_district_block_import !== true) fail("AG70V readiness must be true.");
if (imports.no_full_population_performed_now !== true) fail("Full population must not be performed in AG70U.");

const norm = readJson("data/knowledge-base/location-intelligence/production/ag70u-itanagar-normalisation-validation-report.json");
if (norm.status !== "itanagar_normalisation_validation_report_created") fail("Itanagar normalisation validation status mismatch.");
if (norm.normalisation_record_found !== true) fail("Itanagar normalisation record must be found.");
if (norm.future_records_should_use_normalised_id !== true) fail("Future records must use normalised ID.");
if (norm.historical_records_mutated_now !== false) fail("Historical mutation must be false.");
if (norm.panchang_values_recomputed_now !== false) fail("Panchang recomputation must be false.");
if (norm.display_short_label_expected !== "Itanagar") fail("Itanagar display short label mismatch.");

const noPublic = readJson("data/knowledge-base/location-intelligence/production/ag70u-no-public-output-audit.json");
if (noPublic.status !== "no_public_output_audit_passed") fail("No-public audit status mismatch.");
for (const key of [
  "public_panchang_output_allowed_now",
  "public_observance_output_allowed_now",
  "public_eclipse_output_allowed_now",
  "public_word_output_allowed_now",
  "public_star_reflection_output_allowed_now",
  "dropdown_public_activation_performed",
  "panchang_recomputation_performed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (noPublic[key] !== false) fail(`${key} must be false.`);
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_location_import_selection_validation",
  "production_bank_manifest_created_india_administrative_location_import_bank",
  "production_bank_manifest_created_india_cities_capitals_coordinate_bank",
  "production_bank_manifest_created_global_capitals_major_cities_coordinate_bank",
  "production_bank_manifest_created_location_selection_resolver_test"
];
if (!allowedPanchangManifestStatuses.includes(manifest.status)) fail("Panchang manifest status mismatch.");
if (manifest.current_counts.location_selection_validation_records < 5) fail("Location selection validation count mismatch.");
if (manifest.current_counts.coordinate_first_validation_records !== 2) fail("Coordinate validation count mismatch.");
if (manifest.current_counts.full_location_import_records_added_now !== 0) fail("Full import records added now must be zero.");
if (manifest.current_counts.public_panchang_outputs !== 0) fail("Public Panchang outputs must be zero.");
if (manifest.current_counts.word_output_records !== 0) fail("Word output records must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70u-location-import-and-selection-validation.json");
if (review.status !== "ag70u_location_import_and_selection_validation_completed") fail("Review status mismatch.");
for (const key of [
  "named_location_selection_validated",
  "coordinate_first_input_validated",
  "display_label_policy_validated",
  "usage_map_validated",
  "import_contract_readiness_validated",
  "itanagar_normalisation_validated",
  "ready_for_ag70v"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "full_location_import_performed_now",
  "panchang_recomputation_performed_now",
  "dropdown_public_activation_performed",
  "public_output_allowed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag70u-ag70v-india-administrative-location-import-bank-readiness-record.json");
if (readiness.ready_for_ag70v !== true) fail("AG70V readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70u-to-ag70v-india-administrative-location-import-bank-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70V boundary must not auto-start.");
for (const blocker of [
  "public Panchang output",
  "public Star Reflection output",
  "generated/word-of-day.json replacement",
  "homepage UI change",
  "runtime Word selector activation",
  "external Panchang site as source of truth",
  "external Panchang site as data-generation input",
  "external Panchang site as runtime dependency",
  "external Panchang site as production validation source"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) fail(`Boundary blocker missing: ${blocker}`);
}

pass("AG70U location import and selection validation is valid.");
pass("Named-location, coordinate-first, display, usage-map and import-readiness checks passed.");
pass("No full import, recomputation, public output, UI/backend/Supabase activation performed.");
