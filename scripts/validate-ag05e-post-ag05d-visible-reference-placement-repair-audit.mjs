import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag05e-post-ag05d-visible-reference-placement-repair-audit.json");
const docPath = path.join(root, "docs", "quality", "AG05E_POST_AG05D_VISIBLE_REFERENCE_PLACEMENT_REPAIR_AUDIT.md");
const auditPath = path.join(root, "data", "editorial", "ag05e-post-ag05d-visible-reference-placement-repair-audit.json");
const previewPath = path.join(root, "data", "quality", "ag05e-post-ag05d-visible-reference-placement-repair-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG05E validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, auditPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG05E required file: ${p}`);
}

const config = readJson(registryPath);
const audit = readJson(auditPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG05E") fail("Registry module_id must be AG05E");
if (audit.module_id !== "AG05E") fail("Audit module_id must be AG05E");
if (preview.module_id !== "AG05E") fail("Preview module_id must be AG05E");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (audit.summary.audited_article_count !== config.expected.processed_article_count) fail("AG05E must audit 72 processed articles");
if (audit.summary.articles_with_two_ag03_links !== config.expected.processed_article_count) fail("Every audited article must have two AG03 links");
if (audit.summary.articles_with_one_ag05d_visible_block !== config.expected.processed_article_count) fail("Every audited article must have one AG05D visible block");
if (audit.summary.articles_with_zero_visible_placeholder_sections !== config.expected.processed_article_count) fail("No visible placeholder section may remain");
if (audit.summary.articles_with_reference_urls_unchanged_from_ag05d !== config.expected.processed_article_count) fail("Reference URLs must remain unchanged from AG05D");
if (audit.summary.articles_with_ag03_before_back_links !== config.expected.processed_article_count) fail("AG03 references must remain before back/footer links");
if (audit.summary.failed_article_count !== 0) fail("AG05E must have zero failed article audits");
if (audit.summary.ag03_integrity_preserved !== true) fail("AG03 integrity must be preserved");
if (audit.summary.ag04_closure_preserved !== true) fail("AG04 closure must be preserved");
if (audit.summary.reference_url_change_performed !== false) fail("Reference URL change must be false");
if (audit.summary.audit_only_no_mutation !== true) fail("AG05E must be audit-only");
if (audit.summary.ready_for_ag05f_live_redeployment_manual_verification !== true) fail("AG05F must be identified as next");

if (!Array.isArray(audit.article_audit_results)) fail("Article audit results must be an array");
if (audit.article_audit_results.length !== config.expected.processed_article_count) fail("Article audit result count must be 72");
if (!Array.isArray(audit.failed_article_audit_results)) fail("Failed audit result must be an array");
if (audit.failed_article_audit_results.length !== 0) fail("Failed audit result array must be empty");

for (const row of audit.article_audit_results) {
  if (row.ag03_reference_link_count !== 2) fail(`AG03 link count drift: ${row.article_path}`);
  if (row.ag05d_visible_reference_block_count !== 1) fail(`AG05D visible block count invalid: ${row.article_path}`);
  if (row.visible_placeholder_section_count !== 0) fail(`Visible placeholder remains: ${row.article_path}`);
  if (row.reference_urls_unchanged_from_ag05d !== true) fail(`Reference URLs changed: ${row.article_path}`);
  if (row.ag03_before_back_links !== true) fail(`AG03 references not before back links: ${row.article_path}`);
  if (row.passed !== true) fail(`Article audit did not pass: ${row.article_path}`);
}

for (const falseField of [
  "mutation_performed",
  "article_html_mutation_performed",
  "homepage_mutation_performed",
  "css_mutation_performed",
  "javascript_mutation_performed",
  "favicon_mutation_performed",
  "navigation_mutation_performed",
  "reference_url_change_performed",
  "external_fetch_performed_by_script",
  "live_url_fetch_performed",
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
  if (audit[falseField] !== false) fail(`${falseField} must be false`);
}

for (const flag of [
  "article_html_mutation_enabled",
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

for (const scriptName of ["generate:ag05e", "validate:ag05e", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG05E document missing phrase: ${phrase}`);
}

pass("AG05E registry is present.");
pass("AG05E document is present.");
pass("AG05E audit and preview outputs are present.");
pass("72 processed article pages are audited.");
pass("Every audited article retains exactly two AG03 reference links.");
pass("Every audited article has one AG05D visible reference block.");
pass("No visible obsolete reference placeholder remains.");
pass("AG03 reference URLs remain unchanged from AG05D.");
pass("Verified references remain before back/footer links.");
pass("AG03 and AG04 closure integrity remains preserved.");
pass("No article/page/content/image/reference/CSS/JS mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG05F live redeployment/manual verification is identified as next.");
