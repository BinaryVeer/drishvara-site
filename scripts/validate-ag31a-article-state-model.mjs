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
  console.error(`❌ AG31A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  "data/content-intelligence/backend-architecture/ag30z-ag31-queue-state-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json",
  "data/content-intelligence/quality-registry/ag30z-ag31-queue-state-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag30z-to-ag31-queue-state-integration-boundary.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/backend-architecture/ag30c-protected-route-map.json",
  "data/content-intelligence/backend-architecture/ag30d-login-ui-audit.json",
  "data/content-intelligence/backend-architecture/ag29a-state-field-model.json",
  "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag31a-article-state-model.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-model.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-register.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/backend-architecture/ag31a-role-state-permission-matrix.json",
  "data/content-intelligence/backend-architecture/ag31a-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31a-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag31a-article-state-model-blocker-register.json",
  "data/content-intelligence/quality-registry/ag31a-queue-integration-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag31a-to-ag31b-queue-integration-plan-boundary.json",
  "data/quality/ag31a-article-state-model.json",
  "data/quality/ag31a-article-state-model-preview.json",
  "docs/quality/AG31A_ARTICLE_STATE_MODEL.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag31a-article-state-model.json");
const model = readJson("data/content-intelligence/backend-architecture/ag31a-article-state-model.json");
const stateRegister = readJson("data/content-intelligence/backend-architecture/ag31a-article-state-register.json");
const transitionMap = readJson("data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json");
const permissionMatrix = readJson("data/content-intelligence/backend-architecture/ag31a-role-state-permission-matrix.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag31a-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag31a-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag31a-article-state-model-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag31a-queue-integration-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag31a-to-ag31b-queue-integration-plan-boundary.json");
const registry = readJson("data/quality/ag31a-article-state-model.json");
const preview = readJson("data/quality/ag31a-article-state-model-preview.json");

const ag30z = readJson("data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json");
const ag30zReadiness = readJson("data/content-intelligence/quality-registry/ag30z-ag31-queue-state-readiness-record.json");
const ag30zBlocker = readJson("data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json");
const ag30d = readJson("data/content-intelligence/backend-architecture/ag30d-login-ui-audit.json");
const ag30bAssigned = readJson("data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json");
const ag29z = readJson("data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "article_state_model_created_ready_for_ag31b") fail("Review status mismatch.");
if (model.status !== "article_state_model_created_ready_for_ag31b") fail("Model status mismatch.");
if (model.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (model.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (model.model_decision.non_active_article_state_model_created !== true) fail("Model decision missing.");
if (model.model_decision.article_state_register_created !== true) fail("State register decision missing.");
if (model.model_decision.transition_map_created !== true) fail("Transition map decision missing.");
if (model.model_decision.role_state_permission_matrix_created !== true) fail("Permission matrix decision missing.");
if (model.model_decision.proceed_to_ag31b_queue_integration_plan !== true) fail("AG31B readiness missing.");

for (const flag of [
  "queue_runtime_approved_now",
  "article_state_runtime_approved_now",
  "state_transition_runtime_approved_now",
  "assignment_query_approved_now",
  "database_creation_approved_now",
  "rls_policy_application_approved_now",
  "auth_activation_approved_now",
  "backend_connection_approved_now",
  "supabase_connection_approved_now",
  "server_route_creation_approved_now",
  "api_route_creation_approved_now",
  "secret_creation_approved_now",
  "env_var_write_approved_now",
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (model.model_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "queue_runtime_allowed_in_ag31a",
  "article_state_runtime_allowed_in_ag31a",
  "state_transition_runtime_allowed_in_ag31a",
  "assignment_query_allowed_in_ag31a",
  "database_creation_allowed_in_ag31a",
  "rls_policy_application_allowed_in_ag31a",
  "auth_activation_allowed_in_ag31a",
  "backend_connection_allowed_in_ag31a",
  "supabase_connection_allowed_in_ag31a",
  "server_route_creation_allowed_in_ag31a",
  "api_route_creation_allowed_in_ag31a",
  "secret_creation_allowed_in_ag31a",
  "env_var_write_allowed_in_ag31a",
  "deployment_allowed_in_ag31a",
  "public_mutation_allowed_in_ag31a"
]) {
  if (model[flag] !== false) fail(`${flag} must be false.`);
}

const requiredStates = ["draft", "editor_submitted", "admin_review", "returned", "archived", "publish_approved", "published"];
if (stateRegister.status !== "article_state_register_created_no_runtime") fail("State register status mismatch.");
if (stateRegister.state_count !== 7) fail("State count must be 7.");
for (const state of requiredStates) {
  if (!stateRegister.article_states.some((item) => item.state === state)) fail(`Missing state: ${state}`);
}
if (stateRegister.database_created !== false) fail("Database must not be created.");
if (stateRegister.runtime_created !== false) fail("Runtime must not be created.");

if (transitionMap.status !== "article_state_transition_map_created_no_runtime") fail("Transition map status mismatch.");
if (!transitionMap.transitions.some((t) => t.from === "publish_approved" && t.to === "published" && t.actor === "future_controlled_publish_handler")) {
  fail("publish_approved -> published controlled handler transition missing.");
}
if (!transitionMap.forbidden_transitions.some((t) => t.from === "draft" && t.to === "published")) {
  fail("Forbidden draft -> published transition missing.");
}
if (!transitionMap.forbidden_transitions.some((t) => t.actor === "editor" && t.to === "published")) {
  fail("Editor publish forbidden transition missing.");
}
for (const t of transitionMap.transitions) {
  if (t.execute_now !== false) fail(`Transition ${t.from}->${t.to} must not execute now.`);
}
if (transitionMap.runtime_created !== false) fail("Transition runtime must not be created.");

if (permissionMatrix.status !== "role_state_permission_matrix_created_no_runtime") fail("Permission matrix status mismatch.");
if (permissionMatrix.admin_final_clearance_required !== true) fail("Admin final clearance required missing.");
if (permissionMatrix.editor_assigned_only_required !== true) fail("Editor assigned-only required missing.");
if (permissionMatrix.editor_publish_blocked !== true) fail("Editor publish block missing.");
for (const p of permissionMatrix.permissions) {
  if (p.execute_now !== false) fail(`${p.role} permission must not execute now.`);
}
const editorPermission = permissionMatrix.permissions.find((p) => p.role === "editor");
if (!editorPermission) fail("Editor permission row missing.");
if (!editorPermission.forbidden_future_state_actions.includes("self_assign")) fail("Editor self-assign block missing.");
if (!editorPermission.forbidden_future_state_actions.includes("global_browse")) fail("Editor global browse block missing.");
if (!editorPermission.forbidden_future_state_actions.includes("publish")) fail("Editor publish block missing.");

if (nonActivation.status !== "article_state_model_non_activation_audit_passed") fail("Non-activation audit status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG31B) fail("AG31B consumption note missing.");
if (!consumption.future_consumption?.AG31C) fail("AG31C consumption note missing.");
if (!consumption.future_consumption?.AG31D) fail("AG31D consumption note missing.");
if (!consumption.future_consumption?.AG31Z) fail("AG31Z consumption note missing.");

if (blocker.status !== "article_state_model_operations_blocked_pending_ag31b") fail("Blocker status mismatch.");
if (readiness.ready_for_ag31b !== true) fail("AG31B readiness missing.");
if (readiness.allowed_ag31b_mode !== "non_active_queue_integration_plan_only") fail("AG31B mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.queue_runtime_allowed_now !== false) fail("Queue runtime must be false.");
if (readiness.article_state_runtime_allowed_now !== false) fail("Article state runtime must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG31B") fail("Boundary must point to AG31B.");
if (boundary.status !== "ag31b_boundary_created_non_active_queue_integration_plan_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.article_state_model_created !== true) fail("Review summary missing.");
if (review.summary.non_active_state_model_only !== true) fail("Non-active model summary missing.");
if (review.summary.ready_for_ag31b !== true) fail("AG31B readiness summary missing.");
if (review.summary.state_count !== 7) fail("Review state count must be 7.");

for (const flag of [
  "queue_runtime_allowed_now",
  "article_state_runtime_allowed_now",
  "state_transition_runtime_allowed_now",
  "assignment_query_allowed_now",
  "database_creation_allowed_now",
  "rls_policy_application_allowed_now",
  "auth_activation_allowed_now",
  "backend_connection_allowed_now",
  "supabase_connection_allowed_now",
  "server_route_creation_allowed_now",
  "api_route_creation_allowed_now",
  "secret_creation_allowed_now",
  "env_var_write_allowed_now",
  "deployment_done",
  "public_mutation_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must be false.`);
}

if (ag30z.status !== "login_ui_closure_created_ready_for_ag31") fail("AG30Z source status mismatch.");
if (ag30zReadiness.ready_for_ag31 !== true) fail("AG30Z readiness must allow AG31.");
if (ag30zReadiness.allowed_ag31_mode !== "non_active_queue_state_planning_only") fail("AG31 mode mismatch.");
for (const [key, value] of Object.entries(ag30zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG30Z activation blocker must remain false: ${key}`);
}
if (ag30d.audit_decision.all_audits_passed !== true) fail("AG30D all audits must pass.");
if (ag30bAssigned.editor_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Assigned-only source missing.");
if (ag30bAssigned.editor_rules.editor_cannot_publish !== true) fail("Editor no-publish source missing.");
if (ag29z.status !== "schema_rls_closure_created_ready_for_ag30") fail("AG29Z source status mismatch.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "article_state_model_created_ready_for_ag31b") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.article_state_model_created !== 1) fail("Preview article state model missing.");
if (preview.state_count !== 7) fail("Preview state count must be 7.");
if (preview.queue_runtime_created !== 0) fail("Preview queue runtime must be 0.");
if (preview.article_state_runtime_created !== 0) fail("Preview article state runtime must be 0.");
if (preview.state_transition_runtime_created !== 0) fail("Preview transition runtime must be 0.");
if (preview.assignment_query_created !== 0) fail("Preview assignment query must be 0.");
if (preview.database_objects_created !== 0) fail("Preview database objects must be 0.");
if (preview.rls_policies_applied !== 0) fail("Preview RLS policies must be 0.");
if (preview.auth_enabled !== 0) fail("Preview Auth must be 0.");
if (preview.backend_connection_enabled !== 0) fail("Preview backend connection must be 0.");
if (preview.supabase_connection_enabled !== 0) fail("Preview Supabase connection must be 0.");
if (preview.secrets_created !== 0) fail("Preview secrets must be 0.");
if (preview.env_vars_written !== 0) fail("Preview env writes must be 0.");
if (preview.server_routes_created !== 0) fail("Preview server routes must be 0.");
if (preview.api_routes_created !== 0) fail("Preview API routes must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  "data/content-intelligence/backend-architecture/ag30z-ag31-queue-state-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/backend-architecture/ag30c-protected-route-map.json",
  "data/content-intelligence/backend-architecture/ag30d-login-ui-audit.json",
  "data/content-intelligence/backend-architecture/ag29a-state-field-model.json",
  "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!model.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Model did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "article_state_model_created" ||
    k === "article_state_register_created" ||
    k === "article_state_transition_map_created" ||
    k === "role_state_permission_matrix_created" ||
    k === "non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag31a"]) fail("Missing generate:ag31a script.");
if (!pkg.scripts?.["validate:ag31a"]) fail("Missing validate:ag31a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag31a")) fail("validate:project must include validate:ag31a.");

pass("AG31A Article State Model is present.");
pass("Article states, transition map and role-state permission matrix are valid.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No database, queue runtime, article-state runtime, assignment query, Auth/backend/Supabase activation, secrets, deployment or public mutation is enabled.");
pass("AG31B Queue Integration Plan boundary is ready.");
