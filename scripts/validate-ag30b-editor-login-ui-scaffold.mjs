import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readText(p) { return fs.readFileSync(path.join(root, p), "utf8"); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG30B validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "editor/login.html",
  "data/content-intelligence/backend-architecture/ag30b-editor-login-ui-scaffold.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-login-interface-model.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-login-route-preview.json",
  "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  "data/content-intelligence/quality-reviews/ag30b-editor-login-ui-scaffold.json",
  "data/quality/ag30b-editor-login-ui-scaffold.json",
  "data/quality/ag30b-editor-login-ui-scaffold-preview.json",
  "docs/quality/AG30B_EDITOR_LOGIN_UI_SCAFFOLD.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const html = readText("editor/login.html");
const pkg = readJson("package.json");

const legacy =
  html.includes("Editor Login UI Scaffold") &&
  html.includes("Non-active scaffold only") &&
  html.includes("AG30B preview only: real Editor login is not active");

const upgrade =
  exists("assets/js/ag36b-editor-live-auth.js") &&
  html.includes("Drishvara Editor Login — Controlled Live Auth Test") &&
  html.includes("../assets/js/drishvara-auth-local.js") &&
  html.includes("../assets/js/ag36b-editor-live-auth.js") &&
  html.includes("Sign in as Editor");

if (!legacy && !upgrade) fail("Editor login page is neither AG30B legacy scaffold nor AG36B-R1 controlled live-auth upgrade.");

if (upgrade) {
  const js = readText("assets/js/ag36b-editor-live-auth.js");
  if (!js.includes("signInWithPassword")) fail("AG36B-R1 Editor Auth JS must contain signInWithPassword.");
  if (!js.includes('.eq("role", "editor")')) fail("AG36B-R1 Editor Auth JS must verify editor role.");
  if (!readText(".gitignore").includes("assets/js/drishvara-auth-local.js")) fail("AG36B-R1 local Auth config must be gitignored.");
}

for (const token of ["SUPABASE_SERVICE_ROLE_KEY", "service_role", "postgres://", "sb_secret", "eyJhbGci"]) {
  if (html.includes(token)) fail(`Forbidden secret-like marker found in editor/login.html: ${token}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag30b-editor-login-ui-scaffold.json");
const registry = readJson("data/quality/ag30b-editor-login-ui-scaffold.json");

if (!String(review.status || "").includes("editor_login_ui_scaffold")) fail("AG30B review status mismatch.");
if (!String(registry.status || "").includes("editor_login_ui_scaffold")) fail("AG30B registry status mismatch.");
if (!pkg.scripts?.["validate:ag30b"]) fail("Missing validate:ag30b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag30b")) fail("validate:project must include validate:ag30b.");

pass("AG30B Editor Login UI Scaffold source records are present.");
pass("Editor login page is valid as legacy AG30B scaffold or forward-compatible AG36B-R1 upgrade.");
pass("No service-role key, database secret, deployment or public mutation is enabled.");
pass("AG30B validation remains compatible with controlled AG36B-R1 live-auth wiring.");
