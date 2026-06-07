import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70F validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70f-sanskrit-lexical-source-reference-bank.mjs",
  "scripts/validate-ag70f-sanskrit-lexical-source-reference-bank.mjs",
  "data/knowledge-base/word-of-day/production/knowledge-bank/sanskrit-lexical-source-reference-bank.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/sanskrit-lexical-source-review-policy.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/sanskrit-source-reuse-boundary-register.json",
  "data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-source-family-register.json",
  "data/content-intelligence/quality-reviews/ag70f-sanskrit-lexical-source-reference-bank.json",
  "data/content-intelligence/quality-registry/ag70f-ag70g-sacred-fallback-source-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70f-to-ag70g-sacred-fallback-source-bank-boundary.json",
  "data/quality/ag70f-sanskrit-lexical-source-reference-bank.json",
  "data/quality/ag70f-sanskrit-lexical-source-reference-bank-preview.json",
  "docs/quality/AG70F_SANSKRIT_LEXICAL_SOURCE_REFERENCE_BANK.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70f"]) fail("Missing generate:ag70f script.");
if (!pkg.scripts?.["validate:ag70f"]) fail("Missing validate:ag70f script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70f")) {
  fail("validate:project must include validate:ag70f.");
}

const bank = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/sanskrit-lexical-source-reference-bank.json");
if (bank.status !== "sanskrit_lexical_source_reference_bank_batch_01_created") fail("Source reference bank status mismatch.");
if (bank.source_reference_count !== 18) fail("Source reference count must be 18.");
if (bank.exact_source_reference_count !== 12) fail("Exact source reference count must be 12.");
if (bank.review_guidance_reference_count !== 2) fail("Review guidance reference count must be 2.");
if (bank.nityanand_misra_reference_count !== 2) fail("Nityanand Misra reference count must be 2.");
if (bank.source_family_placeholder_count !== 4) fail("Source family placeholder count must be 4.");
if (bank.bulk_ingestion_allowed_count !== 0) fail("Bulk ingestion must be blocked for all records.");
if (bank.public_claim_allowed_now_count !== 0) fail("Public claims must be blocked for all records.");

const ids = new Set(bank.records.map((r) => r.source_reference_id));
for (const id of [
  "src_vedic_heritage_portal_gov_india",
  "src_cologne_digital_sanskrit_dictionaries",
  "src_sanskrit_heritage_inria",
  "src_digital_corpus_of_sanskrit",
  "src_gretil",
  "src_dsal_digital_dictionaries_south_asia",
  "src_dsal_apte_practical_sanskrit_english_dictionary",
  "src_archive_apte_1890_scan_metadata",
  "src_dsal_macdonell_practical_sanskrit_dictionary",
  "src_sanskritdictionary_com_lexical_lookup",
  "src_hindi_shabdasagara_dsal",
  "src_central_hindi_directorate_publications",
  "src_nityananda_misra_sunama_sarit",
  "src_nityananda_misra_sunama",
  "src_vishnu_sahasranama_source_family",
  "src_shiva_sahasranama_source_family",
  "src_vedic_source_text_family",
  "src_puranic_source_text_family"
]) {
  if (!ids.has(id)) fail(`Missing source reference: ${id}`);
}

for (const record of bank.records) {
  if (record.bulk_ingestion_allowed !== false) fail(`Bulk ingestion not blocked: ${record.source_reference_id}`);
  if (record.public_claim_allowed_now !== false) fail(`Public claim not blocked: ${record.source_reference_id}`);
  if (!record.review_status) fail(`Missing review_status: ${record.source_reference_id}`);
  if (!record.public_use_permission) fail(`Missing public_use_permission: ${record.source_reference_id}`);
}

const exactRecords = bank.records.filter((r) => r.source_record_type === "exact_source_reference");
for (const record of exactRecords) {
  if (record.source_access_checked !== true) fail(`source_access_checked must be true: ${record.source_reference_id}`);
  if (record.reuse_note_checked !== true) fail(`reuse_note_checked must be true: ${record.source_reference_id}`);
  if (!record.source_url) fail(`Exact source URL missing: ${record.source_reference_id}`);
}

const reviewGuidanceRecords = bank.records.filter((r) => r.source_record_type === "review_guidance_reference");
if (reviewGuidanceRecords.length !== 2) fail("There must be 2 review guidance references.");
for (const record of reviewGuidanceRecords) {
  if (record.nityanand_misra_related !== true) fail(`Nityanand Misra marker missing: ${record.source_reference_id}`);
  if (record.approved_for_primary_lexical_evidence !== false) fail(`Review guidance must not be primary lexical evidence: ${record.source_reference_id}`);
  if (record.approved_for_review_guidance !== true) fail(`Review guidance approval missing: ${record.source_reference_id}`);
  if (record.evidence_use_level !== "review_guidance_only_no_bulk_ingestion_no_public_claim") {
    fail(`Review guidance evidence-use boundary mismatch: ${record.source_reference_id}`);
  }
}

const familyRecords = bank.records.filter((r) => r.source_record_type === "source_family_placeholder");
for (const record of familyRecords) {
  if (record.exact_source_pending !== true) fail(`Family placeholder must require exact source: ${record.source_reference_id}`);
  if (record.public_use_permission !== "not_allowed_until_exact_source_review") fail(`Family placeholder public-use block missing: ${record.source_reference_id}`);
}

const policy = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/sanskrit-lexical-source-review-policy.json");
if (policy.status !== "sanskrit_lexical_source_review_policy_created") fail("Source review policy status mismatch.");
for (const blocked of ["bulk_dictionary_ingestion", "long_text_reproduction", "fallback_bank_population_from_review_guidance_reference_alone", "AI_substitute_for_source_evidence"]) {
  if (!policy.blocked_use.includes(blocked)) fail(`Policy blocked use missing: ${blocked}`);
}

const reuse = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/sanskrit-source-reuse-boundary-register.json");
if (reuse.status !== "sanskrit_source_reuse_boundary_register_created") fail("Reuse boundary status mismatch.");
if (reuse.source_reference_ids.length !== 18) fail("Reuse boundary must include all source references.");

const families = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/sacred-fallback-source-family-register.json");
const allowedSacredFallbackFamilyRegisterStatuses = [
  "sacred_fallback_source_family_register_created_exact_sources_pending",
  "sacred_fallback_source_family_register_exact_sources_selected_no_word_population"
];
if (!allowedSacredFallbackFamilyRegisterStatuses.includes(families.status)) fail("Sacred fallback family register status mismatch.");
if (families.family_count !== 4) fail("Sacred fallback family count must be 4.");
if (!families.review_guidance_reference_ids.includes("src_nityananda_misra_sunama_sarit")) fail("Sunama-Sarit review guidance missing from fallback register.");
if (!families.review_guidance_reference_ids.includes("src_nityananda_misra_sunama")) fail("Sunama review guidance missing from fallback register.");

const evidenceMap = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/lexical-source-evidence-map.json");
if (evidenceMap.status !== "lexical_source_evidence_map_created_with_source_reference_bank_link") fail("Lexical source evidence map status mismatch.");
if (evidenceMap.source_reference_count !== 18) fail("Evidence map source reference count mismatch.");
if (evidenceMap.review_guidance_reference_count !== 2) fail("Evidence map review guidance count mismatch.");
if (evidenceMap.evidence_records_created_now !== 0) fail("No evidence records should be created in AG70F.");
if (!Array.isArray(evidenceMap.records) || evidenceMap.records.length !== 0) fail("Evidence records must remain empty in AG70F.");

const foundation = readJson("data/knowledge-base/word-of-day/production/knowledge-bank/ag70e-word-production-knowledge-bank-foundation-manifest.json");
const allowedFoundationStatuses = [
  "word_production_knowledge_bank_foundation_created_with_source_reference_bank",
  "word_production_knowledge_bank_foundation_created_with_sacred_fallback_source_bank"
];
if (!allowedFoundationStatuses.includes(foundation.status)) fail("Foundation manifest status mismatch.");
if (foundation.current_counts.source_reference_records !== 18) fail("Foundation source reference count mismatch.");
if (foundation.current_counts.nityanand_misra_reference_records !== 2) fail("Foundation Nityanand Misra reference count mismatch.");
if (foundation.current_counts.evidence_records !== 0) fail("Evidence records must remain zero.");

const wordManifest = readJson("data/knowledge-base/word-of-day/production/production-bank-manifest.json");
const allowedWordManifestStatuses = [
  "production_bank_manifest_created_sanskrit_lexical_source_reference_bank",
  "production_bank_manifest_created_sacred_fallback_source_bank"
];
if (!allowedWordManifestStatuses.includes(wordManifest.status)) fail("Word manifest status mismatch.");
if (wordManifest.current_counts.source_reference_records !== 18) fail("Word manifest source reference count mismatch.");
if (wordManifest.current_counts.nityanand_misra_reference_records !== 2) fail("Word manifest Nityanand Misra reference count mismatch.");
if (wordManifest.current_counts.actual_lexical_records !== 0) fail("Actual lexical records must be zero.");
if (wordManifest.current_counts.actual_fallback_records !== 0) fail("Actual fallback records must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70f-sanskrit-lexical-source-reference-bank.json");
if (review.status !== "ag70f_sanskrit_lexical_source_reference_bank_completed") fail("Review status mismatch.");

for (const key of [
  "source_reference_bank_created",
  "source_review_policy_created",
  "source_reuse_boundary_created",
  "sacred_fallback_family_register_created",
  "nityanand_misra_review_references_added",
  "lexical_source_evidence_map_linked_to_source_reference_bank",
  "ready_for_ag70g"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "actual_sanskrit_word_records_created_now",
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

const readiness = readJson("data/content-intelligence/quality-registry/ag70f-ag70g-sacred-fallback-source-bank-readiness-record.json");
if (readiness.ready_for_ag70g !== true) fail("AG70G readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70f-to-ag70g-sacred-fallback-source-bank-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocker of [
  "generated/word-of-day.json replacement",
  "homepage UI change",
  "runtime selector activation",
  "AI-fabricated Sanskrit or meaning records",
  "unsupported etymology",
  "public Word output",
  "bulk dictionary/book content ingestion",
  "fallback word population from source-family placeholder",
  "fallback word population from review-guidance reference alone"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) {
    fail(`Boundary blocker missing: ${blocker}`);
  }
}

pass("AG70F Sanskrit lexical source-reference bank is valid.");
pass("All stated source-reference records are present, including Nityanand Misra review guidance records.");
pass("Bulk ingestion and public claims are blocked.");
pass("No Sanskrit/fallback/daily output records, UI, runtime or backend activation is recorded.");
