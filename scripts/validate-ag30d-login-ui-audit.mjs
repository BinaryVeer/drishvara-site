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
  console.error(`❌ AG30D validation failed: ${msg}`);
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
  "data/content-intelligence/quality-reviews/ag30c-protected-route-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30c-protected-route-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30c-protected-route-map.json",
  "data/content-intelligence/backend-architecture/ag30c-route-guard-placeholder-model.json",
  "data/content-intelligence/backend-architecture/ag30c-route-surface-scaffold-register.json",
  "data/content-intelligence/backend-architecture/ag30c-non-auth-route-audit-register.json",
  "data/content-intelligence/quality-registry/ag30c-login-ui-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag30c-to-ag30d-login-ui-audit-boundary.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/backend-architecture/ag30a-admin-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag29z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag30d-login-ui-audit.json",
  "data/content-intelligence/backend-architecture/ag30d-login-ui-audit.json",
  "data/content-intelligence/backend-architecture/ag30d-page-visibility-audit-register.json",
  "data/content-intelligence/backend-architecture/ag30d-no-auth-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag30d-route-scaffold-audit-register.json",
  "data/content-intelligence/backend-architecture/ag30d-governance-notice-audit-register.json",
  "data/content-intelligence/backend-architecture/ag30d-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag30d-login-ui-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag30d-login-ui-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag30d-to-ag30z-login-ui-closure-boundary.json",
  "data/quality/ag30d-login-ui-audit.json",
  "data/quality/ag30d-login-ui-audit-preview.json",
  "docs/quality/AG30D_LOGIN_UI_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const pages = Object.fromEntries(pageFiles.map((file) => [file, readText(file)]));
const forbiddenRuntimeMarkers = [
  "fetch(",
  "XMLHttpRequest",
  "createClient",
  "supabase-js",
  "localStorage",
  "sessionStorage",
  "document.cookie",
  "Authorization",
  "Bearer ",
  "/api/",
  "auth.signIn",
  "signInWithPassword"
];

for (const [file, content] of Object.entries(pages)) {
  if (!content.includes("<!doctype html>")) fail(`${file} is not a static HTML page.`);
  if (!(content.includes("Non-active scaffold only") || content.includes("Non-active protected route scaffold only"))) {
    fail(`${file} missing non-active notice.`);
  }
  for (const marker of forbiddenRuntimeMarkers) {
    if (content.includes(marker)) fail(`${file} contains forbidden runtime marker: ${marker}`);
  }
}

const review = readJson("data/content-intelligence/quality-reviews/ag30d-login-ui-audit.json");
const audit = readJson("data/content-intelligence/backend-architecture/ag30d-login-ui-audit.json");
const pageVisibility = readJson("data/content-intelligence/backend-architecture/ag30d-page-visibility-audit-register.json");
const noAuth = readJson("data/content-intelligence/backend-architecture/ag30d-no-auth-activation-audit-register.json");
const routeAudit = readJson("data/content-intelligence/backend-architecture/ag30d-route-scaffold-audit-register.json");
const governanceAudit = readJson("data/content-intelligence/backend-architecture/ag30d-governance-notice-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag30d-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag30d-login-ui-audit-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag30d-login-ui-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag30d-to-ag30z-login-ui-closure-boundary.json");
const registry = readJson("data/quality/ag30d-login-ui-audit.json");
const preview = readJson("data/quality/ag30d-login-ui-audit-preview.json");

const ag30c = readJson("data/content-intelligence/backend-architecture/ag30c-protected-route-scaffold.json");
const ag30cReadiness = readJson("data/content-intelligence/quality-registry/ag30c-login-ui-audit-readiness-record.json");
const ag30cNonAuthRoute = readJson("data/content-intelligence/backend-architecture/ag30c-non-auth-route-audit-register.json");
const ag30b = readJson("data/content-intelligence/backend-architecture/ag30b-editor-login-ui-scaffold.json");
const ag30a = readJson("data/content-intelligence/backend-architecture/ag30a-admin-login-ui-scaffold.json");
const ag29z = readJson("data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json");
const ag29zBlocker = readJson("data/content-intelligence/backend-architecture/ag29z-activation-blocker-carry-forward.json");
const ag28Auth = readJson("data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "login_ui_audit_created_ready_for_ag30z") fail("Review status mismatch.");
if (audit.status !== "login_ui_audit_created_ready_for_ag30z") fail("Audit status mismatch.");
if (audit.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (audit.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (audit.audit_decision.non_active_login_ui_audit_created !== true) fail("Audit decision missing.");
if (audit.audit_decision.page_visibility_audit_passed !== true) fail("Page visibility audit must pass.");
if (audit.audit_decision.no_auth_activation_audit_passed !== true) fail("No-auth audit must pass.");
if (audit.audit_decision.route_scaffold_audit_passed !== true) fail("Route scaffold audit must pass.");
if (audit.audit_decision.governance_notice_audit_passed !== true) fail("Governance notice audit must pass.");
if (audit.audit_decision.all_audits_passed !== true) fail("All audits must pass.");
if (audit.audit_decision.proceed_to_ag30z_login_ui_closure !== true) fail("AG30Z readiness missing.");

for (const flag of [
  "auth_activation_approved_now",
  "real_admin_login_approved_now",
  "real_editor_login_approved_now",
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
  if (audit.audit_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "auth_activation_allowed_in_ag30d",
  "real_admin_login_allowed_in_ag30d",
  "real_editor_login_allowed_in_ag30d",
  "route_guard_runtime_allowed_in_ag30d",
  "session_runtime_allowed_in_ag30d",
  "credential_processing_allowed_in_ag30d",
  "assignment_query_allowed_in_ag30d",
  "backend_connection_allowed_in_ag30d",
  "supabase_connection_allowed_in_ag30d",
  "sql_generation_allowed_in_ag30d",
  "migration_generation_allowed_in_ag30d",
  "database_creation_allowed_in_ag30d",
  "rls_policy_application_allowed_in_ag30d",
  "secret_creation_allowed_in_ag30d",
  "env_var_write_allowed_in_ag30d",
  "server_route_creation_allowed_in_ag30d",
  "api_route_creation_allowed_in_ag30d",
  "deployment_allowed_in_ag30d",
  "public_mutation_allowed_in_ag30d"
]) {
  if (audit[flag] !== false) fail(`${flag} must be false.`);
}

if (pageVisibility.status !== "page_visibility_audit_passed") fail("Page visibility status mismatch.");
if (pageVisibility.audit_passed !== true) fail("Page visibility audit must pass.");
if (pageVisibility.audited_pages.length !== 6) fail("Audited page count must be 6.");
for (const page of pageVisibility.audited_pages) {
  if (page.exists !== true) fail(`${page.file} must exist.`);
  if (page.has_non_active_notice !== true) fail(`${page.file} must have non-active notice.`);
  if (page.visible_as_ui_only !== true) fail(`${page.file} must be UI-only.`);
}

if (noAuth.status !== "no_auth_activation_audit_passed") fail("No-auth status mismatch.");
if (noAuth.audit_passed !== true) fail("No-auth audit must pass.");
if (noAuth.auth_enabled !== false) fail("Auth must be false.");
if (noAuth.real_login_created !== false) fail("Real login must be false.");
if (noAuth.credential_processing_created !== false) fail("Credential processing must be false.");
if (noAuth.session_runtime_created !== false) fail("Session runtime must be false.");
if (noAuth.backend_request_created !== false) fail("Backend request must be false.");
if (noAuth.supabase_connection_created !== false) fail("Supabase connection must be false.");
for (const page of noAuth.audited_pages) {
  if (page.passed !== true) fail(`${page.file} no-auth audit failed.`);
  if (page.forbidden_runtime_markers_found.length !== 0) fail(`${page.file} has forbidden markers.`);
}

if (routeAudit.status !== "route_scaffold_audit_passed") fail("Route audit status mismatch.");
if (routeAudit.audit_passed !== true) fail("Route audit must pass.");
if (routeAudit.route_guard_runtime_created !== false) fail("Route guard runtime must be false.");
if (routeAudit.server_route_created !== false) fail("Server route must be false.");
if (routeAudit.api_route_created !== false) fail("API route must be false.");
for (const check of routeAudit.route_scaffold_checks) {
  if (check.passed !== true) fail(`Route audit failed: ${check.check_id}`);
}

if (governanceAudit.status !== "governance_notice_audit_passed") fail("Governance audit status mismatch.");
if (governanceAudit.audit_passed !== true) fail("Governance audit must pass.");
for (const check of governanceAudit.checks) {
  if (check.passed !== true) fail(`Governance audit failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG30Z) fail("AG30Z consumption note missing.");
if (!consumption.future_consumption?.AG31) fail("AG31 consumption note missing.");
if (!consumption.future_consumption?.AG34_and_later) fail("AG34/later consumption note missing.");
if (!consumption.future_consumption?.AG35_and_later) fail("AG35/later consumption note missing.");

if (blocker.status !== "login_ui_audit_operations_blocked_pending_ag30z") fail("Blocker status mismatch.");
if (readiness.ready_for_ag30z !== true) fail("AG30Z readiness missing.");
if (readiness.allowed_ag30z_mode !== "non_active_login_ui_closure_only") fail("AG30Z mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG30Z") fail("Boundary must point to AG30Z.");
if (boundary.status !== "ag30z_boundary_created_non_active_login_ui_closure_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.login_ui_audit_created !== true) fail("Review summary missing.");
if (review.summary.non_active_audit_only !== true) fail("Non-active audit-only summary missing.");
if (review.summary.audited_page_count !== 6) fail("Audited page count must be 6.");
if (review.summary.all_audits_passed !== true) fail("All audits summary must pass.");
if (review.summary.ready_for_ag30z !== true) fail("AG30Z readiness summary missing.");

for (const flag of [
  "auth_activation_allowed_now",
  "real_admin_login_allowed_now",
  "real_editor_login_allowed_now",
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

if (ag30c.status !== "protected_route_scaffold_created_ready_for_ag30d") fail("AG30C source status mismatch.");
if (ag30cReadiness.ready_for_ag30d !== true) fail("AG30C readiness must allow AG30D.");
if (ag30cNonAuthRoute.audit_passed !== true) fail("AG30C non-auth route audit must pass.");
if (ag30b.status !== "editor_login_ui_scaffold_created_ready_for_ag30c") fail("AG30B source status mismatch.");
if (ag30a.status !== "admin_login_ui_scaffold_created_ready_for_ag30b") fail("AG30A source status mismatch.");
if (ag29z.status !== "schema_rls_closure_created_ready_for_ag30") fail("AG29Z source status mismatch.");
for (const [key, value] of Object.entries(ag29zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG29Z activation blocker must remain false: ${key}`);
}
if (ag28Auth.auth_enabled_now !== false) fail("AG28 Auth must remain disabled.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "login_ui_audit_created_ready_for_ag30z") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.audited_page_count !== 6) fail("Preview audited page count must be 6.");
if (preview.page_visibility_audit_passed !== 1) fail("Preview page visibility audit missing.");
if (preview.no_auth_activation_audit_passed !== 1) fail("Preview no-auth audit missing.");
if (preview.route_scaffold_audit_passed !== 1) fail("Preview route audit missing.");
if (preview.governance_notice_audit_passed !== 1) fail("Preview governance audit missing.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.real_admin_login_created !== 0) fail("Preview must record 0 real Admin login.");
if (preview.real_editor_login_created !== 0) fail("Preview must record 0 real Editor login.");
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
  "data/content-intelligence/backend-architecture/ag30c-protected-route-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30a-admin-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",
  "admin/login.html",
  "editor/login.html",
  "admin/index.html",
  "admin/review.html",
  "editor/index.html",
  "editor/workspace.html"
]) {
  if (!audit.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Audit did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "login_ui_audit_created" ||
    k === "page_visibility_audit_created" ||
    k === "no_auth_activation_audit_created" ||
    k === "route_scaffold_audit_created" ||
    k === "governance_notice_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag30d"]) fail("Missing generate:ag30d script.");
if (!pkg.scripts?.["validate:ag30d"]) fail("Missing validate:ag30d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag30d")) fail("validate:project must include validate:ag30d.");

pass("AG30D Login UI Audit is present.");
pass("Admin/Editor login and route scaffold pages are visible UI-only surfaces.");
pass("No Auth activation, sessions, credentials, backend/Supabase calls, route guards, secrets, deployment or public mutation is enabled.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("AG30Z Login UI Closure boundary is ready.");
