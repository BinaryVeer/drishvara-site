import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ ADB15 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb14-seed-insertion-approval-package.json",
  "data/content-intelligence/seed-insertion/adb14-seed-insertion-approval-record.json",
  "data/content-intelligence/seed-insertion/adb14-seed-insertion-package-manifest.json",
  "data/content-intelligence/database-build/sql-drafts/adb14_seed_insert_package.sql",
  "data/content-intelligence/backend-architecture/adb14-seed-insert-sql-safety-audit.json",
  "data/content-intelligence/quality-registry/adb14-adb15-seed-insertion-result-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb14-to-adb15-seed-insertion-result-boundary.json",

  "data/content-intelligence/quality-reviews/adb15-seed-insertion-result-capture.json",
  "data/content-intelligence/seed-insertion/adb15-seed-insertion-result-record.json",
  "data/content-intelligence/seed-insertion/adb15-row-count-verification-result.json",
  "data/content-intelligence/seed-insertion/adb15-seed-foundation-status-record.json",
  "data/content-intelligence/backend-architecture/adb15-no-runtime-activation-audit.json",
  "data/content-intelligence/backend-architecture/adb15-secret-handling-audit.json",
  "data/content-intelligence/backend-architecture/adb15-no-deployment-audit.json",
  "data/content-intelligence/quality-registry/adb15-adb16-runtime-decision-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb15-to-adb16-runtime-decision-boundary.json",
  "data/quality/adb15-seed-insertion-result-capture.json",
  "data/quality/adb15-seed-insertion-result-capture-preview.json",
  "docs/quality/ADB15_SEED_INSERTION_RESULT_CAPTURE.md",
  "scripts/generate-adb15-seed-insertion-result-capture.mjs",
  "scripts/validate-adb15-seed-insertion-result-capture.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb14Review = readJson("data/content-intelligence/quality-reviews/adb14-seed-insertion-approval-package.json");
const adb14Approval = readJson("data/content-intelligence/seed-insertion/adb14-seed-insertion-approval-record.json");
const adb14Manifest = readJson("data/content-intelligence/seed-insertion/adb14-seed-insertion-package-manifest.json");
const adb14Safety = readJson("data/content-intelligence/backend-architecture/adb14-seed-insert-sql-safety-audit.json");
const adb14Readiness = readJson("data/content-intelligence/quality-registry/adb14-adb15-seed-insertion-result-readiness-record.json");
const adb14Boundary = readJson("data/content-intelligence/mutation-plans/adb14-to-adb15-seed-insertion-result-boundary.json");

if (adb14Review.status !== "seed_insert_sql_package_ready_for_manual_execution") fail("ADB14 review status mismatch.");
if (adb14Approval.approval_scope.manual_operator_execution_in_supabase_sql_editor !== true) fail("ADB14 manual execution approval missing.");
if (adb14Manifest.status !== "seed_insert_sql_package_generated") fail("ADB14 manifest status mismatch.");
if (adb14Safety.audit_passed !== true) fail("ADB14 SQL safety audit must pass.");
if (adb14Readiness.ready_for_adb15 !== true) fail("ADB14 readiness must permit ADB15.");
if (adb14Boundary.next_stage_id !== "ADB15") fail("ADB14 boundary must point to ADB15.");

const review = readJson("data/content-intelligence/quality-reviews/adb15-seed-insertion-result-capture.json");
const resultRecord = readJson("data/content-intelligence/seed-insertion/adb15-seed-insertion-result-record.json");
const rowCountVerification = readJson("data/content-intelligence/seed-insertion/adb15-row-count-verification-result.json");
const seedFoundationStatus = readJson("data/content-intelligence/seed-insertion/adb15-seed-foundation-status-record.json");
const noRuntimeAudit = readJson("data/content-intelligence/backend-architecture/adb15-no-runtime-activation-audit.json");
const secretHandlingAudit = readJson("data/content-intelligence/backend-architecture/adb15-secret-handling-audit.json");
const noDeploymentAudit = readJson("data/content-intelligence/backend-architecture/adb15-no-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb15-adb16-runtime-decision-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb15-to-adb16-runtime-decision-boundary.json");
const preview = readJson("data/quality/adb15-seed-insertion-result-capture-preview.json");
const pkg = readJson("package.json");

if (review.status !== "seed_insertion_captured_ready_for_adb16_decision") fail("ADB15 review status mismatch.");

for (const key of [
  "adb15_seed_insertion_result_captured",
  "adb14_consumed",
  "manual_supabase_seed_insertion_succeeded",
  "seed_foundation_available_in_supabase",
  "ready_for_adb16_runtime_decision_checkpoint"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.total_seed_rows_verified !== 45) fail("Total seed rows must be 45.");
if (review.summary.hard_blocker_count_for_adb16 !== 0) fail("ADB16 blocker count must be zero.");

for (const key of [
  "runtime_calculation_approved",
  "runtime_calculation_executed",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_content_generated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (resultRecord.status !== "seed_insertion_succeeded_and_captured") fail("Result record status mismatch.");
if (resultRecord.verification_query_result.total_seed_rows !== 45) fail("Result record total rows must be 45.");
if (resultRecord.seed_insertion_completed !== true) fail("Seed insertion must be marked completed.");
if (resultRecord.repo_executed_sql !== false) fail("Repo must not be marked as SQL executor.");

if (rowCountVerification.status !== "row_count_verification_passed") fail("Row-count verification status mismatch.");
if (rowCountVerification.total_seed_rows_observed !== 45) fail("Observed seed rows must be 45.");
if (rowCountVerification.verification_result !== "passed") fail("Row-count verification must pass.");

if (seedFoundationStatus.status !== "basic_seed_foundation_available") fail("Seed foundation status mismatch.");
if (seedFoundationStatus.schema_foundation_status !== "created_in_adb10") fail("Schema foundation status mismatch.");
if (seedFoundationStatus.seed_foundation_status !== "inserted_and_verified_in_adb15") fail("Seed foundation inserted status mismatch.");

if (noRuntimeAudit.audit_passed !== true) fail("No runtime audit must pass.");
if (noRuntimeAudit.failed_checks.length !== 0) fail("No runtime failed checks must be zero.");

if (secretHandlingAudit.audit_passed !== true) fail("Secret handling audit must pass.");
if (secretHandlingAudit.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");
if (secretHandlingAudit.secret_committed_to_repo !== false) fail("Secret must not be committed.");
if (secretHandlingAudit.secret_shared_in_chat !== false) fail("Secret must not be shared in chat.");

if (noDeploymentAudit.audit_passed !== true) fail("No deployment audit must pass.");
if (noDeploymentAudit.deployment_performed !== false) fail("Deployment must remain false.");

if (readiness.status !== "ready_for_adb16_runtime_decision_checkpoint") fail("ADB16 readiness status mismatch.");
if (readiness.ready_for_adb16 !== true) fail("ADB16 readiness must be true.");
if (readiness.next_stage_id !== "ADB16") fail("Readiness must point to ADB16.");
if (!readiness.adb16_blocked_scope_by_default.includes("Runtime Panchanga calculation execution")) fail("ADB16 must block runtime calculation by default.");
if (!readiness.adb16_blocked_scope_by_default.includes("Deployment")) fail("ADB16 must block deployment by default.");

if (boundary.next_stage_id !== "ADB16") fail("Boundary must point to ADB16.");
if (!JSON.stringify(boundary.allowed_scope).includes("Decide whether to start runtime calculation-engine planning")) fail("ADB16 decision scope missing.");

if (preview.total_seed_rows_verified !== 45) fail("Preview total seed rows must be 45.");
for (const key of [
  "adb15_seed_insertion_result_captured",
  "adb14_consumed",
  "manual_supabase_seed_insertion_succeeded",
  "seed_foundation_available_in_supabase",
  "ready_for_adb16_runtime_decision_checkpoint"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
for (const key of [
  "runtime_calculation_approved",
  "runtime_calculation_executed",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_content_generated"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb15"]) fail("Missing package script: generate:adb15");
if (!pkg.scripts?.["validate:adb15"]) fail("Missing package script: validate:adb15");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb15")) fail("validate:project must include validate:adb15.");

pass("ADB15 Seed Insertion Result Capture and Verification is present.");
pass("ADB14 seed insertion package is consumed.");
pass("Manual Supabase seed insertion success is recorded.");
pass("Total seed rows verified: 45.");
pass("Basic seed foundation is recorded as available in Supabase.");
pass("No runtime activation audit is valid.");
pass("Secret handling audit is valid.");
pass("No deployment audit is valid.");
pass("ADB16 Runtime Decision Checkpoint readiness is valid.");
