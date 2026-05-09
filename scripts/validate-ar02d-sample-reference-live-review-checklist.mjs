import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ar02d-sample-reference-live-review-checklist.json");
const docPath = path.join(root, "docs", "quality", "AR02D_SAMPLE_REFERENCE_LIVE_REVIEW_CHECKLIST.md");
const sampleRegistryPath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const ar02cPreviewPath = path.join(root, "data", "quality", "ar02c-sample-article-reference-insertion-preview.json");
const liveReviewPath = path.join(root, "data", "editorial", "ar02d-sample-reference-live-review-checklist.json");
const previewPath = path.join(root, "data", "quality", "ar02d-sample-reference-live-review-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AR02D validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const requiredPath of [registryPath, docPath, sampleRegistryPath, ar02cPreviewPath, liveReviewPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing AR02D required artifact/dependency: ${requiredPath}`);
}

const registry = readJson(registryPath);
const sample = readJson(sampleRegistryPath);
const ar02cPreview = readJson(ar02cPreviewPath);
const liveReview = readJson(liveReviewPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AR02D") fail("Registry module_id must be AR02D");
if (liveReview.module_id !== "AR02D") fail("Live review checklist module_id must be AR02D");
if (preview.module_id !== "AR02D") fail("Preview module_id must be AR02D");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (sample.sample_article_count !== 5) fail("AR02D depends on exactly five AR02B sample articles");
if (!ar02cPreview.summary.every_sample_has_two_reference_links) fail("AR02C preview must confirm two reference links per sample");
if (liveReview.sample_article_count !== 5) fail("Live review checklist must have five entries");
if (liveReview.total_expected_reference_links !== 10) fail("Live review checklist must expect ten reference links");

if (!preview.summary.exactly_five_review_entries) fail("Preview must confirm five review entries");
if (!preview.summary.every_entry_has_two_expected_references) fail("Each review entry must have two expected references");
if (!preview.summary.all_reference_urls_https) fail("All expected reference URLs must be HTTPS");
if (!preview.summary.all_observations_pending) fail("All observations must remain pending in AR02D");

for (const entry of liveReview.entries) {
  if (!entry.live_page_url.startsWith("https://drishvara.com/articles/")) {
    fail(`Live page URL must use drishvara.com article path: ${entry.article_path}`);
  }

  if (!Array.isArray(entry.expected_references) || entry.expected_references.length !== 2) {
    fail(`Each live review entry must have two expected references: ${entry.article_path}`);
  }

  for (const reference of entry.expected_references) {
    if (!reference.url.startsWith("https://")) {
      fail(`Expected reference URL must be HTTPS: ${entry.article_path}`);
    }
    if (reference.live_observation !== "pending") {
      fail(`Reference live observation must remain pending: ${entry.article_path}`);
    }
  }

  if (entry.overall_manual_result !== "pending") {
    fail(`Overall manual result must remain pending: ${entry.article_path}`);
  }

  for (const field of registry.manual_check_fields) {
    if (!entry.manual_checks[field]) fail(`Missing manual check field ${field}: ${entry.article_path}`);
    if (entry.manual_checks[field].status !== "pending") {
      fail(`Manual check must remain pending for ${field}: ${entry.article_path}`);
    }
  }
}

for (const flag of [
  "article_html_mutation_enabled",
  "reference_insertion_enabled",
  "external_fetch_enabled",
  "automated_live_review_enabled",
  "manual_review_result_marking_enabled",
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
  "reference_insertion_performed",
  "external_fetch_performed",
  "automated_live_review_performed",
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

for (const scriptName of ["generate:ar02d", "validate:ar02d", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Manual Review Checks", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AR02D document missing phrase: ${phrase}`);
}

pass("AR02D registry is present.");
pass("AR02D document is present.");
pass("AR02D live-review checklist and preview are present.");
pass("Exactly five sample article review entries are present.");
pass("Each entry has two expected reference URLs.");
pass("All observations remain pending for manual live review.");
pass("Article HTML mutation remains disabled.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AR02D is sample reference live-review checklist and safe to commit.");
