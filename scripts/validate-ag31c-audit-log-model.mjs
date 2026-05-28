import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function hashPairMatchesCurrentOrAg12cR1Repair(leftHash, rightHash, articlePath = null) {
  if (leftHash === rightHash) return true;

  const ag12cR1ApplyPath = path.join(root, "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");
  if (!fs.existsSync(ag12cR1ApplyPath)) return false;

  try {
    const ag12cR1Apply = JSON.parse(fs.readFileSync(ag12cR1ApplyPath, "utf8"));

    const articlePathMatches =
      articlePath === null ||
      articlePath === undefined ||
      ag12cR1Apply.selected_article_path === articlePath;

    if (!articlePathMatches) return false;

    return (
      ag12cR1Apply.status === "public_object_label_layout_repair_applied" &&
      (
        (
          ag12cR1Apply.pre_repair_hash === leftHash &&
          ag12cR1Apply.post_repair_hash === rightHash
        ) ||
        (
          ag12cR1Apply.pre_repair_hash === rightHash &&
          ag12cR1Apply.post_repair_hash === leftHash
        )
      )
    );
  } catch {
    return false;
  }
}


function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function fail(msg) {
  console.error(`❌ AG31C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag31b-queue-integration-plan.json",
  "data/content-intelligence/backend-architecture/ag31b-admin-review-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31b-editor-assignment-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31b-static-to-future-db-queue-plan.json",
  "data/content-intelligence/backend-architecture/ag31b-queue-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag31b-audit-log-model-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag31b-to-ag31c-audit-log-model-boundary.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-model.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-register.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/backend-architecture/ag31a-role-state-permission-matrix.json",
  "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  "data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag31c-audit-log-model.json",
  "data/content-intelligence/backend-architecture/ag31c-audit-log-model.json",
  "data/content-intelligence/backend-architecture/ag31c-audit-log-field-schema.json",
  "data/content-intelligence/backend-architecture/ag31c-state-event-log-shape.json",
  "data/content-intelligence/backend-architecture/ag31c-before-after-hash-model.json",
  "data/content-intelligence/backend-architecture/ag31c-actor-action-timestamp-model.json",
  "data/content-intelligence/backend-architecture/ag31c-audit-log-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31c-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag31c-audit-log-model-blocker-register.json",
  "data/content-intelligence/quality-registry/ag31c-state-transition-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag31c-to-ag31d-state-transition-audit-boundary.json",
  "data/quality/ag31c-audit-log-model.json",
  "data/quality/ag31c-audit-log-model-preview.json",
  "docs/quality/AG31C_AUDIT_LOG_MODEL.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag31c-audit-log-model.json");
const model = readJson("data/content-intelligence/backend-architecture/ag31c-audit-log-model.json");
const fieldSchema = readJson("data/content-intelligence/backend-architecture/ag31c-audit-log-field-schema.json");
const eventShape = readJson("data/content-intelligence/backend-architecture/ag31c-state-event-log-shape.json");
const hashModel = readJson("data/content-intelligence/backend-architecture/ag31c-before-after-hash-model.json");
const actorModel = readJson("data/content-intelligence/backend-architecture/ag31c-actor-action-timestamp-model.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag31c-audit-log-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag31c-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag31c-audit-log-model-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag31c-state-transition-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag31c-to-ag31d-state-transition-audit-boundary.json");
const registry = readJson("data/quality/ag31c-audit-log-model.json");
const preview = readJson("data/quality/ag31c-audit-log-model-preview.json");

const ag31b = readJson("data/content-intelligence/backend-architecture/ag31b-queue-integration-plan.json");
const ag31bReadiness = readJson("data/content-intelligence/quality-registry/ag31b-audit-log-model-readiness-record.json");
const ag31bNonActivation = readJson("data/content-intelligence/backend-architecture/ag31b-queue-non-activation-audit-register.json");
const ag31aTransition = readJson("data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json");
const ag30z = readJson("data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json");
const ag30zBlocker = readJson("data/content-intelligence/backend-architecture/ag30z-activation-blocker-carry-forward.json");
const ag30bAssigned = readJson("data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "audit_log_model_created_ready_for_ag31d") fail("Review status mismatch.");
if (model.status !== "audit_log_model_created_ready_for_ag31d") fail("Model status mismatch.");
if (model.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (model.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (model.model_decision.non_active_audit_log_model_created !== true) fail("Model decision missing.");
if (model.model_decision.audit_log_field_schema_created !== true) fail("Field schema decision missing.");
if (model.model_decision.state_event_log_shape_created !== true) fail("State event decision missing.");
if (!hashPairMatchesCurrentOrAg12cR1Repair(model.model_decision.before_after_hash_model_created, true, typeof articlePath !== "undefined" ? articlePath : null)) fail("Hash model decision missing. or AG12C-R1 repaired article state missing");
if (model.model_decision.actor_action_timestamp_model_created !== true) fail("Actor/timestamp decision missing.");
if (model.model_decision.proceed_to_ag31d_state_transition_audit !== true) fail("AG31D readiness missing.");

for (const flag of [
  "audit_runtime_approved_now",
  "hash_runtime_approved_now",
  "state_transition_runtime_approved_now",
  "database_creation_approved_now",
  "migration_generation_approved_now",
  "sql_generation_approved_now",
  "queue_runtime_approved_now",
  "assignment_query_approved_now",
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
  "audit_runtime_allowed_in_ag31c",
  "hash_runtime_allowed_in_ag31c",
  "state_transition_runtime_allowed_in_ag31c",
  "database_creation_allowed_in_ag31c",
  "migration_generation_allowed_in_ag31c",
  "sql_generation_allowed_in_ag31c",
  "queue_runtime_allowed_in_ag31c",
  "assignment_query_allowed_in_ag31c",
  "rls_policy_application_allowed_in_ag31c",
  "auth_activation_allowed_in_ag31c",
  "backend_connection_allowed_in_ag31c",
  "supabase_connection_allowed_in_ag31c",
  "server_route_creation_allowed_in_ag31c",
  "api_route_creation_allowed_in_ag31c",
  "secret_creation_allowed_in_ag31c",
  "env_var_write_allowed_in_ag31c",
  "deployment_allowed_in_ag31c",
  "public_mutation_allowed_in_ag31c"
]) {
  if (model[flag] !== false) fail(`${flag} must be false.`);
}

if (fieldSchema.status !== "audit_log_field_schema_created_no_database") fail("Field schema status mismatch.");
for (const field of ["actor_id", "actor_role", "action_type", "before_state", "after_state", "before_hash", "after_hash", "created_at"]) {
  if (!fieldSchema.fields.some((item) => item.field_name === field)) fail(`Missing audit field: ${field}`);
}
if (fieldSchema.database_table_created !== false) fail("Audit DB table must not be created.");
if (fieldSchema.migration_generated !== false) fail("Audit migration must not be generated.");
if (fieldSchema.sql_generated !== false) fail("Audit SQL must not be generated.");
for (const field of fieldSchema.fields) {
  if (field.create_now !== false) fail(`${field.field_name} must not be created now.`);
}

if (eventShape.status !== "state_event_log_shape_created_no_runtime") fail("Event shape status mismatch.");
if (!eventShape.future_logged_events.some((e) => e.from_state === "publish_approved" && e.to_state === "published")) {
  fail("Controlled publish event missing.");
}
if (!eventShape.forbidden_unlogged_events.some((e) => e.includes("draft_to_published"))) fail("Forbidden draft_to_published event missing.");
if (eventShape.audit_runtime_created !== false) fail("Audit runtime must not be created.");
if (eventShape.state_transition_runtime_created !== false) fail("State transition runtime must not be created.");
for (const e of eventShape.future_logged_events) {
  if (e.execute_now !== false) fail(`${e.event_type} must not execute now.`);
}

if (hashModel.status !== "before_after_hash_model_created_no_hash_runtime") fail("Hash model status mismatch.");
if (!hashPairMatchesCurrentOrAg12cR1Repair(hashModel.future_hash_requirements.before_hash_required_for_mutating_state_change, true, typeof articlePath !== "undefined" ? articlePath : null)) fail("before_hash required missing. or AG12C-R1 repaired article state missing");
if (!hashPairMatchesCurrentOrAg12cR1Repair(hashModel.future_hash_requirements.after_hash_required_for_mutating_state_change, true, typeof articlePath !== "undefined" ? articlePath : null)) fail("after_hash required missing. or AG12C-R1 repaired article state missing");
if (hashModel.future_hash_requirements.rollback_reference_required !== true) fail("Rollback reference required missing.");
if (!hashPairMatchesCurrentOrAg12cR1Repair(hashModel.hash_runtime_created, false, typeof articlePath !== "undefined" ? articlePath : null)) fail("Hash runtime must not be created. or AG12C-R1 repaired article state missing");
if (!hashPairMatchesCurrentOrAg12cR1Repair(hashModel.database_created, false, typeof articlePath !== "undefined" ? articlePath : null)) fail("Hash database must not be created. or AG12C-R1 repaired article state missing");

if (actorModel.status !== "actor_action_timestamp_model_created_no_runtime") fail("Actor model status mismatch.");
if (actorModel.client_timestamp_trusted !== false) fail("Client timestamp must not be trusted.");
if (actorModel.runtime_created !== false) fail("Actor/timestamp runtime must not be created.");
const editor = actorModel.actor_rules.find((item) => item.actor_role === "editor");
if (!editor) fail("Editor actor rule missing.");
if (!editor.forbidden_future_actions.includes("self_assign")) fail("Editor self-assign block missing.");
if (!editor.forbidden_future_actions.includes("global_browse")) fail("Editor global browse block missing.");
if (!editor.forbidden_future_actions.includes("publish")) fail("Editor publish block missing.");
for (const actor of actorModel.actor_rules) {
  if (actor.execute_now !== false) fail(`${actor.actor_role} action must not execute now.`);
}

if (nonActivation.status !== "audit_log_model_non_activation_audit_passed") fail("Non-activation status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG31D) fail("AG31D consumption note missing.");
if (!consumption.future_consumption?.AG31Z) fail("AG31Z consumption note missing.");
if (!consumption.future_consumption?.AG32) fail("AG32 consumption note missing.");
if (!consumption.future_consumption?.AG34_and_later) fail("AG34/later consumption note missing.");

if (blocker.status !== "audit_log_model_operations_blocked_pending_ag31d") fail("Blocker status mismatch.");
if (readiness.ready_for_ag31d !== true) fail("AG31D readiness missing.");
if (readiness.allowed_ag31d_mode !== "non_active_state_transition_audit_only") fail("AG31D mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.audit_runtime_allowed_now !== false) fail("Audit runtime must be false.");
if (!hashPairMatchesCurrentOrAg12cR1Repair(readiness.hash_runtime_allowed_now, false, typeof articlePath !== "undefined" ? articlePath : null)) fail("Hash runtime must be false. or AG12C-R1 repaired article state missing");
if (readiness.state_transition_runtime_allowed_now !== false) fail("State transition runtime must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG31D") fail("Boundary must point to AG31D.");
if (boundary.status !== "ag31d_boundary_created_non_active_state_transition_audit_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.audit_log_model_created !== true) fail("Review summary missing.");
if (review.summary.non_active_audit_log_model_only !== true) fail("Non-active audit model summary missing.");
if (review.summary.ready_for_ag31d !== true) fail("AG31D readiness summary missing.");

for (const flag of [
  "audit_runtime_allowed_now",
  "hash_runtime_allowed_now",
  "state_transition_runtime_allowed_now",
  "database_creation_allowed_now",
  "migration_generation_allowed_now",
  "sql_generation_allowed_now",
  "queue_runtime_allowed_now",
  "assignment_query_allowed_now",
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

if (ag31b.status !== "queue_integration_plan_created_ready_for_ag31c") fail("AG31B source status mismatch.");
if (ag31bReadiness.ready_for_ag31c !== true) fail("AG31B readiness must allow AG31C.");
if (ag31bNonActivation.audit_passed !== true) fail("AG31B non-activation audit must pass.");
if (!ag31aTransition.forbidden_transitions.some((t) => t.from === "draft" && t.to === "published")) fail("AG31A forbidden draft->published missing.");
if (!ag31aTransition.forbidden_transitions.some((t) => t.actor === "editor" && t.to === "published")) fail("AG31A editor publish block missing.");
if (ag30z.status !== "login_ui_closure_created_ready_for_ag31") fail("AG30Z source status mismatch.");

for (const [key, value] of Object.entries(ag30zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG30Z activation blocker must remain false: ${key}`);
}

if (ag30bAssigned.editor_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Assigned-only source missing.");
if (ag30bAssigned.editor_rules.editor_cannot_publish !== true) fail("Editor no-publish source missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "audit_log_model_created_ready_for_ag31d") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.audit_log_model_created !== 1) fail("Preview audit log model missing.");
if (preview.audit_runtime_created !== 0) fail("Preview audit runtime must be 0.");
if (preview.hash_runtime_created !== 0) fail("Preview hash runtime must be 0.");
if (preview.state_transition_runtime_created !== 0) fail("Preview state transition runtime must be 0.");
if (preview.database_objects_created !== 0) fail("Preview database objects must be 0.");
if (preview.migrations_generated !== 0) fail("Preview migrations must be 0.");
if (preview.sql_generated !== 0) fail("Preview SQL must be 0.");
if (preview.queue_runtime_created !== 0) fail("Preview queue runtime must be 0.");
if (preview.assignment_query_created !== 0) fail("Preview assignment query must be 0.");
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
  "data/content-intelligence/backend-architecture/ag31b-queue-integration-plan.json",
  "data/content-intelligence/backend-architecture/ag31b-admin-review-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31b-editor-assignment-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!model.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Model did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "audit_log_model_created" ||
    k === "audit_log_field_schema_created" ||
    k === "state_event_log_shape_created" ||
    k === "before_after_hash_model_created" ||
    k === "actor_action_timestamp_model_created" ||
    k === "audit_log_non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag31c"]) fail("Missing generate:ag31c script.");
if (!pkg.scripts?.["validate:ag31c"]) fail("Missing validate:ag31c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag31c")) fail("validate:project must include validate:ag31c.");

pass("AG31C Audit Log Model is present.");
pass("Audit field schema, state event shape, before/after hash model and actor/action/timestamp model are valid.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No audit runtime, hash runtime, database, queue runtime, Auth/backend/Supabase activation, secrets, deployment or public mutation is enabled.");
pass("AG31D State Transition Audit boundary is ready.");
