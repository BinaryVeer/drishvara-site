import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error("❌ AG74F validation failed: " + message);
  process.exit(1);
}
function pass(message) { console.log("✅ " + message); }

const required = [
  "data/knowledge-base/panchang-festival/production/ag74f-panchang-static-engine-result-bank.json",
  "data/knowledge-base/panchang-festival/production/ag74f-panchang-static-lookup-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74f-panchang-fallback-result-fixtures.json",
  "generated/panchang-static-engine-results.json",
  "data/content-intelligence/mutation-plans/ag74f-to-ag74g-panchang-active-data-wiring-boundary.json",
  "data/content-intelligence/quality-registry/ag74f-ag74g-panchang-active-data-wiring-readiness-record.json",
  "data/content-intelligence/quality-reviews/ag74f-panchang-static-engine-result-generation.json",
  "data/quality/ag74f-panchang-static-engine-result-generation.json",
  "data/quality/ag74f-panchang-static-engine-result-generation-preview.json",
  "docs/quality/AG74F_PANCHANG_STATIC_ENGINE_RESULT_GENERATION.md",
  "data/content-intelligence/quality-registry/ag74e-ag74f-panchang-static-engine-result-readiness-record.json",
  "generated/panchang-validation-samples.json"
];

for (const file of required) {
  if (!exists(file)) fail("Missing required file: " + file);
}

const ag74eReady = readJson("data/content-intelligence/quality-registry/ag74e-ag74f-panchang-static-engine-result-readiness-record.json");
if (ag74eReady.status !== "ready_for_ag74f_panchang_static_engine_result_generation") fail("AG74E readiness status mismatch.");

const bank = readJson("data/knowledge-base/panchang-festival/production/ag74f-panchang-static-engine-result-bank.json");
if (bank.status !== "ag74f_panchang_static_engine_result_bank_generated_ag74g_ready") fail("AG74F result bank status mismatch.");
if (bank.result_policy.backend_runtime_used !== false) fail('Backend runtime must remain false.');
if (bank.result_policy.supabase_used !== false) fail('Supabase must remain false.');
if (bank.result_policy.personal_data_used !== false) fail('Personal data use must remain false.');
if (bank.result_policy.live_ephemeris_api_used !== false) fail('Live ephemeris API must remain false.');
if ((bank.results || []).length < 12) fail('AG74F result count must be at least 12.');

const lookupKeys = new Set();
const requiredFields = ["result_id", "lookup_key", "source_sample_id", "location_id", "location_label", "timezone", "local_date_key", "tithi", "tithi_index", "paksha", "nakshatra", "yoga", "karana", "calculation_status", "regional_method_note", "authority_status"];
for (const result of bank.results) {
  for (const field of requiredFields) {
    if (!(field in result)) fail('Result missing field ' + field + ': ' + JSON.stringify(result));
  }
  if (lookupKeys.has(result.lookup_key)) fail('Duplicate lookup key: ' + result.lookup_key);
  lookupKeys.add(result.lookup_key);
  if (result.calculation_status !== 'calculated_under_verification') fail('Result status must remain calculated_under_verification.');
  if (result.authority_status !== 'non_authoritative_under_verification') fail('Result authority status must remain non-authoritative.');
}

const generated = readJson("generated/panchang-static-engine-results.json");
if (generated.status !== "ag74f_generated_static_engine_results_ready") fail("Generated result status mismatch.");
if ((generated.results || []).length !== bank.results.length) fail('Generated result count mismatch.');
if ((generated.fallback_results || []).length < 3) fail('Generated fallback count too low.');

const lookup = readJson("data/knowledge-base/panchang-festival/production/ag74f-panchang-static-lookup-contract.json");
if (lookup.status !== "ag74f_static_lookup_contract_locked_ag74g_ready") fail("Lookup contract status mismatch.");
if (lookup.lookup_key !== "location_id|local_date_key") fail("Lookup key contract mismatch.");

const fallback = readJson("data/knowledge-base/panchang-festival/production/ag74f-panchang-fallback-result-fixtures.json");
if (fallback.status !== "ag74f_fallback_result_fixtures_locked_ag74g_ready") fail("Fallback fixture status mismatch.");
for (const status of ['unsupported_location', 'invalid_date', 'missing_contract_field']) {
  if (!fallback.fallback_results.some((item) => item.calculation_status === status)) fail('Missing fallback status: ' + status);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag74f-ag74g-panchang-active-data-wiring-readiness-record.json");
if (readiness.status !== "ready_for_ag74g_panchang_active_data_wiring") fail("AG74G readiness status mismatch.");
if (readiness.readiness_checks.public_ui_changed !== false) fail('AG74F must not change public UI.');
if (readiness.readiness_checks.backend_runtime_activated !== false) fail('Backend runtime was activated.');
if (readiness.readiness_checks.supabase_activation_performed !== false) fail('Supabase was activated.');
if (readiness.readiness_checks.personal_data_storage_enabled !== false) fail('Personal data storage was enabled.');
if (readiness.readiness_checks.live_ephemeris_api_dependency_enabled !== false) fail('Live ephemeris API dependency was enabled.');

const quality = readJson("data/quality/ag74f-panchang-static-engine-result-generation.json");
if (quality.status !== "ag74f_completed") fail("AG74F quality status mismatch.");
if (quality.issue_count !== 0) fail('AG74F issue count must be zero.');

pass("AG74F Panchang static engine result generation is valid.");
pass("AG74G Panchang active data wiring is ready.");
pass("No backend, Supabase, storage, live API dependency or production authority claim is enabled.");
