import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hq00-post-hf01-static-qa-refresh.json");
const docPath = path.join(root, "docs", "quality", "HQ00_POST_HF01_STATIC_QA_REFRESH.md");
const previewPath = path.join(root, "data", "quality", "hq00-post-hf01-static-qa-refresh-preview.json");
const hf01Path = path.join(root, "data", "quality", "hf01-targeted-static-frontend-correction-patch.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HQ00 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, hf01Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HQ00 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const hf01 = JSON.parse(fs.readFileSync(hf01Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HQ00") fail("module_id must be HQ00");
if (preview.module_id !== "HQ00") fail("preview module_id must be HQ00");
if (preview.preview_only !== true) fail("HQ00 preview must be preview-only");

if (hf01.recommended_next_stage?.module_id !== "HQ00") {
  fail("HF01 must recommend HQ00 before HQ00 proceeds");
}

for (const dep of ["HF01", "HF00", "LV01", "QA01", "QA00"]) {
  if (!registry.depends_on.includes(dep)) fail(`HQ00 must depend on ${dep}`);
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
  "payment_enabled",
  "admin_ui_enabled",
  "subscriber_output_enabled",
  "public_dynamic_output_enabled",
  "homepage_mutation_enabled",
  "page_mutation_enabled",
  "asset_mutation_enabled",
  "seo_metadata_mutation_enabled",
  "sitemap_mutation_enabled",
  "language_runtime_mutation_enabled",
  "file_deletion_enabled",
  "file_move_enabled",
  "archive_cleanup_enabled",
  "backup_cleanup_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "model_training_enabled",
  "vector_database_write_enabled",
  "external_api_fetch_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled",
  "activation_decision_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in HQ00`);
}

for (const area of [
  "navigation_consistency",
  "submissions_navigation",
  "dashboard_navigation",
  "signin_join_placeholder",
  "dropdown_select_guard",
  "article_reference_block",
  "image_credit_block",
  "backend_activation_boundary",
  "verified_reference_link_boundary",
  "image_credit_boundary"
]) {
  if (!registry.qa_areas.includes(area)) fail(`Missing QA area: ${area}`);
}

for (const label of ["Home", "About", "Insights", "Submissions", "Dashboard", "Contact", "Sign in / Join"]) {
  if (!registry.required_nav_labels.includes(label)) fail(`Missing required nav label: ${label}`);
}

for (const rule of [
  "must_be_reachable",
  "must_not_be_error_page",
  "must_not_be_parked",
  "must_not_be_spam",
  "must_be_relevant_to_article",
  "must_not_be_randomly_selected",
  "two_links_required_when_verified",
  "show_under_editorial_verification_if_not_verified"
]) {
  if (!registry.verified_reference_link_rules_preserved.includes(rule)) {
    fail(`Missing preserved reference-link rule: ${rule}`);
  }
}

for (const rule of [
  "article_image_should_have_credit",
  "use_under_review_placeholder_if_not_verified",
  "do_not_invent_photographer_name",
  "do_not_invent_license"
]) {
  if (!registry.image_credit_rules_preserved.includes(rule)) {
    fail(`Missing preserved image-credit rule: ${rule}`);
  }
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`HQ00 preview missing field: ${field}`);
}

if (!preview.summary.all_pages_exist) fail("All checked public pages must exist");
if (!preview.summary.all_pages_have_submissions) fail("All checked public pages must have Submissions");
if (!preview.summary.all_pages_have_dashboard) fail("All checked public pages must have Dashboard");
if (!preview.summary.all_pages_have_signin_join_placeholder) fail("All checked public pages must have Sign in / Join placeholder");
if (!preview.summary.all_pages_have_dropdown_guard) fail("All checked public pages must have dropdown guard");
if (!preview.summary.all_article_pages_have_reference_placeholder) fail("All article pages must have reference placeholder");
if (!preview.summary.all_article_pages_have_image_credit_placeholder) fail("All article pages must have image credit placeholder");

if (preview.summary.mutation_performed_count !== 0) fail("HQ00 mutation_performed_count must be zero");
if (preview.summary.activation_performed_count !== 0) fail("HQ00 activation_performed_count must be zero");

for (const falseField of [
  "backend_activation_enabled",
  "api_route_enabled",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "public_dynamic_output_enabled",
  "subscriber_output_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled"
]) {
  if (preview.summary[falseField] !== false) fail(`HQ00 preview summary ${falseField} must be false`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`HQ00 preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "LV02") {
  fail("HQ00 recommended next stage must be LV02");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("LV02 runtime_allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("LV02 deployment_allowed must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("LV02 activation decision must be false");

for (const scriptName of ["generate:hq00", "validate:hq00", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of [
  "QA Refresh Scope",
  "Navigation QA Requirement",
  "Dropdown QA Requirement",
  "Article Trust QA Requirement",
  "Verified Reference-Link Boundary",
  "Image Credit Boundary",
  "Activation Boundary",
  "Recommended Next Stage",
  "Explicit Exclusions",
  "HQ00 does not"
]) {
  if (!docText.includes(phrase)) fail(`HQ00 document missing phrase: ${phrase}`);
}

pass("HQ00 registry is present.");
pass("HQ00 document is present.");
pass("HQ00 post-HF01 static QA preview is present and marked preview-only.");
pass("HF01 evidence is read.");
pass("Public navigation checks pass.");
pass("Dropdown/select guard checks pass.");
pass("Article reference block checks pass.");
pass("Image credit block checks pass.");
pass("Verified reference-link and image-credit boundaries are preserved.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("LV02 is recorded as the recommended manual live recheck stage.");
pass("HQ00 is post-HF01 static QA refresh only and safe to commit.");
