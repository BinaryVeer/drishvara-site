import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag15a-next-path-decision-after-admin-editor-chain-closure.json",
  "data/content-intelligence/content-pipeline/ag15a-next-path-decision-record.json",
  "data/content-intelligence/content-pipeline/ag15a-generated-article-admin-queue-conveyor-scope-record.json",
  "data/content-intelligence/quality-registry/ag15a-generated-article-admin-queue-integration-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag15a-to-ag15b-generated-article-admin-queue-integration-plan-boundary.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  "data/admin-review/index/admin-review-queue-index.json",

  "data/content-intelligence/quality-reviews/ag15b-generated-article-admin-queue-integration-plan.json",
  "data/content-intelligence/content-pipeline/ag15b-generated-article-intake-record-schema-plan.json",
  "data/content-intelligence/content-pipeline/ag15b-admin-review-queue-record-schema-plan.json",
  "data/content-intelligence/content-pipeline/ag15b-quality-evidence-preview-state-plan.json",
  "data/content-intelligence/content-pipeline/ag15b-batch-validation-and-failure-state-plan.json",
  "data/content-intelligence/quality-registry/ag15b-generated-article-admin-queue-schema-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag15b-to-ag15c-generated-article-admin-queue-schema-dry-run-boundary.json",
  "data/content-intelligence/schema/generated-article-admin-queue-integration-plan.schema.json",
  "data/content-intelligence/learning/ag15b-generated-article-admin-queue-integration-plan-learning.json",
  "data/quality/ag15b-generated-article-admin-queue-integration-plan.json",
  "data/quality/ag15b-generated-article-admin-queue-integration-plan-preview.json",
  "docs/quality/AG15B_GENERATED_ARTICLE_ADMIN_QUEUE_INTEGRATION_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG15B validation failed: ${message}`);
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

const ag15aReview = readJson("data/content-intelligence/quality-reviews/ag15a-next-path-decision-after-admin-editor-chain-closure.json");
const ag15aDecision = readJson("data/content-intelligence/content-pipeline/ag15a-next-path-decision-record.json");
const ag15aReadiness = readJson("data/content-intelligence/quality-registry/ag15a-generated-article-admin-queue-integration-readiness-record.json");
const ag15aBoundary = readJson("data/content-intelligence/mutation-plans/ag15a-to-ag15b-generated-article-admin-queue-integration-plan-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag15b-generated-article-admin-queue-integration-plan.json");
const intake = readJson("data/content-intelligence/content-pipeline/ag15b-generated-article-intake-record-schema-plan.json");
const queueSchema = readJson("data/content-intelligence/content-pipeline/ag15b-admin-review-queue-record-schema-plan.json");
const qualityPreview = readJson("data/content-intelligence/content-pipeline/ag15b-quality-evidence-preview-state-plan.json");
const batchFailure = readJson("data/content-intelligence/content-pipeline/ag15b-batch-validation-and-failure-state-plan.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag15b-generated-article-admin-queue-schema-dry-run-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag15b-to-ag15c-generated-article-admin-queue-schema-dry-run-boundary.json");
const schema = readJson("data/content-intelligence/schema/generated-article-admin-queue-integration-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag15b-generated-article-admin-queue-integration-plan-learning.json");
const registry = readJson("data/quality/ag15b-generated-article-admin-queue-integration-plan.json");
const preview = readJson("data/quality/ag15b-generated-article-admin-queue-integration-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG15B_GENERATED_ARTICLE_ADMIN_QUEUE_INTEGRATION_PLAN.md"), "utf8");

for (const obj of [review, intake, queueSchema, qualityPreview, batchFailure, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG15B") fail(`module_id must be AG15B in ${obj.title || "object"}`);
}

if (ag15aReview.status !== "next_path_decision_completed_content_queue_integration_selected") fail("AG15A review status mismatch");
if (ag15aDecision.selected_path.next_stage_id !== "AG15B") fail("AG15A selected path must point to AG15B");
if (ag15aReadiness.ready_for_ag15b !== true) fail("AG15A readiness for AG15B missing");
if (ag15aBoundary.next_stage_id !== "AG15B") fail("AG15B boundary missing in AG15A");

if (review.status !== "generated_article_admin_queue_integration_plan_defined") fail("Review status mismatch");
if (intake.status !== "generated_article_intake_schema_plan_defined") fail("Intake plan status mismatch");
if (queueSchema.status !== "admin_review_queue_record_schema_plan_defined") fail("Queue schema plan status mismatch");
if (qualityPreview.status !== "quality_evidence_preview_state_plan_defined") fail("Quality preview plan status mismatch");
if (batchFailure.status !== "batch_validation_failure_state_plan_defined") fail("Batch failure plan status mismatch");
if (readiness.status !== "ready_for_ag15c_generated_article_admin_queue_schema_dry_run") fail("Readiness status mismatch");

for (const field of [
  "article_id",
  "slug",
  "title",
  "category",
  "article_path",
  "article_hash",
  "quality_evidence_record",
  "preview_record",
  "queue_target",
  "public_visibility",
  "publish_approved",
  "status"
]) {
  if (!intake.required_intake_fields.includes(field)) fail(`Missing intake field: ${field}`);
}

if (intake.default_values.public_visibility !== false) fail("Intake public_visibility must default false");
if (intake.default_values.publish_approved !== false) fail("Intake publish_approved must default false");
if (intake.default_values.queue_target !== "admin_review_queue") fail("Queue target must default admin_review_queue");

if (queueSchema.planned_queue_record_schema.public_visibility !== false) fail("Queue schema public_visibility must be false");
if (queueSchema.planned_queue_record_schema.publish_approved !== false) fail("Queue schema publish_approved must be false");
if (queueSchema.planned_queue_record_schema.queue_status !== "ready_for_admin_review") fail("Queue status must be ready_for_admin_review");
if (queueSchema.required_default_publication_controls.public_publish_execution_active !== false) fail("Publish execution must remain inactive");

for (const evidence of ["reference_evidence", "credit_evidence", "object_evidence", "layout_evidence", "preview_evidence", "hash_evidence"]) {
  if (!qualityPreview.mandatory_quality_evidence.some((item) => item.evidence_id === evidence && item.required === true)) {
    fail(`Missing mandatory quality evidence: ${evidence}`);
  }
}
if (qualityPreview.default_publication_state_at_preview.public_visibility !== false) fail("Preview public_visibility must be false");
if (qualityPreview.default_publication_state_at_preview.publish_approved !== false) fail("Preview publish_approved must be false");

for (const check of [
  "No duplicate article_id.",
  "Article path exists.",
  "Article hash exists and matches file.",
  "public_visibility is false by default.",
  "publish_approved is false by default.",
  "Queue index and candidate records are consistent."
]) {
  if (!batchFailure.batch_validation_checks.includes(check)) fail(`Missing batch validation check: ${check}`);
}

if (!batchFailure.failure_states.some((state) => state.state === "archived_non_public" && state.public_visibility === false && state.publish_approved === false)) {
  fail("archived_non_public failure state must preserve non-public defaults");
}
if (!batchFailure.object_routing_logic.some((item) => item.object_profile === "object_rich")) fail("object_rich routing logic missing");
if (!batchFailure.object_routing_logic.some((item) => item.object_profile === "text_only")) fail("text_only routing logic missing");

if (readiness.ready_for_ag15c !== true) fail("AG15C readiness missing");
if (readiness.article_generation_ready !== false) fail("Article generation must remain blocked");
if (readiness.article_mutation_ready !== false) fail("Article mutation must remain blocked");
if (readiness.queue_mutation_ready !== false) fail("Queue mutation must remain blocked");
if (readiness.admin_action_execution_ready !== false) fail("Admin action execution must remain blocked");
if (readiness.real_auth_ready !== false) fail("Real Auth must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag15c_boundary_created_not_started") fail("AG15C boundary status mismatch");
if (boundary.next_stage_id !== "AG15C") fail("AG15C handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG15C explicit approval missing");

if (schema.status !== "schema_generated_article_admin_queue_integration_plan_only") fail("Schema status mismatch");

for (const key of [
  "intake_schema_plan_allowed_in_ag15b",
  "admin_queue_record_schema_plan_allowed_in_ag15b",
  "quality_preview_state_plan_allowed_in_ag15b",
  "batch_validation_failure_state_plan_allowed_in_ag15b",
  "ag15c_boundary_allowed_in_ag15b"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag15b",
  "article_mutation_allowed_in_ag15b",
  "queue_mutation_allowed_in_ag15b",
  "admin_review_queue_record_creation_allowed_in_ag15b",
  "queue_index_mutation_allowed_in_ag15b",
  "admin_action_execution_allowed_in_ag15b",
  "editor_action_execution_allowed_in_ag15b",
  "real_credential_creation_allowed_in_ag15b",
  "hardcoded_password_allowed_in_ag15b",
  "password_hash_commit_allowed_in_ag15b",
  "auth_activation_allowed_in_ag15b",
  "backend_activation_allowed_in_ag15b",
  "supabase_activation_allowed_in_ag15b",
  "database_write_allowed_in_ag15b",
  "github_token_creation_or_exposure_allowed_in_ag15b",
  "github_write_operation_allowed_in_ag15b",
  "active_action_handler_creation_allowed_in_ag15b",
  "public_visibility_switch_allowed_in_ag15b",
  "public_publishing_operation_allowed_in_ag15b",
  "deployment_trigger_allowed_in_ag15b"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, intake, queueSchema, qualityPreview, batchFailure, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.generated_article_admin_queue_integration_plan_only !== true) fail(`${obj.title || "object"} must be AG15B planning only`);
  if (obj.article_generation_performed_in_ag15b !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag15b !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.queue_mutation_performed_in_ag15b !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.admin_review_queue_record_created_in_ag15b !== false) fail(`${obj.title || "object"} must not create active queue record`);
  if (obj.public_visibility_switch_performed_in_ag15b !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_publishing_operation_performed_in_ag15b !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Conveyor", "Default Publication Controls", "Planned Evidence Gates", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG15B document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag15b", "validate:ag15b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag15b")) {
  fail("validate:project must include validate:ag15b");
}

pass("AG15B registry is present.");
pass("AG15B document is present.");
pass("AG15B review, intake schema plan, queue schema plan, quality/preview plan, batch/failure plan, readiness, AG15C boundary, schema, learning and preview are present.");
pass("AG15A content queue integration decision is consumed.");
pass("Generated article conveyor is defined: article → quality evidence → preview state → Admin Review Queue.");
pass("Default controls are set: public_visibility=false and publish_approved=false.");
pass("Batch validation and failure states are planned.");
pass("Object-rich and text-only routing logic is planned.");
pass("AG15C schema dry-run boundary is created with explicit approval required.");
pass("No article generation, article mutation, queue mutation, visibility switch or publishing is performed.");
pass("AG15B is Generated Article Admin Queue Integration Plan only.");
