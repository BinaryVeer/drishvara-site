import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ ADB09 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb08-execution-package-runbook-review.json",
  "data/content-intelligence/database-build/adb08-execution-package.json",
  "docs/quality/ADB08_SQL_EXECUTION_MANUAL_RUNBOOK.md",
  "data/content-intelligence/database-build/adb08-operator-preflight-checklist.json",
  "data/content-intelligence/database-build/adb08-schema-collision-checklist.json",
  "data/content-intelligence/database-build/adb08-backup-rollback-checklist.json",
  "data/content-intelligence/backend-architecture/adb08-secret-handling-runbook.json",
  "data/content-intelligence/backend-architecture/adb08-execution-command-boundary.json",
  "data/content-intelligence/database-build/adb08-live-execution-approval-phrase-register.json",
  "data/content-intelligence/backend-architecture/adb08-no-execution-audit.json",
  "data/content-intelligence/backend-architecture/adb08-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb08-adb09-final-execution-approval-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb08-to-adb09-final-execution-approval-boundary.json",
  "data/content-intelligence/database-build/sql-drafts/adb05_astro_drishvara_schema_draft.sql",

  "data/content-intelligence/quality-reviews/adb09-final-execution-approval-checkpoint.json",
  "data/content-intelligence/database-build/adb09-final-live-sql-execution-approval-record.json",
  "data/content-intelligence/database-build/adb09-schema-only-execution-scope.json",
  "data/content-intelligence/backend-architecture/adb09-remaining-blockers-register.json",
  "data/content-intelligence/database-build/adb09-operator-responsibility-notice.json",
  "data/content-intelligence/database-build/adb09-pre-execution-reconfirmation-checklist.json",
  "data/content-intelligence/backend-architecture/adb09-secret-handling-confirmation.json",
  "data/content-intelligence/backend-architecture/adb09-no-execution-audit.json",
  "data/content-intelligence/backend-architecture/adb09-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb09-adb10-live-schema-execution-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb09-to-adb10-live-schema-execution-boundary.json",
  "data/quality/adb09-final-execution-approval-checkpoint.json",
  "data/quality/adb09-final-execution-approval-checkpoint-preview.json",
  "docs/quality/ADB09_FINAL_EXECUTION_APPROVAL_CHECKPOINT.md",
  "scripts/generate-adb09-final-execution-approval-checkpoint.mjs",
  "scripts/validate-adb09-final-execution-approval-checkpoint.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb08Review = readJson("data/content-intelligence/quality-reviews/adb08-execution-package-runbook-review.json");
const adb08ExecutionPackage = readJson("data/content-intelligence/database-build/adb08-execution-package.json");
const adb08Preflight = readJson("data/content-intelligence/database-build/adb08-operator-preflight-checklist.json");
const adb08SchemaCollision = readJson("data/content-intelligence/database-build/adb08-schema-collision-checklist.json");
const adb08BackupRollback = readJson("data/content-intelligence/database-build/adb08-backup-rollback-checklist.json");
const adb08SecretRunbook = readJson("data/content-intelligence/backend-architecture/adb08-secret-handling-runbook.json");
const adb08CommandBoundary = readJson("data/content-intelligence/backend-architecture/adb08-execution-command-boundary.json");
const adb08NoExecution = readJson("data/content-intelligence/backend-architecture/adb08-no-execution-audit.json");
const adb08NoMutation = readJson("data/content-intelligence/backend-architecture/adb08-no-mutation-audit-register.json");
const adb08Readiness = readJson("data/content-intelligence/quality-registry/adb08-adb09-final-execution-approval-readiness-record.json");
const adb08Boundary = readJson("data/content-intelligence/mutation-plans/adb08-to-adb09-final-execution-approval-boundary.json");

if (adb08Review.status !== "execution_package_runbook_ready_for_adb09") fail("ADB08 review status mismatch.");
if (adb08Review.summary.ready_for_adb09_final_execution_approval !== true) fail("ADB08 readiness summary missing.");
if (adb08ExecutionPackage.package_type !== "manual_review_runbook_only") fail("ADB08 package type mismatch.");
if (adb08ExecutionPackage.explicit_non_approvals.sql_execution_approved_now !== false) fail("ADB08 must not approve execution.");
if (adb08Preflight.current_clearance_status !== "not_cleared_for_execution") fail("ADB08 preflight must not be cleared.");
if (adb08SchemaCollision.current_clearance_status !== "not_cleared_for_execution") fail("ADB08 schema collision must not be cleared.");
if (adb08BackupRollback.current_clearance_status !== "not_cleared_for_execution") fail("ADB08 backup/rollback must not be cleared.");
if (adb08SecretRunbook.service_role_key_exposed !== false) fail("ADB08 must not expose service-role key.");
if (adb08CommandBoundary.no_execution_command_generated !== true) fail("ADB08 must not generate execution command.");
if (adb08NoExecution.audit_passed !== true) fail("ADB08 no-execution audit must pass.");
if (adb08NoMutation.audit_passed !== true) fail("ADB08 no-mutation audit must pass.");
if (adb08Readiness.ready_for_adb09 !== true) fail("ADB08 readiness must permit ADB09.");
if (adb08Boundary.next_stage_id !== "ADB09") fail("ADB08 boundary must point to ADB09.");

const review = readJson("data/content-intelligence/quality-reviews/adb09-final-execution-approval-checkpoint.json");
const finalApprovalRecord = readJson("data/content-intelligence/database-build/adb09-final-live-sql-execution-approval-record.json");
const schemaOnlyExecutionScope = readJson("data/content-intelligence/database-build/adb09-schema-only-execution-scope.json");
const remainingBlockersRegister = readJson("data/content-intelligence/backend-architecture/adb09-remaining-blockers-register.json");
const operatorResponsibilityNotice = readJson("data/content-intelligence/database-build/adb09-operator-responsibility-notice.json");
const preExecutionReconfirmationChecklist = readJson("data/content-intelligence/database-build/adb09-pre-execution-reconfirmation-checklist.json");
const secretHandlingConfirmation = readJson("data/content-intelligence/backend-architecture/adb09-secret-handling-confirmation.json");
const noExecutionAudit = readJson("data/content-intelligence/backend-architecture/adb09-no-execution-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/adb09-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb09-adb10-live-schema-execution-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb09-to-adb10-live-schema-execution-boundary.json");
const preview = readJson("data/quality/adb09-final-execution-approval-checkpoint-preview.json");
const pkg = readJson("package.json");

if (review.status !== "schema_only_live_sql_execution_approved_ready_for_adb10") fail("ADB09 review status mismatch.");
for (const key of [
  "adb09_final_execution_approval_recorded",
  "adb08_consumed",
  "final_schema_only_execution_approval_recorded",
  "schema_only_execution_scope_recorded",
  "operator_responsibility_notice_recorded",
  "pre_execution_reconfirmation_checklist_recorded",
  "ready_for_adb10_live_schema_execution",
  "schema_only_sql_execution_approved_for_adb10",
  "database_schema_write_approved_for_adb10",
  "supabase_connection_approved_for_adb10_operator_side"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_adb10 !== 0) fail("ADB10 blocker count must be zero.");
for (const key of [
  "sql_executed_in_adb09",
  "database_write_performed_in_adb09",
  "supabase_connection_performed_in_adb09",
  "seed_insert_approved",
  "seed_data_inserted",
  "runtime_calculation_approved",
  "runtime_calculation_executed",
  "backend_auth_supabase_activation_approved",
  "deployment_approved",
  "service_role_key_exposed"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (finalApprovalRecord.status !== "schema_only_live_sql_execution_approved_for_adb10") fail("Final approval status mismatch.");
if (finalApprovalRecord.approval_scope.schema_only_sql_execution_approved_for_adb10 !== true) fail("Schema-only SQL execution must be approved for ADB10.");
if (finalApprovalRecord.approval_scope.seed_insert_approved !== false) fail("Seed insert must remain blocked.");
if (finalApprovalRecord.approval_scope.runtime_calculation_approved !== false) fail("Runtime calculation must remain blocked.");
if (finalApprovalRecord.execution_status_in_adb09.sql_executed !== false) fail("ADB09 must not execute SQL.");

if (schemaOnlyExecutionScope.status !== "schema_only_execution_scope_recorded") fail("Schema-only scope status mismatch.");
if (!schemaOnlyExecutionScope.allowed_in_adb10_if_operator_confirms_preflight.includes("Execute the reviewed ADB05 SQL schema draft manually.")) fail("ADB10 execution scope missing manual execution.");
if (!schemaOnlyExecutionScope.not_allowed_in_adb10.includes("Insert seed data.")) fail("Seed insert must not be allowed in ADB10.");

if (!remainingBlockersRegister.still_blocked_after_adb09.includes("Seed data insertion")) fail("Seed data insertion blocker missing.");
if (!remainingBlockersRegister.still_blocked_after_adb09.includes("Runtime calculation execution")) fail("Runtime calculation blocker missing.");

if (!JSON.stringify(operatorResponsibilityNotice.notice).includes("No seed INSERT/COPY is approved")) fail("Operator notice must block seed insert.");

if (preExecutionReconfirmationChecklist.current_status !== "ready_for_adb10_operator_confirmation") fail("Pre-execution checklist status mismatch.");
if (!JSON.stringify(preExecutionReconfirmationChecklist.required_before_adb10_execution).includes("Confirm Supabase project: Drishvara Phase-I")) fail("Project confirmation missing.");
if (!JSON.stringify(preExecutionReconfirmationChecklist.required_before_adb10_execution).includes("pajlabwwszmhjhabxprf")) fail("Project ID confirmation missing.");

if (secretHandlingConfirmation.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");
if (!JSON.stringify(secretHandlingConfirmation.rules).includes("No service-role key is needed in chat")) fail("Secret handling chat rule missing.");

if (noExecutionAudit.status !== "no_execution_audit_passed_for_adb09") fail("No-execution audit status mismatch.");
if (noExecutionAudit.audit_passed !== true) fail("No-execution audit must pass.");
if (noExecutionAudit.failed_checks.length !== 0) fail("No-execution failed checks must be zero.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_adb09") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");

if (readiness.status !== "ready_for_adb10_live_schema_only_execution") fail("Readiness status mismatch.");
if (readiness.ready_for_adb10 !== true) fail("ADB10 readiness must be true.");
if (readiness.next_stage_id !== "ADB10") fail("Readiness must point to ADB10.");
if (readiness.adb10_execution_scope_approved !== true) fail("ADB10 execution scope must be approved.");
if (!readiness.adb10_blocked_scope.includes("Seed data insertion")) fail("ADB10 seed insert blocker missing.");
if (!readiness.adb10_blocked_scope.includes("Service-role key exposure in repo/chat")) fail("ADB10 service-role blocker missing.");

if (boundary.next_stage_id !== "ADB10") fail("Boundary must point to ADB10.");
if (!boundary.allowed_scope.includes("Execute ADB05 SQL draft manually in the approved Supabase project.")) fail("ADB10 allowed execution scope missing.");
if (!boundary.blocked_scope.includes("Runtime calculation execution")) fail("Runtime calculation must remain blocked.");

for (const key of [
  "adb09_final_execution_approval_recorded",
  "adb08_consumed",
  "final_schema_only_execution_approval_recorded",
  "schema_only_execution_scope_recorded",
  "operator_responsibility_notice_recorded",
  "pre_execution_reconfirmation_checklist_recorded",
  "ready_for_adb10_live_schema_execution",
  "schema_only_sql_execution_approved_for_adb10",
  "database_schema_write_approved_for_adb10",
  "supabase_connection_approved_for_adb10_operator_side"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_adb10 !== 0) fail("Preview blocker count must be zero.");
for (const key of [
  "sql_executed_in_adb09",
  "database_write_performed_in_adb09",
  "supabase_connection_performed_in_adb09",
  "seed_insert_approved",
  "seed_data_inserted",
  "runtime_calculation_approved",
  "runtime_calculation_executed",
  "backend_auth_supabase_activation_approved",
  "deployment_approved",
  "service_role_key_exposed"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb09"]) fail("Missing package script: generate:adb09");
if (!pkg.scripts?.["validate:adb09"]) fail("Missing package script: validate:adb09");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb09")) fail("validate:project must include validate:adb09.");

pass("ADB09 Final Live SQL Execution Approval Checkpoint is present.");
pass("ADB08 execution package is consumed.");
pass("Schema-only live SQL execution is approved for ADB10.");
pass("ADB10 live schema-only execution readiness is valid.");
pass("Seed insertion remains blocked.");
pass("Runtime calculation remains blocked.");
pass("Backend/Auth/Supabase activation remains blocked.");
pass("Deployment remains blocked.");
pass("Service-role key exposure remains blocked.");
pass("No SQL execution, DB write or Supabase connection is performed in ADB09.");
