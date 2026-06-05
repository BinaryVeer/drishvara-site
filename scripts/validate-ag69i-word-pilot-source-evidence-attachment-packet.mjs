import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69I validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69i-word-pilot-source-evidence-attachment-packet.mjs",
  "scripts/validate-ag69i-word-pilot-source-evidence-attachment-packet.mjs",
  "data/knowledge-base/word-of-day/ag69i-pilot-word-selection-record.json",
  "data/knowledge-base/word-of-day/ag69i-pilot-source-lookup-task-packet.json",
  "data/knowledge-base/word-of-day/ag69i-source-evidence-attachment-attempt-no-records-attached.json",
  "data/knowledge-base/word-of-day/ag69i-word-draft-preservation-audit.json",
  "data/knowledge-base/word-of-day/ag69i-source-reference-preservation-audit.json",
  "data/knowledge-base/word-of-day/ag69i-manual-evidence-entry-template.json",
  "data/knowledge-base/word-of-day/ag69i-no-generated-word-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag69i-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69i-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69i-ag69j-manual-source-evidence-capture-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69i-to-ag69j-manual-source-evidence-capture-boundary.json",
  "data/content-intelligence/quality-reviews/ag69i-word-pilot-source-evidence-attachment-packet.json",
  "data/quality/ag69i-word-pilot-source-evidence-attachment-packet.json",
  "data/quality/ag69i-word-pilot-source-evidence-attachment-packet-preview.json",
  "docs/quality/AG69I_WORD_PILOT_SOURCE_EVIDENCE_ATTACHMENT_PACKET.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69i"]) fail("Missing generate:ag69i script.");
if (!pkg.scripts?.["validate:ag69i"]) fail("Missing validate:ag69i script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69i")) fail("validate:project must include validate:ag69i.");

const review = readJson("data/content-intelligence/quality-reviews/ag69i-word-pilot-source-evidence-attachment-packet.json");
if (review.status !== "ag69i_word_pilot_source_evidence_attachment_packet_completed") fail("Review status mismatch.");

for (const key of [
  "ag69h_consumed",
  "pilot_word_selection_created",
  "pilot_source_lookup_tasks_created",
  "manual_evidence_template_created",
  "source_evidence_attachment_attempted",
  "ready_for_ag69j"
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

if (review.summary.pilot_selected_count !== 3) fail("Pilot selected count must be 3.");
if (review.summary.source_evidence_attached_count !== 0) fail("No source evidence may be attached.");
if (review.summary.source_reference_ids_attached_count !== 0) fail("No source reference IDs may be attached.");
if (review.summary.source_promoted_count !== 0) fail("No source may be promoted.");

const pilot = readJson("data/knowledge-base/word-of-day/ag69i-pilot-word-selection-record.json");
if (pilot.pilot_selected_count !== 3) fail("Pilot selected count mismatch.");
if (pilot.public_output_allowed !== false) fail("Pilot public output must be false.");
for (const item of pilot.pilot_words) {
  if (item.evidence_attachment_status !== "not_attached") fail("Pilot evidence must not be attached.");
  if (item.public_output_allowed !== false) fail("Pilot public output must be false.");
}

const packet = readJson("data/knowledge-base/word-of-day/ag69i-pilot-source-lookup-task-packet.json");
if (packet.source_content_ingested_now !== false) fail("Source content must not be ingested.");
if (packet.source_evidence_attached_now !== false) fail("Source evidence must not be attached.");
if (packet.task_count !== 3) fail("Lookup task count must be 3.");
for (const task of packet.tasks) {
  if (task.manual_lookup_required !== true) fail("Manual lookup must be required.");
  if (task.source_reference_ids_attached_now.length !== 0) fail("No source refs may be attached.");
  if (task.current_result.source_evidence_attached !== false) fail("Current result must not attach evidence.");
  if (task.current_result.public_output_allowed !== false) fail("Current result public output must be false.");
}

const attempt = readJson("data/knowledge-base/word-of-day/ag69i-source-evidence-attachment-attempt-no-records-attached.json");
if (attempt.source_evidence_attached_count !== 0) fail("Attachment count must be 0.");
if (attempt.source_reference_ids_attached_count !== 0) fail("Source ref attachment count must be 0.");
if (attempt.reviewed_record_count !== 0) fail("Reviewed record count must be 0.");
if (attempt.approved_record_count !== 0) fail("Approved record count must be 0.");

const draftAudit = readJson("data/knowledge-base/word-of-day/ag69i-word-draft-preservation-audit.json");
if (draftAudit.audit_passed !== true) fail("Draft audit must pass.");
if (!draftAudit.preserved_records.every((record) => record.preserved === true)) fail("All draft records must be preserved.");

const sourceAudit = readJson("data/knowledge-base/word-of-day/ag69i-source-reference-preservation-audit.json");
if (sourceAudit.audit_passed !== true) fail("Source preservation audit must pass.");
if (sourceAudit.source_promoted_count !== 0) fail("No source may be promoted.");
if (!sourceAudit.source_records.every((record) => record.promoted_to_approved_source_now === false && record.public_claim_allowed_now === false)) {
  fail("All source records must remain unpromoted and public-claim blocked.");
}

const template = readJson("data/knowledge-base/word-of-day/ag69i-manual-evidence-entry-template.json");
if (template.template_only !== true) fail("Manual evidence template must be template-only.");
if (template.entry_shape_for_ag69j.public_output_allowed !== false) fail("Manual evidence template public output must be false.");

const mutation = readJson("data/knowledge-base/word-of-day/ag69i-no-generated-word-mutation-audit.json");
if (mutation.audit_passed !== true) fail("Mutation audit must pass.");
if (mutation.failed_checks.length !== 0) fail("Mutation audit failed_checks must be empty.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69i-ag69j-manual-source-evidence-capture-readiness-record.json");
if (readiness.ready_for_ag69j !== true) fail("AG69J readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69i-to-ag69j-manual-source-evidence-capture-boundary.json");
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
  "data/content-intelligence/backend-architecture/ag69i-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69i-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69I pilot source evidence packet is present.");
pass("Pilot words are selected and lookup tasks are created.");
pass("No unverified source evidence or source_reference_id is attached.");
pass("Draft/source records are preserved.");
pass("Generated word output remains unchanged.");
pass("No public output, active Tithi/Vara selection, Panchang generation, backend/database/V02 activation is recorded.");
