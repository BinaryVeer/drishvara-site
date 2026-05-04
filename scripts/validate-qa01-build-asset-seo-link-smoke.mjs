import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "quality", "qa01-build-asset-seo-link-smoke-test-plan.json");
const docPath = path.join(process.cwd(), "docs", "quality", "QA01_BUILD_ASSET_SEO_LINK_SMOKE_TEST_PLAN.md");
const previewPath = path.join(process.cwd(), "data", "quality", "qa01-build-asset-seo-link-smoke-preview.json");
const qa00Path = path.join(process.cwd(), "data", "quality", "qa00-first-page-homepage-stability-audit-checklist.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ QA01 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, qa00Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing QA01 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const qa00 = JSON.parse(fs.readFileSync(qa00Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "QA01") fail("module_id must be QA01");
if (preview.module_id !== "QA01") fail("preview output module_id must be QA01");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

if (qa00.recommended_next_stage?.module_id !== "QA01") {
  fail("QA00 must recommend QA01 as next stage before QA01 proceeds");
}

for (const dep of ["QA00", "ID02", "IR00"]) {
  if (!registry.depends_on.includes(dep)) fail(`QA01 must depend on ${dep}`);
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
  "backend_deployment_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in QA01`);
}

for (const area of ["build", "asset", "seo", "link", "language", "console", "deployment"]) {
  if (!registry.smoke_areas.includes(area)) fail(`Missing smoke area: ${area}`);
}

for (const status of ["pass", "warning", "fail", "blocked", "not_checked", "not_applicable"]) {
  if (!registry.allowed_smoke_statuses.includes(status)) fail(`Missing smoke status: ${status}`);
}

if (!Array.isArray(registry.smoke_items) || registry.smoke_items.length < 25) {
  fail("QA01 must declare at least 25 smoke items");
}

for (const item of registry.smoke_items) {
  for (const field of ["item_key", "area", "check", "status"]) {
    if (!(field in item)) fail(`Smoke item missing field: ${field}`);
  }
  if (!registry.smoke_areas.includes(item.area)) fail(`Unknown smoke area: ${item.area}`);
  if (!registry.allowed_smoke_statuses.includes(item.status)) fail(`Invalid smoke status: ${item.status}`);
}

for (const req of [
  "package_json_present",
  "validate_project_script_present",
  "validate_qa_script_present",
  "build_script_reviewed",
  "no_env_required_for_homepage_static"
]) {
  if (!registry.build_smoke_requirements.includes(req)) fail(`Missing build smoke requirement: ${req}`);
}

for (const req of [
  "stylesheet_refs_resolve",
  "script_refs_resolve",
  "image_refs_reviewed",
  "critical_asset_missing_reviewed",
  "backup_refs_not_used_as_live_assets"
]) {
  if (!registry.asset_smoke_requirements.includes(req)) fail(`Missing asset smoke requirement: ${req}`);
}

for (const req of [
  "title_present",
  "meta_description_present",
  "viewport_present",
  "og_title_present",
  "og_description_present",
  "og_image_present",
  "favicon_reviewed"
]) {
  if (!registry.seo_smoke_requirements.includes(req)) fail(`Missing SEO smoke requirement: ${req}`);
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (preview.static_smoke_scan.index_exists !== true) {
  fail("index.html must exist for QA01 smoke test");
}
if (preview.static_smoke_scan.package_json_present !== true) {
  fail("package.json must exist for QA01 smoke test");
}
if (preview.static_smoke_scan.validate_project_script_present !== true) {
  fail("validate:project must exist for QA01 smoke test");
}
if (preview.static_smoke_scan.validate_qa_script_present !== true) {
  fail("validate:qa must exist for QA01 smoke test");
}

if (preview.summary.smoke_item_count !== registry.smoke_items.length) {
  fail("Preview smoke item count must match registry");
}

if (preview.summary.mutation_performed_count !== 0) fail("mutation_performed_count must be zero");

for (const falseField of [
  "homepage_mutation_enabled",
  "asset_mutation_enabled",
  "seo_metadata_mutation_enabled",
  "language_runtime_mutation_enabled",
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

for (const item of preview.smoke_items) {
  if (item.mutation_performed !== false) fail(`Smoke item ${item.item_key} must not mutate files`);
  if (!registry.allowed_smoke_statuses.includes(item.status)) fail(`Preview item ${item.item_key} invalid status`);
}

if (registry.missing_asset_treatment.auto_fix_allowed !== false) fail("Missing asset auto-fix must be false");
if (registry.missing_asset_treatment.auto_delete_allowed !== false) fail("Missing asset auto-delete must be false");
if (registry.missing_asset_treatment.requires_separate_fix_patch !== true) fail("Missing asset fixes must require separate fix patch");

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "LR00") {
  fail("QA01 recommended next stage must be LR00");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("LR00 runtime_allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("LR00 deployment_allowed must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("LR00 activation decision must be false");

for (const scriptName of ["generate:qa01", "validate:qa01", "validate:qa", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Smoke Test Doctrine",
  "Build Smoke Test Plan",
  "Asset Smoke Test Plan",
  "SEO Smoke Test Plan",
  "Link Smoke Test Plan",
  "Language Runtime Smoke Test Plan",
  "Console Smoke Test Plan",
  "Static Deployment Smoke Test Plan",
  "Static Smoke Preview Boundary",
  "Treatment of Missing Asset References",
  "Explicit Exclusions",
  "QA01 does not"
]) {
  if (!docText.includes(phrase)) fail(`QA01 document missing phrase: ${phrase}`);
}

pass("QA01 registry is present.");
pass("QA01 document is present.");
pass("QA01 build/asset/SEO/link smoke preview is present and marked preview-only.");
pass("Build, asset, SEO, link, language, console, and deployment smoke-test areas are declared.");
pass("Static smoke scan ran against index.html and package.json without mutation.");
pass("Missing asset references are recorded as findings and require a separate fix patch.");
pass("No homepage, asset, SEO, language runtime, backend, API, Supabase, Auth, ML, public output, subscriber output, or deployment mutation/activation is enabled.");
pass("LR00 is recorded as the recommended live-readiness review stage.");
pass("QA01 is build/asset/SEO/link-smoke-test-plan-only and safe to commit.");
