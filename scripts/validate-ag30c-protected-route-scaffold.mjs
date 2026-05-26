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
  console.error(`❌ AG30C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag30b-editor-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/quality-registry/ag30b-protected-route-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag30b-to-ag30c-protected-route-scaffold-boundary.json",
  "data/content-intelligence/backend-architecture/ag30a-admin-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag29z-ag30-login-route-scaffold-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag29z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  "data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "admin/index.html",
  "admin/review.html",
  "editor/index.html",
  "editor/workspace.html",
  "data/content-intelligence/quality-reviews/ag30c-protected-route-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30c-protected-route-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30c-protected-route-map.json",
  "data/content-intelligence/backend-architecture/ag30c-route-guard-placeholder-model.json",
  "data/content-intelligence/backend-architecture/ag30c-route-surface-scaffold-register.json",
  "data/content-intelligence/backend-architecture/ag30c-non-auth-route-audit-register.json",
  "data/content-intelligence/backend-architecture/ag30c-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag30c-protected-route-scaffold-blocker-register.json",
  "data/content-intelligence/quality-registry/ag30c-login-ui-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag30c-to-ag30d-login-ui-audit-boundary.json",
  "data/quality/ag30c-protected-route-scaffold.json",
  "data/quality/ag30c-protected-route-scaffold-preview.json",
  "docs/quality/AG30C_PROTECTED_ROUTE_SCAFFOLD.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const pages = {
  "admin/index.html": readText("admin/index.html"),
  "admin/review.html": readText("admin/review.html"),
  "editor/index.html": readText("editor/index.html"),
  "editor/workspace.html": readText("editor/workspace.html")
};

for (const [file, content] of Object.entries(pages)) {
  if (!content.includes("Non-active protected route scaffold only")) fail(`${file} missing non-active notice.`);
  if (!content.includes("Access control is not active")) fail(`${file} missing access-control inactive notice.`);
  if (content.includes("fetch(")) fail(`${file} must not contain fetch calls.`);
  if (content.includes("createClient")) fail(`${file} must not contain client creation.`);
  if (content.includes("supabase-js")) fail(`${file} must not contain Supabase runtime library.`);
  if (content.includes("localStorage")) fail(`${file} must not use localStorage.`);
  if (content.includes("sessionStorage")) fail(`${file} must not use sessionStorage.`);
  if (content.includes("document.cookie")) fail(`${file} must not use cookies.`);
}

if (!pages["admin/index.html"].includes("Admin final clearance authority")) fail("Admin index governance missing.");
if (!pages["admin/review.html"].includes("Admin final clearance required")) fail("Admin review governance missing.");
if (!pages["editor/index.html"].includes("Assigned items only")) fail("Editor index assigned-only notice missing.");
if (!pages["editor/workspace.html"].includes("No assignment query now")) fail("Editor workspace assignment-query block missing.");

const review = readJson("data/content-intelligence/quality-reviews/ag30c-protected-route-scaffold.json");
const scaffold = readJson("data/content-intelligence/backend-architecture/ag30c-protected-route-scaffold.json");
const routeMap = readJson("data/content-intelligence/backend-architecture/ag30c-protected-route-map.json");
const guardModel = readJson("data/content-intelligence/backend-architecture/ag30c-route-guard-placeholder-model.json");
const surfaceRegister = readJson("data/content-intelligence/backend-architecture/ag30c-route-surface-scaffold-register.json");
const nonAuthAudit = readJson("data/content-intelligence/backend-architecture/ag30c-non-auth-route-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag30c-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag30c-protected-route-scaffold-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag30c-login-ui-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag30c-to-ag30d-login-ui-audit-boundary.json");
const registry = readJson("data/quality/ag30c-protected-route-scaffold.json");
const preview = readJson("data/quality/ag30c-protected-route-scaffold-preview.json");

const ag30b = readJson("data/content-intelligence/backend-architecture/ag30b-editor-login-ui-scaffold.json");
const ag30bReadiness = readJson("data/content-intelligence/quality-registry/ag30b-protected-route-scaffold-readiness-record.json");
const ag30a = readJson("data/content-intelligence/backend-architecture/ag30a-admin-login-ui-scaffold.json");
const ag29z = readJson("data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json");
const ag29zBlocker = readJson("data/content-intelligence/backend-architecture/ag29z-activation-blocker-carry-forward.json");
const ag29bRole = readJson("data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json");
const ag28Auth = readJson("data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "protected_route_scaffold_created_ready_for_ag30d") fail("Review status mismatch.");
if (scaffold.status !== "protected_route_scaffold_created_ready_for_ag30d") fail("Scaffold status mismatch.");
if (scaffold.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (scaffold.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (scaffold.scaffold_decision.non_active_protected_route_scaffold_created !== true) fail("Scaffold decision missing.");
if (scaffold.scaffold_decision.protected_route_map_created !== true) fail("Protected route map decision missing.");
if (scaffold.scaffold_decision.route_guard_placeholder_model_created !== true) fail("Guard placeholder decision missing.");
if (scaffold.scaffold_decision.route_surface_scaffold_register_created !== true) fail("Surface register decision missing.");
if (scaffold.scaffold_decision.proceed_to_ag30d_login_ui_audit !== true) fail("AG30D readiness missing.");

for (const flag of [
  "auth_activation_approved_now",
  "route_guard_runtime_approved_now",
  "session_runtime_approved_now",
  "credential_processing_approved_now",
  "assignment_query_approved_now",
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
  "auth_activation_allowed_in_ag30c",
  "route_guard_runtime_allowed_in_ag30c",
  "session_runtime_allowed_in_ag30c",
  "credential_processing_allowed_in_ag30c",
  "assignment_query_allowed_in_ag30c",
  "backend_connection_allowed_in_ag30c",
  "supabase_connection_allowed_in_ag30c",
  "sql_generation_allowed_in_ag30c",
  "migration_generation_allowed_in_ag30c",
  "database_creation_allowed_in_ag30c",
  "rls_policy_application_allowed_in_ag30c",
  "secret_creation_allowed_in_ag30c",
  "env_var_write_allowed_in_ag30c",
  "server_route_creation_allowed_in_ag30c",
  "api_route_creation_allowed_in_ag30c",
  "deployment_allowed_in_ag30c",
  "public_mutation_allowed_in_ag30c"
]) {
  if (scaffold[flag] !== false) fail(`${flag} must be false.`);
}

if (routeMap.status !== "protected_route_map_created_no_runtime_guard") fail("Route map status mismatch.");
if (routeMap.protected_route_count !== 4) fail("Route map must contain 4 protected routes.");
if (routeMap.runtime_route_guard_created !== false) fail("Runtime route guard must not be created.");
if (routeMap.auth_enabled !== false) fail("Route map Auth must be false.");
if (routeMap.session_runtime_created !== false) fail("Session runtime must be false.");
for (const route of routeMap.protected_routes) {
  if (route.runtime_guard_created_now !== false) fail(`${route.route_id} runtime guard must be false.`);
}

if (guardModel.status !== "route_guard_placeholder_model_created_no_real_auth") fail("Guard placeholder status mismatch.");
if (guardModel.route_guard_runtime_created !== false) fail("Guard runtime must not be created.");
if (guardModel.auth_activation_allowed !== false) fail("Auth activation must be false.");
for (const rule of guardModel.future_guard_rules) {
  if (rule.created_now !== false) fail(`${rule.guard_id} must not be created now.`);
}
for (const forbidden of ["No Auth check.", "No session cookie check.", "No token validation.", "No API call.", "No backend request."]) {
  if (!guardModel.forbidden_now.includes(forbidden)) fail(`Missing forbidden guard condition: ${forbidden}`);
}

if (surfaceRegister.status !== "route_surface_scaffold_register_created_no_runtime") fail("Surface register status mismatch.");
if (surfaceRegister.surfaces.length !== 4) fail("Surface register must contain 4 surfaces.");
if (surfaceRegister.admin_final_clearance_notice_required !== true) fail("Admin final clearance notice required missing.");
if (surfaceRegister.editor_assigned_only_notice_required !== true) fail("Editor assigned-only notice required missing.");
if (surfaceRegister.editor_no_publish_notice_required !== true) fail("Editor no-publish notice required missing.");
if (surfaceRegister.runtime_surfaces_created !== false) fail("Runtime surfaces must not be created.");
for (const surface of surfaceRegister.surfaces) {
  if (surface.runtime_created_now !== false) fail(`${surface.surface_id} runtime must not be created.`);
}

if (nonAuthAudit.status !== "non_auth_route_audit_passed") fail("Non-auth route audit status mismatch.");
if (nonAuthAudit.audit_passed !== true) fail("Non-auth route audit must pass.");
for (const check of nonAuthAudit.checks) {
  if (check.passed !== true) fail(`Non-auth route audit failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG30D) fail("AG30D consumption note missing.");
if (!consumption.future_consumption?.AG30Z) fail("AG30Z consumption note missing.");
if (!consumption.future_consumption?.AG31) fail("AG31 consumption note missing.");
if (!consumption.future_consumption?.AG35_and_later) fail("AG35/later consumption note missing.");

if (blocker.status !== "protected_route_scaffold_operations_blocked_pending_ag30d") fail("Blocker status mismatch.");
if (readiness.ready_for_ag30d !== true) fail("AG30D readiness missing.");
if (readiness.allowed_ag30d_mode !== "non_active_login_ui_audit_only") fail("AG30D mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG30D") fail("Boundary must point to AG30D.");
if (boundary.status !== "ag30d_boundary_created_non_active_login_ui_audit_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.protected_route_scaffold_created !== true) fail("Review summary missing.");
if (review.summary.non_active_route_scaffold_only !== true) fail("Non-active route scaffold summary missing.");
if (review.summary.ready_for_ag30d !== true) fail("AG30D readiness summary missing.");

for (const flag of [
  "auth_activation_allowed_now",
  "route_guard_runtime_allowed_now",
  "session_runtime_allowed_now",
  "credential_processing_allowed_now",
  "assignment_query_allowed_now",
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

if (ag30b.status !== "editor_login_ui_scaffold_created_ready_for_ag30c") fail("AG30B source status mismatch.");
if (ag30bReadiness.ready_for_ag30c !== true) fail("AG30B readiness must allow AG30C.");
if (ag30a.status !== "admin_login_ui_scaffold_created_ready_for_ag30b") fail("AG30A source status mismatch.");
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

if (registry.status !== "protected_route_scaffold_created_ready_for_ag30d") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.protected_route_scaffold_created !== 1) fail("Preview protected route scaffold missing.");
if (preview.static_route_pages_created !== 4) fail("Preview must record 4 static route pages.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.route_guard_runtime_created !== 0) fail("Preview must record 0 route guard runtime.");
if (preview.session_runtime_created !== 0) fail("Preview must record 0 session runtime.");
if (preview.credential_processing_enabled !== 0) fail("Preview must record 0 credential processing.");
if (preview.assignment_query_created !== 0) fail("Preview must record 0 assignment query.");
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
  "data/content-intelligence/backend-architecture/ag30b-editor-login-ui-scaffold.json",
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
    k === "protected_route_scaffold_created" ||
    k === "protected_route_map_created" ||
    k === "route_guard_placeholder_model_created" ||
    k === "route_surface_scaffold_register_created" ||
    k === "non_auth_route_audit_created" ||
    k === "admin_index_page_created" ||
    k === "admin_review_page_created" ||
    k === "editor_index_page_created" ||
    k === "editor_workspace_page_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag30c"]) fail("Missing generate:ag30c script.");
if (!pkg.scripts?.["validate:ag30c"]) fail("Missing validate:ag30c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag30c")) fail("validate:project must include validate:ag30c.");

pass("AG30C Protected Route Scaffold is present.");
pass("Non-active Admin/Editor route pages, protected route map and guard placeholder model are valid.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No real Auth, route guard runtime, sessions, credentials, assignment query, backend/Supabase connection, routes, secrets, deployment or public mutation is enabled.");
pass("AG30D Login UI Audit boundary is ready.");
