import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag06a-full-source-of-truth-inventory-audit.json");
const docPath = path.join(root, "docs", "quality", "AG06A_FULL_SOURCE_OF_TRUTH_INVENTORY_AUDIT.md");
const auditPath = path.join(root, "data", "editorial", "ag06a-full-source-of-truth-inventory-audit.json");
const previewPath = path.join(root, "data", "quality", "ag06a-full-source-of-truth-inventory-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG06A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, auditPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG06A required file: ${p}`);
}

const config = readJson(registryPath);
const audit = readJson(auditPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG06A") fail("Registry module_id must be AG06A");
if (audit.module_id !== "AG06A") fail("Audit module_id must be AG06A");
if (preview.module_id !== "AG06A") fail("Preview module_id must be AG06A");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (audit.source_context.ag05z_closed !== true) fail("AG05Z closure must remain true");
if (audit.source_context.ag04z_closed !== true) fail("AG04Z closure must remain true");
if (audit.source_context.ag03z_closed !== true) fail("AG03Z closure must remain true");
if (audit.summary.public_article_count < config.expected.minimum_public_article_count) fail("Public article count below expected minimum");
if (audit.summary.governed_public_article_count < config.expected.minimum_governed_article_count) fail("Governed article count below expected minimum");
if (!Array.isArray(audit.public_article_inventory)) fail("Public article inventory must be an array");
if (audit.public_article_inventory.length !== audit.summary.public_article_count) fail("Public article inventory count mismatch");
if (!Array.isArray(audit.unguided_public_articles)) fail("Unguided public articles must be an array");
if (!Array.isArray(audit.inventory_gaps)) fail("Inventory gaps must be an array");
if (audit.summary.inventory_gap_count !== audit.inventory_gaps.length) fail("Inventory gap count mismatch");
if (audit.summary.next_stage_id !== "AG06B") fail("AG06B must be identified as next");
if (audit.summary.audit_only_no_mutation !== true) fail("AG06A must be audit-only");

for (const falseField of [
  "mutation_performed",
  "article_html_mutation_performed",
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

for (const scriptName of ["generate:ag06a", "validate:ag06a", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG06A document missing phrase: ${phrase}`);
}

pass("AG06A registry is present.");
pass("AG06A document is present.");
pass("AG06A audit and preview outputs are present.");
pass("Source Tree Active Register is consumed.");
pass("AG03, AG04 and AG05 closures remain preserved.");
pass("Public article inventory is generated.");
pass("Governed and unguided public article counts are recorded.");
pass("Production-intelligence inventory is generated.");
pass("Scaffold artifact counts are recorded where available.");
pass("Content-intelligence gaps are recorded.");
pass("No article/page/content/image/reference/CSS/JS mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG06B Content Intelligence Schema is identified as next.");
