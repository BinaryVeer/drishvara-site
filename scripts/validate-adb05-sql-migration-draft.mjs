import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ ADB05 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb04a-legacy-methodology-alignment-audit.json",
  "data/content-intelligence/database-build/adb04a-adb02-schema-extension-delta.json",
  "data/content-intelligence/database-build/adb04a-calculation-engine-schema-requirements.json",
  "data/content-intelligence/database-build/adb04a-revised-adb05-sql-draft-scope.json",
  "data/content-intelligence/backend-architecture/adb04a-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb04a-adb05-revised-sql-draft-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb04a-to-adb05-revised-sql-migration-draft-boundary.json",
  "data/content-intelligence/quality-reviews/adb04-sql-draft-approval-checkpoint.json",
  "data/content-intelligence/database-build/adb04-sql-draft-approval-checkpoint.json",
  "data/content-intelligence/database-build/adb02-table-dictionary.json",
  "data/content-intelligence/database-build/adb02-field-dictionary.json",

  "data/content-intelligence/quality-reviews/adb05-sql-migration-draft.json",
  "data/content-intelligence/database-build/sql-drafts/adb05_astro_drishvara_schema_draft.sql",
  "data/content-intelligence/database-build/adb05-sql-draft-manifest.json",
  "data/content-intelligence/database-build/adb05-legacy-consumption-map.json",
  "data/content-intelligence/database-build/adb05-base-schema-coverage-map.json",
  "data/content-intelligence/database-build/adb05-calculation-engine-coverage-map.json",
  "data/content-intelligence/database-build/adb05-duplicate-avoidance-audit.json",
  "data/content-intelligence/backend-architecture/adb05-no-execution-audit.json",
  "data/content-intelligence/backend-architecture/adb05-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb05-adb06-sql-draft-validation-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb05-to-adb06-sql-draft-validation-boundary.json",
  "data/quality/adb05-sql-migration-draft.json",
  "data/quality/adb05-sql-migration-draft-preview.json",
  "docs/quality/ADB05_SQL_MIGRATION_DRAFT.md",
  "scripts/generate-adb05-sql-migration-draft.mjs",
  "scripts/validate-adb05-sql-migration-draft.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb04aReview = readJson("data/content-intelligence/quality-reviews/adb04a-legacy-methodology-alignment-audit.json");
const adb04aDelta = readJson("data/content-intelligence/database-build/adb04a-adb02-schema-extension-delta.json");
const adb04aCalculationRequirements = readJson("data/content-intelligence/database-build/adb04a-calculation-engine-schema-requirements.json");
const adb04aScope = readJson("data/content-intelligence/database-build/adb04a-revised-adb05-sql-draft-scope.json");
const adb04aNoMutation = readJson("data/content-intelligence/backend-architecture/adb04a-no-mutation-audit-register.json");
const adb04aReadiness = readJson("data/content-intelligence/quality-registry/adb04a-adb05-revised-sql-draft-readiness-record.json");
const adb04aBoundary = readJson("data/content-intelligence/mutation-plans/adb04a-to-adb05-revised-sql-migration-draft-boundary.json");
const adb04Approval = readJson("data/content-intelligence/database-build/adb04-sql-draft-approval-checkpoint.json");

if (adb04aReview.status !== "legacy_methodology_alignment_ready_for_adb05") fail("ADB04A review status mismatch.");
if (adb04aReview.summary.ready_for_adb05_revised_sql_draft !== true) fail("ADB04A readiness summary missing.");
if (!JSON.stringify(adb04aDelta).includes("calculation_profiles")) fail("ADB04A delta missing calculation_profiles.");
if (!JSON.stringify(adb04aDelta).includes("panchanga_calculation_trace_logs")) fail("ADB04A delta missing trace logs.");
if (!JSON.stringify(adb04aCalculationRequirements.required_formula_support).includes("tithi_from_moon_sun_angular_separation")) fail("ADB04A formula support missing tithi.");
if (!JSON.stringify(adb04aScope.required_draft_labels).includes("CONSUMES_M_D_ID_SERIES")) fail("ADB04A revised scope must consume M/D/ID.");
if (adb04aNoMutation.audit_passed !== true) fail("ADB04A no-mutation audit must pass.");
if (adb04aReadiness.ready_for_adb05 !== true) fail("ADB04A readiness must permit ADB05.");
if (adb04aReadiness.sql_execution_allowed_next !== false) fail("ADB04A must block SQL execution.");
if (adb04aBoundary.next_stage_id !== "ADB05") fail("ADB04A boundary must point to ADB05.");
if (adb04Approval.approval_scope.sql_draft_generation_approved_for_adb05 !== true) fail("ADB04 must approve SQL draft generation.");

const review = readJson("data/content-intelligence/quality-reviews/adb05-sql-migration-draft.json");
const sql = read("data/content-intelligence/database-build/sql-drafts/adb05_astro_drishvara_schema_draft.sql");
const manifest = readJson("data/content-intelligence/database-build/adb05-sql-draft-manifest.json");
const legacyConsumptionMap = readJson("data/content-intelligence/database-build/adb05-legacy-consumption-map.json");
const baseSchemaCoverageMap = readJson("data/content-intelligence/database-build/adb05-base-schema-coverage-map.json");
const calculationEngineCoverageMap = readJson("data/content-intelligence/database-build/adb05-calculation-engine-coverage-map.json");
const duplicateAvoidanceAudit = readJson("data/content-intelligence/database-build/adb05-duplicate-avoidance-audit.json");
const noExecutionAudit = readJson("data/content-intelligence/backend-architecture/adb05-no-execution-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/adb05-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb05-adb06-sql-draft-validation-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb05-to-adb06-sql-draft-validation-boundary.json");
const preview = readJson("data/quality/adb05-sql-migration-draft-preview.json");
const pkg = readJson("package.json");

if (review.status !== "sql_migration_draft_ready_for_adb06") fail("ADB05 review status mismatch.");
for (const key of [
  "adb05_sql_migration_draft_recorded",
  "adb04a_consumed",
  "adb02_base_schema_consumed",
  "legacy_m_d_id_consumed",
  "base_schema_tables_drafted",
  "calculation_engine_extension_tables_drafted",
  "sql_draft_file_created",
  "sql_draft_manifest_recorded",
  "ready_for_adb06"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_adb06 !== 0) fail("ADB06 blocker count must be zero.");
if (review.summary.total_tables_drafted < 50) fail("Expected at least 50 drafted tables including base + extension.");
for (const key of ["sql_execution_approved", "database_write_approved", "supabase_activation_approved", "seed_insert_approved", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "seed_data_inserted", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed", "runtime_calculation_executed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

for (const label of ["DRAFT_ONLY", "NOT_EXECUTED", "CONSUMES_ADB02_AND_ADB04A", "CONSUMES_M_D_ID_SERIES", "NO_SERVICE_ROLE_KEY", "NO_SEED_INSERT", "NO_RUNTIME_ENGINE_ACTIVATION"]) {
  if (!sql.includes(label)) fail(`SQL draft label missing: ${label}`);
  if (!manifest.draft_labels.includes(label)) fail(`Manifest label missing: ${label}`);
}

for (const table of [
  "source_authorities",
  "panchang_daily_records",
  "regional_calendar_profiles",
  "word_corpus",
  "vedic_guidance_rules",
  "calculation_profiles",
  "ephemeris_profiles",
  "ayanamsha_profiles",
  "location_time_profiles",
  "astronomical_input_snapshots",
  "panchanga_formula_rules",
  "panchanga_calculation_runs",
  "panchanga_calculation_trace_logs",
  "tithi_vrat_rule_families",
  "festival_observance_rule_registry",
  "daily_guidance_rule_sets",
  "word_of_day_rotation_rules",
  "mantra_source_review_registry",
  "validation_learning_cycles",
  "calculation_variance_records"
]) {
  if (!sql.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) fail(`SQL draft missing table: ${table}`);
}

for (const phrase of [
  "solar_longitude",
  "lunar_longitude",
  "sidereal_conversion_basis",
  "interpolation_or_root_finding_method",
  "software_library_version",
  "sunrise_basis",
  "moonrise_basis",
  "public_use_allowed",
  "editorial_review_status",
  "claim_risk_level"
]) {
  if (!sql.includes(phrase)) fail(`SQL draft missing required field/phrase: ${phrase}`);
}

if (manifest.status !== "sql_draft_manifest_recorded") fail("Manifest status mismatch.");
if (manifest.sql_draft_type !== "draft_only_not_executed") fail("Manifest draft type mismatch.");
if (manifest.sql_execution_approved !== false) fail("Manifest must keep SQL execution blocked.");
if (manifest.database_write_approved !== false) fail("Manifest must keep DB write blocked.");
if (manifest.seed_insert_approved !== false) fail("Manifest must keep seed insert blocked.");
if (manifest.service_role_key_required !== false) fail("Manifest must not require service-role key.");
if (manifest.total_tables_drafted < 50) fail("Manifest table count too low.");

if (legacyConsumptionMap.status !== "legacy_consumption_map_recorded") fail("Legacy consumption map status mismatch.");
for (const legacy of ["M01", "M02", "M03 and D05", "M04", "M04A", "D01-D04", "D06"]) {
  if (!JSON.stringify(legacyConsumptionMap.mapped_legacy_to_sql).includes(legacy)) fail(`Legacy map missing: ${legacy}`);
}

if (baseSchemaCoverageMap.status !== "base_schema_coverage_map_recorded") fail("Base schema coverage status mismatch.");
if (!baseSchemaCoverageMap.adb02_base_tables_covered.includes("panchang_daily_records")) fail("Base schema coverage missing panchang_daily_records.");
if (baseSchemaCoverageMap.adb02_public_use_safety_fields_preserved !== true) fail("Public-use safety fields must be preserved.");

if (calculationEngineCoverageMap.status !== "calculation_engine_coverage_map_recorded") fail("Calculation engine coverage status mismatch.");
for (const formula of ["tithi_from_moon_sun_angular_separation", "nakshatra_from_sidereal_moon_longitude", "yoga_from_sidereal_sun_plus_moon_longitude", "karana_from_half_tithi_sequence", "sunrise_sunset_moonrise_event_window_support"]) {
  if (!calculationEngineCoverageMap.formula_support_covered.includes(formula)) fail(`Formula coverage missing: ${formula}`);
}
for (const trace of ["ephemeris_source", "ayanamsha_source", "solar_longitude", "lunar_longitude", "software_library_version", "calculation_timestamp"]) {
  if (!calculationEngineCoverageMap.trace_fields_covered.includes(trace)) fail(`Trace coverage missing: ${trace}`);
}
if (calculationEngineCoverageMap.runtime_calculation_executed !== false) fail("Runtime calculation must not execute.");

if (duplicateAvoidanceAudit.status !== "duplicate_avoidance_audit_passed") fail("Duplicate avoidance status mismatch.");
if (duplicateAvoidanceAudit.audit_passed !== true) fail("Duplicate avoidance audit must pass.");
if (duplicateAvoidanceAudit.failed_checks.length !== 0) fail("Duplicate avoidance failed checks must be zero.");

if (noExecutionAudit.status !== "no_execution_audit_passed_for_adb05") fail("No-execution audit status mismatch.");
if (noExecutionAudit.audit_passed !== true) fail("No-execution audit must pass.");
if (noExecutionAudit.failed_checks.length !== 0) fail("No-execution failed checks must be zero.");
for (const check of noExecutionAudit.checks) {
  if (check.passed !== true) fail(`No-execution check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_adb05") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");

if (readiness.status !== "ready_for_adb06_sql_draft_validation") fail("Readiness status mismatch.");
if (readiness.ready_for_adb06 !== true) fail("ADB06 readiness must be true.");
if (readiness.next_stage_id !== "ADB06") fail("Readiness must point to ADB06.");
if (!JSON.stringify(readiness.allowed_next_scope).includes("Validate draft SQL syntax structurally without executing it")) fail("ADB06 validation scope missing.");
if (!readiness.blocked_next_scope.includes("SQL execution")) fail("SQL execution must remain blocked.");
if (!readiness.blocked_next_scope.includes("service-role key exposure")) fail("Service-role key exposure must remain blocked.");

if (boundary.next_stage_id !== "ADB06") fail("Boundary must point to ADB06.");
if (!JSON.stringify(boundary.allowed_scope).includes("Validate ADB04A calculation-engine extension coverage")) fail("ADB06 calculation extension validation scope missing.");
if (!boundary.blocked_scope.includes("Supabase connection")) fail("Supabase connection must remain blocked.");

for (const key of [
  "adb05_sql_migration_draft_recorded",
  "adb04a_consumed",
  "adb02_base_schema_consumed",
  "legacy_m_d_id_consumed",
  "base_schema_tables_drafted",
  "calculation_engine_extension_tables_drafted",
  "sql_draft_file_created",
  "sql_draft_manifest_recorded",
  "ready_for_adb06"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_adb06 !== 0) fail("Preview blocker count must be zero.");
if (preview.total_tables_drafted < 50) fail("Preview total table count too low.");
for (const key of ["sql_execution_approved", "database_write_approved", "supabase_activation_approved", "seed_insert_approved", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "seed_data_inserted", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed", "runtime_calculation_executed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb05"]) fail("Missing package script: generate:adb05");
if (!pkg.scripts?.["validate:adb05"]) fail("Missing package script: validate:adb05");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb05")) fail("validate:project must include validate:adb05.");

pass("ADB05 SQL Migration Draft is present.");
pass("ADB04A revised scope is consumed.");
pass("ADB02 base schema is consumed.");
pass("M/D/ID legacy methodology alignment is consumed.");
pass("Draft SQL file is present and labelled DRAFT_ONLY / NOT_EXECUTED.");
pass("Base schema tables are drafted.");
pass("Calculation-engine extension tables are drafted.");
pass("Legacy consumption map is valid.");
pass("Calculation engine coverage map is valid.");
pass("Duplicate avoidance audit passed.");
pass("No-execution audit is valid.");
pass("No-mutation audit is valid.");
pass("ADB06 SQL Draft Validation readiness is valid.");
pass("No SQL execution, DB write, Supabase connection, seed insert, runtime calculation or service-role exposure is recorded.");
