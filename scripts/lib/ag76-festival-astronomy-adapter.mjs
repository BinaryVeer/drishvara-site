import {
  astronomicalPrimitiveState,
  findNextAngularBoundary
} from "./ag74l-astronomical-engine.mjs";
import {
  addCivilDays,
  constructLocalCivilDayWindow,
  formatZonedIso,
  localDateKeyAt,
  orchestrateAg74mPanchangDay
} from "./ag74m-panchang-day-orchestrator.mjs";
import { generateSolarIngressSequence } from "./ag74n-panchang-calendar-engine.mjs";

export const AG76_ASTRONOMY_ADAPTER_VERSION = "1.0.0";

export class Ag76ContractError extends Error {
  constructor(code, message, detail = {}) {
    super(message);
    this.name = "Ag76ContractError";
    this.code = code;
    this.detail = detail;
  }
}

export function ag76Require(condition, code, message, detail = {}) {
  if (!condition) throw new Ag76ContractError(code, message, detail);
}

export function ag76Object(value, keys, label) {
  ag76Require(
    value !== null && typeof value === "object" && !Array.isArray(value) &&
      [Object.prototype, null].includes(Object.getPrototypeOf(value)),
    "invalid_object", label + " must be a plain object."
  );
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    ag76Require(typeof key === "string" && descriptor && "value" in descriptor,
      "invalid_data", label + " must contain data properties only.");
    ag76Require(keys.includes(key), "unsupported_rule_field",
      "Unsupported " + label + " field: " + key, { field: key });
  }
  return value;
}

export function ag76Text(value, label) {
  ag76Require(typeof value === "string" && value.length > 0 &&
    value === value.trim() && !/[\x00-\x1f\x7f]/.test(value),
  "invalid_string", label + " must be a non-empty, trimmed string.");
  return value;
}

export function ag76Id(value, label) {
  ag76Text(value, label);
  ag76Require(/^[a-z][a-z0-9_]{0,127}$/.test(value),
    "invalid_identity", label + " must be a stable lowercase identifier.");
  return value;
}

export function ag76DateKey(value) {
  ag76Text(value, "civil_date");
  ag76Require(/^\d{4}-\d{2}-\d{2}$/.test(value), "invalid_civil_date", "Invalid civil date.");
  const parsed = Date.parse(value + "T00:00:00.000Z");
  ag76Require(Number.isFinite(parsed) &&
    new Date(parsed).toISOString().slice(0, 10) === value,
  "invalid_civil_date", "Invalid civil date.");
  return value;
}

export function ag76Timezone(value) {
  ag76Text(value, "timezone");
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format(0);
  } catch {
    throw new Ag76ContractError("invalid_timezone", "Invalid IANA timezone.");
  }
  return value;
}

export function ag76Instant(value) {
  ag76Require(typeof value === "string", "invalid_timestamp",
    "Timestamp must be a string with Z or a numeric offset.");
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  ag76Require(match !== null, "invalid_timestamp",
    "Timestamp requires seconds and an explicit Z or numeric offset.");
  ag76DateKey(match[1]);
  const hours = Number(match[2]), minutes = Number(match[3]), seconds = Number(match[4]);
  const offset = match[6];
  ag76Require(hours < 24 && minutes < 60 && seconds < 60 &&
    (offset === "Z" || (Number(offset.slice(1, 3)) < 24 && Number(offset.slice(4)) < 60)),
  "invalid_timestamp", "Invalid clock time or UTC offset.");
  const ms = Date.parse(value);
  ag76Require(Number.isFinite(ms), "invalid_timestamp", "Timestamp is not finite.");
  return ms;
}

export function ag76Failure(error, extra = {}) {
  const known = error instanceof Ag76ContractError;
  return {
    ...extra,
    status: "ag76_failure_public_blocked",
    error_code: known ? error.code : "ag76_internal_error",
    error: {
      code: known ? error.code : "ag76_internal_error",
      message: known ? error.message : "AG76 could not evaluate the supplied data.",
      detail: known ? error.detail : {}
    },
    public_output_allowed: false,
    runtime_activation: false
  };
}

export function ag76Unwrap(value) {
  if (value && typeof value === "object" && value.status === "ag76_failure_public_blocked") {
    throw new Ag76ContractError(value.error_code, value.error.message, value.error.detail);
  }
  return value;
}

export function ag76NoActivation(value) {
  for (const key of ["public_output_allowed", "runtime_activation"]) {
    if (Object.hasOwn(value, key)) {
      ag76Require(value[key] === false, "activation_forbidden", key + " must be false.");
    }
  }
}

function optionalLocal(label, instantMs, timezone) {
  if (label === undefined || label === null) return;
  ag76Require(timezone !== null, "unverifiable_local_label",
    "A local label requires an explicit resolved timezone.");
  const localMs = ag76Instant(label);
  const zoned = formatZonedIso(instantMs, timezone);
  const clockAndOffset = label.replace(/\.\d{1,3}(?=Z|[+-])/, "").replace(/Z$/, "+00:00");
  ag76Require(clockAndOffset === zoned &&
    (label.includes(".") ? localMs === instantMs :
      Math.floor(localMs / 1000) === Math.floor(instantMs / 1000)),
  "local_label_mismatch", "Local label does not match its UTC instant and timezone.");
}

export function validateAg76LocalInstant(instant, label, timezone) {
  try {
    const ms = ag76Instant(instant);
    ag76Timezone(timezone);
    optionalLocal(label, ms, timezone);
    return { utc: new Date(ms).toISOString(), local: formatZonedIso(ms, timezone),
      public_output_allowed: false, runtime_activation: false };
  } catch (error) { return ag76Failure(error); }
}

export function ag76LocalCivilDay(civilDate, timezone) {
  try {
    ag76DateKey(civilDate);
    ag76Timezone(timezone);
    const result = constructLocalCivilDayWindow(civilDate, timezone);
    ag76Require(result.available === true, "civil_day_unavailable", "Local civil day is unavailable.");
    return { ...result, public_output_allowed: false, runtime_activation: false };
  } catch (error) { return ag76Failure(error); }
}

function intervalValue(interval, label, timezone) {
  ag76Object(interval, ["start_utc", "end_utc", "end_utc_exclusive", "start", "end",
    "start_local", "end_local", "end_local_exclusive", "timezone", "duration_hours",
    "semantic_layer", "public_output_allowed", "runtime_activation"], label);
  ag76NoActivation(interval);
  const starts = ["start_utc", "start"].filter(key => Object.hasOwn(interval, key));
  const ends = ["end_utc", "end_utc_exclusive", "end"].filter(key => Object.hasOwn(interval, key));
  ag76Require(starts.length === 1 && ends.length === 1, "invalid_interval",
    "An interval requires one unambiguous start and one end.");
  const start = ag76Instant(interval[starts[0]]), end = ag76Instant(interval[ends[0]]);
  ag76Require(start < end, "invalid_interval", "Interval end must follow start.");
  const zone = timezone ?? interval.timezone ?? null;
  if (zone !== null) ag76Timezone(zone);
  if (timezone && interval.timezone) {
    ag76Require(timezone === interval.timezone, "timezone_mismatch", "Interval timezone mismatch.");
  }
  ag76Require(!(Object.hasOwn(interval, "end_local") && Object.hasOwn(interval, "end_local_exclusive")),
    "invalid_interval", "Ambiguous local interval end.");
  optionalLocal(interval.start_local, start, zone);
  optionalLocal(interval.end_local ?? interval.end_local_exclusive, end, zone);
  const duration = (end - start) / 3600000;
  if (interval.duration_hours !== undefined) {
    ag76Require(typeof interval.duration_hours === "number" &&
      Number.isFinite(interval.duration_hours) &&
      Math.abs(interval.duration_hours - duration) < 0.000002,
    "invalid_interval", "Declared duration contradicts interval boundaries.");
  }
  if (interval.semantic_layer !== undefined) ag76Text(interval.semantic_layer, "semantic_layer");
  return {
    start_utc: new Date(start).toISOString(), end_utc: new Date(end).toISOString(),
    start_local: zone ? formatZonedIso(start, zone) : null,
    end_local: zone ? formatZonedIso(end, zone) : null,
    timezone: zone, duration_hours: Number(duration.toFixed(6)),
    semantic_layer: interval.semantic_layer ?? label,
    public_output_allowed: false, runtime_activation: false
  };
}

export function normalizeAg76Interval(interval, label = "interval", timezone = null) {
  try { return intervalValue(interval, label, timezone); }
  catch (error) { return ag76Failure(error); }
}

export function intersectAg76Intervals(left, right, label = "intersection") {
  try {
    const a = intervalValue(left, label + ".left", null);
    const b = intervalValue(right, label + ".right", null);
    const start = Math.max(ag76Instant(a.start_utc), ag76Instant(b.start_utc));
    const end = Math.min(ag76Instant(a.end_utc), ag76Instant(b.end_utc));
    if (start >= end) return null;
    return intervalValue({ start_utc: new Date(start).toISOString(),
      end_utc: new Date(end).toISOString(), semantic_layer: label }, label,
    a.timezone === b.timezone ? a.timezone : null);
  } catch (error) { return ag76Failure(error); }
}

export function ag76IntervalsOverlap(left, right) {
  try { return ag76Unwrap(intersectAg76Intervals(left, right)) !== null; }
  catch (error) { return ag76Failure(error); }
}

export function ag76IntervalContainsInstant(interval, instant) {
  try {
    const normalized = intervalValue(interval, "contains_interval", null);
    const ms = ag76Instant(instant);
    return ag76Instant(normalized.start_utc) <= ms && ms < ag76Instant(normalized.end_utc);
  } catch (error) { return ag76Failure(error); }
}

export function ag76PresenceInInterval(condition, container) {
  try {
    const intersection = ag76Unwrap(intersectAg76Intervals(condition, container));
    return { present: intersection !== null, intersection,
      public_output_allowed: false, runtime_activation: false };
  } catch (error) { return ag76Failure(error); }
}

export function buildAg76AstronomyDayContext(input, context) {
  try {
    ag76Object(input, ["mode", "civil_date", "latitude", "longitude", "timezone",
      "optional_place_label", "canonical_location_id", "alias", "observer_elevation_m",
      "elevation_approval_status", "elevation_source"], "AG74M input");
    ag76DateKey(input.civil_date);
    const result = orchestrateAg74mPanchangDay(input, context);
    ag76Require(result?.daily_panchang_classification_performed === true,
      "astronomy_day_unavailable", "AG74M did not provide a complete sunrise day.",
      { source_status: result?.status ?? null });
    const timezone = ag76Timezone(result.location.timezone);
    const normalize = (value, label) => ag76Unwrap(normalizeAg76Interval(value, label, timezone));
    const elements = {};
    for (const key of ["tithi", "nakshatra", "yoga", "karana"]) {
      const element = result.elements[key];
      elements[key] = {
        index: element.index, name: element.name, allocation_basis: "local_sunrise",
        condition_window: normalize({
          start_utc: element.previous_transition.utc, end_utc: element.next_transition.utc,
          start_local: element.previous_transition.local, end_local: element.next_transition.local
        }, key + "_condition_window"),
        sunrise_sequence: element.sunrise_sequence
      };
    }
    const dayparts = { civil_day: normalize({
      start_utc: result.civil_day_window.start_utc,
      end_utc: result.civil_day_window.end_utc_exclusive,
      start_local: result.civil_day_window.start_local,
      end_local: result.civil_day_window.end_local_exclusive
    }, "local_civil_day") };
    if (result.panchang_day_interval.end_utc) {
      dayparts.panchang_day = normalize({
        start_utc: result.panchang_day_interval.start_utc,
        end_utc: result.panchang_day_interval.end_utc,
        start_local: result.panchang_day_interval.start_local,
        end_local: result.panchang_day_interval.end_local
      }, "sunrise_to_next_sunrise");
    }
    if (result.sunset) dayparts.daytime = normalize({
      start_utc: result.sunrise.utc, end_utc: result.sunset.utc,
      start_local: result.sunrise.local, end_local: result.sunset.local
    }, "sunrise_to_sunset_daytime");
    return {
      status: "ag76_day_context_available", source_module: "AG74M",
      civil_date: result.civil_date, timezone, location: result.location,
      sunrise: { utc: result.sunrise.utc, local: result.sunrise.local },
      sunset: result.sunset ? { utc: result.sunset.utc, local: result.sunset.local } : null,
      paksha: result.paksha,
      elements, dayparts, neighboring_sunrises: result.neighboring_sunrises,
      condition_windows: {}, condition_windows_complete: {
        tithi: false, nakshatra: false, yoga: false, karana: false
      },
      capabilities: { complete_skipped_element_intervals: false, evening_window: false },
      source_trace: result.trace,
      public_output_allowed: false, runtime_activation: false,
      persistence_performed: false, external_api_used: false
    };
  } catch (error) { return ag76Failure(error); }
}

export function ag76AstronomicalPrimitive(input) {
  try {
    ag76Instant(input);
    return { ...astronomicalPrimitiveState(input),
      adapter_version: AG76_ASTRONOMY_ADAPTER_VERSION,
      public_output_allowed: false, runtime_activation: false };
  } catch (error) { return ag76Failure(error); }
}

export function ag76NextAngularBoundary(input) {
  try {
    ag76Object(input, ["kind", "target_degrees", "start_utc", "max_days",
      "step_hours", "tolerance_seconds"], "angular boundary");
    ag76Require(["moon_sun_elongation", "sidereal_moon_longitude",
      "sidereal_sun_longitude", "sidereal_yoga_sum"].includes(input.kind),
    "unsupported_angle_kind", "Unsupported AG74L angle kind.");
    ag76Instant(input.start_utc);
    for (const key of ["target_degrees", "max_days", "step_hours", "tolerance_seconds"]) {
      if (input[key] !== undefined) ag76Require(typeof input[key] === "number" &&
        Number.isFinite(input[key]), "invalid_boundary_input", key + " must be finite.");
    }
    ag76Require(Number.isFinite(input.target_degrees) &&
      (input.max_days === undefined || input.max_days > 0) &&
      (input.step_hours === undefined || input.step_hours > 0 && input.step_hours <= 24) &&
      (input.tolerance_seconds === undefined || input.tolerance_seconds > 0 && input.tolerance_seconds <= 60),
    "invalid_boundary_input", "Invalid angular boundary search limits.");
    return { ...findNextAngularBoundary(input),
      adapter_version: AG76_ASTRONOMY_ADAPTER_VERSION,
      public_output_allowed: false, runtime_activation: false };
  } catch (error) { return ag76Failure(error); }
}

export function ag76SolarIngressesForRange(input) {
  try {
    ag76Object(input, ["start_utc", "end_utc"], "solar ingress range");
    ag76Require(ag76Instant(input.start_utc) < ag76Instant(input.end_utc),
      "invalid_interval", "Solar ingress range must be positive.");
    return {
      events: generateSolarIngressSequence(input.start_utc, input.end_utc),
      adapter_version: AG76_ASTRONOMY_ADAPTER_VERSION,
      public_output_allowed: false, runtime_activation: false
    };
  } catch (error) { return ag76Failure(error); }
}

export { addCivilDays as ag76AddCivilDays, localDateKeyAt as ag76LocalDateKeyAt };
