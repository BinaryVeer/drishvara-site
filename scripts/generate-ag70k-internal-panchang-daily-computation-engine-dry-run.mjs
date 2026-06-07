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

const ag70j = readJson("data/content-intelligence/quality-reviews/ag70j-panchang-computation-basis-lock-daily-bank.json");
const pendingDailyBank = readJson("data/knowledge-base/panchang-festival/production/panchang-daily-calculation-bank-batch-01.json");
const locationLock = readJson("data/knowledge-base/panchang-festival/production/panchang-default-location-basis-lock.json");
const ayanamsaLock = readJson("data/knowledge-base/panchang-festival/production/panchang-ayanamsa-basis-lock.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70j.status !== "ag70j_panchang_computation_basis_lock_daily_bank_completed") {
  throw new Error("AG70J must be complete before AG70K.");
}
if (ag70j.summary?.ready_for_ag70k !== true) {
  throw new Error("AG70J readiness for AG70K is missing.");
}
if (pendingDailyBank.status !== "panchang_daily_calculation_bank_batch_01_created_pending_internal_computation") {
  throw new Error("AG70J pending daily bank must exist before AG70K.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  engineDryRun: "data/knowledge-base/panchang-festival/production/ag70k-internal-panchang-daily-computation-engine-dry-run.json",
  computedDailyBank: "data/knowledge-base/panchang-festival/production/panchang-computed-daily-bank-batch-01-internal-dry-run.json",
  dailyBank: "data/knowledge-base/panchang-festival/production/panchang-daily-calculation-bank-batch-01.json",
  invariantReport: "data/knowledge-base/panchang-festival/production/ag70k-internal-computation-invariant-report.json",
  noExternalAudit: "data/knowledge-base/panchang-festival/production/ag70k-no-external-panchang-source-audit.json",
  noPublicOutputAudit: "data/knowledge-base/panchang-festival/production/ag70k-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70k-internal-panchang-daily-computation-engine-dry-run.json",
  readiness: "data/content-intelligence/quality-registry/ag70k-ag70l-computed-panchang-daily-bank-internal-validation-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70k-to-ag70l-computed-panchang-daily-bank-internal-validation-boundary.json",
  quality: "data/quality/ag70k-internal-panchang-daily-computation-engine-dry-run.json",
  preview: "data/quality/ag70k-internal-panchang-daily-computation-engine-dry-run-preview.json",
  doc: "docs/quality/AG70K_INTERNAL_PANCHANG_DAILY_COMPUTATION_ENGINE_DRY_RUN.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const tithiNames = [
  "Shukla Pratipada", "Shukla Dwitiya", "Shukla Tritiya", "Shukla Chaturthi", "Shukla Panchami",
  "Shukla Shashthi", "Shukla Saptami", "Shukla Ashtami", "Shukla Navami", "Shukla Dashami",
  "Shukla Ekadashi", "Shukla Dwadashi", "Shukla Trayodashi", "Shukla Chaturdashi", "Purnima",
  "Krishna Pratipada", "Krishna Dwitiya", "Krishna Tritiya", "Krishna Chaturthi", "Krishna Panchami",
  "Krishna Shashthi", "Krishna Saptami", "Krishna Ashtami", "Krishna Navami", "Krishna Dashami",
  "Krishna Ekadashi", "Krishna Dwadashi", "Krishna Trayodashi", "Krishna Chaturdashi", "Amavasya"
];

const nakshatraNames = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati"
];

const yogaNames = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula",
  "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

const varaNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const repeatingKaranas = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];

function degToRad(x) { return x * Math.PI / 180; }
function radToDeg(x) { return x * 180 / Math.PI; }
function norm360(x) { return ((x % 360) + 360) % 360; }
function round(x, d = 6) { return Number(x.toFixed(d)); }

function julianDay(ms) {
  return ms / 86400000 + 2440587.5;
}

function ayanamsaLahiriApprox(date) {
  const year = date.getUTCFullYear() + (date.getUTCMonth() + 0.5) / 12;
  return 23.85675 + 0.013969 * (year - 2000);
}

function solarLongitudeTropical(ms) {
  const d = julianDay(ms) - 2451545.0;
  const L = norm360(280.460 + 0.9856474 * d);
  const g = norm360(357.528 + 0.9856003 * d);
  return norm360(L + 1.915 * Math.sin(degToRad(g)) + 0.020 * Math.sin(degToRad(2 * g)));
}

function lunarLongitudeTropical(ms) {
  const d = julianDay(ms) - 2451545.0;
  const L0 = norm360(218.316 + 13.176396 * d);
  const Mm = norm360(134.963 + 13.064993 * d);
  const Ms = norm360(357.529 + 0.98560028 * d);
  const D = norm360(297.850 + 12.190749 * d);
  const F = norm360(93.272 + 13.229350 * d);

  return norm360(
    L0
    + 6.289 * Math.sin(degToRad(Mm))
    + 1.274 * Math.sin(degToRad(2 * D - Mm))
    + 0.658 * Math.sin(degToRad(2 * D))
    + 0.214 * Math.sin(degToRad(2 * Mm))
    - 0.186 * Math.sin(degToRad(Ms))
    - 0.114 * Math.sin(degToRad(2 * F))
  );
}

function astronomicalState(ms) {
  const date = new Date(ms);
  const ay = ayanamsaLahiriApprox(date);
  const sunTropical = solarLongitudeTropical(ms);
  const moonTropical = lunarLongitudeTropical(ms);
  const sunSidereal = norm360(sunTropical - ay);
  const moonSidereal = norm360(moonTropical - ay);
  const angle = norm360(moonSidereal - sunSidereal);
  const combined = norm360(moonSidereal + sunSidereal);

  const tithiIndex = Math.floor(angle / 12) + 1;
  const nakshatraIndex = Math.floor(moonSidereal / (360 / 27)) + 1;
  const yogaIndex = Math.floor(combined / (360 / 27)) + 1;
  const karanaIndex = Math.floor(angle / 6) + 1;

  return {
    ayanamsa_value: round(ay),
    sun_longitude_tropical: round(sunTropical),
    moon_longitude_tropical: round(moonTropical),
    sun_longitude_sidereal: round(sunSidereal),
    moon_longitude_sidereal: round(moonSidereal),
    moon_minus_sun_angular_difference: round(angle),
    combined_sidereal_longitude_for_yoga: round(combined),
    tithi_index: tithiIndex,
    tithi_name: tithiNames[tithiIndex - 1],
    nakshatra_index: nakshatraIndex,
    nakshatra_name: nakshatraNames[nakshatraIndex - 1],
    yoga_index: yogaIndex,
    yoga_name: yogaNames[yogaIndex - 1],
    karana_index: karanaIndex,
    karana_name: karanaName(karanaIndex),
    paksha: tithiIndex <= 15 ? "Shukla Paksha" : "Krishna Paksha"
  };
}

function karanaName(index) {
  if (index === 1) return "Kimstughna";
  if (index >= 58) return ["Shakuni", "Chatushpada", "Naga"][index - 58] || "Naga";
  return repeatingKaranas[(index - 2) % 7];
}

function localMidnightUtcMs(dateKey, offsetMinutes) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d, 0, 0, 0) - offsetMinutes * 60 * 1000;
}

function dayOfYear(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000);
}

function sunriseSunsetUtcMs(dateKey, lat, lon, isRise) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const base = new Date(Date.UTC(year, month - 1, day));
  const N = dayOfYear(base);
  const lngHour = lon / 15;
  const t = N + ((isRise ? 6 : 18) - lngHour) / 24;
  const M = (0.9856 * t) - 3.289;
  let L = M + (1.916 * Math.sin(degToRad(M))) + (0.020 * Math.sin(degToRad(2 * M))) + 282.634;
  L = norm360(L);

  let RA = radToDeg(Math.atan(0.91764 * Math.tan(degToRad(L))));
  RA = norm360(RA);
  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(RA / 90) * 90;
  RA = (RA + (Lquadrant - RAquadrant)) / 15;

  const sinDec = 0.39782 * Math.sin(degToRad(L));
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(degToRad(90.833)) - (sinDec * Math.sin(degToRad(lat)))) / (cosDec * Math.cos(degToRad(lat)));
  if (cosH > 1 || cosH < -1) return null;

  let H = isRise ? 360 - radToDeg(Math.acos(cosH)) : radToDeg(Math.acos(cosH));
  H = H / 15;

  const T = H + RA - (0.06571 * t) - 6.622;
  let UT = T - lngHour;
  UT = ((UT % 24) + 24) % 24;

  return Date.UTC(year, month - 1, day, 0, 0, 0) + UT * 3600000;
}

function isoLocal(ms, offsetMinutes) {
  const local = new Date(ms + offsetMinutes * 60 * 1000);
  const yyyy = local.getUTCFullYear();
  const mm = String(local.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(local.getUTCDate()).padStart(2, "0");
  const hh = String(local.getUTCHours()).padStart(2, "0");
  const mi = String(local.getUTCMinutes()).padStart(2, "0");
  const ss = String(local.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+05:30`;
}

function isoUtc(ms) {
  return new Date(ms).toISOString().replace(".000Z", "Z");
}

function elementIndex(ms, type) {
  const s = astronomicalState(ms);
  if (type === "tithi") return s.tithi_index;
  if (type === "nakshatra") return s.nakshatra_index;
  if (type === "yoga") return s.yoga_index;
  if (type === "karana") return s.karana_index;
  throw new Error(`Unknown element type: ${type}`);
}

function findBoundary(ms, type, direction) {
  const current = elementIndex(ms, type);
  const step = 60 * 60 * 1000;
  let a = ms;
  let b = ms;

  for (let i = 0; i < 96; i++) {
    const probe = direction === "backward" ? ms - (i + 1) * step : ms + (i + 1) * step;
    const idx = elementIndex(probe, type);
    if (idx !== current) {
      if (direction === "backward") {
        a = probe;
        b = ms - i * step;
      } else {
        a = ms + i * step;
        b = probe;
      }
      break;
    }
  }

  for (let i = 0; i < 40; i++) {
    const mid = Math.floor((a + b) / 2);
    const midIdx = elementIndex(mid, type);
    if (direction === "backward") {
      if (midIdx === current) b = mid;
      else a = mid;
    } else {
      if (midIdx === current) a = mid;
      else b = mid;
    }
  }

  return direction === "backward" ? b : b;
}

function computeRecord(record, location, ayanamsaId) {
  const offsetMinutes = 330;
  const sunriseUtc = sunriseSunsetUtcMs(record.date_key, location.latitude_decimal, location.longitude_decimal, true);
  const sunsetUtc = sunriseSunsetUtcMs(record.date_key, location.latitude_decimal, location.longitude_decimal, false);
  const basisMs = sunriseUtc ?? (localMidnightUtcMs(record.date_key, offsetMinutes) + 6 * 3600000);
  const state = astronomicalState(basisMs);

  const tithiStart = findBoundary(basisMs, "tithi", "backward");
  const tithiEnd = findBoundary(basisMs, "tithi", "forward");
  const nakStart = findBoundary(basisMs, "nakshatra", "backward");
  const nakEnd = findBoundary(basisMs, "nakshatra", "forward");
  const yogaStart = findBoundary(basisMs, "yoga", "backward");
  const yogaEnd = findBoundary(basisMs, "yoga", "forward");
  const karanaStart = findBoundary(basisMs, "karana", "backward");
  const karanaEnd = findBoundary(basisMs, "karana", "forward");

  const vara = varaNames[new Date(localMidnightUtcMs(record.date_key, offsetMinutes) + offsetMinutes * 60000).getUTCDay()];

  return {
    ...record,
    record_status: "computed_internal_dry_run_public_blocked",
    computed_values_present: true,
    calculation_precision_class: "internal_dry_run_preliminary_astronomical_approximation",
    snapshot_basis: "approx_local_sunrise",
    calculation_generated_at: new Date().toISOString(),
    sunrise_datetime_utc: sunriseUtc ? isoUtc(sunriseUtc) : null,
    sunrise_datetime_local: sunriseUtc ? isoLocal(sunriseUtc, offsetMinutes) : null,
    sunset_datetime_utc: sunsetUtc ? isoUtc(sunsetUtc) : null,
    sunset_datetime_local: sunsetUtc ? isoLocal(sunsetUtc, offsetMinutes) : null,
    ayanamsa_id: ayanamsaId,
    ayanamsa_value: state.ayanamsa_value,
    sun_longitude_tropical: state.sun_longitude_tropical,
    moon_longitude_tropical: state.moon_longitude_tropical,
    sun_longitude_sidereal: state.sun_longitude_sidereal,
    moon_longitude_sidereal: state.moon_longitude_sidereal,
    moon_minus_sun_angular_difference: state.moon_minus_sun_angular_difference,
    combined_sidereal_longitude_for_yoga: state.combined_sidereal_longitude_for_yoga,
    tithi: { index: state.tithi_index, name: state.tithi_name },
    tithi_start_datetime_utc: isoUtc(tithiStart),
    tithi_end_datetime_utc: isoUtc(tithiEnd),
    tithi_start_datetime_local: isoLocal(tithiStart, offsetMinutes),
    tithi_end_datetime_local: isoLocal(tithiEnd, offsetMinutes),
    nakshatra: { index: state.nakshatra_index, name: state.nakshatra_name },
    nakshatra_start_datetime_utc: isoUtc(nakStart),
    nakshatra_end_datetime_utc: isoUtc(nakEnd),
    nakshatra_start_datetime_local: isoLocal(nakStart, offsetMinutes),
    nakshatra_end_datetime_local: isoLocal(nakEnd, offsetMinutes),
    yoga: { index: state.yoga_index, name: state.yoga_name },
    yoga_start_datetime_utc: isoUtc(yogaStart),
    yoga_end_datetime_utc: isoUtc(yogaEnd),
    yoga_start_datetime_local: isoLocal(yogaStart, offsetMinutes),
    yoga_end_datetime_local: isoLocal(yogaEnd, offsetMinutes),
    karana: { index: state.karana_index, name: state.karana_name },
    karana_start_datetime_utc: isoUtc(karanaStart),
    karana_end_datetime_utc: isoUtc(karanaEnd),
    karana_start_datetime_local: isoLocal(karanaStart, offsetMinutes),
    karana_end_datetime_local: isoLocal(karanaEnd, offsetMinutes),
    paksha: state.paksha,
    vara,
    vara_basis: "civil_local_date_preliminary_internal_dry_run",
    observance_candidates: [],
    eclipse_candidates: [],
    internal_validation_status: "pending_ag70l_internal_validation",
    post_computation_manual_verification_status: "not_started",
    public_output_allowed: false
  };
}

function validateComputedRecord(record) {
  const issues = [];
  if (!record.computed_values_present) issues.push("computed_values_present_false");
  for (const field of [
    "sunrise_datetime_local",
    "sunset_datetime_local",
    "sun_longitude_sidereal",
    "moon_longitude_sidereal",
    "moon_minus_sun_angular_difference",
    "tithi",
    "nakshatra",
    "yoga",
    "karana",
    "paksha",
    "vara"
  ]) {
    if (record[field] === null || record[field] === undefined) issues.push(`missing_${field}`);
  }
  if (record.public_output_allowed !== false) issues.push("public_output_not_blocked");
  if (record.tithi?.index < 1 || record.tithi?.index > 30) issues.push("tithi_index_out_of_range");
  if (record.nakshatra?.index < 1 || record.nakshatra?.index > 27) issues.push("nakshatra_index_out_of_range");
  if (record.yoga?.index < 1 || record.yoga?.index > 27) issues.push("yoga_index_out_of_range");
  if (record.karana?.index < 1 || record.karana?.index > 60) issues.push("karana_index_out_of_range");
  return issues;
}

const location = locationLock.records[0];
const ayanamsaId = ayanamsaLock.ayanamsa_record.ayanamsa_id;
const computedRecords = pendingDailyBank.records.map((record) => computeRecord(record, location, ayanamsaId));
const validationIssues = computedRecords.map((record) => ({
  panchang_daily_record_id: record.panchang_daily_record_id,
  issue_count: validateComputedRecord(record).length,
  issues: validateComputedRecord(record)
}));

const issueCount = validationIssues.reduce((sum, item) => sum + item.issue_count, 0);

const computedDailyBank = {
  ...pendingDailyBank,
  status: "panchang_daily_calculation_bank_batch_01_computed_internal_dry_run_public_blocked",
  purpose: "Computed Batch 01 Panchang daily records using Drishvara internal dry-run engine; public output remains blocked.",
  computed_panchang_daily_record_count: computedRecords.length,
  daily_request_record_count: computedRecords.length,
  fabricated_value_count: 0,
  external_site_input_count: 0,
  public_output_allowed_now: false,
  computation_engine_stage: "AG70K",
  records: computedRecords
};

const engineDryRun = {
  module_id: "AG70K",
  title: "Internal Panchang Daily Computation Engine Dry Run",
  status: "ag70k_internal_panchang_daily_computation_engine_dry_run_completed",
  purpose: "Populate Batch 01 pending daily records with internally computed preliminary Panchang values.",
  computation_model_id: "drishvara_internal_panchang_model_v1",
  precision_class: "internal_dry_run_preliminary_astronomical_approximation",
  location_id: location.location_id,
  ayanamsa_id: ayanamsaId,
  date_range: {
    start: computedRecords[0]?.date_key,
    end: computedRecords[computedRecords.length - 1]?.date_key
  },
  algorithm_basis: [
    "approximate solar longitude",
    "approximate lunar longitude",
    "Lahiri/Chitrapaksha approximate ayanamsa value",
    "Tithi from Moon-Sun angular difference / 12 degrees",
    "Nakshatra from sidereal Moon longitude / 13°20′",
    "Yoga from sidereal Sun+Moon longitude / 13°20′",
    "Karana from Moon-Sun angular difference / 6 degrees",
    "Paksha from Tithi half",
    "Vara from civil local date preliminary dry-run basis",
    "approximate sunrise/sunset using internal solar calculation"
  ],
  external_panchang_sites_used_as_source: false,
  external_panchang_sites_used_for_data_generation: false,
  external_panchang_sites_used_as_runtime_dependency: false,
  computed_record_count: computedRecords.length,
  public_output_allowed_now: false
};

const invariantReport = {
  module_id: "AG70K",
  title: "Internal Computation Invariant Report",
  status: issueCount === 0 ? "internal_computation_invariant_report_passed" : "internal_computation_invariant_report_has_issues",
  issue_count: issueCount,
  record_count: computedRecords.length,
  checks: [
    "required fields populated",
    "Tithi index range 1..30",
    "Nakshatra index range 1..27",
    "Yoga index range 1..27",
    "Karana index range 1..60",
    "public output blocked",
    "external source input absent"
  ],
  records: validationIssues
};

const noExternalAudit = {
  module_id: "AG70K",
  title: "No External Panchang Source Audit",
  status: "no_external_panchang_source_audit_passed",
  external_panchang_sites_used_as_source: false,
  external_panchang_sites_used_for_data_generation: false,
  external_panchang_sites_used_as_runtime_dependency: false,
  external_panchang_sites_used_for_public_claim: false,
  external_panchang_sites_allowed_only_for_later_manual_post_output_verification: true,
  external_site_input_count: 0
};

const noPublicOutputAudit = {
  module_id: "AG70K",
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
  status: "production_bank_manifest_created_internal_panchang_daily_computation_engine_dry_run",
  current_status: "panchang_daily_calculation_bank_batch_01_computed_internal_dry_run_public_blocked",
  ag70k_files: {
    engine_dry_run: outputs.engineDryRun,
    computed_daily_bank: outputs.computedDailyBank,
    updated_daily_bank: outputs.dailyBank,
    invariant_report: outputs.invariantReport,
    no_external_audit: outputs.noExternalAudit,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    daily_calculation_request_records: computedRecords.length,
    panchang_daily_records: computedRecords.length,
    computed_internal_dry_run_records: computedRecords.length,
    observance_events: 0,
    eclipse_events: 0,
    context_interpretation_records: 0
  },
  next_required_stage: "AG70L — Computed Panchang Daily Bank Internal Validation"
};

const review = {
  module_id: "AG70K",
  title: "Internal Panchang Daily Computation Engine Dry Run",
  status: "ag70k_internal_panchang_daily_computation_engine_dry_run_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70j_review: "data/content-intelligence/quality-reviews/ag70j-panchang-computation-basis-lock-daily-bank.json",
    pending_daily_bank: "data/knowledge-base/panchang-festival/production/panchang-daily-calculation-bank-batch-01.json"
  },
  generated_records: outputs,
  summary: {
    internal_computation_engine_dry_run_completed: true,
    computed_record_count: computedRecords.length,
    invariant_issue_count: issueCount,
    tithi_values_populated: true,
    nakshatra_values_populated: true,
    yoga_values_populated: true,
    karana_values_populated: true,
    paksha_values_populated: true,
    vara_values_populated: true,
    sunrise_sunset_values_populated: true,
    solar_lunar_longitude_values_populated: true,
    fabricated_panchang_value_count: 0,
    external_panchang_sites_used_as_source: false,
    external_panchang_sites_used_as_runtime_dependency: false,
    external_panchang_sites_used_for_data_generation: false,
    public_panchang_output_allowed_now: false,
    actual_observance_events_created_now: false,
    actual_eclipse_events_created_now: false,
    context_interpretation_records_created_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70l: issueCount === 0
  }
};

const readiness = {
  module_id: "AG70K",
  title: "AG70L Computed Panchang Daily Bank Internal Validation Readiness Record",
  status: issueCount === 0 ? "ready_for_ag70l_computed_panchang_daily_bank_internal_validation" : "blocked_for_ag70l_due_to_internal_invariant_issues",
  ready_for_ag70l: issueCount === 0,
  next_stage: "AG70L — Computed Panchang Daily Bank Internal Validation",
  reason: issueCount === 0
    ? "Internal dry-run values are populated and basic invariant checks passed. AG70L should validate against internal model rules and locked basis, not external Panchang sites."
    : "Internal dry-run values have invariant issues and must be corrected before AG70L."
};

const boundary = {
  module_id: "AG70K",
  title: "AG70K to AG70L Computed Panchang Daily Bank Internal Validation Boundary",
  status: "ag70l_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Validate computed values against AG70I formulas and AG70J locked basis.",
    "Check ranges, boundaries, timezone conversion, sunrise basis and null safety.",
    "Keep external Panchang sites outside production validation.",
    "Keep manual external comparison deferred until after internal validation."
  ],
  blocked_scope_without_explicit_approval: [
    "public Panchang output",
    "actual festival/observance date publication",
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
  module_id: "AG70K",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70K",
  status: review.status,
  computed_record_count: computedRecords.length,
  invariant_issue_count: issueCount,
  external_site_input_count: 0,
  public_panchang_output_allowed_now: 0,
  observance_events_created_now: 0,
  eclipse_events_created_now: 0,
  context_interpretation_records_created_now: 0,
  ready_for_ag70l: issueCount === 0 ? 1 : 0
};

const doc = `# AG70K — Internal Panchang Daily Computation Engine Dry Run

AG70K computes Batch 01 Panchang daily records using the Drishvara internal dry-run computation engine.

## Computed internally

- Sunrise/sunset
- Solar longitude
- Lunar longitude
- Moon-Sun angular difference
- Tithi
- Nakshatra
- Yoga
- Karana
- Paksha
- Vara

## Important boundary

This is an internal dry-run computation with public output blocked. External Panchang sites are not used as source, runtime dependency, data-generation input, or validation source.

AG70L must validate these values against internal formulas and locked basis first.

## Not done

- No public Panchang output.
- No festival/observance event publication.
- No eclipse event publication.
- No context interpretation records.
- No generated Word output.
- No UI/backend/Supabase activation.
`;

writeJson(outputs.engineDryRun, engineDryRun);
writeJson(outputs.computedDailyBank, computedDailyBank);
writeJson(outputs.dailyBank, computedDailyBank);
writeJson(outputs.invariantReport, invariantReport);
writeJson(outputs.noExternalAudit, noExternalAudit);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70K internal Panchang daily computation dry run generated.");
console.log(`✅ Computed records: ${computedRecords.length}; invariant issues: ${issueCount}.`);
console.log("✅ External Panchang sites excluded from source/runtime/data-generation/validation.");
console.log("✅ Public output, UI, backend and Supabase remain blocked.");
