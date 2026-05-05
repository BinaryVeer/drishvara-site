import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "lv03-post-hf03-manual-live-recheck.json");
const docPath = path.join(root, "docs", "quality", "LV03_POST_HF03_MANUAL_LIVE_RECHECK.md");
const previewPath = path.join(root, "data", "quality", "lv03-post-hf03-manual-live-recheck-preview.json");
const hq01Path = path.join(root, "data", "quality", "hq01-post-hf03-static-qa-refresh.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ LV03 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, hq01Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing LV03 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const hq01 = JSON.parse(fs.readFileSync(hq01Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "LV03") fail("module_id must be LV03");
if (preview.module_id !== "LV03") fail("preview module_id must be LV03");
if (preview.preview_only !== true) fail("LV03 preview must be preview-only");

if (hq01.recommended_next_stage?.module_id !== "LV03") {
  fail("HQ01 must recommend LV03 before LV03 proceeds");
}

for (const dep of ["HQ01", "HF03", "HF02", "LV02", "HQ00"]) {
  if (!registry.depends_on.includes(dep)) fail(`LV03 must depend on ${dep}`);
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
  if (registry[flag] !== false) fail(`${flag} must remain false in LV03`);
}

if (!Array.isArray(registry.manual_live_recheck_items) || registry.manual_live_recheck_items.length < 8) {
  fail("LV03 must declare at least 8 manual live recheck items");
}

for (const area of [
  "homepage_load",
  "header_menu_alignment",
  "timezone_dropdown",
  "homepage_sticking_freezing",
  "language_toggle",
  "mobile_header_layout",
  "console_errors",
  "signin_join_placeholder"
]) {
  if (!registry.manual_live_recheck_items.some((item) => item.area === area)) {
    fail(`Missing LV03 manual check area: ${area}`);
  }
}

for (const item of registry.manual_live_recheck_items) {
  for (const field of ["check_id", "area", "check", "result_status"]) {
    if (!(field in item)) fail(`LV03 manual recheck item missing field: ${field}`);
  }
  if (item.result_status !== "pending_manual_observation") {
    fail(`LV03 item ${item.check_id} must remain pending_manual_observation`);
  }
}

if (preview.summary.live_result_recorded !== false) fail("LV03 must not record live result yet");
if (preview.summary.pending_manual_observation_count !== registry.manual_live_recheck_items.length) {
  fail("All LV03 checks must remain pending manual observation");
}
if (preview.summary.mutation_performed_count !== 0) fail("LV03 mutation count must be zero");
if (preview.summary.activation_performed_count !== 0) fail("LV03 activation count must be zero");

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
  if (preview.summary[falseField] !== false) fail(`LV03 preview ${falseField} must be false`);
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`LV03 preview missing field: ${field}`);
}

if (preview.conditional_next_stages.if_pass.module_id !== "LS00") {
  fail("LV03 pass next stage must be LS00");
}
if (preview.conditional_next_stages.if_warning_or_fail.module_id !== "HF04") {
  fail("LV03 warning/fail next stage must be HF04");
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`LV03 preview missing blocked capability: ${blocked}`);
  }
}

for (const scriptName of ["generate:lv03", "validate:lv03", "validate:live", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of [
  "Manual Live Recheck Scope",
  "Homepage Header Check",
  "Timezone Dropdown Check",
  "Homepage Sticking / Freezing Check",
  "Language Toggle Stability Check",
  "Mobile Header Check",
  "Console Error Check",
  "Result Reporting Format",
  "Explicit Exclusions",
  "LV03 does not"
]) {
  if (!docText.includes(phrase)) fail(`LV03 document missing phrase: ${phrase}`);
}

pass("LV03 registry is present.");
pass("LV03 document is present.");
pass("LV03 manual live recheck preview is present and marked preview-only.");
pass("HQ01 static evidence is carried forward.");
pass("Header, timezone, sticking/freezing, language, mobile, console, and placeholder checks are declared.");
pass("All LV03 checks remain pending manual observation.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("Conditional next stages LS00/HF04 are recorded.");
pass("LV03 is manual-live-recheck-checklist-only and safe to commit.");
