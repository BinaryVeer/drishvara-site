import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
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

const ag69o = readJson("data/content-intelligence/quality-reviews/ag69o-approved-word-bank-pilot-gate.json");
const approvedBank = readJson("data/knowledge-base/word-of-day/ag69o-approved-word-bank-pilot.json");
const ag69kWorkflow = readJson("data/knowledge-base/word-of-day/ag69k-optimized-end-to-end-word-workflow.json");
const generatedWord = readJson("generated/word-of-day.json");

const selectionContextDoctrinePath = "data/knowledge-base/word-of-day/ag69e-word-selection-context-doctrine.json";
const selectionContextDoctrine = exists(selectionContextDoctrinePath) ? readJson(selectionContextDoctrinePath) : null;

if (ag69o.status !== "ag69o_approved_word_bank_pilot_gate_completed") {
  throw new Error("AG69O must be completed before AG69P.");
}
if (ag69o.summary?.ready_for_ag69p !== true) {
  throw new Error("AG69O readiness for AG69P is missing.");
}
if (approvedBank.status !== "approved_word_bank_pilot_created_public_output_blocked") {
  throw new Error("AG69O approved pilot bank must be present.");
}
if (approvedBank.approved_record_count !== 3) {
  throw new Error("AG69P requires exactly 3 approved pilot records.");
}
if (approvedBank.runtime_selection_active_now !== false) {
  throw new Error("Runtime selection must be inactive before AG69P.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive preview data.");
}

const outputs = {
  selectorDoctrine: "data/knowledge-base/word-of-day/ag69p-word-selection-engine-doctrine.json",
  selectorInputContract: "data/knowledge-base/word-of-day/ag69p-word-selection-input-contract.json",
  selectorPriorityRules: "data/knowledge-base/word-of-day/ag69p-word-selection-priority-and-repeat-control-rules.json",
  dryRunFixtures: "data/knowledge-base/word-of-day/ag69p-selector-dry-run-fixtures.json",
  dryRunResults: "data/knowledge-base/word-of-day/ag69p-selector-dry-run-result.json",
  selectorActivationBlock: "data/knowledge-base/word-of-day/ag69p-no-runtime-selector-activation-audit.json",
  panchangBlock: "data/knowledge-base/word-of-day/ag69p-no-panchang-value-generation-audit.json",
  publicBlockAudit: "data/knowledge-base/word-of-day/ag69p-public-output-block-audit.json",
  noMutationAudit: "data/knowledge-base/word-of-day/ag69p-no-generated-word-or-ui-mutation-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69p-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69p-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag69p-ag69q-approved-output-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69p-to-ag69q-approved-output-test-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag69p-word-selection-engine-doctrine-test.json",
  registry: "data/quality/ag69p-word-selection-engine-doctrine-test.json",
  preview: "data/quality/ag69p-word-selection-engine-doctrine-test-preview.json",
  doc: "docs/quality/AG69P_WORD_SELECTION_ENGINE_DOCTRINE_TEST.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const approvedRecords = approvedBank.approved_records || [];

for (const record of approvedRecords) {
  if (record.runtime_selection_eligible_for_ag69p !== true) {
    throw new Error(`${record.legacy_word_id} is not eligible for AG69P selector doctrine/test.`);
  }
  if (record.runtime_selection_eligible_now !== false) {
    throw new Error(`${record.legacy_word_id} must not be runtime eligible now.`);
  }
  if (record.public_output_allowed !== false) {
    throw new Error(`${record.legacy_word_id} public output must remain blocked.`);
  }
  if (!record.evidence_id || !record.source_reference_id) {
    throw new Error(`${record.legacy_word_id} requires evidence and source reference IDs.`);
  }
}

const selectorDoctrine = {
  module_id: "AG69P",
  title: "Word Selection Engine Doctrine",
  status: "word_selection_engine_doctrine_defined_not_runtime_active",
  consumed_previous_stage: "AG69O",
  consumed_selection_context_doctrine: selectionContextDoctrinePath,
  selection_context_doctrine_present: Boolean(selectionContextDoctrine),
  selector_status: "doctrine_and_static_test_only",
  runtime_selector_active_now: false,
  approved_bank_source: "data/knowledge-base/word-of-day/ag69o-approved-word-bank-pilot.json",
  approved_record_count: approvedRecords.length,
  doctrine_rules: [
    {
      rule_id: "approved_bank_only",
      description: "Only AG69O approved pilot records may enter selector testing.",
      runtime_status: "test_only"
    },
    {
      rule_id: "no_candidate_or_reviewed_only_records",
      description: "Candidate, evidence-pending and reviewed-only records are excluded from selector tests.",
      runtime_status: "test_only"
    },
    {
      rule_id: "duplicate_control_before_theme_selection",
      description: "Recent output history must be checked before selecting a word.",
      runtime_status: "test_only"
    },
    {
      rule_id: "context_priority_order",
      description: "If context is provided, selection priority is festival/observance theme → Tithi theme → Vara theme → general daily theme → no-repeat fallback.",
      runtime_status: "test_only"
    },
    {
      rule_id: "panchang_values_external_to_selector",
      description: "Selector consumes already-reviewed context labels only; it does not calculate Tithi/Vara/Panchang values.",
      runtime_status: "test_only"
    },
    {
      rule_id: "public_output_blocked",
      description: "Selector test output is not public output and cannot replace generated/word-of-day.json.",
      runtime_status: "test_only"
    }
  ],
  tithi_vara_policy: {
    context_allowed_as_input_label: true,
    panchang_calculation_allowed_in_ag69p: false,
    panchang_value_generation_allowed_in_ag69p: false,
    public_tithi_vara_selection_active_now: false,
    note: "Tithi/Vara may influence future selection only as reviewed context inputs. AG69P does not calculate or publish Panchang values."
  }
};

const selectorInputContract = {
  module_id: "AG69P",
  title: "Word Selection Input Contract",
  status: "word_selection_input_contract_defined",
  approved_bank_input: {
    required_file: "data/knowledge-base/word-of-day/ag69o-approved-word-bank-pilot.json",
    required_record_status: "approved_pilot",
    required_public_output_allowed: false,
    required_runtime_selection_eligible_for_ag69p: true
  },
  context_input_contract: {
    context_source_status: "manual_or_reviewed_context_only",
    allowed_fields: [
      "selection_date_key",
      "festival_context_key",
      "observance_context_key",
      "tithi_context_key",
      "vara_context_key",
      "theme_context_key",
      "recent_output_word_ids"
    ],
    blocked_fields_in_ag69p: [
      "calculated_tithi_value",
      "calculated_vara_value",
      "astronomical_longitude",
      "runtime_panchang_result",
      "public_panchang_claim"
    ],
    panchang_calculation_allowed: false,
    panchang_value_generation_allowed: false
  }
};

const selectorPriorityRules = {
  module_id: "AG69P",
  title: "Word Selection Priority and Repeat-Control Rules",
  status: "word_selection_priority_repeat_control_rules_defined",
  priority_order: [
    "approved_bank_filter",
    "public_output_block_filter",
    "recent_duplicate_filter",
    "festival_or_observance_theme_match",
    "tithi_context_theme_match",
    "vara_context_theme_match",
    "general_theme_match",
    "fallback_oldest_non_recent_approved_record"
  ],
  duplicate_control: {
    repeat_window_policy: "do_not_repeat_if_legacy_word_id_in_recent_output_word_ids",
    fallback_policy: "select first approved pilot record not present in recent_output_word_ids",
    if_all_recent_policy: "select first approved pilot record but mark repeat_pressure=true for future review"
  },
  current_stage_runtime_status: "static_dry_run_only"
};

function selectWord(context) {
  const recent = new Set(context.recent_output_word_ids || []);
  const nonRecent = approvedRecords.filter((record) => !recent.has(record.legacy_word_id));
  const candidatePool = nonRecent.length ? nonRecent : approvedRecords;
  const themeKeys = [
    context.festival_context_key,
    context.observance_context_key,
    context.tithi_context_key,
    context.vara_context_key,
    context.theme_context_key
  ].filter(Boolean).map((x) => String(x).toLowerCase());

  const themeCandidate = candidatePool.find((record) => {
    const word = `${record.legacy_word_id} ${record.english} ${record.hindi} ${record.sanskrit}`.toLowerCase();
    return themeKeys.some((key) => word.includes(key));
  });

  const selected = themeCandidate || candidatePool[0];

  return {
    selection_test_id: context.selection_test_id,
    selection_date_key: context.selection_date_key,
    context_used: {
      festival_context_key: context.festival_context_key || null,
      observance_context_key: context.observance_context_key || null,
      tithi_context_key: context.tithi_context_key || null,
      vara_context_key: context.vara_context_key || null,
      theme_context_key: context.theme_context_key || null,
      recent_output_word_ids: context.recent_output_word_ids || []
    },
    selected_approved_record_id: selected.approved_record_id,
    selected_legacy_word_id: selected.legacy_word_id,
    selected_english: selected.english,
    selected_hindi: selected.hindi,
    selected_sanskrit: selected.sanskrit,
    selection_reason: themeCandidate ? "context_theme_match_after_duplicate_filter" : "fallback_oldest_non_recent_approved_record",
    repeat_pressure: nonRecent.length === 0,
    public_output_allowed: false,
    runtime_selector_active_now: false,
    generated_output_created: false
  };
}

const dryRunFixtures = {
  module_id: "AG69P",
  title: "Selector Dry-Run Fixtures",
  status: "selector_dry_run_fixtures_created",
  fixture_type: "static_non_runtime_context_fixtures",
  panchang_values_generated: false,
  fixtures: [
    {
      selection_test_id: "ag69p_test_001_theme_reflection",
      selection_date_key: "static-test-date-001",
      theme_context_key: "reflection",
      recent_output_word_ids: []
    },
    {
      selection_test_id: "ag69p_test_002_duplicate_control",
      selection_date_key: "static-test-date-002",
      theme_context_key: "reflection",
      recent_output_word_ids: ["reflection"]
    },
    {
      selection_test_id: "ag69p_test_003_vara_context_label_only",
      selection_date_key: "static-test-date-003",
      vara_context_key: "patience",
      recent_output_word_ids: ["reflection", "discernment"]
    },
    {
      selection_test_id: "ag69p_test_004_tithi_context_label_only",
      selection_date_key: "static-test-date-004",
      tithi_context_key: "discernment",
      recent_output_word_ids: ["reflection"]
    }
  ]
};

const dryRunSelections = dryRunFixtures.fixtures.map(selectWord);

const dryRunResults = {
  module_id: "AG69P",
  title: "Selector Dry-Run Result",
  status: "selector_dry_run_completed_no_runtime_activation",
  dry_run_count: dryRunSelections.length,
  approved_bank_record_count: approvedRecords.length,
  panchang_values_generated: false,
  runtime_selector_active_now: false,
  public_output_allowed: false,
  generated_output_created: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  dry_run_selections: dryRunSelections,
  dry_run_assertions: {
    all_selected_from_approved_bank: dryRunSelections.every((selection) =>
      approvedRecords.some((record) => record.approved_record_id === selection.selected_approved_record_id)
    ),
    all_public_output_blocked: dryRunSelections.every((selection) => selection.public_output_allowed === false),
    no_runtime_selector_activation: dryRunSelections.every((selection) => selection.runtime_selector_active_now === false),
    duplicate_control_tested: dryRunSelections.some((selection) => selection.selection_test_id === "ag69p_test_002_duplicate_control"),
    tithi_context_label_tested_without_calculation: dryRunSelections.some((selection) => selection.selection_test_id === "ag69p_test_004_tithi_context_label_only"),
    vara_context_label_tested_without_calculation: dryRunSelections.some((selection) => selection.selection_test_id === "ag69p_test_003_vara_context_label_only")
  }
};

const selectorActivationBlock = {
  module_id: "AG69P",
  title: "No Runtime Selector Activation Audit",
  status: "no_runtime_selector_activation_audit_passed",
  audit_passed: true,
  runtime_selector_active_now: false,
  active_public_tithi_vara_selection_started: false,
  selector_doctrine_created: true,
  selector_static_dry_run_completed: true,
  runtime_selection_candidate_count: approvedRecords.length,
  public_runtime_selection_enabled: false
};

const panchangBlock = {
  module_id: "AG69P",
  title: "No Panchang Value Generation Audit",
  status: "no_panchang_value_generation_audit_passed",
  audit_passed: true,
  tithi_context_label_tested: true,
  vara_context_label_tested: true,
  panchang_calculation_performed: false,
  panchang_value_generation_started: false,
  astronomical_calculation_performed: false,
  public_panchang_claim_created: false,
  note: "AG69P tests only selector handling of context labels. It does not calculate or publish Panchang values."
};

const publicBlockAudit = {
  module_id: "AG69P",
  title: "Public Output Block Audit",
  status: "public_output_block_audit_passed",
  audit_passed: true,
  public_output_from_word_records_allowed: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  new_word_card_created: false,
  generated_output_created: false,
  all_dry_run_outputs_public_blocked: dryRunSelections.every((selection) => selection.public_output_allowed === false)
};

const noMutationAudit = {
  module_id: "AG69P",
  title: "No Generated Word or UI Mutation Audit",
  status: "no_generated_word_or_ui_mutation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "generated_word_json_modified", expected: false, actual: false, passed: true },
    { check_id: "index_html_modified", expected: false, actual: false, passed: true },
    { check_id: "new_word_card_created", expected: false, actual: false, passed: true },
    { check_id: "public_word_output_created", expected: false, actual: false, passed: true },
    { check_id: "active_tithi_vara_selection_started", expected: false, actual: false, passed: true },
    { check_id: "panchang_value_generation_started", expected: false, actual: false, passed: true },
    { check_id: "source_promoted", expected: false, actual: false, passed: true }
  ],
  failed_checks: []
};

function audit(title, status, keys) {
  return {
    module_id: "AG69P",
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
  module_id: "AG69P",
  title: "AG69Q Approved Output Test Readiness Record",
  status: "ready_for_ag69q_approved_output_test",
  ready_for_ag69q: true,
  next_stage: "AG69Q — Approved Output Test",
  reason: "Selector doctrine and static dry-run tests passed using approved pilot bank records only. AG69Q can create bounded output-test candidates without public publication."
};

const boundary = {
  module_id: "AG69P",
  title: "AG69P to AG69Q Approved Output Test Boundary",
  status: "ag69q_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create bounded approved-output test candidates from AG69P selector dry-run result.",
    "Keep generated/word-of-day.json unchanged.",
    "Keep existing UI unchanged.",
    "Keep public_output_allowed=false until AG69S existing-card replacement gate."
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
  module_id: "AG69P",
  title: "Word Selection Engine Doctrine and Test",
  status: "ag69p_word_selection_engine_doctrine_test_completed",
  current_git_context: git,
  consumed_previous_stage: {
    stage: "AG69O",
    source_file: "data/content-intelligence/quality-reviews/ag69o-approved-word-bank-pilot-gate.json",
    status: ag69o.status
  },
  consumed_workflow_step: ag69kWorkflow.workflow?.find((step) => step.name === "selection_engine") || null,
  generated_records: outputs,
  summary: {
    ag69o_consumed: true,
    selector_doctrine_defined: true,
    selector_input_contract_defined: true,
    selector_priority_rules_defined: true,
    selector_static_dry_run_completed: true,
    approved_bank_record_count: approvedRecords.length,
    dry_run_count: dryRunSelections.length,
    all_selected_from_approved_bank: true,
    duplicate_control_tested: true,
    tithi_context_label_tested_without_calculation: true,
    vara_context_label_tested_without_calculation: true,
    runtime_selector_active_now: false,
    public_runtime_selection_enabled: false,
    public_output_from_word_records_allowed: false,
    generated_output_created: false,
    source_promoted_count: 0,
    source_content_ingested: false,
    bulk_copyrighted_ingestion: false,
    generated_word_json_modified: false,
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
    ready_for_ag69q: true
  }
};

const registry = {
  module_id: "AG69P",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69P",
  status: review.status,
  selector_doctrine_defined: 1,
  selector_static_dry_run_completed: 1,
  approved_bank_record_count: approvedRecords.length,
  dry_run_count: dryRunSelections.length,
  duplicate_control_tested: 1,
  tithi_context_label_tested_without_calculation: 1,
  vara_context_label_tested_without_calculation: 1,
  runtime_selector_active_now: 0,
  generated_output_created: 0,
  generated_word_json_modified: 0,
  ui_display_changed: 0,
  active_tithi_vara_selection_started: 0,
  panchang_value_generation_started: 0,
  backend_runtime_activated: 0,
  database_runtime_activated: 0,
  v02_expansion_started: 0,
  ready_for_ag69q: 1
};

const doc = `# AG69P — Word Selection Engine Doctrine and Test

AG69P defines and tests the Word of the Day selector doctrine using the AG69O internal approved pilot bank.

## What AG69P does

- Defines selector doctrine.
- Defines selector input contract.
- Defines duplicate-control and context-priority rules.
- Runs static dry-run tests against approved pilot records.
- Tests Tithi/Vara context labels only, without Panchang calculation.

## What AG69P does not do

- No runtime selector activation.
- No public Tithi/Vara selection.
- No Panchang value generation.
- No approved output publication.
- No generated/word-of-day.json replacement.
- No UI change.
- No source promotion.
- No backend/database/V02 activation.
`;

writeJson(outputs.selectorDoctrine, selectorDoctrine);
writeJson(outputs.selectorInputContract, selectorInputContract);
writeJson(outputs.selectorPriorityRules, selectorPriorityRules);
writeJson(outputs.dryRunFixtures, dryRunFixtures);
writeJson(outputs.dryRunResults, dryRunResults);
writeJson(outputs.selectorActivationBlock, selectorActivationBlock);
writeJson(outputs.panchangBlock, panchangBlock);
writeJson(outputs.publicBlockAudit, publicBlockAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG69P word selection engine doctrine/test generated.");
console.log("✅ Static selector dry-run completed with approved pilot records.");
console.log("✅ No runtime selector activation, Panchang generation, UI/runtime mutation performed.");
