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
  console.error(`❌ AG27C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27b-conditional-ag27c-ag27d-gate-register.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json",

  "data/content-intelligence/quality-reviews/ag27c-supabase-auth-architecture-plan.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-auth-architecture-plan.json",
  "data/content-intelligence/backend-decision/ag27c-role-auth-architecture-model.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-table-architecture-blueprint.json",
  "data/content-intelligence/backend-decision/ag27c-admin-editor-workflow-architecture.json",
  "data/content-intelligence/backend-decision/ag27c-publishing-state-architecture.json",
  "data/content-intelligence/backend-decision/ag27c-secret-environment-governance-plan.json",
  "data/content-intelligence/backend-decision/ag27c-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag27c-supabase-auth-architecture-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag27c-supabase-auth-security-rls-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27c-to-ag27d-supabase-auth-security-rls-plan-boundary.json",
  "data/quality/ag27c-supabase-auth-architecture-plan.json",
  "data/quality/ag27c-supabase-auth-architecture-plan-preview.json",
  "docs/quality/AG27C_SUPABASE_AUTH_ARCHITECTURE_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag27c-supabase-auth-architecture-plan.json");
const plan = readJson("data/content-intelligence/backend-decision/ag27c-supabase-auth-architecture-plan.json");
const roleModel = readJson("data/content-intelligence/backend-decision/ag27c-role-auth-architecture-model.json");
const tableBlueprint = readJson("data/content-intelligence/backend-decision/ag27c-supabase-table-architecture-blueprint.json");
const workflow = readJson("data/content-intelligence/backend-decision/ag27c-admin-editor-workflow-architecture.json");
const publishState = readJson("data/content-intelligence/backend-decision/ag27c-publishing-state-architecture.json");
const secretPlan = readJson("data/content-intelligence/backend-decision/ag27c-secret-environment-governance-plan.json");
const consumption = readJson("data/content-intelligence/backend-decision/ag27c-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag27c-supabase-auth-architecture-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag27c-supabase-auth-security-rls-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag27c-to-ag27d-supabase-auth-security-rls-plan-boundary.json");
const registry = readJson("data/quality/ag27c-supabase-auth-architecture-plan.json");
const preview = readJson("data/quality/ag27c-supabase-auth-architecture-plan-preview.json");

const ag27b = readJson("data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json");
const existingAg27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const routing = readJson("data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json");
const publishControl = readJson("data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json");
const pkg = readJson("package.json");

if (review.status !== "supabase_auth_architecture_plan_created_ready_for_ag27d") fail("Review status mismatch.");
if (plan.status !== "supabase_auth_architecture_plan_created_ready_for_ag27d") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.explicit_approval_record.approval_type !== "planning_only") fail("Approval type must be planning_only.");
if (plan.explicit_approval_record.backend_activation_approved !== false) fail("Backend activation must not be approved.");
if (plan.explicit_approval_record.auth_activation_approved !== false) fail("Auth activation must not be approved.");
if (plan.explicit_approval_record.supabase_project_creation_approved !== false) fail("Supabase project creation must not be approved.");

if (plan.architecture_scope.stage_type !== "planning_only_supabase_auth_architecture") fail("Stage type mismatch.");
if (plan.architecture_scope.next_stage !== "AG27D") fail("Next stage must be AG27D.");
if (plan.architecture_scope.backend_status !== "deferred") fail("Backend must remain deferred.");
if (plan.architecture_scope.auth_status !== "deferred") fail("Auth must remain deferred.");
if (plan.architecture_scope.supabase_status !== "deferred") fail("Supabase must remain deferred.");

for (const flag of [
  "backend_activation_allowed_in_ag27c",
  "auth_activation_allowed_in_ag27c",
  "supabase_project_creation_allowed_in_ag27c",
  "table_creation_allowed_in_ag27c",
  "migration_creation_allowed_in_ag27c",
  "secret_creation_allowed_in_ag27c",
  "runtime_queue_creation_allowed_in_ag27c",
  "dynamic_publishing_allowed_in_ag27c",
  "deployment_allowed_in_ag27c",
  "publication_allowed_in_ag27c"
]) {
  if (plan[flag] !== false) fail(`${flag} must be false.`);
}
if (plan.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (roleModel.status !== "role_auth_architecture_model_created_no_auth_activation") fail("Role model status mismatch.");
if (roleModel.roles.length < 6) fail("At least six roles must be planned.");
for (const roleId of ["admin", "editor", "system", "public_reader", "subscriber_future", "auditor_future"]) {
  if (!roleModel.roles.some((role) => role.role_id === roleId)) fail(`Missing role: ${roleId}`);
}
const admin = roleModel.roles.find((role) => role.role_id === "admin");
const editor = roleModel.roles.find((role) => role.role_id === "editor");
if (admin.can_publish_future_runtime !== true) fail("Admin future publish authority missing.");
if (editor.can_publish_future_runtime !== false) fail("Editor future publish authority must be false.");
if (roleModel.auth_activation_allowed_now !== false) fail("Auth activation must be blocked.");

if (tableBlueprint.status !== "supabase_table_architecture_blueprint_created_no_tables") fail("Table blueprint status mismatch.");
if (tableBlueprint.table_groups.length < 6) fail("At least six table groups must be planned.");
for (const groupId of ["identity_access", "content_core", "admin_editor_workflow", "references_attribution_objects", "publishing_audit", "future_reader_personalization"]) {
  if (!tableBlueprint.table_groups.some((group) => group.table_group_id === groupId)) fail(`Missing table group: ${groupId}`);
}
if (tableBlueprint.table_creation_allowed_now !== false) fail("Table creation must be blocked.");
if (tableBlueprint.migration_creation_allowed_now !== false) fail("Migration creation must be blocked.");
if (tableBlueprint.schema_execution_allowed_now !== false) fail("Schema execution must be blocked.");

if (workflow.status !== "admin_editor_workflow_architecture_created_no_runtime_queue") fail("Workflow status mismatch.");
if (workflow.admin_first_system_review !== true) fail("Admin-first system review missing.");
if (workflow.admin_final_publish_authority !== true) fail("Admin final publish authority missing.");
if (workflow.editor_publish_authority !== false) fail("Editor publish authority must be false.");
if (workflow.runtime_queue_allowed_now !== false) fail("Runtime queue must be blocked.");

if (publishState.status !== "publishing_state_architecture_created_no_dynamic_publish") fail("Publishing state status mismatch.");
if (publishState.publish_rules.admin_can_publish_later !== true) fail("Admin future publish rule missing.");
if (publishState.publish_rules.editor_can_publish_later !== false) fail("Editor publish must remain false.");
if (publishState.publish_rules.system_can_publish_later_without_admin !== false) fail("System publish without Admin must remain false.");
if (publishState.dynamic_publishing_allowed_now !== false) fail("Dynamic publishing must be blocked.");

if (secretPlan.status !== "secret_environment_governance_plan_created_no_secrets") fail("Secret plan status mismatch.");
if (secretPlan.secret_creation_allowed_now !== false) fail("Secret creation must be blocked.");
if (!secretPlan.future_environment_variables.some((item) => item.name === "SUPABASE_SERVICE_ROLE_KEY" && item.create_now === false)) fail("Service role key governance missing.");
if (!secretPlan.secret_rules.some((rule) => rule.includes("No secret is created"))) fail("No-secret rule missing.");

if (!consumption.future_consumption?.AG27D) fail("AG27D consumption note missing.");
if (!consumption.future_consumption?.AG27Z) fail("AG27Z consumption note missing.");
if (!consumption.future_consumption?.AG28) fail("AG28 consumption note missing.");
if (blocker.status !== "supabase_auth_architecture_plan_runtime_operations_blocked_pending_ag27d") fail("Blocker status mismatch.");
if (readiness.ready_for_ag27d !== true) fail("AG27D readiness missing.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.supabase_activation_allowed_now !== false) fail("Supabase activation must be false.");
if (boundary.next_stage_id !== "AG27D") fail("Boundary must point to AG27D.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");
if (boundary.explicit_approval_required_before_runtime_activation !== true) fail("Runtime activation approval guard missing.");

if (review.summary.supabase_auth_architecture_plan_created !== true) fail("Review summary missing.");
if (review.summary.explicit_planning_approval_recorded !== true) fail("Planning approval summary missing.");
if (review.summary.planning_only !== true) fail("Planning-only summary missing.");
if (review.summary.ready_for_ag27d !== true) fail("AG27D readiness summary missing.");
for (const flag of [
  "backend_activation_approved_now",
  "auth_activation_approved_now",
  "supabase_project_created",
  "database_created",
  "table_created",
  "migration_created",
  "rls_policy_created",
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

if (ag27b.audit_decision.selected_decision !== "continue_static") fail("AG27B source decision mismatch.");
if (existingAg27.checkpoint_decision.backend_deferred !== true) fail("Existing AG27 backend deferral must remain true.");
if (routing.role_routing_rules.admin_final_publish_authority !== true) fail("Routing must preserve Admin publish authority.");
if (routing.role_routing_rules.editor_publish_authority !== false) fail("Routing must block Editor publishing.");
if (publishControl.final_publish_authority !== "admin_only") fail("Publish control must be admin_only.");

if (registry.status !== "supabase_auth_architecture_plan_created_ready_for_ag27d") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.planning_only !== true) fail("Preview must be planning-only.");
if (preview.ready_for_ag27d !== true) fail("Preview must be ready for AG27D.");
if (preview.backend_activation_approved_now !== 0) fail("Preview must record 0 backend activation approval.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.supabase_enabled !== 0) fail("Preview must record 0 Supabase.");
if (preview.database_objects !== 0) fail("Preview must record 0 database objects.");
if (preview.table_objects !== 0) fail("Preview must record 0 table objects.");
if (preview.migration_objects !== 0) fail("Preview must record 0 migration objects.");
if (preview.secret_objects !== 0) fail("Preview must record 0 secret objects.");
if (preview.runtime_queues !== 0) fail("Preview must record 0 runtime queues.");
if (preview.deployments !== 0) fail("Preview must record 0 deployments.");
if (preview.published_items !== 0) fail("Preview must record 0 published items.");

for (const expectedInput of [
  "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27b-conditional-ag27c-ag27d-gate-register.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "supabase_auth_architecture_plan_created" || k === "explicit_planning_approval_recorded") {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag27c"]) fail("Missing generate:ag27c script.");
if (!pkg.scripts?.["validate:ag27c"]) fail("Missing validate:ag27c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag27c")) fail("validate:project must include validate:ag27c.");

pass("AG27C Supabase/Auth Architecture Plan is present.");
pass("Planning-only approval is recorded.");
pass("Role/Auth architecture, table blueprint, workflow architecture and publishing-state architecture are valid.");
pass("Secret/environment governance plan is present with no secrets created.");
pass("AG27D Supabase/Auth Security and RLS Plan boundary is ready.");
pass("No Supabase/Auth/backend/database/table/migration/secret/runtime queue/deployment/publishing is enabled.");
