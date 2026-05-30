import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ ADB08 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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
  "data/content-intelligence/database-build/sql-drafts/adb05_astro_drishvara_schema_draft.sql",

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
  "data/quality/adb08-execution-package-runbook-review.json",
  "data/quality/adb08-execution-package-runbook-review-preview.json",
  "scripts/generate-adb08-execution-package-runbook.mjs",
  "scripts/validate-adb08-execution-package-runbook.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb07Review = readJson("data/content-intelligence/quality-reviews/adb07-sql-execution-approval-checkpoint.json");
const adb07Approval = readJson("data/content-intelligence/database-build/adb07-sql-execution-approval-checkpoint.json");
const adb07Decision = readJson("data/content-intelligence/backend-architecture/adb07-execution-decision-record.json");
const adb07NoExecution = readJson("data/content-intelligence/backend-architecture/adb07-no-execution-audit.json");
const adb07NoMutation = readJson("data/content-intelligence/backend-architecture/adb07-no-mutation-audit-register.json");
const adb07Readiness = readJson("data/content-intelligence/quality-registry/adb07-adb08-execution-package-readiness-record.json");
const adb07Boundary = readJson("data/content-intelligence/mutation-plans/adb07-to-adb08-execution-package-boundary.json");

if (adb07Review.status !== "sql_execution_approval_checkpoint_ready_for_adb08_package") fail("ADB07 review status mismatch.");
if (adb07Review.summary.ready_for_adb08_execution_package !== true) fail("ADB07 readiness summary missing.");
if (adb07Approval.decision.live_sql_execution_approved_now !== false) fail("ADB07 must not approve live SQL execution.");
if (adb07Decision.execution_decision !== "deferred") fail("ADB07 execution decision must be deferred.");
if (adb07NoExecution.audit_passed !== true) fail("ADB07 no-execution audit must pass.");
if (adb07NoMutation.audit_passed !== true) fail("ADB07 no-mutation audit must pass.");
if (adb07Readiness.ready_for_adb08 !== true) fail("ADB07 readiness must permit ADB08.");
if (adb07Boundary.next_stage_id !== "ADB08") fail("ADB07 boundary must point to ADB08.");

const review = readJson("data/content-intelligence/quality-reviews/adb08-execution-package-runbook-review.json");
const executionPackage = readJson("data/content-intelligence/database-build/adb08-execution-package.json");
const manualRunbook = read("docs/quality/ADB08_SQL_EXECUTION_MANUAL_RUNBOOK.md");
const operatorPreflightChecklist = readJson("data/content-intelligence/database-build/adb08-operator-preflight-checklist.json");
const schemaCollisionChecklist = readJson("data/content-intelligence/database-build/adb08-schema-collision-checklist.json");
const backupRollbackChecklist = readJson("data/content-intelligence/database-build/adb08-backup-rollback-checklist.json");
const secretHandlingRunbook = readJson("data/content-intelligence/backend-architecture/adb08-secret-handling-runbook.json");
const executionCommandBoundary = readJson("data/content-intelligence/backend-architecture/adb08-execution-command-boundary.json");
const approvalPhraseRegister = readJson("data/content-intelligence/database-build/adb08-live-execution-approval-phrase-register.json");
const noExecutionAudit = readJson("data/content-intelligence/backend-architecture/adb08-no-execution-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/adb08-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb08-adb09-final-execution-approval-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb08-to-adb09-final-execution-approval-boundary.json");
const preview = readJson("data/quality/adb08-execution-package-runbook-review-preview.json");
const pkg = readJson("package.json");

if (review.status !== "execution_package_runbook_ready_for_adb09") fail("ADB08 review status mismatch.");
for (const key of [
  "adb08_execution_package_recorded",
  "adb07_consumed",
  "manual_runbook_recorded",
  "operator_preflight_checklist_recorded",
  "schema_collision_checklist_recorded",
  "backup_rollback_checklist_recorded",
  "secret_handling_runbook_recorded",
  "execution_command_boundary_recorded",
  "approval_phrase_register_recorded",
  "ready_for_adb09_final_execution_approval"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_adb09 !== 0) fail("ADB09 blocker count must be zero.");
for (const key of [
  "sql_execution_approved_now",
  "database_write_approved_now",
  "supabase_connection_approved_now",
  "seed_insert_approved_now",
  "service_role_key_required_now",
  "sql_executed",
  "database_write_performed",
  "supabase_connection_performed",
  "supabase_table_created",
  "supabase_schema_modified",
  "seed_data_inserted",
  "backend_auth_supabase_activation_performed",
  "deployment_performed",
  "service_role_key_exposed",
  "runtime_calculation_executed"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (executionPackage.status !== "execution_package_recorded_for_manual_review_only") fail("Execution package status mismatch.");
if (executionPackage.package_type !== "manual_review_runbook_only") fail("Package must be manual review only.");
if (executionPackage.explicit_non_approvals.sql_execution_approved_now !== false) fail("Execution package must not approve SQL execution.");

for (const phrase of [
  "Do not execute SQL",
  "Do not connect to Supabase",
  "Do not paste service-role key",
  "ADB09 — Final Live SQL Execution Approval Checkpoint"
]) {
  if (!manualRunbook.includes(phrase)) fail(`Manual runbook missing: ${phrase}`);
}

if (operatorPreflightChecklist.current_clearance_status !== "not_cleared_for_execution") fail("Operator preflight must not be cleared.");
if (!JSON.stringify(operatorPreflightChecklist.required_before_final_execution_approval).includes("Confirm exact Supabase project name and project ID")) fail("Operator preflight missing project confirmation.");

if (schemaCollisionChecklist.current_clearance_status !== "not_cleared_for_execution") fail("Schema collision checklist must not be cleared.");
if (!JSON.stringify(schemaCollisionChecklist.required_manual_checks).includes("Check whether each target table already exists")) fail("Schema collision checklist missing table-exists check.");

if (backupRollbackChecklist.current_clearance_status !== "not_cleared_for_execution") fail("Backup/rollback checklist must not be cleared.");
if (!JSON.stringify(backupRollbackChecklist.required_manual_checks).includes("Export current schema metadata before execution")) fail("Backup/rollback checklist missing schema export.");

if (secretHandlingRunbook.service_role_key_required_now !== false) fail("Service-role key must not be required.");
if (secretHandlingRunbook.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");
if (!JSON.stringify(secretHandlingRunbook.rules).includes("Do not paste Supabase service-role key into chat")) fail("Secret handling rule missing.");

if (executionCommandBoundary.no_execution_command_generated !== true) fail("No execution command must be generated.");
for (const blocked of ["Run psql command.", "Run Supabase CLI command.", "Execute SQL in Supabase dashboard."]) {
  if (!executionCommandBoundary.blocked_now.includes(blocked)) fail(`Execution boundary missing blocked command: ${blocked}`);
}

if (approvalPhraseRegister.approval_phrase_not_given_in_adb08 !== true) fail("Approval phrase must not be given in ADB08.");
if (approvalPhraseRegister.required_future_approval_phrase !== "APPROVE LIVE SQL EXECUTION AFTER ADB09 REVIEW") fail("Approval phrase mismatch.");
if (!approvalPhraseRegister.not_covered_by_phrase.includes("seed data insertion")) fail("Seed insertion must not be covered by execution phrase.");

if (noExecutionAudit.status !== "no_execution_audit_passed_for_adb08") fail("No-execution audit status mismatch.");
if (noExecutionAudit.audit_passed !== true) fail("No-execution audit must pass.");
if (noExecutionAudit.failed_checks.length !== 0) fail("No-execution failed checks must be zero.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_adb08") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");

if (readiness.status !== "ready_for_adb09_final_execution_approval_checkpoint") fail("Readiness status mismatch.");
if (readiness.ready_for_adb09 !== true) fail("ADB09 readiness must be true.");
if (readiness.next_stage_id !== "ADB09") fail("Readiness must point to ADB09.");
if (!JSON.stringify(readiness.adb09_allowed_scope).includes("Decide whether live schema-only SQL execution may be approved")) fail("ADB09 approval decision scope missing.");
if (!readiness.always_blocked_until_later_stage.includes("seed data insertion")) fail("Seed insertion must stay later-stage blocked.");

if (boundary.next_stage_id !== "ADB09") fail("Boundary must point to ADB09.");
if (!boundary.blocked_scope_until_explicit_phrase.includes("SQL execution")) fail("SQL execution must be blocked until explicit phrase.");
if (!boundary.always_blocked_until_later_stage.includes("service-role key exposure in repo/chat")) fail("Service-role key exposure must remain blocked.");

for (const key of [
  "adb08_execution_package_recorded",
  "adb07_consumed",
  "manual_runbook_recorded",
  "operator_preflight_checklist_recorded",
  "schema_collision_checklist_recorded",
  "backup_rollback_checklist_recorded",
  "secret_handling_runbook_recorded",
  "execution_command_boundary_recorded",
  "approval_phrase_register_recorded",
  "ready_for_adb09_final_execution_approval"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_adb09 !== 0) fail("Preview blocker count must be zero.");
for (const key of [
  "sql_execution_approved_now",
  "database_write_approved_now",
  "supabase_connection_approved_now",
  "seed_insert_approved_now",
  "service_role_key_required_now",
  "sql_executed",
  "database_write_performed",
  "supabase_connection_performed",
  "supabase_table_created",
  "supabase_schema_modified",
  "seed_data_inserted",
  "backend_auth_supabase_activation_performed",
  "deployment_performed",
  "service_role_key_exposed",
  "runtime_calculation_executed"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb08"]) fail("Missing package script: generate:adb08");
if (!pkg.scripts?.["validate:adb08"]) fail("Missing package script: validate:adb08");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb08")) fail("validate:project must include validate:adb08.");

pass("ADB08 SQL Execution Package and Manual Runbook Review is present.");
pass("ADB07 execution approval checkpoint is consumed.");
pass("Manual runbook is recorded.");
pass("Operator preflight checklist is recorded.");
pass("Schema-collision checklist is recorded.");
pass("Backup/rollback checklist is recorded.");
pass("Secret-handling runbook is recorded.");
pass("Execution command boundary blocks live execution.");
pass("Future approval phrase register is valid.");
pass("No-execution audit is valid.");
pass("No-mutation audit is valid.");
pass("ADB09 Final Execution Approval readiness is valid.");
pass("No SQL execution, DB write, Supabase connection, seed insert, runtime calculation or service-role exposure is recorded.");
