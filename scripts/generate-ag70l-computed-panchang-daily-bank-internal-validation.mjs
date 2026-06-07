import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(data, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

const ag70k = readJson("data/content-intelligence/quality-reviews/ag70k-internal-panchang-daily-computation-engine-dry-run.json");
const computedBank = readJson("data/knowledge-base/panchang-festival/production/panchang-computed-daily-bank-batch-01-internal-dry-run.json");
const dailyBank = readJson("data/knowledge-base/panchang-festival/production/panchang-daily-calculation-bank-batch-01.json");
const locationLock = readJson("data/knowledge-base/panchang-festival/production/panchang-default-location-basis-lock.json");
const ayanamsaLock = readJson("data/knowledge-base/panchang-festival/production/panchang-ayanamsa-basis-lock.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70k.status !== "ag70k_internal_panchang_daily_computation_engine_dry_run_completed") {
  throw new Error("AG70K must be complete before AG70L.");
}
if (ag70k.summary?.ready_for_ag70l !== true) {
  throw new Error("AG70K readiness for AG70L is missing.");
}
if (computedBank.status !== "panchang_daily_calculation_bank_batch_01_computed_internal_dry_run_public_blocked") {
  throw new Error("AG70K computed bank must exist before AG70L.");
}
if (computedBank.records.length !== 7) {
  throw new Error("AG70K computed bank must contain 7 records.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  validationRun: "data/knowledge-base/panchang-festival/production/ag70l-computed-panchang-daily-bank-internal-validation.json",
  validatedDailyBank: "data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json",
  computedDailyBank: "data/knowledge-base/panchang-festival/production/panchang-computed-daily-bank-batch-01-internal-dry-run.json",
  dailyBank: "data/knowledge-base/panchang-festival/production/panchang-daily-calculation-bank-batch-01.json",
  validationReport: "data/knowledge-base/panchang-festival/production/ag70l-internal-formula-validation-report.json",
  boundaryReport: "data/knowledge-base/panchang-festival/production/ag70l-time-window-boundary-validation-report.json",
  lockedBasisReport: "data/knowledge-base/panchang-festival/production/ag70l-locked-basis-validation-report.json",
  noExternalValidationAudit: "data/knowledge-base/panchang-festival/production/ag70l-no-external-panchang-validation-source-audit.json",
  noPublicOutputAudit: "data/knowledge-base/panchang-festival/production/ag70l-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70l-computed-panchang-daily-bank-internal-validation.json",
  readiness: "data/content-intelligence/quality-registry/ag70l-ag70m-festival-observance-rule-bank-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70l-to-ag70m-festival-observance-rule-bank-boundary.json",
  quality: "data/quality/ag70l-computed-panchang-daily-bank-internal-validation.json",
  preview: "data/quality/ag70l-computed-panchang-daily-bank-internal-validation-preview.json",
  doc: "docs/quality/AG70L_COMPUTED_PANCHANG_DAILY_BANK_INTERNAL_VALIDATION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

function expectedTithiIndex(angle) {
  return Math.floor(angle / 12) + 1;
}
function expectedNakshatraIndex(moonLongitude) {
  return Math.floor(moonLongitude / (360 / 27)) + 1;
}
function expectedYogaIndex(combinedLongitude) {
  return Math.floor(combinedLongitude / (360 / 27)) + 1;
}
function expectedKaranaIndex(angle) {
  return Math.floor(angle / 6) + 1;
}
function expectedPaksha(tithiIndex) {
  return tithiIndex <= 15 ? "Shukla Paksha" : "Krishna Paksha";
}
function expectedVara(dateKey) {
  const varaNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [y, m, d] = dateKey.split("-").map(Number);
  return varaNames[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}
function parseDate(value) {
  if (!value) return null;
  return new Date(value).getTime();
}
function withinRange(value, min, max) {
  return typeof value === "number" && value >= min && value < max;
}

const location = locationLock.records[0];
const ayanamsaId = ayanamsaLock.ayanamsa_record.ayanamsa_id;

function validateRecord(record) {
  const issues = [];
  const formulaChecks = [];

  const angle = record.moon_minus_sun_angular_difference;
  const moon = record.moon_longitude_sidereal;
  const combined = record.combined_sidereal_longitude_for_yoga;

  const tithiExpected = expectedTithiIndex(angle);
  const nakExpected = expectedNakshatraIndex(moon);
  const yogaExpected = expectedYogaIndex(combined);
  const karanaExpected = expectedKaranaIndex(angle);
  const pakshaExpected = expectedPaksha(record.tithi?.index);
  const varaExpected = expectedVara(record.date_key);

  const checks = [
    ["tithi_index", record.tithi?.index, tithiExpected],
    ["nakshatra_index", record.nakshatra?.index, nakExpected],
    ["yoga_index", record.yoga?.index, yogaExpected],
    ["karana_index", record.karana?.index, karanaExpected],
    ["paksha", record.paksha, pakshaExpected],
    ["vara", record.vara, varaExpected]
  ];

  for (const [name, actual, expected] of checks) {
    const passed = actual === expected;
    formulaChecks.push({ check: name, actual, expected, passed });
    if (!passed) issues.push(`${name}_mismatch`);
  }

  const rangeChecks = [
    ["sun_longitude_sidereal", record.sun_longitude_sidereal, 0, 360],
    ["moon_longitude_sidereal", record.moon_longitude_sidereal, 0, 360],
    ["moon_minus_sun_angular_difference", record.moon_minus_sun_angular_difference, 0, 360],
    ["combined_sidereal_longitude_for_yoga", record.combined_sidereal_longitude_for_yoga, 0, 360],
    ["tithi_index", record.tithi?.index, 1, 31],
    ["nakshatra_index", record.nakshatra?.index, 1, 28],
    ["yoga_index", record.yoga?.index, 1, 28],
    ["karana_index", record.karana?.index, 1, 61]
  ];

  for (const [name, value, min, max] of rangeChecks) {
    if (!withinRange(value, min, max)) issues.push(`${name}_range_invalid`);
  }

  const timePairs = [
    ["sunrise_sunset", record.sunrise_datetime_local, record.sunset_datetime_local],
    ["tithi_window", record.tithi_start_datetime_local, record.tithi_end_datetime_local],
    ["nakshatra_window", record.nakshatra_start_datetime_local, record.nakshatra_end_datetime_local],
    ["yoga_window", record.yoga_start_datetime_local, record.yoga_end_datetime_local],
    ["karana_window", record.karana_start_datetime_local, record.karana_end_datetime_local]
  ];

  const boundaryChecks = [];
  for (const [name, start, end] of timePairs) {
    const startMs = parseDate(start);
    const endMs = parseDate(end);
    const passed = Number.isFinite(startMs) && Number.isFinite(endMs) && startMs < endMs;
    boundaryChecks.push({ check: name, start, end, passed });
    if (!passed) issues.push(`${name}_invalid`);
  }

  const lockedBasisChecks = [
    ["location_id", record.location_id, location.location_id],
    ["timezone", record.timezone, location.timezone],
    ["ayanamsa_id", record.ayanamsa_id, ayanamsaId],
    ["calculation_model_id", record.calculation_model_id, "drishvara_internal_panchang_model_v1"]
  ];

  const basisChecks = [];
  for (const [name, actual, expected] of lockedBasisChecks) {
    const passed = actual === expected;
    basisChecks.push({ check: name, actual, expected, passed });
    if (!passed) issues.push(`${name}_locked_basis_mismatch`);
  }

  if (record.public_output_allowed !== false) issues.push("public_output_not_blocked");
  if (record.post_computation_manual_verification_status !== "not_started") {
    issues.push("manual_verification_status_should_remain_not_started");
  }

  return {
    panchang_daily_record_id: record.panchang_daily_record_id,
    date_key: record.date_key,
    passed: issues.length === 0,
    issue_count: issues.length,
    issues,
    formula_checks: formulaChecks,
    boundary_checks: boundaryChecks,
    locked_basis_checks: basisChecks
  };
}

const validationRecords = computedBank.records.map(validateRecord);
const issueCount = validationRecords.reduce((sum, item) => sum + item.issue_count, 0);
const passedCount = validationRecords.filter((item) => item.passed).length;

const validatedRecords = computedBank.records.map((record, index) => ({
  ...record,
  record_status: validationRecords[index].passed
    ? "internally_validated_public_blocked"
    : "internal_validation_failed_public_blocked",
  internal_validation_status: validationRecords[index].passed
    ? "internal_validation_passed"
    : "internal_validation_failed",
  internal_validation_stage: "AG70L",
  internal_validation_reference: "AG70I formulas + AG70J locked basis + AG70K computed dry-run values",
  public_output_allowed: false
}));

const validatedDailyBank = {
  ...computedBank,
  status: issueCount === 0
    ? "panchang_daily_calculation_bank_batch_01_internally_validated_public_blocked"
    : "panchang_daily_calculation_bank_batch_01_internal_validation_failed_public_blocked",
  purpose: "Internally validated Batch 01 Panchang daily records against Drishvara internal formulas and locked basis.",
  internal_validation_stage: "AG70L",
  internal_validation_status: issueCount === 0 ? "passed" : "failed",
  internal_validation_issue_count: issueCount,
  internally_validated_record_count: passedCount,
  computed_panchang_daily_record_count: validatedRecords.length,
  public_output_allowed_now: false,
  external_site_validation_count: 0,
  records: validatedRecords
};

const validationRun = {
  module_id: "AG70L",
  title: "Computed Panchang Daily Bank Internal Validation",
  status: issueCount === 0
    ? "ag70l_computed_panchang_daily_bank_internal_validation_completed"
    : "ag70l_computed_panchang_daily_bank_internal_validation_failed",
  purpose: "Validate AG70K computed daily records against AG70I internal formulas and AG70J locked basis only.",
  validation_source: "internal_model_only",
  external_panchang_sites_used_for_validation: false,
  external_panchang_sites_used_as_source_of_truth: false,
  record_count: validatedRecords.length,
  passed_record_count: passedCount,
  issue_count: issueCount,
  public_output_allowed_now: false
};

const validationReport = {
  module_id: "AG70L",
  title: "Internal Formula Validation Report",
  status: issueCount === 0 ? "internal_formula_validation_passed" : "internal_formula_validation_failed",
  validation_basis: [
    "Tithi = floor(Moon-Sun angle / 12) + 1",
    "Nakshatra = floor(Moon sidereal longitude / 13°20′) + 1",
    "Yoga = floor((Sun sidereal + Moon sidereal) / 13°20′) + 1",
    "Karana = floor(Moon-Sun angle / 6) + 1",
    "Paksha from Tithi half",
    "Vara from civil local date for preliminary dry-run"
  ],
  issue_count: issueCount,
  records: validationRecords.map((item) => ({
    panchang_daily_record_id: item.panchang_daily_record_id,
    date_key: item.date_key,
    formula_checks: item.formula_checks,
    issue_count: item.issues.filter((issue) => issue.includes("mismatch") || issue.includes("range")).length
  }))
};

const boundaryReport = {
  module_id: "AG70L",
  title: "Time Window Boundary Validation Report",
  status: validationRecords.every((item) => item.boundary_checks.every((x) => x.passed))
    ? "time_window_boundary_validation_passed"
    : "time_window_boundary_validation_failed",
  validation_basis: [
    "Sunrise must be before sunset.",
    "Tithi window start must be before end.",
    "Nakshatra window start must be before end.",
    "Yoga window start must be before end.",
    "Karana window start must be before end."
  ],
  records: validationRecords.map((item) => ({
    panchang_daily_record_id: item.panchang_daily_record_id,
    date_key: item.date_key,
    boundary_checks: item.boundary_checks
  }))
};

const lockedBasisReport = {
  module_id: "AG70L",
  title: "Locked Basis Validation Report",
  status: validationRecords.every((item) => item.locked_basis_checks.every((x) => x.passed))
    ? "locked_basis_validation_passed"
    : "locked_basis_validation_failed",
  locked_basis: {
    location_id: location.location_id,
    timezone: location.timezone,
    ayanamsa_id: ayanamsaId,
    calculation_model_id: "drishvara_internal_panchang_model_v1"
  },
  records: validationRecords.map((item) => ({
    panchang_daily_record_id: item.panchang_daily_record_id,
    date_key: item.date_key,
    locked_basis_checks: item.locked_basis_checks
  }))
};

const noExternalValidationAudit = {
  module_id: "AG70L",
  title: "No External Panchang Validation Source Audit",
  status: "no_external_panchang_validation_source_audit_passed",
  external_panchang_sites_used_as_source: false,
  external_panchang_sites_used_for_data_generation: false,
  external_panchang_sites_used_as_runtime_dependency: false,
  external_panchang_sites_used_as_production_validation_source: false,
  external_panchang_sites_used_for_public_claim: false,
  external_panchang_sites_allowed_only_for_later_manual_post_output_comparison: true,
  external_validation_reference_count: 0
};

const noPublicOutputAudit = {
  module_id: "AG70L",
  title: "No Public Output Audit",
  status: "no_public_output_audit_passed",
  public_panchang_output_allowed_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  observance_events_created_now: 0,
  eclipse_events_created_now: 0,
  context_interpretation_records_created_now: 0,
  supabase_activation_performed: false,
  backend_runtime_activated: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_computed_panchang_daily_bank_internal_validation",
  current_status: issueCount === 0
    ? "panchang_daily_calculation_bank_batch_01_internally_validated_public_blocked"
    : "panchang_daily_calculation_bank_batch_01_internal_validation_failed_public_blocked",
  ag70l_files: {
    validation_run: outputs.validationRun,
    validated_daily_bank: outputs.validatedDailyBank,
    updated_computed_daily_bank: outputs.computedDailyBank,
    updated_daily_bank: outputs.dailyBank,
    validation_report: outputs.validationReport,
    boundary_report: outputs.boundaryReport,
    locked_basis_report: outputs.lockedBasisReport,
    no_external_validation_audit: outputs.noExternalValidationAudit,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    panchang_daily_records: validatedRecords.length,
    computed_internal_dry_run_records: validatedRecords.length,
    internally_validated_panchang_daily_records: passedCount,
    internal_validation_issue_count: issueCount,
    observance_events: 0,
    eclipse_events: 0,
    context_interpretation_records: 0
  },
  next_required_stage: "AG70M — Festival / Observance Rule Bank Batch 01"
};

const review = {
  module_id: "AG70L",
  title: "Computed Panchang Daily Bank Internal Validation",
  status: issueCount === 0
    ? "ag70l_computed_panchang_daily_bank_internal_validation_completed"
    : "ag70l_computed_panchang_daily_bank_internal_validation_failed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70k_review: "data/content-intelligence/quality-reviews/ag70k-internal-panchang-daily-computation-engine-dry-run.json",
    computed_daily_bank: "data/knowledge-base/panchang-festival/production/panchang-computed-daily-bank-batch-01-internal-dry-run.json"
  },
  generated_records: outputs,
  summary: {
    internal_validation_completed: true,
    internal_validation_passed: issueCount === 0,
    validated_record_count: passedCount,
    total_record_count: validatedRecords.length,
    internal_validation_issue_count: issueCount,
    formula_validation_completed: true,
    boundary_validation_completed: true,
    locked_basis_validation_completed: true,
    external_panchang_sites_used_as_validation_source: false,
    external_panchang_sites_used_as_source_of_truth: false,
    external_panchang_sites_used_for_data_generation: false,
    external_panchang_sites_allowed_only_later_for_manual_comparison: true,
    public_panchang_output_allowed_now: false,
    actual_observance_events_created_now: false,
    actual_eclipse_events_created_now: false,
    context_interpretation_records_created_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70m: issueCount === 0
  }
};

const readiness = {
  module_id: "AG70L",
  title: "AG70M Festival / Observance Rule Bank Readiness Record",
  status: issueCount === 0
    ? "ready_for_ag70m_festival_observance_rule_bank"
    : "blocked_for_ag70m_due_to_internal_validation_issues",
  ready_for_ag70m: issueCount === 0,
  next_stage: "AG70M — Festival / Observance Rule Bank Batch 01",
  reason: issueCount === 0
    ? "Computed Panchang daily Batch 01 passed internal model validation. Festival/observance rules can now be created without publishing events."
    : "Computed Panchang daily Batch 01 has internal validation issues and must be corrected before festival/observance rule bank work."
};

const boundary = {
  module_id: "AG70L",
  title: "AG70L to AG70M Festival / Observance Rule Bank Boundary",
  status: "ag70m_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create festival/observance rule-bank records.",
    "Define rule logic for Ekadashi and selected observance types.",
    "Keep event computation/publication blocked until rule validation.",
    "Keep external Panchang sites outside production data-generation and validation."
  ],
  blocked_scope_without_explicit_approval: [
    "public Panchang output",
    "actual festival/observance event publication",
    "actual eclipse event publication",
    "context interpretation production records",
    "generated/word-of-day.json replacement",
    "homepage UI change",
    "runtime Word selector activation",
    "Supabase/database writes",
    "backend/Auth activation",
    "external Panchang site as source of truth",
    "external Panchang site as data-generation input",
    "external Panchang site as runtime dependency",
    "external Panchang site as production validation source"
  ]
};

const quality = {
  module_id: "AG70L",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70L",
  status: review.status,
  internal_validation_passed: issueCount === 0 ? 1 : 0,
  validated_record_count: passedCount,
  total_record_count: validatedRecords.length,
  internal_validation_issue_count: issueCount,
  external_validation_reference_count: 0,
  public_panchang_output_allowed_now: 0,
  observance_events_created_now: 0,
  eclipse_events_created_now: 0,
  context_interpretation_records_created_now: 0,
  ready_for_ag70m: issueCount === 0 ? 1 : 0
};

const doc = `# AG70L — Computed Panchang Daily Bank Internal Validation

AG70L validates AG70K computed Panchang daily records using Drishvara internal model rules only.

## Validation basis

- AG70I internal computation formulas.
- AG70J locked location: Itanagar, Arunachal Pradesh, India.
- AG70J locked timezone: Asia/Kolkata.
- AG70J locked ayanamsa: Lahiri / Chitrapaksha internal v1.
- AG70K internally computed dry-run values.

## External site rule

External Panchang sites are not used as source, runtime dependency, data-generation input, or production validation source.

They remain allowed only later for manual post-output comparison.

## Created

- Internal validation run record.
- Validated daily bank Batch 01.
- Formula validation report.
- Time-window boundary validation report.
- Locked-basis validation report.
- No external validation source audit.
- No public output audit.

## Not done

- No public Panchang output.
- No festival/observance event publication.
- No eclipse event publication.
- No context interpretation records.
- No generated Word output.
- No UI/backend/Supabase activation.
`;

writeJson(outputs.validationRun, validationRun);
writeJson(outputs.validatedDailyBank, validatedDailyBank);
writeJson(outputs.computedDailyBank, validatedDailyBank);
writeJson(outputs.dailyBank, validatedDailyBank);
writeJson(outputs.validationReport, validationReport);
writeJson(outputs.boundaryReport, boundaryReport);
writeJson(outputs.lockedBasisReport, lockedBasisReport);
writeJson(outputs.noExternalValidationAudit, noExternalValidationAudit);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70L computed Panchang daily bank internal validation generated.");
console.log(`✅ Records validated: ${passedCount}/${validatedRecords.length}; issues: ${issueCount}.`);
console.log("✅ External Panchang sites excluded from production validation.");
console.log("✅ Public output, UI, backend and Supabase remain blocked.");
