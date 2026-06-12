import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG73A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "data/methodology/star-reflection/ag73a-star-reflection-birth-time-input-surface.json",
  "data/methodology/star-reflection/ag73a-star-reflection-birth-time-input-validation-report.json",
  "data/methodology/star-reflection/ag73a-birth-time-no-storage-audit.json",
  "data/content-intelligence/quality-registry/ag73a-ag73b-birth-time-aware-contract-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag73a-to-ag73b-birth-time-aware-contract-boundary.json",
  "data/content-intelligence/quality-reviews/ag73a-star-reflection-birth-time-input-surface.json",
  "data/quality/ag73a-star-reflection-birth-time-input-surface.json",
  "data/quality/ag73a-star-reflection-birth-time-input-surface-preview.json",
  "docs/quality/AG73A_STAR_REFLECTION_BIRTH_TIME_INPUT_SURFACE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const index = fs.readFileSync(full("index.html"), "utf8");

for (const marker of [
  "AG73A_STAR_REFLECTION_BIRTH_TIME_INPUT_SURFACE_START",
  "AG73A_STAR_REFLECTION_BIRTH_TIME_INPUT_SURFACE_STYLE_START",
  'id="star-reflection-birth-time"',
  'placeholder="HH:MM"',
  'id="star-birth-time-unknown"',
  "I don’t know exact birth time",
  "normaliseBirthTime",
  "syncBirthTimeUnknownState",
  "Birth-time basis",
  "No name, DOB, birth time, location or coordinate data is stored"
]) {
  if (!index.includes(marker)) fail(`index.html missing AG73A marker: ${marker}`);
}

const record = readJson("data/methodology/star-reflection/ag73a-star-reflection-birth-time-input-surface.json");
if (record.status !== "ag73a_star_reflection_birth_time_input_surface_added") fail("AG73A record status mismatch.");
if (record.input_surface.personal_data_storage_enabled !== false) fail("Birth time personal data storage must remain false.");

const audit = readJson("data/methodology/star-reflection/ag73a-birth-time-no-storage-audit.json");
if (audit.status !== "ag73a_birth_time_no_storage_audit_passed") fail("AG73A no-storage audit status mismatch.");
for (const [key, value] of Object.entries(audit.checks || {})) {
  if (value !== false) fail(`No-storage audit check must remain false: ${key}`);
}

const manifest = readJson("data/methodology/star-reflection/star-reflection-method-manifest.json");
const allowed = [
  "ag72f_star_reflection_public_pilot_static_closure_passed_browser_qa_pending",
  "ag73a_star_reflection_birth_time_input_surface_added_ag73b_ready",
  "ag73b_birth_time_aware_contract_created_ag73c_ready",
  "ag73c_birth_time_aware_output_bank_created_ag73d_ready",
  "ag73d_star_reflection_active_result_wiring_applied_ag73e_ready",
  "ag73e_star_reflection_active_result_qa_closed"
];

if (!allowed.includes(manifest.current_status)) fail(`Manifest is not AG73A-compatible: ${manifest.current_status}`);

pass("AG73A birth-time input surface is valid.");
pass("HH:MM input and unknown birth-time fallback are present.");
pass("No birth-time storage/backend/Supabase activation is enabled.");
