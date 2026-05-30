import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ ADB01 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adz-astro-drishvara-data-foundation-closure.json",
  "data/content-intelligence/closure-records/adz-astro-drishvara-data-foundation-closure.json",
  "data/content-intelligence/quality-registry/adz-adb01-database-build-approval-readiness-record.json",
  "data/content-intelligence/quality-registry/adz-carry-forward-register.json",
  "data/content-intelligence/mutation-plans/adz-to-adb01-database-build-approval-boundary.json",
  "data/content-intelligence/backend-architecture/adz-no-mutation-audit-register.json",

  "data/content-intelligence/quality-reviews/adb01-database-build-approval-checkpoint.json",
  "data/content-intelligence/database-build/adb01-database-build-approval-checkpoint.json",
  "data/content-intelligence/database-build/adb01-build-path-decision-matrix.json",
  "data/content-intelligence/backend-architecture/adb01-security-gate-register.json",
  "data/content-intelligence/backend-architecture/adb01-no-sql-no-db-write-audit.json",
  "data/content-intelligence/backend-architecture/adb01-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb01-adb02-local-schema-dictionary-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb01-to-adb02-local-schema-dictionary-boundary.json",
  "data/quality/adb01-database-build-approval-checkpoint.json",
  "data/quality/adb01-database-build-approval-checkpoint-preview.json",
  "docs/quality/ADB01_DATABASE_BUILD_APPROVAL_CHECKPOINT.md",
  "scripts/generate-adb01-database-build-approval-checkpoint.mjs",
  "scripts/validate-adb01-database-build-approval-checkpoint.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adzReview = readJson("data/content-intelligence/quality-reviews/adz-astro-drishvara-data-foundation-closure.json");
const adzClosure = readJson("data/content-intelligence/closure-records/adz-astro-drishvara-data-foundation-closure.json");
const adzReadiness = readJson("data/content-intelligence/quality-registry/adz-adb01-database-build-approval-readiness-record.json");
const adzBoundary = readJson("data/content-intelligence/mutation-plans/adz-to-adb01-database-build-approval-boundary.json");
const adzNoMutation = readJson("data/content-intelligence/backend-architecture/adz-no-mutation-audit-register.json");

if (adzReview.status !== "astro_drishvara_data_foundation_closed_ready_for_adb01") fail("ADZ review status mismatch.");
if (adzClosure.next_stage_id !== "ADB01") fail("ADZ closure must point to ADB01.");
if (adzReadiness.ready_for_adb01 !== true) fail("ADZ readiness must permit ADB01.");
if (adzBoundary.next_stage_id !== "ADB01") fail("ADZ boundary must point to ADB01.");
if (adzNoMutation.audit_passed !== true) fail("ADZ no-mutation audit must pass.");

const review = readJson("data/content-intelligence/quality-reviews/adb01-database-build-approval-checkpoint.json");
const approvalCheckpoint = readJson("data/content-intelligence/database-build/adb01-database-build-approval-checkpoint.json");
const buildPathDecisionMatrix = readJson("data/content-intelligence/database-build/adb01-build-path-decision-matrix.json");
const securityGateRegister = readJson("data/content-intelligence/backend-architecture/adb01-security-gate-register.json");
const noSqlNoDbWriteAudit = readJson("data/content-intelligence/backend-architecture/adb01-no-sql-no-db-write-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/adb01-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb01-adb02-local-schema-dictionary-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb01-to-adb02-local-schema-dictionary-boundary.json");
const preview = readJson("data/quality/adb01-database-build-approval-checkpoint-preview.json");
const pkg = readJson("package.json");

if (review.status !== "database_build_approval_checkpoint_ready_for_adb02") fail("ADB01 review status mismatch.");
for (const key of [
  "adb01_database_build_approval_checkpoint_recorded",
  "adz_consumed",
  "build_path_decision_matrix_recorded",
  "security_gate_register_recorded",
  "no_sql_no_db_write_audit_recorded",
  "selected_path_local_schema_dictionary_first",
  "ready_for_adb02"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_adb02 !== 0) fail("ADB02 blocker count must be zero.");
for (const key of ["sql_draft_approved", "sql_execution_approved", "database_write_approved", "supabase_activation_approved", "seed_insert_approved", "service_role_key_required", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "backend_auth_supabase_activation_performed", "seed_data_inserted", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (approvalCheckpoint.status !== "database_build_approval_checkpoint_recorded") fail("Approval checkpoint status mismatch.");
if (approvalCheckpoint.selected_path !== "local_schema_dictionary_first") fail("Selected path must be local_schema_dictionary_first.");
if (approvalCheckpoint.explicit_non_approvals.sql_draft_approved !== false) fail("SQL draft must not be approved.");
if (approvalCheckpoint.explicit_non_approvals.sql_execution_approved !== false) fail("SQL execution must not be approved.");

if (buildPathDecisionMatrix.status !== "build_path_decision_matrix_recorded") fail("Decision matrix status mismatch.");
if (buildPathDecisionMatrix.selected_next_stage !== "ADB02") fail("Next stage must be ADB02.");
if (!JSON.stringify(buildPathDecisionMatrix.options).includes("supabase_direct_execution")) fail("Supabase direct execution option missing.");
if (!JSON.stringify(buildPathDecisionMatrix.options).includes("blocked")) fail("Blocked option missing.");

if (securityGateRegister.status !== "security_gate_register_recorded") fail("Security gate status mismatch.");
for (const phrase of ["Do not paste service-role keys", "Do not commit service-role keys", "Do not run SQL against Supabase"]) {
  if (!JSON.stringify(securityGateRegister.security_rules).includes(phrase)) fail(`Security rule missing: ${phrase}`);
}

if (noSqlNoDbWriteAudit.status !== "no_sql_no_database_write_audit_passed_for_adb01") fail("No SQL/no DB audit status mismatch.");
if (noSqlNoDbWriteAudit.audit_passed !== true) fail("No SQL/no DB audit must pass.");
if (noSqlNoDbWriteAudit.failed_checks.length !== 0) fail("No SQL/no DB failed checks must be zero.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_adb01") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");

if (readiness.status !== "ready_for_adb02_local_schema_dictionary_relationship_blueprint") fail("Readiness status mismatch.");
if (readiness.ready_for_adb02 !== true) fail("ADB02 readiness must be true.");
if (readiness.next_stage_id !== "ADB02") fail("Readiness must point to ADB02.");
if (!JSON.stringify(readiness.allowed_next_scope).includes("Create table dictionary")) fail("Table dictionary scope missing.");
if (readiness.blocked_next_scope.includes("SQL creation") !== true) fail("SQL creation must be blocked.");

if (boundary.next_stage_id !== "ADB02") fail("Boundary must point to ADB02.");
if (!JSON.stringify(boundary.allowed_scope).includes("Create field dictionary")) fail("Field dictionary scope missing.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role key exposure must be blocked.");

for (const key of [
  "adb01_database_build_approval_checkpoint_recorded",
  "adz_consumed",
  "build_path_decision_matrix_recorded",
  "security_gate_register_recorded",
  "no_sql_no_db_write_audit_recorded",
  "selected_path_local_schema_dictionary_first",
  "ready_for_adb02"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_adb02 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["sql_draft_approved", "sql_execution_approved", "database_write_approved", "supabase_activation_approved", "seed_insert_approved", "service_role_key_required", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "backend_auth_supabase_activation_performed", "seed_data_inserted", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb01"]) fail("Missing package script: generate:adb01");
if (!pkg.scripts?.["validate:adb01"]) fail("Missing package script: validate:adb01");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb01")) fail("validate:project must include validate:adb01.");

pass("ADB01 Database Build Approval Checkpoint is present.");
pass("ADZ closure is consumed.");
pass("Local schema dictionary-first path is selected.");
pass("Security gate is valid.");
pass("No SQL / no database write audit is valid.");
pass("No-mutation audit is valid.");
pass("ADB02 Local Schema Dictionary readiness is valid.");
pass("No SQL, DB write, Supabase activation, seed insert, deployment or service-role exposure is recorded.");
