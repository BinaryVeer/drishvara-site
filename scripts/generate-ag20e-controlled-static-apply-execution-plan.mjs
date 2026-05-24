import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag20dReview: "data/content-intelligence/quality-reviews/ag20d-controlled-static-apply-final-authorization-audit.json",
  ag20dAudit: "data/content-intelligence/audit-records/ag20d-controlled-static-apply-final-authorization-audit-report.json",
  ag20dDecision: "data/content-intelligence/go-live/ag20d-controlled-static-apply-execution-plan-readiness-decision-record.json",
  ag20dSafety: "data/content-intelligence/quality-registry/ag20d-controlled-static-apply-final-authorization-safety-record.json",
  ag20dReadiness: "data/content-intelligence/quality-registry/ag20d-controlled-static-apply-execution-plan-readiness-record.json",
  ag20dBoundary: "data/content-intelligence/mutation-plans/ag20d-to-ag20e-controlled-static-apply-execution-plan-boundary.json",

  ag20cPackage: "data/content-intelligence/go-live/ag20c-controlled-static-apply-final-authorization-package.json",
  ag20cCandidate: "data/content-intelligence/go-live/ag20c-candidate-static-apply-authorization-summary.json",
  ag20cSurfaces: "data/content-intelligence/go-live/ag20c-public-surface-authorization-summary.json",
  ag20cGithub: "data/content-intelligence/go-live/ag20c-github-write-authorization-no-execution-record.json",
  ag20cRollback: "data/content-intelligence/go-live/ag20c-rollback-deployment-smoke-test-authorization-summary.json",
  ag20cApprovalGate: "data/content-intelligence/go-live/ag20c-explicit-approval-phrase-final-gate-record.json",

  ag19eApprovalPhrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const out = {
  review: "data/content-intelligence/quality-reviews/ag20e-controlled-static-apply-execution-plan.json",
  executionPlan: "data/content-intelligence/go-live/ag20e-controlled-static-apply-execution-plan.json",
  approvalSequence: "data/content-intelligence/go-live/ag20e-approval-phrase-execution-sequence-plan.json",
  tokenPrecondition: "data/content-intelligence/go-live/ag20e-github-token-precondition-plan.json",
  fileMutationOrder: "data/content-intelligence/go-live/ag20e-file-mutation-order-plan.json",
  publicSurfaceOrder: "data/content-intelligence/go-live/ag20e-public-surface-switch-order-plan.json",
  deploymentSmokeOrder: "data/content-intelligence/go-live/ag20e-deployment-smoke-test-order-plan.json",
  rollbackOrder: "data/content-intelligence/go-live/ag20e-rollback-order-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag20e-controlled-static-apply-execution-plan-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag20e-controlled-static-apply-execution-plan-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag20e-to-ag20f-controlled-static-apply-execution-plan-audit-boundary.json",
  schema: "data/content-intelligence/schema/controlled-static-apply-execution-plan.schema.json",
  learning: "data/content-intelligence/learning/ag20e-controlled-static-apply-execution-plan-learning.json",
  registry: "data/quality/ag20e-controlled-static-apply-execution-plan.json",
  preview: "data/quality/ag20e-controlled-static-apply-execution-plan-preview.json",
  doc: "docs/quality/AG20E_CONTROLLED_STATIC_APPLY_EXECUTION_PLAN.md"
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
  if (!exists(relativePath)) throw new Error(`Missing AG20E input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag20dReview.status !== "controlled_static_apply_final_authorization_audit_passed_ready_for_ag20e_execution_plan") {
  throw new Error("AG20E requires AG20D review readiness.");
}
if (data.ag20dAudit.failed_checks.length !== 0) {
  throw new Error("AG20E requires AG20D audit with zero failed checks.");
}
if (data.ag20dDecision.decision.proceed_to_controlled_static_apply_execution_plan !== true) {
  throw new Error("AG20E requires AG20D execution plan decision.");
}
for (const key of [
  "proceed_to_execute_approval_phrase",
  "proceed_to_real_candidate_apply",
  "proceed_to_github_token_creation",
  "proceed_to_github_write",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (data.ag20dDecision.decision[key] !== false) throw new Error(`AG20E requires ${key} to remain blocked.`);
}
if (data.ag20dReadiness.ready_for_ag20e !== true) {
  throw new Error("AG20E requires AG20D readiness.");
}
if (data.ag20dBoundary.next_stage_id !== "AG20E" || data.ag20dBoundary.explicit_approval_required !== true) {
  throw new Error("AG20E requires AG20D to AG20E explicit boundary.");
}

const requiredPhrase = "Proceed with first controlled static apply";
if (data.ag19eApprovalPhrase.exact_phrase_required_later !== requiredPhrase) {
  throw new Error("AG20E requires the approved AG19E phrase.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG20E requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  controlled_static_apply_execution_plan_only: true,
  execution_plan_created_in_ag20e: true,
  approval_sequence_plan_created_in_ag20e: true,
  token_precondition_plan_created_in_ag20e: true,
  file_mutation_order_plan_created_in_ag20e: true,
  public_surface_switch_order_plan_created_in_ag20e: true,
  deployment_smoke_test_order_plan_created_in_ag20e: true,
  rollback_order_plan_created_in_ag20e: true,
  blocker_register_created_in_ag20e: true,
  ag20f_boundary_created_in_ag20e: true,
  selected_article_read_performed: true,

  explicit_approval_phrase_executed_in_ag20e: false,
  article_generation_performed_in_ag20e: false,
  article_mutation_performed_in_ag20e: false,
  queue_mutation_performed_in_ag20e: false,
  active_admin_review_queue_record_created_in_ag20e: false,
  queue_index_mutation_performed_in_ag20e: false,
  admin_action_execution_performed_in_ag20e: false,
  editor_action_execution_performed_in_ag20e: false,
  real_credential_created_in_ag20e: false,
  hardcoded_password_created_in_repo_in_ag20e: false,
  password_hash_created_in_repo_in_ag20e: false,
  auth_activation_performed_in_ag20e: false,
  backend_activation_performed_in_ag20e: false,
  supabase_activation_performed_in_ag20e: false,
  database_write_performed_in_ag20e: false,
  github_token_created_or_exposed_in_ag20e: false,
  github_write_operation_performed_in_ag20e: false,
  active_action_handler_created_in_ag20e: false,
  api_endpoint_created_in_ag20e: false,
  public_visibility_switch_performed_in_ag20e: false,
  public_index_mutation_performed_in_ag20e: false,
  deployment_trigger_performed_in_ag20e: false,
  public_publishing_operation_performed_in_ag20e: false
};

const approvalSequence = {
  module_id: "AG20E",
  title: "Approval Phrase Execution Sequence Plan",
  status: "approval_phrase_execution_sequence_planned_not_executed",
  required_future_approval_phrase: requiredPhrase,
  inherited_final_gate: inputs.ag20cApprovalGate,
  planned_sequence_for_later_apply: [
    "Restate candidate article path and hash.",
    "Restate exact public surfaces to mutate.",
    "Restate GitHub token and write preconditions.",
    "Restate rollback and smoke-test preconditions.",
    "Receive exact approval phrase from user.",
    "Only after separate approved apply stage, proceed to controlled static apply execution."
  ],
  current_state: {
    sequence_defined: true,
    explicit_approval_phrase_executed_now: false,
    controlled_static_apply_authorised_now: false,
    github_write_authorised_now: false,
    visibility_switch_authorised_now: false,
    public_index_mutation_authorised_now: false,
    deployment_authorised_now: false,
    publishing_authorised_now: false
  },
  ...stageControls
};

const tokenPrecondition = {
  module_id: "AG20E",
  title: "GitHub Token Precondition Plan",
  status: "github_token_precondition_planned_no_secret_created",
  inherited_github_authorization: inputs.ag20cGithub,
  token_preconditions_for_later_apply: [
    "Use only secure environment or local secret handling.",
    "Never commit token.",
    "Never paste token into JSON, docs, scripts or logs.",
    "Use least-privilege content write token.",
    "Confirm branch and rollback commit before write.",
    "Confirm exact file delta before write."
  ],
  current_secret_state: {
    token_precondition_defined: true,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_token_committed: false,
    github_write_enabled: false,
    github_write_performed: false
  },
  ...stageControls
};

const fileMutationOrder = {
  module_id: "AG20E",
  title: "File Mutation Order Plan",
  status: "file_mutation_order_planned_no_mutation",
  candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash
  },
  planned_order_for_later_apply: [
    {
      order: 1,
      operation: "Confirm candidate article hash.",
      executed_now: false
    },
    {
      order: 2,
      operation: "Prepare exact public surface file delta.",
      executed_now: false
    },
    {
      order: 3,
      operation: "Apply public surface file mutations in approved later stage only.",
      executed_now: false
    },
    {
      order: 4,
      operation: "Commit controlled static apply changes in approved later stage only.",
      executed_now: false
    }
  ],
  current_mutation_state: {
    file_mutation_order_defined: true,
    article_mutated_now: false,
    featured_reads_mutated_now: false,
    category_listing_mutated_now: false,
    homepage_mutated_now: false,
    sitemap_feed_search_mutated_now: false,
    git_write_performed_now: false
  },
  ...stageControls
};

const publicSurfaceOrder = {
  module_id: "AG20E",
  title: "Public Surface Switch Order Plan",
  status: "public_surface_switch_order_planned_no_switch",
  inherited_public_surface_authorization: inputs.ag20cSurfaces,
  planned_surface_order_for_later_apply: [
    {
      order: 1,
      surface_id: "featured_reads_index",
      operation: "Add article to Featured Reads listing after approval.",
      executed_now: false
    },
    {
      order: 2,
      surface_id: "category_listing",
      operation: "Add article to category listing after approval.",
      executed_now: false
    },
    {
      order: 3,
      surface_id: "homepage_card",
      operation: "Add homepage card only if explicitly confirmed.",
      executed_now: false
    },
    {
      order: 4,
      surface_id: "sitemap_feed_search",
      operation: "Update sitemap/feed/search only if explicitly confirmed.",
      executed_now: false
    }
  ],
  current_public_state: {
    surface_order_defined: true,
    public_visibility_switched_now: false,
    featured_reads_mutated_now: false,
    category_listing_mutated_now: false,
    homepage_mutated_now: false,
    sitemap_feed_search_mutated_now: false,
    public_index_mutated_now: false
  },
  ...stageControls
};

const deploymentSmokeOrder = {
  module_id: "AG20E",
  title: "Deployment Smoke-test Order Plan",
  status: "deployment_smoke_test_order_planned_no_execution",
  inherited_rollback_deployment_summary: inputs.ag20cRollback,
  planned_order_for_later_apply: [
    {
      order: 1,
      operation: "Record pre-deployment branch and commit.",
      executed_now: false
    },
    {
      order: 2,
      operation: "Trigger deployment only after approved GitHub write.",
      executed_now: false
    },
    {
      order: 3,
      operation: "Run live article URL check.",
      executed_now: false
    },
    {
      order: 4,
      operation: "Run Featured Reads and category listing checks.",
      executed_now: false
    },
    {
      order: 5,
      operation: "Run mobile layout, references and image-credit checks.",
      executed_now: false
    }
  ],
  current_execution_state: {
    deployment_smoke_test_order_defined: true,
    deployment_triggered_now: false,
    live_smoke_test_executed_now: false,
    article_url_checked_now: false,
    featured_reads_checked_now: false,
    category_listing_checked_now: false,
    mobile_layout_checked_now: false,
    references_checked_now: false,
    image_credit_checked_now: false,
    published_now: false
  },
  ...stageControls
};

const rollbackOrder = {
  module_id: "AG20E",
  title: "Rollback Order Plan",
  status: "rollback_order_planned_no_execution",
  planned_rollback_order_for_later_apply: [
    {
      order: 1,
      operation: "Use recorded pre-apply HEAD commit.",
      executed_now: false
    },
    {
      order: 2,
      operation: "Revert controlled static apply commit if smoke-test fails.",
      executed_now: false
    },
    {
      order: 3,
      operation: "Re-run smoke-test after rollback.",
      executed_now: false
    },
    {
      order: 4,
      operation: "Record rollback result.",
      executed_now: false
    }
  ],
  current_rollback_state: {
    rollback_order_defined: true,
    rollback_executed_now: false,
    rollback_commit_created_now: false,
    rollback_smoke_test_executed_now: false
  },
  ...stageControls
};

const executionPlan = {
  module_id: "AG20E",
  title: "Controlled Static Apply Execution Plan",
  status: "controlled_static_apply_execution_plan_created_pending_audit",
  execution_plan_only: true,
  candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  required_future_approval_phrase: requiredPhrase,
  plan_sections: [
    out.approvalSequence,
    out.tokenPrecondition,
    out.fileMutationOrder,
    out.publicSurfaceOrder,
    out.deploymentSmokeOrder,
    out.rollbackOrder
  ],
  current_decision_state: {
    execution_plan_created: true,
    ready_for_ag20f_audit: true,
    explicit_approval_phrase_executed_now: false,
    controlled_static_apply_authorised_now: false,
    candidate_apply_enabled_now: false,
    github_token_enabled_now: false,
    github_write_enabled_now: false,
    visibility_switch_enabled_now: false,
    public_index_mutation_enabled_now: false,
    deployment_enabled_now: false,
    publishing_enabled_now: false
  },
  inherited_ag20d_decision: inputs.ag20dDecision,
  ...stageControls
};

const blocker = {
  module_id: "AG20E",
  title: "Controlled Static Apply Execution Plan Blocker Register",
  status: "controlled_static_apply_execution_plan_operations_remain_blocked_pending_ag20f_audit",
  blocked_items: [
    "Explicit approval phrase execution.",
    "Real candidate apply.",
    "Real article mutation.",
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
    "Rollback execution.",
    "Supabase/Auth/backend activation.",
    "Database write path."
  ],
  allowed_after_ag20e_without_new_approval: [
    "Review AG20E controlled static apply execution plan.",
    "Proceed to AG20F controlled static apply execution plan audit."
  ],
  not_allowed_after_ag20e_without_new_approval: [
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
  module_id: "AG20E",
  title: "Controlled Static Apply Execution Plan Audit Readiness Record",
  status: "ready_for_ag20f_controlled_static_apply_execution_plan_audit",
  ready_for_ag20f: true,
  ag20f_explicit_approval_required: true,
  execution_plan_created: true,
  approval_sequence_plan_created: true,
  token_precondition_plan_created: true,
  file_mutation_order_plan_created: true,
  public_surface_switch_order_plan_created: true,
  deployment_smoke_test_order_plan_created: true,
  rollback_order_plan_created: true,
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
  publish_ready: false,
  reason: "AG20E creates execution plan only. AG20F should audit before AG20Z closure or any future apply readiness transition.",
  ...stageControls
};

const boundary = {
  module_id: "AG20E",
  title: "AG20E to AG20F Controlled Static Apply Execution Plan Audit Boundary",
  status: "ag20f_boundary_created_not_started",
  next_stage_id: "AG20F",
  next_stage_title: "Controlled Static Apply Execution Plan Audit",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
  ag20f_allowed_scope: [
    "Audit controlled static apply execution plan.",
    "Audit approval phrase execution sequence plan.",
    "Audit GitHub token precondition plan.",
    "Audit file mutation order plan.",
    "Audit public surface switch order plan.",
    "Audit deployment and smoke-test order plan.",
    "Audit rollback order plan.",
    "Confirm Supabase/Auth/backend remains deferred."
  ],
  ag20f_blocked_scope: [
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
    "No deployment trigger."
  ],
  supabase_auth_defer_reminder_required_in_ag20f: true,
  ...stageControls
};

const schema = {
  module_id: "AG20E",
  title: "Controlled Static Apply Execution Plan Schema",
  status: "schema_controlled_static_apply_execution_plan_only",
  execution_plan_allowed_in_ag20e: true,
  approval_sequence_plan_allowed_in_ag20e: true,
  token_precondition_plan_allowed_in_ag20e: true,
  file_mutation_order_plan_allowed_in_ag20e: true,
  public_surface_switch_order_plan_allowed_in_ag20e: true,
  deployment_smoke_test_order_plan_allowed_in_ag20e: true,
  rollback_order_plan_allowed_in_ag20e: true,
  ag20f_boundary_allowed_in_ag20e: true,

  explicit_approval_phrase_execution_allowed_in_ag20e: false,
  article_generation_allowed_in_ag20e: false,
  article_mutation_allowed_in_ag20e: false,
  queue_mutation_allowed_in_ag20e: false,
  active_admin_review_queue_record_creation_allowed_in_ag20e: false,
  queue_index_mutation_allowed_in_ag20e: false,
  admin_action_execution_allowed_in_ag20e: false,
  editor_action_execution_allowed_in_ag20e: false,
  real_credential_creation_allowed_in_ag20e: false,
  auth_activation_allowed_in_ag20e: false,
  backend_activation_allowed_in_ag20e: false,
  supabase_activation_allowed_in_ag20e: false,
  database_write_allowed_in_ag20e: false,
  github_token_creation_or_exposure_allowed_in_ag20e: false,
  github_write_operation_allowed_in_ag20e: false,
  active_action_handler_creation_allowed_in_ag20e: false,
  api_endpoint_creation_allowed_in_ag20e: false,
  public_visibility_switch_allowed_in_ag20e: false,
  public_index_mutation_allowed_in_ag20e: false,
  public_publishing_operation_allowed_in_ag20e: false,
  deployment_trigger_allowed_in_ag20e: false,
  ...stageControls
};

const review = {
  module_id: "AG20E",
  title: "Controlled Static Apply Execution Plan",
  status: "controlled_static_apply_execution_plan_created_pending_audit",
  depends_on: ["AG20D"],
  generated_from: inputs,
  execution_plan_file: out.executionPlan,
  approval_sequence_file: out.approvalSequence,
  token_precondition_file: out.tokenPrecondition,
  file_mutation_order_file: out.fileMutationOrder,
  public_surface_switch_order_file: out.publicSurfaceOrder,
  deployment_smoke_test_order_file: out.deploymentSmokeOrder,
  rollback_order_file: out.rollbackOrder,
  blocker_register_file: out.blocker,
  readiness_file: out.readiness,
  next_boundary_file: out.boundary,
  schema_file: out.schema,
  summary: {
    ready_for_ag20f: true,
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
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG20E",
  title: "Controlled Static Apply Execution Plan Learning",
  status: "learning_record_only",
  learning_points: [
    "AG20E creates execution plan records only.",
    "Approval phrase, GitHub token/write, file mutation, public surface switch, deployment, smoke-test and rollback are sequenced but not executed.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG20E",
  title: "Controlled Static Apply Execution Plan",
  status: "controlled_static_apply_execution_plan_created_pending_audit",
  generated_artifacts: {
    review: out.review,
    execution_plan: out.executionPlan,
    approval_sequence: out.approvalSequence,
    token_precondition: out.tokenPrecondition,
    file_mutation_order: out.fileMutationOrder,
    public_surface_switch_order: out.publicSurfaceOrder,
    deployment_smoke_test_order: out.deploymentSmokeOrder,
    rollback_order: out.rollbackOrder,
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
  module_id: "AG20E",
  preview_only: true,
  status: "controlled_static_apply_execution_plan_created_pending_audit",
  ready_for_ag20f: true,
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
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG20E — Controlled Static Apply Execution Plan

## Purpose

AG20E prepares the controlled static apply execution plan.

AG20E is execution-plan only. It does not execute the approval phrase, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment, run live smoke-tests, rollback or publish anything.

## Execution Plan Sections

- Approval phrase execution sequence plan
- GitHub token precondition plan
- File mutation order plan
- Public surface switch order plan
- Deployment and smoke-test order plan
- Rollback order plan
- Execution-plan blocker register

## Approval Phrase

Future controlled static apply still requires the exact phrase:

\`Proceed with first controlled static apply\`

This phrase is not executed in AG20E.

## Decision State

AG20E does not perform real apply. It prepares execution-plan evidence for AG20F audit only.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG20F — Controlled Static Apply Execution Plan Audit — only with explicit approval.
`;

writeJson(out.review, review);
writeJson(out.executionPlan, executionPlan);
writeJson(out.approvalSequence, approvalSequence);
writeJson(out.tokenPrecondition, tokenPrecondition);
writeJson(out.fileMutationOrder, fileMutationOrder);
writeJson(out.publicSurfaceOrder, publicSurfaceOrder);
writeJson(out.deploymentSmokeOrder, deploymentSmokeOrder);
writeJson(out.rollbackOrder, rollbackOrder);
writeJson(out.blocker, blocker);
writeJson(out.readiness, readiness);
writeJson(out.boundary, boundary);
writeJson(out.schema, schema);
writeJson(out.learning, learning);
writeJson(out.registry, registry);
writeJson(out.preview, preview);
writeText(out.doc, doc);

console.log("✅ AG20E Controlled Static Apply Execution Plan generated.");
console.log("✅ Approval sequence, GitHub token precondition, file mutation order, public surface order, deployment/smoke-test order and rollback order plans created.");
console.log("✅ Explicit approval phrase remains required but not executed.");
console.log("✅ No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing performed.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG20F Controlled Static Apply Execution Plan Audit boundary created.");
