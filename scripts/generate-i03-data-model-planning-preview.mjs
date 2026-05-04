import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "implementation", "i03-data-model-planning-without-database-activation.json");
const outPath = path.join(root, "data", "implementation", "i03-data-model-planning-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);

const familyCounts = {};
const sensitivityCounts = {};
const piiCounts = {};
const storageCounts = {};

for (const entity of registry.planned_entities) {
  familyCounts[entity.family] = (familyCounts[entity.family] || 0) + 1;
  sensitivityCounts[entity.sensitivity_level] = (sensitivityCounts[entity.sensitivity_level] || 0) + 1;
  piiCounts[entity.pii_category] = (piiCounts[entity.pii_category] || 0) + 1;
  storageCounts[entity.future_storage_candidate] = (storageCounts[entity.future_storage_candidate] || 0) + 1;
}

const previewEntities = registry.planned_entities.map((entity) => ({
  ...entity,
  table_created: false,
  migration_created: false,
  database_write_enabled: false,
  api_exposed: false,
  public_output_allowed: false,
  subscriber_output_allowed: false,
  activation_status: "planned_not_activated"
}));

const output = {
  preview_id: "I03_DATA_MODEL_PLANNING_PREVIEW",
  module_id: "I03",
  status: "preview_only_logical_data_model_no_database_activation",
  preview_only: true,
  planned_data_model_families: registry.planned_data_model_families,
  planned_entities: previewEntities,
  sensitivity_levels: registry.sensitivity_levels,
  pii_categories: registry.pii_categories,
  storage_candidates_not_activated: registry.storage_candidates_not_activated,
  summary: {
    planned_entity_count: previewEntities.length,
    family_counts: familyCounts,
    sensitivity_counts: sensitivityCounts,
    pii_counts: piiCounts,
    future_storage_candidate_counts: storageCounts,
    tables_created_count: 0,
    migrations_created_count: 0,
    database_writes_enabled_count: 0,
    api_exposed_count: 0,
    public_output_allowed_count: 0,
    subscriber_output_allowed_count: 0,
    supabase_enabled: false,
    auth_enabled: false,
    payment_enabled: false,
    ml_enabled: false,
    embedding_enabled: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${previewEntities.length} planned entities and no database activation.`);
