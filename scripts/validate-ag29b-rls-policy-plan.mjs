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
  console.error(`❌ AG29B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag29a-supabase-schema-draft.json",
  "data/content-intelligence/backend-architecture/ag29a-supabase-schema-draft.json",
  "data/content-intelligence/backend-architecture/ag29a-schema-entity-register.json",
  "data/content-intelligence/backend-architecture/ag29a-table-relationship-map.json",
  "data/content-intelligence/backend-architecture/ag29a-state-field-model.json",
  "data/content-intelligence/backend-architecture/ag29a-publish-audit-rollback-schema-draft.json",
  "data/content-intelligence/backend-architecture/ag29a-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag29a-rls-policy-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag29a-to-ag29b-rls-policy-plan-boundary.json",
  "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json",
  "data/content-intelligence/backend-architecture/ag28-service-boundary-model.json",
  "data/content-intelligence/backend-architecture/ag28-secret-environment-doctrine.json",
  "data/content-intelligence/backend-decision/ag27c-rls-policy-plan.json",
  "data/content-intelligence/backend-decision/ag27c-auth-role-access-model.json",
  "data/content-intelligence/backend-decision/ag27d-access-boundary-matrix.json",
  "data/content-intelligence/backend-decision/ag27d-rls-test-scenario-model.json",
  "data/content-intelligence/backend-decision/ag27d-activation-guard-register.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag29b-rls-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29b-rls-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  "data/content-intelligence/backend-architecture/ag29b-table-rls-rule-map.json",
  "data/content-intelligence/backend-architecture/ag29b-system-action-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29b-public-reader-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29b-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag29b-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag29b-rls-policy-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag29b-secret-governance-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag29b-to-ag29c-secret-governance-plan-boundary.json",
  "data/quality/ag29b-rls-policy-plan.json",
  "data/quality/ag29b-rls-policy-plan-preview.json",
  "docs/quality/AG29B_RLS_POLICY_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag29b-rls-policy-plan.json");
const plan = readJson("data/content-intelligence/backend-architecture/ag29b-rls-policy-plan.json");
const roleScope = readJson("data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json");
const tableRuleMap = readJson("data/content-intelligence/backend-architecture/ag29b-table-rls-rule-map.json");
const systemAction = readJson("data/content-intelligence/backend-architecture/ag29b-system-action-policy-plan.json");
const publicReader = readJson("data/content-intelligence/backend-architecture/ag29b-public-reader-policy-plan.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag29b-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag29b-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag29b-rls-policy-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag29b-secret-governance-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag29b-to-ag29c-secret-governance-plan-boundary.json");
const registry = readJson("data/quality/ag29b-rls-policy-plan.json");
const preview = readJson("data/quality/ag29b-rls-policy-plan-preview.json");

const ag29a = readJson("data/content-intelligence/backend-architecture/ag29a-supabase-schema-draft.json");
const ag29aReadiness = readJson("data/content-intelligence/quality-registry/ag29a-rls-policy-plan-readiness-record.json");
const ag29aNonActivation = readJson("data/content-intelligence/backend-architecture/ag29a-non-activation-audit-register.json");
const ag27cRls = readJson("data/content-intelligence/backend-decision/ag27c-rls-policy-plan.json");
const ag27dScenario = readJson("data/content-intelligence/backend-decision/ag27d-rls-test-scenario-model.json");
const ag27dActivation = readJson("data/content-intelligence/backend-decision/ag27d-activation-guard-register.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "rls_policy_plan_created_ready_for_ag29c") fail("Review status mismatch.");
if (plan.status !== "rls_policy_plan_created_ready_for_ag29c") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (plan.rls_decision.non_active_rls_policy_plan_created !== true) fail("Non-active RLS decision missing.");
if (plan.rls_decision.role_scope_register_created !== true) fail("Role scope decision missing.");
if (plan.rls_decision.table_rule_map_created !== true) fail("Table rule decision missing.");
if (plan.rls_decision.system_action_policy_plan_created !== true) fail("System action decision missing.");
if (plan.rls_decision.public_reader_policy_plan_created !== true) fail("Public reader decision missing.");
if (plan.rls_decision.proceed_to_ag29c_secret_governance_plan !== true) fail("AG29C readiness missing.");

for (const flag of [
  "sql_generation_approved_now",
  "rls_policy_creation_approved_now",
  "rls_policy_application_approved_now",
  "database_creation_approved_now",
  "auth_activation_approved_now",
  "secrets_or_env_setup_approved_now",
  "server_route_creation_approved_now",
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (plan.rls_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "sql_generation_allowed_in_ag29b",
  "rls_policy_creation_allowed_in_ag29b",
  "rls_policy_application_allowed_in_ag29b",
  "database_creation_allowed_in_ag29b",
  "auth_activation_allowed_in_ag29b",
  "secret_creation_allowed_in_ag29b",
  "env_var_write_allowed_in_ag29b",
  "server_route_creation_allowed_in_ag29b",
  "api_route_creation_allowed_in_ag29b",
  "deployment_allowed_in_ag29b",
  "public_mutation_allowed_in_ag29b"
]) {
  if (plan[flag] !== false) fail(`${flag} must be false.`);
}

if (roleScope.status !== "role_scope_policy_register_created_no_rls_application") fail("Role scope status mismatch.");
if (roleScope.rls_policies_applied !== false) fail("Role scope RLS policies must not be applied.");
if (roleScope.auth_enabled !== false) fail("Auth must not be enabled.");
for (const role of ["admin", "editor", "subscriber", "anonymous_public", "service_role_server_only"]) {
  if (!roleScope.role_scopes.some((item) => item.role_code === role)) fail(`Missing role scope: ${role}`);
}
const editor = roleScope.role_scopes.find((item) => item.role_code === "editor");
if (!editor.forbidden_future_actions.includes("global_browse")) fail("Editor global browse block missing.");
if (!editor.forbidden_future_actions.includes("self_assign")) fail("Editor self-assign block missing.");
if (!editor.forbidden_future_actions.includes("publish")) fail("Editor publish block missing.");
for (const scope of roleScope.role_scopes) {
  if (scope.rls_policy_apply_now !== false) fail(`${scope.role_code} RLS apply now must be false.`);
}

if (tableRuleMap.status !== "table_rls_rule_map_created_no_policy_application") fail("Table rule map status mismatch.");
if (tableRuleMap.rls_policies_created !== false) fail("RLS policies must not be created.");
if (tableRuleMap.rls_policies_applied !== false) fail("RLS policies must not be applied.");
if (tableRuleMap.table_policy_groups.length < 10) fail("Expected at least 10 table policy groups.");
for (const group of tableRuleMap.table_policy_groups) {
  if (group.apply_now !== false) fail(`${group.table_name} apply_now must be false.`);
}

if (systemAction.status !== "system_action_policy_plan_created_no_runtime") fail("System action status mismatch.");
if (systemAction.runtime_created !== false) fail("System action runtime must not be created.");
if (systemAction.service_role_used_now !== false) fail("Service role must not be used now.");
for (const action of systemAction.system_actions) {
  if (action.execute_now !== false) fail(`${action.action_id} must not execute now.`);
}

if (publicReader.status !== "public_reader_policy_plan_created_no_public_runtime") fail("Public reader status mismatch.");
if (publicReader.public_runtime_created !== false) fail("Public runtime must not be created.");
if (publicReader.public_policy_applied !== false) fail("Public policy must not be applied.");
for (const rule of publicReader.public_rules) {
  if (rule.apply_now !== false) fail(`${rule.rule_id} apply_now must be false.`);
}

if (nonActivation.status !== "rls_policy_plan_non_activation_audit_passed") fail("Non-activation audit status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG29C) fail("AG29C consumption note missing.");
if (!consumption.future_consumption?.AG29D) fail("AG29D consumption note missing.");
if (!consumption.future_consumption?.AG29Z) fail("AG29Z consumption note missing.");
if (!consumption.future_consumption?.AG30) fail("AG30 consumption note missing.");

if (blocker.status !== "rls_policy_plan_operations_blocked_pending_ag29c") fail("Blocker status mismatch.");
if (readiness.ready_for_ag29c !== true) fail("AG29C readiness missing.");
if (readiness.allowed_ag29c_mode !== "non_active_secret_governance_plan_only") fail("AG29C mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG29C") fail("Boundary must point to AG29C.");
if (boundary.status !== "ag29c_boundary_created_non_active_secret_governance_plan_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.rls_policy_plan_created !== true) fail("Review summary missing.");
if (review.summary.non_active_rls_policy_plan_only !== true) fail("Non-active RLS-only summary missing.");
if (review.summary.ready_for_ag29c !== true) fail("AG29C readiness summary missing.");

for (const flag of [
  "sql_generation_allowed_now",
  "rls_policy_creation_allowed_now",
  "rls_policy_application_allowed_now",
  "database_creation_allowed_now",
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

if (ag29a.status !== "supabase_schema_draft_created_ready_for_ag29b") fail("AG29A source status mismatch.");
if (ag29aReadiness.ready_for_ag29b !== true) fail("AG29A readiness must allow AG29B.");
if (ag29aNonActivation.audit_passed !== true) fail("AG29A non-activation audit must pass.");
if (ag27cRls.rls_application_allowed !== false) fail("AG27C RLS application must remain false.");
if (ag27dScenario.rls_policy_application_allowed !== false) fail("AG27D RLS policy application must remain false.");
if (ag27dActivation.activation_allowed_now !== false) fail("AG27D activation must remain false.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "rls_policy_plan_created_ready_for_ag29c") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.role_scope_register_created !== 1) fail("Preview role scope missing.");
if (preview.table_rule_map_created !== 1) fail("Preview table rule map missing.");
if (preview.system_action_policy_plan_created !== 1) fail("Preview system action missing.");
if (preview.public_reader_policy_plan_created !== 1) fail("Preview public reader missing.");
if (preview.sql_generated !== 0) fail("Preview must record 0 SQL.");
if (preview.migrations_generated !== 0) fail("Preview must record 0 migrations.");
if (preview.database_objects_created !== 0) fail("Preview must record 0 database objects.");
if (preview.rls_policies_created !== 0) fail("Preview must record 0 RLS policies created.");
if (preview.rls_policies_applied !== 0) fail("Preview must record 0 RLS policies applied.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.secrets_created !== 0) fail("Preview must record 0 secrets.");
if (preview.env_vars_written !== 0) fail("Preview must record 0 env writes.");
if (preview.server_routes_created !== 0) fail("Preview must record 0 server routes.");
if (preview.api_routes_created !== 0) fail("Preview must record 0 API routes.");
if (preview.deployment_done !== 0) fail("Preview must record 0 deployment.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag29a-supabase-schema-draft.json",
  "data/content-intelligence/backend-architecture/ag29a-schema-entity-register.json",
  "data/content-intelligence/backend-architecture/ag29a-table-relationship-map.json",
  "data/content-intelligence/backend-decision/ag27c-rls-policy-plan.json",
  "data/content-intelligence/backend-decision/ag27d-rls-test-scenario-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "rls_policy_plan_created" ||
    k === "role_scope_register_created" ||
    k === "table_rule_map_created" ||
    k === "system_action_policy_plan_created" ||
    k === "public_reader_policy_plan_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag29b"]) fail("Missing generate:ag29b script.");
if (!pkg.scripts?.["validate:ag29b"]) fail("Missing validate:ag29b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag29b")) fail("validate:project must include validate:ag29b.");

pass("AG29B RLS Policy Plan is present.");
pass("Role scope register, table RLS rule map, system-action and public-reader plans are valid.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No SQL, migrations, database objects, RLS creation/application, Auth, secrets, routes, deployment or public mutation is enabled.");
pass("AG29C Secret Governance Plan boundary is ready.");
