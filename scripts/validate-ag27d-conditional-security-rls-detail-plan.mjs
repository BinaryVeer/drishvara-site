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
  console.error(`❌ AG27D validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag27c-supabase-auth-security-rls-plan.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-auth-security-rls-plan.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-table-plan.json",
  "data/content-intelligence/backend-decision/ag27c-auth-role-access-model.json",
  "data/content-intelligence/backend-decision/ag27c-rls-policy-plan.json",
  "data/content-intelligence/backend-decision/ag27c-audit-secret-governance-plan.json",
  "data/content-intelligence/backend-decision/ag27c-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag27c-conditional-security-rls-detail-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27c-to-ag27d-conditional-security-rls-detail-boundary.json",
  "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/backend-decision/ag27-backend-deferral-record.json",
  "data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json",

  "data/content-intelligence/quality-reviews/ag27d-conditional-security-rls-detail-plan.json",
  "data/content-intelligence/backend-decision/ag27d-conditional-security-rls-detail-plan.json",
  "data/content-intelligence/backend-decision/ag27d-access-boundary-matrix.json",
  "data/content-intelligence/backend-decision/ag27d-rls-test-scenario-model.json",
  "data/content-intelligence/backend-decision/ag27d-secret-risk-register.json",
  "data/content-intelligence/backend-decision/ag27d-activation-guard-register.json",
  "data/content-intelligence/backend-decision/ag27d-non-activation-audit-register.json",
  "data/content-intelligence/backend-decision/ag27d-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag27d-conditional-security-rls-detail-blocker-register.json",
  "data/content-intelligence/quality-registry/ag27d-backend-decision-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27d-to-ag27z-backend-decision-closure-boundary.json",
  "data/quality/ag27d-conditional-security-rls-detail-plan.json",
  "data/quality/ag27d-conditional-security-rls-detail-plan-preview.json",
  "docs/quality/AG27D_CONDITIONAL_SECURITY_RLS_DETAIL_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag27d-conditional-security-rls-detail-plan.json");
const plan = readJson("data/content-intelligence/backend-decision/ag27d-conditional-security-rls-detail-plan.json");
const accessMatrix = readJson("data/content-intelligence/backend-decision/ag27d-access-boundary-matrix.json");
const rlsScenario = readJson("data/content-intelligence/backend-decision/ag27d-rls-test-scenario-model.json");
const secretRisk = readJson("data/content-intelligence/backend-decision/ag27d-secret-risk-register.json");
const activationGuard = readJson("data/content-intelligence/backend-decision/ag27d-activation-guard-register.json");
const nonActivation = readJson("data/content-intelligence/backend-decision/ag27d-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-decision/ag27d-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag27d-conditional-security-rls-detail-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag27d-backend-decision-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag27d-to-ag27z-backend-decision-closure-boundary.json");
const registry = readJson("data/quality/ag27d-conditional-security-rls-detail-plan.json");
const preview = readJson("data/quality/ag27d-conditional-security-rls-detail-plan-preview.json");

const ag27c = readJson("data/content-intelligence/backend-decision/ag27c-supabase-auth-security-rls-plan.json");
const ag27cReadiness = readJson("data/content-intelligence/quality-registry/ag27c-conditional-security-rls-detail-readiness-record.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const ag27Boundary = readJson("data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "conditional_security_rls_detail_plan_created_ready_for_ag27z") fail("Review status mismatch.");
if (plan.status !== "conditional_security_rls_detail_plan_created_ready_for_ag27z") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (plan.detail_decision.access_boundary_matrix_created !== true) fail("Access boundary matrix missing.");
if (plan.detail_decision.rls_test_scenario_model_created !== true) fail("RLS scenario model missing.");
if (plan.detail_decision.secret_risk_register_created !== true) fail("Secret risk register missing.");
if (plan.detail_decision.activation_guard_register_created !== true) fail("Activation guard register missing.");
if (plan.detail_decision.proceed_to_ag27z !== true) fail("Must proceed to AG27Z.");
if (plan.detail_decision.backend_activation_approved_now !== false) fail("Backend activation must be false.");
if (plan.detail_decision.supabase_sandbox_activation_approved_now !== false) fail("Supabase activation must be false.");
if (plan.detail_decision.auth_activation_approved_now !== false) fail("Auth activation must be false.");
if (plan.detail_decision.sql_or_migration_generation_approved_now !== false) fail("SQL/migration generation must be false.");
if (plan.detail_decision.database_creation_approved_now !== false) fail("Database creation must be false.");
if (plan.detail_decision.rls_policy_application_approved_now !== false) fail("RLS application must be false.");
if (plan.detail_decision.secrets_or_env_setup_approved_now !== false) fail("Secrets/env setup must be false.");
if (plan.detail_decision.ag28_allowed_now !== false) fail("AG28 must remain false.");

for (const flag of [
  "backend_activation_allowed_in_ag27d",
  "supabase_activation_allowed_in_ag27d",
  "auth_activation_allowed_in_ag27d",
  "sql_generation_allowed_in_ag27d",
  "migration_generation_allowed_in_ag27d",
  "database_creation_allowed_in_ag27d",
  "rls_policy_application_allowed_in_ag27d",
  "secret_creation_allowed_in_ag27d",
  "env_var_write_allowed_in_ag27d",
  "server_route_creation_allowed_in_ag27d",
  "deployment_allowed_in_ag27d",
  "public_mutation_allowed_in_ag27d"
]) {
  if (plan[flag] !== false) fail(`${flag} must be false.`);
}

if (accessMatrix.status !== "access_boundary_matrix_created_no_auth_activation") fail("Access matrix status mismatch.");
if (accessMatrix.boundary_count !== accessMatrix.boundaries.length) fail("Access boundary count mismatch.");
if (accessMatrix.auth_activation_allowed !== false) fail("Auth activation must be false.");
for (const boundaryId of ["admin_article_review_scope", "editor_assigned_article_scope", "public_read_scope", "service_role_server_only_scope"]) {
  if (!accessMatrix.boundaries.some((item) => item.boundary_id === boundaryId)) fail(`Missing access boundary: ${boundaryId}`);
}

if (rlsScenario.status !== "rls_test_scenario_model_created_no_policy_application") fail("RLS scenario status mismatch.");
if (rlsScenario.scenario_count !== rlsScenario.scenarios.length) fail("RLS scenario count mismatch.");
if (rlsScenario.rls_test_execution_allowed !== false) fail("RLS test execution must be false.");
if (rlsScenario.rls_policy_application_allowed !== false) fail("RLS policy application must be false.");
for (const scenario of rlsScenario.scenarios) {
  if (scenario.executable_now !== false) fail(`${scenario.scenario_id} must not be executable now.`);
}
for (const scenarioId of ["editor_cannot_read_unassigned_article", "editor_cannot_publish", "public_cannot_read_unpublished_article", "audit_logs_append_only"]) {
  if (!rlsScenario.scenarios.some((item) => item.scenario_id === scenarioId)) fail(`Missing RLS scenario: ${scenarioId}`);
}

if (secretRisk.status !== "secret_risk_register_created_no_secret_storage") fail("Secret risk status mismatch.");
if (secretRisk.secrets_created !== false) fail("Secrets must not be created.");
if (secretRisk.env_vars_written !== false) fail("Env vars must not be written.");
if (secretRisk.repository_secret_storage_allowed !== false) fail("Repository secret storage must be false.");
if (!secretRisk.risks.some((risk) => risk.risk_id === "service_role_key_exposure")) fail("Service role risk missing.");

if (activationGuard.status !== "activation_guard_register_created_activation_blocked") fail("Activation guard status mismatch.");
if (activationGuard.all_guards_required_before_future_activation !== true) fail("All guards must be required.");
if (activationGuard.activation_allowed_now !== false) fail("Activation must be false.");
for (const guardId of ["explicit_approval_guard", "secret_presence_guard", "rls_policy_review_guard", "no_frontend_service_role_guard"]) {
  if (!activationGuard.guards.some((item) => item.guard_id === guardId)) fail(`Missing activation guard: ${guardId}`);
}

if (nonActivation.status !== "conditional_security_rls_detail_non_activation_audit_passed") fail("Non-activation audit status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG27Z) fail("AG27Z consumption note missing.");
if (!consumption.future_consumption?.AG28) fail("AG28 consumption note missing.");
if (!consumption.future_consumption?.AG29_to_AG34) fail("AG29-AG34 consumption note missing.");
if (!consumption.future_consumption?.AG35_and_later) fail("AG35/later note missing.");

if (blocker.status !== "conditional_security_rls_detail_operations_blocked_pending_ag27z") fail("Blocker status mismatch.");
if (readiness.ready_for_ag27z !== true) fail("AG27Z readiness missing.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (boundary.next_stage_id !== "AG27Z") fail("AG27Z boundary missing.");
if (boundary.backend_planning_selected !== true) fail("Boundary must keep backend planning selected.");
if (boundary.backend_activation_deferred !== true) fail("Boundary must defer backend activation.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must defer Supabase/Auth/backend.");
if (boundary.explicit_approval_required_before_activation !== true) fail("Explicit approval before activation required.");

if (review.summary.conditional_security_rls_detail_plan_created !== true) fail("Review summary missing.");
if (review.summary.access_boundary_matrix_created !== true) fail("Review access boundary summary missing.");
if (review.summary.rls_test_scenario_model_created !== true) fail("Review RLS scenario summary missing.");
if (review.summary.secret_risk_register_created !== true) fail("Review secret risk summary missing.");
if (review.summary.activation_guard_register_created !== true) fail("Review activation guard summary missing.");
if (review.summary.proceed_to_ag27z !== true) fail("Review must proceed to AG27Z.");
if (review.summary.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (review.summary.supabase_activation_allowed_now !== false) fail("Supabase activation must be false.");
if (review.summary.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (review.summary.sql_generation_allowed_now !== false) fail("SQL generation must be false.");
if (review.summary.migration_generation_allowed_now !== false) fail("Migration generation must be false.");
if (review.summary.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (review.summary.rls_policy_application_allowed_now !== false) fail("RLS application must be false.");
if (review.summary.secret_creation_allowed_now !== false) fail("Secrets must be false.");
if (review.summary.env_var_write_allowed_now !== false) fail("Env write must be false.");
if (review.summary.server_route_creation_allowed_now !== false) fail("Server route creation must be false.");
if (review.summary.ag28_allowed_now !== false) fail("AG28 must be false.");
if (review.summary.ready_for_ag27z !== true) fail("Ready for AG27Z missing.");

if (ag27c.status !== "supabase_auth_security_rls_plan_created_ready_for_conditional_ag27d") fail("AG27C source status mismatch.");
if (ag27cReadiness.ready_for_ag27d !== true) fail("AG27C readiness must allow AG27D.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("AG26Z editor assigned-only rule missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("AG26Z Admin final clearance missing.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");
if (ag27.checkpoint_decision.backend_activation_approved !== false) fail("AG27 backend activation must remain unapproved.");
if (ag27Boundary.explicit_approval_required !== true) fail("AG27 boundary explicit approval missing.");

if (registry.status !== "conditional_security_rls_detail_plan_created_ready_for_ag27z") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.access_boundary_matrix_created !== 1) fail("Preview must mark access matrix created.");
if (preview.rls_test_scenario_model_created !== 1) fail("Preview must mark RLS model created.");
if (preview.secret_risk_register_created !== 1) fail("Preview must mark secret risk register created.");
if (preview.activation_guard_register_created !== 1) fail("Preview must mark activation guard register created.");
if (preview.backend_activation_allowed !== 0) fail("Preview must record 0 backend activation.");
if (preview.supabase_activation_allowed !== 0) fail("Preview must record 0 Supabase activation.");
if (preview.auth_activation_allowed !== 0) fail("Preview must record 0 Auth activation.");
if (preview.sql_generated !== 0) fail("Preview must record 0 SQL generated.");
if (preview.migrations_generated !== 0) fail("Preview must record 0 migrations.");
if (preview.database_objects_created !== 0) fail("Preview must record 0 database objects.");
if (preview.rls_policies_applied !== 0) fail("Preview must record 0 RLS policies applied.");
if (preview.secrets_created !== 0) fail("Preview must record 0 secrets.");
if (preview.env_vars_written !== 0) fail("Preview must record 0 env writes.");
if (preview.deployment_done !== 0) fail("Preview must record 0 deployment.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");
if (preview.ag28_allowed_now !== 0) fail("Preview must mark AG28 blocked.");

for (const expectedInput of [
  "data/content-intelligence/backend-decision/ag27c-supabase-auth-security-rls-plan.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-table-plan.json",
  "data/content-intelligence/backend-decision/ag27c-auth-role-access-model.json",
  "data/content-intelligence/backend-decision/ag27c-rls-policy-plan.json",
  "data/content-intelligence/backend-decision/ag27c-audit-secret-governance-plan.json",
  "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "conditional_security_rls_detail_plan_created" ||
    k === "access_boundary_matrix_created" ||
    k === "rls_test_scenario_model_created" ||
    k === "secret_risk_register_created" ||
    k === "activation_guard_register_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag27d"]) fail("Missing generate:ag27d script.");
if (!pkg.scripts?.["validate:ag27d"]) fail("Missing validate:ag27d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag27d")) fail("validate:project must include validate:ag27d.");

pass("AG27D Conditional Security/RLS Detail Plan is present.");
pass("Access boundary matrix, RLS scenario model, secret risk register and activation guard register are valid.");
pass("Admin final clearance and Editor assigned-only governance are preserved.");
pass("No Supabase/Auth/backend activation, SQL, migration, database, RLS application, secrets, env vars, deployment or public mutation is enabled.");
pass("AG27Z Backend Decision Closure boundary is ready.");
