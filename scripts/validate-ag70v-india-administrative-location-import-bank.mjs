import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70V validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70v-india-administrative-location-import-bank.mjs",
  "scripts/validate-ag70v-india-administrative-location-import-bank.mjs",
  "data/knowledge-base/location-intelligence/production/ag70v-government-source-freshness-policy.json",
  "data/knowledge-base/location-intelligence/production/ag70v-four-month-refresh-cadence-policy.json",
  "data/knowledge-base/location-intelligence/production/ag70v-india-administrative-source-registry.json",
  "data/knowledge-base/location-intelligence/production/ag70v-government-source-fetch-plan.json",
  "data/knowledge-base/location-intelligence/production/india-administrative-location-import-bank.json",
  "data/knowledge-base/location-intelligence/production/india-administrative-location-import-schema.json",
  "data/knowledge-base/location-intelligence/production/ag70v-india-administrative-seed-records.json",
  "data/knowledge-base/location-intelligence/production/ag70v-india-admin-coordinate-basis-policy.json",
  "data/knowledge-base/location-intelligence/production/ag70v-refresh-safety-audit.json",
  "data/knowledge-base/location-intelligence/production/ag70v-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag70v-india-administrative-location-import-bank.json",
  "data/content-intelligence/quality-registry/ag70v-ag70w-india-cities-capitals-coordinate-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70v-to-ag70w-india-cities-capitals-coordinate-bank-boundary.json",
  "data/quality/ag70v-india-administrative-location-import-bank.json",
  "data/quality/ag70v-india-administrative-location-import-bank-preview.json",
  "docs/quality/AG70V_INDIA_ADMINISTRATIVE_LOCATION_IMPORT_BANK.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70v"]) fail("Missing generate:ag70v script.");
if (!pkg.scripts?.["validate:ag70v"]) fail("Missing validate:ag70v script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70v")) fail("validate:project must include validate:ag70v.");

const sourcePolicy = readJson("data/knowledge-base/location-intelligence/production/ag70v-government-source-freshness-policy.json");
if (sourcePolicy.status !== "government_source_freshness_policy_created_for_india_admin_import") fail("Source policy status mismatch.");
if (sourcePolicy.freshness_window_months !== 12) fail("Freshness window must be 12 months.");
if (sourcePolicy.non_government_source_allowed_for_india_admin_import_now !== false) fail("Non-government source must be blocked.");
if (sourcePolicy.public_output_allowed_now !== false) fail("Source policy public output must be false.");

const refreshPolicy = readJson("data/knowledge-base/location-intelligence/production/ag70v-four-month-refresh-cadence-policy.json");
if (refreshPolicy.status !== "four_month_refresh_cadence_policy_created") fail("Refresh policy status mismatch.");
if (refreshPolicy.refresh_interval_months !== 4) fail("Refresh interval must be 4 months.");
if (refreshPolicy.failure_policy.fetch_failure !== "Keep last approved data active and create refresh_failure_review_required record.") fail("Fetch failure policy mismatch.");
if (refreshPolicy.public_output_allowed_now !== false) fail("Refresh policy public output must be false.");

const sourceRegistry = readJson("data/knowledge-base/location-intelligence/production/ag70v-india-administrative-source-registry.json");
if (sourceRegistry.status !== "india_administrative_source_registry_created_fetch_ready") fail("Source registry status mismatch.");
for (const sourceId of ["gov_in_lgd_data_gov_catalog", "gov_in_lgd_direct", "survey_of_india_abdb"]) {
  if (!sourceRegistry.source_priority.some((x) => x.source_id === sourceId)) fail(`Source missing: ${sourceId}`);
}
if (sourceRegistry.public_output_allowed_now !== false) fail("Source registry public output must be false.");

const fetchPlan = readJson("data/knowledge-base/location-intelligence/production/ag70v-government-source-fetch-plan.json");
if (fetchPlan.status !== "government_source_fetch_plan_created_no_runtime_fetch_dependency") fail("Fetch plan status mismatch.");
if (fetchPlan.runtime_fetch_dependency_allowed !== false) fail("Runtime fetch dependency must be false.");
if (fetchPlan.no_fetch_performed_now !== true) fail("AG70V should not perform full fetch now.");

const schema = readJson("data/knowledge-base/location-intelligence/production/india-administrative-location-import-schema.json");
if (schema.status !== "india_administrative_location_import_schema_created") fail("Import schema status mismatch.");
for (const field of ["state_or_ut_lgd_code", "district_lgd_code", "subdistrict_or_block_lgd_code", "latitude_decimal", "longitude_decimal", "coordinate_source_status"]) {
  if (!schema.record_required_fields.includes(field)) fail(`Schema field missing: ${field}`);
}

const bank = readJson("data/knowledge-base/location-intelligence/production/india-administrative-location-import-bank.json");
if (bank.status !== "india_administrative_location_import_bank_created_government_source_pending") fail("Import bank status mismatch.");
if (bank.source_freshness_window_months !== 12) fail("Import bank freshness window must be 12.");
if (bank.refresh_interval_months !== 4) fail("Import bank refresh interval must be 4.");
if (bank.actual_full_import_performed_now !== false) fail("Full import must be false.");
if (bank.approved_computation_record_count !== 0) fail("Approved computation count must be zero.");
if (bank.public_dropdown_activation_performed_now !== false) fail("Public dropdown activation must be false.");
if (!bank.records.some((x) => x.display_label === "Anjaw-Arunachal Pradesh-India")) fail("Anjaw seed missing.");
if (!bank.records.some((x) => x.display_label === "Bhawanathpur-Garhwa-Jharkhand-India")) fail("Bhawanathpur seed missing.");
for (const record of bank.records) {
  if (record.computation_allowed_now !== false) fail(`Seed computation must be false: ${record.location_record_id}`);
  if (record.coordinate_source_status !== "pending_government_geospatial_verification") fail(`Coordinate status must remain pending: ${record.location_record_id}`);
}

const coordinatePolicy = readJson("data/knowledge-base/location-intelligence/production/ag70v-india-admin-coordinate-basis-policy.json");
if (coordinatePolicy.status !== "india_admin_coordinate_basis_policy_created") fail("Coordinate policy status mismatch.");
if (coordinatePolicy.coordinate_required_for_computation !== true) fail("Coordinate required rule missing.");
if (coordinatePolicy.timezone_required_for_computation !== true) fail("Timezone required rule missing.");
if (coordinatePolicy.computation_allowed_for_coordinate_pending_records !== false) fail("Coordinate-pending records must not compute.");
if (coordinatePolicy.public_output_allowed_now !== false) fail("Coordinate policy public output must be false.");

const refreshAudit = readJson("data/knowledge-base/location-intelligence/production/ag70v-refresh-safety-audit.json");
if (refreshAudit.status !== "refresh_safety_audit_passed") fail("Refresh audit status mismatch.");
if (refreshAudit.refresh_interval_months !== 4) fail("Refresh audit interval must be 4.");
if (refreshAudit.automatic_promotion_allowed !== false) fail("Automatic promotion must be false.");
if (refreshAudit.old_data_retained_on_fetch_failure !== true) fail("Old data must be retained on fetch failure.");
if (refreshAudit.review_alert_required_on_fetch_failure !== true) fail("Review alert required on fetch failure.");

const noPublic = readJson("data/knowledge-base/location-intelligence/production/ag70v-no-public-output-audit.json");
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
  "production_bank_manifest_created_india_administrative_location_import_bank",
  "production_bank_manifest_created_india_cities_capitals_coordinate_bank",
  "production_bank_manifest_created_global_capitals_major_cities_coordinate_bank",
  "production_bank_manifest_created_location_selection_resolver_test",
  "production_bank_manifest_created_location_intelligence_foundation_closure"
];
if (!allowedPanchangManifestStatuses.includes(manifest.status)) fail("Panchang manifest status mismatch.");
if (manifest.current_counts.india_admin_import_seed_records !== 3) fail("Manifest seed count must be 3.");
if (manifest.current_counts.india_admin_approved_computation_records !== 0) fail("Approved computation count must be zero.");
if (manifest.current_counts.government_source_freshness_policy_records !== 1) fail("Source policy count must be 1.");
if (manifest.current_counts.four_month_refresh_cadence_policy_records !== 1) fail("Refresh policy count must be 1.");
if (manifest.current_counts.full_location_import_records_added_now !== 0) fail("Full import records must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70v-india-administrative-location-import-bank.json");
if (review.status !== "ag70v_india_administrative_location_import_bank_completed") fail("Review status mismatch.");
for (const key of [
  "india_admin_import_bank_created",
  "government_source_freshness_policy_created",
  "four_month_refresh_cadence_policy_created",
  "government_source_registry_created",
  "fetch_plan_created",
  "import_schema_created",
  "coordinate_basis_policy_created",
  "ready_for_ag70w"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "full_import_performed_now",
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

const readiness = readJson("data/content-intelligence/quality-registry/ag70v-ag70w-india-cities-capitals-coordinate-bank-readiness-record.json");
if (readiness.ready_for_ag70w !== true) fail("AG70W readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70v-to-ag70w-india-cities-capitals-coordinate-bank-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70W boundary must not auto-start.");
for (const blocker of [
  "public Panchang output",
  "public Star Reflection output",
  "public location dropdown activation",
  "generated/word-of-day.json replacement",
  "homepage UI change",
  "runtime Word selector activation"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) fail(`Boundary blocker missing: ${blocker}`);
}

pass("AG70V India administrative location import bank is valid.");
pass("Government-source freshness and 4-month refresh policies are created.");
pass("Full import/computation/public dropdown/UI/backend/Supabase activation remain blocked.");
