import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69H validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69h-source-reference-hardening-evidence-attachment-readiness.mjs",
  "scripts/validate-ag69h-source-reference-hardening-evidence-attachment-readiness.mjs",
  "data/knowledge-base/word-of-day/ag69h-source-reference-hardening-checklist.json",
  "data/knowledge-base/word-of-day/ag69h-source-verification-readiness-matrix.json",
  "data/knowledge-base/word-of-day/ag69h-word-evidence-attachment-readiness-queue.json",
  "data/knowledge-base/word-of-day/ag69h-manual-verification-fields-contract.json",
  "data/knowledge-base/word-of-day/ag69h-source-status-hardening-result-no-source-promoted.json",
  "data/knowledge-base/word-of-day/ag69h-word-draft-status-preservation-audit.json",
  "data/knowledge-base/word-of-day/ag69h-no-generated-word-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag69h-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69h-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69h-ag69i-word-pilot-source-evidence-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69h-to-ag69i-word-pilot-source-evidence-boundary.json",
  "data/content-intelligence/quality-reviews/ag69h-source-reference-hardening-evidence-attachment-readiness.json",
  "data/quality/ag69h-source-reference-hardening-evidence-attachment-readiness.json",
  "data/quality/ag69h-source-reference-hardening-evidence-attachment-readiness-preview.json",
  "docs/quality/AG69H_SOURCE_REFERENCE_HARDENING_EVIDENCE_ATTACHMENT_READINESS.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69h"]) fail("Missing generate:ag69h script.");
if (!pkg.scripts?.["validate:ag69h"]) fail("Missing validate:ag69h script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69h")) fail("validate:project must include validate:ag69h.");

const review = readJson("data/content-intelligence/quality-reviews/ag69h-source-reference-hardening-evidence-attachment-readiness.json");
if (review.status !== "ag69h_source_reference_hardening_evidence_attachment_readiness_completed") fail("Review status mismatch.");

for (const key of [
  "ag69g_consumed",
  "source_reference_hardening_checklist_created",
  "source_verification_readiness_matrix_created",
  "evidence_attachment_readiness_queue_created",
  "manual_verification_fields_contract_created",
  "ready_for_ag69i"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "word_source_reference_ids_attached_now",
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

if (review.summary.source_reference_count < 1) fail("Source reference count must be positive.");
if (review.summary.workbench_item_count < 1) fail("Workbench item count must be positive.");
if (review.summary.source_promoted_count !== 0) fail("Source promoted count must be 0.");

const checklist = readJson("data/knowledge-base/word-of-day/ag69h-source-reference-hardening-checklist.json");
if (checklist.status !== "source_reference_hardening_checklist_created") fail("Checklist status mismatch.");
if (!checklist.blocked_now.includes("source_status_promotion_to_approved_source")) fail("Source promotion blocker missing.");
if (!checklist.blocked_now.includes("word_record_source_attachment")) fail("Word evidence attachment blocker missing.");

const matrix = readJson("data/knowledge-base/word-of-day/ag69h-source-verification-readiness-matrix.json");
if (matrix.status !== "source_verification_readiness_matrix_created_no_source_promoted") fail("Matrix status mismatch.");
if (matrix.promoted_source_count_now !== 0) fail("No source may be promoted.");
for (const source of matrix.source_records) {
  if (source.hardened_for_evidence_attachment_now !== false) fail("No source may be hardened now.");
  if (source.promoted_to_approved_source_now !== false) fail("No source may be promoted now.");
  if (source.public_claim_allowed_now !== false) fail("No public claim may be allowed now.");
}

const queue = readJson("data/knowledge-base/word-of-day/ag69h-word-evidence-attachment-readiness-queue.json");
if (queue.evidence_attachment_performed_now !== false) fail("Evidence attachment must be false.");
if (queue.source_reference_ids_attached_now !== false) fail("Source reference IDs must not be attached.");
for (const item of queue.queue_items) {
  if (item.evidence_attachment_status !== "not_started") fail("Evidence attachment status must be not_started.");
  if (item.source_reference_ids_to_attach_now.length !== 0) fail("No source refs may be scheduled for immediate attachment.");
  if (item.source_reference_ids_attached_now.length !== 0) fail("No source refs may be attached.");
  if (item.public_output_allowed !== false) fail("Public output must be false.");
  if (item.eligible_for_reviewed_bank_after_ag69h !== false) fail("No item may become reviewed eligible.");
}

const contract = readJson("data/knowledge-base/word-of-day/ag69h-manual-verification-fields-contract.json");
for (const field of ["source_reference_id", "word_form_found_status", "meaning_supported_status", "internal_textual_discipline_check", "public_output_allowed"]) {
  if (!contract.required_fields.includes(field)) fail(`Manual field missing: ${field}`);
}

const hardening = readJson("data/knowledge-base/word-of-day/ag69h-source-status-hardening-result-no-source-promoted.json");
if (hardening.promoted_source_count !== 0) fail("Promoted source count must be 0.");
if (hardening.source_claim_allowed_count !== 0) fail("Source claim allowed count must be 0.");
if (hardening.public_claims_remain_blocked !== true) fail("Public claims must remain blocked.");

const draftAudit = readJson("data/knowledge-base/word-of-day/ag69h-word-draft-status-preservation-audit.json");
if (draftAudit.audit_passed !== true) fail("Draft preservation audit must pass.");
if (!draftAudit.draft_record_statuses.every((record) => record.preserved === true)) fail("All draft records must be preserved.");

const mutation = readJson("data/knowledge-base/word-of-day/ag69h-no-generated-word-mutation-audit.json");
if (mutation.audit_passed !== true) fail("Mutation audit must pass.");
if (mutation.failed_checks.length !== 0) fail("Mutation audit failed_checks must be empty.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69h-ag69i-word-pilot-source-evidence-readiness-record.json");
if (readiness.ready_for_ag69i !== true) fail("AG69I readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69h-to-ag69i-word-pilot-source-evidence-boundary.json");
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
  "data/content-intelligence/backend-architecture/ag69h-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69h-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69H source-reference hardening readiness is present.");
pass("No source is promoted and no word source reference is attached.");
pass("Manual verification field contract is valid.");
pass("Word draft statuses are preserved.");
pass("Generated word output remains unchanged.");
pass("No public output, active Tithi/Vara selection, Panchang generation, backend/database/V02 activation is recorded.");
