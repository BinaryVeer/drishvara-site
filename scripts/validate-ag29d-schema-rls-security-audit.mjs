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
  console.error(`❌ AG29D validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag29c-secret-governance-plan.json",
  "data/content-intelligence/backend-architecture/ag29c-secret-boundary-register.json",
  "data/content-intelligence/backend-architecture/ag29c-env-var-handling-plan.json",
  "data/content-intelligence/backend-architecture/ag29c-service-role-safety-plan.json",
  "data/content-intelligence/backend-architecture/ag29c-secret-rotation-and-audit-plan.json",
  "data/content-intelligence/backend-architecture/ag29c-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag29c-schema-rls-security-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag29c-to-ag29d-schema-rls-security-audit-boundary.json",
  "data/content-intelligence/backend-architecture/ag29b-rls-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  "data/content-intelligence/backend-architecture/ag29b-table-rls-rule-map.json",
  "data/content-intelligence/backend-architecture/ag29b-system-action-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29b-public-reader-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29a-supabase-schema-draft.json",
  "data/content-intelligence/backend-architecture/ag29a-schema-entity-register.json",
  "data/content-intelligence/backend-architecture/ag29a-table-relationship-map.json",
  "data/content-intelligence/backend-architecture/ag29a-state-field-model.json",
  "data/content-intelligence/backend-architecture/ag29a-publish-audit-rollback-schema-draft.json",
  "data/content-intelligence/backend-decision/ag27d-access-boundary-matrix.json",
  "data/content-intelligence/backend-decision/ag27d-rls-test-scenario-model.json",
  "data/content-intelligence/backend-decision/ag27d-activation-guard-register.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag29d-schema-rls-security-audit.json",
  "data/content-intelligence/backend-architecture/ag29d-schema-rls-security-audit.json",
  "data/content-intelligence/backend-architecture/ag29d-schema-security-audit-register.json",
  "data/content-intelligence/backend-architecture/ag29d-rls-security-audit-register.json",
  "data/content-intelligence/backend-architecture/ag29d-secret-safety-audit-register.json",
  "data/content-intelligence/backend-architecture/ag29d-role-separation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag29d-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag29d-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag29d-schema-rls-security-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag29d-schema-rls-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag29d-to-ag29z-schema-rls-closure-boundary.json",
  "data/quality/ag29d-schema-rls-security-audit.json",
  "data/quality/ag29d-schema-rls-security-audit-preview.json",
  "docs/quality/AG29D_SCHEMA_RLS_SECURITY_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag29d-schema-rls-security-audit.json");
const audit = readJson("data/content-intelligence/backend-architecture/ag29d-schema-rls-security-audit.json");
const schemaAudit = readJson("data/content-intelligence/backend-architecture/ag29d-schema-security-audit-register.json");
const rlsAudit = readJson("data/content-intelligence/backend-architecture/ag29d-rls-security-audit-register.json");
const secretAudit = readJson("data/content-intelligence/backend-architecture/ag29d-secret-safety-audit-register.json");
const roleAudit = readJson("data/content-intelligence/backend-architecture/ag29d-role-separation-audit-register.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag29d-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag29d-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag29d-schema-rls-security-audit-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag29d-schema-rls-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag29d-to-ag29z-schema-rls-closure-boundary.json");
const registry = readJson("data/quality/ag29d-schema-rls-security-audit.json");
const preview = readJson("data/quality/ag29d-schema-rls-security-audit-preview.json");

const ag29c = readJson("data/content-intelligence/backend-architecture/ag29c-secret-governance-plan.json");
const ag29cReadiness = readJson("data/content-intelligence/quality-registry/ag29c-schema-rls-security-audit-readiness-record.json");
const ag29cNonActivation = readJson("data/content-intelligence/backend-architecture/ag29c-non-activation-audit-register.json");
const ag29b = readJson("data/content-intelligence/backend-architecture/ag29b-rls-policy-plan.json");
const ag29a = readJson("data/content-intelligence/backend-architecture/ag29a-supabase-schema-draft.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "schema_rls_security_audit_created_ready_for_ag29z") fail("Review status mismatch.");
if (audit.status !== "schema_rls_security_audit_created_ready_for_ag29z") fail("Audit status mismatch.");
if (audit.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (audit.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (audit.audit_decision.non_active_schema_rls_security_audit_created !== true) fail("Audit decision missing.");
if (audit.audit_decision.schema_security_audit_passed !== true) fail("Schema audit must pass.");
if (audit.audit_decision.rls_security_audit_passed !== true) fail("RLS audit must pass.");
if (audit.audit_decision.secret_safety_audit_passed !== true) fail("Secret audit must pass.");
if (audit.audit_decision.role_separation_audit_passed !== true) fail("Role separation audit must pass.");
if (audit.audit_decision.non_activation_audit_passed !== true) fail("Non-activation audit must pass.");
if (audit.audit_decision.all_audits_passed !== true) fail("All audits must pass.");
if (audit.audit_decision.proceed_to_ag29z_schema_rls_closure !== true) fail("AG29Z readiness missing.");

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
  if (audit.audit_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "supabase_activation_allowed_in_ag29d",
  "sql_generation_allowed_in_ag29d",
  "migration_generation_allowed_in_ag29d",
  "database_creation_allowed_in_ag29d",
  "rls_policy_creation_allowed_in_ag29d",
  "rls_policy_application_allowed_in_ag29d",
  "auth_activation_allowed_in_ag29d",
  "secret_creation_allowed_in_ag29d",
  "env_var_write_allowed_in_ag29d",
  "server_route_creation_allowed_in_ag29d",
  "api_route_creation_allowed_in_ag29d",
  "deployment_allowed_in_ag29d",
  "public_mutation_allowed_in_ag29d"
]) {
  if (audit[flag] !== false) fail(`${flag} must be false.`);
}

for (const [name, reg] of Object.entries({ schemaAudit, rlsAudit, secretAudit, roleAudit })) {
  if (reg.audit_passed !== true) fail(`${name} must pass.`);
  if (reg.failed_checks.length !== 0) fail(`${name} must have zero failed checks.`);
  for (const check of reg.checks) {
    if (check.passed !== true) fail(`${name} check failed: ${check.check_id}`);
  }
}

if (schemaAudit.database_objects_created !== false) fail("Schema audit database objects must be false.");
if (schemaAudit.sql_generated !== false) fail("Schema audit SQL must be false.");
if (schemaAudit.migrations_generated !== false) fail("Schema audit migrations must be false.");
if (rlsAudit.rls_policies_created !== false) fail("RLS policies must not be created.");
if (rlsAudit.rls_policies_applied !== false) fail("RLS policies must not be applied.");
if (secretAudit.secrets_created !== false) fail("Secrets must not be created.");
if (secretAudit.env_vars_written !== false) fail("Env vars must not be written.");
if (secretAudit.service_role_used_now !== false) fail("Service role must not be used.");
if (roleAudit.auth_enabled !== false) fail("Auth must not be enabled.");
if (roleAudit.admin_login_created !== false) fail("Admin login must not be created.");
if (roleAudit.editor_login_created !== false) fail("Editor login must not be created.");

if (nonActivation.status !== "schema_rls_security_non_activation_audit_passed") fail("Non-activation audit status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG29Z) fail("AG29Z consumption note missing.");
if (!consumption.future_consumption?.AG30) fail("AG30 consumption note missing.");
if (!consumption.future_consumption?.AG34_and_later) fail("AG34/later note missing.");
if (!consumption.future_consumption?.AG35_and_later) fail("AG35/later note missing.");

if (blocker.status !== "schema_rls_security_audit_operations_blocked_pending_ag29z") fail("Blocker status mismatch.");
if (readiness.ready_for_ag29z !== true) fail("AG29Z readiness missing.");
if (readiness.allowed_ag29z_mode !== "non_active_schema_rls_closure_only") fail("AG29Z mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG29Z") fail("Boundary must point to AG29Z.");
if (boundary.status !== "ag29z_boundary_created_non_active_schema_rls_closure_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.schema_rls_security_audit_created !== true) fail("Review summary missing.");
if (review.summary.non_active_audit_only !== true) fail("Non-active audit-only summary missing.");
if (review.summary.ready_for_ag29z !== true) fail("AG29Z readiness summary missing.");

for (const flag of [
  "supabase_activation_allowed_now",
  "sql_generation_allowed_now",
  "migration_generation_allowed_now",
  "database_creation_allowed_now",
  "rls_policy_creation_allowed_now",
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

if (ag29c.status !== "secret_governance_plan_created_ready_for_ag29d") fail("AG29C source status mismatch.");
if (ag29cReadiness.ready_for_ag29d !== true) fail("AG29C readiness must allow AG29D.");
if (ag29cNonActivation.audit_passed !== true) fail("AG29C non-activation audit must pass.");
if (ag29b.status !== "rls_policy_plan_created_ready_for_ag29c") fail("AG29B source status mismatch.");
if (ag29a.status !== "supabase_schema_draft_created_ready_for_ag29b") fail("AG29A source status mismatch.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "schema_rls_security_audit_created_ready_for_ag29z") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.schema_security_audit_passed !== 1) fail("Preview schema audit missing.");
if (preview.rls_security_audit_passed !== 1) fail("Preview RLS audit missing.");
if (preview.secret_safety_audit_passed !== 1) fail("Preview secret audit missing.");
if (preview.role_separation_audit_passed !== 1) fail("Preview role audit missing.");
if (preview.non_activation_audit_passed !== 1) fail("Preview non-activation audit missing.");
if (preview.supabase_activation_allowed !== 0) fail("Preview must record 0 Supabase activation.");
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
  "data/content-intelligence/backend-architecture/ag29c-secret-governance-plan.json",
  "data/content-intelligence/backend-architecture/ag29b-rls-policy-plan.json",
  "data/content-intelligence/backend-architecture/ag29a-supabase-schema-draft.json",
  "data/content-intelligence/backend-decision/ag27d-access-boundary-matrix.json",
  "data/content-intelligence/backend-decision/ag27d-rls-test-scenario-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!audit.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Audit did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "schema_rls_security_audit_created" ||
    k === "schema_security_audit_register_created" ||
    k === "rls_security_audit_register_created" ||
    k === "secret_safety_audit_register_created" ||
    k === "role_separation_audit_register_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag29d"]) fail("Missing generate:ag29d script.");
if (!pkg.scripts?.["validate:ag29d"]) fail("Missing validate:ag29d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag29d")) fail("validate:project must include validate:ag29d.");

pass("AG29D Schema/RLS Security Audit is present.");
pass("Schema, RLS, secret safety and role separation audits are valid.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No Supabase/Auth/backend activation, SQL, database, RLS, secrets, routes, deployment or public mutation is enabled.");
pass("AG29Z Schema/RLS Closure boundary is ready.");
