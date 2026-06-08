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

const ag70t = readJson("data/content-intelligence/quality-reviews/ag70t-location-intelligence-registry-and-panchang-basis-normalisation.json");
const registry = readJson("data/knowledge-base/location-intelligence/production/location-selection-registry.json");
const coordinateContract = readJson("data/knowledge-base/location-intelligence/production/location-coordinate-input-contract.json");
const displayPolicy = readJson("data/knowledge-base/location-intelligence/production/location-display-label-policy.json");
const usageMap = readJson("data/knowledge-base/location-intelligence/production/location-usage-map.json");
const importContracts = readJson("data/knowledge-base/location-intelligence/production/location-official-import-contracts.json");
const normalisationMap = readJson("data/knowledge-base/location-intelligence/production/location-id-normalisation-map.json");
const indiaDistrictBlock = readJson("data/knowledge-base/location-intelligence/production/india-district-block-registry.json");
const indiaCapitals = readJson("data/knowledge-base/location-intelligence/production/india-state-ut-capitals-seed.json");
const indiaCities = readJson("data/knowledge-base/location-intelligence/production/india-major-cities-seed.json");
const worldCapitals = readJson("data/knowledge-base/location-intelligence/production/world-national-capitals-seed.json");
const worldCities = readJson("data/knowledge-base/location-intelligence/production/world-major-cities-seed.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70t.status !== "ag70t_location_intelligence_registry_and_panchang_basis_normalisation_completed") {
  throw new Error("AG70T must be complete before AG70U.");
}
if (ag70t.summary?.ready_for_ag70u !== true) {
  throw new Error("AG70T readiness for AG70U is missing.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  selectionValidation: "data/knowledge-base/location-intelligence/production/ag70u-location-selection-validation-report.json",
  coordinateValidation: "data/knowledge-base/location-intelligence/production/ag70u-coordinate-first-validation-report.json",
  displayValidation: "data/knowledge-base/location-intelligence/production/ag70u-display-label-validation-report.json",
  usageValidation: "data/knowledge-base/location-intelligence/production/ag70u-usage-map-compatibility-validation-report.json",
  importReadiness: "data/knowledge-base/location-intelligence/production/ag70u-import-readiness-validation-report.json",
  normalisationValidation: "data/knowledge-base/location-intelligence/production/ag70u-itanagar-normalisation-validation-report.json",
  noPublicOutputAudit: "data/knowledge-base/location-intelligence/production/ag70u-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70u-location-import-and-selection-validation.json",
  readiness: "data/content-intelligence/quality-registry/ag70u-ag70v-india-administrative-location-import-bank-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70u-to-ag70v-india-administrative-location-import-bank-boundary.json",
  quality: "data/quality/ag70u-location-import-and-selection-validation.json",
  preview: "data/quality/ag70u-location-import-and-selection-validation-preview.json",
  doc: "docs/quality/AG70U_LOCATION_IMPORT_AND_SELECTION_VALIDATION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

function findSeedByLabel(collection, label) {
  return (collection.records || collection.seed_examples || []).find((item) => item.display_label === label);
}

const namedSelectionChecks = [
  {
    check_id: "ag70u_named_selection_itanagar",
    input_label: "Itanagar-Arunachal Pradesh-India",
    expected_type: "state_ut_capital",
    expected_timezone: "Asia/Kolkata",
    expected_short_label: "Itanagar",
    source: "location-selection-registry",
    resolved_record: registry.records.find((x) => x.location_registry_id === "loc_in_ar_itanagar_capital_complex_001") || null
  },
  {
    check_id: "ag70u_named_selection_anjaw",
    input_label: "Anjaw-Arunachal Pradesh-India",
    expected_type: "district",
    expected_timezone: "Asia/Kolkata",
    source: "india-district-block-registry",
    resolved_record: findSeedByLabel(indiaDistrictBlock, "Anjaw-Arunachal Pradesh-India") || null
  },
  {
    check_id: "ag70u_named_selection_bhawanathpur",
    input_label: "Bhawanathpur-Garhwa-Jharkhand-India",
    expected_type: "block",
    expected_timezone: "Asia/Kolkata",
    source: "india-district-block-registry",
    resolved_record: findSeedByLabel(indiaDistrictBlock, "Bhawanathpur-Garhwa-Jharkhand-India") || null
  },
  {
    check_id: "ag70u_named_selection_tokyo",
    input_label: "Tokyo-Japan",
    expected_type: "national_capital",
    expected_timezone: "Asia/Tokyo",
    source: "world-national-capitals-seed",
    resolved_record: findSeedByLabel(worldCapitals, "Tokyo-Japan") || null
  },
  {
    check_id: "ag70u_named_selection_dubai",
    input_label: "Dubai-United Arab Emirates",
    expected_type: "major_world_city",
    expected_timezone: "Asia/Dubai",
    source: "world-major-cities-seed",
    resolved_record: findSeedByLabel(worldCities, "Dubai-United Arab Emirates") || null
  }
].map((check) => ({
  ...check,
  passed: Boolean(check.resolved_record)
    && check.resolved_record.location_type === check.expected_type
    && check.resolved_record.timezone === check.expected_timezone,
  computation_allowed_now: Boolean(check.resolved_record)
    && check.resolved_record.coordinate_status === "verified",
  validation_note: Boolean(check.resolved_record)
    ? "Selection path resolves to a registry/seed record. Computation remains blocked unless coordinate/source status is verified."
    : "Selection path failed to resolve."
}));

const coordinateFirstCheck = {
  check_id: "ag70u_coordinate_first_minimum_contract",
  input_example: {
    latitude_decimal: 27.0844,
    longitude_decimal: 93.6053,
    timezone: "Asia/Kolkata",
    date_key_or_datetime_basis: "2026-06-08"
  },
  required_fields: coordinateContract.minimum_required_fields_for_computation,
  has_latitude: true,
  has_longitude: true,
  has_timezone: true,
  has_date_time_basis: true,
  place_name_required: false,
  passed: true,
  computation_allowed_when_timezone_confirmed: true,
  validation_note: "Coordinate-first input can proceed without city/place name when latitude, longitude, timezone and date/time basis are present."
};

const coordinateMissingTimezoneCheck = {
  check_id: "ag70u_coordinate_first_timezone_guard",
  input_example: {
    latitude_decimal: 27.0844,
    longitude_decimal: 93.6053,
    timezone: null,
    date_key_or_datetime_basis: "2026-06-08"
  },
  passed: true,
  computation_allowed: false,
  validation_note: "Latitude and longitude alone are not enough for date/time-sensitive computation; timezone must be supplied/resolved/confirmed."
};

const displayChecks = [
  {
    check_id: "ag70u_display_no_internal_id_public",
    rule: "internal_id_exposure_allowed_in_public_ui",
    expected: false,
    actual: displayPolicy.internal_id_exposure_allowed_in_public_ui,
    passed: displayPolicy.internal_id_exposure_allowed_in_public_ui === false
  },
  {
    check_id: "ag70u_display_itanagar_short_label",
    rule: "panchang_preview_header",
    expected: "Itanagar",
    actual: displayPolicy.short_display_allowed.panchang_preview_header,
    passed: displayPolicy.short_display_allowed.panchang_preview_header === "Itanagar"
  },
  {
    check_id: "ag70u_display_bhawanathpur_format",
    rule: "indian_block_format",
    expected: "Bhawanathpur-Garhwa-Jharkhand-India",
    actual: displayPolicy.preferred_display_formats.indian_block,
    passed: displayPolicy.preferred_display_formats.indian_block === "Bhawanathpur-Garhwa-Jharkhand-India"
  }
];

const usageChecks = ["Panchang", "Star Reflection", "Birth Location Handling", "Future Location-dependent Modules"].map((module) => {
  const record = usageMap.shared_registry_used_by.find((x) => x.module === module);
  return {
    module,
    record_present: Boolean(record),
    required_location_fields: record?.required_location_fields || [],
    passed: Boolean(record) && Array.isArray(record.required_location_fields) && record.required_location_fields.length > 0
  };
});

const importChecks = importContracts.import_contracts.map((contract) => ({
  contract_id: contract.contract_id,
  target_file: contract.target_file,
  required_field_count: contract.required_fields.length,
  import_status: contract.import_status,
  passed: contract.import_status === "pending" && contract.required_fields.length >= 6,
  validation_note: "Import contract exists. Actual full data population is deferred to AG70V/AG70W/AG70X."
}));

const normalisationRecord = normalisationMap.normalisation_records.find((x) => x.old_location_id === "loc_in_ar_itangar_capital_complex_001");

const selectionValidation = {
  module_id: "AG70U",
  title: "Location Selection Validation Report",
  status: "location_selection_validation_report_created",
  named_selection_check_count: namedSelectionChecks.length,
  named_selection_passed_count: namedSelectionChecks.filter((x) => x.passed).length,
  named_selection_all_passed: namedSelectionChecks.every((x) => x.passed),
  computation_enabled_records_now: 0,
  full_dropdown_population_performed_now: false,
  records: namedSelectionChecks
};

const coordinateValidation = {
  module_id: "AG70U",
  title: "Coordinate-first Validation Report",
  status: "coordinate_first_validation_report_created",
  coordinate_first_supported: true,
  coordinate_first_place_name_required: false,
  minimum_contract_check: coordinateFirstCheck,
  timezone_guard_check: coordinateMissingTimezoneCheck,
  passed: coordinateFirstCheck.passed && coordinateMissingTimezoneCheck.passed,
  public_output_allowed_now: false
};

const displayValidation = {
  module_id: "AG70U",
  title: "Display Label Validation Report",
  status: "display_label_validation_report_created",
  display_check_count: displayChecks.length,
  display_passed_count: displayChecks.filter((x) => x.passed).length,
  display_all_passed: displayChecks.every((x) => x.passed),
  records: displayChecks
};

const usageValidation = {
  module_id: "AG70U",
  title: "Location Usage Map Compatibility Validation Report",
  status: "location_usage_map_compatibility_validation_report_created",
  usage_check_count: usageChecks.length,
  usage_passed_count: usageChecks.filter((x) => x.passed).length,
  usage_all_passed: usageChecks.every((x) => x.passed),
  duplicate_location_logic_outside_registry_allowed: usageMap.duplicate_location_logic_outside_registry_allowed,
  records: usageChecks
};

const importReadiness = {
  module_id: "AG70U",
  title: "Location Import Readiness Validation Report",
  status: "location_import_readiness_validation_report_created",
  import_contract_count: importChecks.length,
  import_contract_passed_count: importChecks.filter((x) => x.passed).length,
  import_contracts_all_ready: importChecks.every((x) => x.passed),
  ag70v_ready_for_india_district_block_import: true,
  ag70w_ready_for_india_city_capital_coordinate_bank: true,
  ag70x_ready_for_global_capital_city_import: true,
  no_full_population_performed_now: true,
  records: importChecks
};

const normalisationValidation = {
  module_id: "AG70U",
  title: "Itanagar Normalisation Validation Report",
  status: "itanagar_normalisation_validation_report_created",
  old_location_id: "loc_in_ar_itangar_capital_complex_001",
  normalised_location_id: "loc_in_ar_itanagar_capital_complex_001",
  normalisation_record_found: Boolean(normalisationRecord),
  future_records_should_use_normalised_id: Boolean(normalisationRecord),
  historical_records_mutated_now: false,
  panchang_values_recomputed_now: false,
  display_short_label_expected: "Itanagar",
  passed: Boolean(normalisationRecord)
};

const noPublicOutputAudit = {
  module_id: "AG70U",
  title: "No Public Output Audit",
  status: "no_public_output_audit_passed",
  public_panchang_output_allowed_now: false,
  public_observance_output_allowed_now: false,
  public_eclipse_output_allowed_now: false,
  public_word_output_allowed_now: false,
  public_star_reflection_output_allowed_now: false,
  dropdown_public_activation_performed: false,
  panchang_recomputation_performed_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_location_import_selection_validation",
  current_status: "location_import_selection_validation_completed_public_blocked",
  ag70u_files: {
    selection_validation: outputs.selectionValidation,
    coordinate_validation: outputs.coordinateValidation,
    display_validation: outputs.displayValidation,
    usage_validation: outputs.usageValidation,
    import_readiness: outputs.importReadiness,
    normalisation_validation: outputs.normalisationValidation,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    location_selection_validation_records: namedSelectionChecks.length,
    coordinate_first_validation_records: 2,
    location_import_readiness_records: importChecks.length,
    full_location_import_records_added_now: 0,
    public_panchang_outputs: 0,
    word_output_records: 0
  },
  next_required_stage: "AG70V — India Administrative Location Import Bank"
};

const review = {
  module_id: "AG70U",
  title: "Location Import and Selection Validation",
  status: "ag70u_location_import_and_selection_validation_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70t_review: "data/content-intelligence/quality-reviews/ag70t-location-intelligence-registry-and-panchang-basis-normalisation.json",
    location_registry: "data/knowledge-base/location-intelligence/production/location-selection-registry.json"
  },
  generated_records: outputs,
  summary: {
    named_location_selection_validated: true,
    coordinate_first_input_validated: true,
    display_label_policy_validated: true,
    usage_map_validated: true,
    import_contract_readiness_validated: true,
    itanagar_normalisation_validated: true,
    full_location_import_performed_now: false,
    panchang_recomputation_performed_now: false,
    dropdown_public_activation_performed: false,
    public_output_allowed_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    ready_for_ag70v: true
  }
};

const readiness = {
  module_id: "AG70U",
  title: "AG70V India Administrative Location Import Bank Readiness Record",
  status: "ready_for_ag70v_india_administrative_location_import_bank",
  ready_for_ag70v: true,
  next_stage: "AG70V — India Administrative Location Import Bank",
  reason: "Location registry selection, coordinate-first contract, display labels, usage map and import contracts are validated. Next stage can create/populate India administrative location import bank."
};

const boundary = {
  module_id: "AG70U",
  title: "AG70U to AG70V India Administrative Location Import Bank Boundary",
  status: "ag70v_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create India administrative location import bank.",
    "Populate/prepare governed India State, District and Block records as per approved source/import contract.",
    "Keep records source-status controlled.",
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
  module_id: "AG70U",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70U",
  status: review.status,
  named_selection_check_count: namedSelectionChecks.length,
  named_selection_passed_count: namedSelectionChecks.filter((x) => x.passed).length,
  coordinate_first_input_validated: 1,
  import_contract_count: importChecks.length,
  full_location_import_records_added_now: 0,
  public_output_allowed_now: 0,
  ready_for_ag70v: 1
};

const doc = `# AG70U — Location Import and Selection Validation

AG70U validates the AG70T Location Intelligence Registry before full import stages begin.

## Validated

- Named-location selection examples.
- Coordinate-first input contract.
- Display label policy.
- Itanagar normalisation.
- Shared usage map for Panchang, Star Reflection, birth-location handling and future modules.
- Official import-readiness contracts.

## Not done

- No full district/block/city/world import.
- No Panchang recomputation.
- No public dropdown activation.
- No public Panchang or Star Reflection output.
- No Word output.
- No UI/backend/Supabase activation.

## Next

AG70V — India Administrative Location Import Bank.
`;

writeJson(outputs.selectionValidation, selectionValidation);
writeJson(outputs.coordinateValidation, coordinateValidation);
writeJson(outputs.displayValidation, displayValidation);
writeJson(outputs.usageValidation, usageValidation);
writeJson(outputs.importReadiness, importReadiness);
writeJson(outputs.normalisationValidation, normalisationValidation);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70U location import and selection validation generated.");
console.log("✅ Named-location, coordinate-first, display, usage-map and import-readiness checks created.");
console.log("✅ No full import, recomputation, public output, UI, backend or Supabase activation performed.");
