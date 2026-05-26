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
  console.error(`❌ AG34D validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

function allFalse(obj) {
  return Object.values(obj || {}).every((value) => value === false);
}

const required = [
  "data/content-intelligence/backend-architecture/ag34a-backend-activation-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-supabase-project-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-auth-method-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-rls-rollback-test-user-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-readiness-checklist-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag34b-environment-secret-readiness.json",
  "data/content-intelligence/backend-architecture/ag34b-env-var-placement-plan.json",
  "data/content-intelligence/backend-architecture/ag34b-secret-naming-readiness-plan.json",
  "data/content-intelligence/backend-architecture/ag34b-service-role-protection-plan.json",
  "data/content-intelligence/backend-architecture/ag34b-local-vercel-env-readiness-plan.json",
  "data/content-intelligence/backend-architecture/ag34b-secret-readiness-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag34c-test-user-role-plan.json",
  "data/content-intelligence/backend-architecture/ag34c-test-admin-user-plan.json",
  "data/content-intelligence/backend-architecture/ag34c-test-editor-user-plan.json",
  "data/content-intelligence/backend-architecture/ag34c-role-restriction-test-plan.json",
  "data/content-intelligence/backend-architecture/ag34c-login-test-boundary-plan.json",
  "data/content-intelligence/backend-architecture/ag34c-test-user-role-plan-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag34c-backend-readiness-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag34c-to-ag34d-backend-readiness-audit-boundary.json",
  "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  "data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag34d-backend-readiness-audit.json",
  "data/content-intelligence/backend-architecture/ag34d-backend-readiness-audit.json",
  "data/content-intelligence/backend-architecture/ag34d-readiness-source-chain-audit-register.json",
  "data/content-intelligence/backend-architecture/ag34d-activation-blocker-audit-register.json",
  "data/content-intelligence/backend-architecture/ag34d-secret-role-rls-readiness-audit-register.json",
  "data/content-intelligence/backend-architecture/ag34d-backend-readiness-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag34d-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag34d-backend-readiness-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag34d-backend-activation-readiness-closure-record.json",
  "data/content-intelligence/mutation-plans/ag34d-to-ag34z-backend-activation-readiness-closure-boundary.json",
  "data/quality/ag34d-backend-readiness-audit.json",
  "data/quality/ag34d-backend-readiness-audit-preview.json",
  "docs/quality/AG34D_BACKEND_READINESS_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag34d-backend-readiness-audit.json");
const audit = readJson("data/content-intelligence/backend-architecture/ag34d-backend-readiness-audit.json");
const sourceChainAudit = readJson("data/content-intelligence/backend-architecture/ag34d-readiness-source-chain-audit-register.json");
const activationBlockerAudit = readJson("data/content-intelligence/backend-architecture/ag34d-activation-blocker-audit-register.json");
const secretRoleRlsAudit = readJson("data/content-intelligence/backend-architecture/ag34d-secret-role-rls-readiness-audit-register.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag34d-backend-readiness-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag34d-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag34d-backend-readiness-audit-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag34d-backend-activation-readiness-closure-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag34d-to-ag34z-backend-activation-readiness-closure-boundary.json");
const registry = readJson("data/quality/ag34d-backend-readiness-audit.json");
const preview = readJson("data/quality/ag34d-backend-readiness-audit-preview.json");

const ag34a = readJson("data/content-intelligence/backend-architecture/ag34a-backend-activation-readiness-checklist.json");
const ag34b = readJson("data/content-intelligence/backend-architecture/ag34b-environment-secret-readiness.json");
const ag34c = readJson("data/content-intelligence/backend-architecture/ag34c-test-user-role-plan.json");
const ag34cReadiness = readJson("data/content-intelligence/quality-registry/ag34c-backend-readiness-audit-readiness-record.json");
const ag34cNonActivation = readJson("data/content-intelligence/backend-architecture/ag34c-test-user-role-plan-non-activation-audit-register.json");
const ag33z = readJson("data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json");
const ag33zBlocker = readJson("data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json");
const ag32zBlocker = readJson("data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "backend_readiness_audit_created_ready_for_ag34z") fail("Review status mismatch.");
if (audit.status !== "backend_readiness_audit_created_ready_for_ag34z") fail("Audit status mismatch.");
if (audit.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (audit.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (audit.audit_decision.backend_readiness_audit_created !== true) fail("Audit decision missing.");
if (audit.audit_decision.readiness_source_chain_audit_passed !== true) fail("Source-chain audit must pass.");
if (audit.audit_decision.activation_blocker_audit_passed !== true) fail("Activation blocker audit must pass.");
if (audit.audit_decision.secret_role_rls_readiness_audit_passed !== true) fail("Secret/role/RLS audit must pass.");
if (audit.audit_decision.non_activation_audit_passed !== true) fail("Non-activation audit must pass.");
if (audit.audit_decision.all_audits_passed !== true) fail("All audits must pass.");
if (audit.audit_decision.proceed_to_ag34z_backend_activation_readiness_closure !== true) fail("AG34Z readiness missing.");

for (const flag of [
  "supabase_project_creation_approved_now",
  "supabase_connection_approved_now",
  "auth_activation_approved_now",
  "real_user_creation_approved_now",
  "test_user_creation_approved_now",
  "credential_generation_approved_now",
  "database_creation_approved_now",
  "database_write_approved_now",
  "sql_generation_approved_now",
  "sql_application_approved_now",
  "migration_generation_approved_now",
  "migration_application_approved_now",
  "rls_policy_creation_approved_now",
  "rls_policy_application_approved_now",
  "secret_creation_approved_now",
  "env_var_write_approved_now",
  "service_role_key_creation_approved_now",
  "service_role_key_storage_approved_now",
  "service_role_key_exposure_approved_now",
  "server_route_creation_approved_now",
  "api_route_creation_approved_now",
  "handler_runtime_approved_now",
  "queue_runtime_approved_now",
  "audit_runtime_approved_now",
  "rollback_runtime_approved_now",
  "github_write_approved_now",
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (audit.audit_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const item of [sourceChainAudit, activationBlockerAudit, secretRoleRlsAudit, nonActivation]) {
  if (item.audit_passed !== true) fail(`${item.title} must pass.`);
  for (const check of item.checks) {
    if (check.passed !== true) fail(`${item.title} check failed: ${check.check_id}`);
  }
}

if (!consumption.future_consumption?.AG34Z) fail("AG34Z consumption note missing.");
if (!consumption.future_consumption?.AG35A) fail("AG35A consumption note missing.");
if (!consumption.future_consumption?.AG35B) fail("AG35B consumption note missing.");
if (!consumption.future_consumption?.AG36) fail("AG36 consumption note missing.");

if (blocker.status !== "backend_readiness_audit_operations_blocked_pending_ag34z") fail("Blocker status mismatch.");
if (readiness.ready_for_ag34z !== true) fail("AG34Z readiness missing.");
if (readiness.allowed_ag34z_mode !== "backend_activation_readiness_closure_only") fail("AG34Z mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.supabase_activation_allowed_now !== false) fail("Supabase activation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (readiness.database_write_allowed_now !== false) fail("Database write must be false.");
if (readiness.rls_application_allowed_now !== false) fail("RLS application must be false.");
if (readiness.secret_write_allowed_now !== false) fail("Secret write must be false.");
if (readiness.env_var_write_allowed_now !== false) fail("Env var write must be false.");

if (boundary.next_stage_id !== "AG34Z") fail("Boundary must point to AG34Z.");
if (boundary.status !== "ag34z_boundary_created_backend_activation_readiness_closure_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.backend_readiness_audit_created !== true) fail("Review summary missing.");
if (review.summary.all_audits_passed !== true) fail("Review all audits must pass.");
if (review.summary.ready_for_ag34z !== true) fail("AG34Z readiness summary missing.");

for (const flag of [
  "supabase_project_created",
  "supabase_connected",
  "auth_enabled",
  "real_user_created",
  "test_user_created",
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
  "service_role_key_created",
  "service_role_key_stored",
  "service_role_key_exposed",
  "server_routes_created",
  "api_routes_created",
  "route_guard_runtime_created",
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
if (ag34b.status !== "environment_secret_readiness_created_ready_for_ag34c") fail("AG34B source status mismatch.");
if (ag34c.status !== "test_user_role_plan_created_ready_for_ag34d") fail("AG34C source status mismatch.");
if (ag34cReadiness.ready_for_ag34d !== true) fail("AG34C readiness must allow AG34D.");
if (ag34cNonActivation.audit_passed !== true) fail("AG34C non-activation audit must pass.");
if (ag33z.status !== "dynamic_publish_scaffold_closure_created_ready_for_ag34a") fail("AG33Z source status mismatch.");
if (!allFalse(ag33zBlocker.blocked_activation_items)) fail("AG33Z blockers must remain false.");
if (!allFalse(ag32zBlocker.blocked_activation_items)) fail("AG32Z blockers must remain false.");

if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "backend_readiness_audit_created_ready_for_ag34z") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.backend_readiness_audit_created !== 1) fail("Preview audit missing.");
if (preview.readiness_source_chain_audit_passed !== 1) fail("Preview source-chain audit must pass.");
if (preview.activation_blocker_audit_passed !== 1) fail("Preview activation-blocker audit must pass.");
if (preview.secret_role_rls_readiness_audit_passed !== 1) fail("Preview secret/role/RLS audit must pass.");
if (preview.non_activation_audit_passed !== 1) fail("Preview non-activation audit must pass.");

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
  "data/content-intelligence/backend-architecture/ag34b-environment-secret-readiness.json",
  "data/content-intelligence/backend-architecture/ag34c-test-user-role-plan.json",
  "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!audit.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Audit did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "backend_readiness_audit_created" ||
    k === "readiness_source_chain_audit_created" ||
    k === "activation_blocker_audit_created" ||
    k === "secret_role_rls_readiness_audit_created" ||
    k === "backend_readiness_non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag34d"]) fail("Missing generate:ag34d script.");
if (!pkg.scripts?.["validate:ag34d"]) fail("Missing validate:ag34d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag34d")) fail("validate:project must include validate:ag34d.");

pass("AG34D Backend Readiness Audit is present.");
pass("Source-chain, activation-blocker, secret/role/RLS and non-activation audits are valid.");
pass("No Supabase/Auth/backend activation, database, RLS, secrets, accounts, deployment or public mutation is enabled.");
pass("AG34Z Backend Activation Readiness Closure boundary is ready.");
