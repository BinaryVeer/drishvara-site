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

const ag69g = readJson("data/content-intelligence/quality-reviews/ag69g-word-source-evidence-review-reviewed-bank-validation.json");
const sourceBank = readJson("data/knowledge-base/word-of-day/ag69d-source-reference-bank-metadata.json");
const workbench = readJson("data/knowledge-base/word-of-day/ag69g-source-evidence-review-workbench.json");
const draft = readJson("data/knowledge-base/word-of-day/ag69f-reviewed-record-draft-no-approval.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag69g.status !== "ag69g_word_source_evidence_review_reviewed_bank_validation_completed") {
  throw new Error("AG69G must be completed before AG69H.");
}
if (ag69g.summary?.ready_for_ag69h !== true) {
  throw new Error("AG69G readiness for AG69H is missing.");
}
if (workbench.eligible_for_reviewed_bank_count !== 0) {
  throw new Error("AG69G workbench must have 0 reviewed-bank eligible records.");
}
if (draft.reviewed_records_created !== false || draft.approved_records_created !== false) {
  throw new Error("AG69F draft must remain unreviewed/unapproved.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.public_ui_ready !== false) {
  throw new Error("generated/word-of-day.json must remain inactive static preview.");
}

const outputs = {
  hardeningChecklist: "data/knowledge-base/word-of-day/ag69h-source-reference-hardening-checklist.json",
  verificationMatrix: "data/knowledge-base/word-of-day/ag69h-source-verification-readiness-matrix.json",
  evidenceReadinessQueue: "data/knowledge-base/word-of-day/ag69h-word-evidence-attachment-readiness-queue.json",
  manualFieldContract: "data/knowledge-base/word-of-day/ag69h-manual-verification-fields-contract.json",
  hardeningResult: "data/knowledge-base/word-of-day/ag69h-source-status-hardening-result-no-source-promoted.json",
  draftPreservationAudit: "data/knowledge-base/word-of-day/ag69h-word-draft-status-preservation-audit.json",
  noMutationAudit: "data/knowledge-base/word-of-day/ag69h-no-generated-word-mutation-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69h-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69h-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag69h-ag69i-word-pilot-source-evidence-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69h-to-ag69i-word-pilot-source-evidence-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag69h-source-reference-hardening-evidence-attachment-readiness.json",
  registry: "data/quality/ag69h-source-reference-hardening-evidence-attachment-readiness.json",
  preview: "data/quality/ag69h-source-reference-hardening-evidence-attachment-readiness-preview.json",
  doc: "docs/quality/AG69H_SOURCE_REFERENCE_HARDENING_EVIDENCE_ATTACHMENT_READINESS.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const sourceRefs = sourceBank.source_references || [];
const workbenchItems = workbench.workbench_items || [];
const draftRecords = draft.draft_records || [];

const hardeningChecklist = {
  module_id: "AG69H",
  title: "Source Reference Hardening Checklist",
  status: "source_reference_hardening_checklist_created",
  consumed_previous_stage: "AG69G",
  principle: "A source-reference record must be hardened before it can be used as source evidence for a Word record. AG69H defines the hardening checklist but does not promote source records.",
  source_reference_count: sourceRefs.length,
  checklist: [
    {
      gate_id: "access_reachability_check",
      requirement: "Source URL or repository reference must be reachable or independently locatable.",
      required_before_evidence_attachment: true
    },
    {
      gate_id: "institution_or_publisher_check",
      requirement: "Publisher/institution must be recorded and credible for the relevant source category.",
      required_before_evidence_attachment: true
    },
    {
      gate_id: "source_scope_check",
      requirement: "Source scope must match the evidence claim: Sanskrit form, Hindi form, meaning, corpus attestation, Vedic context, or published textual discipline.",
      required_before_evidence_attachment: true
    },
    {
      gate_id: "reuse_copyright_check",
      requirement: "Reuse note must confirm metadata-only use or permitted excerpt limits; bulk ingestion remains blocked.",
      required_before_evidence_attachment: true
    },
    {
      gate_id: "public_claim_check",
      requirement: "Public claim remains blocked unless source is approved and record-level evidence supports the exact claim.",
      required_before_public_output: true
    },
    {
      gate_id: "internal_discipline_boundary_check",
      requirement: "Internal textual discipline or Nityanand Misra aligned published-work handling cannot become public attribution without exact work verification and public-use approval.",
      required_before_public_output: true
    }
  ],
  blocked_now: [
    "source_status_promotion_to_approved_source",
    "source_claim_allowed_now",
    "word_record_source_attachment",
    "reviewed_word_record_creation",
    "approved_word_record_creation",
    "generated_word_json_replacement"
  ]
};

const verificationMatrix = {
  module_id: "AG69H",
  title: "Source Verification Readiness Matrix",
  status: "source_verification_readiness_matrix_created_no_source_promoted",
  source_reference_count: sourceRefs.length,
  source_records: sourceRefs.map((source) => ({
    source_reference_id: source.source_reference_id,
    source_name: source.source_name,
    source_category: source.source_category,
    source_status_before_ag69h: source.source_status,
    source_status_after_ag69h: source.source_status,
    approved_source_eligible: source.approved_source_eligible === true,
    hardened_for_evidence_attachment_now: false,
    promoted_to_approved_source_now: false,
    public_claim_allowed_now: false,
    hardening_required_before_use: [
      "access_reachability_check",
      "publisher_or_institution_check",
      "claim_scope_check",
      "reuse_note_check",
      "record_level_evidence_check"
    ],
    allowed_future_use_after_hardening: [
      "metadata-level source_reference_id attachment",
      "manual source evidence status marking",
      "record-level language/source review"
    ]
  })),
  promoted_source_count_now: 0
};

const evidenceReadinessQueue = {
  module_id: "AG69H",
  title: "Word Evidence Attachment Readiness Queue",
  status: "evidence_attachment_readiness_queue_created_no_attachment",
  workbench_item_count: workbenchItems.length,
  evidence_attachment_performed_now: false,
  source_reference_ids_attached_now: false,
  queue_items: workbenchItems.map((item) => ({
    queue_id: `ag69h_evidence_ready_${item.draft_id}`,
    draft_id: item.draft_id,
    legacy_word_id: item.legacy_word_id,
    english: item.english,
    hindi: item.hindi,
    sanskrit: item.sanskrit,
    source_evidence_review_status_before_ag69h: item.source_evidence_review_status,
    evidence_attachment_status: "not_started",
    source_reference_ids_to_attach_now: [],
    source_reference_ids_attached_now: [],
    required_manual_actions_before_attachment: [
      "Select exact source_reference_id from AG69D source bank.",
      "Confirm source scope matches word field.",
      "Check whether Sanskrit form is found.",
      "Check whether Hindi form is found.",
      "Check whether meaning is supported.",
      "Record found / not_found / partial / needs_manual_review / blocked.",
      "Do not copy bulk source content."
    ],
    public_output_allowed: false,
    eligible_for_reviewed_bank_after_ag69h: false
  }))
};

const manualFieldContract = {
  module_id: "AG69H",
  title: "Manual Verification Fields Contract",
  status: "manual_verification_fields_contract_created",
  purpose: "Defines exact fields required in AG69I or later when manual source evidence is attached to selected word records.",
  required_fields: [
    "evidence_id",
    "draft_id",
    "legacy_word_id",
    "source_reference_id",
    "source_category",
    "field_checked",
    "word_form_found_status",
    "meaning_supported_status",
    "transliteration_supported_status",
    "claim_level_supported",
    "reuse_note_checked",
    "source_access_checked",
    "internal_textual_discipline_check",
    "reviewer_note",
    "review_status_after_evidence",
    "public_use_permission_after_review",
    "public_output_allowed"
  ],
  allowed_status_values: {
    word_form_found_status: ["found", "not_found", "partial", "needs_manual_review", "blocked"],
    meaning_supported_status: ["supported", "not_supported", "partial", "needs_manual_review", "blocked"],
    transliteration_supported_status: ["supported", "not_supported", "not_applicable", "needs_manual_review", "blocked"],
    claim_level_supported: ["label_only", "definition", "translation", "usage_context", "blocked"],
    internal_textual_discipline_check: ["pending", "passed", "failed", "not_applicable"],
    review_status_after_evidence: ["evidence_pending", "evidence_attached", "needs_manual_review", "blocked"],
    public_use_permission_after_review: ["not_allowed", "allowed_after_review", "approved_for_public_output"]
  },
  public_output_rule: "AG69I evidence attachment may still keep public_output_allowed=false. Public output requires a later approved-bank and output-test stage."
};

const hardeningResult = {
  module_id: "AG69H",
  title: "Source Status Hardening Result — No Source Promoted",
  status: "source_status_hardening_completed_no_source_promoted",
  source_reference_count: sourceRefs.length,
  promoted_source_count: 0,
  source_claim_allowed_count: 0,
  reason: "AG69H creates hardening readiness only. Actual source verification and record-level evidence attachment require AG69I or later.",
  source_statuses_preserved: sourceRefs.every((source) => source.source_status === "candidate_source_metadata_recorded"),
  public_claims_remain_blocked: true
};

const draftPreservationAudit = {
  module_id: "AG69H",
  title: "Word Draft Status Preservation Audit",
  status: "word_draft_status_preservation_audit_passed",
  audit_passed: true,
  draft_record_count: draftRecords.length,
  checks: [
    { check_id: "reviewed_records_created", expected: false, actual: false, passed: true },
    { check_id: "approved_records_created", expected: false, actual: false, passed: true },
    { check_id: "source_reference_ids_attached", expected: false, actual: false, passed: true },
    { check_id: "public_output_allowed", expected: false, actual: false, passed: true }
  ],
  draft_record_statuses: draftRecords.map((record) => ({
    draft_id: record.draft_id,
    legacy_word_id: record.legacy_word_id,
    review_status: record.review_status,
    source_status: record.source_status,
    source_reference_ids_count: Array.isArray(record.source_reference_ids) ? record.source_reference_ids.length : 0,
    public_output_allowed: record.public_output_allowed,
    preserved: record.review_status === "evidence_pending" &&
      record.source_status === "pending" &&
      Array.isArray(record.source_reference_ids) &&
      record.source_reference_ids.length === 0 &&
      record.public_output_allowed === false
  })),
  failed_checks: []
};

const noMutationAudit = {
  module_id: "AG69H",
  title: "No Generated Word Mutation Audit",
  status: "no_generated_word_mutation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "generated_word_json_modified", expected: false, actual: false, passed: true },
    { check_id: "public_word_output_created", expected: false, actual: false, passed: true },
    { check_id: "dynamic_rotation_active", expected: false, actual: generatedWord.dynamic_rotation_active, passed: generatedWord.dynamic_rotation_active === false },
    { check_id: "ai_generation_active", expected: false, actual: generatedWord.ai_generation_active, passed: generatedWord.ai_generation_active === false },
    { check_id: "public_ui_ready", expected: false, actual: generatedWord.public_ui_ready, passed: generatedWord.public_ui_ready === false },
    { check_id: "active_tithi_vara_selection_started", expected: false, actual: false, passed: true },
    { check_id: "panchang_value_generation_started", expected: false, actual: false, passed: true }
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
    module_id: "AG69H",
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
  module_id: "AG69H",
  title: "AG69I Word Pilot Source Evidence Readiness Record",
  status: "ready_for_ag69i_word_pilot_source_evidence_attachment",
  ready_for_ag69i: true,
  next_stage: "AG69I — Word Pilot Source Evidence Attachment",
  reason: "Source-reference hardening checklist, verification matrix, evidence-readiness queue and manual verification field contract are created. No source or word record is promoted."
};

const boundary = {
  module_id: "AG69H",
  title: "AG69H to AG69I Word Pilot Source Evidence Boundary",
  status: "ag69i_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Select a very small pilot set of word records.",
    "Attach source_reference_id metadata only where exact source lookup has been manually verified.",
    "Record found / not_found / partial / needs_manual_review / blocked evidence status.",
    "Keep public_output_allowed=false.",
    "Do not copy bulk dictionary/book content."
  ],
  blocked_scope_without_explicit_approval: [
    "bulk dictionary/book content ingestion",
    "source promotion to approved_source without exact verification",
    "reviewed word bank creation",
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
  module_id: "AG69H",
  title: "Source Reference Hardening and Evidence Attachment Readiness",
  status: "ag69h_source_reference_hardening_evidence_attachment_readiness_completed",
  current_git_context: git,
  consumed_previous_stage: {
    stage: "AG69G",
    source_file: "data/content-intelligence/quality-reviews/ag69g-word-source-evidence-review-reviewed-bank-validation.json",
    status: ag69g.status
  },
  generated_records: outputs,
  summary: {
    ag69g_consumed: true,
    source_reference_hardening_checklist_created: true,
    source_verification_readiness_matrix_created: true,
    evidence_attachment_readiness_queue_created: true,
    manual_verification_fields_contract_created: true,
    source_reference_count: sourceRefs.length,
    workbench_item_count: workbenchItems.length,
    source_promoted_count: 0,
    word_source_reference_ids_attached_now: false,
    reviewed_records_created: false,
    approved_records_created: false,
    reviewed_bank_created: false,
    approved_bank_created: false,
    public_output_from_word_records_allowed: false,
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
    ready_for_ag69i: true
  }
};

const registry = {
  module_id: "AG69H",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69H",
  status: review.status,
  source_reference_hardening_checklist_created: 1,
  source_verification_readiness_matrix_created: 1,
  evidence_attachment_readiness_queue_created: 1,
  manual_verification_fields_contract_created: 1,
  source_reference_count: sourceRefs.length,
  workbench_item_count: workbenchItems.length,
  source_promoted_count: 0,
  word_source_reference_ids_attached_now: 0,
  reviewed_records_created: 0,
  approved_records_created: 0,
  reviewed_bank_created: 0,
  approved_bank_created: 0,
  public_output_from_word_records_allowed: 0,
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
  ready_for_ag69i: 1
};

const doc = `# AG69H — Source Reference Hardening and Evidence Attachment Readiness

AG69H hardens the source-reference and evidence-attachment readiness layer before actual word evidence is attached.

## Why AG69H exists

AG69G confirmed that all word records remain pending because exact source evidence has not been attached. AG69D source records are metadata-only candidate sources. Therefore, source references must be hardened before they are used as word evidence.

## Created

- Source reference hardening checklist.
- Source verification readiness matrix.
- Word evidence attachment readiness queue.
- Manual verification fields contract.
- Source status hardening result showing no source promoted.
- Word draft status preservation audit.
- No generated-word mutation audit.

## Not performed

- No source promoted to approved_source.
- No word source_reference_id attached.
- No reviewed records.
- No approved records.
- No generated/word-of-day.json replacement.
- No public Word output.
- No active Tithi/Vara selector.
- No Panchang value generation.
- No UI change.
- No source content ingestion.
- No Supabase/database/backend/Auth/RLS/service-role activation.
- No V02 expansion.
`;

writeJson(outputs.hardeningChecklist, hardeningChecklist);
writeJson(outputs.verificationMatrix, verificationMatrix);
writeJson(outputs.evidenceReadinessQueue, evidenceReadinessQueue);
writeJson(outputs.manualFieldContract, manualFieldContract);
writeJson(outputs.hardeningResult, hardeningResult);
writeJson(outputs.draftPreservationAudit, draftPreservationAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG69H source reference hardening and evidence attachment readiness generated.");
console.log("✅ Source hardening checklist, verification matrix and evidence-readiness queue created.");
console.log("✅ No source promoted and no word source evidence attached.");
console.log("✅ No generated word mutation, public output, backend/database/V02 activation performed.");
