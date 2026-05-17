import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag03c-b6-article-reference-insertion.json");
const docPath = path.join(root, "docs", "quality", "AG03C_B6_ARTICLE_REFERENCE_INSERTION.md");
const approvalPath = path.join(root, "data", "editorial", "ag03b-b6-r1-reference-candidate-approval-record.json");
const applyPath = path.join(root, "data", "quality", "ag03c-b6-article-reference-insertion-apply-result.json");
const previewPath = path.join(root, "data", "quality", "ag03c-b6-article-reference-insertion-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG03C-B6 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, approvalPath, applyPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG03C-B6 required file: ${p}`);
}

const config = readJson(registryPath);
const approval = readJson(approvalPath);
const apply = readJson(applyPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG03C-B6") fail("Registry module_id must be AG03C-B6");
if (apply.module_id !== "AG03C-B6") fail("Apply result module_id must be AG03C-B6");
if (preview.module_id !== "AG03C-B6") fail("Preview module_id must be AG03C-B6");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (apply.summary.approved_article_count !== 12) fail("Exactly 12 approved Batch 6 articles expected");
if (apply.summary.processed_article_count !== 12) fail("Exactly 12 Batch 6 article pages must be processed");
if (apply.summary.expected_reference_count !== 24) fail("Expected Batch 6 reference count must be 24");
if (apply.summary.inserted_reference_count !== 24) fail("Inserted Batch 6 reference count must be 24");
if (apply.summary.articles_with_two_ag03c_b6_reference_links !== 12) fail("Every Batch 6 article must have two AG03C-B6 links");
if (!apply.summary.every_article_has_one_ag03c_b6_block) fail("Each Batch 6 article must have one AG03C-B6 reference block");
if (!apply.summary.every_article_has_checked_marker) fail("Each Batch 6 article must have AG03C-B6 checked marker");
if (!apply.summary.every_article_matches_approval_urls) fail("Inserted URLs must match AG03B-B6-R1 approval");
if (!apply.summary.every_article_preserves_ag02_hero) fail("AG02 hero must be preserved wherever it existed before AG03C-B6");
if (!apply.summary.every_article_preserves_ag02_credit) fail("AG02 image credit must be preserved wherever it existed before AG03C-B6");
if (apply.summary.non_batch_article_mutation_performed !== false) fail("Non-batch mutation must remain false");

const approvalByPath = new Map(approval.entries.map((entry) => [entry.article_path, entry]));

for (const row of apply.file_results) {
  const approved = approvalByPath.get(row.article_path);
  if (!approved) fail(`Processed article not found in approval record: ${row.article_path}`);

  const htmlPath = path.join(root, row.article_path);
  if (!fs.existsSync(htmlPath)) fail(`Article missing: ${row.article_path}`);
  const html = fs.readFileSync(htmlPath, "utf8");

  if (!html.includes('data-drishvara-ag03c-b6-reference-block="true"')) fail(`AG03C-B6 block missing: ${row.article_path}`);
  if (!html.includes('data-drishvara-ag03c-b6-checked="true"')) fail(`AG03C-B6 checked marker missing: ${row.article_path}`);

  const linkCount = (html.match(/data-drishvara-ag03c-b6-reference-link="true"/g) || []).length;
  if (linkCount !== 2) fail(`AG03C-B6 link count must be 2: ${row.article_path}`);

  for (const ref of approved.references) {
    if (!html.includes(ref.url)) fail(`Approved URL missing in article: ${row.article_path} -> ${ref.url}`);
  }

  if (row.before_ag02_hero_present && !html.includes('data-drishvara-ag02-hero-visual="true"')) {
    fail(`AG02 hero missing after AG03C-B6 where it existed before: ${row.article_path}`);
  }

  if (row.before_ag02_credit_present && !html.includes('data-drishvara-ag02-image-credit="true"')) {
    fail(`AG02 credit missing after AG03C-B6 where it existed before: ${row.article_path}`);
  }

  if (row.ag02_hero_preserved !== true) fail(`AG02 hero preservation flag failed: ${row.article_path}`);
  if (row.ag02_credit_preserved !== true) fail(`AG02 credit preservation flag failed: ${row.article_path}`);
}

for (const falseField of [
  "article_text_mutation_performed",
  "article_image_mutation_performed",
  "image_credit_mutation_performed",
  "reference_url_change_performed",
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
  if (apply[falseField] !== false) fail(`${falseField} must be false`);
}

if (apply.article_html_mutation_performed !== true) fail("Article HTML mutation must be true for AG03C-B6");
if (apply.new_reference_insertion_performed !== true) fail("New reference insertion must be true for AG03C-B6");

for (const flag of [
  "article_text_mutation_enabled",
  "article_image_mutation_enabled",
  "image_credit_mutation_enabled",
  "reference_url_change_enabled",
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

if (config.article_html_mutation_enabled !== true) fail("AG03C-B6 must enable article HTML mutation");
if (config.new_reference_insertion_enabled !== true) fail("AG03C-B6 must enable new reference insertion");

for (const scriptName of ["apply:ag03c-b6", "validate:ag03c-b6", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG03C-B6 document missing phrase: ${phrase}`);
}

pass("AG03C-B6 registry is present.");
pass("AG03C-B6 document is present.");
pass("AG03C-B6 apply result and preview outputs are present.");
pass("Exactly 12 Batch 6 article pages are processed.");
pass("Exactly 24 approved Batch 6 reference links are inserted.");
pass("Each processed article has exactly two AG03C-B6 reference links.");
pass("Inserted URLs match AG03B-B6-R1 approval record.");
pass("AG02 hero and image-credit blocks are preserved wherever they existed before AG03C-B6.");
pass("No article text/image/credit mutation beyond approved reference insertion is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG03C-B6 reference insertion is safe to commit.");
