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
  console.error(`❌ AG26Z validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/quality-reviews/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json",
  "data/content-intelligence/quality-reviews/ag26a-editor-admin-assignment-alignment.json",
  "data/content-intelligence/quality-reviews/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26b-admin-assignment-control-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-review-action-model.json",
  "data/content-intelligence/quality-reviews/ag26c-static-ux-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-static-ux-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-static-screen-registry.json",
  "data/content-intelligence/admin-editor/ag26c-static-component-registry.json",
  "data/content-intelligence/admin-editor/ag26c-admin-editor-role-flow-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-static-ux-non-execution-model.json",
  "data/content-intelligence/quality-reviews/ag26d-ux-scaffold-audit.json",
  "data/content-intelligence/admin-editor/ag26d-ux-scaffold-audit.json",
  "data/content-intelligence/admin-editor/ag26d-role-separation-audit-model.json",
  "data/content-intelligence/admin-editor/ag26d-no-live-action-audit-model.json",
  "data/content-intelligence/admin-editor/ag26d-audit-findings-register.json",
  "data/content-intelligence/quality-registry/ag26d-manual-admin-editor-workflow-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26d-to-ag26z-manual-admin-editor-workflow-closure-boundary.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/backend-decision/ag27-backend-deferral-record.json",
  "data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json",

  "data/content-intelligence/quality-reviews/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-ag26-detailed-source-chain-register.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",
  "data/content-intelligence/admin-editor/ag26z-non-activation-closure-register.json",
  "data/content-intelligence/admin-editor/ag26z-ag27-backend-deferral-carry-forward.json",
  "data/content-intelligence/admin-editor/ag26z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag26z-manual-admin-editor-workflow-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag26z-post-closure-roadmap-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26z-to-post-ag26-roadmap-boundary.json",
  "data/quality/ag26z-manual-admin-editor-workflow-closure.json",
  "data/quality/ag26z-manual-admin-editor-workflow-closure-preview.json",
  "docs/quality/AG26Z_MANUAL_ADMIN_EDITOR_WORKFLOW_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag26z-manual-admin-editor-workflow-closure.json");
const closure = readJson("data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json");
const sourceChain = readJson("data/content-intelligence/admin-editor/ag26z-ag26-detailed-source-chain-register.json");
const roleGovernance = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const nonActivation = readJson("data/content-intelligence/admin-editor/ag26z-non-activation-closure-register.json");
const backendCarry = readJson("data/content-intelligence/admin-editor/ag26z-ag27-backend-deferral-carry-forward.json");
const consumption = readJson("data/content-intelligence/admin-editor/ag26z-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag26z-manual-admin-editor-workflow-closure-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag26z-post-closure-roadmap-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag26z-to-post-ag26-roadmap-boundary.json");
const registry = readJson("data/quality/ag26z-manual-admin-editor-workflow-closure.json");
const preview = readJson("data/quality/ag26z-manual-admin-editor-workflow-closure-preview.json");

const ag26d = readJson("data/content-intelligence/admin-editor/ag26d-ux-scaffold-audit.json");
const ag26dReadiness = readJson("data/content-intelligence/quality-registry/ag26d-manual-admin-editor-workflow-closure-readiness-record.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const ag27Boundary = readJson("data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "manual_admin_editor_workflow_closed_ag27_backend_deferred") fail("Review status mismatch.");
if (closure.status !== "manual_admin_editor_workflow_closed_ag27_backend_deferred") fail("Closure status mismatch.");
if (closure.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (closure.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (closure.closure_decision.ag26_detailed_chain_closed !== true) fail("AG26 detailed chain must be closed.");
if (closure.closure_decision.ag26a_to_ag26d_closed !== true) fail("AG26A-AG26D closure missing.");
if (closure.closure_decision.role_governance_closed !== true) fail("Role governance closure missing.");
if (closure.closure_decision.non_activation_closed !== true) fail("Non-activation closure missing.");
if (closure.closure_decision.ag27_consumed !== true) fail("AG27 must be consumed.");
if (closure.closure_decision.ag27_already_completed !== true) fail("AG27 already completed flag missing.");
if (closure.closure_decision.backend_deferred !== true) fail("Backend must remain deferred.");
if (closure.closure_decision.ag28_blocked_pending_explicit_approval !== true) fail("AG28 must be blocked.");
if (closure.closure_decision.ready_for_backend_activation !== false) fail("Backend activation readiness must be false.");
if (closure.closure_decision.ready_for_publish_execution !== false) fail("Publish execution readiness must be false.");
if (closure.closure_decision.ready_for_deployment !== false) fail("Deployment readiness must be false.");
if (closure.closure_decision.ready_for_public_mutation !== false) fail("Public mutation readiness must be false.");

if (sourceChain.chain_length !== 4) fail("AG26 source chain must contain 4 detailed stages.");
for (const stage of ["AG26A", "AG26B", "AG26C", "AG26D"]) {
  if (!sourceChain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage: ${stage}`);
}

if (roleGovernance.status !== "admin_editor_role_governance_closed") fail("Role governance status mismatch.");
if (roleGovernance.role_rules.admin_assigns_work_to_editor !== true) fail("Admin assignment rule missing.");
if (roleGovernance.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only rule missing.");
if (roleGovernance.role_rules.editor_cannot_create_independent_article !== true) fail("Editor independent creation block missing.");
if (roleGovernance.role_rules.editor_cannot_browse_all_articles !== true) fail("Editor global browse block missing.");
if (roleGovernance.role_rules.editor_cannot_self_assign !== true) fail("Editor self-assignment block missing.");
if (roleGovernance.role_rules.editor_cannot_publish !== true) fail("Editor publish block missing.");
if (roleGovernance.role_rules.editor_sends_work_back_to_admin !== true) fail("Editor return-to-Admin rule missing.");
if (roleGovernance.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (roleGovernance.role_rules.publish_actions_plan_only !== true) fail("Publish actions must be plan-only.");
if (roleGovernance.role_rules.publish_actions_execute_now !== false) fail("Publish actions must not execute now.");

if (nonActivation.status !== "ag26_closed_no_runtime_no_publish_no_backend") fail("Non-activation closure status mismatch.");
for (const [key, value] of Object.entries(nonActivation.closure_guards)) {
  if (value !== true) fail(`Non-activation guard must be true: ${key}`);
}

if (backendCarry.status !== "ag27_backend_deferral_consumed_and_carried_forward") fail("Backend carry-forward status mismatch.");
if (backendCarry.backend_deferred !== true) fail("Backend carry-forward must defer backend.");
if (backendCarry.auth_deferred !== true) fail("Auth carry-forward must defer auth.");
if (backendCarry.supabase_deferred !== true) fail("Supabase carry-forward must defer supabase.");
if (backendCarry.backend_activation_approved !== false) fail("Backend activation must be unapproved.");
if (backendCarry.ag28_allowed_now !== false) fail("AG28 must not be allowed now.");
if (backendCarry.explicit_approval_required_before_ag28 !== true) fail("Explicit approval before AG28 required.");

if (!consumption.future_consumption?.AG27) fail("AG27 consumption note missing.");
if (!consumption.future_consumption?.AG28_to_AG40) fail("AG28-AG40 consumption note missing.");
if (!consumption.future_consumption?.static_continuation) fail("Static continuation note missing.");
if (blocker.status !== "ag26_closed_runtime_operations_blocked") fail("Blocker status mismatch.");

if (readiness.status !== "ag26z_closed_ag27_already_completed_ag28_blocked") fail("Readiness status mismatch.");
if (readiness.ag26z_closed !== true) fail("AG26Z closed flag missing.");
if (readiness.ag27_already_completed !== true) fail("AG27 already completed readiness missing.");
if (readiness.ready_for_ag28_backend_activation !== false) fail("AG28 backend readiness must be false.");
if (readiness.explicit_approval_required_for_ag28 !== true) fail("Explicit approval for AG28 required.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must not be allowed.");

if (boundary.status !== "post_ag26_boundary_created_ag28_blocked") fail("Boundary status mismatch.");
if (!boundary.next_roadmap_position.includes("AG27 already completed")) fail("Boundary must state AG27 already completed.");
if (boundary.explicit_approval_required_before_ag28 !== true) fail("Boundary must require explicit approval before AG28.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");

if (review.summary.manual_admin_editor_workflow_closed !== true) fail("Review closure summary missing.");
if (review.summary.ag26_detailed_chain_closed !== true) fail("AG26 detailed closure summary missing.");
if (review.summary.detailed_stages_closed !== 4) fail("Detailed stages closed must be 4.");
if (review.summary.role_governance_closed !== true) fail("Role governance summary missing.");
if (review.summary.non_activation_closed !== true) fail("Non-activation summary missing.");
if (review.summary.ag27_already_completed !== true) fail("AG27 already completed summary missing.");
if (review.summary.ag27_backend_deferred !== true) fail("AG27 backend deferral summary missing.");
if (review.summary.ag28_blocked_pending_explicit_approval !== true) fail("AG28 blocked summary missing.");
if (review.summary.ready_for_backend_activation !== false) fail("Backend readiness summary must be false.");
if (review.summary.ready_for_publish_execution !== false) fail("Publish readiness summary must be false.");

for (const flag of [
  "runtime_ui_created",
  "live_route_created",
  "admin_login_created",
  "editor_login_created",
  "auth_enabled",
  "backend_enabled",
  "assignment_write_done",
  "review_action_executed",
  "article_file_mutation_done",
  "object_generation_done",
  "publish_executed",
  "public_mutation_done",
  "deployment_done",
  "publishing_done",
  "backend_activation_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must remain false.`);
}

if (ag26d.status !== "ux_scaffold_audit_created_ready_for_ag26z") fail("AG26D source audit status mismatch.");
if (ag26d.audit_passed !== true) fail("AG26D source audit must pass.");
if (ag26dReadiness.ready_for_ag26z !== true) fail("AG26D readiness must allow AG26Z.");
if (ag27.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") fail("AG27 status mismatch.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");
if (ag27.checkpoint_decision.backend_activation_approved !== false) fail("AG27 backend activation must remain unapproved.");
if (ag27Boundary.explicit_approval_required !== true) fail("AG27 boundary must require explicit approval.");

if (registry.status !== "manual_admin_editor_workflow_closed_ag27_backend_deferred") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.ag26z_closed !== true) fail("Preview must mark AG26Z closed.");
if (preview.ag27_already_completed !== true) fail("Preview must mark AG27 completed.");
if (preview.ag28_allowed_now !== 0) fail("Preview must mark AG28 not allowed.");
if (preview.backend_activation_ready !== 0) fail("Preview must record 0 backend readiness.");
if (preview.publish_execution_ready !== 0) fail("Preview must record 0 publish readiness.");
if (preview.runtime_ui_created !== 0) fail("Preview must record 0 runtime UI.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.backend_enabled !== 0) fail("Preview must record 0 backend.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26c-static-ux-scaffold.json",
  "data/content-intelligence/admin-editor/ag26d-ux-scaffold-audit.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
]) {
  if (!closure.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Closure did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "ag26_manual_admin_editor_workflow_closed") {
    if (v !== true) fail("ag26_manual_admin_editor_workflow_closed must be true.");
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag26z"]) fail("Missing generate:ag26z script.");
if (!pkg.scripts?.["validate:ag26z"]) fail("Missing validate:ag26z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag26z")) fail("validate:project must include validate:ag26z.");

pass("AG26Z Manual Admin/Editor Workflow Closure is present.");
pass("AG26A-AG26D detailed chain is closed.");
pass("Role governance and Admin-assigned Editor workflow are closed.");
pass("Non-activation/no-publish/no-backend closure is valid.");
pass("AG27 backend deferral is consumed and carried forward.");
pass("AG28 remains blocked pending explicit approval.");
