import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag14fReview: "data/content-intelligence/quality-reviews/ag14f-workflow-model-audit-secure-action-handler-readiness.json",
  ag14fAudit: "data/content-intelligence/audit-records/ag14f-workflow-model-audit-report.json",
  ag14fHandlerReadiness: "data/content-intelligence/admin-architecture/ag14f-secure-action-handler-readiness-requirements.json",
  ag14fImplementationMatrix: "data/content-intelligence/admin-architecture/ag14f-action-handler-implementation-path-decision-matrix.json",
  ag14fRiskControl: "data/content-intelligence/admin-architecture/ag14f-admin-editor-action-risk-control-register.json",
  ag14fReadiness: "data/content-intelligence/quality-registry/ag14f-secure-action-handler-planning-readiness-record.json",
  ag14fBoundary: "data/content-intelligence/mutation-plans/ag14f-to-ag14g-secure-action-handler-architecture-plan-boundary.json",

  ag14eAdminDecision: "data/content-intelligence/admin-architecture/ag14e-admin-decision-state-transition-model.json",
  ag14eEditorWorkflow: "data/content-intelligence/admin-architecture/ag14e-editor-submission-correction-workflow-model.json",
  ag14eAuditVersioning: "data/content-intelligence/admin-architecture/ag14e-audit-trail-versioning-model.json",
  ag14eQueueTaxonomy: "data/content-intelligence/admin-architecture/ag14e-queue-and-status-taxonomy-model.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag14g-secure-action-handler-architecture-plan.json");
const architecturePath = path.join(root, "data/content-intelligence/admin-architecture/ag14g-secure-action-handler-architecture-plan.json");
const githubContractPath = path.join(root, "data/content-intelligence/admin-architecture/ag14g-github-backed-static-action-handler-contract.json");
const secretsRolePlanPath = path.join(root, "data/content-intelligence/admin-architecture/ag14g-environment-secret-role-access-plan.json");
const executionAuditPlanPath = path.join(root, "data/content-intelligence/admin-architecture/ag14g-action-execution-sequence-audit-plan.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag14g-secure-action-handler-architecture-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag14g-to-ag14h-secure-action-handler-architecture-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/secure-action-handler-architecture-plan.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag14g-secure-action-handler-architecture-plan-learning.json");
const registryPath = path.join(root, "data/quality/ag14g-secure-action-handler-architecture-plan.json");
const previewPath = path.join(root, "data/quality/ag14g-secure-action-handler-architecture-plan-preview.json");
const docPath = path.join(root, "docs/quality/AG14G_SECURE_ACTION_HANDLER_ARCHITECTURE_PLAN.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG14G input ${name}: ${relativePath}`);
}

const ag14fReview = readJson(inputs.ag14fReview);
const ag14fAudit = readJson(inputs.ag14fAudit);
const ag14fHandlerReadiness = readJson(inputs.ag14fHandlerReadiness);
const ag14fImplementationMatrix = readJson(inputs.ag14fImplementationMatrix);
const ag14fRiskControl = readJson(inputs.ag14fRiskControl);
const ag14fReadiness = readJson(inputs.ag14fReadiness);
const ag14fBoundary = readJson(inputs.ag14fBoundary);

const ag14eAdminDecision = readJson(inputs.ag14eAdminDecision);
const ag14eEditorWorkflow = readJson(inputs.ag14eEditorWorkflow);
const ag14eAuditVersioning = readJson(inputs.ag14eAuditVersioning);
const ag14eQueueTaxonomy = readJson(inputs.ag14eQueueTaxonomy);
const ag13zCandidate = readJson(inputs.ag13zCandidate);

if (ag14fReview.status !== "workflow_model_audit_passed_secure_action_handler_readiness_defined") {
  throw new Error("AG14G requires AG14F review.");
}
if (ag14fAudit.failed_checks.length !== 0) {
  throw new Error("AG14G requires AG14F audit to pass with zero failed checks.");
}
if (ag14fReadiness.ready_for_ag14g !== true) {
  throw new Error("AG14G requires AG14F readiness.");
}
if (ag14fBoundary.next_stage_id !== "AG14G" || ag14fBoundary.explicit_approval_required !== true) {
  throw new Error("AG14G requires AG14F to AG14G explicit boundary.");
}
if (ag14fImplementationMatrix.recommended_strategy !== "hybrid_static_github_first_supabase_later") {
  throw new Error("AG14G requires AG14F hybrid recommendation.");
}

const selectedArticlePath = ag13zCandidate.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG14G requires selected article hash to match AG13Z candidate hash.");
}

const stageControls = {
  secure_action_handler_architecture_plan_only: true,
  secure_action_handler_architecture_defined_in_ag14g: true,
  github_backed_static_contract_defined_in_ag14g: true,
  environment_secret_role_access_plan_defined_in_ag14g: true,
  action_execution_sequence_audit_plan_defined_in_ag14g: true,
  supabase_later_migration_path_preserved_in_ag14g: true,
  ag14h_boundary_created_in_ag14g: true,
  selected_article_read_performed: true,

  action_handler_created_in_ag14g: false,
  admin_action_execution_performed_in_ag14g: false,
  editor_action_execution_performed_in_ag14g: false,
  real_credential_created_in_ag14g: false,
  hardcoded_password_created_in_ag14g: false,
  password_hash_created_in_repo_in_ag14g: false,
  auth_activation_performed_in_ag14g: false,
  backend_activation_performed_in_ag14g: false,
  supabase_activation_performed_in_ag14g: false,
  database_write_performed_in_ag14g: false,
  github_token_created_or_exposed_in_ag14g: false,
  github_write_operation_performed_in_ag14g: false,
  article_mutation_performed_in_ag14g: false,
  queue_mutation_performed_in_ag14g: false,
  public_visibility_switch_performed_in_ag14g: false,
  public_publishing_operation_performed_in_ag14g: false,
  deployment_trigger_performed_in_ag14g: false
};

const adminActions = ag14eAdminDecision.admin_actions.map((item) => item.action);
const editorActions = ag14eEditorWorkflow.editor_actions.map((item) => item.action);

const architecture = {
  module_id: "AG14G",
  title: "Secure Action Handler Architecture Plan",
  status: "secure_action_handler_architecture_plan_defined_not_implemented",
  architecture_strategy: "hybrid_static_github_first_supabase_later",
  guiding_principle: "Admin/Editor UI must remain static-read-only until a server-side action handler with role authentication, secret isolation, hash validation and audit logging is implemented.",
  planned_handler_boundary: {
    handler_type: "server_side_action_handler_or_trusted_function",
    browser_role: "submit action request only",
    server_role: "validate role, validate action, validate hash, write audit, update queue/status, optionally trigger publish/deploy in later approved stage",
    secret_location: "environment_variables_or_secret_manager_only",
    browser_secret_exposure_allowed: false
  },
  action_domains: [
    {
      domain: "admin_decisions",
      actions: adminActions,
      publish_capable_actions: ["publish", "publish_and_close"],
      execution_status: "planned_not_active"
    },
    {
      domain: "editor_submissions",
      actions: editorActions,
      publish_capable_actions: [],
      execution_status: "planned_not_active"
    }
  ],
  required_security_layers: [
    "Authenticated actor identity.",
    "Role-action allowlist.",
    "First-login reset already completed for bootstrap accounts.",
    "Server-side secret storage.",
    "Request origin/CSRF validation.",
    "Input schema validation.",
    "Pre-action article hash match.",
    "State transition allowlist.",
    "Audit write before or atomically with state change.",
    "Post-action hash capture.",
    "Rollback/recovery record.",
    "No client-side write token."
  ],
  preserved_future_path: {
    github_backed_static_first: true,
    supabase_auth_database_later: true,
    migration_note: "Queue JSON and audit fields should remain compatible with future Supabase table design."
  },
  ...stageControls
};

const githubContract = {
  module_id: "AG14G",
  title: "GitHub-backed Static Action Handler Contract",
  status: "github_backed_static_contract_defined_not_activated",
  contract_purpose: "Define how a future secure server-side handler can update static JSON queue/audit files without exposing GitHub write credentials to the browser.",
  proposed_endpoint_contract: {
    endpoint_placeholder: "/api/admin-action",
    method: "POST",
    active_in_ag14g: false,
    required_request_fields: [
      "actor_identifier",
      "actor_role",
      "article_id",
      "requested_action",
      "current_status",
      "expected_new_status",
      "pre_action_hash",
      "decision_or_submission_remarks",
      "client_request_id"
    ],
    required_server_validations: [
      "Verify authenticated session.",
      "Verify actor role.",
      "Verify requested action is permitted for actor role.",
      "Verify article_id exists in queue.",
      "Verify current_status matches server record.",
      "Verify pre_action_hash matches server-side file/content hash.",
      "Verify transition is allowed.",
      "Verify required remarks/confirmation fields are present.",
      "Verify no hard blocker prevents requested action."
    ],
    planned_file_write_targets: [
      "data/admin-review/queue/<article-id>.json",
      "data/admin-review/index/admin-review-queue-index.json",
      "data/admin-review/audit/<article-id>/<timestamp>-<action>.json",
      "data/admin-review/versions/<article-id>/<version>.json"
    ],
    planned_commit_pattern: "Admin action: <action> <article-id>",
    deployment_trigger_policy: "Not part of AG14G. Future publish execution requires separate approval and must not run automatically from this plan."
  },
  browser_restrictions: [
    "Browser must not receive GitHub token.",
    "Browser must not write repository files directly.",
    "Browser must not decide final state without server validation.",
    "Browser must not bypass audit creation."
  ],
  ...stageControls
};

const secretsRolePlan = {
  module_id: "AG14G",
  title: "Environment Secret and Role Access Plan",
  status: "environment_secret_role_access_plan_defined_no_secrets_created",
  credential_doctrine: "No real credentials or password hashes are created in AG14G.",
  required_environment_secrets_for_future_handler: [
    {
      name_placeholder: "DRISHVARA_ADMIN_ACTION_SECRET",
      purpose: "Server-side signing/verification for action requests.",
      created_in_ag14g: false
    },
    {
      name_placeholder: "DRISHVARA_GITHUB_WRITE_TOKEN",
      purpose: "Server-side repository write access for queue/audit updates if GitHub-backed path is activated.",
      created_in_ag14g: false
    },
    {
      name_placeholder: "DRISHVARA_AUTH_PROVIDER_SECRET",
      purpose: "Server-side auth/session validation if custom auth path is used.",
      created_in_ag14g: false
    },
    {
      name_placeholder: "DRISHVARA_SUPABASE_SERVICE_ROLE_KEY",
      purpose: "Only for later Supabase path; never browser-exposed.",
      created_in_ag14g: false
    }
  ],
  role_policy: [
    {
      role: "admin",
      allowed_actions: ["archive", "return_for_correction", "publish", "publish_and_close"],
      blocked_actions: ["bypass_audit", "write_without_hash_check", "expose_secret_to_browser"]
    },
    {
      role: "editor",
      allowed_actions: ["create_manual_article", "save_draft", "preview", "submit_to_admin", "edit_returned_article", "resubmit_to_admin"],
      blocked_actions: ["publish", "publish_and_close", "archive_final_record", "approve_public_visibility", "reset_admin_credential"]
    }
  ],
  bootstrap_rule: "Initial login credentials may exist only in the future auth layer, must force password reset, and must never be committed to repository files.",
  ...stageControls
};

const executionAuditPlan = {
  module_id: "AG14G",
  title: "Action Execution Sequence and Audit Plan",
  status: "action_execution_sequence_audit_plan_defined_not_executable",
  sequence_for_future_admin_or_editor_action: [
    {
      step: 1,
      name: "receive_request",
      description: "Receive action request from UI.",
      server_side_required: true
    },
    {
      step: 2,
      name: "authenticate_actor",
      description: "Verify actor identity and role.",
      server_side_required: true
    },
    {
      step: 3,
      name: "validate_action_allowlist",
      description: "Confirm action is allowed for role.",
      server_side_required: true
    },
    {
      step: 4,
      name: "load_server_record",
      description: "Load article queue/status/version record server-side.",
      server_side_required: true
    },
    {
      step: 5,
      name: "validate_hash_and_status",
      description: "Compare supplied current status and hash with server-side record.",
      server_side_required: true
    },
    {
      step: 6,
      name: "validate_transition",
      description: "Check requested status transition against AG14E model.",
      server_side_required: true
    },
    {
      step: 7,
      name: "create_audit_record",
      description: "Create audit record with actor, action, remarks, status, hashes and timestamp.",
      server_side_required: true
    },
    {
      step: 8,
      name: "apply_state_change",
      description: "Update queue/status/version record only after validation and audit path is ready.",
      server_side_required: true
    },
    {
      step: 9,
      name: "record_post_hash",
      description: "Capture post-action hash and final state.",
      server_side_required: true
    },
    {
      step: 10,
      name: "return_result",
      description: "Return action result to UI without exposing secrets.",
      server_side_required: true
    }
  ],
  audit_fields_inherited_from_ag14e: ag14eAuditVersioning.audit_required_fields,
  rollback_model: [
    "Every action writes pre-action hash.",
    "Every changed queue/status file is versioned or recoverable.",
    "Archive does not delete content.",
    "Return for correction preserves Admin remarks and prior version.",
    "Publish requires final Admin confirmation and post-action hash.",
    "Publish and close records closure separately."
  ],
  ...stageControls
};

const readiness = {
  module_id: "AG14G",
  title: "Secure Action Handler Architecture Readiness Record",
  status: "ready_for_ag14h_secure_action_handler_architecture_audit",
  architecture_plan_defined: true,
  github_static_contract_defined: true,
  secrets_role_plan_defined: true,
  execution_audit_plan_defined: true,
  ready_for_ag14h: true,
  ag14h_explicit_approval_required: true,
  implementation_ready: false,
  action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  publish_ready: false,
  reason: "AG14G defines architecture only. AG14H should audit architecture and decide readiness for a later implementation stage.",
  ...stageControls
};

const boundary = {
  module_id: "AG14G",
  title: "AG14G to AG14H Secure Action Handler Architecture Audit Boundary",
  status: "ag14h_boundary_created_not_started",
  next_stage_id: "AG14H",
  next_stage_title: "Secure Action Handler Architecture Audit and Implementation Readiness",
  explicit_approval_required: true,
  ag14h_allowed_scope: [
    "Audit secure action handler architecture plan.",
    "Audit GitHub-backed static contract.",
    "Audit environment secret and role access plan.",
    "Audit action execution/audit sequence.",
    "Define readiness or blockers for later implementation."
  ],
  ag14h_blocked_scope: [
    "No real credential creation.",
    "No hardcoded passwords.",
    "No Auth/backend/Supabase activation.",
    "No action handler implementation.",
    "No Admin/Editor action execution.",
    "No article mutation.",
    "No public visibility switch.",
    "No publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG14G",
  title: "Secure Action Handler Architecture Plan Schema",
  status: "schema_secure_action_handler_architecture_plan_only",
  secure_action_handler_architecture_allowed_in_ag14g: true,
  github_static_contract_allowed_in_ag14g: true,
  environment_secret_role_plan_allowed_in_ag14g: true,
  action_execution_audit_plan_allowed_in_ag14g: true,
  ag14h_boundary_allowed_in_ag14g: true,

  action_handler_creation_allowed_in_ag14g: false,
  admin_action_execution_allowed_in_ag14g: false,
  editor_action_execution_allowed_in_ag14g: false,
  real_credential_creation_allowed_in_ag14g: false,
  hardcoded_password_allowed_in_ag14g: false,
  password_hash_commit_allowed_in_ag14g: false,
  auth_activation_allowed_in_ag14g: false,
  backend_activation_allowed_in_ag14g: false,
  supabase_activation_allowed_in_ag14g: false,
  database_write_allowed_in_ag14g: false,
  github_token_creation_or_exposure_allowed_in_ag14g: false,
  github_write_operation_allowed_in_ag14g: false,
  article_mutation_allowed_in_ag14g: false,
  queue_mutation_allowed_in_ag14g: false,
  public_visibility_switch_allowed_in_ag14g: false,
  public_publishing_operation_allowed_in_ag14g: false,
  deployment_trigger_allowed_in_ag14g: false,
  ...stageControls
};

const review = {
  module_id: "AG14G",
  title: "Secure Action Handler Architecture Plan",
  status: "secure_action_handler_architecture_plan_defined_not_implemented",
  depends_on: ["AG14F"],
  generated_from: inputs,
  architecture_file: "data/content-intelligence/admin-architecture/ag14g-secure-action-handler-architecture-plan.json",
  github_contract_file: "data/content-intelligence/admin-architecture/ag14g-github-backed-static-action-handler-contract.json",
  secrets_role_plan_file: "data/content-intelligence/admin-architecture/ag14g-environment-secret-role-access-plan.json",
  execution_audit_plan_file: "data/content-intelligence/admin-architecture/ag14g-action-execution-sequence-audit-plan.json",
  readiness_file: "data/content-intelligence/quality-registry/ag14g-secure-action-handler-architecture-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag14g-to-ag14h-secure-action-handler-architecture-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/secure-action-handler-architecture-plan.schema.json",
  summary: {
    architecture_strategy: architecture.architecture_strategy,
    handler_created: false,
    action_execution_ready: false,
    ready_for_ag14h: true,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG14G",
  title: "Secure Action Handler Architecture Plan Learning",
  status: "learning_record_only",
  learning_points: [
    "The correct next implementation path is not direct browser-side actions but a server-side action handler.",
    "GitHub-backed static workflow can fit Drishvara's present architecture if tokens stay server-side.",
    "Supabase/Auth should remain a planned migration path, not an immediate activation.",
    "Every Admin/Editor action must be hash-checked, role-checked and audit-logged.",
    "Publishing must remain a separate controlled execution stage after secure handler readiness."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG14G",
  title: "Secure Action Handler Architecture Plan",
  status: "secure_action_handler_architecture_plan_defined_not_implemented",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag14g-secure-action-handler-architecture-plan.json",
    architecture: "data/content-intelligence/admin-architecture/ag14g-secure-action-handler-architecture-plan.json",
    github_contract: "data/content-intelligence/admin-architecture/ag14g-github-backed-static-action-handler-contract.json",
    secrets_role_plan: "data/content-intelligence/admin-architecture/ag14g-environment-secret-role-access-plan.json",
    execution_audit_plan: "data/content-intelligence/admin-architecture/ag14g-action-execution-sequence-audit-plan.json",
    readiness: "data/content-intelligence/quality-registry/ag14g-secure-action-handler-architecture-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag14g-to-ag14h-secure-action-handler-architecture-audit-boundary.json",
    schema: "data/content-intelligence/schema/secure-action-handler-architecture-plan.schema.json",
    learning: "data/content-intelligence/learning/ag14g-secure-action-handler-architecture-plan-learning.json",
    preview: "data/quality/ag14g-secure-action-handler-architecture-plan-preview.json",
    document: "docs/quality/AG14G_SECURE_ACTION_HANDLER_ARCHITECTURE_PLAN.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG14G",
  preview_only: true,
  status: "secure_action_handler_architecture_plan_defined_not_implemented",
  architecture_strategy: architecture.architecture_strategy,
  handler_created: false,
  action_execution_ready: false,
  real_auth_active: false,
  publish_ready: false,
  ready_for_ag14h: true,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG14G — Secure Action Handler Architecture Plan

## Purpose

AG14G defines the architecture for a future secure Admin/Editor action handler.

AG14G is architecture/planning only. It does not create an action handler, credentials, passwords, password hashes, Auth/backend/Supabase activation, database writes, GitHub write operations, article mutation, queue mutation, public visibility switching, deployment triggers or publishing.

## Recommended Architecture

Hybrid path:

1. GitHub-backed static queue/action-handler architecture first.
2. Supabase/Auth/database migration later after explicit approval.

## Core Requirements

- Server-side action handling.
- Role-based Admin/Editor authentication.
- Environment-only secret storage.
- Role-action allowlist.
- Pre-action hash validation.
- Audit write before state transition.
- Post-action hash capture.
- Versioning and rollback readiness.
- No browser-exposed GitHub token or Supabase service key.

## Next Stage

AG14H — Secure Action Handler Architecture Audit and Implementation Readiness — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(architecturePath, architecture);
writeJson(githubContractPath, githubContract);
writeJson(secretsRolePlanPath, secretsRolePlan);
writeJson(executionAuditPlanPath, executionAuditPlan);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG14G secure action handler architecture plan generated.");
console.log("✅ GitHub-backed static action handler contract defined.");
console.log("✅ Environment secret and role access plan defined.");
console.log("✅ Action execution sequence and audit plan defined.");
console.log("✅ Supabase/Auth later-migration path preserved.");
console.log("✅ No handler, credentials, Auth/backend/Supabase activation, GitHub write, action execution or publishing performed.");
console.log("✅ AG14H Secure Action Handler Architecture Audit boundary created with explicit approval required.");
