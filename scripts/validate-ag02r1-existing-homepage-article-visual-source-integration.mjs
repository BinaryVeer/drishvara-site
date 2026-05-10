import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag02r1-existing-homepage-article-visual-source-integration.json");
const docPath = path.join(root, "docs", "quality", "AG02R1_EXISTING_HOMEPAGE_ARTICLE_VISUAL_SOURCE_INTEGRATION.md");
const sourceMapPath = path.join(root, "data", "editorial", "ag02r1-existing-homepage-article-visual-source-map.json");
const applyPath = path.join(root, "data", "quality", "ag02r1-existing-homepage-article-visual-source-integration-apply-result.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG02R1 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, sourceMapPath, applyPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG02R1 required file: ${p}`);
}

const registry = readJson(registryPath);
const sourceMap = readJson(sourceMapPath);
const apply = readJson(applyPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AG02R1") fail("Registry module_id must be AG02R1");
if (sourceMap.module_id !== "AG02R1") fail("Source map module_id must be AG02R1");
if (apply.module_id !== "AG02R1") fail("Apply result module_id must be AG02R1");

if (apply.summary.ag02_target_count < 1) fail("AG02R1 must inspect AG02 targets");

if (sourceMap.mapping_rule !== "strict_static_homepage_article_href_required") {
  fail("Static homepage href mapping rule must be recorded");
}

if (apply.summary.homepage_ag02_target_overlap_count !== 0) {
  fail("If homepage AG02 target overlaps exist, AG02R1 should map/apply visuals instead of closing as not applicable");
}

if (apply.summary.mapping_not_applicable_no_static_homepage_article_hrefs !== true) {
  fail("AG02R1 must record not-applicable status when no static homepage article hrefs overlap AG02 targets");
}

if (apply.summary.homepage_visual_mapped_count !== 0) fail("Mapped count must be zero in diagnostic closure");
if (apply.summary.homepage_visual_applied_count !== 0) fail("Applied count must be zero in diagnostic closure");
if (apply.summary.fallback_retained_count !== apply.summary.ag02_target_count) fail("All AG02 fallback visuals must be retained");

if (!apply.summary.every_target_has_ag02_hero) fail("Every target must retain AG02 hero");
if (!apply.summary.every_target_has_ag02_credit) fail("Every target must retain AG02 credit");
if (!apply.summary.ar02c_sample_references_preserved) fail("AR02C sample references must be preserved");
if (apply.summary.reference_url_change_performed !== false) fail("Reference URLs must not change");

for (const row of apply.file_results) {
  const htmlPath = path.join(root, row.article_path);
  if (!fs.existsSync(htmlPath)) fail(`Missing processed article: ${row.article_path}`);
  const html = fs.readFileSync(htmlPath, "utf8");

  if (!html.includes('data-drishvara-ag02-hero-visual="true"')) {
    fail(`AG02 hero missing after AG02R1 diagnostic closure: ${row.article_path}`);
  }

  if (!html.includes('data-drishvara-ag02-image-credit="true"')) {
    fail(`AG02 image credit missing after AG02R1 diagnostic closure: ${row.article_path}`);
  }

  if (html.includes('data-drishvara-ag02r1-homepage-visual="true"')) {
    fail(`AG02R1 homepage visual marker must not remain when mapping is not applicable: ${row.article_path}`);
  }
}

for (const falseField of [
  "reference_url_change_performed",
  "article_text_mutation_performed",
  "article_word_count_reduction_performed",
  "article_word_count_expansion_performed",
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
  if (apply.summary[falseField] !== false) fail(`${falseField} must remain false`);
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

for (const scriptName of ["apply:ag02r1", "validate:ag02r1", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Strict Mapping Rule", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG02R1 document missing phrase: ${phrase}`);
}

pass("AG02R1 registry is present.");
pass("AG02R1 document is present.");
pass("AG02R1 source map and apply result are present.");
pass("No static homepage article hrefs overlap AG02 targets, so homepage visual integration is not applicable.");
pass("AG02 category fallback visuals are retained.");
pass("AG02 hero and image-credit records remain present.");
pass("AR02C sample verified references are preserved.");
pass("Reference URLs and article text/word-count logic are not changed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG02R1 diagnostic closure is safe to commit.");
