import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70C validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70c-sanskrit-lexical-engine-data-model.mjs",
  "scripts/validate-ag70c-sanskrit-lexical-engine-data-model.mjs",
  "data/knowledge-base/word-of-day/production/lexical-engine/lexical-engine-manifest.json",
  "data/knowledge-base/word-of-day/production/lexical-engine/morphology-engine-schema.json",
  "data/knowledge-base/word-of-day/production/lexical-engine/etymology-engine-schema.json",
  "data/knowledge-base/word-of-day/production/lexical-engine/semantics-engine-schema.json",
  "data/knowledge-base/word-of-day/production/lexical-engine/lexical-source-evidence-rules.json",
  "data/knowledge-base/word-of-day/production/lexical-engine/panchang-context-to-lexical-input-contract.json",
  "data/knowledge-base/word-of-day/production/lexical-engine/candidate-lexical-bank-schema.json",
  "data/knowledge-base/word-of-day/production/lexical-engine/approved-lexical-bank-schema.json",
  "data/knowledge-base/word-of-day/production/lexical-engine/sacred-fallback-bank-schema.json",
  "data/knowledge-base/word-of-day/production/daily-word-history-schema.json",
  "data/knowledge-base/word-of-day/production/subscriber-word-archive-schema.json",
  "data/content-intelligence/quality-reviews/ag70c-sanskrit-lexical-engine-data-model.json",
  "data/content-intelligence/quality-registry/ag70c-ag70d-word-methodology-supersession-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70c-to-ag70d-word-methodology-supersession-boundary.json",
  "data/quality/ag70c-sanskrit-lexical-engine-data-model.json",
  "data/quality/ag70c-sanskrit-lexical-engine-data-model-preview.json",
  "docs/quality/AG70C_SANSKRIT_LEXICAL_ENGINE_DATA_MODEL.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70c"]) fail("Missing generate:ag70c script.");
if (!pkg.scripts?.["validate:ag70c"]) fail("Missing validate:ag70c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70c")) fail("validate:project must include validate:ag70c.");

const manifest = readJson("data/knowledge-base/word-of-day/production/lexical-engine/lexical-engine-manifest.json");
if (manifest.status !== "sanskrit_lexical_engine_manifest_created_no_runtime_activation") fail("Lexical manifest status mismatch.");
if (manifest.runtime_engine_active_now !== false) fail("Runtime engine must be inactive.");
if (manifest.public_word_generation_allowed_now !== false) fail("Public word generation must be false.");
for (const blocker of ["ai_invented_sanskrit_form", "unsupported_etymology_claim", "fallback_selection_without_approved_source_bank"]) {
  if (!manifest.blocked_behaviour.includes(blocker)) fail(`Blocked behaviour missing: ${blocker}`);
}

const morphology = readJson("data/knowledge-base/word-of-day/production/lexical-engine/morphology-engine-schema.json");
if (morphology.status !== "morphology_engine_schema_created_empty_bank") fail("Morphology schema status mismatch.");
for (const field of ["sanskrit_form", "root_or_dhatu", "valid_form_status", "morphology_source_reference_ids"]) {
  if (!morphology.required_fields.includes(field)) fail(`Morphology field missing: ${field}`);
}
if (morphology.records.length !== 0) fail("Morphology records must be empty in AG70C.");

const etymology = readJson("data/knowledge-base/word-of-day/production/lexical-engine/etymology-engine-schema.json");
if (etymology.status !== "etymology_engine_schema_created_empty_bank") fail("Etymology schema status mismatch.");
if (!etymology.allowed_etymology_status.includes("not_established")) fail("Etymology must allow not_established.");
if (!String(etymology.rule).includes("do not fabricate")) fail("Etymology rule must block fabrication.");
if (etymology.records.length !== 0) fail("Etymology records must be empty in AG70C.");

const semantics = readJson("data/knowledge-base/word-of-day/production/lexical-engine/semantics-engine-schema.json");
if (semantics.status !== "semantics_engine_schema_created_empty_bank") fail("Semantics schema status mismatch.");
for (const field of ["meaning_en", "meaning_hi", "semantic_range", "usage_boundary", "reflective_sense"]) {
  if (!semantics.required_fields.includes(field)) fail(`Semantics field missing: ${field}`);
}
if (semantics.records.length !== 0) fail("Semantics records must be empty in AG70C.");

const evidence = readJson("data/knowledge-base/word-of-day/production/lexical-engine/lexical-source-evidence-rules.json");
if (evidence.status !== "lexical_source_evidence_rules_created") fail("Evidence rules status mismatch.");
for (const check of ["source_access_checked", "reuse_note_checked", "word_form_found_status", "meaning_supported_status", "internal_textual_discipline_check"]) {
  if (!evidence.mandatory_checks.includes(check)) fail(`Mandatory evidence check missing: ${check}`);
}
for (const blocked of ["unsupported_etymology", "invented_sanskrit_word", "unsourced_meaning_expansion"]) {
  if (!evidence.blocked_claims.includes(blocked)) fail(`Blocked claim missing: ${blocked}`);
}

const input = readJson("data/knowledge-base/word-of-day/production/lexical-engine/panchang-context-to-lexical-input-contract.json");
if (input.status !== "panchang_context_to_lexical_input_contract_created") fail("Panchang lexical input status mismatch.");
if (input.runtime_connector_active_now !== false) fail("Lexical input connector must be inactive.");
for (const field of ["tithi_context_key", "nakshatra_context_key", "yoga_context_key", "paksha_context_key", "vara_context_key", "combined_interpretive_signal"]) {
  if (!input.input_from_panchang_context_interpretation.includes(field)) fail(`Panchang lexical input missing: ${field}`);
}

const approved = readJson("data/knowledge-base/word-of-day/production/lexical-engine/approved-lexical-bank-schema.json");
if (approved.status !== "approved_lexical_bank_schema_created_empty_bank") fail("Approved lexical schema status mismatch.");
for (const field of ["morphology_status", "etymology_status", "semantic_status", "approved_for_primary_selection", "approved_for_fallback_selection"]) {
  if (!approved.required_fields.includes(field)) fail(`Approved lexical field missing: ${field}`);
}
if (approved.records.length !== 0) fail("Approved lexical records must be empty in AG70C.");

const fallback = readJson("data/knowledge-base/word-of-day/production/lexical-engine/sacred-fallback-bank-schema.json");
if (fallback.status !== "sacred_fallback_bank_schema_created_empty_bank") fail("Fallback schema status mismatch.");
for (const bank of ["vishnu_sahasranama_bank", "shiva_sahasranama_bank", "vedic_term_bank", "puranic_name_theme_bank"]) {
  if (!fallback.fallback_banks.some((b) => b.fallback_bank_id === bank)) fail(`Fallback bank missing: ${bank}`);
}
if (!String(fallback.rule).includes("not a licence to invent")) fail("Fallback rule must block invention.");

const daily = readJson("data/knowledge-base/word-of-day/production/daily-word-history-schema.json");
if (daily.status !== "daily_word_history_schema_created_empty_bank") fail("Daily history schema status mismatch.");
for (const field of ["date_key", "panchang_context_id", "selection_path", "duplicate_check_status", "published_status"]) {
  if (!daily.required_fields.includes(field)) fail(`Daily history field missing: ${field}`);
}
if (daily.records.length !== 0) fail("Daily history records must be empty in AG70C.");

const archive = readJson("data/knowledge-base/word-of-day/production/subscriber-word-archive-schema.json");
if (archive.status !== "subscriber_word_archive_schema_created_empty_bank") fail("Subscriber archive status mismatch.");
for (const field of ["daily_word_record_id", "date_key", "search_terms", "subscriber_visible"]) {
  if (!archive.required_fields.includes(field)) fail(`Subscriber archive field missing: ${field}`);
}
if (archive.records.length !== 0) fail("Subscriber archive records must be empty in AG70C.");

const wordManifest = readJson("data/knowledge-base/word-of-day/production/production-bank-manifest.json");
const allowedWordManifestStatuses = [
  "production_bank_manifest_created_lexical_engine_model_defined",
  "production_bank_manifest_created_word_methodology_v2_superseded",
  "production_bank_manifest_created_word_production_knowledge_bank_foundation",
  "production_bank_manifest_created_sanskrit_lexical_source_reference_bank",
  "production_bank_manifest_created_sacred_fallback_source_bank"
];
if (!allowedWordManifestStatuses.includes(wordManifest.status)) fail("Word manifest status mismatch.");
if (!wordManifest.lexical_engine_files?.morphology_engine_schema) fail("Word manifest missing lexical engine file map.");

const review = readJson("data/content-intelligence/quality-reviews/ag70c-sanskrit-lexical-engine-data-model.json");
if (review.status !== "ag70c_sanskrit_lexical_engine_data_model_completed") fail("Review status mismatch.");

for (const key of [
  "lexical_engine_manifest_created",
  "morphology_engine_schema_created",
  "etymology_engine_schema_created",
  "semantics_engine_schema_created",
  "lexical_source_evidence_rules_created",
  "panchang_context_to_lexical_input_contract_created",
  "sacred_fallback_bank_schema_created",
  "daily_word_history_schema_created",
  "subscriber_archive_schema_created",
  "word_manifest_updated_with_lexical_engine_model",
  "ready_for_ag70d"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "actual_lexical_records_created_now",
  "actual_sacred_fallback_records_created_now",
  "daily_word_history_records_created_now",
  "subscriber_archive_records_created_now",
  "public_word_generation_allowed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag70c-ag70d-word-methodology-supersession-readiness-record.json");
if (readiness.ready_for_ag70d !== true) fail("AG70D readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70c-to-ag70d-word-methodology-supersession-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocker of [
  "creating actual Sanskrit lexical records",
  "creating actual sacred fallback records",
  "public Word generation",
  "generated/word-of-day.json replacement",
  "AI-fabricated Sanskrit or meaning records"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) {
    fail(`Boundary blocker missing: ${blocker}`);
  }
}

pass("AG70C Sanskrit lexical engine data model is valid.");
pass("Morphology, etymology and semantics schemas are valid and empty.");
pass("Sacred fallback, daily history and subscriber archive schemas are valid.");
pass("Panchang-context lexical input contract is valid.");
pass("No lexical records, public output, UI or backend activation is recorded.");
