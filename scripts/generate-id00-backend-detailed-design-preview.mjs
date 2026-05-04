import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "implementation", "id00-backend-detailed-design-without-activation.json");
const outPath = path.join(root, "data", "implementation", "id00-backend-detailed-design-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);

const services = registry.future_services.map((service) => ({
  ...service,
  implemented: false,
  runtime_enabled: false,
  route_created: false,
  database_write_enabled: false,
  public_output_allowed: false,
  subscriber_output_allowed: false,
  next_action: "keep_design_only"
}));

const apiFamilies = registry.future_api_families.map((api) => ({
  ...api,
  route_created: false,
  runtime_enabled: false,
  public_output_allowed: false,
  subscriber_output_allowed: false,
  next_action: "design_contract_later_without_route_creation"
}));

const tableCandidates = registry.supabase_table_candidates_not_created.map((table) => ({
  table_name: table,
  table_created: false,
  migration_created: false,
  rls_policy_created: false,
  database_write_enabled: false,
  next_action: "schema_design_later_without_migration"
}));

const serviceFamilyCounts = {};
for (const service of services) {
  serviceFamilyCounts[service.service_family] = (serviceFamilyCounts[service.service_family] || 0) + 1;
}

const output = {
  preview_id: "ID00_BACKEND_DETAILED_DESIGN_PREVIEW",
  module_id: "ID00",
  status: "preview_only_backend_detailed_design_no_activation",
  preview_only: true,
  backend_layers: registry.backend_layers,
  future_services: services,
  future_api_families: apiFamilies,
  supabase_table_candidates_not_created: tableCandidates,
  future_auth_roles: registry.future_auth_roles,
  future_rls_design_principles: registry.future_rls_design_principles,
  content_governance_gates: registry.content_governance_gates,
  panchang_guidance_gates: registry.panchang_guidance_gates,
  subscriber_sensitive_data_classes: registry.subscriber_sensitive_data_classes,
  audit_trace_families: registry.audit_trace_families,
  fallback_principles: registry.fallback_principles,
  deployment_design_requirements: registry.deployment_design_requirements,
  security_risks_to_prevent: registry.security_risks_to_prevent,
  summary: {
    backend_layer_count: registry.backend_layers.length,
    future_service_count: services.length,
    future_service_family_counts: serviceFamilyCounts,
    future_api_family_count: apiFamilies.length,
    supabase_table_candidate_count: tableCandidates.length,
    implemented_service_count: 0,
    route_created_count: 0,
    table_created_count: 0,
    migration_created_count: 0,
    rls_policy_created_count: 0,
    database_write_enabled_count: 0,
    public_output_allowed_count: 0,
    subscriber_output_allowed_count: 0,
    backend_activated: false,
    supabase_activated: false,
    auth_activated: false,
    payment_activated: false,
    ml_activated: false,
    embedding_activated: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${services.length} service designs, ${apiFamilies.length} API families, and ${tableCandidates.length} Supabase table candidates. No activation.`);
