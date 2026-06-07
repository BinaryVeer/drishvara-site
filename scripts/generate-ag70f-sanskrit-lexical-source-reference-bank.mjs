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

const ag70e = readJson("data/content-intelligence/quality-reviews/ag70e-word-production-knowledge-bank-foundation.json");
const foundationManifest = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/ag70e-word-production-knowledge-bank-foundation-manifest.json");
const lexicalSourceEvidenceMap = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/lexical-source-evidence-map.json");
const wordManifest = readJson("data/knowledge-base/word-of-day/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70e.status !== "ag70e_word_production_knowledge_bank_foundation_completed") {
  throw new Error("AG70E must be complete before AG70F.");
}
if (ag70e.summary?.ready_for_ag70f !== true) {
  throw new Error("AG70E readiness for AG70F is missing.");
}
if (foundationManifest.status !== "word_production_knowledge_bank_foundation_created_empty_banks") {
  throw new Error("AG70E foundation manifest missing.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  sourceReferenceBank: "data/knowledge-base/word-of-day/production/knowledge-bank/sanskrit-lexical-source-reference-bank.json",
  sourceReviewPolicy: "data/knowledge-base/word-of-day/production/knowledge-bank/sanskrit-lexical-source-review-policy.json",
  sourceReuseBoundary: "data/knowledge-base/word-of-day/production/knowledge-bank/sanskrit-source-reuse-boundary-register.json",
  sacredFallbackFamilyRegister: "data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-source-family-register.json",
  lexicalSourceEvidenceMap: "data/knowledge-base/word-of-day/production/knowledge-bank/lexical-source-evidence-map.json",
  foundationManifest: "data/knowledge-base/word-of-day/production/knowledge-bank/ag70e-word-production-knowledge-bank-foundation-manifest.json",
  wordManifest: "data/knowledge-base/word-of-day/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70f-sanskrit-lexical-source-reference-bank.json",
  readiness: "data/content-intelligence/quality-registry/ag70f-ag70g-sacred-fallback-source-bank-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70f-to-ag70g-sacred-fallback-source-bank-boundary.json",
  quality: "data/quality/ag70f-sanskrit-lexical-source-reference-bank.json",
  preview: "data/quality/ag70f-sanskrit-lexical-source-reference-bank-preview.json",
  doc: "docs/quality/AG70F_SANSKRIT_LEXICAL_SOURCE_REFERENCE_BANK.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const exactSourceRecords = [
  {
    source_reference_id: "src_vedic_heritage_portal_gov_india",
    source_name: "Vedic Heritage Portal",
    source_url: "https://vedicheritage.gov.in/",
    source_domain: "vedicheritage.gov.in",
    source_record_type: "exact_source_reference",
    source_class: "institutional_vedic_reference",
    source_category: "vedic_source_orientation",
    intended_use: ["vedic_context_reference", "fallback_source_orientation", "source_family_review"],
    evidence_use_level: "context_reference_only_until_specific_text_record_is_reviewed",
    source_access_checked: true,
    reuse_note_checked: true,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: false,
    approved_for_review_guidance: true,
    approved_for_context_reference: true,
    review_status: "reviewed_reference_record",
    public_use_permission: "not_allowed_for_public_claim_without_record_level_review"
  },
  {
    source_reference_id: "src_cologne_digital_sanskrit_dictionaries",
    source_name: "Cologne Digital Sanskrit Dictionaries",
    source_url: "https://www.sanskrit-lexicon.uni-koeln.de/",
    source_domain: "sanskrit-lexicon.uni-koeln.de",
    source_record_type: "exact_source_reference",
    source_class: "sanskrit_lexical_dictionary_collection",
    source_category: "lexical_reference",
    intended_use: ["morphology_support", "meaning_crosscheck", "lexical_source_reference"],
    evidence_use_level: "lexical_reference_metadata_and_short_evidence_notes",
    source_access_checked: true,
    reuse_note_checked: true,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: true,
    approved_for_review_guidance: true,
    approved_for_context_reference: true,
    review_status: "reviewed_reference_record",
    public_use_permission: "record_level_review_required"
  },
  {
    source_reference_id: "src_sanskrit_heritage_inria",
    source_name: "Sanskrit Heritage Site / INRIA Sanskrit Heritage tools",
    source_url: "https://sanskrit.inria.fr/",
    source_domain: "sanskrit.inria.fr",
    source_record_type: "exact_source_reference",
    source_class: "sanskrit_processing_and_lexical_tool",
    source_category: "morphology_processing_reference",
    intended_use: ["morphology_analysis", "stemming_reference", "segmentation_reference", "lexical_lookup_support"],
    evidence_use_level: "tool_reference_and_crosscheck_only",
    source_access_checked: true,
    reuse_note_checked: true,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: true,
    approved_for_review_guidance: true,
    approved_for_context_reference: true,
    review_status: "reviewed_reference_record",
    public_use_permission: "record_level_review_required"
  },
  {
    source_reference_id: "src_digital_corpus_of_sanskrit",
    source_name: "Digital Corpus of Sanskrit",
    source_url: "https://www.sanskrit-linguistics.org/dcs/",
    source_domain: "sanskrit-linguistics.org",
    source_record_type: "exact_source_reference",
    source_class: "corpus_attestation_reference",
    source_category: "morphological_and_lexical_corpus",
    intended_use: ["corpus_attestation", "morphological_crosscheck", "usage_context_reference"],
    evidence_use_level: "attestation_reference_only",
    source_access_checked: true,
    reuse_note_checked: true,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: true,
    approved_for_review_guidance: true,
    approved_for_context_reference: true,
    review_status: "reviewed_reference_record",
    public_use_permission: "record_level_review_required"
  },
  {
    source_reference_id: "src_gretil",
    source_name: "GRETIL — Göttingen Register of Electronic Texts in Indian Languages",
    source_url: "https://gretil.sub.uni-goettingen.de/",
    source_domain: "gretil.sub.uni-goettingen.de",
    source_record_type: "exact_source_reference",
    source_class: "machine_readable_text_reference",
    source_category: "text_attestation_reference",
    intended_use: ["text_attestation", "traditional_text_crosscheck", "fallback_source_scoping"],
    evidence_use_level: "machine_readable_text_reference_only_until_reuse_review",
    source_access_checked: true,
    reuse_note_checked: true,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: false,
    approved_for_review_guidance: true,
    approved_for_context_reference: true,
    review_status: "reviewed_reference_record",
    public_use_permission: "record_level_review_required"
  },
  {
    source_reference_id: "src_dsal_digital_dictionaries_south_asia",
    source_name: "Digital Dictionaries of South Asia",
    source_url: "https://dsal.uchicago.edu/dictionaries/",
    source_domain: "dsal.uchicago.edu",
    source_record_type: "exact_source_reference",
    source_class: "dictionary_portal",
    source_category: "lexical_reference_portal",
    intended_use: ["source_discovery", "dictionary_reference_scoping", "metadata_crosscheck"],
    evidence_use_level: "portal_reference_and_metadata_only",
    source_access_checked: true,
    reuse_note_checked: true,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: false,
    approved_for_review_guidance: true,
    approved_for_context_reference: true,
    review_status: "reviewed_reference_record",
    public_use_permission: "specific_dictionary_record_required"
  },
  {
    source_reference_id: "src_dsal_apte_practical_sanskrit_english_dictionary",
    source_name: "V. S. Apte — The Practical Sanskrit-English Dictionary via DSAL",
    source_url: "https://dsal.uchicago.edu/dictionaries/apte/",
    source_domain: "dsal.uchicago.edu",
    source_record_type: "exact_source_reference",
    source_class: "sanskrit_lexical_dictionary",
    source_category: "lexical_reference",
    intended_use: ["meaning_crosscheck", "sanskrit_form_crosscheck", "lexical_evidence_reference"],
    evidence_use_level: "metadata_and_short_evidence_notes_only_no_reproduction",
    source_access_checked: true,
    reuse_note_checked: true,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: true,
    approved_for_review_guidance: true,
    approved_for_context_reference: true,
    review_status: "reviewed_reference_record",
    public_use_permission: "record_level_review_required_due_to_no_reproduction_notice"
  },
  {
    source_reference_id: "src_archive_apte_1890_scan_metadata",
    source_name: "V. S. Apte — The Practical Sanskrit-English Dictionary 1890 archive scan metadata",
    source_url: "https://archive.org/details/ldpd_7285627_000",
    source_domain: "archive.org",
    source_record_type: "exact_source_reference",
    source_class: "archive_scan_metadata",
    source_category: "lexical_reference_metadata",
    intended_use: ["edition_metadata_reference", "bibliographic_crosscheck"],
    evidence_use_level: "metadata_only_no_book_text_ingestion",
    source_access_checked: true,
    reuse_note_checked: true,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: false,
    approved_for_review_guidance: true,
    approved_for_context_reference: true,
    review_status: "reviewed_reference_record",
    public_use_permission: "metadata_reference_only"
  },
  {
    source_reference_id: "src_dsal_macdonell_practical_sanskrit_dictionary",
    source_name: "A. A. Macdonell — A Practical Sanskrit Dictionary via DSAL",
    source_url: "https://dsal.uchicago.edu/dictionaries/macdonell/",
    source_domain: "dsal.uchicago.edu",
    source_record_type: "exact_source_reference",
    source_class: "sanskrit_lexical_dictionary",
    source_category: "lexical_and_etymological_reference",
    intended_use: ["meaning_crosscheck", "etymology_crosscheck", "transliteration_crosscheck"],
    evidence_use_level: "metadata_and_short_evidence_notes_only",
    source_access_checked: true,
    reuse_note_checked: true,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: true,
    approved_for_review_guidance: true,
    approved_for_context_reference: true,
    review_status: "reviewed_reference_record",
    public_use_permission: "record_level_review_required"
  },
  {
    source_reference_id: "src_sanskritdictionary_com_lexical_lookup",
    source_name: "Sanskrit Dictionary lexical lookup",
    source_url: "https://www.sanskritdictionary.com/",
    source_domain: "sanskritdictionary.com",
    source_record_type: "exact_source_reference",
    source_class: "lexical_lookup_index_candidate",
    source_category: "secondary_lookup_reference",
    intended_use: ["scout_lookup", "root_search_hint", "crosscheck_candidate_only"],
    evidence_use_level: "secondary_lookup_only_not_primary_evidence",
    source_access_checked: true,
    reuse_note_checked: true,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: false,
    approved_for_review_guidance: true,
    approved_for_context_reference: true,
    review_status: "reviewed_reference_record_secondary_only",
    public_use_permission: "not_allowed_for_primary_public_claim"
  },
  {
    source_reference_id: "src_hindi_shabdasagara_dsal",
    source_name: "Hindi Śabdasāgara via DSAL",
    source_url: "https://dsal.uchicago.edu/dictionaries/dasa-hindi/",
    source_domain: "dsal.uchicago.edu",
    source_record_type: "exact_source_reference",
    source_class: "hindi_lexical_dictionary",
    source_category: "hindi_meaning_reference",
    intended_use: ["hindi_form_crosscheck", "hindi_meaning_crosscheck", "semantic_hindi_boundary"],
    evidence_use_level: "metadata_and_short_evidence_notes_only_no_reproduction",
    source_access_checked: true,
    reuse_note_checked: true,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: true,
    approved_for_review_guidance: true,
    approved_for_context_reference: true,
    review_status: "reviewed_reference_record",
    public_use_permission: "record_level_review_required_due_to_no_reproduction_notice"
  },
  {
    source_reference_id: "src_central_hindi_directorate_publications",
    source_name: "Central Hindi Directorate Publications",
    source_url: "https://www.chdpublication.education.gov.in/english/downloads.php",
    source_domain: "chdpublication.education.gov.in",
    source_record_type: "exact_source_reference",
    source_class: "institutional_hindi_publication_reference",
    source_category: "hindi_lexical_or_publication_reference",
    intended_use: ["hindi_form_crosscheck", "hindi_publication_reference", "official_hindi_terminology_scoping"],
    evidence_use_level: "metadata_and_publication_reference_only_until_specific_publication_review",
    source_access_checked: true,
    reuse_note_checked: true,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: false,
    approved_for_review_guidance: true,
    approved_for_context_reference: true,
    review_status: "reviewed_reference_record",
    public_use_permission: "specific_publication_record_required"
  }
];

const nityanandMisraReviewRecords = [
  {
    source_reference_id: "src_nityananda_misra_sunama_sarit",
    source_name: "Sunāma-Sarit: Ten Thousand Sanskrit Names — Nityānanda Miśra",
    source_url: "https://sunaama.in/books/",
    source_domain: "sunaama.in",
    source_record_type: "review_guidance_reference",
    source_class: "sanskrit_name_and_textual_discipline_reference",
    source_category: "name_discipline_review_reference",
    intended_use: [
      "sacred_fallback_bank_review",
      "sanskrit_name_validity_review",
      "fallback_name_theme_review",
      "avoid_invented_sanskrit_names",
      "source_discipline_guidance"
    ],
    evidence_use_level: "review_guidance_only_no_bulk_ingestion_no_public_claim",
    source_access_checked: true,
    reuse_note_checked: true,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: false,
    approved_for_review_guidance: true,
    approved_for_context_reference: true,
    nityanand_misra_related: true,
    review_status: "candidate_review_reference_record",
    public_use_permission: "not_allowed_for_public_claim_without_record_level_review"
  },
  {
    source_reference_id: "src_nityananda_misra_sunama",
    source_name: "Sunāma: Beautiful Sanskrit Names — Nityānanda Miśra",
    source_url: "https://www.ibpbooks.in/sunama-beautiful-sanskrit-names/p/50212",
    source_domain: "ibpbooks.in",
    source_record_type: "review_guidance_reference",
    source_class: "sanskrit_name_and_textual_discipline_reference",
    source_category: "name_discipline_review_reference",
    intended_use: [
      "sacred_fallback_bank_review",
      "sanskrit_name_validity_review",
      "vyutpatti_nirukti_caution",
      "avoid_invented_sanskrit_names",
      "source_discipline_guidance"
    ],
    evidence_use_level: "review_guidance_only_no_bulk_ingestion_no_public_claim",
    source_access_checked: true,
    reuse_note_checked: true,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: false,
    approved_for_review_guidance: true,
    approved_for_context_reference: true,
    nityanand_misra_related: true,
    review_status: "candidate_review_reference_record",
    public_use_permission: "not_allowed_for_public_claim_without_record_level_review"
  }
];

const sourceFamilyPlaceholders = [
  {
    source_reference_id: "src_vishnu_sahasranama_source_family",
    source_name: "Vishnu Sahasranama source family",
    source_record_type: "source_family_placeholder",
    source_class: "traditional_name_bank_family",
    source_category: "sacred_fallback_source_family",
    intended_use: ["future_fallback_bank"],
    exact_source_pending: true,
    source_access_checked: false,
    reuse_note_checked: false,
    bulk_ingestion_allowed: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: false,
    approved_for_review_guidance: false,
    approved_for_context_reference: false,
    review_status: "exact_edition_or_source_pending",
    public_use_permission: "not_allowed_until_exact_source_review"
  },
  {
    source_reference_id: "src_shiva_sahasranama_source_family",
    source_name: "Shiva Sahasranama source family",
    source_record_type: "source_family_placeholder",
    source_class: "traditional_name_bank_family",
    source_category: "sacred_fallback_source_family",
    intended_use: ["future_fallback_bank"],
    exact_source_pending: true,
    source_access_checked: false,
    reuse_note_checked: false,
    bulk_ingestion_allowed: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: false,
    approved_for_review_guidance: false,
    approved_for_context_reference: false,
    review_status: "exact_edition_or_source_pending",
    public_use_permission: "not_allowed_until_exact_source_review"
  },
  {
    source_reference_id: "src_vedic_source_text_family",
    source_name: "Vedic source-text family",
    source_record_type: "source_family_placeholder",
    source_class: "vedic_source_text_family",
    source_category: "vedic_term_fallback_source_family",
    intended_use: ["future_vedic_term_bank", "future_fallback_bank"],
    exact_source_pending: true,
    source_access_checked: false,
    reuse_note_checked: false,
    bulk_ingestion_allowed: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: false,
    approved_for_review_guidance: false,
    approved_for_context_reference: false,
    review_status: "exact_text_recension_or_source_pending",
    public_use_permission: "not_allowed_until_exact_source_review"
  },
  {
    source_reference_id: "src_puranic_source_text_family",
    source_name: "Puranic source-text family",
    source_record_type: "source_family_placeholder",
    source_class: "puranic_source_text_family",
    source_category: "puranic_name_theme_fallback_source_family",
    intended_use: ["future_puranic_name_theme_bank", "future_fallback_bank"],
    exact_source_pending: true,
    source_access_checked: false,
    reuse_note_checked: false,
    bulk_ingestion_allowed: false,
    public_claim_allowed_now: false,
    approved_for_primary_lexical_evidence: false,
    approved_for_review_guidance: false,
    approved_for_context_reference: false,
    review_status: "exact_text_edition_or_source_pending",
    public_use_permission: "not_allowed_until_exact_source_review"
  }
];

const allRecords = [...exactSourceRecords, ...nityanandMisraReviewRecords, ...sourceFamilyPlaceholders];

const sourceReferenceBank = {
  module_id: "AG70F",
  title: "Sanskrit Lexical Source Reference Bank — Batch 01",
  status: "sanskrit_lexical_source_reference_bank_batch_01_created",
  purpose: "Register reviewed source-reference and review-guidance records before Sanskrit lexical, etymology, semantics or fallback word records are populated.",
  batch_id: "ag70f_batch_01",
  source_reference_count: allRecords.length,
  exact_source_reference_count: exactSourceRecords.length,
  review_guidance_reference_count: nityanandMisraReviewRecords.length,
  nityanand_misra_reference_count: nityanandMisraReviewRecords.length,
  source_family_placeholder_count: sourceFamilyPlaceholders.length,
  primary_lexical_evidence_eligible_count: exactSourceRecords.filter((x) => x.approved_for_primary_lexical_evidence).length,
  review_guidance_eligible_count: allRecords.filter((x) => x.approved_for_review_guidance).length,
  bulk_ingestion_allowed_count: allRecords.filter((x) => x.bulk_ingestion_allowed).length,
  public_claim_allowed_now_count: allRecords.filter((x) => x.public_claim_allowed_now).length,
  records: allRecords
};

const sourceReviewPolicy = {
  module_id: "AG70F",
  title: "Sanskrit Lexical Source Review Policy",
  status: "sanskrit_lexical_source_review_policy_created",
  policy_rules: [
    "Source-reference record is not a public content approval.",
    "Review-guidance references support discipline and validation caution only; they are not primary lexical evidence by themselves.",
    "No dictionary/book/corpus text may be bulk ingested in this stage.",
    "Source access and reuse notes must be checked before a source can support evidence mapping.",
    "Every future lexical/fallback record must link to at least one source_reference_id and one evidence_id.",
    "Sacred fallback source families require exact edition/source/recension selection before records can be populated.",
    "Public claims require record-level review; source-level registration alone is insufficient."
  ],
  blocked_use: [
    "bulk_dictionary_ingestion",
    "long_text_reproduction",
    "public_etymology_claim_from_source_title_only",
    "fallback_bank_population_from_source_family_placeholder",
    "fallback_bank_population_from_review_guidance_reference_alone",
    "AI_substitute_for_source_evidence"
  ]
};

const sourceReuseBoundary = {
  module_id: "AG70F",
  title: "Sanskrit Source Reuse Boundary Register",
  status: "sanskrit_source_reuse_boundary_register_created",
  boundary_summary: [
    "DSAL Apte and Hindi Shabdasagara records are restricted to metadata and short evidence notes unless permission/licence permits more.",
    "Nityanand Misra source records are review/textual-discipline references only and do not permit bulk ingestion or public claims.",
    "Archive scan records are metadata-only in this stage.",
    "Corpus and machine-readable text references are attestation/scoping references until reuse rules are reviewed.",
    "No source record allows wholesale copying into Drishvara production banks.",
    "No public-facing Sanskrit, etymology or sacred-text claim may be published from source-reference registration alone."
  ],
  source_reference_ids: allRecords.map((x) => x.source_reference_id)
};

const sacredFallbackFamilyRegister = {
  module_id: "AG70F",
  title: "Sacred Fallback Source Family Register",
  status: "sacred_fallback_source_family_register_created_exact_sources_pending",
  purpose: "Register future fallback families while blocking population until exact sources are selected and reviewed.",
  family_count: sourceFamilyPlaceholders.length,
  review_guidance_reference_ids: nityanandMisraReviewRecords.map((x) => x.source_reference_id),
  records: sourceFamilyPlaceholders,
  next_required_action: "Select exact editions/sources for Vishnu Sahasranama, Shiva Sahasranama, Vedic source terms and Puranic name/theme banks before fallback records are populated. Use Nityanand Misra records only as review/textual-discipline guidance, not as fallback bank source content."
};

const updatedLexicalSourceEvidenceMap = {
  ...lexicalSourceEvidenceMap,
  status: "lexical_source_evidence_map_created_with_source_reference_bank_link",
  source_reference_bank_path: outputs.sourceReferenceBank,
  source_reference_count: allRecords.length,
  review_guidance_reference_count: nityanandMisraReviewRecords.length,
  evidence_records_created_now: 0,
  records: lexicalSourceEvidenceMap.records || []
};

const updatedFoundationManifest = {
  ...foundationManifest,
  status: "word_production_knowledge_bank_foundation_created_with_source_reference_bank",
  current_counts: {
    ...(foundationManifest.current_counts || {}),
    source_reference_records: allRecords.length,
    exact_source_reference_records: exactSourceRecords.length,
    review_guidance_reference_records: nityanandMisraReviewRecords.length,
    nityanand_misra_reference_records: nityanandMisraReviewRecords.length,
    source_family_placeholder_records: sourceFamilyPlaceholders.length,
    evidence_records: 0,
    morphology_records: 0,
    etymology_records: 0,
    semantics_records: 0,
    sacred_fallback_records: 0
  },
  source_reference_files: {
    source_reference_bank: outputs.sourceReferenceBank,
    source_review_policy: outputs.sourceReviewPolicy,
    source_reuse_boundary: outputs.sourceReuseBoundary,
    sacred_fallback_family_register: outputs.sacredFallbackFamilyRegister
  },
  next_required_stage: "AG70G — Sacred Fallback Source Bank Batch 01"
};

const updatedWordManifest = {
  ...wordManifest,
  status: "production_bank_manifest_created_sanskrit_lexical_source_reference_bank",
  current_status: "sanskrit_lexical_source_reference_bank_batch_01_created_no_word_records",
  source_reference_bank_files: {
    source_reference_bank: outputs.sourceReferenceBank,
    source_review_policy: outputs.sourceReviewPolicy,
    source_reuse_boundary: outputs.sourceReuseBoundary,
    sacred_fallback_family_register: outputs.sacredFallbackFamilyRegister
  },
  current_counts: {
    ...(wordManifest.current_counts || {}),
    source_reference_records: allRecords.length,
    exact_source_reference_records: exactSourceRecords.length,
    review_guidance_reference_records: nityanandMisraReviewRecords.length,
    nityanand_misra_reference_records: nityanandMisraReviewRecords.length,
    source_family_placeholder_records: sourceFamilyPlaceholders.length,
    actual_lexical_records: 0,
    actual_fallback_records: 0,
    daily_word_records: 0
  },
  next_required_stage: "AG70G — Sacred Fallback Source Bank Batch 01"
};

const review = {
  module_id: "AG70F",
  title: "Sanskrit Lexical Source Reference Bank Batch 01",
  status: "ag70f_sanskrit_lexical_source_reference_bank_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70e_review: "data/content-intelligence/quality-reviews/ag70e-word-production-knowledge-bank-foundation.json",
    foundation_manifest: "data/knowledge-base/word-of-day/production/knowledge-bank/ag70e-word-production-knowledge-bank-foundation-manifest.json"
  },
  generated_records: outputs,
  summary: {
    source_reference_bank_created: true,
    source_review_policy_created: true,
    source_reuse_boundary_created: true,
    sacred_fallback_family_register_created: true,
    nityanand_misra_review_references_added: true,
    lexical_source_evidence_map_linked_to_source_reference_bank: true,
    exact_source_reference_count: exactSourceRecords.length,
    review_guidance_reference_count: nityanandMisraReviewRecords.length,
    nityanand_misra_reference_count: nityanandMisraReviewRecords.length,
    source_family_placeholder_count: sourceFamilyPlaceholders.length,
    total_source_reference_count: allRecords.length,
    bulk_ingestion_allowed_count: 0,
    public_claim_allowed_now_count: 0,
    actual_sanskrit_word_records_created_now: false,
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
    ready_for_ag70g: true
  }
};

const readiness = {
  module_id: "AG70F",
  title: "AG70G Sacred Fallback Source Bank Readiness Record",
  status: "ready_for_ag70g_sacred_fallback_source_bank",
  ready_for_ag70g: true,
  next_stage: "AG70G — Sacred Fallback Source Bank Batch 01",
  reason: "Source-reference bank Batch 01 is registered, including textual-discipline review references. Sacred fallback families now require exact edition/source selection before fallback records can be populated."
};

const boundary = {
  module_id: "AG70F",
  title: "AG70F to AG70G Sacred Fallback Source Bank Boundary",
  status: "ag70g_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Select exact source editions/references for sacred fallback banks.",
    "Create source-specific fallback source records for Vishnu Sahasranama, Shiva Sahasranama, Vedic source terms and Puranic name/theme banks.",
    "Use Nityanand Misra references as review/textual-discipline guidance only.",
    "Keep fallback word/name records blocked until exact sources are reviewed."
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
    "bulk dictionary/book content ingestion",
    "fallback word population from source-family placeholder",
    "fallback word population from review-guidance reference alone"
  ]
};

const quality = {
  module_id: "AG70F",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70F",
  status: review.status,
  source_reference_bank_created: 1,
  exact_source_reference_count: exactSourceRecords.length,
  review_guidance_reference_count: nityanandMisraReviewRecords.length,
  nityanand_misra_reference_count: nityanandMisraReviewRecords.length,
  source_family_placeholder_count: sourceFamilyPlaceholders.length,
  total_source_reference_count: allRecords.length,
  bulk_ingestion_allowed_count: 0,
  public_claim_allowed_now_count: 0,
  actual_sanskrit_word_records_created_now: 0,
  generated_word_json_modified: 0,
  ui_display_changed: 0,
  ready_for_ag70g: 1
};

const doc = `# AG70F — Sanskrit Lexical Source Reference Bank Batch 01

AG70F registers reviewed source-reference and review-guidance records for Sanskrit lexical work.

## Included source classes

- Vedic Heritage Portal
- Cologne Digital Sanskrit Dictionaries
- Sanskrit Heritage / INRIA
- Digital Corpus of Sanskrit
- GRETIL
- Digital Dictionaries of South Asia
- DSAL Apte
- Archive Apte scan metadata
- DSAL Macdonell
- SanskritDictionary.com lookup candidate
- Hindi Śabdasāgara via DSAL
- Central Hindi Directorate publications
- Nityānanda Miśra review/textual-discipline references:
  - Sunāma-Sarit: Ten Thousand Sanskrit Names
  - Sunāma: Beautiful Sanskrit Names
- Sacred fallback source-family placeholders:
  - Vishnu Sahasranama
  - Shiva Sahasranama
  - Vedic source-text family
  - Puranic source-text family

## Nityānanda Miśra records

These records are review/textual-discipline references only. They may guide fallback-name-bank review, Sanskrit name validity review, and avoidance of invented Sanskrit names. They are not primary lexical dictionary evidence and cannot be used for bulk ingestion or public claims without record-level review.

## Not done

- No dictionary/book bulk ingestion.
- No Sanskrit word records.
- No morphology/etymology/semantics records.
- No fallback word records.
- No public Word output.
- No generated/word-of-day.json replacement.
- No UI or backend activation.
`;

writeJson(outputs.sourceReferenceBank, sourceReferenceBank);
writeJson(outputs.sourceReviewPolicy, sourceReviewPolicy);
writeJson(outputs.sourceReuseBoundary, sourceReuseBoundary);
writeJson(outputs.sacredFallbackFamilyRegister, sacredFallbackFamilyRegister);
writeJson(outputs.lexicalSourceEvidenceMap, updatedLexicalSourceEvidenceMap);
writeJson(outputs.foundationManifest, updatedFoundationManifest);
writeJson(outputs.wordManifest, updatedWordManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70F Sanskrit lexical source-reference bank generated.");
console.log(`✅ Source records: ${allRecords.length}; exact sources: ${exactSourceRecords.length}; review guidance: ${nityanandMisraReviewRecords.length}; source-family placeholders: ${sourceFamilyPlaceholders.length}.`);
console.log("✅ Nityanand Misra review/textual-discipline references included.");
console.log("✅ No lexical records, fallback records, output, UI or backend mutation performed.");
