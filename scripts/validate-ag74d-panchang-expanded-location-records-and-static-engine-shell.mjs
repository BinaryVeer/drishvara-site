import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error("❌ AG74D validation failed: " + message);
  process.exit(1);
}
function pass(message) { console.log("✅ " + message); }

const required = [
  "data/knowledge-base/panchang-festival/production/ag74d-panchang-expanded-location-records.json",
  "generated/panchang-expanded-location-records.json",
  "data/knowledge-base/panchang-festival/production/ag74d-panchang-static-engine-shell.json",
  "data/knowledge-base/panchang-festival/production/ag74d-panchang-static-engine-field-map.json",
  "data/knowledge-base/panchang-festival/production/ag74d-panchang-unsupported-input-fallback-contract.json",
  "data/content-intelligence/mutation-plans/ag74d-to-ag74e-panchang-validation-sample-boundary.json",
  "data/content-intelligence/quality-registry/ag74d-ag74e-panchang-validation-sample-readiness-record.json",
  "data/content-intelligence/quality-reviews/ag74d-panchang-expanded-location-records-and-static-engine-shell.json",
  "data/quality/ag74d-panchang-expanded-location-records-and-static-engine-shell.json",
  "data/quality/ag74d-panchang-expanded-location-records-and-static-engine-shell-preview.json",
  "docs/quality/AG74D_PANCHANG_EXPANDED_LOCATION_RECORDS_AND_STATIC_ENGINE_SHELL.md",
  "data/content-intelligence/quality-registry/ag74c-ag74d-panchang-static-engine-readiness-record.json",
  "scripts/validate-ag74c-panchang-computation-contract.mjs"
];

for (const file of required) {
  if (!exists(file)) fail("Missing required file: " + file);
}

const ag74cReady = readJson("data/content-intelligence/quality-registry/ag74c-ag74d-panchang-static-engine-readiness-record.json");
if (ag74cReady.status !== "ready_for_ag74d_panchang_static_engine_preparation") fail("AG74C readiness status mismatch.");

const locations = readJson("data/knowledge-base/panchang-festival/production/ag74d-panchang-expanded-location-records.json");
if (locations.status !== "ag74d_expanded_location_records_locked") fail("Expanded location status mismatch.");
if (locations.location_count !== 14) fail('Expanded location count must be 14.');
if ((locations.records || []).length !== 14) fail('Expanded location records length must be 14.');
if (locations.free_coordinate_entry_enabled !== false) fail('Free coordinate entry must remain disabled.');

const requiredLocationIds = ["itanagar_in", "new_delhi_in", "ranchi_in", "guwahati_in", "kolkata_in", "mumbai_in", "chennai_in", "bengaluru_in", "varanasi_in", "ujjain_in", "tokyo_jp", "london_gb", "new_york_us", "sydney_au"];
for (const id of requiredLocationIds) {
  const record = locations.records.find((item) => item.location_id === id);
  if (!record) fail('Missing expanded location id: ' + id);
  if (typeof record.latitude !== 'number') fail('Latitude must be numeric for ' + id);
  if (typeof record.longitude !== 'number') fail('Longitude must be numeric for ' + id);
  if (!record.timezone || !record.timezone.includes('/')) fail('Timezone must be IANA-like for ' + id);
  if (record.enabled_for_ag74d_static_engine !== true) fail('Location must be enabled for AG74D static engine: ' + id);
}

const generated = readJson("generated/panchang-expanded-location-records.json");
if (generated.status !== "generated_static_location_records_ready") fail("Generated location status mismatch.");
if ((generated.records || []).length !== 14) fail('Generated location records length must be 14.');

const engine = readJson("data/knowledge-base/panchang-festival/production/ag74d-panchang-static-engine-shell.json");
if (engine.status !== "ag74d_static_engine_shell_locked_ag74e_ready") fail("Static engine shell status mismatch.");
if (engine.permitted_runtime.backend_runtime !== false) fail('Backend runtime must remain false.');
if (engine.permitted_runtime.external_ephemeris_api !== false) fail('External ephemeris API must remain false.');
if (engine.permitted_runtime.supabase !== false) fail('Supabase must remain false.');
if (engine.permitted_runtime.personal_data_storage !== false) fail('Personal data storage must remain false.');
if ((engine.exported_engine_steps_for_ag74e || []).length < 10) fail('Engine shell exported steps are incomplete.');

const fieldMap = readJson("data/knowledge-base/panchang-festival/production/ag74d-panchang-static-engine-field-map.json");
if (fieldMap.status !== "ag74d_static_engine_field_map_locked") fail("Field map status mismatch.");
for (const field of ["tithi", "tithi_index", "paksha", "nakshatra", "yoga", "karana", "calculation_status", "regional_method_note"]) {
  if (!fieldMap.field_map[field]) fail('Missing field map for ' + field);
}

const fallback = readJson("data/knowledge-base/panchang-festival/production/ag74d-panchang-unsupported-input-fallback-contract.json");
if (fallback.status !== "ag74d_unsupported_input_fallback_locked") fail("Fallback status mismatch.");
if (fallback.storage_policy.user_input_storage_enabled !== false) fail('User input storage must remain false.');
if (fallback.storage_policy.coordinate_storage_from_free_text_enabled !== false) fail('Free text coordinate storage must remain false.');

const readiness = readJson("data/content-intelligence/quality-registry/ag74d-ag74e-panchang-validation-sample-readiness-record.json");
if (readiness.status !== "ready_for_ag74e_panchang_validation_sample_bank") fail("AG74E readiness status mismatch.");
if (readiness.readiness_checks.backend_runtime_activated !== false) fail('Backend runtime was activated.');
if (readiness.readiness_checks.supabase_activation_performed !== false) fail('Supabase was activated.');
if (readiness.readiness_checks.personal_data_storage_enabled !== false) fail('Personal data storage was enabled.');

const quality = readJson("data/quality/ag74d-panchang-expanded-location-records-and-static-engine-shell.json");
if (quality.status !== "ag74d_completed") fail("AG74D quality status mismatch.");
if (quality.issue_count !== 0) fail('AG74D issue count must be zero.');

pass("AG74D expanded location records and static engine shell are valid.");
pass("Fourteen approved static Panchang locations are ready.");
pass("AG74E Panchang validation sample bank is ready.");
pass("No backend, Supabase, storage, live API dependency or production authority claim is enabled.");
