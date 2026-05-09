import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag01r1-post-ag02-article-governance-refresh-audit.json");
const docPath = path.join(root, "docs", "quality", "AG01R1_POST_AG02_ARTICLE_GOVERNANCE_REFRESH_AUDIT.md");
const auditPath = path.join(root, "data", "editorial", "ag01r1-post-ag02-article-governance-refresh-audit.json");
const previewPath = path.join(root, "data", "quality", "ag01r1-post-ag02-article-governance-refresh-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG01R1 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const requiredPath of [registryPath, docPath, auditPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing AG01R1 required artifact/dependency: ${requiredPath}`);
}

const registry = readJson(registryPath);
const audit = readJson(auditPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AG01R1") fail("Registry module_id must be AG01R1");
if (audit.module_id !== "AG01R1") fail("Audit output module_id must be AG01R1");
if (preview.module_id !== "AG01R1") fail("Preview module_id must be AG01R1");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (!Array.isArray(audit.entries) || audit.entries.length < 1) fail("Audit must include article entries");
if (audit.summary.article_count !== audit.entries.length) fail("Summary article count must match entry count");
if (audit.summary.article_count !== audit.summary.baseline_ag01_article_count) fail("Article count must match AG01 baseline");

if (audit.summary.ag02_target_count_seen_in_refresh !== audit.summary.ag02_target_count_from_apply) {
  fail("AG02 target count seen in refresh must match AG02 apply result");
}

if (audit.summary.ag02_targets_missing_visible_ag02_hero !== 0) {
  fail("All AG02 targets must have visible AG02 hero figures");
}

if (audit.summary.ag02_targets_missing_visible_ag02_credit !== 0) {
  fail("All AG02 targets must have visible AG02 credit records");
}

if (audit.summary.missing_or_broken_or_logo_image > audit.summary.baseline_missing_or_broken_or_logo_image) {
  fail("Image problem count must not increase after AG02");
}

if (audit.summary.ar02c_sample_articles_with_two_public_verified_references !== audit.summary.ar02c_sample_expected_count) {
  fail("AR02C sample public verified references must remain preserved");
}

for (const entry of audit.entries) {
  if (!entry.article_path || !entry.article_path.startsWith("articles/")) fail("Each entry must have article path");
  if (typeof entry.word_count !== "number") fail(`Missing word count: ${entry.article_path}`);
  if (!entry.image || !entry.image.hero_image_status) fail(`Missing image status: ${entry.article_path}`);
  if (!entry.credit || !entry.credit.image_credit_status) fail(`Missing credit status: ${entry.article_path}`);
  if (!entry.references || !entry.references.reference_publication_status) fail(`Missing reference status: ${entry.article_path}`);
  if (!entry.publication_readiness || !entry.publication_readiness.status) fail(`Missing readiness: ${entry.article_path}`);
}

for (const bucketName of [
  "needs_image_or_credit_repair_after_ag02",
  "needs_reference_scaling_or_publication",
  "needs_long_form_expansion_or_gate",
  "needs_template_alignment"
]) {
  if (!Array.isArray(audit.issue_buckets[bucketName])) fail(`Missing issue bucket: ${bucketName}`);
}

for (const falseField of [
  "mutation_performed",
  "article_html_mutation_performed",
  "article_text_mutation_performed",
  "article_word_count_reduction_performed",
  "article_word_count_expansion_performed",
  "article_image_mutation_performed",
  "image_credit_mutation_performed",
  "reference_url_change_performed",
  "new_reference_insertion_performed",
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

for (const flag of [
  "article_html_mutation_enabled",
  "article_text_mutation_enabled",
  "article_word_count_reduction_enabled",
  "article_word_count_expansion_enabled",
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

for (const scriptName of ["generate:ag01r1", "validate:ag01r1", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Why AG01R1 is Required", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG01R1 document missing phrase: ${phrase}`);
}

pass("AG01R1 registry is present.");
pass("AG01R1 document is present.");
pass("AG01R1 audit and preview outputs are present.");
pass("All static article pages are re-audited after AG02.");
pass("AG02 target count is verified against AG02 apply result.");
pass("Visible AG02 hero and credit are counted without CSS/script false positives.");
pass("AR02C sample verified references remain preserved.");
pass("Image/credit, reference, long-form and template gaps are refreshed.");
pass("No article/page/content/reference/image mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG01R1 is post-AG02 refresh audit only and safe to commit.");
