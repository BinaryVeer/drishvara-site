import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69J validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69j-pilot-lexical-source-addition-capture-readiness.mjs",
  "scripts/validate-ag69j-pilot-lexical-source-addition-capture-readiness.mjs",
  "data/knowledge-base/word-of-day/ag69j-pilot-lexical-source-addition-register.json",
  "data/knowledge-base/word-of-day/ag69j-pilot-source-qualification-readiness.json",
  "data/knowledge-base/word-of-day/ag69j-pilot-word-lexical-scout-record.json",
  "data/knowledge-base/word-of-day/ag69j-manual-source-capture-packet.json",
  "data/knowledge-base/word-of-day/ag69j-no-evidence-attachment-guard.json",
  "data/knowledge-base/word-of-day/ag69j-source-reuse-copyright-guard.json",
  "data/knowledge-base/word-of-day/ag69j-source-preservation-audit-no-source-promoted.json",
  "data/knowledge-base/word-of-day/ag69j-word-preservation-audit-no-record-promoted.json",
  "data/knowledge-base/word-of-day/ag69j-no-generated-word-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag69j-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69j-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69j-ag69k-pilot-evidence-attachment-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69j-to-ag69k-pilot-evidence-attachment-boundary.json",
  "data/content-intelligence/quality-reviews/ag69j-pilot-lexical-source-addition-capture-readiness.json",
  "data/quality/ag69j-pilot-lexical-source-addition-capture-readiness.json",
  "data/quality/ag69j-pilot-lexical-source-addition-capture-readiness-preview.json",
  "docs/quality/AG69J_PILOT_LEXICAL_SOURCE_ADDITION_CAPTURE_READINESS.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69j"]) fail("Missing generate:ag69j script.");
if (!pkg.scripts?.["validate:ag69j"]) fail("Missing validate:ag69j script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69j")) fail("validate:project must include validate:ag69j.");

const review = readJson("data/content-intelligence/quality-reviews/ag69j-pilot-lexical-source-addition-capture-readiness.json");
if (review.status !== "ag69j_pilot_lexical_source_addition_capture_readiness_completed") fail("Review status mismatch.");

for (const key of [
  "ag69i_consumed",
  "pilot_lexical_source_metadata_added",
  "pilot_lexical_scout_recorded",
  "manual_source_capture_packet_created",
  "source_reuse_copyright_guard_recorded",
  "ready_for_ag69k"
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

if (review.summary.added_pilot_source_count !== 3) fail("Added pilot source count must be 3.");
if (review.summary.scout_record_count !== 3) fail("Scout record count must be 3.");
if (review.summary.source_evidence_attached_count !== 0) fail("No source evidence may be attached.");
if (review.summary.source_reference_ids_attached_to_word_records_count !== 0) fail("No word source refs may be attached.");
if (review.summary.source_promoted_count !== 0) fail("No source may be promoted.");

const sourceRegister = readJson("data/knowledge-base/word-of-day/ag69j-pilot-lexical-source-addition-register.json");
if (sourceRegister.added_pilot_source_count !== 3) fail("Source register count mismatch.");
if (sourceRegister.source_promoted_count !== 0) fail("Source promoted count must be 0.");
if (sourceRegister.public_claim_allowed_count !== 0) fail("Public claim allowed count must be 0.");
if (sourceRegister.source_content_ingested !== false) fail("Source content must not be ingested.");
for (const source of sourceRegister.added_pilot_sources) {
  if (source.promoted_to_approved_source_now !== false) fail("No source may be promoted.");
  if (source.public_claim_allowed_now !== false) fail("No public claim may be allowed.");
  if (!String(source.source_url).startsWith("https://")) fail("Source URL must be https.");
}

const qualification = readJson("data/knowledge-base/word-of-day/ag69j-pilot-source-qualification-readiness.json");
if (qualification.source_promoted_count !== 0) fail("Qualification source promoted count must be 0.");
for (const item of qualification.source_qualification_result) {
  if (item.approved_source_now !== false) fail("No source may be approved.");
  if (item.public_claim_allowed_now !== false) fail("Public claim must be false.");
}

const scout = readJson("data/knowledge-base/word-of-day/ag69j-pilot-word-lexical-scout-record.json");
if (scout.evidence_attachment_performed_now !== false) fail("Scout must not attach evidence.");
if (scout.source_reference_ids_attached_to_word_records_now !== false) fail("Scout must not attach source refs.");
if (scout.scout_record_count !== 3) fail("Scout record count must be 3.");
for (const record of scout.scout_records) {
  if (record.exact_source_evidence_attached !== false) fail("Scout exact evidence must be false.");
  if (record.public_output_allowed !== false) fail("Scout public output must be false.");
}

const capture = readJson("data/knowledge-base/word-of-day/ag69j-manual-source-capture-packet.json");
if (capture.task_count !== 3) fail("Capture task count must be 3.");
if (capture.source_content_ingested !== false) fail("Capture must not ingest source content.");
if (capture.source_evidence_attached_now !== false) fail("Capture must not attach evidence.");
for (const task of capture.tasks) {
  if (task.capture_status !== "ready_for_manual_capture") fail("Capture task must be ready_for_manual_capture.");
  if (task.public_output_allowed !== false) fail("Capture public output must be false.");
}

const guard = readJson("data/knowledge-base/word-of-day/ag69j-no-evidence-attachment-guard.json");
if (guard.guard_passed !== true) fail("Attachment guard must pass.");
if (guard.source_evidence_attached_count !== 0) fail("Attachment guard evidence count must be 0.");
if (guard.source_reference_ids_attached_to_word_records_count !== 0) fail("Attachment guard source ref count must be 0.");

const copyright = readJson("data/knowledge-base/word-of-day/ag69j-source-reuse-copyright-guard.json");
if (!copyright.blocked_storage.includes("bulk dictionary entries")) fail("Bulk dictionary blocker missing.");
if (!copyright.allowed_storage_now.includes("short scout observation")) fail("Short scout observation allowance missing.");

const sourceAudit = readJson("data/knowledge-base/word-of-day/ag69j-source-preservation-audit-no-source-promoted.json");
if (sourceAudit.audit_passed !== true) fail("Source audit must pass.");
if (sourceAudit.source_promoted_count !== 0) fail("No source may be promoted.");

const wordAudit = readJson("data/knowledge-base/word-of-day/ag69j-word-preservation-audit-no-record-promoted.json");
if (wordAudit.audit_passed !== true) fail("Word audit must pass.");
for (const word of wordAudit.pilot_words) {
  if (word.reviewed_record_created !== false) fail("No reviewed record may be created.");
  if (word.approved_record_created !== false) fail("No approved record may be created.");
  if (word.public_output_allowed !== false) fail("No public output may be allowed.");
}

const mutation = readJson("data/knowledge-base/word-of-day/ag69j-no-generated-word-mutation-audit.json");
if (mutation.audit_passed !== true) fail("Mutation audit must pass.");
if (mutation.failed_checks.length !== 0) fail("Mutation audit failed_checks must be empty.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69j-ag69k-pilot-evidence-attachment-readiness-record.json");
if (readiness.ready_for_ag69k !== true) fail("AG69K readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69j-to-ag69k-pilot-evidence-attachment-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocked of [
  "bulk dictionary/book content ingestion",
  "source promotion to approved_source without exact verification",
  "approved word bank creation",
  "generated/word-of-day.json replacement",
  "active tithi/vara word selection",
  "Panchang value generation",
  "Supabase/database writes",
  "V02 expansion"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocked)) fail(`Boundary blocker missing: ${blocked}`);
}

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag69j-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69j-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69J pilot lexical source addition and capture readiness is present.");
pass("Pilot lexical source metadata is added without source promotion.");
pass("Pilot scout records and manual capture packet are present.");
pass("No evidence/source refs are attached to word records.");
pass("Generated word output remains unchanged.");
pass("No public output, active Tithi/Vara selection, Panchang generation, backend/database/V02 activation is recorded.");
