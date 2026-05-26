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
  console.error(`❌ AG34Z validation failed: ${msg}`);
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
  "data/content-intelligence/backend-architecture/ag34d-backend-readiness-audit.json",
  "data/content-intelligence/backend-architecture/ag34d-readiness-source-chain-audit-register.json",
  "data/content-intelligence/backend-architecture/ag34d-activation-blocker-audit-register.json",
  "data/content-intelligence/backend-architecture/ag34d-secret-role-rls-readiness-audit-register.json",
  "data/content-intelligence/backend-architecture/ag34d-backend-readiness-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag34d-backend-activation-readiness-closure-record.json",
  "data/content-intelligence/mutation-plans/ag34d-to-ag34z-backend-activation-readiness-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  "data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag34z-backend-activation-readiness-closure.json",
  "data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure.json",
  "data/content-intelligence/backend-architecture/ag34z-ag34-source-chain-register.json",
  "data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure-register.json",
  "data/content-intelligence/backend-architecture/ag34z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag34z-ag35-explicit-activation-approval-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag34z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag34z-backend-activation-readiness-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag34z-ag35-explicit-activation-approval-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag34z-to-ag35a-explicit-activation-approval-boundary.json",
  "data/quality/ag34z-backend-activation-readiness-closure.json",
  "data/quality/ag34z-backend-activation-readiness-closure-preview.json",
  "docs/quality/AG34Z_BACKEND_ACTIVATION_READINESS_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag34z-backend-activation-readiness-closure.json");
const closure = readJson("data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure.json");
const sourceChain = readJson("data/content-intelligence/backend-architecture/ag34z-ag34-source-chain-register.json");
const closureRegister = readJson("data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure-register.json");
const activationBlocker = readJson("data/content-intelligence/backend-architecture/ag34z-activation-blocker-carry-forward.json");
const ag35Handoff = readJson("data/content-intelligence/backend-architecture/ag34z-ag35-explicit-activation-approval-handoff-plan.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag34z-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag34z-backend-activation-readiness-closure-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag34z-ag35-explicit-activation-approval-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag34z-to-ag35a-explicit-activation-approval-boundary.json");
const registry = readJson("data/quality/ag34z-backend-activation-readiness-closure.json");
const preview = readJson("data/quality/ag34z-backend-activation-readiness-closure-preview.json");

const ag34a = readJson("data/content-intelligence/backend-architecture/ag34a-backend-activation-readiness-checklist.json");
const ag34b = readJson("data/content-intelligence/backend-architecture/ag34b-environment-secret-readiness.json");
const ag34c = readJson("data/content-intelligence/backend-architecture/ag34c-test-user-role-plan.json");
const ag34d = readJson("data/content-intelligence/backend-architecture/ag34d-backend-readiness-audit.json");
const ag34dReadiness = readJson("data/content-intelligence/quality-registry/ag34d-backend-activation-readiness-closure-record.json");
const ag34dSource = readJson("data/content-intelligence/backend-architecture/ag34d-readiness-source-chain-audit-register.json");
const ag34dBlockerAudit = readJson("data/content-intelligence/backend-architecture/ag34d-activation-blocker-audit-register.json");
const ag34dSecretRole = readJson("data/content-intelligence/backend-architecture/ag34d-secret-role-rls-readiness-audit-register.json");
const ag34dNonActivation = readJson("data/content-intelligence/backend-architecture/ag34d-backend-readiness-non-activation-audit-register.json");
const ag33z = readJson("data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json");
const ag33zBlocker = readJson("data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json");
const ag32zBlocker = readJson("data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "backend_activation_readiness_closure_created_ready_for_ag35a") fail("Review status mismatch.");
if (closure.status !== "backend_activation_readiness_closure_created_ready_for_ag35a") fail("Closure status mismatch.");
if (closure.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (closure.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (closure.closure_decision.ag34_chain_closed !== true) fail("AG34 chain must be closed.");
if (closure.closure_decision.backend_activation_readiness_closed !== true) fail("Backend readiness must be closed.");
if (closure.closure_decision.ag35a_ready_for_explicit_activation_approval !== true) fail("AG35A readiness missing.");

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
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (sourceChain.chain_length !== 4) fail("Source chain length must be 4.");
for (const stage of ["AG34A", "AG34B", "AG34C", "AG34D"]) {
  if (!sourceChain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage ${stage}.`);
}

if (closureRegister.status !== "backend_activation_readiness_closed_ready_for_ag35a") fail("Closure register status mismatch.");
for (const [key, value] of Object.entries(closureRegister.closure_points)) {
  if (value !== true) fail(`Closure point must be true: ${key}`);
}
if (closureRegister.planned_counts.ag34_closed_stages !== 4) fail("Closed stage count must be 4.");

if (!allFalse(activationBlocker.blocked_activation_items)) fail("AG34Z activation blockers must remain false.");
if (ag35Handoff.status !== "ag35_explicit_activation_approval_handoff_created") fail("AG35 handoff status mismatch.");
if (ag35Handoff.explicit_approval_required_before_real_activation !== true) fail("AG35 explicit approval requirement missing.");
if (!ag35Handoff.ag35_sequence.includes("AG35A — Explicit Activation Approval")) fail("AG35A sequence missing.");
if (!String(ag35Handoff.ag35a_stop_rule).includes("explicit user approval")) fail("AG35A stop rule missing.");

for (const key of ["AG35A", "AG35B", "AG35C", "AG35D", "AG35Z", "AG36"]) {
  if (!consumption.future_consumption?.[key]) fail(`${key} consumption note missing.`);
}

if (blocker.status !== "backend_activation_readiness_closure_operations_blocked_pending_ag35a") fail("Blocker status mismatch.");
if (readiness.ready_for_ag35a !== true) fail("AG35A readiness missing.");
if (readiness.allowed_ag35a_mode !== "explicit_activation_approval_stop_point_only") fail("AG35A mode mismatch.");
if (readiness.explicit_user_approval_required_next !== true) fail("Explicit approval next must be true.");

for (const flag of [
  "real_execution_allowed_now",
  "supabase_activation_allowed_now",
  "auth_activation_allowed_now",
  "database_creation_allowed_now",
  "database_write_allowed_now",
  "rls_application_allowed_now",
  "secret_write_allowed_now",
  "env_var_write_allowed_now",
  "backend_activation_allowed_now",
  "supabase_auth_backend_activation_allowed_now"
]) {
  if (readiness[flag] !== false) fail(`${flag} must be false.`);
}

if (boundary.next_stage_id !== "AG35A") fail("Boundary must point to AG35A.");
if (boundary.status !== "ag35a_boundary_created_explicit_activation_approval_stop_point_only") fail("Boundary status mismatch.");
if (boundary.backend_activation_deferred_until_explicit_approval !== true) fail("Backend activation must be deferred until approval.");
if (boundary.supabase_auth_backend_deferred_until_explicit_approval !== true) fail("Supabase/Auth/backend must be deferred until approval.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.backend_activation_readiness_closure_created !== true) fail("Review summary missing.");
if (review.summary.ag34_chain_closed !== true) fail("AG34 chain summary missing.");
if (review.summary.detailed_stages_closed !== 4) fail("Detailed stages closed must be 4.");
if (review.summary.ready_for_ag35a !== true) fail("AG35A readiness summary missing.");
if (review.summary.explicit_user_approval_required_next !== true) fail("Explicit approval summary missing.");

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
if (ag34d.status !== "backend_readiness_audit_created_ready_for_ag34z") fail("AG34D source status mismatch.");
if (ag34d.audit_decision.all_audits_passed !== true) fail("AG34D all audits must pass.");
if (ag34dReadiness.ready_for_ag34z !== true) fail("AG34D readiness must allow AG34Z.");
if (ag34dSource.audit_passed !== true) fail("AG34D source-chain audit must pass.");
if (ag34dBlockerAudit.audit_passed !== true) fail("AG34D activation blocker audit must pass.");
if (ag34dSecretRole.audit_passed !== true) fail("AG34D secret/role/RLS audit must pass.");
if (ag34dNonActivation.audit_passed !== true) fail("AG34D non-activation audit must pass.");
if (ag33z.status !== "dynamic_publish_scaffold_closure_created_ready_for_ag34a") fail("AG33Z source status mismatch.");
if (!allFalse(ag33zBlocker.blocked_activation_items)) fail("AG33Z blockers must remain false.");
if (!allFalse(ag32zBlocker.blocked_activation_items)) fail("AG32Z blockers must remain false.");

if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "backend_activation_readiness_closure_created_ready_for_ag35a") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.ag34_chain_closed !== 1) fail("Preview AG34 chain closed missing.");
if (preview.backend_readiness_planning_closed !== 1) fail("Preview readiness closure missing.");
if (preview.ready_for_ag35a !== 1) fail("Preview AG35A readiness missing.");
if (preview.explicit_user_approval_required_next !== 1) fail("Preview explicit approval missing.");

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
  "data/content-intelligence/backend-architecture/ag34d-backend-readiness-audit.json",
  "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!closure.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Closure did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "backend_activation_readiness_closure_created" ||
    k === "ag34_chain_closed" ||
    k === "backend_readiness_planning_closed" ||
    k === "ag35_explicit_activation_approval_allowed"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag34z"]) fail("Missing generate:ag34z script.");
if (!pkg.scripts?.["validate:ag34z"]) fail("Missing validate:ag34z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag34z")) fail("validate:project must include validate:ag34z.");

pass("AG34Z Backend Activation Readiness Closure is present.");
pass("AG34A-AG34D backend readiness planning chain is closed.");
pass("AG35A Explicit Activation Approval stop-point boundary is ready.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No Supabase/Auth/backend activation, database, RLS, secrets, accounts, deployment or public mutation is enabled.");
