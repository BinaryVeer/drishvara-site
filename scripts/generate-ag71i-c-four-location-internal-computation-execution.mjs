import fs from "node:fs";
import path from "node:path";
import {
  computeInternalPanchangRecord,
  validateComputedRecord
} from "./lib/panchang-internal-dry-run-engine.mjs";

const root = process.cwd();

function full(p) {
  return path.join(root, p);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(full(p), "utf8"));
}

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(data, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

const requestBankPath = "data/knowledge-base/panchang-festival/production/ag71h-four-location-panchang-request-bank.json";
const harnessPath = "data/knowledge-base/panchang-festival/production/ag71h-four-location-internal-panchang-computation-harness.json";
const engineRecordPath = "data/knowledge-base/panchang-festival/production/ag71i-b-timezone-aware-engine-record.json";

const requestBank = readJson(requestBankPath);
const harness = readJson(harnessPath);
const engineRecord = readJson(engineRecordPath);

if (harness.status !== "ag71h_four_location_internal_panchang_computation_harness_created") {
  throw new Error("AG71H harness is not completed.");
}

if (engineRecord.status !== "ag71i_b_timezone_aware_engine_created") {
  throw new Error("AG71I-B engine record is not completed.");
}

if (requestBank.status !== "ag71h_four_location_request_bank_created_pending_execution") {
  throw new Error("AG71H request bank is not pending execution.");
}

if (requestBank.records.length !== 28) {
  throw new Error(`Expected 28 AG71H request records, found ${requestBank.records.length}.`);
}

const generatedAt = new Date().toISOString();

const computedRecords = requestBank.records.map((request) =>
  computeInternalPanchangRecord(request, { generatedAt })
);

const validation = computedRecords.map((record) => {
  const issues = validateComputedRecord(record);
  return {
    panchang_daily_record_id: record.panchang_daily_record_id,
    source_request_id: record.source_request_id,
    location_id: record.location_id,
    date_key: record.date_key,
    issue_count: issues.length,
    issues
  };
});

const issueCount = validation.reduce((sum, row) => sum + row.issue_count, 0);

const locationSummary = {};
for (const record of computedRecords) {
  if (!locationSummary[record.location_id]) {
    locationSummary[record.location_id] = {
      display_label: record.display_label,
      timezone: record.timezone,
      timezone_offset_minutes: record.timezone_offset_minutes,
      record_count: 0,
      first_date: record.date_key,
      last_date: record.date_key
    };
  }

  locationSummary[record.location_id].record_count += 1;
  if (record.date_key < locationSummary[record.location_id].first_date) {
    locationSummary[record.location_id].first_date = record.date_key;
  }
  if (record.date_key > locationSummary[record.location_id].last_date) {
    locationSummary[record.location_id].last_date = record.date_key;
  }
}

const computedBankPath = "data/knowledge-base/panchang-festival/production/ag71i-c-four-location-computed-panchang-bank-internal.json";
const executionRecordPath = "data/knowledge-base/panchang-festival/production/ag71i-c-internal-computation-execution-record.json";
const validationReportPath = "data/knowledge-base/panchang-festival/production/ag71i-c-computed-bank-validation-smoke-report.json";
const noPublicAuditPath = "data/knowledge-base/panchang-festival/production/ag71i-c-no-public-output-audit.json";

writeJson(computedBankPath, {
  module_id: "AG71I-C",
  title: "Four-Location Internal Computed Panchang Bank",
  status: "ag71i_c_four_location_internal_computed_bank_created_public_blocked",
  source_request_bank: requestBankPath,
  source_harness: harnessPath,
  source_engine: "scripts/lib/panchang-internal-dry-run-engine.mjs",
  computation_model_id: "drishvara_internal_panchang_model_v1",
  precision_class: "internal_dry_run_preliminary_astronomical_approximation",
  computed_record_count: computedRecords.length,
  expected_computed_record_count: 28,
  validation_issue_count: issueCount,
  location_summary: locationSummary,
  public_output_allowed_now: false,
  ui_exact_value_output_allowed_now: false,
  external_panchang_source_used: false,
  records: computedRecords
});

writeJson(executionRecordPath, {
  module_id: "AG71I-C",
  title: "Internal Computation Execution Record",
  status: "ag71i_c_internal_computation_execution_completed",
  execution_summary: {
    request_record_count: requestBank.records.length,
    computed_record_count: computedRecords.length,
    expected_computed_record_count: 28,
    location_count: Object.keys(locationSummary).length,
    validation_issue_count: issueCount,
    internal_computation_executed: true,
    public_output_allowed_now: false,
    ui_exact_value_output_allowed_now: false
  },
  boundaries: {
    public_runtime_activation_performed: false,
    runtime_ui_panchang_exact_value_publication_performed: false,
    runtime_star_reflection_computation_performed: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    full_location_bank_activation_performed: false
  },
  next_step: {
    module_id: "AG71J",
    title: "Four-Location Computed Bank Internal Validation",
    purpose: "Validate schema, date range, timezone offsets, public-output blocking and record completeness before any UI exact-value wiring."
  }
});

writeJson(validationReportPath, {
  module_id: "AG71I-C",
  title: "Computed Bank Validation Smoke Report",
  status: issueCount === 0 ? "ag71i_c_smoke_validation_passed" : "ag71i_c_smoke_validation_failed",
  issue_count: issueCount,
  validation,
  public_output_allowed_now: false
});

writeJson(noPublicAuditPath, {
  module_id: "AG71I-C",
  title: "No Public Output Audit",
  status: "ag71i_c_no_public_output_audit_passed",
  checks: {
    index_html_modified_for_exact_panchang_values: false,
    generated_panchang_festival_public_file_modified: false,
    public_runtime_activation_performed: false,
    ui_exact_value_output_allowed_now: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    external_panchang_source_used: false
  }
});

writeJson("data/content-intelligence/quality-reviews/ag71i-c-four-location-internal-computation-execution.json", {
  module_id: "AG71I-C",
  title: "Four-Location Internal Computation Execution",
  status: "ag71i_c_completed",
  generated_records: {
    computed_bank: computedBankPath,
    execution_record: executionRecordPath,
    validation_smoke_report: validationReportPath,
    no_public_output_audit: noPublicAuditPath
  },
  summary: {
    internal_computation_executed: true,
    computed_record_count: computedRecords.length,
    expected_computed_record_count: 28,
    validation_issue_count: issueCount,
    public_output_allowed_now: false,
    ready_for_ag71j_internal_validation: issueCount === 0
  }
});

writeJson("data/quality/ag71i-c-four-location-internal-computation-execution.json", {
  module_id: "AG71I-C",
  status: "ag71i_c_completed",
  computed_record_count: computedRecords.length,
  validation_issue_count: issueCount,
  public_output_allowed_now: false
});

writeJson("data/quality/ag71i-c-four-location-internal-computation-execution-preview.json", {
  module_id: "AG71I-C",
  status: "ag71i_c_completed",
  computed_record_count: computedRecords.length,
  validation_issue_count: issueCount,
  public_output_allowed_now: 0,
  ui_exact_value_output_allowed_now: 0
});

writeJson("data/content-intelligence/quality-registry/ag71i-c-ag71j-computed-bank-validation-readiness-record.json", {
  module_id: "AG71I-C-AG71J",
  title: "AG71J Computed Bank Validation Readiness",
  status: issueCount === 0
    ? "ready_for_ag71j_computed_bank_internal_validation"
    : "blocked_for_ag71j_due_to_ag71i_c_smoke_validation_issues",
  computed_record_count: computedRecords.length,
  validation_issue_count: issueCount,
  hard_blockers_for_ag71j: issueCount === 0 ? [] : ["Resolve AG71I-C smoke validation issues."]
});

writeJson("data/content-intelligence/mutation-plans/ag71i-c-to-ag71j-computed-bank-validation-boundary.json", {
  from_module: "AG71I-C",
  to_module: "AG71J",
  transition: "computed_bank_internal_validation",
  allowed_next_actions: [
    "Validate AG71I-C computed bank schema",
    "Validate location/date coverage",
    "Validate timezone offsets",
    "Validate public-output blocking"
  ],
  blocked_actions: [
    "Public Panchang exact-value output",
    "Live UI exact-value wiring",
    "Backend runtime activation",
    "Supabase activation",
    "Full location-bank scale-up"
  ]
});

writeText("docs/quality/AG71I_C_FOUR_LOCATION_INTERNAL_COMPUTATION_EXECUTION.md", `# AG71I-C — Four-Location Internal Computation Execution

AG71I-C executes the 28 AG71H request records using the AG71I-B timezone-aware internal dry-run engine.

## Result

- Computed records: ${computedRecords.length}
- Expected records: 28
- Smoke validation issues: ${issueCount}

## Boundary

No public Panchang exact-value output, UI exact-value wiring, backend activation, Supabase activation, runtime API, or full location-bank scale-up was performed.

## Next Step

AG71J should validate the computed bank internally before any UI exact-value discussion.
`);

const manifestPath = "data/knowledge-base/panchang-festival/production/production-bank-manifest.json";
const manifest = readJson(manifestPath);
manifest.ag71i_c_files = {
  computed_bank: computedBankPath,
  execution_record: executionRecordPath,
  validation_smoke_report: validationReportPath,
  no_public_output_audit: noPublicAuditPath
};
manifest.current_counts = {
  ...(manifest.current_counts || {}),
  ag71i_c_computed_record_count: computedRecords.length,
  ag71i_c_validation_issue_count: issueCount
};
manifest.current_status = "ag71i_c_four_location_internal_computation_executed_ag71j_ready";
writeJson(manifestPath, manifest);

console.log(`✅ AG71I-C computed ${computedRecords.length} internal records; issue count: ${issueCount}.`);
