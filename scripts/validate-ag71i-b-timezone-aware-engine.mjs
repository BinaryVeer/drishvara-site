import fs from "node:fs";
import path from "node:path";
import {
  timezoneOffsetMinutes,
  astronomicalState,
  computeInternalPanchangRecord,
  validateComputedRecord
} from "./lib/panchang-internal-dry-run-engine.mjs";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71I-B validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "scripts/lib/panchang-internal-dry-run-engine.mjs",
  "data/knowledge-base/panchang-festival/production/ag71i-b-timezone-aware-engine-record.json",
  "data/content-intelligence/quality-reviews/ag71i-b-timezone-aware-engine.json",
  "data/quality/ag71i-b-timezone-aware-engine.json",
  "data/quality/ag71i-b-timezone-aware-engine-preview.json",
  "docs/quality/AG71I_B_TIMEZONE_AWARE_ENGINE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const engine = fs.readFileSync(full("scripts/lib/panchang-internal-dry-run-engine.mjs"), "utf8");

for (const marker of [
  "export function timezoneOffsetMinutes",
  "export function solarLongitudeTropical",
  "export function lunarLongitudeTropical",
  "export function ayanamsaLahiriApprox",
  "export function astronomicalState",
  "export function findBoundary",
  "export function computeInternalPanchangRecord",
  "export function validateComputedRecord",
  "\"Asia/Kolkata\": 330",
  "\"Asia/Tokyo\": 540"
]) {
  if (!engine.includes(marker)) fail(`Engine missing marker: ${marker}`);
}

if (timezoneOffsetMinutes("Asia/Kolkata") !== 330) fail("Asia/Kolkata offset mismatch.");
if (timezoneOffsetMinutes("Asia/Tokyo") !== 540) fail("Asia/Tokyo offset mismatch.");

let unsupportedRejected = false;
try {
  timezoneOffsetMinutes("Europe/London");
} catch {
  unsupportedRejected = true;
}
if (!unsupportedRejected) fail("Unsupported timezone must be rejected.");

const state = astronomicalState(Date.UTC(2026, 0, 1, 0, 0, 0));
if (!state.tithi || state.tithi.index < 1 || state.tithi.index > 30) fail("Smoke astronomical state tithi invalid.");
if (!state.nakshatra || state.nakshatra.index < 1 || state.nakshatra.index > 27) fail("Smoke astronomical state nakshatra invalid.");
if (!state.yoga || state.yoga.index < 1 || state.yoga.index > 27) fail("Smoke astronomical state yoga invalid.");

const smokeRecord = computeInternalPanchangRecord({
  request_id: "ag71i_b_smoke_request_not_written",
  date_key: "2026-01-01",
  location_id: "loc_jp_tokyo_capital_001",
  display_label: "Tokyo",
  latitude_decimal: 35.6762,
  longitude_decimal: 139.6503,
  timezone: "Asia/Tokyo",
  calculation_model_id: "drishvara_internal_panchang_model_v1",
  ayanamsa_id: "ayanamsa_lahiri_chitrapaksha_internal_v1"
}, { generatedAt: "AG71I-B validation smoke only" });

const smokeIssues = validateComputedRecord(smokeRecord);
if (smokeIssues.length) fail(`Smoke computed record validation failed: ${smokeIssues.join(", ")}`);
if (smokeRecord.public_output_allowed !== false) fail("Smoke record must remain public-blocked.");
if (smokeRecord.ui_output_allowed !== false) fail("Smoke record must remain UI-blocked.");
if (smokeRecord.timezone_offset_minutes !== 540) fail("Smoke Tokyo timezone offset mismatch.");

const record = readJson("data/knowledge-base/panchang-festival/production/ag71i-b-timezone-aware-engine-record.json");
if (record.status !== "ag71i_b_timezone_aware_engine_created") fail("Record status mismatch.");

for (const key of [
  "four_location_request_bank_executed",
  "computed_panchang_bank_written",
  "public_output_activated",
  "ui_exact_values_wired",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (record.execution_boundary[key] !== false) fail(`${key} must be false.`);
}

pass("AG71I-B timezone-aware engine is valid.");
pass("Engine exports and pilot timezone offsets are valid.");
pass("No AG71H request-bank execution or public output performed.");
