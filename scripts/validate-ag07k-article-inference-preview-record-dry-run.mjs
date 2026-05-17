import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07j-article-inference-store-boundary.json",
  "data/content-intelligence/inference-registry/ag07j-article-inference-store-boundary.json",
  "data/content-intelligence/schema/article-inference-store-boundary.schema.json",
  "data/content-intelligence/learning/ag07j-article-inference-store-boundary-learning.json",
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
  "data/content-intelligence/quality-reviews/ag07k-article-inference-preview-record-dry-run.json",
  "data/content-intelligence/inference-records/ag07k-preview-only-article-inference-record.json",
  "data/content-intelligence/schema/article-inference-preview-record.schema.json",
  "data/content-intelligence/learning/ag07k-article-inference-preview-record-learning.json",
  "data/quality/ag07k-article-inference-preview-record-dry-run.json",
  "data/quality/ag07k-article-inference-preview-record-dry-run-preview.json",
  "docs/quality/AG07K_ARTICLE_INFERENCE_PREVIEW_RECORD_DRY_RUN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07K validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function valuePresent(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== "" && value !== null && value !== undefined;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag07jReview = readJson("data/content-intelligence/quality-reviews/ag07j-article-inference-store-boundary.json");
const ag07jStore = readJson("data/content-intelligence/inference-registry/ag07j-article-inference-store-boundary.json");
const ag07jSchema = readJson("data/content-intelligence/schema/article-inference-store-boundary.schema.json");
const ag07iReview = readJson("data/content-intelligence/quality-reviews/ag07i-quality-visitor-value-scoring-boundary.json");
const ag07iModel = readJson("data/content-intelligence/quality-registry/ag07i-quality-visitor-value-scoring-model.json");
const ag07hReview = readJson("data/content-intelligence/quality-reviews/ag07h-visual-data-enrichment-boundary-workbench.json");
const ag07gReview = readJson("data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json");
const ag07cPacket = readJson("data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07k-article-inference-preview-record-dry-run.json");
const record = readJson("data/content-intelligence/inference-records/ag07k-preview-only-article-inference-record.json");
const schema = readJson("data/content-intelligence/schema/article-inference-preview-record.schema.json");
const learning = readJson("data/content-intelligence/learning/ag07k-article-inference-preview-record-learning.json");
const registry = readJson("data/quality/ag07k-article-inference-preview-record-dry-run.json");
const preview = readJson("data/quality/ag07k-article-inference-preview-record-dry-run-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07K_ARTICLE_INFERENCE_PREVIEW_RECORD_DRY_RUN.md"), "utf8");

for (const obj of [review, record, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG07K") fail(`module_id must be AG07K in ${obj.title || "preview"}`);
}

if (review.status !== "preview_inference_record_created") fail("Review status must be preview_inference_record_created");
if (record.status !== "preview_inference_record_created") fail("Record status must be preview_inference_record_created");
if (schema.status !== "schema_preview_dry_run_only") fail("Schema status must be schema_preview_dry_run_only");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");

for (const obj of [review, record, schema, learning, registry, preview]) {
  if (obj.article_inference_preview_record_dry_run_only !== true) fail(`${obj.title || "preview"} must be preview record dry-run only`);
}

if (ag07jReview.status !== "article_inference_store_boundary_defined") fail("AG07J must be article_inference_store_boundary_defined");
if (ag07jReview.closure_decision.proceed_to_ag07k_only_with_explicit_user_approval !== true) fail("AG07J must require explicit approval for AG07K");
if (ag07jReview.closure_decision.actual_article_inference_record_created !== false) fail("AG07J must not create actual inference record");
if (ag07jReview.closure_decision.production_jsonl_append_performed !== false) fail("AG07J must not append production JSONL");
if (ag07jReview.closure_decision.database_write_performed !== false) fail("AG07J must not write database");
if (ag07jReview.closure_decision.supabase_write_performed !== false) fail("AG07J must not write Supabase");
if (ag07jReview.closure_decision.actual_score_calculation_performed !== false) fail("AG07J must not calculate score");
if (ag07jSchema.actual_article_inference_record_creation_allowed_in_ag07j !== false) fail("AG07J schema must block actual inference record creation");

if (ag07iReview.status !== "scoring_boundary_defined") fail("AG07I must be scoring_boundary_defined");
if (ag07iReview.closure_decision.actual_score_calculation_performed !== false) fail("AG07I must not calculate actual score");
if (ag07iModel.actual_scores.quality_score !== null) fail("AG07I quality score must remain null");
if (ag07iModel.actual_scores.visitor_value_score !== null) fail("AG07I visitor-value score must remain null");
if (ag07iModel.actual_scores.combined_score !== null) fail("AG07I combined score must remain null");

if (ag07hReview.status !== "visual_data_enrichment_boundary_defined") fail("AG07H must be visual_data_enrichment_boundary_defined");
if (ag07gReview.status !== "reference_discovery_boundary_defined") fail("AG07G must be reference_discovery_boundary_defined");

if (ag07cPacket.status !== "preview_only_dry_run") fail("AG07C packet must remain preview_only_dry_run");
if (ag07cPacket.preview_only !== true) fail("AG07C packet must remain preview-only");
if (ag07cPacket.production_packet !== false) fail("AG07C packet must remain non-production");
if (ag07cPacket.publish_ready !== false) fail("AG07C packet must remain not publish-ready");
if (ag07cPacket.publication_allowed !== false) fail("AG07C packet must remain not publication-allowed");

if (record.preview_only !== true) fail("AG07K inference record must be preview-only");
if (record.production_record !== false) fail("AG07K inference record must not be production record");
if (!record.record_id || !record.record_id.includes("article-inference-preview:")) fail("AG07K record_id must use article-inference-preview pattern");

const requiredGroups = [
  "article_theme",
  "reader_intent",
  "target_audience",
  "knowledge_depth",
  "evidence_requirement",
  "reference_need",
  "visual_data_need",
  "seo_search_intent_signals",
  "originality_improvement_inference",
  "gap_summary",
  "recommended_upgrade_direction",
  "future_scoring_dependency"
];

if (!Array.isArray(record.inference_field_groups) || record.inference_field_groups.length < requiredGroups.length) {
  fail("AG07K inference field groups must be present");
}

for (const groupName of requiredGroups) {
  const group = record.inference_field_groups.find((item) => item.group_name === groupName);
  if (!group) fail(`Missing AG07K inference group: ${groupName}`);
  if (group.populated_in_ag07k_preview !== true) fail(`Group must be populated in preview: ${groupName}`);
  if (group.production_persisted !== false) fail(`Group must not be production persisted: ${groupName}`);
  if (group.value_population_scope !== "preview_only") fail(`Group value scope must be preview_only: ${groupName}`);
  const values = group.values || {};
  if (!Object.values(values).some(valuePresent)) fail(`At least one preview value must be populated for group: ${groupName}`);
}

if (!record.inference_values?.article_theme?.theme_label) fail("article_theme.theme_label must be populated");
if (!record.inference_values?.reader_intent?.primary_reader_intent) fail("reader_intent.primary_reader_intent must be populated");
if (!record.inference_values?.target_audience?.audience_segment) fail("target_audience.audience_segment must be populated");
if (!record.inference_values?.reference_need?.minimum_reference_need) fail("reference_need.minimum_reference_need must be populated");
if (!record.inference_values?.visual_data_need?.hero_visual_need) fail("visual_data_need.hero_visual_need must be populated");
if (!record.inference_values?.future_scoring_dependency?.score_execution_allowed_after) fail("future_scoring_dependency.score_execution_allowed_after must be populated");

if (record.scoring_dependency_status.score_calculation_allowed_in_ag07k !== false) fail("Score calculation must not be allowed in AG07K");
if (record.scoring_dependency_status.quality_score !== null) fail("AG07K quality score must be null");
if (record.scoring_dependency_status.visitor_value_score !== null) fail("AG07K visitor-value score must be null");
if (record.scoring_dependency_status.combined_score !== null) fail("AG07K combined score must be null");
if (record.scoring_dependency_status.next_scoring_stage !== "AG07L") fail("Next scoring stage must be AG07L");

if (record.persistence_status.production_jsonl_appended !== false) fail("Production JSONL must not be appended");
if (record.persistence_status.database_written !== false) fail("Database must not be written");
if (record.persistence_status.supabase_written !== false) fail("Supabase must not be written");
if (record.persistence_status.public_article_mutated !== false) fail("Public article must not be mutated");
if (record.persistence_status.production_persistence_allowed_in_ag07k !== false) fail("Production persistence must not be allowed in AG07K");

for (const obj of [review, registry, preview]) {
  if (obj.summary.preview_article_inference_record_created !== true) fail(`${obj.title || "preview"} must create preview inference record`);
  if (obj.summary.preview_inference_values_populated !== true) fail(`${obj.title || "preview"} must populate preview inference values`);
  if (obj.summary.actual_article_inference_record_created !== false) fail(`${obj.title || "preview"} must not create actual inference record`);
  if (obj.summary.production_article_inference_record_created !== false) fail(`${obj.title || "preview"} must not create production inference record`);
  if (obj.summary.article_inference_persisted !== false) fail(`${obj.title || "preview"} must not persist inference`);
  if (obj.summary.production_jsonl_append_performed !== false) fail(`${obj.title || "preview"} must not append production JSONL`);
  if (obj.summary.database_write_performed !== false) fail(`${obj.title || "preview"} must not write database`);
  if (obj.summary.supabase_write_performed !== false) fail(`${obj.title || "preview"} must not write Supabase`);
  if (obj.summary.actual_score_calculation_performed !== false) fail(`${obj.title || "preview"} must not calculate scores`);
  if (obj.summary.quality_score_calculated !== false) fail(`${obj.title || "preview"} must not calculate quality score`);
  if (obj.summary.visitor_value_score_calculated !== false) fail(`${obj.title || "preview"} must not calculate visitor-value score`);
  if (obj.summary.combined_score_calculated !== false) fail(`${obj.title || "preview"} must not calculate combined score`);
  if (obj.summary.calculated_quality_score !== null) fail(`${obj.title || "preview"} quality score must be null`);
  if (obj.summary.calculated_visitor_value_score !== null) fail(`${obj.title || "preview"} visitor-value score must be null`);
  if (obj.summary.calculated_combined_score !== null) fail(`${obj.title || "preview"} combined score must be null`);
  if (obj.summary.publish_ready_approval_performed !== false) fail(`${obj.title || "preview"} must not approve publish-ready`);
  if (obj.summary.approval_state_changed !== false) fail(`${obj.title || "preview"} must not change approval state`);
  if (obj.summary.publish_ready_set !== false) fail(`${obj.title || "preview"} must not set publish_ready`);
  if (obj.summary.production_readiness_after_ag07k !== "not_ready") fail(`${obj.title || "preview"} production readiness must remain not_ready`);
  if (obj.summary.publish_readiness_after_ag07k !== "blocked") fail(`${obj.title || "preview"} publish readiness must remain blocked`);
  if (obj.summary.next_stage_id !== "AG07L") fail(`${obj.title || "preview"} next stage must be AG07L`);
}

if (schema.preview_record_creation_allowed_in_ag07k !== true) fail("Schema must allow preview record creation");
if (schema.preview_inference_value_population_allowed_in_ag07k !== true) fail("Schema must allow preview inference value population");
if (schema.production_record_creation_allowed_in_ag07k !== false) fail("Schema must block production record creation");
if (schema.production_jsonl_append_allowed_in_ag07k !== false) fail("Schema must block production JSONL append");
if (schema.database_write_allowed_in_ag07k !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag07k !== false) fail("Schema must block Supabase write");
if (schema.actual_score_calculation_allowed_in_ag07k !== false) fail("Schema must block actual score calculation");
if (schema.publish_ready_approval_allowed_in_ag07k !== false) fail("Schema must block publish-ready approval");
if (schema.approval_state_change_allowed_in_ag07k !== false) fail("Schema must block approval-state change");
if (schema.article_mutation_allowed_in_ag07k !== false) fail("Schema must block article mutation");
if (schema.reference_insertion_allowed_in_ag07k !== false) fail("Schema must block reference insertion");
if (schema.visual_generation_allowed_in_ag07k !== false) fail("Schema must block visual generation");
if (schema.publishing_allowed_in_ag07k !== false) fail("Schema must block publishing");
if (schema.backend_auth_supabase_allowed_in_ag07k !== false) fail("Schema must block backend/Auth/Supabase");

if (review.closure_decision.decision !== "ag07k_article_inference_preview_record_dry_run_closed") fail("AG07K closure decision mismatch");
if (review.closure_decision.proceed_to_ag07l_only_with_explicit_user_approval !== true) fail("AG07L must require explicit approval");
if (review.closure_decision.preview_article_inference_record_created !== true) fail("Preview inference record must be created");
if (review.closure_decision.preview_inference_values_populated !== true) fail("Preview inference values must be populated");
if (review.closure_decision.actual_article_inference_record_created !== false) fail("Actual inference record must not be created");
if (review.closure_decision.production_article_inference_record_created !== false) fail("Production inference record must not be created");
if (review.closure_decision.production_jsonl_append_performed !== false) fail("Production JSONL append must not be performed");
if (review.closure_decision.database_write_performed !== false) fail("Database write must not be performed");
if (review.closure_decision.supabase_write_performed !== false) fail("Supabase write must not be performed");
if (review.closure_decision.actual_score_calculation_performed !== false) fail("Actual score calculation must not be performed");
if (review.closure_decision.production_readiness !== "not_ready") fail("Production readiness must remain not_ready");
if (review.closure_decision.publish_readiness !== "blocked") fail("Publish readiness must remain blocked");

for (const falseField of [
  "actual_article_inference_record_created",
  "production_article_inference_record_created",
  "article_inference_persisted",
  "production_jsonl_append_performed",
  "jsonl_append_performed",
  "jsonl_production_record_created",
  "database_write_performed",
  "supabase_write_performed",
  "supabase_enabled",
  "auth_enabled",
  "actual_score_calculation_performed",
  "quality_score_calculated",
  "visitor_value_score_calculated",
  "combined_score_calculated",
  "scoring_execution_performed",
  "publish_ready_approval_performed",
  "approval_state_changed",
  "publish_ready_set",
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
  "publication_approval_granted"
]) {
  for (const obj of [review, record, schema, learning, registry, preview]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title || "preview"}`);
  }
}

for (const scriptName of ["generate:ag07k", "validate:ag07k"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07k")) {
  fail("validate:project must include validate:ag07k");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Preview Record Scope",
  "Production and Scoring Status",
  "Explicit Exclusions",
  "Compressed Path After AG07K",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07K document missing phrase: ${phrase}`);
}

pass("AG07K registry is present.");
pass("AG07K document is present.");
pass("AG07K review, preview inference record, schema, learning record and preview are present.");
pass("AG07J boundary is consumed.");
pass("Exactly one preview-only article inference record is created.");
pass("Inference field groups are populated as preview values only.");
pass("No production inference record is created.");
pass("No production JSONL append, database write or Supabase write is performed.");
pass("No actual score calculation is performed.");
pass("Publish-ready approval and approval-state change remain blocked.");
pass("AG07C packet remains unchanged, preview-only and non-production.");
pass("Production readiness remains not_ready.");
pass("Publish readiness remains blocked.");
pass("AG07K is Article Inference Preview Record Dry Run only.");
pass("No article prose generation, public mutation, reference insertion, visual generation, scaffold import, publishing or backend/Auth/Supabase activation is enabled or performed.");
pass("AG07L Revised Preview Packet + Dry-Run Scoring is identified as next only with explicit approval.");
