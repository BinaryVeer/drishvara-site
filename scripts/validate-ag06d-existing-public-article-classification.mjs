import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag06d-existing-public-article-classification.json");
const docPath = path.join(root, "docs", "quality", "AG06D_EXISTING_PUBLIC_ARTICLE_CLASSIFICATION.md");
const registerPath = path.join(root, "data", "content-intelligence", "quality-reviews", "public-article-classification-register.json");
const previewPath = path.join(root, "data", "quality", "ag06d-existing-public-article-classification-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG06D validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, registerPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG06D required file: ${p}`);
}

const config = readJson(registryPath);
const register = readJson(registerPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG06D") fail("Registry module_id must be AG06D");
if (register.module_id !== "AG06D") fail("Register module_id must be AG06D");
if (preview.module_id !== "AG06D") fail("Preview module_id must be AG06D");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (register.summary.classified_public_article_count !== register.summary.source_public_article_count_from_ag06a) fail("All AG06A public articles must be classified");
if (register.summary.test_corpus_retention_candidate_count !== register.summary.classified_public_article_count) fail("All current public articles must be retained as test corpus candidates");
if (register.summary.reference_governance_candidate_count !== register.summary.expected_reference_governance_candidate_count_from_ag06a) fail("Reference governance candidate count must match AG06A unguided count");
if (register.summary.long_form_upgrade_candidate_count !== register.summary.classified_public_article_count) fail("All current public articles should be long-form upgrade candidates");
if (register.summary.visual_enrichment_candidate_count !== register.summary.classified_public_article_count) fail("All current public articles should be visual enrichment candidates");
if (register.summary.final_public_product_ready_count !== 0) fail("No current public article should be final Drishvara product-ready");
if (register.summary.archive_or_delete_recommended_count !== 0) fail("AG06D must not recommend archive/delete");
if (register.summary.public_article_mutation_performed !== false) fail("Public article mutation must be false");
if (register.summary.reference_url_change_performed !== false) fail("Reference URL change must be false");
if (register.summary.backend_auth_supabase_activation_performed !== false) fail("Backend/Auth/Supabase activation must be false");
if (register.summary.classification_register_only !== true) fail("AG06D must be classification-register-only");
if (register.summary.ready_for_ag06e_long_form_article_standard !== true) fail("AG06E readiness must be true");
if (register.summary.next_stage_id !== "AG06E") fail("Next stage must be AG06E");

if (!Array.isArray(register.public_article_classifications)) fail("Public article classifications must be an array");
if (register.public_article_classifications.length !== register.summary.classified_public_article_count) fail("Classification array count mismatch");

for (const row of register.public_article_classifications) {
  if (!row.article_path) fail("Classification row missing article_path");
  if (!Array.isArray(row.classification_tags)) fail(`Classification tags missing: ${row.article_path}`);
  if (!row.classification_tags.includes("test_corpus_retention_candidate")) fail(`Missing test corpus tag: ${row.article_path}`);
  if (!row.classification_tags.includes("long_form_upgrade_candidate")) fail(`Missing long-form upgrade tag: ${row.article_path}`);
  if (!row.classification_tags.includes("visual_enrichment_candidate")) fail(`Missing visual enrichment tag: ${row.article_path}`);
  if (row.final_public_product_ready !== false) fail(`Article should not be final-ready: ${row.article_path}`);
  if (row.public_article_mutation_performed !== false) fail(`Mutation flag must be false: ${row.article_path}`);
  if (row.archive_or_delete_recommended_by_ag06d !== false) fail(`Archive/delete recommendation must be false: ${row.article_path}`);
}

for (const falseField of [
  "mutation_performed",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "homepage_mutation_performed",
  "css_mutation_performed",
  "javascript_mutation_performed",
  "reference_url_change_performed",
  "external_fetch_performed_by_script",
  "live_url_fetch_performed",
  "backend_activation_performed",
  "api_route_created",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "frontend_deployment_performed",
  "public_article_archive_performed",
  "public_article_delete_performed",
  "file_deletion_performed",
  "file_move_performed"
]) {
  if (register[falseField] !== false) fail(`${falseField} must be false`);
}

for (const flag of [
  "article_html_mutation_enabled",
  "homepage_mutation_enabled",
  "css_mutation_enabled",
  "javascript_mutation_enabled",
  "reference_url_change_enabled",
  "external_fetch_enabled_by_script",
  "live_url_fetch_enabled",
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
  "file_move_enabled",
  "public_article_mutation_enabled",
  "public_article_archive_enabled",
  "public_article_delete_enabled"
]) {
  if (config[flag] !== false) fail(`${flag} must remain false`);
}

for (const scriptName of ["generate:ag06d", "validate:ag06d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG06D document missing phrase: ${phrase}`);
}

pass("AG06D registry is present.");
pass("AG06D document is present.");
pass("AG06D classification register and preview are present.");
pass("All AG06A public articles are classified.");
pass("All current public articles are retained as test corpus candidates.");
pass("All 5 unguided public articles are marked as reference-governance candidates.");
pass("All current public articles are marked as long-form upgrade candidates.");
pass("All current public articles are marked as visual enrichment candidates.");
pass("No current public article is treated as final Drishvara-quality content.");
pass("No archive/delete/public mutation is performed or recommended.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG06E Long-Form Article Standard is identified as next.");
