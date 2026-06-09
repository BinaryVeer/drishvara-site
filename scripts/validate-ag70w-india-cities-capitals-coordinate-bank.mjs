import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70W validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70w-india-cities-capitals-coordinate-bank.mjs",
  "scripts/validate-ag70w-india-cities-capitals-coordinate-bank.mjs",
  "data/knowledge-base/location-intelligence/production/ag70w-india-city-coordinate-source-policy.json",
  "data/knowledge-base/location-intelligence/production/ag70w-city-coordinate-refresh-cadence-policy.json",
  "data/knowledge-base/location-intelligence/production/india-city-capital-coordinate-schema.json",
  "data/knowledge-base/location-intelligence/production/india-cities-capitals-coordinate-bank.json",
  "data/knowledge-base/location-intelligence/production/ag70w-india-capital-coordinate-candidates.json",
  "data/knowledge-base/location-intelligence/production/ag70w-india-major-city-coordinate-candidates.json",
  "data/knowledge-base/location-intelligence/production/ag70w-coordinate-government-verification-queue.json",
  "data/knowledge-base/location-intelligence/production/ag70w-city-coordinate-resolver-readiness.json",
  "data/knowledge-base/location-intelligence/production/ag70w-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag70w-india-cities-capitals-coordinate-bank.json",
  "data/content-intelligence/quality-registry/ag70w-ag70x-global-capitals-major-cities-coordinate-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70w-to-ag70x-global-capitals-major-cities-coordinate-bank-boundary.json",
  "data/quality/ag70w-india-cities-capitals-coordinate-bank.json",
  "data/quality/ag70w-india-cities-capitals-coordinate-bank-preview.json",
  "docs/quality/AG70W_INDIA_CITIES_CAPITALS_COORDINATE_BANK.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70w"]) fail("Missing generate:ag70w script.");
if (!pkg.scripts?.["validate:ag70w"]) fail("Missing validate:ag70w script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70w")) fail("validate:project must include validate:ag70w.");

const policy = readJson("data/knowledge-base/location-intelligence/production/ag70w-india-city-coordinate-source-policy.json");
if (policy.status !== "india_city_coordinate_source_policy_created") fail("Source policy status mismatch.");
if (policy.freshness_window_months !== 12) fail("Freshness window must be 12 months.");
if (policy.refresh_interval_months !== 4) fail("Refresh interval must be 4 months.");
if (policy.non_government_coordinate_source_allowed_for_computation_now !== false) fail("Non-government coordinate computation source must be false.");
if (policy.computation_allowed_for_candidate_coordinates !== false) fail("Candidate coordinates must not compute.");
if (policy.public_output_allowed_now !== false) fail("Source policy public output must be false.");

const refresh = readJson("data/knowledge-base/location-intelligence/production/ag70w-city-coordinate-refresh-cadence-policy.json");
if (refresh.status !== "india_city_coordinate_refresh_cadence_policy_created") fail("Refresh status mismatch.");
if (refresh.refresh_interval_months !== 4) fail("Refresh interval mismatch.");
if (refresh.failure_policy.fetch_failure !== "Keep last approved coordinate bank active and create refresh_failure_review_required record.") fail("Fetch failure policy mismatch.");

const schema = readJson("data/knowledge-base/location-intelligence/production/india-city-capital-coordinate-schema.json");
if (schema.status !== "india_city_capital_coordinate_schema_created") fail("Coordinate schema status mismatch.");
for (const field of ["latitude_decimal", "longitude_decimal", "coordinate_value_status", "coordinate_source_status", "source_freshness_status", "computation_allowed_now"]) {
  if (!schema.required_fields.includes(field)) fail(`Schema field missing: ${field}`);
}

const bank = readJson("data/knowledge-base/location-intelligence/production/india-cities-capitals-coordinate-bank.json");
if (bank.status !== "india_cities_capitals_coordinate_bank_created_candidate_records_public_blocked") fail("Coordinate bank status mismatch.");
if (bank.source_freshness_window_months !== 12) fail("Bank freshness window must be 12.");
if (bank.refresh_interval_months !== 4) fail("Bank refresh interval must be 4.");
if (bank.capital_candidate_record_count < 36) fail("Capital candidate count should be at least 36.");
if (bank.major_city_candidate_record_count < 10) fail("Major city candidate count should be at least 10.");
if (bank.approved_computation_record_count !== 0) fail("Approved computation count must be zero.");
if (bank.actual_government_coordinate_fetch_performed_now !== false) fail("Government coordinate fetch should not be performed now.");
if (bank.public_dropdown_activation_performed_now !== false) fail("Public dropdown activation must be false.");
if (!bank.records.some((x) => x.display_label === "Itanagar-Arunachal Pradesh-India")) fail("Itanagar candidate missing.");
if (!bank.records.some((x) => x.display_label === "New Delhi-Delhi-India")) fail("New Delhi candidate missing.");
for (const record of bank.records) {
  if (record.computation_allowed_now !== false) fail(`Computation must be false: ${record.coordinate_record_id}`);
  if (record.public_dropdown_activation_allowed_now !== false) fail(`Public dropdown must be false: ${record.coordinate_record_id}`);
}

const queue = readJson("data/knowledge-base/location-intelligence/production/ag70w-coordinate-government-verification-queue.json");
if (queue.status !== "coordinate_government_verification_queue_created") fail("Verification queue status mismatch.");
if (queue.queue_record_count !== bank.total_candidate_record_count) fail("Queue count must match bank count.");
if (queue.verification_required_before_computation !== true) fail("Verification must be required before computation.");

const resolver = readJson("data/knowledge-base/location-intelligence/production/ag70w-city-coordinate-resolver-readiness.json");
if (resolver.status !== "india_city_coordinate_resolver_readiness_created_internal_only") fail("Resolver status mismatch.");
if (resolver.named_selection_resolution_supported !== true) fail("Named selection resolver should be supported.");
if (resolver.computation_resolution_enabled_now !== false) fail("Computation resolver must be disabled.");
if (resolver.public_output_allowed_now !== false) fail("Resolver public output must be false.");

const noPublic = readJson("data/knowledge-base/location-intelligence/production/ag70w-no-public-output-audit.json");
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
  "production_bank_manifest_created_india_cities_capitals_coordinate_bank",
  "production_bank_manifest_created_global_capitals_major_cities_coordinate_bank",
  "production_bank_manifest_created_location_selection_resolver_test",
  "production_bank_manifest_created_location_intelligence_foundation_closure",
  "production_bank_manifest_created_verified_four_location_pilot_activation",
  "production_bank_manifest_created_pilot_runtime_validation",
  "production_bank_manifest_created_pilot_ui_coordinate_input_surface",
  "production_bank_manifest_created_pilot_ui_validation"
];
if (!allowedPanchangManifestStatuses.includes(manifest.status)) fail("Panchang manifest status mismatch.");
if (manifest.current_counts.india_capital_coordinate_candidate_records < 36) fail("Manifest capital candidate count mismatch.");
if (manifest.current_counts.india_major_city_coordinate_candidate_records < 10) fail("Manifest major city candidate count mismatch.");
if (manifest.current_counts.india_city_capital_approved_computation_records !== 0) fail("Approved computation records must be zero.");
if (manifest.current_counts.government_coordinate_fetch_records_now !== 0) fail("Government coordinate fetch records must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70w-india-cities-capitals-coordinate-bank.json");
if (review.status !== "ag70w_india_cities_capitals_coordinate_bank_completed") fail("Review status mismatch.");
for (const key of [
  "india_city_capital_coordinate_bank_created",
  "source_policy_created",
  "refresh_policy_created",
  "coordinate_schema_created",
  "verification_queue_created",
  "resolver_readiness_created",
  "ready_for_ag70x"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "government_coordinate_fetch_performed_now",
  "public_dropdown_activation_performed_now",
  "panchang_recomputation_performed_now",
  "star_reflection_computation_performed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag70w-ag70x-global-capitals-major-cities-coordinate-bank-readiness-record.json");
if (readiness.ready_for_ag70x !== true) fail("AG70X readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70w-to-ag70x-global-capitals-major-cities-coordinate-bank-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70X boundary must not auto-start.");

pass("AG70W India cities and capitals coordinate bank is valid.");
pass("Candidate coordinate records created with government verification requirement.");
pass("Computation/public dropdown/UI/backend/Supabase activation remain blocked.");
