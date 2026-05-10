import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag03b-r1-batch-01-reference-candidate-review-approval.json");
const docPath = path.join(root, "docs", "quality", "AG03B_R1_BATCH_01_REFERENCE_CANDIDATE_REVIEW_APPROVAL.md");
const approvalPath = path.join(root, "data", "editorial", "ag03b-r1-batch-01-reference-candidate-approval-record.json");
const previewPath = path.join(root, "data", "quality", "ag03b-r1-batch-01-reference-candidate-approval-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG03B-R1 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, approvalPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG03B-R1 required file: ${p}`);
}

const config = readJson(registryPath);
const approval = readJson(approvalPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG03B-R1") fail("Registry module_id must be AG03B-R1");
if (approval.module_id !== "AG03B-R1") fail("Approval record module_id must be AG03B-R1");
if (preview.module_id !== "AG03B-R1") fail("Preview module_id must be AG03B-R1");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (approval.summary.approved_article_count !== config.approval_policy.required_articles) fail("Exactly 12 articles must be approved");
if (approval.summary.approved_reference_count !== config.approval_policy.required_articles * config.approval_policy.required_references_per_article) fail("Exactly 24 references must be approved");
if (approval.summary.entries_with_two_approved_references !== config.approval_policy.required_articles) fail("Every article must have two approved references");
if (approval.summary.ready_for_ag03c !== true) fail("AG03B-R1 must be ready for AG03C");
if (approval.summary.article_reference_insertion_performed !== false) fail("Article reference insertion must remain false");

for (const entry of approval.entries) {
  if (entry.approved_for_ag03c_insertion !== true) fail(`Entry not approved: ${entry.article_path}`);
  if (entry.references.length !== 2) fail(`Entry must have exactly two approved references: ${entry.article_path}`);
  if (entry.article_insertion_status !== "not_inserted_in_ag03b_r1") fail(`Entry insertion status invalid: ${entry.article_path}`);
  for (const ref of entry.references) {
    if (!/^https:\/\//.test(ref.url)) fail(`Approved URL must be HTTPS: ${entry.article_path}`);
    if (ref.approval_status !== "approved_for_ag03c_insertion") fail(`Reference approval status invalid: ${entry.article_path}`);
    if (ref.article_insertion_status !== "not_inserted_in_ag03b_r1") fail(`Reference insertion status invalid: ${entry.article_path}`);
  }
}

for (const falseField of [
  "mutation_performed",
  "article_html_mutation_performed",
  "article_text_mutation_performed",
  "article_image_mutation_performed",
  "image_credit_mutation_performed",
  "reference_url_change_performed",
  "new_reference_insertion_performed",
  "article_reference_insertion_performed",
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
  if (approval[falseField] !== false) fail(`${falseField} must be false`);
}

if (approval.reference_approval_performed !== true) fail("Reference approval must be true");

for (const flag of [
  "article_html_mutation_enabled",
  "article_text_mutation_enabled",
  "article_image_mutation_enabled",
  "image_credit_mutation_enabled",
  "reference_url_change_enabled",
  "new_reference_insertion_enabled",
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

if (config.reference_approval_enabled !== true) fail("Reference approval flag must be true");

for (const scriptName of ["generate:ag03b-r1", "validate:ag03b-r1", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG03B-R1 document missing phrase: ${phrase}`);
}

pass("AG03B-R1 registry is present.");
pass("AG03B-R1 document is present.");
pass("AG03B-R1 approval record and preview outputs are present.");
pass("Exactly 12 articles and 24 references are approved for AG03C.");
pass("Each article has exactly two approved references.");
pass("No article HTML mutation or reference insertion is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG03B-R1 approval record is safe to commit.");
