import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag15a-next-path-decision-after-admin-editor-chain-closure.json",
  "data/content-intelligence/quality-reviews/ag15b-generated-article-admin-queue-integration-plan.json",
  "data/content-intelligence/quality-reviews/ag15c-generated-article-admin-queue-schema-dry-run.json",
  "data/content-intelligence/quality-reviews/ag15d-schema-dry-run-audit-integration-readiness.json",
  "data/content-intelligence/quality-reviews/ag15e-non-active-admin-queue-integration-scaffold.json",
  "data/content-intelligence/quality-reviews/ag15f-non-active-admin-queue-integration-scaffold-audit.json",
  "data/content-intelligence/audit-records/ag15f-non-active-integration-scaffold-audit-report.json",
  "data/content-intelligence/quality-registry/ag15f-generated-article-admin-queue-integration-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag15f-to-ag15z-generated-article-admin-queue-integration-closure-boundary.json",

  "data/content-intelligence/quality-reviews/ag15z-generated-article-admin-queue-integration-closure.json",
  "data/content-intelligence/closure-records/ag15z-generated-article-admin-queue-integration-closure.json",
  "data/content-intelligence/content-pipeline/ag15z-generated-article-admin-queue-preparation-summary.json",
  "data/content-intelligence/quality-registry/ag15z-active-integration-blocked-register.json",
  "data/content-intelligence/quality-registry/ag15z-next-path-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag15z-to-ag16a-public-visibility-publish-control-boundary.json",
  "data/content-intelligence/schema/generated-article-admin-queue-integration-closure.schema.json",
  "data/content-intelligence/learning/ag15z-generated-article-admin-queue-integration-closure-learning.json",
  "data/quality/ag15z-generated-article-admin-queue-integration-closure.json",
  "data/quality/ag15z-generated-article-admin-queue-integration-closure-preview.json",
  "docs/quality/AG15Z_GENERATED_ARTICLE_ADMIN_QUEUE_INTEGRATION_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG15Z validation failed: ${message}`);
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

const ag15fReview = readJson("data/content-intelligence/quality-reviews/ag15f-non-active-admin-queue-integration-scaffold-audit.json");
const ag15fAudit = readJson("data/content-intelligence/audit-records/ag15f-non-active-integration-scaffold-audit-report.json");
const ag15fReadiness = readJson("data/content-intelligence/quality-registry/ag15f-generated-article-admin-queue-integration-closure-readiness-record.json");
const ag15fBoundary = readJson("data/content-intelligence/mutation-plans/ag15f-to-ag15z-generated-article-admin-queue-integration-closure-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag15z-generated-article-admin-queue-integration-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag15z-generated-article-admin-queue-integration-closure.json");
const summary = readJson("data/content-intelligence/content-pipeline/ag15z-generated-article-admin-queue-preparation-summary.json");
const blocked = readJson("data/content-intelligence/quality-registry/ag15z-active-integration-blocked-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag15z-next-path-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag15z-to-ag16a-public-visibility-publish-control-boundary.json");
const schema = readJson("data/content-intelligence/schema/generated-article-admin-queue-integration-closure.schema.json");
const learning = readJson("data/content-intelligence/learning/ag15z-generated-article-admin-queue-integration-closure-learning.json");
const registry = readJson("data/quality/ag15z-generated-article-admin-queue-integration-closure.json");
const preview = readJson("data/quality/ag15z-generated-article-admin-queue-integration-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG15Z_GENERATED_ARTICLE_ADMIN_QUEUE_INTEGRATION_CLOSURE.md"), "utf8");

for (const obj of [review, closure, summary, blocked, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG15Z") fail(`module_id must be AG15Z in ${obj.title || "object"}`);
}

if (ag15fReview.status !== "non_active_integration_scaffold_audit_passed_ready_for_ag15z_closure") fail("AG15F review status mismatch");
if (ag15fAudit.failed_checks.length !== 0) fail("AG15F failed checks must be zero");
if (ag15fReadiness.ready_for_ag15z !== true) fail("AG15F readiness missing");
if (ag15fBoundary.next_stage_id !== "AG15Z") fail("AG15Z boundary missing in AG15F");

if (review.status !== "generated_article_admin_queue_integration_chain_closed_future_active_integration_blocked") fail("Review status mismatch");
if (closure.status !== "generated_article_admin_queue_integration_chain_closed_future_active_integration_blocked") fail("Closure status mismatch");
if (summary.status !== "ag15_generated_article_admin_queue_preparation_completed") fail("Summary status mismatch");
if (blocked.status !== "active_queue_integration_remains_blocked") fail("Blocked register status mismatch");
if (readiness.status !== "ready_for_ag16a_public_visibility_publish_control_preparation") fail("Readiness status mismatch");

if (summary.completed_stage_count !== 6) fail("AG15Z must summarise six AG15 stages");
for (const stage of ["AG15A", "AG15B", "AG15C", "AG15D", "AG15E", "AG15F"]) {
  if (!summary.completed_stages.some((item) => item.stage_id === stage)) fail(`Missing completed stage ${stage}`);
}

if (summary.final_preparation_state.generated_article_conveyor_defined !== true) fail("Conveyor must be defined");
if (summary.final_preparation_state.schema_dry_run_passed !== true) fail("Schema dry-run must be passed");
if (summary.final_preparation_state.non_active_integration_scaffold_audited !== true) fail("Non-active scaffold audit must be completed");
if (summary.final_preparation_state.public_visibility_default !== false) fail("public_visibility default must remain false");
if (summary.final_preparation_state.publish_approved_default !== false) fail("publish_approved default must remain false");
if (summary.final_preparation_state.active_queue_mutation_enabled !== false) fail("Active queue mutation must remain blocked");
if (summary.final_preparation_state.public_visibility_switch_enabled !== false) fail("Visibility switch must remain blocked");
if (summary.final_preparation_state.publish_execution_enabled !== false) fail("Publish execution must remain blocked");

for (const item of [
  "New article generation.",
  "Article mutation.",
  "Active Admin Review Queue record creation.",
  "Queue-index mutation.",
  "Admin/Editor action execution.",
  "Public visibility switch.",
  "Publishing operation."
]) {
  if (!blocked.final_ag15_blocked_items.includes(item)) fail(`Blocked item missing: ${item}`);
}

if (readiness.ready_for_ag16a !== true) fail("AG16A readiness missing");
if (readiness.ag15_chain_closed !== true) fail("AG15 chain must be closed");
if (readiness.recommended_next_stage !== "AG16A") fail("Recommended next stage must be AG16A");
if (readiness.active_queue_mutation_ready !== false) fail("Active queue mutation must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (closure.final_decision.ag15_chain_closed !== true) fail("AG15 chain closure missing");
if (closure.final_decision.future_active_queue_integration_blocked !== true) fail("Future active integration must be blocked");
if (closure.final_decision.proceed_to_ag16a_public_visibility_publish_control_preparation !== true) fail("AG16A handoff missing");
if (closure.final_decision.public_publishing_enabled !== false) fail("Public publishing must not be enabled");

if (boundary.status !== "ag16a_boundary_created_not_started") fail("AG16A boundary status mismatch");
if (boundary.next_stage_id !== "AG16A") fail("AG16A handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG16A explicit approval missing");

if (schema.status !== "schema_generated_article_admin_queue_integration_closure_only") fail("Schema status mismatch");

for (const key of [
  "chain_closure_allowed_in_ag15z",
  "preparation_summary_allowed_in_ag15z",
  "blocked_register_allowed_in_ag15z",
  "next_path_boundary_allowed_in_ag15z"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag15z",
  "article_mutation_allowed_in_ag15z",
  "queue_mutation_allowed_in_ag15z",
  "active_admin_review_queue_record_creation_allowed_in_ag15z",
  "queue_index_mutation_allowed_in_ag15z",
  "admin_action_execution_allowed_in_ag15z",
  "editor_action_execution_allowed_in_ag15z",
  "auth_activation_allowed_in_ag15z",
  "backend_activation_allowed_in_ag15z",
  "supabase_activation_allowed_in_ag15z",
  "github_write_operation_allowed_in_ag15z",
  "public_visibility_switch_allowed_in_ag15z",
  "public_publishing_operation_allowed_in_ag15z",
  "deployment_trigger_allowed_in_ag15z"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, closure, summary, blocked, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.generated_article_admin_queue_integration_closure_only !== true) fail(`${obj.title || "object"} must be AG15Z closure-only`);
  if (obj.article_generation_performed_in_ag15z !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag15z !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.queue_mutation_performed_in_ag15z !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.active_admin_review_queue_record_created_in_ag15z !== false) fail(`${obj.title || "object"} must not create active queue record`);
  if (obj.public_visibility_switch_performed_in_ag15z !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_publishing_operation_performed_in_ag15z !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Completed Chain", "Final Decision", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG15Z document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag15z", "validate:ag15z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag15z")) {
  fail("validate:project must include validate:ag15z");
}

pass("AG15Z registry is present.");
pass("AG15Z document is present.");
pass("AG15Z review, closure, preparation summary, blocked register, readiness, AG16A boundary, schema, learning and preview are present.");
pass("AG15A through AG15F chain is consumed and summarised.");
pass("Generated article to Admin Review Queue preparation chain is closed.");
pass("Future active queue integration remains blocked.");
pass("public_visibility=false and publish_approved=false controls are preserved.");
pass("AG16A public visibility and publish-control boundary is created with explicit approval required.");
pass("No article generation, article mutation, queue mutation, visibility switch or publishing is performed.");
pass("AG15Z is Generated Article Admin Queue Integration Closure only.");
