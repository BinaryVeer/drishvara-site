import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "content", "c14-content-review-queue-import-dry-run-plan.json");
const docPath = path.join(process.cwd(), "docs", "content", "C14_CONTENT_REVIEW_QUEUE_IMPORT_DRY_RUN_PLAN.md");
const dryRunPath = path.join(process.cwd(), "data", "content", "content-review-queue-import-dry-run-preview.json");
const c12PreviewPath = path.join(process.cwd(), "data", "content", "content-asset-verification-review-preview.json");
const c13Path = path.join(process.cwd(), "data", "content", "c13-content-asset-review-queue-admin-boundary-plan.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ C14 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, dryRunPath, c12PreviewPath, c13Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing C14 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const dryRun = JSON.parse(fs.readFileSync(dryRunPath, "utf8"));
const c12Preview = JSON.parse(fs.readFileSync(c12PreviewPath, "utf8"));
const c13 = JSON.parse(fs.readFileSync(c13Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "C14") fail("module_id must be C14");
if (dryRun.module_id !== "C14") fail("dry-run output module_id must be C14");
if (dryRun.preview_only !== true) fail("dry-run output must be preview_only=true");
if (dryRun.dry_run_only !== true) fail("dry-run output must be dry_run_only=true");

if (c12Preview.module_id !== "C12" || c12Preview.preview_only !== true) {
  fail("C14 requires C12 preview output to exist and remain preview-only");
}

if (c13.module_id !== "C13") fail("C14 requires C13 schema/boundary registry");

for (const dep of ["C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C12", "C13", "I00"]) {
  if (!registry.depends_on.includes(dep)) fail(`C14 must depend on ${dep}`);
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
  if (registry[flag] !== false) fail(`${flag} must remain false in C14`);
}

for (const field of registry.dry_run_output_required_fields) {
  if (!(field in dryRun)) fail(`Dry-run output missing field: ${field}`);
}

if (!Array.isArray(dryRun.queue_candidate_records)) {
  fail("Dry-run queue_candidate_records must be an array");
}

const reviewItemCount = Array.isArray(c12Preview.review_items) ? c12Preview.review_items.length : -1;
if (dryRun.queue_candidate_records.length !== reviewItemCount) {
  fail("Dry-run queue candidate count must match C12 review item count");
}

if (dryRun.summary?.queue_candidate_count !== dryRun.queue_candidate_records.length) {
  fail("Dry-run summary queue_candidate_count must match records length");
}

for (const record of dryRun.queue_candidate_records) {
  for (const field of registry.queue_candidate_required_fields) {
    if (!(field in record)) fail(`Queue candidate missing field: ${field}`);
  }

  if (record.approval_status !== "not_approved") fail(`Queue candidate ${record.queue_item_id} must not be approved`);
  if (record.ml_training_eligible !== false) fail(`Queue candidate ${record.queue_item_id} must default ml_training_eligible=false`);
  if (record.embedding_eligible !== false) fail(`Queue candidate ${record.queue_item_id} must default embedding_eligible=false`);
  if (record.registry_write_allowed !== false) fail(`Queue candidate ${record.queue_item_id} must default registry_write_allowed=false`);
}

if (dryRun.summary?.approval_granted_count !== 0) fail("Approval granted count must be zero");
if (dryRun.summary?.ml_training_eligible_count !== 0) fail("ML training eligible count must be zero");
if (dryRun.summary?.embedding_eligible_count !== 0) fail("Embedding eligible count must be zero");
if (dryRun.summary?.registry_write_allowed_count !== 0) fail("Registry write allowed count must be zero");
if (dryRun.summary?.live_queue_created !== false) fail("Live queue created must be false");
if (dryRun.summary?.admin_enabled !== false) fail("Admin enabled must be false");
if (dryRun.summary?.supabase_enabled !== false) fail("Supabase enabled must be false");
if (dryRun.summary?.public_output_enabled !== false) fail("Public output enabled must be false");
if (dryRun.summary?.subscriber_output_enabled !== false) fail("Subscriber output enabled must be false");

for (const check of registry.safety_checks_required) {
  if (dryRun.safety_checks?.[check] !== true) {
    fail(`Safety check must be true: ${check}`);
  }
}

for (const forbiddenPath of registry.forbidden_live_output_files) {
  if (fs.existsSync(path.join(process.cwd(), forbiddenPath))) {
    fail(`Forbidden live output file exists: ${forbiddenPath}`);
  }
}

for (const blocked of registry.blocked_capabilities) {
  if (!dryRun.blocked_capabilities.includes(blocked)) {
    fail(`Dry-run output missing blocked capability: ${blocked}`);
  }
}

for (const scriptName of ["generate:c14", "validate:c14", "validate:content", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Dry-Run Import Doctrine",
  "Mapping Doctrine",
  "Queue ID Doctrine",
  "Status Mapping Doctrine",
  "Reviewer Role Mapping Doctrine",
  "Approval Default Doctrine",
  "Import Safety Check Doctrine",
  "Explicit Exclusions",
  "Safety Doctrine",
  "C14 does not"
]) {
  if (!docText.includes(phrase)) fail(`C14 document missing phrase: ${phrase}`);
}

pass("C14 registry is present.");
pass("C14 document is present.");
pass("C14 dry-run import preview output is present and marked preview-only/dry-run-only.");
pass("C12 review items are mapped into future queue candidate records.");
pass("Queue candidate count matches C12 review item count.");
pass("No live queue, approval, registry write, Supabase, Auth, admin, ML, embedding, public output, or subscriber output is enabled.");
pass("C14 is content-governance dry-run-only and safe to commit.");
