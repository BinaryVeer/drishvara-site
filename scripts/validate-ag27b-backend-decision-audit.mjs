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
  console.error(`❌ AG27B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-signal-register.json",
  "data/content-intelligence/backend-decision/ag27a-backend-requirement-matrix.json",
  "data/content-intelligence/backend-decision/ag27a-static-vs-backend-continuation-assessment.json",
  "data/content-intelligence/quality-registry/ag27a-backend-decision-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27a-to-ag27b-backend-decision-audit-boundary.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-existing-ag27-handoff-confirmation.json",

  "data/content-intelligence/quality-reviews/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27b-backend-decision-matrix.json",
  "data/content-intelligence/backend-decision/ag27b-backend-option-audit-register.json",
  "data/content-intelligence/backend-decision/ag27b-backend-prerequisite-audit-register.json",
  "data/content-intelligence/backend-decision/ag27b-conditional-ag27c-ag27d-gate-register.json",
  "data/content-intelligence/backend-decision/ag27b-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag27b-backend-decision-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag27b-backend-decision-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27b-to-ag27z-backend-decision-closure-boundary.json",
  "data/quality/ag27b-backend-decision-audit.json",
  "data/quality/ag27b-backend-decision-audit-preview.json",
  "docs/quality/AG27B_BACKEND_DECISION_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag27b-backend-decision-audit.json");
const audit = readJson("data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json");
const decisionMatrix = readJson("data/content-intelligence/backend-decision/ag27b-backend-decision-matrix.json");
const optionAudit = readJson("data/content-intelligence/backend-decision/ag27b-backend-option-audit-register.json");
const prerequisiteAudit = readJson("data/content-intelligence/backend-decision/ag27b-backend-prerequisite-audit-register.json");
const conditionalGate = readJson("data/content-intelligence/backend-decision/ag27b-conditional-ag27c-ag27d-gate-register.json");
const consumption = readJson("data/content-intelligence/backend-decision/ag27b-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag27b-backend-decision-audit-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag27b-backend-decision-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag27b-to-ag27z-backend-decision-closure-boundary.json");
const registry = readJson("data/quality/ag27b-backend-decision-audit.json");
const preview = readJson("data/quality/ag27b-backend-decision-audit-preview.json");

const ag27a = readJson("data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json");
const existingAg27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const ag26z = readJson("data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json");
const pkg = readJson("package.json");

if (review.status !== "backend_decision_audit_created_ready_for_ag27z") fail("Review status mismatch.");
if (audit.status !== "backend_decision_audit_created_ready_for_ag27z") fail("Audit status mismatch.");
if (audit.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (audit.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (audit.audit_decision.selected_decision !== "continue_static") fail("Selected decision must be continue_static.");
if (audit.audit_decision.backend_planning_approved_now !== false) fail("Backend planning must not be approved now.");
if (audit.audit_decision.backend_activation_approved_now !== false) fail("Backend activation must not be approved now.");
if (audit.audit_decision.supabase_auth_architecture_plan_allowed_now !== false) fail("AG27C must not be allowed now.");
if (audit.audit_decision.security_rls_plan_allowed_now !== false) fail("AG27D must not be allowed now.");
if (audit.audit_decision.skip_ag27c_ag27d_unless_approved !== true) fail("AG27C/AG27D skip guard missing.");
if (audit.audit_decision.proceed_to_ag27z_backend_decision_closure !== true) fail("AG27Z readiness missing.");
if (audit.audit_decision.ag28_allowed_now !== false) fail("AG28 must not be allowed now.");
if (audit.audit_decision.explicit_approval_required_before_ag27c_ag27d_or_ag28 !== true) fail("Explicit approval guard missing.");
if (audit.supabase_auth_backend_deferred !== true) fail("Backend deferral must remain true.");

if (decisionMatrix.status !== "backend_decision_matrix_created_continue_static") fail("Decision matrix status mismatch.");
if (decisionMatrix.selected_decision !== "continue_static") fail("Decision matrix selected decision mismatch.");
if (decisionMatrix.backend_planning_approved_now !== false) fail("Decision matrix must block backend planning.");
if (decisionMatrix.backend_activation_approved_now !== false) fail("Decision matrix must block activation.");
if (decisionMatrix.supabase_auth_architecture_plan_allowed_now !== false) fail("Decision matrix must block AG27C.");
if (decisionMatrix.rls_security_plan_allowed_now !== false) fail("Decision matrix must block AG27D.");
if (decisionMatrix.ag28_allowed_now !== false) fail("Decision matrix must block AG28.");
if (!decisionMatrix.decision_rows.some((row) => row.option_id === "continue_static" && row.selected_now === true)) fail("Continue-static row must be selected.");

if (optionAudit.status !== "backend_option_audit_registered_continue_static") fail("Option audit status mismatch.");
if (optionAudit.final_audit_position !== "continue_static_now_backend_deferred") fail("Option audit final position mismatch.");

if (prerequisiteAudit.status !== "backend_prerequisite_audit_created_not_ready_for_activation") fail("Prerequisite audit status mismatch.");
if (prerequisiteAudit.activation_readiness.backend_ready_now !== false) fail("Backend must not be ready now.");
if (prerequisiteAudit.activation_readiness.auth_ready_now !== false) fail("Auth must not be ready now.");
if (prerequisiteAudit.activation_readiness.supabase_ready_now !== false) fail("Supabase must not be ready now.");
if (prerequisiteAudit.activation_readiness.dynamic_publish_ready_now !== false) fail("Dynamic publish must not be ready now.");
if (!prerequisiteAudit.prerequisites_for_future_backend.some((item) => item.prerequisite_id === "explicit_user_approval" && item.satisfied_now === false)) fail("Explicit approval prerequisite must be unsatisfied.");

if (conditionalGate.status !== "ag27c_ag27d_gate_closed_pending_explicit_approval") fail("Conditional gate status mismatch.");
if (conditionalGate.ag27c_supabase_auth_architecture_plan.allowed_now !== false) fail("AG27C must not be allowed now.");
if (conditionalGate.ag27d_supabase_auth_security_rls_plan.allowed_now !== false) fail("AG27D must not be allowed now.");
if (conditionalGate.direct_to_ag27z_backend_decision_closure !== true) fail("Must route directly to AG27Z.");
if (conditionalGate.ag28_backend_auth_architecture_blueprint_allowed_now !== false) fail("AG28 must not be allowed now.");
if (conditionalGate.explicit_approval_required_before_ag27c_ag27d_or_ag28 !== true) fail("Conditional explicit approval guard missing.");

if (!consumption.future_consumption?.AG27Z) fail("AG27Z consumption note missing.");
if (!consumption.future_consumption?.AG27C) fail("AG27C consumption note missing.");
if (!consumption.future_consumption?.AG27D) fail("AG27D consumption note missing.");
if (!consumption.future_consumption?.AG28) fail("AG28 consumption note missing.");

if (blocker.status !== "backend_decision_audit_runtime_operations_blocked_pending_ag27z") fail("Blocker status mismatch.");
if (readiness.ready_for_ag27z !== true) fail("AG27Z readiness missing.");
if (readiness.selected_decision !== "continue_static") fail("Readiness selected decision mismatch.");
if (readiness.ag27c_allowed_now !== false) fail("AG27C must not be allowed now.");
if (readiness.ag27d_allowed_now !== false) fail("AG27D must not be allowed now.");
if (readiness.ag28_allowed_now !== false) fail("AG28 must not be allowed now.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must not be allowed now.");
if (readiness.explicit_approval_required_before_backend_planning_or_activation !== true) fail("Readiness explicit approval guard missing.");
if (boundary.next_stage_id !== "AG27Z") fail("Boundary must point to AG27Z.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");
if (boundary.explicit_approval_required_before_ag27c !== true) fail("AG27C approval guard missing.");
if (boundary.explicit_approval_required_before_ag27d !== true) fail("AG27D approval guard missing.");
if (boundary.explicit_approval_required_before_ag28 !== true) fail("AG28 approval guard missing.");

if (review.summary.backend_decision_audit_created !== true) fail("Review summary missing.");
if (review.summary.selected_decision !== "continue_static") fail("Review selected decision mismatch.");
if (review.summary.continue_static_now !== true) fail("Review must continue static.");
if (review.summary.ready_for_ag27z !== true) fail("Review AG27Z readiness missing.");
if (review.summary.backend_planning_approved_now !== false) fail("Review must block backend planning.");
if (review.summary.backend_activation_approved_now !== false) fail("Review must block backend activation.");
if (review.summary.ag27c_allowed_now !== false) fail("Review must block AG27C.");
if (review.summary.ag27d_allowed_now !== false) fail("Review must block AG27D.");
if (review.summary.ag28_allowed_now !== false) fail("Review must block AG28.");

for (const flag of [
  "backend_enabled",
  "auth_enabled",
  "supabase_enabled",
  "database_created",
  "migration_created",
  "rls_policy_created",
  "secret_created",
  "runtime_queue_created",
  "runtime_write_enabled",
  "deployment_done",
  "publishing_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must remain false.`);
}

if (ag27a.assessment_decision.continue_static_now !== true) fail("AG27A must continue static.");
if (ag27a.assessment_decision.backend_activation_approved_now !== false) fail("AG27A must block backend activation.");
if (existingAg27.checkpoint_decision.backend_deferred !== true) fail("Existing AG27 backend deferral must remain true.");
if (existingAg27.checkpoint_decision.ag28_to_ag40_allowed_now !== false) fail("Existing AG27 must keep AG28-AG40 blocked.");
if (ag26z.closure_decision.do_not_start_ag28_without_explicit_approval !== true) fail("AG26Z must block AG28.");

if (registry.status !== "backend_decision_audit_created_ready_for_ag27z") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.selected_decision !== "continue_static") fail("Preview decision mismatch.");
if (preview.backend_planning_approved_now !== 0) fail("Preview must record 0 backend planning approval.");
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
  "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-signal-register.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-existing-ag27-handoff-confirmation.json"
]) {
  if (!audit.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Audit did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "backend_decision_audit_created" || k === "continue_static_decision_preserved") {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag27b"]) fail("Missing generate:ag27b script.");
if (!pkg.scripts?.["validate:ag27b"]) fail("Missing validate:ag27b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag27b")) fail("validate:project must include validate:ag27b.");

pass("AG27B Backend Decision Audit is present.");
pass("Decision is continue-static/backend-deferred.");
pass("AG27C and AG27D are skipped unless explicitly approved.");
pass("AG27Z Backend Decision Closure boundary is ready.");
pass("AG28 remains blocked pending explicit approval.");
pass("No backend, Auth, Supabase, database, RLS, secret, runtime queue, deployment or publishing is enabled.");
