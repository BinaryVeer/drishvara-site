import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71G validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/knowledge-base/panchang-festival/production/ag71g-four-location-panchang-computation-readiness-bridge.json",
  "data/knowledge-base/panchang-festival/production/ag71g-computation-engine-discovery-record.json",
  "data/knowledge-base/panchang-festival/production/ag71g-location-id-normalisation-blocker.json",
  "data/content-intelligence/quality-reviews/ag71g-four-location-panchang-computation-readiness-bridge.json",
  "data/quality/ag71g-four-location-panchang-computation-readiness-bridge.json",
  "data/quality/ag71g-four-location-panchang-computation-readiness-bridge-preview.json",
  "data/content-intelligence/quality-registry/ag71g-ag71h-four-location-computation-harness-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag71g-to-ag71h-four-location-computation-harness-boundary.json",
  "docs/quality/AG71G_FOUR_LOCATION_PANCHANG_COMPUTATION_READINESS_BRIDGE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const bridge = readJson("data/knowledge-base/panchang-festival/production/ag71g-four-location-panchang-computation-readiness-bridge.json");
const discovery = readJson("data/knowledge-base/panchang-festival/production/ag71g-computation-engine-discovery-record.json");
const blocker = readJson("data/knowledge-base/panchang-festival/production/ag71g-location-id-normalisation-blocker.json");
const review = readJson("data/content-intelligence/quality-reviews/ag71g-four-location-panchang-computation-readiness-bridge.json");

if (bridge.status !== "ag71g_four_location_panchang_computation_readiness_bridge_completed") fail("Bridge status mismatch.");
if (discovery.status !== "ag71g_engine_discovery_completed_path_b") fail("Discovery must classify Path B.");
if (blocker.status !== "location_id_normalisation_blocker_recorded") fail("Location-id blocker status mismatch.");
if (review.status !== "ag71g_completed") fail("Review status mismatch.");

if (bridge.decision.direct_ui_computation_wiring_now !== false) fail("Direct UI computation wiring must remain false.");
if (bridge.decision.direct_public_output_now !== false) fail("Direct public output must remain false.");
if (bridge.decision.four_location_harness_required_next !== true) fail("AG71H harness must be required.");
if (bridge.decision.location_id_normalisation_required !== true) fail("Location-id normalisation must be required.");

if (!JSON.stringify(blocker).includes("loc_in_ar_itangar_capital_complex_001")) fail("Legacy Itanagar id variant must be recorded.");
if (!JSON.stringify(blocker).includes("loc_in_ar_itanagar_capital_complex_001")) fail("Canonical Itanagar id must be recorded.");

for (const key of [
  "public_runtime_activation_performed",
  "runtime_panchang_computation_performed",
  "runtime_star_reflection_computation_performed",
  "backend_runtime_activated",
  "supabase_activation_performed",
  "full_location_bank_activation_performed"
]) {
  if (bridge.boundary[key] !== false) fail(`${key} must be false.`);
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
if (manifest.current_counts.ag71g_four_location_panchang_computation_readiness_bridge_records !== 1) {
  fail("Manifest must record AG71G bridge count.");
}

pass("AG71G four-location Panchang computation readiness bridge is valid.");
pass("Path B is recorded: internal engine/bank exists but four-location harness is required.");
pass("Location-id normalisation blocker is recorded.");
pass("No public/runtime/backend/Supabase/full-bank activation performed.");
