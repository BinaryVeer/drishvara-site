import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
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

const ag70n = readJson("data/content-intelligence/quality-reviews/ag70n-upcoming-observance-computed-event-bank.json");
const validatedDailyBank = readJson("data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70n.status !== "ag70n_upcoming_observance_computed_event_bank_completed") {
  throw new Error("AG70N must be complete before AG70O.");
}
if (ag70n.summary?.ready_for_ag70o !== true) {
  throw new Error("AG70N readiness for AG70O is missing.");
}
if (validatedDailyBank.status !== "panchang_daily_calculation_bank_batch_01_internally_validated_public_blocked") {
  throw new Error("AG70O requires internally validated Panchang daily bank.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  eclipseModel: "data/knowledge-base/panchang-festival/production/eclipse-computation-model.json",
  eclipseScreeningBank: "data/knowledge-base/panchang-festival/production/eclipse-computation-screening-bank-batch-01.json",
  eclipseEventBank: "data/knowledge-base/panchang-festival/production/eclipse-computation-event-bank-batch-01.json",
  eclipseEventBankMirror: "data/knowledge-base/panchang-festival/production/eclipse-event-bank.json",
  nodeRequirementRecord: "data/knowledge-base/panchang-festival/production/ag70o-eclipse-node-requirement-record.json",
  noPublicationAudit: "data/knowledge-base/panchang-festival/production/ag70o-no-eclipse-publication-audit.json",
  noExternalSourceAudit: "data/knowledge-base/panchang-festival/production/ag70o-no-external-eclipse-source-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70o-eclipse-computation-event-bank.json",
  readiness: "data/content-intelligence/quality-registry/ag70o-ag70p-panchang-computation-verification-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70o-to-ag70p-panchang-computation-verification-boundary.json",
  quality: "data/quality/ag70o-eclipse-computation-event-bank.json",
  preview: "data/quality/ag70o-eclipse-computation-event-bank-preview.json",
  doc: "docs/quality/AG70O_ECLIPSE_COMPUTATION_EVENT_BANK.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

function eclipseKindFromTithiIndex(index) {
  if (index === 30) return "solar_eclipse_screening_required_amavasya";
  if (index === 15) return "lunar_eclipse_screening_required_purnima";
  return "no_syzygy_tithi";
}

function isSyzygyTithi(index) {
  return index === 15 || index === 30;
}

const screeningRecords = validatedDailyBank.records.map((record) => {
  const tithiIndex = record.tithi?.index;
  const syzygy = isSyzygyTithi(tithiIndex);
  const eclipseKind = eclipseKindFromTithiIndex(tithiIndex);

  return {
    eclipse_screening_record_id: `ag70o_screen_${record.date_key.replaceAll("-", "")}_${record.location_id}`,
    batch_id: "ag70o_batch_01_itanagar_20260608_20260614",
    date_key: record.date_key,
    location_id: record.location_id,
    timezone: record.timezone,
    panchang_daily_record_id: record.panchang_daily_record_id,
    tithi: record.tithi,
    paksha: record.paksha,
    sun_longitude_sidereal: record.sun_longitude_sidereal,
    moon_longitude_sidereal: record.moon_longitude_sidereal,
    moon_minus_sun_angular_difference: record.moon_minus_sun_angular_difference,
    syzygy_tithi_candidate: syzygy,
    eclipse_screening_kind: eclipseKind,
    lunar_node_longitude_available: false,
    node_distance_available: false,
    eclipse_confirmation_possible_now: false,
    eclipse_confirmed_now: false,
    confirmation_block_reason: syzygy
      ? "syzygy_tithi_present_but_lunar_node_distance_not_computed_in_current_internal_model"
      : "not_full_moon_or_new_moon_tithi",
    computed_from_internal_panchang: true,
    external_eclipse_source_used: false,
    public_output_allowed: false,
    publication_status: "blocked",
    review_status: syzygy
      ? "screened_internal_candidate_requires_node_model"
      : "screened_no_eclipse_candidate"
  };
});

const confirmedEventRecords = [];

const eclipseModel = {
  module_id: "AG70O",
  title: "Eclipse Computation Model",
  status: "eclipse_computation_model_created_node_dependency_explicit",
  purpose: "Define internal eclipse screening and event-bank rules without relying on external eclipse/Panchang websites.",
  required_conditions: {
    solar_eclipse: [
      "Amavasya / new moon syzygy",
      "Sun-Moon conjunction",
      "Moon near lunar node",
      "visibility/geographic path model for public-facing event"
    ],
    lunar_eclipse: [
      "Purnima / full moon syzygy",
      "Sun-Moon opposition",
      "Moon near lunar node",
      "visibility/geographic model for public-facing event"
    ]
  },
  available_in_current_internal_model: [
    "Tithi",
    "Paksha",
    "Sun longitude",
    "Moon longitude",
    "Moon-Sun angular difference"
  ],
  not_yet_available_in_current_internal_model: [
    "ascending_node_longitude",
    "descending_node_longitude",
    "moon_node_distance",
    "eclipse_magnitude",
    "visibility_path",
    "contact_times"
  ],
  production_rule: "No eclipse event may be confirmed or published without internal node-distance and visibility/contact-time computation.",
  external_eclipse_sites_used_as_source: false,
  external_eclipse_sites_used_for_data_generation: false,
  external_eclipse_sites_used_as_runtime_dependency: false,
  external_sites_allowed_only_for_later_manual_post_output_comparison: true
};

const eclipseScreeningBank = {
  module_id: "AG70O",
  title: "Eclipse Computation Screening Bank Batch 01",
  status: "eclipse_computation_screening_bank_batch_01_created_public_blocked",
  batch_id: "ag70o_batch_01_itanagar_20260608_20260614",
  source_daily_bank: "data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json",
  screening_record_count: screeningRecords.length,
  syzygy_screening_candidate_count: screeningRecords.filter((x) => x.syzygy_tithi_candidate).length,
  confirmed_eclipse_event_count: 0,
  published_eclipse_event_count: 0,
  external_source_count: 0,
  public_output_allowed_now: false,
  records: screeningRecords
};

const eclipseEventBank = {
  module_id: "AG70O",
  title: "Eclipse Computation Event Bank Batch 01",
  status: "eclipse_computation_event_bank_batch_01_created_no_confirmed_events_public_blocked",
  batch_id: "ag70o_batch_01_itanagar_20260608_20260614",
  purpose: "Record confirmed eclipse events only when all internal eclipse conditions are computable and validated.",
  confirmed_eclipse_event_count: 0,
  published_eclipse_event_count: 0,
  external_eclipse_source_count: 0,
  public_output_allowed_now: false,
  records: confirmedEventRecords
};

const nodeRequirementRecord = {
  module_id: "AG70O",
  title: "Eclipse Node Requirement Record",
  status: "eclipse_node_requirement_record_created",
  reason: "Eclipse confirmation requires lunar node proximity; current AG70K/AG70L Panchang daily bank does not yet carry lunar node longitude or node-distance fields.",
  required_future_fields: [
    "ascending_node_longitude",
    "descending_node_longitude",
    "moon_node_distance",
    "syzygy_exact_datetime",
    "eclipse_magnitude",
    "visibility_region",
    "contact_times"
  ],
  confirmed_events_blocked_until_node_model: true,
  public_output_allowed_now: false
};

const noPublicationAudit = {
  module_id: "AG70O",
  title: "No Eclipse Publication Audit",
  status: "no_eclipse_publication_audit_passed",
  screening_record_count: screeningRecords.length,
  confirmed_eclipse_event_count: 0,
  published_eclipse_event_count: 0,
  public_eclipse_output_allowed_now: false,
  public_panchang_output_allowed_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  context_interpretation_records_created_now: 0,
  supabase_activation_performed: false,
  backend_runtime_activated: false
};

const noExternalSourceAudit = {
  module_id: "AG70O",
  title: "No External Eclipse Source Audit",
  status: "no_external_eclipse_source_audit_passed",
  external_panchang_sites_used_as_source: false,
  external_eclipse_sites_used_as_source: false,
  external_sites_used_for_data_generation: false,
  external_sites_used_as_runtime_dependency: false,
  external_sites_used_as_production_validation_source: false,
  external_sites_used_for_public_claim: false,
  external_sites_allowed_only_for_later_manual_post_output_comparison: true,
  external_source_count: 0
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_eclipse_computation_event_bank_batch_01",
  current_status: "eclipse_computation_event_bank_batch_01_created_no_confirmed_events_public_blocked",
  ag70o_files: {
    eclipse_model: outputs.eclipseModel,
    eclipse_screening_bank: outputs.eclipseScreeningBank,
    eclipse_event_bank: outputs.eclipseEventBank,
    eclipse_event_bank_mirror: outputs.eclipseEventBankMirror,
    node_requirement_record: outputs.nodeRequirementRecord,
    no_publication_audit: outputs.noPublicationAudit,
    no_external_source_audit: outputs.noExternalSourceAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    eclipse_screening_records: screeningRecords.length,
    syzygy_screening_candidate_count: screeningRecords.filter((x) => x.syzygy_tithi_candidate).length,
    eclipse_events: 0,
    confirmed_eclipse_events: 0,
    published_eclipse_events: 0,
    context_interpretation_records: 0
  },
  next_required_stage: "AG70P — Panchang Computation Verification and Manual Post-Output Comparison Policy"
};

const review = {
  module_id: "AG70O",
  title: "Eclipse Computation / Event Bank Batch 01",
  status: "ag70o_eclipse_computation_event_bank_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70n_review: "data/content-intelligence/quality-reviews/ag70n-upcoming-observance-computed-event-bank.json",
    validated_daily_bank: "data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json"
  },
  generated_records: outputs,
  summary: {
    eclipse_computation_model_created: true,
    eclipse_screening_bank_created: true,
    eclipse_event_bank_created: true,
    node_requirement_record_created: true,
    screening_record_count: screeningRecords.length,
    syzygy_screening_candidate_count: screeningRecords.filter((x) => x.syzygy_tithi_candidate).length,
    confirmed_eclipse_event_count: 0,
    published_eclipse_event_count: 0,
    confirmed_events_blocked_until_node_model: true,
    external_panchang_sites_used_as_source: false,
    external_eclipse_sites_used_as_source: false,
    external_sites_used_for_data_generation: false,
    external_sites_used_as_runtime_dependency: false,
    external_sites_used_as_validation_source: false,
    public_panchang_output_allowed_now: false,
    public_eclipse_output_allowed_now: false,
    context_interpretation_records_created_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70p: true
  }
};

const readiness = {
  module_id: "AG70O",
  title: "AG70P Panchang Computation Verification Readiness Record",
  status: "ready_for_ag70p_panchang_computation_verification_policy",
  ready_for_ag70p: true,
  next_stage: "AG70P — Panchang Computation Verification and Manual Post-Output Comparison Policy",
  reason: "Daily Panchang, observance candidates and eclipse screening/event-bank boundaries exist. AG70P should define the final verification/manual-comparison policy before context interpretation or public surfacing."
};

const boundary = {
  module_id: "AG70O",
  title: "AG70O to AG70P Panchang Computation Verification Boundary",
  status: "ag70p_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Define Panchang computation verification policy.",
    "Define manual post-output comparison workflow.",
    "Keep external sites outside source/runtime/data-generation.",
    "Keep public output blocked."
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
  module_id: "AG70O",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70O",
  status: review.status,
  screening_record_count: screeningRecords.length,
  syzygy_screening_candidate_count: screeningRecords.filter((x) => x.syzygy_tithi_candidate).length,
  confirmed_eclipse_event_count: 0,
  published_eclipse_event_count: 0,
  external_source_count: 0,
  public_output_allowed_now: 0,
  context_interpretation_records_created_now: 0,
  ready_for_ag70p: 1
};

const doc = `# AG70O — Eclipse Computation / Event Bank Batch 01

AG70O creates the internal eclipse computation screening and event-bank boundary.

## Created

- Eclipse computation model.
- Eclipse screening bank Batch 01.
- Eclipse event bank Batch 01.
- Eclipse node requirement record.
- No-publication audit.
- No-external-source audit.

## Important rule

Eclipse confirmation requires both syzygy and lunar-node proximity. Current AG70K/AG70L Panchang records include Sun/Moon longitudes and Tithi, but do not yet include lunar node distance, contact times, magnitude, or visibility path.

Therefore AG70O creates screening records but keeps confirmed eclipse event count at zero.

## External site rule

External Panchang/eclipse sites are not used as source, runtime dependency, data-generation input, production validation source, or public-claim basis.

## Not done

- No confirmed eclipse event.
- No public eclipse publication.
- No context interpretation record.
- No generated Word output.
- No UI/backend/Supabase activation.
`;

writeJson(outputs.eclipseModel, eclipseModel);
writeJson(outputs.eclipseScreeningBank, eclipseScreeningBank);
writeJson(outputs.eclipseEventBank, eclipseEventBank);
writeJson(outputs.eclipseEventBankMirror, eclipseEventBank);
writeJson(outputs.nodeRequirementRecord, nodeRequirementRecord);
writeJson(outputs.noPublicationAudit, noPublicationAudit);
writeJson(outputs.noExternalSourceAudit, noExternalSourceAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70O eclipse computation/event bank generated.");
console.log(`✅ Screening records: ${screeningRecords.length}; confirmed eclipse events: 0.`);
console.log("✅ Eclipse confirmation blocked until internal lunar-node model is added.");
console.log("✅ External Panchang/eclipse sites excluded from source/runtime/data-generation/validation.");
console.log("✅ Public output, UI, backend and Supabase remain blocked.");
