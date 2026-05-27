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
  console.error(`❌ AG36A-CONFIRM validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag36a-admin-login-test-package.json",
  "data/content-intelligence/backend-architecture/ag36a-r1-admin-live-auth-wiring-package.json",
  "data/content-intelligence/backend-architecture/ag36b-r1-editor-live-auth-wiring-package.json",
  "data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json",

  "data/content-intelligence/quality-reviews/ag36a-confirm-admin-login-success.json",
  "data/content-intelligence/backend-architecture/ag36a-confirm-admin-login-success.json",
  "data/content-intelligence/backend-architecture/ag36a-admin-login-result-record.json",
  "data/content-intelligence/quality-registry/ag36a-admin-login-confirmation-blocker-register.json",
  "data/content-intelligence/quality-registry/ag36a-confirmed-editor-login-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag36a-confirmed-to-ag36b-manual-editor-login-test-boundary.json",
  "data/quality/ag36a-confirm-admin-login-success.json",
  "data/quality/ag36a-confirm-admin-login-success-preview.json",
  "docs/quality/AG36A_CONFIRM_ADMIN_LOGIN_SUCCESS.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const confirmation = readJson("data/content-intelligence/backend-architecture/ag36a-confirm-admin-login-success.json");
const result = readJson("data/content-intelligence/backend-architecture/ag36a-admin-login-result-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag36a-confirmed-editor-login-test-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag36a-confirmed-to-ag36b-manual-editor-login-test-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag36a-confirm-admin-login-success.json");
const preview = readJson("data/quality/ag36a-confirm-admin-login-success-preview.json");
const pkg = readJson("package.json");

if (confirmation.status !== "admin_login_confirmed_ready_for_editor_login_test") fail("Confirmation status mismatch.");
if (confirmation.confirmation_decision.admin_login_success_confirmed !== true) fail("Admin login confirmation missing.");
if (confirmation.confirmation_decision.admin_protected_page_opened !== true) fail("Admin protected page confirmation missing.");
if (confirmation.confirmation_decision.proceed_to_editor_login_test !== true) fail("Editor readiness missing.");

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
  "publish_action_executed"
]) {
  if (confirmation.confirmation_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (result.status !== "admin_login_success_admin_protected_page_opened") fail("Result status mismatch.");
if (result.protected_page_opened !== true) fail("Protected page flag missing.");
if (result.result_contains_password !== false) fail("Password must not be recorded.");
if (result.result_contains_token !== false) fail("Token must not be recorded.");
if (result.result_contains_cookie !== false) fail("Cookie must not be recorded.");
if (result.result_contains_supabase_key !== false) fail("Supabase key must not be recorded.");
if (result.result_contains_service_role_key !== false) fail("Service-role key must not be recorded.");

if (readiness.ready_for_manual_editor_login_test !== true) fail("Editor login readiness missing.");
if (readiness.next_stage_id !== "AG36B-CONFIRM") fail("Next stage must be AG36B-CONFIRM.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.dynamic_publish_runtime_allowed_next !== false) fail("Dynamic runtime must remain false.");

if (boundary.next_stage_id !== "AG36B-CONFIRM") fail("Boundary must point to AG36B-CONFIRM.");
if (review.summary.admin_login_success_confirmed !== true) fail("Review admin confirmation missing.");
if (review.summary.ready_for_manual_editor_login_test !== true) fail("Review editor readiness missing.");

if (preview.admin_login_success_confirmed !== 1) fail("Preview admin confirmation missing.");
if (preview.ready_for_manual_editor_login_test !== 1) fail("Preview editor readiness missing.");
if (preview.password_recorded !== 0) fail("Preview password must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");

if (!pkg.scripts?.["generate:ag36a-confirm"]) fail("Missing generate:ag36a-confirm script.");
if (!pkg.scripts?.["validate:ag36a-confirm"]) fail("Missing validate:ag36a-confirm script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag36a-confirm")) {
  fail("validate:project must include validate:ag36a-confirm.");
}

pass("AG36A Admin login success confirmation is present.");
pass("Admin protected page result is recorded.");
pass("Editor login test readiness is valid.");
pass("No password, token, key, deployment, public mutation or publish action is recorded.");
