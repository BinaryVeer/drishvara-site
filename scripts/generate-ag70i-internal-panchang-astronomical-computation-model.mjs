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

const ag70h = readJson("data/content-intelligence/quality-reviews/ag70h-panchang-calculation-source-location-basis-decision.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const inputContract = readJson("data/knowledge-base/panchang-festival/production/panchang-computation-input-contract.json");
const noComputationAuditH = readJson("data/knowledge-base/panchang-festival/production/ag70h-no-panchang-computation-audit.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70h.status !== "ag70h_panchang_calculation_source_location_basis_decision_completed") {
  throw new Error("AG70H must be complete before AG70I.");
}
if (ag70h.summary?.ready_for_ag70i !== true) {
  throw new Error("AG70H readiness for AG70I is missing.");
}
if (noComputationAuditH.panchang_daily_records_created_now !== 0) {
  throw new Error("AG70H must have created no Panchang daily records.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  internalModel: "data/knowledge-base/panchang-festival/production/internal-astronomical-computation-model.json",
  computationMethod: "data/knowledge-base/panchang-festival/production/internal-panchang-computation-method-register.json",
  solarLunarLongitudeModel: "data/knowledge-base/panchang-festival/production/solar-lunar-longitude-computation-model.json",
  sunriseSunsetModel: "data/knowledge-base/panchang-festival/production/sunrise-sunset-computation-model.json",
  panchangElementDerivationModel: "data/knowledge-base/panchang-festival/production/panchang-element-derivation-model.json",
  ayanamsaRuntimePolicy: "data/knowledge-base/panchang-festival/production/ayanamsa-runtime-policy.json",
  varaPakshaKaranaModel: "data/knowledge-base/panchang-festival/production/vara-paksha-karana-computation-model.json",
  computedRecordSchema: "data/knowledge-base/panchang-festival/production/computed-panchang-daily-record-schema.json",
  manualVerificationPolicy: "data/knowledge-base/panchang-festival/production/post-computation-manual-verification-policy.json",
  externalExclusionAudit: "data/knowledge-base/panchang-festival/production/ag70i-external-panchang-site-exclusion-audit.json",
  noDailyComputationAudit: "data/knowledge-base/panchang-festival/production/ag70i-no-daily-panchang-computation-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70i-internal-panchang-astronomical-computation-model.json",
  readiness: "data/content-intelligence/quality-registry/ag70i-ag70j-panchang-daily-calculation-bank-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70i-to-ag70j-panchang-daily-calculation-bank-boundary.json",
  quality: "data/quality/ag70i-internal-panchang-astronomical-computation-model.json",
  preview: "data/quality/ag70i-internal-panchang-astronomical-computation-model-preview.json",
  doc: "docs/quality/AG70I_INTERNAL_PANCHANG_ASTRONOMICAL_COMPUTATION_MODEL.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const internalModel = {
  module_id: "AG70I",
  title: "Internal Panchang Astronomical Computation Model",
  status: "internal_panchang_astronomical_computation_model_defined_no_daily_records",
  purpose: "Define Drishvara's in-house Panchang computation model before any date-wise Panchang bank is populated.",
  source_of_truth_principle: {
    production_source_of_truth: "internal_governed_astronomical_computation",
    external_panchang_sites_used_as_source: false,
    external_panchang_sites_used_as_runtime_dependency: false,
    external_panchang_sites_used_for_data_generation: false,
    external_panchang_sites_used_for_public_claim: false,
    external_panchang_sites_allowed_only_for: "manual_post_computation_verification_after_drishvara_output"
  },
  computation_chain: [
    "date + location + timezone",
    "sunrise/sunset",
    "solar longitude",
    "lunar longitude",
    "moon_minus_sun_angular_difference",
    "tithi",
    "nakshatra",
    "yoga",
    "karana",
    "paksha",
    "vara",
    "later festival/observance rule engine",
    "later eclipse computation/event model"
  ],
  runtime_active_now: false,
  daily_records_created_now: 0,
  public_output_allowed_now: false
};

const computationMethod = {
  module_id: "AG70I",
  title: "Internal Panchang Computation Method Register",
  status: "internal_computation_method_register_created_no_runtime_activation",
  method_id: "drishvara_internal_panchang_model_v1",
  model_type: "in_house_astronomical_computation_contract",
  permitted_future_implementation_options: [
    "internal_algorithmic_implementation",
    "offline_ephemeris_or_astronomical_library_after_license_review",
    "locally_reproducible_calculation_module"
  ],
  prohibited_implementation_options: [
    "runtime_scraping_of_panchang_websites",
    "external_panchang_website_as_source_of_truth",
    "manual_date_guessing",
    "ai_generated_panchang_without_computation",
    "unrecorded_location_or_timezone_basis"
  ],
  selected_for_runtime_now: false,
  implementation_dependency_installed_now: false,
  license_review_completed_now: false,
  next_required_action_for_ag70j: "Create first internal computed daily Panchang records only after calculation implementation and one governed location basis are selected."
};

const solarLunarLongitudeModel = {
  module_id: "AG70I",
  title: "Solar and Lunar Longitude Computation Model",
  status: "solar_lunar_longitude_model_defined_no_values_generated",
  purpose: "Define required solar/lunar angular values for Panchang element derivation.",
  required_internal_values: [
    "sun_apparent_longitude_tropical",
    "moon_apparent_longitude_tropical",
    "ayanamsa_value_if_sidereal_conversion_required",
    "sun_longitude_sidereal",
    "moon_longitude_sidereal",
    "moon_minus_sun_angular_difference_0_360",
    "calculation_datetime_utc",
    "location_id",
    "calculation_model_version"
  ],
  normalization_rules: [
    "All angular values must be normalized to 0 <= value < 360.",
    "Moon-Sun angular difference must be normalized to 0 <= value < 360.",
    "Sidereal longitude must record the ayanamsa_id and ayanamsa_value used.",
    "Every computed value must carry calculation timestamp and model version."
  ],
  generated_values_now: 0
};

const sunriseSunsetModel = {
  module_id: "AG70I",
  title: "Sunrise and Sunset Computation Model",
  status: "sunrise_sunset_model_defined_no_values_generated",
  purpose: "Define location-specific sunrise/sunset basis for Vara and observance-day determination.",
  required_inputs: [
    "date_key",
    "latitude",
    "longitude",
    "timezone",
    "elevation_if_available",
    "calculation_method_id"
  ],
  required_outputs_later: [
    "sunrise_datetime_utc",
    "sunrise_datetime_local",
    "sunset_datetime_utc",
    "sunset_datetime_local",
    "local_day_boundary_rule",
    "review_status"
  ],
  rules: [
    "Vara is evaluated using local day/sunrise basis according to the observance rule later selected.",
    "Observance windows must state whether civil date or sunrise-based day boundary is applied.",
    "Date-only observance publication is blocked where start/end time is required."
  ],
  generated_values_now: 0
};

const panchangElementDerivationModel = {
  module_id: "AG70I",
  title: "Panchang Element Derivation Model",
  status: "panchang_element_derivation_model_defined_no_records_generated",
  purpose: "Define derivation rules for Tithi, Nakshatra and Yoga from internal astronomical values.",
  formulas: {
    tithi: {
      basis: "moon_minus_sun_angular_difference_0_360",
      segment_degrees: 12,
      index_rule: "floor(angle / 12) + 1",
      range: "1..30",
      boundary_rule: "Tithi changes when Moon-Sun angular difference crosses multiples of 12 degrees."
    },
    nakshatra: {
      basis: "moon_longitude_sidereal",
      segment_degrees: "13 + 1/3",
      index_rule: "floor(moon_longitude_sidereal / (13 + 1/3)) + 1",
      range: "1..27",
      boundary_rule: "Nakshatra changes when sidereal Moon longitude crosses 13°20′ segments."
    },
    yoga: {
      basis: "(sun_longitude_sidereal + moon_longitude_sidereal) mod 360",
      segment_degrees: "13 + 1/3",
      index_rule: "floor(combined_sidereal_longitude / (13 + 1/3)) + 1",
      range: "1..27",
      boundary_rule: "Yoga changes when combined sidereal Sun+Moon longitude crosses 13°20′ segments."
    }
  },
  required_window_outputs_later: [
    "element_index",
    "element_name",
    "start_datetime_utc",
    "end_datetime_utc",
    "start_datetime_local",
    "end_datetime_local",
    "calculation_confidence",
    "review_status"
  ],
  generated_records_now: 0
};

const ayanamsaRuntimePolicy = {
  module_id: "AG70I",
  title: "Ayanamsa Runtime Policy",
  status: "ayanamsa_runtime_policy_created_selection_still_blocked",
  purpose: "Keep ayanamsa explicit and versioned before sidereal calculations are used for public or daily records.",
  ayanamsa_selected_for_runtime_now: false,
  required_before_first_daily_record: [
    "ayanamsa_id",
    "ayanamsa_name",
    "definition_note",
    "model_version",
    "selection_justification",
    "review_status"
  ],
  rules: [
    "No sidereal Nakshatra or Yoga computation may be recorded without ayanamsa_id.",
    "No mixed ayanamsa basis is allowed within the same computation batch.",
    "If ayanamsa policy changes, a new computation model version must be created."
  ],
  daily_record_generation_blocked_until_selected: true
};

const varaPakshaKaranaModel = {
  module_id: "AG70I",
  title: "Vara, Paksha and Karana Computation Model",
  status: "vara_paksha_karana_model_defined_no_records_generated",
  purpose: "Define supporting Panchang element derivations.",
  derivation_rules: {
    paksha: {
      basis: "moon_minus_sun_angular_difference_0_360",
      shukla_rule: "0 <= angle < 180",
      krishna_rule: "180 <= angle < 360",
      note: "Record must carry normalized angle and tithi index."
    },
    karana: {
      basis: "half_tithi_segment",
      segment_degrees: 6,
      index_rule: "floor(angle / 6) + 1",
      boundary_rule: "Karana changes every 6 degrees of Moon-Sun angular difference."
    },
    vara: {
      basis: "local_date_or_sunrise_based_day_rule",
      rule_status: "final observance-specific day-boundary rule deferred to festival/observance stage",
      note: "Record must state whether civil local date or sunrise-based boundary was applied."
    }
  },
  generated_records_now: 0
};

const computedRecordSchema = {
  module_id: "AG70I",
  title: "Computed Panchang Daily Record Schema",
  status: "computed_panchang_daily_record_schema_created_no_records",
  purpose: "Define the future daily Panchang record written by AG70J.",
  required_fields: [
    "panchang_daily_record_id",
    "date_key",
    "location_id",
    "latitude",
    "longitude",
    "timezone",
    "calculation_model_id",
    "calculation_model_version",
    "ayanamsa_id",
    "sunrise_datetime_local",
    "sunset_datetime_local",
    "sun_longitude_sidereal",
    "moon_longitude_sidereal",
    "moon_minus_sun_angular_difference",
    "tithi",
    "tithi_start_datetime_local",
    "tithi_end_datetime_local",
    "nakshatra",
    "nakshatra_start_datetime_local",
    "nakshatra_end_datetime_local",
    "yoga",
    "yoga_start_datetime_local",
    "yoga_end_datetime_local",
    "karana",
    "karana_start_datetime_local",
    "karana_end_datetime_local",
    "paksha",
    "vara",
    "calculation_generated_at",
    "internal_validation_status",
    "post_computation_manual_verification_status",
    "public_output_allowed"
  ],
  records_created_now: 0
};

const manualVerificationPolicy = {
  module_id: "AG70I",
  title: "Post-Computation Manual Verification Policy",
  status: "post_computation_manual_verification_policy_created",
  purpose: "Define how external Panchang references may be used only after Drishvara computes its own output.",
  policy: {
    external_sites_in_production_model: false,
    external_sites_as_source_of_truth: false,
    external_sites_as_runtime_dependency: false,
    external_sites_as_data_generation_input: false,
    external_sites_for_public_claim: false,
    external_sites_for_manual_check_after_output: true,
    manual_check_process: "Operator may paste Drishvara-generated computed output into review workflow; external references may then be compared manually as verification notes only."
  },
  required_manual_verification_record_fields_later: [
    "drishvara_output_record_id",
    "verification_reference_name",
    "checked_field",
    "match_status",
    "difference_note",
    "operator_review_note",
    "final_action"
  ]
};

const externalExclusionAudit = {
  module_id: "AG70I",
  title: "External Panchang Site Exclusion Audit",
  status: "external_panchang_site_exclusion_audit_passed",
  external_panchang_sites_used_as_source: false,
  external_panchang_sites_used_as_runtime_dependency: false,
  external_panchang_sites_used_for_data_generation: false,
  external_panchang_sites_used_for_public_claim: false,
  external_panchang_sites_used_for_manual_post_output_verification_only: true,
  random_panchang_website_dependency_present: false,
  production_model_is_internal: true
};

const noDailyComputationAudit = {
  module_id: "AG70I",
  title: "No Daily Panchang Computation Audit",
  status: "no_daily_panchang_computation_audit_passed",
  panchang_daily_records_created_now: 0,
  observance_events_created_now: 0,
  eclipse_events_created_now: 0,
  context_interpretation_records_created_now: 0,
  generated_word_json_modified: false,
  ui_display_changed: false,
  supabase_activation_performed: false,
  backend_runtime_activated: false,
  public_panchang_output_allowed_now: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_internal_panchang_astronomical_computation_model",
  current_status: "internal_panchang_astronomical_computation_model_defined_no_daily_records",
  ag70i_files: {
    internal_model: outputs.internalModel,
    computation_method: outputs.computationMethod,
    solar_lunar_longitude_model: outputs.solarLunarLongitudeModel,
    sunrise_sunset_model: outputs.sunriseSunsetModel,
    panchang_element_derivation_model: outputs.panchangElementDerivationModel,
    ayanamsa_runtime_policy: outputs.ayanamsaRuntimePolicy,
    vara_paksha_karana_model: outputs.varaPakshaKaranaModel,
    computed_record_schema: outputs.computedRecordSchema,
    manual_verification_policy: outputs.manualVerificationPolicy,
    external_exclusion_audit: outputs.externalExclusionAudit,
    no_daily_computation_audit: outputs.noDailyComputationAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    panchang_daily_records: 0,
    observance_events: 0,
    eclipse_events: 0,
    context_interpretation_records: 0
  },
  next_required_stage: "AG70J — Panchang Daily Calculation Bank Batch 01"
};

const review = {
  module_id: "AG70I",
  title: "Internal Panchang Astronomical Computation Model Production Setup",
  status: "ag70i_internal_panchang_astronomical_computation_model_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70h_review: "data/content-intelligence/quality-reviews/ag70h-panchang-calculation-source-location-basis-decision.json",
    computation_input_contract: "data/knowledge-base/panchang-festival/production/panchang-computation-input-contract.json"
  },
  generated_records: outputs,
  summary: {
    internal_panchang_model_defined: true,
    computation_method_register_created: true,
    solar_lunar_longitude_model_created: true,
    sunrise_sunset_model_created: true,
    panchang_element_derivation_model_created: true,
    ayanamsa_runtime_policy_created: true,
    vara_paksha_karana_model_created: true,
    computed_daily_record_schema_created: true,
    post_computation_manual_verification_policy_created: true,
    external_panchang_site_exclusion_audit_passed: true,
    panchang_manifest_updated: true,
    external_panchang_sites_used_as_source: false,
    external_panchang_sites_used_as_runtime_dependency: false,
    external_panchang_sites_used_for_data_generation: false,
    external_panchang_sites_used_for_manual_post_output_verification_only: true,
    actual_panchang_daily_records_created_now: false,
    actual_observance_events_created_now: false,
    actual_eclipse_events_created_now: false,
    context_interpretation_records_created_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70j: true
  }
};

const readiness = {
  module_id: "AG70I",
  title: "AG70J Panchang Daily Calculation Bank Readiness Record",
  status: "ready_for_ag70j_panchang_daily_calculation_bank",
  ready_for_ag70j: true,
  next_stage: "AG70J — Panchang Daily Calculation Bank Batch 01",
  reason: "Internal Panchang computation model has been defined. AG70J may create first controlled daily computation records only after using the internal model and recording location/ayanamsa/model basis."
};

const boundary = {
  module_id: "AG70I",
  title: "AG70I to AG70J Panchang Daily Calculation Bank Boundary",
  status: "ag70j_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create first controlled Panchang daily calculation bank records.",
    "Use only internal computation model outputs.",
    "Record date, location, timezone, model version and ayanamsa basis.",
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
  module_id: "AG70I",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70I",
  status: review.status,
  internal_panchang_model_defined: 1,
  external_panchang_sites_used_as_source: 0,
  external_panchang_sites_used_as_runtime_dependency: 0,
  external_panchang_sites_used_for_data_generation: 0,
  external_panchang_sites_used_for_manual_post_output_verification_only: 1,
  actual_panchang_daily_records_created_now: 0,
  actual_observance_events_created_now: 0,
  actual_eclipse_events_created_now: 0,
  context_interpretation_records_created_now: 0,
  ready_for_ag70j: 1
};

const doc = `# AG70I — Internal Panchang Astronomical Computation Model Production Setup

AG70I defines Drishvara's in-house Panchang astronomical computation model.

## Core principle

External Panchang websites are not part of the production model. They are not source of truth, not runtime dependency, not data-generation input, and not public-claim basis.

They may be used only later as manual post-computation verification after Drishvara has generated its own computed Panchang output.

## Internal computation chain

Date + location + timezone → sunrise/sunset → solar longitude → lunar longitude → Moon-Sun angular difference → Tithi → Nakshatra → Yoga → Karana → Paksha → Vara → later observance/festival/eclipse logic.

## Created

- Internal Panchang astronomical computation model
- Internal computation method register
- Solar/lunar longitude model
- Sunrise/sunset computation model
- Panchang element derivation model
- Ayanamsa runtime policy
- Vara/Paksha/Karana model
- Computed daily Panchang record schema
- Post-computation manual verification policy
- External Panchang site exclusion audit
- No daily computation audit

## Not done

- No daily Panchang records.
- No festival/observance event records.
- No eclipse event records.
- No context interpretation records.
- No public Panchang output.
- No UI/backend/Supabase activation.
`;

writeJson(outputs.internalModel, internalModel);
writeJson(outputs.computationMethod, computationMethod);
writeJson(outputs.solarLunarLongitudeModel, solarLunarLongitudeModel);
writeJson(outputs.sunriseSunsetModel, sunriseSunsetModel);
writeJson(outputs.panchangElementDerivationModel, panchangElementDerivationModel);
writeJson(outputs.ayanamsaRuntimePolicy, ayanamsaRuntimePolicy);
writeJson(outputs.varaPakshaKaranaModel, varaPakshaKaranaModel);
writeJson(outputs.computedRecordSchema, computedRecordSchema);
writeJson(outputs.manualVerificationPolicy, manualVerificationPolicy);
writeJson(outputs.externalExclusionAudit, externalExclusionAudit);
writeJson(outputs.noDailyComputationAudit, noDailyComputationAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70I internal Panchang astronomical computation model generated.");
console.log("✅ External Panchang sites excluded from production model/source/runtime/data-generation.");
console.log("✅ No daily Panchang records, observance events, eclipse events, context records, UI or backend mutation performed.");
