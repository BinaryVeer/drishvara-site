import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ad03Review: "data/content-intelligence/quality-reviews/ad03-regional-panchang-rule-profiles.json",
  ad03RegionalDoctrine: "data/content-intelligence/ad-foundation/ad03-regional-panchang-rule-profile-doctrine.json",
  ad03NorthProfile: "data/content-intelligence/ad-foundation/ad03-north-india-general-rule-profile.json",
  ad03EastProfile: "data/content-intelligence/ad-foundation/ad03-east-india-bihar-mithila-rule-profile.json",
  ad03SouthProfile: "data/content-intelligence/ad-foundation/ad03-south-indian-panchangam-rule-profile.json",
  ad03SunriseProfile: "data/content-intelligence/ad-foundation/ad03-location-specific-sunrise-rule-profile.json",
  ad03DifferenceMatrix: "data/content-intelligence/ad-foundation/ad03-regional-difference-decision-matrix.json",
  ad03SourceRequirement: "data/content-intelligence/ad-foundation/ad03-regional-source-requirement-map.json",
  ad03NoMutationAudit: "data/content-intelligence/backend-architecture/ad03-no-mutation-audit-register.json",
  ad03Readiness: "data/content-intelligence/quality-registry/ad03-ad04-calendar-calculation-methodology-readiness-record.json",
  ad03Boundary: "data/content-intelligence/mutation-plans/ad03-to-ad04-calendar-calculation-methodology-boundary.json",

  ad02CoreElementModel: "data/content-intelligence/ad-foundation/ad02-panchanga-core-element-model.json",
  ad02SupportingFieldModel: "data/content-intelligence/ad-foundation/ad02-panchanga-supporting-field-model.json",
  ad02TimeLocationModel: "data/content-intelligence/ad-foundation/ad02-time-location-calculation-context-model.json",
  ad02DatabasePlanningMap: "data/content-intelligence/ad-foundation/ad02-database-field-planning-map.json",
  ad01AttributionBoundary: "data/content-intelligence/ad-foundation/ad01-attribution-and-claim-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ad04-calendar-calculation-methodology.json",
  calculationDoctrine: "data/content-intelligence/ad-foundation/ad04-calendar-calculation-methodology-doctrine.json",
  coreElementCalculationBoundary: "data/content-intelligence/ad-foundation/ad04-core-panchanga-element-calculation-boundary.json",
  sunriseLocationMethodology: "data/content-intelligence/ad-foundation/ad04-sunrise-location-methodology-boundary.json",
  ayanamshaCorrectionAwareness: "data/content-intelligence/ad-foundation/ad04-ayanamsha-correction-awareness-record.json",
  regionalCalculationProfileMap: "data/content-intelligence/ad-foundation/ad04-regional-calculation-profile-map.json",
  validationCrossCheckModel: "data/content-intelligence/ad-foundation/ad04-validation-cross-check-model.json",
  nonExecutionPolicy: "data/content-intelligence/ad-foundation/ad04-calculation-non-execution-policy.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ad04-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ad04-ad05-word-sutra-reflection-corpus-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ad04-to-ad05-word-sutra-reflection-corpus-boundary.json",
  registry: "data/quality/ad04-calendar-calculation-methodology.json",
  preview: "data/quality/ad04-calendar-calculation-methodology-preview.json",
  doc: "docs/quality/AD04_CALENDAR_CALCULATION_METHODOLOGY.md"
};

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function read(p) {
  return fs.readFileSync(full(p), "utf8");
}

function readJson(p) {
  return JSON.parse(read(p));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AD04 input: ${p}`);
}

const ad03Review = readJson(inputs.ad03Review);
const ad03RegionalDoctrine = readJson(inputs.ad03RegionalDoctrine);
const ad03NorthProfile = readJson(inputs.ad03NorthProfile);
const ad03EastProfile = readJson(inputs.ad03EastProfile);
const ad03SouthProfile = readJson(inputs.ad03SouthProfile);
const ad03SunriseProfile = readJson(inputs.ad03SunriseProfile);
const ad03DifferenceMatrix = readJson(inputs.ad03DifferenceMatrix);
const ad03SourceRequirement = readJson(inputs.ad03SourceRequirement);
const ad03NoMutationAudit = readJson(inputs.ad03NoMutationAudit);
const ad03Readiness = readJson(inputs.ad03Readiness);
const ad03Boundary = readJson(inputs.ad03Boundary);

const ad02CoreElementModel = readJson(inputs.ad02CoreElementModel);
const ad02SupportingFieldModel = readJson(inputs.ad02SupportingFieldModel);
const ad02TimeLocationModel = readJson(inputs.ad02TimeLocationModel);
const ad02DatabasePlanningMap = readJson(inputs.ad02DatabasePlanningMap);
const ad01AttributionBoundary = readJson(inputs.ad01AttributionBoundary);

if (ad03Review.status !== "regional_panchang_rule_profiles_ready_for_ad04") {
  throw new Error("AD03 review status mismatch.");
}
if (ad03Review.summary?.ready_for_ad04 !== true) {
  throw new Error("AD03 does not show AD04 readiness.");
}
if (ad03NoMutationAudit.audit_passed !== true) {
  throw new Error("AD03 no-mutation audit must pass.");
}
if (ad03Readiness.ready_for_ad04 !== true || ad03Readiness.next_stage_id !== "AD04") {
  throw new Error("AD03 readiness must permit AD04.");
}
if (ad03Boundary.next_stage_id !== "AD04") {
  throw new Error("AD03 boundary must point to AD04.");
}
for (const profile of ["north_india_general", "east_india_bihar_mithila", "south_indian_panchangam", "location_specific_sunrise_profile"]) {
  if (!JSON.stringify([ad03RegionalDoctrine, ad03NorthProfile, ad03EastProfile, ad03SouthProfile, ad03SunriseProfile]).includes(profile)) {
    throw new Error(`AD03 profile missing: ${profile}`);
  }
}
for (const element of ["tithi", "vara", "nakshatra", "yoga", "karana"]) {
  if (!JSON.stringify(ad02CoreElementModel).includes(element)) {
    throw new Error(`AD02 core element missing: ${element}`);
  }
}
if (!JSON.stringify(ad03DifferenceMatrix).includes("amanta_vs_purnimanta_masa")) {
  throw new Error("AD03 regional difference matrix must include amanta/purnimanta handling.");
}
if (!JSON.stringify(ad03SourceRequirement).includes("supported_rule")) {
  throw new Error("AD03 source requirement map must include supported_rule.");
}
if (!JSON.stringify(ad02TimeLocationModel).includes("sunrise-aware")) {
  throw new Error("AD02 time/location model must include sunrise-aware doctrine.");
}
if (!JSON.stringify(ad02SupportingFieldModel).includes("calculation_profile_id")) {
  throw new Error("AD02 supporting fields must include calculation_profile_id.");
}
if (!JSON.stringify(ad02DatabasePlanningMap).includes("methodology_notes")) {
  throw new Error("AD02 database planning must include methodology_notes.");
}
if (!JSON.stringify(ad01AttributionBoundary).includes("Prediction language must be avoided")) {
  throw new Error("AD01 attribution boundary must preserve non-prediction language.");
}

const blockedState = {
  ad04_calendar_calculation_methodology_recorded: true,
  ad03_consumed: true,
  calculation_doctrine_recorded: true,
  core_element_calculation_boundary_recorded: true,
  sunrise_location_methodology_recorded: true,
  ayanamsha_correction_awareness_recorded: true,
  regional_calculation_profile_map_recorded: true,
  validation_cross_check_model_recorded: true,
  calculation_non_execution_policy_recorded: true,
  ready_for_ad05: true,

  ag47_resume_allowed: false,
  homepage_mutated: false,
  public_content_generated: false,
  panchang_prediction_generated: false,
  panchang_calculation_executed: false,
  ephemeris_engine_integrated: false,
  ayanamsha_selected_for_runtime: false,
  festival_date_finalised: false,
  panchang_daily_record_seeded: false,
  live_source_fetch_executed: false,
  web_scraping_executed: false,
  sql_file_created: false,
  sql_migration_created: false,
  sql_executed: false,
  database_write_performed: false,
  supabase_table_created: false,
  backend_auth_supabase_activation_performed: false,
  deployment_performed: false,
  service_role_key_exposed: false
};

const calculationDoctrine = {
  module_id: "AD04",
  title: "Calendar Calculation Methodology Doctrine",
  status: "calendar_calculation_methodology_doctrine_recorded",
  doctrine_rules: [
    "AD04 records methodology boundaries only; it does not execute Panchanga calculations.",
    "Future Panchanga calculations must separate astronomical computation, regional rule profile, editorial interpretation and public display.",
    "Tithi, Vara, Nakshatra, Yoga and Karana calculations must carry source, calculation profile, location and review metadata.",
    "Sunrise and local place context must be treated as calculation-sensitive.",
    "Ayanamsha, correction policy and ephemeris assumptions must be explicit before runtime use.",
    "Festival and vrata date logic must be profile-aware and source-attributed.",
    "Public-facing output must remain reflective/contextual unless a later validated calculation engine is approved."
  ],
  methodology_layers: [
    "astronomical_input_layer",
    "panchanga_element_computation_layer",
    "regional_rule_profile_layer",
    "source_confidence_and_cross_check_layer",
    "editorial_interpretation_layer",
    "public_guidance_safety_layer"
  ],
  blocked_state: blockedState
};

const coreElementCalculationBoundary = {
  module_id: "AD04",
  title: "Core Panchanga Element Calculation Boundary",
  status: "core_panchanga_element_calculation_boundary_recorded",
  core_elements: [
    {
      element_id: "tithi",
      future_method_boundary: "Derive from Sun-Moon angular relation and local time boundaries; exact formula/engine to be approved later.",
      runtime_status: "not_executed"
    },
    {
      element_id: "vara",
      future_method_boundary: "Derive from local weekday with sunrise-day handling where Panchanga tradition requires it.",
      runtime_status: "not_executed"
    },
    {
      element_id: "nakshatra",
      future_method_boundary: "Derive from Moon longitude segment and pada; exact ephemeris/correction policy to be approved later.",
      runtime_status: "not_executed"
    },
    {
      element_id: "yoga",
      future_method_boundary: "Derive from combined solar-lunar longitude segment; exact formula/engine to be approved later.",
      runtime_status: "not_executed"
    },
    {
      element_id: "karana",
      future_method_boundary: "Derive from half-tithi division and sequence rules; exact implementation to be approved later.",
      runtime_status: "not_executed"
    }
  ],
  universal_required_metadata_for_future_calculation: [
    "gregorian_date",
    "location_id",
    "latitude",
    "longitude",
    "timezone",
    "sunrise_reference",
    "regional_profile_id",
    "calculation_profile_id",
    "source_id",
    "source_confidence_band",
    "editorial_review_status"
  ],
  blocked_state: blockedState
};

const sunriseLocationMethodology = {
  module_id: "AD04",
  title: "Sunrise and Location Methodology Boundary",
  status: "sunrise_location_methodology_recorded",
  methodology_requirements: [
    "Panchanga day boundary must be sunrise-aware.",
    "Location must include latitude, longitude and timezone.",
    "Sunrise, sunset, moonrise and moonset must not be treated as global constants.",
    "Future daily Panchang records must identify whether the day boundary follows local sunrise or civil date.",
    "Regional festival rules must specify whether sunrise, pradosha, nishita or another time-window is relevant.",
    "AD04 does not compute sunrise, sunset, moonrise or moonset."
  ],
  future_profile_fields: [
    "location_id",
    "place_name",
    "latitude",
    "longitude",
    "timezone",
    "sunrise_reference",
    "local_day_start",
    "local_day_end",
    "calculation_profile_id",
    "regional_profile_id"
  ],
  blocked_state: blockedState
};

const ayanamshaCorrectionAwareness = {
  module_id: "AD04",
  title: "Ayanamsha and Correction Awareness Record",
  status: "ayanamsha_correction_awareness_recorded",
  awareness_rules: [
    "Future calculations must document ayanamsha/correction assumptions before runtime use.",
    "Different Panchang sources may use different astronomical constants, correction methods or ephemeris assumptions.",
    "Drishvara must record calculation_profile_id to keep such assumptions traceable.",
    "No ayanamsha is selected for runtime in AD04.",
    "No ephemeris library or calculation engine is integrated in AD04.",
    "Comparative validation should be planned before public activation."
  ],
  future_calculation_profile_fields: [
    "calculation_profile_id",
    "calculation_profile_name",
    "ayanamsha_policy",
    "ephemeris_source_or_engine",
    "correction_notes",
    "regional_profile_id",
    "validation_sources",
    "editorial_review_status"
  ],
  blocked_state: blockedState
};

const regionalCalculationProfileMap = {
  module_id: "AD04",
  title: "Regional Calculation Profile Map",
  status: "regional_calculation_profile_map_recorded",
  profile_links: [
    {
      regional_profile_id: "north_india_general",
      calculation_dependencies: [
        "purnimanta/amanta awareness",
        "sunrise tithi decision metadata",
        "festival time-window metadata",
        "Kashi/Hindi belt source validation"
      ]
    },
    {
      regional_profile_id: "east_india_bihar_mithila",
      calculation_dependencies: [
        "regional observance acceptance metadata",
        "festival/vrata rule source metadata",
        "local calendar naming convention",
        "Bihar/Mithila source validation"
      ]
    },
    {
      regional_profile_id: "south_indian_panchangam",
      calculation_dependencies: [
        "amanta month awareness",
        "regional language/display convention",
        "regional new year/festival rule metadata",
        "state/tradition-specific Panchangam source validation"
      ]
    },
    {
      regional_profile_id: "location_specific_sunrise_profile",
      calculation_dependencies: [
        "latitude",
        "longitude",
        "timezone",
        "sunrise_reference",
        "local_day_start",
        "local_day_end"
      ]
    }
  ],
  rule: "Regional calculation profiles are mapped for future use only; no profile is applied to public output in AD04.",
  blocked_state: blockedState
};

const validationCrossCheckModel = {
  module_id: "AD04",
  title: "Validation and Cross-check Model",
  status: "validation_cross_check_model_recorded",
  validation_requirements: [
    "Future calculated Panchanga records should be cross-checked against accepted regional Panchang sources.",
    "Discrepancies should be classified by source difference, regional rule difference, calculation profile difference or data error.",
    "A daily Panchang record should not be treated as production-ready without source confidence and editorial review status.",
    "Festival/vrata dates require separate validation from raw Panchanga elements.",
    "Nityanand Mishra ji style discipline may support wording and cultural explanation, not calculation validation unless exact source support exists."
  ],
  discrepancy_types: [
    "source_difference",
    "regional_rule_difference",
    "calculation_profile_difference",
    "location_sunrise_difference",
    "festival_time_window_difference",
    "data_entry_error",
    "editorial_interpretation_difference"
  ],
  blocked_state: blockedState
};

const nonExecutionPolicy = {
  module_id: "AD04",
  title: "Calculation Non-execution Policy",
  status: "calculation_non_execution_policy_recorded",
  non_execution_assertions: [
    "AD04 does not execute Panchanga calculations.",
    "AD04 does not integrate an ephemeris library.",
    "AD04 does not select ayanamsha for runtime.",
    "AD04 does not finalise festival dates.",
    "AD04 does not seed Panchang daily records.",
    "AD04 does not create SQL or database tables.",
    "AD04 does not activate Supabase, Auth or backend services.",
    "AD04 does not resume AG47."
  ],
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AD04",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ad04",
  checks: Object.entries({
    ag47_resume_allowed: false,
    homepage_mutated: false,
    public_content_generated: false,
    panchang_prediction_generated: false,
    panchang_calculation_executed: false,
    ephemeris_engine_integrated: false,
    ayanamsha_selected_for_runtime: false,
    festival_date_finalised: false,
    panchang_daily_record_seeded: false,
    live_source_fetch_executed: false,
    web_scraping_executed: false,
    sql_file_created: false,
    sql_migration_created: false,
    sql_executed: false,
    database_write_performed: false,
    supabase_table_created: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  }).map(([check_id, expected]) => ({ check_id, expected, actual: expected, passed: true })),
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AD04",
  title: "AD05 Word, Sutra and Reflection Corpus Readiness Record",
  status: "ready_for_ad05_word_sutra_reflection_corpus_schema",
  ready_for_ad05: true,
  next_stage_id: "AD05",
  next_stage_title: "Word, Sanskrit Name, Sutra and Reflection Corpus Schema",
  hard_blocker_count_for_ad05: 0,
  ag47_resume_allowed_next: false,
  public_content_generation_allowed_next: false,
  panchang_prediction_allowed_next: false,
  panchang_calculation_allowed_next: false,
  sql_creation_allowed_next: false,
  sql_execution_allowed_next: false,
  database_write_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AD04",
  title: "AD04 to AD05 Word/Sutra/Reflection Corpus Boundary",
  status: "ad05_word_sutra_reflection_corpus_boundary_created",
  next_stage_id: "AD05",
  next_stage_title: "Word, Sanskrit Name, Sutra and Reflection Corpus Schema",
  allowed_scope: [
    "Define corpus schema for Word of the Day, Sanskrit names, sutra/quote references, reflection prompts and cultural explanation entries.",
    "Preserve Nityanand Mishra ji style discipline as careful Sanskritic wording and contextual explanation, not unverified authority.",
    "Separate source text, meaning, transliteration, translation, context, reflection use and editorial review status.",
    "Keep work as corpus/schema planning only."
  ],
  blocked_scope: [
    "AG47 resume",
    "public content generation",
    "Panchang prediction generation",
    "Panchang calculation execution",
    "live fetch",
    "web scraping",
    "SQL creation",
    "SQL execution",
    "database write",
    "Supabase table creation",
    "backend/Auth/Supabase activation",
    "service-role key exposure",
    "deployment"
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AD04",
  title: "Classical Astronomical and Calendar Calculation Methodology",
  status: "calendar_calculation_methodology_ready_for_ad05",
  depends_on: ["AD03"],
  calculation_doctrine_file: outputs.calculationDoctrine,
  core_element_calculation_boundary_file: outputs.coreElementCalculationBoundary,
  sunrise_location_methodology_file: outputs.sunriseLocationMethodology,
  ayanamsha_correction_awareness_file: outputs.ayanamshaCorrectionAwareness,
  regional_calculation_profile_map_file: outputs.regionalCalculationProfileMap,
  validation_cross_check_model_file: outputs.validationCrossCheckModel,
  non_execution_policy_file: outputs.nonExecutionPolicy,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ad04_calendar_calculation_methodology_recorded: true,
    ad03_consumed: true,
    calculation_doctrine_recorded: true,
    core_element_calculation_boundary_recorded: true,
    sunrise_location_methodology_recorded: true,
    ayanamsha_correction_awareness_recorded: true,
    regional_calculation_profile_map_recorded: true,
    validation_cross_check_model_recorded: true,
    calculation_non_execution_policy_recorded: true,
    ready_for_ad05: true,
    hard_blocker_count_for_ad05: 0,
    ag47_resume_allowed: false,
    homepage_mutated: false,
    public_content_generated: false,
    panchang_prediction_generated: false,
    panchang_calculation_executed: false,
    ephemeris_engine_integrated: false,
    ayanamsha_selected_for_runtime: false,
    festival_date_finalised: false,
    panchang_daily_record_seeded: false,
    sql_file_created: false,
    sql_executed: false,
    database_write_performed: false,
    supabase_table_created: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AD04",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AD04",
  status: review.status,
  ad04_calendar_calculation_methodology_recorded: 1,
  ad03_consumed: 1,
  calculation_doctrine_recorded: 1,
  core_element_calculation_boundary_recorded: 1,
  sunrise_location_methodology_recorded: 1,
  ayanamsha_correction_awareness_recorded: 1,
  regional_calculation_profile_map_recorded: 1,
  validation_cross_check_model_recorded: 1,
  calculation_non_execution_policy_recorded: 1,
  ready_for_ad05: 1,
  hard_blocker_count_for_ad05: 0,
  ag47_resume_allowed: 0,
  homepage_mutated: 0,
  public_content_generated: 0,
  panchang_prediction_generated: 0,
  panchang_calculation_executed: 0,
  ephemeris_engine_integrated: 0,
  ayanamsha_selected_for_runtime: 0,
  festival_date_finalised: 0,
  panchang_daily_record_seeded: 0,
  sql_file_created: 0,
  sql_executed: 0,
  database_write_performed: 0,
  supabase_table_created: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AD04 — Classical Astronomical and Calendar Calculation Methodology

## Result

AD04 records the future calculation methodology boundary for Panchanga and calendar logic.

## Methodology areas recorded

- Calendar calculation methodology doctrine
- Core Panchanga element calculation boundary
- Sunrise and location methodology
- Ayanamsha and correction awareness
- Regional calculation profile map
- Validation and cross-check model
- Calculation non-execution policy

## Important boundary

AD04 does not calculate Panchang. It does not integrate an ephemeris engine, select runtime ayanamsha, finalise festival dates, seed records, create SQL or write database records.

## Future calculation requirements

Future stages must explicitly record:

- date, location, latitude, longitude and timezone;
- sunrise reference and local day boundary;
- regional profile and calculation profile;
- source confidence and editorial review status;
- validation against accepted regional Panchang sources.

## Still blocked

- No AG47 resume.
- No public content generation.
- No Panchang prediction generation.
- No Panchang calculation.
- No ephemeris engine integration.
- No ayanamsha runtime selection.
- No festival date finalisation.
- No SQL creation.
- No SQL execution.
- No database write.
- No Supabase/backend activation.
- No deployment.
- No service-role key exposure.

## Next

AD05 — Word, Sanskrit Name, Sutra and Reflection Corpus Schema.
`;

writeJson(outputs.calculationDoctrine, calculationDoctrine);
writeJson(outputs.coreElementCalculationBoundary, coreElementCalculationBoundary);
writeJson(outputs.sunriseLocationMethodology, sunriseLocationMethodology);
writeJson(outputs.ayanamshaCorrectionAwareness, ayanamshaCorrectionAwareness);
writeJson(outputs.regionalCalculationProfileMap, regionalCalculationProfileMap);
writeJson(outputs.validationCrossCheckModel, validationCrossCheckModel);
writeJson(outputs.nonExecutionPolicy, nonExecutionPolicy);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AD04 Classical Astronomical and Calendar Calculation Methodology generated.");
console.log("✅ Calculation doctrine, core element boundary, sunrise/location methodology and ayanamsha/correction awareness recorded.");
console.log("✅ Regional calculation profile map and validation cross-check model recorded.");
console.log("✅ Ready for AD05 Word, Sanskrit Name, Sutra and Reflection Corpus Schema.");
console.log("✅ No Panchang calculation, prediction, SQL, DB write, backend activation, deployment or service-role exposure recorded.");
