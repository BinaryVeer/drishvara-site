import fs from "node:fs";
const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const write = (path, value) => fs.writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
const browser = read("data/quality/ag74o-panchang-public-ui-wiring-browser-qa.json");
const passed = browser.status === "passed" && browser.failure_count === 0;
const common = {
  module_id: "AG74O",
  status: passed ? "ag74o_completed" : "ag74o_blocked_by_browser_qa",
  browser_qa_passed: passed,
  browser_check_count: browser.check_count,
  browser_failure_count: browser.failure_count,
  issue_count: browser.failure_count,
  public_daily_panchang_runtime_active: passed,
  annual_book_public_structure_active: passed,
  festival_publication_guard_active: true,
  backend_service_deployed: false,
  supabase_activation_performed: false,
  external_ephemeris_api_enabled: false,
  input_persistence_enabled: false,
  ready_for_ag74p: passed
};
write("data/quality/ag74o-panchang-public-ui-wiring.json", { title: "Panchang Public UI Wiring Quality Record", ...common });
write("data/quality/ag74o-panchang-public-ui-wiring-preview.json", { title: "Panchang Public UI Wiring Preview", ...common, summary: "Universal local browser calculation, four-page Varanasi book, responsive controls and guarded observance state." });
write("data/content-intelligence/quality-reviews/ag74o-panchang-public-ui-wiring.json", { title: "AG74O Panchang Public UI Wiring Review", ...common, browser_report: "data/quality/ag74o-panchang-public-ui-wiring-browser-qa.json" });
const readiness = read("data/content-intelligence/quality-registry/ag74o-ag74p-panchang-scientific-comparison-closure-readiness-record.json");
readiness.status = passed ? "ready_for_ag74p_panchang_scientific_comparison_and_final_closure" : "blocked_by_ag74o_browser_qa";
readiness.readiness_checks.ag74o_browser_qa_passed = passed;
readiness.readiness_checks.browser_failure_count = browser.failure_count;
write("data/content-intelligence/quality-registry/ag74o-ag74p-panchang-scientific-comparison-closure-readiness-record.json", readiness);
if (!passed) process.exit(1);
console.log("✅ AG74O quality and AG74P readiness finalized from browser evidence.");
