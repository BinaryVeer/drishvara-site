import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71E validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "data/knowledge-base/location-intelligence/production/ag71e-pilot-submit-output-contract-record.json",
  "data/content-intelligence/quality-reviews/ag71e-pilot-submit-output-contract.json",
  "data/quality/ag71e-pilot-submit-output-contract.json",
  "data/quality/ag71e-pilot-submit-output-contract-preview.json",
  "docs/quality/AG71E_PILOT_SUBMIT_OUTPUT_CONTRACT.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const html = fs.readFileSync(full("index.html"), "utf8");

for (const marker of [
  "AG71E_STAR_REFLECTION_PREVIEW_OUTPUT_START",
  "AG71E_PANCHANG_PREVIEW_OUTPUT_START",
  "AG71E_PILOT_SUBMIT_OUTPUT_STYLE_START",
  "AG71E_PILOT_SUBMIT_OUTPUT_CONTROLLER_START",
  "window.drishvaraAg71ePreviewStarReflection",
  "window.drishvaraAg71ePreviewPanchang",
  'data-ag71e-preview-button="star-reflection"',
  'data-ag71e-preview-button="panchang"',
  'data-ag71e-preview-panel="star-reflection"',
  'data-ag71e-preview-panel="panchang"',
  "Generate Star Reflection Result",
  "Preview Panchang",
  "Moon-led, Panchanga-supported, location-aware",
  "Withheld until verified"
]) {
  if (!html.includes(marker)) fail(`index.html missing marker: ${marker}`);
}

const starOutputIndex = html.indexOf("AG71E_STAR_REFLECTION_PREVIEW_OUTPUT_START");
const starBasisIndex = html.indexOf('data-ag71d-r4-method-basis-status="true"');
if (starOutputIndex < 0 || starBasisIndex < 0 || starOutputIndex > starBasisIndex) {
  fail("Star Reflection output panel must appear before reflection-basis governance note.");
}

const panchangOutputIndex = html.indexOf("AG71E_PANCHANG_PREVIEW_OUTPUT_START");
const panchangTail = panchangOutputIndex >= 0 ? html.slice(panchangOutputIndex) : "";
const panchangTableMatch = panchangTail.match(/<div\s+class="mini-table"\s+data-drishvara-ag60i-panchang-preview-safe="true">/i);
const panchangTableIndex = panchangTableMatch ? panchangOutputIndex + panchangTableMatch.index : -1;
if (panchangOutputIndex < 0 || panchangTableIndex < 0 || panchangOutputIndex > panchangTableIndex) {
  fail("Panchang output panel must appear before existing Panchang table.");
}

const record = readJson("data/knowledge-base/location-intelligence/production/ag71e-pilot-submit-output-contract-record.json");
if (record.status !== "pilot_submit_output_contract_applied") fail("Record status mismatch.");

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
if (manifest.current_counts.ag71e_pilot_submit_output_contract_records !== 1) {
  fail("Manifest must record AG71E submit output contract count.");
}

pass("AG71E pilot submit/output contract is valid.");
pass("Star/Panchang safe preview controls are present.");
pass("No public/runtime/backend/Supabase activation performed.");
