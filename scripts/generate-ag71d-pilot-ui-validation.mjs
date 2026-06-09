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

const ag71c = readJson("data/content-intelligence/quality-reviews/ag71c-pilot-ui-coordinate-input-surface.json");
const patchRecord = readJson("data/knowledge-base/location-intelligence/production/ag71c-active-index-html-coordinate-input-patch-record.json");
const panchangContract = readJson("data/knowledge-base/location-intelligence/production/ag71c-panchang-ui-coordinate-input-contract.json");
const starContract = readJson("data/knowledge-base/location-intelligence/production/ag71c-star-reflection-ui-coordinate-input-contract.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag71c.status !== "ag71c_pilot_ui_coordinate_input_surface_completed") {
  throw new Error("AG71C must be complete before AG71D.");
}
if (ag71c.summary?.ready_for_ag71d !== true) {
  throw new Error("AG71C readiness for AG71D is missing.");
}
if (patchRecord.status !== "active_index_html_coordinate_input_patch_applied") {
  throw new Error("AG71C active index.html patch must exist before AG71D.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const indexPath = "index.html";
const indexHtml = fs.readFileSync(full(indexPath), "utf8");

const outputs = {
  validation: "data/knowledge-base/location-intelligence/production/ag71d-pilot-ui-validation.json",
  activeIndexValidation: "data/knowledge-base/location-intelligence/production/ag71d-active-index-html-ui-validation.json",
  starValidation: "data/knowledge-base/location-intelligence/production/ag71d-star-reflection-coordinate-ui-validation.json",
  panchangValidation: "data/knowledge-base/location-intelligence/production/ag71d-panchang-coordinate-ui-validation.json",
  toggleValidation: "data/knowledge-base/location-intelligence/production/ag71d-coordinate-toggle-behaviour-validation.json",
  safetyAudit: "data/knowledge-base/location-intelligence/production/ag71d-ui-validation-safety-audit.json",
  noPublicOutputAudit: "data/knowledge-base/location-intelligence/production/ag71d-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag71d-pilot-ui-validation.json",
  readiness: "data/content-intelligence/quality-registry/ag71d-ag71e-pilot-runtime-output-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag71d-to-ag71e-pilot-runtime-output-test-boundary.json",
  quality: "data/quality/ag71d-pilot-ui-validation.json",
  preview: "data/quality/ag71d-pilot-ui-validation-preview.json",
  doc: "docs/quality/AG71D_PILOT_UI_VALIDATION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

function has(fragment) {
  return indexHtml.includes(fragment);
}

const requiredIndexMarkers = [
  "AG71C_STAR_COORDINATE_INPUT_SURFACE_START",
  "AG71C_PANCHANG_COORDINATE_INPUT_SURFACE_START",
  "AG71C_ACTIVE_COORDINATE_INPUT_SCRIPT_START",
  "AG71C_ACTIVE_COORDINATE_INPUT_STYLE_START"
];

const starRequiredFragments = [
  'name="ag71c-star-location-mode"',
  'value="place"',
  'value="coordinates"',
  'id="star-birth-latitude"',
  'id="star-birth-longitude"',
  'id="star-birth-timezone"',
  'id="star-birth-coordinate-label"',
  'Enter Birth Coordinates',
  'Select Birth Place'
];

const panchangRequiredFragments = [
  'name="ag71c-panchang-location-mode"',
  'value="place"',
  'value="coordinates"',
  'id="panchang-latitude"',
  'id="panchang-longitude"',
  'id="panchang-timezone"',
  'id="panchang-coordinate-label"',
  'Enter Coordinates',
  'Select Location'
];

const toggleRequiredFragments = [
  'data-ag71c-coordinate-surface',
  'data-ag71c-mode',
  'data-ag71c-coordinate-fields',
  'coordinateFields.hidden = selected.value !== "coordinates"',
  'setupAg71cCoordinateSurface'
];

const activeIndexValidation = {
  module_id: "AG71D",
  title: "Active index.html UI Validation",
  status: "active_index_html_ui_validation_passed",
  active_frontend_file: indexPath,
  required_marker_count: requiredIndexMarkers.length,
  present_marker_count: requiredIndexMarkers.filter(has).length,
  missing_markers: requiredIndexMarkers.filter((x) => !has(x)),
  active_index_html_patch_confirmed: requiredIndexMarkers.every(has)
};

const starValidation = {
  module_id: "AG71D",
  title: "Star Reflection Coordinate UI Validation",
  status: "star_reflection_coordinate_ui_validation_passed",
  source_contract: "data/knowledge-base/location-intelligence/production/ag71c-star-reflection-ui-coordinate-input-contract.json",
  required_modes: starContract.required_modes,
  required_coordinate_fields: starContract.coordinate_mode_fields,
  fragment_count: starRequiredFragments.length,
  present_fragment_count: starRequiredFragments.filter(has).length,
  missing_fragments: starRequiredFragments.filter((x) => !has(x)),
  birth_coordinate_surface_present: starRequiredFragments.every(has),
  public_personalised_output_still_disabled: has("Personal input is disabled") || has("Personalised output remains disabled")
};

const panchangValidation = {
  module_id: "AG71D",
  title: "Panchang Coordinate UI Validation",
  status: "panchang_coordinate_ui_validation_passed",
  source_contract: "data/knowledge-base/location-intelligence/production/ag71c-panchang-ui-coordinate-input-contract.json",
  required_modes: panchangContract.required_modes,
  required_coordinate_fields: panchangContract.coordinate_mode_fields,
  fragment_count: panchangRequiredFragments.length,
  present_fragment_count: panchangRequiredFragments.filter(has).length,
  missing_fragments: panchangRequiredFragments.filter((x) => !has(x)),
  coordinate_surface_present: panchangRequiredFragments.every(has),
  exact_panchang_output_still_withheld: has("Exact Panchang values remain withheld") || has("Public values remain withheld")
};

const toggleValidation = {
  module_id: "AG71D",
  title: "Coordinate Toggle Behaviour Validation",
  status: "coordinate_toggle_behaviour_validation_passed",
  validation_type: "static_dom_script_contract_validation",
  fragment_count: toggleRequiredFragments.length,
  present_fragment_count: toggleRequiredFragments.filter(has).length,
  missing_fragments: toggleRequiredFragments.filter((x) => !has(x)),
  toggle_script_present: toggleRequiredFragments.every(has),
  default_state_expected: "dropdown_selected_coordinate_fields_hidden",
  coordinate_fields_reveal_rule_expected: "select coordinates radio to reveal coordinate fields",
  browser_runtime_execution_performed_now: false
};

const allPassed =
  activeIndexValidation.active_index_html_patch_confirmed &&
  starValidation.birth_coordinate_surface_present &&
  panchangValidation.coordinate_surface_present &&
  toggleValidation.toggle_script_present;

if (!allPassed) {
  throw new Error("AG71D UI validation failed. Missing required UI fragments.");
}

const safetyAudit = {
  module_id: "AG71D",
  title: "UI Validation Safety Audit",
  status: "ui_validation_safety_audit_passed",
  active_index_html_validated: true,
  star_coordinate_surface_validated: true,
  panchang_coordinate_surface_validated: true,
  toggle_script_contract_validated: true,
  browser_runtime_execution_performed_now: false,
  full_location_bank_activation_performed: false,
  public_runtime_activation_performed: false,
  panchang_computation_executed_now: false,
  star_reflection_computation_executed_now: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const noPublicOutputAudit = {
  module_id: "AG71D",
  title: "No Public Output Audit",
  status: "no_public_output_audit_passed",
  public_panchang_output_allowed_now: false,
  public_star_reflection_output_allowed_now: false,
  full_location_bank_activation_performed: false,
  panchang_computation_executed_now: false,
  star_reflection_computation_executed_now: false,
  generated_word_json_modified: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const validation = {
  module_id: "AG71D",
  title: "Pilot UI Validation",
  status: "pilot_ui_validation_completed",
  validation_scope: "active_index_html_coordinate_input_surfaces",
  active_index_validation: outputs.activeIndexValidation,
  star_validation: outputs.starValidation,
  panchang_validation: outputs.panchangValidation,
  toggle_validation: outputs.toggleValidation,
  all_ui_contracts_passed: allPassed,
  public_runtime_activation_performed: false,
  full_location_bank_activation_performed: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_pilot_ui_validation",
  current_status: "pilot_ui_validation_completed_runtime_output_test_pending",
  ag71d_files: {
    validation: outputs.validation,
    active_index_validation: outputs.activeIndexValidation,
    star_validation: outputs.starValidation,
    panchang_validation: outputs.panchangValidation,
    toggle_validation: outputs.toggleValidation,
    safety_audit: outputs.safetyAudit,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    ag71d_active_index_validation_records: 1,
    ag71d_star_ui_validation_records: 1,
    ag71d_panchang_ui_validation_records: 1,
    ag71d_toggle_validation_records: 1,
    ag71d_browser_runtime_execution_records: 0,
    ag71d_runtime_computation_execution_records: 0,
    public_panchang_outputs: 0,
    word_output_records: 0
  },
  next_required_stage: "AG71E — Pilot Runtime Output Test"
};

const review = {
  module_id: "AG71D",
  title: "Pilot UI Validation",
  status: "ag71d_pilot_ui_validation_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag71c_review: "data/content-intelligence/quality-reviews/ag71c-pilot-ui-coordinate-input-surface.json",
    ag71c_active_patch_record: "data/knowledge-base/location-intelligence/production/ag71c-active-index-html-coordinate-input-patch-record.json"
  },
  generated_records: outputs,
  summary: {
    active_index_html_ui_validated: true,
    star_reflection_coordinate_ui_validated: true,
    panchang_coordinate_ui_validated: true,
    coordinate_toggle_contract_validated: true,
    all_ui_contracts_passed: true,
    browser_runtime_execution_performed_now: false,
    public_runtime_activation_performed: false,
    full_location_bank_activation_performed: false,
    panchang_computation_executed_now: false,
    star_reflection_computation_executed_now: false,
    generated_word_json_modified: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    ready_for_ag71e: true
  }
};

const readiness = {
  module_id: "AG71D",
  title: "AG71E Pilot Runtime Output Test Readiness Record",
  status: "ready_for_ag71e_pilot_runtime_output_test",
  ready_for_ag71e: true,
  next_stage: "AG71E — Pilot Runtime Output Test",
  reason: "Active index.html coordinate UI surfaces are structurally validated. Next stage may internally test pilot runtime outputs while keeping public/backend/Supabase blocked."
};

const boundary = {
  module_id: "AG71D",
  title: "AG71D to AG71E Pilot Runtime Output Test Boundary",
  status: "ag71e_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Run internal pilot Panchang output test for the 4 pilot locations.",
    "Run internal Star Reflection mapping/output-safety test for pilot inputs.",
    "Validate output remains withheld or internal-only.",
    "Record pilot result quality before approval closure."
  ],
  blocked_scope_without_explicit_approval: [
    "public Panchang output",
    "public Star Reflection output",
    "full location-bank activation",
    "public full dropdown activation",
    "unrestricted Panchang runtime computation",
    "unrestricted Star Reflection runtime computation",
    "Supabase/database writes",
    "backend/Auth activation"
  ]
};

const quality = {
  module_id: "AG71D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG71D",
  status: review.status,
  active_index_html_ui_validated: 1,
  star_reflection_coordinate_ui_validated: 1,
  panchang_coordinate_ui_validated: 1,
  coordinate_toggle_contract_validated: 1,
  browser_runtime_execution_performed_now: 0,
  runtime_computation_executed_now: 0,
  ready_for_ag71e: 1
};

const doc = `# AG71D — Pilot UI Validation

AG71D validates the active index.html coordinate-input UI added in AG71C.

## Validated

- Active index.html patch markers.
- Star Reflection birth-coordinate input surface.
- Panchang coordinate input surface.
- Coordinate toggle script/static DOM contract.

## Boundary

No browser execution, no public runtime activation, no Panchang computation, no Star Reflection computation, no backend activation and no Supabase activation were performed.

## Next

AG71E — Pilot Runtime Output Test.
`;

writeJson(outputs.validation, validation);
writeJson(outputs.activeIndexValidation, activeIndexValidation);
writeJson(outputs.starValidation, starValidation);
writeJson(outputs.panchangValidation, panchangValidation);
writeJson(outputs.toggleValidation, toggleValidation);
writeJson(outputs.safetyAudit, safetyAudit);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG71D pilot UI validation generated.");
console.log("✅ Active index.html coordinate surfaces validated.");
console.log("✅ Star Reflection and Panchang coordinate UI contracts passed.");
console.log("✅ No public/backend/Supabase/runtime activation performed.");
