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
  console.error(`❌ AG36B-R1 validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "editor/login.html",
  "assets/js/ag36b-editor-live-auth.js",
  "assets/js/drishvara-auth-local.example.js",
  ".gitignore",
  "data/content-intelligence/quality-reviews/ag36b-r1-editor-live-auth-wiring.json",
  "data/content-intelligence/backend-architecture/ag36b-r1-editor-live-auth-wiring-package.json",
  "data/content-intelligence/backend-architecture/ag36b-r1-editor-live-auth-wiring-record.json",
  "data/content-intelligence/backend-architecture/ag36b-r1-local-auth-config-guide.json",
  "data/content-intelligence/backend-architecture/ag36b-r1-non-secret-wiring-audit-register.json",
  "data/content-intelligence/quality-registry/ag36b-r1-editor-live-auth-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag36b-r1-to-ag36b-manual-editor-login-confirmation-boundary.json",
  "data/quality/ag36b-r1-editor-live-auth-wiring.json",
  "data/quality/ag36b-r1-editor-live-auth-wiring-preview.json",
  "docs/quality/AG36B_R1_EDITOR_LIVE_AUTH_WIRING.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const html = readText("editor/login.html");
const js = readText("assets/js/ag36b-editor-live-auth.js");
const gitignore = readText(".gitignore");

const review = readJson("data/content-intelligence/quality-reviews/ag36b-r1-editor-live-auth-wiring.json");
const packageRecord = readJson("data/content-intelligence/backend-architecture/ag36b-r1-editor-live-auth-wiring-package.json");
const wiringRecord = readJson("data/content-intelligence/backend-architecture/ag36b-r1-editor-live-auth-wiring-record.json");
const nonSecretAudit = readJson("data/content-intelligence/backend-architecture/ag36b-r1-non-secret-wiring-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag36b-r1-editor-live-auth-test-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag36b-r1-to-ag36b-manual-editor-login-confirmation-boundary.json");
const preview = readJson("data/quality/ag36b-r1-editor-live-auth-wiring-preview.json");
const pkg = readJson("package.json");

if (!html.includes("../assets/js/drishvara-auth-local.js")) fail("editor/login.html must load gitignored local config.");
if (!html.includes("../assets/js/ag36b-editor-live-auth.js")) fail("editor/login.html must load AG36B live auth JS.");
if (!html.includes("@supabase/supabase-js@2")) fail("editor/login.html must load Supabase browser library.");
if (html.includes("AG30B preview only: real Editor login is not active")) fail("Old AG30B alert must be removed.");
if (!html.includes("Sign in as Editor")) fail("Editor sign-in button missing.");

if (!js.includes("signInWithPassword")) fail("Editor live Auth JS must call signInWithPassword.");
if (!js.includes('.from("profiles")')) fail("Editor live Auth JS must verify profiles table.");
if (!js.includes('.eq("role", "editor")')) fail("Editor live Auth JS must verify editor role.");
if (!js.includes("editor-dashboard.html")) fail("Editor success path missing.");
if (!gitignore.includes("assets/js/drishvara-auth-local.js")) fail("Local config must be gitignored.");

const forbiddenExact = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "service_role",
  "eyJhbGci",
  "sb_secret",
  "postgres://"
];

for (const text of [html, js]) {
  for (const forbidden of forbiddenExact) {
    if (text.includes(forbidden)) fail(`Forbidden string found: ${forbidden}`);
  }
}

if (review.status !== "editor_live_auth_wiring_package_created_pending_manual_config_and_test") fail("Review status mismatch.");
if (packageRecord.status !== "editor_live_auth_wiring_package_created_pending_manual_config_and_test") fail("Package status mismatch.");
if (wiringRecord.live_auth_scope.editor_login_page_wired_to_supabase_browser_client !== true) fail("Wiring scope missing.");
if (wiringRecord.live_auth_scope.editor_profile_role_verification_enabled !== true) fail("Editor profile role verification missing.");
if (wiringRecord.live_auth_scope.editor_assigned_only_governance_preserved !== true) fail("Editor assigned-only governance missing.");
if (wiringRecord.live_auth_scope.editor_no_publish_governance_preserved !== true) fail("Editor no-publish governance missing.");
if (wiringRecord.live_auth_scope.service_role_key_required !== false) fail("Service-role key must not be required.");
if (wiringRecord.live_auth_scope.local_config_committed !== false) fail("Local config must not be committed.");

if (nonSecretAudit.audit_passed !== true) fail("Non-secret audit must pass.");
for (const check of nonSecretAudit.checks) {
  if (check.passed !== true) fail(`Non-secret audit failed: ${check.check_id}`);
}

if (readiness.ready_for_manual_editor_login_test !== true) fail("Manual editor login readiness missing.");
if (boundary.next_stage_id !== "AG36B-CONFIRM") fail("Boundary must point to AG36B-CONFIRM.");

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

if (!pkg.scripts?.["generate:ag36b-r1"]) fail("Missing generate:ag36b-r1 script.");
if (!pkg.scripts?.["validate:ag36b-r1"]) fail("Missing validate:ag36b-r1 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag36b-r1")) {
  fail("validate:project must include validate:ag36b-r1.");
}

pass("AG36B-R1 Editor live Auth wiring is present.");
pass("Editor login page is wired to Supabase browser Auth with profile-role verification.");
pass("Shared local Auth config is gitignored and no secrets/keys are committed.");
pass("Manual Editor login test is ready after local config is created.");
