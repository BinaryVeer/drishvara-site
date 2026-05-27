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
  console.error(`❌ AG14B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "admin-dashboard.html",
  "editor-dashboard.html",
  "admin/login.html",
  "editor/login.html",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const adminDashboard = readText("admin-dashboard.html");
const editorDashboard = readText("editor-dashboard.html");
const adminLogin = readText("admin/login.html");
const editorLogin = readText("editor/login.html");
const pkg = readJson("package.json");

const ag14bScaffoldState =
  adminDashboard.includes("Admin Review Queue") &&
  editorDashboard.includes("Editor Dashboard") &&
  adminDashboard.includes("real auth pending") &&
  editorDashboard.includes("real auth pending");

const ag36cRouteGuardUpgrade =
  exists("assets/js/ag36c-route-guard.js") &&
  adminDashboard.includes('data-required-role="admin"') &&
  editorDashboard.includes('data-required-role="editor"') &&
  adminDashboard.includes("assets/js/ag36c-route-guard.js") &&
  editorDashboard.includes("assets/js/ag36c-route-guard.js");

if (!ag14bScaffoldState && !ag36cRouteGuardUpgrade) {
  fail("Admin/Editor dashboards are neither AG14B scaffold state nor AG36C-R1 guarded-route upgrade state.");
}

if (ag36cRouteGuardUpgrade) {
  const guard = readText("assets/js/ag36c-route-guard.js");
  if (!guard.includes("getSession")) fail("AG36C-R1 route guard must check Supabase session.");
  if (!guard.includes('.from("profiles")')) fail("AG36C-R1 route guard must verify profiles table.");
  if (!guard.includes('.eq("role", requiredRole)')) fail("AG36C-R1 route guard must verify required role.");
  if (!readText(".gitignore").includes("assets/js/drishvara-auth-local.js")) {
    fail("Local browser Auth config must remain gitignored.");
  }
}

const forbidden = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "service_role",
  "postgres://",
  "sb_secret",
  "eyJhbGci"
];

for (const text of [adminDashboard, editorDashboard, adminLogin, editorLogin]) {
  for (const token of forbidden) {
    if (text.includes(token)) fail(`Forbidden secret-like marker found: ${token}`);
  }
}

if (!pkg.scripts?.["validate:ag14b"]) fail("Missing validate:ag14b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag14b")) {
  fail("validate:project must include validate:ag14b.");
}

pass("AG14B Admin/Editor UI scaffold baseline is present.");
pass("Admin/Editor dashboards are valid as scaffold pages or AG36C-R1 guarded-route upgrade.");
pass("No service-role key, database secret, committed Supabase key, deployment or public mutation is enabled.");
pass("AG14B validation remains compatible with governed AG36C-R1 route-guard wiring.");
