import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07m-improvement-pass.json",
  "data/content-intelligence/content-packets/ag07m-improved-preview-packet.json",
  "data/content-intelligence/quality-registry/ag07m-improvement-pass-record.json",
  "data/content-intelligence/schema/improvement-pass.schema.json",
  "data/content-intelligence/learning/ag07m-improvement-pass-learning.json",
  "data/content-intelligence/quality-registry/ag07l-dry-run-scoring-result.json",
  "data/content-intelligence/inference-records/ag07k-preview-only-article-inference-record.json",
  "data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json",
  "data/content-intelligence/visual-registry/ag07h-visual-data-enrichment-workbench.json",
  "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/ag07n-production-packet-candidate.json",
  "data/content-intelligence/content-packets/ag07n-production-packet-candidate.json",
  "data/content-intelligence/quality-registry/ag07n-production-packet-candidate-readiness.json",
  "data/content-intelligence/schema/production-packet-candidate.schema.json",
  "data/content-intelligence/learning/ag07n-production-packet-candidate-learning.json",
  "data/quality/ag07n-production-packet-candidate.json",
  "data/quality/ag07n-production-packet-candidate-preview.json",
  "docs/quality/AG07N_PRODUCTION_PACKET_CANDIDATE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07N validation failed: ${message}`);
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

const ag07mReview = readJson("data/content-intelligence/quality-reviews/ag07m-improvement-pass.json");
const ag07mPacket = readJson("data/content-intelligence/content-packets/ag07m-improved-preview-packet.json");
const ag07mImprovementRecord = readJson("data/content-intelligence/quality-registry/ag07m-improvement-pass-record.json");
const ag07mSchema = readJson("data/content-intelligence/schema/improvement-pass.schema.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07n-production-packet-candidate.json");
const candidate = readJson("data/content-intelligence/content-packets/ag07n-production-packet-candidate.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag07n-production-packet-candidate-readiness.json");
const schema = readJson("data/content-intelligence/schema/production-packet-candidate.schema.json");
const learning = readJson("data/content-intelligence/learning/ag07n-production-packet-candidate-learning.json");
const registry = readJson("data/quality/ag07n-production-packet-candidate.json");
const preview = readJson("data/quality/ag07n-production-packet-candidate-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07N_PRODUCTION_PACKET_CANDIDATE.md"), "utf8");

for (const obj of [review, candidate, readiness, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG07N") fail(`module_id must be AG07N in ${obj.title || "preview"}`);
}

if (review.status !== "production_packet_candidate_created") fail("Review status must be production_packet_candidate_created");
if (candidate.status !== "production_packet_candidate_created") fail("Candidate status must be production_packet_candidate_created");
if (readiness.status !== "candidate_readiness_record_created") fail("Readiness status must be candidate_readiness_record_created");
if (schema.status !== "schema_candidate_only") fail("Schema status must be schema_candidate_only");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");

if (ag07mReview.status !== "improvement_pass_created") fail("AG07M must be improvement_pass_created");
if (ag07mReview.closure_decision.proceed_to_ag07n_only_with_explicit_user_approval !== true) fail("AG07M must require explicit approval for AG07N");
if (ag07mReview.closure_decision.improved_preview_packet_created !== true) fail("AG07M must have improved preview packet");
if (ag07mReview.closure_decision.production_packet_created !== false) fail("AG07M must not create production packet");
if (ag07mReview.closure_decision.public_article_mutation_performed !== false) fail("AG07M must not mutate public article");
if (ag07mReview.closure_decision.reference_url_population_performed !== false) fail("AG07M must not populate references");
if (ag07mReview.closure_decision.visual_generation_performed !== false) fail("AG07M must not generate visuals");
if (ag07mReview.closure_decision.static_live_mutation_performed !== false) fail("AG07M must not perform static-live mutation");
if (ag07mPacket.preview_only !== true) fail("AG07M packet must be preview-only");
if (ag07mPacket.production_packet !== false) fail("AG07M packet must not be production packet");
if (ag07mImprovementRecord.improvement_pass_result.production_packet_created !== false) fail("AG07M improvement result must not create production packet");
if (ag07mSchema.production_packet_creation_allowed_in_ag07m !== false) fail("AG07M schema must block production packet creation");

if (candidate.candidate_only !== true) fail("AG07N candidate must be candidate-only");
if (candidate.preview_only !== true) fail("AG07N candidate must remain preview-only");
if (candidate.production_packet !== false) fail("AG07N candidate must not be actual production packet");
if (candidate.publish_ready !== false) fail("AG07N candidate must not be publish-ready");
if (candidate.publication_allowed !== false) fail("AG07N candidate publication must not be allowed");
if (!candidate.candidate_id || !candidate.candidate_id.includes("ag07n-production-candidate:")) fail("Candidate ID must use AG07N pattern");

if (!Array.isArray(candidate.candidate_sections) || candidate.candidate_sections.length < 6) fail("Candidate sections must be present");
for (const section of candidate.candidate_sections) {
  if (section.candidate_section_status !== "production_candidate_section_planned") fail(`Section must be production_candidate_section_planned: ${section.section_id}`);
  if (section.prose_generated_in_ag07n !== false) fail(`Section prose must not be generated: ${section.section_id}`);
  if (section.production_execution_performed !== false) fail(`Section production execution must be false: ${section.section_id}`);
}

if (candidate.reference_candidate_plan.candidate_reference_url_population_allowed_in_ag07n !== false) fail("Reference URL population must not be allowed");
if (candidate.reference_candidate_plan.candidate_reference_url_population_performed !== false) fail("Reference URL population must not be performed");
if (candidate.reference_candidate_plan.approved_reference_url_population_performed !== false) fail("Approved reference URL population must not be performed");
if (candidate.reference_candidate_plan.reference_insertion_performed !== false) fail("Reference insertion must not be performed");

if (candidate.visual_candidate_plan.visual_generation_allowed_in_ag07n !== false) fail("Visual generation must not be allowed");
if (candidate.visual_candidate_plan.visual_generation_performed !== false) fail("Visual generation must not be performed");
if (candidate.visual_candidate_plan.image_insertion_performed !== false) fail("Image insertion must not be performed");
if (candidate.visual_candidate_plan.data_unit_generation_performed !== false) fail("Data-unit generation must not be performed");
if (candidate.visual_candidate_plan.caption_alt_credit_population_performed !== false) fail("Caption/alt/credit population must not be performed");

if (candidate.static_live_candidate_plan.static_live_mutation_allowed_in_ag07n !== false) fail("Static-live mutation must not be allowed");
if (candidate.static_live_candidate_plan.static_live_mutation_performed !== false) fail("Static-live mutation must not be performed");

if (!Array.isArray(candidate.approval_candidate_checklist) || candidate.approval_candidate_checklist.length < 5) fail("Approval checklist must be present");
for (const item of candidate.approval_candidate_checklist) {
  if (item.passed_in_ag07n !== false) fail(`Approval checklist must not pass in AG07N: ${item.checkpoint_id}`);
}

if (candidate.candidate_readiness_assessment.candidate_record_created !== true) fail("Candidate record must be created");
if (candidate.candidate_readiness_assessment.ready_for_ag07o_approval_and_mutation_plan !== true) fail("Candidate must be ready for AG07O planning");
if (candidate.candidate_readiness_assessment.ready_for_publish_ready_approval !== false) fail("Candidate must not be ready for publish-ready approval");
if (candidate.candidate_readiness_assessment.ready_for_static_live_apply !== false) fail("Candidate must not be ready for static-live apply");

if (readiness.preview_only !== true) fail("Readiness record must be preview-only");
if (readiness.production_record !== false) fail("Readiness record must not be production record");
if (readiness.readiness_gates.reference_candidate_plan_ready !== true) fail("Reference candidate plan should be ready");
if (readiness.readiness_gates.visual_candidate_plan_ready !== true) fail("Visual candidate plan should be ready");
if (readiness.readiness_gates.static_live_plan_fields_present !== true) fail("Static-live plan fields should be present");
if (readiness.readiness_gates.production_packet_created !== false) fail("Production packet must not be created");
if (readiness.readiness_gates.publish_ready_approved !== false) fail("Publish-ready must not be approved");
if (readiness.readiness_gates.public_mutation_allowed !== false) fail("Public mutation must not be allowed");

for (const obj of [review, registry, preview]) {
  if (obj.summary.production_packet_candidate_record_created !== true) fail(`${obj.title || "preview"} must create production-packet candidate record`);
  if (obj.summary.actual_production_packet_created !== false) fail(`${obj.title || "preview"} must not create actual production packet`);
  if (obj.summary.production_packet_created !== false) fail(`${obj.title || "preview"} must not create production packet`);
  if (obj.summary.reference_candidate_plan_created !== true) fail(`${obj.title || "preview"} must create reference candidate plan`);
  if (obj.summary.visual_candidate_plan_created !== true) fail(`${obj.title || "preview"} must create visual candidate plan`);
  if (obj.summary.static_live_candidate_plan_created !== true) fail(`${obj.title || "preview"} must create static-live candidate plan`);
  if (obj.summary.dry_run_score_recalculation_performed !== false) fail(`${obj.title || "preview"} must not recalculate scores`);
  if (obj.summary.actual_score_calculation_performed !== false) fail(`${obj.title || "preview"} must not calculate actual scores`);
  if (obj.summary.publish_ready_approval_performed !== false) fail(`${obj.title || "preview"} must not approve publish-ready`);
  if (obj.summary.approval_state_changed !== false) fail(`${obj.title || "preview"} must not change approval state`);
  if (obj.summary.publish_ready_set !== false) fail(`${obj.title || "preview"} must not set publish-ready`);
  if (obj.summary.production_jsonl_append_performed !== false) fail(`${obj.title || "preview"} must not append production JSONL`);
  if (obj.summary.database_write_performed !== false) fail(`${obj.title || "preview"} must not write database`);
  if (obj.summary.supabase_write_performed !== false) fail(`${obj.title || "preview"} must not write Supabase`);
  if (obj.summary.production_readiness_after_ag07n !== "candidate_created_not_production_ready") fail(`${obj.title || "preview"} production readiness mismatch`);
  if (obj.summary.publish_readiness_after_ag07n !== "blocked") fail(`${obj.title || "preview"} publish readiness must remain blocked`);
  if (obj.summary.next_stage_id !== "AG07O") fail(`${obj.title || "preview"} next stage must be AG07O`);
}

if (schema.production_packet_candidate_record_creation_allowed_in_ag07n !== true) fail("Schema must allow candidate record creation");
if (schema.actual_production_packet_creation_allowed_in_ag07n !== false) fail("Schema must block actual production packet creation");
if (schema.production_packet_creation_allowed_in_ag07n !== false) fail("Schema must block production packet creation");
if (schema.production_content_generation_allowed_in_ag07n !== false) fail("Schema must block production content generation");
if (schema.article_prose_generation_allowed_in_ag07n !== false) fail("Schema must block article prose generation");
if (schema.dry_run_score_recalculation_allowed_in_ag07n !== false) fail("Schema must block score recalculation");
if (schema.actual_score_calculation_allowed_in_ag07n !== false) fail("Schema must block actual score calculation");
if (schema.production_score_record_creation_allowed_in_ag07n !== false) fail("Schema must block production score record creation");
if (schema.publish_ready_approval_allowed_in_ag07n !== false) fail("Schema must block publish-ready approval");
if (schema.approval_state_change_allowed_in_ag07n !== false) fail("Schema must block approval-state change");
if (schema.production_jsonl_append_allowed_in_ag07n !== false) fail("Schema must block production JSONL append");
if (schema.database_write_allowed_in_ag07n !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag07n !== false) fail("Schema must block Supabase write");
if (schema.article_mutation_allowed_in_ag07n !== false) fail("Schema must block article mutation");
if (schema.reference_insertion_allowed_in_ag07n !== false) fail("Schema must block reference insertion");
if (schema.reference_url_population_allowed_in_ag07n !== false) fail("Schema must block reference URL population");
if (schema.visual_generation_allowed_in_ag07n !== false) fail("Schema must block visual generation");
if (schema.static_live_mutation_allowed_in_ag07n !== false) fail("Schema must block static-live mutation");
if (schema.publishing_allowed_in_ag07n !== false) fail("Schema must block publishing");
if (schema.backend_auth_supabase_allowed_in_ag07n !== false) fail("Schema must block backend/Auth/Supabase");

if (review.closure_decision.decision !== "ag07n_production_packet_candidate_closed") fail("AG07N closure decision mismatch");
if (review.closure_decision.proceed_to_ag07o_only_with_explicit_user_approval !== true) fail("AG07O must require explicit approval");
if (review.closure_decision.production_packet_candidate_record_created !== true) fail("Candidate record must be created");
if (review.closure_decision.actual_production_packet_created !== false) fail("Actual production packet must not be created");
if (review.closure_decision.production_packet_created !== false) fail("Production packet must not be created");
if (review.closure_decision.production_content_generated !== false) fail("Production content must not be generated");
if (review.closure_decision.article_prose_generated !== false) fail("Article prose must not be generated");
if (review.closure_decision.production_jsonl_append_performed !== false) fail("Production JSONL append must not be performed");
if (review.closure_decision.database_write_performed !== false) fail("Database write must not be performed");
if (review.closure_decision.supabase_write_performed !== false) fail("Supabase write must not be performed");
if (review.closure_decision.public_article_mutation_performed !== false) fail("Public article mutation must not be performed");
if (review.closure_decision.reference_insertion_performed !== false) fail("Reference insertion must not be performed");
if (review.closure_decision.reference_url_population_performed !== false) fail("Reference URL population must not be performed");
if (review.closure_decision.visual_generation_performed !== false) fail("Visual generation must not be performed");
if (review.closure_decision.static_live_mutation_performed !== false) fail("Static-live mutation must not be performed");
if (review.closure_decision.production_readiness !== "candidate_created_not_production_ready") fail("Production readiness mismatch");
if (review.closure_decision.publish_readiness !== "blocked") fail("Publish readiness must remain blocked");

checkFalseFields([review, candidate, readiness, schema, learning, registry, preview], [
  "actual_production_packet_created",
  "production_packet_created",
  "production_content_generated",
  "article_prose_generated",
  "narrative_text_generated",
  "dry_run_score_recalculation_performed",
  "actual_score_calculation_performed",
  "production_score_record_created",
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
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "reference_insertion_performed",
  "reference_url_population_performed",
  "approved_reference_url_population_performed",
  "visual_generation_performed",
  "visual_asset_generation_performed",
  "image_insertion_performed",
  "data_unit_generation_performed",
  "caption_alt_credit_population_performed",
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

for (const scriptName of ["generate:ag07n", "validate:ag07n"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07n")) {
  fail("validate:project must include validate:ag07n");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Candidate Scope",
  "Production Readiness Decision",
  "Explicit Exclusions",
  "Static-Live Compatibility Note",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07N document missing phrase: ${phrase}`);
}

pass("AG07N registry is present.");
pass("AG07N document is present.");
pass("AG07N review, production-packet candidate, readiness record, schema, learning record and preview are present.");
pass("AG07M improved preview packet is consumed.");
pass("One production-packet candidate record is created.");
pass("Actual production packet creation remains blocked.");
pass("Candidate sections, reference plan, visual/data plan and static-live candidate plan are created.");
pass("Publish-ready approval and approval-state change remain blocked.");
pass("No production JSONL append, database write or Supabase write is performed.");
pass("No article prose generation, public mutation, reference insertion, reference URL population, visual generation or static-live mutation is performed.");
pass("Production readiness remains candidate_created_not_production_ready.");
pass("Publish readiness remains blocked.");
pass("AG07N is Production Packet Candidate only.");
pass("AG07O Approval + Controlled Single-Article Mutation Plan is identified as next only with explicit approval.");
