import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ ADB07 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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
  "data/content-intelligence/database-build/sql-drafts/adb05_astro_drishvara_schema_draft.sql",

  "data/content-intelligence/quality-reviews/adb07-sql-execution-approval-checkpoint.json",
  "data/content-intelligence/database-build/adb07-sql-execution-approval-checkpoint.json",
  "data/content-intelligence/backend-architecture/adb07-execution-decision-record.json",
  "data/content-intelligence/database-build/adb07-live-supabase-readiness-checklist.json",
  "data/content-intelligence/database-build/adb07-schema-collision-review-plan.json",
  "data/content-intelligence/database-build/adb07-backup-rollback-requirements.json",
  "data/content-intelligence/backend-architecture/adb07-secret-handling-gate.json",
  "data/content-intelligence/backend-architecture/adb07-execution-deferral-register.json",
  "data/content-intelligence/backend-architecture/adb07-no-execution-audit.json",
  "data/content-intelligence/backend-architecture/adb07-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb07-adb08-execution-package-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb07-to-adb08-execution-package-boundary.json",
  "data/quality/adb07-sql-execution-approval-checkpoint.json",
  "data/quality/adb07-sql-execution-approval-checkpoint-preview.json",
  "docs/quality/ADB07_SQL_EXECUTION_APPROVAL_CHECKPOINT.md",
  "scripts/generate-adb07-sql-execution-approval-checkpoint.mjs",
  "scripts/validate-adb07-sql-execution-approval-checkpoint.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb06Review = readJson("data/content-intelligence/quality-reviews/adb06-sql-draft-validation.json");
const adb06StructuralValidation = readJson("data/content-intelligence/database-build/adb06-sql-structural-validation.json");
const adb06CalculationEngineValidation = readJson("data/content-intelligence/database-build/adb06-calculation-engine-schema-validation.json");
const adb06ExecutionRiskReview = readJson("data/content-intelligence/backend-architecture/adb06-execution-risk-review.json");
const adb06RlsAuthDeferralReview = readJson("data/content-intelligence/backend-architecture/adb06-rls-auth-deferral-review.json");
const adb06SeedInsertBlockerAudit = readJson("data/content-intelligence/backend-architecture/adb06-seed-insert-blocker-audit.json");
const adb06NoExecutionAudit = readJson("data/content-intelligence/backend-architecture/adb06-no-execution-audit.json");
const adb06NoMutationAudit = readJson("data/content-intelligence/backend-architecture/adb06-no-mutation-audit-register.json");
const adb06Readiness = readJson("data/content-intelligence/quality-registry/adb06-adb07-execution-approval-readiness-record.json");
const adb06Boundary = readJson("data/content-intelligence/mutation-plans/adb06-to-adb07-sql-execution-approval-boundary.json");

if (adb06Review.status !== "sql_draft_validation_ready_for_adb07") fail("ADB06 review status mismatch.");
if (adb06Review.summary.ready_for_adb07 !== true) fail("ADB06 readiness summary missing.");
if (adb06StructuralValidation.validation_result !== "passed_without_execution") fail("ADB06 structural validation must pass without execution.");
if (adb06CalculationEngineValidation.validation_result !== "passed") fail("ADB06 calculation-engine validation must pass.");
if (adb06ExecutionRiskReview.execution_approval_status !== "not_approved") fail("ADB06 execution approval must remain not approved.");
if (adb06RlsAuthDeferralReview.rls_auth_activation_status !== "deferred") fail("ADB06 RLS/Auth must remain deferred.");
if (adb06SeedInsertBlockerAudit.seed_data_inserted !== false) fail("ADB06 seed insertion must remain false.");
if (adb06NoExecutionAudit.audit_passed !== true) fail("ADB06 no-execution audit must pass.");
if (adb06NoMutationAudit.audit_passed !== true) fail("ADB06 no-mutation audit must pass.");
if (adb06Readiness.ready_for_adb07 !== true) fail("ADB06 readiness must permit ADB07.");
if (adb06Readiness.sql_execution_allowed_next !== false) fail("ADB06 must not allow SQL execution.");
if (adb06Boundary.next_stage_id !== "ADB07") fail("ADB06 boundary must point to ADB07.");

const review = readJson("data/content-intelligence/quality-reviews/adb07-sql-execution-approval-checkpoint.json");
const approvalCheckpoint = readJson("data/content-intelligence/database-build/adb07-sql-execution-approval-checkpoint.json");
const executionDecisionRecord = readJson("data/content-intelligence/backend-architecture/adb07-execution-decision-record.json");
const liveSupabaseReadinessChecklist = readJson("data/content-intelligence/database-build/adb07-live-supabase-readiness-checklist.json");
const schemaCollisionReviewPlan = readJson("data/content-intelligence/database-build/adb07-schema-collision-review-plan.json");
const backupRollbackRequirements = readJson("data/content-intelligence/database-build/adb07-backup-rollback-requirements.json");
const secretHandlingGate = readJson("data/content-intelligence/backend-architecture/adb07-secret-handling-gate.json");
const executionDeferralRegister = readJson("data/content-intelligence/backend-architecture/adb07-execution-deferral-register.json");
const noExecutionAudit = readJson("data/content-intelligence/backend-architecture/adb07-no-execution-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/adb07-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb07-adb08-execution-package-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb07-to-adb08-execution-package-boundary.json");
const preview = readJson("data/quality/adb07-sql-execution-approval-checkpoint-preview.json");
const pkg = readJson("package.json");

if (review.status !== "sql_execution_approval_checkpoint_ready_for_adb08_package") fail("ADB07 review status mismatch.");
for (const key of [
  "adb07_sql_execution_approval_checkpoint_recorded",
  "adb06_consumed",
  "validated_sql_draft_acknowledged",
  "live_supabase_readiness_checklist_recorded",
  "schema_collision_review_plan_recorded",
  "backup_rollback_requirements_recorded",
  "secret_handling_gate_recorded",
  "execution_deferral_recorded",
  "ready_for_adb08_execution_package"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_adb08 !== 0) fail("ADB08 blocker count must be zero.");
for (const key of ["live_sql_execution_approved_now", "sql_execution_allowed_now", "database_write_allowed_now", "supabase_connection_allowed_now", "seed_insert_allowed_now", "service_role_key_required_now", "sql_executed", "database_write_performed", "supabase_connection_performed", "supabase_table_created", "supabase_schema_modified", "seed_data_inserted", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed", "runtime_calculation_executed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (approvalCheckpoint.status !== "sql_execution_approval_checkpoint_recorded_execution_not_approved") fail("Approval checkpoint status mismatch.");
if (approvalCheckpoint.checkpoint_result !== "validated_sql_draft_acknowledged_but_live_execution_not_approved") fail("Approval checkpoint result mismatch.");
if (approvalCheckpoint.decision.live_sql_execution_approved_now !== false) fail("Live execution must not be approved.");
if (approvalCheckpoint.decision.sql_execution_allowed_now !== false) fail("SQL execution must remain blocked.");
if (approvalCheckpoint.decision.service_role_key_required_now !== false) fail("Service-role key must not be required.");

if (executionDecisionRecord.status !== "execution_deferred_pending_manual_approval") fail("Execution decision status mismatch.");
if (executionDecisionRecord.execution_decision !== "deferred") fail("Execution decision must be deferred.");
if (executionDecisionRecord.current_stage_allows_execution !== false) fail("ADB07 must not allow execution.");

if (liveSupabaseReadinessChecklist.status !== "live_supabase_readiness_checklist_recorded") fail("Live Supabase checklist status mismatch.");
for (const phrase of ["Confirm exact Supabase project name and project ID", "Confirm backup or rollback option", "Confirm no production user data is at risk"]) {
  if (!JSON.stringify(liveSupabaseReadinessChecklist.required_before_any_execution).includes(phrase)) fail(`Readiness checklist missing: ${phrase}`);
}

if (schemaCollisionReviewPlan.status !== "schema_collision_review_plan_recorded") fail("Schema collision plan status mismatch.");
if (schemaCollisionReviewPlan.execution_blocked_until_review !== true) fail("Execution must be blocked until schema review.");

if (backupRollbackRequirements.status !== "backup_rollback_requirements_recorded") fail("Backup/rollback status mismatch.");
if (backupRollbackRequirements.destructive_sql_allowed !== false) fail("Destructive SQL must not be allowed.");

if (secretHandlingGate.status !== "secret_handling_gate_recorded") fail("Secret handling gate status mismatch.");
if (secretHandlingGate.service_role_key_required_now !== false) fail("Service-role key must not be required.");
if (secretHandlingGate.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");

if (executionDeferralRegister.status !== "sql_execution_deferred_after_adb07") fail("Execution deferral status mismatch.");
for (const phrase of ["does not approve live execution", "SQL execution remains blocked", "Seed insertion remains blocked"]) {
  if (!JSON.stringify(executionDeferralRegister.deferral_rules).includes(phrase)) fail(`Execution deferral rule missing: ${phrase}`);
}

if (noExecutionAudit.status !== "no_execution_audit_passed_for_adb07") fail("No-execution audit status mismatch.");
if (noExecutionAudit.audit_passed !== true) fail("No-execution audit must pass.");
if (noExecutionAudit.failed_checks.length !== 0) fail("No-execution failed checks must be zero.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_adb07") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");

if (readiness.status !== "ready_for_adb08_execution_package_review") fail("Readiness status mismatch.");
if (readiness.ready_for_adb08 !== true) fail("ADB08 readiness must be true.");
if (readiness.next_stage_id !== "ADB08") fail("Readiness must point to ADB08.");
if (!JSON.stringify(readiness.adb08_allowed_scope).includes("Prepare execution package/runbook for manual review")) fail("ADB08 package scope missing.");
if (!readiness.adb08_blocked_scope.includes("SQL execution")) fail("SQL execution must remain blocked in ADB08.");

if (boundary.next_stage_id !== "ADB08") fail("Boundary must point to ADB08.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role exposure must remain blocked.");

for (const key of [
  "adb07_sql_execution_approval_checkpoint_recorded",
  "adb06_consumed",
  "validated_sql_draft_acknowledged",
  "live_supabase_readiness_checklist_recorded",
  "schema_collision_review_plan_recorded",
  "backup_rollback_requirements_recorded",
  "secret_handling_gate_recorded",
  "execution_deferral_recorded",
  "ready_for_adb08_execution_package"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_adb08 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["live_sql_execution_approved_now", "sql_execution_allowed_now", "database_write_allowed_now", "supabase_connection_allowed_now", "seed_insert_allowed_now", "service_role_key_required_now", "sql_executed", "database_write_performed", "supabase_connection_performed", "supabase_table_created", "supabase_schema_modified", "seed_data_inserted", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed", "runtime_calculation_executed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb07"]) fail("Missing package script: generate:adb07");
if (!pkg.scripts?.["validate:adb07"]) fail("Missing package script: validate:adb07");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb07")) fail("validate:project must include validate:adb07.");

pass("ADB07 SQL Execution Approval Checkpoint is present.");
pass("ADB06 SQL draft validation is consumed.");
pass("Validated SQL draft is acknowledged.");
pass("Live SQL execution is not approved yet.");
pass("Live Supabase readiness checklist is recorded.");
pass("Schema collision review plan is recorded.");
pass("Backup/rollback requirements are recorded.");
pass("Secret handling gate is recorded.");
pass("Execution deferral is valid.");
pass("No-execution audit is valid.");
pass("No-mutation audit is valid.");
pass("ADB08 Execution Package readiness is valid.");
pass("No SQL execution, DB write, Supabase connection, seed insert, runtime calculation or service-role exposure is recorded.");
