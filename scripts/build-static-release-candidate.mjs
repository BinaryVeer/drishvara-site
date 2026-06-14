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

const ag74kQuality = exists("data/quality/ag74k-panchang-input-resolver.json") ? readJson("data/quality/ag74k-panchang-input-resolver.json") : null;
check("ag74k_input_resolver_passed", ag74kQuality?.status === "ag74k_completed" && ag74kQuality?.issue_count === 0 && ag74kQuality?.deterministic_test_pass_count === 15 && ag74kQuality?.ready_for_ag74l === true, "AG74K input resolver must pass and make AG74L ready.");
const ag74kResults = exists("data/knowledge-base/panchang-festival/production/ag74k-panchang-input-resolver-test-results.json") ? readJson("data/knowledge-base/panchang-festival/production/ag74k-panchang-input-resolver-test-results.json") : null;
check("ag74k_resolver_result_bank_valid", ag74kResults?.status === "ag74k_resolver_test_results_generated" && ag74kResults?.test_count === 15 && ag74kResults?.astronomical_computation_executed === false, "AG74K result bank must exist without astronomy.");

const ag74lQuality = exists("data/quality/ag74l-panchang-astronomical-engine.json")
  ? readJson("data/quality/ag74l-panchang-astronomical-engine.json")
  : null;
check(
  "ag74l_astronomical_engine_passed",
  ag74lQuality?.status === "ag74l_completed" &&
    ag74lQuality?.issue_count === 0 &&
    ag74lQuality?.deterministic_test_pass_count === 10 &&
    ag74lQuality?.ready_for_ag74m === true,
  "AG74L astronomical engine must pass ten benchmarks and make AG74M ready."
);

const ag74lResults = exists("data/knowledge-base/panchang-festival/production/ag74l-astronomical-validation-results.json")
  ? readJson("data/knowledge-base/panchang-festival/production/ag74l-astronomical-validation-results.json")
  : null;
check(
  "ag74l_validation_result_bank_valid",
  ag74lResults?.status === "ag74l_astronomical_validation_passed" &&
    ag74lResults?.summary?.total_test_count === 10 &&
    ag74lResults?.summary?.failed_test_count === 0 &&
    ag74lResults?.external_api_used === false,
  "AG74L deterministic astronomical validation result bank must pass without external API use."
);

const ag74mQuality = exists("data/quality/ag74m-panchang-day-orchestration.json")
  ? readJson("data/quality/ag74m-panchang-day-orchestration.json")
  : null;
check(
  "ag74m_day_orchestration_passed",
  ag74mQuality?.status === "ag74m_completed" &&
    ag74mQuality?.issue_count === 0 &&
    ag74mQuality?.deterministic_test_pass_count === 12 &&
    ag74mQuality?.ready_for_ag74n === true,
  "AG74M day orchestration must pass twelve tests and make AG74N ready."
);

const ag74mResults = exists("data/knowledge-base/panchang-festival/production/ag74m-day-orchestration-validation-results.json")
  ? readJson("data/knowledge-base/panchang-festival/production/ag74m-day-orchestration-validation-results.json")
  : null;
check(
  "ag74m_validation_result_bank_valid",
  ag74mResults?.status === "ag74m_day_orchestration_validation_passed" &&
    ag74mResults?.summary?.total_test_count === 12 &&
    ag74mResults?.summary?.failed_test_count === 0 &&
    ag74mResults?.festival_generation_executed === false &&
    ag74mResults?.annual_calendar_generation_executed === false &&
    ag74mResults?.external_api_used === false,
  "AG74M deterministic day-orchestration result bank must pass without festival, annual-calendar or external-API activation."
);

const ag74nQuality = exists("data/quality/ag74n-panchang-festival-annual-calendar.json")
  ? readJson("data/quality/ag74n-panchang-festival-annual-calendar.json")
  : null;
check(
  "ag74n_festival_annual_calendar_passed",
  ag74nQuality?.status === "ag74n_completed" &&
    ag74nQuality?.issue_count === 0 &&
    ag74nQuality?.deterministic_check_pass_count === 36 &&
    ag74nQuality?.reference_daily_record_count === 384 &&
    ag74nQuality?.ready_for_ag74o === true,
  "AG74N annual calendar must pass 36 checks and make AG74O ready."
);

const ag74nResults = exists("data/knowledge-base/panchang-festival/production/ag74n-validation-results.json")
  ? readJson("data/knowledge-base/panchang-festival/production/ag74n-validation-results.json")
  : null;
check(
  "ag74n_validation_result_bank_valid",
  ag74nResults?.status === "ag74n_festival_annual_calendar_validation_passed" &&
    ag74nResults?.summary?.total_check_count === 36 &&
    ag74nResults?.summary?.failed_check_count === 0 &&
    ag74nResults?.annual_daily_record_count === 384 &&
    ag74nResults?.condition_candidate_count === 114 &&
    ag74nResults?.final_observance_date_approved_count === 0 &&
    ag74nResults?.calendar_completeness_status === "blocked_pending_rule_review" &&
    ag74nResults?.public_output_allowed === false &&
    ag74nResults?.external_api_used === false,
  "AG74N result bank must pass while keeping unreviewed festival dates and public output blocked."
);

const ag74oQuality = exists("data/quality/ag74o-panchang-public-ui-wiring.json")
  ? readJson("data/quality/ag74o-panchang-public-ui-wiring.json")
  : null;
check(
  "ag74o_public_ui_wiring_passed",
  ag74oQuality?.status === "ag74o_completed" &&
    ag74oQuality?.issue_count === 0 &&
    ag74oQuality?.browser_qa_passed === true &&
    ag74oQuality?.ready_for_ag74p === true,
  "AG74O public UI wiring, browser QA and AG74P readiness must pass."
);
const ag74oBrowser = exists("data/quality/ag74o-panchang-public-ui-wiring-browser-qa.json")
  ? readJson("data/quality/ag74o-panchang-public-ui-wiring-browser-qa.json")
  : null;
check(
  "ag74o_browser_qa_passed",
  ag74oBrowser?.status === "passed" && ag74oBrowser?.failure_count === 0 && ag74oBrowser?.check_count >= 35,
  "AG74O desktop, tablet and mobile browser QA must pass."
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
check("ag74k_validate_script_exists", Boolean(pkg.scripts?.["validate:ag74k"]), "validate:ag74k must exist.");
check("ag74l_validate_script_exists", Boolean(pkg.scripts?.["validate:ag74l"]), "validate:ag74l must exist.");
check("ag74m_validate_script_exists", Boolean(pkg.scripts?.["validate:ag74m"]), "validate:ag74m must exist.");
check("ag74n_validate_script_exists", Boolean(pkg.scripts?.["validate:ag74n"]), "validate:ag74n must exist.");
check("ag74o_validate_script_exists", Boolean(pkg.scripts?.["validate:ag74o"]), "validate:ag74o must exist.");

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
