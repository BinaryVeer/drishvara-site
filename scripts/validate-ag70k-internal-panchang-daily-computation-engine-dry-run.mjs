import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70K validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70k-internal-panchang-daily-computation-engine-dry-run.mjs",
  "scripts/validate-ag70k-internal-panchang-daily-computation-engine-dry-run.mjs",
  "data/knowledge-base/panchang-festival/production/ag70k-internal-panchang-daily-computation-engine-dry-run.json",
  "data/knowledge-base/panchang-festival/production/panchang-computed-daily-bank-batch-01-internal-dry-run.json",
  "data/knowledge-base/panchang-festival/production/panchang-daily-calculation-bank-batch-01.json",
  "data/knowledge-base/panchang-festival/production/ag70k-internal-computation-invariant-report.json",
  "data/knowledge-base/panchang-festival/production/ag70k-no-external-panchang-source-audit.json",
  "data/knowledge-base/panchang-festival/production/ag70k-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag70k-internal-panchang-daily-computation-engine-dry-run.json",
  "data/content-intelligence/quality-registry/ag70k-ag70l-computed-panchang-daily-bank-internal-validation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70k-to-ag70l-computed-panchang-daily-bank-internal-validation-boundary.json",
  "data/quality/ag70k-internal-panchang-daily-computation-engine-dry-run.json",
  "data/quality/ag70k-internal-panchang-daily-computation-engine-dry-run-preview.json",
  "docs/quality/AG70K_INTERNAL_PANCHANG_DAILY_COMPUTATION_ENGINE_DRY_RUN.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70k"]) fail("Missing generate:ag70k script.");
if (!pkg.scripts?.["validate:ag70k"]) fail("Missing validate:ag70k script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70k")) fail("validate:project must include validate:ag70k.");

const engine = readJson("data/knowledge-base/panchang-festival/production/ag70k-internal-panchang-daily-computation-engine-dry-run.json");
if (engine.status !== "ag70k_internal_panchang_daily_computation_engine_dry_run_completed") fail("Engine status mismatch.");
if (engine.computed_record_count !== 7) fail("Engine computed record count must be 7.");
for (const key of ["external_panchang_sites_used_as_source", "external_panchang_sites_used_for_data_generation", "external_panchang_sites_used_as_runtime_dependency"]) {
  if (engine[key] !== false) fail(`${key} must be false.`);
}
if (engine.public_output_allowed_now !== false) fail("Public output must be blocked.");

const bank = readJson("data/knowledge-base/panchang-festival/production/panchang-computed-daily-bank-batch-01-internal-dry-run.json");
const allowedComputedBankStatuses = [
  "panchang_daily_calculation_bank_batch_01_computed_internal_dry_run_public_blocked",
  "panchang_daily_calculation_bank_batch_01_internally_validated_public_blocked"
];
if (!allowedComputedBankStatuses.includes(bank.status)) fail("Computed daily bank status mismatch.");
if (bank.computed_panchang_daily_record_count !== 7) fail("Computed daily bank count must be 7.");
if (bank.fabricated_value_count !== 0) fail("Fabricated value count must be zero.");
if (bank.external_site_input_count !== 0) fail("External site input count must be zero.");
if (bank.public_output_allowed_now !== false) fail("Public output must be blocked.");
if (!Array.isArray(bank.records) || bank.records.length !== 7) fail("Computed bank must have 7 records.");

for (const record of bank.records) {
  if (!["computed_internal_dry_run_public_blocked", "internally_validated_public_blocked"].includes(record.record_status)) fail(`Record status mismatch: ${record.panchang_daily_record_id}`);
  if (record.computed_values_present !== true) fail(`Computed values missing: ${record.panchang_daily_record_id}`);
  if (record.public_output_allowed !== false) fail(`Public output not blocked: ${record.panchang_daily_record_id}`);
  for (const field of [
    "sunrise_datetime_local",
    "sunset_datetime_local",
    "sun_longitude_sidereal",
    "moon_longitude_sidereal",
    "moon_minus_sun_angular_difference",
    "tithi",
    "nakshatra",
    "yoga",
    "karana",
    "paksha",
    "vara"
  ]) {
    if (record[field] === null || record[field] === undefined) fail(`Missing computed field ${field}: ${record.panchang_daily_record_id}`);
  }
  if (record.tithi.index < 1 || record.tithi.index > 30) fail(`Tithi out of range: ${record.panchang_daily_record_id}`);
  if (record.nakshatra.index < 1 || record.nakshatra.index > 27) fail(`Nakshatra out of range: ${record.panchang_daily_record_id}`);
  if (record.yoga.index < 1 || record.yoga.index > 27) fail(`Yoga out of range: ${record.panchang_daily_record_id}`);
  if (record.karana.index < 1 || record.karana.index > 60) fail(`Karana out of range: ${record.panchang_daily_record_id}`);
}

const updatedBank = readJson("data/knowledge-base/panchang-festival/production/panchang-daily-calculation-bank-batch-01.json");
if (updatedBank.status !== bank.status) fail("Updated daily bank status must match computed bank.");
if (updatedBank.computed_panchang_daily_record_count !== 7) fail("Updated daily bank computed count mismatch.");

const invariant = readJson("data/knowledge-base/panchang-festival/production/ag70k-internal-computation-invariant-report.json");
if (invariant.status !== "internal_computation_invariant_report_passed") fail("Invariant report must pass.");
if (invariant.issue_count !== 0) fail("Invariant issue count must be zero.");
if (invariant.record_count !== 7) fail("Invariant record count must be 7.");

const noExternal = readJson("data/knowledge-base/panchang-festival/production/ag70k-no-external-panchang-source-audit.json");
if (noExternal.status !== "no_external_panchang_source_audit_passed") fail("No external audit status mismatch.");
for (const key of [
  "external_panchang_sites_used_as_source",
  "external_panchang_sites_used_for_data_generation",
  "external_panchang_sites_used_as_runtime_dependency",
  "external_panchang_sites_used_for_public_claim"
]) {
  if (noExternal[key] !== false) fail(`${key} must be false.`);
}
if (noExternal.external_panchang_sites_allowed_only_for_later_manual_post_output_verification !== true) fail("Manual verification allowance missing.");

const noPublic = readJson("data/knowledge-base/panchang-festival/production/ag70k-no-public-output-audit.json");
if (noPublic.status !== "no_public_output_audit_passed") fail("No public output audit status mismatch.");
for (const key of ["public_panchang_output_allowed_now", "generated_word_json_modified", "ui_display_changed", "supabase_activation_performed", "backend_runtime_activated"]) {
  if (noPublic[key] !== false) fail(`${key} must be false.`);
}
for (const key of ["observance_events_created_now", "eclipse_events_created_now", "context_interpretation_records_created_now"]) {
  if (noPublic[key] !== 0) fail(`${key} must be zero.`);
}

const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_internal_panchang_daily_computation_engine_dry_run",
  "production_bank_manifest_created_computed_panchang_daily_bank_internal_validation"
];
if (!allowedPanchangManifestStatuses.includes(panchangManifest.status)) fail("Panchang manifest status mismatch.");
if (panchangManifest.current_counts.panchang_daily_records !== 7) fail("Manifest Panchang daily records must be 7.");
if (panchangManifest.current_counts.computed_internal_dry_run_records !== 7) fail("Manifest dry-run count must be 7.");
if (panchangManifest.current_counts.observance_events !== 0) fail("Observance events must be zero.");
if (panchangManifest.current_counts.eclipse_events !== 0) fail("Eclipse events must be zero.");
if (panchangManifest.current_counts.context_interpretation_records !== 0) fail("Context interpretation records must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70k-internal-panchang-daily-computation-engine-dry-run.json");
if (review.status !== "ag70k_internal_panchang_daily_computation_engine_dry_run_completed") fail("Review status mismatch.");
for (const key of [
  "internal_computation_engine_dry_run_completed",
  "tithi_values_populated",
  "nakshatra_values_populated",
  "yoga_values_populated",
  "karana_values_populated",
  "paksha_values_populated",
  "vara_values_populated",
  "sunrise_sunset_values_populated",
  "solar_lunar_longitude_values_populated",
  "ready_for_ag70l"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
if (review.summary.computed_record_count !== 7) fail("Review computed count must be 7.");
if (review.summary.invariant_issue_count !== 0) fail("Review invariant issue count must be zero.");
if (review.summary.fabricated_panchang_value_count !== 0) fail("Review fabricated count must be zero.");

for (const key of [
  "external_panchang_sites_used_as_source",
  "external_panchang_sites_used_as_runtime_dependency",
  "external_panchang_sites_used_for_data_generation",
  "public_panchang_output_allowed_now",
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

const readiness = readJson("data/content-intelligence/quality-registry/ag70k-ag70l-computed-panchang-daily-bank-internal-validation-readiness-record.json");
if (readiness.ready_for_ag70l !== true) fail("AG70L readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70k-to-ag70l-computed-panchang-daily-bank-internal-validation-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70L boundary must not auto-start.");
for (const blocker of [
  "public Panchang output",
  "actual festival/observance date publication",
  "actual eclipse event publication",
  "context interpretation production records",
  "generated/word-of-day.json replacement",
  "external Panchang site as source of truth",
  "external Panchang site as data-generation input",
  "external Panchang site as runtime dependency",
  "external Panchang site as production validation source"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) fail(`Boundary blocker missing: ${blocker}`);
}

pass("AG70K internal Panchang daily computation engine dry run is valid.");
pass("Seven Batch 01 Panchang records are internally computed with no external source input.");
pass("Public output and downstream observance/context/UI/backend activation remain blocked.");
