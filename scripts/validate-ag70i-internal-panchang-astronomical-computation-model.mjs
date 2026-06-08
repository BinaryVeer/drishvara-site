import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70I validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70i-internal-panchang-astronomical-computation-model.mjs",
  "scripts/validate-ag70i-internal-panchang-astronomical-computation-model.mjs",
  "data/knowledge-base/panchang-festival/production/internal-astronomical-computation-model.json",
  "data/knowledge-base/panchang-festival/production/internal-panchang-computation-method-register.json",
  "data/knowledge-base/panchang-festival/production/solar-lunar-longitude-computation-model.json",
  "data/knowledge-base/panchang-festival/production/sunrise-sunset-computation-model.json",
  "data/knowledge-base/panchang-festival/production/panchang-element-derivation-model.json",
  "data/knowledge-base/panchang-festival/production/ayanamsa-runtime-policy.json",
  "data/knowledge-base/panchang-festival/production/vara-paksha-karana-computation-model.json",
  "data/knowledge-base/panchang-festival/production/computed-panchang-daily-record-schema.json",
  "data/knowledge-base/panchang-festival/production/post-computation-manual-verification-policy.json",
  "data/knowledge-base/panchang-festival/production/ag70i-external-panchang-site-exclusion-audit.json",
  "data/knowledge-base/panchang-festival/production/ag70i-no-daily-panchang-computation-audit.json",
  "data/content-intelligence/quality-reviews/ag70i-internal-panchang-astronomical-computation-model.json",
  "data/content-intelligence/quality-registry/ag70i-ag70j-panchang-daily-calculation-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70i-to-ag70j-panchang-daily-calculation-bank-boundary.json",
  "data/quality/ag70i-internal-panchang-astronomical-computation-model.json",
  "data/quality/ag70i-internal-panchang-astronomical-computation-model-preview.json",
  "docs/quality/AG70I_INTERNAL_PANCHANG_ASTRONOMICAL_COMPUTATION_MODEL.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70i"]) fail("Missing generate:ag70i script.");
if (!pkg.scripts?.["validate:ag70i"]) fail("Missing validate:ag70i script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70i")) fail("validate:project must include validate:ag70i.");

const model = readJson("data/knowledge-base/panchang-festival/production/internal-astronomical-computation-model.json");
if (model.status !== "internal_panchang_astronomical_computation_model_defined_no_daily_records") fail("Internal model status mismatch.");
if (model.source_of_truth_principle.production_source_of_truth !== "internal_governed_astronomical_computation") fail("Production source of truth must be internal.");
for (const key of [
  "external_panchang_sites_used_as_source",
  "external_panchang_sites_used_as_runtime_dependency",
  "external_panchang_sites_used_for_data_generation",
  "external_panchang_sites_used_for_public_claim"
]) {
  if (model.source_of_truth_principle[key] !== false) fail(`${key} must be false.`);
}
if (model.daily_records_created_now !== 0) fail("Daily records must be zero.");

const method = readJson("data/knowledge-base/panchang-festival/production/internal-panchang-computation-method-register.json");
if (method.status !== "internal_computation_method_register_created_no_runtime_activation") fail("Method register status mismatch.");
for (const blocked of ["runtime_scraping_of_panchang_websites", "external_panchang_website_as_source_of_truth", "ai_generated_panchang_without_computation"]) {
  if (!method.prohibited_implementation_options.includes(blocked)) fail(`Prohibited method missing: ${blocked}`);
}
if (method.selected_for_runtime_now !== false) fail("Runtime method must not be selected now.");

const longitude = readJson("data/knowledge-base/panchang-festival/production/solar-lunar-longitude-computation-model.json");
if (longitude.status !== "solar_lunar_longitude_model_defined_no_values_generated") fail("Longitude model status mismatch.");
for (const field of ["sun_apparent_longitude_tropical", "moon_apparent_longitude_tropical", "sun_longitude_sidereal", "moon_longitude_sidereal", "moon_minus_sun_angular_difference_0_360"]) {
  if (!longitude.required_internal_values.includes(field)) fail(`Longitude required value missing: ${field}`);
}
if (longitude.generated_values_now !== 0) fail("Longitude values must not be generated.");

const derivation = readJson("data/knowledge-base/panchang-festival/production/panchang-element-derivation-model.json");
if (derivation.status !== "panchang_element_derivation_model_defined_no_records_generated") fail("Derivation model status mismatch.");
if (derivation.formulas.tithi.segment_degrees !== 12) fail("Tithi segment must be 12 degrees.");
if (derivation.formulas.tithi.index_rule !== "floor(angle / 12) + 1") fail("Tithi index rule mismatch.");
if (!String(derivation.formulas.nakshatra.segment_degrees).includes("13")) fail("Nakshatra segment must be 13°20′.");
if (!String(derivation.formulas.yoga.basis).includes("sun_longitude_sidereal")) fail("Yoga basis must use sidereal Sun+Moon longitude.");
if (derivation.generated_records_now !== 0) fail("No derivation records should be generated.");

const ayanamsa = readJson("data/knowledge-base/panchang-festival/production/ayanamsa-runtime-policy.json");
if (ayanamsa.status !== "ayanamsa_runtime_policy_created_selection_still_blocked") fail("Ayanamsa policy status mismatch.");
if (ayanamsa.ayanamsa_selected_for_runtime_now !== false) fail("Ayanamsa must not be selected in AG70I.");
if (ayanamsa.daily_record_generation_blocked_until_selected !== true) fail("Daily record generation must be blocked until ayanamsa selected.");

const support = readJson("data/knowledge-base/panchang-festival/production/vara-paksha-karana-computation-model.json");
if (support.status !== "vara_paksha_karana_model_defined_no_records_generated") fail("Vara/Paksha/Karana status mismatch.");
if (support.derivation_rules.karana.segment_degrees !== 6) fail("Karana segment must be 6 degrees.");
if (support.generated_records_now !== 0) fail("No support records should be generated.");

const schema = readJson("data/knowledge-base/panchang-festival/production/computed-panchang-daily-record-schema.json");
if (schema.status !== "computed_panchang_daily_record_schema_created_no_records") fail("Daily schema status mismatch.");
for (const field of ["date_key", "location_id", "ayanamsa_id", "tithi", "nakshatra", "yoga", "karana", "paksha", "vara", "post_computation_manual_verification_status"]) {
  if (!schema.required_fields.includes(field)) fail(`Daily schema field missing: ${field}`);
}
if (schema.records_created_now !== 0) fail("No daily schema records should be created.");

const manual = readJson("data/knowledge-base/panchang-festival/production/post-computation-manual-verification-policy.json");
if (manual.status !== "post_computation_manual_verification_policy_created") fail("Manual verification policy status mismatch.");
if (manual.policy.external_sites_in_production_model !== false) fail("External sites must not be in production model.");
if (manual.policy.external_sites_as_source_of_truth !== false) fail("External sites must not be source of truth.");
if (manual.policy.external_sites_as_runtime_dependency !== false) fail("External sites must not be runtime dependency.");
if (manual.policy.external_sites_as_data_generation_input !== false) fail("External sites must not be data generation input.");
if (manual.policy.external_sites_for_manual_check_after_output !== true) fail("External sites may only be used after output for manual check.");

const exclusion = readJson("data/knowledge-base/panchang-festival/production/ag70i-external-panchang-site-exclusion-audit.json");
if (exclusion.status !== "external_panchang_site_exclusion_audit_passed") fail("External exclusion audit status mismatch.");
for (const key of [
  "external_panchang_sites_used_as_source",
  "external_panchang_sites_used_as_runtime_dependency",
  "external_panchang_sites_used_for_data_generation",
  "external_panchang_sites_used_for_public_claim",
  "random_panchang_website_dependency_present"
]) {
  if (exclusion[key] !== false) fail(`${key} must be false.`);
}
if (exclusion.external_panchang_sites_used_for_manual_post_output_verification_only !== true) fail("External sites must be manual verification only.");
if (exclusion.production_model_is_internal !== true) fail("Production model must be internal.");

const noDaily = readJson("data/knowledge-base/panchang-festival/production/ag70i-no-daily-panchang-computation-audit.json");
if (noDaily.status !== "no_daily_panchang_computation_audit_passed") fail("No daily computation audit status mismatch.");
for (const key of ["panchang_daily_records_created_now", "observance_events_created_now", "eclipse_events_created_now", "context_interpretation_records_created_now"]) {
  if (noDaily[key] !== 0) fail(`${key} must be zero.`);
}
for (const key of ["generated_word_json_modified", "ui_display_changed", "supabase_activation_performed", "backend_runtime_activated", "public_panchang_output_allowed_now"]) {
  if (noDaily[key] !== false) fail(`${key} must be false.`);
}

const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_internal_panchang_astronomical_computation_model",
  "production_bank_manifest_created_panchang_computation_basis_lock_daily_bank_batch_01",
  "production_bank_manifest_created_internal_panchang_daily_computation_engine_dry_run",
  "production_bank_manifest_created_computed_panchang_daily_bank_internal_validation",
  "production_bank_manifest_created_festival_observance_rule_bank_batch_01",
  "production_bank_manifest_created_upcoming_observance_computed_event_bank_batch_01"
];
if (!allowedPanchangManifestStatuses.includes(panchangManifest.status)) fail("Panchang manifest status mismatch.");
if (![0, 7].includes(panchangManifest.current_counts.panchang_daily_records)) fail("Panchang daily records must be 0 before AG70K or 7 after AG70K.");
if (![0, 2].includes(panchangManifest.current_counts.observance_events)) fail("Observance events must be 0 before AG70N or 2 after AG70N internal candidate generation.");
if (panchangManifest.current_counts.eclipse_events !== 0) fail("Eclipse events must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70i-internal-panchang-astronomical-computation-model.json");
if (review.status !== "ag70i_internal_panchang_astronomical_computation_model_completed") fail("Review status mismatch.");
for (const key of [
  "internal_panchang_model_defined",
  "computation_method_register_created",
  "solar_lunar_longitude_model_created",
  "sunrise_sunset_model_created",
  "panchang_element_derivation_model_created",
  "ayanamsa_runtime_policy_created",
  "vara_paksha_karana_model_created",
  "computed_daily_record_schema_created",
  "post_computation_manual_verification_policy_created",
  "external_panchang_site_exclusion_audit_passed",
  "panchang_manifest_updated",
  "external_panchang_sites_used_for_manual_post_output_verification_only",
  "ready_for_ag70j"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "external_panchang_sites_used_as_source",
  "external_panchang_sites_used_as_runtime_dependency",
  "external_panchang_sites_used_for_data_generation",
  "actual_panchang_daily_records_created_now",
  "actual_observance_events_created_now",
  "actual_eclipse_events_created_now",
  "context_interpretation_records_created_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag70i-ag70j-panchang-daily-calculation-bank-readiness-record.json");
if (readiness.ready_for_ag70j !== true) fail("AG70J readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70i-to-ag70j-panchang-daily-calculation-bank-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70J boundary must not auto-start.");
for (const blocker of [
  "public Panchang output",
  "actual festival/observance date publication",
  "actual eclipse event publication",
  "context interpretation production records",
  "generated/word-of-day.json replacement",
  "external Panchang site as source of truth",
  "external Panchang site as data-generation input",
  "external Panchang site as runtime dependency"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) fail(`Boundary blocker missing: ${blocker}`);
}

pass("AG70I internal Panchang astronomical computation model is valid.");
pass("External Panchang sites are excluded from source/runtime/data-generation and allowed only for manual post-output verification.");
pass("No daily Panchang, observance, eclipse, context, UI or backend activation is recorded.");
