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
function currentDateKeyInKolkata() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

const ag70p = readJson("data/content-intelligence/quality-reviews/ag70p-panchang-computation-verification-policy.json");
const validatedDailyBank = readJson("data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json");
const observanceBank = readJson("data/knowledge-base/upcoming-observance/production/observance-event-bank.json");
const eclipseScreeningBank = readJson("data/knowledge-base/panchang-festival/production/eclipse-computation-screening-bank-batch-01.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70p.status !== "ag70p_panchang_computation_verification_policy_completed") {
  throw new Error("AG70P must be complete before AG70Q.");
}
if (ag70p.summary?.ready_for_ag70q !== true) {
  throw new Error("AG70P readiness for AG70Q is missing.");
}
if (validatedDailyBank.internally_validated_record_count !== 7) {
  throw new Error("AG70Q requires 7 internally validated Panchang daily records.");
}
if (observanceBank.published_event_record_count !== 0) {
  throw new Error("AG70Q requires observance publication to remain blocked.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  contextBank: "data/knowledge-base/panchang-festival/production/ag70q-panchang-context-interpretation-bank-batch-01.json",
  todayPreview: "data/knowledge-base/panchang-festival/production/ag70q-today-context-interpretation-preview.json",
  signalMap: "data/knowledge-base/panchang-festival/production/ag70q-panchang-context-signal-map.json",
  lexicalInputPreview: "data/knowledge-base/panchang-festival/production/ag70q-word-context-lexical-input-preview.json",
  noWordOutputAudit: "data/knowledge-base/panchang-festival/production/ag70q-no-word-output-audit.json",
  noPublicOutputAudit: "data/knowledge-base/panchang-festival/production/ag70q-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70q-panchang-context-interpretation-bank.json",
  readiness: "data/content-intelligence/quality-registry/ag70q-ag70r-today-panchang-context-preview-output-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70q-to-ag70r-today-panchang-context-preview-output-test-boundary.json",
  quality: "data/quality/ag70q-panchang-context-interpretation-bank.json",
  preview: "data/quality/ag70q-panchang-context-interpretation-bank-preview.json",
  doc: "docs/quality/AG70Q_PANCHANG_CONTEXT_INTERPRETATION_BANK.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

function phaseSignal(record) {
  if (record.paksha === "Shukla Paksha") return "waxing_lunar_phase_signal";
  if (record.paksha === "Krishna Paksha") return "waning_lunar_phase_signal";
  return "unknown_lunar_phase_signal";
}

function tithiSignal(record) {
  const index = record.tithi?.index;
  if ([4, 11, 13, 15, 19, 26, 28, 29, 30].includes(index)) {
    return "observance_sensitive_tithi_signal";
  }
  if (index <= 5 || (index >= 16 && index <= 20)) return "early_phase_tithi_signal";
  if (index >= 6 && index <= 10) return "middle_waxing_tithi_signal";
  if (index >= 21 && index <= 25) return "middle_waning_tithi_signal";
  return "general_tithi_signal";
}

function eclipseSignal(dateKey) {
  const match = eclipseScreeningBank.records.find((x) => x.date_key === dateKey);
  if (!match) return { signal: "no_eclipse_screening_record", record: null };
  if (match.syzygy_tithi_candidate) {
    return {
      signal: "syzygy_screening_candidate_but_not_confirmed",
      record: match
    };
  }
  return {
    signal: "no_eclipse_candidate_screened",
    record: match
  };
}

function observanceSignals(dateKey) {
  return observanceBank.records
    .filter((x) => x.date_key === dateKey)
    .map((event) => ({
      observance_event_id: event.observance_event_id,
      observance_key: event.observance_key,
      display_name: event.display_name,
      event_status: event.event_status,
      publication_status: event.publication_status,
      public_output_allowed: event.public_output_allowed,
      source_rule_id: event.source_rule_id
    }));
}

function makeInterpretation(record) {
  const obs = observanceSignals(record.date_key);
  const eclipse = eclipseSignal(record.date_key);

  const contextSignals = {
    lunar_phase_signal: phaseSignal(record),
    tithi_signal: tithiSignal(record),
    nakshatra_signal: "nakshatra_context_signal_recorded_not_public_claim",
    yoga_signal: "yoga_context_signal_recorded_not_public_claim",
    karana_signal: "karana_context_signal_recorded_not_public_claim",
    vara_signal: "civil_weekday_context_signal",
    observance_signal: obs.length > 0 ? "internal_observance_candidate_present" : "no_internal_observance_candidate",
    eclipse_signal: eclipse.signal
  };

  const lexicalInput = {
    lexical_input_status: "context_vector_ready_for_later_sanskrit_lexical_engine_not_word_output",
    morphology_engine_input_allowed_later: true,
    etymology_engine_input_allowed_later: true,
    semantics_engine_input_allowed_later: true,
    word_selection_allowed_now: false,
    suggested_context_tokens: [
      record.tithi?.name,
      record.nakshatra?.name,
      record.yoga?.name,
      record.karana?.name,
      record.paksha,
      record.vara,
      ...obs.map((x) => x.display_name)
    ].filter(Boolean),
    protected_boundary: "No Sanskrit word is generated or selected in AG70Q."
  };

  return {
    context_interpretation_id: `ag70q_ctx_${record.date_key.replaceAll("-", "")}_${record.location_id}`,
    batch_id: "ag70q_batch_01_itanagar_20260608_20260614",
    date_key: record.date_key,
    location_id: record.location_id,
    timezone: record.timezone,
    panchang_daily_record_id: record.panchang_daily_record_id,
    interpretation_status: "internal_context_interpretation_created_public_blocked",
    source_record_status: record.internal_validation_status,
    panchang_elements: {
      tithi: record.tithi,
      nakshatra: record.nakshatra,
      yoga: record.yoga,
      karana: record.karana,
      paksha: record.paksha,
      vara: record.vara,
      sunrise_datetime_local: record.sunrise_datetime_local,
      sunset_datetime_local: record.sunset_datetime_local
    },
    context_signals: contextSignals,
    observance_candidates: obs,
    eclipse_screening: {
      signal: eclipse.signal,
      eclipse_confirmed_now: false,
      public_eclipse_output_allowed_now: false
    },
    internal_interpretation_summary: {
      summary_status: "internal_preview_only_not_public_copy",
      summary_lines: [
        `The day is internally identified with ${record.tithi?.name || "unknown tithi"} in ${record.paksha || "unknown paksha"}.`,
        `Nakshatra, Yoga and Karana are recorded as ${record.nakshatra?.name || "unknown"}, ${record.yoga?.name || "unknown"} and ${record.karana?.name || "unknown"} respectively.`,
        obs.length > 0
          ? `Internal observance candidate signal present: ${obs.map((x) => x.display_name).join(", ")}.`
          : "No internal observance candidate is flagged for this date in Batch 01.",
        eclipse.signal === "syzygy_screening_candidate_but_not_confirmed"
          ? "Eclipse screening requires further node-distance model; no eclipse is confirmed."
          : "No confirmed eclipse signal is produced."
      ]
    },
    lexical_input_preview: lexicalInput,
    external_panchang_source_used: false,
    external_panchang_validation_status: "comparison_only_not_started",
    public_output_allowed: false,
    word_output_allowed: false,
    ui_output_allowed: false,
    review_status: "created_for_internal_context_bank_only"
  };
}

const contextRecords = validatedDailyBank.records.map(makeInterpretation);
const todayKey = currentDateKeyInKolkata();
const todayRecord = contextRecords.find((x) => x.date_key === todayKey) || contextRecords[0];

const contextBank = {
  module_id: "AG70Q",
  title: "Panchang Context Interpretation Bank Batch 01",
  status: "panchang_context_interpretation_bank_batch_01_created_public_blocked",
  purpose: "Create internal context interpretation records from validated Panchang records and internal observance/eclipse screening signals.",
  batch_id: "ag70q_batch_01_itanagar_20260608_20260614",
  source_daily_bank: "data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json",
  source_observance_bank: "data/knowledge-base/upcoming-observance/production/observance-event-bank.json",
  source_eclipse_screening_bank: "data/knowledge-base/panchang-festival/production/eclipse-computation-screening-bank-batch-01.json",
  context_interpretation_record_count: contextRecords.length,
  public_output_record_count: 0,
  word_output_record_count: 0,
  external_source_count: 0,
  records: contextRecords
};

const todayPreview = {
  module_id: "AG70Q",
  title: "Today Context Interpretation Preview",
  status: "today_context_interpretation_preview_created_internal_only",
  requested_today_key_Asia_Kolkata: todayKey,
  selected_preview_date_key: todayRecord?.date_key || null,
  selected_from_batch_fallback_used: todayRecord?.date_key !== todayKey,
  public_output_allowed_now: false,
  ui_output_allowed_now: false,
  word_output_allowed_now: false,
  preview_record: todayRecord || null
};

const signalMap = {
  module_id: "AG70Q",
  title: "Panchang Context Signal Map",
  status: "panchang_context_signal_map_created",
  signal_record_count: contextRecords.length,
  records: contextRecords.map((record) => ({
    date_key: record.date_key,
    context_interpretation_id: record.context_interpretation_id,
    tithi_name: record.panchang_elements.tithi?.name,
    nakshatra_name: record.panchang_elements.nakshatra?.name,
    yoga_name: record.panchang_elements.yoga?.name,
    karana_name: record.panchang_elements.karana?.name,
    paksha: record.panchang_elements.paksha,
    vara: record.panchang_elements.vara,
    context_signals: record.context_signals,
    observance_candidate_count: record.observance_candidates.length,
    public_output_allowed: false
  }))
};

const lexicalInputPreview = {
  module_id: "AG70Q",
  title: "Word Context Lexical Input Preview",
  status: "word_context_lexical_input_preview_created_no_word_output",
  purpose: "Prepare context-vector inputs that can later feed Sanskrit morphology, etymology and semantics engines.",
  lexical_input_record_count: contextRecords.length,
  word_selection_performed_now: false,
  generated_word_json_modified: false,
  public_word_output_allowed_now: false,
  records: contextRecords.map((record) => ({
    date_key: record.date_key,
    context_interpretation_id: record.context_interpretation_id,
    lexical_input_preview: record.lexical_input_preview
  }))
};

const noWordOutputAudit = {
  module_id: "AG70Q",
  title: "No Word Output Audit",
  status: "no_word_output_audit_passed",
  generated_word_json_modified: false,
  word_selection_performed_now: false,
  morphology_bank_records_created_now: 0,
  etymology_bank_records_created_now: 0,
  semantics_bank_records_created_now: 0,
  sacred_fallback_word_records_created_now: 0,
  public_word_output_allowed_now: false,
  runtime_word_selector_activated: false
};

const noPublicOutputAudit = {
  module_id: "AG70Q",
  title: "No Public Output Audit",
  status: "no_public_output_audit_passed",
  public_panchang_output_allowed_now: false,
  public_observance_output_allowed_now: false,
  public_eclipse_output_allowed_now: false,
  public_word_output_allowed_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  supabase_activation_performed: false,
  backend_runtime_activated: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_panchang_context_interpretation_bank_batch_01",
  current_status: "panchang_context_interpretation_bank_batch_01_created_public_blocked",
  ag70q_files: {
    context_bank: outputs.contextBank,
    today_preview: outputs.todayPreview,
    signal_map: outputs.signalMap,
    lexical_input_preview: outputs.lexicalInputPreview,
    no_word_output_audit: outputs.noWordOutputAudit,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    context_interpretation_records: contextRecords.length,
    today_context_preview_records: todayRecord ? 1 : 0,
    word_output_records: 0,
    public_panchang_outputs: 0
  },
  next_required_stage: "AG70R — Today Panchang Context Preview / Output Test"
};

const review = {
  module_id: "AG70Q",
  title: "Panchang Context Interpretation Bank Batch 01",
  status: "ag70q_panchang_context_interpretation_bank_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70p_review: "data/content-intelligence/quality-reviews/ag70p-panchang-computation-verification-policy.json",
    validated_daily_bank: "data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json",
    observance_event_bank: "data/knowledge-base/upcoming-observance/production/observance-event-bank.json",
    eclipse_screening_bank: "data/knowledge-base/panchang-festival/production/eclipse-computation-screening-bank-batch-01.json"
  },
  generated_records: outputs,
  summary: {
    context_interpretation_bank_created: true,
    today_context_preview_created: true,
    signal_map_created: true,
    lexical_input_preview_created: true,
    context_interpretation_record_count: contextRecords.length,
    today_preview_record_count: todayRecord ? 1 : 0,
    word_selection_performed_now: false,
    generated_word_json_modified: false,
    external_panchang_sites_used_as_source: false,
    external_panchang_sites_used_for_data_generation: false,
    external_panchang_sites_used_as_runtime_dependency: false,
    external_panchang_sites_used_as_validation_source: false,
    public_panchang_output_allowed_now: false,
    public_observance_output_allowed_now: false,
    public_eclipse_output_allowed_now: false,
    public_word_output_allowed_now: false,
    ui_display_changed: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70r: true
  }
};

const readiness = {
  module_id: "AG70Q",
  title: "AG70R Today Panchang Context Preview / Output Test Readiness Record",
  status: "ready_for_ag70r_today_panchang_context_preview_output_test",
  ready_for_ag70r: true,
  next_stage: "AG70R — Today Panchang Context Preview / Output Test",
  reason: "Context interpretation bank and today internal preview exist. AG70R can generate a readable output-test preview while keeping UI/public output blocked."
};

const boundary = {
  module_id: "AG70Q",
  title: "AG70Q to AG70R Today Panchang Context Preview / Output Test Boundary",
  status: "ag70r_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create readable today Panchang context output-test preview from AG70Q internal preview.",
    "Keep public output and UI connection blocked.",
    "Keep Word of the Day generation blocked."
  ],
  blocked_scope_without_explicit_approval: [
    "public Panchang output",
    "public observance event publication",
    "public eclipse event publication",
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
  module_id: "AG70Q",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70Q",
  status: review.status,
  context_interpretation_record_count: contextRecords.length,
  today_preview_record_count: todayRecord ? 1 : 0,
  selected_today_preview_date_key: todayRecord?.date_key || null,
  public_output_allowed_now: 0,
  word_output_allowed_now: 0,
  ui_output_allowed_now: 0,
  ready_for_ag70r: 1
};

const doc = `# AG70Q — Panchang Context Interpretation Bank Batch 01

AG70Q creates internal Panchang context interpretation records from validated Panchang daily records, observance candidates and eclipse screening status.

## Created

- Panchang Context Interpretation Bank Batch 01.
- Today Context Interpretation Preview.
- Panchang Context Signal Map.
- Word Context Lexical Input Preview.
- No Word Output Audit.
- No Public Output Audit.

## Important boundary

AG70Q creates internal context records only. It does not update generated Word output, public Panchang output, UI, backend, Supabase, or runtime selectors.

## Next

AG70R should create a readable Today Panchang Context Preview / Output Test for manual inspection before any public UI connection.
`;

writeJson(outputs.contextBank, contextBank);
writeJson(outputs.todayPreview, todayPreview);
writeJson(outputs.signalMap, signalMap);
writeJson(outputs.lexicalInputPreview, lexicalInputPreview);
writeJson(outputs.noWordOutputAudit, noWordOutputAudit);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70Q Panchang context interpretation bank generated.");
console.log(`✅ Context interpretation records: ${contextRecords.length}.`);
console.log(`✅ Today preview date: ${todayRecord?.date_key || "none"}.`);
console.log("✅ Word output, public output, UI, backend and Supabase remain blocked.");
