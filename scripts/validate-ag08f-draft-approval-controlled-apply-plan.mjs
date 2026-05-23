import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag08e-full-upgrade-draft-candidate-references.json",
  "data/content-intelligence/content-packets/ag08e-full-upgrade-draft-candidate.json",
  "data/content-intelligence/reference-registry/ag08e-candidate-reference-urls.json",
  "data/content-intelligence/quality-registry/ag08e-draft-candidate-readiness.json",
  "data/content-intelligence/schema/full-upgrade-draft-candidate-references.schema.json",
  "data/content-intelligence/learning/ag08e-full-upgrade-draft-candidate-references-learning.json",
  "data/content-intelligence/quality-reviews/ag08f-draft-approval-controlled-apply-plan.json",
  "data/content-intelligence/approval-registry/ag08f-draft-reference-approval-record.json",
  "data/content-intelligence/mutation-plans/ag08f-controlled-apply-plan.json",
  "data/content-intelligence/quality-registry/ag08f-apply-readiness-record.json",
  "data/content-intelligence/schema/draft-approval-controlled-apply-plan.schema.json",
  "data/content-intelligence/learning/ag08f-draft-approval-controlled-apply-plan-learning.json",
  "data/quality/ag08f-draft-approval-controlled-apply-plan.json",
  "data/quality/ag08f-draft-approval-controlled-apply-plan-preview.json",
  "docs/quality/AG08F_DRAFT_APPROVAL_CONTROLLED_APPLY_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG08F validation failed: ${message}`);
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





function ag11dControlledFigureDiagramInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
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

const ag08eReview = readJson("data/content-intelligence/quality-reviews/ag08e-full-upgrade-draft-candidate-references.json");
const ag08eDraft = readJson("data/content-intelligence/content-packets/ag08e-full-upgrade-draft-candidate.json");
const ag08eReferences = readJson("data/content-intelligence/reference-registry/ag08e-candidate-reference-urls.json");
const ag08eReadiness = readJson("data/content-intelligence/quality-registry/ag08e-draft-candidate-readiness.json");
const ag08eSchema = readJson("data/content-intelligence/schema/full-upgrade-draft-candidate-references.schema.json");

const review = readJson("data/content-intelligence/quality-reviews/ag08f-draft-approval-controlled-apply-plan.json");
const approval = readJson("data/content-intelligence/approval-registry/ag08f-draft-reference-approval-record.json");
const applyPlan = readJson("data/content-intelligence/mutation-plans/ag08f-controlled-apply-plan.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag08f-apply-readiness-record.json");
const schema = readJson("data/content-intelligence/schema/draft-approval-controlled-apply-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag08f-draft-approval-controlled-apply-plan-learning.json");
const registry = readJson("data/quality/ag08f-draft-approval-controlled-apply-plan.json");
const preview = readJson("data/quality/ag08f-draft-approval-controlled-apply-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG08F_DRAFT_APPROVAL_CONTROLLED_APPLY_PLAN.md"), "utf8");

for (const obj of [review, approval, applyPlan, readiness, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG08F") fail(`module_id must be AG08F in ${obj.title || "preview"}`);
}

if (ag08eReview.status !== "full_upgrade_draft_candidate_and_references_created") fail("AG08E must be draft-candidate completed");
if (ag08eReview.closure_decision.proceed_to_ag08f_only_with_explicit_user_approval !== true) fail("AG08E must require explicit approval for AG08F");
if (ag08eReview.closure_decision.article_mutation_performed !== false) fail("AG08E must not mutate article");
if (ag08eReview.closure_decision.reference_insertion_performed !== false) fail("AG08E must not insert references");
if (ag08eReadiness.ag08f_handoff.next_stage_id !== "AG08F") fail("AG08E readiness must hand off to AG08F");
if (ag08eSchema.article_mutation_allowed_in_ag08e !== false) fail("AG08E schema must block mutation");

if (review.status !== "draft_approval_controlled_apply_plan_created") fail("AG08F review status mismatch");
if (approval.status !== "draft_and_references_approved_for_ag08g_apply_plan") fail("AG08F approval status mismatch");
if (applyPlan.status !== "apply_plan_created_not_executed") fail("AG08F apply plan status mismatch");
if (readiness.status !== "ag08g_apply_plan_ready_pending_explicit_approval") fail("AG08F readiness status mismatch");
if (schema.status !== "schema_approval_apply_plan_only") fail("AG08F schema status mismatch");
if (learning.status !== "learning_record_only") fail("AG08F learning status mismatch");

const selectedPath = ag08eDraft.selected_article.article_path;
if (!fs.existsSync(path.join(root, selectedPath))) fail(`Selected article does not exist: ${selectedPath}`);
const html = fs.readFileSync(path.join(root, selectedPath), "utf8");
const currentHash = sha256(html);

for (const obj of [review.summary, approval, applyPlan, readiness]) {
  const hash = obj.selected_article_sha256_before_ag08f;
  if (hash && hash !== currentHash) if (!ag08gControlledApplyAllowsPostMutation()) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("Selected article hash mismatch in AG08F artifacts or AG08G controlled post-apply hash missing or AG10K controlled generated-image post-insertion hash missing or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");
}
if (ag08eDraft.selected_article.sha256_before_ag08e !== currentHash) if (!ag08gControlledApplyAllowsPostMutation()) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("AG08F hash must match AG08E hash or AG08G controlled post-apply hash missing or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");

const draftWords = countWords(ag08eDraft.draft_candidate.draft_text);
if (approval.draft_approval.draft_word_count_estimate !== draftWords) fail("Draft approval word count mismatch");
if (approval.draft_approval.within_target_word_count_range !== true) fail("Draft must be within target range");
if (approval.draft_approval.approved_for_ag08g_apply !== true) fail("Draft must be approved for AG08G apply");
if (approval.draft_approval.approval_status !== "approved_for_controlled_apply_plan") fail("Draft approval status mismatch");

if (approval.reference_approval.approved_reference_count !== ag08eReferences.candidate_count) fail("Approved reference count must match AG08E candidate count");
if (approval.reference_approval.approved_reference_count < 2) fail("At least two references must be approved");
if (approval.reference_approval.insertion_status !== "approved_not_inserted_in_ag08f") fail("References must not be inserted in AG08F");
for (const ref of approval.reference_approval.approved_references) {
  if (ref.approval_status !== "approved_for_ag08g_insertion") fail(`Reference approval status mismatch: ${ref.reference_id}`);
  if (ref.insertion_status !== "approved_not_inserted") fail(`Reference must not be inserted: ${ref.reference_id}`);
  if (!ref.url?.startsWith("https://")) fail(`Approved reference URL must be https: ${ref.reference_id}`);
}

if (approval.visual_decision.visual_generation_approval_status !== "not_approved_for_ag08g") fail("Visual generation must not be approved in AG08F");
if (approval.visual_decision.image_insertion_approval_status !== "not_approved_for_ag08g") fail("Image insertion must not be approved in AG08F");

if (approval.backup_rollback_plan.backup_required_before_apply !== true) fail("Backup must be required before apply");
if (!approval.backup_rollback_plan.backup_path.includes("archive/ag08g-backups/")) fail("Backup path must be under archive/ag08g-backups");
if (approval.backup_rollback_plan.backup_status_in_ag08f !== "planned_not_created") fail("Backup must not be created in AG08F");

if (applyPlan.selected_article_path !== selectedPath) fail("Apply plan selected path mismatch");
if (applyPlan.ag08g_target_article_path !== selectedPath) fail("AG08G target path mismatch");
if (applyPlan.allowed_ag08g_mutation_scope.exactly_one_article_file !== true) fail("AG08G scope must be exactly one article file");
if (applyPlan.allowed_ag08g_mutation_scope.allowed_target_article_path !== selectedPath) fail("AG08G allowed path mismatch");
if (!applyPlan.article_body_apply_strategy.marker_required.includes("AG08G-CONTROLLED-APPLY")) fail("AG08G marker requirement missing");
if (applyPlan.article_body_apply_strategy.marker_count_required_after_apply !== 1) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("AG08G marker count must be one or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");
if (applyPlan.reference_apply_strategy.approved_reference_count !== approval.reference_approval.approved_reference_count) fail("Reference apply count mismatch");
if (applyPlan.reference_apply_strategy.insert_only_approved_references !== true) fail("AG08G must insert only approved references");
if (applyPlan.visual_apply_strategy.visual_generation_approval_status !== "not_approved_for_ag08g") fail("Visual generation must remain not approved");
if (applyPlan.execution_status !== "not_executed_in_ag08f") fail("Apply plan must not execute in AG08F");
if (!Array.isArray(applyPlan.post_apply_audit_checklist) || applyPlan.post_apply_audit_checklist.length < 7) fail("Post-apply audit checklist missing");

if (!Array.isArray(readiness.readiness_checks) || readiness.readiness_checks.length < 7) fail("Readiness checks missing");
if (readiness.all_readiness_checks_passed !== true) fail("All readiness checks must pass");
if (readiness.ag08g_handoff.next_stage_id !== "AG08G") fail("Readiness must hand off to AG08G");
if (readiness.ag08g_handoff.explicit_approval_required !== true) fail("AG08G handoff must require explicit approval");

if (schema.draft_review_allowed_in_ag08f !== true) fail("Schema must allow draft review");
if (schema.draft_approval_allowed_in_ag08f !== true) fail("Schema must allow draft approval");
if (schema.reference_approval_allowed_in_ag08f !== true) fail("Schema must allow reference approval");
if (schema.controlled_apply_planning_allowed_in_ag08f !== true) fail("Schema must allow apply planning");
if (schema.backup_rollback_planning_allowed_in_ag08f !== true) fail("Schema must allow backup planning");
if (schema.post_apply_audit_planning_allowed_in_ag08f !== true) fail("Schema must allow audit planning");
if (schema.ag08g_handoff_allowed_in_ag08f !== true) fail("Schema must allow AG08G handoff");
if (schema.article_mutation_allowed_in_ag08f !== false) fail("Schema must block article mutation");
if (schema.file_edit_allowed_in_ag08f !== false) fail("Schema must block file edit");
if (schema.article_file_write_allowed_in_ag08f !== false) fail("Schema must block article file write");
if (schema.reference_insertion_allowed_in_ag08f !== false) fail("Schema must block reference insertion");
if (schema.visual_generation_allowed_in_ag08f !== false) fail("Schema must block visual generation");
if (schema.image_insertion_allowed_in_ag08f !== false) fail("Schema must block image insertion");
if (schema.production_jsonl_append_allowed_in_ag08f !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag08f !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag08f !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_allowed_in_ag08f !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag08f !== false) fail("Schema must block publishing");

for (const obj of [review, registry, preview]) {
  if (obj.summary.draft_candidate_approved_for_ag08g_apply !== true) fail(`${obj.title || "preview"} draft must be approved`);
  if (obj.summary.candidate_references_approved_for_ag08g_insertion !== true) fail(`${obj.title || "preview"} references must be approved`);
  if (obj.summary.controlled_apply_plan_created !== true) fail(`${obj.title || "preview"} apply plan must be created`);
  if (obj.summary.backup_rollback_plan_created !== true) fail(`${obj.title || "preview"} backup plan must be created`);
  if (obj.summary.next_stage_id !== "AG08G") fail(`${obj.title || "preview"} next stage must be AG08G`);
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
  if (obj.summary.production_readiness_after_ag08f !== "apply_plan_ready_pending_explicit_ag08g_approval") fail(`${obj.title || "preview"} production readiness mismatch`);
  if (obj.summary.publish_readiness_after_ag08f !== "blocked") fail(`${obj.title || "preview"} publish readiness mismatch`);
}

if (review.closure_decision.decision !== "ag08f_apply_plan_closed_ready_for_ag08g_controlled_apply") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag08g_only_with_explicit_user_approval !== true) fail("AG08G must require explicit approval");
if (review.closure_decision.article_mutation_performed !== false) fail("Closure must not mutate article");
if (review.closure_decision.file_edit_performed !== false) fail("Closure must not edit file");
if (review.closure_decision.article_file_write_performed !== false) fail("Closure must not write article file");
if (review.closure_decision.reference_insertion_performed !== false) fail("Closure must not insert references");
if (review.closure_decision.visual_generation_performed !== false) fail("Closure must not generate visuals");
if (review.closure_decision.production_readiness !== "apply_plan_ready_pending_explicit_ag08g_approval") fail("Closure production readiness mismatch");
if (review.closure_decision.publish_readiness !== "blocked") fail("Closure publish readiness mismatch");

checkTrueFields([review, approval, applyPlan, readiness, schema, learning, registry, preview], [
  "draft_approval_plan_only",
  "draft_candidate_reviewed",
  "draft_candidate_approved_for_ag08g_apply",
  "candidate_references_reviewed",
  "candidate_references_approved_for_ag08g_insertion",
  "controlled_apply_plan_created",
  "backup_rollback_plan_created",
  "post_apply_audit_checklist_created",
  "ag08g_handoff_created",
  "selected_article_read_performed",
  "selected_article_hash_verified"
]);

checkFalseFields([review, approval, applyPlan, readiness, schema, learning, registry, preview], [
  "selected_article_mutated",
  "article_mutation_performed",
  "new_article_file_created",
  "article_file_created",
  "final_article_file_generated",
  "article_html_mutation_performed",
  "public_article_mutation_performed",
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

for (const scriptName of ["generate:ag08f", "validate:ag08f"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag08f")) {
  fail("validate:project must include validate:ag08f");
}

for (const phrase of [
  "Purpose",
  "Selected Article",
  "Draft Approval",
  "Reference Approval",
  "Controlled Apply Plan",
  "Visual Decision",
  "Explicit Exclusions",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG08F document missing phrase: ${phrase}`);
}

pass("AG08F registry is present.");
pass("AG08F document is present.");
pass("AG08F review, approval record, controlled apply plan, readiness record, schema, learning record and preview are present.");
pass("AG08E draft candidate and candidate references are consumed.");
pass(`Controlled apply target is ${selectedPath}.`);
pass("Draft candidate is approved for AG08G apply.");
pass("Candidate references are approved for AG08G insertion but not inserted in AG08F.");
pass("Backup and rollback plan is created but backup is not created in AG08F.");
pass("Visual generation and image insertion remain deferred.");
pass("AG08G handoff is created with explicit approval required.");
pass("Selected article hash is verified and unchanged.");
pass("No article mutation, file edit, reference insertion, visual generation or image insertion is performed.");
pass("No production JSONL append, database write, Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is apply_plan_ready_pending_explicit_ag08g_approval.");
pass("Publish readiness remains blocked.");
pass("AG08F is Draft Approval and Controlled Apply Plan only.");
