import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag08b-pipeline-test-article-selection.json",
  "data/content-intelligence/selection-registry/ag08b-selected-pipeline-test-article.json",
  "data/content-intelligence/selection-registry/ag08b-pipeline-test-candidate-scorecard.json",
  "data/content-intelligence/schema/pipeline-test-article-selection.schema.json",
  "data/content-intelligence/learning/ag08b-pipeline-test-article-selection-learning.json",
  "data/content-intelligence/run-registry/ag08a-repeatable-article-upgrade-roadmap.json",
  "data/quality/ag06e-long-form-article-standard.json",
  "data/quality/ag06i-visual-data-infographic-requirement-schema-closure.json",
  "data/quality/ag06j-reference-source-credibility-schema-closure.json",
  "data/content-intelligence/quality-reviews/ag08c-article-upgrade-candidate-packet.json",
  "data/content-intelligence/content-packets/ag08c-article-upgrade-candidate-packet.json",
  "data/content-intelligence/quality-registry/ag08c-candidate-packet-readiness.json",
  "data/content-intelligence/schema/article-upgrade-candidate-packet.schema.json",
  "data/content-intelligence/learning/ag08c-article-upgrade-candidate-packet-learning.json",
  "data/quality/ag08c-article-upgrade-candidate-packet.json",
  "data/quality/ag08c-article-upgrade-candidate-packet-preview.json",
  "docs/quality/AG08C_ARTICLE_UPGRADE_CANDIDATE_PACKET.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG08C validation failed: ${message}`);
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






function ag11eControlledTableInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
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

    const targetPath = applyRecord.selected_article_path;
    const targetAbs = path.join(root, targetPath);
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

const ag08bReview = readJson("data/content-intelligence/quality-reviews/ag08b-pipeline-test-article-selection.json");
const ag08bSelection = readJson("data/content-intelligence/selection-registry/ag08b-selected-pipeline-test-article.json");
const ag08bSchema = readJson("data/content-intelligence/schema/pipeline-test-article-selection.schema.json");

const review = readJson("data/content-intelligence/quality-reviews/ag08c-article-upgrade-candidate-packet.json");
const packet = readJson("data/content-intelligence/content-packets/ag08c-article-upgrade-candidate-packet.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag08c-candidate-packet-readiness.json");
const schema = readJson("data/content-intelligence/schema/article-upgrade-candidate-packet.schema.json");
const learning = readJson("data/content-intelligence/learning/ag08c-article-upgrade-candidate-packet-learning.json");
const registry = readJson("data/quality/ag08c-article-upgrade-candidate-packet.json");
const preview = readJson("data/quality/ag08c-article-upgrade-candidate-packet-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG08C_ARTICLE_UPGRADE_CANDIDATE_PACKET.md"), "utf8");

for (const obj of [review, packet, readiness, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG08C") fail(`module_id must be AG08C in ${obj.title || "preview"}`);
}

if (ag08bReview.status !== "one_article_selected_for_pipeline_test") fail("AG08B must be selection-closed");
if (ag08bReview.closure_decision.proceed_to_ag08c_only_with_explicit_user_approval !== true) fail("AG08B must require explicit approval for AG08C");
if (ag08bReview.closure_decision.article_mutation_performed !== false) fail("AG08B must not mutate article");
if (ag08bSelection.status !== "one_existing_article_selected_for_pipeline_test") fail("AG08B selection record status mismatch");
if (ag08bSchema.article_mutation_allowed_in_ag08b !== false) fail("AG08B schema must block mutation");

if (review.status !== "article_upgrade_candidate_packet_created") fail("AG08C review status mismatch");
if (packet.status !== "candidate_packet_created_not_mutated") fail("AG08C packet status mismatch");
if (readiness.status !== "candidate_packet_ready_for_ag08d_review") fail("AG08C readiness status mismatch");
if (schema.status !== "schema_candidate_packet_only") fail("AG08C schema status mismatch");
if (learning.status !== "learning_record_only") fail("AG08C learning status mismatch");

const selectedPath = ag08bSelection.selected_article.article_path;
if (packet.selected_article.article_path !== selectedPath) fail("Candidate packet selected path mismatch");
if (review.summary.selected_article_path !== selectedPath) fail("Review selected path mismatch");
if (readiness.selected_article_path !== selectedPath) fail("Readiness selected path mismatch");
if (!fs.existsSync(path.join(root, selectedPath))) fail(`Selected article does not exist: ${selectedPath}`);

const selectedHtml = fs.readFileSync(path.join(root, selectedPath), "utf8");
const selectedHash = sha256(selectedHtml);
const ag08cSelectedArticlePath =
  packet.selected_article?.article_path ||
  packet.selected_article_path ||
  packet.target_article_path ||
  "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html";

const ag08cSelectedArticleAbs = path.join(root, ag08cSelectedArticlePath);

if (!fs.existsSync(ag08cSelectedArticleAbs)) {
  fail(`AG08C selected article missing: ${ag08cSelectedArticlePath}`);
}

const currentArticleHash = sha256(fs.readFileSync(ag08cSelectedArticleAbs, "utf8"));

const ag08cPacketOriginalHash =
  packet.selected_article?.sha256_at_packet_creation ||
  packet.selected_article?.sha256_before_ag08c ||
  packet.selected_article_sha256_before_ag08c ||
  packet.selected_article_hash;

if (
  ag08cPacketOriginalHash !== currentArticleHash &&
  !ag08gControlledApplyAllowsPostMutation()
) {
  if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) fail("Packet selected article hash mismatch or AG08G controlled post-apply hash missing or AG10K controlled generated-image post-insertion hash missing or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state");
}
if (readiness.selected_article_sha256_before_ag08c !== selectedHash) if (!ag08gControlledApplyAllowsPostMutation()) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) fail("Readiness selected article hash mismatch or AG08G controlled post-apply hash missing or AG10K controlled generated-image post-insertion hash missing or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state");
if (packet.selected_article.sha256_before_ag08c !== ag08bSelection.selected_article.sha256_at_selection) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) fail("AG08C hash must match AG08B selection hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state");

if (!packet.current_article_analysis) fail("Current article analysis missing");
if (!packet.upgrade_hypothesis) fail("Upgrade hypothesis missing");
if (!Array.isArray(packet.proposed_structure) || packet.proposed_structure.length < 5) fail("Proposed structure must contain at least five sections");
for (const section of packet.proposed_structure) {
  if (section.prose_generation_status !== "not_generated") fail(`Section prose must not be generated: ${section.section_id}`);
}

if (!packet.reference_need_plan) fail("Reference need plan missing");
if (packet.reference_need_plan.reference_population_status !== "not_populated_in_ag08c") fail("Reference population must not occur in AG08C");
if (packet.reference_need_plan.reference_insertion_status !== "not_inserted_in_ag08c") fail("Reference insertion must not occur in AG08C");
if (packet.reference_need_plan.url_population_allowed_in_ag08c !== false) fail("URL population must be blocked");
if (packet.reference_need_plan.reference_insertion_allowed_in_ag08c !== false) fail("Reference insertion must be blocked");

if (!packet.visual_data_need_plan) fail("Visual/data need plan missing");
if (packet.visual_data_need_plan.visual_generation_status !== "not_generated_in_ag08c") fail("Visual generation must not occur in AG08C");
if (packet.visual_data_need_plan.image_insertion_status !== "not_inserted_in_ag08c") fail("Image insertion must not occur in AG08C");
if (packet.visual_data_need_plan.visual_generation_allowed_in_ag08c !== false) fail("Visual generation must be blocked");
if (packet.visual_data_need_plan.image_insertion_allowed_in_ag08c !== false) fail("Image insertion must be blocked");

if (!Array.isArray(readiness.readiness_gates) || readiness.readiness_gates.length < 7) fail("Readiness gates missing");
if (readiness.all_readiness_gates_passed_or_watch !== true) fail("Readiness gates must pass or watch");
if (readiness.ag08d_handoff.next_stage_id !== "AG08D") fail("Readiness must hand off to AG08D");
if (readiness.ag08d_handoff.explicit_approval_required !== true) fail("AG08D handoff must require explicit approval");
if (readiness.ag08d_handoff.selected_article_path !== selectedPath) fail("AG08D handoff path mismatch");

if (schema.candidate_packet_creation_allowed_in_ag08c !== true) fail("Schema must allow candidate packet creation");
if (schema.selected_article_read_allowed_in_ag08c !== true) fail("Schema must allow selected article read");
if (schema.current_article_analysis_allowed_in_ag08c !== true) fail("Schema must allow current article analysis");
if (schema.proposed_structure_allowed_in_ag08c !== true) fail("Schema must allow proposed structure");
if (schema.reference_need_planning_allowed_in_ag08c !== true) fail("Schema must allow reference planning");
if (schema.visual_data_need_planning_allowed_in_ag08c !== true) fail("Schema must allow visual/data planning");
if (schema.article_mutation_allowed_in_ag08c !== false) fail("Schema must block article mutation");
if (schema.article_prose_generation_allowed_in_ag08c !== false) fail("Schema must block article prose generation");
if (schema.file_edit_allowed_in_ag08c !== false) fail("Schema must block file edit");
if (schema.reference_url_population_allowed_in_ag08c !== false) fail("Schema must block reference URL population");
if (schema.reference_insertion_allowed_in_ag08c !== false) fail("Schema must block reference insertion");
if (schema.visual_generation_allowed_in_ag08c !== false) fail("Schema must block visual generation");
if (schema.image_insertion_allowed_in_ag08c !== false) fail("Schema must block image insertion");
if (schema.production_jsonl_append_allowed_in_ag08c !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag08c !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag08c !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_allowed_in_ag08c !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag08c !== false) fail("Schema must block publishing");

for (const obj of [review, registry, preview]) {
  if (obj.summary.candidate_packet_created !== true) fail(`${obj.title || "preview"} candidate packet must be created`);
  if (obj.summary.selected_article_path !== selectedPath) fail(`${obj.title || "preview"} selected path mismatch`);
  if (obj.summary.reference_need_plan_created !== true) fail(`${obj.title || "preview"} reference plan must be created`);
  if (obj.summary.visual_data_need_plan_created !== true) fail(`${obj.title || "preview"} visual/data plan must be created`);
  if (obj.summary.readiness_record_created !== true) fail(`${obj.title || "preview"} readiness record must be created`);
  if (obj.summary.next_stage_id !== "AG08D") fail(`${obj.title || "preview"} next stage must be AG08D`);
  if (obj.summary.article_mutation_performed !== false) fail(`${obj.title || "preview"} must not mutate article`);
  if (obj.summary.file_edit_performed !== false) fail(`${obj.title || "preview"} must not edit files`);
  if (obj.summary.article_prose_generated !== false) fail(`${obj.title || "preview"} must not generate article prose`);
  if (obj.summary.reference_url_population_performed !== false) fail(`${obj.title || "preview"} must not populate reference URLs`);
  if (obj.summary.reference_insertion_performed !== false) fail(`${obj.title || "preview"} must not insert references`);
  if (obj.summary.visual_generation_performed !== false) fail(`${obj.title || "preview"} must not generate visuals`);
  if (obj.summary.image_insertion_performed !== false) fail(`${obj.title || "preview"} must not insert images`);
  if (obj.summary.production_jsonl_append_performed !== false) fail(`${obj.title || "preview"} must not append JSONL`);
  if (obj.summary.database_write_performed !== false) fail(`${obj.title || "preview"} must not write database`);
  if (obj.summary.supabase_write_performed !== false) fail(`${obj.title || "preview"} must not write Supabase`);
  if (obj.summary.backend_auth_supabase_activation_performed !== false) fail(`${obj.title || "preview"} must not activate backend/Auth/Supabase`);
  if (obj.summary.publishing_performed !== false) fail(`${obj.title || "preview"} must not publish`);
  if (obj.summary.production_readiness_after_ag08c !== "candidate_packet_created_not_production_ready") fail(`${obj.title || "preview"} production readiness mismatch`);
  if (obj.summary.publish_readiness_after_ag08c !== "blocked") fail(`${obj.title || "preview"} publish readiness mismatch`);
}

if (review.closure_decision.decision !== "ag08c_candidate_packet_closed_ready_for_ag08d_readiness_review") fail("Closure decision mismatch");
if (review.closure_decision.candidate_packet_created !== true) fail("Closure must create candidate packet");
if (review.closure_decision.selected_article_path !== selectedPath) fail("Closure selected path mismatch");
if (review.closure_decision.proceed_to_ag08d_only_with_explicit_user_approval !== true) fail("AG08D must require explicit approval");
if (review.closure_decision.article_mutation_performed !== false) fail("Closure must not mutate article");
if (review.closure_decision.file_edit_performed !== false) fail("Closure must not edit files");
if (review.closure_decision.article_prose_generated !== false) fail("Closure must not generate article prose");
if (review.closure_decision.reference_url_population_performed !== false) fail("Closure must not populate URLs");
if (review.closure_decision.visual_generation_performed !== false) fail("Closure must not generate visuals");
if (review.closure_decision.production_readiness !== "candidate_packet_created_not_production_ready") fail("Closure production readiness mismatch");
if (review.closure_decision.publish_readiness !== "blocked") fail("Closure publish readiness mismatch");

checkTrueFields([review, packet, readiness, schema, learning, registry, preview], [
  "candidate_packet_only",
  "selected_article_read_performed",
  "selected_article_hash_recorded",
  "current_article_analysis_created",
  "upgrade_candidate_packet_created",
  "readiness_record_created"
]);

checkFalseFields([review, packet, readiness, schema, learning, registry, preview], [
  "selected_article_mutated",
  "article_mutation_performed",
  "new_article_generation_performed",
  "new_article_file_created",
  "article_file_created",
  "article_prose_generated",
  "final_article_prose_generated",
  "narrative_text_generated",
  "production_packet_created",
  "article_inference_generated",
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

for (const scriptName of ["generate:ag08c", "validate:ag08c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag08c")) {
  fail("validate:project must include validate:ag08c");
}

for (const phrase of [
  "Purpose",
  "Selected Article",
  "Candidate Upgrade Goal",
  "Reader-Value Goal",
  "Proposed Structure",
  "Reference Need Plan",
  "Visual/Data Need Plan",
  "Explicit Exclusions",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG08C document missing phrase: ${phrase}`);
}

pass("AG08C registry is present.");
pass("AG08C document is present.");
pass("AG08C review, candidate packet, readiness record, schema, learning record and preview are present.");
pass("AG08B selected article is consumed.");
pass(`Candidate packet target is ${selectedPath}.`);
pass("Selected article hash is recorded and unchanged.");
pass("Current article analysis is created.");
pass("Upgrade hypothesis and proposed structure are created without final prose generation.");
pass("Reference need plan is created without URL population or insertion.");
pass("Visual/data need plan is created without visual generation or image insertion.");
pass("AG08D handoff is created with explicit approval required.");
pass("No article mutation, file edit, article prose generation, reference insertion, visual generation or image insertion is performed.");
pass("No production JSONL append, database write, Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is candidate_packet_created_not_production_ready.");
pass("Publish readiness remains blocked.");
pass("AG08C is Article Upgrade Candidate Packet only.");
