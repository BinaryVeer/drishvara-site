import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "ar01-article-reference-image-credit-surface-patch.json");
const docPath = path.join(root, "docs", "quality", "AR01_ARTICLE_REFERENCE_IMAGE_CREDIT_SURFACE_PATCH.md");
const applyPath = path.join(root, "data", "quality", "ar01-article-reference-image-credit-surface-apply-result.json");
const previewPath = path.join(root, "data", "quality", "ar01-article-reference-image-credit-preview.json");
const editorialRegistryPath = path.join(root, "data", "editorial", "article-reference-image-credit-registry.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AR01 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, applyPath, previewPath, editorialRegistryPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing AR01 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const apply = JSON.parse(fs.readFileSync(applyPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const editorial = JSON.parse(fs.readFileSync(editorialRegistryPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AR01") fail("registry module_id must be AR01");
if (apply.module_id !== "AR01") fail("apply module_id must be AR01");
if (preview.module_id !== "AR01") fail("preview module_id must be AR01");
if (editorial.module_id !== "AR01") fail("editorial registry module_id must be AR01");
if (preview.preview_only !== true) fail("AR01 preview must be preview-only");

if (!preview.summary.all_samples_have_style_marker) fail("All samples must have AR01 style marker");
if (!preview.summary.all_samples_have_evidence_block) fail("All samples must have evidence block");
if (!preview.summary.all_samples_have_reference_status) fail("All samples must have reference status");
if (!preview.summary.all_samples_have_two_reference_slots) fail("All samples must have at least two reference slots");
if (!preview.summary.all_samples_have_image_credit) fail("All samples must have image credit");
if (!preview.summary.no_samples_have_verified_claim) fail("No sample may claim verified status in AR01");

if (editorial.article_count < 1) fail("Editorial registry must contain article entries");
if (editorial.verified_reference_count !== 0) fail("AR01 must not mark verified references");
if (editorial.all_articles_under_editorial_verification !== true) fail("All articles must remain under editorial verification in AR01");

for (const article of editorial.articles) {
  if (article.reference_status !== "under_editorial_verification") {
    fail(`Article must remain under editorial verification: ${article.article_path}`);
  }
  if (!Array.isArray(article.reference_slots) || article.reference_slots.length !== 2) {
    fail(`Article must have exactly two reference slots: ${article.article_path}`);
  }
  for (const slot of article.reference_slots) {
    if (slot.url !== null) fail(`AR01 must not insert URL: ${article.article_path}`);
    if (slot.status !== "under_editorial_verification") {
      fail(`AR01 slot status must be under editorial verification: ${article.article_path}`);
    }
  }
}

for (const flag of [
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
  "external_link_verification_performed",
  "unverified_external_link_insertion_enabled",
  "file_deletion_enabled",
  "file_move_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false`);
}

for (const falseField of [
  "unverified_external_links_inserted",
  "external_link_verification_performed",
  "backend_activation_performed",
  "api_route_created",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "frontend_deployment_performed"
]) {
  if (apply.summary[falseField] !== false) fail(`Apply summary ${falseField} must be false`);
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

if (apply.summary.file_deletion_performed !== false) fail("AR01 must not delete files");
if (apply.summary.file_move_performed !== false) fail("AR01 must not move files");

for (const scriptName of ["apply:ar01", "generate:ar01", "validate:ar01", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Correction Scope", "Important Boundary", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AR01 document missing phrase: ${phrase}`);
}

pass("AR01 registry is present.");
pass("AR01 document is present.");
pass("AR01 apply result, preview, and editorial registry are present.");
pass("Article evidence blocks are present in checked samples.");
pass("Two reference slots are present without fake URLs.");
pass("Image credit / attribution blocks are present.");
pass("All articles remain under editorial verification until AR02.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AR01 is article reference/image-credit surface patch and safe to commit.");
