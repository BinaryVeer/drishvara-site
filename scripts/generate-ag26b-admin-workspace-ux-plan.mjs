import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag26aReview: "data/content-intelligence/quality-reviews/ag26a-editor-workspace-ux-plan.json",
  ag26aPlan: "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  ag26aWorkspaceMap: "data/content-intelligence/admin-editor/ag26a-editor-workspace-surface-map.json",
  ag26aToolInventory: "data/content-intelligence/admin-editor/ag26a-editor-auto-article-tool-inventory.json",
  ag26aCreateEdit: "data/content-intelligence/admin-editor/ag26a-editor-create-edit-article-tool-model.json",
  ag26aObjectModel: "data/content-intelligence/admin-editor/ag26a-editor-object-generation-tool-model.json",
  ag26aCorrectionModel: "data/content-intelligence/admin-editor/ag26a-editor-correction-field-model.json",
  ag26aPreviewSubmit: "data/content-intelligence/admin-editor/ag26a-editor-preview-submit-workflow-model.json",
  ag26aReviewState: "data/content-intelligence/admin-editor/ag26a-editor-review-state-model.json",
  ag26aAlignment: "data/content-intelligence/admin-editor/ag26a-editor-admin-assignment-alignment-record.json",
  ag26aAlignmentReview: "data/content-intelligence/quality-reviews/ag26a-editor-admin-assignment-alignment.json",
  ag26aReadiness: "data/content-intelligence/quality-registry/ag26a-admin-workspace-ux-plan-readiness-record.json",
  ag26aBoundary: "data/content-intelligence/mutation-plans/ag26a-to-ag26b-admin-workspace-ux-plan-boundary.json",

  ag26UmbrellaPlan: "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  ag26RolePermission: "data/content-intelligence/admin-editor/ag26-admin-editor-role-permission-planning-model.json",
  ag26ManualQueue: "data/content-intelligence/admin-editor/ag26-manual-review-queue-workflow-model.json",
  ag26ApprovalGate: "data/content-intelligence/admin-editor/ag26-editorial-approval-gate-model.json",

  ag25zClosure: "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  ag25zReadinessMatrix: "data/content-intelligence/featured-reads/ag25z-featured-reads-readiness-matrix.json",
  ag25zUnresolvedRegister: "data/content-intelligence/featured-reads/ag25z-unresolved-featured-reads-work-register.json",

  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  ag27DecisionCheckpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag26b-admin-workspace-ux-plan.json",
  plan: "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  workspaceMap: "data/content-intelligence/admin-editor/ag26b-admin-workspace-surface-map.json",
  assignmentControlModel: "data/content-intelligence/admin-editor/ag26b-admin-assignment-control-model.json",
  reviewActionModel: "data/content-intelligence/admin-editor/ag26b-admin-review-action-model.json",
  evidenceDeltaReviewModel: "data/content-intelligence/admin-editor/ag26b-admin-evidence-delta-review-model.json",
  toolGovernanceModel: "data/content-intelligence/admin-editor/ag26b-admin-tool-governance-model.json",
  consumptionPlan: "data/content-intelligence/admin-editor/ag26b-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag26b-admin-workspace-ux-plan-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag26b-static-ux-scaffold-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag26b-to-ag26c-static-ux-scaffold-boundary.json",
  registry: "data/quality/ag26b-admin-workspace-ux-plan.json",
  preview: "data/quality/ag26b-admin-workspace-ux-plan-preview.json",
  doc: "docs/quality/AG26B_ADMIN_WORKSPACE_UX_PLAN.md"
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
  if (!exists(p)) throw new Error(`Missing AG26B input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag26aReview.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") throw new Error("AG26A review status mismatch.");
if (records.ag26aPlan.status !== "editor_workspace_ux_plan_created_ready_for_ag26b") throw new Error("AG26A plan status mismatch.");
if (records.ag26aReadiness.ready_for_ag26b !== true) throw new Error("AG26A readiness does not permit AG26B.");
if (records.ag26aBoundary.next_stage_id !== "AG26B") throw new Error("AG26A boundary does not point to AG26B.");
if (records.ag26aAlignment.status !== "ag26a_editor_admin_assignment_alignment_applied_ready_for_ag26b") throw new Error("AG26A alignment status mismatch.");
if (records.ag26aAlignment.alignment_decision?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("AG26A must restrict Editor to Admin-assigned items.");
if (records.ag26aAlignment.alignment_decision?.editor_returns_work_to_admin !== true) throw new Error("AG26A must require Editor to return work to Admin.");
if (records.ag26UmbrellaPlan.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") throw new Error("AG26 umbrella plan status mismatch.");
if (records.ag25zClosure.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") throw new Error("AG25Z closure status mismatch.");
if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z closure status mismatch.");
if (records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("Backend must remain deferred.");
if (records.ag27DecisionCheckpoint.checkpoint_decision?.backend_activation_approved !== false) throw new Error("Backend activation must remain unapproved.");

const blockedState = {
  admin_workspace_runtime_enabled: false,
  admin_login_created: false,
  admin_account_created: false,
  auth_enabled: false,
  backend_enabled: false,
  supabase_enabled: false,
  admin_queue_runtime_created: false,
  editor_queue_runtime_created: false,
  assignment_runtime_created: false,
  assignment_data_written: false,
  review_action_executed: false,
  archive_executed: false,
  return_for_correction_executed: false,
  publish_executed: false,
  publish_and_close_executed: false,
  article_file_created: false,
  article_file_mutated: false,
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

const adminGovernance = {
  admin_is_assignment_originator: true,
  admin_assigns_work_to_editor: true,
  admin_receives_work_back_from_editor: true,
  admin_final_clearance_authority: true,
  editor_independent_creation_blocked: true,
  editor_global_browse_blocked: true,
  editor_self_assignment_blocked: true,
  admin_publish_actions_planned_only: true,
  admin_publish_actions_execute_now: false,
  static_publish_requires_later_controlled_apply_path: true,
  backend_auth_supabase_deferred: true
};

const surfaces = [
  {
    surface_id: "admin_dashboard",
    label: "Admin Dashboard",
    purpose: "Show admin-level summary of assignments, returned items, evidence status, delta status and blocked publish actions.",
    runtime_enabled: false
  },
  {
    surface_id: "admin_article_inventory",
    label: "Admin Article Inventory",
    purpose: "Browse all article candidates and readiness records at Admin planning level.",
    runtime_enabled: false
  },
  {
    surface_id: "assignment_control_panel",
    label: "Assignment Control Panel",
    purpose: "Plan Admin assignment of new draft tasks or existing article edits to Editor.",
    runtime_enabled: false
  },
  {
    surface_id: "editor_return_review_panel",
    label: "Editor Return Review Panel",
    purpose: "Review work sent back by Editor with notes, reference status, attribution status and layout status.",
    runtime_enabled: false
  },
  {
    surface_id: "evidence_review_panel",
    label: "Evidence Review Panel",
    purpose: "Review Admin approval evidence, source status, image credit status, layout status and editorial notes.",
    runtime_enabled: false
  },
  {
    surface_id: "delta_review_panel",
    label: "Delta Review Panel",
    purpose: "Plan before/after file delta review before any later controlled static apply path.",
    runtime_enabled: false
  },
  {
    surface_id: "return_for_correction_panel",
    label: "Return for Correction Panel",
    purpose: "Plan Admin return of item to Editor with structured correction notes.",
    runtime_enabled: false
  },
  {
    surface_id: "archive_panel",
    label: "Archive Panel",
    purpose: "Plan Admin archive decision for unsuitable or deferred candidates.",
    runtime_enabled: false
  },
  {
    surface_id: "publish_decision_panel",
    label: "Publish Decision Panel",
    purpose: "Plan Admin publish and publish-and-close decisions as blocked/non-executable actions until a later approved controlled publishing path.",
    runtime_enabled: false
  },
  {
    surface_id: "tool_approval_panel",
    label: "Tool Approval Panel",
    purpose: "Plan Admin approval of editor tool use for assigned articles, including images, graphs, tables, infographics and diagrams.",
    runtime_enabled: false
  },
  {
    surface_id: "audit_notes_panel",
    label: "Audit and Notes Panel",
    purpose: "Plan audit trail fields for Admin decisions, evidence notes, return notes and closure notes.",
    runtime_enabled: false
  },
  {
    surface_id: "admin_status_summary_panel",
    label: "Admin Status Summary Panel",
    purpose: "Show planned non-runtime status for assigned, returned, archived, internally cleared and blocked-for-publish items.",
    runtime_enabled: false
  }
];

const assignmentActions = [
  {
    action_id: "assign_new_draft_to_editor",
    label: "Assign New Draft to Editor",
    purpose: "Admin sends a new article draft task to Editor.",
    execution_enabled: false
  },
  {
    action_id: "assign_existing_article_to_editor",
    label: "Assign Existing Article to Editor",
    purpose: "Admin sends an existing article candidate to Editor for correction or enrichment.",
    execution_enabled: false
  },
  {
    action_id: "reassign_editor",
    label: "Reassign Editor",
    purpose: "Admin changes the assigned editor in a future workflow.",
    execution_enabled: false
  },
  {
    action_id: "withdraw_assignment",
    label: "Withdraw Assignment",
    purpose: "Admin withdraws an assigned item before final review.",
    execution_enabled: false
  },
  {
    action_id: "receive_editor_return",
    label: "Receive Editor Return",
    purpose: "Admin receives editor-completed work back into Admin review.",
    execution_enabled: false
  }
];

const adminReviewActions = [
  {
    action_id: "return_for_correction",
    label: "Return for correction",
    purpose: "Admin returns the article to Editor with structured correction notes.",
    execution_enabled: false,
    public_mutation_allowed: false
  },
  {
    action_id: "archive",
    label: "Archive",
    purpose: "Admin archives unsuitable, duplicate, weak, unsafe or deferred article candidates.",
    execution_enabled: false,
    public_mutation_allowed: false
  },
  {
    action_id: "hold_for_admin_review",
    label: "Hold for Admin review",
    purpose: "Admin keeps the article in internal review pending evidence, delta review or policy decision.",
    execution_enabled: false,
    public_mutation_allowed: false
  },
  {
    action_id: "internal_clearance_candidate",
    label: "Internal clearance candidate",
    purpose: "Admin marks that the item may later enter controlled static apply readiness; this is not publishing.",
    execution_enabled: false,
    public_mutation_allowed: false
  },
  {
    action_id: "publish_plan_only",
    label: "Publish",
    purpose: "Plan the Admin publish action, but keep actual publishing blocked until later controlled static/dynamic approval path.",
    execution_enabled: false,
    public_mutation_allowed: false,
    requires_future_controlled_publish_stage: true
  },
  {
    action_id: "publish_and_close_plan_only",
    label: "Publish and close",
    purpose: "Plan Admin publish-and-close action, but keep execution blocked until later controlled static/dynamic approval path.",
    execution_enabled: false,
    public_mutation_allowed: false,
    requires_future_controlled_publish_stage: true
  }
];

const evidenceChecklist = [
  "admin_assignment_record",
  "editor_return_note",
  "reference_status",
  "source_credibility_status",
  "image_credit_or_attribution_status",
  "layout_and_mobile_status",
  "card_and_summary_status",
  "public_visibility_default_false",
  "publish_approved_default_false",
  "intended_file_delta_summary",
  "rollback_note",
  "smoke_test_plan_note"
];

const deltaReviewFields = [
  "candidate_article_path",
  "proposed_visibility_delta",
  "proposed_featured_reads_delta",
  "proposed_category_delta",
  "proposed_homepage_delta",
  "proposed_sitemap_feed_delta",
  "before_hash",
  "after_hash_planned",
  "rollback_reference",
  "admin_delta_review_note"
];

const workspaceMap = {
  module_id: "AG26B",
  title: "Admin Workspace Surface Map",
  status: "admin_workspace_surface_map_created_no_runtime_ui",
  surface_count: surfaces.length,
  surfaces,
  runtime_ui_created: false,
  admin_login_required_now: false,
  blocked_state: blockedState
};

const assignmentControlModel = {
  module_id: "AG26B",
  title: "Admin Assignment Control Model",
  status: "admin_assignment_control_model_created_no_runtime_queue",
  assignment_actions: assignmentActions,
  assignment_flow: [
    "Admin selects article candidate or new draft task.",
    "Admin assigns item to Editor with note and expected correction/preparation scope.",
    "Editor works only inside assigned workspace.",
    "Editor sends work back to Admin.",
    "Admin reviews evidence, delta and final status."
  ],
  admin_is_assignment_originator: true,
  editor_self_assignment_allowed: false,
  assignment_runtime_enabled: false,
  assignment_data_write_allowed: false,
  blocked_state: blockedState
};

const reviewActionModel = {
  module_id: "AG26B",
  title: "Admin Review Action Model",
  status: "admin_review_action_model_created_no_live_action",
  admin_review_actions: adminReviewActions,
  planned_actions_named_in_roadmap: [
    "Archive",
    "Return for correction",
    "Publish",
    "Publish and close"
  ],
  publish_actions_planned_only: true,
  publish_execution_allowed_in_ag26b: false,
  public_visibility_change_allowed_in_ag26b: false,
  publish_approved_change_allowed_in_ag26b: false,
  github_write_allowed_in_ag26b: false,
  deployment_allowed_in_ag26b: false,
  blocked_state: blockedState
};

const evidenceDeltaReviewModel = {
  module_id: "AG26B",
  title: "Admin Evidence and Delta Review Model",
  status: "admin_evidence_delta_review_model_created_no_file_mutation",
  evidence_checklist: evidenceChecklist,
  delta_review_fields: deltaReviewFields,
  evidence_review_required_before_future_publish: true,
  delta_review_required_before_future_publish: true,
  rollback_note_required_before_future_publish: true,
  smoke_test_note_required_before_future_publish: true,
  file_mutation_allowed_in_ag26b: false,
  public_surface_mutation_allowed_in_ag26b: false,
  blocked_state: blockedState
};

const toolGovernanceModel = {
  module_id: "AG26B",
  title: "Admin Tool Governance Model",
  status: "admin_tool_governance_model_created_no_tool_execution",
  consumed_editor_tool_groups: records.ag26aToolInventory.tool_groups.map((group) => group.group_id),
  admin_tool_controls: [
    "approve_tool_for_assigned_article",
    "deny_tool_for_assigned_article",
    "request_lower_cost_option",
    "require_reference_before_tool_use",
    "require_credit_before_object_use",
    "require_layout_review_before_object_use",
    "send_tool_request_back_to_editor"
  ],
  tool_execution_allowed_in_ag26b: false,
  object_generation_allowed_in_ag26b: false,
  image_generation_allowed_in_ag26b: false,
  editor_tool_use_requires_admin_assignment: true,
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG26B",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag26c_to_ag26z",
  future_consumption: {
    AG26C: "Static UX Scaffold should consume AG26A Editor workspace and AG26B Admin workspace as non-active/static UX surfaces only.",
    AG26D: "UX Scaffold Audit should verify role separation, Admin-only final clearance, no live action execution and no backend/Auth activation.",
    AG26Z: "Manual Admin/Editor Workflow Closure should close AG26A-AG26D while preserving AG27 backend deferral and blocked publish execution.",
    future_publish_path: "Actual Publish or Publish-and-close must remain blocked until a separately approved controlled static/dynamic publish stage."
  },
  blocked_state: blockedState
};

const plan = {
  module_id: "AG26B",
  title: "Admin Workspace UX Plan",
  status: "admin_workspace_ux_plan_created_ready_for_ag26c",
  purpose:
    "Plan the Admin-side workspace UX for assigning work to Editor, receiving edited work back, reviewing evidence, reviewing file deltas, returning for correction, archiving, and planning Publish / Publish-and-close actions without executing any live action.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag26a_status: records.ag26aPlan.status,
    ag26a_admin_assignment_alignment: records.ag26aAlignment.status,
    ag25z_status: records.ag25zClosure.status,
    ag26_umbrella_status: records.ag26UmbrellaPlan.status,
    ag27_backend_deferred: records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred === true
  },
  admin_governance: adminGovernance,
  ux_scope: {
    stage_type: "admin_workspace_ux_plan",
    surface_count: surfaces.length,
    assignment_action_count: assignmentActions.length,
    admin_review_action_count: adminReviewActions.length,
    evidence_check_count: evidenceChecklist.length,
    runtime_ui_status: "blocked",
    auth_status: "blocked",
    queue_mutation_status: "blocked",
    assignment_write_status: "blocked",
    live_admin_action_status: "blocked",
    publish_execution_status: "blocked",
    next_stage: "AG26C"
  },
  workspace_surface_map_file: outputs.workspaceMap,
  assignment_control_model_file: outputs.assignmentControlModel,
  review_action_model_file: outputs.reviewActionModel,
  evidence_delta_review_model_file: outputs.evidenceDeltaReviewModel,
  tool_governance_model_file: outputs.toolGovernanceModel,
  future_consumption_plan_file: outputs.consumptionPlan,
  admin_workspace_runtime_allowed_in_ag26b: false,
  admin_login_creation_allowed_in_ag26b: false,
  auth_activation_allowed_in_ag26b: false,
  backend_activation_allowed_in_ag26b: false,
  assignment_runtime_allowed_in_ag26b: false,
  assignment_data_write_allowed_in_ag26b: false,
  admin_review_action_execution_allowed_in_ag26b: false,
  archive_execution_allowed_in_ag26b: false,
  return_for_correction_execution_allowed_in_ag26b: false,
  publish_execution_allowed_in_ag26b: false,
  publish_and_close_execution_allowed_in_ag26b: false,
  article_file_mutation_allowed_in_ag26b: false,
  public_mutation_allowed_in_ag26b: false,
  deployment_allowed_in_ag26b: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG26B",
  title: "Admin Workspace UX Plan Blocker Register",
  status: "admin_workspace_ux_operations_blocked_pending_ag26c",
  blocked_items: [
    "No Admin workspace runtime UI.",
    "No Admin login creation.",
    "No Admin account creation.",
    "No Auth activation.",
    "No backend activation.",
    "No Supabase activation.",
    "No runtime Admin queue creation.",
    "No runtime Editor queue creation.",
    "No assignment runtime creation.",
    "No assignment data write.",
    "No Admin review action execution.",
    "No archive execution.",
    "No return-for-correction execution.",
    "No publish execution.",
    "No publish-and-close execution.",
    "No article file creation.",
    "No article file mutation.",
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
  module_id: "AG26B",
  title: "Static UX Scaffold Readiness Record",
  status: "ready_for_ag26c_static_ux_scaffold",
  ready_for_ag26c: true,
  next_stage_id: "AG26C",
  next_stage_title: "Static UX Scaffold",
  admin_workspace_ux_plan_created: true,
  admin_assignment_control_model_created: true,
  admin_review_action_model_created: true,
  evidence_delta_review_model_created: true,
  admin_tool_governance_model_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG26B",
  title: "AG26B to AG26C Static UX Scaffold Boundary",
  status: "ag26c_boundary_created_not_started",
  next_stage_id: "AG26C",
  next_stage_title: "Static UX Scaffold",
  allowed_scope: [
    "Consume AG26A Editor workspace plan and admin-assignment alignment.",
    "Consume AG26B Admin workspace plan.",
    "Create non-active/static UX scaffold only.",
    "Keep Admin/Editor login, Auth, backend, queue mutation, assignment writes, review actions, publish actions, deployment and public mutation blocked."
  ],
  blocked_scope: blocker.blocked_items,
  admin_final_clearance_required: true,
  editor_workflow_rule: "Admin assigns item to Editor; Editor sends work back to Admin; Admin decides.",
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG26B",
  title: "Admin Workspace UX Plan",
  status: "admin_workspace_ux_plan_created_ready_for_ag26c",
  depends_on: ["AG26A", "AG26", "AG25Z", "AG24Z", "AG27"],
  generated_from: inputs,
  plan_file: outputs.plan,
  workspace_surface_map_file: outputs.workspaceMap,
  assignment_control_model_file: outputs.assignmentControlModel,
  review_action_model_file: outputs.reviewActionModel,
  evidence_delta_review_model_file: outputs.evidenceDeltaReviewModel,
  tool_governance_model_file: outputs.toolGovernanceModel,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    admin_workspace_ux_plan_created: true,
    admin_assignment_control_model_created: true,
    admin_review_action_model_created: true,
    evidence_delta_review_model_created: true,
    admin_tool_governance_model_created: true,
    archive_action_planned: true,
    return_for_correction_action_planned: true,
    publish_action_planned_only: true,
    publish_and_close_action_planned_only: true,
    evidence_review_planned: true,
    delta_review_planned: true,
    ready_for_ag26c: true,
    admin_workspace_runtime_created: false,
    admin_login_created: false,
    auth_enabled: false,
    backend_enabled: false,
    assignment_write_done: false,
    admin_review_action_executed: false,
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
  module_id: "AG26B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG26B",
  preview_only: true,
  status: review.status,
  message: "AG26B Admin Workspace UX Plan created. Next: AG26C Static UX Scaffold.",
  surface_count: surfaces.length,
  assignment_action_count: assignmentActions.length,
  admin_review_action_count: adminReviewActions.length,
  evidence_check_count: evidenceChecklist.length,
  admin_logins_created: 0,
  auth_enabled: 0,
  backend_enabled: 0,
  assignment_writes: 0,
  executed_review_actions: 0,
  executed_publish_actions: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG26B — Admin Workspace UX Plan

## Purpose

AG26B plans the Admin-side workspace UX for Drishvara.

It supports Admin assignment of work to Editor, review of work returned by Editor, evidence review, delta review, archive, return for correction, and planned Publish / Publish-and-close decisions. All actions remain non-runtime and non-executable.

## Consumed Source-of-Truth

- AG26A Editor Workspace UX Plan.
- AG26A Admin-assigned Editor workflow alignment.
- AG25Z Featured Reads Production Readiness Closure.
- AG26 umbrella Admin/Editor Manual Workflow Strengthening.
- AG24Z Episodic Knowledge Engine Closure.
- AG27 backend decision checkpoint confirming Supabase/Auth/backend remains deferred.

## Planned Admin Surfaces

- Admin Dashboard.
- Admin Article Inventory.
- Assignment Control Panel.
- Editor Return Review Panel.
- Evidence Review Panel.
- Delta Review Panel.
- Return for Correction Panel.
- Archive Panel.
- Publish Decision Panel.
- Tool Approval Panel.
- Audit and Notes Panel.
- Admin Status Summary Panel.

## Admin Workflow Rule

Admin assigns or sends work to Editor. Editor can work only on Admin-assigned items. Editor sends work back to Admin. Admin remains final clearance authority.

## Planned Admin Actions

- Archive.
- Return for correction.
- Hold for Admin review.
- Internal clearance candidate.
- Publish — plan only, execution blocked.
- Publish and close — plan only, execution blocked.

## Non-Activation Boundary

AG26B does not create Admin login, Admin account, Auth, backend, Supabase, runtime queues, assignment writes, review action execution, article mutation, public visibility change, publish-approved change, GitHub write, deployment, publishing or public-page mutation.

## Next Stage

AG26C — Static UX Scaffold.
`;

writeJson(outputs.review, review);
writeJson(outputs.plan, plan);
writeJson(outputs.workspaceMap, workspaceMap);
writeJson(outputs.assignmentControlModel, assignmentControlModel);
writeJson(outputs.reviewActionModel, reviewActionModel);
writeJson(outputs.evidenceDeltaReviewModel, evidenceDeltaReviewModel);
writeJson(outputs.toolGovernanceModel, toolGovernanceModel);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG26B Admin Workspace UX Plan generated.");
console.log(`✅ Admin surfaces planned: ${surfaces.length}`);
console.log(`✅ Assignment actions planned: ${assignmentActions.length}`);
console.log(`✅ Admin review actions planned: ${adminReviewActions.length}`);
console.log("✅ Archive, Return for correction, Publish, Publish-and-close, evidence review and delta review are included.");
console.log("✅ No Admin login, Auth, backend, queue mutation, assignment write, publish execution, deployment or public mutation performed.");
console.log("✅ AG26C Static UX Scaffold boundary created.");
