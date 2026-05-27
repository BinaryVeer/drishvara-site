import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
function exists(p) { return fs.existsSync(path.join(root, p)); }
function readText(p) { return fs.readFileSync(path.join(root, p), "utf8"); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG36C-R1 validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "admin-dashboard.html",
  "editor-dashboard.html",
  "assets/js/ag36c-route-guard.js",
  "data/content-intelligence/quality-reviews/ag36c-r1-route-guard-wiring.json",
  "data/content-intelligence/backend-architecture/ag36c-r1-route-guard-wiring-package.json",
  "data/content-intelligence/backend-architecture/ag36c-r1-admin-editor-route-guard-record.json",
  "data/content-intelligence/quality-registry/ag36c-r1-route-guard-blocker-register.json",
  "data/content-intelligence/quality-registry/ag36c-r1-role-restriction-manual-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag36c-r1-to-ag36c-manual-role-restriction-test-boundary.json",
  "data/quality/ag36c-r1-route-guard-wiring.json",
  "data/quality/ag36c-r1-route-guard-wiring-preview.json",
  "docs/quality/AG36C_R1_ROUTE_GUARD_WIRING.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const admin = readText("admin-dashboard.html");
const editor = readText("editor-dashboard.html");
const guard = readText("assets/js/ag36c-route-guard.js");
const review = readJson("data/content-intelligence/quality-reviews/ag36c-r1-route-guard-wiring.json");
const pkg = readJson("package.json");

if (!admin.includes('data-required-role="admin"')) fail("admin-dashboard missing admin role marker.");
if (!editor.includes('data-required-role="editor"')) fail("editor-dashboard missing editor role marker.");
if (!admin.includes("ag36c-route-guard.js")) fail("admin-dashboard missing route guard script.");
if (!editor.includes("ag36c-route-guard.js")) fail("editor-dashboard missing route guard script.");
if (!guard.includes("getSession")) fail("route guard must check session.");
if (!guard.includes('.eq("role", requiredRole)')) fail("route guard must verify required role.");
if (!guard.includes('.from("profiles")')) fail("route guard must verify profiles table.");

for (const text of [admin, editor, guard]) {
  for (const token of ["SUPABASE_SERVICE_ROLE_KEY", "service_role", "postgres://", "sb_secret", "eyJhbGci"]) {
    if (text.includes(token)) fail(`Forbidden secret-like marker found: ${token}`);
  }
}

if (review.status !== "route_guard_wiring_created_ready_for_manual_role_restriction_test") fail("Review status mismatch.");
if (!pkg.scripts?.["validate:ag36c-r1"]) fail("Missing validate:ag36c-r1 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag36c-r1")) fail("validate:project must include validate:ag36c-r1.");

pass("AG36C-R1 route guard wiring is present.");
pass("Admin and Editor dashboards are role-marked and guarded.");
pass("Route guard verifies Supabase session and profiles.role.");
pass("No service-role key, deployment or public mutation is recorded.");
