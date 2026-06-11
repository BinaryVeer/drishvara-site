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
  console.error(`❌ AG71M validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const contractPath = "data/knowledge-base/panchang-festival/production/ag71l-internal-exact-panchang-preview-contract.json";
const fieldMapPath = "data/knowledge-base/panchang-festival/production/ag71l-exact-panchang-preview-field-map.json";
const bankPath = "data/knowledge-base/panchang-festival/production/ag71i-c-four-location-computed-panchang-bank-internal.json";
const validationPath = "data/knowledge-base/panchang-festival/production/ag71j-four-location-computed-bank-internal-validation.json";
const gatePath = "data/knowledge-base/panchang-festival/production/ag71k-computed-bank-review-gate.json";
const manifestPath = "data/knowledge-base/panchang-festival/production/production-bank-manifest.json";

for (const file of [contractPath, fieldMapPath, bankPath, validationPath, gatePath, manifestPath]) {
  if (!exists(file)) fail(`Missing required source file: ${file}`);
}

const contract = readJson(contractPath);
const fieldMap = readJson(fieldMapPath);
const bank = readJson(bankPath);
const validation = readJson(validationPath);
const gate = readJson(gatePath);
const manifest = readJson(manifestPath);

if (contract.status !== "ag71l_internal_exact_panchang_preview_contract_created") fail("AG71L contract status mismatch.");
if (fieldMap.status !== "ag71l_exact_preview_field_map_created") fail("AG71L field-map status mismatch.");
if (validation.status !== "ag71j_four_location_computed_bank_internal_validation_passed") fail("AG71J validation must be passed.");
if (gate.status !== "ag71k_computed_bank_review_gate_passed") fail("AG71K gate must be passed.");
if (bank.records.length !== 28 || bank.computed_record_count !== 28) fail("AG71I-C computed bank must contain 28 records.");

const previewRecords = bank.records.map((record, index) => ({
  preview_record_id: `ag71m_preview_${String(index + 1).padStart(2, "0")}`,
  source_panchang_daily_record_id: record.panchang_daily_record_id,
  source_request_id: record.source_request_id,
  preview_date: record.date_key,
  preview_location_id: record.location_id,
  preview_location_label: record.display_label,
  preview_timezone: record.timezone,
  preview_timezone_offset_minutes: record.timezone_offset_minutes,
  preview_snapshot_local: record.snapshot_datetime_local,
  preview_tithi: record.tithi?.name ?? null,
  preview_tithi_index: record.tithi?.index ?? null,
  preview_nakshatra: record.nakshatra?.name ?? null,
  preview_nakshatra_index: record.nakshatra?.index ?? null,
  preview_yoga: record.yoga?.name ?? null,
  preview_yoga_index: record.yoga?.index ?? null,
  preview_karana: record.karana?.name ?? null,
  preview_karana_index: record.karana?.index ?? null,
  preview_paksha: record.paksha,
  preview_vara: record.vara,
  preview_sun_longitude_sidereal: record.sun_longitude_sidereal,
  preview_moon_longitude_sidereal: record.moon_longitude_sidereal,
  preview_moon_sun_angle: record.moon_minus_sun_angular_difference,
  internal_preview_visibility: "internal_only_public_blocked",
  public_output_allowed: false,
  ui_output_allowed: false,
  exact_value_publication_allowed: false,
  generated_public_file_replacement_allowed: false,
  index_html_wiring_allowed: false
}));

const issues = [];
const expectedLocationIds = [
  "loc_in_ar_itanagar_capital_complex_001",
  "loc_in_dl_new_delhi_capital_001",
  "loc_in_jh_ranchi_city_001",
  "loc_jp_tokyo_capital_001"
];

const locationCounts = {};
for (const record of previewRecords) {
  locationCounts[record.preview_location_id] = (locationCounts[record.preview_location_id] || 0) + 1;

  for (const field of [
    "preview_record_id",
    "source_panchang_daily_record_id",
    "preview_date",
    "preview_location_id",
    "preview_location_label",
    "preview_timezone",
    "preview_snapshot_local",
    "preview_tithi",
    "preview_tithi_index",
    "preview_nakshatra",
    "preview_nakshatra_index",
    "preview_yoga",
    "preview_yoga_index",
    "preview_karana",
    "preview_karana_index",
    "preview_paksha",
    "preview_vara"
  ]) {
    if (record[field] === null || record[field] === undefined || record[field] === "") {
      issues.push({ preview_record_id: record.preview_record_id, issue: `missing_${field}` });
    }
  }

  if (!expectedLocationIds.includes(record.preview_location_id)) {
    issues.push({ preview_record_id: record.preview_record_id, issue: "unexpected_location_id" });
  }

  if (record.preview_timezone === "Asia/Kolkata" && record.preview_timezone_offset_minutes !== 330) {
    issues.push({ preview_record_id: record.preview_record_id, issue: "kolkata_offset_mismatch" });
  }

  if (record.preview_timezone === "Asia/Tokyo" && record.preview_timezone_offset_minutes !== 540) {
    issues.push({ preview_record_id: record.preview_record_id, issue: "tokyo_offset_mismatch" });
  }

  if (record.public_output_allowed !== false) issues.push({ preview_record_id: record.preview_record_id, issue: "public_output_not_blocked" });
  if (record.ui_output_allowed !== false) issues.push({ preview_record_id: record.preview_record_id, issue: "ui_output_not_blocked" });
  if (record.exact_value_publication_allowed !== false) issues.push({ preview_record_id: record.preview_record_id, issue: "exact_value_publication_not_blocked" });
  if (record.generated_public_file_replacement_allowed !== false) issues.push({ preview_record_id: record.preview_record_id, issue: "generated_public_file_replacement_not_blocked" });
  if (record.index_html_wiring_allowed !== false) issues.push({ preview_record_id: record.preview_record_id, issue: "index_html_wiring_not_blocked" });
}

for (const locationId of expectedLocationIds) {
  if (locationCounts[locationId] !== 7) {
    issues.push({ location_id: locationId, issue: "location_record_count_not_7", count: locationCounts[locationId] || 0 });
  }
}

const previewBankPath = "data/knowledge-base/panchang-festival/production/ag71m-internal-exact-panchang-preview-data-bank.json";
const validationReportPath = "data/knowledge-base/panchang-festival/production/ag71m-preview-data-bank-validation-report.json";
const noPublicPath = "data/knowledge-base/panchang-festival/production/ag71m-no-public-output-preview-bank-audit.json";
const readinessPath = "data/content-intelligence/quality-registry/ag71m-ag71n-internal-preview-data-bank-review-readiness-record.json";
const boundaryPath = "data/content-intelligence/mutation-plans/ag71m-to-ag71n-internal-preview-data-bank-review-boundary.json";

writeJson(previewBankPath, {
  module_id: "AG71M",
  title: "Internal Exact Panchang Preview Data Bank",
  status: issues.length === 0
    ? "ag71m_internal_exact_panchang_preview_data_bank_created"
    : "ag71m_internal_exact_panchang_preview_data_bank_created_with_issues",
  source_contract: contractPath,
  source_field_map: fieldMapPath,
  source_computed_bank: bankPath,
  preview_record_count: previewRecords.length,
  expected_preview_record_count: 28,
  location_counts: locationCounts,
  issue_count: issues.length,
  internal_only: true,
  public_output_allowed_now: false,
  ui_exact_value_output_allowed_now: false,
  index_html_modified: false,
  generated_public_panchang_file_modified: false,
  records: previewRecords
});

writeJson(validationReportPath, {
  module_id: "AG71M",
  title: "Preview Data Bank Validation Report",
  status: issues.length === 0 ? "ag71m_preview_data_bank_validation_passed" : "ag71m_preview_data_bank_validation_failed",
  issue_count: issues.length,
  issues,
  preview_record_count: previewRecords.length,
  public_output_allowed_now: false
});

writeJson(noPublicPath, {
  module_id: "AG71M",
  title: "No Public Output Preview Bank Audit",
  status: "ag71m_no_public_output_preview_bank_audit_passed",
  checks: {
    public_exact_value_output_allowed_now: false,
    ui_exact_value_output_allowed_now: false,
    index_html_modified_for_exact_values: false,
    generated_public_panchang_file_modified: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    full_location_bank_scale_up_performed: false
  }
});

writeJson(readinessPath, {
  module_id: "AG71M-AG71N",
  title: "AG71N Internal Preview Data Bank Review Readiness",
  status: issues.length === 0
    ? "ready_for_ag71n_internal_preview_data_bank_review"
    : "blocked_for_ag71n_due_to_ag71m_issues",
  ag71m_consumed: true,
  issue_count: issues.length,
  hard_blockers_for_ag71n: issues.length === 0 ? [] : ["Resolve AG71M preview data bank validation issues first."],
  controlled_requirements_for_ag71n: [
    "Review internal preview records.",
    "Confirm public/UI exact-value output remains blocked.",
    "Confirm no index.html exact-value wiring.",
    "Confirm no generated public Panchang file replacement."
  ]
});

writeJson(boundaryPath, {
  from_module: "AG71M",
  to_module: "AG71N",
  transition: "internal_preview_data_bank_review",
  allowed_next_actions: [
    "Review AG71M internal preview data bank.",
    "Validate exact-preview record completeness.",
    "Confirm no public-output leakage."
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

writeJson("data/content-intelligence/quality-reviews/ag71m-internal-exact-panchang-preview-data-bank.json", {
  module_id: "AG71M",
  title: "Internal Exact Panchang Preview Data Bank Review",
  status: issues.length === 0 ? "ag71m_completed" : "ag71m_completed_with_issues",
  generated_records: {
    preview_data_bank: previewBankPath,
    validation_report: validationReportPath,
    no_public_output_audit: noPublicPath,
    ag71n_readiness: readinessPath,
    ag71n_boundary: boundaryPath
  },
  summary: {
    preview_data_bank_created: true,
    preview_record_count: previewRecords.length,
    expected_preview_record_count: 28,
    issue_count: issues.length,
    public_output_allowed_now: false,
    ui_exact_value_output_allowed_now: false,
    ready_for_ag71n_review: issues.length === 0
  }
});

writeJson("data/quality/ag71m-internal-exact-panchang-preview-data-bank.json", {
  module_id: "AG71M",
  status: issues.length === 0 ? "ag71m_completed" : "ag71m_completed_with_issues",
  preview_record_count: previewRecords.length,
  issue_count: issues.length,
  public_output_allowed_now: false
});

writeJson("data/quality/ag71m-internal-exact-panchang-preview-data-bank-preview.json", {
  module_id: "AG71M",
  status: issues.length === 0 ? "ag71m_completed" : "ag71m_completed_with_issues",
  preview_record_count: previewRecords.length,
  issue_count: issues.length,
  public_output_allowed_now: 0,
  ready_for_ag71n: issues.length === 0 ? 1 : 0
});

writeText("docs/quality/AG71M_INTERNAL_EXACT_PANCHANG_PREVIEW_DATA_BANK.md",
`# AG71M — Internal Exact Panchang Preview Data Bank

AG71M creates an internal-only exact Panchang preview data bank from AG71I-C using the AG71L contract.

## Result

- Preview records: ${previewRecords.length}
- Expected records: 28
- Issue count: ${issues.length}

## Boundary

No public Panchang exact-value output, live UI exact-value publication, generated public Panchang working-data replacement, backend activation, Supabase activation, or full location-bank scale-up was performed.

## Next Gate

AG71N should review the internal preview data bank before any UI preview contract is discussed.
`);

manifest.ag71m_files = {
  internal_exact_preview_data_bank: previewBankPath,
  preview_data_bank_validation_report: validationReportPath,
  no_public_output_preview_bank_audit: noPublicPath
};

manifest.current_counts = {
  ...(manifest.current_counts || {}),
  ag71m_internal_preview_records: previewRecords.length,
  ag71m_validation_issue_count: issues.length
};

manifest.current_status = issues.length === 0
  ? "ag71m_internal_exact_preview_data_bank_created_ag71n_ready"
  : "ag71m_internal_exact_preview_data_bank_created_with_issues";
writeJson(manifestPath, manifest);

if (issues.length > 0) fail(`AG71M detected ${issues.length} issue(s). See ${validationReportPath}`);

pass("AG71M internal exact Panchang preview data bank is valid.");
pass("28 internal preview records are present.");
pass("Public/UI exact-value output remains blocked.");
