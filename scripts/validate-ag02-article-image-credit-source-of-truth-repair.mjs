import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag02-article-image-credit-source-of-truth-repair.json");
const docPath = path.join(root, "docs", "quality", "AG02_ARTICLE_IMAGE_CREDIT_SOURCE_OF_TRUTH_REPAIR.md");
const ag01AuditPath = path.join(root, "data", "editorial", "ag01-article-governance-source-of-truth-audit.json");
const sourceTruthPath = path.join(root, "data", "editorial", "ag02-article-image-credit-source-of-truth-registry.json");
const applyPath = path.join(root, "data", "quality", "ag02-article-image-credit-source-of-truth-apply-result.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG02 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const requiredPath of [registryPath, docPath, ag01AuditPath, sourceTruthPath, applyPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing AG02 required artifact/dependency: ${requiredPath}`);
}

const registry = readJson(registryPath);
const ag01 = readJson(ag01AuditPath);
const sourceTruth = readJson(sourceTruthPath);
const apply = readJson(applyPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AG02") fail("Registry module_id must be AG02");
if (sourceTruth.module_id !== "AG02") fail("Source-of-truth registry module_id must be AG02");
if (apply.module_id !== "AG02") fail("Apply result module_id must be AG02");

const expectedTargets = ag01.issue_buckets.needs_image_or_credit_repair.length;
if (apply.summary.ag01_image_credit_issue_bucket_count !== expectedTargets) fail("AG02 must consume AG01 image/credit issue bucket count");
if (apply.summary.targeted_article_count !== expectedTargets) fail("AG02 target count must match AG01 image/credit issue bucket");
if (sourceTruth.targeted_article_count !== expectedTargets) fail("AG02 source-truth registry count must match AG01 target count");

if (!apply.summary.fallback_assets_exist) fail("Fallback assets must exist");
if (!apply.summary.every_target_has_ag02_hero) fail("Every AG01-targeted article must have AG02 hero visual");
if (!apply.summary.every_target_has_ag02_credit) fail("Every AG01-targeted article must have AG02 image credit");
if (!apply.summary.every_target_has_checked_marker) fail("Every AG01-targeted article must have AG02 checked marker");
if (!apply.summary.every_target_preserves_reference_urls) fail("AG02 must preserve reference URLs");
if (!apply.summary.ar02c_sample_references_preserved) fail("AR02C sample references must be preserved");
if (apply.summary.reference_url_change_performed !== false) fail("Reference URL change must remain false");

for (const row of apply.file_results) {
  const htmlPath = path.join(root, row.article_path);
  if (!fs.existsSync(htmlPath)) fail(`Missing targeted article: ${row.article_path}`);
  const html = fs.readFileSync(htmlPath, "utf8");

  if (!html.includes('data-drishvara-ag02-hero-visual="true"')) {
    fail(`Article missing AG02 hero: ${row.article_path}`);
  }
  if (!html.includes('data-drishvara-ag02-image-credit="true"')) {
    fail(`Article missing AG02 image credit: ${row.article_path}`);
  }
  if (!html.includes('data-drishvara-ag02-checked="true"')) {
    fail(`Article missing AG02 checked marker: ${row.article_path}`);
  }
}

for (const rel of Object.values(registry.category_fallback_assets)) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) fail(`Missing category fallback asset: ${rel}`);
  const text = fs.readFileSync(full, "utf8");
  if (!text.startsWith("<svg")) fail(`Fallback asset must be SVG: ${rel}`);
  if (text.includes("Media & Society")) fail(`Fallback SVG must not contain unescaped ampersand: ${rel}`);
}

for (const flag of [
  "article_text_mutation_enabled",
  "article_word_count_reduction_enabled",
  "article_word_count_expansion_enabled",
  "reference_url_change_enabled",
  "new_reference_insertion_enabled",
  "external_fetch_enabled",
  "external_asset_fetch_enabled",
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "backend_activation_enabled",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "credential_collection_enabled",
  "payment_enabled",
  "admin_ui_enabled",
  "subscriber_output_enabled",
  "public_dynamic_output_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled",
  "file_deletion_enabled",
  "file_move_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false`);
}

for (const falseField of [
  "non_ag01_target_mutation_performed",
  "article_text_mutation_performed",
  "article_word_count_reduction_performed",
  "article_word_count_expansion_performed",
  "reference_url_change_performed",
  "new_reference_insertion_performed",
  "external_fetch_performed",
  "external_asset_fetch_performed",
  "backend_activation_performed",
  "api_route_created",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "frontend_deployment_performed",
  "file_deletion_performed",
  "file_move_performed"
]) {
  if (apply.summary[falseField] !== false) fail(`Apply summary ${falseField} must be false`);
}

for (const scriptName of ["apply:ag02", "validate:ag02", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Source-of-Truth Rule", "Category Fallback Rule", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG02 document missing phrase: ${phrase}`);
}

pass("AG02 registry is present.");
pass("AG02 document is present.");
pass("AG02 source-of-truth registry and apply result are present.");
pass("AG02 consumed exactly the AG01 image/credit issue bucket.");
pass("Every targeted article has AG02 hero visual and AG02 image credit.");
pass("Category fallback SVG assets are valid.");
pass("AR02C sample verified references are preserved.");
pass("Reference URLs are not changed.");
pass("Article text/word-count logic is not changed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG02 is image/credit source-of-truth repair and safe to commit.");
