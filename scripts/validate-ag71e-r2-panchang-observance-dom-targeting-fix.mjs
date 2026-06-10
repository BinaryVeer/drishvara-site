import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71E-R2 validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "data/knowledge-base/location-intelligence/production/ag71e-r2-panchang-observance-dom-targeting-fix-record.json",
  "data/content-intelligence/quality-reviews/ag71e-r2-panchang-observance-dom-targeting-fix.json",
  "data/quality/ag71e-r2-panchang-observance-dom-targeting-fix.json",
  "data/quality/ag71e-r2-panchang-observance-dom-targeting-fix-preview.json",
  "docs/quality/AG71E_R2_PANCHANG_OBSERVANCE_DOM_TARGETING_FIX.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const html = fs.readFileSync(full("index.html"), "utf8");

for (const marker of [
  "AG71E_R2_OBSERVANCE_DOM_TARGETING_FIX_STYLE_START",
  "function findUpcomingObservanceCard()",
  "function updateUpcomingObservanceNote(basis)",
  "data-ag71e-r2-observance-safe-target",
  "data-ag71e-r2-upcoming-observance-basis-line",
  "Selected basis:",
  "Observance dates, regional applicability and bilingual naming remain under editorial verification"
]) {
  if (!html.includes(marker)) fail(`index.html missing marker: ${marker}`);
}

if (html.includes('querySelectorAll("article, section, .card, .mini-card, .feature-card, .info-card, div")')) {
  fail("Old broad destructive observance selector must not remain.");
}

const record = readJson("data/knowledge-base/location-intelligence/production/ag71e-r2-panchang-observance-dom-targeting-fix-record.json");
if (record.status !== "panchang_observance_dom_targeting_fixed") fail("Record status mismatch.");

for (const key of [
  "public_runtime_activation_performed",
  "runtime_panchang_computation_performed",
  "runtime_star_reflection_computation_performed",
  "backend_runtime_activated",
  "supabase_activation_performed",
  "full_location_bank_activation_performed"
]) {
  if (record.boundary[key] !== false) fail(`${key} must be false.`);
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
if (manifest.current_counts.ag71e_r2_panchang_observance_dom_targeting_fix_records !== 1) {
  fail("Manifest must record AG71E-R2 count.");
}

pass("AG71E-R2 Panchang observance DOM targeting fix is valid.");
pass("Upcoming Observance update is non-destructive.");
pass("No public/runtime/backend/Supabase activation performed.");
