import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69G validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69g-word-source-evidence-review-reviewed-bank-validation.mjs",
  "scripts/validate-ag69g-word-source-evidence-review-reviewed-bank-validation.mjs",
  "data/knowledge-base/word-of-day/ag69g-source-evidence-review-protocol.json",
  "data/knowledge-base/word-of-day/ag69g-source-evidence-review-workbench.json",
  "data/knowledge-base/word-of-day/ag69g-reviewed-bank-validation-gate.json",
  "data/knowledge-base/word-of-day/ag69g-reviewed-bank-validation-result-no-records-promoted.json",
  "data/knowledge-base/word-of-day/ag69g-reviewed-bank-placeholder-empty.json",
  "data/knowledge-base/word-of-day/ag69g-manual-source-evidence-capture-template.json",
  "data/knowledge-base/word-of-day/ag69g-no-generated-word-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag69g-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69g-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69g-ag69h-word-source-evidence-attachment-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69g-to-ag69h-word-source-evidence-attachment-boundary.json",
  "data/content-intelligence/quality-reviews/ag69g-word-source-evidence-review-reviewed-bank-validation.json",
  "data/quality/ag69g-word-source-evidence-review-reviewed-bank-validation.json",
  "data/quality/ag69g-word-source-evidence-review-reviewed-bank-validation-preview.json",
  "docs/quality/AG69G_WORD_SOURCE_EVIDENCE_REVIEW_REVIEWED_BANK_VALIDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69g"]) fail("Missing generate:ag69g script.");
if (!pkg.scripts?.["validate:ag69g"]) fail("Missing validate:ag69g script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69g")) fail("validate:project must include validate:ag69g.");

const review = readJson("data/content-intelligence/quality-reviews/ag69g-word-source-evidence-review-reviewed-bank-validation.json");
if (review.status !== "ag69g_word_source_evidence_review_reviewed_bank_validation_completed") fail("Review status mismatch.");

for (const key of [
  "ag69f_consumed",
  "source_evidence_review_protocol_defined",
  "source_evidence_review_workbench_created",
  "reviewed_bank_validation_gate_defined",
  "reviewed_bank_validation_completed",
  "ready_for_ag69h"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "reviewed_records_created",
  "approved_records_created",
  "reviewed_bank_created",
  "approved_bank_created",
  "public_output_from_reviewed_bank_allowed",
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

if (review.summary.draft_record_count < 1) fail("Draft record count must be positive.");
if (review.summary.reviewed_eligible_count !== 0) fail("Reviewed eligible count must be 0.");

const protocol = readJson("data/knowledge-base/word-of-day/ag69g-source-evidence-review-protocol.json");
if (!protocol.source_rules.includes("Do not use AI-generated meanings as source evidence.")) fail("AI source blocker missing.");
if (!protocol.required_evidence_slots.includes("internal_textual_discipline_check")) fail("Internal discipline evidence slot missing.");

const workbench = readJson("data/knowledge-base/word-of-day/ag69g-source-evidence-review-workbench.json");
if (workbench.status !== "source_evidence_review_workbench_created_pending") fail("Workbench status mismatch.");
if (workbench.eligible_for_reviewed_bank_count !== 0) fail("Workbench eligible count must be 0.");
if (workbench.source_content_ingested_now !== false) fail("Source content ingestion must be false.");
if (!workbench.workbench_items.every((item) => item.source_evidence_review_status === "pending_exact_source_evidence")) {
  fail("All workbench items must remain pending exact source evidence.");
}
if (!workbench.workbench_items.every((item) => item.eligible_for_reviewed_bank === false && item.public_output_allowed === false)) {
  fail("Workbench items must not be reviewed-bank eligible or public-output allowed.");
}

const gate = readJson("data/knowledge-base/word-of-day/ag69g-reviewed-bank-validation-gate.json");
if (gate.reviewed_bank_creation_allowed_now !== false) fail("Reviewed bank creation must be false.");

const result = readJson("data/knowledge-base/word-of-day/ag69g-reviewed-bank-validation-result-no-records-promoted.json");
if (result.reviewed_eligible_count !== 0) fail("Reviewed eligible count must be 0.");
if (result.reviewed_records_created !== false) fail("Reviewed records must not be created.");
if (result.approved_records_created !== false) fail("Approved records must not be created.");
if (!result.validation_items.every((item) => item.validation_status === "failed_pending_evidence" && item.eligible_for_reviewed_bank === false)) {
  fail("All validation items must fail pending evidence.");
}

const placeholder = readJson("data/knowledge-base/word-of-day/ag69g-reviewed-bank-placeholder-empty.json");
if (placeholder.reviewed_record_count !== 0) fail("Reviewed bank placeholder must be empty.");
if (placeholder.approved_record_count !== 0) fail("Approved count must be 0.");
if (placeholder.public_output_allowed !== false) fail("Public output must be false.");
if (placeholder.generated_word_json_modified !== false) fail("Generated word JSON must not be modified.");

const template = readJson("data/knowledge-base/word-of-day/ag69g-manual-source-evidence-capture-template.json");
if (template.template_only !== true) fail("Evidence capture template must be template-only.");
if (!template.prohibited_storage.includes("bulk dictionary entries")) fail("Bulk dictionary storage blocker missing.");

const mutation = readJson("data/knowledge-base/word-of-day/ag69g-no-generated-word-mutation-audit.json");
if (mutation.audit_passed !== true) fail("Mutation audit must pass.");
if (mutation.failed_checks.length !== 0) fail("Mutation audit failed_checks must be empty.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69g-ag69h-word-source-evidence-attachment-readiness-record.json");
if (readiness.ready_for_ag69h !== true) fail("AG69H readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69g-to-ag69h-word-source-evidence-attachment-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocked of [
  "bulk dictionary/book content ingestion",
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
  "data/content-intelligence/backend-architecture/ag69g-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69g-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69G source evidence review and reviewed-bank validation is present.");
pass("Reviewed-bank gate is defined and no records are promoted.");
pass("Manual source evidence template is present.");
pass("Generated word output remains unchanged.");
pass("No source ingestion, public output, active Tithi/Vara selection, Panchang generation, backend/database/V02 activation is recorded.");
