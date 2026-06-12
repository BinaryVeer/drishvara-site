import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG73B validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "data/methodology/star-reflection/ag73a-star-reflection-birth-time-input-surface.json",
  "data/methodology/star-reflection/ag73b-birth-time-aware-star-reflection-contract.json",
  "data/methodology/star-reflection/ag73b-birth-time-aware-request-schema.json",
  "data/methodology/star-reflection/ag73b-birth-time-precision-policy.json",
  "data/methodology/star-reflection/ag73b-birth-time-aware-basis-resolver-contract.json",
  "data/methodology/star-reflection/ag73b-birth-time-no-storage-contract-audit.json",
  "data/content-intelligence/quality-registry/ag73b-ag73c-birth-time-aware-output-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag73b-to-ag73c-birth-time-aware-output-bank-boundary.json",
  "data/content-intelligence/quality-reviews/ag73b-birth-time-aware-star-reflection-contract.json",
  "data/quality/ag73b-birth-time-aware-star-reflection-contract.json",
  "data/quality/ag73b-birth-time-aware-star-reflection-contract-preview.json",
  "docs/quality/AG73B_BIRTH_TIME_AWARE_STAR_REFLECTION_CONTRACT.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const index = fs.readFileSync(full("index.html"), "utf8");
for (const marker of [
  'id="star-reflection-birth-time"',
  'placeholder="HH:MM"',
  'id="star-birth-time-unknown"',
  "normaliseBirthTime",
  "Birth-time basis"
]) {
  if (!index.includes(marker)) fail(`index.html missing birth-time marker: ${marker}`);
}

const contract = readJson("data/methodology/star-reflection/ag73b-birth-time-aware-star-reflection-contract.json");
if (contract.status !== "ag73b_birth_time_aware_contract_created") fail("AG73B contract status mismatch.");
if (!contract.basis_contract.active_basis.includes("birth_time")) fail("AG73B contract must include birth_time active basis.");
if (contract.activation_position.storage_state !== "disabled") fail("Storage must remain disabled.");

const schema = readJson("data/methodology/star-reflection/ag73b-birth-time-aware-request-schema.json");
if (schema.status !== "ag73b_birth_time_aware_request_schema_created") fail("AG73B schema status mismatch.");
if (schema.birth_time_basis.format !== "HH:MM") fail("AG73B schema must define HH:MM birth time.");
if (schema.birth_time_basis.stored !== false) fail("AG73B schema must keep birth time unstored.");

const audit = readJson("data/methodology/star-reflection/ag73b-birth-time-no-storage-contract-audit.json");
if (audit.status !== "ag73b_birth_time_no_storage_contract_audit_passed") fail("AG73B no-storage audit status mismatch.");
for (const [key, value] of Object.entries(audit.checks || {})) {
  if (value !== false) fail(`No-storage audit check must remain false: ${key}`);
}

const manifest = readJson("data/methodology/star-reflection/star-reflection-method-manifest.json");
const allowed = [
  "ag73b_birth_time_aware_contract_created_ag73c_ready",
  "ag73c_birth_time_aware_output_bank_created_ag73d_ready",
  "ag73d_star_reflection_active_result_wiring_applied_ag73e_ready",
  "ag73e_star_reflection_active_result_qa_closed"
];

if (!allowed.includes(manifest.current_status)) {
  fail(`Manifest is not AG73B-compatible: ${manifest.current_status}`);
}

pass("AG73B birth-time-aware contract is valid.");
pass("DOB + birth time + birth place + timezone basis is formalised.");
pass("No birth-time storage/backend/Supabase activation is enabled.");
