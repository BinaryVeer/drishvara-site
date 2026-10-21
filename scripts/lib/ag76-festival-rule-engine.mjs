import {
  Ag76ContractError, ag76AddCivilDays, ag76Failure, ag76Id, ag76Instant,
  ag76IntervalContainsInstant, ag76LocalCivilDay, ag76LocalDateKeyAt, ag76NoActivation, ag76Object,
  ag76Require, ag76Text, ag76Timezone, ag76DateKey, ag76Unwrap,
  intersectAg76Intervals, normalizeAg76Interval, validateAg76LocalInstant
} from "./ag76-festival-astronomy-adapter.mjs";
import {
  ag76Array, evaluateAg76ApprovalGate, validateAg76GovernanceContract
} from "./ag76-festival-approval-gate.mjs";

export const AG76_FESTIVAL_RULE_ENGINE_VERSION = "1.0.0";
export { Ag76ContractError as Ag76RuleValidationError };

const ELEMENTS = { tithi: 30, nakshatra: 27, yoga: 27, karana: 60 };
const OPERATORS = ["element_at_sunrise", "element_occurs_between_sunrises",
  "element_overlaps_daypart", "solar_ingress_within_local_day", "parent_child_sequence"];
const PRECEDENCE = ["unique_only", "review_required_on_multiple",
  "allow_multiple_internal_candidates", "prefer_first_candidate", "prefer_last_candidate"];
const DAYPARTS = ["civil_day", "panchang_day", "daytime", "evening"];

function index(value, element) {
  ag76Require(Number.isInteger(value) && value >= 1 && value <= ELEMENTS[element],
    "invalid_element_index", "Invalid " + element + " index.");
}

function validateSequence(sequence, eventId) {
  ag76Object(sequence, ["role", "parent_event_id", "children", "event_sequence"], "sequence declaration");
  ag76Id(sequence.parent_event_id, "parent_event_id");
  if (sequence.role === "parent") {
    ag76Require(sequence.parent_event_id === eventId && sequence.event_sequence === undefined,
      "sequence_identity_mismatch", "A parent declaration must name its own event identity.");
    const children = ag76Array(sequence.children, "sequence children");
    ag76Require(children.length > 0, "empty_sequence", "A parent requires child declarations.");
    for (const child of children) {
      ag76Object(child, ["event_id", "event_sequence"], "child declaration");
      ag76Id(child.event_id, "child event_id");
      ag76Require(child.event_id !== eventId, "sequence_cycle", "A parent cannot be its own child.");
      ag76Require(Number.isInteger(child.event_sequence) && child.event_sequence > 0,
        "invalid_sequence_order", "Child order must be a positive integer.");
    }
    ag76Require(new Set(children.map(child => child.event_id)).size === children.length &&
      new Set(children.map(child => child.event_sequence)).size === children.length,
    "ambiguous_sequence", "Child identities and sequence positions must be unique.");
    const ordered = [...children].sort((a, b) => a.event_sequence - b.event_sequence);
    ag76Require(ordered.every((child, i) => child.event_sequence === i + 1),
      "invalid_sequence_order", "Sequence positions must be contiguous from one.");
  } else {
    ag76Require(sequence.role === "child" && sequence.children === undefined &&
      sequence.parent_event_id !== eventId && Number.isInteger(sequence.event_sequence) &&
      sequence.event_sequence > 0, "invalid_child_relationship", "Invalid child relationship.");
  }
}

function validateRule(rule) {
  validateAg76GovernanceContract(rule);
  ag76Object(rule.calendar_basis, ["type"], "calendar_basis");
  ag76Require(rule.calendar_basis.type === "astronomical", "unsupported_calendar_basis",
    "R1 evaluates astronomical conditions only; traditional calendar conventions require a later contract.");
  if (rule.exception_branches !== undefined) {
    ag76Require(ag76Array(rule.exception_branches, "exception_branches").length === 0,
      "unsupported_exception_branch", "Executable exception branches are not supported in R1.");
  }
  if (rule.parent_child_sequence !== undefined) validateSequence(rule.parent_child_sequence, rule.event_id);
  const selectors = ag76Array(rule.candidate_selectors, "candidate_selectors");
  ag76Require(selectors.length === 1, "unsupported_selector_combination",
    "R1 requires exactly one selector; implicit AND/OR combinations are unsupported.");
  const selector = selectors[0];
  ag76Object(selector, ["selector_id", "operator", "element", "target_indices", "paksha",
    "daypart", "required_overlap", "solar_condition", "child_event_ids"], "selector");
  ag76Id(selector.selector_id, "selector_id");
  ag76Require(OPERATORS.includes(selector.operator), "unsupported_operator",
    "Unsupported AG76 selector operator.", { operator: typeof selector.operator === "string" ? selector.operator : null });
  const applicable = {
    element_at_sunrise: ["element", "target_indices", "paksha"],
    element_occurs_between_sunrises: ["element", "target_indices", "paksha"],
    element_overlaps_daypart: ["element", "target_indices", "paksha", "daypart", "required_overlap"],
    solar_ingress_within_local_day: ["solar_condition"],
    parent_child_sequence: ["child_event_ids"]
  };
  for (const key of Object.keys(selector)) {
    ag76Require(["operator", "selector_id", ...applicable[selector.operator]].includes(key),
      "unsupported_selector_constraint", "Constraint is unsupported for this operator.", { field: key });
  }
  if (selector.operator.startsWith("element_")) {
    ag76Require(Object.hasOwn(ELEMENTS, selector.element), "unsupported_element", "Unsupported element.");
    const targets = ag76Array(selector.target_indices, "target_indices");
    ag76Require(targets.length > 0 && new Set(targets).size === targets.length,
      "invalid_target_indices", "Target indices must be non-empty and unique.");
    for (const target of targets) index(target, selector.element);
    if (selector.paksha !== undefined) {
      ag76Require(selector.element === "tithi", "unsupported_paksha_constraint",
        "R1 supports Paksha constraints only for Tithi conditions.");
      ag76Require(["Shukla Paksha", "Krishna Paksha"].includes(selector.paksha),
        "invalid_paksha", "Unknown Paksha.");
      ag76Require(targets.every(target => (target <= 15 ? "Shukla Paksha" : "Krishna Paksha") === selector.paksha),
        "inconsistent_paksha_constraint", "Target Tithi and Paksha disagree.");
    }
  }
  if (selector.operator === "element_overlaps_daypart") {
    ag76Require(DAYPARTS.includes(selector.daypart), "unsupported_daypart", "Unsupported daypart.");
    if (selector.required_overlap !== undefined) {
      ag76Object(selector.required_overlap, ["minimum_seconds"], "required_overlap");
      ag76Require(typeof selector.required_overlap.minimum_seconds === "number" &&
        Number.isFinite(selector.required_overlap.minimum_seconds) &&
        selector.required_overlap.minimum_seconds >= 0, "invalid_overlap_requirement",
      "Minimum overlap must be a finite, nonnegative number of seconds.");
    }
  }
  if (selector.operator === "solar_ingress_within_local_day") {
    ag76Object(selector.solar_condition, ["entered_sidereal_sign_index"], "solar_condition");
    ag76Require(Number.isInteger(selector.solar_condition.entered_sidereal_sign_index) &&
      selector.solar_condition.entered_sidereal_sign_index >= 0 &&
      selector.solar_condition.entered_sidereal_sign_index <= 11,
    "invalid_solar_condition", "Solar condition requires a zero-based sidereal sign index.");
  }
  if (selector.operator === "parent_child_sequence") {
    const sequence = rule.parent_child_sequence;
    ag76Require(sequence?.role === "parent", "missing_sequence_declaration",
      "A sequence selector requires an explicit parent declaration.");
    const ids = ag76Array(selector.child_event_ids, "child_event_ids");
    for (const id of ids) ag76Id(id, "child event_id");
    const expected = [...sequence.children].sort((a, b) => a.event_sequence - b.event_sequence)
      .map(child => child.event_id);
    ag76Require(JSON.stringify(ids) === JSON.stringify(expected), "sequence_order_mismatch",
      "Selector children must match the declared sequence order.");
  } else {
    ag76Require(rule.parent_child_sequence?.role !== "parent", "unsupported_sequence_selector",
      "A parent declaration requires a parent-child sequence selector.");
  }
  const precedence = rule.precedence_policy ?? "unique_only";
  ag76Require(PRECEDENCE.includes(precedence), "unsupported_precedence_policy",
    "Unsupported precedence policy.");
  return { event_id: rule.event_id, rule_id: rule.rule_id, rule_version: rule.rule_version,
    precedence_policy: precedence, selector };
}

export function validateAg76RuleDsl(rule) {
  try { return { ...validateRule(rule), public_output_allowed: false, runtime_activation: false }; }
  catch (error) { return ag76Failure(error); }
}

function normalized(interval, label, timezone) {
  return ag76Unwrap(normalizeAg76Interval(interval, label, timezone));
}

function contains(interval, instant) {
  return ag76Unwrap(ag76IntervalContainsInstant(interval, instant));
}

function eventInstant(event, label, timezone) {
  ag76Object(event, ["utc", "local"], label);
  const ms = ag76Instant(event.utc);
  if (event.local !== undefined && event.local !== null) {
    ag76Unwrap(validateAg76LocalInstant(event.utc, event.local, timezone));
  }
  return ms;
}

function neighbor(day, direction, element) {
  const value = day.neighboring_sunrises?.[direction];
  ag76Require(value !== null && value !== undefined, "incomplete_sunrise_boundaries",
    "Consecutive sunrise evidence is required.", { direction });
  ag76Object(value, ["civil_date", "sunrise_utc", "sunrise_local", "classification"], "neighbor sunrise");
  const expected = ag76AddCivilDays(day.civil_date, direction === "next" ? 1 : -1);
  ag76Require(value.civil_date === expected &&
    ag76LocalDateKeyAt(ag76Instant(value.sunrise_utc), day.timezone) === expected,
  "nonconsecutive_sunrise_boundaries", "Neighbor sunrise must belong to the adjacent local date.");
  ag76Require(value.classification && typeof value.classification === "object",
    "incomplete_sunrise_classification", "Neighbor element classification is required.");
  ag76Object(value.classification, Object.keys(ELEMENTS), "neighbor classification");
  const entry = value.classification[element];
  ag76Object(entry, ["index", "name", "angle_degrees"], "neighbor element");
  index(entry.index, element);
  if (entry.name !== undefined) ag76Text(entry.name, "neighbor element name");
  if (entry.angle_degrees !== undefined) ag76Require(typeof entry.angle_degrees === "number" &&
    Number.isFinite(entry.angle_degrees), "invalid_element_angle", "Invalid element angle.");
  eventInstant({ utc: value.sunrise_utc, local: value.sunrise_local ?? null }, "neighbor", day.timezone);
  return { ...value, index: entry.index };
}

function validateDay(day) {
  ag76Object(day, ["status", "source_module", "synthetic_fixture", "civil_date", "timezone",
    "location", "sunrise", "sunset", "paksha", "elements", "dayparts", "condition_windows", "solar_ingresses",
    "condition_windows_complete", "capabilities", "neighboring_sunrises", "source_trace",
    "public_output_allowed", "runtime_activation", "persistence_performed", "external_api_used"],
  "day context");
  ag76NoActivation(day);
  ag76Require(["ag76_day_context_available", "ag76_synthetic_test_day_context"].includes(day.status),
    "astronomy_day_unavailable", "Day context is unavailable.");
  if (day.status === "ag76_synthetic_test_day_context") {
    ag76Require(day.synthetic_fixture === true, "unlabelled_synthetic_fixture", "Synthetic context must be labelled.");
  }
  ag76DateKey(day.civil_date);
  ag76Timezone(day.timezone);
  ag76Object(day.dayparts, DAYPARTS, "dayparts");
  const dayparts = {};
  for (const [key, value] of Object.entries(day.dayparts)) {
    dayparts[key] = normalized(value, key, day.timezone);
  }
  ag76Require(dayparts.civil_day !== undefined, "missing_civil_day", "A local civil day is required.");
  const civil = ag76Unwrap(ag76LocalCivilDay(day.civil_date, day.timezone));
  ag76Require(ag76Instant(civil.start_utc) === ag76Instant(dayparts.civil_day.start_utc) &&
    ag76Instant(civil.end_utc_exclusive) === ag76Instant(dayparts.civil_day.end_utc),
  "civil_day_mismatch", "Civil-day bounds must match the resolved timezone's complete local day.");
  ag76Require(ag76LocalDateKeyAt(ag76Instant(dayparts.civil_day.start_utc), day.timezone) === day.civil_date &&
    ag76LocalDateKeyAt(ag76Instant(dayparts.civil_day.end_utc) - 1, day.timezone) === day.civil_date,
  "civil_day_mismatch", "Civil-day bounds must belong to the selected local date.");
  if (day.sunrise) {
    const sunriseMs = eventInstant(day.sunrise, "sunrise", day.timezone);
    ag76Require(ag76LocalDateKeyAt(sunriseMs, day.timezone) === day.civil_date,
      "sunrise_date_mismatch", "Sunrise belongs to another local date.");
  }
  if (day.sunset) eventInstant(day.sunset, "sunset", day.timezone);
  ag76Object(day.elements, Object.keys(ELEMENTS), "elements");
  for (const [element, value] of Object.entries(day.elements)) {
    ag76Object(value, ["index", "name", "condition_window", "sunrise_sequence", "allocation_basis"], "element");
    index(value.index, element);
    if (value.name !== undefined) ag76Text(value.name, "element name");
    if (value.allocation_basis !== undefined) ag76Require(
      ["local_sunrise", "synthetic_local_sunrise"].includes(value.allocation_basis),
      "unsupported_allocation_basis", "Unsupported element allocation.");
    if (value.condition_window) {
      const window = normalized(value.condition_window, element + "_window", day.timezone);
      ag76Require(day.sunrise && contains(window, day.sunrise.utc),
        "inconsistent_sunrise_condition", "The classified element must contain the sunrise instant.");
    }
    if (element === "tithi" && day.paksha !== undefined) ag76Require(
      day.paksha === (value.index <= 15 ? "Shukla Paksha" : "Krishna Paksha"),
      "inconsistent_paksha_data", "Sunrise Tithi and Paksha disagree.");
    const sequence = value.sunrise_sequence;
    if (sequence !== undefined) {
      ag76Object(sequence, ["previous_index", "current_index", "next_index",
        "repeated_from_previous", "repeated_into_next", "skipped_before_current_indices",
        "skipped_before_current_names", "skipped_after_current_indices",
        "skipped_after_current_names", "unavailable_neighbor_means_unknown"], "sunrise sequence");
      for (const [key, entry] of Object.entries(sequence)) {
        if (key.endsWith("_indices")) {
          for (const target of ag76Array(entry, key)) index(target, element);
        } else if (key.endsWith("_names")) {
          for (const name of ag76Array(entry, key)) ag76Text(name, key);
        } else if (key.endsWith("_index")) {
          if (entry !== null) index(entry, element);
        } else {
          ag76Require(entry === null || typeof entry === "boolean",
            "invalid_sunrise_metadata", "Sunrise flags must be boolean or unknown.");
        }
      }
      if (sequence.current_index !== undefined) ag76Require(sequence.current_index === value.index,
        "inconsistent_sunrise_metadata", "Current sunrise index contradicts classification.");
    }
  }
  ag76Object(day.condition_windows ?? {}, Object.keys(ELEMENTS), "condition_windows");
  ag76Object(day.condition_windows_complete ?? {}, Object.keys(ELEMENTS), "condition_windows_complete");
  for (const complete of Object.values(day.condition_windows_complete ?? {})) ag76Require(
    typeof complete === "boolean", "invalid_condition_coverage", "Condition coverage must be boolean.");
  if (day.neighboring_sunrises !== undefined) ag76Object(day.neighboring_sunrises,
    ["previous", "next"], "neighboring_sunrises");
  if (day.solar_ingresses !== undefined) ag76Array(day.solar_ingresses, "solar_ingresses");
  return { ...day, dayparts };
}

function windowsFor(day, selector) {
  const windows = [];
  for (const item of ag76Array(day.condition_windows?.[selector.element] ?? [], "condition intervals")) {
    ag76Object(item, ["index", "name", "interval"], "condition interval");
    index(item.index, selector.element);
    if (item.name !== undefined) ag76Text(item.name, "condition name");
    const interval = normalized(item.interval, selector.element + "_condition", day.timezone);
    if (selector.target_indices.includes(item.index)) windows.push({ index: item.index, interval });
  }
  const element = day.elements[selector.element];
  if (element && selector.target_indices.includes(element.index) && element.condition_window) {
    windows.push({ index: element.index,
      interval: normalized(element.condition_window, "sunrise_condition", day.timezone) });
  }
  const unique = new Map();
  for (const window of windows) {
    const key = [window.index, window.interval.start_utc, window.interval.end_utc].join(":");
    unique.set(key, window);
  }
  const result = [...unique.values()].sort((a, b) =>
    a.interval.start_utc.localeCompare(b.interval.start_utc) || a.index - b.index);
  for (let i = 1; i < result.length; i++) {
    const left = result[i - 1], right = result[i];
    ag76Require(!ag76Unwrap(intersectAg76Intervals(left.interval, right.interval)),
      "conflicting_condition_windows", "Condition intervals overlap inconsistently.");
  }
  return result;
}

function candidate(rule, selector, day, detail = {}) {
  return {
    candidate_id: ["ag76", rule.event_id, selector.selector_id, day?.civil_date ?? "sequence"].join("_"),
    event_id: rule.event_id, rule_id: rule.rule_id, rule_version: rule.rule_version,
    civil_date: day?.civil_date ?? null, selector_id: selector.selector_id,
    operator: selector.operator, astronomical_condition_window: null,
    astronomical_event: null, observance_window: null, ...detail,
    primary_public_window: null, ritual_windows: [],
    public_output_allowed: false, runtime_activation: false
  };
}

function uniquenessNeighborEvidence(day, direction, element, days) {
  const civilDate = ag76AddCivilDays(day.civil_date, direction === "next" ? 1 : -1);
  const record = day.neighboring_sunrises?.[direction];
  let utc = null, classification = null;
  if (record !== null && record !== undefined) {
    ag76Object(record, ["civil_date", "sunrise_utc", "sunrise_local", "classification"], "neighbor sunrise");
    if (record.civil_date !== undefined && record.civil_date !== null) {
      ag76Require(record.civil_date === civilDate, "nonconsecutive_sunrise_boundaries",
        "Neighbor sunrise must belong to the adjacent local date.");
    }
    if (record.sunrise_utc !== undefined && record.sunrise_utc !== null) {
      eventInstant({ utc: record.sunrise_utc, local: record.sunrise_local ?? null }, "neighbor", day.timezone);
      utc = record.sunrise_utc;
    }
    if (record.classification !== undefined && record.classification !== null) {
      ag76Object(record.classification, Object.keys(ELEMENTS), "neighbor classification");
      const entry = record.classification[element];
      if (entry !== undefined && entry !== null) {
        ag76Object(entry, ["index", "name", "angle_degrees"], "neighbor element");
        if (entry.index !== undefined && entry.index !== null) {
          index(entry.index, element);
          classification = entry.index;
        }
        if (entry.name !== undefined) ag76Text(entry.name, "neighbor element name");
        if (entry.angle_degrees !== undefined) ag76Require(typeof entry.angle_degrees === "number" &&
          Number.isFinite(entry.angle_degrees), "invalid_element_angle", "Invalid element angle.");
      }
    }
  }
  const adjacent = days.find(item => item.civil_date === civilDate);
  if (adjacent?.sunrise && adjacent.elements[element]) {
    ag76Require((utc === null || ag76Instant(utc) === ag76Instant(adjacent.sunrise.utc)) &&
      (classification === null || classification === adjacent.elements[element].index),
    "inconsistent_sunrise_metadata", "Adjacent day and neighbor sunrise evidence disagree.");
    utc = adjacent.sunrise.utc;
    classification = adjacent.elements[element].index;
  }
  // A supplied sunrise-day endpoint is boundary evidence, never a classification.
  if (utc === null && direction === "next" && day.dayparts.panchang_day) {
    utc = day.dayparts.panchang_day.end_utc;
  }
  if (utc !== null) ag76Require(ag76LocalDateKeyAt(ag76Instant(utc), day.timezone) === civilDate,
    "nonconsecutive_sunrise_boundaries", "Neighbor sunrise must belong to the adjacent local date.");
  return { civil_date: civilDate, sunrise_utc: utc, index: utc === null ? null : classification };
}

function requireUniqueNeighborEvidence(day, selector, days, candidates) {
  const element = day.elements[selector.element];
  const condition = normalized(element.condition_window, "unique_condition", day.timezone);
  for (const direction of ["previous", "next"]) {
    const evidence = uniquenessNeighborEvidence(day, direction, selector.element, days);
    let presence = "unknown";
    if (evidence.index !== null) {
      presence = selector.target_indices.includes(evidence.index) ? "present" : "absent";
      if (selector.target_indices.length === 1) ag76Require(
        contains(condition, evidence.sunrise_utc) === (evidence.index === element.index),
        evidence.index === element.index ? "inconsistent_repeated_sunrise" : "inconsistent_sunrise_metadata",
        "Condition window and neighbor classification disagree.");
    } else if (selector.target_indices.length === 1) {
      if (evidence.sunrise_utc !== null) {
        presence = contains(condition, evidence.sunrise_utc) ? "present" : "absent";
      } else {
        // Excluding the entire adjacent civil day proves absence without guessing a sunrise.
        const excluded = direction === "previous" ?
          ag76Instant(condition.start_utc) >= ag76Instant(day.dayparts.civil_day.start_utc) :
          ag76Instant(condition.end_utc) <= ag76Instant(day.dayparts.civil_day.end_utc);
        if (excluded) presence = "absent";
      }
    }
    ag76Require(presence !== "unknown", "insufficient_neighbor_evidence",
      "Uniqueness requires confirmed absence or presence on the relevant adjacent day.",
      { direction, civil_date: evidence.civil_date });
    if (presence === "present") ag76Require(candidates.some(item => item.civil_date === evidence.civil_date),
      "incomplete_competing_day_scope", "A confirmed adjacent match requires its competing candidate day.");
  }
}

function sunriseBoundaries(day, element, uniqueScope = null) {
  ag76Require(day.sunrise && day.dayparts.panchang_day, "incomplete_sunrise_boundaries",
    "A sunrise-to-next-sunrise interval is required.");
  const next = uniqueScope === null ? neighbor(day, "next", element) :
    uniquenessNeighborEvidence(day, "next", element, uniqueScope);
  ag76Require(next.sunrise_utc !== null, "insufficient_neighbor_evidence",
    "The next sunrise boundary is unavailable.", { direction: "next" });
  const interval = day.dayparts.panchang_day;
  ag76Require(ag76Instant(interval.start_utc) === ag76Instant(day.sunrise.utc) &&
    ag76Instant(interval.end_utc) === ag76Instant(next.sunrise_utc),
  "inconsistent_sunrise_boundaries", "Sunrise interval does not match adjacent sunrise evidence.");
  return next;
}

function evaluateElement(rule, selector, days) {
  const candidates = [];
  for (const day of days) {
    const element = day.elements[selector.element];
    ag76Require(element !== undefined && day.sunrise, "incomplete_astronomical_data",
      "Sunrise classification is required.", { operator: selector.operator });
    const windows = windowsFor(day, selector);
    if (selector.operator === "element_at_sunrise") {
      if (!selector.target_indices.includes(element.index)) continue;
      ag76Require(element.condition_window && day.dayparts.panchang_day,
        "incomplete_astronomical_data", "A continuous condition and sunrise-day interval are required.");
      sunriseBoundaries(day, selector.element,
        (rule.precedence_policy ?? "unique_only") === "unique_only" ? days : null);
      candidates.push(candidate(rule, selector, day, {
        target_index: element.index,
        astronomical_condition_window: normalized(element.condition_window, "astronomical_condition", day.timezone),
        observance_window: day.dayparts.panchang_day,
        exceptional_case: element.sunrise_sequence?.repeated_from_previous === true ||
          element.sunrise_sequence?.repeated_into_next === true ? "repeated_sunrise" : null
      }));
    } else if (selector.operator === "element_occurs_between_sunrises") {
      const next = sunriseBoundaries(day, selector.element);
      ag76Require(day.condition_windows_complete?.[selector.element] === true,
        "incomplete_condition_intervals", "Complete between-sunrise condition intervals are unavailable.");
      if (selector.target_indices.includes(element.index) || selector.target_indices.includes(next.index)) continue;
      for (const window of windows) {
        const overlap = ag76Unwrap(intersectAg76Intervals(window.interval, day.dayparts.panchang_day));
        if (!overlap) continue;
        ag76Require(!contains(window.interval, day.sunrise.utc) &&
          !contains(window.interval, next.sunrise_utc) &&
          ag76Instant(window.interval.start_utc) >= ag76Instant(day.sunrise.utc) &&
          ag76Instant(window.interval.end_utc) <= ag76Instant(next.sunrise_utc),
        "condition_crosses_sunrise", "Neither-sunrise classification requires an enclosed continuous condition.");
        candidates.push(candidate(rule, selector, day, {
          target_index: window.index, astronomical_condition_window: window.interval,
          observance_window: overlap,
          exceptional_case: "element_absent_at_both_verified_sunrises"
        }));
      }
    } else {
      ag76Require(day.dayparts[selector.daypart], "missing_daypart_data",
        "The requested daypart is unavailable; no formula is substituted.");
      ag76Require(windows.length > 0 || day.condition_windows_complete?.[selector.element] === true,
        "incomplete_condition_intervals", "No complete condition evidence for the requested element.");
      for (const window of windows) {
        const overlap = ag76Unwrap(intersectAg76Intervals(window.interval,
          day.dayparts[selector.daypart], selector.element + "_" + selector.daypart + "_overlap"));
        if (!overlap) continue;
        const seconds = (ag76Instant(overlap.end_utc) - ag76Instant(overlap.start_utc)) / 1000;
        if (seconds < (selector.required_overlap?.minimum_seconds ?? 0)) continue;
        candidates.push(candidate(rule, selector, day, {
          target_index: window.index, astronomical_condition_window: window.interval,
          observance_window: overlap, exceptional_case: null
        }));
      }
    }
  }
  return candidates;
}

function solarCandidates(rule, selector, days) {
  const result = [];
  for (const day of days) {
    ag76Require(Array.isArray(day.solar_ingresses), "incomplete_solar_ingress_data",
      "Solar ingress events must be supplied explicitly.");
    for (const ingress of day.solar_ingresses) {
      ag76Object(ingress, ["utc", "entered_sidereal_sign_index", "entered_sidereal_sign_number",
        "target_degrees", "angle_residual_degrees", "final_bracket_seconds"], "solar ingress");
      ag76Instant(ingress.utc);
      const sign = ingress.entered_sidereal_sign_index;
      ag76Require(Number.isInteger(sign) && sign >= 0 && sign <= 11,
        "invalid_solar_ingress", "AG74N zero-based entered sidereal sign is required.");
      if (ingress.entered_sidereal_sign_number !== undefined) ag76Require(
        ingress.entered_sidereal_sign_number === sign + 1, "invalid_solar_ingress", "Inconsistent sign number.");
      for (const key of ["target_degrees", "angle_residual_degrees", "final_bracket_seconds"]) {
        if (ingress[key] !== undefined) ag76Require(typeof ingress[key] === "number" &&
          Number.isFinite(ingress[key]), "invalid_solar_ingress", "Ingress diagnostics must be finite.");
      }
      if (sign !== selector.solar_condition.entered_sidereal_sign_index ||
        !contains(day.dayparts.civil_day, ingress.utc)) continue;
      result.push(candidate(rule, selector, day, { target_index: sign,
        astronomical_event: { type: "solar_ingress", utc: new Date(ag76Instant(ingress.utc)).toISOString(),
          entered_sidereal_sign_index: sign } }));
    }
  }
  return result;
}

function sequenceCandidate(rule, selector, childResults) {
  ag76Object(childResults, selector.child_event_ids, "child_results");
  const declarations = [...rule.parent_child_sequence.children].sort((a, b) => a.event_sequence - b.event_sequence);
  let previousDate = null;
  for (const declaration of declarations) {
    ag76Require(Object.hasOwn(childResults, declaration.event_id), "missing_sequence_child", "Missing sequence child.");
    const child = childResults[declaration.event_id];
    ag76Object(child, ["status", "module_id", "engine_version", "event_id", "rule_id", "rule_version",
      "candidate_observance_dates", "candidates", "selected_internal_candidates",
      "astronomical_condition_window", "astronomical_event", "observance_window",
      "primary_public_window", "ritual_windows", "parana_conclusion", "sequence_relationship",
      "source_evidence_trace", "rule_trace", "approval_state", "error_code", "internal_candidate_only",
      "public_output_allowed", "runtime_activation", "affected_rule_id", "operator", "error"], "child result");
    ag76Require(child.event_id === declaration.event_id, "sequence_child_identity_mismatch", "Child event identity mismatch.");
    ag76Require(child.public_output_allowed === false && child.runtime_activation === false,
      "activation_forbidden", "Child result must be internal and inactive.");
    ag76Id(child.rule_id, "child rule_id");
    ag76Require(typeof child.rule_version === "string" && /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/.test(child.rule_version),
      "invalid_rule_version", "Invalid child rule version.");
    ag76Require(child.status === "ag76_internal_candidate_evaluated_public_blocked" &&
      child.error_code === null, "failed_sequence_child", "Failed children cannot complete a sequence.");
    validateSequence(child.sequence_relationship, child.event_id);
    ag76Require(child.sequence_relationship.role === "child" &&
      child.sequence_relationship.parent_event_id === rule.event_id &&
      child.sequence_relationship.event_sequence === declaration.event_sequence,
    "sequence_relationship_mismatch", "Child relationship disagrees with the parent.");
    const selected = ag76Array(child.selected_internal_candidates, "child candidates");
    ag76Require(selected.length === 1,
      "ambiguous_sequence_child", "Each sequence child requires one matching internal candidate.");
    const match = selected[0];
    ag76Object(match, ["candidate_id", "event_id", "rule_id", "rule_version", "civil_date",
      "selector_id", "operator", "astronomical_condition_window", "astronomical_event",
      "observance_window", "target_index", "exceptional_case", "primary_public_window",
      "ritual_windows", "public_output_allowed", "runtime_activation"], "selected child candidate");
    ag76Require(match.event_id === declaration.event_id &&
      match.rule_id === child.rule_id && match.rule_version === child.rule_version &&
      match.public_output_allowed === false && match.runtime_activation === false,
    "sequence_candidate_identity_mismatch", "Selected child candidate contradicts its result identity or activation state.");
    ag76Id(match.selector_id, "child selector_id");
    ag76Text(match.candidate_id, "child candidate_id");
    const allCandidates = ag76Array(child.candidates, "all child candidates");
    ag76Require(allCandidates.some(value => value && typeof value === "object" &&
      Object.getOwnPropertyDescriptor(value, "candidate_id")?.value === match.candidate_id &&
      Object.getOwnPropertyDescriptor(value, "event_id")?.value === match.event_id &&
      Object.getOwnPropertyDescriptor(value, "civil_date")?.value === match.civil_date),
    "sequence_candidate_not_in_result", "Selected child candidate is absent from its result candidate bank.");
    const date = ag76DateKey(selected[0].civil_date);
    ag76Require(ag76Array(child.candidate_observance_dates, "child candidate dates").includes(date),
      "sequence_candidate_not_in_result", "Selected child date is absent from its result date bank.");
    ag76Require(previousDate === null || previousDate <= date, "sequence_date_order_violation",
      "Child dates contradict the declared sequence order.");
    previousDate = date;
  }
  return candidate(rule, selector, null, {
    candidate_kind: "parent_child_sequence",
    child_event_ids: declarations.map(child => child.event_id),
    sequence_status: "sequence_trace_available_public_blocked"
  });
}

function selectCandidates(rule, selector, days, candidates) {
  const sorted = [...candidates].sort((a, b) =>
    String(a.civil_date ?? "").localeCompare(String(b.civil_date ?? "")) ||
    String(a.astronomical_event?.utc ?? a.astronomical_condition_window?.start_utc ?? "")
      .localeCompare(String(b.astronomical_event?.utc ?? b.astronomical_condition_window?.start_utc ?? "")));
  ag76Require(new Set(sorted.map(item => item.candidate_id)).size === sorted.length,
    "ambiguous_candidates", "Multiple matches within one day require an explicit unsupported precedence rule.");
  const policy = rule.precedence_policy ?? "unique_only";
  if (selector.operator === "element_at_sunrise") {
    for (const match of sorted) {
      const day = days.find(item => item.civil_date === match.civil_date);
      const element = day.elements[selector.element];
      if (policy === "unique_only") requireUniqueNeighborEvidence(day, selector, days, sorted);
      for (const [direction, flag, shift] of [
        ["previous", "repeated_from_previous", -1], ["next", "repeated_into_next", 1]
      ]) {
        const repeated = element.sunrise_sequence?.[flag] === true ||
          day.neighboring_sunrises?.[direction]?.classification?.[selector.element]?.index === element.index;
        if (!repeated) continue;
        const boundary = neighbor(day, direction, selector.element);
        ag76Require(boundary.index === element.index &&
          contains(normalized(element.condition_window, "repeated_condition", day.timezone), boundary.sunrise_utc),
        "inconsistent_repeated_sunrise", "Repeated-sunrise evidence must describe the same continuous condition.");
        const adjacentDate = ag76AddCivilDays(day.civil_date, shift);
        ag76Require(days.some(item => item.civil_date === adjacentDate) &&
          sorted.some(item => item.civil_date === adjacentDate),
        "incomplete_competing_day_scope", "Known repeated sunrise requires the adjacent competing day.");
        const adjacent = days.find(item => item.civil_date === adjacentDate);
        const adjacentElement = adjacent.elements[selector.element];
        ag76Require(adjacentElement.index === element.index &&
          contains(normalized(adjacentElement.condition_window, "adjacent_condition", adjacent.timezone), day.sunrise.utc),
        "inconsistent_repeated_sunrise", "Competing sunrise contexts must share continuous condition evidence.");
      }
    }
  }
  if (!sorted.length) return { candidates: sorted, selected: [], error_code: "no_internal_candidate" };
  if (sorted.length === 1) return { candidates: sorted, selected: sorted, error_code: null };
  if (policy === "allow_multiple_internal_candidates") return { candidates: sorted, selected: sorted, error_code: null };
  if (policy === "prefer_first_candidate") return { candidates: sorted, selected: [sorted[0]], error_code: null };
  if (policy === "prefer_last_candidate") return { candidates: sorted, selected: [sorted.at(-1)], error_code: null };
  return { candidates: sorted, selected: [], error_code: "ambiguous_candidate_selection" };
}

export function evaluateAg76FestivalRule(input) {
  let ruleId = null, operator = null;
  try {
    ag76Object(input, ["rule", "day_contexts", "variant_selection", "child_results", "approval_context"], "engine input");
    const { rule, day_contexts = [], variant_selection = null,
      child_results = {}, approval_context = {} } = input;
    const validated = validateRule(rule);
    ruleId = validated.rule_id;
    operator = validated.selector.operator;
    const context = { ...ag76Object(approval_context,
      ["country_code", "region", "tradition", "sampradaya"], "approval_context") };
    if (variant_selection !== null) {
      ag76Object(variant_selection, ["variant_id"], "variant_selection");
      ag76Id(variant_selection.variant_id, "variant_id");
      context.variant_id = variant_selection.variant_id;
    }
    const initialGate = ag76Unwrap(evaluateAg76ApprovalGate({ rule, context }));
    const days = ag76Array(day_contexts, "day_contexts").map(validateDay)
      .sort((a, b) => a.civil_date.localeCompare(b.civil_date));
    ag76Require(new Set(days.map(day => day.civil_date)).size === days.length,
      "duplicate_day_context", "Each local date must have exactly one day context.");
    ag76Require(new Set(days.map(day => day.timezone)).size <= 1,
      "mixed_timezones", "A candidate scope must use one resolved timezone.");
    const selector = validated.selector;
    let candidates;
    if (selector.operator === "parent_child_sequence") candidates = [sequenceCandidate(rule, selector, child_results)];
    else {
      ag76Require(days.length > 0, "missing_day_context", "This selector requires astronomical day contexts.");
      ag76Object(child_results, [], "unused child_results");
      candidates = selector.operator === "solar_ingress_within_local_day" ?
        solarCandidates(rule, selector, days) : evaluateElement(rule, selector, days);
    }
    const selection = selectCandidates(rule, selector, days, candidates);
    const errorCode = selection.error_code;
    return {
      status: errorCode ? "ag76_rule_evaluation_failed_public_blocked" :
        "ag76_internal_candidate_evaluated_public_blocked",
      module_id: "AG76", engine_version: AG76_FESTIVAL_RULE_ENGINE_VERSION,
      event_id: rule.event_id, rule_id: rule.rule_id, rule_version: rule.rule_version,
      candidate_observance_dates: [...new Set(selection.candidates.map(item => item.civil_date).filter(Boolean))],
      candidates: selection.candidates, selected_internal_candidates: selection.selected,
      astronomical_condition_window: selection.selected[0]?.astronomical_condition_window ?? null,
      astronomical_event: selection.selected[0]?.astronomical_event ?? null,
      observance_window: selection.selected[0]?.observance_window ?? null,
      primary_public_window: null, ritual_windows: [],
      parana_conclusion: {
        status: rule.parana_conclusion_policy?.applicability === "not_applicable" ?
          "not_applicable" : "withheld_pending_rule_review", window: null
      },
      sequence_relationship: rule.parent_child_sequence ? {
        ...structuredClone(rule.parent_child_sequence),
        ...(rule.parent_child_sequence.role === "parent" ? {
          children: structuredClone(rule.parent_child_sequence.children)
            .sort((a, b) => a.event_sequence - b.event_sequence)
        } : {})
      } : null,
      source_evidence_trace: structuredClone(rule.source_evidence ?? []),
      rule_trace: { operator, precedence_policy: validated.precedence_policy,
        candidate_order: "chronological", variant_resolution: initialGate.checks.applicability,
        synthetic_fixture: rule.metadata?.synthetic_fixture === true },
      approval_state: evaluateAg76ApprovalGate({ rule, context, evaluation: {
        event_id: rule.event_id, rule_id: rule.rule_id, rule_version: rule.rule_version, error_code: errorCode
      } }),
      error_code: errorCode,
      internal_candidate_only: true, public_output_allowed: false, runtime_activation: false
    };
  } catch (error) {
    return ag76Failure(error, { module_id: "AG76", affected_rule_id: ruleId,
      operator, candidates: [], selected_internal_candidates: [],
      candidate_observance_dates: [], primary_public_window: null, ritual_windows: [],
      parana_conclusion: { status: "withheld_pending_rule_review", window: null } });
  }
}
