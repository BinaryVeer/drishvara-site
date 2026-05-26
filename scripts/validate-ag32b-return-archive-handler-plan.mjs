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
  console.error(`❌ AG32B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-precondition-register.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag32a-return-archive-handler-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag32a-to-ag32b-return-archive-handler-plan-boundary.json",
  "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  "data/content-intelligence/backend-architecture/ag31z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json",
  "data/content-intelligence/backend-architecture/ag31d-editor-restriction-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-admin-approval-gate-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31b-admin-review-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31b-editor-assignment-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag32b-return-archive-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-return-archive-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-return-to-editor-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-archive-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-editor-resubmission-path-model.json",
  "data/content-intelligence/backend-architecture/ag32b-admin-decision-handler-model.json",
  "data/content-intelligence/backend-architecture/ag32b-return-archive-handler-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32b-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag32b-return-archive-handler-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag32b-publish-guard-rules-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag32b-to-ag32c-publish-guard-rules-boundary.json",
  "data/quality/ag32b-return-archive-handler-plan.json",
  "data/quality/ag32b-return-archive-handler-plan-preview.json",
  "docs/quality/AG32B_RETURN_ARCHIVE_HANDLER_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag32b-return-archive-handler-plan.json");
const plan = readJson("data/content-intelligence/backend-architecture/ag32b-return-archive-handler-plan.json");
const returnHandler = readJson("data/content-intelligence/backend-architecture/ag32b-return-to-editor-handler-plan.json");
const archiveHandler = readJson("data/content-intelligence/backend-architecture/ag32b-archive-handler-plan.json");
const resubmission = readJson("data/content-intelligence/backend-architecture/ag32b-editor-resubmission-path-model.json");
const adminDecision = readJson("data/content-intelligence/backend-architecture/ag32b-admin-decision-handler-model.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag32b-return-archive-handler-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag32b-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag32b-return-archive-handler-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag32b-publish-guard-rules-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag32b-to-ag32c-publish-guard-rules-boundary.json");
const registry = readJson("data/quality/ag32b-return-archive-handler-plan.json");
const preview = readJson("data/quality/ag32b-return-archive-handler-plan-preview.json");

const ag32a = readJson("data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json");
const ag32aReadiness = readJson("data/content-intelligence/quality-registry/ag32a-return-archive-handler-plan-readiness-record.json");
const ag32aNonActivation = readJson("data/content-intelligence/backend-architecture/ag32a-publish-handler-non-activation-audit-register.json");
const ag31z = readJson("data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json");
const ag31zBlocker = readJson("data/content-intelligence/backend-architecture/ag31z-activation-blocker-carry-forward.json");
const ag31d = readJson("data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json");
const ag31dEditor = readJson("data/content-intelligence/backend-architecture/ag31d-editor-restriction-audit-register.json");
const ag31aTransition = readJson("data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json");
const ag30bAssigned = readJson("data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "return_archive_handler_plan_created_ready_for_ag32c") fail("Review status mismatch.");
if (plan.status !== "return_archive_handler_plan_created_ready_for_ag32c") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (plan.plan_decision.non_active_return_archive_handler_plan_created !== true) fail("Plan decision missing.");
if (plan.plan_decision.return_to_editor_handler_plan_created !== true) fail("Return handler decision missing.");
if (plan.plan_decision.archive_handler_plan_created !== true) fail("Archive handler decision missing.");
if (plan.plan_decision.editor_resubmission_path_model_created !== true) fail("Editor resubmission decision missing.");
if (plan.plan_decision.proceed_to_ag32c_publish_guard_rules !== true) fail("AG32C readiness missing.");

for (const flag of [
  "return_handler_runtime_approved_now",
  "archive_handler_runtime_approved_now",
  "assignment_query_approved_now",
  "audit_runtime_approved_now",
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
  if (plan.plan_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "return_handler_runtime_allowed_in_ag32b",
  "archive_handler_runtime_allowed_in_ag32b",
  "assignment_query_allowed_in_ag32b",
  "audit_runtime_allowed_in_ag32b",
  "database_creation_allowed_in_ag32b",
  "migration_generation_allowed_in_ag32b",
  "sql_generation_allowed_in_ag32b",
  "rls_policy_application_allowed_in_ag32b",
  "auth_activation_allowed_in_ag32b",
  "backend_connection_allowed_in_ag32b",
  "supabase_connection_allowed_in_ag32b",
  "server_route_creation_allowed_in_ag32b",
  "api_route_creation_allowed_in_ag32b",
  "secret_creation_allowed_in_ag32b",
  "env_var_write_allowed_in_ag32b",
  "deployment_allowed_in_ag32b",
  "public_mutation_allowed_in_ag32b"
]) {
  if (plan[flag] !== false) fail(`${flag} must be false.`);
}

if (returnHandler.status !== "return_to_editor_handler_plan_created_no_runtime") fail("Return handler status mismatch.");
if (returnHandler.permitted_future_actor !== "admin") fail("Return handler must be Admin action.");
if (!returnHandler.future_input_states.includes("admin_review")) fail("Return handler must allow admin_review input.");
if (returnHandler.future_output_state !== "returned") fail("Return output must be returned.");
if (returnHandler.editor_rules_preserved.editor_cannot_publish !== true) fail("Editor publish block missing.");
if (returnHandler.runtime_created !== false) fail("Return runtime must be false.");
if (returnHandler.assignment_query_created !== false) fail("Return assignment query must be false.");
if (returnHandler.server_route_created !== false) fail("Return server route must be false.");
if (returnHandler.api_route_created !== false) fail("Return API route must be false.");
if (returnHandler.database_created !== false) fail("Return database must be false.");
if (returnHandler.public_mutation_done !== false) fail("Return public mutation must be false.");

if (archiveHandler.status !== "archive_handler_plan_created_no_runtime") fail("Archive handler status mismatch.");
if (archiveHandler.permitted_future_actor !== "admin") fail("Archive handler must be Admin action.");
if (!archiveHandler.future_input_states.includes("admin_review")) fail("Archive handler must allow admin_review input.");
if (archiveHandler.future_output_state !== "archived") fail("Archive output must be archived.");
if (archiveHandler.runtime_created !== false) fail("Archive runtime must be false.");
if (archiveHandler.server_route_created !== false) fail("Archive server route must be false.");
if (archiveHandler.api_route_created !== false) fail("Archive API route must be false.");
if (archiveHandler.database_created !== false) fail("Archive database must be false.");
if (archiveHandler.public_mutation_done !== false) fail("Archive public mutation must be false.");

if (resubmission.status !== "editor_resubmission_path_model_created_no_runtime") fail("Resubmission status mismatch.");
for (const state of ["admin_review", "returned", "editor_submitted"]) {
  if (!resubmission.state_path.includes(state)) fail(`Resubmission path missing ${state}`);
}
if (resubmission.editor_constraints.assigned_item_required !== true) fail("Assigned item requirement missing.");
if (resubmission.editor_constraints.self_assignment_blocked !== true) fail("Self-assignment block missing.");
if (resubmission.editor_constraints.global_browse_blocked !== true) fail("Global browse block missing.");
if (resubmission.editor_constraints.publish_blocked !== true) fail("Publish block missing.");
if (resubmission.runtime_created !== false) fail("Resubmission runtime must be false.");
if (resubmission.assignment_query_created !== false) fail("Resubmission assignment query must be false.");

if (adminDecision.status !== "admin_decision_handler_model_created_no_runtime") fail("Admin decision status mismatch.");
if (adminDecision.admin_final_clearance_preserved !== true) fail("Admin final clearance missing.");
for (const item of adminDecision.future_admin_decisions) {
  if (item.execute_now !== false) fail(`${item.decision} must not execute now.`);
}

if (nonActivation.status !== "return_archive_handler_non_activation_audit_passed") fail("Non-activation status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG32C) fail("AG32C consumption note missing.");
if (!consumption.future_consumption?.AG32D) fail("AG32D consumption note missing.");
if (!consumption.future_consumption?.AG32Z) fail("AG32Z consumption note missing.");
if (!consumption.future_consumption?.AG33) fail("AG33 consumption note missing.");

if (blocker.status !== "return_archive_handler_plan_operations_blocked_pending_ag32c") fail("Blocker status mismatch.");
if (readiness.ready_for_ag32c !== true) fail("AG32C readiness missing.");
if (readiness.allowed_ag32c_mode !== "non_active_publish_guard_rules_only") fail("AG32C mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.return_handler_runtime_allowed_now !== false) fail("Return runtime must be false.");
if (readiness.archive_handler_runtime_allowed_now !== false) fail("Archive runtime must be false.");
if (readiness.assignment_query_allowed_now !== false) fail("Assignment query must be false.");
if (readiness.public_mutation_allowed_now !== false) fail("Public mutation must be false.");

if (boundary.next_stage_id !== "AG32C") fail("Boundary must point to AG32C.");
if (boundary.status !== "ag32c_boundary_created_non_active_publish_guard_rules_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.return_archive_handler_plan_created !== true) fail("Review summary missing.");
if (review.summary.non_active_return_archive_handler_plan_only !== true) fail("Non-active plan summary missing.");
if (review.summary.ready_for_ag32c !== true) fail("AG32C readiness summary missing.");

for (const flag of [
  "return_handler_runtime_allowed_now",
  "archive_handler_runtime_allowed_now",
  "assignment_query_allowed_now",
  "audit_runtime_allowed_now",
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

if (ag32a.status !== "publish_handler_plan_created_ready_for_ag32b") fail("AG32A source status mismatch.");
if (ag32aReadiness.ready_for_ag32b !== true) fail("AG32A readiness must allow AG32B.");
if (ag32aNonActivation.audit_passed !== true) fail("AG32A non-activation audit must pass.");
if (ag31z.status !== "queue_integration_closure_created_ready_for_ag32") fail("AG31Z source status mismatch.");
for (const [key, value] of Object.entries(ag31zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG31Z activation blocker must remain false: ${key}`);
}
if (ag31d.audit_decision.all_audits_passed !== true) fail("AG31D all audits must pass.");
if (ag31dEditor.audit_passed !== true) fail("AG31D editor restriction audit must pass.");
if (!ag31aTransition.transitions.some((t) => t.from === "admin_review" && t.to === "returned" && t.actor === "admin")) fail("Return path source missing.");
if (!ag31aTransition.transitions.some((t) => t.from === "returned" && t.to === "editor_submitted" && t.actor === "editor")) fail("Editor resubmission path source missing.");
if (!ag31aTransition.transitions.some((t) => t.from === "admin_review" && t.to === "archived" && t.actor === "admin")) fail("Archive path source missing.");
if (ag30bAssigned.editor_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Assigned-only source missing.");
if (ag30bAssigned.editor_rules.editor_cannot_publish !== true) fail("Editor no-publish source missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "return_archive_handler_plan_created_ready_for_ag32c") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.return_archive_handler_plan_created !== 1) fail("Preview plan missing.");
if (preview.return_to_editor_handler_plan_created !== 1) fail("Preview return handler missing.");
if (preview.archive_handler_plan_created !== 1) fail("Preview archive handler missing.");
if (preview.return_handler_runtime_created !== 0) fail("Preview return runtime must be 0.");
if (preview.archive_handler_runtime_created !== 0) fail("Preview archive runtime must be 0.");
if (preview.assignment_query_created !== 0) fail("Preview assignment query must be 0.");
if (preview.audit_runtime_created !== 0) fail("Preview audit runtime must be 0.");
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
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json",
  "data/content-intelligence/backend-architecture/ag31b-editor-assignment-queue-map.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "return_archive_handler_plan_created" ||
    k === "return_to_editor_handler_plan_created" ||
    k === "archive_handler_plan_created" ||
    k === "editor_resubmission_path_model_created" ||
    k === "admin_decision_handler_model_created" ||
    k === "return_archive_non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag32b"]) fail("Missing generate:ag32b script.");
if (!pkg.scripts?.["validate:ag32b"]) fail("Missing validate:ag32b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag32b")) fail("validate:project must include validate:ag32b.");

pass("AG32B Return/Archive Handler Plan is present.");
pass("Return-to-editor, archive, editor resubmission and Admin decision handler models are valid.");
pass("Admin final authority and Editor assigned-only/no-publish governance are preserved.");
pass("No return/archive runtime, assignment query, database, Auth/backend/Supabase activation, secrets, deployment or public mutation is enabled.");
pass("AG32C Publish Guard Rules boundary is ready.");
