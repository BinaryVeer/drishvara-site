import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07i-quality-visitor-value-scoring-boundary.json",
  "data/content-intelligence/quality-registry/ag07i-quality-visitor-value-scoring-model.json",
  "data/content-intelligence/schema/quality-visitor-value-scoring-boundary.schema.json",
  "data/content-intelligence/learning/ag07i-quality-visitor-value-scoring-boundary-learning.json",
  "data/content-intelligence/quality-reviews/ag07h-visual-data-enrichment-boundary-workbench.json",
  "data/content-intelligence/visual-registry/ag07h-visual-data-enrichment-workbench.json",
  "data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json",
  "data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json",
  "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/ag07j-article-inference-store-boundary.json",
  "data/content-intelligence/inference-registry/ag07j-article-inference-store-boundary.json",
  "data/content-intelligence/schema/article-inference-store-boundary.schema.json",
  "data/content-intelligence/learning/ag07j-article-inference-store-boundary-learning.json",
  "data/quality/ag07j-article-inference-store-boundary.json",
  "data/quality/ag07j-article-inference-store-boundary-preview.json",
  "docs/quality/AG07J_ARTICLE_INFERENCE_STORE_BOUNDARY.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07J validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function isEmptyBoundaryValue(value) {
  if (Array.isArray(value)) return value.length === 0;
  return value === "" || value === null;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag07iReview = readJson("data/content-intelligence/quality-reviews/ag07i-quality-visitor-value-scoring-boundary.json");
const ag07iScoringModel = readJson("data/content-intelligence/quality-registry/ag07i-quality-visitor-value-scoring-model.json");
const ag07iSchema = readJson("data/content-intelligence/schema/quality-visitor-value-scoring-boundary.schema.json");
const ag07hReview = readJson("data/content-intelligence/quality-reviews/ag07h-visual-data-enrichment-boundary-workbench.json");
const ag07gReview = readJson("data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json");
const ag07cPacket = readJson("data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07j-article-inference-store-boundary.json");
const store = readJson("data/content-intelligence/inference-registry/ag07j-article-inference-store-boundary.json");
const schema = readJson("data/content-intelligence/schema/article-inference-store-boundary.schema.json");
const learning = readJson("data/content-intelligence/learning/ag07j-article-inference-store-boundary-learning.json");
const registry = readJson("data/quality/ag07j-article-inference-store-boundary.json");
const preview = readJson("data/quality/ag07j-article-inference-store-boundary-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07J_ARTICLE_INFERENCE_STORE_BOUNDARY.md"), "utf8");

for (const obj of [review, store, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG07J") fail(`module_id must be AG07J in ${obj.title || "preview"}`);
}

if (review.status !== "article_inference_store_boundary_defined") fail("Review status must be article_inference_store_boundary_defined");
if (store.status !== "article_inference_store_boundary_defined") fail("Store status must be article_inference_store_boundary_defined");
if (schema.status !== "schema_boundary_only") fail("Schema status must be schema_boundary_only");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");

for (const obj of [review, store, schema, learning, registry, preview]) {
  if (obj.article_inference_store_boundary_only !== true) fail(`${obj.title || "preview"} must be article inference store boundary only`);
}

if (ag07iReview.status !== "scoring_boundary_defined") fail("AG07I must be scoring_boundary_defined");
if (ag07iReview.closure_decision.proceed_to_ag07j_only_with_explicit_user_approval !== true) fail("AG07I must require explicit approval for AG07J");
if (ag07iReview.closure_decision.ag07j_article_inference_store_boundary_required_before_actual_score_calculation !== true) fail("AG07I must require AG07J before actual scoring");
if (ag07iReview.closure_decision.actual_score_calculation_performed !== false) fail("AG07I must not calculate actual scores");
if (ag07iReview.closure_decision.article_inference_created !== false) fail("AG07I must not create article inference");
if (ag07iReview.closure_decision.article_inference_stored !== false) fail("AG07I must not store article inference");
if (ag07iScoringModel.actual_scores.quality_score !== null) fail("AG07I quality score must remain null");
if (ag07iScoringModel.actual_scores.visitor_value_score !== null) fail("AG07I visitor-value score must remain null");
if (ag07iScoringModel.actual_scores.combined_score !== null) fail("AG07I combined score must remain null");
if (ag07iSchema.actual_score_calculation_allowed_in_ag07i !== false) fail("AG07I schema must block actual score calculation");

if (ag07hReview.status !== "visual_data_enrichment_boundary_defined") fail("AG07H must be visual_data_enrichment_boundary_defined");
if (ag07gReview.status !== "reference_discovery_boundary_defined") fail("AG07G must be reference_discovery_boundary_defined");

if (ag07cPacket.status !== "preview_only_dry_run") fail("AG07C packet must remain preview_only_dry_run");
if (ag07cPacket.preview_only !== true) fail("AG07C packet must remain preview-only");
if (ag07cPacket.production_packet !== false) fail("AG07C packet must remain non-production");
if (ag07cPacket.publish_ready !== false) fail("AG07C packet must remain not publish-ready");
if (ag07cPacket.publication_allowed !== false) fail("AG07C packet must remain not publication-allowed");

if (!store.record_contract) fail("Record contract must be present");
if (store.record_contract.record_family !== "article_inference") fail("Record family must be article_inference");
if (store.record_contract.production_store !== false) fail("Record contract must not be production store");
if (store.record_contract.template_only_in_ag07j !== true) fail("Record contract must be template-only in AG07J");
if (store.record_contract.actual_record_created_in_ag07j !== false) fail("Actual record must not be created in AG07J");
if (store.record_contract.storage_allowed_in_ag07j !== false) fail("Storage must not be allowed in AG07J");
if (store.record_contract.production_jsonl_append_allowed_in_ag07j !== false) fail("Production JSONL append must not be allowed");
if (store.record_contract.database_write_allowed_in_ag07j !== false) fail("Database write must not be allowed");
if (store.record_contract.supabase_write_allowed_in_ag07j !== false) fail("Supabase write must not be allowed");

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

if (!Array.isArray(store.inference_field_groups) || store.inference_field_groups.length < requiredGroups.length) {
  fail("Inference field groups must be present");
}

for (const groupName of requiredGroups) {
  const group = store.inference_field_groups.find((item) => item.group_name === groupName);
  if (!group) fail(`Missing inference group: ${groupName}`);
  if (group.value_population_allowed_in_ag07j !== false) fail(`Value population must be false for group: ${groupName}`);
  if (!Array.isArray(group.fields) || group.fields.length === 0) fail(`Fields must be present for group: ${groupName}`);
  for (const value of Object.values(group.template_values || {})) {
    if (!isEmptyBoundaryValue(value)) fail(`Template values must be empty/null/empty array for group: ${groupName}`);
  }
}

if (!store.inference_record_template) fail("Inference record template must be present");
if (store.inference_record_template.template_only !== true) fail("Inference record template must be template-only");
if (store.inference_record_template.actual_inference_record !== false) fail("Inference record template must not be an actual inference record");
if (store.inference_record_template.inference_status !== "not_created_boundary_only") fail("Inference status must be not_created_boundary_only");
if (store.inference_record_template.inference_values_populated !== false) fail("Inference values must not be populated");

for (const group of Object.values(store.inference_record_template.field_groups || {})) {
  for (const value of Object.values(group || {})) {
    if (!isEmptyBoundaryValue(value)) fail("Inference record template values must remain empty/null/empty arrays");
  }
}

if (!Array.isArray(store.inference_workflow) || store.inference_workflow.length < 5) fail("Inference workflow must be present");
const previewStep = store.inference_workflow.find((step) => step.step_name === "create_preview_inference_record");
if (!previewStep) fail("Future create_preview_inference_record step must be present");
if (previewStep.performed_in_ag07j !== false) fail("create_preview_inference_record must not be performed in AG07J");
if (previewStep.future_approval_required !== true) fail("create_preview_inference_record must require future approval");

for (const obj of [review, store, registry, preview]) {
  if (obj.summary.actual_article_inference_record_created !== false) fail(`${obj.title || "preview"} must not create actual inference record`);
  if (obj.summary.article_inference_generated !== false) fail(`${obj.title || "preview"} must not generate inference`);
  if (obj.summary.article_inference_stored !== false) fail(`${obj.title || "preview"} must not store inference`);
  if (obj.summary.article_inference_persisted !== false) fail(`${obj.title || "preview"} must not persist inference`);
  if (obj.summary.inference_value_population_performed !== false) fail(`${obj.title || "preview"} must not populate inference values`);
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
  if (obj.summary.production_readiness_after_ag07j !== "not_ready") fail(`${obj.title || "preview"} production readiness must remain not_ready`);
  if (obj.summary.publish_readiness_after_ag07j !== "blocked") fail(`${obj.title || "preview"} publish readiness must remain blocked`);
  if (obj.summary.next_stage_id !== "AG07K") fail(`${obj.title || "preview"} next stage must be AG07K`);
}

if (schema.actual_article_inference_record_creation_allowed_in_ag07j !== false) fail("Schema must block actual inference record creation");
if (schema.inference_value_population_allowed_in_ag07j !== false) fail("Schema must block inference value population");
if (schema.production_jsonl_append_allowed_in_ag07j !== false) fail("Schema must block production JSONL append");
if (schema.database_write_allowed_in_ag07j !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag07j !== false) fail("Schema must block Supabase write");
if (schema.actual_score_calculation_allowed_in_ag07j !== false) fail("Schema must block actual score calculation");
if (schema.publish_ready_approval_allowed_in_ag07j !== false) fail("Schema must block publish-ready approval");
if (schema.approval_state_change_allowed_in_ag07j !== false) fail("Schema must block approval-state change");
if (schema.article_mutation_allowed_in_ag07j !== false) fail("Schema must block article mutation");
if (schema.reference_insertion_allowed_in_ag07j !== false) fail("Schema must block reference insertion");
if (schema.visual_generation_allowed_in_ag07j !== false) fail("Schema must block visual generation");
if (schema.publishing_allowed_in_ag07j !== false) fail("Schema must block publishing");
if (schema.backend_auth_supabase_allowed_in_ag07j !== false) fail("Schema must block backend/Auth/Supabase");

if (review.closure_decision.decision !== "ag07j_article_inference_store_boundary_closed") fail("AG07J closure decision mismatch");
if (review.closure_decision.proceed_to_ag07k_only_with_explicit_user_approval !== true) fail("AG07K must require explicit approval");
if (review.closure_decision.article_inference_store_boundary_defined !== true) fail("Article inference store boundary must be defined");
if (review.closure_decision.actual_article_inference_record_created !== false) fail("Actual inference record must not be created");
if (review.closure_decision.article_inference_generated !== false) fail("Article inference must not be generated");
if (review.closure_decision.article_inference_stored !== false) fail("Article inference must not be stored");
if (review.closure_decision.article_inference_persisted !== false) fail("Article inference must not be persisted");
if (review.closure_decision.production_jsonl_append_performed !== false) fail("Production JSONL append must not be performed");
if (review.closure_decision.database_write_performed !== false) fail("Database write must not be performed");
if (review.closure_decision.supabase_write_performed !== false) fail("Supabase write must not be performed");
if (review.closure_decision.actual_score_calculation_performed !== false) fail("Actual score calculation must not be performed");
if (review.closure_decision.production_readiness !== "not_ready") fail("Production readiness must remain not_ready");
if (review.closure_decision.publish_readiness !== "blocked") fail("Publish readiness must remain blocked");

for (const falseField of [
  "actual_article_inference_record_created",
  "article_inference_generated",
  "article_inference_stored",
  "article_inference_persisted",
  "inference_value_population_performed",
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
  "jsonl_append_performed",
  "jsonl_production_record_created",
  "production_jsonl_append_performed",
  "database_write_performed",
  "supabase_write_performed",
  "supabase_enabled",
  "auth_enabled",
  "backend_activation_performed",
  "api_route_created",
  "public_publishing_performed",
  "publication_approval_granted"
]) {
  for (const obj of [review, store, schema, learning, registry, preview]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title || "preview"}`);
  }
}

for (const scriptName of ["generate:ag07j", "validate:ag07j"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07j")) {
  fail("validate:project must include validate:ag07j");
}

for (const phrase of [
  "Purpose",
  "Why This Stage Exists",
  "Inputs",
  "Store Boundary",
  "Inference Field Groups",
  "Inference Status",
  "Production Readiness Decision",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07J document missing phrase: ${phrase}`);
}

pass("AG07J registry is present.");
pass("AG07J document is present.");
pass("AG07J review, store boundary, schema, learning record and preview are present.");
pass("AG07I boundary is consumed.");
pass("Article inference store contract is defined.");
pass("Required inference field groups are defined.");
pass("Inference record template is template-only.");
pass("All inference template values remain empty, null or empty arrays.");
pass("No actual article inference record is created.");
pass("No inference values are generated, stored or persisted.");
pass("No actual score calculation is performed.");
pass("No production JSONL append, database write or Supabase write is performed.");
pass("Publish-ready approval and approval-state change remain blocked.");
pass("AG07C packet remains unchanged, preview-only and non-production.");
pass("Production readiness remains not_ready.");
pass("Publish readiness remains blocked.");
pass("AG07J is Article Inference Store Boundary only.");
pass("No article prose generation, public mutation, reference insertion, visual generation, scaffold import, publishing or backend/Auth/Supabase activation is enabled or performed.");
pass("AG07K Article Inference Preview Record Dry Run is identified as next only with explicit approval.");
