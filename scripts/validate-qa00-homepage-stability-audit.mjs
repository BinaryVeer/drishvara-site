import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "quality", "qa00-first-page-homepage-stability-audit-checklist.json");
const docPath = path.join(process.cwd(), "docs", "quality", "QA00_FIRST_PAGE_HOMEPAGE_STABILITY_AUDIT_CHECKLIST.md");
const previewPath = path.join(process.cwd(), "data", "quality", "qa00-homepage-stability-audit-preview.json");
const id02Path = path.join(process.cwd(), "data", "implementation", "id02-api-route-contract-design-without-route-creation.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ QA00 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, id02Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing QA00 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const id02 = JSON.parse(fs.readFileSync(id02Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "QA00") fail("module_id must be QA00");
if (preview.module_id !== "QA00") fail("preview output module_id must be QA00");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

if (id02.recommended_next_stage?.module_id !== "QA00") {
  fail("ID02 must recommend QA00 as next stage before QA00 proceeds");
}

for (const dep of ["ID02", "ID01", "ID00", "IR00"]) {
  if (!registry.depends_on.includes(dep)) fail(`QA00 must depend on ${dep}`);
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
  "backend_deployment_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in QA00`);
}

for (const area of [
  "static_scan",
  "language_toggle",
  "hero_visual",
  "asset_loading",
  "links_navigation",
  "seo_metadata",
  "responsive",
  "console_runtime",
  "live_deployment"
]) {
  if (!registry.audit_areas.includes(area)) fail(`Missing audit area: ${area}`);
}

for (const status of ["not_checked", "pass", "warning", "fail", "blocked", "not_applicable"]) {
  if (!registry.allowed_audit_statuses.includes(status)) fail(`Missing audit status: ${status}`);
}

if (!Array.isArray(registry.audit_items) || registry.audit_items.length < 20) {
  fail("QA00 must declare at least 20 homepage audit items");
}

for (const item of registry.audit_items) {
  for (const field of ["item_key", "area", "check", "status"]) {
    if (!(field in item)) fail(`Audit item missing field: ${field}`);
  }
  if (!registry.audit_areas.includes(item.area)) fail(`Unknown audit area: ${item.area}`);
  if (!registry.allowed_audit_statuses.includes(item.status)) fail(`Invalid audit status: ${item.status}`);
}

for (const expected of [
  "english_click_keeps_english",
  "repeated_english_click_keeps_english",
  "hindi_click_keeps_hindi",
  "repeated_hindi_click_keeps_hindi",
  "normal_homepage_click_does_not_change_language",
  "hindi_to_english_does_not_show_transliteration_fallback"
]) {
  if (!registry.language_toggle_expected_behavior.includes(expected)) {
    fail(`Missing language toggle expected behavior: ${expected}`);
  }
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (preview.static_scan.index_exists !== true) {
  fail("index.html must exist for QA00 homepage audit");
}

if (preview.summary.audit_item_count !== registry.audit_items.length) {
  fail("Preview audit item count must match registry");
}

if (preview.summary.mutation_performed_count !== 0) fail("mutation_performed_count must be zero");

for (const falseField of [
  "homepage_mutation_enabled",
  "asset_mutation_enabled",
  "backend_activation_enabled",
  "api_route_enabled",
  "supabase_enabled",
  "auth_enabled",
  "public_dynamic_output_enabled",
  "subscriber_output_enabled"
]) {
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

for (const item of preview.audit_items) {
  if (item.mutation_performed !== false) fail(`Audit item ${item.item_key} must not mutate files`);
  if (!registry.allowed_audit_statuses.includes(item.status)) fail(`Preview item ${item.item_key} invalid status`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "QA01") {
  fail("QA00 recommended next stage must be QA01");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("QA01 runtime_allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("QA01 deployment_allowed must be false");

for (const scriptName of ["generate:qa00", "validate:qa00", "validate:qa", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Homepage Stability Doctrine",
  "Audit Scope",
  "Language Toggle Audit",
  "Hero Visual Audit",
  "Asset Loading Audit",
  "Link and Navigation Audit",
  "SEO and Metadata Audit",
  "Responsive Audit",
  "Console and Runtime Audit",
  "Live Deployment Audit",
  "Static Scan Boundary",
  "Explicit Exclusions",
  "QA00 does not"
]) {
  if (!docText.includes(phrase)) fail(`QA00 document missing phrase: ${phrase}`);
}

pass("QA00 registry is present.");
pass("QA00 document is present.");
pass("QA00 homepage stability audit preview is present and marked preview-only.");
pass("Homepage audit areas, language toggle checks, hero checks, asset/link/SEO/responsive/live checks are declared.");
pass("Static scan ran against index.html without mutation.");
pass("No homepage, asset, SEO, sitemap, language runtime, backend, API, Supabase, Auth, ML, public output, or subscriber output mutation/activation is enabled.");
pass("QA01 is recorded as the recommended next smoke-test stage.");
pass("QA00 is homepage stability-audit-checklist-only and safe to commit.");
