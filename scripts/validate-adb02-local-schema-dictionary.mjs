import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ ADB02 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb01-database-build-approval-checkpoint.json",
  "data/content-intelligence/database-build/adb01-database-build-approval-checkpoint.json",
  "data/content-intelligence/database-build/adb01-build-path-decision-matrix.json",
  "data/content-intelligence/backend-architecture/adb01-security-gate-register.json",
  "data/content-intelligence/backend-architecture/adb01-no-sql-no-db-write-audit.json",
  "data/content-intelligence/backend-architecture/adb01-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb01-adb02-local-schema-dictionary-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb01-to-adb02-local-schema-dictionary-boundary.json",

  "data/content-intelligence/quality-reviews/adb02-local-schema-dictionary.json",
  "data/content-intelligence/database-build/adb02-table-dictionary.json",
  "data/content-intelligence/database-build/adb02-field-dictionary.json",
  "data/content-intelligence/database-build/adb02-relationship-blueprint.json",
  "data/content-intelligence/database-build/adb02-index-constraint-planning.json",
  "data/content-intelligence/database-build/adb02-local-schema-validation-checklist.json",
  "data/content-intelligence/database-build/adb02-no-sql-export-plan.json",
  "data/content-intelligence/backend-architecture/adb02-no-sql-no-db-write-audit.json",
  "data/content-intelligence/backend-architecture/adb02-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb02-adb03-local-schema-validation-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb02-to-adb03-local-schema-validation-boundary.json",
  "data/quality/adb02-local-schema-dictionary.json",
  "data/quality/adb02-local-schema-dictionary-preview.json",
  "docs/quality/ADB02_LOCAL_SCHEMA_DICTIONARY.md",
  "scripts/generate-adb02-local-schema-dictionary.mjs",
  "scripts/validate-adb02-local-schema-dictionary.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb01Review = readJson("data/content-intelligence/quality-reviews/adb01-database-build-approval-checkpoint.json");
const adb01Checkpoint = readJson("data/content-intelligence/database-build/adb01-database-build-approval-checkpoint.json");
const adb01NoSqlAudit = readJson("data/content-intelligence/backend-architecture/adb01-no-sql-no-db-write-audit.json");
const adb01NoMutationAudit = readJson("data/content-intelligence/backend-architecture/adb01-no-mutation-audit-register.json");
const adb01Readiness = readJson("data/content-intelligence/quality-registry/adb01-adb02-local-schema-dictionary-readiness-record.json");
const adb01Boundary = readJson("data/content-intelligence/mutation-plans/adb01-to-adb02-local-schema-dictionary-boundary.json");

if (adb01Review.status !== "database_build_approval_checkpoint_ready_for_adb02") fail("ADB01 review status mismatch.");
if (adb01Checkpoint.selected_path !== "local_schema_dictionary_first") fail("ADB01 selected path mismatch.");
if (adb01NoSqlAudit.audit_passed !== true) fail("ADB01 no SQL/no DB audit must pass.");
if (adb01NoMutationAudit.audit_passed !== true) fail("ADB01 no-mutation audit must pass.");
if (adb01Readiness.ready_for_adb02 !== true) fail("ADB01 readiness must permit ADB02.");
if (adb01Boundary.next_stage_id !== "ADB02") fail("ADB01 boundary must point to ADB02.");

const review = readJson("data/content-intelligence/quality-reviews/adb02-local-schema-dictionary.json");
const tableDictionary = readJson("data/content-intelligence/database-build/adb02-table-dictionary.json");
const fieldDictionary = readJson("data/content-intelligence/database-build/adb02-field-dictionary.json");
const relationshipBlueprint = readJson("data/content-intelligence/database-build/adb02-relationship-blueprint.json");
const indexConstraintPlan = readJson("data/content-intelligence/database-build/adb02-index-constraint-planning.json");
const validationChecklist = readJson("data/content-intelligence/database-build/adb02-local-schema-validation-checklist.json");
const noSqlExportPlan = readJson("data/content-intelligence/database-build/adb02-no-sql-export-plan.json");
const noSqlAudit = readJson("data/content-intelligence/backend-architecture/adb02-no-sql-no-db-write-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/adb02-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb02-adb03-local-schema-validation-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb02-to-adb03-local-schema-validation-boundary.json");
const preview = readJson("data/quality/adb02-local-schema-dictionary-preview.json");
const pkg = readJson("package.json");

if (review.status !== "local_schema_dictionary_ready_for_adb03") fail("ADB02 review status mismatch.");
for (const key of [
  "adb02_local_schema_dictionary_recorded",
  "adb01_consumed",
  "table_dictionary_recorded",
  "field_dictionary_recorded",
  "relationship_blueprint_recorded",
  "index_constraint_plan_recorded",
  "local_schema_validation_checklist_recorded",
  "no_sql_export_plan_recorded",
  "ready_for_adb03"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_adb03 !== 0) fail("ADB03 blocker count must be zero.");
for (const key of ["sql_draft_approved", "sql_execution_approved", "database_write_approved", "supabase_activation_approved", "seed_insert_approved", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "seed_data_inserted", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (tableDictionary.status !== "table_dictionary_recorded") fail("Table dictionary status mismatch.");
for (const table of ["source_authorities", "panchang_daily_records", "regional_calendar_profiles", "word_corpus", "sutra_quote_corpus", "vedic_guidance_rules", "star_reflection_rules", "claim_risk_register"]) {
  if (!JSON.stringify(tableDictionary.table_groups).includes(table)) fail(`Table dictionary missing: ${table}`);
}

if (fieldDictionary.status !== "field_dictionary_recorded") fail("Field dictionary status mismatch.");
for (const field of ["source_id", "verification_status", "editorial_review_status", "public_use_allowed"]) {
  if (!fieldDictionary.universal_fields.includes(field)) fail(`Universal field missing: ${field}`);
}
for (const table of ["source_authorities", "panchang_daily_records", "word_corpus", "sutra_quote_corpus", "vedic_guidance_rules", "star_reflection_rules"]) {
  if (!JSON.stringify(fieldDictionary.table_field_sets).includes(table)) fail(`Field set missing: ${table}`);
}

if (relationshipBlueprint.status !== "relationship_blueprint_recorded") fail("Relationship blueprint status mismatch.");
for (const rel of ["source_texts", "panchang_daily_records", "vedic_guidance_rules", "star_reflection_rules", "guidance_context_links"]) {
  if (!JSON.stringify(relationshipBlueprint.relationships_no_sql).includes(rel)) fail(`Relationship missing: ${rel}`);
}
if (!JSON.stringify(relationshipBlueprint.rule).includes("No foreign key SQL")) fail("No foreign key SQL rule missing.");

if (indexConstraintPlan.status !== "index_constraint_plan_recorded") fail("Index/constraint status mismatch.");
for (const key of ["source_id", "regional_profile_id", "calculation_profile_id", "public_use_allowed", "claim_risk_level"]) {
  if (!indexConstraintPlan.planned_index_keys_no_sql.includes(key)) fail(`Index key missing: ${key}`);
}
if (!JSON.stringify(indexConstraintPlan.rule).includes("No SQL index")) fail("No SQL index rule missing.");

if (validationChecklist.status !== "local_schema_validation_checklist_recorded") fail("Validation checklist status mismatch.");
if (validationChecklist.next_validation_stage !== "ADB03") fail("Validation checklist next stage must be ADB03.");
for (const phrase of ["No SQL file is generated", "No database write is performed", "No seed insert is performed"]) {
  if (!JSON.stringify(validationChecklist.checklist_items).includes(phrase)) fail(`Checklist item missing: ${phrase}`);
}

if (noSqlExportPlan.status !== "no_sql_export_plan_recorded") fail("No-SQL export plan status mismatch.");
for (const blocked of ["SQL migration", "SQL schema file", "Supabase migration", "seed insert file", "service-role key"]) {
  if (!noSqlExportPlan.export_outputs_blocked.includes(blocked)) fail(`Blocked export missing: ${blocked}`);
}

if (noSqlAudit.status !== "no_sql_no_database_write_audit_passed_for_adb02") fail("No SQL/no DB audit status mismatch.");
if (noSqlAudit.audit_passed !== true) fail("No SQL/no DB audit must pass.");
if (noSqlAudit.failed_checks.length !== 0) fail("No SQL/no DB failed checks must be zero.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_adb02") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");

if (readiness.status !== "ready_for_adb03_local_schema_validation") fail("Readiness status mismatch.");
if (readiness.ready_for_adb03 !== true) fail("ADB03 readiness must be true.");
if (readiness.next_stage_id !== "ADB03") fail("Readiness must point to ADB03.");
if (!JSON.stringify(readiness.allowed_next_scope).includes("Validate table dictionary coverage")) fail("ADB03 validation scope missing.");
if (!readiness.blocked_next_scope.includes("SQL creation")) fail("SQL creation must remain blocked.");

if (boundary.next_stage_id !== "ADB03") fail("Boundary must point to ADB03.");
if (!JSON.stringify(boundary.allowed_scope).includes("Validate field dictionary coverage")) fail("ADB03 field validation scope missing.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role key exposure must remain blocked.");

for (const key of [
  "adb02_local_schema_dictionary_recorded",
  "adb01_consumed",
  "table_dictionary_recorded",
  "field_dictionary_recorded",
  "relationship_blueprint_recorded",
  "index_constraint_plan_recorded",
  "local_schema_validation_checklist_recorded",
  "no_sql_export_plan_recorded",
  "ready_for_adb03"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_adb03 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["sql_draft_approved", "sql_execution_approved", "database_write_approved", "supabase_activation_approved", "seed_insert_approved", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "seed_data_inserted", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb02"]) fail("Missing package script: generate:adb02");
if (!pkg.scripts?.["validate:adb02"]) fail("Missing package script: validate:adb02");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb02")) fail("validate:project must include validate:adb02.");

pass("ADB02 Local Schema Dictionary and Relationship Blueprint is present.");
pass("ADB01 checkpoint is consumed.");
pass("Table dictionary is valid.");
pass("Field dictionary is valid.");
pass("Relationship blueprint is valid.");
pass("Index and constraint plan is valid.");
pass("Local schema validation checklist is valid.");
pass("No-SQL export plan is valid.");
pass("No SQL / no database write audit is valid.");
pass("No-mutation audit is valid.");
pass("ADB03 Local Schema Validation readiness is valid.");
pass("No SQL, DB write, Supabase activation, seed insert, deployment or service-role exposure is recorded.");
