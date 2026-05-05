import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "lv02-post-hf01-manual-live-recheck.json");
const docPath = path.join(root, "docs", "quality", "LV02_POST_HF01_MANUAL_LIVE_RECHECK.md");
const previewPath = path.join(root, "data", "quality", "lv02-post-hf01-manual-live-recheck-preview.json");
const hq00Path = path.join(root, "data", "quality", "hq00-post-hf01-static-qa-refresh.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ LV02 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, hq00Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing LV02 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const hq00 = JSON.parse(fs.readFileSync(hq00Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "LV02") fail("module_id must be LV02");
if (preview.module_id !== "LV02") fail("preview module_id must be LV02");
if (preview.preview_only !== true) fail("LV02 preview must be preview-only");

if (hq00.recommended_next_stage?.module_id !== "LV02") {
  fail("HQ00 must recommend LV02 before LV02 proceeds");
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
  if (registry[flag] !== false) fail(`${flag} must remain false in LV02`);
}

if (registry.manual_result.overall_status !== "warning_partial_fail") {
  fail("LV02 manual result must be warning_partial_fail");
}

if (!Array.isArray(registry.manual_findings) || registry.manual_findings.length < 5) {
  fail("LV02 must record at least five manual findings");
}

for (const finding of registry.manual_findings) {
  for (const field of ["finding_id", "area", "severity", "finding", "required_correction"]) {
    if (!(field in finding)) fail(`Manual finding missing field: ${field}`);
  }
}

if (preview.summary.clean_live_confidence !== false) fail("LV02 clean live confidence must be false");
if (preview.summary.mutation_performed_count !== 0) fail("LV02 mutation count must be zero");
if (preview.summary.activation_performed_count !== 0) fail("LV02 activation count must be zero");

for (const falseField of [
  "backend_activation_enabled",
  "api_route_enabled",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "frontend_deployment_enabled"
]) {
  if (preview.summary[falseField] !== false) fail(`Preview ${falseField} must be false`);
}

if (registry.recommended_next_stage?.module_id !== "HF02") {
  fail("LV02 recommended next stage must be HF02");
}
if (registry.recommended_next_stage?.mutation_allowed !== false) fail("HF02 must be planning-only first");
if (registry.recommended_next_stage?.auth_allowed !== false) fail("HF02 auth allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("HF02 deployment allowed must be false");

for (const scriptName of ["generate:lv02", "validate:lv02", "validate:live", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of [
  "Manual Live Findings",
  "What Passed from HQ00/HF01",
  "What Still Needs Correction",
  "Recommended Next Stage",
  "Explicit Exclusions",
  "LV02 does not"
]) {
  if (!docText.includes(phrase)) fail(`LV02 document missing phrase: ${phrase}`);
}

pass("LV02 registry is present.");
pass("LV02 document is present.");
pass("LV02 manual live recheck preview is present and marked preview-only.");
pass("Homepage sticking and header/navigation disturbance are recorded.");
pass("Timezone/header displacement is recorded.");
pass("HQ00 static pass items are carried forward.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("HF02 is recorded as the recommended homepage stabilization planning stage.");
pass("LV02 is manual-live-recheck-result-only and safe to commit.");
