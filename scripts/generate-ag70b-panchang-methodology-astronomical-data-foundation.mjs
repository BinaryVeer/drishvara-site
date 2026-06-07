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

const ag70a = readJson("data/content-intelligence/quality-reviews/ag70a-module-production-data-bank-registry.json");
const registry = readJson("data/knowledge-base/production-data-bank-registry/ag70a-module-production-data-bank-registry.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70a.status !== "ag70a_module_production_data_bank_registry_completed") {
  throw new Error("AG70A registry must be complete before AG70B.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const panchangEntry = registry.modules.find((m) => m.module_id === "panchang_festival_view");
if (!panchangEntry) throw new Error("Panchang production registry entry missing.");

const outputs = {
  manifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  astronomicalModel: "data/knowledge-base/panchang-festival/production/astronomical-calculation-model.json",
  locationBank: "data/knowledge-base/panchang-festival/production/location-coordinate-bank.json",
  panchangMaster: "data/knowledge-base/panchang-festival/production/panchang-element-master-bank.json",
  derivationRules: "data/knowledge-base/panchang-festival/production/panchang-element-derivation-rules.json",
  observanceRuleBank: "data/knowledge-base/panchang-festival/production/festival-observance-rule-bank.json",
  upcomingSchema: "data/knowledge-base/upcoming-observance/production/upcoming-observance-schema.json",
  observanceEventBank: "data/knowledge-base/upcoming-observance/production/observance-event-bank.json",
  eclipseSchema: "data/knowledge-base/panchang-festival/production/eclipse-bank-schema.json",
  eclipseEventBank: "data/knowledge-base/panchang-festival/production/eclipse-event-bank.json",
  dailyCalculationBank: "data/knowledge-base/panchang-festival/production/daily-panchang-calculation-bank.json",
  panchangWordConnector: "data/knowledge-base/panchang-festival/production/panchang-to-word-context-connector.json",
  review: "data/content-intelligence/quality-reviews/ag70b-panchang-methodology-astronomical-data-foundation.json",
  readiness: "data/content-intelligence/quality-registry/ag70b-ag70c-sanskrit-lexical-engine-data-model-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70b-to-ag70c-sanskrit-lexical-engine-data-model-boundary.json",
  quality: "data/quality/ag70b-panchang-methodology-astronomical-data-foundation.json",
  preview: "data/quality/ag70b-panchang-methodology-astronomical-data-foundation-preview.json",
  doc: "docs/quality/AG70B_PANCHANG_METHODOLOGY_ASTRONOMICAL_DATA_FOUNDATION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const shuklaNames = [
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"
];

const krishnaNames = [
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
];

const tithis = [
  ...shuklaNames.map((name, i) => ({
    tithi_id: `shukla_${String(i + 1).padStart(2, "0")}`,
    paksha: "Shukla",
    number_in_paksha: i + 1,
    name_en: name,
    angle_start_degrees: i * 12,
    angle_end_degrees: (i + 1) * 12,
    source_status: "canonical_name_seed_pending_source_attachment",
    approved_for_public_use: false
  })),
  ...krishnaNames.map((name, i) => ({
    tithi_id: `krishna_${String(i + 1).padStart(2, "0")}`,
    paksha: "Krishna",
    number_in_paksha: i + 1,
    name_en: name,
    angle_start_degrees: 180 + i * 12,
    angle_end_degrees: 180 + (i + 1) * 12,
    source_status: "canonical_name_seed_pending_source_attachment",
    approved_for_public_use: false
  }))
];

const nakshatraNames = [
  "Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
  "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const nakshatras = nakshatraNames.map((name, i) => ({
  nakshatra_id: `nakshatra_${String(i + 1).padStart(2, "0")}`,
  number: i + 1,
  name_en: name,
  longitude_span_degrees: "13°20′",
  start_longitude_degrees: +(i * (360 / 27)).toFixed(6),
  end_longitude_degrees: +((i + 1) * (360 / 27)).toFixed(6),
  source_status: "canonical_name_seed_pending_source_attachment",
  approved_for_public_use: false
}));

const yogaNames = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula",
  "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

const yogas = yogaNames.map((name, i) => ({
  yoga_id: `yoga_${String(i + 1).padStart(2, "0")}`,
  number: i + 1,
  name_en: name,
  span_degrees: "13°20′",
  source_status: "canonical_name_seed_pending_source_attachment",
  approved_for_public_use: false
}));

const karanaNames = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"];
const karanas = karanaNames.map((name, i) => ({
  karana_id: `karana_${String(i + 1).padStart(2, "0")}`,
  name_en: name,
  category: i < 7 ? "repeating" : "fixed",
  source_status: "canonical_name_seed_pending_source_attachment",
  approved_for_public_use: false
}));

const varas = [
  ["ravi", "Ravivara", "Sunday", "Sun"],
  ["soma", "Somavara", "Monday", "Moon"],
  ["mangala", "Mangalavara", "Tuesday", "Mars"],
  ["budha", "Budhavara", "Wednesday", "Mercury"],
  ["guru", "Guruvara", "Thursday", "Jupiter"],
  ["shukra", "Shukravara", "Friday", "Venus"],
  ["shani", "Shanivara", "Saturday", "Saturn"]
].map(([id, sanskrit, english, graha]) => ({
  vara_id: id,
  name_sanskrit_transliteration: sanskrit,
  name_en: english,
  associated_graha: graha,
  source_status: "canonical_name_seed_pending_source_attachment",
  approved_for_public_use: false
}));

const pakshas = [
  { paksha_id: "shukla", name_en: "Shukla Paksha", meaning_hint: "waxing lunar half", approved_for_public_use: false },
  { paksha_id: "krishna", name_en: "Krishna Paksha", meaning_hint: "waning lunar half", approved_for_public_use: false }
];

const astronomicalModel = {
  module_id: "AG70B",
  title: "Astronomical Calculation Model",
  status: "astronomical_calculation_model_defined_not_runtime_active",
  purpose: "Define the in-house governed calculation inputs needed to derive Panchang elements and observance windows.",
  calculation_runtime_active_now: false,
  required_inputs: [
    "julian_day",
    "calculation_datetime_utc",
    "calculation_datetime_local",
    "timezone",
    "latitude",
    "longitude",
    "ayanamsa_basis",
    "sun_geocentric_longitude",
    "moon_geocentric_longitude",
    "planetary_longitudes_if_required",
    "sunrise_local",
    "sunset_local",
    "moonrise_local_if_required",
    "moonset_local_if_required"
  ],
  derived_outputs: [
    "tithi",
    "nakshatra",
    "yoga",
    "karana",
    "paksha",
    "vara",
    "sunrise_based_day_boundary",
    "observance_start_end_window",
    "eclipse_visibility_window_if_applicable"
  ],
  blocked_sources: [
    "random_panchang_website_as_source_of_truth",
    "ai_generated_panchang_values",
    "manual_date_guess_without_calculation_or_rule_basis"
  ],
  required_future_decision: [
    "Select astronomical calculation library/algorithm.",
    "Select ayanamsa basis.",
    "Select default public location policy.",
    "Define regional calendar handling."
  ]
};

const locationBank = {
  module_id: "AG70B",
  title: "Location Coordinate Bank",
  status: "location_coordinate_bank_schema_created_no_public_location_selected",
  location_runtime_active_now: false,
  required_location_fields: [
    "location_id",
    "display_name",
    "latitude",
    "longitude",
    "timezone",
    "region",
    "country",
    "default_for_public_output",
    "review_status"
  ],
  locations: [],
  note: "No default public Panchang location is selected in AG70B. Coordinates must be inserted after project/location decision and review."
};

const panchangMaster = {
  module_id: "AG70B",
  title: "Panchang Element Master Bank",
  status: "panchang_element_master_bank_created_pending_source_attachment",
  approved_for_public_output_now: false,
  tithi_count: tithis.length,
  nakshatra_count: nakshatras.length,
  yoga_count: yogas.length,
  karana_count: karanas.length,
  vara_count: varas.length,
  paksha_count: pakshas.length,
  tithis,
  nakshatras,
  yogas,
  karanas,
  varas,
  pakshas
};

const derivationRules = {
  module_id: "AG70B",
  title: "Panchang Element Derivation Rules",
  status: "panchang_element_derivation_rules_defined_not_runtime_active",
  runtime_calculation_active_now: false,
  rules: [
    {
      rule_id: "tithi_derivation",
      formula_note: "Tithi is derived from the angular difference between Moon and Sun; each Tithi spans 12 degrees.",
      required_inputs: ["moon_longitude", "sun_longitude"],
      output: "tithi_number and tithi_start_end_window",
      public_runtime_active_now: false
    },
    {
      rule_id: "nakshatra_derivation",
      formula_note: "Nakshatra is derived from Moon longitude across 27 equal divisions of 13°20′.",
      required_inputs: ["moon_longitude"],
      output: "nakshatra_number and nakshatra_start_end_window",
      public_runtime_active_now: false
    },
    {
      rule_id: "yoga_derivation",
      formula_note: "Yoga is derived from the sum of Sun and Moon longitudes across 27 equal divisions.",
      required_inputs: ["sun_longitude", "moon_longitude"],
      output: "yoga_number and yoga_start_end_window",
      public_runtime_active_now: false
    },
    {
      rule_id: "karana_derivation",
      formula_note: "Karana is derived from half-Tithi divisions of 6 degrees with repeating and fixed Karana sequence handling.",
      required_inputs: ["moon_sun_angular_difference"],
      output: "karana_name and karana_start_end_window",
      public_runtime_active_now: false
    },
    {
      rule_id: "vara_derivation",
      formula_note: "Vara is determined by the local sunrise-based civil day convention for Panchang use.",
      required_inputs: ["local_sunrise", "local_date"],
      output: "vara",
      public_runtime_active_now: false
    }
  ]
};

const observanceRuleBank = {
  module_id: "AG70B",
  title: "Festival and Observance Rule Bank",
  status: "observance_rule_bank_schema_created_rules_pending_population",
  approved_for_public_output_now: false,
  required_rule_fields: [
    "observance_id",
    "name_en",
    "name_hi",
    "observance_type",
    "required_tithi",
    "required_paksha",
    "required_masa",
    "required_nakshatra",
    "required_yoga",
    "sunrise_rule",
    "nishita_rule",
    "pradosha_rule",
    "parana_rule",
    "regional_variation",
    "start_datetime_rule",
    "end_datetime_rule",
    "source_reference_ids",
    "review_status",
    "public_use_permission"
  ],
  rule_templates: [
    {
      template_id: "ekadashi_vrata_template",
      observance_type: "vrata",
      required_tithi: "Ekadashi",
      required_rule_classes: ["tithi_window", "sunrise_rule", "parana_window_if_applicable"],
      review_status: "template_not_approved"
    },
    {
      template_id: "purnima_template",
      observance_type: "lunar_observance",
      required_tithi: "Purnima",
      required_rule_classes: ["tithi_window", "regional_rule_if_any"],
      review_status: "template_not_approved"
    },
    {
      template_id: "amavasya_template",
      observance_type: "lunar_observance",
      required_tithi: "Amavasya",
      required_rule_classes: ["tithi_window", "regional_rule_if_any"],
      review_status: "template_not_approved"
    },
    {
      template_id: "eclipse_observance_template",
      observance_type: "eclipse",
      required_rule_classes: ["eclipse_visibility", "contact_times", "regional_visibility_note"],
      review_status: "template_not_approved"
    }
  ],
  rules: []
};

const upcomingSchema = {
  module_id: "AG70B",
  title: "Upcoming Observance Schema",
  status: "upcoming_observance_schema_created_no_events_published",
  required_fields: [
    "observance_event_id",
    "observance_id",
    "name_en",
    "name_hi",
    "location_id",
    "start_datetime_local",
    "end_datetime_local",
    "start_datetime_utc",
    "end_datetime_utc",
    "observance_date_local",
    "rule_applied",
    "panchang_element_refs",
    "source_reference_ids",
    "review_status",
    "public_use_permission",
    "approved_for_output"
  ],
  example_shape_note: "Ekadashi-like records must store start/end windows, not merely date labels.",
  public_output_created_now: false
};

const observanceEventBank = {
  module_id: "AG70B",
  title: "Observance Event Bank",
  status: "observance_event_bank_created_empty",
  event_count: 0,
  events: [],
  note: "Actual upcoming observance events will be created only after calculation/rule validation."
};

const eclipseSchema = {
  module_id: "AG70B",
  title: "Solar and Lunar Eclipse Bank Schema",
  status: "eclipse_bank_schema_created_no_events_published",
  required_fields: [
    "eclipse_id",
    "eclipse_type",
    "visibility_region",
    "location_id",
    "start_datetime_utc",
    "start_datetime_local",
    "maximum_datetime_utc",
    "maximum_datetime_local",
    "end_datetime_utc",
    "end_datetime_local",
    "sutak_applicability_status",
    "regional_visibility_note",
    "source_or_calculation_reference_ids",
    "review_status",
    "public_use_permission",
    "approved_for_output"
  ],
  supported_eclipse_types: ["solar", "lunar"],
  public_output_created_now: false
};

const eclipseEventBank = {
  module_id: "AG70B",
  title: "Eclipse Event Bank",
  status: "eclipse_event_bank_created_empty",
  event_count: 0,
  events: [],
  note: "Upcoming solar/lunar eclipse records require verified calculation/source before population."
};

const dailyCalculationBank = {
  module_id: "AG70B",
  title: "Daily Panchang Calculation Bank",
  status: "daily_panchang_calculation_bank_created_empty",
  calculation_record_count: 0,
  calculation_runtime_active_now: false,
  records: [],
  note: "This bank will later hold date-wise calculated Panchang records with location and start/end windows."
};

const panchangWordConnector = {
  module_id: "AG70B",
  title: "Panchang to Word Context Connector",
  status: "panchang_to_word_context_connector_defined_not_runtime_active",
  runtime_connector_active_now: false,
  purpose: "Provide structured day-context interpretation for the future Sanskrit lexical engines and Word of the Day method.",
  input_context_fields: [
    "tithi",
    "nakshatra",
    "yoga",
    "karana",
    "paksha",
    "vara",
    "festival_context",
    "observance_context"
  ],
  output_context_fields_for_word_engine: [
    "context_signal_id",
    "tithi_context_key",
    "nakshatra_context_key",
    "yoga_context_key",
    "paksha_context_key",
    "vara_context_key",
    "festival_context_key",
    "combined_interpretive_signal",
    "confidence_status",
    "passed_to_morphology_engine"
  ],
  downstream_dependency: [
    "Sanskrit Morphology Engine",
    "Sanskrit Etymology Engine",
    "Sanskrit Semantics Engine",
    "Word of the Day Selection Engine"
  ],
  public_word_generation_allowed_now: false
};

const manifest = {
  ...readJson(outputs.manifest),
  status: "production_bank_manifest_created_panchang_foundation_defined",
  current_status: "panchang_foundation_defined_no_calculation_runtime",
  current_counts: {
    candidate_records: 0,
    reviewed_records: 0,
    approved_records: 0,
    output_eligible_records: 0,
    daily_calculation_records: 0,
    observance_events: 0,
    eclipse_events: 0
  },
  foundation_files: {
    astronomical_model: outputs.astronomicalModel,
    location_coordinate_bank: outputs.locationBank,
    panchang_element_master_bank: outputs.panchangMaster,
    derivation_rules: outputs.derivationRules,
    festival_observance_rule_bank: outputs.observanceRuleBank,
    daily_calculation_bank: outputs.dailyCalculationBank,
    eclipse_schema: outputs.eclipseSchema,
    eclipse_event_bank: outputs.eclipseEventBank,
    panchang_to_word_context_connector: outputs.panchangWordConnector
  },
  next_required_stage: "AG70C — Sanskrit Lexical Engine Data Model"
};

const review = {
  module_id: "AG70B",
  title: "Panchang Methodology and Astronomical Data Foundation",
  status: "ag70b_panchang_methodology_astronomical_data_foundation_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70a_registry: "data/knowledge-base/production-data-bank-registry/ag70a-module-production-data-bank-registry.json",
    status: ag70a.status
  },
  generated_records: outputs,
  summary: {
    panchang_foundation_created: true,
    astronomical_calculation_model_defined: true,
    location_coordinate_bank_schema_created: true,
    panchang_element_master_bank_created: true,
    tithi_count: tithis.length,
    nakshatra_count: nakshatras.length,
    yoga_count: yogas.length,
    karana_count: karanas.length,
    vara_count: varas.length,
    paksha_count: pakshas.length,
    derivation_rules_defined: true,
    observance_rule_bank_schema_created: true,
    upcoming_observance_schema_created: true,
    eclipse_bank_schema_created: true,
    daily_calculation_bank_created_empty: true,
    panchang_to_word_context_connector_defined: true,
    actual_panchang_calculations_created_now: false,
    actual_observance_events_created_now: false,
    actual_eclipse_events_created_now: false,
    public_panchang_output_created_now: false,
    public_word_generation_allowed_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70c: true
  }
};

const readiness = {
  module_id: "AG70B",
  title: "AG70C Sanskrit Lexical Engine Data Model Readiness Record",
  status: "ready_for_ag70c_sanskrit_lexical_engine_data_model",
  ready_for_ag70c: true,
  next_stage: "AG70C — Sanskrit Lexical Engine Data Model",
  reason: "Panchang foundation and Panchang-to-Word context connector are defined. Sanskrit lexical engine data model can now be created."
};

const boundary = {
  module_id: "AG70B",
  title: "AG70B to AG70C Sanskrit Lexical Engine Data Model Boundary",
  status: "ag70c_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create Sanskrit lexical engine data model.",
    "Define morphology, etymology and semantics production-bank schemas.",
    "Define fallback sacred-name/word bank schema.",
    "Connect lexical engine model to Panchang context connector."
  ],
  blocked_scope_without_explicit_approval: [
    "public Panchang output",
    "actual festival date publication",
    "actual eclipse date publication",
    "generated/word-of-day.json replacement",
    "homepage UI change",
    "runtime Panchang calculation activation",
    "Supabase/database writes",
    "backend/Auth activation",
    "AI-fabricated Sanskrit or meaning records"
  ]
};

const quality = {
  module_id: "AG70B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70B",
  status: review.status,
  panchang_foundation_created: 1,
  astronomical_calculation_model_defined: 1,
  panchang_element_master_bank_created: 1,
  tithi_count: tithis.length,
  nakshatra_count: nakshatras.length,
  yoga_count: yogas.length,
  karana_count: karanas.length,
  vara_count: varas.length,
  paksha_count: pakshas.length,
  upcoming_observance_schema_created: 1,
  eclipse_bank_schema_created: 1,
  actual_panchang_calculations_created_now: 0,
  actual_observance_events_created_now: 0,
  actual_eclipse_events_created_now: 0,
  generated_word_json_modified: 0,
  ui_display_changed: 0,
  ready_for_ag70c: 1
};

const doc = `# AG70B — Panchang Methodology and Astronomical Data Foundation

AG70B creates the governed Panchang data foundation required before Word of the Day can use Tithi, Nakshatra, Yoga, Paksha, Vara or festival context.

## Created

- Astronomical calculation model
- Location coordinate bank schema
- Panchang element master bank
- Tithi/Nakshatra/Yoga/Karana/Paksha/Vara foundation
- Panchang derivation rule descriptions
- Festival/observance rule-bank schema
- Upcoming Observance schema
- Eclipse bank schema
- Empty daily Panchang calculation bank
- Empty observance event bank
- Empty eclipse event bank
- Panchang-to-Word context connector

## Not created

- No actual Panchang calculation records
- No actual festival date publication
- No actual eclipse event publication
- No public Panchang output
- No generated Word replacement
- No UI change
- No Supabase/backend activation
`;

writeJson(outputs.manifest, manifest);
writeJson(outputs.astronomicalModel, astronomicalModel);
writeJson(outputs.locationBank, locationBank);
writeJson(outputs.panchangMaster, panchangMaster);
writeJson(outputs.derivationRules, derivationRules);
writeJson(outputs.observanceRuleBank, observanceRuleBank);
writeJson(outputs.upcomingSchema, upcomingSchema);
writeJson(outputs.observanceEventBank, observanceEventBank);
writeJson(outputs.eclipseSchema, eclipseSchema);
writeJson(outputs.eclipseEventBank, eclipseEventBank);
writeJson(outputs.dailyCalculationBank, dailyCalculationBank);
writeJson(outputs.panchangWordConnector, panchangWordConnector);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70B Panchang foundation generated.");
console.log("✅ Panchang element master, astronomical model, observance schema, eclipse schema and Word connector created.");
console.log("✅ No public calculation/output/UI/backend mutation performed.");
