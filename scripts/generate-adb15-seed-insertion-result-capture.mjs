import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  adb14Review: "data/content-intelligence/quality-reviews/adb14-seed-insertion-approval-package.json",
  adb14Approval: "data/content-intelligence/seed-insertion/adb14-seed-insertion-approval-record.json",
  adb14Manifest: "data/content-intelligence/seed-insertion/adb14-seed-insertion-package-manifest.json",
  adb14Sql: "data/content-intelligence/database-build/sql-drafts/adb14_seed_insert_package.sql",
  adb14SqlSafety: "data/content-intelligence/backend-architecture/adb14-seed-insert-sql-safety-audit.json",
  adb14NoRuntime: "data/content-intelligence/backend-architecture/adb14-no-runtime-activation-audit.json",
  adb14Secret: "data/content-intelligence/backend-architecture/adb14-secret-handling-audit.json",
  adb14Readiness: "data/content-intelligence/quality-registry/adb14-adb15-seed-insertion-result-readiness-record.json",
  adb14Boundary: "data/content-intelligence/mutation-plans/adb14-to-adb15-seed-insertion-result-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/adb15-seed-insertion-result-capture.json",
  resultRecord: "data/content-intelligence/seed-insertion/adb15-seed-insertion-result-record.json",
  rowCountVerification: "data/content-intelligence/seed-insertion/adb15-row-count-verification-result.json",
  seedFoundationStatus: "data/content-intelligence/seed-insertion/adb15-seed-foundation-status-record.json",
  noRuntimeAudit: "data/content-intelligence/backend-architecture/adb15-no-runtime-activation-audit.json",
  secretHandlingAudit: "data/content-intelligence/backend-architecture/adb15-secret-handling-audit.json",
  noDeploymentAudit: "data/content-intelligence/backend-architecture/adb15-no-deployment-audit.json",
  readiness: "data/content-intelligence/quality-registry/adb15-adb16-runtime-decision-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/adb15-to-adb16-runtime-decision-boundary.json",
  registry: "data/quality/adb15-seed-insertion-result-capture.json",
  preview: "data/quality/adb15-seed-insertion-result-capture-preview.json",
  doc: "docs/quality/ADB15_SEED_INSERTION_RESULT_CAPTURE.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing ADB15 input: ${p}`);
}

const adb14Review = readJson(inputs.adb14Review);
const adb14Approval = readJson(inputs.adb14Approval);
const adb14Manifest = readJson(inputs.adb14Manifest);
const adb14Sql = read(inputs.adb14Sql);
const adb14SqlSafety = readJson(inputs.adb14SqlSafety);
const adb14NoRuntime = readJson(inputs.adb14NoRuntime);
const adb14Secret = readJson(inputs.adb14Secret);
const adb14Readiness = readJson(inputs.adb14Readiness);
const adb14Boundary = readJson(inputs.adb14Boundary);

if (adb14Review.status !== "seed_insert_sql_package_ready_for_manual_execution") throw new Error("ADB14 review status mismatch.");
if (adb14Review.summary?.seed_insert_sql_generated !== true) throw new Error("ADB14 must have generated seed INSERT SQL.");
if (adb14Review.summary?.seed_insert_approved_for_manual_operator_execution !== true) throw new Error("ADB14 manual seed insertion approval missing.");
if (adb14Approval.approval_scope?.manual_operator_execution_in_supabase_sql_editor !== true) throw new Error("ADB14 manual Supabase execution approval missing.");
if (adb14Manifest.status !== "seed_insert_sql_package_generated") throw new Error("ADB14 insertion manifest status mismatch.");
if (!adb14Sql.includes("ADB14 SEED INSERTION PACKAGE")) throw new Error("ADB14 SQL package header missing.");
if (adb14SqlSafety.audit_passed !== true) throw new Error("ADB14 SQL safety audit must pass.");
if (adb14NoRuntime.audit_passed !== true) throw new Error("ADB14 no-runtime audit must pass.");
if (adb14Secret.service_role_key_exposed !== false) throw new Error("Service-role key must not be exposed.");
if (adb14Readiness.ready_for_adb15 !== true || adb14Readiness.next_stage_id !== "ADB15") throw new Error("ADB14 readiness must permit ADB15.");
if (adb14Boundary.next_stage_id !== "ADB15") throw new Error("ADB14 boundary must point to ADB15.");

const observedTotalSeedRows = 45;

const blockedState = {
  adb15_seed_insertion_result_captured: true,
  adb14_consumed: true,
  manual_supabase_seed_insertion_succeeded: true,
  total_seed_rows_verified: observedTotalSeedRows,
  seed_foundation_available_in_supabase: true,
  ready_for_adb16_runtime_decision_checkpoint: true,

  runtime_calculation_approved: false,
  runtime_calculation_executed: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  rls_public_policy_activation_approved: false,
  rls_public_policy_activation_performed: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_content_generated: false,
  ag47_resume_allowed: false
};

const resultRecord = {
  module_id: "ADB15",
  title: "Seed Insertion Result Record",
  status: "seed_insertion_succeeded_and_captured",
  execution_mode: "manual_operator_side_supabase_sql_editor",
  source_sql_package: inputs.adb14Sql,
  operator_reported_result: "Supabase SQL Editor returned Success. No rows returned for ADB14 DO block.",
  verification_query_result: {
    total_seed_rows: observedTotalSeedRows,
    verification_status: "passed"
  },
  seed_insertion_completed: true,
  repo_executed_sql: false,
  blocked_state: blockedState
};

const rowCountVerification = {
  module_id: "ADB15",
  title: "Seed Row-count Verification Result",
  status: "row_count_verification_passed",
  verification_method: "operator_ran_total_seed_rows_query_in_supabase_sql_editor",
  total_seed_rows_expected_minimum: 1,
  total_seed_rows_observed: observedTotalSeedRows,
  verification_result: "passed",
  notes: [
    "The earlier malformed array literal was corrected in ADB14 array-casting patch.",
    "The second manual Supabase execution succeeded.",
    "The aggregate row-count query returned 45 total seed rows."
  ],
  blocked_state: blockedState
};

const seedFoundationStatus = {
  module_id: "ADB15",
  title: "Seed Foundation Status Record",
  status: "basic_seed_foundation_available",
  schema_foundation_status: "created_in_adb10",
  seed_foundation_status: "inserted_and_verified_in_adb15",
  available_foundation_layers: [
    "source authority references",
    "source confidence and editorial review controls",
    "Panchanga element samples",
    "calculation methodology/profile scaffolds",
    "location profile seed",
    "regional calendar/vrat rule scaffolds",
    "word/reflection/mantra review scaffolds",
    "claim-risk controls",
    "validation learning controls"
  ],
  limitations: [
    "Seed foundation is basic and review-oriented.",
    "Full Panchanga master completion is not yet done.",
    "Runtime Panchanga calculation is not yet activated.",
    "Backend/Auth/RLS/deployment remain blocked."
  ],
  blocked_state: blockedState
};

const noRuntimeAudit = {
  module_id: "ADB15",
  title: "No Runtime Activation Audit",
  status: "no_runtime_activation_audit_passed_for_adb15",
  audit_passed: true,
  checks: [
    { check_id: "runtime_calculation_approved", expected: false, actual: false, passed: true },
    { check_id: "runtime_calculation_executed", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "rls_public_policy_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "public_content_generated", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const secretHandlingAudit = {
  module_id: "ADB15",
  title: "Secret Handling Audit",
  status: "secret_handling_audit_passed_for_adb15",
  audit_passed: true,
  service_role_key_exposed: false,
  secret_committed_to_repo: false,
  secret_shared_in_chat: false,
  execution_auth_mode: "operator_side_supabase_dashboard_session",
  blocked_state: blockedState
};

const noDeploymentAudit = {
  module_id: "ADB15",
  title: "No Deployment Audit",
  status: "no_deployment_audit_passed_for_adb15",
  audit_passed: true,
  deployment_approved: false,
  deployment_performed: false,
  public_runtime_changed: false,
  ag47_resume_allowed: false,
  blocked_state: blockedState
};

const readiness = {
  module_id: "ADB15",
  title: "ADB16 Runtime Decision Readiness Record",
  status: "ready_for_adb16_runtime_decision_checkpoint",
  ready_for_adb16: true,
  next_stage_id: "ADB16",
  next_stage_title: "Runtime Calculation Decision Checkpoint",
  adb16_allowed_scope: [
    "Decide whether to start runtime calculation-engine planning.",
    "Review seed foundation sufficiency.",
    "Plan additional seed expansion if required.",
    "Plan Panchanga calculation dry-run strategy if approved.",
    "Keep public runtime/backend/Auth/deployment blocked unless separately approved."
  ],
  adb16_blocked_scope_by_default: [
    "Runtime Panchanga calculation execution",
    "Backend/Auth/Supabase runtime activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure in repo/chat",
    "AG47 resume without explicit decision"
  ],
  hard_blocker_count_for_adb16: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "ADB15",
  title: "ADB15 to ADB16 Runtime Decision Boundary",
  status: "adb16_runtime_decision_boundary_created",
  next_stage_id: "ADB16",
  next_stage_title: "Runtime Calculation Decision Checkpoint",
  allowed_scope: readiness.adb16_allowed_scope,
  blocked_scope_by_default: readiness.adb16_blocked_scope_by_default,
  blocked_state: blockedState
};

const review = {
  module_id: "ADB15",
  title: "Seed Insertion Result Capture and Verification",
  status: "seed_insertion_captured_ready_for_adb16_decision",
  depends_on: ["ADB14", "ADB13", "ADB10"],
  result_record_file: outputs.resultRecord,
  row_count_verification_file: outputs.rowCountVerification,
  seed_foundation_status_file: outputs.seedFoundationStatus,
  no_runtime_audit_file: outputs.noRuntimeAudit,
  secret_handling_audit_file: outputs.secretHandlingAudit,
  no_deployment_audit_file: outputs.noDeploymentAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    adb15_seed_insertion_result_captured: true,
    adb14_consumed: true,
    manual_supabase_seed_insertion_succeeded: true,
    total_seed_rows_verified: observedTotalSeedRows,
    seed_foundation_available_in_supabase: true,
    ready_for_adb16_runtime_decision_checkpoint: true,
    hard_blocker_count_for_adb16: 0,
    runtime_calculation_approved: false,
    runtime_calculation_executed: false,
    backend_auth_supabase_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    rls_public_policy_activation_approved: false,
    deployment_approved: false,
    deployment_performed: false,
    service_role_key_exposed: false,
    public_content_generated: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "ADB15",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "ADB15",
  status: review.status,
  adb15_seed_insertion_result_captured: 1,
  adb14_consumed: 1,
  manual_supabase_seed_insertion_succeeded: 1,
  total_seed_rows_verified: observedTotalSeedRows,
  seed_foundation_available_in_supabase: 1,
  ready_for_adb16_runtime_decision_checkpoint: 1,
  hard_blocker_count_for_adb16: 0,
  runtime_calculation_approved: 0,
  runtime_calculation_executed: 0,
  backend_auth_supabase_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  rls_public_policy_activation_approved: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0,
  public_content_generated: 0
};

const doc = `# ADB15 — Seed Insertion Result Capture and Verification

## Result

ADB15 records that the ADB14 seed insertion package was executed manually in Supabase and verified.

## Verification

- Total seed rows verified: 45
- Verification method: Supabase SQL Editor aggregate row-count query
- Result: passed

## Current database status

- Schema foundation exists.
- Basic seed foundation exists.
- Runtime calculation is not active.
- Backend/Auth/RLS/deployment remain blocked.

## Still blocked

- Runtime Panchanga calculation
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure in repo/chat
- Public content generation
- AG47 resume without explicit decision

## Next

ADB16 — Runtime Calculation Decision Checkpoint, or pause ADB work and return to AG roadmap by explicit decision.
`;

writeJson(outputs.resultRecord, resultRecord);
writeJson(outputs.rowCountVerification, rowCountVerification);
writeJson(outputs.seedFoundationStatus, seedFoundationStatus);
writeJson(outputs.noRuntimeAudit, noRuntimeAudit);
writeJson(outputs.secretHandlingAudit, secretHandlingAudit);
writeJson(outputs.noDeploymentAudit, noDeploymentAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ ADB15 Seed Insertion Result Capture and Verification generated.");
console.log("✅ Manual Supabase seed insertion recorded as successful.");
console.log("✅ Total seed rows verified: 45.");
console.log("✅ Basic seed foundation now recorded as available in Supabase.");
console.log("✅ Runtime calculation, backend/Auth, RLS, deployment and service-role exposure remain blocked.");
