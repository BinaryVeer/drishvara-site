import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const files = {
  review: "data/content-intelligence/quality-reviews/ag26a-editor-workspace-ux-plan.json",
  plan: "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  workspaceMap: "data/content-intelligence/admin-editor/ag26a-editor-workspace-surface-map.json",
  toolInventory: "data/content-intelligence/admin-editor/ag26a-editor-auto-article-tool-inventory.json",
  toolBrowser: "data/content-intelligence/admin-editor/ag26a-editor-tool-browser-model.json",
  createEdit: "data/content-intelligence/admin-editor/ag26a-editor-create-edit-article-tool-model.json",
  objectModel: "data/content-intelligence/admin-editor/ag26a-editor-object-generation-tool-model.json",
  correctionModel: "data/content-intelligence/admin-editor/ag26a-editor-correction-field-model.json",
  previewSubmit: "data/content-intelligence/admin-editor/ag26a-editor-preview-submit-workflow-model.json",
  reviewState: "data/content-intelligence/admin-editor/ag26a-editor-review-state-model.json",
  consumption: "data/content-intelligence/admin-editor/ag26a-future-consumption-plan.json",
  readiness: "data/content-intelligence/quality-registry/ag26a-admin-workspace-ux-plan-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag26a-to-ag26b-admin-workspace-ux-plan-boundary.json",
  registry: "data/quality/ag26a-editor-workspace-ux-plan.json",
  preview: "data/quality/ag26a-editor-workspace-ux-plan-preview.json",
  doc: "docs/quality/AG26A_EDITOR_WORKSPACE_UX_PLAN.md"
};

const outputs = {
  alignment: "data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json",
  qualityReview: "data/content-intelligence/quality-reviews/ag26a-editor-admin-assignment-alignment.json",
  preview: "data/quality/ag26a-editor-admin-assignment-alignment-preview.json",
  doc: "docs/quality/AG26A_ADMIN_ASSIGNED_EDITOR_WORKSPACE_ALIGNMENT.md"
};

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(full(p), "utf8"));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(files)) {
  if (!exists(p)) throw new Error(`Missing AG26A file: ${p}`);
}

const review = readJson(files.review);
const plan = readJson(files.plan);
const workspaceMap = readJson(files.workspaceMap);
const toolInventory = readJson(files.toolInventory);
const toolBrowser = readJson(files.toolBrowser);
const createEdit = readJson(files.createEdit);
const objectModel = readJson(files.objectModel);
const correctionModel = readJson(files.correctionModel);
const previewSubmit = readJson(files.previewSubmit);
const reviewState = readJson(files.reviewState);
const consumption = readJson(files.consumption);
const readiness = readJson(files.readiness);
const boundary = readJson(files.boundary);
const registry = readJson(files.registry);
const preview = readJson(files.preview);

if (plan.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") {
  throw new Error("AG26A plan status mismatch.");
}
if (review.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") {
  throw new Error("AG26A review status mismatch.");
}

const assignmentGovernance = {
  editor_can_only_work_on_admin_assigned_items: true,
  editor_can_create_independent_article: false,
  editor_can_browse_all_articles: false,
  editor_can_self_assign_article: false,
  editor_can_publish: false,
  editor_can_deploy: false,
  editor_can_change_public_visibility: false,
  editor_can_mark_publish_approved: false,
  editor_returns_work_to_admin: true,
  admin_is_assignment_originator: true,
  admin_is_final_clearance_authority: true,
  editor_tool_use_scope: "assigned_article_only"
};

function unique(arr) {
  return Array.from(new Set(arr));
}

function patchSurface(surface) {
  const replacements = {
    browse_articles: {
      label: "Browse Admin-Assigned Articles",
      purpose: "Browse only articles/draft assignments sent by Admin to the Editor, filterable by category, type, readiness, reference, attribution and layout status."
    },
    create_new_article: {
      label: "Prepare Admin-Assigned New Article Draft",
      purpose: "Prepare a new article draft only when Admin assigns a new article task to the Editor; no independent article creation is allowed."
    },
    edit_existing_article: {
      label: "Edit Admin-Assigned Existing Article",
      purpose: "Edit only an existing article assigned by Admin; the Editor cannot browse or self-select unassigned repository articles."
    },
    article_structure_editor: {
      label: "Assigned Article Structure Editor",
      purpose: "Edit structure, sections, reflection blocks and object anchors only within an Admin-assigned article workspace."
    },
    auto_article_tool_browser: {
      label: "Assigned Article Tool Browser",
      purpose: "Browse article preparation tools only inside an Admin-assigned article workspace; tools cannot be executed independently."
    },
    graph_table_infographic_manager: {
      label: "Assigned Article Object Manager",
      purpose: "Plan graphs, tables, infographics, figures and diagrams only for the Admin-assigned article."
    },
    article_preview_panel: {
      label: "Assigned Article Preview Panel",
      purpose: "Preview assigned article, card, mobile layout, references and objects before sending back to Admin."
    },
    submit_return_hold_decision_panel: {
      label: "Send Back to Admin / Return with Notes / Hold Panel",
      purpose: "Send edited work back to Admin, return with editorial notes, or hold for clarification; Editor cannot publish."
    }
  };

  if (replacements[surface.surface_id]) {
    return { ...surface, ...replacements[surface.surface_id], assignment_scope: "admin_assigned_item_only" };
  }

  return { ...surface, assignment_scope: "admin_assigned_item_only" };
}

workspaceMap.surfaces = workspaceMap.surfaces.map(patchSurface);
workspaceMap.assignment_governance = assignmentGovernance;
workspaceMap.workspace_access_scope = "admin_assigned_articles_only";
workspaceMap.editor_global_repository_browse_allowed = false;
workspaceMap.editor_self_assignment_allowed = false;

toolInventory.assignment_governance = assignmentGovernance;
toolInventory.tool_use_scope = "assigned_article_workspace_only";
toolInventory.independent_tool_execution_allowed = false;

toolBrowser.assignment_governance = assignmentGovernance;
toolBrowser.browse_scope = "tools_available_only_inside_admin_assigned_article_workspace";
toolBrowser.editor_can_open_tool_without_assignment = false;
toolBrowser.editor_can_apply_tool_to_unassigned_article = false;
toolBrowser.browse_filters = unique([
  "admin_assignment_status",
  "assigned_article_id",
  "assigned_by_admin",
  ...toolBrowser.browse_filters
]);

createEdit.assignment_governance = assignmentGovernance;
createEdit.assignment_scope = {
  editor_queue_source: "admin_assigned_items_only",
  new_article_mode: "admin_assigned_new_draft_only",
  existing_article_mode: "admin_assigned_existing_article_only",
  independent_new_article_creation_allowed: false,
  self_selected_existing_article_edit_allowed: false,
  editor_must_send_back_to_admin: true,
  admin_final_approval_required: true
};
createEdit.browse_existing_article_options = unique([
  "browse_admin_assigned_queue",
  "browse_admin_assigned_by_category",
  "browse_admin_assigned_by_status",
  "browse_admin_assigned_by_gap_type",
  ...createEdit.browse_existing_article_options
]);
createEdit.new_article_planning_steps = unique([
  "receive_admin_new_article_assignment",
  "confirm_assignment_scope",
  ...createEdit.new_article_planning_steps,
  "send_prepared_draft_back_to_admin"
]);
createEdit.existing_article_edit_planning_steps = unique([
  "load_admin_assigned_article_candidate",
  "confirm_admin_assignment_id",
  ...createEdit.existing_article_edit_planning_steps,
  "send_edited_article_back_to_admin"
]);
createEdit.independent_article_creation_allowed_in_ag26a = false;
createEdit.self_assignment_allowed_in_ag26a = false;
createEdit.editor_final_approval_allowed_in_ag26a = false;

objectModel.assignment_governance = assignmentGovernance;
objectModel.object_use_scope = "assigned_article_only";
objectModel.object_can_be_generated_without_admin_assignment = false;
objectModel.object_can_be_inserted_without_admin_review = false;

const assignmentFieldGroup = {
  field_group: "admin_assignment",
  fields: [
    "assignment_id",
    "assigned_by_admin",
    "assigned_to_editor",
    "assignment_type",
    "assignment_note",
    "assigned_article_id_or_slug",
    "assignment_due_status",
    "send_back_to_admin_status",
    "editor_completion_note"
  ]
};

if (!correctionModel.correction_fields.some((g) => g.field_group === "admin_assignment")) {
  correctionModel.correction_fields = [assignmentFieldGroup, ...correctionModel.correction_fields];
}
correctionModel.field_group_count = correctionModel.correction_fields.length;
correctionModel.assignment_governance = assignmentGovernance;
correctionModel.editor_can_edit_only_assigned_fields = true;

previewSubmit.assignment_governance = assignmentGovernance;
previewSubmit.editor_submit_target = "admin_review_queue_planning_only";
previewSubmit.editor_can_submit_to_publication = false;
previewSubmit.editor_can_send_back_to_admin = true;
previewSubmit.editor_decisions = unique([
  ...previewSubmit.editor_decisions,
  "send_back_to_admin_with_notes",
  "send_prepared_draft_back_to_admin",
  "send_edited_article_back_to_admin"
]);

const sentBackState = {
  state_id: "sent_back_to_admin",
  label: "Sent Back to Admin",
  public_visibility: false,
  publish_approved: false
};

if (!reviewState.review_states.some((s) => s.state_id === "sent_back_to_admin")) {
  reviewState.review_states.push(sentBackState);
}
reviewState.assignment_governance = assignmentGovernance;
reviewState.editor_queue_source = "admin_assignment_only";
reviewState.editor_can_publish_from_any_state = false;

plan.purpose =
  "Plan the full editor-side workspace UX for Admin-assigned article work only. The Editor may browse only Admin-assigned articles, prepare Admin-assigned new article drafts, edit Admin-assigned existing articles, use article preparation tools only within the assigned article workspace, preview the assigned work and send it back to Admin. The Editor cannot independently create, self-assign, browse all articles, publish, deploy, mutate public pages or activate backend systems.";
plan.assignment_governance = assignmentGovernance;
plan.ux_scope.assignment_model = "admin_assigned_items_only";
plan.ux_scope.editor_global_browse_status = "blocked";
plan.ux_scope.editor_independent_creation_status = "blocked";
plan.ux_scope.editor_return_to_admin_status = "required";
plan.editor_can_only_work_on_admin_assigned_items = true;
plan.editor_can_create_independent_article = false;
plan.editor_can_browse_all_articles = false;
plan.editor_can_self_assign_article = false;
plan.editor_returns_work_to_admin = true;
plan.admin_final_clearance_required = true;

review.summary.admin_assignment_only_scope_included = true;
review.summary.editor_independent_creation_allowed = false;
review.summary.editor_global_browse_allowed = false;
review.summary.editor_self_assignment_allowed = false;
review.summary.editor_returns_to_admin = true;
review.summary.admin_final_clearance_required = true;
review.assignment_governance = assignmentGovernance;

readiness.admin_assignment_alignment_applied = true;
readiness.editor_can_only_work_on_admin_assigned_items = true;
readiness.ready_for_ag26b = true;

boundary.allowed_scope = unique([
  "Consume AG26A admin-assigned-only editor workflow alignment.",
  "Plan Admin assignment, reassignment, review, final clearance and override UX.",
  ...boundary.allowed_scope
]);
boundary.editor_assignment_rule = "Editor receives work from Admin and sends work back to Admin.";
boundary.editor_independent_creation_blocked = true;
boundary.editor_global_browse_blocked = true;

consumption.future_consumption.AG26B =
  "Admin Workspace UX Plan must consume AG26A admin-assigned-only editor workflow: Admin assigns articles to Editor, Editor edits/prepares only assigned items, and Editor sends work back to Admin for final decision.";

registry.assignment_governance = assignmentGovernance;
preview.admin_assignment_only_scope_included = true;
preview.editor_independent_creation_allowed = 0;
preview.editor_global_browse_allowed = 0;
preview.editor_returns_to_admin = 1;

const alignment = {
  module_id: "AG26A",
  title: "Editor Admin-Assignment Alignment Record",
  status: "ag26a_editor_admin_assignment_alignment_applied_ready_for_ag26b",
  purpose:
    "Correct AG26A so the Editor can work only on Admin-assigned article items and must send edited/prepared work back to Admin.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  alignment_decision: assignmentGovernance,
  updated_files: [
    files.review,
    files.plan,
    files.workspaceMap,
    files.toolInventory,
    files.toolBrowser,
    files.createEdit,
    files.objectModel,
    files.correctionModel,
    files.previewSubmit,
    files.reviewState,
    files.consumption,
    files.readiness,
    files.boundary,
    files.registry,
    files.preview
  ],
  editor_workflow: [
    "Admin assigns article or new draft task to Editor.",
    "Editor opens only assigned article workspace.",
    "Editor edits/prepares assigned work using permitted planning tools.",
    "Editor previews assigned work.",
    "Editor sends the work back to Admin with notes.",
    "Admin takes final decision."
  ],
  blocked_state: {
    editor_independent_creation: false,
    editor_global_article_browse: false,
    editor_self_assignment: false,
    editor_publish: false,
    editor_deploy: false,
    editor_public_mutation: false,
    auth_backend_activation: false
  }
};

const qualityReview = {
  module_id: "AG26A",
  title: "Editor Admin-Assignment Alignment Review",
  status: "ag26a_editor_admin_assignment_alignment_validated_ready_for_ag26b",
  alignment_file: outputs.alignment,
  summary: {
    editor_can_only_work_on_admin_assigned_items: true,
    editor_can_create_independent_article: false,
    editor_can_browse_all_articles: false,
    editor_can_self_assign_article: false,
    editor_returns_work_to_admin: true,
    admin_final_clearance_required: true,
    ready_for_ag26b: true
  }
};

const alignmentPreview = {
  module_id: "AG26A",
  preview_only: true,
  status: qualityReview.status,
  message: "AG26A aligned: Editor can work only on Admin-assigned articles and must send work back to Admin.",
  admin_assignment_only: 1,
  editor_independent_creation: 0,
  editor_global_browse: 0,
  editor_self_assignment: 0,
  editor_publish: 0,
  editor_returns_to_admin: 1
};

const doc = `# AG26A — Admin-Assigned Editor Workspace Alignment

## Correction Applied

AG26A is aligned to the correct editorial governance model:

**Admin assigns/sends article → Editor edits or prepares assigned item → Editor sends back to Admin → Admin decides next action.**

## Corrected Editor Scope

- Editor can browse only Admin-assigned articles.
- Editor can prepare a new article draft only if Admin assigns it.
- Editor can edit an existing article only if Admin assigns it.
- Editor can use article-preparation tools only inside an assigned article workspace.
- Editor must send work back to Admin with notes.
- Admin remains final clearance authority.

## Explicitly Blocked

- Independent Editor article creation.
- Editor global article browsing.
- Editor self-assignment.
- Editor publishing.
- Editor deployment.
- Editor public visibility changes.
- Auth/backend/Supabase activation.
`;

writeJson(files.review, review);
writeJson(files.plan, plan);
writeJson(files.workspaceMap, workspaceMap);
writeJson(files.toolInventory, toolInventory);
writeJson(files.toolBrowser, toolBrowser);
writeJson(files.createEdit, createEdit);
writeJson(files.objectModel, objectModel);
writeJson(files.correctionModel, correctionModel);
writeJson(files.previewSubmit, previewSubmit);
writeJson(files.reviewState, reviewState);
writeJson(files.consumption, consumption);
writeJson(files.readiness, readiness);
writeJson(files.boundary, boundary);
writeJson(files.registry, registry);
writeJson(files.preview, preview);

writeJson(outputs.alignment, alignment);
writeJson(outputs.qualityReview, qualityReview);
writeJson(outputs.preview, alignmentPreview);
writeText(outputs.doc, doc);

const mainDocPath = full(files.doc);
let mainDoc = fs.readFileSync(mainDocPath, "utf8");
if (!mainDoc.includes("Admin-Assigned Editor Workflow Alignment")) {
  mainDoc += `

## Admin-Assigned Editor Workflow Alignment

The Editor workspace is restricted to Admin-assigned work. The Editor cannot independently create articles, browse all repository articles, self-assign work, publish, deploy or change public visibility.

Correct flow:

Admin assigns/sends article → Editor edits/prepares assigned work → Editor sends back to Admin → Admin decides next action.
`;
  fs.writeFileSync(mainDocPath, mainDoc);
}

console.log("✅ AG26A admin-assigned editor workflow alignment applied.");
console.log("✅ Editor is restricted to Admin-assigned article items.");
console.log("✅ Editor independent creation, global browse, self-assignment and publishing are blocked.");
console.log("✅ Editor sends edited/prepared work back to Admin.");
