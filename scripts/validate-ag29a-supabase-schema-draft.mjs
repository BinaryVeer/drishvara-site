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
  console.error(`❌ AG29A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28-backend-module-map.json",
  "data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json",
  "data/content-intelligence/backend-architecture/ag28-service-boundary-model.json",
  "data/content-intelligence/backend-architecture/ag28-secret-environment-doctrine.json",
  "data/content-intelligence/backend-architecture/ag28-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag28-backend-schema-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag28-to-ag29-backend-schema-plan-boundary.json",
  "data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json",
  "data/content-intelligence/backend-decision/ag27z-backend-activation-deferral-register.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-table-plan.json",
  "data/content-intelligence/backend-decision/ag27c-auth-role-access-model.json",
  "data/content-intelligence/backend-decision/ag27c-rls-policy-plan.json",
  "data/content-intelligence/backend-decision/ag27c-audit-secret-governance-plan.json",
  "data/content-intelligence/backend-decision/ag27d-access-boundary-matrix.json",
  "data/content-intelligence/backend-decision/ag27d-rls-test-scenario-model.json",
  "data/content-intelligence/backend-decision/ag27d-activation-guard-register.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag29a-supabase-schema-draft.json",
  "data/content-intelligence/backend-architecture/ag29a-supabase-schema-draft.json",
  "data/content-intelligence/backend-architecture/ag29a-schema-entity-register.json",
  "data/content-intelligence/backend-architecture/ag29a-table-relationship-map.json",
  "data/content-intelligence/backend-architecture/ag29a-state-field-model.json",
  "data/content-intelligence/backend-architecture/ag29a-publish-audit-rollback-schema-draft.json",
  "data/content-intelligence/backend-architecture/ag29a-non-activation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag29a-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag29a-supabase-schema-draft-blocker-register.json",
  "data/content-intelligence/quality-registry/ag29a-rls-policy-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag29a-to-ag29b-rls-policy-plan-boundary.json",
  "data/quality/ag29a-supabase-schema-draft.json",
  "data/quality/ag29a-supabase-schema-draft-preview.json",
  "docs/quality/AG29A_SUPABASE_SCHEMA_DRAFT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag29a-supabase-schema-draft.json");
const draft = readJson("data/content-intelligence/backend-architecture/ag29a-supabase-schema-draft.json");
const entityRegister = readJson("data/content-intelligence/backend-architecture/ag29a-schema-entity-register.json");
const relationshipMap = readJson("data/content-intelligence/backend-architecture/ag29a-table-relationship-map.json");
const stateFieldModel = readJson("data/content-intelligence/backend-architecture/ag29a-state-field-model.json");
const publishDraft = readJson("data/content-intelligence/backend-architecture/ag29a-publish-audit-rollback-schema-draft.json");
const nonActivation = readJson("data/content-intelligence/backend-architecture/ag29a-non-activation-audit-register.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag29a-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag29a-supabase-schema-draft-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag29a-rls-policy-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag29a-to-ag29b-rls-policy-plan-boundary.json");
const registry = readJson("data/quality/ag29a-supabase-schema-draft.json");
const preview = readJson("data/quality/ag29a-supabase-schema-draft-preview.json");

const ag28 = readJson("data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json");
const ag28Readiness = readJson("data/content-intelligence/quality-registry/ag28-backend-schema-plan-readiness-record.json");
const ag28NonActivation = readJson("data/content-intelligence/backend-architecture/ag28-non-activation-audit-register.json");
const ag27z = readJson("data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json");
const ag27zDeferral = readJson("data/content-intelligence/backend-decision/ag27z-backend-activation-deferral-register.json");
const ag27cTablePlan = readJson("data/content-intelligence/backend-decision/ag27c-supabase-table-plan.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "supabase_schema_draft_created_ready_for_ag29b") fail("Review status mismatch.");
if (draft.status !== "supabase_schema_draft_created_ready_for_ag29b") fail("Draft status mismatch.");
if (draft.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (draft.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (draft.schema_draft_decision.non_active_schema_draft_created !== true) fail("Non-active schema draft decision missing.");
if (draft.schema_draft_decision.entity_register_created !== true) fail("Entity register decision missing.");
if (draft.schema_draft_decision.relationship_map_created !== true) fail("Relationship map decision missing.");
if (draft.schema_draft_decision.state_field_model_created !== true) fail("State field decision missing.");
if (draft.schema_draft_decision.publish_audit_rollback_schema_draft_created !== true) fail("Publish audit/rollback draft decision missing.");
if (draft.schema_draft_decision.proceed_to_ag29b_rls_policy_plan !== true) fail("AG29B readiness missing.");

for (const flag of [
  "sql_generation_approved_now",
  "migration_generation_approved_now",
  "database_creation_approved_now",
  "constraint_application_approved_now",
  "index_creation_approved_now",
  "rls_policy_application_approved_now",
  "auth_activation_approved_now",
  "secrets_or_env_setup_approved_now",
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (draft.schema_draft_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const flag of [
  "sql_generation_allowed_in_ag29a",
  "migration_generation_allowed_in_ag29a",
  "database_creation_allowed_in_ag29a",
  "database_table_creation_allowed_in_ag29a",
  "constraint_application_allowed_in_ag29a",
  "index_creation_allowed_in_ag29a",
  "rls_policy_application_allowed_in_ag29a",
  "auth_activation_allowed_in_ag29a",
  "secret_creation_allowed_in_ag29a",
  "env_var_write_allowed_in_ag29a",
  "server_route_creation_allowed_in_ag29a",
  "api_route_creation_allowed_in_ag29a",
  "deployment_allowed_in_ag29a",
  "public_mutation_allowed_in_ag29a"
]) {
  if (draft[flag] !== false) fail(`${flag} must be false.`);
}

if (entityRegister.status !== "schema_entity_register_created_no_database_objects") fail("Entity register status mismatch.");
if (entityRegister.entity_count !== entityRegister.entities.length) fail("Entity count mismatch.");
if (entityRegister.entity_count !== ag27cTablePlan.table_count) fail("Entity count must match AG27C table count.");
if (entityRegister.database_objects_created !== false) fail("Database objects must not be created.");
if (entityRegister.sql_generated !== false) fail("SQL must not be generated.");
if (entityRegister.migrations_generated !== false) fail("Migrations must not be generated.");
for (const entity of entityRegister.entities) {
  if (entity.schema_creation_now !== false) fail(`${entity.entity_id} schema creation must be false.`);
  if (entity.sql_generation_now !== false) fail(`${entity.entity_id} SQL generation must be false.`);
}

if (relationshipMap.status !== "table_relationship_map_created_no_foreign_keys_applied") fail("Relationship map status mismatch.");
if (relationshipMap.relationship_count !== relationshipMap.relationships.length) fail("Relationship count mismatch.");
if (relationshipMap.relationship_count < 10) fail("Expected at least 10 schema relationships.");
if (relationshipMap.foreign_keys_created !== false) fail("Foreign keys must not be created.");
for (const rel of relationshipMap.relationships) {
  if (rel.apply_now !== false) fail(`${rel.relationship_id} must not apply now.`);
}

if (stateFieldModel.status !== "state_field_model_created_no_state_runtime") fail("State field model status mismatch.");
if (!stateFieldModel.article_states.includes("published")) fail("Published article state missing.");
if (!stateFieldModel.assignment_states.includes("sent_back_to_admin")) fail("sent_back_to_admin state missing.");
if (!stateFieldModel.admin_decision_states.includes("return_for_correction")) fail("return_for_correction decision missing.");
if (!stateFieldModel.admin_decision_states.includes("publish_plan_only")) fail("publish_plan_only decision missing.");
if (stateFieldModel.state_runtime_created !== false) fail("State runtime must not be created.");

if (publishDraft.status !== "publish_audit_rollback_schema_draft_created_no_runtime") fail("Publish audit/rollback status mismatch.");
if (publishDraft.audit_append_only_required !== true) fail("Append-only audit requirement missing.");
if (publishDraft.rollback_required_before_dynamic_publish !== true) fail("Rollback requirement missing.");
if (publishDraft.runtime_created !== false) fail("Publish/audit runtime must not be created.");
for (const table of publishDraft.draft_tables) {
  if (table.create_now !== false) fail(`${table.table_name} must not be created now.`);
}

if (nonActivation.status !== "supabase_schema_draft_non_activation_audit_passed") fail("Non-activation audit status mismatch.");
if (nonActivation.audit_passed !== true) fail("Non-activation audit must pass.");
for (const check of nonActivation.checks) {
  if (check.passed !== true) fail(`Non-activation check failed: ${check.check_id}`);
}

if (!consumption.future_consumption?.AG29B) fail("AG29B consumption note missing.");
if (!consumption.future_consumption?.AG29C) fail("AG29C consumption note missing.");
if (!consumption.future_consumption?.AG29D) fail("AG29D consumption note missing.");
if (!consumption.future_consumption?.AG29Z) fail("AG29Z consumption note missing.");
if (!consumption.future_consumption?.AG30) fail("AG30 consumption note missing.");

if (blocker.status !== "supabase_schema_draft_operations_blocked_pending_ag29b") fail("Blocker status mismatch.");
if (readiness.ready_for_ag29b !== true) fail("AG29B readiness missing.");
if (readiness.allowed_ag29b_mode !== "non_active_rls_policy_plan_only") fail("AG29B mode must be non-active RLS plan only.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.next_stage_id !== "AG29B") fail("Boundary must point to AG29B.");
if (boundary.status !== "ag29b_boundary_created_non_active_rls_policy_plan_only") fail("Boundary status mismatch.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.supabase_schema_draft_created !== true) fail("Review summary missing.");
if (review.summary.non_active_schema_draft_only !== true) fail("Non-active schema-only summary missing.");
if (review.summary.ready_for_ag29b !== true) fail("AG29B readiness summary missing.");

for (const flag of [
  "sql_generation_allowed_now",
  "migration_generation_allowed_now",
  "database_creation_allowed_now",
  "database_table_creation_allowed_now",
  "constraint_application_allowed_now",
  "index_creation_allowed_now",
  "rls_policy_application_allowed_now",
  "auth_activation_allowed_now",
  "secret_creation_allowed_now",
  "env_var_write_allowed_now",
  "server_route_creation_allowed_now",
  "api_route_creation_allowed_now",
  "deployment_done",
  "public_mutation_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must be false.`);
}

if (ag28.status !== "backend_auth_architecture_blueprint_created_ready_for_ag29") fail("AG28 source status mismatch.");
if (ag28Readiness.ready_for_ag29 !== true) fail("AG28 readiness must allow AG29 family.");
if (ag28Readiness.allowed_ag29_mode !== "non_active_schema_plan_only") fail("AG29 mode from AG28 mismatch.");
if (ag28NonActivation.audit_passed !== true) fail("AG28 non-activation audit must pass.");
if (ag27z.status !== "backend_decision_closed_non_active_architecture_ready_for_ag28") fail("AG27Z source status mismatch.");
for (const [key, value] of Object.entries(ag27zDeferral.deferral_decision)) {
  if (value !== false) fail(`AG27Z deferral must remain false: ${key}`);
}
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");

if (registry.status !== "supabase_schema_draft_created_ready_for_ag29b") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.entity_register_created !== 1) fail("Preview entity register missing.");
if (preview.relationship_map_created !== 1) fail("Preview relationship map missing.");
if (preview.state_field_model_created !== 1) fail("Preview state field model missing.");
if (preview.publish_audit_rollback_schema_draft_created !== 1) fail("Preview publish audit rollback draft missing.");
if (preview.sql_generated !== 0) fail("Preview must record 0 SQL.");
if (preview.migrations_generated !== 0) fail("Preview must record 0 migrations.");
if (preview.database_objects_created !== 0) fail("Preview must record 0 database objects.");
if (preview.constraints_applied !== 0) fail("Preview must record 0 constraints applied.");
if (preview.indexes_created !== 0) fail("Preview must record 0 indexes.");
if (preview.rls_policies_applied !== 0) fail("Preview must record 0 RLS policies.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.secrets_created !== 0) fail("Preview must record 0 secrets.");
if (preview.env_vars_written !== 0) fail("Preview must record 0 env writes.");
if (preview.server_routes_created !== 0) fail("Preview must record 0 server routes.");
if (preview.api_routes_created !== 0) fail("Preview must record 0 API routes.");
if (preview.deployment_done !== 0) fail("Preview must record 0 deployment.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28-backend-module-map.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-table-plan.json",
  "data/content-intelligence/backend-decision/ag27c-auth-role-access-model.json",
  "data/content-intelligence/backend-decision/ag27d-rls-test-scenario-model.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
]) {
  if (!draft.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Draft did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "supabase_schema_draft_created" ||
    k === "entity_register_created" ||
    k === "relationship_map_created" ||
    k === "state_field_model_created" ||
    k === "publish_audit_rollback_schema_draft_created"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag29a"]) fail("Missing generate:ag29a script.");
if (!pkg.scripts?.["validate:ag29a"]) fail("Missing validate:ag29a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag29a")) fail("validate:project must include validate:ag29a.");

pass("AG29A Supabase Schema Draft is present.");
pass("Schema entity register, relationship map, state field model and publish audit/rollback draft are valid.");
pass("Admin final clearance and Editor assigned-only governance are preserved.");
pass("No SQL, migrations, database objects, constraints, indexes, RLS application, Auth, secrets, routes, deployment or public mutation is enabled.");
pass("AG29B RLS Policy Plan boundary is ready.");
