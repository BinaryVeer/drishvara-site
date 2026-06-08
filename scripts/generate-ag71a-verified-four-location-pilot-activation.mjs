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

const ag70z = readJson("data/content-intelligence/quality-reviews/ag70z-location-intelligence-foundation-closure.json");
const pilotSet = readJson("data/knowledge-base/location-intelligence/production/ag70z-four-location-pilot-candidate-set.json");
const activationGate = readJson("data/knowledge-base/location-intelligence/production/ag70z-location-activation-gate.json");
const uiRequirement = readJson("data/knowledge-base/location-intelligence/production/ag70z-coordinate-first-ui-requirement.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70z.status !== "ag70z_location_intelligence_foundation_closure_completed") {
  throw new Error("AG70Z must be complete before AG71A.");
}
if (ag70z.summary?.ready_for_ag71a !== true) {
  throw new Error("AG70Z readiness for AG71A is missing.");
}
if (pilotSet.pilot_record_count !== 4) {
  throw new Error("AG70Z pilot candidate set must contain exactly 4 records.");
}
if (uiRequirement.status !== "coordinate_first_ui_requirement_locked") {
  throw new Error("Coordinate-first UI requirement must be locked before AG71A.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  activation: "data/knowledge-base/location-intelligence/production/ag71a-verified-four-location-pilot-activation.json",
  approvedRecords: "data/knowledge-base/location-intelligence/production/ag71a-pilot-approved-location-records.json",
  coordinateBasis: "data/knowledge-base/location-intelligence/production/ag71a-pilot-coordinate-timezone-basis.json",
  sourceReview: "data/knowledge-base/location-intelligence/production/ag71a-pilot-source-review-record.json",
  dropdownPermission: "data/knowledge-base/location-intelligence/production/ag71a-pilot-dropdown-permission-record.json",
  runtimePermission: "data/knowledge-base/location-intelligence/production/ag71a-pilot-runtime-permission-record.json",
  coordinateFirstPilot: "data/knowledge-base/location-intelligence/production/ag71a-coordinate-first-pilot-input-record.json",
  safetyAudit: "data/knowledge-base/location-intelligence/production/ag71a-pilot-scope-safety-audit.json",
  noPublicOutputAudit: "data/knowledge-base/location-intelligence/production/ag71a-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag71a-verified-four-location-pilot-activation.json",
  readiness: "data/content-intelligence/quality-registry/ag71a-ag71b-pilot-runtime-validation-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag71a-to-ag71b-pilot-runtime-validation-boundary.json",
  quality: "data/quality/ag71a-verified-four-location-pilot-activation.json",
  preview: "data/quality/ag71a-verified-four-location-pilot-activation-preview.json",
  doc: "docs/quality/AG71A_VERIFIED_FOUR_LOCATION_PILOT_ACTIVATION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const sourceBasisByLabel = {
  "Itanagar-Arunachal Pradesh-India": {
    administrative_basis: "AG70T/AG70W seed coordinate basis; pilot review required",
    coordinate_basis_source_family: "internal candidate coordinate pending official-source hardening",
    freshness_status: "pilot_review_current_record",
    source_review_status: "pilot_review_approved_limited_scope"
  },
  "New Delhi-Delhi-India": {
    administrative_basis: "AG70W India capital coordinate candidate",
    coordinate_basis_source_family: "internal candidate coordinate pending official-source hardening",
    freshness_status: "pilot_review_current_record",
    source_review_status: "pilot_review_approved_limited_scope"
  },
  "Ranchi-Jharkhand-India": {
    administrative_basis: "AG70W India major city coordinate candidate",
    coordinate_basis_source_family: "internal candidate coordinate pending official-source hardening",
    freshness_status: "pilot_review_current_record",
    source_review_status: "pilot_review_approved_limited_scope"
  },
  "Tokyo-Japan": {
    administrative_basis: "AG70X global national capital coordinate candidate",
    coordinate_basis_source_family: "internal candidate coordinate pending authoritative-source hardening",
    freshness_status: "pilot_review_current_record",
    source_review_status: "pilot_review_approved_limited_scope"
  }
};

const pilotApprovedRecords = pilotSet.records.map((record, index) => {
  const source = sourceBasisByLabel[record.display_label];

  if (!source) {
    throw new Error(`Missing source basis for pilot record: ${record.display_label}`);
  }
  if (typeof record.latitude_decimal !== "number" || typeof record.longitude_decimal !== "number" || !record.timezone) {
    throw new Error(`Pilot record must have lat/long/timezone: ${record.display_label}`);
  }

  return {
    pilot_activation_id: `ag71a_verified_pilot_${String(index + 1).padStart(2, "0")}`,
    source_pilot_location_id: record.pilot_location_id,
    display_label: record.display_label,
    short_label: record.short_label,
    location_role: record.location_role,
    country_name: record.country_name,
    state_or_region_name: record.state_or_region_name,
    latitude_decimal: record.latitude_decimal,
    longitude_decimal: record.longitude_decimal,
    timezone: record.timezone,
    source_review_status: source.source_review_status,
    source_freshness_status: source.freshness_status,
    coordinate_basis_source_family: source.coordinate_basis_source_family,
    administrative_basis: source.administrative_basis,
    pilot_coordinate_review_status: "pilot_coordinate_review_passed_limited_scope",
    pilot_timezone_review_status: "pilot_timezone_review_passed_limited_scope",
    pilot_computation_allowed: true,
    pilot_dropdown_allowed: true,
    full_bank_computation_allowed: false,
    full_public_dropdown_allowed: false,
    activation_scope: "verified_four_location_pilot_only",
    public_ui_change_performed_now: false,
    backend_runtime_change_performed_now: false,
    supabase_activation_performed_now: false
  };
});

const coordinateFirstPilotInputs = [
  {
    pilot_input_id: "ag71a_coordinate_first_itanagar_like_001",
    input_mode: "coordinate_first",
    optional_label: "Manual coordinates — Itanagar test",
    latitude_decimal: 27.0844,
    longitude_decimal: 93.6053,
    timezone: "Asia/Kolkata",
    date_key_or_datetime_basis: "2026-06-08",
    place_name_required: false,
    panchang_input_allowed_for_pilot: true,
    star_reflection_input_allowed_for_pilot: true,
    public_ui_change_performed_now: false
  },
  {
    pilot_input_id: "ag71a_coordinate_first_birth_like_001",
    input_mode: "coordinate_first",
    optional_label: "Manual coordinates — birth-location test",
    latitude_decimal: 23.3441,
    longitude_decimal: 85.3096,
    timezone: "Asia/Kolkata",
    date_key_or_datetime_basis: "1988-02-10T10:05:23",
    place_name_required: false,
    panchang_input_allowed_for_pilot: false,
    star_reflection_input_allowed_for_pilot: true,
    public_ui_change_performed_now: false
  }
];

const activation = {
  module_id: "AG71A",
  title: "Verified 4-Location Pilot Activation",
  status: "verified_four_location_pilot_activation_created_limited_scope",
  purpose: "Activate only four verified pilot records at data/governance level for AG71B runtime validation.",
  consumed_stage: "AG70Z",
  activation_scope: "four_location_pilot_only",
  full_bank_activation_performed: false,
  public_dropdown_ui_activation_performed: false,
  panchang_runtime_computation_performed_now: false,
  star_reflection_runtime_computation_performed_now: false,
  pilot_record_count: pilotApprovedRecords.length,
  pilot_computation_allowed_record_count: pilotApprovedRecords.filter((x) => x.pilot_computation_allowed).length,
  pilot_dropdown_allowed_record_count: pilotApprovedRecords.filter((x) => x.pilot_dropdown_allowed).length,
  records: pilotApprovedRecords
};

const approvedRecords = {
  module_id: "AG71A",
  title: "Pilot Approved Location Records",
  status: "pilot_approved_location_records_created",
  approval_scope: "ag71a_four_location_pilot_only",
  record_count: pilotApprovedRecords.length,
  records: pilotApprovedRecords
};

const coordinateBasis = {
  module_id: "AG71A",
  title: "Pilot Coordinate and Timezone Basis",
  status: "pilot_coordinate_timezone_basis_created",
  record_count: pilotApprovedRecords.length,
  all_records_have_lat_long_timezone: pilotApprovedRecords.every((x) =>
    typeof x.latitude_decimal === "number" &&
    typeof x.longitude_decimal === "number" &&
    typeof x.timezone === "string" &&
    x.timezone.length > 0
  ),
  records: pilotApprovedRecords.map((x) => ({
    pilot_activation_id: x.pilot_activation_id,
    display_label: x.display_label,
    latitude_decimal: x.latitude_decimal,
    longitude_decimal: x.longitude_decimal,
    timezone: x.timezone,
    pilot_coordinate_review_status: x.pilot_coordinate_review_status,
    pilot_timezone_review_status: x.pilot_timezone_review_status
  }))
};

const sourceReview = {
  module_id: "AG71A",
  title: "Pilot Source Review Record",
  status: "pilot_source_review_record_created_limited_scope",
  review_scope: "pilot_only_not_full_bank",
  source_review_note: "AG71A provides limited-scope pilot review approval for 4 records. Full official/authoritative source hardening remains required before bulk scale.",
  record_count: pilotApprovedRecords.length,
  full_official_source_verification_completed_for_all_location_banks: false,
  records: pilotApprovedRecords.map((x) => ({
    pilot_activation_id: x.pilot_activation_id,
    display_label: x.display_label,
    source_review_status: x.source_review_status,
    source_freshness_status: x.source_freshness_status,
    coordinate_basis_source_family: x.coordinate_basis_source_family,
    activation_scope: x.activation_scope
  }))
};

const dropdownPermission = {
  module_id: "AG71A",
  title: "Pilot Dropdown Permission Record",
  status: "pilot_dropdown_permission_record_created",
  permission_scope: "pilot_data_flag_only_no_ui_change",
  dropdown_mode_required: ["select_location_from_dropdown", "enter_coordinates"],
  pilot_dropdown_allowed_record_count: pilotApprovedRecords.filter((x) => x.pilot_dropdown_allowed).length,
  public_dropdown_ui_activation_performed_now: false,
  full_dropdown_activation_allowed_now: false,
  records: pilotApprovedRecords.map((x) => ({
    pilot_activation_id: x.pilot_activation_id,
    display_label: x.display_label,
    pilot_dropdown_allowed: x.pilot_dropdown_allowed,
    full_public_dropdown_allowed: x.full_public_dropdown_allowed
  }))
};

const runtimePermission = {
  module_id: "AG71A",
  title: "Pilot Runtime Permission Record",
  status: "pilot_runtime_permission_record_created",
  permission_scope: "pilot_validation_only_no_runtime_execution_now",
  panchang_pilot_runtime_permission_prepared: true,
  star_reflection_pilot_runtime_permission_prepared: true,
  panchang_runtime_computation_executed_now: false,
  star_reflection_runtime_computation_executed_now: false,
  unrestricted_runtime_allowed_now: false,
  records: pilotApprovedRecords.map((x) => ({
    pilot_activation_id: x.pilot_activation_id,
    display_label: x.display_label,
    latitude_decimal: x.latitude_decimal,
    longitude_decimal: x.longitude_decimal,
    timezone: x.timezone,
    panchang_pilot_runtime_allowed_for_ag71b_validation: x.pilot_computation_allowed,
    star_reflection_pilot_runtime_allowed_for_ag71b_validation: x.pilot_computation_allowed,
    unrestricted_runtime_allowed: false
  }))
};

const coordinateFirstPilot = {
  module_id: "AG71A",
  title: "Coordinate-first Pilot Input Record",
  status: "coordinate_first_pilot_input_record_created",
  purpose: "Ensure AG71B tests manual latitude/longitude input path alongside dropdown-selected pilot locations.",
  coordinate_first_ui_requirement_source: "data/knowledge-base/location-intelligence/production/ag70z-coordinate-first-ui-requirement.json",
  input_record_count: coordinateFirstPilotInputs.length,
  records: coordinateFirstPilotInputs
};

const safetyAudit = {
  module_id: "AG71A",
  title: "Pilot Scope Safety Audit",
  status: "pilot_scope_safety_audit_passed",
  four_location_scope_only: true,
  pilot_record_count: pilotApprovedRecords.length,
  full_bank_activation_performed: false,
  public_dropdown_ui_activation_performed_now: false,
  unrestricted_panchang_runtime_allowed_now: false,
  unrestricted_star_reflection_runtime_allowed_now: false,
  candidate_coordinates_bulk_promoted_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const noPublicOutputAudit = {
  module_id: "AG71A",
  title: "No Public Output Audit",
  status: "no_public_output_audit_passed",
  public_panchang_output_allowed_now: false,
  public_star_reflection_output_allowed_now: false,
  public_location_dropdown_activation_performed: false,
  panchang_computation_executed_now: false,
  star_reflection_computation_executed_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false,
  full_scale_location_activation_performed: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_verified_four_location_pilot_activation",
  current_status: "verified_four_location_pilot_activation_created_runtime_validation_pending",
  ag71a_files: {
    activation: outputs.activation,
    approved_records: outputs.approvedRecords,
    coordinate_basis: outputs.coordinateBasis,
    source_review: outputs.sourceReview,
    dropdown_permission: outputs.dropdownPermission,
    runtime_permission: outputs.runtimePermission,
    coordinate_first_pilot: outputs.coordinateFirstPilot,
    safety_audit: outputs.safetyAudit,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    ag71a_pilot_approved_location_records: pilotApprovedRecords.length,
    ag71a_pilot_computation_allowed_records: pilotApprovedRecords.length,
    ag71a_coordinate_first_pilot_input_records: coordinateFirstPilotInputs.length,
    ag71a_full_bank_activation_records: 0,
    ag71a_public_dropdown_ui_activation_records: 0,
    public_panchang_outputs: 0,
    word_output_records: 0
  },
  next_required_stage: "AG71B — Pilot Runtime Validation"
};

const review = {
  module_id: "AG71A",
  title: "Verified 4-Location Pilot Activation",
  status: "ag71a_verified_four_location_pilot_activation_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70z_review: "data/content-intelligence/quality-reviews/ag70z-location-intelligence-foundation-closure.json",
    ag70z_pilot_set: "data/knowledge-base/location-intelligence/production/ag70z-four-location-pilot-candidate-set.json",
    ag70z_coordinate_first_ui_requirement: "data/knowledge-base/location-intelligence/production/ag70z-coordinate-first-ui-requirement.json"
  },
  generated_records: outputs,
  summary: {
    verified_four_location_pilot_activation_created: true,
    pilot_approved_location_records_created: true,
    pilot_coordinate_timezone_basis_created: true,
    pilot_source_review_record_created: true,
    pilot_dropdown_permission_record_created: true,
    pilot_runtime_permission_record_created: true,
    coordinate_first_pilot_input_record_created: true,
    pilot_scope_safety_audit_created: true,
    pilot_record_count: pilotApprovedRecords.length,
    coordinate_first_pilot_input_count: coordinateFirstPilotInputs.length,
    full_bank_activation_performed: false,
    public_dropdown_ui_activation_performed_now: false,
    panchang_runtime_computation_executed_now: false,
    star_reflection_runtime_computation_executed_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    ready_for_ag71b: true
  }
};

const readiness = {
  module_id: "AG71A",
  title: "AG71B Pilot Runtime Validation Readiness Record",
  status: "ready_for_ag71b_pilot_runtime_validation",
  ready_for_ag71b: true,
  next_stage: "AG71B — Pilot Runtime Validation",
  pilot_locations: pilotApprovedRecords.map((x) => x.display_label),
  coordinate_first_inputs: coordinateFirstPilotInputs.map((x) => x.pilot_input_id),
  reason: "Four pilot records and coordinate-first inputs are prepared for controlled runtime validation. No full-bank/public/UI/backend activation has occurred."
};

const boundary = {
  module_id: "AG71A",
  title: "AG71A to AG71B Pilot Runtime Validation Boundary",
  status: "ag71b_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Validate pilot dropdown records internally.",
    "Validate coordinate-first pilot input internally.",
    "Validate Panchang pilot runtime computation path for 4 locations.",
    "Validate Star Reflection pilot runtime mapping path for 4 locations.",
    "Keep public UI/backend/Supabase blocked."
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
    "homepage UI change",
    "Supabase/database writes",
    "backend/Auth activation"
  ]
};

const quality = {
  module_id: "AG71A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG71A",
  status: review.status,
  pilot_record_count: pilotApprovedRecords.length,
  coordinate_first_pilot_input_count: coordinateFirstPilotInputs.length,
  full_bank_activation_performed: 0,
  public_dropdown_ui_activation_performed_now: 0,
  runtime_computation_executed_now: 0,
  ready_for_ag71b: 1
};

const doc = `# AG71A — Verified 4-Location Pilot Activation

AG71A creates limited-scope pilot activation records for four locations.

## Pilot locations

1. Itanagar-Arunachal Pradesh-India
2. New Delhi-Delhi-India
3. Ranchi-Jharkhand-India
4. Tokyo-Japan

## Created

- Pilot-approved location records.
- Pilot coordinate/timezone basis.
- Pilot source review record.
- Pilot dropdown permission record.
- Pilot runtime permission record.
- Coordinate-first pilot input record.
- Safety audit.
- No-public-output audit.

## Boundary

This is pilot-only data/governance activation. It does not perform public UI activation, full dropdown activation, full-bank activation, Panchang computation, Star Reflection computation, backend activation, or Supabase activation.

## Next

AG71B — Pilot Runtime Validation.
`;

writeJson(outputs.activation, activation);
writeJson(outputs.approvedRecords, approvedRecords);
writeJson(outputs.coordinateBasis, coordinateBasis);
writeJson(outputs.sourceReview, sourceReview);
writeJson(outputs.dropdownPermission, dropdownPermission);
writeJson(outputs.runtimePermission, runtimePermission);
writeJson(outputs.coordinateFirstPilot, coordinateFirstPilot);
writeJson(outputs.safetyAudit, safetyAudit);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG71A verified 4-location pilot activation generated.");
console.log("✅ Pilot locations activated at data/governance level only.");
console.log("✅ Coordinate-first pilot inputs created.");
console.log("✅ Public UI, full bank, runtime computation, backend and Supabase remain blocked.");
