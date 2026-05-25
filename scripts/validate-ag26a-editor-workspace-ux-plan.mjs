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
  console.error(`❌ AG26A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-readiness-matrix.json",
  "data/content-intelligence/featured-reads/ag25z-unresolved-featured-reads-work-register.json",
  "data/content-intelligence/quality-registry/ag25z-editor-workspace-ux-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag25z-to-ag26a-editor-workspace-ux-plan-boundary.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-role-permission-planning-model.json",
  "data/content-intelligence/admin-editor/ag26-manual-review-queue-workflow-model.json",
  "data/content-intelligence/admin-editor/ag26-editorial-approval-gate-model.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json",
  "data/content-intelligence/featured-reads/ag25b-reference-verification-worklist.json",
  "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-worklist.json",
  "data/content-intelligence/featured-reads/ag25d-layout-readiness-worklist.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",

  "data/content-intelligence/quality-reviews/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  "data/content-intelligence/admin-editor/ag26a-editor-workspace-surface-map.json",
  "data/content-intelligence/admin-editor/ag26a-editor-auto-article-tool-inventory.json",
  "data/content-intelligence/admin-editor/ag26a-editor-tool-browser-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-create-edit-article-tool-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-object-generation-tool-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-correction-field-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-preview-submit-workflow-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-review-state-model.json",
  "data/content-intelligence/admin-editor/ag26a-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag26a-editor-workspace-ux-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag26a-admin-workspace-ux-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26a-to-ag26b-admin-workspace-ux-plan-boundary.json",
  "data/quality/ag26a-editor-workspace-ux-plan.json",
  "data/quality/ag26a-editor-workspace-ux-plan-preview.json",
  "docs/quality/AG26A_EDITOR_WORKSPACE_UX_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag26a-editor-workspace-ux-plan.json");
const plan = readJson("data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json");
const workspaceMap = readJson("data/content-intelligence/admin-editor/ag26a-editor-workspace-surface-map.json");
const toolInventory = readJson("data/content-intelligence/admin-editor/ag26a-editor-auto-article-tool-inventory.json");
const toolBrowser = readJson("data/content-intelligence/admin-editor/ag26a-editor-tool-browser-model.json");
const createEdit = readJson("data/content-intelligence/admin-editor/ag26a-editor-create-edit-article-tool-model.json");
const objectModel = readJson("data/content-intelligence/admin-editor/ag26a-editor-object-generation-tool-model.json");
const correctionModel = readJson("data/content-intelligence/admin-editor/ag26a-editor-correction-field-model.json");
const previewSubmit = readJson("data/content-intelligence/admin-editor/ag26a-editor-preview-submit-workflow-model.json");
const reviewStateModel = readJson("data/content-intelligence/admin-editor/ag26a-editor-review-state-model.json");
const consumption = readJson("data/content-intelligence/admin-editor/ag26a-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag26a-editor-workspace-ux-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag26a-admin-workspace-ux-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag26a-to-ag26b-admin-workspace-ux-plan-boundary.json");
const registry = readJson("data/quality/ag26a-editor-workspace-ux-plan.json");
const preview = readJson("data/quality/ag26a-editor-workspace-ux-plan-preview.json");
const ag25z = readJson("data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json");
const ag25zReadiness = readJson("data/content-intelligence/quality-registry/ag25z-editor-workspace-ux-plan-readiness-record.json");
const ag26 = readJson("data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (review.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") fail("Review status mismatch.");
if (plan.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.ux_scope.stage_type !== "full_editor_workspace_ux_plan") fail("AG26A must be full editor workspace UX plan.");
if (plan.ux_scope.next_stage !== "AG26B") fail("Next stage must be AG26B.");

if (plan.editor_workspace_runtime_allowed_in_ag26a !== false) fail("Editor workspace runtime must be blocked.");
if (plan.editor_login_creation_allowed_in_ag26a !== false) fail("Editor login creation must be blocked.");
if (plan.auth_activation_allowed_in_ag26a !== false) fail("Auth activation must be blocked.");
if (plan.backend_activation_allowed_in_ag26a !== false) fail("Backend activation must be blocked.");
if (plan.review_queue_runtime_allowed_in_ag26a !== false) fail("Runtime review queue must be blocked.");
if (plan.correction_data_write_allowed_in_ag26a !== false) fail("Correction data write must be blocked.");
if (plan.article_creation_allowed_in_ag26a !== false) fail("Article creation must be blocked.");
if (plan.article_file_mutation_allowed_in_ag26a !== false) fail("Article mutation must be blocked.");
if (plan.object_generation_allowed_in_ag26a !== false) fail("Object generation must be blocked.");
if (plan.publication_allowed_in_ag26a !== false) fail("Publication must be blocked.");
if (plan.deployment_allowed_in_ag26a !== false) fail("Deployment must be blocked.");
if (plan.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (workspaceMap.status !== "editor_workspace_surface_map_created_no_runtime_ui") fail("Workspace map status mismatch.");
if (workspaceMap.surface_count !== workspaceMap.surfaces.length) fail("Surface count mismatch.");
if (workspaceMap.surface_count < 12) fail("Full editor workspace must include at least 12 planned surfaces.");
for (const surface of workspaceMap.surfaces) {
  if (surface.runtime_enabled !== false) fail(`${surface.surface_id} must not be runtime enabled.`);
}
for (const requiredSurface of [
  "browse_articles",
  "create_new_article",
  "edit_existing_article",
  "auto_article_tool_browser",
  "graph_table_infographic_manager",
  "article_preview_panel"
]) {
  if (!workspaceMap.surfaces.some((surface) => surface.surface_id === requiredSurface)) fail(`Missing editor surface: ${requiredSurface}`);
}

if (toolInventory.status !== "editor_auto_article_tool_inventory_created_no_generation") fail("Auto-article tool inventory status mismatch.");
if (toolInventory.tool_group_count !== toolInventory.tool_groups.length) fail("Tool group count mismatch.");
if (toolInventory.tool_group_count < 10) fail("Auto article tool inventory must include at least 10 tool groups.");
if (toolInventory.generation_enabled_now !== false) fail("Generation must be disabled.");
if (toolInventory.runtime_tool_execution_enabled !== false) fail("Runtime tool execution must be disabled.");
for (const requiredGroup of [
  "article_authoring_tools",
  "reference_source_tools",
  "image_asset_tools",
  "graph_chart_tools",
  "table_tools",
  "infographic_tools",
  "figure_diagram_tools",
  "cultural_textual_tools",
  "layout_preview_tools",
  "cost_governance_tools"
]) {
  if (!toolInventory.tool_groups.some((group) => group.group_id === requiredGroup)) fail(`Missing tool group: ${requiredGroup}`);
}

if (toolBrowser.status !== "editor_tool_browser_model_created_no_runtime_ui") fail("Tool browser model status mismatch.");
if (toolBrowser.tool_execution_allowed_in_ag26a !== false) fail("Tool execution must be blocked.");
if (!toolBrowser.browse_filters.includes("object_type")) fail("Tool browser must include object_type filter.");
if (!toolBrowser.browse_filters.includes("cost_sensitive")) fail("Tool browser must include cost_sensitive filter.");

if (createEdit.status !== "editor_create_edit_article_tool_model_created_no_article_write") fail("Create/edit article model status mismatch.");
if (createEdit.article_creation_allowed_in_ag26a !== false) fail("Article creation must be blocked.");
if (createEdit.article_file_write_allowed_in_ag26a !== false) fail("Article file write must be blocked.");
if (createEdit.article_mutation_allowed_in_ag26a !== false) fail("Article mutation must be blocked.");
if (!createEdit.browse_existing_article_options.includes("browse_by_category")) fail("Browse by category option missing.");
if (!createEdit.new_article_planning_steps.includes("select_object_requirement")) fail("New article object requirement step missing.");
if (!createEdit.existing_article_edit_planning_steps.includes("review_image_object_attribution")) fail("Existing article attribution review step missing.");

if (objectModel.status !== "editor_object_generation_tool_model_created_no_object_generation") fail("Object generation model status mismatch.");
if (objectModel.object_type_count !== objectModel.object_types.length) fail("Object type count mismatch.");
if (objectModel.object_type_count < 6) fail("Object model must include at least six object types.");
for (const flag of [
  "object_generation_allowed_in_ag26a",
  "image_generation_allowed_in_ag26a",
  "graph_generation_allowed_in_ag26a",
  "table_generation_allowed_in_ag26a",
  "infographic_generation_allowed_in_ag26a",
  "diagram_generation_allowed_in_ag26a",
  "object_insert_allowed_in_ag26a"
]) {
  if (objectModel[flag] !== false) fail(`${flag} must be false.`);
}
for (const requiredType of ["image", "graph_chart", "table", "infographic", "figure_diagram", "textual_enhancement"]) {
  if (!objectModel.object_types.some((item) => item.object_type === requiredType)) fail(`Missing object type: ${requiredType}`);
}

if (correctionModel.status !== "editor_correction_field_model_created_no_data_write") fail("Correction model status mismatch.");
if (correctionModel.field_group_count !== correctionModel.correction_fields.length) fail("Correction field group count mismatch.");
if (correctionModel.correction_data_write_allowed !== false) fail("Correction data write must be blocked.");
if (correctionModel.public_visibility_default !== false) fail("Public visibility default must be false.");
if (correctionModel.publish_approved_default !== false) fail("Publish approved default must be false.");
for (const requiredGroup of ["article_create_edit", "reference", "attribution", "object_generation", "layout_card_seo", "editor_decision"]) {
  if (!correctionModel.correction_fields.some((group) => group.field_group === requiredGroup)) fail(`Missing correction field group: ${requiredGroup}`);
}

if (previewSubmit.status !== "editor_preview_submit_workflow_model_created_no_publish") fail("Preview-submit workflow status mismatch.");
if (previewSubmit.publish_approval_enabled_in_ag26a !== false) fail("Publish approval must be blocked.");
if (previewSubmit.deployment_enabled_in_ag26a !== false) fail("Deployment must be blocked.");
if (previewSubmit.github_write_enabled_in_ag26a !== false) fail("GitHub write must be blocked.");
if (!previewSubmit.preview_modes.includes("article_preview")) fail("Article preview mode missing.");
if (!previewSubmit.preview_modes.includes("mobile_preview")) fail("Mobile preview mode missing.");

if (reviewStateModel.status !== "editor_review_state_model_created_no_queue_mutation") fail("Review state model status mismatch.");
if (reviewStateModel.editor_queue_mutation_allowed !== false) fail("Editor queue mutation must be blocked.");
for (const state of reviewStateModel.review_states) {
  if (state.public_visibility !== false) fail(`${state.state_id} public visibility must be false.`);
  if (state.publish_approved !== false) fail(`${state.state_id} publish approved must be false.`);
}

if (!consumption.future_consumption?.AG26B) fail("AG26B consumption note missing.");
if (!consumption.future_consumption?.AG26C) fail("AG26C consumption note missing.");
if (!consumption.future_consumption?.AG26D) fail("AG26D consumption note missing.");
if (!consumption.future_consumption?.AG26Z) fail("AG26Z consumption note missing.");
if (blocker.status !== "editor_workspace_ux_operations_blocked_pending_ag26b") fail("Blocker status mismatch.");
if (readiness.ready_for_ag26b !== true) fail("AG26B readiness missing.");
if (readiness.auto_article_tool_inventory_created !== true) fail("Auto article tool inventory readiness missing.");
if (readiness.create_edit_article_tool_model_created !== true) fail("Create/edit tool model readiness missing.");
if (readiness.object_generation_tool_model_created !== true) fail("Object generation tool model readiness missing.");
if (boundary.next_stage_id !== "AG26B") fail("AG26B boundary missing.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");

if (review.summary.editor_workspace_ux_plan_created !== true) fail("Review summary missing.");
if (review.summary.full_create_edit_scope_included !== true) fail("Full create/edit scope must be included.");
if (review.summary.auto_article_tool_browser_included !== true) fail("Auto-article tool browser must be included.");
if (review.summary.ready_for_ag26b !== true) fail("AG26B readiness summary missing.");
if (review.summary.editor_workspace_runtime_created !== false) fail("Editor workspace runtime must remain false.");
if (review.summary.editor_login_created !== false) fail("Editor login must remain false.");
if (review.summary.auth_enabled !== false) fail("Auth must remain false.");
if (review.summary.backend_enabled !== false) fail("Backend must remain false.");
if (review.summary.queue_mutation_done !== false) fail("Queue mutation must remain false.");
if (review.summary.correction_data_write_done !== false) fail("Correction write must remain false.");
if (review.summary.article_creation_done !== false) fail("Article creation must remain false.");
if (review.summary.article_file_mutation_done !== false) fail("Article mutation must remain false.");
if (review.summary.object_generation_done !== false) fail("Object generation must remain false.");
if (review.summary.deployment_done !== false) fail("Deployment must remain false.");
if (review.summary.publishing_done !== false) fail("Publishing must remain false.");
if (review.summary.backend_activation_done !== false) fail("Backend activation must remain false.");

if (ag25z.closure_decision.ready_for_ag26a !== true) fail("AG25Z must allow AG26A.");
if (ag25zReadiness.ready_for_ag26a !== true) fail("AG25Z readiness must allow AG26A.");
if (ag26.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") fail("AG26 umbrella status mismatch.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");
if (registry.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.editor_logins_created !== 0) fail("Preview must record 0 editor logins.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth enabled.");
if (preview.backend_enabled !== 0) fail("Preview must record 0 backend enabled.");
if (preview.queue_mutations !== 0) fail("Preview must record 0 queue mutations.");
if (preview.created_articles !== 0) fail("Preview must record 0 created articles.");
if (preview.mutated_articles !== 0) fail("Preview must record 0 mutated articles.");
if (preview.generated_objects !== 0) fail("Preview must record 0 generated objects.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-readiness-matrix.json",
  "data/content-intelligence/featured-reads/ag25z-unresolved-featured-reads-work-register.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/admin-editor/ag26-manual-review-queue-workflow-model.json",
  "data/content-intelligence/admin-editor/ag26-editorial-approval-gate-model.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json",
  "data/content-intelligence/featured-reads/ag25b-reference-verification-worklist.json",
  "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-worklist.json",
  "data/content-intelligence/featured-reads/ag25d-layout-readiness-worklist.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag26a"]) fail("Missing generate:ag26a script.");
if (!pkg.scripts?.["validate:ag26a"]) fail("Missing validate:ag26a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag26a")) fail("validate:project must include validate:ag26a.");

pass("AG26A Editor Workspace UX Plan is present.");
pass("Full browse/create/edit article scope is included.");
pass("Auto-article tool browser includes image, graph, table, infographic, diagram, textual, layout and governance tools.");
pass("Object generation model is present but generation remains blocked.");
pass("AG25Z, AG26 umbrella and AG27 backend-defer records are consumed.");
pass("AG26B Admin Workspace UX Plan boundary is ready.");
pass("No Editor login, Auth, backend, queue mutation, article creation/mutation, object generation, GitHub write, deployment or publishing is enabled.");
