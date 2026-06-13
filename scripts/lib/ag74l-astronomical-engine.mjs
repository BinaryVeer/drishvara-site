import {
  DeltaT_EspenakMeeus,
  EclipticGeoMoon,
  MakeTime,
  SetDeltaTFunction,
  SunPosition
} from "astronomy-engine";

export const AG74L_ENGINE_PROFILE_ID = "drishvara_astronomical_engine_v1";
export const AG74L_ENGINE_PACKAGE = "astronomy-engine";
export const AG74L_ENGINE_PACKAGE_VERSION = "2.1.19";
export const AG74L_AYANAMSHA_MODEL_ID = "drishvara_lahiri_linear_tt_v1";
export const AG74L_SUPPORTED_START = "1900-01-01T00:00:00.000Z";
export const AG74L_SUPPORTED_END = "2100-12-31T23:59:59.999Z";

const J2000_JULIAN_DATE = 2451545.0;
const TROPICAL_YEAR_DAYS = 365.242189;
const LAHIRI_J2000_ANCHOR_DEGREES = 23.85675;
const LAHIRI_RATE_DEGREES_PER_TROPICAL_YEAR = 0.013969;

SetDeltaTFunction(DeltaT_EspenakMeeus);

export function normalizeDegrees(value) {
  if (!Number.isFinite(value)) throw new TypeError("Angle must be finite.");
  return ((value % 360) + 360) % 360;
}

export function signedAngularDifferenceDegrees(value, target) {
  return ((normalizeDegrees(value) - normalizeDegrees(target) + 540) % 360) - 180;
}

export function absoluteAngularDifferenceDegrees(value, target) {
  return Math.abs(signedAngularDifferenceDegrees(value, target));
}

export function roundNumber(value, digits = 9) {
  return Number(value.toFixed(digits));
}

function parseUtcInstant(input) {
  const date = input instanceof Date ? new Date(input.getTime()) : new Date(input);
  if (!Number.isFinite(date.getTime())) throw new TypeError("Invalid UTC instant.");
  const iso = date.toISOString();
  if (iso < AG74L_SUPPORTED_START || iso > AG74L_SUPPORTED_END) {
    throw new RangeError("UTC instant is outside the AG74L supported range.");
  }
  return date;
}

export function lahiriChitrapakshaAyanamshaDegrees(input) {
  const time = MakeTime(parseUtcInstant(input));
  const tropicalYearsFromJ2000 = time.tt / TROPICAL_YEAR_DAYS;
  return normalizeDegrees(
    LAHIRI_J2000_ANCHOR_DEGREES +
      LAHIRI_RATE_DEGREES_PER_TROPICAL_YEAR * tropicalYearsFromJ2000
  );
}

export function astronomicalPrimitiveState(input) {
  const date = parseUtcInstant(input);
  const time = MakeTime(date);
  const sun = SunPosition(time);
  const moon = EclipticGeoMoon(time);
  const ayanamsha = lahiriChitrapakshaAyanamshaDegrees(date);
  const sunTropical = normalizeDegrees(sun.elon);
  const moonTropical = normalizeDegrees(moon.lon);
  const sunSidereal = normalizeDegrees(sunTropical - ayanamsha);
  const moonSidereal = normalizeDegrees(moonTropical - ayanamsha);

  return {
    status: "ag74l_internal_primitive_computed_public_blocked",
    engine_profile_id: AG74L_ENGINE_PROFILE_ID,
    engine_package: AG74L_ENGINE_PACKAGE,
    engine_package_version: AG74L_ENGINE_PACKAGE_VERSION,
    utc: date.toISOString(),
    julian_date_utc: roundNumber(J2000_JULIAN_DATE + time.ut, 12),
    ut_j2000_days: roundNumber(time.ut, 12),
    tt_j2000_days: roundNumber(time.tt, 12),
    delta_t_seconds: roundNumber((time.tt - time.ut) * 86400, 6),
    time_scale_profile: "UTC_as_UT1_approximation_plus_TT",
    delta_t_model_id: "ae_2_1_19_espenak_meeus_v1",
    precession_model_id: "ae_2_1_19_iau_2006_precession",
    nutation_model_id: "ae_2_1_19_iau_2000b_nutation",
    ayanamsha_model_id: AG74L_AYANAMSHA_MODEL_ID,
    ayanamsha_degrees: roundNumber(ayanamsha),
    sun_longitude_tropical: roundNumber(sunTropical),
    moon_longitude_tropical: roundNumber(moonTropical),
    sun_longitude_sidereal: roundNumber(sunSidereal),
    moon_longitude_sidereal: roundNumber(moonSidereal),
    moon_minus_sun_elongation: roundNumber(
      normalizeDegrees(moonTropical - sunTropical)
    ),
    combined_sidereal_longitude_for_yoga: roundNumber(
      normalizeDegrees(moonSidereal + sunSidereal)
    ),
    geocentric_core_longitudes: true,
    topocentric_correction_applied: false,
    sunrise_or_sunset_computed: false,
    panchang_elements_classified: false,
    public_output_allowed: false,
    external_api_used: false
  };
}

function angleForKind(kind, unixMs) {
  const state = astronomicalPrimitiveState(new Date(unixMs));
  if (kind === "moon_sun_elongation") return state.moon_minus_sun_elongation;
  if (kind === "sidereal_moon_longitude") return state.moon_longitude_sidereal;
  if (kind === "sidereal_sun_longitude") return state.sun_longitude_sidereal;
  if (kind === "sidereal_yoga_sum") {
    return state.combined_sidereal_longitude_for_yoga;
  }
  throw new TypeError("Unsupported AG74L angle kind: " + kind);
}

function unwrapNear(previousUnwrapped, rawAngle) {
  let value = normalizeDegrees(rawAngle);
  while (value - previousUnwrapped > 180) value -= 360;
  while (value - previousUnwrapped < -180) value += 360;
  return value;
}

export function findNextAngularBoundary({
  kind,
  target_degrees,
  start_utc,
  max_days = 40,
  step_hours = 3,
  tolerance_seconds = 0.5
}) {
  if (!Number.isFinite(target_degrees)) throw new TypeError("Target angle must be finite.");
  if (!(max_days > 0)) throw new RangeError("max_days must be positive.");
  if (!(step_hours > 0 && step_hours <= 24)) {
    throw new RangeError("step_hours must be within (0, 24].");
  }
  if (!(tolerance_seconds > 0 && tolerance_seconds <= 60)) {
    throw new RangeError("tolerance_seconds must be within (0, 60].");
  }

  const startDate = parseUtcInstant(start_utc);
  const startMs = startDate.getTime();
  const endMs = Math.min(
    Date.parse(AG74L_SUPPORTED_END),
    startMs + max_days * 86400000
  );
  const stepMs = step_hours * 3600000;

  let lowerMs = startMs;
  let lowerValue = angleForKind(kind, lowerMs);
  let targetContinuous = normalizeDegrees(target_degrees);
  while (targetContinuous <= lowerValue + 1e-10) targetContinuous += 360;

  let upperMs = null;
  let upperValue = null;
  let scanSteps = 0;

  for (let probeMs = startMs + stepMs; probeMs <= endMs; probeMs += stepMs) {
    scanSteps += 1;
    const probeValue = unwrapNear(lowerValue, angleForKind(kind, probeMs));
    if (probeValue >= targetContinuous) {
      upperMs = probeMs;
      upperValue = probeValue;
      break;
    }
    lowerMs = probeMs;
    lowerValue = probeValue;
  }

  if (upperMs === null) {
    throw new Error("No AG74L angular boundary found within the requested window.");
  }

  let iterations = 0;
  while ((upperMs - lowerMs) / 1000 > tolerance_seconds && iterations < 100) {
    iterations += 1;
    const midpointMs = Math.floor((lowerMs + upperMs) / 2);
    const midpointValue = unwrapNear(
      lowerValue,
      angleForKind(kind, midpointMs)
    );
    if (midpointValue < targetContinuous) {
      lowerMs = midpointMs;
      lowerValue = midpointValue;
    } else {
      upperMs = midpointMs;
      upperValue = midpointValue;
    }
  }

  const eventAngle = angleForKind(kind, upperMs);
  const residual = absoluteAngularDifferenceDegrees(
    eventAngle,
    normalizeDegrees(target_degrees)
  );

  return {
    status: "ag74l_internal_boundary_found_public_blocked",
    kind,
    target_degrees: roundNumber(normalizeDegrees(target_degrees)),
    start_utc: startDate.toISOString(),
    event_utc: new Date(upperMs).toISOString(),
    event_angle_degrees: roundNumber(eventAngle),
    angle_residual_degrees: roundNumber(residual, 12),
    search_window_days: max_days,
    step_hours,
    tolerance_seconds,
    coarse_scan_steps: scanSteps,
    bisection_iterations: iterations,
    final_bracket_seconds: roundNumber((upperMs - lowerMs) / 1000, 6),
    engine_profile_id: AG74L_ENGINE_PROFILE_ID,
    public_output_allowed: false,
    sunrise_or_daily_allocation_performed: false,
    external_api_used: false
  };
}
