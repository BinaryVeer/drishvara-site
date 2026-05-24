import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag21bReview: "data/content-intelligence/quality-reviews/ag21b-controlled-static-apply-transition-gate-audit.json",
  ag21bAudit: "data/content-intelligence/audit-records/ag21b-controlled-static-apply-transition-gate-audit-report.json",
  ag21bDecision: "data/content-intelligence/go-live/ag21b-controlled-static-apply-execution-readiness-decision-record.json",
  ag21bSafety: "data/content-intelligence/quality-registry/ag21b-controlled-static-apply-transition-gate-safety-record.json",
  ag21bReadiness: "data/content-intelligence/quality-registry/ag21b-controlled-static-apply-execution-readiness-record.json",
  ag21bBoundary: "data/content-intelligence/mutation-plans/ag21b-to-ag21c-controlled-static-apply-execution-readiness-boundary.json",

  ag21aTransitionGate: "data/content-intelligence/go-live/ag21a-controlled-static-apply-transition-gate-package.json",
  ag21aFinalPreconditions: "data/content-intelligence/go-live/ag21a-final-precondition-lock-record.json",
  ag21aApprovalPhraseLock: "data/content-intelligence/go-live/ag21a-approval-phrase-lock-record.json",
  ag21aCandidateSurfaceLock: "data/content-intelligence/go-live/ag21a-candidate-and-public-surface-lock-record.json",
  ag21aTokenWriteDeployLock: "data/content-intelligence/go-live/ag21a-token-write-deployment-lock-record.json",

  ag19eApprovalPhrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const out = {
  review: "data/content-intelligence/quality-reviews/ag21c-controlled-static-apply-execution-readiness.json",
  readinessPackage: "data/content-intelligence/go-live/ag21c-controlled-static-apply-execution-readiness-package.json",
  approvalReadiness: "data/content-intelligence/go-live/ag21c-approval-phrase-pre-execution-readiness-record.json",
  candidateReadiness: "data/content-intelligence/go-live/ag21c-candidate-apply-pre-execution-readiness-record.json",
  githubReadiness: "data/content-intelligence/go-live/ag21c-github-write-pre-execution-readiness-record.json",
  publicSurfaceReadiness: "data/content-intelligence/go-live/ag21c-public-surface-pre-execution-readiness-record.json",
  deploySmokeRollbackReadiness: "data/content-intelligence/go-live/ag21c-deployment-smoke-rollback-pre-execution-readiness-record.json",
  blocker: "data/content-intelligence/quality-registry/ag21c-controlled-static-apply-execution-readiness-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag21c-controlled-static-apply-execution-readiness-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag21c-to-ag21d-controlled-static-apply-execution-readiness-audit-boundary.json",
  schema: "data/content-intelligence/schema/controlled-static-apply-execution-readiness.schema.json",
  learning: "data/content-intelligence/learning/ag21c-controlled-static-apply-execution-readiness-learning.json",
  registry: "data/quality/ag21c-controlled-static-apply-execution-readiness.json",
  preview: "data/quality/ag21c-controlled-static-apply-execution-readiness-preview.json",
  doc: "docs/quality/AG21C_CONTROLLED_STATIC_APPLY_EXECUTION_READINESS.md"
};

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(path.join(root, filePath)), { recursive: true });
}
function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}
function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}
function writeJson(relativePath, value) {
  ensureDir(relativePath);
  fs.writeFileSync(path.join(root, relativePath), JSON.stringify(value, null, 2) + "\n");
}
function writeText(relativePath, value) {
  ensureDir(relativePath);
  fs.writeFileSync(path.join(root, relativePath), value);
}
function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing AG21C input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag21bReview.status !== "controlled_static_apply_transition_gate_audit_passed_ready_for_ag21c_execution_readiness") {
  throw new Error("AG21C requires AG21B review readiness.");
}
if (data.ag21bAudit.failed_checks.length !== 0) {
  throw new Error("AG21C requires AG21B audit with zero failed checks.");
}
if (data.ag21bDecision.decision.proceed_to_controlled_static_apply_execution_readiness !== true) {
  throw new Error("AG21C requires AG21B execution readiness decision.");
}
if (data.ag21bReadiness.ready_for_ag21c !== true) {
  throw new Error("AG21C requires AG21B readiness.");
}
if (data.ag21bBoundary.next_stage_id !== "AG21C" || data.ag21bBoundary.explicit_approval_required !== true) {
  throw new Error("AG21C requires AG21B to AG21C explicit boundary.");
}

const requiredPhrase = "Proceed with first controlled static apply";
if (data.ag19eApprovalPhrase.exact_phrase_required_later !== requiredPhrase) {
  throw new Error("AG21C requires the approved AG19E phrase.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG21C requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  controlled_static_apply_execution_readiness_only: true,
  execution_readiness_package_created_in_ag21c: true,
  approval_phrase_pre_execution_readiness_created_in_ag21c: true,
  candidate_apply_pre_execution_readiness_created_in_ag21c: true,
  github_write_pre_execution_readiness_created_in_ag21c: true,
  public_surface_pre_execution_readiness_created_in_ag21c: true,
  deployment_smoke_rollback_pre_execution_readiness_created_in_ag21c: true,
  blocker_register_created_in_ag21c: true,
  ag21d_boundary_created_in_ag21c: true,
  selected_article_read_performed: true,

  explicit_approval_phrase_executed_in_ag21c: false,
  article_generation_performed_in_ag21c: false,
  article_mutation_performed_in_ag21c: false,
  queue_mutation_performed_in_ag21c: false,
  active_admin_review_queue_record_created_in_ag21c: false,
  queue_index_mutation_performed_in_ag21c: false,
  admin_action_execution_performed_in_ag21c: false,
  editor_action_execution_performed_in_ag21c: false,
  real_credential_created_in_ag21c: false,
  hardcoded_password_created_in_repo_in_ag21c: false,
  password_hash_created_in_repo_in_ag21c: false,
  auth_activation_performed_in_ag21c: false,
  backend_activation_performed_in_ag21c: false,
  supabase_activation_performed_in_ag21c: false,
  database_write_performed_in_ag21c: false,
  github_token_created_or_exposed_in_ag21c: false,
  github_write_operation_performed_in_ag21c: false,
  active_action_handler_created_in_ag21c: false,
  api_endpoint_created_in_ag21c: false,
  public_visibility_switch_performed_in_ag21c: false,
  public_index_mutation_performed_in_ag21c: false,
  deployment_trigger_performed_in_ag21c: false,
  live_smoke_test_performed_in_ag21c: false,
  rollback_execution_performed_in_ag21c: false,
  public_publishing_operation_performed_in_ag21c: false
};

const approvalReadiness = {
  module_id: "AG21C",
  title: "Approval Phrase Pre-Execution Readiness Record",
  status: "approval_phrase_pre_execution_readiness_created_not_executed",
  required_future_approval_phrase: requiredPhrase,
  inherited_approval_phrase_lock: inputs.ag21aApprovalPhraseLock,
  readiness_conditions: [
    "Exact approval phrase is known.",
    "Exact approval phrase must be entered only in a later approved execution-confirmation stage.",
    "AG21C does not treat the phrase as executed.",
    "AG21C does not authorise GitHub write, public mutation, deployment or publishing."
  ],
  current_state: {
    approval_phrase_readiness_created: true,
    phrase_executed_now: false,
    controlled_static_apply_authorised_now: false,
    github_write_authorised_now: false,
    public_visibility_switch_authorised_now: false,
    public_index_mutation_authorised_now: false,
    deployment_authorised_now: false,
    publish_authorised_now: false
  },
  ...stageControls
};

const candidateReadiness = {
  module_id: "AG21C",
  title: "Candidate Apply Pre-Execution Readiness Record",
  status: "candidate_apply_pre_execution_readiness_created_no_apply",
  seed_candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  inherited_candidate_surface_lock: inputs.ag21aCandidateSurfaceLock,
  readiness_conditions: [
    "Candidate file path is known.",
    "Candidate hash is verified.",
    "Candidate remains unapplied.",
    "Article file remains unmutated.",
    "Public visibility remains unchanged."
  ],
  current_state: {
    candidate_readiness_created: true,
    candidate_apply_executed_now: false,
    article_mutated_now: false,
    public_visibility_switched_now: false,
    public_index_mutated_now: false,
    published_now: false
  },
  ...stageControls
};

const githubReadiness = {
  module_id: "AG21C",
  title: "GitHub Write Pre-Execution Readiness Record",
  status: "github_write_pre_execution_readiness_created_no_token_no_write",
  inherited_token_write_deployment_lock: inputs.ag21aTokenWriteDeployLock,
  readiness_conditions: [
    "Secure token handling rule is known.",
    "Token must not be committed, logged, pasted or stored in repository.",
    "Write branch must be confirmed only in a later execution-confirmation stage.",
    "GitHub write remains disabled in AG21C."
  ],
  current_state: {
    github_write_readiness_created: true,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_token_committed: false,
    github_write_enabled: false,
    github_write_performed: false
  },
  ...stageControls
};

const publicSurfaceReadiness = {
  module_id: "AG21C",
  title: "Public Surface Pre-Execution Readiness Record",
  status: "public_surface_pre_execution_readiness_created_no_mutation",
  inherited_candidate_surface_lock: inputs.ag21aCandidateSurfaceLock,
  future_surface_readiness: [
    {
      surface_id: "featured_reads_index",
      ready_for_later_confirmation: true,
      mutate_now: false
    },
    {
      surface_id: "category_listing",
      ready_for_later_confirmation: true,
      mutate_now: false
    },
    {
      surface_id: "homepage_card",
      ready_for_later_confirmation: "conditional",
      mutate_now: false
    },
    {
      surface_id: "sitemap_feed_search",
      ready_for_later_confirmation: "conditional",
      mutate_now: false
    }
  ],
  current_state: {
    public_surface_readiness_created: true,
    featured_reads_mutated_now: false,
    category_listing_mutated_now: false,
    homepage_mutated_now: false,
    sitemap_feed_search_mutated_now: false,
    public_visibility_switched_now: false,
    public_index_mutated_now: false
  },
  ...stageControls
};

const deploySmokeRollbackReadiness = {
  module_id: "AG21C",
  title: "Deployment Smoke Rollback Pre-Execution Readiness Record",
  status: "deployment_smoke_rollback_pre_execution_readiness_created_no_execution",
  inherited_token_write_deployment_lock: inputs.ag21aTokenWriteDeployLock,
  readiness_conditions: [
    "Deployment trigger remains blocked.",
    "Live smoke-test remains blocked.",
    "Rollback execution remains blocked.",
    "Later execution stage must confirm pre-apply HEAD, deployment route, smoke-test checklist and rollback path."
  ],
  current_state: {
    deployment_smoke_rollback_readiness_created: true,
    deployment_triggered_now: false,
    live_smoke_test_performed_now: false,
    rollback_executed_now: false,
    published_now: false
  },
  ...stageControls
};

const readinessPackage = {
  module_id: "AG21C",
  title: "Controlled Static Apply Execution Readiness Package",
  status: "controlled_static_apply_execution_readiness_package_created_pending_audit",
  execution_readiness_only: true,
  seed_candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  required_future_approval_phrase: requiredPhrase,
  package_sections: [
    out.approvalReadiness,
    out.candidateReadiness,
    out.githubReadiness,
    out.publicSurfaceReadiness,
    out.deploySmokeRollbackReadiness
  ],
  current_decision_state: {
    execution_readiness_package_created: true,
    ready_for_ag21d_audit: true,
    explicit_approval_phrase_executed_now: false,
    controlled_static_apply_authorised_now: false,
    candidate_apply_enabled_now: false,
    github_token_enabled_now: false,
    github_write_enabled_now: false,
    visibility_switch_enabled_now: false,
    public_index_mutation_enabled_now: false,
    deployment_enabled_now: false,
    live_smoke_test_enabled_now: false,
    rollback_enabled_now: false,
    publishing_enabled_now: false
  },
  inherited_ag21b_decision: inputs.ag21bDecision,
  ...stageControls
};

const blocker = {
  module_id: "AG21C",
  title: "Controlled Static Apply Execution Readiness Blocker Register",
  status: "execution_readiness_operations_remain_blocked_pending_ag21d_audit",
  blocked_items: [
    "Explicit approval phrase execution.",
    "Real candidate apply.",
    "Real article mutation.",
    "Real queue mutation.",
    "Real GitHub token creation.",
    "Real GitHub token exposure.",
    "Real GitHub token wiring.",
    "Real GitHub write.",
    "Real public visibility switch.",
    "Real public index mutation.",
    "Featured Reads mutation.",
    "Category listing mutation.",
    "Homepage card mutation.",
    "Sitemap/feed/search mutation.",
    "Deployment trigger.",
    "Live smoke-test execution.",
    "Rollback execution.",
    "Publish execution.",
    "Supabase/Auth/backend activation.",
    "Database write path."
  ],
  allowed_after_ag21c_without_new_approval: [
    "Review AG21C execution readiness package.",
    "Proceed to AG21D controlled static apply execution readiness audit."
  ],
  not_allowed_after_ag21c_without_new_approval: [
    "Execute approval phrase.",
    "Create or wire GitHub token.",
    "Perform GitHub write.",
    "Switch public_visibility to true.",
    "Mutate public indexes.",
    "Trigger deployment.",
    "Run live smoke-test.",
    "Publish any article.",
    "Activate Supabase/Auth/backend."
  ],
  supabase_auth_backend_deferred: true,
  reminder: data.ag17bSupabaseReminder.reminder,
  ...stageControls
};

const readiness = {
  module_id: "AG21C",
  title: "Controlled Static Apply Execution Readiness Audit Readiness Record",
  status: "ready_for_ag21d_controlled_static_apply_execution_readiness_audit",
  ready_for_ag21d: true,
  ag21d_explicit_approval_required: true,
  execution_readiness_package_created: true,
  approval_phrase_pre_execution_readiness_created: true,
  candidate_apply_pre_execution_readiness_created: true,
  github_write_pre_execution_readiness_created: true,
  public_surface_pre_execution_readiness_created: true,
  deployment_smoke_rollback_pre_execution_readiness_created: true,
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  supabase_auth_reminder_required_in_future: true,
  required_future_approval_phrase: requiredPhrase,

  article_generation_ready: false,
  article_mutation_ready: false,
  queue_mutation_ready: false,
  admin_action_execution_ready: false,
  editor_action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  github_token_ready: false,
  github_write_ready: false,
  candidate_apply_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  live_smoke_test_ready: false,
  rollback_ready: false,
  publish_ready: false,
  reason: "AG21C creates execution readiness records only. AG21D should audit before any execution confirmation stage.",
  ...stageControls
};

const boundary = {
  module_id: "AG21C",
  title: "AG21C to AG21D Controlled Static Apply Execution Readiness Audit Boundary",
  status: "ag21d_boundary_created_not_started",
  next_stage_id: "AG21D",
  next_stage_title: "Controlled Static Apply Execution Readiness Audit",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
  ag21d_allowed_scope: [
    "Audit controlled static apply execution readiness package.",
    "Audit approval phrase pre-execution readiness.",
    "Audit candidate apply pre-execution readiness.",
    "Audit GitHub write pre-execution readiness.",
    "Audit public surface pre-execution readiness.",
    "Audit deployment, smoke-test and rollback pre-execution readiness.",
    "Confirm Supabase/Auth/backend remains deferred."
  ],
  ag21d_blocked_scope: [
    "No approval phrase execution.",
    "No article mutation.",
    "No active queue mutation.",
    "No Admin/Editor action execution.",
    "No real credentials.",
    "No Auth/backend/Supabase activation.",
    "No GitHub token creation or wiring.",
    "No GitHub content write.",
    "No public visibility switch.",
    "No public index mutation.",
    "No publishing operation.",
    "No deployment trigger.",
    "No live smoke-test.",
    "No rollback execution."
  ],
  supabase_auth_defer_reminder_required_in_ag21d: true,
  ...stageControls
};

const schema = {
  module_id: "AG21C",
  title: "Controlled Static Apply Execution Readiness Schema",
  status: "schema_controlled_static_apply_execution_readiness_only",
  execution_readiness_package_allowed_in_ag21c: true,
  approval_phrase_pre_execution_readiness_allowed_in_ag21c: true,
  candidate_apply_pre_execution_readiness_allowed_in_ag21c: true,
  github_write_pre_execution_readiness_allowed_in_ag21c: true,
  public_surface_pre_execution_readiness_allowed_in_ag21c: true,
  deployment_smoke_rollback_pre_execution_readiness_allowed_in_ag21c: true,
  ag21d_boundary_allowed_in_ag21c: true,

  explicit_approval_phrase_execution_allowed_in_ag21c: false,
  article_generation_allowed_in_ag21c: false,
  article_mutation_allowed_in_ag21c: false,
  queue_mutation_allowed_in_ag21c: false,
  active_admin_review_queue_record_creation_allowed_in_ag21c: false,
  queue_index_mutation_allowed_in_ag21c: false,
  admin_action_execution_allowed_in_ag21c: false,
  editor_action_execution_allowed_in_ag21c: false,
  real_credential_creation_allowed_in_ag21c: false,
  auth_activation_allowed_in_ag21c: false,
  backend_activation_allowed_in_ag21c: false,
  supabase_activation_allowed_in_ag21c: false,
  database_write_allowed_in_ag21c: false,
  github_token_creation_or_exposure_allowed_in_ag21c: false,
  github_write_operation_allowed_in_ag21c: false,
  active_action_handler_creation_allowed_in_ag21c: false,
  api_endpoint_creation_allowed_in_ag21c: false,
  public_visibility_switch_allowed_in_ag21c: false,
  public_index_mutation_allowed_in_ag21c: false,
  deployment_trigger_allowed_in_ag21c: false,
  live_smoke_test_allowed_in_ag21c: false,
  rollback_execution_allowed_in_ag21c: false,
  public_publishing_operation_allowed_in_ag21c: false,
  ...stageControls
};

const review = {
  module_id: "AG21C",
  title: "Controlled Static Apply Execution Readiness",
  status: "controlled_static_apply_execution_readiness_package_created_pending_audit",
  depends_on: ["AG21B"],
  generated_from: inputs,
  readiness_package_file: out.readinessPackage,
  approval_readiness_file: out.approvalReadiness,
  candidate_readiness_file: out.candidateReadiness,
  github_readiness_file: out.githubReadiness,
  public_surface_readiness_file: out.publicSurfaceReadiness,
  deploy_smoke_rollback_readiness_file: out.deploySmokeRollbackReadiness,
  blocker_register_file: out.blocker,
  readiness_file: out.readiness,
  next_boundary_file: out.boundary,
  schema_file: out.schema,
  summary: {
    ready_for_ag21d: true,
    selected_path: "hybrid_staged_path_static_first",
    required_future_approval_phrase: requiredPhrase,
    supabase_auth_backend_deferred: true,
    explicit_approval_phrase_executed: false,
    github_token_ready: false,
    github_write_ready: false,
    candidate_apply_ready: false,
    public_visibility_switch_ready: false,
    public_index_mutation_ready: false,
    deployment_trigger_ready: false,
    live_smoke_test_ready: false,
    rollback_ready: false,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG21C",
  title: "Controlled Static Apply Execution Readiness Learning",
  status: "learning_record_only",
  learning_points: [
    "AG21C creates execution readiness records only.",
    "The approval phrase, candidate, GitHub write, public surfaces, deployment, smoke-test and rollback are readiness-checked but not executed.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing occurred.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG21C",
  title: "Controlled Static Apply Execution Readiness",
  status: "controlled_static_apply_execution_readiness_package_created_pending_audit",
  generated_artifacts: {
    review: out.review,
    readiness_package: out.readinessPackage,
    approval_readiness: out.approvalReadiness,
    candidate_readiness: out.candidateReadiness,
    github_readiness: out.githubReadiness,
    public_surface_readiness: out.publicSurfaceReadiness,
    deploy_smoke_rollback_readiness: out.deploySmokeRollbackReadiness,
    blocker_register: out.blocker,
    readiness: out.readiness,
    next_boundary: out.boundary,
    schema: out.schema,
    learning: out.learning,
    preview: out.preview,
    document: out.doc
  },
  ...stageControls
};

const preview = {
  module_id: "AG21C",
  preview_only: true,
  status: "controlled_static_apply_execution_readiness_package_created_pending_audit",
  ready_for_ag21d: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
  supabase_auth_backend_deferred: true,
  explicit_approval_phrase_executed: false,
  github_token_ready: false,
  github_write_ready: false,
  candidate_apply_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  live_smoke_test_ready: false,
  rollback_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG21C — Controlled Static Apply Execution Readiness

## Purpose

AG21C creates the controlled static apply execution readiness package.

AG21C is execution-readiness only. It does not execute the approval phrase, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment, run live smoke-tests, rollback or publish anything.

## Execution Readiness Sections

- Approval phrase pre-execution readiness record
- Candidate apply pre-execution readiness record
- GitHub write pre-execution readiness record
- Public surface pre-execution readiness record
- Deployment, smoke-test and rollback pre-execution readiness record
- Execution readiness blocker register

## Approval Phrase

Future controlled static apply still requires the exact phrase:

\`Proceed with first controlled static apply\`

This phrase is not executed in AG21C.

## Decision State

AG21C does not perform real apply. It creates execution readiness evidence for AG21D audit only.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG21D — Controlled Static Apply Execution Readiness Audit — only with explicit approval.
`;

writeJson(out.review, review);
writeJson(out.readinessPackage, readinessPackage);
writeJson(out.approvalReadiness, approvalReadiness);
writeJson(out.candidateReadiness, candidateReadiness);
writeJson(out.githubReadiness, githubReadiness);
writeJson(out.publicSurfaceReadiness, publicSurfaceReadiness);
writeJson(out.deploySmokeRollbackReadiness, deploySmokeRollbackReadiness);
writeJson(out.blocker, blocker);
writeJson(out.readiness, readiness);
writeJson(out.boundary, boundary);
writeJson(out.schema, schema);
writeJson(out.learning, learning);
writeJson(out.registry, registry);
writeJson(out.preview, preview);
writeText(out.doc, doc);

console.log("✅ AG21C Controlled Static Apply Execution Readiness generated.");
console.log("✅ Approval phrase, candidate, GitHub write, public surface, deployment/smoke-test/rollback readiness records created.");
console.log("✅ Explicit approval phrase remains required but not executed.");
console.log("✅ No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing performed.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG21D Controlled Static Apply Execution Readiness Audit boundary created.");
