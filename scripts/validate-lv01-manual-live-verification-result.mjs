import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "lv01-manual-live-verification-result-record.json");
const docPath = path.join(root, "docs", "quality", "LV01_MANUAL_LIVE_VERIFICATION_RESULT_RECORD.md");
const previewPath = path.join(root, "data", "quality", "lv01-manual-live-verification-result-preview.json");
const lv00Path = path.join(root, "data", "quality", "lv00-manual-live-verification-after-homepage-findings-fix.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ LV01 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, lv00Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing LV01 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const lv00 = JSON.parse(fs.readFileSync(lv00Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "LV01") fail("module_id must be LV01");
if (preview.module_id !== "LV01") fail("preview output module_id must be LV01");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

if (lv00.recommended_next_stage?.module_id !== "LV01") {
  fail("LV00 must recommend LV01 as next stage before LV01 proceeds");
}

for (const dep of ["LV00", "LF01", "LF00", "QA01", "QA00"]) {
  if (!registry.depends_on.includes(dep)) fail(`LV01 must depend on ${dep}`);
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
  if (registry[flag] !== false) fail(`${flag} must remain false in LV01`);
}

if (registry.manual_result.overall_status !== "warning_partial_fail") {
  fail("Manual result must be warning_partial_fail based on observed live issues");
}

if (!Array.isArray(registry.manual_findings) || registry.manual_findings.length < 5) {
  fail("LV01 must record at least 5 manual findings");
}

for (const finding of registry.manual_findings) {
  for (const field of ["finding_id", "area", "severity", "finding", "observed_detail", "required_correction"]) {
    if (!(field in finding)) fail(`Manual finding missing field: ${field}`);
  }
}

for (const rule of [
  "must_open_successfully",
  "must_not_be_404_403_500",
  "must_not_be_error_page",
  "must_not_be_parked_or_spam",
  "must_not_redirect_endlessly",
  "must_be_responsive_enough_to_load",
  "must_contain_legitimate_information",
  "must_be_relevant_to_article",
  "must_support_factual_basis",
  "prefer_official_institutional_research_government_or_credible_media_source"
]) {
  if (!registry.verified_reference_link_rules.includes(rule)) {
    fail(`Missing verified reference-link rule: ${rule}`);
  }
}

for (const rule of [
  "article_image_should_have_credit",
  "card_image_should_have_credit_or_page_level_credit",
  "credit_should_include_source_or_platform_or_photographer_where_available",
  "use_under_review_placeholder_if_not_verified"
]) {
  if (!registry.image_credit_rules.includes(rule)) {
    fail(`Missing image credit rule: ${rule}`);
  }
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (preview.summary.clean_live_confidence !== false) fail("Clean live confidence must be false in LV01");
if (preview.summary.mutation_performed_count !== 0) fail("mutation_performed_count must be zero");
if (preview.summary.activation_performed_count !== 0) fail("activation_performed_count must be zero");

for (const falseField of [
  "backend_activation_allowed",
  "supabase_activation_allowed",
  "auth_activation_allowed",
  "api_activation_allowed",
  "deployment_allowed"
]) {
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

for (const finding of preview.manual_findings) {
  if (finding.mutation_performed !== false) fail(`Finding ${finding.finding_id} must not mutate files`);
  if (finding.activation_performed !== false) fail(`Finding ${finding.finding_id} must not activate anything`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "HF00") {
  fail("LV01 recommended next stage must be HF00");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("HF00 runtime_allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("HF00 deployment_allowed must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("HF00 activation decision must be false");

for (const scriptName of ["generate:lv01", "validate:lv01", "validate:live", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Manual Findings Recorded",
  "Reference-Link Integrity Requirement",
  "Image Credit Requirement",
  "Navigation Consistency Requirement",
  "Dropdown Interaction Requirement",
  "Signup/Login Boundary",
  "Result Decision",
  "Recommended Next Stage",
  "Explicit Exclusions",
  "LV01 does not"
]) {
  if (!docText.includes(phrase)) fail(`LV01 document missing phrase: ${phrase}`);
}

pass("LV01 registry is present.");
pass("LV01 document is present.");
pass("LV01 manual live verification result preview is present and marked preview-only.");
pass("Manual live findings are recorded.");
pass("Verified reference-link integrity rules are preserved.");
pass("Image credit requirements are preserved.");
pass("Navigation, dropdown, signup/login, reference-link, and image-credit gaps are recorded.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("HF00 is recorded as the recommended correction-planning stage.");
pass("LV01 is manual-live-result-record-only and safe to commit.");
