import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag03a-verified-reference-scaling-readiness-queue.json");
const docPath = path.join(root, "docs", "quality", "AG03A_VERIFIED_REFERENCE_SCALING_READINESS_QUEUE.md");
const queuePath = path.join(root, "data", "editorial", "ag03a-verified-reference-scaling-readiness-queue.json");
const previewPath = path.join(root, "data", "quality", "ag03a-verified-reference-scaling-readiness-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG03A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, queuePath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG03A required file: ${p}`);
}

const registry = readJson(registryPath);
const queue = readJson(queuePath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AG03A") fail("Registry module_id must be AG03A");
if (queue.module_id !== "AG03A") fail("Queue module_id must be AG03A");
if (preview.module_id !== "AG03A") fail("Preview module_id must be AG03A");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (queue.summary.queue_entry_count !== queue.summary.total_missing_reference_articles_from_ag01r1) {
  fail("Queue count must match AG01R1 missing-reference count");
}

if (queue.summary.sample_article_count_in_missing_queue !== 0) {
  fail("AR02B sample articles should not remain in missing-reference queue");
}

if (queue.summary.non_sample_reference_scaling_queue_count !== queue.summary.queue_entry_count) {
  fail("All AG03A queue entries should be non-sample reference-scaling articles");
}

if (queue.summary.batch_count < 1) fail("At least one batch must be created");
if (queue.summary.first_batch_article_count < 1) fail("First batch must contain at least one article");

for (const entry of queue.entries) {
  if (!entry.article_path || !entry.article_path.startsWith("articles/")) fail("Each entry must have article path");
  if (entry.ar02b_sample_article !== false) fail(`Sample article incorrectly queued: ${entry.article_path}`);
  if (entry.current_public_verified_reference_count >= entry.required_verified_reference_count) {
    fail(`Article already has required public references: ${entry.article_path}`);
  }
  if (entry.queue_status !== "pending_candidate_population") fail(`Queue entry must remain pending: ${entry.article_path}`);
  if (entry.candidate_population_allowed_in_ag03a !== false) fail(`Candidate population must be blocked in AG03A: ${entry.article_path}`);
  if (entry.reference_insertion_allowed_in_ag03a !== false) fail(`Reference insertion must be blocked in AG03A: ${entry.article_path}`);
  if (entry.external_fetch_allowed_in_ag03a !== false) fail(`External fetch must be blocked in AG03A: ${entry.article_path}`);
}

for (const batch of queue.batches) {
  if (!batch.batch_id || !Array.isArray(batch.article_paths)) fail("Each batch must have id and article paths");
  if (batch.article_count !== batch.article_paths.length) fail(`Batch count mismatch: ${batch.batch_id}`);
  if (batch.candidate_population_status !== "pending") fail(`Batch must remain pending: ${batch.batch_id}`);
  if (batch.reference_insertion_status !== "not_allowed_in_ag03a") fail(`Reference insertion must be blocked: ${batch.batch_id}`);
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
  "external_fetch_performed",
  "external_link_verification_performed",
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
  if (queue[falseField] !== false) fail(`${falseField} must be false`);
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
  "external_fetch_enabled",
  "external_link_verification_enabled",
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

for (const scriptName of ["generate:ag03a", "validate:ag03a", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria", "Recommended Follow-up"]) {
  if (!docText.includes(phrase)) fail(`AG03A document missing phrase: ${phrase}`);
}

pass("AG03A registry is present.");
pass("AG03A document is present.");
pass("AG03A queue and preview outputs are present.");
pass("Queue count matches AG01R1 missing-reference count.");
pass("AR02B sample articles are excluded from remaining reference-scaling queue.");
pass("Deterministic batches are created.");
pass("All queue entries remain pending candidate population.");
pass("No candidate URLs are populated and no reference links are inserted.");
pass("No article/page/content/image mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG03A is verified-reference scaling readiness queue only and safe to commit.");
