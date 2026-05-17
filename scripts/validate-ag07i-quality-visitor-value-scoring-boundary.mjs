import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07h-visual-data-enrichment-boundary-workbench.json",
  "data/content-intelligence/visual-registry/ag07h-visual-data-enrichment-workbench.json",
  "data/content-intelligence/schema/visual-data-enrichment-workbench.schema.json",
  "data/content-intelligence/learning/ag07h-visual-data-enrichment-boundary-learning.json",
  "data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json",
  "data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json",
  "data/content-intelligence/quality-reviews/ag07f-preview-packet-schema-revision-boundary.json",
  "data/content-intelligence/run-registry/ag07f-preview-packet-contract-boundary-plan.json",
  "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/ag07i-quality-visitor-value-scoring-boundary.json",
  "data/content-intelligence/quality-registry/ag07i-quality-visitor-value-scoring-model.json",
  "data/content-intelligence/schema/quality-visitor-value-scoring-boundary.schema.json",
  "data/content-intelligence/learning/ag07i-quality-visitor-value-scoring-boundary-learning.json",
  "data/quality/ag07i-quality-visitor-value-scoring-boundary.json",
  "data/quality/ag07i-quality-visitor-value-scoring-boundary-preview.json",
  "docs/quality/AG07I_QUALITY_VISITOR_VALUE_SCORING_BOUNDARY.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07I validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function weightTotal(items) {
  return items.reduce((sum, item) => sum + Number(item.weight || 0), 0);
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag07hReview = readJson("data/content-intelligence/quality-reviews/ag07h-visual-data-enrichment-boundary-workbench.json");
const ag07hWorkbench = readJson("data/content-intelligence/visual-registry/ag07h-visual-data-enrichment-workbench.json");
const ag07hSchema = readJson("data/content-intelligence/schema/visual-data-enrichment-workbench.schema.json");
const ag07gReview = readJson("data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json");
const ag07fReview = readJson("data/content-intelligence/quality-reviews/ag07f-preview-packet-schema-revision-boundary.json");
const ag07cPacket = readJson("data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07i-quality-visitor-value-scoring-boundary.json");
const scoringModel = readJson("data/content-intelligence/quality-registry/ag07i-quality-visitor-value-scoring-model.json");
const schema = readJson("data/content-intelligence/schema/quality-visitor-value-scoring-boundary.schema.json");
const learning = readJson("data/content-intelligence/learning/ag07i-quality-visitor-value-scoring-boundary-learning.json");
const registry = readJson("data/quality/ag07i-quality-visitor-value-scoring-boundary.json");
const preview = readJson("data/quality/ag07i-quality-visitor-value-scoring-boundary-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07I_QUALITY_VISITOR_VALUE_SCORING_BOUNDARY.md"), "utf8");

for (const obj of [review, scoringModel, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG07I") fail(`module_id must be AG07I in ${obj.title || "preview"}`);
}

if (review.status !== "scoring_boundary_defined") fail("Review status must be scoring_boundary_defined");
if (scoringModel.status !== "scoring_boundary_defined") fail("Scoring model status must be scoring_boundary_defined");
if (schema.status !== "schema_boundary_only") fail("Schema status must be schema_boundary_only");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");

for (const obj of [review, scoringModel, schema, learning, registry, preview]) {
  if (obj.quality_visitor_value_scoring_boundary_only !== true) fail(`${obj.title || "preview"} must be scoring boundary only`);
}

if (ag07hReview.status !== "visual_data_enrichment_boundary_defined") fail("AG07H must be visual_data_enrichment_boundary_defined");
if (ag07hReview.closure_decision.proceed_to_ag07i_only_with_explicit_user_approval !== true) fail("AG07H must require explicit approval for AG07I");
if (ag07hReview.closure_decision.visual_generation_performed !== false) fail("AG07H must not generate visuals");
if (ag07hReview.closure_decision.image_insertion_performed !== false) fail("AG07H must not insert images");
if (ag07hReview.closure_decision.public_article_mutation_allowed !== false) fail("AG07H must block public mutation");
if (ag07hReview.closure_decision.reference_insertion_allowed !== false) fail("AG07H must block reference insertion");

if (ag07gReview.status !== "reference_discovery_boundary_defined") fail("AG07G must be reference_discovery_boundary_defined");
if (ag07fReview.status !== "schema_contract_boundary_defined") fail("AG07F must be schema_contract_boundary_defined");

if (ag07cPacket.status !== "preview_only_dry_run") fail("AG07C packet must remain preview_only_dry_run");
if (ag07cPacket.preview_only !== true) fail("AG07C packet must remain preview-only");
if (ag07cPacket.production_packet !== false) fail("AG07C packet must remain non-production");
if (ag07cPacket.publish_ready !== false) fail("AG07C packet must remain not publish-ready");
if (ag07cPacket.publication_allowed !== false) fail("AG07C packet must remain not publication-allowed");

if (!Array.isArray(ag07hWorkbench.visual_need_slots) || ag07hWorkbench.visual_need_slots.length < 3) fail("AG07H visual slots must exist");
if (ag07hSchema.visual_generation_allowed_in_ag07h !== false) fail("AG07H schema must block visual generation");

if (!Array.isArray(scoringModel.quality_dimensions) || scoringModel.quality_dimensions.length < 5) fail("Quality dimensions must be present");
if (!Array.isArray(scoringModel.visitor_value_dimensions) || scoringModel.visitor_value_dimensions.length < 5) fail("Visitor-value dimensions must be present");
if (weightTotal(scoringModel.quality_dimensions) !== 100) fail("Quality dimension weights must total 100");
if (weightTotal(scoringModel.visitor_value_dimensions) !== 100) fail("Visitor-value dimension weights must total 100");

for (const dimension of [...scoringModel.quality_dimensions, ...scoringModel.visitor_value_dimensions]) {
  if (dimension.calculation_allowed_in_ag07i !== false) fail(`Dimension calculation must be blocked: ${dimension.dimension_id}`);
  if (dimension.dimension_status !== "not_evaluated") fail(`Dimension must remain not_evaluated: ${dimension.dimension_id}`);
  if (dimension.calculated_score !== null) fail(`Calculated score must be null: ${dimension.dimension_id}`);
}

if (!scoringModel.scoring_thresholds) fail("Scoring thresholds must be defined");
if (scoringModel.scoring_thresholds.article_inference_required_before_score_calculation !== true) fail("Article inference must be required before score calculation");
if (scoringModel.scoring_thresholds.revised_preview_packet_required_before_score_calculation !== true) fail("Revised preview packet must be required before score calculation");
if (scoringModel.scoring_thresholds.actual_threshold_evaluation_performed_in_ag07i !== false) fail("Threshold evaluation must not be performed in AG07I");

if (!Array.isArray(scoringModel.readiness_gate_groups) || scoringModel.readiness_gate_groups.length < 5) fail("Readiness gate groups must be present");
const inferenceGate = scoringModel.readiness_gate_groups.find((gate) => gate.gate_group_name === "article_inference_gate");
if (!inferenceGate) fail("Article inference gate must be present");
if (inferenceGate.next_stage_dependency !== "AG07J") fail("Article inference gate must route to AG07J");
for (const gate of scoringModel.readiness_gate_groups) {
  if (gate.evaluated_in_ag07i !== false) fail(`Gate must not be evaluated in AG07I: ${gate.gate_group_id}`);
  if (gate.gate_status !== "not_evaluated") fail(`Gate status must remain not_evaluated: ${gate.gate_group_id}`);
}

if (!Array.isArray(scoringModel.reviewer_decision_fields) || scoringModel.reviewer_decision_fields.length < 4) fail("Reviewer decision fields must be present");
for (const field of scoringModel.reviewer_decision_fields) {
  if (field.value_set_in_ag07i !== false) fail(`Reviewer field must not be set in AG07I: ${field.field_id}`);
}

if (!Array.isArray(scoringModel.scoring_workflow) || scoringModel.scoring_workflow.length < 5) fail("Scoring workflow must be present");
const calcStep = scoringModel.scoring_workflow.find((step) => step.step_name === "calculate_scores");
if (!calcStep) fail("Future calculate_scores workflow step must be present");
if (calcStep.performed_in_ag07i !== false) fail("calculate_scores must not be performed in AG07I");
if (calcStep.future_approval_required !== true) fail("calculate_scores must require future approval");

if (scoringModel.actual_scores.quality_score !== null) fail("Actual quality score must be null");
if (scoringModel.actual_scores.visitor_value_score !== null) fail("Actual visitor-value score must be null");
if (scoringModel.actual_scores.combined_score !== null) fail("Actual combined score must be null");
if (scoringModel.actual_scores.calculation_status !== "not_calculated_in_ag07i") fail("Actual score calculation status must remain not_calculated_in_ag07i");
if (scoringModel.actual_scores.score_calculation_allowed_in_ag07i !== false) fail("Score calculation must not be allowed in AG07I");

for (const obj of [review, scoringModel, registry, preview]) {
  if (obj.summary.actual_score_calculation_performed !== false) fail(`${obj.title || "preview"} must not calculate actual scores`);
  if (obj.summary.quality_score_calculated !== false) fail(`${obj.title || "preview"} must not calculate quality score`);
  if (obj.summary.visitor_value_score_calculated !== false) fail(`${obj.title || "preview"} must not calculate visitor-value score`);
  if (obj.summary.combined_score_calculated !== false) fail(`${obj.title || "preview"} must not calculate combined score`);
  if (obj.summary.calculated_quality_score !== null) fail(`${obj.title || "preview"} quality score must be null`);
  if (obj.summary.calculated_visitor_value_score !== null) fail(`${obj.title || "preview"} visitor-value score must be null`);
  if (obj.summary.calculated_combined_score !== null) fail(`${obj.title || "preview"} combined score must be null`);
  if (obj.summary.article_inference_store_required_before_actual_scoring !== true) fail(`${obj.title || "preview"} must require article inference before scoring`);
  if (obj.summary.next_stage_id !== "AG07J") fail(`${obj.title || "preview"} next stage must be AG07J`);
  if (obj.summary.publish_ready_approval_performed !== false) fail(`${obj.title || "preview"} must not approve publish-ready`);
  if (obj.summary.approval_state_changed !== false) fail(`${obj.title || "preview"} must not change approval state`);
  if (obj.summary.publish_ready_set !== false) fail(`${obj.title || "preview"} must not set publish_ready`);
  if (obj.summary.production_readiness_after_ag07i !== "not_ready") fail(`${obj.title || "preview"} production readiness must remain not_ready`);
  if (obj.summary.publish_readiness_after_ag07i !== "blocked") fail(`${obj.title || "preview"} publish readiness must remain blocked`);
}

if (schema.actual_score_calculation_allowed_in_ag07i !== false) fail("Schema must block actual score calculation");
if (schema.publish_ready_approval_allowed_in_ag07i !== false) fail("Schema must block publish-ready approval");
if (schema.approval_state_change_allowed_in_ag07i !== false) fail("Schema must block approval-state change");
if (schema.article_inference_creation_allowed_in_ag07i !== false) fail("Schema must block article inference creation in AG07I");
if (schema.article_mutation_allowed_in_ag07i !== false) fail("Schema must block article mutation");
if (schema.reference_insertion_allowed_in_ag07i !== false) fail("Schema must block reference insertion");
if (schema.visual_generation_allowed_in_ag07i !== false) fail("Schema must block visual generation");
if (schema.jsonl_append_allowed_in_ag07i !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag07i !== false) fail("Schema must block database write");
if (schema.publishing_allowed_in_ag07i !== false) fail("Schema must block publishing");
if (schema.backend_auth_supabase_allowed_in_ag07i !== false) fail("Schema must block backend/Auth/Supabase");

if (review.closure_decision.decision !== "ag07i_quality_visitor_value_scoring_boundary_closed") fail("AG07I closure decision mismatch");
if (review.closure_decision.proceed_to_ag07j_only_with_explicit_user_approval !== true) fail("AG07J must require explicit approval");
if (review.closure_decision.ag07j_article_inference_store_boundary_required_before_actual_score_calculation !== true) fail("AG07J inference boundary must be required before scoring");
if (review.closure_decision.actual_score_calculation_performed !== false) fail("Actual score calculation must not be performed");
if (review.closure_decision.quality_score_calculated !== false) fail("Quality score must not be calculated");
if (review.closure_decision.visitor_value_score_calculated !== false) fail("Visitor-value score must not be calculated");
if (review.closure_decision.combined_score_calculated !== false) fail("Combined score must not be calculated");
if (review.closure_decision.article_inference_created !== false) fail("Article inference must not be created in AG07I");
if (review.closure_decision.article_inference_stored !== false) fail("Article inference must not be stored in AG07I");
if (review.closure_decision.publish_ready_approval_performed !== false) fail("Publish-ready approval must not be performed");
if (review.closure_decision.approval_state_changed !== false) fail("Approval state must not change");
if (review.closure_decision.publish_ready_set !== false) fail("publish_ready must not be set");
if (review.closure_decision.production_readiness !== "not_ready") fail("Production readiness must remain not_ready");
if (review.closure_decision.publish_readiness !== "blocked") fail("Publish readiness must remain blocked");

for (const falseField of [
  "actual_score_calculation_performed",
  "quality_score_calculated",
  "visitor_value_score_calculated",
  "combined_score_calculated",
  "scoring_execution_performed",
  "article_inference_created",
  "article_inference_stored",
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
  "database_write_performed",
  "supabase_enabled",
  "auth_enabled",
  "backend_activation_performed",
  "api_route_created",
  "public_publishing_performed",
  "publication_approval_granted"
]) {
  for (const obj of [review, scoringModel, schema, learning, registry, preview]) {
    if (obj[falseField] !== false) fail(`${falseField} must be false in ${obj.title || "preview"}`);
  }
}

for (const scriptName of ["generate:ag07i", "validate:ag07i"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07i")) {
  fail("validate:project must include validate:ag07i");
}

for (const phrase of [
  "Purpose",
  "Why Actual Scores Are Not Calculated in AG07I",
  "Inputs",
  "Scoring Boundary",
  "Scoring Status",
  "Production Readiness Decision",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07I document missing phrase: ${phrase}`);
}

pass("AG07I registry is present.");
pass("AG07I document is present.");
pass("AG07I review, scoring model, schema, learning record and preview are present.");
pass("AG07H boundary is consumed.");
pass("Quality scoring dimensions are defined.");
pass("Visitor-value scoring dimensions are defined.");
pass("Quality scoring weights total 100.");
pass("Visitor-value scoring weights total 100.");
pass("Scoring thresholds and readiness gate groups are defined.");
pass("Article inference is required before actual score calculation.");
pass("Actual score calculation is not performed.");
pass("All calculated score fields remain null.");
pass("Publish-ready approval and approval-state change remain blocked.");
pass("AG07C packet remains unchanged, preview-only and non-production.");
pass("Production readiness remains not_ready.");
pass("Publish readiness remains blocked.");
pass("AG07I is quality and visitor-value scoring boundary only.");
pass("No article prose generation, public mutation, reference insertion, visual generation, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is enabled or performed.");
pass("AG07J Article Inference Store Boundary is identified as next before any actual score calculation.");
