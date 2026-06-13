import {
  Body,
  Equator,
  Horizon,
  Observer,
  SearchRiseSet
} from "astronomy-engine";

import {
  loadAg74kResolverContext,
  resolveAg74kPanchangInput
} from "./ag74k-panchang-input-resolver.mjs";

import {
  AG74L_ENGINE_PROFILE_ID,
  AG74L_ENGINE_PACKAGE_VERSION,
  astronomicalPrimitiveState,
  findNextAngularBoundary
} from "./ag74l-astronomical-engine.mjs";

export const AG74M_ORCHESTRATOR_VERSION = "1.0.0";
export const AG74M_SUNRISE_PROFILE_ID =
  "drishvara_apparent_upper_limb_level_horizon_v1";

const DAY_MS = 86400000;
const HALF_SECOND_MS = 500;
const BACKWARD_SCAN_STEP_MS = 30 * 60 * 1000;
const BACKWARD_SCAN_LIMIT_MS = 4 * DAY_MS;

const tithiNames = [
  "Shukla Pratipada",
  "Shukla Dwitiya",
  "Shukla Tritiya",
  "Shukla Chaturthi",
  "Shukla Panchami",
  "Shukla Shashthi",
  "Shukla Saptami",
  "Shukla Ashtami",
  "Shukla Navami",
  "Shukla Dashami",
  "Shukla Ekadashi",
  "Shukla Dwadashi",
  "Shukla Trayodashi",
  "Shukla Chaturdashi",
  "Purnima",
  "Krishna Pratipada",
  "Krishna Dwitiya",
  "Krishna Tritiya",
  "Krishna Chaturthi",
  "Krishna Panchami",
  "Krishna Shashthi",
  "Krishna Saptami",
  "Krishna Ashtami",
  "Krishna Navami",
  "Krishna Dashami",
  "Krishna Ekadashi",
  "Krishna Dwadashi",
  "Krishna Trayodashi",
  "Krishna Chaturdashi",
  "Amavasya"
];

const nakshatraNames = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati"
];

const yogaNames = [
  "Vishkambha",
  "Priti",
  "Ayushman",
  "Saubhagya",
  "Shobhana",
  "Atiganda",
  "Sukarma",
  "Dhriti",
  "Shula",
  "Ganda",
  "Vriddhi",
  "Dhruva",
  "Vyaghata",
  "Harshana",
  "Vajra",
  "Siddhi",
  "Vyatipata",
  "Variyana",
  "Parigha",
  "Shiva",
  "Siddha",
  "Sadhya",
  "Shubha",
  "Shukla",
  "Brahma",
  "Indra",
  "Vaidhriti"
];

const varaNames = [
  { english: "Sunday", sanskrit: "Ravivara" },
  { english: "Monday", sanskrit: "Somavara" },
  { english: "Tuesday", sanskrit: "Mangalavara" },
  { english: "Wednesday", sanskrit: "Budhavara" },
  { english: "Thursday", sanskrit: "Guruvara" },
  { english: "Friday", sanskrit: "Shukravara" },
  { english: "Saturday", sanskrit: "Shanivara" }
];

const elementDefinitions = {
  tithi: {
    field: "moon_minus_sun_elongation",
    kind: "moon_sun_elongation",
    segment_degrees: 12,
    count: 30,
    name: (index) => tithiNames[index - 1]
  },
  nakshatra: {
    field: "moon_longitude_sidereal",
    kind: "sidereal_moon_longitude",
    segment_degrees: 360 / 27,
    count: 27,
    name: (index) => nakshatraNames[index - 1]
  },
  yoga: {
    field: "combined_sidereal_longitude_for_yoga",
    kind: "sidereal_yoga_sum",
    segment_degrees: 360 / 27,
    count: 27,
    name: (index) => yogaNames[index - 1]
  },
  karana: {
    field: "moon_minus_sun_elongation",
    kind: "moon_sun_elongation",
    segment_degrees: 6,
    count: 60,
    name: karanaName
  }
};

const formatterCache = new Map();

function roundNumber(value, digits = 6) {
  return Number(value.toFixed(digits));
}

function pad(value, width = 2) {
  return String(value).padStart(width, "0");
}

function getFormatter(timezone) {
  if (!formatterCache.has(timezone)) {
    formatterCache.set(
      timezone,
      new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        calendar: "gregory",
        numberingSystem: "latn",
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    );
  }
  return formatterCache.get(timezone);
}

function zonedParts(unixMs, timezone) {
  const parts = {};
  for (const part of getFormatter(timezone).formatToParts(
    new Date(unixMs)
  )) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second)
  };
}

export function localDateKeyAt(unixMs, timezone) {
  const p = zonedParts(unixMs, timezone);
  return `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}`;
}

export function addCivilDays(dateKey, days) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function firstUtcInstantAtOrAfterLocalDate(dateKey, timezone) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const approximate = Date.UTC(year, month - 1, day, 12);

  let lower = approximate - 72 * 60 * 60 * 1000;
  let upper = approximate + 72 * 60 * 60 * 1000;

  while (localDateKeyAt(lower, timezone) >= dateKey) {
    lower -= DAY_MS;
  }
  while (localDateKeyAt(upper, timezone) < dateKey) {
    upper += DAY_MS;
  }

  while (upper - lower > 1) {
    const midpoint = Math.floor((lower + upper) / 2);
    if (localDateKeyAt(midpoint, timezone) < dateKey) {
      lower = midpoint;
    } else {
      upper = midpoint;
    }
  }

  return upper;
}

export function constructLocalCivilDayWindow(dateKey, timezone) {
  const startMs = firstUtcInstantAtOrAfterLocalDate(
    dateKey,
    timezone
  );

  if (localDateKeyAt(startMs, timezone) !== dateKey) {
    return {
      available: false,
      reason: "nonexistent_local_civil_date",
      civil_date: dateKey,
      timezone
    };
  }

  const nextDateKey = addCivilDays(dateKey, 1);
  const endMs = firstUtcInstantAtOrAfterLocalDate(
    nextDateKey,
    timezone
  );

  if (!(endMs > startMs)) {
    return {
      available: false,
      reason: "invalid_local_civil_day_window",
      civil_date: dateKey,
      timezone
    };
  }

  return {
    available: true,
    civil_date: dateKey,
    timezone,
    start_utc: new Date(startMs).toISOString(),
    end_utc_exclusive: new Date(endMs).toISOString(),
    start_local: formatZonedIso(startMs, timezone),
    end_local_exclusive: formatZonedIso(endMs, timezone),
    duration_hours: roundNumber((endMs - startMs) / 3600000, 6),
    start_ms: startMs,
    end_ms: endMs
  };
}

export function timezoneOffsetMinutesAt(unixMs, timezone) {
  const p = zonedParts(unixMs, timezone);
  const localAsUtc = Date.UTC(
    p.year,
    p.month - 1,
    p.day,
    p.hour,
    p.minute,
    p.second
  );
  const utcFloor = Math.floor(unixMs / 1000) * 1000;
  return Math.round((localAsUtc - utcFloor) / 60000);
}

export function formatZonedIso(unixMs, timezone) {
  const p = zonedParts(unixMs, timezone);
  const offsetMinutes = timezoneOffsetMinutesAt(unixMs, timezone);
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);

  return (
    `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}T` +
    `${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}` +
    `${sign}${pad(Math.floor(absolute / 60))}:` +
    `${pad(absolute % 60)}`
  );
}

function karanaName(index) {
  if (index === 1) return "Kimstughna";
  if (index >= 58) {
    return ["Shakuni", "Chatushpada", "Naga"][index - 58];
  }
  const repeating = [
    "Bava",
    "Balava",
    "Kaulava",
    "Taitila",
    "Gara",
    "Vanija",
    "Vishti"
  ];
  return repeating[(index - 2) % 7];
}

function elementIndexFromState(type, state) {
  const definition = elementDefinitions[type];
  return (
    Math.floor(
      state[definition.field] / definition.segment_degrees
    ) + 1
  );
}

function classifyElementsAt(unixMs) {
  const state = astronomicalPrimitiveState(new Date(unixMs));
  const output = {};

  for (const [type, definition] of Object.entries(
    elementDefinitions
  )) {
    const index = elementIndexFromState(type, state);
    output[type] = {
      index,
      name: definition.name(index),
      angle_degrees: state[definition.field]
    };
  }

  return { state, elements: output };
}

function skippedIndices(fromIndex, toIndex, count) {
  if (
    !Number.isInteger(fromIndex) ||
    !Number.isInteger(toIndex)
  ) {
    return [];
  }

  const advance = (toIndex - fromIndex + count) % count;
  if (advance <= 1) return [];

  const skipped = [];
  for (let step = 1; step < advance; step += 1) {
    skipped.push(((fromIndex - 1 + step) % count) + 1);
  }
  return skipped;
}

function namesForIndices(type, indices) {
  const definition = elementDefinitions[type];
  return indices.map((index) => definition.name(index));
}

function sunriseSequence(
  type,
  previousIndex,
  currentIndex,
  nextIndex
) {
  const definition = elementDefinitions[type];
  const skippedBefore = skippedIndices(
    previousIndex,
    currentIndex,
    definition.count
  );
  const skippedAfter = skippedIndices(
    currentIndex,
    nextIndex,
    definition.count
  );

  return {
    previous_index: previousIndex,
    current_index: currentIndex,
    next_index: nextIndex,
    repeated_from_previous:
      Number.isInteger(previousIndex)
        ? previousIndex === currentIndex
        : null,
    repeated_into_next:
      Number.isInteger(nextIndex)
        ? nextIndex === currentIndex
        : null,
    skipped_before_current_indices: skippedBefore,
    skipped_before_current_names: namesForIndices(
      type,
      skippedBefore
    ),
    skipped_after_current_indices: skippedAfter,
    skipped_after_current_names: namesForIndices(
      type,
      skippedAfter
    ),
    unavailable_neighbor_means_unknown: true
  };
}

function resolveElevation(input) {
  if (
    input.observer_elevation_m === undefined ||
    input.observer_elevation_m === null
  ) {
    return {
      ok: true,
      elevation_m: 0,
      basis: "default_zero_level_horizon",
      source: "ag74j_default"
    };
  }

  const elevation = Number(input.observer_elevation_m);
  if (
    !Number.isFinite(elevation) ||
    elevation < -500 ||
    elevation > 100000
  ) {
    return {
      ok: false,
      status: "ag74m_invalid_observer_elevation_public_blocked",
      reason: "invalid_observer_elevation"
    };
  }

  if (
    input.elevation_approval_status !== "approved" ||
    typeof input.elevation_source !== "string" ||
    input.elevation_source.trim() === ""
  ) {
    return {
      ok: false,
      status:
        "ag74m_unapproved_elevation_override_public_blocked",
      reason: "unapproved_elevation_override"
    };
  }

  return {
    ok: true,
    elevation_m: elevation,
    basis: "approved_override",
    source: input.elevation_source.trim()
  };
}

function searchSunEvent(
  dayWindow,
  observer,
  timezone,
  direction
) {
  const searchStart = new Date(dayWindow.start_ms - 1000);
  const searchLimitDays =
    (dayWindow.end_ms - dayWindow.start_ms + 2000) / DAY_MS;

  const result = SearchRiseSet(
    Body.Sun,
    observer,
    direction,
    searchStart,
    searchLimitDays,
    0
  );

  if (!result) return null;

  const eventMs = result.date.getTime();
  if (
    eventMs < dayWindow.start_ms ||
    eventMs >= dayWindow.end_ms
  ) {
    return null;
  }

  return {
    utc: result.date.toISOString(),
    local: formatZonedIso(eventMs, timezone),
    offset_minutes: timezoneOffsetMinutesAt(eventMs, timezone),
    model: {
      profile_id: AG74M_SUNRISE_PROFILE_ID,
      backend: "astronomy-engine@2.1.19",
      solar_limb: "upper_limb",
      atmospheric_refraction:
        "standard_34_arcminutes_density_adjusted",
      horizon: "level_horizon",
      meters_above_local_ground: 0,
      horizon_dip_enabled: false,
      terrain_obstruction_modelled: false
    }
  };
}

function middaySolarAltitude(
  dayWindow,
  observer
) {
  const midpointMs = Math.floor(
    (dayWindow.start_ms + dayWindow.end_ms) / 2
  );
  const date = new Date(midpointMs);
  const equatorial = Equator(
    Body.Sun,
    date,
    observer,
    true,
    true
  );
  const horizontal = Horizon(
    date,
    observer,
    equatorial.ra,
    equatorial.dec,
    "normal"
  );

  return {
    sample_utc: date.toISOString(),
    apparent_altitude_degrees: roundNumber(
      horizontal.altitude,
      9
    )
  };
}

function computeSunEvents(
  dateKey,
  location,
  observerElevationM
) {
  const dayWindow = constructLocalCivilDayWindow(
    dateKey,
    location.timezone
  );

  if (!dayWindow.available) {
    return { dayWindow, sunrise: null, sunset: null };
  }

  const observer = new Observer(
    location.latitude,
    location.longitude,
    observerElevationM
  );

  const sunrise = searchSunEvent(
    dayWindow,
    observer,
    location.timezone,
    1
  );
  const sunset = searchSunEvent(
    dayWindow,
    observer,
    location.timezone,
    -1
  );

  return {
    dayWindow,
    sunrise,
    sunset,
    midday_solar_altitude: middaySolarAltitude(
      dayWindow,
      observer
    )
  };
}

function previousElementBoundary(
  type,
  startMs,
  timezone
) {
  const current = classifyElementsAt(startMs);
  const currentIndex = current.elements[type].index;

  let upperMs = startMs;
  let lowerMs = null;

  for (
    let probeMs = startMs - BACKWARD_SCAN_STEP_MS;
    probeMs >= startMs - BACKWARD_SCAN_LIMIT_MS;
    probeMs -= BACKWARD_SCAN_STEP_MS
  ) {
    const probeIndex =
      classifyElementsAt(probeMs).elements[type].index;

    if (probeIndex !== currentIndex) {
      lowerMs = probeMs;
      break;
    }
    upperMs = probeMs;
  }

  if (lowerMs === null) {
    throw new Error(
      `No previous ${type} transition found within four days.`
    );
  }

  while (upperMs - lowerMs > HALF_SECOND_MS) {
    const midpointMs = Math.floor((lowerMs + upperMs) / 2);
    const midpointIndex =
      classifyElementsAt(midpointMs).elements[type].index;

    if (midpointIndex === currentIndex) {
      upperMs = midpointMs;
    } else {
      lowerMs = midpointMs;
    }
  }

  const fromIndex =
    classifyElementsAt(lowerMs).elements[type].index;

  return {
    utc: new Date(upperMs).toISOString(),
    local: formatZonedIso(upperMs, timezone),
    from_index: fromIndex,
    to_index: currentIndex,
    final_bracket_seconds: roundNumber(
      (upperMs - lowerMs) / 1000,
      6
    ),
    method:
      "30_minute_backward_scan_plus_bisection_0_5_seconds"
  };
}

function nextElementBoundary(
  type,
  startMs,
  timezone
) {
  const definition = elementDefinitions[type];
  const current = classifyElementsAt(startMs);
  const currentIndex = current.elements[type].index;
  const targetDegrees =
    (currentIndex * definition.segment_degrees) % 360;

  const result = findNextAngularBoundary({
    kind: definition.kind,
    target_degrees: targetDegrees,
    start_utc: new Date(startMs),
    max_days: 5,
    step_hours: 1,
    tolerance_seconds: 0.5
  });

  return {
    utc: result.event_utc,
    local: formatZonedIso(
      Date.parse(result.event_utc),
      timezone
    ),
    from_index: currentIndex,
    to_index: (currentIndex % definition.count) + 1,
    target_degrees: result.target_degrees,
    angle_residual_degrees: result.angle_residual_degrees,
    final_bracket_seconds: result.final_bracket_seconds,
    method: "ag74l_versioned_angular_root_finder"
  };
}

function adjacentSunriseClassification(
  dateKey,
  location,
  elevationM
) {
  if (dateKey < "1900-01-01" || dateKey > "2100-12-31") {
    return null;
  }

  const events = computeSunEvents(
    dateKey,
    location,
    elevationM
  );

  if (!events.dayWindow.available || !events.sunrise) {
    return null;
  }

  const sunriseMs = Date.parse(events.sunrise.utc);
  return {
    civil_date: dateKey,
    sunrise_utc: events.sunrise.utc,
    sunrise_local: events.sunrise.local,
    classification: classifyElementsAt(sunriseMs).elements
  };
}

function varaForDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const weekday = new Date(
    Date.UTC(year, month - 1, day)
  ).getUTCDay();

  return {
    index: weekday + 1,
    ...varaNames[weekday],
    basis: "sunrise_anchored_local_civil_date"
  };
}

function blockedResult(
  status,
  reason,
  civilDate,
  resolved,
  extra = {}
) {
  return {
    status,
    availability_reason: reason,
    civil_date: civilDate ?? null,
    resolved_input: resolved?.resolved === true,
    daily_panchang_classification_performed: false,
    public_output_allowed: false,
    festival_generation_executed: false,
    annual_calendar_generation_executed: false,
    external_api_used: false,
    backend_service_deployed: false,
    supabase_activation_performed: false,
    ...extra
  };
}

export function orchestrateAg74mPanchangDay(
  input,
  context = loadAg74kResolverContext()
) {
  const resolved = resolveAg74kPanchangInput(input, context);

  if (!resolved.resolved) {
    return blockedResult(
      "ag74m_input_resolution_failed_public_blocked",
      resolved.status,
      input?.civil_date,
      resolved,
      {
        resolver_result: resolved
      }
    );
  }

  const elevation = resolveElevation(input);
  if (!elevation.ok) {
    return blockedResult(
      elevation.status,
      elevation.reason,
      resolved.civil_date,
      resolved,
      {
        location: resolved.location
      }
    );
  }

  const sun = computeSunEvents(
    resolved.civil_date,
    resolved.location,
    elevation.elevation_m
  );

  if (!sun.dayWindow.available) {
    return blockedResult(
      "ag74m_nonexistent_local_civil_date_public_blocked",
      sun.dayWindow.reason,
      resolved.civil_date,
      resolved,
      {
        location: resolved.location,
        civil_day_window: sun.dayWindow,
        observer_elevation_m: elevation.elevation_m,
        elevation_basis: elevation.basis
      }
    );
  }

  if (!sun.sunrise) {
    let reason = "no_sunrise_within_local_civil_day";

    if (!sun.sunset) {
      reason =
        sun.midday_solar_altitude
          .apparent_altitude_degrees > 0
          ? "polar_day"
          : "polar_night";
    }

    return blockedResult(
      "ag74m_sunrise_unavailable_public_blocked",
      reason,
      resolved.civil_date,
      resolved,
      {
        location: resolved.location,
        civil_day_window: {
          ...sun.dayWindow,
          start_ms: undefined,
          end_ms: undefined
        },
        observer_elevation_m: elevation.elevation_m,
        elevation_basis: elevation.basis,
        elevation_source: elevation.source,
        sunrise: null,
        sunset: sun.sunset,
        midday_solar_altitude: sun.midday_solar_altitude
      }
    );
  }

  const sunriseMs = Date.parse(sun.sunrise.utc);
  const current = classifyElementsAt(sunriseMs);
  const previousDate = addCivilDays(resolved.civil_date, -1);
  const nextDate = addCivilDays(resolved.civil_date, 1);

  const previousSunrise = adjacentSunriseClassification(
    previousDate,
    resolved.location,
    elevation.elevation_m
  );
  const nextSunrise = adjacentSunriseClassification(
    nextDate,
    resolved.location,
    elevation.elevation_m
  );

  const elements = {};

  for (const type of Object.keys(elementDefinitions)) {
    const currentElement = current.elements[type];
    const previousIndex =
      previousSunrise?.classification?.[type]?.index ?? null;
    const nextIndex =
      nextSunrise?.classification?.[type]?.index ?? null;

    elements[type] = {
      ...currentElement,
      allocation_basis: "local_sunrise",
      previous_transition: previousElementBoundary(
        type,
        sunriseMs,
        resolved.location.timezone
      ),
      next_transition: nextElementBoundary(
        type,
        sunriseMs,
        resolved.location.timezone
      ),
      sunrise_sequence: sunriseSequence(
        type,
        previousIndex,
        currentElement.index,
        nextIndex
      )
    };
  }

  const tithiIndex = elements.tithi.index;
  const nextSunriseMs = nextSunrise
    ? Date.parse(nextSunrise.sunrise_utc)
    : null;

  return {
    status:
      "ag74m_internal_day_orchestration_computed_public_blocked",
    module_id: "AG74M",
    orchestrator_version: AG74M_ORCHESTRATOR_VERSION,
    civil_date: resolved.civil_date,
    location: resolved.location,
    canonical_profile: resolved.canonical_profile,
    observer_elevation_m: elevation.elevation_m,
    elevation_basis: elevation.basis,
    elevation_source: elevation.source,
    civil_day_window: {
      civil_date: sun.dayWindow.civil_date,
      timezone: sun.dayWindow.timezone,
      start_utc: sun.dayWindow.start_utc,
      end_utc_exclusive: sun.dayWindow.end_utc_exclusive,
      start_local: sun.dayWindow.start_local,
      end_local_exclusive:
        sun.dayWindow.end_local_exclusive,
      duration_hours: sun.dayWindow.duration_hours
    },
    sunrise: sun.sunrise,
    sunset: sun.sunset,
    sunset_availability_reason: sun.sunset
      ? null
      : "no_sunset_within_local_civil_day",
    midday_solar_altitude: sun.midday_solar_altitude,
    panchang_day_interval: {
      start_utc: sun.sunrise.utc,
      start_local: sun.sunrise.local,
      end_utc: nextSunrise?.sunrise_utc ?? null,
      end_local: nextSunrise?.sunrise_local ?? null,
      duration_hours:
        nextSunriseMs !== null
          ? roundNumber(
              (nextSunriseMs - sunriseMs) / 3600000,
              6
            )
          : null,
      next_sunrise_available: nextSunrise !== null
    },
    vara: varaForDate(resolved.civil_date),
    paksha:
      tithiIndex <= 15
        ? "Shukla Paksha"
        : "Krishna Paksha",
    elements,
    astronomical_state_at_sunrise: current.state,
    neighboring_sunrises: {
      previous: previousSunrise,
      next: nextSunrise
    },
    trace: {
      ag74k_resolver_trace: resolved.trace,
      ag74l_engine_profile_id: AG74L_ENGINE_PROFILE_ID,
      ag74l_engine_package_version:
        AG74L_ENGINE_PACKAGE_VERSION,
      ag74m_orchestrator_version:
        AG74M_ORCHESTRATOR_VERSION,
      sunrise_profile_id: AG74M_SUNRISE_PROFILE_ID,
      local_civil_day_timezone:
        resolved.location.timezone,
      observer_elevation_m: elevation.elevation_m,
      elevation_source: elevation.source,
      transition_storage: ["UTC", "local_IANA_timezone"]
    },
    daily_panchang_classification_performed: true,
    persistence_performed: false,
    geocoding_performed: false,
    public_output_allowed: false,
    festival_generation_executed: false,
    annual_calendar_generation_executed: false,
    external_api_used: false,
    backend_service_deployed: false,
    supabase_activation_performed: false
  };
}
