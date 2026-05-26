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
  console.error(`❌ AG33D validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold.json",
  "data/content-intelligence/backend-architecture/ag33a-disabled-publish-control-model.json",
  "data/content-intelligence/backend-architecture/ag33a-preview-only-publish-handler-shape.json",
  "data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold-audit-register.json",
  "data/content-intelligence/backend-architecture/ag33b-non-active-queue-mutation-scaffold.json",
  "data/content-intelligence/backend-architecture/ag33b-preview-only-queue-mutation-shape.json",
  "data/content-intelligence/backend-architecture/ag33b-state-change-preview-model.json",
  "data/content-intelligence/backend-architecture/ag33b-queue-mutation-scaffold-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag33c-non-active-audit-write-scaffold.json",
  "data/content-intelligence/backend-architecture/ag33c-preview-only-audit-write-shape.json",
  "data/content-intelligence/backend-architecture/ag33c-before-after-hash-preview-model.json",
  "data/content-intelligence/backend-architecture/ag33c-rollback-reference-preview-model.json",
  "data/content-intelligence/backend-architecture/ag33c-audit-write-scaffold-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag33c-handler-scaffold-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag33c-to-ag33d-handler-scaffold-audit-boundary.json",
  "data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json",
  "data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag32d-handler-architecture-audit.json",
  "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag33d-non-active-handler-scaffold-audit.json",
  "data/content-intelligence/backend-architecture/ag33d-non-active-handler-scaffold-audit.json",
  "data/content-intelligence/backend-architecture/ag33d-scaffold-only-audit-register.json",
  "data/content-intelligence/backend-architecture/ag33d-no-runtime-write-audit-register.json",
  "data/content-intelligence/backend-architecture/ag33d-admin-editor-governance-audit-register.json",
  "data/content-intelligence/backend-architecture/ag33d-handler-scaffold-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag33d-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag33d-handler-scaffold-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag33d-dynamic-publish-scaffold-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag33d-to-ag33z-dynamic-publish-scaffold-closure-boundary.json",
  "data/quality/ag33d-non-active-handler-scaffold-audit.json",
  "data/quality/ag33d-non-active-handler-scaffold-audit-preview.json",
  "docs/quality/AG33D_NON_ACTIVE_HANDLER_SCAFFOLD_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag33d-non-active-handler-scaffold-audit.json");
const audit = readJson("data/content-intelligence/backend-architecture/ag33d-non-active-handler-scaffold-audit.json");
const scaffoldOnlyAudit = readJson("data/content-intelligence/backend-architecture/ag33d-scaffold-only-audit-register.json");
const noRuntimeWriteAudit = readJson("data/content-intelligence/backend-architecture/ag33d-no-runtime-write-audit-register.json");
const governanceAudit = readJson("data/content-intelligence/backend-architecture/ag33d-admin-editor-governance-audit-register.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag33d-handler-scaffold-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag33d-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag33d-handler-scaffold-audit-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag33d-dynamic-publish-scaffold-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag33d-to-ag33z-dynamic-publish-scaffold-closure-boundary.json");
const registry = readJson("data/quality/ag33d-non-active-handler-scaffold-audit.json");
const preview = readJson("data/quality/ag33d-non-active-handler-scaffold-audit-preview.json");

const ag33a = readJson("data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold.json");
const ag33aNonActivation = readJson("data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold-audit-register.json");
const ag33b = readJson("data/content-intelligence/backend-architecture/ag33b-non-active-queue-mutation-scaffold.json");
const ag33bNonActivation = readJson("data/content-intelligence/backend-architecture/ag33b-queue-mutation-scaffold-non-activation-audit-register.json");
const ag33c = readJson("data/content-intelligence/backend-architecture/ag33c-non-active-audit-write-scaffold.json");
const ag33cReadiness = readJson("data/content-intelligence/quality-registry/ag33c-handler-scaffold-audit-readiness-record.json");
const ag33cNonActivation = readJson("data/content-intelligence/backend-architecture/ag33c-audit-write-scaffold-non-activation-audit-register.json");
const ag32z = readJson("data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json");
const ag32zBlocker = readJson("data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json");
const ag32d = readJson("data/content-intelligence/backend-architecture/ag32d-handler-architecture-audit.json");
const ag30bAssigned = readJson("data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "non_active_handler_scaffold_audit_created_ready_for_ag33z") fail("Review status mismatch.");
if (audit.status !== "non_active_handler_scaffold_audit_created_ready_for_ag33z") fail("Audit status mismatch.");
if (audit.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (audit.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (audit.audit_decision.non_active_handler_scaffold_audit_created !== true) fail("Audit decision missing.");
if (audit.audit_decision.scaffold_only_audit_passed !== true) fail("Scaffold-only audit must pass.");
if (audit.audit_decision.no_runtime_write_audit_passed !== true) fail("No-runtime-write audit must pass.");
if (audit.audit_decision.admin_editor_governance_audit_passed !== true) fail("Governance audit must pass.");
if (audit.audit_decision.non_activation_audit_passed !== true) fail("Non-activation audit must pass.");
if (audit.audit_decision.all_audits_passed !== true) fail("All audits must pass.");
if (audit.audit_decision.proceed_to_ag33z_dynamic_publish_scaffold_closure !== true) fail("AG33Z readiness missing.");

for (const flag of [
  "publish_handler_runtime_approved_now",
  "queue_runtime_approved_now",
  "queue_mutation_runtime_approved_now",
  "audit_runtime_approved_now",
  "audit_write_runtime_approved_now",
  "hash_runtime_approved_now",
  "rollback_runtime_approved_now",
  "database_creation_approved_now",
  "database_write_approved_now",
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
  if (audit.audit_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const item of [scaffoldOnlyAudit, noRuntimeWriteAudit, governanceAudit, nonActivation]) {
  if (item.audit_passed !== true) fail(`${item.title} must pass.`);
  for (const check of item.checks) {
    if (check.passed !== true) fail(`${item.title} check failed: ${check.check_id}`);
  }
}

if (!consumption.future_consumption?.AG33Z) fail("AG33Z consumption note missing.");
if (!consumption.future_consumption?.AG34) fail("AG34 consumption note missing.");
if (!consumption.future_consumption?.AG35_and_later) fail("AG35/later consumption note missing.");

if (blocker.status !== "handler_scaffold_audit_operations_blocked_pending_ag33z") fail("Blocker status mismatch.");
if (readiness.ready_for_ag33z !== true) fail("AG33Z readiness missing.");
if (readiness.allowed_ag33z_mode !== "non_active_dynamic_publish_scaffold_closure_only") fail("AG33Z mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.handler_runtime_allowed_now !== false) fail("Handler runtime must be false.");
if (readiness.queue_runtime_allowed_now !== false) fail("Queue runtime must be false.");
if (readiness.audit_runtime_allowed_now !== false) fail("Audit runtime must be false.");
if (readiness.database_write_allowed_now !== false) fail("Database write must be false.");
if (readiness.public_mutation_allowed_now !== false) fail("Public mutation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG33Z") fail("Boundary must point to AG33Z.");
if (boundary.status !== "ag33z_boundary_created_non_active_dynamic_publish_scaffold_closure_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.non_active_handler_scaffold_audit_created !== true) fail("Review summary missing.");
if (review.summary.all_audits_passed !== true) fail("All audits summary must pass.");
if (review.summary.ready_for_ag33z !== true) fail("AG33Z readiness summary missing.");

for (const flag of [
  "publish_handler_runtime_allowed_now",
  "queue_runtime_allowed_now",
  "queue_mutation_runtime_allowed_now",
  "audit_runtime_allowed_now",
  "audit_write_runtime_allowed_now",
  "hash_runtime_allowed_now",
  "rollback_runtime_allowed_now",
  "database_creation_allowed_now",
  "database_write_allowed_now",
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
if (ag33aNonActivation.audit_passed !== true) fail("AG33A non-activation audit must pass.");
if (ag33b.status !== "non_active_queue_mutation_scaffold_created_ready_for_ag33c") fail("AG33B source status mismatch.");
if (ag33bNonActivation.audit_passed !== true) fail("AG33B non-activation audit must pass.");
if (ag33c.status !== "non_active_audit_write_scaffold_created_ready_for_ag33d") fail("AG33C source status mismatch.");
if (ag33cReadiness.ready_for_ag33d !== true) fail("AG33C readiness must allow AG33D.");
if (ag33cNonActivation.audit_passed !== true) fail("AG33C non-activation audit must pass.");
if (ag32z.status !== "dynamic_handler_architecture_closure_created_ready_for_ag33") fail("AG32Z source status mismatch.");
for (const [key, value] of Object.entries(ag32zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG32Z activation blocker must remain false: ${key}`);
}
if (ag32d.audit_decision.all_audits_passed !== true) fail("AG32D all audits must pass.");
if (ag30bAssigned.editor_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Assigned-only source missing.");
if (ag30bAssigned.editor_rules.editor_cannot_publish !== true) fail("Editor no-publish source missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "non_active_handler_scaffold_audit_created_ready_for_ag33z") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.non_active_handler_scaffold_audit_created !== 1) fail("Preview audit missing.");
if (preview.scaffold_only_audit_passed !== 1) fail("Preview scaffold-only audit must pass.");
if (preview.no_runtime_write_audit_passed !== 1) fail("Preview no-runtime-write audit must pass.");
if (preview.admin_editor_governance_audit_passed !== 1) fail("Preview governance audit must pass.");
if (preview.publish_handler_runtime_created !== 0) fail("Preview publish runtime must be 0.");
if (preview.queue_runtime_created !== 0) fail("Preview queue runtime must be 0.");
if (preview.queue_mutation_runtime_created !== 0) fail("Preview queue mutation runtime must be 0.");
if (preview.audit_runtime_created !== 0) fail("Preview audit runtime must be 0.");
if (preview.audit_write_runtime_created !== 0) fail("Preview audit write runtime must be 0.");
if (preview.database_objects_created !== 0) fail("Preview database objects must be 0.");
if (preview.database_write_done !== 0) fail("Preview database write must be 0.");
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
  "data/content-intelligence/backend-architecture/ag33b-non-active-queue-mutation-scaffold.json",
  "data/content-intelligence/backend-architecture/ag33c-non-active-audit-write-scaffold.json",
  "data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json",
  "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!audit.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Audit did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "non_active_handler_scaffold_audit_created" ||
    k === "scaffold_only_audit_created" ||
    k === "no_runtime_write_audit_created" ||
    k === "admin_editor_governance_audit_created" ||
    k === "handler_scaffold_non_activation_audit_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag33d"]) fail("Missing generate:ag33d script.");
if (!pkg.scripts?.["validate:ag33d"]) fail("Missing validate:ag33d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag33d")) fail("validate:project must include validate:ag33d.");

pass("AG33D Non-active Handler Scaffold Audit is present.");
pass("Scaffold-only, no-runtime-write and Admin/Editor governance audits are valid.");
pass("No handler runtime, queue runtime, audit runtime, database write, Auth/backend/Supabase activation, secrets, deployment or public mutation is enabled.");
pass("AG33Z Dynamic Publish Scaffold Closure boundary is ready.");
