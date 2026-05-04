import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "content", "c10-content-asset-registry-ml-eligibility-governance.json");
const docPath = path.join(process.cwd(), "docs", "content", "C10_CONTENT_ASSET_REGISTRY_ML_ELIGIBILITY_GOVERNANCE.md");
const packagePath = path.join(process.cwd(), "package.json");
const i00Path = path.join(process.cwd(), "data", "implementation", "i00-implementation-planning-safe-architecture-blueprint.json");

function fail(message) {
  console.error(`❌ C10 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, packagePath, i00Path]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing C10 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const i00 = JSON.parse(fs.readFileSync(i00Path, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "C10") fail("module_id must be C10");

for (const dep of ["C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "I00"]) {
  if (!registry.depends_on.includes(dep)) fail(`C10 must depend on ${dep}`);
}

if (i00.next_content_specific_module?.module_id !== "C10") {
  fail("I00 must declare C10 as the next content-specific module");
}

if (i00.next_content_specific_module?.ml_ingestion_allowed !== false) {
  fail("I00 must block ML ingestion for C10");
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
  "image_registry_write_enabled",
  "quality_metadata_write_enabled",
  "review_queue_write_enabled",
  "selection_memory_write_enabled",
  "manual_override_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "model_training_enabled",
  "vector_database_write_enabled",
  "link_crawling_enabled",
  "image_download_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in C10`);
}

for (const assetClass of [
  "article",
  "published_work",
  "image",
  "generated_image",
  "verified_link",
  "reference_link",
  "article_series",
  "draft_article",
  "archived_article",
  "source_record",
  "visual_asset",
  "external_reference"
]) {
  if (!registry.asset_classes.includes(assetClass)) fail(`Missing asset class: ${assetClass}`);
}

for (const status of [
  "draft",
  "generated",
  "under_review",
  "approved_public",
  "published",
  "archived",
  "rejected",
  "needs_revision",
  "internal_only",
  "reference_only",
  "deprecated"
]) {
  if (!registry.asset_statuses.includes(status)) fail(`Missing asset status: ${status}`);
}

for (const field of [
  "source_type",
  "source_name",
  "source_url",
  "author_or_creator",
  "license_status",
  "usage_permission",
  "rights_review_status",
  "reuse_allowed",
  "commercial_use_allowed",
  "ml_use_allowed",
  "embedding_use_allowed"
]) {
  if (!registry.source_rights_required_fields.includes(field)) {
    fail(`Missing source/rights field: ${field}`);
  }
}

for (const status of [
  "public_safe",
  "internal_only",
  "needs_review",
  "sensitive",
  "rights_unclear",
  "source_unclear",
  "quality_insufficient",
  "duplicate_or_near_duplicate",
  "blocked"
]) {
  if (!registry.public_safe_statuses.includes(status)) {
    fail(`Missing public-safe status: ${status}`);
  }
}

for (const req of [
  "source_status_reviewed",
  "rights_status_reviewed",
  "usage_permission_reviewed",
  "quality_status_reviewed",
  "duplicate_near_duplicate_status_reviewed",
  "public_safe_status_reviewed",
  "reviewer_approval",
  "no_privacy_issue",
  "no_restricted_source",
  "no_unclear_generated_content_rights"
]) {
  if (!registry.ml_training_eligibility_requirements.includes(req)) {
    fail(`Missing ML eligibility requirement: ${req}`);
  }
}

for (const req of [
  "public_safe_status",
  "rights_status_reviewed",
  "source_status_reviewed",
  "quality_status_acceptable",
  "privacy_risk_cleared",
  "duplicate_handling_completed",
  "reviewer_approval"
]) {
  if (!registry.embedding_eligibility_requirements.includes(req)) {
    fail(`Missing embedding eligibility requirement: ${req}`);
  }
}

if (registry.default_eligibility?.ml_training_eligible !== false) fail("Default ML training eligibility must be false");
if (registry.default_eligibility?.embedding_eligible !== false) fail("Default embedding eligibility must be false");
if (registry.default_eligibility?.public_display_allowed !== false) fail("Default public display allowed must be false");
if (registry.default_eligibility?.registry_write_allowed_in_c10 !== false) fail("Registry write must be disabled in C10");

for (const field of [
  "asset_id",
  "asset_type",
  "title",
  "slug",
  "article_path",
  "canonical_url",
  "category",
  "language",
  "hindi_readiness",
  "publication_status",
  "editorial_review_status",
  "quality_status",
  "source_status",
  "rights_status",
  "image_asset_refs",
  "verified_link_refs",
  "public_safe_status",
  "ml_training_eligible",
  "embedding_eligible",
  "version",
  "next_action"
]) {
  if (!registry.article_asset_required_fields.includes(field)) {
    fail(`Missing article asset field: ${field}`);
  }
}

for (const field of [
  "asset_id",
  "asset_type",
  "image_url_or_path",
  "source_url",
  "provider",
  "creator",
  "license_status",
  "credit_line",
  "alt_text",
  "usage_purpose",
  "approval_status",
  "duplicate_use_status",
  "article_refs",
  "public_safe_status",
  "ml_training_eligible",
  "embedding_eligible"
]) {
  if (!registry.image_asset_required_fields.includes(field)) {
    fail(`Missing image asset field: ${field}`);
  }
}

for (const field of [
  "link_id",
  "url",
  "title",
  "source_name",
  "source_type",
  "related_article_refs",
  "verification_status",
  "last_checked_at",
  "citation_use_allowed",
  "reuse_allowed",
  "public_display_allowed",
  "ml_training_eligible",
  "embedding_eligible"
]) {
  if (!registry.verified_link_required_fields.includes(field)) {
    fail(`Missing verified link field: ${field}`);
  }
}

for (const status of [
  "unchecked",
  "unique",
  "exact_duplicate",
  "near_duplicate",
  "canonical_selected",
  "archive_duplicate",
  "needs_human_review"
]) {
  if (!registry.duplicate_statuses.includes(status)) {
    fail(`Missing duplicate status: ${status}`);
  }
}

for (const status of [
  "unchecked",
  "basic_ready",
  "editorial_ready",
  "needs_revision",
  "source_needs_review",
  "image_needs_review",
  "hindi_needs_review",
  "duplicate_needs_review",
  "approved_for_public",
  "approved_for_embedding",
  "approved_for_ml_training",
  "blocked"
]) {
  if (!registry.quality_statuses.includes(status)) {
    fail(`Missing quality status: ${status}`);
  }
}

for (const separated of [
  "saved_asset",
  "verified_asset",
  "public_safe_asset",
  "embedding_eligible_asset",
  "ml_training_eligible_asset"
]) {
  if (!registry.separated_statuses.includes(separated)) {
    fail(`Missing separated status: ${separated}`);
  }
}

for (const scriptName of ["validate:c10", "validate:content", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Asset Class Doctrine",
  "Asset Status Doctrine",
  "Source and Rights Doctrine",
  "Public-Safe Doctrine",
  "ML Eligibility Doctrine",
  "Embedding Eligibility Doctrine",
  "Article Asset Registry Doctrine",
  "Image Asset Registry Doctrine",
  "Verified Link Registry Doctrine",
  "Versioning Doctrine",
  "Duplicate and Near-Duplicate Doctrine",
  "Quality Status Doctrine",
  "Registry Write Doctrine",
  "ML Use Separation Doctrine",
  "C10 does not ingest"
]) {
  if (!docText.includes(phrase)) fail(`C10 document missing phrase: ${phrase}`);
}

pass("C10 registry is present.");
pass("C10 document is present.");
pass("C10 depends on C01-C09 and I00, with I00 blocking ML ingestion.");
pass("Asset classes, asset statuses, source/rights, public-safe, ML, and embedding doctrines are declared.");
pass("Article, image, verified-link, versioning, duplicate, and quality schemas are declared.");
pass("Registry writes, ML ingestion, embedding generation, Supabase, Auth, payment, public output, and mutation remain disabled.");
pass("C10 is content-governance-only and safe to commit.");
