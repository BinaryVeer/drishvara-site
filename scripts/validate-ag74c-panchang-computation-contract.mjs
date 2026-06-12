import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error("❌ AG74C validation failed: " + message);
  process.exit(1);
}
function pass(message) { console.log("✅ " + message); }

const required = [
  "data/knowledge-base/panchang-festival/production/ag74c-panchang-computation-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74c-panchang-output-field-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74c-panchang-expanded-location-schema.json",
  "data/knowledge-base/panchang-festival/production/ag74c-panchang-validation-sample-contract.json",
  "data/content-intelligence/mutation-plans/ag74c-to-ag74d-panchang-static-engine-boundary.json",
  "data/content-intelligence/quality-registry/ag74c-ag74d-panchang-static-engine-readiness-record.json",
  "data/content-intelligence/quality-reviews/ag74c-panchang-computation-contract.json",
  "data/quality/ag74c-panchang-computation-contract.json",
  "data/quality/ag74c-panchang-computation-contract-preview.json",
  "docs/quality/AG74C_PANCHANG_COMPUTATION_CONTRACT.md",
  "data/content-intelligence/quality-registry/ag74b-ag74c-panchang-computation-contract-readiness-record.json",
  "data/knowledge-base/panchang-festival/production/ag74b-panchang-calculation-doctrine.json",
  "data/knowledge-base/panchang-festival/production/ag74b-panchang-expansion-safety-boundary.json",
  "scripts/validate-ag74b-panchang-expansion-scope-and-calculation-doctrine.mjs"
];

for (const file of required) {
  if (!exists(file)) fail("Missing required file: " + file);
}

const ag74bReady = readJson("data/content-intelligence/quality-registry/ag74b-ag74c-panchang-computation-contract-readiness-record.json");
if (ag74bReady.status !== "ready_for_ag74c_panchang_computation_contract") fail("AG74B readiness status mismatch.");

const contract = readJson("data/knowledge-base/panchang-festival/production/ag74c-panchang-computation-contract.json");
if (contract.status !== "ag74c_panchang_computation_contract_locked_ag74d_ready") fail("AG74C computation contract status mismatch.");
if (contract.computation_mode.backend_runtime_required !== false) fail("Backend runtime must remain false.");
if (contract.computation_mode.supabase_required !== false) fail("Supabase must remain false.");
if (contract.computation_mode.user_profile_storage_required !== false) fail("User profile storage must remain false.");

for (const field of ["local_date_key", "location_id", "timezone", "coordinates"]) {
  if (!contract.canonical_inputs[field]) fail("Missing canonical input: " + field);
}

for (const step of ["julian_day_conversion", "solar_longitude", "lunar_longitude", "tithi_index", "paksha", "nakshatra", "yoga", "karana", "sunrise_sunset_basis"]) {
  if (!contract.required_calculation_steps.some((item) => item.step_id === step)) {
    fail("Missing calculation step: " + step);
  }
}

const fields = readJson("data/knowledge-base/panchang-festival/production/ag74c-panchang-output-field-contract.json");
if (fields.status !== "ag74c_output_field_contract_locked") fail("Output field contract status mismatch.");
const requiredFields = fields.required_output_fields.map((item) => item.field);
for (const field of ["tithi", "tithi_index", "paksha", "nakshatra", "yoga", "karana", "calculation_status", "regional_method_note"]) {
  if (!requiredFields.includes(field)) fail("Missing output field: " + field);
}
for (const forbidden of ["user_name", "stored_birth_details", "deterministic_prediction", "final_religious_authority_claim"]) {
  if (!fields.forbidden_output_fields.includes(forbidden)) fail("Missing forbidden output field: " + forbidden);
}

const location = readJson("data/knowledge-base/panchang-festival/production/ag74c-panchang-expanded-location-schema.json");
if (location.status !== "ag74c_expanded_location_schema_locked") fail("Location schema status mismatch.");
if ((location.required_initial_locations_for_ag74d || []).length < 10) fail("AG74D initial location list is too small.");
if (location.free_coordinate_entry_policy.allowed_in_ag74d !== false) fail("Free coordinate entry must remain disabled for AG74D.");

const validation = readJson("data/knowledge-base/panchang-festival/production/ag74c-panchang-validation-sample-contract.json");
if (validation.status !== "ag74c_validation_sample_contract_locked") fail("Validation sample contract status mismatch.");
if (validation.validation_sample_requirements_for_ag74d.minimum_locations < 4) fail("Minimum validation locations too low.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag74c-to-ag74d-panchang-static-engine-boundary.json");
if (boundary.to_module !== "AG74D") fail("AG74D boundary target mismatch.");

const readiness = readJson("data/content-intelligence/quality-registry/ag74c-ag74d-panchang-static-engine-readiness-record.json");
if (readiness.status !== "ready_for_ag74d_panchang_static_engine_preparation") fail("AG74D readiness status mismatch.");
if (readiness.readiness_checks.backend_runtime_activated !== false) fail("Backend runtime was activated.");
if (readiness.readiness_checks.supabase_activation_performed !== false) fail("Supabase was activated.");
if (readiness.readiness_checks.personal_data_storage_enabled !== false) fail("Personal data storage was enabled.");

const quality = readJson("data/quality/ag74c-panchang-computation-contract.json");
if (quality.status !== "ag74c_completed") fail("AG74C quality status mismatch.");
if (quality.issue_count !== 0) fail("AG74C issue count must be zero.");

pass("AG74C Panchang computation contract is valid.");
pass("AG74D Panchang static engine preparation is ready.");
pass("No backend, Supabase, storage, live API dependency or production authority claim is enabled.");
