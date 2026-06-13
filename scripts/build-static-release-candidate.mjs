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
  'data-ag74i-panchang-public-surface="true"',
  'data-ag74i-default-location="varanasi_in"',
  'data-ag74i-default-timezone="Asia/Kolkata"',
  'data-ag74i-exact-record-only="true"',
  'data-ag74i-public-approval-required="true"',
  "panchang-date-picker",
  "panchang-date-text",
  'data-ag74i-varanasi-calendar-book="true"',
  "Curated linguistic preview; Sanskrit/Hindi meaning, usage and source methodology remain under editorial verification.",
  "Reflective prompt only; not a personal prediction, assessment, or decision guide."
]) {
  check(`required_present_${good}`, indexHtml.includes(good), `${good} must appear on public homepage.`);
}

const panchangStart = indexHtml.indexOf('<div class="card" id="panchang-festival-card"');
const panchangEnd = indexHtml.indexOf('<div class="card" id="open-day-card"', panchangStart);
const panchangCardHtml = panchangStart >= 0 && panchangEnd > panchangStart
  ? indexHtml.slice(panchangStart, panchangEnd)
  : "";

const panchangVisibleHtml = panchangCardHtml
  .replace(/<!-- AG71E_PANCHANG_PREVIEW_OUTPUT_START -->[\s\S]*?<!-- AG71E_PANCHANG_PREVIEW_OUTPUT_END -->/g, " ")
  .replace(/<span\b[^>]*\bhidden\b[^>]*>[\s\S]*?<\/span>/gi, " ")
  .replace(/<!--([\s\S]*?)-->/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

check("ag74i_panchang_card_present", Boolean(panchangCardHtml), "AG74I Panchang card must exist.");
check("ag74i_varanasi_default", indexHtml.includes('data-ag74i-default-location="varanasi_in"'), "Varanasi must be the AG74I default.");
check("ag74i_asia_kolkata_default", indexHtml.includes('data-ag74i-default-timezone="Asia/Kolkata"'), "Asia/Kolkata must be the AG74I default timezone.");
check("ag74i_exact_only", indexHtml.includes('data-ag74i-exact-record-only="true"'), "AG74I must use exact-record-only rendering.");
check("ag74i_public_approval_required", indexHtml.includes('data-ag74i-public-approval-required="true"'), "AG74I must require explicit public-display approval.");
check("ag74i_governed_unavailable_copy", panchangVisibleHtml.includes("No publicly approved matching record"), "Governed unavailable copy must be visible.");
check("ag74i_date_controls", ["panchang-date-picker", "panchang-date-text", "panchang-previous-day", "panchang-today", "panchang-next-day"].every((id) => indexHtml.includes(id)), "All AG74I date controls must exist.");
check("ag74i_annual_book_shell", indexHtml.includes('data-ag74i-varanasi-calendar-book="true"'), "Four-page Varanasi annual-book shell must exist.");
check("ag74i_no_visible_transition_copy", !/(pilot|preview|locked|withheld)/i.test(panchangVisibleHtml), "Visible Panchang card must not expose transition-era status vocabulary.");

const ag74iBrowserQa = exists("data/quality/ag74i-panchang-public-surface-browser-qa.json")
  ? readJson("data/quality/ag74i-panchang-public-surface-browser-qa.json")
  : null;
check("ag74i_browser_qa_passed", ag74iBrowserQa?.status === "passed" && ag74iBrowserQa?.failure_count === 0, "AG74I browser interaction QA must pass.");

const ag74jQuality = exists("data/quality/ag74j-panchang-contract-and-methodology-lock.json")
  ? readJson("data/quality/ag74j-panchang-contract-and-methodology-lock.json")
  : null;
check(
  "ag74j_contract_lock_passed",
  ag74jQuality?.status === "ag74j_completed" &&
    ag74jQuality?.issue_count === 0 &&
    ag74jQuality?.ready_for_ag74k === true,
  "AG74J contract and methodology lock must pass and make AG74K ready."
);

const ag74jProfile = exists("data/knowledge-base/panchang-festival/production/ag74j-drishvara-varanasi-standard-profile.json")
  ? readJson("data/knowledge-base/panchang-festival/production/ag74j-drishvara-varanasi-standard-profile.json")
  : null;
check(
  "ag74j_canonical_profile_locked",
  ag74jProfile?.status === "ag74j_canonical_profile_locked_ag74k_ready" &&
    ag74jProfile?.lunar_month_convention === "purnimanta" &&
    ag74jProfile?.ayanamsha_profile === "lahiri_chitrapaksha",
  "AG74J canonical Varanasi profile must be locked."
);

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
check("ag74j_validate_script_exists", Boolean(pkg.scripts?.["validate:ag74j"]), "validate:ag74j must exist.");

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
