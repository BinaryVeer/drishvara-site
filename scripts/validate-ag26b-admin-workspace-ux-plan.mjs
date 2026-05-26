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
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-authoring-and-admin-assigned-edit-policy.json",
  "data/content-intelligence/quality-registry/ag26a-admin-workspace-ux-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26a-to-ag26b-admin-workspace-ux-plan-boundary.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",

  "data/content-intelligence/quality-reviews/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-surface-map.json",
  "data/content-intelligence/admin-editor/ag26b-admin-review-queue-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-to-editor-assignment-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-tool-approval-governance-model.json",
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
const queueModel = readJson("data/content-intelligence/admin-editor/ag26b-admin-review-queue-model.json");
const assignmentModel = readJson("data/content-intelligence/admin-editor/ag26b-admin-to-editor-assignment-model.json");
const publishModel = readJson("data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json");
const toolApprovalModel = readJson("data/content-intelligence/admin-editor/ag26b-admin-tool-approval-governance-model.json");
const consumption = readJson("data/content-intelligence/admin-editor/ag26b-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag26b-admin-workspace-ux-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag26b-static-ux-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag26b-to-ag26c-static-ux-scaffold-boundary.json");
const registry = readJson("data/quality/ag26b-admin-workspace-ux-plan.json");
const preview = readJson("data/quality/ag26b-admin-workspace-ux-plan-preview.json");
const ag26a = readJson("data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json");
const routing = readJson("data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json");
const ag26aReadiness = readJson("data/content-intelligence/quality-registry/ag26a-admin-workspace-ux-plan-readiness-record.json");
const ag25z = readJson("data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (review.status !== "admin_workspace_ux_plan_created_ready_for_ag26c") fail("Review status mismatch.");
if (plan.status !== "admin_workspace_ux_plan_created_ready_for_ag26c") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.ux_scope.next_stage !== "AG26C") fail("Next stage must be AG26C.");

if (plan.admin_workspace_runtime_allowed_in_ag26b !== false) fail("Admin workspace runtime must be blocked.");
if (plan.admin_login_creation_allowed_in_ag26b !== false) fail("Admin login creation must be blocked.");
if (plan.auth_activation_allowed_in_ag26b !== false) fail("Auth activation must be blocked.");
if (plan.backend_activation_allowed_in_ag26b !== false) fail("Backend activation must be blocked.");
if (plan.admin_review_queue_runtime_allowed_in_ag26b !== false) fail("Admin review queue runtime must be blocked.");
if (plan.assignment_queue_runtime_allowed_in_ag26b !== false) fail("Assignment queue runtime must be blocked.");
if (plan.article_file_mutation_allowed_in_ag26b !== false) fail("Article mutation must be blocked.");
if (plan.object_generation_allowed_in_ag26b !== false) fail("Object generation must be blocked.");
if (plan.publish_runtime_allowed_in_ag26b !== false) fail("Publish runtime must be blocked.");
if (plan.publication_allowed_in_ag26b !== false) fail("Publication must be blocked.");
if (plan.deployment_allowed_in_ag26b !== false) fail("Deployment must be blocked.");
if (plan.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (plan.routing_governance.system_generated_content_first_goes_to_admin !== true) fail("System content must go to Admin first.");
if (plan.routing_governance.editor_new_article_candidate_goes_to_admin !== true) fail("Editor new candidate must go to Admin.");
if (plan.routing_governance.editor_returned_content_goes_to_admin !== true) fail("Editor returned content must go to Admin.");
if (plan.routing_governance.admin_final_publish_authority !== true) fail("Admin final publish authority missing.");
if (plan.routing_governance.editor_publish_authority !== false) fail("Editor publish authority must be false.");
if (plan.routing_governance.system_publish_without_admin !== false) fail("System publish without Admin must be false.");

if (workspaceMap.status !== "admin_workspace_surface_map_created_no_runtime_ui") fail("Workspace map status mismatch.");
if (workspaceMap.surface_count !== workspaceMap.surfaces.length) fail("Surface count mismatch.");
if (workspaceMap.surface_count < 10) fail("At least 10 Admin surfaces must be planned.");
for (const requiredSurface of [
  "system_generated_content_inbox",
  "editor_created_candidate_inbox",
  "editor_returned_content_inbox",
  "assign_to_editor_panel",
  "admin_publish_control_panel"
]) {
  if (!workspaceMap.surfaces.some((surface) => surface.surface_id === requiredSurface)) fail(`Missing Admin surface: ${requiredSurface}`);
}
for (const surface of workspaceMap.surfaces) {
  if (surface.runtime_enabled !== false) fail(`${surface.surface_id} must not be runtime enabled.`);
}

if (queueModel.status !== "admin_review_queue_model_created_no_runtime_queue") fail("Queue model status mismatch.");
if (queueModel.runtime_queue_created !== false) fail("Runtime queue must not be created.");
if (queueModel.routing_rules_applied.system_generated_content_first_goes_to_admin !== true) fail("Queue model must route system content to Admin.");
if (queueModel.routing_rules_applied.editor_direct_publish_allowed !== false) fail("Editor direct publish must be blocked in queue model.");
if (queueModel.routing_rules_applied.admin_final_publish_authority !== true) fail("Admin publish authority missing in queue model.");

if (assignmentModel.status !== "admin_to_editor_assignment_model_created_no_queue_mutation") fail("Assignment model status mismatch.");
if (assignmentModel.editor_assignment_allowed_in_future !== true) fail("Admin-to-Editor future assignment must be planned.");
if (assignmentModel.assignment_queue_runtime_created !== false) fail("Assignment queue runtime must be false.");
if (assignmentModel.assignment_data_write_allowed_in_ag26b !== false) fail("Assignment data write must be blocked.");

if (publishModel.status !== "admin_final_publish_control_model_created_no_publish") fail("Publish model status mismatch.");
if (publishModel.final_publish_authority !== "admin_only") fail("Final publish authority must be admin_only.");
if (publishModel.admin_publish_authority_planned !== true) fail("Admin publish authority must be planned.");
if (publishModel.editor_publish_authority !== false) fail("Editor publish authority must be false.");
if (publishModel.system_publish_without_admin !== false) fail("System publish without Admin must be false.");
if (publishModel.publish_runtime_enabled_in_ag26b !== false) fail("Publish runtime must be blocked.");
if (publishModel.github_write_enabled_in_ag26b !== false) fail("GitHub write must be blocked.");
if (publishModel.deployment_enabled_in_ag26b !== false) fail("Deployment must be blocked.");

if (toolApprovalModel.status !== "admin_tool_approval_governance_model_created_no_generation") fail("Tool approval status mismatch.");
if (toolApprovalModel.object_generation_allowed_in_ag26b !== false) fail("Object generation must be blocked.");
if (toolApprovalModel.tool_runtime_execution_allowed_in_ag26b !== false) fail("Tool runtime execution must be blocked.");
if (!Array.isArray(toolApprovalModel.governed_tool_groups) || toolApprovalModel.governed_tool_groups.length < 10) fail("Tool approval model must consume AG26A tool groups.");

if (!consumption.future_consumption?.AG26C) fail("AG26C consumption note missing.");
if (!consumption.future_consumption?.AG26D) fail("AG26D consumption note missing.");
if (!consumption.future_consumption?.AG26Z) fail("AG26Z consumption note missing.");
if (blocker.status !== "admin_workspace_ux_operations_blocked_pending_ag26c") fail("Blocker status mismatch.");
if (readiness.ready_for_ag26c !== true) fail("AG26C readiness missing.");
if (boundary.next_stage_id !== "AG26C") fail("AG26C boundary missing.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");

if (review.summary.admin_workspace_ux_plan_created !== true) fail("Review summary missing.");
if (review.summary.system_generated_content_first_goes_to_admin !== true) fail("Review must preserve Admin-first system flow.");
if (review.summary.admin_core_reviewer_for_system_generated_content !== true) fail("Review must preserve Admin core reviewer role.");
if (review.summary.admin_final_publish_authority !== true) fail("Review must preserve Admin publish authority.");
if (review.summary.editor_publish_authority !== false) fail("Review must block Editor publishing.");
if (review.summary.ready_for_ag26c !== true) fail("AG26C readiness summary missing.");
if (review.summary.admin_workspace_runtime_created !== false) fail("Admin runtime must remain false.");
if (review.summary.admin_login_created !== false) fail("Admin login must remain false.");
if (review.summary.auth_enabled !== false) fail("Auth must remain false.");
if (review.summary.backend_enabled !== false) fail("Backend must remain false.");
if (review.summary.queue_mutation_done !== false) fail("Queue mutation must remain false.");
if (review.summary.article_file_mutation_done !== false) fail("Article mutation must remain false.");
if (review.summary.object_generation_done !== false) fail("Object generation must remain false.");
if (review.summary.deployment_done !== false) fail("Deployment must remain false.");
if (review.summary.publishing_done !== false) fail("Publishing must remain false.");

if (ag26a.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") fail("AG26A source status mismatch.");
if (routing.role_routing_rules.admin_final_publish_authority !== true) fail("AG26A routing must preserve Admin publish authority.");
if (routing.role_routing_rules.editor_publish_authority !== false) fail("AG26A routing must block Editor publishing.");
if (ag26aReadiness.ready_for_ag26b !== true) fail("AG26A readiness must allow AG26B.");
if (ag25z.closure_decision.ready_for_ag26a !== true) fail("AG25Z must allow AG26A/AG26B chain.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");

if (registry.status !== "admin_workspace_ux_plan_created_ready_for_ag26c") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.admin_final_publish_authority !== true) fail("Preview must show Admin publish authority.");
if (preview.editor_publish_authority !== 0) fail("Preview must record 0 Editor publish authority.");
if (preview.admin_logins_created !== 0) fail("Preview must record 0 Admin logins.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth enabled.");
if (preview.backend_enabled !== 0) fail("Preview must record 0 backend enabled.");
if (preview.queue_mutations !== 0) fail("Preview must record 0 queue mutations.");
if (preview.mutated_articles !== 0) fail("Preview must record 0 mutated articles.");
if (preview.generated_objects !== 0) fail("Preview must record 0 generated objects.");
if (preview.published_items !== 0) fail("Preview must record 0 published items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-authoring-and-admin-assigned-edit-policy.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
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
pass("Admin surfaces, review queue, assignment, publish-control and tool-approval models are valid.");
pass("System-generated content goes to Admin first.");
pass("Editor-created and Editor-returned content routes to Admin.");
pass("Admin is final publish authority and Editor publish authority remains blocked.");
pass("AG26C Static UX Scaffold boundary is ready.");
pass("No Admin login, Auth, backend, queue mutation, article mutation, object generation, GitHub write, deployment or publishing is enabled.");
