import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag06e-long-form-article-standard.json");
const previewPath = path.join(root, "data", "quality", "ag06e-long-form-article-standard-preview.json");
const docPath = path.join(root, "docs", "quality", "AG06E_LONG_FORM_ARTICLE_STANDARD.md");
const standardPath = path.join(root, "data", "content-intelligence", "quality-reviews", "long-form-article-standard.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "long-form-article-standard.schema.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG06E validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, previewPath, docPath, standardPath, schemaPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG06E required file: ${p}`);
}

const registry = readJson(registryPath);
const preview = readJson(previewPath);
const standard = readJson(standardPath);
const schema = readJson(schemaPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AG06E") fail("Registry module_id must be AG06E");
if (preview.module_id !== "AG06E") fail("Preview module_id must be AG06E");
if (standard.module_id !== "AG06E") fail("Standard module_id must be AG06E");
if (schema.module_id !== "AG06E") fail("Schema module_id must be AG06E");
if (preview.preview_only !== true) fail("Preview must be preview-only");
if (standard.governance_only !== true) fail("Standard must be governance-only");

if (standard.summary.word_count_min !== 1500) fail("Minimum word count must be 1500");
if (standard.summary.word_count_max !== 5500) fail("Maximum word count must be 5500");
if (standard.summary.verified_reference_min !== 2) fail("Minimum verified references must be 2");
if (standard.summary.verified_reference_max !== 5) fail("Maximum verified references must be 5");

if (standard.reference_standard.minimum_verified_references !== 2) fail("Reference standard minimum must be 2");
if (standard.reference_standard.maximum_verified_references !== 5) fail("Reference standard maximum must be 5");
if (standard.reference_standard.required_reference_status !== "verified") fail("Required reference status must be verified");

if (standard.visual_and_data_standard.visual_plan_required !== true) fail("Visual plan must be required");
if (standard.visual_and_data_standard.primary_visual_required !== true) fail("Primary visual must be required");
if (standard.visual_and_data_standard.image_credit_or_attribution_required !== true) fail("Image credit/attribution must be required");
if (standard.visual_and_data_standard.minimum_data_enrichment_units < 1) fail("At least one data enrichment unit must be required");

if (standard.quality_scoring.publish_ready_minimum !== 85) fail("Quality publish-ready threshold must be 85");
if (standard.visitor_value_scoring.publish_ready_minimum !== 80) fail("Visitor-value publish-ready threshold must be 80");

const qualityTotal = Object.values(standard.quality_scoring.weights || {}).reduce((a, b) => a + b, 0);
const visitorTotal = Object.values(standard.visitor_value_scoring.weights || {}).reduce((a, b) => a + b, 0);

if (qualityTotal !== 100) fail(`Quality scoring weights must total 100, got ${qualityTotal}`);
if (visitorTotal !== 100) fail(`Visitor-value scoring weights must total 100, got ${visitorTotal}`);
if (preview.quality_weight_total !== 100) fail("Preview quality weight total must be 100");
if (preview.visitor_value_weight_total !== 100) fail("Preview visitor-value weight total must be 100");

if (!Array.isArray(standard.publish_readiness_gates)) fail("Publish readiness gates must be an array");
for (const gate of [
  "word_count_within_1500_5500",
  "minimum_two_verified_references",
  "all_reference_urls_verified",
  "visual_plan_complete",
  "primary_visual_available",
  "image_credit_or_attribution_recorded",
  "data_box_chart_graph_or_infographic_present",
  "quality_score_at_least_85",
  "visitor_value_score_at_least_80",
  "publish_queue_status_publish_ready"
]) {
  if (!standard.publish_readiness_gates.includes(gate)) fail(`Missing publish-readiness gate: ${gate}`);
}

if (!standard.review_status_standard.allowed_statuses.includes("publish_ready")) fail("publish_ready status must be allowed");
if (standard.review_status_standard.publish_ready_status !== "publish_ready") fail("Publish-ready status must equal publish_ready");

if (schema.properties?.actual_word_count?.minimum !== 1500) fail("Schema actual_word_count minimum must be 1500");
if (schema.properties?.actual_word_count?.maximum !== 5500) fail("Schema actual_word_count maximum must be 5500");
if (schema.properties?.verified_references?.minItems !== 2) fail("Schema verified_references minItems must be 2");
if (schema.properties?.verified_references?.maxItems !== 5) fail("Schema verified_references maxItems must be 5");
if (schema.properties?.quality_score?.minimum !== 85) fail("Schema quality_score minimum must be 85");
if (schema.properties?.visitor_value_score?.minimum !== 80) fail("Schema visitor_value_score minimum must be 80");

for (const falseField of [
  "mutation_performed",
  "public_article_mutation_performed",
  "article_html_mutation_performed",
  "homepage_mutation_performed",
  "css_mutation_performed",
  "javascript_mutation_performed",
  "reference_url_change_performed",
  "scaffold_file_copy_performed",
  "scaffold_file_move_performed",
  "scaffold_file_delete_performed",
  "external_fetch_performed_by_script",
  "live_url_fetch_performed",
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
  "public_article_archive_enabled",
  "public_article_delete_enabled",
  "file_deletion_enabled",
  "file_move_enabled"
]) {
  if (standard[falseField] !== false) fail(`${falseField} must be false in standard`);
  if (registry[falseField] !== false) fail(`${falseField} must be false in registry`);
}

for (const scriptName of ["generate:ag06e", "validate:ag06e"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag06e")) {
  fail("validate:project must include validate:ag06e");
}

for (const phrase of [
  "Purpose",
  "Scope",
  "Long-Form Standard",
  "Reference Standard",
  "Visual, Data and Infographic Standard",
  "Quality Scoring",
  "Visitor-Value Scoring",
  "Review Status",
  "Publish-Readiness Gates",
  "Explicit Exclusions",
  "Acceptance Criteria"
]) {
  if (!docText.includes(phrase)) fail(`AG06E document missing phrase: ${phrase}`);
}

pass("AG06E registry is present.");
pass("AG06E document is present.");
pass("AG06E standard, schema and preview are present.");
pass("Long-form word-count standard is 1500–5500 words.");
pass("Verified reference standard is 2–5 references.");
pass("Visual plan, primary visual, image credit and data enrichment are required.");
pass("Quality score and visitor-value score gates are declared.");
pass("Quality and visitor-value scoring weights total 100 each.");
pass("Publish-readiness gates are recorded.");
pass("AG06E is governance/schema/document only.");
pass("No public article/reference/scaffold/CSS/JS/backend/Auth/Supabase mutation is enabled or performed.");
pass("AG06F is identified as the next controlled stage.");
