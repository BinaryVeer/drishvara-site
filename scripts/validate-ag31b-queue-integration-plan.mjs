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
  console.error(`❌ AG31B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag31a-article-state-model.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-register.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/backend-architecture/ag31a-role-state-permission-matrix.json",
  "data/content-intelligence/backend-architecture/ag31a-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag31a-queue-integration-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag31a-to-ag31b-queue-integration-plan-boundary.json",
  "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  "data/content-intelligence/backend-architecture/ag30z-ag31-queue-state-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag30c-protected-route-map.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/backend-architecture/ag29a-state-field-model.json",
  "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag31b-queue-integration-plan.json",
  "data/content-intelligence/backend-architecture/ag31b-queue-integration-plan.json",
  "data/content-intelligence/backend-architecture/ag31b-admin-review-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31b-editor-assignment-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31b-static-to-future-db-queue-plan.json",
  "data/content-intelligence/backend-architecture/ag31b-queue-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31b-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag31b-queue-integration-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag31b-audit-log-model-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag31b-to-ag31c-audit-log-model-boundary.json",
  "data/quality/ag31b-queue-integration-plan.json",
  "data/quality/ag31b-queue-integration-plan-preview.json",
  "docs/quality/AG31B_QUEUE_INTEGRATION_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag31b-queue-integration-plan.json");
const plan = readJson("data/content-intelligence/backend-architecture/ag31b-queue-integration-plan.json");
const adminQueue = readJson("data/content-intelligence/backend-architecture/ag31b-admin-review-queue-map.json");
const editorQueue = readJson("data/content-intelligence/backend-architecture/ag31b-editor-assignment-queue-map.json");
const dbPlan = readJson("data/content-intelligence/backend-architecture/ag31b-static-to-future-db-queue-plan.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag31b-queue-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag31b-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag31b-queue-integration-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag31b-audit-log-model-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag31b-to-ag31c-audit-log-model-boundary.json");
const registry = readJson("data/quality/ag31b-queue-integration-plan.json");
const preview = readJson("data/quality/ag31b-queue-integration-plan-preview.json");

const ag31a = readJson("data/content-intelligence/backend-architecture/ag31a-article-state-model.json");
const ag31aReadiness = readJson("data/content-intelligence/quality-registry/ag31a-queue-integration-plan-readiness-record.json");
const ag31aStateRegister = readJson("data/content-intelligence/backend-architecture/ag31a-article-state-register.json");
const ag31aNonActivation = readJson("data/content-intelligence/backend-architecture/ag31a-non-activation-audit-register.json");
const ag30z = readJson("data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json");
const ag30zBlocker = readJson("data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json");
const ag30bAssigned = readJson("data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "queue_integration_plan_created_ready_for_ag31c") fail("Review status mismatch.");
if (plan.status !== "queue_integration_plan_created_ready_for_ag31c") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (plan.plan_decision.non_active_queue_integration_plan_created !== true) fail("Plan decision missing.");
if (plan.plan_decision.admin_review_queue_map_created !== true) fail("Admin queue map decision missing.");
if (plan.plan_decision.editor_assignment_queue_map_created !== true) fail("Editor queue map decision missing.");
if (plan.plan_decision.static_to_future_db_queue_plan_created !== true) fail("Static-to-DB plan decision missing.");
if (plan.plan_decision.proceed_to_ag31c_audit_log_model !== true) fail("AG31C readiness missing.");

for (const flag of [
  "queue_runtime_approved_now",
  "assignment_query_approved_now",
  "database_creation_approved_now",
  "migration_generation_approved_now",
  "sql_generation_approved_now",
  "article_state_runtime_approved_now",
  "audit_runtime_approved_now",
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
  if (plan.plan_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "queue_runtime_allowed_in_ag31b",
  "assignment_query_allowed_in_ag31b",
  "database_creation_allowed_in_ag31b",
  "migration_generation_allowed_in_ag31b",
  "sql_generation_allowed_in_ag31b",
  "article_state_runtime_allowed_in_ag31b",
  "audit_runtime_allowed_in_ag31b",
  "rls_policy_application_allowed_in_ag31b",
  "auth_activation_allowed_in_ag31b",
  "backend_connection_allowed_in_ag31b",
  "supabase_connection_allowed_in_ag31b",
  "server_route_creation_allowed_in_ag31b",
  "api_route_creation_allowed_in_ag31b",
  "secret_creation_allowed_in_ag31b",
  "env_var_write_allowed_in_ag31b",
  "deployment_allowed_in_ag31b",
  "public_mutation_allowed_in_ag31b"
]) {
  if (plan[flag] !== false) fail(`${flag} must be false.`);
}

if (adminQueue.status !== "admin_review_queue_map_created_no_runtime") fail("Admin queue map status mismatch.");
if (adminQueue.admin_final_clearance_required !== true) fail("Admin final clearance required missing.");
if (adminQueue.queue_query_created !== false) fail("Admin queue query must not be created.");
if (adminQueue.queue_runtime_created !== false) fail("Admin queue runtime must not be created.");
if (adminQueue.database_created !== false) fail("Admin queue database must not be created.");
if (!adminQueue.future_admin_queue_surfaces.some((lane) => lane.state_filter.includes("publish_approved"))) fail("Admin publish clearance lane missing.");
for (const lane of adminQueue.future_admin_queue_surfaces) {
  if (lane.runtime_created_now !== false) fail(`${lane.queue_lane} runtime must be false.`);
}

if (editorQueue.status !== "editor_assignment_queue_map_created_no_runtime") fail("Editor queue map status mismatch.");
if (editorQueue.editor_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only rule missing.");
if (editorQueue.editor_rules.editor_cannot_self_assign !== true) fail("Editor self-assign block missing.");
if (editorQueue.editor_rules.editor_cannot_global_browse !== true) fail("Editor global browse block missing.");
if (editorQueue.editor_rules.editor_cannot_publish !== true) fail("Editor publish block missing.");
if (editorQueue.assignment_query_created !== false) fail("Assignment query must not be created.");
if (editorQueue.editor_queue_runtime_created !== false) fail("Editor queue runtime must not be created.");
if (editorQueue.database_created !== false) fail("Editor queue database must not be created.");
if (!editorQueue.future_editor_queue_surfaces.some((lane) => lane.state_filter.includes("returned"))) fail("Editor returned/assigned lane missing.");
for (const lane of editorQueue.future_editor_queue_surfaces) {
  if (lane.runtime_created_now !== false) fail(`${lane.queue_lane} runtime must be false.`);
}

if (dbPlan.status !== "static_to_future_db_queue_plan_created_no_database") fail("Static-to-DB plan status mismatch.");
if (dbPlan.database_table_created !== false) fail("Database table must not be created.");
if (dbPlan.migration_generated !== false) fail("Migration must not be generated.");
if (dbPlan.sql_generated !== false) fail("SQL must not be generated.");
if (dbPlan.rls_policy_applied !== false) fail("RLS policy must not be applied.");
for (const table of dbPlan.future_tables_planned) {
  if (table.create_now !== false) fail(`${table.table_name} must not be created now.`);
}
for (const rule of dbPlan.mapping_rules) {
  if (rule.create_now !== false) fail(`${rule.source_surface} mapping must not execute now.`);
}

if (nonActivation.status !== "queue_integration_plan_non_activation_audit_passed") fail("Non-activation audit status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG31C) fail("AG31C consumption note missing.");
if (!consumption.future_consumption?.AG31D) fail("AG31D consumption note missing.");
if (!consumption.future_consumption?.AG31Z) fail("AG31Z consumption note missing.");
if (!consumption.future_consumption?.AG32) fail("AG32 consumption note missing.");

if (blocker.status !== "queue_integration_plan_operations_blocked_pending_ag31c") fail("Blocker status mismatch.");
if (readiness.ready_for_ag31c !== true) fail("AG31C readiness missing.");
if (readiness.allowed_ag31c_mode !== "non_active_audit_log_model_only") fail("AG31C mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.queue_runtime_allowed_now !== false) fail("Queue runtime must be false.");
if (readiness.assignment_query_allowed_now !== false) fail("Assignment query must be false.");
if (readiness.audit_runtime_allowed_now !== false) fail("Audit runtime must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG31C") fail("Boundary must point to AG31C.");
if (boundary.status !== "ag31c_boundary_created_non_active_audit_log_model_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.queue_integration_plan_created !== true) fail("Review summary missing.");
if (review.summary.non_active_queue_plan_only !== true) fail("Non-active queue summary missing.");
if (review.summary.ready_for_ag31c !== true) fail("AG31C readiness summary missing.");

for (const flag of [
  "queue_runtime_allowed_now",
  "assignment_query_allowed_now",
  "database_creation_allowed_now",
  "migration_generation_allowed_now",
  "sql_generation_allowed_now",
  "article_state_runtime_allowed_now",
  "audit_runtime_allowed_now",
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

if (ag31a.status !== "article_state_model_created_ready_for_ag31b") fail("AG31A source status mismatch.");
if (ag31aReadiness.ready_for_ag31b !== true) fail("AG31A readiness must allow AG31B.");
if (ag31aStateRegister.state_count !== 7) fail("AG31A state count must be 7.");
if (ag31aNonActivation.audit_passed !== true) fail("AG31A non-activation audit must pass.");
if (ag30z.status !== "login_ui_closure_created_ready_for_ag31") fail("AG30Z source status mismatch.");
for (const [key, value] of Object.entries(ag30zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG30Z activation blocker must remain false: ${key}`);
}
if (ag30bAssigned.editor_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Assigned-only source missing.");
if (ag30bAssigned.editor_rules.editor_cannot_publish !== true) fail("Editor no-publish source missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "queue_integration_plan_created_ready_for_ag31c") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.queue_integration_plan_created !== 1) fail("Preview queue plan missing.");
if (preview.admin_review_queue_map_created !== 1) fail("Preview admin queue map missing.");
if (preview.editor_assignment_queue_map_created !== 1) fail("Preview editor queue map missing.");
if (preview.static_to_future_db_queue_plan_created !== 1) fail("Preview static-to-DB plan missing.");
if (preview.queue_runtime_created !== 0) fail("Preview queue runtime must be 0.");
if (preview.assignment_query_created !== 0) fail("Preview assignment query must be 0.");
if (preview.database_objects_created !== 0) fail("Preview database objects must be 0.");
if (preview.migrations_generated !== 0) fail("Preview migrations must be 0.");
if (preview.sql_generated !== 0) fail("Preview SQL must be 0.");
if (preview.article_state_runtime_created !== 0) fail("Preview article-state runtime must be 0.");
if (preview.audit_runtime_created !== 0) fail("Preview audit runtime must be 0.");
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
  "data/content-intelligence/backend-architecture/ag31a-article-state-model.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-register.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  "data/content-intelligence/backend-architecture/ag30c-protected-route-map.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "queue_integration_plan_created" ||
    k === "admin_review_queue_map_created" ||
    k === "editor_assignment_queue_map_created" ||
    k === "static_to_future_db_queue_plan_created" ||
    k === "queue_non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag31b"]) fail("Missing generate:ag31b script.");
if (!pkg.scripts?.["validate:ag31b"]) fail("Missing validate:ag31b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag31b")) fail("validate:project must include validate:ag31b.");

pass("AG31B Queue Integration Plan is present.");
pass("Admin review queue map, Editor assignment queue map and static-to-future DB queue plan are valid.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No database, queue runtime, assignment query, audit runtime, Auth/backend/Supabase activation, secrets, deployment or public mutation is enabled.");
pass("AG31C Audit Log Model boundary is ready.");
