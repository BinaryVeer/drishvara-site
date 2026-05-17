import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag05z-public-page-live-readiness-smoke-governance-closure.json");
const docPath = path.join(root, "docs", "quality", "AG05Z_PUBLIC_PAGE_LIVE_READINESS_SMOKE_GOVERNANCE_CLOSURE.md");
const recordPath = path.join(root, "data", "editorial", "ag05z-public-page-live-readiness-smoke-governance-closure.json");
const previewPath = path.join(root, "data", "quality", "ag05z-public-page-live-readiness-smoke-governance-closure-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG05Z validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, recordPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG05Z required file: ${p}`);
}

const config = readJson(registryPath);
const record = readJson(recordPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG05Z") fail("Registry module_id must be AG05Z");
if (record.module_id !== "AG05Z") fail("Record module_id must be AG05Z");
if (preview.module_id !== "AG05Z") fail("Preview module_id must be AG05Z");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (record.summary.ag05_public_page_live_readiness_smoke_governance_closed !== true) fail("AG05 governance must be closed");
if (record.summary.ag03_closure_preserved !== true) fail("AG03 closure must be preserved");
if (record.summary.ag04_closure_preserved !== true) fail("AG04 closure must be preserved");
if (record.summary.article_count_audited_after_repair !== config.expected.article_count) fail("72 articles must be audited after repair");
if (record.summary.articles_with_two_ag03_links !== config.expected.article_count) fail("Every article must retain two AG03 links");
if (record.summary.articles_with_one_ag05d_visible_block !== config.expected.article_count) fail("Every article must retain one AG05D visible block");
if (record.summary.total_visible_ar01_placeholder_count !== 0) fail("Visible AR01 placeholder count must be zero");
if (record.summary.failed_article_count_after_repair !== 0) fail("Failed article count must be zero");
if (record.summary.live_verification_passed !== true) fail("Live verification must be passed");
if (record.summary.live_visible_ar01_placeholder_count !== 0) fail("Live visible AR01 placeholder count must be zero");
if (record.summary.correction_required !== false) fail("correction_required must be false");
if (record.summary.reference_url_change_performed !== false) fail("Reference URL change must be false");
if (record.summary.backend_auth_supabase_activation_performed !== false) fail("Backend/Auth/Supabase activation must be false");
if (record.summary.audit_only_no_mutation !== true) fail("AG05Z must be audit-only");

for (const [key, value] of Object.entries(record.closure_checks)) {
  if (value !== true) fail(`Closure check failed: ${key}`);
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
  if (record[falseField] !== false) fail(`${falseField} must be false`);
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

for (const scriptName of ["generate:ag05z", "validate:ag05z", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG05Z document missing phrase: ${phrase}`);
}

pass("AG05Z registry is present.");
pass("AG05Z document is present.");
pass("AG05Z closure record and preview are present.");
pass("AG05F live verification is passed.");
pass("AG05F correction_required is false.");
pass("AG05E-R1 confirms 72 audited articles.");
pass("All audited articles retain two AG03 links.");
pass("All audited articles retain one AG05D visible reference block.");
pass("Zero visible AR01 placeholders remain.");
pass("AG03 and AG04 closure remain preserved.");
pass("No article/page/content/image/reference/CSS/JS mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG05 public page/live-readiness smoke governance is closed.");
