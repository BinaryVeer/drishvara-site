import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag16zReview: "data/content-intelligence/quality-reviews/ag16z-public-visibility-publish-control-closure.json",
  ag16zClosure: "data/content-intelligence/closure-records/ag16z-public-visibility-publish-control-closure.json",
  ag16zSummary: "data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json",
  ag16zBlocked: "data/content-intelligence/quality-registry/ag16z-public-exposure-blocked-register.json",
  ag16zReadiness: "data/content-intelligence/quality-registry/ag16z-next-path-readiness-record.json",
  ag16zBoundary: "data/content-intelligence/mutation-plans/ag16z-to-ag17a-controlled-go-live-implementation-path-decision-boundary.json",
  ag14zReview: "data/content-intelligence/quality-reviews/ag14z-admin-editor-secure-handler-chain-closure.json",
  ag15zReview: "data/content-intelligence/quality-reviews/ag15z-generated-article-admin-queue-integration-closure.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag17a-controlled-go-live-implementation-path-decision.json");
const optionComparisonPath = path.join(root, "data/content-intelligence/go-live/ag17a-go-live-option-comparison-record.json");
const decisionPath = path.join(root, "data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json");
const supabaseReminderPath = path.join(root, "data/content-intelligence/go-live/ag17a-supabase-auth-defer-reminder-record.json");
const blockerPath = path.join(root, "data/content-intelligence/quality-registry/ag17a-real-activation-blocker-register.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag17a-hybrid-static-go-live-planning-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag17a-to-ag17b-hybrid-static-go-live-implementation-plan-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/controlled-go-live-implementation-path-decision.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag17a-controlled-go-live-implementation-path-decision-learning.json");
const registryPath = path.join(root, "data/quality/ag17a-controlled-go-live-implementation-path-decision.json");
const previewPath = path.join(root, "data/quality/ag17a-controlled-go-live-implementation-path-decision-preview.json");
const docPath = path.join(root, "docs/quality/AG17A_CONTROLLED_GO_LIVE_IMPLEMENTATION_PATH_DECISION.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing AG17A input ${name}: ${relativePath}`);
}

const ag16zReview = readJson(inputs.ag16zReview);
const ag16zClosure = readJson(inputs.ag16zClosure);
const ag16zSummary = readJson(inputs.ag16zSummary);
const ag16zBlocked = readJson(inputs.ag16zBlocked);
const ag16zReadiness = readJson(inputs.ag16zReadiness);
const ag16zBoundary = readJson(inputs.ag16zBoundary);
const ag13zCandidate = readJson(inputs.ag13zCandidate);

if (ag16zReview.status !== "public_visibility_publish_control_chain_closed_future_public_exposure_blocked") {
  throw new Error("AG17A requires AG16Z closure review.");
}
if (ag16zClosure.final_decision.ag16_chain_closed !== true) {
  throw new Error("AG17A requires AG16 chain to be closed.");
}
if (ag16zReadiness.ready_for_ag17a !== true) {
  throw new Error("AG17A requires AG16Z readiness.");
}
if (ag16zBoundary.next_stage_id !== "AG17A" || ag16zBoundary.explicit_approval_required !== true) {
  throw new Error("AG17A requires AG16Z to AG17A explicit boundary.");
}

const articlePath = ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG17A requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  controlled_go_live_implementation_path_decision_only: true,
  go_live_option_comparison_created_in_ag17a: true,
  hybrid_staged_path_selected_in_ag17a: true,
  supabase_auth_defer_reminder_created_in_ag17a: true,
  real_activation_blocker_register_created_in_ag17a: true,
  ag17b_boundary_created_in_ag17a: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag17a: false,
  article_mutation_performed_in_ag17a: false,
  queue_mutation_performed_in_ag17a: false,
  active_admin_review_queue_record_created_in_ag17a: false,
  queue_index_mutation_performed_in_ag17a: false,
  admin_action_execution_performed_in_ag17a: false,
  editor_action_execution_performed_in_ag17a: false,
  real_credential_created_in_ag17a: false,
  hardcoded_password_created_in_repo_in_ag17a: false,
  password_hash_created_in_repo_in_ag17a: false,
  auth_activation_performed_in_ag17a: false,
  backend_activation_performed_in_ag17a: false,
  supabase_activation_performed_in_ag17a: false,
  database_write_performed_in_ag17a: false,
  github_token_created_or_exposed_in_ag17a: false,
  github_write_operation_performed_in_ag17a: false,
  active_action_handler_created_in_ag17a: false,
  api_endpoint_created_in_ag17a: false,
  public_visibility_switch_performed_in_ag17a: false,
  public_index_mutation_performed_in_ag17a: false,
  public_publishing_operation_performed_in_ag17a: false,
  deployment_trigger_performed_in_ag17a: false
};

const optionComparison = {
  module_id: "AG17A",
  title: "Go-live Implementation Option Comparison Record",
  status: "go_live_options_compared",
  options: [
    {
      option_id: "option_1_static_github_controlled_first",
      label: "GitHub-backed static controlled path first",
      description: "Use the current static/GitHub/Vercel architecture with governed generated artifacts, no real backend/Auth activation at first.",
      advantages: [
        "Lowest operational complexity.",
        "Fits current repository governance flow.",
        "Keeps cost low.",
        "Allows controlled article/public index workflow before database activation.",
        "Avoids premature Supabase/Auth surface area."
      ],
      risks: [
        "Manual/semi-manual control remains higher.",
        "Not ideal for multi-user concurrent editorial operations.",
        "Real Admin/Editor actions still need carefully controlled implementation."
      ],
      suitable_now: true
    },
    {
      option_id: "option_2_supabase_auth_backed_now",
      label: "Supabase/Auth-backed implementation now",
      description: "Activate backend/Auth/database for Admin/Editor workflow immediately.",
      advantages: [
        "Better for true multi-user login and database-backed queue state.",
        "Cleaner long-term model for action audit and role controls."
      ],
      risks: [
        "Higher implementation complexity.",
        "Higher security and secret-management requirement.",
        "Potential recurring cost and maintenance overhead.",
        "Premature because current public flow has not yet been live-tested."
      ],
      suitable_now: false
    },
    {
      option_id: "option_3_hybrid_staged_path",
      label: "Hybrid staged path",
      description: "Proceed first with GitHub-backed static controlled go-live, then move Supabase/Auth/backend later when the editorial-publication workflow is stable and real multi-user/database needs are unavoidable.",
      advantages: [
        "Balances safety, cost and implementation speed.",
        "Preserves existing static governance system.",
        "Defers backend/Auth until it becomes necessary.",
        "Creates a clean future upgrade path.",
        "Avoids premature database/Auth activation."
      ],
      risks: [
        "Requires discipline to not bypass the later Supabase/Auth reminder checkpoint.",
        "Some Admin/Editor actions may remain simulated or controlled until later activation."
      ],
      suitable_now: true,
      selected: true
    }
  ],
  recommended_option_id: "option_3_hybrid_staged_path",
  ...stageControls
};

const decision = {
  module_id: "AG17A",
  title: "Hybrid Staged Path Decision Record",
  status: "hybrid_staged_go_live_path_selected",
  selected_path: "hybrid_staged_path",
  selected_sequence: [
    {
      sequence_id: "stage_1",
      title: "Static/GitHub-controlled go-live first",
      intent: "Activate the minimum controlled live flow using repository-governed artifacts, static public filter logic and manual Admin review governance.",
      activation_status_now: "planning_only_not_active"
    },
    {
      sequence_id: "stage_2",
      title: "Supabase/Auth/backend later",
      intent: "Move to backend/Auth/database only after the static go-live path is stable and real multi-user or database-backed workflow requirements are confirmed.",
      activation_status_now: "deferred"
    }
  ],
  decision_rationale: [
    "Current Drishvara system has strong file-based governance and static deployment readiness.",
    "Public visibility and publish-control chain has only reached non-active scaffold maturity.",
    "Supabase/Auth activation is not required before proving public content flow.",
    "Hybrid staging reduces cost, risk and implementation complexity.",
    "The system should explicitly remind the user before moving to Supabase/Auth/backend activation."
  ],
  selected_next_stage: "AG17B",
  selected_next_stage_title: "Hybrid Static Go-live Implementation Plan",
  ...stageControls
};

const supabaseReminder = {
  module_id: "AG17A",
  title: "Supabase Auth Defer Reminder Record",
  status: "supabase_auth_deferred_with_future_reminder_required",
  reminder_instruction: "Before any future stage attempts Supabase/Auth/backend activation, explicitly remind the user that the selected path was hybrid staged: static/GitHub-controlled go-live first, Supabase/Auth/backend later.",
  defer_until_any_of_these_conditions_are_true: [
    "Public static go-live flow has been tested end-to-end.",
    "Admin/Editor manual review and publish-control workflow has proven stable.",
    "Multi-user concurrent editorial actions are required.",
    "Database-backed queue state becomes necessary.",
    "Role-based Auth cannot be safely approximated with the static controlled flow.",
    "Audit log requirements exceed static/GitHub-record capability.",
    "User explicitly approves moving from static stage to Supabase/Auth/backend stage."
  ],
  must_not_happen_before_reminder: [
    "No Supabase activation.",
    "No Auth activation.",
    "No database write path.",
    "No real credential creation.",
    "No backend secret wiring.",
    "No migration from static public flow to backend flow."
  ],
  reminder_stage_hint: [
    "Repeat this reminder at AG17Z closure.",
    "Repeat this reminder before any AG18 or later backend/Auth activation plan.",
    "Repeat this reminder before any Supabase project, table, RLS, Auth or Edge Function activation."
  ],
  ...stageControls
};

const blockerRegister = {
  module_id: "AG17A",
  title: "Real Activation Blocker Register",
  status: "real_activation_blockers_recorded",
  blockers_before_real_go_live_execution: [
    {
      blocker_id: "AG17A-BLOCKER-001",
      blocker: "No real Admin/Editor action execution approved.",
      current_status: "blocked"
    },
    {
      blocker_id: "AG17A-BLOCKER-002",
      blocker: "No GitHub write token wiring approved.",
      current_status: "blocked"
    },
    {
      blocker_id: "AG17A-BLOCKER-003",
      blocker: "No public visibility switch approved.",
      current_status: "blocked"
    },
    {
      blocker_id: "AG17A-BLOCKER-004",
      blocker: "No public index mutation approved.",
      current_status: "blocked"
    },
    {
      blocker_id: "AG17A-BLOCKER-005",
      blocker: "No publishing operation approved.",
      current_status: "blocked"
    },
    {
      blocker_id: "AG17A-BLOCKER-006",
      blocker: "No Supabase/Auth/backend activation approved.",
      current_status: "blocked_deferred_for_later_stage"
    }
  ],
  inherited_blockers_from_ag16z: ag16zBlocked.blocked_items_after_ag16_closure,
  ...stageControls
};

const readiness = {
  module_id: "AG17A",
  title: "Hybrid Static Go-live Planning Readiness Record",
  status: "ready_for_ag17b_hybrid_static_go_live_implementation_plan",
  ready_for_ag17b: true,
  ag17b_explicit_approval_required: true,
  selected_path: "hybrid_staged_path",
  static_github_controlled_first: true,
  supabase_auth_deferred: true,
  future_supabase_auth_reminder_required: true,
  article_generation_ready: false,
  article_mutation_ready: false,
  queue_mutation_ready: false,
  admin_action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  github_write_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  publish_ready: false,
  reason: "AG17A selects the hybrid staged path but performs no activation. AG17B should plan static/GitHub-controlled go-live implementation without enabling real actions.",
  ...stageControls
};

const boundary = {
  module_id: "AG17A",
  title: "AG17A to AG17B Hybrid Static Go-live Implementation Plan Boundary",
  status: "ag17b_boundary_created_not_started",
  next_stage_id: "AG17B",
  next_stage_title: "Hybrid Static Go-live Implementation Plan",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path",
  ag17b_allowed_scope: [
    "Plan static/GitHub-controlled go-live architecture.",
    "Define minimum live article approval route.",
    "Define public surface update sequence without executing it.",
    "Define GitHub token/secret requirements without creating or exposing secrets.",
    "Define Admin/Editor action readiness sequence.",
    "Define rollback and audit plan.",
    "Carry forward Supabase/Auth defer reminder."
  ],
  ag17b_blocked_scope: [
    "No new article generation.",
    "No article mutation.",
    "No active queue mutation.",
    "No active Admin Review Queue record creation.",
    "No queue-index mutation.",
    "No Admin/Editor action execution.",
    "No real credentials.",
    "No Auth/backend/Supabase activation.",
    "No GitHub write token wiring.",
    "No public visibility switch.",
    "No public index mutation.",
    "No publishing operation.",
    "No deployment trigger."
  ],
  supabase_auth_defer_reminder_required_in_ag17b: true,
  ...stageControls
};

const schema = {
  module_id: "AG17A",
  title: "Controlled Go-live Implementation Path Decision Schema",
  status: "schema_controlled_go_live_implementation_path_decision_only",
  option_comparison_allowed_in_ag17a: true,
  hybrid_staged_path_decision_allowed_in_ag17a: true,
  supabase_auth_defer_reminder_allowed_in_ag17a: true,
  blocker_register_allowed_in_ag17a: true,
  ag17b_boundary_allowed_in_ag17a: true,

  article_generation_allowed_in_ag17a: false,
  article_mutation_allowed_in_ag17a: false,
  queue_mutation_allowed_in_ag17a: false,
  active_admin_review_queue_record_creation_allowed_in_ag17a: false,
  queue_index_mutation_allowed_in_ag17a: false,
  admin_action_execution_allowed_in_ag17a: false,
  editor_action_execution_allowed_in_ag17a: false,
  real_credential_creation_allowed_in_ag17a: false,
  hardcoded_password_allowed_in_ag17a: false,
  password_hash_commit_allowed_in_ag17a: false,
  auth_activation_allowed_in_ag17a: false,
  backend_activation_allowed_in_ag17a: false,
  supabase_activation_allowed_in_ag17a: false,
  database_write_allowed_in_ag17a: false,
  github_token_creation_or_exposure_allowed_in_ag17a: false,
  github_write_operation_allowed_in_ag17a: false,
  active_action_handler_creation_allowed_in_ag17a: false,
  api_endpoint_creation_allowed_in_ag17a: false,
  public_visibility_switch_allowed_in_ag17a: false,
  public_index_mutation_allowed_in_ag17a: false,
  public_publishing_operation_allowed_in_ag17a: false,
  deployment_trigger_allowed_in_ag17a: false,
  ...stageControls
};

const review = {
  module_id: "AG17A",
  title: "Controlled Go-live Implementation Path Decision",
  status: "hybrid_staged_go_live_path_selected_real_activation_blocked",
  depends_on: ["AG16Z"],
  generated_from: inputs,
  option_comparison_file: "data/content-intelligence/go-live/ag17a-go-live-option-comparison-record.json",
  decision_file: "data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json",
  supabase_reminder_file: "data/content-intelligence/go-live/ag17a-supabase-auth-defer-reminder-record.json",
  blocker_register_file: "data/content-intelligence/quality-registry/ag17a-real-activation-blocker-register.json",
  readiness_file: "data/content-intelligence/quality-registry/ag17a-hybrid-static-go-live-planning-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag17a-to-ag17b-hybrid-static-go-live-implementation-plan-boundary.json",
  schema_file: "data/content-intelligence/schema/controlled-go-live-implementation-path-decision.schema.json",
  summary: {
    selected_path: "hybrid_staged_path",
    static_github_controlled_first: true,
    supabase_auth_deferred: true,
    future_supabase_auth_reminder_required: true,
    ready_for_ag17b: true,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG17A",
  title: "Controlled Go-live Implementation Path Decision Learning",
  status: "learning_record_only",
  learning_points: [
    "The selected go-live path is hybrid staged.",
    "Static/GitHub-controlled go-live should be planned first.",
    "Supabase/Auth/backend activation is deferred and must be explicitly re-flagged later.",
    "AG17B should not create credentials, wire secrets, execute actions or publish.",
    "Real activation must remain blocked until a later controlled apply stage."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG17A",
  title: "Controlled Go-live Implementation Path Decision",
  status: "hybrid_staged_go_live_path_selected_real_activation_blocked",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag17a-controlled-go-live-implementation-path-decision.json",
    option_comparison: "data/content-intelligence/go-live/ag17a-go-live-option-comparison-record.json",
    decision: "data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json",
    supabase_reminder: "data/content-intelligence/go-live/ag17a-supabase-auth-defer-reminder-record.json",
    blocker_register: "data/content-intelligence/quality-registry/ag17a-real-activation-blocker-register.json",
    readiness: "data/content-intelligence/quality-registry/ag17a-hybrid-static-go-live-planning-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag17a-to-ag17b-hybrid-static-go-live-implementation-plan-boundary.json",
    schema: "data/content-intelligence/schema/controlled-go-live-implementation-path-decision.schema.json",
    learning: "data/content-intelligence/learning/ag17a-controlled-go-live-implementation-path-decision-learning.json",
    preview: "data/quality/ag17a-controlled-go-live-implementation-path-decision-preview.json",
    document: "docs/quality/AG17A_CONTROLLED_GO_LIVE_IMPLEMENTATION_PATH_DECISION.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG17A",
  preview_only: true,
  status: "hybrid_staged_go_live_path_selected_real_activation_blocked",
  selected_path: "hybrid_staged_path",
  static_github_controlled_first: true,
  supabase_auth_deferred: true,
  future_supabase_auth_reminder_required: true,
  ready_for_ag17b: true,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG17A — Controlled Go-live Implementation Path Decision

## Purpose

AG17A records the controlled go-live implementation path decision after AG16 closure.

AG17A is decision-only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility, mutate public indexes or publish anything.

## Selected Path

Hybrid staged path.

1. Static/GitHub-controlled go-live first.
2. Supabase/Auth/backend later, only after explicit reminder, review and approval.

## Supabase/Auth Reminder

Before any later stage attempts Supabase/Auth/backend activation, the system must remind the user that the selected path was hybrid staged and that Supabase/Auth was intentionally deferred.

## Next Stage

AG17B — Hybrid Static Go-live Implementation Plan — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(optionComparisonPath, optionComparison);
writeJson(decisionPath, decision);
writeJson(supabaseReminderPath, supabaseReminder);
writeJson(blockerPath, blockerRegister);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG17A Controlled Go-live Implementation Path Decision generated.");
console.log("✅ Hybrid staged path selected.");
console.log("✅ Static/GitHub-controlled go-live first.");
console.log("✅ Supabase/Auth/backend deferred with future reminder required.");
console.log("✅ AG17B Hybrid Static Go-live Implementation Plan boundary created.");
console.log("✅ No activation, credentials, GitHub write, visibility switch, public index mutation or publishing performed.");
