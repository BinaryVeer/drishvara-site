import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag05d-targeted-visible-reference-placement-repair.json");
const docPath = path.join(root, "docs", "quality", "AG05D_TARGETED_VISIBLE_REFERENCE_PLACEMENT_REPAIR.md");
const resultPath = path.join(root, "data", "quality", "ag05d-targeted-visible-reference-placement-repair-apply-result.json");
const previewPath = path.join(root, "data", "quality", "ag05d-targeted-visible-reference-placement-repair-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG05D validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, resultPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG05D required file: ${p}`);
}

const config = readJson(registryPath);
const result = readJson(resultPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG05D") fail("Registry module_id must be AG05D");
if (result.module_id !== "AG05D") fail("Apply result module_id must be AG05D");
if (preview.module_id !== "AG05D") fail("Preview module_id must be AG05D");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (result.summary.modified_article_count < config.expected.minimum_repaired_article_count) {
  fail("At least one article must be repaired");
}
if (result.summary.processed_article_count <= 0) fail("At least one AG03 article must be processed");
if (result.summary.articles_with_two_ag03_links_after !== result.summary.processed_article_count) {
  fail("Every processed article must retain exactly two AG03 links");
}
if (result.summary.articles_with_reference_urls_unchanged !== result.summary.processed_article_count) {
  fail("Every processed article must preserve AG03 reference URLs exactly");
}
if (result.summary.articles_with_placeholder_sections_after_zero !== result.summary.processed_article_count) {
  fail("Placeholder reference sections must be removed from processed articles");
}
if (result.summary.articles_with_visible_ag05d_block !== result.summary.processed_article_count) {
  fail("Every processed article must have one visible AG05D reference block");
}
if (result.summary.articles_with_ag03_before_back_links !== result.summary.processed_article_count) {
  fail("AG03 references must appear before Back/Home footer links where present");
}
if (result.summary.reference_url_change_performed !== false) fail("Reference URL change must be false");
if (result.summary.css_mutation_performed !== false) fail("CSS mutation must be false");
if (result.summary.javascript_mutation_performed !== false) fail("JavaScript mutation must be false");
if (result.summary.backend_auth_supabase_activation_performed !== false) fail("Backend/Auth/Supabase activation must be false");
if (result.summary.ready_for_ag05e_post_repair_audit !== true) fail("AG05E must be identified as next");

for (const row of result.file_results.filter((item) => item.status === "processed")) {
  if (row.after_ag03_reference_link_count !== 2) fail(`AG03 link count drift: ${row.article_path}`);
  if (row.reference_urls_unchanged !== true) fail(`Reference URLs changed: ${row.article_path}`);
  if (row.after_placeholder_section_count !== 0) fail(`Placeholder section remains: ${row.article_path}`);
  if (row.after_ag05d_visible_reference_block_count !== 1) fail(`Visible AG05D block count invalid: ${row.article_path}`);
  if (row.after_ag03_before_back_links !== true) fail(`AG03 references not before back links: ${row.article_path}`);
}

if (result.reference_url_change_performed !== false) fail("Top-level reference_url_change_performed must be false");
if (result.css_mutation_performed !== false) fail("Top-level css_mutation_performed must be false");
if (result.javascript_mutation_performed !== false) fail("Top-level javascript_mutation_performed must be false");
if (result.backend_activation_performed !== false) fail("Backend activation must be false");
if (result.supabase_enabled !== false) fail("Supabase must be false");
if (result.auth_enabled !== false) fail("Auth must be false");
if (result.real_login_enabled !== false) fail("Real login must be false");
if (result.real_signup_enabled !== false) fail("Real signup must be false");
if (result.file_deletion_performed !== false) fail("File deletion must be false");
if (result.file_move_performed !== false) fail("File move must be false");

for (const flag of [
  "homepage_mutation_enabled",
  "css_mutation_enabled",
  "javascript_mutation_enabled",
  "favicon_mutation_enabled",
  "navigation_mutation_enabled",
  "reference_url_change_enabled",
  "external_fetch_enabled_by_script",
  "live_url_fetch_enabled",
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
  if (config[flag] !== false) fail(`${flag} must remain false`);
}

if (config.article_html_mutation_enabled !== true) fail("AG05D must allow targeted article HTML mutation only");

for (const scriptName of ["apply:ag05d", "validate:ag05d", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG05D document missing phrase: ${phrase}`);
}

pass("AG05D registry is present.");
pass("AG05D document is present.");
pass("AG05D apply result and preview outputs are present.");
pass("At least one verified-reference article is repaired.");
pass("Every processed article retains exactly two AG03 reference links.");
pass("Existing AG03 reference URLs are unchanged.");
pass("Obsolete visible placeholder reference sections are removed.");
pass("Verified AG03 references appear before article footer/back links.");
pass("No CSS/JS/image/backend/Auth/Supabase mutation is performed.");
pass("AG05E post-repair audit is identified as next.");
