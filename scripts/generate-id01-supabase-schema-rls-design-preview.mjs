import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "implementation", "id01-supabase-logical-schema-rls-design-without-migration.json");
const outPath = path.join(root, "data", "implementation", "id01-supabase-logical-schema-rls-design-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);

const tableCandidates = registry.logical_table_candidates.map((table) => ({
  ...table,
  table_created: false,
  migration_created: false,
  sql_file_created: false,
  rls_policy_created: false,
  database_client_enabled: false,
  database_write_enabled: false,
  public_output_allowed: false,
  subscriber_output_allowed: false,
  next_action: "keep_schema_design_only"
}));

const familyCounts = {};
const sensitivityCounts = {};
const piiCounts = {};

for (const table of tableCandidates) {
  familyCounts[table.schema_family] = (familyCounts[table.schema_family] || 0) + 1;
  sensitivityCounts[table.sensitivity_level] = (sensitivityCounts[table.sensitivity_level] || 0) + 1;
  piiCounts[table.pii_category] = (piiCounts[table.pii_category] || 0) + 1;
}

const output = {
  preview_id: "ID01_SUPABASE_LOGICAL_SCHEMA_RLS_DESIGN_PREVIEW",
  module_id: "ID01",
  status: "preview_only_supabase_schema_rls_design_no_migration",
  preview_only: true,
  schema_families: registry.schema_families,
  future_role_families: registry.future_role_families,
  rls_policy_types: registry.rls_policy_types,
  logical_table_candidates: tableCandidates,
  summary: {
    logical_table_candidate_count: tableCandidates.length,
    schema_family_counts: familyCounts,
    sensitivity_counts: sensitivityCounts,
    pii_counts: piiCounts,
    table_created_count: 0,
    migration_created_count: 0,
    sql_file_created_count: 0,
    rls_policy_created_count: 0,
    database_client_enabled_count: 0,
    database_write_enabled_count: 0,
    public_output_allowed_count: 0,
    subscriber_output_allowed_count: 0,
    supabase_enabled: false,
    auth_enabled: false,
    rls_enabled: false,
    payment_enabled: false,
    backend_enabled: false
  },
  migration_boundary: registry.migration_boundary,
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${tableCandidates.length} logical table candidates. No SQL, migration, table, RLS, or Supabase activation.`);
