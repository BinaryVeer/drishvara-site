import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag03d-b6-post-ag03c-b6-reference-insertion-audit.json");
const docPath = path.join(root, "docs", "quality", "AG03D_B6_POST_AG03C_B6_REFERENCE_INSERTION_AUDIT.md");
const auditPath = path.join(root, "data", "editorial", "ag03d-b6-post-ag03c-b6-reference-insertion-audit.json");
const previewPath = path.join(root, "data", "quality", "ag03d-b6-post-ag03c-b6-reference-insertion-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG03D-B6 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, auditPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG03D-B6 required file: ${p}`);
}

const config = readJson(registryPath);
const audit = readJson(auditPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG03D-B6") fail("Registry module_id must be AG03D-B6");
if (audit.module_id !== "AG03D-B6") fail("Audit module_id must be AG03D-B6");
if (preview.module_id !== "AG03D-B6") fail("Preview module_id must be AG03D-B6");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (audit.summary.audited_batch_6_article_count !== config.expected.batch_6_article_count) fail("Exactly 12 Batch 6 articles must be audited");
if (audit.summary.confirmed_ag03c_b6_reference_link_count !== config.expected.batch_6_reference_count) fail("Exactly 24 AG03C-B6 links must be confirmed");
if (audit.summary.entries_with_two_ag03c_b6_links !== config.expected.batch_6_article_count) fail("Each Batch 6 article must have two AG03C-B6 links");
if (audit.summary.entries_with_one_ag03c_b6_block !== config.expected.batch_6_article_count) fail("Each Batch 6 article must have one AG03C-B6 block");
if (audit.summary.entries_with_all_approved_urls !== config.expected.batch_6_article_count) fail("All approved URLs must be present");
if (audit.summary.entries_with_ag03c_b6_checked_marker !== config.expected.batch_6_article_count) fail("Each Batch 6 article must have AG03C-B6 checked marker");
if (audit.summary.ag03c_b6_apply_and_live_scan_reconcile !== true) fail("AG03C-B6 apply result and live scan must reconcile");
if (audit.summary.completed_total_article_count_after_batch_6 !== config.expected.completed_total_article_count_after_batch_6) fail("Completed total after Batch 6 must be 72 articles");
if (audit.summary.completed_total_reference_count_after_batch_6 !== config.expected.completed_total_reference_count_after_batch_6) fail("Completed total references after Batch 6 must be 144");
if (audit.summary.remaining_reference_queue_count !== config.expected.remaining_queue_after_batch_6) fail("Remaining queue count must be 0");
if (audit.summary.ag03_reference_scaling_closed !== true) fail("AG03 reference scaling must be closed");
if (audit.summary.ready_for_final_ag03_closure_audit !== true) fail("AG03D-B6 must authorize final AG03 closure audit");
if (audit.summary.next_stage_id !== "AG03Z") fail("Next stage must be AG03Z");

for (const entry of audit.completed_batch_6_articles) {
  if (!entry.article_path || !entry.article_path.startsWith("articles/")) fail("Invalid completed article path");
  if (entry.ag03c_b6_reference_link_count !== 2) fail(`AG03C-B6 link count not 2: ${entry.article_path}`);
  if (entry.ag03c_b6_reference_block_count !== 1) fail(`AG03C-B6 block count not 1: ${entry.article_path}`);
  if (entry.found_approved_url_count !== 2) fail(`Approved URL count not 2: ${entry.article_path}`);
  if (entry.approved_urls_match_live_article !== true) fail(`Approved URLs do not match: ${entry.article_path}`);
  if (entry.ag03c_b6_checked_present !== true) fail(`AG03C-B6 checked marker missing: ${entry.article_path}`);
}

if (!Array.isArray(audit.remaining_reference_queue_after_batch_6)) fail("Remaining queue must be an array");
if (audit.remaining_reference_queue_after_batch_6.length !== 0) fail("Remaining queue array must be empty");
if (!Array.isArray(audit.completed_reference_scaling_articles_after_batch_6)) fail("Completed list must be an array");
if (audit.completed_reference_scaling_articles_after_batch_6.length !== 72) fail("Completed list must contain 72 articles");

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

for (const scriptName of ["generate:ag03d-b6", "validate:ag03d-b6", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG03D-B6 document missing phrase: ${phrase}`);
}

pass("AG03D-B6 registry is present.");
pass("AG03D-B6 document is present.");
pass("AG03D-B6 audit and preview outputs are present.");
pass("Exactly 12 Batch 6 article pages are audited.");
pass("Exactly 24 AG03C-B6 reference links are confirmed.");
pass("All approved URLs match live article pages.");
pass("AG03C-B6 apply result and live article scan reconcile.");
pass("Completed AG03 article count is 72.");
pass("Completed AG03 reference count is 144.");
pass("Remaining AG03A reference queue is refreshed to 0.");
pass("AG03Z final closure audit is identified as the next stage.");
pass("No article/page/content/image/reference mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG03D-B6 final batch audit is safe to commit.");
