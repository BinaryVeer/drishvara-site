import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "implementation", "i04-internal-preview-architecture-plan.json");
const docPath = path.join(process.cwd(), "docs", "implementation", "I04_INTERNAL_PREVIEW_ARCHITECTURE_PLAN.md");
const previewPath = path.join(process.cwd(), "data", "implementation", "i04-internal-preview-architecture-preview.json");
const i03Path = path.join(process.cwd(), "data", "implementation", "i03-data-model-planning-without-database-activation.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ I04 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, i03Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing I04 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const i03 = JSON.parse(fs.readFileSync(i03Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "I04") fail("module_id must be I04");
if (preview.module_id !== "I04") fail("preview output module_id must be I04");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

if (i03.recommended_next_stage?.module_id !== "I04") {
  fail("I03 must recommend I04 as next stage before I04 proceeds");
}

for (const dep of ["I00", "I01", "I02", "I03", "C16"]) {
  if (!registry.depends_on.includes(dep)) fail(`I04 must depend on ${dep}`);
}

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "runtime_preview_enabled",
  "internal_preview_enabled",
  "public_preview_enabled",
  "subscriber_preview_enabled",
  "dashboard_card_enabled",
  "ui_component_creation_enabled",
  "route_creation_enabled",
  "audit_trace_write_enabled",
  "runtime_loader_enabled",
  "feature_flag_evaluator_enabled",
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
  "approval_enabled",
  "database_activation_enabled",
  "database_client_enabled",
  "database_migration_enabled",
  "supabase_table_creation_enabled",
  "article_mutation_enabled",
  "homepage_mutation_enabled",
  "sitemap_mutation_enabled",
  "seo_metadata_mutation_enabled",
  "final_registry_write_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "model_training_enabled",
  "vector_database_write_enabled",
  "link_crawling_enabled",
  "image_download_enabled",
  "env_file_creation_enabled",
  "secret_creation_enabled",
  "secret_reading_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in I04`);
}

for (const family of [
  "methodology_status_preview",
  "content_asset_readiness_preview",
  "review_queue_planning_preview",
  "panchang_calculation_preview",
  "observance_rule_preview",
  "festival_rule_preview",
  "source_registry_preview",
  "sanskrit_integrity_preview",
  "subscriber_profile_completeness_preview",
  "symbolic_guidance_preview",
  "personalization_score_preview",
  "api_contract_preview",
  "feature_flag_readiness_preview",
  "data_model_readiness_preview",
  "deployment_readiness_preview"
]) {
  if (!registry.preview_families.includes(family)) {
    fail(`Missing preview family: ${family}`);
  }
}

for (const req of [
  "auth_required_future",
  "reviewer_role_mapping_required_future",
  "role_based_access_required_future",
  "privacy_redaction_required_future",
  "audit_trace_required_future",
  "feature_flag_gate_required_future",
  "safe_mode_gate_required_future",
  "no_public_route_exposure"
]) {
  if (!registry.access_boundary_requirements.includes(req)) {
    fail(`Missing access boundary requirement: ${req}`);
  }
}

for (const redaction of [
  "subscriber_identifier",
  "contact_information",
  "precise_location",
  "birth_data",
  "payment_reference",
  "authentication_reference",
  "sensitive_preference",
  "internal_secret",
  "service_role_reference",
  "api_key_reference"
]) {
  if (!registry.redaction_categories.includes(redaction)) {
    fail(`Missing redaction category: ${redaction}`);
  }
}

for (const control of [
  "no_public_route_by_default",
  "auth_required",
  "reviewer_role_required",
  "feature_flag_required",
  "safe_mode_respected",
  "audit_trace_created",
  "redaction_applied",
  "no_mutation",
  "no_public_cache",
  "no_seo_indexing"
]) {
  if (!registry.future_route_controls_required.includes(control)) {
    fail(`Missing future route control: ${control}`);
  }
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (!Array.isArray(preview.preview_families)) fail("preview_families must be an array");
if (preview.preview_families.length !== registry.preview_families.length) {
  fail("Preview family count must match registry");
}

for (const family of preview.preview_families) {
  if (family.readiness_level !== "planned_only") fail(`${family.preview_family} must remain planned_only`);
  if (family.runtime_enabled !== false) fail(`${family.preview_family} runtime_enabled must be false`);
  if (family.route_created !== false) fail(`${family.preview_family} route_created must be false`);
  if (family.ui_created !== false) fail(`${family.preview_family} ui_created must be false`);
  if (family.public_output_allowed !== false) fail(`${family.preview_family} public_output_allowed must be false`);
  if (family.subscriber_output_allowed !== false) fail(`${family.preview_family} subscriber_output_allowed must be false`);
  if (family.mutation_allowed !== false) fail(`${family.preview_family} mutation_allowed must be false`);
}

for (const zeroField of [
  "runtime_enabled_count",
  "route_created_count",
  "ui_created_count",
  "public_output_allowed_count",
  "subscriber_output_allowed_count",
  "mutation_allowed_count"
]) {
  if (preview.summary[zeroField] !== 0) fail(`Preview summary ${zeroField} must be zero`);
}

for (const falseField of [
  "supabase_enabled",
  "auth_enabled",
  "admin_enabled",
  "database_enabled",
  "ml_enabled",
  "embedding_enabled"
]) {
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "I05") {
  fail("I04 recommended next stage must be I05");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("I05 runtime_allowed must be false");
if (registry.recommended_next_stage?.database_activation_allowed !== false) fail("I05 database activation must be false");

for (const scriptName of ["generate:i04", "validate:i04", "validate:implementation", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Internal Preview Doctrine",
  "Preview Families",
  "Access Boundary Doctrine",
  "Public Output Boundary",
  "Subscriber Output Boundary",
  "Redaction Doctrine",
  "Preview Source Doctrine",
  "Preview Route Boundary",
  "Preview Component Boundary",
  "Audit Trace Doctrine",
  "Safe Mode Doctrine",
  "Preview Readiness Levels",
  "Data Handling Doctrine",
  "Security Boundary Doctrine",
  "Preview Evidence Pack Doctrine",
  "Preview Failure Doctrine",
  "Preview Output",
  "Recommended Next Stage",
  "Explicit Exclusions",
  "I04 does not"
]) {
  if (!docText.includes(phrase)) fail(`I04 document missing phrase: ${phrase}`);
}

pass("I04 registry is present.");
pass("I04 document is present.");
pass("I04 internal preview architecture preview is present and marked preview-only.");
pass("Preview families, access boundaries, redaction categories, route controls, audit fields, safe mode, and failure rules are declared.");
pass("All preview families remain planned-only with no runtime, routes, UI, mutation, public output, or subscriber output.");
pass("Supabase, Auth, Admin, database, ML, embedding, API, and public/subscriber output remain disabled.");
pass("I05 is recorded as the recommended next stage, with runtime and database activation still blocked.");
pass("I04 is implementation-planning/internal-preview-architecture-only and safe to commit.");
