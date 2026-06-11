export const tithiNames = [
  "Shukla Pratipada", "Shukla Dwitiya", "Shukla Tritiya", "Shukla Chaturthi", "Shukla Panchami",
  "Shukla Shashthi", "Shukla Saptami", "Shukla Ashtami", "Shukla Navami", "Shukla Dashami",
  "Shukla Ekadashi", "Shukla Dwadashi", "Shukla Trayodashi", "Shukla Chaturdashi", "Purnima",
  "Krishna Pratipada", "Krishna Dwitiya", "Krishna Tritiya", "Krishna Chaturthi", "Krishna Panchami",
  "Krishna Shashthi", "Krishna Saptami", "Krishna Ashtami", "Krishna Navami", "Krishna Dashami",
  "Krishna Ekadashi", "Krishna Dwadashi", "Krishna Trayodashi", "Krishna Chaturdashi", "Amavasya"
];

export const nakshatraNames = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
  "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

export const yogaNames = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula",
  "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

export const varaNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const fixedTimezoneOffsets = {
  "Asia/Kolkata": 330,
  "Asia/Tokyo": 540
};

export function timezoneOffsetMinutes(timezone) {
  if (Object.prototype.hasOwnProperty.call(fixedTimezoneOffsets, timezone)) {
    return fixedTimezoneOffsets[timezone];
  }
  throw new Error(`Unsupported AG71I-B pilot timezone: ${timezone}`);
}

export function degToRad(value) {
  return value * Math.PI / 180;
}

export function norm360(value) {
  return ((value % 360) + 360) % 360;
}

export function round(value, digits = 6) {
  return Number(value.toFixed(digits));
}

export function julianDayFromUnixMs(unixMs) {
  return unixMs / 86400000 + 2440587.5;
}

export function ayanamsaLahiriApprox(date) {
  const year = date.getUTCFullYear() + (date.getUTCMonth() + 0.5) / 12;
  return 23.85675 + 0.013969 * (year - 2000);
}

export function solarLongitudeTropical(unixMs) {
  const days = julianDayFromUnixMs(unixMs) - 2451545.0;
  const meanLongitude = norm360(280.460 + 0.9856474 * days);
  const anomaly = norm360(357.528 + 0.9856003 * days);

  return norm360(
    meanLongitude
    + 1.915 * Math.sin(degToRad(anomaly))
    + 0.020 * Math.sin(degToRad(2 * anomaly))
  );
}

export function lunarLongitudeTropical(unixMs) {
  const days = julianDayFromUnixMs(unixMs) - 2451545.0;

  const meanLongitude = norm360(218.316 + 13.176396 * days);
  const moonAnomaly = norm360(134.963 + 13.064993 * days);
  const sunAnomaly = norm360(357.529 + 0.98560028 * days);
  const elongation = norm360(297.850 + 12.190749 * days);
  const latitudeArgument = norm360(93.272 + 13.229350 * days);

  return norm360(
    meanLongitude
    + 6.289 * Math.sin(degToRad(moonAnomaly))
    + 1.274 * Math.sin(degToRad(2 * elongation - moonAnomaly))
    + 0.658 * Math.sin(degToRad(2 * elongation))
    + 0.214 * Math.sin(degToRad(2 * moonAnomaly))
    - 0.186 * Math.sin(degToRad(sunAnomaly))
    - 0.114 * Math.sin(degToRad(2 * latitudeArgument))
  );
}

export function karanaName(index) {
  if (index === 1) return "Kimstughna";
  if (index >= 58) return ["Shakuni", "Chatushpada", "Naga"][index - 58] || "Naga";

  const repeating = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
  return repeating[(index - 2) % 7];
}

export function astronomicalState(unixMs) {
  const date = new Date(unixMs);
  const ayanamsa = ayanamsaLahiriApprox(date);

  const sunTropical = solarLongitudeTropical(unixMs);
  const moonTropical = lunarLongitudeTropical(unixMs);

  const sunSidereal = norm360(sunTropical - ayanamsa);
  const moonSidereal = norm360(moonTropical - ayanamsa);

  const moonMinusSun = norm360(moonSidereal - sunSidereal);
  const combinedForYoga = norm360(moonSidereal + sunSidereal);

  const tithiIndex = Math.floor(moonMinusSun / 12) + 1;
  const nakshatraIndex = Math.floor(moonSidereal / (360 / 27)) + 1;
  const yogaIndex = Math.floor(combinedForYoga / (360 / 27)) + 1;
  const karanaIndex = Math.floor(moonMinusSun / 6) + 1;

  return {
    ayanamsa_value: round(ayanamsa),
    sun_longitude_tropical: round(sunTropical),
    moon_longitude_tropical: round(moonTropical),
    sun_longitude_sidereal: round(sunSidereal),
    moon_longitude_sidereal: round(moonSidereal),
    moon_minus_sun_angular_difference: round(moonMinusSun),
    combined_sidereal_longitude_for_yoga: round(combinedForYoga),
    tithi: { index: tithiIndex, name: tithiNames[tithiIndex - 1] },
    nakshatra: { index: nakshatraIndex, name: nakshatraNames[nakshatraIndex - 1] },
    yoga: { index: yogaIndex, name: yogaNames[yogaIndex - 1] },
    karana: { index: karanaIndex, name: karanaName(karanaIndex) },
    paksha: tithiIndex <= 15 ? "Shukla Paksha" : "Krishna Paksha"
  };
}

export function localMidnightUtcMs(dateKey, timezone) {
  const offsetMinutes = timezoneOffsetMinutes(timezone);
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day, 0, 0, 0) - offsetMinutes * 60 * 1000;
}

export function localCivilVara(dateKey, timezone) {
  const offsetMinutes = timezoneOffsetMinutes(timezone);
  const localMidnight = localMidnightUtcMs(dateKey, timezone);
  const localDate = new Date(localMidnight + offsetMinutes * 60 * 1000);
  return varaNames[localDate.getUTCDay()];
}

export function elementIndexAt(unixMs, type) {
  const state = astronomicalState(unixMs);

  if (type === "tithi") return state.tithi.index;
  if (type === "nakshatra") return state.nakshatra.index;
  if (type === "yoga") return state.yoga.index;
  if (type === "karana") return state.karana.index;

  throw new Error(`Unsupported Panchang element type: ${type}`);
}

export function findBoundary(unixMs, type, direction) {
  const current = elementIndexAt(unixMs, type);
  const oneHour = 60 * 60 * 1000;

  let lower = unixMs;
  let upper = unixMs;

  for (let step = 1; step <= 96; step += 1) {
    const probe = direction === "backward"
      ? unixMs - step * oneHour
      : unixMs + step * oneHour;

    if (elementIndexAt(probe, type) !== current) {
      if (direction === "backward") {
        lower = probe;
        upper = unixMs - (step - 1) * oneHour;
      } else {
        lower = unixMs + (step - 1) * oneHour;
        upper = probe;
      }
      break;
    }
  }

  for (let i = 0; i < 40; i += 1) {
    const midpoint = Math.floor((lower + upper) / 2);
    const midpointIndex = elementIndexAt(midpoint, type);

    if (direction === "backward") {
      if (midpointIndex === current) upper = midpoint;
      else lower = midpoint;
    } else {
      if (midpointIndex === current) lower = midpoint;
      else upper = midpoint;
    }
  }

  return upper;
}

export function offsetSuffix(timezone) {
  const offsetMinutes = timezoneOffsetMinutes(timezone);
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const minutes = String(absolute % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

export function isoLocalFromUtcMs(unixMs, timezone) {
  const offsetMinutes = timezoneOffsetMinutes(timezone);
  const local = new Date(unixMs + offsetMinutes * 60 * 1000);

  const yyyy = local.getUTCFullYear();
  const mm = String(local.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(local.getUTCDate()).padStart(2, "0");
  const hh = String(local.getUTCHours()).padStart(2, "0");
  const mi = String(local.getUTCMinutes()).padStart(2, "0");
  const ss = String(local.getUTCSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}${offsetSuffix(timezone)}`;
}

export function isoUtc(unixMs) {
  return new Date(unixMs).toISOString().replace(".000Z", "Z");
}

export function computeInternalPanchangRecord(request, options = {}) {
  const timezone = request.timezone;
  const latitude = Number(request.latitude_decimal);
  const longitude = Number(request.longitude_decimal);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error(`Invalid coordinates for request: ${request.request_id || "unknown"}`);
  }

  const localMidnight = localMidnightUtcMs(request.date_key, timezone);
  const snapshotMs = localMidnight + 6 * 60 * 60 * 1000;
  const state = astronomicalState(snapshotMs);

  const generatedAt = options.generatedAt || new Date().toISOString();

  return {
    panchang_daily_record_id: `ag71i_dry_run_${request.location_id}_${request.date_key.replaceAll("-", "")}`,
    source_request_id: request.request_id,
    date_key: request.date_key,
    location_id: request.location_id,
    display_label: request.display_label,
    timezone,
    timezone_offset_minutes: timezoneOffsetMinutes(timezone),
    latitude_decimal: latitude,
    longitude_decimal: longitude,
    calculation_model_id: request.calculation_model_id || "drishvara_internal_panchang_model_v1",
    ayanamsa_id: request.ayanamsa_id || "ayanamsa_lahiri_chitrapaksha_internal_v1",
    record_status: "computed_internal_dry_run_public_blocked",
    computed_values_present: true,
    snapshot_basis: "local_06_00_dry_run_snapshot",
    calculation_generated_at: generatedAt,
    snapshot_datetime_utc: isoUtc(snapshotMs),
    snapshot_datetime_local: isoLocalFromUtcMs(snapshotMs, timezone),
    ...state,
    vara: localCivilVara(request.date_key, timezone),
    observance_candidates: [],
    observance_candidate_status: "not_computed_in_engine_extraction_step",
    public_output_allowed: false,
    ui_output_allowed: false,
    external_panchang_source_used: false,
    internal_validation_stage: "AG71I-B"
  };
}

export function validateComputedRecord(record) {
  const issues = [];

  if (record.computed_values_present !== true) issues.push("computed_values_not_present");
  if (record.public_output_allowed !== false) issues.push("public_output_not_blocked");
  if (record.ui_output_allowed !== false) issues.push("ui_output_not_blocked");
  if (record.external_panchang_source_used !== false) issues.push("external_source_flag_not_false");

  if (!record.tithi || record.tithi.index < 1 || record.tithi.index > 30) issues.push("tithi_out_of_range");
  if (!record.nakshatra || record.nakshatra.index < 1 || record.nakshatra.index > 27) issues.push("nakshatra_out_of_range");
  if (!record.yoga || record.yoga.index < 1 || record.yoga.index > 27) issues.push("yoga_out_of_range");
  if (!record.karana || record.karana.index < 1 || record.karana.index > 60) issues.push("karana_out_of_range");
  if (!["Shukla Paksha", "Krishna Paksha"].includes(record.paksha)) issues.push("paksha_invalid");

  return issues;
}
