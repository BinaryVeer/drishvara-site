import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70R validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70r-today-panchang-context-preview-output-test.mjs",
  "scripts/validate-ag70r-today-panchang-context-preview-output-test.mjs",
  "data/knowledge-base/panchang-festival/production/ag70r-today-panchang-context-output-test.json",
  "data/knowledge-base/panchang-festival/production/ag70r-today-panchang-readable-preview.json",
  "docs/quality/AG70R_TODAY_PANCHANG_CONTEXT_READABLE_PREVIEW.md",
  "data/knowledge-base/panchang-festival/production/ag70r-output-test-audit.json",
  "data/knowledge-base/panchang-festival/production/ag70r-no-public-ui-output-audit.json",
  "data/knowledge-base/panchang-festival/production/ag70r-no-word-output-audit.json",
  "data/content-intelligence/quality-reviews/ag70r-today-panchang-context-preview-output-test.json",
  "data/content-intelligence/quality-registry/ag70r-ag70s-today-panchang-preview-manual-verification-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70r-to-ag70s-today-panchang-preview-manual-verification-boundary.json",
  "data/quality/ag70r-today-panchang-context-preview-output-test.json",
  "data/quality/ag70r-today-panchang-context-preview-output-test-preview.json",
  "docs/quality/AG70R_TODAY_PANCHANG_CONTEXT_PREVIEW_OUTPUT_TEST.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70r"]) fail("Missing generate:ag70r script.");
if (!pkg.scripts?.["validate:ag70r"]) fail("Missing validate:ag70r script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70r")) fail("validate:project must include validate:ag70r.");

const output = readJson("data/knowledge-base/panchang-festival/production/ag70r-today-panchang-context-output-test.json");
if (output.status !== "today_panchang_context_preview_output_test_created_internal_only") fail("Output test status mismatch.");
if (output.output_test_record_count !== 1) fail("Output test count must be 1.");
if (output.public_output_allowed_now !== false) fail("Public output must be blocked.");
if (output.ui_output_allowed_now !== false) fail("UI output must be blocked.");
if (output.word_output_allowed_now !== false) fail("Word output must be blocked.");
if (output.generated_word_json_modified !== false) fail("generated/word-of-day.json must not be modified.");
if (!output.readable_preview?.user_visible_draft_preview?.body_lines?.length) fail("Readable preview body missing.");

const readable = readJson("data/knowledge-base/panchang-festival/production/ag70r-today-panchang-readable-preview.json");
if (readable.preview_status !== "internal_output_test_only_not_public") fail("Readable preview status mismatch.");
if (!readable.date_key) fail("Readable preview date missing.");
if (!readable.user_visible_draft_preview?.body_lines?.length) fail("Readable user-visible draft lines missing.");
if (readable.lexical_direction_preview?.word_selection_allowed_now !== false) fail("Word selection must be blocked in readable preview.");

const audit = readJson("data/knowledge-base/panchang-festival/production/ag70r-output-test-audit.json");
if (audit.status !== "today_panchang_output_test_audit_passed") fail("Output test audit status mismatch.");
if (audit.output_test_created !== true) fail("Output test audit must confirm output test created.");
if (audit.readable_preview_created !== true) fail("Output test audit must confirm readable preview created.");
if (audit.output_public_output_allowed_now !== false) fail("Output public flag must be false.");
if (audit.manual_verification_required_before_public_use !== true) fail("Manual verification must be required.");

const noUi = readJson("data/knowledge-base/panchang-festival/production/ag70r-no-public-ui-output-audit.json");
if (noUi.status !== "no_public_ui_output_audit_passed") fail("No-UI audit status mismatch.");
for (const key of [
  "public_panchang_output_allowed_now",
  "public_observance_output_allowed_now",
  "public_eclipse_output_allowed_now",
  "homepage_ui_changed",
  "generated_files_for_public_ui_changed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (noUi[key] !== false) fail(`${key} must be false.`);
}

const noWord = readJson("data/knowledge-base/panchang-festival/production/ag70r-no-word-output-audit.json");
if (noWord.status !== "no_word_output_audit_passed") fail("No-word audit status mismatch.");
for (const key of [
  "generated_word_json_modified",
  "word_selection_performed_now",
  "runtime_word_selector_activated",
  "public_word_output_allowed_now"
]) {
  if (noWord[key] !== false) fail(`${key} must be false.`);
}
if (noWord.lexical_tokens_used_only_as_preview_context !== true) fail("Lexical tokens must be preview-only.");

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_today_panchang_context_preview_output_test",
  "production_bank_manifest_created_today_panchang_preview_manual_verification_gate",
  "production_bank_manifest_created_location_intelligence_registry_panchang_basis_normalisation",
  "production_bank_manifest_created_location_import_selection_validation",
  "production_bank_manifest_created_india_administrative_location_import_bank",
  "production_bank_manifest_created_india_cities_capitals_coordinate_bank",
  "production_bank_manifest_created_global_capitals_major_cities_coordinate_bank",
  "production_bank_manifest_created_location_selection_resolver_test",
  "production_bank_manifest_created_location_intelligence_foundation_closure",
  "production_bank_manifest_created_verified_four_location_pilot_activation",
  "production_bank_manifest_created_pilot_runtime_validation",
  "production_bank_manifest_created_pilot_ui_coordinate_input_surface",
  "production_bank_manifest_created_pilot_ui_validation"
];
if (!allowedPanchangManifestStatuses.includes(manifest.status)) fail("Panchang manifest status mismatch.");
if (manifest.current_counts.today_context_output_test_records !== 1) fail("Manifest output test count must be 1.");
if (manifest.current_counts.public_panchang_outputs !== 0) fail("Manifest public Panchang outputs must be zero.");
if (manifest.current_counts.word_output_records !== 0) fail("Manifest Word outputs must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70r-today-panchang-context-preview-output-test.json");
if (review.status !== "ag70r_today_panchang_context_preview_output_test_completed") fail("Review status mismatch.");
for (const key of [
  "today_panchang_context_output_test_created",
  "readable_preview_created",
  "ready_for_ag70s_manual_verification"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "public_panchang_output_allowed_now",
  "public_observance_output_allowed_now",
  "public_eclipse_output_allowed_now",
  "public_word_output_allowed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}
if (review.summary.output_test_record_count !== 1) fail("Review output test count must be 1.");

const readiness = readJson("data/content-intelligence/quality-registry/ag70r-ag70s-today-panchang-preview-manual-verification-readiness-record.json");
if (readiness.ready_for_ag70s !== true) fail("AG70S readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70r-to-ag70s-today-panchang-preview-manual-verification-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70S boundary must not auto-start.");
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

pass("AG70R today Panchang context preview/output test is valid.");
pass("Readable internal preview created for manual verification.");
pass("Public output, Word output, UI/backend/Supabase activation remain blocked.");
