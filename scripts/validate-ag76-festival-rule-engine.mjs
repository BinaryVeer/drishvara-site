import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  ag76AddCivilDays, ag76AstronomicalPrimitive, ag76IntervalContainsInstant,
  ag76IntervalsOverlap, ag76NextAngularBoundary, ag76SolarIngressesForRange,
  buildAg76AstronomyDayContext, intersectAg76Intervals, normalizeAg76Interval
} from "./lib/ag76-festival-astronomy-adapter.mjs";
import { evaluateAg76ApprovalGate } from "./lib/ag76-festival-approval-gate.mjs";
import { evaluateAg76FestivalRule, validateAg76RuleDsl } from "./lib/ag76-festival-rule-engine.mjs";

// Synthetic mechanics fixtures below are not independently verified festival-date benchmarks.
let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log("PASS " + name); }
  catch (error) { console.error("FAIL " + name); throw error; }
}
const copy = value => structuredClone(value);
const interval = (start, end) => ({ start_utc: start, end_utc: end });
const context = { tradition: "hindu" };
const scope = () => ({ countries: ["*"], regions: ["*"], traditions: ["hindu"],
  sampradayas: ["*"], variant_policy: "none", variants: [] });
function evidence(purpose, status = "source_review_pending") {
  return { purpose, source_reference: "synthetic:" + purpose, review_status: status,
    ...(status === "approved" ? { reviewed_by_or_process: "synthetic_test_only",
      review_date: "2026-01-01" } : {}) };
}
function baseRule(changes = {}) {
  return {
    event_id: "synthetic_observance", rule_id: "ag76_synthetic_rule_v1", rule_version: "1.0.0",
    calendar_basis: { type: "astronomical" }, applicability: scope(),
    candidate_selectors: [{ selector_id: "synthetic_sunrise", operator: "element_at_sunrise",
      element: "tithi", target_indices: [11] }],
    precedence_policy: "unique_only", exception_branches: [],
    source_evidence: ["event_definition", "canonical_name", "date_rule"].map(purpose => evidence(purpose)),
    governance: { rule_review_status: "rule_review_pending" },
    public_window_policy: { mode: "withheld", approval_status: "withheld_pending_rule_review" },
    ritual_window_policies: [],
    parana_conclusion_policy: { applicability: "rule_dependent", approval_status: "withheld_pending_rule_review" },
    metadata: { synthetic_fixture: true, label: "Synthetic engine mechanics only" },
    ...changes
  };
}
function syntheticDay(date = "2026-01-01", changes = {}) {
  const next = ag76AddCivilDays(date, 1), previous = ag76AddCivilDays(date, -1);
  const neighbor = (civilDate, tithiIndex) => ({
    civil_date: civilDate, sunrise_utc: civilDate + "T06:00:00.000Z",
    classification: { tithi: { index: tithiIndex }, nakshatra: { index: 8 } }
  });
  return {
    status: "ag76_synthetic_test_day_context", synthetic_fixture: true,
    civil_date: date, timezone: "UTC", sunrise: { utc: date + "T06:00:00.000Z" },
    sunset: { utc: date + "T18:00:00.000Z" }, paksha: "Shukla Paksha",
    elements: {
      tithi: { index: 11, condition_window: interval(date + "T01:00:00.000Z", date + "T23:00:00.000Z"),
        sunrise_sequence: { repeated_from_previous: false, repeated_into_next: false } },
      nakshatra: { index: 7, condition_window: interval(date + "T01:00:00.000Z", date + "T23:00:00.000Z") }
    },
    dayparts: {
      civil_day: interval(date + "T00:00:00.000Z", next + "T00:00:00.000Z"),
      panchang_day: interval(date + "T06:00:00.000Z", next + "T06:00:00.000Z"),
      daytime: interval(date + "T06:00:00.000Z", date + "T18:00:00.000Z"),
      evening: interval(date + "T17:30:00.000Z", date + "T20:00:00.000Z")
    },
    condition_windows: {}, condition_windows_complete: { tithi: true, nakshatra: true },
    neighboring_sunrises: { previous: neighbor(previous, 10), next: neighbor(next, 12) },
    public_output_allowed: false, runtime_activation: false, ...changes
  };
}
function select(operator, fields = {}) {
  return { selector_id: "synthetic_selector", operator,
    ...(operator.startsWith("element_") ? { element: "tithi", target_indices: [11] } : {}),
    ...fields };
}
function ruleFor(operator, fields = {}, changes = {}) {
  return baseRule({ candidate_selectors: [select(operator, fields)], ...changes });
}
function run(rule = baseRule(), days = [syntheticDay()], extra = {}) {
  return evaluateAg76FestivalRule({ rule, day_contexts: days, approval_context: context, ...extra });
}
function closed(result) {
  assert.equal(result.public_output_allowed, false);
  assert.equal(result.runtime_activation, false);
}
function success(result) {
  closed(result);
  assert.equal(result.error_code, null, JSON.stringify(result.error));
  assert.equal(result.status, "ag76_internal_candidate_evaluated_public_blocked");
  assert.equal(result.primary_public_window, null);
  assert.deepEqual(result.ritual_windows, []);
}
function failure(result, code) {
  closed(result);
  assert.equal(result.error_code, code, JSON.stringify(result));
}
function repeatedDays(end = "2026-01-02T12:00:00.000Z") {
  const days = [syntheticDay(), syntheticDay("2026-01-02")];
  for (const day of days) day.elements.tithi.condition_window =
    interval("2026-01-01T01:00:00.000Z", end);
  days[0].elements.tithi.sunrise_sequence.repeated_into_next = true;
  days[0].neighboring_sunrises.next.classification.tithi.index = 11;
  days[1].elements.tithi.sunrise_sequence.repeated_from_previous = true;
  days[1].neighboring_sunrises.previous.classification.tithi.index = 11;
  return days;
}
function betweenDay() {
  const day = syntheticDay();
  day.elements.tithi.index = 12;
  day.elements.tithi.condition_window = interval("2026-01-01T05:00:00.000Z", "2026-01-01T09:00:00.000Z");
  day.neighboring_sunrises.next.classification.tithi.index = 15;
  day.condition_windows.tithi = [{ index: 14,
    interval: interval("2026-01-01T10:00:00.000Z", "2026-01-01T15:00:00.000Z") }];
  return day;
}
const betweenRule = () => ruleFor("element_occurs_between_sunrises", { target_indices: [14] });
function solarDay(utc, sign = 9) {
  return syntheticDay("2026-01-01", { solar_ingresses: [
    { utc, entered_sidereal_sign_index: sign, entered_sidereal_sign_number: sign + 1 }
  ] });
}
const solarRule = sign => ruleFor("solar_ingress_within_local_day",
  { solar_condition: { entered_sidereal_sign_index: sign } });
function sequenceRule() {
  return ruleFor("parent_child_sequence", { child_event_ids: ["child_a", "child_b"] }, {
    event_id: "synthetic_parent",
    parent_child_sequence: { role: "parent", parent_event_id: "synthetic_parent", children: [
      { event_id: "child_a", event_sequence: 1 }, { event_id: "child_b", event_sequence: 2 }
    ] }
  });
}
function childResult(eventId, date, order) {
  return run(baseRule({ event_id: eventId,
    parent_child_sequence: { role: "child", parent_event_id: "synthetic_parent", event_sequence: order }
  }), [syntheticDay(date)]);
}
function children() {
  return { child_a: childResult("child_a", "2026-01-01", 1),
    child_b: childResult("child_b", "2026-01-02", 2) };
}
function sequenceRun(childResults = children(), rule = sequenceRule()) {
  return run(rule, [], { child_results: childResults });
}

// Preserve the original nineteen coverage areas, with stronger assertions and valid fixtures.
test("Synthetic Tithi present at one sunrise", () => {
  const result = run(); success(result);
  assert.deepEqual(result.candidate_observance_dates, ["2026-01-01"]);
  assert.equal(result.candidates.length, 1);
});
test("Synthetic continuous Tithi at two consecutive sunrises requires review", () => {
  const result = run(baseRule({ precedence_policy: "review_required_on_multiple" }), repeatedDays());
  failure(result, "ambiguous_candidate_selection");
  assert.equal(result.candidates.length, 2);
  assert.equal(result.selected_internal_candidates.length, 0);
});
test("Synthetic neither-sunrise condition uses verified adjacent boundaries", () => {
  const result = run(betweenRule(), [betweenDay()]); success(result);
  assert.equal(result.candidates[0].exceptional_case, "element_absent_at_both_verified_sunrises");
  assert.equal(result.observance_window.start_utc, "2026-01-01T10:00:00.000Z");
  assert.equal(result.observance_window.end_utc, "2026-01-01T15:00:00.000Z");
});
test("Synthetic daytime intersection checks exact boundaries", () => {
  const result = run(ruleFor("element_overlaps_daypart", { daypart: "daytime" }));
  success(result);
  assert.equal(result.observance_window.start_utc, "2026-01-01T06:00:00.000Z");
  assert.equal(result.observance_window.end_utc, "2026-01-01T18:00:00.000Z");
});
test("Synthetic both-evening continuous condition requires review", () => {
  const result = run(ruleFor("element_overlaps_daypart", { daypart: "evening" },
    { precedence_policy: "review_required_on_multiple" }), repeatedDays("2026-01-02T21:00:00.000Z"));
  failure(result, "ambiguous_candidate_selection");
  assert.equal(result.candidates.length, 2);
});
test("Synthetic neither-evening case checks both adjacent days", () => {
  const days = [syntheticDay(), syntheticDay("2026-01-02")];
  // One continuous target contains the second sunrise but neither evening.
  days[0].elements.tithi.index = 10;
  days[0].neighboring_sunrises.previous.classification.tithi.index = 9;
  days[0].neighboring_sunrises.next.classification.tithi.index = 11;
  days[0].elements.tithi.condition_window = interval("2026-01-01T01:00:00.000Z", "2026-01-01T08:00:00.000Z");
  days[0].condition_windows.tithi = [{ index: 11,
    interval: interval("2026-01-01T23:30:00.000Z", "2026-01-02T12:00:00.000Z") }];
  days[1].elements.tithi.condition_window = days[0].condition_windows.tithi[0].interval;
  days[1].neighboring_sunrises.previous.classification.tithi.index = 10;
  const result = run(ruleFor("element_overlaps_daypart", { daypart: "evening" }), days);
  failure(result, "no_internal_candidate"); assert.equal(result.candidates.length, 0);
});
test("Unsupported operator returns a governed failure", () => {
  failure(run(ruleFor("execute_arbitrary_javascript")), "unsupported_operator");
});
test("Ambiguous regional/sampradaya selection fails closed", () => {
  const rule = baseRule(); rule.applicability.variant_policy = "explicit_required";
  rule.applicability.variants = ["smarta", "vaishnava"].map(variant_id => ({
    variant_id, countries: ["IN"], regions: ["north_india"], traditions: ["hindu"], sampradayas: [variant_id]
  }));
  failure(run(rule), "ambiguous_variant_selection");
});
test("Parent-child sequence uses actual successful child results", () => {
  const result = sequenceRun(); success(result);
  assert.equal(result.candidates[0].sequence_status, "sequence_trace_available_public_blocked");
  assert.deepEqual(result.candidate_observance_dates, []);
  assert.equal(result.observance_window, null);
});
test("Pending canonical source approval is reported", () => {
  const result = run(); success(result);
  assert.equal(result.approval_state.source_evidence_approved, false);
  assert.ok(result.approval_state.fail_closed_reasons.some(item => item.code === "source_evidence_not_approved"));
});
test("Missing public-window approval remains separate", () => {
  const rule = baseRule(); delete rule.public_window_policy;
  const result = run(rule); success(result);
  assert.equal(result.approval_state.primary_public_window_approved, false);
});
test("Ritual and conclusion windows remain withheld independently", () => {
  const result = run(baseRule({ ritual_window_policies: [
    { ritual_window_id: "synthetic_puja", approval_status: "withheld_pending_rule_review" }
  ] })); success(result);
  assert.equal(result.approval_state.checks.ritual_windows[0].approved, false);
  assert.equal(result.approval_state.checks.parana_conclusion.independently_approved, false);
  assert.equal(result.parana_conclusion.window, null);
});
test("Repeat-run determinism", () => {
  assert.deepEqual(run(), run());
});
test("Reversed intervals return structured failures", () => {
  failure(normalizeAg76Interval(interval("2026-01-01T10:00:00Z", "2026-01-01T09:00:00Z")), "invalid_interval");
});
test("Exact interval intersection", () => {
  const overlap = intersectAg76Intervals(
    interval("2026-01-01T01:00:00Z", "2026-01-01T05:00:00Z"),
    interval("2026-01-01T03:00:00Z", "2026-01-01T07:00:00Z"));
  assert.equal(overlap.start_utc, "2026-01-01T03:00:00.000Z");
  assert.equal(overlap.end_utc, "2026-01-01T05:00:00.000Z");
});
test("Even approved synthetic evidence cannot activate public output", () => {
  const rule = baseRule({ governance: { rule_review_status: "approved" },
    source_evidence: ["event_definition", "canonical_name", "date_rule", "timing_rule", "ritual_rule"]
      .map(purpose => evidence(purpose, "approved")),
    public_window_policy: { mode: "withheld", approval_status: "approved" } });
  const result = run(rule); success(result); closed(result.approval_state);
  assert.equal(result.approval_state.source_evidence_approved, true);
  assert.equal(result.approval_state.primary_public_window_approved, true);
});
let realDay;
test("Real AG74M contract including offset/local-label validation", () => {
  realDay = buildAg76AstronomyDayContext({ mode: "coordinate_first", civil_date: "2026-10-08",
    latitude: 25.3176, longitude: 82.9739, timezone: "Asia/Kolkata",
    optional_place_label: "AG76 contract probe only" });
  assert.equal(realDay.status, "ag76_day_context_available", JSON.stringify(realDay));
  closed(realDay);
  assert.equal(realDay.condition_windows_complete.tithi, false);
  assert.equal(Date.parse(realDay.dayparts.civil_day.end_utc) -
    Date.parse(realDay.dayparts.civil_day.start_utc), 86400000);
  assert.equal(realDay.sunrise.local.slice(-6), "+05:30");
});
test("Real AG74L primitive contract stays internal", () => {
  const value = ag76AstronomicalPrimitive("2026-10-08T00:00:00Z");
  assert.equal(value.engine_profile_id, "drishvara_astronomical_engine_v1"); closed(value);
});
test("Real AG74N ingress contract is used by the actual solar operator", () => {
  const value = ag76SolarIngressesForRange({ start_utc: "2026-01-01T00:00:00Z", end_utc: "2026-02-15T00:00:00Z" });
  closed(value); assert.ok(value.events.length > 0);
  const event = value.events[0], date = event.utc.slice(0, 10);
  const result = run(solarRule(event.entered_sidereal_sign_index), [
    syntheticDay(date, { solar_ingresses: [event] })
  ]);
  success(result); assert.equal(result.astronomical_event.utc, event.utc);
  assert.equal(result.astronomical_condition_window, null);
});

// Audit regression cases: each exercises the affected evaluator or gate path.
test("Unsupported calendar basis is rejected", () => {
  failure(run(baseRule({ calendar_basis: { type: "hindu_lunar" } })), "unsupported_calendar_basis");
});
test("Unknown calendar convention is rejected", () => {
  failure(run(baseRule({ calendar_basis: { type: "astronomical", convention: "invented" } })), "unsupported_rule_field");
});
test("Nonempty exception branches cannot be silently ignored", () => {
  failure(run(baseRule({ exception_branches: [{ when: "both_evenings", select: "later" }] })), "unsupported_exception_branch");
});
for (const [name, utc, sign, expected] of [
  ["wrong solar sign", "2026-01-01T12:00:00.000Z", 8, "no_internal_candidate"],
  ["ingress 0.5 seconds before local day", "2025-12-31T23:59:59.500Z", 9, "no_internal_candidate"],
  ["ingress exactly at exclusive end", "2026-01-02T00:00:00.000Z", 9, "no_internal_candidate"],
  ["ingress at inclusive start", "2026-01-01T00:00:00.000Z", 9, null],
  ["correct sign inside local day", "2026-01-01T12:00:00.123Z", 9, null]
]) test("Synthetic " + name, () => {
  const result = run(solarRule(9), [solarDay(utc, sign)]);
  if (expected) failure(result, expected); else {
    success(result); assert.equal(result.astronomical_event.utc, new Date(utc).toISOString());
    assert.equal(result.astronomical_event.entered_sidereal_sign_index, 9);
    assert.equal(result.astronomical_condition_window, null);
  }
});
test("Unknown solar condition constraints are rejected", () => {
  failure(run(ruleFor("solar_ingress_within_local_day",
    { solar_condition: { entered_sidereal_sign_index: 9, tropical_sign: 10 } })),
  "unsupported_rule_field");
});
test("Legacy incorrect solar sign field is rejected", () => {
  const day = solarDay("2026-01-01T12:00:00Z");
  day.solar_ingresses[0] = { utc: "2026-01-01T12:00:00Z", sidereal_sign_index: 9 };
  failure(run(solarRule(9), [day]), "unsupported_rule_field");
});
test("Missing solar events are incomplete data", () => {
  failure(run(solarRule(9)), "incomplete_solar_ingress_data");
});
test("Target present at next sunrise is never called neither-sunrise", () => {
  const day = betweenDay();
  day.neighboring_sunrises.next.classification.tithi.index = 14;
  day.condition_windows.tithi[0].interval.end_utc = "2026-01-02T10:00:00Z";
  failure(run(betweenRule(), [day]), "no_internal_candidate");
});
test("Contradictory condition crossing next sunrise is rejected", () => {
  const day = betweenDay();
  day.condition_windows.tithi[0].interval.end_utc = "2026-01-02T10:00:00Z";
  failure(run(betweenRule(), [day]), "condition_crosses_sunrise");
});
test("Missing complete skipped-element intervals is unavailable", () => {
  const day = betweenDay(); day.condition_windows_complete.tithi = false;
  failure(run(betweenRule(), [day]), "incomplete_condition_intervals");
});
test("Real adapter does not claim skipped-Tithi support", () => {
  const target = realDay.elements.tithi.index === 30 ? 1 : 30;
  failure(run(ruleFor("element_occurs_between_sunrises", { target_indices: [target] }), [realDay]),
    "incomplete_condition_intervals");
});
test("Missing next sunrise cannot fall back to a civil day", () => {
  const day = betweenDay(); delete day.neighboring_sunrises.next;
  failure(run(betweenRule(), [day]), "incomplete_sunrise_boundaries");
});
test("Nonconsecutive sunrise evidence is rejected", () => {
  const day = betweenDay(); day.neighboring_sunrises.next.civil_date = "2026-01-03";
  failure(run(betweenRule(), [day]), "nonconsecutive_sunrise_boundaries");
});
test("Mismatched sunrise interval is rejected", () => {
  const day = betweenDay(); day.dayparts.panchang_day.end_utc = "2026-01-02T07:00:00Z";
  failure(run(betweenRule(), [day]), "inconsistent_sunrise_boundaries");
});
test("Known repeated sunrise cannot be selected from one supplied day", () => {
  failure(run(baseRule(), [repeatedDays()[0]]), "incomplete_competing_day_scope");
});
test("First/last candidate policies use chronological order", () => {
  const days = repeatedDays();
  for (const [policy, date] of [["prefer_first_candidate", "2026-01-01"], ["prefer_last_candidate", "2026-01-02"]]) {
    const rule = baseRule({ precedence_policy: policy });
    const forward = run(rule, days), reverse = run(rule, [...days].reverse());
    success(forward); assert.deepEqual(forward, reverse);
    assert.equal(forward.selected_internal_candidates[0].civil_date, date);
  }
});
test("Multiple internal candidates remain chronologically ordered", () => {
  const rule = baseRule({ precedence_policy: "allow_multiple_internal_candidates" });
  const days = repeatedDays(); const result = run(rule, [...days].reverse());
  success(result); assert.deepEqual(result.candidate_observance_dates, ["2026-01-01", "2026-01-02"]);
});
test("Unknown precedence policies are rejected", () => {
  failure(run(baseRule({ precedence_policy: "guess_the_correct_day" })), "unsupported_precedence_policy");
});
test("Duplicate day contexts are rejected", () => {
  failure(run(baseRule(), [syntheticDay(), syntheticDay()]), "duplicate_day_context");
});
test("Paksha condition affects overlap selection", () => {
  failure(run(ruleFor("element_overlaps_daypart", { daypart: "evening", paksha: "Krishna Paksha" })),
    "inconsistent_paksha_constraint");
});
test("Non-Tithi Paksha constraints are explicitly unsupported", () => {
  failure(run(ruleFor("element_at_sunrise", { element: "nakshatra", target_indices: [7],
    paksha: "Shukla Paksha" })), "unsupported_paksha_constraint");
});
test("Nakshatra sunrise path uses actual indices", () => {
  const result = run(ruleFor("element_at_sunrise", { element: "nakshatra", target_indices: [7] }));
  success(result); assert.equal(result.candidates[0].target_index, 7);
});
test("Minimum overlap rejects insufficient duration", () => {
  failure(run(ruleFor("element_overlaps_daypart", { daypart: "evening",
    required_overlap: { minimum_seconds: 9001 } })), "no_internal_candidate");
});
test("Minimum overlap accepts exact threshold", () => {
  const result = run(ruleFor("element_overlaps_daypart", { daypart: "evening",
    required_overlap: { minimum_seconds: 9000 } })); success(result);
  assert.equal(result.observance_window.start_utc, "2026-01-01T17:30:00.000Z");
  assert.equal(result.observance_window.end_utc, "2026-01-01T20:00:00.000Z");
});
test("Missing evening daypart returns incomplete data", () => {
  const day = syntheticDay(); delete day.dayparts.evening;
  failure(run(ruleFor("element_overlaps_daypart", { daypart: "evening" }), [day]), "missing_daypart_data");
});
test("Canonical pending evidence cannot be overridden by legacy review objects", () => {
  const rule = baseRule({ evidence_refs: [{ review_status: "approved" }] });
  failure(run(rule), "noncanonical_evidence_reference");
});
test("Canonical reference strings retain pending evidence", () => {
  const rule = baseRule({ evidence_refs: ["synthetic:date_rule"] });
  const result = run(rule); success(result); assert.equal(result.approval_state.source_evidence_approved, false);
});
test("Unresolved evidence references are rejected", () => {
  failure(run(baseRule({ evidence_refs: ["synthetic:missing"] })), "unresolved_evidence_reference");
});
test("Missing canonical evidence cannot report approval", () => {
  const rule = baseRule(); delete rule.source_evidence;
  const result = run(rule); success(result);
  assert.equal(result.approval_state.source_evidence_approved, false);
  assert.ok(result.approval_state.fail_closed_reasons.some(item => item.code === "missing_source_evidence"));
});
for (const malformed of [null, [null], "approved"]) test("Malformed canonical evidence: " + JSON.stringify(malformed), () => {
  const result = run(baseRule({ source_evidence: malformed })); closed(result);
  assert.ok(result.error_code); assert.equal(result.status, "ag76_failure_public_blocked");
});
test("Invalid evidence purpose is rejected", () => {
  failure(run(baseRule({ source_evidence: [{ ...evidence("date_rule"), purpose: "invented" }] })), "invalid_evidence_purpose");
});
test("Missing source reference is rejected", () => {
  const entry = evidence("date_rule"); delete entry.source_reference;
  failure(run(baseRule({ source_evidence: [entry] })), "invalid_string");
});
test("Unknown and non-string approval states are rejected", () => {
  for (const review_status of ["production_ready", ["approved"], true]) {
    failure(run(baseRule({ source_evidence: [{ ...evidence("date_rule"), review_status }] })), "unknown_governance_state");
  }
});
test("Missing evidence purposes prevent source approval", () => {
  const result = run(baseRule({ governance: { rule_review_status: "approved" },
    source_evidence: [evidence("date_rule", "approved")] }));
  success(result); assert.equal(result.approval_state.source_evidence_approved, false);
});
test("Source approval does not imply timing or ritual approval", () => {
  const result = run(baseRule({ governance: { rule_review_status: "approved" },
    source_evidence: ["event_definition", "canonical_name", "date_rule"].map(purpose => evidence(purpose, "approved")),
    public_window_policy: { mode: "withheld", approval_status: "approved" },
    ritual_window_policies: [{ ritual_window_id: "synthetic_puja", approval_status: "approved" }]
  }));
  success(result); assert.equal(result.approval_state.source_evidence_approved, true);
  assert.equal(result.approval_state.primary_public_window_approved, false);
  assert.equal(result.approval_state.checks.ritual_windows[0].approved, false);
});
test("Not-applicable conclusion creates no conclusion timing", () => {
  const result = run(baseRule({ parana_conclusion_policy: {
    applicability: "not_applicable", approval_status: "not_separately_governed"
  } })); success(result); assert.deepEqual(result.parana_conclusion, { status: "not_applicable", window: null });
});
for (const [name, mutate, code] of [
  ["failed child", c => { c.child_b.status = "ag76_rule_evaluation_failed_public_blocked"; }, "failed_sequence_child"],
  ["mismatched child", c => { c.child_b.event_id = "another_event"; }, "sequence_child_identity_mismatch"],
  ["missing child", c => { delete c.child_b; }, "missing_sequence_child"],
  ["mismatched relationship", c => { c.child_b.sequence_relationship.event_sequence = 1; }, "sequence_relationship_mismatch"],
  ["reverse child dates", c => { c.child_a = childResult("child_a", "2026-01-03", 1); }, "sequence_date_order_violation"],
  ["ambiguous child dates", c => { c.child_b.selected_internal_candidates.push(copy(c.child_b.selected_internal_candidates[0])); }, "ambiguous_sequence_child"]
]) test("Synthetic sequence rejects " + name, () => {
  const values = children(); mutate(values); failure(sequenceRun(values), code);
});
test("Empty parent sequences are rejected", () => {
  const rule = sequenceRule(); rule.parent_child_sequence.children = [];
  failure(sequenceRun(children(), rule), "empty_sequence");
});
test("Parent self-reference is rejected", () => {
  const rule = sequenceRule(); rule.parent_child_sequence.children[0].event_id = rule.event_id;
  failure(sequenceRun(children(), rule), "sequence_cycle");
});
test("Duplicate sequence positions are rejected", () => {
  const rule = sequenceRule(); rule.parent_child_sequence.children[1].event_sequence = 1;
  failure(sequenceRun(children(), rule), "ambiguous_sequence");
});
test("Selector and relationship order must match", () => {
  const rule = sequenceRule(); rule.candidate_selectors[0].child_event_ids.reverse();
  failure(sequenceRun(children(), rule), "sequence_order_mismatch");
});
for (const [name, changes, code] of [
  ["unknown top-level key", { arbitrary_code: "ignored" }, "unsupported_rule_field"],
  ["invalid nested calendar object", { calendar_basis: [] }, "invalid_object"],
  ["invalid rule version", { rule_version: "latest" }, "invalid_rule_version"],
  ["invalid canonical identity", { event_id: "../invalid" }, "invalid_identity"],
  ["runtime activation attempt", { runtime_activation: true }, "activation_forbidden"],
  ["public-output activation attempt", { public_output_allowed: true }, "activation_forbidden"]
]) test(name, () => failure(run(baseRule(changes)), code));
test("Unknown nested selector key is rejected", () => {
  const rule = baseRule(); rule.candidate_selectors[0].execute = "code";
  failure(run(rule), "unsupported_rule_field");
});
test("Implicit multi-selector combinations are rejected", () => {
  const rule = baseRule(); rule.candidate_selectors.push(copy(rule.candidate_selectors[0]));
  failure(run(rule), "unsupported_selector_combination");
});
test("Nonfinite overlap requirement is rejected", () => {
  failure(run(ruleFor("element_overlaps_daypart", { daypart: "evening",
    required_overlap: { minimum_seconds: Infinity } })), "invalid_overlap_requirement");
});
test("Unknown variant policy is rejected", () => {
  const rule = baseRule(); rule.applicability.variant_policy = "automatic";
  failure(run(rule), "unsupported_variant_policy");
});
test("Undeclared variants cannot bypass selection", () => {
  const rule = baseRule(); rule.applicability.variants = [{ variant_id: "smarta",
    countries: ["*"], regions: ["*"], traditions: ["hindu"], sampradayas: ["smarta"] }];
  failure(run(rule), "ambiguous_variant_selection");
});
test("Applicable explicit regional and sampradaya variant succeeds", () => {
  const rule = baseRule(); rule.applicability.variant_policy = "explicit_required";
  rule.applicability.variants = [{ variant_id: "smarta", countries: ["IN"], regions: ["north_india"],
    traditions: ["hindu"], sampradayas: ["smarta"] }];
  const extra = { variant_selection: { variant_id: "smarta" },
    approval_context: { tradition: "hindu", country_code: "IN", region: "north_india", sampradaya: "smarta" } };
  success(run(rule, [syntheticDay()], extra));
  extra.approval_context.sampradaya = "vaishnava";
  failure(run(rule, [syntheticDay()], extra), "inapplicable_rule");
});
test("Geography applicability is enforced", () => {
  const rule = baseRule(); rule.applicability.countries = ["IN"];
  failure(run(rule), "applicability_context_required");
  failure(run(rule, [syntheticDay()], { approval_context: { tradition: "hindu", country_code: "JP" } }), "inapplicable_rule");
});
test("Invalid input shapes return structured failures", () => {
  for (const value of [null, [], {}, { rule: null }]) {
    const result = evaluateAg76FestivalRule(value); closed(result); assert.ok(result.error_code);
  }
});
test("Missing day contexts are incomplete data", () => failure(run(baseRule(), []), "missing_day_context"));
test("Rule-data accessors cannot execute", () => {
  const rule = baseRule(); let accessed = false;
  Object.defineProperty(rule, "calendar_basis", { get() { accessed = true; return {}; }, enumerable: true });
  failure(run(rule), "invalid_data"); assert.equal(accessed, false);
});
for (const value of ["2026-01-01T00:00:00", "2026-02-30T00:00:00Z",
  "2026-01-01T24:00:00Z", "2026-01-01T00:00:00+25:00", "2026-01-01T00:00:00.1234Z", NaN, Infinity]) {
  test("Invalid timestamp rejected: " + String(value), () => {
    const result = normalizeAg76Interval(interval(value, "2026-03-01T00:00:00Z"));
    closed(result); assert.ok(result.error_code);
  });
}
test("Numeric offsets normalize to the same UTC instant", () => {
  const value = normalizeAg76Interval(interval("2026-01-01T05:30:00+05:30", "2026-01-01T06:30:00+05:30"));
  assert.equal(value.start_utc, "2026-01-01T00:00:00.000Z"); closed(value);
});
test("Unverifiable local labels are rejected", () => {
  failure(normalizeAg76Interval({ ...interval("2026-01-01T00:00:00Z", "2026-01-01T01:00:00Z"),
    start_local: "2026-01-01T05:30:00+05:30" }), "unverifiable_local_label");
});
test("Incorrect local label or timezone is rejected", () => {
  failure(normalizeAg76Interval({ ...interval("2026-01-01T00:00:00Z", "2026-01-01T01:00:00Z"),
    start_local: "2026-01-01T00:00:00Z" }, "test", "Asia/Kolkata"), "local_label_mismatch");
});
test("Correct local label is validated against the resolved timezone", () => {
  const result = normalizeAg76Interval({ ...interval("2026-01-01T00:00:00.123Z", "2026-01-01T01:00:00Z"),
    start_local: "2026-01-01T05:30:00.123+05:30" }, "test", "Asia/Kolkata");
  assert.equal(result.start_utc, "2026-01-01T00:00:00.123Z"); closed(result);
});
test("Zero-duration intervals are rejected", () => {
  failure(normalizeAg76Interval(interval("2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z")), "invalid_interval");
});
test("Half-open endpoints and touching intervals", () => {
  const a = interval("2026-01-01T00:00:00Z", "2026-01-01T01:00:00Z");
  assert.equal(ag76IntervalContainsInstant(a, a.start_utc), true);
  assert.equal(ag76IntervalContainsInstant(a, a.end_utc), false);
  const b = interval(a.end_utc, "2026-01-01T02:00:00Z");
  assert.equal(intersectAg76Intervals(a, b), null);
  assert.equal(ag76IntervalsOverlap(a, b), false);
});
test("Conflicting interval aliases are rejected", () => {
  failure(normalizeAg76Interval({ ...interval("2026-01-01T00:00:00Z", "2026-01-01T01:00:00Z"),
    end: "2026-01-01T02:00:00Z" }), "invalid_interval");
});
test("Malformed direct gate calls cannot bypass governance", () => {
  for (const value of [null, { rule: {} }, { rule: baseRule({ source_evidence: [null] }) }]) {
    const result = evaluateAg76ApprovalGate(value); closed(result); assert.ok(result.error_code);
  }
});
test("DSL validator returns structured failures", () => {
  failure(validateAg76RuleDsl(null), "invalid_object");
});
test("Invalid provider adapter input returns a governed failure", () => {
  closed(buildAg76AstronomyDayContext(null));
  failure(ag76AstronomicalPrimitive("2026-01-01T00:00:00"), "invalid_timestamp");
  failure(ag76NextAngularBoundary({ kind: "unknown" }), "unsupported_angle_kind");
});
test("Separate condition occurrences cannot masquerade as a repeated sunrise", () => {
  const days = repeatedDays();
  days[0].elements.tithi.condition_window.end_utc = "2026-01-01T23:00:00.000Z";
  days[1].elements.tithi.condition_window.start_utc = "2026-01-02T01:00:00.000Z";
  failure(run(baseRule(), days), "inconsistent_repeated_sunrise");
});
test("Contradictory repeated-sunrise metadata is rejected", () => {
  const day = syntheticDay(); day.elements.tithi.sunrise_sequence.repeated_into_next = true;
  failure(run(baseRule(), [day]), "inconsistent_repeated_sunrise");
});
test("Selected child candidate must match the child rule identity", () => {
  const values = children(); values.child_b.selected_internal_candidates[0].rule_id = "another_rule";
  failure(sequenceRun(values), "sequence_candidate_identity_mismatch");
});
test("Unexpected child result fields are rejected", () => {
  const values = children(); values.child_b.override = true;
  failure(sequenceRun(values), "unsupported_rule_field");
});
test("Selected child must exist in its own candidate bank", () => {
  const values = children(); values.child_b.candidates = [];
  failure(sequenceRun(values), "sequence_candidate_not_in_result");
});
test("Invalid applicability context cannot pass wildcard scope", () => {
  failure(run(baseRule(), [syntheticDay()], { approval_context: {
    tradition: "hindu", country_code: "not_a_country"
  } }), "invalid_applicability_context");
});
test("Fake public and ritual timing policies are rejected", () => {
  const rule = baseRule(); rule.public_window_policy.window = interval(
    "2026-01-01T00:00:00Z", "2026-01-02T00:00:00Z");
  failure(run(rule), "unsupported_rule_field");
  delete rule.public_window_policy.window;
  rule.ritual_window_policies = [{ ritual_window_id: "synthetic_puja",
    approval_status: "approved", window: interval("2026-01-01T00:00:00Z", "2026-01-01T01:00:00Z") }];
  failure(run(rule), "unsupported_rule_field");
});
test("Nonfinite and invalid element indices are rejected", () => {
  for (const target of [NaN, Infinity, 0, 31, "11"]) {
    failure(run(ruleFor("element_at_sunrise", { target_indices: [target] })), "invalid_element_index");
  }
});
test("Condition intervals duplicated at sunrise are deduplicated", () => {
  const day = syntheticDay(); day.condition_windows.tithi = [{ index: 11,
    interval: copy(day.elements.tithi.condition_window) }];
  const result = run(ruleFor("element_overlaps_daypart", { daypart: "evening" }), [day]);
  success(result); assert.equal(result.candidates.length, 1);
});
test("Conflicting overlapping condition evidence fails closed", () => {
  const day = syntheticDay(); day.condition_windows.tithi = [{ index: 11,
    interval: interval("2026-01-01T10:00:00Z", "2026-01-01T21:00:00Z") }];
  failure(run(ruleFor("element_overlaps_daypart", { daypart: "evening" }), [day]), "conflicting_condition_windows");
});
test("Raw invalid interval data returns governed engine failure", () => {
  const day = syntheticDay(); day.elements.tithi.condition_window.start_utc = "2026-01-01T01:00:00";
  failure(run(baseRule(), [day]), "invalid_timestamp");
});
test("Unknown window approval states are rejected", () => {
  const rule = baseRule(); rule.public_window_policy.approval_status = "ready";
  failure(run(rule), "unknown_governance_state");
});
test("Approved evidence still requires a documented review process", () => {
  const entry = evidence("date_rule"); entry.review_status = "approved";
  failure(run(baseRule({ source_evidence: [entry] })), "invalid_string");
});
function unknownPredecessorDay() {
  const day = syntheticDay("2026-01-02");
  day.elements.tithi.condition_window = interval("2026-01-01T01:00:00.000Z", "2026-01-02T12:00:00.000Z");
  day.neighboring_sunrises.previous = null;
  day.elements.tithi.sunrise_sequence = {
    previous_index: null, current_index: 11, next_index: 12,
    repeated_from_previous: null, repeated_into_next: false,
    unavailable_neighbor_means_unknown: true
  };
  return day;
}
test("Uniqueness: original unknown-predecessor closure probe fails closed", () => {
  const result = run(baseRule(), [unknownPredecessorDay()]);
  failure(result, "insufficient_neighbor_evidence");
  assert.equal(result.selected_internal_candidates.length, 0);
  assert.equal(result.error.detail.direction, "previous");
});
test("Uniqueness: missing predecessor is not confirmed absence", () => {
  const day = unknownPredecessorDay(); delete day.neighboring_sunrises.previous;
  failure(run(baseRule(), [day]), "insufficient_neighbor_evidence");
});
test("Uniqueness: missing predecessor cannot be overridden by false repeat metadata", () => {
  const day = unknownPredecessorDay();
  day.elements.tithi.sunrise_sequence.previous_index = 10;
  day.elements.tithi.sunrise_sequence.repeated_from_previous = false;
  failure(run(baseRule(), [day]), "insufficient_neighbor_evidence");
});
test("Uniqueness: unknown predecessor classification with a known instant proves presence", () => {
  const day = unknownPredecessorDay();
  day.neighboring_sunrises.previous = { civil_date: "2026-01-01",
    sunrise_utc: "2026-01-01T06:00:00.000Z", classification: { tithi: { index: null } } };
  failure(run(baseRule(), [day]), "incomplete_competing_day_scope");
});
test("Uniqueness: relevant unknown successor cannot become a unique selection", () => {
  const day = syntheticDay();
  day.elements.tithi.condition_window.end_utc = "2026-01-02T12:00:00.000Z";
  day.neighboring_sunrises.next = null;
  day.elements.tithi.sunrise_sequence.repeated_into_next = null;
  failure(run(baseRule(), [day]), "incomplete_competing_day_scope");
});
test("Uniqueness: missing successor classification cannot be overridden by false metadata", () => {
  const day = syntheticDay();
  day.elements.tithi.condition_window.end_utc = "2026-01-02T12:00:00.000Z";
  day.neighboring_sunrises.next.classification = {};
  day.elements.tithi.sunrise_sequence.repeated_into_next = false;
  failure(run(baseRule(), [day]), "incomplete_competing_day_scope");
});
test("Uniqueness: unknown successor with multiple possible targets is insufficient", () => {
  const day = syntheticDay(); day.neighboring_sunrises.next.classification = null;
  day.elements.tithi.sunrise_sequence.repeated_into_next = null;
  failure(run(ruleFor("element_at_sunrise", { target_indices: [11, 12] }), [day]),
    "insufficient_neighbor_evidence");
});
test("Uniqueness: confirmed predecessor absence remains eligible", () => {
  const result = run(); success(result);
  assert.equal(result.selected_internal_candidates[0].civil_date, "2026-01-01");
});
test("Uniqueness: confirmed predecessor presence is not unique", () => {
  failure(run(baseRule(), [repeatedDays()[1]]), "incomplete_competing_day_scope");
});
test("Uniqueness: confirmed successor presence is not unique", () => {
  failure(run(baseRule(), [repeatedDays()[0]]), "incomplete_competing_day_scope");
});
test("Uniqueness: both neighbors known absent allow selection", () => {
  const result = run(); success(result);
  assert.equal(result.selected_internal_candidates.length, 1);
});
test("Uniqueness: complete repeated occurrence remains ambiguous in either input order", () => {
  const days = repeatedDays();
  const forward = run(baseRule(), days), reverse = run(baseRule(), [...days].reverse());
  failure(forward, "ambiguous_candidate_selection");
  assert.equal(forward.candidates.length, 2);
  assert.deepEqual(forward, reverse);
});
test("Uniqueness: a single matching day is independent of caller order", () => {
  const first = syntheticDay(), second = syntheticDay("2026-01-02");
  second.elements.tithi.index = 12;
  second.neighboring_sunrises.previous.classification.tithi.index = 11;
  second.neighboring_sunrises.next.classification.tithi.index = 13;
  const forward = run(baseRule(), [first, second]); success(forward);
  assert.deepEqual(forward, run(baseRule(), [second, first]));
});
test("Uniqueness: a condition confined to today proves absence despite missing predecessor", () => {
  const day = syntheticDay(); day.neighboring_sunrises.previous = null;
  day.elements.tithi.sunrise_sequence.repeated_from_previous = null;
  success(run(baseRule(), [day]));
});
test("Uniqueness: complete sunrise interval can replace missing successor classification", () => {
  const day = syntheticDay(); day.neighboring_sunrises.next = null;
  day.elements.tithi.sunrise_sequence.repeated_into_next = null;
  success(run(baseRule(), [day]));
});
test("Uniqueness: both unknown classifications allow a fully bounded alternative proof", () => {
  const day = syntheticDay(); day.neighboring_sunrises = { previous: null, next: null };
  day.elements.tithi.sunrise_sequence.repeated_from_previous = null;
  day.elements.tithi.sunrise_sequence.repeated_into_next = null;
  success(run(baseRule(), [day]));
});
test("Uniqueness: condition ending at next sunrise excludes that instant", () => {
  const day = syntheticDay();
  day.elements.tithi.condition_window.end_utc = day.dayparts.panchang_day.end_utc;
  day.neighboring_sunrises.next.classification.tithi.index = null;
  day.elements.tithi.sunrise_sequence.repeated_into_next = null;
  success(run(baseRule(), [day]));
});
test("Uniqueness: a complete adjacent day supplies alternative predecessor evidence", () => {
  const day = unknownPredecessorDay();
  day.elements.tithi.condition_window.start_utc = "2026-01-01T23:30:00.000Z";
  const previous = syntheticDay(); previous.elements.tithi.index = 10;
  previous.elements.tithi.condition_window.end_utc = "2026-01-01T23:30:00.000Z";
  previous.neighboring_sunrises.previous.classification.tithi.index = 9;
  previous.neighboring_sunrises.next.classification.tithi.index = 11;
  const result = run(baseRule(), [day, previous]); success(result);
  assert.deepEqual(result.candidate_observance_dates, ["2026-01-02"]);
});
test("Deterministic results under UTC, Asia/Kolkata and America/New_York processes", () => {
  const input = { rule: baseRule({ precedence_policy: "prefer_first_candidate" }),
    day_contexts: repeatedDays().reverse(), approval_context: context };
  const uniqueInput = { rule: baseRule(), day_contexts: [syntheticDay()], approval_context: context };
  const unknownInput = { rule: baseRule(), day_contexts: [unknownPredecessorDay()], approval_context: context };
  const script = 'import {evaluateAg76FestivalRule} from "./scripts/lib/ag76-festival-rule-engine.mjs";' +
    'import {normalizeAg76Interval} from "./scripts/lib/ag76-festival-astronomy-adapter.mjs";' +
    'console.log(JSON.stringify({evaluation:evaluateAg76FestivalRule(' + JSON.stringify(input) + '),' +
    'unique:evaluateAg76FestivalRule(' + JSON.stringify(uniqueInput) + '),' +
    'unknown:evaluateAg76FestivalRule(' + JSON.stringify(unknownInput) + '),' +
    'interval:normalizeAg76Interval({start_utc:"2026-01-01T05:30:00+05:30",end_utc:"2026-01-01T06:30:00+05:30"})}));';
  const outputs = ["UTC", "Asia/Kolkata", "America/New_York"].map(TZ => {
    const child = spawnSync(process.execPath, ["--input-type=module", "-e", script],
      { cwd: new URL("..", import.meta.url), encoding: "utf8", env: { ...process.env, TZ } });
    assert.equal(child.status, 0, child.stderr); return child.stdout;
  });
  assert.equal(outputs[0], outputs[1]); assert.equal(outputs[0], outputs[2]);
  const result = JSON.parse(outputs[0]);
  assert.equal(result.evaluation.selected_internal_candidates[0].civil_date, "2026-01-01");
  success(result.unique);
  failure(result.unknown, "insufficient_neighbor_evidence");
});
console.log("AG76 validation passed: " + passed + " focused checks. Synthetic mechanics are not festival-date approvals.");
