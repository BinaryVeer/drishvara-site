import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "lv03-post-hf03-manual-live-recheck-result.json");
const docPath = path.join(root, "docs", "quality", "LV03_POST_HF03_MANUAL_LIVE_RECHECK_RESULT.md");
const previewPath = path.join(root, "data", "quality", "lv03-post-hf03-manual-live-recheck-result-preview.json");
const hq01Path = path.join(root, "data", "quality", "hq01-post-hf03-static-qa-refresh.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ LV03 result validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, hq01Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing LV03 result required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const hq01 = JSON.parse(fs.readFileSync(hq01Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "LV03_RESULT") fail("module_id must be LV03_RESULT");
if (preview.module_id !== "LV03_RESULT") fail("preview module_id must be LV03_RESULT");
if (preview.preview_only !== true) fail("LV03 result preview must be preview-only");

if (hq01.recommended_next_stage?.module_id !== "LV03") {
  fail("HQ01 must recommend LV03 before LV03 result proceeds");
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
  "file_deletion_enabled",
  "file_move_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled",
  "activation_decision_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in LV03 result`);
}

if (registry.manual_result.overall !== "fail") fail("Overall live result must be fail");
if (registry.manual_result.live_homepage_opens !== "pass") fail("Homepage open result must be pass");
if (registry.manual_result.header_menu_alignment !== "fail") fail("Header/menu alignment must be fail");
if (registry.manual_result.timezone_dropdown !== "fail") fail("Timezone dropdown must be fail");
if (registry.manual_result.homepage_sticking_freezing !== "fail") fail("Homepage sticking/freezing must be fail");
if (registry.manual_result.language_toggle !== "fail") fail("Language toggle must be fail");
if (registry.manual_result.clean_live_confidence !== false) fail("Clean live confidence must be false");

for (const area of ["homepage_load", "header_menu_alignment", "timezone_dropdown", "dropdown_freeze", "language_toggle"]) {
  if (!registry.manual_findings.some((finding) => finding.area === area)) {
    fail(`Missing LV03 result finding area: ${area}`);
  }
}

if (preview.summary.overall !== "fail") fail("Preview overall must be fail");
if (preview.summary.clean_live_confidence !== false) fail("Preview clean live confidence must be false");
if (preview.summary.mutation_performed_count !== 0) fail("Mutation count must be zero");
if (preview.summary.activation_performed_count !== 0) fail("Activation count must be zero");

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

if (registry.recommended_next_stage?.module_id !== "HF04") {
  fail("LV03 result recommended next stage must be HF04");
}
if (registry.recommended_next_stage?.mutation_allowed !== false) fail("HF04 must be planning-only first");
if (registry.recommended_next_stage?.auth_allowed !== false) fail("HF04 Auth allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("HF04 deployment allowed must be false");

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

for (const scriptName of ["generate:lv03-result", "validate:lv03-result", "validate:live", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of [
  "Manual Live Result",
  "Specific Findings",
  "Header/Menu Alignment",
  "Timezone Dropdown",
  "Dropdown Freeze Across Pages",
  "Language Toggle Missing",
  "Recommended Next Stage",
  "Explicit Exclusions",
  "LV03 does not"
]) {
  if (!docText.includes(phrase)) fail(`LV03 result document missing phrase: ${phrase}`);
}

pass("LV03 result registry is present.");
pass("LV03 result document is present.");
pass("LV03 result preview is present and marked preview-only.");
pass("Homepage opening pass is recorded.");
pass("Header/menu alignment fail is recorded.");
pass("Timezone dropdown fail is recorded.");
pass("Dropdown freeze fail is recorded.");
pass("Language toggle fail is recorded.");
pass("Overall live result is fail.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("HF04 is recorded as the recommended follow-up correction planning stage.");
pass("LV03 result is manual-live-result-only and safe to commit.");
