import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function fail(msg) {
  console.error(`❌ AG34C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag34b-environment-secret-readiness.json",
  "data/content-intelligence/backend-architecture/ag34b-env-var-placement-plan.json",
  "data/content-intelligence/backend-architecture/ag34b-secret-naming-readiness-plan.json",
  "data/content-intelligence/backend-architecture/ag34b-service-role-protection-plan.json",
  "data/content-intelligence/backend-architecture/ag34b-local-vercel-env-readiness-plan.json",
  "data/content-intelligence/backend-architecture/ag34b-secret-readiness-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag34b-test-user-role-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag34b-to-ag34c-test-user-role-plan-boundary.json",
  "data/content-intelligence/backend-architecture/ag34a-backend-activation-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-auth-method-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-rls-rollback-test-user-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  "data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag34c-test-user-role-plan.json",
  "data/content-intelligence/backend-architecture/ag34c-test-user-role-plan.json",
  "data/content-intelligence/backend-architecture/ag34c-test-admin-user-plan.json",
  "data/content-intelligence/backend-architecture/ag34c-test-editor-user-plan.json",
  "data/content-intelligence/backend-architecture/ag34c-role-restriction-test-plan.json",
  "data/content-intelligence/backend-architecture/ag34c-login-test-boundary-plan.json",
  "data/content-intelligence/backend-architecture/ag34c-test-user-role-plan-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag34c-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag34c-test-user-role-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag34c-backend-readiness-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag34c-to-ag34d-backend-readiness-audit-boundary.json",
  "data/quality/ag34c-test-user-role-plan.json",
  "data/quality/ag34c-test-user-role-plan-preview.json",
  "docs/quality/AG34C_TEST_USER_ROLE_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag34c-test-user-role-plan.json");
const plan = readJson("data/content-intelligence/backend-architecture/ag34c-test-user-role-plan.json");
const testAdmin = readJson("data/content-intelligence/backend-architecture/ag34c-test-admin-user-plan.json");
const testEditor = readJson("data/content-intelligence/backend-architecture/ag34c-test-editor-user-plan.json");
const roleRestriction = readJson("data/content-intelligence/backend-architecture/ag34c-role-restriction-test-plan.json");
const loginBoundary = readJson("data/content-intelligence/backend-architecture/ag34c-login-test-boundary-plan.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag34c-test-user-role-plan-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag34c-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag34c-test-user-role-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag34c-backend-readiness-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag34c-to-ag34d-backend-readiness-audit-boundary.json");
const registry = readJson("data/quality/ag34c-test-user-role-plan.json");
const preview = readJson("data/quality/ag34c-test-user-role-plan-preview.json");

const ag34b = readJson("data/content-intelligence/backend-architecture/ag34b-environment-secret-readiness.json");
const ag34bReadiness = readJson("data/content-intelligence/quality-registry/ag34b-test-user-role-plan-readiness-record.json");
const ag34bNonActivation = readJson("data/content-intelligence/backend-architecture/ag34b-secret-readiness-non-activation-audit-register.json");
const ag34a = readJson("data/content-intelligence/backend-architecture/ag34a-backend-activation-readiness-checklist.json");
const ag33z = readJson("data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json");
const ag33zBlocker = readJson("data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json");
const ag32zBlocker = readJson("data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json");
const ag30bAssigned = readJson("data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "test_user_role_plan_created_ready_for_ag34d") fail("Review status mismatch.");
if (plan.status !== "test_user_role_plan_created_ready_for_ag34d") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (plan.plan_decision.test_user_role_plan_created !== true) fail("Plan decision missing.");
if (plan.plan_decision.test_admin_user_plan_created !== true) fail("Test Admin plan decision missing.");
if (plan.plan_decision.test_editor_user_plan_created !== true) fail("Test Editor plan decision missing.");
if (plan.plan_decision.role_restriction_test_plan_created !== true) fail("Role restriction decision missing.");
if (plan.plan_decision.login_test_boundary_plan_created !== true) fail("Login boundary decision missing.");
if (plan.plan_decision.proceed_to_ag34d_backend_readiness_audit !== true) fail("AG34D readiness missing.");

for (const flag of [
  "test_admin_creation_approved_now",
  "test_editor_creation_approved_now",
  "real_user_creation_approved_now",
  "auth_activation_approved_now",
  "credential_generation_approved_now",
  "invitation_send_approved_now",
  "database_creation_approved_now",
  "database_write_approved_now",
  "sql_generation_approved_now",
  "migration_generation_approved_now",
  "rls_policy_creation_approved_now",
  "rls_policy_application_approved_now",
  "secret_creation_approved_now",
  "env_var_write_approved_now",
  "server_route_creation_approved_now",
  "api_route_creation_approved_now",
  "route_guard_runtime_approved_now",
  "assignment_query_approved_now",
  "handler_runtime_approved_now",
  "queue_runtime_approved_now",
  "audit_runtime_approved_now",
  "github_write_approved_now",
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (plan.plan_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (testAdmin.status !== "test_admin_user_plan_created_no_account") fail("Test Admin status mismatch.");
if (testAdmin.future_role !== "admin") fail("Test Admin future role mismatch.");
if (testAdmin.future_test_identity.email_recorded_now !== false) fail("Admin email must not be recorded.");
if (testAdmin.future_test_identity.password_recorded_now !== false) fail("Admin password must not be recorded.");
if (testAdmin.future_test_identity.user_created_now !== false) fail("Admin user must not be created.");
if (testAdmin.future_test_identity.invitation_sent_now !== false) fail("Admin invite must not be sent.");
if (testAdmin.account_created !== false) fail("Admin account must not be created.");
if (testAdmin.auth_enabled !== false) fail("Admin Auth must not be enabled.");
if (testAdmin.credential_processing_created !== false) fail("Admin credential processing must not be created.");
if (testAdmin.database_write_done !== false) fail("Admin database write must not be done.");

if (testEditor.status !== "test_editor_user_plan_created_no_account") fail("Test Editor status mismatch.");
if (testEditor.future_role !== "editor") fail("Test Editor future role mismatch.");
if (testEditor.future_test_identity.email_recorded_now !== false) fail("Editor email must not be recorded.");
if (testEditor.future_test_identity.password_recorded_now !== false) fail("Editor password must not be recorded.");
if (testEditor.future_test_identity.user_created_now !== false) fail("Editor user must not be created.");
if (testEditor.future_test_identity.invitation_sent_now !== false) fail("Editor invite must not be sent.");
if (testEditor.account_created !== false) fail("Editor account must not be created.");
if (testEditor.auth_enabled !== false) fail("Editor Auth must not be enabled.");
if (testEditor.credential_processing_created !== false) fail("Editor credential processing must not be created.");
if (testEditor.database_write_done !== false) fail("Editor database write must not be done.");

if (roleRestriction.status !== "role_restriction_test_plan_created_no_runtime") fail("Role restriction status mismatch.");
for (const testId of ["admin_final_clearance", "editor_assigned_only_access", "editor_no_publish", "editor_no_archive", "editor_no_global_queue", "public_no_private_queue_access"]) {
  if (!roleRestriction.restriction_tests.some((item) => item.test_id === testId && item.execute_now === false)) fail(`Missing or executable role test: ${testId}`);
}
if (roleRestriction.rls_policy_created !== false) fail("RLS policy must not be created.");
if (roleRestriction.rls_policy_applied !== false) fail("RLS policy must not be applied.");
if (roleRestriction.route_guard_runtime_created !== false) fail("Route guard runtime must not be created.");
if (roleRestriction.assignment_query_created !== false) fail("Assignment query must not be created.");
if (roleRestriction.database_write_done !== false) fail("Role test database write must not be done.");

if (loginBoundary.status !== "login_test_boundary_plan_created_no_login") fail("Login boundary status mismatch.");
if (loginBoundary.login_created_now !== false) fail("Login must not be created.");
if (loginBoundary.auth_enabled !== false) fail("Login Auth must not be enabled.");
if (loginBoundary.session_runtime_created !== false) fail("Session runtime must not be created.");
if (loginBoundary.credential_processing_created !== false) fail("Credential processing must not be created.");
if (loginBoundary.test_admin_created !== false) fail("Test Admin must not be created.");
if (loginBoundary.test_editor_created !== false) fail("Test Editor must not be created.");

if (nonActivation.status !== "test_user_role_plan_non_activation_audit_passed") fail("Non-activation status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG34D) fail("AG34D consumption note missing.");
if (!consumption.future_consumption?.AG34Z) fail("AG34Z consumption note missing.");
if (!consumption.future_consumption?.AG35A) fail("AG35A consumption note missing.");
if (!consumption.future_consumption?.AG36) fail("AG36 consumption note missing.");

if (blocker.status !== "test_user_role_plan_operations_blocked_pending_ag34d") fail("Blocker status mismatch.");
if (readiness.ready_for_ag34d !== true) fail("AG34D readiness missing.");
if (readiness.allowed_ag34d_mode !== "backend_readiness_audit_only") fail("AG34D mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.test_user_creation_allowed_now !== false) fail("Test user creation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (readiness.database_write_allowed_now !== false) fail("Database write must be false.");
if (readiness.rls_application_allowed_now !== false) fail("RLS application must be false.");
if (readiness.secret_write_allowed_now !== false) fail("Secret write must be false.");
if (readiness.env_var_write_allowed_now !== false) fail("Env var write must be false.");

if (boundary.next_stage_id !== "AG34D") fail("Boundary must point to AG34D.");
if (boundary.status !== "ag34d_boundary_created_backend_readiness_audit_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.test_user_role_plan_created !== true) fail("Review summary missing.");
if (review.summary.ready_for_ag34d !== true) fail("AG34D readiness summary missing.");

for (const flag of [
  "supabase_project_created",
  "supabase_connected",
  "auth_enabled",
  "real_user_created",
  "test_user_created",
  "test_invitation_sent",
  "credential_created",
  "database_created",
  "database_write_done",
  "sql_generated",
  "sql_applied",
  "migration_generated",
  "migration_applied",
  "rls_policy_created",
  "rls_policy_applied",
  "secrets_created",
  "env_vars_written",
  "server_routes_created",
  "api_routes_created",
  "route_guard_runtime_created",
  "assignment_query_created",
  "handler_runtime_created",
  "queue_runtime_created",
  "audit_runtime_created",
  "rollback_runtime_created",
  "github_write_done",
  "deployment_done",
  "public_mutation_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must be false.`);
}

if (ag34b.status !== "environment_secret_readiness_created_ready_for_ag34c") fail("AG34B source status mismatch.");
if (ag34bReadiness.ready_for_ag34c !== true) fail("AG34B readiness must allow AG34C.");
if (ag34bNonActivation.audit_passed !== true) fail("AG34B non-activation audit must pass.");
if (ag34a.status !== "backend_activation_readiness_checklist_created_ready_for_ag34b") fail("AG34A source status mismatch.");
if (ag33z.status !== "dynamic_publish_scaffold_closure_created_ready_for_ag34a") fail("AG33Z source status mismatch.");

for (const [key, value] of Object.entries(ag33zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG33Z blocker must remain false: ${key}`);
}
for (const [key, value] of Object.entries(ag32zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG32Z blocker must remain false: ${key}`);
}

if (ag30bAssigned.editor_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Assigned-only source missing.");
if (ag30bAssigned.editor_rules.editor_cannot_publish !== true) fail("Editor no-publish source missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "test_user_role_plan_created_ready_for_ag34d") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.test_user_role_plan_created !== 1) fail("Preview test-user plan missing.");
if (preview.test_admin_user_plan_created !== 1) fail("Preview Admin plan missing.");
if (preview.test_editor_user_plan_created !== 1) fail("Preview Editor plan missing.");
if (preview.role_restriction_test_plan_created !== 1) fail("Preview role restriction plan missing.");
if (preview.login_test_boundary_plan_created !== 1) fail("Preview login boundary plan missing.");

for (const zeroField of [
  "supabase_project_created",
  "supabase_connected",
  "auth_enabled",
  "real_user_created",
  "test_user_created",
  "credential_created",
  "database_objects_created",
  "database_write_done",
  "sql_generated",
  "sql_applied",
  "migrations_generated",
  "migrations_applied",
  "rls_policies_created",
  "rls_policies_applied",
  "secrets_created",
  "env_vars_written",
  "server_routes_created",
  "api_routes_created",
  "route_guard_runtime_created",
  "assignment_query_created",
  "handler_runtime_created",
  "queue_runtime_created",
  "audit_runtime_created",
  "rollback_runtime_created",
  "github_write_done",
  "deployment_done",
  "public_mutation_done"
]) {
  if (preview[zeroField] !== 0) fail(`Preview ${zeroField} must be 0.`);
}

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag34b-environment-secret-readiness.json",
  "data/content-intelligence/backend-architecture/ag34b-service-role-protection-plan.json",
  "data/content-intelligence/backend-architecture/ag34a-auth-method-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-rls-rollback-test-user-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "test_user_role_plan_created" ||
    k === "test_admin_user_plan_created" ||
    k === "test_editor_user_plan_created" ||
    k === "role_restriction_test_plan_created" ||
    k === "login_test_boundary_plan_created" ||
    k === "test_user_role_non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag34c"]) fail("Missing generate:ag34c script.");
if (!pkg.scripts?.["validate:ag34c"]) fail("Missing validate:ag34c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag34c")) fail("validate:project must include validate:ag34c.");

pass("AG34C Test User and Role Plan is present.");
pass("Test Admin, Test Editor, role restriction and login boundary plans are valid.");
pass("No account, credential, Auth/backend activation, database, RLS, secrets, deployment or public mutation is enabled.");
pass("AG34D Backend Readiness Audit boundary is ready.");
