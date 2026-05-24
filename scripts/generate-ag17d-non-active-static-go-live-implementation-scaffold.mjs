import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag17cReview: "data/content-intelligence/quality-reviews/ag17c-hybrid-static-go-live-plan-audit.json",
  ag17cAudit: "data/content-intelligence/audit-records/ag17c-hybrid-static-go-live-plan-audit-report.json",
  ag17cDecision: "data/content-intelligence/go-live/ag17c-non-active-static-go-live-scaffold-readiness-decision-record.json",
  ag17cSafety: "data/content-intelligence/quality-registry/ag17c-static-go-live-safety-record.json",
  ag17cReadiness: "data/content-intelligence/quality-registry/ag17c-non-active-static-go-live-scaffold-readiness-record.json",
  ag17cBoundary: "data/content-intelligence/mutation-plans/ag17c-to-ag17d-non-active-static-go-live-implementation-scaffold-boundary.json",
  ag17bArchitecture: "data/content-intelligence/go-live/ag17b-static-github-go-live-architecture-plan.json",
  ag17bExposureSequence: "data/content-intelligence/go-live/ag17b-controlled-public-exposure-sequence-plan.json",
  ag17bGithubSecretPlan: "data/content-intelligence/go-live/ag17b-github-secret-requirements-no-secrets-plan.json",
  ag17bRollbackAuditPlan: "data/content-intelligence/go-live/ag17b-static-go-live-rollback-audit-plan.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag16zSummary: "data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const scaffoldDir = "internal-scaffolds/ag17d-non-active-static-go-live";
const helperFile = `${scaffoldDir}/static-go-live-helper.non-active.mjs`;
const publicExposureDeltaTemplateFile = `${scaffoldDir}/public-exposure-delta.template.json`;
const githubCommitPayloadTemplateFile = `${scaffoldDir}/github-commit-payload.template.json`;
const deploymentChecklistTemplateFile = `${scaffoldDir}/deployment-checklist.template.json`;
const publicationFixtureFile = `${scaffoldDir}/publication-state-fixture.approved-and-blocked.json`;
const readmeFile = `${scaffoldDir}/README.md`;

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag17d-non-active-static-go-live-implementation-scaffold.json");
const applyPath = path.join(root, "data/content-intelligence/apply-records/ag17d-non-active-static-go-live-implementation-scaffold-apply.json");
const inventoryPath = path.join(root, "data/content-intelligence/go-live/ag17d-non-active-static-go-live-scaffold-inventory.json");
const helperContractPath = path.join(root, "data/content-intelligence/go-live/ag17d-static-go-live-helper-contract-record.json");
const guardPath = path.join(root, "data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-guard-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-scaffold-audit-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag17d-to-ag17e-non-active-static-go-live-scaffold-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/non-active-static-go-live-implementation-scaffold.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag17d-non-active-static-go-live-implementation-scaffold-learning.json");
const registryPath = path.join(root, "data/quality/ag17d-non-active-static-go-live-implementation-scaffold.json");
const previewPath = path.join(root, "data/quality/ag17d-non-active-static-go-live-implementation-scaffold-preview.json");
const docPath = path.join(root, "docs/quality/AG17D_NON_ACTIVE_STATIC_GO_LIVE_IMPLEMENTATION_SCAFFOLD.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG17D input ${name}: ${relativePath}`);
}

const ag17cReview = readJson(inputs.ag17cReview);
const ag17cAudit = readJson(inputs.ag17cAudit);
const ag17cDecision = readJson(inputs.ag17cDecision);
const ag17cSafety = readJson(inputs.ag17cSafety);
const ag17cReadiness = readJson(inputs.ag17cReadiness);
const ag17cBoundary = readJson(inputs.ag17cBoundary);
const ag17bArchitecture = readJson(inputs.ag17bArchitecture);
const ag17bExposureSequence = readJson(inputs.ag17bExposureSequence);
const ag17bGithubSecretPlan = readJson(inputs.ag17bGithubSecretPlan);
const ag17bRollbackAuditPlan = readJson(inputs.ag17bRollbackAuditPlan);
const ag17bSupabaseReminder = readJson(inputs.ag17bSupabaseReminder);
const ag16zSummary = readJson(inputs.ag16zSummary);
const ag13zCandidate = readJson(inputs.ag13zCandidate);

if (ag17cReview.status !== "hybrid_static_go_live_plan_audit_passed_non_active_scaffold_ready") {
  throw new Error("AG17D requires AG17C review readiness.");
}
if (ag17cAudit.failed_checks.length !== 0) {
  throw new Error("AG17D requires AG17C audit to pass with zero failed checks.");
}
if (ag17cDecision.decision.proceed_to_non_active_static_go_live_scaffold !== true) {
  throw new Error("AG17D requires AG17C decision to proceed to non-active static go-live scaffold.");
}
if (ag17cDecision.decision.proceed_to_real_github_write !== false) {
  throw new Error("AG17D requires real GitHub write to remain blocked.");
}
if (ag17cDecision.decision.proceed_to_public_visibility_switch !== false) {
  throw new Error("AG17D requires public visibility switch to remain blocked.");
}
if (ag17cDecision.decision.proceed_to_public_index_mutation !== false) {
  throw new Error("AG17D requires public index mutation to remain blocked.");
}
if (ag17cDecision.decision.proceed_to_deployment_trigger !== false) {
  throw new Error("AG17D requires deployment trigger to remain blocked.");
}
if (ag17cDecision.decision.proceed_to_publish_execution !== false) {
  throw new Error("AG17D requires publishing to remain blocked.");
}
if (ag17cDecision.decision.proceed_to_supabase_auth_backend_activation !== false) {
  throw new Error("AG17D requires Supabase/Auth/backend to remain deferred.");
}
if (ag17cReadiness.ready_for_ag17d !== true) {
  throw new Error("AG17D requires AG17C readiness.");
}
if (ag17cBoundary.next_stage_id !== "AG17D" || ag17cBoundary.explicit_approval_required !== true) {
  throw new Error("AG17D requires AG17C to AG17D explicit boundary.");
}

const articlePath = ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG17D requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  non_active_static_go_live_implementation_scaffold_only: true,
  scaffold_files_created_in_ag17d: true,
  static_go_live_helper_created_in_ag17d: true,
  public_exposure_delta_template_created_in_ag17d: true,
  github_commit_payload_template_created_in_ag17d: true,
  deployment_checklist_template_created_in_ag17d: true,
  publication_state_fixture_created_in_ag17d: true,
  supabase_auth_defer_reminder_preserved_in_ag17d: true,
  guard_record_created_in_ag17d: true,
  ag17e_boundary_created_in_ag17d: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag17d: false,
  article_mutation_performed_in_ag17d: false,
  queue_mutation_performed_in_ag17d: false,
  active_admin_review_queue_record_created_in_ag17d: false,
  queue_index_mutation_performed_in_ag17d: false,
  admin_action_execution_performed_in_ag17d: false,
  editor_action_execution_performed_in_ag17d: false,
  real_credential_created_in_ag17d: false,
  hardcoded_password_created_in_repo_in_ag17d: false,
  password_hash_created_in_repo_in_ag17d: false,
  auth_activation_performed_in_ag17d: false,
  backend_activation_performed_in_ag17d: false,
  supabase_activation_performed_in_ag17d: false,
  database_write_performed_in_ag17d: false,
  github_token_created_or_exposed_in_ag17d: false,
  github_write_operation_performed_in_ag17d: false,
  active_action_handler_created_in_ag17d: false,
  api_endpoint_created_in_ag17d: false,
  public_visibility_switch_performed_in_ag17d: false,
  public_index_mutation_performed_in_ag17d: false,
  deployment_trigger_performed_in_ag17d: false,
  public_publishing_operation_performed_in_ag17d: false
};

const helperCode = `// AG17D — Non-active Static Go-live Implementation Scaffold
// This helper is intentionally non-active and outside /api.
// It prepares shapes only. It cannot write to GitHub, change public visibility,
// update public indexes, trigger deployment, publish, access secrets, or execute Admin/Editor actions.

export const AG17D_STATIC_GO_LIVE_SCAFFOLD = Object.freeze({
  module_id: "AG17D",
  status: "NON_ACTIVE_STATIC_GO_LIVE_SCAFFOLD_ONLY",
  github_write_enabled: false,
  public_visibility_switch_enabled: false,
  public_index_update_enabled: false,
  deployment_trigger_enabled: false,
  publishing_enabled: false,
  admin_action_execution_enabled: false,
  supabase_auth_backend_enabled: false
});

export function preparePublicExposureDeltaNonActive(record) {
  const source = record && typeof record === "object" ? record : {};

  const eligibleShape =
    source.public_visibility === true &&
    source.publish_approved === true &&
    source.public_index_allowed === true &&
    ["public_published", "published_closed"].includes(source.status) &&
    typeof source.article_path === "string" &&
    source.article_hash === source.approved_hash &&
    ["complete", "not_applicable"].includes(source.quality_evidence_status) &&
    source.preview_status === "passed" &&
    source.hash_integrity_status === "matched";

  return Object.freeze({
    module_id: "AG17D",
    status: "NON_ACTIVE_PUBLIC_EXPOSURE_DELTA_PREVIEW_ONLY",
    dry_run_only: true,
    eligible_shape: eligibleShape,
    article_id: source.article_id || null,
    article_path: source.article_path || null,
    public_surface_targets: ["featured_reads", "category_listing", "homepage_card"],
    github_write_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_update_enabled: false,
    deployment_trigger_enabled: false,
    publishing_enabled: false,
    reason: eligibleShape
      ? "Record shape is eligible for future exposure planning, but AG17D cannot write or publish."
      : "Record shape is not eligible for public exposure."
  });
}

export function prepareGithubCommitPayloadNonActive(delta) {
  const source = delta && typeof delta === "object" ? delta : {};

  return Object.freeze({
    module_id: "AG17D",
    status: "NON_ACTIVE_GITHUB_COMMIT_PAYLOAD_PREVIEW_ONLY",
    dry_run_only: true,
    source_delta_status: source.status || null,
    files_to_change_preview: [],
    commit_message_preview: "Preview only — no commit allowed in AG17D",
    github_write_enabled: false,
    github_token_required_but_not_created: true,
    github_token_available: false,
    can_execute_commit: false
  });
}

export function prepareDeploymentChecklistNonActive() {
  return Object.freeze({
    module_id: "AG17D",
    status: "NON_ACTIVE_DEPLOYMENT_CHECKLIST_PREVIEW_ONLY",
    dry_run_only: true,
    deployment_trigger_enabled: false,
    can_trigger_deployment: false,
    checklist_items: [
      "pre-write hash recorded",
      "public filter passed",
      "Admin decision recorded",
      "rollback path recorded",
      "post-deployment smoke test planned"
    ]
  });
}

export function blockStaticGoLiveExecutionNonActive() {
  return Object.freeze({
    module_id: "AG17D",
    status: "STATIC_GO_LIVE_EXECUTION_BLOCKED",
    blocked: true,
    github_write_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_update_enabled: false,
    deployment_trigger_enabled: false,
    publishing_enabled: false,
    supabase_auth_backend_enabled: false
  });
}
`;

const publicExposureDeltaTemplate = {
  module_id: "AG17D",
  title: "Public Exposure Delta Template",
  status: "non_active_no_write_template_only",
  dry_run_only: true,
  article_id: null,
  article_path: null,
  article_hash: null,
  approved_hash: null,
  target_public_surfaces: [
    "featured_reads",
    "category_listing",
    "homepage_card"
  ],
  required_before_future_write: [
    "public_visibility === true",
    "publish_approved === true",
    "public_index_allowed === true",
    "article_hash === approved_hash",
    "quality_evidence_status in ['complete', 'not_applicable']",
    "preview_status === 'passed'",
    "hash_integrity_status === 'matched'",
    "rollback plan recorded",
    "audit record prepared"
  ],
  public_visibility_switch_enabled: false,
  public_index_update_enabled: false,
  github_write_enabled: false,
  deployment_trigger_enabled: false,
  publishing_enabled: false
};

const githubCommitPayloadTemplate = {
  module_id: "AG17D",
  title: "GitHub Commit Payload Template",
  status: "non_active_no_write_template_only",
  dry_run_only: true,
  branch: null,
  commit_message_preview: "Preview only — no commit allowed in AG17D",
  files_to_change_preview: [],
  required_secret_placeholders: [
    "GITHUB_CONTENT_WRITE_TOKEN",
    "GITHUB_CONTENT_WRITE_BRANCH"
  ],
  secrets_created_now: false,
  secrets_exposed_now: false,
  secrets_wired_now: false,
  github_write_enabled: false,
  can_execute_commit: false
};

const deploymentChecklistTemplate = {
  module_id: "AG17D",
  title: "Deployment Checklist Template",
  status: "non_active_no_execution_template_only",
  dry_run_only: true,
  checklist: [
    {
      item: "Pre-write commit hash recorded",
      required: true,
      executed_now: false
    },
    {
      item: "Admin decision record verified",
      required: true,
      executed_now: false
    },
    {
      item: "Public filter pass result verified",
      required: true,
      executed_now: false
    },
    {
      item: "Rollback command/path recorded",
      required: true,
      executed_now: false
    },
    {
      item: "Post-deployment smoke test checklist prepared",
      required: true,
      executed_now: false
    }
  ],
  deployment_trigger_enabled: false,
  can_trigger_deployment: false,
  publishing_enabled: false
};

const publicationStateFixture = {
  module_id: "AG17D",
  title: "Publication State Fixture Approved and Blocked",
  status: "non_active_fixture_only",
  dry_run_only: true,
  seed_candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    expected_public_exposure_now: false,
    reason: "Seed candidate remains non-public until real public exposure apply stage is approved."
  },
  blocked_case: {
    status: "ready_for_admin_review",
    public_visibility: false,
    publish_approved: false,
    public_index_allowed: false,
    expected_public_exposure: false
  },
  approved_but_not_exposed_case: {
    status: "publish_approved_pending_exposure",
    public_visibility: false,
    publish_approved: true,
    public_index_allowed: false,
    approved_hash: currentArticleHash,
    expected_public_exposure: false
  },
  hypothetical_public_case: {
    status: "public_published",
    public_visibility: true,
    publish_approved: true,
    public_index_allowed: true,
    article_hash: currentArticleHash,
    approved_hash: currentArticleHash,
    quality_evidence_status: "complete",
    preview_status: "passed",
    hash_integrity_status: "matched",
    expected_public_exposure: true,
    note: "Hypothetical only; AG17D does not switch visibility, mutate index, deploy or publish."
  },
  github_write_enabled: false,
  public_visibility_switch_enabled: false,
  public_index_update_enabled: false,
  deployment_trigger_enabled: false,
  publishing_enabled: false
};

const readme = `# AG17D — Non-active Static Go-live Implementation Scaffold

This scaffold is intentionally non-active.

It provides preview-only helpers and templates for the future static/GitHub-controlled go-live route. It does not write to GitHub, change public visibility, update public indexes, execute Admin/Editor actions, trigger deployment, publish articles, or activate Supabase/Auth/backend.

## Files

- static-go-live-helper.non-active.mjs
- public-exposure-delta.template.json
- github-commit-payload.template.json
- deployment-checklist.template.json
- publication-state-fixture.approved-and-blocked.json

## Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.
`;

writeText(path.join(root, helperFile), helperCode);
writeJson(path.join(root, publicExposureDeltaTemplateFile), publicExposureDeltaTemplate);
writeJson(path.join(root, githubCommitPayloadTemplateFile), githubCommitPayloadTemplate);
writeJson(path.join(root, deploymentChecklistTemplateFile), deploymentChecklistTemplate);
writeJson(path.join(root, publicationFixtureFile), publicationStateFixture);
writeText(path.join(root, readmeFile), readme);

const scaffoldFiles = [
  helperFile,
  publicExposureDeltaTemplateFile,
  githubCommitPayloadTemplateFile,
  deploymentChecklistTemplateFile,
  publicationFixtureFile,
  readmeFile
];

const fileRecords = scaffoldFiles.map((file) => ({
  file,
  hash: sha256(fs.readFileSync(path.join(root, file), "utf8")),
  inside_api: file.startsWith("api/") || file.includes("/api/"),
  deployable_endpoint: false,
  github_write_path: false,
  public_index_mutation_path: false
}));

const inventory = {
  module_id: "AG17D",
  title: "Non-active Static Go-live Scaffold Inventory",
  status: "non_active_static_go_live_scaffold_files_created",
  scaffold_directory: scaffoldDir,
  files: fileRecords,
  helper_file_intentionally_outside_api: true,
  no_active_endpoint_created: true,
  no_github_write_path_created: true,
  no_public_index_mutation_path_created: true,
  no_visibility_switch_created: true,
  no_deployment_trigger_created: true,
  no_publishing_operation_created: true,
  supabase_auth_backend_deferred: true,
  ...stageControls
};

const helperContract = {
  module_id: "AG17D",
  title: "Static Go-live Helper Contract Record",
  status: "static_go_live_helper_contract_created_non_active",
  helper_file: helperFile,
  public_exposure_delta_template_file: publicExposureDeltaTemplateFile,
  github_commit_payload_template_file: githubCommitPayloadTemplateFile,
  deployment_checklist_template_file: deploymentChecklistTemplateFile,
  publication_fixture_file: publicationFixtureFile,
  helper_contract: {
    input: "article_publication_record_or_delta",
    output: "preview_only_delta_or_checklist",
    github_write_allowed: false,
    public_visibility_switch_allowed: false,
    public_index_update_allowed: false,
    deployment_trigger_allowed: false,
    publish_allowed: false,
    supabase_auth_backend_allowed: false
  },
  source_controls: {
    ag17b_exposure_sequence: inputs.ag17bExposureSequence,
    ag17b_github_secret_plan: inputs.ag17bGithubSecretPlan,
    ag17b_rollback_audit_plan: inputs.ag17bRollbackAuditPlan,
    ag16_public_control_summary: inputs.ag16zSummary
  },
  ...stageControls
};

const guard = {
  module_id: "AG17D",
  title: "Non-active Static Go-live Guard Record",
  status: "non_active_static_go_live_guards_confirmed",
  guard_assertions: {
    github_write_enabled: false,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    admin_editor_execution_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_update_enabled: false,
    deployment_trigger_enabled: false,
    publishing_enabled: false,
    supabase_auth_backend_enabled: false
  },
  prohibited_runtime_behaviour: [
    "No GitHub write.",
    "No GitHub token creation or exposure.",
    "No public visibility switch.",
    "No public index update.",
    "No Featured Reads mutation.",
    "No deployment trigger.",
    "No publishing operation.",
    "No Admin/Editor action execution.",
    "No Supabase/Auth/backend activation.",
    "No external network write service."
  ],
  supabase_auth_reminder: ag17bSupabaseReminder.reminder,
  ag17c_safety_inherited: ag17cSafety.safety_assertions,
  ...stageControls
};

const apply = {
  module_id: "AG17D",
  title: "Non-active Static Go-live Implementation Scaffold Apply Record",
  status: "non_active_static_go_live_scaffold_created_pending_audit",
  created_files: scaffoldFiles,
  scaffold_inventory_file: "data/content-intelligence/go-live/ag17d-non-active-static-go-live-scaffold-inventory.json",
  helper_contract_file: "data/content-intelligence/go-live/ag17d-static-go-live-helper-contract-record.json",
  guard_record_file: "data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-guard-record.json",
  ...stageControls
};

const readiness = {
  module_id: "AG17D",
  title: "Non-active Static Go-live Scaffold Audit Readiness Record",
  status: "ready_for_ag17e_non_active_static_go_live_scaffold_audit",
  ready_for_ag17e: true,
  ag17e_explicit_approval_required: true,
  non_active_static_go_live_scaffold_created: true,
  static_github_controlled_first: true,
  supabase_auth_deferred: true,
  supabase_auth_reminder_required_in_future: true,
  article_generation_ready: false,
  article_mutation_ready: false,
  queue_mutation_ready: false,
  admin_action_execution_ready: false,
  editor_action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  github_write_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  reason: "AG17D creates only a non-active static go-live scaffold. AG17E should audit that no live write, visibility, deployment or publishing path was introduced.",
  ...stageControls
};

const boundary = {
  module_id: "AG17D",
  title: "AG17D to AG17E Non-active Static Go-live Scaffold Audit Boundary",
  status: "ag17e_boundary_created_not_started",
  next_stage_id: "AG17E",
  next_stage_title: "Non-active Static Go-live Implementation Scaffold Audit",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag17e_allowed_scope: [
    "Audit non-active static go-live scaffold files.",
    "Confirm scaffold remains outside /api.",
    "Confirm helper cannot write to GitHub.",
    "Confirm helper cannot switch visibility.",
    "Confirm helper cannot mutate public index.",
    "Confirm helper cannot trigger deployment.",
    "Confirm helper cannot publish.",
    "Confirm Supabase/Auth/backend remains deferred.",
    "Confirm readiness for AG17Z closure or next governed static activation planning."
  ],
  ag17e_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag17e: true,
  ...stageControls
};

const schema = {
  module_id: "AG17D",
  title: "Non-active Static Go-live Implementation Scaffold Schema",
  status: "schema_non_active_static_go_live_implementation_scaffold_only",
  non_active_scaffold_file_creation_allowed_in_ag17d: true,
  static_go_live_helper_allowed_in_ag17d: true,
  public_exposure_delta_template_allowed_in_ag17d: true,
  github_commit_payload_template_allowed_in_ag17d: true,
  deployment_checklist_template_allowed_in_ag17d: true,
  publication_state_fixture_allowed_in_ag17d: true,
  ag17e_boundary_allowed_in_ag17d: true,

  article_generation_allowed_in_ag17d: false,
  article_mutation_allowed_in_ag17d: false,
  queue_mutation_allowed_in_ag17d: false,
  active_admin_review_queue_record_creation_allowed_in_ag17d: false,
  queue_index_mutation_allowed_in_ag17d: false,
  admin_action_execution_allowed_in_ag17d: false,
  editor_action_execution_allowed_in_ag17d: false,
  real_credential_creation_allowed_in_ag17d: false,
  hardcoded_password_allowed_in_ag17d: false,
  password_hash_commit_allowed_in_ag17d: false,
  auth_activation_allowed_in_ag17d: false,
  backend_activation_allowed_in_ag17d: false,
  supabase_activation_allowed_in_ag17d: false,
  database_write_allowed_in_ag17d: false,
  github_token_creation_or_exposure_allowed_in_ag17d: false,
  github_write_operation_allowed_in_ag17d: false,
  active_action_handler_creation_allowed_in_ag17d: false,
  api_endpoint_creation_allowed_in_ag17d: false,
  public_visibility_switch_allowed_in_ag17d: false,
  public_index_mutation_allowed_in_ag17d: false,
  public_publishing_operation_allowed_in_ag17d: false,
  deployment_trigger_allowed_in_ag17d: false,
  ...stageControls
};

const review = {
  module_id: "AG17D",
  title: "Non-active Static Go-live Implementation Scaffold",
  status: "non_active_static_go_live_scaffold_created_pending_audit",
  depends_on: ["AG17C"],
  generated_from: inputs,
  apply_record_file: "data/content-intelligence/apply-records/ag17d-non-active-static-go-live-implementation-scaffold-apply.json",
  inventory_file: "data/content-intelligence/go-live/ag17d-non-active-static-go-live-scaffold-inventory.json",
  helper_contract_file: "data/content-intelligence/go-live/ag17d-static-go-live-helper-contract-record.json",
  guard_record_file: "data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-guard-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-scaffold-audit-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag17d-to-ag17e-non-active-static-go-live-scaffold-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/non-active-static-go-live-implementation-scaffold.schema.json",
  summary: {
    scaffold_directory: scaffoldDir,
    created_file_count: scaffoldFiles.length,
    github_write_performed: false,
    public_visibility_switch_performed: false,
    public_index_mutation_performed: false,
    deployment_trigger_performed: false,
    publishing_operation_performed: false,
    supabase_auth_deferred: true,
    ready_for_ag17e: true,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG17D",
  title: "Non-active Static Go-live Implementation Scaffold Learning",
  status: "learning_record_only",
  learning_points: [
    "Static go-live implementation can be scaffolded safely only as non-active preview logic.",
    "GitHub commit payloads must remain templates until secret management and rollback controls are approved.",
    "Deployment checklist must remain no-execution until later controlled apply stages.",
    "Supabase/Auth/backend remains deferred and must be re-confirmed before any backend stage.",
    "AG17E should audit scaffold safety before AG17 closure."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG17D",
  title: "Non-active Static Go-live Implementation Scaffold",
  status: "non_active_static_go_live_scaffold_created_pending_audit",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag17d-non-active-static-go-live-implementation-scaffold.json",
    apply_record: "data/content-intelligence/apply-records/ag17d-non-active-static-go-live-implementation-scaffold-apply.json",
    inventory: "data/content-intelligence/go-live/ag17d-non-active-static-go-live-scaffold-inventory.json",
    helper_contract: "data/content-intelligence/go-live/ag17d-static-go-live-helper-contract-record.json",
    guard_record: "data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-guard-record.json",
    readiness: "data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-scaffold-audit-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag17d-to-ag17e-non-active-static-go-live-scaffold-audit-boundary.json",
    schema: "data/content-intelligence/schema/non-active-static-go-live-implementation-scaffold.schema.json",
    learning: "data/content-intelligence/learning/ag17d-non-active-static-go-live-implementation-scaffold-learning.json",
    preview: "data/quality/ag17d-non-active-static-go-live-implementation-scaffold-preview.json",
    document: "docs/quality/AG17D_NON_ACTIVE_STATIC_GO_LIVE_IMPLEMENTATION_SCAFFOLD.md",
    scaffold_files: scaffoldFiles
  },
  ...stageControls
};

const preview = {
  module_id: "AG17D",
  preview_only: true,
  status: "non_active_static_go_live_scaffold_created_pending_audit",
  scaffold_directory: scaffoldDir,
  scaffold_files: scaffoldFiles,
  static_github_controlled_first: true,
  supabase_auth_deferred: true,
  github_write_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  ready_for_ag17e: true,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG17D — Non-active Static Go-live Implementation Scaffold

## Purpose

AG17D creates a non-active scaffold for the static/GitHub-controlled first go-live path.

AG17D does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Scaffold Location

\`${scaffoldDir}\`

## Created Scaffold Files

- \`${helperFile}\`
- \`${publicExposureDeltaTemplateFile}\`
- \`${githubCommitPayloadTemplateFile}\`
- \`${deploymentChecklistTemplateFile}\`
- \`${publicationFixtureFile}\`
- \`${readmeFile}\`

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG17E — Non-active Static Go-live Implementation Scaffold Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(applyPath, apply);
writeJson(inventoryPath, inventory);
writeJson(helperContractPath, helperContract);
writeJson(guardPath, guard);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG17D non-active static go-live implementation scaffold generated.");
console.log("✅ Static go-live helper, no-write templates and publication fixture created outside /api.");
console.log("✅ Supabase/Auth/backend defer reminder preserved.");
console.log("✅ GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
console.log("✅ AG17E non-active static go-live scaffold audit boundary created.");
