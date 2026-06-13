import fs from "node:fs";
import path from "node:path";
import {
  absoluteAngularDifferenceDegrees,
  astronomicalPrimitiveState,
  findNextAngularBoundary
} from "./lib/ag74l-astronomical-engine.mjs";

const root = process.cwd();
const full = (p) => path.join(root, p);
const exists = (p) => fs.existsSync(full(p));
const read = (p) => fs.readFileSync(full(p), "utf8");
const readJson = (p) => JSON.parse(read(p));
function fail(message) {
  console.error("❌ AG74L validation failed: " + message);
  process.exit(1);
}
function pass(message) { console.log("✅ " + message); }

const required = [
  "data/knowledge-base/panchang-festival/production/ag74l-astronomical-engine-profile.json",
  "data/knowledge-base/panchang-festival/production/ag74l-astronomical-benchmark-fixtures.json",
  "data/knowledge-base/panchang-festival/production/ag74l-astronomical-validation-results.json",
  "data/knowledge-base/panchang-festival/production/ag74l-transition-root-finding-contract.json",
  "data/content-intelligence/mutation-plans/ag74l-to-ag74m-panchang-day-orchestration-boundary.json",
  "data/content-intelligence/quality-registry/ag74l-ag74m-panchang-day-orchestration-readiness-record.json",
  "data/content-intelligence/quality-reviews/ag74l-panchang-astronomical-engine.json",
  "data/quality/ag74l-panchang-astronomical-engine.json",
  "data/quality/ag74l-panchang-astronomical-engine-preview.json",
  "scripts/lib/ag74l-astronomical-engine.mjs",
  "scripts/generate-ag74l-astronomical-engine-validation.mjs",
  "docs/quality/AG74L_PANCHANG_ASTRONOMICAL_ENGINE.md",
  "package-lock.json",
  "data/content-intelligence/quality-registry/ag74k-ag74l-panchang-astronomical-engine-readiness-record.json",
  "data/knowledge-base/panchang-festival/production/ag74j-astronomical-method-and-sunrise-contract.json",
  "scripts/lib/panchang-internal-dry-run-engine.mjs"
];
for (const file of required) if (!exists(file)) fail("Missing required file: " + file);

const prior = readJson(
  "data/content-intelligence/quality-registry/ag74k-ag74l-panchang-astronomical-engine-readiness-record.json"
);
if (prior.status !== "ready_for_ag74l_panchang_astronomical_engine") {
  fail("AG74K readiness status mismatch.");
}

const profile = readJson("data/knowledge-base/panchang-festival/production/ag74l-astronomical-engine-profile.json");
if (profile.status !== "ag74l_internal_astronomical_engine_profile_locked") {
  fail("Engine profile status mismatch.");
}
if (profile.backend.package_name !== "astronomy-engine" ||
    profile.backend.package_version !== "2.1.19" ||
    profile.backend.license !== "MIT") {
  fail("Selected package identity, version or license mismatch.");
}
if (profile.time_scale_profile.delta_t_model_id !== "ae_2_1_19_espenak_meeus_v1") {
  fail("Delta-T model mismatch.");
}
if (profile.orientation_profile.precession_model !==
    "IAU 2006 precession implementation in astronomy-engine 2.1.19") {
  fail("Precession model mismatch.");
}
if (profile.orientation_profile.nutation_model !==
    "IAU 2000B nutation implementation in astronomy-engine 2.1.19") {
  fail("Nutation model mismatch.");
}
if (profile.ayanamsha_profile.identity !== "lahiri_chitrapaksha" ||
    profile.ayanamsha_profile.model_id !== "drishvara_lahiri_linear_tt_v1") {
  fail("Ayanamsha profile mismatch.");
}
for (const [key, value] of Object.entries(profile.activation_state)) {
  if (key === "internal_primitive_calculation_enabled") {
    if (value !== true) fail("Internal primitive calculation must be enabled.");
  } else if (value !== false) {
    fail("Forbidden activation flag must remain false: " + key);
  }
}

const pkg = readJson("package.json");
if (pkg.dependencies?.["astronomy-engine"] !== "2.1.19") {
  fail("astronomy-engine must be exact-locked at 2.1.19.");
}
if (pkg.scripts?.["generate:ag74l"] !==
    "node scripts/generate-ag74l-astronomical-engine-validation.mjs") {
  fail("generate:ag74l package script mismatch.");
}
if (pkg.scripts?.["validate:ag74l"] !==
    "node scripts/validate-ag74l-panchang-astronomical-engine.mjs") {
  fail("validate:ag74l package script mismatch.");
}
if (!pkg.scripts?.["validate:project"]?.includes(
  "npm run validate:ag74k && npm run validate:ag74l"
)) {
  fail("validate:project does not include AG74L after AG74K.");
}

const lock = readJson("package-lock.json");
if (lock.packages?.[""]?.dependencies?.["astronomy-engine"] !== "2.1.19") {
  fail("Root package-lock dependency is not exact-locked.");
}
const lockedPackage = lock.packages?.["node_modules/astronomy-engine"];
if (lockedPackage?.version !== "2.1.19" || lockedPackage?.license !== "MIT") {
  fail("Locked astronomy-engine package metadata mismatch.");
}

const fixtures = readJson("data/knowledge-base/panchang-festival/production/ag74l-astronomical-benchmark-fixtures.json");
const stored = readJson("data/knowledge-base/panchang-festival/production/ag74l-astronomical-validation-results.json");
if (fixtures.state_cases.length !== 6 || fixtures.transition_cases.length !== 4) {
  fail("Expected six state and four transition fixtures.");
}
if (stored.status !== "ag74l_astronomical_validation_passed" ||
    stored.summary.total_test_count !== 10 ||
    stored.summary.passed_test_count !== 10 ||
    stored.summary.failed_test_count !== 0) {
  fail("Stored validation summary mismatch.");
}

for (const testCase of fixtures.state_cases) {
  const actual = astronomicalPrimitiveState(testCase.utc);
  const storedCase = stored.state_results.find((item) => item.test_id === testCase.test_id);
  if (!storedCase) fail("Missing stored state result: " + testCase.test_id);
  if (JSON.stringify(storedCase.actual) !== JSON.stringify(actual)) {
    fail("State result is not deterministic: " + testCase.test_id);
  }
  const sunError = absoluteAngularDifferenceDegrees(
    actual.sun_longitude_tropical,
    testCase.expected.sun_longitude_tropical
  );
  const moonError = absoluteAngularDifferenceDegrees(
    actual.moon_longitude_tropical,
    testCase.expected.moon_longitude_tropical
  );
  const ayaError = absoluteAngularDifferenceDegrees(
    actual.ayanamsha_degrees,
    testCase.expected.ayanamsha_degrees
  );
  if (sunError > fixtures.tolerances.sun_longitude_degrees ||
      moonError > fixtures.tolerances.moon_longitude_degrees ||
      ayaError > fixtures.tolerances.ayanamsha_degrees) {
    fail("State benchmark tolerance exceeded: " + testCase.test_id);
  }
  if (actual.public_output_allowed !== false ||
      actual.sunrise_or_sunset_computed !== false ||
      actual.external_api_used !== false) {
    fail("State safety flags changed: " + testCase.test_id);
  }
}

for (const testCase of fixtures.transition_cases) {
  const actual = findNextAngularBoundary({
    kind: testCase.kind,
    target_degrees: testCase.target_degrees,
    start_utc: testCase.start_utc,
    max_days: testCase.max_days
  });
  const storedCase = stored.transition_results.find(
    (item) => item.test_id === testCase.test_id
  );
  if (!storedCase) fail("Missing stored transition result: " + testCase.test_id);
  if (JSON.stringify(storedCase.actual) !== JSON.stringify(actual)) {
    fail("Transition result is not deterministic: " + testCase.test_id);
  }
  const timeErrorSeconds = Math.abs(
    Date.parse(actual.event_utc) - Date.parse(testCase.expected_event_utc)
  ) / 1000;
  if (timeErrorSeconds > fixtures.tolerances.transition_time_seconds ||
      actual.angle_residual_degrees > fixtures.tolerances.root_angle_residual_degrees) {
    fail("Transition benchmark tolerance exceeded: " + testCase.test_id);
  }
  if (actual.public_output_allowed !== false ||
      actual.sunrise_or_daily_allocation_performed !== false ||
      actual.external_api_used !== false) {
    fail("Transition safety flags changed: " + testCase.test_id);
  }
}

const rootContract = readJson("data/knowledge-base/panchang-festival/production/ag74l-transition-root-finding-contract.json");
if (rootContract.status !== "ag74l_transition_root_finding_contract_locked" ||
    rootContract.algorithm.root_refinement !== "deterministic bisection") {
  fail("Root-finding contract mismatch.");
}

const boundary = readJson("data/content-intelligence/mutation-plans/ag74l-to-ag74m-panchang-day-orchestration-boundary.json");
if (boundary.from_module !== "AG74L" || boundary.to_module !== "AG74M") {
  fail("AG74L→AG74M boundary mismatch.");
}

const readiness = readJson("data/content-intelligence/quality-registry/ag74l-ag74m-panchang-day-orchestration-readiness-record.json");
if (readiness.status !== "ready_for_ag74m_panchang_day_orchestration") {
  fail("AG74M readiness status mismatch.");
}
if (readiness.readiness_checks.all_10_benchmarks_passed !== true ||
    readiness.readiness_checks.legacy_preliminary_engine_promoted !== false) {
  fail("AG74M readiness evidence mismatch.");
}
for (const key of [
  "public_panchang_output_activated",
  "sunrise_runtime_activated",
  "daily_panchang_classification_activated",
  "festival_generation_activated",
  "external_ephemeris_API_activated",
  "backend_service_deployed",
  "Supabase_activation_performed",
  "personal_location_storage_enabled"
]) {
  if (readiness.readiness_checks[key] !== false) {
    fail("Forbidden readiness flag must remain false: " + key);
  }
}

const quality = readJson("data/quality/ag74l-panchang-astronomical-engine.json");
if (quality.status !== "ag74l_completed" || quality.issue_count !== 0 ||
    quality.deterministic_test_pass_count !== 10 || quality.ready_for_ag74m !== true) {
  fail("AG74L quality record mismatch.");
}

const legacyText = read("scripts/lib/panchang-internal-dry-run-engine.mjs");
for (const phrase of [
  "ayanamsaLahiriApprox",
  "solarLongitudeTropical",
  "lunarLongitudeTropical",
  "AG71I-B"
]) {
  if (!legacyText.includes(phrase)) fail("Legacy AG71I evidence missing: " + phrase);
}

pass("AG74L versioned astronomical primitive engine is valid.");
pass("Astronomy Engine 2.1.19 is exact-locked under MIT licensing.");
pass("Six longitude/ayanamsha and four transition benchmarks passed.");
pass("UTC/TT, Delta-T, IAU 2006 precession, IAU 2000B nutation and Lahiri trace are present.");
pass("AG71I preliminary formulas remain historical evidence and were not promoted.");
pass("AG74M Panchang day orchestration is ready.");
pass("No sunrise, daily Panchang publication, festival generation, external API, backend service or Supabase activation occurred.");
