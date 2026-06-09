import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70T validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70t-location-intelligence-registry-and-panchang-basis-normalisation.mjs",
  "scripts/validate-ag70t-location-intelligence-registry-and-panchang-basis-normalisation.mjs",
  "data/knowledge-base/location-intelligence/production/location-selection-registry.json",
  "data/knowledge-base/location-intelligence/production/location-coordinate-input-contract.json",
  "data/knowledge-base/location-intelligence/production/location-display-label-policy.json",
  "data/knowledge-base/location-intelligence/production/location-hierarchy-policy.json",
  "data/knowledge-base/location-intelligence/production/location-timezone-basis-policy.json",
  "data/knowledge-base/location-intelligence/production/location-usage-map.json",
  "data/knowledge-base/location-intelligence/production/india-state-ut-capitals-seed.json",
  "data/knowledge-base/location-intelligence/production/india-district-block-registry.json",
  "data/knowledge-base/location-intelligence/production/india-major-cities-seed.json",
  "data/knowledge-base/location-intelligence/production/world-national-capitals-seed.json",
  "data/knowledge-base/location-intelligence/production/world-major-cities-seed.json",
  "data/knowledge-base/location-intelligence/production/location-official-import-contracts.json",
  "data/knowledge-base/location-intelligence/production/location-id-normalisation-map.json",
  "data/knowledge-base/location-intelligence/production/ag70t-itanagar-normalisation-record.json",
  "data/knowledge-base/location-intelligence/production/ag70t-panchang-basis-normalisation-audit.json",
  "data/knowledge-base/location-intelligence/production/ag70t-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag70t-location-intelligence-registry-and-panchang-basis-normalisation.json",
  "data/content-intelligence/quality-registry/ag70t-ag70u-location-import-and-selection-validation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70t-to-ag70u-location-import-and-selection-validation-boundary.json",
  "data/quality/ag70t-location-intelligence-registry-and-panchang-basis-normalisation.json",
  "data/quality/ag70t-location-intelligence-registry-and-panchang-basis-normalisation-preview.json",
  "docs/quality/AG70T_LOCATION_INTELLIGENCE_REGISTRY_AND_PANCHANG_BASIS_NORMALISATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70t"]) fail("Missing generate:ag70t script.");
if (!pkg.scripts?.["validate:ag70t"]) fail("Missing validate:ag70t script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70t")) fail("validate:project must include validate:ag70t.");

const registry = readJson("data/knowledge-base/location-intelligence/production/location-selection-registry.json");
if (registry.status !== "location_intelligence_registry_created_public_blocked") fail("Registry status mismatch.");
if (!registry.supported_location_modes.includes("named_location_selection")) fail("Named-location mode missing.");
if (!registry.supported_location_modes.includes("coordinate_first_input")) fail("Coordinate-first mode missing.");
for (const t of ["state_ut_capital", "major_indian_city", "district", "block", "national_capital", "major_world_city", "coordinate_first_custom"]) {
  if (!registry.supported_location_types.includes(t)) fail(`Supported location type missing: ${t}`);
}
if (registry.public_output_allowed_now !== false) fail("Registry public output must be false.");
if (!registry.records.some((x) => x.location_registry_id === "loc_in_ar_itanagar_capital_complex_001")) fail("Normalised Itanagar registry record missing.");
if (!registry.records.some((x) => x.location_type === "coordinate_first_custom")) fail("Coordinate-first registry example missing.");

const coordinate = readJson("data/knowledge-base/location-intelligence/production/location-coordinate-input-contract.json");
if (coordinate.status !== "coordinate_first_input_contract_created") fail("Coordinate contract status mismatch.");
for (const field of ["latitude_decimal", "longitude_decimal", "timezone", "date_key_or_datetime_basis"]) {
  if (!coordinate.minimum_required_fields_for_computation.includes(field)) fail(`Coordinate contract required field missing: ${field}`);
}
if (!coordinate.timezone_rule.includes("Latitude and longitude alone are not enough")) fail("Timezone caution missing.");

const display = readJson("data/knowledge-base/location-intelligence/production/location-display-label-policy.json");
if (display.status !== "location_display_label_policy_created") fail("Display policy status mismatch.");
if (display.internal_id_exposure_allowed_in_public_ui !== false) fail("Internal ID exposure must be false.");
if (display.short_display_allowed.panchang_preview_header !== "Itanagar") fail("Panchang preview short display must be Itanagar.");

const usage = readJson("data/knowledge-base/location-intelligence/production/location-usage-map.json");
if (usage.status !== "location_usage_map_created") fail("Usage map status mismatch.");
for (const module of ["Panchang", "Star Reflection", "Birth Location Handling", "Future Location-dependent Modules"]) {
  if (!usage.shared_registry_used_by.some((x) => x.module === module)) fail(`Usage map missing module: ${module}`);
}
if (usage.duplicate_location_logic_outside_registry_allowed !== false) fail("Duplicate location logic must be false.");

const capitals = readJson("data/knowledge-base/location-intelligence/production/india-state-ut-capitals-seed.json");
if (capitals.status !== "india_state_ut_capitals_seed_created_pending_official_verification") fail("India capitals status mismatch.");
if (capitals.seed_record_count < 36) fail("India State/UT capital seed count should be at least 36.");

const districtBlock = readJson("data/knowledge-base/location-intelligence/production/india-district-block-registry.json");
if (districtBlock.status !== "india_district_block_registry_schema_and_seed_examples_created_full_import_pending") fail("District/block status mismatch.");
if (!districtBlock.full_scope_required.includes("all_indian_districts")) fail("All Indian districts full-scope requirement missing.");
if (!districtBlock.full_scope_required.includes("all_indian_blocks")) fail("All Indian blocks full-scope requirement missing.");
if (!districtBlock.seed_examples.some((x) => x.display_label === "Anjaw-Arunachal Pradesh-India")) fail("Anjaw seed missing.");
if (!districtBlock.seed_examples.some((x) => x.display_label === "Bhawanathpur-Garhwa-Jharkhand-India")) fail("Bhawanathpur seed missing.");

const worldCapitals = readJson("data/knowledge-base/location-intelligence/production/world-national-capitals-seed.json");
if (worldCapitals.status !== "world_national_capitals_seed_examples_created_full_import_pending") fail("World capitals status mismatch.");
if (!worldCapitals.records.some((x) => x.display_label === "Tokyo-Japan")) fail("Tokyo seed missing.");

const worldCities = readJson("data/knowledge-base/location-intelligence/production/world-major-cities-seed.json");
if (worldCities.status !== "world_major_cities_seed_examples_created_full_import_pending") fail("World major cities status mismatch.");
if (!worldCities.records.some((x) => x.display_label === "Dubai-United Arab Emirates")) fail("Dubai seed missing.");

const imports = readJson("data/knowledge-base/location-intelligence/production/location-official-import-contracts.json");
if (imports.status !== "location_official_import_contracts_created") fail("Import contracts status mismatch.");
for (const id of ["india_state_ut_capitals_official_import", "india_districts_blocks_official_import", "world_country_capitals_authoritative_import", "world_major_cities_authoritative_import"]) {
  if (!imports.import_contracts.some((x) => x.contract_id === id)) fail(`Import contract missing: ${id}`);
}

const norm = readJson("data/knowledge-base/location-intelligence/production/location-id-normalisation-map.json");
if (norm.status !== "location_id_normalisation_map_created") fail("Normalisation map status mismatch.");
const n = norm.normalisation_records[0];
if (n.old_location_id !== "loc_in_ar_itangar_capital_complex_001") fail("Old Itanagar ID mismatch.");
if (n.normalised_location_id !== "loc_in_ar_itanagar_capital_complex_001") fail("Normalised Itanagar ID mismatch.");
if (n.historical_record_mutation_performed_now !== false) fail("Historical record mutation must be false.");
if (n.panchang_recalculation_performed_now !== false) fail("Panchang recalculation must be false.");

const itanagar = readJson("data/knowledge-base/location-intelligence/production/ag70t-itanagar-normalisation-record.json");
if (itanagar.status !== "itanagar_location_id_normalisation_record_created") fail("Itanagar normalisation status mismatch.");
if (itanagar.user_facing_short_label !== "Itanagar") fail("Itanagar short label mismatch.");
if (itanagar.future_records_should_use_normalised_id !== true) fail("Future records must use normalised ID.");
if (itanagar.public_output_allowed_now !== false) fail("Itanagar public output must be false.");

const basis = readJson("data/knowledge-base/location-intelligence/production/ag70t-panchang-basis-normalisation-audit.json");
if (basis.status !== "panchang_basis_normalisation_audit_passed") fail("Basis audit status mismatch.");
if (basis.panchang_values_recomputed_now !== false) fail("Panchang recomputation must be false.");
if (basis.historical_panchang_records_mutated_now !== false) fail("Historical record mutation must be false.");
if (basis.future_preview_display_should_use_short_label !== "Itanagar") fail("Future preview short label must be Itanagar.");

const noPublic = readJson("data/knowledge-base/location-intelligence/production/ag70t-no-public-output-audit.json");
if (noPublic.status !== "no_public_output_audit_passed") fail("No-public audit status mismatch.");
for (const key of [
  "public_panchang_output_allowed_now",
  "public_observance_output_allowed_now",
  "public_eclipse_output_allowed_now",
  "public_word_output_allowed_now",
  "public_star_reflection_output_allowed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (noPublic[key] !== false) fail(`${key} must be false.`);
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_location_intelligence_registry_panchang_basis_normalisation",
  "production_bank_manifest_created_location_import_selection_validation",
  "production_bank_manifest_created_india_administrative_location_import_bank",
  "production_bank_manifest_created_india_cities_capitals_coordinate_bank",
  "production_bank_manifest_created_global_capitals_major_cities_coordinate_bank",
  "production_bank_manifest_created_location_selection_resolver_test",
  "production_bank_manifest_created_location_intelligence_foundation_closure",
  "production_bank_manifest_created_verified_four_location_pilot_activation",
  "production_bank_manifest_created_pilot_runtime_validation",
  "production_bank_manifest_created_pilot_ui_coordinate_input_surface"
];
if (!allowedPanchangManifestStatuses.includes(manifest.status)) fail("Panchang manifest status mismatch.");
if (manifest.current_counts.location_intelligence_registry_records !== 2) fail("Registry record count mismatch.");
if (manifest.current_counts.coordinate_first_contract_records !== 1) fail("Coordinate-first contract count mismatch.");
if (manifest.current_counts.public_panchang_outputs !== 0) fail("Public Panchang outputs must be zero.");
if (manifest.current_counts.word_output_records !== 0) fail("Word output records must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70t-location-intelligence-registry-and-panchang-basis-normalisation.json");
if (review.status !== "ag70t_location_intelligence_registry_and_panchang_basis_normalisation_completed") fail("Review status mismatch.");
for (const key of [
  "location_intelligence_registry_created",
  "named_location_selection_supported",
  "coordinate_first_input_supported",
  "panchang_usage_mapped",
  "star_reflection_usage_mapped",
  "birth_location_usage_mapped",
  "official_import_contracts_created",
  "itanagar_location_id_normalisation_record_created",
  "ready_for_ag70u"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "public_output_allowed_now",
  "panchang_recomputation_performed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag70t-ag70u-location-import-and-selection-validation-readiness-record.json");
if (readiness.ready_for_ag70u !== true) fail("AG70U readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70t-to-ag70u-location-import-and-selection-validation-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70U boundary must not auto-start.");
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

pass("AG70T location intelligence registry and Panchang basis normalisation is valid.");
pass("Named-location and coordinate-first input modes are supported.");
pass("Itanagar normalisation, display-label policy and shared module usage map are created.");
