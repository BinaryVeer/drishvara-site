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
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function fail(message) {
  console.error(`❌ AG71N validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const previewBankPath = "data/knowledge-base/panchang-festival/production/ag71m-internal-exact-panchang-preview-data-bank.json";
const validationReportPath = "data/knowledge-base/panchang-festival/production/ag71m-preview-data-bank-validation-report.json";
const noPublicAuditPath = "data/knowledge-base/panchang-festival/production/ag71m-no-public-output-preview-bank-audit.json";
const contractPath = "data/knowledge-base/panchang-festival/production/ag71l-internal-exact-panchang-preview-contract.json";
const manifestPath = "data/knowledge-base/panchang-festival/production/production-bank-manifest.json";

for (const file of [previewBankPath, validationReportPath, noPublicAuditPath, contractPath, manifestPath]) {
  if (!exists(file)) fail(`Missing required source file: ${file}`);
}

const previewBank = readJson(previewBankPath);
const validationReport = readJson(validationReportPath);
const noPublicAudit = readJson(noPublicAuditPath);
const contract = readJson(contractPath);
const manifest = readJson(manifestPath);

if (previewBank.status !== "ag71m_internal_exact_panchang_preview_data_bank_created") {
  fail("AG71M preview bank status mismatch.");
}

if (validationReport.status !== "ag71m_preview_data_bank_validation_passed") {
  fail("AG71M validation report has not passed.");
}

if (validationReport.issue_count !== 0 || previewBank.issue_count !== 0) {
  fail("AG71M issue count must be zero.");
}

if (contract.status !== "ag71l_internal_exact_panchang_preview_contract_created") {
  fail("AG71L contract status mismatch.");
}

if (previewBank.records.length !== 28 || previewBank.preview_record_count !== 28) {
  fail("AG71M preview bank must contain 28 records.");
}

const expectedLocationIds = [
  "loc_in_ar_itanagar_capital_complex_001",
  "loc_in_dl_new_delhi_capital_001",
  "loc_in_jh_ranchi_city_001",
  "loc_jp_tokyo_capital_001"
];

const issues = [];
const locationCounts = {};
const dateKeys = new Set();

for (const record of previewBank.records) {
  locationCounts[record.preview_location_id] = (locationCounts[record.preview_location_id] || 0) + 1;
  dateKeys.add(record.preview_date);

  if (!expectedLocationIds.includes(record.preview_location_id)) {
    issues.push({ preview_record_id: record.preview_record_id, issue: "unexpected_location_id" });
  }

  if (record.internal_preview_visibility !== "internal_only_public_blocked") {
    issues.push({ preview_record_id: record.preview_record_id, issue: "visibility_not_internal_only_public_blocked" });
  }

  for (const key of [
    "public_output_allowed",
    "ui_output_allowed",
    "exact_value_publication_allowed",
    "generated_public_file_replacement_allowed",
    "index_html_wiring_allowed"
  ]) {
    if (record[key] !== false) {
      issues.push({ preview_record_id: record.preview_record_id, issue: `${key}_not_false` });
    }
  }

  for (const field of [
    "preview_tithi",
    "preview_nakshatra",
    "preview_yoga",
    "preview_karana",
    "preview_paksha",
    "preview_vara",
    "preview_snapshot_local"
  ]) {
    if (!record[field]) {
      issues.push({ preview_record_id: record.preview_record_id, issue: `missing_${field}` });
    }
  }

  if (record.preview_timezone === "Asia/Kolkata" && record.preview_timezone_offset_minutes !== 330) {
    issues.push({ preview_record_id: record.preview_record_id, issue: "kolkata_offset_mismatch" });
  }

  if (record.preview_timezone === "Asia/Tokyo" && record.preview_timezone_offset_minutes !== 540) {
    issues.push({ preview_record_id: record.preview_record_id, issue: "tokyo_offset_mismatch" });
  }
}

for (const locationId of expectedLocationIds) {
  if (locationCounts[locationId] !== 7) {
    issues.push({ location_id: locationId, issue: "location_record_count_not_7", count: locationCounts[locationId] || 0 });
  }
}

if (dateKeys.size !== 7) {
  issues.push({ issue: "date_key_count_not_7", count: dateKeys.size });
}

for (const [key, value] of Object.entries(noPublicAudit.checks || {})) {
  if (value !== false) {
    issues.push({ issue: "no_public_audit_check_not_false", key });
  }
}

const reviewPath = "data/knowledge-base/panchang-festival/production/ag71n-internal-preview-data-bank-review.json";
const noPublicGatePath = "data/knowledge-base/panchang-festival/production/ag71n-no-public-output-review-gate.json";
const readinessPath = "data/content-intelligence/quality-registry/ag71n-ag71o-public-blocked-ui-preview-adapter-readiness-record.json";
const boundaryPath = "data/content-intelligence/mutation-plans/ag71n-to-ag71o-public-blocked-ui-preview-adapter-boundary.json";

writeJson(reviewPath, {
  module_id: "AG71N",
  title: "Internal Preview Data Bank Review",
  status: issues.length === 0
    ? "ag71n_internal_preview_data_bank_review_passed"
    : "ag71n_internal_preview_data_bank_review_failed",
  source_preview_bank: previewBankPath,
  source_validation_report: validationReportPath,
  source_no_public_audit: noPublicAuditPath,
  review_summary: {
    preview_record_count: previewBank.records.length,
    expected_preview_record_count: 28,
    location_count: Object.keys(locationCounts).length,
    date_count: dateKeys.size,
    issue_count: issues.length,
    public_output_allowed_now: false,
    ui_exact_value_output_allowed_now: false,
    ready_for_ag71o_public_blocked_ui_preview_adapter: issues.length === 0
  },
  location_counts: locationCounts,
  issue_count: issues.length,
  issues,
  decision: {
    internal_preview_data_bank_accepted: issues.length === 0,
    public_blocked_ui_preview_adapter_allowed_next: issues.length === 0,
    public_exact_value_output_allowed_now: false,
    live_ui_exact_value_publication_allowed_now: false,
    generated_public_panchang_file_replacement_allowed_now: false,
    backend_runtime_activation_allowed_now: false,
    supabase_activation_allowed_now: false
  }
});

writeJson(noPublicGatePath, {
  module_id: "AG71N",
  title: "No Public Output Review Gate",
  status: "ag71n_no_public_output_review_gate_passed",
  checks: {
    public_panchang_exact_value_output_allowed_now: false,
    live_ui_exact_value_publication_allowed_now: false,
    generated_public_panchang_file_replacement_allowed_now: false,
    index_html_exact_value_wiring_performed: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    full_location_bank_scale_up_performed: false
  }
});

writeJson(readinessPath, {
  module_id: "AG71N-AG71O",
  title: "AG71O Public-blocked UI Preview Adapter Readiness",
  status: issues.length === 0
    ? "ready_for_ag71o_public_blocked_ui_preview_adapter"
    : "blocked_for_ag71o_due_to_ag71n_issues",
  ag71n_consumed: true,
  issue_count: issues.length,
  hard_blockers_for_ag71o: issues.length === 0 ? [] : ["Resolve AG71N review issues first."],
  controlled_requirements_for_ag71o: [
    "Create adapter contract only.",
    "Adapter may map UI selection to AG71M internal preview records.",
    "No public exact-value rendering.",
    "No index.html exact-value publication.",
    "No generated public Panchang data replacement.",
    "No backend or Supabase activation."
  ]
});

writeJson(boundaryPath, {
  from_module: "AG71N",
  to_module: "AG71O",
  transition: "public_blocked_ui_preview_adapter",
  allowed_next_actions: [
    "Create public-blocked UI preview adapter contract.",
    "Map selected pilot location and date to AG71M preview record identity.",
    "Validate adapter without public exact-value rendering."
  ],
  blocked_actions: [
    "Public Panchang exact-value output.",
    "Live UI exact-value publication.",
    "Generated public Panchang working-data replacement.",
    "Backend runtime activation.",
    "Supabase activation.",
    "Full location-bank scale-up."
  ]
});

writeJson("data/content-intelligence/quality-reviews/ag71n-internal-preview-data-bank-review.json", {
  module_id: "AG71N",
  title: "Internal Preview Data Bank Review",
  status: issues.length === 0 ? "ag71n_completed" : "ag71n_completed_with_issues",
  generated_records: {
    review: reviewPath,
    no_public_output_gate: noPublicGatePath,
    ag71o_readiness: readinessPath,
    ag71o_boundary: boundaryPath
  },
  summary: {
    internal_preview_data_bank_review_passed: issues.length === 0,
    preview_record_count: previewBank.records.length,
    issue_count: issues.length,
    ready_for_ag71o_public_blocked_ui_preview_adapter: issues.length === 0,
    public_output_allowed_now: false
  }
});

writeJson("data/quality/ag71n-internal-preview-data-bank-review.json", {
  module_id: "AG71N",
  status: issues.length === 0 ? "ag71n_completed" : "ag71n_completed_with_issues",
  review_passed: issues.length === 0,
  issue_count: issues.length,
  public_output_allowed_now: false
});

writeJson("data/quality/ag71n-internal-preview-data-bank-review-preview.json", {
  module_id: "AG71N",
  status: issues.length === 0 ? "ag71n_completed" : "ag71n_completed_with_issues",
  preview_record_count: previewBank.records.length,
  issue_count: issues.length,
  public_output_allowed_now: 0,
  ready_for_ag71o: issues.length === 0 ? 1 : 0
});

writeText("docs/quality/AG71N_INTERNAL_PREVIEW_DATA_BANK_REVIEW.md",
`# AG71N — Internal Preview Data Bank Review

AG71N reviews the AG71M internal exact Panchang preview data bank.

## Result

- Preview records reviewed: ${previewBank.records.length}
- Expected records: 28
- Location count: ${Object.keys(locationCounts).length}
- Date count: ${dateKeys.size}
- Issue count: ${issues.length}

## Decision

The internal preview data bank is ${issues.length === 0 ? "accepted for the AG71O public-blocked UI preview adapter contract." : "not accepted until review issues are resolved."}

## Still Blocked

- Public Panchang exact-value output
- Live UI exact-value publication
- generated public Panchang working-data replacement
- index.html exact-value wiring
- Backend or Supabase activation
- Full location-bank scale-up
`);

manifest.ag71n_files = {
  internal_preview_data_bank_review: reviewPath,
  no_public_output_review_gate: noPublicGatePath
};

manifest.current_counts = {
  ...(manifest.current_counts || {}),
  ag71n_review_records: 1,
  ag71n_review_issue_count: issues.length
};

manifest.current_status = issues.length === 0
  ? "ag71n_internal_preview_data_bank_review_passed_ag71o_ready"
  : "ag71n_internal_preview_data_bank_review_failed";
writeJson(manifestPath, manifest);

if (issues.length > 0) fail(`AG71N detected ${issues.length} issue(s). See ${reviewPath}`);

pass("AG71N internal preview data bank review passed.");
pass("AG71O public-blocked UI preview adapter is ready.");
pass("Public/UI exact-value output remains blocked.");
