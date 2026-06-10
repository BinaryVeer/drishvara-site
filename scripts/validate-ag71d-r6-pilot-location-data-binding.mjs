import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71D-R6 validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "data/knowledge-base/location-intelligence/production/ag71d-r6-pilot-location-data-binding-record.json",
  "data/content-intelligence/quality-reviews/ag71d-r6-pilot-location-data-binding.json",
  "data/quality/ag71d-r6-pilot-location-data-binding.json",
  "data/quality/ag71d-r6-pilot-location-data-binding-preview.json",
  "docs/quality/AG71D_R6_PILOT_LOCATION_DATA_BINDING.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const html = fs.readFileSync(full("index.html"), "utf8");

for (const marker of [
  "AG71D_R6_LOCATION_DATA_BINDING_STYLE_START",
  "AG71D_R6_LOCATION_DATA_BINDING_CONTROLLER_START",
  "window.drishvaraAg71dR6UpdateLocationBinding",
  "window.drishvaraAg71dR6GetLocationBasis",
  'id="ag71d-r6-pilot-location-binding-data"',
  'data-ag71d-r6-coordinate-basis-summary="star-reflection"',
  'data-ag71d-r6-coordinate-basis-summary="panchang"',
  'data-latitude="27.0844"',
  'data-longitude="93.6053"',
  'data-latitude="28.6139"',
  'data-longitude="77.209"',
  'data-latitude="23.3441"',
  'data-longitude="85.3096"',
  'data-latitude="35.6762"',
  'data-longitude="139.6503"',
  "Asia/Kolkata",
  "Asia/Tokyo",
  "approved_pilot_place",
  "user_entered_coordinates"
]) {
  if (!html.includes(marker)) fail(`index.html missing marker: ${marker}`);
}

const record = readJson("data/knowledge-base/location-intelligence/production/ag71d-r6-pilot-location-data-binding-record.json");
if (record.status !== "pilot_location_data_binding_applied") fail("Record status mismatch.");
if (record.pilot_locations.length !== 4) fail("Pilot location count must be 4.");

for (const item of record.pilot_locations) {
  for (const key of ["location_id", "label", "latitude", "longitude", "timezone", "review_status"]) {
    if (item[key] === undefined || item[key] === "") fail(`Pilot location missing ${key}.`);
  }
}

if (record.basis_rules.coordinate_basis.indexOf("optional place label") === -1) {
  fail("Coordinate basis rule must mention optional place label.");
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
if (manifest.current_counts.ag71d_r6_pilot_location_data_binding_records !== 1) {
  fail("Manifest must record AG71D-R6 binding count.");
}

pass("AG71D-R6 pilot location data binding is valid.");
pass("Pilot places are bound to coordinates and timezone.");
pass("No public/runtime/backend/Supabase activation performed.");
