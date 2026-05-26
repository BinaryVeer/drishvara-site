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
  console.error(`❌ AG31D validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag31c-audit-log-model.json",
  "data/content-intelligence/backend-architecture/ag31c-audit-log-field-schema.json",
  "data/content-intelligence/backend-architecture/ag31c-state-event-log-shape.json",
  "data/content-intelligence/backend-architecture/ag31c-before-after-hash-model.json",
  "data/content-intelligence/backend-architecture/ag31c-actor-action-timestamp-model.json",
  "data/content-intelligence/backend-architecture/ag31c-audit-log-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag31c-state-transition-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag31c-to-ag31d-state-transition-audit-boundary.json",
  "data/content-intelligence/backend-architecture/ag31b-queue-integration-plan.json",
  "data/content-intelligence/backend-architecture/ag31b-admin-review-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31b-editor-assignment-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31b-queue-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-model.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-register.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/backend-architecture/ag31a-role-state-permission-matrix.json",
  "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  "data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag31d-state-transition-audit.json",
  "data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json",
  "data/content-intelligence/backend-architecture/ag31d-illegal-transition-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-admin-approval-gate-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-editor-restriction-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-publish-path-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-state-transition-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag31d-state-transition-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag31d-queue-integration-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag31d-to-ag31z-queue-integration-closure-boundary.json",
  "data/quality/ag31d-state-transition-audit.json",
  "data/quality/ag31d-state-transition-audit-preview.json",
  "docs/quality/AG31D_STATE_TRANSITION_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag31d-state-transition-audit.json");
const audit = readJson("data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json");
const illegalAudit = readJson("data/content-intelligence/backend-architecture/ag31d-illegal-transition-audit-register.json");
const adminGateAudit = readJson("data/content-intelligence/backend-architecture/ag31d-admin-approval-gate-audit-register.json");
const editorAudit = readJson("data/content-intelligence/backend-architecture/ag31d-editor-restriction-audit-register.json");
const publishAudit = readJson("data/content-intelligence/backend-architecture/ag31d-publish-path-audit-register.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag31d-state-transition-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag31d-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag31d-state-transition-audit-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag31d-queue-integration-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag31d-to-ag31z-queue-integration-closure-boundary.json");
const registry = readJson("data/quality/ag31d-state-transition-audit.json");
const preview = readJson("data/quality/ag31d-state-transition-audit-preview.json");

const ag31c = readJson("data/content-intelligence/backend-architecture/ag31c-audit-log-model.json");
const ag31cReadiness = readJson("data/content-intelligence/quality-registry/ag31c-state-transition-audit-readiness-record.json");
const ag31cNonActivation = readJson("data/content-intelligence/backend-architecture/ag31c-audit-log-non-activation-audit-register.json");
const ag31b = readJson("data/content-intelligence/backend-architecture/ag31b-queue-integration-plan.json");
const ag31bNonActivation = readJson("data/content-intelligence/backend-architecture/ag31b-queue-non-activation-audit-register.json");
const ag31aTransition = readJson("data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json");
const ag30z = readJson("data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json");
const ag30zBlocker = readJson("data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json");
const ag30bAssigned = readJson("data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "state_transition_audit_created_ready_for_ag31z") fail("Review status mismatch.");
if (audit.status !== "state_transition_audit_created_ready_for_ag31z") fail("Audit status mismatch.");
if (audit.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (audit.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (audit.audit_decision.non_active_state_transition_audit_created !== true) fail("Audit decision missing.");
if (audit.audit_decision.illegal_transition_audit_passed !== true) fail("Illegal transition audit must pass.");
if (audit.audit_decision.admin_approval_gate_audit_passed !== true) fail("Admin approval gate audit must pass.");
if (audit.audit_decision.editor_restriction_audit_passed !== true) fail("Editor restriction audit must pass.");
if (audit.audit_decision.publish_path_audit_passed !== true) fail("Publish path audit must pass.");
if (audit.audit_decision.non_activation_audit_passed !== true) fail("Non-activation audit must pass.");
if (audit.audit_decision.all_audits_passed !== true) fail("All audits must pass.");
if (audit.audit_decision.proceed_to_ag31z_queue_integration_closure !== true) fail("AG31Z readiness missing.");

for (const flag of [
  "state_transition_runtime_approved_now",
  "audit_runtime_approved_now",
  "hash_runtime_approved_now",
  "publish_handler_runtime_approved_now",
  "queue_runtime_approved_now",
  "assignment_query_approved_now",
  "database_creation_approved_now",
  "migration_generation_approved_now",
  "sql_generation_approved_now",
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
  if (audit.audit_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "state_transition_runtime_allowed_in_ag31d",
  "audit_runtime_allowed_in_ag31d",
  "hash_runtime_allowed_in_ag31d",
  "publish_handler_runtime_allowed_in_ag31d",
  "queue_runtime_allowed_in_ag31d",
  "assignment_query_allowed_in_ag31d",
  "database_creation_allowed_in_ag31d",
  "migration_generation_allowed_in_ag31d",
  "sql_generation_allowed_in_ag31d",
  "rls_policy_application_allowed_in_ag31d",
  "auth_activation_allowed_in_ag31d",
  "backend_connection_allowed_in_ag31d",
  "supabase_connection_allowed_in_ag31d",
  "server_route_creation_allowed_in_ag31d",
  "api_route_creation_allowed_in_ag31d",
  "secret_creation_allowed_in_ag31d",
  "env_var_write_allowed_in_ag31d",
  "deployment_allowed_in_ag31d",
  "public_mutation_allowed_in_ag31d"
]) {
  if (audit[flag] !== false) fail(`${flag} must be false.`);
}

for (const item of [illegalAudit, adminGateAudit, editorAudit, publishAudit, nonActivation]) {
  if (item.audit_passed !== true) fail(`${item.title} must pass.`);
}

for (const check of illegalAudit.checks) {
  if (check.passed !== true) fail(`Illegal transition check failed: ${check.check_id}`);
}
for (const check of adminGateAudit.checks) {
  if (check.passed !== true) fail(`Admin approval gate check failed: ${check.check_id}`);
}
for (const check of editorAudit.checks) {
  if (check.passed !== true) fail(`Editor restriction check failed: ${check.check_id}`);
}
for (const check of publishAudit.checks) {
  if (check.passed !== true) fail(`Publish path check failed: ${check.check_id}`);
}
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (illegalAudit.state_transition_runtime_created !== false) fail("Illegal audit must not create transition runtime.");
if (publishAudit.publish_handler_runtime_created !== false) fail("Publish handler runtime must not be created.");
if (publishAudit.rollback_runtime_created !== false) fail("Rollback runtime must not be created.");
if (publishAudit.public_mutation_done !== false) fail("Public mutation must be false.");

if (!consumption.future_consumption?.AG31Z) fail("AG31Z consumption note missing.");
if (!consumption.future_consumption?.AG32) fail("AG32 consumption note missing.");
if (!consumption.future_consumption?.AG33) fail("AG33 consumption note missing.");
if (!consumption.future_consumption?.AG34_and_later) fail("AG34/later consumption note missing.");

if (blocker.status !== "state_transition_audit_operations_blocked_pending_ag31z") fail("Blocker status mismatch.");
if (readiness.ready_for_ag31z !== true) fail("AG31Z readiness missing.");
if (readiness.allowed_ag31z_mode !== "non_active_queue_integration_closure_only") fail("AG31Z mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.state_transition_runtime_allowed_now !== false) fail("State transition runtime must be false.");
if (readiness.audit_runtime_allowed_now !== false) fail("Audit runtime must be false.");
if (readiness.queue_runtime_allowed_now !== false) fail("Queue runtime must be false.");
if (readiness.publish_handler_runtime_allowed_now !== false) fail("Publish handler runtime must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG31Z") fail("Boundary must point to AG31Z.");
if (boundary.status !== "ag31z_boundary_created_non_active_queue_integration_closure_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.state_transition_audit_created !== true) fail("Review summary missing.");
if (review.summary.non_active_state_transition_audit_only !== true) fail("Non-active audit summary missing.");
if (review.summary.all_audits_passed !== true) fail("All audits summary must pass.");
if (review.summary.ready_for_ag31z !== true) fail("AG31Z readiness summary missing.");

for (const flag of [
  "state_transition_runtime_allowed_now",
  "audit_runtime_allowed_now",
  "hash_runtime_allowed_now",
  "publish_handler_runtime_allowed_now",
  "queue_runtime_allowed_now",
  "assignment_query_allowed_now",
  "database_creation_allowed_now",
  "migration_generation_allowed_now",
  "sql_generation_allowed_now",
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

if (ag31c.status !== "audit_log_model_created_ready_for_ag31d") fail("AG31C source status mismatch.");
if (ag31cReadiness.ready_for_ag31d !== true) fail("AG31C readiness must allow AG31D.");
if (ag31cNonActivation.audit_passed !== true) fail("AG31C non-activation audit must pass.");
if (ag31b.status !== "queue_integration_plan_created_ready_for_ag31c") fail("AG31B source status mismatch.");
if (ag31bNonActivation.audit_passed !== true) fail("AG31B non-activation audit must pass.");
if (!ag31aTransition.forbidden_transitions.some((t) => t.from === "draft" && t.to === "published")) fail("AG31A draft->published block missing.");
if (!ag31aTransition.forbidden_transitions.some((t) => t.actor === "editor" && t.to === "published")) fail("AG31A editor publish block missing.");
if (!ag31aTransition.transitions.some((t) => t.from === "admin_review" && t.to === "publish_approved" && t.actor === "admin")) fail("AG31A admin approval path missing.");
if (!ag31aTransition.transitions.some((t) => t.from === "publish_approved" && t.to === "published" && t.actor === "future_controlled_publish_handler")) fail("AG31A controlled publish handler path missing.");
if (ag30z.status !== "login_ui_closure_created_ready_for_ag31") fail("AG30Z source status mismatch.");

for (const [key, value] of Object.entries(ag30zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG30Z activation blocker must remain false: ${key}`);
}

if (ag30bAssigned.editor_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Assigned-only source missing.");
if (ag30bAssigned.editor_rules.editor_cannot_publish !== true) fail("Editor no-publish source missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "state_transition_audit_created_ready_for_ag31z") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.state_transition_audit_created !== 1) fail("Preview audit missing.");
if (preview.illegal_transition_audit_passed !== 1) fail("Preview illegal audit missing.");
if (preview.admin_approval_gate_audit_passed !== 1) fail("Preview admin gate audit missing.");
if (preview.editor_restriction_audit_passed !== 1) fail("Preview editor audit missing.");
if (preview.publish_path_audit_passed !== 1) fail("Preview publish path audit missing.");
if (preview.state_transition_runtime_created !== 0) fail("Preview transition runtime must be 0.");
if (preview.audit_runtime_created !== 0) fail("Preview audit runtime must be 0.");
if (preview.hash_runtime_created !== 0) fail("Preview hash runtime must be 0.");
if (preview.publish_handler_runtime_created !== 0) fail("Preview publish handler runtime must be 0.");
if (preview.queue_runtime_created !== 0) fail("Preview queue runtime must be 0.");
if (preview.assignment_query_created !== 0) fail("Preview assignment query must be 0.");
if (preview.database_objects_created !== 0) fail("Preview database objects must be 0.");
if (preview.migrations_generated !== 0) fail("Preview migrations must be 0.");
if (preview.sql_generated !== 0) fail("Preview SQL must be 0.");
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
  "data/content-intelligence/backend-architecture/ag31c-audit-log-model.json",
  "data/content-intelligence/backend-architecture/ag31c-state-event-log-shape.json",
  "data/content-intelligence/backend-architecture/ag31b-queue-integration-plan.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!audit.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Audit did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "state_transition_audit_created" ||
    k === "illegal_transition_audit_created" ||
    k === "admin_approval_gate_audit_created" ||
    k === "editor_restriction_audit_created" ||
    k === "publish_path_audit_created" ||
    k === "state_transition_non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag31d"]) fail("Missing generate:ag31d script.");
if (!pkg.scripts?.["validate:ag31d"]) fail("Missing validate:ag31d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag31d")) fail("validate:project must include validate:ag31d.");

pass("AG31D State Transition Audit is present.");
pass("Illegal transition, Admin approval gate, Editor restriction and publish path audits are valid.");
pass("No direct publish path exists without Admin approval and future controlled publish handler.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No state transition runtime, audit runtime, hash runtime, database, queue runtime, Auth/backend/Supabase activation, secrets, deployment or public mutation is enabled.");
pass("AG31Z Queue Integration Closure boundary is ready.");
