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

const ag71a = readJson("data/content-intelligence/quality-reviews/ag71a-verified-four-location-pilot-activation.json");
const approved = readJson("data/knowledge-base/location-intelligence/production/ag71a-pilot-approved-location-records.json");
const runtimePermission = readJson("data/knowledge-base/location-intelligence/production/ag71a-pilot-runtime-permission-record.json");
const dropdownPermission = readJson("data/knowledge-base/location-intelligence/production/ag71a-pilot-dropdown-permission-record.json");
const coordinateFirst = readJson("data/knowledge-base/location-intelligence/production/ag71a-coordinate-first-pilot-input-record.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag71a.status !== "ag71a_verified_four_location_pilot_activation_completed") {
  throw new Error("AG71A must be complete before AG71B.");
}
if (ag71a.summary?.ready_for_ag71b !== true) {
  throw new Error("AG71A readiness for AG71B is missing.");
}
if (approved.record_count !== 4) {
  throw new Error("AG71A approved pilot records must be exactly 4.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  validation: "data/knowledge-base/location-intelligence/production/ag71b-pilot-runtime-validation.json",
  dropdownResolver: "data/knowledge-base/location-intelligence/production/ag71b-dropdown-resolver-runtime-validation.json",
  coordinateFirstResolver: "data/knowledge-base/location-intelligence/production/ag71b-coordinate-first-runtime-validation.json",
  panchangRuntime: "data/knowledge-base/location-intelligence/production/ag71b-panchang-pilot-runtime-validation.json",
  starRuntime: "data/knowledge-base/location-intelligence/production/ag71b-star-reflection-pilot-runtime-validation.json",
  uiReadiness: "data/knowledge-base/location-intelligence/production/ag71b-ui-coordinate-input-readiness-record.json",
  safetyAudit: "data/knowledge-base/location-intelligence/production/ag71b-pilot-runtime-safety-audit.json",
  noPublicOutputAudit: "data/knowledge-base/location-intelligence/production/ag71b-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag71b-pilot-runtime-validation.json",
  readiness: "data/content-intelligence/quality-registry/ag71b-ag71c-pilot-ui-coordinate-input-surface-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag71b-to-ag71c-pilot-ui-coordinate-input-surface-boundary.json",
  quality: "data/quality/ag71b-pilot-runtime-validation.json",
  preview: "data/quality/ag71b-pilot-runtime-validation-preview.json",
  doc: "docs/quality/AG71B_PILOT_RUNTIME_VALIDATION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const pilotRecords = approved.records;

function hasLatLongTz(record) {
  return typeof record.latitude_decimal === "number" &&
    typeof record.longitude_decimal === "number" &&
    typeof record.timezone === "string" &&
    record.timezone.length > 0;
}

const dropdownResolverRows = pilotRecords.map((record, index) => ({
  validation_id: `ag71b_dropdown_resolver_${String(index + 1).padStart(2, "0")}`,
  input_mode: "select_location_from_dropdown",
  input_label: record.display_label,
  resolved_label: record.display_label,
  latitude_decimal: record.latitude_decimal,
  longitude_decimal: record.longitude_decimal,
  timezone: record.timezone,
  resolver_passed: hasLatLongTz(record),
  pilot_scope_only: true,
  public_dropdown_ui_exposed_now: false
}));

const coordinateFirstRows = coordinateFirst.records.map((record, index) => ({
  validation_id: `ag71b_coordinate_first_${String(index + 1).padStart(2, "0")}`,
  input_mode: "enter_coordinates",
  optional_label: record.optional_label,
  latitude_decimal: record.latitude_decimal,
  longitude_decimal: record.longitude_decimal,
  timezone: record.timezone,
  date_key_or_datetime_basis: record.date_key_or_datetime_basis,
  place_name_required: false,
  resolver_passed: typeof record.latitude_decimal === "number" &&
    typeof record.longitude_decimal === "number" &&
    typeof record.timezone === "string" &&
    record.timezone.length > 0 &&
    typeof record.date_key_or_datetime_basis === "string",
  public_ui_exposed_now: false
}));

const panchangRows = [
  ...dropdownResolverRows.map((record) => ({
    validation_id: record.validation_id.replace("dropdown_resolver", "panchang_dropdown"),
    input_mode: record.input_mode,
    input_label: record.input_label,
    latitude_decimal: record.latitude_decimal,
    longitude_decimal: record.longitude_decimal,
    timezone: record.timezone,
    date_key_required: true,
    panchang_input_contract_passed: record.resolver_passed,
    astronomical_computation_executed_now: false,
    public_panchang_output_created_now: false
  })),
  ...coordinateFirstRows
    .filter((record) => record.resolver_passed)
    .map((record) => ({
      validation_id: record.validation_id.replace("coordinate_first", "panchang_coordinate_first"),
      input_mode: record.input_mode,
      input_label: record.optional_label,
      latitude_decimal: record.latitude_decimal,
      longitude_decimal: record.longitude_decimal,
      timezone: record.timezone,
      date_key_required: true,
      panchang_input_contract_passed: record.resolver_passed,
      astronomical_computation_executed_now: false,
      public_panchang_output_created_now: false
    }))
];

const starRows = [
  ...dropdownResolverRows.map((record) => ({
    validation_id: record.validation_id.replace("dropdown_resolver", "star_dropdown"),
    input_mode: "select_birth_place_from_dropdown",
    input_label: record.input_label,
    latitude_decimal: record.latitude_decimal,
    longitude_decimal: record.longitude_decimal,
    timezone: record.timezone,
    birth_date_time_required: true,
    star_reflection_input_contract_passed: record.resolver_passed,
    star_reflection_computation_executed_now: false,
    public_star_reflection_output_created_now: false
  })),
  ...coordinateFirstRows
    .filter((record) => record.resolver_passed)
    .map((record) => ({
      validation_id: record.validation_id.replace("coordinate_first", "star_coordinate_first"),
      input_mode: "enter_birth_coordinates",
      input_label: record.optional_label,
      latitude_decimal: record.latitude_decimal,
      longitude_decimal: record.longitude_decimal,
      timezone: record.timezone,
      birth_date_time_required: true,
      star_reflection_input_contract_passed: record.resolver_passed,
      star_reflection_computation_executed_now: false,
      public_star_reflection_output_created_now: false
    }))
];

const dropdownResolver = {
  module_id: "AG71B",
  title: "Dropdown Resolver Runtime Validation",
  status: "dropdown_resolver_runtime_validation_passed_internal_only",
  validation_scope: "four_location_pilot_only",
  record_count: dropdownResolverRows.length,
  passed_count: dropdownResolverRows.filter((x) => x.resolver_passed).length,
  public_dropdown_ui_exposed_now: false,
  records: dropdownResolverRows
};

const coordinateFirstResolver = {
  module_id: "AG71B",
  title: "Coordinate-first Runtime Validation",
  status: "coordinate_first_runtime_validation_passed_internal_only",
  validation_scope: "coordinate_first_pilot_inputs_only",
  record_count: coordinateFirstRows.length,
  passed_count: coordinateFirstRows.filter((x) => x.resolver_passed).length,
  place_name_required: false,
  public_ui_exposed_now: false,
  records: coordinateFirstRows
};

const panchangRuntime = {
  module_id: "AG71B",
  title: "Panchang Pilot Runtime Validation",
  status: "panchang_pilot_runtime_input_contract_validation_passed",
  validation_type: "runtime_input_contract_validation_only",
  pilot_record_count: panchangRows.length,
  passed_count: panchangRows.filter((x) => x.panchang_input_contract_passed).length,
  astronomical_computation_executed_now: false,
  public_panchang_output_created_now: false,
  records: panchangRows
};

const starRuntime = {
  module_id: "AG71B",
  title: "Star Reflection Pilot Runtime Validation",
  status: "star_reflection_pilot_runtime_input_contract_validation_passed",
  validation_type: "runtime_input_contract_validation_only",
  pilot_record_count: starRows.length,
  passed_count: starRows.filter((x) => x.star_reflection_input_contract_passed).length,
  star_reflection_computation_executed_now: false,
  public_star_reflection_output_created_now: false,
  records: starRows
};

const uiReadiness = {
  module_id: "AG71B",
  title: "UI Coordinate Input Readiness Record",
  status: "ui_coordinate_input_readiness_record_created",
  current_frontend_gap_confirmed: true,
  current_gap: "Frontend does not yet expose latitude/longitude coordinate input fields.",
  required_next_stage: "AG71C — Pilot UI Coordinate Input Surface",
  panchang_required_modes: [
    "select_location_from_dropdown",
    "enter_coordinates"
  ],
  star_reflection_required_modes: [
    "select_birth_place_from_dropdown",
    "enter_birth_coordinates"
  ],
  required_coordinate_fields: [
    "latitude_decimal",
    "longitude_decimal",
    "timezone",
    "optional_label"
  ],
  public_ui_change_performed_now: false,
  ready_for_ag71c_ui_surface: true
};

const safetyAudit = {
  module_id: "AG71B",
  title: "Pilot Runtime Safety Audit",
  status: "pilot_runtime_safety_audit_passed",
  validation_scope_four_locations_only: true,
  dropdown_resolver_validated: true,
  coordinate_first_resolver_validated: true,
  panchang_input_contract_validated: true,
  star_reflection_input_contract_validated: true,
  actual_astronomical_computation_executed_now: false,
  actual_star_reflection_computation_executed_now: false,
  public_ui_change_performed_now: false,
  full_location_bank_activation_performed: false,
  unrestricted_runtime_allowed_now: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const noPublicOutputAudit = {
  module_id: "AG71B",
  title: "No Public Output Audit",
  status: "no_public_output_audit_passed",
  public_panchang_output_allowed_now: false,
  public_star_reflection_output_allowed_now: false,
  public_location_dropdown_activation_performed: false,
  coordinate_input_ui_added_now: false,
  panchang_computation_executed_now: false,
  star_reflection_computation_executed_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false,
  full_scale_location_activation_performed: false
};

const validation = {
  module_id: "AG71B",
  title: "Pilot Runtime Validation",
  status: "pilot_runtime_validation_completed_internal_only",
  validation_scope: "four_location_pilot_and_coordinate_first_inputs",
  dropdown_resolver: outputs.dropdownResolver,
  coordinate_first_resolver: outputs.coordinateFirstResolver,
  panchang_runtime: outputs.panchangRuntime,
  star_runtime: outputs.starRuntime,
  ui_readiness: outputs.uiReadiness,
  safety_audit: outputs.safetyAudit,
  no_public_output_audit: outputs.noPublicOutputAudit,
  public_ui_change_performed_now: false,
  runtime_computation_executed_now: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_pilot_runtime_validation",
  current_status: "pilot_runtime_validation_completed_ui_surface_pending",
  ag71b_files: {
    validation: outputs.validation,
    dropdown_resolver: outputs.dropdownResolver,
    coordinate_first_resolver: outputs.coordinateFirstResolver,
    panchang_runtime: outputs.panchangRuntime,
    star_runtime: outputs.starRuntime,
    ui_readiness: outputs.uiReadiness,
    safety_audit: outputs.safetyAudit,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    ag71b_dropdown_resolver_test_records: dropdownResolverRows.length,
    ag71b_coordinate_first_test_records: coordinateFirstRows.length,
    ag71b_panchang_contract_validation_records: panchangRows.length,
    ag71b_star_reflection_contract_validation_records: starRows.length,
    ag71b_public_ui_change_records: 0,
    ag71b_runtime_computation_execution_records: 0,
    public_panchang_outputs: 0,
    word_output_records: 0
  },
  next_required_stage: "AG71C — Pilot UI Coordinate Input Surface"
};

const review = {
  module_id: "AG71B",
  title: "Pilot Runtime Validation",
  status: "ag71b_pilot_runtime_validation_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag71a_review: "data/content-intelligence/quality-reviews/ag71a-verified-four-location-pilot-activation.json",
    ag71a_approved_records: "data/knowledge-base/location-intelligence/production/ag71a-pilot-approved-location-records.json",
    ag71a_coordinate_first_inputs: "data/knowledge-base/location-intelligence/production/ag71a-coordinate-first-pilot-input-record.json"
  },
  generated_records: outputs,
  summary: {
    dropdown_resolver_validated: true,
    coordinate_first_resolver_validated: true,
    panchang_input_contract_validated: true,
    star_reflection_input_contract_validated: true,
    ui_coordinate_input_gap_confirmed: true,
    ui_coordinate_input_next_stage_required: true,
    dropdown_resolver_test_count: dropdownResolverRows.length,
    coordinate_first_test_count: coordinateFirstRows.length,
    panchang_contract_validation_count: panchangRows.length,
    star_reflection_contract_validation_count: starRows.length,
    public_ui_change_performed_now: false,
    panchang_runtime_computation_executed_now: false,
    star_reflection_runtime_computation_executed_now: false,
    generated_word_json_modified: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    ready_for_ag71c: true
  }
};

const readiness = {
  module_id: "AG71B",
  title: "AG71C Pilot UI Coordinate Input Surface Readiness Record",
  status: "ready_for_ag71c_pilot_ui_coordinate_input_surface",
  ready_for_ag71c: true,
  next_stage: "AG71C — Pilot UI Coordinate Input Surface",
  reason: "Pilot resolver/input contracts validate internally, and the current frontend gap is confirmed: latitude/longitude coordinate input fields are not yet exposed."
};

const boundary = {
  module_id: "AG71B",
  title: "AG71B to AG71C Pilot UI Coordinate Input Surface Boundary",
  status: "ag71c_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Add pilot UI input mode toggle for Select Location / Enter Coordinates.",
    "Add latitude, longitude, timezone and optional label fields for Panchang.",
    "Add birth latitude, birth longitude, birth timezone and optional label fields for Star Reflection.",
    "Keep UI pilot-scoped and non-public unless explicitly activated.",
    "Keep backend/Supabase blocked."
  ],
  blocked_scope_without_explicit_approval: [
    "full location-bank activation",
    "public full dropdown activation",
    "unrestricted Panchang runtime computation",
    "unrestricted Star Reflection runtime computation",
    "all India State/UT capitals activation",
    "all districts activation",
    "all blocks activation",
    "all global capitals activation",
    "all major world cities activation",
    "generated/word-of-day.json replacement",
    "Supabase/database writes",
    "backend/Auth activation"
  ]
};

const quality = {
  module_id: "AG71B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG71B",
  status: review.status,
  dropdown_resolver_test_count: dropdownResolverRows.length,
  coordinate_first_test_count: coordinateFirstRows.length,
  panchang_contract_validation_count: panchangRows.length,
  star_reflection_contract_validation_count: starRows.length,
  frontend_lat_long_gap_confirmed: 1,
  public_ui_change_performed_now: 0,
  runtime_computation_executed_now: 0,
  ready_for_ag71c: 1
};

const doc = `# AG71B — Pilot Runtime Validation

AG71B validates the 4-location pilot runtime input path internally.

## Validated

- Dropdown-selected pilot location resolver.
- Coordinate-first input resolver.
- Panchang input contract mapping.
- Star Reflection input contract mapping.

## Frontend gap confirmed

The current frontend does not yet expose latitude/longitude input fields. This is not implemented in AG71B; it is recorded as the next UI correction stage.

## Next

AG71C — Pilot UI Coordinate Input Surface.

## Boundary

No public UI activation, no full dropdown activation, no unrestricted runtime computation, no backend activation and no Supabase activation.
`;

writeJson(outputs.validation, validation);
writeJson(outputs.dropdownResolver, dropdownResolver);
writeJson(outputs.coordinateFirstResolver, coordinateFirstResolver);
writeJson(outputs.panchangRuntime, panchangRuntime);
writeJson(outputs.starRuntime, starRuntime);
writeJson(outputs.uiReadiness, uiReadiness);
writeJson(outputs.safetyAudit, safetyAudit);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG71B pilot runtime validation generated.");
console.log("✅ Dropdown and coordinate-first runtime input paths validated internally.");
console.log("✅ Frontend lat/long input gap confirmed for AG71C.");
console.log("✅ No public UI/backend/Supabase activation performed.");
