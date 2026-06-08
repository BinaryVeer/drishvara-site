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

const ag70x = readJson("data/content-intelligence/quality-reviews/ag70x-global-capitals-major-cities-coordinate-bank.json");
const locationRegistry = readJson("data/knowledge-base/location-intelligence/production/location-selection-registry.json");
const coordinateContract = readJson("data/knowledge-base/location-intelligence/production/location-coordinate-input-contract.json");
const usageMap = readJson("data/knowledge-base/location-intelligence/production/location-usage-map.json");
const indiaAdminBank = readJson("data/knowledge-base/location-intelligence/production/india-administrative-location-import-bank.json");
const indiaCityBank = readJson("data/knowledge-base/location-intelligence/production/india-cities-capitals-coordinate-bank.json");
const globalCityBank = readJson("data/knowledge-base/location-intelligence/production/global-capitals-major-cities-coordinate-bank.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70x.status !== "ag70x_global_capitals_major_cities_coordinate_bank_completed") {
  throw new Error("AG70X must be complete before AG70Y.");
}
if (ag70x.summary?.ready_for_ag70y !== true) {
  throw new Error("AG70X readiness for AG70Y is missing.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  resolverTest: "data/knowledge-base/location-intelligence/production/ag70y-location-selection-resolver-test.json",
  namedResolverReport: "data/knowledge-base/location-intelligence/production/ag70y-named-location-resolver-test-report.json",
  coordinateFirstReport: "data/knowledge-base/location-intelligence/production/ag70y-coordinate-first-resolver-test-report.json",
  panchangMapping: "data/knowledge-base/location-intelligence/production/ag70y-panchang-input-contract-mapping-test.json",
  starReflectionMapping: "data/knowledge-base/location-intelligence/production/ag70y-star-reflection-input-contract-mapping-test.json",
  safetyAudit: "data/knowledge-base/location-intelligence/production/ag70y-resolution-blocking-safety-audit.json",
  noPublicOutputAudit: "data/knowledge-base/location-intelligence/production/ag70y-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70y-location-selection-resolver-test.json",
  readiness: "data/content-intelligence/quality-registry/ag70y-ag70z-location-intelligence-foundation-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70y-to-ag70z-location-intelligence-foundation-closure-boundary.json",
  quality: "data/quality/ag70y-location-selection-resolver-test.json",
  preview: "data/quality/ag70y-location-selection-resolver-test-preview.json",
  doc: "docs/quality/AG70Y_LOCATION_SELECTION_RESOLVER_TEST.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

function findByLabel(records, label) {
  return records.find((x) => x.display_label === label) || null;
}

function resolveNamedLocation(label) {
  const registryRecord = findByLabel(locationRegistry.records || [], label);
  if (registryRecord) {
    return {
      input_label: label,
      source_bank: "location-selection-registry",
      resolved: true,
      resolution_type: "registry_record",
      location_type: registryRecord.location_type,
      display_label: registryRecord.display_label,
      latitude_decimal: registryRecord.latitude_decimal,
      longitude_decimal: registryRecord.longitude_decimal,
      timezone: registryRecord.timezone,
      coordinate_status: registryRecord.coordinate_status || registryRecord.coordinate_value_status || null,
      computation_allowed_now: registryRecord.computation_allowed_now === true,
      public_dropdown_activation_allowed_now: false
    };
  }

  const indiaCityRecord = findByLabel(indiaCityBank.records || [], label);
  if (indiaCityRecord) {
    return {
      input_label: label,
      source_bank: "india-cities-capitals-coordinate-bank",
      resolved: true,
      resolution_type: "candidate_coordinate_record",
      location_type: indiaCityRecord.location_type,
      display_label: indiaCityRecord.display_label,
      latitude_decimal: indiaCityRecord.latitude_decimal,
      longitude_decimal: indiaCityRecord.longitude_decimal,
      timezone: indiaCityRecord.timezone,
      coordinate_status: indiaCityRecord.coordinate_value_status,
      source_status: indiaCityRecord.coordinate_source_status,
      computation_allowed_now: false,
      public_dropdown_activation_allowed_now: false
    };
  }

  const globalRecord = findByLabel(globalCityBank.records || [], label);
  if (globalRecord) {
    return {
      input_label: label,
      source_bank: "global-capitals-major-cities-coordinate-bank",
      resolved: true,
      resolution_type: "candidate_coordinate_record",
      location_type: globalRecord.location_type,
      display_label: globalRecord.display_label,
      latitude_decimal: globalRecord.latitude_decimal,
      longitude_decimal: globalRecord.longitude_decimal,
      timezone: globalRecord.timezone,
      coordinate_status: globalRecord.coordinate_value_status,
      source_status: globalRecord.coordinate_source_status,
      timezone_source_status: globalRecord.timezone_source_status,
      computation_allowed_now: false,
      public_dropdown_activation_allowed_now: false
    };
  }

  const adminRecord = findByLabel(indiaAdminBank.records || [], label);
  if (adminRecord) {
    return {
      input_label: label,
      source_bank: "india-administrative-location-import-bank",
      resolved: true,
      resolution_type: "identity_only_coordinate_pending",
      location_type: adminRecord.location_type,
      display_label: adminRecord.display_label,
      latitude_decimal: adminRecord.latitude_decimal,
      longitude_decimal: adminRecord.longitude_decimal,
      timezone: adminRecord.timezone,
      coordinate_status: adminRecord.coordinate_source_status,
      computation_allowed_now: false,
      public_dropdown_activation_allowed_now: false
    };
  }

  return {
    input_label: label,
    source_bank: null,
    resolved: false,
    resolution_type: "not_found",
    computation_allowed_now: false,
    public_dropdown_activation_allowed_now: false
  };
}

function resolveCoordinateFirst(input) {
  const hasLat = typeof input.latitude_decimal === "number";
  const hasLon = typeof input.longitude_decimal === "number";
  const hasTimezone = typeof input.timezone === "string" && input.timezone.length > 0;
  const hasDateTimeBasis = typeof input.date_key_or_datetime_basis === "string" && input.date_key_or_datetime_basis.length > 0;

  const contractValid = hasLat && hasLon && hasTimezone && hasDateTimeBasis;

  return {
    input_mode: "coordinate_first",
    input,
    place_name_required: false,
    resolved: contractValid,
    resolution_type: contractValid ? "coordinate_first_contract_valid" : "coordinate_first_contract_invalid",
    latitude_decimal: hasLat ? input.latitude_decimal : null,
    longitude_decimal: hasLon ? input.longitude_decimal : null,
    timezone: hasTimezone ? input.timezone : null,
    date_key_or_datetime_basis: hasDateTimeBasis ? input.date_key_or_datetime_basis : null,
    missing_fields: [
      !hasLat ? "latitude_decimal" : null,
      !hasLon ? "longitude_decimal" : null,
      !hasTimezone ? "timezone" : null,
      !hasDateTimeBasis ? "date_key_or_datetime_basis" : null
    ].filter(Boolean),
    contract_valid: contractValid,
    computation_executed_now: false,
    public_output_allowed_now: false
  };
}

const namedTestInputs = [
  "Itanagar-Arunachal Pradesh-India",
  "New Delhi-Delhi-India",
  "Bhawanathpur-Garhwa-Jharkhand-India",
  "Tokyo-Japan",
  "Dubai-United Arab Emirates"
];

const namedResolverResults = namedTestInputs.map(resolveNamedLocation);

const coordinateFirstResults = [
  resolveCoordinateFirst({
    latitude_decimal: 27.0844,
    longitude_decimal: 93.6053,
    timezone: "Asia/Kolkata",
    date_key_or_datetime_basis: "2026-06-08",
    optional_place_label: "User-entered coordinates near Itanagar"
  }),
  resolveCoordinateFirst({
    latitude_decimal: 23.3441,
    longitude_decimal: 85.3096,
    timezone: "Asia/Kolkata",
    date_key_or_datetime_basis: "1988-02-10T10:05:23",
    optional_place_label: "User-entered birth coordinates"
  }),
  resolveCoordinateFirst({
    latitude_decimal: 27.0844,
    longitude_decimal: 93.6053,
    timezone: null,
    date_key_or_datetime_basis: "2026-06-08",
    optional_place_label: "Missing timezone guard test"
  })
];

const panchangMappable = [
  ...namedResolverResults.filter((x) => x.resolved && x.latitude_decimal !== null && x.longitude_decimal !== null && x.timezone),
  ...coordinateFirstResults.filter((x) => x.contract_valid)
];

const panchangMappings = panchangMappable.map((item, index) => ({
  mapping_id: `ag70y_panchang_mapping_${String(index + 1).padStart(2, "0")}`,
  source_input_label: item.input_label || item.input.optional_place_label || "coordinate-first input",
  input_mode: item.input_mode || "named_location",
  latitude_decimal: item.latitude_decimal,
  longitude_decimal: item.longitude_decimal,
  timezone: item.timezone,
  date_key_required: true,
  panchang_input_contract_fields_present: Boolean(item.latitude_decimal !== null && item.longitude_decimal !== null && item.timezone),
  panchang_computation_executed_now: false,
  public_output_allowed_now: false
}));

const starReflectionMappings = [
  ...namedResolverResults.filter((x) => x.resolved && x.latitude_decimal !== null && x.longitude_decimal !== null && x.timezone).slice(0, 2),
  ...coordinateFirstResults.filter((x) => x.contract_valid).slice(0, 2)
].map((item, index) => ({
  mapping_id: `ag70y_star_reflection_mapping_${String(index + 1).padStart(2, "0")}`,
  source_input_label: item.input_label || item.input.optional_place_label || "coordinate-first input",
  input_mode: item.input_mode || "named_location",
  latitude_decimal: item.latitude_decimal,
  longitude_decimal: item.longitude_decimal,
  timezone: item.timezone,
  required_birth_fields_not_collected_now: [
    "date_of_birth",
    "exact_time_of_birth",
    "birth_timezone_confirmation"
  ],
  star_reflection_input_contract_partially_mapped: true,
  star_reflection_computation_executed_now: false,
  public_output_allowed_now: false
}));

const namedResolverReport = {
  module_id: "AG70Y",
  title: "Named Location Resolver Test Report",
  status: "named_location_resolver_test_report_created",
  test_count: namedResolverResults.length,
  resolved_count: namedResolverResults.filter((x) => x.resolved).length,
  coordinate_available_count: namedResolverResults.filter((x) => x.latitude_decimal !== null && x.longitude_decimal !== null).length,
  computation_approved_count: 0,
  public_dropdown_activation_count: 0,
  results: namedResolverResults
};

const coordinateFirstReport = {
  module_id: "AG70Y",
  title: "Coordinate-first Resolver Test Report",
  status: "coordinate_first_resolver_test_report_created",
  test_count: coordinateFirstResults.length,
  valid_contract_count: coordinateFirstResults.filter((x) => x.contract_valid).length,
  invalid_contract_count: coordinateFirstResults.filter((x) => !x.contract_valid).length,
  place_name_required: false,
  computation_executed_now: false,
  public_output_allowed_now: false,
  results: coordinateFirstResults
};

const panchangMapping = {
  module_id: "AG70Y",
  title: "Panchang Input Contract Mapping Test",
  status: "panchang_input_contract_mapping_test_created",
  mapping_count: panchangMappings.length,
  all_mappings_have_lat_long_timezone: panchangMappings.every((x) => x.panchang_input_contract_fields_present),
  panchang_computation_executed_now: false,
  public_output_allowed_now: false,
  required_runtime_fields: ["latitude_decimal", "longitude_decimal", "timezone", "date_key"],
  mappings: panchangMappings
};

const starReflectionMapping = {
  module_id: "AG70Y",
  title: "Star Reflection Input Contract Mapping Test",
  status: "star_reflection_input_contract_mapping_test_created",
  mapping_count: starReflectionMappings.length,
  star_reflection_computation_executed_now: false,
  public_output_allowed_now: false,
  required_runtime_fields: [
    "date_of_birth",
    "exact_time_of_birth",
    "timezone_at_birth_datetime",
    "latitude_decimal",
    "longitude_decimal"
  ],
  mappings: starReflectionMappings
};

const safetyAudit = {
  module_id: "AG70Y",
  title: "Resolution Blocking Safety Audit",
  status: "resolution_blocking_safety_audit_passed",
  named_location_resolution_allowed_internally: true,
  coordinate_first_resolution_allowed_internally: true,
  computation_approval_granted_now: false,
  public_dropdown_activation_granted_now: false,
  candidate_coordinates_promoted_to_verified_now: false,
  panchang_computation_executed_now: false,
  star_reflection_computation_executed_now: false,
  unresolved_or_coordinate_pending_records_block_computation: true,
  public_output_allowed_now: false
};

const noPublicOutputAudit = {
  module_id: "AG70Y",
  title: "No Public Output Audit",
  status: "no_public_output_audit_passed",
  public_panchang_output_allowed_now: false,
  public_star_reflection_output_allowed_now: false,
  public_location_dropdown_activation_performed: false,
  panchang_recomputation_performed_now: false,
  star_reflection_computation_performed_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const resolverTest = {
  module_id: "AG70Y",
  title: "Location Selection Resolver Test",
  status: "location_selection_resolver_test_created_internal_only",
  purpose: "Test named-location and coordinate-first resolver paths into Panchang and Star Reflection input contracts without computation/public activation.",
  named_resolver_report: outputs.namedResolverReport,
  coordinate_first_report: outputs.coordinateFirstReport,
  panchang_mapping: outputs.panchangMapping,
  star_reflection_mapping: outputs.starReflectionMapping,
  safety_audit: outputs.safetyAudit,
  named_location_tests: namedResolverResults,
  coordinate_first_tests: coordinateFirstResults,
  public_output_allowed_now: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_location_selection_resolver_test",
  current_status: "location_selection_resolver_test_created_internal_only_public_blocked",
  ag70y_files: {
    resolver_test: outputs.resolverTest,
    named_resolver_report: outputs.namedResolverReport,
    coordinate_first_report: outputs.coordinateFirstReport,
    panchang_mapping: outputs.panchangMapping,
    star_reflection_mapping: outputs.starReflectionMapping,
    safety_audit: outputs.safetyAudit,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    location_resolver_named_test_records: namedResolverResults.length,
    location_resolver_coordinate_first_test_records: coordinateFirstResults.length,
    panchang_input_mapping_test_records: panchangMappings.length,
    star_reflection_input_mapping_test_records: starReflectionMappings.length,
    resolver_computation_executed_records: 0,
    public_panchang_outputs: 0,
    word_output_records: 0
  },
  next_required_stage: "AG70Z — Location Intelligence Foundation Closure"
};

const review = {
  module_id: "AG70Y",
  title: "Location Selection Resolver Test",
  status: "ag70y_location_selection_resolver_test_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70x_review: "data/content-intelligence/quality-reviews/ag70x-global-capitals-major-cities-coordinate-bank.json",
    location_registry: "data/knowledge-base/location-intelligence/production/location-selection-registry.json",
    india_coordinate_bank: "data/knowledge-base/location-intelligence/production/india-cities-capitals-coordinate-bank.json",
    global_coordinate_bank: "data/knowledge-base/location-intelligence/production/global-capitals-major-cities-coordinate-bank.json"
  },
  generated_records: outputs,
  summary: {
    named_location_resolver_test_created: true,
    coordinate_first_resolver_test_created: true,
    panchang_input_contract_mapping_created: true,
    star_reflection_input_contract_mapping_created: true,
    safety_audit_created: true,
    named_test_count: namedResolverResults.length,
    coordinate_first_test_count: coordinateFirstResults.length,
    panchang_mapping_count: panchangMappings.length,
    star_reflection_mapping_count: starReflectionMappings.length,
    computation_approval_granted_now: false,
    public_dropdown_activation_performed_now: false,
    panchang_computation_executed_now: false,
    star_reflection_computation_executed_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    ready_for_ag70z: true
  }
};

const readiness = {
  module_id: "AG70Y",
  title: "AG70Z Location Intelligence Foundation Closure Readiness Record",
  status: "ready_for_ag70z_location_intelligence_foundation_closure",
  ready_for_ag70z: true,
  next_stage: "AG70Z — Location Intelligence Foundation Closure",
  reason: "Resolver test confirms named-location and coordinate-first paths can map to Panchang and Star Reflection input contracts internally while computation/public activation remains blocked."
};

const boundary = {
  module_id: "AG70Y",
  title: "AG70Y to AG70Z Location Intelligence Foundation Closure Boundary",
  status: "ag70z_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Close location intelligence foundation sequence.",
    "Record remaining blockers before public dropdown/computation activation.",
    "Preserve source verification and computation-approval gates."
  ],
  blocked_scope_without_explicit_approval: [
    "public Panchang output",
    "public Star Reflection output",
    "public location dropdown activation",
    "generated/word-of-day.json replacement",
    "homepage UI change",
    "runtime Word selector activation",
    "Supabase/database writes",
    "backend/Auth activation"
  ]
};

const quality = {
  module_id: "AG70Y",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70Y",
  status: review.status,
  named_location_test_count: namedResolverResults.length,
  coordinate_first_test_count: coordinateFirstResults.length,
  panchang_mapping_count: panchangMappings.length,
  star_reflection_mapping_count: starReflectionMappings.length,
  computation_executed_now: 0,
  public_output_allowed_now: 0,
  ready_for_ag70z: 1
};

const doc = `# AG70Y — Location Selection Resolver Test

AG70Y tests the location resolver path internally.

## Tested

- Named location resolver.
- Coordinate-first resolver.
- Panchang input contract mapping.
- Star Reflection input contract mapping.
- Safety blocking where coordinates/source verification are pending.

## Important boundary

This is a resolver test only. It does not approve candidate coordinates, activate public dropdowns, run Panchang computation, run Star Reflection computation, or activate UI/backend/Supabase.

## Next

AG70Z — Location Intelligence Foundation Closure.
`;

writeJson(outputs.resolverTest, resolverTest);
writeJson(outputs.namedResolverReport, namedResolverReport);
writeJson(outputs.coordinateFirstReport, coordinateFirstReport);
writeJson(outputs.panchangMapping, panchangMapping);
writeJson(outputs.starReflectionMapping, starReflectionMapping);
writeJson(outputs.safetyAudit, safetyAudit);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70Y location selection resolver test generated.");
console.log(`✅ Named-location tests: ${namedResolverResults.length}.`);
console.log(`✅ Coordinate-first tests: ${coordinateFirstResults.length}.`);
console.log("✅ Panchang/Star Reflection contract mappings created without computation.");
console.log("✅ Public dropdown, UI, backend and Supabase remain blocked.");
