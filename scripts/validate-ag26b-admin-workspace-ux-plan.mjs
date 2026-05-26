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
  console.error(`❌ AG26B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-surface-map.json",
  "data/content-intelligence/admin-editor/ag26a-editor-auto-article-tool-inventory.json",
  "data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json",
  "data/content-intelligence/quality-reviews/ag26a-editor-admin-assignment-alignment.json",
  "data/content-intelligence/quality-registry/ag26a-admin-workspace-ux-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26a-to-ag26b-admin-workspace-ux-plan-boundary.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-role-permission-planning-model.json",
  "data/content-intelligence/admin-editor/ag26-manual-review-queue-workflow-model.json",
  "data/content-intelligence/admin-editor/ag26-editorial-approval-gate-model.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-readiness-matrix.json",
  "data/content-intelligence/featured-reads/ag25z-unresolved-featured-reads-work-register.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",

  "data/content-intelligence/quality-reviews/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-surface-map.json",
  "data/content-intelligence/admin-editor/ag26b-admin-assignment-control-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-review-action-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-evidence-delta-review-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-tool-governance-model.json",
  "data/content-intelligence/admin-editor/ag26b-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag26b-admin-workspace-ux-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag26b-static-ux-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26b-to-ag26c-static-ux-scaffold-boundary.json",
  "data/quality/ag26b-admin-workspace-ux-plan.json",
  "data/quality/ag26b-admin-workspace-ux-plan-preview.json",
  "docs/quality/AG26B_ADMIN_WORKSPACE_UX_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag26b-admin-workspace-ux-plan.json");
const plan = readJson("data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json");
const workspaceMap = readJson("data/content-intelligence/admin-editor/ag26b-admin-workspace-surface-map.json");
const assignmentControl = readJson("data/content-intelligence/admin-editor/ag26b-admin-assignment-control-model.json");
const reviewAction = readJson("data/content-intelligence/admin-editor/ag26b-admin-review-action-model.json");
const evidenceDelta = readJson("data/content-intelligence/admin-editor/ag26b-admin-evidence-delta-review-model.json");
const toolGovernance = readJson("data/content-intelligence/admin-editor/ag26b-admin-tool-governance-model.json");
const consumption = readJson("data/content-intelligence/admin-editor/ag26b-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag26b-admin-workspace-ux-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag26b-static-ux-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag26b-to-ag26c-static-ux-scaffold-boundary.json");
const registry = readJson("data/quality/ag26b-admin-workspace-ux-plan.json");
const preview = readJson("data/quality/ag26b-admin-workspace-ux-plan-preview.json");
const ag26a = readJson("data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json");
const ag26aAlignment = readJson("data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json");
const ag26aReadiness = readJson("data/content-intelligence/quality-registry/ag26a-admin-workspace-ux-plan-readiness-record.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (review.status !== "admin_workspace_ux_plan_created_ready_for_ag26c") fail("Review status mismatch.");
if (plan.status !== "admin_workspace_ux_plan_created_ready_for_ag26c") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.ux_scope.next_stage !== "AG26C") fail("Next stage must be AG26C.");

if (plan.admin_governance.admin_is_assignment_originator !== true) fail("Admin must be assignment originator.");
if (plan.admin_governance.admin_assigns_work_to_editor !== true) fail("Admin must assign work to Editor.");
if (plan.admin_governance.admin_receives_work_back_from_editor !== true) fail("Admin must receive work back from Editor.");
if (plan.admin_governance.admin_final_clearance_authority !== true) fail("Admin must be final clearance authority.");
if (plan.admin_governance.editor_independent_creation_blocked !== true) fail("Editor independent creation must remain blocked.");
if (plan.admin_governance.editor_global_browse_blocked !== true) fail("Editor global browse must remain blocked.");
if (plan.admin_governance.admin_publish_actions_execute_now !== false) fail("Admin publish actions must not execute now.");

for (const flag of [
  "admin_workspace_runtime_allowed_in_ag26b",
  "admin_login_creation_allowed_in_ag26b",
  "auth_activation_allowed_in_ag26b",
  "backend_activation_allowed_in_ag26b",
  "assignment_runtime_allowed_in_ag26b",
  "assignment_data_write_allowed_in_ag26b",
  "admin_review_action_execution_allowed_in_ag26b",
  "archive_execution_allowed_in_ag26b",
  "return_for_correction_execution_allowed_in_ag26b",
  "publish_execution_allowed_in_ag26b",
  "publish_and_close_execution_allowed_in_ag26b",
  "article_file_mutation_allowed_in_ag26b",
  "public_mutation_allowed_in_ag26b",
  "deployment_allowed_in_ag26b"
]) {
  if (plan[flag] !== false) fail(`${flag} must be false.`);
}
if (plan.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (workspaceMap.status !== "admin_workspace_surface_map_created_no_runtime_ui") fail("Workspace map status mismatch.");
if (workspaceMap.surface_count !== workspaceMap.surfaces.length) fail("Surface count mismatch.");
if (workspaceMap.surface_count < 12) fail("At least 12 Admin surfaces must be planned.");
for (const surface of workspaceMap.surfaces) {
  if (surface.runtime_enabled !== false) fail(`${surface.surface_id} must not be runtime enabled.`);
}
for (const requiredSurface of [
  "assignment_control_panel",
  "editor_return_review_panel",
  "evidence_review_panel",
  "delta_review_panel",
  "return_for_correction_panel",
  "archive_panel",
  "publish_decision_panel",
  "tool_approval_panel"
]) {
  if (!workspaceMap.surfaces.some((surface) => surface.surface_id === requiredSurface)) fail(`Missing Admin surface: ${requiredSurface}`);
}

if (assignmentControl.status !== "admin_assignment_control_model_created_no_runtime_queue") fail("Assignment control status mismatch.");
if (assignmentControl.admin_is_assignment_originator !== true) fail("Admin assignment originator missing.");
if (assignmentControl.editor_self_assignment_allowed !== false) fail("Editor self-assignment must be false.");
if (assignmentControl.assignment_runtime_enabled !== false) fail("Assignment runtime must be false.");
if (assignmentControl.assignment_data_write_allowed !== false) fail("Assignment write must be false.");
for (const requiredAction of ["assign_new_draft_to_editor", "assign_existing_article_to_editor", "receive_editor_return"]) {
  if (!assignmentControl.assignment_actions.some((action) => action.action_id === requiredAction)) fail(`Missing assignment action: ${requiredAction}`);
}
for (const action of assignmentControl.assignment_actions) {
  if (action.execution_enabled !== false) fail(`${action.action_id} execution must be false.`);
}

if (reviewAction.status !== "admin_review_action_model_created_no_live_action") fail("Review action status mismatch.");
for (const roadmapAction of ["Archive", "Return for correction", "Publish", "Publish and close"]) {
  if (!reviewAction.planned_actions_named_in_roadmap.includes(roadmapAction)) fail(`Missing roadmap action: ${roadmapAction}`);
}
if (reviewAction.publish_actions_planned_only !== true) fail("Publish actions must be plan-only.");
if (reviewAction.publish_execution_allowed_in_ag26b !== false) fail("Publish execution must be false.");
if (reviewAction.public_visibility_change_allowed_in_ag26b !== false) fail("Public visibility change must be false.");
if (reviewAction.publish_approved_change_allowed_in_ag26b !== false) fail("Publish approved change must be false.");
if (reviewAction.github_write_allowed_in_ag26b !== false) fail("GitHub write must be false.");
if (reviewAction.deployment_allowed_in_ag26b !== false) fail("Deployment must be false.");
for (const requiredAction of ["archive", "return_for_correction", "publish_plan_only", "publish_and_close_plan_only"]) {
  if (!reviewAction.admin_review_actions.some((action) => action.action_id === requiredAction)) fail(`Missing Admin review action: ${requiredAction}`);
}
for (const action of reviewAction.admin_review_actions) {
  if (action.execution_enabled !== false) fail(`${action.action_id} execution must be false.`);
  if (action.public_mutation_allowed !== false) fail(`${action.action_id} public mutation must be false.`);
}

if (evidenceDelta.status !== "admin_evidence_delta_review_model_created_no_file_mutation") fail("Evidence/delta model status mismatch.");
if (!evidenceDelta.evidence_checklist.includes("editor_return_note")) fail("Editor return note evidence missing.");
if (!evidenceDelta.evidence_checklist.includes("intended_file_delta_summary")) fail("Intended file delta summary missing.");
if (!evidenceDelta.delta_review_fields.includes("proposed_homepage_delta")) fail("Homepage delta field missing.");
if (evidenceDelta.evidence_review_required_before_future_publish !== true) fail("Evidence review must be required before future publish.");
if (evidenceDelta.delta_review_required_before_future_publish !== true) fail("Delta review must be required before future publish.");
if (evidenceDelta.file_mutation_allowed_in_ag26b !== false) fail("File mutation must be false.");
if (evidenceDelta.public_surface_mutation_allowed_in_ag26b !== false) fail("Public surface mutation must be false.");

if (toolGovernance.status !== "admin_tool_governance_model_created_no_tool_execution") fail("Tool governance status mismatch.");
if (toolGovernance.tool_execution_allowed_in_ag26b !== false) fail("Tool execution must be false.");
if (toolGovernance.object_generation_allowed_in_ag26b !== false) fail("Object generation must be false.");
if (toolGovernance.image_generation_allowed_in_ag26b !== false) fail("Image generation must be false.");
if (toolGovernance.editor_tool_use_requires_admin_assignment !== true) fail("Editor tool use must require Admin assignment.");

if (!consumption.future_consumption?.AG26C) fail("AG26C consumption note missing.");
if (!consumption.future_consumption?.AG26D) fail("AG26D consumption note missing.");
if (!consumption.future_consumption?.AG26Z) fail("AG26Z consumption note missing.");
if (!consumption.future_consumption?.future_publish_path) fail("Future publish path note missing.");
if (blocker.status !== "admin_workspace_ux_operations_blocked_pending_ag26c") fail("Blocker status mismatch.");
if (readiness.ready_for_ag26c !== true) fail("AG26C readiness missing.");
if (boundary.next_stage_id !== "AG26C") fail("AG26C boundary missing.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");
if (boundary.admin_final_clearance_required !== true) fail("Boundary must require Admin final clearance.");
if (!boundary.editor_workflow_rule.includes("Admin assigns item to Editor")) fail("Boundary must preserve Admin→Editor→Admin workflow.");

if (review.summary.admin_workspace_ux_plan_created !== true) fail("Review summary missing.");
if (review.summary.archive_action_planned !== true) fail("Archive action summary missing.");
if (review.summary.return_for_correction_action_planned !== true) fail("Return for correction summary missing.");
if (review.summary.publish_action_planned_only !== true) fail("Publish plan-only summary missing.");
if (review.summary.publish_and_close_action_planned_only !== true) fail("Publish-and-close plan-only summary missing.");
if (review.summary.evidence_review_planned !== true) fail("Evidence review summary missing.");
if (review.summary.delta_review_planned !== true) fail("Delta review summary missing.");
if (review.summary.ready_for_ag26c !== true) fail("AG26C readiness summary missing.");

for (const flag of [
  "admin_workspace_runtime_created",
  "admin_login_created",
  "auth_enabled",
  "backend_enabled",
  "assignment_write_done",
  "admin_review_action_executed",
  "publish_executed",
  "public_mutation_done",
  "deployment_done",
  "publishing_done",
  "backend_activation_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must remain false.`);
}

if (ag26a.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") fail("AG26A plan status mismatch.");
if (ag26aReadiness.ready_for_ag26b !== true) fail("AG26A readiness must allow AG26B.");
if (ag26aAlignment.alignment_decision.editor_can_only_work_on_admin_assigned_items !== true) fail("AG26A assignment rule missing.");
if (ag26aAlignment.alignment_decision.editor_returns_work_to_admin !== true) fail("AG26A return-to-admin rule missing.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");
if (registry.status !== "admin_workspace_ux_plan_created_ready_for_ag26c") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.admin_logins_created !== 0) fail("Preview must record 0 Admin logins.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth enabled.");
if (preview.backend_enabled !== 0) fail("Preview must record 0 backend enabled.");
if (preview.assignment_writes !== 0) fail("Preview must record 0 assignment writes.");
if (preview.executed_review_actions !== 0) fail("Preview must record 0 executed review actions.");
if (preview.executed_publish_actions !== 0) fail("Preview must record 0 executed publish actions.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json",
  "data/content-intelligence/admin-editor/ag26a-editor-auto-article-tool-inventory.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag26b"]) fail("Missing generate:ag26b script.");
if (!pkg.scripts?.["validate:ag26b"]) fail("Missing validate:ag26b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag26b")) fail("validate:project must include validate:ag26b.");

pass("AG26B Admin Workspace UX Plan is present.");
pass("Admin assignment control and Editor-return workflow are valid.");
pass("Archive, Return for correction, Publish and Publish-and-close are planned but non-executable.");
pass("Evidence review and delta review models are valid.");
pass("AG26C Static UX Scaffold boundary is ready.");
pass("No Admin login, Auth, backend, queue mutation, assignment write, publish execution, GitHub write, deployment or publishing is enabled.");
