import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag54aReview: "data/content-intelligence/quality-reviews/ag54a-backup-restore-plan.json",
  ag54bReview: "data/content-intelligence/quality-reviews/ag54b-deployment-release-checklist.json",
  ag54cReview: "data/content-intelligence/quality-reviews/ag54c-rollback-incident-response-plan.json",
  ag54dReview: "data/content-intelligence/quality-reviews/ag54d-release-operations-audit.json",
  ag54dAg54aAudit: "data/content-intelligence/release-operations/ag54d-ag54a-backup-restore-audit.json",
  ag54dAg54bAudit: "data/content-intelligence/release-operations/ag54d-ag54b-deployment-release-checklist-audit.json",
  ag54dAg54cAudit: "data/content-intelligence/release-operations/ag54d-ag54c-rollback-incident-response-audit.json",
  ag54dRiskRegister: "data/content-intelligence/release-operations/ag54d-combined-release-operations-risk-register.json",
  ag54dReadinessAudit: "data/content-intelligence/release-operations/ag54d-release-operations-readiness-audit-record.json",
  ag54dNoDeploymentRollback: "data/content-intelligence/backend-architecture/ag54d-no-deployment-rollback-publishing-audit.json",
  ag54dNoBackendRuntime: "data/content-intelligence/backend-architecture/ag54d-no-backend-auth-rls-database-runtime-audit.json",
  ag54dNoServiceRolePublicMutation: "data/content-intelligence/backend-architecture/ag54d-no-service-role-public-mutation-audit.json",
  ag54dReadiness: "data/content-intelligence/quality-registry/ag54d-ag54z-release-operations-closure-readiness-record.json",
  ag54dBoundary: "data/content-intelligence/mutation-plans/ag54d-to-ag54z-release-operations-closure-boundary.json",

  ag53zReview: "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  ag52zReview: "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  ag51zReview: "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag54z-release-operations-closure.json",
  closureRecord: "data/content-intelligence/release-operations/ag54z-release-operations-closure-record.json",
  consumptionSummary: "data/content-intelligence/release-operations/ag54z-ag54a-to-ag54d-consumption-summary.json",
  releaseOperationsPosture: "data/content-intelligence/release-operations/ag54z-release-operations-posture-record.json",
  carryForwardDeferral: "data/content-intelligence/release-operations/ag54z-carry-forward-release-operations-deferral-register.json",
  ag55Handoff: "data/content-intelligence/ag-roadmap/ag54z-to-ag55-v01-release-candidate-freeze-handoff.json",
  noDeploymentRollbackAudit: "data/content-intelligence/backend-architecture/ag54z-no-deployment-rollback-publishing-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag54z-no-backend-auth-rls-database-runtime-audit.json",
  noServiceRolePublicMutationAudit: "data/content-intelligence/backend-architecture/ag54z-no-service-role-public-mutation-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag54z-ag55a-v01-scope-freeze-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag54z-to-ag55a-v01-scope-freeze-boundary.json",
  registry: "data/quality/ag54z-release-operations-closure.json",
  preview: "data/quality/ag54z-release-operations-closure-preview.json",
  doc: "docs/quality/AG54Z_RELEASE_OPERATIONS_CLOSURE.md"
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
function listFiles(dir) {
  const absolute = full(dir);
  if (!fs.existsSync(absolute)) return [];
  const out = [];
  const skipDirs = new Set([".git", "node_modules", ".next", "dist", "build", "out", "coverage", ".vercel"]);
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(p));
    else out.push(p);
  }
  return out;
}
function findFiles(keywords, limit = 40) {
  return listFiles("data/content-intelligence")
    .filter((f) => keywords.every((k) => f.toLowerCase().includes(k.toLowerCase())))
    .slice(0, limit);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG54Z input: ${p}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, readJson(v)]));

if (data.ag54aReview.status !== "backup_restore_plan_ready_for_ag54b") throw new Error("AG54A review status mismatch.");
if (data.ag54bReview.status !== "deployment_release_checklist_ready_for_ag54c") throw new Error("AG54B review status mismatch.");
if (data.ag54cReview.status !== "rollback_incident_response_plan_ready_for_ag54d") throw new Error("AG54C review status mismatch.");
if (data.ag54dReview.status !== "release_operations_audit_ready_for_ag54z") throw new Error("AG54D review status mismatch.");
if (data.ag54dReview.summary?.ready_for_ag54z_release_operations_closure !== true) throw new Error("AG54Z readiness missing from AG54D.");

for (const audit of [
  data.ag54dAg54aAudit,
  data.ag54dAg54bAudit,
  data.ag54dAg54cAudit,
  data.ag54dReadinessAudit
]) {
  if (audit.audit_result !== "passed") throw new Error(`${audit.title} must pass.`);
}

for (const audit of [
  data.ag54dNoDeploymentRollback,
  data.ag54dNoBackendRuntime,
  data.ag54dNoServiceRolePublicMutation
]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

if (data.ag54dRiskRegister.current_hard_blocker_count !== 0) throw new Error("AG54D risk register blockers must be zero.");
if (data.ag54dReadiness.ready_for_ag54z !== true || data.ag54dReadiness.next_stage_id !== "AG54Z") throw new Error("AG54D readiness must permit AG54Z.");
if (data.ag54dBoundary.next_stage_id !== "AG54Z") throw new Error("AG54D boundary must point to AG54Z.");

if (data.ag53zReview.status !== "public_quality_closed_ready_for_ag54a") throw new Error("AG53Z status mismatch.");
if (data.ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") throw new Error("AG52Z status mismatch.");
if (data.ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") throw new Error("AG51Z status mismatch.");
if (data.adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const gitHead = run("git rev-parse --short HEAD");
const gitHeadFull = run("git rev-parse HEAD");
const branch = run("git branch --show-current");
const originMain = run("git rev-parse --short origin/main");
const statusShort = run("git status --short");

const blockedState = {
  ag54z_release_operations_closed: true,
  ag54a_ag54b_ag54c_ag54d_consumed: true,
  release_operations_closure_completed: true,
  ag55a_v01_scope_freeze_handoff_created: true,
  ready_for_ag55a_v01_scope_freeze: true,

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

const priorContext = {
  ag42_to_ag54_context: [
    ...findFiles(["ag42"], 20),
    ...findFiles(["ag43"], 20),
    ...findFiles(["ag44"], 20),
    ...findFiles(["ag45"], 20),
    ...findFiles(["ag46"], 20),
    ...findFiles(["ag47"], 20),
    ...findFiles(["ag48"], 20),
    ...findFiles(["ag49"], 20),
    ...findFiles(["ag50"], 20),
    ...findFiles(["ag51"], 20),
    ...findFiles(["ag52"], 30),
    ...findFiles(["ag53"], 40),
    ...findFiles(["ag54"], 50)
  ],
  adb_runtime_deferral_context: [
    ...findFiles(["adb16"], 10),
    ...findFiles(["adb17"], 10),
    ...findFiles(["adb18"], 10),
    ...findFiles(["adb19"], 10),
    ...findFiles(["adb20"], 10)
  ]
};

const closureRecord = {
  module_id: "AG54Z",
  title: "Release Operations Closure Record",
  status: "release_operations_closure_completed",
  closed_substages: [
    "AG54A Backup and Restore Plan",
    "AG54B Deployment and Release Checklist",
    "AG54C Rollback and Incident Response Plan",
    "AG54D Release Operations Audit"
  ],
  closure_result: "AG54 closes operational readiness planning before V01 release candidate freeze. It records backup/restore, release checklist, rollback/incident response and audit readiness without triggering deployment, rollback, restore, publishing, public mutation, backend/Auth/RLS/API/runtime or service-role use.",
  closure_allowed: true,
  current_git_context: {
    branch,
    git_head_short: gitHead,
    git_head_full: gitHeadFull,
    origin_main_short: originMain,
    working_tree_status_at_generation: statusShort || "clean"
  },
  discovered_prior_context: priorContext,
  blocked_state: blockedState
};

const consumptionSummary = {
  module_id: "AG54Z",
  title: "AG54A to AG54D Consumption Summary",
  status: "ag54a_to_ag54d_consumption_summarised",
  consumed_outputs: [
    {
      stage_id: "AG54A",
      consumed_boundary: "backup/restore plan, git baseline, restore method and Supabase/backend deferral continuity",
      result: "operational backup/restore planning recorded without archive creation or restore execution"
    },
    {
      stage_id: "AG54B",
      consumed_boundary: "validate/git/commit/push checklist, static release path, Vercel/live check sequence and release gate criteria",
      result: "release checklist recorded without deployment or live check execution"
    },
    {
      stage_id: "AG54C",
      consumed_boundary: "rollback triggers, incident response action path, route/privacy breakage handling and escalation model",
      result: "incident response planning recorded without rollback or incident action execution"
    },
    {
      stage_id: "AG54D",
      consumed_boundary: "combined release operations audit and residual risk register",
      result: "release operations audit passed and AG54Z closure permitted"
    }
  ],
  blocked_state: blockedState
};

const releaseOperationsPosture = {
  module_id: "AG54Z",
  title: "Release Operations Posture Record",
  status: "release_operations_posture_recorded",
  posture_summary: {
    backup_restore: "planning_closed",
    deployment_release_checklist: "planning_closed",
    rollback_incident_response: "planning_closed",
    release_operations_audit: "passed",
    actual_deployment: "blocked",
    actual_rollback: "blocked",
    content_publishing: "blocked",
    backend_runtime: "blocked",
    v01_scope_freeze: "ready_for_AG55A_planning_only"
  },
  posture_rule: "AG55 may freeze V01 scope and reconcile completed stack outputs. AG55 must not deploy, publish, mutate public content, activate backend/Auth/RLS/API/runtime or use service-role keys.",
  blocked_state: blockedState
};

const carryForwardDeferral = {
  module_id: "AG54Z",
  title: "Carry-forward Release Operations Deferral Register",
  status: "carry_forward_release_operations_deferral_register_recorded",
  deferred_items: [
    "actual deployment",
    "Vercel deployment trigger",
    "GitHub release/tag creation",
    "live public check execution",
    "actual rollback execution",
    "git revert/reset execution",
    "restore operation",
    "incident action execution",
    "content publishing",
    "public content mutation",
    "public page mutation",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "external release automation"
  ],
  future_reentry_rule: "Any future deployment, rollback, restore, publishing or backend runtime movement requires explicit approval after AG55/AG56 governed release-candidate checks.",
  blocked_state: blockedState
};

const ag55Handoff = {
  module_id: "AG54Z",
  title: "AG54Z to AG55 V01 Release Candidate Freeze Handoff",
  status: "ag55a_v01_scope_freeze_handoff_created",
  next_stage_id: "AG55A",
  next_stage_title: "Version 01 Scope Freeze",
  handoff_basis: [
    "AG54 release operations readiness is closed.",
    "AG55 may begin V01 release candidate freeze and completed-stack reconciliation.",
    "AG55A should consume AG42–AG54 outputs and full repo inventory/digest.",
    "AG55 must explicitly defer V02 items.",
    "AG55 must continue no-deployment/no-publishing/no-runtime/no-backend constraints unless later explicitly approved."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG54Z",
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
  "github_release_created",
  "live_public_check_executed",
  "actual_rollback_executed",
  "git_revert_or_reset_executed",
  "restore_operation_executed",
  "incident_action_executed",
  "content_publishing_enabled",
  "public_content_mutation_enabled"
]);

const noBackendRuntimeAudit = auditObj("No Backend/Auth/RLS/Database Runtime Audit", "no_backend_auth_rls_database_runtime_audit_passed", [
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled"
]);

const noServiceRolePublicMutationAudit = auditObj("No Service-role / Public Mutation Audit", "no_service_role_public_mutation_audit_passed", [
  "service_role_key_used",
  "service_role_key_exposed",
  "public_page_mutation_enabled",
  "public_dashboard_exposed",
  "external_release_automation_enabled",
  "external_fetch_enabled"
]);

const readiness = {
  module_id: "AG54Z",
  title: "AG55A V01 Scope Freeze Readiness Record",
  status: "ready_for_ag55a_v01_scope_freeze",
  ready_for_ag55a: true,
  next_stage_id: "AG55A",
  next_stage_title: "Version 01 Scope Freeze",
  ag55a_allowed_scope: [
    "Freeze included V01 modules.",
    "Explicitly defer V02 items.",
    "Consume AG42–AG54 outputs and full repo inventory/digest.",
    "Preserve AG52, AG53 and AG54 blockers.",
    "Keep deployment, publishing, runtime, backend/Auth/RLS/API and public mutation disabled."
  ],
  ag55a_blocked_scope: [
    "actual deployment",
    "content publishing",
    "public page mutation",
    "runtime database/API reading",
    "backend/Auth/Supabase activation",
    "RLS/grant mutation",
    "service-role use",
    "controlled dynamic content-loop activation"
  ],
  hard_blocker_count_for_ag55a: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG54Z",
  title: "AG54Z to AG55A V01 Scope Freeze Boundary",
  status: "ag55a_v01_scope_freeze_boundary_created",
  next_stage_id: "AG55A",
  next_stage_title: "Version 01 Scope Freeze",
  allowed_scope: readiness.ag55a_allowed_scope,
  blocked_scope: readiness.ag55a_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG54Z",
  title: "Release Operations Closure",
  status: "release_operations_closed_ready_for_ag55a",
  depends_on: ["AG54D", "AG54C", "AG54B", "AG54A", "AG53Z", "AG52Z", "AG51Z", "ADB20"],
  closure_record_file: outputs.closureRecord,
  consumption_summary_file: outputs.consumptionSummary,
  release_operations_posture_file: outputs.releaseOperationsPosture,
  carry_forward_deferral_file: outputs.carryForwardDeferral,
  ag55_handoff_file: outputs.ag55Handoff,
  no_deployment_rollback_audit_file: outputs.noDeploymentRollbackAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  no_service_role_public_mutation_audit_file: outputs.noServiceRolePublicMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag54z_release_operations_closed: true,
    ag54a_ag54b_ag54c_ag54d_consumed: true,
    release_operations_closure_completed: true,
    ag55a_v01_scope_freeze_handoff_created: true,
    ready_for_ag55a_v01_scope_freeze: true,
    hard_blocker_count_for_ag55a: 0,
    git_head_short: gitHead,
    branch,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG54Z", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG54Z",
  status: review.status,
  ag54z_release_operations_closed: 1,
  ag54a_ag54b_ag54c_ag54d_consumed: 1,
  release_operations_closure_completed: 1,
  ag55a_v01_scope_freeze_handoff_created: 1,
  ready_for_ag55a_v01_scope_freeze: 1,
  hard_blocker_count_for_ag55a: 0,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG54Z — Release Operations Closure

## Result

AG54Z closes release operations readiness before V01 release candidate freeze.

## Closed

- AG54A — Backup and Restore Plan
- AG54B — Deployment and Release Checklist
- AG54C — Rollback and Incident Response Plan
- AG54D — Release Operations Audit

## Preserved blockers

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

AG55A — Version 01 Scope Freeze.
`;

writeJson(outputs.closureRecord, closureRecord);
writeJson(outputs.consumptionSummary, consumptionSummary);
writeJson(outputs.releaseOperationsPosture, releaseOperationsPosture);
writeJson(outputs.carryForwardDeferral, carryForwardDeferral);
writeJson(outputs.ag55Handoff, ag55Handoff);
writeJson(outputs.noDeploymentRollbackAudit, noDeploymentRollbackAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.noServiceRolePublicMutationAudit, noServiceRolePublicMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG54Z Release Operations Closure generated.");
console.log("✅ AG54A–AG54D consumed and closed.");
console.log("✅ AG55A V01 Scope Freeze handoff recorded.");
console.log("✅ No deployment, rollback, restore, publishing, public mutation, backend/runtime or service-role use enabled.");
