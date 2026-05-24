import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag14a-admin-editor-login-role-credential-architecture.json",
  "data/content-intelligence/quality-reviews/ag14b-admin-editor-login-ui-scaffold.json",
  "data/content-intelligence/quality-reviews/ag14c-admin-editor-ui-scaffold-route-separation-audit.json",
  "data/content-intelligence/quality-reviews/ag14d-public-signin-internal-admin-route-separation-apply.json",
  "data/content-intelligence/quality-reviews/ag14e-admin-editor-decision-submission-workflow-model.json",
  "data/content-intelligence/quality-reviews/ag14f-workflow-model-audit-secure-action-handler-readiness.json",
  "data/content-intelligence/quality-reviews/ag14g-secure-action-handler-architecture-plan.json",
  "data/content-intelligence/quality-reviews/ag14h-secure-action-handler-architecture-audit-readiness.json",
  "data/content-intelligence/quality-reviews/ag14i-secure-action-handler-non-active-implementation-scaffold.json",
  "data/content-intelligence/quality-reviews/ag14j-secure-action-handler-non-active-scaffold-audit-closure.json",
  "data/content-intelligence/audit-records/ag14j-non-active-scaffold-audit-report.json",
  "data/content-intelligence/closure-records/ag14j-secure-action-handler-non-active-scaffold-closure.json",
  "data/content-intelligence/quality-registry/ag14j-ag14z-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14j-to-ag14z-admin-editor-secure-handler-chain-closure-boundary.json",

  "data/content-intelligence/quality-reviews/ag14z-admin-editor-secure-handler-chain-closure.json",
  "data/content-intelligence/closure-records/ag14z-admin-editor-secure-handler-chain-closure.json",
  "data/content-intelligence/admin-architecture/ag14z-admin-editor-chain-completion-summary.json",
  "data/content-intelligence/quality-registry/ag14z-live-implementation-blocked-register.json",
  "data/content-intelligence/quality-registry/ag14z-next-path-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14z-to-ag15a-next-path-decision-boundary.json",
  "data/content-intelligence/schema/admin-editor-secure-handler-chain-closure.schema.json",
  "data/content-intelligence/learning/ag14z-admin-editor-secure-handler-chain-closure-learning.json",
  "data/quality/ag14z-admin-editor-secure-handler-chain-closure.json",
  "data/quality/ag14z-admin-editor-secure-handler-chain-closure-preview.json",
  "docs/quality/AG14Z_ADMIN_EDITOR_SECURE_HANDLER_CHAIN_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG14Z validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag14jReview = readJson("data/content-intelligence/quality-reviews/ag14j-secure-action-handler-non-active-scaffold-audit-closure.json");
const ag14jAudit = readJson("data/content-intelligence/audit-records/ag14j-non-active-scaffold-audit-report.json");
const ag14jReadiness = readJson("data/content-intelligence/quality-registry/ag14j-ag14z-closure-readiness-record.json");
const ag14jBoundary = readJson("data/content-intelligence/mutation-plans/ag14j-to-ag14z-admin-editor-secure-handler-chain-closure-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag14z-admin-editor-secure-handler-chain-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag14z-admin-editor-secure-handler-chain-closure.json");
const summary = readJson("data/content-intelligence/admin-architecture/ag14z-admin-editor-chain-completion-summary.json");
const blocked = readJson("data/content-intelligence/quality-registry/ag14z-live-implementation-blocked-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag14z-next-path-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag14z-to-ag15a-next-path-decision-boundary.json");
const schema = readJson("data/content-intelligence/schema/admin-editor-secure-handler-chain-closure.schema.json");
const learning = readJson("data/content-intelligence/learning/ag14z-admin-editor-secure-handler-chain-closure-learning.json");
const registry = readJson("data/quality/ag14z-admin-editor-secure-handler-chain-closure.json");
const preview = readJson("data/quality/ag14z-admin-editor-secure-handler-chain-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG14Z_ADMIN_EDITOR_SECURE_HANDLER_CHAIN_CLOSURE.md"), "utf8");

for (const obj of [review, closure, summary, blocked, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG14Z") fail(`module_id must be AG14Z in ${obj.title || "object"}`);
}

if (ag14jReview.status !== "non_active_scaffold_audit_passed_chain_ready_for_ag14z_closure") fail("AG14J review status mismatch");
if (ag14jAudit.failed_checks.length !== 0) fail("AG14J failed checks must be zero");
if (ag14jReadiness.ready_for_ag14z !== true) fail("AG14J readiness missing");
if (ag14jBoundary.next_stage_id !== "AG14Z") fail("AG14Z boundary missing in AG14J");

if (review.status !== "admin_editor_secure_handler_chain_closed_future_live_implementation_blocked") fail("Review status mismatch");
if (closure.status !== "admin_editor_secure_handler_chain_closed_future_live_implementation_blocked") fail("Closure status mismatch");
if (summary.status !== "ag14_admin_editor_secure_handler_chain_completed") fail("Summary status mismatch");
if (blocked.status !== "live_admin_editor_implementation_remains_blocked") fail("Blocked register status mismatch");
if (readiness.status !== "ready_for_ag15a_next_path_decision") fail("Readiness status mismatch");

if (summary.completed_stage_count !== 10) fail("AG14Z must summarise ten AG14 stages");
for (const stage of ["AG14A","AG14B","AG14C","AG14D","AG14E","AG14F","AG14G","AG14H","AG14I","AG14J"]) {
  if (!summary.completed_stages.some((item) => item.stage_id === stage)) fail(`Missing completed stage ${stage}`);
}

if (summary.operational_state_after_ag14.real_login_active !== false) fail("Real login must remain inactive");
if (summary.operational_state_after_ag14.real_action_execution_active !== false) fail("Real action execution must remain inactive");
if (summary.operational_state_after_ag14.public_publish_execution_active !== false) fail("Public publish execution must remain inactive");

for (const item of [
  "Real credentials.",
  "Real login/Auth.",
  "Supabase activation.",
  "GitHub write token wiring.",
  "Active action handler endpoint.",
  "Admin action execution.",
  "Editor action execution.",
  "Queue mutation.",
  "Article mutation.",
  "Public visibility switch.",
  "Publishing operation."
]) {
  if (!blocked.final_ag14_blocked_items.includes(item)) fail(`Blocked item missing: ${item}`);
}

if (readiness.ready_for_ag15a !== true) fail("AG15A readiness missing");
if (readiness.live_implementation_ready !== false) fail("Live implementation must remain blocked");
if (readiness.action_execution_ready !== false) fail("Action execution must remain blocked");
if (readiness.real_auth_ready !== false) fail("Real Auth must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (closure.final_decision.ag14_chain_closed !== true) fail("AG14 chain must be closed");
if (closure.final_decision.future_live_implementation_blocked !== true) fail("Future live implementation must be blocked");
if (closure.final_decision.public_publishing_from_admin_enabled !== false) fail("Admin public publishing must not be enabled");

if (boundary.status !== "ag15a_boundary_created_not_started") fail("AG15A boundary status mismatch");
if (boundary.next_stage_id !== "AG15A") fail("AG15A handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG15A explicit approval missing");

if (schema.status !== "schema_admin_editor_secure_handler_chain_closure_only") fail("Schema status mismatch");

for (const key of [
  "chain_closure_allowed_in_ag14z",
  "completion_summary_allowed_in_ag14z",
  "blocked_register_allowed_in_ag14z",
  "next_path_boundary_allowed_in_ag14z"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "real_credential_creation_allowed_in_ag14z",
  "hardcoded_password_allowed_in_ag14z",
  "password_hash_commit_allowed_in_ag14z",
  "auth_activation_allowed_in_ag14z",
  "backend_activation_allowed_in_ag14z",
  "supabase_activation_allowed_in_ag14z",
  "database_write_allowed_in_ag14z",
  "github_token_creation_or_exposure_allowed_in_ag14z",
  "github_write_operation_allowed_in_ag14z",
  "active_action_handler_creation_allowed_in_ag14z",
  "api_endpoint_creation_allowed_in_ag14z",
  "serverless_function_creation_allowed_in_ag14z",
  "admin_action_execution_allowed_in_ag14z",
  "editor_action_execution_allowed_in_ag14z",
  "article_mutation_allowed_in_ag14z",
  "queue_mutation_allowed_in_ag14z",
  "audit_write_allowed_in_ag14z",
  "public_visibility_switch_allowed_in_ag14z",
  "public_publishing_operation_allowed_in_ag14z",
  "deployment_trigger_allowed_in_ag14z"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, closure, summary, blocked, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.admin_editor_secure_handler_chain_closure_only !== true) fail(`${obj.title || "object"} must be AG14Z closure only`);
  if (obj.real_credential_created_in_ag14z !== false) fail(`${obj.title || "object"} must not create credentials`);
  if (obj.auth_activation_performed_in_ag14z !== false) fail(`${obj.title || "object"} must not activate Auth`);
  if (obj.backend_activation_performed_in_ag14z !== false) fail(`${obj.title || "object"} must not activate backend`);
  if (obj.supabase_activation_performed_in_ag14z !== false) fail(`${obj.title || "object"} must not activate Supabase`);
  if (obj.github_write_operation_performed_in_ag14z !== false) fail(`${obj.title || "object"} must not perform GitHub write`);
  if (obj.active_action_handler_created_in_ag14z !== false) fail(`${obj.title || "object"} must not create active handler`);
  if (obj.admin_action_execution_performed_in_ag14z !== false) fail(`${obj.title || "object"} must not execute Admin action`);
  if (obj.editor_action_execution_performed_in_ag14z !== false) fail(`${obj.title || "object"} must not execute Editor action`);
  if (obj.article_mutation_performed_in_ag14z !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.queue_mutation_performed_in_ag14z !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.public_visibility_switch_performed_in_ag14z !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_publishing_operation_performed_in_ag14z !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Completed Chain", "Final Decision", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG14Z document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag14z", "validate:ag14z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag14z")) {
  fail("validate:project must include validate:ag14z");
}

pass("AG14Z registry is present.");
pass("AG14Z document is present.");
pass("AG14Z review, closure, completion summary, blocked register, readiness, AG15A boundary, schema, learning and preview are present.");
pass("AG14A through AG14J chain is consumed and summarised.");
pass("AG14 Admin/Editor secure-handler planning chain is closed.");
pass("Future live implementation remains blocked.");
pass("No real credentials, Auth/backend/Supabase activation, GitHub write, action execution, queue/article mutation, visibility switch or publishing is performed.");
pass("AG15A next-path decision boundary is created with explicit approval required.");
pass("AG14Z is Admin Editor Secure Handler Chain Closure only.");
