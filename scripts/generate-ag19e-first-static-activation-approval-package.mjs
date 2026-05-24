import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag19dReview: "data/content-intelligence/quality-reviews/ag19d-final-public-delta-dry-run-audit.json",
  ag19dAudit: "data/content-intelligence/audit-records/ag19d-final-public-delta-dry-run-audit-report.json",
  ag19dDecision: "data/content-intelligence/go-live/ag19d-first-static-activation-approval-package-readiness-decision-record.json",
  ag19dSafety: "data/content-intelligence/quality-registry/ag19d-final-public-delta-dry-run-safety-record.json",
  ag19dReadiness: "data/content-intelligence/quality-registry/ag19d-first-static-activation-approval-package-readiness-record.json",
  ag19dBoundary: "data/content-intelligence/mutation-plans/ag19d-to-ag19e-first-static-activation-approval-package-boundary.json",

  ag19aCandidateEvidence: "data/content-intelligence/go-live/ag19a-first-candidate-evidence-requirement-plan.json",
  ag19aPublicFilterEvidence: "data/content-intelligence/go-live/ag19a-final-public-filter-evidence-plan.json",
  ag19aManualApproval: "data/content-intelligence/go-live/ag19a-manual-approval-gate-plan.json",
  ag19aGithubSecret: "data/content-intelligence/go-live/ag19a-github-secret-storage-no-secrets-plan.json",

  ag19cFinalDelta: "data/content-intelligence/go-live/ag19c-final-public-delta-dry-run-record.json",
  ag19cBeforeAfter: "data/content-intelligence/go-live/ag19c-before-after-public-surface-preview.json",
  ag19cFeatured: "data/content-intelligence/go-live/ag19c-featured-reads-final-delta-preview.json",
  ag19cCategory: "data/content-intelligence/go-live/ag19c-category-listing-final-delta-preview.json",
  ag19cHomepage: "data/content-intelligence/go-live/ag19c-homepage-card-final-delta-preview.json",
  ag19cSitemap: "data/content-intelligence/go-live/ag19c-sitemap-feed-search-final-delta-preview.json",
  ag19cRollbackSmoke: "data/content-intelligence/go-live/ag19c-rollback-smoke-test-final-preview.json",

  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag19e-first-static-activation-approval-package.json");
const packagePath = path.join(root, "data/content-intelligence/go-live/ag19e-first-static-activation-approval-package.json");
const candidateSummaryPath = path.join(root, "data/content-intelligence/go-live/ag19e-candidate-evidence-approval-summary.json");
const publicDeltaSummaryPath = path.join(root, "data/content-intelligence/go-live/ag19e-final-public-delta-approval-summary.json");
const rollbackSummaryPath = path.join(root, "data/content-intelligence/go-live/ag19e-rollback-smoke-test-approval-summary.json");
const githubSummaryPath = path.join(root, "data/content-intelligence/go-live/ag19e-github-secret-governance-approval-summary.json");
const approvalPhrasePath = path.join(root, "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const blockerPath = path.join(root, "data/content-intelligence/quality-registry/ag19e-approval-package-blocker-register.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag19e-approval-package-audit-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag19e-to-ag19f-first-static-activation-approval-package-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/first-static-activation-approval-package.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag19e-first-static-activation-approval-package-learning.json");
const registryPath = path.join(root, "data/quality/ag19e-first-static-activation-approval-package.json");
const previewPath = path.join(root, "data/quality/ag19e-first-static-activation-approval-package-preview.json");
const docPath = path.join(root, "docs/quality/AG19E_FIRST_STATIC_ACTIVATION_APPROVAL_PACKAGE.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG19E input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag19dReview.status !== "final_public_delta_dry_run_audit_passed_ready_for_ag19e_approval_package") {
  throw new Error("AG19E requires AG19D review readiness.");
}
if (data.ag19dAudit.failed_checks.length !== 0) {
  throw new Error("AG19E requires AG19D audit with zero failed checks.");
}
if (data.ag19dDecision.decision.proceed_to_first_static_activation_approval_package !== true) {
  throw new Error("AG19E requires AG19D decision to proceed to approval package.");
}
for (const key of [
  "proceed_to_real_candidate_apply",
  "proceed_to_github_token_creation",
  "proceed_to_github_write",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (data.ag19dDecision.decision[key] !== false) throw new Error(`AG19E requires ${key} to remain blocked.`);
}
if (data.ag19dReadiness.ready_for_ag19e !== true) {
  throw new Error("AG19E requires AG19D readiness.");
}
if (data.ag19dBoundary.next_stage_id !== "AG19E" || data.ag19dBoundary.explicit_approval_required !== true) {
  throw new Error("AG19E requires AG19D to AG19E explicit boundary.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG19E requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  first_static_activation_approval_package_only: true,
  approval_package_created_in_ag19e: true,
  candidate_evidence_approval_summary_created_in_ag19e: true,
  final_public_delta_approval_summary_created_in_ag19e: true,
  rollback_smoke_test_approval_summary_created_in_ag19e: true,
  github_secret_governance_approval_summary_created_in_ag19e: true,
  explicit_approval_phrase_record_created_in_ag19e: true,
  blocker_register_created_in_ag19e: true,
  ag19f_boundary_created_in_ag19e: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag19e: false,
  article_mutation_performed_in_ag19e: false,
  queue_mutation_performed_in_ag19e: false,
  active_admin_review_queue_record_created_in_ag19e: false,
  queue_index_mutation_performed_in_ag19e: false,
  admin_action_execution_performed_in_ag19e: false,
  editor_action_execution_performed_in_ag19e: false,
  real_credential_created_in_ag19e: false,
  hardcoded_password_created_in_repo_in_ag19e: false,
  password_hash_created_in_repo_in_ag19e: false,
  auth_activation_performed_in_ag19e: false,
  backend_activation_performed_in_ag19e: false,
  supabase_activation_performed_in_ag19e: false,
  database_write_performed_in_ag19e: false,
  github_token_created_or_exposed_in_ag19e: false,
  github_write_operation_performed_in_ag19e: false,
  active_action_handler_created_in_ag19e: false,
  api_endpoint_created_in_ag19e: false,
  public_visibility_switch_performed_in_ag19e: false,
  public_index_mutation_performed_in_ag19e: false,
  deployment_trigger_performed_in_ag19e: false,
  public_publishing_operation_performed_in_ag19e: false
};

const candidateSummary = {
  module_id: "AG19E",
  title: "Candidate Evidence Approval Summary",
  status: "candidate_evidence_summarised_for_approval_package_no_apply",
  candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  evidence_requirements_summarised: data.ag19aCandidateEvidence.required_evidence_before_future_apply,
  current_evidence_state: {
    admin_approval_verified_now: false,
    quality_verified_now: false,
    references_verified_now: false,
    image_credit_verified_now: false,
    layout_verified_now: false,
    approved_hash_applied_now: false,
    ready_for_real_apply_now: false
  },
  inherited_candidate_evidence_plan: inputs.ag19aCandidateEvidence,
  ...stageControls
};

const publicDeltaSummary = {
  module_id: "AG19E",
  title: "Final Public Delta Approval Summary",
  status: "final_public_delta_summarised_for_approval_package_no_mutation",
  final_public_delta_dry_run: inputs.ag19cFinalDelta,
  public_surface_previews: {
    before_after: inputs.ag19cBeforeAfter,
    featured_reads: inputs.ag19cFeatured,
    category_listing: inputs.ag19cCategory,
    homepage_card: inputs.ag19cHomepage,
    sitemap_feed_search: inputs.ag19cSitemap
  },
  summary_state: {
    final_delta_dry_run_completed: true,
    public_surface_preview_completed: true,
    exact_file_delta_approved_now: false,
    public_visibility_switched_now: false,
    public_index_mutated_now: false,
    git_write_performed_now: false,
    published_now: false
  },
  ...stageControls
};

const rollbackSummary = {
  module_id: "AG19E",
  title: "Rollback Smoke-test Approval Summary",
  status: "rollback_smoke_test_summarised_for_approval_package_no_execution",
  rollback_smoke_test_preview: inputs.ag19cRollbackSmoke,
  required_before_future_apply: [
    "Record pre-apply branch.",
    "Record pre-apply HEAD commit.",
    "Record exact file delta.",
    "Prepare rollback command.",
    "Prepare post-deploy smoke-test checklist.",
    "Confirm rollback owner."
  ],
  current_state: {
    rollback_executed_now: false,
    smoke_test_executed_now: false,
    deployment_triggered_now: false,
    published_now: false
  },
  ...stageControls
};

const githubSummary = {
  module_id: "AG19E",
  title: "GitHub Secret Governance Approval Summary",
  status: "github_secret_governance_summarised_no_secrets_created",
  inherited_github_secret_plan: inputs.ag19aGithubSecret,
  future_secret_placeholders: [
    "GITHUB_CONTENT_WRITE_TOKEN",
    "GITHUB_CONTENT_WRITE_BRANCH"
  ],
  governance_rules: [
    "No GitHub token is created in AG19E.",
    "No GitHub token is pasted into repository files.",
    "No token is exposed in logs, JSON, docs or scripts.",
    "No token is wired to any runtime handler.",
    "No GitHub write is performed in AG19E.",
    "Future token use requires explicit approval and least-privilege handling."
  ],
  current_secret_state: {
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_write_enabled: false,
    github_write_performed: false
  },
  ...stageControls
};

const approvalPhrase = {
  module_id: "AG19E",
  title: "Explicit Approval Phrase Record",
  status: "explicit_approval_phrase_defined_not_executed",
  approval_required_before_future_apply: true,
  exact_phrase_required_later: "Proceed with first controlled static apply",
  approval_context_required_later: [
    "Exact candidate article path.",
    "Exact candidate article hash.",
    "Exact public surfaces to mutate.",
    "GitHub write readiness.",
    "Rollback readiness.",
    "Post-deploy smoke-test readiness.",
    "Confirmation that Supabase/Auth/backend remains deferred."
  ],
  current_approval_state: {
    explicit_user_approval_received_now: false,
    real_candidate_apply_authorised_now: false,
    github_token_creation_authorised_now: false,
    github_write_authorised_now: false,
    visibility_switch_authorised_now: false,
    public_index_mutation_authorised_now: false,
    deployment_authorised_now: false,
    publishing_authorised_now: false
  },
  ...stageControls
};

const blockerRegister = {
  module_id: "AG19E",
  title: "Approval Package Blocker Register",
  status: "approval_package_operations_remain_blocked",
  blocked_items: [
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
  allowed_after_ag19e_without_new_approval: [
    "Review AG19E approval package.",
    "Proceed to AG19F approval package audit."
  ],
  not_allowed_after_ag19e_without_new_approval: [
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

const approvalPackage = {
  module_id: "AG19E",
  title: "First Static Activation Approval Package",
  status: "first_static_activation_approval_package_created_pending_audit",
  package_only: true,
  candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  package_sections: [
    {
      section_id: "candidate_evidence",
      file: "data/content-intelligence/go-live/ag19e-candidate-evidence-approval-summary.json"
    },
    {
      section_id: "final_public_delta",
      file: "data/content-intelligence/go-live/ag19e-final-public-delta-approval-summary.json"
    },
    {
      section_id: "rollback_smoke_test",
      file: "data/content-intelligence/go-live/ag19e-rollback-smoke-test-approval-summary.json"
    },
    {
      section_id: "github_secret_governance",
      file: "data/content-intelligence/go-live/ag19e-github-secret-governance-approval-summary.json"
    },
    {
      section_id: "explicit_approval_phrase",
      file: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json"
    }
  ],
  current_decision_state: {
    approval_package_created: true,
    ready_for_ag19f_audit: true,
    explicit_user_approval_received_now: false,
    real_static_apply_authorised_now: false,
    candidate_apply_enabled_now: false,
    github_token_enabled_now: false,
    github_write_enabled_now: false,
    visibility_switch_enabled_now: false,
    public_index_mutation_enabled_now: false,
    deployment_enabled_now: false,
    publishing_enabled_now: false
  },
  inherited_ag19d_decision: inputs.ag19dDecision,
  ...stageControls
};

const readiness = {
  module_id: "AG19E",
  title: "Approval Package Audit Readiness Record",
  status: "ready_for_ag19f_first_static_activation_approval_package_audit",
  ready_for_ag19f: true,
  ag19f_explicit_approval_required: true,
  approval_package_created: true,
  candidate_evidence_summary_created: true,
  final_public_delta_summary_created: true,
  rollback_smoke_test_summary_created: true,
  github_secret_governance_summary_created: true,
  explicit_approval_phrase_record_created: true,
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  supabase_auth_reminder_required_in_future: true,

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
  reason: "AG19E creates an approval package only. AG19F should audit the package before AG19Z closure and AG20 controlled apply readiness.",
  ...stageControls
};

const boundary = {
  module_id: "AG19E",
  title: "AG19E to AG19F First Static Activation Approval Package Audit Boundary",
  status: "ag19f_boundary_created_not_started",
  next_stage_id: "AG19F",
  next_stage_title: "First Static Activation Approval Package Audit",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag19f_allowed_scope: [
    "Audit first static activation approval package.",
    "Audit candidate evidence approval summary.",
    "Audit final public delta approval summary.",
    "Audit rollback and smoke-test approval summary.",
    "Audit GitHub secret governance summary.",
    "Audit explicit approval phrase record.",
    "Confirm Supabase/Auth/backend remains deferred."
  ],
  ag19f_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag19f: true,
  ...stageControls
};

const schema = {
  module_id: "AG19E",
  title: "First Static Activation Approval Package Schema",
  status: "schema_first_static_activation_approval_package_only",
  approval_package_allowed_in_ag19e: true,
  candidate_evidence_summary_allowed_in_ag19e: true,
  final_public_delta_summary_allowed_in_ag19e: true,
  rollback_smoke_test_summary_allowed_in_ag19e: true,
  github_secret_governance_summary_allowed_in_ag19e: true,
  explicit_approval_phrase_record_allowed_in_ag19e: true,
  ag19f_boundary_allowed_in_ag19e: true,

  article_generation_allowed_in_ag19e: false,
  article_mutation_allowed_in_ag19e: false,
  queue_mutation_allowed_in_ag19e: false,
  active_admin_review_queue_record_creation_allowed_in_ag19e: false,
  queue_index_mutation_allowed_in_ag19e: false,
  admin_action_execution_allowed_in_ag19e: false,
  editor_action_execution_allowed_in_ag19e: false,
  real_credential_creation_allowed_in_ag19e: false,
  auth_activation_allowed_in_ag19e: false,
  backend_activation_allowed_in_ag19e: false,
  supabase_activation_allowed_in_ag19e: false,
  database_write_allowed_in_ag19e: false,
  github_token_creation_or_exposure_allowed_in_ag19e: false,
  github_write_operation_allowed_in_ag19e: false,
  active_action_handler_creation_allowed_in_ag19e: false,
  api_endpoint_creation_allowed_in_ag19e: false,
  public_visibility_switch_allowed_in_ag19e: false,
  public_index_mutation_allowed_in_ag19e: false,
  public_publishing_operation_allowed_in_ag19e: false,
  deployment_trigger_allowed_in_ag19e: false,
  ...stageControls
};

const review = {
  module_id: "AG19E",
  title: "First Static Activation Approval Package",
  status: "first_static_activation_approval_package_created_pending_audit",
  depends_on: ["AG19D"],
  generated_from: inputs,
  approval_package_file: "data/content-intelligence/go-live/ag19e-first-static-activation-approval-package.json",
  candidate_summary_file: "data/content-intelligence/go-live/ag19e-candidate-evidence-approval-summary.json",
  public_delta_summary_file: "data/content-intelligence/go-live/ag19e-final-public-delta-approval-summary.json",
  rollback_summary_file: "data/content-intelligence/go-live/ag19e-rollback-smoke-test-approval-summary.json",
  github_summary_file: "data/content-intelligence/go-live/ag19e-github-secret-governance-approval-summary.json",
  approval_phrase_file: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  blocker_register_file: "data/content-intelligence/quality-registry/ag19e-approval-package-blocker-register.json",
  readiness_file: "data/content-intelligence/quality-registry/ag19e-approval-package-audit-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag19e-to-ag19f-first-static-activation-approval-package-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/first-static-activation-approval-package.schema.json",
  summary: {
    approval_package_created: true,
    ready_for_ag19f: true,
    selected_path: "hybrid_staged_path_static_first",
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
  module_id: "AG19E",
  title: "First Static Activation Approval Package Learning",
  status: "learning_record_only",
  learning_points: [
    "AG19E creates the first static activation approval package only.",
    "The approval package summarises candidate evidence, final public delta, rollback/smoke-test and GitHub secret governance.",
    "The explicit approval phrase is defined but not executed.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG19E",
  title: "First Static Activation Approval Package",
  status: "first_static_activation_approval_package_created_pending_audit",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag19e-first-static-activation-approval-package.json",
    approval_package: "data/content-intelligence/go-live/ag19e-first-static-activation-approval-package.json",
    candidate_summary: "data/content-intelligence/go-live/ag19e-candidate-evidence-approval-summary.json",
    public_delta_summary: "data/content-intelligence/go-live/ag19e-final-public-delta-approval-summary.json",
    rollback_summary: "data/content-intelligence/go-live/ag19e-rollback-smoke-test-approval-summary.json",
    github_summary: "data/content-intelligence/go-live/ag19e-github-secret-governance-approval-summary.json",
    approval_phrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
    blocker_register: "data/content-intelligence/quality-registry/ag19e-approval-package-blocker-register.json",
    readiness: "data/content-intelligence/quality-registry/ag19e-approval-package-audit-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag19e-to-ag19f-first-static-activation-approval-package-audit-boundary.json",
    schema: "data/content-intelligence/schema/first-static-activation-approval-package.schema.json",
    learning: "data/content-intelligence/learning/ag19e-first-static-activation-approval-package-learning.json",
    preview: "data/quality/ag19e-first-static-activation-approval-package-preview.json",
    document: "docs/quality/AG19E_FIRST_STATIC_ACTIVATION_APPROVAL_PACKAGE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG19E",
  preview_only: true,
  status: "first_static_activation_approval_package_created_pending_audit",
  approval_package_created: true,
  ready_for_ag19f: true,
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

const doc = `# AG19E — First Static Activation Approval Package

## Purpose

AG19E creates the approval package for the first controlled static activation.

AG19E is approval-package only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Approval Package Sections

- Candidate evidence approval summary
- Final public delta approval summary
- Rollback and smoke-test approval summary
- GitHub secret governance approval summary
- Explicit approval phrase record
- Approval-package blocker register

## Approval Phrase

The future exact phrase is:

\`Proceed with first controlled static apply\`

This phrase is recorded only. It is not executed in AG19E.

## Decision State

AG19E does not approve real apply. It prepares the approval package for AG19F audit only.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG19F — First Static Activation Approval Package Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(packagePath, approvalPackage);
writeJson(candidateSummaryPath, candidateSummary);
writeJson(publicDeltaSummaryPath, publicDeltaSummary);
writeJson(rollbackSummaryPath, rollbackSummary);
writeJson(githubSummaryPath, githubSummary);
writeJson(approvalPhrasePath, approvalPhrase);
writeJson(blockerPath, blockerRegister);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG19E First Static Activation Approval Package generated.");
console.log("✅ Candidate evidence, final public delta, rollback/smoke-test, GitHub secret governance and approval phrase summaries created.");
console.log("✅ Explicit approval phrase recorded but not executed.");
console.log("✅ No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing performed.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG19F First Static Activation Approval Package Audit boundary created.");
