import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag18aReview: "data/content-intelligence/quality-reviews/ag18a-controlled-real-static-activation-planning.json",
  ag18bReview: "data/content-intelligence/quality-reviews/ag18b-controlled-real-static-activation-plan-audit.json",
  ag18cReview: "data/content-intelligence/quality-reviews/ag18c-first-public-candidate-file-delta-dry-run.json",
  ag18dReview: "data/content-intelligence/quality-reviews/ag18d-first-public-candidate-file-delta-dry-run-audit.json",
  ag18eReview: "data/content-intelligence/quality-reviews/ag18e-non-active-real-static-activation-scaffold.json",
  ag18fReview: "data/content-intelligence/quality-reviews/ag18f-non-active-real-static-activation-scaffold-audit.json",
  ag18fAudit: "data/content-intelligence/audit-records/ag18f-non-active-real-static-activation-scaffold-audit-report.json",
  ag18fClosure: "data/content-intelligence/closure-records/ag18f-non-active-real-static-activation-scaffold-audit-closure.json",
  ag18fSafety: "data/content-intelligence/quality-registry/ag18f-non-active-real-static-activation-scaffold-safety-record.json",
  ag18fReadiness: "data/content-intelligence/quality-registry/ag18f-controlled-real-static-activation-planning-closure-readiness-record.json",
  ag18fBoundary: "data/content-intelligence/mutation-plans/ag18f-to-ag18z-controlled-real-static-activation-planning-closure-boundary.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag17zSummary: "data/content-intelligence/go-live/ag17z-static-go-live-preparation-summary.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag18z-controlled-real-static-activation-planning-closure.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag18z-controlled-real-static-activation-planning-closure.json");
const summaryPath = path.join(root, "data/content-intelligence/go-live/ag18z-controlled-real-static-activation-planning-summary.json");
const blockedPath = path.join(root, "data/content-intelligence/quality-registry/ag18z-real-static-activation-pre-apply-blocked-register.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag18z-first-static-activation-pre-apply-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag18z-to-ag19a-first-static-activation-pre-apply-readiness-plan-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/controlled-real-static-activation-planning-closure.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag18z-controlled-real-static-activation-planning-closure-learning.json");
const registryPath = path.join(root, "data/quality/ag18z-controlled-real-static-activation-planning-closure.json");
const previewPath = path.join(root, "data/quality/ag18z-controlled-real-static-activation-planning-closure-preview.json");
const docPath = path.join(root, "docs/quality/AG18Z_CONTROLLED_REAL_STATIC_ACTIVATION_PLANNING_CLOSURE.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG18Z input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag18fReview.status !== "non_active_real_static_activation_scaffold_audit_passed_ready_for_ag18z_closure") {
  throw new Error("AG18Z requires AG18F review readiness.");
}
if (data.ag18fAudit.failed_checks.length !== 0) {
  throw new Error("AG18Z requires AG18F audit to pass with zero failed checks.");
}
if (data.ag18fClosure.closure_decision.proceed_to_ag18z_controlled_real_static_activation_planning_closure !== true) {
  throw new Error("AG18Z requires AG18F closure decision.");
}
if (data.ag18fReadiness.ready_for_ag18z !== true) {
  throw new Error("AG18Z requires AG18F readiness.");
}
if (data.ag18fBoundary.next_stage_id !== "AG18Z" || data.ag18fBoundary.explicit_approval_required !== true) {
  throw new Error("AG18Z requires AG18F to AG18Z explicit boundary.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG18Z requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  controlled_real_static_activation_planning_closure_only: true,
  ag18_chain_closure_created_in_ag18z: true,
  controlled_real_static_activation_summary_created_in_ag18z: true,
  pre_apply_blocked_register_created_in_ag18z: true,
  ag19a_boundary_created_in_ag18z: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag18z: false,
  article_mutation_performed_in_ag18z: false,
  queue_mutation_performed_in_ag18z: false,
  active_admin_review_queue_record_created_in_ag18z: false,
  queue_index_mutation_performed_in_ag18z: false,
  admin_action_execution_performed_in_ag18z: false,
  editor_action_execution_performed_in_ag18z: false,
  real_credential_created_in_ag18z: false,
  hardcoded_password_created_in_repo_in_ag18z: false,
  password_hash_created_in_repo_in_ag18z: false,
  auth_activation_performed_in_ag18z: false,
  backend_activation_performed_in_ag18z: false,
  supabase_activation_performed_in_ag18z: false,
  database_write_performed_in_ag18z: false,
  github_token_created_or_exposed_in_ag18z: false,
  github_write_operation_performed_in_ag18z: false,
  active_action_handler_created_in_ag18z: false,
  api_endpoint_created_in_ag18z: false,
  public_visibility_switch_performed_in_ag18z: false,
  public_index_mutation_performed_in_ag18z: false,
  deployment_trigger_performed_in_ag18z: false,
  public_publishing_operation_performed_in_ag18z: false
};

const completedStages = [
  {
    stage_id: "AG18A",
    title: "Controlled Real Static Activation Planning",
    result: "Defined candidate selection, GitHub secret governance without secrets, public index delta review, rollback and smoke-test planning."
  },
  {
    stage_id: "AG18B",
    title: "Controlled Real Static Activation Plan Audit",
    result: "Audited AG18A and approved only AG18C dry-run."
  },
  {
    stage_id: "AG18C",
    title: "First Public Candidate and File Delta Dry-run",
    result: "Dry-ran candidate readiness, public filter, intended file delta, public surfaces, rollback and smoke-test with no mutation."
  },
  {
    stage_id: "AG18D",
    title: "First Public Candidate and File Delta Dry-run Audit",
    result: "Audited AG18C with zero failed checks and approved only AG18E non-active scaffold."
  },
  {
    stage_id: "AG18E",
    title: "Non-active Real Static Activation Scaffold",
    result: "Created non-active helper and templates for candidate apply, public index delta, GitHub write payload, rollback and smoke-test."
  },
  {
    stage_id: "AG18F",
    title: "Non-active Real Static Activation Scaffold Audit",
    result: "Audited AG18E with zero failed checks and approved AG18Z closure only."
  }
];

const summary = {
  module_id: "AG18Z",
  title: "Controlled Real Static Activation Planning Summary",
  status: "ag18_controlled_real_static_activation_planning_completed",
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
  final_ag18_state: {
    real_static_activation_planning_defined: true,
    plan_audited: true,
    first_candidate_dry_run_completed: true,
    first_candidate_dry_run_audited: true,
    non_active_real_static_activation_scaffold_created: true,
    non_active_real_static_activation_scaffold_audited: true,
    ready_for_ag19_pre_apply_readiness_planning: true,

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
    publishing_enabled: false,
    supabase_auth_backend_enabled: false
  },
  inherited_static_go_live_summary: inputs.ag17zSummary,
  ...stageControls
};

const blockedRegister = {
  module_id: "AG18Z",
  title: "Real Static Activation Pre-Apply Blocked Register",
  status: "real_static_activation_pre_apply_operations_remain_blocked",
  blocked_items_after_ag18_closure: [
    "Real candidate apply.",
    "Real Admin decision execution.",
    "Real Editor correction execution.",
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
    "Publish execution.",
    "Live smoke-test execution.",
    "Supabase/Auth/backend activation.",
    "Database write path."
  ],
  allowed_after_ag18z_without_new_approval: [
    "Review AG18 records.",
    "Review AG18E non-active scaffold.",
    "Proceed to AG19A first static activation pre-apply readiness planning."
  ],
  not_allowed_after_ag18z_without_new_approval: [
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
  module_id: "AG18Z",
  title: "First Static Activation Pre-Apply Readiness Record",
  status: "ready_for_ag19a_first_static_activation_pre_apply_readiness_plan",
  ready_for_ag19a: true,
  ag19a_explicit_approval_required: true,
  ag18_chain_closed: true,
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  supabase_auth_reminder_required_in_future: true,
  recommended_next_stage: "AG19A",
  recommended_next_stage_title: "First Static Activation Pre-Apply Readiness Plan",
  reason: "AG18 closes controlled real static activation planning at governed non-active level. AG19 should prepare exact pre-apply readiness, still without real write, token, visibility switch, deployment or publishing.",
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
  publish_ready: false,
  ...stageControls
};

const boundary = {
  module_id: "AG18Z",
  title: "AG18Z to AG19A First Static Activation Pre-Apply Readiness Plan Boundary",
  status: "ag19a_boundary_created_not_started",
  next_stage_id: "AG19A",
  next_stage_title: "First Static Activation Pre-Apply Readiness Plan",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag19a_allowed_scope: [
    "Define exact first static activation pre-apply checklist.",
    "Confirm first candidate evidence requirements.",
    "Confirm exact files proposed for future mutation.",
    "Confirm final public filter evidence requirements.",
    "Confirm rollback branch/commit strategy.",
    "Confirm manual approval gate.",
    "Confirm GitHub secret storage governance without creating secrets.",
    "Carry forward Supabase/Auth/backend defer reminder."
  ],
  ag19a_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag19a: true,
  ...stageControls
};

const closure = {
  module_id: "AG18Z",
  title: "Controlled Real Static Activation Planning Closure",
  status: "controlled_real_static_activation_planning_chain_closed_ready_for_ag19a_pre_apply",
  closure_scope: [
    "Controlled real static activation sequence planning.",
    "First public candidate selection planning.",
    "GitHub secret governance with no secrets created.",
    "Public index/file delta review planning.",
    "Rollback and smoke-test planning.",
    "Controlled real static activation plan audit.",
    "First public candidate and file delta dry-run.",
    "First public candidate and file delta dry-run audit.",
    "Non-active real static activation scaffold.",
    "Non-active real static activation scaffold audit.",
    "Supabase/Auth/backend defer reminder."
  ],
  final_decision: {
    ag18_chain_closed: true,
    proceed_to_ag19a_first_static_activation_pre_apply_readiness_plan: true,
    static_github_controlled_first_confirmed: true,
    supabase_auth_backend_deferred: true,
    future_supabase_auth_reminder_required: true,

    proceed_to_real_candidate_apply: false,
    proceed_to_github_token_creation: false,
    proceed_to_github_write: false,
    proceed_to_article_mutation: false,
    proceed_to_queue_mutation: false,
    proceed_to_admin_editor_execution: false,
    proceed_to_public_visibility_switch: false,
    proceed_to_public_index_mutation: false,
    proceed_to_deployment_trigger: false,
    proceed_to_publish_execution: false,
    proceed_to_supabase_auth_backend_activation: false
  },
  ...stageControls
};

const schema = {
  module_id: "AG18Z",
  title: "Controlled Real Static Activation Planning Closure Schema",
  status: "schema_controlled_real_static_activation_planning_closure_only",
  chain_closure_allowed_in_ag18z: true,
  planning_summary_allowed_in_ag18z: true,
  blocked_register_allowed_in_ag18z: true,
  next_path_boundary_allowed_in_ag18z: true,

  article_generation_allowed_in_ag18z: false,
  article_mutation_allowed_in_ag18z: false,
  queue_mutation_allowed_in_ag18z: false,
  active_admin_review_queue_record_creation_allowed_in_ag18z: false,
  queue_index_mutation_allowed_in_ag18z: false,
  admin_action_execution_allowed_in_ag18z: false,
  editor_action_execution_allowed_in_ag18z: false,
  real_credential_creation_allowed_in_ag18z: false,
  hardcoded_password_allowed_in_ag18z: false,
  password_hash_commit_allowed_in_ag18z: false,
  auth_activation_allowed_in_ag18z: false,
  backend_activation_allowed_in_ag18z: false,
  supabase_activation_allowed_in_ag18z: false,
  database_write_allowed_in_ag18z: false,
  github_token_creation_or_exposure_allowed_in_ag18z: false,
  github_write_operation_allowed_in_ag18z: false,
  active_action_handler_creation_allowed_in_ag18z: false,
  api_endpoint_creation_allowed_in_ag18z: false,
  public_visibility_switch_allowed_in_ag18z: false,
  public_index_mutation_allowed_in_ag18z: false,
  public_publishing_operation_allowed_in_ag18z: false,
  deployment_trigger_allowed_in_ag18z: false,
  ...stageControls
};

const review = {
  module_id: "AG18Z",
  title: "Controlled Real Static Activation Planning Closure",
  status: "controlled_real_static_activation_planning_chain_closed_ready_for_ag19a_pre_apply",
  depends_on: ["AG18A", "AG18B", "AG18C", "AG18D", "AG18E", "AG18F"],
  generated_from: inputs,
  closure_file: "data/content-intelligence/closure-records/ag18z-controlled-real-static-activation-planning-closure.json",
  summary_file: "data/content-intelligence/go-live/ag18z-controlled-real-static-activation-planning-summary.json",
  blocked_register_file: "data/content-intelligence/quality-registry/ag18z-real-static-activation-pre-apply-blocked-register.json",
  readiness_file: "data/content-intelligence/quality-registry/ag18z-first-static-activation-pre-apply-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag18z-to-ag19a-first-static-activation-pre-apply-readiness-plan-boundary.json",
  schema_file: "data/content-intelligence/schema/controlled-real-static-activation-planning-closure.schema.json",
  summary: {
    completed_stage_count: completedStages.length,
    ag18_chain_closed: true,
    selected_path: "hybrid_staged_path_static_first",
    static_github_controlled_first: true,
    supabase_auth_backend_deferred: true,
    ready_for_ag19a: true,
    github_token_ready: false,
    github_write_ready: false,
    candidate_apply_ready: false,
    public_visibility_switch_ready: false,
    public_index_mutation_ready: false,
    deployment_trigger_ready: false,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG18Z",
  title: "Controlled Real Static Activation Planning Closure Learning",
  status: "learning_record_only",
  learning_points: [
    "AG18 controlled real static activation planning chain is closed at non-active level.",
    "Candidate readiness, public filter, file delta, public surfaces, rollback and smoke-test have been dry-run and audited.",
    "A non-active real static activation scaffold was created and audited.",
    "Real candidate apply, token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.",
    "AG19 should now prepare exact pre-apply readiness without executing real activation.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG18Z",
  title: "Controlled Real Static Activation Planning Closure",
  status: "controlled_real_static_activation_planning_chain_closed_ready_for_ag19a_pre_apply",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag18z-controlled-real-static-activation-planning-closure.json",
    closure: "data/content-intelligence/closure-records/ag18z-controlled-real-static-activation-planning-closure.json",
    summary: "data/content-intelligence/go-live/ag18z-controlled-real-static-activation-planning-summary.json",
    blocked_register: "data/content-intelligence/quality-registry/ag18z-real-static-activation-pre-apply-blocked-register.json",
    readiness: "data/content-intelligence/quality-registry/ag18z-first-static-activation-pre-apply-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag18z-to-ag19a-first-static-activation-pre-apply-readiness-plan-boundary.json",
    schema: "data/content-intelligence/schema/controlled-real-static-activation-planning-closure.schema.json",
    learning: "data/content-intelligence/learning/ag18z-controlled-real-static-activation-planning-closure-learning.json",
    preview: "data/quality/ag18z-controlled-real-static-activation-planning-closure-preview.json",
    document: "docs/quality/AG18Z_CONTROLLED_REAL_STATIC_ACTIVATION_PLANNING_CLOSURE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG18Z",
  preview_only: true,
  status: "controlled_real_static_activation_planning_chain_closed_ready_for_ag19a_pre_apply",
  completed_stage_count: completedStages.length,
  ag18_chain_closed: true,
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  ready_for_ag19a: true,
  github_token_ready: false,
  github_write_ready: false,
  candidate_apply_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG18Z — Controlled Real Static Activation Planning Closure

## Purpose

AG18Z closes the controlled real static activation planning chain.

AG18Z is closure only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Completed Chain

- AG18A — Controlled Real Static Activation Planning.
- AG18B — Controlled Real Static Activation Plan Audit.
- AG18C — First Public Candidate and File Delta Dry-run.
- AG18D — First Public Candidate and File Delta Dry-run Audit.
- AG18E — Non-active Real Static Activation Scaffold.
- AG18F — Non-active Real Static Activation Scaffold Audit.

## Final Decision

AG18 chain is closed. AG19A may proceed only as First Static Activation Pre-Apply Readiness Plan.

Real candidate apply, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment trigger and publish execution remain blocked.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG19A — First Static Activation Pre-Apply Readiness Plan — only with explicit approval.
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

console.log("✅ AG18Z Controlled Real Static Activation Planning Closure generated.");
console.log("✅ AG18A through AG18F chain closed.");
console.log("✅ Controlled real static activation planning, dry-run and non-active scaffold chain summarised.");
console.log("✅ Real candidate apply, GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG19A First Static Activation Pre-Apply Readiness Plan boundary created.");
