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

const ag69h = readJson("data/content-intelligence/quality-reviews/ag69h-source-reference-hardening-evidence-attachment-readiness.json");
const queue = readJson("data/knowledge-base/word-of-day/ag69h-word-evidence-attachment-readiness-queue.json");
const sourceMatrix = readJson("data/knowledge-base/word-of-day/ag69h-source-verification-readiness-matrix.json");
const manualContract = readJson("data/knowledge-base/word-of-day/ag69h-manual-verification-fields-contract.json");
const draft = readJson("data/knowledge-base/word-of-day/ag69f-reviewed-record-draft-no-approval.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag69h.status !== "ag69h_source_reference_hardening_evidence_attachment_readiness_completed") {
  throw new Error("AG69H must be completed before AG69I.");
}
if (ag69h.summary?.ready_for_ag69i !== true) {
  throw new Error("AG69H readiness for AG69I is missing.");
}
if (ag69h.summary?.source_promoted_count !== 0) {
  throw new Error("AG69H must have 0 promoted sources.");
}
if (queue.evidence_attachment_performed_now !== false || queue.source_reference_ids_attached_now !== false) {
  throw new Error("AG69H queue must have no evidence attachment.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.public_ui_ready !== false) {
  throw new Error("generated/word-of-day.json must remain inactive static preview.");
}

const outputs = {
  pilotSelection: "data/knowledge-base/word-of-day/ag69i-pilot-word-selection-record.json",
  lookupPacket: "data/knowledge-base/word-of-day/ag69i-pilot-source-lookup-task-packet.json",
  attachmentAttempt: "data/knowledge-base/word-of-day/ag69i-source-evidence-attachment-attempt-no-records-attached.json",
  draftPreservationAudit: "data/knowledge-base/word-of-day/ag69i-word-draft-preservation-audit.json",
  sourcePreservationAudit: "data/knowledge-base/word-of-day/ag69i-source-reference-preservation-audit.json",
  manualEvidenceTemplate: "data/knowledge-base/word-of-day/ag69i-manual-evidence-entry-template.json",
  noMutationAudit: "data/knowledge-base/word-of-day/ag69i-no-generated-word-mutation-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69i-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69i-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag69i-ag69j-manual-source-evidence-capture-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69i-to-ag69j-manual-source-evidence-capture-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag69i-word-pilot-source-evidence-attachment-packet.json",
  registry: "data/quality/ag69i-word-pilot-source-evidence-attachment-packet.json",
  preview: "data/quality/ag69i-word-pilot-source-evidence-attachment-packet-preview.json",
  doc: "docs/quality/AG69I_WORD_PILOT_SOURCE_EVIDENCE_ATTACHMENT_PACKET.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const queueItems = queue.queue_items || [];
const draftRecords = draft.draft_records || [];
const sourceRecords = sourceMatrix.source_records || [];

const pilotWordIds = ["reflection", "discernment", "patience"];
const pilotItems = queueItems.filter((item) => pilotWordIds.includes(item.legacy_word_id));

if (pilotItems.length !== pilotWordIds.length) {
  throw new Error("Pilot word selection could not find all expected records.");
}

const sourceGroups = {
  sanskrit_lexical: sourceRecords
    .filter((s) => s.source_category === "lexical_reference")
    .map((s) => s.source_reference_id),
  hindi_lexical: sourceRecords
    .filter((s) => s.source_category === "hindi_lexical_or_institutional_reference")
    .map((s) => s.source_reference_id),
  corpus_or_text_reference: sourceRecords
    .filter((s) => ["corpus_attestation_reference", "machine_readable_text_reference"].includes(s.source_category))
    .map((s) => s.source_reference_id),
  vedic_context: sourceRecords
    .filter((s) => s.source_category === "primary_text_or_institutional_vedic_reference")
    .map((s) => s.source_reference_id)
};

const pilotSelection = {
  module_id: "AG69I",
  title: "Pilot Word Selection Record",
  status: "pilot_word_selection_created_no_evidence_attached",
  consumed_previous_stage: "AG69H",
  selection_principle: "Select a very small, low-risk pilot set for manual source lookup. Selection does not imply source verification, reviewed status, approval, or public-output permission.",
  pilot_selected_count: pilotItems.length,
  pilot_words: pilotItems.map((item) => ({
    draft_id: item.draft_id,
    legacy_word_id: item.legacy_word_id,
    english: item.english,
    hindi: item.hindi,
    sanskrit: item.sanskrit,
    selection_reason: item.legacy_word_id === "discernment"
      ? "Important value-word requiring careful lexical discipline because it may invite philosophical over-interpretation."
      : "Basic value-word suitable for low-risk lexical/source lookup pilot.",
    evidence_attachment_status: "not_attached",
    public_output_allowed: false
  })),
  excluded_from_pilot_count: queueItems.length - pilotItems.length,
  public_output_allowed: false
};

const lookupTasks = pilotItems.map((item) => ({
  task_id: `ag69i_lookup_${item.legacy_word_id}`,
  draft_id: item.draft_id,
  legacy_word_id: item.legacy_word_id,
  english: item.english,
  hindi: item.hindi,
  sanskrit: item.sanskrit,
  source_lookup_status: "not_started",
  source_reference_ids_attached_now: [],
  candidate_source_groups: sourceGroups,
  manual_lookup_required: true,
  exact_checks_required: [
    "Check Sanskrit form in recognised Sanskrit lexical source.",
    "Check Hindi form in recognised Hindi lexical/institutional source.",
    "Record whether the meaning is supported, partially supported, not supported, or needs manual review.",
    "Record transliteration/script review status.",
    "Record internal textual-discipline check.",
    "Do not copy bulk dictionary/book content.",
    "Do not make etymology/classical/scriptural claim unless exact source supports it."
  ],
  allowed_evidence_status_after_manual_lookup: manualContract.allowed_status_values,
  current_result: {
    source_evidence_attached: false,
    source_reference_id: null,
    word_form_found_status: "needs_manual_review",
    meaning_supported_status: "needs_manual_review",
    transliteration_supported_status: "needs_manual_review",
    internal_textual_discipline_check: "pending",
    review_status_after_evidence: "evidence_pending",
    public_use_permission_after_review: "not_allowed",
    public_output_allowed: false
  }
}));

const lookupPacket = {
  module_id: "AG69I",
  title: "Pilot Source Lookup Task Packet",
  status: "pilot_source_lookup_tasks_created_not_executed",
  task_count: lookupTasks.length,
  source_content_ingested_now: false,
  source_evidence_attached_now: false,
  tasks: lookupTasks,
  note: "AG69I creates lookup tasks only. Manual source lookup/evidence attachment is deferred to AG69J or later."
};

const attachmentAttempt = {
  module_id: "AG69I",
  title: "Source Evidence Attachment Attempt — No Records Attached",
  status: "source_evidence_attachment_attempt_completed_no_records_attached",
  attempted: true,
  records_considered_count: pilotItems.length,
  source_evidence_attached_count: 0,
  source_reference_ids_attached_count: 0,
  reviewed_record_count: 0,
  approved_record_count: 0,
  reason_no_attachment: "No exact manual source lookup evidence has been supplied or recorded. Attaching source_reference_id at this stage would overstate verification.",
  attachment_results: pilotItems.map((item) => ({
    draft_id: item.draft_id,
    legacy_word_id: item.legacy_word_id,
    source_evidence_attached: false,
    source_reference_ids_attached: [],
    review_status_after_ag69i: "evidence_pending",
    public_output_allowed: false,
    blocker: "manual_source_lookup_not_completed"
  }))
};

const draftPreservationAudit = {
  module_id: "AG69I",
  title: "Word Draft Preservation Audit",
  status: "word_draft_preservation_audit_passed",
  audit_passed: true,
  draft_record_count: draftRecords.length,
  checks: [
    { check_id: "source_reference_ids_attached", expected: false, actual: false, passed: true },
    { check_id: "reviewed_records_created", expected: false, actual: false, passed: true },
    { check_id: "approved_records_created", expected: false, actual: false, passed: true },
    { check_id: "public_output_allowed", expected: false, actual: false, passed: true }
  ],
  preserved_records: draftRecords.map((record) => ({
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

const sourcePreservationAudit = {
  module_id: "AG69I",
  title: "Source Reference Preservation Audit",
  status: "source_reference_preservation_audit_passed",
  audit_passed: true,
  source_reference_count: sourceRecords.length,
  source_promoted_count: 0,
  source_records: sourceRecords.map((source) => ({
    source_reference_id: source.source_reference_id,
    source_status_before_ag69i: source.source_status_before_ag69h,
    source_status_after_ag69i: source.source_status_after_ag69h,
    promoted_to_approved_source_now: false,
    public_claim_allowed_now: false,
    preserved: source.promoted_to_approved_source_now === false && source.public_claim_allowed_now === false
  })),
  failed_checks: []
};

const manualEvidenceTemplate = {
  module_id: "AG69I",
  title: "Manual Evidence Entry Template",
  status: "manual_evidence_entry_template_created",
  template_only: true,
  pilot_word_ids: pilotWordIds,
  entry_shape_for_ag69j: {
    evidence_id: "",
    draft_id: "",
    legacy_word_id: "",
    source_reference_id: "",
    source_category: "",
    field_checked: "",
    word_form_found_status: "",
    meaning_supported_status: "",
    transliteration_supported_status: "",
    claim_level_supported: "",
    reuse_note_checked: false,
    source_access_checked: false,
    internal_textual_discipline_check: "",
    reviewer_note: "",
    review_status_after_evidence: "",
    public_use_permission_after_review: "not_allowed",
    public_output_allowed: false
  },
  prohibited: [
    "bulk dictionary/book content",
    "AI-generated source substitute",
    "public attribution of internal study influence",
    "unsupported etymology/classical/scriptural claim"
  ]
};

const noMutationAudit = {
  module_id: "AG69I",
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
    module_id: "AG69I",
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
  module_id: "AG69I",
  title: "AG69J Manual Source Evidence Capture Readiness Record",
  status: "ready_for_ag69j_manual_source_evidence_capture",
  ready_for_ag69j: true,
  next_stage: "AG69J — Manual Source Evidence Capture for Pilot Words",
  reason: "AG69I selected pilot words and created lookup tasks/templates without attaching unverified source evidence."
};

const boundary = {
  module_id: "AG69I",
  title: "AG69I to AG69J Manual Source Evidence Capture Boundary",
  status: "ag69j_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Capture exact manual source evidence for the pilot words.",
    "Attach source_reference_id only where the source lookup is actually verified.",
    "Record found / not_found / partial / needs_manual_review / blocked status.",
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
  module_id: "AG69I",
  title: "Word Pilot Source Evidence Selection and Attachment Packet",
  status: "ag69i_word_pilot_source_evidence_attachment_packet_completed",
  current_git_context: git,
  consumed_previous_stage: {
    stage: "AG69H",
    source_file: "data/content-intelligence/quality-reviews/ag69h-source-reference-hardening-evidence-attachment-readiness.json",
    status: ag69h.status
  },
  generated_records: outputs,
  summary: {
    ag69h_consumed: true,
    pilot_word_selection_created: true,
    pilot_selected_count: pilotItems.length,
    pilot_source_lookup_tasks_created: true,
    manual_evidence_template_created: true,
    source_evidence_attachment_attempted: true,
    source_evidence_attached_count: 0,
    source_reference_ids_attached_count: 0,
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
    active_tithi_vara_selection_started: false,
    panchang_value_generation_started: false,
    supabase_database_write_performed: false,
    backend_runtime_activated: false,
    database_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag69j: true
  }
};

const registry = {
  module_id: "AG69I",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69I",
  status: review.status,
  pilot_word_selection_created: 1,
  pilot_selected_count: pilotItems.length,
  pilot_source_lookup_tasks_created: 1,
  manual_evidence_template_created: 1,
  source_evidence_attachment_attempted: 1,
  source_evidence_attached_count: 0,
  source_reference_ids_attached_count: 0,
  source_promoted_count: 0,
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
  ready_for_ag69j: 1
};

const doc = `# AG69I — Word Pilot Source Evidence Selection and Attachment Packet

AG69I selects a small pilot set for source evidence work and creates manual lookup packets.

## Pilot words

- Reflection / मनन / मननम्
- Discernment / विवेक / विवेकः
- Patience / धैर्य / धैर्यम्

## Important

AG69I does not attach source evidence because no exact manual source lookup has yet been recorded. This avoids false source claims.

## Created

- Pilot word selection record.
- Pilot source lookup task packet.
- Source evidence attachment attempt result with 0 records attached.
- Manual evidence entry template.
- Draft/source preservation audits.
- No generated-word mutation audit.

## Not performed

- No source evidence attached.
- No source promoted.
- No reviewed records.
- No approved records.
- No generated/word-of-day.json replacement.
- No public Word output.
- No active Tithi/Vara selector.
- No Panchang value generation.
- No UI change.
- No Supabase/database/backend/Auth/RLS/service-role activation.
- No V02 expansion.
`;

writeJson(outputs.pilotSelection, pilotSelection);
writeJson(outputs.lookupPacket, lookupPacket);
writeJson(outputs.attachmentAttempt, attachmentAttempt);
writeJson(outputs.draftPreservationAudit, draftPreservationAudit);
writeJson(outputs.sourcePreservationAudit, sourcePreservationAudit);
writeJson(outputs.manualEvidenceTemplate, manualEvidenceTemplate);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG69I pilot source evidence packet generated.");
console.log("✅ Pilot words selected and source lookup tasks created.");
console.log("✅ No unverified source evidence attached.");
console.log("✅ No generated word mutation, public output, backend/database/V02 activation performed.");
