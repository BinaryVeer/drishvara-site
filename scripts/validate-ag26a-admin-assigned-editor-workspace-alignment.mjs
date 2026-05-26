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
  console.error(`❌ AG26A assignment alignment validation failed: ${msg}`);
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
  "data/content-intelligence/admin-editor/ag26a-editor-tool-browser-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-create-edit-article-tool-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-object-generation-tool-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-correction-field-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-preview-submit-workflow-model.json",
  "data/content-intelligence/admin-editor/ag26a-editor-review-state-model.json",
  "data/content-intelligence/admin-editor/ag26a-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag26a-admin-workspace-ux-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26a-to-ag26b-admin-workspace-ux-plan-boundary.json",
  "data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json",
  "data/content-intelligence/quality-reviews/ag26a-editor-admin-assignment-alignment.json",
  "data/quality/ag26a-editor-admin-assignment-alignment-preview.json",
  "docs/quality/AG26A_ADMIN_ASSIGNED_EDITOR_WORKSPACE_ALIGNMENT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag26a-editor-workspace-ux-plan.json");
const plan = readJson("data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json");
const workspaceMap = readJson("data/content-intelligence/admin-editor/ag26a-editor-workspace-surface-map.json");
const toolBrowser = readJson("data/content-intelligence/admin-editor/ag26a-editor-tool-browser-model.json");
const createEdit = readJson("data/content-intelligence/admin-editor/ag26a-editor-create-edit-article-tool-model.json");
const objectModel = readJson("data/content-intelligence/admin-editor/ag26a-editor-object-generation-tool-model.json");
const correctionModel = readJson("data/content-intelligence/admin-editor/ag26a-editor-correction-field-model.json");
const previewSubmit = readJson("data/content-intelligence/admin-editor/ag26a-editor-preview-submit-workflow-model.json");
const reviewState = readJson("data/content-intelligence/admin-editor/ag26a-editor-review-state-model.json");
const consumption = readJson("data/content-intelligence/admin-editor/ag26a-future-consumption-plan.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag26a-admin-workspace-ux-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag26a-to-ag26b-admin-workspace-ux-plan-boundary.json");
const alignment = readJson("data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json");
const alignmentReview = readJson("data/content-intelligence/quality-reviews/ag26a-editor-admin-assignment-alignment.json");
const pkg = readJson("package.json");

function checkGovernance(obj, label) {
  const g = obj.assignment_governance;
  if (!g) fail(`${label} missing assignment_governance.`);
  if (g.editor_can_only_work_on_admin_assigned_items !== true) fail(`${label}: editor must be restricted to Admin-assigned items.`);
  if (g.editor_can_create_independent_article !== false) fail(`${label}: independent article creation must be false.`);
  if (g.editor_can_browse_all_articles !== false) fail(`${label}: global article browse must be false.`);
  if (g.editor_can_self_assign_article !== false) fail(`${label}: self assignment must be false.`);
  if (g.editor_can_publish !== false) fail(`${label}: editor publish must be false.`);
  if (g.editor_returns_work_to_admin !== true) fail(`${label}: editor must return work to Admin.`);
  if (g.admin_is_final_clearance_authority !== true) fail(`${label}: Admin must be final clearance authority.`);
}

checkGovernance(plan, "plan");
checkGovernance(workspaceMap, "workspaceMap");
checkGovernance(toolBrowser, "toolBrowser");
checkGovernance(createEdit, "createEdit");
checkGovernance(objectModel, "objectModel");
checkGovernance(previewSubmit, "previewSubmit");
checkGovernance(reviewState, "reviewState");

if (plan.editor_can_only_work_on_admin_assigned_items !== true) fail("Plan must explicitly restrict Editor to Admin-assigned items.");
if (plan.editor_can_create_independent_article !== false) fail("Plan must block independent Editor article creation.");
if (plan.editor_can_browse_all_articles !== false) fail("Plan must block global article browse.");
if (plan.editor_can_self_assign_article !== false) fail("Plan must block self assignment.");
if (plan.editor_returns_work_to_admin !== true) fail("Plan must require Editor to return work to Admin.");
if (plan.admin_final_clearance_required !== true) fail("Plan must require Admin final clearance.");

if (workspaceMap.workspace_access_scope !== "admin_assigned_articles_only") fail("Workspace access scope must be admin_assigned_articles_only.");
if (workspaceMap.editor_global_repository_browse_allowed !== false) fail("Global repository browse must be blocked.");
if (workspaceMap.editor_self_assignment_allowed !== false) fail("Self assignment must be blocked.");

for (const surfaceId of ["browse_articles", "create_new_article", "edit_existing_article"]) {
  const surface = workspaceMap.surfaces.find((s) => s.surface_id === surfaceId);
  if (!surface) fail(`Missing surface: ${surfaceId}`);
  if (surface.assignment_scope !== "admin_assigned_item_only") fail(`${surfaceId} must be admin-assigned only.`);
}

const browseSurface = workspaceMap.surfaces.find((s) => s.surface_id === "browse_articles");
if (!browseSurface.label.includes("Admin-Assigned")) fail("Browse surface must be Admin-assigned.");
const createSurface = workspaceMap.surfaces.find((s) => s.surface_id === "create_new_article");
if (!createSurface.label.includes("Admin-Assigned")) fail("Create surface must be Admin-assigned.");
const editSurface = workspaceMap.surfaces.find((s) => s.surface_id === "edit_existing_article");
if (!editSurface.label.includes("Admin-Assigned")) fail("Edit surface must be Admin-assigned.");

if (toolBrowser.browse_scope !== "tools_available_only_inside_admin_assigned_article_workspace") fail("Tool browser scope mismatch.");
if (toolBrowser.editor_can_open_tool_without_assignment !== false) fail("Editor must not open tool without assignment.");
if (toolBrowser.editor_can_apply_tool_to_unassigned_article !== false) fail("Editor must not apply tool to unassigned article.");

if (createEdit.assignment_scope.editor_queue_source !== "admin_assigned_items_only") fail("Create/edit queue source must be Admin-assigned only.");
if (createEdit.assignment_scope.independent_new_article_creation_allowed !== false) fail("Independent new article creation must be false.");
if (createEdit.assignment_scope.self_selected_existing_article_edit_allowed !== false) fail("Self-selected existing edit must be false.");
if (createEdit.assignment_scope.editor_must_send_back_to_admin !== true) fail("Editor must send back to Admin.");
if (createEdit.independent_article_creation_allowed_in_ag26a !== false) fail("Independent article creation flag must be false.");
if (createEdit.self_assignment_allowed_in_ag26a !== false) fail("Self assignment flag must be false.");
if (createEdit.editor_final_approval_allowed_in_ag26a !== false) fail("Editor final approval flag must be false.");
if (!createEdit.browse_existing_article_options.includes("browse_admin_assigned_queue")) fail("Admin-assigned queue browse option missing.");
if (!createEdit.new_article_planning_steps.includes("receive_admin_new_article_assignment")) fail("Admin new article assignment step missing.");
if (!createEdit.existing_article_edit_planning_steps.includes("load_admin_assigned_article_candidate")) fail("Admin-assigned existing article step missing.");

if (objectModel.object_use_scope !== "assigned_article_only") fail("Object use scope must be assigned_article_only.");
if (objectModel.object_can_be_generated_without_admin_assignment !== false) fail("Object generation without Admin assignment must be false.");
if (objectModel.object_can_be_inserted_without_admin_review !== false) fail("Object insertion without Admin review must be false.");

if (!correctionModel.correction_fields.some((g) => g.field_group === "admin_assignment")) fail("Admin assignment correction field group missing.");
if (correctionModel.editor_can_edit_only_assigned_fields !== true) fail("Editor must edit only assigned fields.");

if (previewSubmit.editor_submit_target !== "admin_review_queue_planning_only") fail("Preview submit target must be Admin review queue planning only.");
if (previewSubmit.editor_can_submit_to_publication !== false) fail("Editor must not submit to publication.");
if (previewSubmit.editor_can_send_back_to_admin !== true) fail("Editor must be able to send back to Admin.");
if (!previewSubmit.editor_decisions.includes("send_back_to_admin_with_notes")) fail("send_back_to_admin_with_notes decision missing.");

if (!reviewState.review_states.some((s) => s.state_id === "sent_back_to_admin")) fail("sent_back_to_admin state missing.");
if (reviewState.editor_queue_source !== "admin_assignment_only") fail("Review state source must be admin_assignment_only.");
if (reviewState.editor_can_publish_from_any_state !== false) fail("Editor must not publish from any state.");

if (!consumption.future_consumption.AG26B.includes("Admin assigns articles to Editor")) fail("AG26B consumption must carry admin assignment workflow.");
if (readiness.admin_assignment_alignment_applied !== true) fail("Readiness must mark alignment applied.");
if (readiness.editor_can_only_work_on_admin_assigned_items !== true) fail("Readiness must restrict Editor to Admin-assigned items.");

if (boundary.editor_assignment_rule !== "Editor receives work from Admin and sends work back to Admin.") fail("Boundary editor assignment rule mismatch.");
if (boundary.editor_independent_creation_blocked !== true) fail("Boundary must block independent creation.");
if (boundary.editor_global_browse_blocked !== true) fail("Boundary must block global browse.");

if (review.summary.admin_assignment_only_scope_included !== true) fail("Review summary must include admin assignment scope.");
if (review.summary.editor_independent_creation_allowed !== false) fail("Review summary must block independent creation.");
if (review.summary.editor_global_browse_allowed !== false) fail("Review summary must block global browse.");
if (review.summary.editor_self_assignment_allowed !== false) fail("Review summary must block self assignment.");
if (review.summary.editor_returns_to_admin !== true) fail("Review summary must require return to Admin.");
if (review.summary.admin_final_clearance_required !== true) fail("Review summary must require Admin final clearance.");

if (alignment.status !== "ag26a_editor_admin_assignment_alignment_applied_ready_for_ag26b") fail("Alignment record status mismatch.");
if (alignment.alignment_decision.editor_can_only_work_on_admin_assigned_items !== true) fail("Alignment must restrict Editor to Admin-assigned items.");
if (alignment.alignment_decision.editor_can_create_independent_article !== false) fail("Alignment must block independent creation.");
if (alignment.alignment_decision.editor_returns_work_to_admin !== true) fail("Alignment must require return to Admin.");

if (alignmentReview.status !== "ag26a_editor_admin_assignment_alignment_validated_ready_for_ag26b") fail("Alignment quality review status mismatch.");
if (alignmentReview.summary.ready_for_ag26b !== true) fail("Alignment must remain ready for AG26B.");

if (!pkg.scripts?.["generate:ag26a-assignment"]) fail("Missing generate:ag26a-assignment script.");
if (!pkg.scripts?.["validate:ag26a-assignment"]) fail("Missing validate:ag26a-assignment script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag26a-assignment")) fail("validate:project must include validate:ag26a-assignment.");

pass("AG26A admin-assigned Editor workflow alignment is valid.");
pass("Editor can only work on Admin-assigned items.");
pass("Editor independent article creation, global browse and self-assignment are blocked.");
pass("Editor sends edited/prepared work back to Admin.");
pass("Admin remains final clearance authority.");
