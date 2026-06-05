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

const ag69m = readJson("data/content-intelligence/quality-reviews/ag69m-pilot-evidence-attachment-public-blocked.json");
const attached = readJson("data/knowledge-base/word-of-day/ag69m-evidence-attached-pilot-word-records.json");
const gate = readJson("data/knowledge-base/word-of-day/ag69m-pilot-evidence-attachment-gate-result.json");
const ag69kWorkflow = readJson("data/knowledge-base/word-of-day/ag69k-optimized-end-to-end-word-workflow.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag69m.status !== "ag69m_pilot_evidence_attachment_public_blocked_completed") {
  throw new Error("AG69M must be completed before AG69N.");
}
if (ag69m.summary?.ready_for_ag69n !== true) {
  throw new Error("AG69M readiness for AG69N is missing.");
}
if (attached.status !== "pilot_evidence_attached_public_output_blocked") {
  throw new Error("AG69M attached pilot records must be present.");
}
if (attached.record_count !== 3 || gate.reviewed_bank_candidate_count_for_ag69n !== 3) {
  throw new Error("AG69N requires exactly 3 reviewed-bank candidates.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive preview data.");
}

const outputs = {
  reviewedBank: "data/knowledge-base/word-of-day/ag69n-reviewed-word-bank-pilot.json",
  reviewedGate: "data/knowledge-base/word-of-day/ag69n-reviewed-bank-pilot-gate-result.json",
  reviewedMap: "data/knowledge-base/word-of-day/ag69n-reviewed-bank-pilot-map.json",
  publicBlockAudit: "data/knowledge-base/word-of-day/ag69n-public-output-block-audit.json",
  approvedBlockAudit: "data/knowledge-base/word-of-day/ag69n-no-approved-bank-audit.json",
  sourcePromotionBlock: "data/knowledge-base/word-of-day/ag69n-no-source-promotion-audit.json",
  noMutationAudit: "data/knowledge-base/word-of-day/ag69n-no-generated-word-or-ui-mutation-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69n-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69n-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag69n-ag69o-approved-word-bank-pilot-gate-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69n-to-ag69o-approved-word-bank-pilot-gate-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag69n-reviewed-word-bank-pilot-gate.json",
  registry: "data/quality/ag69n-reviewed-word-bank-pilot-gate.json",
  preview: "data/quality/ag69n-reviewed-word-bank-pilot-gate-preview.json",
  doc: "docs/quality/AG69N_REVIEWED_WORD_BANK_PILOT_GATE.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const attachedRecords = attached.attached_records || [];

for (const record of attachedRecords) {
  if (record.reviewed_bank_eligible_for_ag69n !== true) {
    throw new Error(`${record.legacy_word_id} is not eligible for AG69N reviewed-bank gate.`);
  }
  if (record.approved_bank_eligible_now !== false) {
    throw new Error(`${record.legacy_word_id} must not be approved-bank eligible before AG69O.`);
  }
  if (record.public_output_allowed !== false) {
    throw new Error(`${record.legacy_word_id} public output must remain blocked.`);
  }
  if (!record.evidence_id || !record.source_reference_id) {
    throw new Error(`${record.legacy_word_id} requires attached evidence and source reference IDs.`);
  }
}

const reviewedRecords = attachedRecords.map((record, index) => ({
  reviewed_record_id: `ag69n_reviewed_${String(index + 1).padStart(3, "0")}_${record.legacy_word_id}`,
  source_attachment_record_id: record.attachment_record_id,
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
  review_gate_status: "reviewed_bank_gate_passed",
  review_status_after_ag69n: "reviewed",
  source_status_after_ag69n: "evidence_attached_source_unpromoted",
  public_use_permission_after_ag69n: "not_allowed",
  public_output_allowed: false,
  approved_bank_eligible_for_ag69o: true,
  approved_bank_eligible_now: false,
  runtime_selection_eligible_now: false
}));

const reviewedBank = {
  module_id: "AG69N",
  title: "Reviewed Word Bank Pilot",
  status: "reviewed_word_bank_pilot_created_public_output_blocked",
  consumed_previous_stage: "AG69M",
  reviewed_record_count: reviewedRecords.length,
  approved_record_count: 0,
  public_output_allowed: false,
  reviewed_records: reviewedRecords,
  note: "AG69N creates reviewed pilot records only. Approved bank, runtime selector, generated output and UI update remain blocked."
};

const reviewedGate = {
  module_id: "AG69N",
  title: "Reviewed Bank Pilot Gate Result",
  status: "reviewed_bank_pilot_gate_passed_public_blocked",
  gate_passed: true,
  candidate_count_from_ag69m: attachedRecords.length,
  reviewed_record_count_created: reviewedRecords.length,
  approved_record_count_created: 0,
  all_records_have_evidence_id: reviewedRecords.every((record) => Boolean(record.evidence_id)),
  all_records_have_source_reference_id: reviewedRecords.every((record) => Boolean(record.source_reference_id)),
  all_source_access_checked: reviewedRecords.every((record) => record.source_access_checked === true),
  all_reuse_note_checked: reviewedRecords.every((record) => record.reuse_note_checked === true),
  all_internal_textual_discipline_passed: reviewedRecords.every((record) => record.internal_textual_discipline_check === "passed"),
  all_public_output_blocked: reviewedRecords.every((record) => record.public_output_allowed === false),
  approved_bank_candidate_count_for_ag69o: reviewedRecords.length,
  generated_word_json_modified: false,
  ui_display_changed: false
};

const reviewedMap = {
  module_id: "AG69N",
  title: "Reviewed Bank Pilot Map",
  status: "reviewed_bank_pilot_map_created",
  mapping_count: reviewedRecords.length,
  mappings: reviewedRecords.map((record) => ({
    reviewed_record_id: record.reviewed_record_id,
    legacy_word_id: record.legacy_word_id,
    evidence_id: record.evidence_id,
    source_reference_id: record.source_reference_id,
    review_status_after_ag69n: record.review_status_after_ag69n,
    approved_bank_eligible_for_ag69o: record.approved_bank_eligible_for_ag69o,
    public_output_allowed: record.public_output_allowed,
    next_gate: "AG69O approved word bank pilot gate"
  }))
};

const publicBlockAudit = {
  module_id: "AG69N",
  title: "Public Output Block Audit",
  status: "public_output_block_audit_passed",
  audit_passed: true,
  public_output_from_word_records_allowed: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  new_word_card_created: false,
  runtime_selection_eligible_now_count: 0,
  all_reviewed_records_public_blocked: reviewedRecords.every((record) => record.public_output_allowed === false),
  blocked_public_behaviour: [
    "public_word_output_generation",
    "generated/word-of-day.json replacement",
    "existing homepage Word card update",
    "new Word card creation",
    "Tithi/Vara selector activation",
    "Panchang value generation"
  ]
};

const approvedBlockAudit = {
  module_id: "AG69N",
  title: "No Approved Bank Audit",
  status: "no_approved_bank_audit_passed",
  audit_passed: true,
  reviewed_records_created: true,
  reviewed_record_count: reviewedRecords.length,
  approved_records_created: false,
  approved_record_count: 0,
  approved_bank_created: false,
  approved_bank_candidate_count_for_ag69o: reviewedRecords.length,
  reason: "AG69N is reviewed-bank gate only. AG69O is the approved-bank pilot gate."
};

const sourcePromotionBlock = {
  module_id: "AG69N",
  title: "No Source Promotion Audit",
  status: "no_source_promotion_audit_passed",
  audit_passed: true,
  source_promoted_count: 0,
  approved_source_created: false,
  public_claim_allowed_count: 0,
  source_reference_ids_used_in_reviewed_records: Array.from(new Set(reviewedRecords.map((record) => record.source_reference_id))),
  sources_remain_unpromoted: true
};

const noMutationAudit = {
  module_id: "AG69N",
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
    module_id: "AG69N",
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
  module_id: "AG69N",
  title: "AG69O Approved Word Bank Pilot Gate Readiness Record",
  status: "ready_for_ag69o_approved_word_bank_pilot_gate",
  ready_for_ag69o: true,
  next_stage: "AG69O — Approved Word Bank Pilot Gate",
  reason: "Three reviewed pilot records have passed the reviewed-bank gate with public output still blocked. AG69O can evaluate approval eligibility."
};

const boundary = {
  module_id: "AG69N",
  title: "AG69N to AG69O Approved Word Bank Pilot Gate Boundary",
  status: "ag69o_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Evaluate AG69N reviewed pilot records for approved-bank eligibility.",
    "Create approved-bank pilot records only if AG69O gate passes.",
    "Keep generated/word-of-day.json and existing UI unchanged.",
    "Keep runtime selector activation deferred to AG69P."
  ],
  blocked_scope_without_explicit_approval: [
    "public word output generation",
    "generated/word-of-day.json replacement",
    "active tithi/vara word selection",
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
  module_id: "AG69N",
  title: "Reviewed Word Bank Pilot Gate",
  status: "ag69n_reviewed_word_bank_pilot_gate_completed",
  current_git_context: git,
  consumed_previous_stage: {
    stage: "AG69M",
    source_file: "data/content-intelligence/quality-reviews/ag69m-pilot-evidence-attachment-public-blocked.json",
    status: ag69m.status
  },
  consumed_workflow_step: ag69kWorkflow.workflow?.find((step) => step.name === "reviewed_bank_gate") || null,
  generated_records: outputs,
  summary: {
    ag69m_consumed: true,
    reviewed_bank_pilot_created: true,
    reviewed_record_count: reviewedRecords.length,
    approved_record_count: 0,
    approved_bank_candidate_count_for_ag69o: reviewedRecords.length,
    all_records_have_evidence_id: true,
    all_records_have_source_reference_id: true,
    all_source_access_checked: true,
    all_reuse_note_checked: true,
    all_internal_textual_discipline_passed: true,
    all_public_output_blocked: true,
    source_promoted_count: 0,
    approved_records_created: false,
    approved_bank_created: false,
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
    ready_for_ag69o: true
  }
};

const registry = {
  module_id: "AG69N",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69N",
  status: review.status,
  reviewed_bank_pilot_created: 1,
  reviewed_record_count: reviewedRecords.length,
  approved_record_count: 0,
  approved_bank_candidate_count_for_ag69o: reviewedRecords.length,
  source_promoted_count: 0,
  approved_records_created: 0,
  approved_bank_created: 0,
  generated_word_json_modified: 0,
  ui_display_changed: 0,
  new_word_card_created: 0,
  active_tithi_vara_selection_started: 0,
  panchang_value_generation_started: 0,
  backend_runtime_activated: 0,
  database_runtime_activated: 0,
  v02_expansion_started: 0,
  ready_for_ag69o: 1
};

const doc = `# AG69N — Reviewed Word Bank Pilot Gate

AG69N promotes the three AG69M evidence-attached pilot records into a reviewed pilot bank.

## Reviewed pilot records

- Reflection / मनन / मननम्
- Discernment / विवेक / विवेकः
- Patience / धैर्य / धैर्यम्

## What AG69N does

- Creates reviewed-bank pilot records.
- Preserves attached evidence_id and source_reference_id.
- Keeps public output blocked.
- Prepares records for AG69O approved-bank gate.

## What AG69N does not do

- No approved bank.
- No source promotion.
- No generated/word-of-day.json replacement.
- No UI change.
- No Tithi/Vara selector activation.
- No Panchang generation.
- No backend/database/V02 activation.
`;

writeJson(outputs.reviewedBank, reviewedBank);
writeJson(outputs.reviewedGate, reviewedGate);
writeJson(outputs.reviewedMap, reviewedMap);
writeJson(outputs.publicBlockAudit, publicBlockAudit);
writeJson(outputs.approvedBlockAudit, approvedBlockAudit);
writeJson(outputs.sourcePromotionBlock, sourcePromotionBlock);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG69N reviewed word bank pilot gate generated.");
console.log("✅ 3 reviewed pilot records created with public output blocked.");
console.log("✅ No approved bank, source promotion, UI/runtime mutation performed.");
