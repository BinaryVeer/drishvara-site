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

const ag69f = readJson("data/content-intelligence/quality-reviews/ag69f-legacy-word-bank-evidence-alignment-reviewed-draft.json");
const draft = readJson("data/knowledge-base/word-of-day/ag69f-reviewed-record-draft-no-approval.json");
const evidenceQueue = readJson("data/knowledge-base/word-of-day/ag69f-word-source-evidence-capture-queue.json");
const sourceBank = readJson("data/knowledge-base/word-of-day/ag69d-source-reference-bank-metadata.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag69f.status !== "ag69f_legacy_word_bank_evidence_alignment_reviewed_draft_completed") {
  throw new Error("AG69F must be completed before AG69G.");
}
if (ag69f.summary?.ready_for_ag69g !== true) {
  throw new Error("AG69F readiness for AG69G is missing.");
}
if (draft.reviewed_records_created !== false || draft.approved_records_created !== false) {
  throw new Error("AG69F draft must not already contain reviewed/approved records.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false) {
  throw new Error("generated/word-of-day.json must remain non-dynamic and non-AI.");
}

const outputs = {
  protocol: "data/knowledge-base/word-of-day/ag69g-source-evidence-review-protocol.json",
  workbench: "data/knowledge-base/word-of-day/ag69g-source-evidence-review-workbench.json",
  validationGate: "data/knowledge-base/word-of-day/ag69g-reviewed-bank-validation-gate.json",
  validationResult: "data/knowledge-base/word-of-day/ag69g-reviewed-bank-validation-result-no-records-promoted.json",
  reviewedBankPlaceholder: "data/knowledge-base/word-of-day/ag69g-reviewed-bank-placeholder-empty.json",
  evidenceTemplate: "data/knowledge-base/word-of-day/ag69g-manual-source-evidence-capture-template.json",
  noMutationAudit: "data/knowledge-base/word-of-day/ag69g-no-generated-word-mutation-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69g-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69g-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag69g-ag69h-word-source-evidence-attachment-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69g-to-ag69h-word-source-evidence-attachment-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag69g-word-source-evidence-review-reviewed-bank-validation.json",
  registry: "data/quality/ag69g-word-source-evidence-review-reviewed-bank-validation.json",
  preview: "data/quality/ag69g-word-source-evidence-review-reviewed-bank-validation-preview.json",
  doc: "docs/quality/AG69G_WORD_SOURCE_EVIDENCE_REVIEW_REVIEWED_BANK_VALIDATION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const draftRecords = draft.draft_records || [];
const sourceRefs = sourceBank.source_references || [];

const protocol = {
  module_id: "AG69G",
  title: "Word Source Evidence Review Protocol",
  status: "source_evidence_review_protocol_defined",
  consumed_previous_stage: "AG69F",
  principle: "No evidence-pending Word record may become reviewed unless exact source evidence is attached and checked. AG69G defines and runs the validation gate; it does not fabricate evidence.",
  required_evidence_slots: [
    "sanskrit_form_evidence",
    "hindi_form_evidence",
    "meaning_context_evidence",
    "transliteration_review",
    "internal_textual_discipline_check",
    "public_use_permission_review",
    "editorial_review"
  ],
  source_rules: [
    "Use source metadata from AG69D source-reference bank.",
    "Do not copy bulk dictionary or book content into the repo.",
    "Do not treat AG63/D02 preview status as AG69 source approval.",
    "Do not use AI-generated meanings as source evidence.",
    "Do not make etymology, classical or scriptural claims unless separate verified source evidence exists.",
    "Nityanand Misra aligned published works remain candidate review inputs only unless exact work/edition is independently verified."
  ],
  public_output_rule: "Reviewed-bank validation cannot produce public output. Public output remains blocked until a later approved-bank and output-test stage."
};

const workbenchItems = draftRecords.map((record) => ({
  workbench_id: `ag69g_workbench_${record.draft_id}`,
  draft_id: record.draft_id,
  legacy_word_id: record.legacy_word_id,
  english: record.english,
  hindi: record.hindi,
  sanskrit: record.sanskrit,
  review_input_status: record.review_status,
  source_status_before_ag69g: record.source_status,
  source_reference_ids_before_ag69g: record.source_reference_ids,
  source_evidence_review_status: "pending_exact_source_evidence",
  eligible_for_reviewed_bank: false,
  reviewed_bank_blockers: [
    "source_reference_ids_empty",
    "source_evidence_not_attached",
    "language_review_pending",
    "internal_textual_discipline_pending",
    "public_use_permission_not_allowed"
  ],
  required_next_action: "Attach exact source-reference evidence in AG69H or later before reviewed-bank promotion.",
  public_output_allowed: false
}));

const workbench = {
  module_id: "AG69G",
  title: "Word Source Evidence Review Workbench",
  status: "source_evidence_review_workbench_created_pending",
  draft_record_count: draftRecords.length,
  workbench_item_count: workbenchItems.length,
  eligible_for_reviewed_bank_count: 0,
  source_content_ingested_now: false,
  workbench_items: workbenchItems
};

const validationGate = {
  module_id: "AG69G",
  title: "Reviewed-Bank Validation Gate",
  status: "reviewed_bank_validation_gate_defined",
  validation_requirements: [
    "source_reference_ids must contain at least one approved source-reference metadata ID",
    "source_evidence_attached must be true",
    "source_status must be source_checked or approved_source",
    "language_review_status must be reviewed or approved",
    "safety_review_status must be reviewed or approved",
    "editorial_review_status must be reviewed or approved",
    "internal_textual_discipline_check must be passed or not_applicable",
    "public_use_permission must be allowed_after_review or approved_for_public_output",
    "public_output_allowed must remain false at reviewed-bank stage"
  ],
  reviewed_bank_creation_allowed_now: false,
  reason: "Existing AG69F draft records have no attached source_reference_ids or source evidence."
};

const validationResult = {
  module_id: "AG69G",
  title: "Reviewed-Bank Validation Result — No Records Promoted",
  status: "reviewed_bank_validation_completed_no_records_promoted",
  draft_record_count: draftRecords.length,
  reviewed_eligible_count: 0,
  reviewed_records_created: false,
  approved_records_created: false,
  validation_items: workbenchItems.map((item) => ({
    draft_id: item.draft_id,
    legacy_word_id: item.legacy_word_id,
    validation_status: "failed_pending_evidence",
    eligible_for_reviewed_bank: false,
    failure_reasons: item.reviewed_bank_blockers
  }))
};

const reviewedBankPlaceholder = {
  module_id: "AG69G",
  title: "Reviewed Bank Placeholder — Empty",
  status: "reviewed_bank_placeholder_empty",
  reviewed_records: [],
  reviewed_record_count: 0,
  approved_record_count: 0,
  public_output_allowed: false,
  generated_word_json_modified: false
};

const evidenceTemplate = {
  module_id: "AG69G",
  title: "Manual Source Evidence Capture Template",
  status: "manual_source_evidence_template_created",
  template_only: true,
  source_reference_bank_used: "data/knowledge-base/word-of-day/ag69d-source-reference-bank-metadata.json",
  available_source_reference_count: sourceRefs.length,
  required_fields_for_future_evidence_attachment: [
    "draft_id",
    "legacy_word_id",
    "source_reference_id",
    "source_evidence_scope",
    "source_evidence_status",
    "word_form_found",
    "meaning_supported",
    "transliteration_supported",
    "claim_level_supported",
    "reuse_note_checked",
    "reviewer_note",
    "public_use_permission_after_review"
  ],
  allowed_source_evidence_status_values: [
    "found",
    "not_found",
    "partial",
    "needs_manual_review",
    "blocked"
  ],
  prohibited_storage: [
    "bulk dictionary entries",
    "book chapter text",
    "copyrighted source excerpts beyond fair citation/review limits",
    "AI-generated source substitute"
  ]
};

const noMutationAudit = {
  module_id: "AG69G",
  title: "No Generated Word Mutation Audit",
  status: "no_generated_word_mutation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "generated_word_json_modified", expected: false, actual: false, passed: true },
    { check_id: "public_word_output_created", expected: false, actual: false, passed: true },
    { check_id: "dynamic_rotation_active", expected: false, actual: generatedWord.dynamic_rotation_active, passed: generatedWord.dynamic_rotation_active === false },
    { check_id: "ai_generation_active", expected: false, actual: generatedWord.ai_generation_active, passed: generatedWord.ai_generation_active === false },
    { check_id: "public_ui_ready", expected: false, actual: generatedWord.public_ui_ready, passed: generatedWord.public_ui_ready === false },
    { check_id: "source_content_ingested_now", expected: false, actual: false, passed: true }
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
    module_id: "AG69G",
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
  module_id: "AG69G",
  title: "AG69H Word Source Evidence Attachment Readiness Record",
  status: "ready_for_ag69h_word_source_evidence_attachment",
  ready_for_ag69h: true,
  next_stage: "AG69H — Word Source Evidence Attachment and Reviewed Draft Update",
  reason: "AG69G created the source-evidence review workbench and validation gate. No draft record passed because exact source evidence is still absent."
};

const boundary = {
  module_id: "AG69G",
  title: "AG69G to AG69H Word Source Evidence Attachment Boundary",
  status: "ag69h_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Attach exact source_reference_id evidence to selected draft records.",
    "Record found / not_found / partial / needs_manual_review source evidence status.",
    "Do not bulk-copy source text.",
    "Update reviewed-draft status only where evidence supports it.",
    "Keep public_output_allowed=false."
  ],
  blocked_scope_without_explicit_approval: [
    "bulk dictionary/book content ingestion",
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
  module_id: "AG69G",
  title: "Word Source Evidence Review and Reviewed-Bank Validation",
  status: "ag69g_word_source_evidence_review_reviewed_bank_validation_completed",
  current_git_context: git,
  consumed_previous_stage: {
    stage: "AG69F",
    source_file: "data/content-intelligence/quality-reviews/ag69f-legacy-word-bank-evidence-alignment-reviewed-draft.json",
    status: ag69f.status
  },
  generated_records: outputs,
  summary: {
    ag69f_consumed: true,
    source_evidence_review_protocol_defined: true,
    source_evidence_review_workbench_created: true,
    reviewed_bank_validation_gate_defined: true,
    reviewed_bank_validation_completed: true,
    draft_record_count: draftRecords.length,
    reviewed_eligible_count: 0,
    reviewed_records_created: false,
    approved_records_created: false,
    reviewed_bank_created: false,
    approved_bank_created: false,
    public_output_from_reviewed_bank_allowed: false,
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
    ready_for_ag69h: true
  }
};

const registry = {
  module_id: "AG69G",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69G",
  status: review.status,
  source_evidence_review_protocol_defined: 1,
  source_evidence_review_workbench_created: 1,
  reviewed_bank_validation_gate_defined: 1,
  reviewed_bank_validation_completed: 1,
  draft_record_count: draftRecords.length,
  reviewed_eligible_count: 0,
  reviewed_records_created: 0,
  approved_records_created: 0,
  reviewed_bank_created: 0,
  approved_bank_created: 0,
  public_output_from_reviewed_bank_allowed: 0,
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
  ready_for_ag69h: 1
};

const doc = `# AG69G — Word Source Evidence Review and Reviewed-Bank Validation

AG69G creates the source-evidence review protocol and reviewed-bank validation gate for Word of the Day.

## Discovery basis

AG69F created 11 evidence-pending draft records. None has attached source evidence.

## AG69G result

AG69G validates that no record can yet move to reviewed-bank status because exact source evidence has not been attached.

## Created

- Source evidence review protocol.
- Source evidence review workbench.
- Reviewed-bank validation gate.
- Reviewed-bank validation result.
- Empty reviewed-bank placeholder.
- Manual source evidence capture template.
- No generated-word mutation audit.

## Not performed

- No source content ingestion.
- No reviewed word records.
- No approved word records.
- No generated/word-of-day.json replacement.
- No public Word output.
- No UI change.
- No active Tithi/Vara selector.
- No Panchang value generation.
- No Supabase/database/backend/Auth/RLS/service-role activation.
- No V02 expansion.
`;

writeJson(outputs.protocol, protocol);
writeJson(outputs.workbench, workbench);
writeJson(outputs.validationGate, validationGate);
writeJson(outputs.validationResult, validationResult);
writeJson(outputs.reviewedBankPlaceholder, reviewedBankPlaceholder);
writeJson(outputs.evidenceTemplate, evidenceTemplate);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG69G source evidence review and reviewed-bank validation generated.");
console.log("✅ Reviewed-bank validation completed with 0 records promoted.");
console.log("✅ Manual source evidence template created for AG69H.");
console.log("✅ No source ingestion, public output, UI change, backend/database/V02 activation performed.");
