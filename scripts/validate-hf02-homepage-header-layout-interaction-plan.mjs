import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hf02-homepage-header-layout-interaction-stabilization-fix-plan.json");
const docPath = path.join(root, "docs", "quality", "HF02_HOMEPAGE_HEADER_LAYOUT_INTERACTION_STABILIZATION_FIX_PLAN.md");
const previewPath = path.join(root, "data", "quality", "hf02-homepage-header-layout-interaction-stabilization-plan-preview.json");
const lv02Path = path.join(root, "data", "quality", "lv02-post-hf01-manual-live-recheck.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HF02 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, lv02Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HF02 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const lv02 = JSON.parse(fs.readFileSync(lv02Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HF02") fail("module_id must be HF02");
if (preview.module_id !== "HF02") fail("preview module_id must be HF02");
if (preview.preview_only !== true) fail("HF02 preview must be preview-only");

if (lv02.recommended_next_stage?.module_id !== "HF02") {
  fail("LV02 must recommend HF02 before HF02 proceeds");
}

for (const dep of ["LV02", "HQ00", "HF01", "HF00"]) {
  if (!registry.depends_on.includes(dep)) fail(`HF02 must depend on ${dep}`);
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
  "css_mutation_enabled",
  "javascript_mutation_enabled",
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
  if (registry[flag] !== false) fail(`${flag} must remain false in HF02`);
}

for (const area of [
  "homepage_header_layout",
  "navigation_alignment",
  "timezone_dropdown_placement",
  "language_toggle_protection",
  "homepage_interaction_sticking",
  "overlay_z_index_pointer_events",
  "hero_header_separation",
  "responsive_header_behavior",
  "post_fix_manual_recheck"
]) {
  if (!registry.correction_areas.includes(area)) fail(`Missing correction area: ${area}`);
}

for (const label of ["Home", "About", "Insights", "Submissions", "Dashboard", "Contact", "Sign in / Join"]) {
  if (!registry.required_nav_labels.includes(label)) fail(`Missing required nav label: ${label}`);
}

for (const zone of [
  "brand_zone",
  "timezone_control_zone",
  "primary_navigation_zone",
  "language_toggle_zone",
  "account_placeholder_zone",
  "mobile_responsive_zone"
]) {
  if (!registry.planned_header_zones.includes(zone)) fail(`Missing planned header zone: ${zone}`);
}

for (const focus of [
  "global_click_handlers",
  "select_dropdown_event_guards",
  "language_toggle_handlers",
  "pointer_events",
  "fixed_overlays",
  "z_index_layers",
  "hero_orbit_animation_layers",
  "event_propagation",
  "focus_blur_behavior"
]) {
  if (!registry.interaction_debug_focus.includes(focus)) fail(`Missing interaction debug focus: ${focus}`);
}

for (const rule of [
  "english_click_keeps_english",
  "repeated_english_click_keeps_english",
  "hindi_click_keeps_hindi",
  "repeated_hindi_click_keeps_hindi",
  "normal_homepage_click_does_not_change_language",
  "hindi_to_english_does_not_show_transliteration_fallback"
]) {
  if (!registry.language_toggle_protection_rules.includes(rule)) {
    fail(`Missing language toggle protection rule: ${rule}`);
  }
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`HF02 preview missing field: ${field}`);
}

if (preview.summary.hf03_required !== true) fail("HF03 must be required after HF02");
if (preview.summary.mutation_performed_count !== 0) fail("HF02 mutation count must be zero");
if (preview.summary.activation_performed_count !== 0) fail("HF02 activation count must be zero");

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
  if (preview.summary[falseField] !== false) fail(`Preview ${falseField} must be false`);
}

if (!preview.static_scan.index_exists) fail("index.html must exist for HF02 planning scan");
if (!preview.static_scan.has_required_nav_labels) fail("index.html must currently contain required nav labels");

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`HF02 preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "HF03") {
  fail("HF02 recommended next stage must be HF03");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("HF03 runtime_allowed must be false");
if (registry.recommended_next_stage?.auth_allowed !== false) fail("HF03 auth_allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("HF03 deployment_allowed must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("HF03 activation decision must be false");

for (const scriptName of ["generate:hf02", "validate:hf02", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of [
  "Correction Objective",
  "Header Layout Target",
  "Navigation Alignment Requirement",
  "Timezone Control Requirement",
  "Interaction Stabilization Requirement",
  "Hero and Header Separation Requirement",
  "Language Toggle Protection",
  "Safe Patch Boundary for Next Stage",
  "Explicit Exclusions",
  "HF02 does not"
]) {
  if (!docText.includes(phrase)) fail(`HF02 document missing phrase: ${phrase}`);
}

pass("HF02 registry is present.");
pass("HF02 document is present.");
pass("HF02 homepage header/interaction plan preview is present and marked preview-only.");
pass("LV02 findings are carried into HF02.");
pass("Homepage header layout correction plan is declared.");
pass("Navigation alignment and timezone placement plans are declared.");
pass("Homepage sticking/interaction stabilization plan is declared.");
pass("Language-toggle protection rules are preserved.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("HF03 is recorded as the recommended targeted homepage stabilization patch.");
pass("HF02 is homepage stabilization-planning-only and safe to commit.");
