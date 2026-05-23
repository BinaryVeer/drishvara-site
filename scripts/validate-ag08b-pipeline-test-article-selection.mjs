import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag08a-repeatable-article-upgrade-cycle-planning.json",
  "data/content-intelligence/run-registry/ag08a-repeatable-article-upgrade-roadmap.json",
  "data/content-intelligence/selection-registry/ag08a-next-article-selection-criteria.json",
  "data/content-intelligence/schema/repeatable-article-upgrade-cycle-planning.schema.json",
  "data/content-intelligence/learning/ag08a-repeatable-article-upgrade-cycle-planning-learning.json",
  "data/content-intelligence/quality-reviews/ag07z-repeatable-production-readiness-closure.json",
  "data/content-intelligence/quality-reviews/ag08b-pipeline-test-article-selection.json",
  "data/content-intelligence/selection-registry/ag08b-selected-pipeline-test-article.json",
  "data/content-intelligence/selection-registry/ag08b-pipeline-test-candidate-scorecard.json",
  "data/content-intelligence/schema/pipeline-test-article-selection.schema.json",
  "data/content-intelligence/learning/ag08b-pipeline-test-article-selection-learning.json",
  "data/quality/ag08b-pipeline-test-article-selection.json",
  "data/quality/ag08b-pipeline-test-article-selection-preview.json",
  "docs/quality/AG08B_PIPELINE_TEST_ARTICLE_SELECTION.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG08B validation failed: ${message}`);
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

function ag09cControlledPublicExperienceCorrectionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag10kControlledGeneratedImageInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");
  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    if (
      applyRecord.module_id !== "AG09C" ||
      applyRecord.status !== "controlled_public_experience_corrections_applied_pending_audit"
    ) {
      return false;
    }

    if (selectedPath && selectedPath !== applyRecord.selected_article_path) return false;

    const targetAbs = path.join(root, applyRecord.selected_article_path);
    if (!fs.existsSync(targetAbs)) return false;

    const html = fs.readFileSync(targetAbs, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.post_correction_hash === hashToCheck &&
      html.includes("AG09C-PUBLIC-EXPERIENCE-METADATA") &&
      html.includes('property="og:title"') &&
      html.includes('name="twitter:card"')
    );
  } catch {
    return false;
  }
}

function ag08kControlledVisualInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag10kControlledGeneratedImageInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json");
  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    if (
      applyRecord.module_id !== "AG08K" ||
      applyRecord.status !== "controlled_visual_image_inserted_pending_post_insertion_audit" ||
      applyRecord.image_insertion_performed_in_ag08k !== true ||
      applyRecord.article_mutation_performed_in_ag08k !== true ||
      applyRecord.exactly_one_visual_block_inserted !== true
    ) {
      return false;
    }

    if (selectedPath && selectedPath !== applyRecord.selected_article_path) return false;

    const targetAbs = path.join(root, applyRecord.selected_article_path);
    if (!fs.existsSync(targetAbs)) return false;

    const html = fs.readFileSync(targetAbs, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes("AG08K-HERO-VISUAL-INSERTION") &&
      html.includes(applyRecord.asset_src_inserted)
    );
  } catch {
    return false;
  }
}


function ag10kControlledGeneratedImageInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "generated_image_inserted_pending_post_insertion_audit" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag08gControlledApplyAllowsPostMutation(selectedPath, currentHash) {
  if (ag10kControlledGeneratedImageInsertionAllowsPostMutation(selectedPath, currentHash)) return true;
  if (ag09cControlledPublicExperienceCorrectionAllowsPostMutation(...arguments)) return true;
  if (ag08kControlledVisualInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json");
  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    return (
      applyRecord.module_id === "AG08G" &&
      applyRecord.selected_article_path === selectedPath &&
      applyRecord.post_apply_hash === currentHash &&
      applyRecord.exactly_one_article_file_mutated === true &&
      applyRecord.article_mutation_performed === true &&
      applyRecord.production_readiness_after_ag08g === "one_article_applied_pending_post_apply_audit"
    );
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

const ag08aReview = readJson("data/content-intelligence/quality-reviews/ag08a-repeatable-article-upgrade-cycle-planning.json");
const ag08aRoadmap = readJson("data/content-intelligence/run-registry/ag08a-repeatable-article-upgrade-roadmap.json");
const ag08aSelection = readJson("data/content-intelligence/selection-registry/ag08a-next-article-selection-criteria.json");
const ag08aSchema = readJson("data/content-intelligence/schema/repeatable-article-upgrade-cycle-planning.schema.json");

const review = readJson("data/content-intelligence/quality-reviews/ag08b-pipeline-test-article-selection.json");
const selection = readJson("data/content-intelligence/selection-registry/ag08b-selected-pipeline-test-article.json");
const scorecard = readJson("data/content-intelligence/selection-registry/ag08b-pipeline-test-candidate-scorecard.json");
const schema = readJson("data/content-intelligence/schema/pipeline-test-article-selection.schema.json");
const learning = readJson("data/content-intelligence/learning/ag08b-pipeline-test-article-selection-learning.json");
const registry = readJson("data/quality/ag08b-pipeline-test-article-selection.json");
const preview = readJson("data/quality/ag08b-pipeline-test-article-selection-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG08B_PIPELINE_TEST_ARTICLE_SELECTION.md"), "utf8");

for (const obj of [review, selection, scorecard, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG08B") fail(`module_id must be AG08B in ${obj.title || "preview"}`);
}

if (ag08aReview.status !== "repeatable_article_upgrade_cycle_planning_created") fail("AG08A must be planning-created");
if (ag08aReview.closure_decision.proceed_to_ag08b_only_with_explicit_user_approval !== true) fail("AG08A must require explicit approval for AG08B");
if (ag08aReview.closure_decision.next_article_selected !== false) fail("AG08A must not have selected article");
if (ag08aRoadmap.next_stage_handoff.next_stage_id !== "AG08B") fail("AG08A roadmap must hand off to AG08B");
if (ag08aSelection.selection_not_performed_in_ag08a !== true) fail("AG08A selection criteria must not have selected article");
if (ag08aSchema.next_article_selection_allowed_in_ag08a !== false) fail("AG08A schema must block selection");

if (review.status !== "one_article_selected_for_pipeline_test") fail("AG08B review status mismatch");
if (selection.status !== "one_existing_article_selected_for_pipeline_test") fail("AG08B selection status mismatch");
if (scorecard.status !== "scorecard_created_selection_read_only") fail("AG08B scorecard status mismatch");
if (schema.status !== "schema_selection_only") fail("AG08B schema status mismatch");
if (learning.status !== "learning_record_only") fail("AG08B learning status mismatch");

const selectedPath = selection.selected_article.article_path;
if (!selectedPath || typeof selectedPath !== "string") fail("Selected article path missing");
if (!selectedPath.startsWith("articles/")) fail("Selected article must be under articles/");
if (!selectedPath.endsWith(".html")) fail("Selected article must be an HTML file");
if (!fs.existsSync(path.join(root, selectedPath))) fail(`Selected article does not exist: ${selectedPath}`);

const selectedHtml = fs.readFileSync(path.join(root, selectedPath), "utf8");
if (selectedHtml.includes("<!-- AG07P-CONTROLLED-APPLY-START -->")) {
  fail("Selected article must not be the AG07P pilot-marked article");
}

if (selection.selection_boundary.target_count !== 1) fail("Selection boundary target count must be 1");
if (selection.selection_boundary.exact_selected_target_article_path !== selectedPath) fail("Exact selected target path mismatch");
const selectedHash = sha256(selectedHtml);

if (
  selection.selected_article.sha256_at_selection !== selectedHash &&
  !ag08gControlledApplyAllowsPostMutation(selection.selected_article.article_path, selectedHash)
) {
  fail("Selected article hash must match current file, AG08G controlled post-apply hash, AG09C controlled post-correction hash, or AG10K controlled generated-image post-insertion hash");
}
if (selection.ag08c_handoff.next_stage_id !== "AG08C") fail("Selection must hand off to AG08C");
if (selection.ag08c_handoff.explicit_approval_required !== true) fail("AG08C handoff must require explicit approval");
if (selection.ag08c_handoff.selected_article_path !== selectedPath) fail("AG08C handoff selected article path mismatch");

if (scorecard.selected_article_path !== selectedPath) fail("Scorecard selected path mismatch");
if (!Array.isArray(scorecard.top_candidates) || scorecard.top_candidates.length < 1) fail("Scorecard must include top candidates");
if (scorecard.selected_article_score !== selection.selected_article.score_breakdown.total_score) fail("Selected score mismatch");
if (scorecard.eligible_candidate_count < 1) fail("Eligible candidate count must be at least 1");

if (schema.article_selection_allowed_in_ag08b !== true) fail("Schema must allow selection");
if (schema.exactly_one_article_required !== true) fail("Schema must require exactly one article");
if (schema.existing_static_article_required !== true) fail("Schema must require existing static article");
if (schema.article_mutation_allowed_in_ag08b !== false) fail("Schema must block article mutation");
if (schema.file_edit_allowed_in_ag08b !== false) fail("Schema must block file edit");
if (schema.reference_insertion_allowed_in_ag08b !== false) fail("Schema must block reference insertion");
if (schema.visual_generation_allowed_in_ag08b !== false) fail("Schema must block visual generation");
if (schema.production_jsonl_append_allowed_in_ag08b !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag08b !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag08b !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_allowed_in_ag08b !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag08b !== false) fail("Schema must block publishing");

for (const obj of [review, registry, preview]) {
  if (obj.summary.ag08b_selection_performed !== true) fail(`${obj.title || "preview"} must perform AG08B selection`);
  if (obj.summary.selected_article_count !== 1) fail(`${obj.title || "preview"} selected article count must be 1`);
  if (obj.summary.selected_article_path !== selectedPath) fail(`${obj.title || "preview"} selected path mismatch`);
  if (obj.summary.next_stage_id !== "AG08C") fail(`${obj.title || "preview"} next stage must be AG08C`);
  if (obj.summary.article_mutation_performed !== false) fail(`${obj.title || "preview"} must not mutate article`);
  if (obj.summary.file_edit_performed !== false) fail(`${obj.title || "preview"} must not edit files`);
  if (obj.summary.reference_insertion_performed !== false) fail(`${obj.title || "preview"} must not insert references`);
  if (obj.summary.visual_generation_performed !== false) fail(`${obj.title || "preview"} must not generate visuals`);
  if (obj.summary.production_jsonl_append_performed !== false) fail(`${obj.title || "preview"} must not append JSONL`);
  if (obj.summary.database_write_performed !== false) fail(`${obj.title || "preview"} must not write database`);
  if (obj.summary.supabase_write_performed !== false) fail(`${obj.title || "preview"} must not write Supabase`);
  if (obj.summary.backend_auth_supabase_activation_performed !== false) fail(`${obj.title || "preview"} must not activate backend/Auth/Supabase`);
  if (obj.summary.publishing_performed !== false) fail(`${obj.title || "preview"} must not publish`);
  if (obj.summary.production_readiness_after_ag08b !== "one_article_selected_for_pipeline_test_not_mutated") fail(`${obj.title || "preview"} production readiness mismatch`);
  if (obj.summary.publish_readiness_after_ag08b !== "blocked") fail(`${obj.title || "preview"} publish readiness mismatch`);
}

if (review.closure_decision.decision !== "ag08b_selection_closed_ready_for_ag08c_candidate_packet") fail("Closure decision mismatch");
if (review.closure_decision.one_existing_article_selected !== true) fail("Closure must select one existing article");
if (review.closure_decision.selected_article_path !== selectedPath) fail("Closure selected path mismatch");
if (review.closure_decision.proceed_to_ag08c_only_with_explicit_user_approval !== true) fail("AG08C must require explicit approval");
if (review.closure_decision.article_mutation_performed !== false) fail("Closure must not mutate article");
if (review.closure_decision.file_edit_performed !== false) fail("Closure must not edit files");
if (review.closure_decision.production_readiness !== "one_article_selected_for_pipeline_test_not_mutated") fail("Closure production readiness mismatch");
if (review.closure_decision.publish_readiness !== "blocked") fail("Closure publish readiness mismatch");

checkTrueFields([review, selection, scorecard, schema, learning, registry, preview], [
  "pipeline_test_selection_only",
  "next_article_selection_performed",
  "selection_scorecard_created",
  "selection_criteria_consumed",
  "selected_existing_static_article"
]);

for (const obj of [review, selection, scorecard, schema, learning, registry, preview]) {
  if (obj.selected_article_count !== 1) fail(`${obj.title || obj.module_id} selected_article_count must be 1`);
}

checkFalseFields([review, selection, scorecard, schema, learning, registry, preview], [
  "selected_article_mutated",
  "article_mutation_performed",
  "new_article_generation_performed",
  "new_article_file_created",
  "article_file_created",
  "article_prose_generated",
  "narrative_text_generated",
  "candidate_packet_created",
  "production_packet_created",
  "article_inference_generated",
  "score_calculation_performed",
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

for (const scriptName of ["generate:ag08b", "validate:ag08b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag08b")) {
  fail("validate:project must include validate:ag08b");
}

for (const phrase of [
  "Purpose",
  "Selected Article",
  "Why This Article Was Selected",
  "Selection Criteria Used",
  "Explicit Exclusions",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG08B document missing phrase: ${phrase}`);
}

pass("AG08B registry is present.");
pass("AG08B document is present.");
pass("AG08B review, selection record, scorecard, schema, learning record and preview are present.");
pass("AG08A planning and selection criteria are consumed.");
pass("Exactly one existing static article is selected.");
pass(`Selected article path is ${selectedPath}.`);
pass("Selected article is not the AG07P pilot-marked article.");
pass("Candidate scorecard is created.");
pass("AG08C handoff is created with explicit approval required.");
pass("No article mutation, file edit, reference insertion, visual generation or image insertion is performed.");
pass("No production JSONL append, database write, Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is one_article_selected_for_pipeline_test_not_mutated.");
pass("Publish readiness remains blocked.");
pass("AG08B is Pipeline Test Article Selection only.");
