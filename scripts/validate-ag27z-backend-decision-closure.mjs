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
  "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-auth-security-rls-plan.json",
  "data/content-intelligence/backend-decision/ag27d-conditional-security-rls-detail-plan.json",
  "data/content-intelligence/backend-decision/ag27d-non-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag27d-backend-decision-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27d-to-ag27z-backend-decision-closure-boundary.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/backend-decision/ag27-backend-deferral-record.json",
  "data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json",

  "data/content-intelligence/quality-reviews/ag27z-backend-decision-closure.json",
  "data/content-intelligence/backend-decision/ag27z-backend-decision-closure.json",
  "data/content-intelligence/backend-decision/ag27z-ag27-detailed-source-chain-register.json",
  "data/content-intelligence/backend-decision/ag27z-non-active-backend-planning-closure-register.json",
  "data/content-intelligence/backend-decision/ag27z-backend-activation-deferral-register.json",
  "data/content-intelligence/backend-decision/ag27z-ag28-non-active-architecture-handoff-plan.json",
  "data/content-intelligence/backend-decision/ag27z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag27z-backend-decision-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag27z-ag28-backend-architecture-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27z-to-ag28-backend-architecture-boundary.json",
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
const planningClosure = readJson("data/content-intelligence/backend-decision/ag27z-non-active-backend-planning-closure-register.json");
const activationDeferral = readJson("data/content-intelligence/backend-decision/ag27z-backend-activation-deferral-register.json");
const ag28Handoff = readJson("data/content-intelligence/backend-decision/ag27z-ag28-non-active-architecture-handoff-plan.json");
const consumption = readJson("data/content-intelligence/backend-decision/ag27z-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag27z-backend-decision-closure-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag27z-ag28-backend-architecture-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag27z-to-ag28-backend-architecture-boundary.json");
const registry = readJson("data/quality/ag27z-backend-decision-closure.json");
const preview = readJson("data/quality/ag27z-backend-decision-closure-preview.json");

const ag27d = readJson("data/content-intelligence/backend-decision/ag27d-conditional-security-rls-detail-plan.json");
const ag27dReadiness = readJson("data/content-intelligence/quality-registry/ag27d-backend-decision-closure-readiness-record.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "backend_decision_closed_non_active_architecture_ready_for_ag28") fail("Review status mismatch.");
if (closure.status !== "backend_decision_closed_non_active_architecture_ready_for_ag28") fail("Closure status mismatch.");
if (closure.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (closure.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (closure.closure_decision.ag27_detailed_chain_closed !== true) fail("AG27 detailed chain must be closed.");
if (closure.closure_decision.backend_need_confirmed !== true) fail("Backend need confirmation missing.");
if (closure.closure_decision.non_active_supabase_auth_backend_planning_approved !== true) fail("Non-active backend planning must be approved.");
if (closure.closure_decision.backend_architecture_planning_ready_for_ag28 !== true) fail("AG28 architecture readiness missing.");
if (closure.closure_decision.ag28_allowed_for_non_active_architecture_only !== true) fail("AG28 must be non-active architecture only.");

for (const flag of [
  "backend_activation_approved",
  "supabase_activation_approved",
  "auth_activation_approved",
  "database_creation_approved",
  "rls_policy_application_approved",
  "secrets_or_env_setup_approved",
  "deployment_approved",
  "public_mutation_approved"
]) {
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (sourceChain.chain_length !== 4) fail("Source chain length must be 4.");
for (const stage of ["AG27A", "AG27B", "AG27C", "AG27D"]) {
  if (!sourceChain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage ${stage}.`);
}

if (planningClosure.status !== "non_active_backend_planning_closed_ready_for_ag28_architecture") fail("Planning closure status mismatch.");
if (planningClosure.closure_points.backend_architecture_planning_can_continue_to_ag28 !== true) fail("AG28 architecture planning readiness missing.");
if (planningClosure.closure_points.real_activation_still_blocked !== true) fail("Real activation must remain blocked.");

if (activationDeferral.status !== "backend_activation_deferred_after_ag27_closure") fail("Activation deferral status mismatch.");
for (const [key, value] of Object.entries(activationDeferral.deferral_decision)) {
  if (value !== false) fail(`${key} must be false.`);
}
if (activationDeferral.future_activation_requirements.length < 6) fail("Future activation requirements incomplete.");

if (ag28Handoff.status !== "ag28_non_active_architecture_handoff_created") fail("AG28 handoff status mismatch.");
if (ag28Handoff.ag28_ready !== true) fail("AG28 handoff readiness missing.");
if (ag28Handoff.ag28_activation_allowed !== false) fail("AG28 activation must be false.");
if (!ag28Handoff.ag28_allowed_scope.includes("Create backend/Auth architecture blueprint.")) fail("AG28 blueprint scope missing.");
if (!ag28Handoff.ag28_blocked_scope.includes("No Supabase project creation.")) fail("AG28 Supabase project blocker missing.");

if (!consumption.future_consumption?.AG28) fail("AG28 consumption note missing.");
if (!consumption.future_consumption?.AG29_to_AG34) fail("AG29-AG34 note missing.");
if (!consumption.future_consumption?.AG35_and_later) fail("AG35/later note missing.");
if (!consumption.future_consumption?.static_path) fail("Static path note missing.");

if (blocker.status !== "backend_decision_closed_runtime_operations_blocked") fail("Blocker status mismatch.");
if (readiness.status !== "ready_for_ag28_non_active_backend_architecture_blueprint") fail("Readiness status mismatch.");
if (readiness.ready_for_ag28 !== true) fail("AG28 readiness missing.");
if (readiness.allowed_ag28_mode !== "non_active_architecture_blueprint_only") fail("AG28 mode must be non-active architecture only.");
if (readiness.real_execution_allowed_now !== false) fail("Real execution must be false.");
if (readiness.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (readiness.supabase_auth_backend_activation_allowed_now !== false) fail("Supabase/Auth/backend activation must be false.");

if (boundary.status !== "ag28_boundary_created_non_active_architecture_only") fail("Boundary status mismatch.");
if (boundary.next_stage_id !== "AG28") fail("Boundary must point to AG28.");
if (boundary.backend_planning_selected !== true) fail("Backend planning must be selected.");
if (boundary.backend_activation_deferred !== true) fail("Backend activation must be deferred.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred.");
if (boundary.explicit_approval_required_before_real_activation !== true) fail("Explicit approval before real activation required.");

if (review.summary.backend_decision_closure_created !== true) fail("Review summary missing.");
if (review.summary.ag27_detailed_chain_closed !== true) fail("AG27 chain closure summary missing.");
if (review.summary.detailed_stages_closed !== 4) fail("Detailed stages closed must be 4.");
if (review.summary.non_active_backend_planning_approved !== true) fail("Non-active planning summary missing.");
if (review.summary.ready_for_ag28_non_active_architecture !== true) fail("AG28 readiness summary missing.");

for (const flag of [
  "backend_activation_allowed_now",
  "supabase_activation_allowed_now",
  "auth_activation_allowed_now",
  "sql_generation_allowed_now",
  "migration_generation_allowed_now",
  "database_creation_allowed_now",
  "rls_policy_application_allowed_now",
  "secret_creation_allowed_now",
  "env_var_write_allowed_now",
  "server_route_creation_allowed_now",
  "deployment_done",
  "public_mutation_done",
  "backend_activation_done",
  "real_execution_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must be false.`);
}

if (ag27d.status !== "conditional_security_rls_detail_plan_created_ready_for_ag27z") fail("AG27D source status mismatch.");
if (ag27dReadiness.ready_for_ag27z !== true) fail("AG27D readiness must allow AG27Z.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("Original AG27 backend deferral must remain true.");
if (ag27.checkpoint_decision.backend_activation_approved !== false) fail("Original AG27 activation must remain unapproved.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only rule missing.");
if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");

if (registry.status !== "backend_decision_closed_non_active_architecture_ready_for_ag28") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.ag27_detailed_chain_closed !== 1) fail("Preview must mark AG27 chain closed.");
if (preview.ready_for_ag28_non_active_architecture !== 1) fail("Preview must mark AG28 readiness.");
if (preview.backend_activation_allowed !== 0) fail("Preview must record 0 backend activation.");
if (preview.supabase_activation_allowed !== 0) fail("Preview must record 0 Supabase activation.");
if (preview.auth_activation_allowed !== 0) fail("Preview must record 0 Auth activation.");
if (preview.sql_generated !== 0) fail("Preview must record 0 SQL.");
if (preview.migrations_generated !== 0) fail("Preview must record 0 migrations.");
if (preview.database_objects_created !== 0) fail("Preview must record 0 database objects.");
if (preview.rls_policies_applied !== 0) fail("Preview must record 0 RLS policies.");
if (preview.secrets_created !== 0) fail("Preview must record 0 secrets.");
if (preview.env_vars_written !== 0) fail("Preview must record 0 env writes.");
if (preview.deployment_done !== 0) fail("Preview must record 0 deployment.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  "data/content-intelligence/backend-decision/ag27c-supabase-auth-security-rls-plan.json",
  "data/content-intelligence/backend-decision/ag27d-conditional-security-rls-detail-plan.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
]) {
  if (!closure.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Closure did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (
    k === "backend_decision_closure_created" ||
    k === "ag27_detailed_chain_closed" ||
    k === "non_active_backend_planning_closed" ||
    k === "ag28_non_active_architecture_allowed"
  ) {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag27z"]) fail("Missing generate:ag27z script.");
if (!pkg.scripts?.["validate:ag27z"]) fail("Missing validate:ag27z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag27z")) fail("validate:project must include validate:ag27z.");

pass("AG27Z Backend Decision Closure is present.");
pass("AG27A-AG27D detailed backend decision chain is closed.");
pass("Non-active Supabase/Auth/backend planning is approved for AG28 architecture blueprint.");
pass("Real backend/Auth/Supabase activation, SQL, database, secrets, deployment and public mutation remain blocked.");
pass("AG28 Backend/Auth Architecture Blueprint boundary is ready.");
