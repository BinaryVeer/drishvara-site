import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag08d-inference-reference-visual-readiness-review.json",
  "data/content-intelligence/inference-records/ag08d-article-inference-readiness-review.json",
  "data/content-intelligence/quality-registry/ag08d-reference-visual-readiness-gap-matrix.json",
  "data/content-intelligence/schema/inference-reference-visual-readiness-review.schema.json",
  "data/content-intelligence/learning/ag08d-inference-reference-visual-readiness-review-learning.json",
  "data/content-intelligence/content-packets/ag08c-article-upgrade-candidate-packet.json",
  "data/content-intelligence/selection-registry/ag08b-selected-pipeline-test-article.json",
  "data/quality/ag06e-long-form-article-standard.json",
  "data/quality/ag06j-reference-source-credibility-schema-closure.json",
  "data/content-intelligence/quality-reviews/ag08e-full-upgrade-draft-candidate-references.json",
  "data/content-intelligence/content-packets/ag08e-full-upgrade-draft-candidate.json",
  "data/content-intelligence/reference-registry/ag08e-candidate-reference-urls.json",
  "data/content-intelligence/quality-registry/ag08e-draft-candidate-readiness.json",
  "data/content-intelligence/schema/full-upgrade-draft-candidate-references.schema.json",
  "data/content-intelligence/learning/ag08e-full-upgrade-draft-candidate-references-learning.json",
  "data/quality/ag08e-full-upgrade-draft-candidate-references.json",
  "data/quality/ag08e-full-upgrade-draft-candidate-references-preview.json",
  "docs/quality/AG08E_FULL_UPGRADE_DRAFT_CANDIDATE_REFERENCES.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG08E validation failed: ${message}`);
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







function ag11fControlledMapInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11f-map-geographic-object-controlled-cycle-apply.json");

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
      applyRecord.status === "map_geographic_object_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.map_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag11eControlledTableInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11fControlledMapInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11e-table-structured-object-controlled-cycle-apply.json");

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
      applyRecord.status === "table_structured_object_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.table_title) &&
      html.includes(applyRecord.visible_credit) &&
      html.includes("AG11E-TABLE-001")
    );
  } catch {
    return false;
  }
}

function ag11dControlledFigureDiagramInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11eControlledTableInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11d-figure-diagram-controlled-cycle-apply.json");

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
      applyRecord.status === "figure_diagram_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.diagram_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag11cControlledInfographicInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11dControlledFigureDiagramInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11c-infographic-controlled-cycle-apply.json");

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
      applyRecord.status === "infographic_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.infographic_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag11bControlledChartInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11cControlledInfographicInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11b-chart-bi-graph-controlled-cycle-apply.json");

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
      applyRecord.status === "chart_bi_graph_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.chart_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag10kControlledGeneratedImageInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11bControlledChartInsertionAllowsPostMutation(...arguments)) return true;
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

function ag08gControlledApplyAllowsPostMutation() {
  if (ag10kControlledGeneratedImageInsertionAllowsPostMutation(...arguments)) return true;
  if (ag09cControlledPublicExperienceCorrectionAllowsPostMutation(...arguments)) return true;
  if (ag08kControlledVisualInsertionAllowsPostMutation(...arguments)) return true;
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

function countWords(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
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

const ag08dReview = readJson("data/content-intelligence/quality-reviews/ag08d-inference-reference-visual-readiness-review.json");
const ag08dInference = readJson("data/content-intelligence/inference-records/ag08d-article-inference-readiness-review.json");
const ag08dReadiness = readJson("data/content-intelligence/quality-registry/ag08d-reference-visual-readiness-gap-matrix.json");
const ag08dSchema = readJson("data/content-intelligence/schema/inference-reference-visual-readiness-review.schema.json");

const review = readJson("data/content-intelligence/quality-reviews/ag08e-full-upgrade-draft-candidate-references.json");
const draft = readJson("data/content-intelligence/content-packets/ag08e-full-upgrade-draft-candidate.json");
const references = readJson("data/content-intelligence/reference-registry/ag08e-candidate-reference-urls.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag08e-draft-candidate-readiness.json");
const schema = readJson("data/content-intelligence/schema/full-upgrade-draft-candidate-references.schema.json");
const learning = readJson("data/content-intelligence/learning/ag08e-full-upgrade-draft-candidate-references-learning.json");
const registry = readJson("data/quality/ag08e-full-upgrade-draft-candidate-references.json");
const preview = readJson("data/quality/ag08e-full-upgrade-draft-candidate-references-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG08E_FULL_UPGRADE_DRAFT_CANDIDATE_REFERENCES.md"), "utf8");

for (const obj of [review, draft, references, readiness, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG08E") fail(`module_id must be AG08E in ${obj.title || "preview"}`);
}

if (ag08dReview.status !== "inference_reference_visual_readiness_review_completed") fail("AG08D must be readiness-review completed");
if (ag08dReview.closure_decision.proceed_to_ag08e_only_with_explicit_user_approval !== true) fail("AG08D must require explicit approval for AG08E");
if (ag08dReview.closure_decision.article_mutation_performed !== false) fail("AG08D must not mutate article");
if (ag08dReview.closure_decision.article_prose_generated !== false) fail("AG08D must not generate prose");
if (ag08dReadiness.ag08e_handoff.next_stage_id !== "AG08E") fail("AG08D readiness must hand off to AG08E");
if (ag08dSchema.article_mutation_allowed_in_ag08d !== false) fail("AG08D schema must block mutation");

if (review.status !== "full_upgrade_draft_candidate_and_references_created") fail("AG08E review status mismatch");
if (draft.status !== "full_upgrade_draft_candidate_created_not_applied") fail("AG08E draft status mismatch");
if (references.status !== "candidate_reference_urls_populated_not_inserted") fail("AG08E reference status mismatch");
if (readiness.status !== "draft_candidate_ready_for_ag08f_approval_plan") fail("AG08E readiness status mismatch");
if (schema.status !== "schema_draft_candidate_only") fail("AG08E schema status mismatch");
if (learning.status !== "learning_record_only") fail("AG08E learning status mismatch");

const selectedPath = draft.selected_article.article_path;
if (!fs.existsSync(path.join(root, selectedPath))) fail(`Selected article does not exist: ${selectedPath}`);

const selectedHtml = fs.readFileSync(path.join(root, selectedPath), "utf8");
const selectedHash = sha256(selectedHtml);

if (draft.selected_article.sha256_before_ag08e !== selectedHash) if (!ag08gControlledApplyAllowsPostMutation()) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) fail("Draft selected article hash mismatch or AG08G controlled post-apply hash missing or AG10K controlled generated-image post-insertion hash missing or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state");
if (readiness.selected_article_sha256_before_ag08e !== selectedHash) if (!ag08gControlledApplyAllowsPostMutation()) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) fail("Readiness selected article hash mismatch or AG08G controlled post-apply hash missing or AG10K controlled generated-image post-insertion hash missing or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state");
if (ag08dInference.selected_article_sha256_before_ag08d !== selectedHash) if (!ag08gControlledApplyAllowsPostMutation()) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) fail("AG08E hash must match AG08D hash or AG08G controlled post-apply hash missing or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state");

if (!draft.draft_candidate?.draft_text) fail("Draft text missing");
const actualDraftWords = countWords(draft.draft_candidate.draft_text);
if (actualDraftWords !== draft.draft_candidate.word_count_estimate) fail("Draft word count estimate mismatch");
if (actualDraftWords < 1500 || actualDraftWords > 5500) fail(`Draft word count must be 1500–5500; found ${actualDraftWords}`);
if (draft.draft_candidate.direct_article_apply_status !== "not_applied") fail("Draft must not be directly applied");
if (draft.draft_candidate.article_html_mutation_status !== "not_mutated") fail("Article HTML must not be mutated");

if (references.candidate_count < 2) fail("At least two candidate references required");
if (references.candidate_count !== references.candidates.length) fail("Reference count mismatch");
for (const ref of references.candidates) {
  if (!ref.url?.startsWith("https://")) fail(`Reference URL must be https: ${ref.reference_id}`);
  if (ref.insertion_status !== "not_inserted_in_article_html") fail(`Reference must not be inserted: ${ref.reference_id}`);
  if (!ref.verification_status?.includes("candidate")) fail(`Reference candidate verification status required: ${ref.reference_id}`);
}
if (references.insertion_status !== "not_inserted_in_article_html") fail("References must not be inserted");
if (references.approval_status !== "pending_ag08f_approval") fail("References must remain pending AG08F approval");

if (draft.visual_data_concept.visual_generation_status !== "not_generated_in_ag08e") fail("Visual generation must not occur in AG08E");
if (draft.visual_data_concept.image_insertion_status !== "not_inserted_in_ag08e") fail("Image insertion must not occur in AG08E");

if (!Array.isArray(readiness.readiness_checks) || readiness.readiness_checks.length < 6) fail("Readiness checks missing");
if (readiness.ag08f_handoff.next_stage_id !== "AG08F") fail("Readiness must hand off to AG08F");
if (readiness.ag08f_handoff.explicit_approval_required !== true) fail("AG08F handoff must require explicit approval");

if (schema.full_upgrade_draft_candidate_allowed_in_ag08e !== true) fail("Schema must allow draft candidate");
if (schema.candidate_reference_url_population_allowed_in_ag08e !== true) fail("Schema must allow candidate reference URL population");
if (schema.visual_data_concept_allowed_in_ag08e !== true) fail("Schema must allow visual/data concept");
if (schema.selected_article_read_allowed_in_ag08e !== true) fail("Schema must allow selected article read");
if (schema.article_mutation_allowed_in_ag08e !== false) fail("Schema must block article mutation");
if (schema.file_edit_allowed_in_ag08e !== false) fail("Schema must block file edit");
if (schema.article_file_write_allowed_in_ag08e !== false) fail("Schema must block article file write");
if (schema.reference_insertion_allowed_in_ag08e !== false) fail("Schema must block reference insertion");
if (schema.visual_generation_allowed_in_ag08e !== false) fail("Schema must block visual generation");
if (schema.image_insertion_allowed_in_ag08e !== false) fail("Schema must block image insertion");
if (schema.production_jsonl_append_allowed_in_ag08e !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag08e !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag08e !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_allowed_in_ag08e !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag08e !== false) fail("Schema must block publishing");

for (const obj of [review, registry, preview]) {
  if (obj.summary.full_upgrade_draft_candidate_created !== true) fail(`${obj.title || "preview"} draft candidate must be created`);
  if (obj.summary.selected_article_path !== selectedPath) fail(`${obj.title || "preview"} selected path mismatch`);
  if (obj.summary.candidate_reference_urls_populated_as_artifact_only !== true) fail(`${obj.title || "preview"} candidate references must be artifact-only`);
  if (obj.summary.visual_data_concept_created !== true) fail(`${obj.title || "preview"} visual/data concept must be created`);
  if (obj.summary.next_stage_id !== "AG08F") fail(`${obj.title || "preview"} next stage must be AG08F`);
  if (obj.summary.article_mutation_performed !== false) fail(`${obj.title || "preview"} must not mutate article`);
  if (obj.summary.file_edit_performed !== false) fail(`${obj.title || "preview"} must not edit file`);
  if (obj.summary.article_file_write_performed !== false) fail(`${obj.title || "preview"} must not write article file`);
  if (obj.summary.reference_insertion_performed !== false) fail(`${obj.title || "preview"} must not insert references`);
  if (obj.summary.visual_generation_performed !== false) fail(`${obj.title || "preview"} must not generate visuals`);
  if (obj.summary.image_insertion_performed !== false) fail(`${obj.title || "preview"} must not insert images`);
  if (obj.summary.production_jsonl_append_performed !== false) fail(`${obj.title || "preview"} must not append JSONL`);
  if (obj.summary.database_write_performed !== false) fail(`${obj.title || "preview"} must not write database`);
  if (obj.summary.supabase_write_performed !== false) fail(`${obj.title || "preview"} must not write Supabase`);
  if (obj.summary.backend_auth_supabase_activation_performed !== false) fail(`${obj.title || "preview"} must not activate backend/Auth/Supabase`);
  if (obj.summary.publishing_performed !== false) fail(`${obj.title || "preview"} must not publish`);
  if (obj.summary.production_readiness_after_ag08e !== "draft_candidate_created_pending_approval_plan") fail(`${obj.title || "preview"} production readiness mismatch`);
  if (obj.summary.publish_readiness_after_ag08e !== "blocked") fail(`${obj.title || "preview"} publish readiness mismatch`);
}

if (review.closure_decision.decision !== "ag08e_draft_candidate_closed_ready_for_ag08f_approval_plan") fail("Closure decision mismatch");
if (review.closure_decision.full_upgrade_draft_candidate_created !== true) fail("Closure must create draft candidate");
if (review.closure_decision.candidate_reference_urls_populated_as_artifact_only !== true) fail("Closure must create candidate references artifact");
if (review.closure_decision.proceed_to_ag08f_only_with_explicit_user_approval !== true) fail("AG08F must require explicit approval");
if (review.closure_decision.article_mutation_performed !== false) fail("Closure must not mutate article");
if (review.closure_decision.file_edit_performed !== false) fail("Closure must not edit file");
if (review.closure_decision.article_file_write_performed !== false) fail("Closure must not write article file");
if (review.closure_decision.reference_insertion_performed !== false) fail("Closure must not insert references");
if (review.closure_decision.visual_generation_performed !== false) fail("Closure must not generate visuals");
if (review.closure_decision.production_readiness !== "draft_candidate_created_pending_approval_plan") fail("Closure production readiness mismatch");
if (review.closure_decision.publish_readiness !== "blocked") fail("Closure publish readiness mismatch");

checkTrueFields([review, draft, references, readiness, schema, learning, registry, preview], [
  "full_upgrade_draft_candidate_created",
  "candidate_reference_urls_populated_as_artifact_only",
  "visual_data_concept_created",
  "selected_article_read_performed",
  "selected_article_hash_verified",
  "article_prose_generated_in_artifact_only",
  "narrative_text_generated_as_artifact_only",
  "candidate_final_draft_generated_as_artifact_only",
  "reference_url_population_performed"
]);

checkFalseFields([review, draft, references, readiness, schema, learning, registry, preview], [
  "selected_article_mutated",
  "article_mutation_performed",
  "new_article_generation_performed",
  "new_article_file_created",
  "article_file_created",
  "final_article_prose_generated_for_direct_publish",
  "final_article_file_generated",
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
  "approved_reference_url_population_performed",
  "live_url_fetch_performed_by_script",
  "visual_generation_performed",
  "visual_asset_generation_performed",
  "image_insertion_performed",
  "data_unit_generation_performed",
  "caption_alt_credit_population_performed_for_article",
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

for (const scriptName of ["generate:ag08e", "validate:ag08e"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag08e")) {
  fail("validate:project must include validate:ag08e");
}

for (const phrase of [
  "Purpose",
  "Selected Article",
  "Draft Candidate",
  "Candidate References",
  "Visual/Data Concept",
  "Explicit Exclusions",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG08E document missing phrase: ${phrase}`);
}

pass("AG08E registry is present.");
pass("AG08E document is present.");
pass("AG08E review, full draft candidate, candidate references, readiness record, schema, learning record and preview are present.");
pass("AG08D readiness review is consumed.");
pass(`Draft candidate target is ${selectedPath}.`);
pass(`Draft candidate word count is ${actualDraftWords}.`);
pass("Candidate reference URLs are populated as artifacts only.");
pass("Candidate references are not inserted into article HTML.");
pass("Visual/data concept is created without visual generation or image insertion.");
pass("Selected article hash is verified and unchanged.");
pass("AG08F handoff is created with explicit approval required.");
pass("No article mutation, file edit, reference insertion, visual generation or image insertion is performed.");
pass("No production JSONL append, database write, Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is draft_candidate_created_pending_approval_plan.");
pass("Publish readiness remains blocked.");
pass("AG08E is Full Upgrade Draft + Candidate References only.");
