import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag14e-admin-editor-decision-submission-workflow-model.json",
  "data/content-intelligence/admin-architecture/ag14e-admin-decision-state-transition-model.json",
  "data/content-intelligence/admin-architecture/ag14e-editor-submission-correction-workflow-model.json",
  "data/content-intelligence/admin-architecture/ag14e-audit-trail-versioning-model.json",
  "data/content-intelligence/admin-architecture/ag14e-queue-and-status-taxonomy-model.json",
  "data/content-intelligence/quality-registry/ag14e-workflow-model-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14e-to-ag14f-workflow-model-audit-secure-action-handler-readiness-boundary.json",

  "data/content-intelligence/quality-reviews/ag14f-workflow-model-audit-secure-action-handler-readiness.json",
  "data/content-intelligence/audit-records/ag14f-workflow-model-audit-report.json",
  "data/content-intelligence/admin-architecture/ag14f-secure-action-handler-readiness-requirements.json",
  "data/content-intelligence/admin-architecture/ag14f-action-handler-implementation-path-decision-matrix.json",
  "data/content-intelligence/admin-architecture/ag14f-admin-editor-action-risk-control-register.json",
  "data/content-intelligence/quality-registry/ag14f-secure-action-handler-planning-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14f-to-ag14g-secure-action-handler-architecture-plan-boundary.json",
  "data/content-intelligence/schema/workflow-model-audit-secure-action-handler-readiness.schema.json",
  "data/content-intelligence/learning/ag14f-workflow-model-audit-secure-action-handler-readiness-learning.json",
  "data/quality/ag14f-workflow-model-audit-secure-action-handler-readiness.json",
  "data/quality/ag14f-workflow-model-audit-secure-action-handler-readiness-preview.json",
  "docs/quality/AG14F_WORKFLOW_MODEL_AUDIT_SECURE_ACTION_HANDLER_READINESS.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG14F validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag14eReview = readJson("data/content-intelligence/quality-reviews/ag14e-admin-editor-decision-submission-workflow-model.json");
const ag14eReadiness = readJson("data/content-intelligence/quality-registry/ag14e-workflow-model-readiness-record.json");
const ag14eBoundary = readJson("data/content-intelligence/mutation-plans/ag14e-to-ag14f-workflow-model-audit-secure-action-handler-readiness-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag14f-workflow-model-audit-secure-action-handler-readiness.json");
const audit = readJson("data/content-intelligence/audit-records/ag14f-workflow-model-audit-report.json");
const handler = readJson("data/content-intelligence/admin-architecture/ag14f-secure-action-handler-readiness-requirements.json");
const matrix = readJson("data/content-intelligence/admin-architecture/ag14f-action-handler-implementation-path-decision-matrix.json");
const risk = readJson("data/content-intelligence/admin-architecture/ag14f-admin-editor-action-risk-control-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag14f-secure-action-handler-planning-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag14f-to-ag14g-secure-action-handler-architecture-plan-boundary.json");
const schema = readJson("data/content-intelligence/schema/workflow-model-audit-secure-action-handler-readiness.schema.json");
const learning = readJson("data/content-intelligence/learning/ag14f-workflow-model-audit-secure-action-handler-readiness-learning.json");
const registry = readJson("data/quality/ag14f-workflow-model-audit-secure-action-handler-readiness.json");
const preview = readJson("data/quality/ag14f-workflow-model-audit-secure-action-handler-readiness-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG14F_WORKFLOW_MODEL_AUDIT_SECURE_ACTION_HANDLER_READINESS.md"), "utf8");

for (const obj of [review, audit, handler, matrix, risk, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG14F") fail(`module_id must be AG14F in ${obj.title || "object"}`);
}

if (ag14eReview.status !== "admin_editor_decision_submission_workflow_model_defined") fail("AG14E review status mismatch");
if (ag14eReadiness.ready_for_ag14f !== true) fail("AG14E readiness for AG14F missing");
if (ag14eBoundary.next_stage_id !== "AG14F") fail("AG14F boundary missing in AG14E");

if (review.status !== "workflow_model_audit_passed_secure_action_handler_readiness_defined") fail("Review status mismatch");
if (audit.status !== "workflow_model_audit_passed") fail("Audit status mismatch");
if (handler.status !== "secure_action_handler_requirements_defined_not_activated") fail("Handler readiness status mismatch");
if (matrix.status !== "implementation_path_matrix_defined_no_activation") fail("Implementation matrix status mismatch");
if (risk.status !== "risk_control_register_defined") fail("Risk register status mismatch");
if (readiness.status !== "ready_for_ag14g_secure_action_handler_architecture_plan") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 10) fail("AG14F must include ten audit checks");
if (audit.failed_checks.length !== 0) fail("AG14F failed checks must be zero");
if (audit.decision.workflow_model_valid !== true) fail("Workflow model must be valid");
if (audit.decision.secure_action_handler_required_before_execution !== true) fail("Secure action handler must be required before execution");
if (audit.decision.action_execution_ready !== false) fail("Action execution must remain false");

for (const requirement of [
  "Server-side action handler or trusted backend endpoint.",
  "Role-based authentication for Admin and Editor.",
  "Secret storage outside public repository and browser code.",
  "Action allowlist by role.",
  "Article hash validation before and after action.",
  "Audit-trail write before final state change.",
  "No browser-exposed GitHub token, Supabase service key or deployment secret."
]) {
  if (!handler.required_capabilities_before_action_execution.includes(requirement)) fail(`Missing handler requirement: ${requirement}`);
}

if (handler.status.includes("not_activated") !== true) fail("Handler must not be activated");
if (!handler.blocked_until_ag14g_or_later.includes("Real action endpoint creation.")) fail("Real action endpoint must be blocked");
if (!handler.blocked_until_ag14g_or_later.includes("Publish execution.")) fail("Publish execution must be blocked");

if (matrix.recommended_strategy !== "hybrid_static_github_first_supabase_later") fail("Recommended strategy mismatch");
if (!matrix.options.some((option) => option.option_id === "github_backed_static_action_handler")) fail("GitHub-backed option missing");
if (!matrix.options.some((option) => option.option_id === "supabase_auth_database")) fail("Supabase option missing");
if (!matrix.options.every((option) => option.activation_status === "not_active")) fail("All implementation options must be inactive");

if (!Array.isArray(risk.critical_risks) || risk.critical_risks.length < 6) fail("Risk register must include critical risks");
if (!risk.critical_risks.some((item) => item.risk === "Hardcoded credentials in static files")) fail("Hardcoded credential risk missing");
if (!risk.critical_risks.some((item) => item.risk === "Public visibility switched without Admin approval")) fail("Public visibility risk missing");

if (readiness.ready_for_ag14g !== true) fail("AG14G readiness missing");
if (readiness.action_execution_ready !== false) fail("Action execution must remain blocked");
if (readiness.real_auth_ready !== false) fail("Real auth must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag14g_boundary_created_not_started") fail("AG14G boundary status mismatch");
if (boundary.next_stage_id !== "AG14G") fail("AG14G handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG14G explicit approval missing");

if (schema.status !== "schema_workflow_model_audit_secure_action_handler_readiness_only") fail("Schema status mismatch");

for (const key of [
  "workflow_model_audit_allowed_in_ag14f",
  "secure_action_handler_readiness_allowed_in_ag14f",
  "implementation_matrix_allowed_in_ag14f",
  "risk_control_register_allowed_in_ag14f",
  "ag14g_boundary_allowed_in_ag14f"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "action_handler_creation_allowed_in_ag14f",
  "admin_action_execution_allowed_in_ag14f",
  "editor_action_execution_allowed_in_ag14f",
  "real_credential_creation_allowed_in_ag14f",
  "hardcoded_password_allowed_in_ag14f",
  "password_hash_commit_allowed_in_ag14f",
  "auth_activation_allowed_in_ag14f",
  "backend_activation_allowed_in_ag14f",
  "supabase_activation_allowed_in_ag14f",
  "database_write_allowed_in_ag14f",
  "article_mutation_allowed_in_ag14f",
  "queue_mutation_allowed_in_ag14f",
  "public_visibility_switch_allowed_in_ag14f",
  "public_publishing_operation_allowed_in_ag14f"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, handler, matrix, risk, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.workflow_model_audit_secure_action_handler_readiness_only !== true) fail(`${obj.title || "object"} must be AG14F audit/readiness only`);
  if (obj.action_handler_created_in_ag14f !== false) fail(`${obj.title || "object"} must not create handler`);
  if (obj.admin_action_execution_performed_in_ag14f !== false) fail(`${obj.title || "object"} must not execute Admin action`);
  if (obj.editor_action_execution_performed_in_ag14f !== false) fail(`${obj.title || "object"} must not execute Editor action`);
  if (obj.real_credential_created_in_ag14f !== false) fail(`${obj.title || "object"} must not create credential`);
  if (obj.hardcoded_password_created_in_ag14f !== false) fail(`${obj.title || "object"} must not hardcode password`);
  if (obj.auth_activation_performed_in_ag14f !== false) fail(`${obj.title || "object"} must not activate Auth`);
  if (obj.backend_activation_performed_in_ag14f !== false) fail(`${obj.title || "object"} must not activate backend`);
  if (obj.supabase_activation_performed_in_ag14f !== false) fail(`${obj.title || "object"} must not activate Supabase`);
  if (obj.article_mutation_performed_in_ag14f !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.public_visibility_switch_performed_in_ag14f !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_publishing_operation_performed_in_ag14f !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Audit Result", "Secure Action Handler Requirements", "Recommended Implementation Path", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG14F document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag14f", "validate:ag14f"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag14f")) {
  fail("validate:project must include validate:ag14f");
}

pass("AG14F registry is present.");
pass("AG14F document is present.");
pass("AG14F review, audit report, secure handler readiness, implementation matrix, risk register, readiness, AG14G boundary, schema, learning and preview are present.");
pass("AG14E workflow model is consumed.");
pass("Workflow model audit passed with zero failed checks.");
pass("Secure action handler requirements are defined but not activated.");
pass("Recommended strategy recorded: hybrid static/GitHub first, Supabase/Auth later.");
pass("Critical risk controls are recorded.");
pass("No action handler, credentials, Auth/backend/Supabase activation, Admin/Editor action execution, article mutation, visibility switch or publishing is performed.");
pass("AG14G Secure Action Handler Architecture Plan boundary is created with explicit approval required.");
pass("AG14F is Workflow Model Audit and Secure Action Handler Readiness only.");
