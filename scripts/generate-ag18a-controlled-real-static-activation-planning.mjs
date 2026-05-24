import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag17zReview: "data/content-intelligence/quality-reviews/ag17z-static-go-live-preparation-chain-closure.json",
  ag17zClosure: "data/content-intelligence/closure-records/ag17z-static-go-live-preparation-chain-closure.json",
  ag17zSummary: "data/content-intelligence/go-live/ag17z-static-go-live-preparation-summary.json",
  ag17zBlocked: "data/content-intelligence/quality-registry/ag17z-real-static-activation-blocked-register.json",
  ag17zReadiness: "data/content-intelligence/quality-registry/ag17z-next-path-readiness-record.json",
  ag17zBoundary: "data/content-intelligence/mutation-plans/ag17z-to-ag18a-controlled-real-static-activation-planning-boundary.json",
  ag17aDecision: "data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag16zSummary: "data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json",
  ag15zSummary: "data/content-intelligence/content-pipeline/ag15z-generated-article-admin-queue-preparation-summary.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag18a-controlled-real-static-activation-planning.json");
const sequencePath = path.join(root, "data/content-intelligence/go-live/ag18a-real-static-activation-sequence-plan.json");
const candidatePath = path.join(root, "data/content-intelligence/go-live/ag18a-first-public-candidate-selection-plan.json");
const secretPath = path.join(root, "data/content-intelligence/go-live/ag18a-github-secret-governance-no-secrets-plan.json");
const deltaPath = path.join(root, "data/content-intelligence/go-live/ag18a-public-index-delta-review-plan.json");
const rollbackPath = path.join(root, "data/content-intelligence/go-live/ag18a-rollback-smoke-test-plan.json");
const blockerPath = path.join(root, "data/content-intelligence/quality-registry/ag18a-real-static-activation-blocker-register.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag18a-controlled-real-static-activation-plan-audit-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag18a-to-ag18b-controlled-real-static-activation-plan-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/controlled-real-static-activation-planning.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag18a-controlled-real-static-activation-planning-learning.json");
const registryPath = path.join(root, "data/quality/ag18a-controlled-real-static-activation-planning.json");
const previewPath = path.join(root, "data/quality/ag18a-controlled-real-static-activation-planning-preview.json");
const docPath = path.join(root, "docs/quality/AG18A_CONTROLLED_REAL_STATIC_ACTIVATION_PLANNING.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG18A input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag17zReview.status !== "static_go_live_preparation_chain_closed_real_activation_blocked") {
  throw new Error("AG18A requires AG17Z closure review.");
}
if (data.ag17zClosure.final_decision.ag17_chain_closed !== true) {
  throw new Error("AG18A requires AG17 chain to be closed.");
}
if (data.ag17zReadiness.ready_for_ag18a !== true) {
  throw new Error("AG18A requires AG17Z readiness.");
}
if (data.ag17zBoundary.next_stage_id !== "AG18A" || data.ag17zBoundary.explicit_approval_required !== true) {
  throw new Error("AG18A requires AG17Z to AG18A explicit boundary.");
}
if (data.ag17aDecision.selected_path !== "hybrid_staged_path") {
  throw new Error("AG18A requires hybrid staged path lineage.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG18A requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  controlled_real_static_activation_planning_only: true,
  real_static_activation_sequence_plan_created_in_ag18a: true,
  first_public_candidate_selection_plan_created_in_ag18a: true,
  github_secret_governance_no_secrets_plan_created_in_ag18a: true,
  public_index_delta_review_plan_created_in_ag18a: true,
  rollback_smoke_test_plan_created_in_ag18a: true,
  real_static_activation_blocker_register_created_in_ag18a: true,
  ag18b_boundary_created_in_ag18a: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag18a: false,
  article_mutation_performed_in_ag18a: false,
  queue_mutation_performed_in_ag18a: false,
  active_admin_review_queue_record_created_in_ag18a: false,
  queue_index_mutation_performed_in_ag18a: false,
  admin_action_execution_performed_in_ag18a: false,
  editor_action_execution_performed_in_ag18a: false,
  real_credential_created_in_ag18a: false,
  hardcoded_password_created_in_repo_in_ag18a: false,
  password_hash_created_in_repo_in_ag18a: false,
  auth_activation_performed_in_ag18a: false,
  backend_activation_performed_in_ag18a: false,
  supabase_activation_performed_in_ag18a: false,
  database_write_performed_in_ag18a: false,
  github_token_created_or_exposed_in_ag18a: false,
  github_write_operation_performed_in_ag18a: false,
  active_action_handler_created_in_ag18a: false,
  api_endpoint_created_in_ag18a: false,
  public_visibility_switch_performed_in_ag18a: false,
  public_index_mutation_performed_in_ag18a: false,
  deployment_trigger_performed_in_ag18a: false,
  public_publishing_operation_performed_in_ag18a: false
};

const sequencePlan = {
  module_id: "AG18A",
  title: "Real Static Activation Sequence Plan",
  status: "real_static_activation_sequence_planned_no_execution",
  selected_path: "hybrid_staged_path_static_first",
  purpose: "Plan the first real static activation sequence without executing any write, visibility switch, public index mutation, deployment or publishing.",
  sequence: [
    {
      order: 1,
      step_id: "confirm_candidate",
      description: "Confirm first public candidate from Admin Review Queue and quality evidence records.",
      execution_now: false
    },
    {
      order: 2,
      step_id: "confirm_admin_approval",
      description: "Verify Admin approval decision and evidence references before any public exposure.",
      execution_now: false
    },
    {
      order: 3,
      step_id: "confirm_public_filter",
      description: "Verify public_visibility, publish_approved, public_index_allowed, hash integrity, quality and preview controls.",
      execution_now: false
    },
    {
      order: 4,
      step_id: "prepare_file_delta_review",
      description: "Prepare exact intended file delta for public indexes and reading surfaces, but do not mutate files.",
      execution_now: false
    },
    {
      order: 5,
      step_id: "confirm_secret_governance",
      description: "Confirm future GitHub token/secret governance without creating, exposing or wiring secrets.",
      execution_now: false
    },
    {
      order: 6,
      step_id: "confirm_rollback_path",
      description: "Confirm rollback commit/path and pre-write hash evidence.",
      execution_now: false
    },
    {
      order: 7,
      step_id: "confirm_manual_approval_gate",
      description: "Require explicit user approval before any later real apply stage.",
      execution_now: false
    },
    {
      order: 8,
      step_id: "future_controlled_apply",
      description: "Future stage may apply exact approved delta only after AG18/AG19 audit closure and explicit approval.",
      execution_now: false
    },
    {
      order: 9,
      step_id: "future_deployment_smoke_test",
      description: "Future stage may trigger deployment and smoke-test only after controlled apply and audit.",
      execution_now: false
    }
  ],
  execution_state_now: {
    candidate_confirmed_for_real_publish: false,
    file_delta_created: false,
    github_secret_created: false,
    github_write_performed: false,
    public_visibility_switched: false,
    public_index_mutated: false,
    deployment_triggered: false,
    article_published: false
  },
  ...stageControls
};

const candidatePlan = {
  module_id: "AG18A",
  title: "First Public Candidate Selection Plan",
  status: "first_public_candidate_selection_planned_no_selection_apply",
  purpose: "Define how the first public article candidate will be selected for real static activation, without making it public.",
  candidate_under_consideration: {
    source_record: inputs.ag13zCandidate,
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true,
    candidate_status_now: "under_consideration_only_not_selected_for_real_apply"
  },
  eligibility_requirements_before_future_apply: [
    "Admin approval decision must exist.",
    "Quality evidence must be complete.",
    "Reference links must be verified or marked under editorial verification.",
    "Image credit/attribution must be present where applicable.",
    "Layout preview must pass.",
    "Article hash must match approved hash.",
    "Public filter must pass.",
    "Public surface delta must be reviewed.",
    "Rollback path must be recorded.",
    "Manual approval must be given before any real write."
  ],
  selection_decision_now: {
    first_candidate_selected_for_real_apply: false,
    public_visibility_enabled: false,
    publish_approved_enabled: false,
    public_index_allowed_enabled: false
  },
  ...stageControls
};

const secretPlan = {
  module_id: "AG18A",
  title: "GitHub Secret Governance No-Secrets Plan",
  status: "github_secret_governance_planned_no_secrets_created",
  purpose: "Define future GitHub token/secret governance without creating, exposing or wiring any credential.",
  future_secret_placeholders: [
    {
      name: "GITHUB_CONTENT_WRITE_TOKEN",
      intended_use: "Future least-privilege repository write for approved static content/public index deltas.",
      created_now: false,
      exposed_now: false,
      wired_now: false,
      committed_now: false
    },
    {
      name: "GITHUB_CONTENT_WRITE_BRANCH",
      intended_use: "Future branch target for controlled static apply.",
      created_now: false,
      exposed_now: false,
      wired_now: false,
      committed_now: false
    },
    {
      name: "GO_LIVE_MANUAL_APPROVAL_KEY",
      intended_use: "Future optional server-side/manual approval guard.",
      created_now: false,
      exposed_now: false,
      wired_now: false,
      committed_now: false
    }
  ],
  governance_rules: [
    "Never commit tokens to repository.",
    "Never place secrets in JSON records, scripts, docs, logs or chat.",
    "Use least-privilege repository scope.",
    "Prefer environment secret manager or local secure process only at later approved apply stage.",
    "Record pre-write commit hash before using any token.",
    "Record rollback path before using any token.",
    "Require explicit manual approval before first real write."
  ],
  current_secret_state: {
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_write_enabled: false
  },
  inherited_plan_reference: inputs.ag17zBlocked,
  ...stageControls
};

const deltaPlan = {
  module_id: "AG18A",
  title: "Public Index Delta Review Plan",
  status: "public_index_delta_review_planned_no_mutation",
  purpose: "Define how intended public surface/file deltas will be reviewed before any future static apply.",
  future_delta_targets: [
    {
      target_id: "featured_reads_index",
      description: "Featured Reads listing or index entry for the approved article.",
      mutation_now: false
    },
    {
      target_id: "category_listing",
      description: "Category/topic listing entry where article belongs.",
      mutation_now: false
    },
    {
      target_id: "homepage_card",
      description: "Homepage reading surface card only if the article is selected for homepage exposure.",
      mutation_now: false
    },
    {
      target_id: "episode_index",
      description: "Future weekly/episodic index if article belongs to an episode series.",
      mutation_now: false
    },
    {
      target_id: "sitemap_feed_search",
      description: "Sitemap/feed/search index only if AG19/AG20 approve it.",
      mutation_now: false
    }
  ],
  review_requirements_before_future_mutation: [
    "Before/after diff must be generated.",
    "Only approved files may appear in delta.",
    "No unrelated public file may change.",
    "No hidden credential or token may appear in delta.",
    "Article URL/slug must be stable.",
    "Previous/next/related links must be safe if episode flow applies.",
    "Mobile layout impact must be reviewed.",
    "Rollback must be defined."
  ],
  mutation_state_now: {
    public_index_delta_generated: false,
    public_index_mutated: false,
    featured_reads_mutated: false,
    homepage_mutated: false,
    sitemap_feed_mutated: false
  },
  inherited_public_controls: data.ag16zSummary.final_public_control_state,
  ...stageControls
};

const rollbackPlan = {
  module_id: "AG18A",
  title: "Rollback and Smoke-test Plan",
  status: "rollback_smoke_test_planned_no_execution",
  purpose: "Define rollback and live smoke-test gates for future real static activation.",
  rollback_requirements_before_future_apply: [
    "Record current branch and commit hash.",
    "Record approved file delta.",
    "Record revert command or rollback commit path.",
    "Record expected public URL.",
    "Record affected public surfaces.",
    "Record Admin approval and public filter evidence.",
    "Keep one-step rollback instruction ready before pushing."
  ],
  smoke_test_requirements_after_future_apply: [
    "Article URL opens.",
    "Featured Reads card appears correctly.",
    "Category listing appears correctly.",
    "Homepage card appears only if approved.",
    "Image credit and references render correctly.",
    "Mobile layout does not break.",
    "No unpublished/returned/archived articles appear publicly.",
    "Sitemap/feed/search changes behave only as approved."
  ],
  current_execution_state: {
    rollback_executed: false,
    smoke_test_executed: false,
    deployment_triggered: false,
    live_public_observation_performed: false
  },
  inherited_rollback_reference: inputs.ag17zSummary,
  ...stageControls
};

const blockerRegister = {
  module_id: "AG18A",
  title: "Real Static Activation Blocker Register",
  status: "real_static_activation_blockers_reconfirmed",
  blockers: [
    "No real GitHub token creation.",
    "No real GitHub token exposure or wiring.",
    "No real GitHub write.",
    "No Admin/Editor action execution.",
    "No article mutation.",
    "No active queue mutation.",
    "No public visibility switch.",
    "No public index mutation.",
    "No Featured Reads mutation.",
    "No homepage card mutation.",
    "No deployment trigger.",
    "No publishing operation.",
    "No Supabase/Auth/backend activation.",
    "No database write path."
  ],
  carried_forward_from_ag17z: data.ag17zBlocked.blocked_items_after_ag17_closure,
  supabase_auth_backend_deferred: true,
  reminder: data.ag17bSupabaseReminder.reminder,
  ...stageControls
};

const readiness = {
  module_id: "AG18A",
  title: "Controlled Real Static Activation Plan Audit Readiness Record",
  status: "ready_for_ag18b_controlled_real_static_activation_plan_audit",
  ready_for_ag18b: true,
  ag18b_explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  supabase_auth_reminder_required_in_future: true,
  real_static_activation_sequence_plan_defined: true,
  first_public_candidate_selection_plan_defined: true,
  github_secret_governance_defined_no_secrets: true,
  public_index_delta_review_plan_defined: true,
  rollback_smoke_test_plan_defined: true,
  blocker_register_reconfirmed: true,
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
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  reason: "AG18A defines controlled real static activation planning only. AG18B should audit the plan before any dry-run or pre-apply readiness stage.",
  ...stageControls
};

const boundary = {
  module_id: "AG18A",
  title: "AG18A to AG18B Controlled Real Static Activation Plan Audit Boundary",
  status: "ag18b_boundary_created_not_started",
  next_stage_id: "AG18B",
  next_stage_title: "Controlled Real Static Activation Plan Audit",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag18b_allowed_scope: [
    "Audit AG18A real static activation sequence plan.",
    "Audit first public candidate selection plan.",
    "Audit GitHub secret governance plan and confirm no secrets were created.",
    "Audit public index delta review plan.",
    "Audit rollback and smoke-test plan.",
    "Audit blocker register.",
    "Confirm Supabase/Auth/backend remains deferred.",
    "Decide readiness for first public candidate and file delta dry-run."
  ],
  ag18b_blocked_scope: [
    "No new article generation.",
    "No article mutation.",
    "No active queue mutation.",
    "No active Admin Review Queue record creation.",
    "No queue-index mutation.",
    "No Admin/Editor action execution.",
    "No real credentials.",
    "No Auth/backend/Supabase activation.",
    "No GitHub write token creation or wiring.",
    "No GitHub content write.",
    "No public visibility switch.",
    "No public index mutation.",
    "No publishing operation.",
    "No deployment trigger."
  ],
  supabase_auth_defer_reminder_required_in_ag18b: true,
  ...stageControls
};

const schema = {
  module_id: "AG18A",
  title: "Controlled Real Static Activation Planning Schema",
  status: "schema_controlled_real_static_activation_planning_only",
  real_static_activation_sequence_plan_allowed_in_ag18a: true,
  first_public_candidate_selection_plan_allowed_in_ag18a: true,
  github_secret_governance_no_secrets_plan_allowed_in_ag18a: true,
  public_index_delta_review_plan_allowed_in_ag18a: true,
  rollback_smoke_test_plan_allowed_in_ag18a: true,
  blocker_register_allowed_in_ag18a: true,
  ag18b_boundary_allowed_in_ag18a: true,

  article_generation_allowed_in_ag18a: false,
  article_mutation_allowed_in_ag18a: false,
  queue_mutation_allowed_in_ag18a: false,
  active_admin_review_queue_record_creation_allowed_in_ag18a: false,
  queue_index_mutation_allowed_in_ag18a: false,
  admin_action_execution_allowed_in_ag18a: false,
  editor_action_execution_allowed_in_ag18a: false,
  real_credential_creation_allowed_in_ag18a: false,
  hardcoded_password_allowed_in_ag18a: false,
  password_hash_commit_allowed_in_ag18a: false,
  auth_activation_allowed_in_ag18a: false,
  backend_activation_allowed_in_ag18a: false,
  supabase_activation_allowed_in_ag18a: false,
  database_write_allowed_in_ag18a: false,
  github_token_creation_or_exposure_allowed_in_ag18a: false,
  github_write_operation_allowed_in_ag18a: false,
  active_action_handler_creation_allowed_in_ag18a: false,
  api_endpoint_creation_allowed_in_ag18a: false,
  public_visibility_switch_allowed_in_ag18a: false,
  public_index_mutation_allowed_in_ag18a: false,
  public_publishing_operation_allowed_in_ag18a: false,
  deployment_trigger_allowed_in_ag18a: false,
  ...stageControls
};

const review = {
  module_id: "AG18A",
  title: "Controlled Real Static Activation Planning",
  status: "controlled_real_static_activation_planning_defined_real_activation_blocked",
  depends_on: ["AG17Z"],
  generated_from: inputs,
  sequence_plan_file: "data/content-intelligence/go-live/ag18a-real-static-activation-sequence-plan.json",
  candidate_plan_file: "data/content-intelligence/go-live/ag18a-first-public-candidate-selection-plan.json",
  github_secret_governance_file: "data/content-intelligence/go-live/ag18a-github-secret-governance-no-secrets-plan.json",
  public_index_delta_review_file: "data/content-intelligence/go-live/ag18a-public-index-delta-review-plan.json",
  rollback_smoke_test_file: "data/content-intelligence/go-live/ag18a-rollback-smoke-test-plan.json",
  blocker_register_file: "data/content-intelligence/quality-registry/ag18a-real-static-activation-blocker-register.json",
  readiness_file: "data/content-intelligence/quality-registry/ag18a-controlled-real-static-activation-plan-audit-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag18a-to-ag18b-controlled-real-static-activation-plan-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/controlled-real-static-activation-planning.schema.json",
  summary: {
    selected_path: "hybrid_staged_path_static_first",
    static_github_controlled_first: true,
    supabase_auth_backend_deferred: true,
    ready_for_ag18b: true,
    github_token_ready: false,
    github_write_ready: false,
    public_visibility_switch_ready: false,
    public_index_mutation_ready: false,
    deployment_trigger_ready: false,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG18A",
  title: "Controlled Real Static Activation Planning Learning",
  status: "learning_record_only",
  learning_points: [
    "AG18A is the first real static activation planning stage, not an execution stage.",
    "Candidate selection, file delta, GitHub secret governance, rollback and smoke-test requirements are now planned.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing has occurred.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path.",
    "AG18B should audit AG18A before moving to candidate/file-delta dry-run."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG18A",
  title: "Controlled Real Static Activation Planning",
  status: "controlled_real_static_activation_planning_defined_real_activation_blocked",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag18a-controlled-real-static-activation-planning.json",
    sequence_plan: "data/content-intelligence/go-live/ag18a-real-static-activation-sequence-plan.json",
    candidate_plan: "data/content-intelligence/go-live/ag18a-first-public-candidate-selection-plan.json",
    github_secret_governance: "data/content-intelligence/go-live/ag18a-github-secret-governance-no-secrets-plan.json",
    public_index_delta_review: "data/content-intelligence/go-live/ag18a-public-index-delta-review-plan.json",
    rollback_smoke_test: "data/content-intelligence/go-live/ag18a-rollback-smoke-test-plan.json",
    blocker_register: "data/content-intelligence/quality-registry/ag18a-real-static-activation-blocker-register.json",
    readiness: "data/content-intelligence/quality-registry/ag18a-controlled-real-static-activation-plan-audit-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag18a-to-ag18b-controlled-real-static-activation-plan-audit-boundary.json",
    schema: "data/content-intelligence/schema/controlled-real-static-activation-planning.schema.json",
    learning: "data/content-intelligence/learning/ag18a-controlled-real-static-activation-planning-learning.json",
    preview: "data/quality/ag18a-controlled-real-static-activation-planning-preview.json",
    document: "docs/quality/AG18A_CONTROLLED_REAL_STATIC_ACTIVATION_PLANNING.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG18A",
  preview_only: true,
  status: "controlled_real_static_activation_planning_defined_real_activation_blocked",
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  ready_for_ag18b: true,
  github_token_ready: false,
  github_write_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG18A — Controlled Real Static Activation Planning

## Purpose

AG18A plans the first controlled real static activation path after AG17Z closure.

AG18A is planning only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Selected Path

Hybrid staged path remains in force:

1. Static/GitHub-controlled go-live first.
2. Supabase/Auth/backend later, only after explicit reminder, review and approval.

## Planned Outputs

- Real static activation sequence plan
- First public candidate selection plan
- GitHub secret governance plan with no secrets created
- Public index/file delta review plan
- Rollback and smoke-test plan
- Real static activation blocker register

## Supabase/Auth Reminder

Supabase/Auth/backend remains deferred. Before any future backend/Auth/Supabase activation stage, remind the user that the approved route is static/GitHub-controlled first and Supabase/Auth/backend later.

## Next Stage

AG18B — Controlled Real Static Activation Plan Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(sequencePath, sequencePlan);
writeJson(candidatePath, candidatePlan);
writeJson(secretPath, secretPlan);
writeJson(deltaPath, deltaPlan);
writeJson(rollbackPath, rollbackPlan);
writeJson(blockerPath, blockerRegister);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG18A Controlled Real Static Activation Planning generated.");
console.log("✅ Real static activation sequence planned without execution.");
console.log("✅ Candidate selection, public delta, secret governance, rollback and smoke-test plans created.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
console.log("✅ AG18B Controlled Real Static Activation Plan Audit boundary created.");
