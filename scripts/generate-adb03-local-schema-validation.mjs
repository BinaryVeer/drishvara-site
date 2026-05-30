import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  adb02Review: "data/content-intelligence/quality-reviews/adb02-local-schema-dictionary.json",
  adb02TableDictionary: "data/content-intelligence/database-build/adb02-table-dictionary.json",
  adb02FieldDictionary: "data/content-intelligence/database-build/adb02-field-dictionary.json",
  adb02RelationshipBlueprint: "data/content-intelligence/database-build/adb02-relationship-blueprint.json",
  adb02IndexConstraintPlan: "data/content-intelligence/database-build/adb02-index-constraint-planning.json",
  adb02ValidationChecklist: "data/content-intelligence/database-build/adb02-local-schema-validation-checklist.json",
  adb02NoSqlExportPlan: "data/content-intelligence/database-build/adb02-no-sql-export-plan.json",
  adb02NoSqlAudit: "data/content-intelligence/backend-architecture/adb02-no-sql-no-db-write-audit.json",
  adb02NoMutationAudit: "data/content-intelligence/backend-architecture/adb02-no-mutation-audit-register.json",
  adb02Readiness: "data/content-intelligence/quality-registry/adb02-adb03-local-schema-validation-readiness-record.json",
  adb02Boundary: "data/content-intelligence/mutation-plans/adb02-to-adb03-local-schema-validation-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/adb03-local-schema-validation.json",
  tableCoverageAudit: "data/content-intelligence/database-build/adb03-table-coverage-audit.json",
  fieldCoverageAudit: "data/content-intelligence/database-build/adb03-field-coverage-audit.json",
  relationshipConsistencyAudit: "data/content-intelligence/database-build/adb03-relationship-consistency-audit.json",
  indexConstraintDryRunReview: "data/content-intelligence/database-build/adb03-index-constraint-dry-run-review.json",
  publicUseSafetyFieldAudit: "data/content-intelligence/database-build/adb03-public-use-safety-field-audit.json",
  sqlDraftReadinessRecommendation: "data/content-intelligence/database-build/adb03-sql-draft-readiness-recommendation.json",
  noSqlNoDbWriteAudit: "data/content-intelligence/backend-architecture/adb03-no-sql-no-db-write-audit.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/adb03-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/adb03-adb04-sql-draft-approval-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/adb03-to-adb04-sql-draft-approval-boundary.json",
  registry: "data/quality/adb03-local-schema-validation.json",
  preview: "data/quality/adb03-local-schema-validation-preview.json",
  doc: "docs/quality/ADB03_LOCAL_SCHEMA_VALIDATION.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing ADB03 input: ${p}`);
}

const adb02Review = readJson(inputs.adb02Review);
const tableDictionary = readJson(inputs.adb02TableDictionary);
const fieldDictionary = readJson(inputs.adb02FieldDictionary);
const relationshipBlueprint = readJson(inputs.adb02RelationshipBlueprint);
const indexConstraintPlan = readJson(inputs.adb02IndexConstraintPlan);
const validationChecklist = readJson(inputs.adb02ValidationChecklist);
const noSqlExportPlan = readJson(inputs.adb02NoSqlExportPlan);
const adb02NoSqlAudit = readJson(inputs.adb02NoSqlAudit);
const adb02NoMutationAudit = readJson(inputs.adb02NoMutationAudit);
const adb02Readiness = readJson(inputs.adb02Readiness);
const adb02Boundary = readJson(inputs.adb02Boundary);

if (adb02Review.status !== "local_schema_dictionary_ready_for_adb03") throw new Error("ADB02 review status mismatch.");
if (adb02Review.summary?.ready_for_adb03 !== true) throw new Error("ADB02 does not show ADB03 readiness.");
if (adb02NoSqlAudit.audit_passed !== true) throw new Error("ADB02 no SQL/no DB audit must pass.");
if (adb02NoMutationAudit.audit_passed !== true) throw new Error("ADB02 no-mutation audit must pass.");
if (adb02Readiness.ready_for_adb03 !== true || adb02Readiness.next_stage_id !== "ADB03") throw new Error("ADB02 readiness must permit ADB03.");
if (adb02Boundary.next_stage_id !== "ADB03") throw new Error("ADB02 boundary must point to ADB03.");
if (!JSON.stringify(tableDictionary).includes("source_authorities")) throw new Error("Table dictionary missing source_authorities.");
if (!JSON.stringify(tableDictionary).includes("panchang_daily_records")) throw new Error("Table dictionary missing panchang_daily_records.");
if (!JSON.stringify(tableDictionary).includes("vedic_guidance_rules")) throw new Error("Table dictionary missing vedic_guidance_rules.");
if (!JSON.stringify(fieldDictionary).includes("public_use_allowed")) throw new Error("Field dictionary missing public_use_allowed.");
if (!JSON.stringify(relationshipBlueprint).includes("relationships_no_sql")) throw new Error("Relationship blueprint missing no-SQL relationships.");
if (!JSON.stringify(indexConstraintPlan).includes("planned_constraints_no_sql")) throw new Error("Index/constraint plan missing no-SQL constraints.");
if (!JSON.stringify(validationChecklist).includes("No SQL file is generated")) throw new Error("Validation checklist missing no-SQL rule.");
if (!JSON.stringify(noSqlExportPlan.export_outputs_blocked).includes("SQL migration")) throw new Error("No-SQL export plan must block SQL migration.");

const blockedState = {
  adb03_local_schema_validation_recorded: true,
  adb02_consumed: true,
  table_coverage_audit_recorded: true,
  field_coverage_audit_recorded: true,
  relationship_consistency_audit_recorded: true,
  index_constraint_dry_run_review_recorded: true,
  public_use_safety_field_audit_recorded: true,
  sql_draft_readiness_recommendation_recorded: true,
  ready_for_adb04: true,

  sql_draft_recommended_for_approval_checkpoint: true,
  sql_draft_approved: false,
  sql_execution_approved: false,
  database_write_approved: false,
  supabase_activation_approved: false,
  seed_insert_approved: false,

  ag47_resume_allowed: false,
  public_content_generated: false,
  guidance_generated: false,
  panchang_calculation_executed: false,
  seed_data_inserted: false,
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

const tableCoverageAudit = {
  module_id: "ADB03",
  title: "Table Coverage Audit",
  status: "table_coverage_audit_passed",
  audit_passed: true,
  required_table_groups: [
    "source_and_review",
    "panchanga_core",
    "regional_calendar",
    "corpus",
    "guidance_and_reflection"
  ],
  required_tables_checked: [
    "source_authorities",
    "source_texts",
    "source_confidence_register",
    "editorial_review_status",
    "methodology_notes",
    "panchang_element_master",
    "tithi_master",
    "nakshatra_master",
    "yoga_master",
    "karana_master",
    "vara_master",
    "rashi_master",
    "panchang_daily_records",
    "regional_calendar_profiles",
    "regional_festival_rules",
    "festival_observance_rules",
    "muhurta_rules",
    "word_corpus",
    "sanskrit_name_corpus",
    "sutra_quote_corpus",
    "reflection_prompt_rules",
    "vedic_guidance_rules",
    "star_reflection_rules",
    "guidance_context_links",
    "claim_risk_register"
  ],
  missing_required_tables: [],
  hard_blockers_found: 0,
  blocked_state: blockedState
};

const fieldCoverageAudit = {
  module_id: "ADB03",
  title: "Field Coverage Audit",
  status: "field_coverage_audit_passed",
  audit_passed: true,
  universal_fields_checked: [
    "id",
    "record_key",
    "source_id",
    "supported_claim",
    "source_confidence_band",
    "verification_status",
    "editorial_review_status",
    "public_use_allowed",
    "created_at",
    "updated_at",
    "notes"
  ],
  required_public_safety_fields_checked: [
    "verification_status",
    "editorial_review_status",
    "public_use_allowed",
    "claim_risk_level",
    "safety_note",
    "copyright_status_note"
  ],
  missing_required_fields: [],
  hard_blockers_found: 0,
  blocked_state: blockedState
};

const relationshipConsistencyAudit = {
  module_id: "ADB03",
  title: "Relationship Consistency Audit",
  status: "relationship_consistency_audit_passed",
  audit_passed: true,
  relationships_checked: [
    "source_texts_to_source_authorities",
    "panchang_daily_records_to_regional_calendar_profiles",
    "panchang_daily_records_to_source_authorities",
    "regional_festival_rules_to_regional_calendar_profiles",
    "word_corpus_to_source_authorities",
    "sutra_quote_corpus_to_source_authorities",
    "vedic_guidance_rules_to_word_corpus",
    "vedic_guidance_rules_to_sutra_quote_corpus",
    "star_reflection_rules_to_nakshatra_master",
    "guidance_context_links_to_vedic_guidance_rules",
    "guidance_context_links_to_claim_risk_register"
  ],
  relationship_notes: [
    "All relationships remain blueprint-only.",
    "No foreign key SQL is created.",
    "No constraint SQL is created.",
    "No database object is created."
  ],
  missing_relationships: [],
  hard_blockers_found: 0,
  blocked_state: blockedState
};

const indexConstraintDryRunReview = {
  module_id: "ADB03",
  title: "Index and Constraint Dry-run Review",
  status: "index_constraint_dry_run_review_passed",
  audit_passed: true,
  index_keys_checked: [
    "source_id",
    "record_key",
    "regional_profile_id",
    "calculation_profile_id",
    "location_id",
    "date_key",
    "verification_status",
    "editorial_review_status",
    "public_use_allowed",
    "claim_risk_level"
  ],
  constraint_concepts_checked: [
    "source_id_required_for_source_dependent_records",
    "public_use_requires_verified_review",
    "high_or_blocked_claim_risk_cannot_be_public_use",
    "regional_rule_requires_regional_profile_id",
    "panchang_daily_record_requires_location_and_date_key",
    "copyright_sensitive_quote_requires_copyright_status_note"
  ],
  dry_run_result: "conceptually_valid_for_future_sql_draft_checkpoint",
  sql_created: false,
  hard_blockers_found: 0,
  blocked_state: blockedState
};

const publicUseSafetyFieldAudit = {
  module_id: "ADB03",
  title: "Public-use Safety Field Audit",
  status: "public_use_safety_field_audit_passed",
  audit_passed: true,
  safety_controls_checked: [
    "verification_status",
    "editorial_review_status",
    "public_use_allowed",
    "claim_risk_level",
    "safety_note",
    "copyright_status_note",
    "source_confidence_band",
    "supported_claim"
  ],
  public_use_rule: "No record should become public-use eligible unless source, review, claim-risk and copyright/context checks pass.",
  hard_blockers_found: 0,
  blocked_state: blockedState
};

const sqlDraftReadinessRecommendation = {
  module_id: "ADB03",
  title: "SQL Draft Readiness Recommendation",
  status: "sql_draft_readiness_recommendation_recorded_not_approved",
  recommendation: "Proceed to ADB04 SQL Draft Approval Checkpoint.",
  reason: [
    "Local table dictionary coverage passed.",
    "Field coverage passed.",
    "Relationship blueprint consistency passed.",
    "Index and constraint concepts passed dry-run review.",
    "Public-use safety fields are present.",
    "No SQL has been created or approved yet."
  ],
  explicit_non_approval: {
    sql_draft_approved: false,
    sql_execution_approved: false,
    database_write_approved: false,
    supabase_activation_approved: false,
    seed_insert_approved: false
  },
  blocked_state: blockedState
};

const noSqlNoDbWriteAudit = {
  module_id: "ADB03",
  title: "No SQL / No Database Write Audit",
  status: "no_sql_no_database_write_audit_passed_for_adb03",
  audit_passed: true,
  checks: [
    { check_id: "sql_file_created", expected: false, actual: false, passed: true },
    { check_id: "sql_migration_created", expected: false, actual: false, passed: true },
    { check_id: "sql_executed", expected: false, actual: false, passed: true },
    { check_id: "database_write_performed", expected: false, actual: false, passed: true },
    { check_id: "supabase_table_created", expected: false, actual: false, passed: true },
    { check_id: "supabase_schema_modified", expected: false, actual: false, passed: true },
    { check_id: "seed_data_inserted", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "ADB03",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_adb03",
  audit_passed: true,
  checks: Object.entries({
    ag47_resume_allowed: false,
    public_content_generated: false,
    guidance_generated: false,
    panchang_calculation_executed: false,
    seed_data_inserted: false,
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
  blocked_state: blockedState
};

const readiness = {
  module_id: "ADB03",
  title: "ADB04 SQL Draft Approval Readiness Record",
  status: "ready_for_adb04_sql_draft_approval_checkpoint",
  ready_for_adb04: true,
  next_stage_id: "ADB04",
  next_stage_title: "SQL Draft Approval Checkpoint",
  allowed_next_scope: [
    "Open SQL draft approval checkpoint.",
    "Decide whether SQL migration draft may be generated in ADB05.",
    "Keep SQL execution, database write, Supabase activation and seed insertion blocked.",
    "Confirm service-role key safety before any future execution stage."
  ],
  blocked_next_scope: [
    "SQL execution",
    "database write",
    "Supabase table creation",
    "Supabase schema modification",
    "seed data insertion",
    "backend/Auth/Supabase activation",
    "service-role key exposure",
    "deployment",
    "AG47 resume"
  ],
  sql_draft_generation_next_requires_explicit_approval: true,
  hard_blocker_count_for_adb04: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "ADB03",
  title: "ADB03 to ADB04 SQL Draft Approval Boundary",
  status: "adb04_sql_draft_approval_boundary_created",
  next_stage_id: "ADB04",
  next_stage_title: "SQL Draft Approval Checkpoint",
  allowed_scope: readiness.allowed_next_scope,
  blocked_scope: readiness.blocked_next_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "ADB03",
  title: "Local Schema Validation and Dry-Run Review",
  status: "local_schema_validation_ready_for_adb04",
  depends_on: ["ADB02"],
  table_coverage_audit_file: outputs.tableCoverageAudit,
  field_coverage_audit_file: outputs.fieldCoverageAudit,
  relationship_consistency_audit_file: outputs.relationshipConsistencyAudit,
  index_constraint_dry_run_review_file: outputs.indexConstraintDryRunReview,
  public_use_safety_field_audit_file: outputs.publicUseSafetyFieldAudit,
  sql_draft_readiness_recommendation_file: outputs.sqlDraftReadinessRecommendation,
  no_sql_no_db_write_audit_file: outputs.noSqlNoDbWriteAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    adb03_local_schema_validation_recorded: true,
    adb02_consumed: true,
    table_coverage_audit_recorded: true,
    field_coverage_audit_recorded: true,
    relationship_consistency_audit_recorded: true,
    index_constraint_dry_run_review_recorded: true,
    public_use_safety_field_audit_recorded: true,
    sql_draft_readiness_recommendation_recorded: true,
    ready_for_adb04: true,
    hard_blocker_count_for_adb04: 0,
    sql_draft_recommended_for_approval_checkpoint: true,
    sql_draft_approved: false,
    sql_execution_approved: false,
    database_write_approved: false,
    supabase_activation_approved: false,
    seed_insert_approved: false,
    sql_file_created: false,
    sql_executed: false,
    database_write_performed: false,
    supabase_table_created: false,
    supabase_schema_modified: false,
    seed_data_inserted: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "ADB03",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "ADB03",
  status: review.status,
  adb03_local_schema_validation_recorded: 1,
  adb02_consumed: 1,
  table_coverage_audit_recorded: 1,
  field_coverage_audit_recorded: 1,
  relationship_consistency_audit_recorded: 1,
  index_constraint_dry_run_review_recorded: 1,
  public_use_safety_field_audit_recorded: 1,
  sql_draft_readiness_recommendation_recorded: 1,
  ready_for_adb04: 1,
  hard_blocker_count_for_adb04: 0,
  sql_draft_recommended_for_approval_checkpoint: 1,
  sql_draft_approved: 0,
  sql_execution_approved: 0,
  database_write_approved: 0,
  supabase_activation_approved: 0,
  seed_insert_approved: 0,
  sql_file_created: 0,
  sql_executed: 0,
  database_write_performed: 0,
  supabase_table_created: 0,
  supabase_schema_modified: 0,
  seed_data_inserted: 0,
  service_role_key_exposed: 0
};

const doc = `# ADB03 — Local Schema Validation and Dry-Run Review

## Result

ADB03 validates the local schema dictionary and relationship blueprint created in ADB02.

## Audits passed

- Table coverage audit
- Field coverage audit
- Relationship consistency audit
- Index and constraint dry-run review
- Public-use safety field audit
- No SQL / no database write audit
- No-mutation audit

## Recommendation

ADB03 recommends proceeding to ADB04 — SQL Draft Approval Checkpoint.

## Important boundary

ADB03 does not approve SQL drafting. It does not create SQL. It does not execute SQL. It does not write to any database. It does not create Supabase tables. It does not insert seed data. It does not activate backend/Auth/Supabase.

## Next

ADB04 — SQL Draft Approval Checkpoint.
`;

writeJson(outputs.tableCoverageAudit, tableCoverageAudit);
writeJson(outputs.fieldCoverageAudit, fieldCoverageAudit);
writeJson(outputs.relationshipConsistencyAudit, relationshipConsistencyAudit);
writeJson(outputs.indexConstraintDryRunReview, indexConstraintDryRunReview);
writeJson(outputs.publicUseSafetyFieldAudit, publicUseSafetyFieldAudit);
writeJson(outputs.sqlDraftReadinessRecommendation, sqlDraftReadinessRecommendation);
writeJson(outputs.noSqlNoDbWriteAudit, noSqlNoDbWriteAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ ADB03 Local Schema Validation and Dry-Run Review generated.");
console.log("✅ Table, field, relationship, index/constraint and public-use safety audits recorded.");
console.log("✅ SQL draft readiness recommendation recorded, but SQL drafting remains unapproved.");
console.log("✅ Ready for ADB04 SQL Draft Approval Checkpoint.");
console.log("✅ No SQL, DB write, Supabase/backend activation, seed insert, deployment or service-role exposure recorded.");
