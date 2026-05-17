import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag04a-r2-manual-visual-review-result-record.json");
const docPath = path.join(root, "docs", "quality", "AG04A_R2_MANUAL_VISUAL_REVIEW_RESULT_RECORD.md");
const resultPath = path.join(root, "data", "editorial", "ag04a-r2-manual-visual-review-result-record.json");
const previewPath = path.join(root, "data", "quality", "ag04a-r2-manual-visual-review-result-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG04A-R2 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, resultPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG04A-R2 required file: ${p}`);
}

const config = readJson(registryPath);
const result = readJson(resultPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);

if (config.module_id !== "AG04A-R2") fail("Registry module_id must be AG04A-R2");
if (result.module_id !== "AG04A-R2") fail("Result module_id must be AG04A-R2");
if (preview.module_id !== "AG04A-R2") fail("Preview module_id must be AG04A-R2");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (result.summary.reviewed_article_count !== config.expected.article_count) fail("AG04A-R2 must review 72 articles");
if (result.summary.live_ag03_reference_link_count !== config.expected.ag03_reference_link_count) fail("AG03 reference count must remain 144");
if (result.summary.articles_with_exactly_two_ag03_links !== config.expected.article_count) fail("Every article must retain exactly two AG03 links");
if (result.summary.ag03_integrity_preserved !== true) fail("AG03 integrity must remain preserved");
if (typeof result.summary.correction_required !== "boolean") fail("correction_required must be boolean");
if (!["AG04B", "AG04Z"].includes(result.summary.next_stage_id)) fail("Next stage must be AG04B or AG04Z");

for (const falseField of [
  "mutation_performed",
  "article_html_mutation_performed",
  "article_text_mutation_performed",
  "article_image_mutation_performed",
  "image_credit_mutation_performed",
  "reference_url_change_performed",
  "css_mutation_performed",
  "external_fetch_performed_by_script",
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
  "article_text_mutation_enabled",
  "article_image_mutation_enabled",
  "image_credit_mutation_enabled",
  "reference_url_change_enabled",
  "css_mutation_enabled",
  "external_fetch_enabled_by_script",
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

for (const scriptName of ["generate:ag04a-r2", "validate:ag04a-r2", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

pass("AG04A-R2 registry is present.");
pass("AG04A-R2 document is present.");
pass("AG04A-R2 review result and preview outputs are present.");
pass("Exactly 72 articles are represented.");
pass("AG03 reference integrity remains preserved.");
pass("Correction decision and next stage are recorded.");
pass("No article/page/content/image/reference/CSS mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
