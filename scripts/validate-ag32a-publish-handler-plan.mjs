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
  console.error(`❌ AG32A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  "data/content-intelligence/backend-architecture/ag31z-ag32-action-handler-architecture-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag31z-activation-blocker-carry-forward.json",
  "data/content-intelligence/quality-registry/ag31z-ag32-action-handler-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag31z-to-ag32-action-handler-architecture-boundary.json",
  "data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json",
  "data/content-intelligence/backend-architecture/ag31d-illegal-transition-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-admin-approval-gate-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31d-publish-path-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31c-audit-log-field-schema.json",
  "data/content-intelligence/backend-architecture/ag31c-before-after-hash-model.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag32a-publish-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-precondition-register.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-public-filter-model.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-audit-rollback-requirement.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32a-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag32a-publish-handler-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag32a-return-archive-handler-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag32a-to-ag32b-return-archive-handler-plan-boundary.json",
  "data/quality/ag32a-publish-handler-plan.json",
  "data/quality/ag32a-publish-handler-plan-preview.json",
  "docs/quality/AG32A_PUBLISH_HANDLER_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag32a-publish-handler-plan.json");
const plan = readJson("data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json");
const preconditions = readJson("data/content-intelligence/backend-architecture/ag32a-publish-handler-precondition-register.json");
const publicFilter = readJson("data/content-intelligence/backend-architecture/ag32a-publish-public-filter-model.json");
const auditRollback = readJson("data/content-intelligence/backend-architecture/ag32a-publish-audit-rollback-requirement.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag32a-publish-handler-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag32a-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag32a-publish-handler-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag32a-return-archive-handler-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag32a-to-ag32b-return-archive-handler-plan-boundary.json");
const registry = readJson("data/quality/ag32a-publish-handler-plan.json");
const preview = readJson("data/quality/ag32a-publish-handler-plan-preview.json");

const ag31z = readJson("data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json");
const ag31zReadiness = readJson("data/content-intelligence/quality-registry/ag31z-ag32-action-handler-readiness-record.json");
const ag31zBlocker = readJson("data/content-intelligence/backend-architecture/ag31z-activation-blocker-carry-forward.json");
const ag31d = readJson("data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json");
const ag31dPublish = readJson("data/content-intelligence/backend-architecture/ag31d-publish-path-audit-register.json");
const ag31dIllegal = readJson("data/content-intelligence/backend-architecture/ag31d-illegal-transition-audit-register.json");
const ag31aTransition = readJson("data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "publish_handler_plan_created_ready_for_ag32b") fail("Review status mismatch.");
if (plan.status !== "publish_handler_plan_created_ready_for_ag32b") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (plan.plan_decision.non_active_publish_handler_plan_created !== true) fail("Plan decision missing.");
if (plan.plan_decision.publish_precondition_register_created !== true) fail("Precondition register decision missing.");
if (plan.plan_decision.publish_public_filter_model_created !== true) fail("Public filter decision missing.");
if (plan.plan_decision.publish_audit_rollback_requirement_created !== true) fail("Audit rollback decision missing.");
if (plan.plan_decision.proceed_to_ag32b_return_archive_handler_plan !== true) fail("AG32B readiness missing.");

for (const flag of [
  "publish_handler_runtime_approved_now",
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
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (plan.plan_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "publish_handler_runtime_allowed_in_ag32a",
  "public_filter_runtime_allowed_in_ag32a",
  "audit_runtime_allowed_in_ag32a",
  "hash_runtime_allowed_in_ag32a",
  "rollback_runtime_allowed_in_ag32a",
  "database_creation_allowed_in_ag32a",
  "migration_generation_allowed_in_ag32a",
  "sql_generation_allowed_in_ag32a",
  "rls_policy_application_allowed_in_ag32a",
  "auth_activation_allowed_in_ag32a",
  "backend_connection_allowed_in_ag32a",
  "supabase_connection_allowed_in_ag32a",
  "server_route_creation_allowed_in_ag32a",
  "api_route_creation_allowed_in_ag32a",
  "secret_creation_allowed_in_ag32a",
  "env_var_write_allowed_in_ag32a",
  "deployment_allowed_in_ag32a",
  "public_mutation_allowed_in_ag32a"
]) {
  if (plan[flag] !== false) fail(`${flag} must be false.`);
}

if (preconditions.status !== "publish_handler_precondition_register_created_no_runtime") fail("Precondition status mismatch.");
if (preconditions.required_input_state !== "publish_approved") fail("Publish input state must be publish_approved.");
if (preconditions.required_output_state !== "published") fail("Publish output state must be published.");
if (preconditions.required_actor !== "future_controlled_publish_handler") fail("Publish actor mismatch.");
for (const forbidden of ["draft_to_published", "editor_publish", "public_mutation_without_audit"]) {
  if (!preconditions.forbidden_paths.includes(forbidden)) fail(`Missing forbidden path: ${forbidden}`);
}
if (preconditions.execute_now !== false) fail("Preconditions must not execute now.");
if (preconditions.runtime_created !== false) fail("Publish runtime must not be created.");

if (publicFilter.status !== "publish_public_filter_model_created_no_runtime") fail("Public filter status mismatch.");
if (publicFilter.public_filter_runtime_created !== false) fail("Public filter runtime must be false.");
if (publicFilter.public_mutation_done !== false) fail("Public mutation must be false.");
for (const check of publicFilter.future_public_filter_checks) {
  if (check.execute_now !== false) fail(`${check.check_id} must not execute now.`);
}

if (auditRollback.status !== "publish_audit_rollback_requirement_created_no_runtime") fail("Audit rollback status mismatch.");
for (const field of ["actor_id", "actor_role", "before_state", "after_state", "before_hash", "after_hash", "created_at"]) {
  if (!auditRollback.required_audit_fields.includes(field)) fail(`Missing audit field: ${field}`);
}
if (auditRollback.hash_requirements.before_hash_required !== true) fail("Before hash required missing.");
if (auditRollback.hash_requirements.after_hash_required !== true) fail("After hash required missing.");
if (auditRollback.hash_requirements.rollback_reference_required !== true) fail("Rollback reference required missing.");
if (auditRollback.audit_runtime_created !== false) fail("Audit runtime must be false.");
if (auditRollback.hash_runtime_created !== false) fail("Hash runtime must be false.");
if (auditRollback.rollback_runtime_created !== false) fail("Rollback runtime must be false.");

if (nonActivation.status !== "publish_handler_non_activation_audit_passed") fail("Non-activation status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG32B) fail("AG32B consumption note missing.");
if (!consumption.future_consumption?.AG32C) fail("AG32C consumption note missing.");
if (!consumption.future_consumption?.AG32D) fail("AG32D consumption note missing.");
if (!consumption.future_consumption?.AG32Z) fail("AG32Z consumption note missing.");

if (blocker.status !== "publish_handler_plan_operations_blocked_pending_ag32b") fail("Blocker status mismatch.");
if (readiness.ready_for_ag32b !== true) fail("AG32B readiness missing.");
if (readiness.allowed_ag32b_mode !== "non_active_return_archive_handler_plan_only") fail("AG32B mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.publish_handler_runtime_allowed_now !== false) fail("Publish runtime must be false.");
if (readiness.public_mutation_allowed_now !== false) fail("Public mutation must be false.");

if (boundary.next_stage_id !== "AG32B") fail("Boundary must point to AG32B.");
if (boundary.status !== "ag32b_boundary_created_non_active_return_archive_handler_plan_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.publish_handler_plan_created !== true) fail("Review summary missing.");
if (review.summary.non_active_publish_handler_plan_only !== true) fail("Non-active plan summary missing.");
if (review.summary.ready_for_ag32b !== true) fail("AG32B readiness summary missing.");

for (const flag of [
  "publish_handler_runtime_allowed_now",
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
  "deployment_done",
  "public_mutation_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must be false.`);
}

if (ag31z.status !== "queue_integration_closure_created_ready_for_ag32") fail("AG31Z source status mismatch.");
if (ag31zReadiness.ready_for_ag32 !== true) fail("AG31Z readiness must allow AG32.");
for (const [key, value] of Object.entries(ag31zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG31Z activation blocker must remain false: ${key}`);
}
if (ag31d.audit_decision.all_audits_passed !== true) fail("AG31D all audits must pass.");
if (ag31dPublish.audit_passed !== true) fail("AG31D publish audit must pass.");
if (ag31dIllegal.audit_passed !== true) fail("AG31D illegal audit must pass.");
if (!ag31aTransition.transitions.some((t) => t.from === "admin_review" && t.to === "publish_approved" && t.actor === "admin")) fail("Admin approval path missing.");
if (!ag31aTransition.transitions.some((t) => t.from === "publish_approved" && t.to === "published" && t.actor === "future_controlled_publish_handler")) fail("Controlled publish path missing.");
if (!ag31aTransition.forbidden_transitions.some((t) => t.actor === "editor" && t.to === "published")) fail("Editor publish block missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "publish_handler_plan_created_ready_for_ag32b") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.publish_handler_plan_created !== 1) fail("Preview publish plan missing.");
if (preview.publish_handler_runtime_created !== 0) fail("Preview publish runtime must be 0.");
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
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  "data/content-intelligence/backend-architecture/ag31d-state-transition-audit.json",
  "data/content-intelligence/backend-architecture/ag31d-publish-path-audit-register.json",
  "data/content-intelligence/backend-architecture/ag31c-audit-log-field-schema.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "publish_handler_plan_created" ||
    k === "publish_precondition_register_created" ||
    k === "publish_public_filter_model_created" ||
    k === "publish_audit_rollback_requirement_created" ||
    k === "publish_handler_non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag32a"]) fail("Missing generate:ag32a script.");
if (!pkg.scripts?.["validate:ag32a"]) fail("Missing validate:ag32a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag32a")) fail("validate:project must include validate:ag32a.");

pass("AG32A Publish Handler Plan is present.");
pass("Publish preconditions, public filter, audit and rollback requirements are valid.");
pass("No publish runtime, public filter runtime, audit runtime, database, Auth/backend/Supabase activation, secrets, deployment or public mutation is enabled.");
pass("AG32B Return/Archive Handler Plan boundary is ready.");
