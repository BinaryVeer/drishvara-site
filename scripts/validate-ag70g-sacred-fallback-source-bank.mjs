import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70G validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70g-sacred-fallback-source-bank.mjs",
  "scripts/validate-ag70g-sacred-fallback-source-bank.mjs",
  "data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-source-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-source-map.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/ag70g-no-fallback-word-population-audit.json",
  "data/content-intelligence/quality-reviews/ag70g-sacred-fallback-source-bank.json",
  "data/content-intelligence/quality-registry/ag70g-ag70h-context-interpretation-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70g-to-ag70h-context-interpretation-bank-boundary.json",
  "data/quality/ag70g-sacred-fallback-source-bank.json",
  "data/quality/ag70g-sacred-fallback-source-bank-preview.json",
  "docs/quality/AG70G_SACRED_FALLBACK_SOURCE_BANK.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70g"]) fail("Missing generate:ag70g script.");
if (!pkg.scripts?.["validate:ag70g"]) fail("Missing validate:ag70g script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70g")) {
  fail("validate:project must include validate:ag70g.");
}

const bank = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-source-bank.json");
if (bank.status !== "sacred_fallback_source_bank_batch_01_created_no_word_population") fail("Fallback source bank status mismatch.");
if (bank.fallback_source_count !== 4) fail("Fallback source count must be 4.");
if (bank.fallback_word_records_created_now !== 0) fail("Fallback word records must be zero.");
if (bank.bulk_ingestion_allowed_count !== 0) fail("Bulk ingestion must be blocked.");
if (bank.public_claim_allowed_now_count !== 0) fail("Public claim must be blocked.");

const ids = new Set(bank.records.map((r) => r.fallback_source_id));
for (const id of [
  "fallback_src_vishnu_sahasranama_mahabharata_anushasana",
  "fallback_src_shiva_sahasranama_linga_purana",
  "fallback_src_vedic_rigveda_vedic_heritage",
  "fallback_src_puranic_bhagavata_purana_gretil"
]) {
  if (!ids.has(id)) fail(`Missing fallback source: ${id}`);
}

for (const record of bank.records) {
  if (record.approved_for_fallback_source_scoping !== true) fail(`Source scoping must be approved: ${record.fallback_source_id}`);
  if (record.approved_for_fallback_word_population_now !== false) fail(`Fallback word population must be blocked: ${record.fallback_source_id}`);
  if (record.bulk_ingestion_allowed !== false) fail(`Bulk ingestion must be false: ${record.fallback_source_id}`);
  if (record.exact_text_extraction_allowed_now !== false) fail(`Exact text extraction must be false: ${record.fallback_source_id}`);
  if (record.public_claim_allowed_now !== false) fail(`Public claim must be false: ${record.fallback_source_id}`);
  if (record.source_access_checked !== true) fail(`Source access must be checked: ${record.fallback_source_id}`);
  if (record.reuse_note_checked !== true) fail(`Reuse note must be checked: ${record.fallback_source_id}`);
}

const sourceMap = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-source-map.json");
if (sourceMap.status !== "sacred_fallback_source_map_created") fail("Fallback source map status mismatch.");
if (!Array.isArray(sourceMap.map) || sourceMap.map.length !== 4) fail("Fallback source map must contain 4 records.");

const audit = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/ag70g-no-fallback-word-population-audit.json");
if (audit.status !== "no_fallback_word_population_audit_passed") fail("No fallback population audit status mismatch.");
for (const key of [
  "fallback_word_records_created_now",
  "fallback_name_records_created_now",
  "fallback_term_records_created_now"
]) {
  if (audit[key] !== 0) fail(`${key} must be zero.`);
}
for (const key of [
  "actual_word_output_created_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "runtime_selector_active_now",
  "public_word_generation_allowed_now"
]) {
  if (audit[key] !== false) fail(`${key} must be false.`);
}

const familyRegister = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-source-family-register.json");
if (familyRegister.status !== "sacred_fallback_source_family_register_exact_sources_selected_no_word_population") fail("Family register status mismatch.");
if (familyRegister.exact_fallback_source_count !== 4) fail("Family register exact source count mismatch.");

const foundation = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/ag70e-word-production-knowledge-bank-foundation-manifest.json");
if (foundation.status !== "word_production_knowledge_bank_foundation_created_with_sacred_fallback_source_bank") fail("Foundation manifest status mismatch.");
if (foundation.current_counts.fallback_source_records !== 4) fail("Foundation fallback source count mismatch.");
if (foundation.current_counts.fallback_word_records !== 0) fail("Foundation fallback word count must be zero.");
if (foundation.current_counts.sacred_fallback_records !== 0) fail("Foundation sacred fallback record count must be zero.");

const wordManifest = readJson("data/knowledge-base/word-of-day/production/production-bank-manifest.json");
if (wordManifest.status !== "production_bank_manifest_created_sacred_fallback_source_bank") fail("Word manifest status mismatch.");
if (wordManifest.current_counts.fallback_source_records !== 4) fail("Word manifest fallback source count mismatch.");
if (wordManifest.current_counts.actual_fallback_records !== 0) fail("Actual fallback records must be zero.");
if (wordManifest.current_counts.actual_lexical_records !== 0) fail("Actual lexical records must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70g-sacred-fallback-source-bank.json");
if (review.status !== "ag70g_sacred_fallback_source_bank_completed") fail("Review status mismatch.");

for (const key of [
  "sacred_fallback_source_bank_created",
  "sacred_fallback_source_map_created",
  "vishnu_sahasranama_source_selected",
  "shiva_sahasranama_source_selected",
  "vedic_source_selected",
  "puranic_source_selected",
  "ready_for_ag70h"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "fallback_word_records_created_now",
  "fallback_name_records_created_now",
  "fallback_term_records_created_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "runtime_selector_active_now",
  "public_word_generation_allowed_now",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag70g-ag70h-context-interpretation-bank-readiness-record.json");
if (readiness.ready_for_ag70h !== true) fail("AG70H readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70g-to-ag70h-context-interpretation-bank-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocker of [
  "generated/word-of-day.json replacement",
  "homepage UI change",
  "runtime selector activation",
  "AI-fabricated Sanskrit or meaning records",
  "unsupported etymology",
  "public Word output",
  "bulk dictionary/book content ingestion",
  "fallback word/name/term population"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) {
    fail(`Boundary blocker missing: ${blocker}`);
  }
}

pass("AG70G sacred fallback source bank is valid.");
pass("Exact fallback sources are selected and fallback word/name/term population is blocked.");
pass("No output, UI, runtime or backend activation is recorded.");
