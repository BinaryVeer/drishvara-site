import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ ADB14 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb13-seed-draft-validation-integrity-review.json",
  "data/content-intelligence/quality-registry/adb13-adb14-seed-insertion-approval-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb13-to-adb14-seed-insertion-approval-boundary.json",

  "data/content-intelligence/quality-reviews/adb14-seed-insertion-approval-package.json",
  "data/content-intelligence/seed-insertion/adb14-seed-insertion-approval-record.json",
  "data/content-intelligence/seed-insertion/adb14-seed-insertion-package-manifest.json",
  "data/content-intelligence/database-build/sql-drafts/adb14_seed_insert_package.sql",
  "docs/quality/ADB14_SEED_INSERTION_OPERATOR_RUNBOOK.md",
  "data/content-intelligence/backend-architecture/adb14-seed-insert-sql-safety-audit.json",
  "data/content-intelligence/backend-architecture/adb14-no-runtime-activation-audit.json",
  "data/content-intelligence/backend-architecture/adb14-secret-handling-audit.json",
  "data/content-intelligence/quality-registry/adb14-adb15-seed-insertion-result-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb14-to-adb15-seed-insertion-result-boundary.json",
  "data/quality/adb14-seed-insertion-approval-package.json",
  "data/quality/adb14-seed-insertion-approval-package-preview.json",
  "docs/quality/ADB14_SEED_INSERTION_APPROVAL_PACKAGE.md",
  "scripts/generate-adb14-seed-insertion-approval-package.mjs",
  "scripts/validate-adb14-seed-insertion-approval-package.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb13Review = readJson("data/content-intelligence/quality-reviews/adb13-seed-draft-validation-integrity-review.json");
const adb13Readiness = readJson("data/content-intelligence/quality-registry/adb13-adb14-seed-insertion-approval-readiness-record.json");
const adb13Boundary = readJson("data/content-intelligence/mutation-plans/adb13-to-adb14-seed-insertion-approval-boundary.json");

if (adb13Review.status !== "seed_draft_validation_ready_for_adb14") fail("ADB13 review status mismatch.");
if (adb13Review.summary.ready_for_adb14_seed_insertion_approval_checkpoint !== true) fail("ADB13 readiness summary missing.");
if (adb13Readiness.ready_for_adb14 !== true) fail("ADB13 readiness must permit ADB14.");
if (adb13Boundary.next_stage_id !== "ADB14") fail("ADB13 boundary must point to ADB14.");

const review = readJson("data/content-intelligence/quality-reviews/adb14-seed-insertion-approval-package.json");
const approvalRecord = readJson("data/content-intelligence/seed-insertion/adb14-seed-insertion-approval-record.json");
const insertionManifest = readJson("data/content-intelligence/seed-insertion/adb14-seed-insertion-package-manifest.json");
const sql = read("data/content-intelligence/database-build/sql-drafts/adb14_seed_insert_package.sql");
const sqlSafetyAudit = readJson("data/content-intelligence/backend-architecture/adb14-seed-insert-sql-safety-audit.json");
const noRuntimeAudit = readJson("data/content-intelligence/backend-architecture/adb14-no-runtime-activation-audit.json");
const secretHandlingAudit = readJson("data/content-intelligence/backend-architecture/adb14-secret-handling-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb14-adb15-seed-insertion-result-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb14-to-adb15-seed-insertion-result-boundary.json");
const preview = readJson("data/quality/adb14-seed-insertion-approval-package-preview.json");
const pkg = readJson("package.json");

if (review.status !== "seed_insert_sql_package_ready_for_manual_execution") fail("ADB14 review status mismatch.");
for (const key of [
  "adb14_seed_insertion_approval_package_recorded",
  "adb13_consumed",
  "seed_insert_sql_generated",
  "seed_insert_approved_for_manual_operator_execution",
  "ready_for_adb15_seed_insertion_result_capture"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.seed_row_count < 20) fail("Seed row count too low.");
if (review.summary.target_table_count < 10) fail("Target table count too low.");
if (review.summary.hard_blocker_count_for_adb15 !== 0) fail("ADB15 blocker count must be zero.");
for (const key of [
  "copy_command_generated",
  "seed_data_inserted_by_repo",
  "database_write_performed_by_repo",
  "runtime_calculation_approved",
  "runtime_calculation_executed",
  "backend_auth_supabase_activation_approved",
  "deployment_approved",
  "service_role_key_exposed"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (approvalRecord.status !== "seed_insertion_sql_package_approved_for_manual_operator_execution") fail("Approval record status mismatch.");
if (approvalRecord.approval_scope.generate_seed_insert_sql !== true) fail("Seed INSERT SQL generation must be approved.");
if (approvalRecord.approval_scope.manual_operator_execution_in_supabase_sql_editor !== true) fail("Manual Supabase execution must be approved.");
if (approvalRecord.approval_scope.runtime_calculation_approved !== false) fail("Runtime calculation must remain blocked.");

if (insertionManifest.status !== "seed_insert_sql_package_generated") fail("Insertion manifest status mismatch.");
if (insertionManifest.seed_row_count < 20) fail("Insertion manifest seed row count too low.");
if (insertionManifest.repo_executed_sql !== false) fail("Repo must not execute SQL.");
if (insertionManifest.execution_mode !== "manual_supabase_sql_editor_only") fail("Execution mode must be manual Supabase SQL Editor only.");

if (!sql.includes("ADB14 SEED INSERTION PACKAGE")) fail("SQL package header missing.");
if (!sql.includes("APPROVED_FOR_MANUAL_OPERATOR_EXECUTION")) fail("SQL approval label missing.");
if (!sql.includes("INSERT INTO public.%I")) fail("Dynamic INSERT statement missing.");
if (!sql.includes("ON CONFLICT DO NOTHING")) fail("ON CONFLICT guard missing.");
if (!sql.includes("jsonb_array_elements(seed_rows)")) fail("Seed JSON loop missing.");
if (/\bCOPY\s+[a-zA-Z0-9_".]+\s+FROM\b/i.test(sql)) fail("COPY FROM statement must not exist.");
if (/^\s*DROP\s+/im.test(sql)) fail("DROP statement must not exist.");
if (/^\s*TRUNCATE\s+/im.test(sql)) fail("TRUNCATE statement must not exist.");
if (/^\s*DELETE\s+FROM\s+/im.test(sql)) fail("DELETE statement must not exist.");
if (/^\s*UPDATE\s+/im.test(sql)) fail("UPDATE statement must not exist.");
if (/service_role\s*[:=]/i.test(sql) || /SUPABASE_SERVICE_ROLE_KEY\s*=/i.test(sql)) fail("Service-role secret pattern must not exist.");

if (sqlSafetyAudit.audit_passed !== true) fail("SQL safety audit must pass.");
if (sqlSafetyAudit.failed_checks.length !== 0) fail("SQL safety failed checks must be zero.");

if (noRuntimeAudit.audit_passed !== true) fail("No runtime audit must pass.");
if (noRuntimeAudit.failed_checks.length !== 0) fail("No runtime failed checks must be zero.");

if (secretHandlingAudit.audit_passed !== true) fail("Secret handling audit must pass.");
if (secretHandlingAudit.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");
if (secretHandlingAudit.secret_committed_to_repo !== false) fail("Secret must not be committed.");
if (secretHandlingAudit.secret_shared_in_chat !== false) fail("Secret must not be shared in chat.");

if (readiness.status !== "ready_for_adb15_seed_insertion_result_capture") fail("ADB15 readiness status mismatch.");
if (readiness.ready_for_adb15 !== true) fail("ADB15 readiness must be true.");
if (readiness.next_stage_id !== "ADB15") fail("Readiness must point to ADB15.");
if (!readiness.adb15_blocked_scope.includes("Runtime calculation execution")) fail("ADB15 must keep runtime calculation blocked.");

if (boundary.next_stage_id !== "ADB15") fail("Boundary must point to ADB15.");
if (!JSON.stringify(boundary.allowed_scope).includes("Capture Supabase seed insertion result")) fail("ADB15 result capture scope missing.");

if (preview.seed_insert_sql_generated !== 1) fail("Preview seed_insert_sql_generated must be 1.");
if (preview.seed_insert_approved_for_manual_operator_execution !== 1) fail("Preview manual approval must be 1.");
if (preview.seed_row_count < 20) fail("Preview seed row count too low.");
for (const key of [
  "copy_command_generated",
  "seed_data_inserted_by_repo",
  "database_write_performed_by_repo",
  "runtime_calculation_approved",
  "runtime_calculation_executed",
  "backend_auth_supabase_activation_approved",
  "deployment_approved",
  "service_role_key_exposed"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb14"]) fail("Missing package script: generate:adb14");
if (!pkg.scripts?.["validate:adb14"]) fail("Missing package script: validate:adb14");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb14")) fail("validate:project must include validate:adb14.");

pass("ADB14 Seed Insertion Approval and SQL Package is present.");
pass("ADB13 seed validation is consumed.");
pass("Seed INSERT SQL package is generated.");
pass("Manual Supabase execution is approved.");
pass("SQL safety audit is valid.");
pass("No runtime activation audit is valid.");
pass("Secret handling audit is valid.");
pass("ADB15 Seed Insertion Result Capture readiness is valid.");
