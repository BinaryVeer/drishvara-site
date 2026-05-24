import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag14i-secure-action-handler-non-active-implementation-scaffold.json",
  "data/content-intelligence/apply-records/ag14i-secure-action-handler-non-active-implementation-scaffold-apply.json",
  "data/content-intelligence/admin-architecture/ag14i-non-active-action-handler-scaffold-inventory.json",
  "data/content-intelligence/admin-architecture/ag14i-action-request-response-schema-record.json",
  "data/content-intelligence/quality-registry/ag14i-non-active-handler-guard-record.json",
  "data/content-intelligence/quality-registry/ag14i-non-active-scaffold-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14i-to-ag14j-non-active-scaffold-audit-closure-boundary.json",

  "internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action.non-active.mjs",
  "internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action-request.schema.json",
  "internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action-response.schema.json",
  "internal-scaffolds/ag14i-secure-action-handler-non-active/role-action-allowlist.json",
  "internal-scaffolds/ag14i-secure-action-handler-non-active/README.md",
  "docs/admin/AG14I_NON_ACTIVE_HANDLER_ENVIRONMENT_PLACEHOLDERS.md",

  "data/content-intelligence/quality-reviews/ag14j-secure-action-handler-non-active-scaffold-audit-closure.json",
  "data/content-intelligence/audit-records/ag14j-non-active-scaffold-audit-report.json",
  "data/content-intelligence/closure-records/ag14j-secure-action-handler-non-active-scaffold-closure.json",
  "data/content-intelligence/quality-registry/ag14j-non-active-scaffold-safety-record.json",
  "data/content-intelligence/quality-registry/ag14j-ag14z-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14j-to-ag14z-admin-editor-secure-handler-chain-closure-boundary.json",
  "data/content-intelligence/schema/secure-action-handler-non-active-scaffold-audit-closure.schema.json",
  "data/content-intelligence/learning/ag14j-secure-action-handler-non-active-scaffold-audit-closure-learning.json",
  "data/quality/ag14j-secure-action-handler-non-active-scaffold-audit-closure.json",
  "data/quality/ag14j-secure-action-handler-non-active-scaffold-audit-closure-preview.json",
  "docs/quality/AG14J_SECURE_ACTION_HANDLER_NON_ACTIVE_SCAFFOLD_AUDIT_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG14J validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

if (fs.existsSync(path.join(root, "api/admin-action.js")) || fs.existsSync(path.join(root, "api/admin-action.mjs")) || fs.existsSync(path.join(root, "api/admin-action.ts"))) {
  fail("AG14J must not have a deployable /api/admin-action endpoint");
}

const ag14iReview = readJson("data/content-intelligence/quality-reviews/ag14i-secure-action-handler-non-active-implementation-scaffold.json");
const ag14iReadiness = readJson("data/content-intelligence/quality-registry/ag14i-non-active-scaffold-audit-readiness-record.json");
const ag14iBoundary = readJson("data/content-intelligence/mutation-plans/ag14i-to-ag14j-non-active-scaffold-audit-closure-boundary.json");
const ag14iGuard = readJson("data/content-intelligence/quality-registry/ag14i-non-active-handler-guard-record.json");

const review = readJson("data/content-intelligence/quality-reviews/ag14j-secure-action-handler-non-active-scaffold-audit-closure.json");
const audit = readJson("data/content-intelligence/audit-records/ag14j-non-active-scaffold-audit-report.json");
const closure = readJson("data/content-intelligence/closure-records/ag14j-secure-action-handler-non-active-scaffold-closure.json");
const safety = readJson("data/content-intelligence/quality-registry/ag14j-non-active-scaffold-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag14j-ag14z-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag14j-to-ag14z-admin-editor-secure-handler-chain-closure-boundary.json");
const schema = readJson("data/content-intelligence/schema/secure-action-handler-non-active-scaffold-audit-closure.schema.json");
const learning = readJson("data/content-intelligence/learning/ag14j-secure-action-handler-non-active-scaffold-audit-closure-learning.json");
const registry = readJson("data/quality/ag14j-secure-action-handler-non-active-scaffold-audit-closure.json");
const preview = readJson("data/quality/ag14j-secure-action-handler-non-active-scaffold-audit-closure-preview.json");
const pkg = readJson("package.json");
const docText = readText("docs/quality/AG14J_SECURE_ACTION_HANDLER_NON_ACTIVE_SCAFFOLD_AUDIT_CLOSURE.md");

for (const obj of [review, audit, closure, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG14J") fail(`module_id must be AG14J in ${obj.title || "object"}`);
}

if (ag14iReview.status !== "non_active_implementation_scaffold_created_pending_audit") fail("AG14I review status mismatch");
if (ag14iReadiness.ready_for_ag14j !== true) fail("AG14I readiness for AG14J missing");
if (ag14iBoundary.next_stage_id !== "AG14J") fail("AG14J boundary missing in AG14I");

const handlerText = readText("internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action.non-active.mjs");
if (!handlerText.includes("NON_ACTIVE_SCAFFOLD_ONLY")) fail("Handler must remain non-active");
if (!handlerText.includes("action_execution_enabled: false")) fail("Handler must disable action execution");
if (!handlerText.includes("writes_enabled: false")) fail("Handler must disable writes");
if (!handlerText.includes("publish_enabled: false")) fail("Handler must disable publish");
if (!handlerText.includes("github_write_enabled: false")) fail("Handler must disable GitHub write");
if (/from\s+["']node:fs["']|from\s+["']fs["']|writeFile|appendFile|fetch\(|Octokit|supabase|process\.env|child_process/i.test(handlerText)) {
  fail("Handler contains prohibited runtime text");
}

if (review.status !== "non_active_scaffold_audit_passed_chain_ready_for_ag14z_closure") fail("Review status mismatch");
if (audit.status !== "non_active_scaffold_audit_passed") fail("Audit status mismatch");
if (closure.status !== "non_active_scaffold_audit_passed_chain_ready_for_ag14z_closure") fail("Closure status mismatch");
if (safety.status !== "non_active_scaffold_safe_no_execution_paths") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag14z_admin_editor_secure_handler_chain_closure") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 12) fail("AG14J must include twelve audit checks");
if (audit.failed_checks.length !== 0) fail("AG14J failed checks must be zero");
if (audit.decision.non_active_scaffold_safe !== true) fail("Non-active scaffold must be safe");
if (audit.decision.active_endpoint_present !== false) fail("Active endpoint must be absent");
if (audit.decision.live_action_handler_ready !== false) fail("Live action handler must not be ready");
if (audit.decision.publish_ready !== false) fail("Publishing must not be ready");
if (audit.decision.ready_for_ag14z_chain_closure !== true) fail("AG14Z closure readiness missing");

if (closure.closure_decision.close_ag14i_scaffold !== true) fail("AG14I scaffold closure must be true");
if (closure.closure_decision.proceed_to_ag14z_chain_closure !== true) fail("AG14Z chain closure handoff must be true");
if (closure.closure_decision.proceed_to_live_action_handler !== false) fail("Live action handler must remain blocked");
if (closure.closure_decision.proceed_to_publish_execution !== false) fail("Publish execution must remain blocked");

if (safety.safety_assertions.scaffold_outside_api !== true) fail("Safety must confirm scaffold outside API");
if (safety.safety_assertions.active_api_endpoint_present !== false) fail("Safety must confirm no active endpoint");
if (safety.safety_assertions.action_execution_enabled !== false) fail("Safety must disable action execution");
if (safety.safety_assertions.github_write_enabled !== false) fail("Safety must disable GitHub write");
if (safety.safety_assertions.publish_enabled !== false) fail("Safety must disable publishing");
if (ag14iGuard.guard_assertions.action_execution_enabled !== false) fail("AG14I guard alignment failed");

if (readiness.ready_for_ag14z !== true) fail("AG14Z readiness missing");
if (readiness.live_implementation_ready !== false) fail("Live implementation must remain blocked");
if (readiness.action_execution_ready !== false) fail("Action execution must remain blocked");
if (readiness.real_auth_ready !== false) fail("Real auth must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag14z_boundary_created_not_started") fail("AG14Z boundary status mismatch");
if (boundary.next_stage_id !== "AG14Z") fail("AG14Z handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG14Z explicit approval missing");

if (schema.status !== "schema_secure_action_handler_non_active_scaffold_audit_closure_only") fail("Schema status mismatch");

for (const key of [
  "non_active_scaffold_audit_allowed_in_ag14j",
  "closure_record_allowed_in_ag14j",
  "safety_record_allowed_in_ag14j",
  "ag14z_boundary_allowed_in_ag14j"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "scaffold_file_mutation_allowed_in_ag14j",
  "active_api_endpoint_creation_allowed_in_ag14j",
  "serverless_function_creation_allowed_in_ag14j",
  "action_handler_creation_allowed_in_ag14j",
  "admin_action_execution_allowed_in_ag14j",
  "editor_action_execution_allowed_in_ag14j",
  "real_credential_creation_allowed_in_ag14j",
  "hardcoded_password_allowed_in_ag14j",
  "password_hash_commit_allowed_in_ag14j",
  "auth_activation_allowed_in_ag14j",
  "backend_activation_allowed_in_ag14j",
  "supabase_activation_allowed_in_ag14j",
  "database_write_allowed_in_ag14j",
  "github_token_creation_or_exposure_allowed_in_ag14j",
  "github_write_operation_allowed_in_ag14j",
  "article_mutation_allowed_in_ag14j",
  "queue_mutation_allowed_in_ag14j",
  "audit_write_allowed_in_ag14j",
  "public_visibility_switch_allowed_in_ag14j",
  "public_publishing_operation_allowed_in_ag14j",
  "deployment_trigger_allowed_in_ag14j"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, closure, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.secure_action_handler_non_active_scaffold_audit_closure_only !== true) fail(`${obj.title || "object"} must be AG14J audit/closure only`);
  if (obj.scaffold_file_mutation_performed_in_ag14j !== false) fail(`${obj.title || "object"} must not mutate scaffold files`);
  if (obj.action_handler_created_in_ag14j !== false) fail(`${obj.title || "object"} must not create handler`);
  if (obj.active_api_endpoint_created_in_ag14j !== false) fail(`${obj.title || "object"} must not create endpoint`);
  if (obj.serverless_function_created_in_ag14j !== false) fail(`${obj.title || "object"} must not create function`);
  if (obj.admin_action_execution_performed_in_ag14j !== false) fail(`${obj.title || "object"} must not execute Admin action`);
  if (obj.editor_action_execution_performed_in_ag14j !== false) fail(`${obj.title || "object"} must not execute Editor action`);
  if (obj.real_credential_created_in_ag14j !== false) fail(`${obj.title || "object"} must not create credentials`);
  if (obj.hardcoded_password_created_in_ag14j !== false) fail(`${obj.title || "object"} must not hardcode password`);
  if (obj.auth_activation_performed_in_ag14j !== false) fail(`${obj.title || "object"} must not activate Auth`);
  if (obj.backend_activation_performed_in_ag14j !== false) fail(`${obj.title || "object"} must not activate backend`);
  if (obj.supabase_activation_performed_in_ag14j !== false) fail(`${obj.title || "object"} must not activate Supabase`);
  if (obj.github_write_operation_performed_in_ag14j !== false) fail(`${obj.title || "object"} must not perform GitHub write`);
  if (obj.article_mutation_performed_in_ag14j !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.queue_mutation_performed_in_ag14j !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.audit_write_performed_in_ag14j !== false) fail(`${obj.title || "object"} must not write audit`);
  if (obj.public_visibility_switch_performed_in_ag14j !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_publishing_operation_performed_in_ag14j !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Audit Result", "Closure Decision", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG14J document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag14j", "validate:ag14j"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag14j")) {
  fail("validate:project must include validate:ag14j");
}

pass("AG14J registry is present.");
pass("AG14J document is present.");
pass("AG14J review, audit report, closure, safety, readiness, AG14Z boundary, schema, learning and preview are present.");
pass("AG14I non-active scaffold is consumed.");
pass("Non-active scaffold audit passed with zero failed checks.");
pass("Scaffold remains outside /api and no active endpoint exists.");
pass("Handler remains non-active and cannot execute actions or write files.");
pass("Live action handler, real auth, Supabase activation, GitHub write, queue/article mutation, audit write, visibility switch and publishing remain blocked.");
pass("AG14Z Admin Editor Secure Handler Chain Closure boundary is created with explicit approval required.");
pass("AG14J is Secure Action Handler Non-active Scaffold Audit and Closure only.");
