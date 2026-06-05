import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69D validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69d-word-source-acquisition-reference-bank.mjs",
  "scripts/validate-ag69d-word-source-acquisition-reference-bank.mjs",
  "data/knowledge-base/word-of-day/ag69d-vedic-tradition-aligned-source-policy.json",
  "data/knowledge-base/word-of-day/ag69d-source-reference-bank-metadata.json",
  "data/knowledge-base/word-of-day/ag69d-source-verification-register.json",
  "data/knowledge-base/word-of-day/ag69d-published-work-candidate-source-register.json",
  "data/knowledge-base/word-of-day/ag69d-source-use-and-reuse-matrix.json",
  "data/knowledge-base/word-of-day/ag69d-candidate-word-source-mapping-rules.json",
  "data/knowledge-base/word-of-day/ag69d-source-acquisition-no-content-ingestion-audit.json",
  "data/content-intelligence/backend-architecture/ag69d-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69d-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag69d-ag69e-word-source-mapping-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69d-to-ag69e-word-source-mapping-boundary.json",
  "data/content-intelligence/quality-reviews/ag69d-word-source-acquisition-reference-bank.json",
  "data/quality/ag69d-word-source-acquisition-reference-bank.json",
  "data/quality/ag69d-word-source-acquisition-reference-bank-preview.json",
  "docs/quality/AG69D_WORD_SOURCE_ACQUISITION_REFERENCE_BANK.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69d"]) fail("Missing generate:ag69d script.");
if (!pkg.scripts?.["validate:ag69d"]) fail("Missing validate:ag69d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69d")) fail("validate:project must include validate:ag69d.");

const review = readJson("data/content-intelligence/quality-reviews/ag69d-word-source-acquisition-reference-bank.json");
if (review.status !== "ag69d_word_source_acquisition_reference_bank_completed") fail("Review status mismatch.");

for (const key of [
  "ag69c_consumed",
  "vedic_tradition_aligned_source_policy_recorded",
  "source_reference_bank_metadata_created",
  "primary_and_lexical_source_families_recorded",
  "published_work_candidate_sources_recorded",
  "nityanand_misra_published_work_candidates_recorded_metadata_only",
  "public_attribution_of_internal_influence_blocked",
  "source_use_reuse_matrix_created",
  "candidate_source_mapping_rules_defined",
  "ready_for_ag69e"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "source_content_ingested",
  "bulk_copyrighted_ingestion",
  "approved_word_records_created",
  "generated_word_json_modified",
  "public_word_output_created",
  "ui_display_changed",
  "supabase_database_write_performed",
  "backend_runtime_activated",
  "database_runtime_activated",
  "service_role_used",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const policy = readJson("data/knowledge-base/word-of-day/ag69d-vedic-tradition-aligned-source-policy.json");
for (const preferred of [
  "primary_text_or_institutional_vedic_reference",
  "recognised_lexical_reference",
  "corpus_or_attestation_reference",
  "traditional_or_textual_discipline_published_work"
]) {
  if (!policy.preferred_source_order.includes(preferred)) fail(`Preferred source missing: ${preferred}`);
}
for (const restricted of [
  "modern_commentary_context_only",
  "opinion_blog_blocked_unless_independently_verified",
  "ai_generated_claim_blocked"
]) {
  if (!policy.restricted_source_order.includes(restricted)) fail(`Restricted source rule missing: ${restricted}`);
}
if (!policy.internal_discipline_rule.includes("Nityanand Misra")) fail("Nityanand Misra candidate handling missing.");

const bank = readJson("data/knowledge-base/word-of-day/ag69d-source-reference-bank-metadata.json");
if (bank.source_reference_count < 8) fail("At least 8 source references expected.");
if (bank.source_content_ingested !== false) fail("Source content must not be ingested.");
if (bank.bulk_copyrighted_ingestion !== false) fail("Bulk copyrighted ingestion must be false.");
if (bank.approved_word_records_created !== false) fail("Approved word records must not be created.");
if (bank.public_word_output_created !== false) fail("Public word output must not be created.");

const categories = new Set(bank.source_references.map((x) => x.source_category));
for (const requiredCategory of [
  "primary_text_or_institutional_vedic_reference",
  "lexical_reference",
  "corpus_attestation_reference",
  "machine_readable_text_reference",
  "hindi_lexical_or_institutional_reference"
]) {
  if (!categories.has(requiredCategory)) fail(`Missing source category: ${requiredCategory}`);
}

for (const source of bank.source_references) {
  if (!source.source_reference_id) fail("Source reference id missing.");
  if (!source.source_url?.startsWith("https://")) fail(`Source URL must be https: ${source.source_reference_id}`);
  if (source.public_claim_allowed_now !== false) fail(`Public claim must be false now: ${source.source_reference_id}`);
  if (source.public_attribution_allowed_now !== false) fail(`Public attribution must be false now: ${source.source_reference_id}`);
}

const published = readJson("data/knowledge-base/word-of-day/ag69d-published-work-candidate-source-register.json");
if (published.public_attribution_allowed_now !== false) fail("Published-work public attribution must be false.");
if (published.content_ingested_now !== false) fail("Published-work content ingestion must be false.");
if (published.approved_source_now !== false) fail("Published works must not be approved sources now.");
if (!Array.isArray(published.candidates) || published.candidates.length < 2) fail("Published-work candidates missing.");
if (!published.candidates.some((x) => x.author_or_editor.includes("Nityanand") || x.author_or_editor.includes("Nityananda"))) fail("Nityanand/Nityananda published-work candidate missing.");
for (const candidate of published.candidates) {
  if (candidate.public_attribution_allowed_now !== false) fail("Candidate public attribution must be false.");
  if (candidate.content_ingested_now !== false) fail("Candidate content ingestion must be false.");
  if (candidate.approved_source_now !== false) fail("Candidate approved source must be false.");
}

const matrix = readJson("data/knowledge-base/word-of-day/ag69d-source-use-and-reuse-matrix.json");
const bulk = matrix.use_classes.find((x) => x.use_class === "bulk_ingestion");
if (!bulk || bulk.allowed_now !== false) fail("Bulk ingestion must be blocked.");

const mapping = readJson("data/knowledge-base/word-of-day/ag69d-candidate-word-source-mapping-rules.json");
if (mapping.mapping_applied_now !== false) fail("Mapping must not be applied now.");
if (mapping.word_records_modified_now !== false) fail("Word records must not be modified now.");
if (!mapping.rules.includes("No candidate source mapping can feed public output.")) fail("Public output mapping blocker missing.");

const acquisitionAudit = readJson("data/knowledge-base/word-of-day/ag69d-source-acquisition-no-content-ingestion-audit.json");
if (acquisitionAudit.audit_passed !== true) fail("Source acquisition audit must pass.");
if (acquisitionAudit.failed_checks.length !== 0) fail("Source acquisition audit failed_checks must be empty.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69d-ag69e-word-source-mapping-readiness-record.json");
if (readiness.ready_for_ag69e !== true) fail("AG69E readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69d-to-ag69e-word-source-mapping-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocked of [
  "source content bulk ingestion",
  "approved word bank creation",
  "generated/word-of-day.json replacement",
  "public attribution of internal study influence",
  "Nityanand Misra published-work public attribution without exact verification",
  "Supabase/database writes",
  "V02 expansion"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocked)) fail(`Boundary blocker missing: ${blocked}`);
}

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag69d-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69d-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG69D Word source acquisition reference bank is present.");
pass("Vedic-tradition-aligned source policy is valid.");
pass("Source-reference metadata bank is valid and contains primary/lexical/corpus/institutional source families.");
pass("Nityanand Misra published-work candidates are recorded metadata-only with public attribution blocked.");
pass("No source content ingestion, approved word output, UI change, Supabase/database/backend/service-role/V02 activation is recorded.");
