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
  console.error(`❌ AG28B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag28a-backend-architecture-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28a-backend-architecture-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28a-admin-editor-backend-module-map.json",
  "data/content-intelligence/backend-architecture/ag28a-backend-data-flow-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28a-runtime-boundary-and-non-activation-guard.json",
  "data/content-intelligence/quality-registry/ag28a-database-table-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag28a-to-ag28b-database-table-plan-boundary.json",
  "data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-table-architecture-blueprint.json",
  "data/content-intelligence/backend-decision/ag27d-table-rls-policy-blueprint.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json",

  "data/content-intelligence/quality-reviews/ag28b-database-table-plan.json",
  "data/content-intelligence/backend-architecture/ag28b-database-table-plan.json",
  "data/content-intelligence/backend-architecture/ag28b-planned-table-inventory.json",
  "data/content-intelligence/backend-architecture/ag28b-table-relationship-map.json",
  "data/content-intelligence/backend-architecture/ag28b-state-and-status-field-plan.json",
  "data/content-intelligence/backend-architecture/ag28b-audit-queue-publish-table-plan.json",
  "data/content-intelligence/backend-architecture/ag28b-id-naming-and-migration-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28b-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag28b-database-table-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag28b-auth-flow-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag28b-to-ag28c-auth-flow-plan-boundary.json",
  "data/quality/ag28b-database-table-plan.json",
  "data/quality/ag28b-database-table-plan-preview.json",
  "docs/quality/AG28B_DATABASE_TABLE_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag28b-database-table-plan.json");
const plan = readJson("data/content-intelligence/backend-architecture/ag28b-database-table-plan.json");
const tableInventory = readJson("data/content-intelligence/backend-architecture/ag28b-planned-table-inventory.json");
const relationshipMap = readJson("data/content-intelligence/backend-architecture/ag28b-table-relationship-map.json");
const stateFieldPlan = readJson("data/content-intelligence/backend-architecture/ag28b-state-and-status-field-plan.json");
const auditQueuePublish = readJson("data/content-intelligence/backend-architecture/ag28b-audit-queue-publish-table-plan.json");
const idNaming = readJson("data/content-intelligence/backend-architecture/ag28b-id-naming-and-migration-blueprint.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag28b-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag28b-database-table-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag28b-auth-flow-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag28b-to-ag28c-auth-flow-plan-boundary.json");
const registry = readJson("data/quality/ag28b-database-table-plan.json");
const preview = readJson("data/quality/ag28b-database-table-plan-preview.json");

const ag28a = readJson("data/content-intelligence/backend-architecture/ag28a-backend-architecture-blueprint.json");
const ag28aReadiness = readJson("data/content-intelligence/quality-registry/ag28a-database-table-plan-readiness-record.json");
const ag27z = readJson("data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json");
const routing = readJson("data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json");
const publishControl = readJson("data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json");
const pkg = readJson("package.json");

if (review.status !== "database_table_plan_created_ready_for_ag28c") fail("Review status mismatch.");
if (plan.status !== "database_table_plan_created_ready_for_ag28c") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.table_plan_scope.stage_type !== "database_table_plan_blueprint_only") fail("Stage type must be blueprint-only.");
if (plan.table_plan_scope.activation_now !== false) fail("Activation must be false.");
if (plan.table_plan_scope.next_stage !== "AG28C") fail("Next stage must be AG28C.");

for (const flag of [
  "database_creation_allowed_in_ag28b",
  "table_creation_allowed_in_ag28b",
  "migration_creation_allowed_in_ag28b",
  "migration_execution_allowed_in_ag28b",
  "rls_policy_creation_allowed_in_ag28b",
  "secret_creation_allowed_in_ag28b",
  "runtime_queue_creation_allowed_in_ag28b",
  "dynamic_publishing_allowed_in_ag28b",
  "deployment_allowed_in_ag28b",
  "publication_allowed_in_ag28b"
]) {
  if (plan[flag] !== false) fail(`${flag} must be false.`);
}
if (plan.supabase_auth_backend_deferred !== true) fail("Backend deferral must remain true.");

if (tableInventory.status !== "planned_table_inventory_created_no_tables") fail("Table inventory status mismatch.");
if (tableInventory.table_group_count < 6) fail("At least six table groups required.");
if (tableInventory.planned_table_count < 30) fail("At least thirty planned tables expected.");
if (tableInventory.table_creation_allowed_now !== false) fail("Table creation must be false.");
for (const groupId of ["identity_access", "content_core", "admin_editor_workflow", "references_attribution_objects", "publishing_audit", "future_reader_personalization"]) {
  if (!tableInventory.table_groups.some((group) => group.group_id === groupId)) fail(`Missing table group: ${groupId}`);
}

if (relationshipMap.status !== "table_relationship_map_created_no_constraints") fail("Relationship map status mismatch.");
if (relationshipMap.planned_relationships.length < 10) fail("At least ten relationships required.");
if (relationshipMap.constraint_creation_allowed_now !== false) fail("Constraint creation must be false.");

if (stateFieldPlan.status !== "state_status_field_plan_created_no_runtime_state") fail("State field plan status mismatch.");
if (stateFieldPlan.canonical_article_states.length < 12) fail("Canonical article states insufficient.");
if (!stateFieldPlan.canonical_article_states.includes("published")) fail("Published state missing.");
if (!stateFieldPlan.canonical_article_states.includes("editor_returned_to_admin")) fail("Editor returned state missing.");
if (stateFieldPlan.runtime_state_enabled_now !== false) fail("Runtime state must be false.");

if (auditQueuePublish.status !== "audit_queue_publish_table_plan_created_no_runtime_queue") fail("Audit/queue/publish plan status mismatch.");
if (auditQueuePublish.admin_final_publish_authority !== true) fail("Admin final publish authority missing.");
if (auditQueuePublish.editor_publish_authority !== false) fail("Editor publish authority must be false.");
if (auditQueuePublish.runtime_queue_created_now !== false) fail("Runtime queue must be false.");
if (auditQueuePublish.dynamic_publish_created_now !== false) fail("Dynamic publish must be false.");

if (idNaming.status !== "id_naming_migration_blueprint_created_no_migrations") fail("ID naming status mismatch.");
if (idNaming.id_strategy.primary_key_default !== "uuid") fail("Primary key strategy must be uuid.");
if (idNaming.migration_files_created_now !== false) fail("Migration files must not be created.");
if (idNaming.migration_execution_allowed_now !== false) fail("Migration execution must be false.");

if (!consumption.future_consumption?.AG28C) fail("AG28C consumption note missing.");
if (!consumption.future_consumption?.AG28D) fail("AG28D consumption note missing.");
if (!consumption.future_consumption?.AG28Z) fail("AG28Z consumption note missing.");
if (!consumption.future_consumption?.AG29) fail("AG29 consumption note missing.");

if (blocker.status !== "database_table_plan_runtime_operations_blocked_pending_ag28c") fail("Blocker status mismatch.");
if (readiness.ready_for_ag28c !== true) fail("AG28C readiness missing.");
if (readiness.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (readiness.table_creation_allowed_now !== false) fail("Table creation must be false.");
if (readiness.migration_execution_allowed_now !== false) fail("Migration execution must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (boundary.next_stage_id !== "AG28C") fail("Boundary must point to AG28C.");
if (boundary.activation_allowed_in_ag28c !== false) fail("AG28C activation must be false.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");

if (review.summary.database_table_plan_created !== true) fail("Review summary missing.");
if (review.summary.blueprint_only !== true) fail("Blueprint-only summary missing.");
if (review.summary.ready_for_ag28c !== true) fail("AG28C readiness summary missing.");
if (review.summary.planned_table_count !== tableInventory.planned_table_count) fail("Planned table count mismatch.");
for (const flag of [
  "database_created",
  "table_created",
  "migration_created",
  "migration_executed",
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

if (ag28a.status !== "backend_architecture_blueprint_created_ready_for_ag28b") fail("AG28A source status mismatch.");
if (ag28aReadiness.ready_for_ag28b !== true) fail("AG28A readiness must allow AG28B.");
if (ag27z.closure_decision.ready_for_ag28_backend_auth_architecture_blueprint !== true) fail("AG27Z must support AG28 chain.");
if (routing.role_routing_rules.admin_final_publish_authority !== true) fail("Routing must preserve Admin publish authority.");
if (routing.role_routing_rules.editor_publish_authority !== false) fail("Routing must block Editor publishing.");
if (publishControl.final_publish_authority !== "admin_only") fail("Publish control must be admin_only.");

if (registry.status !== "database_table_plan_created_ready_for_ag28c") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.blueprint_only !== true) fail("Preview must be blueprint-only.");
if (preview.ready_for_ag28c !== true) fail("Preview must be ready for AG28C.");
if (preview.database_objects !== 0) fail("Preview must record 0 database objects.");
if (preview.table_objects !== 0) fail("Preview must record 0 table objects.");
if (preview.migration_objects !== 0) fail("Preview must record 0 migration objects.");
if (preview.rls_policy_objects !== 0) fail("Preview must record 0 RLS policy objects.");
if (preview.secret_objects !== 0) fail("Preview must record 0 secret objects.");
if (preview.runtime_queues !== 0) fail("Preview must record 0 runtime queues.");
if (preview.deployments !== 0) fail("Preview must record 0 deployments.");
if (preview.published_items !== 0) fail("Preview must record 0 published items.");

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag28a-backend-architecture-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28a-backend-data-flow-blueprint.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-table-architecture-blueprint.json",
  "data/content-intelligence/backend-decision/ag27d-table-rls-policy-blueprint.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "database_table_plan_created") {
    if (v !== true) fail("database_table_plan_created must be true.");
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag28b"]) fail("Missing generate:ag28b script.");
if (!pkg.scripts?.["validate:ag28b"]) fail("Missing validate:ag28b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag28b")) fail("validate:project must include validate:ag28b.");

pass("AG28B Database Table Plan is present.");
pass("Planned table inventory, relationships, states and audit/queue/publish table plan are valid.");
pass("ID naming and migration blueprint is present without migration creation.");
pass("AG28C Auth Flow Plan boundary is ready.");
pass("No Supabase/Auth/backend/database/table/migration/RLS/secret/runtime queue/deployment/publishing is enabled.");
