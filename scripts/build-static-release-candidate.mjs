import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const out = "data/content-intelligence/release-candidate/ag58a-static-build-readiness-manifest.json";

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

const failures = [];
const checks = [];

function check(id, passed, detail) {
  checks.push({ id, passed, detail });
  if (!passed) failures.push(`${id}: ${detail}`);
}

check("index_html_exists", exists("index.html"), "index.html must exist.");
check("language_runtime_exists", exists("assets/js/drishvara-language-runtime.js"), "language runtime must exist.");
check("package_json_exists", exists("package.json"), "package.json must exist.");

const indexHtml = exists("index.html") ? read("index.html") : "";

for (const bad of [
  "UI Step 3 Integration",
  "From signal to reading to reflection",
  "Fetching live events...",
  "Fetching tournament cards...",
  "Fetching major updates...",
  "Fetching featured sports article..."
]) {
  check(`forbidden_absent_${bad}`, !indexHtml.includes(bad), `${bad} must not appear on public homepage.`);
}

for (const good of [
  "Discover → Read → Reflect",
  "First Light — 10 Daily Signals",
  "Default daily selection: 10 signals — 6 India-focused and 4 international",
  "Live-event cards will appear after editorial activation.",
  "Tournament cards are held for verified sports context.",
  "Major sports updates will appear after editorial review.",
  "Featured sports reading will appear after curation.",
  "Reflective preview only; weekday, colour, mantra and food logic require verified source methodology before activation.",
  "Active calculated Panchang pilot result is available for approved pilot locations and remains under verification.",
  "Curated linguistic preview; Sanskrit/Hindi meaning, usage and source methodology remain under editorial verification.",
  "Reflective prompt only; not a personal prediction, assessment, or decision guide."
]) {
  check(`required_present_${good}`, indexHtml.includes(good), `${good} must appear on public homepage.`);
}

const dailyDir = full("generated/daily-context");
check("daily_context_dir_exists", fs.existsSync(dailyDir), "generated/daily-context must exist.");

if (fs.existsSync(dailyDir)) {
  const files = fs.readdirSync(dailyDir).filter((f) => f.endsWith(".json"));
  check("daily_context_files_exist", files.length > 0, "At least one daily context JSON must exist.");

  for (const file of files) {
    const obj = readJson(`generated/daily-context/${file}`);
    check(`${file}_default_total_10`, obj.first_light?.selection_rule?.default_total === 10, `${file} must have default_total 10.`);
    check(`${file}_india_6`, obj.first_light?.selection_rule?.india_focused === 6, `${file} must have india_focused 6.`);
    check(`${file}_international_4`, obj.first_light?.selection_rule?.international === 4, `${file} must have international 4.`);
  }
}

const pkg = exists("package.json") ? readJson("package.json") : {};
check("validate_project_script_exists", Boolean(pkg.scripts?.["validate:project"]), "validate:project must exist.");
check("ag57z_validate_script_exists", Boolean(pkg.scripts?.["validate:ag57z"]), "validate:ag57z must exist.");

const manifest = {
  module_id: "AG58A",
  title: "Static Build Readiness Manifest",
  status: failures.length === 0 ? "static_build_readiness_passed" : "static_build_readiness_failed",
  audit_passed: failures.length === 0,
  build_command_type: "static_local_readiness_check_only",
  checks,
  failures,
  current_git_context: {
    branch: run("git branch --show-current"),
    head: run("git rev-parse --short HEAD"),
    head_full: run("git rev-parse HEAD"),
    origin_main: run("git rev-parse --short origin/main"),
    status_at_build: run("git status --short") || "clean"
  },
  blocked_actions: [
    "deployment",
    "vercel_trigger",
    "github_release_or_tag",
    "live_public_check",
    "backend_auth_supabase_activation",
    "runtime_database_api_reading",
    "service_role_use",
    "v02_expansion"
  ]
};

writeJson(out, manifest);

if (failures.length > 0) {
  console.error("❌ Static build readiness failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("✅ Static release-candidate build readiness passed.");
console.log("✅ Homepage corrections, Daily Signal rule, Sports fallback and safety notes are present.");
console.log("✅ No deployment, live check, backend/runtime, service-role use or V02 expansion performed.");
