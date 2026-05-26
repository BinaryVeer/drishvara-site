import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag26bReview: "data/content-intelligence/quality-reviews/ag26b-admin-workspace-ux-plan.json",
  ag26bPlan: "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  ag26bWorkspaceMap: "data/content-intelligence/admin-editor/ag26b-admin-workspace-surface-map.json",
  ag26bAssignmentControl: "data/content-intelligence/admin-editor/ag26b-admin-assignment-control-model.json",
  ag26bReviewAction: "data/content-intelligence/admin-editor/ag26b-admin-review-action-model.json",
  ag26bEvidenceDelta: "data/content-intelligence/admin-editor/ag26b-admin-evidence-delta-review-model.json",
  ag26bToolGovernance: "data/content-intelligence/admin-editor/ag26b-admin-tool-governance-model.json",
  ag26bReadiness: "data/content-intelligence/quality-registry/ag26b-static-ux-scaffold-readiness-record.json",
  ag26bBoundary: "data/content-intelligence/mutation-plans/ag26b-to-ag26c-static-ux-scaffold-boundary.json",

  ag26aPlan: "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  ag26aWorkspaceMap: "data/content-intelligence/admin-editor/ag26a-editor-workspace-surface-map.json",
  ag26aToolInventory: "data/content-intelligence/admin-editor/ag26a-editor-auto-article-tool-inventory.json",
  ag26aCreateEdit: "data/content-intelligence/admin-editor/ag26a-editor-create-edit-article-tool-model.json",
  ag26aObjectModel: "data/content-intelligence/admin-editor/ag26a-editor-object-generation-tool-model.json",
  ag26aPreviewSubmit: "data/content-intelligence/admin-editor/ag26a-editor-preview-submit-workflow-model.json",
  ag26aAlignment: "data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json",

  ag26UmbrellaPlan: "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  ag25zClosure: "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  ag27DecisionCheckpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag26c-static-ux-scaffold.json",
  scaffold: "data/content-intelligence/admin-editor/ag26c-static-ux-scaffold.json",
  screenRegistry: "data/content-intelligence/admin-editor/ag26c-static-screen-registry.json",
  componentRegistry: "data/content-intelligence/admin-editor/ag26c-static-component-registry.json",
  roleFlowScaffold: "data/content-intelligence/admin-editor/ag26c-admin-editor-role-flow-scaffold.json",
  nonExecutionModel: "data/content-intelligence/admin-editor/ag26c-static-ux-non-execution-model.json",
  consumptionPlan: "data/content-intelligence/admin-editor/ag26c-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag26c-static-ux-scaffold-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag26c-ux-scaffold-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag26c-to-ag26d-ux-scaffold-audit-boundary.json",
  registry: "data/quality/ag26c-static-ux-scaffold.json",
  preview: "data/quality/ag26c-static-ux-scaffold-preview.json",
  doc: "docs/quality/AG26C_STATIC_UX_SCAFFOLD.md"
};

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG26C input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag26bReview.status !== "admin_workspace_ux_plan_created_ready_for_ag26c") throw new Error("AG26B review status mismatch.");
if (records.ag26bPlan.status !== "admin_workspace_ux_plan_created_ready_for_ag26c") throw new Error("AG26B plan status mismatch.");
if (records.ag26bReadiness.ready_for_ag26c !== true) throw new Error("AG26B readiness does not permit AG26C.");
if (records.ag26bBoundary.next_stage_id !== "AG26C") throw new Error("AG26B boundary does not point to AG26C.");
if (records.ag26aPlan.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") throw new Error("AG26A plan status mismatch.");
if (records.ag26aAlignment.alignment_decision?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("AG26A assignment rule missing.");
if (records.ag26aAlignment.alignment_decision?.editor_returns_work_to_admin !== true) throw new Error("AG26A return-to-admin rule missing.");
if (records.ag26UmbrellaPlan.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") throw new Error("AG26 umbrella plan status mismatch.");
if (records.ag25zClosure.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") throw new Error("AG25Z closure status mismatch.");
if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z closure status mismatch.");
if (records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("Backend must remain deferred.");

const blockedState = {
  static_ux_scaffold_created: true,
  runtime_ui_created: false,
  live_route_created: false,
  admin_login_created: false,
  editor_login_created: false,
  auth_enabled: false,
  backend_enabled: false,
  supabase_enabled: false,
  queue_runtime_created: false,
  assignment_runtime_created: false,
  assignment_data_written: false,
  review_action_executed: false,
  article_file_created: false,
  article_file_mutated: false,
  object_generation_triggered: false,
  public_visibility_changed: false,
  publish_approved_changed: false,
  public_index_mutated: false,
  homepage_mutated: false,
  category_page_mutated: false,
  sitemap_feed_mutated: false,
  data_written_to_runtime: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false,
  supabase_auth_backend_activated: false
};

const editorSurfaces = records.ag26aWorkspaceMap.surfaces || [];
const adminSurfaces = records.ag26bWorkspaceMap.surfaces || [];

const staticScreens = [
  ...adminSurfaces.map((surface) => ({
    screen_id: `admin_${surface.surface_id}`,
    role: "admin",
    title: surface.label,
    purpose: surface.purpose,
    source_surface_id: surface.surface_id,
    scaffold_type: "static_planning_screen",
    runtime_enabled: false,
    live_action_enabled: false
  })),
  ...editorSurfaces.map((surface) => ({
    screen_id: `editor_${surface.surface_id}`,
    role: "editor",
    title: surface.label,
    purpose: surface.purpose,
    source_surface_id: surface.surface_id,
    scaffold_type: "static_planning_screen",
    runtime_enabled: false,
    live_action_enabled: false
  }))
];

const components = [
  {
    component_id: "role_badge",
    label: "Role Badge",
    purpose: "Display Admin or Editor role context without enabling login/Auth.",
    runtime_enabled: false
  },
  {
    component_id: "assignment_status_card",
    label: "Assignment Status Card",
    purpose: "Show planned assignment state: assigned, returned, held, archived, or admin review.",
    runtime_enabled: false
  },
  {
    component_id: "readiness_summary_card",
    label: "Readiness Summary Card",
    purpose: "Show references, attribution, layout and evidence readiness from governed records.",
    runtime_enabled: false
  },
  {
    component_id: "reference_status_panel",
    label: "Reference Status Panel",
    purpose: "Static panel for reference status and editorial verification planning.",
    runtime_enabled: false
  },
  {
    component_id: "attribution_status_panel",
    label: "Attribution Status Panel",
    purpose: "Static panel for image/object credit and attribution planning.",
    runtime_enabled: false
  },
  {
    component_id: "object_tool_browser_panel",
    label: "Object Tool Browser Panel",
    purpose: "Static panel listing images, graphs, tables, infographics, diagrams and textual tools without execution.",
    runtime_enabled: false
  },
  {
    component_id: "evidence_checklist_panel",
    label: "Evidence Checklist Panel",
    purpose: "Static panel for Admin evidence review checklist.",
    runtime_enabled: false
  },
  {
    component_id: "delta_review_panel",
    label: "Delta Review Panel",
    purpose: "Static panel for intended file/public surface delta review.",
    runtime_enabled: false
  },
  {
    component_id: "decision_button_group_disabled",
    label: "Disabled Decision Button Group",
    purpose: "Display Archive, Return, Publish and Publish-and-close as disabled/plan-only actions.",
    runtime_enabled: false
  },
  {
    component_id: "non_execution_warning",
    label: "Non-Execution Warning",
    purpose: "Display that this scaffold is non-runtime, non-publish, no-backend and no-deploy.",
    runtime_enabled: false
  }
];

const roleFlow = [
  {
    step: 1,
    actor: "Admin",
    action: "Selects article candidate or new draft task",
    scaffold_screen: "admin_assignment_control_panel",
    execution_enabled: false
  },
  {
    step: 2,
    actor: "Admin",
    action: "Assigns item to Editor in planning model",
    scaffold_screen: "admin_assignment_control_panel",
    execution_enabled: false
  },
  {
    step: 3,
    actor: "Editor",
    action: "Works only on Admin-assigned article workspace",
    scaffold_screen: "editor_browse_articles / editor_edit_existing_article / editor_create_new_article",
    execution_enabled: false
  },
  {
    step: 4,
    actor: "Editor",
    action: "Uses tools only within assigned article workspace",
    scaffold_screen: "editor_auto_article_tool_browser",
    execution_enabled: false
  },
  {
    step: 5,
    actor: "Editor",
    action: "Sends edited/prepared work back to Admin",
    scaffold_screen: "editor_submit_return_hold_decision_panel",
    execution_enabled: false
  },
  {
    step: 6,
    actor: "Admin",
    action: "Reviews evidence and delta",
    scaffold_screen: "admin_evidence_review_panel / admin_delta_review_panel",
    execution_enabled: false
  },
  {
    step: 7,
    actor: "Admin",
    action: "Plans Archive, Return for correction, Publish or Publish-and-close decision",
    scaffold_screen: "admin_publish_decision_panel / admin_archive_panel / admin_return_for_correction_panel",
    execution_enabled: false
  }
];

const screenRegistry = {
  module_id: "AG26C",
  title: "Static Screen Registry",
  status: "static_screen_registry_created_no_live_routes",
  screen_count: staticScreens.length,
  screens: staticScreens,
  live_routes_created: false,
  runtime_navigation_enabled: false,
  blocked_state: blockedState
};

const componentRegistry = {
  module_id: "AG26C",
  title: "Static Component Registry",
  status: "static_component_registry_created_no_runtime_components",
  component_count: components.length,
  components,
  runtime_components_created: false,
  live_action_components_created: false,
  blocked_state: blockedState
};

const roleFlowScaffold = {
  module_id: "AG26C",
  title: "Admin Editor Role Flow Scaffold",
  status: "admin_editor_role_flow_scaffold_created_no_queue_execution",
  flow_rule: "Admin assigns item to Editor; Editor works only on Admin-assigned item; Editor sends back to Admin; Admin decides.",
  role_flow: roleFlow,
  editor_global_browse_allowed: false,
  editor_self_assignment_allowed: false,
  editor_publish_allowed: false,
  admin_final_clearance_required: true,
  runtime_queue_enabled: false,
  assignment_write_enabled: false,
  blocked_state: blockedState
};

const nonExecutionModel = {
  module_id: "AG26C",
  title: "Static UX Non-Execution Model",
  status: "static_ux_non_execution_model_created",
  disabled_actions: [
    "admin_login",
    "editor_login",
    "auth_activation",
    "backend_activation",
    "supabase_activation",
    "runtime_queue_creation",
    "assignment_write",
    "editor_article_creation",
    "editor_article_mutation",
    "object_generation",
    "archive_execution",
    "return_for_correction_execution",
    "publish_execution",
    "publish_and_close_execution",
    "public_visibility_change",
    "publish_approved_change",
    "github_write",
    "deployment",
    "publishing"
  ],
  required_static_labels: [
    "Planning only",
    "No live action",
    "No Auth",
    "No backend",
    "No public mutation",
    "Publish actions disabled"
  ],
  execution_enabled: false,
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG26C",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag26d_to_ag26z",
  future_consumption: {
    AG26D: "UX Scaffold Audit should consume AG26C static screens, component registry, role-flow scaffold and non-execution model to verify no live route/action/backend leakage.",
    AG26Z: "Manual Admin/Editor Workflow Closure should close AG26A-AG26D and preserve AG27 backend deferral.",
    future_static_apply_path: "If future static apply is approved, AG26C scaffold can inform UI placement, but live actions remain blocked until separately approved."
  },
  blocked_state: blockedState
};

const scaffold = {
  module_id: "AG26C",
  title: "Static UX Scaffold",
  status: "static_ux_scaffold_created_ready_for_ag26d",
  purpose:
    "Create a non-active static UX scaffold blueprint for Admin and Editor workspaces using AG26A and AG26B, without creating live UI routes, logins, Auth, backend, runtime queues, assignments, article writes, object generation, public mutation, deployment or publishing.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag26b_status: records.ag26bPlan.status,
    ag26a_status: records.ag26aPlan.status,
    ag26a_admin_assignment_alignment: records.ag26aAlignment.status,
    ag26_umbrella_status: records.ag26UmbrellaPlan.status,
    ag25z_status: records.ag25zClosure.status,
    ag27_backend_deferred: records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred === true
  },
  scaffold_scope: {
    stage_type: "static_ux_scaffold_blueprint",
    admin_screen_count: adminSurfaces.length,
    editor_screen_count: editorSurfaces.length,
    total_screen_count: staticScreens.length,
    component_count: components.length,
    runtime_ui_status: "blocked",
    live_route_status: "blocked",
    auth_status: "blocked",
    backend_status: "blocked",
    live_action_status: "blocked",
    next_stage: "AG26D"
  },
  screen_registry_file: outputs.screenRegistry,
  component_registry_file: outputs.componentRegistry,
  role_flow_scaffold_file: outputs.roleFlowScaffold,
  non_execution_model_file: outputs.nonExecutionModel,
  future_consumption_plan_file: outputs.consumptionPlan,
  static_ux_scaffold_created: true,
  runtime_ui_allowed_in_ag26c: false,
  live_route_creation_allowed_in_ag26c: false,
  admin_login_creation_allowed_in_ag26c: false,
  editor_login_creation_allowed_in_ag26c: false,
  auth_activation_allowed_in_ag26c: false,
  backend_activation_allowed_in_ag26c: false,
  assignment_runtime_allowed_in_ag26c: false,
  article_file_mutation_allowed_in_ag26c: false,
  object_generation_allowed_in_ag26c: false,
  publish_execution_allowed_in_ag26c: false,
  public_mutation_allowed_in_ag26c: false,
  deployment_allowed_in_ag26c: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG26C",
  title: "Static UX Scaffold Blocker Register",
  status: "static_ux_scaffold_operations_blocked_pending_ag26d",
  blocked_items: [
    "No runtime UI creation.",
    "No live route creation.",
    "No Admin login creation.",
    "No Editor login creation.",
    "No Auth activation.",
    "No backend activation.",
    "No Supabase activation.",
    "No runtime queue creation.",
    "No assignment runtime creation.",
    "No assignment data write.",
    "No review action execution.",
    "No article file creation.",
    "No article file mutation.",
    "No object generation trigger.",
    "No public visibility change.",
    "No publish-approved change.",
    "No public index mutation.",
    "No homepage mutation.",
    "No category page mutation.",
    "No sitemap/feed mutation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG26C",
  title: "UX Scaffold Audit Readiness Record",
  status: "ready_for_ag26d_ux_scaffold_audit",
  ready_for_ag26d: true,
  next_stage_id: "AG26D",
  next_stage_title: "UX Scaffold Audit",
  static_ux_scaffold_created: true,
  screen_registry_created: true,
  component_registry_created: true,
  role_flow_scaffold_created: true,
  non_execution_model_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG26C",
  title: "AG26C to AG26D UX Scaffold Audit Boundary",
  status: "ag26d_boundary_created_not_started",
  next_stage_id: "AG26D",
  next_stage_title: "UX Scaffold Audit",
  allowed_scope: [
    "Consume AG26C static screen registry.",
    "Consume AG26C static component registry.",
    "Consume AG26C role-flow scaffold.",
    "Audit role separation, non-execution, disabled publish actions, no live route, no Auth/backend and no public mutation.",
    "Keep public mutation, deployment, publishing, Auth, backend and Supabase blocked."
  ],
  blocked_scope: blocker.blocked_items,
  admin_final_clearance_required: true,
  editor_workflow_rule: "Admin assigns item to Editor; Editor sends work back to Admin; Admin decides.",
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG26C",
  title: "Static UX Scaffold",
  status: "static_ux_scaffold_created_ready_for_ag26d",
  depends_on: ["AG26B", "AG26A", "AG26", "AG25Z", "AG24Z", "AG27"],
  generated_from: inputs,
  scaffold_file: outputs.scaffold,
  screen_registry_file: outputs.screenRegistry,
  component_registry_file: outputs.componentRegistry,
  role_flow_scaffold_file: outputs.roleFlowScaffold,
  non_execution_model_file: outputs.nonExecutionModel,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    static_ux_scaffold_created: true,
    admin_screen_count: adminSurfaces.length,
    editor_screen_count: editorSurfaces.length,
    total_screen_count: staticScreens.length,
    component_count: components.length,
    ready_for_ag26d: true,
    runtime_ui_created: false,
    live_route_created: false,
    admin_login_created: false,
    editor_login_created: false,
    auth_enabled: false,
    backend_enabled: false,
    assignment_write_done: false,
    review_action_executed: false,
    article_file_mutation_done: false,
    object_generation_done: false,
    publish_executed: false,
    public_mutation_done: false,
    deployment_done: false,
    publishing_done: false,
    backend_activation_done: false,
    real_execution_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG26C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG26C",
  preview_only: true,
  status: review.status,
  message: "AG26C Static UX Scaffold created. Next: AG26D UX Scaffold Audit.",
  admin_screen_count: adminSurfaces.length,
  editor_screen_count: editorSurfaces.length,
  total_screen_count: staticScreens.length,
  component_count: components.length,
  runtime_ui_created: 0,
  live_routes_created: 0,
  auth_enabled: 0,
  backend_enabled: 0,
  assignment_writes: 0,
  executed_actions: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG26C — Static UX Scaffold

## Purpose

AG26C creates a non-active static UX scaffold blueprint for Admin and Editor workspaces.

It does not create live UI routes, login, Auth, backend, runtime queues, assignment writes, article writes, object generation, public mutation, deployment or publishing.

## Consumed Source-of-Truth

- AG26B Admin Workspace UX Plan.
- AG26A Editor Workspace UX Plan and Admin-assigned Editor alignment.
- AG26 umbrella Admin/Editor Manual Workflow Strengthening.
- AG25Z Featured Reads Production Readiness Closure.
- AG24Z Episodic Knowledge Engine Closure.
- AG27 backend decision checkpoint confirming Supabase/Auth/backend remains deferred.

## Scaffold Coverage

- Admin screens from AG26B.
- Editor screens from AG26A.
- Shared static components.
- Admin → Editor → Admin role flow.
- Non-execution/disabled action model.

## Role Flow

Admin assigns item to Editor. Editor works only on Admin-assigned item. Editor sends work back to Admin. Admin decides.

## Non-Execution Boundary

No runtime UI, no live route, no login, no Auth, no backend, no assignment write, no article mutation, no object generation, no GitHub write, no deployment, no publishing and no public mutation.

## Next Stage

AG26D — UX Scaffold Audit.
`;

writeJson(outputs.review, review);
writeJson(outputs.scaffold, scaffold);
writeJson(outputs.screenRegistry, screenRegistry);
writeJson(outputs.componentRegistry, componentRegistry);
writeJson(outputs.roleFlowScaffold, roleFlowScaffold);
writeJson(outputs.nonExecutionModel, nonExecutionModel);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG26C Static UX Scaffold generated.");
console.log(`✅ Admin static screens: ${adminSurfaces.length}`);
console.log(`✅ Editor static screens: ${editorSurfaces.length}`);
console.log(`✅ Total static screens: ${staticScreens.length}`);
console.log(`✅ Static components: ${components.length}`);
console.log("✅ No runtime UI, live route, Auth, backend, assignment write, article mutation, deployment or publishing performed.");
console.log("✅ AG26D UX Scaffold Audit boundary created.");
