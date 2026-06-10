import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71D-R5 validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "data/knowledge-base/location-intelligence/production/ag71d-r5-pilot-selector-ui-finalization-record.json",
  "data/content-intelligence/quality-reviews/ag71d-r5-pilot-selector-ui-finalization.json",
  "data/quality/ag71d-r5-pilot-selector-ui-finalization.json",
  "data/quality/ag71d-r5-pilot-selector-ui-finalization-preview.json",
  "docs/quality/AG71D_R5_PILOT_SELECTOR_UI_FINALIZATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const html = fs.readFileSync(full("index.html"), "utf8");

for (const marker of [
  "AG71D_R5_PILOT_SELECTOR_FINALIZATION_STYLE_START",
  "AG71D_R5_PILOT_SELECTOR_FINALIZATION_CONTROLLER_START",
  "window.drishvaraAg71dR5UpdatePilotSelectionSummaries",
  'data-ag71d-r5-native-select-compat="true"',
  'data-ag71d-r5-selection-summary="star-reflection"',
  'data-ag71d-r5-selection-summary="panchang"',
  'data-ag71d-r5-search-forward-note="star-reflection"',
  'data-ag71d-r5-search-forward-note="panchang"',
  "Choose Birth Place",
  "Choose Panchang Location",
  "Itanagar",
  "New Delhi",
  "Ranchi",
  "Tokyo"
]) {
  if (!html.includes(marker)) fail(`index.html missing marker: ${marker}`);
}

const record = readJson("data/knowledge-base/location-intelligence/production/ag71d-r5-pilot-selector-ui-finalization-record.json");
if (record.status !== "pilot_selector_ui_finalized") fail("Record status mismatch.");
if (record.pilot_locations.length !== 4) fail("Pilot location count must be 4.");
if (record.searchable_location_picker_forward_contract.status !== "planned_after_pilot_validation") {
  fail("Searchable location picker forward contract status mismatch.");
}

for (const key of [
  "public_runtime_activation_performed",
  "runtime_panchang_computation_performed",
  "runtime_star_reflection_computation_performed",
  "backend_runtime_activated",
  "supabase_activation_performed",
  "full_location_bank_activation_performed"
]) {
  if (record[key] !== false) fail(`${key} must be false.`);
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
if (manifest.current_counts.ag71d_r5_pilot_selector_ui_finalization_records !== 1) {
  fail("Manifest must record AG71D-R5 finalization count.");
}

pass("AG71D-R5 pilot selector UI finalization is valid.");
pass("Future searchable location picker contract is recorded.");
pass("No public/runtime/backend/Supabase activation performed.");
