import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "lf01-targeted-homepage-asset-link-fix-patch.json");
const docPath = path.join(root, "docs", "quality", "LF01_TARGETED_HOMEPAGE_ASSET_LINK_FIX_PATCH.md");
const planPath = path.join(root, "data", "quality", "lf01-targeted-homepage-fix-plan-preview.json");
const applyPath = path.join(root, "data", "quality", "lf01-targeted-homepage-fix-apply-result.json");
const lf00Path = path.join(root, "data", "quality", "lf00-homepage-asset-link-findings-review-fix-plan.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ LF01 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, planPath, applyPath, lf00Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing LF01 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
const apply = JSON.parse(fs.readFileSync(applyPath, "utf8"));
const lf00 = JSON.parse(fs.readFileSync(lf00Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "LF01") fail("module_id must be LF01");
if (plan.module_id !== "LF01") fail("LF01 plan module_id must be LF01");
if (apply.module_id !== "LF01") fail("LF01 apply result module_id must be LF01");
if (plan.preview_only !== true) fail("LF01 plan must be preview_only");

if (lf00.recommended_next_stage?.module_id !== "LF01") {
  fail("LF00 must recommend LF01 as next stage before LF01 proceeds");
}

for (const dep of ["LF00", "LR00", "QA01", "QA00"]) {
  if (!registry.depends_on.includes(dep)) fail(`LF01 must depend on ${dep}`);
}

if (registry.limited_homepage_reference_fix_enabled !== true) {
  fail("LF01 must enable only limited homepage reference fix");
}

for (const flag of [
  "homepage_broad_mutation_enabled",
  "asset_file_mutation_enabled",
  "css_content_mutation_enabled",
  "javascript_content_mutation_enabled",
  "seo_text_mutation_enabled",
  "sitemap_mutation_enabled",
  "language_runtime_logic_mutation_enabled",
  "file_deletion_enabled",
  "file_move_enabled",
  "new_page_creation_enabled",
  "new_asset_creation_enabled",
  "gitignore_modification_enabled",
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
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "model_training_enabled",
  "vector_database_write_enabled",
  "external_api_fetch_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled",
  "activation_decision_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in LF01`);
}

for (const field of registry.preview_required_fields) {
  if (!(field in plan)) fail(`LF01 plan missing field: ${field}`);
}

for (const field of registry.apply_result_required_fields) {
  if (!(field in apply)) fail(`LF01 apply result missing field: ${field}`);
}

for (const modified of apply.modified_files || []) {
  if (!registry.allowed_mutation_files.includes(modified)) {
    fail(`LF01 may modify only allowed files. Unexpected modified file: ${modified}`);
  }
}

for (const fix of apply.applied_reference_fixes || []) {
  if (fix.modified_file !== "index.html") fail(`Applied fix ${fix.finding_id} must modify only index.html`);
  if (fix.mutation_type !== "string_reference_replacement_only") {
    fail(`Applied fix ${fix.finding_id} must be string reference replacement only`);
  }
  if (!fix.original_reference || !fix.replacement_reference) {
    fail(`Applied fix ${fix.finding_id} must record original and replacement reference`);
  }
}

if (apply.summary.file_deletion_performed !== false) fail("LF01 must not delete files");
if (apply.summary.file_move_performed !== false) fail("LF01 must not move files");
if (apply.summary.new_page_created !== false) fail("LF01 must not create pages");
if (apply.summary.new_asset_created !== false) fail("LF01 must not create assets");
if (apply.summary.backend_activation_performed !== false) fail("LF01 must not activate backend");
if (apply.summary.api_route_created !== false) fail("LF01 must not create API routes");
if (apply.summary.supabase_enabled !== false) fail("LF01 must not enable Supabase");
if (apply.summary.auth_enabled !== false) fail("LF01 must not enable Auth");
if (apply.summary.frontend_deployment_performed !== false) fail("LF01 must not deploy frontend");

for (const blocked of registry.blocked_capabilities) {
  if (!plan.blocked_capabilities.includes(blocked)) fail(`Plan missing blocked capability: ${blocked}`);
  if (!apply.blocked_capabilities.includes(blocked)) fail(`Apply result missing blocked capability: ${blocked}`);
}

if (registry.recommended_next_stage?.module_id !== "LV00") {
  fail("LF01 recommended next stage must be LV00");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("LV00 runtime_allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("LV00 deployment_allowed must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("LV00 activation decision must be false");

for (const scriptName of ["generate:lf01", "apply:lf01", "validate:lf01", "validate:findings", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Limited Mutation Doctrine",
  "Safe Correction Rule",
  "Asset Fix Rule",
  "Link Fix Rule",
  "Backup and Archive Rule",
  "Post-Fix Refresh Rule",
  "Explicit Exclusions",
  "LF01 does not"
]) {
  if (!docText.includes(phrase)) fail(`LF01 document missing phrase: ${phrase}`);
}

pass("LF01 registry is present.");
pass("LF01 document is present.");
pass("LF01 targeted fix plan and apply result are present.");
pass("LF01 used only limited homepage reference replacement scope.");
pass("No file deletion, movement, new page, new asset, backend, API, Supabase, Auth, deployment, public output, or subscriber output is enabled.");
pass("LV00 is recorded as the recommended manual live verification stage.");
pass("LF01 is targeted homepage asset/link fix patch and safe to commit.");
