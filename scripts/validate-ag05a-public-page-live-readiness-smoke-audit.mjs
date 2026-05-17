import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag05a-public-page-live-readiness-smoke-audit.json");
const docPath = path.join(root, "docs", "quality", "AG05A_PUBLIC_PAGE_LIVE_READINESS_SMOKE_AUDIT.md");
const auditPath = path.join(root, "data", "editorial", "ag05a-public-page-live-readiness-smoke-audit.json");
const previewPath = path.join(root, "data", "quality", "ag05a-public-page-live-readiness-smoke-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG05A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, auditPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG05A required file: ${p}`);
}

const config = readJson(registryPath);
const audit = readJson(auditPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG05A") fail("Registry module_id must be AG05A");
if (audit.module_id !== "AG05A") fail("Audit module_id must be AG05A");
if (preview.module_id !== "AG05A") fail("Preview module_id must be AG05A");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (audit.summary.ag03_reference_scaling_closed !== true) fail("AG03 closure must remain true");
if (audit.summary.ag04_visual_credit_width_closed !== true) fail("AG04 closure must remain true");
if (audit.summary.homepage_detected !== true) fail("Homepage static file must be detected");
if (audit.summary.article_count_from_ag03z !== config.expected.ag03_article_count) fail("AG03Z must account for 72 articles");
if (audit.summary.article_count_from_ag04z !== config.expected.ag04_article_count) fail("AG04Z must account for 72 articles");
if (audit.summary.ag03_reference_link_count_from_ag03z !== config.expected.ag03_reference_link_count) fail("AG03Z reference count must remain 144");
if (!Array.isArray(audit.issue_queue)) fail("Issue queue must be an array");
if (audit.summary.audit_only_no_mutation !== true) fail("AG05A must be audit-only");
if (audit.summary.ready_for_ag05b_manual_live_review_record !== true) fail("AG05A must identify AG05B as next stage");

for (const issueType of config.issue_types) {
  if (typeof audit.summary.issue_type_counts[issueType] !== "number") {
    fail(`Missing issue count for ${issueType}`);
  }
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

for (const scriptName of ["generate:ag05a", "validate:ag05a", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG05A document missing phrase: ${phrase}`);
}

pass("AG05A registry is present.");
pass("AG05A document is present.");
pass("AG05A audit and preview outputs are present.");
pass("AG03 closure remains true.");
pass("AG04 closure remains true.");
pass("Homepage static file is detected.");
pass("Article closure counts remain aligned with AG03/AG04.");
pass("Favicon/logo, navigation, sign-in/join and backend/Auth/Supabase smoke signals are recorded.");
pass("Issue queue is generated.");
pass("No article/page/content/image/reference/CSS/JS mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG05B manual live review result record is identified as next.");
