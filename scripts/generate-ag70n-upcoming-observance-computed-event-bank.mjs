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

const ag70m = readJson("data/content-intelligence/quality-reviews/ag70m-festival-observance-rule-bank.json");
const validatedDailyBank = readJson("data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json");
const ruleBank = readJson("data/knowledge-base/panchang-festival/production/festival-observance-rule-bank.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70m.status !== "ag70m_festival_observance_rule_bank_completed") {
  throw new Error("AG70M must be complete before AG70N.");
}
if (ag70m.summary?.ready_for_ag70n !== true) {
  throw new Error("AG70M readiness for AG70N is missing.");
}
if (validatedDailyBank.status !== "panchang_daily_calculation_bank_batch_01_internally_validated_public_blocked") {
  throw new Error("AG70N requires internally validated Panchang daily bank.");
}
if (ruleBank.status !== "festival_observance_rule_bank_batch_01_created_event_publication_blocked") {
  throw new Error("AG70N requires AG70M rule bank.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  eventBank: "data/knowledge-base/upcoming-observance/production/observance-event-bank.json",
  eventBankBatch: "data/knowledge-base/upcoming-observance/production/upcoming-observance-computed-event-bank-batch-01.json",
  panchangEventBankMirror: "data/knowledge-base/panchang-festival/production/upcoming-observance-computed-event-bank-batch-01.json",
  ruleApplicationReport: "data/knowledge-base/panchang-festival/production/ag70n-observance-rule-application-report.json",
  trayodashiPradoshaWindowReport: "data/knowledge-base/panchang-festival/production/ag70n-trayodashi-pradosha-window-report.json",
  noPublicationAudit: "data/knowledge-base/upcoming-observance/production/ag70n-no-observance-publication-audit.json",
  noExternalSourceAudit: "data/knowledge-base/upcoming-observance/production/ag70n-no-external-panchang-source-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  upcomingManifest: "data/knowledge-base/upcoming-observance/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70n-upcoming-observance-computed-event-bank.json",
  readiness: "data/content-intelligence/quality-registry/ag70n-ag70o-eclipse-computation-event-bank-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70n-to-ag70o-eclipse-computation-event-bank-boundary.json",
  quality: "data/quality/ag70n-upcoming-observance-computed-event-bank.json",
  preview: "data/quality/ag70n-upcoming-observance-computed-event-bank-preview.json",
  doc: "docs/quality/AG70N_UPCOMING_OBSERVANCE_COMPUTED_EVENT_BANK.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

function parseMs(value) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function addMinutes(ms, minutes) {
  return ms + minutes * 60 * 1000;
}

function isoLocalFromMs(ms) {
  const d = new Date(ms);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+05:30`;
}

function localStringToComparableMs(localString) {
  if (!localString) return null;
  return new Date(localString).getTime();
}

function windowsOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function eventId(rule, dailyRecord) {
  return `ag70n_evt_${rule.observance_key}_${dailyRecord.date_key.replaceAll("-", "")}_${dailyRecord.location_id}`;
}

function tithiPakshaMatch(rule, dailyRecord) {
  return rule.trigger?.tithi_indices?.includes(dailyRecord.tithi?.index)
    && rule.trigger?.paksha_values?.includes(dailyRecord.paksha);
}

function pradoshaWindowCandidate(rule, dailyRecord) {
  const tithiStart = localStringToComparableMs(dailyRecord.tithi_start_datetime_local);
  const tithiEnd = localStringToComparableMs(dailyRecord.tithi_end_datetime_local);
  const sunset = localStringToComparableMs(dailyRecord.sunset_datetime_local);

  if (!Number.isFinite(tithiStart) || !Number.isFinite(tithiEnd) || !Number.isFinite(sunset)) {
    return {
      eligible: false,
      reason: "missing_tithi_or_sunset_window",
      pradosha_window_start_local: null,
      pradosha_window_end_local: null
    };
  }

  const pradoshaStart = addMinutes(sunset, -90);
  const pradoshaEnd = addMinutes(sunset, 90);
  const eligible = windowsOverlap(tithiStart, tithiEnd, pradoshaStart, pradoshaEnd);

  return {
    eligible,
    reason: eligible ? "trayodashi_overlaps_pradosha_evening_window" : "trayodashi_does_not_overlap_pradosha_evening_window",
    pradosha_window_start_local: isoLocalFromMs(pradoshaStart),
    pradosha_window_end_local: isoLocalFromMs(pradoshaEnd)
  };
}

const applicationRecords = [];
const eventRecords = [];
const pradoshaWindowRecords = [];

for (const dailyRecord of validatedDailyBank.records) {
  for (const rule of ruleBank.records) {
    const baseMatch = tithiPakshaMatch(rule, dailyRecord);
    let eligible = baseMatch;
    let reason = baseMatch ? "tithi_paksha_match" : "tithi_paksha_no_match";
    let eventStart = dailyRecord.tithi_start_datetime_local;
    let eventEnd = dailyRecord.tithi_end_datetime_local;
    let extraWindow = null;

    if (baseMatch && rule.observance_key === "trayodashi_pradosha") {
      const window = pradoshaWindowCandidate(rule, dailyRecord);
      eligible = window.eligible;
      reason = window.reason;
      extraWindow = window;
      eventStart = window.pradosha_window_start_local || eventStart;
      eventEnd = window.pradosha_window_end_local || eventEnd;

      pradoshaWindowRecords.push({
        date_key: dailyRecord.date_key,
        panchang_daily_record_id: dailyRecord.panchang_daily_record_id,
        tithi_index: dailyRecord.tithi?.index,
        paksha: dailyRecord.paksha,
        tithi_start_datetime_local: dailyRecord.tithi_start_datetime_local,
        tithi_end_datetime_local: dailyRecord.tithi_end_datetime_local,
        sunset_datetime_local: dailyRecord.sunset_datetime_local,
        ...window
      });
    }

    applicationRecords.push({
      date_key: dailyRecord.date_key,
      panchang_daily_record_id: dailyRecord.panchang_daily_record_id,
      rule_id: rule.rule_id,
      observance_key: rule.observance_key,
      display_name: rule.display_name,
      tithi_index: dailyRecord.tithi?.index,
      paksha: dailyRecord.paksha,
      matched: eligible,
      match_reason: reason
    });

    if (eligible) {
      eventRecords.push({
        observance_event_id: eventId(rule, dailyRecord),
        batch_id: "ag70n_batch_01_itanagar_20260608_20260614",
        source_rule_id: rule.rule_id,
        observance_key: rule.observance_key,
        display_name: rule.display_name,
        event_type: "internal_observance_candidate",
        event_status: "computed_internal_candidate_public_blocked",
        date_key: dailyRecord.date_key,
        location_id: dailyRecord.location_id,
        timezone: dailyRecord.timezone,
        latitude_decimal: dailyRecord.latitude_decimal,
        longitude_decimal: dailyRecord.longitude_decimal,
        panchang_daily_record_id: dailyRecord.panchang_daily_record_id,
        tithi: dailyRecord.tithi,
        paksha: dailyRecord.paksha,
        event_window_basis: rule.event_window_basis,
        event_start_datetime_local: eventStart,
        event_end_datetime_local: eventEnd,
        tithi_start_datetime_local: dailyRecord.tithi_start_datetime_local,
        tithi_end_datetime_local: dailyRecord.tithi_end_datetime_local,
        sunset_datetime_local: dailyRecord.sunset_datetime_local,
        pradosha_window: extraWindow,
        computed_from_internal_panchang: true,
        external_panchang_source_used: false,
        external_panchang_validation_status: "not_started_manual_comparison_only_later",
        public_output_allowed: false,
        publication_status: "blocked",
        context_interpretation_allowed_now: false,
        review_status: "internal_candidate_created_public_blocked"
      });
    }
  }
}

const uniqueEventIds = new Set(eventRecords.map((x) => x.observance_event_id));
if (uniqueEventIds.size !== eventRecords.length) {
  throw new Error("Duplicate observance event ids generated.");
}

const eventBank = {
  module_id: "AG70N",
  title: "Upcoming Observance Computed Event Bank",
  status: "upcoming_observance_computed_event_bank_batch_01_created_public_blocked",
  purpose: "Create internal observance candidate event records by applying AG70M rules to AG70L internally validated Panchang records.",
  batch_id: "ag70n_batch_01_itanagar_20260608_20260614",
  source_daily_bank: "data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json",
  source_rule_bank: "data/knowledge-base/panchang-festival/production/festival-observance-rule-bank.json",
  computed_event_record_count: eventRecords.length,
  published_event_record_count: 0,
  external_panchang_source_count: 0,
  public_output_allowed_now: false,
  records: eventRecords
};

const ruleApplicationReport = {
  module_id: "AG70N",
  title: "Observance Rule Application Report",
  status: "observance_rule_application_report_created",
  daily_record_count: validatedDailyBank.records.length,
  rule_record_count: ruleBank.records.length,
  rule_application_count: applicationRecords.length,
  matched_application_count: eventRecords.length,
  event_record_count: eventRecords.length,
  external_panchang_source_used: false,
  records: applicationRecords
};

const trayodashiPradoshaWindowReport = {
  module_id: "AG70N",
  title: "Trayodashi / Pradosha Window Report",
  status: "trayodashi_pradosha_window_report_created",
  purpose: "Record whether Trayodashi candidates intersect the preliminary evening Pradosha window around sunset.",
  window_rule: "sunset minus 90 minutes to sunset plus 90 minutes, internal preliminary candidate rule only",
  public_publication_allowed_now: false,
  candidate_count: pradoshaWindowRecords.length,
  records: pradoshaWindowRecords
};

const noPublicationAudit = {
  module_id: "AG70N",
  title: "No Observance Publication Audit",
  status: "no_observance_publication_audit_passed",
  computed_event_record_count: eventRecords.length,
  published_event_record_count: 0,
  public_output_allowed_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  context_interpretation_records_created_now: 0,
  eclipse_events_created_now: 0,
  supabase_activation_performed: false,
  backend_runtime_activated: false
};

const noExternalSourceAudit = {
  module_id: "AG70N",
  title: "No External Panchang Source Audit",
  status: "no_external_panchang_source_audit_passed",
  external_panchang_sites_used_as_source: false,
  external_panchang_sites_used_for_data_generation: false,
  external_panchang_sites_used_as_runtime_dependency: false,
  external_panchang_sites_used_as_production_validation_source: false,
  external_panchang_sites_used_for_public_claim: false,
  external_panchang_sites_allowed_only_for_later_manual_post_output_comparison: true,
  external_source_count: 0
};

const existingUpcomingManifest = fs.existsSync(full("data/knowledge-base/upcoming-observance/production/production-bank-manifest.json"))
  ? readJson("data/knowledge-base/upcoming-observance/production/production-bank-manifest.json")
  : {
      module_id: "upcoming_observance",
      title: "Upcoming Observance Production Bank Manifest",
      status: "production_bank_manifest_created"
    };

const updatedUpcomingManifest = {
  ...existingUpcomingManifest,
  status: "production_bank_manifest_created_upcoming_observance_computed_event_bank_batch_01",
  current_status: "upcoming_observance_computed_event_bank_batch_01_created_public_blocked",
  ag70n_files: {
    event_bank: outputs.eventBank,
    event_bank_batch: outputs.eventBankBatch,
    panchang_event_bank_mirror: outputs.panchangEventBankMirror,
    rule_application_report: outputs.ruleApplicationReport,
    no_publication_audit: outputs.noPublicationAudit,
    no_external_source_audit: outputs.noExternalSourceAudit
  },
  current_counts: {
    ...(existingUpcomingManifest.current_counts || {}),
    computed_observance_event_records: eventRecords.length,
    published_observance_event_records: 0,
    external_source_count: 0
  },
  next_required_stage: "AG70O — Eclipse Computation / Event Bank Batch 01"
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_upcoming_observance_computed_event_bank_batch_01",
  current_status: "upcoming_observance_computed_event_bank_batch_01_created_public_blocked",
  ag70n_files: {
    event_bank: outputs.eventBank,
    event_bank_batch: outputs.eventBankBatch,
    panchang_event_bank_mirror: outputs.panchangEventBankMirror,
    rule_application_report: outputs.ruleApplicationReport,
    trayodashi_pradosha_window_report: outputs.trayodashiPradoshaWindowReport,
    no_publication_audit: outputs.noPublicationAudit,
    no_external_source_audit: outputs.noExternalSourceAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    observance_events: eventRecords.length,
    computed_observance_event_records: eventRecords.length,
    published_observance_events: 0,
    eclipse_events: 0,
    context_interpretation_records: 0
  },
  next_required_stage: "AG70O — Eclipse Computation / Event Bank Batch 01"
};

const review = {
  module_id: "AG70N",
  title: "Upcoming Observance Computed Event Bank Batch 01",
  status: "ag70n_upcoming_observance_computed_event_bank_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70m_review: "data/content-intelligence/quality-reviews/ag70m-festival-observance-rule-bank.json",
    validated_daily_bank: "data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json",
    rule_bank: "data/knowledge-base/panchang-festival/production/festival-observance-rule-bank.json"
  },
  generated_records: outputs,
  summary: {
    upcoming_observance_event_bank_created: true,
    rule_application_report_created: true,
    trayodashi_pradosha_window_report_created: true,
    daily_record_count: validatedDailyBank.records.length,
    rule_record_count: ruleBank.records.length,
    computed_event_record_count: eventRecords.length,
    published_event_record_count: 0,
    external_panchang_sites_used_as_source: false,
    external_panchang_sites_used_for_data_generation: false,
    external_panchang_sites_used_as_runtime_dependency: false,
    external_panchang_sites_used_as_validation_source: false,
    public_panchang_output_allowed_now: false,
    public_observance_output_allowed_now: false,
    actual_eclipse_events_created_now: false,
    context_interpretation_records_created_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70o: true
  }
};

const readiness = {
  module_id: "AG70N",
  title: "AG70O Eclipse Computation / Event Bank Readiness Record",
  status: "ready_for_ag70o_eclipse_computation_event_bank",
  ready_for_ag70o: true,
  next_stage: "AG70O — Eclipse Computation / Event Bank Batch 01",
  reason: "Upcoming observance candidate events are now computed internally and public-blocked. Eclipse computation/event-bank work can proceed separately."
};

const boundary = {
  module_id: "AG70N",
  title: "AG70N to AG70O Eclipse Computation / Event Bank Boundary",
  status: "ag70o_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create internal eclipse computation/event-bank structure.",
    "Keep eclipse public publication blocked.",
    "Keep external Panchang/eclipse sites outside runtime/data-generation.",
    "Allow external comparison only after Drishvara produces its own computed eclipse output."
  ],
  blocked_scope_without_explicit_approval: [
    "public Panchang output",
    "public observance event publication",
    "public eclipse event publication",
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
  module_id: "AG70N",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70N",
  status: review.status,
  daily_record_count: validatedDailyBank.records.length,
  rule_record_count: ruleBank.records.length,
  computed_event_record_count: eventRecords.length,
  published_event_record_count: 0,
  external_source_count: 0,
  public_output_allowed_now: 0,
  eclipse_events_created_now: 0,
  context_interpretation_records_created_now: 0,
  ready_for_ag70o: 1
};

const doc = `# AG70N — Upcoming Observance Computed Event Bank Batch 01

AG70N applies AG70M observance rules to AG70L internally validated Panchang records.

## Created

- Upcoming Observance Computed Event Bank Batch 01.
- Rule application report.
- Trayodashi / Pradosha window report.
- No-publication audit.
- No-external-source audit.

## Boundary

The event records are internal candidates only. They are not public, not published, and not connected to UI/runtime.

## External site rule

External Panchang sites are not used as source, runtime dependency, data-generation input, production validation source, or public-claim basis.

## Not done

- No public observance publication.
- No eclipse event record.
- No context interpretation record.
- No generated Word output.
- No UI/backend/Supabase activation.
`;

writeJson(outputs.eventBank, eventBank);
writeJson(outputs.eventBankBatch, eventBank);
writeJson(outputs.panchangEventBankMirror, eventBank);
writeJson(outputs.ruleApplicationReport, ruleApplicationReport);
writeJson(outputs.trayodashiPradoshaWindowReport, trayodashiPradoshaWindowReport);
writeJson(outputs.noPublicationAudit, noPublicationAudit);
writeJson(outputs.noExternalSourceAudit, noExternalSourceAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.upcomingManifest, updatedUpcomingManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70N upcoming observance computed event bank generated.");
console.log(`✅ Computed event candidates: ${eventRecords.length}; published events: 0.`);
console.log("✅ External Panchang sites excluded from source/runtime/data-generation/validation.");
console.log("✅ Public output, UI, backend and Supabase remain blocked.");
