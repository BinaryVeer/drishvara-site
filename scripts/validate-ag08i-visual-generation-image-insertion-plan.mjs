import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag08h-post-apply-audit.json",
  "data/content-intelligence/audit-records/ag08h-post-apply-audit-report.json",
  "data/content-intelligence/quality-registry/ag08h-rollback-readiness-record.json",
  "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json",
  "data/quality/ag06i-visual-data-infographic-requirement-schema-closure.json",
  "data/content-intelligence/quality-reviews/ag08i-visual-generation-image-insertion-plan.json",
  "data/content-intelligence/visual-registry/ag08i-visual-generation-image-insertion-plan.json",
  "data/content-intelligence/mutation-plans/ag08i-controlled-visual-apply-plan.json",
  "data/content-intelligence/quality-registry/ag08i-visual-apply-planning-readiness.json",
  "data/content-intelligence/schema/visual-generation-image-insertion-plan.schema.json",
  "data/content-intelligence/learning/ag08i-visual-generation-image-insertion-plan-learning.json",
  "data/quality/ag08i-visual-generation-image-insertion-plan.json",
  "data/quality/ag08i-visual-generation-image-insertion-plan-preview.json",
  "docs/quality/AG08I_VISUAL_GENERATION_IMAGE_INSERTION_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG08I validation failed: ${message}`);
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




function ag11cControlledInfographicInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
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
  if (ag09cControlledPublicExperienceCorrectionAllowsPostMutation(...arguments)) return true;
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

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag08hReview = readJson("data/content-intelligence/quality-reviews/ag08h-post-apply-audit.json");
const ag08hAudit = readJson("data/content-intelligence/audit-records/ag08h-post-apply-audit-report.json");
const ag08hRollback = readJson("data/content-intelligence/quality-registry/ag08h-rollback-readiness-record.json");
const ag08gApply = readJson("data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag08i-visual-generation-image-insertion-plan.json");
const visualPlan = readJson("data/content-intelligence/visual-registry/ag08i-visual-generation-image-insertion-plan.json");
const controlledPlan = readJson("data/content-intelligence/mutation-plans/ag08i-controlled-visual-apply-plan.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag08i-visual-apply-planning-readiness.json");
const schema = readJson("data/content-intelligence/schema/visual-generation-image-insertion-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag08i-visual-generation-image-insertion-plan-learning.json");
const registry = readJson("data/quality/ag08i-visual-generation-image-insertion-plan.json");
const preview = readJson("data/quality/ag08i-visual-generation-image-insertion-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG08I_VISUAL_GENERATION_IMAGE_INSERTION_PLAN.md"), "utf8");

for (const obj of [review, visualPlan, controlledPlan, readiness, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG08I" && obj !== visualPlan) {
    fail(`module_id must be AG08I in ${obj.title || "object"}`);
  }
}

if (ag08hReview.status !== "post_apply_audit_passed") fail("AG08H review must be passed");
if (ag08hAudit.status !== "post_apply_audit_passed") fail("AG08H audit report must be passed");
if (ag08hRollback.status !== "rollback_ready_not_executed") fail("AG08H rollback readiness must be ready and not executed");

const target = ag08gApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Target article missing: ${target}`);

const targetHtml = fs.readFileSync(path.join(root, target), "utf8");
const currentHash = sha256(targetHtml);
if (currentHash !== ag08gApply.post_apply_hash && !ag08kControlledVisualInsertionAllowsPostMutation(target, currentHash) && !ag09cControlledPublicExperienceCorrectionAllowsPostMutation()) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) fail("Target article hash must match AG08G post-apply hash or AG08K controlled visual insertion hash or AG09C controlled post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state");

if (review.status !== "visual_generation_image_insertion_plan_created") fail("AG08I review status mismatch");
if (registry.status !== "visual_generation_image_insertion_plan_created") fail("AG08I registry status mismatch");
if (preview.status !== "visual_generation_image_insertion_plan_created") fail("AG08I preview status mismatch");
if (readiness.status !== "visual_plan_ready_pending_future_explicit_stage") fail("AG08I readiness status mismatch");
if (controlledPlan.status !== "future_visual_apply_boundary_created_not_executed") fail("Controlled visual apply plan status mismatch");
if (schema.status !== "schema_visual_plan_only") fail("Schema status mismatch");
if (learning.status !== "learning_record_only") fail("Learning status mismatch");

if (visualPlan.target_article_path !== target) fail("Visual plan target mismatch");
if (visualPlan.target_article_hash_at_ag08i !== currentHash && !ag08kControlledVisualInsertionAllowsPostMutation(target, currentHash)) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) fail("Visual plan hash mismatch or AG08K controlled visual insertion hash missing or AG10K controlled generated-image post-insertion hash missing or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state");
if (visualPlan.planning_status !== "visual_plan_created_no_asset_generated") fail("Visual plan status mismatch");
if (!visualPlan.recommended_visual_type) fail("Recommended visual type missing");
if (!visualPlan.visual_intent) fail("Visual intent missing");
if (!visualPlan.source_rights_rules?.allowed_sources?.length) fail("Allowed source rules missing");
if (!visualPlan.source_rights_rules?.disallowed_sources?.length) fail("Disallowed source rules missing");
if (!visualPlan.placement_rules?.alt_text_required) fail("Alt text requirement missing");
if (!visualPlan.placement_rules?.figcaption_required) fail("Caption requirement missing");
if (!visualPlan.placement_rules?.visible_credit_required) fail("Visible credit requirement missing");
if (!visualPlan.mobile_layout_checks?.length) fail("Mobile layout checks missing");
if (visualPlan.fallback_rule?.fallback_required !== true) fail("Fallback rule required");

const primary = visualPlan.visual_components?.find((item) => item.component_type === "primary_hero_visual");
if (!primary) fail("Primary hero visual component missing");
if (primary.image_credit_required !== true) fail("Primary visual image credit must be required");
if (!primary.alt_text_draft) fail("Primary visual alt text draft missing");
if (!primary.caption_draft) fail("Primary visual caption draft missing");
if (!primary.planned_output_path?.includes("ag08j")) fail("Planned output path must be deferred to AG08J");

if (controlledPlan.future_controlled_apply_boundary.next_stage_id !== "AG08J") fail("AG08J handoff missing");
if (controlledPlan.future_controlled_apply_boundary.explicit_approval_required !== true) fail("AG08J explicit approval required");
if (controlledPlan.backup_rollback_requirement.future_visual_apply_backup_required !== true) fail("Future visual apply backup must be required");
if (controlledPlan.backup_rollback_requirement.ag08i_backup_created !== false) fail("AG08I must not create backup");

if (readiness.all_readiness_checks_passed !== true) fail("All AG08I readiness checks must pass");
if (readiness.ag08j_handoff.next_stage_id !== "AG08J") fail("Readiness must hand off to AG08J");

if (schema.visual_type_definition_allowed_in_ag08i !== true) fail("Schema must allow visual type definition");
if (schema.source_rights_rule_definition_allowed_in_ag08i !== true) fail("Schema must allow rights planning");
if (schema.image_credit_attribution_planning_allowed_in_ag08i !== true) fail("Schema must allow credit planning");
if (schema.alt_text_caption_planning_allowed_in_ag08i !== true) fail("Schema must allow alt/caption planning");
if (schema.placement_planning_allowed_in_ag08i !== true) fail("Schema must allow placement planning");
if (schema.mobile_layout_check_planning_allowed_in_ag08i !== true) fail("Schema must allow mobile planning");
if (schema.fallback_rule_planning_allowed_in_ag08i !== true) fail("Schema must allow fallback planning");
if (schema.backup_rollback_requirement_planning_allowed_in_ag08i !== true) fail("Schema must allow backup/rollback planning");
if (schema.future_apply_boundary_planning_allowed_in_ag08i !== true) fail("Schema must allow future boundary planning");

if (schema.visual_generation_allowed_in_ag08i !== false) fail("Schema must block visual generation");
if (schema.image_asset_creation_allowed_in_ag08i !== false) fail("Schema must block image asset creation");
if (schema.image_insertion_allowed_in_ag08i !== false) fail("Schema must block image insertion");
if (schema.article_mutation_allowed_in_ag08i !== false) fail("Schema must block article mutation");
if (schema.file_edit_allowed_in_ag08i !== false) fail("Schema must block file edit");
if (schema.css_js_mutation_allowed_in_ag08i !== false) fail("Schema must block CSS/JS mutation");
if (schema.reference_insertion_allowed_in_ag08i !== false) fail("Schema must block reference insertion");
if (schema.production_jsonl_append_allowed_in_ag08i !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag08i !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag08i !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_activation_allowed_in_ag08i !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag08i !== false) fail("Schema must block publishing");

for (const obj of [review, controlledPlan, readiness, schema, learning, registry, preview]) {
  if (obj.visual_generation_plan_only !== true) fail(`${obj.title || "object"} must be planning-only`);
  if (obj.visual_generation_performed_in_ag08i !== false) fail(`${obj.title || "object"} must not generate visuals`);
  if (obj.visual_asset_created_in_ag08i !== false) fail(`${obj.title || "object"} must not create image asset`);
  if (obj.image_insertion_performed_in_ag08i !== false) fail(`${obj.title || "object"} must not insert image`);
  if (obj.article_mutation_performed_in_ag08i !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.file_edit_performed_in_ag08i !== false) fail(`${obj.title || "object"} must not edit files`);
  if (obj.css_mutation_performed_in_ag08i !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag08i !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag08i !== false) fail(`${obj.title || "object"} must not insert references`);
  if (obj.production_jsonl_append_performed_in_ag08i !== false) fail(`${obj.title || "object"} must not append JSONL`);
  if (obj.database_write_performed_in_ag08i !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag08i !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag08i !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_performed_in_ag08i !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag08i_visual_plan_created_pending_explicit_ag08j") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag08j_only_with_explicit_user_approval !== true) fail("AG08J must require explicit approval");
if (review.closure_decision.production_readiness !== "visual_plan_created_not_apply_ready") fail("Production readiness mismatch");
if (review.closure_decision.publish_readiness !== "blocked") fail("Publish readiness mismatch");

for (const scriptName of ["generate:ag08i", "validate:ag08i"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag08i")) {
  fail("validate:project must include validate:ag08i");
}

for (const phrase of [
  "Purpose",
  "Target Article",
  "Planned Visual Type",
  "Source and Rights Rules",
  "Required Metadata",
  "Future Apply Boundary",
  "Exclusions"
]) {
  if (!docText.includes(phrase)) fail(`AG08I document missing phrase: ${phrase}`);
}

pass("AG08I registry is present.");
pass("AG08I document is present.");
pass("AG08I review, visual plan, controlled visual apply plan, readiness record, schema, learning record and preview are present.");
pass("AG08H post-apply audit and rollback readiness are consumed.");
pass("Target article hash matches AG08G post-apply hash.");
pass("Visual type and intent are defined.");
pass("Source/rights rules are defined.");
pass("Image credit, attribution, alt text and caption requirements are defined.");
pass("Placement, mobile layout and fallback rules are defined.");
pass("Future visual apply backup/rollback requirement is defined.");
pass("AG08J handoff is created with explicit approval required.");
pass("No visual generation, image asset creation, image insertion, article mutation or file edit is performed.");
pass("No CSS/JS mutation, production JSONL append, database/Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is visual_plan_created_not_apply_ready.");
pass("Publish readiness remains blocked.");
pass("AG08I is Visual Generation / Image Insertion Plan only.");
