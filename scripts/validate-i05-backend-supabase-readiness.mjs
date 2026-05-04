import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "implementation", "i05-backend-supabase-activation-readiness-plan.json");
const docPath = path.join(process.cwd(), "docs", "implementation", "I05_BACKEND_SUPABASE_ACTIVATION_READINESS_PLAN.md");
const previewPath = path.join(process.cwd(), "data", "implementation", "i05-backend-supabase-readiness-preview.json");
const i04Path = path.join(process.cwd(), "data", "implementation", "i04-internal-preview-architecture-plan.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ I05 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, i04Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing I05 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const i04 = JSON.parse(fs.readFileSync(i04Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "I05") fail("module_id must be I05");
if (preview.module_id !== "I05") fail("preview output module_id must be I05");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

if (i04.recommended_next_stage?.module_id !== "I05") {
  fail("I04 must recommend I05 as next stage before I05 proceeds");
}

for (const dep of ["I00", "I01", "I02", "I03", "I04", "C16"]) {
  if (!registry.depends_on.includes(dep)) fail(`I05 must depend on ${dep}`);
}

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
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
  if (registry[flag] !== false) fail(`${flag} must remain false in I05`);
}

for (const status of [
  "not_started",
  "planned_only",
  "blocked",
  "needs_review",
  "ready_for_detailed_design",
  "ready_for_dry_run",
  "ready_for_activation_review"
]) {
  if (!registry.readiness_statuses.includes(status)) {
    fail(`Missing readiness status: ${status}`);
  }
}

if (!Array.isArray(registry.readiness_areas) || registry.readiness_areas.length < 15) {
  fail("I05 must declare at least 15 readiness areas");
}

for (const area of registry.readiness_areas) {
  for (const field of registry.readiness_area_required_fields) {
    if (!(field in area)) fail(`Readiness area ${area.area_key || "unknown"} missing field: ${field}`);
  }

  if (!registry.readiness_statuses.includes(area.readiness_status)) {
    fail(`Readiness area ${area.area_key} has invalid status ${area.readiness_status}`);
  }

  if (area.readiness_status === "ready_for_activation_review") {
    fail(`No readiness area may be ready_for_activation_review in I05: ${area.area_key}`);
  }

  if (!Array.isArray(area.activation_blockers) || area.activation_blockers.length === 0) {
    fail(`Readiness area ${area.area_key} must have activation blockers`);
  }
}

for (const req of [
  "project_selection",
  "environment_separation",
  "anon_key_boundary",
  "service_role_key_boundary",
  "rls_policy_design",
  "table_schema_design",
  "migration_strategy",
  "backup_strategy",
  "rollback_strategy",
  "validation_plan"
]) {
  if (!registry.supabase_readiness_requirements.includes(req)) {
    fail(`Missing Supabase readiness requirement: ${req}`);
  }
}

for (const req of [
  "auth_provider_decision",
  "login_method",
  "redirect_urls",
  "callback_urls",
  "session_policy",
  "role_mapping",
  "privacy_policy_alignment",
  "validation_plan"
]) {
  if (!registry.auth_readiness_requirements.includes(req)) {
    fail(`Missing Auth readiness requirement: ${req}`);
  }
}

for (const req of [
  "role_definitions",
  "table_access_matrix",
  "row_ownership_model",
  "service_role_usage_rule",
  "deny_by_default_policy",
  "validation_tests"
]) {
  if (!registry.rls_readiness_requirements.includes(req)) {
    fail(`Missing RLS readiness requirement: ${req}`);
  }
}

for (const req of [
  "schema_review",
  "migration_file_naming",
  "rollback_migration",
  "dry_run_environment",
  "backup_before_migration",
  "validation_after_migration",
  "production_promotion_gate"
]) {
  if (!registry.migration_readiness_requirements.includes(req)) {
    fail(`Missing migration readiness requirement: ${req}`);
  }
}

for (const req of [
  "no_secrets_committed",
  "server_only_secrets_remain_server_only",
  "service_role_key_never_client_exposed",
  "payment_secret_never_client_exposed",
  "api_provider_secret_never_client_exposed",
  "env_files_protected",
  "key_rotation_process_defined",
  "emergency_revoke_process_defined"
]) {
  if (!registry.environment_secret_requirements.includes(req)) {
    fail(`Missing environment/secret readiness requirement: ${req}`);
  }
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (preview.summary.readiness_area_count !== registry.readiness_areas.length) {
  fail("Preview readiness_area_count must match registry");
}

for (const area of preview.readiness_areas) {
  if (area.activated !== false) fail(`Area ${area.area_key} must not be activated`);
  if (area.backend_enabled !== false) fail(`Area ${area.area_key} backend_enabled must be false`);
  if (area.supabase_enabled !== false) fail(`Area ${area.area_key} supabase_enabled must be false`);
  if (area.auth_enabled !== false) fail(`Area ${area.area_key} auth_enabled must be false`);
  if (area.rls_enabled !== false) fail(`Area ${area.area_key} rls_enabled must be false`);
  if (area.database_enabled !== false) fail(`Area ${area.area_key} database_enabled must be false`);
  if (area.api_enabled !== false) fail(`Area ${area.area_key} api_enabled must be false`);
  if (area.public_output_allowed !== false) fail(`Area ${area.area_key} public_output_allowed must be false`);
  if (area.subscriber_output_allowed !== false) fail(`Area ${area.area_key} subscriber_output_allowed must be false`);
}

for (const zeroField of [
  "activated_count",
  "backend_enabled_count",
  "supabase_enabled_count",
  "auth_enabled_count",
  "rls_enabled_count",
  "database_enabled_count",
  "api_enabled_count",
  "public_output_allowed_count",
  "subscriber_output_allowed_count",
  "activation_ready_count"
]) {
  if (preview.summary[zeroField] !== 0) fail(`Preview summary ${zeroField} must be zero`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "IR00") {
  fail("I05 recommended next stage must be IR00");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("IR00 runtime_allowed must be false");
if (registry.recommended_next_stage?.database_activation_allowed !== false) fail("IR00 database activation must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("IR00 must not itself activate");

for (const scriptName of ["generate:i05", "validate:i05", "validate:implementation", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Backend Activation Doctrine",
  "Supabase Readiness Doctrine",
  "Auth Readiness Doctrine",
  "RLS Readiness Doctrine",
  "Database Migration Readiness Doctrine",
  "Environment and Secret Readiness Doctrine",
  "API Readiness Doctrine",
  "Admin Review Readiness Doctrine",
  "Subscriber Readiness Doctrine",
  "Content Backend Readiness Doctrine",
  "Panchang and Guidance Backend Readiness Doctrine",
  "Payment and Entitlement Readiness Doctrine",
  "ML and Embedding Backend Readiness Doctrine",
  "Deployment and Rollback Readiness Doctrine",
  "Go / No-Go Doctrine",
  "Readiness Areas",
  "Preview Output",
  "Recommended Next Stage",
  "Explicit Exclusions",
  "I05 does not"
]) {
  if (!docText.includes(phrase)) fail(`I05 document missing phrase: ${phrase}`);
}

pass("I05 registry is present.");
pass("I05 document is present.");
pass("I05 backend/Supabase readiness preview is present and marked preview-only.");
pass("Backend, Supabase, Auth, RLS, migration, environment, API, admin, subscriber, content, Panchang/guidance, payment, ML, deployment, and rollback readiness doctrines are declared.");
pass("Readiness areas are declared with blockers, and none are activated or ready for activation review.");
pass("No backend, Supabase, Auth, RLS, migration, API, admin, payment, ML, public output, subscriber output, or mutation is enabled.");
pass("IR00 is recorded as the recommended next stage, with activation still blocked.");
pass("I05 is implementation-planning/backend-readiness-only and safe to commit.");
