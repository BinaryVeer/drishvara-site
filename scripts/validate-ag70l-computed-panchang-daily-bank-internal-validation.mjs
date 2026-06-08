import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70L validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70l-computed-panchang-daily-bank-internal-validation.mjs",
  "scripts/validate-ag70l-computed-panchang-daily-bank-internal-validation.mjs",
  "data/knowledge-base/panchang-festival/production/ag70l-computed-panchang-daily-bank-internal-validation.json",
  "data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json",
  "data/knowledge-base/panchang-festival/production/panchang-computed-daily-bank-batch-01-internal-dry-run.json",
  "data/knowledge-base/panchang-festival/production/panchang-daily-calculation-bank-batch-01.json",
  "data/knowledge-base/panchang-festival/production/ag70l-internal-formula-validation-report.json",
  "data/knowledge-base/panchang-festival/production/ag70l-time-window-boundary-validation-report.json",
  "data/knowledge-base/panchang-festival/production/ag70l-locked-basis-validation-report.json",
  "data/knowledge-base/panchang-festival/production/ag70l-no-external-panchang-validation-source-audit.json",
  "data/knowledge-base/panchang-festival/production/ag70l-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag70l-computed-panchang-daily-bank-internal-validation.json",
  "data/content-intelligence/quality-registry/ag70l-ag70m-festival-observance-rule-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70l-to-ag70m-festival-observance-rule-bank-boundary.json",
  "data/quality/ag70l-computed-panchang-daily-bank-internal-validation.json",
  "data/quality/ag70l-computed-panchang-daily-bank-internal-validation-preview.json",
  "docs/quality/AG70L_COMPUTED_PANCHANG_DAILY_BANK_INTERNAL_VALIDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70l"]) fail("Missing generate:ag70l script.");
if (!pkg.scripts?.["validate:ag70l"]) fail("Missing validate:ag70l script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70l")) fail("validate:project must include validate:ag70l.");

const validation = readJson("data/knowledge-base/panchang-festival/production/ag70l-computed-panchang-daily-bank-internal-validation.json");
if (validation.status !== "ag70l_computed_panchang_daily_bank_internal_validation_completed") fail("Validation run status mismatch.");
if (validation.validation_source !== "internal_model_only") fail("Validation source must be internal only.");
if (validation.external_panchang_sites_used_for_validation !== false) fail("External Panchang sites must not be used for validation.");
if (validation.record_count !== 7) fail("Validation record count must be 7.");
if (validation.passed_record_count !== 7) fail("Passed record count must be 7.");
if (validation.issue_count !== 0) fail("Issue count must be zero.");

const bank = readJson("data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json");
if (bank.status !== "panchang_daily_calculation_bank_batch_01_internally_validated_public_blocked") fail("Validated daily bank status mismatch.");
if (bank.internal_validation_status !== "passed") fail("Internal validation status must pass.");
if (bank.internal_validation_issue_count !== 0) fail("Validated bank issue count must be zero.");
if (bank.internally_validated_record_count !== 7) fail("Validated record count must be 7.");
if (bank.external_site_validation_count !== 0) fail("External site validation count must be zero.");
if (bank.public_output_allowed_now !== false) fail("Public output must be blocked.");

for (const record of bank.records) {
  if (record.record_status !== "internally_validated_public_blocked") fail(`Record not internally validated: ${record.panchang_daily_record_id}`);
  if (record.internal_validation_status !== "internal_validation_passed") fail(`Record validation not passed: ${record.panchang_daily_record_id}`);
  if (record.public_output_allowed !== false) fail(`Public output not blocked: ${record.panchang_daily_record_id}`);
}

const computed = readJson("data/knowledge-base/panchang-festival/production/panchang-computed-daily-bank-batch-01-internal-dry-run.json");
if (computed.status !== bank.status) fail("Computed bank should be updated to validated status.");
if (computed.internal_validation_issue_count !== 0) fail("Computed bank issue count must be zero.");

const daily = readJson("data/knowledge-base/panchang-festival/production/panchang-daily-calculation-bank-batch-01.json");
if (daily.status !== bank.status) fail("Daily bank should be updated to validated status.");
if (daily.internally_validated_record_count !== 7) fail("Daily bank validated count must be 7.");

const formula = readJson("data/knowledge-base/panchang-festival/production/ag70l-internal-formula-validation-report.json");
if (formula.status !== "internal_formula_validation_passed") fail("Formula validation must pass.");
if (formula.issue_count !== 0) fail("Formula issue count must be zero.");

for (const record of formula.records) {
  if (record.issue_count !== 0) fail(`Formula issue found: ${record.panchang_daily_record_id}`);
  for (const check of record.formula_checks) {
    if (check.passed !== true) fail(`Formula check failed: ${record.panchang_daily_record_id} ${check.check}`);
  }
}

const boundaryReport = readJson("data/knowledge-base/panchang-festival/production/ag70l-time-window-boundary-validation-report.json");
if (boundaryReport.status !== "time_window_boundary_validation_passed") fail("Boundary validation must pass.");
for (const record of boundaryReport.records) {
  for (const check of record.boundary_checks) {
    if (check.passed !== true) fail(`Boundary check failed: ${record.panchang_daily_record_id} ${check.check}`);
  }
}

const locked = readJson("data/knowledge-base/panchang-festival/production/ag70l-locked-basis-validation-report.json");
if (locked.status !== "locked_basis_validation_passed") fail("Locked-basis validation must pass.");
for (const record of locked.records) {
  for (const check of record.locked_basis_checks) {
    if (check.passed !== true) fail(`Locked-basis check failed: ${record.panchang_daily_record_id} ${check.check}`);
  }
}

const noExternal = readJson("data/knowledge-base/panchang-festival/production/ag70l-no-external-panchang-validation-source-audit.json");
if (noExternal.status !== "no_external_panchang_validation_source_audit_passed") fail("No external validation audit status mismatch.");
for (const key of [
  "external_panchang_sites_used_as_source",
  "external_panchang_sites_used_for_data_generation",
  "external_panchang_sites_used_as_runtime_dependency",
  "external_panchang_sites_used_as_production_validation_source",
  "external_panchang_sites_used_for_public_claim"
]) {
  if (noExternal[key] !== false) fail(`${key} must be false.`);
}
if (noExternal.external_validation_reference_count !== 0) fail("External validation reference count must be zero.");

const noPublic = readJson("data/knowledge-base/panchang-festival/production/ag70l-no-public-output-audit.json");
if (noPublic.status !== "no_public_output_audit_passed") fail("No public output audit status mismatch.");
for (const key of ["public_panchang_output_allowed_now", "generated_word_json_modified", "ui_display_changed", "supabase_activation_performed", "backend_runtime_activated"]) {
  if (noPublic[key] !== false) fail(`${key} must be false.`);
}
for (const key of ["observance_events_created_now", "eclipse_events_created_now", "context_interpretation_records_created_now"]) {
  if (noPublic[key] !== 0) fail(`${key} must be zero.`);
}

const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
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
  "production_bank_manifest_created_location_intelligence_foundation_closure"
];
if (!allowedPanchangManifestStatuses.includes(panchangManifest.status)) fail("Panchang manifest status mismatch.");
if (panchangManifest.current_counts.panchang_daily_records !== 7) fail("Panchang daily records count must be 7.");
if (panchangManifest.current_counts.internally_validated_panchang_daily_records !== 7) fail("Validated count must be 7.");
if (panchangManifest.current_counts.internal_validation_issue_count !== 0) fail("Validation issue count must be zero.");
if (![0, 2].includes(panchangManifest.current_counts.observance_events)) fail("Observance events must be 0 before AG70N or 2 after AG70N internal candidate generation.");
if (panchangManifest.current_counts.eclipse_events !== 0) fail("Eclipse events must be zero.");
if (![0, 7].includes(panchangManifest.current_counts.context_interpretation_records)) fail("Context records must be 0 before AG70Q or 7 after AG70Q internal context-bank creation.");

const review = readJson("data/content-intelligence/quality-reviews/ag70l-computed-panchang-daily-bank-internal-validation.json");
if (review.status !== "ag70l_computed_panchang_daily_bank_internal_validation_completed") fail("Review status mismatch.");
for (const key of [
  "internal_validation_completed",
  "internal_validation_passed",
  "formula_validation_completed",
  "boundary_validation_completed",
  "locked_basis_validation_completed",
  "external_panchang_sites_allowed_only_later_for_manual_comparison",
  "ready_for_ag70m"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "external_panchang_sites_used_as_validation_source",
  "external_panchang_sites_used_as_source_of_truth",
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
if (review.summary.validated_record_count !== 7) fail("Review validated count must be 7.");
if (review.summary.internal_validation_issue_count !== 0) fail("Review issue count must be zero.");

const readiness = readJson("data/content-intelligence/quality-registry/ag70l-ag70m-festival-observance-rule-bank-readiness-record.json");
if (readiness.ready_for_ag70m !== true) fail("AG70M readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70l-to-ag70m-festival-observance-rule-bank-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70M boundary must not auto-start.");
for (const blocker of [
  "public Panchang output",
  "actual festival/observance event publication",
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

pass("AG70L computed Panchang daily bank internal validation is valid.");
pass("All seven records pass internal formula, boundary and locked-basis validation.");
pass("External Panchang sites remain excluded from production validation.");
pass("Public output and downstream activation remain blocked.");
