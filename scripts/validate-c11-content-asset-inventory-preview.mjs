import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "content", "c11-content-asset-inventory-extraction-preview.json");
const docPath = path.join(process.cwd(), "docs", "content", "C11_CONTENT_ASSET_INVENTORY_EXTRACTION_PREVIEW.md");
const previewPath = path.join(process.cwd(), "data", "content", "content-asset-inventory-preview.json");
const packagePath = path.join(process.cwd(), "package.json");
const c10Path = path.join(process.cwd(), "data", "content", "c10-content-asset-registry-ml-eligibility-governance.json");
const i00Path = path.join(process.cwd(), "data", "implementation", "i00-implementation-planning-safe-architecture-blueprint.json");

function fail(message) {
  console.error(`❌ C11 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, packagePath, c10Path, i00Path]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing C11 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const c10 = JSON.parse(fs.readFileSync(c10Path, "utf8"));
const i00 = JSON.parse(fs.readFileSync(i00Path, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "C11") fail("module_id must be C11");
if (preview.module_id !== "C11") fail("preview output module_id must be C11");
if (preview.preview_only !== true) fail("preview output must be marked preview_only=true");

for (const dep of ["C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "I00"]) {
  if (!registry.depends_on.includes(dep)) fail(`C11 must depend on ${dep}`);
}

if (c10.default_eligibility?.ml_training_eligible !== false) fail("C10 must default ML training eligibility to false");
if (i00.next_content_specific_module?.module_id !== "C10") fail("I00 must still declare C10 as content boundary before C11");

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "subscriber_output_enabled",
  "public_output_enabled",
  "public_guidance_enabled",
  "external_api_fetch_enabled",
  "auth_enabled",
  "payment_enabled",
  "supabase_enabled",
  "admin_review_enabled",
  "article_mutation_enabled",
  "homepage_mutation_enabled",
  "sitemap_mutation_enabled",
  "seo_metadata_mutation_enabled",
  "image_registry_write_enabled",
  "quality_metadata_write_enabled",
  "review_queue_write_enabled",
  "selection_memory_write_enabled",
  "manual_override_enabled",
  "final_registry_write_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "model_training_enabled",
  "vector_database_write_enabled",
  "link_crawling_enabled",
  "image_download_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in C11`);
}

for (const field of registry.preview_output_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (!Array.isArray(preview.candidate_assets)) fail("Preview candidate_assets must be an array");
if (preview.summary?.candidate_article_count !== preview.candidate_assets.length) {
  fail("Preview summary candidate_article_count must match candidate_assets length");
}

for (const asset of preview.candidate_assets) {
  for (const field of registry.candidate_asset_required_fields) {
    if (!(field in asset)) fail(`Candidate asset missing field: ${field}`);
  }
  if (asset.ml_training_eligible !== false) fail(`Candidate ${asset.asset_id} must default ml_training_eligible=false`);
  if (asset.embedding_eligible !== false) fail(`Candidate ${asset.asset_id} must default embedding_eligible=false`);
  if (asset.registry_write_allowed !== false) fail(`Candidate ${asset.asset_id} must default registry_write_allowed=false`);
}

if (preview.summary?.ml_training_eligible_count !== 0) fail("ML training eligible count must be zero in C11");
if (preview.summary?.embedding_eligible_count !== 0) fail("Embedding eligible count must be zero in C11");
if (preview.summary?.registry_write_allowed_count !== 0) fail("Registry write allowed count must be zero in C11");

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview output missing blocked capability: ${blocked}`);
  }
}

for (const scriptName of ["generate:c11", "validate:c11", "validate:content", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Source Files",
  "Output File",
  "Extraction Doctrine",
  "Homepage Featured Read Preview Doctrine",
  "SEO Metadata Preview Doctrine",
  "Image Preview Doctrine",
  "Eligibility Default Doctrine",
  "Duplicate Preview Doctrine",
  "Quality Preview Doctrine",
  "Safety Doctrine",
  "C11 does not"
]) {
  if (!docText.includes(phrase)) fail(`C11 document missing phrase: ${phrase}`);
}

pass("C11 registry is present.");
pass("C11 document is present.");
pass("C11 preview output is present and marked preview-only.");
pass("Source file read status and candidate asset extraction preview are recorded.");
pass("Candidate assets default to ML-training=false, embedding=false, and registry-write=false.");
pass("Mutation, Supabase, Auth, payment, external API, ML, embedding, public output, and subscriber output remain disabled.");
pass("C11 is read-only content inventory preview and safe to commit.");
