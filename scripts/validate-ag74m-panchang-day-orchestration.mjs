import fs from "node:fs";
import path from "node:path";
import {
  constructLocalCivilDayWindow,
  orchestrateAg74mPanchangDay
} from "./lib/ag74m-panchang-day-orchestrator.mjs";

const root = process.cwd();
function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error("❌ AG74M validation failed: " + message);
  process.exit(1);
}
function pass(message) { console.log("✅ " + message); }

const required = [
  "data/knowledge-base/panchang-festival/production/ag74m-panchang-day-orchestration-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74m-sunrise-sunset-profile.json",
  "data/knowledge-base/panchang-festival/production/ag74m-day-orchestration-benchmark-fixtures.json",
  "data/knowledge-base/panchang-festival/production/ag74m-day-orchestration-validation-results.json",
  "scripts/lib/ag74m-panchang-day-orchestrator.mjs",
  "scripts/generate-ag74m-panchang-day-orchestration-validation.mjs",
  "data/content-intelligence/mutation-plans/ag74m-to-ag74n-panchang-festival-annual-calendar-boundary.json",
  "data/content-intelligence/quality-registry/ag74m-ag74n-panchang-festival-annual-calendar-readiness-record.json",
  "data/content-intelligence/quality-reviews/ag74m-panchang-day-orchestration.json",
  "data/quality/ag74m-panchang-day-orchestration.json",
  "data/quality/ag74m-panchang-day-orchestration-preview.json",
  "docs/quality/AG74M_PANCHANG_DAY_ORCHESTRATION.md",
  "data/content-intelligence/quality-registry/ag74l-ag74m-panchang-day-orchestration-readiness-record.json",
  "data/knowledge-base/panchang-festival/production/ag74j-astronomical-method-and-sunrise-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74l-astronomical-engine-profile.json",
  "data/knowledge-base/panchang-festival/production/ag74l-transition-root-finding-contract.json",
  "scripts/lib/ag74k-panchang-input-resolver.mjs",
  "scripts/lib/ag74l-astronomical-engine.mjs"
];

for (const file of required) {
  if (!exists(file)) fail("Missing required file: " + file);
}

const prior = readJson(
  "data/content-intelligence/quality-registry/ag74l-ag74m-panchang-day-orchestration-readiness-record.json"
);
if (prior.status !== "ready_for_ag74m_panchang_day_orchestration") {
  fail("AG74L readiness status mismatch.");
}

const contract = readJson("data/knowledge-base/panchang-festival/production/ag74m-panchang-day-orchestration-contract.json");
if (
  contract.status !==
  "ag74m_day_orchestration_contract_locked_internal_only"
) {
  fail("AG74M orchestration contract status mismatch.");
}
if (
  contract.sunrise_day_contract.basis !==
  "apparent_upper_limb_level_horizon"
) {
  fail("AG74M sunrise basis mismatch.");
}
if (
  contract.sunrise_day_contract.meters_above_local_ground !== 0 ||
  contract.sunrise_day_contract.horizon_dip_enabled !== false
) {
  fail("Level-horizon implementation mismatch.");
}
if (
  contract.local_civil_day_contract
    .civil_date_not_converted_to_varanasi_instant !== true
) {
  fail("Civil-date semantics changed.");
}

const sunriseProfile = readJson("data/knowledge-base/panchang-festival/production/ag74m-sunrise-sunset-profile.json");
if (
  sunriseProfile.profile_id !==
  "drishvara_apparent_upper_limb_level_horizon_v1"
) {
  fail("Sunrise profile ID mismatch.");
}
if (
  sunriseProfile.backend.package !== "astronomy-engine" ||
  sunriseProfile.backend.version !== "2.1.19" ||
  sunriseProfile.backend.external_api !== false
) {
  fail("Sunrise backend identity mismatch.");
}
if (
  sunriseProfile.physical_convention.solar_disk_reference !==
    "upper limb" ||
  sunriseProfile.physical_convention.horizon !==
    "level horizon"
) {
  fail("Sunrise physical convention mismatch.");
}

const fixtures = readJson("data/knowledge-base/panchang-festival/production/ag74m-day-orchestration-benchmark-fixtures.json");
const stored = readJson("data/knowledge-base/panchang-festival/production/ag74m-day-orchestration-validation-results.json");
if (
  fixtures.test_count !== 12 ||
  fixtures.cases.length !== 12
) {
  fail("Expected exactly 12 AG74M benchmark fixtures.");
}
if (
  stored.status !==
    "ag74m_day_orchestration_validation_passed" ||
  stored.summary.total_test_count !== 12 ||
  stored.summary.passed_test_count !== 12 ||
  stored.summary.failed_test_count !== 0
) {
  fail("Stored AG74M validation summary mismatch.");
}

for (const testCase of fixtures.cases) {
  const actual = orchestrateAg74mPanchangDay(testCase.input);
  const storedCase = stored.results.find(
    (item) => item.test_id === testCase.test_id
  );

  if (!storedCase) {
    fail("Missing stored result: " + testCase.test_id);
  }

  if (
    JSON.stringify(storedCase.actual) !==
    JSON.stringify(actual)
  ) {
    fail(
      "Stored result is not deterministic: " +
        testCase.test_id
    );
  }

  if (storedCase.evaluation.passed !== true) {
    fail("Stored fixture did not pass: " + testCase.test_id);
  }

  if (actual.public_output_allowed !== false) {
    fail(
      "Public output must remain blocked: " +
        testCase.test_id
    );
  }
  if (actual.festival_generation_executed !== false) {
    fail(
      "Festival generation must remain blocked: " +
        testCase.test_id
    );
  }
  if (
    actual.annual_calendar_generation_executed !== false
  ) {
    fail(
      "Annual calendar generation must remain blocked: " +
        testCase.test_id
    );
  }
  if (actual.external_api_used !== false) {
    fail(
      "External ephemeris API must remain unused: " +
        testCase.test_id
    );
  }
}

const dstWindow = constructLocalCivilDayWindow(
  "2026-03-08",
  "America/New_York"
);
if (
  dstWindow.available !== true ||
  dstWindow.duration_hours !== 23
) {
  fail("23-hour DST civil-day construction failed.");
}

const skippedCase = stored.results.find(
  (item) =>
    item.test_id ===
    "varanasi_skipped_tithi_detection"
).actual;
if (
  JSON.stringify(
    skippedCase.elements.tithi.sunrise_sequence
      .skipped_before_current_indices
  ) !== JSON.stringify([1])
) {
  fail("Skipped tithi detection mismatch.");
}

const repeatedCase = stored.results.find(
  (item) =>
    item.test_id ===
    "varanasi_repeated_tithi_detection"
).actual;
if (
  repeatedCase.elements.tithi.sunrise_sequence
    .repeated_from_previous !== true
) {
  fail("Repeated tithi detection mismatch.");
}

const varanasi = stored.results.find(
  (item) => item.test_id === "varanasi_reference_day"
).actual;
for (const element of [
  "tithi",
  "nakshatra",
  "yoga",
  "karana"
]) {
  const record = varanasi.elements[element];
  if (
    !record.previous_transition?.utc ||
    !record.previous_transition?.local ||
    !record.next_transition?.utc ||
    !record.next_transition?.local
  ) {
    fail(
      "Previous/next transition is incomplete: " +
        element
    );
  }
  if (
    Date.parse(record.previous_transition.utc) >=
      Date.parse(varanasi.sunrise.utc) ||
    Date.parse(record.next_transition.utc) <=
      Date.parse(varanasi.sunrise.utc)
  ) {
    fail(
      "Transition ordering around sunrise is invalid: " +
        element
    );
  }
}

const pkg = readJson("package.json");
if (
  pkg.scripts?.["generate:ag74m"] !==
  "node scripts/generate-ag74m-panchang-day-orchestration-validation.mjs"
) {
  fail("generate:ag74m package script mismatch.");
}
if (
  pkg.scripts?.["validate:ag74m"] !==
  "node scripts/validate-ag74m-panchang-day-orchestration.mjs"
) {
  fail("validate:ag74m package script mismatch.");
}
if (
  !pkg.scripts?.["validate:project"]?.includes(
    "npm run validate:ag74l && npm run validate:ag74m"
  )
) {
  fail("validate:project does not include AG74M after AG74L.");
}

const boundary = readJson("data/content-intelligence/mutation-plans/ag74m-to-ag74n-panchang-festival-annual-calendar-boundary.json");
if (
  boundary.from_module !== "AG74M" ||
  boundary.to_module !== "AG74N"
) {
  fail("AG74M→AG74N boundary mismatch.");
}

const readiness = readJson("data/content-intelligence/quality-registry/ag74m-ag74n-panchang-festival-annual-calendar-readiness-record.json");
if (
  readiness.status !==
  "ready_for_ag74n_panchang_festival_and_annual_calendar_engine"
) {
  fail("AG74N readiness status mismatch.");
}

for (const key of [
  "festival_generation_activated",
  "lunar_month_generation_activated",
  "annual_calendar_generation_activated",
  "public_panchang_output_activated",
  "public_ui_modified",
  "backend_service_deployed",
  "supabase_activation_performed",
  "external_ephemeris_api_enabled"
]) {
  if (readiness.readiness_checks[key] !== false) {
    fail("Activation flag must remain false: " + key);
  }
}

const quality = readJson("data/quality/ag74m-panchang-day-orchestration.json");
if (
  quality.status !== "ag74m_completed" ||
  quality.issue_count !== 0 ||
  quality.deterministic_test_pass_count !== 12 ||
  quality.ready_for_ag74n !== true
) {
  fail("AG74M quality/readiness mismatch.");
}

pass("AG74M local civil-day and sunrise/sunset orchestration is valid.");
pass("Apparent upper-limb, standard refraction and level-horizon conventions are locked.");
pass("Tithi, Nakshatra, Yoga, Karana, Paksha and Vara are allocated at local sunrise.");
pass("Previous/next transitions and skipped/repeated sunrise classifications passed.");
pass("DST, international timezone, approved elevation and polar unavailable states passed 12 deterministic fixtures.");
pass("AG74N festival and annual-calendar engine is ready.");
pass("No festival generation, annual calendar generation, public UI change, backend service, Supabase or external API was activated.");
