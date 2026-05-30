import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ ADB10 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb09-final-execution-approval-checkpoint.json",
  "data/content-intelligence/database-build/adb09-final-live-sql-execution-approval-record.json",
  "data/content-intelligence/database-build/adb09-schema-only-execution-scope.json",
  "data/content-intelligence/backend-architecture/adb09-remaining-blockers-register.json",
  "data/content-intelligence/quality-registry/adb09-adb10-live-schema-execution-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb09-to-adb10-live-schema-execution-boundary.json",

  "data/content-intelligence/quality-reviews/adb10-live-schema-execution-result-capture.json",
  "data/content-intelligence/database-build/adb10-live-schema-execution-result-record.json",
  "data/content-intelligence/database-build/adb10-critical-table-verification-result.json",
  "data/content-intelligence/database-build/adb10-post-execution-schema-inventory.json",
  "data/content-intelligence/backend-architecture/adb10-remaining-blockers-confirmation.json",
  "data/content-intelligence/backend-architecture/adb10-no-seed-no-runtime-audit.json",
  "data/content-intelligence/backend-architecture/adb10-secret-handling-audit.json",
  "data/content-intelligence/backend-architecture/adb10-no-mutation-beyond-schema-audit-register.json",
  "data/content-intelligence/quality-registry/adb10-adb11-seed-source-planning-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb10-to-adb11-seed-source-planning-boundary.json",
  "data/quality/adb10-live-schema-execution-result-capture.json",
  "data/quality/adb10-live-schema-execution-result-capture-preview.json",
  "docs/quality/ADB10_LIVE_SCHEMA_EXECUTION_RESULT_CAPTURE.md",
  "scripts/generate-adb10-live-schema-execution-result-capture.mjs",
  "scripts/validate-adb10-live-schema-execution-result-capture.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb09Review = readJson("data/content-intelligence/quality-reviews/adb09-final-execution-approval-checkpoint.json");
const adb09Approval = readJson("data/content-intelligence/database-build/adb09-final-live-sql-execution-approval-record.json");
const adb09Readiness = readJson("data/content-intelligence/quality-registry/adb09-adb10-live-schema-execution-readiness-record.json");
const adb09Boundary = readJson("data/content-intelligence/mutation-plans/adb09-to-adb10-live-schema-execution-boundary.json");

if (adb09Review.status !== "schema_only_live_sql_execution_approved_ready_for_adb10") fail("ADB09 review status mismatch.");
if (adb09Approval.approval_scope.schema_only_sql_execution_approved_for_adb10 !== true) fail("ADB09 must approve schema-only SQL execution.");
if (adb09Approval.approval_scope.seed_insert_approved !== false) fail("Seed insert must remain blocked at ADB09.");
if (adb09Readiness.ready_for_adb10 !== true) fail("ADB09 readiness must permit ADB10.");
if (adb09Boundary.next_stage_id !== "ADB10") fail("ADB09 boundary must point to ADB10.");

const review = readJson("data/content-intelligence/quality-reviews/adb10-live-schema-execution-result-capture.json");
const executionResultRecord = readJson("data/content-intelligence/database-build/adb10-live-schema-execution-result-record.json");
const tableVerificationResult = readJson("data/content-intelligence/database-build/adb10-critical-table-verification-result.json");
const postExecutionSchemaInventory = readJson("data/content-intelligence/database-build/adb10-post-execution-schema-inventory.json");
const remainingBlockersConfirmation = readJson("data/content-intelligence/backend-architecture/adb10-remaining-blockers-confirmation.json");
const noSeedNoRuntimeAudit = readJson("data/content-intelligence/backend-architecture/adb10-no-seed-no-runtime-audit.json");
const secretHandlingAudit = readJson("data/content-intelligence/backend-architecture/adb10-secret-handling-audit.json");
const noMutationBeyondSchemaAudit = readJson("data/content-intelligence/backend-architecture/adb10-no-mutation-beyond-schema-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb10-adb11-seed-source-planning-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb10-to-adb11-seed-source-planning-boundary.json");
const preview = readJson("data/quality/adb10-live-schema-execution-result-capture-preview.json");
const pkg = readJson("package.json");

if (review.status !== "live_schema_execution_captured_ready_for_adb11") fail("ADB10 review status mismatch.");
for (const key of [
  "adb10_live_schema_execution_result_recorded",
  "adb09_consumed",
  "live_schema_sql_execution_completed_by_operator",
  "critical_table_verification_passed",
  "schema_only_execution_scope_respected",
  "ready_for_adb11_seed_source_planning"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.critical_table_match_count !== 17) fail("Critical table match count must be 17.");
if (review.summary.expected_critical_table_count !== 17) fail("Expected critical table count must be 17.");
if (review.summary.hard_blocker_count_for_adb11 !== 0) fail("ADB11 blocker count must be zero.");

for (const key of [
  "seed_insert_approved",
  "seed_data_inserted",
  "runtime_calculation_approved",
  "runtime_calculation_executed",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_content_generated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (executionResultRecord.status !== "live_schema_only_sql_execution_completed") fail("Execution result status mismatch.");
if (executionResultRecord.execution_result.schema_execution_completed !== true) fail("Schema execution must be completed.");
if (executionResultRecord.execution_result.sql_error_reported !== false) fail("SQL error must be false.");
if (executionResultRecord.database_context_reported_by_operator.schema !== "public") fail("Schema context must be public.");

if (tableVerificationResult.status !== "critical_table_verification_passed") fail("Table verification status mismatch.");
if (tableVerificationResult.expected_critical_table_count !== 17) fail("Expected critical table count mismatch.");
if (tableVerificationResult.observed_critical_table_count !== 17) fail("Observed critical table count mismatch.");
if (tableVerificationResult.matched_table_count !== 17) fail("Matched table count mismatch.");
for (const table of ["source_authorities", "panchang_daily_records", "calculation_profiles", "panchanga_calculation_trace_logs", "festival_observance_rule_registry", "word_corpus", "methodology_activation_audits"]) {
  if (!tableVerificationResult.verified_tables.includes(table)) fail(`Verified table missing: ${table}`);
}

if (postExecutionSchemaInventory.status !== "post_execution_schema_inventory_recorded") fail("Post-execution inventory status mismatch.");
if (postExecutionSchemaInventory.schema_context !== "public") fail("Post-execution schema context must be public.");

for (const blocker of ["Seed data insertion", "Runtime calculation execution", "Backend/Auth/Supabase runtime activation", "Deployment"]) {
  if (!remainingBlockersConfirmation.still_blocked_after_adb10.includes(blocker)) fail(`Remaining blocker missing: ${blocker}`);
}

if (noSeedNoRuntimeAudit.audit_passed !== true) fail("No seed/no runtime audit must pass.");
if (noSeedNoRuntimeAudit.failed_checks.length !== 0) fail("No seed/no runtime failed checks must be zero.");

if (secretHandlingAudit.audit_passed !== true) fail("Secret handling audit must pass.");
if (secretHandlingAudit.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");
if (secretHandlingAudit.secret_committed_to_repo !== false) fail("Secret must not be committed.");
if (secretHandlingAudit.secret_shared_in_chat !== false) fail("Secret must not be shared in chat.");

if (noMutationBeyondSchemaAudit.audit_passed !== true) fail("No-mutation beyond schema audit must pass.");
if (noMutationBeyondSchemaAudit.failed_checks.length !== 0) fail("No-mutation beyond schema failed checks must be zero.");
if (!noMutationBeyondSchemaAudit.allowed_mutation_completed.includes("schema-only table creation")) fail("Schema-only table creation should be recorded as allowed completed mutation.");
if (!noMutationBeyondSchemaAudit.blocked_mutations.includes("seed data insertion")) fail("Seed insertion blocked mutation missing.");

if (readiness.status !== "ready_for_adb11_seed_source_planning") fail("Readiness status mismatch.");
if (readiness.ready_for_adb11 !== true) fail("ADB11 readiness must be true.");
if (readiness.next_stage_id !== "ADB11") fail("Readiness must point to ADB11.");
if (!JSON.stringify(readiness.adb11_allowed_scope).includes("Plan seed data source packs")) fail("ADB11 seed planning scope missing.");
if (!readiness.adb11_blocked_scope.includes("Seed data insertion")) fail("ADB11 must keep seed insertion blocked.");

if (boundary.next_stage_id !== "ADB11") fail("Boundary must point to ADB11.");
if (!boundary.blocked_scope.includes("Runtime calculation execution")) fail("Runtime calculation must remain blocked.");

if (preview.critical_table_match_count !== 17) fail("Preview table match count must be 17.");
for (const key of [
  "adb10_live_schema_execution_result_recorded",
  "adb09_consumed",
  "live_schema_sql_execution_completed_by_operator",
  "critical_table_verification_passed",
  "schema_only_execution_scope_respected",
  "ready_for_adb11_seed_source_planning"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
for (const key of [
  "seed_insert_approved",
  "seed_data_inserted",
  "runtime_calculation_approved",
  "runtime_calculation_executed",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_content_generated"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb10"]) fail("Missing package script: generate:adb10");
if (!pkg.scripts?.["validate:adb10"]) fail("Missing package script: validate:adb10");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb10")) fail("validate:project must include validate:adb10.");

pass("ADB10 Live Schema-only SQL Execution and Result Capture is present.");
pass("ADB09 schema-only execution approval is consumed.");
pass("Manual Supabase execution result is recorded.");
pass("Critical table verification passed with 17 / 17 matched tables.");
pass("Schema-only execution boundary is respected.");
pass("No seed insertion is recorded.");
pass("No runtime calculation is recorded.");
pass("No backend/Auth activation is recorded.");
pass("No deployment is recorded.");
pass("No service-role key exposure is recorded.");
pass("ADB11 Seed Source Planning readiness is valid.");
