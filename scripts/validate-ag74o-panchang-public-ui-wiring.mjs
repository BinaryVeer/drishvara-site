import "./validate-ag74o-panchang-public-ui-static.mjs";
import fs from "node:fs";
const fail = (message) => { console.error("❌ AG74O final validation failed: " + message); process.exit(1); };
const pass = (message) => console.log("✅ " + message);
const json = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const browser = json("data/quality/ag74o-panchang-public-ui-wiring-browser-qa.json");
if (browser.status !== "passed" || browser.failure_count !== 0 || browser.check_count < 35) fail("Browser QA evidence mismatch");
const quality = json("data/quality/ag74o-panchang-public-ui-wiring.json");
if (quality.status !== "ag74o_completed" || quality.issue_count !== 0 || quality.browser_qa_passed !== true || quality.ready_for_ag74p !== true) fail("Quality closure mismatch");
const readiness = json("data/content-intelligence/quality-registry/ag74o-ag74p-panchang-scientific-comparison-closure-readiness-record.json");
if (readiness.status !== "ready_for_ag74p_panchang_scientific_comparison_and_final_closure") fail("AG74P readiness mismatch");
for (const key of ["backend_service_deployed","supabase_activation_performed","external_ephemeris_api_enabled","input_persistence_enabled","unreviewed_festival_candidates_publicly_displayed"]) {
  if (readiness.readiness_checks[key] !== false) fail("Forbidden activation flag: " + key);
}
pass("AG74O browser QA, overflow correction, responsive annual book, local calculation and festival guard are valid.");
pass("AG74P scientific comparison and final closure is ready.");
