import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71F validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "data/knowledge-base/location-intelligence/production/ag71f-pilot-safe-output-rendering-closure-record.json",
  "data/content-intelligence/quality-reviews/ag71f-pilot-safe-output-rendering-closure.json",
  "data/quality/ag71f-pilot-safe-output-rendering-closure.json",
  "data/quality/ag71f-pilot-safe-output-rendering-closure-preview.json",
  "docs/quality/AG71F_PILOT_SAFE_OUTPUT_RENDERING_CLOSURE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const html = fs.readFileSync(full("index.html"), "utf8");

for (const marker of [
  "AG71F_PILOT_SAFE_OUTPUT_RENDERING_CLOSURE_START",
  "AG71F_PILOT_SAFE_OUTPUT_RENDERING_CLOSURE_STYLE_START",
  "AG71F_PILOT_SAFE_OUTPUT_RENDERING_CLOSURE_CONTROLLER_START",
  "window.drishvaraAg71fMarkPilotSafeOutputClosure",
  'data-ag71f-pilot-safe-output-rendering="closed"',
  "AG71E_STAR_REFLECTION_PREVIEW_OUTPUT_START",
  "AG71E_PANCHANG_PREVIEW_OUTPUT_START",
  "AG71E_R2_OBSERVANCE_DOM_TARGETING_FIX_STYLE_START",
  "window.drishvaraAg71dR6GetLocationBasis",
  "exact Panchang computation and personalised Star Reflection remain locked"
]) {
  if (!html.includes(marker)) fail(`index.html missing marker: ${marker}`);
}

const record = readJson("data/knowledge-base/location-intelligence/production/ag71f-pilot-safe-output-rendering-closure-record.json");
if (record.status !== "pilot_safe_output_rendering_closed") fail("Record status mismatch.");
if (record.next_gate.next_module !== "AG71G") fail("Next gate must be AG71G.");

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

const review = readJson("data/content-intelligence/quality-reviews/ag71f-pilot-safe-output-rendering-closure.json");
if (review.status !== "ag71f_completed") fail("Review status mismatch.");
if (review.summary.ready_for_ag71g_four_location_computation_test !== true) {
  fail("AG71F must declare readiness for AG71G.");
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
if (manifest.current_counts.ag71f_pilot_safe_output_rendering_closure_records !== 1) {
  fail("Manifest must record AG71F closure count.");
}

pass("AG71F pilot-safe output rendering closure is valid.");
pass("Star/Panchang pilot-safe preview behaviour is closed.");
pass("No public/runtime/backend/Supabase/full-bank activation performed.");
