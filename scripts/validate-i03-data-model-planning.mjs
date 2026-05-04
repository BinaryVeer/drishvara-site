import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "implementation", "i03-data-model-planning-without-database-activation.json");
const docPath = path.join(process.cwd(), "docs", "implementation", "I03_DATA_MODEL_PLANNING_WITHOUT_DATABASE_ACTIVATION.md");
const previewPath = path.join(process.cwd(), "data", "implementation", "i03-data-model-planning-preview.json");
const i02Path = path.join(process.cwd(), "data", "implementation", "i02-feature-flag-environment-boundary-plan.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ I03 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, i02Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing I03 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const i02 = JSON.parse(fs.readFileSync(i02Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "I03") fail("module_id must be I03");
if (preview.module_id !== "I03") fail("preview output module_id must be I03");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

if (i02.recommended_next_stage?.module_id !== "I03") {
  fail("I02 must recommend I03 as next stage before I03 proceeds");
}

for (const dep of ["I00", "I01", "I02", "C16"]) {
  if (!registry.depends_on.includes(dep)) fail(`I03 must depend on ${dep}`);
}

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "database_activation_enabled",
  "database_client_enabled",
  "database_migration_enabled",
  "sql_file_creation_enabled",
  "orm_model_creation_enabled",
  "repository_layer_enabled",
  "seed_script_enabled",
  "supabase_enabled",
  "supabase_table_creation_enabled",
  "rls_enabled",
  "auth_enabled",
  "payment_enabled",
  "admin_review_enabled",
  "admin_ui_enabled",
  "review_queue_write_enabled",
  "live_review_queue_enabled",
  "approval_enabled",
  "subscriber_output_enabled",
  "public_output_enabled",
  "article_mutation_enabled",
  "homepage_mutation_enabled",
  "sitemap_mutation_enabled",
  "final_registry_write_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "model_training_enabled",
  "vector_database_write_enabled",
  "external_api_fetch_enabled",
  "env_file_creation_enabled",
  "secret_creation_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in I03`);
}

for (const family of [
  "content_governance",
  "review_workflow",
  "methodology_source_governance",
  "panchang_observance_methodology",
  "validation_learning",
  "subscriber_profile_consent",
  "entitlement_payment",
  "guidance_personalization",
  "admin_audit",
  "feature_environment_safety",
  "ml_embedding_eligibility"
]) {
  if (!registry.planned_data_model_families.includes(family)) {
    fail(`Missing planned data model family: ${family}`);
  }
}

for (const level of [
  "public_static",
  "internal_governance",
  "internal_preview",
  "restricted_admin",
  "subscriber_private",
  "secret_server_only",
  "prohibited_for_client"
]) {
  if (!registry.sensitivity_levels.includes(level)) fail(`Missing sensitivity level: ${level}`);
}

for (const pii of [
  "none",
  "pseudonymous",
  "contact",
  "profile",
  "location",
  "birth_data",
  "payment",
  "authentication",
  "sensitive_preference",
  "operational_audit"
]) {
  if (!registry.pii_categories.includes(pii)) fail(`Missing PII category: ${pii}`);
}

for (const storage of [
  "static_json",
  "server_database",
  "supabase_postgres",
  "object_storage",
  "vector_database",
  "audit_log_store",
  "external_provider_record"
]) {
  if (!registry.storage_candidates_not_activated.includes(storage)) {
    fail(`Missing storage candidate: ${storage}`);
  }
}

if (!Array.isArray(registry.planned_entities) || registry.planned_entities.length < 15) {
  fail("I03 must declare at least 15 planned entities");
}

for (const entity of registry.planned_entities) {
  for (const field of registry.entity_required_fields) {
    if (!(field in entity)) fail(`Planned entity ${entity.entity_key || "unknown"} missing field: ${field}`);
  }

  if (!registry.planned_data_model_families.includes(entity.family)) {
    fail(`Entity ${entity.entity_key} has unknown family ${entity.family}`);
  }

  if (!registry.sensitivity_levels.includes(entity.sensitivity_level)) {
    fail(`Entity ${entity.entity_key} has unknown sensitivity level ${entity.sensitivity_level}`);
  }

  if (!registry.pii_categories.includes(entity.pii_category)) {
    fail(`Entity ${entity.entity_key} has unknown PII category ${entity.pii_category}`);
  }

  if (!registry.storage_candidates_not_activated.includes(entity.future_storage_candidate)) {
    fail(`Entity ${entity.entity_key} has unknown storage candidate ${entity.future_storage_candidate}`);
  }

  if (entity.public_exposure_allowed !== false) {
    fail(`Entity ${entity.entity_key} must not allow public exposure in I03`);
  }

  if (entity.write_enabled !== false) {
    fail(`Entity ${entity.entity_key} must have write_enabled=false in I03`);
  }

  if (!Array.isArray(entity.activation_blockers) || entity.activation_blockers.length === 0) {
    fail(`Entity ${entity.entity_key} must declare activation blockers`);
  }
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (preview.summary.planned_entity_count !== registry.planned_entities.length) {
  fail("Preview planned_entity_count must match registry planned_entities length");
}

for (const entity of preview.planned_entities) {
  if (entity.table_created !== false) fail(`Preview entity ${entity.entity_key} must have table_created=false`);
  if (entity.migration_created !== false) fail(`Preview entity ${entity.entity_key} must have migration_created=false`);
  if (entity.database_write_enabled !== false) fail(`Preview entity ${entity.entity_key} must have database_write_enabled=false`);
  if (entity.api_exposed !== false) fail(`Preview entity ${entity.entity_key} must have api_exposed=false`);
  if (entity.public_output_allowed !== false) fail(`Preview entity ${entity.entity_key} must have public_output_allowed=false`);
  if (entity.subscriber_output_allowed !== false) fail(`Preview entity ${entity.entity_key} must have subscriber_output_allowed=false`);
}

for (const zeroField of [
  "tables_created_count",
  "migrations_created_count",
  "database_writes_enabled_count",
  "api_exposed_count",
  "public_output_allowed_count",
  "subscriber_output_allowed_count"
]) {
  if (preview.summary[zeroField] !== 0) fail(`Preview summary ${zeroField} must be zero`);
}

for (const falseField of [
  "supabase_enabled",
  "auth_enabled",
  "payment_enabled",
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

if (registry.recommended_next_stage?.module_id !== "I04") {
  fail("I03 recommended next stage must be I04");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("I04 runtime_allowed must be false");
if (registry.recommended_next_stage?.database_activation_allowed !== false) fail("I04 database activation must be false");

for (const scriptName of ["generate:i03", "validate:i03", "validate:implementation", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Data Model Planning Doctrine",
  "No Database Activation Doctrine",
  "Planned Data Model Families",
  "Content Governance Entities",
  "Review Workflow Entities",
  "Methodology and Source Entities",
  "Panchang and Observance Entities",
  "Validation and Learning Entities",
  "Subscriber Profile and Consent Entities",
  "Entitlement and Payment Entities",
  "Guidance and Personalization Entities",
  "Admin and Audit Entities",
  "Feature Flag and Environment Entities",
  "ML and Embedding Eligibility Entities",
  "Sensitivity Classification Doctrine",
  "PII and Privacy Doctrine",
  "Storage Candidate Doctrine",
  "Activation Blocker Doctrine",
  "Preview Output",
  "Recommended Next Stage",
  "Explicit Exclusions",
  "I03 does not"
]) {
  if (!docText.includes(phrase)) fail(`I03 document missing phrase: ${phrase}`);
}

pass("I03 registry is present.");
pass("I03 document is present.");
pass("I03 logical data model preview is present and marked preview-only.");
pass("Planned data model families, entities, sensitivity levels, PII categories, storage candidates, and activation blockers are declared.");
pass("No database tables, migrations, clients, repositories, Supabase, Auth, admin, API, ML, public output, or subscriber output are enabled.");
pass("All planned entities remain non-public, non-writable, and not database-backed in I03.");
pass("I04 is recorded as the recommended next stage, with runtime and database activation still blocked.");
pass("I03 is implementation-planning/data-model-only and safe to commit.");
