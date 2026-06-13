import fs from "node:fs";
import path from "node:path";
import {
  AG74M_ORCHESTRATOR_VERSION,
  orchestrateAg74mPanchangDay
} from "./lib/ag74m-panchang-day-orchestrator.mjs";

const root = process.cwd();
const fixturesPath =
  "data/knowledge-base/panchang-festival/production/ag74m-day-orchestration-benchmark-fixtures.json";
const outputPath =
  "data/knowledge-base/panchang-festival/production/ag74m-day-orchestration-validation-results.json";

const fixtures = JSON.parse(
  fs.readFileSync(path.join(root, fixturesPath), "utf8")
);

function valueAt(object, dottedPath) {
  return dottedPath
    .split(".")
    .reduce(
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

function evaluate(testCase, actual) {
  const checks = [];

  for (const [field, expected] of Object.entries(
    testCase.expected || {}
  )) {
    const actualValue = valueAt(actual, field);
    checks.push({
      check: `exact:${field}`,
      passed: sameValue(actualValue, expected),
      expected,
      actual: actualValue
    });
  }

  for (const window of testCase.expected_windows || []) {
    const actualValue = valueAt(actual, window.path);
    const timestamp = Date.parse(actualValue);
    checks.push({
      check: `window:${window.path}`,
      passed:
        Number.isFinite(timestamp) &&
        timestamp >= Date.parse(window.start) &&
        timestamp <= Date.parse(window.end),
      expected: [window.start, window.end],
      actual: actualValue
    });
  }

  for (const prefix of testCase.expected_prefixes || []) {
    const actualValue = valueAt(actual, prefix.path);
    checks.push({
      check: `prefix:${prefix.path}`,
      passed:
        typeof actualValue === "string" &&
        actualValue.startsWith(prefix.prefix),
      expected: prefix.prefix,
      actual: actualValue
    });
  }

  for (const suffix of testCase.expected_suffixes || []) {
    const actualValue = valueAt(actual, suffix.path);
    checks.push({
      check: `suffix:${suffix.path}`,
      passed:
        typeof actualValue === "string" &&
        actualValue.endsWith(suffix.suffix),
      expected: suffix.suffix,
      actual: actualValue
    });
  }

  return {
    passed: checks.every((check) => check.passed),
    checks
  };
}

const results = fixtures.cases.map((testCase) => {
  const actual = orchestrateAg74mPanchangDay(testCase.input);
  const evaluation = evaluate(testCase, actual);

  return {
    test_id: testCase.test_id,
    input: testCase.input,
    expected: testCase.expected,
    actual,
    evaluation
  };
});

const passed = results.filter(
  (result) => result.evaluation.passed
).length;

const output = {
  module_id: "AG74M",
  title: "Panchang Day Orchestration Validation Results",
  status:
    passed === results.length
      ? "ag74m_day_orchestration_validation_passed"
      : "ag74m_day_orchestration_validation_failed",
  orchestrator_version: AG74M_ORCHESTRATOR_VERSION,
  summary: {
    total_test_count: results.length,
    passed_test_count: passed,
    failed_test_count: results.length - passed
  },
  sunrise_runtime_activated_internal_only: true,
  daily_panchang_classification_activated_internal_only: true,
  public_output_allowed: false,
  festival_generation_executed: false,
  annual_calendar_generation_executed: false,
  external_api_used: false,
  backend_service_deployed: false,
  supabase_activation_performed: false,
  results
};

fs.writeFileSync(
  path.join(root, outputPath),
  JSON.stringify(output, null, 2) + "\n"
);

if (passed !== results.length) {
  for (const result of results.filter(
    (item) => !item.evaluation.passed
  )) {
    console.error(
      `❌ ${result.test_id}: ` +
        JSON.stringify(
          result.evaluation.checks.filter(
            (check) => !check.passed
          ),
          null,
          2
        )
    );
  }
  process.exit(1);
}

console.log(
  `✅ AG74M day orchestration validation generated: ${passed}/${results.length} cases passed.`
);
console.log(
  "✅ Sunrise/sunset, DST civil-day windows, transitions and skipped/repeated detection are internally validated."
);
console.log(
  "✅ No festival generation, annual calendar generation, public output, external API or backend service was activated."
);
