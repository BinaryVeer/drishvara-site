import fs from "node:fs";
import path from "node:path";
import {
  AG74N_ENGINE_VERSION,
  classifyLunarInterval,
  generateVaranasiSamvatYear
} from "./lib/ag74n-panchang-calendar-engine.mjs";

const root = process.cwd();
const annualPath =
  "data/knowledge-base/panchang-festival/production/ag74n-varanasi-samvat-2083-annual-calendar.json";
const festivalPath =
  "data/knowledge-base/panchang-festival/production/ag74n-festival-observance-candidate-bank-samvat-2083.json";
const fixturePath =
  "data/knowledge-base/panchang-festival/production/ag74n-validation-fixtures.json";
const resultPath =
  "data/knowledge-base/panchang-festival/production/ag74n-validation-results.json";

function writeJson(relativePath, value) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + "\n");
}

function valueAt(object, dottedPath) {
  return dottedPath.split(".").reduce(
    (value, key) =>
      value === null || value === undefined
        ? undefined
        : value[key],
    object
  );
}

function sameValue(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

const fixtures = JSON.parse(
  fs.readFileSync(path.join(root, fixturePath), "utf8")
);
const generated = generateVaranasiSamvatYear(2026, { root });
const festivalBank = {
  module_id: "AG74N",
  title:
    "Festival and Observance Candidate Bank — Vikram Samvat 2083",
  status:
    "ag74n_condition_candidate_bank_generated_final_dates_public_blocked",
  engine_version: AG74N_ENGINE_VERSION,
  samvat_year: generated.samvat_year,
  place_id: "varanasi_in",
  timezone: "Asia/Kolkata",
  calendar_completeness_status:
    "blocked_pending_rule_review",
  ...generated.festival_observance_result_bank,
  public_output_allowed: false
};

const annualCalendar = {
  ...generated,
  festival_observance_result_bank: {
    path: festivalPath,
    calendar_completeness_status:
      festivalBank.calendar_completeness_status,
    normalized_rule_count:
      festivalBank.normalized_rule_count,
    source_reviewed_rule_count:
      festivalBank.source_reviewed_rule_count,
    condition_candidate_count:
      festivalBank.condition_candidate_count,
    skipped_conflict_count:
      festivalBank.skipped_conflict_count,
    final_observance_date_approved_count:
      festivalBank.final_observance_date_approved_count
  }
};

const checks = [];
for (const fixture of fixtures.reference_checks) {
  const actual = valueAt(annualCalendar, fixture.path);
  checks.push({
    test_id: fixture.test_id,
    kind: "annual_reference",
    path: fixture.path,
    expected: fixture.expected,
    actual,
    passed: sameValue(actual, fixture.expected)
  });
}

for (const fixture of fixtures.festival_checks) {
  const actual = valueAt(festivalBank, fixture.path);
  checks.push({
    test_id: fixture.test_id,
    kind: "festival_reference",
    path: fixture.path,
    expected: fixture.expected,
    actual,
    passed: sameValue(actual, fixture.expected)
  });
}

for (const fixture of fixtures.synthetic_interval_checks) {
  const actual = classifyLunarInterval(
    fixture.solar_sign_at_start_index,
    fixture.solar_ingress_count
  );
  for (const [field, expected] of Object.entries(
    fixture.expected
  )) {
    const actualValue = valueAt(actual, field);
    checks.push({
      test_id: `${fixture.test_id}:${field}`,
      kind: "synthetic_interval",
      path: field,
      expected,
      actual: actualValue,
      passed: sameValue(actualValue, expected)
    });
  }
}

const failed = checks.filter((check) => !check.passed);
const validationResults = {
  module_id: "AG74N",
  title: "Festival and Annual Calendar Validation Results",
  status:
    failed.length === 0
      ? "ag74n_festival_annual_calendar_validation_passed"
      : "ag74n_festival_annual_calendar_validation_failed",
  engine_version: AG74N_ENGINE_VERSION,
  summary: {
    total_check_count: checks.length,
    passed_check_count: checks.length - failed.length,
    failed_check_count: failed.length
  },
  reference_samvat_year: annualCalendar.samvat_year,
  annual_daily_record_count:
    annualCalendar.daily_record_count,
  condition_candidate_count:
    festivalBank.condition_candidate_count,
  final_observance_date_approved_count:
    festivalBank.final_observance_date_approved_count,
  calendar_completeness_status:
    festivalBank.calendar_completeness_status,
  public_output_allowed: false,
  public_ui_modified: false,
  external_api_used: false,
  checks
};

writeJson(annualPath, annualCalendar);
writeJson(festivalPath, festivalBank);
writeJson(resultPath, validationResults);

if (failed.length > 0) {
  console.error(JSON.stringify(failed, null, 2));
  process.exit(1);
}

console.log(
  `✅ AG74N Varanasi annual calendar generated: Vikram Samvat ${annualCalendar.samvat_year}, ${annualCalendar.daily_record_count} civil dates.`
);
console.log(
  "✅ Four pages, twelve canonical slots, Adhika/Nija nesting and year-edge Chaitra segments validated."
);
console.log(
  `✅ Festival condition candidates: ${festivalBank.condition_candidate_count}; approved final observance dates: 0.`
);
console.log(
  "✅ Public festival dates/windows remain blocked because the inherited seven-rule inventory is pending traditional source review."
);
console.log(
  "✅ No public UI/CSS change, backend service, Supabase, external API or persistent location storage was activated."
);
