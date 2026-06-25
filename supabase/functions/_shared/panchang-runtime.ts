import {
  Body,
  DeltaT_EspenakMeeus,
  EclipticGeoMoon,
  MakeTime,
  Observer,
  SearchRiseSet,
  SetDeltaTFunction,
  SunPosition
} from "astronomy-engine";

SetDeltaTFunction(DeltaT_EspenakMeeus);

const DAY_MS = 86400000;
const HALF_SECOND_MS = 500;
const BACKWARD_STEP_MS = 30 * 60 * 1000;
const BACKWARD_LIMIT_MS = 4 * DAY_MS;
const TROPICAL_YEAR_DAYS = 365.242189;
const LAHIRI_J2000_ANCHOR_DEGREES = 23.85675;
const LAHIRI_RATE_DEGREES_PER_TROPICAL_YEAR = 0.013969;

const tithiNames = [
  "Shukla Pratipada","Shukla Dwitiya","Shukla Tritiya","Shukla Chaturthi",
  "Shukla Panchami","Shukla Shashthi","Shukla Saptami","Shukla Ashtami",
  "Shukla Navami","Shukla Dashami","Shukla Ekadashi","Shukla Dwadashi",
  "Shukla Trayodashi","Shukla Chaturdashi","Purnima","Krishna Pratipada",
  "Krishna Dwitiya","Krishna Tritiya","Krishna Chaturthi","Krishna Panchami",
  "Krishna Shashthi","Krishna Saptami","Krishna Ashtami","Krishna Navami",
  "Krishna Dashami","Krishna Ekadashi","Krishna Dwadashi","Krishna Trayodashi",
  "Krishna Chaturdashi","Amavasya"
];

const nakshatraNames = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu",
  "Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta",
  "Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha",
  "Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada",
  "Uttara Bhadrapada","Revati"
];

const yogaNames = [
  "Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma",
  "Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra",
  "Siddhi","Vyatipata","Variyana","Parigha","Shiva","Siddha","Sadhya","Shubha",
  "Shukla","Brahma","Indra","Vaidhriti"
];

const varaNames = [
  { index: 1, english: "Sunday", sanskrit: "Ravivara" },
  { index: 2, english: "Monday", sanskrit: "Somavara" },
  { index: 3, english: "Tuesday", sanskrit: "Mangalavara" },
  { index: 4, english: "Wednesday", sanskrit: "Budhavara" },
  { index: 5, english: "Thursday", sanskrit: "Guruvara" },
  { index: 6, english: "Friday", sanskrit: "Shukravara" },
  { index: 7, english: "Saturday", sanskrit: "Shanivara" }
];

function karanaName(index: number): string {
  if (index === 1) return "Kimstughna";
  if (index >= 58) return ["Shakuni", "Chatushpada", "Naga"][index - 58];
  return ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"][
    (index - 2) % 7
  ];
}

type PrimitiveState = {
  sunTropical: number;
  moonTropical: number;
  sunSidereal: number;
  moonSidereal: number;
  elongation: number;
  yoga: number;
  ayanamsha: number;
};

type Definition = {
  field: keyof Pick<PrimitiveState, "elongation" | "moonSidereal" | "yoga">;
  kind: "elongation" | "moonSidereal" | "yoga";
  segment: number;
  count: number;
  name: (index: number) => string;
};

const definitions: Record<string, Definition> = {
  tithi: { field: "elongation", kind: "elongation", segment: 12, count: 30, name: (i) => tithiNames[i - 1] },
  nakshatra: { field: "moonSidereal", kind: "moonSidereal", segment: 360 / 27, count: 27, name: (i) => nakshatraNames[i - 1] },
  yoga: { field: "yoga", kind: "yoga", segment: 360 / 27, count: 27, name: (i) => yogaNames[i - 1] },
  karana: { field: "elongation", kind: "elongation", segment: 6, count: 60, name: karanaName }
};

function pad(value: number, width = 2): string {
  return String(value).padStart(width, "0");
}

function round(value: number, digits = 6): number {
  return Number(value.toFixed(digits));
}

function normalize(value: number): number {
  return ((value % 360) + 360) % 360;
}

function signedDifference(value: number, target: number): number {
  return ((normalize(value) - normalize(target) + 540) % 360) - 180;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatter(timezone: string): Intl.DateTimeFormat {
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
  return formatterCache.get(timezone)!;
}

function zonedParts(ms: number, timezone: string) {
  const values: Record<string, string> = {};
  for (const part of formatter(timezone).formatToParts(new Date(ms))) {
    if (part.type !== "literal") values[part.type] = part.value;
  }
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second)
  };
}

function localDateKeyAt(ms: number, timezone: string): string {
  const p = zonedParts(ms, timezone);
  return `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}`;
}

function timezoneOffsetMinutesAt(ms: number, timezone: string): number {
  const p = zonedParts(ms, timezone);
  const localAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((localAsUtc - Math.floor(ms / 1000) * 1000) / 60000);
}

function formatZonedIso(ms: number, timezone: string): string {
  const p = zonedParts(ms, timezone);
  const offset = timezoneOffsetMinutesAt(ms, timezone);
  const sign = offset >= 0 ? "+" : "-";
  const absolute = Math.abs(offset);
  return (
    `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}T` +
    `${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}` +
    `${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`
  );
}

function shiftDate(dateKey: string, amount: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount, 12));
  return date.toISOString().slice(0, 10);
}

function firstUtcAtOrAfterLocalDate(dateKey: string, timezone: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  const approximate = Date.UTC(year, month - 1, day, 12);
  let lower = approximate - 72 * 3600000;
  let upper = approximate + 72 * 3600000;
  while (localDateKeyAt(lower, timezone) >= dateKey) lower -= DAY_MS;
  while (localDateKeyAt(upper, timezone) < dateKey) upper += DAY_MS;
  while (upper - lower > 1) {
    const mid = Math.floor((lower + upper) / 2);
    if (localDateKeyAt(mid, timezone) < dateKey) lower = mid;
    else upper = mid;
  }
  return upper;
}

function civilWindow(dateKey: string, timezone: string) {
  const startMs = firstUtcAtOrAfterLocalDate(dateKey, timezone);
  if (localDateKeyAt(startMs, timezone) !== dateKey) {
    return { available: false as const, reason: "nonexistent_local_civil_date" };
  }
  const endMs = firstUtcAtOrAfterLocalDate(shiftDate(dateKey, 1), timezone);
  if (!(endMs > startMs)) {
    return { available: false as const, reason: "invalid_local_civil_day_window" };
  }
  return {
    available: true as const,
    startMs,
    endMs,
    start_utc: new Date(startMs).toISOString(),
    end_utc_exclusive: new Date(endMs).toISOString(),
    start_local: formatZonedIso(startMs, timezone),
    end_local_exclusive: formatZonedIso(endMs, timezone),
    durationHours: round((endMs - startMs) / 3600000, 6)
  };
}

function primitiveState(ms: number): PrimitiveState {
  const time = MakeTime(new Date(ms));
  const sun = SunPosition(time);
  const moon = EclipticGeoMoon(time);
  const ayanamsha = normalize(
    LAHIRI_J2000_ANCHOR_DEGREES +
      LAHIRI_RATE_DEGREES_PER_TROPICAL_YEAR * (time.tt / TROPICAL_YEAR_DAYS)
  );
  const sunTropical = normalize(sun.elon);
  const moonTropical = normalize(moon.lon);
  const sunSidereal = normalize(sunTropical - ayanamsha);
  const moonSidereal = normalize(moonTropical - ayanamsha);
  return {
    sunTropical,
    moonTropical,
    sunSidereal,
    moonSidereal,
    elongation: normalize(moonTropical - sunTropical),
    yoga: normalize(moonSidereal + sunSidereal),
    ayanamsha
  };
}

function classify(ms: number) {
  const raw = primitiveState(ms);
  const elements: Record<string, { index: number; name: string; angle: number }> = {};
  for (const [type, definition] of Object.entries(definitions)) {
    const index = Math.floor(raw[definition.field] / definition.segment) + 1;
    elements[type] = {
      index,
      name: definition.name(index),
      angle: raw[definition.field]
    };
  }
  return { raw, elements };
}

function angleFor(kind: Definition["kind"], ms: number): number {
  const raw = primitiveState(ms);
  if (kind === "elongation") return raw.elongation;
  if (kind === "moonSidereal") return raw.moonSidereal;
  return raw.yoga;
}

function unwrapNear(previous: number, raw: number): number {
  let value = normalize(raw);
  while (value - previous > 180) value -= 360;
  while (value - previous < -180) value += 360;
  return value;
}

function nextBoundary(type: string, startMs: number, timezone: string) {
  const definition = definitions[type];
  const current = classify(startMs).elements[type].index;
  const target = normalize(current * definition.segment);
  let lowerMs = startMs;
  let lowerValue = angleFor(definition.kind, lowerMs);
  let targetContinuous = target;
  while (targetContinuous <= lowerValue + 1e-10) targetContinuous += 360;
  let upperMs: number | null = null;
  const endMs = startMs + 5 * DAY_MS;
  for (let probe = startMs + 3600000; probe <= endMs; probe += 3600000) {
    const value = unwrapNear(lowerValue, angleFor(definition.kind, probe));
    if (value >= targetContinuous) {
      upperMs = probe;
      break;
    }
    lowerMs = probe;
    lowerValue = value;
  }
  if (upperMs === null) throw new Error(`Next ${type} transition was not found.`);
  let loops = 0;
  while (upperMs - lowerMs > HALF_SECOND_MS && loops < 100) {
    loops += 1;
    const mid = Math.floor((lowerMs + upperMs) / 2);
    const midValue = unwrapNear(lowerValue, angleFor(definition.kind, mid));
    if (midValue < targetContinuous) {
      lowerMs = mid;
      lowerValue = midValue;
    } else {
      upperMs = mid;
    }
  }
  return {
    utc: new Date(upperMs).toISOString(),
    local: formatZonedIso(upperMs, timezone),
    fromIndex: current,
    toIndex: (current % definition.count) + 1,
    residual: Math.abs(signedDifference(angleFor(definition.kind, upperMs), target))
  };
}

function previousBoundary(type: string, startMs: number, timezone: string) {
  const current = classify(startMs).elements[type].index;
  let upper = startMs;
  let lower: number | null = null;
  for (
    let probe = startMs - BACKWARD_STEP_MS;
    probe >= startMs - BACKWARD_LIMIT_MS;
    probe -= BACKWARD_STEP_MS
  ) {
    if (classify(probe).elements[type].index !== current) {
      lower = probe;
      break;
    }
    upper = probe;
  }
  if (lower === null) throw new Error(`Previous ${type} transition was not found.`);
  while (upper - lower > HALF_SECOND_MS) {
    const mid = Math.floor((lower + upper) / 2);
    if (classify(mid).elements[type].index === current) upper = mid;
    else lower = mid;
  }
  const fromIndex = classify(lower).elements[type].index;
  return {
    utc: new Date(upper).toISOString(),
    local: formatZonedIso(upper, timezone),
    fromIndex,
    toIndex: current
  };
}

function sunEvent(
  windowInfo: Extract<ReturnType<typeof civilWindow>, { available: true }>,
  observer: Observer,
  timezone: string,
  direction: 1 | -1
) {
  const result = SearchRiseSet(
    Body.Sun,
    observer,
    direction,
    new Date(windowInfo.startMs - 1000),
    (windowInfo.endMs - windowInfo.startMs + 2000) / DAY_MS,
    0
  );
  if (!result) return null;
  const ms = result.date.getTime();
  if (ms < windowInfo.startMs || ms >= windowInfo.endMs) return null;
  return {
    utc: result.date.toISOString(),
    local: formatZonedIso(ms, timezone)
  };
}

export type RuntimeRequest = {
  civil_date: string;
  timezone: string;
  latitude: number;
  longitude: number;
};

export function calculatePanchangDay(request: RuntimeRequest) {
  const windowInfo = civilWindow(request.civil_date, request.timezone);
  if (!windowInfo.available) {
    return { available: false, reason: windowInfo.reason };
  }

  const observer = new Observer(request.latitude, request.longitude, 0);
  const sunrise = sunEvent(windowInfo, observer, request.timezone, 1);
  const sunset = sunEvent(windowInfo, observer, request.timezone, -1);
  if (!sunrise) {
    return {
      available: false,
      reason: "no_sunrise_within_selected_local_civil_date",
      sunset
    };
  }

  const sunriseMs = Date.parse(sunrise.utc);
  const current = classify(sunriseMs);
  const transitions: Record<string, unknown> = {};
  for (const type of Object.keys(definitions)) {
    transitions[type] = {
      previous: previousBoundary(type, sunriseMs, request.timezone),
      next: nextBoundary(type, sunriseMs, request.timezone)
    };
  }
  const [year, month, day] = request.civil_date.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return {
    available: true,
    engine_profile_id: "drishvara_astronomical_engine_v1",
    engine_package: "astronomy-engine",
    engine_package_version: "2.1.19",
    calculation_profile: "Modern Drik / true ecliptic of date",
    ayanamsha_profile: "drishvara_lahiri_linear_tt_v1",
    sunrise,
    sunset,
    vara: {
      ...varaNames[weekday],
      basis: "sunrise_anchored_local_civil_date"
    },
    paksha:
      current.elements.tithi.index <= 15
        ? "Shukla Paksha"
        : "Krishna Paksha",
    elements: current.elements,
    transitions,
    window: {
      civil_date: request.civil_date,
      timezone: request.timezone,
      start_utc: windowInfo.start_utc,
      end_utc_exclusive: windowInfo.end_utc_exclusive,
      start_local: windowInfo.start_local,
      end_local_exclusive: windowInfo.end_local_exclusive,
      duration_hours: windowInfo.durationHours
    },
    astronomical_state_at_sunrise: current.raw,
    persistence_performed: false,
    external_api_used: false
  };
}
