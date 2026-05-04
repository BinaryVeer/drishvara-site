import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "implementation", "id02-api-route-contract-design-without-route-creation.json");
const docPath = path.join(process.cwd(), "docs", "implementation", "ID02_API_ROUTE_CONTRACT_DESIGN_WITHOUT_ROUTE_CREATION.md");
const previewPath = path.join(process.cwd(), "data", "implementation", "id02-api-route-contract-design-preview.json");
const id01Path = path.join(process.cwd(), "data", "implementation", "id01-supabase-logical-schema-rls-design-without-migration.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ ID02 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, id01Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing ID02 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const id01 = JSON.parse(fs.readFileSync(id01Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "ID02") fail("module_id must be ID02");
if (preview.module_id !== "ID02") fail("preview output module_id must be ID02");
if (preview.preview_only !== true) fail("preview output must be preview_only=true");

if (id01.recommended_next_stage?.module_id !== "ID02") {
  fail("ID01 must recommend ID02 as next stage before ID02 proceeds");
}

for (const dep of ["ID01", "ID00", "IR00", "I00", "I01", "I02", "I03", "I04", "I05", "C16"]) {
  if (!registry.depends_on.includes(dep)) fail(`ID02 must depend on ${dep}`);
}

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "route_file_creation_enabled",
  "route_handler_creation_enabled",
  "backend_code_creation_enabled",
  "backend_activation_enabled",
  "supabase_enabled",
  "supabase_connection_enabled",
  "service_role_operation_enabled",
  "rls_enabled",
  "auth_enabled",
  "auth_flow_creation_enabled",
  "payment_enabled",
  "payment_flow_creation_enabled",
  "database_activation_enabled",
  "database_client_enabled",
  "database_migration_enabled",
  "admin_ui_enabled",
  "admin_route_enabled",
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
  "secret_creation_enabled",
  "secret_reading_enabled",
  "backend_deployment_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in ID02`);
}

for (const family of [
  "internal_preview",
  "panchang_calculation",
  "observance_festival",
  "subscriber_profile",
  "subscriber_guidance",
  "content_review",
  "admin_review",
  "entitlement_payment",
  "audit",
  "health_readiness"
]) {
  if (!registry.route_families.includes(family)) fail(`Missing route family: ${family}`);
}

for (const tier of [
  "public_static_read",
  "internal_preview_read",
  "subscriber_private",
  "reviewer_restricted",
  "admin_restricted",
  "server_only"
]) {
  if (!registry.access_tiers.includes(tier)) fail(`Missing access tier: ${tier}`);
}

if (!Array.isArray(registry.future_api_contracts) || registry.future_api_contracts.length < 10) {
  fail("ID02 must declare at least 10 future API contracts");
}

for (const contract of registry.future_api_contracts) {
  for (const field of registry.contract_required_fields) {
    if (!(field in contract)) fail(`API contract ${contract.route_key || "unknown"} missing field: ${field}`);
  }

  if (!registry.route_families.includes(contract.route_family)) fail(`Unknown route family: ${contract.route_family}`);
  if (!registry.access_tiers.includes(contract.access_tier)) fail(`Unknown access tier: ${contract.access_tier}`);
  if (contract.route_creation_enabled !== false) fail(`Route creation must be false for ${contract.route_key}`);
  if (contract.public_output_allowed !== false) fail(`Public output must be false for ${contract.route_key}`);
  if (contract.subscriber_output_allowed !== false) fail(`Subscriber output must be false for ${contract.route_key}`);

  if (!contract.request_contract?.prohibited_fields?.includes("service_role_key")) {
    fail(`Contract ${contract.route_key} must prohibit service_role_key in request`);
  }

  if (!Array.isArray(contract.activation_blockers) || contract.activation_blockers.length === 0) {
    fail(`Contract ${contract.route_key} must declare activation blockers`);
  }
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`Preview output missing field: ${field}`);
}

if (preview.summary.future_api_contract_count !== registry.future_api_contracts.length) {
  fail("Preview contract count must match registry");
}

for (const contract of preview.future_api_contracts) {
  if (contract.route_created !== false) fail(`Preview contract ${contract.route_key} route_created must be false`);
  if (contract.route_file_created !== false) fail(`Preview contract ${contract.route_key} route_file_created must be false`);
  if (contract.route_handler_created !== false) fail(`Preview contract ${contract.route_key} route_handler_created must be false`);
  if (contract.server_endpoint_created !== false) fail(`Preview contract ${contract.route_key} server_endpoint_created must be false`);
  if (contract.runtime_enabled !== false) fail(`Preview contract ${contract.route_key} runtime_enabled must be false`);
  if (contract.public_output_allowed !== false) fail(`Preview contract ${contract.route_key} public_output_allowed must be false`);
  if (contract.subscriber_output_allowed !== false) fail(`Preview contract ${contract.route_key} subscriber_output_allowed must be false`);
}

for (const zeroField of [
  "route_created_count",
  "route_file_created_count",
  "route_handler_created_count",
  "server_endpoint_created_count",
  "runtime_enabled_count",
  "public_output_allowed_count",
  "subscriber_output_allowed_count"
]) {
  if (preview.summary[zeroField] !== 0) fail(`Preview summary ${zeroField} must be zero`);
}

for (const falseField of ["auth_enabled", "supabase_enabled", "backend_enabled", "payment_enabled", "ml_enabled"]) {
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`Preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "QA00") {
  fail("ID02 recommended next stage must be QA00");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("QA00 runtime_allowed must be false");
if (registry.recommended_next_stage?.api_route_creation_allowed !== false) fail("QA00 API route creation must be false");

for (const scriptName of ["generate:id02", "validate:id02", "validate:implementation", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "API Contract Design Doctrine",
  "Route Family Doctrine",
  "Request Contract Doctrine",
  "Response Contract Doctrine",
  "Error Taxonomy Doctrine",
  "Access Boundary Doctrine",
  "Public Output Boundary",
  "Subscriber Output Boundary",
  "Admin and Review Boundary",
  "Panchang and Guidance Boundary",
  "Cache and Rate-Limit Doctrine",
  "Audit Trace Doctrine",
  "Activation Blocker Doctrine",
  "Preview Output",
  "Recommended Next Stage",
  "Explicit Exclusions",
  "ID02 does not"
]) {
  if (!docText.includes(phrase)) fail(`ID02 document missing phrase: ${phrase}`);
}

pass("ID02 registry is present.");
pass("ID02 document is present.");
pass("ID02 API route contract design preview is present and marked preview-only.");
pass("Route families, access tiers, error taxonomy, request contracts, response contracts, and activation blockers are declared.");
pass("All API contracts remain design-only with no route files, handlers, endpoints, runtime, public output, or subscriber output.");
pass("No backend, Supabase, Auth, RLS, migration, API, admin, payment, ML, public output, subscriber output, or mutation is enabled.");
pass("QA00 is recorded as the recommended next stability-audit stage.");
pass("ID02 is API route contract design-only and safe to commit.");
