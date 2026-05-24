import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag20bReview: "data/content-intelligence/quality-reviews/ag20b-controlled-static-apply-readiness-audit.json",
  ag20bAudit: "data/content-intelligence/audit-records/ag20b-controlled-static-apply-readiness-audit-report.json",
  ag20bDecision: "data/content-intelligence/go-live/ag20b-controlled-static-apply-final-authorization-readiness-decision-record.json",
  ag20bSafety: "data/content-intelligence/quality-registry/ag20b-controlled-static-apply-safety-record.json",
  ag20bReadiness: "data/content-intelligence/quality-registry/ag20b-controlled-static-apply-final-authorization-readiness-record.json",
  ag20bBoundary: "data/content-intelligence/mutation-plans/ag20b-to-ag20c-controlled-static-apply-final-authorization-boundary.json",

  ag20aPackage: "data/content-intelligence/go-live/ag20a-controlled-static-apply-readiness-package.json",
  ag20aCandidate: "data/content-intelligence/go-live/ag20a-candidate-apply-readiness-check.json",
  ag20aGithub: "data/content-intelligence/go-live/ag20a-github-token-readiness-no-secrets-check.json",
  ag20aSurfaces: "data/content-intelligence/go-live/ag20a-public-surface-apply-map.json",
  ag20aRollback: "data/content-intelligence/go-live/ag20a-rollback-smoke-test-readiness-check.json",
  ag20aApprovalGate: "data/content-intelligence/go-live/ag20a-explicit-approval-gate-readiness-check.json",

  ag19eApprovalPhrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const out = {
  review: "data/content-intelligence/quality-reviews/ag20c-controlled-static-apply-final-authorization.json",
  authorizationPackage: "data/content-intelligence/go-live/ag20c-controlled-static-apply-final-authorization-package.json",
  candidateAuthorization: "data/content-intelligence/go-live/ag20c-candidate-static-apply-authorization-summary.json",
  publicSurfaceAuthorization: "data/content-intelligence/go-live/ag20c-public-surface-authorization-summary.json",
  githubWriteAuthorization: "data/content-intelligence/go-live/ag20c-github-write-authorization-no-execution-record.json",
  rollbackDeploymentAuthorization: "data/content-intelligence/go-live/ag20c-rollback-deployment-smoke-test-authorization-summary.json",
  approvalPhraseGate: "data/content-intelligence/go-live/ag20c-explicit-approval-phrase-final-gate-record.json",
  blocker: "data/content-intelligence/quality-registry/ag20c-controlled-static-apply-final-authorization-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag20c-controlled-static-apply-final-authorization-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag20c-to-ag20d-controlled-static-apply-final-authorization-audit-boundary.json",
  schema: "data/content-intelligence/schema/controlled-static-apply-final-authorization.schema.json",
  learning: "data/content-intelligence/learning/ag20c-controlled-static-apply-final-authorization-learning.json",
  registry: "data/quality/ag20c-controlled-static-apply-final-authorization.json",
  preview: "data/quality/ag20c-controlled-static-apply-final-authorization-preview.json",
  doc: "docs/quality/AG20C_CONTROLLED_STATIC_APPLY_FINAL_AUTHORIZATION.md"
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
  if (!exists(relativePath)) throw new Error(`Missing AG20C input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag20bReview.status !== "controlled_static_apply_readiness_audit_passed_ready_for_ag20c_final_authorization") {
  throw new Error("AG20C requires AG20B review readiness.");
}
if (data.ag20bAudit.failed_checks.length !== 0) {
  throw new Error("AG20C requires AG20B audit with zero failed checks.");
}
if (data.ag20bDecision.decision.proceed_to_controlled_static_apply_final_authorization !== true) {
  throw new Error("AG20C requires AG20B final authorization decision.");
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
  if (data.ag20bDecision.decision[key] !== false) throw new Error(`AG20C requires ${key} to remain blocked.`);
}
if (data.ag20bReadiness.ready_for_ag20c !== true) {
  throw new Error("AG20C requires AG20B readiness.");
}
if (data.ag20bBoundary.next_stage_id !== "AG20C" || data.ag20bBoundary.explicit_approval_required !== true) {
  throw new Error("AG20C requires AG20B to AG20C explicit boundary.");
}

const requiredPhrase = "Proceed with first controlled static apply";
if (data.ag19eApprovalPhrase.exact_phrase_required_later !== requiredPhrase) {
  throw new Error("AG20C requires the approved AG19E phrase.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG20C requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  controlled_static_apply_final_authorization_only: true,
  final_authorization_package_created_in_ag20c: true,
  candidate_authorization_summary_created_in_ag20c: true,
  public_surface_authorization_summary_created_in_ag20c: true,
  github_write_authorization_no_execution_record_created_in_ag20c: true,
  rollback_deployment_smoke_test_authorization_summary_created_in_ag20c: true,
  explicit_approval_phrase_final_gate_created_in_ag20c: true,
  blocker_register_created_in_ag20c: true,
  ag20d_boundary_created_in_ag20c: true,
  selected_article_read_performed: true,

  explicit_approval_phrase_executed_in_ag20c: false,
  article_generation_performed_in_ag20c: false,
  article_mutation_performed_in_ag20c: false,
  queue_mutation_performed_in_ag20c: false,
  active_admin_review_queue_record_created_in_ag20c: false,
  queue_index_mutation_performed_in_ag20c: false,
  admin_action_execution_performed_in_ag20c: false,
  editor_action_execution_performed_in_ag20c: false,
  real_credential_created_in_ag20c: false,
  hardcoded_password_created_in_repo_in_ag20c: false,
  password_hash_created_in_repo_in_ag20c: false,
  auth_activation_performed_in_ag20c: false,
  backend_activation_performed_in_ag20c: false,
  supabase_activation_performed_in_ag20c: false,
  database_write_performed_in_ag20c: false,
  github_token_created_or_exposed_in_ag20c: false,
  github_write_operation_performed_in_ag20c: false,
  active_action_handler_created_in_ag20c: false,
  api_endpoint_created_in_ag20c: false,
  public_visibility_switch_performed_in_ag20c: false,
  public_index_mutation_performed_in_ag20c: false,
  deployment_trigger_performed_in_ag20c: false,
  public_publishing_operation_performed_in_ag20c: false
};

const candidateAuthorization = {
  module_id: "AG20C",
  title: "Candidate Static Apply Authorization Summary",
  status: "candidate_static_apply_authorization_summarised_no_apply",
  candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  inherited_candidate_readiness: inputs.ag20aCandidate,
  authorization_summary: [
    "Candidate article path is known and hash verified.",
    "Candidate can be considered in later controlled apply only after audit and exact approval.",
    "Candidate is not applied in AG20C.",
    "Article file is not mutated in AG20C."
  ],
  current_candidate_state: {
    candidate_authorization_summarised: true,
    candidate_apply_executed_now: false,
    article_mutated_now: false,
    public_visibility_switched_now: false,
    public_index_mutated_now: false,
    published_now: false
  },
  ...stageControls
};

const publicSurfaceAuthorization = {
  module_id: "AG20C",
  title: "Public Surface Authorization Summary",
  status: "public_surface_authorization_summarised_no_mutation",
  inherited_public_surface_map: inputs.ag20aSurfaces,
  future_authorization_surfaces: [
    {
      surface_id: "featured_reads_index",
      authorized_for_later_audit_review: true,
      mutate_now: false
    },
    {
      surface_id: "category_listing",
      authorized_for_later_audit_review: true,
      mutate_now: false
    },
    {
      surface_id: "homepage_card",
      authorized_for_later_audit_review: "conditional",
      mutate_now: false
    },
    {
      surface_id: "sitemap_feed_search",
      authorized_for_later_audit_review: "conditional",
      mutate_now: false
    }
  ],
  current_public_surface_state: {
    featured_reads_mutated: false,
    category_listing_mutated: false,
    homepage_mutated: false,
    sitemap_feed_search_mutated: false,
    public_index_mutated: false,
    public_visibility_switched: false
  },
  ...stageControls
};

const githubWriteAuthorization = {
  module_id: "AG20C",
  title: "GitHub Write Authorization No-Execution Record",
  status: "github_write_authorization_summarised_no_execution",
  inherited_github_token_readiness: inputs.ag20aGithub,
  future_write_requirements: [
    "GitHub content write token must be securely available only in later approved apply stage.",
    "Token must not be committed, logged, pasted, exposed or wired in AG20C.",
    "Write branch must be confirmed in later apply stage.",
    "Exact file delta must be re-confirmed before any write.",
    "Rollback path must be ready before any write."
  ],
  current_github_state: {
    github_authorization_summarised: true,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_token_committed: false,
    github_write_enabled: false,
    github_write_performed: false
  },
  ...stageControls
};

const rollbackDeploymentAuthorization = {
  module_id: "AG20C",
  title: "Rollback Deployment Smoke-test Authorization Summary",
  status: "rollback_deployment_smoke_test_authorization_summarised_no_execution",
  inherited_rollback_smoke_test_readiness: inputs.ag20aRollback,
  future_requirements: [
    "Pre-apply branch must be recorded.",
    "Pre-apply HEAD commit must be recorded.",
    "Exact file delta must be recorded.",
    "Rollback command must be prepared.",
    "Deployment trigger must remain blocked until approved apply stage.",
    "Post-deploy smoke-test must be executed only after approved deployment."
  ],
  current_execution_state: {
    rollback_authorization_summarised: true,
    rollback_executed_now: false,
    deployment_triggered_now: false,
    smoke_test_executed_now: false,
    published_now: false
  },
  ...stageControls
};

const approvalPhraseGate = {
  module_id: "AG20C",
  title: "Explicit Approval Phrase Final Gate Record",
  status: "explicit_approval_phrase_final_gate_defined_not_executed",
  required_future_approval_phrase: requiredPhrase,
  inherited_approval_gate: inputs.ag20aApprovalGate,
  final_gate_conditions_for_later_apply: [
    "Exact phrase must be provided by the user in a later controlled apply stage.",
    "Candidate path and hash must be restated before execution.",
    "GitHub write/token state must be explicitly confirmed before execution.",
    "Public surfaces must be explicitly confirmed before mutation.",
    "Rollback and smoke-test readiness must be explicitly confirmed.",
    "Supabase/Auth/backend must remain deferred unless separately approved."
  ],
  current_gate_state: {
    final_gate_defined: true,
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

const authorizationPackage = {
  module_id: "AG20C",
  title: "Controlled Static Apply Final Authorization Package",
  status: "controlled_static_apply_final_authorization_package_created_pending_audit",
  final_authorization_only: true,
  candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  required_future_approval_phrase: requiredPhrase,
  package_sections: [
    out.candidateAuthorization,
    out.publicSurfaceAuthorization,
    out.githubWriteAuthorization,
    out.rollbackDeploymentAuthorization,
    out.approvalPhraseGate
  ],
  current_decision_state: {
    final_authorization_package_created: true,
    ready_for_ag20d_audit: true,
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
  inherited_ag20b_decision: inputs.ag20bDecision,
  ...stageControls
};

const blocker = {
  module_id: "AG20C",
  title: "Controlled Static Apply Final Authorization Blocker Register",
  status: "controlled_static_apply_final_authorization_operations_remain_blocked_pending_ag20d_audit",
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
    "Supabase/Auth/backend activation.",
    "Database write path."
  ],
  allowed_after_ag20c_without_new_approval: [
    "Review AG20C controlled static apply final authorization package.",
    "Proceed to AG20D controlled static apply final authorization audit."
  ],
  not_allowed_after_ag20c_without_new_approval: [
    "Execute approval phrase.",
    "Create or wire GitHub token.",
    "Perform GitHub write.",
    "Switch public_visibility to true.",
    "Mutate public indexes.",
    "Trigger deployment.",
    "Publish any article.",
    "Activate Supabase/Auth/backend."
  ],
  supabase_auth_backend_deferred: true,
  reminder: data.ag17bSupabaseReminder.reminder,
  ...stageControls
};

const readiness = {
  module_id: "AG20C",
  title: "Controlled Static Apply Final Authorization Audit Readiness Record",
  status: "ready_for_ag20d_controlled_static_apply_final_authorization_audit",
  ready_for_ag20d: true,
  ag20d_explicit_approval_required: true,
  final_authorization_package_created: true,
  candidate_authorization_summary_created: true,
  public_surface_authorization_summary_created: true,
  github_write_authorization_no_execution_record_created: true,
  rollback_deployment_smoke_test_authorization_summary_created: true,
  explicit_approval_phrase_final_gate_created: true,
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
  reason: "AG20C creates final authorization package only. AG20D should audit before any controlled static apply execution readiness closure.",
  ...stageControls
};

const boundary = {
  module_id: "AG20C",
  title: "AG20C to AG20D Controlled Static Apply Final Authorization Audit Boundary",
  status: "ag20d_boundary_created_not_started",
  next_stage_id: "AG20D",
  next_stage_title: "Controlled Static Apply Final Authorization Audit",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
  ag20d_allowed_scope: [
    "Audit controlled static apply final authorization package.",
    "Audit candidate authorization summary.",
    "Audit public surface authorization summary.",
    "Audit GitHub write authorization no-execution record.",
    "Audit rollback/deployment/smoke-test authorization summary.",
    "Audit explicit approval phrase final gate.",
    "Confirm Supabase/Auth/backend remains deferred."
  ],
  ag20d_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag20d: true,
  ...stageControls
};

const schema = {
  module_id: "AG20C",
  title: "Controlled Static Apply Final Authorization Schema",
  status: "schema_controlled_static_apply_final_authorization_only",
  final_authorization_package_allowed_in_ag20c: true,
  candidate_authorization_summary_allowed_in_ag20c: true,
  public_surface_authorization_summary_allowed_in_ag20c: true,
  github_write_authorization_no_execution_record_allowed_in_ag20c: true,
  rollback_deployment_smoke_test_authorization_summary_allowed_in_ag20c: true,
  explicit_approval_phrase_final_gate_allowed_in_ag20c: true,
  ag20d_boundary_allowed_in_ag20c: true,

  explicit_approval_phrase_execution_allowed_in_ag20c: false,
  article_generation_allowed_in_ag20c: false,
  article_mutation_allowed_in_ag20c: false,
  queue_mutation_allowed_in_ag20c: false,
  active_admin_review_queue_record_creation_allowed_in_ag20c: false,
  queue_index_mutation_allowed_in_ag20c: false,
  admin_action_execution_allowed_in_ag20c: false,
  editor_action_execution_allowed_in_ag20c: false,
  real_credential_creation_allowed_in_ag20c: false,
  auth_activation_allowed_in_ag20c: false,
  backend_activation_allowed_in_ag20c: false,
  supabase_activation_allowed_in_ag20c: false,
  database_write_allowed_in_ag20c: false,
  github_token_creation_or_exposure_allowed_in_ag20c: false,
  github_write_operation_allowed_in_ag20c: false,
  active_action_handler_creation_allowed_in_ag20c: false,
  api_endpoint_creation_allowed_in_ag20c: false,
  public_visibility_switch_allowed_in_ag20c: false,
  public_index_mutation_allowed_in_ag20c: false,
  public_publishing_operation_allowed_in_ag20c: false,
  deployment_trigger_allowed_in_ag20c: false,
  ...stageControls
};

const review = {
  module_id: "AG20C",
  title: "Controlled Static Apply Final Authorization",
  status: "controlled_static_apply_final_authorization_package_created_pending_audit",
  depends_on: ["AG20B"],
  generated_from: inputs,
  authorization_package_file: out.authorizationPackage,
  candidate_authorization_file: out.candidateAuthorization,
  public_surface_authorization_file: out.publicSurfaceAuthorization,
  github_write_authorization_file: out.githubWriteAuthorization,
  rollback_deployment_authorization_file: out.rollbackDeploymentAuthorization,
  approval_phrase_gate_file: out.approvalPhraseGate,
  blocker_register_file: out.blocker,
  readiness_file: out.readiness,
  next_boundary_file: out.boundary,
  schema_file: out.schema,
  summary: {
    ready_for_ag20d: true,
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
  module_id: "AG20C",
  title: "Controlled Static Apply Final Authorization Learning",
  status: "learning_record_only",
  learning_points: [
    "AG20C creates the final authorization package only.",
    "The explicit approval phrase remains required but not executed.",
    "Candidate, public surfaces, GitHub write, rollback/deployment/smoke-test and final approval gate are summarised.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG20C",
  title: "Controlled Static Apply Final Authorization",
  status: "controlled_static_apply_final_authorization_package_created_pending_audit",
  generated_artifacts: {
    review: out.review,
    authorization_package: out.authorizationPackage,
    candidate_authorization: out.candidateAuthorization,
    public_surface_authorization: out.publicSurfaceAuthorization,
    github_write_authorization: out.githubWriteAuthorization,
    rollback_deployment_authorization: out.rollbackDeploymentAuthorization,
    approval_phrase_gate: out.approvalPhraseGate,
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
  module_id: "AG20C",
  preview_only: true,
  status: "controlled_static_apply_final_authorization_package_created_pending_audit",
  ready_for_ag20d: true,
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

const doc = `# AG20C — Controlled Static Apply Final Authorization

## Purpose

AG20C creates the final authorization package for controlled static apply.

AG20C is final-authorization package only. It does not execute the approval phrase, generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Authorization Package Sections

- Candidate static apply authorization summary
- Public surface authorization summary
- GitHub write authorization no-execution record
- Rollback, deployment and smoke-test authorization summary
- Explicit approval phrase final gate record
- Final authorization blocker register

## Approval Phrase

Future controlled static apply still requires the exact phrase:

\`Proceed with first controlled static apply\`

This phrase is not executed in AG20C.

## Decision State

AG20C does not perform real apply. It prepares final authorization evidence for AG20D audit only.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG20D — Controlled Static Apply Final Authorization Audit — only with explicit approval.
`;

writeJson(out.review, review);
writeJson(out.authorizationPackage, authorizationPackage);
writeJson(out.candidateAuthorization, candidateAuthorization);
writeJson(out.publicSurfaceAuthorization, publicSurfaceAuthorization);
writeJson(out.githubWriteAuthorization, githubWriteAuthorization);
writeJson(out.rollbackDeploymentAuthorization, rollbackDeploymentAuthorization);
writeJson(out.approvalPhraseGate, approvalPhraseGate);
writeJson(out.blocker, blocker);
writeJson(out.readiness, readiness);
writeJson(out.boundary, boundary);
writeJson(out.schema, schema);
writeJson(out.learning, learning);
writeJson(out.registry, registry);
writeJson(out.preview, preview);
writeText(out.doc, doc);

console.log("✅ AG20C Controlled Static Apply Final Authorization generated.");
console.log("✅ Candidate, public surface, GitHub write, rollback/deployment/smoke-test and approval phrase gate records created.");
console.log("✅ Explicit approval phrase remains required but not executed.");
console.log("✅ No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing performed.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG20D Controlled Static Apply Final Authorization Audit boundary created.");
