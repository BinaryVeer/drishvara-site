import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag15b-generated-article-admin-queue-integration-plan.json",
  "data/content-intelligence/content-pipeline/ag15b-generated-article-intake-record-schema-plan.json",
  "data/content-intelligence/content-pipeline/ag15b-admin-review-queue-record-schema-plan.json",
  "data/content-intelligence/content-pipeline/ag15b-quality-evidence-preview-state-plan.json",
  "data/content-intelligence/content-pipeline/ag15b-batch-validation-and-failure-state-plan.json",
  "data/content-intelligence/quality-registry/ag15b-generated-article-admin-queue-schema-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag15b-to-ag15c-generated-article-admin-queue-schema-dry-run-boundary.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  "data/admin-review/index/admin-review-queue-index.json",

  "data/content-intelligence/quality-reviews/ag15c-generated-article-admin-queue-schema-dry-run.json",
  "data/content-intelligence/content-pipeline/dry-runs/ag15c-generated-article-intake-dry-run-record.json",
  "data/content-intelligence/content-pipeline/dry-runs/ag15c-admin-review-queue-record-dry-run.json",
  "data/content-intelligence/content-pipeline/dry-runs/ag15c-quality-evidence-preview-state-dry-run.json",
  "data/content-intelligence/audit-records/ag15c-schema-dry-run-validation-report.json",
  "data/content-intelligence/quality-registry/ag15c-schema-dry-run-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag15c-to-ag15d-schema-dry-run-audit-integration-readiness-boundary.json",
  "data/content-intelligence/schema/generated-article-admin-queue-schema-dry-run.schema.json",
  "data/content-intelligence/learning/ag15c-generated-article-admin-queue-schema-dry-run-learning.json",
  "data/quality/ag15c-generated-article-admin-queue-schema-dry-run.json",
  "data/quality/ag15c-generated-article-admin-queue-schema-dry-run-preview.json",
  "docs/quality/AG15C_GENERATED_ARTICLE_ADMIN_QUEUE_SCHEMA_DRY_RUN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG15C validation failed: ${message}`);
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

function articleHashMatchesCurrentOrAg12cR1(recordedHash, articlePath, currentHash) {
  if (recordedHash === currentHash) return true;

  const ag12cR1ApplyPath = path.join(root, "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");
  if (!fs.existsSync(ag12cR1ApplyPath)) return false;

  try {
    const ag12cR1Apply = JSON.parse(fs.readFileSync(ag12cR1ApplyPath, "utf8"));
    return (
      ag12cR1Apply.status === "public_object_label_layout_repair_applied" &&
      ag12cR1Apply.selected_article_path === articlePath &&
      ag12cR1Apply.pre_repair_hash === recordedHash &&
      ag12cR1Apply.post_repair_hash === currentHash
    );
  } catch {
    return false;
  }
}


for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag15bReview = readJson("data/content-intelligence/quality-reviews/ag15b-generated-article-admin-queue-integration-plan.json");
const ag15bReadiness = readJson("data/content-intelligence/quality-registry/ag15b-generated-article-admin-queue-schema-dry-run-readiness-record.json");
const ag15bBoundary = readJson("data/content-intelligence/mutation-plans/ag15b-to-ag15c-generated-article-admin-queue-schema-dry-run-boundary.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag15c-generated-article-admin-queue-schema-dry-run.json");
const intake = readJson("data/content-intelligence/content-pipeline/dry-runs/ag15c-generated-article-intake-dry-run-record.json");
const queueDryRun = readJson("data/content-intelligence/content-pipeline/dry-runs/ag15c-admin-review-queue-record-dry-run.json");
const qualityPreview = readJson("data/content-intelligence/content-pipeline/dry-runs/ag15c-quality-evidence-preview-state-dry-run.json");
const validationReport = readJson("data/content-intelligence/audit-records/ag15c-schema-dry-run-validation-report.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag15c-schema-dry-run-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag15c-to-ag15d-schema-dry-run-audit-integration-readiness-boundary.json");
const schema = readJson("data/content-intelligence/schema/generated-article-admin-queue-schema-dry-run.schema.json");
const learning = readJson("data/content-intelligence/learning/ag15c-generated-article-admin-queue-schema-dry-run-learning.json");
const registry = readJson("data/quality/ag15c-generated-article-admin-queue-schema-dry-run.json");
const preview = readJson("data/quality/ag15c-generated-article-admin-queue-schema-dry-run-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG15C_GENERATED_ARTICLE_ADMIN_QUEUE_SCHEMA_DRY_RUN.md"), "utf8");

for (const obj of [review, intake, queueDryRun, qualityPreview, validationReport, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG15C") fail(`module_id must be AG15C in ${obj.title || "object"}`);
}

if (ag15bReview.status !== "generated_article_admin_queue_integration_plan_defined") fail("AG15B review status mismatch");
if (ag15bReadiness.ready_for_ag15c !== true) fail("AG15B readiness for AG15C missing");
if (ag15bBoundary.next_stage_id !== "AG15C") fail("AG15C boundary missing in AG15B");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!articleHashMatchesCurrentOrAg12cR1(ag13zCandidate.article_hash, articlePath, currentHash)) fail("Seed candidate article hash mismatch or AG12C-R1 repaired article state missing");

if (review.status !== "generated_article_admin_queue_schema_dry_run_passed") fail("Review status mismatch");
if (intake.status !== "generated_article_intake_dry_run_passed") fail("Intake dry-run status mismatch");
if (queueDryRun.status !== "admin_review_queue_record_dry_run_passed") fail("Queue dry-run status mismatch");
if (qualityPreview.status !== "quality_evidence_preview_state_dry_run_passed") fail("Quality preview dry-run status mismatch");
if (validationReport.status !== "schema_dry_run_validation_passed") fail("Validation report status mismatch");
if (readiness.status !== "ready_for_ag15d_schema_dry_run_audit_integration_readiness") fail("Readiness status mismatch");

if (intake.dry_run_only !== true) fail("Intake must be dry-run only");
if (queueDryRun.dry_run_only !== true) fail("Queue record must be dry-run only");
if (qualityPreview.dry_run_only !== true) fail("Quality preview must be dry-run only");

if (intake.article_path !== articlePath) fail("Intake article path mismatch");
if (!articleHashMatchesCurrentOrAg12cR1(intake.article_hash, articlePath, currentHash)) fail("Intake article hash mismatch or AG12C-R1 repaired article state missing");
if (intake.public_visibility !== false) fail("Intake public_visibility must be false");
if (intake.publish_approved !== false) fail("Intake publish_approved must be false");
if (intake.queue_target !== "admin_review_queue") fail("Intake queue target mismatch");

if (queueDryRun.not_written_to_active_queue !== true) fail("Queue dry-run must not be written to active queue");
if (queueDryRun.not_added_to_queue_index !== true) fail("Queue dry-run must not be added to queue index");
if (queueDryRun.active_queue_index_mutated !== false) fail("Queue index mutation must be false");
if (queueDryRun.public_visibility !== false) fail("Queue dry-run public_visibility must be false");
if (queueDryRun.publish_approved !== false) fail("Queue dry-run publish_approved must be false");
if (queueDryRun.queue_status !== "ready_for_admin_review") fail("Queue dry-run status must be ready_for_admin_review");

if (qualityPreview.preview_state.preview_record_present !== true) fail("Preview record must be present");
if (!articleHashMatchesCurrentOrAg12cR1(qualityPreview.preview_state.article_hash_at_preview, articlePath, currentHash)) fail("Preview hash mismatch or AG12C-R1 repaired article state missing");
if (qualityPreview.default_publication_state_at_preview.public_visibility !== false) fail("Preview public_visibility must be false");
if (qualityPreview.default_publication_state_at_preview.publish_approved !== false) fail("Preview publish_approved must be false");

for (const evidence of ["reference_evidence", "credit_evidence", "object_evidence", "layout_evidence", "preview_evidence", "hash_evidence"]) {
  if (!qualityPreview.mandatory_quality_evidence_results.some((item) => item.evidence_id === evidence && item.dry_run_status === "present_or_mapped")) {
    fail(`Missing dry-run evidence mapping: ${evidence}`);
  }
}

if (!Array.isArray(validationReport.checks) || validationReport.checks.length !== 10) fail("Validation report must include ten checks");
if (validationReport.failed_checks.length !== 0) fail("Dry-run failed checks must be zero");
if (validationReport.active_queue_mutation_performed !== false) fail("Active queue mutation must be false");
if (validationReport.article_mutation_performed !== false) fail("Article mutation must be false");
if (validationReport.public_visibility_switch_performed !== false) fail("Visibility switch must be false");
if (validationReport.publishing_operation_performed !== false) fail("Publishing operation must be false");

if (readiness.ready_for_ag15d !== true) fail("AG15D readiness missing");
if (readiness.schema_dry_run_passed !== true) fail("Schema dry-run must pass");
if (readiness.failed_checks !== 0) fail("Failed checks must be zero");
if (readiness.active_queue_mutation_ready !== false) fail("Active queue mutation readiness must be false");
if (readiness.article_generation_ready !== false) fail("Article generation must remain blocked");
if (readiness.queue_mutation_ready !== false) fail("Queue mutation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag15d_boundary_created_not_started") fail("AG15D boundary status mismatch");
if (boundary.next_stage_id !== "AG15D") fail("AG15D handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG15D explicit approval missing");

if (schema.status !== "schema_generated_article_admin_queue_schema_dry_run_only") fail("Schema status mismatch");

for (const key of [
  "intake_dry_run_allowed_in_ag15c",
  "queue_record_dry_run_allowed_in_ag15c",
  "quality_preview_dry_run_allowed_in_ag15c",
  "validation_report_allowed_in_ag15c",
  "ag15d_boundary_allowed_in_ag15c"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag15c",
  "article_mutation_allowed_in_ag15c",
  "queue_mutation_allowed_in_ag15c",
  "active_admin_review_queue_record_creation_allowed_in_ag15c",
  "queue_index_mutation_allowed_in_ag15c",
  "admin_action_execution_allowed_in_ag15c",
  "editor_action_execution_allowed_in_ag15c",
  "auth_activation_allowed_in_ag15c",
  "backend_activation_allowed_in_ag15c",
  "supabase_activation_allowed_in_ag15c",
  "database_write_allowed_in_ag15c",
  "github_write_operation_allowed_in_ag15c",
  "public_visibility_switch_allowed_in_ag15c",
  "public_publishing_operation_allowed_in_ag15c",
  "deployment_trigger_allowed_in_ag15c"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, intake, queueDryRun, qualityPreview, validationReport, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.generated_article_admin_queue_schema_dry_run_only !== true) fail(`${obj.title || "object"} must be AG15C dry-run only`);
  if (obj.article_generation_performed_in_ag15c !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag15c !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.queue_mutation_performed_in_ag15c !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.active_admin_review_queue_record_created_in_ag15c !== false) fail(`${obj.title || "object"} must not create active queue record`);
  if (obj.public_visibility_switch_performed_in_ag15c !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_publishing_operation_performed_in_ag15c !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Dry-run Records", "Result", "Publication Controls", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG15C document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag15c", "validate:ag15c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag15c")) {
  fail("validate:project must include validate:ag15c");
}

pass("AG15C registry is present.");
pass("AG15C document is present.");
pass("AG15C review, intake dry-run, queue dry-run, quality/preview dry-run, validation report, readiness, AG15D boundary, schema, learning and preview are present.");
pass("AG15B integration plan is consumed.");
pass("Schema dry-run passed with zero failed checks.");
pass("Seed candidate article hash is verified.");
pass("Dry-run records preserve public_visibility=false and publish_approved=false.");
pass("No active Admin Review Queue record or queue-index mutation is performed.");
pass("AG15D dry-run audit integration readiness boundary is created with explicit approval required.");
pass("No article generation, article mutation, queue mutation, visibility switch or publishing is performed.");
pass("AG15C is Generated Article Admin Queue Schema Dry-run only.");
