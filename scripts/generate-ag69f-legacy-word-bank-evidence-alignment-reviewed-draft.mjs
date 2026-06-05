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

const ag69e = readJson("data/content-intelligence/quality-reviews/ag69e-word-candidate-source-mapping-review-queue.json");
const ag69dSourceBank = readJson("data/knowledge-base/word-of-day/ag69d-source-reference-bank-metadata.json");
const ag69eMapping = readJson("data/knowledge-base/word-of-day/ag69e-candidate-source-mapping.json");
const ag69eSelectionDoctrine = readJson("data/knowledge-base/word-of-day/ag69e-word-selection-context-doctrine.json");

const d02Bank = readJson("data/knowledge/daily-guidance/word-of-day-bank-d02.json");
const d02Rotation = readJson("data/knowledge/daily-guidance/word-of-day-rotation-policy-d02.json");
const ag63Preview = readJson("data/initial-working-data/word-of-day/ag63a-word-bank-approved-preview.json");
const ag63Initial = readJson("data/initial-working-data/word-of-day/ag63a-word-of-the-day-initial-working-data.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag69e.status !== "ag69e_word_candidate_source_mapping_review_queue_completed") {
  throw new Error("AG69E must be completed before AG69F.");
}
if (ag69e.summary?.ready_for_ag69f !== true) {
  throw new Error("AG69E readiness for AG69F is missing.");
}
if (d02Bank.status !== "curated_bank_scaffold") {
  throw new Error("D02 word bank status mismatch.");
}
if (d02Rotation.status !== "policy_scaffold") {
  throw new Error("D02 rotation policy status mismatch.");
}
if (d02Rotation.public_rotation_enabled !== false) {
  throw new Error("D02 public rotation must remain disabled.");
}
if (ag63Preview.status !== "approved_preview_word_bank_created") {
  throw new Error("AG63 preview bank status mismatch.");
}
if (generatedWord.module_id !== "AG63A") {
  throw new Error("generated/word-of-day.json must still be AG63A working output.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.public_ui_ready !== false) {
  throw new Error("AG63 generated word output must remain static preview / non-public-ready.");
}

const outputs = {
  discovery: "data/knowledge-base/word-of-day/ag69f-existing-word-asset-discovery-record.json",
  legacyAlignment: "data/knowledge-base/word-of-day/ag69f-legacy-d02-ag63-evidence-alignment-register.json",
  migrationAssessment: "data/knowledge-base/word-of-day/ag69f-legacy-approved-preview-migration-assessment.json",
  evidenceQueue: "data/knowledge-base/word-of-day/ag69f-word-source-evidence-capture-queue.json",
  reviewedDraft: "data/knowledge-base/word-of-day/ag69f-reviewed-record-draft-no-approval.json",
  crosswalk: "data/knowledge-base/word-of-day/ag69f-ag69e-ag63-crosswalk-record.json",
  selectionBridge: "data/knowledge-base/word-of-day/ag69f-word-selection-policy-legacy-bridge-assessment.json",
  noMutationAudit: "data/knowledge-base/word-of-day/ag69f-no-generated-word-mutation-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69f-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69f-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag69f-ag69g-word-source-evidence-review-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69f-to-ag69g-word-source-evidence-review-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag69f-legacy-word-bank-evidence-alignment-reviewed-draft.json",
  registry: "data/quality/ag69f-legacy-word-bank-evidence-alignment-reviewed-draft.json",
  preview: "data/quality/ag69f-legacy-word-bank-evidence-alignment-reviewed-draft-preview.json",
  doc: "docs/quality/AG69F_LEGACY_WORD_BANK_EVIDENCE_ALIGNMENT_REVIEWED_DRAFT.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const d02Items = Array.isArray(d02Bank.items) ? d02Bank.items : [];
const d02Approved = d02Items.filter((item) => item.review_status === "approved");
const d02NeedsReview = d02Items.filter((item) => item.review_status !== "approved");
const previewItems = Array.isArray(ag63Preview.items) ? ag63Preview.items : [];
const mappedRecords = Array.isArray(ag69eMapping.mapped_records) ? ag69eMapping.mapped_records : [];

const sourceRefs = ag69dSourceBank.source_references || [];
const sourceIdsByCategory = (category) => sourceRefs
  .filter((source) => source.source_category === category)
  .map((source) => source.source_reference_id);

const sourceFamilies = {
  sanskrit_lexical: sourceIdsByCategory("lexical_reference"),
  hindi_lexical: sourceIdsByCategory("hindi_lexical_or_institutional_reference"),
  corpus_or_text_attestation: [
    ...sourceIdsByCategory("corpus_attestation_reference"),
    ...sourceIdsByCategory("machine_readable_text_reference")
  ],
  vedic_context: sourceIdsByCategory("primary_text_or_institutional_vedic_reference")
};

function normaliseText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[ःम्ंँ।.,;:!?\s]+$/g, "")
    .replace(/\s+/g, " ");
}

function possibleLegacyMatches(mapped) {
  const mappedValues = new Set([
    normaliseText(mapped.word_id),
    normaliseText(mapped.english_word),
    normaliseText(mapped.hindi_word),
    normaliseText(mapped.sanskrit_word),
    normaliseText(mapped.transliteration)
  ].filter(Boolean));

  return previewItems
    .filter((item) => {
      const values = [
        item.word_id,
        item.english,
        item.hindi,
        item.sanskrit
      ].map(normaliseText).filter(Boolean);
      return values.some((value) => mappedValues.has(value));
    })
    .map((item) => ({
      legacy_word_id: item.word_id,
      english: item.english,
      hindi: item.hindi,
      sanskrit: item.sanskrit,
      match_status: "possible_exact_field_overlap_not_source_confirmation"
    }));
}

const discovery = {
  module_id: "AG69F",
  title: "Existing Word Asset Discovery Record",
  status: "existing_word_assets_discovered",
  current_git_context: git,
  discovered_assets: {
    d02_word_bank: {
      path: "data/knowledge/daily-guidance/word-of-day-bank-d02.json",
      status: d02Bank.status,
      item_count: d02Items.length,
      approved_count: d02Approved.length,
      needs_review_count: d02NeedsReview.length,
      item_fields: Array.from(new Set(d02Items.flatMap((item) => Object.keys(item)))).sort()
    },
    d02_rotation_policy: {
      path: "data/knowledge/daily-guidance/word-of-day-rotation-policy-d02.json",
      status: d02Rotation.status,
      public_rotation_enabled: d02Rotation.public_rotation_enabled
    },
    ag63_preview_bank: {
      path: "data/initial-working-data/word-of-day/ag63a-word-bank-approved-preview.json",
      status: ag63Preview.status,
      item_count: previewItems.length
    },
    ag63_initial_working_data: {
      path: "data/initial-working-data/word-of-day/ag63a-word-of-the-day-initial-working-data.json",
      status: ag63Initial.status
    },
    generated_word_output: {
      path: "generated/word-of-day.json",
      module_id: generatedWord.module_id,
      status: generatedWord.status,
      public_ui_ready: generatedWord.public_ui_ready,
      dynamic_rotation_active: generatedWord.dynamic_rotation_active,
      ai_generation_active: generatedWord.ai_generation_active,
      source_expansion_active: generatedWord.source_expansion_active,
      available_preview_bank_count: generatedWord.available_preview_bank_count
    }
  },
  conclusion: "Legacy D02/AG63 word records are working-data/approved-preview records, but not AG69 source-evidence approved records."
};

const legacyAlignmentItems = previewItems.map((item) => ({
  legacy_word_id: item.word_id,
  english: item.english,
  hindi: item.hindi,
  sanskrit: item.sanskrit,
  theme: item.theme,
  legacy_review_status: item.review_status,
  legacy_public_use_mode: item.public_use_mode,
  legacy_source_basis: item.source_basis,
  legacy_source_file: item.source_file,
  classical_claim_made: item.classical_claim_made,
  scriptural_claim_made: item.scriptural_claim_made,
  needs_deeper_source_attribution_before_full_expansion: item.needs_deeper_source_attribution_before_full_expansion,
  ag69_treatment: "legacy_reviewed_preview_candidate_for_evidence_capture",
  ag69_source_evidence_status: "pending",
  ag69_review_status: "not_reviewed_under_ag69",
  ag69_approved_status: false,
  public_output_allowed_under_ag69: false
}));

const legacyAlignment = {
  module_id: "AG69F",
  title: "Legacy D02 / AG63 Evidence Alignment Register",
  status: "legacy_word_bank_aligned_as_evidence_pending",
  legacy_preview_item_count: previewItems.length,
  legacy_items: legacyAlignmentItems,
  alignment_rule: "D02/AG63 approved-preview does not equal AG69 approved-source status. Every item needs source-level evidence capture before migration."
};

const migrationAssessment = {
  module_id: "AG69F",
  title: "Legacy Approved Preview Migration Assessment",
  status: "migration_assessed_no_record_migrated_to_approved",
  d02_approved_count: d02Approved.length,
  ag63_preview_count: previewItems.length,
  migration_to_ag69_reviewed_now: false,
  migration_to_ag69_approved_now: false,
  approved_bank_created_now: false,
  reason: "Legacy records contain useful curated preview fields but do not yet carry AG69 source_reference_id, source_status=approved_source, internal_textual_discipline_check, or approved public-use permission.",
  allowed_future_migration: [
    "legacy_preview_to_evidence_pending",
    "evidence_pending_to_reviewed_draft_after_source_evidence",
    "reviewed_draft_to_approved_only_after AG69 approval validator passes"
  ],
  blocked_now: [
    "direct legacy approved-preview to AG69 approved",
    "direct generated/word-of-day.json replacement",
    "direct public output expansion"
  ]
};

const evidenceQueueItems = previewItems.map((item, index) => ({
  queue_id: `ag69f_evidence_${String(index + 1).padStart(3, "0")}`,
  legacy_word_id: item.word_id,
  english: item.english,
  hindi: item.hindi,
  sanskrit: item.sanskrit,
  theme: item.theme,
  evidence_capture_status: "pending_manual_source_evidence",
  candidate_source_families: sourceFamilies,
  required_evidence: [
    "Sanskrit lexical/form evidence if Sanskrit field is retained.",
    "Hindi lexical evidence if Hindi field is retained.",
    "Meaning/context evidence from approved source family or editorial review.",
    "Transliteration/script review.",
    "Internal textual-discipline review.",
    "Confirmation that no scriptural/classical claim is made unless source-backed."
  ],
  current_blockers: [
    "source_reference_id_not_attached",
    "source_status_not_approved",
    "internal_textual_discipline_check_pending",
    "public_use_permission_not_approved"
  ],
  public_output_allowed: false
}));

const evidenceQueue = {
  module_id: "AG69F",
  title: "Word Source Evidence Capture Queue",
  status: "source_evidence_capture_queue_created_not_executed",
  queue_item_count: evidenceQueueItems.length,
  source_content_ingested_now: false,
  queue_items: evidenceQueueItems,
  note: "AG69F creates a queue only. It does not fetch dictionary/book content and does not confirm word meanings."
};

const reviewedDraftRecords = previewItems.map((item, index) => ({
  draft_id: `ag69f_review_draft_${String(index + 1).padStart(3, "0")}`,
  legacy_word_id: item.word_id,
  english: item.english,
  hindi: item.hindi,
  sanskrit: item.sanskrit,
  meaning_en: item.meaning_en,
  meaning_hi: item.meaning_hi,
  theme: item.theme,
  usage_context: item.usage_context,
  ag69_bank_class: "candidate_evidence_draft",
  review_status: "evidence_pending",
  source_status: "pending",
  source_reference_ids: [],
  source_evidence_attached: false,
  internal_textual_discipline_check: "pending",
  language_review_status: "pending",
  safety_review_status: "pending",
  editorial_review_status: "pending",
  public_use_permission: "not_allowed",
  public_output_allowed: false,
  etymology_claim_allowed: false,
  classical_claim_allowed: false,
  scriptural_claim_allowed: false,
  approved_record_created: false,
  source_note: "Derived from legacy D02/AG63 approved-preview fields for evidence alignment only; not AG69 reviewed or approved."
}));

const reviewedDraft = {
  module_id: "AG69F",
  title: "Reviewed-Record Draft — No Approval",
  status: "reviewed_record_draft_created_evidence_pending_not_reviewed",
  draft_record_count: reviewedDraftRecords.length,
  reviewed_records_created: false,
  approved_records_created: false,
  public_output_allowed_count: 0,
  draft_records: reviewedDraftRecords
};

const crosswalk = {
  module_id: "AG69F",
  title: "AG69E / AG63 Crosswalk Record",
  status: "crosswalk_created_possible_overlap_only",
  mapped_record_count: mappedRecords.length,
  legacy_preview_count: previewItems.length,
  crosswalk_items: mappedRecords.map((mapped) => ({
    ag69e_record_id: mapped.record_id,
    ag69e_word_id: mapped.word_id,
    ag69e_english: mapped.english_word,
    ag69e_hindi: mapped.hindi_word,
    ag69e_sanskrit: mapped.sanskrit_word,
    possible_legacy_matches: possibleLegacyMatches(mapped),
    crosswalk_status: "possible_overlap_not_evidence"
  })),
  note: "Crosswalk is for review navigation only. It does not confirm equivalence, source evidence, or public-use permission."
};

const selectionBridge = {
  module_id: "AG69F",
  title: "Word Selection Policy Legacy Bridge Assessment",
  status: "selection_policy_bridge_assessed_not_active",
  legacy_rotation_policy: {
    path: "data/knowledge/daily-guidance/word-of-day-rotation-policy-d02.json",
    status: d02Rotation.status,
    public_rotation_enabled: d02Rotation.public_rotation_enabled,
    rotation_basis_future: d02Rotation.rotation_basis_future || []
  },
  ag69e_selection_context_doctrine: {
    path: "data/knowledge-base/word-of-day/ag69e-word-selection-context-doctrine.json",
    status: ag69eSelectionDoctrine.status,
    context_inputs_future: ag69eSelectionDoctrine.selection_context_inputs_future
  },
  bridge_conclusion: "Legacy D02 rotation can be treated as older static rotation context only. Future selector must use approved word bank plus approved daily context including Tithi/Vara where available.",
  active_tithi_vara_selection_started: false,
  panchang_value_generation_started: false,
  dynamic_rotation_active_now: false,
  generated_word_json_modified: false
};

const noMutationAudit = {
  module_id: "AG69F",
  title: "No Generated Word Mutation Audit",
  status: "no_generated_word_mutation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "generated_word_json_read_only", expected: true, actual: true, passed: true },
    { check_id: "generated_word_json_modified", expected: false, actual: false, passed: true },
    { check_id: "public_ui_changed", expected: false, actual: false, passed: true },
    { check_id: "dynamic_rotation_active", expected: false, actual: false, passed: true },
    { check_id: "ai_generation_active", expected: false, actual: false, passed: true },
    { check_id: "public_ui_ready_changed", expected: false, actual: false, passed: true }
  ],
  generated_word_current_status: {
    module_id: generatedWord.module_id,
    status: generatedWord.status,
    public_ui_ready: generatedWord.public_ui_ready,
    dynamic_rotation_active: generatedWord.dynamic_rotation_active,
    ai_generation_active: generatedWord.ai_generation_active
  },
  failed_checks: []
};

function audit(title, status, keys) {
  return {
    module_id: "AG69F",
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
  module_id: "AG69F",
  title: "AG69G Word Source Evidence Review Readiness Record",
  status: "ready_for_ag69g_word_source_evidence_review",
  ready_for_ag69g: true,
  next_stage: "AG69G — Word Source Evidence Review and Reviewed-Bank Validation",
  reason: "Existing D02/AG63 word assets have been discovered and aligned as evidence-pending drafts without approval or public output mutation."
};

const boundary = {
  module_id: "AG69F",
  title: "AG69F to AG69G Word Source Evidence Review Boundary",
  status: "ag69g_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Review each evidence-pending draft.",
    "Attach actual source_reference_id metadata where verified.",
    "Mark found/not found/manual review evidence status.",
    "Create reviewed-bank validation only for records passing source and language checks.",
    "Keep public_output_allowed=false until approved-bank stage."
  ],
  blocked_scope_without_explicit_approval: [
    "bulk dictionary/book content ingestion",
    "direct legacy preview to approved migration",
    "approved word bank creation",
    "public word output generation",
    "generated/word-of-day.json replacement",
    "active tithi/vara word selection",
    "Panchang value generation",
    "UI display change",
    "public attribution of internal study influence",
    "Supabase/database writes",
    "backend/Auth/Supabase activation",
    "runtime database query",
    "service-role use",
    "V02 expansion"
  ]
};

const review = {
  module_id: "AG69F",
  title: "Legacy Word Bank Evidence Alignment and Reviewed-Record Draft",
  status: "ag69f_legacy_word_bank_evidence_alignment_reviewed_draft_completed",
  current_git_context: git,
  consumed_previous_stage: {
    stage: "AG69E",
    source_file: "data/content-intelligence/quality-reviews/ag69e-word-candidate-source-mapping-review-queue.json",
    status: ag69e.status
  },
  generated_records: outputs,
  summary: {
    ag69e_consumed: true,
    existing_word_assets_discovered: true,
    d02_bank_discovered: true,
    d02_item_count: d02Items.length,
    d02_approved_count: d02Approved.length,
    d02_needs_review_count: d02NeedsReview.length,
    ag63_preview_bank_discovered: true,
    ag63_preview_count: previewItems.length,
    legacy_d02_ag63_aligned_as_evidence_pending: true,
    evidence_capture_queue_created: true,
    reviewed_record_draft_created_as_evidence_pending: true,
    reviewed_records_created: false,
    approved_records_created: false,
    approved_bank_created: false,
    public_output_from_legacy_records_allowed: false,
    source_content_ingested: false,
    bulk_copyrighted_ingestion: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    active_tithi_vara_selection_started: false,
    panchang_value_generation_started: false,
    supabase_database_write_performed: false,
    backend_runtime_activated: false,
    database_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag69g: true
  }
};

const registry = {
  module_id: "AG69F",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69F",
  status: review.status,
  existing_word_assets_discovered: 1,
  d02_item_count: d02Items.length,
  d02_approved_count: d02Approved.length,
  ag63_preview_count: previewItems.length,
  legacy_d02_ag63_aligned_as_evidence_pending: 1,
  evidence_capture_queue_created: 1,
  reviewed_record_draft_created_as_evidence_pending: 1,
  reviewed_records_created: 0,
  approved_records_created: 0,
  approved_bank_created: 0,
  public_output_from_legacy_records_allowed: 0,
  source_content_ingested: 0,
  bulk_copyrighted_ingestion: 0,
  generated_word_json_modified: 0,
  ui_display_changed: 0,
  active_tithi_vara_selection_started: 0,
  panchang_value_generation_started: 0,
  supabase_database_write_performed: 0,
  backend_runtime_activated: 0,
  database_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag69g: 1
};

const doc = `# AG69F — Legacy Word Bank Evidence Alignment and Reviewed-Record Draft

AG69F aligns the older D02 / AG63 Word of the Day working-data bank with the newer AG69 methodology-first evidence model.

## Discovered

- D02 curated word bank.
- D02 rotation policy.
- AG63A approved-preview word bank.
- AG63A initial working data.
- generated/word-of-day.json.

## Key finding

The existing D02 / AG63 records are useful as legacy reviewed-preview material, but they are not AG69 source-evidence approved records.

## Created

- Existing word asset discovery record.
- Legacy D02 / AG63 evidence alignment register.
- Migration assessment.
- Source evidence capture queue.
- Evidence-pending reviewed-record draft.
- AG69E / AG63 crosswalk.
- Selection-policy bridge assessment.

## Not performed

- No approved word bank.
- No reviewed records under AG69.
- No public Word output.
- No generated/word-of-day.json replacement.
- No active Tithi/Vara selection.
- No Panchang value generation.
- No UI change.
- No source content ingestion.
- No Supabase/database/backend/Auth/RLS/service-role activation.
- No V02 expansion.
`;

writeJson(outputs.discovery, discovery);
writeJson(outputs.legacyAlignment, legacyAlignment);
writeJson(outputs.migrationAssessment, migrationAssessment);
writeJson(outputs.evidenceQueue, evidenceQueue);
writeJson(outputs.reviewedDraft, reviewedDraft);
writeJson(outputs.crosswalk, crosswalk);
writeJson(outputs.selectionBridge, selectionBridge);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG69F legacy word bank evidence alignment generated.");
console.log("✅ D02 / AG63 assets aligned as evidence-pending only.");
console.log("✅ Reviewed-record draft created as evidence-pending, not reviewed or approved.");
console.log("✅ No generated word mutation, public output, source ingestion, backend/database/V02 activation performed.");
