import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71C validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag71c-pilot-ui-coordinate-input-surface.mjs",
  "scripts/validate-ag71c-pilot-ui-coordinate-input-surface.mjs",
  "data/knowledge-base/location-intelligence/production/ag71c-pilot-ui-coordinate-input-surface.json",
  "data/knowledge-base/location-intelligence/production/ag71c-panchang-ui-coordinate-input-contract.json",
  "data/knowledge-base/location-intelligence/production/ag71c-star-reflection-ui-coordinate-input-contract.json",
  "data/knowledge-base/location-intelligence/production/ag71c-frontend-target-discovery-report.json",
  "data/knowledge-base/location-intelligence/production/ag71c-ui-implementation-record.json",
  "data/knowledge-base/location-intelligence/production/ag71c-ui-scope-safety-audit.json",
  "data/knowledge-base/location-intelligence/production/ag71c-active-index-html-coordinate-input-patch-record.json",
  "data/knowledge-base/location-intelligence/production/ag71c-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag71c-pilot-ui-coordinate-input-surface.json",
  "data/content-intelligence/quality-registry/ag71c-ag71d-pilot-ui-validation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag71c-to-ag71d-pilot-ui-validation-boundary.json",
  "data/quality/ag71c-pilot-ui-coordinate-input-surface.json",
  "data/quality/ag71c-pilot-ui-coordinate-input-surface-preview.json",
  "docs/quality/AG71C_PILOT_UI_COORDINATE_INPUT_SURFACE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag71c"]) fail("Missing generate:ag71c script.");
if (!pkg.scripts?.["validate:ag71c"]) fail("Missing validate:ag71c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag71c")) fail("validate:project must include validate:ag71c.");

const surface = readJson("data/knowledge-base/location-intelligence/production/ag71c-pilot-ui-coordinate-input-surface.json");
if (surface.status !== "pilot_ui_coordinate_input_surface_created") fail("Surface status mismatch.");
if (surface.public_runtime_activation_performed !== false) fail("Public runtime activation must be false.");
if (surface.full_location_bank_activation_performed !== false) fail("Full bank activation must be false.");

const panchang = readJson("data/knowledge-base/location-intelligence/production/ag71c-panchang-ui-coordinate-input-contract.json");
if (panchang.status !== "panchang_ui_coordinate_input_contract_created") fail("Panchang contract status mismatch.");
if (!panchang.required_modes.includes("select_location_from_dropdown")) fail("Panchang dropdown mode missing.");
if (!panchang.required_modes.includes("enter_coordinates")) fail("Panchang enter coordinates mode missing.");
for (const field of ["latitude_decimal", "longitude_decimal", "timezone", "optional_location_label"]) {
  if (!panchang.coordinate_mode_fields.includes(field)) fail(`Panchang coordinate field missing: ${field}`);
}
if (panchang.full_location_bank_allowed_now !== false) fail("Panchang full bank must be false.");

const star = readJson("data/knowledge-base/location-intelligence/production/ag71c-star-reflection-ui-coordinate-input-contract.json");
if (star.status !== "star_reflection_ui_coordinate_input_contract_created") fail("Star contract status mismatch.");
if (!star.required_modes.includes("select_birth_place_from_dropdown")) fail("Star birth place dropdown mode missing.");
if (!star.required_modes.includes("enter_birth_coordinates")) fail("Star birth coordinates mode missing.");
for (const field of ["birth_latitude_decimal", "birth_longitude_decimal", "birth_timezone", "optional_birth_place_label"]) {
  if (!star.coordinate_mode_fields.includes(field)) fail(`Star coordinate field missing: ${field}`);
}
if (star.birth_time_basis_required_before_computation !== true) fail("Birth time basis rule missing.");

const discovery = readJson("data/knowledge-base/location-intelligence/production/ag71c-frontend-target-discovery-report.json");
if (discovery.status !== "frontend_target_discovery_completed") fail("Discovery status mismatch.");
if (!Array.isArray(discovery.candidates)) fail("Discovery candidates must be an array.");
if (!["frontend_static_html_patch_applied", "frontend_static_html_patch_already_present_or_not_needed", "frontend_patch_not_applied_no_safe_static_target_found", "active_index_html_patch_applied"].includes(discovery.patch_status)) fail("Unexpected patch status.");
if (discovery.patch_status !== "active_index_html_patch_applied") fail("AG71C must patch active index.html, not archive backups.");
if (!Array.isArray(discovery.patched_files) || !discovery.patched_files.includes("index.html")) fail("AG71C patched_files must include active index.html.");
if (discovery.patched_files.some((file) => file.includes("_local_archive") || file.includes("archive/"))) fail("AG71C must not patch archive backup files.");

const indexHtmlText = fs.readFileSync(full("index.html"), "utf8");
if (!indexHtmlText.includes("AG71C_STAR_COORDINATE_INPUT_SURFACE_START")) fail("index.html missing Star coordinate input surface.");
if (!indexHtmlText.includes("AG71C_PANCHANG_COORDINATE_INPUT_SURFACE_START")) fail("index.html missing Panchang coordinate input surface.");
if (!indexHtmlText.includes("AG71C_ACTIVE_COORDINATE_INPUT_SCRIPT_START")) fail("index.html missing AG71C coordinate input script.");
if (!indexHtmlText.includes("AG71C_ACTIVE_COORDINATE_INPUT_STYLE_START")) fail("index.html missing AG71C coordinate input style.");

const activePatch = readJson("data/knowledge-base/location-intelligence/production/ag71c-active-index-html-coordinate-input-patch-record.json");
if (activePatch.status !== "active_index_html_coordinate_input_patch_applied") fail("Active index.html patch record status mismatch.");
if (activePatch.active_frontend_file !== "index.html") fail("Active frontend file must be index.html.");


const impl = readJson("data/knowledge-base/location-intelligence/production/ag71c-ui-implementation-record.json");
if (impl.title !== "UI Implementation Record") fail("Implementation record title mismatch.");
if (impl.public_runtime_activation_performed !== false) fail("Public runtime activation must be false.");
if (impl.backend_runtime_activated !== false) fail("Backend runtime activation must be false.");
if (impl.supabase_activation_performed !== false) fail("Supabase activation must be false.");

const safety = readJson("data/knowledge-base/location-intelligence/production/ag71c-ui-scope-safety-audit.json");
if (safety.status !== "ui_scope_safety_audit_passed") fail("Safety audit status mismatch.");
for (const key of [
  "full_location_bank_activation_performed",
  "public_runtime_activation_performed",
  "unrestricted_panchang_runtime_allowed_now",
  "unrestricted_star_reflection_runtime_allowed_now",
  "generated_word_json_modified",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (safety[key] !== false) fail(`${key} must be false.`);
}

const noPublic = readJson("data/knowledge-base/location-intelligence/production/ag71c-no-public-output-audit.json");
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
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_pilot_ui_coordinate_input_surface",
  "production_bank_manifest_created_pilot_ui_validation"
];
if (!allowedPanchangManifestStatuses.includes(manifest.status)) fail("Panchang manifest status mismatch.");
if (manifest.current_counts.ag71c_ui_contract_records !== 2) fail("UI contract count must be 2.");
if (manifest.current_counts.ag71c_frontend_patched_files !== 1) fail("AG71C frontend patched file count must be 1.");
if (manifest.current_counts.ag71c_active_index_html_patch_records !== 1) fail("AG71C active index patch record count must be 1.");
if (manifest.current_counts.ag71c_full_location_bank_activation_records !== 0) fail("Full bank activation count must be zero.");
if (manifest.current_counts.ag71c_runtime_computation_execution_records !== 0) fail("Runtime computation count must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag71c-pilot-ui-coordinate-input-surface.json");
if (review.status !== "ag71c_pilot_ui_coordinate_input_surface_completed") fail("Review status mismatch.");
for (const key of [
  "pilot_ui_coordinate_input_surface_created",
  "panchang_ui_coordinate_contract_created",
  "star_reflection_ui_coordinate_contract_created",
  "frontend_discovery_completed",
  "ready_for_ag71d"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
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

const readiness = readJson("data/content-intelligence/quality-registry/ag71c-ag71d-pilot-ui-validation-readiness-record.json");
if (readiness.ready_for_ag71d !== true) fail("AG71D readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag71c-to-ag71d-pilot-ui-validation-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG71D boundary must not auto-start.");
if (!boundary.allowed_next_scope_after_user_confirmation.some((x) => x.includes("latitude"))) fail("AG71D boundary must include latitude validation.");
if (!boundary.allowed_next_scope_after_user_confirmation.some((x) => x.includes("longitude"))) fail("AG71D boundary must include longitude validation.");

pass("AG71C pilot UI coordinate input surface is valid.");
pass("Panchang and Star Reflection coordinate input contracts are present.");
pass("No backend/Supabase/runtime/full-bank activation performed.");
