import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag07n-production-packet-candidate.json",
  "data/content-intelligence/content-packets/ag07n-production-packet-candidate.json",
  "data/content-intelligence/quality-registry/ag07n-production-packet-candidate-readiness.json",
  "data/content-intelligence/schema/production-packet-candidate.schema.json",
  "data/content-intelligence/learning/ag07n-production-packet-candidate-learning.json",
  "data/content-intelligence/content-packets/ag07m-improved-preview-packet.json",
  "data/content-intelligence/quality-registry/ag07l-dry-run-scoring-result.json",
  "data/content-intelligence/inference-records/ag07k-preview-only-article-inference-record.json",
  "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  "data/content-intelligence/quality-reviews/ag07o-approval-controlled-single-article-mutation-plan.json",
  "data/content-intelligence/mutation-plans/ag07o-controlled-single-article-mutation-plan.json",
  "data/content-intelligence/approval-registry/ag07o-approval-plan-record.json",
  "data/content-intelligence/schema/approval-controlled-single-article-mutation-plan.schema.json",
  "data/content-intelligence/learning/ag07o-approval-controlled-single-article-mutation-plan-learning.json",
  "data/quality/ag07o-approval-controlled-single-article-mutation-plan.json",
  "data/quality/ag07o-approval-controlled-single-article-mutation-plan-preview.json",
  "docs/quality/AG07O_APPROVAL_CONTROLLED_SINGLE_ARTICLE_MUTATION_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG07O validation failed: ${message}`);
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

const ag07nReview = readJson("data/content-intelligence/quality-reviews/ag07n-production-packet-candidate.json");
const ag07nCandidate = readJson("data/content-intelligence/content-packets/ag07n-production-packet-candidate.json");
const ag07nSchema = readJson("data/content-intelligence/schema/production-packet-candidate.schema.json");

const review = readJson("data/content-intelligence/quality-reviews/ag07o-approval-controlled-single-article-mutation-plan.json");
const mutationPlan = readJson("data/content-intelligence/mutation-plans/ag07o-controlled-single-article-mutation-plan.json");
const approvalPlan = readJson("data/content-intelligence/approval-registry/ag07o-approval-plan-record.json");
const schema = readJson("data/content-intelligence/schema/approval-controlled-single-article-mutation-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag07o-approval-controlled-single-article-mutation-plan-learning.json");
const registry = readJson("data/quality/ag07o-approval-controlled-single-article-mutation-plan.json");
const preview = readJson("data/quality/ag07o-approval-controlled-single-article-mutation-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG07O_APPROVAL_CONTROLLED_SINGLE_ARTICLE_MUTATION_PLAN.md"), "utf8");

for (const obj of [review, mutationPlan, approvalPlan, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG07O") fail(`module_id must be AG07O in ${obj.title || "preview"}`);
}

if (review.status !== "approval_controlled_single_article_mutation_plan_created") fail("Review status must be approval_controlled_single_article_mutation_plan_created");
if (mutationPlan.status !== "controlled_single_article_mutation_plan_created") fail("Mutation plan status must be controlled_single_article_mutation_plan_created");
if (approvalPlan.status !== "approval_plan_created") fail("Approval plan status must be approval_plan_created");
if (schema.status !== "schema_plan_only") fail("Schema status must be schema_plan_only");
if (learning.status !== "learning_record_only") fail("Learning status must be learning_record_only");

if (ag07nReview.status !== "production_packet_candidate_created") fail("AG07N must be production_packet_candidate_created");
if (ag07nReview.closure_decision.proceed_to_ag07o_only_with_explicit_user_approval !== true) fail("AG07N must require explicit approval for AG07O");
if (ag07nReview.closure_decision.production_packet_candidate_record_created !== true) fail("AG07N candidate record must exist");
if (ag07nReview.closure_decision.actual_production_packet_created !== false) fail("AG07N must not create actual production packet");
if (ag07nReview.closure_decision.public_article_mutation_performed !== false) fail("AG07N must not mutate public article");
if (ag07nReview.closure_decision.reference_url_population_performed !== false) fail("AG07N must not populate references");
if (ag07nReview.closure_decision.visual_generation_performed !== false) fail("AG07N must not generate visuals");
if (ag07nReview.closure_decision.static_live_mutation_performed !== false) fail("AG07N must not perform static-live mutation");
if (ag07nCandidate.candidate_only !== true) fail("AG07N candidate must be candidate-only");
if (ag07nCandidate.production_packet !== false) fail("AG07N candidate must not be production packet");
if (ag07nSchema.article_mutation_allowed_in_ag07n !== false) fail("AG07N schema must block mutation");

if (mutationPlan.plan_only !== true) fail("Mutation plan must be plan-only");
if (mutationPlan.target_article_requirements.one_article_only !== true) fail("Mutation plan must enforce one-article only");
if (mutationPlan.target_article_requirements.multiple_article_apply_allowed !== false) fail("Multiple article apply must be false");
if (mutationPlan.target_article_requirements.target_article_path !== "") fail("Target article path must remain empty in AG07O");
if (mutationPlan.target_article_requirements.target_article_path_population_allowed_in_ag07o !== false) fail("Target article path population must not be allowed in AG07O");
if (mutationPlan.target_article_requirements.target_article_file_read_performed !== false) fail("Target article file read must not be performed");
if (mutationPlan.target_article_requirements.target_article_file_write_performed !== false) fail("Target article file write must not be performed");

if (mutationPlan.reference_insertion_plan.reference_url_population_allowed_in_ag07o !== false) fail("Reference URL population must not be allowed");
if (mutationPlan.reference_insertion_plan.reference_url_population_performed !== false) fail("Reference URL population must not be performed");
if (mutationPlan.reference_insertion_plan.approved_reference_url_population_performed !== false) fail("Approved reference URL population must not be performed");
if (mutationPlan.reference_insertion_plan.reference_insertion_allowed_in_ag07o !== false) fail("Reference insertion must not be allowed");
if (mutationPlan.reference_insertion_plan.reference_insertion_performed !== false) fail("Reference insertion must not be performed");

if (mutationPlan.visual_image_credit_plan.visual_generation_allowed_in_ag07o !== false) fail("Visual generation must not be allowed");
if (mutationPlan.visual_image_credit_plan.visual_generation_performed !== false) fail("Visual generation must not be performed");
if (mutationPlan.visual_image_credit_plan.image_insertion_allowed_in_ag07o !== false) fail("Image insertion must not be allowed");
if (mutationPlan.visual_image_credit_plan.image_insertion_performed !== false) fail("Image insertion must not be performed");
if (mutationPlan.visual_image_credit_plan.caption_alt_credit_population_performed !== false) fail("Caption/alt/credit population must not be performed");

if (mutationPlan.backup_rollback_plan.backup_file_created_in_ag07o !== false) fail("Backup file must not be created");
if (mutationPlan.backup_rollback_plan.rollback_test_performed !== false) fail("Rollback test must not be performed");
if (mutationPlan.backup_rollback_plan.file_copy_performed !== false) fail("File copy must not be performed");
if (mutationPlan.backup_rollback_plan.file_move_performed !== false) fail("File move must not be performed");
if (mutationPlan.backup_rollback_plan.file_delete_performed !== false) fail("File delete must not be performed");
if (mutationPlan.backup_rollback_plan.file_write_performed !== false) fail("File write must not be performed");

if (!Array.isArray(mutationPlan.static_live_mutation_checklist) || mutationPlan.static_live_mutation_checklist.length < 7) fail("Static-live mutation checklist must be present");
for (const item of mutationPlan.static_live_mutation_checklist) {
  if (item.passed_in_ag07o !== false) fail(`Mutation checklist must not pass in AG07O: ${item.item_id}`);
  if (item.apply_performed_in_ag07o !== false) fail(`Apply must not be performed in AG07O: ${item.item_id}`);
}

if (!Array.isArray(mutationPlan.post_apply_audit_checklist) || mutationPlan.post_apply_audit_checklist.length < 6) fail("Post-apply audit checklist must be present");
for (const item of mutationPlan.post_apply_audit_checklist) {
  if (item.completed_in_ag07o !== false) fail(`Post-apply audit must not complete in AG07O: ${item.audit_id}`);
}

if (mutationPlan.mutation_plan_readiness.ready_for_ag07p_apply !== false) fail("AG07O plan must not be ready for AG07P apply yet");

if (approvalPlan.plan_only !== true) fail("Approval plan must be plan-only");
if (!Array.isArray(approvalPlan.approval_checklist) || approvalPlan.approval_checklist.length < 7) fail("Approval checklist must be present");
for (const item of approvalPlan.approval_checklist) {
  if (item.passed_in_ag07o !== false) fail(`Approval checklist must not pass in AG07O: ${item.checkpoint_id}`);
}
if (approvalPlan.approval_state.publish_ready_approval_status !== "not_requested") fail("Publish-ready approval must not be requested");
if (approvalPlan.approval_state.human_apply_approval_status !== "not_requested") fail("Human apply approval must not be requested");
if (approvalPlan.approval_state.approval_state_changed !== false) fail("Approval state must not change");
if (approvalPlan.approval_state.publish_ready_set !== false) fail("publish_ready must not be set");
if (approvalPlan.approval_state.approval_recorded_in_ag07o !== false) fail("Approval must not be recorded in AG07O");
if (approvalPlan.approval_readiness.ready_for_ag07p_apply_approval !== false) fail("Approval plan must not be ready for AG07P apply approval");

for (const obj of [review, registry, preview]) {
  if (obj.summary.approval_plan_created !== true) fail(`${obj.title || "preview"} must create approval plan`);
  if (obj.summary.mutation_plan_created !== true) fail(`${obj.title || "preview"} must create mutation plan`);
  if (obj.summary.target_article_requirements_created !== true) fail(`${obj.title || "preview"} must create target article requirements`);
  if (obj.summary.reference_insertion_plan_created !== true) fail(`${obj.title || "preview"} must create reference insertion plan`);
  if (obj.summary.visual_image_credit_plan_created !== true) fail(`${obj.title || "preview"} must create visual/image credit plan`);
  if (obj.summary.backup_rollback_plan_created !== true) fail(`${obj.title || "preview"} must create backup/rollback plan`);
  if (obj.summary.static_live_mutation_checklist_created !== true) fail(`${obj.title || "preview"} must create static-live mutation checklist`);
  if (obj.summary.post_apply_audit_checklist_created !== true) fail(`${obj.title || "preview"} must create post-apply audit checklist`);
  if (obj.summary.ag07p_handoff_created !== true) fail(`${obj.title || "preview"} must create AG07P handoff`);
  if (obj.summary.actual_public_mutation_performed !== false) fail(`${obj.title || "preview"} must not mutate public article`);
  if (obj.summary.file_edit_performed !== false) fail(`${obj.title || "preview"} must not edit files`);
  if (obj.summary.article_file_write_performed !== false) fail(`${obj.title || "preview"} must not write article files`);
  if (obj.summary.reference_insertion_performed !== false) fail(`${obj.title || "preview"} must not insert references`);
  if (obj.summary.reference_url_population_performed !== false) fail(`${obj.title || "preview"} must not populate reference URLs`);
  if (obj.summary.visual_generation_performed !== false) fail(`${obj.title || "preview"} must not generate visuals`);
  if (obj.summary.static_live_apply_performed !== false) fail(`${obj.title || "preview"} must not apply static-live mutation`);
  if (obj.summary.production_readiness_after_ag07o !== "plan_created_not_apply_ready") fail(`${obj.title || "preview"} production readiness mismatch`);
  if (obj.summary.publish_readiness_after_ag07o !== "blocked") fail(`${obj.title || "preview"} publish readiness must remain blocked`);
  if (obj.summary.next_stage_id !== "AG07P") fail(`${obj.title || "preview"} next stage must be AG07P`);
}

if (schema.approval_plan_creation_allowed_in_ag07o !== true) fail("Schema must allow approval plan creation");
if (schema.mutation_plan_creation_allowed_in_ag07o !== true) fail("Schema must allow mutation plan creation");
if (schema.human_apply_approval_allowed_in_ag07o !== false) fail("Schema must block human apply approval");
if (schema.publish_ready_approval_allowed_in_ag07o !== false) fail("Schema must block publish-ready approval");
if (schema.approval_state_change_allowed_in_ag07o !== false) fail("Schema must block approval-state change");
if (schema.actual_public_mutation_allowed_in_ag07o !== false) fail("Schema must block public mutation");
if (schema.file_edit_allowed_in_ag07o !== false) fail("Schema must block file edits");
if (schema.article_file_write_allowed_in_ag07o !== false) fail("Schema must block article file writes");
if (schema.backup_file_creation_allowed_in_ag07o !== false) fail("Schema must block backup file creation");
if (schema.static_live_apply_allowed_in_ag07o !== false) fail("Schema must block static-live apply");
if (schema.reference_url_population_allowed_in_ag07o !== false) fail("Schema must block reference URL population");
if (schema.reference_insertion_allowed_in_ag07o !== false) fail("Schema must block reference insertion");
if (schema.visual_generation_allowed_in_ag07o !== false) fail("Schema must block visual generation");
if (schema.image_insertion_allowed_in_ag07o !== false) fail("Schema must block image insertion");
if (schema.production_jsonl_append_allowed_in_ag07o !== false) fail("Schema must block production JSONL append");
if (schema.database_write_allowed_in_ag07o !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag07o !== false) fail("Schema must block Supabase write");
if (schema.publishing_allowed_in_ag07o !== false) fail("Schema must block publishing");
if (schema.backend_auth_supabase_allowed_in_ag07o !== false) fail("Schema must block backend/Auth/Supabase");

if (review.closure_decision.decision !== "ag07o_approval_controlled_single_article_mutation_plan_closed") fail("AG07O closure decision mismatch");
if (review.closure_decision.proceed_to_ag07p_only_with_explicit_user_approval !== true) fail("AG07P must require explicit approval");
if (review.closure_decision.approval_plan_created !== true) fail("Approval plan must be created");
if (review.closure_decision.mutation_plan_created !== true) fail("Mutation plan must be created");
if (review.closure_decision.actual_public_mutation_performed !== false) fail("Actual public mutation must not be performed");
if (review.closure_decision.file_edit_performed !== false) fail("File edit must not be performed");
if (review.closure_decision.article_file_write_performed !== false) fail("Article file write must not be performed");
if (review.closure_decision.reference_insertion_performed !== false) fail("Reference insertion must not be performed");
if (review.closure_decision.reference_url_population_performed !== false) fail("Reference URL population must not be performed");
if (review.closure_decision.visual_generation_performed !== false) fail("Visual generation must not be performed");
if (review.closure_decision.static_live_apply_performed !== false) fail("Static-live apply must not be performed");
if (review.closure_decision.production_jsonl_append_performed !== false) fail("Production JSONL append must not be performed");
if (review.closure_decision.database_write_performed !== false) fail("Database write must not be performed");
if (review.closure_decision.supabase_write_performed !== false) fail("Supabase write must not be performed");
if (review.closure_decision.production_readiness !== "plan_created_not_apply_ready") fail("Production readiness mismatch");
if (review.closure_decision.publish_readiness !== "blocked") fail("Publish readiness must remain blocked");

checkFalseFields([review, mutationPlan, approvalPlan, schema, learning, registry, preview], [
  "publish_ready_approval_performed",
  "approval_state_changed",
  "publish_ready_set",
  "human_apply_approval_performed",
  "actual_public_mutation_performed",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "static_live_apply_performed",
  "static_live_mutation_performed",
  "file_edit_performed",
  "file_write_performed",
  "article_file_write_performed",
  "backup_file_created",
  "rollback_execution_performed",
  "production_jsonl_append_performed",
  "jsonl_append_performed",
  "jsonl_production_record_created",
  "database_write_performed",
  "supabase_write_performed",
  "supabase_enabled",
  "auth_enabled",
  "reference_insertion_performed",
  "reference_url_population_performed",
  "approved_reference_url_population_performed",
  "visual_generation_performed",
  "visual_asset_generation_performed",
  "image_insertion_performed",
  "data_unit_generation_performed",
  "caption_alt_credit_population_performed",
  "production_packet_created",
  "actual_production_packet_created",
  "production_content_generated",
  "article_prose_generated",
  "narrative_text_generated",
  "dry_run_score_recalculation_performed",
  "actual_score_calculation_performed",
  "production_score_record_created",
  "scaffold_import_performed",
  "scaffold_file_copy_performed",
  "scaffold_file_move_performed",
  "scaffold_file_delete_performed",
  "backend_activation_performed",
  "api_route_created",
  "public_publishing_performed",
  "publication_approval_granted"
]);

for (const scriptName of ["generate:ag07o", "validate:ag07o"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag07o")) {
  fail("validate:project must include validate:ag07o");
}

for (const phrase of [
  "Purpose",
  "Inputs",
  "Plan Scope",
  "Approval Status",
  "Static-Live Status",
  "Production Readiness Decision",
  "Explicit Exclusions",
  "Acceptance Criteria",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG07O document missing phrase: ${phrase}`);
}

pass("AG07O registry is present.");
pass("AG07O document is present.");
pass("AG07O review, controlled mutation plan, approval plan, schema, learning record and preview are present.");
pass("AG07N production-packet candidate is consumed.");
pass("Approval checklist is created.");
pass("Target article requirements are created.");
pass("Reference insertion plan is created.");
pass("Visual/image-credit plan is created.");
pass("Backup/rollback plan is created.");
pass("Static-live mutation checklist is created.");
pass("Post-apply audit checklist is created.");
pass("AG07P handoff is created.");
pass("No actual public mutation, file edit, article write or static-live apply is performed.");
pass("No reference insertion, reference URL population, visual generation or image insertion is performed.");
pass("No production JSONL append, database write, Supabase write, publishing or backend/Auth/Supabase activation is performed.");
pass("Production readiness remains plan_created_not_apply_ready.");
pass("Publish readiness remains blocked.");
pass("AG07O is Approval + Controlled Single-Article Mutation Plan only.");
pass("AG07P One-Article Controlled Apply is identified as next only with explicit approval.");
