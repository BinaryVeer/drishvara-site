import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69O validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69o-approved-word-bank-pilot-gate.mjs",
  "scripts/validate-ag69o-approved-word-bank-pilot-gate.mjs",
  "data/knowledge-base/word-of-day/ag69o-approved-word-bank-pilot.json",
  "data/knowledge-base/word-of-day/ag69o-approved-bank-pilot-gate-result.json",
  "data/knowledge-base/word-of-day/ag69o-approved-bank-pilot-map.json",
  "data/knowledge-base/word-of-day/ag69o-approval-scope-public-output-block-record.json",
  "data/knowledge-base/word-of-day/ag69o-public-output-block-audit.json",
  "data/knowledge-base/word-of-day/ag69o-no-source-promotion-audit.json",
  "data/knowledge-base/word-of-day/ag69o-no-runtime-selector-activation-audit.json",
  "data/knowledge-base/word-of-day/ag69o-no-generated-word-or-ui-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag69o-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69o-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69o-ag69p-word-selection-engine-doctrine-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69o-to-ag69p-word-selection-engine-doctrine-test-boundary.json",
  "data/content-intelligence/quality-reviews/ag69o-approved-word-bank-pilot-gate.json",
  "data/quality/ag69o-approved-word-bank-pilot-gate.json",
  "data/quality/ag69o-approved-word-bank-pilot-gate-preview.json",
  "docs/quality/AG69O_APPROVED_WORD_BANK_PILOT_GATE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69o"]) fail("Missing generate:ag69o script.");
if (!pkg.scripts?.["validate:ag69o"]) fail("Missing validate:ag69o script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69o")) fail("validate:project must include validate:ag69o.");

const review = readJson("data/content-intelligence/quality-reviews/ag69o-approved-word-bank-pilot-gate.json");
if (review.status !== "ag69o_approved_word_bank_pilot_gate_completed") fail("Review status mismatch.");

for (const key of [
  "ag69n_consumed",
  "approved_bank_pilot_created",
  "all_records_have_evidence_id",
  "all_records_have_source_reference_id",
  "all_records_have_reviewed_status_before_approval",
  "all_source_access_checked",
  "all_reuse_note_checked",
  "all_internal_textual_discipline_passed",
  "all_source_promotions_blocked",
  "all_public_output_blocked",
  "ready_for_ag69p"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "public_publication_approval_created",
  "runtime_selection_active_now",
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

if (review.summary.approval_scope !== "internal_pilot_approved_bank_public_output_blocked") fail("Approval scope mismatch.");
if (review.summary.approved_record_count !== 3) fail("Approved record count must be 3.");
if (review.summary.runtime_selection_candidate_count_for_ag69p !== 3) fail("Runtime selection candidate count must be 3.");
if (review.summary.source_promoted_count !== 0) fail("Source promoted count must be 0.");

const bank = readJson("data/knowledge-base/word-of-day/ag69o-approved-word-bank-pilot.json");
if (bank.status !== "approved_word_bank_pilot_created_public_output_blocked") fail("Approved bank status mismatch.");
if (bank.approved_record_count !== 3) fail("Approved bank must contain 3 records.");
if (bank.public_output_allowed !== false) fail("Approved bank public output must be false.");
if (bank.runtime_selection_active_now !== false) fail("Runtime selection must be inactive.");
if (bank.source_promoted_count !== 0) fail("No source may be promoted.");

for (const record of bank.approved_records) {
  if (record.approval_gate_status !== "approved_bank_pilot_gate_passed") fail("Approval gate status mismatch.");
  if (record.approval_scope !== "internal_pilot_approved_bank_public_output_blocked") fail("Record approval scope mismatch.");
  if (record.review_status_after_ag69o !== "approved_pilot") fail("Record review status must be approved_pilot.");
  if (!record.evidence_id || !record.source_reference_id) fail("Evidence/source refs required.");
  if (record.source_promoted_now !== false) fail("Source must not be promoted.");
  if (record.public_output_allowed !== false) fail("Public output must remain false.");
  if (record.runtime_selection_eligible_for_ag69p !== true) fail("Record must be AG69P candidate.");
  if (record.runtime_selection_eligible_now !== false) fail("Record must not be runtime eligible now.");
  if (record.generated_output_eligible_now !== false) fail("Record must not be generated-output eligible now.");
}

const gate = readJson("data/knowledge-base/word-of-day/ag69o-approved-bank-pilot-gate-result.json");
if (gate.gate_passed !== true) fail("Approved gate must pass.");
if (gate.approved_record_count_created !== 3) fail("Approved gate count must be 3.");
if (gate.runtime_selection_candidate_count_for_ag69p !== 3) fail("AG69P candidate count must be 3.");
if (gate.runtime_selection_active_now !== false) fail("Runtime selection must be inactive.");
if (gate.generated_word_json_modified !== false || gate.ui_display_changed !== false) fail("Generated/UI mutation must be false.");

const scope = readJson("data/knowledge-base/word-of-day/ag69o-approval-scope-public-output-block-record.json");
if (scope.status !== "approval_scope_public_output_block_recorded") fail("Approval scope record status mismatch.");
if (scope.public_publication_approval_created !== false) fail("Public publication approval must be false.");
if (scope.runtime_selection_activation_approval_created !== false) fail("Runtime selection approval must be false.");
if (scope.source_promotion_created !== false) fail("Source promotion must be false.");

const publicBlock = readJson("data/knowledge-base/word-of-day/ag69o-public-output-block-audit.json");
if (publicBlock.audit_passed !== true) fail("Public block audit must pass.");
if (publicBlock.public_output_from_word_records_allowed !== false) fail("Public output must remain blocked.");
if (publicBlock.runtime_selection_active_now !== false) fail("Runtime selection must remain inactive.");

const sourceBlock = readJson("data/knowledge-base/word-of-day/ag69o-no-source-promotion-audit.json");
if (sourceBlock.audit_passed !== true) fail("Source promotion block must pass.");
if (sourceBlock.source_promoted_count !== 0) fail("No source may be promoted.");
if (sourceBlock.approved_source_created !== false) fail("No approved source may be created.");

const selectorBlock = readJson("data/knowledge-base/word-of-day/ag69o-no-runtime-selector-activation-audit.json");
if (selectorBlock.audit_passed !== true) fail("Selector block audit must pass.");
if (selectorBlock.runtime_selection_candidate_count_for_ag69p !== 3) fail("Selector candidate count must be 3.");
if (selectorBlock.runtime_selection_active_now !== false) fail("Runtime selector must be inactive.");
if (selectorBlock.active_tithi_vara_selection_started !== false) fail("Tithi/Vara selection must not start.");

const mutation = readJson("data/knowledge-base/word-of-day/ag69o-no-generated-word-or-ui-mutation-audit.json");
if (mutation.audit_passed !== true) fail("Mutation audit must pass.");
if (mutation.failed_checks.length !== 0) fail("Mutation audit failed_checks must be empty.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69o-ag69p-word-selection-engine-doctrine-test-readiness-record.json");
if (readiness.ready_for_ag69p !== true) fail("AG69P readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69o-to-ag69p-word-selection-engine-doctrine-test-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocked of [
  "public word output generation",
  "generated/word-of-day.json replacement",
  "active public tithi/vara word selection",
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
  "data/content-intelligence/backend-architecture/ag69o-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69o-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69O approved word bank pilot gate is present.");
pass("Three internal approved pilot records are created with public output blocked.");
pass("Runtime selector candidates are ready for AG69P but selector remains inactive.");
pass("No source promotion, generated-word replacement or UI mutation is recorded.");
pass("No public output, Tithi/Vara activation, Panchang generation, backend/database/V02 activation is recorded.");
