import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag05f-live-redeployment-manual-visible-reference-verification-record.json");
const docPath = path.join(root, "docs", "quality", "AG05F_LIVE_REDEPLOYMENT_MANUAL_VISIBLE_REFERENCE_VERIFICATION_RECORD.md");
const recordPath = path.join(root, "data", "editorial", "ag05f-live-redeployment-manual-visible-reference-verification-record.json");
const previewPath = path.join(root, "data", "quality", "ag05f-live-redeployment-manual-visible-reference-verification-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG05F validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, recordPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG05F required file: ${p}`);
}

const config = readJson(registryPath);
const record = readJson(recordPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG05F") fail("Registry module_id must be AG05F");
if (record.module_id !== "AG05F") fail("Record module_id must be AG05F");
if (preview.module_id !== "AG05F") fail("Preview module_id must be AG05F");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (record.summary.manual_live_verification_completed !== true) fail("Manual live verification must be complete");
if (record.summary.observed_commit !== "20a3b37") fail("Observed commit must be 20a3b37");
if (record.summary.ag05d_visible_block_count !== 1) fail("AG05D visible block count must be 1");
if (record.summary.ag03_reference_link_count !== 2) fail("AG03 reference link count must be 2");
if (record.summary.ag05d_r1_neutralized_count < 1) fail("Neutralized placeholder count must be at least 1");
if (record.summary.visible_ar01_placeholder_count !== 0) fail("Visible AR01 placeholder count must be 0");
if (record.summary.live_verification_passed !== true) fail("Live verification must pass");
if (record.summary.correction_required !== false) fail("correction_required must be false");
if (record.summary.next_stage_id !== "AG05Z") fail("Next stage must be AG05Z");
if (record.summary.backend_auth_supabase_no_activation_passed !== true) fail("Backend/Auth/Supabase no-activation must pass");
if (record.summary.audit_only_no_mutation !== true) fail("AG05F must be audit/record-only");

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

for (const scriptName of ["generate:ag05f", "validate:ag05f", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG05F document missing phrase: ${phrase}`);
}

pass("AG05F registry is present.");
pass("AG05F document is present.");
pass("AG05F live/manual verification record and preview are present.");
pass("Live verification is recorded as passed.");
pass("AG05D visible reference block and two AG03 links are confirmed.");
pass("AR01 placeholder references are neutralized and no visible placeholder remains.");
pass("Correction required is false.");
pass("No article/page/content/image/reference/CSS/JS mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG05Z closure is identified as next.");
