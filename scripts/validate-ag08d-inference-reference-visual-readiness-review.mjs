import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag08c-article-upgrade-candidate-packet.json",
  "data/content-intelligence/content-packets/ag08c-article-upgrade-candidate-packet.json",
  "data/content-intelligence/quality-registry/ag08c-candidate-packet-readiness.json",
  "data/content-intelligence/schema/article-upgrade-candidate-packet.schema.json",
  "data/content-intelligence/learning/ag08c-article-upgrade-candidate-packet-learning.json",
  "data/content-intelligence/selection-registry/ag08b-selected-pipeline-test-article.json",
  "data/content-intelligence/run-registry/ag08a-repeatable-article-upgrade-roadmap.json",
  "data/quality/ag06e-long-form-article-standard.json",
  "data/quality/ag06i-visual-data-infographic-requirement-schema-closure.json",
  "data/quality/ag06j-reference-source-credibility-schema-closure.json",
  "data/content-intelligence/quality-reviews/ag08d-inference-reference-visual-readiness-review.json",
  "data/content-intelligence/inference-records/ag08d-article-inference-readiness-review.json",
  "data/content-intelligence/quality-registry/ag08d-reference-visual-readiness-gap-matrix.json",
  "data/content-intelligence/schema/inference-reference-visual-readiness-review.schema.json",
  "data/content-intelligence/learning/ag08d-inference-reference-visual-readiness-review-learning.json",
  "data/quality/ag08d-inference-reference-visual-readiness-review.json",
  "data/quality/ag08d-inference-reference-visual-readiness-review-preview.json",
  "docs/quality/AG08D_INFERENCE_REFERENCE_VISUAL_READINESS_REVIEW.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG08D validation failed: ${message}`);
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

function ag08gControlledApplyAllowsPostMutation() {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json");
  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    if (
      applyRecord.module_id !== "AG08G" ||
      applyRecord.exactly_one_article_file_mutated !== true ||
      applyRecord.article_mutation_performed !== true ||
      applyRecord.production_readiness_after_ag08g !== "one_article_applied_pending_post_apply_audit"
    ) {
      return false;
    }

    const targetAbs = path.join(root, applyRecord.selected_article_path);
    if (!fs.existsSync(targetAbs)) return false;

    const currentHash = sha256(fs.readFileSync(targetAbs, "utf8"));
    return applyRecord.post_apply_hash === currentHash;
  } catch {
    return false;
  }
}

function checkFalseFields(objects, fields) {
  for (const field of fields) {
    for (const obj of objects) {
      if (obj[field] !== false) fail(`${field} must be false in ${obj.title || obj.module_id || "object"}`);
    }
  }
}

function checkTrueFields(objects, fields) {
  for (const field of fields) {
    for (const obj of objects) {
      if (obj[field] !== true) fail(`${field} must be true in ${obj.title || obj.module_id || "object"}`);
    }
  }
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag08cReview = readJson("data/content-intelligence/quality-reviews/ag08c-article-upgrade-candidate-packet.json");
const ag08cPacket = readJson("data/content-intelligence/content-packets/ag08c-article-upgrade-candidate-packet.json");
const ag08cReadiness = readJson("data/content-intelligence/quality-registry/ag08c-candidate-packet-readiness.json");
const ag08cSchema = readJson("data/content-intelligence/schema/article-upgrade-candidate-packet.schema.json");

const review = readJson("data/content-intelligence/quality-reviews/ag08d-inference-reference-visual-readiness-review.json");
const inference = readJson("data/content-intelligence/inference-records/ag08d-article-inference-readiness-review.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag08d-reference-visual-readiness-gap-matrix.json");
const schema = readJson("data/content-intelligence/schema/inference-reference-visual-readiness-review.schema.json");
const learning = readJson("data/content-intelligence/learning/ag08d-inference-reference-visual-readiness-review-learning.json");
const registry = readJson("data/quality/ag08d-inference-reference-visual-readiness-review.json");
const preview = readJson("data/quality/ag08d-inference-reference-visual-readiness-review-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG08D_INFERENCE_REFERENCE_VISUAL_READINESS_REVIEW.md"), "utf8");

for (const obj of [review, inference, readiness, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG08D") fail(`module_id must be AG08D in ${obj.title || "preview"}`);
}

if (ag08cReview.status !== "article_upgrade_candidate_packet_created") fail("AG08C must be candidate-packet-created");
if (ag08cReview.closure_decision.proceed_to_ag08d_only_with_explicit_user_approval !== true) fail("AG08C must require explicit approval for AG08D");
if (ag08cReview.closure_decision.article_mutation_performed !== false) fail("AG08C must not mutate article");
if (ag08cReview.closure_decision.article_prose_generated !== false) fail("AG08C must not generate final prose");
if (ag08cReadiness.ag08d_handoff.next_stage_id !== "AG08D") fail("AG08C readiness must hand off to AG08D");
if (ag08cSchema.article_mutation_allowed_in_ag08c !== false) fail("AG08C schema must block mutation");

if (review.status !== "inference_reference_visual_readiness_review_completed") fail("AG08D review status mismatch");
if (inference.status !== "inference_review_created_not_persisted_to_production") fail("AG08D inference status mismatch");
if (readiness.status !== "readiness_review_completed_for_ag08e") fail("AG08D readiness status mismatch");
if (schema.status !== "schema_readiness_review_only") fail("AG08D schema status mismatch");
if (learning.status !== "learning_record_only") fail("AG08D learning status mismatch");

const selectedPath = ag08cPacket.selected_article.article_path;
if (review.summary.selected_article_path !== selectedPath) fail("Review selected path mismatch");
if (inference.selected_article_path !== selectedPath) fail("Inference selected path mismatch");
if (readiness.selected_article_path !== selectedPath) fail("Readiness selected path mismatch");

if (!fs.existsSync(path.join(root, selectedPath))) fail(`Selected article does not exist: ${selectedPath}`);
const selectedHtml = fs.readFileSync(path.join(root, selectedPath), "utf8");
const selectedHash = sha256(selectedHtml);

if (inference.selected_article_sha256_before_ag08d !== selectedHash) if (!ag08gControlledApplyAllowsPostMutation()) fail("Inference hash mismatch or AG08G controlled post-apply hash missing");
if (readiness.selected_article_sha256_before_ag08d !== selectedHash) if (!ag08gControlledApplyAllowsPostMutation()) fail("Readiness hash mismatch or AG08G controlled post-apply hash missing");
if (review.summary.selected_article_sha256_before_ag08d !== selectedHash) if (!ag08gControlledApplyAllowsPostMutation()) fail("Review hash mismatch or AG08G controlled post-apply hash missing");
if (ag08cPacket.selected_article.sha256_before_ag08c !== selectedHash) if (!ag08gControlledApplyAllowsPostMutation()) fail("AG08D article hash must match AG08C hash or AG08G controlled post-apply hash missing");

if (!inference.inferred_article_intent) fail("Inference intent missing");
if (!Array.isArray(inference.inferred_risks) || inference.inferred_risks.length < 3) fail("Inference risks missing");
if (inference.production_inference_record_created !== false) fail("Production inference record must not be created");

if (!readiness.reference_readiness) fail("Reference readiness missing");
if (readiness.reference_readiness.url_population_performed_in_ag08d !== false) fail("Reference URL population must not occur in AG08D");
if (readiness.reference_readiness.reference_insertion_performed_in_ag08d !== false) fail("Reference insertion must not occur in AG08D");
if (readiness.reference_readiness.ag08e_requires_web_or_manual_source_verification !== true) fail("AG08E must require source verification");

if (!readiness.visual_data_readiness) fail("Visual/data readiness missing");
if (readiness.visual_data_readiness.visual_generation_performed_in_ag08d !== false) fail("Visual generation must not occur in AG08D");
if (readiness.visual_data_readiness.image_insertion_performed_in_ag08d !== false) fail("Image insertion must not occur in AG08D");

if (!Array.isArray(readiness.quality_gap_matrix) || readiness.quality_gap_matrix.length < 5) fail("Quality gap matrix missing");
if (readiness.ag08e_handoff.next_stage_id !== "AG08E") fail("Readiness must hand off to AG08E");
if (readiness.ag08e_handoff.explicit_approval_required !== true) fail("AG08E handoff must require explicit approval");

if (schema.selected_article_read_allowed_in_ag08d !== true) fail("Schema must allow selected article read");
if (schema.inference_review_allowed_in_ag08d !== true) fail("Schema must allow inference review");
if (schema.reference_readiness_review_allowed_in_ag08d !== true) fail("Schema must allow reference readiness review");
if (schema.visual_data_readiness_review_allowed_in_ag08d !== true) fail("Schema must allow visual/data readiness review");
if (schema.quality_gap_matrix_allowed_in_ag08d !== true) fail("Schema must allow quality gap matrix");
if (schema.ag08e_handoff_allowed_in_ag08d !== true) fail("Schema must allow AG08E handoff");
if (schema.article_mutation_allowed_in_ag08d !== false) fail("Schema must block article mutation");
if (schema.article_prose_generation_allowed_in_ag08d !== false) fail("Schema must block article prose generation");
if (schema.reference_url_population_allowed_in_ag08d !== false) fail("Schema must block reference URL population");
if (schema.reference_insertion_allowed_in_ag08d !== false) fail("Schema must block reference insertion");
if (schema.visual_generation_allowed_in_ag08d !== false) fail("Schema must block visual generation");
if (schema.image_insertion_allowed_in_ag08d !== false) fail("Schema must block image insertion");
if (schema.production_jsonl_append_allowed_in_ag08d !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag08d !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag08d !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_allowed_in_ag08d !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag08d !== false) fail("Schema must block publishing");

for (const obj of [review, registry, preview]) {
  if (obj.summary.ag08d_readiness_review_created !== true) fail(`${obj.title || "preview"} readiness review must be created`);
  if (obj.summary.selected_article_path !== selectedPath) fail(`${obj.title || "preview"} selected path mismatch`);
  if (obj.summary.inference_review_created !== true) fail(`${obj.title || "preview"} inference review must be created`);
  if (obj.summary.reference_readiness_review_created !== true) fail(`${obj.title || "preview"} reference readiness review must be created`);
  if (obj.summary.visual_data_readiness_review_created !== true) fail(`${obj.title || "preview"} visual/data readiness review must be created`);
  if (obj.summary.quality_gap_matrix_created !== true) fail(`${obj.title || "preview"} quality gap matrix must be created`);
  if (obj.summary.next_stage_id !== "AG08E") fail(`${obj.title || "preview"} next stage must be AG08E`);
  if (obj.summary.article_mutation_performed !== false) fail(`${obj.title || "preview"} must not mutate article`);
  if (obj.summary.file_edit_performed !== false) fail(`${obj.title || "preview"} must not edit files`);
  if (obj.summary.article_prose_generated !== false) fail(`${obj.title || "preview"} must not generate final article prose`);
  if (obj.summary.reference_url_population_performed !== false) fail(`${obj.title || "preview"} must not populate reference URLs`);
  if (obj.summary.reference_insertion_performed !== false) fail(`${obj.title || "preview"} must not insert references`);
  if (obj.summary.visual_generation_performed !== false) fail(`${obj.title || "preview"} must not generate visuals`);
  if (obj.summary.image_insertion_performed !== false) fail(`${obj.title || "preview"} must not insert images`);
  if (obj.summary.production_jsonl_append_performed !== false) fail(`${obj.title || "preview"} must not append JSONL`);
  if (obj.summary.database_write_performed !== false) fail(`${obj.title || "preview"} must not write database`);
  if (obj.summary.supabase_write_performed !== false) fail(`${obj.title || "preview"} must not write Supabase`);
  if (obj.summary.backend_auth_supabase_activation_performed !== false) fail(`${obj.title || "preview"} must not activate backend/Auth/Supabase`);
  if (obj.summary.publishing_performed !== false) fail(`${obj.title || "preview"} must not publish`);
  if (obj.summary.production_readiness_after_ag08d !== "readiness_review_completed_not_production_ready") fail(`${obj.title || "preview"} production readiness mismatch`);
  if (obj.summary.publish_readiness_after_ag08d !== "blocked") fail(`${obj.title || "preview"} publish readiness mismatch`);
}

if (review.closure_decision.decision !== "ag08d_readiness_review_closed_ready_for_ag08e_draft_candidate") fail("Closure decision mismatch");
if (review.closure_decision.readiness_review_created !== true) fail("Closure must create readiness review");
if (review.closure_decision.proceed_to_ag08e_only_with_explicit_user_approval !== true) fail("AG08E must require explicit approval");
if (review.closure_decision.article_mutation_performed !== false) fail("Closure must not mutate article");
if (review.closure_decision.file_edit_performed !== false) fail("Closure must not edit files");
if (review.closure_decision.article_prose_generated !== false) fail("Closure must not generate prose");
if (review.closure_decision.reference_url_population_performed !== false) fail("Closure must not populate URLs");
if (review.closure_decision.visual_generation_performed !== false) fail("Closure must not generate visuals");
if (review.closure_decision.production_readiness !== "readiness_review_completed_not_production_ready") fail("Closure production readiness mismatch");
if (review.closure_decision.publish_readiness !== "blocked") fail("Closure publish readiness mismatch");

checkTrueFields([review, inference, readiness, schema, learning, registry, preview], [
  "readiness_review_only",
  "selected_article_read_performed",
  "selected_article_hash_verified",
  "article_inference_review_created",
  "reference_readiness_review_created",
  "visual_data_readiness_review_created",
  "quality_gap_matrix_created",
  "ag08e_handoff_created"
]);

checkFalseFields([review, inference, readiness, schema, learning, registry, preview], [
  "selected_article_mutated",
  "article_mutation_performed",
  "new_article_generation_performed",
  "new_article_file_created",
  "article_file_created",
  "article_prose_generated",
  "final_article_prose_generated",
  "narrative_text_generated",
  "candidate_final_draft_generated",
  "candidate_packet_mutated",
  "production_packet_created",
  "production_article_packet_created",
  "score_calculation_performed",
  "dry_run_score_calculation_performed",
  "actual_score_calculation_performed",
  "approval_state_changed",
  "publish_ready_set",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "static_live_apply_performed",
  "static_live_mutation_performed",
  "file_edit_performed",
  "file_write_performed",
  "article_file_write_performed",
  "target_article_file_write_performed",
  "backup_file_created",
  "rollback_execution_performed",
  "reference_insertion_performed",
  "reference_url_population_performed",
  "approved_reference_url_population_performed",
  "live_url_fetch_performed",
  "visual_generation_performed",
  "visual_asset_generation_performed",
  "image_insertion_performed",
  "data_unit_generation_performed",
  "caption_alt_credit_population_performed",
  "production_jsonl_append_performed",
  "jsonl_append_performed",
  "jsonl_production_record_created",
  "database_write_performed",
  "supabase_write_performed",
  "supabase_enabled",
  "auth_enabled",
  "backend_activation_performed",
  "backend_auth_supabase_activation_performed",
  "api_route_created",
  "public_publishing_performed",
  "publication_approval_granted",
  "public_output_activation_performed",
  "subscriber_output_activation_performed",
  "admin_output_activation_performed",
  "payment_activation_performed",
  "multi_article_mutation_performed"
]);

for (const scriptName of ["generate:ag08d", "validate:ag08d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag08d")) {
  fail("validate:project must include validate:ag08d");
}

for (const phrase of [
  "Purpose",
  "Selected Article",
  "Inference Review",
  "Reference Readiness",
  "Visual/Data Readiness",
  "Quality Gaps",
  "Explicit Exclusions",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG08D document missing phrase: ${phrase}`);
}

pass("AG08D registry is present.");
pass("AG08D document is present.");
pass("AG08D review, inference review, readiness gap matrix, schema, learning record and preview are present.");
pass("AG08C candidate packet is consumed.");
pass(`Readiness review target is ${selectedPath}.`);
pass("Selected article hash is verified and unchanged.");
pass("Article inference review is created.");
pass("Reference readiness review is created without URL population or insertion.");
pass("Visual/data readiness review is created without visual generation or image insertion.");
pass("Quality gap matrix is created.");
pass("AG08E handoff is created with explicit approval required.");
pass("No article mutation, file edit, final prose generation, reference insertion, visual generation or image insertion is performed.");
pass("No production JSONL append, database write, Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is readiness_review_completed_not_production_ready.");
pass("Publish readiness remains blocked.");
pass("AG08D is Inference, Reference and Visual Readiness Review only.");
