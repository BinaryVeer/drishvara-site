import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "implementation", "id02-api-route-contract-design-without-route-creation.json");
const outPath = path.join(root, "data", "implementation", "id02-api-route-contract-design-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);

const contracts = registry.future_api_contracts.map((contract) => ({
  ...contract,
  route_created: false,
  route_file_created: false,
  route_handler_created: false,
  server_endpoint_created: false,
  runtime_enabled: false,
  public_output_allowed: false,
  subscriber_output_allowed: false,
  next_action: "keep_contract_design_only"
}));

const familyCounts = {};
const accessTierCounts = {};
for (const contract of contracts) {
  familyCounts[contract.route_family] = (familyCounts[contract.route_family] || 0) + 1;
  accessTierCounts[contract.access_tier] = (accessTierCounts[contract.access_tier] || 0) + 1;
}

const output = {
  preview_id: "ID02_API_ROUTE_CONTRACT_DESIGN_PREVIEW",
  module_id: "ID02",
  status: "preview_only_api_contract_design_no_route_creation",
  preview_only: true,
  route_families: registry.route_families,
  access_tiers: registry.access_tiers,
  error_taxonomy: registry.error_taxonomy,
  future_api_contracts: contracts,
  default_contract_rules: registry.default_contract_rules,
  summary: {
    future_api_contract_count: contracts.length,
    route_family_counts: familyCounts,
    access_tier_counts: accessTierCounts,
    route_created_count: 0,
    route_file_created_count: 0,
    route_handler_created_count: 0,
    server_endpoint_created_count: 0,
    runtime_enabled_count: 0,
    public_output_allowed_count: 0,
    subscriber_output_allowed_count: 0,
    auth_enabled: false,
    supabase_enabled: false,
    backend_enabled: false,
    payment_enabled: false,
    ml_enabled: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${contracts.length} API route contracts. No route creation.`);
