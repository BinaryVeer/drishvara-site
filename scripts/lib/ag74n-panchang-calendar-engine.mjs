import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  astronomicalPrimitiveState,
  findNextAngularBoundary
} from "./ag74l-astronomical-engine.mjs";

import {
  addCivilDays,
  formatZonedIso,
  orchestrateAg74mPanchangDay
} from "./ag74m-panchang-day-orchestrator.mjs";

export const AG74N_ENGINE_VERSION = "1.0.0";
export const AG74N_REFERENCE_BOUNDARY_GREGORIAN_YEAR = 2026;
export const AG74N_REFERENCE_SAMVAT_YEAR = 2083;

const DAY_MS = 86400000;
const BASE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const RULE_BANK_PATH =
  "data/knowledge-base/panchang-festival/production/festival-observance-rule-bank.json";

const monthNames = [
  "Chaitra",
  "Vaishakha",
  "Jyeshtha",
  "Ashadha",
  "Shravana",
  "Bhadrapada",
  "Ashvina",
  "Kartika",
  "Margashirsha",
  "Pausha",
  "Magha",
  "Phalguna"
];

const monthKeys = monthNames.map((name) => name.toLowerCase());

function roundNumber(value, digits = 6) {
  return Number(value.toFixed(digits));
}

function readJson(relativePath, root = BASE_DIR) {
  return JSON.parse(
    fs.readFileSync(path.join(root, relativePath), "utf8")
  );
}

function parseDateKey(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new TypeError("Expected YYYY-MM-DD date key.");
  }
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError("Invalid Gregorian date key.");
  }
  return date;
}

function rangeDateKeys(startDateKey, endDateKeyExclusive) {
  const start = parseDateKey(startDateKey).getTime();
  const end = parseDateKey(endDateKeyExclusive).getTime();
  const output = [];
  for (let ms = start; ms < end; ms += DAY_MS) {
    output.push(new Date(ms).toISOString().slice(0, 10));
  }
  return output;
}

export function monthIdentity(index) {
  const normalized = ((index % 12) + 12) % 12;
  return {
    canonical_index: normalized,
    canonical_key: monthKeys[normalized],
    canonical_name: monthNames[normalized]
  };
}

export function classifyLunarInterval(
  solarSignAtStartIndex,
  solarIngressCount
) {
  if (
    !Number.isInteger(solarSignAtStartIndex) ||
    solarSignAtStartIndex < 0 ||
    solarSignAtStartIndex > 11
  ) {
    throw new RangeError(
      "Solar-sign index must be an integer from 0 through 11."
    );
  }
  if (
    !Number.isInteger(solarIngressCount) ||
    solarIngressCount < 0 ||
    solarIngressCount > 2
  ) {
    throw new RangeError(
      "Solar-ingress count must be 0, 1 or 2."
    );
  }

  const month = monthIdentity(solarSignAtStartIndex + 1);
  return {
    ...month,
    instance_kind:
      solarIngressCount === 0 ? "adhika" : "regular",
    kshaya_after:
      solarIngressCount === 2
        ? monthIdentity(month.canonical_index + 1)
        : null,
    month_rule_trace:
      solarIngressCount === 0
        ? "no_solar_ingress_adhika"
        : solarIngressCount === 2
          ? "two_solar_ingresses_kshaya_after"
          : "one_solar_ingress_regular"
  };
}

function nextNewMoonAfter(startUtc) {
  return findNextAngularBoundary({
    kind: "moon_sun_elongation",
    target_degrees: 0,
    start_utc: startUtc,
    max_days: 40,
    step_hours: 3,
    tolerance_seconds: 0.5
  });
}

function nextSolarIngressAfter(startUtc, currentLongitude) {
  const nextTarget =
    (Math.floor(currentLongitude / 30) + 1) * 30;
  return findNextAngularBoundary({
    kind: "sidereal_sun_longitude",
    target_degrees: nextTarget % 360,
    start_utc: startUtc,
    max_days: 40,
    step_hours: 6,
    tolerance_seconds: 0.5
  });
}

export function generateNewMoonSequence(
  startUtc,
  endUtc
) {
  const startMs = Date.parse(startUtc);
  const endMs = Date.parse(endUtc);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    throw new TypeError("Invalid new-moon sequence range.");
  }
  if (!(endMs > startMs)) {
    throw new RangeError("New-moon range must be positive.");
  }

  const output = [];
  let cursor = new Date(startMs - 1000).toISOString();

  while (true) {
    const event = nextNewMoonAfter(cursor);
    const eventMs = Date.parse(event.event_utc);
    if (eventMs >= endMs) break;
    if (eventMs >= startMs) {
      output.push({
        utc: event.event_utc,
        angle_residual_degrees:
          event.angle_residual_degrees,
        final_bracket_seconds:
          event.final_bracket_seconds
      });
    }
    cursor = new Date(eventMs + 1000).toISOString();
  }

  return output;
}

export function generateSolarIngressSequence(
  startUtc,
  endUtc
) {
  const startMs = Date.parse(startUtc);
  const endMs = Date.parse(endUtc);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    throw new TypeError("Invalid solar-ingress range.");
  }
  if (!(endMs > startMs)) {
    throw new RangeError("Solar-ingress range must be positive.");
  }

  const output = [];
  let cursorMs = startMs;

  while (cursorMs < endMs) {
    const state = astronomicalPrimitiveState(
      new Date(cursorMs)
    );
    const event = nextSolarIngressAfter(
      new Date(cursorMs).toISOString(),
      state.sun_longitude_sidereal
    );
    const eventMs = Date.parse(event.event_utc);
    if (eventMs >= endMs) break;
    const eventState = astronomicalPrimitiveState(
      new Date(eventMs + 1000)
    );
    const signIndex = Math.floor(
      eventState.sun_longitude_sidereal / 30
    );
    output.push({
      utc: event.event_utc,
      entered_sidereal_sign_index: signIndex,
      entered_sidereal_sign_number: signIndex + 1,
      target_degrees: event.target_degrees,
      angle_residual_degrees:
        event.angle_residual_degrees,
      final_bracket_seconds:
        event.final_bracket_seconds
    });
    cursorMs = eventMs + 1000;
  }

  return output;
}

export function buildAmantaMonthIntervals(
  startUtc,
  endUtc
) {
  const startMs = Date.parse(startUtc);
  const endMs = Date.parse(endUtc);
  const paddedStart = new Date(
    startMs - 45 * DAY_MS
  ).toISOString();
  const paddedEnd = new Date(
    endMs + 45 * DAY_MS
  ).toISOString();

  const newMoons = generateNewMoonSequence(
    paddedStart,
    paddedEnd
  );
  if (newMoons.length < 3) {
    throw new Error("Insufficient new moons for month allocation.");
  }

  const ingresses = generateSolarIngressSequence(
    paddedStart,
    paddedEnd
  );

  const intervals = [];
  for (let index = 0; index < newMoons.length - 1; index += 1) {
    const start = newMoons[index];
    const end = newMoons[index + 1];
    const intervalStartMs = Date.parse(start.utc);
    const intervalEndMs = Date.parse(end.utc);
    const startState = astronomicalPrimitiveState(
      new Date(intervalStartMs + 1000)
    );
    const startSign = Math.floor(
      startState.sun_longitude_sidereal / 30
    );
    const intervalIngresses = ingresses.filter((entry) => {
      const ms = Date.parse(entry.utc);
      return ms > intervalStartMs && ms < intervalEndMs;
    });
    const ingressCount = intervalIngresses.length;
    if (ingressCount > 2) {
      throw new Error(
        "Unexpected more-than-two solar ingresses in one lunar interval."
      );
    }

    const classification = classifyLunarInterval(
      startSign,
      ingressCount
    );
    const interval = {
      interval_id:
        `amanta_${start.utc.slice(0, 10).replaceAll("-", "")}`,
      start_new_moon_utc: start.utc,
      end_new_moon_utc: end.utc,
      start_ms: intervalStartMs,
      end_ms: intervalEndMs,
      ...classification,
      solar_sign_at_start_index: startSign,
      solar_ingress_count: ingressCount,
      solar_ingresses: intervalIngresses
    };
    intervals.push(interval);
  }

  for (let index = 1; index < intervals.length; index += 1) {
    const previous = intervals[index - 1];
    const current = intervals[index];
    if (
      previous.instance_kind === "adhika" &&
      previous.canonical_index === current.canonical_index &&
      current.instance_kind === "regular"
    ) {
      current.instance_kind = "nija";
      current.month_rule_trace =
        "regular_instance_following_same_named_adhika";
    }
  }

  return {
    new_moons: newMoons,
    solar_ingresses: ingresses,
    intervals
  };
}

function findIntervalIndex(intervals, instantMs) {
  let low = 0;
  let high = intervals.length - 1;
  while (low <= high) {
    const midpoint = Math.floor((low + high) / 2);
    const interval = intervals[midpoint];
    if (instantMs < interval.start_ms) {
      high = midpoint - 1;
    } else if (instantMs >= interval.end_ms) {
      low = midpoint + 1;
    } else {
      return midpoint;
    }
  }
  return -1;
}

export function assignPurnimantaMonth(
  dailyRecord,
  monthModel
) {
  if (
    dailyRecord.status !==
    "ag74m_internal_day_orchestration_computed_public_blocked"
  ) {
    return {
      available: false,
      reason: dailyRecord.availability_reason || dailyRecord.status
    };
  }

  const sunriseMs = Date.parse(dailyRecord.sunrise.utc);
  const intervalIndex = findIntervalIndex(
    monthModel.intervals,
    sunriseMs
  );
  if (intervalIndex < 0) {
    throw new Error("No Amanta interval contains the sunrise instant.");
  }

  const isShukla = dailyRecord.elements.tithi.index <= 15;
  const sourceIndex = isShukla
    ? intervalIndex
    : intervalIndex + 1;
  const source = monthModel.intervals[sourceIndex];
  if (!source) {
    throw new Error("Missing next Amanta interval for Krishna allocation.");
  }

  return {
    available: true,
    convention: "purnimanta",
    canonical_index: source.canonical_index,
    canonical_key: source.canonical_key,
    canonical_name: source.canonical_name,
    instance_kind: source.instance_kind,
    purnimanta_instance_id:
      `purnimanta_${source.interval_id}`,
    source_amanta_interval_id: source.interval_id,
    source_amanta_start_new_moon_utc:
      source.start_new_moon_utc,
    source_amanta_end_new_moon_utc:
      source.end_new_moon_utc,
    source_solar_ingress_count:
      source.solar_ingress_count,
    source_kshaya_after: source.kshaya_after,
    paksha_segment: isShukla
      ? "shukla_paksha"
      : "krishna_paksha",
    assignment_rule: isShukla
      ? "shukla_uses_current_amanta_month_identity"
      : "krishna_uses_next_amanta_month_identity"
  };
}

function compactDailyRecord(dailyRecord, month, samvatYear) {
  return {
    civil_date: dailyRecord.civil_date,
    samvat_year: samvatYear,
    sunrise_utc: dailyRecord.sunrise.utc,
    sunrise_local: dailyRecord.sunrise.local,
    sunset_utc: dailyRecord.sunset?.utc ?? null,
    sunset_local: dailyRecord.sunset?.local ?? null,
    vara: dailyRecord.vara,
    paksha: dailyRecord.paksha,
    tithi: {
      index: dailyRecord.elements.tithi.index,
      name: dailyRecord.elements.tithi.name,
      previous_transition:
        dailyRecord.elements.tithi.previous_transition,
      next_transition:
        dailyRecord.elements.tithi.next_transition,
      sunrise_sequence:
        dailyRecord.elements.tithi.sunrise_sequence
    },
    nakshatra: {
      index: dailyRecord.elements.nakshatra.index,
      name: dailyRecord.elements.nakshatra.name
    },
    yoga: {
      index: dailyRecord.elements.yoga.index,
      name: dailyRecord.elements.yoga.name
    },
    karana: {
      index: dailyRecord.elements.karana.index,
      name: dailyRecord.elements.karana.name
    },
    lunar_month: month,
    public_output_allowed: false
  };
}

function createDailyCache() {
  const cache = new Map();
  return {
    get(dateKey) {
      if (!cache.has(dateKey)) {
        cache.set(
          dateKey,
          orchestrateAg74mPanchangDay({
            mode: "named_location",
            civil_date: dateKey,
            canonical_location_id: "varanasi_in"
          })
        );
      }
      return cache.get(dateKey);
    },
    size() {
      return cache.size;
    }
  };
}

function findChaitraBoundary(
  gregorianYear,
  monthModel,
  dailyCache
) {
  const chaitraIntervals = monthModel.intervals.filter(
    (interval) => {
      const startDate = interval.start_new_moon_utc.slice(0, 10);
      return (
        interval.canonical_index === 0 &&
        interval.instance_kind !== "adhika" &&
        startDate >= `${gregorianYear}-03-01` &&
        startDate <= `${gregorianYear}-05-15`
      );
    }
  );

  if (chaitraIntervals.length !== 1) {
    return {
      available: false,
      status:
        "non_adhika_chaitra_new_moon_boundary_not_unique_review_required",
      gregorian_year: gregorianYear,
      candidate_interval_ids: chaitraIntervals.map(
        (interval) => interval.interval_id
      )
    };
  }

  const interval = chaitraIntervals[0];
  const startMs = Date.parse(interval.start_new_moon_utc);
  const startLocal = formatZonedIso(startMs, "Asia/Kolkata");
  const eventCivilDate = startLocal.slice(0, 10);
  const pratipadaEnd = findNextAngularBoundary({
    kind: "moon_sun_elongation",
    target_degrees: 12,
    start_utc: new Date(startMs + 1000),
    max_days: 3,
    step_hours: 1,
    tolerance_seconds: 0.5
  });

  const sunriseCandidates = [];
  for (const dateKey of [
    addCivilDays(eventCivilDate, -1),
    eventCivilDate,
    addCivilDays(eventCivilDate, 1),
    addCivilDays(eventCivilDate, 2)
  ]) {
    const daily = dailyCache.get(dateKey);
    if (
      daily.status ===
        "ag74m_internal_day_orchestration_computed_public_blocked" &&
      daily.elements.tithi.index === 1
    ) {
      sunriseCandidates.push({
        civil_date: dateKey,
        sunrise_utc: daily.sunrise.utc,
        sunrise_local: daily.sunrise.local
      });
    }
  }

  const civilDate =
    sunriseCandidates.length > 0
      ? sunriseCandidates[0].civil_date
      : eventCivilDate;
  const selectedDay = dailyCache.get(civilDate);
  const skippedAtSunrise = sunriseCandidates.length === 0;
  const repeatedAtSunrise = sunriseCandidates.length > 1;

  return {
    available: true,
    civil_date: civilDate,
    event_civil_date: eventCivilDate,
    chaitra_shukla_pratipada_start_utc:
      interval.start_new_moon_utc,
    chaitra_shukla_pratipada_start_local: startLocal,
    chaitra_shukla_pratipada_end_utc:
      pratipadaEnd.event_utc,
    chaitra_shukla_pratipada_end_local:
      formatZonedIso(
        Date.parse(pratipadaEnd.event_utc),
        "Asia/Kolkata"
      ),
    selected_date_sunrise_utc:
      selectedDay.sunrise?.utc ?? null,
    selected_date_sunrise_local:
      selectedDay.sunrise?.local ?? null,
    selected_date_tithi_at_sunrise:
      selectedDay.elements?.tithi
        ? {
            index: selectedDay.elements.tithi.index,
            name: selectedDay.elements.tithi.name
          }
        : null,
    samvat_year: gregorianYear + 57,
    allocation_status: skippedAtSunrise
      ? "pratipada_skipped_at_sunrise_event_civil_date_selected_internal"
      : repeatedAtSunrise
        ? "pratipada_repeated_at_sunrise_first_sunrise_selected_internal"
        : "unique_pratipada_at_sunrise",
    sunrise_candidate_dates: sunriseCandidates.map(
      (entry) => entry.civil_date
    ),
    month_instance_kind: interval.instance_kind,
    source_amanta_interval_id: interval.interval_id,
    rule:
      "non_adhika_chaitra_pratipada_event_date_with_sunrise_presence_priority_and_skipped_tithi_fallback",
    public_rule_approval: false,
    final_external_comparison_required_in_ag74p: true
  };
}

function createMonthSegments(dailyRecords) {
  const groups = new Map();
  for (const day of dailyRecords) {
    const month = day.lunar_month;
    if (!month.available) continue;
    const key = month.purnimanta_instance_id;
    if (!groups.has(key)) {
      groups.set(key, {
        source_instance_id: key,
        canonical_index: month.canonical_index,
        canonical_key: month.canonical_key,
        canonical_name: month.canonical_name,
        instance_kind: month.instance_kind,
        source_amanta_interval_id:
          month.source_amanta_interval_id,
        source_solar_ingress_count:
          month.source_solar_ingress_count,
        source_kshaya_after: month.source_kshaya_after,
        date_keys: []
      });
    }
    groups.get(key).date_keys.push(day.civil_date);
  }

  return [...groups.values()].map((group) => ({
    ...group,
    start_civil_date: group.date_keys[0],
    end_civil_date: group.date_keys.at(-1),
    day_count: group.date_keys.length,
    first_paksha: dailyRecords.find(
      (day) => day.civil_date === group.date_keys[0]
    ).paksha,
    last_paksha: dailyRecords.find(
      (day) => day.civil_date === group.date_keys.at(-1)
    ).paksha,
    is_partial:
      group.date_keys.length < 25,
    date_keys: undefined
  }));
}

function mergeChaitraEdgeSegments(segments) {
  const regular = segments.filter(
    (segment) => segment.instance_kind !== "adhika"
  );
  const adhika = segments.filter(
    (segment) => segment.instance_kind === "adhika"
  );

  const output = [...adhika];
  if (regular.length === 0) return output;
  if (regular.length === 1) return [...output, regular[0]];

  output.push({
    reporting_instance_id:
      "chaitra_regular_year_edge_composite",
    canonical_index: 0,
    canonical_key: "chaitra",
    canonical_name: "Chaitra",
    instance_kind: "regular",
    year_edge_split: true,
    source_instance_ids: regular.map(
      (segment) => segment.source_instance_id
    ),
    segments: regular.map((segment, index) => ({
      ...segment,
      year_edge_role:
        index === 0
          ? "opening_chaitra_boundary_segment"
          : "closing_chaitra_krishna_segment",
      contains_boundary_split_civil_date: index === 0
    })),
    start_civil_date: regular[0].start_civil_date,
    end_civil_date: regular.at(-1).end_civil_date,
    day_count: regular.reduce(
      (sum, segment) => sum + segment.day_count,
      0
    ),
    is_partial: true
  });
  return output;
}

export function buildBookPages(dailyRecords, monthModel) {
  const segments = createMonthSegments(dailyRecords);
  const kshayaIndices = new Set();
  for (const interval of monthModel.intervals) {
    if (interval.kshaya_after) {
      kshayaIndices.add(
        interval.kshaya_after.canonical_index
      );
    }
  }

  const slots = monthNames.map((name, index) => {
    let instances = segments.filter(
      (segment) => segment.canonical_index === index
    );
    if (index === 0) {
      instances = mergeChaitraEdgeSegments(instances);
    }
    const hasAdhika = instances.some(
      (instance) => instance.instance_kind === "adhika"
    );
    const hasRegular = instances.some(
      (instance) => instance.instance_kind !== "adhika"
    );
    const kshaya =
      instances.length === 0 && kshayaIndices.has(index);

    let slotStatus = "one_regular";
    if (kshaya) slotStatus = "zero_for_kshaya";
    else if (hasAdhika && hasRegular) {
      slotStatus = "two_adhika_plus_nija";
    } else if (hasAdhika) {
      slotStatus = "adhika_only_edge_case_review_required";
    }

    return {
      canonical_index: index,
      canonical_key: monthKeys[index],
      canonical_name: name,
      page_number: Math.floor(index / 3) + 1,
      slot_number_on_page: (index % 3) + 1,
      slot_status: slotStatus,
      kshaya_exception: kshaya,
      instance_count: instances.length,
      instances
    };
  });

  return [0, 1, 2, 3].map((pageIndex) => ({
    page_number: pageIndex + 1,
    canonical_slot_count: 3,
    slots: slots.slice(pageIndex * 3, pageIndex * 3 + 3)
  }));
}

function normaliseRule(rule) {
  return {
    ...rule,
    source_reference: `${RULE_BANK_PATH}#${rule.rule_id}`,
    rule_family: rule.rule_type,
    location_basis: "varanasi_in",
    timezone_basis: "Asia/Kolkata",
    regional_or_sampradaya_variant:
      "north_india_varanasi_kashi_general_internal_candidate",
    methodology_version: "ag74j_varanasi_standard_v1",
    public_output_approval: false,
    traditional_source_review_status:
      rule.source_status ===
      "internal_rule_model_pending_traditional_source_review"
        ? "pending"
        : "unknown"
  };
}

function conditionWindow(day) {
  return {
    start_utc: day.tithi.previous_transition.utc,
    start_local: day.tithi.previous_transition.local,
    end_utc: day.tithi.next_transition.utc,
    end_local: day.tithi.next_transition.local,
    semantic_layer: "condition_window"
  };
}

function dependencyStatus(rule) {
  if (rule.observance_key === "trayodashi_pradosha") {
    return {
      dependency: "reviewed_pradosha_formula",
      status: "unavailable_pending_source_review",
      public_window: null,
      ritual_window: null
    };
  }
  if (rule.observance_key === "sankashti_chaturthi") {
    return {
      dependency: "moonrise_overlap",
      status: "unavailable_moonrise_not_in_ag74m",
      public_window: null,
      ritual_window: null
    };
  }
  if (rule.observance_key === "masik_shivaratri") {
    return {
      dependency: "reviewed_night_window",
      status: "unavailable_pending_source_review",
      public_window: null,
      ritual_window: null
    };
  }
  if (rule.observance_key === "ekadashi") {
    return {
      dependency: "separate_parana_rule",
      status: "condition_candidate_only_parana_withheld",
      public_window: null,
      ritual_window: null
    };
  }
  return {
    dependency: "tithi_condition_only",
    status: "condition_candidate_available",
    public_window: null,
    ritual_window: null
  };
}

function buildObservanceCandidates(dailyRecords, root) {
  const bank = readJson(RULE_BANK_PATH, root);
  const rules = bank.records.map(normaliseRule);
  const candidates = [];
  const skippedConflicts = [];

  for (const day of dailyRecords) {
    for (const rule of rules) {
      const matches =
        rule.trigger.tithi_indices.includes(day.tithi.index) &&
        rule.trigger.paksha_values.includes(day.paksha);

      if (matches) {
        const repeated =
          day.tithi.sunrise_sequence.repeated_from_previous === true ||
          day.tithi.sunrise_sequence.repeated_into_next === true;
        candidates.push({
          candidate_id:
            `ag74n_${rule.observance_key}_${day.civil_date}`,
          rule_id: rule.rule_id,
          observance_key: rule.observance_key,
          display_name: rule.display_name,
          civil_date_candidate: day.civil_date,
          lunar_month: day.lunar_month,
          samvat_year: day.samvat_year,
          tithi: {
            index: day.tithi.index,
            name: day.tithi.name
          },
          paksha: day.paksha,
          condition_window: conditionWindow(day),
          observance_date_status: repeated
            ? "repeated_tithi_conflict_review_required"
            : "unique_sunrise_condition_candidate",
          repeated_tithi: repeated,
          dependency: dependencyStatus(rule),
          source_reference: rule.source_reference,
          traditional_source_review_status:
            rule.traditional_source_review_status,
          final_observance_date_approved: false,
          primary_public_window: null,
          ritual_window: null,
          public_output_allowed: false
        });
      }

      const skipped =
        day.tithi.sunrise_sequence
          .skipped_before_current_indices || [];
      for (const target of rule.trigger.tithi_indices) {
        if (skipped.includes(target)) {
          skippedConflicts.push({
            conflict_id:
              `ag74n_skipped_${rule.observance_key}_${day.civil_date}_${target}`,
            rule_id: rule.rule_id,
            observance_key: rule.observance_key,
            display_name: rule.display_name,
            skipped_tithi_index: target,
            detected_before_civil_date: day.civil_date,
            selection_status:
              "skipped_tithi_observance_date_review_required",
            condition_window: null,
            primary_public_window: null,
            ritual_window: null,
            source_reference: rule.source_reference,
            traditional_source_review_status:
              rule.traditional_source_review_status,
            final_observance_date_approved: false,
            public_output_allowed: false
          });
        }
      }
    }
  }

  return {
    source_rule_bank: RULE_BANK_PATH,
    source_rule_bank_status: bank.status,
    normalized_rule_count: rules.length,
    source_reviewed_rule_count: rules.filter(
      (rule) =>
        rule.traditional_source_review_status === "approved"
    ).length,
    condition_candidate_count: candidates.length,
    skipped_conflict_count: skippedConflicts.length,
    final_observance_date_approved_count: 0,
    candidates,
    skipped_conflicts: skippedConflicts
  };
}

export function generateVaranasiSamvatYear(
  boundaryGregorianYear,
  options = {}
) {
  if (
    !Number.isInteger(boundaryGregorianYear) ||
    boundaryGregorianYear < 1900 ||
    boundaryGregorianYear > 2099
  ) {
    throw new RangeError(
      "Complete AG74N Samvat-year generation supports boundary years 1900 through 2099."
    );
  }

  const root = options.root || BASE_DIR;
  const modelStart = `${boundaryGregorianYear}-01-01T00:00:00.000Z`;
  const modelEnd = `${boundaryGregorianYear + 1}-06-15T00:00:00.000Z`;
  const monthModel = buildAmantaMonthIntervals(
    modelStart,
    modelEnd
  );
  const dailyCache = createDailyCache();
  const startBoundary = findChaitraBoundary(
    boundaryGregorianYear,
    monthModel,
    dailyCache
  );
  const endBoundary = findChaitraBoundary(
    boundaryGregorianYear + 1,
    monthModel,
    dailyCache
  );

  if (!startBoundary.available || !endBoundary.available) {
    return {
      status:
        "ag74n_samvat_year_boundary_unavailable_public_blocked",
      boundary_gregorian_year: boundaryGregorianYear,
      start_boundary: startBoundary,
      end_boundary: endBoundary,
      public_output_allowed: false
    };
  }

  const samvatYear = startBoundary.samvat_year;
  const dailyRecords = [];

  for (const dateKey of rangeDateKeys(
    startBoundary.civil_date,
    endBoundary.civil_date
  )) {
    const daily = dailyCache.get(dateKey);
    if (
      daily.status !==
      "ag74m_internal_day_orchestration_computed_public_blocked"
    ) {
      throw new Error(
        `AG74N cannot generate ${dateKey}: ${daily.status}`
      );
    }
    const month = assignPurnimantaMonth(
      daily,
      monthModel
    );
    dailyRecords.push(
      compactDailyRecord(daily, month, samvatYear)
    );
  }

  const pages = buildBookPages(dailyRecords, monthModel);
  const observances = buildObservanceCandidates(
    dailyRecords,
    root
  );

  return {
    module_id: "AG74N",
    title:
      `Varanasi Panchang Annual Calendar — Vikram Samvat ${samvatYear}`,
    status:
      "ag74n_internal_annual_calendar_generated_public_blocked",
    engine_version: AG74N_ENGINE_VERSION,
    profile: {
      place_id: "varanasi_in",
      display_label: "Varanasi / Banaras",
      timezone: "Asia/Kolkata",
      lunar_month_convention: "purnimanta",
      hindu_year_system: "vikram_samvat",
      hindu_year_style: "chaitradi",
      astronomical_profile: "modern_drik",
      ayanamsha: "lahiri_chitrapaksha"
    },
    samvat_year: samvatYear,
    boundary_gregorian_year: boundaryGregorianYear,
    start_boundary: startBoundary,
    end_boundary_exclusive: endBoundary,
    civil_day_count: dailyRecords.length,
    daily_record_count: dailyRecords.length,
    daily_records: dailyRecords,
    month_model_summary: {
      new_moon_count: monthModel.new_moons.length,
      solar_ingress_count:
        monthModel.solar_ingresses.length,
      amanta_interval_count:
        monthModel.intervals.length,
      adhika_interval_count:
        monthModel.intervals.filter(
          (interval) => interval.instance_kind === "adhika"
        ).length,
      nija_interval_count:
        monthModel.intervals.filter(
          (interval) => interval.instance_kind === "nija"
        ).length,
      kshaya_exception_count:
        monthModel.intervals.filter(
          (interval) => interval.kshaya_after
        ).length
    },
    annual_book: {
      physical_page_count: 4,
      canonical_slots_per_page: 3,
      canonical_slot_count: 12,
      physical_month_record_count_fixed: false,
      pages
    },
    festival_observance_result_bank: observances,
    trace: {
      AG74M_daily_orchestrations_cached: dailyCache.size(),
      month_naming_basis:
        "Amanta new-moon interval solar-ingress identity mapped to Purnimanta Krishna-next/Shukla-current semantics",
      samvat_boundary_basis:
        "first non-Adhika Chaitra Shukla Pratipada present at Varanasi sunrise",
      samvat_epoch_relation:
        "boundary Gregorian year plus 57 after event-based boundary resolution",
      Chaitra_year_edge_handling:
        "opening Shukla and closing Krishna segments explicit in canonical Chaitra reporting slot",
      festival_rule_admission:
        "AG70M rules may produce internal condition candidates; source-pending rules cannot approve final observance dates or ritual/public windows"
    },
    public_output_allowed: false,
    public_ui_modified: false,
    CSS_modified: false,
    backend_service_deployed: false,
    Supabase_activation_performed: false,
    external_ephemeris_API_used: false,
    personal_location_storage_performed: false
  };
}
