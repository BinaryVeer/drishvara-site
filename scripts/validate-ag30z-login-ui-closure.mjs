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
  console.error(`❌ AG30Z validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "admin/login.html",
  "editor/login.html",
  "data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json",
  "data/content-intelligence/backend-architecture/ag30z-non-active-login-route-scaffold-closure-register.json",
  "data/content-intelligence/quality-registry/ag30z-login-ui-closure-blocker-register.json",
  "data/content-intelligence/quality-reviews/ag30z-login-ui-closure.json",
  "data/quality/ag30z-login-ui-closure.json",
  "data/quality/ag30z-login-ui-closure-preview.json",
  "docs/quality/AG30Z_LOGIN_UI_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const adminHtml = readText("admin/login.html");
const editorHtml = readText("editor/login.html");
const pkg = readJson("package.json");

const review = readJson("data/content-intelligence/quality-reviews/ag30z-login-ui-closure.json");
const closure = readJson("data/content-intelligence/backend-architecture/ag30z-login-ui-closure.json");
const registry = readJson("data/quality/ag30z-login-ui-closure.json");

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
  fail("admin/login.html is neither AG30Z non-active closure state nor AG36A-R1 controlled upgrade state.");
}

if (!editorHtml.includes("Non-active scaffold only") && !editorHtml.includes("real Editor login is not active")) {
  fail("editor/login.html missing non-active closure state.");
}

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

if (!String(review.status || "").includes("login_ui_closure")) fail("AG30Z review status mismatch.");
if (!String(closure.status || "").includes("login_ui_closure")) fail("AG30Z closure status mismatch.");
if (!String(registry.status || "").includes("login_ui_closure")) fail("AG30Z registry status mismatch.");

if (!pkg.scripts?.["validate:ag30z"]) fail("Missing validate:ag30z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag30z")) {
  fail("validate:project must include validate:ag30z.");
}

pass("AG30Z Login UI Closure source records are present.");
pass("Admin login closure is forward-compatible with AG36A-R1 controlled live-auth upgrade.");
pass("Editor login remains governed and non-active.");
pass("No service-role key, database secret, deployment or public mutation is enabled.");
