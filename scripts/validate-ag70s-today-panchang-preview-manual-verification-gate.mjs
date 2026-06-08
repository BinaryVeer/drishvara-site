import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70S validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70s-today-panchang-preview-manual-verification-gate.mjs",
  "scripts/validate-ag70s-today-panchang-preview-manual-verification-gate.mjs",
  "data/knowledge-base/panchang-festival/production/ag70s-today-panchang-preview-manual-verification-gate.json",
  "data/knowledge-base/panchang-festival/production/ag70s-preview-content-review-record.json",
  "data/knowledge-base/panchang-festival/production/ag70s-location-id-spelling-note.json",
  "data/knowledge-base/panchang-festival/production/ag70s-manual-verification-decision-record.json",
  "data/knowledge-base/panchang-festival/production/ag70s-no-public-output-audit.json",
  "data/content-intelligence/quality-reviews/ag70s-today-panchang-preview-manual-verification-gate.json",
  "data/content-intelligence/quality-registry/ag70s-ag70t-location-identifier-correction-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70s-to-ag70t-location-identifier-correction-boundary.json",
  "data/quality/ag70s-today-panchang-preview-manual-verification-gate.json",
  "data/quality/ag70s-today-panchang-preview-manual-verification-gate-preview.json",
  "docs/quality/AG70S_TODAY_PANCHANG_PREVIEW_MANUAL_VERIFICATION_GATE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70s"]) fail("Missing generate:ag70s script.");
if (!pkg.scripts?.["validate:ag70s"]) fail("Missing validate:ag70s script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70s")) fail("validate:project must include validate:ag70s.");

const gate = readJson("data/knowledge-base/panchang-festival/production/ag70s-today-panchang-preview-manual-verification-gate.json");
if (gate.status !== "today_panchang_preview_manual_verification_gate_created_public_blocked") fail("Manual gate status mismatch.");
if (gate.manual_review_status !== "reviewed_with_correction_note") fail("Manual review status mismatch.");
if (gate.public_output_approval_status !== "not_approved") fail("Public output approval must be not_approved.");
if (gate.ui_connection_approval_status !== "not_approved") fail("UI connection approval must be not_approved.");
if (gate.word_output_approval_status !== "not_approved") fail("Word output approval must be not_approved.");
if (gate.public_output_allowed_now !== false) fail("Public output must be false.");

const content = readJson("data/knowledge-base/panchang-festival/production/ag70s-preview-content-review-record.json");
if (content.status !== "preview_content_review_record_created") fail("Content review status mismatch.");
if (content.content_acceptance_status !== "acceptable_for_internal_preview_not_public") fail("Content acceptance status mismatch.");
if (content.public_output_allowed_now !== false) fail("Content public output must be false.");

const location = readJson("data/knowledge-base/panchang-festival/production/ag70s-location-id-spelling-note.json");
if (location.status !== "location_identifier_spelling_note_created_correction_required") fail("Location note status mismatch.");
if (location.current_location_id !== "loc_in_ar_itangar_capital_complex_001") fail("Current location id mismatch.");
if (location.likely_correct_location_id !== "loc_in_ar_itanagar_capital_complex_001") fail("Likely correct location id mismatch.");
if (location.correction_required_before_public_ui_use !== true) fail("Location correction must be required before public UI use.");
if (location.public_output_allowed_now !== false) fail("Location note public output must be false.");

const decision = readJson("data/knowledge-base/panchang-festival/production/ag70s-manual-verification-decision-record.json");
if (decision.status !== "manual_verification_decision_record_created_public_output_not_approved") fail("Decision status mismatch.");
if (decision.decision_summary.ag70r_preview_reviewed !== true) fail("AG70R preview must be reviewed.");
if (decision.decision_summary.internal_preview_acceptable !== true) fail("Internal preview must be acceptable.");
if (decision.decision_summary.public_output_approved_now !== false) fail("Public output must not be approved.");
if (decision.decision_summary.location_id_correction_required !== true) fail("Location correction must be required.");

const noPublic = readJson("data/knowledge-base/panchang-festival/production/ag70s-no-public-output-audit.json");
if (noPublic.status !== "no_public_output_audit_passed") fail("No-public audit status mismatch.");
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
  if (noPublic[key] !== false) fail(`${key} must be false.`);
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_today_panchang_preview_manual_verification_gate",
  "production_bank_manifest_created_location_intelligence_registry_panchang_basis_normalisation",
  "production_bank_manifest_created_location_import_selection_validation",
  "production_bank_manifest_created_india_administrative_location_import_bank",
  "production_bank_manifest_created_india_cities_capitals_coordinate_bank",
  "production_bank_manifest_created_global_capitals_major_cities_coordinate_bank"
];
if (!allowedPanchangManifestStatuses.includes(manifest.status)) fail("Panchang manifest status mismatch.");
if (manifest.current_counts.manual_verification_gate_records !== 1) fail("Manual gate count must be 1.");
if (manifest.current_counts.location_correction_notes !== 1) fail("Location correction note count must be 1.");
if (manifest.current_counts.public_panchang_outputs !== 0) fail("Public Panchang outputs must be zero.");
if (manifest.current_counts.word_output_records !== 0) fail("Word output records must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70s-today-panchang-preview-manual-verification-gate.json");
if (review.status !== "ag70s_today_panchang_preview_manual_verification_gate_completed") fail("Review status mismatch.");
for (const key of [
  "manual_verification_gate_created",
  "preview_content_review_record_created",
  "location_id_spelling_note_created",
  "manual_verification_decision_record_created",
  "ag70r_preview_reviewed",
  "internal_preview_acceptable",
  "location_id_correction_required",
  "ready_for_ag70t"
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

const readiness = readJson("data/content-intelligence/quality-registry/ag70s-ag70t-location-identifier-correction-readiness-record.json");
if (readiness.ready_for_ag70t !== true) fail("AG70T readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70s-to-ag70t-location-identifier-correction-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70T boundary must not auto-start.");
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

pass("AG70S today Panchang preview manual verification gate is valid.");
pass("Location ID spelling note recorded for controlled AG70T correction.");
pass("Public output, Word output, UI/backend/Supabase activation remain blocked.");
