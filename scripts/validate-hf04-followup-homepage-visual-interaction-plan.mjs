import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hf04-followup-homepage-visual-interaction-correction-plan.json");
const docPath = path.join(root, "docs", "quality", "HF04_FOLLOWUP_HOMEPAGE_VISUAL_INTERACTION_CORRECTION_PLAN.md");
const previewPath = path.join(root, "data", "quality", "hf04-followup-homepage-visual-interaction-correction-plan-preview.json");
const lv03ResultRegistryPath = path.join(root, "data", "quality", "lv03-post-hf03-manual-live-recheck-result.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HF04 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, lv03ResultRegistryPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HF04 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const lv03Result = JSON.parse(fs.readFileSync(lv03ResultRegistryPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HF04") fail("module_id must be HF04");
if (preview.module_id !== "HF04") fail("preview module_id must be HF04");
if (preview.preview_only !== true) fail("HF04 preview must be preview-only");

if (lv03Result.recommended_next_stage?.module_id !== "HF04") {
  fail("LV03 result must recommend HF04 before HF04 proceeds");
}

for (const dep of ["LV03_RESULT", "HQ01", "HF03", "HF02", "LV02"]) {
  if (!registry.depends_on.includes(dep)) fail(`HF04 must depend on ${dep}`);
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
  "language_runtime_mutation_enabled",
  "seo_metadata_mutation_enabled",
  "sitemap_mutation_enabled",
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
  if (registry[flag] !== false) fail(`${flag} must remain false in HF04`);
}

for (const area of ["header_menu_alignment", "timezone_dropdown", "dropdown_freeze", "language_toggle"]) {
  if (!registry.lv03_failed_areas.includes(area)) fail(`Missing LV03 failed area: ${area}`);
}

for (const area of [
  "homepage_header_reconstruction",
  "timezone_dropdown_selectability",
  "shared_dropdown_freeze_resolution",
  "language_toggle_visibility_restoration",
  "unsafe_event_guard_review",
  "global_click_handler_review",
  "overlay_z_index_pointer_events",
  "hero_decorative_layer_boundary",
  "responsive_header_behavior",
  "post_fix_manual_recheck"
]) {
  if (!registry.correction_areas.includes(area)) fail(`Missing correction area: ${area}`);
}

for (const item of [
  "single_header_container",
  "single_navigation_row",
  "stable_control_zone",
  "visible_timezone_selector",
  "visible_language_toggle",
  "static_signin_join_placeholder",
  "no_orphan_floating_links",
  "responsive_mobile_layout"
]) {
  if (!registry.header_target_structure.includes(item)) fail(`Missing header target structure: ${item}`);
}

for (const item of [
  "select_event_listeners",
  "global_click_listeners",
  "stopPropagation_usage",
  "preventDefault_usage",
  "overlay_elements",
  "pointer_events_css",
  "z_index_layers",
  "focus_blur_behavior"
]) {
  if (!registry.dropdown_debug_targets.includes(item)) fail(`Missing dropdown debug target: ${item}`);
}

for (const item of [
  "visible_en_hindi_control",
  "english_click_keeps_english",
  "repeated_english_click_keeps_english",
  "hindi_click_keeps_hindi",
  "repeated_hindi_click_keeps_hindi",
  "normal_homepage_click_does_not_change_language",
  "hindi_to_english_does_not_show_transliteration_fallback"
]) {
  if (!registry.language_toggle_required_behavior.includes(item)) fail(`Missing language toggle required behavior: ${item}`);
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`HF04 preview missing field: ${field}`);
}

if (preview.summary.overall_live_result_basis !== "fail") fail("HF04 must be based on failed LV03 live result");
if (preview.summary.hf05_required !== true) fail("HF05 must be required after HF04");
if (preview.summary.mutation_performed_count !== 0) fail("HF04 mutation count must be zero");
if (preview.summary.activation_performed_count !== 0) fail("HF04 activation count must be zero");

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
  if (preview.summary[falseField] !== false) fail(`HF04 preview ${falseField} must be false`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`HF04 preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "HF05") {
  fail("HF04 recommended next stage must be HF05");
}
if (registry.recommended_next_stage?.auth_allowed !== false) fail("HF05 auth_allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("HF05 deployment_allowed must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("HF05 activation decision must be false");

for (const scriptName of ["generate:hf04", "validate:hf04", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of [
  "LV03 Failure Basis",
  "Correction Objective",
  "Header Reconstruction Requirement",
  "Dropdown Interaction Requirement",
  "Timezone Selector Requirement",
  "Language Toggle Requirement",
  "Hero and Decorative Layer Boundary",
  "Safe Patch Boundary for Next Stage",
  "Proposed Next Patch Strategy",
  "Explicit Exclusions",
  "HF04 does not"
]) {
  if (!docText.includes(phrase)) fail(`HF04 document missing phrase: ${phrase}`);
}

pass("HF04 registry is present.");
pass("HF04 document is present.");
pass("HF04 follow-up correction plan preview is present and marked preview-only.");
pass("LV03 failed live result is carried into HF04.");
pass("Header reconstruction plan is declared.");
pass("Dropdown freeze and timezone selectability plans are declared.");
pass("Language toggle visibility restoration plan is declared.");
pass("Hero/decorative layer boundary is declared.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("HF05 is recorded as the recommended targeted correction patch.");
pass("HF04 is follow-up correction-planning-only and safe to commit.");
