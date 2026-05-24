import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag19aReview: "data/content-intelligence/quality-reviews/ag19a-first-static-activation-pre-apply-readiness-plan.json",
  ag19bReview: "data/content-intelligence/quality-reviews/ag19b-pre-apply-readiness-audit.json",
  ag19cReview: "data/content-intelligence/quality-reviews/ag19c-final-public-delta-dry-run.json",
  ag19dReview: "data/content-intelligence/quality-reviews/ag19d-final-public-delta-dry-run-audit.json",
  ag19eReview: "data/content-intelligence/quality-reviews/ag19e-first-static-activation-approval-package.json",
  ag19fReview: "data/content-intelligence/quality-reviews/ag19f-first-static-activation-approval-package-audit.json",
  ag19fAudit: "data/content-intelligence/audit-records/ag19f-first-static-activation-approval-package-audit-report.json",
  ag19fClosure: "data/content-intelligence/closure-records/ag19f-first-static-activation-approval-package-audit-closure.json",
  ag19fSafety: "data/content-intelligence/quality-registry/ag19f-first-static-activation-approval-package-safety-record.json",
  ag19fReadiness: "data/content-intelligence/quality-registry/ag19f-first-static-activation-planning-closure-readiness-record.json",
  ag19fBoundary: "data/content-intelligence/mutation-plans/ag19f-to-ag19z-first-static-activation-planning-closure-boundary.json",
  ag19eApprovalPhrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  ag19ePackage: "data/content-intelligence/go-live/ag19e-first-static-activation-approval-package.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag19z-first-static-activation-planning-closure.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag19z-first-static-activation-planning-closure.json");
const summaryPath = path.join(root, "data/content-intelligence/go-live/ag19z-first-static-activation-planning-summary.json");
const blockedPath = path.join(root, "data/content-intelligence/quality-registry/ag19z-controlled-static-apply-blocked-register.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag19z-controlled-static-apply-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag19z-to-ag20a-controlled-static-apply-readiness-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/first-static-activation-planning-closure.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag19z-first-static-activation-planning-closure-learning.json");
const registryPath = path.join(root, "data/quality/ag19z-first-static-activation-planning-closure.json");
const previewPath = path.join(root, "data/quality/ag19z-first-static-activation-planning-closure-preview.json");
const docPath = path.join(root, "docs/quality/AG19Z_FIRST_STATIC_ACTIVATION_PLANNING_CLOSURE.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG19Z input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag19fReview.status !== "first_static_activation_approval_package_audit_passed_ready_for_ag19z_closure") {
  throw new Error("AG19Z requires AG19F review readiness.");
}
if (data.ag19fAudit.failed_checks.length !== 0) {
  throw new Error("AG19Z requires AG19F audit with zero failed checks.");
}
if (data.ag19fClosure.closure_decision.proceed_to_ag19z_first_static_activation_planning_closure !== true) {
  throw new Error("AG19Z requires AG19F closure decision.");
}
if (data.ag19fReadiness.ready_for_ag19z !== true) {
  throw new Error("AG19Z requires AG19F readiness.");
}
if (data.ag19fBoundary.next_stage_id !== "AG19Z" || data.ag19fBoundary.explicit_approval_required !== true) {
  throw new Error("AG19Z requires AG19F to AG19Z explicit boundary.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG19Z requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  first_static_activation_planning_closure_only: true,
  ag19_chain_closure_created_in_ag19z: true,
  first_static_activation_summary_created_in_ag19z: true,
  controlled_static_apply_blocked_register_created_in_ag19z: true,
  ag20a_boundary_created_in_ag19z: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag19z: false,
  article_mutation_performed_in_ag19z: false,
  queue_mutation_performed_in_ag19z: false,
  active_admin_review_queue_record_created_in_ag19z: false,
  queue_index_mutation_performed_in_ag19z: false,
  admin_action_execution_performed_in_ag19z: false,
  editor_action_execution_performed_in_ag19z: false,
  real_credential_created_in_ag19z: false,
  hardcoded_password_created_in_repo_in_ag19z: false,
  password_hash_created_in_repo_in_ag19z: false,
  auth_activation_performed_in_ag19z: false,
  backend_activation_performed_in_ag19z: false,
  supabase_activation_performed_in_ag19z: false,
  database_write_performed_in_ag19z: false,
  github_token_created_or_exposed_in_ag19z: false,
  github_write_operation_performed_in_ag19z: false,
  active_action_handler_created_in_ag19z: false,
  api_endpoint_created_in_ag19z: false,
  public_visibility_switch_performed_in_ag19z: false,
  public_index_mutation_performed_in_ag19z: false,
  deployment_trigger_performed_in_ag19z: false,
  public_publishing_operation_performed_in_ag19z: false
};

const completedStages = [
  {
    stage_id: "AG19A",
    title: "First Static Activation Pre-Apply Readiness Plan",
    result: "Defined checklist, candidate evidence, public filter evidence, exact file delta, rollback strategy, manual approval and GitHub no-secrets plan."
  },
  {
    stage_id: "AG19B",
    title: "Pre-Apply Readiness Audit",
    result: "Audited AG19A and approved only AG19C final public delta dry-run."
  },
  {
    stage_id: "AG19C",
    title: "Final Public Delta Dry-run",
    result: "Dry-ran final public delta, public surface previews, rollback and smoke-test preview without mutation."
  },
  {
    stage_id: "AG19D",
    title: "Final Public Delta Dry-run Audit",
    result: "Audited AG19C and approved only AG19E approval package."
  },
  {
    stage_id: "AG19E",
    title: "First Static Activation Approval Package",
    result: "Created approval package and explicit approval phrase record without executing approval."
  },
  {
    stage_id: "AG19F",
    title: "First Static Activation Approval Package Audit",
    result: "Audited AG19E with zero failed checks and approved AG19Z closure only."
  }
];

const summary = {
  module_id: "AG19Z",
  title: "First Static Activation Planning Summary",
  status: "ag19_first_static_activation_planning_completed",
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
  explicit_approval_phrase_required_later: data.ag19eApprovalPhrase.exact_phrase_required_later,
  final_ag19_state: {
    pre_apply_readiness_planned: true,
    pre_apply_readiness_audited: true,
    final_public_delta_dry_run_completed: true,
    final_public_delta_dry_run_audited: true,
    approval_package_created: true,
    approval_package_audited: true,
    ready_for_ag20_controlled_static_apply_readiness: true,

    explicit_user_approval_executed: false,
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
  ...stageControls
};

const blockedRegister = {
  module_id: "AG19Z",
  title: "Controlled Static Apply Blocked Register",
  status: "controlled_static_apply_operations_remain_blocked_pending_ag20",
  blocked_items_after_ag19_closure: [
    "Explicit approval phrase execution.",
    "Real candidate apply.",
    "Real Admin/Editor execution.",
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
  allowed_after_ag19z_without_new_approval: [
    "Review AG19 closure records.",
    "Proceed to AG20A controlled static apply readiness."
  ],
  not_allowed_after_ag19z_without_new_approval: [
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
  module_id: "AG19Z",
  title: "Controlled Static Apply Readiness Record",
  status: "ready_for_ag20a_controlled_static_apply_readiness",
  ready_for_ag20a: true,
  ag20a_explicit_approval_required: true,
  ag19_chain_closed: true,
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  supabase_auth_reminder_required_in_future: true,
  recommended_next_stage: "AG20A",
  recommended_next_stage_title: "Controlled Static Apply Readiness",
  exact_approval_phrase_required_later: data.ag19eApprovalPhrase.exact_phrase_required_later,
  reason: "AG19 closes first static activation planning. AG20A should prepare controlled static apply readiness and should still not execute GitHub write, visibility switch, deployment or publishing without explicit approval.",
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
  module_id: "AG19Z",
  title: "AG19Z to AG20A Controlled Static Apply Readiness Boundary",
  status: "ag20a_boundary_created_not_started",
  next_stage_id: "AG20A",
  next_stage_title: "Controlled Static Apply Readiness",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: data.ag19eApprovalPhrase.exact_phrase_required_later,
  ag20a_allowed_scope: [
    "Prepare controlled static apply readiness package.",
    "Confirm exact candidate, hash and approval phrase.",
    "Confirm GitHub token readiness requirements without creating secrets.",
    "Confirm exact future files to mutate.",
    "Confirm rollback and smoke-test readiness.",
    "Confirm public surfaces for first static apply.",
    "Carry forward Supabase/Auth/backend defer reminder."
  ],
  ag20a_blocked_scope: [
    "No new article generation.",
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
    "No deployment trigger."
  ],
  supabase_auth_defer_reminder_required_in_ag20a: true,
  ...stageControls
};

const closure = {
  module_id: "AG19Z",
  title: "First Static Activation Planning Closure",
  status: "first_static_activation_planning_chain_closed_ready_for_ag20a_controlled_static_apply_readiness",
  closure_scope: [
    "First static activation pre-apply readiness planning.",
    "Pre-apply readiness audit.",
    "Final public delta dry-run.",
    "Final public delta dry-run audit.",
    "First static activation approval package.",
    "First static activation approval package audit.",
    "Explicit approval phrase recording without execution.",
    "Supabase/Auth/backend defer reminder."
  ],
  final_decision: {
    ag19_chain_closed: true,
    proceed_to_ag20a_controlled_static_apply_readiness: true,
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
  module_id: "AG19Z",
  title: "First Static Activation Planning Closure Schema",
  status: "schema_first_static_activation_planning_closure_only",
  chain_closure_allowed_in_ag19z: true,
  planning_summary_allowed_in_ag19z: true,
  blocked_register_allowed_in_ag19z: true,
  ag20a_boundary_allowed_in_ag19z: true,

  article_generation_allowed_in_ag19z: false,
  article_mutation_allowed_in_ag19z: false,
  queue_mutation_allowed_in_ag19z: false,
  active_admin_review_queue_record_creation_allowed_in_ag19z: false,
  queue_index_mutation_allowed_in_ag19z: false,
  admin_action_execution_allowed_in_ag19z: false,
  editor_action_execution_allowed_in_ag19z: false,
  real_credential_creation_allowed_in_ag19z: false,
  auth_activation_allowed_in_ag19z: false,
  backend_activation_allowed_in_ag19z: false,
  supabase_activation_allowed_in_ag19z: false,
  database_write_allowed_in_ag19z: false,
  github_token_creation_or_exposure_allowed_in_ag19z: false,
  github_write_operation_allowed_in_ag19z: false,
  active_action_handler_creation_allowed_in_ag19z: false,
  api_endpoint_creation_allowed_in_ag19z: false,
  public_visibility_switch_allowed_in_ag19z: false,
  public_index_mutation_allowed_in_ag19z: false,
  public_publishing_operation_allowed_in_ag19z: false,
  deployment_trigger_allowed_in_ag19z: false,
  ...stageControls
};

const review = {
  module_id: "AG19Z",
  title: "First Static Activation Planning Closure",
  status: "first_static_activation_planning_chain_closed_ready_for_ag20a_controlled_static_apply_readiness",
  depends_on: ["AG19A", "AG19B", "AG19C", "AG19D", "AG19E", "AG19F"],
  generated_from: inputs,
  closure_file: "data/content-intelligence/closure-records/ag19z-first-static-activation-planning-closure.json",
  summary_file: "data/content-intelligence/go-live/ag19z-first-static-activation-planning-summary.json",
  blocked_register_file: "data/content-intelligence/quality-registry/ag19z-controlled-static-apply-blocked-register.json",
  readiness_file: "data/content-intelligence/quality-registry/ag19z-controlled-static-apply-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag19z-to-ag20a-controlled-static-apply-readiness-boundary.json",
  schema_file: "data/content-intelligence/schema/first-static-activation-planning-closure.schema.json",
  summary: {
    completed_stage_count: completedStages.length,
    ag19_chain_closed: true,
    selected_path: "hybrid_staged_path_static_first",
    ready_for_ag20a: true,
    supabase_auth_backend_deferred: true,
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
  module_id: "AG19Z",
  title: "First Static Activation Planning Closure Learning",
  status: "learning_record_only",
  learning_points: [
    "AG19 first static activation planning chain is closed.",
    "Pre-apply readiness, audit, final public delta dry-run, dry-run audit, approval package and approval package audit are complete.",
    "The explicit approval phrase is recorded but not executed.",
    "AG20A should prepare controlled static apply readiness without performing real apply.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG19Z",
  title: "First Static Activation Planning Closure",
  status: "first_static_activation_planning_chain_closed_ready_for_ag20a_controlled_static_apply_readiness",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag19z-first-static-activation-planning-closure.json",
    closure: "data/content-intelligence/closure-records/ag19z-first-static-activation-planning-closure.json",
    summary: "data/content-intelligence/go-live/ag19z-first-static-activation-planning-summary.json",
    blocked_register: "data/content-intelligence/quality-registry/ag19z-controlled-static-apply-blocked-register.json",
    readiness: "data/content-intelligence/quality-registry/ag19z-controlled-static-apply-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag19z-to-ag20a-controlled-static-apply-readiness-boundary.json",
    schema: "data/content-intelligence/schema/first-static-activation-planning-closure.schema.json",
    learning: "data/content-intelligence/learning/ag19z-first-static-activation-planning-closure-learning.json",
    preview: "data/quality/ag19z-first-static-activation-planning-closure-preview.json",
    document: "docs/quality/AG19Z_FIRST_STATIC_ACTIVATION_PLANNING_CLOSURE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG19Z",
  preview_only: true,
  status: "first_static_activation_planning_chain_closed_ready_for_ag20a_controlled_static_apply_readiness",
  completed_stage_count: completedStages.length,
  ag19_chain_closed: true,
  ready_for_ag20a: true,
  selected_path: "hybrid_staged_path_static_first",
  supabase_auth_backend_deferred: true,
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

const doc = `# AG19Z — First Static Activation Planning Closure

## Purpose

AG19Z closes the first static activation planning chain.

AG19Z is closure only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Completed Chain

- AG19A — First Static Activation Pre-Apply Readiness Plan.
- AG19B — Pre-Apply Readiness Audit.
- AG19C — Final Public Delta Dry-run.
- AG19D — Final Public Delta Dry-run Audit.
- AG19E — First Static Activation Approval Package.
- AG19F — First Static Activation Approval Package Audit.

## Approval Phrase

Future controlled static apply requires the exact phrase:

\`Proceed with first controlled static apply\`

This phrase is not executed in AG19Z.

## Final Decision

AG19 chain is closed. AG20A may proceed only as Controlled Static Apply Readiness.

Real candidate apply, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment trigger and publish execution remain blocked.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG20A — Controlled Static Apply Readiness — only with explicit approval.
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

console.log("✅ AG19Z First Static Activation Planning Closure generated.");
console.log("✅ AG19A through AG19F chain closed.");
console.log("✅ Explicit approval phrase remains recorded but not executed.");
console.log("✅ GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG20A Controlled Static Apply Readiness boundary created.");
