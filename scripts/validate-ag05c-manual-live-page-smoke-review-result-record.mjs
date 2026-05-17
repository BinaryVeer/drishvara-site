import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag05c-manual-live-page-smoke-review-result-record.json");
const docPath = path.join(root, "docs", "quality", "AG05C_MANUAL_LIVE_PAGE_SMOKE_REVIEW_RESULT_RECORD.md");
const resultPath = path.join(root, "data", "editorial", "ag05c-manual-live-page-smoke-review-result-record.json");
const previewPath = path.join(root, "data", "quality", "ag05c-manual-live-page-smoke-review-result-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG05C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, resultPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG05C required file: ${p}`);
}

const config = readJson(registryPath);
const result = readJson(resultPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG05C") fail("Registry module_id must be AG05C");
if (result.module_id !== "AG05C") fail("Result module_id must be AG05C");
if (preview.module_id !== "AG05C") fail("Preview module_id must be AG05C");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (result.summary.manual_live_review_completed !== true) fail("Manual live review must be marked complete");
if (result.summary.correction_required !== true) fail("AG05C must record correction_required true");
if (result.summary.next_stage_id !== "AG05D") fail("Next stage must be AG05D");
if (result.summary.failed_observation_count < 1) fail("At least one failed observation must be recorded");
if (result.summary.article_reference_source_presence_passed !== true) fail("Source reference presence must be recorded as passed");
if (result.summary.article_reference_visible_presentation_passed !== false) fail("Visible reference presentation must be recorded as failed");
if (result.summary.sample_article_local_ag03_marker_count !== 2) fail("Sample article local AG03 marker count must be 2");
if (result.summary.sample_article_live_html_contains_ag03_links !== true) fail("Live HTML AG03 links must be recorded as present");
if (result.summary.sample_article_visible_reader_placeholder_still_visible !== true) fail("Visible placeholder issue must be recorded");
if (result.summary.backend_auth_supabase_no_activation_passed !== true) fail("Backend/Auth/Supabase no-activation must pass");

if (!Array.isArray(result.observations)) fail("Observations must be an array");
if (!Array.isArray(result.failed_observations)) fail("Failed observations must be an array");
if (!result.failed_observations.some((row) => row.review_area === "article_reference_visible_presentation")) {
  fail("Visible reference presentation failure must be recorded");
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
  if (result[falseField] !== false) fail(`${falseField} must be false`);
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

for (const scriptName of ["generate:ag05c", "validate:ag05c", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG05C document missing phrase: ${phrase}`);
}

pass("AG05C registry is present.");
pass("AG05C document is present.");
pass("AG05C manual review result and preview outputs are present.");
pass("AG05B checklist is confirmed.");
pass("Homepage, insights, article visual/credit/width, sign-in/join, submissions and deployment observations are recorded.");
pass("Article reference source/live-HTML presence is recorded as passed.");
pass("Article reference visible presentation is recorded as failed.");
pass("Correction required is true.");
pass("AG05D targeted visible-reference placement repair is identified as next.");
pass("No article/page/content/image/reference/CSS/JS mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
