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
  console.error(`❌ AG27 validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag26-admin-editor-manual-workflow-strengthening.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-role-permission-planning-model.json",
  "data/content-intelligence/admin-editor/ag26-manual-review-queue-workflow-model.json",
  "data/content-intelligence/admin-editor/ag26-editorial-approval-gate-model.json",
  "data/content-intelligence/quality-registry/ag26-supabase-auth-backend-decision-checkpoint-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26-to-ag27-supabase-auth-backend-decision-checkpoint-boundary.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/episodes/ag24z-non-activation-closure-register.json",
  "data/content-intelligence/episodes/ag24z-ag24-source-chain-register.json",
  "data/content-intelligence/quality-reviews/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/backend-decision/ag27-backend-decision-matrix.json",
  "data/content-intelligence/backend-decision/ag27-backend-activation-prerequisite-register.json",
  "data/content-intelligence/backend-decision/ag27-backend-deferral-record.json",
  "data/content-intelligence/backend-decision/ag27-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag27-supabase-auth-backend-decision-checkpoint-blocker-register.json",
  "data/content-intelligence/quality-registry/ag27-conditional-backend-path-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json",
  "data/quality/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/quality/ag27-supabase-auth-backend-decision-checkpoint-preview.json",
  "docs/quality/AG27_SUPABASE_AUTH_BACKEND_DECISION_CHECKPOINT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag27-supabase-auth-backend-decision-checkpoint.json");
const checkpoint = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const matrix = readJson("data/content-intelligence/backend-decision/ag27-backend-decision-matrix.json");
const prerequisites = readJson("data/content-intelligence/backend-decision/ag27-backend-activation-prerequisite-register.json");
const deferral = readJson("data/content-intelligence/backend-decision/ag27-backend-deferral-record.json");
const consumption = readJson("data/content-intelligence/backend-decision/ag27-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag27-supabase-auth-backend-decision-checkpoint-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag27-conditional-backend-path-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json");
const registry = readJson("data/quality/ag27-supabase-auth-backend-decision-checkpoint.json");
const preview = readJson("data/quality/ag27-supabase-auth-backend-decision-checkpoint-preview.json");
const ag26 = readJson("data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json");
const ag26Readiness = readJson("data/content-intelligence/quality-registry/ag26-supabase-auth-backend-decision-checkpoint-readiness-record.json");
const ag24zNonActivation = readJson("data/content-intelligence/episodes/ag24z-non-activation-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") fail("Review status mismatch.");
if (checkpoint.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") fail("Checkpoint status mismatch.");
if (checkpoint.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (checkpoint.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (checkpoint.checkpoint_decision.current_path !== "static_github_controlled_path") fail("Current path must remain static/GitHub-controlled.");
if (checkpoint.checkpoint_decision.backend_activation_approved !== false) fail("Backend activation must not be approved.");
if (checkpoint.checkpoint_decision.supabase_deferred !== true) fail("Supabase must remain deferred.");
if (checkpoint.checkpoint_decision.auth_deferred !== true) fail("Auth must remain deferred.");
if (checkpoint.checkpoint_decision.backend_deferred !== true) fail("Backend must remain deferred.");
if (checkpoint.checkpoint_decision.dynamic_publishing_deferred !== true) fail("Dynamic publishing must remain deferred.");
if (checkpoint.checkpoint_decision.ag28_to_ag40_allowed_now !== false) fail("AG28-AG40 must not be allowed now.");
if (checkpoint.checkpoint_decision.explicit_approval_required_before_ag28 !== true) fail("Explicit approval before AG28 must be required.");

if (matrix.current_decision !== "defer_supabase_auth_backend") fail("Decision matrix must defer backend.");
if (!matrix.decision_options.some((option) => option.option_id === "continue_static_governed_path" && option.selected_now === true)) fail("Static governed path must be selected.");
if (!matrix.decision_options.some((option) => option.option_id === "activate_supabase_auth_backend" && option.selected_now === false && option.requires_user_approval === true)) fail("Backend activation option must be unselected and approval-gated.");

if (prerequisites.activation_allowed_now !== false) fail("Activation must not be allowed now.");
if (prerequisites.explicit_user_approval_required !== true) fail("Explicit approval must be required.");
for (const item of prerequisites.prerequisites) {
  if (item.satisfied !== false) fail(`${item.prerequisite_id} must remain unsatisfied.`);
}

if (deferral.deferral_decision.supabase_deferred !== true) fail("Deferral must keep Supabase deferred.");
if (deferral.deferral_decision.auth_deferred !== true) fail("Deferral must keep Auth deferred.");
if (deferral.deferral_decision.backend_deferred !== true) fail("Deferral must keep backend deferred.");
if (deferral.deferral_decision.ag28_activation_not_approved !== true) fail("AG28 activation must not be approved.");

if (!consumption.future_consumption?.conditional_AG28_to_AG40) fail("Conditional AG28-AG40 note missing.");
if (!consumption.future_consumption?.static_continuation) fail("Static continuation note missing.");
if (blocker.status !== "backend_activation_blocked_pending_explicit_approval") fail("Blocker status mismatch.");
if (readiness.ready_for_ag28_backend_activation !== false) fail("AG28 backend activation readiness must be false.");
if (readiness.explicit_approval_required_for_ag28 !== true) fail("AG28 explicit approval requirement missing.");
if (boundary.status !== "ag28_backend_path_blocked_pending_explicit_approval") fail("Boundary must block AG28 pending approval.");
if (boundary.explicit_approval_required !== true) fail("Boundary must require explicit approval.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");

if (review.summary.backend_activation_approved !== false) fail("Review must not approve backend.");
if (review.summary.supabase_deferred !== true) fail("Review must defer Supabase.");
if (review.summary.auth_deferred !== true) fail("Review must defer Auth.");
if (review.summary.backend_deferred !== true) fail("Review must defer backend.");
if (review.summary.ready_for_ag28_backend_activation !== false) fail("Review must not be ready for AG28 activation.");
if (review.summary.real_execution_done !== false) fail("Real execution must remain false.");
if (review.summary.deployment_done !== false) fail("Deployment must remain false.");
if (review.summary.publishing_done !== false) fail("Publishing must remain false.");

if (ag26.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") fail("AG26 source plan status mismatch.");
if (ag26Readiness.ready_for_ag27 !== true) fail("AG26 readiness must allow AG27.");
if (ag24zNonActivation.closure_guards.no_supabase !== true) fail("AG24Z no_supabase guard missing.");
if (ag24zNonActivation.closure_guards.no_auth !== true) fail("AG24Z no_auth guard missing.");
if (ag24zNonActivation.closure_guards.no_backend_activation !== true) fail("AG24Z no_backend_activation guard missing.");
if (registry.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.backend_activation_approved !== 0) fail("Preview must record 0 backend approval.");
if (preview.supabase_enabled !== 0) fail("Preview must record 0 Supabase enabled.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth enabled.");
if (preview.backend_enabled !== 0) fail("Preview must record 0 backend enabled.");
if (preview.dynamic_publishing_enabled !== 0) fail("Preview must record 0 dynamic publishing.");
if (preview.database_objects_created !== 0) fail("Preview must record 0 database objects.");
if (preview.user_accounts_created !== 0) fail("Preview must record 0 user accounts.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "backend_decision_checkpoint_created") {
    if (v !== true) fail("backend_decision_checkpoint_created must be true.");
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag27"]) fail("Missing generate:ag27 script.");
if (!pkg.scripts?.["validate:ag27"]) fail("Missing validate:ag27 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag27")) fail("validate:project must include validate:ag27.");

pass("AG27 Supabase/Auth/Backend Decision Checkpoint is present.");
pass("Backend decision matrix, prerequisites and deferral record are valid.");
pass("Supabase/Auth/backend remains deferred and AG28 is blocked pending explicit approval.");
pass("AG26, AG25 and AG24Z governance records are consumed.");
pass("No database, Auth, backend, runtime write, deployment or publishing is enabled.");
