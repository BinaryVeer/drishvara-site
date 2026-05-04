import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "content", "c12-content-asset-verification-review-workflow-preview.json");
const docPath = path.join(process.cwd(), "docs", "content", "C12_CONTENT_ASSET_VERIFICATION_REVIEW_WORKFLOW_PREVIEW.md");
const previewPath = path.join(process.cwd(), "data", "content", "content-asset-verification-review-preview.json");
const c11PreviewPath = path.join(process.cwd(), "data", "content", "content-asset-inventory-preview.json");
const packagePath = path.join(process.cwd(), "package.json");
const c10Path = path.join(process.cwd(), "data", "content", "c10-content-asset-registry-ml-eligibility-governance.json");
const c11Path = path.join(process.cwd(), "data", "content", "c11-content-asset-inventory-extraction-preview.json");

function fail(message) {
  console.error(`❌ C12 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, c11PreviewPath, packagePath, c10Path, c11Path]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing C12 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const c11Preview = JSON.parse(fs.readFileSync(c11PreviewPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const c10 = JSON.parse(fs.readFileSync(c10Path, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "C12") fail("module_id must be C12");
if (preview.module_id !== "C12") fail("preview output module_id must be C12");
if (preview.preview_only !== true) fail("preview output must be marked preview_only=true");

for (const dep of ["C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "I00"]) {
  if (!registry.depends_on.includes(dep)) fail(`C12 must depend on ${dep}`);
}

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
  "approval_enabled",
  "public_safe_approval_enabled",
  "source_approval_enabled",
  "rights_approval_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "model_training_enabled",
  "vector_database_write_enabled",
  "link_crawling_enabled",
  "image_download_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in C12`);
}

if (c10.default_eligibility?.ml_training_eligible !== false) fail("C10 default ML training eligibility must remain false");

for (const field of registry.preview_output_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (!Array.isArray(preview.review_items)) fail("Preview review_items must be an array");
if (!Array.isArray(c11Preview.candidate_assets)) fail("C11 candidate_assets must be an array");

if (preview.summary?.review_item_count !== preview.review_items.length) {
  fail("Preview summary review_item_count must match review_items length");
}

if (preview.review_items.length !== c11Preview.candidate_assets.length) {
  fail("C12 review item count must match C11 candidate asset count");
}

for (const item of preview.review_items) {
  for (const field of registry.review_item_required_fields) {
    if (!(field in item)) fail(`Review item missing field: ${field}`);
  }

  if (!registry.review_statuses.includes(item.review_status)) {
    fail(`Invalid review status: ${item.review_status}`);
  }

  if (!registry.review_priorities.includes(item.review_priority)) {
    fail(`Invalid review priority: ${item.review_priority}`);
  }

  if (item.public_approval_granted !== false) fail(`Review item ${item.review_item_id} must not grant public approval`);
  if (item.ml_training_eligible !== false) fail(`Review item ${item.review_item_id} must default ml_training_eligible=false`);
  if (item.embedding_eligible !== false) fail(`Review item ${item.review_item_id} must default embedding_eligible=false`);
  if (item.registry_write_allowed !== false) fail(`Review item ${item.review_item_id} must default registry_write_allowed=false`);
}

if (preview.summary?.public_approval_granted_count !== 0) fail("Public approval granted count must be zero in C12");
if (preview.summary?.ml_training_eligible_count !== 0) fail("ML training eligible count must be zero in C12");
if (preview.summary?.embedding_eligible_count !== 0) fail("Embedding eligible count must be zero in C12");
if (preview.summary?.registry_write_allowed_count !== 0) fail("Registry write allowed count must be zero in C12");

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview output missing blocked capability: ${blocked}`);
  }
}

for (const scriptName of ["generate:c12", "validate:c12", "validate:content", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Review Workflow Doctrine",
  "Review Status Doctrine",
  "Review Priority Doctrine",
  "Basic Metadata Check Doctrine",
  "Eligibility Recommendation Doctrine",
  "Human Review Doctrine",
  "Review Action Options",
  "Explicit Exclusions",
  "Safety Doctrine",
  "C12 does not"
]) {
  if (!docText.includes(phrase)) fail(`C12 document missing phrase: ${phrase}`);
}

pass("C12 registry is present.");
pass("C12 document is present.");
pass("C12 review workflow preview output is present and marked preview-only.");
pass("Review workflow recommendations are generated for all C11 candidate assets.");
pass("No asset is approved; public approval, ML eligibility, embedding eligibility, and registry write remain false.");
pass("Mutation, admin review, Supabase, Auth, payment, external API, ML, embedding, public output, and subscriber output remain disabled.");
pass("C12 is read-only verification/review workflow preview and safe to commit.");
