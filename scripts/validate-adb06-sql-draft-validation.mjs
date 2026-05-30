import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ ADB06 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb05-sql-migration-draft.json",
  "data/content-intelligence/database-build/sql-drafts/adb05_astro_drishvara_schema_draft.sql",
  "data/content-intelligence/database-build/adb05-sql-draft-manifest.json",
  "data/content-intelligence/backend-architecture/adb05-no-execution-audit.json",
  "data/content-intelligence/backend-architecture/adb05-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb05-adb06-sql-draft-validation-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb05-to-adb06-sql-draft-validation-boundary.json",

  "data/content-intelligence/quality-reviews/adb06-sql-draft-validation.json",
  "data/content-intelligence/database-build/adb06-sql-structural-validation.json",
  "data/content-intelligence/database-build/adb06-draft-label-safety-audit.json",
  "data/content-intelligence/database-build/adb06-base-schema-validation.json",
  "data/content-intelligence/database-build/adb06-calculation-engine-schema-validation.json",
  "data/content-intelligence/backend-architecture/adb06-execution-risk-review.json",
  "data/content-intelligence/backend-architecture/adb06-rls-auth-deferral-review.json",
  "data/content-intelligence/backend-architecture/adb06-seed-insert-blocker-audit.json",
  "data/content-intelligence/backend-architecture/adb06-no-execution-audit.json",
  "data/content-intelligence/backend-architecture/adb06-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb06-adb07-execution-approval-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb06-to-adb07-sql-execution-approval-boundary.json",
  "data/quality/adb06-sql-draft-validation.json",
  "data/quality/adb06-sql-draft-validation-preview.json",
  "docs/quality/ADB06_SQL_DRAFT_VALIDATION.md",
  "scripts/generate-adb06-sql-draft-validation.mjs",
  "scripts/validate-adb06-sql-draft-validation.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb05Review = readJson("data/content-intelligence/quality-reviews/adb05-sql-migration-draft.json");
const adb05Manifest = readJson("data/content-intelligence/database-build/adb05-sql-draft-manifest.json");
const adb05NoExecution = readJson("data/content-intelligence/backend-architecture/adb05-no-execution-audit.json");
const adb05NoMutation = readJson("data/content-intelligence/backend-architecture/adb05-no-mutation-audit-register.json");
const adb05Readiness = readJson("data/content-intelligence/quality-registry/adb05-adb06-sql-draft-validation-readiness-record.json");
const adb05Boundary = readJson("data/content-intelligence/mutation-plans/adb05-to-adb06-sql-draft-validation-boundary.json");

if (adb05Review.status !== "sql_migration_draft_ready_for_adb06") fail("ADB05 review status mismatch.");
if (adb05Review.summary.ready_for_adb06 !== true) fail("ADB05 readiness summary missing.");
if (adb05Manifest.sql_draft_type !== "draft_only_not_executed") fail("ADB05 manifest draft type mismatch.");
if (adb05Manifest.sql_execution_approved !== false) fail("ADB05 SQL execution must be blocked.");
if (adb05NoExecution.audit_passed !== true) fail("ADB05 no-execution audit must pass.");
if (adb05NoMutation.audit_passed !== true) fail("ADB05 no-mutation audit must pass.");
if (adb05Readiness.ready_for_adb06 !== true) fail("ADB05 readiness must permit ADB06.");
if (adb05Boundary.next_stage_id !== "ADB06") fail("ADB05 boundary must point to ADB06.");

const review = readJson("data/content-intelligence/quality-reviews/adb06-sql-draft-validation.json");
const structuralValidation = readJson("data/content-intelligence/database-build/adb06-sql-structural-validation.json");
const draftLabelSafetyAudit = readJson("data/content-intelligence/database-build/adb06-draft-label-safety-audit.json");
const baseSchemaValidation = readJson("data/content-intelligence/database-build/adb06-base-schema-validation.json");
const calculationEngineValidation = readJson("data/content-intelligence/database-build/adb06-calculation-engine-schema-validation.json");
const executionRiskReview = readJson("data/content-intelligence/backend-architecture/adb06-execution-risk-review.json");
const rlsAuthDeferralReview = readJson("data/content-intelligence/backend-architecture/adb06-rls-auth-deferral-review.json");
const seedInsertBlockerAudit = readJson("data/content-intelligence/backend-architecture/adb06-seed-insert-blocker-audit.json");
const noExecutionAudit = readJson("data/content-intelligence/backend-architecture/adb06-no-execution-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/adb06-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb06-adb07-execution-approval-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb06-to-adb07-sql-execution-approval-boundary.json");
const preview = readJson("data/quality/adb06-sql-draft-validation-preview.json");
const pkg = readJson("package.json");

if (review.status !== "sql_draft_validation_ready_for_adb07") fail("ADB06 review status mismatch.");
for (const key of [
  "adb06_sql_draft_validation_recorded",
  "adb05_consumed",
  "structural_validation_recorded",
  "draft_label_safety_audit_recorded",
  "base_schema_validation_recorded",
  "calculation_engine_schema_validation_recorded",
  "execution_risk_review_recorded",
  "rls_auth_deferral_review_recorded",
  "seed_insert_blocker_audit_recorded",
  "ready_for_adb07",
  "sql_draft_validated"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_adb07 !== 0) fail("ADB07 blocker count must be zero.");
if (review.summary.table_count_validated < 53) fail("Table count validation too low.");
for (const key of ["sql_execution_approved", "database_write_approved", "supabase_activation_approved", "seed_insert_approved", "sql_executed", "database_write_performed", "supabase_connection_performed", "supabase_table_created", "supabase_schema_modified", "seed_data_inserted", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed", "runtime_calculation_executed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (structuralValidation.status !== "sql_structural_validation_passed") fail("Structural validation status mismatch.");
if (structuralValidation.validation_result !== "passed_without_execution") fail("Structural validation must pass without execution.");
if (structuralValidation.table_count < 53) fail("Structural table count too low.");
if (structuralValidation.duplicate_tables_found.length !== 0) fail("Duplicate tables must be zero.");
if (structuralValidation.missing_required_tables.length !== 0) fail("Missing required tables must be zero.");
if (structuralValidation.missing_required_fields_or_phrases.length !== 0) fail("Missing required fields must be zero.");
if (structuralValidation.executed !== false) fail("Structural validation must not execute SQL.");

if (draftLabelSafetyAudit.status !== "draft_label_safety_audit_passed") fail("Draft label audit status mismatch.");
for (const label of ["DRAFT_ONLY", "NOT_EXECUTED", "CONSUMES_ADB02_AND_ADB04A", "CONSUMES_M_D_ID_SERIES", "NO_SERVICE_ROLE_KEY", "NO_SEED_INSERT", "NO_RUNTIME_ENGINE_ACTIVATION"]) {
  if (!draftLabelSafetyAudit.required_labels.includes(label)) fail(`Required label missing: ${label}`);
}
if (draftLabelSafetyAudit.audit_passed !== true) fail("Draft label audit must pass.");

if (baseSchemaValidation.status !== "base_schema_validation_passed") fail("Base schema validation status mismatch.");
if (baseSchemaValidation.adb02_base_schema_consumed !== true) fail("ADB02 base schema must be consumed.");
if (!baseSchemaValidation.required_base_tables_checked.includes("panchang_daily_records")) fail("Base schema validation missing panchang_daily_records.");
if (baseSchemaValidation.public_use_safety_fields_present !== true) fail("Public-use fields must be present.");
if (baseSchemaValidation.source_review_fields_present !== true) fail("Source review fields must be present.");

if (calculationEngineValidation.status !== "calculation_engine_schema_validation_passed") fail("Calculation engine validation status mismatch.");
if (calculationEngineValidation.adb04a_extension_consumed !== true) fail("ADB04A extension must be consumed.");
for (const table of ["calculation_profiles", "ephemeris_profiles", "ayanamsha_profiles", "panchanga_calculation_runs", "panchanga_calculation_trace_logs", "validation_learning_cycles"]) {
  if (!calculationEngineValidation.required_engine_tables_checked.includes(table)) fail(`Engine table validation missing: ${table}`);
}
if (calculationEngineValidation.runtime_calculation_executed !== false) fail("Runtime calculation must not execute.");

if (executionRiskReview.status !== "execution_risk_review_recorded") fail("Execution risk status mismatch.");
if (executionRiskReview.execution_approval_status !== "not_approved") fail("Execution approval must remain not approved.");

if (rlsAuthDeferralReview.status !== "rls_auth_deferral_review_passed") fail("RLS/Auth deferral status mismatch.");
if (rlsAuthDeferralReview.rls_auth_activation_status !== "deferred") fail("RLS/Auth must remain deferred.");

if (seedInsertBlockerAudit.status !== "seed_insert_blocker_audit_passed") fail("Seed blocker status mismatch.");
if (seedInsertBlockerAudit.audit_passed !== true) fail("Seed blocker audit must pass.");
if (seedInsertBlockerAudit.insert_into_found !== false) fail("INSERT INTO must not be found.");
if (seedInsertBlockerAudit.copy_found !== false) fail("COPY must not be found.");
if (seedInsertBlockerAudit.seed_data_inserted !== false) fail("Seed data must not be inserted.");

if (noExecutionAudit.status !== "no_execution_audit_passed_for_adb06") fail("No-execution audit status mismatch.");
if (noExecutionAudit.audit_passed !== true) fail("No-execution audit must pass.");
if (noExecutionAudit.failed_checks.length !== 0) fail("No-execution failed checks must be zero.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_adb06") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");

if (readiness.status !== "ready_for_adb07_sql_execution_approval_checkpoint") fail("Readiness status mismatch.");
if (readiness.ready_for_adb07 !== true) fail("ADB07 readiness must be true.");
if (readiness.next_stage_id !== "ADB07") fail("Readiness must point to ADB07.");
if (readiness.sql_execution_allowed_next !== false) fail("SQL execution must remain blocked at ADB06.");
if (readiness.service_role_key_required_next !== false) fail("Service-role key must not be required.");
if (!JSON.stringify(readiness.allowed_next_scope).includes("Open SQL execution approval checkpoint")) fail("ADB07 opening scope missing.");

if (boundary.next_stage_id !== "ADB07") fail("Boundary must point to ADB07.");
if (!boundary.blocked_scope.includes("SQL execution")) fail("SQL execution must be blocked.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role key exposure must be blocked.");

for (const key of [
  "adb06_sql_draft_validation_recorded",
  "adb05_consumed",
  "structural_validation_recorded",
  "draft_label_safety_audit_recorded",
  "base_schema_validation_recorded",
  "calculation_engine_schema_validation_recorded",
  "execution_risk_review_recorded",
  "rls_auth_deferral_review_recorded",
  "seed_insert_blocker_audit_recorded",
  "ready_for_adb07",
  "sql_draft_validated"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_adb07 !== 0) fail("Preview blocker count must be zero.");
if (preview.table_count_validated < 53) fail("Preview table count too low.");
for (const key of ["sql_execution_approved", "database_write_approved", "supabase_activation_approved", "seed_insert_approved", "sql_executed", "database_write_performed", "supabase_connection_performed", "supabase_table_created", "supabase_schema_modified", "seed_data_inserted", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed", "runtime_calculation_executed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb06"]) fail("Missing package script: generate:adb06");
if (!pkg.scripts?.["validate:adb06"]) fail("Missing package script: validate:adb06");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb06")) fail("validate:project must include validate:adb06.");

pass("ADB06 SQL Draft Validation and Safety Review is present.");
pass("ADB05 SQL draft is consumed.");
pass("SQL structural validation passed without execution.");
pass("Draft label safety audit passed.");
pass("Base schema validation passed.");
pass("Calculation-engine schema validation passed.");
pass("Execution risk review is recorded.");
pass("RLS/Auth deferral review passed.");
pass("Seed insert blocker audit passed.");
pass("No-execution audit is valid.");
pass("No-mutation audit is valid.");
pass("ADB07 SQL Execution Approval Checkpoint readiness is valid.");
pass("No SQL execution, DB write, Supabase connection, seed insert, runtime calculation or service-role exposure is recorded.");
