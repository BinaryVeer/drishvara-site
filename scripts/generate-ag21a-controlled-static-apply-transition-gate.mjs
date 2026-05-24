import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag20zReview: "data/content-intelligence/quality-reviews/ag20z-controlled-static-apply-planning-closure.json",
  ag20zClosure: "data/content-intelligence/closure-records/ag20z-controlled-static-apply-planning-closure.json",
  ag20zSummary: "data/content-intelligence/go-live/ag20z-controlled-static-apply-planning-summary.json",
  ag20zBlocked: "data/content-intelligence/quality-registry/ag20z-controlled-static-apply-blocked-register.json",
  ag20zReadiness: "data/content-intelligence/quality-registry/ag20z-controlled-static-apply-transition-readiness-record.json",
  ag20zBoundary: "data/content-intelligence/mutation-plans/ag20z-to-ag21a-controlled-static-apply-transition-gate-boundary.json",
  ag19eApprovalPhrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const out = {
  review: "data/content-intelligence/quality-reviews/ag21a-controlled-static-apply-transition-gate.json",
  transitionGate: "data/content-intelligence/go-live/ag21a-controlled-static-apply-transition-gate-package.json",
  finalPreconditions: "data/content-intelligence/go-live/ag21a-final-precondition-lock-record.json",
  approvalPhraseLock: "data/content-intelligence/go-live/ag21a-approval-phrase-lock-record.json",
  candidateSurfaceLock: "data/content-intelligence/go-live/ag21a-candidate-and-public-surface-lock-record.json",
  tokenWriteDeployLock: "data/content-intelligence/go-live/ag21a-token-write-deployment-lock-record.json",
  operatorMatrix: "data/content-intelligence/go-live/ag21a-operator-decision-matrix.json",
  blocker: "data/content-intelligence/quality-registry/ag21a-controlled-static-apply-transition-gate-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag21a-controlled-static-apply-transition-gate-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag21a-to-ag21b-controlled-static-apply-transition-gate-audit-boundary.json",
  schema: "data/content-intelligence/schema/controlled-static-apply-transition-gate.schema.json",
  learning: "data/content-intelligence/learning/ag21a-controlled-static-apply-transition-gate-learning.json",
  registry: "data/quality/ag21a-controlled-static-apply-transition-gate.json",
  preview: "data/quality/ag21a-controlled-static-apply-transition-gate-preview.json",
  doc: "docs/quality/AG21A_CONTROLLED_STATIC_APPLY_TRANSITION_GATE.md"
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
  if (!exists(relativePath)) throw new Error(`Missing AG21A input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag20zReview.status !== "controlled_static_apply_planning_chain_closed_ready_for_ag21a_transition_gate") {
  throw new Error("AG21A requires AG20Z review readiness.");
}
if (data.ag20zClosure.final_decision.proceed_to_ag21a_controlled_static_apply_transition_gate !== true) {
  throw new Error("AG21A requires AG20Z closure decision.");
}
if (data.ag20zReadiness.ready_for_ag21a !== true) {
  throw new Error("AG21A requires AG20Z readiness.");
}
if (data.ag20zBoundary.next_stage_id !== "AG21A" || data.ag20zBoundary.explicit_approval_required !== true) {
  throw new Error("AG21A requires AG20Z to AG21A explicit boundary.");
}

const requiredPhrase = "Proceed with first controlled static apply";
if (data.ag19eApprovalPhrase.exact_phrase_required_later !== requiredPhrase) {
  throw new Error("AG21A requires the approved AG19E phrase.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG21A requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  controlled_static_apply_transition_gate_only: true,
  transition_gate_package_created_in_ag21a: true,
  final_precondition_lock_created_in_ag21a: true,
  approval_phrase_lock_created_in_ag21a: true,
  candidate_surface_lock_created_in_ag21a: true,
  token_write_deployment_lock_created_in_ag21a: true,
  operator_decision_matrix_created_in_ag21a: true,
  blocker_register_created_in_ag21a: true,
  ag21b_boundary_created_in_ag21a: true,
  selected_article_read_performed: true,

  explicit_approval_phrase_executed_in_ag21a: false,
  article_generation_performed_in_ag21a: false,
  article_mutation_performed_in_ag21a: false,
  queue_mutation_performed_in_ag21a: false,
  active_admin_review_queue_record_created_in_ag21a: false,
  queue_index_mutation_performed_in_ag21a: false,
  admin_action_execution_performed_in_ag21a: false,
  editor_action_execution_performed_in_ag21a: false,
  real_credential_created_in_ag21a: false,
  hardcoded_password_created_in_repo_in_ag21a: false,
  password_hash_created_in_repo_in_ag21a: false,
  auth_activation_performed_in_ag21a: false,
  backend_activation_performed_in_ag21a: false,
  supabase_activation_performed_in_ag21a: false,
  database_write_performed_in_ag21a: false,
  github_token_created_or_exposed_in_ag21a: false,
  github_write_operation_performed_in_ag21a: false,
  active_action_handler_created_in_ag21a: false,
  api_endpoint_created_in_ag21a: false,
  public_visibility_switch_performed_in_ag21a: false,
  public_index_mutation_performed_in_ag21a: false,
  deployment_trigger_performed_in_ag21a: false,
  live_smoke_test_performed_in_ag21a: false,
  rollback_execution_performed_in_ag21a: false,
  public_publishing_operation_performed_in_ag21a: false
};

const finalPreconditions = {
  module_id: "AG21A",
  title: "Final Precondition Lock Record",
  status: "final_preconditions_locked_for_transition_gate_no_execution",
  required_future_approval_phrase: requiredPhrase,
  seed_candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  locked_preconditions_for_later_execution_path: [
    "Exact approval phrase must be executed only in a later explicitly approved stage.",
    "Candidate path and hash must be re-confirmed before any write.",
    "GitHub token must be handled securely and never committed or logged.",
    "Exact public surfaces must be re-confirmed before any mutation.",
    "Rollback and live smoke-test path must be ready before deployment.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  current_lock_state: {
    final_preconditions_locked_for_audit: true,
    approval_phrase_executed_now: false,
    candidate_apply_enabled_now: false,
    github_token_enabled_now: false,
    github_write_enabled_now: false,
    public_visibility_switch_enabled_now: false,
    public_index_mutation_enabled_now: false,
    deployment_enabled_now: false,
    smoke_test_enabled_now: false,
    rollback_enabled_now: false,
    publishing_enabled_now: false,
    supabase_auth_backend_enabled_now: false
  },
  ...stageControls
};

const approvalPhraseLock = {
  module_id: "AG21A",
  title: "Approval Phrase Lock Record",
  status: "approval_phrase_locked_not_executed",
  required_future_approval_phrase: requiredPhrase,
  phrase_source: inputs.ag19eApprovalPhrase,
  phrase_handling_rule: "The phrase is preserved as a future execution gate. It is not executed in AG21A.",
  current_phrase_state: {
    phrase_locked: true,
    phrase_displayed_for_future_use: true,
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

const candidateSurfaceLock = {
  module_id: "AG21A",
  title: "Candidate and Public Surface Lock Record",
  status: "candidate_and_public_surfaces_locked_no_mutation",
  seed_candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  future_public_surface_candidates: [
    {
      surface_id: "featured_reads_index",
      locked_for_later_transition_review: true,
      mutate_now: false
    },
    {
      surface_id: "category_listing",
      locked_for_later_transition_review: true,
      mutate_now: false
    },
    {
      surface_id: "homepage_card",
      locked_for_later_transition_review: "conditional",
      mutate_now: false
    },
    {
      surface_id: "sitemap_feed_search",
      locked_for_later_transition_review: "conditional",
      mutate_now: false
    }
  ],
  current_surface_state: {
    candidate_locked: true,
    article_mutated_now: false,
    featured_reads_mutated_now: false,
    category_listing_mutated_now: false,
    homepage_mutated_now: false,
    sitemap_feed_search_mutated_now: false,
    public_visibility_switched_now: false,
    public_index_mutated_now: false,
    published_now: false
  },
  ...stageControls
};

const tokenWriteDeployLock = {
  module_id: "AG21A",
  title: "Token Write Deployment Lock Record",
  status: "token_write_deployment_locked_no_execution",
  future_secure_write_preconditions: [
    "Secure token source must be confirmed in a later approved transition.",
    "Token must not be stored in repository, JSON, scripts, docs or logs.",
    "Write branch and pre-write HEAD must be captured before mutation.",
    "Deployment trigger must remain blocked until approved write completes.",
    "Live smoke-test and rollback path must be ready before deployment."
  ],
  current_execution_state: {
    token_write_deployment_locked: true,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_token_committed: false,
    github_write_enabled: false,
    github_write_performed: false,
    deployment_triggered: false,
    live_smoke_test_performed: false,
    rollback_executed: false,
    published: false
  },
  ...stageControls
};

const operatorMatrix = {
  module_id: "AG21A",
  title: "Operator Decision Matrix",
  status: "operator_decision_matrix_created_no_execution",
  allowed_operator_decisions_now: [
    {
      decision: "proceed_to_ag21b_audit",
      allowed_now: true,
      effect: "Audit transition gate package only."
    },
    {
      decision: "hold_for_review",
      allowed_now: true,
      effect: "No mutation; review AG21A records."
    },
    {
      decision: "rescope_surfaces_before_apply",
      allowed_now: true,
      effect: "Planning revision only; no mutation."
    }
  ],
  blocked_operator_decisions_now: [
    {
      decision: "execute_approval_phrase",
      allowed_now: false
    },
    {
      decision: "create_or_wire_github_token",
      allowed_now: false
    },
    {
      decision: "perform_github_write",
      allowed_now: false
    },
    {
      decision: "switch_public_visibility",
      allowed_now: false
    },
    {
      decision: "mutate_public_indexes",
      allowed_now: false
    },
    {
      decision: "trigger_deployment",
      allowed_now: false
    },
    {
      decision: "publish_article",
      allowed_now: false
    },
    {
      decision: "activate_supabase_auth_backend",
      allowed_now: false
    }
  ],
  ...stageControls
};

const transitionGate = {
  module_id: "AG21A",
  title: "Controlled Static Apply Transition Gate Package",
  status: "controlled_static_apply_transition_gate_created_pending_audit",
  transition_gate_only: true,
  seed_candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  required_future_approval_phrase: requiredPhrase,
  gate_sections: [
    out.finalPreconditions,
    out.approvalPhraseLock,
    out.candidateSurfaceLock,
    out.tokenWriteDeployLock,
    out.operatorMatrix
  ],
  current_decision_state: {
    transition_gate_created: true,
    ready_for_ag21b_audit: true,
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
  inherited_ag20z_closure: inputs.ag20zClosure,
  ...stageControls
};

const blocker = {
  module_id: "AG21A",
  title: "Controlled Static Apply Transition Gate Blocker Register",
  status: "transition_gate_operations_remain_blocked_pending_ag21b_audit",
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
  allowed_after_ag21a_without_new_approval: [
    "Review AG21A transition gate package.",
    "Proceed to AG21B controlled static apply transition gate audit."
  ],
  not_allowed_after_ag21a_without_new_approval: [
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
  module_id: "AG21A",
  title: "Controlled Static Apply Transition Gate Audit Readiness Record",
  status: "ready_for_ag21b_controlled_static_apply_transition_gate_audit",
  ready_for_ag21b: true,
  ag21b_explicit_approval_required: true,
  transition_gate_package_created: true,
  final_precondition_lock_created: true,
  approval_phrase_lock_created: true,
  candidate_surface_lock_created: true,
  token_write_deployment_lock_created: true,
  operator_decision_matrix_created: true,
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
  reason: "AG21A creates the transition gate package only. AG21B should audit the transition gate before any later execution-readiness movement.",
  ...stageControls
};

const boundary = {
  module_id: "AG21A",
  title: "AG21A to AG21B Controlled Static Apply Transition Gate Audit Boundary",
  status: "ag21b_boundary_created_not_started",
  next_stage_id: "AG21B",
  next_stage_title: "Controlled Static Apply Transition Gate Audit",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
  ag21b_allowed_scope: [
    "Audit controlled static apply transition gate package.",
    "Audit final precondition lock.",
    "Audit approval phrase lock.",
    "Audit candidate and public surface lock.",
    "Audit token/write/deployment lock.",
    "Audit operator decision matrix.",
    "Confirm Supabase/Auth/backend remains deferred."
  ],
  ag21b_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag21b: true,
  ...stageControls
};

const schema = {
  module_id: "AG21A",
  title: "Controlled Static Apply Transition Gate Schema",
  status: "schema_controlled_static_apply_transition_gate_only",
  transition_gate_package_allowed_in_ag21a: true,
  final_precondition_lock_allowed_in_ag21a: true,
  approval_phrase_lock_allowed_in_ag21a: true,
  candidate_surface_lock_allowed_in_ag21a: true,
  token_write_deployment_lock_allowed_in_ag21a: true,
  operator_decision_matrix_allowed_in_ag21a: true,
  ag21b_boundary_allowed_in_ag21a: true,

  explicit_approval_phrase_execution_allowed_in_ag21a: false,
  article_generation_allowed_in_ag21a: false,
  article_mutation_allowed_in_ag21a: false,
  queue_mutation_allowed_in_ag21a: false,
  active_admin_review_queue_record_creation_allowed_in_ag21a: false,
  queue_index_mutation_allowed_in_ag21a: false,
  admin_action_execution_allowed_in_ag21a: false,
  editor_action_execution_allowed_in_ag21a: false,
  real_credential_creation_allowed_in_ag21a: false,
  auth_activation_allowed_in_ag21a: false,
  backend_activation_allowed_in_ag21a: false,
  supabase_activation_allowed_in_ag21a: false,
  database_write_allowed_in_ag21a: false,
  github_token_creation_or_exposure_allowed_in_ag21a: false,
  github_write_operation_allowed_in_ag21a: false,
  active_action_handler_creation_allowed_in_ag21a: false,
  api_endpoint_creation_allowed_in_ag21a: false,
  public_visibility_switch_allowed_in_ag21a: false,
  public_index_mutation_allowed_in_ag21a: false,
  deployment_trigger_allowed_in_ag21a: false,
  live_smoke_test_allowed_in_ag21a: false,
  rollback_execution_allowed_in_ag21a: false,
  public_publishing_operation_allowed_in_ag21a: false,
  ...stageControls
};

const review = {
  module_id: "AG21A",
  title: "Controlled Static Apply Transition Gate",
  status: "controlled_static_apply_transition_gate_created_pending_audit",
  depends_on: ["AG20Z"],
  generated_from: inputs,
  transition_gate_file: out.transitionGate,
  final_preconditions_file: out.finalPreconditions,
  approval_phrase_lock_file: out.approvalPhraseLock,
  candidate_surface_lock_file: out.candidateSurfaceLock,
  token_write_deployment_lock_file: out.tokenWriteDeployLock,
  operator_matrix_file: out.operatorMatrix,
  blocker_register_file: out.blocker,
  readiness_file: out.readiness,
  next_boundary_file: out.boundary,
  schema_file: out.schema,
  summary: {
    ready_for_ag21b: true,
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
  module_id: "AG21A",
  title: "Controlled Static Apply Transition Gate Learning",
  status: "learning_record_only",
  learning_points: [
    "AG21A creates the transition gate after AG20 closure.",
    "The exact approval phrase is locked but not executed.",
    "Candidate, public surfaces, token/write/deployment, and operator decisions are locked for audit.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing occurred.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG21A",
  title: "Controlled Static Apply Transition Gate",
  status: "controlled_static_apply_transition_gate_created_pending_audit",
  generated_artifacts: {
    review: out.review,
    transition_gate: out.transitionGate,
    final_preconditions: out.finalPreconditions,
    approval_phrase_lock: out.approvalPhraseLock,
    candidate_surface_lock: out.candidateSurfaceLock,
    token_write_deployment_lock: out.tokenWriteDeployLock,
    operator_matrix: out.operatorMatrix,
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
  module_id: "AG21A",
  preview_only: true,
  status: "controlled_static_apply_transition_gate_created_pending_audit",
  ready_for_ag21b: true,
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

const doc = `# AG21A — Controlled Static Apply Transition Gate

## Purpose

AG21A creates the controlled static apply transition gate after AG20 closure.

AG21A is transition-gate only. It does not execute the approval phrase, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment, run live smoke-tests, rollback or publish anything.

## Transition Gate Sections

- Final precondition lock record
- Approval phrase lock record
- Candidate and public surface lock record
- Token, write and deployment lock record
- Operator decision matrix
- Transition gate blocker register

## Approval Phrase

Future controlled static apply still requires the exact phrase:

\`Proceed with first controlled static apply\`

This phrase is not executed in AG21A.

## Decision State

AG21A does not perform real apply. It creates the transition gate for AG21B audit only.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG21B — Controlled Static Apply Transition Gate Audit — only with explicit approval.
`;

writeJson(out.review, review);
writeJson(out.transitionGate, transitionGate);
writeJson(out.finalPreconditions, finalPreconditions);
writeJson(out.approvalPhraseLock, approvalPhraseLock);
writeJson(out.candidateSurfaceLock, candidateSurfaceLock);
writeJson(out.tokenWriteDeployLock, tokenWriteDeployLock);
writeJson(out.operatorMatrix, operatorMatrix);
writeJson(out.blocker, blocker);
writeJson(out.readiness, readiness);
writeJson(out.boundary, boundary);
writeJson(out.schema, schema);
writeJson(out.learning, learning);
writeJson(out.registry, registry);
writeJson(out.preview, preview);
writeText(out.doc, doc);

console.log("✅ AG21A Controlled Static Apply Transition Gate generated.");
console.log("✅ Final precondition, approval phrase, candidate/surface, token/write/deployment and operator matrix locks created.");
console.log("✅ Explicit approval phrase remains required but not executed.");
console.log("✅ No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing performed.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG21B Controlled Static Apply Transition Gate Audit boundary created.");
