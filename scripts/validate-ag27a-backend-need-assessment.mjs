import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function fail(msg) {
  console.error(`❌ AG27A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-existing-ag27-handoff-confirmation.json",
  "data/content-intelligence/quality-registry/ag26z-post-ag26-backend-deferral-readiness-record.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",

  "data/content-intelligence/quality-reviews/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-signal-register.json",
  "data/content-intelligence/backend-decision/ag27a-backend-requirement-matrix.json",
  "data/content-intelligence/backend-decision/ag27a-static-vs-backend-continuation-assessment.json",
  "data/content-intelligence/backend-decision/ag27a-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag27a-backend-need-assessment-blocker-register.json",
  "data/content-intelligence/quality-registry/ag27a-backend-decision-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27a-to-ag27b-backend-decision-audit-boundary.json",
  "data/quality/ag27a-backend-need-assessment.json",
  "data/quality/ag27a-backend-need-assessment-preview.json",
  "docs/quality/AG27A_BACKEND_NEED_ASSESSMENT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag27a-backend-need-assessment.json");
const assessment = readJson("data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json");
const needSignals = readJson("data/content-intelligence/backend-decision/ag27a-backend-need-signal-register.json");
const matrix = readJson("data/content-intelligence/backend-decision/ag27a-backend-requirement-matrix.json");
const staticAssessment = readJson("data/content-intelligence/backend-decision/ag27a-static-vs-backend-continuation-assessment.json");
const consumption = readJson("data/content-intelligence/backend-decision/ag27a-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag27a-backend-need-assessment-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag27a-backend-decision-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag27a-to-ag27b-backend-decision-audit-boundary.json");
const registry = readJson("data/quality/ag27a-backend-need-assessment.json");
const preview = readJson("data/quality/ag27a-backend-need-assessment-preview.json");

const ag26z = readJson("data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json");
const ag26zHandoff = readJson("data/content-intelligence/admin-editor/ag26z-existing-ag27-handoff-confirmation.json");
const existingAg27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (review.status !== "backend_need_assessment_created_ready_for_ag27b") fail("Review status mismatch.");
if (assessment.status !== "backend_need_assessment_created_ready_for_ag27b") fail("Assessment status mismatch.");
if (assessment.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (assessment.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (assessment.assessment_decision.backend_is_future_requirement_for_runtime_admin_editor !== true) fail("Future backend need must be true.");
if (assessment.assessment_decision.backend_required_now_for_current_static_governed_path !== false) fail("Backend must not be required now for static path.");
if (assessment.assessment_decision.backend_activation_approved_now !== false) fail("Backend activation approval must be false.");
if (assessment.assessment_decision.continue_static_now !== true) fail("Static continuation must be true.");
if (assessment.assessment_decision.proceed_to_ag27b_decision_audit !== true) fail("AG27B readiness missing.");
if (assessment.assessment_decision.ag27c_architecture_plan_allowed_now !== false) fail("AG27C must not be allowed now.");
if (assessment.assessment_decision.ag27d_security_rls_plan_allowed_now !== false) fail("AG27D must not be allowed now.");
if (assessment.assessment_decision.ag28_allowed_now !== false) fail("AG28 must not be allowed now.");
if (assessment.assessment_decision.explicit_approval_required_before_backend_planning_or_activation !== true) fail("Explicit approval guard missing.");
if (assessment.supabase_auth_backend_deferred !== true) fail("Backend deferral must remain true.");

if (needSignals.status !== "backend_need_signal_register_created_no_activation") fail("Need signal status mismatch.");
if (needSignals.future_backend_need_count < 5) fail("Future backend need signals insufficient.");
if (needSignals.backend_activation_approved_now !== false) fail("Need signal register must block backend activation.");
for (const requiredSignal of [
  "multi_user_admin_editor_login",
  "database_backed_review_queue",
  "richer_audit_trail",
  "subscriber_personalization",
  "dynamic_admin_publishing",
  "static_governance_continuation"
]) {
  if (!needSignals.signals.some((item) => item.signal_id === requiredSignal)) fail(`Missing need signal: ${requiredSignal}`);
}

if (matrix.status !== "backend_requirement_matrix_created_no_activation") fail("Requirement matrix status mismatch.");
if (matrix.immediate_backend_required_for_current_static_path !== false) fail("Immediate backend requirement must be false.");
if (matrix.backend_required_for_future_dynamic_admin_editor_runtime !== true) fail("Future runtime backend requirement must be true.");
if (matrix.backend_activation_approved_now !== false) fail("Backend activation approval must be false in matrix.");

if (staticAssessment.status !== "static_vs_backend_assessment_created_continue_static_for_now") fail("Static-vs-backend assessment status mismatch.");
if (staticAssessment.decision_frame.continue_static_path_now !== true) fail("Continue static now must be true.");
if (staticAssessment.decision_frame.activate_backend_now !== false) fail("Activate backend now must be false.");
if (staticAssessment.decision_frame.plan_backend_architecture_now !== false) fail("Plan backend architecture now must be false.");
if (staticAssessment.decision_frame.require_ag27b_decision_audit_next !== true) fail("AG27B audit next must be true.");
if (staticAssessment.decision_frame.require_explicit_approval_before_ag27c_or_later_backend_architecture !== true) fail("AG27C explicit approval guard missing.");

if (!consumption.future_consumption?.AG27B) fail("AG27B consumption note missing.");
if (!consumption.future_consumption?.AG27C) fail("AG27C consumption note missing.");
if (!consumption.future_consumption?.AG27D) fail("AG27D consumption note missing.");
if (!consumption.future_consumption?.AG27Z) fail("AG27Z consumption note missing.");

if (blocker.status !== "backend_need_assessment_runtime_operations_blocked_pending_ag27b") fail("Blocker status mismatch.");
if (readiness.ready_for_ag27b !== true) fail("AG27B readiness missing.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must not be allowed now.");
if (readiness.ag27c_allowed_now !== false) fail("AG27C must not be allowed now.");
if (readiness.ag27d_allowed_now !== false) fail("AG27D must not be allowed now.");
if (readiness.ag28_allowed_now !== false) fail("AG28 must not be allowed now.");
if (readiness.explicit_approval_required_before_backend_planning_or_activation !== true) fail("Explicit approval guard missing in readiness.");
if (boundary.next_stage_id !== "AG27B") fail("Boundary must point to AG27B.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");
if (boundary.explicit_approval_required_before_ag27c !== true) fail("AG27C approval guard missing.");
if (boundary.explicit_approval_required_before_ag28 !== true) fail("AG28 approval guard missing.");

if (review.summary.backend_need_assessment_created !== true) fail("Review summary missing.");
if (review.summary.backend_is_future_requirement_for_runtime_admin_editor !== true) fail("Review future backend need missing.");
if (review.summary.backend_required_now_for_current_static_governed_path !== false) fail("Review must not require backend now.");
if (review.summary.continue_static_now !== true) fail("Review must continue static now.");
if (review.summary.ready_for_ag27b !== true) fail("Review AG27B readiness missing.");
if (review.summary.backend_activation_approved_now !== false) fail("Backend activation must not be approved.");
if (review.summary.ag27c_allowed_now !== false) fail("AG27C must not be allowed now.");
if (review.summary.ag27d_allowed_now !== false) fail("AG27D must not be allowed now.");
if (review.summary.ag28_allowed_now !== false) fail("AG28 must not be allowed now.");

for (const flag of [
  "backend_enabled",
  "auth_enabled",
  "supabase_enabled",
  "database_created",
  "migration_created",
  "secret_created",
  "runtime_queue_created",
  "runtime_write_enabled",
  "deployment_done",
  "publishing_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must remain false.`);
}

if (ag26z.closure_decision.do_not_start_ag28_without_explicit_approval !== true) fail("AG26Z must block AG28.");
if (ag26zHandoff.status !== "existing_ag27_checkpoint_confirmed_backend_deferred") fail("AG26Z AG27 handoff status mismatch.");
if (existingAg27.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") fail("Existing AG27 status mismatch.");
if (existingAg27.checkpoint_decision.backend_deferred !== true) fail("Existing AG27 backend deferral must remain true.");
if (existingAg27.checkpoint_decision.ag28_to_ag40_allowed_now !== false) fail("Existing AG27 must keep AG28-AG40 blocked.");

if (registry.status !== "backend_need_assessment_created_ready_for_ag27b") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.backend_is_future_requirement_for_runtime_admin_editor !== true) fail("Preview future backend need missing.");
if (preview.backend_required_now_for_current_static_path !== 0) fail("Preview must record 0 current backend requirement.");
if (preview.backend_activation_approved_now !== 0) fail("Preview must record 0 backend activation approval.");
if (preview.ag27c_allowed_now !== 0) fail("Preview must record 0 AG27C allowed now.");
if (preview.ag27d_allowed_now !== 0) fail("Preview must record 0 AG27D allowed now.");
if (preview.ag28_allowed_now !== 0) fail("Preview must record 0 AG28 allowed now.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");
if (preview.auth_objects !== 0) fail("Preview must record 0 auth objects.");
if (preview.database_objects !== 0) fail("Preview must record 0 database objects.");
if (preview.runtime_queues !== 0) fail("Preview must record 0 runtime queues.");
if (preview.deployments !== 0) fail("Preview must record 0 deployments.");
if (preview.published_items !== 0) fail("Preview must record 0 published items.");

for (const expectedInput of [
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-existing-ag27-handoff-confirmation.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json"
]) {
  if (!assessment.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Assessment did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "backend_need_assessment_created") {
    if (v !== true) fail("backend_need_assessment_created must be true.");
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag27a"]) fail("Missing generate:ag27a script.");
if (!pkg.scripts?.["validate:ag27a"]) fail("Missing validate:ag27a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag27a")) fail("validate:project must include validate:ag27a.");

pass("AG27A Backend Need Assessment is present.");
pass("Backend is identified as a future runtime requirement.");
pass("Current governed path continues static without backend activation.");
pass("AG27B Backend Decision Audit boundary is ready.");
pass("AG27C/AG27D/AG28 remain blocked pending explicit approval.");
pass("No backend, Auth, Supabase, database, secret, runtime queue, deployment or publishing is enabled.");
