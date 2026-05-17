import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag05e-r1-post-ag05d-r1-ar01-placeholder-neutralization-audit.json");
const docPath = path.join(root, "docs", "quality", "AG05E_R1_POST_AG05D_R1_AR01_PLACEHOLDER_NEUTRALIZATION_AUDIT.md");
const auditPath = path.join(root, "data", "editorial", "ag05e-r1-post-ag05d-r1-ar01-placeholder-neutralization-audit.json");
const previewPath = path.join(root, "data", "quality", "ag05e-r1-post-ag05d-r1-ar01-placeholder-neutralization-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG05E-R1 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, auditPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG05E-R1 required file: ${p}`);
}

const config = readJson(registryPath);
const audit = readJson(auditPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG05E-R1") fail("Registry module_id must be AG05E-R1");
if (audit.module_id !== "AG05E-R1") fail("Audit module_id must be AG05E-R1");
if (preview.module_id !== "AG05E-R1") fail("Preview module_id must be AG05E-R1");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (audit.summary.audited_article_count !== config.expected.article_count) fail("AG05E-R1 must audit 72 articles");
if (audit.summary.articles_with_two_ag03_links !== config.expected.article_count) fail("Every article must retain two AG03 links");
if (audit.summary.articles_with_one_ag05d_visible_block !== config.expected.article_count) fail("Every article must retain one AG05D visible block");
if (audit.summary.articles_with_zero_visible_ar01_placeholders !== config.expected.article_count) fail("Visible AR01 placeholder count must be zero for every article");
if (audit.summary.articles_with_neutralized_ar01_placeholders !== config.expected.article_count) fail("Every article must contain neutralized AR01 placeholders");
if (audit.summary.articles_with_neutralized_ar01_placeholders_hidden !== config.expected.article_count) fail("Neutralized AR01 placeholders must be hidden in every article");
if (audit.summary.articles_with_reference_urls_unchanged_from_ag05d_r1 !== config.expected.article_count) fail("All reference URLs must remain unchanged");
if (audit.summary.articles_with_ag03_before_back_links !== config.expected.article_count) fail("AG03 references must remain before back links");
if (audit.summary.total_visible_ar01_placeholder_count !== 0) fail("Total visible AR01 placeholder count must be zero");
if (audit.summary.failed_article_count !== 0) fail("Failed article count must be zero");
if (audit.summary.ag03_integrity_preserved !== true) fail("AG03 integrity must be preserved");
if (audit.summary.ag04_closure_preserved !== true) fail("AG04 closure must be preserved");
if (audit.summary.reference_url_change_performed !== false) fail("Reference URL change must be false");
if (audit.summary.audit_only_no_mutation !== true) fail("AG05E-R1 must be audit-only");
if (audit.summary.ready_for_ag05f_live_redeployment_manual_verification !== true) fail("AG05F must be identified as next");

for (const row of audit.article_audit_results) {
  if (row.ag03_reference_link_count !== 2) fail(`AG03 link count drift: ${row.article_path}`);
  if (row.ag05d_visible_reference_block_count !== 1) fail(`AG05D block count invalid: ${row.article_path}`);
  if (row.visible_ar01_placeholder_count !== 0) fail(`Visible AR01 placeholder remains: ${row.article_path}`);
  if (row.neutralized_ar01_placeholder_count < 1) fail(`Neutralized AR01 placeholder missing: ${row.article_path}`);
  if (row.neutralized_ar01_placeholders_hidden !== true) fail(`Neutralized AR01 placeholder not hidden: ${row.article_path}`);
  if (row.reference_urls_unchanged_from_ag05d_r1 !== true) fail(`Reference URL changed: ${row.article_path}`);
  if (row.ag03_before_back_links !== true) fail(`AG03 references not before back links: ${row.article_path}`);
  if (row.passed !== true) fail(`Article audit failed: ${row.article_path}`);
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

for (const scriptName of ["generate:ag05e-r1", "validate:ag05e-r1", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG05E-R1 document missing phrase: ${phrase}`);
}

pass("AG05E-R1 registry is present.");
pass("AG05E-R1 document is present.");
pass("AG05E-R1 audit and preview outputs are present.");
pass("72 article pages are audited.");
pass("Every article retains exactly two AG03 reference links.");
pass("Every article retains one AG05D visible reference block.");
pass("Zero visible AR01 placeholder reference elements remain.");
pass("Neutralized AR01 placeholders are hidden from reader surface.");
pass("All AG03 reference URLs remain unchanged.");
pass("No article/page/content/image/reference/CSS/JS mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG05F live redeployment/manual verification is identified as next.");
