import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag31aReview: "data/content-intelligence/quality-reviews/ag31a-article-state-model.json",
  ag31aModel: "data/content-intelligence/backend-architecture/ag31a-article-state-model.json",
  ag31aStateRegister: "data/content-intelligence/backend-architecture/ag31a-article-state-register.json",
  ag31aTransitionMap: "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  ag31aPermissionMatrix: "data/content-intelligence/backend-architecture/ag31a-role-state-permission-matrix.json",
  ag31aNonActivationAudit: "data/content-intelligence/backend-architecture/ag31a-non-activation-audit-register.json",
  ag31aReadiness: "data/content-intelligence/quality-registry/ag31a-queue-integration-plan-readiness-record.json",
  ag31aBoundary: "data/content-intelligence/mutation-plans/ag31a-to-ag31b-queue-integration-plan-boundary.json",

  ag30zClosure: "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  ag30zHandoff: "data/content-intelligence/backend-architecture/ag30z-ag31-queue-state-handoff-plan.json",
  ag30zActivationBlocker: "data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json",

  ag30cProtectedRouteMap: "data/content-intelligence/backend-architecture/ag30c-protected-route-map.json",
  ag30cSurfaceRegister: "data/content-intelligence/backend-architecture/ag30c-route-surface-scaffold-register.json",
  ag30bAssignedOnlyModel: "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",

  ag29aStateFieldModel: "data/content-intelligence/backend-architecture/ag29a-state-field-model.json",
  ag29bRoleScope: "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",

  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag31b-queue-integration-plan.json",
  plan: "data/content-intelligence/backend-architecture/ag31b-queue-integration-plan.json",
  adminQueueMap: "data/content-intelligence/backend-architecture/ag31b-admin-review-queue-map.json",
  editorQueueMap: "data/content-intelligence/backend-architecture/ag31b-editor-assignment-queue-map.json",
  staticToFutureDbPlan: "data/content-intelligence/backend-architecture/ag31b-static-to-future-db-queue-plan.json",
  queueNonActivationAudit: "data/content-intelligence/backend-architecture/ag31b-queue-non-activation-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag31b-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag31b-queue-integration-plan-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag31b-audit-log-model-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag31b-to-ag31c-audit-log-model-boundary.json",
  registry: "data/quality/ag31b-queue-integration-plan.json",
  preview: "data/quality/ag31b-queue-integration-plan-preview.json",
  doc: "docs/quality/AG31B_QUEUE_INTEGRATION_PLAN.md"
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
  if (!exists(p)) throw new Error(`Missing AG31B input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag31aModel.status !== "article_state_model_created_ready_for_ag31b") throw new Error("AG31A model status mismatch.");
if (records.ag31aReadiness.ready_for_ag31b !== true) throw new Error("AG31A readiness does not permit AG31B.");
if (records.ag31aReadiness.allowed_ag31b_mode !== "non_active_queue_integration_plan_only") throw new Error("AG31B mode mismatch.");
if (records.ag31aBoundary.next_stage_id !== "AG31B") throw new Error("AG31A boundary does not point to AG31B.");
if (records.ag31aNonActivationAudit.audit_passed !== true) throw new Error("AG31A non-activation audit must pass.");
if (records.ag30zClosure.status !== "login_ui_closure_created_ready_for_ag31") throw new Error("AG30Z closure status mismatch.");
if (records.ag30zHandoff.ag31_ready !== true) throw new Error("AG31 handoff readiness missing.");
if (records.ag30zHandoff.ag31_activation_allowed !== false) throw new Error("AG31 activation must remain false.");

for (const [key, value] of Object.entries(records.ag30zActivationBlocker.blocked_activation_items || {})) {
  if (value !== false) throw new Error(`AG30Z activation blocker must remain false: ${key}`);
}

if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) throw new Error("Admin final clearance missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("Editor assigned-only rule missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) throw new Error("Editor no-publish rule missing.");

const requiredStates = ["draft", "editor_submitted", "admin_review", "returned", "archived", "publish_approved", "published"];
for (const state of requiredStates) {
  if (!records.ag31aStateRegister.article_states.some((item) => item.state === state)) {
    throw new Error(`Missing AG31A state: ${state}`);
  }
}

const blockedState = {
  queue_integration_plan_created: true,
  admin_review_queue_map_created: true,
  editor_assignment_queue_map_created: true,
  static_to_future_db_queue_plan_created: true,
  queue_non_activation_audit_created: true,
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

const adminQueueMap = {
  module_id: "AG31B",
  title: "Admin Review Queue Map",
  status: "admin_review_queue_map_created_no_runtime",
  route_source: "data/content-intelligence/backend-architecture/ag30c-protected-route-map.json",
  future_admin_queue_surfaces: [
    {
      queue_lane: "draft_intake",
      state_filter: ["draft"],
      future_actor: "admin",
      purpose: "Admin reviews generated or manually created drafts.",
      runtime_created_now: false
    },
    {
      queue_lane: "editor_submissions",
      state_filter: ["editor_submitted"],
      future_actor: "admin",
      purpose: "Admin reviews Editor-submitted assigned corrections.",
      runtime_created_now: false
    },
    {
      queue_lane: "admin_review",
      state_filter: ["admin_review"],
      future_actor: "admin",
      purpose: "Admin performs final review and decision.",
      runtime_created_now: false
    },
    {
      queue_lane: "publish_clearance",
      state_filter: ["publish_approved"],
      future_actor: "admin",
      purpose: "Admin-cleared items awaiting later controlled publish handler.",
      runtime_created_now: false
    },
    {
      queue_lane: "archive_reference",
      state_filter: ["archived"],
      future_actor: "admin",
      purpose: "Admin can view archived decisions for record/audit reference.",
      runtime_created_now: false
    }
  ],
  admin_final_clearance_required: true,
  queue_query_created: false,
  queue_runtime_created: false,
  database_created: false,
  blocked_state: blockedState
};

const editorQueueMap = {
  module_id: "AG31B",
  title: "Editor Assignment Queue Map",
  status: "editor_assignment_queue_map_created_no_runtime",
  assigned_only_source: "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  future_editor_queue_surfaces: [
    {
      queue_lane: "assigned_corrections",
      state_filter: ["returned"],
      future_actor: "editor",
      purpose: "Editor works only on items assigned/returned by Admin.",
      runtime_created_now: false
    },
    {
      queue_lane: "submitted_back_to_admin",
      state_filter: ["editor_submitted"],
      future_actor: "editor",
      purpose: "Editor sees own submitted items as read-only/reference after sending back to Admin.",
      runtime_created_now: false
    }
  ],
  editor_rules: {
    editor_can_only_work_on_admin_assigned_items: true,
    editor_cannot_self_assign: true,
    editor_cannot_global_browse: true,
    editor_cannot_publish: true,
    editor_submits_back_to_admin: true
  },
  assignment_query_created: false,
  editor_queue_runtime_created: false,
  database_created: false,
  blocked_state: blockedState
};

const staticToFutureDbPlan = {
  module_id: "AG31B",
  title: "Static to Future Database Queue Plan",
  status: "static_to_future_db_queue_plan_created_no_database",
  future_tables_planned: [
    {
      table_name: "articles",
      purpose: "Holds future article records and current state.",
      create_now: false
    },
    {
      table_name: "article_queue_items",
      purpose: "Maps article records into Admin/Editor queue lanes.",
      create_now: false
    },
    {
      table_name: "article_assignments",
      purpose: "Maps Admin-assigned items to Editors.",
      create_now: false
    },
    {
      table_name: "article_state_events",
      purpose: "Future audit/event log for state transitions.",
      create_now: false
    }
  ],
  future_queue_fields: [
    "queue_item_id",
    "article_id",
    "current_state",
    "assigned_editor_id",
    "assigned_by_admin_id",
    "queue_lane",
    "priority",
    "created_at",
    "updated_at",
    "last_state_event_id"
  ],
  mapping_rules: [
    {
      source_surface: "/admin/review",
      future_queue_lane: "admin_review",
      allowed_roles: ["admin"],
      create_now: false
    },
    {
      source_surface: "/editor/workspace",
      future_queue_lane: "assigned_corrections",
      allowed_roles: ["editor"],
      create_now: false
    }
  ],
  database_table_created: false,
  migration_generated: false,
  sql_generated: false,
  rls_policy_applied: false,
  blocked_state: blockedState
};

const queueNonActivationAudit = {
  module_id: "AG31B",
  title: "Queue Non-Activation Audit Register",
  status: "queue_integration_plan_non_activation_audit_passed",
  checks: [
    {
      check_id: "no_database_or_migration",
      passed: true,
      evidence: "AG31B creates queue planning JSON/doc records only."
    },
    {
      check_id: "no_queue_runtime",
      passed: true,
      evidence: "No live queue list, fetch, server route or assignment query is created."
    },
    {
      check_id: "no_assignment_query",
      passed: true,
      evidence: "Editor assignment is mapped as future planning only."
    },
    {
      check_id: "admin_final_clearance_preserved",
      passed: true,
      evidence: "Admin remains final clearance authority."
    },
    {
      check_id: "editor_assigned_only_no_publish_preserved",
      passed: true,
      evidence: "Editor remains assigned-only and cannot publish."
    },
    {
      check_id: "no_auth_backend_secret_or_public_mutation",
      passed: true,
      evidence: "Auth/backend/Supabase/secrets/deployment/public mutation remain blocked."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG31B",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag31c",
  future_consumption: {
    AG31C:
      "AG31C should consume AG31B queue maps and AG31A state transitions to define audit log fields: actor, action, before/after state, timestamp, article hash and decision notes, without runtime logging.",
    AG31D:
      "AG31D should audit queue/state transition rules and confirm no illegal transition can publish directly without Admin approval.",
    AG31Z:
      "AG31Z should close AG31A-AG31D as non-active queue/state planning and hand off to AG32 action-handler architecture.",
    AG32:
      "AG32 should consume AG31B queue integration plan and AG31C audit log model for non-active dynamic publish handler planning."
  },
  blocked_state: blockedState
};

const plan = {
  module_id: "AG31B",
  title: "Queue Integration Plan",
  status: "queue_integration_plan_created_ready_for_ag31c",
  purpose:
    "Map static Admin Review Queue and Editor assigned-workflow surfaces to future database-backed queue planning, without creating database tables, queue runtime, assignment queries, Auth/backend activation, secrets, deployment or public mutation.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag31a_status: records.ag31aModel.status,
    ag30z_status: records.ag30zClosure.status,
    ag30c_route_map_status: records.ag30cProtectedRouteMap.status,
    ag30b_assigned_only_status: records.ag30bAssignedOnlyModel.status,
    state_count: records.ag31aStateRegister.state_count,
    admin_final_clearance_preserved: records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority === true,
    editor_assigned_only_preserved: records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items === true,
    editor_no_publish_preserved: records.ag26zRoleGovernance.role_rules?.editor_cannot_publish === true
  },
  plan_decision: {
    non_active_queue_integration_plan_created: true,
    admin_review_queue_map_created: true,
    editor_assignment_queue_map_created: true,
    static_to_future_db_queue_plan_created: true,
    queue_non_activation_audit_created: true,
    proceed_to_ag31c_audit_log_model: true,
    queue_runtime_approved_now: false,
    assignment_query_approved_now: false,
    database_creation_approved_now: false,
    migration_generation_approved_now: false,
    sql_generation_approved_now: false,
    article_state_runtime_approved_now: false,
    audit_runtime_approved_now: false,
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
  admin_queue_map_file: outputs.adminQueueMap,
  editor_queue_map_file: outputs.editorQueueMap,
  static_to_future_db_queue_plan_file: outputs.staticToFutureDbPlan,
  queue_non_activation_audit_file: outputs.queueNonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  queue_runtime_allowed_in_ag31b: false,
  assignment_query_allowed_in_ag31b: false,
  database_creation_allowed_in_ag31b: false,
  migration_generation_allowed_in_ag31b: false,
  sql_generation_allowed_in_ag31b: false,
  article_state_runtime_allowed_in_ag31b: false,
  audit_runtime_allowed_in_ag31b: false,
  rls_policy_application_allowed_in_ag31b: false,
  auth_activation_allowed_in_ag31b: false,
  backend_connection_allowed_in_ag31b: false,
  supabase_connection_allowed_in_ag31b: false,
  server_route_creation_allowed_in_ag31b: false,
  api_route_creation_allowed_in_ag31b: false,
  secret_creation_allowed_in_ag31b: false,
  env_var_write_allowed_in_ag31b: false,
  deployment_allowed_in_ag31b: false,
  public_mutation_allowed_in_ag31b: false,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG31B",
  title: "Queue Integration Plan Blocker Register",
  status: "queue_integration_plan_operations_blocked_pending_ag31c",
  blocked_items: [
    "No database table creation.",
    "No migration generation.",
    "No SQL generation.",
    "No queue runtime.",
    "No assignment query.",
    "No Admin review runtime.",
    "No Editor assignment runtime.",
    "No article state runtime.",
    "No audit runtime.",
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
  module_id: "AG31B",
  title: "Audit Log Model Readiness Record",
  status: "ready_for_ag31c_audit_log_model",
  ready_for_ag31c: true,
  next_stage_id: "AG31C",
  next_stage_title: "Audit Log Model",
  allowed_ag31c_mode: "non_active_audit_log_model_only",
  queue_integration_plan_created: true,
  admin_review_queue_map_created: true,
  editor_assignment_queue_map_created: true,
  static_to_future_db_queue_plan_created: true,
  real_execution_allowed_now: false,
  queue_runtime_allowed_now: false,
  assignment_query_allowed_now: false,
  audit_runtime_allowed_now: false,
  auth_activation_allowed_now: false,
  backend_activation_allowed_now: false,
  supabase_auth_backend_activation_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG31B",
  title: "AG31B to AG31C Audit Log Model Boundary",
  status: "ag31c_boundary_created_non_active_audit_log_model_only",
  next_stage_id: "AG31C",
  next_stage_title: "Audit Log Model",
  allowed_scope: [
    "Consume AG31A article state transition map.",
    "Consume AG31B Admin review queue map.",
    "Consume AG31B Editor assignment queue map.",
    "Define future audit log fields: actor, action, before/after state, timestamp and article hash.",
    "Preserve Admin final clearance.",
    "Preserve Editor assigned-only and no-publish governance.",
    "Keep audit/database/backend runtime inactive."
  ],
  blocked_scope: blocker.blocked_items,
  backend_planning_selected: true,
  backend_activation_deferred: true,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_real_activation: true
};

const review = {
  module_id: "AG31B",
  title: "Queue Integration Plan",
  status: "queue_integration_plan_created_ready_for_ag31c",
  depends_on: ["AG31A", "AG30Z", "AG30C", "AG30B", "AG29A", "AG29B", "AG26Z"],
  generated_from: inputs,
  plan_file: outputs.plan,
  admin_queue_map_file: outputs.adminQueueMap,
  editor_queue_map_file: outputs.editorQueueMap,
  static_to_future_db_queue_plan_file: outputs.staticToFutureDbPlan,
  queue_non_activation_audit_file: outputs.queueNonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    queue_integration_plan_created: true,
    non_active_queue_plan_only: true,
    admin_review_queue_map_created: true,
    editor_assignment_queue_map_created: true,
    static_to_future_db_queue_plan_created: true,
    queue_non_activation_audit_passed: true,
    ready_for_ag31c: true,
    queue_runtime_allowed_now: false,
    assignment_query_allowed_now: false,
    database_creation_allowed_now: false,
    migration_generation_allowed_now: false,
    sql_generation_allowed_now: false,
    article_state_runtime_allowed_now: false,
    audit_runtime_allowed_now: false,
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
  module_id: "AG31B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG31B",
  preview_only: true,
  status: review.status,
  message: "AG31B Queue Integration Plan created. Next: AG31C Audit Log Model.",
  queue_integration_plan_created: 1,
  admin_review_queue_map_created: 1,
  editor_assignment_queue_map_created: 1,
  static_to_future_db_queue_plan_created: 1,
  queue_runtime_created: 0,
  assignment_query_created: 0,
  database_objects_created: 0,
  migrations_generated: 0,
  sql_generated: 0,
  article_state_runtime_created: 0,
  audit_runtime_created: 0,
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

const doc = `# AG31B — Queue Integration Plan

## Purpose

AG31B maps static Admin Review Queue and Editor assigned-workflow surfaces to a future database-backed queue plan.

## Created Planning Records

- Admin review queue map.
- Editor assignment queue map.
- Static-to-future database queue plan.
- Queue non-activation audit register.
- Future consumption plan for AG31C.

## Governance Preserved

Admin remains final clearance authority. Editor works only on Admin-assigned items and cannot publish.

## Important Boundary

AG31B is planning-only.

No database, migration, SQL, queue runtime, assignment query, article-state runtime, audit runtime, Auth/backend/Supabase activation, RLS application, secrets, server/API routes, deployment, publishing or public mutation is created.

## Next Stage

AG31C — Audit Log Model — non-active planning only.
`;

writeJson(outputs.review, review);
writeJson(outputs.plan, plan);
writeJson(outputs.adminQueueMap, adminQueueMap);
writeJson(outputs.editorQueueMap, editorQueueMap);
writeJson(outputs.staticToFutureDbPlan, staticToFutureDbPlan);
writeJson(outputs.queueNonActivationAudit, queueNonActivationAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG31B Queue Integration Plan generated.");
console.log("✅ Admin review queue map, Editor assignment queue map and static-to-future DB queue plan created.");
console.log("✅ No database, queue runtime, assignment query, Auth/backend/Supabase activation, secrets, deployment or public mutation performed.");
console.log("✅ AG31C Audit Log Model boundary created.");
