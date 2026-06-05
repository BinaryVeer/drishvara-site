import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69N validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69n-reviewed-word-bank-pilot-gate.mjs",
  "scripts/validate-ag69n-reviewed-word-bank-pilot-gate.mjs",
  "data/knowledge-base/word-of-day/ag69n-reviewed-word-bank-pilot.json",
  "data/knowledge-base/word-of-day/ag69n-reviewed-bank-pilot-gate-result.json",
  "data/knowledge-base/word-of-day/ag69n-reviewed-bank-pilot-map.json",
  "data/knowledge-base/word-of-day/ag69n-public-output-block-audit.json",
  "data/knowledge-base/word-of-day/ag69n-no-approved-bank-audit.json",
  "data/knowledge-base/word-of-day/ag69n-no-source-promotion-audit.json",
  "data/knowledge-base/word-of-day/ag69n-no-generated-word-or-ui-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag69n-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69n-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69n-ag69o-approved-word-bank-pilot-gate-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69n-to-ag69o-approved-word-bank-pilot-gate-boundary.json",
  "data/content-intelligence/quality-reviews/ag69n-reviewed-word-bank-pilot-gate.json",
  "data/quality/ag69n-reviewed-word-bank-pilot-gate.json",
  "data/quality/ag69n-reviewed-word-bank-pilot-gate-preview.json",
  "docs/quality/AG69N_REVIEWED_WORD_BANK_PILOT_GATE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69n"]) fail("Missing generate:ag69n script.");
if (!pkg.scripts?.["validate:ag69n"]) fail("Missing validate:ag69n script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69n")) fail("validate:project must include validate:ag69n.");

const review = readJson("data/content-intelligence/quality-reviews/ag69n-reviewed-word-bank-pilot-gate.json");
if (review.status !== "ag69n_reviewed_word_bank_pilot_gate_completed") fail("Review status mismatch.");

for (const key of [
  "ag69m_consumed",
  "reviewed_bank_pilot_created",
  "all_records_have_evidence_id",
  "all_records_have_source_reference_id",
  "all_source_access_checked",
  "all_reuse_note_checked",
  "all_internal_textual_discipline_passed",
  "all_public_output_blocked",
  "ready_for_ag69o"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "approved_records_created",
  "approved_bank_created",
  "public_output_from_word_records_allowed",
  "source_content_ingested",
  "bulk_copyrighted_ingestion",
  "generated_word_json_modified",
  "ui_display_changed",
  "new_word_card_created",
  "active_tithi_vara_selection_started",
  "panchang_value_generation_started",
  "supabase_database_write_performed",
  "backend_runtime_activated",
  "database_runtime_activated",
  "service_role_used",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

if (review.summary.reviewed_record_count !== 3) fail("Reviewed record count must be 3.");
if (review.summary.approved_record_count !== 0) fail("Approved record count must be 0.");
if (review.summary.approved_bank_candidate_count_for_ag69o !== 3) fail("Approved-bank candidate count must be 3.");
if (review.summary.source_promoted_count !== 0) fail("Source promoted count must be 0.");

const bank = readJson("data/knowledge-base/word-of-day/ag69n-reviewed-word-bank-pilot.json");
if (bank.status !== "reviewed_word_bank_pilot_created_public_output_blocked") fail("Reviewed bank status mismatch.");
if (bank.reviewed_record_count !== 3) fail("Reviewed bank must contain 3 records.");
if (bank.approved_record_count !== 0) fail("Approved record count must be 0.");
if (bank.public_output_allowed !== false) fail("Reviewed bank public output must be false.");

for (const record of bank.reviewed_records) {
  if (record.review_gate_status !== "reviewed_bank_gate_passed") fail("Review gate status mismatch.");
  if (record.review_status_after_ag69n !== "reviewed") fail("Review status must be reviewed.");
  if (!record.evidence_id || !record.source_reference_id) fail("Evidence/source refs required.");
  if (!Array.isArray(record.source_reference_ids) || record.source_reference_ids.length !== 1) fail("Each reviewed record must preserve one source ref.");
  if (record.source_access_checked !== true) fail("Source access must be checked.");
  if (record.reuse_note_checked !== true) fail("Reuse note must be checked.");
  if (record.internal_textual_discipline_check !== "passed") fail("Internal textual discipline must pass.");
  if (record.public_output_allowed !== false) fail("Public output must remain false.");
  if (record.approved_bank_eligible_for_ag69o !== true) fail("Record must be AG69O candidate.");
  if (record.runtime_selection_eligible_now !== false) fail("Record must not be runtime eligible now.");
}

const gate = readJson("data/knowledge-base/word-of-day/ag69n-reviewed-bank-pilot-gate-result.json");
if (gate.gate_passed !== true) fail("Reviewed gate must pass.");
if (gate.reviewed_record_count_created !== 3) fail("Reviewed gate count must be 3.");
if (gate.approved_record_count_created !== 0) fail("Approved count must be 0.");
if (gate.approved_bank_candidate_count_for_ag69o !== 3) fail("AG69O candidate count must be 3.");
if (gate.generated_word_json_modified !== false || gate.ui_display_changed !== false) fail("Generated/UI mutation must be false.");

const map = readJson("data/knowledge-base/word-of-day/ag69n-reviewed-bank-pilot-map.json");
if (map.mapping_count !== 3) fail("Reviewed map count must be 3.");
for (const mapping of map.mappings) {
  if (mapping.review_status_after_ag69n !== "reviewed") fail("Mapping review status must be reviewed.");
  if (mapping.approved_bank_eligible_for_ag69o !== true) fail("Mapping must be AG69O candidate.");
  if (mapping.public_output_allowed !== false) fail("Mapping public output must be false.");
}

const publicBlock = readJson("data/knowledge-base/word-of-day/ag69n-public-output-block-audit.json");
if (publicBlock.audit_passed !== true) fail("Public block audit must pass.");
if (publicBlock.public_output_from_word_records_allowed !== false) fail("Public output must remain blocked.");
if (publicBlock.runtime_selection_eligible_now_count !== 0) fail("Runtime selection eligibility must be 0.");

const approvedBlock = readJson("data/knowledge-base/word-of-day/ag69n-no-approved-bank-audit.json");
if (approvedBlock.audit_passed !== true) fail("Approved bank block audit must pass.");
if (approvedBlock.reviewed_records_created !== true) fail("Reviewed records must be created in AG69N.");
if (approvedBlock.approved_records_created !== false) fail("Approved records must not be created.");
if (approvedBlock.approved_record_count !== 0) fail("Approved count must be 0.");

const sourceBlock = readJson("data/knowledge-base/word-of-day/ag69n-no-source-promotion-audit.json");
if (sourceBlock.audit_passed !== true) fail("Source promotion block must pass.");
if (sourceBlock.source_promoted_count !== 0) fail("No source may be promoted.");
if (sourceBlock.approved_source_created !== false) fail("No approved source may be created.");

const mutation = readJson("data/knowledge-base/word-of-day/ag69n-no-generated-word-or-ui-mutation-audit.json");
if (mutation.audit_passed !== true) fail("Mutation audit must pass.");
if (mutation.failed_checks.length !== 0) fail("Mutation audit failed_checks must be empty.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69n-ag69o-approved-word-bank-pilot-gate-readiness-record.json");
if (readiness.ready_for_ag69o !== true) fail("AG69O readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69n-to-ag69o-approved-word-bank-pilot-gate-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocked of [
  "public word output generation",
  "generated/word-of-day.json replacement",
  "active tithi/vara word selection",
  "Panchang value generation",
  "UI display change",
  "new Word of the Day card creation",
  "source promotion to approved_source",
  "Supabase/database writes",
  "V02 expansion"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocked)) fail(`Boundary blocker missing: ${blocked}`);
}

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag69n-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69n-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69N reviewed word bank pilot gate is present.");
pass("Three reviewed pilot records are created with public output blocked.");
pass("Approved-bank candidates are ready for AG69O.");
pass("No approved bank, source promotion, generated-word replacement or UI mutation is recorded.");
pass("No Tithi/Vara activation, Panchang generation, backend/database/V02 activation is recorded.");
