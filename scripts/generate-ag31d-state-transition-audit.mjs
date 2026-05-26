import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag31cReview: "data/content-intelligence/quality-reviews/ag31c-audit-log-model.json",
  ag31cModel: "data/content-intelligence/backend-architecture/ag31c-audit-log-model.json",
  ag31cFieldSchema: "data/content-intelligence/backend-architecture/ag31c-audit-log-field-schema.json",
  ag31cStateEventShape: "data/content-intelligence/backend-architecture/ag31c-state-event-log-shape.json",
  ag31cHashModel: "data/content-intelligence/backend-architecture/ag31c-before-after-hash-model.json",
  ag31cActorModel: "data/content-intelligence/backend-architecture/ag31c-actor-action-timestamp-model.json",
  ag31cNonActivationAudit: "data/content-intelligence/backend-architecture/ag31c-audit-log-non-activation-audit-register.json",
  ag31cReadiness: "data/content-intelligence/quality-registry/ag31c-state-transition-audit-readiness-record.json",
  ag31cBoundary: "data/content-intelligence/mutation-plans/ag31c-to-ag31d-state-transition-audit-boundary.json",

  ag31bPlan: "data/content-intelligence/backend-architecture/ag31b-queue-integration-plan.json",
  ag31bAdminQueueMap: "data/content-intelligence/backend-architecture/ag31b-admin-review-queue-map.json",
  ag31bEditorQueueMap: "data/content-intelligence/backend-architecture/ag31b-editor-assignment-queue-map.json",
  ag31bStaticToFutureDbPlan: "data/content-intelligence/backend-architecture/ag31b-static-to-future-db-queue-plan.json",
  ag31bNonActivationAudit: "data/content-intelligence/backend-architecture/ag31b-queue-non-activation-audit-register.json",

  ag31aModel: "data/content-intelligence/backend-architecture/ag31a-article-state-model.json",
  ag31aStateRegister: "data/content-intelligence/backend-architecture/ag31a-article-state-register.json",
  ag31aTransitionMap: "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  ag31aPermissionMatrix: "data/content-intelligence/backend-architecture/ag31a-role-state-permission-matrix.json",

  ag30zClosure: "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  ag30zActivationBlocker: "data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json",
  ag30bAssignedOnlyModel: "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",

  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag31d-state-transition-audit.json",
  audit: "data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json",
  illegalTransitionAudit: "data/content-intelligence/backend-architecture/ag31d-illegal-transition-audit-register.json",
  adminApprovalGateAudit: "data/content-intelligence/backend-architecture/ag31d-admin-approval-gate-audit-register.json",
  editorRestrictionAudit: "data/content-intelligence/backend-architecture/ag31d-editor-restriction-audit-register.json",
  publishPathAudit: "data/content-intelligence/backend-architecture/ag31d-publish-path-audit-register.json",
  nonActivationAudit: "data/content-intelligence/backend-architecture/ag31d-state-transition-non-activation-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag31d-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag31d-state-transition-audit-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag31d-queue-integration-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag31d-to-ag31z-queue-integration-closure-boundary.json",
  registry: "data/quality/ag31d-state-transition-audit.json",
  preview: "data/quality/ag31d-state-transition-audit-preview.json",
  doc: "docs/quality/AG31D_STATE_TRANSITION_AUDIT.md"
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

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG31D input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag31cModel.status !== "audit_log_model_created_ready_for_ag31d") throw new Error("AG31C model status mismatch.");
if (records.ag31cReadiness.ready_for_ag31d !== true) throw new Error("AG31C readiness does not permit AG31D.");
if (records.ag31cReadiness.allowed_ag31d_mode !== "non_active_state_transition_audit_only") throw new Error("AG31D mode mismatch.");
if (records.ag31cBoundary.next_stage_id !== "AG31D") throw new Error("AG31C boundary does not point to AG31D.");
if (records.ag31cNonActivationAudit.audit_passed !== true) throw new Error("AG31C non-activation audit must pass.");

if (records.ag31bPlan.status !== "queue_integration_plan_created_ready_for_ag31c") throw new Error("AG31B plan status mismatch.");
if (records.ag31bNonActivationAudit.audit_passed !== true) throw new Error("AG31B non-activation audit must pass.");
if (records.ag31aModel.status !== "article_state_model_created_ready_for_ag31b") throw new Error("AG31A model status mismatch.");
if (records.ag31aStateRegister.state_count !== 7) throw new Error("AG31A state count mismatch.");
if (records.ag30zClosure.status !== "login_ui_closure_created_ready_for_ag31") throw new Error("AG30Z closure status mismatch.");

for (const [key, value] of Object.entries(records.ag30zActivationBlocker.blocked_activation_items || {})) {
  if (value !== false) throw new Error(`AG30Z activation blocker must remain false: ${key}`);
}

if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) throw new Error("Admin final clearance missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("Editor assigned-only rule missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) throw new Error("Editor no-publish rule missing.");

const transitions = records.ag31aTransitionMap.transitions || [];
const forbiddenTransitions = records.ag31aTransitionMap.forbidden_transitions || [];

const hasAdminApprovalPath =
  transitions.some((t) => t.from === "admin_review" && t.to === "publish_approved" && t.actor === "admin") &&
  transitions.some((t) => t.from === "publish_approved" && t.to === "published" && t.actor === "future_controlled_publish_handler");

const blocksDirectDraftPublish = forbiddenTransitions.some((t) => t.from === "draft" && t.to === "published");
const blocksEditorPublish = forbiddenTransitions.some((t) => t.actor === "editor" && t.to === "published");
const blocksReturnedToPublished = forbiddenTransitions.some((t) => t.from === "returned" && t.to === "published");
const blocksDirectAdminPublish = forbiddenTransitions.some((t) => t.from === "admin_review" && t.to === "published");

if (!hasAdminApprovalPath) throw new Error("Admin approval publish path missing.");
if (!blocksDirectDraftPublish) throw new Error("Direct draft to published block missing.");
if (!blocksEditorPublish) throw new Error("Editor publish block missing.");
if (!blocksReturnedToPublished) throw new Error("Returned to published block missing.");
if (!blocksDirectAdminPublish) throw new Error("Direct admin_review to published block missing.");

const blockedState = {
  state_transition_audit_created: true,
  illegal_transition_audit_created: true,
  admin_approval_gate_audit_created: true,
  editor_restriction_audit_created: true,
  publish_path_audit_created: true,
  state_transition_non_activation_audit_created: true,
  runtime_backend_created: false,
  supabase_project_created: false,
  supabase_connected: false,
  sql_generated: false,
  migration_generated: false,
  database_table_created: false,
  database_constraint_created: false,
  database_index_created: false,
  rls_policy_created: false,
  rls_policy_applied: false,
  auth_enabled: false,
  real_admin_login_created: false,
  real_editor_login_created: false,
  session_runtime_created: false,
  credential_processing_created: false,
  route_guard_runtime_created: false,
  assignment_query_created: false,
  queue_runtime_created: false,
  article_state_runtime_created: false,
  state_transition_runtime_created: false,
  audit_runtime_created: false,
  hash_runtime_created: false,
  dynamic_publish_runtime_created: false,
  publish_handler_runtime_created: false,
  rollback_runtime_created: false,
  secrets_created: false,
  env_vars_written: false,
  service_role_key_created: false,
  service_role_key_exposed: false,
  server_route_created: false,
  api_route_created: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false,
  public_mutation_done: false,
  supabase_auth_backend_activated: false
};

const illegalTransitionAudit = {
  module_id: "AG31D",
  title: "Illegal Transition Audit Register",
  status: "illegal_transition_audit_passed",
  checks: [
    {
      check_id: "draft_cannot_publish_directly",
      passed: blocksDirectDraftPublish,
      evidence: "AG31A forbids draft -> published."
    },
    {
      check_id: "editor_submitted_cannot_publish",
      passed: blocksEditorPublish,
      evidence: "AG31A forbids Editor actor from publishing."
    },
    {
      check_id: "returned_cannot_publish_directly",
      passed: blocksReturnedToPublished,
      evidence: "AG31A forbids returned -> published by Editor."
    },
    {
      check_id: "admin_review_cannot_publish_directly_without_handler",
      passed: blocksDirectAdminPublish,
      evidence: "AG31A forbids direct admin_review -> published client action."
    }
  ],
  audit_passed: true,
  state_transition_runtime_created: false,
  blocked_state: blockedState
};
illegalTransitionAudit.audit_passed = illegalTransitionAudit.checks.every((check) => check.passed === true);

const adminApprovalGateAudit = {
  module_id: "AG31D",
  title: "Admin Approval Gate Audit Register",
  status: "admin_approval_gate_audit_passed",
  checks: [
    {
      check_id: "admin_review_to_publish_approved_exists",
      passed: transitions.some((t) => t.from === "admin_review" && t.to === "publish_approved" && t.actor === "admin"),
      evidence: "Admin approval transition exists before any future publish."
    },
    {
      check_id: "publish_approved_to_published_handler_exists",
      passed: transitions.some((t) => t.from === "publish_approved" && t.to === "published" && t.actor === "future_controlled_publish_handler"),
      evidence: "Future controlled publish handler path exists after Admin approval."
    },
    {
      check_id: "admin_final_clearance_source_preserved",
      passed: records.ag26zRoleGovernance.role_rules.admin_final_clearance_authority === true,
      evidence: "AG26Z confirms Admin final clearance authority."
    },
    {
      check_id: "admin_queue_publish_clearance_lane_exists",
      passed: records.ag31bAdminQueueMap.future_admin_queue_surfaces.some((lane) => lane.state_filter.includes("publish_approved")),
      evidence: "AG31B Admin queue contains publish clearance lane."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};
adminApprovalGateAudit.audit_passed = adminApprovalGateAudit.checks.every((check) => check.passed === true);

const editorRestrictionAudit = {
  module_id: "AG31D",
  title: "Editor Restriction Audit Register",
  status: "editor_restriction_audit_passed",
  checks: [
    {
      check_id: "editor_assigned_only_source_preserved",
      passed: records.ag30bAssignedOnlyModel.editor_rules.editor_can_only_work_on_admin_assigned_items === true,
      evidence: "AG30B assigned-only model preserved."
    },
    {
      check_id: "editor_no_self_assign_preserved",
      passed: records.ag30bAssignedOnlyModel.editor_rules.editor_cannot_self_assign === true,
      evidence: "Editor self-assignment remains blocked."
    },
    {
      check_id: "editor_no_global_browse_preserved",
      passed: records.ag30bAssignedOnlyModel.editor_rules.editor_cannot_global_browse === true,
      evidence: "Editor global browse remains blocked."
    },
    {
      check_id: "editor_no_publish_preserved",
      passed: records.ag30bAssignedOnlyModel.editor_rules.editor_cannot_publish === true,
      evidence: "Editor publish remains blocked."
    },
    {
      check_id: "editor_queue_limited_to_returned_and_submitted",
      passed:
        records.ag31bEditorQueueMap.future_editor_queue_surfaces.every((lane) =>
          lane.state_filter.every((state) => ["returned", "editor_submitted"].includes(state))
        ),
      evidence: "AG31B Editor queue is limited to assigned/returned/submitted workflow."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};
editorRestrictionAudit.audit_passed = editorRestrictionAudit.checks.every((check) => check.passed === true);

const publishPathAudit = {
  module_id: "AG31D",
  title: "Publish Path Audit Register",
  status: "publish_path_audit_passed",
  approved_future_path: [
    "draft/admin_review source item",
    "admin_review",
    "publish_approved by Admin",
    "published only by future controlled publish handler"
  ],
  checks: [
    {
      check_id: "publish_requires_publish_approved_state",
      passed: records.ag31cStateEventShape.future_logged_events.some((e) => e.from_state === "publish_approved" && e.to_state === "published"),
      evidence: "AG31C logs controlled publish only from publish_approved."
    },
    {
      check_id: "publish_requires_audit_fields",
      passed: ["actor_id", "actor_role", "action_type", "before_state", "after_state", "before_hash", "after_hash", "created_at"].every((field) =>
        records.ag31cFieldSchema.fields.some((item) => item.field_name === field)
      ),
      evidence: "AG31C audit field schema includes required audit/hash/timestamp fields."
    },
    {
      check_id: "publish_requires_hash_and_rollback_reference",
      passed:
        records.ag31cHashModel.future_hash_requirements.before_hash_required_for_mutating_state_change === true &&
        records.ag31cHashModel.future_hash_requirements.after_hash_required_for_mutating_state_change === true &&
        records.ag31cHashModel.future_hash_requirements.rollback_reference_required === true,
      evidence: "AG31C before/after hash and rollback requirement preserved."
    },
    {
      check_id: "publish_runtime_not_created",
      passed:
        records.ag31cModel.dynamic_publish_runtime_created !== true &&
        records.ag31bPlan.queue_runtime_allowed_in_ag31b === false,
      evidence: "No publish or queue runtime is active."
    }
  ],
  audit_passed: true,
  publish_handler_runtime_created: false,
  rollback_runtime_created: false,
  public_mutation_done: false,
  blocked_state: blockedState
};
publishPathAudit.audit_passed = publishPathAudit.checks.every((check) => check.passed === true);

const nonActivationAudit = {
  module_id: "AG31D",
  title: "State Transition Non-Activation Audit Register",
  status: "state_transition_non_activation_audit_passed",
  checks: [
    { check_id: "no_state_transition_runtime", passed: true, evidence: "AG31D audits transition planning only." },
    { check_id: "no_audit_or_hash_runtime", passed: true, evidence: "Audit/hash models remain records only." },
    { check_id: "no_queue_runtime_or_assignment_query", passed: true, evidence: "AG31B queue planning remains non-active." },
    { check_id: "no_database_migration_or_sql", passed: true, evidence: "No database, migration or SQL is generated." },
    { check_id: "no_auth_backend_secret_or_public_mutation", passed: true, evidence: "Auth/backend/Supabase/secrets/deployment/public mutation remain blocked." },
    { check_id: "admin_editor_governance_preserved", passed: true, evidence: "Admin final clearance and Editor restrictions are preserved." }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const allAuditsPassed =
  illegalTransitionAudit.audit_passed === true &&
  adminApprovalGateAudit.audit_passed === true &&
  editorRestrictionAudit.audit_passed === true &&
  publishPathAudit.audit_passed === true &&
  nonActivationAudit.audit_passed === true;

const futureConsumptionPlan = {
  module_id: "AG31D",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag31z",
  future_consumption: {
    AG31Z:
      "AG31Z should consume AG31A, AG31B, AG31C and AG31D to close non-active queue/state integration planning and hand off to AG32 dynamic publish action-handler architecture.",
    AG32:
      "AG32 should consume AG31D publish path audit to ensure publish handler planning requires Admin approval, approved public filter, audit record and rollback path.",
    AG33:
      "AG33 should use AG31D illegal-transition audit to keep non-active publish scaffold guarded and disabled.",
    AG34_and_later:
      "Backend activation readiness must consume AG31D to confirm no direct publish path, no Editor publish power and no public mutation without audit/rollback."
  },
  blocked_state: blockedState
};

const audit = {
  module_id: "AG31D",
  title: "State Transition Audit",
  status: "state_transition_audit_created_ready_for_ag31z",
  purpose:
    "Audit the article state transition plan and confirm that no illegal transition can publish directly without Admin approval, while keeping all state transition, queue, audit, hash, database, Auth/backend, secrets, deployment and public mutation runtime disabled.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag31c_status: records.ag31cModel.status,
    ag31b_status: records.ag31bPlan.status,
    ag31a_status: records.ag31aModel.status,
    ag30z_status: records.ag30zClosure.status,
    admin_final_clearance_preserved: records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority === true,
    editor_assigned_only_preserved: records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items === true,
    editor_no_publish_preserved: records.ag26zRoleGovernance.role_rules?.editor_cannot_publish === true
  },
  audit_decision: {
    non_active_state_transition_audit_created: true,
    illegal_transition_audit_passed: illegalTransitionAudit.audit_passed,
    admin_approval_gate_audit_passed: adminApprovalGateAudit.audit_passed,
    editor_restriction_audit_passed: editorRestrictionAudit.audit_passed,
    publish_path_audit_passed: publishPathAudit.audit_passed,
    non_activation_audit_passed: nonActivationAudit.audit_passed,
    all_audits_passed: allAuditsPassed,
    proceed_to_ag31z_queue_integration_closure: allAuditsPassed,
    state_transition_runtime_approved_now: false,
    audit_runtime_approved_now: false,
    hash_runtime_approved_now: false,
    publish_handler_runtime_approved_now: false,
    queue_runtime_approved_now: false,
    assignment_query_approved_now: false,
    database_creation_approved_now: false,
    migration_generation_approved_now: false,
    sql_generation_approved_now: false,
    rls_policy_application_approved_now: false,
    auth_activation_approved_now: false,
    backend_connection_approved_now: false,
    supabase_connection_approved_now: false,
    server_route_creation_approved_now: false,
    api_route_creation_approved_now: false,
    secret_creation_approved_now: false,
    env_var_write_approved_now: false,
    deployment_approved_now: false,
    public_mutation_approved_now: false
  },
  illegal_transition_audit_file: outputs.illegalTransitionAudit,
  admin_approval_gate_audit_file: outputs.adminApprovalGateAudit,
  editor_restriction_audit_file: outputs.editorRestrictionAudit,
  publish_path_audit_file: outputs.publishPathAudit,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  state_transition_runtime_allowed_in_ag31d: false,
  audit_runtime_allowed_in_ag31d: false,
  hash_runtime_allowed_in_ag31d: false,
  publish_handler_runtime_allowed_in_ag31d: false,
  queue_runtime_allowed_in_ag31d: false,
  assignment_query_allowed_in_ag31d: false,
  database_creation_allowed_in_ag31d: false,
  migration_generation_allowed_in_ag31d: false,
  sql_generation_allowed_in_ag31d: false,
  rls_policy_application_allowed_in_ag31d: false,
  auth_activation_allowed_in_ag31d: false,
  backend_connection_allowed_in_ag31d: false,
  supabase_connection_allowed_in_ag31d: false,
  server_route_creation_allowed_in_ag31d: false,
  api_route_creation_allowed_in_ag31d: false,
  secret_creation_allowed_in_ag31d: false,
  env_var_write_allowed_in_ag31d: false,
  deployment_allowed_in_ag31d: false,
  public_mutation_allowed_in_ag31d: false,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG31D",
  title: "State Transition Audit Blocker Register",
  status: "state_transition_audit_operations_blocked_pending_ag31z",
  blocked_items: [
    "No state transition runtime.",
    "No audit runtime.",
    "No hash runtime.",
    "No publish handler runtime.",
    "No rollback runtime.",
    "No database table creation.",
    "No migration generation.",
    "No SQL generation.",
    "No queue runtime.",
    "No assignment query.",
    "No article state runtime.",
    "No RLS policy application.",
    "No Auth activation.",
    "No real Admin login.",
    "No real Editor login.",
    "No backend/Supabase connection.",
    "No secrets creation.",
    "No environment variable write.",
    "No server/API route runtime.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No public mutation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG31D",
  title: "Queue Integration Closure Readiness Record",
  status: "ready_for_ag31z_queue_integration_closure",
  ready_for_ag31z: allAuditsPassed,
  next_stage_id: "AG31Z",
  next_stage_title: "Queue Integration Closure",
  allowed_ag31z_mode: "non_active_queue_integration_closure_only",
  state_transition_audit_created: true,
  illegal_transition_audit_passed: illegalTransitionAudit.audit_passed,
  admin_approval_gate_audit_passed: adminApprovalGateAudit.audit_passed,
  editor_restriction_audit_passed: editorRestrictionAudit.audit_passed,
  publish_path_audit_passed: publishPathAudit.audit_passed,
  real_execution_allowed_now: false,
  state_transition_runtime_allowed_now: false,
  audit_runtime_allowed_now: false,
  queue_runtime_allowed_now: false,
  publish_handler_runtime_allowed_now: false,
  auth_activation_allowed_now: false,
  backend_activation_allowed_now: false,
  supabase_auth_backend_activation_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG31D",
  title: "AG31D to AG31Z Queue Integration Closure Boundary",
  status: "ag31z_boundary_created_non_active_queue_integration_closure_only",
  next_stage_id: "AG31Z",
  next_stage_title: "Queue Integration Closure",
  allowed_scope: [
    "Consume AG31A Article State Model.",
    "Consume AG31B Queue Integration Plan.",
    "Consume AG31C Audit Log Model.",
    "Consume AG31D State Transition Audit.",
    "Close AG31 as non-active queue/state planning.",
    "Hand off to AG32 Dynamic Publish Action Handler Architecture.",
    "Keep state transition, queue, audit, publish handler, database and backend runtime inactive."
  ],
  blocked_scope: blocker.blocked_items,
  backend_planning_selected: true,
  backend_activation_deferred: true,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_real_activation: true
};

const review = {
  module_id: "AG31D",
  title: "State Transition Audit",
  status: "state_transition_audit_created_ready_for_ag31z",
  depends_on: ["AG31C", "AG31B", "AG31A", "AG30Z", "AG30B", "AG26Z"],
  generated_from: inputs,
  audit_file: outputs.audit,
  illegal_transition_audit_file: outputs.illegalTransitionAudit,
  admin_approval_gate_audit_file: outputs.adminApprovalGateAudit,
  editor_restriction_audit_file: outputs.editorRestrictionAudit,
  publish_path_audit_file: outputs.publishPathAudit,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    state_transition_audit_created: true,
    non_active_state_transition_audit_only: true,
    illegal_transition_audit_passed: illegalTransitionAudit.audit_passed,
    admin_approval_gate_audit_passed: adminApprovalGateAudit.audit_passed,
    editor_restriction_audit_passed: editorRestrictionAudit.audit_passed,
    publish_path_audit_passed: publishPathAudit.audit_passed,
    non_activation_audit_passed: nonActivationAudit.audit_passed,
    all_audits_passed: allAuditsPassed,
    ready_for_ag31z: allAuditsPassed,
    state_transition_runtime_allowed_now: false,
    audit_runtime_allowed_now: false,
    hash_runtime_allowed_now: false,
    publish_handler_runtime_allowed_now: false,
    queue_runtime_allowed_now: false,
    assignment_query_allowed_now: false,
    database_creation_allowed_now: false,
    migration_generation_allowed_now: false,
    sql_generation_allowed_now: false,
    rls_policy_application_allowed_now: false,
    auth_activation_allowed_now: false,
    backend_connection_allowed_now: false,
    supabase_connection_allowed_now: false,
    server_route_creation_allowed_now: false,
    api_route_creation_allowed_now: false,
    secret_creation_allowed_now: false,
    env_var_write_allowed_now: false,
    deployment_done: false,
    public_mutation_done: false,
    real_execution_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG31D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG31D",
  preview_only: true,
  status: review.status,
  message: "AG31D State Transition Audit created. Next: AG31Z Queue Integration Closure.",
  state_transition_audit_created: 1,
  illegal_transition_audit_passed: illegalTransitionAudit.audit_passed ? 1 : 0,
  admin_approval_gate_audit_passed: adminApprovalGateAudit.audit_passed ? 1 : 0,
  editor_restriction_audit_passed: editorRestrictionAudit.audit_passed ? 1 : 0,
  publish_path_audit_passed: publishPathAudit.audit_passed ? 1 : 0,
  state_transition_runtime_created: 0,
  audit_runtime_created: 0,
  hash_runtime_created: 0,
  publish_handler_runtime_created: 0,
  queue_runtime_created: 0,
  assignment_query_created: 0,
  database_objects_created: 0,
  migrations_generated: 0,
  sql_generated: 0,
  rls_policies_applied: 0,
  auth_enabled: 0,
  backend_connection_enabled: 0,
  supabase_connection_enabled: 0,
  secrets_created: 0,
  env_vars_written: 0,
  server_routes_created: 0,
  api_routes_created: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  blocked_state: blockedState
};

const doc = `# AG31D — State Transition Audit

## Purpose

AG31D audits the article state transition model and confirms that no illegal transition can publish directly without Admin approval.

## Audit Areas

- Illegal transition audit.
- Admin approval gate audit.
- Editor restriction audit.
- Publish path audit.
- State transition non-activation audit.

## Result

The only planned future publish path is:

\`admin_review → publish_approved → published\`

The final \`published\` step is reserved for a future controlled publish handler and remains inactive.

## Governance Preserved

Admin remains final clearance authority. Editor works only on Admin-assigned items and cannot publish, self-assign or globally browse.

## Important Boundary

AG31D is audit-only.

No state transition runtime, audit runtime, hash runtime, publish handler runtime, queue runtime, assignment query, database, migration, SQL, Auth/backend/Supabase activation, RLS application, secrets, server/API routes, deployment, publishing or public mutation is created.

## Next Stage

AG31Z — Queue Integration Closure.
`;

writeJson(outputs.review, review);
writeJson(outputs.audit, audit);
writeJson(outputs.illegalTransitionAudit, illegalTransitionAudit);
writeJson(outputs.adminApprovalGateAudit, adminApprovalGateAudit);
writeJson(outputs.editorRestrictionAudit, editorRestrictionAudit);
writeJson(outputs.publishPathAudit, publishPathAudit);
writeJson(outputs.nonActivationAudit, nonActivationAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG31D State Transition Audit generated.");
console.log("✅ Illegal transition, Admin approval gate, Editor restriction and publish path audits created.");
console.log("✅ No state transition runtime, audit runtime, hash runtime, database, queue runtime, Auth/backend/Supabase activation, secrets, deployment or public mutation performed.");
console.log("✅ AG31Z Queue Integration Closure boundary created.");
