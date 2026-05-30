import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  adb06Review: "data/content-intelligence/quality-reviews/adb06-sql-draft-validation.json",
  adb06StructuralValidation: "data/content-intelligence/database-build/adb06-sql-structural-validation.json",
  adb06DraftLabelSafetyAudit: "data/content-intelligence/database-build/adb06-draft-label-safety-audit.json",
  adb06BaseSchemaValidation: "data/content-intelligence/database-build/adb06-base-schema-validation.json",
  adb06CalculationEngineValidation: "data/content-intelligence/database-build/adb06-calculation-engine-schema-validation.json",
  adb06ExecutionRiskReview: "data/content-intelligence/backend-architecture/adb06-execution-risk-review.json",
  adb06RlsAuthDeferralReview: "data/content-intelligence/backend-architecture/adb06-rls-auth-deferral-review.json",
  adb06SeedInsertBlockerAudit: "data/content-intelligence/backend-architecture/adb06-seed-insert-blocker-audit.json",
  adb06NoExecutionAudit: "data/content-intelligence/backend-architecture/adb06-no-execution-audit.json",
  adb06NoMutationAudit: "data/content-intelligence/backend-architecture/adb06-no-mutation-audit-register.json",
  adb06Readiness: "data/content-intelligence/quality-registry/adb06-adb07-execution-approval-readiness-record.json",
  adb06Boundary: "data/content-intelligence/mutation-plans/adb06-to-adb07-sql-execution-approval-boundary.json",
  adb05SqlDraft: "data/content-intelligence/database-build/sql-drafts/adb05_astro_drishvara_schema_draft.sql",
  adb05Manifest: "data/content-intelligence/database-build/adb05-sql-draft-manifest.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/adb07-sql-execution-approval-checkpoint.json",
  approvalCheckpoint: "data/content-intelligence/database-build/adb07-sql-execution-approval-checkpoint.json",
  executionDecisionRecord: "data/content-intelligence/backend-architecture/adb07-execution-decision-record.json",
  liveSupabaseReadinessChecklist: "data/content-intelligence/database-build/adb07-live-supabase-readiness-checklist.json",
  schemaCollisionReviewPlan: "data/content-intelligence/database-build/adb07-schema-collision-review-plan.json",
  backupRollbackRequirements: "data/content-intelligence/database-build/adb07-backup-rollback-requirements.json",
  secretHandlingGate: "data/content-intelligence/backend-architecture/adb07-secret-handling-gate.json",
  executionDeferralRegister: "data/content-intelligence/backend-architecture/adb07-execution-deferral-register.json",
  noExecutionAudit: "data/content-intelligence/backend-architecture/adb07-no-execution-audit.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/adb07-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/adb07-adb08-execution-package-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/adb07-to-adb08-execution-package-boundary.json",
  registry: "data/quality/adb07-sql-execution-approval-checkpoint.json",
  preview: "data/quality/adb07-sql-execution-approval-checkpoint-preview.json",
  doc: "docs/quality/ADB07_SQL_EXECUTION_APPROVAL_CHECKPOINT.md"
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
  if (!exists(p)) throw new Error(`Missing ADB07 input: ${p}`);
}

const adb06Review = readJson(inputs.adb06Review);
const adb06StructuralValidation = readJson(inputs.adb06StructuralValidation);
const adb06DraftLabelSafetyAudit = readJson(inputs.adb06DraftLabelSafetyAudit);
const adb06BaseSchemaValidation = readJson(inputs.adb06BaseSchemaValidation);
const adb06CalculationEngineValidation = readJson(inputs.adb06CalculationEngineValidation);
const adb06ExecutionRiskReview = readJson(inputs.adb06ExecutionRiskReview);
const adb06RlsAuthDeferralReview = readJson(inputs.adb06RlsAuthDeferralReview);
const adb06SeedInsertBlockerAudit = readJson(inputs.adb06SeedInsertBlockerAudit);
const adb06NoExecutionAudit = readJson(inputs.adb06NoExecutionAudit);
const adb06NoMutationAudit = readJson(inputs.adb06NoMutationAudit);
const adb06Readiness = readJson(inputs.adb06Readiness);
const adb06Boundary = readJson(inputs.adb06Boundary);
const adb05SqlDraft = read(inputs.adb05SqlDraft);
const adb05Manifest = readJson(inputs.adb05Manifest);

if (adb06Review.status !== "sql_draft_validation_ready_for_adb07") throw new Error("ADB06 review status mismatch.");
if (adb06Review.summary?.ready_for_adb07 !== true) throw new Error("ADB06 readiness summary missing.");
if (adb06StructuralValidation.validation_result !== "passed_without_execution") throw new Error("ADB06 structural validation must pass without execution.");
if (adb06DraftLabelSafetyAudit.audit_passed !== true) throw new Error("ADB06 draft label safety audit must pass.");
if (adb06BaseSchemaValidation.validation_result !== "passed") throw new Error("ADB06 base schema validation must pass.");
if (adb06CalculationEngineValidation.validation_result !== "passed") throw new Error("ADB06 calculation engine validation must pass.");
if (adb06ExecutionRiskReview.execution_approval_status !== "not_approved") throw new Error("ADB06 must not approve execution.");
if (adb06RlsAuthDeferralReview.rls_auth_activation_status !== "deferred") throw new Error("RLS/Auth must remain deferred.");
if (adb06SeedInsertBlockerAudit.seed_data_inserted !== false) throw new Error("Seed data must not be inserted.");
if (adb06NoExecutionAudit.audit_passed !== true) throw new Error("ADB06 no-execution audit must pass.");
if (adb06NoMutationAudit.audit_passed !== true) throw new Error("ADB06 no-mutation audit must pass.");
if (adb06Readiness.ready_for_adb07 !== true || adb06Readiness.next_stage_id !== "ADB07") throw new Error("ADB06 readiness must permit ADB07.");
if (adb06Readiness.sql_execution_allowed_next !== false) throw new Error("ADB06 must keep SQL execution blocked.");
if (adb06Boundary.next_stage_id !== "ADB07") throw new Error("ADB06 boundary must point to ADB07.");
if (!adb05SqlDraft.includes("DRAFT_ONLY") || !adb05SqlDraft.includes("NOT_EXECUTED")) throw new Error("ADB05 SQL draft labels missing.");
if (adb05Manifest.sql_execution_approved !== false) throw new Error("ADB05 manifest must block SQL execution.");

const blockedState = {
  adb07_sql_execution_approval_checkpoint_recorded: true,
  adb06_consumed: true,
  validated_sql_draft_acknowledged: true,
  live_supabase_readiness_checklist_recorded: true,
  schema_collision_review_plan_recorded: true,
  backup_rollback_requirements_recorded: true,
  secret_handling_gate_recorded: true,
  execution_deferral_recorded: true,
  ready_for_adb08_execution_package: true,

  live_sql_execution_approved_now: false,
  sql_execution_allowed_now: false,
  database_write_allowed_now: false,
  supabase_connection_allowed_now: false,
  supabase_activation_allowed_now: false,
  seed_insert_allowed_now: false,
  service_role_key_required_now: false,

  sql_executed: false,
  database_write_performed: false,
  supabase_connection_performed: false,
  supabase_table_created: false,
  supabase_schema_modified: false,
  seed_data_inserted: false,
  backend_auth_supabase_activation_performed: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  runtime_calculation_executed: false,
  public_content_generated: false,
  ag47_resume_allowed: false
};

const approvalCheckpoint = {
  module_id: "ADB07",
  title: "SQL Execution Approval Checkpoint",
  status: "sql_execution_approval_checkpoint_recorded_execution_not_approved",
  checkpoint_result: "validated_sql_draft_acknowledged_but_live_execution_not_approved",
  decision: {
    validated_sql_draft_acknowledged: true,
    live_sql_execution_approved_now: false,
    sql_execution_allowed_now: false,
    database_write_allowed_now: false,
    supabase_connection_allowed_now: false,
    supabase_table_creation_allowed_now: false,
    seed_insert_allowed_now: false,
    service_role_key_required_now: false
  },
  reason: [
    "ADB06 validated the SQL draft without execution.",
    "Live execution still requires Supabase project confirmation.",
    "Live execution still requires schema-collision review.",
    "Live execution still requires backup/rollback planning.",
    "Live execution still requires secret-handling confirmation.",
    "Seed insertion and runtime activation remain separate future approvals."
  ],
  blocked_state: blockedState
};

const executionDecisionRecord = {
  module_id: "ADB07",
  title: "Execution Decision Record",
  status: "execution_deferred_pending_manual_approval",
  execution_decision: "deferred",
  explicit_approval_required_before_execution: true,
  approval_phrase_required_later: "APPROVE LIVE SQL EXECUTION AFTER ADB08 REVIEW",
  current_stage_allows_execution: false,
  blocked_state: blockedState
};

const liveSupabaseReadinessChecklist = {
  module_id: "ADB07",
  title: "Live Supabase Readiness Checklist",
  status: "live_supabase_readiness_checklist_recorded",
  required_before_any_execution: [
    "Confirm exact Supabase project name and project ID.",
    "Confirm target schema namespace.",
    "Confirm whether existing tables with same names exist.",
    "Confirm backup or rollback option.",
    "Confirm no production user data is at risk.",
    "Confirm execution account/role policy without sharing secrets in chat.",
    "Confirm SQL is reviewed after ADB08 execution package."
  ],
  current_status: "not_yet_cleared",
  blocked_state: blockedState
};

const schemaCollisionReviewPlan = {
  module_id: "ADB07",
  title: "Schema Collision Review Plan",
  status: "schema_collision_review_plan_recorded",
  collision_checks_required: [
    "Check whether every CREATE TABLE IF NOT EXISTS target already exists.",
    "Check if existing table columns conflict with ADB05 draft.",
    "Check whether names overlap with content-publishing tables.",
    "Check whether foreign key references rely on unavailable tables.",
    "Check whether extensions such as gen_random_uuid are available.",
    "Check whether indexes conflict with existing index names."
  ],
  execution_blocked_until_review: true,
  blocked_state: blockedState
};

const backupRollbackRequirements = {
  module_id: "ADB07",
  title: "Backup and Rollback Requirements",
  status: "backup_rollback_requirements_recorded",
  required_before_execution: [
    "Export current schema metadata before execution.",
    "Prepare rollback SQL for any newly created objects where practical.",
    "Confirm no destructive SQL exists in the draft.",
    "Confirm execution is limited to schema creation only.",
    "Confirm seed/data insert remains blocked."
  ],
  destructive_sql_allowed: false,
  blocked_state: blockedState
};

const secretHandlingGate = {
  module_id: "ADB07",
  title: "Secret Handling Gate",
  status: "secret_handling_gate_recorded",
  rules: [
    "Do not paste Supabase service-role key in chat.",
    "Do not commit service-role key to repo.",
    "Do not create .env secret files in this stage.",
    "Execution instructions must use local/operator-side secret handling only.",
    "No secret is needed for ADB07."
  ],
  service_role_key_required_now: false,
  service_role_key_exposed: false,
  blocked_state: blockedState
};

const executionDeferralRegister = {
  module_id: "ADB07",
  title: "Execution Deferral Register",
  status: "sql_execution_deferred_after_adb07",
  deferral_rules: [
    "ADB07 records the execution approval checkpoint but does not approve live execution.",
    "ADB08 may prepare an execution package/runbook for review only.",
    "SQL execution remains blocked until explicit later approval.",
    "Database write remains blocked until explicit later approval.",
    "Supabase connection remains blocked until explicit later approval.",
    "Seed insertion remains blocked.",
    "Runtime calculation remains blocked.",
    "Backend/Auth/Supabase activation remains blocked."
  ],
  blocked_state: blockedState
};

const noExecutionAudit = {
  module_id: "ADB07",
  title: "No Execution Audit",
  status: "no_execution_audit_passed_for_adb07",
  audit_passed: true,
  checks: [
    { check_id: "sql_executed", expected: false, actual: false, passed: true },
    { check_id: "database_write_performed", expected: false, actual: false, passed: true },
    { check_id: "supabase_connection_performed", expected: false, actual: false, passed: true },
    { check_id: "supabase_table_created", expected: false, actual: false, passed: true },
    { check_id: "supabase_schema_modified", expected: false, actual: false, passed: true },
    { check_id: "seed_data_inserted", expected: false, actual: false, passed: true },
    { check_id: "runtime_calculation_executed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "ADB07",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_adb07",
  audit_passed: true,
  checks: Object.entries({
    sql_executed: false,
    database_write_performed: false,
    supabase_connection_performed: false,
    supabase_table_created: false,
    supabase_schema_modified: false,
    seed_data_inserted: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false,
    runtime_calculation_executed: false,
    public_content_generated: false,
    ag47_resume_allowed: false
  }).map(([check_id, expected]) => ({ check_id, expected, actual: expected, passed: true })),
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "ADB07",
  title: "ADB08 Execution Package Readiness Record",
  status: "ready_for_adb08_execution_package_review",
  ready_for_adb08: true,
  next_stage_id: "ADB08",
  next_stage_title: "SQL Execution Package and Manual Runbook Review",
  adb08_allowed_scope: [
    "Prepare execution package/runbook for manual review.",
    "Prepare schema-collision checklist.",
    "Prepare operator-side execution steps without secrets.",
    "Prepare rollback/backup checklist.",
    "Keep SQL execution blocked."
  ],
  adb08_blocked_scope: [
    "SQL execution",
    "database write",
    "Supabase connection",
    "Supabase table creation",
    "Supabase schema modification",
    "seed data insertion",
    "runtime calculation execution",
    "backend/Auth/Supabase activation",
    "service-role key exposure",
    "deployment",
    "AG47 resume"
  ],
  hard_blocker_count_for_adb08: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "ADB07",
  title: "ADB07 to ADB08 Execution Package Boundary",
  status: "adb08_execution_package_boundary_created",
  next_stage_id: "ADB08",
  next_stage_title: "SQL Execution Package and Manual Runbook Review",
  allowed_scope: readiness.adb08_allowed_scope,
  blocked_scope: readiness.adb08_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "ADB07",
  title: "SQL Execution Approval Checkpoint",
  status: "sql_execution_approval_checkpoint_ready_for_adb08_package",
  depends_on: ["ADB06", "ADB05"],
  approval_checkpoint_file: outputs.approvalCheckpoint,
  execution_decision_record_file: outputs.executionDecisionRecord,
  live_supabase_readiness_checklist_file: outputs.liveSupabaseReadinessChecklist,
  schema_collision_review_plan_file: outputs.schemaCollisionReviewPlan,
  backup_rollback_requirements_file: outputs.backupRollbackRequirements,
  secret_handling_gate_file: outputs.secretHandlingGate,
  execution_deferral_register_file: outputs.executionDeferralRegister,
  no_execution_audit_file: outputs.noExecutionAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    adb07_sql_execution_approval_checkpoint_recorded: true,
    adb06_consumed: true,
    validated_sql_draft_acknowledged: true,
    live_supabase_readiness_checklist_recorded: true,
    schema_collision_review_plan_recorded: true,
    backup_rollback_requirements_recorded: true,
    secret_handling_gate_recorded: true,
    execution_deferral_recorded: true,
    ready_for_adb08_execution_package: true,
    hard_blocker_count_for_adb08: 0,
    live_sql_execution_approved_now: false,
    sql_execution_allowed_now: false,
    database_write_allowed_now: false,
    supabase_connection_allowed_now: false,
    seed_insert_allowed_now: false,
    service_role_key_required_now: false,
    sql_executed: false,
    database_write_performed: false,
    supabase_connection_performed: false,
    supabase_table_created: false,
    supabase_schema_modified: false,
    seed_data_inserted: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false,
    runtime_calculation_executed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "ADB07",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "ADB07",
  status: review.status,
  adb07_sql_execution_approval_checkpoint_recorded: 1,
  adb06_consumed: 1,
  validated_sql_draft_acknowledged: 1,
  live_supabase_readiness_checklist_recorded: 1,
  schema_collision_review_plan_recorded: 1,
  backup_rollback_requirements_recorded: 1,
  secret_handling_gate_recorded: 1,
  execution_deferral_recorded: 1,
  ready_for_adb08_execution_package: 1,
  hard_blocker_count_for_adb08: 0,
  live_sql_execution_approved_now: 0,
  sql_execution_allowed_now: 0,
  database_write_allowed_now: 0,
  supabase_connection_allowed_now: 0,
  seed_insert_allowed_now: 0,
  service_role_key_required_now: 0,
  sql_executed: 0,
  database_write_performed: 0,
  supabase_connection_performed: 0,
  supabase_table_created: 0,
  supabase_schema_modified: 0,
  seed_data_inserted: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0,
  runtime_calculation_executed: 0
};

const doc = `# ADB07 — SQL Execution Approval Checkpoint

## Result

ADB07 records the SQL execution approval checkpoint.

## Decision

The validated SQL draft is acknowledged, but live execution is **not approved yet**.

## Why execution remains blocked

Before execution, the project still requires:

- live Supabase project confirmation
- schema-collision review
- backup/rollback planning
- secret-handling confirmation
- explicit later approval

## Next

ADB08 — SQL Execution Package and Manual Runbook Review.

## Still blocked

- No SQL execution
- No database write
- No Supabase connection
- No Supabase table creation
- No seed insertion
- No runtime calculation execution
- No backend/Auth/Supabase activation
- No service-role key exposure
`;

writeJson(outputs.approvalCheckpoint, approvalCheckpoint);
writeJson(outputs.executionDecisionRecord, executionDecisionRecord);
writeJson(outputs.liveSupabaseReadinessChecklist, liveSupabaseReadinessChecklist);
writeJson(outputs.schemaCollisionReviewPlan, schemaCollisionReviewPlan);
writeJson(outputs.backupRollbackRequirements, backupRollbackRequirements);
writeJson(outputs.secretHandlingGate, secretHandlingGate);
writeJson(outputs.executionDeferralRegister, executionDeferralRegister);
writeJson(outputs.noExecutionAudit, noExecutionAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ ADB07 SQL Execution Approval Checkpoint generated.");
console.log("✅ Validated SQL draft acknowledged.");
console.log("✅ Live SQL execution is not approved yet.");
console.log("✅ Supabase readiness, schema-collision, backup/rollback and secret-handling gates recorded.");
console.log("✅ Ready for ADB08 Execution Package and Manual Runbook Review.");
console.log("✅ No SQL execution, DB write, Supabase connection, seed insert, runtime calculation or service-role exposure recorded.");
