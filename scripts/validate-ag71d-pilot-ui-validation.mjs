import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71D validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "scripts/generate-ag71d-pilot-ui-validation.mjs",
  "scripts/validate-ag71d-pilot-ui-validation.mjs",
  "data/knowledge-base/location-intelligence/production/ag71d-pilot-ui-validation.json",
  "data/knowledge-base/location-intelligence/production/ag71d-active-index-html-ui-validation.json",
  "data/knowledge-base/location-intelligence/production/ag71d-star-reflection-coordinate-ui-validation.json",
  "data/knowledge-base/location-intelligence/production/ag71d-panchang-coordinate-ui-validation.json",
  "data/knowledge-base/location-intelligence/production/ag71d-coordinate-toggle-behaviour-validation.json",
  "data/knowledge-base/location-intelligence/production/ag71d-ui-validation-safety-audit.json",
  "data/knowledge-base/location-intelligence/production/ag71d-place-selection-ui-correction-record.json",
  "data/knowledge-base/location-intelligence/production/ag71d-star-mode-interaction-fix-record.json",
  "data/knowledge-base/location-intelligence/production/ag71d-final-ui-correction-record.json",
  "data/knowledge-base/location-intelligence/production/ag71d-ui-finishing-correction-record.json",
  "data/knowledge-base/location-intelligence/production/ag71d-coordinate-toggle-visibility-fix-record.json",
  "data/knowledge-base/location-intelligence/production/ag71d-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag71d-pilot-ui-validation.json",
  "data/content-intelligence/quality-registry/ag71d-ag71e-pilot-runtime-output-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag71d-to-ag71e-pilot-runtime-output-test-boundary.json",
  "data/quality/ag71d-pilot-ui-validation.json",
  "data/quality/ag71d-pilot-ui-validation-preview.json",
  "docs/quality/AG71D_PILOT_UI_VALIDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag71d"]) fail("Missing generate:ag71d script.");
if (!pkg.scripts?.["validate:ag71d"]) fail("Missing validate:ag71d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag71d")) fail("validate:project must include validate:ag71d.");

const indexHtml = fs.readFileSync(full("index.html"), "utf8");
for (const marker of [
  "AG71C_STAR_COORDINATE_INPUT_SURFACE_START",
  "AG71C_PANCHANG_COORDINATE_INPUT_SURFACE_START",
  "AG71C_ACTIVE_COORDINATE_INPUT_SCRIPT_START",
  "AG71C_ACTIVE_COORDINATE_INPUT_STYLE_START",
  "id=\"star-birth-latitude\"",
  "id=\"star-birth-longitude\"",
  "id=\"star-birth-timezone\"",
  "id=\"panchang-latitude\"",
  "id=\"panchang-longitude\"",
  "id=\"panchang-timezone\""
]) {
  if (!indexHtml.includes(marker)) fail(`index.html missing marker/field: ${marker}`);
}

for (const marker of [
  "AG71D_FINAL_COORDINATE_UI_STYLE_START",
  "AG71D_FINAL_COORDINATE_TOGGLE_FIX_START",
  "data-ag71d-mode",
  "id=\"star-birth-latitude\"",
  "id=\"star-birth-longitude\"",
  "id=\"star-birth-timezone\"",
  "id=\"star-birth-coordinate-label\"",
  "Reflection Locked Pending Review"
]) {
  if (!indexHtml.includes(marker)) fail(`index.html missing AG71D final UI correction marker: ${marker}`);
}

const finalCorrection = readJson("data/knowledge-base/location-intelligence/production/ag71d-final-ui-correction-record.json");
if (finalCorrection.status !== "final_ui_correction_applied") fail("Final UI correction record status mismatch.");
if (finalCorrection.active_frontend_file !== "index.html") fail("Final UI correction must target active index.html.");


for (const marker of [
  "AG71D_UI_FINISHING_CORRECTION_START",
  "AG71D_UI_FINISHING_TOGGLE_FIX_START",
  "data-ag71c-selected-mode",
  "id=\"star-birth-latitude\"",
  "id=\"star-birth-longitude\"",
  "id=\"star-birth-timezone\"",
  "id=\"panchang-latitude\"",
  "id=\"panchang-longitude\"",
  "id=\"panchang-timezone\"",
  "Reflection Locked Pending Review"
]) {
  if (!indexHtml.includes(marker)) fail(`index.html missing AG71D finishing correction marker: ${marker}`);
}

const finishingCorrection = readJson("data/knowledge-base/location-intelligence/production/ag71d-ui-finishing-correction-record.json");
if (finishingCorrection.status !== "ui_finishing_correction_applied") fail("UI finishing correction record status mismatch.");
if (finishingCorrection.active_frontend_file !== "index.html") fail("UI finishing correction must target active index.html.");


for (const marker of [
  "AG71D_COORDINATE_TOGGLE_VISIBILITY_FIX_START",
  "AG71D_COORDINATE_TOGGLE_RUNTIME_FIX_START",
  ".ag71c-coordinate-surface:has(input[data-ag71c-mode][value=\"coordinates\"]:checked)",
  "fields.removeAttribute(\"hidden\")",
  "fields.style.display = \"grid\""
]) {
  if (!indexHtml.includes(marker)) fail(`index.html missing AG71D visibility fix marker: ${marker}`);
}

const visibilityFix = readJson("data/knowledge-base/location-intelligence/production/ag71d-coordinate-toggle-visibility-fix-record.json");
if (visibilityFix.status !== "coordinate_toggle_visibility_fix_applied") fail("Coordinate toggle visibility fix record status mismatch.");
if (visibilityFix.active_frontend_file !== "index.html") fail("Visibility fix must target active index.html.");



for (const marker of [
  "AG71D_STAR_MODE_INTERACTION_FIX_STYLE_START",
  "AG71D_STAR_MODE_INTERACTION_FIX_SCRIPT_START",
  "function setSurfaceMode(surface, mode)",
  "window.drishvaraSyncAg71dCoordinateModes",
  "id=\"star-birth-latitude\"",
  "id=\"star-birth-longitude\"",
  "id=\"star-birth-timezone\"",
  "id=\"star-birth-coordinate-label\""
]) {
  if (!indexHtml.includes(marker)) fail(`index.html missing Star mode interaction fix marker: ${marker}`);
}

const starModeFix = readJson("data/knowledge-base/location-intelligence/production/ag71d-star-mode-interaction-fix-record.json");
if (starModeFix.status !== "star_reflection_mode_interaction_fix_applied") fail("Star mode interaction fix record status mismatch.");
if (starModeFix.active_frontend_file !== "index.html") fail("Star mode interaction fix must target active index.html.");


for (const marker of [
  "AG71D_STAR_BIRTH_PLACE_SELECT_START",
  "AG71D_PANCHANG_LOCATION_SELECT_START",
  "AG71D_PLACE_SELECTION_UI_CORRECTION_START",
  "AG71D_PLACE_SELECTION_TOGGLE_FIX_START",
  "id=\"star-birth-place-select\"",
  "data-ag71d-location-select=\"star-reflection\"",
  "id=\"panchang-place-select\"",
  "data-ag71d-location-select=\"panchang\"",
  "window.drishvaraAg71dSetCoordinateMode"
]) {
  if (!indexHtml.includes(marker)) fail(`index.html missing place-selection correction marker: ${marker}`);
}

const placeSelectionCorrection = readJson("data/knowledge-base/location-intelligence/production/ag71d-place-selection-ui-correction-record.json");
if (placeSelectionCorrection.status !== "place_selection_ui_correction_applied") fail("Place selection UI correction status mismatch.");
if (placeSelectionCorrection.active_frontend_file !== "index.html") fail("Place selection correction must target active index.html.");

const starBlockStart = indexHtml.indexOf("Star Reflection");
const panchangBlockStart = indexHtml.indexOf("Panchang & Festival View", starBlockStart);
if (starBlockStart >= 0 && panchangBlockStart > starBlockStart) {
  const starBlock = indexHtml.slice(starBlockStart, panchangBlockStart);
  if (/<select[\s\S]*Reflection Method Under Review[\s\S]*<\/select>/i.test(starBlock)) {
    fail("Star Reflection must not use Reflection Method dropdown as location selector.");
  }
}

const validation = readJson("data/knowledge-base/location-intelligence/production/ag71d-pilot-ui-validation.json");
if (validation.status !== "pilot_ui_validation_completed") fail("Validation status mismatch.");
if (validation.all_ui_contracts_passed !== true) fail("All UI contracts must pass.");
if (validation.public_runtime_activation_performed !== false) fail("Public runtime activation must be false.");
if (validation.full_location_bank_activation_performed !== false) fail("Full location bank activation must be false.");

const active = readJson("data/knowledge-base/location-intelligence/production/ag71d-active-index-html-ui-validation.json");
if (active.status !== "active_index_html_ui_validation_passed") fail("Active index validation status mismatch.");
if (active.active_index_html_patch_confirmed !== true) fail("Active index patch must be confirmed.");
if (active.missing_markers.length !== 0) fail("Active index missing markers must be zero.");

const star = readJson("data/knowledge-base/location-intelligence/production/ag71d-star-reflection-coordinate-ui-validation.json");
if (star.status !== "star_reflection_coordinate_ui_validation_passed") fail("Star validation status mismatch.");
if (star.birth_coordinate_surface_present !== true) fail("Star coordinate surface must be present.");
if (star.missing_fragments.length !== 0) fail("Star missing fragments must be zero.");

const panchang = readJson("data/knowledge-base/location-intelligence/production/ag71d-panchang-coordinate-ui-validation.json");
if (panchang.status !== "panchang_coordinate_ui_validation_passed") fail("Panchang validation status mismatch.");
if (panchang.coordinate_surface_present !== true) fail("Panchang coordinate surface must be present.");
if (panchang.missing_fragments.length !== 0) fail("Panchang missing fragments must be zero.");

const toggle = readJson("data/knowledge-base/location-intelligence/production/ag71d-coordinate-toggle-behaviour-validation.json");
if (toggle.status !== "coordinate_toggle_behaviour_validation_passed") fail("Toggle validation status mismatch.");
if (toggle.toggle_script_present !== true) fail("Toggle script must be present.");
if (toggle.browser_runtime_execution_performed_now !== false) fail("Browser execution must be false.");

const safety = readJson("data/knowledge-base/location-intelligence/production/ag71d-ui-validation-safety-audit.json");
if (safety.status !== "ui_validation_safety_audit_passed") fail("Safety status mismatch.");
for (const key of [
  "browser_runtime_execution_performed_now",
  "full_location_bank_activation_performed",
  "public_runtime_activation_performed",
  "panchang_computation_executed_now",
  "star_reflection_computation_executed_now",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (safety[key] !== false) fail(`${key} must be false.`);
}

const noPublic = readJson("data/knowledge-base/location-intelligence/production/ag71d-no-public-output-audit.json");
if (noPublic.status !== "no_public_output_audit_passed") fail("No-public audit status mismatch.");
for (const key of [
  "public_panchang_output_allowed_now",
  "public_star_reflection_output_allowed_now",
  "full_location_bank_activation_performed",
  "panchang_computation_executed_now",
  "star_reflection_computation_executed_now",
  "generated_word_json_modified",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (noPublic[key] !== false) fail(`${key} must be false.`);
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
if (manifest.status !== "production_bank_manifest_created_pilot_ui_validation") fail("Panchang manifest status mismatch.");
if (manifest.current_counts.ag71d_active_index_validation_records !== 1) fail("Active index validation count must be 1.");
if (manifest.current_counts.ag71d_star_ui_validation_records !== 1) fail("Star UI validation count must be 1.");
if (manifest.current_counts.ag71d_panchang_ui_validation_records !== 1) fail("Panchang UI validation count must be 1.");
if (manifest.current_counts.ag71d_browser_runtime_execution_records !== 0) fail("Browser runtime execution records must be zero.");
if (manifest.current_counts.ag71d_runtime_computation_execution_records !== 0) fail("Runtime computation execution records must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag71d-pilot-ui-validation.json");
if (review.status !== "ag71d_pilot_ui_validation_completed") fail("Review status mismatch.");
for (const key of [
  "active_index_html_ui_validated",
  "star_reflection_coordinate_ui_validated",
  "panchang_coordinate_ui_validated",
  "coordinate_toggle_contract_validated",
  "coordinate_toggle_visibility_fix_applied",
  "coordinate_fields_reveal_on_coordinates_selection",
  "ui_finishing_correction_applied",
  "star_coordinate_fields_reveal_on_selection",
  "reflection_duplicate_action_label_corrected",
  "final_ui_correction_applied",
  "star_coordinate_reveal_corrected",
  "coordinate_ui_final_finishing_applied",
  "duplicate_reflection_method_control_removed",
  "star_mode_interaction_fix_applied",
  "star_birth_coordinates_selectable",
  "star_birth_coordinate_fields_reveal_path_hardened",
  "place_selection_ui_correction_applied",
  "star_birth_place_dropdown_added",
  "panchang_location_dropdown_integrated_with_radio_mode",
  "reflection_method_dropdown_deferred",
  "all_ui_contracts_passed",
  "ready_for_ag71e"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "browser_runtime_execution_performed_now",
  "public_runtime_activation_performed",
  "full_location_bank_activation_performed",
  "panchang_computation_executed_now",
  "star_reflection_computation_executed_now",
  "generated_word_json_modified",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag71d-ag71e-pilot-runtime-output-test-readiness-record.json");
if (readiness.ready_for_ag71e !== true) fail("AG71E readiness must be true.");

pass("AG71D pilot UI validation is valid.");
pass("Active index.html coordinate UI surfaces are structurally validated.");
pass("No public/runtime/backend/Supabase activation performed.");
