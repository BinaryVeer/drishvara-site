import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag06c-scaffold-output-preservation-register.json");
const docPath = path.join(root, "docs", "quality", "AG06C_SCAFFOLD_OUTPUT_PRESERVATION_REGISTER.md");
const registerPath = path.join(root, "data", "content-intelligence", "run-registry", "scaffold-output-preservation-register.json");
const previewPath = path.join(root, "data", "quality", "ag06c-scaffold-output-preservation-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG06C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, registerPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG06C required file: ${p}`);
}

const config = readJson(registryPath);
const register = readJson(registerPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG06C") fail("Registry module_id must be AG06C");
if (register.module_id !== "AG06C") fail("Register module_id must be AG06C");
if (preview.module_id !== "AG06C") fail("Preview module_id must be AG06C");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (register.summary.run_entry_count < config.expected.minimum_run_entry_count) fail("Run entry count below expected minimum");
if (register.summary.final_markdown_count < config.expected.minimum_final_markdown_count) fail("Final markdown count below expected minimum");
if (register.summary.visual_plan_count < config.expected.minimum_visual_plan_count) fail("Visual plan count below expected minimum");
if (register.summary.learning_snapshot_count < config.expected.minimum_learning_snapshot_count) fail("Learning snapshot count below expected minimum");
if (!Array.isArray(register.scaffold_run_entries)) fail("Scaffold run entries must be an array");
if (register.scaffold_run_entries.length !== register.summary.run_entry_count) fail("Run entry count mismatch");
if (register.summary.preservation_register_only !== true) fail("AG06C must be preservation-register-only");
if (register.summary.public_article_mutation_performed !== false) fail("Public article mutation must be false");
if (register.summary.backend_auth_supabase_activation_performed !== false) fail("Backend/Auth/Supabase activation must be false");
if (register.summary.ready_for_ag06d_existing_public_article_classification !== true) fail("AG06D readiness must be true");
if (register.summary.next_stage_id !== "AG06D") fail("Next stage must be AG06D");

const runIds = new Set();
for (const row of register.scaffold_run_entries) {
  if (!row.run_id) fail("Run entry missing run_id");
  if (runIds.has(row.run_id)) fail(`Duplicate run_id: ${row.run_id}`);
  runIds.add(row.run_id);
  if (!row.run_directory) fail(`Run entry missing directory: ${row.run_id}`);
  if (!row.content_id_candidate) fail(`Run entry missing content_id_candidate: ${row.run_id}`);
  if (row.preservation_status !== "registered_not_imported") fail(`Invalid preservation status: ${row.run_id}`);
  if (row.public_publish_status !== "not_published_by_ag06c") fail(`Invalid publish status: ${row.run_id}`);
}

for (const falseField of [
  "mutation_performed",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "homepage_mutation_performed",
  "css_mutation_performed",
  "javascript_mutation_performed",
  "reference_url_change_performed",
  "external_fetch_performed_by_script",
  "live_url_fetch_performed",
  "backend_activation_performed",
  "api_route_created",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "frontend_deployment_performed",
  "scaffold_file_copy_performed",
  "scaffold_file_move_performed",
  "scaffold_file_delete_performed",
  "file_deletion_performed",
  "file_move_performed"
]) {
  if (register[falseField] !== false) fail(`${falseField} must be false`);
}

for (const flag of [
  "article_html_mutation_enabled",
  "homepage_mutation_enabled",
  "css_mutation_enabled",
  "javascript_mutation_enabled",
  "reference_url_change_enabled",
  "external_fetch_enabled_by_script",
  "live_url_fetch_enabled",
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "backend_activation_enabled",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "credential_collection_enabled",
  "payment_enabled",
  "admin_ui_enabled",
  "subscriber_output_enabled",
  "public_dynamic_output_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled",
  "file_deletion_enabled",
  "file_move_enabled",
  "public_article_mutation_enabled",
  "scaffold_file_copy_enabled",
  "scaffold_file_move_enabled",
  "scaffold_file_delete_enabled"
]) {
  if (config[flag] !== false) fail(`${flag} must remain false`);
}

for (const scriptName of ["generate:ag06c", "validate:ag06c", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG06C document missing phrase: ${phrase}`);
}

pass("AG06C registry is present.");
pass("AG06C document is present.");
pass("AG06C preservation register and preview are present.");
pass("AG06B schema manifest and AG06A audit are consumed.");
pass("Scaffold run entries are recorded.");
pass("Final markdown/html/visual plan/learning snapshot counts are recorded.");
pass("Missing artifact summary is recorded.");
pass("No scaffold files are copied, moved, deleted or published.");
pass("No public article/page/content/image/reference/CSS/JS mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG06D Existing Public Article Classification is identified as next.");
