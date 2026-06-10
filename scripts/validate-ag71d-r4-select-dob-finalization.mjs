import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71D-R4 validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "data/knowledge-base/location-intelligence/production/ag71d-r4-select-dob-finalization-record.json",
  "data/content-intelligence/quality-reviews/ag71d-r4-select-dob-finalization.json",
  "data/quality/ag71d-r4-select-dob-finalization.json",
  "data/quality/ag71d-r4-select-dob-finalization-preview.json",
  "docs/quality/AG71D_R4_SELECT_DOB_FINALIZATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const html = fs.readFileSync(full("index.html"), "utf8");

for (const marker of [
  "AG71D_R4_SELECT_AND_DOB_FINALIZATION_STYLE_START",
  "AG71D_R4_SELECT_AND_DOB_FINALIZATION_CONTROLLER_START",
  "window.drishvaraAg71dR4SetLocation",
  "window.drishvaraAg71dR4ApplyDobMask",
  'data-ag71d-r4-date-mask="ddmmyyyy"',
  'data-ag71d-r4-location-options="star-reflection"',
  'data-ag71d-r4-location-options="panchang"',
  "Reflection Locked Pending Review",
  "Itanagar",
  "New Delhi",
  "Ranchi",
  "Tokyo"
]) {
  if (!html.includes(marker)) fail(`index.html missing marker: ${marker}`);
}

const starSelect = html.match(/<select\b(?=[^>]*id="star-birth-place-select")[\s\S]*?<\/select>/i)?.[0] || "";
if (!starSelect) fail("Star Birth Place select missing.");
if (/Reflection Method Under Review/i.test(starSelect)) fail("Star Birth Place select must not contain old method label.");

const dob = html.match(/<input\b(?=[^>]*id="star-reflection-dob")[^>]*>/i)?.[0] || "";
if (!dob.includes('maxlength="10"')) fail("DOB maxlength must be 10.");
if (!dob.includes('data-ag71d-r4-date-mask="ddmmyyyy"')) fail("DOB mask attribute missing.");

const record = readJson("data/knowledge-base/location-intelligence/production/ag71d-r4-select-dob-finalization-record.json");
if (record.status !== "select_control_and_dob_mask_finalized") fail("Record status mismatch.");
if (record.pilot_locations.length !== 4) fail("Pilot location count must be 4.");

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
if (manifest.current_counts.ag71d_r4_select_dob_finalization_records !== 1) {
  fail("Manifest must record AG71D-R4 finalization count.");
}

pass("AG71D-R4 select control and DOB mask finalization is valid.");
pass("DOB mask and pilot location selectors are present.");
pass("No public/runtime/backend/Supabase activation performed.");
