import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07k-article-inference-preview-record-dry-run.json",
  "data/content-intelligence/inference-records/ag07k-preview-only-article-inference-record.json",
  "data/content-intelligence/schema/article-inference-preview-record.schema.json",
  "data/content-intelligence/learning/ag07k-article-inference-preview-record-learning.json",
  "data/content-intelligence/quality-reviews/ag07j-article-inference-store-boundary.json",
  "data/content-intelligence/quality-reviews/ag07i-quality-visitor-value-scoring-boundary.json",
  "data/content-intelligence/quality-registry/ag07i-quality-visitor-value-scoring-model.json",
  "data/content-intelligence/quality-reviews/ag07h-visual-data-enrichment-boundary-workbench.json",
  "data/content-intelligence/visual-registry/ag07h-visual-data-enrichment-workbench.json",
  "data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json",
  "data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json",
  "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/ag07l-revised-preview-packet-dry-run-scoring.json",
  "data/content-intelligence/content-packets/ag07l-revised-preview-packet-dry-run.json",
  "data/content-intelligence/quality-registry/ag07l-dry-run-scoring-result.json",
  "data/content-intelligence/schema/revised-preview-packet-dry-run-scoring.schema.json",
  "data/content-intelligence/learning/ag07l-revised-preview-packet-dry-run-scoring-learning.json",
  "data/quality/ag07l-revised-preview-packet-dry-run-scoring.json",
  "data/quality/ag07l-revised-preview-packet-dry-run-scoring-preview.json",
  "docs/quality/AG07L_REVISED_PREVIEW_PACKET_DRY_RUN_SCORING.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07L validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function checkFalseFields(objects, fields) {
  for (const field of fields) {
    for (const obj of objects) {
      if (obj[field] !== false) fail(`${field} must be false in ${obj.title || obj.module_id || "object"}`);
    }
  }
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag07kReview = readJson("data/content-intelligence/quality-reviews/ag07k-article-inference-preview-record-dry-run.json");
const ag07kRecord = readJson("data/content-intelligence/inference-records/ag07k-preview-only-article-inference-record.json");
const ag07kSchema = readJson("data/content-intelligence/schema/article-inference-preview-record.schema.json");
const ag07jReview = readJson("data/content-intelligence/quality-reviews/ag07j-article-inference-store-boundary.json");
const ag07iReview = readJson("data/content-intelligence/quality-reviews/ag07i-quality-visitor-value-scoring-boundary.json");
const ag07iModel = readJson("data/content-intelligence/quality-registry/ag07i-quality-visitor-value-scoring-model.json");
const ag07hReview = readJson("data/content-intelligence/quality-reviews/ag07h-visual-data-enrichment-boundary-workbench.json");
const ag07gReview = readJson("data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json");
const ag07cPacket = readJson("data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07l-revised-preview-packet-dry-run-scoring.json");
const packet = readJson("data/content-intelligence/content-packets/ag07l-revised-preview-packet-dry-run.json");
const scoring = readJson("data/content-intelligence/quality-registry/ag07l-dry-run-scoring-result.json");
const schema = readJson("data/content-intelligence/schema/revised-preview-packet-dry-run-scoring.schema.json");
const learning = readJson("data/content-intelligence/learning/ag07l-revised-preview-packet-dry-run-scoring-learning.json");
const registry = readJson("data/quality/ag07l-revised-preview-packet-dry-run-scoring.json");
const preview = readJson("data/quality/ag07l-revised-preview-packet-dry-run-scoring-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07L_REVISED_PREVIEW_PACKET_DRY_RUN_SCORING.md"), "utf8");

for (const obj of [review, packet, scoring, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG07L") fail(`module_id must be AG07L in ${obj.title || "preview"}`);
}

if (review.status !== "revised_preview_packet_and_dry_run_scores_created") fail("Review status must be revised_preview_packet_and_dry_run_scores_created");
if (packet.status !== "revised_preview_packet_created") fail("Packet status must be revised_preview_packet_created");
if (scoring.status !== "dry_run_scores_calculated") fail("Scoring status must be dry_run_scores_calculated");
if (schema.status !== "schema_preview_dry_run_only") fail("Schema status must be schema_preview_dry_run_only");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");

if (ag07kReview.status !== "preview_inference_record_created") fail("AG07K must be preview_inference_record_created");
if (ag07kReview.closure_decision.proceed_to_ag07l_only_with_explicit_user_approval !== true) fail("AG07K must require explicit approval for AG07L");
if (ag07kReview.closure_decision.preview_article_inference_record_created !== true) fail("AG07K must create preview inference record");
if (ag07kReview.closure_decision.actual_score_calculation_performed !== false) fail("AG07K must not calculate actual score");
if (ag07kReview.closure_decision.production_jsonl_append_performed !== false) fail("AG07K must not append production JSONL");
if (ag07kReview.closure_decision.database_write_performed !== false) fail("AG07K must not write database");
if (ag07kReview.closure_decision.supabase_write_performed !== false) fail("AG07K must not write Supabase");
if (ag07kRecord.preview_only !== true) fail("AG07K inference record must be preview-only");
if (ag07kRecord.production_record !== false) fail("AG07K inference record must not be production record");
if (ag07kSchema.actual_score_calculation_allowed_in_ag07k !== false) fail("AG07K schema must block actual score calculation");

if (ag07jReview.status !== "article_inference_store_boundary_defined") fail("AG07J must be article_inference_store_boundary_defined");
if (ag07iReview.status !== "scoring_boundary_defined") fail("AG07I must be scoring_boundary_defined");
if (ag07hReview.status !== "visual_data_enrichment_boundary_defined") fail("AG07H must be visual_data_enrichment_boundary_defined");
if (ag07gReview.status !== "reference_discovery_boundary_defined") fail("AG07G must be reference_discovery_boundary_defined");

if (ag07cPacket.status !== "preview_only_dry_run") fail("AG07C packet must remain preview_only_dry_run");
if (ag07cPacket.preview_only !== true) fail("AG07C packet must remain preview-only");
if (ag07cPacket.production_packet !== false) fail("AG07C packet must remain non-production");
if (ag07cPacket.publish_ready !== false) fail("AG07C packet must remain not publish-ready");
if (ag07cPacket.publication_allowed !== false) fail("AG07C packet must remain not publication-allowed");

if (packet.preview_only !== true) fail("AG07L packet must be preview-only");
if (packet.production_packet !== false) fail("AG07L packet must not be production packet");
if (packet.publish_ready !== false) fail("AG07L packet must not be publish-ready");
if (packet.publication_allowed !== false) fail("AG07L packet publication must not be allowed");
if (!Array.isArray(packet.revised_sections) || packet.revised_sections.length < 6) fail("AG07L revised sections must be present");
for (const section of packet.revised_sections) {
  if (section.section_status !== "planned_preview_only") fail(`Section must be planned_preview_only: ${section.section_id}`);
  if (section.prose_generated !== false) fail(`Section prose must not be generated: ${section.section_id}`);
}

if (packet.reference_plan.reference_urls_populated_in_ag07l !== false) fail("Reference URLs must not be populated in AG07L");
if (packet.reference_plan.reference_insertion_performed !== false) fail("Reference insertion must not be performed in AG07L");
if (packet.visual_data_plan.visual_generation_performed !== false) fail("Visual generation must not be performed in AG07L");
if (packet.visual_data_plan.image_insertion_performed !== false) fail("Image insertion must not be performed in AG07L");
if (packet.static_live_readiness_preview.static_live_mutation_allowed_in_ag07l !== false) fail("Static-live mutation must not be allowed in AG07L");

if (scoring.preview_only !== true) fail("Scoring result must be preview-only");
if (scoring.production_score_record !== false) fail("Scoring result must not be production score record");
if (scoring.scoring_scope !== "dry_run_only") fail("Scoring scope must be dry_run_only");
if (!Array.isArray(scoring.quality_dimension_scores) || scoring.quality_dimension_scores.length < 5) fail("Quality dimension scores must be present");
if (!Array.isArray(scoring.visitor_value_dimension_scores) || scoring.visitor_value_dimension_scores.length < 5) fail("Visitor-value dimension scores must be present");
if (!(scoring.dry_run_scores.quality_score > 0)) fail("Dry-run quality score must be greater than zero");
if (!(scoring.dry_run_scores.visitor_value_score > 0)) fail("Dry-run visitor-value score must be greater than zero");
if (!(scoring.dry_run_scores.combined_score > 0)) fail("Dry-run combined score must be greater than zero");
if (scoring.threshold_result.publish_ready_recommended !== false) fail("Publish-ready must not be recommended");
if (scoring.actual_score_calculation_performed !== false) fail("Actual score calculation must not be performed");
if (scoring.publish_ready_approval_performed !== false) fail("Publish-ready approval must not be performed");
if (scoring.approval_state_changed !== false) fail("Approval state must not be changed");
if (scoring.publish_ready_set !== false) fail("publish_ready must not be set");

for (const obj of [review, registry, preview]) {
  if (obj.summary.revised_preview_packet_created !== true) fail(`${obj.title || "preview"} must create revised preview packet`);
  if (obj.summary.dry_run_score_calculation_performed !== true) fail(`${obj.title || "preview"} must calculate dry-run scores`);
  if (obj.summary.dry_run_quality_score_calculated !== true) fail(`${obj.title || "preview"} must calculate dry-run quality score`);
  if (obj.summary.dry_run_visitor_value_score_calculated !== true) fail(`${obj.title || "preview"} must calculate dry-run visitor-value score`);
  if (obj.summary.dry_run_combined_score_calculated !== true) fail(`${obj.title || "preview"} must calculate dry-run combined score`);
  if (!(obj.summary.dry_run_quality_score > 0)) fail(`${obj.title || "preview"} dry-run quality score must be greater than zero`);
  if (!(obj.summary.dry_run_visitor_value_score > 0)) fail(`${obj.title || "preview"} dry-run visitor-value score must be greater than zero`);
  if (!(obj.summary.dry_run_combined_score > 0)) fail(`${obj.title || "preview"} dry-run combined score must be greater than zero`);
  if (obj.summary.dry_run_thresholds_met !== false) fail(`${obj.title || "preview"} thresholds must not be met`);
  if (obj.summary.publish_ready_recommended !== false) fail(`${obj.title || "preview"} publish-ready must not be recommended`);
  if (obj.summary.actual_score_calculation_performed !== false) fail(`${obj.title || "preview"} must not perform actual score calculation`);
  if (obj.summary.production_packet_created !== false) fail(`${obj.title || "preview"} must not create production packet`);
  if (obj.summary.publish_ready_approval_performed !== false) fail(`${obj.title || "preview"} must not approve publish-ready`);
  if (obj.summary.approval_state_changed !== false) fail(`${obj.title || "preview"} must not change approval state`);
  if (obj.summary.publish_ready_set !== false) fail(`${obj.title || "preview"} must not set publish-ready`);
  if (obj.summary.production_jsonl_append_performed !== false) fail(`${obj.title || "preview"} must not append production JSONL`);
  if (obj.summary.database_write_performed !== false) fail(`${obj.title || "preview"} must not write database`);
  if (obj.summary.supabase_write_performed !== false) fail(`${obj.title || "preview"} must not write Supabase`);
  if (obj.summary.production_readiness_after_ag07l !== "not_ready") fail(`${obj.title || "preview"} production readiness must remain not_ready`);
  if (obj.summary.publish_readiness_after_ag07l !== "blocked") fail(`${obj.title || "preview"} publish readiness must remain blocked`);
  if (obj.summary.next_stage_id !== "AG07M") fail(`${obj.title || "preview"} next stage must be AG07M`);
}

if (schema.revised_preview_packet_creation_allowed_in_ag07l !== true) fail("Schema must allow revised preview packet creation");
if (schema.dry_run_score_calculation_allowed_in_ag07l !== true) fail("Schema must allow dry-run score calculation");
if (schema.actual_score_calculation_allowed_in_ag07l !== false) fail("Schema must block actual score calculation");
if (schema.production_score_record_creation_allowed_in_ag07l !== false) fail("Schema must block production score record creation");
if (schema.production_packet_creation_allowed_in_ag07l !== false) fail("Schema must block production packet creation");
if (schema.publish_ready_approval_allowed_in_ag07l !== false) fail("Schema must block publish-ready approval");
if (schema.approval_state_change_allowed_in_ag07l !== false) fail("Schema must block approval-state change");
if (schema.production_jsonl_append_allowed_in_ag07l !== false) fail("Schema must block production JSONL append");
if (schema.database_write_allowed_in_ag07l !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag07l !== false) fail("Schema must block Supabase write");
if (schema.article_prose_generation_allowed_in_ag07l !== false) fail("Schema must block article prose generation");
if (schema.article_mutation_allowed_in_ag07l !== false) fail("Schema must block article mutation");
if (schema.reference_insertion_allowed_in_ag07l !== false) fail("Schema must block reference insertion");
if (schema.visual_generation_allowed_in_ag07l !== false) fail("Schema must block visual generation");
if (schema.static_live_mutation_allowed_in_ag07l !== false) fail("Schema must block static-live mutation");
if (schema.publishing_allowed_in_ag07l !== false) fail("Schema must block publishing");
if (schema.backend_auth_supabase_allowed_in_ag07l !== false) fail("Schema must block backend/Auth/Supabase");

if (review.closure_decision.decision !== "ag07l_revised_preview_packet_dry_run_scoring_closed") fail("AG07L closure decision mismatch");
if (review.closure_decision.proceed_to_ag07m_only_with_explicit_user_approval !== true) fail("AG07M must require explicit approval");
if (review.closure_decision.revised_preview_packet_created !== true) fail("Revised preview packet must be created");
if (review.closure_decision.dry_run_score_calculation_performed !== true) fail("Dry-run score calculation must be performed");
if (review.closure_decision.actual_score_calculation_performed !== false) fail("Actual score calculation must not be performed");
if (review.closure_decision.production_packet_created !== false) fail("Production packet must not be created");
if (review.closure_decision.publish_ready_approval_performed !== false) fail("Publish-ready approval must not be performed");
if (review.closure_decision.production_jsonl_append_performed !== false) fail("Production JSONL append must not be performed");
if (review.closure_decision.database_write_performed !== false) fail("Database write must not be performed");
if (review.closure_decision.supabase_write_performed !== false) fail("Supabase write must not be performed");
if (review.closure_decision.public_article_mutation_performed !== false) fail("Public article mutation must not be performed");
if (review.closure_decision.reference_insertion_performed !== false) fail("Reference insertion must not be performed");
if (review.closure_decision.visual_generation_performed !== false) fail("Visual generation must not be performed");
if (review.closure_decision.static_live_mutation_performed !== false) fail("Static-live mutation must not be performed");
if (review.closure_decision.production_readiness !== "not_ready") fail("Production readiness must remain not_ready");
if (review.closure_decision.publish_readiness !== "blocked") fail("Publish readiness must remain blocked");

checkFalseFields([review, packet, scoring, schema, learning, registry, preview], [
  "actual_score_calculation_performed",
  "production_score_record_created",
  "production_packet_created",
  "publish_ready_approval_performed",
  "approval_state_changed",
  "publish_ready_set",
  "production_jsonl_append_performed",
  "jsonl_append_performed",
  "jsonl_production_record_created",
  "database_write_performed",
  "supabase_write_performed",
  "supabase_enabled",
  "auth_enabled",
  "article_prose_generated",
  "narrative_text_generated",
  "production_content_generated",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "reference_insertion_performed",
  "reference_url_population_performed",
  "visual_generation_performed",
  "visual_asset_generation_performed",
  "image_insertion_performed",
  "data_unit_generation_performed",
  "scaffold_import_performed",
  "scaffold_file_copy_performed",
  "scaffold_file_move_performed",
  "scaffold_file_delete_performed",
  "backend_activation_performed",
  "api_route_created",
  "public_publishing_performed",
  "publication_approval_granted",
  "static_live_mutation_performed"
]);

for (const scriptName of ["generate:ag07l", "validate:ag07l"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07l")) {
  fail("validate:project must include validate:ag07l");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Revised Preview Packet Scope",
  "Dry-Run Scoring Scope",
  "Production Readiness Decision",
  "Explicit Exclusions",
  "Static-Live Compatibility Note",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07L document missing phrase: ${phrase}`);
}

pass("AG07L registry is present.");
pass("AG07L document is present.");
pass("AG07L review, revised preview packet, dry-run scoring result, schema, learning record and preview are present.");
pass("AG07K preview inference record is consumed.");
pass("One revised preview packet is created.");
pass("Dry-run quality, visitor-value and combined scores are calculated.");
pass("Dry-run scores do not create publish-ready approval.");
pass("Production packet creation remains blocked.");
pass("No production JSONL append, database write or Supabase write is performed.");
pass("No article prose generation, public mutation, reference insertion, visual generation or static-live mutation is performed.");
pass("AG07C packet remains unchanged, preview-only and non-production.");
pass("Production readiness remains not_ready.");
pass("Publish readiness remains blocked.");
pass("AG07L is Revised Preview Packet + Dry-Run Scoring only.");
pass("AG07M Improvement Pass is identified as next only with explicit approval.");
