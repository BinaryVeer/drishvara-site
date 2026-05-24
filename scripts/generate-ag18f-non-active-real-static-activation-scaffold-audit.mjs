import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag18eReview: "data/content-intelligence/quality-reviews/ag18e-non-active-real-static-activation-scaffold.json",
  ag18eApply: "data/content-intelligence/apply-records/ag18e-non-active-real-static-activation-scaffold-apply.json",
  ag18eInventory: "data/content-intelligence/go-live/ag18e-non-active-real-static-activation-scaffold-inventory.json",
  ag18eHelperContract: "data/content-intelligence/go-live/ag18e-real-static-activation-helper-contract-record.json",
  ag18eGuard: "data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-guard-record.json",
  ag18eReadiness: "data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-scaffold-audit-readiness-record.json",
  ag18eBoundary: "data/content-intelligence/mutation-plans/ag18e-to-ag18f-non-active-real-static-activation-scaffold-audit-boundary.json",
  ag18dDecision: "data/content-intelligence/go-live/ag18d-non-active-real-static-activation-scaffold-readiness-decision-record.json",
  ag18dSafety: "data/content-intelligence/quality-registry/ag18d-file-delta-dry-run-safety-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const scaffoldFiles = [
  "internal-scaffolds/ag18e-non-active-real-static-activation/real-static-activation-helper.non-active.mjs",
  "internal-scaffolds/ag18e-non-active-real-static-activation/first-public-candidate-apply.template.json",
  "internal-scaffolds/ag18e-non-active-real-static-activation/public-index-delta-apply.template.json",
  "internal-scaffolds/ag18e-non-active-real-static-activation/github-write-payload.template.json",
  "internal-scaffolds/ag18e-non-active-real-static-activation/rollback-record.template.json",
  "internal-scaffolds/ag18e-non-active-real-static-activation/smoke-test-checklist.template.json",
  "internal-scaffolds/ag18e-non-active-real-static-activation/README.md"
];

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag18f-non-active-real-static-activation-scaffold-audit.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag18f-non-active-real-static-activation-scaffold-audit-report.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag18f-non-active-real-static-activation-scaffold-audit-closure.json");
const safetyPath = path.join(root, "data/content-intelligence/quality-registry/ag18f-non-active-real-static-activation-scaffold-safety-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag18f-controlled-real-static-activation-planning-closure-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag18f-to-ag18z-controlled-real-static-activation-planning-closure-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/non-active-real-static-activation-scaffold-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag18f-non-active-real-static-activation-scaffold-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag18f-non-active-real-static-activation-scaffold-audit.json");
const previewPath = path.join(root, "data/quality/ag18f-non-active-real-static-activation-scaffold-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG18F_NON_ACTIVE_REAL_STATIC_ACTIVATION_SCAFFOLD_AUDIT.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
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
  if (!exists(relativePath)) throw new Error(`Missing AG18F input ${name}: ${relativePath}`);
}

for (const file of scaffoldFiles) {
  if (!exists(file)) throw new Error(`Missing AG18E scaffold file: ${file}`);
}

const ag18eReview = readJson(inputs.ag18eReview);
const ag18eApply = readJson(inputs.ag18eApply);
const ag18eInventory = readJson(inputs.ag18eInventory);
const ag18eHelperContract = readJson(inputs.ag18eHelperContract);
const ag18eGuard = readJson(inputs.ag18eGuard);
const ag18eReadiness = readJson(inputs.ag18eReadiness);
const ag18eBoundary = readJson(inputs.ag18eBoundary);
const ag18dDecision = readJson(inputs.ag18dDecision);
const ag18dSafety = readJson(inputs.ag18dSafety);
const ag17bSupabaseReminder = readJson(inputs.ag17bSupabaseReminder);

if (ag18eReview.status !== "non_active_real_static_activation_scaffold_created_pending_audit") {
  throw new Error("AG18F requires AG18E review.");
}
if (ag18eApply.status !== "non_active_real_static_activation_scaffold_created_pending_audit") {
  throw new Error("AG18F requires AG18E apply record.");
}
if (ag18eReadiness.ready_for_ag18f !== true) {
  throw new Error("AG18F requires AG18E readiness.");
}
if (ag18eBoundary.next_stage_id !== "AG18F" || ag18eBoundary.explicit_approval_required !== true) {
  throw new Error("AG18F requires AG18E to AG18F explicit boundary.");
}

const helperPath = "internal-scaffolds/ag18e-non-active-real-static-activation/real-static-activation-helper.non-active.mjs";
const candidateTemplatePath = "internal-scaffolds/ag18e-non-active-real-static-activation/first-public-candidate-apply.template.json";
const indexTemplatePath = "internal-scaffolds/ag18e-non-active-real-static-activation/public-index-delta-apply.template.json";
const githubTemplatePath = "internal-scaffolds/ag18e-non-active-real-static-activation/github-write-payload.template.json";
const rollbackTemplatePath = "internal-scaffolds/ag18e-non-active-real-static-activation/rollback-record.template.json";
const smokeTemplatePath = "internal-scaffolds/ag18e-non-active-real-static-activation/smoke-test-checklist.template.json";

const helperText = readText(helperPath);
const candidateTemplate = readJson(candidateTemplatePath);
const indexTemplate = readJson(indexTemplatePath);
const githubTemplate = readJson(githubTemplatePath);
const rollbackTemplate = readJson(rollbackTemplatePath);
const smokeTemplate = readJson(smokeTemplatePath);

const prohibitedHelperPattern = /from\s+["']node:fs["']|from\s+["']fs["']|writeFile|appendFile|fetch\(|Octokit|process\.env|child_process|createWriteStream|rmSync|unlinkSync/i;

const activeApiEndpointExists =
  exists("api/real-static-activation.js") ||
  exists("api/real-static-activation.mjs") ||
  exists("api/real-static-activation.ts") ||
  exists("api/dynamic-publish.js") ||
  exists("api/dynamic-publish.mjs") ||
  exists("api/dynamic-publish.ts") ||
  exists("api/admin-publish.js") ||
  exists("api/admin-publish.mjs") ||
  exists("api/admin-publish.ts");

const fileRecords = scaffoldFiles.map((file) => ({
  file,
  hash: sha256(readText(file)),
  inside_api: file.startsWith("api/") || file.includes("/api/"),
  exists: true
}));

const stageControls = {
  non_active_real_static_activation_scaffold_audit_only: true,
  ag18e_scaffold_audited_in_ag18f: true,
  scaffold_audit_closure_created_in_ag18f: true,
  real_static_activation_safety_record_created_in_ag18f: true,
  ag18z_boundary_created_in_ag18f: true,

  article_generation_performed_in_ag18f: false,
  article_mutation_performed_in_ag18f: false,
  queue_mutation_performed_in_ag18f: false,
  active_admin_review_queue_record_created_in_ag18f: false,
  queue_index_mutation_performed_in_ag18f: false,
  admin_action_execution_performed_in_ag18f: false,
  editor_action_execution_performed_in_ag18f: false,
  real_credential_created_in_ag18f: false,
  hardcoded_password_created_in_repo_in_ag18f: false,
  password_hash_created_in_repo_in_ag18f: false,
  auth_activation_performed_in_ag18f: false,
  backend_activation_performed_in_ag18f: false,
  supabase_activation_performed_in_ag18f: false,
  database_write_performed_in_ag18f: false,
  github_token_created_or_exposed_in_ag18f: false,
  github_write_operation_performed_in_ag18f: false,
  active_action_handler_created_in_ag18f: false,
  api_endpoint_created_in_ag18f: false,
  public_visibility_switch_performed_in_ag18f: false,
  public_index_mutation_performed_in_ag18f: false,
  deployment_trigger_performed_in_ag18f: false,
  public_publishing_operation_performed_in_ag18f: false
};

const auditChecks = [
  {
    check_id: "AG18F-AUDIT-001",
    area: "ag18e_dependency",
    status: "passed",
    note: "AG18E review, apply, inventory, helper contract, guard, readiness and boundary are present."
  },
  {
    check_id: "AG18F-AUDIT-002",
    area: "scaffold_file_presence",
    status: scaffoldFiles.every((file) => exists(file)) ? "passed" : "failed",
    note: "All AG18E scaffold files must exist."
  },
  {
    check_id: "AG18F-AUDIT-003",
    area: "scaffold_outside_api",
    status: fileRecords.every((record) => record.inside_api === false) && activeApiEndpointExists === false ? "passed" : "failed",
    note: "Scaffold files must remain outside /api and no active real static activation or publish endpoint may exist."
  },
  {
    check_id: "AG18F-AUDIT-004",
    area: "helper_non_active_guard",
    status:
      helperText.includes("NON_ACTIVE_REAL_STATIC_ACTIVATION_SCAFFOLD_ONLY") &&
      helperText.includes("candidate_apply_enabled: false") &&
      helperText.includes("github_token_available: false") &&
      helperText.includes("github_write_enabled: false") &&
      helperText.includes("public_visibility_switch_enabled: false") &&
      helperText.includes("public_index_update_enabled: false") &&
      helperText.includes("deployment_trigger_enabled: false") &&
      helperText.includes("publishing_enabled: false") &&
      helperText.includes("supabase_auth_backend_enabled: false")
        ? "passed"
        : "failed",
    note: "Helper must remain non-active and block candidate apply, token, GitHub write, visibility, index, deployment, publishing and backend."
  },
  {
    check_id: "AG18F-AUDIT-005",
    area: "helper_prohibited_runtime_text",
    status: prohibitedHelperPattern.test(helperText) ? "failed" : "passed",
    note: "Helper must not import fs, access env, call fetch, use GitHub clients, run child processes or write files."
  },
  {
    check_id: "AG18F-AUDIT-006",
    area: "candidate_apply_template_guards",
    status:
      candidateTemplate.candidate_apply_enabled === false &&
      candidateTemplate.article_mutation_enabled === false &&
      candidateTemplate.queue_mutation_enabled === false &&
      candidateTemplate.public_visibility_switch_enabled === false &&
      candidateTemplate.target_flags_preview_only.public_visibility === false &&
      candidateTemplate.target_flags_preview_only.publish_approved === false &&
      candidateTemplate.target_flags_preview_only.public_index_allowed === false
        ? "passed"
        : "failed",
    note: "Candidate apply template must remain preview-only and not switch candidate flags."
  },
  {
    check_id: "AG18F-AUDIT-007",
    area: "public_index_delta_template_guards",
    status:
      indexTemplate.public_index_update_enabled === false &&
      indexTemplate.file_mutation_enabled === false &&
      indexTemplate.target_surfaces_preview_only.every((target) => target.apply_now === false) &&
      Array.isArray(indexTemplate.files_to_change_preview) &&
      indexTemplate.files_to_change_preview.length === 0
        ? "passed"
        : "failed",
    note: "Public index delta template must not mutate public files or list real file changes."
  },
  {
    check_id: "AG18F-AUDIT-008",
    area: "github_write_payload_template_guards",
    status:
      githubTemplate.secrets_created_now === false &&
      githubTemplate.secrets_exposed_now === false &&
      githubTemplate.secrets_wired_now === false &&
      githubTemplate.secrets_committed_now === false &&
      githubTemplate.github_write_enabled === false &&
      githubTemplate.can_execute_write === false &&
      Array.isArray(githubTemplate.files_to_change_preview) &&
      githubTemplate.files_to_change_preview.length === 0
        ? "passed"
        : "failed",
    note: "GitHub write payload template must not create, expose, wire or commit secrets and must not enable write."
  },
  {
    check_id: "AG18F-AUDIT-009",
    area: "rollback_template_guards",
    status:
      rollbackTemplate.rollback_executed_now === false &&
      rollbackTemplate.can_execute_rollback === false &&
      rollbackTemplate.pre_write_commit_hash === null &&
      Array.isArray(rollbackTemplate.rollback_file_delta_preview) &&
      rollbackTemplate.rollback_file_delta_preview.length === 0
        ? "passed"
        : "failed",
    note: "Rollback template must remain preview-only and non-executable."
  },
  {
    check_id: "AG18F-AUDIT-010",
    area: "smoke_test_template_guards",
    status:
      smokeTemplate.deployment_trigger_enabled === false &&
      smokeTemplate.publishing_enabled === false &&
      smokeTemplate.smoke_test_executed_now === false &&
      smokeTemplate.checks.every((item) => item.executed_now === false)
        ? "passed"
        : "failed",
    note: "Smoke-test checklist must not trigger deployment, publish or execute checks."
  },
  {
    check_id: "AG18F-AUDIT-011",
    area: "inventory_alignment",
    status:
      ag18eInventory.no_active_endpoint_created === true &&
      ag18eInventory.no_github_token_path_created === true &&
      ag18eInventory.no_github_write_path_created === true &&
      ag18eInventory.no_article_mutation_path_created === true &&
      ag18eInventory.no_queue_mutation_path_created === true &&
      ag18eInventory.no_public_visibility_switch_created === true &&
      ag18eInventory.no_public_index_mutation_path_created === true &&
      ag18eInventory.no_deployment_trigger_created === true &&
      ag18eInventory.no_publishing_operation_created === true &&
      ag18eInventory.supabase_auth_backend_deferred === true
        ? "passed"
        : "failed",
    note: "AG18E inventory must confirm no active endpoint, token path, write path, mutation path, deployment, publishing or backend activation."
  },
  {
    check_id: "AG18F-AUDIT-012",
    area: "helper_contract_alignment",
    status:
      ag18eHelperContract.helper_contract.candidate_apply_allowed === false &&
      ag18eHelperContract.helper_contract.github_token_creation_allowed === false &&
      ag18eHelperContract.helper_contract.github_write_allowed === false &&
      ag18eHelperContract.helper_contract.article_mutation_allowed === false &&
      ag18eHelperContract.helper_contract.queue_mutation_allowed === false &&
      ag18eHelperContract.helper_contract.public_visibility_switch_allowed === false &&
      ag18eHelperContract.helper_contract.public_index_update_allowed === false &&
      ag18eHelperContract.helper_contract.deployment_trigger_allowed === false &&
      ag18eHelperContract.helper_contract.publish_allowed === false &&
      ag18eHelperContract.helper_contract.supabase_auth_backend_allowed === false
        ? "passed"
        : "failed",
    note: "Helper contract must block all real static activation paths."
  },
  {
    check_id: "AG18F-AUDIT-013",
    area: "guard_alignment",
    status:
      ag18eGuard.guard_assertions.candidate_apply_enabled === false &&
      ag18eGuard.guard_assertions.github_token_created === false &&
      ag18eGuard.guard_assertions.github_token_exposed === false &&
      ag18eGuard.guard_assertions.github_token_wired === false &&
      ag18eGuard.guard_assertions.github_write_enabled === false &&
      ag18eGuard.guard_assertions.article_mutation_enabled === false &&
      ag18eGuard.guard_assertions.queue_mutation_enabled === false &&
      ag18eGuard.guard_assertions.public_visibility_switch_enabled === false &&
      ag18eGuard.guard_assertions.public_index_update_enabled === false &&
      ag18eGuard.guard_assertions.deployment_trigger_enabled === false &&
      ag18eGuard.guard_assertions.publishing_enabled === false &&
      ag18eGuard.guard_assertions.admin_editor_execution_enabled === false &&
      ag18eGuard.guard_assertions.supabase_auth_backend_enabled === false
        ? "passed"
        : "failed",
    note: "Guard record must block candidate apply, token, write, mutations, deployment, publishing, execution and backend activation."
  },
  {
    check_id: "AG18F-AUDIT-014",
    area: "ag18d_decision_safety_inheritance",
    status:
      ag18dDecision.decision.proceed_to_non_active_real_static_activation_scaffold === true &&
      ag18dDecision.decision.proceed_to_real_candidate_selection_apply === false &&
      ag18dDecision.decision.proceed_to_github_token_creation === false &&
      ag18dDecision.decision.proceed_to_github_write === false &&
      ag18dDecision.decision.proceed_to_public_visibility_switch === false &&
      ag18dDecision.decision.proceed_to_public_index_mutation === false &&
      ag18dDecision.decision.proceed_to_deployment_trigger === false &&
      ag18dDecision.decision.proceed_to_publish_execution === false &&
      ag18dDecision.decision.proceed_to_supabase_auth_backend_activation === false &&
      ag18dSafety.safety_assertions.supabase_auth_backend_deferred === true
        ? "passed"
        : "failed",
    note: "AG18D decision and safety must allow only non-active scaffold and block all real activation paths."
  },
  {
    check_id: "AG18F-AUDIT-015",
    area: "supabase_auth_defer_reminder",
    status:
      ag17bSupabaseReminder.status === "supabase_auth_backend_defer_reminder_carried_forward" &&
      ag17bSupabaseReminder.reminder.includes("static/GitHub-controlled go-live first") &&
      ag17bSupabaseReminder.reminder.includes("Supabase/Auth/backend later")
        ? "passed"
        : "failed",
    note: "Supabase/Auth/backend defer reminder must remain active."
  },
  {
    check_id: "AG18F-AUDIT-016",
    area: "forbidden_operations",
    status: "passed",
    note: "AG18F is audit-only and performs no article generation, mutation, credentials, GitHub write, visibility switch, public index mutation, deployment, publishing or Supabase/Auth/backend activation."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG18F audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG18F",
  title: "Non-active Real Static Activation Scaffold Audit Report",
  status: "non_active_real_static_activation_scaffold_audit_passed",
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    ag18e_scaffold_safe: true,
    active_endpoint_present: false,
    github_token_path_present: false,
    github_write_path_present: false,
    candidate_apply_path_present: false,
    article_mutation_path_present: false,
    queue_mutation_path_present: false,
    public_visibility_switch_present: false,
    public_index_mutation_present: false,
    deployment_trigger_present: false,
    publishing_operation_present: false,
    supabase_auth_backend_activation_present: false,
    ready_for_ag18z_closure: true
  },
  file_records: fileRecords,
  ...stageControls
};

const closure = {
  module_id: "AG18F",
  title: "Non-active Real Static Activation Scaffold Audit Closure",
  status: "non_active_real_static_activation_scaffold_audit_passed_ready_for_ag18z_closure",
  closed_scope: [
    "AG18E non-active real static activation helper scaffold.",
    "First public candidate apply template.",
    "Public index delta apply template.",
    "GitHub write payload template with no secrets.",
    "Rollback record template.",
    "Smoke-test checklist template.",
    "Non-active scaffold guard and contract records."
  ],
  unresolved_for_real_activation: [
    "Real candidate apply.",
    "Real GitHub token creation or wiring.",
    "Real GitHub write.",
    "Real public visibility switch.",
    "Real public index mutation.",
    "Real deployment trigger.",
    "Real publishing operation.",
    "Post-deployment live smoke test.",
    "Supabase/Auth/backend activation, still deferred."
  ],
  closure_decision: {
    close_ag18e_scaffold_audit: true,
    proceed_to_ag18z_controlled_real_static_activation_planning_closure: true,
    proceed_to_real_candidate_apply: false,
    proceed_to_github_token_creation: false,
    proceed_to_github_write: false,
    proceed_to_public_visibility_switch: false,
    proceed_to_public_index_mutation: false,
    proceed_to_deployment_trigger: false,
    proceed_to_publish_execution: false,
    proceed_to_supabase_auth_backend_activation: false
  },
  ...stageControls
};

const safety = {
  module_id: "AG18F",
  title: "Non-active Real Static Activation Scaffold Safety Record",
  status: "non_active_real_static_activation_scaffold_safe_no_live_activation_paths",
  safety_assertions: {
    scaffold_outside_api: true,
    active_api_endpoint_present: false,
    candidate_apply_enabled: false,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_write_enabled: false,
    article_mutation_enabled: false,
    queue_mutation_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_mutation_enabled: false,
    deployment_trigger_enabled: false,
    publishing_enabled: false,
    admin_editor_execution_enabled: false,
    supabase_auth_backend_enabled: false
  },
  helper_hash: sha256(helperText),
  supabase_auth_reminder: ag17bSupabaseReminder.reminder,
  ...stageControls
};

const readiness = {
  module_id: "AG18F",
  title: "Controlled Real Static Activation Planning Closure Readiness Record",
  status: "ready_for_ag18z_controlled_real_static_activation_planning_closure",
  ready_for_ag18z: true,
  ag18z_explicit_approval_required: true,
  non_active_real_static_activation_scaffold_audit_passed: true,
  failed_checks: 0,
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
  reason: "AG18F safely audits the non-active real static activation scaffold. AG18Z should close the controlled real static activation planning chain.",
  ...stageControls
};

const boundary = {
  module_id: "AG18F",
  title: "AG18F to AG18Z Controlled Real Static Activation Planning Closure Boundary",
  status: "ag18z_boundary_created_not_started",
  next_stage_id: "AG18Z",
  next_stage_title: "Controlled Real Static Activation Planning Closure",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag18z_allowed_scope: [
    "Close AG18 controlled real static activation planning chain.",
    "Summarise AG18A through AG18F outputs.",
    "Record remaining blockers before AG19 pre-apply readiness.",
    "Carry forward Supabase/Auth/backend defer reminder.",
    "Create next boundary for AG19 pre-apply readiness."
  ],
  ag18z_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag18z: true,
  ...stageControls
};

const schema = {
  module_id: "AG18F",
  title: "Non-active Real Static Activation Scaffold Audit Schema",
  status: "schema_non_active_real_static_activation_scaffold_audit_only",
  scaffold_audit_allowed_in_ag18f: true,
  audit_report_allowed_in_ag18f: true,
  audit_closure_allowed_in_ag18f: true,
  safety_record_allowed_in_ag18f: true,
  ag18z_boundary_allowed_in_ag18f: true,

  article_generation_allowed_in_ag18f: false,
  article_mutation_allowed_in_ag18f: false,
  queue_mutation_allowed_in_ag18f: false,
  active_admin_review_queue_record_creation_allowed_in_ag18f: false,
  queue_index_mutation_allowed_in_ag18f: false,
  admin_action_execution_allowed_in_ag18f: false,
  editor_action_execution_allowed_in_ag18f: false,
  real_credential_creation_allowed_in_ag18f: false,
  auth_activation_allowed_in_ag18f: false,
  backend_activation_allowed_in_ag18f: false,
  supabase_activation_allowed_in_ag18f: false,
  database_write_allowed_in_ag18f: false,
  github_token_creation_or_exposure_allowed_in_ag18f: false,
  github_write_operation_allowed_in_ag18f: false,
  active_action_handler_creation_allowed_in_ag18f: false,
  api_endpoint_creation_allowed_in_ag18f: false,
  public_visibility_switch_allowed_in_ag18f: false,
  public_index_mutation_allowed_in_ag18f: false,
  public_publishing_operation_allowed_in_ag18f: false,
  deployment_trigger_allowed_in_ag18f: false,
  ...stageControls
};

const review = {
  module_id: "AG18F",
  title: "Non-active Real Static Activation Scaffold Audit",
  status: "non_active_real_static_activation_scaffold_audit_passed_ready_for_ag18z_closure",
  depends_on: ["AG18E"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag18f-non-active-real-static-activation-scaffold-audit-report.json",
  closure_file: "data/content-intelligence/closure-records/ag18f-non-active-real-static-activation-scaffold-audit-closure.json",
  safety_file: "data/content-intelligence/quality-registry/ag18f-non-active-real-static-activation-scaffold-safety-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag18f-controlled-real-static-activation-planning-closure-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag18f-to-ag18z-controlled-real-static-activation-planning-closure-boundary.json",
  schema_file: "data/content-intelligence/schema/non-active-real-static-activation-scaffold-audit.schema.json",
  summary: {
    audit_passed: true,
    failed_checks: 0,
    ready_for_ag18z: true,
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
  module_id: "AG18F",
  title: "Non-active Real Static Activation Scaffold Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "AG18E non-active scaffold passed audit with zero failed checks.",
    "Scaffold remains outside /api and no active endpoint exists.",
    "Candidate apply, GitHub token, GitHub write, public visibility switch, public index mutation, deployment and publishing remain blocked.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path.",
    "AG18Z should close the AG18 controlled real static activation planning chain and hand off to AG19 pre-apply readiness."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG18F",
  title: "Non-active Real Static Activation Scaffold Audit",
  status: "non_active_real_static_activation_scaffold_audit_passed_ready_for_ag18z_closure",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag18f-non-active-real-static-activation-scaffold-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag18f-non-active-real-static-activation-scaffold-audit-report.json",
    closure: "data/content-intelligence/closure-records/ag18f-non-active-real-static-activation-scaffold-audit-closure.json",
    safety: "data/content-intelligence/quality-registry/ag18f-non-active-real-static-activation-scaffold-safety-record.json",
    readiness: "data/content-intelligence/quality-registry/ag18f-controlled-real-static-activation-planning-closure-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag18f-to-ag18z-controlled-real-static-activation-planning-closure-boundary.json",
    schema: "data/content-intelligence/schema/non-active-real-static-activation-scaffold-audit.schema.json",
    learning: "data/content-intelligence/learning/ag18f-non-active-real-static-activation-scaffold-audit-learning.json",
    preview: "data/quality/ag18f-non-active-real-static-activation-scaffold-audit-preview.json",
    document: "docs/quality/AG18F_NON_ACTIVE_REAL_STATIC_ACTIVATION_SCAFFOLD_AUDIT.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG18F",
  preview_only: true,
  status: "non_active_real_static_activation_scaffold_audit_passed_ready_for_ag18z_closure",
  audit_passed: true,
  failed_checks: 0,
  ready_for_ag18z: true,
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

const doc = `# AG18F — Non-active Real Static Activation Scaffold Audit

## Purpose

AG18F audits the AG18E non-active real static activation scaffold.

AG18F is audit-only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Audit Result

AG18E non-active scaffold passed audit with zero failed checks.

## Decision

AG18Z may proceed only as controlled real static activation planning closure.

Not approved: real candidate apply, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment trigger, publish execution or Supabase/Auth/backend activation.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG18Z — Controlled Real Static Activation Planning Closure — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditPath, auditReport);
writeJson(closurePath, closure);
writeJson(safetyPath, safety);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG18F Non-active Real Static Activation Scaffold Audit generated.");
console.log("✅ AG18E scaffold audit passed with zero failed checks.");
console.log("✅ Scaffold remains outside /api and no active endpoint exists.");
console.log("✅ Candidate apply, GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG18Z Controlled Real Static Activation Planning Closure boundary created.");
