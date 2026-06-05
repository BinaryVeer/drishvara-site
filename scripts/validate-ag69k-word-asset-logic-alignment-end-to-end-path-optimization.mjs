import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69K validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69k-word-asset-logic-alignment-end-to-end-path-optimization.mjs",
  "scripts/validate-ag69k-word-asset-logic-alignment-end-to-end-path-optimization.mjs",
  "data/knowledge-base/word-of-day/ag69k-word-asset-chain-inventory.json",
  "data/knowledge-base/word-of-day/ag69k-word-logic-extraction-register.json",
  "data/knowledge-base/word-of-day/ag69k-duplicate-overlap-conflict-register.json",
  "data/knowledge-base/word-of-day/ag69k-retain-merge-defer-block-optimization-decision-register.json",
  "data/knowledge-base/word-of-day/ag69k-word-source-of-truth-map.json",
  "data/knowledge-base/word-of-day/ag69k-optimized-end-to-end-word-workflow.json",
  "data/knowledge-base/word-of-day/ag69k-future-execution-sequence-map.json",
  "data/knowledge-base/word-of-day/ag69k-current-public-ui-contract-preservation-record.json",
  "data/knowledge-base/word-of-day/ag69k-evidence-readiness-decision-no-attachment.json",
  "data/knowledge-base/word-of-day/ag69k-no-generated-word-or-ui-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag69k-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69k-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69k-ag69l-manual-pilot-evidence-capture-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69k-to-ag69l-manual-pilot-evidence-capture-boundary.json",
  "data/content-intelligence/quality-reviews/ag69k-word-asset-logic-alignment-end-to-end-path-optimization.json",
  "data/quality/ag69k-word-asset-logic-alignment-end-to-end-path-optimization.json",
  "data/quality/ag69k-word-asset-logic-alignment-end-to-end-path-optimization-preview.json",
  "docs/quality/AG69K_WORD_ASSET_LOGIC_ALIGNMENT_END_TO_END_PATH_OPTIMIZATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69k"]) fail("Missing generate:ag69k script.");
if (!pkg.scripts?.["validate:ag69k"]) fail("Missing validate:ag69k script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69k")) fail("validate:project must include validate:ag69k.");

const review = readJson("data/content-intelligence/quality-reviews/ag69k-word-asset-logic-alignment-end-to-end-path-optimization.json");
if (review.status !== "ag69k_word_asset_logic_alignment_end_to_end_path_optimization_completed") fail("Review status mismatch.");

for (const key of [
  "asset_based_discovery_recorded",
  "logic_extraction_register_created",
  "duplicate_overlap_conflict_register_created",
  "optimization_decision_register_created",
  "source_of_truth_map_created",
  "optimized_end_to_end_workflow_defined",
  "future_execution_sequence_created",
  "current_public_ui_contract_preserved",
  "evidence_readiness_decision_no_attachment",
  "ready_for_ag69l"
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

if (review.summary.matched_tracked_file_count < 80) fail("Matched tracked file count must show full asset discovery.");
if (review.summary.source_evidence_attached_count !== 0) fail("No source evidence may be attached.");
if (review.summary.source_reference_ids_attached_to_word_records_count !== 0) fail("No word source refs may be attached.");
if (review.summary.source_promoted_count !== 0) fail("No source may be promoted.");

const inventory = readJson("data/knowledge-base/word-of-day/ag69k-word-asset-chain-inventory.json");
if (inventory.discovery_scope !== "asset_based_full_chain_across_all_series_not_latest_patch_only") fail("Inventory discovery scope mismatch.");
for (const family of [
  "d_series_daily_guidance",
  "ag47_ag48_word_reflection_rotation",
  "ag56_preview_smoke_test",
  "ag63_word_working_data_ui",
  "ag69_governed_knowledge_bank_chain"
]) {
  if (!inventory.families[family] || inventory.families[family].length < 1) fail(`Missing family in inventory: ${family}`);
}

const logic = readJson("data/knowledge-base/word-of-day/ag69k-word-logic-extraction-register.json");
if (logic.extracted_logic.length < 7) fail("Logic extraction register must include major logic families.");
for (const logicId of [
  "d02_curated_preview_bank",
  "ag48_rotation_repeat_language_safety",
  "ag63_public_preview_ui_contract",
  "ag69_methodology_first_bank",
  "ag69e_tithi_vara_selection_context",
  "ag69j_pilot_lexical_source_capture"
]) {
  if (!logic.extracted_logic.some((x) => x.logic_id === logicId)) fail(`Missing extracted logic: ${logicId}`);
}

const overlap = readJson("data/knowledge-base/word-of-day/ag69k-duplicate-overlap-conflict-register.json");
if (overlap.items.length < 6) fail("Overlap/conflict register must include key issues.");
for (const issueId of [
  "d02_approval_vs_ag69_approval",
  "d02_rotation_vs_ag69_tithi_vara_selector",
  "ag63_generated_output_vs_ag69_future_output",
  "word_reflection_bridge_vs_word_only_pipeline",
  "sanskritdictionary_scout_vs_approved_source"
]) {
  if (!overlap.items.some((x) => x.issue_id === issueId)) fail(`Missing overlap/conflict issue: ${issueId}`);
}

const decisions = readJson("data/knowledge-base/word-of-day/ag69k-retain-merge-defer-block-optimization-decision-register.json");
for (const decisionId of [
  "retain_d02_seed",
  "merge_rotation_logic",
  "retain_ag63_ui",
  "block_duplicate_ui",
  "defer_tithi_vara",
  "block_scout_as_evidence",
  "remove_runtime_complexity_reflection_mantra_sutra"
]) {
  if (!decisions.decisions.some((x) => x.decision_id === decisionId)) fail(`Missing optimization decision: ${decisionId}`);
}

const sourceMap = readJson("data/knowledge-base/word-of-day/ag69k-word-source-of-truth-map.json");
const layers = sourceMap.source_of_truth_layers.map((x) => x.layer_id);
for (const layer of [
  "active_public_preview_surface",
  "legacy_seed_bank",
  "governed_future_bank",
  "selection_logic_future",
  "adjacent_safety_context"
]) {
  if (!layers.includes(layer)) fail(`Missing source-of-truth layer: ${layer}`);
}
if (sourceMap.current_public_generated_word_contract.file !== "generated/word-of-day.json") fail("Generated word contract file mismatch.");
if (sourceMap.current_public_generated_word_contract.dynamic_rotation_active !== false) fail("Dynamic rotation must remain false.");

const workflow = readJson("data/knowledge-base/word-of-day/ag69k-optimized-end-to-end-word-workflow.json");
if (workflow.workflow.length !== 11) fail("Optimized workflow must contain 11 steps.");
for (const step of [
  "asset_discovery",
  "candidate_word_pool",
  "lexical_source_capture",
  "language_and_form_validation",
  "reviewed_bank_gate",
  "approved_bank_gate",
  "selection_engine",
  "daily_output_generation",
  "result_saving_model",
  "existing_ui_update",
  "closure"
]) {
  if (!workflow.workflow.some((x) => x.name === step)) fail(`Workflow step missing: ${step}`);
}

const future = readJson("data/knowledge-base/word-of-day/ag69k-future-execution-sequence-map.json");
if (future.next_sequence.length < 8) fail("Future execution sequence must include AG69L onward.");
if (future.next_sequence[0].stage !== "AG69L") fail("Next sequence must start with AG69L.");

const publicContract = readJson("data/knowledge-base/word-of-day/ag69k-current-public-ui-contract-preservation-record.json");
if (publicContract.status !== "current_public_ui_contract_preserved_no_mutation") fail("Public contract status mismatch.");
if (!publicContract.ui_reference_checks.every((x) => x.passed === true)) fail("Core UI reference checks must pass.");
if (publicContract.visible_data_source !== "generated/word-of-day.json") fail("Visible data source mismatch.");

const evidence = readJson("data/knowledge-base/word-of-day/ag69k-evidence-readiness-decision-no-attachment.json");
if (evidence.source_evidence_attached_count !== 0) fail("Evidence attachment count must be 0.");
if (evidence.generated_word_json_modified !== false) fail("Generated word must not be modified.");
if (evidence.next_safe_stage !== "AG69L — Manual Pilot Lexical Evidence Capture") fail("Next safe stage mismatch.");

const mutation = readJson("data/knowledge-base/word-of-day/ag69k-no-generated-word-or-ui-mutation-audit.json");
if (mutation.audit_passed !== true) fail("Mutation audit must pass.");
if (mutation.failed_checks.length !== 0) fail("Mutation audit failed checks must be empty.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69k-ag69l-manual-pilot-evidence-capture-readiness-record.json");
if (readiness.ready_for_ag69l !== true) fail("AG69L readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69k-to-ag69l-manual-pilot-evidence-capture-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocked of [
  "bulk dictionary/book content ingestion",
  "approved word bank creation",
  "generated/word-of-day.json replacement",
  "active tithi/vara word selection",
  "Panchang value generation",
  "UI display change",
  "new Word of the Day card creation",
  "deleting legacy D02/AG48/AG56/AG63 assets",
  "Supabase/database writes",
  "V02 expansion"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocked)) fail(`Boundary blocker missing: ${blocked}`);
}

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag69k-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69k-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69K asset-logic alignment and end-to-end path optimization is present.");
pass("Full Word asset discovery covers historical, active, governed and adjacent logic families.");
pass("Logic extraction, conflict/overlap, optimization decisions and source-of-truth map are valid.");
pass("Optimized end-to-end Word workflow and future execution sequence are defined.");
pass("Current public Word UI contract is preserved.");
pass("No evidence attachment, UI mutation, generated-word replacement, Tithi/Vara activation, Panchang generation, backend/database/V02 activation is recorded.");
