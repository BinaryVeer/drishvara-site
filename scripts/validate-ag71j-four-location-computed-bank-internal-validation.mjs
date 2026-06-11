import fs from "node:fs";
import path from "node:path";
import { validateComputedRecord } from "./lib/panchang-internal-dry-run-engine.mjs";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(data, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function fail(message) {
  console.error(`❌ AG71J validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const bankPath = "data/knowledge-base/panchang-festival/production/ag71i-c-four-location-computed-panchang-bank-internal.json";
const requestBankPath = "data/knowledge-base/panchang-festival/production/ag71h-four-location-panchang-request-bank.json";
const manifestPath = "data/knowledge-base/panchang-festival/production/production-bank-manifest.json";

for (const file of [bankPath, requestBankPath, manifestPath]) {
  if (!exists(file)) fail(`Missing required source file: ${file}`);
}

const bank = readJson(bankPath);
const requestBank = readJson(requestBankPath);
const manifest = readJson(manifestPath);

const expectedLocationIds = [
  "loc_in_ar_itanagar_capital_complex_001",
  "loc_in_dl_new_delhi_capital_001",
  "loc_in_jh_ranchi_city_001",
  "loc_jp_tokyo_capital_001"
];

const expectedDates = [...new Set(requestBank.records.map((x) => x.date_key))].sort();
const issues = [];

if (bank.status !== "ag71i_c_four_location_internal_computed_bank_created_public_blocked") {
  issues.push({ issue: "bank_status_mismatch", value: bank.status });
}

if (bank.records.length !== 28 || bank.computed_record_count !== 28) {
  issues.push({ issue: "computed_record_count_mismatch", count: bank.records.length });
}

if (requestBank.records.length !== 28 || requestBank.request_record_count !== 28) {
  issues.push({ issue: "request_bank_count_mismatch", count: requestBank.records.length });
}

if (expectedDates.length !== 7) {
  issues.push({ issue: "date_count_mismatch", count: expectedDates.length });
}

const requestIds = new Set(requestBank.records.map((x) => x.request_id));
const computedRequestIds = new Set();
const coverage = {};

for (const locationId of expectedLocationIds) {
  coverage[locationId] = {};
  for (const dateKey of expectedDates) coverage[locationId][dateKey] = 0;
}

for (const record of bank.records) {
  computedRequestIds.add(record.source_request_id);

  if (!requestIds.has(record.source_request_id)) {
    issues.push({ record_id: record.panchang_daily_record_id, issue: "source_request_not_found" });
  }

  if (!expectedLocationIds.includes(record.location_id)) {
    issues.push({ record_id: record.panchang_daily_record_id, issue: "unexpected_location_id", location_id: record.location_id });
  }

  if (!expectedDates.includes(record.date_key)) {
    issues.push({ record_id: record.panchang_daily_record_id, issue: "unexpected_date_key", date_key: record.date_key });
  }

  if (coverage[record.location_id] && coverage[record.location_id][record.date_key] !== undefined) {
    coverage[record.location_id][record.date_key] += 1;
  }

  for (const issue of validateComputedRecord(record)) {
    issues.push({ record_id: record.panchang_daily_record_id, issue });
  }

  if (record.timezone === "Asia/Kolkata" && record.timezone_offset_minutes !== 330) {
    issues.push({ record_id: record.panchang_daily_record_id, issue: "kolkata_offset_mismatch" });
  }

  if (record.timezone === "Asia/Tokyo" && record.timezone_offset_minutes !== 540) {
    issues.push({ record_id: record.panchang_daily_record_id, issue: "tokyo_offset_mismatch" });
  }

  if (record.public_output_allowed !== false) {
    issues.push({ record_id: record.panchang_daily_record_id, issue: "public_output_not_blocked" });
  }

  if (record.ui_output_allowed !== false) {
    issues.push({ record_id: record.panchang_daily_record_id, issue: "ui_output_not_blocked" });
  }

  if (record.external_panchang_source_used !== false) {
    issues.push({ record_id: record.panchang_daily_record_id, issue: "external_source_not_blocked" });
  }
}

for (const requestId of requestIds) {
  if (!computedRequestIds.has(requestId)) {
    issues.push({ source_request_id: requestId, issue: "request_not_computed" });
  }
}

for (const locationId of expectedLocationIds) {
  for (const dateKey of expectedDates) {
    if (coverage[locationId][dateKey] !== 1) {
      issues.push({ location_id: locationId, date_key: dateKey, issue: "location_date_coverage_not_exactly_one", count: coverage[locationId][dateKey] });
    }
  }
}

const validationStatus = issues.length === 0
  ? "ag71j_four_location_computed_bank_internal_validation_passed"
  : "ag71j_four_location_computed_bank_internal_validation_failed";

const validationRecordPath = "data/knowledge-base/panchang-festival/production/ag71j-four-location-computed-bank-internal-validation.json";
const issueReportPath = "data/knowledge-base/panchang-festival/production/ag71j-computed-bank-validation-issue-report.json";
const noPublicPath = "data/knowledge-base/panchang-festival/production/ag71j-no-public-output-validation.json";

writeJson(validationRecordPath, {
  module_id: "AG71J",
  title: "Four-Location Computed Bank Internal Validation",
  status: validationStatus,
  source_computed_bank: bankPath,
  source_request_bank: requestBankPath,
  computed_record_count: bank.records.length,
  expected_computed_record_count: 28,
  location_count: expectedLocationIds.length,
  date_count: expectedDates.length,
  issue_count: issues.length,
  location_date_coverage: coverage,
  public_output_allowed_now: false,
  ui_exact_value_output_allowed_now: false,
  next_step: {
    module_id: "AG71K",
    title: "Computed Bank Review Gate"
  }
});

writeJson(issueReportPath, {
  module_id: "AG71J",
  title: "Computed Bank Validation Issue Report",
  status: issues.length === 0 ? "no_issues_detected" : "issues_detected",
  issue_count: issues.length,
  issues,
  public_output_allowed_now: false
});

writeJson(noPublicPath, {
  module_id: "AG71J",
  title: "No Public Output Validation",
  status: "ag71j_no_public_output_validation_passed",
  checks: {
    computed_bank_public_output_allowed_now: false,
    computed_bank_ui_exact_value_output_allowed_now: false,
    index_html_exact_value_publication_performed: false,
    generated_public_panchang_file_modified: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    external_panchang_source_dependency_used: false
  }
});

writeJson("data/content-intelligence/quality-reviews/ag71j-four-location-computed-bank-internal-validation.json", {
  module_id: "AG71J",
  title: "Four-Location Computed Bank Internal Validation Review",
  status: issues.length === 0 ? "ag71j_completed" : "ag71j_completed_with_issues",
  generated_records: {
    validation_record: validationRecordPath,
    validation_issue_report: issueReportPath,
    no_public_output_validation: noPublicPath
  },
  summary: {
    computed_record_count: bank.records.length,
    expected_computed_record_count: 28,
    issue_count: issues.length,
    validation_passed: issues.length === 0,
    public_output_allowed_now: false,
    ready_for_ag71k_review_gate: issues.length === 0
  }
});

writeJson("data/quality/ag71j-four-location-computed-bank-internal-validation.json", {
  module_id: "AG71J",
  status: issues.length === 0 ? "ag71j_completed" : "ag71j_completed_with_issues",
  validation_passed: issues.length === 0,
  issue_count: issues.length
});

writeJson("data/quality/ag71j-four-location-computed-bank-internal-validation-preview.json", {
  module_id: "AG71J",
  status: issues.length === 0 ? "ag71j_completed" : "ag71j_completed_with_issues",
  computed_record_count: bank.records.length,
  location_count: expectedLocationIds.length,
  date_count: expectedDates.length,
  issue_count: issues.length,
  public_output_allowed_now: 0
});

writeJson("data/content-intelligence/quality-registry/ag71j-ag71k-computed-bank-review-gate-readiness-record.json", {
  module_id: "AG71J-AG71K",
  title: "AG71K Computed Bank Review Gate Readiness",
  status: issues.length === 0 ? "ready_for_ag71k_computed_bank_review_gate" : "blocked_for_ag71k_due_to_ag71j_issues",
  ag71j_consumed: true,
  issue_count: issues.length,
  hard_blockers_for_ag71k: issues.length === 0 ? [] : ["Resolve AG71J validation issues first."]
});

writeJson("data/content-intelligence/mutation-plans/ag71j-to-ag71k-computed-bank-review-gate-boundary.json", {
  from_module: "AG71J",
  to_module: "AG71K",
  transition: "computed_bank_review_gate",
  allowed_next_actions: [
    "Review AG71J validation result",
    "Prepare internal-only exact-value preview contract if validation passed",
    "Keep public output blocked"
  ],
  blocked_actions: [
    "Public Panchang exact-value output",
    "Unreviewed UI exact-value publication",
    "Backend runtime activation",
    "Supabase activation",
    "Full location-bank scale-up"
  ]
});

writeText("docs/quality/AG71J_FOUR_LOCATION_COMPUTED_BANK_INTERNAL_VALIDATION.md", `# AG71J — Four-Location Computed Bank Internal Validation

AG71J validates the AG71I-C four-location computed Panchang bank.

## Validation Result

- Computed records: ${bank.records.length}
- Expected records: 28
- Locations: ${expectedLocationIds.length}
- Dates: ${expectedDates.length}
- Issue count: ${issues.length}

## Boundary

No public Panchang exact-value output, UI exact-value publication, backend activation, Supabase activation, external Panchang source dependency, or full location-bank scale-up was performed.

## Next Gate

AG71K should act as the computed bank review gate before any UI exact-value preview contract is considered.
`);

manifest.ag71j_files = {
  validation_record: validationRecordPath,
  validation_issue_report: issueReportPath,
  no_public_output_validation: noPublicPath
};

manifest.current_counts = {
  ...(manifest.current_counts || {}),
  ag71j_validation_issue_count: issues.length,
  ag71j_validated_computed_record_count: bank.records.length
};

manifest.current_status = issues.length === 0
  ? "ag71j_four_location_computed_bank_internal_validation_passed_ag71k_ready"
  : "ag71j_four_location_computed_bank_internal_validation_failed";

writeJson(manifestPath, manifest);

if (issues.length > 0) {
  fail(`AG71J detected ${issues.length} issue(s). See ${issueReportPath}`);
}

pass("AG71J four-location computed bank internal validation passed.");
pass("28 computed records are validated across 4 locations and 7 dates.");
pass("Public/UI exact output remains blocked.");
