import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
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

const ag70d = readJson("data/content-intelligence/quality-reviews/ag70d-word-methodology-supersession.json");
const methodologyV2 = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-word-of-the-day-methodology-v2.json");
const lexicalManifest = readJson("data/knowledge-base/word-of-day/production/lexical-engine/lexical-engine-manifest.json");
const wordManifest = readJson("data/knowledge-base/word-of-day/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70d.status !== "ag70d_word_methodology_supersession_completed") {
  throw new Error("AG70D must be complete before AG70E.");
}
if (ag70d.summary?.ready_for_ag70e !== true) {
  throw new Error("AG70D readiness for AG70E is missing.");
}
if (methodologyV2.active_methodology_version !== "word_of_day_method_v2_panchang_context_sanskrit_lexical_engine") {
  throw new Error("Word Methodology v2 must be active intended methodology.");
}
if (lexicalManifest.status !== "sanskrit_lexical_engine_manifest_created_no_runtime_activation") {
  throw new Error("Lexical engine manifest must exist before AG70E.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  foundationManifest: "data/knowledge-base/word-of-day/production/knowledge-bank/ag70e-word-production-knowledge-bank-foundation-manifest.json",
  contextInterpretationBank: "data/knowledge-base/word-of-day/production/knowledge-bank/context-interpretation-bank.json",
  contextSignalTaxonomy: "data/knowledge-base/word-of-day/production/knowledge-bank/context-signal-taxonomy.json",
  morphologyBank: "data/knowledge-base/word-of-day/production/knowledge-bank/morphology-production-bank.json",
  etymologyBank: "data/knowledge-base/word-of-day/production/knowledge-bank/etymology-production-bank.json",
  semanticsBank: "data/knowledge-base/word-of-day/production/knowledge-bank/semantics-production-bank.json",
  sacredFallbackBank: "data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-production-bank.json",
  lexicalSourceEvidenceMap: "data/knowledge-base/word-of-day/production/knowledge-bank/lexical-source-evidence-map.json",
  approvedOutputCandidateBank: "data/knowledge-base/word-of-day/production/knowledge-bank/approved-output-candidate-bank.json",
  dailyWordHistoryBank: "data/knowledge-base/word-of-day/production/knowledge-bank/daily-word-history-bank.json",
  duplicateControlHistoryBank: "data/knowledge-base/word-of-day/production/knowledge-bank/duplicate-control-history-bank.json",
  outputRecordContract: "data/knowledge-base/word-of-day/production/knowledge-bank/word-output-record-contract.json",
  wordManifest: "data/knowledge-base/word-of-day/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70e-word-production-knowledge-bank-foundation.json",
  readiness: "data/content-intelligence/quality-registry/ag70e-ag70f-sanskrit-lexical-source-reference-bank-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70e-to-ag70f-sanskrit-lexical-source-reference-bank-boundary.json",
  quality: "data/quality/ag70e-word-production-knowledge-bank-foundation.json",
  preview: "data/quality/ag70e-word-production-knowledge-bank-foundation-preview.json",
  doc: "docs/quality/AG70E_WORD_PRODUCTION_KNOWLEDGE_BANK_FOUNDATION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const foundationManifest = {
  module_id: "AG70E",
  title: "Word Production Knowledge Bank Foundation Manifest",
  status: "word_production_knowledge_bank_foundation_created_empty_banks",
  purpose: "Create empty governed production-bank containers required by Word Methodology v2 before any Sanskrit lexical/source records are added.",
  runtime_active_now: false,
  public_output_allowed_now: false,
  production_record_creation_now: false,
  banks: {
    context_interpretation_bank: outputs.contextInterpretationBank,
    context_signal_taxonomy: outputs.contextSignalTaxonomy,
    morphology_bank: outputs.morphologyBank,
    etymology_bank: outputs.etymologyBank,
    semantics_bank: outputs.semanticsBank,
    sacred_fallback_bank: outputs.sacredFallbackBank,
    lexical_source_evidence_map: outputs.lexicalSourceEvidenceMap,
    approved_output_candidate_bank: outputs.approvedOutputCandidateBank,
    daily_word_history_bank: outputs.dailyWordHistoryBank,
    duplicate_control_history_bank: outputs.duplicateControlHistoryBank,
    output_record_contract: outputs.outputRecordContract
  },
  current_counts: {
    context_interpretation_records: 0,
    morphology_records: 0,
    etymology_records: 0,
    semantics_records: 0,
    sacred_fallback_records: 0,
    source_evidence_records: 0,
    approved_output_candidates: 0,
    daily_word_history_records: 0,
    duplicate_control_records: 0
  },
  next_required_stage: "AG70F — Sanskrit Lexical Source Reference Bank Batch 01"
};

const contextInterpretationBank = {
  module_id: "AG70E",
  title: "Context Interpretation Bank",
  status: "context_interpretation_bank_created_empty",
  purpose: "Store reviewed Panchang-context interpretation records before they are passed to Sanskrit lexical engines.",
  required_fields: [
    "context_signal_id",
    "date_context_type",
    "tithi_context_key",
    "nakshatra_context_key",
    "yoga_context_key",
    "paksha_context_key",
    "vara_context_key",
    "festival_context_key",
    "combined_interpretive_signal",
    "semantic_direction",
    "confidence_status",
    "source_reference_ids",
    "review_status",
    "approved_for_lexical_engine"
  ],
  records: []
};

const contextSignalTaxonomy = {
  module_id: "AG70E",
  title: "Context Signal Taxonomy",
  status: "context_signal_taxonomy_created_empty",
  purpose: "Define the governed signal vocabulary used between Panchang interpretation and lexical engines.",
  required_fields: [
    "signal_id",
    "signal_label",
    "signal_family",
    "allowed_panchang_sources",
    "allowed_downstream_engine",
    "review_status",
    "approved_for_use"
  ],
  signal_families_planned: [
    "clarity",
    "discipline",
    "restraint",
    "devotion",
    "renewal",
    "steadiness",
    "learning",
    "reflection",
    "protection",
    "balance"
  ],
  records: []
};

const morphologyBank = {
  module_id: "AG70E",
  title: "Morphology Production Bank",
  status: "morphology_production_bank_created_empty",
  purpose: "Hold sourced Sanskrit form/root/stem records eligible for morphology engine processing.",
  schema_source: "data/knowledge-base/word-of-day/production/lexical-engine/morphology-engine-schema.json",
  records: []
};

const etymologyBank = {
  module_id: "AG70E",
  title: "Etymology Production Bank",
  status: "etymology_production_bank_created_empty",
  purpose: "Hold sourced derivational/historical notes only where established or bounded as partially established.",
  schema_source: "data/knowledge-base/word-of-day/production/lexical-engine/etymology-engine-schema.json",
  hard_rule: "If etymology is not established, do not fabricate.",
  records: []
};

const semanticsBank = {
  module_id: "AG70E",
  title: "Semantics Production Bank",
  status: "semantics_production_bank_created_empty",
  purpose: "Hold sourced meaning, semantic range, usage boundary and reflective sense records.",
  schema_source: "data/knowledge-base/word-of-day/production/lexical-engine/semantics-engine-schema.json",
  records: []
};

const sacredFallbackBank = {
  module_id: "AG70E",
  title: "Sacred Fallback Production Bank",
  status: "sacred_fallback_production_bank_created_empty",
  purpose: "Hold approved fallback records from source-name/term banks only after evidence and public-use review.",
  schema_source: "data/knowledge-base/word-of-day/production/lexical-engine/sacred-fallback-bank-schema.json",
  planned_fallback_bank_classes: [
    "vishnu_sahasranama_bank",
    "shiva_sahasranama_bank",
    "vedic_term_bank",
    "puranic_name_theme_bank",
    "approved_sanskrit_lexical_bank"
  ],
  records: []
};

const lexicalSourceEvidenceMap = {
  module_id: "AG70E",
  title: "Lexical Source Evidence Map",
  status: "lexical_source_evidence_map_created_empty",
  purpose: "Map each future lexical/fallback record to exact source reference, access check, reuse note and evidence status.",
  required_fields: [
    "evidence_id",
    "linked_record_id",
    "linked_record_type",
    "source_reference_id",
    "source_class",
    "source_access_checked",
    "reuse_note_checked",
    "word_form_found_status",
    "meaning_supported_status",
    "transliteration_supported_status",
    "claim_level_supported",
    "internal_textual_discipline_check",
    "public_use_permission",
    "review_status"
  ],
  records: []
};

const approvedOutputCandidateBank = {
  module_id: "AG70E",
  title: "Approved Output Candidate Bank",
  status: "approved_output_candidate_bank_created_empty",
  purpose: "Hold records that pass context, morphology, etymology/semantic, fallback and duplicate-control gates before output generation.",
  required_fields: [
    "output_candidate_id",
    "selection_path",
    "selected_word_id",
    "context_signal_id",
    "morphology_record_id",
    "etymology_record_id",
    "semantics_record_id",
    "fallback_record_id",
    "source_evidence_ids",
    "duplicate_check_status",
    "approved_for_daily_output",
    "review_status"
  ],
  records: []
};

const dailyWordHistoryBank = {
  module_id: "AG70E",
  title: "Daily Word History Bank",
  status: "daily_word_history_bank_created_empty",
  purpose: "Persist date-wise selected/suggested/published Word records.",
  schema_source: "data/knowledge-base/word-of-day/production/daily-word-history-schema.json",
  records: []
};

const duplicateControlHistoryBank = {
  module_id: "AG70E",
  title: "Duplicate Control History Bank",
  status: "duplicate_control_history_bank_created_empty",
  purpose: "Support repeat-control before publishing or saving a final Word of the Day.",
  required_fields: [
    "duplicate_control_record_id",
    "selected_word_id",
    "sanskrit_form",
    "date_key",
    "selection_path",
    "source_bank_used",
    "repeat_control_tags",
    "last_published_date",
    "repeat_window_status",
    "replacement_required",
    "replacement_candidate_id"
  ],
  records: []
};

const outputRecordContract = {
  module_id: "AG70E",
  title: "Word Output Record Contract",
  status: "word_output_record_contract_created_no_output_generated",
  purpose: "Define the final bounded record that will later replace or feed generated/word-of-day.json only after output connector approval.",
  output_target_future: "generated/word-of-day.json",
  required_fields: [
    "date_key",
    "word_id",
    "sanskrit",
    "hindi",
    "english",
    "meaning_en",
    "meaning_hi",
    "context_summary",
    "selection_path",
    "source_bank_used",
    "morphology_status",
    "etymology_status",
    "semantic_status",
    "duplicate_check_status",
    "public_use_permission",
    "review_status",
    "subscriber_archive_eligible"
  ],
  output_generated_now: false
};

const updatedWordManifest = {
  ...wordManifest,
  status: "production_bank_manifest_created_word_production_knowledge_bank_foundation",
  current_status: "word_production_knowledge_bank_foundation_created_empty_banks",
  knowledge_bank_files: {
    foundation_manifest: outputs.foundationManifest,
    context_interpretation_bank: outputs.contextInterpretationBank,
    context_signal_taxonomy: outputs.contextSignalTaxonomy,
    morphology_bank: outputs.morphologyBank,
    etymology_bank: outputs.etymologyBank,
    semantics_bank: outputs.semanticsBank,
    sacred_fallback_bank: outputs.sacredFallbackBank,
    lexical_source_evidence_map: outputs.lexicalSourceEvidenceMap,
    approved_output_candidate_bank: outputs.approvedOutputCandidateBank,
    daily_word_history_bank: outputs.dailyWordHistoryBank,
    duplicate_control_history_bank: outputs.duplicateControlHistoryBank,
    output_record_contract: outputs.outputRecordContract
  },
  current_counts: {
    ...(wordManifest.current_counts || {}),
    context_interpretation_records: 0,
    morphology_records: 0,
    etymology_records: 0,
    semantics_records: 0,
    sacred_fallback_records: 0,
    lexical_source_evidence_records: 0,
    approved_output_candidates: 0,
    daily_word_history_records: 0,
    duplicate_control_records: 0
  },
  next_required_stage: "AG70F — Sanskrit Lexical Source Reference Bank Batch 01"
};

const review = {
  module_id: "AG70E",
  title: "Word Production Knowledge Bank Foundation",
  status: "ag70e_word_production_knowledge_bank_foundation_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70d_review: "data/content-intelligence/quality-reviews/ag70d-word-methodology-supersession.json",
    methodology_v2: "data/knowledge-base/word-of-day/production/methodology/ag70d-word-of-the-day-methodology-v2.json"
  },
  generated_records: outputs,
  summary: {
    foundation_manifest_created: true,
    context_interpretation_bank_created: true,
    context_signal_taxonomy_created: true,
    morphology_production_bank_created: true,
    etymology_production_bank_created: true,
    semantics_production_bank_created: true,
    sacred_fallback_production_bank_created: true,
    lexical_source_evidence_map_created: true,
    approved_output_candidate_bank_created: true,
    daily_word_history_bank_created: true,
    duplicate_control_history_bank_created: true,
    output_record_contract_created: true,
    word_manifest_updated_with_knowledge_bank_foundation: true,
    actual_context_records_created_now: false,
    actual_morphology_records_created_now: false,
    actual_etymology_records_created_now: false,
    actual_semantics_records_created_now: false,
    actual_fallback_records_created_now: false,
    daily_word_records_created_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    runtime_selector_active_now: false,
    public_word_generation_allowed_now: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70f: true
  }
};

const readiness = {
  module_id: "AG70E",
  title: "AG70F Sanskrit Lexical Source Reference Bank Readiness Record",
  status: "ready_for_ag70f_sanskrit_lexical_source_reference_bank",
  ready_for_ag70f: true,
  next_stage: "AG70F — Sanskrit Lexical Source Reference Bank Batch 01",
  reason: "The Word production knowledge-bank containers now exist. The next stage should add reviewed source-reference records before lexical/fallback content is populated."
};

const boundary = {
  module_id: "AG70E",
  title: "AG70E to AG70F Sanskrit Lexical Source Reference Bank Boundary",
  status: "ag70f_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create reviewed source-reference records for Sanskrit lexical work.",
    "Record source class, access status, reuse notes and public-use boundaries.",
    "Do not ingest copyrighted dictionary/book content wholesale.",
    "Do not create Sanskrit word output records yet."
  ],
  blocked_scope_without_explicit_approval: [
    "generated/word-of-day.json replacement",
    "homepage UI change",
    "runtime selector activation",
    "Supabase/database writes",
    "backend/Auth activation",
    "AI-fabricated Sanskrit or meaning records",
    "unsupported etymology",
    "public Word output",
    "bulk dictionary/book content ingestion"
  ]
};

const quality = {
  module_id: "AG70E",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70E",
  status: review.status,
  foundation_manifest_created: 1,
  context_interpretation_bank_created: 1,
  morphology_production_bank_created: 1,
  etymology_production_bank_created: 1,
  semantics_production_bank_created: 1,
  sacred_fallback_production_bank_created: 1,
  lexical_source_evidence_map_created: 1,
  approved_output_candidate_bank_created: 1,
  daily_word_history_bank_created: 1,
  duplicate_control_history_bank_created: 1,
  actual_records_created_now: 0,
  generated_word_json_modified: 0,
  ui_display_changed: 0,
  ready_for_ag70f: 1
};

const doc = `# AG70E — Word Production Knowledge Bank Foundation

AG70E creates the empty production knowledge-bank containers required by Word Methodology v2.

## Created

- Context Interpretation Bank
- Context Signal Taxonomy
- Morphology Production Bank
- Etymology Production Bank
- Semantics Production Bank
- Sacred Fallback Production Bank
- Lexical Source Evidence Map
- Approved Output Candidate Bank
- Daily Word History Bank
- Duplicate Control History Bank
- Word Output Record Contract

## Not created

- No Sanskrit lexical records.
- No fallback records.
- No daily Word records.
- No public output.
- No generated/word-of-day.json replacement.
- No homepage UI change.
- No runtime selector activation.
- No Supabase/backend activation.
`;

writeJson(outputs.foundationManifest, foundationManifest);
writeJson(outputs.contextInterpretationBank, contextInterpretationBank);
writeJson(outputs.contextSignalTaxonomy, contextSignalTaxonomy);
writeJson(outputs.morphologyBank, morphologyBank);
writeJson(outputs.etymologyBank, etymologyBank);
writeJson(outputs.semanticsBank, semanticsBank);
writeJson(outputs.sacredFallbackBank, sacredFallbackBank);
writeJson(outputs.lexicalSourceEvidenceMap, lexicalSourceEvidenceMap);
writeJson(outputs.approvedOutputCandidateBank, approvedOutputCandidateBank);
writeJson(outputs.dailyWordHistoryBank, dailyWordHistoryBank);
writeJson(outputs.duplicateControlHistoryBank, duplicateControlHistoryBank);
writeJson(outputs.outputRecordContract, outputRecordContract);
writeJson(outputs.wordManifest, updatedWordManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70E Word production knowledge-bank foundation generated.");
console.log("✅ Empty production-bank containers created.");
console.log("✅ No actual records, output, UI or backend mutation performed.");
