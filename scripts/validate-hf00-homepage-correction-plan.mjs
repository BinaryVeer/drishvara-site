import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf00-homepage-page-navigation-dropdown-reference-image-credit-fix-plan.json");
const docPath = path.join(root, "docs", "quality", "HF00_HOMEPAGE_PAGE_NAVIGATION_DROPDOWN_REFERENCE_IMAGE_CREDIT_FIX_PLAN.md");
const previewPath = path.join(root, "data", "quality", "hf00-homepage-correction-plan-preview.json");
const lv01Path = path.join(root, "data", "quality", "lv01-manual-live-verification-result-record.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HF00 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, lv01Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HF00 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const lv01 = JSON.parse(fs.readFileSync(lv01Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HF00") fail("module_id must be HF00");
if (preview.module_id !== "HF00") fail("preview output module_id must be HF00");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

if (lv01.recommended_next_stage?.module_id !== "HF00") {
  fail("LV01 must recommend HF00 as next stage before HF00 proceeds");
}

for (const dep of ["LV01", "LV00", "LF01", "QA01", "QA00"]) {
  if (!registry.depends_on.includes(dep)) fail(`HF00 must depend on ${dep}`);
}

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "backend_activation_enabled",
  "supabase_enabled",
  "auth_enabled",
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
  "gitignore_modification_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "model_training_enabled",
  "vector_database_write_enabled",
  "external_api_fetch_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled",
  "activation_decision_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in HF00`);
}

for (const area of [
  "common_navigation",
  "dropdown_interaction",
  "signup_login_placeholder",
  "article_reference_links",
  "verified_reference_link_integrity",
  "image_credit_attribution",
  "article_display_metadata",
  "post_fix_validation"
]) {
  if (!registry.correction_areas.includes(area)) fail(`Missing correction area: ${area}`);
}

for (const nav of ["Home", "About", "Insights", "Submissions", "Dashboard", "Contact"]) {
  if (!registry.common_navigation_required.english.includes(nav)) fail(`Missing English nav item: ${nav}`);
}

for (const nav of ["घर", "परिचय", "इनसाइट्स", "सबमिशन", "डैशबोर्ड", "संपर्क"]) {
  if (!registry.common_navigation_required.hindi.includes(nav)) fail(`Missing Hindi nav item: ${nav}`);
}

for (const focus of [
  "native_select_focus",
  "overlay_or_fixed_layer_blocking",
  "z_index_stacking",
  "pointer_events_css",
  "global_click_handlers",
  "language_toggle_handlers",
  "scroll_lock_classes",
  "event_propagation"
]) {
  if (!registry.dropdown_fix_focus.includes(focus)) fail(`Missing dropdown debug focus: ${focus}`);
}

if (registry.signup_login_placeholder_boundary.real_auth_allowed !== false) fail("HF00 must not allow real Auth");
if (registry.signup_login_placeholder_boundary.supabase_auth_allowed !== false) fail("HF00 must not allow Supabase Auth");
if (registry.signup_login_placeholder_boundary.user_account_collection_allowed !== false) fail("HF00 must not allow account collection");

for (const rule of [
  "must_open_successfully",
  "must_be_reachable",
  "must_be_responsive_enough_to_load",
  "must_not_be_404_403_500",
  "must_not_be_error_page",
  "must_not_be_parked",
  "must_not_be_spam",
  "must_not_be_irrelevant",
  "must_not_redirect_endlessly",
  "must_contain_legitimate_information",
  "must_be_relevant_to_article",
  "must_support_article_factual_basis",
  "prefer_official_institutional_research_government_or_credible_media_source",
  "must_not_be_randomly_selected",
  "two_links_required_when_verified",
  "show_under_editorial_verification_if_not_verified"
]) {
  if (!registry.verified_reference_link_rules.includes(rule)) fail(`Missing verified reference-link rule: ${rule}`);
}

if (registry.reference_display_requirements.minimum_verified_links_final_state !== 2) {
  fail("Final reference-link state must require two verified links");
}
if (registry.reference_display_requirements.invented_links_allowed !== false) {
  fail("Invented links must not be allowed");
}
if (registry.reference_display_requirements.random_links_allowed !== false) {
  fail("Random links must not be allowed");
}

for (const rule of [
  "article_image_should_have_credit",
  "featured_card_image_should_have_credit_or_page_level_credit",
  "credit_should_include_source_or_platform_or_photographer_where_available",
  "use_under_review_placeholder_if_not_verified",
  "do_not_invent_photographer_name",
  "do_not_invent_license"
]) {
  if (!registry.image_credit_rules.includes(rule)) fail(`Missing image credit rule: ${rule}`);
}

if (registry.image_credit_display_requirements.invented_credit_allowed !== false) {
  fail("Invented image credit must not be allowed");
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (preview.summary.mutation_performed_count !== 0) fail("mutation_performed_count must be zero");
if (preview.summary.activation_performed_count !== 0) fail("activation_performed_count must be zero");

for (const falseField of [
  "homepage_mutation_enabled",
  "page_mutation_enabled",
  "backend_activation_enabled",
  "api_route_enabled",
  "supabase_enabled",
  "auth_enabled",
  "public_dynamic_output_enabled",
  "subscriber_output_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled"
]) {
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

if (preview.lv01_evidence.lv01_finding_count < 5) {
  fail("HF00 must carry LV01 manual findings into correction plan");
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "HF01") {
  fail("HF00 recommended next stage must be HF01");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("HF01 runtime_allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("HF01 deployment_allowed must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("HF01 activation decision must be false");

for (const scriptName of ["generate:hf00", "validate:hf00", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Correction Scope",
  "Common Navigation Requirement",
  "Dropdown Interaction Requirement",
  "Signup/Login Placeholder Requirement",
  "Verified Reference-Link Requirement",
  "Image Credit Requirement",
  "Article Display Requirement",
  "Correction Safety Boundary",
  "Post-Fix Validation Requirement",
  "Explicit Exclusions",
  "HF00 does not"
]) {
  if (!docText.includes(phrase)) fail(`HF00 document missing phrase: ${phrase}`);
}

pass("HF00 registry is present.");
pass("HF00 document is present.");
pass("HF00 correction plan preview is present and marked preview-only.");
pass("LV01 manual findings are carried into HF00.");
pass("Common navigation correction plan is declared.");
pass("Dropdown freeze correction plan is declared.");
pass("Signup/Login static placeholder boundary is declared without Auth activation.");
pass("Verified two-reference-link integrity logic is preserved.");
pass("Image credit/attribution requirements are preserved.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("HF01 is recorded as the recommended targeted static frontend correction patch.");
pass("HF00 is correction-planning-only and safe to commit.");
