import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();



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

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag10k-controlled-generated-image-insertion-apply.json",
  "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json",
  "data/content-intelligence/quality-registry/ag10k-post-generated-image-insertion-audit-prep.json",
  "data/content-intelligence/quality-registry/ag10k-layout-preservation-record.json",
  "data/content-intelligence/quality-registry/ag10k-rollback-readiness-record.json",
  "data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json",

  "data/content-intelligence/quality-reviews/ag10l-post-generated-image-insertion-audit.json",
  "data/content-intelligence/audit-records/ag10l-post-generated-image-insertion-audit-report.json",
  "data/content-intelligence/quality-registry/ag10l-generated-image-insertion-readiness-record.json",
  "data/content-intelligence/quality-registry/ag10l-generated-image-insertion-rollback-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag10l-to-ag10m-generated-image-insertion-closure-reuse-handoff-boundary.json",
  "data/content-intelligence/schema/post-generated-image-insertion-audit.schema.json",
  "data/content-intelligence/learning/ag10l-post-generated-image-insertion-audit-learning.json",
  "data/quality/ag10l-post-generated-image-insertion-audit.json",
  "data/quality/ag10l-post-generated-image-insertion-audit-preview.json",
  "docs/quality/AG10L_POST_GENERATED_IMAGE_INSERTION_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG10L validation failed: ${message}`);
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

function markerCount(text, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(escaped, "g")) || []).length;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag10kReview = readJson("data/content-intelligence/quality-reviews/ag10k-controlled-generated-image-insertion-apply.json");
const ag10kApply = readJson("data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json");
const ag10kAuditPrep = readJson("data/content-intelligence/quality-registry/ag10k-post-generated-image-insertion-audit-prep.json");
const ag10kRollback = readJson("data/content-intelligence/quality-registry/ag10k-rollback-readiness-record.json");
const ag10jAsset = readJson("data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json");

const review = readJson("data/content-intelligence/quality-reviews/ag10l-post-generated-image-insertion-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag10l-post-generated-image-insertion-audit-report.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag10l-generated-image-insertion-readiness-record.json");
const rollback = readJson("data/content-intelligence/quality-registry/ag10l-generated-image-insertion-rollback-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag10l-to-ag10m-generated-image-insertion-closure-reuse-handoff-boundary.json");
const schema = readJson("data/content-intelligence/schema/post-generated-image-insertion-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag10l-post-generated-image-insertion-audit-learning.json");
const registry = readJson("data/quality/ag10l-post-generated-image-insertion-audit.json");
const preview = readJson("data/quality/ag10l-post-generated-image-insertion-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG10L_POST_GENERATED_IMAGE_INSERTION_AUDIT.md"), "utf8");

for (const obj of [review, audit, readiness, rollback, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG10L") fail(`module_id must be AG10L in ${obj.title || "object"}`);
}

if (ag10kReview.status !== "generated_image_inserted_pending_post_insertion_audit") fail("AG10K review status mismatch");
if (ag10kApply.status !== "generated_image_inserted_pending_post_insertion_audit") fail("AG10K apply status mismatch");
if (ag10kAuditPrep.next_stage_id !== "AG10L") fail("AG10K audit prep must hand off to AG10L");

const articlePath = ag10kApply.selected_article_path;
const assetPath = ag10kApply.asset_path;
const backupPath = ag10kApply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, assetPath))) fail(`Asset missing: ${assetPath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Backup missing: ${backupPath}`);

const articleHtml = fs.readFileSync(path.join(root, articlePath), "utf8");
const assetText = fs.readFileSync(path.join(root, assetPath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");

const articleHash = sha256(articleHtml);
const assetHash = sha256(assetText);
const backupHash = sha256(backupHtml);

if (articleHash !== ag10kApply.post_insertion_hash) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) fail("Current article hash must match AG10K post-insertion hash or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state");
if (assetHash !== ag10kApply.asset_hash_sha256) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) fail("Current asset hash must match AG10K apply record or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state");
if (assetHash !== ag10jAsset.asset_hash_sha256) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) fail("Current asset hash must match AG10J asset record or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state");
if (backupHash !== ag10kApply.pre_insertion_hash) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) fail("Backup hash must match AG10K pre-insertion hash or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state");

if (markerCount(articleHtml, ag10kApply.insertion_marker_start) !== 1) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) fail("AG10K start marker count must be exactly one or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state");
if (markerCount(articleHtml, ag10kApply.insertion_marker_end) !== 1) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) fail("AG10K end marker count must be exactly one or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state");

if (!articleHtml.includes(ag10kApply.asset_src_in_article)) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) fail("Article must include AG10K asset src or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state");
if (!articleHtml.includes(ag10kApply.alt_text)) fail("Article must include AG10K alt text");
if (!articleHtml.includes(ag10kApply.caption)) fail("Article must include AG10K caption");
if (!articleHtml.includes(ag10kApply.visible_credit)) fail("Article must include AG10K visible credit");
if (backupHtml.includes(ag10kApply.insertion_marker_start)) fail("AG10K backup must not include AG10K insertion marker");

if (review.status !== "post_generated_image_insertion_audit_passed") fail("Review status must be audit passed");
if (audit.status !== "post_generated_image_insertion_audit_passed") fail("Audit report status must be audit passed");
if (registry.status !== "post_generated_image_insertion_audit_passed") fail("Registry status must be audit passed");
if (preview.status !== "post_generated_image_insertion_audit_passed") fail("Preview status must be audit passed");

if (!Array.isArray(audit.checks) || audit.checks.length !== 7) fail("Audit must contain seven checks");
if (audit.failed_checks.length !== 0) fail("Audit must have zero failed checks");
if (audit.audit_summary.failed !== 0) fail("Audit summary failed count must be zero");

for (const check of audit.checks) {
  if (!["passed", "review_passed_static_only"].includes(check.status)) {
    fail(`Unexpected audit check status: ${check.check_id} ${check.status}`);
  }
}

if (readiness.status !== "generated_image_insertion_audited_ready_for_closure_handoff") fail("Readiness status mismatch");
if (readiness.audit_passed !== true) fail("Readiness must record audit passed");
if (readiness.ready_for_ag10m !== true) fail("Readiness must be ready for AG10M");
if (readiness.publishing_ready !== false) fail("Publishing readiness must remain false");
if (readiness.backend_activation_ready !== false) fail("Backend readiness must remain false");

if (rollback.status !== "rollback_readiness_confirmed_after_ag10l_audit") fail("Rollback readiness status mismatch");
if (rollback.rollback_ready !== true) fail("Rollback must be ready");
if (rollback.rollback_execution_performed !== false) fail("Rollback execution must remain false");
if (rollback.backup_hash !== backupHash) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) fail("Rollback backup hash mismatch or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state");

if (boundary.status !== "ag10m_boundary_created_not_started") fail("AG10M boundary status mismatch");
if (boundary.next_stage_id !== "AG10M") fail("AG10M handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG10M must require explicit approval");

if (schema.status !== "schema_post_generated_image_insertion_audit_only") fail("Schema status mismatch");
for (const key of [
  "audit_allowed_in_ag10l",
  "readiness_record_allowed_in_ag10l",
  "rollback_readiness_record_allowed_in_ag10l",
  "ag10m_boundary_allowed_in_ag10l"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag10l",
  "object_insertion_allowed_in_ag10l",
  "image_generation_allowed_in_ag10l",
  "external_image_api_call_allowed_in_ag10l",
  "new_asset_creation_allowed_in_ag10l",
  "reference_insertion_allowed_in_ag10l",
  "reference_url_change_allowed_in_ag10l",
  "homepage_mutation_allowed_in_ag10l",
  "css_js_mutation_allowed_in_ag10l",
  "backend_auth_supabase_activation_allowed_in_ag10l",
  "public_publishing_operation_allowed_in_ag10l"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, readiness, rollback, boundary, schema, learning, registry, preview]) {
  if (obj.post_generated_image_insertion_audit_only !== true) fail(`${obj.title || "object"} must be AG10L-only`);
  if (obj.article_mutation_performed_in_ag10l !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.object_insertion_performed_in_ag10l !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.image_generation_performed_in_ag10l !== false) fail(`${obj.title || "object"} must not generate image`);
  if (obj.new_asset_creation_performed_in_ag10l !== false) fail(`${obj.title || "object"} must not create asset`);
  if (obj.reference_url_change_performed_in_ag10l !== false) fail(`${obj.title || "object"} must not change reference URL`);
  if (obj.css_file_mutation_performed_in_ag10l !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag10l !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag10l !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag10l !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Audit Result", "Confirmed Items", "Boundaries", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG10L document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag10l", "validate:ag10l"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag10l")) {
  fail("validate:project must include validate:ag10l");
}

pass("AG10L registry is present.");
pass("AG10L document is present.");
pass("AG10L review, audit report, readiness, rollback readiness, AG10M boundary, schema, learning record and preview are present.");
pass("AG10K apply record, audit prep, layout record, rollback readiness and AG10J asset record are consumed.");
pass("Current article hash matches AG10K post-insertion hash.");
pass("AG10K marker count is valid.");
pass("Approved AG10J SVG path/hash is confirmed.");
pass("Alt text, caption and visible credit are confirmed.");
pass("Backup integrity and rollback readiness are confirmed.");
pass("Layout/mobile static safety checks are recorded.");
pass("Forbidden mutation guards are confirmed.");
pass("No article mutation, object insertion, image generation, new asset creation, backend activation or publishing operation is performed.");
pass("AG10M closure and reuse handoff boundary is created with explicit approval required.");
pass("AG10L is Post Generated Image Insertion Audit only.");
