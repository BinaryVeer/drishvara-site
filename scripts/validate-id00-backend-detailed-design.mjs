import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "implementation", "id00-backend-detailed-design-without-activation.json");
const docPath = path.join(process.cwd(), "docs", "implementation", "ID00_BACKEND_DETAILED_DESIGN_WITHOUT_ACTIVATION.md");
const previewPath = path.join(process.cwd(), "data", "implementation", "id00-backend-detailed-design-preview.json");
const ir00Path = path.join(process.cwd(), "data", "implementation", "ir00-implementation-readiness-review-go-no-go-gate.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ ID00 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, ir00Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing ID00 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const ir00 = JSON.parse(fs.readFileSync(ir00Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "ID00") fail("module_id must be ID00");
if (preview.module_id !== "ID00") fail("preview output module_id must be ID00");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

if (ir00.recommended_next_stage?.module_id !== "ID00") {
  fail("IR00 must recommend ID00 as next stage before ID00 proceeds");
}
if (ir00.default_decision?.detailed_design !== "go") {
  fail("IR00 must allow detailed design before ID00 proceeds");
}

for (const dep of ["IR00", "I00", "I01", "I02", "I03", "I04", "I05", "C16"]) {
  if (!registry.depends_on.includes(dep)) fail(`ID00 must depend on ${dep}`);
}

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "backend_code_creation_enabled",
  "route_handler_creation_enabled",
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
  if (registry[flag] !== false) fail(`${flag} must remain false in ID00`);
}

for (const layer of [
  "request_boundary_layer",
  "consent_entitlement_gate_layer",
  "source_methodology_gate_layer",
  "calculation_service_layer",
  "personalization_service_layer",
  "content_governance_service_layer",
  "review_queue_service_layer",
  "audit_service_layer",
  "storage_adapter_layer",
  "response_shaping_layer",
  "safety_redaction_layer"
]) {
  if (!registry.backend_layers.includes(layer)) fail(`Missing backend layer: ${layer}`);
}

if (!Array.isArray(registry.future_services) || registry.future_services.length < 10) {
  fail("ID00 must declare at least 10 future service designs");
}

for (const service of registry.future_services) {
  for (const field of registry.service_required_fields) {
    if (!(field in service)) fail(`Future service ${service.service_key || "unknown"} missing field: ${field}`);
  }
  if (!Array.isArray(service.activation_blockers) || service.activation_blockers.length === 0) {
    fail(`Future service ${service.service_key} must have activation blockers`);
  }
}

if (!Array.isArray(registry.future_api_families) || registry.future_api_families.length < 8) {
  fail("ID00 must declare at least 8 future API families");
}

for (const api of registry.future_api_families) {
  for (const field of registry.api_family_required_fields) {
    if (!(field in api)) fail(`Future API family ${api.api_family || "unknown"} missing field: ${field}`);
  }
  if (api.route_creation_enabled !== false) fail(`API family ${api.api_family} route_creation_enabled must be false`);
  if (api.public_output_allowed !== false) fail(`API family ${api.api_family} public_output_allowed must be false`);
  if (api.subscriber_output_allowed !== false) fail(`API family ${api.api_family} subscriber_output_allowed must be false`);
}

if (!Array.isArray(registry.supabase_table_candidates_not_created) || registry.supabase_table_candidates_not_created.length < 15) {
  fail("ID00 must declare at least 15 Supabase table candidates");
}

for (const role of [
  "anonymous_public",
  "subscriber",
  "reviewer",
  "admin_owner",
  "service_role_server_only"
]) {
  if (!registry.future_auth_roles.includes(role)) fail(`Missing future auth role: ${role}`);
}

for (const principle of [
  "deny_by_default",
  "service_role_never_client_side",
  "subscriber_rows_owned_by_subscriber",
  "reviewer_access_limited_by_role",
  "admin_access_audited"
]) {
  if (!registry.future_rls_design_principles.includes(principle)) {
    fail(`Missing future RLS design principle: ${principle}`);
  }
}

for (const gate of [
  "source_review_gate",
  "rights_review_gate",
  "public_safe_gate",
  "ml_eligibility_gate",
  "embedding_eligibility_gate",
  "registry_write_gate"
]) {
  if (!registry.content_governance_gates.includes(gate)) {
    fail(`Missing content governance gate: ${gate}`);
  }
}

for (const gate of [
  "source_first_gate",
  "sanskrit_integrity_gate",
  "no_invented_mantra_gate",
  "calculation_basis_disclosure_gate",
  "consent_privacy_gate",
  "subscriber_entitlement_gate",
  "public_subscriber_output_gate"
]) {
  if (!registry.panchang_guidance_gates.includes(gate)) {
    fail(`Missing Panchang/guidance gate: ${gate}`);
  }
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

for (const service of preview.future_services) {
  if (service.implemented !== false) fail(`Preview service ${service.service_key} must not be implemented`);
  if (service.runtime_enabled !== false) fail(`Preview service ${service.service_key} runtime_enabled must be false`);
  if (service.route_created !== false) fail(`Preview service ${service.service_key} route_created must be false`);
  if (service.database_write_enabled !== false) fail(`Preview service ${service.service_key} database_write_enabled must be false`);
  if (service.public_output_allowed !== false) fail(`Preview service ${service.service_key} public_output_allowed must be false`);
  if (service.subscriber_output_allowed !== false) fail(`Preview service ${service.service_key} subscriber_output_allowed must be false`);
}

for (const api of preview.future_api_families) {
  if (api.route_created !== false) fail(`Preview API ${api.api_family} route_created must be false`);
  if (api.runtime_enabled !== false) fail(`Preview API ${api.api_family} runtime_enabled must be false`);
  if (api.public_output_allowed !== false) fail(`Preview API ${api.api_family} public_output_allowed must be false`);
  if (api.subscriber_output_allowed !== false) fail(`Preview API ${api.api_family} subscriber_output_allowed must be false`);
}

for (const table of preview.supabase_table_candidates_not_created) {
  if (table.table_created !== false) fail(`Table candidate ${table.table_name} must not be created`);
  if (table.migration_created !== false) fail(`Table candidate ${table.table_name} migration_created must be false`);
  if (table.rls_policy_created !== false) fail(`Table candidate ${table.table_name} rls_policy_created must be false`);
  if (table.database_write_enabled !== false) fail(`Table candidate ${table.table_name} database_write_enabled must be false`);
}

for (const zeroField of [
  "implemented_service_count",
  "route_created_count",
  "table_created_count",
  "migration_created_count",
  "rls_policy_created_count",
  "database_write_enabled_count",
  "public_output_allowed_count",
  "subscriber_output_allowed_count"
]) {
  if (preview.summary[zeroField] !== 0) fail(`Preview summary ${zeroField} must be zero`);
}

for (const falseField of [
  "backend_activated",
  "supabase_activated",
  "auth_activated",
  "payment_activated",
  "ml_activated",
  "embedding_activated"
]) {
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "ID01") {
  fail("ID00 recommended next stage must be ID01");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("ID01 runtime_allowed must be false");
if (registry.recommended_next_stage?.database_activation_allowed !== false) fail("ID01 database activation must be false");
if (registry.recommended_next_stage?.migration_allowed !== false) fail("ID01 migration_allowed must be false");

for (const scriptName of ["generate:id00", "validate:id00", "validate:implementation", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Backend Design Doctrine",
  "Backend Layer Design",
  "Service Boundary Doctrine",
  "API Design Boundary",
  "Supabase Design Boundary",
  "Auth and RLS Design Boundary",
  "Content Governance Backend Design",
  "Panchang and Guidance Backend Design",
  "Subscriber Data Design",
  "Audit and Trace Design",
  "Error and Fallback Design",
  "Deployment Boundary Design",
  "Security Design Boundary",
  "Design Output",
  "Recommended Next Stage",
  "Explicit Exclusions",
  "ID00 does not"
]) {
  if (!docText.includes(phrase)) fail(`ID00 document missing phrase: ${phrase}`);
}

pass("ID00 registry is present.");
pass("ID00 document is present.");
pass("ID00 backend detailed design preview is present and marked preview-only.");
pass("Backend layers, future services, API families, Supabase table candidates, Auth/RLS concepts, and gates are declared.");
pass("Services, API families, and table candidates remain design-only with no routes, tables, migrations, writes, public output, or subscriber output.");
pass("No backend code, Supabase, Auth, RLS, migration, API, admin, payment, ML, public output, subscriber output, or mutation is enabled.");
pass("ID01 is recorded as the recommended next design-only stage.");
pass("ID00 is backend-detailed-design-only and safe to commit.");
