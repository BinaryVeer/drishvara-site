import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag16a-public-visibility-publish-control-preparation.json",
  "data/content-intelligence/quality-reviews/ag16b-public-visibility-publish-filter-schema-plan.json",
  "data/content-intelligence/quality-reviews/ag16c-public-visibility-filter-schema-dry-run.json",
  "data/content-intelligence/quality-reviews/ag16d-public-visibility-filter-schema-dry-run-audit.json",
  "data/content-intelligence/quality-reviews/ag16e-non-active-public-filter-implementation-scaffold.json",
  "data/content-intelligence/quality-reviews/ag16f-non-active-public-filter-scaffold-audit.json",
  "data/content-intelligence/audit-records/ag16f-non-active-public-filter-scaffold-audit-report.json",
  "data/content-intelligence/closure-records/ag16f-non-active-public-filter-scaffold-closure.json",
  "data/content-intelligence/quality-registry/ag16f-non-active-public-filter-scaffold-safety-record.json",
  "data/content-intelligence/quality-registry/ag16f-public-visibility-publish-control-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag16f-to-ag16z-public-visibility-publish-control-closure-boundary.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag16z-public-visibility-publish-control-closure.json",
  "data/content-intelligence/closure-records/ag16z-public-visibility-publish-control-closure.json",
  "data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json",
  "data/content-intelligence/quality-registry/ag16z-public-exposure-blocked-register.json",
  "data/content-intelligence/quality-registry/ag16z-next-path-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag16z-to-ag17a-controlled-go-live-implementation-path-decision-boundary.json",
  "data/content-intelligence/schema/public-visibility-publish-control-closure.schema.json",
  "data/content-intelligence/learning/ag16z-public-visibility-publish-control-closure-learning.json",
  "data/quality/ag16z-public-visibility-publish-control-closure.json",
  "data/quality/ag16z-public-visibility-publish-control-closure-preview.json",
  "docs/quality/AG16Z_PUBLIC_VISIBILITY_PUBLISH_CONTROL_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG16Z validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag16fReview = readJson("data/content-intelligence/quality-reviews/ag16f-non-active-public-filter-scaffold-audit.json");
const ag16fAudit = readJson("data/content-intelligence/audit-records/ag16f-non-active-public-filter-scaffold-audit-report.json");
const ag16fReadiness = readJson("data/content-intelligence/quality-registry/ag16f-public-visibility-publish-control-closure-readiness-record.json");
const ag16fBoundary = readJson("data/content-intelligence/mutation-plans/ag16f-to-ag16z-public-visibility-publish-control-closure-boundary.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag16z-public-visibility-publish-control-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag16z-public-visibility-publish-control-closure.json");
const summary = readJson("data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json");
const blocked = readJson("data/content-intelligence/quality-registry/ag16z-public-exposure-blocked-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag16z-next-path-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag16z-to-ag17a-controlled-go-live-implementation-path-decision-boundary.json");
const schema = readJson("data/content-intelligence/schema/public-visibility-publish-control-closure.schema.json");
const learning = readJson("data/content-intelligence/learning/ag16z-public-visibility-publish-control-closure-learning.json");
const registry = readJson("data/quality/ag16z-public-visibility-publish-control-closure.json");
const preview = readJson("data/quality/ag16z-public-visibility-publish-control-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG16Z_PUBLIC_VISIBILITY_PUBLISH_CONTROL_CLOSURE.md"), "utf8");

for (const obj of [review, closure, summary, blocked, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG16Z") fail(`module_id must be AG16Z in ${obj.title || "object"}`);
}

if (ag16fReview.status !== "non_active_public_filter_scaffold_audit_passed_ready_for_ag16z_closure") fail("AG16F review status mismatch");
if (ag16fAudit.failed_checks.length !== 0) fail("AG16F failed checks must be zero");
if (ag16fReadiness.ready_for_ag16z !== true) fail("AG16F readiness missing");
if (ag16fBoundary.next_stage_id !== "AG16Z") fail("AG16Z boundary missing in AG16F");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate hash mismatch");

if (review.status !== "public_visibility_publish_control_chain_closed_future_public_exposure_blocked") fail("Review status mismatch");
if (closure.status !== "public_visibility_publish_control_chain_closed_future_public_exposure_blocked") fail("Closure status mismatch");
if (summary.status !== "ag16_public_visibility_publish_control_preparation_completed") fail("Summary status mismatch");
if (blocked.status !== "public_exposure_operations_remain_blocked") fail("Blocked register status mismatch");
if (readiness.status !== "ready_for_ag17a_controlled_go_live_implementation_path_decision") fail("Readiness status mismatch");

if (summary.completed_stage_count !== 6) fail("AG16Z must summarise six AG16 stages");
for (const stage of ["AG16A", "AG16B", "AG16C", "AG16D", "AG16E", "AG16F"]) {
  if (!summary.completed_stages.some((item) => item.stage_id === stage)) fail(`Missing completed stage ${stage}`);
}

if (summary.final_public_control_state.public_visibility_model_defined !== true) fail("Public visibility model must be defined");
if (summary.final_public_control_state.publish_control_model_defined !== true) fail("Publish-control model must be defined");
if (summary.final_public_control_state.schema_dry_run_passed !== true) fail("Schema dry-run must be passed");
if (summary.final_public_control_state.dry_run_audit_passed !== true) fail("Dry-run audit must be passed");
if (summary.final_public_control_state.non_active_public_filter_scaffold_audited !== true) fail("Non-active scaffold must be audited");
if (summary.final_public_control_state.public_exposure_requires_public_visibility_true !== true) fail("Public exposure must require visibility true");
if (summary.final_public_control_state.public_exposure_requires_publish_approved_true !== true) fail("Public exposure must require publish approved true");
if (summary.final_public_control_state.public_exposure_requires_public_index_allowed_true !== true) fail("Public exposure must require public index allowed true");
if (summary.final_public_control_state.public_visibility_switch_enabled !== false) fail("Visibility switch must remain disabled");
if (summary.final_public_control_state.public_index_mutation_enabled !== false) fail("Public index mutation must remain disabled");
if (summary.final_public_control_state.publishing_enabled !== false) fail("Publishing must remain disabled");

for (const item of [
  "Actual public visibility switch.",
  "Actual public index mutation.",
  "Actual Featured Reads public listing mutation.",
  "Actual sitemap/feed/search index mutation.",
  "Publishing operation.",
  "Deployment trigger."
]) {
  if (!blocked.blocked_items_after_ag16_closure.includes(item)) fail(`Blocked item missing: ${item}`);
}

if (readiness.ready_for_ag17a !== true) fail("AG17A readiness missing");
if (readiness.ag16_chain_closed !== true) fail("AG16 chain must be closed");
if (readiness.recommended_next_stage !== "AG17A") fail("Recommended next stage must be AG17A");
if (readiness.active_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.real_auth_ready !== false) fail("Real Auth must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");

if (closure.final_decision.ag16_chain_closed !== true) fail("AG16 chain closure missing");
if (closure.final_decision.future_public_exposure_blocked !== true) fail("Future public exposure must be blocked");
if (closure.final_decision.proceed_to_ag17a_controlled_go_live_implementation_path_decision !== true) fail("AG17A handoff missing");
if (closure.final_decision.public_visibility_switch_enabled !== false) fail("Visibility switch must not be enabled");
if (closure.final_decision.public_index_mutation_enabled !== false) fail("Public index mutation must not be enabled");
if (closure.final_decision.public_publishing_enabled !== false) fail("Public publishing must not be enabled");

if (boundary.status !== "ag17a_boundary_created_not_started") fail("AG17A boundary status mismatch");
if (boundary.next_stage_id !== "AG17A") fail("AG17A handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG17A explicit approval missing");

if (schema.status !== "schema_public_visibility_publish_control_closure_only") fail("Schema status mismatch");

for (const key of [
  "chain_closure_allowed_in_ag16z",
  "preparation_summary_allowed_in_ag16z",
  "blocked_register_allowed_in_ag16z",
  "next_path_boundary_allowed_in_ag16z"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag16z",
  "article_mutation_allowed_in_ag16z",
  "queue_mutation_allowed_in_ag16z",
  "active_admin_review_queue_record_creation_allowed_in_ag16z",
  "queue_index_mutation_allowed_in_ag16z",
  "admin_action_execution_allowed_in_ag16z",
  "editor_action_execution_allowed_in_ag16z",
  "auth_activation_allowed_in_ag16z",
  "backend_activation_allowed_in_ag16z",
  "supabase_activation_allowed_in_ag16z",
  "github_write_operation_allowed_in_ag16z",
  "public_visibility_switch_allowed_in_ag16z",
  "public_index_mutation_allowed_in_ag16z",
  "public_publishing_operation_allowed_in_ag16z",
  "deployment_trigger_allowed_in_ag16z"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, closure, summary, blocked, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.public_visibility_publish_control_closure_only !== true) fail(`${obj.title || "object"} must be AG16Z closure-only`);
  if (obj.article_generation_performed_in_ag16z !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag16z !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.queue_mutation_performed_in_ag16z !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.active_admin_review_queue_record_created_in_ag16z !== false) fail(`${obj.title || "object"} must not create active queue record`);
  if (obj.public_visibility_switch_performed_in_ag16z !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag16z !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.public_publishing_operation_performed_in_ag16z !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Completed Chain", "Final Decision", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG16Z document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag16z", "validate:ag16z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag16z")) {
  fail("validate:project must include validate:ag16z");
}

pass("AG16Z registry is present.");
pass("AG16Z document is present.");
pass("AG16Z review, closure, summary, blocked register, readiness, AG17A boundary, schema, learning and preview are present.");
pass("AG16A through AG16F chain is consumed and summarised.");
pass("Public visibility and publish-control preparation chain is closed.");
pass("Future public exposure remains blocked.");
pass("Visibility switch, public index mutation and publishing remain blocked.");
pass("AG17A controlled go-live implementation path decision boundary is created with explicit approval required.");
pass("No article generation, article mutation, queue mutation, visibility switch, public index mutation or publishing is performed.");
pass("AG16Z is Public Visibility and Publish-Control Closure only.");
