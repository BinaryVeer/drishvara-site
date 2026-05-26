import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag34bReview: "data/content-intelligence/quality-reviews/ag34b-environment-secret-readiness.json",
  ag34bReadinessPlan: "data/content-intelligence/backend-architecture/ag34b-environment-secret-readiness.json",
  ag34bEnvPlacementPlan: "data/content-intelligence/backend-architecture/ag34b-env-var-placement-plan.json",
  ag34bSecretNamingPlan: "data/content-intelligence/backend-architecture/ag34b-secret-naming-readiness-plan.json",
  ag34bServiceRoleProtectionPlan: "data/content-intelligence/backend-architecture/ag34b-service-role-protection-plan.json",
  ag34bLocalVercelReadinessPlan: "data/content-intelligence/backend-architecture/ag34b-local-vercel-env-readiness-plan.json",
  ag34bNonActivationAudit: "data/content-intelligence/backend-architecture/ag34b-secret-readiness-non-activation-audit-register.json",
  ag34bReadiness: "data/content-intelligence/quality-registry/ag34b-test-user-role-plan-readiness-record.json",
  ag34bBoundary: "data/content-intelligence/mutation-plans/ag34b-to-ag34c-test-user-role-plan-boundary.json",

  ag34aChecklist: "data/content-intelligence/backend-architecture/ag34a-backend-activation-readiness-checklist.json",
  ag34aAuthMethodChecklist: "data/content-intelligence/backend-architecture/ag34a-auth-method-readiness-checklist.json",
  ag34aRlsRollbackTestUserChecklist: "data/content-intelligence/backend-architecture/ag34a-rls-rollback-test-user-readiness-checklist.json",

  ag33zClosure: "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  ag33zActivationBlocker: "data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json",
  ag32zActivationBlocker: "data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json",

  ag30bAssignedOnlyModel: "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  ag30zClosure: "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  ag29zClosure: "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  ag28Closure: "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag34c-test-user-role-plan.json",
  plan: "data/content-intelligence/backend-architecture/ag34c-test-user-role-plan.json",
  testAdminPlan: "data/content-intelligence/backend-architecture/ag34c-test-admin-user-plan.json",
  testEditorPlan: "data/content-intelligence/backend-architecture/ag34c-test-editor-user-plan.json",
  roleRestrictionPlan: "data/content-intelligence/backend-architecture/ag34c-role-restriction-test-plan.json",
  loginTestBoundaryPlan: "data/content-intelligence/backend-architecture/ag34c-login-test-boundary-plan.json",
  nonActivationAudit: "data/content-intelligence/backend-architecture/ag34c-test-user-role-plan-non-activation-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag34c-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag34c-test-user-role-plan-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag34c-backend-readiness-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag34c-to-ag34d-backend-readiness-audit-boundary.json",
  registry: "data/quality/ag34c-test-user-role-plan.json",
  preview: "data/quality/ag34c-test-user-role-plan-preview.json",
  doc: "docs/quality/AG34C_TEST_USER_ROLE_PLAN.md"
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
  if (!exists(p)) throw new Error(`Missing AG34C input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([key, file]) => [key, readJson(file)]));

if (records.ag34bReadinessPlan.status !== "environment_secret_readiness_created_ready_for_ag34c") throw new Error("AG34B readiness plan status mismatch.");
if (records.ag34bReadiness.ready_for_ag34c !== true) throw new Error("AG34B readiness does not permit AG34C.");
if (records.ag34bReadiness.allowed_ag34c_mode !== "test_user_role_plan_only") throw new Error("AG34C mode mismatch.");
if (records.ag34bBoundary.next_stage_id !== "AG34C") throw new Error("AG34B boundary does not point to AG34C.");
if (records.ag34bNonActivationAudit.audit_passed !== true) throw new Error("AG34B non-activation audit must pass.");

if (records.ag34aChecklist.status !== "backend_activation_readiness_checklist_created_ready_for_ag34b") throw new Error("AG34A checklist status mismatch.");
if (records.ag33zClosure.status !== "dynamic_publish_scaffold_closure_created_ready_for_ag34a") throw new Error("AG33Z closure status mismatch.");

for (const [key, value] of Object.entries(records.ag33zActivationBlocker.blocked_activation_items || {})) {
  if (value !== false) throw new Error(`AG33Z activation blocker must remain false: ${key}`);
}

for (const [key, value] of Object.entries(records.ag32zActivationBlocker.blocked_activation_items || {})) {
  if (value !== false) throw new Error(`AG32Z activation blocker must remain false: ${key}`);
}

if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) throw new Error("Admin final clearance missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("Editor assigned-only rule missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) throw new Error("Editor no-publish rule missing.");

const blockedState = {
  test_user_role_plan_created: true,
  test_admin_user_plan_created: true,
  test_editor_user_plan_created: true,
  role_restriction_test_plan_created: true,
  login_test_boundary_plan_created: true,
  test_user_role_non_activation_audit_created: true,

  supabase_project_created: false,
  supabase_connected: false,
  auth_enabled: false,
  real_admin_login_created: false,
  real_editor_login_created: false,
  test_admin_created: false,
  test_editor_created: false,
  test_user_invitation_sent: false,
  test_user_password_created: false,
  runtime_backend_created: false,
  database_table_created: false,
  database_constraint_created: false,
  database_index_created: false,
  database_write_done: false,
  sql_generated: false,
  sql_applied: false,
  migration_generated: false,
  migration_applied: false,
  rls_policy_created: false,
  rls_policy_applied: false,
  secrets_created: false,
  env_vars_written: false,
  env_file_created: false,
  env_file_modified: false,
  service_role_key_created: false,
  service_role_key_stored: false,
  service_role_key_exposed: false,
  server_route_created: false,
  api_route_created: false,
  route_guard_runtime_created: false,
  session_runtime_created: false,
  credential_processing_created: false,
  assignment_query_created: false,
  queue_runtime_created: false,
  queue_mutation_runtime_created: false,
  article_state_runtime_created: false,
  state_transition_runtime_created: false,
  audit_runtime_created: false,
  audit_write_runtime_created: false,
  hash_runtime_created: false,
  rollback_runtime_created: false,
  publish_guard_runtime_created: false,
  publish_handler_runtime_created: false,
  return_handler_runtime_created: false,
  archive_handler_runtime_created: false,
  public_filter_runtime_created: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false,
  public_mutation_done: false,
  supabase_auth_backend_activated: false
};

const testAdminPlan = {
  module_id: "AG34C",
  title: "Test Admin User Plan",
  status: "test_admin_user_plan_created_no_account",
  planning_mode: "role_plan_only",
  future_role: "admin",
  future_test_identity: {
    email_required_later: true,
    email_recorded_now: false,
    password_recorded_now: false,
    user_created_now: false,
    invitation_sent_now: false
  },
  future_permissions_to_test: [
    "Admin can view review queue.",
    "Admin can review submitted articles.",
    "Admin can return article to assigned Editor.",
    "Admin can approve article for publish.",
    "Admin can archive article.",
    "Admin has final clearance authority."
  ],
  account_created: false,
  auth_enabled: false,
  credential_processing_created: false,
  database_write_done: false,
  blocked_state: blockedState
};

const testEditorPlan = {
  module_id: "AG34C",
  title: "Test Editor User Plan",
  status: "test_editor_user_plan_created_no_account",
  planning_mode: "role_plan_only",
  future_role: "editor",
  future_test_identity: {
    email_required_later: true,
    email_recorded_now: false,
    password_recorded_now: false,
    user_created_now: false,
    invitation_sent_now: false
  },
  future_permissions_to_test: [
    "Editor can see only Admin-assigned articles.",
    "Editor can edit assigned article draft content.",
    "Editor can submit edited article back to Admin.",
    "Editor can see returned assigned items.",
    "Editor cannot publish.",
    "Editor cannot archive.",
    "Editor cannot self-assign.",
    "Editor cannot browse global queue."
  ],
  account_created: false,
  auth_enabled: false,
  credential_processing_created: false,
  database_write_done: false,
  blocked_state: blockedState
};

const roleRestrictionPlan = {
  module_id: "AG34C",
  title: "Role Restriction Test Plan",
  status: "role_restriction_test_plan_created_no_runtime",
  planning_mode: "restriction_test_plan_only",
  restriction_tests: [
    {
      test_id: "admin_final_clearance",
      expected_result: "Admin can perform final approval gate.",
      execute_now: false
    },
    {
      test_id: "editor_assigned_only_access",
      expected_result: "Editor sees only Admin-assigned article records.",
      execute_now: false
    },
    {
      test_id: "editor_no_publish",
      expected_result: "Editor cannot publish or approve final publication.",
      execute_now: false
    },
    {
      test_id: "editor_no_archive",
      expected_result: "Editor cannot archive article records.",
      execute_now: false
    },
    {
      test_id: "editor_no_global_queue",
      expected_result: "Editor cannot browse all submitted/review/published records.",
      execute_now: false
    },
    {
      test_id: "public_no_private_queue_access",
      expected_result: "Unauthenticated/public users cannot access Admin/Editor queues or audit data.",
      execute_now: false
    }
  ],
  rls_policy_created: false,
  rls_policy_applied: false,
  route_guard_runtime_created: false,
  assignment_query_created: false,
  database_write_done: false,
  blocked_state: blockedState
};

const loginTestBoundaryPlan = {
  module_id: "AG34C",
  title: "Login Test Boundary Plan",
  status: "login_test_boundary_plan_created_no_login",
  planning_mode: "login_test_plan_only",
  later_test_sequence: [
    "Create test Admin user after explicit activation approval.",
    "Create test Editor user after explicit activation approval.",
    "Verify Admin login.",
    "Verify Editor login.",
    "Verify Editor assigned-only restriction.",
    "Verify Editor no-publish/no-archive restriction.",
    "Verify public cannot access private queue/audit views.",
    "Record login security audit before any public dynamic publish."
  ],
  login_created_now: false,
  auth_enabled: false,
  session_runtime_created: false,
  credential_processing_created: false,
  test_admin_created: false,
  test_editor_created: false,
  blocked_state: blockedState
};

const nonActivationAudit = {
  module_id: "AG34C",
  title: "Test User Role Plan Non-Activation Audit Register",
  status: "test_user_role_plan_non_activation_audit_passed",
  checks: [
    { check_id: "planning_only", passed: true, evidence: "AG34C creates test-user and role planning records only." },
    { check_id: "no_test_user_creation", passed: true, evidence: "No Admin/Editor test users are created." },
    { check_id: "no_credentials", passed: true, evidence: "No email, password, invite or credential is generated or stored." },
    { check_id: "no_auth_activation", passed: true, evidence: "No Auth, session or credential processing runtime is created." },
    { check_id: "no_rls_or_database_apply", passed: true, evidence: "No RLS, SQL, migration, table or database write occurs." },
    { check_id: "no_env_or_secret_write", passed: true, evidence: "No secrets or environment variables are written." },
    { check_id: "no_server_or_api_route", passed: true, evidence: "No server/API route or route guard is created." },
    { check_id: "no_public_mutation", passed: true, evidence: "No GitHub write, deployment, publishing or public mutation is performed." },
    { check_id: "admin_editor_governance_preserved", passed: true, evidence: "Admin final clearance and Editor assigned-only/no-publish governance remain preserved." }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG34C",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag34d",
  future_consumption: {
    AG34D:
      "AG34D should consume AG34A, AG34B and AG34C to audit backend readiness while keeping activation blocked.",
    AG34Z:
      "AG34Z should close backend activation readiness planning before AG35 explicit activation approval.",
    AG35A:
      "AG35A must stop for explicit user approval before any Supabase/Auth/backend/database/secrets action.",
    AG36:
      "AG36 login tests should later consume the AG34C test-user and role plan after real activation is approved and completed."
  },
  blocked_state: blockedState
};

const plan = {
  module_id: "AG34C",
  title: "Test User and Role Plan",
  status: "test_user_role_plan_created_ready_for_ag34d",
  purpose:
    "Plan future test Admin and Editor users and role-restriction verification without creating accounts, enabling Auth, applying RLS, writing database records, generating credentials, or activating backend runtime.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag34b_status: records.ag34bReadinessPlan.status,
    ag34a_status: records.ag34aChecklist.status,
    ag33z_status: records.ag33zClosure.status,
    ag30z_status: records.ag30zClosure.status,
    ag29z_status: records.ag29zClosure.status,
    admin_final_clearance_preserved: true,
    editor_assigned_only_preserved: true,
    editor_no_publish_preserved: true
  },
  plan_decision: {
    test_user_role_plan_created: true,
    test_admin_user_plan_created: true,
    test_editor_user_plan_created: true,
    role_restriction_test_plan_created: true,
    login_test_boundary_plan_created: true,
    non_activation_audit_created: true,
    proceed_to_ag34d_backend_readiness_audit: true,

    test_admin_creation_approved_now: false,
    test_editor_creation_approved_now: false,
    real_user_creation_approved_now: false,
    auth_activation_approved_now: false,
    credential_generation_approved_now: false,
    invitation_send_approved_now: false,
    database_creation_approved_now: false,
    database_write_approved_now: false,
    sql_generation_approved_now: false,
    migration_generation_approved_now: false,
    rls_policy_creation_approved_now: false,
    rls_policy_application_approved_now: false,
    secret_creation_approved_now: false,
    env_var_write_approved_now: false,
    server_route_creation_approved_now: false,
    api_route_creation_approved_now: false,
    route_guard_runtime_approved_now: false,
    assignment_query_approved_now: false,
    handler_runtime_approved_now: false,
    queue_runtime_approved_now: false,
    audit_runtime_approved_now: false,
    github_write_approved_now: false,
    deployment_approved_now: false,
    public_mutation_approved_now: false
  },
  test_admin_user_plan_file: outputs.testAdminPlan,
  test_editor_user_plan_file: outputs.testEditorPlan,
  role_restriction_test_plan_file: outputs.roleRestrictionPlan,
  login_test_boundary_plan_file: outputs.loginTestBoundaryPlan,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG34C",
  title: "Test User Role Plan Blocker Register",
  status: "test_user_role_plan_operations_blocked_pending_ag34d",
  blocked_items: [
    "No test Admin user creation.",
    "No test Editor user creation.",
    "No real Admin/Editor user creation.",
    "No credential generation.",
    "No invitation email.",
    "No Auth activation.",
    "No session runtime.",
    "No database table creation.",
    "No database write.",
    "No SQL generation or application.",
    "No migration generation or application.",
    "No RLS policy creation or application.",
    "No secret creation.",
    "No environment variable write.",
    "No server/API route runtime.",
    "No route guard runtime.",
    "No assignment query runtime.",
    "No handler, queue, audit or rollback runtime.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No public mutation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG34C",
  title: "Backend Readiness Audit Readiness Record",
  status: "ready_for_ag34d_backend_readiness_audit",
  ready_for_ag34d: true,
  next_stage_id: "AG34D",
  next_stage_title: "Backend Readiness Audit",
  allowed_ag34d_mode: "backend_readiness_audit_only",
  test_user_role_plan_created: true,
  real_execution_allowed_now: false,
  test_user_creation_allowed_now: false,
  auth_activation_allowed_now: false,
  database_creation_allowed_now: false,
  database_write_allowed_now: false,
  rls_application_allowed_now: false,
  secret_write_allowed_now: false,
  env_var_write_allowed_now: false,
  backend_activation_allowed_now: false,
  supabase_auth_backend_activation_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG34C",
  title: "AG34C to AG34D Backend Readiness Audit Boundary",
  status: "ag34d_boundary_created_backend_readiness_audit_only",
  next_stage_id: "AG34D",
  next_stage_title: "Backend Readiness Audit",
  allowed_scope: [
    "Consume AG34A backend activation readiness checklist.",
    "Consume AG34B environment secret readiness.",
    "Consume AG34C test user and role plan.",
    "Audit backend readiness while keeping all activation blocked.",
    "Prepare AG34Z readiness closure boundary."
  ],
  blocked_scope: blocker.blocked_items,
  backend_planning_selected: true,
  backend_activation_deferred: true,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_real_activation: true
};

const review = {
  module_id: "AG34C",
  title: "Test User and Role Plan",
  status: "test_user_role_plan_created_ready_for_ag34d",
  depends_on: ["AG34B", "AG34A", "AG33Z", "AG30Z", "AG29Z", "AG28", "AG26Z"],
  generated_from: inputs,
  plan_file: outputs.plan,
  test_admin_user_plan_file: outputs.testAdminPlan,
  test_editor_user_plan_file: outputs.testEditorPlan,
  role_restriction_test_plan_file: outputs.roleRestrictionPlan,
  login_test_boundary_plan_file: outputs.loginTestBoundaryPlan,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    test_user_role_plan_created: true,
    test_admin_user_plan_created: true,
    test_editor_user_plan_created: true,
    role_restriction_test_plan_created: true,
    login_test_boundary_plan_created: true,
    non_activation_audit_passed: true,
    ready_for_ag34d: true,

    supabase_project_created: false,
    supabase_connected: false,
    auth_enabled: false,
    real_user_created: false,
    test_user_created: false,
    test_invitation_sent: false,
    credential_created: false,
    database_created: false,
    database_write_done: false,
    sql_generated: false,
    sql_applied: false,
    migration_generated: false,
    migration_applied: false,
    rls_policy_created: false,
    rls_policy_applied: false,
    secrets_created: false,
    env_vars_written: false,
    server_routes_created: false,
    api_routes_created: false,
    route_guard_runtime_created: false,
    assignment_query_created: false,
    handler_runtime_created: false,
    queue_runtime_created: false,
    audit_runtime_created: false,
    rollback_runtime_created: false,
    github_write_done: false,
    deployment_done: false,
    public_mutation_done: false,
    real_execution_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG34C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG34C",
  preview_only: true,
  status: review.status,
  message: "AG34C Test User and Role Plan created. Next: AG34D Backend Readiness Audit.",
  test_user_role_plan_created: 1,
  test_admin_user_plan_created: 1,
  test_editor_user_plan_created: 1,
  role_restriction_test_plan_created: 1,
  login_test_boundary_plan_created: 1,
  supabase_project_created: 0,
  supabase_connected: 0,
  auth_enabled: 0,
  real_user_created: 0,
  test_user_created: 0,
  credential_created: 0,
  database_objects_created: 0,
  database_write_done: 0,
  sql_generated: 0,
  sql_applied: 0,
  migrations_generated: 0,
  migrations_applied: 0,
  rls_policies_created: 0,
  rls_policies_applied: 0,
  secrets_created: 0,
  env_vars_written: 0,
  server_routes_created: 0,
  api_routes_created: 0,
  route_guard_runtime_created: 0,
  assignment_query_created: 0,
  handler_runtime_created: 0,
  queue_runtime_created: 0,
  audit_runtime_created: 0,
  rollback_runtime_created: 0,
  github_write_done: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  blocked_state: blockedState
};

const doc = `# AG34C — Test User and Role Plan

## Purpose

AG34C plans future test Admin and Editor users and role-restriction verification.

This stage is planning-only.

## Planning Records Created

- Test Admin user plan.
- Test Editor user plan.
- Role restriction test plan.
- Login test boundary plan.
- Test user role non-activation audit register.
- Future consumption plan for AG34D.

## Important Boundary

AG34C does not create any account or credential.

No Supabase connection, Auth activation, user creation, invite, credential, database write, SQL, migration, RLS policy, secret, environment variable, server/API route, route guard, assignment query, handler runtime, GitHub write, deployment, publishing or public mutation is created.

## Next Stage

AG34D — Backend Readiness Audit.
`;

writeJson(outputs.review, review);
writeJson(outputs.plan, plan);
writeJson(outputs.testAdminPlan, testAdminPlan);
writeJson(outputs.testEditorPlan, testEditorPlan);
writeJson(outputs.roleRestrictionPlan, roleRestrictionPlan);
writeJson(outputs.loginTestBoundaryPlan, loginTestBoundaryPlan);
writeJson(outputs.nonActivationAudit, nonActivationAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG34C Test User and Role Plan generated.");
console.log("✅ Test Admin, Test Editor, role restriction and login boundary plans created.");
console.log("✅ No account, credential, Auth/backend activation, database, RLS, secrets, deployment or public mutation performed.");
console.log("✅ AG34D Backend Readiness Audit boundary created.");
