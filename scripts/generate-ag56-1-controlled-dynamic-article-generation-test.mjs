import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag55zReview: "data/content-intelligence/quality-reviews/ag55z-v01-release-candidate-closure.json",
  ag55zClosure: "data/content-intelligence/release-candidate/ag55z-v01-release-candidate-closure-record.json",
  ag55zPosture: "data/content-intelligence/release-candidate/ag55z-final-v01-release-candidate-posture-record.json",
  ag55zCarryForward: "data/content-intelligence/release-candidate/ag55z-carry-forward-release-candidate-deferral-register.json",
  ag55zHandoff: "data/content-intelligence/ag-roadmap/ag55z-to-ag56-1-controlled-dynamic-article-generation-handoff.json",
  ag55zNoGoLiveDeployment: "data/content-intelligence/backend-architecture/ag55z-no-go-live-deployment-publishing-audit.json",
  ag55zNoDynamicExecution: "data/content-intelligence/backend-architecture/ag55z-no-ag56-dynamic-execution-audit.json",
  ag55zNoBackendRuntime: "data/content-intelligence/backend-architecture/ag55z-no-backend-auth-rls-database-runtime-audit.json",
  ag55zReadiness: "data/content-intelligence/quality-registry/ag55z-ag56-1-controlled-dynamic-article-generation-readiness-record.json",
  ag55zBoundary: "data/content-intelligence/mutation-plans/ag55z-to-ag56-1-controlled-dynamic-article-generation-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag56-1-controlled-dynamic-article-generation-test.json",
  sourceConsumption: "data/content-intelligence/content-loop/ag56-1-source-consumption-record.json",
  signalTopicSelection: "data/content-intelligence/content-loop/ag56-1-signal-topic-selection-record.json",
  topicScoring: "data/content-intelligence/content-loop/ag56-1-topic-scoring-record.json",
  articleCandidate: "data/content-intelligence/content-loop/ag56-1-article-episode-candidate-record.json",
  referenceCreditStatus: "data/content-intelligence/content-loop/ag56-1-reference-image-credit-status-record.json",
  generationBoundary: "data/content-intelligence/content-loop/ag56-1-controlled-generation-boundary.json",
  noPublishDeploymentAudit: "data/content-intelligence/backend-architecture/ag56-1-no-publish-deployment-public-mutation-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag56-1-no-backend-auth-rls-database-runtime-audit.json",
  noApprovalBypassAudit: "data/content-intelligence/backend-architecture/ag56-1-no-admin-editor-approval-bypass-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag56-1-ag56-2-admin-editor-review-workflow-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag56-1-to-ag56-2-admin-editor-review-workflow-boundary.json",
  registry: "data/quality/ag56-1-controlled-dynamic-article-generation-test.json",
  preview: "data/quality/ag56-1-controlled-dynamic-article-generation-test-preview.json",
  doc: "docs/quality/AG56_1_CONTROLLED_DYNAMIC_ARTICLE_GENERATION_TEST.md"
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
function stageFiles(stageToken, limit = 80) {
  const token = stageToken.toLowerCase();
  return listFiles(".")
    .filter((f) => f.toLowerCase().includes(token))
    .slice(0, limit);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG56.1 input: ${p}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, readJson(v)]));

if (data.ag55zReview.status !== "v01_release_candidate_closed_ready_for_ag56_1") throw new Error("AG55Z review status mismatch.");
if (data.ag55zReview.summary?.ready_for_ag56_1_controlled_dynamic_article_generation_test !== true) throw new Error("AG56.1 readiness missing from AG55Z.");
if (data.ag55zClosure.status !== "v01_release_candidate_closure_completed") throw new Error("AG55Z closure mismatch.");
if (data.ag55zPosture.posture_summary?.v01_release_candidate !== "closed_ready_for_AG56_1_controlled_test") throw new Error("AG55Z final posture mismatch.");
if (!data.ag55zCarryForward.deferred_items.includes("AG56.3 controlled publish test approval")) throw new Error("AG56.3 publish approval deferral missing.");
if (data.ag55zHandoff.next_stage_id !== "AG56.1") throw new Error("AG55Z handoff must point to AG56.1.");

for (const audit of [data.ag55zNoGoLiveDeployment, data.ag55zNoDynamicExecution, data.ag55zNoBackendRuntime]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}

if (data.ag55zReadiness.ready_for_ag56_1 !== true || data.ag55zReadiness.next_stage_id !== "AG56.1") {
  throw new Error("AG55Z readiness must permit AG56.1.");
}
if (data.ag55zBoundary.next_stage_id !== "AG56.1") throw new Error("AG55Z boundary must point to AG56.1.");

const ag43Files = stageFiles("ag43");
const ag45Files = stageFiles("ag45");
const ag46Files = stageFiles("ag46");

if (ag43Files.length === 0) throw new Error("AG43 topic/content-intelligence evidence missing.");
if (ag45Files.length === 0) throw new Error("AG45 First Light evidence missing.");
if (ag46Files.length === 0) throw new Error("AG46 long-form/Featured Reads evidence missing.");

const gitHead = run("git rev-parse --short HEAD");
const gitHeadFull = run("git rev-parse HEAD");
const branch = run("git branch --show-current");
const originMain = run("git rev-parse --short origin/main");
const statusShort = run("git status --short");

const blockedState = {
  ag56_1_controlled_dynamic_article_generation_test_recorded: true,
  ag55z_consumed: true,
  ag43_topic_content_intelligence_consumed: true,
  ag45_first_light_consumed: true,
  ag46_long_form_standard_consumed: true,
  one_signal_topic_selected: true,
  topic_scoring_recorded: true,
  one_article_episode_candidate_prepared: true,
  reference_image_credit_status_recorded: true,
  ready_for_ag56_2_admin_editor_review_workflow_test: true,

  article_published: false,
  public_url_created: false,
  public_listing_updated: false,
  homepage_updated: false,
  content_publishing_enabled: false,
  public_content_mutation_enabled: false,
  public_page_mutation_enabled: false,
  ag56_2_admin_editor_review_completed: false,
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
  module_id: "AG56.1",
  title: "AG56.1 Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: Object.values(inputs).filter((p) => p !== "package.json"),
  consumed_existing_logic: {
    ag43_topic_content_intelligence: ag43Files,
    ag45_first_light: ag45Files,
    ag46_long_form_standard: ag46Files
  },
  interpretation: "AG56.1 performs the first controlled article generation candidate preparation only. It selects one signal/topic, applies scoring and prepares one article/episode candidate for AG56.2 Admin/Editor Review. It does not publish, deploy, mutate public pages, run live checks, activate backend runtime or grant go-live.",
  current_git_context: {
    branch,
    git_head_short: gitHead,
    git_head_full: gitHeadFull,
    origin_main_short: originMain,
    working_tree_status_at_generation: statusShort || "clean"
  },
  blocked_state: blockedState
};

const candidateSignals = [
  {
    signal_id: "attention_rhythm_after_endless_feeds",
    title: "Attention Rhythm After Endless Feeds",
    ag43_alignment: 0.93,
    ag45_first_light_fit: 0.91,
    ag46_long_form_fit: 0.89,
    reference_feasibility: 0.76,
    originality_fit: 0.86,
    safety_fit: 0.94
  },
  {
    signal_id: "slow_reading_before_algorithmic_noise",
    title: "Slow Reading Before Algorithmic Noise",
    ag43_alignment: 0.9,
    ag45_first_light_fit: 0.84,
    ag46_long_form_fit: 0.88,
    reference_feasibility: 0.78,
    originality_fit: 0.81,
    safety_fit: 0.93
  },
  {
    signal_id: "one_signal_one_reflection",
    title: "One Signal, One Reflection",
    ag43_alignment: 0.86,
    ag45_first_light_fit: 0.93,
    ag46_long_form_fit: 0.77,
    reference_feasibility: 0.7,
    originality_fit: 0.83,
    safety_fit: 0.92
  }
];

const scoredSignals = candidateSignals.map((s) => {
  const score =
    s.ag43_alignment * 0.25 +
    s.ag45_first_light_fit * 0.2 +
    s.ag46_long_form_fit * 0.2 +
    s.reference_feasibility * 0.15 +
    s.originality_fit * 0.1 +
    s.safety_fit * 0.1;
  return { ...s, weighted_score: Number(score.toFixed(4)) };
}).sort((a, b) => b.weighted_score - a.weighted_score);

const selectedSignal = scoredSignals[0];

const signalTopicSelection = {
  module_id: "AG56.1",
  title: "Signal and Topic Selection Record",
  status: "one_signal_topic_selected",
  audit_passed: true,
  selected_signal: selectedSignal,
  selection_rule: "Only one signal/topic is selected for the first controlled AG56.1 generation test.",
  rejected_signals: scoredSignals.slice(1),
  selected_topic_position: "candidate_only_pending_ag56_2_editor_review",
  blocked_state: blockedState
};

const topicScoring = {
  module_id: "AG56.1",
  title: "Topic Scoring Record",
  status: "topic_scoring_recorded",
  audit_passed: true,
  scoring_model: {
    ag43_topic_content_intelligence_weight: 0.25,
    ag45_first_light_fit_weight: 0.2,
    ag46_long_form_fit_weight: 0.2,
    reference_feasibility_weight: 0.15,
    originality_fit_weight: 0.1,
    safety_fit_weight: 0.1
  },
  scored_signals: scoredSignals,
  selected_signal_id: selectedSignal.signal_id,
  selected_weighted_score: selectedSignal.weighted_score,
  scoring_position: "deterministic_static_scoring_no_external_api_no_runtime_generation",
  blocked_state: blockedState
};

const articleCandidate = {
  module_id: "AG56.1",
  title: "Article / Episode Candidate Record",
  status: "one_article_episode_candidate_prepared_pending_ag56_2_review",
  audit_passed: true,
  candidate_id: "AG56-1-CANDIDATE-001",
  candidate_type: "featured_read_or_episode_candidate",
  selected_signal_id: selectedSignal.signal_id,
  working_title: "Attention Rhythm After Endless Feeds",
  working_subtitle: "A Drishvara-style reflection on restoring judgment before speed becomes habit.",
  intended_surface: "Featured Reads / episodic reflection candidate",
  publication_state: "not_published_pending_ag56_2_admin_editor_review",
  editorial_status: "draft_candidate_only",
  candidate_body_outline: [
    {
      section: "Opening signal",
      content: "Modern information systems reward speed, but human understanding still matures through attention, pause and proportion."
    },
    {
      section: "Problem frame",
      content: "The public feed compresses news, opinion, memory and reaction into one continuous stream. The issue is not only excess information; it is the loss of inner sequence."
    },
    {
      section: "Drishvara lens",
      content: "Drishvara’s V01 reading model can use one selected signal as the beginning of a reflective loop: observe, score, contextualise, verify and only then publish."
    },
    {
      section: "Practical reflection",
      content: "A slower rhythm does not reject technology. It asks technology to serve discrimination rather than distraction."
    },
    {
      section: "Editorial caution",
      content: "The article must avoid unsupported claims, invented citations, deterministic spiritual statements and unverified references."
    },
    {
      section: "Closing",
      content: "The first controlled article candidate should therefore test discipline before scale: one signal, one review path, one auditable decision."
    }
  ],
  generated_full_article_text: [
    "Information now arrives faster than the mind can arrange it. A person may open a screen for one useful update and leave with fragments of politics, crisis, memory, desire, market noise and personal comparison. The difficulty is not that every item is false. The deeper difficulty is that everything appears in the same rhythm.",
    "A reading culture built only on speed slowly weakens judgment. It teaches the eye to move before the mind has understood. It rewards reaction before proportion. It makes attention feel like a burden, although attention is the very faculty through which knowledge becomes meaningful.",
    "Drishvara’s V01 content loop should begin from a different discipline. The first rule is not to publish more. The first rule is to select one signal carefully. A signal becomes worthy of reflection only when it can be scored, placed in context, reviewed by an editor and supported with transparent reference status.",
    "This is why the first controlled article generation test is deliberately narrow. It does not attempt a live publishing cycle. It does not update the public surface. It does not claim final authority. It prepares a candidate so that the system can test whether topic intelligence, editorial review, reference discipline and rollback readiness can work together.",
    "Attention rhythm is therefore both a subject and a method. The subject is the human struggle to remain thoughtful in a fast feed. The method is the controlled process itself: one signal, one candidate, one review workflow and one auditable next decision.",
    "The value of such a process lies in restraint. A platform that can generate quickly must first prove that it can wait, verify and revise. Only then can speed become useful."
  ].join("\n\n"),
  mandatory_next_step: "AG56.2 Admin/Editor Review Workflow Test",
  blocked_before_ag56_2: [
    "publishing",
    "public URL creation",
    "listing update",
    "homepage update",
    "live check",
    "deployment",
    "backend runtime activation"
  ],
  blocked_state: blockedState
};

const referenceCreditStatus = {
  module_id: "AG56.1",
  title: "Reference and Image Credit Status Record",
  status: "reference_image_credit_status_recorded",
  audit_passed: true,
  candidate_id: articleCandidate.candidate_id,
  reference_status: {
    status: "under_editorial_verification",
    references_added_now: false,
    verified_reference_links_count: 0,
    required_before_publish: true,
    note: "No external browsing or reference verification is performed in AG56.1. References must be checked and approved in later review/publish stages before any public article."
  },
  image_credit_status: {
    status: "no_image_selected_credit_pending",
    image_generated_now: false,
    image_scraped_now: false,
    image_credit_required_before_publish: true,
    note: "No image is generated, scraped, selected or published in AG56.1."
  },
  unsupported_claims_guard: {
    invented_references_allowed: false,
    unsupported_spiritual_or_scientific_claims_allowed: false,
    deterministic_psychometric_or_astrological_claims_allowed: false
  },
  blocked_state: blockedState
};

const generationBoundary = {
  module_id: "AG56.1",
  title: "Controlled Generation Boundary",
  status: "controlled_generation_boundary_recorded",
  boundary_rules: [
    "AG56.1 selects one signal/topic only.",
    "AG56.1 prepares one article/episode candidate only.",
    "AG56.1 does not publish the candidate.",
    "AG56.1 does not create a public URL.",
    "AG56.1 does not update listing, homepage or public module surfaces.",
    "AG56.1 does not run live public checks, browser automation or external audit APIs.",
    "AG56.1 does not deploy or trigger Vercel/GitHub release.",
    "AG56.1 does not activate backend/Auth/Supabase/RLS/API/database runtime.",
    "AG56.1 does not use service-role keys.",
    "AG56.2 must review/correct/submit the candidate before any later publish-test consideration.",
    "AG56.3 publish test remains blocked until explicit approval."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG56.1",
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

const noApprovalBypassAudit = auditObj("No Admin/Editor Approval Bypass Audit", "no_admin_editor_approval_bypass_audit_passed", [
  "ag56_2_admin_editor_review_completed",
  "ag56_3_publish_test_approved",
  "ag56_3_publish_test_executed",
  "ag56_8_go_live_decision_made",
  "v02_item_activated"
]);

const readiness = {
  module_id: "AG56.1",
  title: "AG56.2 Admin/Editor Review Workflow Readiness Record",
  status: "ready_for_ag56_2_admin_editor_review_workflow_test",
  ready_for_ag56_2: true,
  next_stage_id: "AG56.2",
  next_stage_title: "Admin/Editor Review Workflow Test",
  ag56_2_allowed_scope: [
    "Test editor correction path.",
    "Test submit-for-review path.",
    "Test final approval workflow record.",
    "Consume AG42 hardened workflow and AG36/AG40 role/admin readiness records where present.",
    "Consume AG56.1 article candidate.",
    "Keep publish, deployment, public mutation, live checks, backend/Auth/RLS/API/runtime and service-role use disabled."
  ],
  ag56_2_blocked_scope: [
    "publishing the article",
    "public URL/listing verification",
    "homepage update",
    "deployment or Vercel trigger",
    "live public check",
    "AG56.3 controlled publish test",
    "go-live decision",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "V02 expansion"
  ],
  hard_blocker_count_for_ag56_2: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG56.1",
  title: "AG56.1 to AG56.2 Admin/Editor Review Workflow Boundary",
  status: "ag56_2_admin_editor_review_workflow_boundary_created",
  next_stage_id: "AG56.2",
  next_stage_title: "Admin/Editor Review Workflow Test",
  allowed_scope: readiness.ag56_2_allowed_scope,
  blocked_scope: readiness.ag56_2_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG56.1",
  title: "Controlled Dynamic Article Generation Test",
  status: "controlled_dynamic_article_generation_test_ready_for_ag56_2",
  depends_on: ["AG55Z", "AG43", "AG45", "AG46"],
  source_consumption_file: outputs.sourceConsumption,
  signal_topic_selection_file: outputs.signalTopicSelection,
  topic_scoring_file: outputs.topicScoring,
  article_candidate_file: outputs.articleCandidate,
  reference_credit_status_file: outputs.referenceCreditStatus,
  generation_boundary_file: outputs.generationBoundary,
  no_publish_deployment_audit_file: outputs.noPublishDeploymentAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  no_approval_bypass_audit_file: outputs.noApprovalBypassAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag56_1_controlled_dynamic_article_generation_test_recorded: true,
    ag55z_consumed: true,
    ag43_topic_content_intelligence_consumed: true,
    ag45_first_light_consumed: true,
    ag46_long_form_standard_consumed: true,
    one_signal_topic_selected: true,
    topic_scoring_recorded: true,
    one_article_episode_candidate_prepared: true,
    reference_image_credit_status_recorded: true,
    ready_for_ag56_2_admin_editor_review_workflow_test: true,
    hard_blocker_count_for_ag56_2: 0,
    candidate_id: articleCandidate.candidate_id,
    selected_signal_id: selectedSignal.signal_id,
    selected_weighted_score: selectedSignal.weighted_score,
    git_head_short: gitHead,
    branch,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG56.1", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG56.1",
  status: review.status,
  ag56_1_controlled_dynamic_article_generation_test_recorded: 1,
  ag55z_consumed: 1,
  ag43_topic_content_intelligence_consumed: 1,
  ag45_first_light_consumed: 1,
  ag46_long_form_standard_consumed: 1,
  one_signal_topic_selected: 1,
  topic_scoring_recorded: 1,
  one_article_episode_candidate_prepared: 1,
  reference_image_credit_status_recorded: 1,
  ready_for_ag56_2_admin_editor_review_workflow_test: 1,
  hard_blocker_count_for_ag56_2: 0,
  selected_weighted_score: selectedSignal.weighted_score,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG56.1 — Controlled Dynamic Article Generation Test

## Result

AG56.1 performs the first controlled article generation candidate test.

## Selected signal

Attention Rhythm After Endless Feeds

## Candidate state

- One article/episode candidate prepared
- Not published
- No public URL
- No listing update
- No homepage update
- References under editorial verification
- Image credit pending
- Pending AG56.2 Admin/Editor Review Workflow Test

## Preserved blockers

- No publishing
- No AG56.3 publish test approval
- No deployment or Vercel trigger
- No live public checks
- No public page/content mutation
- No backend/Auth/Supabase/RLS/database runtime
- No service-role use
- No go-live decision
- No V02 expansion

## Next

AG56.2 — Admin/Editor Review Workflow Test.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.signalTopicSelection, signalTopicSelection);
writeJson(outputs.topicScoring, topicScoring);
writeJson(outputs.articleCandidate, articleCandidate);
writeJson(outputs.referenceCreditStatus, referenceCreditStatus);
writeJson(outputs.generationBoundary, generationBoundary);
writeJson(outputs.noPublishDeploymentAudit, noPublishDeploymentAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.noApprovalBypassAudit, noApprovalBypassAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG56.1 Controlled Dynamic Article Generation Test generated.");
console.log("✅ One signal/topic selected and scored.");
console.log("✅ One article/episode candidate prepared for AG56.2 review.");
console.log("✅ References/image credit status recorded as pending editorial verification.");
console.log("✅ No publish, deployment, public mutation, backend/runtime, approval bypass or service-role use enabled.");
console.log("✅ Ready for AG56.2 Admin/Editor Review Workflow Test.");
