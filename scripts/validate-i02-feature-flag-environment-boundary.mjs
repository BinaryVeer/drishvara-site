import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "implementation", "i02-feature-flag-environment-boundary-plan.json");
const docPath = path.join(process.cwd(), "docs", "implementation", "I02_FEATURE_FLAG_ENVIRONMENT_BOUNDARY_PLAN.md");
const previewPath = path.join(process.cwd(), "data", "implementation", "i02-feature-flag-environment-boundary-preview.json");
const i00Path = path.join(process.cwd(), "data", "implementation", "i00-implementation-planning-safe-architecture-blueprint.json");
const i01Path = path.join(process.cwd(), "data", "implementation", "i01-safe-folder-architecture-static-registry-loading-plan.json");
const c16Path = path.join(process.cwd(), "data", "content", "c16-content-governance-close-out-implementation-handoff.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ I02 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, i00Path, i01Path, c16Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing I02 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const i01 = JSON.parse(fs.readFileSync(i01Path, "utf8"));
const c16 = JSON.parse(fs.readFileSync(c16Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "I02") fail("module_id must be I02");
if (preview.module_id !== "I02") fail("preview output module_id must be I02");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

if (i01.recommended_next_stage?.module_id !== "I02") {
  fail("I01 must recommend I02 as next stage before I02 proceeds");
}

if (c16.recommended_next_stage?.module_id !== "I01") {
  fail("C16 must have handed off to I01 before I02");
}

for (const dep of ["I00", "I01", "C16"]) {
  if (!registry.depends_on.includes(dep)) fail(`I02 must depend on ${dep}`);
}

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "runtime_loader_enabled",
  "feature_flag_evaluator_enabled",
  "runtime_override_enabled",
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
  "article_mutation_enabled",
  "homepage_mutation_enabled",
  "sitemap_mutation_enabled",
  "seo_metadata_mutation_enabled",
  "final_registry_write_enabled",
  "database_migration_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "model_training_enabled",
  "vector_database_write_enabled",
  "link_crawling_enabled",
  "image_download_enabled",
  "env_file_creation_enabled",
  "secret_creation_enabled",
  "secret_reading_enabled",
  "gitignore_modification_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in I02`);
}

for (const family of [
  "public_content",
  "content_registry",
  "review_queue",
  "admin_review",
  "panchang_calculation",
  "festival_vrat_calculation",
  "subscriber_guidance",
  "personalization",
  "auth",
  "supabase",
  "payment",
  "api_routes",
  "internal_preview",
  "ml_embeddings",
  "external_api_fetch",
  "analytics",
  "deployment_safety"
]) {
  if (!registry.feature_flag_families.includes(family)) {
    fail(`Missing feature flag family: ${family}`);
  }
}

const requiredFlagKeys = [
  "public_content_dynamic_enabled",
  "content_registry_write_enabled",
  "review_queue_write_enabled",
  "admin_review_enabled",
  "admin_ui_enabled",
  "public_panchang_enabled",
  "public_festival_enabled",
  "subscriber_guidance_enabled",
  "personalization_enabled",
  "auth_enabled",
  "supabase_enabled",
  "payment_enabled",
  "api_routes_enabled",
  "internal_preview_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "external_api_fetch_enabled",
  "analytics_enabled"
];

for (const key of requiredFlagKeys) {
  const regFlag = registry.required_future_flags.find((x) => x.flag_key === key);
  if (!regFlag) fail(`Missing required future flag in registry: ${key}`);
  if (regFlag.default_value !== false) fail(`Registry flag default must be false: ${key}`);
  if (regFlag.public_output_allowed !== false) fail(`Registry flag public output must be false: ${key}`);
  if (regFlag.subscriber_output_allowed !== false) fail(`Registry flag subscriber output must be false: ${key}`);

  const previewFlag = preview.feature_flags.find((x) => x.flag_key === key);
  if (!previewFlag) fail(`Missing required future flag in preview: ${key}`);
  if (previewFlag.current_i02_value !== false) fail(`Preview flag must be false: ${key}`);
  if (previewFlag.public_output_allowed !== false) fail(`Preview flag public output must be false: ${key}`);
  if (previewFlag.subscriber_output_allowed !== false) fail(`Preview flag subscriber output must be false: ${key}`);
}

for (const category of [
  "public_build_variable",
  "server_only_variable",
  "secret",
  "service_role_secret",
  "payment_secret",
  "api_provider_secret",
  "analytics_key",
  "feature_flag_override",
  "non_secret_configuration"
]) {
  if (!registry.environment_variable_categories.includes(category)) {
    fail(`Missing environment variable category: ${category}`);
  }
  if (!preview.environment_variable_categories.includes(category)) {
    fail(`Preview missing environment variable category: ${category}`);
  }
}

for (const rule of [
  "no_env_files_created_in_i02",
  "no_secrets_created_in_i02",
  "no_secrets_read_in_i02",
  "server_only_values_must_not_be_bundled_to_client",
  "service_role_keys_must_remain_server_only",
  "payment_secrets_must_remain_server_only",
  "private_api_keys_must_remain_server_only",
  "public_variables_must_not_contain_secrets",
  "future_env_usage_requires_documented_category",
  "future_env_usage_requires_validation"
]) {
  if (!registry.environment_boundary_rules.includes(rule)) {
    fail(`Missing environment boundary rule: ${rule}`);
  }
  if (!preview.environment_boundary_rules.includes(rule)) {
    fail(`Preview missing environment boundary rule: ${rule}`);
  }
}

for (const protectedName of [
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  "service-account.json",
  "service_role_key.json"
]) {
  if (!registry.protected_environment_file_names.includes(protectedName)) {
    fail(`Missing protected environment file name: ${protectedName}`);
  }
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (preview.summary.feature_flag_count !== registry.required_future_flags.length) {
  fail("Preview feature flag count must match registry");
}
if (preview.summary.flags_true_count !== 0) fail("flags_true_count must be zero");
if (preview.summary.flags_false_count !== registry.required_future_flags.length) fail("flags_false_count must match total flags");
if (preview.summary.env_files_created_count !== 0) fail("env_files_created_count must be zero");
if (preview.summary.secrets_created_count !== 0) fail("secrets_created_count must be zero");
if (preview.summary.secrets_read_count !== 0) fail("secrets_read_count must be zero");

for (const falseSummary of [
  "runtime_evaluator_created",
  "public_output_enabled",
  "subscriber_output_enabled",
  "supabase_enabled",
  "auth_enabled",
  "payment_enabled",
  "ml_enabled",
  "embedding_enabled",
  "external_api_fetch_enabled"
]) {
  if (preview.summary[falseSummary] !== false) fail(`Preview summary ${falseSummary} must be false`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "I03") {
  fail("I02 recommended next stage must be I03");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("I03 runtime_allowed must be false");
if (registry.recommended_next_stage?.database_activation_allowed !== false) fail("I03 database activation must be false");

for (const scriptName of ["generate:i02", "validate:i02", "validate:implementation", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Feature Flag Doctrine",
  "Feature Flag Families",
  "Required Future Flags",
  "Environment Variable Doctrine",
  "Public vs Server-Only Environment Boundary",
  "Supabase Environment Boundary",
  "Auth Environment Boundary",
  "Payment Environment Boundary",
  "API Route Boundary",
  "Internal Preview Boundary",
  "ML and Embedding Boundary",
  "External API Boundary",
  "Runtime Override Doctrine",
  "Flag Evaluation Doctrine",
  "Safe Mode Doctrine",
  "Environment File Policy",
  "Preview Output",
  "Recommended Next Stage",
  "Explicit Exclusions",
  "I02 does not"
]) {
  if (!docText.includes(phrase)) fail(`I02 document missing phrase: ${phrase}`);
}

pass("I02 registry is present.");
pass("I02 document is present.");
pass("I02 feature flag and environment boundary preview is present and marked preview-only.");
pass("Required future flags are declared and all remain false.");
pass("Environment categories, public/server-only boundaries, and protected secret-file names are declared.");
pass("Supabase/Auth/payment/API/internal preview/ML/external API boundaries are declared without activation.");
pass("No env files, secrets, runtime evaluator, API routes, Supabase, Auth, admin, ML, public output, or subscriber output are enabled.");
pass("I03 is recorded as the recommended next stage, with runtime and database activation still blocked.");
pass("I02 is implementation-planning/boundary-only and safe to commit.");
