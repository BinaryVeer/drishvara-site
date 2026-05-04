import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "implementation", "i05-backend-supabase-activation-readiness-plan.json");
const outPath = path.join(root, "data", "implementation", "i05-backend-supabase-readiness-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);

const readinessAreas = registry.readiness_areas.map((area) => ({
  ...area,
  activated: false,
  backend_enabled: false,
  supabase_enabled: false,
  auth_enabled: false,
  rls_enabled: false,
  database_enabled: false,
  api_enabled: false,
  public_output_allowed: false,
  subscriber_output_allowed: false,
  next_action: area.readiness_status === "ready_for_detailed_design"
    ? "prepare_detailed_design_in_future_module"
    : "keep_blocked_until_prerequisites_are_met"
}));

const statusCounts = {};
for (const area of readinessAreas) {
  statusCounts[area.readiness_status] = (statusCounts[area.readiness_status] || 0) + 1;
}

const output = {
  preview_id: "I05_BACKEND_SUPABASE_READINESS_PREVIEW",
  module_id: "I05",
  status: "preview_only_backend_supabase_readiness_no_activation",
  preview_only: true,
  readiness_areas: readinessAreas,
  summary: {
    readiness_area_count: readinessAreas.length,
    readiness_status_counts: statusCounts,
    activated_count: 0,
    backend_enabled_count: 0,
    supabase_enabled_count: 0,
    auth_enabled_count: 0,
    rls_enabled_count: 0,
    database_enabled_count: 0,
    api_enabled_count: 0,
    public_output_allowed_count: 0,
    subscriber_output_allowed_count: 0,
    activation_ready_count: 0
  },
  supabase_readiness_requirements: registry.supabase_readiness_requirements,
  auth_readiness_requirements: registry.auth_readiness_requirements,
  rls_readiness_requirements: registry.rls_readiness_requirements,
  migration_readiness_requirements: registry.migration_readiness_requirements,
  environment_secret_requirements: registry.environment_secret_requirements,
  api_readiness_requirements: registry.api_readiness_requirements,
  deployment_rollback_requirements: registry.deployment_rollback_requirements,
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${readinessAreas.length} backend/Supabase readiness areas and no activation.`);
