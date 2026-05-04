import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "content", "c15-content-governance-consolidated-asset-readiness-matrix.json");
const docPath = path.join(process.cwd(), "docs", "content", "C15_CONTENT_GOVERNANCE_CONSOLIDATED_ASSET_READINESS_MATRIX.md");
const matrixPath = path.join(process.cwd(), "data", "content", "content-governance-asset-readiness-matrix.json");
const inventoryPath = path.join(process.cwd(), "data", "content", "content-asset-inventory-preview.json");
const verificationPath = path.join(process.cwd(), "data", "content", "content-asset-verification-review-preview.json");
const dryRunPath = path.join(process.cwd(), "data", "content", "content-review-queue-import-dry-run-preview.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ C15 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, matrixPath, inventoryPath, verificationPath, dryRunPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing C15 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
const verification = JSON.parse(fs.readFileSync(verificationPath, "utf8"));
const dryRun = JSON.parse(fs.readFileSync(dryRunPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "C15") fail("module_id must be C15");
if (matrix.module_id !== "C15") fail("matrix output module_id must be C15");
if (matrix.preview_only !== true) fail("matrix output must be preview_only=true");

for (const dep of ["C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C12", "C13", "C14", "I00"]) {
  if (!registry.depends_on.includes(dep)) fail(`C15 must depend on ${dep}`);
}

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "subscriber_output_enabled",
  "public_output_enabled",
  "external_api_fetch_enabled",
  "auth_enabled",
  "payment_enabled",
  "supabase_enabled",
  "rls_enabled",
  "admin_review_enabled",
  "admin_ui_enabled",
  "admin_route_enabled",
  "review_queue_write_enabled",
  "live_review_queue_enabled",
  "reviewer_assignment_enabled",
  "approval_enabled",
  "public_safe_approval_enabled",
  "source_approval_enabled",
  "rights_approval_enabled",
  "image_approval_enabled",
  "quality_approval_enabled",
  "ml_training_approval_enabled",
  "embedding_approval_enabled",
  "article_mutation_enabled",
  "homepage_mutation_enabled",
  "sitemap_mutation_enabled",
  "seo_metadata_mutation_enabled",
  "image_registry_write_enabled",
  "verified_link_registry_write_enabled",
  "quality_metadata_write_enabled",
  "selection_memory_write_enabled",
  "manual_override_enabled",
  "final_registry_write_enabled",
  "database_migration_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "model_training_enabled",
  "vector_database_write_enabled",
  "link_crawling_enabled",
  "image_download_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in C15`);
}

for (const field of registry.matrix_output_required_fields) {
  if (!(field in matrix)) fail(`Matrix output missing field: ${field}`);
}

if (!Array.isArray(matrix.readiness_matrix)) fail("readiness_matrix must be an array");

const candidateCount = Array.isArray(inventory.candidate_assets) ? inventory.candidate_assets.length : -1;
const reviewCount = Array.isArray(verification.review_items) ? verification.review_items.length : -1;
const queueCount = Array.isArray(dryRun.queue_candidate_records) ? dryRun.queue_candidate_records.length : -1;
const rowCount = matrix.readiness_matrix.length;

if (candidateCount !== reviewCount || reviewCount !== queueCount || queueCount !== rowCount) {
  fail(`Counts must reconcile. inventory=${candidateCount}, review=${reviewCount}, queue=${queueCount}, matrix=${rowCount}`);
}

if (matrix.summary?.count_reconciliation_status !== "matched") {
  fail("count_reconciliation_status must be matched");
}

for (const field of registry.summary_required_fields) {
  if (!(field in matrix.summary)) fail(`Summary missing field: ${field}`);
}

for (const row of matrix.readiness_matrix) {
  for (const field of registry.matrix_row_required_fields) {
    if (!(field in row)) fail(`Readiness row missing field: ${field}`);
  }

  if (!registry.allowed_readiness_statuses.includes(row.readiness_status)) {
    fail(`Invalid readiness status: ${row.readiness_status}`);
  }

  for (const dimension of registry.readiness_dimensions) {
    if (!(dimension in row.readiness_dimensions)) {
      fail(`Readiness row ${row.asset_id} missing dimension: ${dimension}`);
    }
  }

  if (row.public_approval_granted !== false) fail(`Row ${row.asset_id} must not grant public approval`);
  if (row.ml_training_eligible !== false) fail(`Row ${row.asset_id} must default ml_training_eligible=false`);
  if (row.embedding_eligible !== false) fail(`Row ${row.asset_id} must default embedding_eligible=false`);
  if (row.registry_write_allowed !== false) fail(`Row ${row.asset_id} must default registry_write_allowed=false`);
}

if (matrix.summary.public_approval_granted_count !== 0) fail("Public approval granted count must be zero");
if (matrix.summary.ml_training_eligible_count !== 0) fail("ML training eligible count must be zero");
if (matrix.summary.embedding_eligible_count !== 0) fail("Embedding eligible count must be zero");
if (matrix.summary.registry_write_allowed_count !== 0) fail("Registry write allowed count must be zero");

for (const gate of registry.gates_preserved_required) {
  if (matrix.gates_preserved?.[gate] !== true) {
    fail(`Gate must be preserved: ${gate}`);
  }
}

for (const blocked of registry.blocked_capabilities) {
  if (!matrix.blocked_capabilities.includes(blocked)) {
    fail(`Matrix output missing blocked capability: ${blocked}`);
  }
}

for (const scriptName of ["generate:c15", "validate:c15", "validate:content", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Readiness Matrix Doctrine",
  "Readiness Dimension Doctrine",
  "Summary Doctrine",
  "Gate Doctrine",
  "Future Use Doctrine",
  "Explicit Exclusions",
  "Safety Doctrine",
  "C15 does not"
]) {
  if (!docText.includes(phrase)) fail(`C15 document missing phrase: ${phrase}`);
}

pass("C15 registry is present.");
pass("C15 document is present.");
pass("C15 consolidated asset readiness matrix output is present and marked preview-only.");
pass("C11, C12, and C14 counts reconcile across candidate assets, review items, dry-run queue candidates, and matrix rows.");
pass("Readiness statuses and dimensions are generated.");
pass("No public approval, ML eligibility, embedding eligibility, registry write, live queue, admin, Supabase, Auth, public output, or subscriber output is enabled.");
pass("C15 is content-governance matrix-only and safe to commit.");
