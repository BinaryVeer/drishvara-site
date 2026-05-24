import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag20aReview: "data/content-intelligence/quality-reviews/ag20a-controlled-static-apply-readiness.json",
  ag20bReview: "data/content-intelligence/quality-reviews/ag20b-controlled-static-apply-readiness-audit.json",
  ag20cReview: "data/content-intelligence/quality-reviews/ag20c-controlled-static-apply-final-authorization.json",
  ag20dReview: "data/content-intelligence/quality-reviews/ag20d-controlled-static-apply-final-authorization-audit.json",
  ag20eReview: "data/content-intelligence/quality-reviews/ag20e-controlled-static-apply-execution-plan.json",
  ag20fReview: "data/content-intelligence/quality-reviews/ag20f-controlled-static-apply-execution-plan-audit.json",
  ag20fAudit: "data/content-intelligence/audit-records/ag20f-controlled-static-apply-execution-plan-audit-report.json",
  ag20fClosure: "data/content-intelligence/closure-records/ag20f-controlled-static-apply-execution-plan-audit-closure.json",
  ag20fSafety: "data/content-intelligence/quality-registry/ag20f-controlled-static-apply-execution-plan-safety-record.json",
  ag20fReadiness: "data/content-intelligence/quality-registry/ag20f-controlled-static-apply-planning-closure-readiness-record.json",
  ag20fBoundary: "data/content-intelligence/mutation-plans/ag20f-to-ag20z-controlled-static-apply-planning-closure-boundary.json",
  ag19eApprovalPhrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const out = {
  review: "data/content-intelligence/quality-reviews/ag20z-controlled-static-apply-planning-closure.json",
  closure: "data/content-intelligence/closure-records/ag20z-controlled-static-apply-planning-closure.json",
  summary: "data/content-intelligence/go-live/ag20z-controlled-static-apply-planning-summary.json",
  blocked: "data/content-intelligence/quality-registry/ag20z-controlled-static-apply-blocked-register.json",
  readiness: "data/content-intelligence/quality-registry/ag20z-controlled-static-apply-transition-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag20z-to-ag21a-controlled-static-apply-transition-gate-boundary.json",
  schema: "data/content-intelligence/schema/controlled-static-apply-planning-closure.schema.json",
  learning: "data/content-intelligence/learning/ag20z-controlled-static-apply-planning-closure-learning.json",
  registry: "data/quality/ag20z-controlled-static-apply-planning-closure.json",
  preview: "data/quality/ag20z-controlled-static-apply-planning-closure-preview.json",
  doc: "docs/quality/AG20Z_CONTROLLED_STATIC_APPLY_PLANNING_CLOSURE.md"
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
  if (!exists(relativePath)) throw new Error(`Missing AG20Z input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag20fReview.status !== "controlled_static_apply_execution_plan_audit_passed_ready_for_ag20z_closure") {
  throw new Error("AG20Z requires AG20F review readiness.");
}
if (data.ag20fAudit.failed_checks.length !== 0) {
  throw new Error("AG20Z requires AG20F audit with zero failed checks.");
}
if (data.ag20fClosure.closure_decision.proceed_to_ag20z_controlled_static_apply_planning_closure !== true) {
  throw new Error("AG20Z requires AG20F closure decision.");
}
if (data.ag20fReadiness.ready_for_ag20z !== true) {
  throw new Error("AG20Z requires AG20F readiness.");
}
if (data.ag20fBoundary.next_stage_id !== "AG20Z" || data.ag20fBoundary.explicit_approval_required !== true) {
  throw new Error("AG20Z requires AG20F to AG20Z explicit boundary.");
}

const requiredPhrase = "Proceed with first controlled static apply";
if (data.ag19eApprovalPhrase.exact_phrase_required_later !== requiredPhrase) {
  throw new Error("AG20Z requires the approved AG19E phrase.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG20Z requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  controlled_static_apply_planning_closure_only: true,
  ag20_chain_closure_created_in_ag20z: true,
  controlled_static_apply_summary_created_in_ag20z: true,
  controlled_static_apply_blocked_register_created_in_ag20z: true,
  ag21a_boundary_created_in_ag20z: true,
  selected_article_read_performed: true,

  explicit_approval_phrase_executed_in_ag20z: false,
  article_generation_performed_in_ag20z: false,
  article_mutation_performed_in_ag20z: false,
  queue_mutation_performed_in_ag20z: false,
  active_admin_review_queue_record_created_in_ag20z: false,
  queue_index_mutation_performed_in_ag20z: false,
  admin_action_execution_performed_in_ag20z: false,
  editor_action_execution_performed_in_ag20z: false,
  real_credential_created_in_ag20z: false,
  hardcoded_password_created_in_repo_in_ag20z: false,
  password_hash_created_in_repo_in_ag20z: false,
  auth_activation_performed_in_ag20z: false,
  backend_activation_performed_in_ag20z: false,
  supabase_activation_performed_in_ag20z: false,
  database_write_performed_in_ag20z: false,
  github_token_created_or_exposed_in_ag20z: false,
  github_write_operation_performed_in_ag20z: false,
  active_action_handler_created_in_ag20z: false,
  api_endpoint_created_in_ag20z: false,
  public_visibility_switch_performed_in_ag20z: false,
  public_index_mutation_performed_in_ag20z: false,
  deployment_trigger_performed_in_ag20z: false,
  live_smoke_test_performed_in_ag20z: false,
  rollback_execution_performed_in_ag20z: false,
  public_publishing_operation_performed_in_ag20z: false
};

const completedStages = [
  {
    stage_id: "AG20A",
    title: "Controlled Static Apply Readiness",
    result: "Prepared candidate, GitHub token no-secrets, public surface, rollback/smoke-test and approval gate readiness."
  },
  {
    stage_id: "AG20B",
    title: "Controlled Static Apply Readiness Audit",
    result: "Audited AG20A and approved only AG20C final authorization package."
  },
  {
    stage_id: "AG20C",
    title: "Controlled Static Apply Final Authorization",
    result: "Prepared candidate, public surface, GitHub write, rollback/deployment/smoke-test and approval phrase final gate records."
  },
  {
    stage_id: "AG20D",
    title: "Controlled Static Apply Final Authorization Audit",
    result: "Audited AG20C and approved only AG20E execution plan."
  },
  {
    stage_id: "AG20E",
    title: "Controlled Static Apply Execution Plan",
    result: "Planned approval sequence, token precondition, file mutation order, public surface order, deployment/smoke-test order and rollback order."
  },
  {
    stage_id: "AG20F",
    title: "Controlled Static Apply Execution Plan Audit",
    result: "Audited AG20E with zero failed checks and approved AG20Z closure only."
  }
];

const summary = {
  module_id: "AG20Z",
  title: "Controlled Static Apply Planning Summary",
  status: "ag20_controlled_static_apply_planning_completed",
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  supabase_auth_reminder_required_in_future: true,
  completed_stage_count: completedStages.length,
  completed_stages: completedStages,
  seed_candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  required_future_approval_phrase: requiredPhrase,
  final_ag20_state: {
    readiness_package_created: true,
    readiness_audited: true,
    final_authorization_package_created: true,
    final_authorization_audited: true,
    execution_plan_created: true,
    execution_plan_audited: true,
    ready_for_ag21_controlled_static_apply_transition_gate: true,

    explicit_approval_phrase_executed: false,
    candidate_apply_enabled: false,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_write_enabled: false,
    article_mutation_enabled: false,
    queue_mutation_enabled: false,
    admin_editor_execution_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_mutation_enabled: false,
    deployment_trigger_enabled: false,
    live_smoke_test_enabled: false,
    rollback_execution_enabled: false,
    publishing_enabled: false,
    supabase_auth_backend_enabled: false
  },
  ...stageControls
};

const blocked = {
  module_id: "AG20Z",
  title: "Controlled Static Apply Blocked Register",
  status: "controlled_static_apply_operations_remain_blocked_pending_ag21_transition",
  blocked_items_after_ag20_closure: [
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
  allowed_after_ag20z_without_new_approval: [
    "Review AG20 closure records.",
    "Proceed to AG21A controlled static apply transition gate."
  ],
  not_allowed_after_ag20z_without_new_approval: [
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
  module_id: "AG20Z",
  title: "Controlled Static Apply Transition Readiness Record",
  status: "ready_for_ag21a_controlled_static_apply_transition_gate",
  ready_for_ag21a: true,
  ag21a_explicit_approval_required: true,
  ag20_chain_closed: true,
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  supabase_auth_reminder_required_in_future: true,
  recommended_next_stage: "AG21A",
  recommended_next_stage_title: "Controlled Static Apply Transition Gate",
  required_future_approval_phrase: requiredPhrase,
  reason: "AG20 closes controlled static apply planning. AG21A should act as the transition gate before any real controlled static apply. It must still not execute GitHub write, visibility switch, deployment or publishing unless the exact approval phrase and final preconditions are handled in the later approved transition.",
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
  ...stageControls
};

const boundary = {
  module_id: "AG20Z",
  title: "AG20Z to AG21A Controlled Static Apply Transition Gate Boundary",
  status: "ag21a_boundary_created_not_started",
  next_stage_id: "AG21A",
  next_stage_title: "Controlled Static Apply Transition Gate",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
  ag21a_allowed_scope: [
    "Create controlled static apply transition gate.",
    "Restate exact approval phrase requirement.",
    "Restate candidate article path and hash.",
    "Restate final preconditions for GitHub token, GitHub write, public surfaces, rollback and smoke-test.",
    "Confirm Supabase/Auth/backend remains deferred.",
    "Create a future execution-readiness pathway without performing real apply unless explicitly approved later."
  ],
  ag21a_blocked_scope: [
    "No approval phrase execution in boundary creation.",
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
  supabase_auth_defer_reminder_required_in_ag21a: true,
  ...stageControls
};

const closure = {
  module_id: "AG20Z",
  title: "Controlled Static Apply Planning Closure",
  status: "controlled_static_apply_planning_chain_closed_ready_for_ag21a_transition_gate",
  closure_scope: [
    "Controlled static apply readiness package.",
    "Controlled static apply readiness audit.",
    "Controlled static apply final authorization package.",
    "Controlled static apply final authorization audit.",
    "Controlled static apply execution plan.",
    "Controlled static apply execution plan audit.",
    "Approval phrase preservation without execution.",
    "Supabase/Auth/backend defer reminder."
  ],
  final_decision: {
    ag20_chain_closed: true,
    proceed_to_ag21a_controlled_static_apply_transition_gate: true,
    static_github_controlled_first_confirmed: true,
    supabase_auth_backend_deferred: true,
    future_supabase_auth_reminder_required: true,
    required_future_approval_phrase: requiredPhrase,

    proceed_to_execute_approval_phrase: false,
    proceed_to_real_candidate_apply: false,
    proceed_to_github_token_creation: false,
    proceed_to_github_write: false,
    proceed_to_article_mutation: false,
    proceed_to_queue_mutation: false,
    proceed_to_admin_editor_execution: false,
    proceed_to_public_visibility_switch: false,
    proceed_to_public_index_mutation: false,
    proceed_to_deployment_trigger: false,
    proceed_to_live_smoke_test_execution: false,
    proceed_to_rollback_execution: false,
    proceed_to_publish_execution: false,
    proceed_to_supabase_auth_backend_activation: false
  },
  ...stageControls
};

const schema = {
  module_id: "AG20Z",
  title: "Controlled Static Apply Planning Closure Schema",
  status: "schema_controlled_static_apply_planning_closure_only",
  chain_closure_allowed_in_ag20z: true,
  planning_summary_allowed_in_ag20z: true,
  blocked_register_allowed_in_ag20z: true,
  ag21a_boundary_allowed_in_ag20z: true,

  explicit_approval_phrase_execution_allowed_in_ag20z: false,
  article_generation_allowed_in_ag20z: false,
  article_mutation_allowed_in_ag20z: false,
  queue_mutation_allowed_in_ag20z: false,
  active_admin_review_queue_record_creation_allowed_in_ag20z: false,
  queue_index_mutation_allowed_in_ag20z: false,
  admin_action_execution_allowed_in_ag20z: false,
  editor_action_execution_allowed_in_ag20z: false,
  real_credential_creation_allowed_in_ag20z: false,
  auth_activation_allowed_in_ag20z: false,
  backend_activation_allowed_in_ag20z: false,
  supabase_activation_allowed_in_ag20z: false,
  database_write_allowed_in_ag20z: false,
  github_token_creation_or_exposure_allowed_in_ag20z: false,
  github_write_operation_allowed_in_ag20z: false,
  active_action_handler_creation_allowed_in_ag20z: false,
  api_endpoint_creation_allowed_in_ag20z: false,
  public_visibility_switch_allowed_in_ag20z: false,
  public_index_mutation_allowed_in_ag20z: false,
  deployment_trigger_allowed_in_ag20z: false,
  live_smoke_test_allowed_in_ag20z: false,
  rollback_execution_allowed_in_ag20z: false,
  public_publishing_operation_allowed_in_ag20z: false,
  ...stageControls
};

const review = {
  module_id: "AG20Z",
  title: "Controlled Static Apply Planning Closure",
  status: "controlled_static_apply_planning_chain_closed_ready_for_ag21a_transition_gate",
  depends_on: ["AG20A", "AG20B", "AG20C", "AG20D", "AG20E", "AG20F"],
  generated_from: inputs,
  closure_file: out.closure,
  summary_file: out.summary,
  blocked_register_file: out.blocked,
  readiness_file: out.readiness,
  next_boundary_file: out.boundary,
  schema_file: out.schema,
  summary: {
    completed_stage_count: completedStages.length,
    ag20_chain_closed: true,
    selected_path: "hybrid_staged_path_static_first",
    ready_for_ag21a: true,
    required_future_approval_phrase: requiredPhrase,
    supabase_auth_backend_deferred: true,
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
  module_id: "AG20Z",
  title: "Controlled Static Apply Planning Closure Learning",
  status: "learning_record_only",
  learning_points: [
    "AG20 controlled static apply planning chain is closed.",
    "Readiness, readiness audit, final authorization, final authorization audit, execution plan and execution plan audit are complete.",
    "The explicit approval phrase is preserved but not executed.",
    "AG21A should begin the controlled static apply transition gate.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing occurred.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG20Z",
  title: "Controlled Static Apply Planning Closure",
  status: "controlled_static_apply_planning_chain_closed_ready_for_ag21a_transition_gate",
  generated_artifacts: {
    review: out.review,
    closure: out.closure,
    summary: out.summary,
    blocked_register: out.blocked,
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
  module_id: "AG20Z",
  preview_only: true,
  status: "controlled_static_apply_planning_chain_closed_ready_for_ag21a_transition_gate",
  completed_stage_count: completedStages.length,
  ag20_chain_closed: true,
  ready_for_ag21a: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
  supabase_auth_backend_deferred: true,
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

const doc = `# AG20Z — Controlled Static Apply Planning Closure

## Purpose

AG20Z closes the controlled static apply planning chain.

AG20Z is closure only. It does not execute the approval phrase, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment, run live smoke-tests, rollback or publish anything.

## Completed Chain

- AG20A — Controlled Static Apply Readiness.
- AG20B — Controlled Static Apply Readiness Audit.
- AG20C — Controlled Static Apply Final Authorization.
- AG20D — Controlled Static Apply Final Authorization Audit.
- AG20E — Controlled Static Apply Execution Plan.
- AG20F — Controlled Static Apply Execution Plan Audit.

## Approval Phrase

Future controlled static apply still requires the exact phrase:

\`Proceed with first controlled static apply\`

This phrase is not executed in AG20Z.

## Final Decision

AG20 chain is closed. AG21A may proceed only as Controlled Static Apply Transition Gate.

Real candidate apply, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment trigger, live smoke-test, rollback execution and publish execution remain blocked.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG21A — Controlled Static Apply Transition Gate — only with explicit approval.
`;

writeJson(out.review, review);
writeJson(out.closure, closure);
writeJson(out.summary, summary);
writeJson(out.blocked, blocked);
writeJson(out.readiness, readiness);
writeJson(out.boundary, boundary);
writeJson(out.schema, schema);
writeJson(out.learning, learning);
writeJson(out.registry, registry);
writeJson(out.preview, preview);
writeText(out.doc, doc);

console.log("✅ AG20Z Controlled Static Apply Planning Closure generated.");
console.log("✅ AG20A through AG20F chain closed.");
console.log("✅ Explicit approval phrase remains preserved but not executed.");
console.log("✅ GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback and publishing remain blocked.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG21A Controlled Static Apply Transition Gate boundary created.");
