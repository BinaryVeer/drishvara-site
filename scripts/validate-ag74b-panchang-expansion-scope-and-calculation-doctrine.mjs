import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error("❌ AG74B validation failed: " + message);
  process.exit(1);
}
function pass(message) { console.log("✅ " + message); }

const required = [
  "data/knowledge-base/panchang-festival/production/ag74b-panchang-expansion-scope.json",
  "data/knowledge-base/panchang-festival/production/ag74b-panchang-calculation-doctrine.json",
  "data/knowledge-base/panchang-festival/production/ag74b-panchang-location-expansion-map.json",
  "data/knowledge-base/panchang-festival/production/ag74b-panchang-expansion-safety-boundary.json",
  "data/content-intelligence/quality-registry/ag74b-ag74c-panchang-computation-contract-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag74b-to-ag74c-panchang-computation-contract-boundary.json",
  "data/content-intelligence/quality-reviews/ag74b-panchang-expansion-scope-and-calculation-doctrine.json",
  "data/quality/ag74b-panchang-expansion-scope-and-calculation-doctrine.json",
  "data/quality/ag74b-panchang-expansion-scope-and-calculation-doctrine-preview.json",
  "docs/quality/AG74B_PANCHANG_EXPANSION_SCOPE_AND_CALCULATION_DOCTRINE.md",
  "data/content-intelligence/quality-registry/ag74a-two-asset-active-ui-simplification-record.json"
];

for (const file of required) {
  if (!exists(file)) fail("Missing required file: " + file);
}

const ag74a = readJson("data/content-intelligence/quality-registry/ag74a-two-asset-active-ui-simplification-record.json");
if (ag74a.status !== "ag74a_two_asset_active_ui_simplification_applied") fail("AG74A baseline is not closed.");

const scope = readJson("data/knowledge-base/panchang-festival/production/ag74b-panchang-expansion-scope.json");
if (scope.status !== "ag74b_panchang_expansion_scope_locked_ag74c_ready") fail("AG74B scope status mismatch.");
if (scope.expansion_intent.public_ui_change_in_ag74b !== false) fail("AG74B must not change public UI.");
if (scope.expansion_intent.production_release_enabled_now !== false) fail("AG74B must not enable production release.");

const doctrine = readJson("data/knowledge-base/panchang-festival/production/ag74b-panchang-calculation-doctrine.json");
if (doctrine.status !== "ag74b_calculation_doctrine_locked_ag74c_ready") fail("AG74B doctrine status mismatch.");

for (const key of ["tithi_policy", "nakshatra_policy", "yoga_policy", "karana_policy", "paksha_policy", "sunrise_sunset_policy"]) {
  if (!doctrine.calculation_principles || !doctrine.calculation_principles[key]) {
    fail("Missing calculation principle: " + key);
  }
}

const location = readJson("data/knowledge-base/panchang-festival/production/ag74b-panchang-location-expansion-map.json");
if (location.status !== "ag74b_location_expansion_map_created_ag74c_ready") fail("AG74B location map status mismatch.");
if ((location.current_pilot_locations || []).length !== 4) fail("Current pilot location count must remain 4 in AG74B.");
if (((location.proposed_first_expansion_set || {}).india_core || []).length < 5) fail("India core expansion set is too small.");

const safety = readJson("data/knowledge-base/panchang-festival/production/ag74b-panchang-expansion-safety-boundary.json");
for (const [key, value] of Object.entries(safety.blocked_actions || {})) {
  if (value !== false) fail("Blocked action must remain false: " + key);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag74b-ag74c-panchang-computation-contract-readiness-record.json");
if (readiness.status !== "ready_for_ag74c_panchang_computation_contract") fail("AG74C readiness status mismatch.");
if (readiness.readiness_checks.backend_runtime_activated !== false) fail('Backend runtime must remain false.');
if (readiness.readiness_checks.supabase_activation_performed !== false) fail('Supabase activation must remain false.');

const quality = readJson("data/quality/ag74b-panchang-expansion-scope-and-calculation-doctrine.json");
if (quality.status !== "ag74b_completed") fail("AG74B quality status mismatch.");
if (quality.issue_count !== 0) fail("AG74B issue count must be zero.");

pass("AG74B Panchang expansion scope and calculation doctrine is valid.");
pass("AG74C Panchang computation contract is ready.");
pass("No backend, Supabase, storage or production release action is enabled.");
