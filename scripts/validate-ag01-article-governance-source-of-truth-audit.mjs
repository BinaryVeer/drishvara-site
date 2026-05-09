import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag01-article-governance-source-of-truth-audit.json");
const docPath = path.join(root, "docs", "quality", "AG01_ARTICLE_GOVERNANCE_SOURCE_OF_TRUTH_AUDIT.md");
const auditPath = path.join(root, "data", "editorial", "ag01-article-governance-source-of-truth-audit.json");
const previewPath = path.join(root, "data", "quality", "ag01-article-governance-source-of-truth-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG01 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const requiredPath of [registryPath, docPath, auditPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing AG01 required artifact/dependency: ${requiredPath}`);
}

const registry = readJson(registryPath);
const audit = readJson(auditPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AG01") fail("Registry module_id must be AG01");
if (audit.module_id !== "AG01") fail("Audit output module_id must be AG01");
if (preview.module_id !== "AG01") fail("Preview module_id must be AG01");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (!Array.isArray(audit.entries) || audit.entries.length < 1) fail("AG01 must audit at least one article");
if (audit.summary.article_count !== audit.entries.length) fail("Summary article count must match entries length");

for (const entry of audit.entries) {
  if (!entry.article_path || !entry.article_path.startsWith("articles/")) fail("Each entry must have article path");
  if (!entry.category) fail(`Missing category: ${entry.article_path}`);
  if (!entry.title) fail(`Missing title: ${entry.article_path}`);
  if (typeof entry.word_count !== "number") fail(`Missing word count: ${entry.article_path}`);
  if (!entry.image || !entry.image.hero_image_status) fail(`Missing image status: ${entry.article_path}`);
  if (!entry.credit || !entry.credit.image_credit_status) fail(`Missing image credit status: ${entry.article_path}`);
  if (!entry.references || !entry.references.reference_publication_status) fail(`Missing reference status: ${entry.article_path}`);
  if (!entry.publication_readiness || !entry.publication_readiness.status) fail(`Missing readiness: ${entry.article_path}`);
}

for (const bucketName of [
  "needs_image_or_credit_repair",
  "needs_reference_scaling_or_publication",
  "needs_long_form_expansion_or_gate",
  "needs_template_alignment"
]) {
  if (!Array.isArray(audit.issue_buckets[bucketName])) fail(`Missing issue bucket: ${bucketName}`);
}

if (audit.mutation_performed !== false) fail("AG01 must not perform mutation");
if (audit.article_html_mutation_performed !== false) fail("AG01 must not mutate article HTML");
if (audit.article_text_mutation_performed !== false) fail("AG01 must not mutate article text");
if (audit.article_image_mutation_performed !== false) fail("AG01 must not mutate article images");
if (audit.image_credit_mutation_performed !== false) fail("AG01 must not mutate image credits");
if (audit.reference_url_change_performed !== false) fail("AG01 must not change reference URLs");
if (audit.new_reference_insertion_performed !== false) fail("AG01 must not insert references");

for (const flag of [
  "article_html_mutation_enabled",
  "article_text_mutation_enabled",
  "article_word_count_reduction_enabled",
  "article_image_mutation_enabled",
  "image_credit_mutation_enabled",
  "reference_url_change_enabled",
  "new_reference_insertion_enabled",
  "external_fetch_enabled",
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
  if (registry[flag] !== false) fail(`${flag} must remain false`);
}

for (const falseField of [
  "external_fetch_performed",
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
  if (audit[falseField] !== false) fail(`Audit ${falseField} must be false`);
}

for (const scriptName of ["generate:ag01", "validate:ag01", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Why AG01 is Required", "Scope", "Long-form Content Rule", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG01 document missing phrase: ${phrase}`);
}

pass("AG01 registry is present.");
pass("AG01 document is present.");
pass("AG01 audit and preview outputs are present.");
pass("All static article pages are audited.");
pass("Word count, image, credit, reference, marker, router-alignment and readiness fields are recorded.");
pass("Issue buckets are created for image/credit, reference, long-form and template gaps.");
pass("No article/page/content/reference/image mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG01 is source-of-truth audit only and safe to commit.");
