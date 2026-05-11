import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag03d-b2-post-ag03c-b2-reference-insertion-audit.json");
const docPath = path.join(root, "docs", "quality", "AG03D_B2_POST_AG03C_B2_REFERENCE_INSERTION_AUDIT.md");
const auditPath = path.join(root, "data", "editorial", "ag03d-b2-post-ag03c-b2-reference-insertion-audit.json");
const previewPath = path.join(root, "data", "quality", "ag03d-b2-post-ag03c-b2-reference-insertion-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG03D-B2 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, auditPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG03D-B2 required file: ${p}`);
}

const config = readJson(registryPath);
const audit = readJson(auditPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG03D-B2") fail("Registry module_id must be AG03D-B2");
if (audit.module_id !== "AG03D-B2") fail("Audit module_id must be AG03D-B2");
if (preview.module_id !== "AG03D-B2") fail("Preview module_id must be AG03D-B2");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (audit.summary.audited_batch_2_article_count !== config.expected.batch_2_article_count) fail("Exactly 12 Batch 2 articles must be audited");
if (audit.summary.confirmed_ag03c_b2_reference_link_count !== config.expected.batch_2_reference_count) fail("Exactly 24 AG03C-B2 links must be confirmed");
if (audit.summary.entries_with_two_ag03c_b2_links !== config.expected.batch_2_article_count) fail("Each Batch 2 article must have two AG03C-B2 links");
if (audit.summary.entries_with_one_ag03c_b2_block !== config.expected.batch_2_article_count) fail("Each Batch 2 article must have one AG03C-B2 block");
if (audit.summary.entries_with_all_approved_urls !== config.expected.batch_2_article_count) fail("All approved URLs must be present");
if (audit.summary.entries_with_ag03c_b2_checked_marker !== config.expected.batch_2_article_count) fail("Each Batch 2 article must have AG03C-B2 checked marker");
if (audit.summary.ag03c_b2_apply_and_live_scan_reconcile !== true) fail("AG03C-B2 apply result and live scan must reconcile");
if (audit.summary.completed_total_article_count_after_batch_2 !== config.expected.completed_total_article_count_after_batch_2) fail("Completed total after Batch 2 must be 24 articles");
if (audit.summary.confirmed_ag03c_b2_reference_link_count !== 24) fail("Batch 2 confirmed link count must be 24");
if (audit.summary.remaining_reference_queue_count !== config.expected.remaining_queue_after_batch_2) fail("Remaining queue count must be 48");
if (audit.summary.next_batch_id !== config.expected.next_batch_id) fail("Next batch id must be AG03B_BATCH_03");
if (audit.summary.next_batch_found !== true) fail("Next batch must be found");
if (audit.summary.next_batch_article_count !== 12) fail("Next batch must contain 12 articles");
if (audit.summary.ready_for_ag03b_batch_3 !== true) fail("AG03D-B2 must authorize AG03B Batch 3");

for (const entry of audit.completed_batch_2_articles) {
  if (!entry.article_path || !entry.article_path.startsWith("articles/")) fail("Invalid completed article path");
  if (entry.ag03c_b2_reference_link_count !== 2) fail(`AG03C-B2 link count not 2: ${entry.article_path}`);
  if (entry.ag03c_b2_reference_block_count !== 1) fail(`AG03C-B2 block count not 1: ${entry.article_path}`);
  if (entry.found_approved_url_count !== 2) fail(`Approved URL count not 2: ${entry.article_path}`);
  if (entry.approved_urls_match_live_article !== true) fail(`Approved URLs do not match: ${entry.article_path}`);
  if (entry.ag03c_b2_checked_present !== true) fail(`AG03C-B2 checked marker missing: ${entry.article_path}`);
}

for (const falseField of [
  "mutation_performed",
  "article_html_mutation_performed",
  "article_text_mutation_performed",
  "article_image_mutation_performed",
  "image_credit_mutation_performed",
  "reference_url_change_performed",
  "new_reference_insertion_performed",
  "reference_candidate_population_performed",
  "reference_approval_performed",
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
  "new_reference_insertion_enabled",
  "reference_candidate_population_enabled",
  "reference_approval_enabled",
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

for (const scriptName of ["generate:ag03d-b2", "validate:ag03d-b2", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG03D-B2 document missing phrase: ${phrase}`);
}

pass("AG03D-B2 registry is present.");
pass("AG03D-B2 document is present.");
pass("AG03D-B2 audit and preview outputs are present.");
pass("Exactly 12 Batch 2 article pages are audited.");
pass("Exactly 24 AG03C-B2 reference links are confirmed.");
pass("All approved URLs match live article pages.");
pass("AG03C-B2 apply result and live article scan reconcile.");
pass("Remaining AG03A reference queue is refreshed to 48.");
pass("AG03B Batch 3 is identified as the next controlled candidate-population stage.");
pass("No article/page/content/image/reference mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG03D-B2 post-insertion audit is safe to commit.");
