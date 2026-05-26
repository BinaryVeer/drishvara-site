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
  console.error(`❌ AG32Z validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-precondition-register.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-public-filter-model.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-audit-rollback-requirement.json",
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32b-return-archive-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-return-to-editor-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-archive-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-editor-resubmission-path-model.json",
  "data/content-intelligence/backend-architecture/ag32b-admin-decision-handler-model.json",
  "data/content-intelligence/backend-architecture/ag32b-return-archive-handler-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32c-publish-guard-rules.json",
  "data/content-intelligence/backend-architecture/ag32c-admin-role-guard-model.json",
  "data/content-intelligence/backend-architecture/ag32c-approved-state-hash-guard-model.json",
  "data/content-intelligence/backend-architecture/ag32c-public-filter-audit-rollback-guard-model.json",
  "data/content-intelligence/backend-architecture/ag32c-forbidden-publish-path-guard-register.json",
  "data/content-intelligence/backend-architecture/ag32c-guard-rules-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32d-handler-architecture-audit.json",
  "data/content-intelligence/backend-architecture/ag32d-plan-only-handler-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32d-no-runtime-mutation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32d-guard-compliance-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32d-admin-editor-governance-audit-register.json",
  "data/content-intelligence/backend-architecture/ag32d-handler-architecture-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag32d-dynamic-handler-architecture-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag32d-to-ag32z-dynamic-handler-architecture-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  "data/content-intelligence/backend-architecture/ag31z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag32z-dynamic-handler-architecture-closure.json",
  "data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json",
  "data/content-intelligence/backend-architecture/ag32z-ag32-source-chain-register.json",
  "data/content-intelligence/backend-architecture/ag32z-non-active-dynamic-handler-closure-register.json",
  "data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag32z-ag33-dynamic-publish-scaffold-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag32z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag32z-dynamic-handler-architecture-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag32z-ag33-dynamic-publish-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag32z-to-ag33-dynamic-publish-scaffold-boundary.json",
  "data/quality/ag32z-dynamic-handler-architecture-closure.json",
  "data/quality/ag32z-dynamic-handler-architecture-closure-preview.json",
  "docs/quality/AG32Z_DYNAMIC_HANDLER_ARCHITECTURE_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag32z-dynamic-handler-architecture-closure.json");
const closure = readJson("data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json");
const sourceChain = readJson("data/content-intelligence/backend-architecture/ag32z-ag32-source-chain-register.json");
const closureRegister = readJson("data/content-intelligence/backend-architecture/ag32z-non-active-dynamic-handler-closure-register.json");
const activationBlocker = readJson("data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json");
const ag33Handoff = readJson("data/content-intelligence/backend-architecture/ag32z-ag33-dynamic-publish-scaffold-handoff-plan.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag32z-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag32z-dynamic-handler-architecture-closure-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag32z-ag33-dynamic-publish-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag32z-to-ag33-dynamic-publish-scaffold-boundary.json");
const registry = readJson("data/quality/ag32z-dynamic-handler-architecture-closure.json");
const preview = readJson("data/quality/ag32z-dynamic-handler-architecture-closure-preview.json");

const ag32a = readJson("data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json");
const ag32b = readJson("data/content-intelligence/backend-architecture/ag32b-return-archive-handler-plan.json");
const ag32c = readJson("data/content-intelligence/backend-architecture/ag32c-publish-guard-rules.json");
const ag32d = readJson("data/content-intelligence/backend-architecture/ag32d-handler-architecture-audit.json");
const ag32dReadiness = readJson("data/content-intelligence/quality-registry/ag32d-dynamic-handler-architecture-closure-readiness-record.json");
const ag32dPlanOnly = readJson("data/content-intelligence/backend-architecture/ag32d-plan-only-handler-audit-register.json");
const ag32dNoRuntime = readJson("data/content-intelligence/backend-architecture/ag32d-no-runtime-mutation-audit-register.json");
const ag32dGuard = readJson("data/content-intelligence/backend-architecture/ag32d-guard-compliance-audit-register.json");
const ag32dGovernance = readJson("data/content-intelligence/backend-architecture/ag32d-admin-editor-governance-audit-register.json");
const ag31z = readJson("data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json");
const ag31zBlocker = readJson("data/content-intelligence/backend-architecture/ag31z-activation-blocker-carry-forward.json");
const ag30bAssigned = readJson("data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "dynamic_handler_architecture_closure_created_ready_for_ag33") fail("Review status mismatch.");
if (closure.status !== "dynamic_handler_architecture_closure_created_ready_for_ag33") fail("Closure status mismatch.");
if (closure.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (closure.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (closure.closure_decision.ag32_chain_closed !== true) fail("AG32 chain must be closed.");
if (closure.closure_decision.non_active_dynamic_handler_architecture_closed !== true) fail("Dynamic handler architecture must be closed.");
if (closure.closure_decision.ag33_ready_for_dynamic_publish_scaffold !== true) fail("AG33 readiness missing.");

for (const flag of [
  "database_creation_approved",
  "migration_generation_approved",
  "sql_generation_approved",
  "publish_handler_runtime_approved",
  "return_handler_runtime_approved",
  "archive_handler_runtime_approved",
  "publish_guard_runtime_approved",
  "route_guard_runtime_approved",
  "public_filter_runtime_approved",
  "audit_runtime_approved",
  "hash_runtime_approved",
  "rollback_runtime_approved",
  "rls_policy_application_approved",
  "auth_activation_approved",
  "backend_connection_approved",
  "supabase_connection_approved",
  "server_route_creation_approved",
  "api_route_creation_approved",
  "secret_creation_approved",
  "env_var_write_approved",
  "github_write_approved",
  "deployment_approved",
  "public_mutation_approved"
]) {
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (sourceChain.chain_length !== 4) fail("Source chain length must be 4.");
for (const stage of ["AG32A", "AG32B", "AG32C", "AG32D"]) {
  if (!sourceChain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage ${stage}.`);
}

if (closureRegister.status !== "non_active_dynamic_handler_architecture_closed_ready_for_ag33") fail("Closure register status mismatch.");
for (const [key, value] of Object.entries(closureRegister.closure_points)) {
  if (value !== true) fail(`Closure point must be true: ${key}`);
}
if (closureRegister.planned_counts.ag32_closed_stages !== 4) fail("Closed stage count must be 4.");

for (const [key, value] of Object.entries(activationBlocker.blocked_activation_items)) {
  if (value !== false) fail(`${key} must remain false.`);
}
if (activationBlocker.future_unlock_requirements.length < 8) fail("Future unlock requirements incomplete.");

if (ag33Handoff.status !== "ag33_dynamic_publish_scaffold_handoff_created") fail("AG33 handoff status mismatch.");
if (ag33Handoff.ag33_ready !== true) fail("AG33 handoff readiness missing.");
if (ag33Handoff.ag33_activation_allowed !== false) fail("AG33 activation must be false.");
if (!ag33Handoff.ag33_allowed_scope.includes("Create non-active dynamic publish scaffold.")) fail("AG33 scaffold scope missing.");
if (!ag33Handoff.ag33_blocked_scope.includes("No public mutation.")) fail("AG33 public mutation blocker missing.");

if (!consumption.future_consumption?.AG33) fail("AG33 consumption note missing.");
if (!consumption.future_consumption?.AG34) fail("AG34 consumption note missing.");
if (!consumption.future_consumption?.AG35_and_later) fail("AG35/later consumption note missing.");

if (blocker.status !== "dynamic_handler_architecture_closure_runtime_operations_blocked") fail("Blocker status mismatch.");
if (readiness.ready_for_ag33 !== true) fail("AG33 readiness missing.");
if (readiness.allowed_ag33_mode !== "non_active_dynamic_publish_scaffold_only") fail("AG33 mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.handler_runtime_allowed_now !== false) fail("Handler runtime must be false.");
if (readiness.guard_runtime_allowed_now !== false) fail("Guard runtime must be false.");
if (readiness.public_mutation_allowed_now !== false) fail("Public mutation must be false.");
if (readiness.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG33") fail("Boundary must point to AG33.");
if (boundary.status !== "ag33_boundary_created_non_active_dynamic_publish_scaffold_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.dynamic_handler_architecture_closure_created !== true) fail("Review summary missing.");
if (review.summary.ag32_chain_closed !== true) fail("AG32 chain summary missing.");
if (review.summary.detailed_stages_closed !== 4) fail("Detailed stages closed must be 4.");
if (review.summary.ready_for_ag33 !== true) fail("AG33 readiness summary missing.");

for (const flag of [
  "database_creation_allowed_now",
  "migration_generation_allowed_now",
  "sql_generation_allowed_now",
  "publish_handler_runtime_allowed_now",
  "return_handler_runtime_allowed_now",
  "archive_handler_runtime_allowed_now",
  "publish_guard_runtime_allowed_now",
  "route_guard_runtime_allowed_now",
  "public_filter_runtime_allowed_now",
  "audit_runtime_allowed_now",
  "hash_runtime_allowed_now",
  "rollback_runtime_allowed_now",
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

if (ag32a.status !== "publish_handler_plan_created_ready_for_ag32b") fail("AG32A source status mismatch.");
if (ag32b.status !== "return_archive_handler_plan_created_ready_for_ag32c") fail("AG32B source status mismatch.");
if (ag32c.status !== "publish_guard_rules_created_ready_for_ag32d") fail("AG32C source status mismatch.");
if (ag32d.status !== "handler_architecture_audit_created_ready_for_ag32z") fail("AG32D source status mismatch.");
if (ag32d.audit_decision.all_audits_passed !== true) fail("AG32D all audits must pass.");
if (ag32dReadiness.ready_for_ag32z !== true) fail("AG32D readiness must allow AG32Z.");
if (ag32dPlanOnly.audit_passed !== true) fail("Plan-only audit must pass.");
if (ag32dNoRuntime.audit_passed !== true) fail("No-runtime mutation audit must pass.");
if (ag32dGuard.audit_passed !== true) fail("Guard compliance audit must pass.");
if (ag32dGovernance.audit_passed !== true) fail("Governance audit must pass.");
if (ag31z.status !== "queue_integration_closure_created_ready_for_ag32") fail("AG31Z source status mismatch.");

for (const [key, value] of Object.entries(ag31zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG31Z activation blocker must remain false: ${key}`);
}

if (ag30bAssigned.editor_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Assigned-only source missing.");
if (ag30bAssigned.editor_rules.editor_cannot_publish !== true) fail("Editor no-publish source missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "dynamic_handler_architecture_closure_created_ready_for_ag33") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.ag32_chain_closed !== 1) fail("Preview AG32 chain closed missing.");
if (preview.ready_for_ag33 !== 1) fail("Preview AG33 readiness missing.");
if (preview.publish_handler_runtime_created !== 0) fail("Preview publish runtime must be 0.");
if (preview.return_handler_runtime_created !== 0) fail("Preview return runtime must be 0.");
if (preview.archive_handler_runtime_created !== 0) fail("Preview archive runtime must be 0.");
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
  "data/content-intelligence/backend-architecture/ag32a-publish-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32b-return-archive-handler-plan.json",
  "data/content-intelligence/backend-architecture/ag32c-publish-guard-rules.json",
  "data/content-intelligence/backend-architecture/ag32d-handler-architecture-audit.json",
  "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!closure.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Closure did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "dynamic_handler_architecture_closure_created" ||
    k === "ag32_chain_closed" ||
    k === "non_active_dynamic_handler_architecture_closed" ||
    k === "ag33_dynamic_publish_scaffold_allowed"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag32z"]) fail("Missing generate:ag32z script.");
if (!pkg.scripts?.["validate:ag32z"]) fail("Missing validate:ag32z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag32z")) fail("validate:project must include validate:ag32z.");

pass("AG32Z Dynamic Handler Architecture Closure is present.");
pass("AG32A-AG32D non-active dynamic handler architecture chain is closed.");
pass("AG33 non-active dynamic publish scaffold boundary is ready.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No handlers, guards, database, Auth/backend/Supabase activation, secrets, deployment or public mutation is enabled.");
