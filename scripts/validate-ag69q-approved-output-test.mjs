import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69Q validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69q-approved-output-test.mjs",
  "scripts/validate-ag69q-approved-output-test.mjs",
  "data/knowledge-base/word-of-day/ag69q-approved-output-test-candidates.json",
  "data/knowledge-base/word-of-day/ag69q-approved-output-test-gate-result.json",
  "data/knowledge-base/word-of-day/ag69q-selector-to-output-test-map.json",
  "data/knowledge-base/word-of-day/ag69q-result-saving-readiness-record.json",
  "data/knowledge-base/word-of-day/ag69q-public-output-block-audit.json",
  "data/knowledge-base/word-of-day/ag69q-no-generated-word-replacement-audit.json",
  "data/knowledge-base/word-of-day/ag69q-no-ui-mutation-audit.json",
  "data/knowledge-base/word-of-day/ag69q-no-panchang-value-generation-audit.json",
  "data/content-intelligence/backend-architecture/ag69q-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69q-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69q-ag69r-static-result-saving-repeat-control-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69q-to-ag69r-static-result-saving-repeat-control-boundary.json",
  "data/content-intelligence/quality-reviews/ag69q-approved-output-test.json",
  "data/quality/ag69q-approved-output-test.json",
  "data/quality/ag69q-approved-output-test-preview.json",
  "docs/quality/AG69Q_APPROVED_OUTPUT_TEST.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69q"]) fail("Missing generate:ag69q script.");
if (!pkg.scripts?.["validate:ag69q"]) fail("Missing validate:ag69q script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69q")) fail("validate:project must include validate:ag69q.");

const review = readJson("data/content-intelligence/quality-reviews/ag69q-approved-output-test.json");
if (review.status !== "ag69q_approved_output_test_completed") fail("Review status mismatch.");

for (const key of [
  "ag69p_consumed",
  "approved_output_test_candidates_created",
  "all_candidates_from_approved_bank",
  "all_candidates_have_evidence_id",
  "all_candidates_have_source_reference_id",
  "all_public_output_blocked",
  "result_saving_readiness_created",
  "ready_for_ag69r"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "public_word_output_generated",
  "runtime_selector_active_now",
  "source_content_ingested",
  "bulk_copyrighted_ingestion",
  "generated_word_json_modified",
  "generated_word_json_replaced",
  "ui_display_changed",
  "new_word_card_created",
  "active_tithi_vara_selection_started",
  "panchang_calculation_performed",
  "panchang_value_generation_started",
  "public_panchang_claim_created",
  "supabase_database_write_performed",
  "backend_runtime_activated",
  "database_runtime_activated",
  "service_role_used",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

if (review.summary.output_test_candidate_count !== 4) fail("Output-test candidate count must be 4.");
if (review.summary.static_result_saving_candidate_count_for_ag69r !== 4) fail("Static result-saving candidate count must be 4.");
if (review.summary.source_promoted_count !== 0) fail("Source promoted count must be 0.");

const candidates = readJson("data/knowledge-base/word-of-day/ag69q-approved-output-test-candidates.json");
if (candidates.status !== "approved_output_test_candidates_created_public_blocked") fail("Candidate status mismatch.");
if (candidates.candidate_count !== 4) fail("Candidate count must be 4.");
if (candidates.public_output_allowed !== false) fail("Candidate public output must be false.");
if (candidates.generated_word_json_modified !== false) fail("Generated word must not be modified.");
if (candidates.ui_display_changed !== false) fail("UI must not change.");

for (const candidate of candidates.output_test_candidates) {
  if (!candidate.selected_approved_record_id || !candidate.evidence_id || !candidate.source_reference_id) {
    fail("Each candidate must preserve approved/evidence/source IDs.");
  }
  if (candidate.public_output_allowed !== false) fail("Candidate public output must remain false.");
  if (candidate.generated_word_json_replacement_allowed !== false) fail("Generated replacement must be blocked.");
  if (candidate.ui_display_allowed !== false) fail("UI display must be blocked.");
  if (candidate.runtime_selector_active_now !== false) fail("Runtime selector must remain inactive.");
  if (candidate.generated_output_created_for_public_surface !== false) fail("Public generated output must be false.");
  if (candidate.static_result_saving_candidate_for_ag69r !== true) fail("Candidate must be ready for AG69R static result saving.");
}

const gate = readJson("data/knowledge-base/word-of-day/ag69q-approved-output-test-gate-result.json");
if (gate.gate_passed !== true) fail("Output gate must pass.");
if (gate.output_test_candidate_count !== 4) fail("Output gate count must be 4.");
if (gate.static_result_saving_candidate_count_for_ag69r !== 4) fail("AG69R candidate count must be 4.");
if (gate.runtime_selector_active_now !== false) fail("Runtime selector must be false.");
if (gate.generated_word_json_modified !== false || gate.ui_display_changed !== false) fail("Generated/UI mutation must be false.");

const map = readJson("data/knowledge-base/word-of-day/ag69q-selector-to-output-test-map.json");
if (map.mapping_count !== 4) fail("Selector-output map count must be 4.");
for (const mapping of map.mappings) {
  if (mapping.public_output_allowed !== false) fail("Mapping public output must be false.");
  if (mapping.next_gate !== "AG69R static result saving and repeat-control history") fail("Next gate mismatch.");
}

const saving = readJson("data/knowledge-base/word-of-day/ag69q-result-saving-readiness-record.json");
if (saving.ready_for_static_result_saving !== true) fail("Static result saving readiness must be true.");
if (saving.static_result_saving_candidate_count_for_ag69r !== 4) fail("Static result saving candidate count must be 4.");
for (const blocked of [
  "generated/word-of-day.json replacement",
  "existing homepage Word card data-source replacement",
  "public Word output activation"
]) {
  if (!saving.blocked_until_ag69s.includes(blocked)) fail(`Result-saving blocker missing: ${blocked}`);
}

const publicBlock = readJson("data/knowledge-base/word-of-day/ag69q-public-output-block-audit.json");
if (publicBlock.audit_passed !== true) fail("Public block audit must pass.");
if (publicBlock.public_word_output_generated !== false) fail("Public word output must be false.");
if (publicBlock.generated_word_json_modified !== false || publicBlock.ui_display_changed !== false) fail("Generated/UI mutation must be false.");

const genBlock = readJson("data/knowledge-base/word-of-day/ag69q-no-generated-word-replacement-audit.json");
if (genBlock.audit_passed !== true) fail("Generated-word replacement audit must pass.");
if (genBlock.generated_word_json_modified !== false) fail("Generated word must not be modified.");
if (genBlock.generated_word_json_replaced !== false) fail("Generated word must not be replaced.");
if (genBlock.replacement_deferred_to !== "AG69S existing Word card data source replacement") fail("Replacement deferral mismatch.");

const uiBlock = readJson("data/knowledge-base/word-of-day/ag69q-no-ui-mutation-audit.json");
if (uiBlock.audit_passed !== true) fail("UI block audit must pass.");
if (uiBlock.index_html_modified !== false || uiBlock.ui_display_changed !== false) fail("UI mutation must be false.");

const panchangBlock = readJson("data/knowledge-base/word-of-day/ag69q-no-panchang-value-generation-audit.json");
if (panchangBlock.audit_passed !== true) fail("Panchang block audit must pass.");
if (panchangBlock.panchang_calculation_performed !== false) fail("Panchang calculation must be false.");
if (panchangBlock.panchang_value_generation_started !== false) fail("Panchang generation must be false.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69q-ag69r-static-result-saving-repeat-control-readiness-record.json");
if (readiness.ready_for_ag69r !== true) fail("AG69R readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69q-to-ag69r-static-result-saving-repeat-control-boundary.json");
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
  "data/content-intelligence/backend-architecture/ag69q-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69q-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69Q approved output test is present.");
pass("Four bounded output-test candidates are created from approved pilot records.");
pass("Result-saving readiness for AG69R is valid.");
pass("No generated-word replacement, UI mutation, public output, Panchang generation or runtime activation is recorded.");
pass("No backend/database/V02 activation is recorded.");
