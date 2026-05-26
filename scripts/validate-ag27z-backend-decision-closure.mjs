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
  console.error(`❌ AG27Z validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-auth-architecture-plan.json",
  "data/content-intelligence/backend-decision/ag27d-supabase-auth-security-rls-plan.json",
  "data/content-intelligence/backend-decision/ag27d-controlled-activation-stage-placement-plan.json",
  "data/content-intelligence/quality-registry/ag27d-backend-decision-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27d-to-ag27z-backend-decision-closure-boundary.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json",

  "data/content-intelligence/quality-reviews/ag27z-backend-decision-closure.json",
  "data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json",
  "data/content-intelligence/backend-decision/ag27z-ag27-detailed-source-chain-register.json",
  "data/content-intelligence/backend-decision/ag27z-planning-vs-activation-closure-register.json",
  "data/content-intelligence/backend-decision/ag27z-controlled-activation-handoff-plan.json",
  "data/content-intelligence/backend-decision/ag27z-ag28-boundary-control-register.json",
  "data/content-intelligence/backend-decision/ag27z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag27z-backend-decision-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag27z-backend-auth-architecture-blueprint-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27z-to-ag28-backend-auth-architecture-blueprint-boundary.json",
  "data/quality/ag27z-backend-decision-closure.json",
  "data/quality/ag27z-backend-decision-closure-preview.json",
  "docs/quality/AG27Z_BACKEND_DECISION_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag27z-backend-decision-closure.json");
const closure = readJson("data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json");
const sourceChain = readJson("data/content-intelligence/backend-decision/ag27z-ag27-detailed-source-chain-register.json");
const planningActivation = readJson("data/content-intelligence/backend-decision/ag27z-planning-vs-activation-closure-register.json");
const activationHandoff = readJson("data/content-intelligence/backend-decision/ag27z-controlled-activation-handoff-plan.json");
const ag28Control = readJson("data/content-intelligence/backend-decision/ag27z-ag28-boundary-control-register.json");
const consumption = readJson("data/content-intelligence/backend-decision/ag27z-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag27z-backend-decision-closure-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag27z-backend-auth-architecture-blueprint-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag27z-to-ag28-backend-auth-architecture-blueprint-boundary.json");
const registry = readJson("data/quality/ag27z-backend-decision-closure.json");
const preview = readJson("data/quality/ag27z-backend-decision-closure-preview.json");

const ag27c = readJson("data/content-intelligence/backend-decision/ag27c-supabase-auth-architecture-plan.json");
const ag27d = readJson("data/content-intelligence/backend-decision/ag27d-supabase-auth-security-rls-plan.json");
const ag27dActivation = readJson("data/content-intelligence/backend-decision/ag27d-controlled-activation-stage-placement-plan.json");
const ag27dReadiness = readJson("data/content-intelligence/quality-registry/ag27d-backend-decision-closure-readiness-record.json");
const existingAg27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const routing = readJson("data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json");
const publishControl = readJson("data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json");
const pkg = readJson("package.json");

if (review.status !== "backend_decision_closed_planning_approved_activation_deferred_ready_for_ag28") fail("Review status mismatch.");
if (closure.status !== "backend_decision_closed_planning_approved_activation_deferred_ready_for_ag28") fail("Closure status mismatch.");
if (closure.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (closure.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (closure.closure_decision.ag27_detailed_chain_closed !== true) fail("AG27 detailed chain must be closed.");
if (closure.closure_decision.detailed_stages_closed !== 5) fail("Detailed stages closed must be 5.");
if (closure.closure_decision.backend_planning_approved_and_completed !== true) fail("Backend planning must be complete.");
if (closure.closure_decision.supabase_auth_architecture_planned !== true) fail("Architecture planning missing.");
if (closure.closure_decision.supabase_auth_security_rls_planned !== true) fail("Security/RLS planning missing.");
if (closure.closure_decision.controlled_activation_stage_placement_created !== true) fail("Activation placement missing.");
if (closure.closure_decision.ready_for_ag28_backend_auth_architecture_blueprint !== true) fail("AG28 readiness missing.");
for (const flag of [
  "backend_activation_ready_now",
  "auth_activation_ready_now",
  "supabase_activation_ready_now",
  "runtime_queue_ready_now",
  "dynamic_publishing_ready_now",
  "deployment_ready_now",
  "publication_ready_now"
]) {
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}
if (closure.supabase_auth_backend_deferred !== true) fail("Backend deferral must remain true.");

if (sourceChain.chain_length !== 5) fail("AG27 source chain must contain 5 entries.");
for (const stage of ["AG27_EXISTING", "AG27A", "AG27B", "AG27C", "AG27D"]) {
  if (!sourceChain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage: ${stage}`);
}

if (planningActivation.status !== "backend_planning_closed_activation_deferred") fail("Planning/activation status mismatch.");
if (planningActivation.closure_position.backend_planning_approved_and_completed !== true) fail("Planning must be complete.");
if (planningActivation.closure_position.backend_activation_approved_now !== false) fail("Backend activation must be false.");
if (planningActivation.closure_position.auth_activation_approved_now !== false) fail("Auth activation must be false.");
if (planningActivation.closure_position.supabase_project_creation_approved_now !== false) fail("Supabase project creation must be false.");
if (planningActivation.closure_position.rls_policy_creation_or_apply_approved_now !== false) fail("RLS creation/apply must be false.");
if (planningActivation.closure_position.secret_creation_approved_now !== false) fail("Secret creation must be false.");

if (activationHandoff.status !== "controlled_activation_handoff_created_for_ag28_ag29") fail("Activation handoff status mismatch.");
if (activationHandoff.activation_not_allowed_in_ag27z !== true) fail("Activation must not be allowed in AG27Z.");
if (!activationHandoff.recommended_future_activation_path.some((item) => item.stage_id === "AG28" && item.activation_status === "blueprint_only")) fail("AG28 blueprint-only handoff missing.");
if (!activationHandoff.recommended_future_activation_path.some((item) => item.stage_id === "AG29")) fail("AG29 controlled activation audit handoff missing.");

if (ag28Control.status !== "ag28_blueprint_allowed_runtime_activation_blocked") fail("AG28 boundary control status mismatch.");
if (ag28Control.controlled_activation_moves_to_later_stage !== true) fail("Controlled activation must move to later stage.");
if (!ag28Control.ag28_scope_blocked.some((item) => item.includes("No Supabase project activation"))) fail("AG28 Supabase activation block missing.");

if (!consumption.future_consumption?.AG28) fail("AG28 consumption note missing.");
if (!consumption.future_consumption?.AG29) fail("AG29 consumption note missing.");
if (!consumption.future_consumption?.AG30) fail("AG30 consumption note missing.");
if (!consumption.future_consumption?.AG31_plus) fail("AG31+ consumption note missing.");

if (blocker.status !== "backend_decision_closure_runtime_operations_blocked_pending_ag28") fail("Blocker status mismatch.");
if (readiness.ready_for_ag28 !== true) fail("AG28 readiness missing.");
if (readiness.ag28_blueprint_allowed !== true) fail("AG28 blueprint allowed missing.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (readiness.supabase_activation_allowed_now !== false) fail("Supabase activation must be false.");
if (readiness.dynamic_publishing_allowed_now !== false) fail("Dynamic publishing must be false.");
if (boundary.next_stage_id !== "AG28") fail("Boundary must point to AG28.");
if (boundary.activation_allowed_in_ag28 !== false) fail("AG28 activation must be false.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");
if (!String(boundary.controlled_activation_later_stage).includes("AG29")) fail("Controlled activation later stage must include AG29.");

if (review.summary.backend_decision_closure_created !== true) fail("Review summary missing.");
if (review.summary.ag27_detailed_chain_closed !== true) fail("AG27 detailed chain summary missing.");
if (review.summary.detailed_stages_closed !== 5) fail("Review must record 5 stages.");
if (review.summary.backend_planning_approved_and_completed !== true) fail("Planning complete summary missing.");
if (review.summary.runtime_activation_deferred !== true) fail("Runtime activation deferral summary missing.");
if (review.summary.controlled_activation_handoff_created !== true) fail("Controlled activation handoff summary missing.");
if (review.summary.ready_for_ag28 !== true) fail("AG28 readiness summary missing.");
if (review.summary.ag28_blueprint_only !== true) fail("AG28 blueprint-only summary missing.");
for (const flag of [
  "backend_activation_allowed_now",
  "auth_activation_allowed_now",
  "supabase_activation_allowed_now",
  "dynamic_publishing_allowed_now",
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
  "deployment_done",
  "publishing_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must remain false.`);
}

if (ag27c.status !== "supabase_auth_architecture_plan_created_ready_for_ag27d") fail("AG27C source status mismatch.");
if (ag27d.status !== "supabase_auth_security_rls_plan_created_ready_for_ag27z") fail("AG27D source status mismatch.");
if (ag27dActivation.activation_allowed_now !== false) fail("AG27D activation must remain false.");
if (ag27dReadiness.ready_for_ag27z !== true) fail("AG27D readiness must allow AG27Z.");
if (existingAg27.checkpoint_decision.backend_deferred !== true) fail("Existing AG27 backend deferral must remain true.");
if (routing.role_routing_rules.admin_final_publish_authority !== true) fail("Routing must preserve Admin publish authority.");
if (routing.role_routing_rules.editor_publish_authority !== false) fail("Routing must block Editor publishing.");
if (publishControl.final_publish_authority !== "admin_only") fail("Publish control must be admin_only.");

if (registry.status !== "backend_decision_closed_planning_approved_activation_deferred_ready_for_ag28") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.backend_planning_approved_and_completed !== true) fail("Preview planning completion missing.");
if (preview.activation_deferred !== true) fail("Preview activation deferral missing.");
if (preview.ready_for_ag28 !== true) fail("Preview AG28 readiness missing.");
if (preview.ag28_blueprint_only !== true) fail("Preview AG28 blueprint-only missing.");
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
  "data/content-intelligence/backend-decision/ag27c-supabase-auth-architecture-plan.json",
  "data/content-intelligence/backend-decision/ag27d-supabase-auth-security-rls-plan.json",
  "data/content-intelligence/backend-decision/ag27d-controlled-activation-stage-placement-plan.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json"
]) {
  if (!closure.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Closure did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (["ag27_detailed_chain_closed", "backend_planning_approved", "controlled_activation_handoff_created"].includes(k)) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag27z"]) fail("Missing generate:ag27z script.");
if (!pkg.scripts?.["validate:ag27z"]) fail("Missing validate:ag27z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag27z")) fail("validate:project must include validate:ag27z.");

pass("AG27Z Backend Decision Closure is present.");
pass("AG27 existing/AG27A/AG27B/AG27C/AG27D detailed chain is closed.");
pass("Supabase/Auth planning is complete while runtime activation remains deferred.");
pass("Controlled activation handoff is created for AG28/AG29 path.");
pass("AG28 Backend/Auth Architecture Blueprint boundary is ready as blueprint-only.");
pass("No Supabase/Auth/backend/database/table/migration/RLS/secret/runtime queue/deployment/publishing is enabled.");
