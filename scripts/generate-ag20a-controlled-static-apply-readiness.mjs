import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag19zReview: "data/content-intelligence/quality-reviews/ag19z-first-static-activation-planning-closure.json",
  ag19zClosure: "data/content-intelligence/closure-records/ag19z-first-static-activation-planning-closure.json",
  ag19zSummary: "data/content-intelligence/go-live/ag19z-first-static-activation-planning-summary.json",
  ag19zBlocked: "data/content-intelligence/quality-registry/ag19z-controlled-static-apply-blocked-register.json",
  ag19zReadiness: "data/content-intelligence/quality-registry/ag19z-controlled-static-apply-readiness-record.json",
  ag19zBoundary: "data/content-intelligence/mutation-plans/ag19z-to-ag20a-controlled-static-apply-readiness-boundary.json",

  ag19eApprovalPhrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  ag19ePackage: "data/content-intelligence/go-live/ag19e-first-static-activation-approval-package.json",
  ag19eCandidate: "data/content-intelligence/go-live/ag19e-candidate-evidence-approval-summary.json",
  ag19ePublicDelta: "data/content-intelligence/go-live/ag19e-final-public-delta-approval-summary.json",
  ag19eRollback: "data/content-intelligence/go-live/ag19e-rollback-smoke-test-approval-summary.json",
  ag19eGithub: "data/content-intelligence/go-live/ag19e-github-secret-governance-approval-summary.json",

  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const out = {
  review: "data/content-intelligence/quality-reviews/ag20a-controlled-static-apply-readiness.json",
  readinessPackage: "data/content-intelligence/go-live/ag20a-controlled-static-apply-readiness-package.json",
  candidateCheck: "data/content-intelligence/go-live/ag20a-candidate-apply-readiness-check.json",
  githubTokenCheck: "data/content-intelligence/go-live/ag20a-github-token-readiness-no-secrets-check.json",
  publicSurfaceMap: "data/content-intelligence/go-live/ag20a-public-surface-apply-map.json",
  rollbackSmoke: "data/content-intelligence/go-live/ag20a-rollback-smoke-test-readiness-check.json",
  approvalGate: "data/content-intelligence/go-live/ag20a-explicit-approval-gate-readiness-check.json",
  blocker: "data/content-intelligence/quality-registry/ag20a-controlled-static-apply-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag20a-controlled-static-apply-readiness-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag20a-to-ag20b-controlled-static-apply-readiness-audit-boundary.json",
  schema: "data/content-intelligence/schema/controlled-static-apply-readiness.schema.json",
  learning: "data/content-intelligence/learning/ag20a-controlled-static-apply-readiness-learning.json",
  registry: "data/quality/ag20a-controlled-static-apply-readiness.json",
  preview: "data/quality/ag20a-controlled-static-apply-readiness-preview.json",
  doc: "docs/quality/AG20A_CONTROLLED_STATIC_APPLY_READINESS.md"
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
  if (!exists(relativePath)) throw new Error(`Missing AG20A input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag19zReview.status !== "first_static_activation_planning_chain_closed_ready_for_ag20a_controlled_static_apply_readiness") {
  throw new Error("AG20A requires AG19Z review readiness.");
}
if (data.ag19zClosure.final_decision.proceed_to_ag20a_controlled_static_apply_readiness !== true) {
  throw new Error("AG20A requires AG19Z closure decision.");
}
if (data.ag19zReadiness.ready_for_ag20a !== true) {
  throw new Error("AG20A requires AG19Z readiness.");
}
if (data.ag19zBoundary.next_stage_id !== "AG20A" || data.ag19zBoundary.explicit_approval_required !== true) {
  throw new Error("AG20A requires AG19Z to AG20A explicit boundary.");
}

const requiredPhrase = "Proceed with first controlled static apply";
if (data.ag19eApprovalPhrase.exact_phrase_required_later !== requiredPhrase) {
  throw new Error("AG20A requires the approved AG19E phrase.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG20A requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  controlled_static_apply_readiness_only: true,
  readiness_package_created_in_ag20a: true,
  candidate_apply_readiness_check_created_in_ag20a: true,
  github_token_readiness_no_secrets_check_created_in_ag20a: true,
  public_surface_apply_map_created_in_ag20a: true,
  rollback_smoke_test_readiness_check_created_in_ag20a: true,
  explicit_approval_gate_readiness_check_created_in_ag20a: true,
  blocker_register_created_in_ag20a: true,
  ag20b_boundary_created_in_ag20a: true,
  selected_article_read_performed: true,

  explicit_approval_phrase_executed_in_ag20a: false,
  article_generation_performed_in_ag20a: false,
  article_mutation_performed_in_ag20a: false,
  queue_mutation_performed_in_ag20a: false,
  active_admin_review_queue_record_created_in_ag20a: false,
  queue_index_mutation_performed_in_ag20a: false,
  admin_action_execution_performed_in_ag20a: false,
  editor_action_execution_performed_in_ag20a: false,
  real_credential_created_in_ag20a: false,
  hardcoded_password_created_in_repo_in_ag20a: false,
  password_hash_created_in_repo_in_ag20a: false,
  auth_activation_performed_in_ag20a: false,
  backend_activation_performed_in_ag20a: false,
  supabase_activation_performed_in_ag20a: false,
  database_write_performed_in_ag20a: false,
  github_token_created_or_exposed_in_ag20a: false,
  github_write_operation_performed_in_ag20a: false,
  active_action_handler_created_in_ag20a: false,
  api_endpoint_created_in_ag20a: false,
  public_visibility_switch_performed_in_ag20a: false,
  public_index_mutation_performed_in_ag20a: false,
  deployment_trigger_performed_in_ag20a: false,
  public_publishing_operation_performed_in_ag20a: false
};

const candidateCheck = {
  module_id: "AG20A",
  title: "Candidate Apply Readiness Check",
  status: "candidate_apply_readiness_checked_no_apply",
  candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  inherited_candidate_summary: inputs.ag19eCandidate,
  readiness_observations: [
    "Candidate path is known.",
    "Candidate hash is verified.",
    "Candidate is still not applied.",
    "Public visibility remains blocked pending later approval/audit."
  ],
  current_apply_state: {
    candidate_apply_ready_for_audit_review: true,
    candidate_apply_executed_now: false,
    article_mutated_now: false,
    public_visibility_switched_now: false,
    published_now: false
  },
  ...stageControls
};

const githubTokenCheck = {
  module_id: "AG20A",
  title: "GitHub Token Readiness No-Secrets Check",
  status: "github_token_readiness_checked_no_secrets_created",
  inherited_github_governance_summary: inputs.ag19eGithub,
  required_future_secret_placeholders: [
    "GITHUB_CONTENT_WRITE_TOKEN",
    "GITHUB_CONTENT_WRITE_BRANCH"
  ],
  current_secret_state: {
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_token_committed: false,
    github_write_enabled: false,
    github_write_performed: false
  },
  readiness_rules: [
    "No token is created in AG20A.",
    "No token is committed to repository.",
    "No token is pasted into JSON, docs, scripts or logs.",
    "Future token use requires explicit approval and secure handling.",
    "GitHub write remains blocked until later controlled apply stage."
  ],
  ...stageControls
};

const publicSurfaceMap = {
  module_id: "AG20A",
  title: "Public Surface Apply Map",
  status: "public_surface_apply_map_defined_no_mutation",
  candidate_article_path: articlePath,
  candidate_article_hash: currentArticleHash,
  inherited_public_delta_summary: inputs.ag19ePublicDelta,
  future_surface_map: [
    {
      surface_id: "featured_reads_index",
      future_action: "Add article listing/card after approved controlled static apply.",
      include_in_future_apply_review: true,
      mutated_now: false
    },
    {
      surface_id: "category_listing",
      future_action: "Add article to relevant category listing after approved controlled static apply.",
      include_in_future_apply_review: true,
      mutated_now: false
    },
    {
      surface_id: "homepage_card",
      future_action: "Add homepage card only if separately confirmed in later apply stage.",
      include_in_future_apply_review: "conditional",
      mutated_now: false
    },
    {
      surface_id: "sitemap_feed_search",
      future_action: "Update sitemap/feed/search only if included in approved later apply stage.",
      include_in_future_apply_review: "conditional",
      mutated_now: false
    }
  ],
  current_public_surface_state: {
    featured_reads_mutated: false,
    category_listing_mutated: false,
    homepage_mutated: false,
    sitemap_feed_search_mutated: false,
    public_index_mutated: false
  },
  ...stageControls
};

const rollbackSmoke = {
  module_id: "AG20A",
  title: "Rollback Smoke-test Readiness Check",
  status: "rollback_smoke_test_readiness_checked_no_execution",
  inherited_rollback_summary: inputs.ag19eRollback,
  readiness_requirements_for_later_apply: [
    "Record pre-apply branch.",
    "Record pre-apply HEAD commit.",
    "Record exact future file delta.",
    "Prepare rollback command.",
    "Prepare post-deploy smoke-test checklist.",
    "Confirm article URL, Featured Reads, category, homepage, mobile layout, references and image credits."
  ],
  current_execution_state: {
    rollback_ready_for_audit_review: true,
    smoke_test_ready_for_audit_review: true,
    rollback_executed_now: false,
    smoke_test_executed_now: false,
    deployment_triggered_now: false,
    published_now: false
  },
  ...stageControls
};

const approvalGate = {
  module_id: "AG20A",
  title: "Explicit Approval Gate Readiness Check",
  status: "explicit_approval_gate_ready_not_executed",
  required_future_approval_phrase: requiredPhrase,
  inherited_approval_phrase_record: inputs.ag19eApprovalPhrase,
  approval_context_to_confirm_later: [
    "Exact candidate article path.",
    "Exact candidate article hash.",
    "Exact public surfaces to mutate.",
    "GitHub token readiness.",
    "GitHub write readiness.",
    "Rollback readiness.",
    "Post-deploy smoke-test readiness.",
    "Supabase/Auth/backend remains deferred."
  ],
  current_approval_state: {
    explicit_approval_phrase_executed_now: false,
    controlled_static_apply_authorised_now: false,
    github_token_creation_authorised_now: false,
    github_write_authorised_now: false,
    visibility_switch_authorised_now: false,
    public_index_mutation_authorised_now: false,
    deployment_authorised_now: false,
    publish_authorised_now: false
  },
  ...stageControls
};

const readinessPackage = {
  module_id: "AG20A",
  title: "Controlled Static Apply Readiness Package",
  status: "controlled_static_apply_readiness_package_created_pending_audit",
  readiness_only: true,
  candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  required_future_approval_phrase: requiredPhrase,
  package_sections: [
    out.candidateCheck,
    out.githubTokenCheck,
    out.publicSurfaceMap,
    out.rollbackSmoke,
    out.approvalGate
  ],
  current_decision_state: {
    readiness_package_created: true,
    ready_for_ag20b_audit: true,
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
  ...stageControls
};

const blocker = {
  module_id: "AG20A",
  title: "Controlled Static Apply Blocker Register",
  status: "controlled_static_apply_operations_remain_blocked_pending_ag20b_audit",
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
  allowed_after_ag20a_without_new_approval: [
    "Review AG20A controlled static apply readiness package.",
    "Proceed to AG20B controlled static apply readiness audit."
  ],
  not_allowed_after_ag20a_without_new_approval: [
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
  module_id: "AG20A",
  title: "Controlled Static Apply Readiness Audit Readiness Record",
  status: "ready_for_ag20b_controlled_static_apply_readiness_audit",
  ready_for_ag20b: true,
  ag20b_explicit_approval_required: true,
  controlled_static_apply_readiness_package_created: true,
  candidate_apply_readiness_checked: true,
  github_token_readiness_no_secrets_checked: true,
  public_surface_apply_map_defined: true,
  rollback_smoke_test_readiness_checked: true,
  explicit_approval_gate_readiness_checked: true,
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
  reason: "AG20A prepares controlled static apply readiness only. AG20B should audit before any controlled apply package advances.",
  ...stageControls
};

const boundary = {
  module_id: "AG20A",
  title: "AG20A to AG20B Controlled Static Apply Readiness Audit Boundary",
  status: "ag20b_boundary_created_not_started",
  next_stage_id: "AG20B",
  next_stage_title: "Controlled Static Apply Readiness Audit",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
  ag20b_allowed_scope: [
    "Audit controlled static apply readiness package.",
    "Audit candidate apply readiness check.",
    "Audit GitHub token readiness no-secrets check.",
    "Audit public surface apply map.",
    "Audit rollback and smoke-test readiness.",
    "Audit explicit approval gate readiness.",
    "Confirm Supabase/Auth/backend remains deferred."
  ],
  ag20b_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag20b: true,
  ...stageControls
};

const schema = {
  module_id: "AG20A",
  title: "Controlled Static Apply Readiness Schema",
  status: "schema_controlled_static_apply_readiness_only",
  readiness_package_allowed_in_ag20a: true,
  candidate_apply_readiness_check_allowed_in_ag20a: true,
  github_token_readiness_no_secrets_check_allowed_in_ag20a: true,
  public_surface_apply_map_allowed_in_ag20a: true,
  rollback_smoke_test_readiness_check_allowed_in_ag20a: true,
  explicit_approval_gate_readiness_check_allowed_in_ag20a: true,
  ag20b_boundary_allowed_in_ag20a: true,

  explicit_approval_phrase_execution_allowed_in_ag20a: false,
  article_generation_allowed_in_ag20a: false,
  article_mutation_allowed_in_ag20a: false,
  queue_mutation_allowed_in_ag20a: false,
  active_admin_review_queue_record_creation_allowed_in_ag20a: false,
  queue_index_mutation_allowed_in_ag20a: false,
  admin_action_execution_allowed_in_ag20a: false,
  editor_action_execution_allowed_in_ag20a: false,
  real_credential_creation_allowed_in_ag20a: false,
  auth_activation_allowed_in_ag20a: false,
  backend_activation_allowed_in_ag20a: false,
  supabase_activation_allowed_in_ag20a: false,
  database_write_allowed_in_ag20a: false,
  github_token_creation_or_exposure_allowed_in_ag20a: false,
  github_write_operation_allowed_in_ag20a: false,
  active_action_handler_creation_allowed_in_ag20a: false,
  api_endpoint_creation_allowed_in_ag20a: false,
  public_visibility_switch_allowed_in_ag20a: false,
  public_index_mutation_allowed_in_ag20a: false,
  public_publishing_operation_allowed_in_ag20a: false,
  deployment_trigger_allowed_in_ag20a: false,
  ...stageControls
};

const review = {
  module_id: "AG20A",
  title: "Controlled Static Apply Readiness",
  status: "controlled_static_apply_readiness_package_created_pending_audit",
  depends_on: ["AG19Z"],
  generated_from: inputs,
  readiness_package_file: out.readinessPackage,
  candidate_check_file: out.candidateCheck,
  github_token_check_file: out.githubTokenCheck,
  public_surface_map_file: out.publicSurfaceMap,
  rollback_smoke_test_file: out.rollbackSmoke,
  approval_gate_file: out.approvalGate,
  blocker_register_file: out.blocker,
  readiness_file: out.readiness,
  next_boundary_file: out.boundary,
  schema_file: out.schema,
  summary: {
    ready_for_ag20b: true,
    selected_path: "hybrid_staged_path_static_first",
    required_future_approval_phrase: requiredPhrase,
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
  module_id: "AG20A",
  title: "Controlled Static Apply Readiness Learning",
  status: "learning_record_only",
  learning_points: [
    "AG20A starts the controlled static apply readiness series after AG19 closure.",
    "The explicit approval phrase remains required but not executed.",
    "GitHub token readiness is checked without creating, exposing, wiring or committing secrets.",
    "Candidate, public surfaces, rollback and smoke-test readiness are prepared for audit only.",
    "No GitHub write, visibility switch, public index mutation, deployment or publishing occurred.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG20A",
  title: "Controlled Static Apply Readiness",
  status: "controlled_static_apply_readiness_package_created_pending_audit",
  generated_artifacts: {
    review: out.review,
    readiness_package: out.readinessPackage,
    candidate_check: out.candidateCheck,
    github_token_check: out.githubTokenCheck,
    public_surface_map: out.publicSurfaceMap,
    rollback_smoke_test: out.rollbackSmoke,
    approval_gate: out.approvalGate,
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
  module_id: "AG20A",
  preview_only: true,
  status: "controlled_static_apply_readiness_package_created_pending_audit",
  ready_for_ag20b: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
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

const doc = `# AG20A — Controlled Static Apply Readiness

## Purpose

AG20A prepares the controlled static apply readiness package after AG19 closure.

AG20A is readiness only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Readiness Package Sections

- Candidate apply readiness check
- GitHub token readiness no-secrets check
- Public surface apply map
- Rollback and smoke-test readiness check
- Explicit approval gate readiness check
- Controlled static apply blocker register

## Approval Phrase

Future controlled static apply requires the exact phrase:

\`Proceed with first controlled static apply\`

This phrase is not executed in AG20A.

## Decision State

AG20A does not approve or perform real apply. It prepares readiness for AG20B audit only.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG20B — Controlled Static Apply Readiness Audit — only with explicit approval.
`;

writeJson(out.review, review);
writeJson(out.readinessPackage, readinessPackage);
writeJson(out.candidateCheck, candidateCheck);
writeJson(out.githubTokenCheck, githubTokenCheck);
writeJson(out.publicSurfaceMap, publicSurfaceMap);
writeJson(out.rollbackSmoke, rollbackSmoke);
writeJson(out.approvalGate, approvalGate);
writeJson(out.blocker, blocker);
writeJson(out.readiness, readiness);
writeJson(out.boundary, boundary);
writeJson(out.schema, schema);
writeJson(out.learning, learning);
writeJson(out.registry, registry);
writeJson(out.preview, preview);
writeText(out.doc, doc);

console.log("✅ AG20A Controlled Static Apply Readiness generated.");
console.log("✅ Candidate, GitHub token no-secrets, public surfaces, rollback/smoke-test and approval gate readiness checks created.");
console.log("✅ Explicit approval phrase remains required but not executed.");
console.log("✅ No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing performed.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG20B Controlled Static Apply Readiness Audit boundary created.");
