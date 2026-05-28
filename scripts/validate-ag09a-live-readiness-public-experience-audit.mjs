import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag08z-repeatable-article-upgrade-cycle-closure.json",
  "data/content-intelligence/closure-records/ag08z-repeatable-article-upgrade-cycle-closure.json",
  "data/content-intelligence/quality-registry/ag08z-final-readiness-record.json",
  "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json",
  "data/content-intelligence/audit-records/ag08l-post-visual-insertion-audit-report.json",
  "data/content-intelligence/quality-reviews/ag09a-live-readiness-public-experience-audit.json",
  "data/content-intelligence/audit-records/ag09a-live-readiness-public-experience-audit-report.json",
  "data/content-intelligence/quality-registry/ag09a-public-experience-gap-register.json",
  "data/content-intelligence/quality-registry/ag09a-public-experience-readiness.json",
  "data/content-intelligence/schema/live-readiness-public-experience-audit.schema.json",
  "data/content-intelligence/learning/ag09a-live-readiness-public-experience-audit-learning.json",
  "data/quality/ag09a-live-readiness-public-experience-audit.json",
  "data/quality/ag09a-live-readiness-public-experience-audit-preview.json",
  "docs/quality/AG09A_LIVE_READINESS_PUBLIC_EXPERIENCE_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG09A validation failed: ${message}`);
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









function ag12cControlledLayoutRefinementAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");
  const r1ApplyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const r1ApplyRecord = fs.existsSync(r1ApplyRecordPath)
      ? JSON.parse(fs.readFileSync(r1ApplyRecordPath, "utf8"))
      : null;

    const targetPath = selectedPath || r1ApplyRecord?.selected_article_path || applyRecord.selected_article_path;
    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;
    if (r1ApplyRecord && r1ApplyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    if (
      r1ApplyRecord &&
      r1ApplyRecord.status === "public_object_label_layout_repair_applied" &&
      r1ApplyRecord.pre_repair_hash === applyRecord.post_refinement_hash &&
      r1ApplyRecord.post_repair_hash === hashToCheck &&
      html.includes("AG12C-R1") &&
      html.includes('data-drishvara-layout-treatment="reader-facing-object"') &&
      !html.includes("Additional pilot object:") &&
      !html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"')
    ) {
      return true;
    }

    return (
      applyRecord.status === "controlled_layout_refinement_applied_pending_post_refinement_audit" &&
      applyRecord.post_refinement_hash === hashToCheck &&
      html.includes("AG12C-LAYOUT-REFINEMENT:START") &&
      html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"')
    );
  } catch {
    return false;
  }
}

function ag11gControlledCompositeInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag12cControlledLayoutRefinementAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json");

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
      applyRecord.status === "article_support_composite_object_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.object_title) &&
      html.includes(applyRecord.visible_credit) &&
      html.includes("AG11G-COMPOSITE-001")
    );
  } catch {
    return false;
  }
}

function ag11fControlledMapInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11gControlledCompositeInsertionAllowsPostMutation(...arguments)) return true;
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

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag08zReview = readJson("data/content-intelligence/quality-reviews/ag08z-repeatable-article-upgrade-cycle-closure.json");
const ag08zReadiness = readJson("data/content-intelligence/quality-registry/ag08z-final-readiness-record.json");
const ag08kApply = readJson("data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json");
const ag08lAudit = readJson("data/content-intelligence/audit-records/ag08l-post-visual-insertion-audit-report.json");

const review = readJson("data/content-intelligence/quality-reviews/ag09a-live-readiness-public-experience-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag09a-live-readiness-public-experience-audit-report.json");
const gaps = readJson("data/content-intelligence/quality-registry/ag09a-public-experience-gap-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag09a-public-experience-readiness.json");
const schema = readJson("data/content-intelligence/schema/live-readiness-public-experience-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag09a-live-readiness-public-experience-audit-learning.json");
const registry = readJson("data/quality/ag09a-live-readiness-public-experience-audit.json");
const preview = readJson("data/quality/ag09a-live-readiness-public-experience-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG09A_LIVE_READINESS_PUBLIC_EXPERIENCE_AUDIT.md"), "utf8");

for (const obj of [review, audit, gaps, readiness, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG09A") fail(`module_id must be AG09A in ${obj.title || "object"}`);
}

if (ag08zReview.status !== "repeatable_article_upgrade_cycle_closed") fail("AG08Z review must be closed");
if (ag08zReadiness.status !== "repeatable_cycle_closed_one_article_text_reference_visual_audited") fail("AG08Z final readiness must be closed");
if (ag08lAudit.status !== "post_visual_insertion_audit_passed") fail("AG08L audit must pass");

const target = ag08kApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const targetHtml = fs.readFileSync(path.join(root, target), "utf8");
const currentHash = sha256(targetHtml);
if (currentHash !== ag08kApply.post_insertion_hash && !ag09cControlledPublicExperienceCorrectionAllowsPostMutation()) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Selected article hash must match AG08K post-insertion hash or AG09C controlled post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");

if (review.status !== "live_readiness_audit_completed") fail("AG09A review status mismatch");
if (audit.status !== "live_readiness_audit_completed") fail("AG09A audit status mismatch");
if (registry.status !== "live_readiness_audit_completed") fail("AG09A registry status mismatch");
if (preview.status !== "live_readiness_audit_completed") fail("AG09A preview status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length < 7) fail("AG09A must record public-experience checks");
if (!audit.checks.some((c) => c.area === "visual_rendering" && c.status === "passed")) fail("Visual rendering check must pass");
if (!audit.checks.some((c) => c.area === "reference_display")) fail("Reference display check missing");
if (!audit.checks.some((c) => c.area === "metadata")) fail("Metadata check missing");
if (!audit.checks.some((c) => c.area === "social_preview")) fail("Social preview check missing");
if (!audit.checks.some((c) => c.area === "homepage_listing")) fail("Homepage/listing check missing");
if (!audit.checks.some((c) => c.area === "layout_mobile")) fail("Layout/mobile check missing");

if (audit.public_experience_readiness !== readiness.status) fail("Readiness status must match audit");
if (readiness.publish_ready !== false) fail("AG09A must not mark publish-ready");
if (readiness.publish_readiness !== "blocked_pending_ag09b_correction_plan_or_editorial_approval") fail("Publish readiness mismatch");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.database_activation_ready !== false) fail("Database activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (gaps.ag09b_handoff.next_stage_id !== "AG09B") fail("AG09B handoff missing");
if (gaps.ag09b_handoff.explicit_approval_required !== true) fail("AG09B must require explicit approval");

if (schema.status !== "schema_audit_only") fail("Schema status mismatch");
if (schema.local_static_audit_allowed_in_ag09a !== true) fail("Local static audit must be allowed");
if (schema.live_url_fetch_allowed_in_ag09a !== false) fail("Live URL fetch must be blocked in AG09A");
if (schema.article_mutation_allowed_in_ag09a !== false) fail("Article mutation must be blocked");
if (schema.homepage_mutation_allowed_in_ag09a !== false) fail("Homepage mutation must be blocked");
if (schema.css_js_mutation_allowed_in_ag09a !== false) fail("CSS/JS mutation must be blocked");
if (schema.publishing_allowed_in_ag09a !== false) fail("Publishing must be blocked");
if (schema.backend_auth_supabase_activation_allowed_in_ag09a !== false) fail("Backend/Auth/Supabase must be blocked");

for (const obj of [review, audit, gaps, readiness, schema, learning, registry, preview]) {
  if (obj.audit_only !== true) fail(`${obj.title || "object"} must be audit-only`);
  if (obj.local_static_audit_only !== true) fail(`${obj.title || "object"} must be local static audit only`);
  if (obj.live_url_fetch_performed_in_ag09a !== false) fail(`${obj.title || "object"} must not fetch live URL`);
  if (obj.article_mutation_performed_in_ag09a !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.homepage_mutation_performed_in_ag09a !== false) fail(`${obj.title || "object"} must not mutate homepage`);
  if (obj.css_mutation_performed_in_ag09a !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag09a !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag09a !== false) fail(`${obj.title || "object"} must not insert references`);
  if (obj.visual_generation_performed_in_ag09a !== false) fail(`${obj.title || "object"} must not generate visual`);
  if (obj.image_insertion_performed_in_ag09a !== false) fail(`${obj.title || "object"} must not insert image`);
  if (obj.production_jsonl_append_performed_in_ag09a !== false) fail(`${obj.title || "object"} must not append JSONL`);
  if (obj.database_write_performed_in_ag09a !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag09a !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag09a !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_performed_in_ag09a !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag09a_audit_completed_pending_ag09b_if_gaps_or_editorial_review") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag09b_only_with_explicit_user_approval !== true) fail("AG09B must require explicit approval");
if (review.closure_decision.publish_approval_granted !== false) fail("Publish approval must not be granted");

for (const scriptName of ["generate:ag09a", "validate:ag09a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag09a")) {
  fail("validate:project must include validate:ag09a");
}

for (const phrase of [
  "Purpose",
  "Scope",
  "Result",
  "Boundary",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG09A document missing phrase: ${phrase}`);
}

pass("AG09A registry is present.");
pass("AG09A document is present.");
pass("AG09A review, audit report, gap register, readiness record, schema, learning record and preview are present.");
pass("AG08Z closure and AG08L visual audit are consumed.");
pass("Selected article hash matches AG08K post-insertion hash.");
pass("Local/static public-experience checks are recorded.");
pass("Hero visual path, alt text, caption and credit check passes.");
pass("Reference, metadata, social-preview, homepage/listing and layout/mobile checks are recorded.");
pass("Public-experience gaps are recorded for AG09B if needed.");
pass("AG09B handoff is created with explicit approval required.");
pass("No article/homepage/CSS/JS mutation, reference insertion, visual generation or image insertion is performed.");
pass("No live URL fetch, JSONL append, database/Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Publish readiness remains blocked pending correction plan or editorial approval.");
pass("AG09A is Live Readiness and Public Experience Audit only.");
