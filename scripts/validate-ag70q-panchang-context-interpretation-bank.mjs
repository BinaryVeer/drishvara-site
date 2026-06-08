import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70Q validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70q-panchang-context-interpretation-bank.mjs",
  "scripts/validate-ag70q-panchang-context-interpretation-bank.mjs",
  "data/knowledge-base/panchang-festival/production/ag70q-panchang-context-interpretation-bank-batch-01.json",
  "data/knowledge-base/panchang-festival/production/ag70q-today-context-interpretation-preview.json",
  "data/knowledge-base/panchang-festival/production/ag70q-panchang-context-signal-map.json",
  "data/knowledge-base/panchang-festival/production/ag70q-word-context-lexical-input-preview.json",
  "data/knowledge-base/panchang-festival/production/ag70q-no-word-output-audit.json",
  "data/knowledge-base/panchang-festival/production/ag70q-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag70q-panchang-context-interpretation-bank.json",
  "data/content-intelligence/quality-registry/ag70q-ag70r-today-panchang-context-preview-output-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70q-to-ag70r-today-panchang-context-preview-output-test-boundary.json",
  "data/quality/ag70q-panchang-context-interpretation-bank.json",
  "data/quality/ag70q-panchang-context-interpretation-bank-preview.json",
  "docs/quality/AG70Q_PANCHANG_CONTEXT_INTERPRETATION_BANK.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70q"]) fail("Missing generate:ag70q script.");
if (!pkg.scripts?.["validate:ag70q"]) fail("Missing validate:ag70q script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70q")) fail("validate:project must include validate:ag70q.");

const contextBank = readJson("data/knowledge-base/panchang-festival/production/ag70q-panchang-context-interpretation-bank-batch-01.json");
if (contextBank.status !== "panchang_context_interpretation_bank_batch_01_created_public_blocked") fail("Context bank status mismatch.");
if (contextBank.context_interpretation_record_count !== 7) fail("Context interpretation record count must be 7.");
if (contextBank.public_output_record_count !== 0) fail("Public output records must be zero.");
if (contextBank.word_output_record_count !== 0) fail("Word output records must be zero.");
if (contextBank.external_source_count !== 0) fail("External source count must be zero.");
if (!Array.isArray(contextBank.records) || contextBank.records.length !== 7) fail("Context bank must have 7 records.");

for (const record of contextBank.records) {
  if (record.interpretation_status !== "internal_context_interpretation_created_public_blocked") fail(`Context record status mismatch: ${record.context_interpretation_id}`);
  if (record.external_panchang_source_used !== false) fail(`External source must be false: ${record.context_interpretation_id}`);
  if (record.public_output_allowed !== false) fail(`Public output must be false: ${record.context_interpretation_id}`);
  if (record.word_output_allowed !== false) fail(`Word output must be false: ${record.context_interpretation_id}`);
  if (record.ui_output_allowed !== false) fail(`UI output must be false: ${record.context_interpretation_id}`);
  if (!record.context_signals || !record.lexical_input_preview) fail(`Signals/lexical preview missing: ${record.context_interpretation_id}`);
  if (record.lexical_input_preview.word_selection_allowed_now !== false) fail(`Word selection must be blocked: ${record.context_interpretation_id}`);
}

const today = readJson("data/knowledge-base/panchang-festival/production/ag70q-today-context-interpretation-preview.json");
if (today.status !== "today_context_interpretation_preview_created_internal_only") fail("Today preview status mismatch.");
if (today.public_output_allowed_now !== false) fail("Today public output must be false.");
if (today.ui_output_allowed_now !== false) fail("Today UI output must be false.");
if (today.word_output_allowed_now !== false) fail("Today word output must be false.");
if (!today.preview_record) fail("Today preview record missing.");

const signalMap = readJson("data/knowledge-base/panchang-festival/production/ag70q-panchang-context-signal-map.json");
if (signalMap.status !== "panchang_context_signal_map_created") fail("Signal map status mismatch.");
if (signalMap.signal_record_count !== 7) fail("Signal map count must be 7.");

const lexical = readJson("data/knowledge-base/panchang-festival/production/ag70q-word-context-lexical-input-preview.json");
if (lexical.status !== "word_context_lexical_input_preview_created_no_word_output") fail("Lexical input preview status mismatch.");
if (lexical.lexical_input_record_count !== 7) fail("Lexical input record count must be 7.");
if (lexical.word_selection_performed_now !== false) fail("Word selection must be false.");
if (lexical.generated_word_json_modified !== false) fail("generated/word-of-day.json must not be modified.");
if (lexical.public_word_output_allowed_now !== false) fail("Public word output must be false.");

const noWord = readJson("data/knowledge-base/panchang-festival/production/ag70q-no-word-output-audit.json");
if (noWord.status !== "no_word_output_audit_passed") fail("No-word audit status mismatch.");
for (const key of [
  "generated_word_json_modified",
  "word_selection_performed_now",
  "public_word_output_allowed_now",
  "runtime_word_selector_activated"
]) {
  if (noWord[key] !== false) fail(`${key} must be false.`);
}
for (const key of [
  "morphology_bank_records_created_now",
  "etymology_bank_records_created_now",
  "semantics_bank_records_created_now",
  "sacred_fallback_word_records_created_now"
]) {
  if (noWord[key] !== 0) fail(`${key} must be zero.`);
}

const noPublic = readJson("data/knowledge-base/panchang-festival/production/ag70q-no-public-output-audit.json");
if (noPublic.status !== "no_public_output_audit_passed") fail("No-public audit status mismatch.");
for (const key of [
  "public_panchang_output_allowed_now",
  "public_observance_output_allowed_now",
  "public_eclipse_output_allowed_now",
  "public_word_output_allowed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (noPublic[key] !== false) fail(`${key} must be false.`);
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_panchang_context_interpretation_bank_batch_01",
  "production_bank_manifest_created_today_panchang_context_preview_output_test",
  "production_bank_manifest_created_today_panchang_preview_manual_verification_gate",
  "production_bank_manifest_created_location_intelligence_registry_panchang_basis_normalisation",
  "production_bank_manifest_created_location_import_selection_validation",
  "production_bank_manifest_created_india_administrative_location_import_bank",
  "production_bank_manifest_created_india_cities_capitals_coordinate_bank",
  "production_bank_manifest_created_global_capitals_major_cities_coordinate_bank",
  "production_bank_manifest_created_location_selection_resolver_test",
  "production_bank_manifest_created_location_intelligence_foundation_closure",
  "production_bank_manifest_created_verified_four_location_pilot_activation"
];
if (!allowedPanchangManifestStatuses.includes(manifest.status)) fail("Panchang manifest status mismatch.");
if (manifest.current_counts.context_interpretation_records !== 7) fail("Manifest context count must be 7.");
if (manifest.current_counts.today_context_preview_records !== 1) fail("Manifest today preview count must be 1.");
if (manifest.current_counts.word_output_records !== 0) fail("Manifest word output records must remain zero.");
if (manifest.current_counts.public_panchang_outputs !== 0) fail("Manifest public output count must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70q-panchang-context-interpretation-bank.json");
if (review.status !== "ag70q_panchang_context_interpretation_bank_completed") fail("Review status mismatch.");
for (const key of [
  "context_interpretation_bank_created",
  "today_context_preview_created",
  "signal_map_created",
  "lexical_input_preview_created",
  "ready_for_ag70r"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "word_selection_performed_now",
  "generated_word_json_modified",
  "external_panchang_sites_used_as_source",
  "external_panchang_sites_used_for_data_generation",
  "external_panchang_sites_used_as_runtime_dependency",
  "external_panchang_sites_used_as_validation_source",
  "public_panchang_output_allowed_now",
  "public_observance_output_allowed_now",
  "public_eclipse_output_allowed_now",
  "public_word_output_allowed_now",
  "ui_display_changed",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}
if (review.summary.context_interpretation_record_count !== 7) fail("Review context count must be 7.");
if (review.summary.today_preview_record_count !== 1) fail("Review today preview count must be 1.");

const readiness = readJson("data/content-intelligence/quality-registry/ag70q-ag70r-today-panchang-context-preview-output-test-readiness-record.json");
if (readiness.ready_for_ag70r !== true) fail("AG70R readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70q-to-ag70r-today-panchang-context-preview-output-test-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70R boundary must not auto-start.");
for (const blocker of [
  "public Panchang output",
  "public observance event publication",
  "public eclipse event publication",
  "generated/word-of-day.json replacement",
  "homepage UI change",
  "runtime Word selector activation",
  "external Panchang site as source of truth",
  "external Panchang site as data-generation input",
  "external Panchang site as runtime dependency",
  "external Panchang site as production validation source"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) fail(`Boundary blocker missing: ${blocker}`);
}

pass("AG70Q Panchang context interpretation bank is valid.");
pass("Seven context records and one today internal preview are created.");
pass("Word output, public output, UI/backend/Supabase activation remain blocked.");
