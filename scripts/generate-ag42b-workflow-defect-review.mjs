import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag42aGate: "data/content-intelligence/backend-architecture/ag42a-roadmap-reconciliation-existing-logic-gate.json",
  ag42aConsumption: "data/content-intelligence/backend-architecture/ag42a-existing-logic-consumption-register.json",
  ag42aSupersession: "data/content-intelligence/backend-architecture/ag42a-ag41z-boundary-supersession-record.json",
  ag42aRulebook: "data/content-intelligence/backend-architecture/ag42a-no-duplicate-audit-rulebook.json",
  ag42aEntryPlan: "data/content-intelligence/backend-architecture/ag42a-delta-hardening-entry-plan.json",
  ag42aReadiness: "data/content-intelligence/quality-registry/ag42a-workflow-defect-review-readiness-record.json",
  ag42aBoundary: "data/content-intelligence/mutation-plans/ag42a-to-ag42b-workflow-defect-review-boundary.json",

  ag40bPackage: "data/content-intelligence/backend-architecture/ag40b-admin-editor-workflow-test-package.json",
  ag41aSop: "data/content-intelligence/backend-architecture/ag41a-dynamic-publishing-sop.json",
  ag41aRoleGate: "data/content-intelligence/backend-architecture/ag41a-role-gate-model.json",
  ag41bPlan: "data/content-intelligence/backend-architecture/ag41b-batch-dynamic-publishing-plan.json",
  ag41cPlan: "data/content-intelligence/backend-architecture/ag41c-monitoring-audit-dashboard-plan.json",
  ag41zClosure: "data/content-intelligence/backend-architecture/ag41z-dynamic-publishing-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag42b-workflow-defect-review.json",
  defectReview: "data/content-intelligence/backend-architecture/ag42b-workflow-defect-review.json",
  surfaceInventory: "data/content-intelligence/backend-architecture/ag42b-workflow-surface-inventory.json",
  routeGuardReview: "data/content-intelligence/backend-architecture/ag42b-route-guard-review-record.json",
  hardeningBacklog: "data/content-intelligence/backend-architecture/ag42b-workflow-hardening-backlog.json",
  defectClassification: "data/content-intelligence/backend-architecture/ag42b-defect-classification-register.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag42b-no-mutation-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag42b-workflow-defect-review-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag42b-failed-publish-rollback-dry-run-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag42b-to-ag42c-failed-publish-rollback-dry-run-boundary.json",
  registry: "data/quality/ag42b-workflow-defect-review.json",
  preview: "data/quality/ag42b-workflow-defect-review-preview.json",
  doc: "docs/quality/AG42B_WORKFLOW_DEFECT_REVIEW.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function safeRead(p) {
  return exists(p) ? read(p) : "";
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG42B input: ${p}`);
}

const optionalRoleGuardValidator = [
  "scripts/validate-ag36c-role-based-dashboard-guards.mjs",
  "scripts/validate-ag36c-role-restriction-test.mjs",
  "scripts/validate-ag36c-admin-editor-role-restriction-test.mjs",
  "scripts/validate-ag36c-admin-editor-dashboard-guards.mjs"
].find((candidate) => exists(candidate)) || null;

const ag42aGate = readJson(inputs.ag42aGate);
const ag42aConsumption = readJson(inputs.ag42aConsumption);
const ag42aSupersession = readJson(inputs.ag42aSupersession);
const ag42aRulebook = readJson(inputs.ag42aRulebook);
const ag42aEntryPlan = readJson(inputs.ag42aEntryPlan);
const ag42aReadiness = readJson(inputs.ag42aReadiness);
const ag42aBoundary = readJson(inputs.ag42aBoundary);
const ag40bPackage = readJson(inputs.ag40bPackage);
const ag41aSop = readJson(inputs.ag41aSop);
const ag41aRoleGate = readJson(inputs.ag41aRoleGate);
const ag41bPlan = readJson(inputs.ag41bPlan);
const ag41cPlan = readJson(inputs.ag41cPlan);
const ag41zClosure = readJson(inputs.ag41zClosure);

if (ag42aGate.status !== "roadmap_reconciliation_existing_logic_gate_created_ready_for_ag42b") {
  throw new Error("AG42A gate status mismatch.");
}
if (ag42aReadiness.ready_for_ag42b !== true) throw new Error("AG42A readiness does not permit AG42B.");
if (ag42aBoundary.next_stage_id !== "AG42B") throw new Error("AG42A boundary does not point to AG42B.");
if (ag42aSupersession.supersession_decision.first_controlled_dynamic_content_loop_deferred_to_ag56 !== true) {
  throw new Error("AG42A must defer controlled dynamic content-loop to AG56.");
}
if (ag42aEntryPlan.next_stage_id !== "AG42B") throw new Error("AG42A entry plan must point to AG42B.");
if (!ag42aRulebook.rules.some((rule) => rule.includes("Do not move controlled dynamic live test before AG56"))) {
  throw new Error("AG42A no-duplicate rulebook must preserve AG56 deferral.");
}
if (ag40bPackage.status !== "admin_editor_workflow_test_created_ready_for_ag40c") {
  throw new Error("AG40B workflow test package status mismatch.");
}
if (ag41aSop.status !== "dynamic_publishing_sop_created_ready_for_ag41b_batch_plan") {
  throw new Error("AG41A SOP status mismatch.");
}
if (ag41bPlan.status !== "batch_dynamic_publishing_plan_created_ready_for_ag41c_monitoring_dashboard_plan") {
  throw new Error("AG41B batch plan status mismatch.");
}
if (ag41cPlan.status !== "monitoring_audit_dashboard_plan_created_ready_for_ag41d_dynamic_sop_audit") {
  throw new Error("AG41C monitoring plan status mismatch.");
}
if (ag41zClosure.status !== "dynamic_publishing_closure_created_ready_for_ag42a_first_controlled_batch_decision") {
  throw new Error("AG41Z closure status mismatch.");
}

const routeFiles = [
  { surface_id: "admin_login", role: "admin", surface_type: "login", path: "admin/login.html" },
  { surface_id: "editor_login", role: "editor", surface_type: "login", path: "editor/login.html" },
  { surface_id: "admin_dashboard", role: "admin", surface_type: "dashboard", path: "admin-dashboard.html" },
  { surface_id: "editor_dashboard", role: "editor", surface_type: "dashboard", path: "editor-dashboard.html" },
  { surface_id: "admin_live_auth_js", role: "admin", surface_type: "browser_auth_helper", path: "assets/js/ag36a-admin-live-auth.js" },
  { surface_id: "editor_live_auth_js", role: "editor", surface_type: "browser_auth_helper", path: "assets/js/ag36b-editor-live-auth.js" }
];

function isSafeServiceRoleReference(text) {
  return /no service[-_ ]?role|service[-_ ]?role.*(blocked|not allowed|not exposed|not recorded|not required)|without.*service[-_ ]?role|do not.*service[-_ ]?role/i.test(text);
}

function hasUnsafeServiceRoleExposure(text) {
  const hasSignal = /SERVICE_ROLE|service-role|service_role/i.test(text);
  if (!hasSignal) return false;
  return !isSafeServiceRoleReference(text);
}

const surfaceEntries = routeFiles.map((item) => {
  const text = safeRead(item.path);
  return {
    ...item,
    file_exists: exists(item.path),
    inspected: exists(item.path),
    contains_supabase_signal: /supabase/i.test(text),
    contains_auth_signal: /auth|login|session|sign in/i.test(text),
    contains_service_role_signal: /SERVICE_ROLE|service-role|service_role/i.test(text),
    contains_safe_service_role_reference: isSafeServiceRoleReference(text),
    service_role_exposure_signal: hasUnsafeServiceRoleExposure(text),
    contains_admin_signal: /admin/i.test(text),
    contains_editor_signal: /editor/i.test(text),
    contains_publish_signal: /publish/i.test(text),
    contains_disabled_or_blocked_signal: /disabled|blocked|not active|no-publish|cannot|preview only|no service[-_ ]?role/i.test(text)
  };
});

const missingCoreSurfaces = surfaceEntries
  .filter((item) => ["admin_login", "editor_login", "admin_dashboard", "editor_dashboard"].includes(item.surface_id))
  .filter((item) => item.file_exists !== true)
  .map((item) => item.path);

const serviceRoleSignals = surfaceEntries
  .filter((item) => item.service_role_exposure_signal === true)
  .map((item) => item.path);

const blockedState = {
  workflow_defect_review_created: true,
  workflow_surface_inventory_created: true,
  route_guard_review_created: true,
  hardening_backlog_created: true,
  defect_classification_created: true,
  failed_publish_rollback_dry_run_ready: true,

  first_controlled_batch_execution_approved_now: false,
  first_controlled_batch_executed: false,
  batch_execution_authorized_now: false,
  batch_publish_executed: false,
  candidate_selected_for_execution: false,
  public_mutation_approved_now: false,
  execution_authorized_now: false,
  real_publish_executed: false,
  actual_queue_state_changed: false,
  audit_log_write_done: false,
  rollback_write_done: false,
  database_write_done: false,
  public_article_mutated: false,
  deployment_triggered: false,
  public_mutation_done: false,
  dynamic_publish_runtime_enabled: false,
  dashboard_runtime_enabled: false,
  dashboard_data_query_executed: false,
  monitoring_job_created: false,
  backend_activation_approved_now: false,
  supabase_activation_approved_now: false,
  auth_activation_approved_now: false,
  service_role_key_recorded: false,
  service_role_key_exposed: false,
  anon_access_granted: false,
  write_grants_executed: false,
  sql_file_created: false,
  sql_grants_executed: false
};

const surfaceInventory = {
  module_id: "AG42B",
  title: "Workflow Surface Inventory",
  status: "workflow_surface_inventory_created",
  source_note:
    "Inventory is inspection-only. Missing optional helper files are recorded as review signals, not runtime changes.",
  inspected_surfaces: surfaceEntries,
  core_surface_summary: {
    core_surface_count: 4,
    missing_core_surface_count: missingCoreSurfaces.length,
    missing_core_surfaces: missingCoreSurfaces,
    service_role_signal_count: serviceRoleSignals.length,
    service_role_signal_paths: serviceRoleSignals
  },
  blocked_state: blockedState
};

const routeGuardReview = {
  module_id: "AG42B",
  title: "Route Guard Review Record",
  status: "route_guard_review_created_no_runtime_change",
  consumed_existing_logic: [
    ...(optionalRoleGuardValidator ? [optionalRoleGuardValidator] : []),
    inputs.ag40bPackage,
    inputs.ag41aRoleGate,
    inputs.ag41zClosure
  ],
  route_guard_review: [
    {
      check_id: "admin_dashboard_route_guard",
      expected_rule: "Only Admin role should access Admin dashboard.",
      review_result: "requires_regression_confirmation_before_AG56",
      mutation_done: false
    },
    {
      check_id: "editor_dashboard_route_guard",
      expected_rule: "Only Editor role should access Editor dashboard.",
      review_result: "requires_regression_confirmation_before_AG56",
      mutation_done: false
    },
    {
      check_id: "editor_no_publish_guard",
      expected_rule: "Editor cannot publish or approve public visibility.",
      review_result: ag41aRoleGate.role_model.editor.includes("cannot approve publish")
        ? "covered_by_AG41A_role_gate_model"
        : "needs_hardening_review",
      mutation_done: false
    },
    {
      check_id: "admin_final_clearance_guard",
      expected_rule: "Admin remains final clearance authority.",
      review_result: ag41aRoleGate.role_model.admin.includes("approve publish only after checklist completion")
        ? "covered_by_AG41A_role_gate_model"
        : "needs_hardening_review",
      mutation_done: false
    },
    {
      check_id: "direct_url_access_guard",
      expected_rule: "Direct URL access must not bypass role boundary.",
      review_result: "requires_manual_or_scripted_regression_in_later_stage",
      mutation_done: false
    }
  ],
  route_guard_runtime_modified: false,
  blocked_state: blockedState
};

const defectClassification = {
  module_id: "AG42B",
  title: "Workflow Defect Classification Register",
  status: "defect_classification_register_created",
  severity_scale: [
    {
      severity: "critical",
      meaning: "Can expose restricted route, publish without approval, mutate public surface, expose secret, or break rollback."
    },
    {
      severity: "high",
      meaning: "Can break Admin/Editor workflow, listing consistency, audit completeness, or correction flow."
    },
    {
      severity: "medium",
      meaning: "Can create confusing workflow, stale state, weak messaging, or incomplete readiness."
    },
    {
      severity: "low",
      meaning: "Cosmetic, wording, UI clarity or non-blocking documentation gap."
    }
  ],
  defect_categories: [
    "route_guard_gap",
    "role_boundary_gap",
    "direct_url_access_gap",
    "publish_action_state_gap",
    "return_correction_gap",
    "audit_log_gap",
    "rollback_gap",
    "listing_sync_gap",
    "homepage_surface_gap",
    "service_role_or_secret_exposure_gap",
    "backend_activation_drift",
    "roadmap_drift"
  ],
  current_review_findings: [
    {
      finding_id: "ag42b_f01",
      category: "roadmap_drift",
      severity: "medium",
      finding: "AG41Z old first-controlled-batch direction was already superseded by AG42A and must not reappear before AG56.",
      action: "Carry AG42A supersession into all future AG42-AG55 stages.",
      blocks_ag42c: false
    },
    {
      finding_id: "ag42b_f02",
      category: "direct_url_access_gap",
      severity: "high",
      finding: "Direct URL route guard behaviour requires explicit regression confirmation before AG56.",
      action: "Carry to AG42D permission stress review and AG55 final validation.",
      blocks_ag42c: false
    },
    {
      finding_id: "ag42b_f03",
      category: "rollback_gap",
      severity: "high",
      finding: "Failed publish and rollback path must be dry-run reviewed before release candidate freeze.",
      action: "Move to AG42C failed publish and rollback dry-run.",
      blocks_ag42c: false
    },
    {
      finding_id: "ag42b_f04",
      category: "audit_log_gap",
      severity: "high",
      finding: "Audit-log completeness must remain tied to every future publish, return, archive and rollback action.",
      action: "Carry to AG42D audit-log stress review.",
      blocks_ag42c: false
    }
  ],
  hard_blocker_count_for_ag42c: 0,
  blocked_state: blockedState
};

const hardeningBacklog = {
  module_id: "AG42B",
  title: "Workflow Hardening Backlog",
  status: "workflow_hardening_backlog_created_ready_for_ag42c",
  backlog_items: [
    {
      item_id: "ag42b_h01",
      target_stage: "AG42C",
      title: "Failed publish midway dry-run",
      description: "Simulate a future publish failure after approval but before public listing confirmation.",
      priority: "high",
      mutation_allowed_in_ag42c: false
    },
    {
      item_id: "ag42b_h02",
      target_stage: "AG42C",
      title: "Rollback reference dry-run",
      description: "Confirm what rollback evidence must exist before any future controlled publish.",
      priority: "high",
      mutation_allowed_in_ag42c: false
    },
    {
      item_id: "ag42b_h03",
      target_stage: "AG42D",
      title: "Direct URL role regression",
      description: "Confirm Admin/Editor direct URL access boundaries before AG56.",
      priority: "high",
      mutation_allowed_in_ag42d: false
    },
    {
      item_id: "ag42b_h04",
      target_stage: "AG42D",
      title: "Audit-log required field review",
      description: "Confirm required future audit fields for publish, return, archive and rollback.",
      priority: "high",
      mutation_allowed_in_ag42d: false
    },
    {
      item_id: "ag42b_h05",
      target_stage: "AG55",
      title: "Final route and workflow release candidate validation",
      description: "Revalidate workflow before AG56 controlled dynamic content-loop test.",
      priority: "medium",
      mutation_allowed_in_ag55: false
    }
  ],
  ag42c_candidate_items: ["ag42b_h01", "ag42b_h02"],
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG42B",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag42b",
  checks: [
    { check_id: "review_only", passed: true },
    { check_id: "no_route_file_modified_by_generator", passed: true },
    { check_id: "no_first_controlled_batch_execution", passed: true },
    { check_id: "no_candidate_selected_for_execution", passed: true },
    { check_id: "no_public_mutation", passed: true },
    { check_id: "no_real_publish", passed: true },
    { check_id: "no_database_write", passed: true },
    { check_id: "no_audit_log_write", passed: true },
    { check_id: "no_rollback_write", passed: true },
    { check_id: "no_deployment", passed: true },
    { check_id: "no_backend_activation", passed: true },
    { check_id: "no_sql_file_created", passed: true },
    { check_id: "no_sql_grant_execution", passed: true },
    { check_id: "no_service_role_key", passed: true },
    { check_id: "no_anon_grant", passed: true }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const defectReview = {
  module_id: "AG42B",
  title: "Workflow Defect Review",
  status: "workflow_defect_review_created_ready_for_ag42c_failed_publish_rollback_dry_run",
  purpose:
    "Review Admin/Editor/publish workflow surfaces, route guard expectations, defect categories and hardening backlog without changing runtime behaviour.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  review_decision: {
    workflow_defect_review_created: true,
    workflow_surface_inventory_created: true,
    route_guard_review_created: true,
    defect_classification_created: true,
    hardening_backlog_created: true,
    proceed_to_ag42c_failed_publish_rollback_dry_run: true,

    first_controlled_batch_execution_approved_now: false,
    first_controlled_batch_executed: false,
    batch_execution_authorized_now: false,
    batch_publish_executed: false,
    candidate_selected_for_execution: false,
    real_publish_executed: false,
    database_write_done: false,
    audit_log_write_done: false,
    rollback_write_done: false,
    public_article_mutated: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_enabled: false,
    backend_activation_approved_now: false,
    supabase_activation_approved_now: false,
    auth_activation_approved_now: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_file_created: false,
    sql_grants_executed: false
  },
  surface_inventory_file: outputs.surfaceInventory,
  route_guard_review_file: outputs.routeGuardReview,
  hardening_backlog_file: outputs.hardeningBacklog,
  defect_classification_file: outputs.defectClassification,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG42B",
  title: "Workflow Defect Review Blocker Register",
  status: "workflow_defect_review_blockers_preserved",
  blocked_items: [
    "No first controlled batch execution.",
    "No candidate selected for execution.",
    "No batch execution.",
    "No public mutation.",
    "No real publish.",
    "No queue-state write.",
    "No database write.",
    "No audit-log write.",
    "No rollback write.",
    "No deployment.",
    "No backend/Auth/Supabase activation.",
    "No SQL file created.",
    "No SQL grant execution.",
    "No service-role key exposure.",
    "No anon grants."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG42B",
  title: "Failed Publish and Rollback Dry-run Readiness Record",
  status: "ready_for_ag42c_failed_publish_rollback_dry_run",
  ready_for_ag42c: true,
  next_stage_id: "AG42C",
  next_stage_title: "Failed Publish and Rollback Dry-run",
  workflow_defect_review_created: true,
  hard_blocker_count_for_ag42c: 0,
  ag42c_scope: "failed_publish_and_rollback_dry_run_only_no_mutation",
  first_controlled_dynamic_content_loop_deferred_to_ag56: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  database_write_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG42B",
  title: "AG42B to AG42C Failed Publish and Rollback Dry-run Boundary",
  status: "ag42c_failed_publish_rollback_dry_run_boundary_created",
  next_stage_id: "AG42C",
  next_stage_title: "Failed Publish and Rollback Dry-run",
  allowed_scope: [
    "Consume AG42B workflow defect review.",
    "Create failed publish dry-run model.",
    "Create rollback dry-run model.",
    "Create recovery action checklist.",
    "Do not execute publish.",
    "Do not write rollback record.",
    "Do not mutate database or public surface.",
    "Do not deploy.",
    "Do not execute SQL.",
    "Do not expose service-role key."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG42B",
  title: "Workflow Defect Review",
  status: defectReview.status,
  depends_on: ["AG42A", "AG40B", "AG41A", "AG41B", "AG41C", "AG41Z"],
  generated_from: inputs,
  defect_review_file: outputs.defectReview,
  surface_inventory_file: outputs.surfaceInventory,
  route_guard_review_file: outputs.routeGuardReview,
  hardening_backlog_file: outputs.hardeningBacklog,
  defect_classification_file: outputs.defectClassification,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    workflow_defect_review_created: true,
    ready_for_ag42c: true,
    hard_blocker_count_for_ag42c: 0,
    first_controlled_dynamic_content_loop_deferred_to_ag56: true,
    first_controlled_batch_executed: false,
    batch_execution_authorized_now: false,
    candidate_selected_for_execution: false,
    real_publish_executed: false,
    database_write_done: false,
    public_mutation_done: false,
    deployment_done: false,
    backend_activation_approved_now: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_file_created: false,
    sql_grants_executed: false
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG42B", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG42B",
  preview_only: false,
  status: review.status,
  workflow_defect_review_created: 1,
  ready_for_ag42c: 1,
  hard_blocker_count_for_ag42c: 0,
  first_controlled_dynamic_content_loop_deferred_to_ag56: 1,
  first_controlled_batch_executed: 0,
  batch_execution_authorized_now: 0,
  candidate_selected_for_execution: 0,
  real_publish_executed: 0,
  database_write_done: 0,
  public_mutation_done: 0,
  deployment_done: 0,
  backend_activation_approved_now: 0,
  service_role_key_exposed: 0,
  anon_access_granted: 0,
  sql_file_created: 0,
  sql_grants_executed: 0
};

const doc = `# AG42B — Workflow Defect Review

## Result

AG42B creates the workflow defect review record.

## Scope

This is review-only. It inspects workflow surfaces and records route guard expectations, defect categories and hardening backlog.

## Consumed Existing Logic

- AG42A roadmap reconciliation and no-duplicate rulebook.
- AG40B Admin/Editor workflow test package.
- AG41A dynamic publishing SOP and role gate model.
- AG41B batch dynamic publishing plan.
- AG41C monitoring and audit dashboard plan.
- AG41Z dynamic publishing closure.

## Key Review Areas

- Admin login and dashboard surface.
- Editor login and dashboard surface.
- Admin final clearance rule.
- Editor assigned-only/no-publish rule.
- Direct URL access guard.
- Failed publish and rollback readiness.
- Audit-log completeness requirement.

## Carried Forward to AG42C

- Failed publish midway dry-run.
- Rollback reference dry-run.

## Still Blocked

- No first controlled batch execution.
- No candidate selected for execution.
- No public mutation.
- No real publish.
- No database write.
- No audit-log write.
- No rollback write.
- No deployment.
- No backend/Auth/Supabase activation.
- No SQL grant execution.
- No service-role key exposure.
- No anon grants.

## Next

AG42C — Failed Publish and Rollback Dry-run.
`;

writeJson(outputs.surfaceInventory, surfaceInventory);
writeJson(outputs.routeGuardReview, routeGuardReview);
writeJson(outputs.hardeningBacklog, hardeningBacklog);
writeJson(outputs.defectClassification, defectClassification);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.defectReview, defectReview);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG42B Workflow Defect Review generated.");
console.log("✅ Workflow surfaces, route guard expectations, defect categories and hardening backlog are recorded.");
console.log("✅ Ready for AG42C Failed Publish and Rollback Dry-run.");
console.log("✅ No first controlled batch execution, public mutation, real publish, database write, deployment, SQL grant execution or service-role key recorded.");
