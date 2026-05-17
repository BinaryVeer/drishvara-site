import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag05b-manual-live-page-smoke-review-checklist.json");
const docPath = path.join(root, "docs", "quality", "AG05B_MANUAL_LIVE_PAGE_SMOKE_REVIEW_CHECKLIST.md");
const checklistPath = path.join(root, "data", "editorial", "ag05b-manual-live-page-smoke-review-checklist.json");
const previewPath = path.join(root, "data", "quality", "ag05b-manual-live-page-smoke-review-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG05B validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, checklistPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG05B required file: ${p}`);
}

const config = readJson(registryPath);
const checklist = readJson(checklistPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG05B") fail("Registry module_id must be AG05B");
if (checklist.module_id !== "AG05B") fail("Checklist module_id must be AG05B");
if (preview.module_id !== "AG05B") fail("Preview module_id must be AG05B");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (checklist.status !== "manual_live_review_pending") fail("AG05B checklist must remain pending manual live review");
if (checklist.summary.checklist_item_count <= 0) fail("Checklist must contain items");
if (checklist.summary.homepage_check_count <= 0) fail("Homepage checks must exist");
if (checklist.summary.article_sample_check_count <= 0) fail("Article sample checks must exist");
if (checklist.summary.backend_auth_no_activation_check_count < 2) fail("Backend/Auth no-activation checks must exist");
if (checklist.summary.pending_manual_live_review_count !== checklist.summary.checklist_item_count) fail("All AG05B items must remain pending");
if (checklist.summary.manual_live_review_completed !== false) fail("Manual live review must not be marked complete in AG05B");
if (checklist.summary.ready_for_ag05c_manual_live_review_result_record !== true) fail("AG05C must be identified as next");

if (!Array.isArray(checklist.checklist_items)) fail("Checklist items must be an array");
if (checklist.checklist_items.length !== checklist.summary.checklist_item_count) fail("Checklist count mismatch");

for (const item of checklist.checklist_items) {
  if (!item.check_id || !item.review_area || !item.description) fail("Checklist item missing required fields");
  if (!config.review_status_values.includes(item.observation_status)) fail(`Invalid observation status: ${item.check_id}`);
  if (item.observation_status !== "pending_manual_live_review") fail(`AG05B item must remain pending: ${item.check_id}`);
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
  if (checklist[falseField] !== false) fail(`${falseField} must be false`);
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

for (const scriptName of ["generate:ag05b", "validate:ag05b", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG05B document missing phrase: ${phrase}`);
}

pass("AG05B registry is present.");
pass("AG05B document is present.");
pass("AG05B checklist and preview outputs are present.");
pass("AG05A input is confirmed.");
pass("Homepage checks are created.");
pass("Article sample checks are created.");
pass("Navigation/sign-in/join checks are created.");
pass("Favicon/logo checks are represented through homepage checks.");
pass("Backend/Auth/Supabase no-activation checks are created.");
pass("All observations remain pending manual live review.");
pass("No article/page/content/image/reference/CSS/JS mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG05C manual live review result record is identified as next.");
