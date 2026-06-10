import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71E-R1 validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "data/knowledge-base/location-intelligence/production/ag71e-r1-output-consolidation-typography-record.json",
  "data/content-intelligence/quality-reviews/ag71e-r1-output-consolidation-typography.json",
  "data/quality/ag71e-r1-output-consolidation-typography.json",
  "data/quality/ag71e-r1-output-consolidation-typography-preview.json",
  "docs/quality/AG71E_R1_OUTPUT_CONSOLIDATION_TYPOGRAPHY.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const html = fs.readFileSync(full("index.html"), "utf8");

for (const marker of [
  "AG71E_R1_OUTPUT_CONSOLIDATION_STYLE_START",
  "function humanizeAg71e",
  'if (kind === "panchang") return;',
  "function updatePanchangInlineStatus",
  'data-ag71e-r1-panchang-inline-status="true"',
  'data-ag71e-r1-compat-hidden="true"',
  "Observance lookup is linked to selected basis",
  "overflow-wrap: anywhere",
  "font-family: Arial"
]) {
  if (!html.includes(marker)) fail(`index.html missing marker: ${marker}`);
}

const record = readJson("data/knowledge-base/location-intelligence/production/ag71e-r1-output-consolidation-typography-record.json");
if (record.status !== "output_consolidation_typography_wrap_applied") fail("Record status mismatch.");

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
if (manifest.current_counts.ag71e_r1_output_consolidation_typography_records !== 1) {
  fail("Manifest must record AG71E-R1 count.");
}

pass("AG71E-R1 output consolidation and typography wrap is valid.");
pass("Panchang duplicate output panel is suppressed.");
pass("No public/runtime/backend/Supabase activation performed.");
