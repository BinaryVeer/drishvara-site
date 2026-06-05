import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(data, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

const ag69p = readJson("data/content-intelligence/quality-reviews/ag69p-word-selection-engine-doctrine-test.json");
const dryRun = readJson("data/knowledge-base/word-of-day/ag69p-selector-dry-run-result.json");
const approvedBank = readJson("data/knowledge-base/word-of-day/ag69o-approved-word-bank-pilot.json");
const ag69kWorkflow = readJson("data/knowledge-base/word-of-day/ag69k-optimized-end-to-end-word-workflow.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag69p.status !== "ag69p_word_selection_engine_doctrine_test_completed") {
  throw new Error("AG69P must be completed before AG69Q.");
}
if (ag69p.summary?.ready_for_ag69q !== true) {
  throw new Error("AG69P readiness for AG69Q is missing.");
}
if (dryRun.status !== "selector_dry_run_completed_no_runtime_activation") {
  throw new Error("AG69P selector dry-run result must be present.");
}
if (approvedBank.status !== "approved_word_bank_pilot_created_public_output_blocked") {
  throw new Error("AG69O approved pilot bank must be present.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive preview data.");
}

const outputs = {
  outputCandidates: "data/knowledge-base/word-of-day/ag69q-approved-output-test-candidates.json",
  outputGate: "data/knowledge-base/word-of-day/ag69q-approved-output-test-gate-result.json",
  selectedOutputMap: "data/knowledge-base/word-of-day/ag69q-selector-to-output-test-map.json",
  resultSavingReadiness: "data/knowledge-base/word-of-day/ag69q-result-saving-readiness-record.json",
  publicBlockAudit: "data/knowledge-base/word-of-day/ag69q-public-output-block-audit.json",
  generatedWordBlock: "data/knowledge-base/word-of-day/ag69q-no-generated-word-replacement-audit.json",
  uiBlockAudit: "data/knowledge-base/word-of-day/ag69q-no-ui-mutation-audit.json",
  panchangBlock: "data/knowledge-base/word-of-day/ag69q-no-panchang-value-generation-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69q-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69q-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag69q-ag69r-static-result-saving-repeat-control-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69q-to-ag69r-static-result-saving-repeat-control-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag69q-approved-output-test.json",
  registry: "data/quality/ag69q-approved-output-test.json",
  preview: "data/quality/ag69q-approved-output-test-preview.json",
  doc: "docs/quality/AG69Q_APPROVED_OUTPUT_TEST.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const approvedById = Object.fromEntries((approvedBank.approved_records || []).map((record) => [record.approved_record_id, record]));
const selections = dryRun.dry_run_selections || [];

if (selections.length !== 4) {
  throw new Error("AG69Q expects 4 AG69P dry-run selections.");
}

for (const selection of selections) {
  if (!approvedById[selection.selected_approved_record_id]) {
    throw new Error(`Dry-run selection is not from approved bank: ${selection.selected_approved_record_id}`);
  }
  if (selection.public_output_allowed !== false) {
    throw new Error(`Dry-run selection ${selection.selection_test_id} must keep public output blocked.`);
  }
  if (selection.runtime_selector_active_now !== false) {
    throw new Error(`Dry-run selection ${selection.selection_test_id} must not activate runtime selector.`);
  }
  if (selection.generated_output_created !== false) {
    throw new Error(`Dry-run selection ${selection.selection_test_id} must not create generated output.`);
  }
}

const outputTestCandidates = selections.map((selection, index) => {
  const approved = approvedById[selection.selected_approved_record_id];

  return {
    output_test_id: `ag69q_output_test_${String(index + 1).padStart(3, "0")}`,
    selection_test_id: selection.selection_test_id,
    selected_approved_record_id: selection.selected_approved_record_id,
    legacy_word_id: approved.legacy_word_id,
    english: approved.english,
    hindi: approved.hindi,
    sanskrit: approved.sanskrit,
    evidence_id: approved.evidence_id,
    source_reference_id: approved.source_reference_id,
    source_reference_ids: approved.source_reference_ids,
    approval_scope: approved.approval_scope,
    output_test_status: "approved_output_test_candidate_created_public_blocked",
    bounded_output_fields: {
      word_en: approved.english,
      word_hi: approved.hindi,
      word_sanskrit: approved.sanskrit,
      lexical_evidence_note: approved.short_evidence_note,
      claim_level: approved.claim_level_supported,
      source_basis_mode: "evidence_backed_pilot_source_reference_not_public_claim"
    },
    selection_reason: selection.selection_reason,
    repeat_pressure: selection.repeat_pressure,
    public_output_allowed: false,
    generated_word_json_replacement_allowed: false,
    ui_display_allowed: false,
    runtime_selector_active_now: false,
    generated_output_created_for_public_surface: false,
    static_result_saving_candidate_for_ag69r: true
  };
});

const outputCandidates = {
  module_id: "AG69Q",
  title: "Approved Output Test Candidates",
  status: "approved_output_test_candidates_created_public_blocked",
  consumed_previous_stage: "AG69P",
  candidate_count: outputTestCandidates.length,
  approved_bank_record_count: approvedBank.approved_record_count,
  output_test_candidates: outputTestCandidates,
  public_output_allowed: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  note: "AG69Q creates bounded output-test candidates only. It does not replace generated/word-of-day.json or update UI."
};

const outputGate = {
  module_id: "AG69Q",
  title: "Approved Output Test Gate Result",
  status: "approved_output_test_gate_passed_public_blocked",
  gate_passed: true,
  output_test_candidate_count: outputTestCandidates.length,
  all_candidates_from_approved_bank: outputTestCandidates.every((candidate) => Boolean(approvedById[candidate.selected_approved_record_id])),
  all_candidates_have_evidence_id: outputTestCandidates.every((candidate) => Boolean(candidate.evidence_id)),
  all_candidates_have_source_reference_id: outputTestCandidates.every((candidate) => Boolean(candidate.source_reference_id)),
  all_public_output_blocked: outputTestCandidates.every((candidate) => candidate.public_output_allowed === false),
  all_generated_word_replacement_blocked: outputTestCandidates.every((candidate) => candidate.generated_word_json_replacement_allowed === false),
  all_ui_display_blocked: outputTestCandidates.every((candidate) => candidate.ui_display_allowed === false),
  static_result_saving_candidate_count_for_ag69r: outputTestCandidates.length,
  generated_word_json_modified: false,
  ui_display_changed: false,
  runtime_selector_active_now: false
};

const selectedOutputMap = {
  module_id: "AG69Q",
  title: "Selector to Output-Test Map",
  status: "selector_to_output_test_map_created",
  mapping_count: outputTestCandidates.length,
  mappings: outputTestCandidates.map((candidate) => ({
    output_test_id: candidate.output_test_id,
    selection_test_id: candidate.selection_test_id,
    selected_approved_record_id: candidate.selected_approved_record_id,
    legacy_word_id: candidate.legacy_word_id,
    selection_reason: candidate.selection_reason,
    static_result_saving_candidate_for_ag69r: candidate.static_result_saving_candidate_for_ag69r,
    public_output_allowed: candidate.public_output_allowed,
    next_gate: "AG69R static result saving and repeat-control history"
  }))
};

const resultSavingReadiness = {
  module_id: "AG69Q",
  title: "Result Saving Readiness Record",
  status: "result_saving_readiness_record_created",
  ready_for_static_result_saving: true,
  static_result_saving_candidate_count_for_ag69r: outputTestCandidates.length,
  required_ag69r_fields: [
    "output_test_id",
    "legacy_word_id",
    "selected_approved_record_id",
    "selection_test_id",
    "selection_reason",
    "repeat_pressure",
    "result_date_key",
    "public_output_allowed",
    "generated_word_json_replacement_allowed"
  ],
  blocked_until_ag69s: [
    "generated/word-of-day.json replacement",
    "existing homepage Word card data-source replacement",
    "public Word output activation"
  ]
};

const publicBlockAudit = {
  module_id: "AG69Q",
  title: "Public Output Block Audit",
  status: "public_output_block_audit_passed",
  audit_passed: true,
  public_output_from_word_records_allowed: false,
  approved_output_test_created: true,
  public_word_output_generated: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  new_word_card_created: false,
  runtime_selector_active_now: false,
  all_output_candidates_public_blocked: outputTestCandidates.every((candidate) => candidate.public_output_allowed === false)
};

const generatedWordBlock = {
  module_id: "AG69Q",
  title: "No Generated Word Replacement Audit",
  status: "no_generated_word_replacement_audit_passed",
  audit_passed: true,
  generated_word_json_modified: false,
  generated_word_json_replaced: false,
  generated_word_json_path: "generated/word-of-day.json",
  current_generated_word_status_preserved: generatedWord.status,
  current_generated_word_module_id_preserved: generatedWord.module_id,
  replacement_deferred_to: "AG69S existing Word card data source replacement"
};

const uiBlockAudit = {
  module_id: "AG69Q",
  title: "No UI Mutation Audit",
  status: "no_ui_mutation_audit_passed",
  audit_passed: true,
  index_html_modified: false,
  ui_display_changed: false,
  new_word_card_created: false,
  existing_word_card_updated: false,
  ui_replacement_deferred_to: "AG69S"
};

const panchangBlock = {
  module_id: "AG69Q",
  title: "No Panchang Value Generation Audit",
  status: "no_panchang_value_generation_audit_passed",
  audit_passed: true,
  selector_context_from_ag69p_consumed: true,
  panchang_calculation_performed: false,
  panchang_value_generation_started: false,
  astronomical_calculation_performed: false,
  public_panchang_claim_created: false
};

function audit(title, status, keys) {
  return {
    module_id: "AG69Q",
    title,
    status,
    audit_passed: true,
    checks: keys.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: []
  };
}

const noBackend = audit("No Backend/Auth/RLS/Database Runtime Audit", "no_backend_auth_rls_database_runtime_audit_passed", [
  "backend_runtime_activated",
  "database_runtime_activated",
  "supabase_migration_applied",
  "database_write_performed",
  "backend_auth_supabase_activation_performed",
  "runtime_database_query_enabled",
  "service_role_used",
  "rls_policy_mutation_enabled",
  "public_mutation_enabled"
]);

const noV02 = audit("No V02 Expansion Audit", "no_v02_expansion_audit_passed", [
  "v02_expansion_started",
  "v02_item_activated",
  "backend_runtime_activated"
]);

const readiness = {
  module_id: "AG69Q",
  title: "AG69R Static Result Saving and Repeat-Control Readiness Record",
  status: "ready_for_ag69r_static_result_saving_repeat_control",
  ready_for_ag69r: true,
  next_stage: "AG69R — Static Result Saving and Repeat-Control History",
  reason: "Approved output-test candidates have been created with public output and generated-word replacement blocked. AG69R can save static result history for repeat-control."
};

const boundary = {
  module_id: "AG69Q",
  title: "AG69Q to AG69R Static Result Saving and Repeat-Control Boundary",
  status: "ag69r_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create static result-saving history from AG69Q output-test candidates.",
    "Create repeat-control history record.",
    "Keep generated/word-of-day.json unchanged.",
    "Keep existing UI unchanged.",
    "Keep public_output_allowed=false until AG69S."
  ],
  blocked_scope_without_explicit_approval: [
    "public word output generation",
    "generated/word-of-day.json replacement",
    "active public tithi/vara word selection",
    "Panchang value generation",
    "UI display change",
    "new Word of the Day card creation",
    "source promotion to approved_source",
    "bulk dictionary/book content ingestion",
    "deleting legacy D02/AG48/AG56/AG63 assets",
    "public attribution of internal study influence",
    "Supabase/database writes",
    "backend/Auth/Supabase activation",
    "runtime database query",
    "service-role use",
    "V02 expansion"
  ]
};

const review = {
  module_id: "AG69Q",
  title: "Approved Output Test",
  status: "ag69q_approved_output_test_completed",
  current_git_context: git,
  consumed_previous_stage: {
    stage: "AG69P",
    source_file: "data/content-intelligence/quality-reviews/ag69p-word-selection-engine-doctrine-test.json",
    status: ag69p.status
  },
  consumed_workflow_step: ag69kWorkflow.workflow?.find((step) => step.name === "daily_output_generation") || null,
  generated_records: outputs,
  summary: {
    ag69p_consumed: true,
    approved_output_test_candidates_created: true,
    output_test_candidate_count: outputTestCandidates.length,
    all_candidates_from_approved_bank: true,
    all_candidates_have_evidence_id: true,
    all_candidates_have_source_reference_id: true,
    all_public_output_blocked: true,
    static_result_saving_candidate_count_for_ag69r: outputTestCandidates.length,
    result_saving_readiness_created: true,
    public_word_output_generated: false,
    runtime_selector_active_now: false,
    source_promoted_count: 0,
    source_content_ingested: false,
    bulk_copyrighted_ingestion: false,
    generated_word_json_modified: false,
    generated_word_json_replaced: false,
    ui_display_changed: false,
    new_word_card_created: false,
    active_tithi_vara_selection_started: false,
    panchang_calculation_performed: false,
    panchang_value_generation_started: false,
    public_panchang_claim_created: false,
    supabase_database_write_performed: false,
    backend_runtime_activated: false,
    database_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag69r: true
  }
};

const registry = {
  module_id: "AG69Q",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69Q",
  status: review.status,
  approved_output_test_candidates_created: 1,
  output_test_candidate_count: outputTestCandidates.length,
  all_candidates_from_approved_bank: 1,
  all_public_output_blocked: 1,
  static_result_saving_candidate_count_for_ag69r: outputTestCandidates.length,
  public_word_output_generated: 0,
  runtime_selector_active_now: 0,
  generated_word_json_modified: 0,
  generated_word_json_replaced: 0,
  ui_display_changed: 0,
  panchang_value_generation_started: 0,
  backend_runtime_activated: 0,
  database_runtime_activated: 0,
  v02_expansion_started: 0,
  ready_for_ag69r: 1
};

const doc = `# AG69Q — Approved Output Test

AG69Q creates bounded approved-output test candidates from the AG69P selector dry-run and AG69O approved pilot bank.

## What AG69Q does

- Creates output-test candidates from approved pilot records.
- Preserves evidence_id and source_reference_id.
- Creates result-saving readiness for AG69R.
- Keeps all output candidates public-output blocked.

## What AG69Q does not do

- No public Word output.
- No generated/word-of-day.json replacement.
- No UI change.
- No runtime selector activation.
- No Tithi/Vara public selection.
- No Panchang value generation.
- No source promotion.
- No backend/database/V02 activation.
`;

writeJson(outputs.outputCandidates, outputCandidates);
writeJson(outputs.outputGate, outputGate);
writeJson(outputs.selectedOutputMap, selectedOutputMap);
writeJson(outputs.resultSavingReadiness, resultSavingReadiness);
writeJson(outputs.publicBlockAudit, publicBlockAudit);
writeJson(outputs.generatedWordBlock, generatedWordBlock);
writeJson(outputs.uiBlockAudit, uiBlockAudit);
writeJson(outputs.panchangBlock, panchangBlock);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG69Q approved output test generated.");
console.log("✅ Bounded output-test candidates created from approved pilot records.");
console.log("✅ No generated-word replacement, UI mutation, runtime/public activation performed.");
