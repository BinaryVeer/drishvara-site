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
  console.error(`❌ AG29C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag29b-rls-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29b-rls-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  "data/content-intelligence/backend-architecture/ag29b-table-rls-rule-map.json",
  "data/content-intelligence/backend-architecture/ag29b-system-action-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29b-public-reader-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29b-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag29b-secret-governance-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag29b-to-ag29c-secret-governance-plan-boundary.json",
  "data/content-intelligence/backend-architecture/ag29a-supabase-schema-draft.json",
  "data/content-intelligence/backend-architecture/ag28-secret-environment-doctrine.json",
  "data/content-intelligence/backend-decision/ag27c-audit-secret-governance-plan.json",
  "data/content-intelligence/backend-decision/ag27d-secret-risk-register.json",
  "data/content-intelligence/backend-decision/ag27d-activation-guard-register.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag29c-secret-governance-plan.json",
  "data/content-intelligence/backend-architecture/ag29c-secret-governance-plan.json",
  "data/content-intelligence/backend-architecture/ag29c-secret-boundary-register.json",
  "data/content-intelligence/backend-architecture/ag29c-env-var-handling-plan.json",
  "data/content-intelligence/backend-architecture/ag29c-service-role-safety-plan.json",
  "data/content-intelligence/backend-architecture/ag29c-secret-rotation-and-audit-plan.json",
  "data/content-intelligence/backend-architecture/ag29c-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag29c-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag29c-secret-governance-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag29c-schema-rls-security-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag29c-to-ag29d-schema-rls-security-audit-boundary.json",
  "data/quality/ag29c-secret-governance-plan.json",
  "data/quality/ag29c-secret-governance-plan-preview.json",
  "docs/quality/AG29C_SECRET_GOVERNANCE_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag29c-secret-governance-plan.json");
const plan = readJson("data/content-intelligence/backend-architecture/ag29c-secret-governance-plan.json");
const boundaryRegister = readJson("data/content-intelligence/backend-architecture/ag29c-secret-boundary-register.json");
const envPlan = readJson("data/content-intelligence/backend-architecture/ag29c-env-var-handling-plan.json");
const serviceRole = readJson("data/content-intelligence/backend-architecture/ag29c-service-role-safety-plan.json");
const rotationAudit = readJson("data/content-intelligence/backend-architecture/ag29c-secret-rotation-and-audit-plan.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag29c-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag29c-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag29c-secret-governance-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag29c-schema-rls-security-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag29c-to-ag29d-schema-rls-security-audit-boundary.json");
const registry = readJson("data/quality/ag29c-secret-governance-plan.json");
const preview = readJson("data/quality/ag29c-secret-governance-plan-preview.json");

const ag29b = readJson("data/content-intelligence/backend-architecture/ag29b-rls-policy-plan.json");
const ag29bReadiness = readJson("data/content-intelligence/quality-registry/ag29b-secret-governance-plan-readiness-record.json");
const ag29bNonActivation = readJson("data/content-intelligence/backend-architecture/ag29b-non-activation-audit-register.json");
const ag28Secret = readJson("data/content-intelligence/backend-architecture/ag28-secret-environment-doctrine.json");
const ag27cSecret = readJson("data/content-intelligence/backend-decision/ag27c-audit-secret-governance-plan.json");
const ag27dRisk = readJson("data/content-intelligence/backend-decision/ag27d-secret-risk-register.json");
const ag27dActivation = readJson("data/content-intelligence/backend-decision/ag27d-activation-guard-register.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "secret_governance_plan_created_ready_for_ag29d") fail("Review status mismatch.");
if (plan.status !== "secret_governance_plan_created_ready_for_ag29d") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (plan.secret_governance_decision.non_active_secret_governance_plan_created !== true) fail("Secret governance decision missing.");
if (plan.secret_governance_decision.secret_boundary_register_created !== true) fail("Secret boundary decision missing.");
if (plan.secret_governance_decision.env_var_handling_plan_created !== true) fail("Env var decision missing.");
if (plan.secret_governance_decision.service_role_safety_plan_created !== true) fail("Service role decision missing.");
if (plan.secret_governance_decision.secret_rotation_audit_plan_created !== true) fail("Rotation audit decision missing.");
if (plan.secret_governance_decision.proceed_to_ag29d_schema_rls_security_audit !== true) fail("AG29D readiness missing.");

for (const flag of [
  "secret_creation_approved_now",
  "env_var_write_approved_now",
  "service_role_key_creation_approved_now",
  "service_role_use_approved_now",
  "supabase_activation_approved_now",
  "auth_activation_approved_now",
  "database_creation_approved_now",
  "rls_policy_application_approved_now",
  "server_route_creation_approved_now",
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (plan.secret_governance_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "secret_creation_allowed_in_ag29c",
  "env_var_write_allowed_in_ag29c",
  "service_role_key_creation_allowed_in_ag29c",
  "service_role_use_allowed_in_ag29c",
  "supabase_activation_allowed_in_ag29c",
  "auth_activation_allowed_in_ag29c",
  "database_creation_allowed_in_ag29c",
  "rls_policy_application_allowed_in_ag29c",
  "sql_generation_allowed_in_ag29c",
  "migration_generation_allowed_in_ag29c",
  "server_route_creation_allowed_in_ag29c",
  "api_route_creation_allowed_in_ag29c",
  "deployment_allowed_in_ag29c",
  "public_mutation_allowed_in_ag29c"
]) {
  if (plan[flag] !== false) fail(`${flag} must be false.`);
}

if (boundaryRegister.status !== "secret_boundary_register_created_no_secret_storage") fail("Secret boundary status mismatch.");
if (boundaryRegister.secrets_created !== false) fail("Secrets must not be created.");
if (boundaryRegister.env_vars_written !== false) fail("Env vars must not be written.");
if (boundaryRegister.repository_secret_storage_allowed !== false) fail("Repository secret storage must be false.");
if (!boundaryRegister.boundaries.some((item) => item.secret_id === "SUPABASE_SERVICE_ROLE_KEY" && item.frontend_exposure_future === "never")) fail("Service role frontend block missing.");
for (const item of boundaryRegister.boundaries) {
  if (item.store_now !== false) fail(`${item.secret_id} store_now must be false.`);
  if (item.write_env_now !== false) fail(`${item.secret_id} write_env_now must be false.`);
}

if (envPlan.status !== "env_var_handling_plan_created_no_env_write") fail("Env plan status mismatch.");
if (envPlan.env_vars_written !== false) fail("Env vars must not be written.");
if (envPlan.env_file_created !== false) fail("Env file must not be created.");
if (!envPlan.planned_env_keys.some((item) => item.key_name === "SUPABASE_SERVICE_ROLE_KEY" && item.server_only === true && item.write_now === false)) fail("Service role env handling missing.");
for (const key of envPlan.planned_env_keys) {
  if (key.write_now !== false) fail(`${key.key_name} write_now must be false.`);
}

if (serviceRole.status !== "service_role_safety_plan_created_no_service_role_use") fail("Service role status mismatch.");
if (serviceRole.service_role_key_created !== false) fail("Service role key must not be created.");
if (serviceRole.service_role_used_now !== false) fail("Service role must not be used.");
if (!serviceRole.forbidden_future_usage.includes("frontend_bundle")) fail("Frontend bundle service-role block missing.");
if (!serviceRole.forbidden_future_usage.includes("committed_env_file")) fail("Committed env service-role block missing.");

if (rotationAudit.status !== "secret_rotation_audit_plan_created_no_rotation_runtime") fail("Rotation audit status mismatch.");
if (rotationAudit.rotation_runtime_created !== false) fail("Rotation runtime must not be created.");
if (rotationAudit.audit_runtime_created !== false) fail("Audit runtime must not be created.");
if (rotationAudit.rotation_triggers.length < 5) fail("Rotation triggers incomplete.");

if (nonActivation.status !== "secret_governance_plan_non_activation_audit_passed") fail("Non-activation audit status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG29D) fail("AG29D consumption note missing.");
if (!consumption.future_consumption?.AG29Z) fail("AG29Z consumption note missing.");
if (!consumption.future_consumption?.AG30) fail("AG30 consumption note missing.");
if (!consumption.future_consumption?.AG35_and_later) fail("AG35/later consumption note missing.");

if (blocker.status !== "secret_governance_plan_operations_blocked_pending_ag29d") fail("Blocker status mismatch.");
if (readiness.ready_for_ag29d !== true) fail("AG29D readiness missing.");
if (readiness.allowed_ag29d_mode !== "non_active_schema_rls_security_audit_only") fail("AG29D mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG29D") fail("Boundary must point to AG29D.");
if (boundary.status !== "ag29d_boundary_created_non_active_schema_rls_security_audit_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.secret_governance_plan_created !== true) fail("Review summary missing.");
if (review.summary.non_active_secret_governance_only !== true) fail("Non-active secret-only summary missing.");
if (review.summary.ready_for_ag29d !== true) fail("AG29D readiness summary missing.");

for (const flag of [
  "secret_creation_allowed_now",
  "env_var_write_allowed_now",
  "service_role_key_creation_allowed_now",
  "service_role_use_allowed_now",
  "supabase_activation_allowed_now",
  "auth_activation_allowed_now",
  "database_creation_allowed_now",
  "rls_policy_application_allowed_now",
  "sql_generation_allowed_now",
  "migration_generation_allowed_now",
  "server_route_creation_allowed_now",
  "api_route_creation_allowed_now",
  "deployment_done",
  "public_mutation_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must be false.`);
}

if (ag29b.status !== "rls_policy_plan_created_ready_for_ag29c") fail("AG29B source status mismatch.");
if (ag29bReadiness.ready_for_ag29c !== true) fail("AG29B readiness must allow AG29C.");
if (ag29bNonActivation.audit_passed !== true) fail("AG29B non-activation audit must pass.");
if (ag28Secret.secrets_created !== false) fail("AG28 secrets must remain false.");
if (ag28Secret.env_vars_written !== false) fail("AG28 env vars must remain false.");
if (ag27cSecret.secrets_created !== false) fail("AG27C secrets must remain false.");
if (ag27cSecret.env_vars_written !== false) fail("AG27C env vars must remain false.");
if (ag27dRisk.secrets_created !== false) fail("AG27D secrets must remain false.");
if (ag27dActivation.activation_allowed_now !== false) fail("AG27D activation must remain false.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "secret_governance_plan_created_ready_for_ag29d") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.secret_boundary_register_created !== 1) fail("Preview secret boundary missing.");
if (preview.env_var_handling_plan_created !== 1) fail("Preview env plan missing.");
if (preview.service_role_safety_plan_created !== 1) fail("Preview service role plan missing.");
if (preview.secret_rotation_audit_plan_created !== 1) fail("Preview rotation plan missing.");
if (preview.secrets_created !== 0) fail("Preview must record 0 secrets.");
if (preview.env_vars_written !== 0) fail("Preview must record 0 env vars.");
if (preview.service_role_key_created !== 0) fail("Preview must record 0 service role key.");
if (preview.service_role_used !== 0) fail("Preview must record 0 service role use.");
if (preview.supabase_activation_allowed !== 0) fail("Preview must record 0 Supabase activation.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.sql_generated !== 0) fail("Preview must record 0 SQL.");
if (preview.migrations_generated !== 0) fail("Preview must record 0 migrations.");
if (preview.database_objects_created !== 0) fail("Preview must record 0 database objects.");
if (preview.rls_policies_applied !== 0) fail("Preview must record 0 RLS policies.");
if (preview.server_routes_created !== 0) fail("Preview must record 0 server routes.");
if (preview.api_routes_created !== 0) fail("Preview must record 0 API routes.");
if (preview.deployment_done !== 0) fail("Preview must record 0 deployment.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag29b-rls-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  "data/content-intelligence/backend-architecture/ag29b-system-action-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag28-secret-environment-doctrine.json",
  "data/content-intelligence/backend-decision/ag27d-secret-risk-register.json",
  "data/content-intelligence/backend-decision/ag27d-activation-guard-register.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "secret_governance_plan_created" ||
    k === "secret_boundary_register_created" ||
    k === "env_var_handling_plan_created" ||
    k === "service_role_safety_plan_created" ||
    k === "secret_rotation_audit_plan_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag29c"]) fail("Missing generate:ag29c script.");
if (!pkg.scripts?.["validate:ag29c"]) fail("Missing validate:ag29c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag29c")) fail("validate:project must include validate:ag29c.");

pass("AG29C Secret Governance Plan is present.");
pass("Secret boundary, env-var handling, service-role safety and rotation/audit plans are valid.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No secrets, env vars, service-role use, Supabase/Auth/backend activation, SQL, database, RLS, routes, deployment or public mutation is enabled.");
pass("AG29D Schema/RLS Security Audit boundary is ready.");
