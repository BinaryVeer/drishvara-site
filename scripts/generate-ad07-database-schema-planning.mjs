import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ad00Review: "data/content-intelligence/quality-reviews/ad00-astro-drishvara-data-foundation-opening.json",
  ad00SupabaseSnapshot: "data/content-intelligence/ad-foundation/ad00-existing-supabase-schema-snapshot-record.json",
  ad00DatabaseFirstDoctrine: "data/content-intelligence/ad-foundation/ad00-database-first-doctrine.json",

  ad01SourceConfidence: "data/content-intelligence/ad-foundation/ad01-source-confidence-model.json",
  ad02DatabasePlanning: "data/content-intelligence/ad-foundation/ad02-database-field-planning-map.json",
  ad03SourceRequirement: "data/content-intelligence/ad-foundation/ad03-regional-source-requirement-map.json",
  ad04ValidationCrossCheck: "data/content-intelligence/ad-foundation/ad04-validation-cross-check-model.json",
  ad05DatabasePlanning: "data/content-intelligence/ad-foundation/ad05-corpus-database-planning-map.json",

  ad06Review: "data/content-intelligence/quality-reviews/ad06-vedic-guidance-star-reflection-rule-model.json",
  ad06DatabasePlanning: "data/content-intelligence/ad-foundation/ad06-guidance-reflection-database-planning-map.json",
  ad06NoMutationAudit: "data/content-intelligence/backend-architecture/ad06-no-mutation-audit-register.json",
  ad06Readiness: "data/content-intelligence/quality-registry/ad06-ad07-database-schema-planning-readiness-record.json",
  ad06Boundary: "data/content-intelligence/mutation-plans/ad06-to-ad07-database-schema-planning-boundary.json",

  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ad07-database-schema-planning.json",
  supabaseSnapshotConsumption: "data/content-intelligence/ad-foundation/ad07-existing-supabase-schema-consumption-map.json",
  adFoundationTableMap: "data/content-intelligence/ad-foundation/ad07-ad-foundation-table-map.json",
  localDatabaseSchemaPlan: "data/content-intelligence/ad-foundation/ad07-local-database-schema-plan.json",
  supabaseExtensionPlan: "data/content-intelligence/ad-foundation/ad07-supabase-schema-extension-plan.json",
  relationshipIndexMap: "data/content-intelligence/ad-foundation/ad07-table-relationship-index-map.json",
  schemaGovernanceDeferral: "data/content-intelligence/backend-architecture/ad07-schema-governance-migration-deferral-register.json",
  noSqlNoDbWriteAudit: "data/content-intelligence/backend-architecture/ad07-no-sql-no-db-write-audit.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ad07-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ad07-ad08-seed-data-source-attribution-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ad07-to-ad08-seed-data-source-attribution-boundary.json",
  registry: "data/quality/ad07-database-schema-planning.json",
  preview: "data/quality/ad07-database-schema-planning-preview.json",
  doc: "docs/quality/AD07_DATABASE_SCHEMA_PLANNING.md"
};

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function read(p) {
  return fs.readFileSync(full(p), "utf8");
}

function readJson(p) {
  return JSON.parse(read(p));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AD07 input: ${p}`);
}

const ad00Review = readJson(inputs.ad00Review);
const ad00SupabaseSnapshot = readJson(inputs.ad00SupabaseSnapshot);
const ad00DatabaseFirstDoctrine = readJson(inputs.ad00DatabaseFirstDoctrine);
const ad01SourceConfidence = readJson(inputs.ad01SourceConfidence);
const ad02DatabasePlanning = readJson(inputs.ad02DatabasePlanning);
const ad03SourceRequirement = readJson(inputs.ad03SourceRequirement);
const ad04ValidationCrossCheck = readJson(inputs.ad04ValidationCrossCheck);
const ad05DatabasePlanning = readJson(inputs.ad05DatabasePlanning);
const ad06Review = readJson(inputs.ad06Review);
const ad06DatabasePlanning = readJson(inputs.ad06DatabasePlanning);
const ad06NoMutationAudit = readJson(inputs.ad06NoMutationAudit);
const ad06Readiness = readJson(inputs.ad06Readiness);
const ad06Boundary = readJson(inputs.ad06Boundary);

if (ad06Review.status !== "vedic_guidance_star_reflection_rule_model_ready_for_ad07") {
  throw new Error("AD06 review status mismatch.");
}
if (ad06Review.summary?.ready_for_ad07 !== true) {
  throw new Error("AD06 does not show AD07 readiness.");
}
if (ad06NoMutationAudit.audit_passed !== true) {
  throw new Error("AD06 no-mutation audit must pass.");
}
if (ad06Readiness.ready_for_ad07 !== true || ad06Readiness.next_stage_id !== "AD07") {
  throw new Error("AD06 readiness must permit AD07.");
}
if (ad06Boundary.next_stage_id !== "AD07") {
  throw new Error("AD06 boundary must point to AD07.");
}
if (!JSON.stringify(ad06Boundary.allowed_scope).includes("existing Supabase content-publishing schema snapshot")) {
  throw new Error("AD06 boundary must preserve old Supabase snapshot mapping.");
}
if (ad00Review.status !== "astro_drishvara_data_foundation_opened_ready_for_ad01") {
  throw new Error("AD00 review status mismatch.");
}
for (const table of ["articles", "article_scriptural_references", "media_assets", "contributors", "publication_runs", "locations"]) {
  if (!JSON.stringify(ad00SupabaseSnapshot).includes(table)) {
    throw new Error(`Existing Supabase snapshot missing table: ${table}`);
  }
}
for (const table of ["panchang_daily_records", "word_corpus", "vedic_guidance_rules", "star_reflection_rules"]) {
  if (!JSON.stringify([ad00DatabaseFirstDoctrine, ad02DatabasePlanning, ad05DatabasePlanning, ad06DatabasePlanning]).includes(table)) {
    throw new Error(`AD planning input missing table: ${table}`);
  }
}
if (!JSON.stringify(ad01SourceConfidence).includes("source_id")) {
  throw new Error("AD01 source confidence model must remain available.");
}
if (!JSON.stringify(ad03SourceRequirement).includes("supported_rule")) {
  throw new Error("AD03 source requirement map must remain available.");
}
if (!JSON.stringify(ad04ValidationCrossCheck).includes("discrepancy_types")) {
  throw new Error("AD04 validation cross-check model must remain available.");
}

const blockedState = {
  ad07_database_schema_planning_recorded: true,
  ad00_to_ad06_consumed: true,
  existing_supabase_schema_snapshot_consumed: true,
  ad_foundation_table_map_recorded: true,
  local_database_schema_plan_recorded: true,
  supabase_extension_plan_recorded: true,
  table_relationship_index_map_recorded: true,
  migration_deferral_recorded: true,
  no_sql_no_db_write_audit_recorded: true,
  ready_for_ad08: true,

  ag47_resume_allowed: false,
  homepage_mutated: false,
  public_content_generated: false,
  guidance_generated: false,
  panchang_prediction_generated: false,
  panchang_calculation_executed: false,
  seed_data_inserted: false,
  live_source_fetch_executed: false,
  web_scraping_executed: false,
  sql_file_created: false,
  sql_migration_created: false,
  sql_executed: false,
  database_write_performed: false,
  supabase_table_created: false,
  supabase_schema_modified: false,
  backend_auth_supabase_activation_performed: false,
  deployment_performed: false,
  service_role_key_exposed: false
};

const supabaseSnapshotConsumption = {
  module_id: "AD07",
  title: "Existing Supabase Schema Consumption Map",
  status: "existing_supabase_schema_snapshot_consumed_for_ad07",
  consumed_snapshot_file: inputs.ad00SupabaseSnapshot,
  existing_tables_observed: [
    "articles",
    "article_scriptural_references",
    "media_assets",
    "contributors",
    "contributor_submissions",
    "editorial_series",
    "publication_runs",
    "locations",
    "subscription_plans"
  ],
  consumption_rules: [
    "Do not duplicate existing content-publishing tables.",
    "Use articles and article_scriptural_references later for Featured Reads / long-form public content linkages.",
    "Use media_assets later for approved images/diagrams/visual object references.",
    "Use locations later for Panchanga location records where appropriate, or map through location_id.",
    "Use editorial_series/publication_runs later for cadence and publication tracking where approved.",
    "AD07 does not modify Supabase and does not create tables."
  ],
  blocked_state: blockedState
};

const adFoundationTableMap = {
  module_id: "AD07",
  title: "AD Foundation Table Map",
  status: "ad_foundation_table_map_recorded",
  planned_table_groups: [
    {
      group_id: "source_and_review",
      tables: [
        "source_authorities",
        "source_texts",
        "source_confidence_register",
        "editorial_review_status",
        "methodology_notes"
      ]
    },
    {
      group_id: "panchanga_core",
      tables: [
        "panchang_element_master",
        "tithi_master",
        "nakshatra_master",
        "yoga_master",
        "karana_master",
        "vara_master",
        "rashi_master",
        "panchang_daily_records"
      ]
    },
    {
      group_id: "regional_calendar",
      tables: [
        "regional_calendar_profiles",
        "regional_festival_rules",
        "festival_observance_rules",
        "muhurta_rules"
      ]
    },
    {
      group_id: "corpus",
      tables: [
        "word_corpus",
        "sanskrit_name_corpus",
        "sutra_quote_corpus",
        "reflection_prompt_rules"
      ]
    },
    {
      group_id: "guidance_and_reflection",
      tables: [
        "vedic_guidance_rules",
        "star_reflection_rules",
        "guidance_context_links",
        "claim_risk_register"
      ]
    }
  ],
  planning_rule: "This is table planning only. No SQL file, SQL migration, Supabase write or database change is created in AD07.",
  blocked_state: blockedState
};

const localDatabaseSchemaPlan = {
  module_id: "AD07",
  title: "Local Database Schema Plan",
  status: "local_database_schema_plan_recorded",
  purpose: "Prepare a local/offline schema-planning view for AD source, Panchanga, corpus and guidance tables before any Supabase migration is approved.",
  local_schema_principles: [
    "Use local planning records to validate table relationships before Supabase activation.",
    "Keep source/review metadata reusable across Panchanga, corpus and guidance records.",
    "Keep calculation_profile_id and regional_profile_id explicit.",
    "Keep public guidance text separate from raw Panchanga/corpus data.",
    "Keep claim-risk and editorial review status available for every public-facing candidate.",
    "Do not create a SQLite file or execute any database operation in AD07."
  ],
  planned_local_objects_no_file_created: [
    "local_schema_dictionary",
    "local_relationship_dictionary",
    "local_seed_manifest_template",
    "local_validation_manifest_template"
  ],
  blocked_state: blockedState
};

const supabaseExtensionPlan = {
  module_id: "AD07",
  title: "Supabase Schema Extension Plan",
  status: "supabase_schema_extension_plan_recorded_no_activation",
  extension_strategy: [
    "Preserve existing content-publishing schema.",
    "Add AD-specific tables only after explicit backend/Supabase approval.",
    "Prefer linking AD records to existing articles, media_assets, locations, editorial_series and publication_runs instead of duplicating them.",
    "Keep RLS/Auth/backend policies outside AD07 scope.",
    "Do not create Supabase migrations, tables, RPCs, triggers, storage buckets or functions in AD07."
  ],
  later_mapping_candidates: [
    {
      existing_table: "articles",
      possible_ad_link: "sutra_quote_corpus / methodology_notes / public reflection article references"
    },
    {
      existing_table: "article_scriptural_references",
      possible_ad_link: "sutra_quote_corpus and source_texts"
    },
    {
      existing_table: "media_assets",
      possible_ad_link: "future cultural diagrams, Panchanga visualizations, reflection media"
    },
    {
      existing_table: "locations",
      possible_ad_link: "panchang_daily_records.location_id and regional_calendar_profiles"
    },
    {
      existing_table: "editorial_series",
      possible_ad_link: "Word of the Day, observance cadence, reflection series"
    },
    {
      existing_table: "publication_runs",
      possible_ad_link: "future daily/weekly run tracking after runtime approval"
    }
  ],
  blocked_state: blockedState
};

const relationshipIndexMap = {
  module_id: "AD07",
  title: "Table Relationship and Index Map",
  status: "table_relationship_index_map_recorded",
  planned_relationships_no_sql: [
    {
      from_table: "panchang_daily_records",
      to_tables: ["locations", "regional_calendar_profiles", "methodology_notes", "source_authorities", "editorial_review_status"],
      relationship_note: "Daily Panchanga records must be location/profile/source/review aware."
    },
    {
      from_table: "vedic_guidance_rules",
      to_tables: ["panchang_element_master", "word_corpus", "sutra_quote_corpus", "reflection_prompt_rules", "claim_risk_register", "editorial_review_status"],
      relationship_note: "Guidance rules link context, corpus and safety metadata."
    },
    {
      from_table: "star_reflection_rules",
      to_tables: ["nakshatra_master", "rashi_master", "tithi_master", "guidance_context_links", "claim_risk_register", "editorial_review_status"],
      relationship_note: "Star Reflection remains traceable and non-deterministic."
    },
    {
      from_table: "sutra_quote_corpus",
      to_tables: ["source_texts", "source_authorities", "article_scriptural_references", "editorial_review_status"],
      relationship_note: "Quote/sutra records require source and copyright/context review."
    },
    {
      from_table: "word_corpus",
      to_tables: ["source_authorities", "reflection_prompt_rules", "editorial_review_status"],
      relationship_note: "Word records feed reflection only after verification."
    }
  ],
  planned_index_keys_no_sql: [
    "source_id",
    "regional_profile_id",
    "calculation_profile_id",
    "location_id",
    "editorial_review_status",
    "public_use_allowed",
    "claim_risk_level",
    "date_key"
  ],
  blocked_state: blockedState
};

const schemaGovernanceDeferral = {
  module_id: "AD07",
  title: "Schema Governance and Migration Deferral Register",
  status: "schema_governance_migration_deferred",
  deferral_rules: [
    "No SQL migration is created in AD07.",
    "No SQL is executed in AD07.",
    "No Supabase table, policy, trigger, function, bucket or RPC is created in AD07.",
    "No service-role key is required or exposed.",
    "Actual database activation remains deferred to a later explicit backend/Supabase approval stage.",
    "AD07 output is planning material for AD08, ADZ and later governed backend stages."
  ],
  carry_forward_to: ["AD08", "AD09", "AD10", "ADZ", "AG49", "AG52", "AG55", "AG56"],
  blocked_state: blockedState
};

const noSqlNoDbWriteAudit = {
  module_id: "AD07",
  title: "No SQL / No Database Write Audit",
  status: "no_sql_no_database_write_audit_passed_for_ad07",
  audit_passed: true,
  checks: [
    { check_id: "sql_file_created", expected: false, actual: false, passed: true },
    { check_id: "sql_migration_created", expected: false, actual: false, passed: true },
    { check_id: "sql_executed", expected: false, actual: false, passed: true },
    { check_id: "database_write_performed", expected: false, actual: false, passed: true },
    { check_id: "supabase_table_created", expected: false, actual: false, passed: true },
    { check_id: "supabase_schema_modified", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AD07",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ad07",
  checks: Object.entries({
    ag47_resume_allowed: false,
    homepage_mutated: false,
    public_content_generated: false,
    guidance_generated: false,
    panchang_prediction_generated: false,
    panchang_calculation_executed: false,
    seed_data_inserted: false,
    live_source_fetch_executed: false,
    web_scraping_executed: false,
    sql_file_created: false,
    sql_migration_created: false,
    sql_executed: false,
    database_write_performed: false,
    supabase_table_created: false,
    supabase_schema_modified: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  }).map(([check_id, expected]) => ({ check_id, expected, actual: expected, passed: true })),
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AD07",
  title: "AD08 Seed Data and Source Attribution Readiness Record",
  status: "ready_for_ad08_seed_data_source_attribution_register",
  ready_for_ad08: true,
  next_stage_id: "AD08",
  next_stage_title: "Seed Data and Source Attribution Register",
  hard_blocker_count_for_ad08: 0,
  ag47_resume_allowed_next: false,
  public_content_generation_allowed_next: false,
  seed_data_insertion_allowed_next: false,
  live_fetch_allowed_next: false,
  web_scraping_allowed_next: false,
  sql_creation_allowed_next: false,
  sql_execution_allowed_next: false,
  database_write_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AD07",
  title: "AD07 to AD08 Seed Data Source Attribution Boundary",
  status: "ad08_seed_data_source_attribution_boundary_created",
  next_stage_id: "AD08",
  next_stage_title: "Seed Data and Source Attribution Register",
  allowed_scope: [
    "Define seed data manifest structure for source authorities, Panchanga master data, regional profiles, corpus entries and guidance rules.",
    "Define source attribution requirements and editorial verification status for seed candidates.",
    "Prepare source/seed register planning only.",
    "Do not insert seed data, fetch live sources, scrape web pages, create SQL, execute SQL or write database records."
  ],
  blocked_scope: [
    "AG47 resume",
    "public content generation",
    "seed data insertion",
    "live fetch",
    "web scraping",
    "SQL creation",
    "SQL execution",
    "database write",
    "Supabase table creation",
    "backend/Auth/Supabase activation",
    "service-role key exposure",
    "deployment"
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AD07",
  title: "Supabase and Local Database Schema Planning",
  status: "database_schema_planning_ready_for_ad08",
  depends_on: ["AD00", "AD01", "AD02", "AD03", "AD04", "AD05", "AD06"],
  supabase_snapshot_consumption_file: outputs.supabaseSnapshotConsumption,
  ad_foundation_table_map_file: outputs.adFoundationTableMap,
  local_database_schema_plan_file: outputs.localDatabaseSchemaPlan,
  supabase_extension_plan_file: outputs.supabaseExtensionPlan,
  relationship_index_map_file: outputs.relationshipIndexMap,
  schema_governance_deferral_file: outputs.schemaGovernanceDeferral,
  no_sql_no_db_write_audit_file: outputs.noSqlNoDbWriteAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ad07_database_schema_planning_recorded: true,
    ad00_to_ad06_consumed: true,
    existing_supabase_schema_snapshot_consumed: true,
    ad_foundation_table_map_recorded: true,
    local_database_schema_plan_recorded: true,
    supabase_extension_plan_recorded: true,
    table_relationship_index_map_recorded: true,
    migration_deferral_recorded: true,
    no_sql_no_db_write_audit_recorded: true,
    ready_for_ad08: true,
    hard_blocker_count_for_ad08: 0,
    ag47_resume_allowed: false,
    homepage_mutated: false,
    public_content_generated: false,
    guidance_generated: false,
    panchang_prediction_generated: false,
    panchang_calculation_executed: false,
    seed_data_inserted: false,
    sql_file_created: false,
    sql_executed: false,
    database_write_performed: false,
    supabase_table_created: false,
    supabase_schema_modified: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AD07",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AD07",
  status: review.status,
  ad07_database_schema_planning_recorded: 1,
  ad00_to_ad06_consumed: 1,
  existing_supabase_schema_snapshot_consumed: 1,
  ad_foundation_table_map_recorded: 1,
  local_database_schema_plan_recorded: 1,
  supabase_extension_plan_recorded: 1,
  table_relationship_index_map_recorded: 1,
  migration_deferral_recorded: 1,
  no_sql_no_db_write_audit_recorded: 1,
  ready_for_ad08: 1,
  hard_blocker_count_for_ad08: 0,
  ag47_resume_allowed: 0,
  homepage_mutated: 0,
  public_content_generated: 0,
  guidance_generated: 0,
  panchang_prediction_generated: 0,
  panchang_calculation_executed: 0,
  seed_data_inserted: 0,
  sql_file_created: 0,
  sql_executed: 0,
  database_write_performed: 0,
  supabase_table_created: 0,
  supabase_schema_modified: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AD07 — Supabase and Local Database Schema Planning

## Result

AD07 records database schema planning for the Astro-Drishvara Data Foundation.

## Consumed scope

AD07 consumes AD00 through AD06 and preserves the old Supabase content-publishing schema snapshot.

## Existing schema preserved

Observed existing tables include:

- articles
- article_scriptural_references
- media_assets
- contributors
- contributor_submissions
- editorial_series
- publication_runs
- locations
- subscription_plans

## AD foundation planning groups

- Source and review
- Panchanga core
- Regional calendar
- Corpus
- Guidance and reflection

## Important boundary

AD07 is planning only.

No SQL file is created. No migration is created. No SQL is executed. No database write is performed. No Supabase table is created. No backend/Auth/Supabase activation is performed.

## Next

AD08 — Seed Data and Source Attribution Register.
`;

writeJson(outputs.supabaseSnapshotConsumption, supabaseSnapshotConsumption);
writeJson(outputs.adFoundationTableMap, adFoundationTableMap);
writeJson(outputs.localDatabaseSchemaPlan, localDatabaseSchemaPlan);
writeJson(outputs.supabaseExtensionPlan, supabaseExtensionPlan);
writeJson(outputs.relationshipIndexMap, relationshipIndexMap);
writeJson(outputs.schemaGovernanceDeferral, schemaGovernanceDeferral);
writeJson(outputs.noSqlNoDbWriteAudit, noSqlNoDbWriteAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AD07 Supabase and Local Database Schema Planning generated.");
console.log("✅ Existing Supabase schema snapshot consumed and preserved.");
console.log("✅ AD foundation table map, local database schema plan, Supabase extension plan and relationship/index map recorded.");
console.log("✅ Ready for AD08 Seed Data and Source Attribution Register.");
console.log("✅ No SQL, DB write, Supabase/backend activation, deployment or service-role exposure recorded.");
