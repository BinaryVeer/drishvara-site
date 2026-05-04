import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "implementation", "i00-implementation-planning-safe-architecture-blueprint.json");
const docPath = path.join(process.cwd(), "docs", "implementation", "I00_IMPLEMENTATION_PLANNING_SAFE_ARCHITECTURE_BLUEPRINT.md");
const packagePath = path.join(process.cwd(), "package.json");
const r02Path = path.join(process.cwd(), "data", "review", "r02-consolidated-status-implementation-planning-gate.json");
const r03Path = path.join(process.cwd(), "data", "review", "r03-backup-archive-repo-cleanliness-policy.json");

function fail(message) {
  console.error(`❌ I00 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, packagePath, r02Path, r03Path]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing I00 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const r02 = JSON.parse(fs.readFileSync(r02Path, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "I00") fail("module_id must be I00");

for (const dep of [
  "M00", "M01", "M02", "M03", "M04", "M04A", "M05", "M06", "M06A",
  "M07", "M08", "M09", "M10", "R00", "R01", "R02", "R03"
]) {
  if (!registry.depends_on.includes(dep)) fail(`I00 must depend on ${dep}`);
}

if (r02.next_allowed_phase !== "I00") {
  fail("R02 must declare I00 as the next allowed phase before I00 proceeds");
}

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "subscriber_output_enabled",
  "public_output_enabled",
  "public_guidance_enabled",
  "public_panchang_enabled",
  "public_festival_dates_enabled",
  "external_api_fetch_enabled",
  "auth_enabled",
  "payment_enabled",
  "supabase_enabled",
  "dashboard_card_runtime_enabled",
  "internal_preview_runtime_enabled",
  "live_calculation_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "automatic_activation_enabled",
  "automatic_database_mutation_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in I00`);
}

const siteRole = registry.repo_roles.find((x) => x.repo_name === "drishvara-site");
if (!siteRole || siteRole.role !== "active_website_and_governance_repository") {
  fail("drishvara-site must be recorded as the active website and governance repository");
}

const scaffoldRole = registry.repo_roles.find((x) => x.repo_name === "drishvara_phase01_scaffold");
if (!scaffoldRole || scaffoldRole.role !== "historical_generation_pipeline_reference") {
  fail("drishvara_phase01_scaffold must be recorded as historical generation pipeline reference");
}
if (scaffoldRole.blind_merge_allowed !== false) {
  fail("drishvara_phase01_scaffold blind merge must not be allowed");
}

for (const layer of [
  "public_static_site_layer",
  "content_asset_layer",
  "governance_registry_layer",
  "methodology_registry_layer",
  "internal_preview_layer",
  "server_only_calculation_layer",
  "consent_privacy_layer",
  "entitlement_layer",
  "subscriber_dashboard_layer",
  "admin_review_layer",
  "ml_embedding_preparation_layer",
  "deployment_rollback_layer"
]) {
  if (!registry.architecture_layers_planned.includes(layer)) {
    fail(`Missing planned architecture layer: ${layer}`);
  }
}

for (const serverOnly of [
  "panchang_calculation",
  "festival_vrat_decision_logic",
  "source_registry_validation",
  "mantra_source_validation",
  "subscriber_personalization_scoring",
  "consent_entitlement_checks",
  "private_profile_handling",
  "internal_preview_generation",
  "audit_trace_generation",
  "ml_embedding_preparation"
]) {
  if (!registry.server_side_future_only.includes(serverOnly)) {
    fail(`Missing future server-only boundary: ${serverOnly}`);
  }
}

if (registry.next_content_specific_module?.module_id !== "C10") {
  fail("I00 must declare C10 as the next content-specific module");
}
if (registry.next_content_specific_module?.ml_ingestion_allowed !== false) {
  fail("C10 must not allow ML ingestion from I00");
}

for (const scopeItem of [
  "completed_article_registry",
  "published_work_registry",
  "image_picture_registry",
  "verified_link_registry",
  "source_rights_status",
  "public_safe_status",
  "ml_training_eligibility",
  "embedding_eligibility",
  "future_reuse_permission"
]) {
  if (!registry.next_content_specific_module.scope.includes(scopeItem)) {
    fail(`Missing C10 scope item: ${scopeItem}`);
  }
}

for (const flagName of [
  "public_panchang_enabled",
  "public_festival_enabled",
  "internal_preview_enabled",
  "subscriber_guidance_enabled",
  "auth_enabled",
  "supabase_enabled",
  "payment_enabled",
  "admin_review_enabled",
  "content_registry_write_enabled",
  "ml_ingestion_enabled",
  "external_api_fetch_enabled"
]) {
  if (!registry.future_feature_flags_all_false_in_i00.includes(flagName)) {
    fail(`Missing future feature flag boundary: ${flagName}`);
  }
}

for (const prereq of [
  "source_status",
  "rights_status",
  "public_safe_status",
  "quality_status",
  "duplicate_near_duplicate_status",
  "ml_training_eligibility",
  "embedding_eligibility",
  "reviewer_approval"
]) {
  if (!registry.ml_embedding_prerequisites.includes(prereq)) {
    fail(`Missing ML/embedding prerequisite: ${prereq}`);
  }
}

for (const forbidden of [
  "enable_auth",
  "enable_supabase",
  "enable_payment",
  "fetch_external_apis",
  "create_live_api_routes",
  "activate_subscriber_login",
  "activate_dashboard_cards",
  "activate_public_panchang",
  "activate_public_festival_dates",
  "activate_lucky_number_output",
  "activate_colour_output",
  "activate_mantra_output",
  "activate_personalized_guidance",
  "activate_ml_ingestion",
  "create_embeddings",
  "mutate_article_data",
  "mutate_homepage_featured_reads",
  "mutate_sitemap",
  "write_image_registry",
  "write_selection_memory",
  "delete_backup_files",
  "modify_gitignore",
  "activate_public_output"
]) {
  if (!registry.forbidden_actions_in_i00.includes(forbidden)) {
    fail(`Missing forbidden I00 action: ${forbidden}`);
  }
}

for (const scriptName of ["validate:i00", "validate:implementation", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Repository Boundary Doctrine",
  "Folder Role Decision",
  "Current Achievement Baseline",
  "Architecture Principle",
  "Server / Client Boundary Doctrine",
  "Static Registry Loading Doctrine",
  "Content Workstream Position",
  "Backend / Supabase / Auth Position",
  "API Position",
  "Feature Flag Doctrine",
  "Environment Variable Policy",
  "Data Model Planning Boundary",
  "ML / Embedding Boundary",
  "Deployment Safety Doctrine",
  "Testing Strategy Doctrine",
  "Recommended Implementation Sequence",
  "Forbidden Actions in I00",
  "I00 does not implement"
]) {
  if (!docText.includes(phrase)) fail(`I00 document missing phrase: ${phrase}`);
}

pass("I00 registry is present.");
pass("I00 document is present.");
pass("I00 depends on M00-M10 and R00-R03, with R02 authorizing I00 as next phase.");
pass("Active repo and old scaffold roles are recorded.");
pass("Layered architecture and server/client boundaries are declared.");
pass("C10 is recorded as the next content-specific module without ML ingestion.");
pass("Backend/Auth/Supabase/payment/API/runtime/public/subscriber output remain disabled.");
pass("Feature flag, environment, data model, ML, deployment, and testing boundaries are declared.");
pass("I00 is implementation-planning-only and safe to commit.");
