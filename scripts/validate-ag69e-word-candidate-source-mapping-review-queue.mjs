import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69E validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69e-word-candidate-source-mapping-review-queue.mjs",
  "scripts/validate-ag69e-word-candidate-source-mapping-review-queue.mjs",
  "data/knowledge-base/word-of-day/ag69e-candidate-source-mapping-doctrine.json",
  "data/knowledge-base/word-of-day/ag69e-candidate-source-mapping.json",
  "data/knowledge-base/word-of-day/ag69e-source-review-queue.json",
  "data/knowledge-base/word-of-day/ag69e-linguistic-review-queue.json",
  "data/knowledge-base/word-of-day/ag69e-internal-textual-discipline-review-queue.json",
  "data/knowledge-base/word-of-day/ag69e-source-reference-coverage-check.json",
  "data/knowledge-base/word-of-day/ag69e-no-content-ingestion-and-no-approval-audit.json",
  "data/knowledge-base/word-of-day/ag69e-word-selection-context-doctrine.json",
  "data/content-intelligence/backend-architecture/ag69e-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69e-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69e-ag69f-word-source-evidence-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69e-to-ag69f-word-source-evidence-boundary.json",
  "data/content-intelligence/quality-reviews/ag69e-word-candidate-source-mapping-review-queue.json",
  "data/quality/ag69e-word-candidate-source-mapping-review-queue.json",
  "data/quality/ag69e-word-candidate-source-mapping-review-queue-preview.json",
  "docs/quality/AG69E_WORD_CANDIDATE_SOURCE_MAPPING_REVIEW_QUEUE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69e"]) fail("Missing generate:ag69e script.");
if (!pkg.scripts?.["validate:ag69e"]) fail("Missing validate:ag69e script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69e")) fail("validate:project must include validate:ag69e.");

const review = readJson("data/content-intelligence/quality-reviews/ag69e-word-candidate-source-mapping-review-queue.json");
if (review.status !== "ag69e_word_candidate_source_mapping_review_queue_completed") fail("Review status mismatch.");

for (const key of [
  "ag69d_consumed",
  "candidate_source_mapping_created",
  "source_review_queue_created",
  "linguistic_review_queue_created",
  "internal_textual_discipline_review_queue_created",
  "vedic_tradition_source_families_used_for_mapping",
  "nityanand_misra_aligned_published_work_handling_retained_as_candidate_review_only",
  "all_records_remain_candidate",
  "word_selection_context_doctrine_recorded",
  "ready_for_ag69f"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "reviewed_records_created",
  "approved_records_created",
  "approved_bank_created",
  "public_output_from_mapped_records_allowed",
  "source_content_ingested",
  "bulk_copyrighted_ingestion",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_database_write_performed",
  "backend_runtime_activated",
  "database_runtime_activated",
  "service_role_used",
  "active_tithi_vara_selection_started",
  "panchang_value_generation_started",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const doctrine = readJson("data/knowledge-base/word-of-day/ag69e-candidate-source-mapping-doctrine.json");
if (!doctrine.mapping_is_not.includes("approved word meaning")) fail("Mapping-not-approval rule missing.");
if (!doctrine.required_review_after_mapping.includes("internal textual discipline review")) fail("Internal discipline review requirement missing.");

const mapping = readJson("data/knowledge-base/word-of-day/ag69e-candidate-source-mapping.json");
if (mapping.status !== "candidate_source_mapping_created_review_pending") fail("Candidate mapping status mismatch.");
if (mapping.approved_record_count !== 0) fail("Approved record count must be 0.");
if (mapping.reviewed_record_count !== 0) fail("Reviewed record count must be 0.");
if (mapping.public_output_allowed_count !== 0) fail("Public output allowed count must be 0.");
if (mapping.generated_word_json_modified !== false) fail("generated/word-of-day.json must not be modified.");
if (mapping.approved_bank_created !== false) fail("Approved bank must not be created.");

for (const record of mapping.mapped_records) {
  if (record.mapped_bank_class !== "candidate") fail(`Mapped record ${record.record_id} must remain candidate.`);
  if (record.review_queue_status !== "review_pending") fail(`Mapped record ${record.record_id} must be review_pending.`);
  if (record.public_output_allowed !== false) fail(`Mapped record ${record.record_id} must not allow public output.`);
  if (record.source_confirmation_status !== "not_verified") fail(`Mapped record ${record.record_id} source must not be verified.`);
  if (record.meaning_confirmation_status !== "not_verified") fail(`Mapped record ${record.record_id} meaning must not be verified.`);
  if (!Array.isArray(record.sanskrit_candidate_sources) || record.sanskrit_candidate_sources.length < 2) fail(`Mapped record ${record.record_id} Sanskrit sources missing.`);
  if (!Array.isArray(record.hindi_candidate_sources) || record.hindi_candidate_sources.length < 2) fail(`Mapped record ${record.record_id} Hindi sources missing.`);
}

const sourceQueue = readJson("data/knowledge-base/word-of-day/ag69e-source-review-queue.json");
if (sourceQueue.queue_item_count !== mapping.mapped_record_count) fail("Source review queue count mismatch.");
if (!sourceQueue.queue_items.every((x) => x.review_status === "pending")) fail("All source queue items must be pending.");

const lingQueue = readJson("data/knowledge-base/word-of-day/ag69e-linguistic-review-queue.json");
if (lingQueue.queue_item_count !== mapping.mapped_record_count) fail("Linguistic review queue count mismatch.");
if (!lingQueue.queue_items.every((x) => x.current_public_output_allowed === false)) fail("Linguistic queue public output must be false.");

const disciplineQueue = readJson("data/knowledge-base/word-of-day/ag69e-internal-textual-discipline-review-queue.json");
if (disciplineQueue.public_attribution_allowed !== false) fail("Internal discipline public attribution must be false.");
if (!disciplineQueue.queue_items.every((x) => x.internal_textual_discipline_check === "pending")) fail("Internal discipline checks must be pending.");
if (!disciplineQueue.queue_items.every((x) => x.public_attribution_allowed === false)) fail("Internal discipline public attribution must be false for all items.");

const coverage = readJson("data/knowledge-base/word-of-day/ag69e-source-reference-coverage-check.json");
if (coverage.coverage_passed !== true) fail("Coverage check must pass.");
for (const key of ["sanskrit_lexical", "hindi_lexical", "corpus_attestation", "vedic_context"]) {
  if (coverage.required_source_families_present[key] !== true) fail(`Source family coverage missing: ${key}`);
}

const selectorDoctrine = readJson("data/knowledge-base/word-of-day/ag69e-word-selection-context-doctrine.json");
if (selectorDoctrine.status !== "selection_context_doctrine_recorded_not_active") fail("Selection context doctrine status mismatch.");
for (const input of ["tithi", "vara_weekday", "previously_used_word_duplication_check"]) {
  if (!selectorDoctrine.selection_context_inputs_future.includes(input)) fail(`Selection context input missing: ${input}`);
}
for (const blocked of ["active_tithi_based_selection", "active_vara_based_selection", "AI_generated_daily_word", "Panchang_value_generation"]) {
  if (!selectorDoctrine.blocked_now.includes(blocked)) fail(`Selection doctrine blocker missing: ${blocked}`);
}
if (selectorDoctrine.fallback_rule.public_output_allowed_from_candidate_records !== false) fail("Fallback must not allow candidate public output.");

const noIngestion = readJson("data/knowledge-base/word-of-day/ag69e-no-content-ingestion-and-no-approval-audit.json");
if (noIngestion.audit_passed !== true) fail("No ingestion audit must pass.");
if (noIngestion.failed_checks.length !== 0) fail("No ingestion audit failed_checks must be empty.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69e-ag69f-word-source-evidence-readiness-record.json");
if (readiness.ready_for_ag69f !== true) fail("AG69F readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69e-to-ag69f-word-source-evidence-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocked of [
  "dictionary/book content bulk ingestion",
  "approved word bank creation",
  "generated/word-of-day.json replacement",
  "public attribution of internal study influence",
  "Supabase/database writes",
  "V02 expansion"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocked)) fail(`Boundary blocker missing: ${blocked}`);
}

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag69e-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69e-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69E Word candidate source mapping and review queue is present.");
pass("Mapped records remain candidate-only and review-pending.");
pass("Source, linguistic and internal textual-discipline review queues are valid.");
pass("Source family coverage is valid.");
pass("No source content ingestion, approval, public output, UI change, Supabase/database/backend/service-role/V02 activation is recorded.");
