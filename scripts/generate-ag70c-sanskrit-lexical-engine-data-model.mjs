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

const ag70b = readJson("data/content-intelligence/quality-reviews/ag70b-panchang-methodology-astronomical-data-foundation.json");
const panchangConnector = readJson("data/knowledge-base/panchang-festival/production/panchang-to-word-context-connector.json");
const wordManifest = readJson("data/knowledge-base/word-of-day/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70b.status !== "ag70b_panchang_methodology_astronomical_data_foundation_completed") {
  throw new Error("AG70B Panchang foundation must be complete before AG70C.");
}
if (ag70b.summary?.ready_for_ag70c !== true) {
  throw new Error("AG70B readiness for AG70C is missing.");
}
if (panchangConnector.status !== "panchang_to_word_context_connector_defined_not_runtime_active") {
  throw new Error("Panchang-to-Word context connector must exist before AG70C.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  lexicalEngineManifest: "data/knowledge-base/word-of-day/production/lexical-engine/lexical-engine-manifest.json",
  morphologyModel: "data/knowledge-base/word-of-day/production/lexical-engine/morphology-engine-schema.json",
  etymologyModel: "data/knowledge-base/word-of-day/production/lexical-engine/etymology-engine-schema.json",
  semanticsModel: "data/knowledge-base/word-of-day/production/lexical-engine/semantics-engine-schema.json",
  lexicalSourceEvidence: "data/knowledge-base/word-of-day/production/lexical-engine/lexical-source-evidence-rules.json",
  panchangLexicalInput: "data/knowledge-base/word-of-day/production/lexical-engine/panchang-context-to-lexical-input-contract.json",
  candidateLexicalBankSchema: "data/knowledge-base/word-of-day/production/lexical-engine/candidate-lexical-bank-schema.json",
  approvedLexicalBankSchema: "data/knowledge-base/word-of-day/production/lexical-engine/approved-lexical-bank-schema.json",
  sacredFallbackSchema: "data/knowledge-base/word-of-day/production/lexical-engine/sacred-fallback-bank-schema.json",
  dailyWordHistorySchema: "data/knowledge-base/word-of-day/production/daily-word-history-schema.json",
  subscriberArchiveSchema: "data/knowledge-base/word-of-day/production/subscriber-word-archive-schema.json",
  wordManifest: "data/knowledge-base/word-of-day/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70c-sanskrit-lexical-engine-data-model.json",
  readiness: "data/content-intelligence/quality-registry/ag70c-ag70d-word-methodology-supersession-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70c-to-ag70d-word-methodology-supersession-boundary.json",
  quality: "data/quality/ag70c-sanskrit-lexical-engine-data-model.json",
  preview: "data/quality/ag70c-sanskrit-lexical-engine-data-model-preview.json",
  doc: "docs/quality/AG70C_SANSKRIT_LEXICAL_ENGINE_DATA_MODEL.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const lexicalEngineManifest = {
  module_id: "AG70C",
  title: "Sanskrit Lexical Engine Manifest",
  status: "sanskrit_lexical_engine_manifest_created_no_runtime_activation",
  purpose: "Define the morphology, etymology and semantics data model that Word of the Day must use after Panchang-context interpretation.",
  runtime_engine_active_now: false,
  public_word_generation_allowed_now: false,
  engine_components: {
    morphology_engine_schema: outputs.morphologyModel,
    etymology_engine_schema: outputs.etymologyModel,
    semantics_engine_schema: outputs.semanticsModel,
    lexical_source_evidence_rules: outputs.lexicalSourceEvidence,
    panchang_context_input_contract: outputs.panchangLexicalInput,
    sacred_fallback_bank_schema: outputs.sacredFallbackSchema
  },
  current_counts: {
    morphology_records: 0,
    etymology_records: 0,
    semantics_records: 0,
    approved_lexical_records: 0,
    sacred_fallback_records: 0,
    daily_history_records: 0,
    subscriber_archive_records: 0
  },
  blocked_behaviour: [
    "ai_invented_sanskrit_form",
    "unsupported_etymology_claim",
    "loose_transliteration_without_source",
    "word_selection_without_morphology_semantics_check",
    "fallback_selection_without_approved_source_bank",
    "duplicate_publication_without_repeat_control"
  ]
};

const morphologyModel = {
  module_id: "AG70C",
  title: "Morphology Engine Schema",
  status: "morphology_engine_schema_created_empty_bank",
  runtime_engine_active_now: false,
  purpose: "Identify possible Sanskrit forms, roots/stems and valid forms from sourced lexical knowledge based on Panchang-context interpretation.",
  required_fields: [
    "morphology_record_id",
    "lexical_candidate_id",
    "input_context_signal_id",
    "sanskrit_form",
    "transliteration",
    "root_or_dhatu",
    "stem_or_pratipadika",
    "part_of_speech",
    "gender_if_applicable",
    "number_case_if_applicable",
    "valid_form_status",
    "morphology_source_reference_ids",
    "morphology_evidence_status",
    "review_status"
  ],
  allowed_valid_form_status: [
    "established",
    "attested_but_needs_review",
    "not_established",
    "blocked"
  ],
  records: []
};

const etymologyModel = {
  module_id: "AG70C",
  title: "Etymology Engine Schema",
  status: "etymology_engine_schema_created_empty_bank",
  runtime_engine_active_now: false,
  purpose: "Provide sourced historical/root/derivational background where established; mark not_established when uncertain.",
  required_fields: [
    "etymology_record_id",
    "lexical_candidate_id",
    "sanskrit_form",
    "root_or_dhatu",
    "derivational_note",
    "historical_note",
    "etymology_status",
    "source_reference_ids",
    "claim_level",
    "review_status",
    "public_explanation_allowed"
  ],
  allowed_etymology_status: [
    "established",
    "partially_established",
    "not_established",
    "blocked"
  ],
  rule: "If etymology_status is not_established, do not fabricate derivation. Route candidate to fallback or use semantic-only explanation if separately approved.",
  records: []
};

const semanticsModel = {
  module_id: "AG70C",
  title: "Semantics Engine Schema",
  status: "semantics_engine_schema_created_empty_bank",
  runtime_engine_active_now: false,
  purpose: "Define exact meaning, semantic range, usage boundary and reflective sense for user-facing Word output.",
  required_fields: [
    "semantics_record_id",
    "lexical_candidate_id",
    "sanskrit_form",
    "meaning_en",
    "meaning_hi",
    "semantic_range",
    "usage_boundary",
    "reflective_sense",
    "context_signal_match",
    "source_reference_ids",
    "semantic_evidence_status",
    "review_status",
    "public_explanation_allowed"
  ],
  allowed_semantic_evidence_status: [
    "supported",
    "supported_with_limited_scope",
    "needs_review",
    "blocked"
  ],
  records: []
};

const lexicalSourceEvidence = {
  module_id: "AG70C",
  title: "Lexical Source Evidence Rules",
  status: "lexical_source_evidence_rules_created",
  purpose: "Define what counts as usable lexical evidence for Sanskrit morphology, etymology and semantics.",
  source_classes: [
    {
      class_id: "lexical_dictionary",
      examples: [
        "Cologne Digital Sanskrit Dictionaries",
        "Sanskrit Heritage / INRIA",
        "DSAL Sanskrit dictionaries including Apte where reuse permits"
      ],
      allowed_use_now: "metadata_and_short_evidence_notes_only",
      requires_reuse_check: true
    },
    {
      class_id: "corpus_attestation",
      examples: [
        "Digital Corpus of Sanskrit",
        "GRETIL where reuse permits"
      ],
      allowed_use_now: "attestation_reference_only",
      requires_reuse_check: true
    },
    {
      class_id: "traditional_text_or_name_bank",
      examples: [
        "Vishnu Sahasranama",
        "Shiva Sahasranama",
        "Vedic source-term bank",
        "Puranic name/theme bank"
      ],
      allowed_use_now: "fallback_bank_schema_only_until sourced records are reviewed",
      requires_reuse_check: true
    }
  ],
  mandatory_checks: [
    "source_access_checked",
    "reuse_note_checked",
    "word_form_found_status",
    "meaning_supported_status",
    "transliteration_supported_status",
    "claim_level_supported",
    "internal_textual_discipline_check",
    "public_use_permission"
  ],
  blocked_claims: [
    "unsupported_etymology",
    "scriptural_claim_without_exact_source",
    "mantra_generation_or_alteration",
    "invented_sanskrit_word",
    "unsourced_meaning_expansion"
  ]
};

const panchangLexicalInput = {
  module_id: "AG70C",
  title: "Panchang Context to Lexical Input Contract",
  status: "panchang_context_to_lexical_input_contract_created",
  consumed_connector: "data/knowledge-base/panchang-festival/production/panchang-to-word-context-connector.json",
  runtime_connector_active_now: false,
  input_from_panchang_context_interpretation: [
    "context_signal_id",
    "tithi_context_key",
    "nakshatra_context_key",
    "yoga_context_key",
    "paksha_context_key",
    "vara_context_key",
    "festival_context_key",
    "combined_interpretive_signal",
    "confidence_status"
  ],
  passed_to_morphology_engine: [
    "combined_interpretive_signal",
    "context_tags",
    "semantic_direction",
    "blocked_if_panchang_context_unreviewed"
  ],
  rule: "Raw Panchang values do not directly create a word. Reviewed contextual interpretation is passed to lexical engines."
};

const candidateLexicalBankSchema = {
  module_id: "AG70C",
  title: "Candidate Lexical Bank Schema",
  status: "candidate_lexical_bank_schema_created_empty_bank",
  required_fields: [
    "lexical_candidate_id",
    "candidate_source_path",
    "input_context_signal_id",
    "sanskrit_form",
    "hindi_form",
    "english_gloss",
    "morphology_record_id",
    "etymology_record_id",
    "semantics_record_id",
    "candidate_status",
    "review_status",
    "public_use_permission"
  ],
  records: []
};

const approvedLexicalBankSchema = {
  module_id: "AG70C",
  title: "Approved Lexical Bank Schema",
  status: "approved_lexical_bank_schema_created_empty_bank",
  required_fields: [
    "approved_lexical_id",
    "lexical_candidate_id",
    "sanskrit_form",
    "hindi_form",
    "english_gloss",
    "meaning_en",
    "meaning_hi",
    "morphology_status",
    "etymology_status",
    "semantic_status",
    "source_reference_ids",
    "approved_for_primary_selection",
    "approved_for_fallback_selection",
    "panchang_context_tags",
    "theme_tags",
    "repeat_control_tags",
    "public_use_permission",
    "review_status"
  ],
  selection_rule: "Only approved lexical records may enter primary Word of the Day selection.",
  records: []
};

const sacredFallbackSchema = {
  module_id: "AG70C",
  title: "Sacred Fallback Bank Schema",
  status: "sacred_fallback_bank_schema_created_empty_bank",
  purpose: "Provide fallback word/name candidates when primary lexical etymology or derivation is not established.",
  fallback_banks: [
    {
      fallback_bank_id: "vishnu_sahasranama_bank",
      source_class: "traditional_name_bank",
      status: "schema_created_no_records"
    },
    {
      fallback_bank_id: "shiva_sahasranama_bank",
      source_class: "traditional_name_bank",
      status: "schema_created_no_records"
    },
    {
      fallback_bank_id: "vedic_term_bank",
      source_class: "vedic_source_term_bank",
      status: "schema_created_no_records"
    },
    {
      fallback_bank_id: "puranic_name_theme_bank",
      source_class: "puranic_name_theme_bank",
      status: "schema_created_no_records"
    }
  ],
  required_fields: [
    "fallback_record_id",
    "fallback_bank_id",
    "sanskrit_form",
    "hindi_form",
    "english_gloss",
    "meaning_en",
    "meaning_hi",
    "source_reference_ids",
    "source_location_note",
    "semantic_theme_tags",
    "public_use_permission",
    "approved_for_fallback_selection",
    "duplicate_control_tags",
    "review_status"
  ],
  rule: "Fallback records are not a licence to invent. They require source reference, meaning support, public-use permission and repeat-control."
};

const dailyWordHistorySchema = {
  module_id: "AG70C",
  title: "Daily Word History Schema",
  status: "daily_word_history_schema_created_empty_bank",
  purpose: "Save date-wise Word output for duplicate control and subscriber archive.",
  required_fields: [
    "daily_word_record_id",
    "date_key",
    "location_id",
    "panchang_context_id",
    "selection_path",
    "selected_word_id",
    "sanskrit_form",
    "hindi_form",
    "english_gloss",
    "meaning_en",
    "meaning_hi",
    "source_bank_used",
    "etymology_status",
    "morphology_status",
    "semantic_status",
    "duplicate_check_status",
    "published_status",
    "created_at"
  ],
  records: []
};

const subscriberArchiveSchema = {
  module_id: "AG70C",
  title: "Subscriber Word Archive Schema",
  status: "subscriber_word_archive_schema_created_empty_bank",
  purpose: "Allow subscribers to browse/search historical suggested/published Word records after access layer is approved.",
  required_fields: [
    "archive_record_id",
    "daily_word_record_id",
    "date_key",
    "selected_word_id",
    "search_terms",
    "theme_tags",
    "panchang_context_tags",
    "source_bank_used",
    "subscriber_visible",
    "public_summary_allowed"
  ],
  records: []
};

const updatedWordManifest = {
  ...wordManifest,
  status: "production_bank_manifest_created_lexical_engine_model_defined",
  current_status: "lexical_engine_model_defined_no_records_filled",
  lexical_engine_files: {
    lexical_engine_manifest: outputs.lexicalEngineManifest,
    morphology_engine_schema: outputs.morphologyModel,
    etymology_engine_schema: outputs.etymologyModel,
    semantics_engine_schema: outputs.semanticsModel,
    lexical_source_evidence_rules: outputs.lexicalSourceEvidence,
    panchang_context_to_lexical_input_contract: outputs.panchangLexicalInput,
    sacred_fallback_bank_schema: outputs.sacredFallbackSchema,
    daily_word_history_schema: outputs.dailyWordHistorySchema,
    subscriber_word_archive_schema: outputs.subscriberArchiveSchema
  },
  current_counts: {
    ...(wordManifest.current_counts || {}),
    morphology_records: 0,
    etymology_records: 0,
    semantics_records: 0,
    approved_lexical_records: 0,
    sacred_fallback_records: 0,
    daily_history_records: 0,
    subscriber_archive_records: 0
  },
  next_required_stage: "AG70D — Word of the Day Methodology Supersession"
};

const review = {
  module_id: "AG70C",
  title: "Sanskrit Lexical Engine Data Model",
  status: "ag70c_sanskrit_lexical_engine_data_model_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70b_review: "data/content-intelligence/quality-reviews/ag70b-panchang-methodology-astronomical-data-foundation.json",
    panchang_to_word_connector: "data/knowledge-base/panchang-festival/production/panchang-to-word-context-connector.json"
  },
  generated_records: outputs,
  summary: {
    lexical_engine_manifest_created: true,
    morphology_engine_schema_created: true,
    etymology_engine_schema_created: true,
    semantics_engine_schema_created: true,
    lexical_source_evidence_rules_created: true,
    panchang_context_to_lexical_input_contract_created: true,
    sacred_fallback_bank_schema_created: true,
    daily_word_history_schema_created: true,
    subscriber_archive_schema_created: true,
    word_manifest_updated_with_lexical_engine_model: true,
    actual_lexical_records_created_now: false,
    actual_sacred_fallback_records_created_now: false,
    daily_word_history_records_created_now: false,
    subscriber_archive_records_created_now: false,
    public_word_generation_allowed_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70d: true
  }
};

const readiness = {
  module_id: "AG70C",
  title: "AG70D Word Methodology Supersession Readiness Record",
  status: "ready_for_ag70d_word_methodology_supersession",
  ready_for_ag70d: true,
  next_stage: "AG70D — Word of the Day Methodology Supersession",
  reason: "Panchang foundation and Sanskrit lexical engine data model are now present. The old Word rotation method can be superseded by Panchang-context → lexical-engine method."
};

const boundary = {
  module_id: "AG70C",
  title: "AG70C to AG70D Word Methodology Supersession Boundary",
  status: "ag70d_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create Word of the Day Methodology v2 supersession record.",
    "Set old rotation-only method as legacy/reference.",
    "Define Panchang-context → Morphology → Etymology → Semantics → primary/fallback word selection.",
    "Keep generated output and UI unchanged."
  ],
  blocked_scope_without_explicit_approval: [
    "creating actual Sanskrit lexical records",
    "creating actual sacred fallback records",
    "public Word generation",
    "generated/word-of-day.json replacement",
    "homepage UI change",
    "runtime selector activation",
    "Supabase/database writes",
    "backend/Auth activation",
    "AI-fabricated Sanskrit or meaning records"
  ]
};

const quality = {
  module_id: "AG70C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70C",
  status: review.status,
  lexical_engine_manifest_created: 1,
  morphology_engine_schema_created: 1,
  etymology_engine_schema_created: 1,
  semantics_engine_schema_created: 1,
  sacred_fallback_bank_schema_created: 1,
  daily_word_history_schema_created: 1,
  subscriber_archive_schema_created: 1,
  actual_lexical_records_created_now: 0,
  public_word_generation_allowed_now: 0,
  generated_word_json_modified: 0,
  ui_display_changed: 0,
  ready_for_ag70d: 1
};

const doc = `# AG70C — Sanskrit Lexical Engine Data Model

AG70C creates the Sanskrit lexical engine data model required for the redesigned Word of the Day path.

## Engine model

- Morphology Engine
- Etymology Engine
- Semantics Engine
- Sacred fallback bank model
- Lexical source evidence rules
- Panchang-context to lexical input contract
- Daily Word history schema
- Subscriber archive schema

## Important rule

If etymology is not established, the system must not fabricate derivation. It must either use a safe semantic-only path after review or route selection to approved fallback banks such as Vishnu Sahasranama, Shiva Sahasranama, Vedic source terms or Puranic name/theme banks.

## Not done in AG70C

- No actual Sanskrit records created.
- No actual fallback records created.
- No daily Word output created.
- No generated/word-of-day.json replacement.
- No UI change.
- No Supabase/backend activation.
`;

writeJson(outputs.lexicalEngineManifest, lexicalEngineManifest);
writeJson(outputs.morphologyModel, morphologyModel);
writeJson(outputs.etymologyModel, etymologyModel);
writeJson(outputs.semanticsModel, semanticsModel);
writeJson(outputs.lexicalSourceEvidence, lexicalSourceEvidence);
writeJson(outputs.panchangLexicalInput, panchangLexicalInput);
writeJson(outputs.candidateLexicalBankSchema, candidateLexicalBankSchema);
writeJson(outputs.approvedLexicalBankSchema, approvedLexicalBankSchema);
writeJson(outputs.sacredFallbackSchema, sacredFallbackSchema);
writeJson(outputs.dailyWordHistorySchema, dailyWordHistorySchema);
writeJson(outputs.subscriberArchiveSchema, subscriberArchiveSchema);
writeJson(outputs.wordManifest, updatedWordManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70C Sanskrit lexical engine data model generated.");
console.log("✅ Morphology, etymology, semantics, fallback, history and archive schemas created.");
console.log("✅ No lexical records, public output, UI or backend mutation performed.");
