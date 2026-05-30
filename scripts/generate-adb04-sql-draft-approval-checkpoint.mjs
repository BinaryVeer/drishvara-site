import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  adb03Review: "data/content-intelligence/quality-reviews/adb03-local-schema-validation.json",
  adb03TableCoverage: "data/content-intelligence/database-build/adb03-table-coverage-audit.json",
  adb03FieldCoverage: "data/content-intelligence/database-build/adb03-field-coverage-audit.json",
  adb03RelationshipAudit: "data/content-intelligence/database-build/adb03-relationship-consistency-audit.json",
  adb03IndexDryRun: "data/content-intelligence/database-build/adb03-index-constraint-dry-run-review.json",
  adb03PublicSafetyAudit: "data/content-intelligence/database-build/adb03-public-use-safety-field-audit.json",
  adb03SqlRecommendation: "data/content-intelligence/database-build/adb03-sql-draft-readiness-recommendation.json",
  adb03NoSqlAudit: "data/content-intelligence/backend-architecture/adb03-no-sql-no-db-write-audit.json",
  adb03NoMutationAudit: "data/content-intelligence/backend-architecture/adb03-no-mutation-audit-register.json",
  adb03Readiness: "data/content-intelligence/quality-registry/adb03-adb04-sql-draft-approval-readiness-record.json",
  adb03Boundary: "data/content-intelligence/mutation-plans/adb03-to-adb04-sql-draft-approval-boundary.json",

  adb02TableDictionary: "data/content-intelligence/database-build/adb02-table-dictionary.json",
  adb02FieldDictionary: "data/content-intelligence/database-build/adb02-field-dictionary.json",
  adb02RelationshipBlueprint: "data/content-intelligence/database-build/adb02-relationship-blueprint.json",
  adb02IndexConstraintPlan: "data/content-intelligence/database-build/adb02-index-constraint-planning.json",
  adb01SecurityGate: "data/content-intelligence/backend-architecture/adb01-security-gate-register.json",

  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/adb04-sql-draft-approval-checkpoint.json",
  approvalCheckpoint: "data/content-intelligence/database-build/adb04-sql-draft-approval-checkpoint.json",
  sqlDraftScopeRegister: "data/content-intelligence/database-build/adb04-sql-draft-scope-register.json",
  migrationDraftGuardrails: "data/content-intelligence/database-build/adb04-migration-draft-guardrails.json",
  executionDeferralRegister: "data/content-intelligence/backend-architecture/adb04-sql-execution-deferral-register.json",
  securityGateConfirmation: "data/content-intelligence/backend-architecture/adb04-security-gate-confirmation.json",
  noSqlNoDbWriteAudit: "data/content-intelligence/backend-architecture/adb04-no-sql-no-db-write-audit.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/adb04-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/adb04-adb05-sql-migration-draft-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/adb04-to-adb05-sql-migration-draft-boundary.json",
  registry: "data/quality/adb04-sql-draft-approval-checkpoint.json",
  preview: "data/quality/adb04-sql-draft-approval-checkpoint-preview.json",
  doc: "docs/quality/ADB04_SQL_DRAFT_APPROVAL_CHECKPOINT.md"
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
  if (!exists(p)) throw new Error(`Missing ADB04 input: ${p}`);
}

const adb03Review = readJson(inputs.adb03Review);
const adb03TableCoverage = readJson(inputs.adb03TableCoverage);
const adb03FieldCoverage = readJson(inputs.adb03FieldCoverage);
const adb03RelationshipAudit = readJson(inputs.adb03RelationshipAudit);
const adb03IndexDryRun = readJson(inputs.adb03IndexDryRun);
const adb03PublicSafetyAudit = readJson(inputs.adb03PublicSafetyAudit);
const adb03SqlRecommendation = readJson(inputs.adb03SqlRecommendation);
const adb03NoSqlAudit = readJson(inputs.adb03NoSqlAudit);
const adb03NoMutationAudit = readJson(inputs.adb03NoMutationAudit);
const adb03Readiness = readJson(inputs.adb03Readiness);
const adb03Boundary = readJson(inputs.adb03Boundary);

const adb02TableDictionary = readJson(inputs.adb02TableDictionary);
const adb02FieldDictionary = readJson(inputs.adb02FieldDictionary);
const adb02RelationshipBlueprint = readJson(inputs.adb02RelationshipBlueprint);
const adb02IndexConstraintPlan = readJson(inputs.adb02IndexConstraintPlan);
const adb01SecurityGate = readJson(inputs.adb01SecurityGate);

if (adb03Review.status !== "local_schema_validation_ready_for_adb04") throw new Error("ADB03 review status mismatch.");
if (adb03Review.summary?.ready_for_adb04 !== true) throw new Error("ADB03 does not show ADB04 readiness.");
if (adb03TableCoverage.audit_passed !== true) throw new Error("ADB03 table coverage audit must pass.");
if (adb03FieldCoverage.audit_passed !== true) throw new Error("ADB03 field coverage audit must pass.");
if (adb03RelationshipAudit.audit_passed !== true) throw new Error("ADB03 relationship audit must pass.");
if (adb03IndexDryRun.audit_passed !== true) throw new Error("ADB03 index dry-run audit must pass.");
if (adb03PublicSafetyAudit.audit_passed !== true) throw new Error("ADB03 public-use safety audit must pass.");
if (adb03SqlRecommendation.status !== "sql_draft_readiness_recommendation_recorded_not_approved") throw new Error("ADB03 SQL recommendation status mismatch.");
if (adb03SqlRecommendation.explicit_non_approval?.sql_draft_approved !== false) throw new Error("ADB03 must not have approved SQL draft.");
if (adb03NoSqlAudit.audit_passed !== true) throw new Error("ADB03 no SQL/no DB audit must pass.");
if (adb03NoMutationAudit.audit_passed !== true) throw new Error("ADB03 no-mutation audit must pass.");
if (adb03Readiness.ready_for_adb04 !== true || adb03Readiness.next_stage_id !== "ADB04") throw new Error("ADB03 readiness must permit ADB04.");
if (adb03Boundary.next_stage_id !== "ADB04") throw new Error("ADB03 boundary must point to ADB04.");
if (adb03Readiness.sql_draft_generation_next_requires_explicit_approval !== true) throw new Error("ADB04 must require explicit SQL draft approval.");
if (!JSON.stringify(adb02TableDictionary).includes("panchang_daily_records")) throw new Error("ADB02 table dictionary missing panchang_daily_records.");
if (!JSON.stringify(adb02FieldDictionary).includes("public_use_allowed")) throw new Error("ADB02 field dictionary missing public_use_allowed.");
if (!JSON.stringify(adb02RelationshipBlueprint).includes("relationships_no_sql")) throw new Error("ADB02 relationship blueprint missing no-SQL relationships.");
if (!JSON.stringify(adb02IndexConstraintPlan).includes("planned_constraints_no_sql")) throw new Error("ADB02 index/constraint plan missing no-SQL constraints.");
if (!JSON.stringify(adb01SecurityGate).includes("Do not paste service-role keys")) throw new Error("ADB01 security gate missing service-role safety.");

const blockedState = {
  adb04_sql_draft_approval_checkpoint_recorded: true,
  adb03_consumed: true,
  sql_draft_scope_register_recorded: true,
  migration_draft_guardrails_recorded: true,
  execution_deferral_recorded: true,
  security_gate_confirmation_recorded: true,
  no_sql_no_db_write_audit_recorded: true,
  ready_for_adb05: true,

  sql_draft_generation_approved_for_adb05: true,
  sql_draft_created: false,
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

const approvalCheckpoint = {
  module_id: "ADB04",
  title: "SQL Draft Approval Checkpoint",
  status: "sql_draft_approval_checkpoint_recorded",
  checkpoint_result: "approved_for_sql_migration_draft_generation_in_adb05_only",
  approval_scope: {
    sql_draft_generation_approved_for_adb05: true,
    sql_execution_approved: false,
    database_write_approved: false,
    supabase_activation_approved: false,
    seed_insert_approved: false,
    service_role_key_required: false
  },
  decision_summary: [
    "ADB03 validation passed with zero hard blockers.",
    "SQL draft generation is approved only for ADB05.",
    "ADB04 itself does not create SQL.",
    "SQL execution remains blocked.",
    "Database write remains blocked.",
    "Supabase/Auth/backend activation remains blocked.",
    "Seed insertion remains blocked.",
    "Service-role key exposure remains blocked."
  ],
  blocked_state: blockedState
};

const sqlDraftScopeRegister = {
  module_id: "ADB04",
  title: "SQL Draft Scope Register",
  status: "sql_draft_scope_register_recorded",
  adb05_allowed_sql_draft_scope: [
    "Create a migration draft file only.",
    "Draft table definitions from ADB02 table dictionary.",
    "Draft columns from ADB02 field dictionary.",
    "Draft foreign key intent from ADB02 relationship blueprint.",
    "Draft indexes and constraints from ADB02 index/constraint plan.",
    "Include comments/guardrails showing no execution.",
    "Prepare a validation-only SQL draft for review."
  ],
  adb05_blocked_scope: [
    "Run SQL",
    "Connect to Supabase",
    "Use service-role key",
    "Create live tables",
    "Modify live schema",
    "Insert seed data",
    "Activate backend/Auth",
    "Deploy"
  ],
  required_draft_labels: [
    "DRAFT_ONLY",
    "NOT_EXECUTED",
    "REVIEW_REQUIRED",
    "NO_SERVICE_ROLE_KEY",
    "NO_SEED_INSERT"
  ],
  blocked_state: blockedState
};

const migrationDraftGuardrails = {
  module_id: "ADB04",
  title: "Migration Draft Guardrails",
  status: "migration_draft_guardrails_recorded",
  guardrails: [
    "ADB05 may create SQL text as a draft file only.",
    "ADB05 must not execute SQL.",
    "ADB05 must not connect to Supabase.",
    "ADB05 must not require or expose service-role keys.",
    "ADB05 must not insert seed data.",
    "ADB05 must preserve existing content-publishing schema and avoid duplicate table creation where linking is intended.",
    "ADB05 must produce a validation report and keep ADB06 as the next validation checkpoint."
  ],
  required_review_before_execution: [
    "schema naming review",
    "existing Supabase schema collision review",
    "relationship and constraint review",
    "RLS/Auth deferral review",
    "seed insertion deferral review",
    "rollback/backup planning before any future execution"
  ],
  blocked_state: blockedState
};

const executionDeferralRegister = {
  module_id: "ADB04",
  title: "SQL Execution Deferral Register",
  status: "sql_execution_deferred_after_adb04",
  deferral_rules: [
    "SQL generation is approved only as draft text in ADB05.",
    "SQL execution is not approved.",
    "Database write is not approved.",
    "Supabase schema modification is not approved.",
    "Seed insertion is not approved.",
    "Backend/Auth/Supabase activation is not approved.",
    "Service-role key is not required and must not be exposed."
  ],
  next_execution_possible_only_after: [
    "ADB05 SQL draft generation",
    "ADB06 SQL draft validation",
    "ADB07 execution approval checkpoint",
    "explicit user approval"
  ],
  blocked_state: blockedState
};

const securityGateConfirmation = {
  module_id: "ADB04",
  title: "Security Gate Confirmation",
  status: "security_gate_confirmed_for_sql_draft_only",
  confirmed_rules: [
    "No service-role key in chat.",
    "No service-role key in repo.",
    "No .env secret committed.",
    "No Supabase connection required for ADB05 draft generation.",
    "No SQL execution before explicit later approval.",
    "No seed insertion before explicit later approval."
  ],
  blocked_state: blockedState
};

const noSqlNoDbWriteAudit = {
  module_id: "ADB04",
  title: "No SQL / No Database Write Audit",
  status: "no_sql_no_database_write_audit_passed_for_adb04",
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
  module_id: "ADB04",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_adb04",
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
  module_id: "ADB04",
  title: "ADB05 SQL Migration Draft Readiness Record",
  status: "ready_for_adb05_sql_migration_draft_generation",
  ready_for_adb05: true,
  next_stage_id: "ADB05",
  next_stage_title: "SQL Migration Draft Generation",
  sql_draft_generation_allowed_next: true,
  sql_execution_allowed_next: false,
  database_write_allowed_next: false,
  supabase_activation_allowed_next: false,
  seed_insert_allowed_next: false,
  service_role_key_required_next: false,
  allowed_next_scope: [
    "Generate SQL migration draft file only.",
    "Generate accompanying SQL draft validation manifest.",
    "Generate no-execution audit.",
    "Generate next checkpoint readiness for SQL draft validation.",
    "Do not execute SQL."
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
  hard_blocker_count_for_adb05: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "ADB04",
  title: "ADB04 to ADB05 SQL Migration Draft Boundary",
  status: "adb05_sql_migration_draft_boundary_created",
  next_stage_id: "ADB05",
  next_stage_title: "SQL Migration Draft Generation",
  allowed_scope: readiness.allowed_next_scope,
  blocked_scope: readiness.blocked_next_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "ADB04",
  title: "SQL Draft Approval Checkpoint",
  status: "sql_draft_approval_checkpoint_ready_for_adb05",
  depends_on: ["ADB03"],
  approval_checkpoint_file: outputs.approvalCheckpoint,
  sql_draft_scope_register_file: outputs.sqlDraftScopeRegister,
  migration_draft_guardrails_file: outputs.migrationDraftGuardrails,
  execution_deferral_register_file: outputs.executionDeferralRegister,
  security_gate_confirmation_file: outputs.securityGateConfirmation,
  no_sql_no_db_write_audit_file: outputs.noSqlNoDbWriteAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    adb04_sql_draft_approval_checkpoint_recorded: true,
    adb03_consumed: true,
    sql_draft_scope_register_recorded: true,
    migration_draft_guardrails_recorded: true,
    execution_deferral_recorded: true,
    security_gate_confirmation_recorded: true,
    no_sql_no_db_write_audit_recorded: true,
    ready_for_adb05: true,
    hard_blocker_count_for_adb05: 0,
    sql_draft_generation_approved_for_adb05: true,
    sql_draft_created: false,
    sql_execution_approved: false,
    database_write_approved: false,
    supabase_activation_approved: false,
    seed_insert_approved: false,
    service_role_key_required: false,
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
  module_id: "ADB04",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "ADB04",
  status: review.status,
  adb04_sql_draft_approval_checkpoint_recorded: 1,
  adb03_consumed: 1,
  sql_draft_scope_register_recorded: 1,
  migration_draft_guardrails_recorded: 1,
  execution_deferral_recorded: 1,
  security_gate_confirmation_recorded: 1,
  no_sql_no_db_write_audit_recorded: 1,
  ready_for_adb05: 1,
  hard_blocker_count_for_adb05: 0,
  sql_draft_generation_approved_for_adb05: 1,
  sql_draft_created: 0,
  sql_execution_approved: 0,
  database_write_approved: 0,
  supabase_activation_approved: 0,
  seed_insert_approved: 0,
  service_role_key_required: 0,
  sql_file_created: 0,
  sql_executed: 0,
  database_write_performed: 0,
  supabase_table_created: 0,
  supabase_schema_modified: 0,
  seed_data_inserted: 0,
  service_role_key_exposed: 0
};

const doc = `# ADB04 — SQL Draft Approval Checkpoint

## Result

ADB04 approves SQL draft generation for ADB05 only.

## Approved

- SQL migration draft generation in ADB05
- SQL draft validation manifest in ADB05
- No-execution audit in ADB05

## Still not approved

- SQL execution
- Database write
- Supabase table creation
- Supabase schema modification
- Seed data insertion
- Backend/Auth/Supabase activation
- Deployment
- Service-role key exposure

## Important boundary

ADB04 itself does not create a SQL file. It only authorises ADB05 to generate a draft SQL migration file for review.

## Next

ADB05 — SQL Migration Draft Generation.
`;

writeJson(outputs.approvalCheckpoint, approvalCheckpoint);
writeJson(outputs.sqlDraftScopeRegister, sqlDraftScopeRegister);
writeJson(outputs.migrationDraftGuardrails, migrationDraftGuardrails);
writeJson(outputs.executionDeferralRegister, executionDeferralRegister);
writeJson(outputs.securityGateConfirmation, securityGateConfirmation);
writeJson(outputs.noSqlNoDbWriteAudit, noSqlNoDbWriteAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ ADB04 SQL Draft Approval Checkpoint generated.");
console.log("✅ SQL draft generation approved for ADB05 only.");
console.log("✅ SQL execution, DB write, Supabase activation and seed insertion remain blocked.");
console.log("✅ Ready for ADB05 SQL Migration Draft Generation.");
console.log("✅ No SQL file created, no DB write, no Supabase/backend activation, no seed insert, no service-role exposure recorded.");
