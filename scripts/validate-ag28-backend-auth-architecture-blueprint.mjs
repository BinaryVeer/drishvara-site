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
  console.error(`❌ AG28 validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag27z-backend-decision-closure.json",
  "data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json",
  "data/content-intelligence/backend-decision/ag27z-ag28-non-active-architecture-handoff-plan.json",
  "data/content-intelligence/backend-decision/ag27z-backend-activation-deferral-register.json",
  "data/content-intelligence/quality-registry/ag27z-ag28-backend-architecture-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27z-to-ag28-backend-architecture-boundary.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-table-plan.json",
  "data/content-intelligence/backend-decision/ag27c-auth-role-access-model.json",
  "data/content-intelligence/backend-decision/ag27c-rls-policy-plan.json",
  "data/content-intelligence/backend-decision/ag27c-audit-secret-governance-plan.json",
  "data/content-intelligence/backend-decision/ag27d-access-boundary-matrix.json",
  "data/content-intelligence/backend-decision/ag27d-rls-test-scenario-model.json",
  "data/content-intelligence/backend-decision/ag27d-secret-risk-register.json",
  "data/content-intelligence/backend-decision/ag27d-activation-guard-register.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28-backend-module-map.json",
  "data/content-intelligence/backend-architecture/ag28-api-route-taxonomy.json",
  "data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json",
  "data/content-intelligence/backend-architecture/ag28-service-boundary-model.json",
  "data/content-intelligence/backend-architecture/ag28-secret-environment-doctrine.json",
  "data/content-intelligence/backend-architecture/ag28-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag28-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag28-backend-auth-architecture-blueprint-blocker-register.json",
  "data/content-intelligence/quality-registry/ag28-backend-schema-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag28-to-ag29-backend-schema-plan-boundary.json",
  "data/quality/ag28-backend-auth-architecture-blueprint.json",
  "data/quality/ag28-backend-auth-architecture-blueprint-preview.json",
  "docs/quality/AG28_BACKEND_AUTH_ARCHITECTURE_BLUEPRINT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag28-backend-auth-architecture-blueprint.json");
const blueprint = readJson("data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json");
const moduleMap = readJson("data/content-intelligence/backend-architecture/ag28-backend-module-map.json");
const routeTaxonomy = readJson("data/content-intelligence/backend-architecture/ag28-api-route-taxonomy.json");
const authSession = readJson("data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json");
const serviceBoundary = readJson("data/content-intelligence/backend-architecture/ag28-service-boundary-model.json");
const secretDoctrine = readJson("data/content-intelligence/backend-architecture/ag28-secret-environment-doctrine.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag28-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag28-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag28-backend-auth-architecture-blueprint-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag28-backend-schema-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag28-to-ag29-backend-schema-plan-boundary.json");
const registry = readJson("data/quality/ag28-backend-auth-architecture-blueprint.json");
const preview = readJson("data/quality/ag28-backend-auth-architecture-blueprint-preview.json");

const ag27z = readJson("data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json");
const ag27zReadiness = readJson("data/content-intelligence/quality-registry/ag27z-ag28-backend-architecture-readiness-record.json");
const ag27zDeferral = readJson("data/content-intelligence/backend-decision/ag27z-backend-activation-deferral-register.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "backend_auth_architecture_blueprint_created_ready_for_ag29") fail("Review status mismatch.");
if (blueprint.status !== "backend_auth_architecture_blueprint_created_ready_for_ag29") fail("Blueprint status mismatch.");
if (blueprint.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (blueprint.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (blueprint.architecture_decision.non_active_backend_auth_architecture_created !== true) fail("Non-active architecture decision missing.");
if (blueprint.architecture_decision.backend_module_map_created !== true) fail("Module map decision missing.");
if (blueprint.architecture_decision.api_route_taxonomy_created !== true) fail("API taxonomy decision missing.");
if (blueprint.architecture_decision.auth_session_model_created !== true) fail("Auth model decision missing.");
if (blueprint.architecture_decision.service_boundary_model_created !== true) fail("Service boundary decision missing.");
if (blueprint.architecture_decision.secret_environment_doctrine_created !== true) fail("Secret doctrine decision missing.");
if (blueprint.architecture_decision.proceed_to_ag29_schema_plan !== true) fail("AG29 readiness missing.");

for (const flag of [
  "backend_activation_approved_now",
  "supabase_project_creation_approved_now",
  "sql_or_migration_generation_approved_now",
  "database_creation_approved_now",
  "rls_policy_application_approved_now",
  "auth_activation_approved_now",
  "secrets_or_env_setup_approved_now",
  "runtime_route_creation_approved_now",
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (blueprint.architecture_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "backend_activation_allowed_in_ag28",
  "supabase_project_creation_allowed_in_ag28",
  "supabase_connection_allowed_in_ag28",
  "sql_generation_allowed_in_ag28",
  "migration_generation_allowed_in_ag28",
  "database_creation_allowed_in_ag28",
  "rls_policy_application_allowed_in_ag28",
  "auth_activation_allowed_in_ag28",
  "secret_creation_allowed_in_ag28",
  "env_var_write_allowed_in_ag28",
  "server_route_creation_allowed_in_ag28",
  "api_route_creation_allowed_in_ag28",
  "deployment_allowed_in_ag28",
  "public_mutation_allowed_in_ag28"
]) {
  if (blueprint[flag] !== false) fail(`${flag} must be false.`);
}

if (moduleMap.status !== "backend_module_map_created_no_runtime_modules") fail("Module map status mismatch.");
if (moduleMap.module_count !== moduleMap.modules.length) fail("Module count mismatch.");
if (moduleMap.module_count < 10) fail("Expected at least 10 backend modules.");
if (moduleMap.runtime_modules_created !== false) fail("Runtime modules must not be created.");
for (const module of moduleMap.modules) {
  if (module.runtime_created_now !== false) fail(`${module.module_id} must not be runtime-created.`);
}

if (routeTaxonomy.status !== "api_route_taxonomy_created_no_routes") fail("Route taxonomy status mismatch.");
if (routeTaxonomy.route_group_count !== routeTaxonomy.route_taxonomy.length) fail("Route group count mismatch.");
if (routeTaxonomy.api_routes_created !== false) fail("API routes must not be created.");
if (routeTaxonomy.server_routes_created !== false) fail("Server routes must not be created.");
for (const group of routeTaxonomy.route_taxonomy) {
  if (group.created_now !== false) fail(`${group.route_group} routes must not be created.`);
}

if (authSession.status !== "auth_session_architecture_model_created_no_auth_activation") fail("Auth session status mismatch.");
if (authSession.auth_enabled_now !== false) fail("Auth must not be enabled.");
if (authSession.login_created_now !== false) fail("Login must not be created.");
if (authSession.role_rules_preserved.admin_final_clearance_authority !== true) fail("Admin final clearance must be preserved.");
if (authSession.role_rules_preserved.editor_assigned_only !== true) fail("Editor assigned-only must be preserved.");
if (authSession.role_rules_preserved.editor_no_publish !== true) fail("Editor no-publish must be preserved.");

if (serviceBoundary.status !== "service_boundary_model_created_no_runtime_services") fail("Service boundary status mismatch.");
if (serviceBoundary.runtime_services_created !== false) fail("Runtime services must not be created.");
for (const service of serviceBoundary.service_boundaries) {
  if (service.runtime_created_now !== false) fail(`${service.service_id} must not be runtime-created.`);
}

if (secretDoctrine.status !== "secret_environment_doctrine_created_no_secret_write") fail("Secret doctrine status mismatch.");
if (secretDoctrine.secrets_created !== false) fail("Secrets must not be created.");
if (secretDoctrine.env_vars_written !== false) fail("Env vars must not be written.");
if (!secretDoctrine.doctrine_rules.some((rule) => rule.includes("No secrets are committed"))) fail("No secrets committed rule missing.");
if (!secretDoctrine.planned_env_keys.some((key) => key.key_name === "SUPABASE_SERVICE_ROLE_KEY" && key.write_now === false)) fail("Service role key plan missing or write_now not false.");

if (nonActivation.status !== "backend_architecture_non_activation_audit_passed") fail("Non-activation audit status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG29) fail("AG29 consumption note missing.");
if (!consumption.future_consumption?.AG30) fail("AG30 consumption note missing.");
if (!consumption.future_consumption?.AG31) fail("AG31 consumption note missing.");
if (!consumption.future_consumption?.AG35_and_later) fail("AG35/later note missing.");

if (blocker.status !== "backend_auth_architecture_blueprint_operations_blocked_pending_ag29") fail("Blocker status mismatch.");
if (readiness.ready_for_ag29 !== true) fail("AG29 readiness missing.");
if (readiness.allowed_ag29_mode !== "non_active_schema_plan_only") fail("AG29 mode must be non-active schema only.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG29") fail("Boundary must point to AG29.");
if (boundary.status !== "ag29_boundary_created_non_active_schema_plan_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.backend_auth_architecture_blueprint_created !== true) fail("Review summary missing.");
if (review.summary.non_active_architecture_only !== true) fail("Non-active-only summary missing.");
if (review.summary.ready_for_ag29 !== true) fail("AG29 readiness summary missing.");

for (const flag of [
  "backend_activation_allowed_now",
  "supabase_project_creation_allowed_now",
  "supabase_connection_allowed_now",
  "sql_generation_allowed_now",
  "migration_generation_allowed_now",
  "database_creation_allowed_now",
  "rls_policy_application_allowed_now",
  "auth_activation_allowed_now",
  "secret_creation_allowed_now",
  "env_var_write_allowed_now",
  "server_route_creation_allowed_now",
  "api_route_creation_allowed_now",
  "deployment_done",
  "public_mutation_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must be false.`);
}

if (ag27z.status !== "backend_decision_closed_non_active_architecture_ready_for_ag28") fail("AG27Z source status mismatch.");
if (ag27zReadiness.ready_for_ag28 !== true) fail("AG27Z readiness must allow AG28.");
if (ag27zReadiness.allowed_ag28_mode !== "non_active_architecture_blueprint_only") fail("AG28 mode from AG27Z mismatch.");
for (const [key, value] of Object.entries(ag27zDeferral.deferral_decision)) {
  if (value !== false) fail(`AG27Z deferral decision must remain false: ${key}`);
}
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");

if (registry.status !== "backend_auth_architecture_blueprint_created_ready_for_ag29") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.module_map_created !== 1) fail("Preview module map missing.");
if (preview.api_route_taxonomy_created !== 1) fail("Preview route taxonomy missing.");
if (preview.auth_session_model_created !== 1) fail("Preview auth model missing.");
if (preview.backend_activation_allowed !== 0) fail("Preview must record 0 backend activation.");
if (preview.supabase_project_created !== 0) fail("Preview must record 0 Supabase project.");
if (preview.sql_generated !== 0) fail("Preview must record 0 SQL.");
if (preview.migrations_generated !== 0) fail("Preview must record 0 migrations.");
if (preview.database_objects_created !== 0) fail("Preview must record 0 database objects.");
if (preview.rls_policies_applied !== 0) fail("Preview must record 0 RLS policies.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.secrets_created !== 0) fail("Preview must record 0 secrets.");
if (preview.env_vars_written !== 0) fail("Preview must record 0 env writes.");
if (preview.server_routes_created !== 0) fail("Preview must record 0 server routes.");
if (preview.api_routes_created !== 0) fail("Preview must record 0 API routes.");
if (preview.deployment_done !== 0) fail("Preview must record 0 deployment.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json",
  "data/content-intelligence/backend-decision/ag27z-ag28-non-active-architecture-handoff-plan.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-table-plan.json",
  "data/content-intelligence/backend-decision/ag27c-auth-role-access-model.json",
  "data/content-intelligence/backend-decision/ag27d-access-boundary-matrix.json",
  "data/content-intelligence/backend-decision/ag27d-activation-guard-register.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!blueprint.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Blueprint did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "backend_auth_architecture_blueprint_created" ||
    k === "module_map_created" ||
    k === "api_route_taxonomy_created" ||
    k === "auth_session_model_created" ||
    k === "service_boundary_model_created" ||
    k === "secret_environment_doctrine_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag28"]) fail("Missing generate:ag28 script.");
if (!pkg.scripts?.["validate:ag28"]) fail("Missing validate:ag28 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag28")) fail("validate:project must include validate:ag28.");

pass("AG28 Backend/Auth Architecture Blueprint is present.");
pass("Backend module map, API route taxonomy, Auth/session model, service boundaries and secret doctrine are valid.");
pass("Admin final clearance and Editor assigned-only governance are preserved.");
pass("No Supabase/Auth/backend activation, SQL, migration, database, RLS application, secrets, routes, deployment or public mutation is enabled.");
pass("AG29 Backend Schema Plan boundary is ready.");
