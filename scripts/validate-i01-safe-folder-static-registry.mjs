import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "implementation", "i01-safe-folder-architecture-static-registry-loading-plan.json");
const docPath = path.join(process.cwd(), "docs", "implementation", "I01_SAFE_FOLDER_ARCHITECTURE_STATIC_REGISTRY_LOADING_PLAN.md");
const manifestPath = path.join(process.cwd(), "data", "implementation", "i01-static-registry-loading-manifest-preview.json");
const i00Path = path.join(process.cwd(), "data", "implementation", "i00-implementation-planning-safe-architecture-blueprint.json");
const c16Path = path.join(process.cwd(), "data", "content", "c16-content-governance-close-out-implementation-handoff.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ I01 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, manifestPath, i00Path, c16Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing I01 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const i00 = JSON.parse(fs.readFileSync(i00Path, "utf8"));
const c16 = JSON.parse(fs.readFileSync(c16Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "I01") fail("module_id must be I01");
if (manifest.module_id !== "I01") fail("manifest output module_id must be I01");
if (manifest.preview_only !== true) fail("manifest output must be preview_only=true");

if (c16.recommended_next_stage?.module_id !== "I01") {
  fail("C16 must recommend I01 as next stage before I01 proceeds");
}

for (const dep of ["I00", "C16"]) {
  if (!registry.depends_on.includes(dep)) fail(`I01 must depend on ${dep}`);
}

if (registry.active_repo !== "drishvara-site") fail("active_repo must be drishvara-site");
if (registry.reference_scaffold !== "drishvara_phase01_scaffold") fail("reference scaffold must be drishvara_phase01_scaffold");
if (registry.reference_scaffold_blind_merge_allowed !== false) fail("reference scaffold blind merge must be false");

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "runtime_loader_enabled",
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
  "folder_restructure_enabled",
  "file_deletion_enabled",
  "gitignore_modification_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in I01`);
}

for (const folder of [
  "docs/methodology",
  "data/methodology",
  "docs/review",
  "data/review",
  "docs/content",
  "data/content",
  "docs/implementation",
  "data/implementation",
  "scripts",
  "articles",
  "assets",
  "data/seo",
  "data/i18n"
]) {
  const found = registry.folder_roles.find((x) => x.folder === folder);
  if (!found) fail(`Missing folder role: ${folder}`);
}

for (const family of [
  "methodology_registries",
  "review_registries",
  "content_governance_registries",
  "content_preview_outputs",
  "implementation_planning_registries"
]) {
  if (!registry.static_registry_candidate_families.includes(family)) {
    fail(`Missing static registry family: ${family}`);
  }
  if (!manifest.summary.family_counts[family]) {
    fail(`Manifest missing candidate count for family: ${family}`);
  }
}

for (const field of registry.manifest_required_fields) {
  if (!(field in manifest)) fail(`Manifest missing field: ${field}`);
}

if (!Array.isArray(manifest.registry_candidates) || manifest.registry_candidates.length === 0) {
  fail("Manifest must contain registry candidates");
}

for (const candidate of manifest.registry_candidates) {
  for (const field of registry.registry_candidate_required_fields) {
    if (!(field in candidate)) fail(`Registry candidate missing field: ${field}`);
  }

  if (candidate.mutation_allowed !== false) fail(`Candidate ${candidate.relative_path} must have mutation_allowed=false`);
  if (candidate.runtime_load_enabled !== false) fail(`Candidate ${candidate.relative_path} must have runtime_load_enabled=false`);
  if (candidate.public_output_allowed !== false) fail(`Candidate ${candidate.relative_path} must have public_output_allowed=false`);
}

if (manifest.summary.mutation_allowed_count !== 0) fail("mutation_allowed_count must be zero");
if (manifest.summary.runtime_load_enabled_count !== 0) fail("runtime_load_enabled_count must be zero");
if (manifest.summary.public_output_allowed_count !== 0) fail("public_output_allowed_count must be zero");

for (const rule of [
  "read_only_by_default",
  "mutation_disabled",
  "runtime_loader_disabled",
  "public_output_disabled",
  "subscriber_output_disabled",
  "admin_disabled",
  "supabase_disabled",
  "auth_disabled",
  "ml_disabled",
  "embedding_disabled"
]) {
  if (!registry.read_only_static_loading_rules.includes(rule)) {
    fail(`Missing read-only static loading rule: ${rule}`);
  }
}

for (const blocked of registry.blocked_capabilities) {
  if (!manifest.blocked_capabilities.includes(blocked)) {
    fail(`Manifest missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "I02") {
  fail("I01 recommended next stage must be I02");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("I02 runtime_allowed must be false");

for (const scriptName of ["generate:i01", "validate:i01", "validate:implementation", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Folder Architecture Doctrine",
  "Static Registry Loading Doctrine",
  "Static Registry Candidate Families",
  "Read-Only Loading Boundary",
  "No Runtime Loader Doctrine",
  "No Public Output Doctrine",
  "No Supabase/Auth/Admin Doctrine",
  "No ML/Embedding Doctrine",
  "Feature Flag Boundary",
  "Static Manifest Preview",
  "Recommended Next Stage",
  "Explicit Exclusions",
  "I01 does not"
]) {
  if (!docText.includes(phrase)) fail(`I01 document missing phrase: ${phrase}`);
}

pass("I01 registry is present.");
pass("I01 document is present.");
pass("I01 static registry manifest preview is present and marked preview-only.");
pass("Folder roles and static registry candidate families are declared.");
pass("Static registry candidates are read-only, non-runtime, and non-public-output.");
pass("Runtime loader, API routes, Supabase, Auth, admin, ML, mutation, public output, and subscriber output remain disabled.");
pass("I02 is recorded as the recommended next stage, with runtime still blocked.");
pass("I01 is implementation-planning/static-loading-plan-only and safe to commit.");
