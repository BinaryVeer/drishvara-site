import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

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

function fail(message) {
  console.error(`❌ AD07 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ad00-astro-drishvara-data-foundation-opening.json",
  "data/content-intelligence/ad-foundation/ad00-existing-supabase-schema-snapshot-record.json",
  "data/content-intelligence/ad-foundation/ad00-database-first-doctrine.json",
  "data/content-intelligence/ad-foundation/ad01-source-confidence-model.json",
  "data/content-intelligence/ad-foundation/ad02-database-field-planning-map.json",
  "data/content-intelligence/ad-foundation/ad03-regional-source-requirement-map.json",
  "data/content-intelligence/ad-foundation/ad04-validation-cross-check-model.json",
  "data/content-intelligence/ad-foundation/ad05-corpus-database-planning-map.json",
  "data/content-intelligence/quality-reviews/ad06-vedic-guidance-star-reflection-rule-model.json",
  "data/content-intelligence/ad-foundation/ad06-guidance-reflection-database-planning-map.json",
  "data/content-intelligence/backend-architecture/ad06-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad06-ad07-database-schema-planning-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad06-to-ad07-database-schema-planning-boundary.json",

  "data/content-intelligence/quality-reviews/ad07-database-schema-planning.json",
  "data/content-intelligence/ad-foundation/ad07-existing-supabase-schema-consumption-map.json",
  "data/content-intelligence/ad-foundation/ad07-ad-foundation-table-map.json",
  "data/content-intelligence/ad-foundation/ad07-local-database-schema-plan.json",
  "data/content-intelligence/ad-foundation/ad07-supabase-schema-extension-plan.json",
  "data/content-intelligence/ad-foundation/ad07-table-relationship-index-map.json",
  "data/content-intelligence/backend-architecture/ad07-schema-governance-migration-deferral-register.json",
  "data/content-intelligence/backend-architecture/ad07-no-sql-no-db-write-audit.json",
  "data/content-intelligence/backend-architecture/ad07-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad07-ad08-seed-data-source-attribution-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad07-to-ad08-seed-data-source-attribution-boundary.json",
  "data/quality/ad07-database-schema-planning.json",
  "data/quality/ad07-database-schema-planning-preview.json",
  "docs/quality/AD07_DATABASE_SCHEMA_PLANNING.md",
  "scripts/generate-ad07-database-schema-planning.mjs",
  "scripts/validate-ad07-database-schema-planning.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ad06Review = readJson("data/content-intelligence/quality-reviews/ad06-vedic-guidance-star-reflection-rule-model.json");
const ad06NoMutationAudit = readJson("data/content-intelligence/backend-architecture/ad06-no-mutation-audit-register.json");
const ad06Readiness = readJson("data/content-intelligence/quality-registry/ad06-ad07-database-schema-planning-readiness-record.json");
const ad06Boundary = readJson("data/content-intelligence/mutation-plans/ad06-to-ad07-database-schema-planning-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ad07-database-schema-planning.json");
const supabaseSnapshotConsumption = readJson("data/content-intelligence/ad-foundation/ad07-existing-supabase-schema-consumption-map.json");
const adFoundationTableMap = readJson("data/content-intelligence/ad-foundation/ad07-ad-foundation-table-map.json");
const localDatabaseSchemaPlan = readJson("data/content-intelligence/ad-foundation/ad07-local-database-schema-plan.json");
const supabaseExtensionPlan = readJson("data/content-intelligence/ad-foundation/ad07-supabase-schema-extension-plan.json");
const relationshipIndexMap = readJson("data/content-intelligence/ad-foundation/ad07-table-relationship-index-map.json");
const schemaGovernanceDeferral = readJson("data/content-intelligence/backend-architecture/ad07-schema-governance-migration-deferral-register.json");
const noSqlNoDbWriteAudit = readJson("data/content-intelligence/backend-architecture/ad07-no-sql-no-db-write-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ad07-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ad07-ad08-seed-data-source-attribution-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ad07-to-ad08-seed-data-source-attribution-boundary.json");
const preview = readJson("data/quality/ad07-database-schema-planning-preview.json");
const pkg = readJson("package.json");

if (ad06Review.status !== "vedic_guidance_star_reflection_rule_model_ready_for_ad07") fail("AD06 review status mismatch.");
if (ad06Review.summary.ready_for_ad07 !== true) fail("AD06 readiness summary missing.");
if (ad06NoMutationAudit.audit_passed !== true) fail("AD06 no-mutation audit must pass.");
if (ad06Readiness.ready_for_ad07 !== true) fail("AD06 readiness must permit AD07.");
if (ad06Boundary.next_stage_id !== "AD07") fail("AD06 boundary must point to AD07.");

if (review.status !== "database_schema_planning_ready_for_ad08") fail("AD07 review status mismatch.");
for (const key of [
  "ad07_database_schema_planning_recorded",
  "ad00_to_ad06_consumed",
  "existing_supabase_schema_snapshot_consumed",
  "ad_foundation_table_map_recorded",
  "local_database_schema_plan_recorded",
  "supabase_extension_plan_recorded",
  "table_relationship_index_map_recorded",
  "migration_deferral_recorded",
  "no_sql_no_db_write_audit_recorded",
  "ready_for_ad08"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_ad08 !== 0) fail("AD08 blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "guidance_generated", "panchang_prediction_generated", "panchang_calculation_executed", "seed_data_inserted", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (supabaseSnapshotConsumption.status !== "existing_supabase_schema_snapshot_consumed_for_ad07") fail("Supabase snapshot consumption status mismatch.");
for (const table of ["articles", "article_scriptural_references", "media_assets", "contributors", "publication_runs", "locations", "subscription_plans"]) {
  if (!supabaseSnapshotConsumption.existing_tables_observed.includes(table)) fail(`Existing Supabase table missing: ${table}`);
}
if (!JSON.stringify(supabaseSnapshotConsumption.consumption_rules).includes("does not modify Supabase")) fail("No Supabase modification rule missing.");

if (adFoundationTableMap.status !== "ad_foundation_table_map_recorded") fail("AD foundation table map status mismatch.");
for (const table of ["source_authorities", "panchang_daily_records", "regional_calendar_profiles", "word_corpus", "sutra_quote_corpus", "vedic_guidance_rules", "star_reflection_rules", "claim_risk_register"]) {
  if (!JSON.stringify(adFoundationTableMap.planned_table_groups).includes(table)) fail(`AD planned table missing: ${table}`);
}

if (localDatabaseSchemaPlan.status !== "local_database_schema_plan_recorded") fail("Local database schema plan status mismatch.");
if (!JSON.stringify(localDatabaseSchemaPlan.local_schema_principles).includes("Do not create a SQLite file")) fail("No SQLite creation rule missing.");

if (supabaseExtensionPlan.status !== "supabase_schema_extension_plan_recorded_no_activation") fail("Supabase extension plan status mismatch.");
if (!JSON.stringify(supabaseExtensionPlan.extension_strategy).includes("Do not create Supabase migrations")) fail("No Supabase migrations rule missing.");
for (const existing of ["articles", "article_scriptural_references", "media_assets", "locations", "editorial_series", "publication_runs"]) {
  if (!JSON.stringify(supabaseExtensionPlan.later_mapping_candidates).includes(existing)) fail(`Supabase mapping candidate missing: ${existing}`);
}

if (relationshipIndexMap.status !== "table_relationship_index_map_recorded") fail("Relationship/index map status mismatch.");
for (const table of ["panchang_daily_records", "vedic_guidance_rules", "star_reflection_rules", "sutra_quote_corpus", "word_corpus"]) {
  if (!JSON.stringify(relationshipIndexMap.planned_relationships_no_sql).includes(table)) fail(`Relationship map table missing: ${table}`);
}
for (const key of ["source_id", "regional_profile_id", "calculation_profile_id", "location_id", "editorial_review_status", "public_use_allowed", "claim_risk_level"]) {
  if (!relationshipIndexMap.planned_index_keys_no_sql.includes(key)) fail(`Planned index key missing: ${key}`);
}

if (schemaGovernanceDeferral.status !== "schema_governance_migration_deferred") fail("Schema governance deferral status mismatch.");
for (const phrase of ["No SQL migration is created", "No SQL is executed", "No Supabase table", "No service-role key"]) {
  if (!JSON.stringify(schemaGovernanceDeferral.deferral_rules).includes(phrase)) fail(`Deferral phrase missing: ${phrase}`);
}
for (const target of ["AD08", "ADZ", "AG49", "AG52", "AG55", "AG56"]) {
  if (!schemaGovernanceDeferral.carry_forward_to.includes(target)) fail(`Carry-forward target missing: ${target}`);
}

if (noSqlNoDbWriteAudit.status !== "no_sql_no_database_write_audit_passed_for_ad07") fail("No SQL/no DB audit status mismatch.");
if (noSqlNoDbWriteAudit.audit_passed !== true) fail("No SQL/no DB audit must pass.");
if (noSqlNoDbWriteAudit.failed_checks.length !== 0) fail("No SQL/no DB audit failed checks must be zero.");
for (const check of noSqlNoDbWriteAudit.checks) {
  if (check.passed !== true) fail(`No SQL/no DB check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ad07") fail("No-mutation status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.status !== "ready_for_ad08_seed_data_source_attribution_register") fail("Readiness status mismatch.");
if (readiness.ready_for_ad08 !== true) fail("Readiness must permit AD08.");
if (readiness.next_stage_id !== "AD08") fail("Readiness next stage must be AD08.");
if (readiness.seed_data_insertion_allowed_next !== false) fail("Seed data insertion must remain blocked.");
if (readiness.sql_creation_allowed_next !== false) fail("SQL creation must remain blocked.");
if (readiness.sql_execution_allowed_next !== false) fail("SQL execution must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AD08") fail("Boundary must point to AD08.");
if (!JSON.stringify(boundary.allowed_scope).includes("seed data manifest")) fail("Seed data manifest boundary missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("Do not insert seed data")) fail("No seed insertion boundary missing.");
if (!boundary.blocked_scope.includes("SQL execution")) fail("SQL execution blocked scope missing.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role exposure blocked scope missing.");

for (const key of [
  "ad07_database_schema_planning_recorded",
  "ad00_to_ad06_consumed",
  "existing_supabase_schema_snapshot_consumed",
  "ad_foundation_table_map_recorded",
  "local_database_schema_plan_recorded",
  "supabase_extension_plan_recorded",
  "table_relationship_index_map_recorded",
  "migration_deferral_recorded",
  "no_sql_no_db_write_audit_recorded",
  "ready_for_ad08"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_ad08 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "guidance_generated", "panchang_prediction_generated", "panchang_calculation_executed", "seed_data_inserted", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ad07"]) fail("Missing package script: generate:ad07");
if (!pkg.scripts?.["validate:ad07"]) fail("Missing package script: validate:ad07");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ad07")) fail("validate:project must include validate:ad07.");

pass("AD07 Supabase and Local Database Schema Planning is present.");
pass("AD00 through AD06 are consumed.");
pass("Existing Supabase content-publishing schema snapshot is consumed and preserved.");
pass("AD foundation table map is valid.");
pass("Local database schema plan is valid.");
pass("Supabase extension plan is valid without activation.");
pass("Table relationship and index map is valid.");
pass("Schema governance and migration deferral is valid.");
pass("No SQL / no database write audit is valid.");
pass("No-mutation audit is valid.");
pass("AD08 Seed Data and Source Attribution Register readiness is valid.");
pass("No SQL, DB write, Supabase table creation, backend activation, deployment or service-role exposure is recorded.");
