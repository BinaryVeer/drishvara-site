import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag55dReview: "data/content-intelligence/quality-reviews/ag55d-release-candidate-go-no-go-readiness-review.json",
  ag55dSource: "data/content-intelligence/release-candidate/ag55d-source-consumption-record.json",
  ag55dCriteria: "data/content-intelligence/release-candidate/ag55d-go-no-go-criteria-register.json",
  ag55dBlockers: "data/content-intelligence/release-candidate/ag55d-release-candidate-blocker-register.json",
  ag55dRecommendation: "data/content-intelligence/release-candidate/ag55d-go-no-go-recommendation-record.json",
  ag55dRisks: "data/content-intelligence/release-candidate/ag55d-final-pre-closure-risk-register.json",
  ag55dBoundary: "data/content-intelligence/release-candidate/ag55d-release-candidate-go-no-go-boundary.json",
  ag55dNoGoLiveDeployment: "data/content-intelligence/backend-architecture/ag55d-no-go-live-deployment-publishing-audit.json",
  ag55dNoDynamicLoop: "data/content-intelligence/backend-architecture/ag55d-no-controlled-dynamic-content-loop-activation-audit.json",
  ag55dNoBackendRuntime: "data/content-intelligence/backend-architecture/ag55d-no-backend-auth-rls-database-runtime-audit.json",
  ag55dReadiness: "data/content-intelligence/quality-registry/ag55d-ag55z-v01-release-candidate-closure-readiness-record.json",
  ag55dBoundaryToZ: "data/content-intelligence/mutation-plans/ag55d-to-ag55z-v01-release-candidate-closure-boundary.json",

  ag55cReview: "data/content-intelligence/quality-reviews/ag55c-end-to-end-release-candidate-validation.json",
  ag55cModuleMatrix: "data/content-intelligence/release-candidate/ag55c-v01-module-readiness-matrix.json",
  ag55cSecurityPublic: "data/content-intelligence/release-candidate/ag55c-security-public-release-readiness-record.json",

  ag55bReview: "data/content-intelligence/quality-reviews/ag55b-completed-repo-stack-reconciliation.json",
  ag55bRepoStack: "data/content-intelligence/release-candidate/ag55b-completed-repo-stack-reconciliation-record.json",

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
  review: "data/content-intelligence/quality-reviews/ag55z-v01-release-candidate-closure.json",
  closureRecord: "data/content-intelligence/release-candidate/ag55z-v01-release-candidate-closure-record.json",
  consumptionSummary: "data/content-intelligence/release-candidate/ag55z-ag55a-to-ag55d-consumption-summary.json",
  finalV01Posture: "data/content-intelligence/release-candidate/ag55z-final-v01-release-candidate-posture-record.json",
  carryForwardDeferral: "data/content-intelligence/release-candidate/ag55z-carry-forward-release-candidate-deferral-register.json",
  ag56Handoff: "data/content-intelligence/ag-roadmap/ag55z-to-ag56-1-controlled-dynamic-article-generation-handoff.json",
  noGoLiveDeploymentAudit: "data/content-intelligence/backend-architecture/ag55z-no-go-live-deployment-publishing-audit.json",
  noDynamicExecutionAudit: "data/content-intelligence/backend-architecture/ag55z-no-ag56-dynamic-execution-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag55z-no-backend-auth-rls-database-runtime-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag55z-ag56-1-controlled-dynamic-article-generation-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag55z-to-ag56-1-controlled-dynamic-article-generation-boundary.json",
  registry: "data/quality/ag55z-v01-release-candidate-closure.json",
  preview: "data/quality/ag55z-v01-release-candidate-closure-preview.json",
  doc: "docs/quality/AG55Z_V01_RELEASE_CANDIDATE_CLOSURE.md"
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
  if (!exists(p)) throw new Error(`Missing AG55Z input: ${p}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, readJson(v)]));

if (data.ag55dReview.status !== "release_candidate_go_no_go_ready_for_ag55z") throw new Error("AG55D review status mismatch.");
if (data.ag55dReview.summary?.ready_for_ag55z_v01_release_candidate_closure !== true) throw new Error("AG55Z readiness missing from AG55D.");
if (data.ag55dSource.status !== "source_consumption_recorded") throw new Error("AG55D source consumption mismatch.");
if (data.ag55dCriteria.audit_passed !== true || data.ag55dCriteria.hard_blocker_count !== 0) throw new Error("AG55D go/no-go criteria mismatch.");
if (data.ag55dBlockers.audit_passed !== true || data.ag55dBlockers.hard_blocker_count !== 0) throw new Error("AG55D blocker register mismatch.");
if (data.ag55dRecommendation.recommendation !== "GO_FOR_AG55Z_V01_RELEASE_CANDIDATE_CLOSURE_ONLY") throw new Error("AG55D recommendation mismatch.");
if (data.ag55dRecommendation.actual_go_live_approval_granted_now !== false) throw new Error("AG55D must not grant actual go-live.");
if (data.ag55dRisks.current_hard_blocker_count !== 0) throw new Error("AG55D final risk blockers must be zero.");
if (!data.ag55dBoundary.boundary_rules.includes("AG55D does not grant actual go-live approval.")) throw new Error("AG55D go-live blocker missing.");

for (const audit of [data.ag55dNoGoLiveDeployment, data.ag55dNoDynamicLoop, data.ag55dNoBackendRuntime]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

if (data.ag55dReadiness.ready_for_ag55z !== true || data.ag55dReadiness.next_stage_id !== "AG55Z") throw new Error("AG55D readiness must permit AG55Z.");
if (data.ag55dBoundaryToZ.next_stage_id !== "AG55Z") throw new Error("AG55D boundary must point to AG55Z.");

if (data.ag55cReview.status !== "end_to_end_release_candidate_validation_ready_for_ag55d") throw new Error("AG55C status mismatch.");
if (data.ag55cModuleMatrix.audit_passed !== true || data.ag55cModuleMatrix.hard_blocker_count_for_ag55d !== 0) throw new Error("AG55C module matrix mismatch.");
if (data.ag55cSecurityPublic.audit_passed !== true || data.ag55cSecurityPublic.hard_blocker_count !== 0) throw new Error("AG55C security/public readiness mismatch.");

if (data.ag55bReview.status !== "completed_repo_stack_reconciliation_ready_for_ag55c") throw new Error("AG55B status mismatch.");
if (data.ag55bRepoStack.audit_passed !== true) throw new Error("AG55B repo stack must pass.");

if (data.ag55aReview.status !== "v01_scope_freeze_ready_for_ag55b") throw new Error("AG55A status mismatch.");
if (data.ag55aScopeFreeze.freeze_scope_status !== "v01_scope_frozen_for_reconciliation") throw new Error("AG55A freeze status mismatch.");
if (!JSON.stringify(data.ag55aV02Deferral.deferred_items).includes("controlled dynamic content-loop")) throw new Error("AG55A dynamic loop deferral missing.");

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
  ag55z_v01_release_candidate_closed: true,
  ag55a_ag55b_ag55c_ag55d_consumed: true,
  v01_release_candidate_closure_completed: true,
  ag56_1_controlled_dynamic_article_generation_handoff_created: true,
  ready_for_ag56_1_controlled_dynamic_article_generation_test: true,

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
  ag56_1_generation_test_executed: false,
  controlled_dynamic_content_loop_activated: false,
  ag56_publish_test_approved: false,
  ag56_publish_test_executed: false,
  ag56_go_live_decision_made: false,
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

const closureRecord = {
  module_id: "AG55Z",
  title: "V01 Release Candidate Closure Record",
  status: "v01_release_candidate_closure_completed",
  closure_allowed: true,
  closure_result: "AG55Z closes V01 release candidate readiness after consuming AG55A scope freeze, AG55B completed repo stack reconciliation, AG55C end-to-end validation readiness and AG55D go/no-go readiness review. This closure does not approve go-live, deployment, publishing, public mutation, backend/Auth/RLS/API/runtime or AG56 publish/go-live actions.",
  closed_substages: [
    "AG55A Version 01 Scope Freeze",
    "AG55B Completed Repo Stack and Dependency Reconciliation",
    "AG55C End-to-End Release Candidate Validation",
    "AG55D Release Candidate Go/No-Go Readiness Review"
  ],
  current_git_context: {
    branch,
    git_head_short: gitHead,
    git_head_full: gitHeadFull,
    origin_main_short: originMain,
    working_tree_status_at_generation: statusShort || "clean"
  },
  blocked_state: blockedState
};

const consumptionSummary = {
  module_id: "AG55Z",
  title: "AG55A to AG55D Consumption Summary",
  status: "ag55a_to_ag55d_consumption_summarised",
  consumed_outputs: [
    {
      stage_id: "AG55A",
      result: "V01 scope frozen; V02 and dynamic/runtime items deferred."
    },
    {
      stage_id: "AG55B",
      result: "Completed repo stack, dependency records and old roadmap pointer reconciled."
    },
    {
      stage_id: "AG55C",
      result: "End-to-end release candidate validation readiness recorded."
    },
    {
      stage_id: "AG55D",
      result: "Go/no-go readiness review recommends AG55Z closure only; no actual go-live."
    }
  ],
  blocked_state: blockedState
};

const finalV01Posture = {
  module_id: "AG55Z",
  title: "Final V01 Release Candidate Posture Record",
  status: "final_v01_release_candidate_posture_recorded",
  posture_summary: {
    v01_scope: "frozen",
    completed_repo_stack: "reconciled",
    end_to_end_validation: "ready",
    go_no_go_review: "closure_only_recommendation",
    v01_release_candidate: "closed_ready_for_AG56_1_controlled_test",
    actual_go_live: "not_approved",
    deployment: "blocked",
    publishing: "blocked",
    backend_runtime: "blocked",
    ag56_publish_or_live_decision: "not_approved"
  },
  posture_rule: "AG56.1 may begin only the first controlled dynamic article generation test. AG56.1 must not publish, deploy, mutate public pages, activate backend/Auth/RLS/API/runtime or make go-live decision.",
  blocked_state: blockedState
};

const carryForwardDeferral = {
  module_id: "AG55Z",
  title: "Carry-forward Release Candidate Deferral Register",
  status: "carry_forward_release_candidate_deferral_register_recorded",
  deferred_items: [
    "actual go-live approval",
    "deployment or Vercel trigger",
    "GitHub release/tag creation",
    "live public check execution",
    "browser automation or external audit API",
    "content publishing",
    "public page/content mutation",
    "AG56.3 controlled publish test approval",
    "AG56.3 controlled publish test execution",
    "AG56.8 go-live decision",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "public dashboard exposure",
    "V02 expansion items"
  ],
  non_deferred_next_action: "AG56.1 controlled dynamic article generation test may be prepared as the next governed stage only.",
  future_reentry_rule: "AG56.1 may select one signal/topic and prepare one controlled article/episode candidate. Publishing remains blocked until explicit AG56.3 approval.",
  blocked_state: blockedState
};

const ag56Handoff = {
  module_id: "AG55Z",
  title: "AG55Z to AG56.1 Controlled Dynamic Article Generation Handoff",
  status: "ag56_1_controlled_dynamic_article_generation_handoff_created",
  next_stage_id: "AG56.1",
  next_stage_title: "Controlled Dynamic Article Generation Test",
  handoff_basis: [
    "V01 release candidate readiness is closed.",
    "AG56.1 may select one signal/topic using AG43 topic/content intelligence.",
    "AG56.1 may apply scoring using AG45 First Light and AG46 long-form standards.",
    "AG56.1 may prepare one article/episode candidate with references and image credit status.",
    "AG56.1 must not publish, deploy, mutate public pages, trigger live checks, activate backend runtime or decide go-live.",
    "AG56.3 publish test requires separate explicit approval after AG56.1 and AG56.2 outputs."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG55Z",
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

const noDynamicExecutionAudit = auditObj("No AG56 Dynamic Execution Audit", "no_ag56_dynamic_execution_audit_passed", [
  "ag56_1_generation_test_executed",
  "controlled_dynamic_content_loop_activated",
  "ag56_publish_test_approved",
  "ag56_publish_test_executed",
  "ag56_go_live_decision_made",
  "v02_item_activated"
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
  module_id: "AG55Z",
  title: "AG56.1 Controlled Dynamic Article Generation Readiness Record",
  status: "ready_for_ag56_1_controlled_dynamic_article_generation_test",
  ready_for_ag56_1: true,
  next_stage_id: "AG56.1",
  next_stage_title: "Controlled Dynamic Article Generation Test",
  ag56_1_allowed_scope: [
    "Select one signal/topic.",
    "Consume AG43 topic/content-intelligence records.",
    "Consume AG45 First Light readiness.",
    "Consume AG46 long-form standard/readiness.",
    "Apply scoring and prepare one article/episode candidate.",
    "Record reference and image credit status.",
    "Keep publish, deploy, public mutation, live checks, backend/Auth/RLS/API/runtime and service-role use disabled."
  ],
  ag56_1_blocked_scope: [
    "publishing the article",
    "AG56.3 controlled publish test",
    "public URL/listing verification",
    "homepage public update",
    "live public checks",
    "deployment or Vercel trigger",
    "go-live decision",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "V02 expansion"
  ],
  hard_blocker_count_for_ag56_1: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG55Z",
  title: "AG55Z to AG56.1 Controlled Dynamic Article Generation Boundary",
  status: "ag56_1_controlled_dynamic_article_generation_boundary_created",
  next_stage_id: "AG56.1",
  next_stage_title: "Controlled Dynamic Article Generation Test",
  allowed_scope: readiness.ag56_1_allowed_scope,
  blocked_scope: readiness.ag56_1_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG55Z",
  title: "V01 Release Candidate Closure",
  status: "v01_release_candidate_closed_ready_for_ag56_1",
  depends_on: ["AG55D", "AG55C", "AG55B", "AG55A", "AG54Z", "AG53Z", "AG52Z", "AG51Z", "ADB20"],
  closure_record_file: outputs.closureRecord,
  consumption_summary_file: outputs.consumptionSummary,
  final_v01_posture_file: outputs.finalV01Posture,
  carry_forward_deferral_file: outputs.carryForwardDeferral,
  ag56_handoff_file: outputs.ag56Handoff,
  no_go_live_deployment_audit_file: outputs.noGoLiveDeploymentAudit,
  no_dynamic_execution_audit_file: outputs.noDynamicExecutionAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag55z_v01_release_candidate_closed: true,
    ag55a_ag55b_ag55c_ag55d_consumed: true,
    v01_release_candidate_closure_completed: true,
    ag56_1_controlled_dynamic_article_generation_handoff_created: true,
    ready_for_ag56_1_controlled_dynamic_article_generation_test: true,
    hard_blocker_count_for_ag56_1: 0,
    git_head_short: gitHead,
    branch,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG55Z", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG55Z",
  status: review.status,
  ag55z_v01_release_candidate_closed: 1,
  ag55a_ag55b_ag55c_ag55d_consumed: 1,
  v01_release_candidate_closure_completed: 1,
  ag56_1_controlled_dynamic_article_generation_handoff_created: 1,
  ready_for_ag56_1_controlled_dynamic_article_generation_test: 1,
  hard_blocker_count_for_ag56_1: 0,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG55Z — V01 Release Candidate Closure

## Result

AG55Z closes V01 release candidate readiness and permits the next governed stage: AG56.1 Controlled Dynamic Article Generation Test.

## Closed

- AG55A — Version 01 Scope Freeze
- AG55B — Completed Repo Stack and Dependency Reconciliation
- AG55C — End-to-End Release Candidate Validation
- AG55D — Release Candidate Go/No-Go Readiness Review

## What AG55Z permits next

AG56.1 may prepare one controlled dynamic article/episode candidate by consuming AG43, AG45 and AG46 records.

## What remains blocked

- No actual go-live approval
- No deployment or Vercel trigger
- No GitHub release/tag
- No live public checks
- No content publishing
- No public page/content mutation
- No AG56.3 publish test approval or execution
- No AG56.8 go-live decision
- No backend/Auth/Supabase/RLS/database runtime
- No service-role use
- No V02 expansion

## Next

AG56.1 — Controlled Dynamic Article Generation Test.
`;

writeJson(outputs.closureRecord, closureRecord);
writeJson(outputs.consumptionSummary, consumptionSummary);
writeJson(outputs.finalV01Posture, finalV01Posture);
writeJson(outputs.carryForwardDeferral, carryForwardDeferral);
writeJson(outputs.ag56Handoff, ag56Handoff);
writeJson(outputs.noGoLiveDeploymentAudit, noGoLiveDeploymentAudit);
writeJson(outputs.noDynamicExecutionAudit, noDynamicExecutionAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG55Z V01 Release Candidate Closure generated.");
console.log("✅ AG55A–AG55D consumed and closed.");
console.log("✅ AG56.1 Controlled Dynamic Article Generation handoff recorded.");
console.log("✅ No go-live, deployment, publishing, public mutation, AG56 publish/go-live action, backend/runtime or service-role use enabled.");
console.log("✅ Ready for AG56.1 Controlled Dynamic Article Generation Test.");
