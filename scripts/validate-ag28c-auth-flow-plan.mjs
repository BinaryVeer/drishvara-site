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
  console.error(`❌ AG28C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag28b-database-table-plan.json",
  "data/content-intelligence/backend-architecture/ag28b-database-table-plan.json",
  "data/content-intelligence/backend-architecture/ag28b-planned-table-inventory.json",
  "data/content-intelligence/backend-architecture/ag28b-table-relationship-map.json",
  "data/content-intelligence/backend-architecture/ag28b-state-and-status-field-plan.json",
  "data/content-intelligence/backend-architecture/ag28b-audit-queue-publish-table-plan.json",
  "data/content-intelligence/quality-registry/ag28b-auth-flow-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag28b-to-ag28c-auth-flow-plan-boundary.json",
  "data/content-intelligence/backend-architecture/ag28a-backend-architecture-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28a-runtime-boundary-and-non-activation-guard.json",
  "data/content-intelligence/backend-decision/ag27c-role-auth-architecture-model.json",
  "data/content-intelligence/backend-decision/ag27d-role-access-security-matrix.json",
  "data/content-intelligence/backend-decision/ag27d-workflow-security-guard-model.json",
  "data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json",

  "data/content-intelligence/quality-reviews/ag28c-auth-flow-plan.json",
  "data/content-intelligence/backend-architecture/ag28c-auth-flow-plan.json",
  "data/content-intelligence/backend-architecture/ag28c-auth-role-session-flow-model.json",
  "data/content-intelligence/backend-architecture/ag28c-route-protection-flow-blueprint.json",
  "data/content-intelligence/backend-architecture/ag28c-login-session-lifecycle-plan.json",
  "data/content-intelligence/backend-architecture/ag28c-permission-checkpoint-map.json",
  "data/content-intelligence/backend-architecture/ag28c-auth-non-activation-guard.json",
  "data/content-intelligence/backend-architecture/ag28c-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag28c-auth-flow-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag28c-backend-architecture-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag28c-to-ag28d-backend-architecture-audit-boundary.json",
  "data/quality/ag28c-auth-flow-plan.json",
  "data/quality/ag28c-auth-flow-plan-preview.json",
  "docs/quality/AG28C_AUTH_FLOW_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag28c-auth-flow-plan.json");
const plan = readJson("data/content-intelligence/backend-architecture/ag28c-auth-flow-plan.json");
const authRoleSession = readJson("data/content-intelligence/backend-architecture/ag28c-auth-role-session-flow-model.json");
const routeProtection = readJson("data/content-intelligence/backend-architecture/ag28c-route-protection-flow-blueprint.json");
const lifecycle = readJson("data/content-intelligence/backend-architecture/ag28c-login-session-lifecycle-plan.json");
const permissionMap = readJson("data/content-intelligence/backend-architecture/ag28c-permission-checkpoint-map.json");
const guard = readJson("data/content-intelligence/backend-architecture/ag28c-auth-non-activation-guard.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag28c-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag28c-auth-flow-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag28c-backend-architecture-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag28c-to-ag28d-backend-architecture-audit-boundary.json");
const registry = readJson("data/quality/ag28c-auth-flow-plan.json");
const preview = readJson("data/quality/ag28c-auth-flow-plan-preview.json");

const ag28b = readJson("data/content-intelligence/backend-architecture/ag28b-database-table-plan.json");
const ag28bReadiness = readJson("data/content-intelligence/quality-registry/ag28b-auth-flow-plan-readiness-record.json");
const ag28aGuard = readJson("data/content-intelligence/backend-architecture/ag28a-runtime-boundary-and-non-activation-guard.json");
const ag27z = readJson("data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json");
const routing = readJson("data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json");
const publishControl = readJson("data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json");
const pkg = readJson("package.json");

if (review.status !== "auth_flow_plan_created_ready_for_ag28d") fail("Review status mismatch.");
if (plan.status !== "auth_flow_plan_created_ready_for_ag28d") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.auth_flow_scope.stage_type !== "auth_flow_plan_blueprint_only") fail("Stage type must be blueprint-only.");
if (plan.auth_flow_scope.activation_now !== false) fail("Activation must be false.");
if (plan.auth_flow_scope.next_stage !== "AG28D") fail("Next stage must be AG28D.");

for (const flag of [
  "auth_activation_allowed_in_ag28c",
  "login_runtime_creation_allowed_in_ag28c",
  "session_runtime_creation_allowed_in_ag28c",
  "route_guard_runtime_creation_allowed_in_ag28c",
  "user_account_creation_allowed_in_ag28c",
  "profile_role_table_creation_allowed_in_ag28c",
  "secret_creation_allowed_in_ag28c",
  "runtime_queue_creation_allowed_in_ag28c",
  "dynamic_publishing_allowed_in_ag28c",
  "deployment_allowed_in_ag28c",
  "publication_allowed_in_ag28c"
]) {
  if (plan[flag] !== false) fail(`${flag} must be false.`);
}
if (plan.supabase_auth_backend_deferred !== true) fail("Backend/Auth deferral must remain true.");

if (authRoleSession.status !== "auth_role_session_flow_model_created_no_auth_activation") fail("Auth role/session status mismatch.");
if (authRoleSession.auth_actors.length < 5) fail("At least five auth actors required.");
for (const actorId of ["admin", "editor", "system", "public_reader", "subscriber_future"]) {
  if (!authRoleSession.auth_actors.some((actor) => actor.actor_id === actorId)) fail(`Missing auth actor: ${actorId}`);
}
const admin = authRoleSession.auth_actors.find((actor) => actor.actor_id === "admin");
const editor = authRoleSession.auth_actors.find((actor) => actor.actor_id === "editor");
if (admin.can_publish_future_runtime !== true) fail("Admin future publish authority missing.");
if (editor.can_publish_future_runtime !== false) fail("Editor publish must be false.");
if (authRoleSession.auth_activation_allowed_now !== false) fail("Auth activation must be blocked.");
if (authRoleSession.session_runtime_created_now !== false) fail("Session runtime must be false.");

if (routeProtection.status !== "route_protection_flow_blueprint_created_no_route_guards") fail("Route protection status mismatch.");
if (routeProtection.route_groups.length < 5) fail("At least five route groups required.");
if (routeProtection.route_guard_runtime_created_now !== false) fail("Route guard runtime must be false.");
for (const groupId of ["public_routes", "admin_routes", "editor_routes", "future_subscriber_routes", "server_action_routes"]) {
  if (!routeProtection.route_groups.some((group) => group.route_group_id === groupId)) fail(`Missing route group: ${groupId}`);
}

if (lifecycle.status !== "login_session_lifecycle_plan_created_no_login_runtime") fail("Lifecycle status mismatch.");
if (lifecycle.lifecycle_steps.length < 6) fail("Lifecycle steps insufficient.");
if (lifecycle.login_runtime_created_now !== false) fail("Login runtime must be false.");
if (lifecycle.session_runtime_created_now !== false) fail("Session runtime must be false.");
if (lifecycle.auth_activation_allowed_now !== false) fail("Auth activation must be false.");

if (permissionMap.status !== "permission_checkpoint_map_created_no_runtime_checks") fail("Permission map status mismatch.");
if (permissionMap.permission_checkpoints.length < 7) fail("Permission checkpoints insufficient.");
if (permissionMap.admin_final_publish_authority !== true) fail("Admin final publish authority missing.");
if (permissionMap.editor_publish_authority !== false) fail("Editor publish authority must be false.");
if (permissionMap.runtime_permission_checks_created_now !== false) fail("Runtime permission checks must be false.");

if (guard.status !== "auth_non_activation_guard_created") fail("Auth guard status mismatch.");
for (const [k, v] of Object.entries(guard.guard_rules)) {
  if (v !== true) fail(`Guard rule must be true: ${k}`);
}
if (!String(guard.next_real_auth_gate).includes("AG34")) fail("Auth gate must include AG34.");
if (!String(guard.next_real_auth_gate).includes("AG35")) fail("Auth gate must include AG35.");

if (!consumption.future_consumption?.AG28D) fail("AG28D consumption note missing.");
if (!consumption.future_consumption?.AG28Z) fail("AG28Z consumption note missing.");
if (!consumption.future_consumption?.AG29) fail("AG29 consumption note missing.");
if (!consumption.future_consumption?.AG30) fail("AG30 consumption note missing.");

if (blocker.status !== "auth_flow_plan_runtime_operations_blocked_pending_ag28d") fail("Blocker status mismatch.");
if (readiness.ready_for_ag28d !== true) fail("AG28D readiness missing.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.login_runtime_allowed_now !== false) fail("Login runtime must be false.");
if (readiness.route_guard_runtime_allowed_now !== false) fail("Route guard runtime must be false.");
if (boundary.next_stage_id !== "AG28D") fail("Boundary must point to AG28D.");
if (boundary.activation_allowed_in_ag28d !== false) fail("AG28D activation must be false.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");

if (review.summary.auth_flow_plan_created !== true) fail("Review summary missing.");
if (review.summary.blueprint_only !== true) fail("Blueprint-only summary missing.");
if (review.summary.ready_for_ag28d !== true) fail("AG28D readiness summary missing.");
for (const flag of [
  "auth_activation_done",
  "login_runtime_created",
  "session_runtime_created",
  "route_guard_runtime_created",
  "backend_enabled",
  "auth_enabled",
  "supabase_enabled",
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

if (ag28b.status !== "database_table_plan_created_ready_for_ag28c") fail("AG28B source status mismatch.");
if (ag28bReadiness.ready_for_ag28c !== true) fail("AG28B readiness must allow AG28C.");
if (ag28aGuard.guard_rules.no_auth_activation !== true) fail("AG28A Auth guard must be true.");
if (ag27z.closure_decision.ready_for_ag28_backend_auth_architecture_blueprint !== true) fail("AG27Z must support AG28 chain.");
if (routing.role_routing_rules.admin_final_publish_authority !== true) fail("Routing must preserve Admin publish authority.");
if (routing.role_routing_rules.editor_publish_authority !== false) fail("Routing must block Editor publishing.");
if (publishControl.final_publish_authority !== "admin_only") fail("Publish control must be admin_only.");

if (registry.status !== "auth_flow_plan_created_ready_for_ag28d") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.blueprint_only !== true) fail("Preview must be blueprint-only.");
if (preview.ready_for_ag28d !== true) fail("Preview must be ready for AG28D.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth.");
if (preview.login_runtime_created !== 0) fail("Preview must record 0 login runtime.");
if (preview.session_runtime_created !== 0) fail("Preview must record 0 session runtime.");
if (preview.route_guard_runtime_created !== 0) fail("Preview must record 0 route guards.");
if (preview.database_objects !== 0) fail("Preview must record 0 database objects.");
if (preview.table_objects !== 0) fail("Preview must record 0 table objects.");
if (preview.migration_objects !== 0) fail("Preview must record 0 migration objects.");
if (preview.rls_policy_objects !== 0) fail("Preview must record 0 RLS policy objects.");
if (preview.secret_objects !== 0) fail("Preview must record 0 secrets.");
if (preview.runtime_queues !== 0) fail("Preview must record 0 runtime queues.");
if (preview.deployments !== 0) fail("Preview must record 0 deployments.");
if (preview.published_items !== 0) fail("Preview must record 0 published items.");

for (const expectedInput of [
  "data/content-intelligence/backend-architecture/ag28b-database-table-plan.json",
  "data/content-intelligence/backend-architecture/ag28b-planned-table-inventory.json",
  "data/content-intelligence/backend-architecture/ag28b-table-relationship-map.json",
  "data/content-intelligence/backend-decision/ag27c-role-auth-architecture-model.json",
  "data/content-intelligence/backend-decision/ag27d-role-access-security-matrix.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "auth_flow_plan_created") {
    if (v !== true) fail("auth_flow_plan_created must be true.");
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag28c"]) fail("Missing generate:ag28c script.");
if (!pkg.scripts?.["validate:ag28c"]) fail("Missing validate:ag28c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag28c")) fail("validate:project must include validate:ag28c.");

pass("AG28C Auth Flow Plan is present.");
pass("Auth role/session flow, route protection, lifecycle and permission checkpoints are valid.");
pass("Auth non-activation guard is valid.");
pass("AG28D Backend Architecture Audit boundary is ready.");
pass("No Supabase/Auth/backend/login/session/route guard/database/RLS/secret/runtime queue/deployment/publishing is enabled.");
