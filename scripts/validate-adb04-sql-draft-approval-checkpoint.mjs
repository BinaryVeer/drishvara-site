import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ ADB04 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb03-local-schema-validation.json",
  "data/content-intelligence/database-build/adb03-table-coverage-audit.json",
  "data/content-intelligence/database-build/adb03-field-coverage-audit.json",
  "data/content-intelligence/database-build/adb03-relationship-consistency-audit.json",
  "data/content-intelligence/database-build/adb03-index-constraint-dry-run-review.json",
  "data/content-intelligence/database-build/adb03-public-use-safety-field-audit.json",
  "data/content-intelligence/database-build/adb03-sql-draft-readiness-recommendation.json",
  "data/content-intelligence/backend-architecture/adb03-no-sql-no-db-write-audit.json",
  "data/content-intelligence/backend-architecture/adb03-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb03-adb04-sql-draft-approval-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb03-to-adb04-sql-draft-approval-boundary.json",

  "data/content-intelligence/quality-reviews/adb04-sql-draft-approval-checkpoint.json",
  "data/content-intelligence/database-build/adb04-sql-draft-approval-checkpoint.json",
  "data/content-intelligence/database-build/adb04-sql-draft-scope-register.json",
  "data/content-intelligence/database-build/adb04-migration-draft-guardrails.json",
  "data/content-intelligence/backend-architecture/adb04-sql-execution-deferral-register.json",
  "data/content-intelligence/backend-architecture/adb04-security-gate-confirmation.json",
  "data/content-intelligence/backend-architecture/adb04-no-sql-no-db-write-audit.json",
  "data/content-intelligence/backend-architecture/adb04-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb04-adb05-sql-migration-draft-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb04-to-adb05-sql-migration-draft-boundary.json",
  "data/quality/adb04-sql-draft-approval-checkpoint.json",
  "data/quality/adb04-sql-draft-approval-checkpoint-preview.json",
  "docs/quality/ADB04_SQL_DRAFT_APPROVAL_CHECKPOINT.md",
  "scripts/generate-adb04-sql-draft-approval-checkpoint.mjs",
  "scripts/validate-adb04-sql-draft-approval-checkpoint.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb03Review = readJson("data/content-intelligence/quality-reviews/adb03-local-schema-validation.json");
const adb03TableCoverage = readJson("data/content-intelligence/database-build/adb03-table-coverage-audit.json");
const adb03FieldCoverage = readJson("data/content-intelligence/database-build/adb03-field-coverage-audit.json");
const adb03RelationshipAudit = readJson("data/content-intelligence/database-build/adb03-relationship-consistency-audit.json");
const adb03IndexDryRun = readJson("data/content-intelligence/database-build/adb03-index-constraint-dry-run-review.json");
const adb03PublicSafetyAudit = readJson("data/content-intelligence/database-build/adb03-public-use-safety-field-audit.json");
const adb03SqlRecommendation = readJson("data/content-intelligence/database-build/adb03-sql-draft-readiness-recommendation.json");
const adb03NoSqlAudit = readJson("data/content-intelligence/backend-architecture/adb03-no-sql-no-db-write-audit.json");
const adb03NoMutationAudit = readJson("data/content-intelligence/backend-architecture/adb03-no-mutation-audit-register.json");
const adb03Readiness = readJson("data/content-intelligence/quality-registry/adb03-adb04-sql-draft-approval-readiness-record.json");
const adb03Boundary = readJson("data/content-intelligence/mutation-plans/adb03-to-adb04-sql-draft-approval-boundary.json");

if (adb03Review.status !== "local_schema_validation_ready_for_adb04") fail("ADB03 review status mismatch.");
if (adb03Review.summary.ready_for_adb04 !== true) fail("ADB03 readiness summary missing.");
if (adb03TableCoverage.audit_passed !== true) fail("ADB03 table coverage must pass.");
if (adb03FieldCoverage.audit_passed !== true) fail("ADB03 field coverage must pass.");
if (adb03RelationshipAudit.audit_passed !== true) fail("ADB03 relationship audit must pass.");
if (adb03IndexDryRun.audit_passed !== true) fail("ADB03 index dry-run must pass.");
if (adb03PublicSafetyAudit.audit_passed !== true) fail("ADB03 public safety audit must pass.");
if (adb03SqlRecommendation.explicit_non_approval.sql_draft_approved !== false) fail("ADB03 SQL draft must not already be approved.");
if (adb03NoSqlAudit.audit_passed !== true) fail("ADB03 no SQL/no DB audit must pass.");
if (adb03NoMutationAudit.audit_passed !== true) fail("ADB03 no-mutation audit must pass.");
if (adb03Readiness.ready_for_adb04 !== true) fail("ADB03 readiness must permit ADB04.");
if (adb03Boundary.next_stage_id !== "ADB04") fail("ADB03 boundary must point to ADB04.");

const review = readJson("data/content-intelligence/quality-reviews/adb04-sql-draft-approval-checkpoint.json");
const approvalCheckpoint = readJson("data/content-intelligence/database-build/adb04-sql-draft-approval-checkpoint.json");
const sqlDraftScopeRegister = readJson("data/content-intelligence/database-build/adb04-sql-draft-scope-register.json");
const migrationDraftGuardrails = readJson("data/content-intelligence/database-build/adb04-migration-draft-guardrails.json");
const executionDeferralRegister = readJson("data/content-intelligence/backend-architecture/adb04-sql-execution-deferral-register.json");
const securityGateConfirmation = readJson("data/content-intelligence/backend-architecture/adb04-security-gate-confirmation.json");
const noSqlAudit = readJson("data/content-intelligence/backend-architecture/adb04-no-sql-no-db-write-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/adb04-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb04-adb05-sql-migration-draft-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb04-to-adb05-sql-migration-draft-boundary.json");
const preview = readJson("data/quality/adb04-sql-draft-approval-checkpoint-preview.json");
const pkg = readJson("package.json");

if (review.status !== "sql_draft_approval_checkpoint_ready_for_adb05") fail("ADB04 review status mismatch.");
for (const key of [
  "adb04_sql_draft_approval_checkpoint_recorded",
  "adb03_consumed",
  "sql_draft_scope_register_recorded",
  "migration_draft_guardrails_recorded",
  "execution_deferral_recorded",
  "security_gate_confirmation_recorded",
  "no_sql_no_db_write_audit_recorded",
  "ready_for_adb05",
  "sql_draft_generation_approved_for_adb05"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_adb05 !== 0) fail("ADB05 blocker count must be zero.");
for (const key of ["sql_draft_created", "sql_execution_approved", "database_write_approved", "supabase_activation_approved", "seed_insert_approved", "service_role_key_required", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "seed_data_inserted", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (approvalCheckpoint.status !== "sql_draft_approval_checkpoint_recorded") fail("Approval checkpoint status mismatch.");
if (approvalCheckpoint.checkpoint_result !== "approved_for_sql_migration_draft_generation_in_adb05_only") fail("Approval checkpoint result mismatch.");
if (approvalCheckpoint.approval_scope.sql_draft_generation_approved_for_adb05 !== true) fail("SQL draft generation must be approved for ADB05.");
if (approvalCheckpoint.approval_scope.sql_execution_approved !== false) fail("SQL execution must remain blocked.");
if (approvalCheckpoint.approval_scope.database_write_approved !== false) fail("DB write must remain blocked.");
if (approvalCheckpoint.approval_scope.service_role_key_required !== false) fail("Service-role key must not be required.");

if (sqlDraftScopeRegister.status !== "sql_draft_scope_register_recorded") fail("SQL draft scope register status mismatch.");
for (const label of ["DRAFT_ONLY", "NOT_EXECUTED", "REVIEW_REQUIRED", "NO_SERVICE_ROLE_KEY", "NO_SEED_INSERT"]) {
  if (!sqlDraftScopeRegister.required_draft_labels.includes(label)) fail(`Required draft label missing: ${label}`);
}
for (const blocked of ["Run SQL", "Connect to Supabase", "Use service-role key", "Insert seed data"]) {
  if (!sqlDraftScopeRegister.adb05_blocked_scope.includes(blocked)) fail(`ADB05 blocked scope missing: ${blocked}`);
}

if (migrationDraftGuardrails.status !== "migration_draft_guardrails_recorded") fail("Migration draft guardrails status mismatch.");
for (const phrase of ["ADB05 may create SQL text as a draft file only", "ADB05 must not execute SQL", "ADB05 must not connect to Supabase"]) {
  if (!JSON.stringify(migrationDraftGuardrails.guardrails).includes(phrase)) fail(`Migration guardrail missing: ${phrase}`);
}

if (executionDeferralRegister.status !== "sql_execution_deferred_after_adb04") fail("Execution deferral status mismatch.");
for (const phrase of ["SQL execution is not approved", "Database write is not approved", "Service-role key is not required"]) {
  if (!JSON.stringify(executionDeferralRegister.deferral_rules).includes(phrase)) fail(`Execution deferral rule missing: ${phrase}`);
}

if (securityGateConfirmation.status !== "security_gate_confirmed_for_sql_draft_only") fail("Security gate confirmation status mismatch.");
for (const phrase of ["No service-role key in chat", "No service-role key in repo", "No SQL execution before explicit later approval"]) {
  if (!JSON.stringify(securityGateConfirmation.confirmed_rules).includes(phrase)) fail(`Security confirmation missing: ${phrase}`);
}

if (noSqlAudit.status !== "no_sql_no_database_write_audit_passed_for_adb04") fail("No SQL/no DB audit status mismatch.");
if (noSqlAudit.audit_passed !== true) fail("No SQL/no DB audit must pass.");
if (noSqlAudit.failed_checks.length !== 0) fail("No SQL/no DB failed checks must be zero.");
for (const check of noSqlAudit.checks) {
  if (check.passed !== true) fail(`No SQL/no DB check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_adb04") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");

if (readiness.status !== "ready_for_adb05_sql_migration_draft_generation") fail("Readiness status mismatch.");
if (readiness.ready_for_adb05 !== true) fail("ADB05 readiness must be true.");
if (readiness.next_stage_id !== "ADB05") fail("Readiness must point to ADB05.");
if (readiness.sql_draft_generation_allowed_next !== true) fail("ADB05 SQL draft generation must be allowed.");
if (readiness.sql_execution_allowed_next !== false) fail("ADB05 SQL execution must remain blocked.");
if (readiness.service_role_key_required_next !== false) fail("ADB05 service-role key must not be required.");

if (boundary.next_stage_id !== "ADB05") fail("Boundary must point to ADB05.");
if (!JSON.stringify(boundary.allowed_scope).includes("Generate SQL migration draft file only")) fail("ADB05 SQL draft scope missing.");
if (!boundary.blocked_scope.includes("SQL execution")) fail("SQL execution must remain blocked.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role key exposure must remain blocked.");

for (const key of [
  "adb04_sql_draft_approval_checkpoint_recorded",
  "adb03_consumed",
  "sql_draft_scope_register_recorded",
  "migration_draft_guardrails_recorded",
  "execution_deferral_recorded",
  "security_gate_confirmation_recorded",
  "no_sql_no_db_write_audit_recorded",
  "ready_for_adb05",
  "sql_draft_generation_approved_for_adb05"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_adb05 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["sql_draft_created", "sql_execution_approved", "database_write_approved", "supabase_activation_approved", "seed_insert_approved", "service_role_key_required", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "seed_data_inserted", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb04"]) fail("Missing package script: generate:adb04");
if (!pkg.scripts?.["validate:adb04"]) fail("Missing package script: validate:adb04");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb04")) fail("validate:project must include validate:adb04.");

pass("ADB04 SQL Draft Approval Checkpoint is present.");
pass("ADB03 validation is consumed.");
pass("SQL draft generation is approved for ADB05 only.");
pass("SQL draft scope register is valid.");
pass("Migration draft guardrails are valid.");
pass("SQL execution deferral is valid.");
pass("Security gate confirmation is valid.");
pass("No SQL / no database write audit is valid.");
pass("No-mutation audit is valid.");
pass("ADB05 SQL Migration Draft Generation readiness is valid.");
pass("No SQL file, DB write, Supabase activation, seed insert, deployment or service-role exposure is recorded.");
