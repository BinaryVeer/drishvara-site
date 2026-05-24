import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag17aReview: "data/content-intelligence/quality-reviews/ag17a-controlled-go-live-implementation-path-decision.json",
  ag17bReview: "data/content-intelligence/quality-reviews/ag17b-hybrid-static-go-live-implementation-plan.json",
  ag17cReview: "data/content-intelligence/quality-reviews/ag17c-hybrid-static-go-live-plan-audit.json",
  ag17dReview: "data/content-intelligence/quality-reviews/ag17d-non-active-static-go-live-implementation-scaffold.json",
  ag17eReview: "data/content-intelligence/quality-reviews/ag17e-non-active-static-go-live-scaffold-audit.json",
  ag17eAudit: "data/content-intelligence/audit-records/ag17e-non-active-static-go-live-scaffold-audit-report.json",
  ag17eClosure: "data/content-intelligence/closure-records/ag17e-non-active-static-go-live-scaffold-closure.json",
  ag17eSafety: "data/content-intelligence/quality-registry/ag17e-non-active-static-go-live-scaffold-safety-record.json",
  ag17eReadiness: "data/content-intelligence/quality-registry/ag17e-static-go-live-chain-closure-readiness-record.json",
  ag17eBoundary: "data/content-intelligence/mutation-plans/ag17e-to-ag17z-static-go-live-chain-closure-boundary.json",
  ag17aDecision: "data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag17dInventory: "data/content-intelligence/go-live/ag17d-non-active-static-go-live-scaffold-inventory.json",
  ag16zSummary: "data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag17z-static-go-live-preparation-chain-closure.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag17z-static-go-live-preparation-chain-closure.json");
const summaryPath = path.join(root, "data/content-intelligence/go-live/ag17z-static-go-live-preparation-summary.json");
const blockedPath = path.join(root, "data/content-intelligence/quality-registry/ag17z-real-static-activation-blocked-register.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag17z-next-path-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag17z-to-ag18a-controlled-real-static-activation-planning-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/static-go-live-preparation-chain-closure.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag17z-static-go-live-preparation-chain-closure-learning.json");
const registryPath = path.join(root, "data/quality/ag17z-static-go-live-preparation-chain-closure.json");
const previewPath = path.join(root, "data/quality/ag17z-static-go-live-preparation-chain-closure-preview.json");
const docPath = path.join(root, "docs/quality/AG17Z_STATIC_GO_LIVE_PREPARATION_CHAIN_CLOSURE.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG17Z input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag17eReview.status !== "non_active_static_go_live_scaffold_audit_passed_ready_for_ag17z_closure") {
  throw new Error("AG17Z requires AG17E review readiness.");
}
if (data.ag17eAudit.failed_checks.length !== 0) {
  throw new Error("AG17Z requires AG17E audit to pass with zero failed checks.");
}
if (data.ag17eReadiness.ready_for_ag17z !== true) {
  throw new Error("AG17Z requires AG17E readiness.");
}
if (data.ag17eBoundary.next_stage_id !== "AG17Z" || data.ag17eBoundary.explicit_approval_required !== true) {
  throw new Error("AG17Z requires AG17E to AG17Z explicit boundary.");
}
if (data.ag17aDecision.selected_path !== "hybrid_staged_path") {
  throw new Error("AG17Z requires hybrid staged path lineage.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG17Z requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  static_go_live_preparation_chain_closure_only: true,
  ag17_chain_closure_created_in_ag17z: true,
  static_go_live_preparation_summary_created_in_ag17z: true,
  real_static_activation_blocked_register_created_in_ag17z: true,
  ag18a_boundary_created_in_ag17z: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag17z: false,
  article_mutation_performed_in_ag17z: false,
  queue_mutation_performed_in_ag17z: false,
  active_admin_review_queue_record_created_in_ag17z: false,
  queue_index_mutation_performed_in_ag17z: false,
  admin_action_execution_performed_in_ag17z: false,
  editor_action_execution_performed_in_ag17z: false,
  real_credential_created_in_ag17z: false,
  hardcoded_password_created_in_repo_in_ag17z: false,
  password_hash_created_in_repo_in_ag17z: false,
  auth_activation_performed_in_ag17z: false,
  backend_activation_performed_in_ag17z: false,
  supabase_activation_performed_in_ag17z: false,
  database_write_performed_in_ag17z: false,
  github_token_created_or_exposed_in_ag17z: false,
  github_write_operation_performed_in_ag17z: false,
  active_action_handler_created_in_ag17z: false,
  api_endpoint_created_in_ag17z: false,
  public_visibility_switch_performed_in_ag17z: false,
  public_index_mutation_performed_in_ag17z: false,
  deployment_trigger_performed_in_ag17z: false,
  public_publishing_operation_performed_in_ag17z: false
};

const completedStages = [
  {
    stage_id: "AG17A",
    title: "Controlled Go-live Implementation Path Decision",
    result: "Selected hybrid staged path: static/GitHub-controlled first, Supabase/Auth/backend later."
  },
  {
    stage_id: "AG17B",
    title: "Hybrid Static Go-live Implementation Plan",
    result: "Planned static/GitHub first architecture, public exposure sequence, no-secrets GitHub requirements, Admin/Editor readiness, rollback/audit plan and Supabase/Auth defer reminder."
  },
  {
    stage_id: "AG17C",
    title: "Hybrid Static Go-live Implementation Plan Audit",
    result: "Audited AG17B plan with zero failed checks and approved only non-active static go-live scaffold."
  },
  {
    stage_id: "AG17D",
    title: "Non-active Static Go-live Implementation Scaffold",
    result: "Created non-active static go-live helper and no-write/no-deployment/no-publishing templates outside /api."
  },
  {
    stage_id: "AG17E",
    title: "Non-active Static Go-live Implementation Scaffold Audit",
    result: "Audited scaffold with zero failed checks and confirmed no live GitHub write, visibility, public index, deployment, publish or Supabase/Auth/backend path."
  }
];

const summary = {
  module_id: "AG17Z",
  title: "Static Go-live Preparation Summary",
  status: "ag17_static_go_live_preparation_chain_completed",
  selected_path: "hybrid_staged_path",
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
  final_static_go_live_preparation_state: {
    path_decision_completed: true,
    static_architecture_planned: true,
    public_exposure_sequence_planned: true,
    github_secret_requirements_planned_no_secrets: true,
    admin_editor_static_action_readiness_planned: true,
    rollback_audit_plan_defined: true,
    non_active_static_go_live_scaffold_created: true,
    non_active_static_go_live_scaffold_audited: true,
    github_write_enabled: false,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    admin_editor_execution_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_mutation_enabled: false,
    deployment_trigger_enabled: false,
    publishing_enabled: false,
    supabase_auth_backend_enabled: false
  },
  inherited_public_visibility_controls: data.ag16zSummary.final_public_control_state,
  ...stageControls
};

const blockedRegister = {
  module_id: "AG17Z",
  title: "Real Static Activation Blocked Register",
  status: "real_static_activation_operations_remain_blocked",
  blocked_items_after_ag17_closure: [
    "Real GitHub write token creation.",
    "Real GitHub token exposure or wiring.",
    "Real GitHub content write.",
    "Real Admin/Editor action execution.",
    "Real public visibility switch.",
    "Real public index mutation.",
    "Featured Reads listing mutation.",
    "Category listing mutation.",
    "Homepage article card mutation.",
    "Sitemap/feed/search index mutation.",
    "Deployment trigger.",
    "Publish execution.",
    "Post-deployment live smoke test execution.",
    "Supabase/Auth/backend activation.",
    "Database write path."
  ],
  allowed_after_ag17z_without_new_approval: [
    "Review AG17 static go-live preparation records.",
    "Review non-active static go-live scaffold.",
    "Proceed to controlled real static activation planning."
  ],
  not_allowed_after_ag17z_without_new_approval: [
    "Create or wire GitHub token.",
    "Perform GitHub write.",
    "Switch public_visibility to true.",
    "Mutate public indexes.",
    "Trigger deployment.",
    "Publish any article.",
    "Enable Admin/Editor action execution.",
    "Activate Supabase/Auth/backend."
  ],
  supabase_auth_backend_deferred: true,
  reminder: data.ag17bSupabaseReminder.reminder,
  ...stageControls
};

const readiness = {
  module_id: "AG17Z",
  title: "Next Path Readiness Record",
  status: "ready_for_ag18a_controlled_real_static_activation_planning",
  ready_for_ag18a: true,
  ag18a_explicit_approval_required: true,
  ag17_chain_closed: true,
  selected_path: "hybrid_staged_path",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  supabase_auth_reminder_required_in_future: true,
  recommended_next_stage: "AG18A",
  recommended_next_stage_title: "Controlled Real Static Activation Planning",
  reason: "AG17 closes static-first go-live preparation at governed non-active level. The next safe layer is controlled planning for real static activation, still without writing to GitHub, switching visibility, mutating public indexes, deploying or publishing.",
  article_generation_ready: false,
  article_mutation_ready: false,
  queue_mutation_ready: false,
  admin_action_execution_ready: false,
  editor_action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  github_write_ready: false,
  github_token_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  ...stageControls
};

const boundary = {
  module_id: "AG17Z",
  title: "AG17Z to AG18A Controlled Real Static Activation Planning Boundary",
  status: "ag18a_boundary_created_not_started",
  next_stage_id: "AG18A",
  next_stage_title: "Controlled Real Static Activation Planning",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag18a_allowed_scope: [
    "Plan real static activation sequence.",
    "Define required GitHub token/secret governance without creating secrets.",
    "Define first controlled public exposure candidate selection.",
    "Define file delta review requirements.",
    "Define rollback and live smoke-test gates.",
    "Define manual approval checkpoints.",
    "Carry forward Supabase/Auth/backend defer reminder."
  ],
  ag18a_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag18a: true,
  ...stageControls
};

const closure = {
  module_id: "AG17Z",
  title: "Static Go-live Preparation Chain Closure",
  status: "static_go_live_preparation_chain_closed_real_activation_blocked",
  closure_scope: [
    "Hybrid staged path decision.",
    "Static/GitHub-controlled first architecture plan.",
    "Controlled public exposure sequence plan.",
    "GitHub secret requirements plan with no secrets created.",
    "Admin/Editor static action readiness plan.",
    "Rollback and audit plan.",
    "Non-active static go-live implementation scaffold.",
    "Non-active static go-live scaffold audit.",
    "Supabase/Auth/backend defer reminder."
  ],
  final_decision: {
    ag17_chain_closed: true,
    static_github_controlled_first_confirmed: true,
    supabase_auth_backend_deferred: true,
    future_supabase_auth_reminder_required: true,
    future_real_static_activation_blocked_until_ag18_or_later: true,
    proceed_to_ag18a_controlled_real_static_activation_planning: true,
    proceed_to_real_github_write: false,
    proceed_to_public_visibility_switch: false,
    proceed_to_public_index_mutation: false,
    proceed_to_deployment_trigger: false,
    proceed_to_publish_execution: false,
    proceed_to_supabase_auth_backend_activation: false
  },
  ...stageControls
};

const schema = {
  module_id: "AG17Z",
  title: "Static Go-live Preparation Chain Closure Schema",
  status: "schema_static_go_live_preparation_chain_closure_only",
  chain_closure_allowed_in_ag17z: true,
  preparation_summary_allowed_in_ag17z: true,
  blocked_register_allowed_in_ag17z: true,
  next_path_boundary_allowed_in_ag17z: true,

  article_generation_allowed_in_ag17z: false,
  article_mutation_allowed_in_ag17z: false,
  queue_mutation_allowed_in_ag17z: false,
  active_admin_review_queue_record_creation_allowed_in_ag17z: false,
  queue_index_mutation_allowed_in_ag17z: false,
  admin_action_execution_allowed_in_ag17z: false,
  editor_action_execution_allowed_in_ag17z: false,
  real_credential_creation_allowed_in_ag17z: false,
  hardcoded_password_allowed_in_ag17z: false,
  password_hash_commit_allowed_in_ag17z: false,
  auth_activation_allowed_in_ag17z: false,
  backend_activation_allowed_in_ag17z: false,
  supabase_activation_allowed_in_ag17z: false,
  database_write_allowed_in_ag17z: false,
  github_token_creation_or_exposure_allowed_in_ag17z: false,
  github_write_operation_allowed_in_ag17z: false,
  active_action_handler_creation_allowed_in_ag17z: false,
  api_endpoint_creation_allowed_in_ag17z: false,
  public_visibility_switch_allowed_in_ag17z: false,
  public_index_mutation_allowed_in_ag17z: false,
  public_publishing_operation_allowed_in_ag17z: false,
  deployment_trigger_allowed_in_ag17z: false,
  ...stageControls
};

const review = {
  module_id: "AG17Z",
  title: "Static Go-live Preparation Chain Closure",
  status: "static_go_live_preparation_chain_closed_real_activation_blocked",
  depends_on: ["AG17A", "AG17B", "AG17C", "AG17D", "AG17E"],
  generated_from: inputs,
  closure_file: "data/content-intelligence/closure-records/ag17z-static-go-live-preparation-chain-closure.json",
  summary_file: "data/content-intelligence/go-live/ag17z-static-go-live-preparation-summary.json",
  blocked_register_file: "data/content-intelligence/quality-registry/ag17z-real-static-activation-blocked-register.json",
  readiness_file: "data/content-intelligence/quality-registry/ag17z-next-path-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag17z-to-ag18a-controlled-real-static-activation-planning-boundary.json",
  schema_file: "data/content-intelligence/schema/static-go-live-preparation-chain-closure.schema.json",
  summary: {
    completed_stage_count: completedStages.length,
    ag17_chain_closed: true,
    selected_path: "hybrid_staged_path",
    static_github_controlled_first: true,
    supabase_auth_backend_deferred: true,
    ready_for_ag18a: true,
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
  module_id: "AG17Z",
  title: "Static Go-live Preparation Chain Closure Learning",
  status: "learning_record_only",
  learning_points: [
    "The AG17 static-first go-live preparation chain is closed at non-active level.",
    "Hybrid staged path remains selected: static/GitHub first and Supabase/Auth/backend later.",
    "Real static activation still requires separate controlled planning and approval.",
    "No GitHub token, GitHub write, public visibility switch, public index mutation, deployment or publish operation has occurred.",
    "Supabase/Auth/backend remains deferred and must be explicitly re-flagged before any future backend activation stage."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG17Z",
  title: "Static Go-live Preparation Chain Closure",
  status: "static_go_live_preparation_chain_closed_real_activation_blocked",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag17z-static-go-live-preparation-chain-closure.json",
    closure: "data/content-intelligence/closure-records/ag17z-static-go-live-preparation-chain-closure.json",
    summary: "data/content-intelligence/go-live/ag17z-static-go-live-preparation-summary.json",
    blocked_register: "data/content-intelligence/quality-registry/ag17z-real-static-activation-blocked-register.json",
    readiness: "data/content-intelligence/quality-registry/ag17z-next-path-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag17z-to-ag18a-controlled-real-static-activation-planning-boundary.json",
    schema: "data/content-intelligence/schema/static-go-live-preparation-chain-closure.schema.json",
    learning: "data/content-intelligence/learning/ag17z-static-go-live-preparation-chain-closure-learning.json",
    preview: "data/quality/ag17z-static-go-live-preparation-chain-closure-preview.json",
    document: "docs/quality/AG17Z_STATIC_GO_LIVE_PREPARATION_CHAIN_CLOSURE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG17Z",
  preview_only: true,
  status: "static_go_live_preparation_chain_closed_real_activation_blocked",
  completed_stage_count: completedStages.length,
  ag17_chain_closed: true,
  selected_path: "hybrid_staged_path",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  ready_for_ag18a: true,
  github_write_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG17Z — Static Go-live Preparation Chain Closure

## Purpose

AG17Z closes the static-first go-live preparation chain.

AG17Z is closure only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Completed Chain

- AG17A — controlled go-live implementation path decision.
- AG17B — hybrid static go-live implementation plan.
- AG17C — hybrid static go-live implementation plan audit.
- AG17D — non-active static go-live implementation scaffold.
- AG17E — non-active static go-live scaffold audit.

## Final Decision

AG17 chain is closed. The selected path remains hybrid staged: static/GitHub-controlled first, Supabase/Auth/backend later.

Real static activation remains blocked until AG18A or later controlled planning and approval.

## Supabase/Auth Reminder

Before any future Supabase/Auth/backend activation stage, remind the user that Supabase/Auth/backend was intentionally deferred under the hybrid staged path.

## Next Stage

AG18A — Controlled Real Static Activation Planning — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(closurePath, closure);
writeJson(summaryPath, summary);
writeJson(blockedPath, blockedRegister);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG17Z Static Go-live Preparation Chain Closure generated.");
console.log("✅ AG17A to AG17E chain closed.");
console.log("✅ Hybrid staged path confirmed: static/GitHub-controlled first, Supabase/Auth/backend later.");
console.log("✅ Real static activation remains blocked.");
console.log("✅ GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
console.log("✅ AG18A Controlled Real Static Activation Planning boundary created.");
