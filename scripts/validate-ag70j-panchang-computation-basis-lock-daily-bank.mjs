import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70J validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70j-panchang-computation-basis-lock-daily-bank.mjs",
  "scripts/validate-ag70j-panchang-computation-basis-lock-daily-bank.mjs",
  "data/knowledge-base/panchang-festival/production/ag70j-panchang-computation-basis-lock-daily-bank-batch-01.json",
  "data/knowledge-base/panchang-festival/production/panchang-default-location-basis-lock.json",
  "data/knowledge-base/panchang-festival/production/panchang-ayanamsa-basis-lock.json",
  "data/knowledge-base/panchang-festival/production/panchang-internal-computation-basis-lock.json",
  "data/knowledge-base/panchang-festival/production/panchang-daily-calculation-bank-batch-01.json",
  "data/knowledge-base/panchang-festival/production/ag70j-no-fabricated-panchang-values-audit.json",
  "data/content-intelligence/quality-reviews/ag70j-panchang-computation-basis-lock-daily-bank.json",
  "data/content-intelligence/quality-registry/ag70j-ag70k-internal-panchang-daily-computation-engine-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70j-to-ag70k-internal-panchang-daily-computation-engine-boundary.json",
  "data/quality/ag70j-panchang-computation-basis-lock-daily-bank.json",
  "data/quality/ag70j-panchang-computation-basis-lock-daily-bank-preview.json",
  "docs/quality/AG70J_PANCHANG_COMPUTATION_BASIS_LOCK_DAILY_BANK.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70j"]) fail("Missing generate:ag70j script.");
if (!pkg.scripts?.["validate:ag70j"]) fail("Missing validate:ag70j script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70j")) fail("validate:project must include validate:ag70j.");

const location = readJson("data/knowledge-base/panchang-festival/production/panchang-default-location-basis-lock.json");
if (location.status !== "panchang_default_location_basis_locked_for_internal_batch_01") fail("Location lock status mismatch.");
if (location.location_record_count !== 1) fail("Location record count must be 1.");
const loc = location.records[0];
if (loc.location_id !== "loc_in_ar_itangar_capital_complex_001") fail("Location ID mismatch.");
if (loc.timezone !== "Asia/Kolkata") fail("Timezone mismatch.");
if (loc.default_for_public_output_now !== false) fail("Public default location must be false.");

const ayanamsa = readJson("data/knowledge-base/panchang-festival/production/panchang-ayanamsa-basis-lock.json");
if (ayanamsa.status !== "panchang_ayanamsa_basis_locked_for_internal_batch_01") fail("Ayanamsa lock status mismatch.");
if (ayanamsa.ayanamsa_record.ayanamsa_id !== "ayanamsa_lahiri_chitrapaksha_internal_v1") fail("Ayanamsa ID mismatch.");
if (ayanamsa.ayanamsa_record.selected_for_internal_computation_now !== true) fail("Ayanamsa must be selected for internal batch.");
if (ayanamsa.ayanamsa_record.selected_for_public_runtime_now !== false) fail("Ayanamsa must not be public runtime.");

const internal = readJson("data/knowledge-base/panchang-festival/production/panchang-internal-computation-basis-lock.json");
if (internal.status !== "internal_panchang_computation_basis_locked_no_values_generated") fail("Internal computation lock status mismatch.");
for (const key of ["external_panchang_sites_used_as_source", "external_panchang_sites_used_as_runtime_dependency", "external_panchang_sites_used_for_data_generation"]) {
  if (internal[key] !== false) fail(`${key} must be false.`);
}
if (internal.daily_values_generated_now !== false) fail("Daily values must not be generated.");

const daily = readJson("data/knowledge-base/panchang-festival/production/panchang-daily-calculation-bank-batch-01.json");
const allowedDailyBankStatuses = [
  "panchang_daily_calculation_bank_batch_01_created_pending_internal_computation",
  "panchang_daily_calculation_bank_batch_01_computed_internal_dry_run_public_blocked",
  "panchang_daily_calculation_bank_batch_01_internally_validated_public_blocked"
];
if (!allowedDailyBankStatuses.includes(daily.status)) fail("Daily bank status mismatch.");
if (daily.daily_request_record_count !== 7) fail("Daily request record count must be 7.");
if (![0, 7].includes(daily.computed_panchang_daily_record_count)) fail("Computed daily record count must be 0 before AG70K or 7 after AG70K.");
if (daily.fabricated_value_count !== 0) fail("Fabricated value count must be zero.");
if (daily.external_site_input_count !== 0) fail("External site input count must be zero.");
if (!Array.isArray(daily.records) || daily.records.length !== 7) fail("Daily bank must contain 7 pending records.");

for (const record of daily.records) {
  if (daily.status === "panchang_daily_calculation_bank_batch_01_created_pending_internal_computation") {
    if (record.record_status !== "pending_internal_computation") fail(`Record must be pending: ${record.panchang_daily_record_id}`);
    if (record.computed_values_present !== false) fail(`Computed values must be absent: ${record.panchang_daily_record_id}`);
    for (const field of ["tithi", "nakshatra", "yoga", "karana", "paksha", "vara"]) {
      if (record[field] !== null) fail(`${field} must be null before computation: ${record.panchang_daily_record_id}`);
    }
  }

  if (daily.status === "panchang_daily_calculation_bank_batch_01_computed_internal_dry_run_public_blocked") {
    if (!["computed_internal_dry_run_public_blocked", "internally_validated_public_blocked"].includes(record.record_status)) fail(`Record must be computed dry-run or internally validated: ${record.panchang_daily_record_id}`);
    if (record.computed_values_present !== true) fail(`Computed values must be present: ${record.panchang_daily_record_id}`);
    for (const field of ["tithi", "nakshatra", "yoga", "karana", "paksha", "vara"]) {
      if (record[field] === null || record[field] === undefined) fail(`${field} must be populated after computation: ${record.panchang_daily_record_id}`);
    }
  }

  if (record.public_output_allowed !== false) fail("Public output must be false.");
}

const audit = readJson("data/knowledge-base/panchang-festival/production/ag70j-no-fabricated-panchang-values-audit.json");
if (audit.status !== "no_fabricated_panchang_values_audit_passed") fail("No-fabrication audit status mismatch.");
if (audit.daily_request_records_created !== 7) fail("Audit daily request count mismatch.");
if (audit.computed_panchang_daily_records_created_now !== 0) fail("Computed records must be zero.");
if (audit.fabricated_panchang_value_count !== 0) fail("Fabricated values must be zero.");
for (const key of [
  "external_panchang_sites_used_as_source",
  "external_panchang_sites_used_for_data_generation",
  "external_panchang_sites_used_as_runtime_dependency",
  "public_panchang_output_allowed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (audit[key] !== false) fail(`${key} must be false.`);
}

const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_panchang_computation_basis_lock_daily_bank_batch_01",
  "production_bank_manifest_created_internal_panchang_daily_computation_engine_dry_run",
  "production_bank_manifest_created_computed_panchang_daily_bank_internal_validation",
  "production_bank_manifest_created_festival_observance_rule_bank_batch_01",
  "production_bank_manifest_created_upcoming_observance_computed_event_bank_batch_01",
  "production_bank_manifest_created_eclipse_computation_event_bank_batch_01",
  "production_bank_manifest_created_panchang_computation_verification_policy",
  "production_bank_manifest_created_panchang_context_interpretation_bank_batch_01",
  "production_bank_manifest_created_today_panchang_context_preview_output_test",
  "production_bank_manifest_created_today_panchang_preview_manual_verification_gate",
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
if (!allowedPanchangManifestStatuses.includes(panchangManifest.status)) fail("Panchang manifest status mismatch.");
if (panchangManifest.current_counts.daily_calculation_request_records !== 7) fail("Manifest daily request count mismatch.");
if (![0, 7].includes(panchangManifest.current_counts.panchang_daily_records)) fail("Manifest computed daily records must be 0 before AG70K or 7 after AG70K.");

const review = readJson("data/content-intelligence/quality-reviews/ag70j-panchang-computation-basis-lock-daily-bank.json");
if (review.status !== "ag70j_panchang_computation_basis_lock_daily_bank_completed") fail("Review status mismatch.");

for (const key of [
  "default_location_locked",
  "ayanamsa_basis_locked",
  "internal_computation_basis_locked",
  "daily_calculation_bank_batch_01_created",
  "external_panchang_sites_allowed_only_after_output_for_manual_verification",
  "ready_for_ag70k"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "external_panchang_sites_used_as_source",
  "external_panchang_sites_used_as_runtime_dependency",
  "external_panchang_sites_used_for_data_generation",
  "actual_observance_events_created_now",
  "actual_eclipse_events_created_now",
  "context_interpretation_records_created_now",
  "public_panchang_output_allowed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}
if (review.summary.daily_calculation_request_record_count !== 7) fail("Review request count mismatch.");
if (review.summary.computed_panchang_daily_record_count !== 0) fail("Review computed count must be zero.");
if (review.summary.fabricated_panchang_value_count !== 0) fail("Review fabricated value count must be zero.");

const readiness = readJson("data/content-intelligence/quality-registry/ag70j-ag70k-internal-panchang-daily-computation-engine-readiness-record.json");
if (readiness.ready_for_ag70k !== true) fail("AG70K readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70j-to-ag70k-internal-panchang-daily-computation-engine-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70K boundary must not auto-start.");
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

pass("AG70J Panchang computation basis lock and daily bank is valid.");
pass("Location, ayanamsa and internal computation basis are locked for Batch 01.");
pass("Daily calculation request records exist with no fabricated/computed Panchang values.");
pass("External Panchang sites remain excluded from source/runtime/data-generation.");
