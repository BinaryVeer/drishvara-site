import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "lv00-manual-live-verification-after-homepage-findings-fix.json");
const docPath = path.join(root, "docs", "quality", "LV00_MANUAL_LIVE_VERIFICATION_AFTER_HOMEPAGE_FINDINGS_FIX.md");
const previewPath = path.join(root, "data", "quality", "lv00-manual-live-verification-preview.json");
const lf01Path = path.join(root, "data", "quality", "lf01-targeted-homepage-asset-link-fix-patch.json");
const lf01ApplyPath = path.join(root, "data", "quality", "lf01-targeted-homepage-fix-apply-result.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ LV00 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, lf01Path, lf01ApplyPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing LV00 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const lf01 = JSON.parse(fs.readFileSync(lf01Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "LV00") fail("module_id must be LV00");
if (preview.module_id !== "LV00") fail("preview output module_id must be LV00");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

if (lf01.recommended_next_stage?.module_id !== "LV00") {
  fail("LF01 must recommend LV00 as next stage before LV00 proceeds");
}

for (const dep of ["LF01", "LF00", "LR00", "QA01", "QA00"]) {
  if (!registry.depends_on.includes(dep)) fail(`LV00 must depend on ${dep}`);
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
  if (registry[flag] !== false) fail(`${flag} must remain false in LV00`);
}

for (const area of [
  "live_load",
  "deployment_observation",
  "visual",
  "language",
  "responsive",
  "console",
  "navigation",
  "seo",
  "activation_boundary"
]) {
  if (!registry.verification_areas.includes(area)) fail(`Missing verification area: ${area}`);
}

for (const status of [
  "pass",
  "warning",
  "fail",
  "manual_check_required",
  "blocked",
  "not_applicable"
]) {
  if (!registry.allowed_verification_statuses.includes(status)) fail(`Missing verification status: ${status}`);
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (preview.static_evidence.static_evidence_clean !== true) {
  fail("Static evidence must be clean before LV00 manual live verification gate");
}

if (preview.summary.mutation_performed_count !== 0) fail("mutation_performed_count must be zero");
if (preview.summary.activation_performed_count !== 0) fail("activation_performed_count must be zero");

for (const falseField of [
  "homepage_mutation_enabled",
  "asset_mutation_enabled",
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

if (preview.decision.activation_allowed !== false) fail("LV00 must not allow activation");
if (preview.decision.manual_live_browser_check_required !== true) fail("LV00 must require manual browser check");
if (preview.decision.live_verification_decision !== "clean_static_ready_for_manual_live_check") {
  fail("LV00 decision must be clean_static_ready_for_manual_live_check when static evidence is clean");
}

for (const noGoField of [
  "runtime_activation",
  "backend_activation",
  "supabase_activation",
  "auth_activation",
  "api_activation",
  "public_dynamic_output_activation",
  "subscriber_output_activation"
]) {
  if (preview.decision[noGoField] !== "no_go_for_activation") {
    fail(`Preview decision ${noGoField} must be no_go_for_activation`);
  }
}

for (const item of preview.verification_items) {
  if (item.mutation_performed !== false) fail(`Verification item ${item.item_key} must not mutate files`);
  if (item.activation_performed !== false) fail(`Verification item ${item.item_key} must not activate anything`);
  if (!registry.allowed_verification_statuses.includes(item.status)) fail(`Invalid verification status: ${item.status}`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "LV01") {
  fail("LV00 recommended next stage must be LV01");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("LV01 runtime_allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("LV01 deployment_allowed must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("LV01 activation decision must be false");

for (const scriptName of ["generate:lv00", "validate:lv00", "validate:live", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Live Verification Doctrine",
  "Manual Verification Areas",
  "Language Verification",
  "Visual Verification",
  "Console Verification",
  "Live Decision Doctrine",
  "Evidence Boundary",
  "Recommended Follow-up",
  "Explicit Exclusions",
  "LV00 does not"
]) {
  if (!docText.includes(phrase)) fail(`LV00 document missing phrase: ${phrase}`);
}

pass("LV00 registry is present.");
pass("LV00 document is present.");
pass("LV00 manual live verification preview is present and marked preview-only.");
pass("LF01 and QA/LR/LF static evidence is clean.");
pass("Manual live browser verification checklist is declared.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("No homepage, asset, SEO, language runtime, deployment, backend, API, Supabase, Auth, ML, public output, or subscriber output mutation/activation is enabled.");
pass("LV01 is recorded as the recommended manual live verification result-record stage.");
pass("LV00 is manual-live-verification-only and safe to commit.");
