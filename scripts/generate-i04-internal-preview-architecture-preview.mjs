import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "implementation", "i04-internal-preview-architecture-plan.json");
const outPath = path.join(root, "data", "implementation", "i04-internal-preview-architecture-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);

const previewFamilies = registry.preview_families.map((family) => ({
  preview_family: family,
  readiness_level: registry.preview_family_default_status,
  runtime_enabled: false,
  route_created: false,
  ui_created: false,
  public_output_allowed: false,
  subscriber_output_allowed: false,
  mutation_allowed: false,
  requires_future_access_boundary: true,
  requires_future_redaction: true,
  requires_future_audit_trace: true,
  next_action: "keep_planning_only"
}));

const output = {
  preview_id: "I04_INTERNAL_PREVIEW_ARCHITECTURE_PREVIEW",
  module_id: "I04",
  status: "preview_only_internal_preview_architecture_no_runtime",
  preview_only: true,
  preview_families: previewFamilies,
  access_boundary_requirements: registry.access_boundary_requirements,
  redaction_categories: registry.redaction_categories,
  candidate_preview_sources: registry.candidate_preview_sources,
  future_route_controls_required: registry.future_route_controls_required,
  future_preview_ui_required_fields: registry.future_preview_ui_required_fields,
  future_audit_trace_fields: registry.future_audit_trace_fields,
  future_safe_mode_forces_off: registry.future_safe_mode_forces_off,
  preview_readiness_levels: registry.preview_readiness_levels,
  data_handling_classes: registry.data_handling_classes,
  security_risks_blocked: registry.security_risks_blocked,
  future_evidence_pack_fields: registry.future_evidence_pack_fields,
  future_failure_safety_rules: registry.future_failure_safety_rules,
  summary: {
    preview_family_count: previewFamilies.length,
    planned_only_count: previewFamilies.length,
    runtime_enabled_count: 0,
    route_created_count: 0,
    ui_created_count: 0,
    public_output_allowed_count: 0,
    subscriber_output_allowed_count: 0,
    mutation_allowed_count: 0,
    supabase_enabled: false,
    auth_enabled: false,
    admin_enabled: false,
    database_enabled: false,
    ml_enabled: false,
    embedding_enabled: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${previewFamilies.length} planned internal preview families and no runtime activation.`);
