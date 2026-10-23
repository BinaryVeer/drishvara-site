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
import {
  assignAg74nLunarContextAtInstant, buildAmantaMonthIntervals, generateSolarIngressSequence
} from "./ag74n-panchang-calendar-engine.mjs";
import { loadAg74kResolverContext, resolveAg74kPanchangInput } from "./ag74k-panchang-input-resolver.mjs";

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

export const AG76_R3_MAX_DAYS = 62;

function r3Array(value, label, limit = 256) {
  ag76Require(Array.isArray(value) && Object.getPrototypeOf(value) === Array.prototype &&
    value.length <= limit && Object.keys(value).length === value.length,
  "invalid_array", label + " requires a bounded, dense array.");
  for (const key of Reflect.ownKeys(value)) {
    const property = Object.getOwnPropertyDescriptor(value, key);
    ag76Require(key === "length" || typeof key === "string" && /^(0|[1-9][0-9]*)$/.test(key) &&
      Number(key) < value.length && property && "value" in property,
    "invalid_data", label + " requires data entries only.");
  }
  return value;
}

function fraction(value) {
  r3Array(value, "fraction", 2);
  ag76Require(value.length === 2 && value.every(Number.isInteger) && value[0] >= 0 &&
    value[1] > 0 && value[1] <= 10000 && value[0] <= value[1],
  "invalid_daypart_fraction", "A fraction must lie within zero and one.");
  return value[0] / value[1];
}

export function validateAg76DaypartDefinition(definition) {
  ag76Object(definition, ["definition_id", "definition_version", "daypart", "model",
    "start_fraction", "end_fraction", "start_seconds", "end_seconds",
    "source_evidence_refs", "review_status"], "daypart definition");
  ag76Id(definition.definition_id, "definition_id");
  ag76Require(typeof definition.definition_version === "string" &&
    /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/.test(definition.definition_version),
  "invalid_definition_version", "A definition requires a numeric semantic version.");
  const models = { daytime: "sunrise_to_sunset", night: "sunset_to_next_sunrise",
    purvahna: "daylight_fraction", madhyahna: "daylight_fraction", aparahna: "daylight_fraction",
    pradosha: "sunset_offsets", nishita: "night_fraction" };
  ag76Require(Object.hasOwn(models, definition.daypart) &&
    models[definition.daypart] === definition.model,
  "unsupported_daypart_definition", "No definition is substituted for an unsupported daypart/model.");
  ag76Require(["draft", "source_review_pending", "rule_review_pending"].includes(definition.review_status),
    "definition_approval_not_supported", "R3 accepts research definitions, never self-approved definitions.");
  const refs = r3Array(definition.source_evidence_refs, "definition evidence");
  for (const ref of refs) ag76Text(ref, "definition evidence reference");
  ag76Require(new Set(refs).size === refs.length, "duplicate_evidence_reference", "Duplicate definition evidence.");
  const fractional = ["daylight_fraction", "night_fraction"].includes(definition.model);
  const offsets = definition.model === "sunset_offsets";
  for (const key of ["start_fraction", "end_fraction", "start_seconds", "end_seconds"]) {
    ag76Require(!Object.hasOwn(definition, key) ||
      (fractional ? key.endsWith("fraction") : offsets && key.endsWith("seconds")),
    "unsupported_definition_constraint", "A definition parameter does not apply to its model.");
  }
  if (fractional) {
    const a = fraction(definition.start_fraction), b = fraction(definition.end_fraction);
    ag76Require(a < b, "invalid_daypart_fraction", "The end fraction must follow the start.");
    if (definition.daypart === "purvahna") ag76Require(a === 0,
      "invalid_daypart_fraction", "A supplied Purvahna definition must start at sunrise.");
    if (definition.daypart === "madhyahna") ag76Require(a === 2 / 5 && b === 3 / 5,
      "unsupported_daypart_definition", "Madhyahna requires the explicit middle fifth of daylight.");
    if (definition.daypart === "aparahna") ag76Require(a === 3 / 5 && b === 4 / 5,
      "unsupported_daypart_definition", "Aparahna requires the explicit fourth fifth of daylight.");
    if (definition.daypart === "nishita") ag76Require(a < 0.5 && b > 0.5 && Math.abs(a + b - 1) < 1e-12,
      "unsupported_daypart_definition", "The supplied night-relative Nishita must straddle the night midpoint symmetrically.");
  }
  if (offsets) ag76Require([definition.start_seconds, definition.end_seconds].every(value =>
    typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= 21600) &&
    definition.start_seconds < definition.end_seconds,
  "invalid_daypart_offsets", "Sunset-relative offsets require ordered bounds within six hours.");
  return definition;
}

export function calculateAg76Daypart(definition, day) {
  try {
    validateAg76DaypartDefinition(definition);
    ag76Object(day.location, ["resolution_type", "canonical_location_id", "display_label", "country",
      "region", "latitude", "longitude", "timezone", "coordinate_precision", "source_record_path"], "daypart location");
    ag76Require(Number.isFinite(day.location.latitude) && Math.abs(day.location.latitude) <= 90 &&
      Number.isFinite(day.location.longitude) && Math.abs(day.location.longitude) <= 180 &&
      day.location.timezone === day.timezone, "invalid_daypart_location",
    "A daypart requires explicit coordinates and matching IANA timezone.");
    const derived = !["sunrise_to_sunset", "sunset_to_next_sunrise"].includes(definition.model);
    const base = { definition: structuredClone(definition), location: day.location,
      timezone: ag76Timezone(day.timezone), review_status: definition.review_status,
      traditional_approval: false, public_output_allowed: false, runtime_activation: false };
    if (derived && definition.source_evidence_refs.length === 0) return {
      ...base, status: "pending_definition_evidence", interval: null,
      required_inputs: [], reason: "missing_definition_evidence" };
    const required = definition.model === "sunrise_to_sunset" || definition.model === "daylight_fraction" ?
      ["sunrise", "sunset"] : ["sunrise", "sunset", "next_sunrise"];
    const events = { sunrise: day.sunrise?.utc, sunset: day.sunset?.utc,
      next_sunrise: day.neighboring_sunrises?.next?.sunrise_utc };
    if (required.some(key => !events[key])) return { ...base, status: "daypart_unavailable",
      interval: null, required_inputs: required, reason: "missing_solar_event" };
    const rise = ag76Instant(events.sunrise), set = ag76Instant(events.sunset);
    const next = events.next_sunrise ? ag76Instant(events.next_sunrise) : null;
    ag76Require(rise < set && (next === null || set < next), "invalid_solar_event_order",
      "Sunrise, sunset and next sunrise must be chronological.");
    let start = rise, end = set;
    if (definition.model === "sunset_to_next_sunrise") { start = set; end = next; }
    if (definition.model.endsWith("fraction")) {
      const origin = definition.model === "daylight_fraction" ? rise : set;
      const duration = definition.model === "daylight_fraction" ? set - rise : next - set;
      start = Math.round(origin + fraction(definition.start_fraction) * duration);
      end = Math.round(origin + fraction(definition.end_fraction) * duration);
    }
    if (definition.model === "sunset_offsets") {
      start = Math.round(set + definition.start_seconds * 1000);
      end = Math.round(set + definition.end_seconds * 1000);
      if (start < rise || end > next) return { ...base, status: "daypart_unavailable",
        interval: null, required_inputs: required, reason: "definition_outside_sunrise_day" };
    }
    const interval = ag76Unwrap(normalizeAg76Interval({ start_utc: new Date(start).toISOString(),
      end_utc: new Date(end).toISOString() }, "definition_scoped_daypart", day.timezone));
    return { ...base, status: "daypart_available_internal_only", interval, required_inputs: required,
      numerical_diagnostics: { endpoint_rounding_ms: 0.5, solar_events_provider: "AG74M",
        input_utc: Object.fromEntries(required.map(key => [key, events[key]])),
        precision_is_not_independent_accuracy: true } };
  } catch (error) { return ag76Failure(error); }
}

function completeTithiCoverage(startUtc, endUtc, anchor) {
  const seed = anchor.elements.tithi.previous_transition;
  const seedIndex = seed.to_index;
  ag76Require(Number.isInteger(seedIndex) && seedIndex >= 1 && seedIndex <= 30,
    "invalid_tithi_anchor", "A provider-classified preceding transition is required.");
  const boundary = (target, start, maxDays) => {
    let event;
    try {
      event = findNextAngularBoundary({ kind: "moon_sun_elongation", target_degrees: target,
        start_utc: start, max_days: maxDays, step_hours: 3, tolerance_seconds: 0.5 });
    } catch {
      throw new Ag76ContractError("incomplete_condition_intervals", "AG74L could not provide a required boundary.");
    }
    return { utc: event.event_utc,
      lower_utc: new Date(Date.parse(event.event_utc) - event.final_bracket_seconds * 1000).toISOString(),
      final_bracket_seconds: event.final_bracket_seconds, target_degrees: event.target_degrees,
      angle_residual_degrees: event.angle_residual_degrees };
  };
  let left = boundary((seedIndex - 1) * 12,
    new Date(ag76Instant(seed.utc) - 86400000).toISOString(), 3);
  ag76Require(ag76Instant(left.utc) <= ag76Instant(startUtc), "incomplete_condition_intervals",
    "The preceding boundary does not cover the requested start.");
  const intervals = [];
  let index = seedIndex;
  for (let count = 0; count < (AG76_R3_MAX_DAYS + 6) * 2; count++) {
    const right = boundary(index * 12 % 360, left.utc, 3);
    ag76Require(ag76Instant(right.utc) > ag76Instant(left.utc), "invalid_boundary_progression",
      "Tithi boundaries must advance.");
    const midpoint = new Date((ag76Instant(left.utc) + ag76Instant(right.utc)) / 2).toISOString();
    ag76Require(Math.floor(astronomicalPrimitiveState(midpoint).moon_minus_sun_elongation / 12) + 1 === index,
      "invalid_tithi_progression", "The provider interval does not match its Tithi index.");
    intervals.push({ index, interval: ag76Unwrap(normalizeAg76Interval({ start_utc: left.utc,
      end_utc: right.utc }, "astronomical_condition_window")), start_boundary: left, end_boundary: right });
    if (ag76Instant(right.utc) >= ag76Instant(endUtc)) return {
      status: "complete_provider_tithi_coverage", start_utc: startUtc, end_utc: endUtc,
      intervals, provider: "AG74L", tolerance_seconds: 0.5,
      public_output_allowed: false, runtime_activation: false };
    left = right;
    index = index % 30 + 1;
  }
  throw new Ag76ContractError("resource_limit", "Tithi coverage exceeded the bounded search budget.");
}

export function buildAg76AstronomyRangeContext(request, context = loadAg74kResolverContext()) {
  try {
    ag76Object(request, ["location_input", "start_civil_date", "end_civil_date_exclusive",
      "daypart_definitions"], "R3 astronomy request");
    ag76Object(request.location_input, ["mode", "latitude", "longitude", "timezone",
      "optional_place_label", "canonical_location_id", "alias", "observer_elevation_m",
      "elevation_approval_status", "elevation_source"], "R3 location input");
    const first = ag76DateKey(request.start_civil_date), end = ag76DateKey(request.end_civil_date_exclusive);
    const count = (Date.parse(end) - Date.parse(first)) / 86400000;
    ag76Require(count > 0 && count <= AG76_R3_MAX_DAYS, "resource_limit",
      "R3 requests require one through 62 local dates.");
    const definitions = r3Array(request.daypart_definitions ?? [], "daypart definitions", 16)
      .map(validateAg76DaypartDefinition).sort((a, b) =>
        a.definition_id.localeCompare(b.definition_id) || a.definition_version.localeCompare(b.definition_version));
    const definitionKey = d => d.definition_id + "@" + d.definition_version;
    ag76Require(new Set(definitions.map(definitionKey)).size === definitions.length,
      "duplicate_daypart_definition", "Definition identity/version pairs must be unique.");
    const resolved = resolveAg74kPanchangInput({ ...request.location_input, civil_date: first }, context);
    ag76Require(resolved.resolved === true, "location_resolution_failed", "AG74K could not resolve the request.",
      { source_status: resolved.status });
    const days = [];
    // The halo closes adjacent-day selection; it is not an implicit date-selection fallback.
    for (let date = addCivilDays(first, -1); date <= end; date = addCivilDays(date, 1)) {
      const day = ag76Unwrap(buildAg76AstronomyDayContext({ ...request.location_input, civil_date: date }, context));
      ag76Require(day.dayparts.panchang_day && day.neighboring_sunrises.previous &&
        day.neighboring_sunrises.next, "insufficient_neighbor_evidence", "R3 requires the adjacent sunrise halo.");
      days.push({ ...day, in_requested_scope: date >= first && date < end,
        derived_dayparts: Object.fromEntries(definitions.map(def =>
          [definitionKey(def), ag76Unwrap(calculateAg76Daypart(def, day))])) });
    }
    const coverageStart = days[0].dayparts.civil_day.start_utc;
    const coverageEnd = days.at(-1).dayparts.panchang_day.end_utc;
    const anchor = orchestrateAg74mPanchangDay({ ...request.location_input,
      civil_date: addCivilDays(days[0].civil_date, -1) }, context);
    ag76Require(anchor.daily_panchang_classification_performed === true,
      "invalid_tithi_anchor", "A preceding AG74M day is required.");
    const coverage = completeTithiCoverage(coverageStart, coverageEnd, anchor);
    let monthModel;
    try { monthModel = buildAmantaMonthIntervals(coverageStart, coverageEnd); }
    catch { throw new Ag76ContractError("incomplete_calendar_segments", "AG74N could not cover the padded calendar range."); }
    const calendarSegments = coverage.intervals.map(item => {
      const instant = new Date((ag76Instant(item.interval.start_utc) + ag76Instant(item.interval.end_utc)) / 2).toISOString();
      const calendars = Object.fromEntries(["amanta", "purnimanta"].map(convention => {
        const lunar = assignAg74nLunarContextAtInstant(instant, convention, monthModel);
        ag76Require(lunar.tithi_index === item.index, "incomplete_calendar_segments",
          "Calendar context and condition index disagree.");
        return [convention, lunar];
      }));
      const calendarBoundaryUncertainty = monthModel.new_moons.filter(boundary =>
        [item.interval.start_utc, item.interval.end_utc].some(utc =>
          Math.abs(ag76Instant(utc) - ag76Instant(boundary.utc)) <= 1000)).map(boundary => ({
        utc: boundary.utc, lower_utc: new Date(ag76Instant(boundary.utc) - boundary.final_bracket_seconds * 1000).toISOString()
      }));
      return { ...item, calendars, calendar_boundary_uncertainty: calendarBoundaryUncertainty };
    });
    return { status: "ag76_r3_range_context_available", contract_version: "ag76.r3.v1",
      scope: { start_civil_date: first, end_civil_date_exclusive: end, halo_days: 1 },
      location: resolved.location, canonical_profile: resolved.canonical_profile,
      timezone: resolved.location.timezone, days, coverage, calendar_segments: calendarSegments,
      solar_ingresses: monthModel.solar_ingresses,
      public_output_allowed: false, runtime_activation: false };
  } catch (error) { return ag76Failure(error); }
}
