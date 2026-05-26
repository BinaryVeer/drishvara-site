import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readText(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function fail(msg) {
  console.error(`❌ AG30B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag30a-admin-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30a-admin-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30a-admin-login-interface-model.json",
  "data/content-intelligence/backend-architecture/ag30a-admin-login-route-preview.json",
  "data/content-intelligence/backend-architecture/ag30a-non-auth-ui-behaviour-model.json",
  "data/content-intelligence/quality-registry/ag30a-editor-login-ui-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag30a-to-ag30b-editor-login-ui-scaffold-boundary.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag29z-ag30-login-route-scaffold-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag29z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  "data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "editor/login.html",
  "data/content-intelligence/quality-reviews/ag30b-editor-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-login-interface-model.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-login-route-preview.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/backend-architecture/ag30b-non-auth-ui-behaviour-model.json",
  "data/content-intelligence/backend-architecture/ag30b-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag30b-editor-login-ui-scaffold-blocker-register.json",
  "data/content-intelligence/quality-registry/ag30b-protected-route-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag30b-to-ag30c-protected-route-scaffold-boundary.json",
  "data/quality/ag30b-editor-login-ui-scaffold.json",
  "data/quality/ag30b-editor-login-ui-scaffold-preview.json",
  "docs/quality/AG30B_EDITOR_LOGIN_UI_SCAFFOLD.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const page = readText("editor/login.html");
const review = readJson("data/content-intelligence/quality-reviews/ag30b-editor-login-ui-scaffold.json");
const scaffold = readJson("data/content-intelligence/backend-architecture/ag30b-editor-login-ui-scaffold.json");
const interfaceModel = readJson("data/content-intelligence/backend-architecture/ag30b-editor-login-interface-model.json");
const routePreview = readJson("data/content-intelligence/backend-architecture/ag30b-editor-login-route-preview.json");
const assignedOnly = readJson("data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json");
const behaviour = readJson("data/content-intelligence/backend-architecture/ag30b-non-auth-ui-behaviour-model.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag30b-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag30b-editor-login-ui-scaffold-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag30b-protected-route-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag30b-to-ag30c-protected-route-scaffold-boundary.json");
const registry = readJson("data/quality/ag30b-editor-login-ui-scaffold.json");
const preview = readJson("data/quality/ag30b-editor-login-ui-scaffold-preview.json");

const ag30a = readJson("data/content-intelligence/backend-architecture/ag30a-admin-login-ui-scaffold.json");
const ag30aReadiness = readJson("data/content-intelligence/quality-registry/ag30a-editor-login-ui-scaffold-readiness-record.json");
const ag29z = readJson("data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json");
const ag29zBlocker = readJson("data/content-intelligence/backend-architecture/ag29z-activation-blocker-carry-forward.json");
const ag29bRole = readJson("data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json");
const ag28Auth = readJson("data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "editor_login_ui_scaffold_created_ready_for_ag30c") fail("Review status mismatch.");
if (scaffold.status !== "editor_login_ui_scaffold_created_ready_for_ag30c") fail("Scaffold status mismatch.");
if (scaffold.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (scaffold.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (!page.includes("Editor Login UI Scaffold")) fail("Editor login page title missing.");
if (!page.includes("Non-active scaffold only")) fail("Non-active scaffold notice missing.");
if (!page.includes("Editor can work only on Admin-assigned items")) fail("Assigned-only notice missing.");
if (!page.includes("Editor cannot self-assign")) fail("No self-assign notice missing.");
if (!page.includes("event.preventDefault()")) fail("Submit prevention missing.");
if (page.includes("fetch(")) fail("Page must not contain fetch calls.");
if (page.includes("createClient")) fail("Page must not contain client creation.");
if (page.includes("supabase-js")) fail("Page must not contain Supabase runtime library.");
if (page.includes("localStorage")) fail("Page must not use localStorage.");
if (page.includes("sessionStorage")) fail("Page must not use sessionStorage.");

if (scaffold.scaffold_decision.non_active_editor_login_ui_scaffold_created !== true) fail("Scaffold decision missing.");
if (scaffold.scaffold_decision.editor_login_page_created !== true) fail("Editor page creation missing.");
if (scaffold.scaffold_decision.assigned_only_ui_model_created !== true) fail("Assigned-only UI model missing.");
if (scaffold.scaffold_decision.proceed_to_ag30c_protected_route_scaffold !== true) fail("AG30C readiness missing.");

for (const flag of [
  "auth_activation_approved_now",
  "real_editor_login_approved_now",
  "session_runtime_approved_now",
  "credential_processing_approved_now",
  "assignment_query_approved_now",
  "editor_workspace_runtime_approved_now",
  "backend_connection_approved_now",
  "supabase_connection_approved_now",
  "server_route_creation_approved_now",
  "api_route_creation_approved_now",
  "secret_creation_approved_now",
  "env_var_write_approved_now",
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (scaffold.scaffold_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "auth_activation_allowed_in_ag30b",
  "real_editor_login_allowed_in_ag30b",
  "session_runtime_allowed_in_ag30b",
  "credential_processing_allowed_in_ag30b",
  "assignment_query_allowed_in_ag30b",
  "editor_workspace_runtime_allowed_in_ag30b",
  "backend_connection_allowed_in_ag30b",
  "supabase_connection_allowed_in_ag30b",
  "sql_generation_allowed_in_ag30b",
  "migration_generation_allowed_in_ag30b",
  "database_creation_allowed_in_ag30b",
  "rls_policy_application_allowed_in_ag30b",
  "secret_creation_allowed_in_ag30b",
  "env_var_write_allowed_in_ag30b",
  "server_route_creation_allowed_in_ag30b",
  "api_route_creation_allowed_in_ag30b",
  "deployment_allowed_in_ag30b",
  "public_mutation_allowed_in_ag30b"
]) {
  if (scaffold[flag] !== false) fail(`${flag} must be false.`);
}

if (interfaceModel.status !== "editor_login_interface_model_created_no_auth_activation") fail("Interface model status mismatch.");
if (interfaceModel.auth_enabled !== false) fail("Interface auth must be false.");
if (interfaceModel.real_login_enabled !== false) fail("Real login must be false.");
if (interfaceModel.visual_governance.assigned_only_notice_visible !== true) fail("Assigned-only notice must be visible.");
if (interfaceModel.visual_governance.no_publish_notice_visible !== true) fail("No-publish notice must be visible.");

if (routePreview.status !== "editor_login_route_preview_created_no_route_guard") fail("Route preview status mismatch.");
if (routePreview.route_path !== "/editor/login.html") fail("Route preview path mismatch.");
if (routePreview.route_guard_created !== false) fail("Route guard must not be created.");
if (routePreview.server_route_created !== false) fail("Server route must not be created.");
if (routePreview.api_route_created !== false) fail("API route must not be created.");
if (routePreview.session_runtime_created !== false) fail("Session runtime must not be created.");
if (routePreview.auth_activation_allowed !== false) fail("Auth activation must be false.");

if (assignedOnly.status !== "editor_assigned_only_ui_model_created_no_assignment_runtime") fail("Assigned-only model status mismatch.");
if (assignedOnly.editor_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Assigned-only rule missing.");
if (assignedOnly.editor_rules.editor_cannot_self_assign !== true) fail("No self-assign rule missing.");
if (assignedOnly.editor_rules.editor_cannot_global_browse !== true) fail("No global browse rule missing.");
if (assignedOnly.editor_rules.editor_cannot_publish !== true) fail("No publish rule missing.");
if (assignedOnly.editor_rules.editor_submits_back_to_admin !== true) fail("Submit back to Admin rule missing.");
if (assignedOnly.editor_rules.admin_final_clearance_required !== true) fail("Admin final clearance required missing.");
if (assignedOnly.assignment_query_created !== false) fail("Assignment query must not be created.");
if (assignedOnly.editor_workspace_runtime_created !== false) fail("Editor workspace runtime must not be created.");
for (const surface of assignedOnly.planned_editor_workspace_surfaces) {
  if (surface.runtime_created_now !== false) fail(`${surface.surface_id} runtime must not be created.`);
}

if (behaviour.status !== "non_auth_ui_behaviour_model_created_no_runtime") fail("Behaviour model status mismatch.");
if (behaviour.credential_storage_created !== false) fail("Credential storage must not be created.");
if (behaviour.browser_storage_used !== false) fail("Browser storage must not be used.");
if (behaviour.backend_request_created !== false) fail("Backend request must not be created.");
if (behaviour.assignment_query_created !== false) fail("Assignment query must not be created.");
for (const item of behaviour.behaviours) {
  if (item.runtime_auth_call !== false) fail(`${item.behaviour_id} must not create runtime auth call.`);
}

if (!consumption.future_consumption?.AG30C) fail("AG30C consumption note missing.");
if (!consumption.future_consumption?.AG30D) fail("AG30D consumption note missing.");
if (!consumption.future_consumption?.AG30Z) fail("AG30Z consumption note missing.");
if (!consumption.future_consumption?.AG31) fail("AG31 consumption note missing.");

if (blocker.status !== "editor_login_ui_scaffold_operations_blocked_pending_ag30c") fail("Blocker status mismatch.");
if (readiness.ready_for_ag30c !== true) fail("AG30C readiness missing.");
if (readiness.allowed_ag30c_mode !== "non_active_protected_route_scaffold_only") fail("AG30C mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG30C") fail("Boundary must point to AG30C.");
if (boundary.status !== "ag30c_boundary_created_non_active_protected_route_scaffold_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.editor_login_ui_scaffold_created !== true) fail("Review summary missing.");
if (review.summary.editor_login_page_created !== true) fail("Review editor page missing.");
if (review.summary.non_active_ui_only !== true) fail("Non-active UI summary missing.");
if (review.summary.assigned_only_ui_model_created !== true) fail("Assigned-only UI summary missing.");
if (review.summary.ready_for_ag30c !== true) fail("AG30C readiness summary missing.");

for (const flag of [
  "auth_activation_allowed_now",
  "real_editor_login_allowed_now",
  "session_runtime_allowed_now",
  "credential_processing_allowed_now",
  "assignment_query_allowed_now",
  "editor_workspace_runtime_allowed_now",
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
if (ag30aReadiness.ready_for_ag30b !== true) fail("AG30A readiness must allow AG30B.");
if (ag29z.status !== "schema_rls_closure_created_ready_for_ag30") fail("AG29Z source status mismatch.");
for (const [key, value] of Object.entries(ag29zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG29Z activation blocker must remain false: ${key}`);
}
const editor = ag29bRole.role_scopes.find((item) => item.role_code === "editor");
if (!editor) fail("Editor role scope missing.");
if (!editor.forbidden_future_actions.includes("global_browse")) fail("Editor global browse block missing.");
if (!editor.forbidden_future_actions.includes("self_assign")) fail("Editor self-assign block missing.");
if (!editor.forbidden_future_actions.includes("publish")) fail("Editor publish block missing.");
if (ag28Auth.auth_enabled_now !== false) fail("AG28 Auth must remain disabled.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "editor_login_ui_scaffold_created_ready_for_ag30c") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.editor_login_page_created !== 1) fail("Preview editor page missing.");
if (preview.assigned_only_ui_model_created !== 1) fail("Preview assigned-only model missing.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.real_editor_login_created !== 0) fail("Preview must record 0 real Editor login.");
if (preview.session_runtime_created !== 0) fail("Preview must record 0 session runtime.");
if (preview.credential_processing_enabled !== 0) fail("Preview must record 0 credential processing.");
if (preview.assignment_query_created !== 0) fail("Preview must record 0 assignment query.");
if (preview.editor_workspace_runtime_created !== 0) fail("Preview must record 0 Editor workspace runtime.");
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
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  "data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!scaffold.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Scaffold did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "editor_login_ui_scaffold_created" ||
    k === "editor_login_page_created" ||
    k === "editor_login_interface_model_created" ||
    k === "editor_login_route_preview_created" ||
    k === "editor_assigned_only_ui_model_created" ||
    k === "non_auth_ui_behaviour_model_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag30b"]) fail("Missing generate:ag30b script.");
if (!pkg.scripts?.["validate:ag30b"]) fail("Missing validate:ag30b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag30b")) fail("validate:project must include validate:ag30b.");

pass("AG30B Editor Login UI Scaffold is present.");
pass("Non-active editor/login.html page, interface model, route preview and assigned-only UI model are valid.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No real Auth, credentials, sessions, assignment query, backend/Supabase connection, routes, secrets, deployment or public mutation is enabled.");
pass("AG30C Protected Route Scaffold boundary is ready.");
