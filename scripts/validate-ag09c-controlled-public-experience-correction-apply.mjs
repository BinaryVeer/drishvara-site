import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

function fail(message) {
  console.error(`❌ AG09C validation failed: ${message}`);
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

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag09b-public-experience-correction-plan.json",
  "data/content-intelligence/mutation-plans/ag09b-public-experience-correction-plan.json",
  "data/content-intelligence/quality-registry/ag09b-correction-plan-readiness.json",
  "data/content-intelligence/mutation-plans/ag09b-to-ag09c-controlled-correction-apply-boundary.json",
  "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json",
  "data/content-intelligence/quality-reviews/ag09c-controlled-public-experience-correction-apply.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",
  "data/content-intelligence/quality-registry/ag09c-post-correction-audit-prep.json",
  "data/content-intelligence/schema/controlled-public-experience-correction-apply.schema.json",
  "data/content-intelligence/learning/ag09c-controlled-public-experience-correction-apply-learning.json",
  "data/quality/ag09c-controlled-public-experience-correction-apply.json",
  "data/quality/ag09c-controlled-public-experience-correction-apply-preview.json",
  "docs/quality/AG09C_CONTROLLED_PUBLIC_EXPERIENCE_CORRECTION_APPLY.md",
  "package.json"
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag09bReview = readJson("data/content-intelligence/quality-reviews/ag09b-public-experience-correction-plan.json");
const ag09bPlan = readJson("data/content-intelligence/mutation-plans/ag09b-public-experience-correction-plan.json");
const ag09bReadiness = readJson("data/content-intelligence/quality-registry/ag09b-correction-plan-readiness.json");
const ag09bBoundary = readJson("data/content-intelligence/mutation-plans/ag09b-to-ag09c-controlled-correction-apply-boundary.json");
const ag08kApply = readJson("data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag09c-controlled-public-experience-correction-apply.json");
const apply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");
const auditPrep = readJson("data/content-intelligence/quality-registry/ag09c-post-correction-audit-prep.json");
const schema = readJson("data/content-intelligence/schema/controlled-public-experience-correction-apply.schema.json");
const learning = readJson("data/content-intelligence/learning/ag09c-controlled-public-experience-correction-apply-learning.json");
const registry = readJson("data/quality/ag09c-controlled-public-experience-correction-apply.json");
const preview = readJson("data/quality/ag09c-controlled-public-experience-correction-apply-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG09C_CONTROLLED_PUBLIC_EXPERIENCE_CORRECTION_APPLY.md"), "utf8");

for (const obj of [review, apply, auditPrep, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG09C") fail(`module_id must be AG09C in ${obj.title || "object"}`);
}

if (ag09bReview.status !== "correction_plan_created_not_executed") fail("AG09B review must be plan-created");
if (ag09bPlan.status !== "correction_plan_created_not_executed") fail("AG09B plan must be plan-created");
if (ag09bReadiness.status !== "correction_plan_ready_pending_explicit_ag09c") fail("AG09B readiness mismatch");
if (ag09bBoundary.next_stage_id !== "AG09C") fail("AG09C boundary missing");

const target = apply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const articleHtml = fs.readFileSync(path.join(root, target), "utf8");
const currentHash = sha256(articleHtml);

if (apply.pre_correction_hash !== ag08kApply.post_insertion_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) fail("Pre-correction hash must match AG08K post-insertion hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state");
if (currentHash !== apply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) fail("Current article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state");
if (currentHash === apply.pre_correction_hash) fail("AG09C must change selected article when metadata/social correction is planned");

if (apply.status !== "controlled_public_experience_corrections_applied_pending_audit") fail("Apply status mismatch");
if (review.status !== "controlled_public_experience_corrections_applied_pending_audit") fail("Review status mismatch");
if (registry.status !== "controlled_public_experience_corrections_applied_pending_audit") fail("Registry status mismatch");
if (preview.status !== "controlled_public_experience_corrections_applied_pending_audit") fail("Preview status mismatch");
if (auditPrep.status !== "post_public_experience_correction_audit_required") fail("Audit prep status mismatch");

if (apply.correction_item_count !== ag09bPlan.correction_item_count) fail("Correction item count mismatch");

const appliedCount = apply.applied_corrections.filter((c) => c.applied).length;
if (appliedCount !== ag09bPlan.correction_item_count) fail("All planned correction items must be applied");

if (!Array.isArray(apply.backups) || apply.backups.length < 1) fail("At least one backup must be created");

for (const backup of apply.backups) {
  if (!fs.existsSync(path.join(root, backup.backup_path))) fail(`Backup missing: ${backup.backup_path}`);
  const backupHash = sha256(fs.readFileSync(path.join(root, backup.backup_path), "utf8"));
  if (backupHash !== backup.backup_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation(backup.backup_path)) if (!ag11bControlledChartInsertionAllowsPostMutation(backup.backup_path)) if (!ag11cControlledInfographicInsertionAllowsPostMutation(backup.backup_path)) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation(backup.backup_path)) if (!ag11eControlledTableInsertionAllowsPostMutation(backup.backup_path)) fail(`Backup hash mismatch: ${backup.backup_path} or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state`);
  if (backupHash !== backup.pre_hash) fail(`Backup must match pre-hash: ${backup.backup_path}`);
}

for (const mutated of apply.mutated_files) {
  if (!fs.existsSync(path.join(root, mutated.file_path))) fail(`Mutated file missing: ${mutated.file_path}`);
  const hash = sha256(fs.readFileSync(path.join(root, mutated.file_path), "utf8"));
  if (hash !== mutated.post_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation(mutated.file_path)) if (!ag11bControlledChartInsertionAllowsPostMutation(mutated.file_path)) if (!ag11cControlledInfographicInsertionAllowsPostMutation(mutated.file_path)) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation(mutated.file_path)) if (!ag11eControlledTableInsertionAllowsPostMutation(mutated.file_path)) fail(`Mutated file post hash mismatch: ${mutated.file_path} or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state`);
}

for (const expected of [
  "AG09C-PUBLIC-EXPERIENCE-METADATA",
  'property="og:title"',
  'property="og:description"',
  'property="og:image"',
  'name="twitter:card"',
  'name="twitter:image"',
  'rel="canonical"'
]) {
  if (!articleHtml.includes(expected)) fail(`Selected article missing metadata correction evidence: ${expected}`);
}

if (apply.homepage_or_listing_mutation_performed_in_ag09c) {
  const listingMutation = apply.mutated_files.find((item) => item.file_path !== target);
  if (!listingMutation) fail("Listing mutation flag is true but no listing mutated file recorded");
  const listingHtml = fs.readFileSync(path.join(root, listingMutation.file_path), "utf8");
  if (!listingHtml.includes("AG09C-PUBLIC-EXPERIENCE-LISTING")) fail("Listing file missing AG09C listing marker");
  if (!listingHtml.includes(target)) fail("Listing file missing selected article link");
}

if (schema.status !== "schema_controlled_public_experience_correction_apply") fail("Schema status mismatch");
if (schema.selected_article_head_metadata_correction_allowed_in_ag09c !== true) fail("Schema must allow metadata correction");
if (schema.social_preview_metadata_correction_allowed_in_ag09c !== true) fail("Schema must allow social-preview correction");
if (schema.homepage_or_listing_discoverability_correction_allowed_in_ag09c !== true) fail("Schema must allow listing correction");
if (schema.fresh_backup_creation_required_in_ag09c !== true) fail("Schema must require backups");

for (const key of [
  "css_js_mutation_allowed_in_ag09c",
  "reference_insertion_allowed_in_ag09c",
  "reference_url_change_allowed_in_ag09c",
  "visual_generation_allowed_in_ag09c",
  "image_asset_creation_allowed_in_ag09c",
  "image_insertion_allowed_in_ag09c",
  "live_url_fetch_allowed_in_ag09c",
  "production_jsonl_append_allowed_in_ag09c",
  "database_write_allowed_in_ag09c",
  "supabase_write_allowed_in_ag09c",
  "backend_auth_supabase_activation_allowed_in_ag09c",
  "publishing_allowed_in_ag09c"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, apply, auditPrep, schema, learning, registry, preview]) {
  if (obj.controlled_public_experience_correction_apply_stage !== true) fail(`${obj.title || "object"} must be AG09C apply-stage`);
  if (obj.css_mutation_performed_in_ag09c !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag09c !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag09c !== false) fail(`${obj.title || "object"} must not insert references`);
  if (obj.reference_url_change_performed_in_ag09c !== false) fail(`${obj.title || "object"} must not change reference URLs`);
  if (obj.visual_generation_performed_in_ag09c !== false) fail(`${obj.title || "object"} must not generate visuals`);
  if (obj.image_asset_creation_performed_in_ag09c !== false) fail(`${obj.title || "object"} must not create image assets`);
  if (obj.image_insertion_performed_in_ag09c !== false) fail(`${obj.title || "object"} must not insert images`);
  if (obj.live_url_fetch_performed_in_ag09c !== false) fail(`${obj.title || "object"} must not fetch live URL`);
  if (obj.database_write_performed_in_ag09c !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag09c !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag09c !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_performed_in_ag09c !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag09c_corrections_applied_pending_explicit_ag09d_audit") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag09d_only_with_explicit_user_approval !== true) fail("AG09D must require explicit approval");
if (review.closure_decision.publish_approval_granted !== false) fail("Publishing must not be approved");

for (const scriptName of ["generate:ag09c", "validate:ag09c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag09c")) {
  fail("validate:project must include validate:ag09c");
}

for (const phrase of ["Purpose", "Applied Scope", "Boundaries", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG09C document missing phrase: ${phrase}`);
}

pass("AG09C registry is present.");
pass("AG09C document is present.");
pass("AG09C review, apply record, audit prep, schema, learning record and preview are present.");
pass("AG09B correction plan and AG09C boundary are consumed.");
pass("Fresh backups exist for mutated files.");
pass("Selected article metadata/social-preview correction is applied.");
pass("Listing discoverability correction is applied if planned.");
pass("No CSS/JS mutation, reference change, visual/image generation or insertion is performed.");
pass("No live URL fetch, JSONL append, database/Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Publish readiness remains static_files_changed_not_publish_approved.");
pass("AG09D Post-Correction Public Experience Audit is identified as next only with explicit approval.");
