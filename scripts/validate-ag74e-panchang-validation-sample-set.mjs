import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error("❌ AG74E validation failed: " + message);
  process.exit(1);
}
function pass(message) { console.log("✅ " + message); }

const required = [
  "data/knowledge-base/panchang-festival/production/ag74e-panchang-validation-sample-set.json",
  "data/knowledge-base/panchang-festival/production/ag74e-panchang-validation-sample-method.json",
  "data/knowledge-base/panchang-festival/production/ag74e-panchang-static-engine-test-plan.json",
  "generated/panchang-validation-samples.json",
  "data/content-intelligence/mutation-plans/ag74e-to-ag74f-panchang-static-engine-result-boundary.json",
  "data/content-intelligence/quality-registry/ag74e-ag74f-panchang-static-engine-result-readiness-record.json",
  "data/content-intelligence/quality-reviews/ag74e-panchang-validation-sample-set.json",
  "data/quality/ag74e-panchang-validation-sample-set.json",
  "data/quality/ag74e-panchang-validation-sample-set-preview.json",
  "docs/quality/AG74E_PANCHANG_VALIDATION_SAMPLE_SET.md",
  "data/content-intelligence/quality-registry/ag74d-ag74e-panchang-validation-sample-readiness-record.json",
  "generated/panchang-expanded-location-records.json"
];

for (const file of required) {
  if (!exists(file)) fail("Missing required file: " + file);
}

const ag74dReady = readJson("data/content-intelligence/quality-registry/ag74d-ag74e-panchang-validation-sample-readiness-record.json");
if (ag74dReady.status !== "ready_for_ag74e_panchang_validation_sample_bank") fail("AG74D readiness status mismatch.");

const sampleSet = readJson("data/knowledge-base/panchang-festival/production/ag74e-panchang-validation-sample-set.json");
if (sampleSet.status !== "ag74e_panchang_validation_sample_set_locked_ag74f_ready") fail("AG74E sample set status mismatch.");
if (sampleSet.sample_policy.live_api_validation_used !== false) fail('Live API validation must remain false.');
if (sampleSet.sample_policy.backend_runtime_used !== false) fail('Backend runtime must remain false.');
if (sampleSet.sample_policy.personal_data_used !== false) fail('Personal data use must remain false.');
if ((sampleSet.samples || []).length < 12) fail('AG74E sample count must be at least 12.');

const uniqueLocations = new Set(sampleSet.samples.map((sample) => sample.location_id));
if (uniqueLocations.size < 4) fail('AG74E must cover at least 4 locations.');

const requiredFields = ["sample_id", "location_id", "location_label", "timezone", "local_date_key", "tithi", "tithi_index", "paksha", "nakshatra", "yoga", "karana", "calculation_status", "regional_method_note"];
for (const sample of sampleSet.samples) {
  for (const field of requiredFields) {
    if (!(field in sample)) fail('Sample missing field ' + field + ': ' + JSON.stringify(sample));
  }
  if (sample.calculation_status !== 'calculated_under_verification') fail('Sample status must remain calculated_under_verification.');
  if (sample.authority_status !== 'non_authoritative_under_verification') fail('Sample authority status must remain non-authoritative.');
}

const generated = readJson("generated/panchang-validation-samples.json");
if (generated.status !== "ag74e_generated_validation_samples_ready") fail("Generated validation sample status mismatch.");
if ((generated.samples || []).length !== sampleSet.samples.length) fail('Generated sample count mismatch.');

const method = readJson("data/knowledge-base/panchang-festival/production/ag74e-panchang-validation-sample-method.json");
if (method.status !== "ag74e_validation_sample_method_locked") fail("Sample method status mismatch.");
if (method.method.external_live_api_used !== false) fail('External live API must remain false.');

const testPlan = readJson("data/knowledge-base/panchang-festival/production/ag74e-panchang-static-engine-test-plan.json");
if (testPlan.status !== "ag74e_static_engine_test_plan_locked_ag74f_ready") fail("Static engine test plan status mismatch.");
if ((testPlan.ag74f_test_cases || []).length < 5) fail('AG74F test plan must include at least 5 cases.');

const readiness = readJson("data/content-intelligence/quality-registry/ag74e-ag74f-panchang-static-engine-result-readiness-record.json");
if (readiness.status !== "ready_for_ag74f_panchang_static_engine_result_generation") fail("AG74F readiness status mismatch.");
if (readiness.readiness_checks.backend_runtime_activated !== false) fail('Backend runtime was activated.');
if (readiness.readiness_checks.supabase_activation_performed !== false) fail('Supabase was activated.');
if (readiness.readiness_checks.personal_data_storage_enabled !== false) fail('Personal data storage was enabled.');
if (readiness.readiness_checks.live_ephemeris_api_dependency_enabled !== false) fail('Live ephemeris API dependency was enabled.');

const quality = readJson("data/quality/ag74e-panchang-validation-sample-set.json");
if (quality.status !== "ag74e_completed") fail("AG74E quality status mismatch.");
if (quality.issue_count !== 0) fail('AG74E issue count must be zero.');

pass("AG74E Panchang validation sample set is valid.");
pass("AG74F Panchang static engine result generation is ready.");
pass("No backend, Supabase, storage, live API dependency or production authority claim is enabled.");
