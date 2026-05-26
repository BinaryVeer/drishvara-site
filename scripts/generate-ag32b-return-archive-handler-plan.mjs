import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag32aReview: "data/content-intelligence/quality-reviews/ag32a-publish-handler-plan.json",
  ag32aPlan: "data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json",
  ag32aPreconditionRegister: "data/content-intelligence/backend-architecture/ag32a-publish-handler-precondition-register.json",
  ag32aPublicFilterModel: "data/content-intelligence/backend-architecture/ag32a-publish-public-filter-model.json",
  ag32aAuditRollbackRequirement: "data/content-intelligence/backend-architecture/ag32a-publish-audit-rollback-requirement.json",
  ag32aNonActivationAudit: "data/content-intelligence/backend-architecture/ag32a-publish-handler-non-activation-audit-register.json",
  ag32aReadiness: "data/content-intelligence/quality-registry/ag32a-return-archive-handler-plan-readiness-record.json",
  ag32aBoundary: "data/content-intelligence/mutation-plans/ag32a-to-ag32b-return-archive-handler-plan-boundary.json",

  ag31zClosure: "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  ag31zActivationBlocker: "data/content-intelligence/backend-architecture/ag31z-activation-blocker-carry-forward.json",

  ag31dAudit: "data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json",
  ag31dEditorRestrictionAudit: "data/content-intelligence/backend-architecture/ag31d-editor-restriction-audit-register.json",
  ag31dAdminGateAudit: "data/content-intelligence/backend-architecture/ag31d-admin-approval-gate-audit-register.json",

  ag31cFieldSchema: "data/content-intelligence/backend-architecture/ag31c-audit-log-field-schema.json",
  ag31cStateEventShape: "data/content-intelligence/backend-architecture/ag31c-state-event-log-shape.json",

  ag31bAdminQueueMap: "data/content-intelligence/backend-architecture/ag31b-admin-review-queue-map.json",
  ag31bEditorQueueMap: "data/content-intelligence/backend-architecture/ag31b-editor-assignment-queue-map.json",

  ag31aTransitionMap: "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  ag31aPermissionMatrix: "data/content-intelligence/backend-architecture/ag31a-role-state-permission-matrix.json",

  ag30bAssignedOnlyModel: "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag32b-return-archive-handler-plan.json",
  plan: "data/content-intelligence/backend-architecture/ag32b-return-archive-handler-plan.json",
  returnHandler: "data/content-intelligence/backend-architecture/ag32b-return-to-editor-handler-plan.json",
  archiveHandler: "data/content-intelligence/backend-architecture/ag32b-archive-handler-plan.json",
  editorResubmissionModel: "data/content-intelligence/backend-architecture/ag32b-editor-resubmission-path-model.json",
  adminDecisionModel: "data/content-intelligence/backend-architecture/ag32b-admin-decision-handler-model.json",
  nonActivationAudit: "data/content-intelligence/backend-architecture/ag32b-return-archive-handler-non-activation-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag32b-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag32b-return-archive-handler-plan-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag32b-publish-guard-rules-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag32b-to-ag32c-publish-guard-rules-boundary.json",
  registry: "data/quality/ag32b-return-archive-handler-plan.json",
  preview: "data/quality/ag32b-return-archive-handler-plan-preview.json",
  doc: "docs/quality/AG32B_RETURN_ARCHIVE_HANDLER_PLAN.md"
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
  if (!exists(p)) throw new Error(`Missing AG32B input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([key, file]) => [key, readJson(file)]));

if (records.ag32aPlan.status !== "publish_handler_plan_created_ready_for_ag32b") throw new Error("AG32A plan status mismatch.");
if (records.ag32aReadiness.ready_for_ag32b !== true) throw new Error("AG32A readiness does not permit AG32B.");
if (records.ag32aReadiness.allowed_ag32b_mode !== "non_active_return_archive_handler_plan_only") throw new Error("AG32B mode mismatch.");
if (records.ag32aBoundary.next_stage_id !== "AG32B") throw new Error("AG32A boundary does not point to AG32B.");
if (records.ag32aNonActivationAudit.audit_passed !== true) throw new Error("AG32A non-activation audit must pass.");

if (records.ag31zClosure.status !== "queue_integration_closure_created_ready_for_ag32") throw new Error("AG31Z closure status mismatch.");
for (const [key, value] of Object.entries(records.ag31zActivationBlocker.blocked_activation_items || {})) {
  if (value !== false) throw new Error(`AG31Z activation blocker must remain false: ${key}`);
}

if (records.ag31dAudit.audit_decision?.all_audits_passed !== true) throw new Error("AG31D all audits must pass.");
if (records.ag31dEditorRestrictionAudit.audit_passed !== true) throw new Error("AG31D Editor restriction audit must pass.");
if (records.ag31dAdminGateAudit.audit_passed !== true) throw new Error("AG31D Admin gate audit must pass.");

if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) throw new Error("Admin final clearance missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("Editor assigned-only rule missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) throw new Error("Editor no-publish rule missing.");

const hasReturnPath =
  records.ag31aTransitionMap.transitions.some((t) => t.from === "admin_review" && t.to === "returned" && t.actor === "admin") &&
  records.ag31aTransitionMap.transitions.some((t) => t.from === "returned" && t.to === "editor_submitted" && t.actor === "editor") &&
  records.ag31aTransitionMap.transitions.some((t) => t.from === "editor_submitted" && t.to === "admin_review" && t.actor === "admin");

const hasArchivePath =
  records.ag31aTransitionMap.transitions.some((t) => t.from === "admin_review" && t.to === "archived" && t.actor === "admin");

if (!hasReturnPath) throw new Error("Return/editor resubmission path missing.");
if (!hasArchivePath) throw new Error("Admin archive path missing.");

const blockedState = {
  return_archive_handler_plan_created: true,
  return_to_editor_handler_plan_created: true,
  archive_handler_plan_created: true,
  editor_resubmission_path_model_created: true,
  admin_decision_handler_model_created: true,
  return_archive_non_activation_audit_created: true,

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
  return_handler_runtime_created: false,
  archive_handler_runtime_created: false,
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

const returnHandler = {
  module_id: "AG32B",
  title: "Return-to-Editor Handler Plan",
  status: "return_to_editor_handler_plan_created_no_runtime",
  handler_id: "admin_return_to_editor",
  future_action: "return_to_editor",
  future_input_states: ["admin_review", "editor_submitted"],
  future_output_state: "returned",
  permitted_future_actor: "admin",
  required_preconditions: [
    "Admin role/session must be valid only after later backend/Auth activation.",
    "Article must be in admin_review or editor_submitted state.",
    "Decision/correction note must be provided.",
    "Target Editor assignment must exist or be created only after later activation.",
    "Audit event must be writable.",
    "Editor must remain assigned-only after return."
  ],
  editor_rules_preserved: {
    editor_can_only_work_on_admin_assigned_items: true,
    editor_cannot_self_assign: true,
    editor_cannot_global_browse: true,
    editor_cannot_publish: true
  },
  runtime_created: false,
  assignment_query_created: false,
  server_route_created: false,
  api_route_created: false,
  database_created: false,
  public_mutation_done: false,
  blocked_state: blockedState
};

const archiveHandler = {
  module_id: "AG32B",
  title: "Archive Handler Plan",
  status: "archive_handler_plan_created_no_runtime",
  handler_id: "admin_archive_article",
  future_action: "archive",
  future_input_states: ["draft", "admin_review", "editor_submitted", "returned"],
  future_output_state: "archived",
  permitted_future_actor: "admin",
  required_preconditions: [
    "Admin role/session must be valid only after later backend/Auth activation.",
    "Archive decision note must be provided.",
    "Audit event must be writable.",
    "Archived article must be excluded from publish queue unless reopened by future governed action.",
    "No public mutation is permitted during archive planning."
  ],
  runtime_created: false,
  server_route_created: false,
  api_route_created: false,
  database_created: false,
  public_mutation_done: false,
  blocked_state: blockedState
};

const editorResubmissionModel = {
  module_id: "AG32B",
  title: "Editor Resubmission Path Model",
  status: "editor_resubmission_path_model_created_no_runtime",
  future_path: [
    "Admin returns item to Editor",
    "Article state becomes returned",
    "Editor works only on assigned returned item",
    "Editor submits back to Admin",
    "Article state becomes editor_submitted",
    "Admin reviews again"
  ],
  state_path: ["admin_review", "returned", "editor_submitted", "admin_review"],
  editor_constraints: {
    assigned_item_required: true,
    self_assignment_blocked: true,
    global_browse_blocked: true,
    publish_blocked: true,
    archive_blocked: true
  },
  runtime_created: false,
  assignment_query_created: false,
  blocked_state: blockedState
};

const adminDecisionModel = {
  module_id: "AG32B",
  title: "Admin Decision Handler Model",
  status: "admin_decision_handler_model_created_no_runtime",
  future_admin_decisions: [
    {
      decision: "return_to_editor",
      output_state: "returned",
      requires_decision_note: true,
      execute_now: false
    },
    {
      decision: "archive",
      output_state: "archived",
      requires_decision_note: true,
      execute_now: false
    },
    {
      decision: "approve_for_publish",
      output_state: "publish_approved",
      source_stage: "AG32A publish handler plan",
      execute_now: false
    }
  ],
  admin_final_clearance_preserved: true,
  runtime_created: false,
  blocked_state: blockedState
};

const nonActivationAudit = {
  module_id: "AG32B",
  title: "Return/Archive Handler Non-Activation Audit Register",
  status: "return_archive_handler_non_activation_audit_passed",
  checks: [
    { check_id: "no_return_handler_runtime", passed: true, evidence: "Return-to-editor handler is a planning record only." },
    { check_id: "no_archive_handler_runtime", passed: true, evidence: "Archive handler is a planning record only." },
    { check_id: "no_assignment_query", passed: true, evidence: "No Editor assignment query is created." },
    { check_id: "no_server_or_api_route", passed: true, evidence: "No server/API route is created." },
    { check_id: "no_database_sql_or_rls", passed: true, evidence: "No database, migration, SQL or RLS is generated/applied." },
    { check_id: "no_public_mutation_or_git_write", passed: true, evidence: "No public artifact write, GitHub write, deployment or publish action is performed." },
    { check_id: "admin_authority_preserved", passed: true, evidence: "Return/archive are Admin decisions." },
    { check_id: "editor_restrictions_preserved", passed: true, evidence: "Editor remains assigned-only and cannot publish, self-assign or globally browse." }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG32B",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag32c",
  future_consumption: {
    AG32C:
      "AG32C should consume AG32A publish handler plan and AG32B return/archive handler plan to define publish guard rules requiring Admin role, approved hash, public filter pass, audit record and rollback path.",
    AG32D:
      "AG32D should audit that all AG32 handlers are plan-only and cannot execute.",
    AG32Z:
      "AG32Z should close AG32A-AG32D as non-active dynamic handler architecture.",
    AG33:
      "AG33 should consume AG32Z closure to create non-active dynamic publish scaffold."
  },
  blocked_state: blockedState
};

const plan = {
  module_id: "AG32B",
  title: "Return/Archive Handler Plan",
  status: "return_archive_handler_plan_created_ready_for_ag32c",
  purpose:
    "Define future return-to-editor and archive handler plans for Admin decisions while preserving Editor assigned-only/no-publish governance and keeping all handler runtime, assignment query, database, Auth/backend, secrets, deployment and public mutation disabled.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag32a_status: records.ag32aPlan.status,
    ag31z_status: records.ag31zClosure.status,
    return_path_present: hasReturnPath,
    archive_path_present: hasArchivePath,
    admin_final_clearance_preserved: true,
    editor_assigned_only_preserved: true,
    editor_no_publish_preserved: true
  },
  plan_decision: {
    non_active_return_archive_handler_plan_created: true,
    return_to_editor_handler_plan_created: true,
    archive_handler_plan_created: true,
    editor_resubmission_path_model_created: true,
    admin_decision_handler_model_created: true,
    non_activation_audit_created: true,
    proceed_to_ag32c_publish_guard_rules: true,

    return_handler_runtime_approved_now: false,
    archive_handler_runtime_approved_now: false,
    assignment_query_approved_now: false,
    audit_runtime_approved_now: false,
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
  return_handler_file: outputs.returnHandler,
  archive_handler_file: outputs.archiveHandler,
  editor_resubmission_model_file: outputs.editorResubmissionModel,
  admin_decision_model_file: outputs.adminDecisionModel,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,

  return_handler_runtime_allowed_in_ag32b: false,
  archive_handler_runtime_allowed_in_ag32b: false,
  assignment_query_allowed_in_ag32b: false,
  audit_runtime_allowed_in_ag32b: false,
  database_creation_allowed_in_ag32b: false,
  migration_generation_allowed_in_ag32b: false,
  sql_generation_allowed_in_ag32b: false,
  rls_policy_application_allowed_in_ag32b: false,
  auth_activation_allowed_in_ag32b: false,
  backend_connection_allowed_in_ag32b: false,
  supabase_connection_allowed_in_ag32b: false,
  server_route_creation_allowed_in_ag32b: false,
  api_route_creation_allowed_in_ag32b: false,
  secret_creation_allowed_in_ag32b: false,
  env_var_write_allowed_in_ag32b: false,
  deployment_allowed_in_ag32b: false,
  public_mutation_allowed_in_ag32b: false,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG32B",
  title: "Return/Archive Handler Plan Blocker Register",
  status: "return_archive_handler_plan_operations_blocked_pending_ag32c",
  blocked_items: [
    "No return handler runtime.",
    "No archive handler runtime.",
    "No assignment query.",
    "No audit runtime.",
    "No database table creation.",
    "No migration generation.",
    "No SQL generation.",
    "No RLS policy application.",
    "No Auth activation.",
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
  module_id: "AG32B",
  title: "Publish Guard Rules Readiness Record",
  status: "ready_for_ag32c_publish_guard_rules",
  ready_for_ag32c: true,
  next_stage_id: "AG32C",
  next_stage_title: "Publish Guard Rules",
  allowed_ag32c_mode: "non_active_publish_guard_rules_only",
  return_handler_plan_created: true,
  archive_handler_plan_created: true,
  editor_resubmission_path_model_created: true,
  real_execution_allowed_now: false,
  return_handler_runtime_allowed_now: false,
  archive_handler_runtime_allowed_now: false,
  assignment_query_allowed_now: false,
  public_mutation_allowed_now: false,
  auth_activation_allowed_now: false,
  backend_activation_allowed_now: false,
  supabase_auth_backend_activation_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG32B",
  title: "AG32B to AG32C Publish Guard Rules Boundary",
  status: "ag32c_boundary_created_non_active_publish_guard_rules_only",
  next_stage_id: "AG32C",
  next_stage_title: "Publish Guard Rules",
  allowed_scope: [
    "Consume AG32A publish handler plan.",
    "Consume AG32B return/archive handler plan.",
    "Define publish guard rules requiring Admin role, approved state/hash, public filter pass, audit record and rollback path.",
    "Preserve Admin final authority.",
    "Preserve Editor assigned-only and no-publish governance.",
    "Keep handlers, backend, database, Auth/Supabase, secrets, deployment and public mutation inactive."
  ],
  blocked_scope: blocker.blocked_items,
  backend_planning_selected: true,
  backend_activation_deferred: true,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_real_activation: true
};

const review = {
  module_id: "AG32B",
  title: "Return/Archive Handler Plan",
  status: "return_archive_handler_plan_created_ready_for_ag32c",
  depends_on: ["AG32A", "AG31Z", "AG31D", "AG31B", "AG31A", "AG30B", "AG26Z"],
  generated_from: inputs,
  plan_file: outputs.plan,
  return_handler_file: outputs.returnHandler,
  archive_handler_file: outputs.archiveHandler,
  editor_resubmission_model_file: outputs.editorResubmissionModel,
  admin_decision_model_file: outputs.adminDecisionModel,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    return_archive_handler_plan_created: true,
    non_active_return_archive_handler_plan_only: true,
    return_to_editor_handler_plan_created: true,
    archive_handler_plan_created: true,
    editor_resubmission_path_model_created: true,
    admin_decision_handler_model_created: true,
    non_activation_audit_passed: true,
    ready_for_ag32c: true,

    return_handler_runtime_allowed_now: false,
    archive_handler_runtime_allowed_now: false,
    assignment_query_allowed_now: false,
    audit_runtime_allowed_now: false,
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
  module_id: "AG32B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG32B",
  preview_only: true,
  status: review.status,
  message: "AG32B Return/Archive Handler Plan created. Next: AG32C Publish Guard Rules.",
  return_archive_handler_plan_created: 1,
  return_to_editor_handler_plan_created: 1,
  archive_handler_plan_created: 1,
  editor_resubmission_path_model_created: 1,
  admin_decision_handler_model_created: 1,
  return_handler_runtime_created: 0,
  archive_handler_runtime_created: 0,
  assignment_query_created: 0,
  audit_runtime_created: 0,
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

const doc = `# AG32B — Return/Archive Handler Plan

## Purpose

AG32B defines non-active plans for return-to-editor and archive handlers.

## Handler Plans Created

- Return-to-editor handler plan.
- Archive handler plan.
- Editor resubmission path model.
- Admin decision handler model.
- Return/archive handler non-activation audit register.
- Future consumption plan for AG32C.

## Governance Preserved

Admin remains final decision authority. Editor works only on Admin-assigned returned items and cannot publish, self-assign, globally browse or archive.

## Important Boundary

AG32B is planning-only.

No return handler runtime, archive handler runtime, assignment query, audit runtime, database, migration, SQL, RLS policy, Auth/backend/Supabase activation, secrets, server/API route, deployment, publishing or public mutation is created.

## Next Stage

AG32C — Publish Guard Rules.
`;

writeJson(outputs.review, review);
writeJson(outputs.plan, plan);
writeJson(outputs.returnHandler, returnHandler);
writeJson(outputs.archiveHandler, archiveHandler);
writeJson(outputs.editorResubmissionModel, editorResubmissionModel);
writeJson(outputs.adminDecisionModel, adminDecisionModel);
writeJson(outputs.nonActivationAudit, nonActivationAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG32B Return/Archive Handler Plan generated.");
console.log("✅ Return handler, archive handler, editor resubmission and admin decision models created.");
console.log("✅ No return/archive runtime, assignment query, database, Auth/backend/Supabase activation, secrets, deployment or public mutation performed.");
console.log("✅ AG32C Publish Guard Rules boundary created.");
