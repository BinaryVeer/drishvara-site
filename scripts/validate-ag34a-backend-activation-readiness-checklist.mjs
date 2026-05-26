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
  console.error(`❌ AG34A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  "data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag33z-ag34-backend-activation-readiness-handoff-plan.json",
  "data/content-intelligence/quality-registry/ag33z-ag34-backend-activation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag33z-to-ag34a-backend-activation-readiness-checklist-boundary.json",
  "data/content-intelligence/backend-architecture/ag33d-non-active-handler-scaffold-audit.json",
  "data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json",
  "data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag34a-backend-activation-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-backend-activation-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-supabase-project-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-auth-method-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-rls-rollback-test-user-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag34a-readiness-checklist-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag34a-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag34a-backend-activation-readiness-checklist-blocker-register.json",
  "data/content-intelligence/quality-registry/ag34a-environment-secret-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag34a-to-ag34b-environment-secret-readiness-boundary.json",
  "data/quality/ag34a-backend-activation-readiness-checklist.json",
  "data/quality/ag34a-backend-activation-readiness-checklist-preview.json",
  "docs/quality/AG34A_BACKEND_ACTIVATION_READINESS_CHECKLIST.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag34a-backend-activation-readiness-checklist.json");
const checklist = readJson("data/content-intelligence/backend-architecture/ag34a-backend-activation-readiness-checklist.json");
const supabaseChecklist = readJson("data/content-intelligence/backend-architecture/ag34a-supabase-project-readiness-checklist.json");
const authChecklist = readJson("data/content-intelligence/backend-architecture/ag34a-auth-method-readiness-checklist.json");
const rlsChecklist = readJson("data/content-intelligence/backend-architecture/ag34a-rls-rollback-test-user-readiness-checklist.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag34a-readiness-checklist-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag34a-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag34a-backend-activation-readiness-checklist-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag34a-environment-secret-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag34a-to-ag34b-environment-secret-readiness-boundary.json");
const registry = readJson("data/quality/ag34a-backend-activation-readiness-checklist.json");
const preview = readJson("data/quality/ag34a-backend-activation-readiness-checklist-preview.json");

const ag33z = readJson("data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json");
const ag33zReadiness = readJson("data/content-intelligence/quality-registry/ag33z-ag34-backend-activation-readiness-record.json");
const ag33zBlocker = readJson("data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json");
const ag33d = readJson("data/content-intelligence/backend-architecture/ag33d-non-active-handler-scaffold-audit.json");
const ag32zBlocker = readJson("data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "backend_activation_readiness_checklist_created_ready_for_ag34b") fail("Review status mismatch.");
if (checklist.status !== "backend_activation_readiness_checklist_created_ready_for_ag34b") fail("Checklist status mismatch.");
if (checklist.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (checklist.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (checklist.checklist_decision.backend_activation_readiness_checklist_created !== true) fail("Checklist decision missing.");
if (checklist.checklist_decision.supabase_project_readiness_checklist_created !== true) fail("Supabase checklist decision missing.");
if (checklist.checklist_decision.auth_method_readiness_checklist_created !== true) fail("Auth checklist decision missing.");
if (checklist.checklist_decision.rls_rollback_test_user_readiness_checklist_created !== true) fail("RLS/rollback/test-user checklist decision missing.");
if (checklist.checklist_decision.proceed_to_ag34b_environment_secret_readiness !== true) fail("AG34B readiness missing.");

for (const flag of [
  "supabase_project_creation_approved_now",
  "supabase_connection_approved_now",
  "auth_activation_approved_now",
  "real_user_creation_approved_now",
  "database_creation_approved_now",
  "database_write_approved_now",
  "migration_generation_approved_now",
  "migration_application_approved_now",
  "sql_generation_approved_now",
  "sql_application_approved_now",
  "rls_policy_creation_approved_now",
  "rls_policy_application_approved_now",
  "secret_creation_approved_now",
  "env_var_write_approved_now",
  "service_role_key_creation_approved_now",
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
  if (checklist.checklist_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (supabaseChecklist.status !== "supabase_project_readiness_checklist_created_no_activation") fail("Supabase checklist status mismatch.");
if (supabaseChecklist.confirmation_status !== "not_confirmed_no_external_activation") fail("Supabase checklist must not claim confirmation.");
if (supabaseChecklist.supabase_project_created !== false) fail("Supabase project must not be created.");
if (supabaseChecklist.supabase_connected !== false) fail("Supabase must not be connected.");
if (supabaseChecklist.secrets_created !== false) fail("Secrets must not be created.");
if (supabaseChecklist.env_vars_written !== false) fail("Env vars must not be written.");

if (authChecklist.status !== "auth_method_readiness_checklist_created_no_activation") fail("Auth checklist status mismatch.");
if (authChecklist.auth_enabled !== false) fail("Auth must not be enabled.");
if (authChecklist.real_admin_login_created !== false) fail("Real Admin login must not be created.");
if (authChecklist.real_editor_login_created !== false) fail("Real Editor login must not be created.");
if (authChecklist.session_runtime_created !== false) fail("Session runtime must not be created.");
if (authChecklist.credential_processing_created !== false) fail("Credential processing must not be created.");

if (rlsChecklist.status !== "rls_rollback_test_user_readiness_checklist_created_no_activation") fail("RLS checklist status mismatch.");
if (rlsChecklist.confirmed_now !== false) fail("RLS checklist must not claim confirmation.");
if (rlsChecklist.rls_policy_created !== false) fail("RLS policy must not be created.");
if (rlsChecklist.rls_policy_applied !== false) fail("RLS policy must not be applied.");
if (rlsChecklist.test_admin_created !== false) fail("Test Admin must not be created.");
if (rlsChecklist.test_editor_created !== false) fail("Test Editor must not be created.");
if (rlsChecklist.rollback_runtime_created !== false) fail("Rollback runtime must not be created.");
if (rlsChecklist.database_write_done !== false) fail("Database write must not be done.");

if (nonActivation.status !== "readiness_checklist_non_activation_audit_passed") fail("Non-activation status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG34B) fail("AG34B consumption note missing.");
if (!consumption.future_consumption?.AG34C) fail("AG34C consumption note missing.");
if (!consumption.future_consumption?.AG34D) fail("AG34D consumption note missing.");
if (!consumption.future_consumption?.AG34Z) fail("AG34Z consumption note missing.");
if (!consumption.future_consumption?.AG35A) fail("AG35A consumption note missing.");

if (blocker.status !== "backend_activation_readiness_checklist_operations_blocked_pending_ag34b") fail("Blocker status mismatch.");
if (readiness.ready_for_ag34b !== true) fail("AG34B readiness missing.");
if (readiness.allowed_ag34b_mode !== "environment_secret_readiness_planning_only") fail("AG34B mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.supabase_activation_allowed_now !== false) fail("Supabase activation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (readiness.rls_application_allowed_now !== false) fail("RLS application must be false.");
if (readiness.secret_write_allowed_now !== false) fail("Secret write must be false.");
if (readiness.env_var_write_allowed_now !== false) fail("Env var write must be false.");

if (boundary.next_stage_id !== "AG34B") fail("Boundary must point to AG34B.");
if (boundary.status !== "ag34b_boundary_created_environment_secret_readiness_planning_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.backend_activation_readiness_checklist_created !== true) fail("Review summary missing.");
if (review.summary.ready_for_ag34b !== true) fail("AG34B readiness summary missing.");

for (const flag of [
  "supabase_project_created",
  "supabase_connected",
  "auth_enabled",
  "real_user_created",
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

if (ag33z.status !== "dynamic_publish_scaffold_closure_created_ready_for_ag34a") fail("AG33Z source status mismatch.");
if (ag33zReadiness.ready_for_ag34a !== true) fail("AG33Z readiness must allow AG34A.");
if (ag33d.audit_decision.all_audits_passed !== true) fail("AG33D all audits must pass.");

for (const [key, value] of Object.entries(ag33zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG33Z blocker must remain false: ${key}`);
}
for (const [key, value] of Object.entries(ag32zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG32Z blocker must remain false: ${key}`);
}

if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "backend_activation_readiness_checklist_created_ready_for_ag34b") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.backend_activation_readiness_checklist_created !== 1) fail("Preview checklist missing.");
if (preview.supabase_project_created !== 0) fail("Preview Supabase project must be 0.");
if (preview.supabase_connected !== 0) fail("Preview Supabase connection must be 0.");
if (preview.auth_enabled !== 0) fail("Preview Auth must be 0.");
if (preview.real_user_created !== 0) fail("Preview real user must be 0.");
if (preview.database_objects_created !== 0) fail("Preview database objects must be 0.");
if (preview.database_write_done !== 0) fail("Preview database write must be 0.");
if (preview.sql_generated !== 0) fail("Preview SQL must be 0.");
if (preview.sql_applied !== 0) fail("Preview SQL apply must be 0.");
if (preview.migrations_generated !== 0) fail("Preview migrations must be 0.");
if (preview.migrations_applied !== 0) fail("Preview migrations applied must be 0.");
if (preview.rls_policies_created !== 0) fail("Preview RLS creation must be 0.");
if (preview.rls_policies_applied !== 0) fail("Preview RLS application must be 0.");
if (preview.secrets_created !== 0) fail("Preview secrets must be 0.");
if (preview.env_vars_written !== 0) fail("Preview env writes must be 0.");
if (preview.service_role_key_created !== 0) fail("Preview service role key must be 0.");
if (preview.server_routes_created !== 0) fail("Preview server routes must be 0.");
if (preview.api_routes_created !== 0) fail("Preview API routes must be 0.");
if (preview.handler_runtime_created !== 0) fail("Preview handler runtime must be 0.");
if (preview.queue_runtime_created !== 0) fail("Preview queue runtime must be 0.");
if (preview.audit_runtime_created !== 0) fail("Preview audit runtime must be 0.");
if (preview.rollback_runtime_created !== 0) fail("Preview rollback runtime must be 0.");
if (preview.github_write_done !== 0) fail("Preview GitHub write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  "data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag33z-ag34-backend-activation-readiness-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!checklist.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Checklist did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "backend_activation_readiness_checklist_created" ||
    k === "supabase_project_readiness_checklist_created" ||
    k === "auth_method_readiness_checklist_created" ||
    k === "rls_rollback_test_user_readiness_checklist_created" ||
    k === "readiness_non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag34a"]) fail("Missing generate:ag34a script.");
if (!pkg.scripts?.["validate:ag34a"]) fail("Missing validate:ag34a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag34a")) fail("validate:project must include validate:ag34a.");

pass("AG34A Backend Activation Readiness Checklist is present.");
pass("Supabase project, Auth method, RLS/rollback/test-user readiness checklists are valid.");
pass("No Supabase/Auth/backend activation, database, RLS, secrets, env vars, deployment or public mutation is enabled.");
pass("AG34B Environment Secret Readiness boundary is ready.");
