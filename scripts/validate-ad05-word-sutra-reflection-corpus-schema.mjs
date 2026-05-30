import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

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

function fail(message) {
  console.error(`❌ AD05 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ad04-calendar-calculation-methodology.json",
  "data/content-intelligence/ad-foundation/ad04-calendar-calculation-methodology-doctrine.json",
  "data/content-intelligence/ad-foundation/ad04-validation-cross-check-model.json",
  "data/content-intelligence/ad-foundation/ad04-calculation-non-execution-policy.json",
  "data/content-intelligence/backend-architecture/ad04-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad04-ad05-word-sutra-reflection-corpus-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad04-to-ad05-word-sutra-reflection-corpus-boundary.json",
  "data/content-intelligence/ad-foundation/ad01-nityanand-mishra-style-discipline-record.json",
  "data/content-intelligence/ad-foundation/ad01-source-confidence-model.json",
  "data/content-intelligence/ad-foundation/ad01-attribution-and-claim-boundary.json",
  "data/content-intelligence/ad-foundation/ad00-database-first-doctrine.json",
  "data/content-intelligence/ad-foundation/ad00-kala-drishti-method-name-record.json",

  "data/content-intelligence/quality-reviews/ad05-word-sutra-reflection-corpus-schema.json",
  "data/content-intelligence/ad-foundation/ad05-corpus-doctrine.json",
  "data/content-intelligence/ad-foundation/ad05-word-of-the-day-corpus-schema.json",
  "data/content-intelligence/ad-foundation/ad05-sanskrit-name-term-corpus-schema.json",
  "data/content-intelligence/ad-foundation/ad05-sutra-quote-corpus-schema.json",
  "data/content-intelligence/ad-foundation/ad05-reflection-prompt-corpus-schema.json",
  "data/content-intelligence/ad-foundation/ad05-sanskritic-textual-discipline-model.json",
  "data/content-intelligence/ad-foundation/ad05-corpus-source-attribution-review-map.json",
  "data/content-intelligence/ad-foundation/ad05-corpus-database-planning-map.json",
  "data/content-intelligence/backend-architecture/ad05-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad05-ad06-vedic-guidance-star-reflection-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad05-to-ad06-vedic-guidance-star-reflection-boundary.json",
  "data/quality/ad05-word-sutra-reflection-corpus-schema.json",
  "data/quality/ad05-word-sutra-reflection-corpus-schema-preview.json",
  "docs/quality/AD05_WORD_SUTRA_REFLECTION_CORPUS_SCHEMA.md",
  "scripts/generate-ad05-word-sutra-reflection-corpus-schema.mjs",
  "scripts/validate-ad05-word-sutra-reflection-corpus-schema.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ad04Review = readJson("data/content-intelligence/quality-reviews/ad04-calendar-calculation-methodology.json");
const ad04NoMutationAudit = readJson("data/content-intelligence/backend-architecture/ad04-no-mutation-audit-register.json");
const ad04Readiness = readJson("data/content-intelligence/quality-registry/ad04-ad05-word-sutra-reflection-corpus-readiness-record.json");
const ad04Boundary = readJson("data/content-intelligence/mutation-plans/ad04-to-ad05-word-sutra-reflection-corpus-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ad05-word-sutra-reflection-corpus-schema.json");
const corpusDoctrine = readJson("data/content-intelligence/ad-foundation/ad05-corpus-doctrine.json");
const wordCorpusSchema = readJson("data/content-intelligence/ad-foundation/ad05-word-of-the-day-corpus-schema.json");
const sanskritNameTermSchema = readJson("data/content-intelligence/ad-foundation/ad05-sanskrit-name-term-corpus-schema.json");
const sutraQuoteSchema = readJson("data/content-intelligence/ad-foundation/ad05-sutra-quote-corpus-schema.json");
const reflectionPromptSchema = readJson("data/content-intelligence/ad-foundation/ad05-reflection-prompt-corpus-schema.json");
const textualDisciplineModel = readJson("data/content-intelligence/ad-foundation/ad05-sanskritic-textual-discipline-model.json");
const sourceAttributionReviewMap = readJson("data/content-intelligence/ad-foundation/ad05-corpus-source-attribution-review-map.json");
const databasePlanningMap = readJson("data/content-intelligence/ad-foundation/ad05-corpus-database-planning-map.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ad05-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ad05-ad06-vedic-guidance-star-reflection-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ad05-to-ad06-vedic-guidance-star-reflection-boundary.json");
const preview = readJson("data/quality/ad05-word-sutra-reflection-corpus-schema-preview.json");
const pkg = readJson("package.json");

if (ad04Review.status !== "calendar_calculation_methodology_ready_for_ad05") fail("AD04 review status mismatch.");
if (ad04Review.summary.ready_for_ad05 !== true) fail("AD04 readiness summary missing.");
if (ad04NoMutationAudit.audit_passed !== true) fail("AD04 no-mutation audit must pass.");
if (ad04Readiness.ready_for_ad05 !== true) fail("AD04 readiness must permit AD05.");
if (ad04Boundary.next_stage_id !== "AD05") fail("AD04 boundary must point to AD05.");

if (review.status !== "word_sutra_reflection_corpus_schema_ready_for_ad06") fail("AD05 review status mismatch.");
for (const key of [
  "ad05_word_sutra_reflection_corpus_schema_recorded",
  "ad04_consumed",
  "corpus_doctrine_recorded",
  "word_corpus_schema_recorded",
  "sanskrit_name_term_schema_recorded",
  "sutra_quote_schema_recorded",
  "reflection_prompt_schema_recorded",
  "textual_discipline_model_recorded",
  "corpus_source_attribution_review_map_recorded",
  "corpus_database_planning_map_recorded",
  "ready_for_ad06"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_ad06 !== 0) fail("AD06 blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "word_of_day_generated", "sutra_quote_generated", "reflection_prompt_generated", "panchang_prediction_generated", "panchang_calculation_executed", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (corpusDoctrine.status !== "corpus_doctrine_recorded") fail("Corpus doctrine status mismatch.");
for (const family of ["word_of_the_day", "sanskrit_name_term_corpus", "sutra_quote_corpus", "reflection_prompt_corpus"]) {
  if (!corpusDoctrine.corpus_families.includes(family)) fail(`Corpus family missing: ${family}`);
}
if (!JSON.stringify(corpusDoctrine.doctrine_rules).includes("AD05 defines corpus schema only")) fail("Schema-only doctrine missing.");
if (!JSON.stringify(corpusDoctrine.doctrine_rules).includes("Nityanand Mishra ji is a style-discipline influence")) fail("Nityanand discipline doctrine missing.");

if (wordCorpusSchema.status !== "word_of_the_day_corpus_schema_recorded") fail("Word corpus schema status mismatch.");
for (const field of ["word_id", "word_devanagari", "word_iast", "root_or_dhatu", "literal_meaning", "contextual_meaning", "source_id", "verification_status", "public_use_allowed"]) {
  if (!wordCorpusSchema.schema_fields.includes(field)) fail(`Word corpus field missing: ${field}`);
}

if (sanskritNameTermSchema.status !== "sanskrit_name_term_corpus_schema_recorded") fail("Sanskrit name/term schema status mismatch.");
for (const field of ["term_id", "term_devanagari", "term_iast", "etymology_note", "traditional_context", "exact_claim_supported", "public_use_allowed"]) {
  if (!sanskritNameTermSchema.schema_fields.includes(field)) fail(`Sanskrit name/term field missing: ${field}`);
}
if (!JSON.stringify(sanskritNameTermSchema.usage_rules).includes("blanket authority")) fail("Blanket authority prohibition missing.");

if (sutraQuoteSchema.status !== "sutra_quote_corpus_schema_recorded") fail("Sutra quote schema status mismatch.");
for (const field of ["quote_id", "source_text_family", "chapter_section_reference", "original_text_short_excerpt", "translation_or_paraphrase", "copyright_status_note", "public_use_allowed"]) {
  if (!sutraQuoteSchema.schema_fields.includes(field)) fail(`Sutra quote field missing: ${field}`);
}
if (!JSON.stringify(sutraQuoteSchema.usage_rules).includes("Do not reproduce long copyrighted passages")) fail("Copyright rule missing.");

if (reflectionPromptSchema.status !== "reflection_prompt_corpus_schema_recorded") fail("Reflection prompt schema status mismatch.");
for (const field of ["prompt_id", "prompt_theme", "linked_word_id", "linked_quote_id", "linked_panchanga_context", "claim_risk_level", "safety_note", "public_use_allowed"]) {
  if (!reflectionPromptSchema.schema_fields.includes(field)) fail(`Reflection prompt field missing: ${field}`);
}
if (!JSON.stringify(reflectionPromptSchema.usage_rules).includes("not predictive")) fail("Reflection non-predictive rule missing.");

if (textualDisciplineModel.status !== "sanskritic_textual_discipline_model_recorded") fail("Textual discipline status mismatch.");
for (const check of ["script_accuracy_check", "transliteration_check", "meaning_context_check", "source_support_check", "copyright_sensitivity_check", "non_claim_language_check"]) {
  if (!textualDisciplineModel.review_checks.includes(check)) fail(`Textual review check missing: ${check}`);
}
if (!JSON.stringify(textualDisciplineModel.discipline_principles).includes("Prefer precision")) fail("Precision principle missing.");

if (sourceAttributionReviewMap.status !== "corpus_source_attribution_review_map_recorded") fail("Source attribution review status mismatch.");
for (const field of ["source_id", "source_title", "source_locator", "supported_claim", "source_confidence_band", "verification_status", "public_use_allowed"]) {
  if (!sourceAttributionReviewMap.required_metadata.includes(field)) fail(`Source attribution field missing: ${field}`);
}
if (!sourceAttributionReviewMap.review_statuses.includes("verified_for_public_use")) fail("verified_for_public_use status missing.");

if (databasePlanningMap.status !== "corpus_database_planning_map_recorded") fail("Database planning status mismatch.");
for (const table of ["word_corpus", "sanskrit_name_corpus", "sutra_quote_corpus", "reflection_prompt_rules", "source_authorities", "editorial_review_status"]) {
  if (!JSON.stringify(databasePlanningMap.planned_tables_no_sql).includes(table)) fail(`Planned corpus table missing: ${table}`);
}
if (!JSON.stringify(databasePlanningMap.no_sql_rule).includes("SQL migrations and database writes remain blocked")) fail("No SQL rule missing.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ad05") fail("No-mutation status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.status !== "ready_for_ad06_vedic_guidance_star_reflection_rule_model") fail("Readiness status mismatch.");
if (readiness.ready_for_ad06 !== true) fail("Readiness must permit AD06.");
if (readiness.next_stage_id !== "AD06") fail("Readiness next stage must be AD06.");
if (readiness.ag47_resume_allowed_next !== false) fail("AG47 resume must remain blocked.");
if (readiness.guidance_generation_allowed_next !== false) fail("Guidance generation must remain blocked.");
if (readiness.panchang_prediction_allowed_next !== false) fail("Panchang prediction must remain blocked.");
if (readiness.sql_creation_allowed_next !== false) fail("SQL creation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AD06") fail("Boundary must point to AD06.");
if (!JSON.stringify(boundary.allowed_scope).includes("Vedic Guidance and Star Reflection")) fail("AD06 scope missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("reflective interpretation, not deterministic prediction")) fail("Non-deterministic boundary missing.");
if (!boundary.blocked_scope.includes("guidance generation")) fail("Guidance generation blocked scope missing.");
if (!boundary.blocked_scope.includes("SQL execution")) fail("SQL execution blocked scope missing.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role exposure blocked scope missing.");

for (const key of [
  "ad05_word_sutra_reflection_corpus_schema_recorded",
  "ad04_consumed",
  "corpus_doctrine_recorded",
  "word_corpus_schema_recorded",
  "sanskrit_name_term_schema_recorded",
  "sutra_quote_schema_recorded",
  "reflection_prompt_schema_recorded",
  "textual_discipline_model_recorded",
  "corpus_source_attribution_review_map_recorded",
  "corpus_database_planning_map_recorded",
  "ready_for_ad06"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_ad06 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "word_of_day_generated", "sutra_quote_generated", "reflection_prompt_generated", "panchang_prediction_generated", "panchang_calculation_executed", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ad05"]) fail("Missing package script: generate:ad05");
if (!pkg.scripts?.["validate:ad05"]) fail("Missing package script: validate:ad05");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ad05")) fail("validate:project must include validate:ad05.");

pass("AD05 Word, Sanskrit Name, Sutra and Reflection Corpus Schema is present.");
pass("AD04 calculation methodology is consumed.");
pass("Corpus doctrine is valid.");
pass("Word of the Day corpus schema is valid.");
pass("Sanskrit name and term corpus schema is valid.");
pass("Sutra and quote corpus schema is valid.");
pass("Reflection prompt corpus schema is valid.");
pass("Sanskritic textual discipline model is valid.");
pass("Corpus source attribution and review map is valid.");
pass("Corpus database planning map is valid without SQL.");
pass("No-mutation audit is valid.");
pass("AD06 Vedic Guidance and Star Reflection Rule Model readiness is valid.");
pass("No public content generation, guidance generation, Panchang prediction, SQL, DB write, backend activation, deployment or service-role exposure is recorded.");
