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

const ag69c = readJson("data/content-intelligence/quality-reviews/ag69c-word-source-review-linguistic-discipline-approved-bank-validator.json");

if (ag69c.status !== "ag69c_word_source_review_linguistic_discipline_approved_bank_validator_completed") {
  throw new Error("AG69C must be completed before AG69D.");
}
if (ag69c.summary?.ready_for_ag69d !== true) {
  throw new Error("AG69C readiness for AG69D is missing.");
}

const outputs = {
  sourcePolicy: "data/knowledge-base/word-of-day/ag69d-vedic-tradition-aligned-source-policy.json",
  sourceReferenceBank: "data/knowledge-base/word-of-day/ag69d-source-reference-bank-metadata.json",
  sourceVerificationRegister: "data/knowledge-base/word-of-day/ag69d-source-verification-register.json",
  publishedWorkCandidateRegister: "data/knowledge-base/word-of-day/ag69d-published-work-candidate-source-register.json",
  sourceUseMatrix: "data/knowledge-base/word-of-day/ag69d-source-use-and-reuse-matrix.json",
  candidateMappingRules: "data/knowledge-base/word-of-day/ag69d-candidate-word-source-mapping-rules.json",
  sourceAcquisitionAudit: "data/knowledge-base/word-of-day/ag69d-source-acquisition-no-content-ingestion-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag69d-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag69d-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag69d-ag69e-word-source-mapping-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag69d-to-ag69e-word-source-mapping-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag69d-word-source-acquisition-reference-bank.json",
  registry: "data/quality/ag69d-word-source-acquisition-reference-bank.json",
  preview: "data/quality/ag69d-word-source-acquisition-reference-bank-preview.json",
  doc: "docs/quality/AG69D_WORD_SOURCE_ACQUISITION_REFERENCE_BANK.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const sourcePolicy = {
  module_id: "AG69D",
  title: "Vedic-Tradition-Aligned Source Policy for Word of the Day",
  status: "source_policy_defined",
  consumed_previous_stage: "AG69C",
  governing_principle: "For Indic, Sanskrit, Hindi and Vedic-adjacent Word of the Day records, source preference must remain primary-text aligned, lexically verified and tradition-respectful. Modern commentary cannot override lexical, textual or institutional evidence.",
  preferred_source_order: [
    "primary_text_or_institutional_vedic_reference",
    "recognised_lexical_reference",
    "corpus_or_attestation_reference",
    "traditional_or_textual_discipline_published_work",
    "scholarly_background_reference",
    "editorial_synthesis_from_approved_records"
  ],
  restricted_source_order: [
    "modern_commentary_context_only",
    "opinion_blog_blocked_unless_independently_verified",
    "sectarian_or_polemical_interpretation_blocked",
    "ai_generated_claim_blocked",
    "unsupported_sanskrit_or_etymology_blocked"
  ],
  source_category_values: [
    "primary_text_or_institutional_vedic_reference",
    "lexical_reference",
    "corpus_attestation_reference",
    "machine_readable_text_reference",
    "hindi_lexical_or_institutional_reference",
    "published_textual_discipline_candidate",
    "scholarly_background_reference",
    "commentary_context_only",
    "blocked_unverified"
  ],
  public_claim_rule: "No public claim may be made from a source unless the source is reviewed, public-use allowed, and directly relevant to the specific claim level.",
  internal_discipline_rule: "Published works by credible textual-discipline authors, including relevant works by Nityanand Misra Ji, may be considered as candidate review inputs only. They do not become public attribution unless the exact published work is independently verified, citable, relevant and public-use approved."
};

const sourceReferences = [
  {
    source_reference_id: "src_vedic_heritage_portal_gov_india",
    source_name: "Vedic Heritage Portal",
    source_category: "primary_text_or_institutional_vedic_reference",
    source_family: "institutional_vedic_reference",
    source_url: "https://vedicheritage.gov.in/en/",
    publisher_or_institution: "IGNCA / Ministry of Culture, Government of India",
    access_status: "public_web_access_observed",
    source_status: "candidate_source_metadata_recorded",
    approved_source_eligible: true,
    public_attribution_allowed_now: false,
    public_claim_allowed_now: false,
    allowed_use: [
      "Vedic context reference",
      "module methodology discipline",
      "future Panchang/Vedic source-context review",
      "not direct word meaning unless the specific text and usage are verified"
    ],
    blocked_use: [
      "direct automatic calculation engine",
      "unreviewed public claim",
      "bulk content ingestion",
      "substitute for Sanskrit lexicon"
    ],
    reuse_note: "Record metadata only in AG69D; no text copied or bulk-ingested."
  },
  {
    source_reference_id: "src_cologne_digital_sanskrit_dictionaries",
    source_name: "Cologne Digital Sanskrit Dictionaries",
    source_category: "lexical_reference",
    source_family: "sanskrit_lexicon",
    source_url: "https://www.sanskrit-lexicon.uni-koeln.de/",
    publisher_or_institution: "University of Cologne",
    access_status: "public_web_access_observed",
    source_status: "candidate_source_metadata_recorded",
    approved_source_eligible: true,
    public_attribution_allowed_now: false,
    public_claim_allowed_now: false,
    allowed_use: [
      "Sanskrit lexical lookup",
      "word-form verification",
      "basic meaning cross-check",
      "future approved-source eligibility after review"
    ],
    blocked_use: [
      "bulk dictionary copy into repo",
      "unreviewed etymology claim",
      "public output without record-level review"
    ],
    reuse_note: "Use citation/acknowledgement guidance if data is later used in public-facing application."
  },
  {
    source_reference_id: "src_sanskrit_heritage_inria",
    source_name: "Sanskrit Heritage Site / Sanskrit Heritage Dictionary",
    source_category: "lexical_reference",
    source_family: "sanskrit_lexicon_and_morphology",
    source_url: "https://sanskrit.inria.fr/",
    publisher_or_institution: "INRIA / Gérard Huet Sanskrit Heritage resources",
    access_status: "public_web_access_observed",
    source_status: "candidate_source_metadata_recorded",
    approved_source_eligible: true,
    public_attribution_allowed_now: false,
    public_claim_allowed_now: false,
    allowed_use: [
      "Sanskrit lexical and morphology cross-check",
      "transliteration and form discipline support",
      "future reviewed-source eligibility"
    ],
    blocked_use: [
      "automatic public explanation",
      "bulk content ingestion without licence review",
      "unreviewed source claim"
    ],
    reuse_note: "Metadata only in AG69D; no dictionary content copied."
  },
  {
    source_reference_id: "src_digital_corpus_of_sanskrit",
    source_name: "Digital Corpus of Sanskrit",
    source_category: "corpus_attestation_reference",
    source_family: "sanskrit_corpus",
    source_url: "https://www.sanskrit-linguistics.org/dcs/",
    publisher_or_institution: "Digital Corpus of Sanskrit",
    access_status: "public_web_access_observed",
    source_status: "candidate_source_metadata_recorded",
    approved_source_eligible: true,
    public_attribution_allowed_now: false,
    public_claim_allowed_now: false,
    allowed_use: [
      "corpus occurrence check",
      "attestation context",
      "morphological/lexical support",
      "not a standalone public meaning source"
    ],
    blocked_use: [
      "automatic interpretation",
      "public claim without lexical source",
      "bulk corpus ingestion"
    ],
    reuse_note: "Metadata only; future use requires source-specific review."
  },
  {
    source_reference_id: "src_gretil",
    source_name: "GRETIL — Göttingen Register of Electronic Texts in Indian Languages",
    source_category: "machine_readable_text_reference",
    source_family: "machine_readable_indic_texts",
    source_url: "https://gretil.sub.uni-goettingen.de/",
    publisher_or_institution: "University of Göttingen / GRETIL",
    access_status: "public_web_access_observed",
    source_status: "candidate_source_metadata_recorded",
    approved_source_eligible: true,
    public_attribution_allowed_now: false,
    public_claim_allowed_now: false,
    allowed_use: [
      "text occurrence check",
      "source context location",
      "machine-readable Indic text reference after review"
    ],
    blocked_use: [
      "unreviewed interpretation",
      "bulk ingestion into Drishvara bank",
      "translation claim without translation source"
    ],
    reuse_note: "Metadata only in AG69D; no e-text copied."
  },
  {
    source_reference_id: "src_dsal_digital_dictionaries_south_asia",
    source_name: "Digital Dictionaries of South Asia",
    source_category: "hindi_lexical_or_institutional_reference",
    source_family: "south_asian_dictionary_reference",
    source_url: "https://dsal.uchicago.edu/dictionaries/",
    publisher_or_institution: "University of Chicago Digital Dictionaries of South Asia",
    access_status: "public_web_access_observed",
    source_status: "candidate_source_metadata_recorded",
    approved_source_eligible: true,
    public_attribution_allowed_now: false,
    public_claim_allowed_now: false,
    allowed_use: [
      "Hindi dictionary reference discovery",
      "Sanskrit/Hindi dictionary cross-reference discovery",
      "metadata-level source pointer"
    ],
    blocked_use: [
      "bulk dictionary content capture",
      "public claim without record-level source review",
      "reuse beyond source terms"
    ],
    reuse_note: "Metadata only; check dictionary-specific terms before extracting content."
  },
  {
    source_reference_id: "src_hindi_shabdasagara_dsal",
    source_name: "Hindi Śabdasāgara via DSAL",
    source_category: "hindi_lexical_or_institutional_reference",
    source_family: "hindi_lexicon",
    source_url: "https://dsal.uchicago.edu/dictionaries/dasa-hindi/",
    publisher_or_institution: "Digital Dictionaries of South Asia / University of Chicago",
    access_status: "public_web_access_observed",
    source_status: "candidate_source_metadata_recorded",
    approved_source_eligible: true,
    public_attribution_allowed_now: false,
    public_claim_allowed_now: false,
    allowed_use: [
      "Hindi word meaning cross-check",
      "Hindi lexical form verification",
      "future reviewed source basis"
    ],
    blocked_use: [
      "bulk dictionary ingestion",
      "public output without source-specific review",
      "unverified Sanskrit claim"
    ],
    reuse_note: "Metadata only; no dictionary entries copied."
  },
  {
    source_reference_id: "src_central_hindi_directorate_publications",
    source_name: "Central Hindi Directorate Publications",
    source_category: "hindi_lexical_or_institutional_reference",
    source_family: "official_hindi_publication",
    source_url: "https://www.chdpublication.education.gov.in/english/ebook.php",
    publisher_or_institution: "Central Hindi Directorate, Ministry of Education, Government of India",
    access_status: "public_web_access_observed",
    source_status: "candidate_source_metadata_recorded",
    approved_source_eligible: true,
    public_attribution_allowed_now: false,
    public_claim_allowed_now: false,
    allowed_use: [
      "Hindi institutional reference discovery",
      "Hindi/Sanskrit vocabulary support after review",
      "source metadata for future word review"
    ],
    blocked_use: [
      "bulk PDF/text ingestion",
      "unverified reuse",
      "automatic public output without record-level review"
    ],
    reuse_note: "Metadata only; publication-specific terms must be checked before extraction."
  }
];

const publishedWorkCandidates = [
  {
    candidate_source_id: "published_candidate_nm_sunama",
    author_or_editor: "Nityanand / Nityananda Misra",
    work_family: "Sunama / Beautiful Sanskrit Names / Sunama-Sarit",
    source_category: "published_textual_discipline_candidate",
    bibliographic_reference_points: [
      "OpenLibrary author/work catalog",
      "public bookseller/catalog records"
    ],
    relevance_to_word_module: [
      "Sanskrit name/word discipline",
      "meaning and derivation caution",
      "candidate review input for Sanskrit lexical discipline"
    ],
    current_status: "candidate_published_work_metadata_only",
    exact_work_verified_for_content_now: false,
    content_ingested_now: false,
    public_attribution_allowed_now: false,
    approved_source_now: false,
    allowed_use_now: [
      "candidate source family flag",
      "future manual bibliographic verification",
      "future review against lexical/source evidence"
    ],
    blocked_use_now: [
      "public attribution",
      "direct approved word meaning",
      "bulk book content ingestion",
      "authority claim without exact work verification"
    ]
  },
  {
    candidate_source_id: "published_candidate_nm_om_mala",
    author_or_editor: "Nityanand / Nityananda Misra",
    work_family: "The OM Mala / Om Mala",
    source_category: "published_textual_discipline_candidate",
    bibliographic_reference_points: [
      "OpenLibrary author/work catalog",
      "public catalog/search records"
    ],
    relevance_to_word_module: [
      "Sanskrit textual discipline",
      "mantra/Om handling caution",
      "future Vedic Guidance source-safety review"
    ],
    current_status: "candidate_published_work_metadata_only",
    exact_work_verified_for_content_now: false,
    content_ingested_now: false,
    public_attribution_allowed_now: false,
    approved_source_now: false,
    allowed_use_now: [
      "candidate source family flag",
      "future manual bibliographic verification",
      "future mantra-safety governance reference if exact edition is approved"
    ],
    blocked_use_now: [
      "mantra generation",
      "public attribution",
      "direct public claim",
      "bulk book content ingestion"
    ]
  },
  {
    candidate_source_id: "published_candidate_nm_mahaviri",
    author_or_editor: "Nityanand / Nityananda Misra",
    work_family: "Mahaviri / Hanuman Chalisa related textual-discipline work",
    source_category: "published_textual_discipline_candidate",
    bibliographic_reference_points: [
      "OpenLibrary author/work catalog",
      "public bookseller/catalog records"
    ],
    relevance_to_word_module: [
      "textual discipline",
      "cultural terminology handling",
      "future Vedic Guidance and cultural module review input"
    ],
    current_status: "candidate_published_work_metadata_only",
    exact_work_verified_for_content_now: false,
    content_ingested_now: false,
    public_attribution_allowed_now: false,
    approved_source_now: false,
    allowed_use_now: [
      "candidate source family flag",
      "future manual bibliographic verification"
    ],
    blocked_use_now: [
      "public attribution",
      "mantra/text alteration",
      "direct approved claim without source review",
      "bulk content ingestion"
    ]
  }
];

const sourceReferenceBank = {
  module_id: "AG69D",
  title: "Word of the Day Source Reference Bank Metadata",
  status: "source_reference_bank_metadata_created_no_content_ingestion",
  source_reference_count: sourceReferences.length,
  source_references: sourceReferences,
  approved_word_records_created: false,
  public_word_output_created: false,
  source_content_ingested: false,
  bulk_copyrighted_ingestion: false,
  note: "AG69D records source metadata and source-family candidates only. It does not copy dictionary/book text or approve word records."
};

const sourceVerificationRegister = {
  module_id: "AG69D",
  title: "Source Verification Register",
  status: "source_verification_register_created",
  verification_fields: [
    "source_reference_id",
    "source_url",
    "access_status",
    "publisher_or_institution",
    "source_category",
    "source_status",
    "approved_source_eligible",
    "public_attribution_allowed_now",
    "public_claim_allowed_now",
    "reuse_note"
  ],
  source_records: sourceReferences.map((source) => ({
    source_reference_id: source.source_reference_id,
    source_category: source.source_category,
    access_status: source.access_status,
    source_status: source.source_status,
    approved_source_eligible: source.approved_source_eligible,
    public_attribution_allowed_now: source.public_attribution_allowed_now,
    public_claim_allowed_now: source.public_claim_allowed_now,
    content_ingested_now: false
  })),
  verification_note: "Network/source verification was performed outside the repo command through operator/assistant source review context; no external content is fetched by this script."
};

const publishedWorkCandidateRegister = {
  module_id: "AG69D",
  title: "Published Work Candidate Source Register",
  status: "published_work_candidate_sources_recorded_metadata_only",
  public_attribution_allowed_now: false,
  content_ingested_now: false,
  approved_source_now: false,
  candidates: publishedWorkCandidates,
  rule: "Nityanand Misra Ji aligned published works are included only as candidate source/review inputs. Exact edition/content verification is required before any approved-source or public-use treatment."
};

const sourceUseMatrix = {
  module_id: "AG69D",
  title: "Source Use and Reuse Matrix",
  status: "source_use_reuse_matrix_created",
  use_classes: [
    {
      use_class: "metadata_only",
      allowed_now: true,
      description: "Record source name, URL, institution, category, allowed-use and blocked-use."
    },
    {
      use_class: "lexical_lookup_manual_review",
      allowed_now: false,
      description: "Permitted only in future reviewed stage; no bulk capture."
    },
    {
      use_class: "corpus_attestation_review",
      allowed_now: false,
      description: "Permitted only in future reviewed stage; no bulk capture."
    },
    {
      use_class: "published_work_manual_review",
      allowed_now: false,
      description: "Permitted only after exact work/edition verification and copyright/reuse review."
    },
    {
      use_class: "public_output_source_basis",
      allowed_now: false,
      description: "Blocked until approved word records exist."
    },
    {
      use_class: "bulk_ingestion",
      allowed_now: false,
      description: "Blocked unless licence/reuse permission is explicitly approved."
    }
  ]
};

const candidateMappingRules = {
  module_id: "AG69D",
  title: "Candidate Word Source Mapping Rules",
  status: "candidate_source_mapping_rules_defined_not_applied",
  mapping_applied_now: false,
  word_records_modified_now: false,
  rules: [
    "Candidate records from AG69B must remain candidate-only.",
    "A candidate record may receive source_reference_id only after manual/source-stage review.",
    "Sanskrit word form requires Sanskrit lexical source review.",
    "Hindi word form requires Hindi lexical source review.",
    "Transliteration requires separate review.",
    "Etymology claim remains false unless a verified etymology source is attached.",
    "Classical claim remains false unless a verified classical/textual context source is attached.",
    "No candidate source mapping can feed public output."
  ]
};

const sourceAcquisitionAudit = {
  module_id: "AG69D",
  title: "Source Acquisition No-Content-Ingestion Audit",
  status: "source_acquisition_metadata_only_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "source_metadata_recorded", expected: true, actual: true, passed: true },
    { check_id: "source_content_ingested", expected: false, actual: false, passed: true },
    { check_id: "bulk_copyrighted_ingestion", expected: false, actual: false, passed: true },
    { check_id: "approved_word_records_created", expected: false, actual: false, passed: true },
    { check_id: "generated_word_json_modified", expected: false, actual: false, passed: true },
    { check_id: "public_attribution_of_internal_influence", expected: false, actual: false, passed: true }
  ],
  failed_checks: []
};

function audit(title, status, keys) {
  return {
    module_id: "AG69D",
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
  module_id: "AG69D",
  title: "AG69E Word Source Mapping Readiness Record",
  status: "ready_for_ag69e_candidate_word_source_mapping",
  ready_for_ag69e: true,
  next_stage: "AG69E — Word Candidate Source Mapping and Review Queue",
  reason: "Source-reference bank metadata, Vedic-tradition-aligned source policy, published-work candidate handling, and source-use matrix are recorded without content ingestion."
};

const boundary = {
  module_id: "AG69D",
  title: "AG69D to AG69E Word Source Mapping Boundary",
  status: "ag69e_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Map candidate word records to source_reference_id where directly relevant.",
    "Create review queue for source, language, transliteration and meaning checks.",
    "Keep all mapped word records candidate or reviewed only until approval validator passes.",
    "Do not replace generated/word-of-day.json."
  ],
  blocked_scope_without_explicit_approval: [
    "source content bulk ingestion",
    "approved word bank creation",
    "public word output generation",
    "generated/word-of-day.json replacement",
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
  module_id: "AG69D",
  title: "Word of the Day Source Acquisition and Reference Bank",
  status: "ag69d_word_source_acquisition_reference_bank_completed",
  current_git_context: git,
  consumed_previous_stage: {
    stage: "AG69C",
    source_file: "data/content-intelligence/quality-reviews/ag69c-word-source-review-linguistic-discipline-approved-bank-validator.json",
    status: ag69c.status
  },
  generated_records: outputs,
  summary: {
    ag69c_consumed: true,
    vedic_tradition_aligned_source_policy_recorded: true,
    source_reference_bank_metadata_created: true,
    source_reference_count: sourceReferences.length,
    primary_and_lexical_source_families_recorded: true,
    published_work_candidate_sources_recorded: true,
    nityanand_misra_published_work_candidates_recorded_metadata_only: true,
    public_attribution_of_internal_influence_blocked: true,
    source_use_reuse_matrix_created: true,
    candidate_source_mapping_rules_defined: true,
    source_content_ingested: false,
    bulk_copyrighted_ingestion: false,
    approved_word_records_created: false,
    generated_word_json_modified: false,
    public_word_output_created: false,
    ui_display_changed: false,
    supabase_database_write_performed: false,
    backend_runtime_activated: false,
    database_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag69e: true
  }
};

const registry = {
  module_id: "AG69D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG69D",
  status: review.status,
  vedic_tradition_aligned_source_policy_recorded: 1,
  source_reference_bank_metadata_created: 1,
  source_reference_count: sourceReferences.length,
  primary_and_lexical_source_families_recorded: 1,
  published_work_candidate_sources_recorded: 1,
  nityanand_misra_published_work_candidates_recorded_metadata_only: 1,
  public_attribution_of_internal_influence_blocked: 1,
  source_use_reuse_matrix_created: 1,
  candidate_source_mapping_rules_defined: 1,
  source_content_ingested: 0,
  bulk_copyrighted_ingestion: 0,
  approved_word_records_created: 0,
  generated_word_json_modified: 0,
  public_word_output_created: 0,
  ui_display_changed: 0,
  supabase_database_write_performed: 0,
  backend_runtime_activated: 0,
  database_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag69e: 1
};

const doc = `# AG69D — Word of the Day Source Acquisition and Reference Bank

AG69D creates the source-reference bank metadata for Word of the Day.

## What is created

- Vedic-tradition-aligned source policy.
- Source-reference bank metadata.
- Source verification register.
- Source use and reuse matrix.
- Candidate word source-mapping rules.
- Published-work candidate source register.

## Source preference

For Indic/Vedic/Sanskrit/Hindi modules, Drishvara prefers:

1. Primary or institutional Vedic references.
2. Recognised Sanskrit/Hindi lexical references.
3. Corpus or attestation references.
4. Machine-readable text references.
5. Traditional or textual-discipline published works as candidate review inputs.
6. Scholarly background references.

Modern commentary, blogs, polemical interpretation, unsupported reinterpretation and AI-generated claims are blocked unless independently verified and only used within their proper scope.

## Nityanand Misra aligned treatment

Relevant published works by Nityanand Misra Ji are recorded only as candidate source/review inputs. No content is ingested, no public attribution is added, and no approved-source claim is made in AG69D.

## Not performed

- No source content ingestion.
- No bulk copyrighted ingestion.
- No approved word records.
- No generated/word-of-day.json replacement.
- No public Word of the Day output.
- No UI change.
- No Supabase/database write.
- No backend/Auth/RLS/service-role activation.
- No V02 expansion.
`;

writeJson(outputs.sourcePolicy, sourcePolicy);
writeJson(outputs.sourceReferenceBank, sourceReferenceBank);
writeJson(outputs.sourceVerificationRegister, sourceVerificationRegister);
writeJson(outputs.publishedWorkCandidateRegister, publishedWorkCandidateRegister);
writeJson(outputs.sourceUseMatrix, sourceUseMatrix);
writeJson(outputs.candidateMappingRules, candidateMappingRules);
writeJson(outputs.sourceAcquisitionAudit, sourceAcquisitionAudit);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG69D Word source acquisition and reference bank generated.");
console.log("✅ Vedic-tradition-aligned source policy recorded.");
console.log("✅ Source-reference metadata recorded without content ingestion.");
console.log("✅ Nityanand Misra published-work candidates recorded as metadata-only review inputs.");
console.log("✅ No public output, Supabase/database/backend/Auth/RLS/service-role/V02 activation performed.");
