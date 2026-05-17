import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag06b-content-intelligence-schema.json");
const docPath = path.join(root, "docs", "quality", "AG06B_CONTENT_INTELLIGENCE_SCHEMA.md");
const manifestPath = path.join(root, "data", "content-intelligence", "schema", "content-intelligence-schema-manifest.json");
const previewPath = path.join(root, "data", "quality", "ag06b-content-intelligence-schema-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG06B validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, manifestPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG06B required file: ${p}`);
}

const config = readJson(registryPath);
const manifest = readJson(manifestPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG06B") fail("Registry module_id must be AG06B");
if (manifest.module_id !== "AG06B") fail("Manifest module_id must be AG06B");
if (preview.module_id !== "AG06B") fail("Preview module_id must be AG06B");
if (preview.preview_only !== true) fail("Preview must be preview-only");

for (const folder of Object.values(config.content_intelligence_roots)) {
  if (!fs.existsSync(path.join(root, folder))) fail(`Missing content-intelligence folder: ${folder}`);
}

const schemaPaths = [
  config.schema_outputs.content_packet_schema,
  config.schema_outputs.run_registry_schema,
  config.schema_outputs.reference_registry_schema,
  config.schema_outputs.visual_registry_schema,
  config.schema_outputs.quality_review_schema,
  config.schema_outputs.publish_queue_schema,
  config.schema_outputs.learning_snapshot_schema
];

for (const schemaPath of schemaPaths) {
  const full = path.join(root, schemaPath);
  if (!fs.existsSync(full)) fail(`Missing schema output: ${schemaPath}`);
  const schema = readJson(full);
  if (!schema.schema_id) fail(`Schema missing schema_id: ${schemaPath}`);
  if (schema.governance_module !== "AG06B") fail(`Schema governance module mismatch: ${schemaPath}`);
  if (schema.public_article_mutation_allowed !== false) fail(`Public article mutation must be false: ${schemaPath}`);
  if (schema.backend_activation_allowed !== false) fail(`Backend activation must be false: ${schemaPath}`);
  if (schema.supabase_activation_allowed !== false) fail(`Supabase activation must be false: ${schemaPath}`);
  if (schema.auth_activation_allowed !== false) fail(`Auth activation must be false: ${schemaPath}`);
}

const contentPacket = readJson(path.join(root, config.schema_outputs.content_packet_schema));
for (const section of config.required_content_packet_sections) {
  if (!contentPacket.fields?.[section]) fail(`Content packet missing required section: ${section}`);
}

if (manifest.summary.schema_file_count !== schemaPaths.length) fail("Schema file count mismatch");
if (manifest.summary.content_packet_required_section_count !== config.required_content_packet_sections.length) fail("Required content packet section count mismatch");
if (manifest.summary.public_article_mutation_performed !== false) fail("Public article mutation must be false");
if (manifest.summary.reference_url_change_performed !== false) fail("Reference URL change must be false");
if (manifest.summary.backend_auth_supabase_activation_performed !== false) fail("Backend/Auth/Supabase activation must be false");
if (manifest.summary.ready_for_ag06c_scaffold_output_preservation_register !== true) fail("AG06C readiness must be true");
if (manifest.summary.next_stage_id !== "AG06C") fail("Next stage must be AG06C");

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
  "file_move_enabled"
]) {
  if (config[flag] !== false) fail(`${flag} must remain false`);
}

for (const scriptName of ["generate:ag06b", "validate:ag06b", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG06B document missing phrase: ${phrase}`);
}

pass("AG06B registry is present.");
pass("AG06B document is present.");
pass("AG06B schema manifest and preview are present.");
pass("Content-intelligence folder structure is present.");
pass("Content packet schema is generated.");
pass("Run, reference, visual, quality, publish queue and learning schemas are generated.");
pass("Content packet required sections are represented.");
pass("AG06A findings are consumed.");
pass("No public article/page/content/image/reference/CSS/JS mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG06C Scaffold Output Preservation Register is identified as next.");
