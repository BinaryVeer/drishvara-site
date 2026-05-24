import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const scaffoldFiles = [
  "internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action.non-active.mjs",
  "internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action-request.schema.json",
  "internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action-response.schema.json",
  "internal-scaffolds/ag14i-secure-action-handler-non-active/role-action-allowlist.json",
  "internal-scaffolds/ag14i-secure-action-handler-non-active/README.md",
  "docs/admin/AG14I_NON_ACTIVE_HANDLER_ENVIRONMENT_PLACEHOLDERS.md"
];

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag14h-secure-action-handler-architecture-audit-readiness.json",
  "data/content-intelligence/audit-records/ag14h-secure-action-handler-architecture-audit-report.json",
  "data/content-intelligence/admin-architecture/ag14h-implementation-readiness-decision-record.json",
  "data/content-intelligence/admin-architecture/ag14h-secure-action-handler-implementation-blocker-register.json",
  "data/content-intelligence/quality-registry/ag14h-non-active-implementation-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14h-to-ag14i-secure-action-handler-non-active-implementation-scaffold-boundary.json",

  ...scaffoldFiles,

  "data/content-intelligence/quality-reviews/ag14i-secure-action-handler-non-active-implementation-scaffold.json",
  "data/content-intelligence/apply-records/ag14i-secure-action-handler-non-active-implementation-scaffold-apply.json",
  "data/content-intelligence/admin-architecture/ag14i-non-active-action-handler-scaffold-inventory.json",
  "data/content-intelligence/admin-architecture/ag14i-action-request-response-schema-record.json",
  "data/content-intelligence/quality-registry/ag14i-non-active-handler-guard-record.json",
  "data/content-intelligence/quality-registry/ag14i-non-active-scaffold-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14i-to-ag14j-non-active-scaffold-audit-closure-boundary.json",
  "data/content-intelligence/schema/secure-action-handler-non-active-implementation-scaffold.schema.json",
  "data/content-intelligence/learning/ag14i-secure-action-handler-non-active-implementation-scaffold-learning.json",
  "data/quality/ag14i-secure-action-handler-non-active-implementation-scaffold.json",
  "data/quality/ag14i-secure-action-handler-non-active-implementation-scaffold-preview.json",
  "docs/quality/AG14I_SECURE_ACTION_HANDLER_NON_ACTIVE_IMPLEMENTATION_SCAFFOLD.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG14I validation failed: ${message}`);
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
  fail("AG14I must not create a deployable /api/admin-action endpoint");
}

const ag14hReview = readJson("data/content-intelligence/quality-reviews/ag14h-secure-action-handler-architecture-audit-readiness.json");
const ag14hAudit = readJson("data/content-intelligence/audit-records/ag14h-secure-action-handler-architecture-audit-report.json");
const ag14hDecision = readJson("data/content-intelligence/admin-architecture/ag14h-implementation-readiness-decision-record.json");
const ag14hReadiness = readJson("data/content-intelligence/quality-registry/ag14h-non-active-implementation-scaffold-readiness-record.json");
const ag14hBoundary = readJson("data/content-intelligence/mutation-plans/ag14h-to-ag14i-secure-action-handler-non-active-implementation-scaffold-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag14i-secure-action-handler-non-active-implementation-scaffold.json");
const apply = readJson("data/content-intelligence/apply-records/ag14i-secure-action-handler-non-active-implementation-scaffold-apply.json");
const inventory = readJson("data/content-intelligence/admin-architecture/ag14i-non-active-action-handler-scaffold-inventory.json");
const schemaRecord = readJson("data/content-intelligence/admin-architecture/ag14i-action-request-response-schema-record.json");
const guard = readJson("data/content-intelligence/quality-registry/ag14i-non-active-handler-guard-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag14i-non-active-scaffold-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag14i-to-ag14j-non-active-scaffold-audit-closure-boundary.json");
const schema = readJson("data/content-intelligence/schema/secure-action-handler-non-active-implementation-scaffold.schema.json");
const learning = readJson("data/content-intelligence/learning/ag14i-secure-action-handler-non-active-implementation-scaffold-learning.json");
const registry = readJson("data/quality/ag14i-secure-action-handler-non-active-implementation-scaffold.json");
const preview = readJson("data/quality/ag14i-secure-action-handler-non-active-implementation-scaffold-preview.json");
const pkg = readJson("package.json");
const docText = readText("docs/quality/AG14I_SECURE_ACTION_HANDLER_NON_ACTIVE_IMPLEMENTATION_SCAFFOLD.md");

for (const obj of [review, apply, inventory, schemaRecord, guard, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG14I") fail(`module_id must be AG14I in ${obj.title || "object"}`);
}

if (ag14hReview.status !== "architecture_audit_passed_non_active_scaffold_ready") fail("AG14H review status mismatch");
if (ag14hAudit.failed_checks.length !== 0) fail("AG14H failed checks must be zero");
if (ag14hDecision.decision.proceed_to_non_active_scaffold !== true) fail("AG14H must approve non-active scaffold");
if (ag14hDecision.decision.proceed_to_live_action_handler !== false) fail("AG14H must block live action handler");
if (ag14hReadiness.ready_for_ag14i !== true) fail("AG14H readiness for AG14I missing");
if (ag14hBoundary.next_stage_id !== "AG14I") fail("AG14I boundary missing in AG14H");

const handlerText = readText("internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action.non-active.mjs");
if (!handlerText.includes("NON_ACTIVE_SCAFFOLD_ONLY")) fail("Handler scaffold must declare NON_ACTIVE_SCAFFOLD_ONLY");
if (!handlerText.includes("action_execution_enabled: false")) fail("Handler scaffold must disable action execution");
if (!handlerText.includes("writes_enabled: false")) fail("Handler scaffold must disable writes");
if (!handlerText.includes("publish_enabled: false")) fail("Handler scaffold must disable publishing");
if (!handlerText.includes("github_write_enabled: false")) fail("Handler scaffold must disable GitHub write");
if (/from\s+["']node:fs["']|from\s+["']fs["']|writeFile|appendFile|fetch\(|Octokit|supabase|process\.env|child_process/i.test(handlerText)) {
  fail("Handler scaffold must not import fs, access env, call fetch, use GitHub/Supabase, or write files");
}

const requestSchema = readJson("internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action-request.schema.json");
const responseSchema = readJson("internal-scaffolds/ag14i-secure-action-handler-non-active/admin-action-response.schema.json");
const allowlist = readJson("internal-scaffolds/ag14i-secure-action-handler-non-active/role-action-allowlist.json");

if (requestSchema.active_endpoint !== false) fail("Request schema must mark active_endpoint false");
if (responseSchema.active_endpoint !== false) fail("Response schema must mark active_endpoint false");
if (responseSchema.fixed_ag14i_response.action_execution_enabled !== false) fail("Response schema must disable action execution");
if (!allowlist.admin.allowed_actions.includes("publish")) fail("Admin allowlist must include publish");
if (allowlist.editor.blocked_actions.includes("publish") !== true) fail("Editor must be blocked from publish");

if (review.status !== "non_active_implementation_scaffold_created_pending_audit") fail("Review status mismatch");
if (apply.status !== "non_active_implementation_scaffold_created_pending_audit") fail("Apply status mismatch");
if (inventory.status !== "non_active_scaffold_files_created") fail("Inventory status mismatch");
if (schemaRecord.status !== "request_response_schema_scaffold_created_non_active") fail("Schema record status mismatch");
if (guard.status !== "non_active_handler_guards_confirmed") fail("Guard status mismatch");
if (readiness.status !== "ready_for_ag14j_non_active_scaffold_audit_closure") fail("Readiness status mismatch");

if (inventory.handler_file_intentionally_outside_api !== true) fail("Handler must be intentionally outside API");
if (inventory.no_active_endpoint_created !== true) fail("Inventory must confirm no active endpoint");
if (inventory.no_serverless_function_created !== true) fail("Inventory must confirm no serverless function");
if (inventory.files.length !== 6) fail("Inventory must record six scaffold/doc files");

if (guard.guard_assertions.action_execution_enabled !== false) fail("Guard must disable action execution");
if (guard.guard_assertions.writes_enabled !== false) fail("Guard must disable writes");
if (guard.guard_assertions.publish_enabled !== false) fail("Guard must disable publish");
if (guard.guard_assertions.github_write_enabled !== false) fail("Guard must disable GitHub write");

if (readiness.ready_for_ag14j !== true) fail("AG14J readiness missing");
if (readiness.active_handler_ready !== false) fail("Active handler must remain blocked");
if (readiness.action_execution_ready !== false) fail("Action execution must remain blocked");
if (readiness.real_auth_ready !== false) fail("Real auth must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag14j_boundary_created_not_started") fail("AG14J boundary status mismatch");
if (boundary.next_stage_id !== "AG14J") fail("AG14J handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG14J explicit approval missing");

if (schema.status !== "schema_secure_action_handler_non_active_implementation_scaffold_only") fail("Schema status mismatch");

for (const key of [
  "non_active_scaffold_file_creation_allowed_in_ag14i",
  "request_response_schema_creation_allowed_in_ag14i",
  "role_allowlist_scaffold_creation_allowed_in_ag14i",
  "environment_placeholder_documentation_allowed_in_ag14i",
  "ag14j_boundary_allowed_in_ag14i"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "active_api_endpoint_creation_allowed_in_ag14i",
  "serverless_function_creation_allowed_in_ag14i",
  "action_handler_creation_allowed_in_ag14i",
  "admin_action_execution_allowed_in_ag14i",
  "editor_action_execution_allowed_in_ag14i",
  "real_credential_creation_allowed_in_ag14i",
  "hardcoded_password_allowed_in_ag14i",
  "password_hash_commit_allowed_in_ag14i",
  "auth_activation_allowed_in_ag14i",
  "backend_activation_allowed_in_ag14i",
  "supabase_activation_allowed_in_ag14i",
  "database_write_allowed_in_ag14i",
  "github_token_creation_or_exposure_allowed_in_ag14i",
  "github_write_operation_allowed_in_ag14i",
  "article_mutation_allowed_in_ag14i",
  "queue_mutation_allowed_in_ag14i",
  "audit_write_allowed_in_ag14i",
  "public_visibility_switch_allowed_in_ag14i",
  "public_publishing_operation_allowed_in_ag14i",
  "deployment_trigger_allowed_in_ag14i"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, apply, inventory, schemaRecord, guard, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.secure_action_handler_non_active_implementation_scaffold_only !== true) fail(`${obj.title || "object"} must be AG14I non-active scaffold only`);
  if (obj.action_handler_created_in_ag14i !== false) fail(`${obj.title || "object"} must not create active handler`);
  if (obj.active_api_endpoint_created_in_ag14i !== false) fail(`${obj.title || "object"} must not create active endpoint`);
  if (obj.serverless_function_created_in_ag14i !== false) fail(`${obj.title || "object"} must not create serverless function`);
  if (obj.admin_action_execution_performed_in_ag14i !== false) fail(`${obj.title || "object"} must not execute Admin action`);
  if (obj.editor_action_execution_performed_in_ag14i !== false) fail(`${obj.title || "object"} must not execute Editor action`);
  if (obj.real_credential_created_in_ag14i !== false) fail(`${obj.title || "object"} must not create credentials`);
  if (obj.hardcoded_password_created_in_ag14i !== false) fail(`${obj.title || "object"} must not hardcode password`);
  if (obj.auth_activation_performed_in_ag14i !== false) fail(`${obj.title || "object"} must not activate Auth`);
  if (obj.backend_activation_performed_in_ag14i !== false) fail(`${obj.title || "object"} must not activate backend`);
  if (obj.supabase_activation_performed_in_ag14i !== false) fail(`${obj.title || "object"} must not activate Supabase`);
  if (obj.github_write_operation_performed_in_ag14i !== false) fail(`${obj.title || "object"} must not perform GitHub write`);
  if (obj.article_mutation_performed_in_ag14i !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.queue_mutation_performed_in_ag14i !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.audit_write_performed_in_ag14i !== false) fail(`${obj.title || "object"} must not write audit`);
  if (obj.public_visibility_switch_performed_in_ag14i !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_publishing_operation_performed_in_ag14i !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Scaffold Location", "Created Scaffold Files", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG14I document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag14i", "validate:ag14i"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag14i")) {
  fail("validate:project must include validate:ag14i");
}

pass("AG14I registry is present.");
pass("AG14I document is present.");
pass("AG14I review, apply record, scaffold inventory, schema record, guard record, readiness, AG14J boundary, schema, learning and preview are present.");
pass("AG14H readiness is consumed.");
pass("Non-active scaffold files are created outside /api.");
pass("Request/response schemas and role allowlist scaffold are created.");
pass("Handler scaffold is non-active and cannot execute actions or write files.");
pass("No active endpoint, credentials, Auth/backend/Supabase activation, GitHub write, queue/article mutation, audit write, visibility switch or publishing is performed.");
pass("AG14J non-active scaffold audit closure boundary is created with explicit approval required.");
pass("AG14I is Secure Action Handler Non-active Implementation Scaffold only.");
