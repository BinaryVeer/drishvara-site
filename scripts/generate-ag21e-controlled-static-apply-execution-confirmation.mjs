import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag21dReview: "data/content-intelligence/quality-reviews/ag21d-controlled-static-apply-execution-readiness-audit.json",
  ag21dAudit: "data/content-intelligence/audit-records/ag21d-controlled-static-apply-execution-readiness-audit-report.json",
  ag21dDecision: "data/content-intelligence/go-live/ag21d-controlled-static-apply-execution-confirmation-decision-record.json",
  ag21dSafety: "data/content-intelligence/quality-registry/ag21d-controlled-static-apply-execution-readiness-safety-record.json",
  ag21dReadiness: "data/content-intelligence/quality-registry/ag21d-controlled-static-apply-execution-confirmation-readiness-record.json",
  ag21dBoundary: "data/content-intelligence/mutation-plans/ag21d-to-ag21e-controlled-static-apply-execution-confirmation-boundary.json",

  ag21cPackage: "data/content-intelligence/go-live/ag21c-controlled-static-apply-execution-readiness-package.json",
  ag21cApproval: "data/content-intelligence/go-live/ag21c-approval-phrase-pre-execution-readiness-record.json",
  ag21cCandidate: "data/content-intelligence/go-live/ag21c-candidate-apply-pre-execution-readiness-record.json",
  ag21cGithub: "data/content-intelligence/go-live/ag21c-github-write-pre-execution-readiness-record.json",
  ag21cSurfaces: "data/content-intelligence/go-live/ag21c-public-surface-pre-execution-readiness-record.json",
  ag21cDeploy: "data/content-intelligence/go-live/ag21c-deployment-smoke-rollback-pre-execution-readiness-record.json",

  ag19eApprovalPhrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const out = {
  review: "data/content-intelligence/quality-reviews/ag21e-controlled-static-apply-execution-confirmation.json",
  confirmationPackage: "data/content-intelligence/go-live/ag21e-controlled-static-apply-execution-confirmation-package.json",
  approvalConfirmation: "data/content-intelligence/go-live/ag21e-approval-phrase-final-confirmation-record.json",
  candidateConfirmation: "data/content-intelligence/go-live/ag21e-candidate-final-confirmation-record.json",
  githubConfirmation: "data/content-intelligence/go-live/ag21e-github-write-final-confirmation-record.json",
  publicSurfaceConfirmation: "data/content-intelligence/go-live/ag21e-public-surface-final-confirmation-record.json",
  deployConfirmation: "data/content-intelligence/go-live/ag21e-deployment-smoke-rollback-final-confirmation-record.json",
  blocker: "data/content-intelligence/quality-registry/ag21e-controlled-static-apply-execution-confirmation-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag21e-controlled-static-apply-execution-confirmation-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag21e-to-ag21f-controlled-static-apply-execution-confirmation-audit-boundary.json",
  schema: "data/content-intelligence/schema/controlled-static-apply-execution-confirmation.schema.json",
  learning: "data/content-intelligence/learning/ag21e-controlled-static-apply-execution-confirmation-learning.json",
  registry: "data/quality/ag21e-controlled-static-apply-execution-confirmation.json",
  preview: "data/quality/ag21e-controlled-static-apply-execution-confirmation-preview.json",
  doc: "docs/quality/AG21E_CONTROLLED_STATIC_APPLY_EXECUTION_CONFIRMATION.md"
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
  if (!exists(relativePath)) throw new Error(`Missing AG21E input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag21dReview.status !== "controlled_static_apply_execution_readiness_audit_passed_ready_for_ag21e_execution_confirmation") {
  throw new Error("AG21E requires AG21D review readiness.");
}
if (data.ag21dAudit.failed_checks.length !== 0) {
  throw new Error("AG21E requires AG21D audit with zero failed checks.");
}
if (data.ag21dDecision.decision.proceed_to_controlled_static_apply_execution_confirmation !== true) {
  throw new Error("AG21E requires AG21D execution confirmation decision.");
}
if (data.ag21dReadiness.ready_for_ag21e !== true) {
  throw new Error("AG21E requires AG21D readiness.");
}
if (data.ag21dBoundary.next_stage_id !== "AG21E" || data.ag21dBoundary.explicit_approval_required !== true) {
  throw new Error("AG21E requires AG21D to AG21E explicit boundary.");
}

const requiredPhrase = "Proceed with first controlled static apply";
if (data.ag19eApprovalPhrase.exact_phrase_required_later !== requiredPhrase) {
  throw new Error("AG21E requires the approved AG19E phrase.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG21E requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  controlled_static_apply_execution_confirmation_only: true,
  execution_confirmation_package_created_in_ag21e: true,
  approval_phrase_final_confirmation_created_in_ag21e: true,
  candidate_final_confirmation_created_in_ag21e: true,
  github_write_final_confirmation_created_in_ag21e: true,
  public_surface_final_confirmation_created_in_ag21e: true,
  deployment_smoke_rollback_final_confirmation_created_in_ag21e: true,
  blocker_register_created_in_ag21e: true,
  ag21f_boundary_created_in_ag21e: true,
  selected_article_read_performed: true,

  explicit_approval_phrase_executed_in_ag21e: false,
  article_generation_performed_in_ag21e: false,
  article_mutation_performed_in_ag21e: false,
  queue_mutation_performed_in_ag21e: false,
  active_admin_review_queue_record_created_in_ag21e: false,
  queue_index_mutation_performed_in_ag21e: false,
  admin_action_execution_performed_in_ag21e: false,
  editor_action_execution_performed_in_ag21e: false,
  real_credential_created_in_ag21e: false,
  auth_activation_performed_in_ag21e: false,
  backend_activation_performed_in_ag21e: false,
  supabase_activation_performed_in_ag21e: false,
  database_write_performed_in_ag21e: false,
  github_token_created_or_exposed_in_ag21e: false,
  github_write_operation_performed_in_ag21e: false,
  active_action_handler_created_in_ag21e: false,
  api_endpoint_created_in_ag21e: false,
  public_visibility_switch_performed_in_ag21e: false,
  public_index_mutation_performed_in_ag21e: false,
  deployment_trigger_performed_in_ag21e: false,
  live_smoke_test_performed_in_ag21e: false,
  rollback_execution_performed_in_ag21e: false,
  public_publishing_operation_performed_in_ag21e: false
};

const approvalConfirmation = {
  module_id: "AG21E",
  title: "Approval Phrase Final Confirmation Record",
  status: "approval_phrase_final_confirmation_created_not_executed",
  required_future_approval_phrase: requiredPhrase,
  inherited_readiness: inputs.ag21cApproval,
  confirmation_notes: [
    "Exact approval phrase remains known.",
    "AG21E confirms the phrase requirement for a later approved apply stage only.",
    "AG21E does not execute or consume the phrase.",
    "No controlled static apply is authorised in AG21E."
  ],
  current_state: {
    final_confirmation_created: true,
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

const candidateConfirmation = {
  module_id: "AG21E",
  title: "Candidate Final Confirmation Record",
  status: "candidate_final_confirmation_created_no_apply",
  seed_candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  inherited_readiness: inputs.ag21cCandidate,
  confirmation_notes: [
    "Candidate path is confirmed.",
    "Candidate hash is verified.",
    "Candidate remains unapplied.",
    "No article file or public surface is mutated."
  ],
  current_state: {
    final_confirmation_created: true,
    candidate_apply_executed_now: false,
    article_mutated_now: false,
    public_visibility_switched_now: false,
    public_index_mutated_now: false,
    published_now: false
  },
  ...stageControls
};

const githubConfirmation = {
  module_id: "AG21E",
  title: "GitHub Write Final Confirmation Record",
  status: "github_write_final_confirmation_created_no_token_no_write",
  inherited_readiness: inputs.ag21cGithub,
  confirmation_notes: [
    "GitHub write precondition is confirmed for future execution path.",
    "No token is created, exposed, wired, logged or committed.",
    "No GitHub write is performed.",
    "No branch or remote mutation is performed."
  ],
  current_state: {
    final_confirmation_created: true,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_token_committed: false,
    github_write_enabled: false,
    github_write_performed: false
  },
  ...stageControls
};

const publicSurfaceConfirmation = {
  module_id: "AG21E",
  title: "Public Surface Final Confirmation Record",
  status: "public_surface_final_confirmation_created_no_mutation",
  inherited_readiness: inputs.ag21cSurfaces,
  future_surface_confirmation: [
    {
      surface_id: "featured_reads_index",
      confirmed_for_later_apply_path: true,
      mutate_now: false
    },
    {
      surface_id: "category_listing",
      confirmed_for_later_apply_path: true,
      mutate_now: false
    },
    {
      surface_id: "homepage_card",
      confirmed_for_later_apply_path: "conditional",
      mutate_now: false
    },
    {
      surface_id: "sitemap_feed_search",
      confirmed_for_later_apply_path: "conditional",
      mutate_now: false
    }
  ],
  current_state: {
    final_confirmation_created: true,
    featured_reads_mutated_now: false,
    category_listing_mutated_now: false,
    homepage_mutated_now: false,
    sitemap_feed_search_mutated_now: false,
    public_visibility_switched_now: false,
    public_index_mutated_now: false
  },
  ...stageControls
};

const deployConfirmation = {
  module_id: "AG21E",
  title: "Deployment Smoke Rollback Final Confirmation Record",
  status: "deployment_smoke_rollback_final_confirmation_created_no_execution",
  inherited_readiness: inputs.ag21cDeploy,
  confirmation_notes: [
    "Deployment trigger remains blocked.",
    "Live smoke-test remains blocked.",
    "Rollback execution remains blocked.",
    "Publishing remains blocked.",
    "Later approved apply stage must capture pre-apply HEAD and rollback path before deployment."
  ],
  current_state: {
    final_confirmation_created: true,
    deployment_triggered_now: false,
    live_smoke_test_performed_now: false,
    rollback_executed_now: false,
    published_now: false
  },
  ...stageControls
};

const confirmationPackage = {
  module_id: "AG21E",
  title: "Controlled Static Apply Execution Confirmation Package",
  status: "controlled_static_apply_execution_confirmation_package_created_pending_audit",
  execution_confirmation_only: true,
  seed_candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  required_future_approval_phrase: requiredPhrase,
  package_sections: [
    out.approvalConfirmation,
    out.candidateConfirmation,
    out.githubConfirmation,
    out.publicSurfaceConfirmation,
    out.deployConfirmation
  ],
  current_decision_state: {
    execution_confirmation_package_created: true,
    ready_for_ag21f_audit: true,
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
  inherited_ag21d_decision: inputs.ag21dDecision,
  ...stageControls
};

const blocker = {
  module_id: "AG21E",
  title: "Controlled Static Apply Execution Confirmation Blocker Register",
  status: "execution_confirmation_operations_remain_blocked_pending_ag21f_audit",
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
  allowed_after_ag21e_without_new_approval: [
    "Review AG21E execution confirmation package.",
    "Proceed to AG21F controlled static apply execution confirmation audit."
  ],
  not_allowed_after_ag21e_without_new_approval: [
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
  module_id: "AG21E",
  title: "Controlled Static Apply Execution Confirmation Audit Readiness Record",
  status: "ready_for_ag21f_controlled_static_apply_execution_confirmation_audit",
  ready_for_ag21f: true,
  ag21f_explicit_approval_required: true,
  execution_confirmation_package_created: true,
  approval_phrase_final_confirmation_created: true,
  candidate_final_confirmation_created: true,
  github_write_final_confirmation_created: true,
  public_surface_final_confirmation_created: true,
  deployment_smoke_rollback_final_confirmation_created: true,
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
  reason: "AG21E creates final execution confirmation records only. AG21F should audit before AG21Z closure or any later real apply transition.",
  ...stageControls
};

const boundary = {
  module_id: "AG21E",
  title: "AG21E to AG21F Controlled Static Apply Execution Confirmation Audit Boundary",
  status: "ag21f_boundary_created_not_started",
  next_stage_id: "AG21F",
  next_stage_title: "Controlled Static Apply Execution Confirmation Audit",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
  ag21f_allowed_scope: [
    "Audit controlled static apply execution confirmation package.",
    "Audit approval phrase final confirmation.",
    "Audit candidate final confirmation.",
    "Audit GitHub write final confirmation.",
    "Audit public surface final confirmation.",
    "Audit deployment, smoke-test and rollback final confirmation.",
    "Confirm Supabase/Auth/backend remains deferred."
  ],
  ag21f_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag21f: true,
  ...stageControls
};

const schema = {
  module_id: "AG21E",
  title: "Controlled Static Apply Execution Confirmation Schema",
  status: "schema_controlled_static_apply_execution_confirmation_only",
  execution_confirmation_package_allowed_in_ag21e: true,
  approval_phrase_final_confirmation_allowed_in_ag21e: true,
  candidate_final_confirmation_allowed_in_ag21e: true,
  github_write_final_confirmation_allowed_in_ag21e: true,
  public_surface_final_confirmation_allowed_in_ag21e: true,
  deployment_smoke_rollback_final_confirmation_allowed_in_ag21e: true,
  ag21f_boundary_allowed_in_ag21e: true,

  explicit_approval_phrase_execution_allowed_in_ag21e: false,
  article_generation_allowed_in_ag21e: false,
  article_mutation_allowed_in_ag21e: false,
  queue_mutation_allowed_in_ag21e: false,
  active_admin_review_queue_record_creation_allowed_in_ag21e: false,
  queue_index_mutation_allowed_in_ag21e: false,
  admin_action_execution_allowed_in_ag21e: false,
  editor_action_execution_allowed_in_ag21e: false,
  real_credential_creation_allowed_in_ag21e: false,
  auth_activation_allowed_in_ag21e: false,
  backend_activation_allowed_in_ag21e: false,
  supabase_activation_allowed_in_ag21e: false,
  database_write_allowed_in_ag21e: false,
  github_token_creation_or_exposure_allowed_in_ag21e: false,
  github_write_operation_allowed_in_ag21e: false,
  active_action_handler_creation_allowed_in_ag21e: false,
  api_endpoint_creation_allowed_in_ag21e: false,
  public_visibility_switch_allowed_in_ag21e: false,
  public_index_mutation_allowed_in_ag21e: false,
  deployment_trigger_allowed_in_ag21e: false,
  live_smoke_test_allowed_in_ag21e: false,
  rollback_execution_allowed_in_ag21e: false,
  public_publishing_operation_allowed_in_ag21e: false,
  ...stageControls
};

const review = {
  module_id: "AG21E",
  title: "Controlled Static Apply Execution Confirmation",
  status: "controlled_static_apply_execution_confirmation_package_created_pending_audit",
  depends_on: ["AG21D"],
  generated_from: inputs,
  confirmation_package_file: out.confirmationPackage,
  approval_confirmation_file: out.approvalConfirmation,
  candidate_confirmation_file: out.candidateConfirmation,
  github_confirmation_file: out.githubConfirmation,
  public_surface_confirmation_file: out.publicSurfaceConfirmation,
  deploy_confirmation_file: out.deployConfirmation,
  blocker_register_file: out.blocker,
  readiness_file: out.readiness,
  next_boundary_file: out.boundary,
  schema_file: out.schema,
  summary: {
    ready_for_ag21f: true,
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
  module_id: "AG21E",
  title: "Controlled Static Apply Execution Confirmation Learning",
  status: "learning_record_only",
  learning_points: [
    "AG21E creates final execution confirmation records only.",
    "Approval phrase, candidate, GitHub write, public surfaces, deployment, smoke-test and rollback are confirmed for later audit but not executed.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing occurred.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG21E",
  title: "Controlled Static Apply Execution Confirmation",
  status: "controlled_static_apply_execution_confirmation_package_created_pending_audit",
  generated_artifacts: {
    review: out.review,
    confirmation_package: out.confirmationPackage,
    approval_confirmation: out.approvalConfirmation,
    candidate_confirmation: out.candidateConfirmation,
    github_confirmation: out.githubConfirmation,
    public_surface_confirmation: out.publicSurfaceConfirmation,
    deploy_confirmation: out.deployConfirmation,
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
  module_id: "AG21E",
  preview_only: true,
  status: "controlled_static_apply_execution_confirmation_package_created_pending_audit",
  ready_for_ag21f: true,
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

const doc = `# AG21E — Controlled Static Apply Execution Confirmation

## Purpose

AG21E creates the controlled static apply execution confirmation package.

AG21E is execution-confirmation only. It does not execute the approval phrase, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment, run live smoke-tests, rollback or publish anything.

## Execution Confirmation Sections

- Approval phrase final confirmation record
- Candidate final confirmation record
- GitHub write final confirmation record
- Public surface final confirmation record
- Deployment, smoke-test and rollback final confirmation record
- Execution confirmation blocker register

## Approval Phrase

Future controlled static apply still requires the exact phrase:

\`Proceed with first controlled static apply\`

This phrase is not executed in AG21E.

## Decision State

AG21E does not perform real apply. It creates execution confirmation evidence for AG21F audit only.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG21F — Controlled Static Apply Execution Confirmation Audit — only with explicit approval.
`;

writeJson(out.review, review);
writeJson(out.confirmationPackage, confirmationPackage);
writeJson(out.approvalConfirmation, approvalConfirmation);
writeJson(out.candidateConfirmation, candidateConfirmation);
writeJson(out.githubConfirmation, githubConfirmation);
writeJson(out.publicSurfaceConfirmation, publicSurfaceConfirmation);
writeJson(out.deployConfirmation, deployConfirmation);
writeJson(out.blocker, blocker);
writeJson(out.readiness, readiness);
writeJson(out.boundary, boundary);
writeJson(out.schema, schema);
writeJson(out.learning, learning);
writeJson(out.registry, registry);
writeJson(out.preview, preview);
writeText(out.doc, doc);

console.log("✅ AG21E Controlled Static Apply Execution Confirmation generated.");
console.log("✅ Approval phrase, candidate, GitHub write, public surface, deployment/smoke-test/rollback final confirmation records created.");
console.log("✅ Explicit approval phrase remains required but not executed.");
console.log("✅ No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing performed.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG21F Controlled Static Apply Execution Confirmation Audit boundary created.");
