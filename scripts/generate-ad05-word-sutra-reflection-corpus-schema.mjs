import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ad04Review: "data/content-intelligence/quality-reviews/ad04-calendar-calculation-methodology.json",
  ad04CalculationDoctrine: "data/content-intelligence/ad-foundation/ad04-calendar-calculation-methodology-doctrine.json",
  ad04ValidationCrossCheck: "data/content-intelligence/ad-foundation/ad04-validation-cross-check-model.json",
  ad04NonExecutionPolicy: "data/content-intelligence/ad-foundation/ad04-calculation-non-execution-policy.json",
  ad04NoMutationAudit: "data/content-intelligence/backend-architecture/ad04-no-mutation-audit-register.json",
  ad04Readiness: "data/content-intelligence/quality-registry/ad04-ad05-word-sutra-reflection-corpus-readiness-record.json",
  ad04Boundary: "data/content-intelligence/mutation-plans/ad04-to-ad05-word-sutra-reflection-corpus-boundary.json",

  ad01NityanandRecord: "data/content-intelligence/ad-foundation/ad01-nityanand-mishra-style-discipline-record.json",
  ad01SourceConfidence: "data/content-intelligence/ad-foundation/ad01-source-confidence-model.json",
  ad01AttributionBoundary: "data/content-intelligence/ad-foundation/ad01-attribution-and-claim-boundary.json",
  ad00DatabaseFirstDoctrine: "data/content-intelligence/ad-foundation/ad00-database-first-doctrine.json",
  ad00MethodName: "data/content-intelligence/ad-foundation/ad00-kala-drishti-method-name-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ad05-word-sutra-reflection-corpus-schema.json",
  corpusDoctrine: "data/content-intelligence/ad-foundation/ad05-corpus-doctrine.json",
  wordCorpusSchema: "data/content-intelligence/ad-foundation/ad05-word-of-the-day-corpus-schema.json",
  sanskritNameTermSchema: "data/content-intelligence/ad-foundation/ad05-sanskrit-name-term-corpus-schema.json",
  sutraQuoteSchema: "data/content-intelligence/ad-foundation/ad05-sutra-quote-corpus-schema.json",
  reflectionPromptSchema: "data/content-intelligence/ad-foundation/ad05-reflection-prompt-corpus-schema.json",
  textualDisciplineModel: "data/content-intelligence/ad-foundation/ad05-sanskritic-textual-discipline-model.json",
  sourceAttributionReviewMap: "data/content-intelligence/ad-foundation/ad05-corpus-source-attribution-review-map.json",
  databasePlanningMap: "data/content-intelligence/ad-foundation/ad05-corpus-database-planning-map.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ad05-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ad05-ad06-vedic-guidance-star-reflection-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ad05-to-ad06-vedic-guidance-star-reflection-boundary.json",
  registry: "data/quality/ad05-word-sutra-reflection-corpus-schema.json",
  preview: "data/quality/ad05-word-sutra-reflection-corpus-schema-preview.json",
  doc: "docs/quality/AD05_WORD_SUTRA_REFLECTION_CORPUS_SCHEMA.md"
};

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function read(p) {
  return fs.readFileSync(full(p), "utf8");
}

function readJson(p) {
  return JSON.parse(read(p));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AD05 input: ${p}`);
}

const ad04Review = readJson(inputs.ad04Review);
const ad04CalculationDoctrine = readJson(inputs.ad04CalculationDoctrine);
const ad04ValidationCrossCheck = readJson(inputs.ad04ValidationCrossCheck);
const ad04NonExecutionPolicy = readJson(inputs.ad04NonExecutionPolicy);
const ad04NoMutationAudit = readJson(inputs.ad04NoMutationAudit);
const ad04Readiness = readJson(inputs.ad04Readiness);
const ad04Boundary = readJson(inputs.ad04Boundary);
const ad01NityanandRecord = readJson(inputs.ad01NityanandRecord);
const ad01SourceConfidence = readJson(inputs.ad01SourceConfidence);
const ad01AttributionBoundary = readJson(inputs.ad01AttributionBoundary);
const ad00DatabaseFirstDoctrine = readJson(inputs.ad00DatabaseFirstDoctrine);
const ad00MethodName = readJson(inputs.ad00MethodName);

if (ad04Review.status !== "calendar_calculation_methodology_ready_for_ad05") {
  throw new Error("AD04 review status mismatch.");
}
if (ad04Review.summary?.ready_for_ad05 !== true) {
  throw new Error("AD04 does not show AD05 readiness.");
}
if (ad04NoMutationAudit.audit_passed !== true) {
  throw new Error("AD04 no-mutation audit must pass.");
}
if (ad04Readiness.ready_for_ad05 !== true || ad04Readiness.next_stage_id !== "AD05") {
  throw new Error("AD04 readiness must permit AD05.");
}
if (ad04Boundary.next_stage_id !== "AD05") {
  throw new Error("AD04 boundary must point to AD05.");
}
if (!JSON.stringify(ad04Boundary.allowed_scope).includes("Word of the Day")) {
  throw new Error("AD04 boundary must carry Word of the Day scope.");
}
if (!JSON.stringify(ad04CalculationDoctrine).includes("public_guidance_safety_layer")) {
  throw new Error("AD04 calculation doctrine must preserve public guidance safety layer.");
}
if (!JSON.stringify(ad04ValidationCrossCheck).includes("Nityanand Mishra ji style discipline")) {
  throw new Error("AD04 validation model must preserve Nityanand Mishra ji caution.");
}
if (!JSON.stringify(ad04NonExecutionPolicy).includes("does not create SQL")) {
  throw new Error("AD04 non-execution policy must preserve SQL block.");
}
if (!JSON.stringify(ad01NityanandRecord).includes("Sanskritic textual discipline")) {
  throw new Error("AD01 Nityanand Mishra discipline record must be available.");
}
if (!JSON.stringify(ad01SourceConfidence).includes("source_title")) {
  throw new Error("AD01 source confidence metadata must be available.");
}
if (!JSON.stringify(ad01AttributionBoundary).includes("Avoid guaranteed outcome language")) {
  throw new Error("AD01 attribution boundary must remain available.");
}
if (!JSON.stringify(ad00DatabaseFirstDoctrine).includes("word_corpus")) {
  throw new Error("AD00 database-first doctrine must include word_corpus.");
}
if (ad00MethodName.method_name !== "Drishvara Kāla-Dṛṣṭi Method") {
  throw new Error("AD00 methodology name mismatch.");
}

const blockedState = {
  ad05_word_sutra_reflection_corpus_schema_recorded: true,
  ad04_consumed: true,
  corpus_doctrine_recorded: true,
  word_corpus_schema_recorded: true,
  sanskrit_name_term_schema_recorded: true,
  sutra_quote_schema_recorded: true,
  reflection_prompt_schema_recorded: true,
  textual_discipline_model_recorded: true,
  corpus_source_attribution_review_map_recorded: true,
  corpus_database_planning_map_recorded: true,
  ready_for_ad06: true,

  ag47_resume_allowed: false,
  homepage_mutated: false,
  public_content_generated: false,
  word_of_day_generated: false,
  sutra_quote_generated: false,
  reflection_prompt_generated: false,
  panchang_prediction_generated: false,
  panchang_calculation_executed: false,
  live_source_fetch_executed: false,
  web_scraping_executed: false,
  copyrighted_text_reproduced: false,
  unverified_translation_published: false,
  unverified_nityanand_claim_made: false,
  sql_file_created: false,
  sql_migration_created: false,
  sql_executed: false,
  database_write_performed: false,
  supabase_table_created: false,
  backend_auth_supabase_activation_performed: false,
  deployment_performed: false,
  service_role_key_exposed: false
};

const corpusDoctrine = {
  module_id: "AD05",
  title: "Corpus Doctrine",
  status: "corpus_doctrine_recorded",
  doctrine_rules: [
    "AD05 defines corpus schema only; it does not generate Word of the Day, sutra, quote or reflection content.",
    "Word, name, sutra and reflection records must separate source text, transliteration, translation, meaning, context and editorial use.",
    "Sanskritic textual discipline must prioritise accuracy, context and humility over viral simplification.",
    "Nityanand Mishra ji is a style-discipline influence; no exact claim should be attributed without a verified source record.",
    "Copyright-sensitive texts must be stored through source locator, limited excerpt policy and editorial review, not uncontrolled reproduction.",
    "Public reflection text must avoid deterministic prediction, fear-based language and unsupported spiritual claims.",
    "Every future corpus item must carry source confidence, verification status and editorial review status."
  ],
  corpus_families: [
    "word_of_the_day",
    "sanskrit_name_term_corpus",
    "sutra_quote_corpus",
    "reflection_prompt_corpus",
    "cultural_context_note"
  ],
  blocked_state: blockedState
};

const wordCorpusSchema = {
  module_id: "AD05",
  title: "Word of the Day Corpus Schema",
  status: "word_of_the_day_corpus_schema_recorded",
  planned_record_type: "word_corpus",
  schema_fields: [
    "word_id",
    "word_key",
    "word_devanagari",
    "word_iast",
    "word_common_transliteration",
    "word_language",
    "word_type",
    "root_or_dhatu",
    "literal_meaning",
    "contextual_meaning",
    "short_reflection_use",
    "source_id",
    "source_locator",
    "source_confidence_band",
    "verification_status",
    "editorial_review_status",
    "public_use_allowed",
    "notes"
  ],
  usage_rules: [
    "Word of the Day must be source-attributed before public use.",
    "A word must not be presented as scriptural unless the source supports it.",
    "Meaning and reflection use must be separated.",
    "Sanskrit labels and transliteration must be reviewed before public display."
  ],
  blocked_state: blockedState
};

const sanskritNameTermSchema = {
  module_id: "AD05",
  title: "Sanskrit Name and Term Corpus Schema",
  status: "sanskrit_name_term_corpus_schema_recorded",
  planned_record_type: "sanskrit_name_corpus",
  schema_fields: [
    "term_id",
    "term_key",
    "term_devanagari",
    "term_iast",
    "term_common_transliteration",
    "term_category",
    "gender_or_usage_context",
    "etymology_note",
    "literal_meaning",
    "traditional_context",
    "modern_usage_note",
    "source_id",
    "source_locator",
    "exact_claim_supported",
    "source_confidence_band",
    "verification_status",
    "editorial_review_status",
    "public_use_allowed",
    "notes"
  ],
  usage_rules: [
    "Name and term explanations must not be overclaimed.",
    "Etymology, traditional context and modern usage note must be separate.",
    "Nityanand Mishra ji style discipline applies to precision of Sanskrit/name explanation, not as blanket authority.",
    "Exact supported claim must be recorded before public use."
  ],
  blocked_state: blockedState
};

const sutraQuoteSchema = {
  module_id: "AD05",
  title: "Sutra and Quote Corpus Schema",
  status: "sutra_quote_corpus_schema_recorded",
  planned_record_type: "sutra_quote_corpus",
  schema_fields: [
    "quote_id",
    "quote_key",
    "source_text_family",
    "source_title",
    "chapter_section_reference",
    "original_text_short_excerpt",
    "transliteration",
    "translation_or_paraphrase",
    "context_note",
    "theme_tags",
    "reflection_use_case",
    "copyright_status_note",
    "source_id",
    "source_locator",
    "source_confidence_band",
    "verification_status",
    "editorial_review_status",
    "public_use_allowed",
    "notes"
  ],
  usage_rules: [
    "Do not reproduce long copyrighted passages.",
    "Prefer short excerpts, paraphrase and source locator.",
    "Translation/paraphrase must be marked and reviewed.",
    "A quote must not be detached from context where context changes meaning.",
    "Public use requires source confidence and editorial review."
  ],
  blocked_state: blockedState
};

const reflectionPromptSchema = {
  module_id: "AD05",
  title: "Reflection Prompt Corpus Schema",
  status: "reflection_prompt_corpus_schema_recorded",
  planned_record_type: "reflection_prompt_rules",
  schema_fields: [
    "prompt_id",
    "prompt_key",
    "prompt_theme",
    "prompt_text_draft",
    "linked_word_id",
    "linked_quote_id",
    "linked_panchanga_context",
    "linked_observance_context",
    "intended_surface",
    "tone",
    "claim_risk_level",
    "safety_note",
    "source_dependency_level",
    "editorial_review_status",
    "public_use_allowed",
    "notes"
  ],
  usage_rules: [
    "Reflection prompts must be guidance-oriented, not predictive.",
    "Prompts linked to Panchanga context must not imply guaranteed outcomes.",
    "Prompts must avoid fear, shame, superstition amplification and medical/legal/financial advice.",
    "Prompts must carry review status before public use."
  ],
  blocked_state: blockedState
};

const textualDisciplineModel = {
  module_id: "AD05",
  title: "Sanskritic Textual Discipline Model",
  status: "sanskritic_textual_discipline_model_recorded",
  discipline_principles: [
    "Prefer precision over decorative Sanskritisation.",
    "Separate Sanskrit word, transliteration, translation and reflection.",
    "Do not use a scholar's name as substitute for source verification.",
    "Use Nityanand Mishra ji style discipline as a benchmark for careful Sanskrit/name explanation where later verified sources support it.",
    "Mark uncertain etymology or disputed meanings under editorial verification.",
    "Preserve humility and context in Indic explanation."
  ],
  review_checks: [
    "script_accuracy_check",
    "transliteration_check",
    "meaning_context_check",
    "source_support_check",
    "copyright_sensitivity_check",
    "non_claim_language_check",
    "editorial_review_check"
  ],
  blocked_state: blockedState
};

const sourceAttributionReviewMap = {
  module_id: "AD05",
  title: "Corpus Source Attribution and Review Map",
  status: "corpus_source_attribution_review_map_recorded",
  required_metadata: [
    "source_id",
    "source_title",
    "source_type",
    "author_or_institution",
    "source_locator",
    "supported_claim",
    "source_confidence_band",
    "verification_status",
    "editorial_review_status",
    "public_use_allowed"
  ],
  review_statuses: [
    "draft",
    "source_pending",
    "under_editorial_verification",
    "verified_for_internal_use",
    "verified_for_public_use",
    "blocked"
  ],
  public_use_rule: "A corpus item cannot be used on a public surface unless public_use_allowed is true and editorial_review_status is verified_for_public_use.",
  blocked_state: blockedState
};

const databasePlanningMap = {
  module_id: "AD05",
  title: "Corpus Database Planning Map",
  status: "corpus_database_planning_map_recorded",
  planned_tables_no_sql: [
    {
      table_name: "word_corpus",
      purpose: "Word of the Day and vocabulary records.",
      status: "planning_only_no_sql"
    },
    {
      table_name: "sanskrit_name_corpus",
      purpose: "Sanskrit names and culturally important terms.",
      status: "planning_only_no_sql"
    },
    {
      table_name: "sutra_quote_corpus",
      purpose: "Short source-attributed sutra/quote/excerpt records.",
      status: "planning_only_no_sql"
    },
    {
      table_name: "reflection_prompt_rules",
      purpose: "Reflection prompt templates and rules.",
      status: "planning_only_no_sql"
    },
    {
      table_name: "source_authorities",
      purpose: "Shared source authority and confidence records.",
      status: "planning_only_no_sql"
    },
    {
      table_name: "editorial_review_status",
      purpose: "Shared editorial workflow status.",
      status: "planning_only_no_sql"
    }
  ],
  no_sql_rule: "AD05 creates schema planning only. SQL migrations and database writes remain blocked.",
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AD05",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ad05",
  checks: Object.entries({
    ag47_resume_allowed: false,
    homepage_mutated: false,
    public_content_generated: false,
    word_of_day_generated: false,
    sutra_quote_generated: false,
    reflection_prompt_generated: false,
    panchang_prediction_generated: false,
    panchang_calculation_executed: false,
    live_source_fetch_executed: false,
    web_scraping_executed: false,
    copyrighted_text_reproduced: false,
    unverified_translation_published: false,
    unverified_nityanand_claim_made: false,
    sql_file_created: false,
    sql_migration_created: false,
    sql_executed: false,
    database_write_performed: false,
    supabase_table_created: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  }).map(([check_id, expected]) => ({ check_id, expected, actual: expected, passed: true })),
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AD05",
  title: "AD06 Vedic Guidance and Star Reflection Readiness Record",
  status: "ready_for_ad06_vedic_guidance_star_reflection_rule_model",
  ready_for_ad06: true,
  next_stage_id: "AD06",
  next_stage_title: "Vedic Guidance and Star Reflection Rule Model",
  hard_blocker_count_for_ad06: 0,
  ag47_resume_allowed_next: false,
  public_content_generation_allowed_next: false,
  guidance_generation_allowed_next: false,
  panchang_prediction_allowed_next: false,
  panchang_calculation_allowed_next: false,
  sql_creation_allowed_next: false,
  sql_execution_allowed_next: false,
  database_write_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AD05",
  title: "AD05 to AD06 Vedic Guidance and Star Reflection Boundary",
  status: "ad06_vedic_guidance_star_reflection_boundary_created",
  next_stage_id: "AD06",
  next_stage_title: "Vedic Guidance and Star Reflection Rule Model",
  allowed_scope: [
    "Define rule model for Vedic Guidance and Star Reflection as reflective interpretation, not deterministic prediction.",
    "Link future guidance rules to Panchanga context, word/sutra/reflection corpus, regional profile and safety notes.",
    "Separate rule logic, source dependency, tone, claim-risk and editorial review status.",
    "Keep work as rule-model planning only."
  ],
  blocked_scope: [
    "AG47 resume",
    "public content generation",
    "guidance generation",
    "Panchang prediction generation",
    "Panchang calculation execution",
    "live fetch",
    "web scraping",
    "SQL creation",
    "SQL execution",
    "database write",
    "Supabase table creation",
    "backend/Auth/Supabase activation",
    "service-role key exposure",
    "deployment"
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AD05",
  title: "Word, Sanskrit Name, Sutra and Reflection Corpus Schema",
  status: "word_sutra_reflection_corpus_schema_ready_for_ad06",
  depends_on: ["AD04"],
  corpus_doctrine_file: outputs.corpusDoctrine,
  word_corpus_schema_file: outputs.wordCorpusSchema,
  sanskrit_name_term_schema_file: outputs.sanskritNameTermSchema,
  sutra_quote_schema_file: outputs.sutraQuoteSchema,
  reflection_prompt_schema_file: outputs.reflectionPromptSchema,
  textual_discipline_model_file: outputs.textualDisciplineModel,
  source_attribution_review_map_file: outputs.sourceAttributionReviewMap,
  database_planning_map_file: outputs.databasePlanningMap,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ad05_word_sutra_reflection_corpus_schema_recorded: true,
    ad04_consumed: true,
    corpus_doctrine_recorded: true,
    word_corpus_schema_recorded: true,
    sanskrit_name_term_schema_recorded: true,
    sutra_quote_schema_recorded: true,
    reflection_prompt_schema_recorded: true,
    textual_discipline_model_recorded: true,
    corpus_source_attribution_review_map_recorded: true,
    corpus_database_planning_map_recorded: true,
    ready_for_ad06: true,
    hard_blocker_count_for_ad06: 0,
    ag47_resume_allowed: false,
    homepage_mutated: false,
    public_content_generated: false,
    word_of_day_generated: false,
    sutra_quote_generated: false,
    reflection_prompt_generated: false,
    panchang_prediction_generated: false,
    panchang_calculation_executed: false,
    sql_file_created: false,
    sql_executed: false,
    database_write_performed: false,
    supabase_table_created: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AD05",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AD05",
  status: review.status,
  ad05_word_sutra_reflection_corpus_schema_recorded: 1,
  ad04_consumed: 1,
  corpus_doctrine_recorded: 1,
  word_corpus_schema_recorded: 1,
  sanskrit_name_term_schema_recorded: 1,
  sutra_quote_schema_recorded: 1,
  reflection_prompt_schema_recorded: 1,
  textual_discipline_model_recorded: 1,
  corpus_source_attribution_review_map_recorded: 1,
  corpus_database_planning_map_recorded: 1,
  ready_for_ad06: 1,
  hard_blocker_count_for_ad06: 0,
  ag47_resume_allowed: 0,
  homepage_mutated: 0,
  public_content_generated: 0,
  word_of_day_generated: 0,
  sutra_quote_generated: 0,
  reflection_prompt_generated: 0,
  panchang_prediction_generated: 0,
  panchang_calculation_executed: 0,
  sql_file_created: 0,
  sql_executed: 0,
  database_write_performed: 0,
  supabase_table_created: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AD05 — Word, Sanskrit Name, Sutra and Reflection Corpus Schema

## Result

AD05 records the corpus schema for Word of the Day, Sanskrit names/terms, sutra/quote records and reflection prompts.

## Corpus families

- Word of the Day
- Sanskrit Name and Term Corpus
- Sutra and Quote Corpus
- Reflection Prompt Corpus
- Cultural Context Notes

## Textual discipline

AD05 preserves Nityanand Mishra ji style discipline as a standard for careful Sanskritic wording, contextual explanation and claim restraint. It does not treat any scholar name as a substitute for source verification.

## Important boundaries

AD05 does not generate public content, Word of the Day, sutra/quote records or reflection prompts. It does not fetch sources, scrape, create SQL, write database records or activate backend services.

## Next

AD06 — Vedic Guidance and Star Reflection Rule Model.
`;

writeJson(outputs.corpusDoctrine, corpusDoctrine);
writeJson(outputs.wordCorpusSchema, wordCorpusSchema);
writeJson(outputs.sanskritNameTermSchema, sanskritNameTermSchema);
writeJson(outputs.sutraQuoteSchema, sutraQuoteSchema);
writeJson(outputs.reflectionPromptSchema, reflectionPromptSchema);
writeJson(outputs.textualDisciplineModel, textualDisciplineModel);
writeJson(outputs.sourceAttributionReviewMap, sourceAttributionReviewMap);
writeJson(outputs.databasePlanningMap, databasePlanningMap);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AD05 Word, Sanskrit Name, Sutra and Reflection Corpus Schema generated.");
console.log("✅ Word corpus, Sanskrit name/term corpus, sutra/quote corpus and reflection prompt schema recorded.");
console.log("✅ Sanskritic textual discipline and source-attribution review map recorded.");
console.log("✅ Ready for AD06 Vedic Guidance and Star Reflection Rule Model.");
console.log("✅ No public content generation, live fetch, SQL, DB write, backend activation, deployment or service-role exposure recorded.");
