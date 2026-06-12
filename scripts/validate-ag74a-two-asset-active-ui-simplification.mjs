import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ AG74A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "generated/panchang-pilot-preview-data.json",
  "generated/star-reflection-active-result-data.json",
  "data/content-intelligence/quality-registry/ag74a-two-asset-active-ui-simplification-record.json",
  "data/content-intelligence/quality-reviews/ag74a-two-asset-active-ui-simplification.json",
  "data/quality/ag74a-two-asset-active-ui-simplification.json",
  "data/quality/ag74a-two-asset-active-ui-simplification-preview.json",
  "docs/quality/AG74A_TWO_ASSET_ACTIVE_UI_SIMPLIFICATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const index = read("index.html");

for (const stale of [
  "Pilot-safe preview mode is active",
  "remain locked pending verification",
  "Preview Panchang",
  "PILOT PANCHANG PREVIEW - UNDER VERIFICATION",
  "Pilot limitation",
  "ACTIVE STAR REFLECTION RESULT - REFLECTIVE ONLY",
  "Active Star Reflection Result - Reflective Only",
  "Active reflective result generated"
]) {
  if (index.includes(stale)) fail(`Stale visible UI copy remains: ${stale}`);
}

for (const marker of [
  "Generate Panchang Result",
  "PANCHANG RESULT",
  "STAR REFLECTION RESULT",
  "Reflection generated",
  "Result note",
  "data-ag74a-panchang-active-status",
  "ag74a-two-asset-active-ui-simplification"
]) {
  if (!index.includes(marker)) fail(`Missing AG74A active UI marker: ${marker}`);
}

const record = readJson("data/content-intelligence/quality-registry/ag74a-two-asset-active-ui-simplification-record.json");
if (record.status !== "ag74a_two_asset_active_ui_simplification_applied") {
  fail("AG74A record status mismatch.");
}
if (record.boundaries.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (record.boundaries.supabase_activation_performed !== false) fail("Supabase must remain false.");
if (record.boundaries.personal_data_storage_enabled !== false) fail("Personal data storage must remain false.");
if (record.boundaries.deterministic_prediction_enabled !== false) fail("Deterministic prediction must remain false.");

pass("AG74A two-asset active UI simplification is valid.");
pass("Visible transition-era pilot/preview/locked copy is removed.");
pass("AG74B Panchang expansion scope is ready.");
