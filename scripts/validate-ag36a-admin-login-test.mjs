import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ADMIN_EMAIL = "dwivedi.vikash.vaibhav@gmail.com";
const EDITOR_EMAIL = "vikash4world@gmail.com";

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function fail(msg) {
  console.error(`❌ AG36A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json",
  "data/content-intelligence/quality-registry/ag35z-ag36-admin-login-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag35z-to-ag36a-admin-login-test-boundary.json",
  "data/content-intelligence/backend-architecture/ag35c-admin-editor-role-verification-record.json",
  "data/content-intelligence/backend-architecture/ag35d-backend-activation-audit.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag36a-admin-login-test.json",
  "data/content-intelligence/backend-architecture/ag36a-admin-login-test-package.json",
  "data/content-intelligence/backend-architecture/ag36a-admin-login-manual-test-guide.json",
  "data/content-intelligence/backend-architecture/ag36a-admin-login-test-checklist.json",
  "data/content-intelligence/backend-architecture/ag36a-non-secret-login-test-audit-register.json",
  "data/content-intelligence/backend-architecture/ag36a-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag36a-admin-login-test-blocker-register.json",
  "data/content-intelligence/quality-registry/ag36a-editor-login-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag36a-to-ag36b-editor-login-test-boundary.json",
  "data/quality/ag36a-admin-login-test.json",
  "data/quality/ag36a-admin-login-test-preview.json",
  "docs/quality/AG36A_ADMIN_LOGIN_TEST.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag36a-admin-login-test.json");
const packageRecord = readJson("data/content-intelligence/backend-architecture/ag36a-admin-login-test-package.json");
const manualGuide = readJson("data/content-intelligence/backend-architecture/ag36a-admin-login-manual-test-guide.json");
const checklist = readJson("data/content-intelligence/backend-architecture/ag36a-admin-login-test-checklist.json");
const nonSecretAudit = readJson("data/content-intelligence/backend-architecture/ag36a-non-secret-login-test-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag36a-editor-login-test-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag36a-to-ag36b-editor-login-test-boundary.json");
const preview = readJson("data/quality/ag36a-admin-login-test-preview.json");
const registry = readJson("data/quality/ag36a-admin-login-test.json");

const ag35z = readJson("data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json");
const ag35zReadiness = readJson("data/content-intelligence/quality-registry/ag35z-ag36-admin-login-test-readiness-record.json");
const ag35zBoundary = readJson("data/content-intelligence/mutation-plans/ag35z-to-ag36a-admin-login-test-boundary.json");
const ag35cRole = readJson("data/content-intelligence/backend-architecture/ag35c-admin-editor-role-verification-record.json");
const ag35d = readJson("data/content-intelligence/backend-architecture/ag35d-backend-activation-audit.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "admin_login_test_package_created_pending_manual_admin_login_result") fail("Review status mismatch.");
if (packageRecord.status !== "admin_login_test_package_created_pending_manual_admin_login_result") fail("Package status mismatch.");
if (packageRecord.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (packageRecord.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (ag35z.status !== "backend_auth_activation_closure_created_ready_for_ag36a") fail("AG35Z source status mismatch.");
if (ag35zReadiness.ready_for_ag36a !== true) fail("AG35Z readiness must allow AG36A.");
if (ag35zBoundary.next_stage_id !== "AG36A") fail("AG35Z boundary must point to AG36A.");
if (ag35cRole.all_role_checks_passed !== true) fail("AG35C role checks must pass.");
if (ag35d.audit_decision.all_audits_passed !== true) fail("AG35D audits must pass.");

if (packageRecord.selected_test_user.admin_email !== ADMIN_EMAIL) fail("Admin email mismatch.");
if (manualGuide.admin_test_email !== ADMIN_EMAIL) fail("Manual guide Admin email mismatch.");
if (readiness.editor_email !== EDITOR_EMAIL) fail("Editor email readiness mismatch.");

if (packageRecord.package_decision.admin_login_test_package_created !== true) fail("Package decision missing.");
if (packageRecord.package_decision.manual_admin_login_test_required !== true) fail("Manual Admin login requirement missing.");
if (packageRecord.package_decision.proceed_to_manual_admin_login_test !== true) fail("Manual test readiness missing.");

for (const flag of [
  "admin_login_test_performed_by_script",
  "password_recorded",
  "token_recorded",
  "supabase_key_recorded",
  "service_role_key_recorded",
  "service_role_key_exposed",
  "env_vars_recorded",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_created"
]) {
  if (packageRecord.package_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (checklist.checklist_items.length < 5) fail("Checklist incomplete.");
if (!checklist.checklist_items.some((item) => item.check_id === "admin_login_success")) fail("Admin login success checklist missing.");
if (!checklist.checklist_items.some((item) => item.check_id === "admin_protected_surface_reachable")) fail("Admin protected surface checklist missing.");

if (nonSecretAudit.audit_passed !== true) fail("Non-secret audit must pass.");
for (const check of nonSecretAudit.checks) {
  if (check.passed !== true) fail(`Non-secret check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag36b_after_manual_confirmation !== true) fail("AG36B readiness missing.");
if (readiness.manual_admin_login_confirmation_required_before_ag36b !== true) fail("Manual confirmation requirement missing.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.dynamic_publish_runtime_allowed_next !== false) fail("Dynamic runtime must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service role key must not be required.");

if (boundary.next_stage_id !== "AG36B") fail("Boundary must point to AG36B.");
if (boundary.manual_admin_login_confirmation_required !== true) fail("Boundary must require Admin login confirmation.");

if (review.summary.admin_email !== ADMIN_EMAIL) fail("Review Admin email mismatch.");
if (review.summary.manual_admin_login_test_pending !== true) fail("Manual login pending summary missing.");
if (review.summary.password_recorded !== false) fail("Review password flag must be false.");
if (review.summary.token_recorded !== false) fail("Review token flag must be false.");
if (review.summary.supabase_key_recorded !== false) fail("Review Supabase key flag must be false.");
if (review.summary.service_role_key_exposed !== false) fail("Review service-role exposure must be false.");
if (review.summary.public_mutation_done !== false) fail("Review public mutation must be false.");

if (preview.admin_login_test_package_created !== 1) fail("Preview package missing.");
if (preview.manual_admin_login_test_pending !== 1) fail("Preview pending flag missing.");
if (preview.password_recorded !== 0) fail("Preview password must be 0.");
if (preview.token_recorded !== 0) fail("Preview token must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");

if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "admin_login_test_package_created_pending_manual_admin_login_result") fail("Registry status mismatch.");

if (!pkg.scripts?.["generate:ag36a"]) fail("Missing generate:ag36a script.");
if (!pkg.scripts?.["validate:ag36a"]) fail("Missing validate:ag36a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag36a")) {
  fail("validate:project must include validate:ag36a.");
}

pass("AG36A Admin Login Test package is present.");
pass("Admin login manual test guide and checklist are valid.");
pass("No passwords, tokens, keys, env vars, deployment or public mutation are recorded.");
pass("AG36B Editor Login Test boundary is ready after manual Admin login confirmation.");
