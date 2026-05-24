import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag18dReview: "data/content-intelligence/quality-reviews/ag18d-first-public-candidate-file-delta-dry-run-audit.json",
  ag18dAudit: "data/content-intelligence/audit-records/ag18d-first-public-candidate-file-delta-dry-run-audit-report.json",
  ag18dDecision: "data/content-intelligence/go-live/ag18d-non-active-real-static-activation-scaffold-readiness-decision-record.json",
  ag18dSafety: "data/content-intelligence/quality-registry/ag18d-file-delta-dry-run-safety-record.json",
  ag18dReadiness: "data/content-intelligence/quality-registry/ag18d-non-active-real-static-activation-scaffold-readiness-record.json",
  ag18dBoundary: "data/content-intelligence/mutation-plans/ag18d-to-ag18e-non-active-real-static-activation-scaffold-boundary.json",
  ag18cCandidate: "data/content-intelligence/go-live/ag18c-candidate-readiness-dry-run.json",
  ag18cPublicFilter: "data/content-intelligence/go-live/ag18c-public-filter-dry-run.json",
  ag18cFileDelta: "data/content-intelligence/go-live/ag18c-intended-file-delta-dry-run.json",
  ag18cRollbackSmoke: "data/content-intelligence/go-live/ag18c-rollback-smoke-test-dry-run.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const scaffoldDir = "internal-scaffolds/ag18e-non-active-real-static-activation";
const helperFile = `${scaffoldDir}/real-static-activation-helper.non-active.mjs`;
const candidateApplyTemplateFile = `${scaffoldDir}/first-public-candidate-apply.template.json`;
const publicIndexDeltaApplyTemplateFile = `${scaffoldDir}/public-index-delta-apply.template.json`;
const githubWritePayloadTemplateFile = `${scaffoldDir}/github-write-payload.template.json`;
const rollbackRecordTemplateFile = `${scaffoldDir}/rollback-record.template.json`;
const smokeTestChecklistTemplateFile = `${scaffoldDir}/smoke-test-checklist.template.json`;
const readmeFile = `${scaffoldDir}/README.md`;

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag18e-non-active-real-static-activation-scaffold.json");
const applyPath = path.join(root, "data/content-intelligence/apply-records/ag18e-non-active-real-static-activation-scaffold-apply.json");
const inventoryPath = path.join(root, "data/content-intelligence/go-live/ag18e-non-active-real-static-activation-scaffold-inventory.json");
const helperContractPath = path.join(root, "data/content-intelligence/go-live/ag18e-real-static-activation-helper-contract-record.json");
const guardPath = path.join(root, "data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-guard-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-scaffold-audit-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag18e-to-ag18f-non-active-real-static-activation-scaffold-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/non-active-real-static-activation-scaffold.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag18e-non-active-real-static-activation-scaffold-learning.json");
const registryPath = path.join(root, "data/quality/ag18e-non-active-real-static-activation-scaffold.json");
const previewPath = path.join(root, "data/quality/ag18e-non-active-real-static-activation-scaffold-preview.json");
const docPath = path.join(root, "docs/quality/AG18E_NON_ACTIVE_REAL_STATIC_ACTIVATION_SCAFFOLD.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG18E input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag18dReview.status !== "first_public_candidate_file_delta_dry_run_audit_passed_ready_for_ag18e_non_active_scaffold") {
  throw new Error("AG18E requires AG18D review readiness.");
}
if (data.ag18dAudit.failed_checks.length !== 0) {
  throw new Error("AG18E requires AG18D audit to pass with zero failed checks.");
}
if (data.ag18dDecision.decision.proceed_to_non_active_real_static_activation_scaffold !== true) {
  throw new Error("AG18E requires AG18D decision to proceed to non-active scaffold.");
}
for (const key of [
  "proceed_to_real_candidate_selection_apply",
  "proceed_to_github_token_creation",
  "proceed_to_github_write",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (data.ag18dDecision.decision[key] !== false) throw new Error(`AG18E requires ${key} to remain blocked.`);
}
if (data.ag18dReadiness.ready_for_ag18e !== true) {
  throw new Error("AG18E requires AG18D readiness.");
}
if (data.ag18dBoundary.next_stage_id !== "AG18E" || data.ag18dBoundary.explicit_approval_required !== true) {
  throw new Error("AG18E requires AG18D to AG18E explicit boundary.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG18E requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  non_active_real_static_activation_scaffold_only: true,
  scaffold_files_created_in_ag18e: true,
  real_static_activation_helper_created_in_ag18e: true,
  first_public_candidate_apply_template_created_in_ag18e: true,
  public_index_delta_apply_template_created_in_ag18e: true,
  github_write_payload_template_created_in_ag18e: true,
  rollback_record_template_created_in_ag18e: true,
  smoke_test_checklist_template_created_in_ag18e: true,
  guard_record_created_in_ag18e: true,
  ag18f_boundary_created_in_ag18e: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag18e: false,
  article_mutation_performed_in_ag18e: false,
  queue_mutation_performed_in_ag18e: false,
  active_admin_review_queue_record_created_in_ag18e: false,
  queue_index_mutation_performed_in_ag18e: false,
  admin_action_execution_performed_in_ag18e: false,
  editor_action_execution_performed_in_ag18e: false,
  real_credential_created_in_ag18e: false,
  hardcoded_password_created_in_repo_in_ag18e: false,
  password_hash_created_in_repo_in_ag18e: false,
  auth_activation_performed_in_ag18e: false,
  backend_activation_performed_in_ag18e: false,
  supabase_activation_performed_in_ag18e: false,
  database_write_performed_in_ag18e: false,
  github_token_created_or_exposed_in_ag18e: false,
  github_write_operation_performed_in_ag18e: false,
  active_action_handler_created_in_ag18e: false,
  api_endpoint_created_in_ag18e: false,
  public_visibility_switch_performed_in_ag18e: false,
  public_index_mutation_performed_in_ag18e: false,
  deployment_trigger_performed_in_ag18e: false,
  public_publishing_operation_performed_in_ag18e: false
};

const helperCode = `// AG18E — Non-active Real Static Activation Scaffold
// This helper is intentionally non-active and outside /api.
// It prepares preview shapes only. It cannot create tokens, write to GitHub,
// mutate articles, switch visibility, update indexes, trigger deployment,
// publish, access secrets, or activate Supabase/Auth/backend.

export const AG18E_REAL_STATIC_ACTIVATION_SCAFFOLD = Object.freeze({
  module_id: "AG18E",
  status: "NON_ACTIVE_REAL_STATIC_ACTIVATION_SCAFFOLD_ONLY",
  candidate_apply_enabled: false,
  github_token_available: false,
  github_write_enabled: false,
  public_visibility_switch_enabled: false,
  public_index_update_enabled: false,
  deployment_trigger_enabled: false,
  publishing_enabled: false,
  admin_editor_execution_enabled: false,
  supabase_auth_backend_enabled: false
});

export function prepareCandidateApplyPreview(record) {
  const source = record && typeof record === "object" ? record : {};

  return Object.freeze({
    module_id: "AG18E",
    status: "NON_ACTIVE_CANDIDATE_APPLY_PREVIEW_ONLY",
    dry_run_only: true,
    article_path: source.article_path || null,
    article_hash: source.article_hash || null,
    public_visibility_target: false,
    publish_approved_target: false,
    public_index_allowed_target: false,
    can_apply_candidate: false,
    reason: "AG18E prepares candidate-apply shape only. It cannot apply or expose the article."
  });
}

export function preparePublicIndexDeltaPreview(record) {
  const source = record && typeof record === "object" ? record : {};

  return Object.freeze({
    module_id: "AG18E",
    status: "NON_ACTIVE_PUBLIC_INDEX_DELTA_PREVIEW_ONLY",
    dry_run_only: true,
    article_path: source.article_path || null,
    article_hash: source.article_hash || null,
    preview_targets: [
      "featured_reads_index",
      "category_listing",
      "homepage_card",
      "sitemap_feed_search"
    ],
    files_to_change_preview: [],
    public_index_update_enabled: false,
    can_mutate_index: false
  });
}

export function prepareGithubWritePayloadPreview(delta) {
  const source = delta && typeof delta === "object" ? delta : {};

  return Object.freeze({
    module_id: "AG18E",
    status: "NON_ACTIVE_GITHUB_WRITE_PAYLOAD_PREVIEW_ONLY",
    dry_run_only: true,
    source_delta_status: source.status || null,
    commit_message_preview: "Preview only — no GitHub write allowed in AG18E",
    files_to_change_preview: [],
    github_token_required_later: true,
    github_token_created_now: false,
    github_token_available: false,
    github_write_enabled: false,
    can_execute_write: false
  });
}

export function prepareRollbackRecordPreview() {
  return Object.freeze({
    module_id: "AG18E",
    status: "NON_ACTIVE_ROLLBACK_RECORD_PREVIEW_ONLY",
    dry_run_only: true,
    pre_write_commit_hash_required_later: true,
    rollback_command_required_later: true,
    rollback_executed_now: false,
    can_execute_rollback: false
  });
}

export function prepareSmokeTestChecklistPreview() {
  return Object.freeze({
    module_id: "AG18E",
    status: "NON_ACTIVE_SMOKE_TEST_CHECKLIST_PREVIEW_ONLY",
    dry_run_only: true,
    deployment_trigger_enabled: false,
    smoke_test_executed_now: false,
    checks: [
      "article URL opens",
      "Featured Reads card appears only after approved apply",
      "category listing appears only after approved apply",
      "homepage card appears only if selected",
      "references and image credits render",
      "mobile layout remains stable"
    ]
  });
}

export function blockRealStaticActivationExecution() {
  return Object.freeze({
    module_id: "AG18E",
    status: "REAL_STATIC_ACTIVATION_EXECUTION_BLOCKED",
    blocked: true,
    candidate_apply_enabled: false,
    github_token_available: false,
    github_write_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_update_enabled: false,
    deployment_trigger_enabled: false,
    publishing_enabled: false,
    supabase_auth_backend_enabled: false
  });
}
`;

const candidateApplyTemplate = {
  module_id: "AG18E",
  title: "First Public Candidate Apply Template",
  status: "non_active_candidate_apply_template_only",
  dry_run_only: true,
  candidate_source: inputs.ag18cCandidate,
  article_path: articlePath,
  article_hash: currentArticleHash,
  future_apply_requirements: [
    "Admin approval evidence must be verified.",
    "Quality evidence must be verified.",
    "Reference verification/image attribution must be checked.",
    "Public filter must pass.",
    "Approved hash must match article hash.",
    "File delta must be reviewed.",
    "Rollback path must be recorded.",
    "Manual approval must be explicit."
  ],
  target_flags_preview_only: {
    public_visibility: false,
    publish_approved: false,
    public_index_allowed: false
  },
  candidate_apply_enabled: false,
  article_mutation_enabled: false,
  queue_mutation_enabled: false,
  public_visibility_switch_enabled: false
};

const publicIndexDeltaApplyTemplate = {
  module_id: "AG18E",
  title: "Public Index Delta Apply Template",
  status: "non_active_public_index_delta_apply_template_only",
  dry_run_only: true,
  candidate_article_path: articlePath,
  candidate_article_hash: currentArticleHash,
  target_surfaces_preview_only: [
    {
      target_id: "featured_reads_index",
      apply_now: false
    },
    {
      target_id: "category_listing",
      apply_now: false
    },
    {
      target_id: "homepage_card",
      apply_now: false
    },
    {
      target_id: "sitemap_feed_search",
      apply_now: false
    }
  ],
  files_to_change_preview: [],
  public_index_update_enabled: false,
  file_mutation_enabled: false
};

const githubWritePayloadTemplate = {
  module_id: "AG18E",
  title: "GitHub Write Payload Template",
  status: "non_active_github_write_payload_template_only",
  dry_run_only: true,
  branch: null,
  commit_message_preview: "Preview only — no GitHub write allowed in AG18E",
  files_to_change_preview: [],
  required_secret_placeholders: [
    "GITHUB_CONTENT_WRITE_TOKEN",
    "GITHUB_CONTENT_WRITE_BRANCH"
  ],
  secrets_created_now: false,
  secrets_exposed_now: false,
  secrets_wired_now: false,
  secrets_committed_now: false,
  github_write_enabled: false,
  can_execute_write: false
};

const rollbackRecordTemplate = {
  module_id: "AG18E",
  title: "Rollback Record Template",
  status: "non_active_rollback_record_template_only",
  dry_run_only: true,
  pre_write_commit_hash: null,
  rollback_command_preview: null,
  rollback_file_delta_preview: [],
  rollback_executed_now: false,
  can_execute_rollback: false
};

const smokeTestChecklistTemplate = {
  module_id: "AG18E",
  title: "Smoke-test Checklist Template",
  status: "non_active_smoke_test_checklist_template_only",
  dry_run_only: true,
  checks: [
    {
      item: "Article URL opens",
      required: true,
      executed_now: false
    },
    {
      item: "Featured Reads card appears only after approved apply",
      required: true,
      executed_now: false
    },
    {
      item: "Category listing appears only after approved apply",
      required: true,
      executed_now: false
    },
    {
      item: "Homepage card appears only if approved",
      required: true,
      executed_now: false
    },
    {
      item: "References and image credits render",
      required: true,
      executed_now: false
    },
    {
      item: "Mobile layout remains stable",
      required: true,
      executed_now: false
    }
  ],
  deployment_trigger_enabled: false,
  publishing_enabled: false,
  smoke_test_executed_now: false
};

const readme = `# AG18E — Non-active Real Static Activation Scaffold

This scaffold is intentionally non-active.

It provides preview-only helper and template shapes for a future controlled real static activation stage. It does not create credentials, wire tokens, write to GitHub, mutate articles, switch visibility, update public indexes, trigger deployment, publish articles, or activate Supabase/Auth/backend.

## Files

- real-static-activation-helper.non-active.mjs
- first-public-candidate-apply.template.json
- public-index-delta-apply.template.json
- github-write-payload.template.json
- rollback-record.template.json
- smoke-test-checklist.template.json

## Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.
`;

writeText(path.join(root, helperFile), helperCode);
writeJson(path.join(root, candidateApplyTemplateFile), candidateApplyTemplate);
writeJson(path.join(root, publicIndexDeltaApplyTemplateFile), publicIndexDeltaApplyTemplate);
writeJson(path.join(root, githubWritePayloadTemplateFile), githubWritePayloadTemplate);
writeJson(path.join(root, rollbackRecordTemplateFile), rollbackRecordTemplate);
writeJson(path.join(root, smokeTestChecklistTemplateFile), smokeTestChecklistTemplate);
writeText(path.join(root, readmeFile), readme);

const scaffoldFiles = [
  helperFile,
  candidateApplyTemplateFile,
  publicIndexDeltaApplyTemplateFile,
  githubWritePayloadTemplateFile,
  rollbackRecordTemplateFile,
  smokeTestChecklistTemplateFile,
  readmeFile
];

const fileRecords = scaffoldFiles.map((file) => ({
  file,
  hash: sha256(fs.readFileSync(path.join(root, file), "utf8")),
  inside_api: file.startsWith("api/") || file.includes("/api/"),
  deployable_endpoint: false,
  github_write_path: false,
  public_index_mutation_path: false,
  visibility_switch_path: false,
  publishing_path: false
}));

const inventory = {
  module_id: "AG18E",
  title: "Non-active Real Static Activation Scaffold Inventory",
  status: "non_active_real_static_activation_scaffold_files_created",
  scaffold_directory: scaffoldDir,
  files: fileRecords,
  helper_file_intentionally_outside_api: true,
  no_active_endpoint_created: true,
  no_github_token_path_created: true,
  no_github_write_path_created: true,
  no_article_mutation_path_created: true,
  no_queue_mutation_path_created: true,
  no_public_visibility_switch_created: true,
  no_public_index_mutation_path_created: true,
  no_deployment_trigger_created: true,
  no_publishing_operation_created: true,
  supabase_auth_backend_deferred: true,
  ...stageControls
};

const helperContract = {
  module_id: "AG18E",
  title: "Real Static Activation Helper Contract Record",
  status: "real_static_activation_helper_contract_created_non_active",
  helper_file: helperFile,
  candidate_apply_template_file: candidateApplyTemplateFile,
  public_index_delta_apply_template_file: publicIndexDeltaApplyTemplateFile,
  github_write_payload_template_file: githubWritePayloadTemplateFile,
  rollback_record_template_file: rollbackRecordTemplateFile,
  smoke_test_checklist_template_file: smokeTestChecklistTemplateFile,
  helper_contract: {
    input: "candidate_or_public_delta_record",
    output: "preview_only_apply_shape_or_checklist",
    candidate_apply_allowed: false,
    github_token_creation_allowed: false,
    github_write_allowed: false,
    article_mutation_allowed: false,
    queue_mutation_allowed: false,
    public_visibility_switch_allowed: false,
    public_index_update_allowed: false,
    deployment_trigger_allowed: false,
    publish_allowed: false,
    supabase_auth_backend_allowed: false
  },
  source_controls: {
    ag18d_safety: inputs.ag18dSafety,
    ag18c_candidate_dry_run: inputs.ag18cCandidate,
    ag18c_public_filter_dry_run: inputs.ag18cPublicFilter,
    ag18c_file_delta_dry_run: inputs.ag18cFileDelta
  },
  ...stageControls
};

const guard = {
  module_id: "AG18E",
  title: "Non-active Real Static Activation Guard Record",
  status: "non_active_real_static_activation_guards_confirmed",
  guard_assertions: {
    candidate_apply_enabled: false,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_write_enabled: false,
    article_mutation_enabled: false,
    queue_mutation_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_update_enabled: false,
    deployment_trigger_enabled: false,
    publishing_enabled: false,
    admin_editor_execution_enabled: false,
    supabase_auth_backend_enabled: false
  },
  prohibited_runtime_behaviour: [
    "No GitHub token creation.",
    "No GitHub token exposure.",
    "No GitHub token wiring.",
    "No GitHub write.",
    "No candidate apply.",
    "No article mutation.",
    "No queue mutation.",
    "No public visibility switch.",
    "No public index update.",
    "No deployment trigger.",
    "No publishing operation.",
    "No Admin/Editor action execution.",
    "No Supabase/Auth/backend activation.",
    "No external network write service."
  ],
  supabase_auth_reminder: data.ag17bSupabaseReminder.reminder,
  inherited_safety: data.ag18dSafety.safety_assertions,
  ...stageControls
};

const apply = {
  module_id: "AG18E",
  title: "Non-active Real Static Activation Scaffold Apply Record",
  status: "non_active_real_static_activation_scaffold_created_pending_audit",
  created_files: scaffoldFiles,
  scaffold_inventory_file: "data/content-intelligence/go-live/ag18e-non-active-real-static-activation-scaffold-inventory.json",
  helper_contract_file: "data/content-intelligence/go-live/ag18e-real-static-activation-helper-contract-record.json",
  guard_record_file: "data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-guard-record.json",
  ...stageControls
};

const readiness = {
  module_id: "AG18E",
  title: "Non-active Real Static Activation Scaffold Audit Readiness Record",
  status: "ready_for_ag18f_non_active_real_static_activation_scaffold_audit",
  ready_for_ag18f: true,
  ag18f_explicit_approval_required: true,
  non_active_real_static_activation_scaffold_created: true,
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
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  reason: "AG18E creates only a non-active scaffold. AG18F should audit that no executable apply path, credentials, GitHub write, visibility switch, public index mutation, deployment or publishing path was introduced.",
  ...stageControls
};

const boundary = {
  module_id: "AG18E",
  title: "AG18E to AG18F Non-active Real Static Activation Scaffold Audit Boundary",
  status: "ag18f_boundary_created_not_started",
  next_stage_id: "AG18F",
  next_stage_title: "Non-active Real Static Activation Scaffold Audit",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag18f_allowed_scope: [
    "Audit non-active real static activation scaffold files.",
    "Confirm scaffold remains outside /api.",
    "Confirm helper cannot create or access GitHub token.",
    "Confirm helper cannot write to GitHub.",
    "Confirm helper cannot apply candidate.",
    "Confirm helper cannot switch visibility.",
    "Confirm helper cannot mutate public index.",
    "Confirm helper cannot trigger deployment.",
    "Confirm helper cannot publish.",
    "Confirm Supabase/Auth/backend remains deferred."
  ],
  ag18f_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag18f: true,
  ...stageControls
};

const schema = {
  module_id: "AG18E",
  title: "Non-active Real Static Activation Scaffold Schema",
  status: "schema_non_active_real_static_activation_scaffold_only",
  non_active_scaffold_file_creation_allowed_in_ag18e: true,
  real_static_activation_helper_allowed_in_ag18e: true,
  candidate_apply_template_allowed_in_ag18e: true,
  public_index_delta_apply_template_allowed_in_ag18e: true,
  github_write_payload_template_allowed_in_ag18e: true,
  rollback_record_template_allowed_in_ag18e: true,
  smoke_test_checklist_template_allowed_in_ag18e: true,
  ag18f_boundary_allowed_in_ag18e: true,

  article_generation_allowed_in_ag18e: false,
  article_mutation_allowed_in_ag18e: false,
  queue_mutation_allowed_in_ag18e: false,
  active_admin_review_queue_record_creation_allowed_in_ag18e: false,
  queue_index_mutation_allowed_in_ag18e: false,
  admin_action_execution_allowed_in_ag18e: false,
  editor_action_execution_allowed_in_ag18e: false,
  real_credential_creation_allowed_in_ag18e: false,
  auth_activation_allowed_in_ag18e: false,
  backend_activation_allowed_in_ag18e: false,
  supabase_activation_allowed_in_ag18e: false,
  database_write_allowed_in_ag18e: false,
  github_token_creation_or_exposure_allowed_in_ag18e: false,
  github_write_operation_allowed_in_ag18e: false,
  active_action_handler_creation_allowed_in_ag18e: false,
  api_endpoint_creation_allowed_in_ag18e: false,
  public_visibility_switch_allowed_in_ag18e: false,
  public_index_mutation_allowed_in_ag18e: false,
  public_publishing_operation_allowed_in_ag18e: false,
  deployment_trigger_allowed_in_ag18e: false,
  ...stageControls
};

const review = {
  module_id: "AG18E",
  title: "Non-active Real Static Activation Scaffold",
  status: "non_active_real_static_activation_scaffold_created_pending_audit",
  depends_on: ["AG18D"],
  generated_from: inputs,
  apply_record_file: "data/content-intelligence/apply-records/ag18e-non-active-real-static-activation-scaffold-apply.json",
  inventory_file: "data/content-intelligence/go-live/ag18e-non-active-real-static-activation-scaffold-inventory.json",
  helper_contract_file: "data/content-intelligence/go-live/ag18e-real-static-activation-helper-contract-record.json",
  guard_record_file: "data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-guard-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-scaffold-audit-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag18e-to-ag18f-non-active-real-static-activation-scaffold-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/non-active-real-static-activation-scaffold.schema.json",
  summary: {
    scaffold_directory: scaffoldDir,
    created_file_count: scaffoldFiles.length,
    ready_for_ag18f: true,
    selected_path: "hybrid_staged_path_static_first",
    supabase_auth_backend_deferred: true,
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
  module_id: "AG18E",
  title: "Non-active Real Static Activation Scaffold Learning",
  status: "learning_record_only",
  learning_points: [
    "AG18E creates only non-active real static activation scaffold files.",
    "Candidate apply, public index delta, GitHub write, rollback and smoke-test shapes remain templates only.",
    "No token, GitHub write, file mutation, visibility switch, public index update, deployment or publishing path is active.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path.",
    "AG18F should audit the scaffold before AG18 closure."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG18E",
  title: "Non-active Real Static Activation Scaffold",
  status: "non_active_real_static_activation_scaffold_created_pending_audit",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag18e-non-active-real-static-activation-scaffold.json",
    apply_record: "data/content-intelligence/apply-records/ag18e-non-active-real-static-activation-scaffold-apply.json",
    inventory: "data/content-intelligence/go-live/ag18e-non-active-real-static-activation-scaffold-inventory.json",
    helper_contract: "data/content-intelligence/go-live/ag18e-real-static-activation-helper-contract-record.json",
    guard_record: "data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-guard-record.json",
    readiness: "data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-scaffold-audit-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag18e-to-ag18f-non-active-real-static-activation-scaffold-audit-boundary.json",
    schema: "data/content-intelligence/schema/non-active-real-static-activation-scaffold.schema.json",
    learning: "data/content-intelligence/learning/ag18e-non-active-real-static-activation-scaffold-learning.json",
    preview: "data/quality/ag18e-non-active-real-static-activation-scaffold-preview.json",
    document: "docs/quality/AG18E_NON_ACTIVE_REAL_STATIC_ACTIVATION_SCAFFOLD.md",
    scaffold_files: scaffoldFiles
  },
  ...stageControls
};

const preview = {
  module_id: "AG18E",
  preview_only: true,
  status: "non_active_real_static_activation_scaffold_created_pending_audit",
  scaffold_directory: scaffoldDir,
  scaffold_files: scaffoldFiles,
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  github_token_ready: false,
  github_write_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  ready_for_ag18f: true,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG18E — Non-active Real Static Activation Scaffold

## Purpose

AG18E creates a non-active scaffold for the future controlled real static activation stage.

AG18E does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Scaffold Location

\`${scaffoldDir}\`

## Created Scaffold Files

- \`${helperFile}\`
- \`${candidateApplyTemplateFile}\`
- \`${publicIndexDeltaApplyTemplateFile}\`
- \`${githubWritePayloadTemplateFile}\`
- \`${rollbackRecordTemplateFile}\`
- \`${smokeTestChecklistTemplateFile}\`
- \`${readmeFile}\`

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG18F — Non-active Real Static Activation Scaffold Audit — only with explicit approval.
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

console.log("✅ AG18E Non-active Real Static Activation Scaffold generated.");
console.log("✅ Non-active helper and templates created outside /api.");
console.log("✅ Candidate apply, public index delta, GitHub write, rollback and smoke-test shapes are preview-only.");
console.log("✅ GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG18F Non-active Real Static Activation Scaffold Audit boundary created.");
