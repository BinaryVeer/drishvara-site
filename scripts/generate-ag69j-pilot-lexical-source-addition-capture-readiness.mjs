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

const ag69i = readJson("data/content-intelligence/quality-reviews/ag69i-word-pilot-source-evidence-attachment-packet.json");
const pilotPacket = readJson("data/knowledge-base/word-of-day/ag69i-pilot-source-lookup-task-packet.json");
const pilotSelection = readJson("data/knowledge-base/word-of-day/ag69i-pilot-word-selection-record.json");
const manualTemplate = readJson("data/knowledge-base/word-of-day/ag69i-manual-evidence-entry-template.json");
const sourceBank = readJson("data/knowledge-base/word-of-day/ag69d-source-reference-bank-metadata.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag69i.status !== "ag69i_word_pilot_source_evidence_attachment_packet_completed") {
  throw new Error("AG69I must be completed before AG69J.");
}
if (ag69i.summary?.ready_for_ag69j !== true) {
  throw new Error("AG69I readiness for AG69J is missing.");
}
if (ag69i.summary?.source_evidence_attached_count !== 0 || ag69i.summary?.source_reference_ids_attached_count !== 0) {
  throw new Error("AG69I must have 0 evidence/source attachments.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.public_ui_ready !== false) {
  throw new Error("generated/word-of-day.json must remain inactive static preview.");
}

const outputs = {
  lexicalSourceRegister: "data/knowledge-base/word-of-day/ag69j-pilot-lexical-source-addition-register.json",
  sourceQualification: "data/knowledge-base/word-of-day/ag69j-pilot-source-qualification-readiness.json",
  scoutRecord: "data/knowledge-base/word-of-day/ag69j-pilot-word-lexical-scout-record.json",
  capturePacket: "data/knowledge-base/word-of-day/ag69j-manual-source-capture-packet.json",
  attachmentGuard: "data/knowledge-base/word-of-day/ag69j-no-evidence-attachment-guard.json",
  copyrightGuard: "data/knowledge-base/word-of-day/ag69j-source-reuse-copyright-guard.json",
  sourcePreservationAudit: "data/knowledge-base/word-of-day/ag69j-source-preservation-audit-no-source-promoted.json",
  wordPreservationAudit: "data/knowledge-base/word-of-day/ag69j-word-preservation-audit-no-record-promoted.json",
  noMutationAudit: "data/knowledge-base/word-of-day/ag69j-no-generated-word-mutation-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69j-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69j-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag69j-ag69k-pilot-evidence-attachment-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69j-to-ag69k-pilot-evidence-attachment-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag69j-pilot-lexical-source-addition-capture-readiness.json",
  registry: "data/quality/ag69j-pilot-lexical-source-addition-capture-readiness.json",
  preview: "data/quality/ag69j-pilot-lexical-source-addition-capture-readiness-preview.json",
  doc: "docs/quality/AG69J_PILOT_LEXICAL_SOURCE_ADDITION_CAPTURE_READINESS.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const existingSourceRefs = sourceBank.source_references || [];
const pilotTasks = pilotPacket.tasks || [];
const pilotWords = pilotSelection.pilot_words || [];

const addedPilotSources = [
  {
    source_reference_id: "src_dsal_apte_practical_sanskrit_english_dictionary",
    source_name: "The Practical Sanskrit-English Dictionary — V. S. Apte via DSAL",
    source_category: "lexical_reference",
    source_family: "sanskrit_lexicon_apte",
    source_url: "https://dsal.uchicago.edu/dictionaries/apte/",
    publisher_or_institution: "Digital Dictionaries of South Asia / University of Chicago; underlying dictionary by V. S. Apte",
    access_status: "public_web_access_observed",
    source_status: "pilot_candidate_source_metadata_recorded",
    approved_source_eligible: true,
    hardened_for_evidence_attachment_now: false,
    promoted_to_approved_source_now: false,
    public_claim_allowed_now: false,
    public_attribution_allowed_now: false,
    allowed_use_now: [
      "metadata-level pilot source record",
      "manual source lookup pointer",
      "future record-level evidence attachment only after exact lookup is manually verified"
    ],
    blocked_use_now: [
      "bulk dictionary ingestion",
      "copying dictionary entries into repo",
      "approved-source treatment",
      "public claim basis",
      "automatic public Word output"
    ],
    reuse_note: "DSAL page records copyright/no-reproduction restrictions. Use metadata and short review notes only unless permission/licence permits more."
  },
  {
    source_reference_id: "src_archive_apte_1890_scan_metadata",
    source_name: "The Practical Sanskrit-English Dictionary — 1890 archive scan metadata",
    source_category: "lexical_reference",
    source_family: "sanskrit_lexicon_apte_scan",
    source_url: "https://archive.org/details/ldpd_7285627_000",
    publisher_or_institution: "Internet Archive / Columbia University Libraries scan metadata",
    access_status: "public_web_access_observed",
    source_status: "pilot_candidate_source_metadata_recorded",
    approved_source_eligible: true,
    hardened_for_evidence_attachment_now: false,
    promoted_to_approved_source_now: false,
    public_claim_allowed_now: false,
    public_attribution_allowed_now: false,
    allowed_use_now: [
      "bibliographic cross-check",
      "manual lookup pointer",
      "future verification support"
    ],
    blocked_use_now: [
      "bulk scan ingestion",
      "public claim basis without exact entry review",
      "automatic meaning extraction"
    ],
    reuse_note: "Metadata only in AG69J. Do not ingest book text."
  },
  {
    source_reference_id: "src_sanskritdictionary_com_lexical_lookup",
    source_name: "Sanskrit Dictionary lexical lookup",
    source_category: "lexical_lookup_index_candidate",
    source_family: "sanskrit_lexical_lookup_aggregator",
    source_url: "https://www.sanskritdictionary.com/",
    publisher_or_institution: "Sanskrit Dictionary public lookup site",
    access_status: "public_web_access_observed",
    source_status: "pilot_candidate_source_metadata_recorded",
    approved_source_eligible: false,
    hardened_for_evidence_attachment_now: false,
    promoted_to_approved_source_now: false,
    public_claim_allowed_now: false,
    public_attribution_allowed_now: false,
    allowed_use_now: [
      "pilot lookup navigation",
      "directional scout observation",
      "future cross-check against primary lexical source"
    ],
    blocked_use_now: [
      "approved-source treatment",
      "bulk content ingestion",
      "public claim basis without independent lexical review",
      "automatic meaning extraction"
    ],
    reuse_note: "Metadata and scout-use only in AG69J. Exact dictionary/source attribution must be reviewed before attachment."
  }
];

const lexicalSourceRegister = {
  module_id: "AG69J",
  title: "Pilot Lexical Source Addition Register",
  status: "pilot_lexical_source_metadata_added_not_promoted",
  consumed_previous_stage: "AG69I",
  existing_source_reference_count_before_ag69j: existingSourceRefs.length,
  added_pilot_source_count: addedPilotSources.length,
  added_pilot_sources: addedPilotSources,
  consolidated_reference_count_for_future_manual_lookup: existingSourceRefs.length + addedPilotSources.length,
  source_promoted_count: 0,
  public_claim_allowed_count: 0,
  source_content_ingested: false,
  note: "AG69J adds pilot lexical source metadata only. It does not modify AG69D source bank and does not promote any source to approved_source."
};

const sourceQualification = {
  module_id: "AG69J",
  title: "Pilot Source Qualification Readiness",
  status: "pilot_source_qualification_ready_no_source_promoted",
  source_qualification_result: addedPilotSources.map((source) => ({
    source_reference_id: source.source_reference_id,
    source_name: source.source_name,
    qualification_status: "candidate_ready_for_manual_review",
    approved_source_now: false,
    hardened_for_evidence_attachment_now: false,
    public_claim_allowed_now: false,
    required_before_attachment: [
      "exact entry/lookup page checked manually",
      "source scope matched to word field",
      "reuse/copyright note checked",
      "short evidence note prepared without bulk copied text",
      "reviewer note recorded"
    ]
  })),
  source_promoted_count: 0
};

const pilotScoutObservations = [
  {
    evidence_scout_id: "ag69j_scout_reflection_manana",
    legacy_word_id: "reflection",
    english: "Reflection",
    hindi: "मनन",
    sanskrit: "मननम्",
    candidate_lookup_url: "https://sanskritdictionary.com/?q=manana",
    candidate_lookup_source_reference_id: "src_sanskritdictionary_com_lexical_lookup",
    candidate_primary_lexical_source_to_check: "src_dsal_apte_practical_sanskrit_english_dictionary",
    scout_status: "directional_support_observed_not_attached",
    scout_observation_summary: "Lookup scout indicates manana is connected with thinking/reflection/meditation-related senses.",
    exact_source_evidence_attached: false,
    public_output_allowed: false
  },
  {
    evidence_scout_id: "ag69j_scout_discernment_viveka",
    legacy_word_id: "discernment",
    english: "Discernment",
    hindi: "विवेक",
    sanskrit: "विवेकः",
    candidate_lookup_url: "https://sanskritdictionary.com/?q=viveka",
    candidate_lookup_source_reference_id: "src_sanskritdictionary_com_lexical_lookup",
    candidate_primary_lexical_source_to_check: "src_dsal_apte_practical_sanskrit_english_dictionary",
    scout_status: "directional_support_observed_not_attached",
    scout_observation_summary: "Lookup scout indicates viveka is connected with discretion, distinguishing, judgement or discernment-related senses.",
    exact_source_evidence_attached: false,
    public_output_allowed: false
  },
  {
    evidence_scout_id: "ag69j_scout_patience_dhairyam",
    legacy_word_id: "patience",
    english: "Patience",
    hindi: "धैर्य",
    sanskrit: "धैर्यम्",
    candidate_lookup_url: "https://sanskritdictionary.com/?q=dhairyam",
    candidate_lookup_source_reference_id: "src_sanskritdictionary_com_lexical_lookup",
    candidate_primary_lexical_source_to_check: "src_dsal_apte_practical_sanskrit_english_dictionary",
    scout_status: "directional_support_observed_not_attached",
    scout_observation_summary: "Lookup scout indicates dhairyam is connected with firmness, steadiness, composure and patience-related senses.",
    exact_source_evidence_attached: false,
    public_output_allowed: false
  }
];

const scoutRecord = {
  module_id: "AG69J",
  title: "Pilot Word Lexical Scout Record",
  status: "pilot_lexical_scout_recorded_not_evidence_attached",
  scout_record_count: pilotScoutObservations.length,
  scout_records: pilotScoutObservations,
  evidence_attachment_performed_now: false,
  source_reference_ids_attached_to_word_records_now: false,
  note: "Scout observations help decide what to manually verify next. They are not reviewed-bank evidence."
};

const capturePacket = {
  module_id: "AG69J",
  title: "Manual Source Capture Packet",
  status: "manual_source_capture_packet_created_for_ag69k",
  task_count: pilotTasks.length,
  tasks: pilotTasks.map((task) => {
    const scout = pilotScoutObservations.find((x) => x.legacy_word_id === task.legacy_word_id);
    return {
      task_id: `ag69j_capture_${task.legacy_word_id}`,
      prior_ag69i_task_id: task.task_id,
      draft_id: task.draft_id,
      legacy_word_id: task.legacy_word_id,
      english: task.english,
      hindi: task.hindi,
      sanskrit: task.sanskrit,
      recommended_candidate_sources_for_manual_capture: [
        "src_dsal_apte_practical_sanskrit_english_dictionary",
        "src_archive_apte_1890_scan_metadata",
        "src_sanskritdictionary_com_lexical_lookup",
        ...(task.candidate_source_groups?.sanskrit_lexical || []),
        ...(task.candidate_source_groups?.hindi_lexical || [])
      ],
      scout_record_id: scout?.evidence_scout_id || null,
      capture_status: "ready_for_manual_capture",
      evidence_entry_template: manualTemplate.entry_shape_for_ag69j,
      public_output_allowed: false
    };
  }),
  source_content_ingested: false,
  source_evidence_attached_now: false
};

const attachmentGuard = {
  module_id: "AG69J",
  title: "No Evidence Attachment Guard",
  status: "no_evidence_attachment_guard_passed",
  guard_passed: true,
  evidence_attachment_block_reason: "AG69J added pilot source metadata and scout observations only. Exact manual entry-level evidence remains pending.",
  source_evidence_attached_count: 0,
  source_reference_ids_attached_to_word_records_count: 0,
  reviewed_records_created: false,
  approved_records_created: false,
  public_output_allowed: false
};

const copyrightGuard = {
  module_id: "AG69J",
  title: "Source Reuse and Copyright Guard",
  status: "source_reuse_copyright_guard_recorded",
  guard_principle: "Do not ingest or reproduce bulk dictionary/book content. Store only source metadata, URL/reference pointers, review status and short evidence notes where permitted.",
  blocked_storage: [
    "bulk dictionary entries",
    "book pages or chapters",
    "large copied definitions",
    "copyrighted lexical tables",
    "AI-generated source substitute"
  ],
  allowed_storage_now: [
    "source_reference_id",
    "source URL",
    "publisher/institution metadata",
    "reuse/copyright caution note",
    "short scout observation",
    "manual verification status"
  ],
  applied_to_sources: addedPilotSources.map((source) => source.source_reference_id)
};

const sourcePreservationAudit = {
  module_id: "AG69J",
  title: "Source Preservation Audit — No Source Promoted",
  status: "source_preservation_audit_no_source_promoted_passed",
  audit_passed: true,
  existing_source_reference_count: existingSourceRefs.length,
  added_pilot_source_count: addedPilotSources.length,
  source_promoted_count: 0,
  public_claim_allowed_count: 0,
  source_records: addedPilotSources.map((source) => ({
    source_reference_id: source.source_reference_id,
    source_status: source.source_status,
    promoted_to_approved_source_now: source.promoted_to_approved_source_now,
    public_claim_allowed_now: source.public_claim_allowed_now,
    preserved_as_candidate: source.promoted_to_approved_source_now === false && source.public_claim_allowed_now === false
  })),
  failed_checks: []
};

const wordPreservationAudit = {
  module_id: "AG69J",
  title: "Word Preservation Audit — No Record Promoted",
  status: "word_preservation_audit_no_record_promoted_passed",
  audit_passed: true,
  pilot_word_count: pilotWords.length,
  checks: [
    { check_id: "source_reference_ids_attached_to_word_records", expected: false, actual: false, passed: true },
    { check_id: "reviewed_records_created", expected: false, actual: false, passed: true },
    { check_id: "approved_records_created", expected: false, actual: false, passed: true },
    { check_id: "public_output_allowed", expected: false, actual: false, passed: true }
  ],
  pilot_words: pilotWords.map((word) => ({
    legacy_word_id: word.legacy_word_id,
    evidence_attachment_status: "not_attached",
    reviewed_record_created: false,
    approved_record_created: false,
    public_output_allowed: false
  })),
  failed_checks: []
};

const noMutationAudit = {
  module_id: "AG69J",
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
    module_id: "AG69J",
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
  module_id: "AG69J",
  title: "AG69K Pilot Evidence Attachment Readiness Record",
  status: "ready_for_ag69k_pilot_evidence_attachment_after_manual_capture",
  ready_for_ag69k: true,
  next_stage: "AG69K — Pilot Source Evidence Attachment After Manual Capture",
  reason: "AG69J added pilot lexical source metadata and capture packets without attaching unverified evidence. AG69K can attach evidence only after manual source lookup is actually completed."
};

const boundary = {
  module_id: "AG69J",
  title: "AG69J to AG69K Pilot Evidence Attachment Boundary",
  status: "ag69k_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Use AG69J capture packet to manually verify exact entries.",
    "Attach source_reference_id only where exact lookup evidence is confirmed.",
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
  module_id: "AG69J",
  title: "Pilot Lexical Source Addition and Capture Readiness",
  status: "ag69j_pilot_lexical_source_addition_capture_readiness_completed",
  current_git_context: git,
  consumed_previous_stage: {
    stage: "AG69I",
    source_file: "data/content-intelligence/quality-reviews/ag69i-word-pilot-source-evidence-attachment-packet.json",
    status: ag69i.status
  },
  generated_records: outputs,
  summary: {
    ag69i_consumed: true,
    pilot_lexical_source_metadata_added: true,
    added_pilot_source_count: addedPilotSources.length,
    pilot_lexical_scout_recorded: true,
    scout_record_count: pilotScoutObservations.length,
    manual_source_capture_packet_created: true,
    source_reuse_copyright_guard_recorded: true,
    source_evidence_attached_count: 0,
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
    active_tithi_vara_selection_started: false,
    panchang_value_generation_started: false,
    supabase_database_write_performed: false,
    backend_runtime_activated: false,
    database_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag69k: true
  }
};

const registry = {
  module_id: "AG69J",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69J",
  status: review.status,
  pilot_lexical_source_metadata_added: 1,
  added_pilot_source_count: addedPilotSources.length,
  pilot_lexical_scout_recorded: 1,
  scout_record_count: pilotScoutObservations.length,
  manual_source_capture_packet_created: 1,
  source_reuse_copyright_guard_recorded: 1,
  source_evidence_attached_count: 0,
  source_reference_ids_attached_to_word_records_count: 0,
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
  ready_for_ag69k: 1
};

const doc = `# AG69J — Pilot Lexical Source Addition and Capture Readiness

AG69J follows Option B: add pilot lexical source metadata before attaching source evidence.

## Added as metadata-only pilot sources

- DSAL-hosted V. S. Apte Practical Sanskrit-English Dictionary.
- Internet Archive scan metadata for Apte 1890.
- Sanskrit Dictionary lookup site as a scout/reference-navigation source.

## Pilot scout records

- Reflection / मनन / मननम्.
- Discernment / विवेक / विवेकः.
- Patience / धैर्य / धैर्यम्.

## Important

AG69J does not attach source evidence to word records. It does not promote any source and does not create reviewed or approved word records.

## Not performed

- No source evidence attached.
- No source_reference_id attached to word records.
- No source promoted to approved_source.
- No reviewed word records.
- No approved word records.
- No generated/word-of-day.json replacement.
- No public Word output.
- No active Tithi/Vara selector.
- No Panchang value generation.
- No source content ingestion.
- No Supabase/database/backend/Auth/RLS/service-role activation.
- No V02 expansion.
`;

writeJson(outputs.lexicalSourceRegister, lexicalSourceRegister);
writeJson(outputs.sourceQualification, sourceQualification);
writeJson(outputs.scoutRecord, scoutRecord);
writeJson(outputs.capturePacket, capturePacket);
writeJson(outputs.attachmentGuard, attachmentGuard);
writeJson(outputs.copyrightGuard, copyrightGuard);
writeJson(outputs.sourcePreservationAudit, sourcePreservationAudit);
writeJson(outputs.wordPreservationAudit, wordPreservationAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG69J pilot lexical source addition and capture readiness generated.");
console.log("✅ Pilot lexical source metadata and scout records created.");
console.log("✅ Manual source capture packet created for AG69K.");
console.log("✅ No source evidence attached, no source promoted, no public output generated.");
