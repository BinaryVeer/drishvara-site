import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function fail(msg) {
  console.error(`❌ AG36Z validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag36a-confirm-admin-login-success.json",
  "data/content-intelligence/backend-architecture/ag36b-confirm-editor-login-success.json",
  "data/content-intelligence/backend-architecture/ag36c-confirm-role-restriction-test.json",
  "data/content-intelligence/backend-architecture/ag36d-login-security-audit.json",
  "data/content-intelligence/quality-registry/ag36d-login-live-test-closure-readiness-record.json",

  "data/content-intelligence/quality-reviews/ag36z-login-live-test-closure.json",
  "data/content-intelligence/backend-architecture/ag36z-login-live-test-closure.json",
  "data/content-intelligence/backend-architecture/ag36z-login-live-test-chain-register.json",
  "data/content-intelligence/backend-architecture/ag36z-admin-editor-login-usability-record.json",
  "data/content-intelligence/backend-architecture/ag36z-post-login-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag36z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag36z-login-live-test-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag36z-dynamic-publish-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag36z-to-ag37a-dynamic-publish-dry-run-boundary.json",
  "data/quality/ag36z-login-live-test-closure.json",
  "data/quality/ag36z-login-live-test-closure-preview.json",
  "docs/quality/AG36Z_LOGIN_LIVE_TEST_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const closure = readJson("data/content-intelligence/backend-architecture/ag36z-login-live-test-closure.json");
const chain = readJson("data/content-intelligence/backend-architecture/ag36z-login-live-test-chain-register.json");
const usability = readJson("data/content-intelligence/backend-architecture/ag36z-admin-editor-login-usability-record.json");
const carryForward = readJson("data/content-intelligence/backend-architecture/ag36z-post-login-blocker-carry-forward.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag36z-dynamic-publish-dry-run-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag36z-to-ag37a-dynamic-publish-dry-run-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag36z-login-live-test-closure.json");
const preview = readJson("data/quality/ag36z-login-live-test-closure-preview.json");
const pkg = readJson("package.json");

const ag36a = readJson("data/content-intelligence/backend-architecture/ag36a-confirm-admin-login-success.json");
const ag36b = readJson("data/content-intelligence/backend-architecture/ag36b-confirm-editor-login-success.json");
const ag36c = readJson("data/content-intelligence/backend-architecture/ag36c-confirm-role-restriction-test.json");
const ag36d = readJson("data/content-intelligence/backend-architecture/ag36d-login-security-audit.json");
const ag36dReadiness = readJson("data/content-intelligence/quality-registry/ag36d-login-live-test-closure-readiness-record.json");

if (ag36a.status !== "admin_login_confirmed_ready_for_editor_login_test") fail("AG36A source mismatch.");
if (ag36b.status !== "editor_login_confirmed_ready_for_role_restriction_test") fail("AG36B source mismatch.");
if (ag36c.status !== "role_restriction_test_confirmed_ready_for_login_security_audit") fail("AG36C source mismatch.");
if (ag36d.status !== "login_security_audit_created_ready_for_ag36z") fail("AG36D source mismatch.");
if (ag36d.audit_decision.all_audits_passed !== true) fail("AG36D audits must pass.");
if (ag36dReadiness.ready_for_ag36z !== true) fail("AG36D readiness must allow AG36Z.");

if (closure.status !== "login_live_test_closure_created_ready_for_ag37a") fail("Closure status mismatch.");
if (closure.closure_decision.ag36_login_live_test_chain_closed !== true) fail("AG36 chain closure missing.");
if (closure.closure_decision.admin_login_usable !== true) fail("Admin login usable missing.");
if (closure.closure_decision.editor_login_usable !== true) fail("Editor login usable missing.");
if (closure.closure_decision.role_restriction_confirmed !== true) fail("Role restriction confirmed missing.");
if (closure.closure_decision.login_security_audit_passed !== true) fail("Login security audit passed missing.");
if (closure.closure_decision.proceed_to_ag37a_dynamic_publish_dry_run !== true) fail("AG37A readiness missing.");

for (const flag of [
  "password_recorded",
  "token_recorded",
  "cookie_recorded",
  "supabase_key_recorded",
  "service_role_key_recorded",
  "service_role_key_exposed",
  "env_vars_recorded",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_created",
  "publish_action_executed"
]) {
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (chain.chain_length !== 4) fail("AG36 chain length must be 4.");
for (const stage of ["AG36A", "AG36B", "AG36C", "AG36D"]) {
  if (!chain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage ${stage}.`);
}
if (chain.closed_successfully !== true) fail("Chain must close successfully.");

if (usability.status !== "admin_editor_login_usable_in_controlled_mode") fail("Usability status mismatch.");
if (usability.admin_user.login_confirmed !== true) fail("Admin login confirmation missing in usability.");
if (usability.editor_user.login_confirmed !== true) fail("Editor login confirmation missing in usability.");
if (usability.editor_user.admin_dashboard_access_blocked !== true) fail("Editor block missing in usability.");
if (usability.role_governance_confirmed.editor_cannot_publish !== true) fail("Editor cannot publish governance missing.");

for (const [key, value] of Object.entries(carryForward.blocked_items)) {
  if (value !== false) fail(`Carry-forward blocker must remain false: ${key}`);
}

if (readiness.ready_for_ag37a !== true) fail("AG37A readiness missing.");
if (readiness.next_stage_id !== "AG37A") fail("Next stage must be AG37A.");
if (readiness.allowed_ag37a_mode !== "dynamic_publish_dry_run_only_against_test_or_non_public_article") fail("AG37A mode mismatch.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service role key must not be required.");

if (boundary.next_stage_id !== "AG37A") fail("Boundary must point to AG37A.");
if (review.summary.ready_for_ag37a !== true) fail("Review AG37A readiness missing.");
if (preview.ready_for_ag37a !== 1) fail("Preview AG37A readiness missing.");
if (preview.password_recorded !== 0) fail("Preview password must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.dynamic_publish_runtime_created !== 0) fail("Preview dynamic runtime must be 0.");
if (preview.publish_action_executed !== 0) fail("Preview publish action must be 0.");

if (!pkg.scripts?.["generate:ag36z"]) fail("Missing generate:ag36z script.");
if (!pkg.scripts?.["validate:ag36z"]) fail("Missing validate:ag36z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag36z")) {
  fail("validate:project must include validate:ag36z.");
}

pass("AG36Z Login Live Test Closure is present.");
pass("AG36 Admin/Editor login live test chain is closed.");
pass("Admin/Editor login is usable in controlled mode.");
pass("AG37A Dynamic Publish Dry-run readiness is valid.");
pass("No password, token, key, deployment, public mutation or publish action is recorded.");
