import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag29aReview: "data/content-intelligence/quality-reviews/ag29a-supabase-schema-draft.json",
  ag29aDraft: "data/content-intelligence/backend-architecture/ag29a-supabase-schema-draft.json",
  ag29aEntityRegister: "data/content-intelligence/backend-architecture/ag29a-schema-entity-register.json",
  ag29aRelationshipMap: "data/content-intelligence/backend-architecture/ag29a-table-relationship-map.json",
  ag29aStateFieldModel: "data/content-intelligence/backend-architecture/ag29a-state-field-model.json",
  ag29aPublishAuditRollbackDraft: "data/content-intelligence/backend-architecture/ag29a-publish-audit-rollback-schema-draft.json",
  ag29aNonActivationAudit: "data/content-intelligence/backend-architecture/ag29a-non-activation-audit-register.json",
  ag29aReadiness: "data/content-intelligence/quality-registry/ag29a-rls-policy-plan-readiness-record.json",
  ag29aBoundary: "data/content-intelligence/mutation-plans/ag29a-to-ag29b-rls-policy-plan-boundary.json",

  ag28Blueprint: "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  ag28AuthSessionModel: "data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json",
  ag28ServiceBoundaryModel: "data/content-intelligence/backend-architecture/ag28-service-boundary-model.json",
  ag28SecretDoctrine: "data/content-intelligence/backend-architecture/ag28-secret-environment-doctrine.json",

  ag27cRlsPolicyPlan: "data/content-intelligence/backend-decision/ag27c-rls-policy-plan.json",
  ag27cRoleAccessModel: "data/content-intelligence/backend-decision/ag27c-auth-role-access-model.json",
  ag27dAccessBoundaryMatrix: "data/content-intelligence/backend-decision/ag27d-access-boundary-matrix.json",
  ag27dRlsScenarioModel: "data/content-intelligence/backend-decision/ag27d-rls-test-scenario-model.json",
  ag27dActivationGuardRegister: "data/content-intelligence/backend-decision/ag27d-activation-guard-register.json",

  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag29b-rls-policy-plan.json",
  plan: "data/content-intelligence/backend-architecture/ag29b-rls-policy-plan.json",
  roleScopeRegister: "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  tableRuleMap: "data/content-intelligence/backend-architecture/ag29b-table-rls-rule-map.json",
  systemActionPolicyPlan: "data/content-intelligence/backend-architecture/ag29b-system-action-policy-plan.json",
  publicReaderPolicyPlan: "data/content-intelligence/backend-architecture/ag29b-public-reader-policy-plan.json",
  nonActivationAudit: "data/content-intelligence/backend-architecture/ag29b-non-activation-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag29b-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag29b-rls-policy-plan-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag29b-secret-governance-plan-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag29b-to-ag29c-secret-governance-plan-boundary.json",
  registry: "data/quality/ag29b-rls-policy-plan.json",
  preview: "data/quality/ag29b-rls-policy-plan-preview.json",
  doc: "docs/quality/AG29B_RLS_POLICY_PLAN.md"
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
  if (!exists(p)) throw new Error(`Missing AG29B input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag29aReview.status !== "supabase_schema_draft_created_ready_for_ag29b") throw new Error("AG29A review status mismatch.");
if (records.ag29aDraft.status !== "supabase_schema_draft_created_ready_for_ag29b") throw new Error("AG29A draft status mismatch.");
if (records.ag29aReadiness.ready_for_ag29b !== true) throw new Error("AG29A readiness does not permit AG29B.");
if (records.ag29aReadiness.allowed_ag29b_mode !== "non_active_rls_policy_plan_only") throw new Error("AG29B mode mismatch.");
if (records.ag29aBoundary.next_stage_id !== "AG29B") throw new Error("AG29A boundary does not point to AG29B.");
if (records.ag29aDraft.schema_draft_decision?.rls_policy_application_approved_now !== false) throw new Error("RLS application must remain blocked.");
if (records.ag29aDraft.schema_draft_decision?.database_creation_approved_now !== false) throw new Error("Database creation must remain blocked.");
if (records.ag29aDraft.schema_draft_decision?.secrets_or_env_setup_approved_now !== false) throw new Error("Secrets/env setup must remain blocked.");
if (records.ag29aNonActivationAudit.audit_passed !== true) throw new Error("AG29A non-activation audit must pass.");

if (records.ag28Blueprint.status !== "backend_auth_architecture_blueprint_created_ready_for_ag29") throw new Error("AG28 blueprint status mismatch.");
if (records.ag27cRlsPolicyPlan.status !== "rls_policy_plan_created_no_policy_application") throw new Error("AG27C RLS plan status mismatch.");
if (records.ag27cRlsPolicyPlan.rls_application_allowed !== false) throw new Error("AG27C RLS application must remain blocked.");
if (records.ag27cRoleAccessModel.auth_activation_allowed !== false) throw new Error("AG27C Auth activation must remain blocked.");
if (records.ag27dRlsScenarioModel.rls_policy_application_allowed !== false) throw new Error("AG27D RLS application must remain blocked.");
if (records.ag27dActivationGuardRegister.activation_allowed_now !== false) throw new Error("Activation must remain blocked.");
if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) throw new Error("Admin final clearance missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("Editor assigned-only rule missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) throw new Error("Editor publish block missing.");

const blockedState = {
  rls_policy_plan_created: true,
  role_scope_register_created: true,
  table_rule_map_created: true,
  system_action_policy_plan_created: true,
  public_reader_policy_plan_created: true,
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
  admin_login_created: false,
  editor_login_created: false,
  secrets_created: false,
  env_vars_written: false,
  server_route_created: false,
  api_route_created: false,
  queue_runtime_created: false,
  audit_runtime_created: false,
  article_state_runtime_created: false,
  dynamic_publish_runtime_created: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false,
  public_mutation_done: false,
  supabase_auth_backend_activated: false
};

const roleScopeRegister = {
  module_id: "AG29B",
  title: "Role Scope Policy Register",
  status: "role_scope_policy_register_created_no_rls_application",
  role_scopes: [
    {
      role_code: "admin",
      planned_scope: "full_internal_review_scope",
      permitted_future_actions: ["assign", "review", "return_for_correction", "archive", "final_clearance", "publish_plan_only"],
      blocked_now: true,
      rls_policy_apply_now: false
    },
    {
      role_code: "editor",
      planned_scope: "assigned_items_only",
      permitted_future_actions: ["read_assigned", "save_assigned_work", "submit_to_admin"],
      forbidden_future_actions: ["global_browse", "self_assign", "publish", "admin_clearance"],
      blocked_now: true,
      rls_policy_apply_now: false
    },
    {
      role_code: "subscriber",
      planned_scope: "future_subscriber_read_only_surfaces",
      permitted_future_actions: ["read_subscriber_allowed_content"],
      forbidden_future_actions: ["admin_review", "editor_workspace", "publish"],
      blocked_now: true,
      rls_policy_apply_now: false
    },
    {
      role_code: "anonymous_public",
      planned_scope: "published_public_content_only",
      permitted_future_actions: ["read_published_public_article"],
      forbidden_future_actions: ["read_unpublished", "admin_review", "editor_workspace"],
      blocked_now: true,
      rls_policy_apply_now: false
    },
    {
      role_code: "service_role_server_only",
      planned_scope: "controlled_server_actions_only",
      permitted_future_actions: ["append_audit", "controlled_publish_apply", "rollback_prepare"],
      forbidden_future_actions: ["frontend_exposure"],
      blocked_now: true,
      rls_policy_apply_now: false
    }
  ],
  rls_policies_applied: false,
  auth_enabled: false,
  blocked_state: blockedState
};

const tableRuleMap = {
  module_id: "AG29B",
  title: "Table RLS Rule Map",
  status: "table_rls_rule_map_created_no_policy_application",
  table_policy_groups: [
    {
      table_name: "users",
      planned_rules: [
        "Admin can view users for assignment planning after activation.",
        "Editor can view own profile only after activation.",
        "Public cannot read user records."
      ],
      apply_now: false
    },
    {
      table_name: "roles",
      planned_rules: [
        "Admin can read active role definitions after activation.",
        "Public can never mutate role definitions.",
        "Editor cannot mutate roles."
      ],
      apply_now: false
    },
    {
      table_name: "articles",
      planned_rules: [
        "Admin can read internal review articles after activation.",
        "Editor can read only assigned article records after activation.",
        "Public can read only published and public-visible articles after activation."
      ],
      apply_now: false
    },
    {
      table_name: "review_queue",
      planned_rules: [
        "Admin can create assignments after activation.",
        "Editor can read only rows assigned to that editor after activation.",
        "Editor cannot self-assign."
      ],
      apply_now: false
    },
    {
      table_name: "editor_decisions",
      planned_rules: [
        "Editor can insert decisions only for assigned articles after activation.",
        "Admin can read editor decisions after activation.",
        "Public cannot access editor decisions."
      ],
      apply_now: false
    },
    {
      table_name: "admin_decisions",
      planned_rules: [
        "Admin can create decisions after activation.",
        "Editor can read returned decisions relevant to assigned articles after activation.",
        "Public cannot access admin decisions."
      ],
      apply_now: false
    },
    {
      table_name: "publish_logs",
      planned_rules: [
        "Server-side controlled action can append publish logs after activation.",
        "Admin can read publish logs after activation.",
        "No update/delete after creation."
      ],
      apply_now: false
    },
    {
      table_name: "audit_logs",
      planned_rules: [
        "Audit logs are append-only after activation.",
        "Admin can read audit logs after activation.",
        "Editor can read only limited audit context for assigned items if needed."
      ],
      apply_now: false
    },
    {
      table_name: "rollback_records",
      planned_rules: [
        "Server-side controlled action can create rollback records after activation.",
        "Admin can read rollback records after activation.",
        "Public cannot access rollback records."
      ],
      apply_now: false
    },
    {
      table_name: "reference_evidence",
      planned_rules: [
        "Admin can review evidence after activation.",
        "Editor can edit evidence only for assigned articles after activation.",
        "Public can only see public rendered references, not internal evidence fields."
      ],
      apply_now: false
    },
    {
      table_name: "object_assets",
      planned_rules: [
        "Admin can review object assets after activation.",
        "Editor can update assets only for assigned articles after activation.",
        "Public can only see approved rendered asset metadata."
      ],
      apply_now: false
    }
  ],
  rls_policies_created: false,
  rls_policies_applied: false,
  blocked_state: blockedState
};

const systemActionPolicyPlan = {
  module_id: "AG29B",
  title: "System Action Policy Plan",
  status: "system_action_policy_plan_created_no_runtime",
  system_actions: [
    {
      action_id: "append_audit_log",
      actor: "server_side_controlled_action",
      planned_permission: "insert_only",
      target_table: "audit_logs",
      execute_now: false
    },
    {
      action_id: "append_publish_log",
      actor: "server_side_controlled_action",
      planned_permission: "insert_only",
      target_table: "publish_logs",
      execute_now: false
    },
    {
      action_id: "prepare_rollback_record",
      actor: "server_side_controlled_action",
      planned_permission: "insert_only",
      target_table: "rollback_records",
      execute_now: false
    },
    {
      action_id: "change_article_to_published",
      actor: "future_admin_approved_server_action",
      planned_permission: "guarded_update",
      target_table: "articles",
      execute_now: false
    }
  ],
  runtime_created: false,
  service_role_used_now: false,
  blocked_state: blockedState
};

const publicReaderPolicyPlan = {
  module_id: "AG29B",
  title: "Public Reader Policy Plan",
  status: "public_reader_policy_plan_created_no_public_runtime",
  public_rules: [
    {
      rule_id: "published_article_read_only",
      target_table: "articles",
      planned_condition: "public_visibility=true AND article_state='published'",
      apply_now: false
    },
    {
      rule_id: "public_reference_rendered_only",
      target_table: "reference_evidence",
      planned_condition: "only approved rendered public reference fields may be exposed through future public surface",
      apply_now: false
    },
    {
      rule_id: "public_asset_rendered_only",
      target_table: "object_assets",
      planned_condition: "only approved rendered asset metadata may be exposed through future public surface",
      apply_now: false
    }
  ],
  public_runtime_created: false,
  public_policy_applied: false,
  blocked_state: blockedState
};

const nonActivationAudit = {
  module_id: "AG29B",
  title: "RLS Policy Plan Non-Activation Audit",
  status: "rls_policy_plan_non_activation_audit_passed",
  checks: [
    {
      check_id: "no_sql_generated",
      passed: true,
      evidence: "AG29B creates RLS planning JSON/docs only."
    },
    {
      check_id: "no_rls_policy_created_or_applied",
      passed: true,
      evidence: "RLS policies are planned but no SQL or policy application is generated."
    },
    {
      check_id: "no_database_objects_created",
      passed: true,
      evidence: "No tables, constraints, indexes or policies are created."
    },
    {
      check_id: "no_auth_activation",
      passed: true,
      evidence: "Auth and login remain inactive."
    },
    {
      check_id: "no_secret_or_env_write",
      passed: true,
      evidence: "Secret governance is still planning-only."
    },
    {
      check_id: "no_routes_or_runtime",
      passed: true,
      evidence: "No server/API route or runtime action is created."
    },
    {
      check_id: "no_deployment_or_public_mutation",
      passed: true,
      evidence: "No deployment and no public file mutation."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG29B",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag29c",
  future_consumption: {
    AG29C:
      "AG29C should consume AG29B role scopes, table RLS rule map and system-action policy plan to define secret governance and service-role handling without storing secrets.",
    AG29D:
      "Schema/RLS Security Audit should consume AG29A schema draft, AG29B RLS plan and AG29C secret governance plan to audit role separation and safety.",
    AG29Z:
      "Schema/RLS Closure should close AG29A-AG29D as non-active schema/RLS planning.",
    AG30:
      "Admin/Editor Login UI and route scaffold should consume AG29Z only after closure; login remains non-real until later approved activation stages."
  },
  blocked_state: blockedState
};

const plan = {
  module_id: "AG29B",
  title: "RLS Policy Plan",
  status: "rls_policy_plan_created_ready_for_ag29c",
  purpose:
    "Define non-active row-level security planning for Admin, Editor, Public Reader and system actions using AG29A schema and AG27D RLS scenarios, without generating SQL, creating/applying policies, enabling Auth, storing secrets, creating routes, deploying or mutating public files.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag29a_status: records.ag29aDraft.status,
    ag29a_entity_count: records.ag29aEntityRegister.entity_count,
    ag29a_relationship_count: records.ag29aRelationshipMap.relationship_count,
    ag28_status: records.ag28Blueprint.status,
    ag27c_rls_status: records.ag27cRlsPolicyPlan.status,
    ag27d_rls_scenarios: records.ag27dRlsScenarioModel.scenario_count,
    admin_final_clearance_preserved: records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority === true,
    editor_assigned_only_preserved: records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items === true
  },
  rls_decision: {
    non_active_rls_policy_plan_created: true,
    role_scope_register_created: true,
    table_rule_map_created: true,
    system_action_policy_plan_created: true,
    public_reader_policy_plan_created: true,
    proceed_to_ag29c_secret_governance_plan: true,
    sql_generation_approved_now: false,
    rls_policy_creation_approved_now: false,
    rls_policy_application_approved_now: false,
    database_creation_approved_now: false,
    auth_activation_approved_now: false,
    secrets_or_env_setup_approved_now: false,
    server_route_creation_approved_now: false,
    deployment_approved_now: false,
    public_mutation_approved_now: false
  },
  role_scope_register_file: outputs.roleScopeRegister,
  table_rule_map_file: outputs.tableRuleMap,
  system_action_policy_plan_file: outputs.systemActionPolicyPlan,
  public_reader_policy_plan_file: outputs.publicReaderPolicyPlan,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  sql_generation_allowed_in_ag29b: false,
  rls_policy_creation_allowed_in_ag29b: false,
  rls_policy_application_allowed_in_ag29b: false,
  database_creation_allowed_in_ag29b: false,
  auth_activation_allowed_in_ag29b: false,
  secret_creation_allowed_in_ag29b: false,
  env_var_write_allowed_in_ag29b: false,
  server_route_creation_allowed_in_ag29b: false,
  api_route_creation_allowed_in_ag29b: false,
  deployment_allowed_in_ag29b: false,
  public_mutation_allowed_in_ag29b: false,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG29B",
  title: "RLS Policy Plan Blocker Register",
  status: "rls_policy_plan_operations_blocked_pending_ag29c",
  blocked_items: [
    "No Supabase project creation.",
    "No Supabase connection.",
    "No SQL generation.",
    "No migration generation.",
    "No database table creation.",
    "No database constraint application.",
    "No database index creation.",
    "No RLS policy creation.",
    "No RLS policy application.",
    "No Auth activation.",
    "No Admin login creation.",
    "No Editor login creation.",
    "No secrets creation.",
    "No environment variable write.",
    "No server/API route creation.",
    "No queue runtime creation.",
    "No audit runtime creation.",
    "No article state runtime creation.",
    "No dynamic publish runtime creation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No public mutation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG29B",
  title: "Secret Governance Plan Readiness Record",
  status: "ready_for_ag29c_secret_governance_plan",
  ready_for_ag29c: true,
  next_stage_id: "AG29C",
  next_stage_title: "Secret Governance Plan",
  allowed_ag29c_mode: "non_active_secret_governance_plan_only",
  rls_policy_plan_created: true,
  role_scope_register_created: true,
  table_rule_map_created: true,
  system_action_policy_plan_created: true,
  public_reader_policy_plan_created: true,
  real_execution_allowed_now: false,
  backend_activation_allowed_now: false,
  supabase_auth_backend_activation_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG29B",
  title: "AG29B to AG29C Secret Governance Plan Boundary",
  status: "ag29c_boundary_created_non_active_secret_governance_plan_only",
  next_stage_id: "AG29C",
  next_stage_title: "Secret Governance Plan",
  allowed_scope: [
    "Consume AG29B role scope policy register.",
    "Consume AG29B table RLS rule map.",
    "Consume AG29B system action policy plan.",
    "Consume AG28 secret environment doctrine.",
    "Consume AG27D secret risk register and activation guards.",
    "Create non-active secret governance plan.",
    "Keep Supabase/Auth/backend activation, SQL, migrations, database, policies, secrets, env vars, routes, deployment and public mutation blocked."
  ],
  blocked_scope: blocker.blocked_items,
  backend_planning_selected: true,
  backend_activation_deferred: true,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_real_activation: true
};

const review = {
  module_id: "AG29B",
  title: "RLS Policy Plan",
  status: "rls_policy_plan_created_ready_for_ag29c",
  depends_on: ["AG29A", "AG28", "AG27C", "AG27D", "AG26Z"],
  generated_from: inputs,
  plan_file: outputs.plan,
  role_scope_register_file: outputs.roleScopeRegister,
  table_rule_map_file: outputs.tableRuleMap,
  system_action_policy_plan_file: outputs.systemActionPolicyPlan,
  public_reader_policy_plan_file: outputs.publicReaderPolicyPlan,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    rls_policy_plan_created: true,
    non_active_rls_policy_plan_only: true,
    role_scope_register_created: true,
    table_rule_map_created: true,
    system_action_policy_plan_created: true,
    public_reader_policy_plan_created: true,
    ready_for_ag29c: true,
    sql_generation_allowed_now: false,
    rls_policy_creation_allowed_now: false,
    rls_policy_application_allowed_now: false,
    database_creation_allowed_now: false,
    auth_activation_allowed_now: false,
    secret_creation_allowed_now: false,
    env_var_write_allowed_now: false,
    server_route_creation_allowed_now: false,
    api_route_creation_allowed_now: false,
    deployment_done: false,
    public_mutation_done: false,
    real_execution_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG29B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG29B",
  preview_only: true,
  status: review.status,
  message: "AG29B RLS Policy Plan created. Next: AG29C Secret Governance Plan.",
  role_scope_register_created: 1,
  table_rule_map_created: 1,
  system_action_policy_plan_created: 1,
  public_reader_policy_plan_created: 1,
  sql_generated: 0,
  migrations_generated: 0,
  database_objects_created: 0,
  rls_policies_created: 0,
  rls_policies_applied: 0,
  auth_enabled: 0,
  secrets_created: 0,
  env_vars_written: 0,
  server_routes_created: 0,
  api_routes_created: 0,
  deployment_done: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG29B — RLS Policy Plan

## Purpose

AG29B creates a non-active row-level security planning record for Drishvara.

## Created Planning Records

- Role scope policy register.
- Table RLS rule map.
- System action policy plan.
- Public reader policy plan.
- Non-activation audit.

## Important Boundary

AG29B does not create or apply RLS policies.

No SQL, migration, database object, RLS policy, Auth, secret, environment variable, server/API route, deployment, publishing or public mutation is created.

## Governance Preserved

Admin remains final clearance authority. Editor can work only on Admin-assigned items. Editor cannot self-assign, globally browse or publish.

## Next Stage

AG29C — Secret Governance Plan — non-active planning only.
`;

writeJson(outputs.review, review);
writeJson(outputs.plan, plan);
writeJson(outputs.roleScopeRegister, roleScopeRegister);
writeJson(outputs.tableRuleMap, tableRuleMap);
writeJson(outputs.systemActionPolicyPlan, systemActionPolicyPlan);
writeJson(outputs.publicReaderPolicyPlan, publicReaderPolicyPlan);
writeJson(outputs.nonActivationAudit, nonActivationAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG29B RLS Policy Plan generated.");
console.log("✅ Role scope, table RLS rule map, system-action and public-reader policy plans created.");
console.log("✅ No SQL, migrations, database objects, RLS creation/application, Auth, secrets, routes, deployment or public mutation performed.");
console.log("✅ AG29C Secret Governance Plan boundary created.");
