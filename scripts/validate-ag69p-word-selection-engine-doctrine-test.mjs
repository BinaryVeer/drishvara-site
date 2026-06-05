import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69P validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69p-word-selection-engine-doctrine-test.mjs",
  "scripts/validate-ag69p-word-selection-engine-doctrine-test.mjs",
  "data/knowledge-base/word-of-day/ag69p-word-selection-engine-doctrine.json",
  "data/knowledge-base/word-of-day/ag69p-word-selection-input-contract.json",
  "data/knowledge-base/word-of-day/ag69p-word-selection-priority-and-repeat-control-rules.json",
  "data/knowledge-base/word-of-day/ag69p-selector-dry-run-fixtures.json",
  "data/knowledge-base/word-of-day/ag69p-selector-dry-run-result.json",
  "data/knowledge-base/word-of-day/ag69p-no-runtime-selector-activation-audit.json",
  "data/knowledge-base/word-of-day/ag69p-no-panchang-value-generation-audit.json",
  "data/knowledge-base/word-of-day/ag69p-public-output-block-audit.json",
  "data/knowledge-base/word-of-day/ag69p-no-generated-word-or-ui-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag69p-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69p-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69p-ag69q-approved-output-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69p-to-ag69q-approved-output-test-boundary.json",
  "data/content-intelligence/quality-reviews/ag69p-word-selection-engine-doctrine-test.json",
  "data/quality/ag69p-word-selection-engine-doctrine-test.json",
  "data/quality/ag69p-word-selection-engine-doctrine-test-preview.json",
  "docs/quality/AG69P_WORD_SELECTION_ENGINE_DOCTRINE_TEST.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69p"]) fail("Missing generate:ag69p script.");
if (!pkg.scripts?.["validate:ag69p"]) fail("Missing validate:ag69p script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69p")) fail("validate:project must include validate:ag69p.");

const review = readJson("data/content-intelligence/quality-reviews/ag69p-word-selection-engine-doctrine-test.json");
if (review.status !== "ag69p_word_selection_engine_doctrine_test_completed") fail("Review status mismatch.");

for (const key of [
  "ag69o_consumed",
  "selector_doctrine_defined",
  "selector_input_contract_defined",
  "selector_priority_rules_defined",
  "selector_static_dry_run_completed",
  "all_selected_from_approved_bank",
  "duplicate_control_tested",
  "tithi_context_label_tested_without_calculation",
  "vara_context_label_tested_without_calculation",
  "ready_for_ag69q"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "runtime_selector_active_now",
  "public_runtime_selection_enabled",
  "public_output_from_word_records_allowed",
  "generated_output_created",
  "source_content_ingested",
  "bulk_copyrighted_ingestion",
  "generated_word_json_modified",
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

if (review.summary.approved_bank_record_count !== 3) fail("Approved bank record count must be 3.");
if (review.summary.dry_run_count !== 4) fail("Dry-run count must be 4.");
if (review.summary.source_promoted_count !== 0) fail("Source promoted count must be 0.");

const doctrine = readJson("data/knowledge-base/word-of-day/ag69p-word-selection-engine-doctrine.json");
if (doctrine.status !== "word_selection_engine_doctrine_defined_not_runtime_active") fail("Doctrine status mismatch.");
if (doctrine.runtime_selector_active_now !== false) fail("Runtime selector must be inactive.");
if (doctrine.tithi_vara_policy.panchang_calculation_allowed_in_ag69p !== false) fail("Panchang calculation must be blocked.");
if (doctrine.tithi_vara_policy.panchang_value_generation_allowed_in_ag69p !== false) fail("Panchang value generation must be blocked.");
if (doctrine.doctrine_rules.length < 6) fail("Doctrine must include at least 6 rules.");

const input = readJson("data/knowledge-base/word-of-day/ag69p-word-selection-input-contract.json");
if (input.context_input_contract.panchang_calculation_allowed !== false) fail("Input contract must block Panchang calculation.");
if (input.context_input_contract.panchang_value_generation_allowed !== false) fail("Input contract must block Panchang generation.");
for (const blocked of [
  "calculated_tithi_value",
  "calculated_vara_value",
  "astronomical_longitude",
  "runtime_panchang_result",
  "public_panchang_claim"
]) {
  if (!input.context_input_contract.blocked_fields_in_ag69p.includes(blocked)) fail(`Blocked context field missing: ${blocked}`);
}

const priority = readJson("data/knowledge-base/word-of-day/ag69p-word-selection-priority-and-repeat-control-rules.json");
if (priority.status !== "word_selection_priority_repeat_control_rules_defined") fail("Priority rules status mismatch.");
if (!priority.priority_order.includes("recent_duplicate_filter")) fail("Duplicate filter missing.");
if (!priority.priority_order.includes("tithi_context_theme_match")) fail("Tithi context rule missing.");
if (!priority.priority_order.includes("vara_context_theme_match")) fail("Vara context rule missing.");

const fixtures = readJson("data/knowledge-base/word-of-day/ag69p-selector-dry-run-fixtures.json");
if (fixtures.fixtures.length !== 4) fail("Fixture count must be 4.");
if (fixtures.panchang_values_generated !== false) fail("Fixtures must not generate Panchang values.");

const dryRun = readJson("data/knowledge-base/word-of-day/ag69p-selector-dry-run-result.json");
if (dryRun.status !== "selector_dry_run_completed_no_runtime_activation") fail("Dry-run status mismatch.");
if (dryRun.dry_run_count !== 4) fail("Dry-run count must be 4.");
if (dryRun.panchang_values_generated !== false) fail("Dry-run must not generate Panchang values.");
if (dryRun.runtime_selector_active_now !== false) fail("Runtime selector must be inactive.");
if (dryRun.public_output_allowed !== false) fail("Dry-run public output must be false.");
if (dryRun.generated_output_created !== false) fail("Dry-run must not create generated output.");
for (const key of [
  "all_selected_from_approved_bank",
  "all_public_output_blocked",
  "no_runtime_selector_activation",
  "duplicate_control_tested",
  "tithi_context_label_tested_without_calculation",
  "vara_context_label_tested_without_calculation"
]) {
  if (dryRun.dry_run_assertions[key] !== true) fail(`Dry-run assertion failed: ${key}`);
}

const selectorBlock = readJson("data/knowledge-base/word-of-day/ag69p-no-runtime-selector-activation-audit.json");
if (selectorBlock.audit_passed !== true) fail("Selector activation audit must pass.");
if (selectorBlock.runtime_selector_active_now !== false) fail("Runtime selector must be false.");
if (selectorBlock.active_public_tithi_vara_selection_started !== false) fail("Public Tithi/Vara selector must be false.");

const panchangBlock = readJson("data/knowledge-base/word-of-day/ag69p-no-panchang-value-generation-audit.json");
if (panchangBlock.audit_passed !== true) fail("Panchang block audit must pass.");
if (panchangBlock.tithi_context_label_tested !== true) fail("Tithi label test must be recorded.");
if (panchangBlock.vara_context_label_tested !== true) fail("Vara label test must be recorded.");
if (panchangBlock.panchang_calculation_performed !== false) fail("Panchang calculation must be false.");
if (panchangBlock.panchang_value_generation_started !== false) fail("Panchang generation must be false.");

const publicBlock = readJson("data/knowledge-base/word-of-day/ag69p-public-output-block-audit.json");
if (publicBlock.audit_passed !== true) fail("Public block audit must pass.");
if (publicBlock.generated_output_created !== false) fail("Generated output must be false.");
if (publicBlock.generated_word_json_modified !== false || publicBlock.ui_display_changed !== false) fail("Generated/UI mutation must be false.");

const mutation = readJson("data/knowledge-base/word-of-day/ag69p-no-generated-word-or-ui-mutation-audit.json");
if (mutation.audit_passed !== true) fail("Mutation audit must pass.");
if (mutation.failed_checks.length !== 0) fail("Mutation audit failed_checks must be empty.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69p-ag69q-approved-output-test-readiness-record.json");
if (readiness.ready_for_ag69q !== true) fail("AG69Q readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69p-to-ag69q-approved-output-test-boundary.json");
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
  "data/content-intelligence/backend-architecture/ag69p-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69p-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69P word selection engine doctrine/test is present.");
pass("Selector doctrine, input contract, priority rules and dry-run results are valid.");
pass("Duplicate-control, Tithi-label and Vara-label handling are tested without Panchang calculation.");
pass("Runtime selector remains inactive and public output remains blocked.");
pass("No generated-word replacement, UI mutation, Panchang generation, backend/database/V02 activation is recorded.");
