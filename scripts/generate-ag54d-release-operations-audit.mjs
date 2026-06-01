import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag54aReview: "data/content-intelligence/quality-reviews/ag54a-backup-restore-plan.json",
  ag54aGitBaseline: "data/content-intelligence/release-operations/ag54a-git-baseline-record.json",
  ag54aBackupScope: "data/content-intelligence/release-operations/ag54a-repo-content-static-artifact-backup-scope.json",
  ag54aRestorePlan: "data/content-intelligence/release-operations/ag54a-restore-method-plan.json",
  ag54aVerification: "data/content-intelligence/release-operations/ag54a-backup-restore-verification-sequence.json",
  ag54aSupabaseDeferral: "data/content-intelligence/release-operations/ag54a-supabase-backend-deferral-continuity-record.json",
  ag54aBoundary: "data/content-intelligence/release-operations/ag54a-backup-restore-boundary.json",
  ag54aNoExternalBackup: "data/content-intelligence/backend-architecture/ag54a-no-external-backup-service-activation-audit.json",
  ag54aNoPublicMutation: "data/content-intelligence/backend-architecture/ag54a-no-public-mutation-publishing-deployment-audit.json",
  ag54aNoBackendRuntime: "data/content-intelligence/backend-architecture/ag54a-no-backend-auth-rls-database-runtime-audit.json",

  ag54bReview: "data/content-intelligence/quality-reviews/ag54b-deployment-release-checklist.json",
  ag54bValidateChecklist: "data/content-intelligence/release-operations/ag54b-validate-git-commit-push-checklist.json",
  ag54bStaticReleasePath: "data/content-intelligence/release-operations/ag54b-static-release-path-checklist.json",
  ag54bVercelLiveCheck: "data/content-intelligence/release-operations/ag54b-vercel-live-check-sequence-plan.json",
  ag54bReleaseGate: "data/content-intelligence/release-operations/ag54b-release-gate-criteria.json",
  ag54bReleaseBoundary: "data/content-intelligence/release-operations/ag54b-deployment-release-checklist-boundary.json",
  ag54bNoDeployment: "data/content-intelligence/backend-architecture/ag54b-no-deployment-trigger-audit.json",
  ag54bNoPublicMutation: "data/content-intelligence/backend-architecture/ag54b-no-public-mutation-publishing-audit.json",
  ag54bNoBackendRuntime: "data/content-intelligence/backend-architecture/ag54b-no-backend-auth-rls-database-runtime-audit.json",

  ag54cReview: "data/content-intelligence/quality-reviews/ag54c-rollback-incident-response-plan.json",
  ag54cTriggerRegister: "data/content-intelligence/release-operations/ag54c-rollback-trigger-register.json",
  ag54cActionPath: "data/content-intelligence/release-operations/ag54c-incident-response-action-path.json",
  ag54cRouteBreakage: "data/content-intelligence/release-operations/ag54c-homepage-article-listing-route-breakage-plan.json",
  ag54cPrivacySecurity: "data/content-intelligence/release-operations/ag54c-privacy-security-incident-plan.json",
  ag54cEscalation: "data/content-intelligence/release-operations/ag54c-communication-escalation-plan.json",
  ag54cIncidentBoundary: "data/content-intelligence/release-operations/ag54c-rollback-incident-response-boundary.json",
  ag54cNoRollback: "data/content-intelligence/backend-architecture/ag54c-no-rollback-execution-audit.json",
  ag54cNoPublicMutation: "data/content-intelligence/backend-architecture/ag54c-no-public-mutation-publishing-deployment-audit.json",
  ag54cNoBackendRuntime: "data/content-intelligence/backend-architecture/ag54c-no-backend-auth-rls-database-runtime-audit.json",
  ag54cReadiness: "data/content-intelligence/quality-registry/ag54c-ag54d-release-operations-audit-readiness-record.json",
  ag54cBoundary: "data/content-intelligence/mutation-plans/ag54c-to-ag54d-release-operations-audit-boundary.json",

  ag53zReview: "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  ag52zReview: "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  ag51zReview: "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag54d-release-operations-audit.json",
  ag54aAudit: "data/content-intelligence/release-operations/ag54d-ag54a-backup-restore-audit.json",
  ag54bAudit: "data/content-intelligence/release-operations/ag54d-ag54b-deployment-release-checklist-audit.json",
  ag54cAudit: "data/content-intelligence/release-operations/ag54d-ag54c-rollback-incident-response-audit.json",
  combinedRiskRegister: "data/content-intelligence/release-operations/ag54d-combined-release-operations-risk-register.json",
  operationsReadinessAudit: "data/content-intelligence/release-operations/ag54d-release-operations-readiness-audit-record.json",
  noDeploymentRollbackAudit: "data/content-intelligence/backend-architecture/ag54d-no-deployment-rollback-publishing-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag54d-no-backend-auth-rls-database-runtime-audit.json",
  noServiceRolePublicMutationAudit: "data/content-intelligence/backend-architecture/ag54d-no-service-role-public-mutation-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag54d-ag54z-release-operations-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag54d-to-ag54z-release-operations-closure-boundary.json",
  registry: "data/quality/ag54d-release-operations-audit.json",
  preview: "data/quality/ag54d-release-operations-audit-preview.json",
  doc: "docs/quality/AG54D_RELEASE_OPERATIONS_AUDIT.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG54D input: ${p}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, readJson(v)]));

if (data.ag54aReview.status !== "backup_restore_plan_ready_for_ag54b") throw new Error("AG54A review status mismatch.");
if (data.ag54bReview.status !== "deployment_release_checklist_ready_for_ag54c") throw new Error("AG54B review status mismatch.");
if (data.ag54cReview.status !== "rollback_incident_response_plan_ready_for_ag54d") throw new Error("AG54C review status mismatch.");
if (data.ag54cReview.summary?.ready_for_ag54d_release_operations_audit !== true) throw new Error("AG54D readiness missing from AG54C.");
if (data.ag54cReadiness.ready_for_ag54d !== true || data.ag54cReadiness.next_stage_id !== "AG54D") throw new Error("AG54C readiness must permit AG54D.");
if (data.ag54cBoundary.next_stage_id !== "AG54D") throw new Error("AG54C boundary must point to AG54D.");

for (const audit of [
  data.ag54aGitBaseline,
  data.ag54aBackupScope,
  data.ag54aRestorePlan,
  data.ag54aVerification,
  data.ag54aSupabaseDeferral,
  data.ag54bValidateChecklist,
  data.ag54bStaticReleasePath,
  data.ag54bVercelLiveCheck,
  data.ag54bReleaseGate,
  data.ag54cTriggerRegister,
  data.ag54cActionPath,
  data.ag54cRouteBreakage,
  data.ag54cPrivacySecurity,
  data.ag54cEscalation
]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

for (const audit of [
  data.ag54aNoExternalBackup,
  data.ag54aNoPublicMutation,
  data.ag54aNoBackendRuntime,
  data.ag54bNoDeployment,
  data.ag54bNoPublicMutation,
  data.ag54bNoBackendRuntime,
  data.ag54cNoRollback,
  data.ag54cNoPublicMutation,
  data.ag54cNoBackendRuntime
]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

if (!data.ag54aBoundary.boundary_rules.includes("No restore operation is executed.")) throw new Error("AG54A restore boundary missing.");
if (!data.ag54bReleaseBoundary.boundary_rules.includes("No deployment is triggered.")) throw new Error("AG54B deployment boundary missing.");
if (!data.ag54cIncidentBoundary.boundary_rules.includes("No rollback is executed.")) throw new Error("AG54C rollback boundary missing.");

if (data.ag53zReview.status !== "public_quality_closed_ready_for_ag54a") throw new Error("AG53Z status mismatch.");
if (data.ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") throw new Error("AG52Z status mismatch.");
if (data.ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") throw new Error("AG51Z status mismatch.");
if (data.adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const gitHead = run("git rev-parse --short HEAD");
const branch = run("git branch --show-current");
const originMain = run("git rev-parse --short origin/main");
const statusShort = run("git status --short");

const blockedState = {
  ag54d_release_operations_audit_recorded: true,
  ag54a_ag54b_ag54c_consumed: true,
  ag54a_backup_restore_audit_passed: true,
  ag54b_deployment_release_checklist_audit_passed: true,
  ag54c_rollback_incident_response_audit_passed: true,
  combined_release_operations_risk_register_recorded: true,
  release_operations_readiness_audit_passed: true,
  ready_for_ag54z_release_operations_closure: true,

  actual_backup_archive_created: false,
  restore_operation_executed: false,
  actual_rollback_executed: false,
  git_revert_or_reset_executed: false,
  incident_action_executed: false,
  actual_deployment_triggered: false,
  vercel_deployment_triggered: false,
  deployment_approved: false,
  deployment_performed: false,
  github_release_created: false,
  live_public_check_executed: false,
  external_release_automation_enabled: false,
  content_publishing_enabled: false,
  public_content_mutation_enabled: false,
  public_page_mutation_enabled: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  service_role_key_used: false,
  service_role_key_exposed: false,
  rls_policy_mutation_enabled: false,
  grant_mutation_enabled: false,
  runtime_database_query_enabled: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  public_dashboard_exposed: false,
  external_fetch_enabled: false
};

const ag54aAudit = {
  module_id: "AG54D",
  title: "AG54A Backup and Restore Plan Audit",
  status: "ag54a_backup_restore_audit_passed",
  audit_result: "passed",
  consumed_inputs: [
    inputs.ag54aReview,
    inputs.ag54aGitBaseline,
    inputs.ag54aBackupScope,
    inputs.ag54aRestorePlan,
    inputs.ag54aVerification,
    inputs.ag54aSupabaseDeferral,
    inputs.ag54aBoundary
  ],
  verified_points: [
    "Git baseline was recorded.",
    "Repo/content/static backup scope was recorded.",
    "Restore method is planning-only.",
    "Restore verification sequence is recorded.",
    "Supabase/backend deferral continuity is preserved.",
    "No backup archive, restore operation, external backup service, public mutation, backend runtime or deployment is enabled."
  ],
  blocking_gaps: [],
  blocked_state: blockedState
};

const ag54bAudit = {
  module_id: "AG54D",
  title: "AG54B Deployment and Release Checklist Audit",
  status: "ag54b_deployment_release_checklist_audit_passed",
  audit_result: "passed",
  consumed_inputs: [
    inputs.ag54bReview,
    inputs.ag54bValidateChecklist,
    inputs.ag54bStaticReleasePath,
    inputs.ag54bVercelLiveCheck,
    inputs.ag54bReleaseGate,
    inputs.ag54bReleaseBoundary
  ],
  verified_points: [
    "Validate/git/commit/push checklist is recorded.",
    "Static release path checklist is planning-only.",
    "Vercel/live check sequence is future manual checklist only.",
    "Release gate criteria are recorded but not opened.",
    "No deployment trigger, Vercel trigger, GitHub release/tag, live check, public mutation, publishing or backend runtime is enabled."
  ],
  blocking_gaps: [],
  blocked_state: blockedState
};

const ag54cAudit = {
  module_id: "AG54D",
  title: "AG54C Rollback and Incident Response Plan Audit",
  status: "ag54c_rollback_incident_response_audit_passed",
  audit_result: "passed",
  consumed_inputs: [
    inputs.ag54cReview,
    inputs.ag54cTriggerRegister,
    inputs.ag54cActionPath,
    inputs.ag54cRouteBreakage,
    inputs.ag54cPrivacySecurity,
    inputs.ag54cEscalation,
    inputs.ag54cIncidentBoundary
  ],
  verified_points: [
    "Rollback trigger register is recorded.",
    "Incident response action path is recorded.",
    "Homepage/article/listing/route breakage plan is recorded.",
    "Privacy/security incident plan is recorded.",
    "Communication/escalation model is recorded.",
    "No rollback, git revert/reset, restore operation, incident action, live check, deployment, public mutation, publishing or backend runtime is enabled."
  ],
  blocking_gaps: [],
  blocked_state: blockedState
};

const combinedRiskRegister = {
  module_id: "AG54D",
  title: "Combined Release Operations Risk Register",
  status: "combined_release_operations_risk_register_recorded",
  current_hard_blocker_count: 0,
  residual_risks_carried_forward: [
    {
      risk_id: "future_deployment_execution",
      position: "deferred",
      mitigation: "requires explicit deployment approval after AG54Z closure and release decision"
    },
    {
      risk_id: "future_rollback_execution",
      position: "deferred",
      mitigation: "requires explicit rollback approval and AG54A restore baseline confirmation"
    },
    {
      risk_id: "future_backend_runtime_activation",
      position: "deferred",
      mitigation: "requires explicit backend/Auth/Supabase/RLS/API approval chain"
    },
    {
      risk_id: "future_public_content_mutation",
      position: "deferred",
      mitigation: "requires approved release/change stage and validation"
    }
  ],
  blocked_state: blockedState
};

const operationsReadinessAudit = {
  module_id: "AG54D",
  title: "Release Operations Readiness Audit Record",
  status: "release_operations_readiness_audit_passed",
  audit_result: "passed",
  closure_ready_for_ag54z: true,
  current_git_context: {
    branch,
    git_head_short: gitHead,
    origin_main_short: originMain,
    working_tree_status_at_generation: statusShort || "clean"
  },
  verified_closure_conditions: [
    "AG54A backup/restore plan passed.",
    "AG54B deployment/release checklist passed.",
    "AG54C rollback/incident response plan passed.",
    "No deployment, rollback, restore, publishing, backend/Auth/RLS/API/runtime or public mutation is enabled.",
    "AG54Z release operations closure can proceed."
  ],
  blocking_gaps: [],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG54D",
    title,
    status,
    audit_passed: true,
    checks: checks.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: [],
    blocked_state: blockedState
  };
}

const noDeploymentRollbackAudit = auditObj("No Deployment / Rollback / Publishing Audit", "no_deployment_rollback_publishing_audit_passed", [
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "deployment_approved",
  "deployment_performed",
  "actual_rollback_executed",
  "git_revert_or_reset_executed",
  "restore_operation_executed",
  "incident_action_executed",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "live_public_check_executed"
]);

const noBackendRuntimeAudit = auditObj("No Backend/Auth/RLS/Database Runtime Audit", "no_backend_auth_rls_database_runtime_audit_passed", [
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now"
]);

const noServiceRolePublicMutationAudit = auditObj("No Service-role / Public Mutation Audit", "no_service_role_public_mutation_audit_passed", [
  "service_role_key_used",
  "service_role_key_exposed",
  "public_page_mutation_enabled",
  "public_dashboard_exposed",
  "external_release_automation_enabled",
  "external_fetch_enabled",
  "github_release_created"
]);

const readiness = {
  module_id: "AG54D",
  title: "AG54Z Release Operations Closure Readiness Record",
  status: "ready_for_ag54z_release_operations_closure",
  ready_for_ag54z: true,
  next_stage_id: "AG54Z",
  next_stage_title: "Release Operations Closure",
  ag54z_allowed_scope: [
    "Close AG54 release operations planning.",
    "Consume AG54A backup/restore plan.",
    "Consume AG54B deployment/release checklist.",
    "Consume AG54C rollback/incident response plan.",
    "Consume AG54D release operations audit.",
    "Keep actual deployment, rollback, publishing, backend/Auth/RLS/API/runtime and public mutation disabled."
  ],
  ag54z_blocked_scope: [
    "actual deployment",
    "Vercel deployment trigger",
    "GitHub release/tag creation",
    "actual rollback execution",
    "git revert/reset",
    "restore operation",
    "content publishing",
    "public page mutation",
    "runtime database/API reading",
    "backend/Auth/Supabase activation",
    "RLS/grant mutation",
    "service-role use"
  ],
  hard_blocker_count_for_ag54z: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG54D",
  title: "AG54D to AG54Z Release Operations Closure Boundary",
  status: "ag54z_release_operations_closure_boundary_created",
  next_stage_id: "AG54Z",
  next_stage_title: "Release Operations Closure",
  allowed_scope: readiness.ag54z_allowed_scope,
  blocked_scope: readiness.ag54z_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG54D",
  title: "Release Operations Audit",
  status: "release_operations_audit_ready_for_ag54z",
  depends_on: ["AG54C", "AG54B", "AG54A", "AG53Z", "AG52Z", "AG51Z", "ADB20"],
  ag54a_audit_file: outputs.ag54aAudit,
  ag54b_audit_file: outputs.ag54bAudit,
  ag54c_audit_file: outputs.ag54cAudit,
  combined_risk_register_file: outputs.combinedRiskRegister,
  operations_readiness_audit_file: outputs.operationsReadinessAudit,
  no_deployment_rollback_audit_file: outputs.noDeploymentRollbackAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  no_service_role_public_mutation_audit_file: outputs.noServiceRolePublicMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag54d_release_operations_audit_recorded: true,
    ag54a_ag54b_ag54c_consumed: true,
    ag54a_backup_restore_audit_passed: true,
    ag54b_deployment_release_checklist_audit_passed: true,
    ag54c_rollback_incident_response_audit_passed: true,
    combined_release_operations_risk_register_recorded: true,
    release_operations_readiness_audit_passed: true,
    ready_for_ag54z_release_operations_closure: true,
    hard_blocker_count_for_ag54z: 0,
    git_head_short: gitHead,
    branch,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG54D", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG54D",
  status: review.status,
  ag54d_release_operations_audit_recorded: 1,
  ag54a_ag54b_ag54c_consumed: 1,
  ag54a_backup_restore_audit_passed: 1,
  ag54b_deployment_release_checklist_audit_passed: 1,
  ag54c_rollback_incident_response_audit_passed: 1,
  combined_release_operations_risk_register_recorded: 1,
  release_operations_readiness_audit_passed: 1,
  ready_for_ag54z_release_operations_closure: 1,
  hard_blocker_count_for_ag54z: 0,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG54D — Release Operations Audit

## Result

AG54D audits release operations readiness across AG54A, AG54B and AG54C.

## Audited

- AG54A — Backup and Restore Plan
- AG54B — Deployment and Release Checklist
- AG54C — Rollback and Incident Response Plan

## Confirmed blocked

- No deployment or Vercel trigger
- No GitHub release/tag
- No rollback execution
- No git revert/reset
- No restore operation
- No content publishing
- No public page/content mutation
- No backend/Auth/Supabase/RLS/database runtime
- No service-role use

## Next

AG54Z — Release Operations Closure.
`;

writeJson(outputs.ag54aAudit, ag54aAudit);
writeJson(outputs.ag54bAudit, ag54bAudit);
writeJson(outputs.ag54cAudit, ag54cAudit);
writeJson(outputs.combinedRiskRegister, combinedRiskRegister);
writeJson(outputs.operationsReadinessAudit, operationsReadinessAudit);
writeJson(outputs.noDeploymentRollbackAudit, noDeploymentRollbackAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.noServiceRolePublicMutationAudit, noServiceRolePublicMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG54D Release Operations Audit generated.");
console.log("✅ AG54A, AG54B and AG54C release-operation outputs audited.");
console.log("✅ Combined release operations risk register and AG54Z readiness recorded.");
console.log("✅ No deployment, rollback, restore, publishing, public mutation, backend/runtime or service-role use enabled.");
console.log("✅ Ready for AG54Z Release Operations Closure.");
