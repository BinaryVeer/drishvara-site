import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71H validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/knowledge-base/panchang-festival/production/ag71h-four-location-internal-panchang-computation-harness.json",
  "data/knowledge-base/panchang-festival/production/ag71h-location-id-alias-map.json",
  "data/knowledge-base/panchang-festival/production/ag71h-four-location-panchang-request-bank.json",
  "data/content-intelligence/quality-reviews/ag71h-four-location-internal-panchang-computation-harness.json",
  "data/quality/ag71h-four-location-internal-panchang-computation-harness.json",
  "data/quality/ag71h-four-location-internal-panchang-computation-harness-preview.json",
  "data/content-intelligence/quality-registry/ag71h-ag71i-four-location-internal-execution-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag71h-to-ag71i-four-location-internal-execution-boundary.json",
  "docs/quality/AG71H_FOUR_LOCATION_INTERNAL_PANCHANG_COMPUTATION_HARNESS.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const harness = readJson("data/knowledge-base/panchang-festival/production/ag71h-four-location-internal-panchang-computation-harness.json");
const alias = readJson("data/knowledge-base/panchang-festival/production/ag71h-location-id-alias-map.json");
const requestBank = readJson("data/knowledge-base/panchang-festival/production/ag71h-four-location-panchang-request-bank.json");
const review = readJson("data/content-intelligence/quality-reviews/ag71h-four-location-internal-panchang-computation-harness.json");

if (harness.status !== "ag71h_four_location_internal_panchang_computation_harness_created") fail("Harness status mismatch.");
if (alias.status !== "location_id_alias_map_created") fail("Alias-map status mismatch.");
if (requestBank.status !== "ag71h_four_location_request_bank_created_pending_execution") fail("Request-bank status mismatch.");
if (review.status !== "ag71h_completed") fail("Review status mismatch.");

if (harness.request_record_count !== 28) fail("Harness must contain 28 request records.");
if (requestBank.request_record_count !== 28) fail("Request bank must contain 28 request records.");
if (harness.computation_values_generated_now !== 0) fail("AG71H must not generate computed values.");
if (harness.calculation_execution_status !== "not_executed_in_ag71h") fail("AG71H execution status must remain not executed.");

const locationIds = new Set(requestBank.records.map((x) => x.location_id));
for (const requiredId of [
  "loc_in_ar_itanagar_capital_complex_001",
  "loc_in_dl_new_delhi_capital_001",
  "loc_in_jh_ranchi_city_001",
  "loc_jp_tokyo_capital_001"
]) {
  if (!locationIds.has(requiredId)) fail(`Missing canonical pilot location id: ${requiredId}`);
}

if (!JSON.stringify(alias).includes("loc_in_ar_itangar_capital_complex_001")) fail("Legacy Itangar id must be recorded.");
if (!JSON.stringify(alias).includes("loc_in_ar_itanagar_capital_complex_001")) fail("Canonical Itanagar id must be recorded.");
if (alias.direct_rename_performed !== false) fail("Direct rename must not be performed.");

for (const record of requestBank.records) {
  if (record.computed_values_present !== false) fail(`Request ${record.request_id} must not contain computed values.`);
  if (record.public_output_allowed !== false) fail(`Request ${record.request_id} must remain public-blocked.`);
  if (record.external_panchang_source_used !== false) fail(`Request ${record.request_id} must not use external Panchang source.`);
}

for (const key of [
  "public_runtime_activation_performed",
  "runtime_panchang_computation_performed",
  "runtime_star_reflection_computation_performed",
  "backend_runtime_activated",
  "supabase_activation_performed",
  "full_location_bank_activation_performed",
  "public_output_allowed_now"
]) {
  if (harness.boundary[key] !== false) fail(`${key} must be false.`);
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
if (manifest.current_counts.ag71h_four_location_request_records !== 28) {
  fail("Manifest must record 28 AG71H request records.");
}
if (manifest.current_counts.ag71h_location_id_alias_records !== 1) {
  fail("Manifest must record one AG71H alias record.");
}

pass("AG71H four-location internal Panchang computation harness is valid.");
pass("28 canonical four-location request records are present.");
pass("Location-id alias map is present.");
pass("No computation/public/runtime/backend/Supabase/full-bank activation performed.");
