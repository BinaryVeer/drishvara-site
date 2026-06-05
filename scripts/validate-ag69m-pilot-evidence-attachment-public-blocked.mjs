import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69M validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69m-pilot-evidence-attachment-public-blocked.mjs",
  "scripts/validate-ag69m-pilot-evidence-attachment-public-blocked.mjs",
  "data/knowledge-base/word-of-day/ag69m-evidence-attached-pilot-word-records.json",
  "data/knowledge-base/word-of-day/ag69m-pilot-evidence-attachment-map.json",
  "data/knowledge-base/word-of-day/ag69m-pilot-evidence-attachment-gate-result.json",
  "data/knowledge-base/word-of-day/ag69m-public-output-block-audit.json",
  "data/knowledge-base/word-of-day/ag69m-no-reviewed-approved-bank-audit.json",
  "data/knowledge-base/word-of-day/ag69m-no-source-promotion-audit.json",
  "data/knowledge-base/word-of-day/ag69m-no-generated-word-or-ui-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag69m-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69m-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69m-ag69n-reviewed-word-bank-pilot-gate-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69m-to-ag69n-reviewed-word-bank-pilot-gate-boundary.json",
  "data/content-intelligence/quality-reviews/ag69m-pilot-evidence-attachment-public-blocked.json",
  "data/quality/ag69m-pilot-evidence-attachment-public-blocked.json",
  "data/quality/ag69m-pilot-evidence-attachment-public-blocked-preview.json",
  "docs/quality/AG69M_PILOT_EVIDENCE_ATTACHMENT_PUBLIC_BLOCKED.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69m"]) fail("Missing generate:ag69m script.");
if (!pkg.scripts?.["validate:ag69m"]) fail("Missing validate:ag69m script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69m")) fail("validate:project must include validate:ag69m.");

const review = readJson("data/content-intelligence/quality-reviews/ag69m-pilot-evidence-attachment-public-blocked.json");
if (review.status !== "ag69m_pilot_evidence_attachment_public_blocked_completed") fail("Review status mismatch.");

for (const key of [
  "ag69l_consumed",
  "pilot_evidence_attached_to_records",
  "all_source_access_checked",
  "all_reuse_note_checked",
  "all_internal_textual_discipline_passed",
  "all_public_output_blocked",
  "ready_for_ag69n"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "reviewed_records_created",
  "approved_records_created",
  "reviewed_bank_created",
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

if (review.summary.attached_record_count !== 3) fail("Attached record count must be 3.");
if (review.summary.source_reference_ids_attached_to_word_records_count !== 3) fail("Source reference attachment count must be 3.");
if (review.summary.reviewed_bank_candidate_count_for_ag69n !== 3) fail("Reviewed-bank candidate count must be 3.");
if (review.summary.source_promoted_count !== 0) fail("Source promoted count must be 0.");

const attached = readJson("data/knowledge-base/word-of-day/ag69m-evidence-attached-pilot-word-records.json");
if (attached.status !== "pilot_evidence_attached_public_output_blocked") fail("Attached records status mismatch.");
if (attached.record_count !== 3) fail("Attached records count must be 3.");
if (attached.source_reference_ids_attached_to_word_records_count !== 3) fail("Attached source ref count must be 3.");
if (attached.reviewed_records_created !== false || attached.approved_records_created !== false) fail("Reviewed/approved records must not be created.");
if (attached.public_output_allowed !== false) fail("Public output must be false.");

for (const record of attached.attached_records) {
  if (record.evidence_attachment_status !== "evidence_attached_public_blocked") fail("Evidence attachment status mismatch.");
  if (!record.evidence_id || !record.source_reference_id) fail("Evidence and source reference IDs are required.");
  if (!Array.isArray(record.source_reference_ids) || record.source_reference_ids.length !== 1) fail("Each record must attach exactly one source ref.");
  if (record.word_form_found_status !== "found") fail("Word form must be found.");
  if (record.meaning_supported_status !== "supported") fail("Meaning must be supported.");
  if (record.transliteration_supported_status !== "supported") fail("Transliteration must be supported.");
  if (record.internal_textual_discipline_check !== "passed") fail("Internal textual discipline must pass.");
  if (record.public_output_allowed !== false) fail("Attached record public output must be false.");
  if (record.reviewed_bank_eligible_for_ag69n !== true) fail("Record must be eligible for AG69N reviewed-bank gate.");
  if (record.approved_bank_eligible_now !== false) fail("Record must not be approved-bank eligible now.");
}

const attachmentMap = readJson("data/knowledge-base/word-of-day/ag69m-pilot-evidence-attachment-map.json");
if (attachmentMap.mapping_count !== 3) fail("Attachment mapping count must be 3.");
for (const mapping of attachmentMap.mappings) {
  if (mapping.attachment_status !== "evidence_attached_public_blocked") fail("Mapping attachment status mismatch.");
  if (mapping.public_output_allowed !== false) fail("Mapping public output must be false.");
}

const gate = readJson("data/knowledge-base/word-of-day/ag69m-pilot-evidence-attachment-gate-result.json");
if (gate.gate_passed_for_attachment !== true) fail("Attachment gate must pass.");
if (gate.attached_record_count !== 3) fail("Gate attached count must be 3.");
if (gate.reviewed_bank_candidate_count_for_ag69n !== 3) fail("Gate candidate count must be 3.");
if (gate.reviewed_records_created_now !== false || gate.approved_records_created_now !== false) fail("Gate must not create reviewed/approved records.");

const publicBlock = readJson("data/knowledge-base/word-of-day/ag69m-public-output-block-audit.json");
if (publicBlock.audit_passed !== true) fail("Public block audit must pass.");
if (publicBlock.public_output_from_word_records_allowed !== false) fail("Public output must remain blocked.");
if (publicBlock.generated_word_json_modified !== false || publicBlock.ui_display_changed !== false) fail("Generated/UI mutation must be false.");

const bankBlock = readJson("data/knowledge-base/word-of-day/ag69m-no-reviewed-approved-bank-audit.json");
if (bankBlock.audit_passed !== true) fail("No reviewed/approved bank audit must pass.");
if (bankBlock.reviewed_records_created !== false || bankBlock.approved_records_created !== false) fail("No reviewed/approved records may be created.");

const sourceBlock = readJson("data/knowledge-base/word-of-day/ag69m-no-source-promotion-audit.json");
if (sourceBlock.audit_passed !== true) fail("Source promotion block must pass.");
if (sourceBlock.source_promoted_count !== 0) fail("No source may be promoted.");
if (sourceBlock.approved_source_created !== false) fail("No approved source may be created.");

const mutation = readJson("data/knowledge-base/word-of-day/ag69m-no-generated-word-or-ui-mutation-audit.json");
if (mutation.audit_passed !== true) fail("Mutation audit must pass.");
if (mutation.failed_checks.length !== 0) fail("Mutation audit failed_checks must be empty.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69m-ag69n-reviewed-word-bank-pilot-gate-readiness-record.json");
if (readiness.ready_for_ag69n !== true) fail("AG69N readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69m-to-ag69n-reviewed-word-bank-pilot-gate-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocked of [
  "approved word bank creation",
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
  "data/content-intelligence/backend-architecture/ag69m-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69m-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69M pilot evidence attachment is present.");
pass("Three pilot word records have evidence metadata attached with public output blocked.");
pass("Reviewed-bank candidates are ready for AG69N.");
pass("No reviewed/approved bank, source promotion, generated-word replacement or UI mutation is recorded.");
pass("No Tithi/Vara activation, Panchang generation, backend/database/V02 activation is recorded.");
