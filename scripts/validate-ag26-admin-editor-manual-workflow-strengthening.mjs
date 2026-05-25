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
  console.error(`❌ AG26 validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag25-featured-reads-production-strengthening.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-source-reference-gate-model.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-production-control-model.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-quality-strengthening-model.json",
  "data/content-intelligence/quality-registry/ag25-admin-editor-manual-workflow-strengthening-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag25-to-ag26-admin-editor-manual-workflow-strengthening-boundary.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/episodes/ag24z-ag24-source-chain-register.json",
  "data/content-intelligence/episodes/ag24i-episode-quality-audit-plan.json",
  "data/content-intelligence/episodes/ag24h-episode-production-conveyor.json",
  "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  "data/content-intelligence/quality-reviews/ag26-admin-editor-manual-workflow-strengthening.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-role-permission-planning-model.json",
  "data/content-intelligence/admin-editor/ag26-manual-review-queue-workflow-model.json",
  "data/content-intelligence/admin-editor/ag26-editorial-approval-gate-model.json",
  "data/content-intelligence/admin-editor/ag26-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag26-admin-editor-manual-workflow-strengthening-blocker-register.json",
  "data/content-intelligence/quality-registry/ag26-supabase-auth-backend-decision-checkpoint-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag26-to-ag27-supabase-auth-backend-decision-checkpoint-boundary.json",
  "data/quality/ag26-admin-editor-manual-workflow-strengthening.json",
  "data/quality/ag26-admin-editor-manual-workflow-strengthening-preview.json",
  "docs/quality/AG26_ADMIN_EDITOR_MANUAL_WORKFLOW_STRENGTHENING.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag26-admin-editor-manual-workflow-strengthening.json");
const plan = readJson("data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json");
const roleModel = readJson("data/content-intelligence/admin-editor/ag26-admin-editor-role-permission-planning-model.json");
const manualQueue = readJson("data/content-intelligence/admin-editor/ag26-manual-review-queue-workflow-model.json");
const approvalGate = readJson("data/content-intelligence/admin-editor/ag26-editorial-approval-gate-model.json");
const consumption = readJson("data/content-intelligence/admin-editor/ag26-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag26-admin-editor-manual-workflow-strengthening-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag26-supabase-auth-backend-decision-checkpoint-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag26-to-ag27-supabase-auth-backend-decision-checkpoint-boundary.json");
const registry = readJson("data/quality/ag26-admin-editor-manual-workflow-strengthening.json");
const preview = readJson("data/quality/ag26-admin-editor-manual-workflow-strengthening-preview.json");
const ag25 = readJson("data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json");
const ag25Readiness = readJson("data/content-intelligence/quality-registry/ag25-admin-editor-manual-workflow-strengthening-readiness-record.json");
const pkg = readJson("package.json");

if (review.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") fail("Review status mismatch.");
if (plan.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.strengthening_scope.next_stage !== "AG27") fail("Next stage must be AG27.");
if (plan.admin_login_creation_allowed_in_ag26 !== false) fail("Admin login creation must be blocked.");
if (plan.editor_login_creation_allowed_in_ag26 !== false) fail("Editor login creation must be blocked.");
if (plan.auth_activation_allowed_in_ag26 !== false) fail("Auth activation must be blocked.");
if (plan.backend_activation_allowed_in_ag26 !== false) fail("Backend activation must be blocked.");
if (plan.queue_mutation_allowed_in_ag26 !== false) fail("Queue mutation must be blocked.");
if (plan.publication_allowed_in_ag26 !== false) fail("Publication must be blocked.");
if (plan.deployment_allowed_in_ag26 !== false) fail("Deployment must be blocked.");
if (plan.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (roleModel.role_model_type !== "planning_only_no_accounts_no_login") fail("Role model must be planning-only.");
if (roleModel.roles.length < 5) fail("At least five planning roles must be present.");
if (roleModel.permissions_runtime_enabled !== false) fail("Runtime permissions must be disabled.");
if (roleModel.auth_activation_allowed_in_ag26 !== false) fail("Auth must not be activated in role model.");
for (const role of roleModel.roles) {
  if (role.runtime_account_created !== false) fail(`${role.role_id} must not create runtime account.`);
  if (role.login_enabled !== false) fail(`${role.role_id} login must be disabled.`);
}

if (manualQueue.step_count !== 8) fail("Manual queue workflow must contain 8 steps.");
if (manualQueue.review_queue_runtime_created !== false) fail("Runtime review queue must not be created.");
if (manualQueue.admin_queue_mutation_allowed !== false) fail("Admin queue mutation must be blocked.");
if (manualQueue.editor_queue_mutation_allowed !== false) fail("Editor queue mutation must be blocked.");
for (const step of manualQueue.steps) {
  if (step.runtime_execution_status !== "planned_not_executed") fail(`${step.step_id} must remain planned_not_executed.`);
}

if (approvalGate.publish_approval_enabled_in_ag26 !== false) fail("Publish approval must be disabled.");
if (approvalGate.deployment_approval_enabled_in_ag26 !== false) fail("Deployment approval must be disabled.");
if (approvalGate.github_write_enabled_in_ag26 !== false) fail("GitHub write must be disabled.");
if (approvalGate.backend_activation_enabled_in_ag26 !== false) fail("Backend activation must be disabled.");
if (!approvalGate.required_manual_gates.includes("source/reference gate")) fail("Source/reference gate missing.");

if (!consumption.future_consumption?.AG27) fail("AG27 consumption note missing.");
if (!consumption.future_consumption?.AG28_to_AG40) fail("AG28-AG40 conditional backend note missing.");
if (!consumption.future_consumption?.future_static_path) fail("Future static path note missing.");
if (blocker.status !== "admin_editor_manual_workflow_operations_blocked_pending_ag27") fail("Blocker status mismatch.");
if (readiness.ready_for_ag27 !== true) fail("AG27 readiness missing.");
if (boundary.next_stage_id !== "AG27") fail("AG27 boundary missing.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep Supabase/Auth/backend deferred.");

if (review.summary.ready_for_ag27 !== true) fail("AG27 readiness summary missing.");
if (review.summary.admin_login_created !== false) fail("Admin login must remain false.");
if (review.summary.editor_login_created !== false) fail("Editor login must remain false.");
if (review.summary.auth_enabled !== false) fail("Auth must remain false.");
if (review.summary.backend_enabled !== false) fail("Backend must remain false.");
if (review.summary.supabase_enabled !== false) fail("Supabase must remain false.");
if (review.summary.queue_mutation_done !== false) fail("Queue mutation must remain false.");
if (review.summary.featured_read_generation_done !== false) fail("Featured Read generation must remain false.");
if (review.summary.article_file_creation_done !== false) fail("Article file creation must remain false.");
if (review.summary.public_mutation_done !== false) fail("Public mutation must remain false.");
if (review.summary.deployment_done !== false) fail("Deployment must remain false.");
if (review.summary.publishing_done !== false) fail("Publishing must remain false.");

if (ag25.status !== "featured_reads_production_strengthening_created_ready_for_ag26") fail("AG25 source plan status mismatch.");
if (ag25Readiness.ready_for_ag26 !== true) fail("AG25 readiness must allow AG26.");
if (registry.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.admin_logins_created !== 0) fail("Preview must record 0 Admin logins.");
if (preview.editor_logins_created !== 0) fail("Preview must record 0 Editor logins.");
if (preview.auth_enabled !== 0) fail("Preview must record 0 Auth enabled.");
if (preview.backend_enabled !== 0) fail("Preview must record 0 backend enabled.");
if (preview.queue_mutations !== 0) fail("Preview must record 0 queue mutations.");
if (preview.generated_articles !== 0) fail("Preview must record 0 generated articles.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-source-reference-gate-model.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-production-control-model.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-quality-strengthening-model.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/episodes/ag24z-ag24-source-chain-register.json",
  "data/content-intelligence/episodes/ag24i-episode-quality-audit-plan.json",
  "data/content-intelligence/episodes/ag24h-episode-production-conveyor.json",
  "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag26"]) fail("Missing generate:ag26 script.");
if (!pkg.scripts?.["validate:ag26"]) fail("Missing validate:ag26 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag26")) fail("validate:project must include validate:ag26.");

pass("AG26 Admin/Editor Manual Workflow Strengthening is present.");
pass("Role planning, manual review workflow and approval gate models are valid.");
pass("AG25, AG24Z and AG24 governance records are consumed.");
pass("AG27 Supabase/Auth/Backend Decision Checkpoint boundary is ready.");
pass("No accounts, Auth, backend, queue mutation, GitHub write, deployment or publishing is enabled.");
