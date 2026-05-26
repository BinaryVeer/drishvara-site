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
  console.error(`❌ AG33Z validation failed: ${msg}`);
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
  "data/content-intelligence/backend-architecture/ag33b-non-active-queue-mutation-scaffold.json",
  "data/content-intelligence/backend-architecture/ag33b-preview-only-queue-mutation-shape.json",
  "data/content-intelligence/backend-architecture/ag33b-state-change-preview-model.json",
  "data/content-intelligence/backend-architecture/ag33b-admin-editor-queue-impact-model.json",
  "data/content-intelligence/backend-architecture/ag33b-queue-mutation-scaffold-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag33c-non-active-audit-write-scaffold.json",
  "data/content-intelligence/backend-architecture/ag33c-preview-only-audit-write-shape.json",
  "data/content-intelligence/backend-architecture/ag33c-audit-event-field-preview-model.json",
  "data/content-intelligence/backend-architecture/ag33c-before-after-hash-preview-model.json",
  "data/content-intelligence/backend-architecture/ag33c-rollback-reference-preview-model.json",
  "data/content-intelligence/backend-architecture/ag33c-audit-write-scaffold-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag33d-non-active-handler-scaffold-audit.json",
  "data/content-intelligence/backend-architecture/ag33d-scaffold-only-audit-register.json",
  "data/content-intelligence/backend-architecture/ag33d-no-runtime-write-audit-register.json",
  "data/content-intelligence/backend-architecture/ag33d-admin-editor-governance-audit-register.json",
  "data/content-intelligence/backend-architecture/ag33d-handler-scaffold-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag33d-dynamic-publish-scaffold-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag33d-to-ag33z-dynamic-publish-scaffold-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json",
  "data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag32z-ag33-dynamic-publish-scaffold-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag31z-queue-integration-closure.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag33z-dynamic-publish-scaffold-closure.json",
  "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  "data/content-intelligence/backend-architecture/ag33z-ag33-source-chain-register.json",
  "data/content-intelligence/backend-architecture/ag33z-non-active-dynamic-publish-scaffold-closure-register.json",
  "data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag33z-ag34-backend-activation-readiness-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag33z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag33z-dynamic-publish-scaffold-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag33z-ag34-backend-activation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag33z-to-ag34a-backend-activation-readiness-checklist-boundary.json",
  "data/quality/ag33z-dynamic-publish-scaffold-closure.json",
  "data/quality/ag33z-dynamic-publish-scaffold-closure-preview.json",
  "docs/quality/AG33Z_DYNAMIC_PUBLISH_SCAFFOLD_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag33z-dynamic-publish-scaffold-closure.json");
const closure = readJson("data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json");
const sourceChain = readJson("data/content-intelligence/backend-architecture/ag33z-ag33-source-chain-register.json");
const closureRegister = readJson("data/content-intelligence/backend-architecture/ag33z-non-active-dynamic-publish-scaffold-closure-register.json");
const activationBlocker = readJson("data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json");
const ag34Handoff = readJson("data/content-intelligence/backend-architecture/ag33z-ag34-backend-activation-readiness-handoff-plan.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag33z-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag33z-dynamic-publish-scaffold-closure-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag33z-ag34-backend-activation-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag33z-to-ag34a-backend-activation-readiness-checklist-boundary.json");
const registry = readJson("data/quality/ag33z-dynamic-publish-scaffold-closure.json");
const preview = readJson("data/quality/ag33z-dynamic-publish-scaffold-closure-preview.json");

const ag33a = readJson("data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold.json");
const ag33aNonActivation = readJson("data/content-intelligence/backend-architecture/ag33a-non-active-publish-handler-scaffold-audit-register.json");
const ag33b = readJson("data/content-intelligence/backend-architecture/ag33b-non-active-queue-mutation-scaffold.json");
const ag33bNonActivation = readJson("data/content-intelligence/backend-architecture/ag33b-queue-mutation-scaffold-non-activation-audit-register.json");
const ag33c = readJson("data/content-intelligence/backend-architecture/ag33c-non-active-audit-write-scaffold.json");
const ag33cNonActivation = readJson("data/content-intelligence/backend-architecture/ag33c-audit-write-scaffold-non-activation-audit-register.json");
const ag33d = readJson("data/content-intelligence/backend-architecture/ag33d-non-active-handler-scaffold-audit.json");
const ag33dReadiness = readJson("data/content-intelligence/quality-registry/ag33d-dynamic-publish-scaffold-closure-readiness-record.json");
const ag33dScaffoldOnly = readJson("data/content-intelligence/backend-architecture/ag33d-scaffold-only-audit-register.json");
const ag33dNoRuntime = readJson("data/content-intelligence/backend-architecture/ag33d-no-runtime-write-audit-register.json");
const ag33dGovernance = readJson("data/content-intelligence/backend-architecture/ag33d-admin-editor-governance-audit-register.json");
const ag32z = readJson("data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json");
const ag32zBlocker = readJson("data/content-intelligence/backend-architecture/ag32z-activation-blocker-carry-forward.json");
const ag30bAssigned = readJson("data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "dynamic_publish_scaffold_closure_created_ready_for_ag34a") fail("Review status mismatch.");
if (closure.status !== "dynamic_publish_scaffold_closure_created_ready_for_ag34a") fail("Closure status mismatch.");
if (closure.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (closure.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (closure.closure_decision.ag33_chain_closed !== true) fail("AG33 chain must be closed.");
if (closure.closure_decision.non_active_dynamic_publish_scaffold_closed !== true) fail("Dynamic publish scaffold must be closed.");
if (closure.closure_decision.ag34a_ready_for_backend_activation_readiness_checklist !== true) fail("AG34A readiness missing.");

for (const flag of [
  "database_creation_approved",
  "database_write_approved",
  "migration_generation_approved",
  "sql_generation_approved",
  "queue_runtime_approved",
  "queue_mutation_runtime_approved",
  "audit_runtime_approved",
  "audit_write_runtime_approved",
  "hash_runtime_approved",
  "rollback_runtime_approved",
  "publish_handler_runtime_approved",
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
for (const stage of ["AG33A", "AG33B", "AG33C", "AG33D"]) {
  if (!sourceChain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage ${stage}.`);
}

if (closureRegister.status !== "non_active_dynamic_publish_scaffold_closed_ready_for_ag34") fail("Closure register status mismatch.");
for (const [key, value] of Object.entries(closureRegister.closure_points)) {
  if (value !== true) fail(`Closure point must be true: ${key}`);
}
if (closureRegister.planned_counts.ag33_closed_stages !== 4) fail("Closed stage count must be 4.");

for (const [key, value] of Object.entries(activationBlocker.blocked_activation_items)) {
  if (value !== false) fail(`${key} must remain false.`);
}

if (ag34Handoff.status !== "ag34_backend_activation_readiness_handoff_created") fail("AG34 handoff status mismatch.");
if (ag34Handoff.ag34_ready !== true) fail("AG34 handoff readiness missing.");
if (ag34Handoff.ag34_activation_allowed !== false) fail("AG34 activation must be false.");
if (!ag34Handoff.ag34_sequence.includes("AG34A — Backend Activation Readiness Checklist")) fail("AG34A sequence missing.");

if (!consumption.future_consumption?.AG34A) fail("AG34A consumption note missing.");
if (!consumption.future_consumption?.AG34B) fail("AG34B consumption note missing.");
if (!consumption.future_consumption?.AG34C) fail("AG34C consumption note missing.");
if (!consumption.future_consumption?.AG34D) fail("AG34D consumption note missing.");
if (!consumption.future_consumption?.AG34Z) fail("AG34Z consumption note missing.");
if (!consumption.future_consumption?.AG35) fail("AG35 consumption note missing.");

if (blocker.status !== "dynamic_publish_scaffold_closure_runtime_operations_blocked") fail("Blocker status mismatch.");
if (readiness.ready_for_ag34a !== true) fail("AG34A readiness missing.");
if (readiness.allowed_ag34a_mode !== "backend_activation_readiness_checklist_only") fail("AG34A mode mismatch.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.handler_runtime_allowed_now !== false) fail("Handler runtime must be false.");
if (readiness.queue_runtime_allowed_now !== false) fail("Queue runtime must be false.");
if (readiness.audit_runtime_allowed_now !== false) fail("Audit runtime must be false.");
if (readiness.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (readiness.database_write_allowed_now !== false) fail("Database write must be false.");
if (readiness.public_mutation_allowed_now !== false) fail("Public mutation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG34A") fail("Boundary must point to AG34A.");
if (boundary.status !== "ag34a_boundary_created_backend_activation_readiness_checklist_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.dynamic_publish_scaffold_closure_created !== true) fail("Review summary missing.");
if (review.summary.ag33_chain_closed !== true) fail("AG33 chain summary missing.");
if (review.summary.detailed_stages_closed !== 4) fail("Detailed stages closed must be 4.");
if (review.summary.ready_for_ag34a !== true) fail("AG34A readiness summary missing.");

for (const flag of [
  "database_creation_allowed_now",
  "database_write_allowed_now",
  "migration_generation_allowed_now",
  "sql_generation_allowed_now",
  "queue_runtime_allowed_now",
  "queue_mutation_runtime_allowed_now",
  "audit_runtime_allowed_now",
  "audit_write_runtime_allowed_now",
  "hash_runtime_allowed_now",
  "rollback_runtime_allowed_now",
  "publish_handler_runtime_allowed_now",
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
if (ag33cNonActivation.audit_passed !== true) fail("AG33C non-activation audit must pass.");
if (ag33d.status !== "non_active_handler_scaffold_audit_created_ready_for_ag33z") fail("AG33D source status mismatch.");
if (ag33d.audit_decision.all_audits_passed !== true) fail("AG33D all audits must pass.");
if (ag33dReadiness.ready_for_ag33z !== true) fail("AG33D readiness must allow AG33Z.");
if (ag33dScaffoldOnly.audit_passed !== true) fail("Scaffold-only audit must pass.");
if (ag33dNoRuntime.audit_passed !== true) fail("No-runtime-write audit must pass.");
if (ag33dGovernance.audit_passed !== true) fail("Governance audit must pass.");
if (ag32z.status !== "dynamic_handler_architecture_closure_created_ready_for_ag33") fail("AG32Z source status mismatch.");

for (const [key, value] of Object.entries(ag32zBlocker.blocked_activation_items)) {
  if (value !== false) fail(`AG32Z activation blocker must remain false: ${key}`);
}

if (ag30bAssigned.editor_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Assigned-only source missing.");
if (ag30bAssigned.editor_rules.editor_cannot_publish !== true) fail("Editor no-publish source missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "dynamic_publish_scaffold_closure_created_ready_for_ag34a") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.ag33_chain_closed !== 1) fail("Preview AG33 chain closed missing.");
if (preview.ready_for_ag34a !== 1) fail("Preview AG34A readiness missing.");
if (preview.publish_handler_runtime_created !== 0) fail("Preview publish runtime must be 0.");
if (preview.queue_runtime_created !== 0) fail("Preview queue runtime must be 0.");
if (preview.queue_mutation_runtime_created !== 0) fail("Preview queue mutation runtime must be 0.");
if (preview.audit_runtime_created !== 0) fail("Preview audit runtime must be 0.");
if (preview.audit_write_runtime_created !== 0) fail("Preview audit write runtime must be 0.");
if (preview.hash_runtime_created !== 0) fail("Preview hash runtime must be 0.");
if (preview.rollback_runtime_created !== 0) fail("Preview rollback runtime must be 0.");
if (preview.database_objects_created !== 0) fail("Preview database objects must be 0.");
if (preview.database_write_done !== 0) fail("Preview database write must be 0.");
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
  "data/content-intelligence/backend-architecture/ag33b-non-active-queue-mutation-scaffold.json",
  "data/content-intelligence/backend-architecture/ag33c-non-active-audit-write-scaffold.json",
  "data/content-intelligence/backend-architecture/ag33d-non-active-handler-scaffold-audit.json",
  "data/content-intelligence/backend-architecture/ag32z-dynamic-handler-architecture-closure.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!closure.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Closure did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "dynamic_publish_scaffold_closure_created" ||
    k === "ag33_chain_closed" ||
    k === "non_active_dynamic_publish_scaffold_closed" ||
    k === "ag34_backend_activation_readiness_allowed"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag33z"]) fail("Missing generate:ag33z script.");
if (!pkg.scripts?.["validate:ag33z"]) fail("Missing validate:ag33z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag33z")) fail("validate:project must include validate:ag33z.");

pass("AG33Z Dynamic Publish Scaffold Closure is present.");
pass("AG33A-AG33D non-active dynamic publish scaffold chain is closed.");
pass("AG34A Backend Activation Readiness Checklist boundary is ready.");
pass("Admin final clearance and Editor assigned-only/no-publish governance are preserved.");
pass("No backend/Auth/Supabase activation, database write, secrets, deployment or public mutation is enabled.");
