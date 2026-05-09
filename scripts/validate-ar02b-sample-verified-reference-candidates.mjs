import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ar02b-sample-verified-reference-candidates.json");
const docPath = path.join(root, "docs", "quality", "AR02B_SAMPLE_VERIFIED_REFERENCE_CANDIDATES.md");
const workbenchPath = path.join(root, "data", "editorial", "verified-reference-selection-workbench.json");
const sampleRegistryPath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const previewPath = path.join(root, "data", "quality", "ar02b-sample-verified-reference-candidates-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AR02B validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, workbenchPath, sampleRegistryPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing AR02B required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const workbench = JSON.parse(fs.readFileSync(workbenchPath, "utf8"));
const sample = JSON.parse(fs.readFileSync(sampleRegistryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AR02B") fail("Registry module_id must be AR02B");
if (sample.module_id !== "AR02B") fail("Sample registry module_id must be AR02B");
if (preview.module_id !== "AR02B") fail("Preview module_id must be AR02B");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (sample.sample_article_count !== 5) fail("Exactly five sample articles must be populated");
if (sample.populated_candidate_url_count !== 10) fail("Exactly ten candidate URLs must be populated");
if (sample.accepted_reference_count !== 10) fail("Exactly ten accepted references must be recorded");

if (!preview.summary.exactly_five_articles_populated) fail("Preview must confirm five populated articles");
if (!preview.summary.exactly_ten_candidate_urls_populated) fail("Preview must confirm ten populated URLs");
if (!preview.summary.all_sample_articles_have_two_accepted_references) fail("Each sample article must have two accepted references");
if (!preview.summary.all_sample_urls_https) fail("All sample URLs must be HTTPS");

for (const entry of sample.entries) {
  if (!registry.sample_articles.includes(entry.article_path)) {
    fail(`Unexpected sample article: ${entry.article_path}`);
  }
  if (entry.accepted_reference_count !== 2) {
    fail(`Sample article must have two accepted references: ${entry.article_path}`);
  }
  if (!Array.isArray(entry.references) || entry.references.length !== 2) {
    fail(`Sample article must have two reference entries: ${entry.article_path}`);
  }
  for (const reference of entry.references) {
    if (!reference.url || !reference.url.startsWith("https://")) {
      fail(`Reference URL must be HTTPS: ${entry.article_path}`);
    }
    if (reference.decision !== "accepted") {
      fail(`Reference decision must be accepted: ${entry.article_path}`);
    }
  }
}

for (const articlePath of registry.sample_articles) {
  const entry = workbench.entries.find((item) => item.article_path === articlePath);
  if (!entry) fail(`Sample article missing from workbench: ${articlePath}`);
  if (entry.current_verified_reference_count !== 2) fail(`Workbench sample article must have verified count 2: ${articlePath}`);
  if (entry.final_reference_decision.ready_for_article_insertion !== true) {
    fail(`Sample article must be ready for later insertion: ${articlePath}`);
  }
  for (const candidate of entry.candidate_references) {
    if (!candidate.candidate_url) fail(`Workbench candidate URL missing: ${articlePath}`);
    if (candidate.decision.editorial_decision !== "accepted") fail(`Workbench candidate decision must be accepted: ${articlePath}`);
    if (candidate.decision.accepted_for_article !== true) fail(`Workbench candidate must be accepted: ${articlePath}`);
  }
}

const nonSampleEntries = workbench.entries.filter((entry) => !registry.sample_articles.includes(entry.article_path));
for (const entry of nonSampleEntries) {
  if (entry.current_verified_reference_count !== 0) {
    fail(`Non-sample article must remain unverified: ${entry.article_path}`);
  }
  if (entry.final_reference_decision.ready_for_article_insertion !== false) {
    fail(`Non-sample article cannot be ready for insertion: ${entry.article_path}`);
  }
}

for (const flag of [
  "article_html_mutation_enabled",
  "article_page_reference_replacement_enabled",
  "external_fetch_enabled",
  "automated_external_link_verification_performed",
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

for (const falseField of [
  "article_html_mutation_performed",
  "automated_external_fetch_performed",
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
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

for (const scriptName of ["generate:ar02b", "validate:ar02b", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AR02B document missing phrase: ${phrase}`);
}

pass("AR02B registry is present.");
pass("AR02B document is present.");
pass("AR02B sample registry and preview are present.");
pass("Exactly five sample articles are populated.");
pass("Exactly ten candidate URLs are populated.");
pass("Each sample article has two accepted references.");
pass("Non-sample articles remain pending.");
pass("Article HTML mutation remains disabled.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AR02B is sample verified-reference candidate population and safe to commit.");
