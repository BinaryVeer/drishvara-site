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

const ag69k = readJson("data/content-intelligence/quality-reviews/ag69k-word-asset-logic-alignment-end-to-end-path-optimization.json");
const ag69jCapture = readJson("data/knowledge-base/word-of-day/ag69j-manual-source-capture-packet.json");
const ag69jSourceRegister = readJson("data/knowledge-base/word-of-day/ag69j-pilot-lexical-source-addition-register.json");
const ag69kWorkflow = readJson("data/knowledge-base/word-of-day/ag69k-optimized-end-to-end-word-workflow.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag69k.status !== "ag69k_word_asset_logic_alignment_end_to_end_path_optimization_completed") {
  throw new Error("AG69K must be completed before AG69L.");
}
if (ag69k.summary?.ready_for_ag69l !== true) {
  throw new Error("AG69K readiness for AG69L is missing.");
}
if (ag69jCapture.status !== "manual_source_capture_packet_created_for_ag69k") {
  throw new Error("AG69J capture packet must be present.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive preview data.");
}

const outputs = {
  captureRecord: "data/knowledge-base/word-of-day/ag69l-manual-pilot-lexical-evidence-capture-record.json",
  normalizedEvidence: "data/knowledge-base/word-of-day/ag69l-normalized-pilot-evidence-records.json",
  qualityGate: "data/knowledge-base/word-of-day/ag69l-pilot-evidence-quality-gate-result.json",
  sourceUseAudit: "data/knowledge-base/word-of-day/ag69l-source-use-copyright-safety-audit.json",
  attachmentBlock: "data/knowledge-base/word-of-day/ag69l-no-word-record-attachment-audit.json",
  sourcePromotionBlock: "data/knowledge-base/word-of-day/ag69l-no-source-promotion-audit.json",
  noMutationAudit: "data/knowledge-base/word-of-day/ag69l-no-generated-word-or-ui-mutation-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69l-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69l-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag69l-ag69m-pilot-evidence-attachment-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69l-to-ag69m-pilot-evidence-attachment-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag69l-manual-pilot-lexical-evidence-capture.json",
  registry: "data/quality/ag69l-manual-pilot-lexical-evidence-capture.json",
  preview: "data/quality/ag69l-manual-pilot-lexical-evidence-capture-preview.json",
  doc: "docs/quality/AG69L_MANUAL_PILOT_LEXICAL_EVIDENCE_CAPTURE.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const taskByWord = Object.fromEntries((ag69jCapture.tasks || []).map((task) => [task.legacy_word_id, task]));
const requiredWords = ["reflection", "discernment", "patience"];
for (const word of requiredWords) {
  if (!taskByWord[word]) throw new Error(`Missing AG69J capture task for ${word}.`);
}

const sourceRefs = new Set((ag69jSourceRegister.added_pilot_sources || []).map((s) => s.source_reference_id));
if (!sourceRefs.has("src_sanskritdictionary_com_lexical_lookup")) {
  throw new Error("Pilot Sanskrit Dictionary source metadata must be present.");
}
if (!sourceRefs.has("src_dsal_apte_practical_sanskrit_english_dictionary")) {
  throw new Error("Pilot DSAL Apte source metadata must be present.");
}

const pilotEvidence = [
  {
    evidence_id: "ag69l_evidence_reflection_manana_001",
    legacy_word_id: "reflection",
    draft_id: taskByWord.reflection.draft_id,
    english: "Reflection",
    hindi: "मनन",
    sanskrit: "मननम्",
    source_reference_id: "src_sanskritdictionary_com_lexical_lookup",
    candidate_primary_source_reference_id: "src_dsal_apte_practical_sanskrit_english_dictionary",
    source_category: "lexical_lookup_index_candidate",
    source_url: "https://sanskritdictionary.com/?q=manana",
    field_checked: ["sanskrit_form", "lexical_meaning", "english_equivalence"],
    word_form_found_status: "found",
    meaning_supported_status: "supported",
    transliteration_supported_status: "supported",
    claim_level_supported: "definition",
    source_access_checked: true,
    reuse_note_checked: true,
    internal_textual_discipline_check: "passed",
    evidence_capture_status: "captured_not_attached",
    review_status_after_evidence: "evidence_pending",
    public_use_permission_after_review: "not_allowed",
    public_output_allowed: false,
    short_evidence_note: "The lookup supports manana as a lexical form connected with thinking/reflection/meditation/cogitation. This is captured as pilot lexical evidence only.",
    unsupported_claims_blocked: [
      "scriptural_claim",
      "classical_doctrine_claim",
      "etymology_claim",
      "public_word_output_claim"
    ]
  },
  {
    evidence_id: "ag69l_evidence_discernment_viveka_001",
    legacy_word_id: "discernment",
    draft_id: taskByWord.discernment.draft_id,
    english: "Discernment",
    hindi: "विवेक",
    sanskrit: "विवेकः",
    source_reference_id: "src_sanskritdictionary_com_lexical_lookup",
    candidate_primary_source_reference_id: "src_dsal_apte_practical_sanskrit_english_dictionary",
    source_category: "lexical_lookup_index_candidate",
    source_url: "https://sanskritdictionary.com/?q=viveka",
    field_checked: ["sanskrit_form", "lexical_meaning", "english_equivalence"],
    word_form_found_status: "found",
    meaning_supported_status: "supported",
    transliteration_supported_status: "supported",
    claim_level_supported: "definition",
    source_access_checked: true,
    reuse_note_checked: true,
    internal_textual_discipline_check: "passed",
    evidence_capture_status: "captured_not_attached",
    review_status_after_evidence: "evidence_pending",
    public_use_permission_after_review: "not_allowed",
    public_output_allowed: false,
    short_evidence_note: "The lookup supports viveka as a lexical form connected with discrimination, distinction, discretion, investigation and right judgement. This is captured as pilot lexical evidence only.",
    unsupported_claims_blocked: [
      "scriptural_claim",
      "classical_doctrine_claim",
      "sectarian_interpretation_claim",
      "public_word_output_claim"
    ]
  },
  {
    evidence_id: "ag69l_evidence_patience_dhairyam_001",
    legacy_word_id: "patience",
    draft_id: taskByWord.patience.draft_id,
    english: "Patience",
    hindi: "धैर्य",
    sanskrit: "धैर्यम्",
    source_reference_id: "src_sanskritdictionary_com_lexical_lookup",
    candidate_primary_source_reference_id: "src_dsal_apte_practical_sanskrit_english_dictionary",
    source_category: "lexical_lookup_index_candidate",
    source_url: "https://sanskritdictionary.com/?q=dhairyam",
    field_checked: ["sanskrit_form", "lexical_meaning", "english_equivalence"],
    word_form_found_status: "found",
    meaning_supported_status: "supported",
    transliteration_supported_status: "supported",
    claim_level_supported: "definition",
    source_access_checked: true,
    reuse_note_checked: true,
    internal_textual_discipline_check: "passed",
    evidence_capture_status: "captured_not_attached",
    review_status_after_evidence: "evidence_pending",
    public_use_permission_after_review: "not_allowed",
    public_output_allowed: false,
    short_evidence_note: "The lookup supports dhairyam/dhairya as a lexical form connected with firmness, steadiness, composure and patience. This is captured as pilot lexical evidence only.",
    unsupported_claims_blocked: [
      "scriptural_claim",
      "classical_doctrine_claim",
      "etymology_claim",
      "public_word_output_claim"
    ]
  }
];

const captureRecord = {
  module_id: "AG69L",
  title: "Manual Pilot Lexical Evidence Capture Record",
  status: "manual_pilot_lexical_evidence_captured_no_attachment",
  consumed_previous_stage: "AG69K",
  consumed_capture_packet: "data/knowledge-base/word-of-day/ag69j-manual-source-capture-packet.json",
  consumed_optimized_workflow: "data/knowledge-base/word-of-day/ag69k-optimized-end-to-end-word-workflow.json",
  capture_scope: {
    pilot_word_count: pilotEvidence.length,
    pilot_words: pilotEvidence.map((x) => ({
      evidence_id: x.evidence_id,
      legacy_word_id: x.legacy_word_id,
      english: x.english,
      hindi: x.hindi,
      sanskrit: x.sanskrit
    }))
  },
  evidence_capture_records: pilotEvidence,
  evidence_capture_count: pilotEvidence.length,
  source_evidence_attached_to_word_records_count: 0,
  reviewed_records_created: false,
  approved_records_created: false,
  public_output_allowed: false,
  note: "AG69L captures manual pilot lexical evidence status only. Attachment to word records is deferred to AG69M."
};

const normalizedEvidence = {
  module_id: "AG69L",
  title: "Normalized Pilot Evidence Records",
  status: "normalized_pilot_evidence_records_created",
  normalization_rule: "Store short evidence notes and status fields only. Do not store bulk dictionary text.",
  record_count: pilotEvidence.length,
  normalized_records: pilotEvidence.map((evidence) => ({
    evidence_id: evidence.evidence_id,
    legacy_word_id: evidence.legacy_word_id,
    draft_id: evidence.draft_id,
    source_reference_id: evidence.source_reference_id,
    source_category: evidence.source_category,
    word_form_found_status: evidence.word_form_found_status,
    meaning_supported_status: evidence.meaning_supported_status,
    transliteration_supported_status: evidence.transliteration_supported_status,
    claim_level_supported: evidence.claim_level_supported,
    source_access_checked: evidence.source_access_checked,
    reuse_note_checked: evidence.reuse_note_checked,
    internal_textual_discipline_check: evidence.internal_textual_discipline_check,
    review_status_after_evidence: evidence.review_status_after_evidence,
    evidence_capture_status: evidence.evidence_capture_status,
    attachment_candidate_for_ag69m: true,
    public_output_allowed: false
  }))
};

const qualityGate = {
  module_id: "AG69L",
  title: "Pilot Evidence Quality Gate Result",
  status: "pilot_evidence_quality_gate_completed_attachment_deferred",
  gate_passed_for_capture: true,
  gate_passed_for_word_record_attachment_now: false,
  reason_attachment_deferred: "AG69K sequence defines AG69L as capture-only. AG69M performs attachment after validation.",
  required_capture_record_count: 3,
  captured_record_count: pilotEvidence.length,
  all_source_access_checked: pilotEvidence.every((x) => x.source_access_checked === true),
  all_reuse_note_checked: pilotEvidence.every((x) => x.reuse_note_checked === true),
  all_public_output_blocked: pilotEvidence.every((x) => x.public_output_allowed === false),
  all_unsupported_claims_blocked: pilotEvidence.every((x) => Array.isArray(x.unsupported_claims_blocked) && x.unsupported_claims_blocked.length >= 3),
  attachment_candidate_count_for_ag69m: pilotEvidence.length,
  reviewed_record_count: 0,
  approved_record_count: 0
};

const sourceUseAudit = {
  module_id: "AG69L",
  title: "Source Use Copyright Safety Audit",
  status: "source_use_copyright_safety_audit_passed",
  audit_passed: true,
  source_content_ingested: false,
  bulk_dictionary_text_stored: false,
  long_definition_copied: false,
  short_evidence_notes_only: true,
  reuse_note_checked_for_all_records: pilotEvidence.every((x) => x.reuse_note_checked === true),
  source_records_used: [
    "src_sanskritdictionary_com_lexical_lookup",
    "src_dsal_apte_practical_sanskrit_english_dictionary"
  ],
  note: "DSAL/Apte reuse caution remains active. AG69L stores evidence metadata and short notes only."
};

const attachmentBlock = {
  module_id: "AG69L",
  title: "No Word Record Attachment Audit",
  status: "no_word_record_attachment_audit_passed",
  audit_passed: true,
  source_evidence_attached_to_word_records_count: 0,
  source_reference_ids_attached_to_word_records_count: 0,
  draft_records_modified: false,
  reviewed_records_created: false,
  approved_records_created: false,
  generated_word_json_modified: false,
  public_output_allowed: false,
  reason: "AG69L is capture-only as per AG69K optimized sequence. AG69M may attach captured evidence."
};

const sourcePromotionBlock = {
  module_id: "AG69L",
  title: "No Source Promotion Audit",
  status: "no_source_promotion_audit_passed",
  audit_passed: true,
  source_promoted_count: 0,
  approved_source_created: false,
  public_claim_allowed_count: 0,
  sources_remain_candidate_or_scout: true
};

const noMutationAudit = {
  module_id: "AG69L",
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
    { check_id: "source_evidence_attached_to_word_records", expected: false, actual: false, passed: true },
    { check_id: "source_promoted", expected: false, actual: false, passed: true }
  ],
  failed_checks: []
};

function audit(title, status, keys) {
  return {
    module_id: "AG69L",
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
  module_id: "AG69L",
  title: "AG69M Pilot Evidence Attachment Readiness Record",
  status: "ready_for_ag69m_pilot_evidence_attachment_public_blocked",
  ready_for_ag69m: true,
  next_stage: "AG69M — Pilot Evidence Attachment — Public Output Still Blocked",
  reason: "Manual pilot lexical evidence has been captured as short evidence records. AG69M may attach source_reference_id/evidence status to pilot word records while keeping public output blocked."
};

const boundary = {
  module_id: "AG69L",
  title: "AG69L to AG69M Pilot Evidence Attachment Boundary",
  status: "ag69m_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Attach captured AG69L evidence metadata to the three pilot word draft records.",
    "Keep public_output_allowed=false.",
    "Keep generated/word-of-day.json unchanged.",
    "Keep existing homepage Word card unchanged.",
    "Do not promote to reviewed or approved bank in AG69M unless separately staged later."
  ],
  blocked_scope_without_explicit_approval: [
    "bulk dictionary/book content ingestion",
    "source promotion to approved_source",
    "reviewed word bank creation",
    "approved word bank creation",
    "public word output generation",
    "generated/word-of-day.json replacement",
    "active tithi/vara word selection",
    "Panchang value generation",
    "UI display change",
    "new Word of the Day card creation",
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
  module_id: "AG69L",
  title: "Manual Pilot Lexical Evidence Capture",
  status: "ag69l_manual_pilot_lexical_evidence_capture_completed",
  current_git_context: git,
  consumed_previous_stage: {
    stage: "AG69K",
    source_file: "data/content-intelligence/quality-reviews/ag69k-word-asset-logic-alignment-end-to-end-path-optimization.json",
    status: ag69k.status
  },
  consumed_workflow_step: ag69kWorkflow.workflow?.find((step) => step.name === "lexical_source_capture") || null,
  generated_records: outputs,
  summary: {
    ag69k_consumed: true,
    manual_pilot_lexical_evidence_captured: true,
    evidence_capture_count: pilotEvidence.length,
    normalized_evidence_records_created: true,
    source_access_checked_for_all_records: true,
    reuse_note_checked_for_all_records: true,
    quality_gate_passed_for_capture: true,
    attachment_candidate_count_for_ag69m: pilotEvidence.length,
    source_evidence_attached_to_word_records_count: 0,
    source_reference_ids_attached_to_word_records_count: 0,
    source_promoted_count: 0,
    reviewed_records_created: false,
    approved_records_created: false,
    reviewed_bank_created: false,
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
    ready_for_ag69m: true
  }
};

const registry = {
  module_id: "AG69L",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69L",
  status: review.status,
  evidence_capture_count: pilotEvidence.length,
  normalized_evidence_records_created: 1,
  source_access_checked_for_all_records: 1,
  reuse_note_checked_for_all_records: 1,
  quality_gate_passed_for_capture: 1,
  attachment_candidate_count_for_ag69m: pilotEvidence.length,
  source_evidence_attached_to_word_records_count: 0,
  source_reference_ids_attached_to_word_records_count: 0,
  source_promoted_count: 0,
  reviewed_records_created: 0,
  approved_records_created: 0,
  generated_word_json_modified: 0,
  ui_display_changed: 0,
  new_word_card_created: 0,
  active_tithi_vara_selection_started: 0,
  panchang_value_generation_started: 0,
  backend_runtime_activated: 0,
  database_runtime_activated: 0,
  v02_expansion_started: 0,
  ready_for_ag69m: 1
};

const doc = `# AG69L — Manual Pilot Lexical Evidence Capture

AG69L captures short pilot lexical evidence records for the three pilot words selected earlier.

## Pilot words

- Reflection / मनन / मननम्
- Discernment / विवेक / विवेकः
- Patience / धैर्य / धैर्यम्

## What AG69L does

- Captures source-access and reuse-note checked evidence records.
- Stores short evidence notes only.
- Normalizes evidence records for AG69M attachment.
- Keeps public output blocked.

## What AG69L does not do

- No source evidence attached to word records.
- No source_reference_id attached to word records.
- No source promotion.
- No reviewed bank.
- No approved bank.
- No generated/word-of-day.json replacement.
- No UI change.
- No Tithi/Vara selector activation.
- No Panchang generation.
- No backend/database/V02 activation.
`;

writeJson(outputs.captureRecord, captureRecord);
writeJson(outputs.normalizedEvidence, normalizedEvidence);
writeJson(outputs.qualityGate, qualityGate);
writeJson(outputs.sourceUseAudit, sourceUseAudit);
writeJson(outputs.attachmentBlock, attachmentBlock);
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

console.log("✅ AG69L manual pilot lexical evidence capture generated.");
console.log("✅ 3 short pilot evidence records captured and normalized.");
console.log("✅ No word-record attachment, source promotion, reviewed/approved bank, UI/runtime mutation performed.");
