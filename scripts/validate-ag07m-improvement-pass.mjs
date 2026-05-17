import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07l-revised-preview-packet-dry-run-scoring.json",
  "data/content-intelligence/content-packets/ag07l-revised-preview-packet-dry-run.json",
  "data/content-intelligence/quality-registry/ag07l-dry-run-scoring-result.json",
  "data/content-intelligence/schema/revised-preview-packet-dry-run-scoring.schema.json",
  "data/content-intelligence/learning/ag07l-revised-preview-packet-dry-run-scoring-learning.json",
  "data/content-intelligence/inference-records/ag07k-preview-only-article-inference-record.json",
  "data/content-intelligence/quality-registry/ag07i-quality-visitor-value-scoring-model.json",
  "data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json",
  "data/content-intelligence/visual-registry/ag07h-visual-data-enrichment-workbench.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/ag07m-improvement-pass.json",
  "data/content-intelligence/content-packets/ag07m-improved-preview-packet.json",
  "data/content-intelligence/quality-registry/ag07m-improvement-pass-record.json",
  "data/content-intelligence/schema/improvement-pass.schema.json",
  "data/content-intelligence/learning/ag07m-improvement-pass-learning.json",
  "data/quality/ag07m-improvement-pass.json",
  "data/quality/ag07m-improvement-pass-preview.json",
  "docs/quality/AG07M_IMPROVEMENT_PASS.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07M validation failed: ${message}`);
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

const ag07lReview = readJson("data/content-intelligence/quality-reviews/ag07l-revised-preview-packet-dry-run-scoring.json");
const ag07lPacket = readJson("data/content-intelligence/content-packets/ag07l-revised-preview-packet-dry-run.json");
const ag07lScoring = readJson("data/content-intelligence/quality-registry/ag07l-dry-run-scoring-result.json");
const ag07lSchema = readJson("data/content-intelligence/schema/revised-preview-packet-dry-run-scoring.schema.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07m-improvement-pass.json");
const improvedPacket = readJson("data/content-intelligence/content-packets/ag07m-improved-preview-packet.json");
const improvementRecord = readJson("data/content-intelligence/quality-registry/ag07m-improvement-pass-record.json");
const schema = readJson("data/content-intelligence/schema/improvement-pass.schema.json");
const learning = readJson("data/content-intelligence/learning/ag07m-improvement-pass-learning.json");
const registry = readJson("data/quality/ag07m-improvement-pass.json");
const preview = readJson("data/quality/ag07m-improvement-pass-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07M_IMPROVEMENT_PASS.md"), "utf8");

for (const obj of [review, improvedPacket, improvementRecord, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG07M") fail(`module_id must be AG07M in ${obj.title || "preview"}`);
}

if (review.status !== "improvement_pass_created") fail("Review status must be improvement_pass_created");
if (improvedPacket.status !== "improved_preview_packet_created") fail("Improved packet status must be improved_preview_packet_created");
if (improvementRecord.status !== "improvement_actions_created") fail("Improvement record status must be improvement_actions_created");
if (schema.status !== "schema_preview_improvement_only") fail("Schema status must be schema_preview_improvement_only");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");

if (ag07lReview.status !== "revised_preview_packet_and_dry_run_scores_created") fail("AG07L must be revised_preview_packet_and_dry_run_scores_created");
if (ag07lReview.closure_decision.proceed_to_ag07m_only_with_explicit_user_approval !== true) fail("AG07L must require explicit approval for AG07M");
if (ag07lReview.closure_decision.revised_preview_packet_created !== true) fail("AG07L must have revised preview packet");
if (ag07lReview.closure_decision.dry_run_score_calculation_performed !== true) fail("AG07L must have dry-run scoring");
if (ag07lReview.closure_decision.production_packet_created !== false) fail("AG07L must not create production packet");
if (ag07lReview.closure_decision.public_article_mutation_performed !== false) fail("AG07L must not mutate public article");
if (ag07lReview.closure_decision.reference_insertion_performed !== false) fail("AG07L must not insert references");
if (ag07lReview.closure_decision.visual_generation_performed !== false) fail("AG07L must not generate visuals");
if (ag07lReview.closure_decision.static_live_mutation_performed !== false) fail("AG07L must not perform static-live mutation");
if (ag07lPacket.preview_only !== true) fail("AG07L packet must be preview-only");
if (ag07lPacket.production_packet !== false) fail("AG07L packet must not be production packet");
if (ag07lScoring.scoring_scope !== "dry_run_only") fail("AG07L scoring must be dry_run_only");
if (ag07lSchema.production_packet_creation_allowed_in_ag07l !== false) fail("AG07L schema must block production packet creation");

if (improvedPacket.preview_only !== true) fail("Improved packet must be preview-only");
if (improvedPacket.production_packet !== false) fail("Improved packet must not be production packet");
if (improvedPacket.publish_ready !== false) fail("Improved packet must not be publish-ready");
if (improvedPacket.publication_allowed !== false) fail("Improved packet publication must not be allowed");
if (!Array.isArray(improvedPacket.improved_sections) || improvedPacket.improved_sections.length < 6) fail("Improved sections must be present");
for (const section of improvedPacket.improved_sections) {
  if (section.section_status !== "improved_preview_only") fail(`Section must be improved_preview_only: ${section.section_id}`);
  if (section.prose_generated !== false) fail(`Section prose must not be generated: ${section.section_id}`);
  if (section.improvement_applied_in_ag07m !== true) fail(`Improvement must be applied in AG07M: ${section.section_id}`);
  if (section.production_execution_performed !== false) fail(`Production execution must be false: ${section.section_id}`);
}

if (improvedPacket.improved_reference_plan.reference_urls_populated_in_ag07m !== false) fail("Reference URLs must not be populated in AG07M");
if (improvedPacket.improved_reference_plan.reference_insertion_performed !== false) fail("Reference insertion must not be performed in AG07M");
if (improvedPacket.improved_visual_data_plan.visual_generation_performed !== false) fail("Visual generation must not be performed in AG07M");
if (improvedPacket.improved_visual_data_plan.image_insertion_performed !== false) fail("Image insertion must not be performed in AG07M");
if (improvedPacket.improved_visual_data_plan.data_unit_generation_performed !== false) fail("Data-unit generation must not be performed in AG07M");
if (improvedPacket.improved_static_live_readiness_preview.static_live_mutation_allowed_in_ag07m !== false) fail("Static-live mutation must not be allowed in AG07M");

if (improvementRecord.preview_only !== true) fail("Improvement record must be preview-only");
if (improvementRecord.production_record !== false) fail("Improvement record must not be production record");
if (!Array.isArray(improvementRecord.improvement_actions) || improvementRecord.improvement_actions.length < 6) fail("Improvement actions must be present");
for (const action of improvementRecord.improvement_actions) {
  if (action.execution_status !== "planned_preview_improvement") fail(`Action must be planned_preview_improvement: ${action.action_id}`);
  if (action.production_execution_performed !== false) fail(`Action production execution must be false: ${action.action_id}`);
}
if (improvementRecord.improvement_pass_result.improved_preview_packet_created !== true) fail("Improved preview packet must be created");
if (improvementRecord.improvement_pass_result.production_packet_created !== false) fail("Production packet must not be created");
if (improvementRecord.improvement_pass_result.score_recalculated !== false) fail("Scores must not be recalculated");
if (improvementRecord.improvement_pass_result.publish_ready_recommended !== false) fail("Publish-ready must not be recommended");

for (const obj of [review, registry, preview]) {
  if (obj.summary.improved_preview_packet_created !== true) fail(`${obj.title || "preview"} must create improved preview packet`);
  if (obj.summary.improvement_actions_created !== true) fail(`${obj.title || "preview"} must create improvement actions`);
  if (obj.summary.dry_run_scores_consumed !== true) fail(`${obj.title || "preview"} must consume dry-run scores`);
  if (obj.summary.dry_run_score_recalculation_performed !== false) fail(`${obj.title || "preview"} must not recalculate dry-run scores`);
  if (obj.summary.actual_score_calculation_performed !== false) fail(`${obj.title || "preview"} must not calculate actual scores`);
  if (obj.summary.production_packet_created !== false) fail(`${obj.title || "preview"} must not create production packet`);
  if (obj.summary.publish_ready_approval_performed !== false) fail(`${obj.title || "preview"} must not approve publish-ready`);
  if (obj.summary.approval_state_changed !== false) fail(`${obj.title || "preview"} must not change approval state`);
  if (obj.summary.publish_ready_set !== false) fail(`${obj.title || "preview"} must not set publish-ready`);
  if (obj.summary.production_jsonl_append_performed !== false) fail(`${obj.title || "preview"} must not append production JSONL`);
  if (obj.summary.database_write_performed !== false) fail(`${obj.title || "preview"} must not write database`);
  if (obj.summary.supabase_write_performed !== false) fail(`${obj.title || "preview"} must not write Supabase`);
  if (obj.summary.production_readiness_after_ag07m !== "not_ready") fail(`${obj.title || "preview"} production readiness must remain not_ready`);
  if (obj.summary.publish_readiness_after_ag07m !== "blocked") fail(`${obj.title || "preview"} publish readiness must remain blocked`);
  if (obj.summary.next_stage_id !== "AG07N") fail(`${obj.title || "preview"} next stage must be AG07N`);
}

if (schema.improved_preview_packet_creation_allowed_in_ag07m !== true) fail("Schema must allow improved preview packet creation");
if (schema.improvement_actions_creation_allowed_in_ag07m !== true) fail("Schema must allow improvement actions");
if (schema.dry_run_score_recalculation_allowed_in_ag07m !== false) fail("Schema must block dry-run score recalculation");
if (schema.actual_score_calculation_allowed_in_ag07m !== false) fail("Schema must block actual score calculation");
if (schema.production_packet_creation_allowed_in_ag07m !== false) fail("Schema must block production packet creation");
if (schema.publish_ready_approval_allowed_in_ag07m !== false) fail("Schema must block publish-ready approval");
if (schema.approval_state_change_allowed_in_ag07m !== false) fail("Schema must block approval-state change");
if (schema.production_jsonl_append_allowed_in_ag07m !== false) fail("Schema must block production JSONL append");
if (schema.database_write_allowed_in_ag07m !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag07m !== false) fail("Schema must block Supabase write");
if (schema.article_prose_generation_allowed_in_ag07m !== false) fail("Schema must block article prose generation");
if (schema.article_mutation_allowed_in_ag07m !== false) fail("Schema must block article mutation");
if (schema.reference_insertion_allowed_in_ag07m !== false) fail("Schema must block reference insertion");
if (schema.reference_url_population_allowed_in_ag07m !== false) fail("Schema must block reference URL population");
if (schema.visual_generation_allowed_in_ag07m !== false) fail("Schema must block visual generation");
if (schema.static_live_mutation_allowed_in_ag07m !== false) fail("Schema must block static-live mutation");
if (schema.publishing_allowed_in_ag07m !== false) fail("Schema must block publishing");
if (schema.backend_auth_supabase_allowed_in_ag07m !== false) fail("Schema must block backend/Auth/Supabase");

if (review.closure_decision.decision !== "ag07m_improvement_pass_closed") fail("AG07M closure decision mismatch");
if (review.closure_decision.proceed_to_ag07n_only_with_explicit_user_approval !== true) fail("AG07N must require explicit approval");
if (review.closure_decision.improved_preview_packet_created !== true) fail("Improved preview packet must be created");
if (review.closure_decision.improvement_actions_created !== true) fail("Improvement actions must be created");
if (review.closure_decision.dry_run_score_recalculation_performed !== false) fail("Dry-run score recalculation must not be performed");
if (review.closure_decision.production_packet_created !== false) fail("Production packet must not be created");
if (review.closure_decision.publish_ready_approval_performed !== false) fail("Publish-ready approval must not be performed");
if (review.closure_decision.production_jsonl_append_performed !== false) fail("Production JSONL append must not be performed");
if (review.closure_decision.database_write_performed !== false) fail("Database write must not be performed");
if (review.closure_decision.supabase_write_performed !== false) fail("Supabase write must not be performed");
if (review.closure_decision.public_article_mutation_performed !== false) fail("Public article mutation must not be performed");
if (review.closure_decision.reference_insertion_performed !== false) fail("Reference insertion must not be performed");
if (review.closure_decision.reference_url_population_performed !== false) fail("Reference URL population must not be performed");
if (review.closure_decision.visual_generation_performed !== false) fail("Visual generation must not be performed");
if (review.closure_decision.static_live_mutation_performed !== false) fail("Static-live mutation must not be performed");
if (review.closure_decision.production_readiness !== "not_ready") fail("Production readiness must remain not_ready");
if (review.closure_decision.publish_readiness !== "blocked") fail("Publish readiness must remain blocked");

checkFalseFields([review, improvedPacket, improvementRecord, schema, learning, registry, preview], [
  "dry_run_score_recalculation_performed",
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
  "static_live_mutation_performed",
  "scaffold_import_performed",
  "scaffold_file_copy_performed",
  "scaffold_file_move_performed",
  "scaffold_file_delete_performed",
  "backend_activation_performed",
  "api_route_created",
  "public_publishing_performed",
  "publication_approval_granted"
]);

for (const scriptName of ["generate:ag07m", "validate:ag07m"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07m")) {
  fail("validate:project must include validate:ag07m");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Improvement Scope",
  "Scoring Status",
  "Production Readiness Decision",
  "Explicit Exclusions",
  "Static-Live Compatibility Note",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07M document missing phrase: ${phrase}`);
}

pass("AG07M registry is present.");
pass("AG07M document is present.");
pass("AG07M review, improved preview packet, improvement record, schema, learning record and preview are present.");
pass("AG07L revised preview packet and dry-run scoring are consumed.");
pass("One improved preview packet is created.");
pass("Improvement actions are created from AG07L scoring gaps.");
pass("Dry-run scores are consumed but not recalculated.");
pass("Production packet creation remains blocked.");
pass("No production JSONL append, database write or Supabase write is performed.");
pass("No article prose generation, public mutation, reference insertion, reference URL population, visual generation or static-live mutation is performed.");
pass("Production readiness remains not_ready.");
pass("Publish readiness remains blocked.");
pass("AG07M is Improvement Pass only.");
pass("AG07N Production Packet Candidate is identified as next only with explicit approval.");
