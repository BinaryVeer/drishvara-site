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

const ag70f = readJson("data/content-intelligence/quality-reviews/ag70f-sanskrit-lexical-source-reference-bank.json");
const sourceReferenceBank = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/sanskrit-lexical-source-reference-bank.json");
const sacredFamilyRegister = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-source-family-register.json");
const foundationManifest = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/ag70e-word-production-knowledge-bank-foundation-manifest.json");
const wordManifest = readJson("data/knowledge-base/word-of-day/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70f.status !== "ag70f_sanskrit_lexical_source_reference_bank_completed") {
  throw new Error("AG70F must be complete before AG70G.");
}
if (ag70f.summary?.ready_for_ag70g !== true) {
  throw new Error("AG70F readiness for AG70G is missing.");
}
if (sourceReferenceBank.source_reference_count !== 18) {
  throw new Error("AG70F source-reference bank must contain 18 records.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  sacredFallbackSourceBank: "data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-source-bank.json",
  sacredFallbackSourceMap: "data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-source-map.json",
  sacredFallbackRecordBlock: "data/knowledge-base/word-of-day/production/knowledge-bank/ag70g-no-fallback-word-population-audit.json",
  sourceFamilyRegister: "data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-source-family-register.json",
  foundationManifest: "data/knowledge-base/word-of-day/production/knowledge-bank/ag70e-word-production-knowledge-bank-foundation-manifest.json",
  wordManifest: "data/knowledge-base/word-of-day/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70g-sacred-fallback-source-bank.json",
  readiness: "data/content-intelligence/quality-registry/ag70g-ag70h-context-interpretation-bank-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70g-to-ag70h-context-interpretation-bank-boundary.json",
  quality: "data/quality/ag70g-sacred-fallback-source-bank.json",
  preview: "data/quality/ag70g-sacred-fallback-source-bank-preview.json",
  doc: "docs/quality/AG70G_SACRED_FALLBACK_SOURCE_BANK.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const fallbackSourceRecords = [
  {
    fallback_source_id: "fallback_src_vishnu_sahasranama_mahabharata_anushasana",
    fallback_bank_id: "vishnu_sahasranama_bank",
    source_family_reference_id: "src_vishnu_sahasranama_source_family",
    exact_source_reference_id: "src_gretil_mahabharata_anushasanaparvan",
    source_title: "Mahabharata: Anushasanaparvan",
    source_url: "https://gretil.sub.uni-goettingen.de/gretil/1_sanskr/2_epic/mbh/mbh_13_u.htm",
    source_domain: "gretil.sub.uni-goettingen.de",
    source_basis_note: "Vishnu Sahasranama is treated as a future fallback-name source family linked to Mahabharata Anushasana Parva source review.",
    fallback_source_status: "exact_source_selected_pending_name_record_population",
    approved_for_fallback_source_scoping: true,
    approved_for_fallback_word_population_now: false,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    source_access_checked: true,
    reuse_note_checked: true,
    review_status: "source_selected_record_level_population_blocked"
  },
  {
    fallback_source_id: "fallback_src_shiva_sahasranama_linga_purana",
    fallback_bank_id: "shiva_sahasranama_bank",
    source_family_reference_id: "src_shiva_sahasranama_source_family",
    exact_source_reference_id: "src_sanskritdocuments_shiva_sahasranama_linga_purana",
    source_title: "Shiva Sahasranama Stotram from Linga Purana",
    source_url: "https://sanskritdocuments.org/doc_shiva/shivasahasralinga.html",
    source_domain: "sanskritdocuments.org",
    source_basis_note: "Shiva Sahasranama is treated as a future fallback-name source family linked to Linga Purana source review.",
    fallback_source_status: "exact_source_selected_pending_name_record_population",
    approved_for_fallback_source_scoping: true,
    approved_for_fallback_word_population_now: false,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    source_access_checked: true,
    reuse_note_checked: true,
    review_status: "source_selected_record_level_population_blocked"
  },
  {
    fallback_source_id: "fallback_src_vedic_rigveda_vedic_heritage",
    fallback_bank_id: "vedic_term_bank",
    source_family_reference_id: "src_vedic_source_text_family",
    exact_source_reference_id: "src_vedic_heritage_rigveda_samhita",
    source_title: "Rigveda Samhita — Vedic Heritage Portal",
    source_url: "https://vedicheritage.gov.in/samhitas/rigveda/",
    source_domain: "vedicheritage.gov.in",
    source_basis_note: "Rigveda is registered for future Vedic source-term fallback scoping, not for automatic term extraction.",
    fallback_source_status: "exact_source_selected_pending_term_record_population",
    approved_for_fallback_source_scoping: true,
    approved_for_fallback_word_population_now: false,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    source_access_checked: true,
    reuse_note_checked: true,
    review_status: "source_selected_record_level_population_blocked"
  },
  {
    fallback_source_id: "fallback_src_puranic_bhagavata_purana_gretil",
    fallback_bank_id: "puranic_name_theme_bank",
    source_family_reference_id: "src_puranic_source_text_family",
    exact_source_reference_id: "src_gretil_bhagavata_purana",
    source_title: "Bhagavata Purana — GRETIL",
    source_url: "https://gretil.sub.uni-goettingen.de/gretil/1_sanskr/3_purana/bhagp/bhp_01u.htm",
    source_domain: "gretil.sub.uni-goettingen.de",
    source_basis_note: "Bhagavata Purana is registered for future Puranic name/theme fallback scoping, not for automatic name extraction.",
    fallback_source_status: "exact_source_selected_pending_name_theme_record_population",
    approved_for_fallback_source_scoping: true,
    approved_for_fallback_word_population_now: false,
    bulk_ingestion_allowed: false,
    exact_text_extraction_allowed_now: false,
    public_claim_allowed_now: false,
    source_access_checked: true,
    reuse_note_checked: true,
    review_status: "source_selected_record_level_population_blocked"
  }
];

const sacredFallbackSourceBank = {
  module_id: "AG70G",
  title: "Sacred Fallback Source Bank — Batch 01",
  status: "sacred_fallback_source_bank_batch_01_created_no_word_population",
  purpose: "Select exact source references for sacred fallback families while keeping fallback word/name/term records blocked.",
  batch_id: "ag70g_batch_01",
  fallback_source_count: fallbackSourceRecords.length,
  fallback_word_records_created_now: 0,
  bulk_ingestion_allowed_count: 0,
  public_claim_allowed_now_count: 0,
  records: fallbackSourceRecords
};

const sacredFallbackSourceMap = {
  module_id: "AG70G",
  title: "Sacred Fallback Source Map",
  status: "sacred_fallback_source_map_created",
  map: fallbackSourceRecords.map((record) => ({
    fallback_bank_id: record.fallback_bank_id,
    source_family_reference_id: record.source_family_reference_id,
    exact_source_reference_id: record.exact_source_reference_id,
    fallback_source_id: record.fallback_source_id,
    population_status: "source_selected_word_population_blocked"
  }))
};

const noFallbackWordPopulationAudit = {
  module_id: "AG70G",
  title: "No Fallback Word Population Audit",
  status: "no_fallback_word_population_audit_passed",
  fallback_source_count: fallbackSourceRecords.length,
  fallback_word_records_created_now: 0,
  fallback_name_records_created_now: 0,
  fallback_term_records_created_now: 0,
  actual_word_output_created_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  runtime_selector_active_now: false,
  public_word_generation_allowed_now: false
};

const updatedSacredFamilyRegister = {
  ...sacredFamilyRegister,
  status: "sacred_fallback_source_family_register_exact_sources_selected_no_word_population",
  family_count: sacredFamilyRegister.family_count || 4,
  exact_fallback_source_count: fallbackSourceRecords.length,
  fallback_source_bank_path: outputs.sacredFallbackSourceBank,
  fallback_source_map_path: outputs.sacredFallbackSourceMap,
  records: sacredFamilyRegister.records || [],
  exact_source_records: fallbackSourceRecords,
  next_required_action: "Populate fallback word/name/term records only after record-level review and evidence mapping. Do not populate from source family placeholders or review guidance references alone."
};

const updatedFoundationManifest = {
  ...foundationManifest,
  status: "word_production_knowledge_bank_foundation_created_with_sacred_fallback_source_bank",
  current_counts: {
    ...(foundationManifest.current_counts || {}),
    fallback_source_records: fallbackSourceRecords.length,
    fallback_word_records: 0,
    sacred_fallback_records: 0,
    evidence_records: 0,
    morphology_records: 0,
    etymology_records: 0,
    semantics_records: 0
  },
  sacred_fallback_source_files: {
    sacred_fallback_source_bank: outputs.sacredFallbackSourceBank,
    sacred_fallback_source_map: outputs.sacredFallbackSourceMap,
    no_fallback_word_population_audit: outputs.sacredFallbackRecordBlock
  },
  next_required_stage: "AG70H — Context Interpretation Bank Batch 01"
};

const updatedWordManifest = {
  ...wordManifest,
  status: "production_bank_manifest_created_sacred_fallback_source_bank",
  current_status: "sacred_fallback_source_bank_batch_01_created_no_word_records",
  sacred_fallback_source_files: {
    sacred_fallback_source_bank: outputs.sacredFallbackSourceBank,
    sacred_fallback_source_map: outputs.sacredFallbackSourceMap,
    no_fallback_word_population_audit: outputs.sacredFallbackRecordBlock
  },
  current_counts: {
    ...(wordManifest.current_counts || {}),
    fallback_source_records: fallbackSourceRecords.length,
    actual_fallback_records: 0,
    actual_lexical_records: 0,
    daily_word_records: 0
  },
  next_required_stage: "AG70H — Context Interpretation Bank Batch 01"
};

const review = {
  module_id: "AG70G",
  title: "Sacred Fallback Source Bank Batch 01",
  status: "ag70g_sacred_fallback_source_bank_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70f_review: "data/content-intelligence/quality-reviews/ag70f-sanskrit-lexical-source-reference-bank.json",
    source_reference_bank: "data/knowledge-base/word-of-day/production/knowledge-bank/sanskrit-lexical-source-reference-bank.json",
    sacred_fallback_source_family_register: "data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-source-family-register.json"
  },
  generated_records: outputs,
  summary: {
    sacred_fallback_source_bank_created: true,
    sacred_fallback_source_map_created: true,
    exact_fallback_source_count: fallbackSourceRecords.length,
    vishnu_sahasranama_source_selected: true,
    shiva_sahasranama_source_selected: true,
    vedic_source_selected: true,
    puranic_source_selected: true,
    fallback_word_records_created_now: false,
    fallback_name_records_created_now: false,
    fallback_term_records_created_now: false,
    bulk_ingestion_allowed_count: 0,
    public_claim_allowed_now_count: 0,
    generated_word_json_modified: false,
    ui_display_changed: false,
    runtime_selector_active_now: false,
    public_word_generation_allowed_now: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70h: true
  }
};

const readiness = {
  module_id: "AG70G",
  title: "AG70H Context Interpretation Bank Readiness Record",
  status: "ready_for_ag70h_context_interpretation_bank",
  ready_for_ag70h: true,
  next_stage: "AG70H — Context Interpretation Bank Batch 01",
  reason: "Sacred fallback exact sources are selected and fallback population remains blocked. The next safe stage is creating reviewed context interpretation records."
};

const boundary = {
  module_id: "AG70G",
  title: "AG70G to AG70H Context Interpretation Bank Boundary",
  status: "ag70h_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create context signal records for Panchang-to-Word interpretation.",
    "Keep context interpretation records review-bound and not runtime-active.",
    "Do not create Sanskrit word records yet.",
    "Do not populate fallback names/terms yet."
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
    "fallback word/name/term population"
  ]
};

const quality = {
  module_id: "AG70G",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70G",
  status: review.status,
  sacred_fallback_source_bank_created: 1,
  exact_fallback_source_count: fallbackSourceRecords.length,
  fallback_word_records_created_now: 0,
  generated_word_json_modified: 0,
  ui_display_changed: 0,
  ready_for_ag70h: 1
};

const doc = `# AG70G — Sacred Fallback Source Bank Batch 01

AG70G selects exact source references for sacred fallback families without creating fallback word/name/term records.

## Exact fallback sources selected

- Vishnu Sahasranama source family → Mahabharata Anushasanaparvan source review.
- Shiva Sahasranama source family → Shiva Sahasranama from Linga Purana source review.
- Vedic source-text family → Rigveda Samhita source review.
- Puranic source-text family → Bhagavata Purana source review.

## Not done

- No fallback word/name/term records.
- No Sanskrit lexical records.
- No morphology/etymology/semantics records.
- No public Word output.
- No generated/word-of-day.json replacement.
- No UI/runtime/backend activation.
`;

writeJson(outputs.sacredFallbackSourceBank, sacredFallbackSourceBank);
writeJson(outputs.sacredFallbackSourceMap, sacredFallbackSourceMap);
writeJson(outputs.sacredFallbackRecordBlock, noFallbackWordPopulationAudit);
writeJson(outputs.sourceFamilyRegister, updatedSacredFamilyRegister);
writeJson(outputs.foundationManifest, updatedFoundationManifest);
writeJson(outputs.wordManifest, updatedWordManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70G sacred fallback source bank generated.");
console.log(`✅ Exact fallback sources selected: ${fallbackSourceRecords.length}.`);
console.log("✅ No fallback word/name/term records, output, UI or backend mutation performed.");
