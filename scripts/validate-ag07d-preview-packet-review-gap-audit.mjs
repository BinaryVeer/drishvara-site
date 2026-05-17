import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  "data/content-intelligence/run-registry/ag07c-preview-only-dry-run-execution-record.json",
  "data/content-intelligence/quality-reviews/ag07c-content-packet-generator-preview-only-dry-run.json",
  "data/content-intelligence/schema/content-packet-preview-dry-run.schema.json",
  "data/content-intelligence/quality-reviews/ag07b-content-packet-generator-dry-run-implementation-plan.json",
  "data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json",
  "data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/ag07d-preview-packet-review-gap-audit.json",
  "data/content-intelligence/run-registry/ag07d-preview-packet-gap-matrix.json",
  "data/content-intelligence/learning/ag07d-preview-packet-review-learning.json",
  "data/quality/ag07d-preview-packet-review-gap-audit.json",
  "data/quality/ag07d-preview-packet-review-gap-audit-preview.json",
  "docs/quality/AG07D_PREVIEW_PACKET_REVIEW_GAP_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07D validation failed: ${message}`);
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

const ag07cPacket = readJson("data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json");
const ag07cReview = readJson("data/content-intelligence/quality-reviews/ag07c-content-packet-generator-preview-only-dry-run.json");
const ag07bReview = readJson("data/content-intelligence/quality-reviews/ag07b-content-packet-generator-dry-run-implementation-plan.json");
const ag07aReview = readJson("data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json");
const ag06zClosure = readJson("data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07d-preview-packet-review-gap-audit.json");
const gapMatrix = readJson("data/content-intelligence/run-registry/ag07d-preview-packet-gap-matrix.json");
const learning = readJson("data/content-intelligence/learning/ag07d-preview-packet-review-learning.json");
const registry = readJson("data/quality/ag07d-preview-packet-review-gap-audit.json");
const preview = readJson("data/quality/ag07d-preview-packet-review-gap-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07D_PREVIEW_PACKET_REVIEW_GAP_AUDIT.md"), "utf8");

for (const obj of [review, gapMatrix, learning, registry, preview]) {
  if (obj.module_id !== "AG07D") fail(`module_id must be AG07D in ${obj.title || "preview"}`);
}

if (review.status !== "gap_audit_completed") fail("Review status must be gap_audit_completed");
if (gapMatrix.status !== "gap_audit_completed") fail("Gap matrix status must be gap_audit_completed");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");
if (review.review_audit_only !== true) fail("Review must be audit-only");
if (gapMatrix.review_audit_only !== true) fail("Gap matrix must be audit-only");
if (registry.review_audit_only !== true) fail("Registry must be audit-only");
if (preview.review_audit_only !== true) fail("Preview must be audit-only");

if (ag07cPacket.status !== "preview_only_dry_run") fail("AG07C packet must remain preview_only_dry_run");
if (ag07cPacket.preview_only !== true) fail("AG07C packet must remain preview-only");
if (ag07cPacket.production_packet !== false) fail("AG07C packet must remain non-production");
if (ag07cPacket.publish_ready !== false) fail("AG07C packet must remain not publish-ready");
if (ag07cPacket.publication_allowed !== false) fail("AG07C packet must remain not publication-allowed");

if (ag07cReview.status !== "preview_only_dry_run_completed") fail("AG07C review must be completed");
if (ag07cReview.dry_run_decision.proceed_to_ag07d_review_only_with_explicit_user_approval !== true) fail("AG07C must require explicit approval for AG07D");
if (ag07bReview.status !== "implementation_plan_only") fail("AG07B must be implementation-plan only");
if (ag07aReview.status !== "design_dry_run_boundary_only") fail("AG07A must be boundary-only");
if (ag06zClosure.status !== "foundation_closed") fail("AG06Z must be foundation_closed");

for (const obj of [review, gapMatrix, registry, preview]) {
  if (obj.summary.review_audit_only !== true) fail(`${obj.title || "preview"} must be review/audit only`);
  if (obj.summary.production_readiness !== "not_ready") fail(`${obj.title || "preview"} must mark production_readiness not_ready`);
  if (obj.summary.publish_readiness !== "blocked") fail(`${obj.title || "preview"} must mark publish_readiness blocked`);
  if (obj.summary.article_prose_generated !== false) fail(`${obj.title || "preview"} must not generate article prose`);
  if (obj.summary.public_article_mutation_allowed !== false) fail(`${obj.title || "preview"} must block public mutation`);
  if (obj.summary.reference_insertion_allowed !== false) fail(`${obj.title || "preview"} must block reference insertion`);
  if (obj.summary.visual_generation_allowed !== false) fail(`${obj.title || "preview"} must block visual generation`);
  if (obj.summary.jsonl_production_append_allowed !== false) fail(`${obj.title || "preview"} must block JSONL production append`);
  if (obj.summary.database_write_allowed !== false) fail(`${obj.title || "preview"} must block database write`);
  if (obj.summary.publishing_allowed !== false) fail(`${obj.title || "preview"} must block publishing`);
  if (obj.summary.backend_auth_supabase_allowed !== false) fail(`${obj.title || "preview"} must block backend/Auth/Supabase`);
}

if (!Array.isArray(gapMatrix.gap_items) || gapMatrix.gap_items.length < 8) fail("Gap matrix must contain at least 8 gap items");

for (const requiredGapArea of [
  "section_depth",
  "article_prose",
  "reference_plan",
  "visual_data_plan",
  "quality_scoring",
  "publish_readiness",
  "approval_state",
  "data_persistence"
]) {
  if (!gapMatrix.gap_items.find((gap) => gap.gap_area === requiredGapArea)) {
    fail(`Missing gap area: ${requiredGapArea}`);
  }
}

for (const gap of gapMatrix.gap_items) {
  if (gap.production_blocker !== true) fail(`Every AG07D gap must remain production blocker: ${gap.gap_id}`);
  if (!gap.recommended_next_action) fail(`Every gap needs recommended next action: ${gap.gap_id}`);
}

for (const dimension of [
  "schema_completeness",
  "content_depth",
  "reference_readiness",
  "visual_readiness",
  "quality_readiness",
  "publish_readiness"
]) {
  if (!gapMatrix.review_dimensions.find((item) => item.dimension_id === dimension)) {
    fail(`Missing review dimension: ${dimension}`);
  }
}

if (review.closure_decision.decision !== "ag07d_preview_packet_review_gap_audit_closed") fail("AG07D closure decision mismatch");
if (review.closure_decision.proceed_to_ag07e_revision_plan_only_with_explicit_user_approval !== true) fail("AG07E must require explicit approval");
if (review.closure_decision.production_readiness !== "not_ready") fail("Production readiness must be not_ready");
if (review.closure_decision.publish_readiness !== "blocked") fail("Publish readiness must be blocked");
if (review.closure_decision.article_prose_generation_allowed !== false) fail("Article prose generation must not be allowed");
if (review.closure_decision.public_article_mutation_allowed !== false) fail("Public mutation must not be allowed");
if (review.closure_decision.reference_insertion_allowed !== false) fail("Reference insertion must not be allowed");
if (review.closure_decision.visual_generation_allowed !== false) fail("Visual generation must not be allowed");
if (review.closure_decision.jsonl_production_append_allowed !== false) fail("JSONL production append must not be allowed");
if (review.closure_decision.database_write_allowed !== false) fail("Database write must not be allowed");
if (review.closure_decision.publishing_allowed !== false) fail("Publishing must not be allowed");
if (review.closure_decision.backend_auth_supabase_allowed !== false) fail("Backend/Auth/Supabase must not be allowed");

for (const falseField of [
  "article_prose_generated",
  "narrative_text_generated",
  "production_content_generated",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "reference_insertion_performed",
  "reference_url_population_performed",
  "reference_url_change_performed",
  "visual_generation_performed",
  "visual_asset_generation_performed",
  "infographic_generation_performed",
  "scaffold_import_performed",
  "scaffold_file_copy_performed",
  "scaffold_file_move_performed",
  "scaffold_file_delete_performed",
  "jsonl_append_performed",
  "jsonl_production_record_created",
  "database_write_performed",
  "supabase_enabled",
  "auth_enabled",
  "backend_activation_performed",
  "api_route_created",
  "approval_state_changed",
  "publish_ready_set",
  "public_publishing_performed",
  "publication_approval_granted"
]) {
  for (const obj of [review, gapMatrix, learning, registry, preview]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title || "preview"}`);
  }
}

for (const scriptName of ["generate:ag07d", "validate:ag07d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07d")) {
  fail("validate:project must include validate:ag07d");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Review Findings",
  "Production Readiness Decision",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07D document missing phrase: ${phrase}`);
}

pass("AG07D registry is present.");
pass("AG07D document is present.");
pass("AG07D review, gap matrix, learning record and preview are present.");
pass("AG07C preview packet is consumed and remains preview-only/non-production.");
pass("Expected structural gaps are recorded.");
pass("Production readiness remains not_ready.");
pass("Publish readiness remains blocked.");
pass("AG07D is review/gap-audit only.");
pass("No article prose generation, public mutation, reference insertion, visual generation, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is enabled or performed.");
pass("AG07E Preview Packet Revision Plan is identified as next only with explicit approval.");
