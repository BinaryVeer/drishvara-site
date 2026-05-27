import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function readText(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

function fail(msg) {
  console.error(`❌ AG36A-R1 validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "admin/login.html",
  "assets/js/ag36a-admin-live-auth.js",
  "assets/js/drishvara-auth-local.example.js",
  ".gitignore",
  "data/content-intelligence/quality-reviews/ag36a-r1-admin-live-auth-wiring.json",
  "data/content-intelligence/backend-architecture/ag36a-r1-admin-live-auth-wiring-package.json",
  "data/content-intelligence/backend-architecture/ag36a-r1-admin-live-auth-wiring-record.json",
  "data/content-intelligence/backend-architecture/ag36a-r1-local-auth-config-guide.json",
  "data/content-intelligence/backend-architecture/ag36a-r1-non-secret-wiring-audit-register.json",
  "data/content-intelligence/quality-registry/ag36a-r1-admin-live-auth-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag36a-r1-to-ag36a-manual-admin-login-confirmation-boundary.json",
  "data/quality/ag36a-r1-admin-live-auth-wiring.json",
  "data/quality/ag36a-r1-admin-live-auth-wiring-preview.json",
  "docs/quality/AG36A_R1_ADMIN_LIVE_AUTH_WIRING.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const html = readText("admin/login.html");
const js = readText("assets/js/ag36a-admin-live-auth.js");
const template = readText("assets/js/drishvara-auth-local.example.js");
const gitignore = readText(".gitignore");

const review = readJson("data/content-intelligence/quality-reviews/ag36a-r1-admin-live-auth-wiring.json");
const packageRecord = readJson("data/content-intelligence/backend-architecture/ag36a-r1-admin-live-auth-wiring-package.json");
const wiringRecord = readJson("data/content-intelligence/backend-architecture/ag36a-r1-admin-live-auth-wiring-record.json");
const nonSecretAudit = readJson("data/content-intelligence/backend-architecture/ag36a-r1-non-secret-wiring-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag36a-r1-admin-live-auth-test-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag36a-r1-to-ag36a-manual-admin-login-confirmation-boundary.json");
const preview = readJson("data/quality/ag36a-r1-admin-live-auth-wiring-preview.json");
const pkg = readJson("package.json");

if (!html.includes("../assets/js/drishvara-auth-local.js")) fail("admin/login.html must load gitignored local config.");
if (!html.includes("../assets/js/ag36a-admin-live-auth.js")) fail("admin/login.html must load AG36A live auth JS.");
if (!html.includes("@supabase/supabase-js@2")) fail("admin/login.html must load Supabase browser library.");
if (html.includes("AG30A preview only: real Admin login is not active")) fail("Old AG30A alert must be removed.");
if (!html.includes("Sign in as Admin")) fail("Admin sign-in button missing.");

if (!js.includes("signInWithPassword")) fail("Live Auth JS must call signInWithPassword.");
if (!js.includes('.from("profiles")')) fail("Live Auth JS must verify profiles table.");
if (!js.includes('.eq("role", "admin")')) fail("Live Auth JS must verify admin role.");
if (!js.includes("admin-dashboard.html")) fail("Admin success path missing.");

if (!template.includes("PASTE_SUPABASE_PROJECT_URL_HERE")) fail("Template must contain project URL placeholder.");
if (!template.includes("PASTE_SUPABASE_ANON_PUBLIC_KEY_HERE")) fail("Template must contain anon key placeholder.");
if (!gitignore.includes("assets/js/drishvara-auth-local.js")) fail("Local config must be gitignored.");

const forbiddenExact = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "service_role",
  "eyJhbGci",
  "sb_secret",
  "postgres://"
];

for (const text of [html, js, template]) {
  for (const forbidden of forbiddenExact) {
    if (text.includes(forbidden)) fail(`Forbidden string found: ${forbidden}`);
  }
}

if (review.status !== "admin_live_auth_wiring_package_created_pending_manual_config_and_test") fail("Review status mismatch.");
if (packageRecord.status !== "admin_live_auth_wiring_package_created_pending_manual_config_and_test") fail("Package status mismatch.");
if (wiringRecord.live_auth_scope.admin_login_page_wired_to_supabase_browser_client !== true) fail("Wiring scope missing.");
if (wiringRecord.live_auth_scope.service_role_key_required !== false) fail("Service-role key must not be required.");
if (wiringRecord.live_auth_scope.local_config_committed !== false) fail("Local config must not be committed.");

if (nonSecretAudit.audit_passed !== true) fail("Non-secret audit must pass.");
for (const check of nonSecretAudit.checks) {
  if (check.passed !== true) fail(`Non-secret audit failed: ${check.check_id}`);
}

if (readiness.ready_for_manual_admin_login_test !== true) fail("Manual login readiness missing.");
if (boundary.next_stage_id !== "AG36A-CONFIRM") fail("Boundary must point to AG36A-CONFIRM.");

for (const flag of [
  "local_config_committed",
  "password_recorded",
  "token_recorded",
  "supabase_key_recorded",
  "service_role_key_exposed",
  "deployment_done",
  "public_mutation_done"
]) {
  if (review.summary[flag] !== false) fail(`${flag} must be false.`);
}

if (preview.local_config_committed !== 0) fail("Preview local config committed must be 0.");
if (preview.password_recorded !== 0) fail("Preview password must be 0.");
if (preview.token_recorded !== 0) fail("Preview token must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag36a-r1"]) fail("Missing generate:ag36a-r1 script.");
if (!pkg.scripts?.["validate:ag36a-r1"]) fail("Missing validate:ag36a-r1 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag36a-r1")) {
  fail("validate:project must include validate:ag36a-r1.");
}

pass("AG36A-R1 Admin live Auth wiring is present.");
pass("Admin login page is wired to Supabase browser Auth with profile-role verification.");
pass("Local Auth config is gitignored and no secrets/keys are committed.");
pass("Manual Admin login test is ready after local config is created.");
