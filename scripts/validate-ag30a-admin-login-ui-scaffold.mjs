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
  console.error(`❌ AG30A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "admin/login.html",
  "data/content-intelligence/backend-architecture/ag30a-admin-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30a-admin-login-interface-model.json",
  "data/content-intelligence/backend-architecture/ag30a-admin-login-route-preview.json",
  "data/content-intelligence/backend-architecture/ag30a-non-auth-ui-behaviour-model.json",
  "data/content-intelligence/quality-registry/ag30a-admin-login-ui-scaffold-blocker-register.json",
  "data/content-intelligence/quality-registry/ag30a-editor-login-ui-scaffold-readiness-record.json",
  "data/content-intelligence/quality-reviews/ag30a-admin-login-ui-scaffold.json",
  "data/quality/ag30a-admin-login-ui-scaffold.json",
  "data/quality/ag30a-admin-login-ui-scaffold-preview.json",
  "docs/quality/AG30A_ADMIN_LOGIN_UI_SCAFFOLD.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const html = readText("admin/login.html");
const pkg = readJson("package.json");

const ag30aReview = readJson("data/content-intelligence/quality-reviews/ag30a-admin-login-ui-scaffold.json");
const ag30aRegistry = readJson("data/quality/ag30a-admin-login-ui-scaffold.json");
const ag30aPreview = readJson("data/quality/ag30a-admin-login-ui-scaffold-preview.json");

const hasLegacyScaffold =
  html.includes("Admin Login UI Scaffold") &&
  html.includes("Non-active scaffold only") &&
  html.includes("AG30A preview only: real Admin login is not active");

const hasAg36aR1Upgrade =
  exists("assets/js/ag36a-admin-live-auth.js") &&
  exists("assets/js/drishvara-auth-local.example.js") &&
  html.includes("Drishvara Admin Login — Controlled Live Auth Test") &&
  html.includes("../assets/js/drishvara-auth-local.js") &&
  html.includes("../assets/js/ag36a-admin-live-auth.js") &&
  html.includes("Sign in as Admin");

if (!hasLegacyScaffold && !hasAg36aR1Upgrade) {
  fail("Admin login page is neither AG30A legacy scaffold nor AG36A-R1 controlled live-auth upgrade.");
}

if (!html.includes("Public mutation: blocked")) fail("Public mutation blocked marker missing.");

if (hasAg36aR1Upgrade) {
  const js = readText("assets/js/ag36a-admin-live-auth.js");
  if (!js.includes("signInWithPassword")) fail("AG36A-R1 upgraded Admin login must use Supabase signInWithPassword.");
  if (!js.includes('.eq("role", "admin")')) fail("AG36A-R1 upgraded Admin login must verify admin role.");
  if (!readText(".gitignore").includes("assets/js/drishvara-auth-local.js")) {
    fail("AG36A-R1 local Auth config must be gitignored.");
  }
}

const forbidden = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "service_role",
  "postgres://",
  "sb_secret",
  "eyJhbGci"
];

for (const token of forbidden) {
  if (html.includes(token)) fail(`Forbidden secret-like marker found in admin/login.html: ${token}`);
}

if (!pkg.scripts?.["validate:ag30a"]) fail("Missing validate:ag30a script.");
if (!pkg.scripts?.["generate:ag30a"]) fail("Missing generate:ag30a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag30a")) {
  fail("validate:project must include validate:ag30a.");
}

if (!String(ag30aReview.status || "").includes("admin_login_ui_scaffold")) fail("AG30A review status mismatch.");
if (!String(ag30aRegistry.status || "").includes("admin_login_ui_scaffold")) fail("AG30A registry status mismatch.");
if (!ag30aPreview) fail("AG30A preview missing.");

pass("AG30A Admin Login UI Scaffold source records are present.");
pass("Admin login page is valid as legacy AG30A scaffold or forward-compatible AG36A-R1 upgrade.");
pass("No service-role key, database secret, deployment or public mutation is enabled.");
pass("AG30A validation remains compatible with controlled AG36A-R1 live-auth wiring.");
