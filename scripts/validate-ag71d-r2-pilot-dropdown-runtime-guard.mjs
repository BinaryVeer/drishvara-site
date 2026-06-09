import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71D-R2 validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "data/knowledge-base/location-intelligence/production/ag71d-r2-pilot-dropdown-runtime-guard-record.json",
  "data/content-intelligence/quality-reviews/ag71d-r2-pilot-dropdown-runtime-guard.json",
  "data/quality/ag71d-r2-pilot-dropdown-runtime-guard.json",
  "data/quality/ag71d-r2-pilot-dropdown-runtime-guard-preview.json",
  "docs/quality/AG71D_R2_PILOT_DROPDOWN_RUNTIME_GUARD.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const html = fs.readFileSync(full("index.html"), "utf8");

for (const marker of [
  "AG71D_R2_PILOT_DROPDOWN_RUNTIME_GUARD_START",
  "window.drishvaraAg71dR2EnforcePilotDropdowns",
  'id="star-birth-place-select"',
  'id="panchang-place-select"',
  "Itanagar",
  "New Delhi",
  "Ranchi",
  "Tokyo"
]) {
  if (!html.includes(marker)) fail(`index.html missing marker: ${marker}`);
}

function extractSelect(id) {
  const re = new RegExp(`<select\\b(?=[^>]*id="${id}")[\\s\\S]*?<\\/select>`, "i");
  const match = html.match(re);
  if (!match) fail(`Missing select id="${id}"`);
  return match[0];
}

const starSelect = extractSelect("star-birth-place-select");
const panchangSelect = extractSelect("panchang-place-select");

for (const label of ["Itanagar", "New Delhi", "Ranchi", "Tokyo"]) {
  if (!starSelect.includes(`>${label}</option>`)) fail(`Star dropdown missing ${label}`);
  if (!panchangSelect.includes(`>${label}</option>`)) fail(`Panchang dropdown missing ${label}`);
}

if (/Reflection Method Under Review/i.test(starSelect)) {
  fail("Star Birth Place dropdown must not contain Reflection Method Under Review.");
}

const record = readJson("data/knowledge-base/location-intelligence/production/ag71d-r2-pilot-dropdown-runtime-guard-record.json");
if (record.status !== "pilot_dropdown_runtime_guard_applied") fail("Runtime guard record status mismatch.");
if (record.pilot_locations.length !== 4) fail("Pilot location count must be 4.");
if (record.panchang_ag64b_canonical_id_preserved !== true) fail("AG64B canonical id must be preserved.");

for (const key of [
  "public_runtime_activation_performed",
  "runtime_panchang_computation_performed",
  "runtime_star_reflection_computation_performed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (record[key] !== false) fail(`${key} must be false.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag71d-r2-pilot-dropdown-runtime-guard.json");
if (review.status !== "ag71d_r2_completed") fail("Review status mismatch.");
if (review.summary.star_birth_place_dropdown_guarded !== true) fail("Star dropdown guarded must be true.");
if (review.summary.panchang_location_dropdown_guarded !== true) fail("Panchang dropdown guarded must be true.");

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
if (manifest.current_counts.ag71d_r2_pilot_dropdown_runtime_guard_records !== 1) {
  fail("Manifest must record AG71D-R2 runtime guard count.");
}

pass("AG71D-R2 pilot dropdown runtime guard is valid.");
pass("Star and Panchang pilot dropdowns are guarded.");
pass("No public/runtime/backend/Supabase activation performed.");
