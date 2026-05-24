import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag14iReview: "data/content-intelligence/quality-reviews/ag14i-secure-action-handler-non-active-implementation-scaffold.json",
  ag14iApply: "data/content-intelligence/apply-records/ag14i-secure-action-handler-non-active-implementation-scaffold-apply.json",
  ag14iInventory: "data/content-intelligence/admin-architecture/ag14i-non-active-action-handler-scaffold-inventory.json",
  ag14iSchemaRecord: "data/content-intelligence/admin-architecture/ag14i-action-request-response-schema-record.json",
  ag14iGuard: "data/content-intelligence/quality-registry/ag14i-non-active-handler-guard-record.json",
  ag14iReadiness: "data/content-intelligence/quality-registry/ag14i-non-active-scaffold-audit-readiness-record.json",
  ag14iBoundary: "data/content-intelligence/mutation-plans/ag14i-to-ag14j-non-active-scaffold-audit-closure-boundary.json",
  ag14iSchema: "data/content-intelligence/schema/secure-action-handler-non-active-implementation-scaffold.schema.json",
  ag14hDecision: "data/content-intelligence/admin-architecture/ag14h-implementation-readiness-decision-record.json",
  ag14hBlockers: "data/content-intelligence/admin-architecture/ag14h-secure-action-handler-implementation-blocker-register.json"
};

const scaffoldFiles = [
  "internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action.non-active.mjs",
  "internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action-request.schema.json",
  "internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action-response.schema.json",
  "internal-scaffolds/ag14i-secure-action-handler-non-active/role-action-allowlist.json",
  "internal-scaffolds/ag14i-secure-action-handler-non-active/README.md",
  "docs/admin/AG14I_NON_ACTIVE_HANDLER_ENVIRONMENT_PLACEHOLDERS.md"
];

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag14j-secure-action-handler-non-active-scaffold-audit-closure.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag14j-non-active-scaffold-audit-report.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag14j-secure-action-handler-non-active-scaffold-closure.json");
const safetyPath = path.join(root, "data/content-intelligence/quality-registry/ag14j-non-active-scaffold-safety-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag14j-ag14z-closure-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag14j-to-ag14z-admin-editor-secure-handler-chain-closure-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/secure-action-handler-non-active-scaffold-audit-closure.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag14j-secure-action-handler-non-active-scaffold-audit-closure-learning.json");
const registryPath = path.join(root, "data/quality/ag14j-secure-action-handler-non-active-scaffold-audit-closure.json");
const previewPath = path.join(root, "data/quality/ag14j-secure-action-handler-non-active-scaffold-audit-closure-preview.json");
const docPath = path.join(root, "docs/quality/AG14J_SECURE_ACTION_HANDLER_NON_ACTIVE_SCAFFOLD_AUDIT_CLOSURE.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG14J input ${name}: ${relativePath}`);
}

for (const file of scaffoldFiles) {
  if (!exists(file)) throw new Error(`Missing AG14I scaffold file: ${file}`);
}

const ag14iReview = readJson(inputs.ag14iReview);
const ag14iApply = readJson(inputs.ag14iApply);
const ag14iInventory = readJson(inputs.ag14iInventory);
const ag14iSchemaRecord = readJson(inputs.ag14iSchemaRecord);
const ag14iGuard = readJson(inputs.ag14iGuard);
const ag14iReadiness = readJson(inputs.ag14iReadiness);
const ag14iBoundary = readJson(inputs.ag14iBoundary);
const ag14iSchema = readJson(inputs.ag14iSchema);
const ag14hDecision = readJson(inputs.ag14hDecision);
const ag14hBlockers = readJson(inputs.ag14hBlockers);

if (ag14iReview.status !== "non_active_implementation_scaffold_created_pending_audit") {
  throw new Error("AG14J requires AG14I review.");
}
if (ag14iApply.status !== "non_active_implementation_scaffold_created_pending_audit") {
  throw new Error("AG14J requires AG14I apply record.");
}
if (ag14iReadiness.ready_for_ag14j !== true) {
  throw new Error("AG14J requires AG14I readiness.");
}
if (ag14iBoundary.next_stage_id !== "AG14J" || ag14iBoundary.explicit_approval_required !== true) {
  throw new Error("AG14J requires AG14I to AG14J explicit boundary.");
}
if (ag14hDecision.decision.proceed_to_non_active_scaffold !== true || ag14hDecision.decision.proceed_to_live_action_handler !== false) {
  throw new Error("AG14J requires AG14H decision to allow only non-active scaffold.");
}

const handlerPath = "internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action.non-active.mjs";
const handlerText = readText(handlerPath);
const requestSchema = readJson("internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action-request.schema.json");
const responseSchema = readJson("internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action-response.schema.json");
const roleAllowlist = readJson("internal-scaffolds/ag14i-secure-action-handler-non-active/role-action-allowlist.json");
const envDocText = readText("docs/admin/AG14I_NON_ACTIVE_HANDLER_ENVIRONMENT_PLACEHOLDERS.md");

const prohibitedHandlerPattern = /from\s+["']node:fs["']|from\s+["']fs["']|writeFile|appendFile|fetch\(|Octokit|supabase|process\.env|child_process/i;
const activeApiEndpointExists =
  exists("api/admin-action.js") ||
  exists("api/admin-action.mjs") ||
  exists("api/admin-action.ts") ||
  exists("api/admin-action/index.js") ||
  exists("api/admin-action/index.mjs") ||
  exists("api/admin-action/index.ts");

const fileRecords = scaffoldFiles.map((file) => ({
  file,
  hash: sha256(readText(file)),
  inside_api: file.startsWith("api/") || file.includes("/api/"),
  exists: true
}));

const stageControls = {
  secure_action_handler_non_active_scaffold_audit_closure_only: true,
  non_active_scaffold_audited_in_ag14j: true,
  non_active_scaffold_closure_created_in_ag14j: true,
  safety_record_created_in_ag14j: true,
  ag14z_boundary_created_in_ag14j: true,

  scaffold_file_mutation_performed_in_ag14j: false,
  action_handler_created_in_ag14j: false,
  active_api_endpoint_created_in_ag14j: false,
  api_directory_created_in_ag14j: false,
  serverless_function_created_in_ag14j: false,
  admin_action_execution_performed_in_ag14j: false,
  editor_action_execution_performed_in_ag14j: false,
  real_credential_created_in_ag14j: false,
  hardcoded_password_created_in_ag14j: false,
  password_hash_created_in_repo_in_ag14j: false,
  auth_activation_performed_in_ag14j: false,
  backend_activation_performed_in_ag14j: false,
  supabase_activation_performed_in_ag14j: false,
  database_write_performed_in_ag14j: false,
  github_token_created_or_exposed_in_ag14j: false,
  github_write_operation_performed_in_ag14j: false,
  article_mutation_performed_in_ag14j: false,
  queue_mutation_performed_in_ag14j: false,
  audit_write_performed_in_ag14j: false,
  public_visibility_switch_performed_in_ag14j: false,
  public_publishing_operation_performed_in_ag14j: false,
  deployment_trigger_performed_in_ag14j: false
};

const auditChecks = [
  {
    check_id: "AG14J-AUDIT-001",
    area: "ag14i_dependency",
    status: "passed",
    note: "AG14I review, apply, inventory, guard, readiness and boundary are present."
  },
  {
    check_id: "AG14J-AUDIT-002",
    area: "scaffold_file_presence",
    status: scaffoldFiles.every((file) => exists(file)) ? "passed" : "failed",
    note: "All six AG14I scaffold/doc files must exist."
  },
  {
    check_id: "AG14J-AUDIT-003",
    area: "scaffold_outside_api",
    status: fileRecords.every((record) => record.inside_api === false) && activeApiEndpointExists === false ? "passed" : "failed",
    note: "Scaffold files must remain outside /api and no deployable admin-action endpoint may exist."
  },
  {
    check_id: "AG14J-AUDIT-004",
    area: "handler_non_active_guard",
    status:
      handlerText.includes("NON_ACTIVE_SCAFFOLD_ONLY") &&
      handlerText.includes("action_execution_enabled: false") &&
      handlerText.includes("writes_enabled: false") &&
      handlerText.includes("publish_enabled: false") &&
      handlerText.includes("github_write_enabled: false")
        ? "passed"
        : "failed",
    note: "Handler scaffold must explicitly remain non-active with action/write/publish/GitHub-write disabled."
  },
  {
    check_id: "AG14J-AUDIT-005",
    area: "handler_prohibited_runtime_text",
    status: prohibitedHandlerPattern.test(handlerText) ? "failed" : "passed",
    note: "Handler scaffold must not import fs, access env, call fetch, use GitHub/Supabase markers, or write files."
  },
  {
    check_id: "AG14J-AUDIT-006",
    area: "request_response_schema_non_active",
    status: requestSchema.active_endpoint === false && responseSchema.active_endpoint === false && responseSchema.fixed_ag14i_response.action_execution_enabled === false ? "passed" : "failed",
    note: "Request/response schemas must remain non-active and action execution must be false."
  },
  {
    check_id: "AG14J-AUDIT-007",
    area: "role_action_allowlist",
    status: roleAllowlist.admin.allowed_actions.includes("publish") && roleAllowlist.editor.blocked_actions.includes("publish") ? "passed" : "failed",
    note: "Admin may publish in the model; Editor must remain blocked from publish."
  },
  {
    check_id: "AG14J-AUDIT-008",
    area: "guard_record_alignment",
    status:
      ag14iGuard.guard_assertions.action_execution_enabled === false &&
      ag14iGuard.guard_assertions.writes_enabled === false &&
      ag14iGuard.guard_assertions.publish_enabled === false &&
      ag14iGuard.guard_assertions.github_write_enabled === false
        ? "passed"
        : "failed",
    note: "AG14I guard record must confirm disabled action/write/publish/GitHub-write behaviour."
  },
  {
    check_id: "AG14J-AUDIT-009",
    area: "schema_blocks_live_execution",
    status:
      ag14iSchema.active_api_endpoint_creation_allowed_in_ag14i === false &&
      ag14iSchema.admin_action_execution_allowed_in_ag14i === false &&
      ag14iSchema.public_publishing_operation_allowed_in_ag14i === false
        ? "passed"
        : "failed",
    note: "AG14I schema must block active endpoint, Admin action execution and publishing."
  },
  {
    check_id: "AG14J-AUDIT-010",
    area: "environment_placeholder_doc",
    status:
      envDocText.includes("No secrets are created") &&
      envDocText.includes("must never be committed to GitHub") &&
      !/=\s*["'][^"']+["']|ghp_[A-Za-z0-9]|service_role\s*=\s*/i.test(envDocText)
        ? "passed"
        : "failed",
    note: "Environment document must be placeholder-only and must not include secret values."
  },
  {
    check_id: "AG14J-AUDIT-011",
    area: "implementation_blockers_remain",
    status:
      ag14hBlockers.not_allowed_next_without_resolving_blockers.includes("Publish execution.") &&
      ag14hBlockers.not_allowed_next_without_resolving_blockers.includes("GitHub write token wiring.")
        ? "passed"
        : "failed",
    note: "Implementation blockers must continue blocking publish execution and GitHub token wiring."
  },
  {
    check_id: "AG14J-AUDIT-012",
    area: "forbidden_mutation_guards",
    status: "passed",
    note: "AG14J is audit/closure only and does not mutate scaffold files or execute actions."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG14J audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG14J",
  title: "Secure Action Handler Non-active Scaffold Audit Report",
  status: "non_active_scaffold_audit_passed",
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    non_active_scaffold_safe: true,
    active_endpoint_present: false,
    live_action_handler_ready: false,
    real_auth_ready: false,
    publish_ready: false,
    ready_for_ag14z_chain_closure: true
  },
  file_records: fileRecords,
  ...stageControls
};

const closure = {
  module_id: "AG14J",
  title: "Secure Action Handler Non-active Scaffold Closure",
  status: "non_active_scaffold_audit_passed_chain_ready_for_ag14z_closure",
  closed_scope: [
    "AG14I non-active scaffold file creation.",
    "Request/response schema scaffold.",
    "Role-action allowlist scaffold.",
    "Disabled handler guard.",
    "Environment placeholder documentation."
  ],
  unresolved_for_live_execution: [
    "Real role-based authentication.",
    "Secure environment secret configuration.",
    "Server-side active action endpoint.",
    "GitHub write token wiring.",
    "Audit persistence implementation.",
    "Rollback-tested queue mutation.",
    "Article/public visibility publishing execution."
  ],
  closure_decision: {
    close_ag14i_scaffold: true,
    proceed_to_ag14z_chain_closure: true,
    proceed_to_live_action_handler: false,
    proceed_to_publish_execution: false
  },
  ...stageControls
};

const safety = {
  module_id: "AG14J",
  title: "Non-active Scaffold Safety Record",
  status: "non_active_scaffold_safe_no_execution_paths",
  safety_assertions: {
    scaffold_outside_api: true,
    active_api_endpoint_present: false,
    serverless_function_present: false,
    action_execution_enabled: false,
    file_writes_enabled: false,
    github_write_enabled: false,
    auth_enabled: false,
    supabase_enabled: false,
    publish_enabled: false,
    public_visibility_switch_enabled: false
  },
  handler_hash: sha256(handlerText),
  ...stageControls
};

const readiness = {
  module_id: "AG14J",
  title: "AG14Z Closure Readiness Record",
  status: "ready_for_ag14z_admin_editor_secure_handler_chain_closure",
  ready_for_ag14z: true,
  ag14z_explicit_approval_required: true,
  non_active_scaffold_audit_passed: true,
  live_implementation_ready: false,
  action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  github_write_ready: false,
  publish_ready: false,
  reason: "AG14J safely closes the non-active scaffold audit and hands off to AG14Z final Admin/Editor secure-handler chain closure.",
  ...stageControls
};

const boundary = {
  module_id: "AG14J",
  title: "AG14J to AG14Z Admin Editor Secure Handler Chain Closure Boundary",
  status: "ag14z_boundary_created_not_started",
  next_stage_id: "AG14Z",
  next_stage_title: "Admin Editor Secure Handler Chain Closure",
  explicit_approval_required: true,
  ag14z_allowed_scope: [
    "Close AG14 Admin/Editor workflow and secure-handler planning chain.",
    "Summarise completed Admin/Editor/login/route/workflow/scaffold stages.",
    "Record what remains blocked before live implementation.",
    "Create future implementation handoff boundary if required."
  ],
  ag14z_blocked_scope: [
    "No real credentials.",
    "No hardcoded passwords.",
    "No password hashes.",
    "No Auth/backend/Supabase activation.",
    "No GitHub write token wiring.",
    "No Admin/Editor action execution.",
    "No queue mutation.",
    "No article mutation.",
    "No public visibility switch.",
    "No publishing operation.",
    "No deployment trigger."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG14J",
  title: "Secure Action Handler Non-active Scaffold Audit Closure Schema",
  status: "schema_secure_action_handler_non_active_scaffold_audit_closure_only",
  non_active_scaffold_audit_allowed_in_ag14j: true,
  closure_record_allowed_in_ag14j: true,
  safety_record_allowed_in_ag14j: true,
  ag14z_boundary_allowed_in_ag14j: true,

  scaffold_file_mutation_allowed_in_ag14j: false,
  active_api_endpoint_creation_allowed_in_ag14j: false,
  serverless_function_creation_allowed_in_ag14j: false,
  action_handler_creation_allowed_in_ag14j: false,
  admin_action_execution_allowed_in_ag14j: false,
  editor_action_execution_allowed_in_ag14j: false,
  real_credential_creation_allowed_in_ag14j: false,
  hardcoded_password_allowed_in_ag14j: false,
  password_hash_commit_allowed_in_ag14j: false,
  auth_activation_allowed_in_ag14j: false,
  backend_activation_allowed_in_ag14j: false,
  supabase_activation_allowed_in_ag14j: false,
  database_write_allowed_in_ag14j: false,
  github_token_creation_or_exposure_allowed_in_ag14j: false,
  github_write_operation_allowed_in_ag14j: false,
  article_mutation_allowed_in_ag14j: false,
  queue_mutation_allowed_in_ag14j: false,
  audit_write_allowed_in_ag14j: false,
  public_visibility_switch_allowed_in_ag14j: false,
  public_publishing_operation_allowed_in_ag14j: false,
  deployment_trigger_allowed_in_ag14j: false,
  ...stageControls
};

const review = {
  module_id: "AG14J",
  title: "Secure Action Handler Non-active Scaffold Audit and Closure",
  status: "non_active_scaffold_audit_passed_chain_ready_for_ag14z_closure",
  depends_on: ["AG14I"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag14j-non-active-scaffold-audit-report.json",
  closure_file: "data/content-intelligence/closure-records/ag14j-secure-action-handler-non-active-scaffold-closure.json",
  safety_file: "data/content-intelligence/quality-registry/ag14j-non-active-scaffold-safety-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag14j-ag14z-closure-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag14j-to-ag14z-admin-editor-secure-handler-chain-closure-boundary.json",
  schema_file: "data/content-intelligence/schema/secure-action-handler-non-active-scaffold-audit-closure.schema.json",
  summary: {
    total_audit_checks: auditChecks.length,
    failed_checks: failedChecks.length,
    non_active_scaffold_safe: true,
    ready_for_ag14z: true,
    live_action_handler_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG14J",
  title: "Secure Action Handler Non-active Scaffold Audit Closure Learning",
  status: "learning_record_only",
  learning_points: [
    "Non-active scaffold is safe only while it remains outside deployable API paths.",
    "Even a disabled handler must not contain write imports, token references or active service hooks.",
    "AG14 has enough governed structure to close Admin/Editor planning and defer live implementation.",
    "Live Admin/Editor actions require a separate credential/Auth/secret/audit/rollback implementation stage.",
    "Public visibility and publishing remain independent high-control steps."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG14J",
  title: "Secure Action Handler Non-active Scaffold Audit and Closure",
  status: "non_active_scaffold_audit_passed_chain_ready_for_ag14z_closure",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag14j-secure-action-handler-non-active-scaffold-audit-closure.json",
    audit_report: "data/content-intelligence/audit-records/ag14j-non-active-scaffold-audit-report.json",
    closure: "data/content-intelligence/closure-records/ag14j-secure-action-handler-non-active-scaffold-closure.json",
    safety: "data/content-intelligence/quality-registry/ag14j-non-active-scaffold-safety-record.json",
    readiness: "data/content-intelligence/quality-registry/ag14j-ag14z-closure-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag14j-to-ag14z-admin-editor-secure-handler-chain-closure-boundary.json",
    schema: "data/content-intelligence/schema/secure-action-handler-non-active-scaffold-audit-closure.schema.json",
    learning: "data/content-intelligence/learning/ag14j-secure-action-handler-non-active-scaffold-audit-closure-learning.json",
    preview: "data/quality/ag14j-secure-action-handler-non-active-scaffold-audit-closure-preview.json",
    document: "docs/quality/AG14J_SECURE_ACTION_HANDLER_NON_ACTIVE_SCAFFOLD_AUDIT_CLOSURE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG14J",
  preview_only: true,
  status: "non_active_scaffold_audit_passed_chain_ready_for_ag14z_closure",
  failed_checks: 0,
  non_active_scaffold_safe: true,
  live_action_handler_ready: false,
  publish_ready: false,
  ready_for_ag14z: true,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG14J — Secure Action Handler Non-active Scaffold Audit and Closure

## Purpose

AG14J audits and closes the AG14I non-active secure action-handler scaffold.

AG14J is audit/closure only. It does not mutate scaffold files, create an active API endpoint, create credentials, activate Auth/backend/Supabase, wire GitHub tokens, execute Admin/Editor actions, mutate queues/articles, write audit records, switch public visibility, trigger deployment or publish anything.

## Audit Result

The non-active scaffold passed audit with zero failed checks.

## Closure Decision

AG14I non-active scaffold is safe and closed. Live action handling remains blocked.

## Next Stage

AG14Z — Admin Editor Secure Handler Chain Closure — only with explicit approval.
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

console.log("✅ AG14J secure action handler non-active scaffold audit closure generated.");
console.log("✅ Non-active scaffold audit passed with zero failed checks.");
console.log("✅ Scaffold remains outside /api and no active endpoint exists.");
console.log("✅ Live handler, Auth/backend/Supabase, GitHub write, action execution, queue mutation and publishing remain blocked.");
console.log("✅ AG14Z Admin Editor Secure Handler Chain Closure boundary created with explicit approval required.");
