import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag14eReview: "data/content-intelligence/quality-reviews/ag14e-admin-editor-decision-submission-workflow-model.json",
  ag14eAdminDecision: "data/content-intelligence/admin-architecture/ag14e-admin-decision-state-transition-model.json",
  ag14eEditorWorkflow: "data/content-intelligence/admin-architecture/ag14e-editor-submission-correction-workflow-model.json",
  ag14eAuditVersioning: "data/content-intelligence/admin-architecture/ag14e-audit-trail-versioning-model.json",
  ag14eQueueTaxonomy: "data/content-intelligence/admin-architecture/ag14e-queue-and-status-taxonomy-model.json",
  ag14eReadiness: "data/content-intelligence/quality-registry/ag14e-workflow-model-readiness-record.json",
  ag14eBoundary: "data/content-intelligence/mutation-plans/ag14e-to-ag14f-workflow-model-audit-secure-action-handler-readiness-boundary.json",
  ag14dRouteRecord: "data/content-intelligence/admin-architecture/ag14d-public-signin-internal-admin-route-separation-record.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag14f-workflow-model-audit-secure-action-handler-readiness.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag14f-workflow-model-audit-report.json");
const handlerReadinessPath = path.join(root, "data/content-intelligence/admin-architecture/ag14f-secure-action-handler-readiness-requirements.json");
const implementationMatrixPath = path.join(root, "data/content-intelligence/admin-architecture/ag14f-action-handler-implementation-path-decision-matrix.json");
const riskControlPath = path.join(root, "data/content-intelligence/admin-architecture/ag14f-admin-editor-action-risk-control-register.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag14f-secure-action-handler-planning-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag14f-to-ag14g-secure-action-handler-architecture-plan-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/workflow-model-audit-secure-action-handler-readiness.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag14f-workflow-model-audit-secure-action-handler-readiness-learning.json");
const registryPath = path.join(root, "data/quality/ag14f-workflow-model-audit-secure-action-handler-readiness.json");
const previewPath = path.join(root, "data/quality/ag14f-workflow-model-audit-secure-action-handler-readiness-preview.json");
const docPath = path.join(root, "docs/quality/AG14F_WORKFLOW_MODEL_AUDIT_SECURE_ACTION_HANDLER_READINESS.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG14F input ${name}: ${relativePath}`);
}

const ag14eReview = readJson(inputs.ag14eReview);
const ag14eAdminDecision = readJson(inputs.ag14eAdminDecision);
const ag14eEditorWorkflow = readJson(inputs.ag14eEditorWorkflow);
const ag14eAuditVersioning = readJson(inputs.ag14eAuditVersioning);
const ag14eQueueTaxonomy = readJson(inputs.ag14eQueueTaxonomy);
const ag14eReadiness = readJson(inputs.ag14eReadiness);
const ag14eBoundary = readJson(inputs.ag14eBoundary);
const ag14dRouteRecord = readJson(inputs.ag14dRouteRecord);
const ag13zCandidate = readJson(inputs.ag13zCandidate);

if (ag14eReview.status !== "admin_editor_decision_submission_workflow_model_defined") {
  throw new Error("AG14F requires AG14E review.");
}
if (ag14eReadiness.ready_for_ag14f !== true) {
  throw new Error("AG14F requires AG14E readiness.");
}
if (ag14eBoundary.next_stage_id !== "AG14F" || ag14eBoundary.explicit_approval_required !== true) {
  throw new Error("AG14F requires AG14E to AG14F explicit boundary.");
}

const selectedArticlePath = ag13zCandidate.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG14F requires selected article hash to match AG13Z candidate hash.");
}

const adminActions = ag14eAdminDecision.admin_actions.map((item) => item.action);
const editorActions = ag14eEditorWorkflow.editor_actions.map((item) => item.action);
const queues = ag14eQueueTaxonomy.queues.map((item) => item.queue);
const statuses = ag14eQueueTaxonomy.canonical_statuses;

const stageControls = {
  workflow_model_audit_secure_action_handler_readiness_only: true,
  workflow_model_audited_in_ag14f: true,
  secure_action_handler_readiness_defined_in_ag14f: true,
  implementation_path_matrix_defined_in_ag14f: true,
  action_risk_control_register_defined_in_ag14f: true,
  ag14g_boundary_created_in_ag14f: true,
  selected_article_read_performed: true,

  admin_action_execution_performed_in_ag14f: false,
  editor_action_execution_performed_in_ag14f: false,
  action_handler_created_in_ag14f: false,
  real_credential_created_in_ag14f: false,
  hardcoded_password_created_in_ag14f: false,
  password_hash_created_in_repo_in_ag14f: false,
  auth_activation_performed_in_ag14f: false,
  backend_activation_performed_in_ag14f: false,
  supabase_activation_performed_in_ag14f: false,
  database_write_performed_in_ag14f: false,
  article_mutation_performed_in_ag14f: false,
  queue_mutation_performed_in_ag14f: false,
  public_visibility_switch_performed_in_ag14f: false,
  public_publishing_operation_performed_in_ag14f: false,
  deployment_trigger_performed_in_ag14f: false
};

const auditChecks = [
  {
    check_id: "AG14F-AUDIT-001",
    area: "ag14e_dependency",
    status: "passed",
    note: "AG14E workflow model and readiness boundary are present."
  },
  {
    check_id: "AG14F-AUDIT-002",
    area: "admin_action_model",
    status: ["archive", "return_for_correction", "publish", "publish_and_close"].every((a) => adminActions.includes(a)) ? "passed" : "failed",
    note: "Admin actions must include Archive, Return for correction, Publish, Publish and close."
  },
  {
    check_id: "AG14F-AUDIT-003",
    area: "editor_action_model",
    status: ["create_manual_article", "save_draft", "preview", "submit_to_admin", "edit_returned_article", "resubmit_to_admin"].every((a) => editorActions.includes(a)) ? "passed" : "failed",
    note: "Editor actions must include manual creation, draft, preview, submit, correction and resubmit."
  },
  {
    check_id: "AG14F-AUDIT-004",
    area: "return_for_correction_manual_editor_loop",
    status: ag14eAdminDecision.admin_actions.find((a) => a.action === "return_for_correction")?.editor_queue_target === "editor_correction_queue" ? "passed" : "failed",
    note: "Return for correction must route to manual Editor correction queue."
  },
  {
    check_id: "AG14F-AUDIT-005",
    area: "editor_publish_block",
    status: ag14eEditorWorkflow.editor_blocked_actions.includes("publish") && ag14eEditorWorkflow.editor_blocked_actions.includes("publish_and_close") ? "passed" : "failed",
    note: "Editor must be blocked from publishing."
  },
  {
    check_id: "AG14F-AUDIT-006",
    area: "audit_trail_versioning",
    status: ["actor_role", "actor_identifier", "action", "timestamp", "pre_action_hash", "post_action_hash", "previous_status", "new_status"].every((field) => ag14eAuditVersioning.audit_required_fields.includes(field)) ? "passed" : "failed",
    note: "Audit model must include actor, action, timestamp, status and hash fields."
  },
  {
    check_id: "AG14F-AUDIT-007",
    area: "queue_taxonomy",
    status: ["admin_review_queue", "editor_draft_queue", "editor_correction_queue", "archive_queue", "published_queue"].every((q) => queues.includes(q)) && statuses.includes("published_closed") && statuses.includes("returned_for_correction") ? "passed" : "failed",
    note: "Queue taxonomy must cover Admin, Editor, Archive and Published states."
  },
  {
    check_id: "AG14F-AUDIT-008",
    area: "execution_block",
    status:
      ag14eAdminDecision.admin_actions.every((a) => a.execution_available_in_ag14e === false) &&
      ag14eEditorWorkflow.editor_actions.every((a) => a.execution_available_in_ag14e === false) ? "passed" : "failed",
    note: "No Admin or Editor action is executable from AG14E model."
  },
  {
    check_id: "AG14F-AUDIT-009",
    area: "route_separation",
    status: ag14dRouteRecord.public_signin_route === "signin.html" && ag14dRouteRecord.internal_admin_route === "admin.html" ? "passed" : "failed",
    note: "Public sign-in and internal admin routes remain separated."
  },
  {
    check_id: "AG14F-AUDIT-010",
    area: "forbidden_activation_guards",
    status: "passed",
    note: "AG14F is audit/readiness only and does not create handlers, credentials, Auth/backend/Supabase or publishing."
  }
];

const failedChecks = auditChecks.filter((item) => item.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG14F audit failed: ${failedChecks.map((item) => item.check_id).join(", ")}`);
}

const handlerReadiness = {
  module_id: "AG14F",
  title: "Secure Action Handler Readiness Requirements",
  status: "secure_action_handler_requirements_defined_not_activated",
  purpose: "Define the minimum requirements before Admin/Editor buttons can perform real actions.",
  required_capabilities_before_action_execution: [
    "Server-side action handler or trusted backend endpoint.",
    "Role-based authentication for Admin and Editor.",
    "First-login password reset support for bootstrap credentials.",
    "Secret storage outside public repository and browser code.",
    "Action allowlist by role.",
    "Input validation for every Admin/Editor action.",
    "Article hash validation before and after action.",
    "Audit-trail write before final state change.",
    "Versioning record for every submit/resubmit/publish/archive action.",
    "Rollback or recovery path for publish/archive/correction decisions.",
    "CSRF/origin protection or equivalent request validation.",
    "Rate limiting and abuse guard for action endpoints.",
    "No browser-exposed GitHub token, Supabase service key or deployment secret."
  ],
  minimum_action_handler_inputs: [
    "actor_identifier",
    "actor_role",
    "article_id",
    "current_status",
    "requested_action",
    "decision_or_submission_remarks",
    "pre_action_hash",
    "expected_new_status",
    "public_visibility_after_action"
  ],
  minimum_action_handler_outputs: [
    "action_result",
    "new_status",
    "post_action_hash",
    "audit_record_path_or_id",
    "version_id",
    "visibility_state",
    "timestamp"
  ],
  blocked_until_ag14g_or_later: [
    "Real action endpoint creation.",
    "Credential generation.",
    "Auth/backend/Supabase activation.",
    "Database write.",
    "GitHub write token wiring.",
    "Publish execution."
  ],
  ...stageControls
};

const implementationMatrix = {
  module_id: "AG14F",
  title: "Action Handler Implementation Path Decision Matrix",
  status: "implementation_path_matrix_defined_no_activation",
  recommended_strategy: "hybrid_static_github_first_supabase_later",
  options: [
    {
      option_id: "github_backed_static_action_handler",
      description: "Use a server-side function or protected GitHub Action/API path to update JSON records, commit publish/archive/correction state and trigger deployment later.",
      advantages: [
        "Fits current GitHub/Vercel static architecture.",
        "Lower complexity than full database migration.",
        "Keeps audit records as versioned files.",
        "Good for early controlled Admin/Editor workflow."
      ],
      risks: [
        "Requires secure server-side token handling.",
        "Needs careful concurrency/hash checks.",
        "Not ideal for high-volume multi-user editorial operations."
      ],
      near_term_fit: "high",
      activation_status: "not_active"
    },
    {
      option_id: "supabase_auth_database",
      description: "Use Supabase Auth, role tables, article queue tables and audit logs.",
      advantages: [
        "Proper user authentication and role management.",
        "Cleaner dynamic queue and decision handling.",
        "Better long-term for multi-user platform."
      ],
      risks: [
        "Higher setup and security burden.",
        "Requires backend policy design.",
        "Supabase activation has intentionally been blocked so far."
      ],
      near_term_fit: "medium_later",
      activation_status: "not_active"
    },
    {
      option_id: "hybrid_static_now_supabase_later",
      description: "Start with GitHub-backed static queue and secure server-side action handler; migrate to Supabase/Auth once admin workflow stabilizes.",
      advantages: [
        "Preserves current governance path.",
        "Allows gradual rollout.",
        "Avoids premature backend complexity.",
        "Keeps future Supabase migration open."
      ],
      risks: [
        "Requires disciplined schema compatibility.",
        "Temporary static workflow must not become permanent security shortcut."
      ],
      near_term_fit: "recommended",
      activation_status: "not_active"
    }
  ],
  decision_note: "AG14F recommends the hybrid path but does not activate it. AG14G should prepare the secure action-handler architecture plan.",
  ...stageControls
};

const riskControl = {
  module_id: "AG14F",
  title: "Admin Editor Action Risk Control Register",
  status: "risk_control_register_defined",
  critical_risks: [
    {
      risk: "Hardcoded credentials in static files",
      severity: "critical",
      control: "Credentials must remain outside repository/browser code; first-login reset must run through secure auth layer.",
      status: "blocked_by_design"
    },
    {
      risk: "Browser-exposed GitHub or Supabase secret",
      severity: "critical",
      control: "All write tokens/service keys must remain server-side only.",
      status: "blocked_by_design"
    },
    {
      risk: "Editor can publish directly",
      severity: "high",
      control: "Editor role blocked from publish and publish_and_close actions.",
      status: "controlled_in_model"
    },
    {
      risk: "Admin publishes stale article version",
      severity: "high",
      control: "Pre-action hash and version validation required before publish.",
      status: "handler_requirement"
    },
    {
      risk: "No audit trail for decision",
      severity: "high",
      control: "Audit write required for all Admin/Editor actions.",
      status: "handler_requirement"
    },
    {
      risk: "Public visibility switched without Admin approval",
      severity: "critical",
      control: "Only Admin publish/publish_and_close may set public_visibility true through secure handler.",
      status: "handler_requirement"
    },
    {
      risk: "Route confusion between public Sign in and Admin console",
      severity: "medium",
      control: "signin.html is public route; admin.html is internal route.",
      status: "controlled_by_ag14d"
    }
  ],
  ...stageControls
};

const readiness = {
  module_id: "AG14F",
  title: "Secure Action Handler Planning Readiness Record",
  status: "ready_for_ag14g_secure_action_handler_architecture_plan",
  workflow_audit_passed: true,
  failed_audit_checks: 0,
  ready_for_ag14g: true,
  ag14g_explicit_approval_required: true,
  recommended_next_stage: "AG14G",
  recommended_next_stage_title: "Secure Action Handler Architecture Plan",
  recommended_implementation_strategy: implementationMatrix.recommended_strategy,
  action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  publish_ready: false,
  reason: "Workflow model is ready, but secure action-handler architecture must be planned before any Admin/Editor button performs real actions.",
  ...stageControls
};

const boundary = {
  module_id: "AG14F",
  title: "AG14F to AG14G Secure Action Handler Architecture Plan Boundary",
  status: "ag14g_boundary_created_not_started",
  next_stage_id: "AG14G",
  next_stage_title: "Secure Action Handler Architecture Plan",
  explicit_approval_required: true,
  ag14g_allowed_scope: [
    "Plan secure action-handler architecture.",
    "Define how Admin/Editor actions will be processed server-side.",
    "Define environment secret requirements.",
    "Define GitHub-backed static workflow option.",
    "Define Supabase/Auth later-migration option.",
    "Keep implementation disabled until separately approved."
  ],
  ag14g_blocked_scope: [
    "No real credential creation.",
    "No hardcoded passwords.",
    "No Auth/backend/Supabase activation.",
    "No Admin action execution.",
    "No Editor action execution.",
    "No article mutation.",
    "No public visibility switch.",
    "No publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG14F",
  title: "Workflow Model Audit Secure Action Handler Readiness Schema",
  status: "schema_workflow_model_audit_secure_action_handler_readiness_only",
  workflow_model_audit_allowed_in_ag14f: true,
  secure_action_handler_readiness_allowed_in_ag14f: true,
  implementation_matrix_allowed_in_ag14f: true,
  risk_control_register_allowed_in_ag14f: true,
  ag14g_boundary_allowed_in_ag14f: true,

  action_handler_creation_allowed_in_ag14f: false,
  admin_action_execution_allowed_in_ag14f: false,
  editor_action_execution_allowed_in_ag14f: false,
  real_credential_creation_allowed_in_ag14f: false,
  hardcoded_password_allowed_in_ag14f: false,
  password_hash_commit_allowed_in_ag14f: false,
  auth_activation_allowed_in_ag14f: false,
  backend_activation_allowed_in_ag14f: false,
  supabase_activation_allowed_in_ag14f: false,
  database_write_allowed_in_ag14f: false,
  article_mutation_allowed_in_ag14f: false,
  queue_mutation_allowed_in_ag14f: false,
  public_visibility_switch_allowed_in_ag14f: false,
  public_publishing_operation_allowed_in_ag14f: false,
  ...stageControls
};

const review = {
  module_id: "AG14F",
  title: "Admin Editor Workflow Model Audit and Secure Action Handler Readiness",
  status: "workflow_model_audit_passed_secure_action_handler_readiness_defined",
  depends_on: ["AG14E"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag14f-workflow-model-audit-report.json",
  handler_readiness_file: "data/content-intelligence/admin-architecture/ag14f-secure-action-handler-readiness-requirements.json",
  implementation_matrix_file: "data/content-intelligence/admin-architecture/ag14f-action-handler-implementation-path-decision-matrix.json",
  risk_control_file: "data/content-intelligence/admin-architecture/ag14f-admin-editor-action-risk-control-register.json",
  readiness_file: "data/content-intelligence/quality-registry/ag14f-secure-action-handler-planning-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag14f-to-ag14g-secure-action-handler-architecture-plan-boundary.json",
  schema_file: "data/content-intelligence/schema/workflow-model-audit-secure-action-handler-readiness.schema.json",
  summary: {
    total_audit_checks: auditChecks.length,
    failed_audit_checks: failedChecks.length,
    recommended_strategy: implementationMatrix.recommended_strategy,
    ready_for_ag14g: true,
    action_execution_ready: false,
    ...stageControls
  },
  ...stageControls
};

const auditReport = {
  module_id: "AG14F",
  title: "Workflow Model Audit Report",
  status: "workflow_model_audit_passed",
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((item) => item.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    workflow_model_valid: true,
    secure_action_handler_required_before_execution: true,
    ready_for_ag14g_secure_action_handler_architecture_plan: true,
    action_execution_ready: false
  },
  ...stageControls
};

const learning = {
  module_id: "AG14F",
  title: "Workflow Model Audit Secure Action Handler Readiness Learning",
  status: "learning_record_only",
  learning_points: [
    "Workflow modelling is complete enough to plan secure action handling.",
    "No Admin or Editor button should execute from static browser code.",
    "GitHub-backed static action handling is the best near-term fit, provided secrets stay server-side.",
    "Supabase/Auth remains a future architecture option, not an immediate activation.",
    "Every publish/archive/correction/submission action must be hash-checked and audit-logged."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG14F",
  title: "Admin Editor Workflow Model Audit and Secure Action Handler Readiness",
  status: "workflow_model_audit_passed_secure_action_handler_readiness_defined",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag14f-workflow-model-audit-secure-action-handler-readiness.json",
    audit_report: "data/content-intelligence/audit-records/ag14f-workflow-model-audit-report.json",
    handler_readiness: "data/content-intelligence/admin-architecture/ag14f-secure-action-handler-readiness-requirements.json",
    implementation_matrix: "data/content-intelligence/admin-architecture/ag14f-action-handler-implementation-path-decision-matrix.json",
    risk_control: "data/content-intelligence/admin-architecture/ag14f-admin-editor-action-risk-control-register.json",
    readiness: "data/content-intelligence/quality-registry/ag14f-secure-action-handler-planning-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag14f-to-ag14g-secure-action-handler-architecture-plan-boundary.json",
    schema: "data/content-intelligence/schema/workflow-model-audit-secure-action-handler-readiness.schema.json",
    learning: "data/content-intelligence/learning/ag14f-workflow-model-audit-secure-action-handler-readiness-learning.json",
    preview: "data/quality/ag14f-workflow-model-audit-secure-action-handler-readiness-preview.json",
    document: "docs/quality/AG14F_WORKFLOW_MODEL_AUDIT_SECURE_ACTION_HANDLER_READINESS.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG14F",
  preview_only: true,
  status: "workflow_model_audit_passed_secure_action_handler_readiness_defined",
  recommended_strategy: implementationMatrix.recommended_strategy,
  action_execution_ready: false,
  real_auth_active: false,
  publish_ready: false,
  ready_for_ag14g: true,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG14F — Admin Editor Workflow Model Audit and Secure Action Handler Readiness

## Purpose

AG14F audits the Admin/Editor workflow model and defines readiness requirements for a future secure action handler.

AG14F is audit/readiness only. It does not create credentials, activate Auth/backend/Supabase, execute Admin/Editor actions, mutate articles, switch public visibility, trigger deployment or publish anything.

## Audit Result

The AG14E workflow model passed audit with zero failed checks.

## Secure Action Handler Requirements

Future real actions require server-side handling, role-based authentication, external secret storage, action allowlists, hash checks, audit writes, versioning, rollback readiness and no browser-exposed write tokens.

## Recommended Implementation Path

Hybrid path: GitHub-backed static queue/action handler first, Supabase/Auth later after explicit activation approval.

## Next Stage

AG14G — Secure Action Handler Architecture Plan — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditPath, auditReport);
writeJson(handlerReadinessPath, handlerReadiness);
writeJson(implementationMatrixPath, implementationMatrix);
writeJson(riskControlPath, riskControl);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG14F workflow model audit and secure action handler readiness generated.");
console.log("✅ Workflow model audit passed with zero failed checks.");
console.log("✅ Secure action handler readiness requirements defined.");
console.log("✅ Implementation path matrix defined: hybrid static/GitHub first, Supabase/Auth later.");
console.log("✅ Risk control register defined.");
console.log("✅ No action handler, credentials, Auth/backend/Supabase activation, action execution or publishing performed.");
console.log("✅ AG14G Secure Action Handler Architecture Plan boundary created with explicit approval required.");
