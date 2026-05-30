import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ ADB03 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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

  "data/content-intelligence/quality-reviews/adb03-local-schema-validation.json",
  "data/content-intelligence/database-build/adb03-table-coverage-audit.json",
  "data/content-intelligence/database-build/adb03-field-coverage-audit.json",
  "data/content-intelligence/database-build/adb03-relationship-consistency-audit.json",
  "data/content-intelligence/database-build/adb03-index-constraint-dry-run-review.json",
  "data/content-intelligence/database-build/adb03-public-use-safety-field-audit.json",
  "data/content-intelligence/database-build/adb03-sql-draft-readiness-recommendation.json",
  "data/content-intelligence/backend-architecture/adb03-no-sql-no-db-write-audit.json",
  "data/content-intelligence/backend-architecture/adb03-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb03-adb04-sql-draft-approval-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb03-to-adb04-sql-draft-approval-boundary.json",
  "data/quality/adb03-local-schema-validation.json",
  "data/quality/adb03-local-schema-validation-preview.json",
  "docs/quality/ADB03_LOCAL_SCHEMA_VALIDATION.md",
  "scripts/generate-adb03-local-schema-validation.mjs",
  "scripts/validate-adb03-local-schema-validation.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb02Review = readJson("data/content-intelligence/quality-reviews/adb02-local-schema-dictionary.json");
const adb02NoSqlAudit = readJson("data/content-intelligence/backend-architecture/adb02-no-sql-no-db-write-audit.json");
const adb02NoMutationAudit = readJson("data/content-intelligence/backend-architecture/adb02-no-mutation-audit-register.json");
const adb02Readiness = readJson("data/content-intelligence/quality-registry/adb02-adb03-local-schema-validation-readiness-record.json");
const adb02Boundary = readJson("data/content-intelligence/mutation-plans/adb02-to-adb03-local-schema-validation-boundary.json");

if (adb02Review.status !== "local_schema_dictionary_ready_for_adb03") fail("ADB02 review status mismatch.");
if (adb02Review.summary.ready_for_adb03 !== true) fail("ADB02 readiness summary missing.");
if (adb02NoSqlAudit.audit_passed !== true) fail("ADB02 no SQL/no DB audit must pass.");
if (adb02NoMutationAudit.audit_passed !== true) fail("ADB02 no-mutation audit must pass.");
if (adb02Readiness.ready_for_adb03 !== true) fail("ADB02 readiness must permit ADB03.");
if (adb02Boundary.next_stage_id !== "ADB03") fail("ADB02 boundary must point to ADB03.");

const review = readJson("data/content-intelligence/quality-reviews/adb03-local-schema-validation.json");
const tableCoverageAudit = readJson("data/content-intelligence/database-build/adb03-table-coverage-audit.json");
const fieldCoverageAudit = readJson("data/content-intelligence/database-build/adb03-field-coverage-audit.json");
const relationshipConsistencyAudit = readJson("data/content-intelligence/database-build/adb03-relationship-consistency-audit.json");
const indexConstraintDryRunReview = readJson("data/content-intelligence/database-build/adb03-index-constraint-dry-run-review.json");
const publicUseSafetyFieldAudit = readJson("data/content-intelligence/database-build/adb03-public-use-safety-field-audit.json");
const sqlDraftReadinessRecommendation = readJson("data/content-intelligence/database-build/adb03-sql-draft-readiness-recommendation.json");
const noSqlAudit = readJson("data/content-intelligence/backend-architecture/adb03-no-sql-no-db-write-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/adb03-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb03-adb04-sql-draft-approval-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb03-to-adb04-sql-draft-approval-boundary.json");
const preview = readJson("data/quality/adb03-local-schema-validation-preview.json");
const pkg = readJson("package.json");

if (review.status !== "local_schema_validation_ready_for_adb04") fail("ADB03 review status mismatch.");
for (const key of [
  "adb03_local_schema_validation_recorded",
  "adb02_consumed",
  "table_coverage_audit_recorded",
  "field_coverage_audit_recorded",
  "relationship_consistency_audit_recorded",
  "index_constraint_dry_run_review_recorded",
  "public_use_safety_field_audit_recorded",
  "sql_draft_readiness_recommendation_recorded",
  "ready_for_adb04",
  "sql_draft_recommended_for_approval_checkpoint"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_adb04 !== 0) fail("ADB04 blocker count must be zero.");
for (const key of ["sql_draft_approved", "sql_execution_approved", "database_write_approved", "supabase_activation_approved", "seed_insert_approved", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "seed_data_inserted", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (tableCoverageAudit.status !== "table_coverage_audit_passed") fail("Table coverage status mismatch.");
if (tableCoverageAudit.audit_passed !== true) fail("Table coverage audit must pass.");
if (tableCoverageAudit.missing_required_tables.length !== 0) fail("Missing required tables must be zero.");
if (tableCoverageAudit.hard_blockers_found !== 0) fail("Table hard blockers must be zero.");
for (const table of ["source_authorities", "panchang_daily_records", "word_corpus", "vedic_guidance_rules", "claim_risk_register"]) {
  if (!tableCoverageAudit.required_tables_checked.includes(table)) fail(`Required table not checked: ${table}`);
}

if (fieldCoverageAudit.status !== "field_coverage_audit_passed") fail("Field coverage status mismatch.");
if (fieldCoverageAudit.audit_passed !== true) fail("Field coverage audit must pass.");
if (fieldCoverageAudit.missing_required_fields.length !== 0) fail("Missing required fields must be zero.");
for (const field of ["verification_status", "editorial_review_status", "public_use_allowed", "claim_risk_level", "safety_note"]) {
  if (!fieldCoverageAudit.required_public_safety_fields_checked.includes(field)) fail(`Safety field missing: ${field}`);
}

if (relationshipConsistencyAudit.status !== "relationship_consistency_audit_passed") fail("Relationship consistency status mismatch.");
if (relationshipConsistencyAudit.audit_passed !== true) fail("Relationship audit must pass.");
if (relationshipConsistencyAudit.missing_relationships.length !== 0) fail("Missing relationships must be zero.");
if (!JSON.stringify(relationshipConsistencyAudit.relationship_notes).includes("No foreign key SQL is created")) fail("No foreign key SQL note missing.");

if (indexConstraintDryRunReview.status !== "index_constraint_dry_run_review_passed") fail("Index/constraint dry-run status mismatch.");
if (indexConstraintDryRunReview.audit_passed !== true) fail("Index dry-run audit must pass.");
if (indexConstraintDryRunReview.sql_created !== false) fail("SQL created must be false.");
if (indexConstraintDryRunReview.dry_run_result !== "conceptually_valid_for_future_sql_draft_checkpoint") fail("Dry-run result mismatch.");

if (publicUseSafetyFieldAudit.status !== "public_use_safety_field_audit_passed") fail("Public-use safety field audit status mismatch.");
if (publicUseSafetyFieldAudit.audit_passed !== true) fail("Public-use safety audit must pass.");
for (const field of ["verification_status", "editorial_review_status", "public_use_allowed", "claim_risk_level", "copyright_status_note", "supported_claim"]) {
  if (!publicUseSafetyFieldAudit.safety_controls_checked.includes(field)) fail(`Public safety control missing: ${field}`);
}

if (sqlDraftReadinessRecommendation.status !== "sql_draft_readiness_recommendation_recorded_not_approved") fail("SQL draft recommendation status mismatch.");
if (sqlDraftReadinessRecommendation.recommendation !== "Proceed to ADB04 SQL Draft Approval Checkpoint.") fail("SQL draft recommendation mismatch.");
if (sqlDraftReadinessRecommendation.explicit_non_approval.sql_draft_approved !== false) fail("SQL draft must not be approved.");
if (sqlDraftReadinessRecommendation.explicit_non_approval.sql_execution_approved !== false) fail("SQL execution must not be approved.");

if (noSqlAudit.status !== "no_sql_no_database_write_audit_passed_for_adb03") fail("No SQL/no DB audit status mismatch.");
if (noSqlAudit.audit_passed !== true) fail("No SQL/no DB audit must pass.");
if (noSqlAudit.failed_checks.length !== 0) fail("No SQL/no DB failed checks must be zero.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_adb03") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");

if (readiness.status !== "ready_for_adb04_sql_draft_approval_checkpoint") fail("Readiness status mismatch.");
if (readiness.ready_for_adb04 !== true) fail("ADB04 readiness must be true.");
if (readiness.next_stage_id !== "ADB04") fail("Readiness must point to ADB04.");
if (readiness.sql_draft_generation_next_requires_explicit_approval !== true) fail("ADB04 must require explicit SQL draft approval.");
if (!readiness.blocked_next_scope.includes("SQL execution")) fail("SQL execution must remain blocked.");

if (boundary.next_stage_id !== "ADB04") fail("Boundary must point to ADB04.");
if (!JSON.stringify(boundary.allowed_scope).includes("Open SQL draft approval checkpoint")) fail("ADB04 approval checkpoint scope missing.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role key exposure must remain blocked.");

for (const key of [
  "adb03_local_schema_validation_recorded",
  "adb02_consumed",
  "table_coverage_audit_recorded",
  "field_coverage_audit_recorded",
  "relationship_consistency_audit_recorded",
  "index_constraint_dry_run_review_recorded",
  "public_use_safety_field_audit_recorded",
  "sql_draft_readiness_recommendation_recorded",
  "ready_for_adb04",
  "sql_draft_recommended_for_approval_checkpoint"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_adb04 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["sql_draft_approved", "sql_execution_approved", "database_write_approved", "supabase_activation_approved", "seed_insert_approved", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "seed_data_inserted", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb03"]) fail("Missing package script: generate:adb03");
if (!pkg.scripts?.["validate:adb03"]) fail("Missing package script: validate:adb03");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb03")) fail("validate:project must include validate:adb03.");

pass("ADB03 Local Schema Validation and Dry-Run Review is present.");
pass("ADB02 schema dictionary is consumed.");
pass("Table coverage audit passed.");
pass("Field coverage audit passed.");
pass("Relationship consistency audit passed.");
pass("Index and constraint dry-run review passed.");
pass("Public-use safety field audit passed.");
pass("SQL draft readiness recommendation is recorded but not approved.");
pass("No SQL / no database write audit is valid.");
pass("No-mutation audit is valid.");
pass("ADB04 SQL Draft Approval Checkpoint readiness is valid.");
pass("No SQL, DB write, Supabase activation, seed insert, deployment or service-role exposure is recorded.");
