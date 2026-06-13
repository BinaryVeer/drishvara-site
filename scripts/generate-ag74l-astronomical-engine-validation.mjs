import fs from "node:fs";
import path from "node:path";
import {
  absoluteAngularDifferenceDegrees,
  astronomicalPrimitiveState,
  findNextAngularBoundary
} from "./lib/ag74l-astronomical-engine.mjs";

const root = process.cwd();
const fixturePath = "data/knowledge-base/panchang-festival/production/ag74l-astronomical-benchmark-fixtures.json";
const resultPath = "data/knowledge-base/panchang-festival/production/ag74l-astronomical-validation-results.json";
const reviewPath = "data/content-intelligence/quality-reviews/ag74l-panchang-astronomical-engine.json";
const qualityPath = "data/quality/ag74l-panchang-astronomical-engine.json";
const previewPath = "data/quality/ag74l-panchang-astronomical-engine-preview.json";
const readinessPath = "data/content-intelligence/quality-registry/ag74l-ag74m-panchang-day-orchestration-readiness-record.json";

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const writeJson = (p, value) => {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), JSON.stringify(value, null, 2) + "\n");
};

const fixtures = readJson(fixturePath);
const tolerances = fixtures.tolerances;

const stateResults = fixtures.state_cases.map((testCase) => {
  const actual = astronomicalPrimitiveState(testCase.utc);
  const errors = {
    sun_longitude_degrees: absoluteAngularDifferenceDegrees(
      actual.sun_longitude_tropical,
      testCase.expected.sun_longitude_tropical
    ),
    moon_longitude_degrees: absoluteAngularDifferenceDegrees(
      actual.moon_longitude_tropical,
      testCase.expected.moon_longitude_tropical
    ),
    ayanamsha_degrees: absoluteAngularDifferenceDegrees(
      actual.ayanamsha_degrees,
      testCase.expected.ayanamsha_degrees
    )
  };
  const passed =
    errors.sun_longitude_degrees <= tolerances.sun_longitude_degrees &&
    errors.moon_longitude_degrees <= tolerances.moon_longitude_degrees &&
    errors.ayanamsha_degrees <= tolerances.ayanamsha_degrees;
  return {
    test_id: testCase.test_id,
    utc: testCase.utc,
    expected: testCase.expected,
    actual,
    errors,
    passed
  };
});

const transitionResults = fixtures.transition_cases.map((testCase) => {
  const actual = findNextAngularBoundary({
    kind: testCase.kind,
    target_degrees: testCase.target_degrees,
    start_utc: testCase.start_utc,
    max_days: testCase.max_days
  });
  const timeErrorSeconds = Math.abs(
    Date.parse(actual.event_utc) - Date.parse(testCase.expected_event_utc)
  ) / 1000;
  const passed =
    timeErrorSeconds <= tolerances.transition_time_seconds &&
    actual.angle_residual_degrees <= tolerances.root_angle_residual_degrees;
  return {
    test_id: testCase.test_id,
    kind: testCase.kind,
    target_degrees: testCase.target_degrees,
    expected_event_utc: testCase.expected_event_utc,
    actual,
    time_error_seconds: timeErrorSeconds,
    passed
  };
});

const allResults = [...stateResults, ...transitionResults];
const passedCount = allResults.filter((item) => item.passed).length;
const failedCount = allResults.length - passedCount;
const maxStateError = (key) => Math.max(...stateResults.map((item) => item.errors[key]));
const maxTransitionError = Math.max(...transitionResults.map((item) => item.time_error_seconds));
const maxRootResidual = Math.max(...transitionResults.map((item) => item.actual.angle_residual_degrees));

const summary = {
  total_test_count: allResults.length,
  passed_test_count: passedCount,
  failed_test_count: failedCount,
  max_sun_longitude_error_degrees: maxStateError("sun_longitude_degrees"),
  max_moon_longitude_error_degrees: maxStateError("moon_longitude_degrees"),
  max_ayanamsha_error_degrees: maxStateError("ayanamsha_degrees"),
  max_transition_time_error_seconds: maxTransitionError,
  max_root_angle_residual_degrees: maxRootResidual
};

writeJson(resultPath, {
  module_id: "AG74L",
  title: "Astronomical Engine Validation Results",
  status: failedCount === 0
    ? "ag74l_astronomical_validation_passed"
    : "ag74l_astronomical_validation_failed",
  engine_profile_id: "drishvara_astronomical_engine_v1",
  generated_deterministically: true,
  public_output_allowed: false,
  external_api_used: false,
  sunrise_or_sunset_computed: false,
  summary,
  state_results: stateResults,
  transition_results: transitionResults
});

writeJson(reviewPath, {
  module_id: "AG74L",
  title: "Panchang Astronomical Engine Review",
  status: failedCount === 0 ? "ag74l_completed" : "ag74l_failed",
  selected_backend: "astronomy-engine@2.1.19",
  selected_backend_license: "MIT",
  selected_ayanamsha_model: "drishvara_lahiri_linear_tt_v1",
  legacy_ag71i_engine_promoted_to_production: false,
  comparative_fixture_runtime_dependency: false,
  validation_summary: summary,
  public_ui_changed: false,
  css_or_typography_changed: false,
  sunrise_runtime_activated: false,
  festival_generation_activated: false,
  backend_service_deployed: false,
  supabase_activation_performed: false,
  next_module: "AG74M"
});

writeJson(qualityPath, {
  module_id: "AG74L",
  title: "Panchang Astronomical Engine Quality Record",
  status: failedCount === 0 ? "ag74l_completed" : "ag74l_failed",
  issue_count: failedCount,
  deterministic_test_count: allResults.length,
  deterministic_test_pass_count: passedCount,
  state_benchmark_count: stateResults.length,
  transition_benchmark_count: transitionResults.length,
  exact_dependency_lock_present: true,
  MIT_license_recorded: true,
  static_build_readiness_integration_added: true,
  public_ui_changed: false,
  sunrise_or_sunset_computed: false,
  daily_panchang_classification_generated: false,
  festival_generation_activated: false,
  external_api_used: false,
  backend_service_deployed: false,
  ready_for_ag74m: failedCount === 0
});

writeJson(previewPath, {
  module_id: "AG74L",
  title: "Panchang Astronomical Engine Preview",
  status: failedCount === 0
    ? "preview_matches_validated_internal_engine"
    : "preview_blocked_by_validation_failure",
  engine: "Astronomy Engine 2.1.19",
  license: "MIT",
  calculation_profile: "Modern Drik / true ecliptic of date",
  ayanamsha: "Lahiri / Chitrapaksha — Drishvara linear TT model v1",
  supported_range: "1900-01-01 through 2100-12-31",
  validation_summary: summary,
  public_output: "blocked",
  sunrise_and_daily_orchestration: "deferred to AG74M"
});

writeJson(readinessPath, {
  module_id: "AG74L-AG74M",
  title: "AG74M Panchang Day Orchestration Readiness",
  status: failedCount === 0
    ? "ready_for_ag74m_panchang_day_orchestration"
    : "blocked_by_ag74l_validation_failure",
  consumed_records: [
    "data/knowledge-base/panchang-festival/production/ag74l-astronomical-engine-profile.json",
    fixturePath,
    resultPath,
    "data/knowledge-base/panchang-festival/production/ag74l-transition-root-finding-contract.json",
    "data/content-intelligence/mutation-plans/ag74l-to-ag74m-panchang-day-orchestration-boundary.json"
  ],
  readiness_checks: {
    exact_ephemeris_dependency_locked: true,
    local_deterministic_astronomical_engine_active: failedCount === 0,
    UTC_and_TT_trace_active: failedCount === 0,
    Delta_T_model_versioned: true,
    precession_and_nutation_models_versioned: true,
    apparent_geocentric_sun_longitude_active: failedCount === 0,
    geocentric_moon_longitude_active: failedCount === 0,
    Lahiri_Chitrapaksha_conversion_active: failedCount === 0,
    transition_root_finding_active: failedCount === 0,
    all_10_benchmarks_passed: failedCount === 0 && passedCount === 10,
    legacy_preliminary_engine_promoted: false,
    public_panchang_output_activated: false,
    sunrise_runtime_activated: false,
    daily_panchang_classification_activated: false,
    festival_generation_activated: false,
    external_ephemeris_API_activated: false,
    backend_service_deployed: false,
    Supabase_activation_performed: false,
    personal_location_storage_enabled: false
  }
});

if (failedCount > 0) {
  console.error("❌ AG74L astronomical validation failed: " + failedCount + " case(s)." );
  process.exit(1);
}

console.log("✅ AG74L astronomical validation generated: 10/10 cases passed.");
console.log("✅ Astronomy Engine 2.1.19, Lahiri conversion and root finding are internally validated.");
console.log("✅ No sunrise, public output, festival generation, external API or backend service was activated.");
