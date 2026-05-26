import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag30zReview: "data/content-intelligence/quality-reviews/ag30z-login-ui-closure.json",
  ag30zClosure: "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  ag30zSourceChain: "data/content-intelligence/backend-architecture/ag30z-ag30-source-chain-register.json",
  ag30zClosureRegister: "data/content-intelligence/backend-architecture/ag30z-non-active-login-route-scaffold-closure-register.json",
  ag30zActivationBlocker: "data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json",
  ag30zHandoff: "data/content-intelligence/backend-architecture/ag30z-ag31-queue-state-handoff-plan.json",
  ag30zReadiness: "data/content-intelligence/quality-registry/ag30z-ag31-queue-state-readiness-record.json",
  ag30zBoundary: "data/content-intelligence/mutation-plans/ag30z-to-ag31-queue-state-integration-boundary.json",

  ag30bAssignedOnlyModel: "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  ag30cProtectedRouteMap: "data/content-intelligence/backend-architecture/ag30c-protected-route-map.json",
  ag30dAudit: "data/content-intelligence/backend-architecture/ag30d-login-ui-audit.json",

  ag29aStateFieldModel: "data/content-intelligence/backend-architecture/ag29a-state-field-model.json",
  ag29bRoleScope: "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  ag29zClosure: "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",

  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag31a-article-state-model.json",
  model: "data/content-intelligence/backend-architecture/ag31a-article-state-model.json",
  stateRegister: "data/content-intelligence/backend-architecture/ag31a-article-state-register.json",
  transitionMap: "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  roleStatePermissionMatrix: "data/content-intelligence/backend-architecture/ag31a-role-state-permission-matrix.json",
  nonActivationAudit: "data/content-intelligence/backend-architecture/ag31a-non-activation-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag31a-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag31a-article-state-model-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag31a-queue-integration-plan-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag31a-to-ag31b-queue-integration-plan-boundary.json",
  registry: "data/quality/ag31a-article-state-model.json",
  preview: "data/quality/ag31a-article-state-model-preview.json",
  doc: "docs/quality/AG31A_ARTICLE_STATE_MODEL.md"
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
  if (!exists(p)) throw new Error(`Missing AG31A input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag30zClosure.status !== "login_ui_closure_created_ready_for_ag31") throw new Error("AG30Z closure status mismatch.");
if (records.ag30zReadiness.ready_for_ag31 !== true) throw new Error("AG30Z readiness does not permit AG31A.");
if (records.ag30zReadiness.allowed_ag31_mode !== "non_active_queue_state_planning_only") throw new Error("AG31 mode mismatch.");
if (records.ag30zBoundary.next_stage_id !== "AG31") throw new Error("AG30Z boundary must point to AG31 family.");
if (records.ag30zHandoff.ag31_ready !== true) throw new Error("AG31 handoff readiness missing.");
if (records.ag30zHandoff.ag31_activation_allowed !== false) throw new Error("AG31 activation must remain false.");
if (records.ag30dAudit.audit_decision?.all_audits_passed !== true) throw new Error("AG30D audit must pass.");
if (records.ag29zClosure.status !== "schema_rls_closure_created_ready_for_ag30") throw new Error("AG29Z closure status mismatch.");

for (const [key, value] of Object.entries(records.ag30zActivationBlocker.blocked_activation_items || {})) {
  if (value !== false) throw new Error(`AG30Z activation blocker must remain false: ${key}`);
}

if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) throw new Error("Admin final clearance missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("Editor assigned-only rule missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) throw new Error("Editor no-publish rule missing.");

const blockedState = {
  article_state_model_created: true,
  article_state_register_created: true,
  article_state_transition_map_created: true,
  role_state_permission_matrix_created: true,
  non_activation_audit_created: true,
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
  dynamic_publish_runtime_created: false,
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

const articleStates = [
  {
    state: "draft",
    meaning: "Article exists as a draft or generated candidate, not yet sent to Editor or Admin review.",
    public_visible: false,
    terminal_state: false
  },
  {
    state: "editor_submitted",
    meaning: "Editor has submitted assigned work back to Admin for review.",
    public_visible: false,
    terminal_state: false
  },
  {
    state: "admin_review",
    meaning: "Article is under Admin review/final clearance.",
    public_visible: false,
    terminal_state: false
  },
  {
    state: "returned",
    meaning: "Admin has returned article to Editor for correction.",
    public_visible: false,
    terminal_state: false
  },
  {
    state: "archived",
    meaning: "Article is archived and not eligible for publish unless reopened by Admin later.",
    public_visible: false,
    terminal_state: true
  },
  {
    state: "publish_approved",
    meaning: "Admin has approved article for future controlled publish action.",
    public_visible: false,
    terminal_state: false
  },
  {
    state: "published",
    meaning: "Article is public-visible after future controlled publish action.",
    public_visible: true,
    terminal_state: true
  }
];

const transitionMap = {
  module_id: "AG31A",
  title: "Article State Transition Map",
  status: "article_state_transition_map_created_no_runtime",
  transitions: [
    {
      from: "draft",
      to: "admin_review",
      actor: "admin",
      allowed_future: true,
      execute_now: false,
      reason: "Admin can place generated/created article into review."
    },
    {
      from: "draft",
      to: "returned",
      actor: "admin",
      allowed_future: true,
      execute_now: false,
      reason: "Admin may return draft to Editor after assignment in future queue flow."
    },
    {
      from: "returned",
      to: "editor_submitted",
      actor: "editor",
      allowed_future: true,
      execute_now: false,
      reason: "Editor submits assigned correction back to Admin."
    },
    {
      from: "editor_submitted",
      to: "admin_review",
      actor: "admin",
      allowed_future: true,
      execute_now: false,
      reason: "Admin reviews Editor-submitted work."
    },
    {
      from: "admin_review",
      to: "returned",
      actor: "admin",
      allowed_future: true,
      execute_now: false,
      reason: "Admin can return work for correction."
    },
    {
      from: "admin_review",
      to: "archived",
      actor: "admin",
      allowed_future: true,
      execute_now: false,
      reason: "Admin can archive unsuitable item."
    },
    {
      from: "admin_review",
      to: "publish_approved",
      actor: "admin",
      allowed_future: true,
      execute_now: false,
      reason: "Admin final clearance before publish."
    },
    {
      from: "publish_approved",
      to: "published",
      actor: "future_controlled_publish_handler",
      allowed_future: true,
      execute_now: false,
      reason: "Future guarded publish handler only after later approval."
    }
  ],
  forbidden_transitions: [
    {
      from: "draft",
      to: "published",
      actor: "any",
      reason: "No direct publish from draft."
    },
    {
      from: "editor_submitted",
      to: "published",
      actor: "editor",
      reason: "Editor cannot publish."
    },
    {
      from: "returned",
      to: "published",
      actor: "editor",
      reason: "Editor cannot publish and Admin review is required."
    },
    {
      from: "admin_review",
      to: "published",
      actor: "admin_direct_client_action",
      reason: "Future publish must pass approved handler and audit/rollback controls."
    }
  ],
  runtime_created: false,
  blocked_state: blockedState
};

const stateRegister = {
  module_id: "AG31A",
  title: "Article State Register",
  status: "article_state_register_created_no_runtime",
  state_count: articleStates.length,
  article_states: articleStates,
  source_alignment: {
    ag29a_state_field_model_consumed: true,
    required_roadmap_states_present: ["draft", "editor_submitted", "admin_review", "returned", "archived", "publish_approved", "published"].every((s) =>
      articleStates.some((item) => item.state === s)
    )
  },
  database_created: false,
  runtime_created: false,
  blocked_state: blockedState
};

const roleStatePermissionMatrix = {
  module_id: "AG31A",
  title: "Role-State Permission Matrix",
  status: "role_state_permission_matrix_created_no_runtime",
  permissions: [
    {
      role: "admin",
      allowed_future_state_actions: [
        "move_draft_to_admin_review",
        "return_to_editor",
        "archive",
        "approve_for_publish"
      ],
      forbidden_now: true,
      execute_now: false
    },
    {
      role: "editor",
      allowed_future_state_actions: [
        "view_admin_assigned_returned_item",
        "submit_assigned_item_back_to_admin"
      ],
      forbidden_future_state_actions: [
        "self_assign",
        "global_browse",
        "approve_for_publish",
        "publish",
        "archive"
      ],
      forbidden_now: true,
      execute_now: false
    },
    {
      role: "public_reader",
      allowed_future_state_actions: [
        "read_published_public_article"
      ],
      forbidden_future_state_actions: [
        "read_draft",
        "read_admin_review",
        "read_returned",
        "read_editor_submitted",
        "read_publish_approved"
      ],
      forbidden_now: true,
      execute_now: false
    },
    {
      role: "future_controlled_publish_handler",
      allowed_future_state_actions: [
        "move_publish_approved_to_published_after_admin_clearance"
      ],
      forbidden_now: true,
      execute_now: false
    }
  ],
  admin_final_clearance_required: true,
  editor_assigned_only_required: true,
  editor_publish_blocked: true,
  runtime_created: false,
  blocked_state: blockedState
};

const nonActivationAudit = {
  module_id: "AG31A",
  title: "Article State Model Non-Activation Audit Register",
  status: "article_state_model_non_activation_audit_passed",
  checks: [
    {
      check_id: "no_database_or_migration",
      passed: true,
      evidence: "AG31A creates JSON/doc planning only; no schema/table/migration is generated."
    },
    {
      check_id: "no_queue_runtime",
      passed: true,
      evidence: "No queue runtime or assignment query is created."
    },
    {
      check_id: "no_article_state_runtime",
      passed: true,
      evidence: "Article states are modelled only and cannot execute."
    },
    {
      check_id: "no_publish_runtime",
      passed: true,
      evidence: "publish_approved to published is a future controlled handler only."
    },
    {
      check_id: "admin_editor_governance_preserved",
      passed: true,
      evidence: "Admin final clearance and Editor assigned-only/no-publish rules are preserved."
    },
    {
      check_id: "no_auth_backend_or_secret_activation",
      passed: true,
      evidence: "Auth/backend/Supabase/secrets remain blocked."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG31A",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag31b",
  future_consumption: {
    AG31B:
      "AG31B should consume AG31A article state model, transition map, role-state permission matrix, AG30C route map and AG30B assigned-only model to map static Admin Review Queue records to future database-backed queue planning.",
    AG31C:
      "AG31C should consume AG31A state transitions to define who/when/before-after-hash audit log shape without runtime logging.",
    AG31D:
      "AG31D should audit that no illegal transition can publish directly without Admin approval.",
    AG31Z:
      "AG31Z should close AG31A-AG31D as non-active queue/state planning and hand off to AG32 action-handler architecture planning."
  },
  blocked_state: blockedState
};

const model = {
  module_id: "AG31A",
  title: "Article State Model",
  status: "article_state_model_created_ready_for_ag31b",
  purpose:
    "Define the non-active article state model for future Admin/Editor queue planning: draft, editor_submitted, admin_review, returned, archived, publish_approved and published, without database creation, queue runtime, state runtime, Auth/backend activation, secrets, deployment or public mutation.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag30z_status: records.ag30zClosure.status,
    ag30z_mode: records.ag30zReadiness.allowed_ag31_mode,
    ag30d_audits_passed: records.ag30dAudit.audit_decision?.all_audits_passed === true,
    ag29a_state_model_consumed: true,
    admin_final_clearance_preserved: records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority === true,
    editor_assigned_only_preserved: records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items === true,
    editor_no_publish_preserved: records.ag26zRoleGovernance.role_rules?.editor_cannot_publish === true
  },
  model_decision: {
    non_active_article_state_model_created: true,
    article_state_register_created: true,
    transition_map_created: true,
    role_state_permission_matrix_created: true,
    non_activation_audit_created: true,
    proceed_to_ag31b_queue_integration_plan: true,
    queue_runtime_approved_now: false,
    article_state_runtime_approved_now: false,
    state_transition_runtime_approved_now: false,
    assignment_query_approved_now: false,
    database_creation_approved_now: false,
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
  article_state_register_file: outputs.stateRegister,
  transition_map_file: outputs.transitionMap,
  role_state_permission_matrix_file: outputs.roleStatePermissionMatrix,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  queue_runtime_allowed_in_ag31a: false,
  article_state_runtime_allowed_in_ag31a: false,
  state_transition_runtime_allowed_in_ag31a: false,
  assignment_query_allowed_in_ag31a: false,
  database_creation_allowed_in_ag31a: false,
  rls_policy_application_allowed_in_ag31a: false,
  auth_activation_allowed_in_ag31a: false,
  backend_connection_allowed_in_ag31a: false,
  supabase_connection_allowed_in_ag31a: false,
  server_route_creation_allowed_in_ag31a: false,
  api_route_creation_allowed_in_ag31a: false,
  secret_creation_allowed_in_ag31a: false,
  env_var_write_allowed_in_ag31a: false,
  deployment_allowed_in_ag31a: false,
  public_mutation_allowed_in_ag31a: false,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG31A",
  title: "Article State Model Blocker Register",
  status: "article_state_model_operations_blocked_pending_ag31b",
  blocked_items: [
    "No database table creation.",
    "No migration generation.",
    "No queue runtime.",
    "No assignment query.",
    "No article state runtime.",
    "No state transition runtime.",
    "No publish runtime.",
    "No Auth activation.",
    "No real Admin login.",
    "No real Editor login.",
    "No backend/Supabase connection.",
    "No RLS policy application.",
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
  module_id: "AG31A",
  title: "Queue Integration Plan Readiness Record",
  status: "ready_for_ag31b_queue_integration_plan",
  ready_for_ag31b: true,
  next_stage_id: "AG31B",
  next_stage_title: "Queue Integration Plan",
  allowed_ag31b_mode: "non_active_queue_integration_plan_only",
  article_state_model_created: true,
  transition_map_created: true,
  role_state_permission_matrix_created: true,
  real_execution_allowed_now: false,
  queue_runtime_allowed_now: false,
  article_state_runtime_allowed_now: false,
  auth_activation_allowed_now: false,
  backend_activation_allowed_now: false,
  supabase_auth_backend_activation_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG31A",
  title: "AG31A to AG31B Queue Integration Plan Boundary",
  status: "ag31b_boundary_created_non_active_queue_integration_plan_only",
  next_stage_id: "AG31B",
  next_stage_title: "Queue Integration Plan",
  allowed_scope: [
    "Consume AG31A article state register.",
    "Consume AG31A transition map.",
    "Consume AG31A role-state permission matrix.",
    "Map static Admin Review Queue records to future database-backed queue planning.",
    "Preserve Admin final clearance.",
    "Preserve Editor assigned-only and no-publish governance.",
    "Keep queue/database/backend runtime inactive."
  ],
  blocked_scope: blocker.blocked_items,
  backend_planning_selected: true,
  backend_activation_deferred: true,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_real_activation: true
};

const review = {
  module_id: "AG31A",
  title: "Article State Model",
  status: "article_state_model_created_ready_for_ag31b",
  depends_on: ["AG30Z", "AG30D", "AG30C", "AG30B", "AG29A", "AG29B", "AG29Z", "AG26Z"],
  generated_from: inputs,
  model_file: outputs.model,
  article_state_register_file: outputs.stateRegister,
  transition_map_file: outputs.transitionMap,
  role_state_permission_matrix_file: outputs.roleStatePermissionMatrix,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    article_state_model_created: true,
    non_active_state_model_only: true,
    article_state_register_created: true,
    transition_map_created: true,
    role_state_permission_matrix_created: true,
    non_activation_audit_passed: true,
    state_count: articleStates.length,
    ready_for_ag31b: true,
    queue_runtime_allowed_now: false,
    article_state_runtime_allowed_now: false,
    state_transition_runtime_allowed_now: false,
    assignment_query_allowed_now: false,
    database_creation_allowed_now: false,
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
  module_id: "AG31A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG31A",
  preview_only: true,
  status: review.status,
  message: "AG31A Article State Model created. Next: AG31B Queue Integration Plan.",
  article_state_model_created: 1,
  article_state_register_created: 1,
  transition_map_created: 1,
  role_state_permission_matrix_created: 1,
  state_count: articleStates.length,
  queue_runtime_created: 0,
  article_state_runtime_created: 0,
  state_transition_runtime_created: 0,
  assignment_query_created: 0,
  database_objects_created: 0,
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

const doc = `# AG31A — Article State Model

## Purpose

AG31A defines the non-active article state model for future Admin/Editor queue planning.

## Article States

- draft
- editor_submitted
- admin_review
- returned
- archived
- publish_approved
- published

## Created Planning Records

- Article state register.
- Article state transition map.
- Role-state permission matrix.
- Non-activation audit register.
- Future consumption plan for AG31B.

## Governance Preserved

Admin remains final clearance authority. Editor works only on Admin-assigned items and cannot publish.

## Important Boundary

AG31A is planning-only.

No database, queue runtime, article-state runtime, state transition runtime, assignment query, Auth/backend/Supabase activation, RLS application, secrets, server/API routes, deployment, publishing or public mutation is created.

## Next Stage

AG31B — Queue Integration Plan — non-active planning only.
`;

writeJson(outputs.review, review);
writeJson(outputs.model, model);
writeJson(outputs.stateRegister, stateRegister);
writeJson(outputs.transitionMap, transitionMap);
writeJson(outputs.roleStatePermissionMatrix, roleStatePermissionMatrix);
writeJson(outputs.nonActivationAudit, nonActivationAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG31A Article State Model generated.");
console.log("✅ Article state register, transition map and role-state permission matrix created.");
console.log("✅ No database, queue runtime, article-state runtime, assignment query, Auth/backend/Supabase activation, secrets, deployment or public mutation performed.");
console.log("✅ AG31B Queue Integration Plan boundary created.");
