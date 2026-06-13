import "./validate-ag74i-panchang-public-surface-static.mjs";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
function full(p) { return path.join(root, p); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error("❌ AG74I final validation failed: " + message);
  process.exit(1);
}
function pass(message) { console.log("✅ " + message); }

const browser = readJson("data/quality/ag74i-panchang-public-surface-browser-qa.json");
if (browser.status !== "passed" || browser.failure_count !== 0) {
  fail("Browser interaction QA did not pass.");
}

const quality = readJson("data/quality/ag74i-panchang-public-surface-stabilization.json");
if (quality.status !== "ag74i_completed") fail("AG74I quality status mismatch.");
if (quality.browser_qa_passed !== true) fail("AG74I browser QA flag mismatch.");
if (quality.issue_count !== 0) fail("AG74I issue count must be derived as zero from browser QA.");
if (quality.ready_for_ag74j !== true) fail("AG74J readiness flag is false.");

const readiness = readJson("data/content-intelligence/quality-registry/ag74i-ag74j-panchang-contract-lock-readiness-record.json");
if (readiness.status !== "ready_for_ag74j_panchang_contract_and_methodology_lock") {
  fail("AG74J readiness status mismatch.");
}
if (readiness.readiness_checks.rendered_browser_qa_passed !== true) {
  fail("AG74J readiness does not consume rendered browser QA.");
}

pass("AG74I Panchang public surface stabilization is valid.");
pass("Rendered Chrome interaction QA passed with no failures.");
pass("AG74J contract and methodology lock is ready.");
