import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag31zClosure: "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  ag31zHandoff: "data/content-intelligence/backend-architecture/ag31z-ag32-action-handler-architecture-handoff-plan.json",
  ag31zActivationBlocker: "data/content-intelligence/backend-architecture/ag31z-activation-blocker-carry-forward.json",
  ag31zReadiness: "data/content-intelligence/quality-registry/ag31z-ag32-action-handler-readiness-record.json",
  ag31zBoundary: "data/content-intelligence/mutation-plans/ag31z-to-ag32-action-handler-architecture-boundary.json",

  ag31dAudit: "data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json",
  ag31dIllegalAudit: "data/content-intelligence/backend-architecture/ag31d-illegal-transition-audit-register.json",
  ag31dAdminGateAudit: "data/content-intelligence/backend-architecture/ag31d-admin-approval-gate-audit-register.json",
  ag31dPublishPathAudit: "data/content-intelligence/backend-architecture/ag31d-publish-path-audit-register.json",

  ag31cModel: "data/content-intelligence/backend-architecture/ag31c-audit-log-model.json",
  ag31cFieldSchema: "data/content-intelligence/backend-architecture/ag31c-audit-log-field-schema.json",
  ag31cStateEventShape: "data/content-intelligence/backend-architecture/ag31c-state-event-log-shape.json",
  ag31cHashModel: "data/content-intelligence/backend-architecture/ag31c-before-after-hash-model.json",

  ag31aTransitionMap: "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag32a-publish-handler-plan.json",
  plan: "data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json",
  preconditionRegister: "data/content-intelligence/backend-architecture/ag32a-publish-handler-precondition-register.json",
  publicFilterModel: "data/content-intelligence/backend-architecture/ag32a-publish-public-filter-model.json",
  auditRollbackRequirement: "data/content-intelligence/backend-architecture/ag32a-publish-audit-rollback-requirement.json",
  nonActivationAudit: "data/content-intelligence/backend-architecture/ag32a-publish-handler-non-activation-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag32a-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag32a-publish-handler-plan-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag32a-return-archive-handler-plan-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag32a-to-ag32b-return-archive-handler-plan-boundary.json",
  registry: "data/quality/ag32a-publish-handler-plan.json",
  preview: "data/quality/ag32a-publish-handler-plan-preview.json",
  doc: "docs/quality/AG32A_PUBLISH_HANDLER_PLAN.md"
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
  if (!exists(p)) throw new Error(`Missing AG32A input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag31zClosure.status !== "queue_integration_closure_created_ready_for_ag32") throw new Error("AG31Z closure status mismatch.");
if (records.ag31zReadiness.ready_for_ag32 !== true) throw new Error("AG31Z readiness does not permit AG32A.");
if (records.ag31zReadiness.allowed_ag32_mode !== "non_active_action_handler_architecture_only") throw new Error("AG32 mode mismatch.");
if (records.ag31zBoundary.next_stage_id !== "AG32") throw new Error("AG31Z boundary must point to AG32 family.");
if (records.ag31zHandoff.ag32_ready !== true) throw new Error("AG32 handoff readiness missing.");
if (records.ag31zHandoff.ag32_activation_allowed !== false) throw new Error("AG32 activation must remain false.");

for (const [key, value] of Object.entries(records.ag31zActivationBlocker.blocked_activation_items || {})) {
  if (value !== false) throw new Error(`AG31Z activation blocker must remain false: ${key}`);
}

if (records.ag31dAudit.audit_decision?.all_audits_passed !== true) throw new Error("AG31D all audits must pass.");
if (records.ag31dIllegalAudit.audit_passed !== true) throw new Error("AG31D illegal transition audit must pass.");
if (records.ag31dAdminGateAudit.audit_passed !== true) throw new Error("AG31D Admin gate audit must pass.");
if (records.ag31dPublishPathAudit.audit_passed !== true) throw new Error("AG31D publish path audit must pass.");

if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) throw new Error("Admin final clearance missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) throw new Error("Editor no-publish rule missing.");

const hasApprovedPublishPath =
  records.ag31aTransitionMap.transitions.some((t) => t.from === "admin_review" && t.to === "publish_approved" && t.actor === "admin") &&
  records.ag31aTransitionMap.transitions.some((t) => t.from === "publish_approved" && t.to === "published" && t.actor === "future_controlled_publish_handler");

const blocksDirectPublish =
  records.ag31aTransitionMap.forbidden_transitions.some((t) => t.from === "draft" && t.to === "published") &&
  records.ag31aTransitionMap.forbidden_transitions.some((t) => t.from === "admin_review" && t.to === "published") &&
  records.ag31aTransitionMap.forbidden_transitions.some((t) => t.actor === "editor" && t.to === "published");

if (!hasApprovedPublishPath) throw new Error("Approved publish path missing.");
if (!blocksDirectPublish) throw new Error("Direct/Editor publish block missing.");

const blockedState = {
  publish_handler_plan_created: true,
  publish_precondition_register_created: true,
  publish_public_filter_model_created: true,
  publish_audit_rollback_requirement_created: true,
  publish_handler_non_activation_audit_created: true,

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

const preconditionRegister = {
  module_id: "AG32A",
  title: "Publish Handler Precondition Register",
  status: "publish_handler_precondition_register_created_no_runtime",
  handler_id: "publish_approved_to_published",
  future_action: "publish",
  required_input_state: "publish_approved",
  required_output_state: "published",
  required_actor: "future_controlled_publish_handler",
  required_preconditions: [
    "Article state must be publish_approved.",
    "Admin final clearance must exist.",
    "Actor/session must be valid only after future backend/Auth activation.",
    "Public filter must pass.",
    "Audit event must be writable.",
    "Before hash and after hash must be available.",
    "Rollback reference must be recordable."
  ],
  forbidden_paths: [
    "draft_to_published",
    "admin_review_to_published_without_publish_approved",
    "returned_to_published",
    "editor_submitted_to_published",
    "editor_publish",
    "public_mutation_without_audit",
    "public_mutation_without_rollback"
  ],
  execute_now: false,
  runtime_created: false,
  blocked_state: blockedState
};

const publicFilterModel = {
  module_id: "AG32A",
  title: "Publish Public Filter Model",
  status: "publish_public_filter_model_created_no_runtime",
  future_public_filter_checks: [
    {
      check_id: "state_is_publish_approved",
      required: true,
      execute_now: false
    },
    {
      check_id: "admin_final_clearance_exists",
      required: true,
      execute_now: false
    },
    {
      check_id: "content_public_safe",
      required: true,
      execute_now: false
    },
    {
      check_id: "references_and_image_credits_ready",
      required: true,
      execute_now: false
    },
    {
      check_id: "audit_and_rollback_ready",
      required: true,
      execute_now: false
    }
  ],
  public_filter_runtime_created: false,
  public_mutation_done: false,
  blocked_state: blockedState
};

const auditRollbackRequirement = {
  module_id: "AG32A",
  title: "Publish Audit and Rollback Requirement",
  status: "publish_audit_rollback_requirement_created_no_runtime",
  required_audit_fields: [
    "audit_event_id",
    "article_id",
    "actor_id",
    "actor_role",
    "action_type",
    "before_state",
    "after_state",
    "before_hash",
    "after_hash",
    "decision_note",
    "created_at"
  ],
  hash_requirements: {
    before_hash_required: true,
    after_hash_required: true,
    rollback_reference_required: true
  },
  rollback_requirements: {
    previous_public_artifact_reference_required: true,
    audit_event_reference_required: true,
    rollback_runtime_created_now: false
  },
  audit_runtime_created: false,
  hash_runtime_created: false,
  rollback_runtime_created: false,
  blocked_state: blockedState
};

const nonActivationAudit = {
  module_id: "AG32A",
  title: "Publish Handler Non-Activation Audit Register",
  status: "publish_handler_non_activation_audit_passed",
  checks: [
    {
      check_id: "no_publish_handler_runtime",
      passed: true,
      evidence: "AG32A creates publish handler plan records only."
    },
    {
      check_id: "no_server_or_api_route",
      passed: true,
      evidence: "No server/API route is created."
    },
    {
      check_id: "no_database_sql_or_rls",
      passed: true,
      evidence: "No database, migration, SQL or RLS policy is generated/applied."
    },
    {
      check_id: "no_public_mutation_or_git_write",
      passed: true,
      evidence: "No public artifact write, GitHub write, deployment or publish action is performed."
    },
    {
      check_id: "admin_approval_gate_preserved",
      passed: true,
      evidence: "Publish requires publish_approved state after Admin approval."
    },
    {
      check_id: "editor_publish_block_preserved",
      passed: true,
      evidence: "Editor cannot publish."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG32A",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag32b",
  future_consumption: {
    AG32B:
      "AG32B should consume AG32A publish handler plan and define return-to-editor and archive handler plans without runtime activation.",
    AG32C:
      "AG32C should consume AG32A preconditions and public filter model to define publish guard rules.",
    AG32D:
      "AG32D should audit that handlers are plan-only and cannot execute.",
    AG32Z:
      "AG32Z should close AG32A-AG32D as non-active dynamic handler architecture."
  },
  blocked_state: blockedState
};

const plan = {
  module_id: "AG32A",
  title: "Publish Handler Plan",
  status: "publish_handler_plan_created_ready_for_ag32b",
  purpose:
    "Define the future Admin-approved publish handler path from publish_approved to published, including public filter, audit and rollback requirements, without creating runtime handler, server/API route, database, Auth/backend connection, secrets, deployment or public mutation.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag31z_status: records.ag31zClosure.status,
    ag31d_all_audits_passed: records.ag31dAudit.audit_decision?.all_audits_passed === true,
    approved_publish_path_present: hasApprovedPublishPath,
    direct_publish_blocked: blocksDirectPublish,
    admin_final_clearance_preserved: records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority === true,
    editor_no_publish_preserved: records.ag26zRoleGovernance.role_rules?.editor_cannot_publish === true
  },
  plan_decision: {
    non_active_publish_handler_plan_created: true,
    publish_precondition_register_created: true,
    publish_public_filter_model_created: true,
    publish_audit_rollback_requirement_created: true,
    non_activation_audit_created: true,
    proceed_to_ag32b_return_archive_handler_plan: true,

    publish_handler_runtime_approved_now: false,
    public_filter_runtime_approved_now: false,
    audit_runtime_approved_now: false,
    hash_runtime_approved_now: false,
    rollback_runtime_approved_now: false,
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
  precondition_register_file: outputs.preconditionRegister,
  public_filter_model_file: outputs.publicFilterModel,
  audit_rollback_requirement_file: outputs.auditRollbackRequirement,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,

  publish_handler_runtime_allowed_in_ag32a: false,
  public_filter_runtime_allowed_in_ag32a: false,
  audit_runtime_allowed_in_ag32a: false,
  hash_runtime_allowed_in_ag32a: false,
  rollback_runtime_allowed_in_ag32a: false,
  database_creation_allowed_in_ag32a: false,
  migration_generation_allowed_in_ag32a: false,
  sql_generation_allowed_in_ag32a: false,
  rls_policy_application_allowed_in_ag32a: false,
  auth_activation_allowed_in_ag32a: false,
  backend_connection_allowed_in_ag32a: false,
  supabase_connection_allowed_in_ag32a: false,
  server_route_creation_allowed_in_ag32a: false,
  api_route_creation_allowed_in_ag32a: false,
  secret_creation_allowed_in_ag32a: false,
  env_var_write_allowed_in_ag32a: false,
  deployment_allowed_in_ag32a: false,
  public_mutation_allowed_in_ag32a: false,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG32A",
  title: "Publish Handler Plan Blocker Register",
  status: "publish_handler_plan_operations_blocked_pending_ag32b",
  blocked_items: [
    "No publish handler runtime.",
    "No public filter runtime.",
    "No audit runtime.",
    "No hash runtime.",
    "No rollback runtime.",
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
  module_id: "AG32A",
  title: "Return/Archive Handler Plan Readiness Record",
  status: "ready_for_ag32b_return_archive_handler_plan",
  ready_for_ag32b: true,
  next_stage_id: "AG32B",
  next_stage_title: "Return/Archive Handler Plan",
  allowed_ag32b_mode: "non_active_return_archive_handler_plan_only",
  publish_handler_plan_created: true,
  publish_preconditions_created: true,
  audit_rollback_requirements_created: true,
  real_execution_allowed_now: false,
  publish_handler_runtime_allowed_now: false,
  public_mutation_allowed_now: false,
  auth_activation_allowed_now: false,
  backend_activation_allowed_now: false,
  supabase_auth_backend_activation_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG32A",
  title: "AG32A to AG32B Return/Archive Handler Plan Boundary",
  status: "ag32b_boundary_created_non_active_return_archive_handler_plan_only",
  next_stage_id: "AG32B",
  next_stage_title: "Return/Archive Handler Plan",
  allowed_scope: [
    "Consume AG32A publish handler plan.",
    "Define return-to-editor handler plan.",
    "Define archive handler plan.",
    "Preserve Admin final authority.",
    "Preserve Editor assigned-only and no-publish governance.",
    "Keep all handlers, backend, database, Auth/Supabase, secrets, deployment and public mutation inactive."
  ],
  blocked_scope: blocker.blocked_items,
  backend_planning_selected: true,
  backend_activation_deferred: true,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_real_activation: true
};

const review = {
  module_id: "AG32A",
  title: "Publish Handler Plan",
  status: "publish_handler_plan_created_ready_for_ag32b",
  depends_on: ["AG31Z", "AG31D", "AG31C", "AG31A", "AG26Z"],
  generated_from: inputs,
  plan_file: outputs.plan,
  precondition_register_file: outputs.preconditionRegister,
  public_filter_model_file: outputs.publicFilterModel,
  audit_rollback_requirement_file: outputs.auditRollbackRequirement,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    publish_handler_plan_created: true,
    non_active_publish_handler_plan_only: true,
    publish_precondition_register_created: true,
    publish_public_filter_model_created: true,
    publish_audit_rollback_requirement_created: true,
    non_activation_audit_passed: true,
    ready_for_ag32b: true,

    publish_handler_runtime_allowed_now: false,
    public_filter_runtime_allowed_now: false,
    audit_runtime_allowed_now: false,
    hash_runtime_allowed_now: false,
    rollback_runtime_allowed_now: false,
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
  module_id: "AG32A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG32A",
  preview_only: true,
  status: review.status,
  message: "AG32A Publish Handler Plan created. Next: AG32B Return/Archive Handler Plan.",
  publish_handler_plan_created: 1,
  publish_precondition_register_created: 1,
  publish_public_filter_model_created: 1,
  publish_audit_rollback_requirement_created: 1,
  publish_handler_runtime_created: 0,
  public_filter_runtime_created: 0,
  audit_runtime_created: 0,
  hash_runtime_created: 0,
  rollback_runtime_created: 0,
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

const doc = `# AG32A — Publish Handler Plan

## Purpose

AG32A defines the future publish handler plan for moving an article from \`publish_approved\` to \`published\`.

## Critical Publish Rule

No direct publish path is allowed.

The future publish path remains:

\`admin_review → publish_approved → published\`

The final \`published\` step is reserved for a future controlled publish handler and remains inactive.

## Created Planning Records

- Publish handler precondition register.
- Publish public filter model.
- Publish audit and rollback requirement.
- Publish handler non-activation audit register.
- Future consumption plan for AG32B.

## Governance Preserved

Admin remains final clearance authority. Editor cannot publish.

## Important Boundary

AG32A is planning-only.

No publish handler runtime, public filter runtime, audit runtime, hash runtime, rollback runtime, database, migration, SQL, RLS policy, Auth/backend/Supabase activation, secrets, server/API route, deployment, publishing or public mutation is created.

## Next Stage

AG32B — Return/Archive Handler Plan.
`;

writeJson(outputs.review, review);
writeJson(outputs.plan, plan);
writeJson(outputs.preconditionRegister, preconditionRegister);
writeJson(outputs.publicFilterModel, publicFilterModel);
writeJson(outputs.auditRollbackRequirement, auditRollbackRequirement);
writeJson(outputs.nonActivationAudit, nonActivationAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG32A Publish Handler Plan generated.");
console.log("✅ Publish preconditions, public filter model, audit/rollback requirement created.");
console.log("✅ No publish runtime, database, Auth/backend/Supabase activation, secrets, deployment or public mutation performed.");
console.log("✅ AG32B Return/Archive Handler Plan boundary created.");
