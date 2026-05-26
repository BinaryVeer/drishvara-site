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
  console.error(`❌ AG31Z validation failed: ${msg}`);
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
  "data/content-intelligence/backend-architecture/ag31b-queue-integration-plan.json",
  "data/content-intelligence/backend-architecture/ag31b-admin-review-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31b-editor-assignment-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31b-static-to-future-db-queue-plan.json",
  "data/content-intelligence/backend-architecture/ag31b-queue-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31c-audit-log-model.json",
  "data/content-intelligence/backend-architecture/ag31c-audit-log-field-schema.json",
  "data/content-intelligence/backend-architecture/ag31c-state-event-log-shape.json",
  "data/content-intelligence/backend-architecture/ag31c-before-after-hash-model.json",
  "data/content-intelligence/backend-architecture/ag31c-actor-action-timestamp-model.json",
  "data/content-intelligence/backend-architecture/ag31c-audit-log-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json",
  "data/content-intelligence/backend-architecture/ag31d-illegal-transition-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-admin-approval-gate-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-editor-restriction-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-publish-path-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-state-transition-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag31d-queue-integration-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag31d-to-ag31z-queue-integration-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  "data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag31z-queue-integration-closure.json",
  "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  "data/content-intelligence/backend-architecture/ag31z-ag31-source-chain-register.json",
  "data/content-intelligence/backend-architecture/ag31z-non-active-queue-state-closure-register.json",
  "data/content-intelligence/backend-architecture/ag31z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag31z-ag32-action-handler-architecture-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag31z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag31z-queue-integration-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag31z-ag32-action-handler-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag31z-to-ag32-action-handler-architecture-boundary.json",
  "data/quality/ag31z-queue-integration-closure.json",
  "data/quality/ag31z-queue-integration-closure-preview.json",
  "docs/quality/AG31Z_QUEUE_INTEGRATION_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag31z-queue-integration-closure.json");
const closure = readJson("data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json");
const sourceChain = readJson("data/content-intelligence/backend-architecture/ag31z-ag31-source-chain-register.json");
const closureRegister = readJson("data/content-intelligence/backend-architecture/ag31z-non-active-queue-state-closure-register.json");
const activationBlocker = readJson("data/content-intelligence/backend-architecture/ag31z-activation-blocker-carry-forward.json");
const ag32Handoff = readJson("data/content-intelligence/backend-architecture/ag31z-ag32-action-handler-architecture-handoff-plan.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag31z-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag31z-queue-integration-closure-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag31z-ag32-action-handler-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag31z-to-ag32-action-handler-architecture-boundary.json");
const registry = readJson("data/quality/ag31z-queue-integration-closure.json");
const preview = readJson("data/quality/ag31z-queue-integration-closure-preview.json");

const ag31a = readJson("data/content-intelligence/backend-architecture/ag31a-article-state-model.json");
const ag31b = readJson("data/content-intelligence/backend-architecture/ag31b-queue-integration-plan.json");
const ag31c = readJson("data/content-intelligence/backend-architecture/ag31c-audit-log-model.json");
const ag31d = readJson("data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json");
const ag31dReadiness = readJson("data/content-intelligence/quality-registry/ag31d-queue-integration-closure-readiness-record.json");
const ag31dIllegal = readJson("data/content-intelligence/backend-architecture/ag31d-illegal-transition-audit-register.json");
const ag31dAdmin = readJson("data/content-intelligence/backend-architecture/ag31d-admin-approval-gate-audit-register.json");
const ag31dEditor = readJson("data/content-intelligence/backend-architecture/ag31d-editor-restriction-audit-register.json");
const ag31dPublish = readJson("data/content-intelligence/backend-architecture/ag31d-publish-path-audit-register.json");
const ag30z = readJson("data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json");
const ag30zBlocker = readJson("data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json");
const ag30bAssigned = readJson("data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "queue_integration_closure_created_ready_for_ag32") fail("Review status mismatch.");
if (closure.status !== "queue_integration_closure_created_ready_for_ag32") fail("Closure status mismatch.");
if (closure.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (closure.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (closure.closure_decision.ag31_chain_closed !== true) fail("AG31 chain must be closed.");
if (closure.closure_decision.non_active_queue_state_planning_closed !== true) fail("Queue/state planning must be closed.");
if (closure.closure_decision.ag32_ready_for_action_handler_architecture !== true) fail("AG32 readiness missing.");

for (const flag of [
  "database_creation_approved",
  "migration_generation_approved",
  "sql_generation_approved",
  "queue_runtime_approved",
  "article_state_runtime_approved",
  "state_transition_runtime_approved",
  "audit_runtime_approved",
  "hash_runtime_approved",
  "assignment_query_approved",
  "publish_handler_runtime_approved",
  "return_handler_runtime_approved",
  "archive_handler_runtime_approved",
  "rollback_runtime_approved",
  "rls_policy_application_approved",
  "auth_activation_approved",
  "backend_connection_approved",
  "supabase_connection_approved",
  "server_route_creation_approved",
  "api_route_creation_approved",
  "secret_creation_approved",
  "env_var_write_approved",
  "deployment_approved",
  "public_mutation_approved"
]) {
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (sourceChain.chain_length !== 4) fail("Source chain length must be 4.");
for (const stage of ["AG31A", "AG31B", "AG31C", "AG31D"]) {
  if (!sourceChain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage ${stage}.`);
}

if (closureRegister.status !== "non_active_queue_state_planning_closed_ready_for_ag32") fail("Closure register status mismatch.");
for (const [key, value] of Object.entries(closureRegister.closure_points)) {
  if (value !== true) fail(`Closure point must be true: ${key}`);
}
if (closureRegister.planned_counts.article_states !== 7) fail("Article state count must be 7.");

for (const [key, value] of Object.entries(activationBlocker.blocked_activation_items)) {
  if (value !== false) fail(`${key} must remain false.`);
}
if (activationBlocker.future_unlock_requirements.length < 7) fail("Future unlock requirements incomplete.");

if (ag32Handoff.status !== "ag32_action_handler_architecture_handoff_created") fail("AG32 handoff status mismatch.");
if (ag32Handoff.ag32_ready !== true) fail("AG32 handoff readiness missing.");
if (ag32Handoff.ag32_activation_allowed !== false) fail("AG32 activation must be false.");
if (!ag32Handoff.ag32_allowed_scope.includes("Define non-active publish action-handler architecture.")) fail("AG32 publish handler scope missing.");
if (!ag32Handoff.ag32_blocked_scope.includes("No action-handler runtime.")) fail("AG32 action-handler runtime blocker missing.");
if (!ag32Handoff.ag32_blocked_scope.includes("No public mutation.")) fail("AG32 public mutation blocker missing.");

if (!consumption.future_consumption?.AG32) fail("AG32 consumption note missing.");
if (!consumption.future_consumption?.AG33) fail("AG33 consumption note missing.");
if (!consumption.future_consumption?.AG34) fail("AG34 consumption note missing.");
if (!consumption.future_consumption?.AG35_and_later) fail("AG35/later consumption note missing.");

if (blocker.status !== "queue_integration_closure_runtime_operations_blocked") fail("Blocker status mismatch.");
if (readiness.ready_for_ag32 !== true) fail("AG32 readiness missing.");
if (readiness.allowed_ag32_mode !== "non_active_action_handler_architecture_only") fail("AG32 mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.action_handler_runtime_allowed_now !== false) fail("Action handler runtime must be false.");
if (readiness.queue_runtime_allowed_now !== false) fail("Queue runtime must be false.");
if (readiness.audit_runtime_allowed_now !== false) fail("Audit runtime must be false.");
if (readiness.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");
if (readiness.public_mutation_allowed_now !== false) fail("Public mutation must be false.");

if (boundary.next_stage_id !== "AG32") fail("Boundary must point to AG32.");
if (boundary.status !== "ag32_boundary_created_non_active_action_handler_architecture_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.queue_integration_closure_created !== true) fail("Review summary missing.");
if (review.summary.ag31_chain_closed !== true) fail("AG31 chain summary missing.");
if (review.summary.detailed_stages_closed !== 4) fail("Detailed stages closed must be 4.");
if (review.summary.ready_for_ag32 !== true) fail("AG32 readiness summary missing.");

for (const flag of [
  "database_creation_allowed_now",
  "migration_generation_allowed_now",
  "sql_generation_allowed_now",
  "queue_runtime_allowed_now",
  "article_state_runtime_allowed_now",
  "state_transition_runtime_allowed_now",
  "audit_runtime_allowed_now",
  "hash_runtime_allowed_now",
  "assignment_query_allowed_now",
  "publish_handler_runtime_allowed_now",
  "rollback_runtime_allowed_now",
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
if (ag31b.status !== "queue_integration_plan_created_ready_for_ag31c") fail("AG31B source status mismatch.");
if (ag31c.status !== "audit_log_model_created_ready_for_ag31d") fail("AG31C source status mismatch.");
if (ag31d.status !== "state_transition_audit_created_ready_for_ag31z") fail("AG31D source status mismatch.");
if (ag31d.audit_decision.all_audits_passed !== true) fail("AG31D all audits must pass.");
if (ag31dReadiness.ready_for_ag31z !== true) fail("AG31D readiness must allow AG31Z.");
if (ag31dIllegal.audit_passed !== true) fail("Illegal transition audit must pass.");
if (ag31dAdmin.audit_passed !== true) fail("Admin gate audit must pass.");
if (ag31dEditor.audit_passed !== true) fail("Editor audit must pass.");
if (ag31dPublish.audit_passed !== true) fail("Publish audit must pass.");
if (ag30z.status !== "login_ui_closure_created_ready_for_ag31") fail("AG30Z source status mismatch.");

for (const [key, value] of Object.entries(ag30zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG30Z activation blocker must remain false: ${key}`);
}

if (ag30bAssigned.editor_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Assigned-only source missing.");
if (ag30bAssigned.editor_rules.editor_cannot_publish !== true) fail("Editor no-publish source missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "queue_integration_closure_created_ready_for_ag32") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.ag31_chain_closed !== 1) fail("Preview AG31 chain closed missing.");
if (preview.ready_for_ag32 !== 1) fail("Preview AG32 readiness missing.");
if (preview.database_objects_created !== 0) fail("Preview database objects must be 0.");
if (preview.migrations_generated !== 0) fail("Preview migrations must be 0.");
if (preview.sql_generated !== 0) fail("Preview SQL must be 0.");
if (preview.queue_runtime_created !== 0) fail("Preview queue runtime must be 0.");
if (preview.article_state_runtime_created !== 0) fail("Preview article-state runtime must be 0.");
if (preview.state_transition_runtime_created !== 0) fail("Preview transition runtime must be 0.");
if (preview.audit_runtime_created !== 0) fail("Preview audit runtime must be 0.");
if (preview.hash_runtime_created !== 0) fail("Preview hash runtime must be 0.");
if (preview.assignment_query_created !== 0) fail("Preview assignment query must be 0.");
if (preview.publish_handler_runtime_created !== 0) fail("Preview publish handler runtime must be 0.");
if (preview.rollback_runtime_created !== 0) fail("Preview rollback runtime must be 0.");
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
  "data/content-intelligence/backend-architecture/ag31b-queue-integration-plan.json",
  "data/content-intelligence/backend-architecture/ag31c-audit-log-model.json",
  "data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json",
  "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!closure.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Closure did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "queue_integration_closure_created" ||
    k === "ag31_chain_closed" ||
    k === "non_active_queue_state_planning_closed" ||
    k === "ag32_action_handler_architecture_allowed"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag31z"]) fail("Missing generate:ag31z script.");
if (!pkg.scripts?.["validate:ag31z"]) fail("Missing validate:ag31z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag31z")) fail("validate:project must include validate:ag31z.");

pass("AG31Z Queue Integration Closure is present.");
pass("AG31A-AG31D non-active queue/state planning chain is closed.");
pass("AG32 non-active action-handler architecture boundary is ready.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No database, queue runtime, audit runtime, handlers, Auth/backend/Supabase activation, secrets, deployment or public mutation is enabled.");
