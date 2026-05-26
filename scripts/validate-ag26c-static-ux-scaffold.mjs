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
  console.error(`❌ AG26C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-surface-map.json",
  "data/content-intelligence/admin-editor/ag26b-admin-assignment-control-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-review-action-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-evidence-delta-review-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-tool-governance-model.json",
  "data/content-intelligence/quality-registry/ag26b-static-ux-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26b-to-ag26c-static-ux-scaffold-boundary.json",
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-surface-map.json",
  "data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",

  "data/content-intelligence/quality-reviews/ag26c-static-ux-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-static-ux-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-static-screen-registry.json",
  "data/content-intelligence/admin-editor/ag26c-static-component-registry.json",
  "data/content-intelligence/admin-editor/ag26c-admin-editor-role-flow-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-static-ux-non-execution-model.json",
  "data/content-intelligence/admin-editor/ag26c-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag26c-static-ux-scaffold-blocker-register.json",
  "data/content-intelligence/quality-registry/ag26c-ux-scaffold-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26c-to-ag26d-ux-scaffold-audit-boundary.json",
  "data/quality/ag26c-static-ux-scaffold.json",
  "data/quality/ag26c-static-ux-scaffold-preview.json",
  "docs/quality/AG26C_STATIC_UX_SCAFFOLD.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag26c-static-ux-scaffold.json");
const scaffold = readJson("data/content-intelligence/admin-editor/ag26c-static-ux-scaffold.json");
const screenRegistry = readJson("data/content-intelligence/admin-editor/ag26c-static-screen-registry.json");
const componentRegistry = readJson("data/content-intelligence/admin-editor/ag26c-static-component-registry.json");
const roleFlow = readJson("data/content-intelligence/admin-editor/ag26c-admin-editor-role-flow-scaffold.json");
const nonExecution = readJson("data/content-intelligence/admin-editor/ag26c-static-ux-non-execution-model.json");
const consumption = readJson("data/content-intelligence/admin-editor/ag26c-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag26c-static-ux-scaffold-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag26c-ux-scaffold-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag26c-to-ag26d-ux-scaffold-audit-boundary.json");
const registry = readJson("data/quality/ag26c-static-ux-scaffold.json");
const preview = readJson("data/quality/ag26c-static-ux-scaffold-preview.json");
const ag26b = readJson("data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json");
const ag26bReadiness = readJson("data/content-intelligence/quality-registry/ag26b-static-ux-scaffold-readiness-record.json");
const ag26aAlignment = readJson("data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (review.status !== "static_ux_scaffold_created_ready_for_ag26d") fail("Review status mismatch.");
if (scaffold.status !== "static_ux_scaffold_created_ready_for_ag26d") fail("Scaffold status mismatch.");
if (scaffold.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (scaffold.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (scaffold.scaffold_scope.next_stage !== "AG26D") fail("Next stage must be AG26D.");
if (scaffold.static_ux_scaffold_created !== true) fail("Static UX scaffold must be created.");

for (const flag of [
  "runtime_ui_allowed_in_ag26c",
  "live_route_creation_allowed_in_ag26c",
  "admin_login_creation_allowed_in_ag26c",
  "editor_login_creation_allowed_in_ag26c",
  "auth_activation_allowed_in_ag26c",
  "backend_activation_allowed_in_ag26c",
  "assignment_runtime_allowed_in_ag26c",
  "article_file_mutation_allowed_in_ag26c",
  "object_generation_allowed_in_ag26c",
  "publish_execution_allowed_in_ag26c",
  "public_mutation_allowed_in_ag26c",
  "deployment_allowed_in_ag26c"
]) {
  if (scaffold[flag] !== false) fail(`${flag} must be false.`);
}
if (scaffold.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (screenRegistry.status !== "static_screen_registry_created_no_live_routes") fail("Screen registry status mismatch.");
if (screenRegistry.screen_count !== screenRegistry.screens.length) fail("Screen count mismatch.");
if (screenRegistry.screen_count < 20) fail("Static screen registry should include Admin and Editor screens.");
if (screenRegistry.live_routes_created !== false) fail("Live routes must not be created.");
if (screenRegistry.runtime_navigation_enabled !== false) fail("Runtime navigation must be disabled.");
for (const screen of screenRegistry.screens) {
  if (screen.runtime_enabled !== false) fail(`${screen.screen_id} runtime must be false.`);
  if (screen.live_action_enabled !== false) fail(`${screen.screen_id} live action must be false.`);
}

if (componentRegistry.status !== "static_component_registry_created_no_runtime_components") fail("Component registry status mismatch.");
if (componentRegistry.component_count !== componentRegistry.components.length) fail("Component count mismatch.");
if (componentRegistry.component_count < 10) fail("At least 10 static components must be present.");
if (componentRegistry.runtime_components_created !== false) fail("Runtime components must not be created.");
if (componentRegistry.live_action_components_created !== false) fail("Live action components must not be created.");
for (const component of componentRegistry.components) {
  if (component.runtime_enabled !== false) fail(`${component.component_id} runtime must be false.`);
}

if (roleFlow.status !== "admin_editor_role_flow_scaffold_created_no_queue_execution") fail("Role flow status mismatch.");
if (!roleFlow.flow_rule.includes("Admin assigns item to Editor")) fail("Role flow must preserve Admin assignment.");
if (roleFlow.editor_global_browse_allowed !== false) fail("Editor global browse must remain false.");
if (roleFlow.editor_self_assignment_allowed !== false) fail("Editor self-assignment must remain false.");
if (roleFlow.editor_publish_allowed !== false) fail("Editor publish must remain false.");
if (roleFlow.admin_final_clearance_required !== true) fail("Admin final clearance must be required.");
if (roleFlow.runtime_queue_enabled !== false) fail("Runtime queue must be false.");
if (roleFlow.assignment_write_enabled !== false) fail("Assignment write must be false.");
for (const step of roleFlow.role_flow) {
  if (step.execution_enabled !== false) fail(`Role flow step ${step.step} must not execute.`);
}

if (nonExecution.status !== "static_ux_non_execution_model_created") fail("Non-execution model status mismatch.");
if (nonExecution.execution_enabled !== false) fail("Execution must be disabled.");
for (const disabled of ["auth_activation", "backend_activation", "assignment_write", "publish_execution", "github_write", "deployment", "publishing"]) {
  if (!nonExecution.disabled_actions.includes(disabled)) fail(`Missing disabled action: ${disabled}`);
}

if (!consumption.future_consumption?.AG26D) fail("AG26D consumption note missing.");
if (!consumption.future_consumption?.AG26Z) fail("AG26Z consumption note missing.");
if (blocker.status !== "static_ux_scaffold_operations_blocked_pending_ag26d") fail("Blocker status mismatch.");
if (readiness.ready_for_ag26d !== true) fail("AG26D readiness missing.");
if (boundary.next_stage_id !== "AG26D") fail("AG26D boundary missing.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");
if (boundary.admin_final_clearance_required !== true) fail("Boundary must keep Admin final clearance.");
if (!boundary.editor_workflow_rule.includes("Admin assigns item to Editor")) fail("Boundary must preserve role workflow.");

if (review.summary.static_ux_scaffold_created !== true) fail("Review summary missing.");
if (review.summary.ready_for_ag26d !== true) fail("AG26D readiness summary missing.");
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

if (ag26b.status !== "admin_workspace_ux_plan_created_ready_for_ag26c") fail("AG26B source plan status mismatch.");
if (ag26bReadiness.ready_for_ag26c !== true) fail("AG26B readiness must allow AG26C.");
if (ag26aAlignment.alignment_decision.editor_can_only_work_on_admin_assigned_items !== true) fail("AG26A admin-assigned rule missing.");
if (ag26aAlignment.alignment_decision.editor_returns_work_to_admin !== true) fail("AG26A return-to-admin rule missing.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");

if (registry.status !== "static_ux_scaffold_created_ready_for_ag26d") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.runtime_ui_created !== 0) fail("Preview must record 0 runtime UI.");
if (preview.live_routes_created !== 0) fail("Preview must record 0 live routes.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.backend_enabled !== 0) fail("Preview must record 0 backend.");
if (preview.assignment_writes !== 0) fail("Preview must record 0 assignment writes.");
if (preview.executed_actions !== 0) fail("Preview must record 0 executed actions.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-surface-map.json",
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-surface-map.json",
  "data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
]) {
  if (!scaffold.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Scaffold did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "static_ux_scaffold_created") {
    if (v !== true) fail("static_ux_scaffold_created must be true.");
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag26c"]) fail("Missing generate:ag26c script.");
if (!pkg.scripts?.["validate:ag26c"]) fail("Missing validate:ag26c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag26c")) fail("validate:project must include validate:ag26c.");

pass("AG26C Static UX Scaffold is present.");
pass("Static screen registry and component registry are valid.");
pass("Admin→Editor→Admin role-flow scaffold is valid.");
pass("Non-execution model blocks live routes, Auth, backend, assignment writes, public mutation and publishing.");
pass("AG26D UX Scaffold Audit boundary is ready.");
