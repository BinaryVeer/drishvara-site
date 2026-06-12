import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(data, null, 2) + "\n");
}
function fail(message) {
  console.error(`❌ AG73E validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "generated/star-reflection-active-result-data.json",
  "generated/panchang-pilot-preview-data.json",
  "data/methodology/star-reflection/ag73e-star-reflection-active-result-qa-closure.json",
  "data/methodology/star-reflection/ag73e-active-result-browser-qa-checklist.json",
  "data/methodology/star-reflection/ag73e-active-result-qa-validation-report.json",
  "data/methodology/star-reflection/ag73e-no-storage-no-backend-closure-audit.json",
  "data/content-intelligence/quality-registry/ag73e-two-asset-active-status-record.json",
  "data/content-intelligence/quality-reviews/ag73e-star-reflection-active-result-qa-closure.json",
  "data/quality/ag73e-star-reflection-active-result-qa-closure.json",
  "data/quality/ag73e-star-reflection-active-result-qa-closure-preview.json",
  "docs/quality/AG73E_STAR_REFLECTION_ACTIVE_RESULT_QA_CLOSURE.md",
  "docs/quality/DRISHVARA_NEXT_CHAT_HANDOFF_AFTER_AG73E.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const index = fs.readFileSync(full("index.html"), "utf8");

for (const term of [
  "Active calculated Panchang pilot result",
  "Generate Star Reflection Result",
  "Active Star Reflection Result - Reflective Only",
  "Star Reflection active result is enabled",
  "No name, DOB, birth time, location or coordinate data is stored",
  "generated/star-reflection-active-result-data.json"
]) {
  if (!index.includes(term)) fail(`Missing active public text/marker: ${term}`);
}

for (const staleText of [
  "Personal input is disabled",
  "Reflection Locked Pending Review",
  "Personalised interpretation remains locked",
  "Exact Panchang output remains withheld",
  "Public values remain withheld"
]) {
  if (index.includes(staleText)) fail(`Stale locked/withheld public copy remains: ${staleText}`);
}

const activeData = readJson("generated/star-reflection-active-result-data.json");
const modes = new Set((activeData.records || []).map(record => record.birth_time_precision));
for (const mode of ["exact_session_only", "unknown", "pending_or_invalid"]) {
  if (!modes.has(mode)) fail(`Active result data missing mode: ${mode}`);
}

const validation = readJson("data/methodology/star-reflection/ag73e-active-result-qa-validation-report.json");
if (validation.status !== "ag73e_active_result_qa_validation_passed") fail("AG73E validation report status mismatch.");
if (validation.issue_count !== 0) fail("AG73E issue count must be zero.");

const audit = readJson("data/methodology/star-reflection/ag73e-no-storage-no-backend-closure-audit.json");
if (audit.status !== "ag73e_no_storage_no_backend_closure_audit_passed") fail("AG73E audit status mismatch.");
for (const [key, value] of Object.entries(audit.checks || {})) {
  if (value !== false) fail(`AG73E audit check must remain false: ${key}`);
}

const statusRecord = readJson("data/content-intelligence/quality-registry/ag73e-two-asset-active-status-record.json");
if (statusRecord.status !== "panchang_and_star_reflection_active_static_results_ready_browser_qa_pending") {
  fail("Two-asset active status mismatch.");
}

const manifestPath = "data/methodology/star-reflection/star-reflection-method-manifest.json";
const manifest = readJson(manifestPath);

if (![
  "ag73d_star_reflection_active_result_wiring_applied_ag73e_ready",
  "ag73e_star_reflection_active_result_qa_closed"
].includes(manifest.current_status)) {
  fail(`Manifest is not AG73E-compatible: ${manifest.current_status}`);
}

manifest.current_status = "ag73e_star_reflection_active_result_qa_closed";
manifest.ag73e_files = {
  qa_closure: "data/methodology/star-reflection/ag73e-star-reflection-active-result-qa-closure.json",
  browser_qa_checklist: "data/methodology/star-reflection/ag73e-active-result-browser-qa-checklist.json",
  validation_report: "data/methodology/star-reflection/ag73e-active-result-qa-validation-report.json",
  closure_audit: "data/methodology/star-reflection/ag73e-no-storage-no-backend-closure-audit.json",
  two_asset_status: "data/content-intelligence/quality-registry/ag73e-two-asset-active-status-record.json",
  handoff: "docs/quality/DRISHVARA_NEXT_CHAT_HANDOFF_AFTER_AG73E.md"
};
manifest.current_counts = {
  ...(manifest.current_counts || {}),
  ag73e_active_result_qa_issue_count: 0,
  ag73e_two_asset_status_records: 1,
  ag73e_new_chat_handoff_records: 1
};

writeJson(manifestPath, manifest);

pass("AG73E Star Reflection active result QA closure is valid.");
pass("Panchang and Star Reflection active static-result status is recorded.");
pass("New-chat handoff note is present.");
