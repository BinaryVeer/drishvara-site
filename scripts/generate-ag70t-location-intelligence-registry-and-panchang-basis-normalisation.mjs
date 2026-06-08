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

const ag70s = readJson("data/content-intelligence/quality-reviews/ag70s-today-panchang-preview-manual-verification-gate.json");
const locationNote = readJson("data/knowledge-base/panchang-festival/production/ag70s-location-id-spelling-note.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70s.status !== "ag70s_today_panchang_preview_manual_verification_gate_completed") {
  throw new Error("AG70S must be complete before AG70T.");
}
if (ag70s.summary?.ready_for_ag70t !== true) {
  throw new Error("AG70S readiness for AG70T is missing.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const oldItanagarId = "loc_in_ar_itangar_capital_complex_001";
const newItanagarId = "loc_in_ar_itanagar_capital_complex_001";

const outputs = {
  registry: "data/knowledge-base/location-intelligence/production/location-selection-registry.json",
  coordinateContract: "data/knowledge-base/location-intelligence/production/location-coordinate-input-contract.json",
  displayPolicy: "data/knowledge-base/location-intelligence/production/location-display-label-policy.json",
  hierarchyPolicy: "data/knowledge-base/location-intelligence/production/location-hierarchy-policy.json",
  timezonePolicy: "data/knowledge-base/location-intelligence/production/location-timezone-basis-policy.json",
  usageMap: "data/knowledge-base/location-intelligence/production/location-usage-map.json",
  indiaCapitals: "data/knowledge-base/location-intelligence/production/india-state-ut-capitals-seed.json",
  indiaDistrictBlock: "data/knowledge-base/location-intelligence/production/india-district-block-registry.json",
  indiaMajorCities: "data/knowledge-base/location-intelligence/production/india-major-cities-seed.json",
  worldNationalCapitals: "data/knowledge-base/location-intelligence/production/world-national-capitals-seed.json",
  worldMajorCities: "data/knowledge-base/location-intelligence/production/world-major-cities-seed.json",
  importContracts: "data/knowledge-base/location-intelligence/production/location-official-import-contracts.json",
  normalisationMap: "data/knowledge-base/location-intelligence/production/location-id-normalisation-map.json",
  itanagarNormalisation: "data/knowledge-base/location-intelligence/production/ag70t-itanagar-normalisation-record.json",
  panchangBasisAudit: "data/knowledge-base/location-intelligence/production/ag70t-panchang-basis-normalisation-audit.json",
  noPublicOutputAudit: "data/knowledge-base/location-intelligence/production/ag70t-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70t-location-intelligence-registry-and-panchang-basis-normalisation.json",
  readiness: "data/content-intelligence/quality-registry/ag70t-ag70u-location-import-and-selection-validation-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70t-to-ag70u-location-import-and-selection-validation-boundary.json",
  quality: "data/quality/ag70t-location-intelligence-registry-and-panchang-basis-normalisation.json",
  preview: "data/quality/ag70t-location-intelligence-registry-and-panchang-basis-normalisation-preview.json",
  doc: "docs/quality/AG70T_LOCATION_INTELLIGENCE_REGISTRY_AND_PANCHANG_BASIS_NORMALISATION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const stateUtCapitalSeeds = [
  ["Andhra Pradesh", "Amaravati"], ["Arunachal Pradesh", "Itanagar"], ["Assam", "Dispur"],
  ["Bihar", "Patna"], ["Chhattisgarh", "Raipur"], ["Goa", "Panaji"],
  ["Gujarat", "Gandhinagar"], ["Haryana", "Chandigarh"], ["Himachal Pradesh", "Shimla"],
  ["Jharkhand", "Ranchi"], ["Karnataka", "Bengaluru"], ["Kerala", "Thiruvananthapuram"],
  ["Madhya Pradesh", "Bhopal"], ["Maharashtra", "Mumbai"], ["Manipur", "Imphal"],
  ["Meghalaya", "Shillong"], ["Mizoram", "Aizawl"], ["Nagaland", "Kohima"],
  ["Odisha", "Bhubaneswar"], ["Punjab", "Chandigarh"], ["Rajasthan", "Jaipur"],
  ["Sikkim", "Gangtok"], ["Tamil Nadu", "Chennai"], ["Telangana", "Hyderabad"],
  ["Tripura", "Agartala"], ["Uttar Pradesh", "Lucknow"], ["Uttarakhand", "Dehradun"],
  ["West Bengal", "Kolkata"], ["Andaman and Nicobar Islands", "Port Blair"],
  ["Chandigarh", "Chandigarh"], ["Dadra and Nagar Haveli and Daman and Diu", "Daman"],
  ["Delhi", "New Delhi"], ["Jammu and Kashmir", "Srinagar / Jammu"],
  ["Ladakh", "Leh"], ["Lakshadweep", "Kavaratti"], ["Puducherry", "Puducherry"]
].map(([state_or_ut_name, capital_name], index) => ({
  location_seed_id: `ag70t_india_capital_seed_${String(index + 1).padStart(2, "0")}`,
  location_type: "state_ut_capital",
  country_name: "India",
  state_or_region_name: state_or_ut_name,
  city_name: capital_name,
  display_label: `${capital_name}-${state_or_ut_name}-India`,
  ui_short_label: capital_name.includes("/") ? capital_name : capital_name,
  timezone: "Asia/Kolkata",
  latitude_decimal: null,
  longitude_decimal: null,
  coordinate_status: "pending_official_verification",
  source_status: "seed_pending_official_verification",
  computation_allowed_without_coordinate_verification: false,
  public_output_allowed_now: false
}));

const indiaMajorCitySeeds = [
  ["Mumbai", "Maharashtra"], ["Delhi", "Delhi"], ["Bengaluru", "Karnataka"], ["Hyderabad", "Telangana"],
  ["Chennai", "Tamil Nadu"], ["Kolkata", "West Bengal"], ["Pune", "Maharashtra"], ["Ahmedabad", "Gujarat"],
  ["Jaipur", "Rajasthan"], ["Lucknow", "Uttar Pradesh"], ["Guwahati", "Assam"], ["Shillong", "Meghalaya"],
  ["Ranchi", "Jharkhand"], ["Bhubaneswar", "Odisha"], ["Patna", "Bihar"], ["Itanagar", "Arunachal Pradesh"]
].map(([city_name, state_or_region_name], index) => ({
  location_seed_id: `ag70t_india_major_city_seed_${String(index + 1).padStart(2, "0")}`,
  location_type: "major_indian_city",
  country_name: "India",
  state_or_region_name,
  city_name,
  display_label: `${city_name}-${state_or_region_name}-India`,
  ui_short_label: city_name,
  timezone: "Asia/Kolkata",
  latitude_decimal: city_name === "Itanagar" ? 27.0844 : null,
  longitude_decimal: city_name === "Itanagar" ? 93.6053 : null,
  coordinate_status: city_name === "Itanagar" ? "seed_coordinate_pending_final_review" : "pending_official_verification",
  source_status: "seed_pending_official_verification",
  computation_allowed_without_coordinate_verification: false,
  public_output_allowed_now: false
}));

const districtBlockSeeds = [
  {
    location_seed_id: "ag70t_india_district_seed_anjaw_ar_001",
    location_type: "district",
    country_name: "India",
    state_or_region_name: "Arunachal Pradesh",
    district_name: "Anjaw",
    block_name: null,
    display_label: "Anjaw-Arunachal Pradesh-India",
    ui_short_label: "Anjaw",
    timezone: "Asia/Kolkata",
    latitude_decimal: null,
    longitude_decimal: null,
    coordinate_status: "pending_official_district_centroid_or_selected_point",
    source_status: "seed_pending_official_import",
    computation_allowed_without_coordinate_verification: false,
    public_output_allowed_now: false
  },
  {
    location_seed_id: "ag70t_india_block_seed_bhawanathpur_garhwa_jh_001",
    location_type: "block",
    country_name: "India",
    state_or_region_name: "Jharkhand",
    district_name: "Garhwa",
    block_name: "Bhawanathpur",
    display_label: "Bhawanathpur-Garhwa-Jharkhand-India",
    ui_short_label: "Bhawanathpur",
    timezone: "Asia/Kolkata",
    latitude_decimal: null,
    longitude_decimal: null,
    coordinate_status: "pending_official_block_centroid_or_selected_point",
    source_status: "seed_pending_official_import",
    computation_allowed_without_coordinate_verification: false,
    public_output_allowed_now: false
  }
];

const worldCapitalSeeds = [
  ["Kathmandu", "Nepal", "Asia/Kathmandu"], ["Tokyo", "Japan", "Asia/Tokyo"],
  ["London", "United Kingdom", "Europe/London"], ["Washington", "United States", "America/New_York"],
  ["Canberra", "Australia", "Australia/Sydney"], ["Ottawa", "Canada", "America/Toronto"],
  ["Paris", "France", "Europe/Paris"], ["Berlin", "Germany", "Europe/Berlin"],
  ["Rome", "Italy", "Europe/Rome"], ["Madrid", "Spain", "Europe/Madrid"],
  ["Moscow", "Russia", "Europe/Moscow"], ["Beijing", "China", "Asia/Shanghai"],
  ["Bangkok", "Thailand", "Asia/Bangkok"], ["Dhaka", "Bangladesh", "Asia/Dhaka"],
  ["Colombo", "Sri Lanka", "Asia/Colombo"], ["Abu Dhabi", "United Arab Emirates", "Asia/Dubai"]
].map(([capital_name, country_name, timezone], index) => ({
  location_seed_id: `ag70t_world_capital_seed_${String(index + 1).padStart(2, "0")}`,
  location_type: "national_capital",
  country_name,
  city_name: capital_name,
  display_label: `${capital_name}-${country_name}`,
  ui_short_label: capital_name,
  timezone,
  latitude_decimal: null,
  longitude_decimal: null,
  coordinate_status: "pending_authoritative_global_import",
  source_status: "seed_pending_authoritative_global_import",
  computation_allowed_without_coordinate_verification: false,
  public_output_allowed_now: false
}));

const worldMajorCitySeeds = [
  ["New York", "United States", "America/New_York"], ["Dubai", "United Arab Emirates", "Asia/Dubai"],
  ["Singapore", "Singapore", "Asia/Singapore"], ["Hong Kong", "China", "Asia/Hong_Kong"],
  ["Los Angeles", "United States", "America/Los_Angeles"], ["Toronto", "Canada", "America/Toronto"],
  ["Sydney", "Australia", "Australia/Sydney"], ["Melbourne", "Australia", "Australia/Melbourne"],
  ["Doha", "Qatar", "Asia/Qatar"], ["Kuala Lumpur", "Malaysia", "Asia/Kuala_Lumpur"],
  ["Seoul", "South Korea", "Asia/Seoul"], ["Istanbul", "Turkey", "Europe/Istanbul"]
].map(([city_name, country_name, timezone], index) => ({
  location_seed_id: `ag70t_world_major_city_seed_${String(index + 1).padStart(2, "0")}`,
  location_type: "major_world_city",
  country_name,
  city_name,
  display_label: `${city_name}-${country_name}`,
  ui_short_label: city_name,
  timezone,
  latitude_decimal: null,
  longitude_decimal: null,
  coordinate_status: "pending_authoritative_global_import",
  source_status: "seed_pending_authoritative_global_import",
  computation_allowed_without_coordinate_verification: false,
  public_output_allowed_now: false
}));

const coordinateFirstExample = {
  location_seed_id: "ag70t_coordinate_first_example_itanagar_001",
  location_type: "coordinate_first_custom",
  country_name: null,
  state_or_region_name: null,
  district_name: null,
  block_name: null,
  city_name: null,
  display_label: "Custom Coordinates (27.0844, 93.6053)",
  ui_short_label: "Custom Coordinates",
  latitude_decimal: 27.0844,
  longitude_decimal: 93.6053,
  timezone: "Asia/Kolkata",
  date_time_basis_required: true,
  source_status: "user_provided_or_system_entered_coordinates",
  computation_allowed_when_timezone_confirmed: true,
  public_output_allowed_now: false
};

const registryRecords = [
  {
    location_registry_id: newItanagarId,
    location_type: "state_ut_capital",
    country_name: "India",
    state_or_region_name: "Arunachal Pradesh",
    district_name: "Papum Pare",
    block_name: null,
    city_name: "Itanagar",
    display_label: "Itanagar-Arunachal Pradesh-India",
    ui_short_label: "Itanagar",
    timezone: "Asia/Kolkata",
    latitude_decimal: 27.0844,
    longitude_decimal: 93.6053,
    coordinate_status: "seed_coordinate_pending_final_review",
    source_status: "normalised_seed_record_pending_official_verification",
    old_location_ids: [oldItanagarId],
    public_output_allowed_now: false
  },
  coordinateFirstExample
];

const registry = {
  module_id: "AG70T",
  title: "Location Intelligence Registry",
  status: "location_intelligence_registry_created_public_blocked",
  purpose: "Create a shared governed location layer for Panchang, Star Reflection, birth-location handling and future location-dependent modules.",
  supported_location_modes: ["named_location_selection", "coordinate_first_input"],
  supported_location_types: [
    "state_ut_capital",
    "major_indian_city",
    "district",
    "block",
    "national_capital",
    "major_world_city",
    "coordinate_first_custom"
  ],
  minimum_coordinate_first_fields: ["latitude_decimal", "longitude_decimal", "timezone", "date_time_basis"],
  full_population_scope_required_later: [
    "all_indian_state_ut_capitals",
    "all_indian_districts",
    "all_indian_blocks",
    "all_country_national_capitals",
    "major_world_cities"
  ],
  population_status: "registry_schema_seed_records_and_import_contracts_created_full_population_pending_governed_import",
  registry_record_count: registryRecords.length,
  public_output_allowed_now: false,
  records: registryRecords
};

const coordinateContract = {
  module_id: "AG70T",
  title: "Coordinate-first Location Input Contract",
  status: "coordinate_first_input_contract_created",
  purpose: "Allow location-dependent computation without requiring a city/place name when latitude, longitude and timezone basis are provided.",
  minimum_required_fields_for_computation: [
    "latitude_decimal",
    "longitude_decimal",
    "timezone",
    "date_key_or_datetime_basis"
  ],
  additional_required_fields_for_birth_or_star_reflection: [
    "date_of_birth",
    "exact_time_of_birth",
    "timezone_at_birth_datetime",
    "latitude_decimal",
    "longitude_decimal"
  ],
  optional_fields: [
    "place_label",
    "country_name",
    "state_or_region_name",
    "district_name",
    "block_name",
    "city_name",
    "coordinate_source_note"
  ],
  timezone_rule: "Latitude and longitude alone are not enough when date/time conversion is needed; timezone must be supplied, resolved or confirmed.",
  historical_timezone_note: "For birth-time use cases, historical timezone/DST handling may be required before final computation.",
  public_output_allowed_now: false
};

const displayPolicy = {
  module_id: "AG70T",
  title: "Location Display Label Policy",
  status: "location_display_label_policy_created",
  user_facing_rule: "Do not expose internal location_id in previews or UI-facing text.",
  preferred_display_formats: {
    indian_city_or_capital: "Itanagar-Arunachal Pradesh-India",
    indian_district: "Anjaw-Arunachal Pradesh-India",
    indian_block: "Bhawanathpur-Garhwa-Jharkhand-India",
    global_capital_or_city: "Tokyo-Japan",
    coordinate_first: "Custom Coordinates (latitude, longitude)"
  },
  short_display_allowed: {
    panchang_preview_header: "Itanagar",
    detailed_selection_label: "Itanagar-Arunachal Pradesh-India"
  },
  internal_id_exposure_allowed_in_public_ui: false,
  public_output_allowed_now: false
};

const hierarchyPolicy = {
  module_id: "AG70T",
  title: "Location Hierarchy Policy",
  status: "location_hierarchy_policy_created",
  hierarchy: [
    "country",
    "state_or_union_territory",
    "district",
    "block",
    "city_or_capital_or_major_city",
    "coordinate_first_custom_record"
  ],
  selection_behavior: [
    "A named location may resolve to a coordinate/timezone basis when verified.",
    "A coordinate-first location may bypass country/state/district/city fields when latitude, longitude and timezone are provided.",
    "District and block locations require official import or reviewed centroid/selected point before computation approval."
  ],
  public_output_allowed_now: false
};

const timezonePolicy = {
  module_id: "AG70T",
  title: "Location Timezone Basis Policy",
  status: "location_timezone_basis_policy_created",
  rules: [
    "Named locations must carry timezone once verified.",
    "Coordinate-first inputs must supply or confirm timezone before computation.",
    "Panchang computation uses local date, sunrise/sunset and timezone basis.",
    "Star Reflection and birth-location handling require timezone at date/time of birth.",
    "Historical timezone handling is marked as required before final birth-based computation."
  ],
  public_output_allowed_now: false
};

const usageMap = {
  module_id: "AG70T",
  title: "Location Usage Map",
  status: "location_usage_map_created",
  shared_registry_used_by: [
    {
      module: "Panchang",
      use_case: "date/location Panchang calculation basis",
      required_location_fields: ["latitude_decimal", "longitude_decimal", "timezone", "date_key"]
    },
    {
      module: "Star Reflection",
      use_case: "birth-location and current-location aware calculations",
      required_location_fields: ["latitude_decimal", "longitude_decimal", "timezone", "date_time_basis"]
    },
    {
      module: "Birth Location Handling",
      use_case: "date/time/place or coordinate-first birth input",
      required_location_fields: ["date_of_birth", "exact_time_of_birth", "latitude_decimal", "longitude_decimal", "timezone_at_birth_datetime"]
    },
    {
      module: "Future Location-dependent Modules",
      use_case: "single governed location resolver",
      required_location_fields: ["latitude_decimal", "longitude_decimal", "timezone"]
    }
  ],
  duplicate_location_logic_outside_registry_allowed: false,
  public_output_allowed_now: false
};

const indiaCapitals = {
  module_id: "AG70T",
  title: "India State / Union Territory Capitals Seed",
  status: "india_state_ut_capitals_seed_created_pending_official_verification",
  seed_record_count: stateUtCapitalSeeds.length,
  full_population_requirement: "All State/UT capitals must be verified through an approved official import/review stage before computation/public use.",
  records: stateUtCapitalSeeds
};

const indiaDistrictBlock = {
  module_id: "AG70T",
  title: "India District and Block Registry",
  status: "india_district_block_registry_schema_and_seed_examples_created_full_import_pending",
  full_scope_required: ["all_indian_districts", "all_indian_blocks"],
  current_seed_record_count: districtBlockSeeds.length,
  seed_examples: districtBlockSeeds,
  full_population_status: "blocked_until_official_district_block_import_source_approved",
  public_output_allowed_now: false
};

const indiaMajorCities = {
  module_id: "AG70T",
  title: "India Major Cities Seed",
  status: "india_major_cities_seed_created_pending_official_verification",
  seed_record_count: indiaMajorCitySeeds.length,
  records: indiaMajorCitySeeds
};

const worldNationalCapitals = {
  module_id: "AG70T",
  title: "World National Capitals Seed",
  status: "world_national_capitals_seed_examples_created_full_import_pending",
  seed_record_count: worldCapitalSeeds.length,
  full_population_status: "blocked_until_authoritative_country_capital_import_source_approved",
  records: worldCapitalSeeds
};

const worldMajorCities = {
  module_id: "AG70T",
  title: "World Major Cities Seed",
  status: "world_major_cities_seed_examples_created_full_import_pending",
  seed_record_count: worldMajorCitySeeds.length,
  full_population_status: "blocked_until_authoritative_global_city_import_source_approved",
  records: worldMajorCitySeeds
};

const importContracts = {
  module_id: "AG70T",
  title: "Location Official Import Contracts",
  status: "location_official_import_contracts_created",
  import_contracts: [
    {
      contract_id: "india_state_ut_capitals_official_import",
      target_file: outputs.indiaCapitals,
      required_fields: ["state_or_ut_name", "capital_name", "timezone", "latitude_decimal", "longitude_decimal", "source_reference", "review_status"],
      import_status: "pending"
    },
    {
      contract_id: "india_districts_blocks_official_import",
      target_file: outputs.indiaDistrictBlock,
      required_fields: ["state_name", "district_name", "block_name", "centroid_or_selected_latitude", "centroid_or_selected_longitude", "timezone", "source_reference", "review_status"],
      import_status: "pending"
    },
    {
      contract_id: "world_country_capitals_authoritative_import",
      target_file: outputs.worldNationalCapitals,
      required_fields: ["country_name", "capital_name", "timezone", "latitude_decimal", "longitude_decimal", "source_reference", "review_status"],
      import_status: "pending"
    },
    {
      contract_id: "world_major_cities_authoritative_import",
      target_file: outputs.worldMajorCities,
      required_fields: ["country_name", "city_name", "timezone", "latitude_decimal", "longitude_decimal", "source_reference", "review_status"],
      import_status: "pending"
    }
  ],
  public_output_allowed_now: false
};

const normalisationMap = {
  module_id: "AG70T",
  title: "Location ID Normalisation Map",
  status: "location_id_normalisation_map_created",
  normalisation_records: [
    {
      old_location_id: oldItanagarId,
      normalised_location_id: newItanagarId,
      display_label: "Itanagar-Arunachal Pradesh-India",
      ui_short_label: "Itanagar",
      correction_reason: "AG70S manual verification recorded likely spelling issue: itangar should be itanagar.",
      normalisation_mode: "alias_and_future_basis_only_historical_records_not_recalculated",
      historical_record_mutation_performed_now: false,
      panchang_recalculation_performed_now: false,
      public_output_allowed_now: false
    }
  ]
};

const itanagarNormalisation = {
  module_id: "AG70T",
  title: "Itanagar Normalisation Record",
  status: "itanagar_location_id_normalisation_record_created",
  current_recorded_issue_from_ag70s: locationNote.current_location_id,
  old_location_id: oldItanagarId,
  normalised_location_id: newItanagarId,
  user_facing_display_label: "Itanagar-Arunachal Pradesh-India",
  user_facing_short_label: "Itanagar",
  coordinate_basis: {
    latitude_decimal: 27.0844,
    longitude_decimal: 93.6053,
    timezone: "Asia/Kolkata",
    coordinate_status: "seed_coordinate_pending_final_review"
  },
  historical_records_recalculated_now: false,
  historical_records_mutated_now: false,
  future_records_should_use_normalised_id: true,
  public_output_allowed_now: false
};

const panchangBasisAudit = {
  module_id: "AG70T",
  title: "Panchang Basis Normalisation Audit",
  status: "panchang_basis_normalisation_audit_passed",
  normalised_location_basis_created: true,
  panchang_values_recomputed_now: false,
  historical_panchang_records_mutated_now: false,
  existing_preview_values_preserved: true,
  public_panchang_output_allowed_now: false,
  future_preview_display_should_use_short_label: "Itanagar"
};

const noPublicOutputAudit = {
  module_id: "AG70T",
  title: "No Public Output Audit",
  status: "no_public_output_audit_passed",
  public_panchang_output_allowed_now: false,
  public_observance_output_allowed_now: false,
  public_eclipse_output_allowed_now: false,
  public_word_output_allowed_now: false,
  public_star_reflection_output_allowed_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_location_intelligence_registry_panchang_basis_normalisation",
  current_status: "location_intelligence_registry_created_public_blocked",
  ag70t_files: {
    registry: outputs.registry,
    coordinate_contract: outputs.coordinateContract,
    display_policy: outputs.displayPolicy,
    hierarchy_policy: outputs.hierarchyPolicy,
    timezone_policy: outputs.timezonePolicy,
    usage_map: outputs.usageMap,
    normalisation_map: outputs.normalisationMap,
    itanagar_normalisation: outputs.itanagarNormalisation,
    panchang_basis_audit: outputs.panchangBasisAudit,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    location_intelligence_registry_records: registryRecords.length,
    india_state_ut_capital_seed_records: stateUtCapitalSeeds.length,
    india_district_block_seed_records: districtBlockSeeds.length,
    india_major_city_seed_records: indiaMajorCitySeeds.length,
    world_national_capital_seed_records: worldCapitalSeeds.length,
    world_major_city_seed_records: worldMajorCitySeeds.length,
    coordinate_first_contract_records: 1,
    public_panchang_outputs: 0,
    word_output_records: 0
  },
  next_required_stage: "AG70U — Location Import and Selection Validation"
};

const review = {
  module_id: "AG70T",
  title: "Location Intelligence Registry and Panchang Basis Normalisation",
  status: "ag70t_location_intelligence_registry_and_panchang_basis_normalisation_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70s_review: "data/content-intelligence/quality-reviews/ag70s-today-panchang-preview-manual-verification-gate.json",
    ag70s_location_note: "data/knowledge-base/panchang-festival/production/ag70s-location-id-spelling-note.json"
  },
  generated_records: outputs,
  summary: {
    location_intelligence_registry_created: true,
    named_location_selection_supported: true,
    coordinate_first_input_supported: true,
    panchang_usage_mapped: true,
    star_reflection_usage_mapped: true,
    birth_location_usage_mapped: true,
    india_state_ut_capitals_seed_created: true,
    india_district_block_schema_and_seed_created: true,
    india_major_cities_seed_created: true,
    world_national_capitals_seed_created: true,
    world_major_cities_seed_created: true,
    official_import_contracts_created: true,
    itanagar_location_id_normalisation_record_created: true,
    old_itanagar_location_id: oldItanagarId,
    normalised_itanagar_location_id: newItanagarId,
    user_facing_display_label_policy_created: true,
    public_output_allowed_now: false,
    panchang_recomputation_performed_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    ready_for_ag70u: true
  }
};

const readiness = {
  module_id: "AG70T",
  title: "AG70U Location Import and Selection Validation Readiness Record",
  status: "ready_for_ag70u_location_import_and_selection_validation",
  ready_for_ag70u: true,
  next_stage: "AG70U — Location Import and Selection Validation",
  reason: "Shared location registry, coordinate-first contract, named-location seeds, import contracts and Itanagar normalisation record exist. Next stage should validate selection behaviour and official import readiness."
};

const boundary = {
  module_id: "AG70T",
  title: "AG70T to AG70U Location Import and Selection Validation Boundary",
  status: "ag70u_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Validate named-location selection behaviour.",
    "Validate coordinate-first input contract.",
    "Validate Itanagar display label normalisation.",
    "Prepare official import validation checks for Indian districts/blocks, country capitals and major world cities.",
    "Keep public/UI output blocked."
  ],
  blocked_scope_without_explicit_approval: [
    "public Panchang output",
    "public Star Reflection output",
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
  module_id: "AG70T",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70T",
  status: review.status,
  registry_record_count: registryRecords.length,
  india_state_ut_capital_seed_records: stateUtCapitalSeeds.length,
  india_district_block_seed_records: districtBlockSeeds.length,
  india_major_city_seed_records: indiaMajorCitySeeds.length,
  world_national_capital_seed_records: worldCapitalSeeds.length,
  world_major_city_seed_records: worldMajorCitySeeds.length,
  coordinate_first_input_supported: 1,
  public_output_allowed_now: 0,
  panchang_recomputation_performed_now: 0,
  ready_for_ag70u: 1
};

const doc = `# AG70T — Location Intelligence Registry and Panchang Basis Normalisation

AG70T creates the shared governed location layer for Panchang, Star Reflection, birth-location handling and future location-dependent modules.

## Created

- Location Intelligence Registry.
- Coordinate-first input contract.
- Display label policy.
- Hierarchy policy.
- Timezone basis policy.
- Usage map.
- India State/UT capitals seed.
- India district/block registry schema with seed examples.
- India major cities seed.
- World national capitals seed examples.
- World major cities seed examples.
- Official import contracts.
- Itanagar normalisation record.

## Important rules

Named location is optional when valid latitude, longitude, timezone and date/time basis are supplied.

Latitude and longitude alone are not enough for date/time-sensitive calculations; timezone must also be resolved or confirmed.

## Display label policy

Public/UI-facing preview should not expose internal location_id. It should use clean labels such as:

- Itanagar
- Itanagar-Arunachal Pradesh-India
- Anjaw-Arunachal Pradesh-India
- Bhawanathpur-Garhwa-Jharkhand-India
- Custom Coordinates (27.0844, 93.6053)

## Boundary

- No Panchang recomputation.
- No public Panchang output.
- No public Star Reflection output.
- No Word output.
- No UI/backend/Supabase activation.
`;

writeJson(outputs.registry, registry);
writeJson(outputs.coordinateContract, coordinateContract);
writeJson(outputs.displayPolicy, displayPolicy);
writeJson(outputs.hierarchyPolicy, hierarchyPolicy);
writeJson(outputs.timezonePolicy, timezonePolicy);
writeJson(outputs.usageMap, usageMap);
writeJson(outputs.indiaCapitals, indiaCapitals);
writeJson(outputs.indiaDistrictBlock, indiaDistrictBlock);
writeJson(outputs.indiaMajorCities, indiaMajorCities);
writeJson(outputs.worldNationalCapitals, worldNationalCapitals);
writeJson(outputs.worldMajorCities, worldMajorCities);
writeJson(outputs.importContracts, importContracts);
writeJson(outputs.normalisationMap, normalisationMap);
writeJson(outputs.itanagarNormalisation, itanagarNormalisation);
writeJson(outputs.panchangBasisAudit, panchangBasisAudit);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70T location intelligence registry generated.");
console.log("✅ Named-location and coordinate-first modes supported.");
console.log("✅ Itanagar normalisation record created.");
console.log("✅ Panchang, Star Reflection and birth-location usage mapped.");
console.log("✅ Public output, recomputation, UI, backend and Supabase remain blocked.");
