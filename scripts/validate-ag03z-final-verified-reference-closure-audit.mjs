import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag03z-final-verified-reference-closure-audit.json");
const docPath = path.join(root, "docs", "quality", "AG03Z_FINAL_VERIFIED_REFERENCE_CLOSURE_AUDIT.md");
const auditPath = path.join(root, "data", "editorial", "ag03z-final-verified-reference-closure-audit.json");
const previewPath = path.join(root, "data", "quality", "ag03z-final-verified-reference-closure-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG03Z validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, auditPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG03Z required file: ${p}`);
}

const config = readJson(registryPath);
const audit = readJson(auditPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG03Z") fail("Registry module_id must be AG03Z");
if (audit.module_id !== "AG03Z") fail("Audit module_id must be AG03Z");
if (preview.module_id !== "AG03Z") fail("Preview module_id must be AG03Z");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (audit.summary.ag03a_queue_entry_count !== config.expected.ag03a_queue_entry_count) fail("AG03A queue must contain 72 entries");
if (audit.summary.completed_article_count_from_ag03d_b6 !== config.expected.completed_article_count) fail("AG03D-B6 completed article count must be 72");
if (audit.summary.live_scanned_completed_article_count !== config.expected.completed_article_count) fail("Live scanned article count must be 72");
if (audit.summary.articles_with_exactly_two_ag03_reference_links !== config.expected.completed_article_count) fail("Every completed article must have exactly two AG03 reference links");
if (audit.summary.live_ag03_reference_link_count !== config.expected.completed_reference_count) fail("Live AG03 reference link count must be 144");
if (audit.summary.expected_ag03_reference_link_count !== config.expected.completed_reference_count) fail("Expected AG03 reference count must be 144");
if (audit.summary.missing_queue_entries_after_closure !== 0) fail("No AG03A queue entries may remain missing after closure");
if (audit.summary.ag03d_b6_remaining_reference_queue_count !== 0) fail("AG03D-B6 remaining queue must be 0");
if (audit.summary.ag03_reference_scaling_closed !== true) fail("AG03 reference scaling must be closed");
if (audit.summary.next_reference_action_required !== false) fail("No next reference action should be required");

if (!Array.isArray(audit.article_scan_results)) fail("Article scan results must be an array");
if (audit.article_scan_results.length !== 72) fail("Article scan results must contain 72 articles");

for (const row of audit.article_scan_results) {
  if (!row.article_path || !row.article_path.startsWith("articles/")) fail("Invalid article path in scan results");
  if (row.ag03_reference_link_count !== 2) fail(`Article must have exactly two AG03 reference links: ${row.article_path}`);
  if (row.has_exactly_two_ag03_reference_links !== true) fail(`Exact reference-link flag failed: ${row.article_path}`);
  if (row.scan_status !== "passed") fail(`Article scan did not pass: ${row.article_path}`);
}

if (!Array.isArray(audit.missing_queue_entries_after_closure)) fail("Missing queue entries must be an array");
if (audit.missing_queue_entries_after_closure.length !== 0) fail("Missing queue entries array must be empty");

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

for (const scriptName of ["generate:ag03z", "validate:ag03z", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG03Z document missing phrase: ${phrase}`);
}

pass("AG03Z registry is present.");
pass("AG03Z document is present.");
pass("AG03Z closure audit and preview outputs are present.");
pass("AG03A queue contains 72 entries.");
pass("AG03D-B6 reports 72 completed articles and 144 completed references.");
pass("Live scan confirms 72 completed article pages.");
pass("Live scan confirms 144 AG03 reference links.");
pass("Every completed article has exactly two AG03 reference links.");
pass("Remaining AG03A reference queue is 0.");
pass("No article/page/content/image/reference mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG03 verified-reference scaling is closed.");
