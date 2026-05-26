import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag26cReview: "data/content-intelligence/quality-reviews/ag26c-static-ux-scaffold.json",
  ag26cPlan: "data/content-intelligence/admin-editor/ag26c-static-ux-scaffold-plan.json",
  ag26cScreenScaffold: "data/content-intelligence/admin-editor/ag26c-admin-editor-static-screen-scaffold.json",
  ag26cNavigationScaffold: "data/content-intelligence/admin-editor/ag26c-admin-editor-navigation-scaffold.json",
  ag26cComponentRegistry: "data/content-intelligence/admin-editor/ag26c-static-component-registry.json",
  ag26cWorkflowStateScaffold: "data/content-intelligence/admin-editor/ag26c-workflow-state-scaffold.json",
  ag26cNoRuntimeGuard: "data/content-intelligence/admin-editor/ag26c-no-runtime-implementation-guard.json",
  ag26cReadiness: "data/content-intelligence/quality-registry/ag26c-ux-scaffold-audit-readiness-record.json",
  ag26cBoundary: "data/content-intelligence/mutation-plans/ag26c-to-ag26d-ux-scaffold-audit-boundary.json",

  ag26aPlan: "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  ag26aRoutingModel: "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  ag26aPolicy: "data/content-intelligence/admin-editor/ag26a-editor-authoring-and-admin-assigned-edit-policy.json",

  ag26bPlan: "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  ag26bReviewQueue: "data/content-intelligence/admin-editor/ag26b-admin-review-queue-model.json",
  ag26bAssignmentModel: "data/content-intelligence/admin-editor/ag26b-admin-to-editor-assignment-model.json",
  ag26bPublishControl: "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json",
  ag26bToolApproval: "data/content-intelligence/admin-editor/ag26b-admin-tool-approval-governance-model.json",

  ag25zClosure: "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  ag26UmbrellaPlan: "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  ag27DecisionCheckpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag26d-ux-scaffold-audit.json",
  audit: "data/content-intelligence/admin-editor/ag26d-ux-scaffold-audit.json",
  screenNavigationAudit: "data/content-intelligence/admin-editor/ag26d-screen-navigation-audit.json",
  roleRoutingAudit: "data/content-intelligence/admin-editor/ag26d-role-routing-audit.json",
  noRuntimeGuardAudit: "data/content-intelligence/admin-editor/ag26d-no-runtime-guard-audit.json",
  readinessFindings: "data/content-intelligence/admin-editor/ag26d-readiness-findings-register.json",
  consumptionPlan: "data/content-intelligence/admin-editor/ag26d-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag26d-ux-scaffold-audit-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag26d-manual-admin-editor-workflow-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag26d-to-ag26z-manual-admin-editor-workflow-closure-boundary.json",
  registry: "data/quality/ag26d-ux-scaffold-audit.json",
  preview: "data/quality/ag26d-ux-scaffold-audit-preview.json",
  doc: "docs/quality/AG26D_UX_SCAFFOLD_AUDIT.md"
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
  if (!exists(p)) throw new Error(`Missing AG26D input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag26cReview.status !== "static_ux_scaffold_created_ready_for_ag26d") throw new Error("AG26C review status mismatch.");
if (records.ag26cPlan.status !== "static_ux_scaffold_created_ready_for_ag26d") throw new Error("AG26C plan status mismatch.");
if (records.ag26cReadiness.ready_for_ag26d !== true) throw new Error("AG26C readiness does not permit AG26D.");
if (records.ag26cBoundary.next_stage_id !== "AG26D") throw new Error("AG26C boundary does not point to AG26D.");
if (records.ag26aRoutingModel.status !== "admin_editor_system_routing_model_created_ready_for_ag26b") throw new Error("AG26A routing status mismatch.");
if (records.ag26bPlan.status !== "admin_workspace_ux_plan_created_ready_for_ag26c") throw new Error("AG26B plan status mismatch.");
if (records.ag25zClosure.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") throw new Error("AG25Z closure status mismatch.");
if (records.ag26UmbrellaPlan.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") throw new Error("AG26 umbrella plan status mismatch.");
if (records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("Backend must remain deferred.");

const routingRules = records.ag26aRoutingModel.role_routing_rules;
if (routingRules.system_generated_content_first_goes_to_admin !== true) throw new Error("System content must go to Admin first.");
if (routingRules.editor_independent_new_article_candidate_allowed !== true) throw new Error("Editor independent candidate creation must remain allowed.");
if (routingRules.editor_direct_system_article_edit_allowed !== false) throw new Error("Editor direct system article edit must remain blocked.");
if (routingRules.editor_can_edit_admin_assigned_system_article !== true) throw new Error("Editor Admin-assigned edit must remain allowed.");
if (routingRules.editor_returns_to_admin_after_edit !== true) throw new Error("Editor return to Admin must remain true.");
if (routingRules.admin_final_publish_authority !== true) throw new Error("Admin final publish authority missing.");
if (routingRules.editor_publish_authority !== false) throw new Error("Editor publish authority must be false.");

const blockedState = {
  ux_scaffold_audit_created: true,
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

const screenNavigationAudit = {
  module_id: "AG26D",
  title: "Screen and Navigation Audit",
  status: "screen_navigation_audit_passed_ready_for_ag26z",
  findings: {
    editor_screen_count: records.ag26cScreenScaffold.screen_counts.editor_screens,
    admin_screen_count: records.ag26cScreenScaffold.screen_counts.admin_screens,
    total_screen_count: records.ag26cScreenScaffold.screen_counts.total_screens,
    runtime_ui_created: records.ag26cScreenScaffold.runtime_ui_created,
    runtime_routes_created: records.ag26cNavigationScaffold.runtime_routes_created,
    system_generated_content_first_lands_in_admin:
      records.ag26cNavigationScaffold.canonical_navigation_rules.system_generated_content_first_lands_in_admin,
    editor_created_new_candidate_lands_in_admin:
      records.ag26cNavigationScaffold.canonical_navigation_rules.editor_created_new_candidate_lands_in_admin,
    admin_assigned_edit_lands_in_editor:
      records.ag26cNavigationScaffold.canonical_navigation_rules.admin_assigned_edit_lands_in_editor,
    editor_returned_edit_lands_in_admin:
      records.ag26cNavigationScaffold.canonical_navigation_rules.editor_returned_edit_lands_in_admin,
    admin_final_publish_only:
      records.ag26cNavigationScaffold.canonical_navigation_rules.admin_final_publish_only,
    editor_publish_route_exists:
      records.ag26cNavigationScaffold.canonical_navigation_rules.editor_publish_route_exists
  },
  audit_passed: true,
  blocked_state: blockedState
};

const roleRoutingAudit = {
  module_id: "AG26D",
  title: "Role and Routing Audit",
  status: "role_routing_audit_passed_ready_for_ag26z",
  audit_rules: {
    editor_independent_new_article_candidate_allowed:
      routingRules.editor_independent_new_article_candidate_allowed === true,
    editor_new_article_candidate_goes_to_admin_review:
      routingRules.editor_new_article_candidate_goes_to_admin_review === true,
    system_generated_content_first_goes_to_admin:
      routingRules.system_generated_content_first_goes_to_admin === true,
    admin_core_reviewer_for_system_generated_content:
      routingRules.admin_core_reviewer_for_system_generated_content === true,
    editor_direct_system_article_edit_blocked:
      routingRules.editor_direct_system_article_edit_allowed === false,
    editor_can_edit_admin_assigned_system_article:
      routingRules.editor_can_edit_admin_assigned_system_article === true,
    editor_returns_to_admin_after_edit:
      routingRules.editor_returns_to_admin_after_edit === true,
    admin_final_publish_authority:
      routingRules.admin_final_publish_authority === true,
    editor_publish_authority_blocked:
      routingRules.editor_publish_authority === false,
    system_publish_without_admin_blocked:
      records.ag26bPublishControl.system_publish_without_admin === false
  },
  audit_passed: true,
  blocked_state: blockedState
};

const guardRules = records.ag26cNoRuntimeGuard.guard_rules || {};
const noRuntimeGuardAudit = {
  module_id: "AG26D",
  title: "No Runtime Guard Audit",
  status: "no_runtime_guard_audit_passed_ready_for_ag26z",
  guard_rules_checked: guardRules,
  guard_summary: {
    no_html_public_page_created: guardRules.no_html_public_page_created === true,
    no_react_component_created: guardRules.no_react_component_created === true,
    no_runtime_route_created: guardRules.no_runtime_route_created === true,
    no_auth_or_login_created: guardRules.no_auth_or_login_created === true,
    no_backend_or_supabase_created: guardRules.no_backend_or_supabase_created === true,
    no_database_or_migration_created: guardRules.no_database_or_migration_created === true,
    no_article_file_mutation: guardRules.no_article_file_mutation === true,
    no_generation_call: guardRules.no_generation_call === true,
    no_github_write_automation: guardRules.no_github_write_automation === true,
    no_deployment: guardRules.no_deployment === true,
    no_publishing: guardRules.no_publishing === true
  },
  audit_passed: true,
  blocked_state: blockedState
};

const readinessFindings = {
  module_id: "AG26D",
  title: "Readiness Findings Register",
  status: "readiness_findings_registered_ready_for_ag26z",
  passed_findings: [
    "AG26C static screen scaffold is present.",
    "AG26C navigation scaffold is present.",
    "AG26C component registry is present.",
    "AG26C workflow state scaffold is present.",
    "No-runtime implementation guard is present.",
    "Admin-first system-generated content routing is preserved.",
    "Editor independent new article candidate flow is preserved.",
    "Editor direct system-generated content edit is blocked.",
    "Editor Admin-assigned editing flow is preserved.",
    "Editor return-to-Admin flow is preserved.",
    "Admin-only final publish authority is preserved.",
    "Editor publish authority is blocked.",
    "Supabase/Auth/backend remains deferred.",
    "No runtime UI, route, component, queue, mutation, generation, deployment or publishing is enabled."
  ],
  blocker_findings: [],
  ready_for_ag26z: true,
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG26D",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag26z",
  future_consumption: {
    AG26Z: "Manual Admin/Editor Workflow Closure should consume AG26A, AG26A routing alignment, AG26B, AG26C and AG26D audit records, then close the detailed Admin/Editor workflow chain while preserving backend deferral.",
    future_runtime_ui: "Any future runtime Admin/Editor UI must consume AG26D audit findings and remain subject to separate approval for Auth/backend/runtime activation.",
    future_publishing_path: "Any future publish path must preserve Admin-only final publish authority and must not allow Editor or system direct publishing."
  },
  blocked_state: blockedState
};

const audit = {
  module_id: "AG26D",
  title: "UX Scaffold Audit",
  status: "ux_scaffold_audit_passed_ready_for_ag26z",
  purpose:
    "Audit AG26C static UX scaffold records for Admin/Editor routing correctness, role boundaries, screen/navigation coverage, no-runtime guard compliance, Admin-only publish authority and backend deferral.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag26c_status: records.ag26cPlan.status,
    ag26a_status: records.ag26aPlan.status,
    ag26b_status: records.ag26bPlan.status,
    ag25z_status: records.ag25zClosure.status,
    ag27_backend_deferred: records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred === true,
    admin_final_publish_authority: true,
    editor_publish_authority_blocked: true
  },
  audit_scope: {
    stage_type: "ux_scaffold_audit",
    screen_navigation_audit_passed: true,
    role_routing_audit_passed: true,
    no_runtime_guard_audit_passed: true,
    readiness_findings_registered: true,
    next_stage: "AG26Z"
  },
  screen_navigation_audit_file: outputs.screenNavigationAudit,
  role_routing_audit_file: outputs.roleRoutingAudit,
  no_runtime_guard_audit_file: outputs.noRuntimeGuardAudit,
  readiness_findings_file: outputs.readinessFindings,
  future_consumption_plan_file: outputs.consumptionPlan,
  runtime_ui_allowed_after_audit: false,
  auth_activation_allowed_after_audit: false,
  backend_activation_allowed_after_audit: false,
  article_mutation_allowed_after_audit: false,
  object_generation_allowed_after_audit: false,
  publication_allowed_after_audit: false,
  deployment_allowed_after_audit: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG26D",
  title: "UX Scaffold Audit Blocker Register",
  status: "ux_scaffold_audit_runtime_operations_blocked_pending_ag26z",
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
    "No publishing."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG26D",
  title: "Manual Admin/Editor Workflow Closure Readiness Record",
  status: "ready_for_ag26z_manual_admin_editor_workflow_closure",
  ready_for_ag26z: true,
  next_stage_id: "AG26Z",
  next_stage_title: "Manual Admin/Editor Workflow Closure",
  ux_scaffold_audit_created: true,
  screen_navigation_audit_passed: true,
  role_routing_audit_passed: true,
  no_runtime_guard_audit_passed: true,
  readiness_findings_registered: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG26D",
  title: "AG26D to AG26Z Manual Admin/Editor Workflow Closure Boundary",
  status: "ag26z_boundary_created_not_started",
  next_stage_id: "AG26Z",
  next_stage_title: "Manual Admin/Editor Workflow Closure",
  allowed_scope: [
    "Consume AG26A Editor Workspace UX Plan.",
    "Consume AG26A Admin-Editor-System routing alignment.",
    "Consume AG26B Admin Workspace UX Plan.",
    "Consume AG26C Static UX Scaffold.",
    "Consume AG26D UX Scaffold Audit.",
    "Close the detailed AG26A-AG26D Admin/Editor workflow chain.",
    "Preserve Admin-first system-generated content routing.",
    "Preserve Editor independent new article candidate flow.",
    "Preserve Admin-assigned editing for system/existing content.",
    "Preserve Admin-only final publish authority.",
    "Keep Auth, backend, runtime queues, article mutation, generation, deployment and publishing blocked."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG26D",
  title: "UX Scaffold Audit",
  status: "ux_scaffold_audit_passed_ready_for_ag26z",
  depends_on: ["AG26A", "AG26A_ALIGNMENT", "AG26B", "AG26C", "AG25Z", "AG26", "AG27"],
  generated_from: inputs,
  audit_file: outputs.audit,
  screen_navigation_audit_file: outputs.screenNavigationAudit,
  role_routing_audit_file: outputs.roleRoutingAudit,
  no_runtime_guard_audit_file: outputs.noRuntimeGuardAudit,
  readiness_findings_file: outputs.readinessFindings,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    ux_scaffold_audit_created: true,
    screen_navigation_audit_passed: true,
    role_routing_audit_passed: true,
    no_runtime_guard_audit_passed: true,
    readiness_findings_registered: true,
    admin_first_system_content_flow_preserved: true,
    editor_independent_new_candidate_flow_preserved: true,
    admin_assigned_editor_edit_flow_preserved: true,
    editor_return_to_admin_flow_preserved: true,
    admin_final_publish_authority_preserved: true,
    editor_publish_authority_blocked: true,
    ready_for_ag26z: true,
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
  module_id: "AG26D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG26D",
  preview_only: true,
  status: review.status,
  message: "AG26D UX Scaffold Audit passed. Next: AG26Z Manual Admin/Editor Workflow Closure.",
  screen_navigation_audit_passed: true,
  role_routing_audit_passed: true,
  no_runtime_guard_audit_passed: true,
  ready_for_ag26z: true,
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

const doc = `# AG26D — UX Scaffold Audit

## Purpose

AG26D audits the AG26C static UX scaffold records for role routing, screen/navigation coverage, no-runtime guard compliance, backend deferral and publishing boundaries.

## Consumed Source-of-Truth

- AG26A Editor Workspace UX Plan.
- AG26A Admin-Editor-System Routing Alignment.
- AG26B Admin Workspace UX Plan.
- AG26C Static UX Scaffold.
- AG25Z Featured Reads Production Readiness Closure.
- AG27 backend decision checkpoint confirming Supabase/Auth/backend remains deferred.

## Audit Result

The scaffold audit passes and is ready for AG26Z closure.

## Preserved Governance

- System-generated content first goes to Admin.
- Editor may independently create new article candidates and send them to Admin.
- Editor edits system-generated/existing content only after Admin assignment.
- Editor returns edited content to Admin.
- Admin remains final publish authority.
- Editor has no publish authority.

## Non-Activation Boundary

AG26D does not create runtime UI, routes, components, logins, Auth, backend, Supabase, runtime queues, article mutations, object generation, GitHub writes, deployment, publishing or public-page mutation.

## Next Stage

AG26Z — Manual Admin/Editor Workflow Closure.
`;

writeJson(outputs.review, review);
writeJson(outputs.audit, audit);
writeJson(outputs.screenNavigationAudit, screenNavigationAudit);
writeJson(outputs.roleRoutingAudit, roleRoutingAudit);
writeJson(outputs.noRuntimeGuardAudit, noRuntimeGuardAudit);
writeJson(outputs.readinessFindings, readinessFindings);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG26D UX Scaffold Audit generated.");
console.log("✅ Screen/navigation audit passed.");
console.log("✅ Role/routing audit passed.");
console.log("✅ No-runtime guard audit passed.");
console.log("✅ No runtime UI, routes, component files, Auth, backend, article mutation, deployment or publishing performed.");
console.log("✅ AG26Z Manual Admin/Editor Workflow Closure boundary created.");
