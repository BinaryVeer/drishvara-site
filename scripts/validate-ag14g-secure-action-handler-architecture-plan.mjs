import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag14f-workflow-model-audit-secure-action-handler-readiness.json",
  "data/content-intelligence/audit-records/ag14f-workflow-model-audit-report.json",
  "data/content-intelligence/admin-architecture/ag14f-secure-action-handler-readiness-requirements.json",
  "data/content-intelligence/admin-architecture/ag14f-action-handler-implementation-path-decision-matrix.json",
  "data/content-intelligence/admin-architecture/ag14f-admin-editor-action-risk-control-register.json",
  "data/content-intelligence/quality-registry/ag14f-secure-action-handler-planning-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14f-to-ag14g-secure-action-handler-architecture-plan-boundary.json",

  "data/content-intelligence/quality-reviews/ag14g-secure-action-handler-architecture-plan.json",
  "data/content-intelligence/admin-architecture/ag14g-secure-action-handler-architecture-plan.json",
  "data/content-intelligence/admin-architecture/ag14g-github-backed-static-action-handler-contract.json",
  "data/content-intelligence/admin-architecture/ag14g-environment-secret-role-access-plan.json",
  "data/content-intelligence/admin-architecture/ag14g-action-execution-sequence-audit-plan.json",
  "data/content-intelligence/quality-registry/ag14g-secure-action-handler-architecture-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14g-to-ag14h-secure-action-handler-architecture-audit-boundary.json",
  "data/content-intelligence/schema/secure-action-handler-architecture-plan.schema.json",
  "data/content-intelligence/learning/ag14g-secure-action-handler-architecture-plan-learning.json",
  "data/quality/ag14g-secure-action-handler-architecture-plan.json",
  "data/quality/ag14g-secure-action-handler-architecture-plan-preview.json",
  "docs/quality/AG14G_SECURE_ACTION_HANDLER_ARCHITECTURE_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG14G validation failed: ${message}`);
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

const ag14fReview = readJson("data/content-intelligence/quality-reviews/ag14f-workflow-model-audit-secure-action-handler-readiness.json");
const ag14fAudit = readJson("data/content-intelligence/audit-records/ag14f-workflow-model-audit-report.json");
const ag14fReadiness = readJson("data/content-intelligence/quality-registry/ag14f-secure-action-handler-planning-readiness-record.json");
const ag14fBoundary = readJson("data/content-intelligence/mutation-plans/ag14f-to-ag14g-secure-action-handler-architecture-plan-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag14g-secure-action-handler-architecture-plan.json");
const architecture = readJson("data/content-intelligence/admin-architecture/ag14g-secure-action-handler-architecture-plan.json");
const githubContract = readJson("data/content-intelligence/admin-architecture/ag14g-github-backed-static-action-handler-contract.json");
const secretsRole = readJson("data/content-intelligence/admin-architecture/ag14g-environment-secret-role-access-plan.json");
const executionAudit = readJson("data/content-intelligence/admin-architecture/ag14g-action-execution-sequence-audit-plan.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag14g-secure-action-handler-architecture-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag14g-to-ag14h-secure-action-handler-architecture-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/secure-action-handler-architecture-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag14g-secure-action-handler-architecture-plan-learning.json");
const registry = readJson("data/quality/ag14g-secure-action-handler-architecture-plan.json");
const preview = readJson("data/quality/ag14g-secure-action-handler-architecture-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG14G_SECURE_ACTION_HANDLER_ARCHITECTURE_PLAN.md"), "utf8");

for (const obj of [review, architecture, githubContract, secretsRole, executionAudit, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG14G") fail(`module_id must be AG14G in ${obj.title || "object"}`);
}

if (ag14fReview.status !== "workflow_model_audit_passed_secure_action_handler_readiness_defined") fail("AG14F review status mismatch");
if (ag14fAudit.failed_checks.length !== 0) fail("AG14F failed checks must be zero");
if (ag14fReadiness.ready_for_ag14g !== true) fail("AG14F readiness for AG14G missing");
if (ag14fBoundary.next_stage_id !== "AG14G") fail("AG14G boundary missing in AG14F");

if (review.status !== "secure_action_handler_architecture_plan_defined_not_implemented") fail("Review status mismatch");
if (architecture.status !== "secure_action_handler_architecture_plan_defined_not_implemented") fail("Architecture status mismatch");
if (githubContract.status !== "github_backed_static_contract_defined_not_activated") fail("GitHub contract status mismatch");
if (secretsRole.status !== "environment_secret_role_access_plan_defined_no_secrets_created") fail("Secrets role plan status mismatch");
if (executionAudit.status !== "action_execution_sequence_audit_plan_defined_not_executable") fail("Execution audit plan status mismatch");
if (readiness.status !== "ready_for_ag14h_secure_action_handler_architecture_audit") fail("Readiness status mismatch");

if (architecture.architecture_strategy !== "hybrid_static_github_first_supabase_later") fail("Architecture strategy mismatch");
if (architecture.planned_handler_boundary.browser_secret_exposure_allowed !== false) fail("Browser secret exposure must be false");
if (!architecture.required_security_layers.includes("Server-side secret storage.")) fail("Server-side secret storage requirement missing");
if (!architecture.required_security_layers.includes("No client-side write token.")) fail("No client-side write token requirement missing");
if (architecture.preserved_future_path.github_backed_static_first !== true) fail("GitHub-backed path must be preserved");
if (architecture.preserved_future_path.supabase_auth_database_later !== true) fail("Supabase later path must be preserved");

if (githubContract.proposed_endpoint_contract.endpoint_placeholder !== "/api/admin-action") fail("Endpoint placeholder mismatch");
if (githubContract.proposed_endpoint_contract.active_in_ag14g !== false) fail("Endpoint must not be active in AG14G");
if (!githubContract.browser_restrictions.includes("Browser must not receive GitHub token.")) fail("Browser GitHub token restriction missing");
if (!githubContract.browser_restrictions.includes("Browser must not write repository files directly.")) fail("Browser repo write restriction missing");

for (const secret of secretsRole.required_environment_secrets_for_future_handler) {
  if (secret.created_in_ag14g !== false) fail(`${secret.name_placeholder} must not be created in AG14G`);
}
if (!secretsRole.role_policy.find((role) => role.role === "admin")?.allowed_actions.includes("publish")) fail("Admin publish role policy missing");
if (!secretsRole.role_policy.find((role) => role.role === "editor")?.blocked_actions.includes("publish")) fail("Editor publish block missing");

if (!Array.isArray(executionAudit.sequence_for_future_admin_or_editor_action) || executionAudit.sequence_for_future_admin_or_editor_action.length !== 10) {
  fail("Execution/audit sequence must have ten steps");
}
for (const step of executionAudit.sequence_for_future_admin_or_editor_action) {
  if (step.server_side_required !== true) fail(`Execution step ${step.name} must be server-side required`);
}
if (!executionAudit.rollback_model.includes("Every action writes pre-action hash.")) fail("Rollback model missing pre-action hash rule");

if (readiness.ready_for_ag14h !== true) fail("AG14H readiness missing");
if (readiness.implementation_ready !== false) fail("Implementation must not be ready in AG14G");
if (readiness.action_execution_ready !== false) fail("Action execution must not be ready");
if (readiness.real_auth_ready !== false) fail("Real auth must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag14h_boundary_created_not_started") fail("AG14H boundary status mismatch");
if (boundary.next_stage_id !== "AG14H") fail("AG14H handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG14H explicit approval missing");

if (schema.status !== "schema_secure_action_handler_architecture_plan_only") fail("Schema status mismatch");

for (const key of [
  "secure_action_handler_architecture_allowed_in_ag14g",
  "github_static_contract_allowed_in_ag14g",
  "environment_secret_role_plan_allowed_in_ag14g",
  "action_execution_audit_plan_allowed_in_ag14g",
  "ag14h_boundary_allowed_in_ag14g"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "action_handler_creation_allowed_in_ag14g",
  "admin_action_execution_allowed_in_ag14g",
  "editor_action_execution_allowed_in_ag14g",
  "real_credential_creation_allowed_in_ag14g",
  "hardcoded_password_allowed_in_ag14g",
  "password_hash_commit_allowed_in_ag14g",
  "auth_activation_allowed_in_ag14g",
  "backend_activation_allowed_in_ag14g",
  "supabase_activation_allowed_in_ag14g",
  "database_write_allowed_in_ag14g",
  "github_token_creation_or_exposure_allowed_in_ag14g",
  "github_write_operation_allowed_in_ag14g",
  "article_mutation_allowed_in_ag14g",
  "queue_mutation_allowed_in_ag14g",
  "public_visibility_switch_allowed_in_ag14g",
  "public_publishing_operation_allowed_in_ag14g",
  "deployment_trigger_allowed_in_ag14g"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, architecture, githubContract, secretsRole, executionAudit, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.secure_action_handler_architecture_plan_only !== true) fail(`${obj.title || "object"} must be AG14G architecture only`);
  if (obj.action_handler_created_in_ag14g !== false) fail(`${obj.title || "object"} must not create handler`);
  if (obj.admin_action_execution_performed_in_ag14g !== false) fail(`${obj.title || "object"} must not execute Admin action`);
  if (obj.editor_action_execution_performed_in_ag14g !== false) fail(`${obj.title || "object"} must not execute Editor action`);
  if (obj.real_credential_created_in_ag14g !== false) fail(`${obj.title || "object"} must not create credentials`);
  if (obj.hardcoded_password_created_in_ag14g !== false) fail(`${obj.title || "object"} must not hardcode password`);
  if (obj.auth_activation_performed_in_ag14g !== false) fail(`${obj.title || "object"} must not activate Auth`);
  if (obj.backend_activation_performed_in_ag14g !== false) fail(`${obj.title || "object"} must not activate backend`);
  if (obj.supabase_activation_performed_in_ag14g !== false) fail(`${obj.title || "object"} must not activate Supabase`);
  if (obj.github_token_created_or_exposed_in_ag14g !== false) fail(`${obj.title || "object"} must not create/expose GitHub token`);
  if (obj.github_write_operation_performed_in_ag14g !== false) fail(`${obj.title || "object"} must not perform GitHub write`);
  if (obj.public_visibility_switch_performed_in_ag14g !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_publishing_operation_performed_in_ag14g !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Recommended Architecture", "Core Requirements", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG14G document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag14g", "validate:ag14g"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag14g")) {
  fail("validate:project must include validate:ag14g");
}

pass("AG14G registry is present.");
pass("AG14G document is present.");
pass("AG14G review, architecture plan, GitHub static contract, secrets/role plan, execution/audit plan, readiness, AG14H boundary, schema, learning and preview are present.");
pass("AG14F readiness is consumed.");
pass("Secure action handler architecture is defined but not implemented.");
pass("GitHub-backed static action-handler contract is defined but not activated.");
pass("Environment secret and role access plan is defined with no secrets created.");
pass("Action execution sequence and audit plan are defined but not executable.");
pass("Hybrid path is preserved: GitHub-backed static first, Supabase/Auth later.");
pass("No handler, credentials, Auth/backend/Supabase activation, GitHub write, Admin/Editor execution, visibility switch or publishing is performed.");
pass("AG14H Secure Action Handler Architecture Audit boundary is created with explicit approval required.");
pass("AG14G is Secure Action Handler Architecture Plan only.");
