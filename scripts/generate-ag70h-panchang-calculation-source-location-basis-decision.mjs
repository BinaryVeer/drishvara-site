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

const ag70b = readJson("data/content-intelligence/quality-reviews/ag70b-panchang-methodology-astronomical-data-foundation.json");
const ag70g = readJson("data/content-intelligence/quality-reviews/ag70g-sacred-fallback-source-bank.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const astronomicalModel = readJson("data/knowledge-base/panchang-festival/production/astronomical-calculation-model.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70b.status !== "ag70b_panchang_methodology_astronomical_data_foundation_completed") {
  throw new Error("AG70B Panchang foundation must exist before AG70H.");
}
if (ag70g.status !== "ag70g_sacred_fallback_source_bank_completed") {
  throw new Error("AG70G must be complete before AG70H corrective transition.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  decisionRecord: "data/knowledge-base/panchang-festival/production/ag70h-panchang-calculation-source-location-basis-decision.json",
  calculationSourceDecision: "data/knowledge-base/panchang-festival/production/panchang-calculation-source-decision-register.json",
  locationBasisPolicy: "data/knowledge-base/panchang-festival/production/panchang-location-basis-policy.json",
  timezoneGeoRule: "data/knowledge-base/panchang-festival/production/panchang-timezone-geocoordinate-rule.json",
  ayanamsaDecision: "data/knowledge-base/panchang-festival/production/panchang-ayanamsa-decision-register.json",
  computationInputContract: "data/knowledge-base/panchang-festival/production/panchang-computation-input-contract.json",
  observanceDependencyMap: "data/knowledge-base/panchang-festival/production/panchang-observance-dependency-map.json",
  eclipseCalculationDecision: "data/knowledge-base/panchang-festival/production/panchang-eclipse-calculation-source-decision.json",
  noComputationAudit: "data/knowledge-base/panchang-festival/production/ag70h-no-panchang-computation-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  correctedAg70gReadiness: "data/content-intelligence/quality-registry/ag70g-ag70h-context-interpretation-bank-readiness-record.json",
  correctedAg70gBoundary: "data/content-intelligence/mutation-plans/ag70g-to-ag70h-context-interpretation-bank-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag70h-panchang-calculation-source-location-basis-decision.json",
  readiness: "data/content-intelligence/quality-registry/ag70h-ag70i-panchang-astronomical-computation-model-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70h-to-ag70i-panchang-astronomical-computation-model-boundary.json",
  quality: "data/quality/ag70h-panchang-calculation-source-location-basis-decision.json",
  preview: "data/quality/ag70h-panchang-calculation-source-location-basis-decision-preview.json",
  doc: "docs/quality/AG70H_PANCHANG_CALCULATION_SOURCE_LOCATION_BASIS_DECISION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const decisionRecord = {
  module_id: "AG70H",
  title: "Panchang Calculation Source and Location Basis Decision",
  status: "ag70h_panchang_calculation_source_location_basis_decision_completed",
  purpose: "Correct the post-AG70G sequence and define the governed source/location basis before Panchang computation records are created.",
  corrective_transition_from_ag70g: true,
  corrected_next_path: [
    "AG70H — Panchang Calculation Source and Location Basis Decision",
    "AG70I — Panchang Astronomical Computation Model Production Setup",
    "AG70J — Panchang Daily Calculation Bank Batch 01",
    "AG70K — Festival / Observance Rule Bank Batch 01",
    "AG70L — Upcoming Observance Computed Event Bank Batch 01",
    "AG70M — Eclipse Event Bank Batch 01",
    "AG70N — Panchang Computation Validation and Cross-Check",
    "AG70O — Panchang Context Interpretation Production Data Bank Batch 01"
  ],
  decision_summary: {
    panchang_must_be_location_specific: true,
    no_global_panchang_record_allowed_without_location_basis: true,
    calculation_source_selected_for_runtime_now: false,
    location_default_selected_for_public_output_now: false,
    ayanamsa_selected_for_runtime_now: false,
    actual_panchang_computation_created_now: false,
    observance_events_created_now: false,
    eclipse_events_created_now: false
  }
};

const calculationSourceDecision = {
  module_id: "AG70H",
  title: "Panchang Calculation Source Decision Register",
  status: "calculation_source_decision_register_created_runtime_source_not_selected",
  purpose: "Create the governance decision record for selecting astronomical calculation sources/libraries before any Panchang computation.",
  decision_state: "runtime_calculation_source_not_selected_in_ag70h",
  required_future_decision_before_ag70i_runtime_setup: [
    "Select astronomical computation method/library.",
    "Confirm licence/reuse constraints.",
    "Confirm supported solar/lunar longitude precision.",
    "Confirm sunrise/sunset calculation support or source.",
    "Confirm eclipse calculation/table source and visibility basis.",
    "Confirm validation cross-check source policy."
  ],
  candidate_source_classes_to_review: [
    "astronomical_ephemeris_or_library",
    "solar_lunar_longitude_computation_method",
    "sunrise_sunset_calculation_method",
    "eclipse_calculation_or_verified_ephemeris_table",
    "independent_cross_check_reference"
  ],
  blocked_source_classes: [
    "random_panchang_website_as_source_of_truth",
    "ai_generated_panchang_values",
    "manual_festival_date_guess",
    "unreviewed_timezone_or_coordinate_guess"
  ],
  runtime_active_now: false
};

const locationBasisPolicy = {
  module_id: "AG70H",
  title: "Panchang Location Basis Policy",
  status: "location_basis_policy_created_no_default_public_location_selected",
  purpose: "Define location requirements before Panchang computation, because Tithi/observance windows depend on local sunrise/timezone/geocoordinates.",
  policy_rules: [
    "Every computed Panchang record must carry location_id, latitude, longitude and timezone.",
    "No universal all-India Panchang record may be treated as exact for observance windows.",
    "Default public location must be explicitly selected and reviewed before public computation.",
    "User-selected/subscriber location handling is deferred until backend/subscription design is approved.",
    "Static precomputed Panchang records must state the location basis in every record."
  ],
  required_location_fields: [
    "location_id",
    "display_name",
    "latitude",
    "longitude",
    "timezone",
    "country",
    "region",
    "default_for_public_output",
    "review_status",
    "source_reference_id"
  ],
  default_public_location_selected_now: false,
  user_location_runtime_active_now: false,
  location_records_created_now: 0
};

const timezoneGeoRule = {
  module_id: "AG70H",
  title: "Panchang Timezone and Geocoordinate Rule",
  status: "timezone_geocoordinate_rule_created_no_runtime_activation",
  required_for_computation: true,
  rules: [
    "All internal calculations must preserve UTC datetime and local datetime.",
    "All published observance windows must state local timezone and location basis.",
    "Sunrise-based day boundary must be calculated for the selected location.",
    "Eclipse visibility must be location/region-aware.",
    "Date-only observance records are insufficient where start/end windows exist."
  ],
  required_datetime_fields: [
    "start_datetime_utc",
    "end_datetime_utc",
    "start_datetime_local",
    "end_datetime_local",
    "timezone",
    "location_id",
    "calculation_generated_at"
  ],
  runtime_active_now: false
};

const ayanamsaDecision = {
  module_id: "AG70H",
  title: "Panchang Ayanamsa Decision Register",
  status: "ayanamsa_decision_register_created_ayanamsa_not_selected",
  purpose: "Block Panchang computation until the ayanamsa basis is selected and documented.",
  ayanamsa_selected_now: false,
  required_future_decision: [
    "Select ayanamsa basis.",
    "Record source/method justification.",
    "Apply same ayanamsa consistently to Tithi/Nakshatra/Yoga derivation where applicable.",
    "Record version/date of computation model."
  ],
  blocked: [
    "mixing_ayanamsa_bases",
    "unstated_ayanamsa",
    "public_panchang_output_without_ayanamsa_record"
  ]
};

const computationInputContract = {
  module_id: "AG70H",
  title: "Panchang Computation Input Contract",
  status: "panchang_computation_input_contract_created_no_calculation",
  purpose: "Define the minimum input object required before AG70I/AG70J can create computed Panchang records.",
  required_inputs: [
    "date_key",
    "calculation_datetime_utc",
    "location_id",
    "latitude",
    "longitude",
    "timezone",
    "ayanamsa_id",
    "calculation_source_id",
    "sun_longitude",
    "moon_longitude",
    "sunrise_local",
    "sunset_local",
    "validation_source_ids"
  ],
  required_outputs_later: [
    "tithi_window",
    "nakshatra_window",
    "yoga_window",
    "karana_window",
    "paksha",
    "vara",
    "sunrise_based_day_boundary",
    "observance_candidates",
    "eclipse_candidates_if_any"
  ],
  calculation_records_created_now: 0
};

const observanceDependencyMap = {
  module_id: "AG70H",
  title: "Panchang Observance Dependency Map",
  status: "observance_dependency_map_created_no_observance_events",
  purpose: "Map raw Panchang computations to later festival/upcoming observance/eclipses before context interpretation.",
  dependencies: [
    {
      downstream_module: "festival_observance_rule_bank",
      required_inputs: ["computed_tithi_window", "paksha", "masa_if_added", "sunrise_rule", "regional_rule"],
      output_later: "festival_or_vrata_declaration"
    },
    {
      downstream_module: "upcoming_observance_event_bank",
      required_inputs: ["observance_rule", "computed_start_end_window", "location_basis"],
      output_later: "named_observance_with_start_end_datetime"
    },
    {
      downstream_module: "eclipse_event_bank",
      required_inputs: ["eclipse_source_or_calculation", "visibility_region", "contact_times"],
      output_later: "solar_or_lunar_eclipse_event_record"
    },
    {
      downstream_module: "panchang_context_interpretation_bank",
      required_inputs: ["validated_daily_panchang_record", "validated_observance_event"],
      output_later: "context_signal_for_word_engine"
    }
  ],
  observance_events_created_now: 0,
  context_interpretation_records_created_now: 0
};

const eclipseCalculationDecision = {
  module_id: "AG70H",
  title: "Panchang Eclipse Calculation Source Decision",
  status: "eclipse_calculation_source_decision_created_no_eclipse_events",
  purpose: "Define that solar/lunar eclipse events require source/calculation review before being added to Upcoming Observance.",
  supported_eclipse_types: ["solar", "lunar"],
  required_future_fields: [
    "eclipse_id",
    "eclipse_type",
    "visibility_region",
    "location_id",
    "start_datetime_utc",
    "maximum_datetime_utc",
    "end_datetime_utc",
    "start_datetime_local",
    "maximum_datetime_local",
    "end_datetime_local",
    "source_or_calculation_reference_ids",
    "review_status",
    "public_use_permission"
  ],
  eclipse_source_selected_for_runtime_now: false,
  eclipse_events_created_now: 0
};

const noComputationAudit = {
  module_id: "AG70H",
  title: "No Panchang Computation Audit",
  status: "no_panchang_computation_audit_passed",
  calculation_source_selected_for_runtime_now: false,
  default_public_location_selected_now: false,
  ayanamsa_selected_for_runtime_now: false,
  panchang_daily_records_created_now: 0,
  observance_events_created_now: 0,
  eclipse_events_created_now: 0,
  context_interpretation_records_created_now: 0,
  generated_word_json_modified: false,
  ui_display_changed: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_panchang_calculation_source_location_basis_decision",
  current_status: "panchang_calculation_source_location_basis_decision_created_no_computation",
  ag70h_files: {
    decision_record: outputs.decisionRecord,
    calculation_source_decision: outputs.calculationSourceDecision,
    location_basis_policy: outputs.locationBasisPolicy,
    timezone_geocoordinate_rule: outputs.timezoneGeoRule,
    ayanamsa_decision: outputs.ayanamsaDecision,
    computation_input_contract: outputs.computationInputContract,
    observance_dependency_map: outputs.observanceDependencyMap,
    eclipse_calculation_decision: outputs.eclipseCalculationDecision,
    no_computation_audit: outputs.noComputationAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    panchang_daily_records: 0,
    observance_events: 0,
    eclipse_events: 0,
    context_interpretation_records: 0
  },
  next_required_stage: "AG70I — Panchang Astronomical Computation Model Production Setup"
};

const correctedAg70gReadiness = {
  module_id: "AG70G",
  title: "Corrected AG70G to AG70H Readiness Record",
  status: "ready_for_ag70h_panchang_calculation_source_location_basis_decision",
  legacy_filename_note: "This file name originally mentioned Context Interpretation. AG70H corrects the path so Panchang production data-bank work comes first.",
  ready_for_ag70h: true,
  next_stage: "AG70H — Panchang Calculation Source and Location Basis Decision",
  corrected_reason: "Context Interpretation must wait until Panchang calculation source, location basis, computed Panchang records, observance events and eclipse events are established."
};

const correctedAg70gBoundary = {
  module_id: "AG70G",
  title: "Corrected AG70G to AG70H Boundary",
  status: "ag70h_panchang_calculation_source_location_basis_boundary_defined",
  legacy_filename_note: "This file name originally mentioned Context Interpretation. AG70H corrects the path so Panchang production data-bank work comes first.",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create Panchang calculation source decision record.",
    "Create location/geocoordinate and timezone basis policy.",
    "Create ayanamsa decision placeholder.",
    "Create computation input contract.",
    "Create observance/eclipses dependency map.",
    "Do not create context interpretation records until computed Panchang records exist."
  ],
  blocked_scope_without_explicit_approval: [
    "generated/word-of-day.json replacement",
    "homepage UI change",
    "runtime selector activation",
    "AI-fabricated Sanskrit or meaning records",
    "unsupported etymology",
    "public Word output",
    "bulk dictionary/book content ingestion",
    "fallback word/name/term population",
    "context interpretation production records",
    "public Panchang output",
    "actual festival/observance date publication",
    "actual eclipse event publication",
    "Supabase/database writes",
    "backend/Auth activation"
  ]
};

const review = {
  module_id: "AG70H",
  title: "Panchang Calculation Source and Location Basis Decision",
  status: "ag70h_panchang_calculation_source_location_basis_decision_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70b_review: "data/content-intelligence/quality-reviews/ag70b-panchang-methodology-astronomical-data-foundation.json",
    ag70g_review: "data/content-intelligence/quality-reviews/ag70g-sacred-fallback-source-bank.json",
    astronomical_model: "data/knowledge-base/panchang-festival/production/astronomical-calculation-model.json"
  },
  corrected_transition: {
    old_next_stage_from_ag70g: "AG70H — Context Interpretation Bank",
    corrected_next_stage: "AG70H — Panchang Calculation Source and Location Basis Decision",
    reason: "Panchang production data must be completed before Word-context interpretation."
  },
  generated_records: outputs,
  summary: {
    ag70g_transition_corrected: true,
    panchang_calculation_source_decision_created: true,
    location_basis_policy_created: true,
    timezone_geocoordinate_rule_created: true,
    ayanamsa_decision_register_created: true,
    computation_input_contract_created: true,
    observance_dependency_map_created: true,
    eclipse_calculation_source_decision_created: true,
    panchang_manifest_updated: true,
    calculation_source_selected_for_runtime_now: false,
    default_public_location_selected_now: false,
    ayanamsa_selected_for_runtime_now: false,
    actual_panchang_daily_records_created_now: false,
    actual_observance_events_created_now: false,
    actual_eclipse_events_created_now: false,
    context_interpretation_records_created_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70i: true
  }
};

const readiness = {
  module_id: "AG70H",
  title: "AG70I Panchang Astronomical Computation Model Readiness Record",
  status: "ready_for_ag70i_panchang_astronomical_computation_model",
  ready_for_ag70i: true,
  next_stage: "AG70I — Panchang Astronomical Computation Model Production Setup",
  reason: "Calculation source/location/ayanamsa/input-contract governance has been defined. The next stage can set up the actual computation model while still blocking public output."
};

const boundary = {
  module_id: "AG70H",
  title: "AG70H to AG70I Panchang Astronomical Computation Model Boundary",
  status: "ag70i_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Select and record Panchang computation method/library/source.",
    "Define computation model inputs/outputs.",
    "Create model setup records without public Panchang output.",
    "Keep actual daily computed records for AG70J."
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
    "backend/Auth activation"
  ]
};

const quality = {
  module_id: "AG70H",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70H",
  status: review.status,
  ag70g_transition_corrected: 1,
  panchang_calculation_source_decision_created: 1,
  location_basis_policy_created: 1,
  ayanamsa_decision_register_created: 1,
  computation_input_contract_created: 1,
  observance_dependency_map_created: 1,
  eclipse_calculation_source_decision_created: 1,
  actual_panchang_daily_records_created_now: 0,
  actual_observance_events_created_now: 0,
  actual_eclipse_events_created_now: 0,
  context_interpretation_records_created_now: 0,
  ready_for_ag70i: 1
};

const doc = `# AG70H — Panchang Calculation Source and Location Basis Decision

AG70H corrects the post-AG70G path. Context Interpretation is deferred until Panchang production data is computed and validated.

## Corrected sequence

AG70H — Panchang Calculation Source and Location Basis Decision  
AG70I — Panchang Astronomical Computation Model Production Setup  
AG70J — Panchang Daily Calculation Bank Batch 01  
AG70K — Festival / Observance Rule Bank Batch 01  
AG70L — Upcoming Observance Computed Event Bank Batch 01  
AG70M — Eclipse Event Bank Batch 01  
AG70N — Panchang Computation Validation and Cross-Check  
AG70O — Panchang Context Interpretation Production Data Bank Batch 01

## Created

- Calculation source decision register
- Location basis policy
- Timezone/geocoordinate rule
- Ayanamsa decision register
- Computation input contract
- Observance dependency map
- Eclipse calculation source decision
- No-computation audit

## Not done

- No Panchang daily computation records.
- No festival/observance event records.
- No eclipse event records.
- No context interpretation records.
- No public Panchang output.
- No generated Word output.
- No UI/backend/Supabase activation.
`;

writeJson(outputs.decisionRecord, decisionRecord);
writeJson(outputs.calculationSourceDecision, calculationSourceDecision);
writeJson(outputs.locationBasisPolicy, locationBasisPolicy);
writeJson(outputs.timezoneGeoRule, timezoneGeoRule);
writeJson(outputs.ayanamsaDecision, ayanamsaDecision);
writeJson(outputs.computationInputContract, computationInputContract);
writeJson(outputs.observanceDependencyMap, observanceDependencyMap);
writeJson(outputs.eclipseCalculationDecision, eclipseCalculationDecision);
writeJson(outputs.noComputationAudit, noComputationAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.correctedAg70gReadiness, correctedAg70gReadiness);
writeJson(outputs.correctedAg70gBoundary, correctedAg70gBoundary);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70H Panchang calculation source/location basis decision generated.");
console.log("✅ AG70G transition corrected away from Context Interpretation and toward Panchang production.");
console.log("✅ No Panchang computations, observance events, eclipse events, context records, UI or backend mutation performed.");
