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
  console.error(`❌ AG36B-CONFIRM validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag36a-confirm-admin-login-success.json",
  "data/content-intelligence/backend-architecture/ag36a-admin-login-result-record.json",
  "data/content-intelligence/quality-registry/ag36a-confirmed-editor-login-test-readiness-record.json",
  "data/content-intelligence/backend-architecture/ag36b-r1-editor-live-auth-wiring-package.json",
  "data/content-intelligence/quality-registry/ag36b-r1-editor-live-auth-test-readiness-record.json",
  "data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json",

  "data/content-intelligence/quality-reviews/ag36b-confirm-editor-login-success.json",
  "data/content-intelligence/backend-architecture/ag36b-confirm-editor-login-success.json",
  "data/content-intelligence/backend-architecture/ag36b-editor-login-result-record.json",
  "data/content-intelligence/backend-architecture/ag36b-editor-rights-verification-record.json",
  "data/content-intelligence/quality-registry/ag36b-editor-login-confirmation-blocker-register.json",
  "data/content-intelligence/quality-registry/ag36b-role-restriction-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag36b-confirmed-to-ag36c-role-restriction-test-boundary.json",
  "data/quality/ag36b-confirm-editor-login-success.json",
  "data/quality/ag36b-confirm-editor-login-success-preview.json",
  "docs/quality/AG36B_CONFIRM_EDITOR_LOGIN_SUCCESS.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const confirmation = readJson("data/content-intelligence/backend-architecture/ag36b-confirm-editor-login-success.json");
const result = readJson("data/content-intelligence/backend-architecture/ag36b-editor-login-result-record.json");
const rights = readJson("data/content-intelligence/backend-architecture/ag36b-editor-rights-verification-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag36b-role-restriction-test-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag36b-confirmed-to-ag36c-role-restriction-test-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag36b-confirm-editor-login-success.json");
const preview = readJson("data/quality/ag36b-confirm-editor-login-success-preview.json");
const pkg = readJson("package.json");

const ag36a = readJson("data/content-intelligence/backend-architecture/ag36a-confirm-admin-login-success.json");
const ag36bR1 = readJson("data/content-intelligence/backend-architecture/ag36b-r1-editor-live-auth-wiring-package.json");

if (ag36a.status !== "admin_login_confirmed_ready_for_editor_login_test") fail("AG36A confirmation source mismatch.");
if (ag36bR1.status !== "editor_live_auth_wiring_package_created_pending_manual_config_and_test") fail("AG36B-R1 source mismatch.");

if (confirmation.status !== "editor_login_confirmed_ready_for_role_restriction_test") fail("Confirmation status mismatch.");
if (confirmation.confirmation_decision.editor_login_success_confirmed !== true) fail("Editor login confirmation missing.");
if (confirmation.confirmation_decision.editor_protected_page_opened !== true) fail("Editor protected page confirmation missing.");
if (confirmation.confirmation_decision.editor_rights_surface_observed !== true) fail("Editor rights observation missing.");
if (confirmation.confirmation_decision.proceed_to_ag36c_role_restriction_test !== true) fail("AG36C readiness missing.");

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

if (result.status !== "editor_login_success_editor_protected_page_opened") fail("Result status mismatch.");
if (result.protected_page_opened !== true) fail("Protected page flag missing.");
if (result.result_contains_password !== false) fail("Password must not be recorded.");
if (result.result_contains_token !== false) fail("Token must not be recorded.");
if (result.result_contains_cookie !== false) fail("Cookie must not be recorded.");
if (result.result_contains_supabase_key !== false) fail("Supabase key must not be recorded.");
if (result.result_contains_service_role_key !== false) fail("Service-role key must not be recorded.");

if (rights.status !== "editor_rights_surface_observed_ready_for_ag36c") fail("Rights status mismatch.");
if (rights.governance_confirmed.editor_assigned_only !== true) fail("Editor assigned-only governance missing.");
if (rights.governance_confirmed.editor_cannot_publish !== true) fail("Editor cannot publish governance missing.");
if (rights.governance_confirmed.editor_cannot_bypass_admin_review !== true) fail("Editor cannot bypass Admin review governance missing.");
if (rights.governance_confirmed.admin_final_clearance_authority !== true) fail("Admin final clearance governance missing.");
if (rights.role_restriction_test_still_required !== true) fail("Role restriction test requirement missing.");

if (readiness.ready_for_ag36c !== true) fail("AG36C readiness missing.");
if (readiness.next_stage_id !== "AG36C") fail("Next stage must be AG36C.");
if (readiness.admin_login_confirmed !== true) fail("Admin login confirmation dependency missing.");
if (readiness.editor_login_confirmed !== true) fail("Editor login confirmation missing.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.dynamic_publish_runtime_allowed_next !== false) fail("Dynamic runtime must remain false.");

if (boundary.next_stage_id !== "AG36C") fail("Boundary must point to AG36C.");
if (review.summary.editor_login_success_confirmed !== true) fail("Review editor confirmation missing.");
if (review.summary.ready_for_ag36c !== true) fail("Review AG36C readiness missing.");

if (preview.editor_login_success_confirmed !== 1) fail("Preview editor confirmation missing.");
if (preview.ready_for_ag36c !== 1) fail("Preview AG36C readiness missing.");
if (preview.password_recorded !== 0) fail("Preview password must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.publish_action_executed !== 0) fail("Preview publish action must be 0.");

if (!pkg.scripts?.["generate:ag36b-confirm"]) fail("Missing generate:ag36b-confirm script.");
if (!pkg.scripts?.["validate:ag36b-confirm"]) fail("Missing validate:ag36b-confirm script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag36b-confirm")) {
  fail("validate:project must include validate:ag36b-confirm.");
}

pass("AG36B Editor login success confirmation is present.");
pass("Editor protected dashboard result is recorded.");
pass("Editor rights surface observation and governance are valid.");
pass("AG36C Role Restriction Test readiness is valid.");
pass("No password, token, key, deployment, public mutation or publish action is recorded.");
