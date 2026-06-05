import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69F validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69f-legacy-word-bank-evidence-alignment-reviewed-draft.mjs",
  "scripts/validate-ag69f-legacy-word-bank-evidence-alignment-reviewed-draft.mjs",
  "data/knowledge-base/word-of-day/ag69f-existing-word-asset-discovery-record.json",
  "data/knowledge-base/word-of-day/ag69f-legacy-d02-ag63-evidence-alignment-register.json",
  "data/knowledge-base/word-of-day/ag69f-legacy-approved-preview-migration-assessment.json",
  "data/knowledge-base/word-of-day/ag69f-word-source-evidence-capture-queue.json",
  "data/knowledge-base/word-of-day/ag69f-reviewed-record-draft-no-approval.json",
  "data/knowledge-base/word-of-day/ag69f-ag69e-ag63-crosswalk-record.json",
  "data/knowledge-base/word-of-day/ag69f-word-selection-policy-legacy-bridge-assessment.json",
  "data/knowledge-base/word-of-day/ag69f-no-generated-word-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag69f-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69f-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69f-ag69g-word-source-evidence-review-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69f-to-ag69g-word-source-evidence-review-boundary.json",
  "data/content-intelligence/quality-reviews/ag69f-legacy-word-bank-evidence-alignment-reviewed-draft.json",
  "data/quality/ag69f-legacy-word-bank-evidence-alignment-reviewed-draft.json",
  "data/quality/ag69f-legacy-word-bank-evidence-alignment-reviewed-draft-preview.json",
  "docs/quality/AG69F_LEGACY_WORD_BANK_EVIDENCE_ALIGNMENT_REVIEWED_DRAFT.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69f"]) fail("Missing generate:ag69f script.");
if (!pkg.scripts?.["validate:ag69f"]) fail("Missing validate:ag69f script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69f")) fail("validate:project must include validate:ag69f.");

const review = readJson("data/content-intelligence/quality-reviews/ag69f-legacy-word-bank-evidence-alignment-reviewed-draft.json");
if (review.status !== "ag69f_legacy_word_bank_evidence_alignment_reviewed_draft_completed") fail("Review status mismatch.");

for (const key of [
  "ag69e_consumed",
  "existing_word_assets_discovered",
  "d02_bank_discovered",
  "ag63_preview_bank_discovered",
  "legacy_d02_ag63_aligned_as_evidence_pending",
  "evidence_capture_queue_created",
  "reviewed_record_draft_created_as_evidence_pending",
  "ready_for_ag69g"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "reviewed_records_created",
  "approved_records_created",
  "approved_bank_created",
  "public_output_from_legacy_records_allowed",
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

if (review.summary.d02_item_count < 1) fail("D02 item count must be positive.");
if (review.summary.d02_approved_count < 1) fail("D02 approved count must be positive.");
if (review.summary.ag63_preview_count < 1) fail("AG63 preview count must be positive.");

const discovery = readJson("data/knowledge-base/word-of-day/ag69f-existing-word-asset-discovery-record.json");
if (discovery.status !== "existing_word_assets_discovered") fail("Discovery status mismatch.");
if (discovery.discovered_assets.generated_word_output.dynamic_rotation_active !== false) fail("Generated word dynamic rotation must be false.");
if (discovery.discovered_assets.generated_word_output.ai_generation_active !== false) fail("Generated word AI generation must be false.");
if (discovery.discovered_assets.generated_word_output.public_ui_ready !== false) fail("Generated word public UI ready must be false.");

const alignment = readJson("data/knowledge-base/word-of-day/ag69f-legacy-d02-ag63-evidence-alignment-register.json");
if (alignment.status !== "legacy_word_bank_aligned_as_evidence_pending") fail("Legacy alignment status mismatch.");
if (!alignment.legacy_items.every((item) => item.ag69_approved_status === false && item.public_output_allowed_under_ag69 === false)) {
  fail("Legacy items must not be AG69 approved or public-output allowed.");
}

const migration = readJson("data/knowledge-base/word-of-day/ag69f-legacy-approved-preview-migration-assessment.json");
if (migration.migration_to_ag69_reviewed_now !== false) fail("Migration to reviewed must be false.");
if (migration.migration_to_ag69_approved_now !== false) fail("Migration to approved must be false.");
if (migration.approved_bank_created_now !== false) fail("Approved bank must not be created.");

const queue = readJson("data/knowledge-base/word-of-day/ag69f-word-source-evidence-capture-queue.json");
if (queue.status !== "source_evidence_capture_queue_created_not_executed") fail("Evidence queue status mismatch.");
if (queue.source_content_ingested_now !== false) fail("Source content ingestion must be false.");
if (!queue.queue_items.every((item) => item.evidence_capture_status === "pending_manual_source_evidence" && item.public_output_allowed === false)) {
  fail("Evidence queue items must be pending and public-output blocked.");
}

const draft = readJson("data/knowledge-base/word-of-day/ag69f-reviewed-record-draft-no-approval.json");
if (draft.reviewed_records_created !== false) fail("Reviewed records must not be created.");
if (draft.approved_records_created !== false) fail("Approved records must not be created.");
if (draft.public_output_allowed_count !== 0) fail("Public output allowed count must be 0.");
for (const record of draft.draft_records) {
  if (record.review_status !== "evidence_pending") fail(`Draft ${record.draft_id} must be evidence_pending.`);
  if (record.public_output_allowed !== false) fail(`Draft ${record.draft_id} public output must be false.`);
  if (record.source_evidence_attached !== false) fail(`Draft ${record.draft_id} source evidence must not be attached now.`);
  if (record.approved_record_created !== false) fail(`Draft ${record.draft_id} must not be approved.`);
}

const selection = readJson("data/knowledge-base/word-of-day/ag69f-word-selection-policy-legacy-bridge-assessment.json");
if (selection.active_tithi_vara_selection_started !== false) fail("Tithi/Vara selector must not start.");
if (selection.panchang_value_generation_started !== false) fail("Panchang generation must not start.");
if (selection.dynamic_rotation_active_now !== false) fail("Dynamic rotation must remain inactive.");
if (selection.generated_word_json_modified !== false) fail("Generated word JSON must not be modified.");

const mutation = readJson("data/knowledge-base/word-of-day/ag69f-no-generated-word-mutation-audit.json");
if (mutation.audit_passed !== true) fail("No mutation audit must pass.");
if (mutation.failed_checks.length !== 0) fail("No mutation audit failed_checks must be empty.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69f-ag69g-word-source-evidence-review-readiness-record.json");
if (readiness.ready_for_ag69g !== true) fail("AG69G readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69f-to-ag69g-word-source-evidence-review-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocked of [
  "bulk dictionary/book content ingestion",
  "direct legacy preview to approved migration",
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
  "data/content-intelligence/backend-architecture/ag69f-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69f-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69F legacy word bank evidence alignment is present.");
pass("Existing D02 / AG63 Word assets are discovered.");
pass("Legacy records are aligned as evidence-pending only.");
pass("Reviewed-record draft exists without reviewed/approved/public-output status.");
pass("Generated word output remains unchanged and dynamic rotation remains inactive.");
pass("No source ingestion, active Tithi/Vara selection, Panchang generation, backend/database/V02 activation is recorded.");
