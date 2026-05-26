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
  console.error(`❌ AG30Z validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const pageFiles = [
  "admin/login.html",
  "editor/login.html",
  "admin/index.html",
  "admin/review.html",
  "editor/index.html",
  "editor/workspace.html"
];

const required = [
  ...pageFiles,
  "data/content-intelligence/backend-architecture/ag30a-admin-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/backend-architecture/ag30c-protected-route-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30c-protected-route-map.json",
  "data/content-intelligence/backend-architecture/ag30d-login-ui-audit.json",
  "data/content-intelligence/backend-architecture/ag30d-page-visibility-audit-register.json",
  "data/content-intelligence/backend-architecture/ag30d-no-auth-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag30d-route-scaffold-audit-register.json",
  "data/content-intelligence/backend-architecture/ag30d-governance-notice-audit-register.json",
  "data/content-intelligence/quality-registry/ag30d-login-ui-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag30d-to-ag30z-login-ui-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag29z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag29a-state-field-model.json",
  "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  "data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag30z-login-ui-closure.json",
  "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  "data/content-intelligence/backend-architecture/ag30z-ag30-source-chain-register.json",
  "data/content-intelligence/backend-architecture/ag30z-non-active-login-route-scaffold-closure-register.json",
  "data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag30z-ag31-queue-state-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag30z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag30z-login-ui-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag30z-ag31-queue-state-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag30z-to-ag31-queue-state-integration-boundary.json",
  "data/quality/ag30z-login-ui-closure.json",
  "data/quality/ag30z-login-ui-closure-preview.json",
  "docs/quality/AG30Z_LOGIN_UI_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag30z-login-ui-closure.json");
const closure = readJson("data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json");
const sourceChain = readJson("data/content-intelligence/backend-architecture/ag30z-ag30-source-chain-register.json");
const closureRegister = readJson("data/content-intelligence/backend-architecture/ag30z-non-active-login-route-scaffold-closure-register.json");
const activationBlocker = readJson("data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json");
const ag31Handoff = readJson("data/content-intelligence/backend-architecture/ag30z-ag31-queue-state-handoff-plan.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag30z-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag30z-login-ui-closure-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag30z-ag31-queue-state-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag30z-to-ag31-queue-state-integration-boundary.json");
const registry = readJson("data/quality/ag30z-login-ui-closure.json");
const preview = readJson("data/quality/ag30z-login-ui-closure-preview.json");

const ag30a = readJson("data/content-intelligence/backend-architecture/ag30a-admin-login-ui-scaffold.json");
const ag30b = readJson("data/content-intelligence/backend-architecture/ag30b-editor-login-ui-scaffold.json");
const ag30c = readJson("data/content-intelligence/backend-architecture/ag30c-protected-route-scaffold.json");
const ag30d = readJson("data/content-intelligence/backend-architecture/ag30d-login-ui-audit.json");
const ag30dReadiness = readJson("data/content-intelligence/quality-registry/ag30d-login-ui-closure-readiness-record.json");
const ag29z = readJson("data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json");
const ag29zBlocker = readJson("data/content-intelligence/backend-architecture/ag29z-activation-blocker-carry-forward.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "login_ui_closure_created_ready_for_ag31") fail("Review status mismatch.");
if (closure.status !== "login_ui_closure_created_ready_for_ag31") fail("Closure status mismatch.");
if (closure.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (closure.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (closure.closure_decision.ag30_chain_closed !== true) fail("AG30 chain must be closed.");
if (closure.closure_decision.non_active_login_route_scaffold_closed !== true) fail("Non-active login/route scaffold must be closed.");
if (closure.closure_decision.ag31_ready_for_queue_state_planning !== true) fail("AG31 readiness missing.");

for (const flag of [
  "auth_activation_approved",
  "real_admin_login_approved",
  "real_editor_login_approved",
  "credential_processing_approved",
  "session_runtime_approved",
  "route_guard_runtime_approved",
  "assignment_query_approved",
  "backend_connection_approved",
  "supabase_connection_approved",
  "sql_generation_approved",
  "migration_generation_approved",
  "database_creation_approved",
  "rls_policy_application_approved",
  "secret_creation_approved",
  "env_var_write_approved",
  "server_route_creation_approved",
  "api_route_creation_approved",
  "deployment_approved",
  "public_mutation_approved"
]) {
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (sourceChain.chain_length !== 4) fail("Source chain length must be 4.");
for (const stage of ["AG30A", "AG30B", "AG30C", "AG30D"]) {
  if (!sourceChain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage ${stage}.`);
}
if (sourceChain.audited_pages.length !== 6) fail("Source chain audited pages must be 6.");

if (closureRegister.status !== "non_active_login_route_scaffold_closed_ready_for_ag31") fail("Closure register status mismatch.");
for (const [key, value] of Object.entries(closureRegister.closure_points)) {
  if (value !== true) fail(`Closure point must be true: ${key}`);
}
if (closureRegister.closed_static_pages.length !== 6) fail("Closed static pages must be 6.");

for (const [key, value] of Object.entries(activationBlocker.blocked_activation_items)) {
  if (value !== false) fail(`${key} must remain false.`);
}
if (activationBlocker.future_unlock_requirements.length < 6) fail("Future unlock requirements incomplete.");

if (ag31Handoff.status !== "ag31_queue_state_handoff_created") fail("AG31 handoff status mismatch.");
if (ag31Handoff.ag31_ready !== true) fail("AG31 handoff readiness missing.");
if (ag31Handoff.ag31_activation_allowed !== false) fail("AG31 activation must be false.");
if (!ag31Handoff.ag31_allowed_scope.includes("Define article state model for backend queue planning.")) fail("AG31 article state scope missing.");
if (!ag31Handoff.ag31_blocked_scope.includes("No queue runtime.")) fail("AG31 queue runtime blocker missing.");
if (!ag31Handoff.ag31_blocked_scope.includes("No article state runtime.")) fail("AG31 article state runtime blocker missing.");

if (!consumption.future_consumption?.AG31) fail("AG31 consumption note missing.");
if (!consumption.future_consumption?.AG32) fail("AG32 consumption note missing.");
if (!consumption.future_consumption?.AG33) fail("AG33 consumption note missing.");
if (!consumption.future_consumption?.AG34_and_later) fail("AG34/later consumption note missing.");
if (!consumption.future_consumption?.AG35_and_later) fail("AG35/later consumption note missing.");

if (blocker.status !== "login_ui_closure_runtime_operations_blocked") fail("Blocker status mismatch.");
if (readiness.ready_for_ag31 !== true) fail("AG31 readiness missing.");
if (readiness.allowed_ag31_mode !== "non_active_queue_state_planning_only") fail("AG31 mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");
if (readiness.queue_runtime_allowed_now !== false) fail("Queue runtime must be false.");
if (readiness.article_state_runtime_allowed_now !== false) fail("Article state runtime must be false.");

if (boundary.next_stage_id !== "AG31") fail("Boundary must point to AG31.");
if (boundary.status !== "ag31_boundary_created_non_active_queue_state_planning_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.login_ui_closure_created !== true) fail("Review summary missing.");
if (review.summary.ag30_chain_closed !== true) fail("AG30 chain summary missing.");
if (review.summary.detailed_stages_closed !== 4) fail("Detailed stages closed must be 4.");
if (review.summary.audited_page_count !== 6) fail("Audited page count must be 6.");
if (review.summary.ready_for_ag31 !== true) fail("AG31 readiness summary missing.");

for (const flag of [
  "auth_activation_allowed_now",
  "real_admin_login_allowed_now",
  "real_editor_login_allowed_now",
  "route_guard_runtime_allowed_now",
  "session_runtime_allowed_now",
  "credential_processing_allowed_now",
  "assignment_query_allowed_now",
  "queue_runtime_allowed_now",
  "article_state_runtime_allowed_now",
  "backend_connection_allowed_now",
  "supabase_connection_allowed_now",
  "sql_generation_allowed_now",
  "migration_generation_allowed_now",
  "database_creation_allowed_now",
  "rls_policy_application_allowed_now",
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

if (ag30a.status !== "admin_login_ui_scaffold_created_ready_for_ag30b") fail("AG30A source status mismatch.");
if (ag30b.status !== "editor_login_ui_scaffold_created_ready_for_ag30c") fail("AG30B source status mismatch.");
if (ag30c.status !== "protected_route_scaffold_created_ready_for_ag30d") fail("AG30C source status mismatch.");
if (ag30d.status !== "login_ui_audit_created_ready_for_ag30z") fail("AG30D source status mismatch.");
if (ag30d.audit_decision.all_audits_passed !== true) fail("AG30D all audits must pass.");
if (ag30dReadiness.ready_for_ag30z !== true) fail("AG30D readiness must allow AG30Z.");
if (ag29z.status !== "schema_rls_closure_created_ready_for_ag30") fail("AG29Z source status mismatch.");

for (const [key, value] of Object.entries(ag29zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG29Z activation blocker must remain false: ${key}`);
}

if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "login_ui_closure_created_ready_for_ag31") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.ag30_chain_closed !== 1) fail("Preview AG30 chain closed missing.");
if (preview.audited_page_count !== 6) fail("Preview audited page count must be 6.");
if (preview.ready_for_ag31 !== 1) fail("Preview AG31 readiness missing.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.real_admin_login_created !== 0) fail("Preview must record 0 Admin login.");
if (preview.real_editor_login_created !== 0) fail("Preview must record 0 Editor login.");
if (preview.route_guard_runtime_created !== 0) fail("Preview must record 0 route guard runtime.");
if (preview.session_runtime_created !== 0) fail("Preview must record 0 session runtime.");
if (preview.credential_processing_enabled !== 0) fail("Preview must record 0 credential processing.");
if (preview.assignment_query_created !== 0) fail("Preview must record 0 assignment query.");
if (preview.queue_runtime_created !== 0) fail("Preview must record 0 queue runtime.");
if (preview.article_state_runtime_created !== 0) fail("Preview must record 0 article state runtime.");
if (preview.backend_connection_enabled !== 0) fail("Preview must record 0 backend connection.");
if (preview.supabase_connection_enabled !== 0) fail("Preview must record 0 Supabase connection.");
if (preview.sql_generated !== 0) fail("Preview must record 0 SQL.");
if (preview.migrations_generated !== 0) fail("Preview must record 0 migrations.");
if (preview.database_objects_created !== 0) fail("Preview must record 0 database objects.");
if (preview.rls_policies_applied !== 0) fail("Preview must record 0 RLS policies.");
if (preview.secrets_created !== 0) fail("Preview must record 0 secrets.");
if (preview.env_vars_written !== 0) fail("Preview must record 0 env writes.");
if (preview.server_routes_created !== 0) fail("Preview must record 0 server routes.");
if (preview.api_routes_created !== 0) fail("Preview must record 0 API routes.");
if (preview.deployment_done !== 0) fail("Preview must record 0 deployment.");
if (preview.public_mutation_done !== 0) fail("Preview must record 0 public mutation.");

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag30a-admin-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30c-protected-route-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30d-login-ui-audit.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",
  "admin/login.html",
  "editor/login.html",
  "admin/index.html",
  "admin/review.html",
  "editor/index.html",
  "editor/workspace.html"
]) {
  if (!closure.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Closure did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "login_ui_closure_created" ||
    k === "ag30_chain_closed" ||
    k === "non_active_login_route_scaffold_closed" ||
    k === "ag31_queue_state_planning_allowed"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag30z"]) fail("Missing generate:ag30z script.");
if (!pkg.scripts?.["validate:ag30z"]) fail("Missing validate:ag30z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag30z")) fail("validate:project must include validate:ag30z.");

pass("AG30Z Login UI Closure is present.");
pass("AG30A-AG30D non-active login/route scaffold chain is closed.");
pass("AG31 non-active queue/state integration boundary is ready.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No Auth/backend/Supabase activation, credentials, sessions, route guards, queue runtime, secrets, deployment or public mutation is enabled.");
