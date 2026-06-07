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

const ag70i = readJson("data/content-intelligence/quality-reviews/ag70i-internal-panchang-astronomical-computation-model.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const internalModel = readJson("data/knowledge-base/panchang-festival/production/internal-astronomical-computation-model.json");
const dailySchema = readJson("data/knowledge-base/panchang-festival/production/computed-panchang-daily-record-schema.json");
const exclusionAudit = readJson("data/knowledge-base/panchang-festival/production/ag70i-external-panchang-site-exclusion-audit.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70i.status !== "ag70i_internal_panchang_astronomical_computation_model_completed") {
  throw new Error("AG70I must be complete before AG70J.");
}
if (ag70i.summary?.ready_for_ag70j !== true) {
  throw new Error("AG70I readiness for AG70J is missing.");
}
if (internalModel.source_of_truth_principle?.production_source_of_truth !== "internal_governed_astronomical_computation") {
  throw new Error("Internal Panchang source-of-truth principle missing.");
}
if (exclusionAudit.external_panchang_sites_used_as_source !== false || exclusionAudit.external_panchang_sites_used_for_data_generation !== false) {
  throw new Error("External Panchang sites must remain excluded.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  basisLock: "data/knowledge-base/panchang-festival/production/ag70j-panchang-computation-basis-lock-daily-bank-batch-01.json",
  locationLock: "data/knowledge-base/panchang-festival/production/panchang-default-location-basis-lock.json",
  ayanamsaLock: "data/knowledge-base/panchang-festival/production/panchang-ayanamsa-basis-lock.json",
  internalComputationLock: "data/knowledge-base/panchang-festival/production/panchang-internal-computation-basis-lock.json",
  dailyBank: "data/knowledge-base/panchang-festival/production/panchang-daily-calculation-bank-batch-01.json",
  noFabricationAudit: "data/knowledge-base/panchang-festival/production/ag70j-no-fabricated-panchang-values-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70j-panchang-computation-basis-lock-daily-bank.json",
  readiness: "data/content-intelligence/quality-registry/ag70j-ag70k-internal-panchang-daily-computation-engine-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70j-to-ag70k-internal-panchang-daily-computation-engine-boundary.json",
  quality: "data/quality/ag70j-panchang-computation-basis-lock-daily-bank.json",
  preview: "data/quality/ag70j-panchang-computation-basis-lock-daily-bank-preview.json",
  doc: "docs/quality/AG70J_PANCHANG_COMPUTATION_BASIS_LOCK_DAILY_BANK.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const defaultLocation = {
  location_id: "loc_in_ar_itangar_capital_complex_001",
  display_name: "Itanagar, Arunachal Pradesh, India",
  country: "India",
  region: "Arunachal Pradesh",
  timezone: "Asia/Kolkata",
  latitude_decimal: 27.0844,
  longitude_decimal: 93.6053,
  coordinate_status: "controlled_internal_test_location_pending_final_geodetic_review",
  default_for_internal_computation_batch_01: true,
  default_for_public_output_now: false,
  user_location_runtime_active_now: false,
  review_status: "basis_locked_for_internal_computation_batch_01"
};

const locationLock = {
  module_id: "AG70J",
  title: "Panchang Default Location Basis Lock",
  status: "panchang_default_location_basis_locked_for_internal_batch_01",
  purpose: "Lock the first controlled internal Panchang computation location before any daily calculation values are generated.",
  location_record_count: 1,
  public_location_runtime_active_now: false,
  records: [defaultLocation]
};

const ayanamsaLock = {
  module_id: "AG70J",
  title: "Panchang Ayanamsa Basis Lock",
  status: "panchang_ayanamsa_basis_locked_for_internal_batch_01",
  purpose: "Lock a single ayanamsa basis for internal Batch 01 so sidereal Nakshatra/Yoga derivations do not mix bases.",
  ayanamsa_record: {
    ayanamsa_id: "ayanamsa_lahiri_chitrapaksha_internal_v1",
    ayanamsa_name: "Lahiri / Chitrapaksha",
    use_scope: "internal_computation_batch_01",
    selected_for_internal_computation_now: true,
    selected_for_public_runtime_now: false,
    selection_status: "basis_locked_for_internal_batch_pending_precision_validation",
    mixed_ayanamsa_allowed: false,
    review_status: "internal_basis_selected_no_public_output"
  },
  public_output_allowed_now: false
};

const internalComputationLock = {
  module_id: "AG70J",
  title: "Internal Panchang Computation Basis Lock",
  status: "internal_panchang_computation_basis_locked_no_values_generated",
  purpose: "Lock Drishvara internal model as the only basis for first daily calculation bank requests.",
  computation_model_id: "drishvara_internal_panchang_model_v1",
  computation_basis: "internal_governed_astronomical_computation",
  location_id: defaultLocation.location_id,
  ayanamsa_id: ayanamsaLock.ayanamsa_record.ayanamsa_id,
  external_panchang_sites_used_as_source: false,
  external_panchang_sites_used_as_runtime_dependency: false,
  external_panchang_sites_used_for_data_generation: false,
  external_panchang_sites_allowed_only_after_output_for_manual_verification: true,
  actual_computation_engine_executed_now: false,
  daily_values_generated_now: false,
  public_output_allowed_now: false
};

const batchDates = [
  "2026-06-08",
  "2026-06-09",
  "2026-06-10",
  "2026-06-11",
  "2026-06-12",
  "2026-06-13",
  "2026-06-14"
];

const dailyRequestRecords = batchDates.map((dateKey, index) => ({
  panchang_daily_record_id: `ag70j_pending_itn_${dateKey.replaceAll("-", "")}`,
  batch_id: "ag70j_batch_01_itanagar_20260608_20260614",
  sequence: index + 1,
  date_key: dateKey,
  location_id: defaultLocation.location_id,
  timezone: defaultLocation.timezone,
  latitude_decimal: defaultLocation.latitude_decimal,
  longitude_decimal: defaultLocation.longitude_decimal,
  calculation_model_id: "drishvara_internal_panchang_model_v1",
  ayanamsa_id: ayanamsaLock.ayanamsa_record.ayanamsa_id,
  record_status: "pending_internal_computation",
  computed_values_present: false,
  sun_longitude_sidereal: null,
  moon_longitude_sidereal: null,
  moon_minus_sun_angular_difference: null,
  sunrise_datetime_local: null,
  sunset_datetime_local: null,
  tithi: null,
  nakshatra: null,
  yoga: null,
  karana: null,
  paksha: null,
  vara: null,
  observance_candidates: [],
  eclipse_candidates: [],
  internal_validation_status: "not_computed",
  post_computation_manual_verification_status: "not_applicable_until_computed",
  public_output_allowed: false
}));

const dailyBank = {
  module_id: "AG70J",
  title: "Panchang Daily Calculation Bank Batch 01",
  status: "panchang_daily_calculation_bank_batch_01_created_pending_internal_computation",
  purpose: "Create first controlled daily calculation request records without fabricated Panchang values.",
  batch_id: "ag70j_batch_01_itanagar_20260608_20260614",
  location_id: defaultLocation.location_id,
  ayanamsa_id: ayanamsaLock.ayanamsa_record.ayanamsa_id,
  calculation_model_id: "drishvara_internal_panchang_model_v1",
  daily_request_record_count: dailyRequestRecords.length,
  computed_panchang_daily_record_count: 0,
  fabricated_value_count: 0,
  external_site_input_count: 0,
  public_output_allowed_now: false,
  schema_reference: "data/knowledge-base/panchang-festival/production/computed-panchang-daily-record-schema.json",
  records: dailyRequestRecords
};

const basisLock = {
  module_id: "AG70J",
  title: "Panchang Computation Basis Lock and Daily Calculation Bank Batch 01",
  status: "ag70j_panchang_computation_basis_lock_daily_bank_batch_01_completed",
  purpose: "Lock location, ayanamsa and internal computation basis, then create controlled pending daily calculation bank records.",
  basis_locked: {
    location_locked: true,
    ayanamsa_locked: true,
    internal_computation_basis_locked: true,
    external_panchang_sites_excluded_from_generation: true
  },
  records_created: {
    location_records: 1,
    ayanamsa_records: 1,
    daily_calculation_request_records: dailyRequestRecords.length,
    computed_panchang_daily_records: 0
  },
  no_public_output: true
};

const noFabricationAudit = {
  module_id: "AG70J",
  title: "No Fabricated Panchang Values Audit",
  status: "no_fabricated_panchang_values_audit_passed",
  location_basis_locked: true,
  ayanamsa_basis_locked: true,
  daily_request_records_created: dailyRequestRecords.length,
  computed_panchang_daily_records_created_now: 0,
  fabricated_panchang_value_count: 0,
  external_panchang_sites_used_as_source: false,
  external_panchang_sites_used_for_data_generation: false,
  external_panchang_sites_used_as_runtime_dependency: false,
  public_panchang_output_allowed_now: false,
  observance_events_created_now: 0,
  eclipse_events_created_now: 0,
  context_interpretation_records_created_now: 0,
  generated_word_json_modified: false,
  ui_display_changed: false,
  supabase_activation_performed: false,
  backend_runtime_activated: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_panchang_computation_basis_lock_daily_bank_batch_01",
  current_status: "panchang_computation_basis_locked_daily_bank_batch_01_pending_internal_computation",
  ag70j_files: {
    basis_lock: outputs.basisLock,
    location_lock: outputs.locationLock,
    ayanamsa_lock: outputs.ayanamsaLock,
    internal_computation_lock: outputs.internalComputationLock,
    daily_calculation_bank_batch_01: outputs.dailyBank,
    no_fabrication_audit: outputs.noFabricationAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    location_basis_records: 1,
    ayanamsa_basis_records: 1,
    daily_calculation_request_records: dailyRequestRecords.length,
    panchang_daily_records: 0,
    observance_events: 0,
    eclipse_events: 0,
    context_interpretation_records: 0
  },
  next_required_stage: "AG70K — Internal Panchang Daily Computation Engine Dry Run"
};

const review = {
  module_id: "AG70J",
  title: "Panchang Computation Basis Lock and Daily Calculation Bank Batch 01",
  status: "ag70j_panchang_computation_basis_lock_daily_bank_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70i_review: "data/content-intelligence/quality-reviews/ag70i-internal-panchang-astronomical-computation-model.json",
    internal_model: "data/knowledge-base/panchang-festival/production/internal-astronomical-computation-model.json",
    computed_record_schema: "data/knowledge-base/panchang-festival/production/computed-panchang-daily-record-schema.json"
  },
  generated_records: outputs,
  summary: {
    default_location_locked: true,
    default_location_id: defaultLocation.location_id,
    default_location_name: defaultLocation.display_name,
    ayanamsa_basis_locked: true,
    ayanamsa_id: ayanamsaLock.ayanamsa_record.ayanamsa_id,
    internal_computation_basis_locked: true,
    daily_calculation_bank_batch_01_created: true,
    daily_calculation_request_record_count: dailyRequestRecords.length,
    computed_panchang_daily_record_count: 0,
    fabricated_panchang_value_count: 0,
    external_panchang_sites_used_as_source: false,
    external_panchang_sites_used_as_runtime_dependency: false,
    external_panchang_sites_used_for_data_generation: false,
    external_panchang_sites_allowed_only_after_output_for_manual_verification: true,
    actual_observance_events_created_now: false,
    actual_eclipse_events_created_now: false,
    context_interpretation_records_created_now: false,
    public_panchang_output_allowed_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70k: true
  }
};

const readiness = {
  module_id: "AG70J",
  title: "AG70K Internal Panchang Daily Computation Engine Readiness Record",
  status: "ready_for_ag70k_internal_panchang_daily_computation_engine",
  ready_for_ag70k: true,
  next_stage: "AG70K — Internal Panchang Daily Computation Engine Dry Run",
  reason: "Computation basis is locked and Batch 01 pending request records exist. AG70K can implement/dry-run internal computation to populate computed values, still with public output blocked."
};

const boundary = {
  module_id: "AG70J",
  title: "AG70J to AG70K Internal Panchang Daily Computation Engine Boundary",
  status: "ag70k_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create internal computation dry-run logic for Batch 01.",
    "Populate computed Panchang values only from Drishvara internal computation model.",
    "Record validation status for each computed value.",
    "Keep public output blocked.",
    "Keep external Panchang sites outside generation model; allow only later manual verification notes."
  ],
  blocked_scope_without_explicit_approval: [
    "public Panchang output",
    "actual festival/observance date publication",
    "actual eclipse event publication",
    "context interpretation production records",
    "generated/word-of-day.json replacement",
    "homepage UI change",
    "runtime Word selector activation",
    "Supabase/database writes",
    "backend/Auth activation",
    "external Panchang site as source of truth",
    "external Panchang site as data-generation input",
    "external Panchang site as runtime dependency"
  ]
};

const quality = {
  module_id: "AG70J",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70J",
  status: review.status,
  default_location_locked: 1,
  ayanamsa_basis_locked: 1,
  internal_computation_basis_locked: 1,
  daily_calculation_request_record_count: dailyRequestRecords.length,
  computed_panchang_daily_record_count: 0,
  fabricated_panchang_value_count: 0,
  external_site_input_count: 0,
  public_panchang_output_allowed_now: 0,
  ready_for_ag70k: 1
};

const doc = `# AG70J — Panchang Computation Basis Lock and Daily Calculation Bank Batch 01

AG70J locks the controlled basis for the first internal Panchang computation batch.

## Locked

- Location: Itanagar, Arunachal Pradesh, India.
- Timezone: Asia/Kolkata.
- Ayanamsa basis: Lahiri / Chitrapaksha for internal Batch 01.
- Computation model: Drishvara internal Panchang model v1.

## Created

- Default location basis lock.
- Ayanamsa basis lock.
- Internal computation basis lock.
- Daily calculation bank Batch 01 with pending computation records.
- No-fabrication audit.

## Not done

- No Panchang values generated.
- No Tithi/Nakshatra/Yoga/Karana/Paksha/Vara values populated.
- No observance events.
- No eclipse events.
- No context interpretation records.
- No public Panchang output.
- No external Panchang site input.
- No UI/backend/Supabase activation.
`;

writeJson(outputs.basisLock, basisLock);
writeJson(outputs.locationLock, locationLock);
writeJson(outputs.ayanamsaLock, ayanamsaLock);
writeJson(outputs.internalComputationLock, internalComputationLock);
writeJson(outputs.dailyBank, dailyBank);
writeJson(outputs.noFabricationAudit, noFabricationAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70J Panchang computation basis lock and daily bank generated.");
console.log(`✅ Daily calculation request records: ${dailyRequestRecords.length}; computed values: 0.`);
console.log("✅ No fabricated Panchang values, external-site input, UI, runtime or backend mutation performed.");
