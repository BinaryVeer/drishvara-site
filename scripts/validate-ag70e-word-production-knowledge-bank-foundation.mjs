import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70E validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70e-word-production-knowledge-bank-foundation.mjs",
  "scripts/validate-ag70e-word-production-knowledge-bank-foundation.mjs",
  "data/knowledge-base/word-of-day/production/knowledge-bank/ag70e-word-production-knowledge-bank-foundation-manifest.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/context-interpretation-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/context-signal-taxonomy.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/morphology-production-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/etymology-production-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/semantics-production-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-production-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/lexical-source-evidence-map.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/approved-output-candidate-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/daily-word-history-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/duplicate-control-history-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/word-output-record-contract.json",
  "data/content-intelligence/quality-reviews/ag70e-word-production-knowledge-bank-foundation.json",
  "data/content-intelligence/quality-registry/ag70e-ag70f-sanskrit-lexical-source-reference-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70e-to-ag70f-sanskrit-lexical-source-reference-bank-boundary.json",
  "data/quality/ag70e-word-production-knowledge-bank-foundation.json",
  "data/quality/ag70e-word-production-knowledge-bank-foundation-preview.json",
  "docs/quality/AG70E_WORD_PRODUCTION_KNOWLEDGE_BANK_FOUNDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70e"]) fail("Missing generate:ag70e script.");
if (!pkg.scripts?.["validate:ag70e"]) fail("Missing validate:ag70e script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70e")) {
  fail("validate:project must include validate:ag70e.");
}

const foundation = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/ag70e-word-production-knowledge-bank-foundation-manifest.json");
const allowedFoundationStatuses = [
  "word_production_knowledge_bank_foundation_created_empty_banks",
  "word_production_knowledge_bank_foundation_created_with_source_reference_bank"
];
if (!allowedFoundationStatuses.includes(foundation.status)) fail("Foundation manifest status mismatch.");
if (foundation.runtime_active_now !== false) fail("Runtime must be inactive.");
if (foundation.public_output_allowed_now !== false) fail("Public output must be false.");
if (foundation.production_record_creation_now !== false) fail("Production record creation must be false.");

const allowedNonZeroFoundationCountKeys = new Set([
  "source_reference_records",
  "exact_source_reference_records",
  "review_guidance_reference_records",
  "nityanand_misra_reference_records",
  "source_family_placeholder_records"
]);

for (const [key, value] of Object.entries(foundation.current_counts)) {
  if (allowedNonZeroFoundationCountKeys.has(key)) continue;
  if (value !== 0) fail(`Foundation count must remain zero for production content: ${key}`);
}

const emptyBanks = [
  "data/knowledge-base/word-of-day/production/knowledge-bank/context-interpretation-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/context-signal-taxonomy.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/morphology-production-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/etymology-production-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/semantics-production-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-production-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/lexical-source-evidence-map.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/approved-output-candidate-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/daily-word-history-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/duplicate-control-history-bank.json"
];

for (const p of emptyBanks) {
  const data = readJson(p);
  if (!Array.isArray(data.records)) fail(`records array missing: ${p}`);
  if (data.records.length !== 0) fail(`records must be empty in AG70E: ${p}`);
}

const context = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/context-interpretation-bank.json");
for (const field of ["context_signal_id", "tithi_context_key", "nakshatra_context_key", "yoga_context_key", "combined_interpretive_signal", "approved_for_lexical_engine"]) {
  if (!context.required_fields.includes(field)) fail(`Context field missing: ${field}`);
}

const evidence = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/lexical-source-evidence-map.json");
for (const field of ["source_access_checked", "reuse_note_checked", "word_form_found_status", "meaning_supported_status", "public_use_permission"]) {
  if (!evidence.required_fields.includes(field)) fail(`Evidence field missing: ${field}`);
}

const fallback = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-production-bank.json");
for (const bank of ["vishnu_sahasranama_bank", "shiva_sahasranama_bank", "vedic_term_bank", "puranic_name_theme_bank"]) {
  if (!fallback.planned_fallback_bank_classes.includes(bank)) fail(`Fallback bank class missing: ${bank}`);
}

const output = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/word-output-record-contract.json");
if (output.output_generated_now !== false) fail("Output must not be generated in AG70E.");
for (const field of ["date_key", "word_id", "sanskrit", "meaning_en", "selection_path", "duplicate_check_status", "subscriber_archive_eligible"]) {
  if (!output.required_fields.includes(field)) fail(`Output contract field missing: ${field}`);
}

const wordManifest = readJson("data/knowledge-base/word-of-day/production/production-bank-manifest.json");
const allowedWordManifestStatuses = [
  "production_bank_manifest_created_word_production_knowledge_bank_foundation",
  "production_bank_manifest_created_sanskrit_lexical_source_reference_bank"
];
if (!allowedWordManifestStatuses.includes(wordManifest.status)) fail("Word manifest status mismatch.");
if (!wordManifest.knowledge_bank_files?.foundation_manifest) fail("Word manifest missing knowledge bank file map.");

const review = readJson("data/content-intelligence/quality-reviews/ag70e-word-production-knowledge-bank-foundation.json");
if (review.status !== "ag70e_word_production_knowledge_bank_foundation_completed") fail("Review status mismatch.");

for (const key of [
  "foundation_manifest_created",
  "context_interpretation_bank_created",
  "context_signal_taxonomy_created",
  "morphology_production_bank_created",
  "etymology_production_bank_created",
  "semantics_production_bank_created",
  "sacred_fallback_production_bank_created",
  "lexical_source_evidence_map_created",
  "approved_output_candidate_bank_created",
  "daily_word_history_bank_created",
  "duplicate_control_history_bank_created",
  "output_record_contract_created",
  "word_manifest_updated_with_knowledge_bank_foundation",
  "ready_for_ag70f"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "actual_context_records_created_now",
  "actual_morphology_records_created_now",
  "actual_etymology_records_created_now",
  "actual_semantics_records_created_now",
  "actual_fallback_records_created_now",
  "daily_word_records_created_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "runtime_selector_active_now",
  "public_word_generation_allowed_now",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag70e-ag70f-sanskrit-lexical-source-reference-bank-readiness-record.json");
if (readiness.ready_for_ag70f !== true) fail("AG70F readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70e-to-ag70f-sanskrit-lexical-source-reference-bank-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocker of [
  "generated/word-of-day.json replacement",
  "homepage UI change",
  "runtime selector activation",
  "AI-fabricated Sanskrit or meaning records",
  "unsupported etymology",
  "public Word output",
  "bulk dictionary/book content ingestion"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) {
    fail(`Boundary blocker missing: ${blocker}`);
  }
}

pass("AG70E Word production knowledge-bank foundation is valid.");
pass("All production knowledge-bank containers exist and are empty.");
pass("Output contract, source-evidence map, fallback bank and history banks are valid.");
pass("No actual records, output, UI, runtime or backend activation is recorded.");
