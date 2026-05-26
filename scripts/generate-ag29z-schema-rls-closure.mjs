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

  ag29bReview: "data/content-intelligence/quality-reviews/ag29b-rls-policy-plan.json",
  ag29bPlan: "data/content-intelligence/backend-architecture/ag29b-rls-policy-plan.json",
  ag29bRoleScope: "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  ag29bTableRuleMap: "data/content-intelligence/backend-architecture/ag29b-table-rls-rule-map.json",
  ag29bSystemActionPolicy: "data/content-intelligence/backend-architecture/ag29b-system-action-policy-plan.json",
  ag29bPublicReaderPolicy: "data/content-intelligence/backend-architecture/ag29b-public-reader-policy-plan.json",

  ag29cReview: "data/content-intelligence/quality-reviews/ag29c-secret-governance-plan.json",
  ag29cPlan: "data/content-intelligence/backend-architecture/ag29c-secret-governance-plan.json",
  ag29cSecretBoundary: "data/content-intelligence/backend-architecture/ag29c-secret-boundary-register.json",
  ag29cEnvPlan: "data/content-intelligence/backend-architecture/ag29c-env-var-handling-plan.json",
  ag29cServiceRoleSafety: "data/content-intelligence/backend-architecture/ag29c-service-role-safety-plan.json",
  ag29cRotationAudit: "data/content-intelligence/backend-architecture/ag29c-secret-rotation-and-audit-plan.json",

  ag29dReview: "data/content-intelligence/quality-reviews/ag29d-schema-rls-security-audit.json",
  ag29dAudit: "data/content-intelligence/backend-architecture/ag29d-schema-rls-security-audit.json",
  ag29dSchemaAudit: "data/content-intelligence/backend-architecture/ag29d-schema-security-audit-register.json",
  ag29dRlsAudit: "data/content-intelligence/backend-architecture/ag29d-rls-security-audit-register.json",
  ag29dSecretAudit: "data/content-intelligence/backend-architecture/ag29d-secret-safety-audit-register.json",
  ag29dRoleAudit: "data/content-intelligence/backend-architecture/ag29d-role-separation-audit-register.json",
  ag29dNonActivationAudit: "data/content-intelligence/backend-architecture/ag29d-non-activation-audit-register.json",
  ag29dReadiness: "data/content-intelligence/quality-registry/ag29d-schema-rls-closure-readiness-record.json",
  ag29dBoundary: "data/content-intelligence/mutation-plans/ag29d-to-ag29z-schema-rls-closure-boundary.json",

  ag28Blueprint: "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  ag28ModuleMap: "data/content-intelligence/backend-architecture/ag28-backend-module-map.json",
  ag28AuthSessionModel: "data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json",

  ag27zClosure: "data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json",
  ag27zActivationDeferral: "data/content-intelligence/backend-decision/ag27z-backend-activation-deferral-register.json",

  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag29z-schema-rls-closure.json",
  closure: "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  sourceChain: "data/content-intelligence/backend-architecture/ag29z-ag29-detailed-source-chain-register.json",
  planningClosure: "data/content-intelligence/backend-architecture/ag29z-non-active-schema-rls-planning-closure-register.json",
  activationBlocker: "data/content-intelligence/backend-architecture/ag29z-activation-blocker-carry-forward.json",
  ag30Handoff: "data/content-intelligence/backend-architecture/ag29z-ag30-login-route-scaffold-handoff-plan.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag29z-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag29z-schema-rls-closure-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag29z-ag30-login-route-scaffold-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag29z-to-ag30-login-route-scaffold-boundary.json",
  registry: "data/quality/ag29z-schema-rls-closure.json",
  preview: "data/quality/ag29z-schema-rls-closure-preview.json",
  doc: "docs/quality/AG29Z_SCHEMA_RLS_CLOSURE.md"
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
  if (!exists(p)) throw new Error(`Missing AG29Z input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag29aDraft.status !== "supabase_schema_draft_created_ready_for_ag29b") throw new Error("AG29A status mismatch.");
if (records.ag29bPlan.status !== "rls_policy_plan_created_ready_for_ag29c") throw new Error("AG29B status mismatch.");
if (records.ag29cPlan.status !== "secret_governance_plan_created_ready_for_ag29d") throw new Error("AG29C status mismatch.");
if (records.ag29dAudit.status !== "schema_rls_security_audit_created_ready_for_ag29z") throw new Error("AG29D status mismatch.");
if (records.ag29dReadiness.ready_for_ag29z !== true) throw new Error("AG29D readiness does not permit AG29Z.");
if (records.ag29dReadiness.allowed_ag29z_mode !== "non_active_schema_rls_closure_only") throw new Error("AG29Z mode mismatch.");
if (records.ag29dBoundary.next_stage_id !== "AG29Z") throw new Error("AG29D boundary does not point to AG29Z.");

if (records.ag29dAudit.audit_decision?.all_audits_passed !== true) throw new Error("AG29D all audits must pass.");
if (records.ag29dSchemaAudit.audit_passed !== true) throw new Error("Schema audit must pass.");
if (records.ag29dRlsAudit.audit_passed !== true) throw new Error("RLS audit must pass.");
if (records.ag29dSecretAudit.audit_passed !== true) throw new Error("Secret audit must pass.");
if (records.ag29dRoleAudit.audit_passed !== true) throw new Error("Role audit must pass.");
if (records.ag29dNonActivationAudit.audit_passed !== true) throw new Error("Non-activation audit must pass.");

for (const flag of [
  "supabase_activation_approved_now",
  "sql_generation_approved_now",
  "migration_generation_approved_now",
  "database_creation_approved_now",
  "rls_policy_creation_approved_now",
  "rls_policy_application_approved_now",
  "auth_activation_approved_now",
  "secret_creation_approved_now",
  "env_var_write_approved_now",
  "server_route_creation_approved_now",
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (records.ag29dAudit.audit_decision?.[flag] !== false) {
    throw new Error(`AG29D must keep ${flag} false.`);
  }
}

if (records.ag28Blueprint.status !== "backend_auth_architecture_blueprint_created_ready_for_ag29") throw new Error("AG28 status mismatch.");
if (records.ag27zClosure.status !== "backend_decision_closed_non_active_architecture_ready_for_ag28") throw new Error("AG27Z status mismatch.");
for (const [key, value] of Object.entries(records.ag27zActivationDeferral.deferral_decision || {})) {
  if (value !== false) throw new Error(`AG27Z activation deferral must remain false: ${key}`);
}
if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) throw new Error("Admin final clearance missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("Editor assigned-only rule missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) throw new Error("Editor publish block missing.");

const blockedState = {
  schema_rls_closure_created: true,
  ag29_detailed_chain_closed: true,
  non_active_schema_rls_planning_closed: true,
  ag30_non_active_login_route_scaffold_allowed: true,
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
  service_role_key_created: false,
  service_role_key_exposed: false,
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

const sourceChain = {
  module_id: "AG29Z",
  title: "AG29 Detailed Source Chain Register",
  status: "ag29_detailed_source_chain_registered_for_closure",
  chain_length: 4,
  closed_chain: [
    {
      stage_id: "AG29A",
      title: "Supabase Schema Draft",
      status: records.ag29aDraft.status,
      file: inputs.ag29aDraft
    },
    {
      stage_id: "AG29B",
      title: "RLS Policy Plan",
      status: records.ag29bPlan.status,
      file: inputs.ag29bPlan
    },
    {
      stage_id: "AG29C",
      title: "Secret Governance Plan",
      status: records.ag29cPlan.status,
      file: inputs.ag29cPlan
    },
    {
      stage_id: "AG29D",
      title: "Schema/RLS Security Audit",
      status: records.ag29dAudit.status,
      file: inputs.ag29dAudit
    }
  ],
  consumed_architecture_baseline: inputs.ag28Blueprint,
  consumed_backend_decision_closure: inputs.ag27zClosure,
  blocked_state: blockedState
};

const planningClosure = {
  module_id: "AG29Z",
  title: "Non-Active Schema/RLS Planning Closure Register",
  status: "non_active_schema_rls_planning_closed_ready_for_ag30",
  closure_points: {
    schema_draft_completed: true,
    entity_register_completed: true,
    relationship_map_completed: true,
    state_field_model_completed: true,
    rls_policy_plan_completed: true,
    role_scope_register_completed: true,
    table_rls_rule_map_completed: true,
    secret_governance_plan_completed: true,
    service_role_safety_plan_completed: true,
    schema_security_audit_passed: true,
    rls_security_audit_passed: true,
    secret_safety_audit_passed: true,
    role_separation_audit_passed: true,
    non_activation_audit_passed: true,
    ag30_login_route_scaffold_can_continue: true,
    real_activation_still_blocked: true
  },
  planned_counts: {
    schema_entities: records.ag29aEntityRegister.entity_count,
    relationships: records.ag29aRelationshipMap.relationship_count,
    table_rls_policy_groups: records.ag29bTableRuleMap.table_policy_groups.length,
    role_scopes: records.ag29bRoleScope.role_scopes.length,
    secret_boundaries: records.ag29cSecretBoundary.boundary_count
  },
  blocked_state: blockedState
};

const activationBlocker = {
  module_id: "AG29Z",
  title: "Activation Blocker Carry Forward",
  status: "schema_rls_closure_activation_blockers_carried_forward",
  blocked_activation_items: {
    supabase_project_creation_approved: false,
    supabase_connection_approved: false,
    sql_generation_approved: false,
    migration_generation_approved: false,
    database_creation_approved: false,
    rls_policy_creation_approved: false,
    rls_policy_application_approved: false,
    auth_activation_approved: false,
    admin_editor_login_creation_approved: false,
    secret_creation_approved: false,
    env_var_write_approved: false,
    service_role_key_creation_approved: false,
    service_role_use_approved: false,
    server_route_creation_approved: false,
    api_route_creation_approved: false,
    deployment_approved: false,
    public_mutation_approved: false
  },
  future_unlock_requirements: [
    "Explicit user approval.",
    "AG30-AG34 non-active planning closure.",
    "Secret placement review.",
    "RLS policy review.",
    "Test Admin and Editor account plan.",
    "Rollback and audit-readiness check.",
    "No frontend service-role exposure.",
    "Dry-run before any dynamic publish action."
  ],
  blocked_state: blockedState
};

const ag30Handoff = {
  module_id: "AG29Z",
  title: "AG30 Login/Route Scaffold Handoff Plan",
  status: "ag30_non_active_login_route_scaffold_handoff_created",
  ag30_allowed_scope: [
    "Create non-active Admin/Editor login UI scaffold.",
    "Create non-active route naming/placement plan.",
    "Create non-active session-state placeholder plan.",
    "Create role-based navigation visibility model.",
    "Create Admin/Editor route guard plan without real Auth.",
    "Preserve Editor assigned-only and no-publish governance."
  ],
  ag30_blocked_scope: [
    "No Supabase project creation.",
    "No Supabase connection.",
    "No Auth activation.",
    "No real Admin login.",
    "No real Editor login.",
    "No session runtime.",
    "No SQL or migrations.",
    "No database creation.",
    "No RLS policy application.",
    "No secrets or env vars.",
    "No server/API route runtime.",
    "No deployment.",
    "No public mutation."
  ],
  ag30_ready: true,
  ag30_activation_allowed: false,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG29Z",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag30_and_later",
  future_consumption: {
    AG30:
      "AG30 should consume AG29Z closure to create a non-active Admin/Editor Login UI and Route Scaffold. It must not activate Auth or create real routes/runtime.",
    AG31:
      "Future Admin/Editor queue planning should consume AG29A schema states, AG29B role scopes and AG29Z closure.",
    AG32_to_AG34:
      "Future route, session and backend readiness stages should consume AG29D audit registers and AG29Z blocker carry-forward.",
    AG35_and_later:
      "Any real Supabase/Auth/backend activation requires explicit approval and must satisfy the AG29Z activation blockers and AG27D activation guards."
  },
  blocked_state: blockedState
};

const closure = {
  module_id: "AG29Z",
  title: "Schema/RLS Closure",
  status: "schema_rls_closure_created_ready_for_ag30",
  purpose:
    "Close AG29A-AG29D as a completed non-active schema/RLS/security planning chain, ready for AG30 non-active login/route scaffold, while keeping all backend activation, SQL, database, RLS, Auth, secrets, routes, deployment and public mutation blocked.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag29a_status: records.ag29aDraft.status,
    ag29b_status: records.ag29bPlan.status,
    ag29c_status: records.ag29cPlan.status,
    ag29d_status: records.ag29dAudit.status,
    ag28_status: records.ag28Blueprint.status,
    ag27z_status: records.ag27zClosure.status,
    schema_entities: records.ag29aEntityRegister.entity_count,
    table_rls_groups: records.ag29bTableRuleMap.table_policy_groups.length,
    secret_boundaries: records.ag29cSecretBoundary.boundary_count,
    all_ag29d_audits_passed: records.ag29dAudit.audit_decision?.all_audits_passed === true
  },
  closure_decision: {
    ag29_detailed_chain_closed: true,
    non_active_schema_rls_security_planning_closed: true,
    schema_draft_closed: true,
    rls_policy_plan_closed: true,
    secret_governance_plan_closed: true,
    schema_rls_security_audit_closed: true,
    ag30_ready_for_non_active_login_route_scaffold: true,
    backend_activation_approved: false,
    supabase_activation_approved: false,
    auth_activation_approved: false,
    sql_generation_approved: false,
    migration_generation_approved: false,
    database_creation_approved: false,
    rls_policy_creation_approved: false,
    rls_policy_application_approved: false,
    secret_creation_approved: false,
    env_var_write_approved: false,
    server_route_creation_approved: false,
    api_route_creation_approved: false,
    deployment_approved: false,
    public_mutation_approved: false
  },
  source_chain_file: outputs.sourceChain,
  planning_closure_file: outputs.planningClosure,
  activation_blocker_file: outputs.activationBlocker,
  ag30_handoff_file: outputs.ag30Handoff,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG29Z",
  title: "Schema/RLS Closure Blocker Register",
  status: "schema_rls_closure_runtime_operations_blocked",
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
    "No service role key creation.",
    "No service role usage.",
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
  module_id: "AG29Z",
  title: "AG30 Login/Route Scaffold Readiness Record",
  status: "ready_for_ag30_non_active_login_route_scaffold",
  ready_for_ag30: true,
  next_stage_id: "AG30",
  next_stage_title: "Admin/Editor Login UI and Route Scaffold",
  allowed_ag30_mode: "non_active_login_route_scaffold_only",
  ag29_detailed_chain_closed: true,
  schema_rls_security_planning_closed: true,
  real_execution_allowed_now: false,
  backend_activation_allowed_now: false,
  supabase_auth_backend_activation_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG29Z",
  title: "AG29Z to AG30 Login/Route Scaffold Boundary",
  status: "ag30_boundary_created_non_active_login_route_scaffold_only",
  next_stage_id: "AG30",
  next_stage_title: "Admin/Editor Login UI and Route Scaffold",
  allowed_scope: ag30Handoff.ag30_allowed_scope,
  blocked_scope: ag30Handoff.ag30_blocked_scope,
  backend_planning_selected: true,
  backend_activation_deferred: true,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_real_activation: true
};

const review = {
  module_id: "AG29Z",
  title: "Schema/RLS Closure",
  status: "schema_rls_closure_created_ready_for_ag30",
  depends_on: ["AG29A", "AG29B", "AG29C", "AG29D", "AG28", "AG27Z", "AG26Z"],
  generated_from: inputs,
  closure_file: outputs.closure,
  source_chain_file: outputs.sourceChain,
  planning_closure_file: outputs.planningClosure,
  activation_blocker_file: outputs.activationBlocker,
  ag30_handoff_file: outputs.ag30Handoff,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    schema_rls_closure_created: true,
    ag29_detailed_chain_closed: true,
    detailed_stages_closed: 4,
    non_active_schema_rls_security_planning_closed: true,
    ready_for_ag30: true,
    backend_activation_allowed_now: false,
    supabase_activation_allowed_now: false,
    auth_activation_allowed_now: false,
    sql_generation_allowed_now: false,
    migration_generation_allowed_now: false,
    database_creation_allowed_now: false,
    rls_policy_creation_allowed_now: false,
    rls_policy_application_allowed_now: false,
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
  module_id: "AG29Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG29Z",
  preview_only: true,
  status: review.status,
  message: "AG29Z Schema/RLS Closure created. Next: AG30 Admin/Editor Login UI and Route Scaffold.",
  ag29_detailed_chain_closed: 1,
  non_active_schema_rls_security_planning_closed: 1,
  ready_for_ag30: 1,
  backend_activation_allowed: 0,
  supabase_activation_allowed: 0,
  auth_enabled: 0,
  sql_generated: 0,
  migrations_generated: 0,
  database_objects_created: 0,
  rls_policies_created: 0,
  rls_policies_applied: 0,
  secrets_created: 0,
  env_vars_written: 0,
  server_routes_created: 0,
  api_routes_created: 0,
  deployment_done: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG29Z — Schema/RLS Closure

## Purpose

AG29Z closes the detailed AG29 schema/RLS/security planning chain.

## Closed Chain

- AG29A — Supabase Schema Draft.
- AG29B — RLS Policy Plan.
- AG29C — Secret Governance Plan.
- AG29D — Schema/RLS Security Audit.

## Closure Decision

AG29 is closed as non-active schema/RLS/security planning.

Drishvara is ready for AG30 — Admin/Editor Login UI and Route Scaffold — in non-active scaffold mode only.

## Still Blocked

- Supabase project creation or connection.
- SQL or migration generation.
- Database table, constraint or index creation.
- RLS policy creation or application.
- Auth activation.
- Admin/Editor login creation.
- Secrets or environment variables.
- Service role key creation or usage.
- Server/API runtime routes.
- Deployment.
- Publishing.
- Public mutation.

## Governance Preserved

Admin remains final clearance authority. Editor works only on Admin-assigned items and cannot publish.

## Next Stage

AG30 — Admin/Editor Login UI and Route Scaffold — non-active scaffold only.
`;

writeJson(outputs.review, review);
writeJson(outputs.closure, closure);
writeJson(outputs.sourceChain, sourceChain);
writeJson(outputs.planningClosure, planningClosure);
writeJson(outputs.activationBlocker, activationBlocker);
writeJson(outputs.ag30Handoff, ag30Handoff);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG29Z Schema/RLS Closure generated.");
console.log("✅ AG29A-AG29D detailed schema/RLS/security chain closed.");
console.log("✅ AG30 non-active Admin/Editor Login UI and Route Scaffold boundary created.");
console.log("✅ No Supabase/Auth/backend activation, SQL, database, RLS, secrets, routes, deployment or public mutation performed.");
