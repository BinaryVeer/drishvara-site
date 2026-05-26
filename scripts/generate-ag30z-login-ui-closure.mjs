import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag30aReview: "data/content-intelligence/quality-reviews/ag30a-admin-login-ui-scaffold.json",
  ag30aScaffold: "data/content-intelligence/backend-architecture/ag30a-admin-login-ui-scaffold.json",
  ag30aInterfaceModel: "data/content-intelligence/backend-architecture/ag30a-admin-login-interface-model.json",
  ag30aRoutePreview: "data/content-intelligence/backend-architecture/ag30a-admin-login-route-preview.json",
  ag30aNonAuthBehaviour: "data/content-intelligence/backend-architecture/ag30a-non-auth-ui-behaviour-model.json",

  ag30bReview: "data/content-intelligence/quality-reviews/ag30b-editor-login-ui-scaffold.json",
  ag30bScaffold: "data/content-intelligence/backend-architecture/ag30b-editor-login-ui-scaffold.json",
  ag30bInterfaceModel: "data/content-intelligence/backend-architecture/ag30b-editor-login-interface-model.json",
  ag30bRoutePreview: "data/content-intelligence/backend-architecture/ag30b-editor-login-route-preview.json",
  ag30bAssignedOnlyModel: "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  ag30bNonAuthBehaviour: "data/content-intelligence/backend-architecture/ag30b-non-auth-ui-behaviour-model.json",

  ag30cReview: "data/content-intelligence/quality-reviews/ag30c-protected-route-scaffold.json",
  ag30cScaffold: "data/content-intelligence/backend-architecture/ag30c-protected-route-scaffold.json",
  ag30cProtectedRouteMap: "data/content-intelligence/backend-architecture/ag30c-protected-route-map.json",
  ag30cGuardPlaceholder: "data/content-intelligence/backend-architecture/ag30c-route-guard-placeholder-model.json",
  ag30cSurfaceRegister: "data/content-intelligence/backend-architecture/ag30c-route-surface-scaffold-register.json",
  ag30cNonAuthRouteAudit: "data/content-intelligence/backend-architecture/ag30c-non-auth-route-audit-register.json",

  ag30dReview: "data/content-intelligence/quality-reviews/ag30d-login-ui-audit.json",
  ag30dAudit: "data/content-intelligence/backend-architecture/ag30d-login-ui-audit.json",
  ag30dPageVisibilityAudit: "data/content-intelligence/backend-architecture/ag30d-page-visibility-audit-register.json",
  ag30dNoAuthAudit: "data/content-intelligence/backend-architecture/ag30d-no-auth-activation-audit-register.json",
  ag30dRouteAudit: "data/content-intelligence/backend-architecture/ag30d-route-scaffold-audit-register.json",
  ag30dGovernanceAudit: "data/content-intelligence/backend-architecture/ag30d-governance-notice-audit-register.json",
  ag30dReadiness: "data/content-intelligence/quality-registry/ag30d-login-ui-closure-readiness-record.json",
  ag30dBoundary: "data/content-intelligence/mutation-plans/ag30d-to-ag30z-login-ui-closure-boundary.json",

  ag29zClosure: "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  ag29zActivationBlocker: "data/content-intelligence/backend-architecture/ag29z-activation-blocker-carry-forward.json",
  ag29aStateFieldModel: "data/content-intelligence/backend-architecture/ag29a-state-field-model.json",
  ag29bRoleScope: "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",

  ag28AuthSessionModel: "data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const pageFiles = [
  "admin/login.html",
  "editor/login.html",
  "admin/index.html",
  "admin/review.html",
  "editor/index.html",
  "editor/workspace.html"
];

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag30z-login-ui-closure.json",
  closure: "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  sourceChain: "data/content-intelligence/backend-architecture/ag30z-ag30-source-chain-register.json",
  closureRegister: "data/content-intelligence/backend-architecture/ag30z-non-active-login-route-scaffold-closure-register.json",
  activationBlocker: "data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json",
  ag31Handoff: "data/content-intelligence/backend-architecture/ag30z-ag31-queue-state-handoff-plan.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag30z-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag30z-login-ui-closure-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag30z-ag31-queue-state-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag30z-to-ag31-queue-state-integration-boundary.json",
  registry: "data/quality/ag30z-login-ui-closure.json",
  preview: "data/quality/ag30z-login-ui-closure-preview.json",
  doc: "docs/quality/AG30Z_LOGIN_UI_CLOSURE.md"
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
  if (!exists(p)) throw new Error(`Missing AG30Z input: ${p}`);
}
for (const p of pageFiles) {
  if (!exists(p)) throw new Error(`Missing AG30Z page input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag30aScaffold.status !== "admin_login_ui_scaffold_created_ready_for_ag30b") throw new Error("AG30A status mismatch.");
if (records.ag30bScaffold.status !== "editor_login_ui_scaffold_created_ready_for_ag30c") throw new Error("AG30B status mismatch.");
if (records.ag30cScaffold.status !== "protected_route_scaffold_created_ready_for_ag30d") throw new Error("AG30C status mismatch.");
if (records.ag30dAudit.status !== "login_ui_audit_created_ready_for_ag30z") throw new Error("AG30D status mismatch.");
if (records.ag30dReadiness.ready_for_ag30z !== true) throw new Error("AG30D readiness does not permit AG30Z.");
if (records.ag30dReadiness.allowed_ag30z_mode !== "non_active_login_ui_closure_only") throw new Error("AG30Z mode mismatch.");
if (records.ag30dBoundary.next_stage_id !== "AG30Z") throw new Error("AG30D boundary does not point to AG30Z.");

if (records.ag30dAudit.audit_decision?.all_audits_passed !== true) throw new Error("AG30D all audits must pass.");
if (records.ag30dPageVisibilityAudit.audit_passed !== true) throw new Error("AG30D page visibility audit must pass.");
if (records.ag30dNoAuthAudit.audit_passed !== true) throw new Error("AG30D no-auth audit must pass.");
if (records.ag30dRouteAudit.audit_passed !== true) throw new Error("AG30D route audit must pass.");
if (records.ag30dGovernanceAudit.audit_passed !== true) throw new Error("AG30D governance audit must pass.");

if (records.ag29zClosure.status !== "schema_rls_closure_created_ready_for_ag30") throw new Error("AG29Z closure status mismatch.");
for (const [key, value] of Object.entries(records.ag29zActivationBlocker.blocked_activation_items || {})) {
  if (value !== false) throw new Error(`AG29Z activation blocker must remain false: ${key}`);
}
if (records.ag28AuthSessionModel.auth_enabled_now !== false) throw new Error("AG28 Auth must remain disabled.");
if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) throw new Error("Admin final clearance missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("Editor assigned-only rule missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) throw new Error("Editor no-publish rule missing.");

const blockedState = {
  login_ui_closure_created: true,
  ag30_chain_closed: true,
  non_active_login_route_scaffold_closed: true,
  ag31_queue_state_planning_allowed: true,
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
  admin_review_runtime_created: false,
  editor_workspace_runtime_created: false,
  editor_assignment_runtime_created: false,
  queue_runtime_created: false,
  audit_runtime_created: false,
  article_state_runtime_created: false,
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

const sourceChain = {
  module_id: "AG30Z",
  title: "AG30 Source Chain Register",
  status: "ag30_source_chain_registered_for_closure",
  chain_length: 4,
  closed_chain: [
    {
      stage_id: "AG30A",
      title: "Admin Login UI Scaffold",
      status: records.ag30aScaffold.status,
      file: inputs.ag30aScaffold
    },
    {
      stage_id: "AG30B",
      title: "Editor Login UI Scaffold",
      status: records.ag30bScaffold.status,
      file: inputs.ag30bScaffold
    },
    {
      stage_id: "AG30C",
      title: "Protected Route Scaffold",
      status: records.ag30cScaffold.status,
      file: inputs.ag30cScaffold
    },
    {
      stage_id: "AG30D",
      title: "Login UI Audit",
      status: records.ag30dAudit.status,
      file: inputs.ag30dAudit
    }
  ],
  audited_pages: pageFiles,
  consumed_schema_rls_closure: inputs.ag29zClosure,
  blocked_state: blockedState
};

const closureRegister = {
  module_id: "AG30Z",
  title: "Non-Active Login/Route Scaffold Closure Register",
  status: "non_active_login_route_scaffold_closed_ready_for_ag31",
  closure_points: {
    admin_login_ui_scaffold_completed: true,
    editor_login_ui_scaffold_completed: true,
    protected_route_scaffold_completed: true,
    login_ui_audit_completed: true,
    page_visibility_audit_passed: true,
    no_auth_activation_audit_passed: true,
    route_scaffold_audit_passed: true,
    governance_notice_audit_passed: true,
    admin_final_clearance_preserved: true,
    editor_assigned_only_preserved: true,
    editor_no_publish_preserved: true,
    ag31_queue_state_planning_can_continue: true,
    real_activation_still_blocked: true
  },
  closed_static_pages: pageFiles,
  planned_counts: {
    login_pages: 2,
    protected_route_pages: 4,
    protected_routes: records.ag30cProtectedRouteMap.protected_route_count,
    audited_pages: records.ag30dReview.summary.audited_page_count
  },
  blocked_state: blockedState
};

const activationBlocker = {
  module_id: "AG30Z",
  title: "Activation Blocker Carry Forward",
  status: "login_ui_closure_activation_blockers_carried_forward",
  blocked_activation_items: {
    auth_activation_approved: false,
    real_admin_login_approved: false,
    real_editor_login_approved: false,
    credential_processing_approved: false,
    session_runtime_approved: false,
    route_guard_runtime_approved: false,
    assignment_query_approved: false,
    admin_review_runtime_approved: false,
    editor_workspace_runtime_approved: false,
    backend_connection_approved: false,
    supabase_connection_approved: false,
    sql_generation_approved: false,
    migration_generation_approved: false,
    database_creation_approved: false,
    rls_policy_application_approved: false,
    secret_creation_approved: false,
    env_var_write_approved: false,
    server_route_creation_approved: false,
    api_route_creation_approved: false,
    deployment_approved: false,
    public_mutation_approved: false
  },
  future_unlock_requirements: [
    "Explicit user approval.",
    "AG31-AG34 non-active backend queue/readiness planning closure.",
    "Supabase/Auth activation readiness review.",
    "Secret placement and RLS review.",
    "Test Admin and Editor user plan.",
    "Route guard dry-run.",
    "Audit and rollback readiness.",
    "No frontend service-role exposure."
  ],
  blocked_state: blockedState
};

const ag31Handoff = {
  module_id: "AG30Z",
  title: "AG31 Queue and Article State Handoff Plan",
  status: "ag31_queue_state_handoff_created",
  ag31_allowed_scope: [
    "Define article state model for backend queue planning.",
    "Define queue integration plan for Admin review and Editor assigned workflow.",
    "Define audit log model for state transitions.",
    "Define state transition audit rules.",
    "Preserve Admin final clearance.",
    "Preserve Editor assigned-only and no-publish governance.",
    "Keep all queue/database/backend actions non-active."
  ],
  ag31_source_inputs: [
    inputs.ag29aStateFieldModel,
    inputs.ag29bRoleScope,
    inputs.ag30bAssignedOnlyModel,
    inputs.ag30cProtectedRouteMap,
    inputs.ag30dAudit,
    outputs.closure
  ],
  ag31_blocked_scope: [
    "No database table creation.",
    "No queue runtime.",
    "No article state runtime.",
    "No assignment query.",
    "No Auth activation.",
    "No real Admin or Editor login.",
    "No server/API runtime.",
    "No secrets or env vars.",
    "No deployment.",
    "No public mutation."
  ],
  ag31_ready: true,
  ag31_activation_allowed: false,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG30Z",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag31_and_later",
  future_consumption: {
    AG31:
      "AG31 should consume AG30Z closure, AG30C route map, AG30B Editor assigned-only model, AG29A state fields and AG29B role scopes to plan backend queue/article state integration without runtime activation.",
    AG32:
      "AG32 dynamic publish action-handler planning should later consume AG31 queue/state records and AG30Z activation blockers.",
    AG33:
      "AG33 non-active dynamic publish scaffold should keep publish/action mutation guarded and disabled.",
    AG34_and_later:
      "Backend activation readiness should consume AG30Z closure and confirm all activation blockers before any controlled activation.",
    AG35_and_later:
      "Real Auth/login/route protection requires explicit approval, tested users, RLS review, secret placement review and rollback readiness."
  },
  blocked_state: blockedState
};

const closure = {
  module_id: "AG30Z",
  title: "Login UI Closure",
  status: "login_ui_closure_created_ready_for_ag31",
  purpose:
    "Close AG30A-AG30D as a completed non-active Admin/Editor login UI and route scaffold chain, ready for AG31 queue/state planning, while keeping Auth/backend/Supabase activation, credentials, sessions, route guards, database, secrets, deployment and public mutation blocked.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs).concat(pageFiles),
  consumed_source_summary: {
    ag30a_status: records.ag30aScaffold.status,
    ag30b_status: records.ag30bScaffold.status,
    ag30c_status: records.ag30cScaffold.status,
    ag30d_status: records.ag30dAudit.status,
    ag29z_status: records.ag29zClosure.status,
    audited_pages: pageFiles.length,
    all_ag30d_audits_passed: records.ag30dAudit.audit_decision?.all_audits_passed === true,
    admin_final_clearance_preserved: records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority === true,
    editor_assigned_only_preserved: records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items === true,
    editor_no_publish_preserved: records.ag26zRoleGovernance.role_rules?.editor_cannot_publish === true
  },
  closure_decision: {
    ag30_chain_closed: true,
    non_active_login_route_scaffold_closed: true,
    admin_login_ui_closed: true,
    editor_login_ui_closed: true,
    protected_route_scaffold_closed: true,
    login_ui_audit_closed: true,
    ag31_ready_for_queue_state_planning: true,
    auth_activation_approved: false,
    real_admin_login_approved: false,
    real_editor_login_approved: false,
    credential_processing_approved: false,
    session_runtime_approved: false,
    route_guard_runtime_approved: false,
    assignment_query_approved: false,
    backend_connection_approved: false,
    supabase_connection_approved: false,
    sql_generation_approved: false,
    migration_generation_approved: false,
    database_creation_approved: false,
    rls_policy_application_approved: false,
    secret_creation_approved: false,
    env_var_write_approved: false,
    server_route_creation_approved: false,
    api_route_creation_approved: false,
    deployment_approved: false,
    public_mutation_approved: false
  },
  source_chain_file: outputs.sourceChain,
  closure_register_file: outputs.closureRegister,
  activation_blocker_file: outputs.activationBlocker,
  ag31_handoff_file: outputs.ag31Handoff,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG30Z",
  title: "Login UI Closure Blocker Register",
  status: "login_ui_closure_runtime_operations_blocked",
  blocked_items: [
    "No real Auth activation.",
    "No real Admin login.",
    "No real Editor login.",
    "No credential processing.",
    "No credential storage.",
    "No session runtime.",
    "No route guard runtime.",
    "No assignment query.",
    "No Admin review runtime.",
    "No Editor workspace runtime.",
    "No queue runtime.",
    "No article state runtime.",
    "No Supabase project creation.",
    "No Supabase connection.",
    "No SQL generation.",
    "No migration generation.",
    "No database table creation.",
    "No RLS policy creation or application.",
    "No secrets creation.",
    "No environment variable write.",
    "No server/API route runtime.",
    "No dynamic publish runtime.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No public mutation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG30Z",
  title: "AG31 Queue/State Readiness Record",
  status: "ready_for_ag31_queue_state_integration",
  ready_for_ag31: true,
  next_stage_id: "AG31",
  next_stage_title: "Backend Queue and Article State Integration",
  allowed_ag31_mode: "non_active_queue_state_planning_only",
  ag30_chain_closed: true,
  login_route_scaffold_closed: true,
  real_execution_allowed_now: false,
  auth_activation_allowed_now: false,
  backend_activation_allowed_now: false,
  supabase_auth_backend_activation_allowed_now: false,
  queue_runtime_allowed_now: false,
  article_state_runtime_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG30Z",
  title: "AG30Z to AG31 Queue/State Integration Boundary",
  status: "ag31_boundary_created_non_active_queue_state_planning_only",
  next_stage_id: "AG31",
  next_stage_title: "Backend Queue and Article State Integration",
  allowed_scope: ag31Handoff.ag31_allowed_scope,
  blocked_scope: ag31Handoff.ag31_blocked_scope.concat(blocker.blocked_items),
  backend_planning_selected: true,
  backend_activation_deferred: true,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_real_activation: true
};

const review = {
  module_id: "AG30Z",
  title: "Login UI Closure",
  status: "login_ui_closure_created_ready_for_ag31",
  depends_on: ["AG30A", "AG30B", "AG30C", "AG30D", "AG29Z", "AG29A", "AG29B", "AG28", "AG26Z"],
  generated_from: inputs,
  audited_pages: pageFiles,
  closure_file: outputs.closure,
  source_chain_file: outputs.sourceChain,
  closure_register_file: outputs.closureRegister,
  activation_blocker_file: outputs.activationBlocker,
  ag31_handoff_file: outputs.ag31Handoff,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    login_ui_closure_created: true,
    ag30_chain_closed: true,
    detailed_stages_closed: 4,
    audited_page_count: pageFiles.length,
    non_active_login_route_scaffold_closed: true,
    ready_for_ag31: true,
    auth_activation_allowed_now: false,
    real_admin_login_allowed_now: false,
    real_editor_login_allowed_now: false,
    route_guard_runtime_allowed_now: false,
    session_runtime_allowed_now: false,
    credential_processing_allowed_now: false,
    assignment_query_allowed_now: false,
    queue_runtime_allowed_now: false,
    article_state_runtime_allowed_now: false,
    backend_connection_allowed_now: false,
    supabase_connection_allowed_now: false,
    sql_generation_allowed_now: false,
    migration_generation_allowed_now: false,
    database_creation_allowed_now: false,
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
  module_id: "AG30Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG30Z",
  preview_only: true,
  status: review.status,
  message: "AG30Z Login UI Closure created. Next: AG31 Backend Queue and Article State Integration.",
  ag30_chain_closed: 1,
  audited_page_count: pageFiles.length,
  non_active_login_route_scaffold_closed: 1,
  ready_for_ag31: 1,
  auth_enabled: 0,
  real_admin_login_created: 0,
  real_editor_login_created: 0,
  route_guard_runtime_created: 0,
  session_runtime_created: 0,
  credential_processing_enabled: 0,
  assignment_query_created: 0,
  queue_runtime_created: 0,
  article_state_runtime_created: 0,
  backend_connection_enabled: 0,
  supabase_connection_enabled: 0,
  sql_generated: 0,
  migrations_generated: 0,
  database_objects_created: 0,
  rls_policies_applied: 0,
  secrets_created: 0,
  env_vars_written: 0,
  server_routes_created: 0,
  api_routes_created: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  blocked_state: blockedState
};

const doc = `# AG30Z — Login UI Closure

## Purpose

AG30Z closes the detailed AG30 Admin/Editor login UI and route scaffold chain.

## Closed Chain

- AG30A — Admin Login UI Scaffold.
- AG30B — Editor Login UI Scaffold.
- AG30C — Protected Route Scaffold.
- AG30D — Login UI Audit.

## Audited Pages

- \`admin/login.html\`
- \`editor/login.html\`
- \`admin/index.html\`
- \`admin/review.html\`
- \`editor/index.html\`
- \`editor/workspace.html\`

## Closure Decision

AG30 is closed as non-active login UI and route scaffold planning.

Drishvara is ready for AG31 — Backend Queue and Article State Integration — in non-active queue/state planning mode only.

## Still Blocked

- Real Auth activation.
- Real Admin/Editor login.
- Credential processing and session runtime.
- Route guard runtime.
- Assignment query.
- Queue runtime and article-state runtime.
- Supabase/backend connection.
- SQL, migrations, database and RLS policy application.
- Secrets and environment variables.
- Server/API runtime.
- Deployment.
- Publishing and public mutation.

## Governance Preserved

Admin remains final clearance authority. Editor works only on Admin-assigned items and cannot publish.

## Next Stage

AG31 — Backend Queue and Article State Integration — non-active planning only.
`;

writeJson(outputs.review, review);
writeJson(outputs.closure, closure);
writeJson(outputs.sourceChain, sourceChain);
writeJson(outputs.closureRegister, closureRegister);
writeJson(outputs.activationBlocker, activationBlocker);
writeJson(outputs.ag31Handoff, ag31Handoff);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG30Z Login UI Closure generated.");
console.log("✅ AG30A-AG30D non-active login/route scaffold chain closed.");
console.log("✅ AG31 non-active queue/state integration boundary created.");
console.log("✅ No Auth/backend/Supabase activation, credentials, sessions, route guards, queue runtime, secrets, deployment or public mutation performed.");
