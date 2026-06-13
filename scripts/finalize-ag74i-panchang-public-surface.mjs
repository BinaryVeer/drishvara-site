import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const browserPath = "data/quality/ag74i-panchang-public-surface-browser-qa.json";
const qualityPath = "data/quality/ag74i-panchang-public-surface-stabilization.json";
const previewPath = "data/quality/ag74i-panchang-public-surface-stabilization-preview.json";
const reviewPath = "data/content-intelligence/quality-reviews/ag74i-panchang-public-surface-stabilization.json";
const readinessPath = "data/content-intelligence/quality-registry/ag74i-ag74j-panchang-contract-lock-readiness-record.json";
const publicContractPath = "data/knowledge-base/panchang-festival/production/ag74i-panchang-public-surface-contract.json";
const dateContractPath = "data/knowledge-base/panchang-festival/production/ag74i-panchang-date-navigation-ui-contract.json";
const bookContractPath = "data/knowledge-base/panchang-festival/production/ag74i-varanasi-annual-calendar-book-shell-contract.json";
const observanceContractPath = "data/knowledge-base/panchang-festival/production/ag74i-observance-window-placeholder-contract.json";
const ownershipContractPath = "data/knowledge-base/panchang-festival/production/ag74i-panchang-dom-ownership-contract.json";

function full(p) { return path.join(root, p); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, value) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(value, null, 2) + "\n");
}

const browser = readJson(browserPath);
const passed = browser.status === "passed" && browser.failure_count === 0;
const issueCount = Number(browser.failure_count || 0);

const quality = readJson(qualityPath);
quality.status = passed ? "ag74i_completed" : "ag74i_blocked_by_browser_qa";
quality.browser_qa_passed = passed;
quality.issue_count = issueCount;
quality.ready_for_ag74j = passed;
writeJson(qualityPath, quality);

const preview = readJson(previewPath);
preview.status = passed ? "ag74i_completed" : "ag74i_blocked_by_browser_qa";
preview.browser_qa_passed = passed ? 1 : 0;
preview.issue_count = issueCount;
writeJson(previewPath, preview);

const review = readJson(reviewPath);
review.status = passed ? "ag74i_completed" : "ag74i_blocked_by_browser_qa";
review.browser_qa = {
  status: browser.status,
  report_path: browserPath,
  check_count: browser.check_count,
  failure_count: browser.failure_count,
  failures: browser.failures || []
};
writeJson(reviewPath, review);

const readiness = readJson(readinessPath);
readiness.status = passed
  ? "ready_for_ag74j_panchang_contract_and_methodology_lock"
  : "blocked_for_ag74j_panchang_contract_and_methodology_lock";
readiness.readiness_checks.rendered_browser_qa_passed = passed;
writeJson(readinessPath, readiness);

for (const contractPath of [
  publicContractPath,
  dateContractPath,
  bookContractPath,
  observanceContractPath,
  ownershipContractPath
]) {
  const contract = readJson(contractPath);
  contract.status = String(contract.status).replace("_pending_browser_qa", "");
  contract.browser_qa = {
    passed,
    report_path: browserPath,
    check_count: browser.check_count,
    failure_count: browser.failure_count
  };
  writeJson(contractPath, contract);
}

if (!passed) {
  console.error("❌ AG74I finalization blocked by browser QA.");
  process.exit(1);
}

console.log("✅ AG74I quality, review and AG74J readiness finalized from browser evidence.");
