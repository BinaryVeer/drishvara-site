import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71D-R3 validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "data/knowledge-base/location-intelligence/production/ag71d-r3-form-interaction-cleanup-record.json",
  "data/content-intelligence/quality-reviews/ag71d-r3-form-interaction-cleanup.json",
  "data/quality/ag71d-r3-form-interaction-cleanup.json",
  "data/quality/ag71d-r3-form-interaction-cleanup-preview.json",
  "docs/quality/AG71D_R3_FORM_INTERACTION_CLEANUP.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const html = fs.readFileSync(full("index.html"), "utf8");

for (const marker of [
  "AG71D_R3_FORM_INTERACTION_CLEANUP_STYLE_START",
  "AG71D_R3_FORM_INTERACTION_CONTROLLER_START",
  "window.drishvaraAg71dR3BootFormCleanup",
  "window.drishvaraAg71dR3SetMode",
  'id="star-reflection-name"',
  'id="star-reflection-dob"',
  'id="star-birth-place-select"',
  'id="panchang-place-select"',
  "Itanagar",
  "New Delhi",
  "Ranchi",
  "Tokyo"
]) {
  if (!html.includes(marker)) fail(`index.html missing marker: ${marker}`);
}

if (html.includes("inputs.forEach(keepControlDisabled)")) {
  fail("AG66B still disables all Star Reflection inputs.");
}

const remaining = html.split(/\n/).filter((line) => line.includes('setSelectValue("panchang-place-select", panchang.place);'));
const bad = remaining.filter((line) => !line.includes('hasAttribute("data-ag71d-location-select")'));
if (bad.length) fail("Unguarded Panchang place overwrite still exists.");

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

for (const id of [
  "star-reflection-name",
  "star-reflection-dob",
  "star-birth-place-select",
  "panchang-place-select",
  "star-birth-latitude",
  "star-birth-longitude",
  "star-birth-timezone",
  "star-birth-coordinate-label",
  "panchang-latitude",
  "panchang-longitude",
  "panchang-timezone",
  "panchang-coordinate-label"
]) {
  const re = new RegExp(`<(?:input|select)\\b(?=[^>]*id="${id}")[^>]*>`, "i");
  const match = html.match(re);
  if (!match) fail(`Missing interactive control ${id}`);
  if (/disabled|readonly|aria-disabled="true"/i.test(match[0])) fail(`${id} must not be disabled or readonly.`);
}

for (const blockName of [
  "AG71D_STAR_MODE_INTERACTION_FIX_SCRIPT",
  "AG71D_PLACE_SELECTION_TOGGLE_FIX"
]) {
  const re = new RegExp(`/\\*\\s*${blockName}_START\\s*\\*/[\\s\\S]*?/\\*\\s*${blockName}_END\\s*\\*/`, "i");
  const match = html.match(re);
  if (match && match[0].includes("event.preventDefault")) {
    fail(`event.preventDefault remains inside ${blockName}.`);
  }
}

const record = readJson("data/knowledge-base/location-intelligence/production/ag71d-r3-form-interaction-cleanup-record.json");
if (record.status !== "form_interaction_cleanup_applied") fail("Record status mismatch.");
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

const review = readJson("data/content-intelligence/quality-reviews/ag71d-r3-form-interaction-cleanup.json");
if (review.status !== "ag71d_r3_completed") fail("Review status mismatch.");

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
if (manifest.current_counts.ag71d_r3_form_interaction_cleanup_records !== 1) {
  fail("Manifest must record AG71D-R3 cleanup count.");
}

pass("AG71D-R3 form interaction cleanup is valid.");
pass("Star/Panchang preview controls are enabled and corrected.");
pass("No public/runtime/backend/Supabase activation performed.");
