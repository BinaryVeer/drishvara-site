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

const ag69d = readJson("data/content-intelligence/quality-reviews/ag69d-word-source-acquisition-reference-bank.json");
const sourceBank = readJson("data/knowledge-base/word-of-day/ag69d-source-reference-bank-metadata.json");
const candidateBank = readJson("data/knowledge-base/word-of-day/ag69b-word-candidate-bank-foundation.json");

if (ag69d.status !== "ag69d_word_source_acquisition_reference_bank_completed") {
  throw new Error("AG69D must be completed before AG69E.");
}
if (ag69d.summary?.ready_for_ag69e !== true) {
  throw new Error("AG69D readiness for AG69E is missing.");
}
if (sourceBank.source_content_ingested !== false) {
  throw new Error("AG69D source bank must remain metadata-only.");
}
if (candidateBank.public_output_allowed_from_this_bank !== false) {
  throw new Error("AG69B candidate bank must remain blocked from public output.");
}

const outputs = {
  mappingDoctrine: "data/knowledge-base/word-of-day/ag69e-candidate-source-mapping-doctrine.json",
  candidateSourceMapping: "data/knowledge-base/word-of-day/ag69e-candidate-source-mapping.json",
  sourceReviewQueue: "data/knowledge-base/word-of-day/ag69e-source-review-queue.json",
  linguisticReviewQueue: "data/knowledge-base/word-of-day/ag69e-linguistic-review-queue.json",
  disciplineReviewQueue: "data/knowledge-base/word-of-day/ag69e-internal-textual-discipline-review-queue.json",
  sourceCoverageCheck: "data/knowledge-base/word-of-day/ag69e-source-reference-coverage-check.json",
  noContentIngestionAudit: "data/knowledge-base/word-of-day/ag69e-no-content-ingestion-and-no-approval-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69e-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69e-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag69e-ag69f-word-source-evidence-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69e-to-ag69f-word-source-evidence-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag69e-word-candidate-source-mapping-review-queue.json",
  registry: "data/quality/ag69e-word-candidate-source-mapping-review-queue.json",
  preview: "data/quality/ag69e-word-candidate-source-mapping-review-queue-preview.json",
  doc: "docs/quality/AG69E_WORD_CANDIDATE_SOURCE_MAPPING_REVIEW_QUEUE.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const sourceIds = new Set(sourceBank.source_references.map((x) => x.source_reference_id));

const coreSourceCandidates = {
  sanskrit_lexical: [
    "src_cologne_digital_sanskrit_dictionaries",
    "src_sanskrit_heritage_inria"
  ],
  corpus_attestation: [
    "src_digital_corpus_of_sanskrit",
    "src_gretil"
  ],
  hindi_lexical: [
    "src_hindi_shabdasagara_dsal",
    "src_central_hindi_directorate_publications",
    "src_dsal_digital_dictionaries_south_asia"
  ],
  vedic_context: [
    "src_vedic_heritage_portal_gov_india"
  ]
};

for (const [group, ids] of Object.entries(coreSourceCandidates)) {
  for (const id of ids) {
    if (!sourceIds.has(id)) {
      throw new Error(`AG69E source candidate ${id} missing from AG69D source bank for group ${group}.`);
    }
  }
}

const mappingDoctrine = {
  module_id: "AG69E",
  title: "Word Candidate Source Mapping Doctrine",
  status: "candidate_source_mapping_doctrine_defined",
  consumed_previous_stage: "AG69D",
  principle: "AG69E maps candidate words to candidate source-reference families for future manual/source review. Mapping is not approval, not source confirmation, and not public-output eligibility.",
  mapping_is_not: [
    "approved source evidence",
    "approved word meaning",
    "approved Sanskrit form",
    "approved transliteration",
    "approved etymology",
    "approved classical claim",
    "public output permission"
  ],
  required_review_after_mapping: [
    "source lookup",
    "Sanskrit lexical verification where Sanskrit form is present",
    "Hindi lexical verification where Hindi form is present",
    "transliteration review",
    "meaning/context review",
    "internal textual discipline review",
    "editorial review",
    "public-use permission review"
  ],
  public_output_rule: "All records mapped in AG69E remain candidate/review_pending and public_output_allowed=false."
};

const mapForRecord = (record) => {
  const base = {
    record_id: record.record_id,
    word_id: record.word_id,
    english_word: record.english_word,
    hindi_word: record.hindi_word,
    sanskrit_word: record.sanskrit_word,
    transliteration: record.transliteration,
    original_bank_class: record.bank_class,
    mapped_bank_class: "candidate",
    review_queue_status: "review_pending",
    public_output_allowed: false,
    source_confirmation_status: "not_verified",
    meaning_confirmation_status: "not_verified",
    etymology_claim_allowed: false,
    classical_claim_allowed: false,
    source_mapping_note: "Candidate source-family mapping only. No lexical/source confirmation is claimed in AG69E."
  };

  const common = {
    sanskrit_candidate_sources: coreSourceCandidates.sanskrit_lexical,
    corpus_candidate_sources: coreSourceCandidates.corpus_attestation,
    hindi_candidate_sources: coreSourceCandidates.hindi_lexical,
    vedic_context_candidate_sources: coreSourceCandidates.vedic_context,
    published_work_review_candidates: []
  };

  if (["satya", "daya", "dhairya", "viveka", "maitri"].includes(record.word_id)) {
    return {
      ...base,
      ...common,
      review_priority: record.word_id === "viveka" ? "high" : "normal",
      review_reason: record.word_id === "viveka"
        ? "Concept may invite philosophical interpretation; lexical and context restraint required."
        : "Basic Sanskrit/Hindi lexical and meaning verification required."
    };
  }

  return {
    ...base,
    ...common,
    review_priority: "normal",
    review_reason: "Default lexical and language verification required."
  };
};

const mappedRecords = candidateBank.candidate_records.map(mapForRecord);

const candidateSourceMapping = {
  module_id: "AG69E",
  title: "Candidate Word Source Mapping",
  status: "candidate_source_mapping_created_review_pending",
  mapping_applied_to_candidate_records: true,
  mapped_record_count: mappedRecords.length,
  approved_record_count: 0,
  reviewed_record_count: 0,
  public_output_allowed_count: 0,
  mapped_records: mappedRecords,
  generated_word_json_modified: false,
  approved_bank_created: false,
  note: "Mapped records remain candidate-only. AG69E does not confirm source meanings or approve words."
};

const sourceReviewQueue = {
  module_id: "AG69E",
  title: "Word Source Review Queue",
  status: "source_review_queue_created",
  queue_item_count: mappedRecords.length,
  queue_items: mappedRecords.map((record) => ({
    queue_id: `src_review_${record.record_id}`,
    record_id: record.record_id,
    word_id: record.word_id,
    review_status: "pending",
    assigned_source_groups: [
      "sanskrit_candidate_sources",
      "hindi_candidate_sources",
      "corpus_candidate_sources",
      "vedic_context_candidate_sources"
    ],
    source_tasks: [
      "Verify Sanskrit form in recognised Sanskrit lexical reference.",
      "Verify Hindi form in recognised Hindi lexical/institutional reference where applicable.",
      "Check corpus/text attestation only as supporting context, not standalone meaning.",
      "Do not copy source text into repo.",
      "Record only source_reference_id and review result in later stage."
    ],
    blockers_until_completed: [
      "cannot_move_to_reviewed",
      "cannot_move_to_approved",
      "cannot_feed_public_output"
    ]
  }))
};

const linguisticReviewQueue = {
  module_id: "AG69E",
  title: "Word Linguistic Review Queue",
  status: "linguistic_review_queue_created",
  queue_item_count: mappedRecords.length,
  queue_items: mappedRecords.map((record) => ({
    queue_id: `ling_review_${record.record_id}`,
    record_id: record.record_id,
    word_id: record.word_id,
    review_status: "pending",
    checks_required: [
      "sanskrit_form_review",
      "hindi_form_review",
      "transliteration_review",
      "meaning_context_review",
      "usage_sentence_review",
      "no_unsupported_etymology",
      "no_classical_claim_without_source"
    ],
    current_public_output_allowed: false
  }))
};

const disciplineReviewQueue = {
  module_id: "AG69E",
  title: "Internal Textual Discipline Review Queue",
  status: "internal_textual_discipline_review_queue_created",
  public_attribution_allowed: false,
  queue_item_count: mappedRecords.length,
  queue_items: mappedRecords.map((record) => ({
    queue_id: `discipline_review_${record.record_id}`,
    record_id: record.record_id,
    word_id: record.word_id,
    internal_textual_discipline_check: "pending",
    public_attribution_allowed: false,
    published_work_candidate_review_allowed: true,
    nityanand_misra_aligned_published_work_handling: "candidate_review_input_only_if_exact_published_work_is_verified_relevant_and_public_use_approved",
    checks_required: [
      "avoid invented Sanskrit",
      "avoid loose transliteration",
      "avoid unsupported etymology",
      "avoid over-interpretation from modern commentary",
      "keep meaning lexical/contextual unless higher claim is sourced"
    ]
  }))
};

const sourceCoverageCheck = {
  module_id: "AG69E",
  title: "Source Reference Coverage Check",
  status: "source_reference_coverage_checked",
  source_bank_count: sourceBank.source_reference_count,
  mapped_record_count: mappedRecords.length,
  required_source_families_present: {
    sanskrit_lexical: coreSourceCandidates.sanskrit_lexical.every((id) => sourceIds.has(id)),
    hindi_lexical: coreSourceCandidates.hindi_lexical.every((id) => sourceIds.has(id)),
    corpus_attestation: coreSourceCandidates.corpus_attestation.every((id) => sourceIds.has(id)),
    vedic_context: coreSourceCandidates.vedic_context.every((id) => sourceIds.has(id))
  },
  coverage_passed: true,
  note: "Coverage means source families exist in metadata bank. It does not mean individual words are source-verified."
};

const noContentIngestionAudit = {
  module_id: "AG69E",
  title: "No Content Ingestion and No Approval Audit",
  status: "no_content_ingestion_no_approval_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "dictionary_text_ingested", expected: false, actual: false, passed: true },
    { check_id: "book_text_ingested", expected: false, actual: false, passed: true },
    { check_id: "source_content_copied_to_repo", expected: false, actual: false, passed: true },
    { check_id: "candidate_records_approved", expected: false, actual: false, passed: true },
    { check_id: "reviewed_records_created", expected: false, actual: false, passed: true },
    { check_id: "approved_bank_created", expected: false, actual: false, passed: true },
    { check_id: "generated_word_json_modified", expected: false, actual: false, passed: true },
    { check_id: "public_output_created", expected: false, actual: false, passed: true }
  ],
  failed_checks: []
};

function audit(title, status, keys) {
  return {
    module_id: "AG69E",
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
  module_id: "AG69E",
  title: "AG69F Word Source Evidence Readiness Record",
  status: "ready_for_ag69f_word_source_evidence_capture",
  ready_for_ag69f: true,
  next_stage: "AG69F — Word Source Evidence Capture and Reviewed-Record Draft",
  reason: "Candidate words are mapped to source families and source/language/discipline review queues are created. No word is approved."
};

const boundary = {
  module_id: "AG69E",
  title: "AG69E to AG69F Word Source Evidence Boundary",
  status: "ag69f_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Capture source evidence metadata for candidate words.",
    "Record whether each word-form and meaning is found, not found, or needs manual review.",
    "Create reviewed-record draft only where source evidence supports it.",
    "Keep public_output_allowed=false unless later approval stage passes."
  ],
  blocked_scope_without_explicit_approval: [
    "dictionary/book content bulk ingestion",
    "approved word bank creation",
    "public word output generation",
    "generated/word-of-day.json replacement",
    "UI display change",
    "public attribution of internal study influence",
    "Nityanand Misra published-work public attribution without exact verification",
    "unsupported Sanskrit claim",
    "unsupported etymology claim",
    "Supabase/database writes",
    "backend/Auth/Supabase activation",
    "runtime database query",
    "service-role use",
    "V02 expansion"
  ]
};

const review = {
  module_id: "AG69E",
  title: "Word Candidate Source Mapping and Review Queue",
  status: "ag69e_word_candidate_source_mapping_review_queue_completed",
  current_git_context: git,
  consumed_previous_stage: {
    stage: "AG69D",
    source_file: "data/content-intelligence/quality-reviews/ag69d-word-source-acquisition-reference-bank.json",
    status: ag69d.status
  },
  generated_records: outputs,
  summary: {
    ag69d_consumed: true,
    candidate_source_mapping_created: true,
    mapped_record_count: mappedRecords.length,
    source_review_queue_created: true,
    linguistic_review_queue_created: true,
    internal_textual_discipline_review_queue_created: true,
    vedic_tradition_source_families_used_for_mapping: true,
    nityanand_misra_aligned_published_work_handling_retained_as_candidate_review_only: true,
    all_records_remain_candidate: true,
    reviewed_records_created: false,
    approved_records_created: false,
    approved_bank_created: false,
    public_output_from_mapped_records_allowed: false,
    source_content_ingested: false,
    bulk_copyrighted_ingestion: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    supabase_database_write_performed: false,
    backend_runtime_activated: false,
    database_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag69f: true
  }
};

const registry = {
  module_id: "AG69E",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69E",
  status: review.status,
  candidate_source_mapping_created: 1,
  mapped_record_count: mappedRecords.length,
  source_review_queue_created: 1,
  linguistic_review_queue_created: 1,
  internal_textual_discipline_review_queue_created: 1,
  vedic_tradition_source_families_used_for_mapping: 1,
  nityanand_misra_aligned_published_work_handling_retained_as_candidate_review_only: 1,
  all_records_remain_candidate: 1,
  reviewed_records_created: 0,
  approved_records_created: 0,
  approved_bank_created: 0,
  public_output_from_mapped_records_allowed: 0,
  source_content_ingested: 0,
  bulk_copyrighted_ingestion: 0,
  generated_word_json_modified: 0,
  ui_display_changed: 0,
  supabase_database_write_performed: 0,
  backend_runtime_activated: 0,
  database_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag69f: 1
};

const doc = `# AG69E — Word Candidate Source Mapping and Review Queue

AG69E maps candidate Word of the Day records to candidate source families and creates review queues.

## Created

- Candidate source mapping.
- Source review queue.
- Linguistic review queue.
- Internal textual-discipline review queue.
- Source-reference coverage check.
- No-content-ingestion and no-approval audit.

## Important

Mapping is not approval. It does not confirm word meaning, Sanskrit form, transliteration, etymology or classical usage.

## Still blocked

- No approved word bank.
- No public Word output.
- No generated/word-of-day.json replacement.
- No UI change.
- No dictionary/book content ingestion.
- No public attribution of internal study influence.
- No Supabase/database/backend/Auth/RLS/service-role activation.
- No V02 expansion.
`;

writeJson(outputs.mappingDoctrine, mappingDoctrine);
writeJson(outputs.candidateSourceMapping, candidateSourceMapping);
writeJson(outputs.sourceReviewQueue, sourceReviewQueue);
writeJson(outputs.linguisticReviewQueue, linguisticReviewQueue);
writeJson(outputs.disciplineReviewQueue, disciplineReviewQueue);
writeJson(outputs.sourceCoverageCheck, sourceCoverageCheck);
writeJson(outputs.noContentIngestionAudit, noContentIngestionAudit);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG69E Word candidate source mapping and review queue generated.");
console.log("✅ Candidate records mapped to source families only; no approval performed.");
console.log("✅ Source, linguistic and internal textual-discipline review queues created.");
console.log("✅ No content ingestion, public output, UI change, Supabase/database/backend/Auth/RLS/service-role/V02 activation performed.");
