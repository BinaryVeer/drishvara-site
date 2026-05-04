import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "implementation", "ir00-implementation-readiness-review-go-no-go-gate.json");
const docPath = path.join(process.cwd(), "docs", "implementation", "IR00_IMPLEMENTATION_READINESS_REVIEW_GO_NO_GO_GATE.md");
const previewPath = path.join(process.cwd(), "data", "implementation", "ir00-implementation-readiness-review-preview.json");
const packagePath = path.join(process.cwd(), "package.json");

const requiredDeps = [
  "data/implementation/i00-implementation-planning-safe-architecture-blueprint.json",
  "data/implementation/i01-safe-folder-architecture-static-registry-loading-plan.json",
  "data/implementation/i02-feature-flag-environment-boundary-plan.json",
  "data/implementation/i03-data-model-planning-without-database-activation.json",
  "data/implementation/i04-internal-preview-architecture-plan.json",
  "data/implementation/i05-backend-supabase-activation-readiness-plan.json",
  "data/content/c16-content-governance-close-out-implementation-handoff.json",
  "data/review/r03-backup-archive-repo-cleanliness-policy.json"
];

function fail(message) {
  console.error(`❌ IR00 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, packagePath, ...requiredDeps.map((p) => path.join(process.cwd(), p))]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing IR00 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "IR00") fail("module_id must be IR00");
if (preview.module_id !== "IR00") fail("preview output module_id must be IR00");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

for (const dep of ["I00", "I01", "I02", "I03", "I04", "I05", "C16", "R03"]) {
  if (!registry.depends_on.includes(dep)) fail(`IR00 must depend on ${dep}`);
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
  "backend_deployment_enabled",
  "activation_decision_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in IR00`);
}

if (!Array.isArray(registry.review_areas) || registry.review_areas.length < 15) {
  fail("IR00 must declare at least 15 review areas");
}

for (const area of registry.review_areas) {
  for (const field of ["area_key", "readiness_status", "evidence", "go_no_go", "activation_blockers"]) {
    if (!(field in area)) fail(`Review area ${area.area_key || "unknown"} missing field: ${field}`);
  }

  if (area.go_no_go === "go_for_activation_review_later") {
    fail(`IR00 must not allow activation review later directly: ${area.area_key}`);
  }

  if (!Array.isArray(area.activation_blockers) || area.activation_blockers.length === 0) {
    fail(`Review area ${area.area_key} must include activation blockers`);
  }
}

for (const key of [
  "runtime_activation",
  "backend_activation",
  "supabase_activation",
  "auth_activation",
  "payment_activation",
  "api_activation",
  "admin_activation",
  "public_output_activation",
  "subscriber_output_activation",
  "ml_embedding_activation"
]) {
  if (registry.default_decision[key] !== "no_go") {
    fail(`Default decision for ${key} must be no_go`);
  }
}

if (registry.default_decision.detailed_design !== "go") {
  fail("Default decision for detailed_design must be go");
}

for (const blocker of [
  "no_live_database",
  "no_supabase_project_activation",
  "no_auth_provider_activation",
  "no_rls_policies",
  "no_migrations",
  "no_api_routes",
  "no_admin_ui",
  "no_live_review_queue",
  "no_public_output_gate",
  "no_subscriber_output_gate",
  "no_payment_provider",
  "no_ml_embedding_approval"
]) {
  if (!registry.critical_activation_blockers.includes(blocker)) {
    fail(`Missing critical activation blocker: ${blocker}`);
  }
}

for (const action of registry.prohibited_activation_actions) {
  if (![
    "backend_activation",
    "supabase_connection",
    "supabase_table_creation",
    "database_migration",
    "auth_activation",
    "rls_activation",
    "payment_activation",
    "api_route_creation",
    "server_endpoint_creation",
    "admin_ui_creation",
    "review_queue_write",
    "final_registry_write",
    "public_panchang_output",
    "public_festival_output",
    "subscriber_guidance_output",
    "ml_ingestion",
    "embedding_generation",
    "vector_database_write",
    "external_api_fetch",
    "public_output",
    "subscriber_output",
    "content_mutation"
  ].includes(action)) {
    fail(`Unexpected prohibited activation action: ${action}`);
  }
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (preview.summary.missing_evidence_count !== 0) {
  fail(`All evidence sources must be present. Missing: ${(preview.summary.missing_evidence || []).join(", ")}`);
}

for (const zeroField of ["activation_allowed_count", "activated_count"]) {
  if (preview.summary[zeroField] !== 0) fail(`Preview summary ${zeroField} must be zero`);
}

for (const falseField of [
  "runtime_activation_allowed",
  "backend_activation_allowed",
  "supabase_activation_allowed",
  "auth_activation_allowed",
  "public_output_activation_allowed",
  "subscriber_output_activation_allowed",
  "ml_embedding_activation_allowed"
]) {
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

if (preview.summary.design_only_allowed !== true) fail("Design-only work should be allowed");

for (const area of preview.review_areas) {
  if (area.activated !== false) fail(`Review area ${area.area_key} must not be activated`);
  if (area.activation_allowed !== false) fail(`Review area ${area.area_key} activation_allowed must be false`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "ID00") {
  fail("IR00 recommended next stage must be ID00");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("ID00 runtime_allowed must be false");
if (registry.recommended_next_stage?.database_activation_allowed !== false) fail("ID00 database activation must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("ID00 activation decision must be false");

for (const scriptName of ["generate:ir00", "validate:ir00", "validate:implementation", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Review Doctrine",
  "Go / No-Go Doctrine",
  "Review Areas",
  "Evidence Pack Doctrine",
  "Activation Blocker Doctrine",
  "Design-Only Permission Doctrine",
  "Prohibited Activation Doctrine",
  "Safe Next-Step Doctrine",
  "Validation Doctrine",
  "Explicit Exclusions",
  "IR00 does not"
]) {
  if (!docText.includes(phrase)) fail(`IR00 document missing phrase: ${phrase}`);
}

pass("IR00 registry is present.");
pass("IR00 document is present.");
pass("IR00 readiness review preview is present and marked preview-only.");
pass("I00-I05, C16, and R03 evidence sources are present.");
pass("Readiness review areas and activation blockers are recorded.");
pass("Default decision is no-go for activation and go only for detailed design.");
pass("No backend, Supabase, Auth, RLS, migration, API, admin, payment, ML, public output, subscriber output, or mutation is enabled.");
pass("ID00 is recorded as the recommended next design-only stage.");
pass("IR00 is implementation-readiness-review-only and safe to commit.");
