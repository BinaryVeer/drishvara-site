import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag17dReview: "data/content-intelligence/quality-reviews/ag17d-non-active-static-go-live-implementation-scaffold.json",
  ag17dApply: "data/content-intelligence/apply-records/ag17d-non-active-static-go-live-implementation-scaffold-apply.json",
  ag17dInventory: "data/content-intelligence/go-live/ag17d-non-active-static-go-live-scaffold-inventory.json",
  ag17dHelperContract: "data/content-intelligence/go-live/ag17d-static-go-live-helper-contract-record.json",
  ag17dGuard: "data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-guard-record.json",
  ag17dReadiness: "data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-scaffold-audit-readiness-record.json",
  ag17dBoundary: "data/content-intelligence/mutation-plans/ag17d-to-ag17e-non-active-static-go-live-scaffold-audit-boundary.json",
  ag17cSafety: "data/content-intelligence/quality-registry/ag17c-static-go-live-safety-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const scaffoldFiles = [
  "internal-scaffolds/ag17d-non-active-static-go-live/static-go-live-helper.non-active.mjs",
  "internal-scaffolds/ag17d-non-active-static-go-live/public-exposure-delta.template.json",
  "internal-scaffolds/ag17d-non-active-static-go-live/github-commit-payload.template.json",
  "internal-scaffolds/ag17d-non-active-static-go-live/deployment-checklist.template.json",
  "internal-scaffolds/ag17d-non-active-static-go-live/publication-state-fixture.approved-and-blocked.json",
  "internal-scaffolds/ag17d-non-active-static-go-live/README.md"
];

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag17e-non-active-static-go-live-scaffold-audit.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag17e-non-active-static-go-live-scaffold-audit-report.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag17e-non-active-static-go-live-scaffold-closure.json");
const safetyPath = path.join(root, "data/content-intelligence/quality-registry/ag17e-non-active-static-go-live-scaffold-safety-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag17e-static-go-live-chain-closure-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag17e-to-ag17z-static-go-live-chain-closure-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/non-active-static-go-live-scaffold-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag17e-non-active-static-go-live-scaffold-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag17e-non-active-static-go-live-scaffold-audit.json");
const previewPath = path.join(root, "data/quality/ag17e-non-active-static-go-live-scaffold-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG17E_NON_ACTIVE_STATIC_GO_LIVE_SCAFFOLD_AUDIT.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG17E input ${name}: ${relativePath}`);
}
for (const file of scaffoldFiles) {
  if (!exists(file)) throw new Error(`Missing AG17D scaffold file: ${file}`);
}

const ag17dReview = readJson(inputs.ag17dReview);
const ag17dApply = readJson(inputs.ag17dApply);
const ag17dInventory = readJson(inputs.ag17dInventory);
const ag17dHelperContract = readJson(inputs.ag17dHelperContract);
const ag17dGuard = readJson(inputs.ag17dGuard);
const ag17dReadiness = readJson(inputs.ag17dReadiness);
const ag17dBoundary = readJson(inputs.ag17dBoundary);
const ag17cSafety = readJson(inputs.ag17cSafety);
const ag17bSupabaseReminder = readJson(inputs.ag17bSupabaseReminder);

if (ag17dReview.status !== "non_active_static_go_live_scaffold_created_pending_audit") {
  throw new Error("AG17E requires AG17D review.");
}
if (ag17dApply.status !== "non_active_static_go_live_scaffold_created_pending_audit") {
  throw new Error("AG17E requires AG17D apply record.");
}
if (ag17dReadiness.ready_for_ag17e !== true) {
  throw new Error("AG17E requires AG17D readiness.");
}
if (ag17dBoundary.next_stage_id !== "AG17E" || ag17dBoundary.explicit_approval_required !== true) {
  throw new Error("AG17E requires AG17D to AG17E explicit boundary.");
}

const helperPath = "internal-scaffolds/ag17d-non-active-static-go-live/static-go-live-helper.non-active.mjs";
const exposureTemplatePath = "internal-scaffolds/ag17d-non-active-static-go-live/public-exposure-delta.template.json";
const githubTemplatePath = "internal-scaffolds/ag17d-non-active-static-go-live/github-commit-payload.template.json";
const deploymentTemplatePath = "internal-scaffolds/ag17d-non-active-static-go-live/deployment-checklist.template.json";
const fixturePath = "internal-scaffolds/ag17d-non-active-static-go-live/publication-state-fixture.approved-and-blocked.json";

const helperText = readText(helperPath);
const exposureTemplate = readJson(exposureTemplatePath);
const githubTemplate = readJson(githubTemplatePath);
const deploymentTemplate = readJson(deploymentTemplatePath);
const fixture = readJson(fixturePath);

const prohibitedHelperPattern = /from\s+["']node:fs["']|from\s+["']fs["']|writeFile|appendFile|fetch\(|Octokit|process\.env|child_process|createWriteStream|rmSync|unlinkSync/i;

const activeApiEndpointExists =
  exists("api/static-go-live.js") ||
  exists("api/static-go-live.mjs") ||
  exists("api/static-go-live.ts") ||
  exists("api/public-exposure.js") ||
  exists("api/public-exposure.mjs") ||
  exists("api/public-exposure.ts") ||
  exists("api/github-content-write.js") ||
  exists("api/github-content-write.mjs") ||
  exists("api/github-content-write.ts");

const fileRecords = scaffoldFiles.map((file) => ({
  file,
  hash: sha256(readText(file)),
  inside_api: file.startsWith("api/") || file.includes("/api/"),
  exists: true
}));

const stageControls = {
  non_active_static_go_live_scaffold_audit_only: true,
  non_active_static_go_live_scaffold_audited_in_ag17e: true,
  non_active_static_go_live_scaffold_closure_created_in_ag17e: true,
  static_go_live_scaffold_safety_record_created_in_ag17e: true,
  ag17z_boundary_created_in_ag17e: true,

  scaffold_file_mutation_performed_in_ag17e: false,
  article_generation_performed_in_ag17e: false,
  article_mutation_performed_in_ag17e: false,
  queue_mutation_performed_in_ag17e: false,
  active_admin_review_queue_record_created_in_ag17e: false,
  queue_index_mutation_performed_in_ag17e: false,
  admin_action_execution_performed_in_ag17e: false,
  editor_action_execution_performed_in_ag17e: false,
  real_credential_created_in_ag17e: false,
  hardcoded_password_created_in_repo_in_ag17e: false,
  password_hash_created_in_repo_in_ag17e: false,
  auth_activation_performed_in_ag17e: false,
  backend_activation_performed_in_ag17e: false,
  supabase_activation_performed_in_ag17e: false,
  database_write_performed_in_ag17e: false,
  github_token_created_or_exposed_in_ag17e: false,
  github_write_operation_performed_in_ag17e: false,
  active_action_handler_created_in_ag17e: false,
  api_endpoint_created_in_ag17e: false,
  public_visibility_switch_performed_in_ag17e: false,
  public_index_mutation_performed_in_ag17e: false,
  deployment_trigger_performed_in_ag17e: false,
  public_publishing_operation_performed_in_ag17e: false
};

const auditChecks = [
  {
    check_id: "AG17E-AUDIT-001",
    area: "ag17d_dependency",
    status: "passed",
    note: "AG17D review, apply, inventory, helper contract, guard, readiness and boundary are present."
  },
  {
    check_id: "AG17E-AUDIT-002",
    area: "scaffold_file_presence",
    status: scaffoldFiles.every((file) => exists(file)) ? "passed" : "failed",
    note: "All AG17D scaffold files must exist."
  },
  {
    check_id: "AG17E-AUDIT-003",
    area: "scaffold_outside_api",
    status: fileRecords.every((record) => record.inside_api === false) && activeApiEndpointExists === false ? "passed" : "failed",
    note: "Scaffold files must remain outside /api and no active static go-live endpoint may exist."
  },
  {
    check_id: "AG17E-AUDIT-004",
    area: "helper_non_active_guard",
    status:
      helperText.includes("NON_ACTIVE_STATIC_GO_LIVE_SCAFFOLD_ONLY") &&
      helperText.includes("github_write_enabled: false") &&
      helperText.includes("public_visibility_switch_enabled: false") &&
      helperText.includes("public_index_update_enabled: false") &&
      helperText.includes("deployment_trigger_enabled: false") &&
      helperText.includes("publishing_enabled: false") &&
      helperText.includes("supabase_auth_backend_enabled: false")
        ? "passed"
        : "failed",
    note: "Helper must remain non-active and block GitHub write, visibility switch, public index update, deployment, publishing and Supabase/Auth/backend."
  },
  {
    check_id: "AG17E-AUDIT-005",
    area: "helper_prohibited_runtime_text",
    status: prohibitedHelperPattern.test(helperText) ? "failed" : "passed",
    note: "Helper must not import fs, access env, call fetch, use GitHub clients, run child processes or write files."
  },
  {
    check_id: "AG17E-AUDIT-006",
    area: "public_exposure_delta_template_guards",
    status:
      exposureTemplate.public_visibility_switch_enabled === false &&
      exposureTemplate.public_index_update_enabled === false &&
      exposureTemplate.github_write_enabled === false &&
      exposureTemplate.deployment_trigger_enabled === false &&
      exposureTemplate.publishing_enabled === false
        ? "passed"
        : "failed",
    note: "Public exposure delta template must be no-write and no-public-mutation."
  },
  {
    check_id: "AG17E-AUDIT-007",
    area: "github_commit_payload_template_guards",
    status:
      githubTemplate.secrets_created_now === false &&
      githubTemplate.secrets_exposed_now === false &&
      githubTemplate.secrets_wired_now === false &&
      githubTemplate.github_write_enabled === false &&
      githubTemplate.can_execute_commit === false
        ? "passed"
        : "failed",
    note: "GitHub commit payload template must not create/expose/wire secrets or execute commits."
  },
  {
    check_id: "AG17E-AUDIT-008",
    area: "deployment_checklist_template_guards",
    status:
      deploymentTemplate.deployment_trigger_enabled === false &&
      deploymentTemplate.can_trigger_deployment === false &&
      deploymentTemplate.publishing_enabled === false &&
      deploymentTemplate.checklist.every((item) => item.executed_now === false)
        ? "passed"
        : "failed",
    note: "Deployment checklist template must not trigger deployment or publishing."
  },
  {
    check_id: "AG17E-AUDIT-009",
    area: "publication_fixture_guards",
    status:
      fixture.seed_candidate.expected_public_exposure_now === false &&
      fixture.blocked_case.expected_public_exposure === false &&
      fixture.approved_but_not_exposed_case.expected_public_exposure === false &&
      fixture.hypothetical_public_case.expected_public_exposure === true &&
      fixture.github_write_enabled === false &&
      fixture.public_visibility_switch_enabled === false &&
      fixture.public_index_update_enabled === false &&
      fixture.deployment_trigger_enabled === false &&
      fixture.publishing_enabled === false
        ? "passed"
        : "failed",
    note: "Publication fixture must keep real states non-public and mark public case as hypothetical only."
  },
  {
    check_id: "AG17E-AUDIT-010",
    area: "inventory_alignment",
    status:
      ag17dInventory.helper_file_intentionally_outside_api === true &&
      ag17dInventory.no_active_endpoint_created === true &&
      ag17dInventory.no_github_write_path_created === true &&
      ag17dInventory.no_public_index_mutation_path_created === true &&
      ag17dInventory.no_visibility_switch_created === true &&
      ag17dInventory.no_deployment_trigger_created === true &&
      ag17dInventory.no_publishing_operation_created === true &&
      ag17dInventory.supabase_auth_backend_deferred === true
        ? "passed"
        : "failed",
    note: "AG17D inventory must confirm no active endpoint, GitHub write path, visibility switch, public index mutation, deployment, publishing or backend activation."
  },
  {
    check_id: "AG17E-AUDIT-011",
    area: "helper_contract_alignment",
    status:
      ag17dHelperContract.helper_contract.github_write_allowed === false &&
      ag17dHelperContract.helper_contract.public_visibility_switch_allowed === false &&
      ag17dHelperContract.helper_contract.public_index_update_allowed === false &&
      ag17dHelperContract.helper_contract.deployment_trigger_allowed === false &&
      ag17dHelperContract.helper_contract.publish_allowed === false &&
      ag17dHelperContract.helper_contract.supabase_auth_backend_allowed === false
        ? "passed"
        : "failed",
    note: "Helper contract must block all live execution paths."
  },
  {
    check_id: "AG17E-AUDIT-012",
    area: "guard_alignment",
    status:
      ag17dGuard.guard_assertions.github_write_enabled === false &&
      ag17dGuard.guard_assertions.github_token_created === false &&
      ag17dGuard.guard_assertions.github_token_exposed === false &&
      ag17dGuard.guard_assertions.github_token_wired === false &&
      ag17dGuard.guard_assertions.public_visibility_switch_enabled === false &&
      ag17dGuard.guard_assertions.public_index_update_enabled === false &&
      ag17dGuard.guard_assertions.deployment_trigger_enabled === false &&
      ag17dGuard.guard_assertions.publishing_enabled === false &&
      ag17dGuard.guard_assertions.supabase_auth_backend_enabled === false
        ? "passed"
        : "failed",
    note: "AG17D guard must block GitHub token, GitHub write, visibility, index, deployment, publishing and backend activation."
  },
  {
    check_id: "AG17E-AUDIT-013",
    area: "ag17c_safety_inheritance",
    status:
      ag17cSafety.safety_assertions.static_github_path_first === true &&
      ag17cSafety.safety_assertions.supabase_auth_backend_deferred === true &&
      ag17cSafety.safety_assertions.secrets_created === false &&
      ag17cSafety.safety_assertions.github_write_enabled === false &&
      ag17cSafety.safety_assertions.public_visibility_switch_enabled === false &&
      ag17cSafety.safety_assertions.public_index_mutation_enabled === false &&
      ag17cSafety.safety_assertions.deployment_trigger_enabled === false &&
      ag17cSafety.safety_assertions.publishing_enabled === false
        ? "passed"
        : "failed",
    note: "AG17C safety controls must remain inherited."
  },
  {
    check_id: "AG17E-AUDIT-014",
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
    check_id: "AG17E-AUDIT-015",
    area: "forbidden_operations",
    status: "passed",
    note: "AG17E is audit-only and does not mutate scaffold files, create credentials, write to GitHub, switch visibility, mutate public indexes, trigger deployment or publish."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG17E audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG17E",
  title: "Non-active Static Go-live Scaffold Audit Report",
  status: "non_active_static_go_live_scaffold_audit_passed",
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    non_active_static_go_live_scaffold_safe: true,
    active_static_go_live_endpoint_present: false,
    github_write_path_present: false,
    public_visibility_switch_present: false,
    public_index_mutation_present: false,
    deployment_trigger_present: false,
    publishing_operation_present: false,
    supabase_auth_backend_activation_present: false,
    ready_for_ag17z_closure: true
  },
  file_records: fileRecords,
  ...stageControls
};

const closure = {
  module_id: "AG17E",
  title: "Non-active Static Go-live Scaffold Closure",
  status: "non_active_static_go_live_scaffold_audit_passed_ready_for_ag17z_closure",
  closed_scope: [
    "AG17D non-active static go-live helper scaffold.",
    "No-write public exposure delta template.",
    "No-write GitHub commit payload template.",
    "No-execution deployment checklist template.",
    "Approved/blocked publication state fixture.",
    "Supabase/Auth/backend defer reminder preservation."
  ],
  unresolved_for_real_static_go_live: [
    "Real GitHub write token wiring.",
    "Real Admin/Editor action execution.",
    "Real public visibility switch.",
    "Real public index mutation.",
    "Real deployment trigger.",
    "Real publish execution.",
    "Post-deployment smoke test.",
    "Supabase/Auth/backend activation, still deferred."
  ],
  closure_decision: {
    close_ag17d_scaffold: true,
    proceed_to_ag17z_static_go_live_chain_closure: true,
    proceed_to_real_github_write: false,
    proceed_to_public_visibility_switch: false,
    proceed_to_public_index_mutation: false,
    proceed_to_deployment_trigger: false,
    proceed_to_publish_execution: false,
    proceed_to_supabase_auth_backend_activation: false
  },
  ...stageControls
};

const safety = {
  module_id: "AG17E",
  title: "Non-active Static Go-live Scaffold Safety Record",
  status: "non_active_static_go_live_scaffold_safe_no_live_activation_paths",
  safety_assertions: {
    scaffold_outside_api: true,
    active_api_endpoint_present: false,
    github_write_enabled: false,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    public_visibility_switch_enabled: false,
    public_index_update_enabled: false,
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
  module_id: "AG17E",
  title: "Static Go-live Chain Closure Readiness Record",
  status: "ready_for_ag17z_static_go_live_chain_closure",
  ready_for_ag17z: true,
  ag17z_explicit_approval_required: true,
  non_active_static_go_live_scaffold_audit_passed: true,
  failed_checks: 0,
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
  reason: "AG17E safely audits the non-active static go-live scaffold. AG17Z should close the AG17 static-first go-live preparation chain.",
  ...stageControls
};

const boundary = {
  module_id: "AG17E",
  title: "AG17E to AG17Z Static Go-live Chain Closure Boundary",
  status: "ag17z_boundary_created_not_started",
  next_stage_id: "AG17Z",
  next_stage_title: "Static Go-live Preparation Chain Closure",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag17z_allowed_scope: [
    "Close AG17 static-first go-live preparation chain.",
    "Summarise AG17A through AG17E outputs.",
    "Record remaining blockers for real static go-live activation.",
    "Carry forward Supabase/Auth/backend defer reminder.",
    "Create next boundary for controlled real static activation planning."
  ],
  ag17z_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag17z: true,
  ...stageControls
};

const schema = {
  module_id: "AG17E",
  title: "Non-active Static Go-live Scaffold Audit Schema",
  status: "schema_non_active_static_go_live_scaffold_audit_only",
  scaffold_audit_allowed_in_ag17e: true,
  closure_record_allowed_in_ag17e: true,
  safety_record_allowed_in_ag17e: true,
  ag17z_boundary_allowed_in_ag17e: true,

  scaffold_file_mutation_allowed_in_ag17e: false,
  article_generation_allowed_in_ag17e: false,
  article_mutation_allowed_in_ag17e: false,
  queue_mutation_allowed_in_ag17e: false,
  active_admin_review_queue_record_creation_allowed_in_ag17e: false,
  queue_index_mutation_allowed_in_ag17e: false,
  admin_action_execution_allowed_in_ag17e: false,
  editor_action_execution_allowed_in_ag17e: false,
  real_credential_creation_allowed_in_ag17e: false,
  hardcoded_password_allowed_in_ag17e: false,
  password_hash_commit_allowed_in_ag17e: false,
  auth_activation_allowed_in_ag17e: false,
  backend_activation_allowed_in_ag17e: false,
  supabase_activation_allowed_in_ag17e: false,
  database_write_allowed_in_ag17e: false,
  github_token_creation_or_exposure_allowed_in_ag17e: false,
  github_write_operation_allowed_in_ag17e: false,
  active_action_handler_creation_allowed_in_ag17e: false,
  api_endpoint_creation_allowed_in_ag17e: false,
  public_visibility_switch_allowed_in_ag17e: false,
  public_index_mutation_allowed_in_ag17e: false,
  public_publishing_operation_allowed_in_ag17e: false,
  deployment_trigger_allowed_in_ag17e: false,
  ...stageControls
};

const review = {
  module_id: "AG17E",
  title: "Non-active Static Go-live Implementation Scaffold Audit",
  status: "non_active_static_go_live_scaffold_audit_passed_ready_for_ag17z_closure",
  depends_on: ["AG17D"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag17e-non-active-static-go-live-scaffold-audit-report.json",
  closure_file: "data/content-intelligence/closure-records/ag17e-non-active-static-go-live-scaffold-closure.json",
  safety_file: "data/content-intelligence/quality-registry/ag17e-non-active-static-go-live-scaffold-safety-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag17e-static-go-live-chain-closure-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag17e-to-ag17z-static-go-live-chain-closure-boundary.json",
  schema_file: "data/content-intelligence/schema/non-active-static-go-live-scaffold-audit.schema.json",
  summary: {
    audit_passed: true,
    failed_checks: 0,
    ready_for_ag17z: true,
    static_github_controlled_first: true,
    supabase_auth_deferred: true,
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
  module_id: "AG17E",
  title: "Non-active Static Go-live Scaffold Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "The AG17D static go-live scaffold is safe as non-active preview logic.",
    "No GitHub write, visibility switch, public index mutation, deployment or publish path exists.",
    "Supabase/Auth/backend remains deferred and reminder must carry into AG17Z.",
    "AG17Z can close the static-first go-live preparation chain.",
    "Real static activation must still be separately planned and approved."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG17E",
  title: "Non-active Static Go-live Implementation Scaffold Audit",
  status: "non_active_static_go_live_scaffold_audit_passed_ready_for_ag17z_closure",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag17e-non-active-static-go-live-scaffold-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag17e-non-active-static-go-live-scaffold-audit-report.json",
    closure: "data/content-intelligence/closure-records/ag17e-non-active-static-go-live-scaffold-closure.json",
    safety: "data/content-intelligence/quality-registry/ag17e-non-active-static-go-live-scaffold-safety-record.json",
    readiness: "data/content-intelligence/quality-registry/ag17e-static-go-live-chain-closure-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag17e-to-ag17z-static-go-live-chain-closure-boundary.json",
    schema: "data/content-intelligence/schema/non-active-static-go-live-scaffold-audit.schema.json",
    learning: "data/content-intelligence/learning/ag17e-non-active-static-go-live-scaffold-audit-learning.json",
    preview: "data/quality/ag17e-non-active-static-go-live-scaffold-audit-preview.json",
    document: "docs/quality/AG17E_NON_ACTIVE_STATIC_GO_LIVE_SCAFFOLD_AUDIT.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG17E",
  preview_only: true,
  status: "non_active_static_go_live_scaffold_audit_passed_ready_for_ag17z_closure",
  audit_passed: true,
  failed_checks: 0,
  ready_for_ag17z: true,
  static_github_controlled_first: true,
  supabase_auth_deferred: true,
  github_write_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG17E — Non-active Static Go-live Implementation Scaffold Audit

## Purpose

AG17E audits the AG17D non-active static go-live implementation scaffold.

AG17E is audit-only. It does not mutate scaffold files, generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Audit Result

The AG17D non-active static go-live scaffold passed audit with zero failed checks.

## Closure Decision

AG17D non-active static go-live scaffold is safe and ready for AG17Z closure.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG17Z — Static Go-live Preparation Chain Closure — only with explicit approval.
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

console.log("✅ AG17E non-active static go-live scaffold audit generated.");
console.log("✅ Scaffold audit passed with zero failed checks.");
console.log("✅ Scaffold remains outside /api and no active static go-live endpoint exists.");
console.log("✅ GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG17Z static go-live chain closure boundary created.");
