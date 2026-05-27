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
  console.error(`❌ AG36C-CONFIRM validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag36c-r1-route-guard-wiring-package.json",
  "data/content-intelligence/backend-architecture/ag36c-r1-admin-editor-route-guard-record.json",
  "data/content-intelligence/quality-registry/ag36c-r1-role-restriction-manual-test-readiness-record.json",
  "data/content-intelligence/backend-architecture/ag36b-confirm-editor-login-success.json",
  "data/content-intelligence/quality-registry/ag36b-role-restriction-test-readiness-record.json",
  "data/content-intelligence/backend-architecture/ag36a-confirm-admin-login-success.json",

  "data/content-intelligence/quality-reviews/ag36c-confirm-role-restriction-test.json",
  "data/content-intelligence/backend-architecture/ag36c-confirm-role-restriction-test.json",
  "data/content-intelligence/backend-architecture/ag36c-role-restriction-test-result-record.json",
  "data/content-intelligence/backend-architecture/ag36c-admin-route-access-verification-record.json",
  "data/content-intelligence/backend-architecture/ag36c-editor-admin-route-block-verification-record.json",
  "data/content-intelligence/quality-registry/ag36c-role-restriction-confirmation-blocker-register.json",
  "data/content-intelligence/quality-registry/ag36c-login-security-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag36c-confirmed-to-ag36d-login-security-audit-boundary.json",
  "data/quality/ag36c-confirm-role-restriction-test.json",
  "data/quality/ag36c-confirm-role-restriction-test-preview.json",
  "docs/quality/AG36C_CONFIRM_ROLE_RESTRICTION_TEST.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const confirmation = readJson("data/content-intelligence/backend-architecture/ag36c-confirm-role-restriction-test.json");
const result = readJson("data/content-intelligence/backend-architecture/ag36c-role-restriction-test-result-record.json");
const adminAccess = readJson("data/content-intelligence/backend-architecture/ag36c-admin-route-access-verification-record.json");
const editorBlock = readJson("data/content-intelligence/backend-architecture/ag36c-editor-admin-route-block-verification-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag36c-login-security-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag36c-confirmed-to-ag36d-login-security-audit-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag36c-confirm-role-restriction-test.json");
const preview = readJson("data/quality/ag36c-confirm-role-restriction-test-preview.json");
const pkg = readJson("package.json");

const ag36cR1 = readJson("data/content-intelligence/backend-architecture/ag36c-r1-route-guard-wiring-package.json");
const ag36b = readJson("data/content-intelligence/backend-architecture/ag36b-confirm-editor-login-success.json");

if (ag36cR1.status !== "route_guard_wiring_created_ready_for_manual_role_restriction_test") fail("AG36C-R1 source mismatch.");
if (ag36b.status !== "editor_login_confirmed_ready_for_role_restriction_test") fail("AG36B source mismatch.");

if (confirmation.status !== "role_restriction_test_confirmed_ready_for_login_security_audit") fail("Confirmation status mismatch.");
if (confirmation.confirmation_decision.role_restriction_test_confirmed !== true) fail("Role restriction confirmation missing.");
if (confirmation.confirmation_decision.editor_admin_dashboard_blocked !== true) fail("Editor block confirmation missing.");
if (confirmation.confirmation_decision.admin_admin_dashboard_allowed !== true) fail("Admin access confirmation missing.");
if (confirmation.confirmation_decision.route_guard_operational !== true) fail("Route guard operational confirmation missing.");
if (confirmation.confirmation_decision.proceed_to_ag36d_login_security_audit !== true) fail("AG36D readiness missing.");

for (const flag of [
  "password_recorded_in_repo",
  "token_recorded_in_repo",
  "cookie_recorded_in_repo",
  "supabase_key_recorded_in_repo",
  "service_role_key_recorded_in_repo",
  "service_role_key_exposed",
  "env_vars_recorded_in_repo",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_created",
  "publish_action_executed",
  "admin_action_bypassed"
]) {
  if (confirmation.confirmation_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (result.status !== "role_restriction_test_passed") fail("Result status mismatch.");
if (result.all_role_restriction_checks_passed !== true) fail("All role restriction checks must pass.");
for (const test of result.test_results) {
  if (test.passed !== true) fail(`Role restriction test failed: ${test.test_id}`);
}

if (editorBlock.status !== "editor_blocked_from_admin_dashboard") fail("Editor block status mismatch.");
if (editorBlock.verification_passed !== true) fail("Editor block verification must pass.");
if (adminAccess.status !== "admin_allowed_to_access_admin_dashboard") fail("Admin access status mismatch.");
if (adminAccess.verification_passed !== true) fail("Admin access verification must pass.");

if (readiness.ready_for_ag36d !== true) fail("AG36D readiness missing.");
if (readiness.next_stage_id !== "AG36D") fail("Next stage must be AG36D.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.dynamic_publish_runtime_allowed_next !== false) fail("Dynamic runtime must remain false.");

if (boundary.next_stage_id !== "AG36D") fail("Boundary must point to AG36D.");
if (review.summary.role_restriction_test_confirmed !== true) fail("Review role restriction summary missing.");
if (review.summary.ready_for_ag36d !== true) fail("Review AG36D readiness missing.");

if (preview.role_restriction_test_confirmed !== 1) fail("Preview confirmation missing.");
if (preview.editor_admin_dashboard_blocked !== 1) fail("Preview editor block missing.");
if (preview.admin_admin_dashboard_allowed !== 1) fail("Preview admin access missing.");
if (preview.ready_for_ag36d !== 1) fail("Preview AG36D readiness missing.");
if (preview.password_recorded !== 0) fail("Preview password must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.publish_action_executed !== 0) fail("Preview publish action must be 0.");

if (!pkg.scripts?.["generate:ag36c-confirm"]) fail("Missing generate:ag36c-confirm script.");
if (!pkg.scripts?.["validate:ag36c-confirm"]) fail("Missing validate:ag36c-confirm script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag36c-confirm")) {
  fail("validate:project must include validate:ag36c-confirm.");
}

pass("AG36C role restriction confirmation is present.");
pass("Editor admin-dashboard block and Admin admin-dashboard access are recorded.");
pass("Role restriction test passed and AG36D readiness is valid.");
pass("No password, token, key, deployment, public mutation or publish action is recorded.");
