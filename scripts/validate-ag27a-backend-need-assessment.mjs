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
  console.error(`❌ AG27A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-ag27-backend-deferral-carry-forward.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/backend-decision/ag27-backend-deferral-record.json",
  "data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",

  "data/content-intelligence/quality-reviews/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  "data/content-intelligence/backend-decision/ag27a-backend-need-signal-register.json",
  "data/content-intelligence/backend-decision/ag27a-static-vs-backend-readiness-matrix.json",
  "data/content-intelligence/backend-decision/ag27a-backend-planning-scope-register.json",
  "data/content-intelligence/backend-decision/ag27a-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag27a-backend-need-assessment-blocker-register.json",
  "data/content-intelligence/quality-registry/ag27a-backend-decision-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag27a-to-ag27b-backend-decision-audit-boundary.json",
  "data/quality/ag27a-backend-need-assessment.json",
  "data/quality/ag27a-backend-need-assessment-preview.json",
  "docs/quality/AG27A_BACKEND_NEED_ASSESSMENT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag27a-backend-need-assessment.json");
const assessment = readJson("data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json");
const signal = readJson("data/content-intelligence/backend-decision/ag27a-backend-need-signal-register.json");
const matrix = readJson("data/content-intelligence/backend-decision/ag27a-static-vs-backend-readiness-matrix.json");
const scope = readJson("data/content-intelligence/backend-decision/ag27a-backend-planning-scope-register.json");
const consumption = readJson("data/content-intelligence/backend-decision/ag27a-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag27a-backend-need-assessment-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag27a-backend-decision-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag27a-to-ag27b-backend-decision-audit-boundary.json");
const registry = readJson("data/quality/ag27a-backend-need-assessment.json");
const preview = readJson("data/quality/ag27a-backend-need-assessment-preview.json");

const ag26z = readJson("data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const ag27Boundary = readJson("data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "backend_need_assessment_created_ready_for_ag27b") fail("Review status mismatch.");
if (assessment.status !== "backend_need_assessment_created_ready_for_ag27b") fail("Assessment status mismatch.");
if (assessment.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (assessment.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (assessment.assessment_decision.backend_need_for_future_real_admin_editor_workflow !== true) fail("Future Admin/Editor backend need must be true.");
if (assessment.assessment_decision.backend_need_for_future_dynamic_publish !== true) fail("Future dynamic publish backend need must be true.");
if (assessment.assessment_decision.static_github_controlled_path_sufficient_for_current_no_runtime_stage !== true) fail("Static path must remain sufficient for current stage.");
if (assessment.assessment_decision.backend_planning_should_continue_to_ag27b !== true) fail("AG27B planning should continue.");
if (assessment.assessment_decision.backend_activation_should_start_now !== false) fail("Backend activation must not start.");
if (assessment.assessment_decision.supabase_sandbox_activation_should_start_now !== false) fail("Supabase sandbox activation must not start.");
if (assessment.assessment_decision.secrets_or_env_setup_allowed_now !== false) fail("Secrets/env setup must be blocked.");
if (assessment.assessment_decision.ag28_allowed_now !== false) fail("AG28 must remain blocked.");

for (const flag of [
  "backend_activation_allowed_in_ag27a",
  "supabase_activation_allowed_in_ag27a",
  "auth_activation_allowed_in_ag27a",
  "database_creation_allowed_in_ag27a",
  "secret_creation_allowed_in_ag27a",
  "deployment_allowed_in_ag27a",
  "public_mutation_allowed_in_ag27a"
]) {
  if (assessment[flag] !== false) fail(`${flag} must be false.`);
}
if (assessment.backend_planning_allowed_in_ag27a !== true) fail("Backend planning should be allowed in AG27A.");

if (signal.status !== "backend_need_signal_register_created_no_activation") fail("Signal register status mismatch.");
if (signal.signal_count !== signal.signals.length) fail("Signal count mismatch.");
if (signal.high_backend_relevance_count < 4) fail("At least four high backend relevance signals expected.");
if (signal.assessment_summary.backend_planning_is_now_useful !== true) fail("Backend planning usefulness missing.");
if (signal.assessment_summary.backend_activation_is_needed_now !== false) fail("Backend activation need-now must be false.");

if (matrix.status !== "static_vs_backend_matrix_created_no_activation") fail("Matrix status mismatch.");
if (matrix.conclusion.backend_need_exists_for_future_real_workflow !== true) fail("Future backend need conclusion missing.");
if (matrix.conclusion.backend_activation_required_immediately !== false) fail("Immediate activation must be false.");
if (matrix.conclusion.controlled_backend_planning_should_begin !== true) fail("Backend planning should begin.");
if (matrix.conclusion.supabase_sandbox_activation_should_wait !== true) fail("Supabase sandbox activation should wait.");

if (scope.status !== "backend_planning_scope_created_no_backend_activation") fail("Planning scope status mismatch.");
if (scope.operator_context.backend_planning_requested !== true) fail("Backend planning requested flag missing.");
if (scope.operator_context.backend_activation_requested !== false) fail("Backend activation requested must be false.");
if (!scope.explicitly_blocked_now.includes("Supabase project creation")) fail("Supabase project creation must be blocked.");
if (!scope.explicitly_blocked_now.includes("Secrets or env var writing")) fail("Secrets/env writing must be blocked.");

if (!consumption.future_consumption?.AG27B) fail("AG27B consumption note missing.");
if (!consumption.future_consumption?.AG27C) fail("AG27C consumption note missing.");
if (!consumption.future_consumption?.AG27Z) fail("AG27Z consumption note missing.");
if (!consumption.future_consumption?.AG28) fail("AG28 note missing.");

if (blocker.status !== "backend_need_assessment_operations_blocked_pending_ag27b") fail("Blocker status mismatch.");
if (readiness.ready_for_ag27b !== true) fail("AG27B readiness missing.");
if (boundary.next_stage_id !== "AG27B") fail("AG27B boundary missing.");
if (boundary.backend_activation_deferred !== true) fail("Boundary must defer backend activation.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must defer Supabase/Auth/backend.");
if (boundary.explicit_approval_required_before_activation !== true) fail("Explicit approval before activation required.");

if (review.summary.backend_need_assessment_created !== true) fail("Review summary missing.");
if (review.summary.backend_planning_should_continue_to_ag27b !== true) fail("Review must continue to AG27B.");
if (review.summary.static_path_sufficient_for_current_stage !== true) fail("Review must preserve static path sufficiency.");
if (review.summary.backend_activation_allowed_now !== false) fail("Backend activation must be false.");
if (review.summary.supabase_activation_allowed_now !== false) fail("Supabase activation must be false.");
if (review.summary.auth_activation_allowed_now !== false) fail("Auth activation must be false.");
if (review.summary.database_creation_allowed_now !== false) fail("Database creation must be false.");
if (review.summary.secret_creation_allowed_now !== false) fail("Secrets must be false.");
if (review.summary.ready_for_ag27b !== true) fail("Ready for AG27B missing.");

if (ag26z.closure_decision.ag26_detailed_chain_closed !== true) fail("AG26Z chain must be closed.");
if (ag26z.closure_decision.ag28_blocked_pending_explicit_approval !== true) fail("AG26Z must keep AG28 blocked.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");
if (ag27.checkpoint_decision.backend_activation_approved !== false) fail("AG27 backend activation must remain unapproved.");
if (ag27Boundary.explicit_approval_required !== true) fail("AG27 boundary explicit approval missing.");

if (registry.status !== "backend_need_assessment_created_ready_for_ag27b") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.backend_planning_allowed !== 1) fail("Preview must mark backend planning allowed.");
if (preview.backend_activation_allowed !== 0) fail("Preview must record 0 backend activation.");
if (preview.supabase_activation_allowed !== 0) fail("Preview must record 0 Supabase activation.");
if (preview.auth_activation_allowed !== 0) fail("Preview must record 0 Auth activation.");
if (preview.database_objects_created !== 0) fail("Preview must record 0 database objects.");
if (preview.secrets_created !== 0) fail("Preview must record 0 secrets.");
if (preview.deployment_done !== 0) fail("Preview must record 0 deployment.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  "data/content-intelligence/admin-editor/ag26z-ag27-backend-deferral-carry-forward.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/backend-decision/ag27-backend-deferral-record.json",
  "data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json"
]) {
  if (!assessment.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Assessment did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "backend_need_assessment_created" || k === "backend_planning_allowed") {
    if (v !== true) fail(`${k} must be true.`);
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag27a"]) fail("Missing generate:ag27a script.");
if (!pkg.scripts?.["validate:ag27a"]) fail("Missing validate:ag27a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag27a")) fail("validate:project must include validate:ag27a.");

pass("AG27A Backend Need Assessment is present.");
pass("Backend need signals and static-vs-backend matrix are valid.");
pass("Backend planning may continue to AG27B, but activation remains blocked.");
pass("No Supabase/Auth/backend activation, secrets, database, deployment or public mutation is enabled.");
pass("AG27B Backend Decision Audit boundary is ready.");
