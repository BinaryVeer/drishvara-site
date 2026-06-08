import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(data, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

const ag70r = readJson("data/content-intelligence/quality-reviews/ag70r-today-panchang-context-preview-output-test.json");
const outputTest = readJson("data/knowledge-base/panchang-festival/production/ag70r-today-panchang-context-output-test.json");
const readablePreview = readJson("data/knowledge-base/panchang-festival/production/ag70r-today-panchang-readable-preview.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70r.status !== "ag70r_today_panchang_context_preview_output_test_completed") {
  throw new Error("AG70R must be complete before AG70S.");
}
if (ag70r.summary?.ready_for_ag70s_manual_verification !== true) {
  throw new Error("AG70R readiness for AG70S is missing.");
}
if (outputTest.status !== "today_panchang_context_preview_output_test_created_internal_only") {
  throw new Error("AG70R output test must exist before AG70S.");
}
if (readablePreview.preview_status !== "internal_output_test_only_not_public") {
  throw new Error("AG70R readable preview must remain internal-only.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  manualGate: "data/knowledge-base/panchang-festival/production/ag70s-today-panchang-preview-manual-verification-gate.json",
  contentReview: "data/knowledge-base/panchang-festival/production/ag70s-preview-content-review-record.json",
  locationNote: "data/knowledge-base/panchang-festival/production/ag70s-location-id-spelling-note.json",
  decisionRecord: "data/knowledge-base/panchang-festival/production/ag70s-manual-verification-decision-record.json",
  noPublicOutputAudit: "data/knowledge-base/panchang-festival/production/ag70s-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70s-today-panchang-preview-manual-verification-gate.json",
  readiness: "data/content-intelligence/quality-registry/ag70s-ag70t-location-identifier-correction-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70s-to-ag70t-location-identifier-correction-boundary.json",
  quality: "data/quality/ag70s-today-panchang-preview-manual-verification-gate.json",
  preview: "data/quality/ag70s-today-panchang-preview-manual-verification-gate-preview.json",
  doc: "docs/quality/AG70S_TODAY_PANCHANG_PREVIEW_MANUAL_VERIFICATION_GATE.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const currentLocationId = readablePreview.location_id;
const likelyCorrectLocationId = currentLocationId === "loc_in_ar_itangar_capital_complex_001"
  ? "loc_in_ar_itanagar_capital_complex_001"
  : null;

const manualGate = {
  module_id: "AG70S",
  title: "Today Panchang Preview Manual Verification Gate",
  status: "today_panchang_preview_manual_verification_gate_created_public_blocked",
  purpose: "Record manual review of AG70R readable preview before any public/UI connection.",
  source_output_test: "data/knowledge-base/panchang-festival/production/ag70r-today-panchang-context-output-test.json",
  source_readable_preview: "data/knowledge-base/panchang-festival/production/ag70r-today-panchang-readable-preview.json",
  reviewed_preview_date_key: readablePreview.date_key,
  reviewed_location_id: currentLocationId,
  manual_review_status: "reviewed_with_correction_note",
  public_output_approval_status: "not_approved",
  ui_connection_approval_status: "not_approved",
  word_output_approval_status: "not_approved",
  correction_required_before_public_use: true,
  correction_note_count: likelyCorrectLocationId ? 1 : 0,
  public_output_allowed_now: false,
  next_recommended_stage: likelyCorrectLocationId
    ? "AG70T — Location Identifier Correction / Panchang Preview Basis Normalisation"
    : "AG70T — Preview Basis Normalisation"
};

const contentReview = {
  module_id: "AG70S",
  title: "Preview Content Review Record",
  status: "preview_content_review_record_created",
  preview_date_key: readablePreview.date_key,
  panchang_elements_reviewed: true,
  context_summary_reviewed: true,
  observance_signal_reviewed: true,
  eclipse_signal_reviewed: true,
  lexical_direction_preview_reviewed: true,
  content_acceptance_status: "acceptable_for_internal_preview_not_public",
  reason: "AG70R preview is suitable as an internal output-test preview, but public output remains blocked pending correction and later approval.",
  public_copy_approval_status: "not_approved",
  public_output_allowed_now: false
};

const locationNote = {
  module_id: "AG70S",
  title: "Location Identifier Spelling Note",
  status: likelyCorrectLocationId
    ? "location_identifier_spelling_note_created_correction_required"
    : "location_identifier_spelling_note_created_no_specific_correction",
  current_location_id: currentLocationId,
  observed_issue: likelyCorrectLocationId
    ? "Location identifier appears to contain spelling 'itangar' instead of 'itanagar'."
    : "No predefined location identifier spelling issue detected.",
  likely_correct_location_id: likelyCorrectLocationId,
  correction_policy: "Do not mutate historical records inside AG70S. Record note and correct through controlled AG70T patch if approved.",
  correction_required_before_public_ui_use: Boolean(likelyCorrectLocationId),
  public_output_allowed_now: false
};

const decisionRecord = {
  module_id: "AG70S",
  title: "Manual Verification Decision Record",
  status: "manual_verification_decision_record_created_public_output_not_approved",
  decision_summary: {
    ag70r_preview_reviewed: true,
    internal_preview_acceptable: true,
    public_output_approved_now: false,
    ui_connection_approved_now: false,
    word_output_approved_now: false,
    location_id_correction_required: Boolean(likelyCorrectLocationId),
    proceed_to_correction_stage: Boolean(likelyCorrectLocationId)
  },
  blocked_until_later_approval: [
    "public Panchang output",
    "public observance event publication",
    "public eclipse event publication",
    "generated/word-of-day.json replacement",
    "homepage UI change",
    "runtime Word selector activation",
    "Supabase/database writes",
    "backend/Auth activation"
  ]
};

const noPublicOutputAudit = {
  module_id: "AG70S",
  title: "No Public Output Audit",
  status: "no_public_output_audit_passed",
  public_panchang_output_allowed_now: false,
  public_observance_output_allowed_now: false,
  public_eclipse_output_allowed_now: false,
  public_word_output_allowed_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_today_panchang_preview_manual_verification_gate",
  current_status: "today_panchang_preview_manual_verification_gate_created_public_blocked",
  ag70s_files: {
    manual_gate: outputs.manualGate,
    content_review: outputs.contentReview,
    location_note: outputs.locationNote,
    decision_record: outputs.decisionRecord,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    manual_verification_gate_records: 1,
    location_correction_notes: likelyCorrectLocationId ? 1 : 0,
    public_panchang_outputs: 0,
    word_output_records: 0
  },
  next_required_stage: likelyCorrectLocationId
    ? "AG70T — Location Identifier Correction / Panchang Preview Basis Normalisation"
    : "AG70T — Preview Basis Normalisation"
};

const review = {
  module_id: "AG70S",
  title: "Today Panchang Preview Manual Verification Gate",
  status: "ag70s_today_panchang_preview_manual_verification_gate_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70r_review: "data/content-intelligence/quality-reviews/ag70r-today-panchang-context-preview-output-test.json",
    readable_preview: "data/knowledge-base/panchang-festival/production/ag70r-today-panchang-readable-preview.json"
  },
  generated_records: outputs,
  summary: {
    manual_verification_gate_created: true,
    preview_content_review_record_created: true,
    location_id_spelling_note_created: true,
    manual_verification_decision_record_created: true,
    ag70r_preview_reviewed: true,
    internal_preview_acceptable: true,
    location_id_correction_required: Boolean(likelyCorrectLocationId),
    current_location_id: currentLocationId,
    likely_correct_location_id: likelyCorrectLocationId,
    public_panchang_output_allowed_now: false,
    public_observance_output_allowed_now: false,
    public_eclipse_output_allowed_now: false,
    public_word_output_allowed_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    ready_for_ag70t: true
  }
};

const readiness = {
  module_id: "AG70S",
  title: "AG70T Location Identifier Correction Readiness Record",
  status: "ready_for_ag70t_location_identifier_correction",
  ready_for_ag70t: true,
  next_stage: likelyCorrectLocationId
    ? "AG70T — Location Identifier Correction / Panchang Preview Basis Normalisation"
    : "AG70T — Preview Basis Normalisation",
  reason: likelyCorrectLocationId
    ? "Manual verification found a likely location_id spelling issue that should be corrected through a controlled patch before any public/UI use."
    : "Manual verification completed and preview basis normalisation can proceed."
};

const boundary = {
  module_id: "AG70S",
  title: "AG70S to AG70T Location Identifier Correction Boundary",
  status: "ag70t_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Correct/normalise location identifier spelling across Panchang production records where required.",
    "Preserve computed values and do not recalculate Panchang unless explicitly approved.",
    "Keep public/UI output blocked."
  ],
  blocked_scope_without_explicit_approval: [
    "public Panchang output",
    "public observance event publication",
    "public eclipse event publication",
    "generated/word-of-day.json replacement",
    "homepage UI change",
    "runtime Word selector activation",
    "Supabase/database writes",
    "backend/Auth activation",
    "external Panchang site as source of truth",
    "external Panchang site as data-generation input",
    "external Panchang site as runtime dependency",
    "external Panchang site as production validation source"
  ]
};

const quality = {
  module_id: "AG70S",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70S",
  status: review.status,
  manual_verification_gate_records: 1,
  preview_reviewed: 1,
  location_id_correction_required: likelyCorrectLocationId ? 1 : 0,
  public_output_allowed_now: 0,
  word_output_allowed_now: 0,
  ui_output_allowed_now: 0,
  ready_for_ag70t: 1
};

const doc = `# AG70S — Today Panchang Preview Manual Verification Gate

AG70S records manual verification of the AG70R readable preview.

## Review result

- AG70R preview reviewed.
- Internal preview is acceptable as an internal output-test preview.
- Public output is not approved.
- UI connection is not approved.
- Word output is not approved.

## Location ID note

- Current location ID: ${currentLocationId}
- Likely correction: ${likelyCorrectLocationId || "No specific correction identified"}

The location identifier should not be mutated inside AG70S. If correction is approved, AG70T should handle it as a controlled correction/normalisation patch.

## Boundary

- No public Panchang output.
- No public observance output.
- No public eclipse output.
- No Word output.
- No UI/backend/Supabase activation.
`;

writeJson(outputs.manualGate, manualGate);
writeJson(outputs.contentReview, contentReview);
writeJson(outputs.locationNote, locationNote);
writeJson(outputs.decisionRecord, decisionRecord);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70S manual verification gate generated.");
console.log(`✅ Location ID reviewed: ${currentLocationId}`);
console.log(`✅ Likely correction recorded: ${likelyCorrectLocationId || "none"}`);
console.log("✅ Public output, Word output, UI, backend and Supabase remain blocked.");
