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
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-surface-map.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-surface-map.json",
  "data/content-intelligence/admin-editor/ag26b-admin-review-queue-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json",
  "data/content-intelligence/quality-registry/ag26b-static-ux-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26b-to-ag26c-static-ux-scaffold-boundary.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",

  "data/content-intelligence/quality-reviews/ag26c-static-ux-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-static-ux-scaffold-plan.json",
  "data/content-intelligence/admin-editor/ag26c-admin-editor-static-screen-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-admin-editor-navigation-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-static-component-registry.json",
  "data/content-intelligence/admin-editor/ag26c-workflow-state-scaffold.json",
  "data/content-intelligence/admin-editor/ag26c-no-runtime-implementation-guard.json",
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
const plan = readJson("data/content-intelligence/admin-editor/ag26c-static-ux-scaffold-plan.json");
const screenScaffold = readJson("data/content-intelligence/admin-editor/ag26c-admin-editor-static-screen-scaffold.json");
const navigation = readJson("data/content-intelligence/admin-editor/ag26c-admin-editor-navigation-scaffold.json");
const componentRegistry = readJson("data/content-intelligence/admin-editor/ag26c-static-component-registry.json");
const stateScaffold = readJson("data/content-intelligence/admin-editor/ag26c-workflow-state-scaffold.json");
const guard = readJson("data/content-intelligence/admin-editor/ag26c-no-runtime-implementation-guard.json");
const consumption = readJson("data/content-intelligence/admin-editor/ag26c-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag26c-static-ux-scaffold-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag26c-ux-scaffold-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag26c-to-ag26d-ux-scaffold-audit-boundary.json");
const registry = readJson("data/quality/ag26c-static-ux-scaffold.json");
const preview = readJson("data/quality/ag26c-static-ux-scaffold-preview.json");
const routing = readJson("data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json");
const ag26b = readJson("data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json");
const ag26bReadiness = readJson("data/content-intelligence/quality-registry/ag26b-static-ux-scaffold-readiness-record.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (review.status !== "static_ux_scaffold_created_ready_for_ag26d") fail("Review status mismatch.");
if (plan.status !== "static_ux_scaffold_created_ready_for_ag26d") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.scaffold_scope.next_stage !== "AG26D") fail("Next stage must be AG26D.");
if (plan.scaffold_scope.stage_type !== "static_ux_scaffold_records_only") fail("Stage type must be records-only.");

if (plan.runtime_ui_allowed_in_ag26c !== false) fail("Runtime UI must be blocked.");
if (plan.route_creation_allowed_in_ag26c !== false) fail("Route creation must be blocked.");
if (plan.component_file_creation_allowed_in_ag26c !== false) fail("Component file creation must be blocked.");
if (plan.auth_activation_allowed_in_ag26c !== false) fail("Auth activation must be blocked.");
if (plan.backend_activation_allowed_in_ag26c !== false) fail("Backend activation must be blocked.");
if (plan.article_file_mutation_allowed_in_ag26c !== false) fail("Article mutation must be blocked.");
if (plan.object_generation_allowed_in_ag26c !== false) fail("Object generation must be blocked.");
if (plan.publication_allowed_in_ag26c !== false) fail("Publication must be blocked.");
if (plan.deployment_allowed_in_ag26c !== false) fail("Deployment must be blocked.");
if (plan.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (screenScaffold.status !== "admin_editor_static_screen_scaffold_created_no_runtime_ui") fail("Screen scaffold status mismatch.");
if (screenScaffold.screen_counts.total_screens !== screenScaffold.editor_screens.length + screenScaffold.admin_screens.length) fail("Screen count mismatch.");
if (screenScaffold.screen_counts.editor_screens < 8) fail("Editor static screens must be at least 8.");
if (screenScaffold.screen_counts.admin_screens < 8) fail("Admin static screens must be at least 8.");
if (screenScaffold.runtime_ui_created !== false) fail("Runtime UI must not be created in screen scaffold.");
for (const screen of [...screenScaffold.editor_screens, ...screenScaffold.admin_screens]) {
  if (screen.runtime_enabled !== false) fail(`${screen.screen_id} must not be runtime enabled.`);
}

if (navigation.status !== "admin_editor_navigation_scaffold_created_no_runtime_routes") fail("Navigation status mismatch.");
if (navigation.runtime_routes_created !== false) fail("Runtime routes must not be created.");
if (navigation.canonical_navigation_rules.system_generated_content_first_lands_in_admin !== true) fail("System content must land in Admin.");
if (navigation.canonical_navigation_rules.editor_created_new_candidate_lands_in_admin !== true) fail("Editor candidate must land in Admin.");
if (navigation.canonical_navigation_rules.admin_assigned_edit_lands_in_editor !== true) fail("Admin assigned edit must land in Editor.");
if (navigation.canonical_navigation_rules.editor_returned_edit_lands_in_admin !== true) fail("Editor returned edit must land in Admin.");
if (navigation.canonical_navigation_rules.admin_final_publish_only !== true) fail("Admin final publish rule missing.");
if (navigation.canonical_navigation_rules.editor_publish_route_exists !== false) fail("Editor publish route must not exist.");

if (componentRegistry.status !== "static_component_registry_created_no_component_files") fail("Component registry status mismatch.");
if (componentRegistry.component_files_created !== false) fail("Component files must not be created.");
if (componentRegistry.runtime_components_created !== false) fail("Runtime components must not be created.");
if (!componentRegistry.component_groups.some((group) => group.group_id === "admin_components")) fail("Admin component group missing.");
if (!componentRegistry.component_groups.some((group) => group.group_id === "editor_components")) fail("Editor component group missing.");
if (!componentRegistry.component_groups.some((group) => group.group_id === "governance_components")) fail("Governance component group missing.");

if (stateScaffold.status !== "workflow_state_scaffold_created_no_queue_mutation") fail("Workflow state status mismatch.");
if (stateScaffold.queue_mutation_allowed !== false) fail("Queue mutation must be blocked.");
const editorDirectPublish = stateScaffold.state_transitions.find((item) => item.transition_id === "editor_direct_publish");
if (!editorDirectPublish || editorDirectPublish.allowed !== false) fail("Editor direct publish transition must be blocked.");
const systemDirectPublish = stateScaffold.state_transitions.find((item) => item.transition_id === "system_direct_publish");
if (!systemDirectPublish || systemDirectPublish.allowed !== false) fail("System direct publish transition must be blocked.");

if (guard.status !== "no_runtime_implementation_guard_created") fail("No-runtime guard status mismatch.");
for (const [k, v] of Object.entries(guard.guard_rules)) {
  if (v !== true) fail(`Guard rule must be true: ${k}`);
}

if (!consumption.future_consumption?.AG26D) fail("AG26D consumption note missing.");
if (!consumption.future_consumption?.AG26Z) fail("AG26Z consumption note missing.");
if (!consumption.future_consumption?.future_runtime_stage) fail("Future runtime stage note missing.");
if (blocker.status !== "static_ux_scaffold_operations_blocked_pending_ag26d") fail("Blocker status mismatch.");
if (readiness.ready_for_ag26d !== true) fail("AG26D readiness missing.");
if (boundary.next_stage_id !== "AG26D") fail("AG26D boundary missing.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");

if (review.summary.static_ux_scaffold_created !== true) fail("Review summary missing.");
if (review.summary.admin_first_system_content_flow_preserved !== true) fail("Admin-first flow must be preserved.");
if (review.summary.editor_independent_new_candidate_flow_preserved !== true) fail("Editor independent candidate flow must be preserved.");
if (review.summary.admin_assigned_editor_edit_flow_preserved !== true) fail("Admin-assigned edit flow must be preserved.");
if (review.summary.admin_final_publish_authority_preserved !== true) fail("Admin final publish must be preserved.");
if (review.summary.editor_publish_authority_blocked !== true) fail("Editor publish authority must be blocked.");
if (review.summary.ready_for_ag26d !== true) fail("AG26D readiness summary missing.");
if (review.summary.runtime_ui_created !== false) fail("Runtime UI must remain false.");
if (review.summary.route_creation_done !== false) fail("Route creation must remain false.");
if (review.summary.component_file_creation_done !== false) fail("Component file creation must remain false.");
if (review.summary.auth_enabled !== false) fail("Auth must remain false.");
if (review.summary.backend_enabled !== false) fail("Backend must remain false.");
if (review.summary.queue_mutation_done !== false) fail("Queue mutation must remain false.");
if (review.summary.article_file_mutation_done !== false) fail("Article mutation must remain false.");
if (review.summary.object_generation_done !== false) fail("Object generation must remain false.");
if (review.summary.deployment_done !== false) fail("Deployment must remain false.");
if (review.summary.publishing_done !== false) fail("Publishing must remain false.");

if (routing.role_routing_rules.admin_final_publish_authority !== true) fail("Routing must preserve Admin publish authority.");
if (routing.role_routing_rules.editor_publish_authority !== false) fail("Routing must block Editor publishing.");
if (ag26b.status !== "admin_workspace_ux_plan_created_ready_for_ag26c") fail("AG26B source status mismatch.");
if (ag26bReadiness.ready_for_ag26c !== true) fail("AG26B readiness must allow AG26C.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");

if (registry.status !== "static_ux_scaffold_created_ready_for_ag26d") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.runtime_ui_created !== 0) fail("Preview must record 0 runtime UI.");
if (preview.routes_created !== 0) fail("Preview must record 0 routes.");
if (preview.component_files_created !== 0) fail("Preview must record 0 component files.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth enabled.");
if (preview.backend_enabled !== 0) fail("Preview must record 0 backend enabled.");
if (preview.mutated_articles !== 0) fail("Preview must record 0 mutated articles.");
if (preview.published_items !== 0) fail("Preview must record 0 published items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26b-admin-workspace-surface-map.json",
  "data/content-intelligence/admin-editor/ag26b-admin-review-queue-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
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
pass("Admin and Editor static screen scaffold records are valid.");
pass("Navigation, component registry and workflow state scaffold preserve Admin/Editor routing.");
pass("No-runtime implementation guard is valid.");
pass("AG26D UX Scaffold Audit boundary is ready.");
pass("No runtime UI, routes, component files, Auth, backend, article mutation, object generation, GitHub write, deployment or publishing is enabled.");
