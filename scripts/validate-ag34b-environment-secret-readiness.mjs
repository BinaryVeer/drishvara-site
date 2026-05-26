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
  console.error(`❌ AG34B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag34a-backend-activation-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-supabase-project-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-auth-method-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-rls-rollback-test-user-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-readiness-checklist-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag34a-environment-secret-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag34a-to-ag34b-environment-secret-readiness-boundary.json",
  "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  "data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag33z-ag34-backend-activation-readiness-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag34b-environment-secret-readiness.json",
  "data/content-intelligence/backend-architecture/ag34b-environment-secret-readiness.json",
  "data/content-intelligence/backend-architecture/ag34b-env-var-placement-plan.json",
  "data/content-intelligence/backend-architecture/ag34b-secret-naming-readiness-plan.json",
  "data/content-intelligence/backend-architecture/ag34b-service-role-protection-plan.json",
  "data/content-intelligence/backend-architecture/ag34b-local-vercel-env-readiness-plan.json",
  "data/content-intelligence/backend-architecture/ag34b-secret-readiness-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag34b-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag34b-environment-secret-readiness-blocker-register.json",
  "data/content-intelligence/quality-registry/ag34b-test-user-role-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag34b-to-ag34c-test-user-role-plan-boundary.json",
  "data/quality/ag34b-environment-secret-readiness.json",
  "data/quality/ag34b-environment-secret-readiness-preview.json",
  "docs/quality/AG34B_ENVIRONMENT_SECRET_READINESS.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag34b-environment-secret-readiness.json");
const plan = readJson("data/content-intelligence/backend-architecture/ag34b-environment-secret-readiness.json");
const envPlacement = readJson("data/content-intelligence/backend-architecture/ag34b-env-var-placement-plan.json");
const naming = readJson("data/content-intelligence/backend-architecture/ag34b-secret-naming-readiness-plan.json");
const serviceRole = readJson("data/content-intelligence/backend-architecture/ag34b-service-role-protection-plan.json");
const localVercel = readJson("data/content-intelligence/backend-architecture/ag34b-local-vercel-env-readiness-plan.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag34b-secret-readiness-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag34b-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag34b-environment-secret-readiness-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag34b-test-user-role-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag34b-to-ag34c-test-user-role-plan-boundary.json");
const registry = readJson("data/quality/ag34b-environment-secret-readiness.json");
const preview = readJson("data/quality/ag34b-environment-secret-readiness-preview.json");

const ag34a = readJson("data/content-intelligence/backend-architecture/ag34a-backend-activation-readiness-checklist.json");
const ag34aReadiness = readJson("data/content-intelligence/quality-registry/ag34a-environment-secret-readiness-record.json");
const ag34aNonActivation = readJson("data/content-intelligence/backend-architecture/ag34a-readiness-checklist-non-activation-audit-register.json");
const ag33z = readJson("data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json");
const ag33zBlocker = readJson("data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json");
const ag32zBlocker = readJson("data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "environment_secret_readiness_created_ready_for_ag34c") fail("Review status mismatch.");
if (plan.status !== "environment_secret_readiness_created_ready_for_ag34c") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (plan.readiness_decision.environment_secret_readiness_created !== true) fail("Readiness decision missing.");
if (plan.readiness_decision.env_var_placement_plan_created !== true) fail("Env placement decision missing.");
if (plan.readiness_decision.secret_naming_readiness_plan_created !== true) fail("Secret naming decision missing.");
if (plan.readiness_decision.service_role_protection_plan_created !== true) fail("Service role decision missing.");
if (plan.readiness_decision.proceed_to_ag34c_test_user_role_plan !== true) fail("AG34C readiness missing.");

for (const flag of [
  "secret_creation_approved_now",
  "env_var_write_approved_now",
  "env_file_creation_approved_now",
  "service_role_key_creation_approved_now",
  "service_role_key_storage_approved_now",
  "service_role_key_exposure_approved_now",
  "supabase_connection_approved_now",
  "auth_activation_approved_now",
  "database_creation_approved_now",
  "database_write_approved_now",
  "sql_generation_approved_now",
  "migration_generation_approved_now",
  "rls_policy_creation_approved_now",
  "rls_policy_application_approved_now",
  "server_route_creation_approved_now",
  "api_route_creation_approved_now",
  "handler_runtime_approved_now",
  "queue_runtime_approved_now",
  "audit_runtime_approved_now",
  "github_write_approved_now",
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (plan.readiness_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (envPlacement.status !== "env_var_placement_plan_created_no_write") fail("Env placement status mismatch.");
if (envPlacement.env_vars_written !== false) fail("Env vars must not be written.");
if (envPlacement.env_file_created !== false) fail("Env file must not be created.");
if (envPlacement.env_file_modified !== false) fail("Env file must not be modified.");
if (envPlacement.secrets_created !== false) fail("Secrets must not be created.");
for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]) {
  if (!envPlacement.planned_variables.some((item) => item.name === name)) fail(`Missing planned env var: ${name}`);
}
if (envPlacement.planned_variables.some((item) => item.value_recorded_now !== false || item.write_now !== false)) fail("Env variable values must not be recorded or written.");

if (naming.status !== "secret_naming_readiness_plan_created_no_secret") fail("Secret naming status mismatch.");
if (naming.secret_values_recorded_now !== false) fail("Secret values must not be recorded.");
if (naming.secrets_created !== false) fail("Secrets must not be created.");
if (naming.env_vars_written !== false) fail("Env vars must not be written.");

if (serviceRole.status !== "service_role_protection_plan_created_no_key") fail("Service role status mismatch.");
if (serviceRole.service_role_key_created !== false) fail("Service role key must not be created.");
if (serviceRole.service_role_key_stored !== false) fail("Service role key must not be stored.");
if (serviceRole.service_role_key_exposed !== false) fail("Service role key must not be exposed.");
if (serviceRole.server_route_created !== false) fail("Server route must not be created.");
if (serviceRole.api_route_created !== false) fail("API route must not be created.");

if (localVercel.status !== "local_vercel_env_readiness_plan_created_no_write") fail("Local/Vercel status mismatch.");
if (localVercel.env_file_created !== false) fail("Local env file must not be created.");
if (localVercel.env_file_modified !== false) fail("Local env file must not be modified.");
if (localVercel.env_vars_written !== false) fail("Local env vars must not be written.");
if (localVercel.secrets_created !== false) fail("Local secrets must not be created.");
if (localVercel.vercel_env_updated !== false) fail("Vercel env must not be updated.");

if (nonActivation.status !== "secret_readiness_non_activation_audit_passed") fail("Non-activation status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG34C) fail("AG34C consumption note missing.");
if (!consumption.future_consumption?.AG34D) fail("AG34D consumption note missing.");
if (!consumption.future_consumption?.AG34Z) fail("AG34Z consumption note missing.");
if (!consumption.future_consumption?.AG35A) fail("AG35A consumption note missing.");

if (blocker.status !== "environment_secret_readiness_operations_blocked_pending_ag34c") fail("Blocker status mismatch.");
if (readiness.ready_for_ag34c !== true) fail("AG34C readiness missing.");
if (readiness.allowed_ag34c_mode !== "test_user_role_plan_only") fail("AG34C mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.test_user_creation_allowed_now !== false) fail("Test user creation must be false.");
if (readiness.secret_write_allowed_now !== false) fail("Secret write must be false.");
if (readiness.env_var_write_allowed_now !== false) fail("Env var write must be false.");
if (readiness.supabase_activation_allowed_now !== false) fail("Supabase activation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (readiness.rls_application_allowed_now !== false) fail("RLS application must be false.");

if (boundary.next_stage_id !== "AG34C") fail("Boundary must point to AG34C.");
if (boundary.status !== "ag34c_boundary_created_test_user_role_plan_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.environment_secret_readiness_created !== true) fail("Review summary missing.");
if (review.summary.ready_for_ag34c !== true) fail("AG34C readiness summary missing.");

for (const flag of [
  "supabase_project_created",
  "supabase_connected",
  "auth_enabled",
  "real_user_created",
  "test_user_created",
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
  "env_file_created",
  "env_file_modified",
  "service_role_key_created",
  "service_role_key_stored",
  "service_role_key_exposed",
  "server_routes_created",
  "api_routes_created",
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

if (ag34a.status !== "backend_activation_readiness_checklist_created_ready_for_ag34b") fail("AG34A source status mismatch.");
if (ag34aReadiness.ready_for_ag34b !== true) fail("AG34A readiness must allow AG34B.");
if (ag34aNonActivation.audit_passed !== true) fail("AG34A non-activation audit must pass.");
if (ag33z.status !== "dynamic_publish_scaffold_closure_created_ready_for_ag34a") fail("AG33Z source status mismatch.");

for (const [key, value] of Object.entries(ag33zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG33Z blocker must remain false: ${key}`);
}
for (const [key, value] of Object.entries(ag32zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG32Z blocker must remain false: ${key}`);
}

if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "environment_secret_readiness_created_ready_for_ag34c") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.environment_secret_readiness_created !== 1) fail("Preview readiness missing.");
if (preview.env_var_placement_plan_created !== 1) fail("Preview env plan missing.");
if (preview.secret_naming_readiness_plan_created !== 1) fail("Preview secret naming missing.");
if (preview.service_role_protection_plan_created !== 1) fail("Preview service role plan missing.");
if (preview.local_vercel_env_readiness_plan_created !== 1) fail("Preview local/Vercel plan missing.");

for (const zeroField of [
  "supabase_project_created",
  "supabase_connected",
  "auth_enabled",
  "real_user_created",
  "test_user_created",
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
  "env_file_created",
  "env_file_modified",
  "service_role_key_created",
  "service_role_key_exposed",
  "server_routes_created",
  "api_routes_created",
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
  "data/content-intelligence/backend-architecture/ag34a-backend-activation-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-supabase-project-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  "data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "environment_secret_readiness_created" ||
    k === "env_var_placement_plan_created" ||
    k === "secret_naming_readiness_plan_created" ||
    k === "service_role_protection_plan_created" ||
    k === "local_vercel_env_readiness_plan_created" ||
    k === "secret_readiness_non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag34b"]) fail("Missing generate:ag34b script.");
if (!pkg.scripts?.["validate:ag34b"]) fail("Missing validate:ag34b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag34b")) fail("validate:project must include validate:ag34b.");

pass("AG34B Environment Secret Readiness is present.");
pass("Env placement, secret naming, service-role protection and local/Vercel readiness plans are valid.");
pass("No secrets, env vars, Supabase/Auth/backend activation, database, RLS, deployment or public mutation is enabled.");
pass("AG34C Test User and Role Plan boundary is ready.");
