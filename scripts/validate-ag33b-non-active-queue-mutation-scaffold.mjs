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
  console.error(`❌ AG33B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold.json",
  "data/content-intelligence/backend-architecture/ag33a-disabled-publish-control-model.json",
  "data/content-intelligence/backend-architecture/ag33a-preview-only-publish-handler-shape.json",
  "data/content-intelligence/backend-architecture/ag33a-scaffold-guard-binding-model.json",
  "data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold-audit-register.json",
  "data/content-intelligence/quality-registry/ag33a-queue-mutation-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag33a-to-ag33b-queue-mutation-scaffold-boundary.json",
  "data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json",
  "data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-precondition-register.json",
  "data/content-intelligence/backend-architecture/ag32b-return-to-editor-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-archive-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-editor-resubmission-path-model.json",
  "data/content-intelligence/backend-architecture/ag32c-forbidden-publish-path-guard-register.json",
  "data/content-intelligence/backend-architecture/ag32d-handler-architecture-audit.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-register.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/backend-architecture/ag31b-admin-review-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31b-editor-assignment-queue-map.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag33b-non-active-queue-mutation-scaffold.json",
  "data/content-intelligence/backend-architecture/ag33b-non-active-queue-mutation-scaffold.json",
  "data/content-intelligence/backend-architecture/ag33b-preview-only-queue-mutation-shape.json",
  "data/content-intelligence/backend-architecture/ag33b-state-change-preview-model.json",
  "data/content-intelligence/backend-architecture/ag33b-admin-editor-queue-impact-model.json",
  "data/content-intelligence/backend-architecture/ag33b-queue-mutation-scaffold-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag33b-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag33b-queue-mutation-scaffold-blocker-register.json",
  "data/content-intelligence/quality-registry/ag33b-audit-write-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag33b-to-ag33c-audit-write-scaffold-boundary.json",
  "data/quality/ag33b-non-active-queue-mutation-scaffold.json",
  "data/quality/ag33b-non-active-queue-mutation-scaffold-preview.json",
  "docs/quality/AG33B_NON_ACTIVE_QUEUE_MUTATION_SCAFFOLD.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag33b-non-active-queue-mutation-scaffold.json");
const scaffold = readJson("data/content-intelligence/backend-architecture/ag33b-non-active-queue-mutation-scaffold.json");
const queueShape = readJson("data/content-intelligence/backend-architecture/ag33b-preview-only-queue-mutation-shape.json");
const statePreview = readJson("data/content-intelligence/backend-architecture/ag33b-state-change-preview-model.json");
const queueImpact = readJson("data/content-intelligence/backend-architecture/ag33b-admin-editor-queue-impact-model.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag33b-queue-mutation-scaffold-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag33b-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag33b-queue-mutation-scaffold-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag33b-audit-write-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag33b-to-ag33c-audit-write-scaffold-boundary.json");
const registry = readJson("data/quality/ag33b-non-active-queue-mutation-scaffold.json");
const preview = readJson("data/quality/ag33b-non-active-queue-mutation-scaffold-preview.json");

const ag33a = readJson("data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold.json");
const ag33aReadiness = readJson("data/content-intelligence/quality-registry/ag33a-queue-mutation-scaffold-readiness-record.json");
const ag33aNonActivation = readJson("data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold-audit-register.json");
const ag32z = readJson("data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json");
const ag32zBlocker = readJson("data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json");
const ag32d = readJson("data/content-intelligence/backend-architecture/ag32d-handler-architecture-audit.json");
const ag31aState = readJson("data/content-intelligence/backend-architecture/ag31a-article-state-register.json");
const ag31aTransition = readJson("data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json");
const ag30bAssigned = readJson("data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "non_active_queue_mutation_scaffold_created_ready_for_ag33c") fail("Review status mismatch.");
if (scaffold.status !== "non_active_queue_mutation_scaffold_created_ready_for_ag33c") fail("Scaffold status mismatch.");
if (scaffold.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (scaffold.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (scaffold.scaffold_decision.non_active_queue_mutation_scaffold_created !== true) fail("Scaffold decision missing.");
if (scaffold.scaffold_decision.preview_only_queue_mutation_shape_created !== true) fail("Queue mutation shape decision missing.");
if (scaffold.scaffold_decision.state_change_preview_model_created !== true) fail("State preview decision missing.");
if (scaffold.scaffold_decision.admin_editor_queue_impact_model_created !== true) fail("Queue impact decision missing.");
if (scaffold.scaffold_decision.proceed_to_ag33c_audit_write_scaffold !== true) fail("AG33C readiness missing.");

for (const flag of [
  "queue_runtime_approved_now",
  "queue_mutation_runtime_approved_now",
  "assignment_query_approved_now",
  "article_state_runtime_approved_now",
  "state_transition_runtime_approved_now",
  "publish_handler_runtime_approved_now",
  "return_handler_runtime_approved_now",
  "archive_handler_runtime_approved_now",
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
  "github_write_approved_now",
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (scaffold.scaffold_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "queue_runtime_allowed_in_ag33b",
  "queue_mutation_runtime_allowed_in_ag33b",
  "assignment_query_allowed_in_ag33b",
  "article_state_runtime_allowed_in_ag33b",
  "state_transition_runtime_allowed_in_ag33b",
  "publish_handler_runtime_allowed_in_ag33b",
  "return_handler_runtime_allowed_in_ag33b",
  "archive_handler_runtime_allowed_in_ag33b",
  "database_creation_allowed_in_ag33b",
  "migration_generation_allowed_in_ag33b",
  "sql_generation_allowed_in_ag33b",
  "rls_policy_application_allowed_in_ag33b",
  "auth_activation_allowed_in_ag33b",
  "backend_connection_allowed_in_ag33b",
  "supabase_connection_allowed_in_ag33b",
  "server_route_creation_allowed_in_ag33b",
  "api_route_creation_allowed_in_ag33b",
  "secret_creation_allowed_in_ag33b",
  "env_var_write_allowed_in_ag33b",
  "github_write_allowed_in_ag33b",
  "deployment_allowed_in_ag33b",
  "public_mutation_allowed_in_ag33b"
]) {
  if (scaffold[flag] !== false) fail(`${flag} must be false.`);
}

if (queueShape.status !== "preview_only_queue_mutation_shape_created_no_runtime") fail("Queue shape status mismatch.");
if (queueShape.current_mode !== "preview_only") fail("Queue shape must be preview-only.");
if (queueShape.execute_now !== false) fail("Queue shape must not execute.");
if (queueShape.queue_runtime_created !== false) fail("Queue runtime must be false.");
if (queueShape.queue_mutation_runtime_created !== false) fail("Queue mutation runtime must be false.");
if (queueShape.database_write_created !== false) fail("Database write must be false.");
if (queueShape.public_mutation_done !== false) fail("Public mutation must be false.");
for (const action of ["approve_for_publish", "publish", "return_to_editor", "editor_resubmit", "archive"]) {
  if (!queueShape.supported_preview_mutations.some((item) => item.action === action)) fail(`Missing preview mutation action: ${action}`);
}

if (statePreview.status !== "state_change_preview_model_created_no_runtime") fail("State preview status mismatch.");
for (const state of ["draft", "admin_review", "returned", "editor_submitted", "publish_approved", "published", "archived"]) {
  if (!statePreview.allowed_preview_states.includes(state)) fail(`Missing preview state: ${state}`);
}
if (statePreview.execute_now !== false) fail("State preview must not execute.");
if (statePreview.article_state_runtime_created !== false) fail("Article state runtime must be false.");
if (statePreview.state_transition_runtime_created !== false) fail("State transition runtime must be false.");
if (statePreview.queue_mutation_runtime_created !== false) fail("Queue mutation runtime must be false.");

if (queueImpact.status !== "admin_editor_queue_impact_model_created_no_runtime") fail("Queue impact status mismatch.");
if (queueImpact.governance_preserved.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (queueImpact.governance_preserved.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (queueImpact.governance_preserved.editor_cannot_publish !== true) fail("Editor cannot publish missing.");
if (queueImpact.queue_query_runtime_created !== false) fail("Queue query runtime must be false.");
if (queueImpact.assignment_query_created !== false) fail("Assignment query must be false.");
if (queueImpact.database_write_created !== false) fail("Database write must be false.");

if (nonActivation.status !== "queue_mutation_scaffold_non_activation_audit_passed") fail("Non-activation audit status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG33C) fail("AG33C consumption note missing.");
if (!consumption.future_consumption?.AG33D) fail("AG33D consumption note missing.");
if (!consumption.future_consumption?.AG33Z) fail("AG33Z consumption note missing.");
if (!consumption.future_consumption?.AG34) fail("AG34 consumption note missing.");

if (blocker.status !== "queue_mutation_scaffold_operations_blocked_pending_ag33c") fail("Blocker status mismatch.");
if (readiness.ready_for_ag33c !== true) fail("AG33C readiness missing.");
if (readiness.allowed_ag33c_mode !== "non_active_audit_write_scaffold_only") fail("AG33C mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.queue_runtime_allowed_now !== false) fail("Queue runtime must be false.");
if (readiness.audit_runtime_allowed_now !== false) fail("Audit runtime must be false.");
if (readiness.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (readiness.public_mutation_allowed_now !== false) fail("Public mutation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG33C") fail("Boundary must point to AG33C.");
if (boundary.status !== "ag33c_boundary_created_non_active_audit_write_scaffold_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.non_active_queue_mutation_scaffold_created !== true) fail("Review summary missing.");
if (review.summary.ready_for_ag33c !== true) fail("AG33C readiness summary missing.");

for (const flag of [
  "queue_runtime_allowed_now",
  "queue_mutation_runtime_allowed_now",
  "assignment_query_allowed_now",
  "article_state_runtime_allowed_now",
  "state_transition_runtime_allowed_now",
  "publish_handler_runtime_allowed_now",
  "return_handler_runtime_allowed_now",
  "archive_handler_runtime_allowed_now",
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
  "github_write_done",
  "deployment_done",
  "public_mutation_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must be false.`);
}

if (ag33a.status !== "non_active_publish_handler_scaffold_created_ready_for_ag33b") fail("AG33A source status mismatch.");
if (ag33aReadiness.ready_for_ag33b !== true) fail("AG33A readiness must allow AG33B.");
if (ag33aNonActivation.audit_passed !== true) fail("AG33A non-activation audit must pass.");
if (ag32z.status !== "dynamic_handler_architecture_closure_created_ready_for_ag33") fail("AG32Z source status mismatch.");
for (const [key, value] of Object.entries(ag32zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG32Z activation blocker must remain false: ${key}`);
}
if (ag32d.audit_decision.all_audits_passed !== true) fail("AG32D all audits must pass.");
if (ag31aState.state_count !== 7) fail("AG31A state count must be 7.");
if (!ag31aTransition.transitions.some((t) => t.from === "admin_review" && t.to === "publish_approved" && t.actor === "admin")) fail("Admin approve transition missing.");
if (!ag31aTransition.transitions.some((t) => t.from === "publish_approved" && t.to === "published" && t.actor === "future_controlled_publish_handler")) fail("Publish transition missing.");
if (!ag31aTransition.transitions.some((t) => t.from === "admin_review" && t.to === "returned" && t.actor === "admin")) fail("Return transition missing.");
if (!ag31aTransition.transitions.some((t) => t.from === "returned" && t.to === "editor_submitted" && t.actor === "editor")) fail("Editor resubmit transition missing.");
if (!ag31aTransition.transitions.some((t) => t.from === "admin_review" && t.to === "archived" && t.actor === "admin")) fail("Archive transition missing.");
if (ag30bAssigned.editor_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Assigned-only source missing.");
if (ag30bAssigned.editor_rules.editor_cannot_publish !== true) fail("Editor no-publish source missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "non_active_queue_mutation_scaffold_created_ready_for_ag33c") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.non_active_queue_mutation_scaffold_created !== 1) fail("Preview scaffold missing.");
if (preview.preview_only_queue_mutation_shape_created !== 1) fail("Preview queue shape missing.");
if (preview.queue_runtime_created !== 0) fail("Preview queue runtime must be 0.");
if (preview.queue_mutation_runtime_created !== 0) fail("Preview queue mutation runtime must be 0.");
if (preview.assignment_query_created !== 0) fail("Preview assignment query must be 0.");
if (preview.article_state_runtime_created !== 0) fail("Preview article state runtime must be 0.");
if (preview.state_transition_runtime_created !== 0) fail("Preview state transition runtime must be 0.");
if (preview.publish_handler_runtime_created !== 0) fail("Preview publish runtime must be 0.");
if (preview.return_handler_runtime_created !== 0) fail("Preview return runtime must be 0.");
if (preview.archive_handler_runtime_created !== 0) fail("Preview archive runtime must be 0.");
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
if (preview.github_write_done !== 0) fail("Preview GitHub write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold.json",
  "data/content-intelligence/backend-architecture/ag33a-preview-only-publish-handler-shape.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/backend-architecture/ag31b-admin-review-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31b-editor-assignment-queue-map.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!scaffold.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Scaffold did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "non_active_queue_mutation_scaffold_created" ||
    k === "preview_only_queue_mutation_shape_created" ||
    k === "state_change_preview_model_created" ||
    k === "admin_editor_queue_impact_model_created" ||
    k === "queue_mutation_non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag33b"]) fail("Missing generate:ag33b script.");
if (!pkg.scripts?.["validate:ag33b"]) fail("Missing validate:ag33b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag33b")) fail("validate:project must include validate:ag33b.");

pass("AG33B Non-active Queue Mutation Scaffold is present.");
pass("Preview-only queue mutation shape, state change preview and Admin/Editor queue impact models are valid.");
pass("No queue runtime, database write, Auth/backend/Supabase activation, secrets, deployment or public mutation is enabled.");
pass("AG33C Audit Write Scaffold boundary is ready.");
