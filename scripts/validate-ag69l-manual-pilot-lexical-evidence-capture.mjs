import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69L validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69l-manual-pilot-lexical-evidence-capture.mjs",
  "scripts/validate-ag69l-manual-pilot-lexical-evidence-capture.mjs",
  "data/knowledge-base/word-of-day/ag69l-manual-pilot-lexical-evidence-capture-record.json",
  "data/knowledge-base/word-of-day/ag69l-normalized-pilot-evidence-records.json",
  "data/knowledge-base/word-of-day/ag69l-pilot-evidence-quality-gate-result.json",
  "data/knowledge-base/word-of-day/ag69l-source-use-copyright-safety-audit.json",
  "data/knowledge-base/word-of-day/ag69l-no-word-record-attachment-audit.json",
  "data/knowledge-base/word-of-day/ag69l-no-source-promotion-audit.json",
  "data/knowledge-base/word-of-day/ag69l-no-generated-word-or-ui-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag69l-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69l-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69l-ag69m-pilot-evidence-attachment-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69l-to-ag69m-pilot-evidence-attachment-boundary.json",
  "data/content-intelligence/quality-reviews/ag69l-manual-pilot-lexical-evidence-capture.json",
  "data/quality/ag69l-manual-pilot-lexical-evidence-capture.json",
  "data/quality/ag69l-manual-pilot-lexical-evidence-capture-preview.json",
  "docs/quality/AG69L_MANUAL_PILOT_LEXICAL_EVIDENCE_CAPTURE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69l"]) fail("Missing generate:ag69l script.");
if (!pkg.scripts?.["validate:ag69l"]) fail("Missing validate:ag69l script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69l")) fail("validate:project must include validate:ag69l.");

const review = readJson("data/content-intelligence/quality-reviews/ag69l-manual-pilot-lexical-evidence-capture.json");
if (review.status !== "ag69l_manual_pilot_lexical_evidence_capture_completed") fail("Review status mismatch.");

for (const key of [
  "ag69k_consumed",
  "manual_pilot_lexical_evidence_captured",
  "normalized_evidence_records_created",
  "source_access_checked_for_all_records",
  "reuse_note_checked_for_all_records",
  "quality_gate_passed_for_capture",
  "ready_for_ag69m"
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

if (review.summary.evidence_capture_count !== 3) fail("Evidence capture count must be 3.");
if (review.summary.attachment_candidate_count_for_ag69m !== 3) fail("Attachment candidate count must be 3.");
if (review.summary.source_evidence_attached_to_word_records_count !== 0) fail("No evidence may be attached to word records.");
if (review.summary.source_reference_ids_attached_to_word_records_count !== 0) fail("No source refs may be attached to word records.");
if (review.summary.source_promoted_count !== 0) fail("No source may be promoted.");

const capture = readJson("data/knowledge-base/word-of-day/ag69l-manual-pilot-lexical-evidence-capture-record.json");
if (capture.status !== "manual_pilot_lexical_evidence_captured_no_attachment") fail("Capture status mismatch.");
if (capture.evidence_capture_count !== 3) fail("Capture evidence count must be 3.");
if (capture.source_evidence_attached_to_word_records_count !== 0) fail("Capture must not attach evidence.");
if (capture.public_output_allowed !== false) fail("Capture public output must be false.");
for (const record of capture.evidence_capture_records) {
  if (record.word_form_found_status !== "found") fail("Each pilot word form must be found.");
  if (record.meaning_supported_status !== "supported") fail("Each pilot meaning must be supported.");
  if (record.transliteration_supported_status !== "supported") fail("Each pilot transliteration must be supported.");
  if (record.source_access_checked !== true) fail("Source access must be checked.");
  if (record.reuse_note_checked !== true) fail("Reuse note must be checked.");
  if (record.internal_textual_discipline_check !== "passed") fail("Internal textual discipline must pass.");
  if (record.evidence_capture_status !== "captured_not_attached") fail("Evidence must be captured but not attached.");
  if (record.public_output_allowed !== false) fail("Public output must be false.");
  if (!record.unsupported_claims_blocked.includes("scriptural_claim")) fail("Scriptural claim blocker missing.");
}

const normalized = readJson("data/knowledge-base/word-of-day/ag69l-normalized-pilot-evidence-records.json");
if (normalized.record_count !== 3) fail("Normalized record count must be 3.");
for (const record of normalized.normalized_records) {
  if (record.attachment_candidate_for_ag69m !== true) fail("Each record must be an AG69M attachment candidate.");
  if (record.public_output_allowed !== false) fail("Normalized public output must be false.");
}

const quality = readJson("data/knowledge-base/word-of-day/ag69l-pilot-evidence-quality-gate-result.json");
if (quality.gate_passed_for_capture !== true) fail("Capture gate must pass.");
if (quality.gate_passed_for_word_record_attachment_now !== false) fail("Attachment gate must be false now.");
if (quality.captured_record_count !== 3) fail("Captured record count must be 3.");
if (quality.attachment_candidate_count_for_ag69m !== 3) fail("Attachment candidate count must be 3.");
if (quality.reviewed_record_count !== 0 || quality.approved_record_count !== 0) fail("Reviewed/approved record counts must be 0.");

const sourceAudit = readJson("data/knowledge-base/word-of-day/ag69l-source-use-copyright-safety-audit.json");
if (sourceAudit.audit_passed !== true) fail("Source use audit must pass.");
if (sourceAudit.source_content_ingested !== false) fail("Source content must not be ingested.");
if (sourceAudit.bulk_dictionary_text_stored !== false) fail("Bulk dictionary text must not be stored.");
if (sourceAudit.short_evidence_notes_only !== true) fail("Only short evidence notes may be stored.");

const attachment = readJson("data/knowledge-base/word-of-day/ag69l-no-word-record-attachment-audit.json");
if (attachment.audit_passed !== true) fail("Attachment block audit must pass.");
if (attachment.source_evidence_attached_to_word_records_count !== 0) fail("No evidence may be attached.");
if (attachment.reviewed_records_created !== false || attachment.approved_records_created !== false) fail("Reviewed/approved must remain false.");

const sourcePromotion = readJson("data/knowledge-base/word-of-day/ag69l-no-source-promotion-audit.json");
if (sourcePromotion.audit_passed !== true) fail("Source promotion audit must pass.");
if (sourcePromotion.source_promoted_count !== 0) fail("No source may be promoted.");
if (sourcePromotion.approved_source_created !== false) fail("No approved source may be created.");

const mutation = readJson("data/knowledge-base/word-of-day/ag69l-no-generated-word-or-ui-mutation-audit.json");
if (mutation.audit_passed !== true) fail("Mutation audit must pass.");
if (mutation.failed_checks.length !== 0) fail("Mutation audit failed_checks must be empty.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69l-ag69m-pilot-evidence-attachment-readiness-record.json");
if (readiness.ready_for_ag69m !== true) fail("AG69M readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69l-to-ag69m-pilot-evidence-attachment-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocked of [
  "bulk dictionary/book content ingestion",
  "source promotion to approved_source",
  "reviewed word bank creation",
  "approved word bank creation",
  "public word output generation",
  "generated/word-of-day.json replacement",
  "active tithi/vara word selection",
  "Panchang value generation",
  "UI display change",
  "new Word of the Day card creation",
  "Supabase/database writes",
  "V02 expansion"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocked)) fail(`Boundary blocker missing: ${blocked}`);
}

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag69l-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69l-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69L manual pilot lexical evidence capture is present.");
pass("Three pilot evidence records are captured and normalized.");
pass("Source access/reuse checks are recorded with short notes only.");
pass("No word-record attachment, source promotion, reviewed/approved bank, generated-word replacement or UI mutation is recorded.");
pass("No Tithi/Vara activation, Panchang generation, backend/database/V02 activation is recorded.");
