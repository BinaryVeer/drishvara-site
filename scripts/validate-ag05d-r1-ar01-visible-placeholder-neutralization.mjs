import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag05d-r1-ar01-visible-placeholder-neutralization.json");
const docPath = path.join(root, "docs", "quality", "AG05D_R1_AR01_VISIBLE_PLACEHOLDER_NEUTRALIZATION.md");
const resultPath = path.join(root, "data", "quality", "ag05d-r1-ar01-visible-placeholder-neutralization-apply-result.json");
const previewPath = path.join(root, "data", "quality", "ag05d-r1-ar01-visible-placeholder-neutralization-preview.json");
const packagePath = path.join(root, "package.json");

function fail(msg) {
  console.error(`❌ AG05D-R1 validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) { console.log(`✅ ${msg}`); }
function readJson(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }

for (const p of [registryPath, docPath, resultPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing required file: ${p}`);
}

const config = readJson(registryPath);
const result = readJson(resultPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);

if (config.module_id !== "AG05D-R1") fail("Registry module_id must be AG05D-R1");
if (result.module_id !== "AG05D-R1") fail("Result module_id must be AG05D-R1");
if (preview.module_id !== "AG05D-R1") fail("Preview module_id must be AG05D-R1");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (result.summary.processed_article_count !== config.expected.processed_article_count) fail("Must process 72 articles");
if (result.summary.modified_article_count < 1) fail("At least one article must be modified");
if (result.summary.articles_with_two_ag03_links_after !== config.expected.processed_article_count) fail("All articles must retain two AG03 links");
if (result.summary.articles_with_reference_urls_unchanged !== config.expected.processed_article_count) fail("All reference URLs must remain unchanged");
if (result.summary.articles_with_one_ag05d_visible_block_after !== config.expected.processed_article_count) fail("All articles must retain one AG05D visible block");
if (result.summary.articles_with_zero_visible_ar01_placeholder_after !== config.expected.processed_article_count) fail("All visible AR01 placeholders must be neutralized");
if (result.summary.total_visible_ar01_placeholders_after !== 0) fail("Visible AR01 placeholder count after must be zero");
if (result.summary.reference_url_change_performed !== false) fail("Reference URL change must be false");
if (result.summary.css_mutation_performed !== false) fail("CSS mutation must be false");
if (result.summary.javascript_mutation_performed !== false) fail("JavaScript mutation must be false");
if (result.summary.backend_auth_supabase_activation_performed !== false) fail("Backend/Auth/Supabase activation must be false");
if (result.summary.ready_for_ag05e_r1_post_repair_audit !== true) fail("AG05E-R1 must be identified as next");

for (const row of result.file_results) {
  if (row.status !== "processed") continue;
  if (row.after_ag03_reference_link_count !== 2) fail(`AG03 link count drift: ${row.article_path}`);
  if (row.reference_urls_unchanged !== true) fail(`URLs changed: ${row.article_path}`);
  if (row.after_ag05d_visible_block_count !== 1) fail(`AG05D block count invalid: ${row.article_path}`);
  if (row.after_visible_ar01_placeholder_count !== 0) fail(`Visible AR01 placeholder remains: ${row.article_path}`);
}

for (const falseField of [
  "homepage_mutation_performed",
  "css_mutation_performed",
  "javascript_mutation_performed",
  "reference_url_change_performed",
  "external_fetch_performed_by_script",
  "live_url_fetch_performed",
  "backend_activation_performed",
  "api_route_created",
  "supabase_enabled",
  "auth_enabled",
  "frontend_deployment_performed",
  "file_deletion_performed",
  "file_move_performed"
]) {
  if (result[falseField] !== false) fail(`${falseField} must be false`);
}

if (config.article_html_mutation_enabled !== true) fail("Targeted article HTML mutation must be enabled for AG05D-R1");
for (const flag of [
  "homepage_mutation_enabled",
  "css_mutation_enabled",
  "javascript_mutation_enabled",
  "reference_url_change_enabled",
  "external_fetch_enabled_by_script",
  "live_url_fetch_enabled",
  "backend_activation_enabled",
  "supabase_enabled",
  "auth_enabled",
  "frontend_deployment_enabled",
  "file_deletion_enabled",
  "file_move_enabled"
]) {
  if (config[flag] !== false) fail(`${flag} must remain false`);
}

for (const scriptName of ["apply:ag05d-r1", "validate:ag05d-r1", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

pass("AG05D-R1 registry is present.");
pass("AG05D-R1 document is present.");
pass("AG05D-R1 apply result and preview are present.");
pass("All 72 processed articles retain two AG03 links.");
pass("All reference URLs remain unchanged.");
pass("All articles retain one AG05D visible block.");
pass("Visible AR01 placeholder reference elements are neutralized.");
pass("No CSS/JS/homepage/backend/Auth/Supabase mutation is performed.");
pass("AG05E-R1 post-repair audit is identified as next.");
