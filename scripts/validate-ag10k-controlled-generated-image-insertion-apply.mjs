import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag10j-controlled-generated-image-asset-creation-source-finalisation.json",
  "data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json",
  "data/content-intelligence/quality-registry/ag10j-generated-image-source-finalisation-record.json",
  "data/content-intelligence/quality-registry/ag10j-generated-image-rights-provenance-clearance-record.json",
  "data/content-intelligence/quality-registry/ag10j-generated-image-cost-reuse-record.json",
  "data/content-intelligence/quality-registry/ag10j-generated-image-asset-readiness.json",
  "data/content-intelligence/mutation-plans/ag10j-to-ag10k-controlled-generated-image-insertion-boundary.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",

  "data/content-intelligence/quality-reviews/ag10k-controlled-generated-image-insertion-apply.json",
  "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json",
  "data/content-intelligence/quality-registry/ag10k-post-generated-image-insertion-audit-prep.json",
  "data/content-intelligence/quality-registry/ag10k-layout-preservation-record.json",
  "data/content-intelligence/quality-registry/ag10k-rollback-readiness-record.json",
  "data/content-intelligence/schema/controlled-generated-image-insertion-apply.schema.json",
  "data/content-intelligence/learning/ag10k-controlled-generated-image-insertion-apply-learning.json",
  "data/quality/ag10k-controlled-generated-image-insertion-apply.json",
  "data/quality/ag10k-controlled-generated-image-insertion-apply-preview.json",
  "docs/quality/AG10K_CONTROLLED_GENERATED_IMAGE_INSERTION_APPLY.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG10K validation failed: ${message}`);
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

function count(text, marker) {
  return (text.match(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag10jReview = readJson("data/content-intelligence/quality-reviews/ag10j-controlled-generated-image-asset-creation-source-finalisation.json");
const ag10jAsset = readJson("data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json");
const ag10jReadiness = readJson("data/content-intelligence/quality-registry/ag10j-generated-image-asset-readiness.json");
const ag10jBoundary = readJson("data/content-intelligence/mutation-plans/ag10j-to-ag10k-controlled-generated-image-insertion-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag10k-controlled-generated-image-insertion-apply.json");
const applyRecord = readJson("data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json");
const auditPrep = readJson("data/content-intelligence/quality-registry/ag10k-post-generated-image-insertion-audit-prep.json");
const layoutRecord = readJson("data/content-intelligence/quality-registry/ag10k-layout-preservation-record.json");
const rollbackRecord = readJson("data/content-intelligence/quality-registry/ag10k-rollback-readiness-record.json");
const schema = readJson("data/content-intelligence/schema/controlled-generated-image-insertion-apply.schema.json");
const learning = readJson("data/content-intelligence/learning/ag10k-controlled-generated-image-insertion-apply-learning.json");
const registry = readJson("data/quality/ag10k-controlled-generated-image-insertion-apply.json");
const preview = readJson("data/quality/ag10k-controlled-generated-image-insertion-apply-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG10K_CONTROLLED_GENERATED_IMAGE_INSERTION_APPLY.md"), "utf8");

for (const obj of [review, applyRecord, auditPrep, layoutRecord, rollbackRecord, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG10K") fail(`module_id must be AG10K in ${obj.title || "object"}`);
}

if (ag10jReview.status !== "controlled_generated_image_asset_created_source_finalised_not_inserted") fail("AG10J review status mismatch");
if (ag10jReadiness.ready_for_ag10k !== true) fail("AG10J readiness for AG10K missing");
if (ag10jBoundary.next_stage_id !== "AG10K") fail("AG10K boundary missing in AG10J");
if (ag10jAsset.placement_status !== "not_inserted") fail("AG10J asset must have been not inserted before AG10K");

if (review.status !== "generated_image_inserted_pending_post_insertion_audit") fail("Review status mismatch");
if (applyRecord.status !== "generated_image_inserted_pending_post_insertion_audit") fail("Apply record status mismatch");
if (registry.status !== "generated_image_inserted_pending_post_insertion_audit") fail("Registry status mismatch");
if (preview.status !== "generated_image_inserted_pending_post_insertion_audit") fail("Preview status mismatch");

const articlePath = applyRecord.selected_article_path;
const fullArticlePath = path.join(root, articlePath);
if (!fs.existsSync(fullArticlePath)) fail(`Selected article missing: ${articlePath}`);

const articleHtml = fs.readFileSync(fullArticlePath, "utf8");
const currentHash = sha256(articleHtml);
if (currentHash !== applyRecord.post_insertion_hash) fail("Current article hash must match AG10K post-insertion hash");

const backupPath = applyRecord.backup_path;
if (!fs.existsSync(path.join(root, backupPath))) fail(`AG10K backup missing: ${backupPath}`);

const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");
const backupHash = sha256(backupHtml);
if (backupHash !== applyRecord.pre_insertion_hash) fail("Backup hash must match AG10K pre-insertion hash");
if (backupHtml.includes(applyRecord.insertion_marker_start)) fail("Backup must not contain AG10K insertion marker");

if (applyRecord.pre_insertion_hash === applyRecord.post_insertion_hash) fail("Pre and post hashes must differ after insertion");

if (count(articleHtml, applyRecord.insertion_marker_start) !== 1) fail("AG10K start marker count must be exactly one");
if (count(articleHtml, applyRecord.insertion_marker_end) !== 1) fail("AG10K end marker count must be exactly one");

if (!articleHtml.includes(applyRecord.asset_src_in_article)) fail("Article must include inserted asset src");
if (!articleHtml.includes(applyRecord.caption)) fail("Article must include AG10K caption");
if (!articleHtml.includes(applyRecord.visible_credit)) fail("Article must include AG10K visible credit");
if (!articleHtml.includes(applyRecord.alt_text)) fail("Article must include AG10K alt text");
if (!articleHtml.includes('data-drishvara-stage="AG10K"')) fail("Article must include AG10K data stage marker");

const assetPath = applyRecord.asset_path;
if (!fs.existsSync(path.join(root, assetPath))) fail(`AG10K asset missing: ${assetPath}`);
const assetHash = sha256(fs.readFileSync(path.join(root, assetPath), "utf8"));
if (assetHash !== applyRecord.asset_hash_sha256) fail("Asset hash mismatch in apply record");
if (assetHash !== ag10jAsset.asset_hash_sha256) fail("Asset hash mismatch against AG10J asset record");

if (layoutRecord.status !== "layout_preservation_record_created_pending_audit") fail("Layout record status mismatch");
if (!layoutRecord.layout_rules_applied.some((rule) => rule.includes("Existing hero visual remains untouched"))) fail("Hero preservation rule missing");
if (!layoutRecord.layout_rules_applied.some((rule) => rule.includes("Central placement"))) fail("Central placement rule missing");
if (!layoutRecord.mobile_safety_precheck.responsive_img_width) fail("Responsive image precheck missing");

if (rollbackRecord.status !== "rollback_ready_for_ag10k_insertion") fail("Rollback record status mismatch");
if (rollbackRecord.backup_path !== backupPath) fail("Rollback backup path mismatch");
if (rollbackRecord.backup_hash !== applyRecord.pre_insertion_hash) fail("Rollback backup hash mismatch");
if (rollbackRecord.rollback_execution_performed !== false) fail("Rollback execution must remain false");

if (auditPrep.status !== "post_generated_image_insertion_audit_prep_created") fail("Audit prep status mismatch");
if (auditPrep.next_stage_id !== "AG10L") fail("AG10L handoff missing");
if (auditPrep.explicit_approval_required !== true) fail("AG10L must require explicit approval");

if (schema.status !== "schema_controlled_generated_image_insertion_apply_only") fail("Schema status mismatch");
for (const key of [
  "backup_creation_allowed_in_ag10k",
  "selected_article_mutation_allowed_in_ag10k",
  "object_insertion_allowed_in_ag10k",
  "approved_ag10j_asset_insertion_allowed_in_ag10k",
  "apply_record_allowed_in_ag10k",
  "post_insertion_audit_prep_allowed_in_ag10k"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "image_generation_allowed_in_ag10k",
  "external_image_api_call_allowed_in_ag10k",
  "image_asset_creation_allowed_in_ag10k",
  "new_asset_creation_allowed_in_ag10k",
  "reference_insertion_allowed_in_ag10k",
  "reference_url_change_allowed_in_ag10k",
  "homepage_mutation_allowed_in_ag10k",
  "css_file_mutation_allowed_in_ag10k",
  "js_file_mutation_allowed_in_ag10k",
  "backend_auth_supabase_activation_allowed_in_ag10k",
  "public_publishing_operation_allowed_in_ag10k"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, applyRecord, auditPrep, layoutRecord, rollbackRecord, schema, learning, registry, preview]) {
  if (obj.controlled_generated_image_insertion_apply_only !== true) fail(`${obj.title || "object"} must be AG10K-only`);
  if (obj.backup_created_in_ag10k !== true) fail(`${obj.title || "object"} must record backup created`);
  if (obj.object_insertion_performed_in_ag10k !== true) fail(`${obj.title || "object"} must record object insertion`);
  if (obj.article_mutation_performed_in_ag10k !== true) fail(`${obj.title || "object"} must record selected article mutation`);
  if (obj.image_generation_performed_in_ag10k !== false) fail(`${obj.title || "object"} must not generate image`);
  if (obj.external_image_api_call_performed_in_ag10k !== false) fail(`${obj.title || "object"} must not call external image API`);
  if (obj.image_asset_creation_performed_in_ag10k !== false) fail(`${obj.title || "object"} must not create image asset`);
  if (obj.new_asset_creation_performed_in_ag10k !== false) fail(`${obj.title || "object"} must not create new asset`);
  if (obj.reference_url_change_performed_in_ag10k !== false) fail(`${obj.title || "object"} must not change reference URL`);
  if (obj.homepage_mutation_performed_in_ag10k !== false) fail(`${obj.title || "object"} must not mutate homepage`);
  if (obj.css_file_mutation_performed_in_ag10k !== false) fail(`${obj.title || "object"} must not mutate CSS file`);
  if (obj.js_file_mutation_performed_in_ag10k !== false) fail(`${obj.title || "object"} must not mutate JS file`);
  if (obj.database_write_performed_in_ag10k !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag10k !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag10k !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag10k !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Inserted Asset", "Backup", "Boundaries", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG10K document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag10k", "validate:ag10k"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag10k")) {
  fail("validate:project must include validate:ag10k");
}

pass("AG10K registry is present.");
pass("AG10K document is present.");
pass("AG10K review, apply record, audit prep, layout preservation, rollback readiness, schema, learning record and preview are present.");
pass("AG10J finalised asset and readiness are consumed.");
pass("Fresh pre-insertion backup exists and has no AG10K marker.");
pass("Exactly one selected article is mutated with one AG10K generated image marker.");
pass("Approved AG10J SVG asset is inserted with alt text, caption and visible credit.");
pass("Article hash changed from pre-insertion to post-insertion.");
pass("Layout preservation record confirms hero preservation, central placement and mobile precheck.");
pass("Rollback readiness is confirmed.");
pass("No image generation, new asset creation, reference change, homepage mutation, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG10L Post Generated Image Insertion Audit is identified as next only with explicit approval.");
pass("AG10K is Controlled Generated Image Article Insertion Apply only.");
