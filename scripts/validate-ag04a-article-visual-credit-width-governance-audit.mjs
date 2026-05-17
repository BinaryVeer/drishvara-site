import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag04a-article-visual-credit-width-governance-audit.json");
const docPath = path.join(root, "docs", "quality", "AG04A_ARTICLE_VISUAL_CREDIT_WIDTH_GOVERNANCE_AUDIT.md");
const auditPath = path.join(root, "data", "editorial", "ag04a-article-visual-credit-width-governance-audit.json");
const previewPath = path.join(root, "data", "quality", "ag04a-article-visual-credit-width-governance-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG04A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, auditPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG04A required file: ${p}`);
}

const config = readJson(registryPath);
const audit = readJson(auditPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG04A") fail("Registry module_id must be AG04A");
if (audit.module_id !== "AG04A") fail("Audit module_id must be AG04A");
if (preview.module_id !== "AG04A") fail("Preview module_id must be AG04A");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (audit.source_context.ag03z_closed !== true) fail("AG03Z must be closed before AG04A");
if (audit.summary.scanned_article_count !== config.expected.article_count) fail("AG04A must scan exactly 72 AG03-closed article pages");
if (audit.summary.live_ag03_reference_link_count !== config.expected.ag03_reference_link_count) fail("Live AG03 reference count must remain 144");
if (audit.summary.articles_with_exactly_two_ag03_links !== config.expected.article_count) fail("Every scanned article must retain exactly two AG03 links");
if (audit.summary.ag03_integrity_preserved !== true) fail("AG03 reference integrity must be preserved");
if (audit.summary.audit_only_no_mutation !== true) fail("AG04A must be audit-only");
if (audit.summary.ready_for_ag04b_targeted_correction !== true) fail("AG04A must identify AG04B as next stage");

if (!Array.isArray(audit.article_results)) fail("Article results must be an array");
if (audit.article_results.length !== config.expected.article_count) fail("Article results must contain 72 entries");
if (!Array.isArray(audit.ag04b_issue_queue)) fail("AG04B issue queue must be an array");

for (const row of audit.article_results) {
  if (!row.article_path || !row.article_path.startsWith("articles/")) fail("Invalid article path in AG04A result");
  if (row.ag03_reference_link_count !== config.expected.references_per_article) fail(`AG03 link count drift: ${row.article_path}`);
  if (!Array.isArray(row.issue_types)) fail(`Issue types must be an array: ${row.article_path}`);
}

for (const issueType of config.issue_types) {
  if (typeof audit.summary.issue_type_counts[issueType] !== "number") {
    fail(`Missing issue count for ${issueType}`);
  }
}

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
  if (audit[falseField] !== false) fail(`${falseField} must be false`);
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

for (const scriptName of ["generate:ag04a", "validate:ag04a", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG04A document missing phrase: ${phrase}`);
}

pass("AG04A registry is present.");
pass("AG04A document is present.");
pass("AG04A audit and preview outputs are present.");
pass("Exactly 72 AG03-closed article pages are scanned.");
pass("Live AG03 reference count remains 144.");
pass("Every scanned article retains exactly two AG03 reference links.");
pass("Visual, image-credit and reading-width issue queues are generated.");
pass("No article/page/content/image/reference/CSS mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG04B targeted correction stage is identified as next.");
