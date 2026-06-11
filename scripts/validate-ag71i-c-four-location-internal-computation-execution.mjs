import fs from "node:fs";
import path from "node:path";
import { validateComputedRecord } from "./lib/panchang-internal-dry-run-engine.mjs";

const root = process.cwd();

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(full(p), "utf8"));
}

function fail(message) {
  console.error(`❌ AG71I-C validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "scripts/generate-ag71i-c-four-location-internal-computation-execution.mjs",
  "scripts/validate-ag71i-c-four-location-internal-computation-execution.mjs",
  "data/knowledge-base/panchang-festival/production/ag71i-c-four-location-computed-panchang-bank-internal.json",
  "data/knowledge-base/panchang-festival/production/ag71i-c-internal-computation-execution-record.json",
  "data/knowledge-base/panchang-festival/production/ag71i-c-computed-bank-validation-smoke-report.json",
  "data/knowledge-base/panchang-festival/production/ag71i-c-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag71i-c-four-location-internal-computation-execution.json",
  "data/quality/ag71i-c-four-location-internal-computation-execution.json",
  "data/quality/ag71i-c-four-location-internal-computation-execution-preview.json",
  "data/content-intelligence/quality-registry/ag71i-c-ag71j-computed-bank-validation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag71i-c-to-ag71j-computed-bank-validation-boundary.json",
  "docs/quality/AG71I_C_FOUR_LOCATION_INTERNAL_COMPUTATION_EXECUTION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const bank = readJson("data/knowledge-base/panchang-festival/production/ag71i-c-four-location-computed-panchang-bank-internal.json");
const execution = readJson("data/knowledge-base/panchang-festival/production/ag71i-c-internal-computation-execution-record.json");
const smoke = readJson("data/knowledge-base/panchang-festival/production/ag71i-c-computed-bank-validation-smoke-report.json");
const audit = readJson("data/knowledge-base/panchang-festival/production/ag71i-c-no-public-output-audit.json");

if (bank.status !== "ag71i_c_four_location_internal_computed_bank_created_public_blocked") fail("Computed bank status mismatch.");
if (bank.computed_record_count !== 28) fail("Computed bank must contain 28 records.");
if (bank.records.length !== 28) fail("Computed bank records length must be 28.");
if (bank.validation_issue_count !== 0) fail("Computed bank validation issue count must be zero.");
if (smoke.issue_count !== 0) fail("Smoke validation issue count must be zero.");
if (execution.status !== "ag71i_c_internal_computation_execution_completed") fail("Execution status mismatch.");

const requiredLocationIds = [
  "loc_in_ar_itanagar_capital_complex_001",
  "loc_in_dl_new_delhi_capital_001",
  "loc_in_jh_ranchi_city_001",
  "loc_jp_tokyo_capital_001"
];

const byLocation = new Map();
for (const record of bank.records) {
  byLocation.set(record.location_id, (byLocation.get(record.location_id) || 0) + 1);

  const issues = validateComputedRecord(record);
  if (issues.length) fail(`${record.panchang_daily_record_id} has validation issues: ${issues.join(", ")}`);

  if (record.public_output_allowed !== false) fail(`${record.panchang_daily_record_id} public output must be false.`);
  if (record.ui_output_allowed !== false) fail(`${record.panchang_daily_record_id} UI output must be false.`);
  if (record.external_panchang_source_used !== false) fail(`${record.panchang_daily_record_id} external source flag must be false.`);

  if (record.timezone === "Asia/Kolkata" && record.timezone_offset_minutes !== 330) {
    fail(`${record.panchang_daily_record_id} Kolkata offset mismatch.`);
  }

  if (record.timezone === "Asia/Tokyo" && record.timezone_offset_minutes !== 540) {
    fail(`${record.panchang_daily_record_id} Tokyo offset mismatch.`);
  }
}

for (const id of requiredLocationIds) {
  if (byLocation.get(id) !== 7) fail(`Location ${id} must have 7 records.`);
}

for (const key of [
  "index_html_modified_for_exact_panchang_values",
  "generated_panchang_festival_public_file_modified",
  "public_runtime_activation_performed",
  "ui_exact_value_output_allowed_now",
  "backend_runtime_activated",
  "supabase_activation_performed",
  "external_panchang_source_used"
]) {
  if (audit.checks[key] !== false) fail(`${key} must be false.`);
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
if (manifest.current_counts.ag71i_c_computed_record_count !== 28) {
  fail("Manifest must record 28 AG71I-C computed records.");
}
if (manifest.current_counts.ag71i_c_validation_issue_count !== 0) {
  fail("Manifest must record zero AG71I-C validation issues.");
}

pass("AG71I-C internal computation execution is valid.");
pass("28 public-blocked computed records are present.");
pass("Each pilot location has 7 computed records.");
pass("No public/UI/backend/Supabase/external-source activation performed.");
