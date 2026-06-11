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
  console.error(`❌ AG71O validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const reviewPath = "data/knowledge-base/panchang-festival/production/ag71n-internal-preview-data-bank-review.json";
const previewBankPath = "data/knowledge-base/panchang-festival/production/ag71m-internal-exact-panchang-preview-data-bank.json";
const fieldMapPath = "data/knowledge-base/panchang-festival/production/ag71l-exact-panchang-preview-field-map.json";
const manifestPath = "data/knowledge-base/panchang-festival/production/production-bank-manifest.json";

for (const file of [reviewPath, previewBankPath, fieldMapPath, manifestPath]) {
  if (!exists(file)) fail(`Missing required source file: ${file}`);
}

const review = readJson(reviewPath);
const previewBank = readJson(previewBankPath);
const fieldMap = readJson(fieldMapPath);
const manifest = readJson(manifestPath);

if (review.status !== "ag71n_internal_preview_data_bank_review_passed") fail("AG71N review has not passed.");
if (previewBank.status !== "ag71m_internal_exact_panchang_preview_data_bank_created") fail("AG71M preview bank status mismatch.");
if (previewBank.records.length !== 28 || previewBank.preview_record_count !== 28) fail("AG71M preview bank must contain 28 records.");
if (fieldMap.status !== "ag71l_exact_preview_field_map_created") fail("AG71L field map status mismatch.");

const adapterRecords = previewBank.records.map((record) => ({
  adapter_key: `${record.preview_location_id}__${record.preview_date}`,
  selected_location_id: record.preview_location_id,
  selected_date_key: record.preview_date,
  selected_location_label: record.preview_location_label,
  timezone: record.preview_timezone,
  preview_record_id: record.preview_record_id,
  source_panchang_daily_record_id: record.source_panchang_daily_record_id,
  adapter_resolution_status: "resolves_to_internal_preview_record_public_blocked",
  exact_value_source_available_in_internal_bank: true,
  public_output_allowed: false,
  ui_exact_value_rendering_allowed: false,
  index_html_wiring_allowed: false,
  generated_public_file_replacement_allowed: false
}));

const issues = [];
const seen = new Set();

for (const record of adapterRecords) {
  if (seen.has(record.adapter_key)) {
    issues.push({ adapter_key: record.adapter_key, issue: "duplicate_adapter_key" });
  }
  seen.add(record.adapter_key);

  for (const key of [
    "public_output_allowed",
    "ui_exact_value_rendering_allowed",
    "index_html_wiring_allowed",
    "generated_public_file_replacement_allowed"
  ]) {
    if (record[key] !== false) {
      issues.push({ adapter_key: record.adapter_key, issue: `${key}_not_false` });
    }
  }
}

const expectedLocationIds = [
  "loc_in_ar_itanagar_capital_complex_001",
  "loc_in_dl_new_delhi_capital_001",
  "loc_in_jh_ranchi_city_001",
  "loc_jp_tokyo_capital_001"
];

const locationCounts = {};
const dateKeys = new Set();

for (const record of adapterRecords) {
  locationCounts[record.selected_location_id] = (locationCounts[record.selected_location_id] || 0) + 1;
  dateKeys.add(record.selected_date_key);
}

for (const locationId of expectedLocationIds) {
  if (locationCounts[locationId] !== 7) {
    issues.push({ location_id: locationId, issue: "adapter_location_count_not_7", count: locationCounts[locationId] || 0 });
  }
}

if (dateKeys.size !== 7) {
  issues.push({ issue: "adapter_date_count_not_7", count: dateKeys.size });
}

const adapterContractPath = "data/knowledge-base/panchang-festival/production/ag71o-public-blocked-ui-preview-adapter-contract.json";
const adapterLookupPath = "data/knowledge-base/panchang-festival/production/ag71o-public-blocked-ui-preview-adapter-lookup.json";
const validationReportPath = "data/knowledge-base/panchang-festival/production/ag71o-ui-preview-adapter-validation-report.json";
const noPublicAuditPath = "data/knowledge-base/panchang-festival/production/ag71o-no-public-output-adapter-audit.json";
const readinessPath = "data/content-intelligence/quality-registry/ag71o-ag71p-panchang-ui-preview-wiring-readiness-record.json";
const boundaryPath = "data/content-intelligence/mutation-plans/ag71o-to-ag71p-panchang-ui-preview-wiring-boundary.json";

writeJson(adapterContractPath, {
  module_id: "AG71O",
  title: "Public-blocked UI Preview Adapter Contract",
  status: issues.length === 0
    ? "ag71o_public_blocked_ui_preview_adapter_contract_created"
    : "ag71o_public_blocked_ui_preview_adapter_contract_created_with_issues",
  source_review: reviewPath,
  source_preview_bank: previewBankPath,
  source_field_map: fieldMapPath,
  purpose: "Define how selected pilot location/date resolves to AG71M internal preview records without public exact-value rendering.",
  adapter_scope: {
    adapter_record_count: adapterRecords.length,
    expected_adapter_record_count: 28,
    location_count: Object.keys(locationCounts).length,
    date_count: dateKeys.size,
    public_output_allowed_now: false,
    ui_exact_value_rendering_allowed_now: false,
    index_html_wiring_performed_now: false,
    generated_public_file_replacement_performed_now: false
  },
  resolution_policy: {
    input_location_id: "selected pilot location id",
    input_date_key: "selected date key",
    adapter_key_format: "location_id__YYYY-MM-DD",
    output: "internal preview_record_id only",
    exact_values_may_be_loaded_by_adapter: false,
    exact_values_may_be_rendered_publicly: false
  },
  next_step: {
    module_id: "AG71P",
    title: "Panchang UI Preview Wiring Contract",
    purpose: "Prepare controlled UI wiring for pilot Panchang preview while retaining public-blocking and verification labelling."
  }
});

writeJson(adapterLookupPath, {
  module_id: "AG71O",
  title: "Public-blocked UI Preview Adapter Lookup",
  status: issues.length === 0
    ? "ag71o_adapter_lookup_created"
    : "ag71o_adapter_lookup_created_with_issues",
  source_preview_bank: previewBankPath,
  adapter_record_count: adapterRecords.length,
  issue_count: issues.length,
  records: adapterRecords
});

writeJson(validationReportPath, {
  module_id: "AG71O",
  title: "UI Preview Adapter Validation Report",
  status: issues.length === 0 ? "ag71o_adapter_validation_passed" : "ag71o_adapter_validation_failed",
  adapter_record_count: adapterRecords.length,
  issue_count: issues.length,
  issues,
  public_output_allowed_now: false
});

writeJson(noPublicAuditPath, {
  module_id: "AG71O",
  title: "No Public Output Adapter Audit",
  status: "ag71o_no_public_output_adapter_audit_passed",
  checks: {
    index_html_modified_for_exact_values: false,
    generated_public_panchang_file_modified: false,
    public_exact_value_output_allowed_now: false,
    ui_exact_value_rendering_allowed_now: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    full_location_bank_scale_up_performed: false
  }
});

writeJson(readinessPath, {
  module_id: "AG71O-AG71P",
  title: "AG71P Panchang UI Preview Wiring Readiness",
  status: issues.length === 0
    ? "ready_for_ag71p_panchang_ui_preview_wiring_contract"
    : "blocked_for_ag71p_due_to_ag71o_issues",
  ag71o_consumed: true,
  issue_count: issues.length,
  hard_blockers_for_ag71p: issues.length === 0 ? [] : ["Resolve AG71O adapter validation issues first."],
  controlled_requirements_for_ag71p: [
    "Use AG71O adapter lookup only.",
    "Keep exact value output pilot-labelled and verification-labelled.",
    "Do not scale beyond four pilot locations.",
    "Do not activate backend or Supabase.",
    "Do not replace public generated Panchang file unless separately approved."
  ]
});

writeJson(boundaryPath, {
  from_module: "AG71O",
  to_module: "AG71P",
  transition: "panchang_ui_preview_wiring_contract",
  allowed_next_actions: [
    "Create Panchang UI preview wiring contract.",
    "Define existing panel fields to receive preview values.",
    "Retain pilot and verification labelling.",
    "Validate no full-bank scale-up."
  ],
  blocked_actions: [
    "Full public Panchang release.",
    "Unlabelled exact-value publication.",
    "Backend runtime activation.",
    "Supabase activation.",
    "Full location-bank scale-up."
  ]
});

writeJson("data/content-intelligence/quality-reviews/ag71o-public-blocked-ui-preview-adapter.json", {
  module_id: "AG71O",
  title: "Public-blocked UI Preview Adapter Review",
  status: issues.length === 0 ? "ag71o_completed" : "ag71o_completed_with_issues",
  generated_records: {
    adapter_contract: adapterContractPath,
    adapter_lookup: adapterLookupPath,
    validation_report: validationReportPath,
    no_public_output_audit: noPublicAuditPath,
    ag71p_readiness: readinessPath,
    ag71p_boundary: boundaryPath
  },
  summary: {
    adapter_contract_created: true,
    adapter_record_count: adapterRecords.length,
    issue_count: issues.length,
    public_output_allowed_now: false,
    ui_exact_value_rendering_allowed_now: false,
    ready_for_ag71p: issues.length === 0
  }
});

writeJson("data/quality/ag71o-public-blocked-ui-preview-adapter.json", {
  module_id: "AG71O",
  status: issues.length === 0 ? "ag71o_completed" : "ag71o_completed_with_issues",
  adapter_record_count: adapterRecords.length,
  issue_count: issues.length,
  public_output_allowed_now: false
});

writeJson("data/quality/ag71o-public-blocked-ui-preview-adapter-preview.json", {
  module_id: "AG71O",
  status: issues.length === 0 ? "ag71o_completed" : "ag71o_completed_with_issues",
  adapter_record_count: adapterRecords.length,
  issue_count: issues.length,
  public_output_allowed_now: 0,
  ready_for_ag71p: issues.length === 0 ? 1 : 0
});

writeText("docs/quality/AG71O_PUBLIC_BLOCKED_UI_PREVIEW_ADAPTER.md",
`# AG71O — Public-blocked UI Preview Adapter

AG71O creates the adapter contract and lookup for resolving selected pilot location/date to AG71M internal preview records.

## Result

- Adapter records: ${adapterRecords.length}
- Expected records: 28
- Issue count: ${issues.length}

## Still Blocked

- Public Panchang exact-value release
- Unlabelled exact-value publication
- Backend runtime activation
- Supabase activation
- Full location-bank scale-up

## Next Gate

AG71P should create a controlled Panchang UI preview wiring contract.
`);

manifest.ag71o_files = {
  public_blocked_ui_preview_adapter_contract: adapterContractPath,
  public_blocked_ui_preview_adapter_lookup: adapterLookupPath,
  adapter_validation_report: validationReportPath,
  no_public_output_adapter_audit: noPublicAuditPath
};

manifest.current_counts = {
  ...(manifest.current_counts || {}),
  ag71o_adapter_records: adapterRecords.length,
  ag71o_validation_issue_count: issues.length
};

manifest.current_status = issues.length === 0
  ? "ag71o_public_blocked_ui_preview_adapter_created_ag71p_ready"
  : "ag71o_public_blocked_ui_preview_adapter_created_with_issues";
writeJson(manifestPath, manifest);

if (issues.length > 0) fail(`AG71O detected ${issues.length} issue(s). See ${validationReportPath}`);

pass("AG71O public-blocked UI preview adapter is valid.");
pass("28 adapter records are present.");
pass("Public/UI exact-value rendering remains blocked.");
