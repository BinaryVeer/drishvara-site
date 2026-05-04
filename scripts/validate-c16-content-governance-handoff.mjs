import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "content", "c16-content-governance-close-out-implementation-handoff.json");
const docPath = path.join(process.cwd(), "docs", "content", "C16_CONTENT_GOVERNANCE_CLOSE_OUT_IMPLEMENTATION_HANDOFF.md");
const handoffDocPath = path.join(process.cwd(), "docs", "content", "CONTENT_GOVERNANCE_IMPLEMENTATION_HANDOFF.md");
const handoffJsonPath = path.join(process.cwd(), "data", "content", "content-governance-implementation-handoff.json");
const matrixPath = path.join(process.cwd(), "data", "content", "content-governance-asset-readiness-matrix.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ C16 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, handoffDocPath, handoffJsonPath, matrixPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing C16 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const handoff = JSON.parse(fs.readFileSync(handoffJsonPath, "utf8"));
const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");
const handoffText = fs.readFileSync(handoffDocPath, "utf8");

if (registry.module_id !== "C16") fail("module_id must be C16");
if (handoff.generated_by !== "C16") fail("handoff must be generated_by C16");

for (const dep of ["C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C12", "C13", "C14", "C15", "I00"]) {
  if (!registry.depends_on.includes(dep)) fail(`C16 must depend on ${dep}`);
}

for (const moduleId of ["C10", "C11", "C12", "C13", "C14", "C15"]) {
  if (!registry.content_governance_modules_closed.includes(moduleId)) {
    fail(`C16 must close module ${moduleId}`);
  }
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
  if (registry[flag] !== false) fail(`${flag} must remain false in C16`);
}

for (const flag of [
  "runtime_enabled",
  "public_output_enabled",
  "subscriber_output_enabled",
  "admin_enabled",
  "supabase_enabled",
  "auth_enabled",
  "payment_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "model_training_enabled",
  "vector_database_write_enabled"
]) {
  if (handoff[flag] !== false) fail(`handoff ${flag} must remain false`);
}

const counts = registry.consolidated_counts;
const matrixSummary = matrix.summary;

if (counts.candidate_asset_count !== matrixSummary.candidate_asset_count) fail("Candidate asset count must match C15 matrix");
if (counts.review_workflow_item_count !== matrixSummary.review_item_count) fail("Review workflow item count must match C15 matrix");
if (counts.dry_run_queue_candidate_count !== matrixSummary.dry_run_queue_candidate_count) fail("Dry-run queue candidate count must match C15 matrix");
if (counts.readiness_matrix_row_count !== matrixSummary.matrix_row_count) fail("Readiness matrix row count must match C15 matrix");

for (const zeroField of [
  "public_approval_granted_count",
  "ml_training_eligible_count",
  "embedding_eligible_count",
  "registry_write_allowed_count"
]) {
  if (counts[zeroField] !== 0) fail(`${zeroField} must be zero in C16`);
  if (handoff.consolidated_counts[zeroField] !== 0) fail(`${zeroField} must be zero in handoff`);
}

if (registry.recommended_next_stage?.module_id !== "I01") fail("C16 recommended next stage must be I01");
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("I01 runtime_allowed must be false");
if (registry.optional_future_content_stage?.module_id !== "C17") fail("Optional future content stage must be C17");

for (const gate of [
  "public_approval_not_granted",
  "source_approval_not_granted",
  "rights_approval_not_granted",
  "image_approval_not_granted",
  "quality_approval_not_granted",
  "ml_training_not_enabled",
  "embedding_not_enabled",
  "registry_write_not_enabled",
  "live_queue_not_created",
  "admin_not_enabled",
  "supabase_not_enabled",
  "auth_not_enabled",
  "payment_not_enabled",
  "public_output_not_enabled",
  "subscriber_output_not_enabled"
]) {
  if (registry.gates_preserved?.[gate] !== true) fail(`C16 gate not preserved: ${gate}`);
  if (handoff.gates_preserved?.[gate] !== true) fail(`Handoff gate not preserved: ${gate}`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!handoff.blocked_capabilities.includes(blocked)) {
    fail(`handoff missing blocked capability: ${blocked}`);
  }
}

for (const scriptName of ["validate:c16", "validate:content", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Current Content Governance Completion",
  "Consolidated Asset Counts",
  "Handoff Doctrine",
  "What Is Complete",
  "What Remains Blocked",
  "Implementation Handoff Boundary",
  "Recommended Next Stage",
  "Safety Doctrine",
  "Explicit Exclusions",
  "C16 does not"
]) {
  if (!docText.includes(phrase)) fail(`C16 document missing phrase: ${phrase}`);
}

for (const phrase of [
  "Content Governance Implementation Handoff",
  "Handoff Summary",
  "Consolidated Counts",
  "Completed Content Governance",
  "Preserved Blocks",
  "Recommended Next Step",
  "No activation is authorized"
]) {
  if (!handoffText.includes(phrase)) fail(`Handoff document missing phrase: ${phrase}`);
}

pass("C16 registry is present.");
pass("C16 document is present.");
pass("C16 implementation handoff document and registry are present.");
pass("C10-C15 are closed and consolidated counts match the C15 readiness matrix.");
pass("No approval, registry write, live queue, admin, Supabase, Auth, payment, ML, embedding, public output, or subscriber output is enabled.");
pass("I01 is recorded as the recommended next stage, with runtime still blocked.");
pass("C16 is content-governance close-out and safe to commit.");
