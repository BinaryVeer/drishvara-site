import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readText(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function fail(msg) {
  console.error(`❌ AG30D validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "admin/login.html",
  "editor/login.html",
  "data/content-intelligence/backend-architecture/ag30d-login-ui-audit.json",
  "data/content-intelligence/backend-architecture/ag30d-no-auth-activation-audit-register.json",
  "data/content-intelligence/quality-registry/ag30d-login-ui-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag30d-login-ui-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag30d-to-ag30z-login-ui-closure-boundary.json",
  "data/content-intelligence/quality-reviews/ag30d-login-ui-audit.json",
  "data/quality/ag30d-login-ui-audit.json",
  "data/quality/ag30d-login-ui-audit-preview.json",
  "docs/quality/AG30D_LOGIN_UI_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const adminHtml = readText("admin/login.html");
const editorHtml = readText("editor/login.html");
const pkg = readJson("package.json");

const review = readJson("data/content-intelligence/quality-reviews/ag30d-login-ui-audit.json");
const audit = readJson("data/content-intelligence/backend-architecture/ag30d-login-ui-audit.json");
const noAuth = readJson("data/content-intelligence/backend-architecture/ag30d-no-auth-activation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag30d-login-ui-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag30d-to-ag30z-login-ui-closure-boundary.json");
const registry = readJson("data/quality/ag30d-login-ui-audit.json");

const adminLegacyNonActive =
  adminHtml.includes("Non-active scaffold only") &&
  adminHtml.includes("AG30A preview only: real Admin login is not active.");

const adminAg36aR1Upgrade =
  exists("assets/js/ag36a-admin-live-auth.js") &&
  exists("assets/js/drishvara-auth-local.example.js") &&
  adminHtml.includes("Drishvara Admin Login — Controlled Live Auth Test") &&
  adminHtml.includes("../assets/js/drishvara-auth-local.js") &&
  adminHtml.includes("../assets/js/ag36a-admin-live-auth.js") &&
  adminHtml.includes("Sign in as Admin");

if (!adminLegacyNonActive && !adminAg36aR1Upgrade) {
  fail("admin/login.html missing valid AG30D non-active state or AG36A-R1 controlled upgrade state.");
}

if (!editorHtml.includes("Non-active scaffold only") && !editorHtml.includes("real Editor login is not active")) {
  fail("editor/login.html missing non-active notice.");
}

if (!adminHtml.includes("Public mutation: blocked")) fail("admin/login.html missing public mutation blocked marker.");
if (!editorHtml.includes("Editor publishing: blocked")) fail("editor/login.html missing editor publishing blocked marker.");

if (adminAg36aR1Upgrade) {
  const js = readText("assets/js/ag36a-admin-live-auth.js");
  const gitignore = readText(".gitignore");
  if (!js.includes("signInWithPassword")) fail("AG36A-R1 Admin Auth JS must contain signInWithPassword.");
  if (!js.includes('.eq("role", "admin")')) fail("AG36A-R1 Admin Auth JS must verify admin role.");
  if (!gitignore.includes("assets/js/drishvara-auth-local.js")) fail("AG36A-R1 local config must be gitignored.");
}

const forbidden = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "service_role",
  "postgres://",
  "sb_secret",
  "eyJhbGci"
];

for (const text of [adminHtml, editorHtml]) {
  for (const token of forbidden) {
    if (text.includes(token)) fail(`Forbidden secret-like marker found: ${token}`);
  }
}

if (!String(review.status || "").includes("login_ui_audit")) fail("AG30D review status mismatch.");
if (!String(audit.status || "").includes("login_ui_audit")) fail("AG30D audit status mismatch.");
if (!String(registry.status || "").includes("login_ui_audit")) fail("AG30D registry status mismatch.");
if (!noAuth) fail("AG30D no-auth activation audit missing.");
if (!readiness) fail("AG30D readiness record missing.");
if (boundary.next_stage_id !== "AG30Z") fail("AG30D boundary must point to AG30Z.");

if (!pkg.scripts?.["validate:ag30d"]) fail("Missing validate:ag30d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag30d")) {
  fail("validate:project must include validate:ag30d.");
}

pass("AG30D Login UI Audit source records are present.");
pass("Admin login page is valid as legacy non-active page or AG36A-R1 controlled live-auth upgrade.");
pass("Editor login page remains governed and non-active.");
pass("No service-role key, database secret, deployment or public mutation is enabled.");
