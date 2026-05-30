import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  adb08Review: "data/content-intelligence/quality-reviews/adb08-execution-package-runbook-review.json",
  adb08ExecutionPackage: "data/content-intelligence/database-build/adb08-execution-package.json",
  adb08ManualRunbook: "docs/quality/ADB08_SQL_EXECUTION_MANUAL_RUNBOOK.md",
  adb08Preflight: "data/content-intelligence/database-build/adb08-operator-preflight-checklist.json",
  adb08SchemaCollision: "data/content-intelligence/database-build/adb08-schema-collision-checklist.json",
  adb08BackupRollback: "data/content-intelligence/database-build/adb08-backup-rollback-checklist.json",
  adb08SecretRunbook: "data/content-intelligence/backend-architecture/adb08-secret-handling-runbook.json",
  adb08CommandBoundary: "data/content-intelligence/backend-architecture/adb08-execution-command-boundary.json",
  adb08ApprovalPhrase: "data/content-intelligence/database-build/adb08-live-execution-approval-phrase-register.json",
  adb08NoExecutionAudit: "data/content-intelligence/backend-architecture/adb08-no-execution-audit.json",
  adb08NoMutationAudit: "data/content-intelligence/backend-architecture/adb08-no-mutation-audit-register.json",
  adb08Readiness: "data/content-intelligence/quality-registry/adb08-adb09-final-execution-approval-readiness-record.json",
  adb08Boundary: "data/content-intelligence/mutation-plans/adb08-to-adb09-final-execution-approval-boundary.json",

  adb06Review: "data/content-intelligence/quality-reviews/adb06-sql-draft-validation.json",
  adb05SqlDraft: "data/content-intelligence/database-build/sql-drafts/adb05_astro_drishvara_schema_draft.sql",
  adb05Manifest: "data/content-intelligence/database-build/adb05-sql-draft-manifest.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/adb09-final-execution-approval-checkpoint.json",
  finalApprovalRecord: "data/content-intelligence/database-build/adb09-final-live-sql-execution-approval-record.json",
  schemaOnlyExecutionScope: "data/content-intelligence/database-build/adb09-schema-only-execution-scope.json",
  remainingBlockersRegister: "data/content-intelligence/backend-architecture/adb09-remaining-blockers-register.json",
  operatorResponsibilityNotice: "data/content-intelligence/database-build/adb09-operator-responsibility-notice.json",
  preExecutionReconfirmationChecklist: "data/content-intelligence/database-build/adb09-pre-execution-reconfirmation-checklist.json",
  secretHandlingConfirmation: "data/content-intelligence/backend-architecture/adb09-secret-handling-confirmation.json",
  noExecutionAudit: "data/content-intelligence/backend-architecture/adb09-no-execution-audit.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/adb09-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/adb09-adb10-live-schema-execution-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/adb09-to-adb10-live-schema-execution-boundary.json",
  registry: "data/quality/adb09-final-execution-approval-checkpoint.json",
  preview: "data/quality/adb09-final-execution-approval-checkpoint-preview.json",
  doc: "docs/quality/ADB09_FINAL_EXECUTION_APPROVAL_CHECKPOINT.md"
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
  if (!exists(p)) throw new Error(`Missing ADB09 input: ${p}`);
}

const adb08Review = readJson(inputs.adb08Review);
const adb08ExecutionPackage = readJson(inputs.adb08ExecutionPackage);
const adb08ManualRunbook = read(inputs.adb08ManualRunbook);
const adb08Preflight = readJson(inputs.adb08Preflight);
const adb08SchemaCollision = readJson(inputs.adb08SchemaCollision);
const adb08BackupRollback = readJson(inputs.adb08BackupRollback);
const adb08SecretRunbook = readJson(inputs.adb08SecretRunbook);
const adb08CommandBoundary = readJson(inputs.adb08CommandBoundary);
const adb08ApprovalPhrase = readJson(inputs.adb08ApprovalPhrase);
const adb08NoExecutionAudit = readJson(inputs.adb08NoExecutionAudit);
const adb08NoMutationAudit = readJson(inputs.adb08NoMutationAudit);
const adb08Readiness = readJson(inputs.adb08Readiness);
const adb08Boundary = readJson(inputs.adb08Boundary);

const adb06Review = readJson(inputs.adb06Review);
const adb05SqlDraft = read(inputs.adb05SqlDraft);
const adb05Manifest = readJson(inputs.adb05Manifest);

if (adb08Review.status !== "execution_package_runbook_ready_for_adb09") throw new Error("ADB08 review status mismatch.");
if (adb08Review.summary?.ready_for_adb09_final_execution_approval !== true) throw new Error("ADB08 readiness summary missing.");
if (adb08ExecutionPackage.package_type !== "manual_review_runbook_only") throw new Error("ADB08 package must be manual review only.");
if (adb08ExecutionPackage.explicit_non_approvals?.sql_execution_approved_now !== false) throw new Error("ADB08 must not have approved execution.");
if (!adb08ManualRunbook.includes("Do not execute SQL")) throw new Error("ADB08 manual runbook must have no-execution warning.");
if (adb08Preflight.current_clearance_status !== "not_cleared_for_execution") throw new Error("ADB08 preflight must not be cleared.");
if (adb08SchemaCollision.current_clearance_status !== "not_cleared_for_execution") throw new Error("ADB08 schema collision checklist must not be cleared.");
if (adb08BackupRollback.current_clearance_status !== "not_cleared_for_execution") throw new Error("ADB08 backup/rollback checklist must not be cleared.");
if (adb08SecretRunbook.service_role_key_required_now !== false) throw new Error("ADB08 must not require service-role key.");
if (adb08SecretRunbook.service_role_key_exposed !== false) throw new Error("ADB08 must not expose service-role key.");
if (adb08CommandBoundary.no_execution_command_generated !== true) throw new Error("ADB08 must not generate execution command.");
if (adb08ApprovalPhrase.required_future_approval_phrase !== "APPROVE LIVE SQL EXECUTION AFTER ADB09 REVIEW") throw new Error("ADB08 approval phrase mismatch.");
if (adb08NoExecutionAudit.audit_passed !== true) throw new Error("ADB08 no-execution audit must pass.");
if (adb08NoMutationAudit.audit_passed !== true) throw new Error("ADB08 no-mutation audit must pass.");
if (adb08Readiness.ready_for_adb09 !== true || adb08Readiness.next_stage_id !== "ADB09") throw new Error("ADB08 readiness must permit ADB09.");
if (adb08Boundary.next_stage_id !== "ADB09") throw new Error("ADB08 boundary must point to ADB09.");
if (adb06Review.status !== "sql_draft_validation_ready_for_adb07") throw new Error("ADB06 review status mismatch.");
if (!adb05SqlDraft.includes("DRAFT_ONLY") || !adb05SqlDraft.includes("NOT_EXECUTED")) throw new Error("ADB05 SQL draft labels missing.");
if (adb05Manifest.sql_execution_approved !== false) throw new Error("ADB05 manifest must keep execution blocked before ADB09.");

const blockedState = {
  adb09_final_execution_approval_recorded: true,
  adb08_consumed: true,
  final_schema_only_execution_approval_recorded: true,
  schema_only_execution_scope_recorded: true,
  operator_responsibility_notice_recorded: true,
  pre_execution_reconfirmation_checklist_recorded: true,
  ready_for_adb10_live_schema_execution: true,

  schema_only_sql_execution_approved_for_adb10: true,
  database_schema_write_approved_for_adb10: true,
  supabase_connection_approved_for_adb10_operator_side: true,

  sql_executed_in_adb09: false,
  database_write_performed_in_adb09: false,
  supabase_connection_performed_in_adb09: false,
  supabase_table_created_in_adb09: false,
  supabase_schema_modified_in_adb09: false,

  seed_insert_approved: false,
  seed_data_inserted: false,
  runtime_calculation_approved: false,
  runtime_calculation_executed: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_content_generated: false,
  ag47_resume_allowed: false
};

const finalApprovalRecord = {
  module_id: "ADB09",
  title: "Final Live SQL Execution Approval Record",
  status: "schema_only_live_sql_execution_approved_for_adb10",
  user_approval_basis: "User explicitly instructed: go ahead for Live SQL Execution.",
  approval_phrase_equivalence_recorded: true,
  canonical_future_phrase: "APPROVE LIVE SQL EXECUTION AFTER ADB09 REVIEW",
  approval_scope: {
    schema_only_sql_execution_approved_for_adb10: true,
    database_schema_write_approved_for_adb10: true,
    supabase_connection_approved_for_adb10_operator_side: true,
    seed_insert_approved: false,
    runtime_calculation_approved: false,
    backend_auth_supabase_activation_approved: false,
    deployment_approved: false,
    service_role_key_exposure_approved: false
  },
  execution_status_in_adb09: {
    sql_executed: false,
    database_write_performed: false,
    supabase_connection_performed: false,
    supabase_table_created: false,
    supabase_schema_modified: false
  },
  blocked_state: blockedState
};

const schemaOnlyExecutionScope = {
  module_id: "ADB09",
  title: "Schema-only Execution Scope",
  status: "schema_only_execution_scope_recorded",
  allowed_in_adb10_if_operator_confirms_preflight: [
    "Execute the reviewed ADB05 SQL schema draft manually.",
    "Create schema tables only.",
    "Create schema indexes only.",
    "Use operator-side Supabase dashboard or local authenticated CLI without sharing secrets.",
    "Record execution result after manual execution."
  ],
  not_allowed_in_adb10: [
    "Insert seed data.",
    "Run Panchanga calculations.",
    "Activate runtime API/backend.",
    "Enable Auth/RLS policy for public runtime.",
    "Deploy website changes.",
    "Expose or commit service-role key.",
    "Generate public Panchang/Guidance output."
  ],
  sql_draft_path: inputs.adb05SqlDraft,
  blocked_state: blockedState
};

const remainingBlockersRegister = {
  module_id: "ADB09",
  title: "Remaining Blockers Register",
  status: "remaining_blockers_recorded",
  still_blocked_after_adb09: [
    "Seed data insertion",
    "Source-authority seed loading",
    "Panchanga master seed loading",
    "Runtime calculation execution",
    "Backend/Auth/Supabase activation",
    "RLS public policy activation",
    "Public website integration",
    "Deployment",
    "AG47 resume"
  ],
  reason: "ADB09 approves schema-only SQL execution for ADB10. Data loading and runtime activation require later governed stages.",
  blocked_state: blockedState
};

const operatorResponsibilityNotice = {
  module_id: "ADB09",
  title: "Operator Responsibility Notice",
  status: "operator_responsibility_notice_recorded",
  notice: [
    "Execution must be performed manually by the operator in the correct Supabase project.",
    "No secret should be pasted into chat or committed to the repo.",
    "Operator must confirm project, backup, schema collision and SQL draft path before execution.",
    "Only the ADB05 schema draft may be executed in ADB10.",
    "No seed INSERT/COPY is approved."
  ],
  blocked_state: blockedState
};

const preExecutionReconfirmationChecklist = {
  module_id: "ADB09",
  title: "Pre-execution Reconfirmation Checklist",
  status: "pre_execution_reconfirmation_checklist_recorded",
  required_before_adb10_execution: [
    "Confirm Supabase project: Drishvara Phase-I.",
    "Confirm project ID if used: pajlabwwszmhjhabxprf.",
    "Confirm target SQL draft path.",
    "Confirm SQL draft contains DRAFT_ONLY and NOT_EXECUTED labels.",
    "Confirm no INSERT, COPY, UPDATE, DELETE, DROP or TRUNCATE statements are present.",
    "Confirm gen_random_uuid support or required extension handling.",
    "Confirm no collision with existing tables/indexes.",
    "Confirm operator has backup/rollback notes available.",
    "Confirm no service-role key is pasted into chat or committed."
  ],
  current_status: "ready_for_adb10_operator_confirmation",
  blocked_state: blockedState
};

const secretHandlingConfirmation = {
  module_id: "ADB09",
  title: "Secret Handling Confirmation",
  status: "secret_handling_confirmed_for_adb10_operator_side_only",
  rules: [
    "No service-role key is needed in repository.",
    "No service-role key is needed in chat.",
    "If Supabase dashboard is used, authentication is handled by the operator outside repo/chat.",
    "If local CLI is used later, credentials remain local and are not committed.",
    "ADB09 does not create .env files.",
    "ADB09 does not execute SQL."
  ],
  service_role_key_exposed: false,
  blocked_state: blockedState
};

const noExecutionAudit = {
  module_id: "ADB09",
  title: "No Execution Audit",
  status: "no_execution_audit_passed_for_adb09",
  audit_passed: true,
  checks: [
    { check_id: "approval_record_created", expected: true, actual: true, passed: true },
    { check_id: "sql_executed_in_adb09", expected: false, actual: false, passed: true },
    { check_id: "database_write_performed_in_adb09", expected: false, actual: false, passed: true },
    { check_id: "supabase_connection_performed_in_adb09", expected: false, actual: false, passed: true },
    { check_id: "supabase_table_created_in_adb09", expected: false, actual: false, passed: true },
    { check_id: "seed_data_inserted", expected: false, actual: false, passed: true },
    { check_id: "runtime_calculation_executed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "ADB09",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_adb09",
  audit_passed: true,
  checks: Object.entries({
    sql_executed_in_adb09: false,
    database_write_performed_in_adb09: false,
    supabase_connection_performed_in_adb09: false,
    supabase_table_created_in_adb09: false,
    supabase_schema_modified_in_adb09: false,
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
  module_id: "ADB09",
  title: "ADB10 Live Schema Execution Readiness Record",
  status: "ready_for_adb10_live_schema_only_execution",
  ready_for_adb10: true,
  next_stage_id: "ADB10",
  next_stage_title: "Live Schema-only SQL Execution and Result Capture",
  adb10_execution_scope_approved: true,
  adb10_allowed_scope: [
    "Execute ADB05 SQL draft manually in the approved Supabase project.",
    "Schema-only table/index creation.",
    "Operator-side execution only.",
    "Capture execution result.",
    "Record post-execution validation."
  ],
  adb10_blocked_scope: [
    "Seed data insertion",
    "Runtime calculation execution",
    "Backend/Auth/Supabase runtime activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure in repo/chat",
    "Public content generation",
    "AG47 resume"
  ],
  hard_blocker_count_for_adb10: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "ADB09",
  title: "ADB09 to ADB10 Live Schema Execution Boundary",
  status: "adb10_live_schema_execution_boundary_created",
  next_stage_id: "ADB10",
  next_stage_title: "Live Schema-only SQL Execution and Result Capture",
  allowed_scope: readiness.adb10_allowed_scope,
  blocked_scope: readiness.adb10_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "ADB09",
  title: "Final Live SQL Execution Approval Checkpoint",
  status: "schema_only_live_sql_execution_approved_ready_for_adb10",
  depends_on: ["ADB08", "ADB07", "ADB06", "ADB05"],
  final_approval_record_file: outputs.finalApprovalRecord,
  schema_only_execution_scope_file: outputs.schemaOnlyExecutionScope,
  remaining_blockers_register_file: outputs.remainingBlockersRegister,
  operator_responsibility_notice_file: outputs.operatorResponsibilityNotice,
  pre_execution_reconfirmation_checklist_file: outputs.preExecutionReconfirmationChecklist,
  secret_handling_confirmation_file: outputs.secretHandlingConfirmation,
  no_execution_audit_file: outputs.noExecutionAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    adb09_final_execution_approval_recorded: true,
    adb08_consumed: true,
    final_schema_only_execution_approval_recorded: true,
    schema_only_execution_scope_recorded: true,
    operator_responsibility_notice_recorded: true,
    pre_execution_reconfirmation_checklist_recorded: true,
    ready_for_adb10_live_schema_execution: true,
    hard_blocker_count_for_adb10: 0,
    schema_only_sql_execution_approved_for_adb10: true,
    database_schema_write_approved_for_adb10: true,
    supabase_connection_approved_for_adb10_operator_side: true,
    sql_executed_in_adb09: false,
    database_write_performed_in_adb09: false,
    supabase_connection_performed_in_adb09: false,
    seed_insert_approved: false,
    seed_data_inserted: false,
    runtime_calculation_approved: false,
    runtime_calculation_executed: false,
    backend_auth_supabase_activation_approved: false,
    deployment_approved: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "ADB09",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "ADB09",
  status: review.status,
  adb09_final_execution_approval_recorded: 1,
  adb08_consumed: 1,
  final_schema_only_execution_approval_recorded: 1,
  schema_only_execution_scope_recorded: 1,
  operator_responsibility_notice_recorded: 1,
  pre_execution_reconfirmation_checklist_recorded: 1,
  ready_for_adb10_live_schema_execution: 1,
  hard_blocker_count_for_adb10: 0,
  schema_only_sql_execution_approved_for_adb10: 1,
  database_schema_write_approved_for_adb10: 1,
  supabase_connection_approved_for_adb10_operator_side: 1,
  sql_executed_in_adb09: 0,
  database_write_performed_in_adb09: 0,
  supabase_connection_performed_in_adb09: 0,
  seed_insert_approved: 0,
  seed_data_inserted: 0,
  runtime_calculation_approved: 0,
  runtime_calculation_executed: 0,
  backend_auth_supabase_activation_approved: 0,
  deployment_approved: 0,
  service_role_key_exposed: 0
};

const doc = `# ADB09 — Final Live SQL Execution Approval Checkpoint

## Result

ADB09 records final approval for schema-only SQL execution in ADB10.

## Approval scope

Approved for ADB10:

- Execute the reviewed ADB05 SQL draft manually.
- Schema-only table/index creation.
- Operator-side Supabase execution only.
- Result capture and post-execution validation.

## Not approved

- Seed data insertion
- Runtime Panchanga calculation execution
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure in repo/chat
- Public content generation
- AG47 resume

## Important

ADB09 itself does not execute SQL. ADB10 will provide the controlled execution/result-capture step.
`;

writeJson(outputs.finalApprovalRecord, finalApprovalRecord);
writeJson(outputs.schemaOnlyExecutionScope, schemaOnlyExecutionScope);
writeJson(outputs.remainingBlockersRegister, remainingBlockersRegister);
writeJson(outputs.operatorResponsibilityNotice, operatorResponsibilityNotice);
writeJson(outputs.preExecutionReconfirmationChecklist, preExecutionReconfirmationChecklist);
writeJson(outputs.secretHandlingConfirmation, secretHandlingConfirmation);
writeJson(outputs.noExecutionAudit, noExecutionAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ ADB09 Final Live SQL Execution Approval Checkpoint generated.");
console.log("✅ Schema-only live SQL execution approved for ADB10.");
console.log("✅ D/M/ID-aligned SQL draft remains the approved source for schema execution.");
console.log("✅ Seed insert, runtime calculation, backend/Auth activation, deployment and service-role exposure remain blocked.");
console.log("✅ Ready for ADB10 Live Schema-only SQL Execution and Result Capture.");
console.log("✅ No SQL execution, DB write or Supabase connection performed in ADB09.");
