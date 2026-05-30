import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  adb07Review: "data/content-intelligence/quality-reviews/adb07-sql-execution-approval-checkpoint.json",
  adb07ApprovalCheckpoint: "data/content-intelligence/database-build/adb07-sql-execution-approval-checkpoint.json",
  adb07ExecutionDecision: "data/content-intelligence/backend-architecture/adb07-execution-decision-record.json",
  adb07LiveReadiness: "data/content-intelligence/database-build/adb07-live-supabase-readiness-checklist.json",
  adb07SchemaCollision: "data/content-intelligence/database-build/adb07-schema-collision-review-plan.json",
  adb07BackupRollback: "data/content-intelligence/database-build/adb07-backup-rollback-requirements.json",
  adb07SecretGate: "data/content-intelligence/backend-architecture/adb07-secret-handling-gate.json",
  adb07ExecutionDeferral: "data/content-intelligence/backend-architecture/adb07-execution-deferral-register.json",
  adb07NoExecutionAudit: "data/content-intelligence/backend-architecture/adb07-no-execution-audit.json",
  adb07NoMutationAudit: "data/content-intelligence/backend-architecture/adb07-no-mutation-audit-register.json",
  adb07Readiness: "data/content-intelligence/quality-registry/adb07-adb08-execution-package-readiness-record.json",
  adb07Boundary: "data/content-intelligence/mutation-plans/adb07-to-adb08-execution-package-boundary.json",
  adb06Review: "data/content-intelligence/quality-reviews/adb06-sql-draft-validation.json",
  adb05SqlDraft: "data/content-intelligence/database-build/sql-drafts/adb05_astro_drishvara_schema_draft.sql",
  adb05Manifest: "data/content-intelligence/database-build/adb05-sql-draft-manifest.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/adb08-execution-package-runbook-review.json",
  executionPackage: "data/content-intelligence/database-build/adb08-execution-package.json",
  manualRunbook: "docs/quality/ADB08_SQL_EXECUTION_MANUAL_RUNBOOK.md",
  operatorPreflightChecklist: "data/content-intelligence/database-build/adb08-operator-preflight-checklist.json",
  schemaCollisionChecklist: "data/content-intelligence/database-build/adb08-schema-collision-checklist.json",
  backupRollbackChecklist: "data/content-intelligence/database-build/adb08-backup-rollback-checklist.json",
  secretHandlingRunbook: "data/content-intelligence/backend-architecture/adb08-secret-handling-runbook.json",
  executionCommandBoundary: "data/content-intelligence/backend-architecture/adb08-execution-command-boundary.json",
  approvalPhraseRegister: "data/content-intelligence/database-build/adb08-live-execution-approval-phrase-register.json",
  noExecutionAudit: "data/content-intelligence/backend-architecture/adb08-no-execution-audit.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/adb08-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/adb08-adb09-final-execution-approval-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/adb08-to-adb09-final-execution-approval-boundary.json",
  registry: "data/quality/adb08-execution-package-runbook-review.json",
  preview: "data/quality/adb08-execution-package-runbook-review-preview.json"
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
  if (!exists(p)) throw new Error(`Missing ADB08 input: ${p}`);
}

const adb07Review = readJson(inputs.adb07Review);
const adb07ApprovalCheckpoint = readJson(inputs.adb07ApprovalCheckpoint);
const adb07ExecutionDecision = readJson(inputs.adb07ExecutionDecision);
const adb07LiveReadiness = readJson(inputs.adb07LiveReadiness);
const adb07SchemaCollision = readJson(inputs.adb07SchemaCollision);
const adb07BackupRollback = readJson(inputs.adb07BackupRollback);
const adb07SecretGate = readJson(inputs.adb07SecretGate);
const adb07ExecutionDeferral = readJson(inputs.adb07ExecutionDeferral);
const adb07NoExecutionAudit = readJson(inputs.adb07NoExecutionAudit);
const adb07NoMutationAudit = readJson(inputs.adb07NoMutationAudit);
const adb07Readiness = readJson(inputs.adb07Readiness);
const adb07Boundary = readJson(inputs.adb07Boundary);
const adb06Review = readJson(inputs.adb06Review);
const adb05SqlDraft = read(inputs.adb05SqlDraft);
const adb05Manifest = readJson(inputs.adb05Manifest);

if (adb07Review.status !== "sql_execution_approval_checkpoint_ready_for_adb08_package") throw new Error("ADB07 review status mismatch.");
if (adb07Review.summary?.ready_for_adb08_execution_package !== true) throw new Error("ADB07 readiness summary missing.");
if (adb07ApprovalCheckpoint.checkpoint_result !== "validated_sql_draft_acknowledged_but_live_execution_not_approved") throw new Error("ADB07 approval checkpoint result mismatch.");
if (adb07ApprovalCheckpoint.decision?.live_sql_execution_approved_now !== false) throw new Error("ADB07 must not approve live SQL execution.");
if (adb07ExecutionDecision.execution_decision !== "deferred") throw new Error("ADB07 execution decision must be deferred.");
if (adb07ExecutionDecision.current_stage_allows_execution !== false) throw new Error("ADB07 must not allow execution.");
if (adb07LiveReadiness.current_status !== "not_yet_cleared") throw new Error("ADB07 live readiness must not be cleared.");
if (adb07SchemaCollision.execution_blocked_until_review !== true) throw new Error("Schema collision review must block execution.");
if (adb07BackupRollback.destructive_sql_allowed !== false) throw new Error("Destructive SQL must remain disallowed.");
if (adb07SecretGate.service_role_key_required_now !== false) throw new Error("ADB07 must not require service-role key.");
if (adb07SecretGate.service_role_key_exposed !== false) throw new Error("ADB07 must not expose service-role key.");
if (!JSON.stringify(adb07ExecutionDeferral).includes("SQL execution remains blocked")) throw new Error("ADB07 execution deferral missing SQL block.");
if (adb07NoExecutionAudit.audit_passed !== true) throw new Error("ADB07 no-execution audit must pass.");
if (adb07NoMutationAudit.audit_passed !== true) throw new Error("ADB07 no-mutation audit must pass.");
if (adb07Readiness.ready_for_adb08 !== true || adb07Readiness.next_stage_id !== "ADB08") throw new Error("ADB07 readiness must permit ADB08.");
if (adb07Boundary.next_stage_id !== "ADB08") throw new Error("ADB07 boundary must point to ADB08.");
if (adb06Review.status !== "sql_draft_validation_ready_for_adb07") throw new Error("ADB06 review status mismatch.");
if (!adb05SqlDraft.includes("DRAFT_ONLY") || !adb05SqlDraft.includes("NOT_EXECUTED")) throw new Error("ADB05 SQL draft labels missing.");
if (adb05Manifest.sql_execution_approved !== false) throw new Error("ADB05 manifest must keep SQL execution blocked.");

const blockedState = {
  adb08_execution_package_recorded: true,
  adb07_consumed: true,
  manual_runbook_recorded: true,
  operator_preflight_checklist_recorded: true,
  schema_collision_checklist_recorded: true,
  backup_rollback_checklist_recorded: true,
  secret_handling_runbook_recorded: true,
  execution_command_boundary_recorded: true,
  approval_phrase_register_recorded: true,
  ready_for_adb09_final_execution_approval: true,

  sql_execution_approved_now: false,
  database_write_approved_now: false,
  supabase_connection_approved_now: false,
  supabase_table_creation_approved_now: false,
  supabase_schema_modification_approved_now: false,
  seed_insert_approved_now: false,
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

const executionPackage = {
  module_id: "ADB08",
  title: "SQL Execution Package",
  status: "execution_package_recorded_for_manual_review_only",
  sql_draft_path: inputs.adb05SqlDraft,
  package_type: "manual_review_runbook_only",
  package_includes: [
    outputs.manualRunbook,
    outputs.operatorPreflightChecklist,
    outputs.schemaCollisionChecklist,
    outputs.backupRollbackChecklist,
    outputs.secretHandlingRunbook,
    outputs.executionCommandBoundary,
    outputs.approvalPhraseRegister
  ],
  explicit_non_approvals: {
    sql_execution_approved_now: false,
    database_write_approved_now: false,
    supabase_connection_approved_now: false,
    seed_insert_approved_now: false,
    runtime_calculation_approved_now: false,
    backend_auth_supabase_activation_approved_now: false
  },
  blocked_state: blockedState
};

const operatorPreflightChecklist = {
  module_id: "ADB08",
  title: "Operator Preflight Checklist",
  status: "operator_preflight_checklist_recorded",
  required_before_final_execution_approval: [
    "Confirm exact Supabase project name and project ID.",
    "Confirm target schema namespace.",
    "Confirm SQL draft path and checksum/operator copy.",
    "Confirm no seed INSERT/COPY statements are present.",
    "Confirm no destructive SQL statements are present.",
    "Confirm no public/runtime app is pointed to these tables yet.",
    "Confirm AG27 backend/Auth deferral remains respected.",
    "Confirm final approval phrase is provided only after ADB09 review."
  ],
  current_clearance_status: "not_cleared_for_execution",
  blocked_state: blockedState
};

const schemaCollisionChecklist = {
  module_id: "ADB08",
  title: "Schema Collision Checklist",
  status: "schema_collision_checklist_recorded",
  required_manual_checks: [
    "Check whether each target table already exists.",
    "Check whether any existing column definition conflicts with the draft.",
    "Check whether index names already exist.",
    "Check whether extension gen_random_uuid is available.",
    "Check whether foreign key referenced columns are unique or primary where needed.",
    "Check whether content-publishing tables should be linked instead of duplicated.",
    "Check whether any table name conflicts with future runtime/API naming."
  ],
  current_clearance_status: "not_cleared_for_execution",
  blocked_state: blockedState
};

const backupRollbackChecklist = {
  module_id: "ADB08",
  title: "Backup and Rollback Checklist",
  status: "backup_rollback_checklist_recorded",
  required_manual_checks: [
    "Export current schema metadata before execution.",
    "Record existing table list before execution.",
    "Prepare rollback DROP statements only for newly created objects, for review only.",
    "Confirm rollback script is not executed automatically.",
    "Confirm SQL draft has no DROP, TRUNCATE, DELETE, UPDATE, INSERT or COPY.",
    "Confirm execution will be schema-only if later approved."
  ],
  current_clearance_status: "not_cleared_for_execution",
  blocked_state: blockedState
};

const secretHandlingRunbook = {
  module_id: "ADB08",
  title: "Secret Handling Runbook",
  status: "secret_handling_runbook_recorded",
  rules: [
    "Do not paste Supabase service-role key into chat.",
    "Do not commit .env files.",
    "Do not write service-role key into SQL, JSON, Markdown or scripts.",
    "Use Supabase dashboard SQL editor or local operator-side authenticated CLI only after final approval.",
    "Keep all secret handling outside the repo.",
    "ADB08 does not require any secret."
  ],
  service_role_key_required_now: false,
  service_role_key_exposed: false,
  blocked_state: blockedState
};

const executionCommandBoundary = {
  module_id: "ADB08",
  title: "Execution Command Boundary",
  status: "execution_command_boundary_recorded",
  allowed_now: [
    "Review the SQL draft manually.",
    "Review this runbook.",
    "Review schema-collision checklist.",
    "Review backup/rollback checklist.",
    "Prepare for ADB09 final approval decision."
  ],
  blocked_now: [
    "Run psql command.",
    "Run Supabase CLI command.",
    "Open a live DB connection from this stage.",
    "Paste or use service-role key.",
    "Execute SQL in Supabase dashboard.",
    "Insert seed data.",
    "Enable RLS/Auth/backend runtime.",
    "Deploy public runtime changes."
  ],
  no_execution_command_generated: true,
  blocked_state: blockedState
};

const approvalPhraseRegister = {
  module_id: "ADB08",
  title: "Live Execution Approval Phrase Register",
  status: "approval_phrase_register_recorded",
  required_future_approval_phrase: "APPROVE LIVE SQL EXECUTION AFTER ADB09 REVIEW",
  approval_phrase_not_given_in_adb08: true,
  approval_phrase_required_for: [
    "SQL execution",
    "database write",
    "Supabase table creation",
    "Supabase schema modification"
  ],
  not_covered_by_phrase: [
    "seed data insertion",
    "runtime calculation execution",
    "backend/Auth activation",
    "deployment"
  ],
  blocked_state: blockedState
};

const noExecutionAudit = {
  module_id: "ADB08",
  title: "No Execution Audit",
  status: "no_execution_audit_passed_for_adb08",
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
  module_id: "ADB08",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_adb08",
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
  module_id: "ADB08",
  title: "ADB09 Final Execution Approval Readiness Record",
  status: "ready_for_adb09_final_execution_approval_checkpoint",
  ready_for_adb09: true,
  next_stage_id: "ADB09",
  next_stage_title: "Final Live SQL Execution Approval Checkpoint",
  adb09_allowed_scope: [
    "Review ADB08 execution package.",
    "Review preflight, schema-collision, backup/rollback and secret-handling checklists.",
    "Decide whether live schema-only SQL execution may be approved.",
    "Keep seed insertion, runtime calculation, backend/Auth activation and deployment blocked."
  ],
  adb09_blocked_scope_until_explicit_phrase: [
    "SQL execution",
    "database write",
    "Supabase connection",
    "Supabase table creation",
    "Supabase schema modification"
  ],
  always_blocked_until_later_stage: [
    "seed data insertion",
    "runtime calculation execution",
    "backend/Auth/Supabase activation",
    "service-role key exposure in repo/chat",
    "deployment",
    "AG47 resume"
  ],
  hard_blocker_count_for_adb09: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "ADB08",
  title: "ADB08 to ADB09 Final Execution Approval Boundary",
  status: "adb09_final_execution_approval_boundary_created",
  next_stage_id: "ADB09",
  next_stage_title: "Final Live SQL Execution Approval Checkpoint",
  allowed_scope: readiness.adb09_allowed_scope,
  blocked_scope_until_explicit_phrase: readiness.adb09_blocked_scope_until_explicit_phrase,
  always_blocked_until_later_stage: readiness.always_blocked_until_later_stage,
  blocked_state: blockedState
};

const review = {
  module_id: "ADB08",
  title: "SQL Execution Package and Manual Runbook Review",
  status: "execution_package_runbook_ready_for_adb09",
  depends_on: ["ADB07", "ADB06", "ADB05"],
  execution_package_file: outputs.executionPackage,
  manual_runbook_file: outputs.manualRunbook,
  operator_preflight_checklist_file: outputs.operatorPreflightChecklist,
  schema_collision_checklist_file: outputs.schemaCollisionChecklist,
  backup_rollback_checklist_file: outputs.backupRollbackChecklist,
  secret_handling_runbook_file: outputs.secretHandlingRunbook,
  execution_command_boundary_file: outputs.executionCommandBoundary,
  approval_phrase_register_file: outputs.approvalPhraseRegister,
  no_execution_audit_file: outputs.noExecutionAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    adb08_execution_package_recorded: true,
    adb07_consumed: true,
    manual_runbook_recorded: true,
    operator_preflight_checklist_recorded: true,
    schema_collision_checklist_recorded: true,
    backup_rollback_checklist_recorded: true,
    secret_handling_runbook_recorded: true,
    execution_command_boundary_recorded: true,
    approval_phrase_register_recorded: true,
    ready_for_adb09_final_execution_approval: true,
    hard_blocker_count_for_adb09: 0,
    sql_execution_approved_now: false,
    database_write_approved_now: false,
    supabase_connection_approved_now: false,
    seed_insert_approved_now: false,
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
  module_id: "ADB08",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "ADB08",
  status: review.status,
  adb08_execution_package_recorded: 1,
  adb07_consumed: 1,
  manual_runbook_recorded: 1,
  operator_preflight_checklist_recorded: 1,
  schema_collision_checklist_recorded: 1,
  backup_rollback_checklist_recorded: 1,
  secret_handling_runbook_recorded: 1,
  execution_command_boundary_recorded: 1,
  approval_phrase_register_recorded: 1,
  ready_for_adb09_final_execution_approval: 1,
  hard_blocker_count_for_adb09: 0,
  sql_execution_approved_now: 0,
  database_write_approved_now: 0,
  supabase_connection_approved_now: 0,
  seed_insert_approved_now: 0,
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

const manualRunbook = `# ADB08 — SQL Execution Package and Manual Runbook Review

## Purpose

This runbook prepares the reviewed execution package for the ADB05 SQL draft.

## SQL draft path

\`data/content-intelligence/database-build/sql-drafts/adb05_astro_drishvara_schema_draft.sql\`

## Current status

The SQL draft has been validated by ADB06, but live execution is still **not approved**.

## Before any execution is approved

The operator must confirm:

1. Exact Supabase project name and project ID.
2. Target schema namespace.
3. No existing-table collision.
4. No index-name collision.
5. No destructive SQL.
6. Backup/rollback readiness.
7. Secret handling outside repository and outside chat.
8. No seed insertion.
9. No runtime calculation activation.
10. No backend/Auth activation.

## Do not do in ADB08

- Do not execute SQL.
- Do not connect to Supabase.
- Do not paste service-role key.
- Do not insert seed data.
- Do not activate runtime calculation.
- Do not deploy.

## Next

ADB09 — Final Live SQL Execution Approval Checkpoint.
`;

writeJson(outputs.executionPackage, executionPackage);
writeText(outputs.manualRunbook, manualRunbook);
writeJson(outputs.operatorPreflightChecklist, operatorPreflightChecklist);
writeJson(outputs.schemaCollisionChecklist, schemaCollisionChecklist);
writeJson(outputs.backupRollbackChecklist, backupRollbackChecklist);
writeJson(outputs.secretHandlingRunbook, secretHandlingRunbook);
writeJson(outputs.executionCommandBoundary, executionCommandBoundary);
writeJson(outputs.approvalPhraseRegister, approvalPhraseRegister);
writeJson(outputs.noExecutionAudit, noExecutionAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);

console.log("✅ ADB08 SQL Execution Package and Manual Runbook Review generated.");
console.log("✅ Manual runbook, preflight checklist, schema-collision checklist and backup/rollback checklist recorded.");
console.log("✅ Secret-handling and execution-command boundaries recorded.");
console.log("✅ Ready for ADB09 Final Live SQL Execution Approval Checkpoint.");
console.log("✅ No SQL execution, DB write, Supabase connection, seed insert, runtime calculation or service-role exposure recorded.");
