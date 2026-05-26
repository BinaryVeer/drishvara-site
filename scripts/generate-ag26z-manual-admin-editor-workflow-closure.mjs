import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag26UmbrellaPlan: "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  ag26RolePermission: "data/content-intelligence/admin-editor/ag26-admin-editor-role-permission-planning-model.json",
  ag26ManualQueue: "data/content-intelligence/admin-editor/ag26-manual-review-queue-workflow-model.json",
  ag26ApprovalGate: "data/content-intelligence/admin-editor/ag26-editorial-approval-gate-model.json",

  ag26aReview: "data/content-intelligence/quality-reviews/ag26a-editor-workspace-ux-plan.json",
  ag26aPlan: "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  ag26aSurfaceMap: "data/content-intelligence/admin-editor/ag26a-editor-workspace-surface-map.json",
  ag26aToolInventory: "data/content-intelligence/admin-editor/ag26a-editor-auto-article-tool-inventory.json",
  ag26aRoutingReview: "data/content-intelligence/quality-reviews/ag26a-editor-admin-routing-alignment.json",
  ag26aRoutingModel: "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  ag26aPolicy: "data/content-intelligence/admin-editor/ag26a-editor-authoring-and-admin-assigned-edit-policy.json",

  ag26bReview: "data/content-intelligence/quality-reviews/ag26b-admin-workspace-ux-plan.json",
  ag26bPlan: "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  ag26bSurfaceMap: "data/content-intelligence/admin-editor/ag26b-admin-workspace-surface-map.json",
  ag26bReviewQueue: "data/content-intelligence/admin-editor/ag26b-admin-review-queue-model.json",
  ag26bAssignmentModel: "data/content-intelligence/admin-editor/ag26b-admin-to-editor-assignment-model.json",
  ag26bPublishControl: "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json",
  ag26bToolApproval: "data/content-intelligence/admin-editor/ag26b-admin-tool-approval-governance-model.json",

  ag26cReview: "data/content-intelligence/quality-reviews/ag26c-static-ux-scaffold.json",
  ag26cPlan: "data/content-intelligence/admin-editor/ag26c-static-ux-scaffold-plan.json",
  ag26cScreenScaffold: "data/content-intelligence/admin-editor/ag26c-admin-editor-static-screen-scaffold.json",
  ag26cNavigationScaffold: "data/content-intelligence/admin-editor/ag26c-admin-editor-navigation-scaffold.json",
  ag26cComponentRegistry: "data/content-intelligence/admin-editor/ag26c-static-component-registry.json",
  ag26cWorkflowStateScaffold: "data/content-intelligence/admin-editor/ag26c-workflow-state-scaffold.json",
  ag26cNoRuntimeGuard: "data/content-intelligence/admin-editor/ag26c-no-runtime-implementation-guard.json",

  ag26dReview: "data/content-intelligence/quality-reviews/ag26d-ux-scaffold-audit.json",
  ag26dAudit: "data/content-intelligence/admin-editor/ag26d-ux-scaffold-audit.json",
  ag26dScreenNavigationAudit: "data/content-intelligence/admin-editor/ag26d-screen-navigation-audit.json",
  ag26dRoleRoutingAudit: "data/content-intelligence/admin-editor/ag26d-role-routing-audit.json",
  ag26dNoRuntimeGuardAudit: "data/content-intelligence/admin-editor/ag26d-no-runtime-guard-audit.json",
  ag26dFindings: "data/content-intelligence/admin-editor/ag26d-readiness-findings-register.json",
  ag26dReadiness: "data/content-intelligence/quality-registry/ag26d-manual-admin-editor-workflow-closure-readiness-record.json",
  ag26dBoundary: "data/content-intelligence/mutation-plans/ag26d-to-ag26z-manual-admin-editor-workflow-closure-boundary.json",

  ag25zClosure: "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  ag27DecisionCheckpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag26z-manual-admin-editor-workflow-closure.json",
  closure: "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  sourceChain: "data/content-intelligence/admin-editor/ag26z-ag26-detailed-source-chain-register.json",
  routingClosure: "data/content-intelligence/admin-editor/ag26z-admin-editor-routing-closure-register.json",
  nonRuntimeClosure: "data/content-intelligence/admin-editor/ag26z-non-runtime-closure-register.json",
  existingAg27Handoff: "data/content-intelligence/admin-editor/ag26z-existing-ag27-handoff-confirmation.json",
  consumptionPlan: "data/content-intelligence/admin-editor/ag26z-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag26z-manual-admin-editor-workflow-closure-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag26z-post-ag26-backend-deferral-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag26z-to-existing-ag27-backend-decision-checkpoint-boundary.json",
  registry: "data/quality/ag26z-manual-admin-editor-workflow-closure.json",
  preview: "data/quality/ag26z-manual-admin-editor-workflow-closure-preview.json",
  doc: "docs/quality/AG26Z_MANUAL_ADMIN_EDITOR_WORKFLOW_CLOSURE.md"
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
  if (!exists(p)) throw new Error(`Missing AG26Z input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag26UmbrellaPlan.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") throw new Error("AG26 umbrella status mismatch.");
if (records.ag26aPlan.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") throw new Error("AG26A plan status mismatch.");
if (records.ag26aRoutingModel.status !== "admin_editor_system_routing_model_created_ready_for_ag26b") throw new Error("AG26A routing status mismatch.");
if (records.ag26bPlan.status !== "admin_workspace_ux_plan_created_ready_for_ag26c") throw new Error("AG26B plan status mismatch.");
if (records.ag26cPlan.status !== "static_ux_scaffold_created_ready_for_ag26d") throw new Error("AG26C plan status mismatch.");
if (records.ag26dAudit.status !== "ux_scaffold_audit_passed_ready_for_ag26z") throw new Error("AG26D audit status mismatch.");
if (records.ag26dReadiness.ready_for_ag26z !== true) throw new Error("AG26D readiness does not permit AG26Z.");
if (records.ag26dBoundary.next_stage_id !== "AG26Z") throw new Error("AG26D boundary does not point to AG26Z.");
if (records.ag25zClosure.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") throw new Error("AG25Z closure status mismatch.");
if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z closure status mismatch.");
if (records.ag27DecisionCheckpoint.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") throw new Error("AG27 checkpoint status mismatch.");
if (records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("Backend must remain deferred.");

const routingRules = records.ag26aRoutingModel.role_routing_rules;
if (routingRules.system_generated_content_first_goes_to_admin !== true) throw new Error("System content must go to Admin first.");
if (routingRules.editor_independent_new_article_candidate_allowed !== true) throw new Error("Editor independent new article candidate creation must remain allowed.");
if (routingRules.editor_direct_system_article_edit_allowed !== false) throw new Error("Editor direct system article edit must remain blocked.");
if (routingRules.editor_can_edit_admin_assigned_system_article !== true) throw new Error("Editor Admin-assigned edit must remain allowed.");
if (routingRules.editor_returns_to_admin_after_edit !== true) throw new Error("Editor must return edited content to Admin.");
if (routingRules.admin_final_publish_authority !== true) throw new Error("Admin final publish authority missing.");
if (routingRules.editor_publish_authority !== false) throw new Error("Editor publish authority must be false.");

const blockedState = {
  ag26_detailed_chain_closed: true,
  runtime_ui_created: false,
  runtime_route_created: false,
  component_file_created: false,
  admin_login_created: false,
  editor_login_created: false,
  auth_enabled: false,
  backend_enabled: false,
  supabase_enabled: false,
  runtime_queue_created: false,
  queue_data_written: false,
  article_file_mutated: false,
  article_created: false,
  object_generation_triggered: false,
  article_generation_triggered: false,
  public_index_mutated: false,
  homepage_mutated: false,
  category_page_mutated: false,
  sitemap_feed_mutated: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false
};

const sourceChain = {
  module_id: "AG26Z",
  title: "AG26 Detailed Source Chain Register",
  status: "ag26_detailed_source_chain_registered_for_closure",
  chain_length: 5,
  closed_chain: [
    {
      stage_id: "AG26A",
      title: "Editor Workspace UX Plan",
      status: records.ag26aPlan.status,
      file: inputs.ag26aPlan
    },
    {
      stage_id: "AG26A_ALIGNMENT",
      title: "Editor/Admin/System Routing Alignment",
      status: records.ag26aRoutingModel.status,
      file: inputs.ag26aRoutingModel
    },
    {
      stage_id: "AG26B",
      title: "Admin Workspace UX Plan",
      status: records.ag26bPlan.status,
      file: inputs.ag26bPlan
    },
    {
      stage_id: "AG26C",
      title: "Static UX Scaffold",
      status: records.ag26cPlan.status,
      file: inputs.ag26cPlan
    },
    {
      stage_id: "AG26D",
      title: "UX Scaffold Audit",
      status: records.ag26dAudit.status,
      file: inputs.ag26dAudit
    }
  ],
  umbrella_records_consumed: [
    inputs.ag26UmbrellaPlan,
    inputs.ag25zClosure,
    inputs.ag24zClosure,
    inputs.ag27DecisionCheckpoint
  ],
  blocked_state: blockedState
};

const routingClosure = {
  module_id: "AG26Z",
  title: "Admin/Editor Routing Closure Register",
  status: "admin_editor_routing_closed_ready_for_existing_ag27",
  closed_governance_rules: {
    editor_independent_new_article_candidate_allowed: true,
    editor_new_article_candidate_goes_to_admin_review: true,
    system_generated_content_first_goes_to_admin: true,
    admin_core_reviewer_for_system_generated_content: true,
    admin_can_send_system_generated_content_to_editor_for_editing: true,
    editor_direct_system_article_edit_allowed: false,
    editor_can_edit_admin_assigned_system_article: true,
    editor_returns_to_admin_after_edit: true,
    admin_final_publish_authority: true,
    editor_publish_authority: false,
    system_publish_without_admin: false
  },
  closed_flows: [
    "Editor independent new article candidate → Admin review.",
    "System/AI generated candidate → Admin first.",
    "Admin review → optional Editor assignment for editing.",
    "Editor edit → return to Admin.",
    "Admin final review → Admin-only future publish control.",
    "No Editor publishing.",
    "No system direct publishing."
  ],
  blocked_state: blockedState
};

const nonRuntimeClosure = {
  module_id: "AG26Z",
  title: "Non-Runtime Closure Register",
  status: "non_runtime_closure_registered_ready_for_existing_ag27",
  closure_guards: {
    no_runtime_ui: true,
    no_runtime_routes: true,
    no_component_files: true,
    no_admin_login: true,
    no_editor_login: true,
    no_auth: true,
    no_backend: true,
    no_supabase: true,
    no_runtime_queues: true,
    no_article_creation_or_mutation: true,
    no_object_generation: true,
    no_github_write_automation: true,
    no_deployment: true,
    no_publishing: true
  },
  no_runtime_guard_source: inputs.ag26cNoRuntimeGuard,
  audit_source: inputs.ag26dNoRuntimeGuardAudit,
  blocked_state: blockedState
};

const existingAg27Handoff = {
  module_id: "AG26Z",
  title: "Existing AG27 Backend Decision Checkpoint Handoff Confirmation",
  status: "existing_ag27_checkpoint_confirmed_backend_deferred",
  ag27_checkpoint_file: inputs.ag27DecisionCheckpoint,
  ag27_status: records.ag27DecisionCheckpoint.status,
  ag27_decision: {
    backend_activation_approved: records.ag27DecisionCheckpoint.checkpoint_decision?.backend_activation_approved === true,
    supabase_deferred: records.ag27DecisionCheckpoint.checkpoint_decision?.supabase_deferred === true,
    auth_deferred: records.ag27DecisionCheckpoint.checkpoint_decision?.auth_deferred === true,
    backend_deferred: records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred === true,
    dynamic_publishing_deferred: records.ag27DecisionCheckpoint.checkpoint_decision?.dynamic_publishing_deferred === true,
    ag28_to_ag40_allowed_now: records.ag27DecisionCheckpoint.checkpoint_decision?.ag28_to_ag40_allowed_now === true,
    explicit_approval_required_before_ag28: records.ag27DecisionCheckpoint.checkpoint_decision?.explicit_approval_required_before_ag28 === true
  },
  handoff_position:
    "AG26Z closes the detailed Admin/Editor manual workflow chain and confirms that the already-completed AG27 backend decision checkpoint remains the controlling backend/Auth/Supabase deferral record.",
  do_not_start_ag28_without_explicit_approval: true,
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG26Z",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_existing_ag27_and_post_ag27_path",
  future_consumption: {
    existing_AG27:
      "The already-completed AG27 backend decision checkpoint remains valid and must be treated as the controlling decision record after AG26Z closure.",
    AG28_to_AG40:
      "Backend/Auth/dynamic publishing stages remain blocked unless explicit approval is given after reviewing AG27 and AG26Z together.",
    future_static_path:
      "If backend remains deferred, future stages should continue using the static/GitHub-controlled path and consume AG26Z Admin/Editor governance closure records.",
    future_runtime_admin_editor:
      "Any future Admin/Editor runtime implementation must consume AG26A-AG26Z records and separately approve Auth/backend/runtime queues."
  },
  blocked_state: blockedState
};

const closure = {
  module_id: "AG26Z",
  title: "Manual Admin/Editor Workflow Closure",
  status: "manual_admin_editor_workflow_closed_existing_ag27_backend_deferred",
  purpose:
    "Close the detailed AG26A-AG26D Admin/Editor workflow chain, including Editor workspace, Admin workspace, Admin-Editor-System routing, static UX scaffold and UX scaffold audit, while confirming that AG27 backend/Auth/Supabase deferral remains controlling.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag26_umbrella_status: records.ag26UmbrellaPlan.status,
    ag26a_status: records.ag26aPlan.status,
    ag26a_routing_status: records.ag26aRoutingModel.status,
    ag26b_status: records.ag26bPlan.status,
    ag26c_status: records.ag26cPlan.status,
    ag26d_status: records.ag26dAudit.status,
    ag25z_status: records.ag25zClosure.status,
    ag24z_status: records.ag24zClosure.status,
    ag27_status: records.ag27DecisionCheckpoint.status,
    ag27_backend_deferred: records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred === true
  },
  closure_decision: {
    ag26_detailed_chain_closed: true,
    detailed_stages_closed: 5,
    ready_for_existing_ag27_confirmation: true,
    existing_ag27_already_completed: true,
    backend_activation_ready: false,
    auth_activation_ready: false,
    supabase_activation_ready: false,
    runtime_admin_editor_ready: false,
    deployment_ready: false,
    publication_ready: false,
    do_not_start_ag28_without_explicit_approval: true
  },
  closure_summary: {
    editor_workspace_planned: true,
    admin_workspace_planned: true,
    routing_alignment_closed: true,
    static_ux_scaffold_created: true,
    ux_scaffold_audit_passed: true,
    admin_first_system_content_flow_preserved: true,
    editor_independent_new_candidate_flow_preserved: true,
    admin_assigned_editor_edit_flow_preserved: true,
    editor_return_to_admin_flow_preserved: true,
    admin_final_publish_authority_preserved: true,
    editor_publish_authority_blocked: true,
    runtime_ui_created: false,
    auth_enabled: false,
    backend_enabled: false,
    article_mutation_done: false,
    object_generation_done: false,
    deployment_done: false,
    publishing_done: false
  },
  source_chain_file: outputs.sourceChain,
  routing_closure_file: outputs.routingClosure,
  non_runtime_closure_file: outputs.nonRuntimeClosure,
  existing_ag27_handoff_file: outputs.existingAg27Handoff,
  future_consumption_plan_file: outputs.consumptionPlan,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG26Z",
  title: "Manual Admin/Editor Workflow Closure Blocker Register",
  status: "ag26_closed_runtime_operations_blocked_existing_ag27_deferred",
  blocked_items: [
    "No runtime UI creation.",
    "No public HTML page creation.",
    "No React/component file creation.",
    "No runtime route creation.",
    "No Admin login creation.",
    "No Editor login creation.",
    "No Auth activation.",
    "No backend activation.",
    "No Supabase activation.",
    "No runtime queue creation.",
    "No queue data write.",
    "No article file mutation.",
    "No article creation.",
    "No article/object generation trigger.",
    "No public index mutation.",
    "No homepage mutation.",
    "No category page mutation.",
    "No sitemap/feed mutation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No AG28 backend/Auth/dynamic publishing start without explicit approval."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG26Z",
  title: "Post-AG26 Backend Deferral Readiness Record",
  status: "ready_to_respect_existing_ag27_backend_deferral",
  ready_for_existing_ag27_confirmation: true,
  existing_ag27_completed: true,
  next_stage_id: "AG27_EXISTING_CONFIRMATION",
  next_stage_title: "Existing AG27 Backend Decision Checkpoint Confirmation",
  ag26_detailed_closure_created: true,
  source_chain_registered: true,
  routing_closure_registered: true,
  non_runtime_closure_registered: true,
  backend_activation_allowed_now: false,
  ag28_allowed_now: false,
  explicit_approval_required_before_ag28: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG26Z",
  title: "AG26Z to Existing AG27 Backend Decision Checkpoint Boundary",
  status: "existing_ag27_boundary_confirmed_ag28_blocked",
  next_stage_id: "AG27_EXISTING_CONFIRMATION",
  next_stage_title: "Existing AG27 Backend Decision Checkpoint Confirmation",
  allowed_scope: [
    "Confirm existing AG27 checkpoint remains valid.",
    "Confirm Supabase/Auth/backend remains deferred.",
    "Confirm AG28 remains blocked unless explicit approval is given.",
    "Do not create backend, Auth, Supabase, database, runtime queues, deployment or publishing."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_ag28: true
};

const review = {
  module_id: "AG26Z",
  title: "Manual Admin/Editor Workflow Closure",
  status: "manual_admin_editor_workflow_closed_existing_ag27_backend_deferred",
  depends_on: ["AG26A", "AG26A_ALIGNMENT", "AG26B", "AG26C", "AG26D", "AG25Z", "AG26", "AG27"],
  generated_from: inputs,
  closure_file: outputs.closure,
  source_chain_file: outputs.sourceChain,
  routing_closure_file: outputs.routingClosure,
  non_runtime_closure_file: outputs.nonRuntimeClosure,
  existing_ag27_handoff_file: outputs.existingAg27Handoff,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    manual_admin_editor_workflow_closed: true,
    ag26_detailed_chain_closed: true,
    detailed_stages_closed: 5,
    existing_ag27_backend_deferred: true,
    ag28_blocked_pending_explicit_approval: true,
    admin_first_system_content_flow_preserved: true,
    editor_independent_new_candidate_flow_preserved: true,
    admin_assigned_editor_edit_flow_preserved: true,
    editor_return_to_admin_flow_preserved: true,
    admin_final_publish_authority_preserved: true,
    editor_publish_authority_blocked: true,
    runtime_ui_created: false,
    runtime_route_created: false,
    component_file_created: false,
    auth_enabled: false,
    backend_enabled: false,
    queue_mutation_done: false,
    article_file_mutation_done: false,
    object_generation_done: false,
    deployment_done: false,
    publishing_done: false,
    real_execution_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG26Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG26Z",
  preview_only: true,
  status: review.status,
  message: "AG26Z Manual Admin/Editor Workflow Closure created. Existing AG27 backend decision checkpoint remains controlling; AG28 remains blocked pending explicit approval.",
  detailed_stages_closed: 5,
  existing_ag27_backend_deferred: true,
  ag28_allowed_now: 0,
  runtime_ui_created: 0,
  routes_created: 0,
  component_files_created: 0,
  auth_enabled: 0,
  backend_enabled: 0,
  mutated_articles: 0,
  generated_objects: 0,
  published_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG26Z — Manual Admin/Editor Workflow Closure

## Purpose

AG26Z closes the detailed AG26 Admin/Editor manual workflow chain.

## Closed Chain

- AG26A — Editor Workspace UX Plan.
- AG26A Alignment — Editor/Admin/System Routing Alignment.
- AG26B — Admin Workspace UX Plan.
- AG26C — Static UX Scaffold.
- AG26D — UX Scaffold Audit.

## Closure Finding

The AG26 detailed Admin/Editor workflow chain is closed as a governed, non-runtime, no-auth, no-backend, no-publish planning foundation.

## Preserved Governance

- System-generated content first goes to Admin.
- Admin is the core reviewer for system-generated content.
- Editor may independently create new article candidates but must send them to Admin.
- Editor edits system-generated/existing content only after Admin assignment.
- Editor returns edited content to Admin.
- Admin remains final publish authority.
- Editor has no publish authority.
- System cannot publish without Admin.

## Existing AG27 Position

AG27 was already completed earlier as the Supabase/Auth/Backend Decision Checkpoint. AG26Z confirms that AG27 remains the controlling backend decision record and that Supabase/Auth/backend remains deferred.

AG28 must not start unless explicit approval is given.

## Blocked State

No runtime UI, routes, components, logins, Auth, backend, Supabase, runtime queues, article mutation, object generation, GitHub write, deployment or publishing is performed.
`;

writeJson(outputs.review, review);
writeJson(outputs.closure, closure);
writeJson(outputs.sourceChain, sourceChain);
writeJson(outputs.routingClosure, routingClosure);
writeJson(outputs.nonRuntimeClosure, nonRuntimeClosure);
writeJson(outputs.existingAg27Handoff, existingAg27Handoff);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG26Z Manual Admin/Editor Workflow Closure generated.");
console.log("✅ AG26A/AG26A Alignment/AG26B/AG26C/AG26D detailed chain closed.");
console.log("✅ Admin-first routing and Admin-only final publish authority preserved.");
console.log("✅ Existing AG27 backend decision checkpoint confirmed as controlling.");
console.log("✅ AG28 remains blocked pending explicit approval.");
console.log("✅ No runtime UI, Auth, backend, article mutation, deployment or publishing performed.");
