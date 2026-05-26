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
  console.error(`❌ AG28A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag27z-backend-decision-closure.json",
  "data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json",
  "data/content-intelligence/backend-decision/ag27z-controlled-activation-handoff-plan.json",
  "data/content-intelligence/backend-decision/ag27z-ag28-boundary-control-register.json",
  "data/content-intelligence/quality-registry/ag27z-backend-auth-architecture-blueprint-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27z-to-ag28-backend-auth-architecture-blueprint-boundary.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-auth-architecture-plan.json",
  "data/content-intelligence/backend-decision/ag27d-supabase-auth-security-rls-plan.json",
  "data/content-intelligence/backend-decision/ag27d-controlled-activation-stage-placement-plan.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json",

  "data/content-intelligence/quality-reviews/ag28a-backend-architecture-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28a-backend-architecture-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28a-controlled-supabase-sandbox-target.json",
  "data/content-intelligence/backend-architecture/ag28a-admin-editor-backend-module-map.json",
  "data/content-intelligence/backend-architecture/ag28a-backend-data-flow-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28a-runtime-boundary-and-non-activation-guard.json",
  "data/content-intelligence/backend-architecture/ag28a-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag28a-backend-architecture-blueprint-blocker-register.json",
  "data/content-intelligence/quality-registry/ag28a-database-table-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag28a-to-ag28b-database-table-plan-boundary.json",
  "data/quality/ag28a-backend-architecture-blueprint.json",
  "data/quality/ag28a-backend-architecture-blueprint-preview.json",
  "docs/quality/AG28A_BACKEND_ARCHITECTURE_BLUEPRINT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag28a-backend-architecture-blueprint.json");
const blueprint = readJson("data/content-intelligence/backend-architecture/ag28a-backend-architecture-blueprint.json");
const sandbox = readJson("data/content-intelligence/backend-architecture/ag28a-controlled-supabase-sandbox-target.json");
const moduleMap = readJson("data/content-intelligence/backend-architecture/ag28a-admin-editor-backend-module-map.json");
const dataFlow = readJson("data/content-intelligence/backend-architecture/ag28a-backend-data-flow-blueprint.json");
const guard = readJson("data/content-intelligence/backend-architecture/ag28a-runtime-boundary-and-non-activation-guard.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag28a-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag28a-backend-architecture-blueprint-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag28a-database-table-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag28a-to-ag28b-database-table-plan-boundary.json");
const registry = readJson("data/quality/ag28a-backend-architecture-blueprint.json");
const preview = readJson("data/quality/ag28a-backend-architecture-blueprint-preview.json");

const ag27z = readJson("data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json");
const ag27zBoundary = readJson("data/content-intelligence/mutation-plans/ag27z-to-ag28-backend-auth-architecture-blueprint-boundary.json");
const ag27c = readJson("data/content-intelligence/backend-decision/ag27c-supabase-auth-architecture-plan.json");
const ag27d = readJson("data/content-intelligence/backend-decision/ag27d-supabase-auth-security-rls-plan.json");
const routing = readJson("data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json");
const publishControl = readJson("data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json");
const pkg = readJson("package.json");

if (review.status !== "backend_architecture_blueprint_created_ready_for_ag28b") fail("Review status mismatch.");
if (blueprint.status !== "backend_architecture_blueprint_created_ready_for_ag28b") fail("Blueprint status mismatch.");
if (blueprint.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (blueprint.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (blueprint.architecture_scope.stage_type !== "backend_auth_architecture_blueprint_only") fail("Stage type must be blueprint-only.");
if (blueprint.architecture_scope.moving_toward_controlled_sandbox_activation !== true) fail("Sandbox direction must be recorded.");
if (blueprint.architecture_scope.activation_now !== false) fail("Activation must be false.");
if (blueprint.architecture_scope.next_stage !== "AG28B") fail("Next stage must be AG28B.");

for (const flag of [
  "backend_activation_allowed_in_ag28a",
  "auth_activation_allowed_in_ag28a",
  "supabase_project_creation_allowed_in_ag28a",
  "database_creation_allowed_in_ag28a",
  "table_creation_allowed_in_ag28a",
  "migration_creation_allowed_in_ag28a",
  "rls_policy_creation_allowed_in_ag28a",
  "secret_creation_allowed_in_ag28a",
  "runtime_queue_creation_allowed_in_ag28a",
  "dynamic_publishing_allowed_in_ag28a",
  "deployment_allowed_in_ag28a",
  "publication_allowed_in_ag28a"
]) {
  if (blueprint[flag] !== false) fail(`${flag} must be false.`);
}
if (blueprint.supabase_auth_backend_deferred !== true) fail("Backend deferral must remain true.");

if (!Array.isArray(blueprint.architecture_layers) || blueprint.architecture_layers.length < 8) fail("At least 8 architecture layers are required.");
for (const layerId of [
  "identity_access_layer",
  "content_state_layer",
  "admin_editor_workflow_layer",
  "reference_asset_object_layer",
  "publish_audit_layer",
  "subscriber_personalization_layer",
  "security_rls_layer",
  "secret_environment_layer"
]) {
  if (!blueprint.architecture_layers.some((layer) => layer.layer_id === layerId)) fail(`Missing architecture layer: ${layerId}`);
}

if (sandbox.status !== "controlled_supabase_sandbox_target_created_no_activation") fail("Sandbox target status mismatch.");
if (sandbox.sandbox_direction.target_mode !== "future_controlled_sandbox") fail("Sandbox target mode mismatch.");
if (sandbox.sandbox_direction.activation_now !== false) fail("Sandbox activation must be false.");
if (sandbox.sandbox_direction.public_live_dynamic_publish_now !== false) fail("Public dynamic publish must be false.");
if (!String(sandbox.sandbox_direction.activation_entry_not_before).includes("AG35")) fail("Activation entry must not be before AG35.");
if (!String(sandbox.sandbox_direction.readiness_gate_before_activation).includes("AG34")) fail("Readiness gate must include AG34.");
if (!String(sandbox.sandbox_direction.first_live_dynamic_publish_not_before).includes("AG38")) fail("First live dynamic publish must not be before AG38.");

if (moduleMap.status !== "admin_editor_backend_module_map_created_no_runtime") fail("Module map status mismatch.");
if (moduleMap.modules.length < 6) fail("At least 6 backend modules are required.");
if (moduleMap.admin_final_publish_authority !== true) fail("Admin final publish authority missing.");
if (moduleMap.editor_publish_authority !== false) fail("Editor publish authority must be false.");
if (moduleMap.system_publish_without_admin !== false) fail("System publish without Admin must be false.");
if (moduleMap.runtime_enabled_now !== false) fail("Runtime must be disabled.");

if (dataFlow.status !== "backend_data_flow_blueprint_created_no_runtime_write") fail("Data flow status mismatch.");
if (dataFlow.planned_flows.length < 6) fail("At least 6 data flows are required.");
if (dataFlow.runtime_write_enabled_now !== false) fail("Runtime write must be disabled.");
for (const flowId of [
  "system_generated_candidate_to_admin",
  "editor_new_candidate_to_admin",
  "admin_assignment_to_editor",
  "editor_return_to_admin",
  "admin_publish_decision",
  "public_read_published"
]) {
  if (!dataFlow.planned_flows.some((flow) => flow.flow_id === flowId)) fail(`Missing data flow: ${flowId}`);
}

if (guard.status !== "runtime_boundary_non_activation_guard_created") fail("Runtime boundary guard status mismatch.");
for (const [k, v] of Object.entries(guard.guard_rules)) {
  if (v !== true) fail(`Guard rule must be true: ${k}`);
}
if (!String(guard.next_real_activation_gate).includes("AG34")) fail("Next real activation gate must include AG34.");
if (!String(guard.next_real_activation_gate).includes("AG35")) fail("Next real activation gate must include AG35.");

if (!consumption.future_consumption?.AG28B) fail("AG28B consumption note missing.");
if (!consumption.future_consumption?.AG28C) fail("AG28C consumption note missing.");
if (!consumption.future_consumption?.AG28D) fail("AG28D consumption note missing.");
if (!consumption.future_consumption?.AG28Z) fail("AG28Z consumption note missing.");
if (blocker.status !== "backend_architecture_blueprint_runtime_operations_blocked_pending_ag28b") fail("Blocker status mismatch.");
if (readiness.ready_for_ag28b !== true) fail("AG28B readiness missing.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.supabase_activation_allowed_now !== false) fail("Supabase activation must be false.");
if (readiness.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (boundary.next_stage_id !== "AG28B") fail("Boundary must point to AG28B.");
if (boundary.activation_allowed_in_ag28b !== false) fail("AG28B activation must be false.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");

if (review.summary.backend_architecture_blueprint_created !== true) fail("Review summary missing.");
if (review.summary.moving_toward_controlled_sandbox_activation !== true) fail("Sandbox movement summary missing.");
if (review.summary.blueprint_only !== true) fail("Blueprint-only summary missing.");
if (review.summary.ready_for_ag28b !== true) fail("AG28B readiness summary missing.");
for (const flag of [
  "backend_activation_allowed_now",
  "auth_activation_allowed_now",
  "supabase_project_created",
  "database_created",
  "table_created",
  "migration_created",
  "rls_policy_created",
  "rls_policy_applied",
  "secret_created",
  "runtime_queue_created",
  "runtime_write_enabled",
  "dynamic_publishing_enabled",
  "deployment_done",
  "publishing_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must remain false.`);
}

if (ag27z.closure_decision.ready_for_ag28_backend_auth_architecture_blueprint !== true) fail("AG27Z must allow AG28.");
if (ag27zBoundary.activation_allowed_in_ag28 !== false) fail("AG28 must be non-activation.");
if (ag27c.status !== "supabase_auth_architecture_plan_created_ready_for_ag27d") fail("AG27C source status mismatch.");
if (ag27d.status !== "supabase_auth_security_rls_plan_created_ready_for_ag27z") fail("AG27D source status mismatch.");
if (routing.role_routing_rules.admin_final_publish_authority !== true) fail("Routing must preserve Admin publish authority.");
if (routing.role_routing_rules.editor_publish_authority !== false) fail("Routing must block Editor publishing.");
if (publishControl.final_publish_authority !== "admin_only") fail("Publish control must be admin_only.");

if (registry.status !== "backend_architecture_blueprint_created_ready_for_ag28b") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.blueprint_only !== true) fail("Preview must be blueprint-only.");
if (preview.moving_toward_controlled_sandbox_activation !== true) fail("Preview sandbox direction missing.");
if (preview.ready_for_ag28b !== true) fail("Preview must be ready for AG28B.");
if (preview.backend_activation_allowed_now !== 0) fail("Preview must record 0 backend activation.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.supabase_enabled !== 0) fail("Preview must record 0 Supabase.");
if (preview.database_objects !== 0) fail("Preview must record 0 database objects.");
if (preview.table_objects !== 0) fail("Preview must record 0 table objects.");
if (preview.migration_objects !== 0) fail("Preview must record 0 migration objects.");
if (preview.rls_policy_objects !== 0) fail("Preview must record 0 RLS policy objects.");
if (preview.secret_objects !== 0) fail("Preview must record 0 secret objects.");
if (preview.runtime_queues !== 0) fail("Preview must record 0 runtime queues.");
if (preview.deployments !== 0) fail("Preview must record 0 deployments.");
if (preview.published_items !== 0) fail("Preview must record 0 published items.");

for (const expectedInput of [
  "data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json",
  "data/content-intelligence/backend-decision/ag27z-controlled-activation-handoff-plan.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-auth-architecture-plan.json",
  "data/content-intelligence/backend-decision/ag27d-supabase-auth-security-rls-plan.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json"
]) {
  if (!blueprint.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Blueprint did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (["backend_architecture_blueprint_created", "moving_toward_controlled_sandbox_activation"].includes(k)) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag28a"]) fail("Missing generate:ag28a script.");
if (!pkg.scripts?.["validate:ag28a"]) fail("Missing validate:ag28a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag28a")) fail("validate:project must include validate:ag28a.");

pass("AG28A Backend Architecture Blueprint is present.");
pass("Controlled Supabase sandbox direction is recorded for later stage.");
pass("Architecture layers, module map and data-flow blueprint are valid.");
pass("Runtime boundary and non-activation guard is valid.");
pass("AG28B Database Table Plan boundary is ready.");
pass("No Supabase/Auth/backend/database/table/migration/RLS/secret/runtime queue/deployment/publishing is enabled.");
