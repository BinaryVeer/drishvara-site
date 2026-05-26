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
  console.error(`❌ AG27D validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag27c-supabase-auth-architecture-plan.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-auth-architecture-plan.json",
  "data/content-intelligence/backend-decision/ag27c-role-auth-architecture-model.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-table-architecture-blueprint.json",
  "data/content-intelligence/backend-decision/ag27c-admin-editor-workflow-architecture.json",
  "data/content-intelligence/backend-decision/ag27c-publishing-state-architecture.json",
  "data/content-intelligence/backend-decision/ag27c-secret-environment-governance-plan.json",
  "data/content-intelligence/quality-registry/ag27c-supabase-auth-security-rls-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27c-to-ag27d-supabase-auth-security-rls-plan-boundary.json",
  "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json",

  "data/content-intelligence/quality-reviews/ag27d-supabase-auth-security-rls-plan.json",
  "data/content-intelligence/backend-decision/ag27d-supabase-auth-security-rls-plan.json",
  "data/content-intelligence/backend-decision/ag27d-role-access-security-matrix.json",
  "data/content-intelligence/backend-decision/ag27d-table-rls-policy-blueprint.json",
  "data/content-intelligence/backend-decision/ag27d-workflow-security-guard-model.json",
  "data/content-intelligence/backend-decision/ag27d-secret-and-service-role-safety-model.json",
  "data/content-intelligence/backend-decision/ag27d-controlled-activation-stage-placement-plan.json",
  "data/content-intelligence/backend-decision/ag27d-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag27d-supabase-auth-security-rls-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag27d-backend-decision-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27d-to-ag27z-backend-decision-closure-boundary.json",
  "data/quality/ag27d-supabase-auth-security-rls-plan.json",
  "data/quality/ag27d-supabase-auth-security-rls-plan-preview.json",
  "docs/quality/AG27D_SUPABASE_AUTH_SECURITY_RLS_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag27d-supabase-auth-security-rls-plan.json");
const plan = readJson("data/content-intelligence/backend-decision/ag27d-supabase-auth-security-rls-plan.json");
const roleAccess = readJson("data/content-intelligence/backend-decision/ag27d-role-access-security-matrix.json");
const rls = readJson("data/content-intelligence/backend-decision/ag27d-table-rls-policy-blueprint.json");
const workflow = readJson("data/content-intelligence/backend-decision/ag27d-workflow-security-guard-model.json");
const secretSafety = readJson("data/content-intelligence/backend-decision/ag27d-secret-and-service-role-safety-model.json");
const activationPlan = readJson("data/content-intelligence/backend-decision/ag27d-controlled-activation-stage-placement-plan.json");
const consumption = readJson("data/content-intelligence/backend-decision/ag27d-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag27d-supabase-auth-security-rls-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag27d-backend-decision-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag27d-to-ag27z-backend-decision-closure-boundary.json");
const registry = readJson("data/quality/ag27d-supabase-auth-security-rls-plan.json");
const preview = readJson("data/quality/ag27d-supabase-auth-security-rls-plan-preview.json");

const ag27c = readJson("data/content-intelligence/backend-decision/ag27c-supabase-auth-architecture-plan.json");
const existingAg27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const routing = readJson("data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json");
const publishControl = readJson("data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json");
const pkg = readJson("package.json");

if (review.status !== "supabase_auth_security_rls_plan_created_ready_for_ag27z") fail("Review status mismatch.");
if (plan.status !== "supabase_auth_security_rls_plan_created_ready_for_ag27z") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.security_scope.stage_type !== "planning_only_supabase_auth_security_rls") fail("Stage type mismatch.");
if (plan.security_scope.next_stage !== "AG27Z") fail("Next stage must be AG27Z.");
if (plan.security_scope.activation_stage_placement_created !== true) fail("Activation stage placement must be created.");

for (const flag of [
  "backend_activation_allowed_in_ag27d",
  "auth_activation_allowed_in_ag27d",
  "supabase_project_creation_allowed_in_ag27d",
  "table_creation_allowed_in_ag27d",
  "migration_creation_allowed_in_ag27d",
  "rls_policy_creation_allowed_in_ag27d",
  "rls_policy_apply_allowed_in_ag27d",
  "secret_creation_allowed_in_ag27d",
  "runtime_queue_creation_allowed_in_ag27d",
  "dynamic_publishing_allowed_in_ag27d",
  "deployment_allowed_in_ag27d",
  "publication_allowed_in_ag27d"
]) {
  if (plan[flag] !== false) fail(`${flag} must be false.`);
}
if (plan.supabase_auth_backend_deferred !== true) fail("Backend deferral must remain true.");

if (roleAccess.status !== "role_access_security_matrix_created_no_auth_activation") fail("Role access status mismatch.");
if (roleAccess.admin_final_publish_authority !== true) fail("Admin final publish authority missing.");
if (roleAccess.editor_publish_authority !== false) fail("Editor publish authority must be false.");
if (roleAccess.auth_activation_allowed_now !== false) fail("Auth activation must be blocked.");
for (const roleId of ["admin", "editor", "system", "public_reader", "subscriber_future", "auditor_future"]) {
  if (!roleAccess.role_access_rows.some((row) => row.role_id === roleId)) fail(`Missing role access row: ${roleId}`);
}
const editor = roleAccess.role_access_rows.find((row) => row.role_id === "editor");
if (editor.can_publish_future_runtime !== false) fail("Editor publish must remain false.");
if (editor.can_read_unassigned_system_content !== false) fail("Editor must not read unassigned system content.");

if (rls.status !== "table_rls_policy_blueprint_created_no_policy_apply") fail("RLS blueprint status mismatch.");
if (rls.rls_rows.length < 6) fail("RLS rows must cover at least six table groups.");
if (rls.rls_policy_creation_allowed_now !== false) fail("RLS policy creation must be blocked.");
if (rls.rls_policy_apply_allowed_now !== false) fail("RLS policy apply must be blocked.");
if (rls.migration_creation_allowed_now !== false) fail("Migration creation must be blocked.");
for (const groupId of ["identity_access", "content_core", "admin_editor_workflow", "references_attribution_objects", "publishing_audit", "future_reader_personalization"]) {
  if (!rls.rls_rows.some((row) => row.table_group_id === groupId)) fail(`Missing RLS table group: ${groupId}`);
}

if (workflow.status !== "workflow_security_guard_model_created_no_runtime_queue") fail("Workflow status mismatch.");
if (workflow.runtime_queue_allowed_now !== false) fail("Runtime queue must be blocked.");
if (workflow.runtime_write_allowed_now !== false) fail("Runtime write must be blocked.");
for (const ruleId of ["system_generated_to_admin_first", "editor_assignment_required_for_system_content", "editor_new_candidate_to_admin_review", "admin_only_publish", "public_published_only", "audit_append_only"]) {
  if (!workflow.workflow_security_rules.some((rule) => rule.rule_id === ruleId)) fail(`Missing workflow security rule: ${ruleId}`);
}

if (secretSafety.status !== "secret_service_role_safety_model_created_no_secrets") fail("Secret safety status mismatch.");
if (secretSafety.service_role_allowed_in_client !== false) fail("Service role must not be allowed in client.");
if (secretSafety.secret_creation_allowed_now !== false) fail("Secret creation must be blocked.");
if (!secretSafety.secret_safety_rules.some((rule) => rule.includes("No Supabase key is created"))) fail("No-key-created rule missing.");
if (!secretSafety.secret_safety_rules.some((rule) => rule.includes("Service role key must never be exposed"))) fail("Service role client exposure rule missing.");

if (activationPlan.status !== "controlled_activation_stage_placement_created_no_activation") fail("Activation stage plan status mismatch.");
if (activationPlan.activation_position_decision.activation_not_in_ag27d !== true) fail("Activation must not be in AG27D.");
if (activationPlan.activation_position_decision.activation_not_in_ag27z !== true) fail("Activation must not be in AG27Z.");
if (activationPlan.activation_allowed_now !== false) fail("Activation must not be allowed now.");
if (!activationPlan.recommended_sequence.some((item) => item.stage === "AG29")) fail("AG29 activation audit placement missing.");
if (!activationPlan.minimum_activation_preconditions.some((item) => item.includes("Explicit user approval"))) fail("Explicit approval precondition missing.");

if (!consumption.future_consumption?.AG27Z) fail("AG27Z consumption note missing.");
if (!consumption.future_consumption?.AG28) fail("AG28 consumption note missing.");
if (!consumption.future_consumption?.AG29) fail("AG29 consumption note missing.");
if (!consumption.future_consumption?.AG30) fail("AG30 consumption note missing.");
if (!consumption.future_consumption?.AG31_plus) fail("AG31+ consumption note missing.");

if (blocker.status !== "supabase_auth_security_rls_plan_runtime_operations_blocked_pending_ag27z") fail("Blocker status mismatch.");
if (readiness.ready_for_ag27z !== true) fail("AG27Z readiness missing.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.supabase_activation_allowed_now !== false) fail("Supabase activation must be false.");
if (boundary.next_stage_id !== "AG27Z") fail("Boundary must point to AG27Z.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");
if (boundary.controlled_activation_should_be_considered_later !== true) fail("Controlled activation later flag missing.");

if (review.summary.supabase_auth_security_rls_plan_created !== true) fail("Review summary missing.");
if (review.summary.planning_only !== true) fail("Planning-only summary missing.");
if (review.summary.controlled_activation_stage_placement_created !== true) fail("Activation stage placement summary missing.");
if (review.summary.ready_for_ag27z !== true) fail("AG27Z readiness summary missing.");
for (const flag of [
  "backend_activation_approved_now",
  "auth_activation_approved_now",
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

if (ag27c.status !== "supabase_auth_architecture_plan_created_ready_for_ag27d") fail("AG27C source status mismatch.");
if (existingAg27.checkpoint_decision.backend_deferred !== true) fail("Existing AG27 backend deferral must remain true.");
if (routing.role_routing_rules.admin_final_publish_authority !== true) fail("Routing must preserve Admin publish authority.");
if (routing.role_routing_rules.editor_publish_authority !== false) fail("Routing must block Editor publishing.");
if (publishControl.final_publish_authority !== "admin_only") fail("Publish control must be admin_only.");

if (registry.status !== "supabase_auth_security_rls_plan_created_ready_for_ag27z") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.planning_only !== true) fail("Preview must be planning-only.");
if (preview.controlled_activation_stage_placement_created !== true) fail("Preview activation placement missing.");
if (preview.ready_for_ag27z !== true) fail("Preview must be ready for AG27Z.");
if (preview.backend_activation_approved_now !== 0) fail("Preview must record 0 backend activation approval.");
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
  "data/content-intelligence/backend-decision/ag27c-supabase-auth-architecture-plan.json",
  "data/content-intelligence/backend-decision/ag27c-role-auth-architecture-model.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-table-architecture-blueprint.json",
  "data/content-intelligence/backend-decision/ag27c-secret-environment-governance-plan.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "supabase_auth_security_rls_plan_created" || k === "controlled_activation_stage_placement_created") {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag27d"]) fail("Missing generate:ag27d script.");
if (!pkg.scripts?.["validate:ag27d"]) fail("Missing validate:ag27d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag27d")) fail("validate:project must include validate:ag27d.");

pass("AG27D Supabase/Auth Security and RLS Plan is present.");
pass("Role access matrix, RLS blueprint and workflow security guards are valid.");
pass("Secret/service-role safety model is present with no secrets created.");
pass("Controlled activation stage placement is recorded for later stage.");
pass("AG27Z Backend Decision Closure boundary is ready.");
pass("No Supabase/Auth/backend/database/table/migration/RLS/secret/runtime queue/deployment/publishing is enabled.");
