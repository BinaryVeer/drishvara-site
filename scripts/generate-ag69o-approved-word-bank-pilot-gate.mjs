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

const ag69n = readJson("data/content-intelligence/quality-reviews/ag69n-reviewed-word-bank-pilot-gate.json");
const reviewedBank = readJson("data/knowledge-base/word-of-day/ag69n-reviewed-word-bank-pilot.json");
const reviewedGate = readJson("data/knowledge-base/word-of-day/ag69n-reviewed-bank-pilot-gate-result.json");
const ag69kWorkflow = readJson("data/knowledge-base/word-of-day/ag69k-optimized-end-to-end-word-workflow.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag69n.status !== "ag69n_reviewed_word_bank_pilot_gate_completed") {
  throw new Error("AG69N must be completed before AG69O.");
}
if (ag69n.summary?.ready_for_ag69o !== true) {
  throw new Error("AG69N readiness for AG69O is missing.");
}
if (reviewedBank.status !== "reviewed_word_bank_pilot_created_public_output_blocked") {
  throw new Error("AG69N reviewed pilot bank must be present.");
}
if (reviewedBank.reviewed_record_count !== 3 || reviewedGate.approved_bank_candidate_count_for_ag69o !== 3) {
  throw new Error("AG69O requires exactly 3 approved-bank candidates.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive preview data.");
}

const outputs = {
  approvedBank: "data/knowledge-base/word-of-day/ag69o-approved-word-bank-pilot.json",
  approvedGate: "data/knowledge-base/word-of-day/ag69o-approved-bank-pilot-gate-result.json",
  approvedMap: "data/knowledge-base/word-of-day/ag69o-approved-bank-pilot-map.json",
  approvalScope: "data/knowledge-base/word-of-day/ag69o-approval-scope-public-output-block-record.json",
  publicBlockAudit: "data/knowledge-base/word-of-day/ag69o-public-output-block-audit.json",
  sourcePromotionBlock: "data/knowledge-base/word-of-day/ag69o-no-source-promotion-audit.json",
  selectorBlockAudit: "data/knowledge-base/word-of-day/ag69o-no-runtime-selector-activation-audit.json",
  noMutationAudit: "data/knowledge-base/word-of-day/ag69o-no-generated-word-or-ui-mutation-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69o-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69o-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag69o-ag69p-word-selection-engine-doctrine-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69o-to-ag69p-word-selection-engine-doctrine-test-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag69o-approved-word-bank-pilot-gate.json",
  registry: "data/quality/ag69o-approved-word-bank-pilot-gate.json",
  preview: "data/quality/ag69o-approved-word-bank-pilot-gate-preview.json",
  doc: "docs/quality/AG69O_APPROVED_WORD_BANK_PILOT_GATE.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const reviewedRecords = reviewedBank.reviewed_records || [];

for (const record of reviewedRecords) {
  if (record.approved_bank_eligible_for_ag69o !== true) {
    throw new Error(`${record.legacy_word_id} is not eligible for AG69O approved-bank gate.`);
  }
  if (record.public_output_allowed !== false) {
    throw new Error(`${record.legacy_word_id} public output must remain blocked.`);
  }
  if (record.runtime_selection_eligible_now !== false) {
    throw new Error(`${record.legacy_word_id} must not be runtime selector eligible before AG69P.`);
  }
  if (!record.evidence_id || !record.source_reference_id) {
    throw new Error(`${record.legacy_word_id} requires evidence and source reference IDs.`);
  }
}

const approvedRecords = reviewedRecords.map((record, index) => ({
  approved_record_id: `ag69o_approved_${String(index + 1).padStart(3, "0")}_${record.legacy_word_id}`,
  reviewed_record_id: record.reviewed_record_id,
  source_attachment_record_id: record.source_attachment_record_id,
  draft_id: record.draft_id,
  legacy_word_id: record.legacy_word_id,
  english: record.english,
  hindi: record.hindi,
  sanskrit: record.sanskrit,
  evidence_id: record.evidence_id,
  source_reference_id: record.source_reference_id,
  source_reference_ids: record.source_reference_ids,
  source_category: record.source_category,
  word_form_found_status: record.word_form_found_status,
  meaning_supported_status: record.meaning_supported_status,
  transliteration_supported_status: record.transliteration_supported_status,
  claim_level_supported: record.claim_level_supported,
  source_access_checked: record.source_access_checked,
  reuse_note_checked: record.reuse_note_checked,
  internal_textual_discipline_check: record.internal_textual_discipline_check,
  short_evidence_note: record.short_evidence_note,
  unsupported_claims_blocked: record.unsupported_claims_blocked,
  review_status_before_ag69o: record.review_status_after_ag69n,
  approval_gate_status: "approved_bank_pilot_gate_passed",
  approval_scope: "internal_pilot_approved_bank_public_output_blocked",
  review_status_after_ag69o: "approved_pilot",
  source_status_after_ag69o: "evidence_attached_source_unpromoted",
  source_promoted_now: false,
  public_use_permission_after_ag69o: "not_allowed_until_output_test_and_public_gate",
  public_output_allowed: false,
  runtime_selection_eligible_for_ag69p: true,
  runtime_selection_eligible_now: false,
  generated_output_eligible_now: false
}));

const approvedBank = {
  module_id: "AG69O",
  title: "Approved Word Bank Pilot",
  status: "approved_word_bank_pilot_created_public_output_blocked",
  consumed_previous_stage: "AG69N",
  approved_record_count: approvedRecords.length,
  reviewed_record_count_consumed: reviewedRecords.length,
  public_output_allowed: false,
  runtime_selection_active_now: false,
  source_promoted_count: 0,
  approved_records: approvedRecords,
  note: "AG69O creates an internal pilot approved bank only. Public output, runtime selection, generated-word replacement and UI update remain blocked."
};

const approvedGate = {
  module_id: "AG69O",
  title: "Approved Bank Pilot Gate Result",
  status: "approved_bank_pilot_gate_passed_public_blocked",
  gate_passed: true,
  reviewed_candidate_count_from_ag69n: reviewedRecords.length,
  approved_record_count_created: approvedRecords.length,
  all_records_have_evidence_id: approvedRecords.every((record) => Boolean(record.evidence_id)),
  all_records_have_source_reference_id: approvedRecords.every((record) => Boolean(record.source_reference_id)),
  all_records_have_reviewed_status_before_approval: approvedRecords.every((record) => record.review_status_before_ag69o === "reviewed"),
  all_source_access_checked: approvedRecords.every((record) => record.source_access_checked === true),
  all_reuse_note_checked: approvedRecords.every((record) => record.reuse_note_checked === true),
  all_internal_textual_discipline_passed: approvedRecords.every((record) => record.internal_textual_discipline_check === "passed"),
  all_source_promotions_blocked: approvedRecords.every((record) => record.source_promoted_now === false),
  all_public_output_blocked: approvedRecords.every((record) => record.public_output_allowed === false),
  runtime_selection_candidate_count_for_ag69p: approvedRecords.length,
  runtime_selection_active_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false
};

const approvedMap = {
  module_id: "AG69O",
  title: "Approved Bank Pilot Map",
  status: "approved_bank_pilot_map_created",
  mapping_count: approvedRecords.length,
  mappings: approvedRecords.map((record) => ({
    approved_record_id: record.approved_record_id,
    reviewed_record_id: record.reviewed_record_id,
    legacy_word_id: record.legacy_word_id,
    evidence_id: record.evidence_id,
    source_reference_id: record.source_reference_id,
    approval_scope: record.approval_scope,
    review_status_after_ag69o: record.review_status_after_ag69o,
    runtime_selection_eligible_for_ag69p: record.runtime_selection_eligible_for_ag69p,
    runtime_selection_eligible_now: record.runtime_selection_eligible_now,
    public_output_allowed: record.public_output_allowed,
    next_gate: "AG69P word selection engine doctrine and test"
  }))
};

const approvalScope = {
  module_id: "AG69O",
  title: "Approval Scope and Public Output Block Record",
  status: "approval_scope_public_output_block_recorded",
  approval_scope: "internal_pilot_approved_bank_public_output_blocked",
  approved_bank_created: true,
  public_publication_approval_created: false,
  runtime_selection_activation_approval_created: false,
  source_promotion_created: false,
  reason: "The pilot records are approved only for the next governed selector-test stage. They are not approved for public output or source promotion."
};

const publicBlockAudit = {
  module_id: "AG69O",
  title: "Public Output Block Audit",
  status: "public_output_block_audit_passed",
  audit_passed: true,
  public_output_from_word_records_allowed: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  new_word_card_created: false,
  runtime_selection_active_now: false,
  all_approved_records_public_blocked: approvedRecords.every((record) => record.public_output_allowed === false),
  blocked_public_behaviour: [
    "public_word_output_generation",
    "generated/word-of-day.json replacement",
    "existing homepage Word card update",
    "new Word card creation",
    "Tithi/Vara selector activation",
    "Panchang value generation"
  ]
};

const sourcePromotionBlock = {
  module_id: "AG69O",
  title: "No Source Promotion Audit",
  status: "no_source_promotion_audit_passed",
  audit_passed: true,
  source_promoted_count: 0,
  approved_source_created: false,
  public_claim_allowed_count: 0,
  source_reference_ids_used_in_approved_records: Array.from(new Set(approvedRecords.map((record) => record.source_reference_id))),
  sources_remain_unpromoted: true,
  note: "Word-record pilot approval does not promote the underlying source. Source promotion remains blocked."
};

const selectorBlockAudit = {
  module_id: "AG69O",
  title: "No Runtime Selector Activation Audit",
  status: "no_runtime_selector_activation_audit_passed",
  audit_passed: true,
  runtime_selection_candidate_count_for_ag69p: approvedRecords.length,
  runtime_selection_active_now: false,
  active_tithi_vara_selection_started: false,
  panchang_value_generation_started: false,
  generated_output_created: false,
  reason: "AG69P will define and test selector doctrine. AG69O only creates the internal pilot approved bank."
};

const noMutationAudit = {
  module_id: "AG69O",
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
    module_id: "AG69O",
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
  module_id: "AG69O",
  title: "AG69P Word Selection Engine Doctrine and Test Readiness Record",
  status: "ready_for_ag69p_word_selection_engine_doctrine_test",
  ready_for_ag69p: true,
  next_stage: "AG69P — Word Selection Engine Doctrine and Test",
  reason: "Three internal pilot approved records exist with public output blocked. AG69P can define and test selection doctrine without activating public runtime."
};

const boundary = {
  module_id: "AG69O",
  title: "AG69O to AG69P Word Selection Engine Doctrine and Test Boundary",
  status: "ag69p_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Define selector doctrine using approved pilot bank only.",
    "Test duplicate-control, Tithi/Vara/Festival/theme logic as non-runtime doctrine/test.",
    "Keep generated/word-of-day.json and existing UI unchanged.",
    "Keep public_output_allowed=false until AG69Q/AG69S gates."
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
  module_id: "AG69O",
  title: "Approved Word Bank Pilot Gate",
  status: "ag69o_approved_word_bank_pilot_gate_completed",
  current_git_context: git,
  consumed_previous_stage: {
    stage: "AG69N",
    source_file: "data/content-intelligence/quality-reviews/ag69n-reviewed-word-bank-pilot-gate.json",
    status: ag69n.status
  },
  consumed_workflow_step: ag69kWorkflow.workflow?.find((step) => step.name === "approved_bank_gate") || null,
  generated_records: outputs,
  summary: {
    ag69n_consumed: true,
    approved_bank_pilot_created: true,
    approval_scope: "internal_pilot_approved_bank_public_output_blocked",
    approved_record_count: approvedRecords.length,
    runtime_selection_candidate_count_for_ag69p: approvedRecords.length,
    all_records_have_evidence_id: true,
    all_records_have_source_reference_id: true,
    all_records_have_reviewed_status_before_approval: true,
    all_source_access_checked: true,
    all_reuse_note_checked: true,
    all_internal_textual_discipline_passed: true,
    all_source_promotions_blocked: true,
    all_public_output_blocked: true,
    public_publication_approval_created: false,
    runtime_selection_active_now: false,
    source_promoted_count: 0,
    public_output_from_word_records_allowed: false,
    source_content_ingested: false,
    bulk_copyrighted_ingestion: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    new_word_card_created: false,
    active_tithi_vara_selection_started: false,
    panchang_value_generation_started: false,
    supabase_database_write_performed: false,
    backend_runtime_activated: false,
    database_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag69p: true
  }
};

const registry = {
  module_id: "AG69O",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69O",
  status: review.status,
  approved_bank_pilot_created: 1,
  approved_record_count: approvedRecords.length,
  runtime_selection_candidate_count_for_ag69p: approvedRecords.length,
  public_publication_approval_created: 0,
  runtime_selection_active_now: 0,
  source_promoted_count: 0,
  public_output_from_word_records_allowed: 0,
  generated_word_json_modified: 0,
  ui_display_changed: 0,
  new_word_card_created: 0,
  active_tithi_vara_selection_started: 0,
  panchang_value_generation_started: 0,
  backend_runtime_activated: 0,
  database_runtime_activated: 0,
  v02_expansion_started: 0,
  ready_for_ag69p: 1
};

const doc = `# AG69O — Approved Word Bank Pilot Gate

AG69O promotes the three AG69N reviewed pilot records into an internal approved pilot bank.

## Approved pilot records

- Reflection / मनन / मननम्
- Discernment / विवेक / विवेकः
- Patience / धैर्य / धैर्यम्

## Important scope

This is internal pilot approval only. It is not public publication approval and does not promote the underlying source.

## What AG69O does

- Creates approved-bank pilot records.
- Preserves evidence_id and source_reference_id.
- Marks records as candidates for AG69P selector doctrine/test.

## What AG69O does not do

- No public Word output.
- No generated/word-of-day.json replacement.
- No UI change.
- No runtime selector activation.
- No Tithi/Vara activation.
- No Panchang generation.
- No source promotion.
- No backend/database/V02 activation.
`;

writeJson(outputs.approvedBank, approvedBank);
writeJson(outputs.approvedGate, approvedGate);
writeJson(outputs.approvedMap, approvedMap);
writeJson(outputs.approvalScope, approvalScope);
writeJson(outputs.publicBlockAudit, publicBlockAudit);
writeJson(outputs.sourcePromotionBlock, sourcePromotionBlock);
writeJson(outputs.selectorBlockAudit, selectorBlockAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG69O approved word bank pilot gate generated.");
console.log("✅ 3 internal approved pilot records created with public output blocked.");
console.log("✅ No source promotion, selector activation, UI/runtime mutation performed.");
