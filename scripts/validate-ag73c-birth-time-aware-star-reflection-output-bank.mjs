import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG73C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/methodology/star-reflection/ag73b-birth-time-aware-star-reflection-contract.json",
  "data/methodology/star-reflection/ag73c-birth-time-aware-star-reflection-output-bank.json",
  "generated/star-reflection-active-result-data.json",
  "data/methodology/star-reflection/ag73c-birth-time-aware-output-bank-validation-report.json",
  "data/methodology/star-reflection/ag73c-active-result-no-storage-audit.json",
  "data/content-intelligence/quality-registry/ag73c-ag73d-star-reflection-active-result-wiring-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag73c-to-ag73d-star-reflection-active-result-wiring-boundary.json",
  "data/content-intelligence/quality-reviews/ag73c-birth-time-aware-star-reflection-output-bank.json",
  "data/quality/ag73c-birth-time-aware-star-reflection-output-bank.json",
  "data/quality/ag73c-birth-time-aware-star-reflection-output-bank-preview.json",
  "docs/quality/AG73C_BIRTH_TIME_AWARE_STAR_REFLECTION_OUTPUT_BANK.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const bank = readJson("data/methodology/star-reflection/ag73c-birth-time-aware-star-reflection-output-bank.json");
if (bank.status !== "ag73c_birth_time_aware_output_bank_created") fail("AG73C output bank status mismatch.");
if (!Array.isArray(bank.records) || bank.records.length < 6) fail("AG73C output bank must contain at least 6 records.");

const precisionModes = new Set(bank.records.map(r => r.birth_time_precision));
for (const mode of ["exact_session_only", "unknown", "pending_or_invalid"]) {
  if (!precisionModes.has(mode)) fail(`AG73C missing precision mode: ${mode}`);
}

const activeData = readJson("generated/star-reflection-active-result-data.json");
if (activeData.status !== "ag73c_star_reflection_active_result_data_created") fail("AG73C active result data status mismatch.");
if (activeData.scope.personal_data_storage !== false) fail("Active result data must keep personal_data_storage false.");
if (activeData.scope.backend_runtime_active !== false) fail("Backend runtime must remain false.");
if (activeData.scope.supabase_active !== false) fail("Supabase must remain false.");
if (activeData.scope.deterministic_prediction !== false) fail("Deterministic prediction must remain false.");

const validation = readJson("data/methodology/star-reflection/ag73c-birth-time-aware-output-bank-validation-report.json");
if (validation.status !== "ag73c_output_bank_validation_passed") fail("AG73C validation report status mismatch.");
if (validation.issue_count !== 0) fail("AG73C validation issue count must be zero.");

const audit = readJson("data/methodology/star-reflection/ag73c-active-result-no-storage-audit.json");
if (audit.status !== "ag73c_active_result_no_storage_audit_passed") fail("AG73C no-storage audit status mismatch.");
for (const [key, value] of Object.entries(audit.checks || {})) {
  if (value !== false) fail(`No-storage audit check must remain false: ${key}`);
}

const manifest = readJson("data/methodology/star-reflection/star-reflection-method-manifest.json");
const allowed = [
  "ag73c_birth_time_aware_output_bank_created_ag73d_ready",
  "ag73d_star_reflection_active_result_wiring_applied_ag73e_ready",
  "ag73e_star_reflection_active_result_qa_closed"
];

if (!allowed.includes(manifest.current_status)) {
  fail(`Manifest is not AG73C-compatible: ${manifest.current_status}`);
}

pass("AG73C birth-time-aware output bank is valid.");
pass("Exact, unknown and pending/invalid birth-time modes are present.");
pass("Active result data is ready for AG73D UI wiring.");
