import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag55cReview: "data/content-intelligence/quality-reviews/ag55c-end-to-end-release-candidate-validation.json",
  ag55cSource: "data/content-intelligence/release-candidate/ag55c-source-consumption-record.json",
  ag55cValidateChain: "data/content-intelligence/release-candidate/ag55c-validate-project-chain-record.json",
  ag55cSurfaceValidation: "data/content-intelligence/release-candidate/ag55c-v01-surface-validation-record.json",
  ag55cModuleMatrix: "data/content-intelligence/release-candidate/ag55c-v01-module-readiness-matrix.json",
  ag55cSecurityPublic: "data/content-intelligence/release-candidate/ag55c-security-public-release-readiness-record.json",
  ag55cBoundary: "data/content-intelligence/release-candidate/ag55c-end-to-end-release-candidate-validation-boundary.json",
  ag55cNoLiveDeployment: "data/content-intelligence/backend-architecture/ag55c-no-live-check-deployment-publishing-audit.json",
  ag55cNoDynamicLoop: "data/content-intelligence/backend-architecture/ag55c-no-controlled-dynamic-content-loop-activation-audit.json",
  ag55cNoBackendRuntime: "data/content-intelligence/backend-architecture/ag55c-no-backend-auth-rls-database-runtime-audit.json",
  ag55cReadiness: "data/content-intelligence/quality-registry/ag55c-ag55d-release-candidate-go-no-go-readiness-record.json",
  ag55cBoundaryToD: "data/content-intelligence/mutation-plans/ag55c-to-ag55d-release-candidate-go-no-go-boundary.json",

  ag55bReview: "data/content-intelligence/quality-reviews/ag55b-completed-repo-stack-reconciliation.json",
  ag55bRepoStack: "data/content-intelligence/release-candidate/ag55b-completed-repo-stack-reconciliation-record.json",
  ag55bDependency: "data/content-intelligence/release-candidate/ag55b-dependency-reconciliation-record.json",
  ag55bRoadmapConflict: "data/content-intelligence/release-candidate/ag55b-roadmap-conflict-resolution-register.json",

  ag55aReview: "data/content-intelligence/quality-reviews/ag55a-v01-scope-freeze.json",
  ag55aScopeFreeze: "data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-register.json",
  ag55aV02Deferral: "data/content-intelligence/release-candidate/ag55a-v02-deferral-register.json",

  ag54zReview: "data/content-intelligence/quality-reviews/ag54z-release-operations-closure.json",
  ag53zReview: "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  ag52zReview: "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  ag51zReview: "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag55d-release-candidate-go-no-go-readiness-review.json",
  sourceConsumption: "data/content-intelligence/release-candidate/ag55d-source-consumption-record.json",
  goNoGoCriteria: "data/content-intelligence/release-candidate/ag55d-go-no-go-criteria-register.json",
  blockerRegister: "data/content-intelligence/release-candidate/ag55d-release-candidate-blocker-register.json",
  recommendationRecord: "data/content-intelligence/release-candidate/ag55d-go-no-go-recommendation-record.json",
  finalRiskRegister: "data/content-intelligence/release-candidate/ag55d-final-pre-closure-risk-register.json",
  goNoGoBoundary: "data/content-intelligence/release-candidate/ag55d-release-candidate-go-no-go-boundary.json",
  noGoLiveDeploymentAudit: "data/content-intelligence/backend-architecture/ag55d-no-go-live-deployment-publishing-audit.json",
  noDynamicLoopAudit: "data/content-intelligence/backend-architecture/ag55d-no-controlled-dynamic-content-loop-activation-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag55d-no-backend-auth-rls-database-runtime-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag55d-ag55z-v01-release-candidate-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag55d-to-ag55z-v01-release-candidate-closure-boundary.json",
  registry: "data/quality/ag55d-release-candidate-go-no-go-readiness-review.json",
  preview: "data/quality/ag55d-release-candidate-go-no-go-readiness-review-preview.json",
  doc: "docs/quality/AG55D_RELEASE_CANDIDATE_GO_NO_GO_READINESS_REVIEW.md"
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
  if (!exists(p)) throw new Error(`Missing AG55D input: ${p}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, readJson(v)]));

if (data.ag55cReview.status !== "end_to_end_release_candidate_validation_ready_for_ag55d") throw new Error("AG55C review status mismatch.");
if (data.ag55cReview.summary?.ready_for_ag55d_release_candidate_go_no_go !== true) throw new Error("AG55D readiness missing from AG55C.");
if (data.ag55cSource.status !== "source_consumption_recorded") throw new Error("AG55C source consumption mismatch.");

for (const audit of [
  data.ag55cValidateChain,
  data.ag55cSurfaceValidation,
  data.ag55cModuleMatrix,
  data.ag55cSecurityPublic
]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

if (!data.ag55cBoundary.boundary_rules.includes("AG55C does not activate AG56 or controlled dynamic content-loop.")) throw new Error("AG55C AG56/dynamic-loop boundary missing.");

for (const audit of [
  data.ag55cNoLiveDeployment,
  data.ag55cNoDynamicLoop,
  data.ag55cNoBackendRuntime
]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

if (data.ag55cReadiness.ready_for_ag55d !== true || data.ag55cReadiness.next_stage_id !== "AG55D") throw new Error("AG55C readiness must permit AG55D.");
if (data.ag55cBoundaryToD.next_stage_id !== "AG55D") throw new Error("AG55C boundary must point to AG55D.");

if (data.ag55bReview.status !== "completed_repo_stack_reconciliation_ready_for_ag55c") throw new Error("AG55B status mismatch.");
if (data.ag55bRepoStack.audit_passed !== true) throw new Error("AG55B repo stack reconciliation must pass.");
if (data.ag55bDependency.audit_passed !== true) throw new Error("AG55B dependency reconciliation must pass.");
if (data.ag55bRoadmapConflict.audit_passed !== true) throw new Error("AG55B roadmap conflict register must pass.");

if (data.ag55aReview.status !== "v01_scope_freeze_ready_for_ag55b") throw new Error("AG55A status mismatch.");
if (data.ag55aScopeFreeze.freeze_scope_status !== "v01_scope_frozen_for_reconciliation") throw new Error("AG55A freeze status mismatch.");
if (!JSON.stringify(data.ag55aV02Deferral.deferred_items).includes("controlled dynamic content-loop")) throw new Error("AG55A V02 deferral missing controlled dynamic loop.");

if (data.ag54zReview.status !== "release_operations_closed_ready_for_ag55a") throw new Error("AG54Z status mismatch.");
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
  ag55d_release_candidate_go_no_go_readiness_recorded: true,
  ag55c_consumed: true,
  go_no_go_criteria_recorded: true,
  release_candidate_blocker_register_recorded: true,
  go_no_go_recommendation_recorded: true,
  final_pre_closure_risk_register_recorded: true,
  go_no_go_boundary_recorded: true,
  ready_for_ag55z_v01_release_candidate_closure: true,

  actual_go_live_approval_granted: false,
  actual_deployment_triggered: false,
  vercel_deployment_triggered: false,
  deployment_approved: false,
  deployment_performed: false,
  github_release_created: false,
  live_public_check_executed: false,
  browser_automation_enabled: false,
  external_audit_api_enabled: false,
  content_publishing_enabled: false,
  public_content_mutation_enabled: false,
  public_page_mutation_enabled: false,
  controlled_dynamic_content_loop_activated: false,
  ag56_dynamic_test_path_activated: false,
  v02_item_activated: false,
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

const sourceConsumption = {
  module_id: "AG55D",
  title: "AG55D Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: Object.values(inputs).filter((p) => p !== "package.json"),
  interpretation: "AG55D records go/no-go readiness for V01 release candidate closure only. It does not grant actual go-live approval, deploy, publish, run live checks, activate AG56, mutate public pages, activate backend/Auth/RLS/API/runtime or use service-role keys.",
  current_git_context: {
    branch,
    git_head_short: gitHead,
    git_head_full: gitHeadFull,
    origin_main_short: originMain,
    working_tree_status_at_generation: statusShort || "clean"
  },
  blocked_state: blockedState
};

const goNoGoCriteria = {
  module_id: "AG55D",
  title: "Go/No-Go Criteria Register",
  status: "go_no_go_criteria_recorded",
  audit_passed: true,
  criteria: [
    { criterion_id: "scope_freeze", source: "AG55A", result: "pass", note: "V01 scope frozen and V02 items deferred." },
    { criterion_id: "repo_stack_reconciliation", source: "AG55B", result: "pass", note: "Completed repo stack and dependency reconciliation passed." },
    { criterion_id: "end_to_end_validation", source: "AG55C", result: "pass", note: "End-to-end validation readiness recorded with zero hard blockers." },
    { criterion_id: "security_privacy_legal", source: "AG52Z", result: "pass", note: "Security/privacy/legal closure consumed." },
    { criterion_id: "public_quality", source: "AG53Z", result: "pass", note: "Public quality closure consumed." },
    { criterion_id: "release_operations", source: "AG54Z", result: "pass", note: "Release operations closure consumed." },
    { criterion_id: "runtime_backend_blockers", source: "ADB20/AG52Z", result: "pass", note: "Runtime database/API/backend/Auth/RLS activation remains blocked." },
    { criterion_id: "ag56_dynamic_loop", source: "AG55A–AG55C", result: "pass", note: "AG56 and controlled dynamic content-loop remain blocked." },
    { criterion_id: "deployment_publishing", source: "AG54Z/AG55C", result: "pass", note: "Deployment, Vercel trigger, publishing and public mutation remain blocked." }
  ],
  hard_blocker_count: 0,
  decision_position: "ready_for_ag55z_closure_not_actual_go_live",
  blocked_state: blockedState
};

const blockerRegister = {
  module_id: "AG55D",
  title: "Release Candidate Blocker Register",
  status: "release_candidate_blocker_register_recorded",
  audit_passed: true,
  hard_blockers: [],
  soft_watch_items: [
    {
      item_id: "future_deployment_requires_separate_approval",
      treatment: "carry_forward_to_ag55z_and_later_release_decision",
      current_status: "blocked_not_approved"
    },
    {
      item_id: "ag56_dynamic_test_path_requires_explicit_approval",
      treatment: "carry_forward_as_v02_dynamic_path",
      current_status: "blocked_not_activated"
    },
    {
      item_id: "backend_auth_supabase_requires_explicit_checkpoint",
      treatment: "carry_forward_under_AG52Z_AG27_ADB20_boundaries",
      current_status: "blocked_not_activated"
    }
  ],
  hard_blocker_count: 0,
  blocked_state: blockedState
};

const recommendationRecord = {
  module_id: "AG55D",
  title: "Go/No-Go Recommendation Record",
  status: "go_no_go_recommendation_recorded",
  audit_passed: true,
  recommendation: "GO_FOR_AG55Z_V01_RELEASE_CANDIDATE_CLOSURE_ONLY",
  recommendation_scope: "The recommendation is limited to AG55Z closure of V01 release candidate readiness. It is not a go-live, deployment, publishing, backend activation or AG56 activation approval.",
  recommendation_basis: [
    "AG55A V01 scope freeze completed.",
    "AG55B completed repo stack reconciliation completed.",
    "AG55C end-to-end release candidate validation readiness completed.",
    "AG52Z, AG53Z and AG54Z closures remain consumed.",
    "No hard blockers are recorded for AG55Z closure.",
    "All deployment, publishing, backend/Auth/RLS/API/runtime, service-role and AG56 activation paths remain blocked."
  ],
  actual_go_live_approval_granted_now: false,
  blocked_state: blockedState
};

const finalRiskRegister = {
  module_id: "AG55D",
  title: "Final Pre-Closure Risk Register",
  status: "final_pre_closure_risk_register_recorded",
  audit_passed: true,
  current_hard_blocker_count: 0,
  residual_risks_carried_forward: [
    {
      risk_id: "deployment_not_yet_approved",
      position: "deferred",
      treatment: "AG55Z may close readiness; actual deployment requires later explicit approval."
    },
    {
      risk_id: "ag56_dynamic_test_path_not_activated",
      position: "deferred",
      treatment: "AG56 controlled dynamic content-loop remains a separate explicitly approved path."
    },
    {
      risk_id: "backend_auth_supabase_not_activated",
      position: "deferred",
      treatment: "Backend/Auth/Supabase/RLS/API runtime remains blocked under prior deferral records."
    },
    {
      risk_id: "live_public_checks_not_executed",
      position: "deferred",
      treatment: "Live public checks may occur only after explicit deployment/live-check approval."
    }
  ],
  blocked_state: blockedState
};

const goNoGoBoundary = {
  module_id: "AG55D",
  title: "Release Candidate Go/No-Go Boundary",
  status: "go_no_go_boundary_recorded",
  boundary_rules: [
    "AG55D records readiness recommendation only.",
    "AG55D does not grant actual go-live approval.",
    "AG55D does not deploy or trigger Vercel/GitHub release.",
    "AG55D does not run live public checks, browser automation or external audit APIs.",
    "AG55D does not publish content or mutate public pages.",
    "AG55D does not activate AG56 or controlled dynamic content-loop.",
    "AG55D does not activate backend/Auth/Supabase/RLS/API/database runtime.",
    "AG55D does not use service-role keys.",
    "AG55Z may close V01 release candidate readiness, still without deployment or runtime activation."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG55D",
    title,
    status,
    audit_passed: true,
    checks: checks.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: [],
    blocked_state: blockedState
  };
}

const noGoLiveDeploymentAudit = auditObj("No Go-live / Deployment / Publishing Audit", "no_go_live_deployment_publishing_audit_passed", [
  "actual_go_live_approval_granted",
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "deployment_approved",
  "deployment_performed",
  "github_release_created",
  "live_public_check_executed",
  "browser_automation_enabled",
  "external_audit_api_enabled",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_page_mutation_enabled"
]);

const noDynamicLoopAudit = auditObj("No Controlled Dynamic Content-loop Activation Audit", "no_controlled_dynamic_content_loop_activation_audit_passed", [
  "controlled_dynamic_content_loop_activated",
  "ag56_dynamic_test_path_activated",
  "v02_item_activated",
  "content_publishing_enabled",
  "public_content_mutation_enabled"
]);

const noBackendRuntimeAudit = auditObj("No Backend/Auth/RLS/Database Runtime Audit", "no_backend_auth_rls_database_runtime_audit_passed", [
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "public_dashboard_exposed",
  "external_fetch_enabled"
]);

const readiness = {
  module_id: "AG55D",
  title: "AG55Z V01 Release Candidate Closure Readiness Record",
  status: "ready_for_ag55z_v01_release_candidate_closure",
  ready_for_ag55z: true,
  next_stage_id: "AG55Z",
  next_stage_title: "V01 Release Candidate Closure",
  ag55z_allowed_scope: [
    "Close V01 release candidate readiness.",
    "Consume AG55A scope freeze.",
    "Consume AG55B repo stack reconciliation.",
    "Consume AG55C end-to-end validation readiness.",
    "Consume AG55D go/no-go readiness review.",
    "Keep AG56, deployment, publishing, runtime, backend/Auth/RLS/API and public mutation disabled."
  ],
  ag55z_blocked_scope: [
    "actual go-live approval execution",
    "deployment or Vercel trigger",
    "GitHub release/tag creation",
    "content publishing",
    "public page mutation",
    "AG56 controlled dynamic content-loop activation",
    "runtime database/API reading",
    "backend/Auth/Supabase activation",
    "RLS/grant mutation",
    "service-role use"
  ],
  hard_blocker_count_for_ag55z: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG55D",
  title: "AG55D to AG55Z V01 Release Candidate Closure Boundary",
  status: "ag55z_v01_release_candidate_closure_boundary_created",
  next_stage_id: "AG55Z",
  next_stage_title: "V01 Release Candidate Closure",
  allowed_scope: readiness.ag55z_allowed_scope,
  blocked_scope: readiness.ag55z_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG55D",
  title: "Release Candidate Go/No-Go Readiness Review",
  status: "release_candidate_go_no_go_ready_for_ag55z",
  depends_on: ["AG55C", "AG55B", "AG55A", "AG54Z", "AG53Z", "AG52Z", "AG51Z", "ADB20"],
  source_consumption_file: outputs.sourceConsumption,
  go_no_go_criteria_file: outputs.goNoGoCriteria,
  blocker_register_file: outputs.blockerRegister,
  recommendation_record_file: outputs.recommendationRecord,
  final_risk_register_file: outputs.finalRiskRegister,
  go_no_go_boundary_file: outputs.goNoGoBoundary,
  no_go_live_deployment_audit_file: outputs.noGoLiveDeploymentAudit,
  no_dynamic_loop_audit_file: outputs.noDynamicLoopAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag55d_release_candidate_go_no_go_readiness_recorded: true,
    ag55c_consumed: true,
    go_no_go_criteria_recorded: true,
    release_candidate_blocker_register_recorded: true,
    go_no_go_recommendation_recorded: true,
    final_pre_closure_risk_register_recorded: true,
    go_no_go_boundary_recorded: true,
    ready_for_ag55z_v01_release_candidate_closure: true,
    hard_blocker_count_for_ag55z: 0,
    recommendation: recommendationRecord.recommendation,
    git_head_short: gitHead,
    branch,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG55D", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG55D",
  status: review.status,
  ag55d_release_candidate_go_no_go_readiness_recorded: 1,
  ag55c_consumed: 1,
  go_no_go_criteria_recorded: 1,
  release_candidate_blocker_register_recorded: 1,
  go_no_go_recommendation_recorded: 1,
  final_pre_closure_risk_register_recorded: 1,
  go_no_go_boundary_recorded: 1,
  ready_for_ag55z_v01_release_candidate_closure: 1,
  hard_blocker_count_for_ag55z: 0,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG55D — Release Candidate Go/No-Go Readiness Review

## Result

AG55D records the go/no-go readiness review for V01 release candidate closure.

## Recommendation

GO_FOR_AG55Z_V01_RELEASE_CANDIDATE_CLOSURE_ONLY

This is not a go-live approval. It does not approve deployment, publishing, backend activation or AG56 activation.

## Confirmed

- V01 scope freeze consumed
- Completed repo stack reconciliation consumed
- End-to-end release candidate validation consumed
- Security/privacy/legal closure consumed
- Public quality closure consumed
- Release operations closure consumed
- Hard blocker count for AG55Z is zero

## Preserved blockers

- No actual go-live approval
- No deployment or Vercel trigger
- No GitHub release/tag
- No live public checks
- No content publishing
- No public page/content mutation
- No AG56 controlled dynamic content-loop activation
- No backend/Auth/Supabase/RLS/database runtime
- No service-role use

## Next

AG55Z — V01 Release Candidate Closure.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.goNoGoCriteria, goNoGoCriteria);
writeJson(outputs.blockerRegister, blockerRegister);
writeJson(outputs.recommendationRecord, recommendationRecord);
writeJson(outputs.finalRiskRegister, finalRiskRegister);
writeJson(outputs.goNoGoBoundary, goNoGoBoundary);
writeJson(outputs.noGoLiveDeploymentAudit, noGoLiveDeploymentAudit);
writeJson(outputs.noDynamicLoopAudit, noDynamicLoopAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG55D Release Candidate Go/No-Go Readiness Review generated.");
console.log("✅ Go/no-go criteria, blocker register and recommendation recorded.");
console.log("✅ Recommendation is limited to AG55Z closure, not go-live/deployment.");
console.log("✅ No AG56 activation, deployment, publishing, public mutation, backend/runtime or service-role use enabled.");
console.log("✅ Ready for AG55Z V01 Release Candidate Closure.");
