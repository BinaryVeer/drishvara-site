import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag04z-article-visual-credit-width-governance-closure.json");
const docPath = path.join(root, "docs", "quality", "AG04Z_ARTICLE_VISUAL_CREDIT_WIDTH_GOVERNANCE_CLOSURE.md");
const recordPath = path.join(root, "data", "editorial", "ag04z-article-visual-credit-width-governance-closure.json");
const previewPath = path.join(root, "data", "quality", "ag04z-article-visual-credit-width-governance-closure-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG04Z validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, recordPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG04Z required file: ${p}`);
}

const config = readJson(registryPath);
const record = readJson(recordPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG04Z") fail("Registry module_id must be AG04Z");
if (record.module_id !== "AG04Z") fail("Closure record module_id must be AG04Z");
if (preview.module_id !== "AG04Z") fail("Preview module_id must be AG04Z");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (record.summary.article_count !== config.expected.article_count) fail("AG04Z must represent 72 articles");
if (record.summary.live_ag03_reference_link_count !== config.expected.ag03_reference_link_count) fail("AG03 reference count must remain 144");
if (record.summary.articles_with_exactly_two_ag03_links !== config.expected.article_count) fail("Every article must retain exactly two AG03 links");
if (record.summary.articles_with_primary_image_src !== config.expected.article_count) fail("All 72 articles must have primary image evidence");
if (record.summary.articles_with_logo_or_brand_like_primary_image !== 0) fail("Logo/brand-like primary image count must be 0");
if (record.summary.articles_with_credit_or_source_evidence !== config.expected.article_count) fail("All 72 articles must have credit/source evidence");
if (record.summary.articles_with_reading_width_evidence_aligned !== config.expected.article_count) fail("All 72 articles must have reading-width alignment evidence");
if (record.summary.manual_review_queue_count !== 0) fail("Manual review queue must be 0");
if (record.summary.correction_required !== false) fail("correction_required must be false");
if (record.summary.ag04b_correction_required !== false) fail("AG04B correction must be recorded as not required");
if (record.summary.ag03_integrity_preserved !== true) fail("AG03 integrity must remain preserved");
if (record.summary.ag04_visual_credit_width_governance_closed !== true) fail("AG04 governance must be closed");

for (const check of [
  "ag03z_reference_closure_confirmed",
  "ag04a_audit_confirmed",
  "ag04a_r1_evidence_register_confirmed",
  "ag04a_r2_review_result_confirmed",
  "correction_required_false",
  "next_stage_is_ag04z",
  "closure_ok"
]) {
  if (record.closure_checks[check] !== true) fail(`Closure check failed: ${check}`);
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
  if (record[falseField] !== false) fail(`${falseField} must be false`);
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

for (const scriptName of ["generate:ag04z", "validate:ag04z", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG04Z document missing phrase: ${phrase}`);
}

pass("AG04Z registry is present.");
pass("AG04Z document is present.");
pass("AG04Z closure record and preview outputs are present.");
pass("Exactly 72 articles are represented.");
pass("Live AG03 reference count remains 144.");
pass("Every article retains exactly two AG03 links.");
pass("All 72 articles have primary image evidence.");
pass("Zero articles have logo/brand-like primary image evidence.");
pass("All 72 articles have credit/source evidence.");
pass("All 72 articles have reading-width alignment evidence.");
pass("AG04A-R2 correction_required is false.");
pass("AG04B correction is recorded as not required.");
pass("No article/page/content/image/reference/CSS mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG04 governance is closed.");
