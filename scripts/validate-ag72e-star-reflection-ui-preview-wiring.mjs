import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }

function fail(message) {
  console.error(`❌ AG72E validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "index.html",
  "generated/star-reflection-pilot-preview-data.json",
  "data/methodology/star-reflection/ag72e-star-reflection-ui-preview-wiring-record.json",
  "data/methodology/star-reflection/ag72e-star-reflection-ui-preview-validation-report.json",
  "data/methodology/star-reflection/ag72e-no-personal-data-storage-audit.json",
  "data/content-intelligence/quality-registry/ag72e-ag72f-star-reflection-public-pilot-qa-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag72e-to-ag72f-star-reflection-public-pilot-qa-boundary.json",
  "data/content-intelligence/quality-reviews/ag72e-star-reflection-ui-preview-wiring.json",
  "data/quality/ag72e-star-reflection-ui-preview-wiring.json",
  "data/quality/ag72e-star-reflection-ui-preview-wiring-preview.json",
  "docs/quality/AG72E_STAR_REFLECTION_UI_PREVIEW_WIRING.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const index = fs.readFileSync(full("index.html"), "utf8");

for (const marker of [
  "AG72E_STAR_REFLECTION_UI_PREVIEW_WIRING_STYLE_START",
  "AG72E_STAR_REFLECTION_UI_PREVIEW_WIRING_CONTROLLER_START",
  "generated/star-reflection-pilot-preview-data.json",
  "window.drishvaraAg72ePreviewStarReflection",
  'data-ag71e-preview-button="star-reflection"',
  'data-ag71e-preview-panel="star-reflection"',
  'data-ag71e-preview-grid="star-reflection"'
]) {
  if (!index.includes(marker)) fail(`index.html missing AG72E marker: ${marker}`);
}

for (const forbidden of [
  "You will definitely",
  "This proves that you are",
  "Your future is",
  "You are destined",
  "guaranteed future",
  "medical advice",
  "financial advice",
  "legal advice"
]) {
  if (index.includes(forbidden)) fail(`index.html contains blocked deterministic/sensitive phrase: ${forbidden}`);
}

const pilot = readJson("generated/star-reflection-pilot-preview-data.json");
if (pilot.status !== "ag72e_star_reflection_pilot_preview_data_created") fail("Pilot preview data status mismatch.");
if (!Array.isArray(pilot.records) || pilot.records.length !== 5) fail("Pilot preview data must contain 5 safe records.");

const wiring = readJson("data/methodology/star-reflection/ag72e-star-reflection-ui-preview-wiring-record.json");
if (wiring.status !== "ag72e_star_reflection_ui_preview_wiring_applied") fail("AG72E wiring record status mismatch.");
if (wiring.implementation_summary.personal_data_storage_enabled !== false) fail("Personal data storage must remain false.");
if (wiring.implementation_summary.deterministic_prediction_enabled !== false) fail("Deterministic prediction must remain false.");
if (wiring.implementation_summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (wiring.implementation_summary.supabase_activation_performed !== false) fail("Supabase activation must remain false.");

const audit = readJson("data/methodology/star-reflection/ag72e-no-personal-data-storage-audit.json");
if (audit.status !== "ag72e_no_personal_data_storage_audit_passed") fail("No personal data storage audit status mismatch.");

for (const [key, value] of Object.entries(audit.checks || {})) {
  if (value !== false) fail(`No personal data audit check must remain false: ${key}`);
}

const manifest = readJson("data/methodology/star-reflection/star-reflection-method-manifest.json");
if (manifest.current_status !== "ag72e_star_reflection_ui_preview_wiring_applied_ag72f_ready") fail("Star Reflection manifest AG72E status mismatch.");
if (manifest.current_counts.ag72e_safe_preview_records !== 5) fail("Manifest must record 5 AG72E safe preview records.");

pass("AG72E Star Reflection UI preview wiring is valid.");
pass("Existing preview panel is wired with safe reflective output.");
pass("AG72F public pilot QA is ready.");
