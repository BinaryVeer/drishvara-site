import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "implementation", "id01-supabase-logical-schema-rls-design-without-migration.json");
const docPath = path.join(process.cwd(), "docs", "implementation", "ID01_SUPABASE_LOGICAL_SCHEMA_RLS_DESIGN_WITHOUT_MIGRATION.md");
const previewPath = path.join(process.cwd(), "data", "implementation", "id01-supabase-logical-schema-rls-design-preview.json");
const id00Path = path.join(process.cwd(), "data", "implementation", "id00-backend-detailed-design-without-activation.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ ID01 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, id00Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing ID01 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const id00 = JSON.parse(fs.readFileSync(id00Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "ID01") fail("module_id must be ID01");
if (preview.module_id !== "ID01") fail("preview output module_id must be ID01");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

if (id00.recommended_next_stage?.module_id !== "ID01") {
  fail("ID00 must recommend ID01 as next stage before ID01 proceeds");
}

for (const dep of ["ID00", "IR00", "I00", "I01", "I02", "I03", "I04", "I05", "C16"]) {
  if (!registry.depends_on.includes(dep)) fail(`ID01 must depend on ${dep}`);
}

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "backend_code_creation_enabled",
  "backend_activation_enabled",
  "supabase_enabled",
  "supabase_connection_enabled",
  "supabase_project_creation_enabled",
  "supabase_table_creation_enabled",
  "service_role_operation_enabled",
  "rls_enabled",
  "rls_policy_creation_enabled",
  "auth_enabled",
  "auth_flow_creation_enabled",
  "payment_enabled",
  "payment_flow_creation_enabled",
  "database_activation_enabled",
  "database_client_enabled",
  "database_migration_enabled",
  "sql_file_creation_enabled",
  "orm_model_creation_enabled",
  "repository_layer_enabled",
  "seed_script_enabled",
  "admin_review_enabled",
  "admin_ui_enabled",
  "admin_route_enabled",
  "review_queue_write_enabled",
  "live_review_queue_enabled",
  "reviewer_assignment_enabled",
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
  "secret_creation_enabled",
  "secret_reading_enabled",
  "backend_deployment_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in ID01`);
}

for (const family of [
  "content_governance",
  "review_workflow",
  "methodology_source_governance",
  "panchang_observance",
  "validation_learning",
  "subscriber_profile_consent",
  "entitlement_payment",
  "guidance_personalization",
  "feature_flag_safety",
  "admin_audit",
  "ml_embedding_eligibility"
]) {
  if (!registry.schema_families.includes(family)) fail(`Missing schema family: ${family}`);
}

for (const role of ["anonymous_public", "subscriber", "reviewer", "admin_owner", "service_role_server_only"]) {
  if (!registry.future_role_families.includes(role)) fail(`Missing future role family: ${role}`);
}

for (const policy of [
  "deny_public",
  "subscriber_self_read",
  "subscriber_self_update_limited",
  "reviewer_read_limited",
  "admin_full_access",
  "admin_audited_read",
  "server_only_insert",
  "server_only_write"
]) {
  if (!registry.rls_policy_types.includes(policy)) fail(`Missing RLS policy type: ${policy}`);
}

if (!Array.isArray(registry.logical_table_candidates) || registry.logical_table_candidates.length < 18) {
  fail("ID01 must declare at least 18 logical table candidates");
}

for (const table of registry.logical_table_candidates) {
  for (const field of registry.table_required_fields) {
    if (!(field in table)) fail(`Logical table ${table.table_name || "unknown"} missing field: ${field}`);
  }

  if (!registry.schema_families.includes(table.schema_family)) {
    fail(`Table ${table.table_name} has unknown schema family ${table.schema_family}`);
  }

  if (table.public_read_allowed !== false) fail(`Table ${table.table_name} public_read_allowed must be false`);
  if (table.subscriber_write_allowed === true && table.schema_family !== "subscriber_profile_consent") {
    fail(`Only subscriber profile/consent tables may allow future subscriber write: ${table.table_name}`);
  }

  if (!Array.isArray(table.rls_policy_candidates) || table.rls_policy_candidates.length === 0) {
    fail(`Table ${table.table_name} must declare RLS policy candidates`);
  }

  if (!Array.isArray(table.activation_blockers) || table.activation_blockers.length === 0) {
    fail(`Table ${table.table_name} must declare activation blockers`);
  }
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (preview.summary.logical_table_candidate_count !== registry.logical_table_candidates.length) {
  fail("Preview logical table count must match registry");
}

for (const table of preview.logical_table_candidates) {
  if (table.table_created !== false) fail(`Preview table ${table.table_name} must not be created`);
  if (table.migration_created !== false) fail(`Preview table ${table.table_name} migration_created must be false`);
  if (table.sql_file_created !== false) fail(`Preview table ${table.table_name} sql_file_created must be false`);
  if (table.rls_policy_created !== false) fail(`Preview table ${table.table_name} rls_policy_created must be false`);
  if (table.database_client_enabled !== false) fail(`Preview table ${table.table_name} database_client_enabled must be false`);
  if (table.database_write_enabled !== false) fail(`Preview table ${table.table_name} database_write_enabled must be false`);
  if (table.public_output_allowed !== false) fail(`Preview table ${table.table_name} public_output_allowed must be false`);
  if (table.subscriber_output_allowed !== false) fail(`Preview table ${table.table_name} subscriber_output_allowed must be false`);
}

for (const zeroField of [
  "table_created_count",
  "migration_created_count",
  "sql_file_created_count",
  "rls_policy_created_count",
  "database_client_enabled_count",
  "database_write_enabled_count",
  "public_output_allowed_count",
  "subscriber_output_allowed_count"
]) {
  if (preview.summary[zeroField] !== 0) fail(`Preview summary ${zeroField} must be zero`);
}

for (const falseField of [
  "supabase_enabled",
  "auth_enabled",
  "rls_enabled",
  "payment_enabled",
  "backend_enabled"
]) {
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

for (const migrationFlag of [
  "sql_file_creation_allowed",
  "migration_creation_allowed",
  "table_creation_allowed",
  "rls_policy_creation_allowed",
  "database_connection_allowed",
  "seed_creation_allowed"
]) {
  if (registry.migration_boundary[migrationFlag] !== false) fail(`Migration boundary ${migrationFlag} must be false`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "ID02") {
  fail("ID01 recommended next stage must be ID02");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("ID02 runtime_allowed must be false");
if (registry.recommended_next_stage?.api_route_creation_allowed !== false) fail("ID02 API route creation must be false");

for (const scriptName of ["generate:id01", "validate:id01", "validate:implementation", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Supabase Schema Design Doctrine",
  "Schema Family Doctrine",
  "Logical Table Candidate Doctrine",
  "RLS Design Doctrine",
  "Role Boundary Doctrine",
  "Content Governance Schema Design",
  "Review Workflow Schema Design",
  "Methodology and Source Schema Design",
  "Panchang and Observance Schema Design",
  "Subscriber Schema Design",
  "Payment Schema Design",
  "Admin and Audit Schema Design",
  "ML and Embedding Schema Design",
  "Index Design Doctrine",
  "Migration Boundary Doctrine",
  "Preview Output",
  "Recommended Next Stage",
  "Explicit Exclusions",
  "ID01 does not"
]) {
  if (!docText.includes(phrase)) fail(`ID01 document missing phrase: ${phrase}`);
}

pass("ID01 registry is present.");
pass("ID01 document is present.");
pass("ID01 Supabase logical schema/RLS design preview is present and marked preview-only.");
pass("Schema families, logical table candidates, columns, keys, index candidates, role boundaries, and RLS policy candidates are declared.");
pass("All table candidates remain design-only with no SQL, migrations, table creation, RLS creation, database clients, writes, public output, or subscriber output.");
pass("No Supabase, Auth, RLS, migration, API, admin, payment, ML, public output, subscriber output, or mutation is enabled.");
pass("ID02 is recorded as the recommended next design-only stage.");
pass("ID01 is Supabase logical schema/RLS design-only and safe to commit.");
