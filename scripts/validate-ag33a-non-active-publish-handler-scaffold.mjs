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
  console.error(`❌ AG33A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json",
  "data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag32z-ag33-dynamic-publish-scaffold-handoff-plan.json",
  "data/content-intelligence/quality-registry/ag32z-ag33-dynamic-publish-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag32z-to-ag33-dynamic-publish-scaffold-boundary.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-precondition-register.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-public-filter-model.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-audit-rollback-requirement.json",
  "data/content-intelligence/backend-architecture/ag32c-publish-guard-rules.json",
  "data/content-intelligence/backend-architecture/ag32c-admin-role-guard-model.json",
  "data/content-intelligence/backend-architecture/ag32c-approved-state-hash-guard-model.json",
  "data/content-intelligence/backend-architecture/ag32c-public-filter-audit-rollback-guard-model.json",
  "data/content-intelligence/backend-architecture/ag32c-forbidden-publish-path-guard-register.json",
  "data/content-intelligence/backend-architecture/ag32d-handler-architecture-audit.json",
  "data/content-intelligence/backend-architecture/ag32d-plan-only-handler-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32d-no-runtime-mutation-audit-register.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag33a-non-active-publish-handler-scaffold.json",
  "data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold.json",
  "data/content-intelligence/backend-architecture/ag33a-disabled-publish-control-model.json",
  "data/content-intelligence/backend-architecture/ag33a-preview-only-publish-handler-shape.json",
  "data/content-intelligence/backend-architecture/ag33a-scaffold-guard-binding-model.json",
  "data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold-audit-register.json",
  "data/content-intelligence/backend-architecture/ag33a-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag33a-non-active-publish-handler-scaffold-blocker-register.json",
  "data/content-intelligence/quality-registry/ag33a-queue-mutation-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag33a-to-ag33b-queue-mutation-scaffold-boundary.json",
  "data/quality/ag33a-non-active-publish-handler-scaffold.json",
  "data/quality/ag33a-non-active-publish-handler-scaffold-preview.json",
  "docs/quality/AG33A_NON_ACTIVE_PUBLISH_HANDLER_SCAFFOLD.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag33a-non-active-publish-handler-scaffold.json");
const scaffold = readJson("data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold.json");
const disabledControl = readJson("data/content-intelligence/backend-architecture/ag33a-disabled-publish-control-model.json");
const handlerShape = readJson("data/content-intelligence/backend-architecture/ag33a-preview-only-publish-handler-shape.json");
const guardBinding = readJson("data/content-intelligence/backend-architecture/ag33a-scaffold-guard-binding-model.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag33a-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag33a-non-active-publish-handler-scaffold-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag33a-queue-mutation-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag33a-to-ag33b-queue-mutation-scaffold-boundary.json");
const registry = readJson("data/quality/ag33a-non-active-publish-handler-scaffold.json");
const preview = readJson("data/quality/ag33a-non-active-publish-handler-scaffold-preview.json");

const ag32z = readJson("data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json");
const ag32zReadiness = readJson("data/content-intelligence/quality-registry/ag32z-ag33-dynamic-publish-scaffold-readiness-record.json");
const ag32zBlocker = readJson("data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json");
const ag32d = readJson("data/content-intelligence/backend-architecture/ag32d-handler-architecture-audit.json");
const ag32dPlanOnly = readJson("data/content-intelligence/backend-architecture/ag32d-plan-only-handler-audit-register.json");
const ag32dNoRuntime = readJson("data/content-intelligence/backend-architecture/ag32d-no-runtime-mutation-audit-register.json");
const ag32a = readJson("data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json");
const ag32c = readJson("data/content-intelligence/backend-architecture/ag32c-publish-guard-rules.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "non_active_publish_handler_scaffold_created_ready_for_ag33b") fail("Review status mismatch.");
if (scaffold.status !== "non_active_publish_handler_scaffold_created_ready_for_ag33b") fail("Scaffold status mismatch.");
if (scaffold.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (scaffold.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (scaffold.scaffold_decision.non_active_publish_handler_scaffold_created !== true) fail("Scaffold decision missing.");
if (scaffold.scaffold_decision.disabled_publish_control_model_created !== true) fail("Disabled control decision missing.");
if (scaffold.scaffold_decision.preview_only_publish_handler_shape_created !== true) fail("Handler shape decision missing.");
if (scaffold.scaffold_decision.scaffold_guard_binding_model_created !== true) fail("Guard binding decision missing.");
if (scaffold.scaffold_decision.proceed_to_ag33b_queue_mutation_scaffold !== true) fail("AG33B readiness missing.");

for (const flag of [
  "publish_handler_runtime_approved_now",
  "publish_guard_runtime_approved_now",
  "route_guard_runtime_approved_now",
  "public_filter_runtime_approved_now",
  "audit_runtime_approved_now",
  "hash_runtime_approved_now",
  "rollback_runtime_approved_now",
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
  "publish_handler_runtime_allowed_in_ag33a",
  "publish_guard_runtime_allowed_in_ag33a",
  "route_guard_runtime_allowed_in_ag33a",
  "public_filter_runtime_allowed_in_ag33a",
  "audit_runtime_allowed_in_ag33a",
  "hash_runtime_allowed_in_ag33a",
  "rollback_runtime_allowed_in_ag33a",
  "database_creation_allowed_in_ag33a",
  "migration_generation_allowed_in_ag33a",
  "sql_generation_allowed_in_ag33a",
  "rls_policy_application_allowed_in_ag33a",
  "auth_activation_allowed_in_ag33a",
  "backend_connection_allowed_in_ag33a",
  "supabase_connection_allowed_in_ag33a",
  "server_route_creation_allowed_in_ag33a",
  "api_route_creation_allowed_in_ag33a",
  "secret_creation_allowed_in_ag33a",
  "env_var_write_allowed_in_ag33a",
  "github_write_allowed_in_ag33a",
  "deployment_allowed_in_ag33a",
  "public_mutation_allowed_in_ag33a"
]) {
  if (scaffold[flag] !== false) fail(`${flag} must be false.`);
}

if (disabledControl.status !== "disabled_publish_control_model_created_no_runtime") fail("Disabled control status mismatch.");
if (disabledControl.current_mode !== "disabled_preview_only") fail("Publish control must be disabled preview-only.");
if (disabledControl.click_action_now !== "none") fail("Disabled control must have no click action.");
if (disabledControl.runtime_created !== false) fail("Disabled control runtime must be false.");
if (disabledControl.public_mutation_done !== false) fail("Disabled control public mutation must be false.");

if (handlerShape.status !== "preview_only_publish_handler_shape_created_no_runtime") fail("Handler shape status mismatch.");
if (handlerShape.future_input_state !== "publish_approved") fail("Handler input state must be publish_approved.");
if (handlerShape.future_output_state !== "published") fail("Handler output state must be published.");
if (handlerShape.execute_now !== false) fail("Handler shape must not execute.");
if (handlerShape.handler_runtime_created !== false) fail("Handler runtime must be false.");
if (handlerShape.server_route_created !== false) fail("Server route must be false.");
if (handlerShape.api_route_created !== false) fail("API route must be false.");
if (handlerShape.database_created !== false) fail("Database must be false.");
if (handlerShape.github_write_performed !== false) fail("GitHub write must be false.");
if (handlerShape.deployment_triggered !== false) fail("Deployment must be false.");
if (handlerShape.public_mutation_done !== false) fail("Public mutation must be false.");

if (guardBinding.status !== "scaffold_guard_binding_model_created_no_runtime") fail("Guard binding status mismatch.");
if (guardBinding.current_guard_execution !== false) fail("Guard execution must be false.");
if (guardBinding.route_guard_runtime_created !== false) fail("Route guard runtime must be false.");
if (guardBinding.publish_guard_runtime_created !== false) fail("Publish guard runtime must be false.");
if (guardBinding.public_filter_runtime_created !== false) fail("Public filter runtime must be false.");
if (guardBinding.audit_runtime_created !== false) fail("Audit runtime must be false.");
if (guardBinding.rollback_runtime_created !== false) fail("Rollback runtime must be false.");

if (nonActivation.status !== "non_active_publish_handler_scaffold_audit_passed") fail("Non-activation audit status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG33B) fail("AG33B consumption note missing.");
if (!consumption.future_consumption?.AG33C) fail("AG33C consumption note missing.");
if (!consumption.future_consumption?.AG33D) fail("AG33D consumption note missing.");
if (!consumption.future_consumption?.AG33Z) fail("AG33Z consumption note missing.");

if (blocker.status !== "non_active_publish_handler_scaffold_operations_blocked_pending_ag33b") fail("Blocker status mismatch.");
if (readiness.ready_for_ag33b !== true) fail("AG33B readiness missing.");
if (readiness.allowed_ag33b_mode !== "non_active_queue_mutation_scaffold_only") fail("AG33B mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.publish_handler_runtime_allowed_now !== false) fail("Publish handler runtime must be false.");
if (readiness.queue_runtime_allowed_now !== false) fail("Queue runtime must be false.");
if (readiness.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (readiness.public_mutation_allowed_now !== false) fail("Public mutation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG33B") fail("Boundary must point to AG33B.");
if (boundary.status !== "ag33b_boundary_created_non_active_queue_mutation_scaffold_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.non_active_publish_handler_scaffold_created !== true) fail("Review summary missing.");
if (review.summary.ready_for_ag33b !== true) fail("AG33B readiness summary missing.");

for (const flag of [
  "publish_handler_runtime_allowed_now",
  "publish_guard_runtime_allowed_now",
  "route_guard_runtime_allowed_now",
  "public_filter_runtime_allowed_now",
  "audit_runtime_allowed_now",
  "hash_runtime_allowed_now",
  "rollback_runtime_allowed_now",
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

if (ag32z.status !== "dynamic_handler_architecture_closure_created_ready_for_ag33") fail("AG32Z source status mismatch.");
if (ag32zReadiness.ready_for_ag33 !== true) fail("AG32Z readiness must allow AG33A.");
for (const [key, value] of Object.entries(ag32zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG32Z activation blocker must remain false: ${key}`);
}
if (ag32d.audit_decision.all_audits_passed !== true) fail("AG32D all audits must pass.");
if (ag32dPlanOnly.audit_passed !== true) fail("AG32D plan-only audit must pass.");
if (ag32dNoRuntime.audit_passed !== true) fail("AG32D no-runtime audit must pass.");
if (ag32a.status !== "publish_handler_plan_created_ready_for_ag32b") fail("AG32A source status mismatch.");
if (ag32c.status !== "publish_guard_rules_created_ready_for_ag32d") fail("AG32C source status mismatch.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "non_active_publish_handler_scaffold_created_ready_for_ag33b") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.non_active_publish_handler_scaffold_created !== 1) fail("Preview scaffold missing.");
if (preview.disabled_publish_control_model_created !== 1) fail("Preview disabled control missing.");
if (preview.preview_only_publish_handler_shape_created !== 1) fail("Preview handler shape missing.");
if (preview.publish_handler_runtime_created !== 0) fail("Preview publish runtime must be 0.");
if (preview.publish_guard_runtime_created !== 0) fail("Preview guard runtime must be 0.");
if (preview.route_guard_runtime_created !== 0) fail("Preview route guard runtime must be 0.");
if (preview.public_filter_runtime_created !== 0) fail("Preview public filter runtime must be 0.");
if (preview.audit_runtime_created !== 0) fail("Preview audit runtime must be 0.");
if (preview.hash_runtime_created !== 0) fail("Preview hash runtime must be 0.");
if (preview.rollback_runtime_created !== 0) fail("Preview rollback runtime must be 0.");
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
  "data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32c-publish-guard-rules.json",
  "data/content-intelligence/backend-architecture/ag32d-handler-architecture-audit.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!scaffold.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Scaffold did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "non_active_publish_handler_scaffold_created" ||
    k === "disabled_publish_control_model_created" ||
    k === "preview_only_publish_handler_shape_created" ||
    k === "scaffold_guard_binding_model_created" ||
    k === "scaffold_non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag33a"]) fail("Missing generate:ag33a script.");
if (!pkg.scripts?.["validate:ag33a"]) fail("Missing validate:ag33a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag33a")) fail("validate:project must include validate:ag33a.");

pass("AG33A Non-active Publish Handler Scaffold is present.");
pass("Disabled publish control, preview-only handler shape and guard binding model are valid.");
pass("No publish runtime, guard runtime, database, Auth/backend/Supabase activation, secrets, deployment or public mutation is enabled.");
pass("AG33B Queue Mutation Scaffold boundary is ready.");
