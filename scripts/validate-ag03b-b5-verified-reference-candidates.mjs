import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag03b-b5-verified-reference-candidate-population.json");
const docPath = path.join(root, "docs", "quality", "AG03B_B5_VERIFIED_REFERENCE_CANDIDATE_POPULATION.md");
const candidatePath = path.join(root, "data", "editorial", "ag03b-b5-verified-reference-candidates.json");
const previewPath = path.join(root, "data", "quality", "ag03b-b5-verified-reference-candidates-preview.json");
const ag03aPath = path.join(root, "data", "editorial", "ag03a-verified-reference-scaling-readiness-queue.json");
const ag03dB3Path = path.join(root, "data", "editorial", "ag03d-b4-post-ag03c-b4-reference-insertion-audit.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG03B-B5 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, candidatePath, previewPath, ag03aPath, ag03dB3Path, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG03B-B5 required file: ${p}`);
}

const config = readJson(registryPath);
const candidates = readJson(candidatePath);
const preview = readJson(previewPath);
const ag03a = readJson(ag03aPath);
const ag03dB3 = readJson(ag03dB3Path);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG03B-B5") fail("Registry module_id must be AG03B-B5");
if (candidates.module_id !== "AG03B-B5") fail("Candidate registry module_id must be AG03B-B5");
if (preview.module_id !== "AG03B-B5") fail("Preview module_id must be AG03B-B5");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (ag03dB3.summary?.ready_for_ag03b_batch_5 !== true) fail("AG03D-B4 must authorize Batch 5");

const batch = ag03a.batches.find((b) => b.batch_id === config.target_batch_id);
if (!batch) fail("AG03A target Batch 5 must exist");

if (candidates.summary.batch_article_count !== config.required_articles) fail("AG03B-B5 must populate exactly required batch articles");
if (candidates.summary.batch_article_count !== batch.article_count) fail("AG03B-B5 article count must match AG03A Batch 5 count");
if (candidates.summary.total_candidate_reference_count !== config.required_articles * config.required_references_per_article) {
  fail("AG03B-B5 must record exactly 24 candidate references");
}
if (candidates.summary.entries_with_two_candidates !== config.required_articles) fail("Every article must have two candidates");
if (candidates.summary.approved_for_article_insertion_count !== 0) fail("No article insertion approval in AG03B-B5");
if (candidates.summary.article_reference_insertion_performed !== false) fail("Article insertion must remain false");

for (const entry of candidates.entries) {
  if (!batch.article_paths.includes(entry.article_path)) fail(`Entry is not in AG03A Batch 5: ${entry.article_path}`);
  if (entry.candidate_reference_count !== 2) fail(`Entry must have exactly two references: ${entry.article_path}`);
  if (entry.approved_for_article_insertion !== false) fail(`Entry must remain unapproved for insertion: ${entry.article_path}`);
  if (entry.article_insertion_status !== "not_inserted_in_ag03b_b5") fail(`Entry insertion status invalid: ${entry.article_path}`);

  const urls = entry.references.map((ref) => ref.url);
  if (new Set(urls).size !== urls.length) fail(`Duplicate URL within article: ${entry.article_path}`);

  for (const ref of entry.references) {
    if (!/^https:\/\//.test(ref.url)) fail(`Reference URL must be HTTPS: ${entry.article_path}`);
    if (!ref.title || !ref.publisher || !ref.source_domain) fail(`Reference metadata incomplete: ${entry.article_path}`);
    if (ref.verification_status !== "verified_candidate_pending_article_insertion") fail(`Invalid verification status: ${entry.article_path}`);
    if (ref.article_insertion_status !== "not_inserted_in_ag03b_b5") fail(`Reference insertion status invalid: ${entry.article_path}`);
    if (ref.duplicate_within_article_check !== "unique_within_article") fail(`Duplicate check missing: ${entry.article_path}`);
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
  "reference_approval_performed",
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
  if (candidates[falseField] !== false) fail(`${falseField} must be false`);
}

if (candidates.reference_candidate_population_performed !== true) fail("Reference candidate population must be true for AG03B-B5");
if (candidates.operator_external_research_used !== true) fail("Operator external research must be recorded");

for (const flag of [
  "article_html_mutation_enabled",
  "article_text_mutation_enabled",
  "article_image_mutation_enabled",
  "image_credit_mutation_enabled",
  "reference_url_change_enabled",
  "new_reference_insertion_enabled",
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

if (config.reference_candidate_population_enabled !== true) fail("AG03B-B5 candidate population flag must be true");
if (config.operator_external_research_used !== true) fail("AG03B-B5 must record operator external research");

for (const scriptName of ["generate:ag03b-b5", "validate:ag03b-b5", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Source Selection Rule", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG03B-B5 document missing phrase: ${phrase}`);
}

pass("AG03B-B5 registry is present.");
pass("AG03B-B5 document is present.");
pass("AG03B-B5 candidate registry and preview outputs are present.");
pass("AG03D-B4 authorization for Batch 5 is verified.");
pass("Exactly 12 Batch 5 articles are populated.");
pass("Exactly 24 candidate reference URLs are recorded.");
pass("Each article has exactly two unique candidate references.");
pass("All candidates remain pending article insertion.");
pass("No article HTML mutation or reference insertion is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG03B-B5 candidate population is safe to commit.");
