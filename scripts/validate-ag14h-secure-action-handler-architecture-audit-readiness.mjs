import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag14g-secure-action-handler-architecture-plan.json",
  "data/content-intelligence/admin-architecture/ag14g-secure-action-handler-architecture-plan.json",
  "data/content-intelligence/admin-architecture/ag14g-github-backed-static-action-handler-contract.json",
  "data/content-intelligence/admin-architecture/ag14g-environment-secret-role-access-plan.json",
  "data/content-intelligence/admin-architecture/ag14g-action-execution-sequence-audit-plan.json",
  "data/content-intelligence/quality-registry/ag14g-secure-action-handler-architecture-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14g-to-ag14h-secure-action-handler-architecture-audit-boundary.json",

  "data/content-intelligence/quality-reviews/ag14h-secure-action-handler-architecture-audit-readiness.json",
  "data/content-intelligence/audit-records/ag14h-secure-action-handler-architecture-audit-report.json",
  "data/content-intelligence/admin-architecture/ag14h-implementation-readiness-decision-record.json",
  "data/content-intelligence/admin-architecture/ag14h-secure-action-handler-implementation-blocker-register.json",
  "data/content-intelligence/quality-registry/ag14h-non-active-implementation-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14h-to-ag14i-secure-action-handler-non-active-implementation-scaffold-boundary.json",
  "data/content-intelligence/schema/secure-action-handler-architecture-audit-readiness.schema.json",
  "data/content-intelligence/learning/ag14h-secure-action-handler-architecture-audit-readiness-learning.json",
  "data/quality/ag14h-secure-action-handler-architecture-audit-readiness.json",
  "data/quality/ag14h-secure-action-handler-architecture-audit-readiness-preview.json",
  "docs/quality/AG14H_SECURE_ACTION_HANDLER_ARCHITECTURE_AUDIT_READINESS.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG14H validation failed: ${message}`);
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

const ag14gReview = readJson("data/content-intelligence/quality-reviews/ag14g-secure-action-handler-architecture-plan.json");
const ag14gReadiness = readJson("data/content-intelligence/quality-registry/ag14g-secure-action-handler-architecture-readiness-record.json");
const ag14gBoundary = readJson("data/content-intelligence/mutation-plans/ag14g-to-ag14h-secure-action-handler-architecture-audit-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag14h-secure-action-handler-architecture-audit-readiness.json");
const audit = readJson("data/content-intelligence/audit-records/ag14h-secure-action-handler-architecture-audit-report.json");
const decision = readJson("data/content-intelligence/admin-architecture/ag14h-implementation-readiness-decision-record.json");
const blockers = readJson("data/content-intelligence/admin-architecture/ag14h-secure-action-handler-implementation-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag14h-non-active-implementation-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag14h-to-ag14i-secure-action-handler-non-active-implementation-scaffold-boundary.json");
const schema = readJson("data/content-intelligence/schema/secure-action-handler-architecture-audit-readiness.schema.json");
const learning = readJson("data/content-intelligence/learning/ag14h-secure-action-handler-architecture-audit-readiness-learning.json");
const registry = readJson("data/quality/ag14h-secure-action-handler-architecture-audit-readiness.json");
const preview = readJson("data/quality/ag14h-secure-action-handler-architecture-audit-readiness-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG14H_SECURE_ACTION_HANDLER_ARCHITECTURE_AUDIT_READINESS.md"), "utf8");

for (const obj of [review, audit, decision, blockers, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG14H") fail(`module_id must be AG14H in ${obj.title || "object"}`);
}

if (ag14gReview.status !== "secure_action_handler_architecture_plan_defined_not_implemented") fail("AG14G review status mismatch");
if (ag14gReadiness.ready_for_ag14h !== true) fail("AG14G readiness for AG14H missing");
if (ag14gBoundary.next_stage_id !== "AG14H") fail("AG14H boundary missing in AG14G");

if (review.status !== "architecture_audit_passed_non_active_scaffold_ready") fail("Review status mismatch");
if (audit.status !== "architecture_audit_passed_non_active_scaffold_ready") fail("Audit status mismatch");
if (decision.status !== "architecture_audit_passed_non_active_scaffold_ready") fail("Decision status mismatch");
if (blockers.status !== "implementation_blockers_recorded") fail("Blocker register status mismatch");
if (readiness.status !== "ready_for_ag14i_non_active_implementation_scaffold") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 11) fail("AG14H must include eleven audit checks");
if (audit.failed_checks.length !== 0) fail("AG14H failed checks must be zero");
if (audit.decision.architecture_valid !== true) fail("Architecture must be valid");
if (audit.decision.non_active_scaffold_ready !== true) fail("Non-active scaffold must be ready");
if (audit.decision.live_action_handler_ready !== false) fail("Live action handler must not be ready");
if (audit.decision.real_auth_ready !== false) fail("Real auth must not be ready");
if (audit.decision.publish_ready !== false) fail("Publishing must not be ready");

if (decision.decision.proceed_to_non_active_scaffold !== true) fail("Decision must approve non-active scaffold");
if (decision.decision.proceed_to_live_action_handler !== false) fail("Decision must block live action handler");
if (decision.decision.proceed_to_real_auth_activation !== false) fail("Decision must block real auth activation");
if (decision.decision.proceed_to_supabase_activation !== false) fail("Decision must block Supabase activation");
if (decision.decision.proceed_to_publish_execution !== false) fail("Decision must block publish execution");
if (decision.recommended_next_stage !== "AG14I") fail("Recommended next stage must be AG14I");

if (!Array.isArray(blockers.blockers_before_live_action_execution) || blockers.blockers_before_live_action_execution.length < 6) {
  fail("Implementation blocker register must include at least six blockers");
}
if (!blockers.not_allowed_next_without_resolving_blockers.includes("Publish execution.")) fail("Publish execution must remain blocked");
if (!blockers.not_allowed_next_without_resolving_blockers.includes("GitHub write token wiring.")) fail("GitHub write token wiring must remain blocked");
if (!blockers.allowed_next_without_resolving_blockers.includes("Create non-active implementation scaffold.")) fail("Non-active scaffold must be allowed");

if (readiness.ready_for_ag14i !== true) fail("AG14I readiness missing");
if (readiness.non_active_scaffold_ready !== true) fail("Non-active scaffold readiness missing");
if (readiness.live_implementation_ready !== false) fail("Live implementation must remain blocked");
if (readiness.action_execution_ready !== false) fail("Action execution must remain blocked");
if (readiness.real_auth_ready !== false) fail("Real auth must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag14i_boundary_created_not_started") fail("AG14I boundary status mismatch");
if (boundary.next_stage_id !== "AG14I") fail("AG14I handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG14I explicit approval missing");

if (schema.status !== "schema_secure_action_handler_architecture_audit_readiness_only") fail("Schema status mismatch");

for (const key of [
  "architecture_audit_allowed_in_ag14h",
  "implementation_readiness_decision_allowed_in_ag14h",
  "implementation_blocker_register_allowed_in_ag14h",
  "non_active_scaffold_readiness_allowed_in_ag14h",
  "ag14i_boundary_allowed_in_ag14h"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "action_handler_creation_allowed_in_ag14h",
  "serverless_function_creation_allowed_in_ag14h",
  "api_endpoint_creation_allowed_in_ag14h",
  "admin_action_execution_allowed_in_ag14h",
  "editor_action_execution_allowed_in_ag14h",
  "real_credential_creation_allowed_in_ag14h",
  "hardcoded_password_allowed_in_ag14h",
  "password_hash_commit_allowed_in_ag14h",
  "auth_activation_allowed_in_ag14h",
  "backend_activation_allowed_in_ag14h",
  "supabase_activation_allowed_in_ag14h",
  "database_write_allowed_in_ag14h",
  "github_token_creation_or_exposure_allowed_in_ag14h",
  "github_write_operation_allowed_in_ag14h",
  "article_mutation_allowed_in_ag14h",
  "queue_mutation_allowed_in_ag14h",
  "public_visibility_switch_allowed_in_ag14h",
  "public_publishing_operation_allowed_in_ag14h",
  "deployment_trigger_allowed_in_ag14h"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, decision, blockers, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.secure_action_handler_architecture_audit_readiness_only !== true) fail(`${obj.title || "object"} must be AG14H audit/readiness only`);
  if (obj.action_handler_created_in_ag14h !== false) fail(`${obj.title || "object"} must not create handler`);
  if (obj.serverless_function_created_in_ag14h !== false) fail(`${obj.title || "object"} must not create function`);
  if (obj.api_endpoint_created_in_ag14h !== false) fail(`${obj.title || "object"} must not create endpoint`);
  if (obj.admin_action_execution_performed_in_ag14h !== false) fail(`${obj.title || "object"} must not execute Admin action`);
  if (obj.editor_action_execution_performed_in_ag14h !== false) fail(`${obj.title || "object"} must not execute Editor action`);
  if (obj.real_credential_created_in_ag14h !== false) fail(`${obj.title || "object"} must not create credential`);
  if (obj.hardcoded_password_created_in_ag14h !== false) fail(`${obj.title || "object"} must not hardcode password`);
  if (obj.auth_activation_performed_in_ag14h !== false) fail(`${obj.title || "object"} must not activate Auth`);
  if (obj.backend_activation_performed_in_ag14h !== false) fail(`${obj.title || "object"} must not activate backend`);
  if (obj.supabase_activation_performed_in_ag14h !== false) fail(`${obj.title || "object"} must not activate Supabase`);
  if (obj.github_write_operation_performed_in_ag14h !== false) fail(`${obj.title || "object"} must not perform GitHub write`);
  if (obj.article_mutation_performed_in_ag14h !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.queue_mutation_performed_in_ag14h !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.public_visibility_switch_performed_in_ag14h !== false) fail(`${obj.title || "object"} must not switch public visibility`);
  if (obj.public_publishing_operation_performed_in_ag14h !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Audit Result", "Readiness Decision", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG14H document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag14h", "validate:ag14h"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag14h")) {
  fail("validate:project must include validate:ag14h");
}

pass("AG14H registry is present.");
pass("AG14H document is present.");
pass("AG14H review, audit report, decision record, blocker register, readiness, AG14I boundary, schema, learning and preview are present.");
pass("AG14G secure action handler architecture is consumed.");
pass("Architecture audit passed with zero failed checks.");
pass("Decision recorded: proceed only to non-active implementation scaffold.");
pass("Live action handler, real auth, Supabase activation, GitHub write and publish execution remain blocked.");
pass("Implementation blockers are recorded.");
pass("No handler, endpoint, credentials, Auth/backend/Supabase activation, action execution, queue mutation, visibility switch or publishing is performed.");
pass("AG14I Secure Action Handler Non-active Implementation Scaffold boundary is created with explicit approval required.");
pass("AG14H is Secure Action Handler Architecture Audit and Implementation Readiness only.");
