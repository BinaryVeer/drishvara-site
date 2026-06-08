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

const ag70q = readJson("data/content-intelligence/quality-reviews/ag70q-panchang-context-interpretation-bank.json");
const todayContext = readJson("data/knowledge-base/panchang-festival/production/ag70q-today-context-interpretation-preview.json");
const contextBank = readJson("data/knowledge-base/panchang-festival/production/ag70q-panchang-context-interpretation-bank-batch-01.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70q.status !== "ag70q_panchang_context_interpretation_bank_completed") {
  throw new Error("AG70Q must be complete before AG70R.");
}
if (ag70q.summary?.ready_for_ag70r !== true) {
  throw new Error("AG70Q readiness for AG70R is missing.");
}
if (todayContext.status !== "today_context_interpretation_preview_created_internal_only") {
  throw new Error("AG70Q today context preview must exist before AG70R.");
}
if (!todayContext.preview_record) {
  throw new Error("AG70R requires a preview_record from AG70Q.");
}
if (contextBank.context_interpretation_record_count !== 7) {
  throw new Error("AG70R requires 7 AG70Q context records.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  outputTest: "data/knowledge-base/panchang-festival/production/ag70r-today-panchang-context-output-test.json",
  readablePreviewJson: "data/knowledge-base/panchang-festival/production/ag70r-today-panchang-readable-preview.json",
  readablePreviewMd: "docs/quality/AG70R_TODAY_PANCHANG_CONTEXT_READABLE_PREVIEW.md",
  outputTestAudit: "data/knowledge-base/panchang-festival/production/ag70r-output-test-audit.json",
  noPublicUiAudit: "data/knowledge-base/panchang-festival/production/ag70r-no-public-ui-output-audit.json",
  noWordOutputAudit: "data/knowledge-base/panchang-festival/production/ag70r-no-word-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70r-today-panchang-context-preview-output-test.json",
  readiness: "data/content-intelligence/quality-registry/ag70r-ag70s-today-panchang-preview-manual-verification-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70r-to-ag70s-today-panchang-preview-manual-verification-boundary.json",
  quality: "data/quality/ag70r-today-panchang-context-preview-output-test.json",
  preview: "data/quality/ag70r-today-panchang-context-preview-output-test-preview.json",
  doc: "docs/quality/AG70R_TODAY_PANCHANG_CONTEXT_PREVIEW_OUTPUT_TEST.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const record = todayContext.preview_record;
const elements = record.panchang_elements || {};
const summaryLines = record.internal_interpretation_summary?.summary_lines || [];
const observances = record.observance_candidates || [];
const lexicalTokens = record.lexical_input_preview?.suggested_context_tokens || [];

const readableSections = {
  title: "Today’s Panchang Context Preview",
  preview_status: "internal_output_test_only_not_public",
  date_key: record.date_key,
  location_id: record.location_id,
  timezone: record.timezone,
  panchang_elements: {
    tithi: elements.tithi?.name || null,
    tithi_index: elements.tithi?.index || null,
    nakshatra: elements.nakshatra?.name || null,
    nakshatra_index: elements.nakshatra?.index || null,
    yoga: elements.yoga?.name || null,
    yoga_index: elements.yoga?.index || null,
    karana: elements.karana?.name || null,
    karana_index: elements.karana?.index || null,
    paksha: elements.paksha || null,
    vara: elements.vara || null,
    sunrise: elements.sunrise_datetime_local || null,
    sunset: elements.sunset_datetime_local || null
  },
  context_summary_lines: summaryLines,
  observance_candidates: observances.map((item) => ({
    display_name: item.display_name,
    observance_key: item.observance_key,
    status: item.event_status,
    publication_status: item.publication_status,
    public_output_allowed: item.public_output_allowed
  })),
  eclipse_screening_note: record.eclipse_screening?.signal || null,
  lexical_direction_preview: {
    status: "context_tokens_only_no_word_selection",
    tokens: lexicalTokens,
    word_selection_allowed_now: false
  },
  user_visible_draft_preview: {
    headline: `Today’s Panchang Context — ${record.date_key}`,
    body_lines: [
      `For ${record.date_key}, the internal Panchang context is based on ${elements.tithi?.name || "the recorded Tithi"} in ${elements.paksha || "the recorded Paksha"}.`,
      `The recorded Nakshatra, Yoga and Karana are ${elements.nakshatra?.name || "not available"}, ${elements.yoga?.name || "not available"} and ${elements.karana?.name || "not available"} respectively.`,
      observances.length > 0
        ? `Internal observance signal: ${observances.map((x) => x.display_name).join(", ")}.`
        : "No internal observance candidate is flagged for this preview date.",
      record.eclipse_screening?.signal === "syzygy_screening_candidate_but_not_confirmed"
        ? "Eclipse screening remains unconfirmed because the node-distance model is not yet active."
        : "No confirmed eclipse signal is produced for this preview.",
      "This is an internal preview only and is not yet approved for public display."
    ]
  }
};

const outputTest = {
  module_id: "AG70R",
  title: "Today Panchang Context Preview / Output Test",
  status: "today_panchang_context_preview_output_test_created_internal_only",
  purpose: "Create a readable internal output-test preview from AG70Q context interpretation for manual verification.",
  source_today_preview: "data/knowledge-base/panchang-festival/production/ag70q-today-context-interpretation-preview.json",
  source_context_bank: "data/knowledge-base/panchang-festival/production/ag70q-panchang-context-interpretation-bank-batch-01.json",
  selected_preview_date_key: record.date_key,
  requested_today_key_Asia_Kolkata: todayContext.requested_today_key_Asia_Kolkata,
  selected_from_batch_fallback_used: todayContext.selected_from_batch_fallback_used,
  output_test_record_count: 1,
  public_output_allowed_now: false,
  ui_output_allowed_now: false,
  word_output_allowed_now: false,
  generated_word_json_modified: false,
  readable_preview: readableSections
};

const outputTestAudit = {
  module_id: "AG70R",
  title: "Today Panchang Output Test Audit",
  status: "today_panchang_output_test_audit_passed",
  output_test_created: true,
  readable_preview_created: true,
  selected_preview_date_key: record.date_key,
  source_context_interpretation_id: record.context_interpretation_id,
  source_public_output_allowed: record.public_output_allowed,
  output_public_output_allowed_now: false,
  manual_verification_required_before_public_use: true
};

const noPublicUiAudit = {
  module_id: "AG70R",
  title: "No Public UI Output Audit",
  status: "no_public_ui_output_audit_passed",
  public_panchang_output_allowed_now: false,
  public_observance_output_allowed_now: false,
  public_eclipse_output_allowed_now: false,
  homepage_ui_changed: false,
  generated_files_for_public_ui_changed: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false
};

const noWordOutputAudit = {
  module_id: "AG70R",
  title: "No Word Output Audit",
  status: "no_word_output_audit_passed",
  generated_word_json_modified: false,
  word_selection_performed_now: false,
  runtime_word_selector_activated: false,
  public_word_output_allowed_now: false,
  lexical_tokens_used_only_as_preview_context: true
};

const readableMd = `# AG70R — Today Panchang Context Readable Preview

> Internal output test only. Not approved for public display.

## Preview Date

${record.date_key}

## Location / Timezone

- Location ID: ${record.location_id}
- Timezone: ${record.timezone}

## Panchang Elements

| Element | Value |
|---|---|
| Tithi | ${readableSections.panchang_elements.tithi || "Not available"} |
| Nakshatra | ${readableSections.panchang_elements.nakshatra || "Not available"} |
| Yoga | ${readableSections.panchang_elements.yoga || "Not available"} |
| Karana | ${readableSections.panchang_elements.karana || "Not available"} |
| Paksha | ${readableSections.panchang_elements.paksha || "Not available"} |
| Vara | ${readableSections.panchang_elements.vara || "Not available"} |
| Sunrise | ${readableSections.panchang_elements.sunrise || "Not available"} |
| Sunset | ${readableSections.panchang_elements.sunset || "Not available"} |

## Internal Context Summary

${readableSections.user_visible_draft_preview.body_lines.map((line) => `- ${line}`).join("\n")}

## Observance Candidate Signal

${observances.length > 0 ? observances.map((x) => `- ${x.display_name} — ${x.publication_status}`).join("\n") : "- No internal observance candidate flagged."}

## Lexical Direction Preview

No Word of the Day is generated in AG70R. Context tokens only:

${lexicalTokens.map((token) => `- ${token}`).join("\n") || "- No lexical tokens available."}

## Boundary

- No public Panchang output.
- No public observance output.
- No public eclipse output.
- No Word output.
- No UI/backend/Supabase activation.
`;

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_today_panchang_context_preview_output_test",
  current_status: "today_panchang_context_preview_output_test_created_internal_only",
  ag70r_files: {
    output_test: outputs.outputTest,
    readable_preview_json: outputs.readablePreviewJson,
    readable_preview_md: outputs.readablePreviewMd,
    output_test_audit: outputs.outputTestAudit,
    no_public_ui_audit: outputs.noPublicUiAudit,
    no_word_output_audit: outputs.noWordOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    today_context_output_test_records: 1,
    public_panchang_outputs: 0,
    public_observance_outputs: 0,
    public_eclipse_outputs: 0,
    word_output_records: 0
  },
  next_required_stage: "AG70S — Today Panchang Preview Manual Verification Gate"
};

const review = {
  module_id: "AG70R",
  title: "Today Panchang Context Preview / Output Test",
  status: "ag70r_today_panchang_context_preview_output_test_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70q_review: "data/content-intelligence/quality-reviews/ag70q-panchang-context-interpretation-bank.json",
    today_context_preview: "data/knowledge-base/panchang-festival/production/ag70q-today-context-interpretation-preview.json"
  },
  generated_records: outputs,
  summary: {
    today_panchang_context_output_test_created: true,
    readable_preview_created: true,
    output_test_record_count: 1,
    selected_preview_date_key: record.date_key,
    public_panchang_output_allowed_now: false,
    public_observance_output_allowed_now: false,
    public_eclipse_output_allowed_now: false,
    public_word_output_allowed_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    ready_for_ag70s_manual_verification: true
  }
};

const readiness = {
  module_id: "AG70R",
  title: "AG70S Today Panchang Preview Manual Verification Readiness Record",
  status: "ready_for_ag70s_today_panchang_preview_manual_verification",
  ready_for_ag70s: true,
  next_stage: "AG70S — Today Panchang Preview Manual Verification Gate",
  reason: "Readable internal today Panchang context output-test preview exists and can now be manually reviewed before any public/UI connection."
};

const boundary = {
  module_id: "AG70R",
  title: "AG70R to AG70S Today Panchang Preview Manual Verification Boundary",
  status: "ag70s_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Review AG70R readable preview manually.",
    "Record approval/correction notes.",
    "Keep public/UI output blocked unless explicitly approved later."
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
  module_id: "AG70R",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70R",
  status: review.status,
  output_test_record_count: 1,
  selected_preview_date_key: record.date_key,
  public_output_allowed_now: 0,
  word_output_allowed_now: 0,
  ui_output_allowed_now: 0,
  ready_for_ag70s: 1
};

const doc = `# AG70R — Today Panchang Context Preview / Output Test

AG70R creates a readable internal output-test preview from AG70Q today context interpretation.

## Created

- Today Panchang Context Output Test.
- Readable preview JSON.
- Readable preview Markdown.
- Output test audit.
- No public UI output audit.
- No Word output audit.

## Boundary

AG70R does not update live UI, generated Word output, backend, Supabase, or any public Panchang/observance/eclipse output.

## Next

AG70S should manually verify the AG70R preview and record approval/correction notes.
`;

writeJson(outputs.outputTest, outputTest);
writeJson(outputs.readablePreviewJson, readableSections);
writeText(outputs.readablePreviewMd, readableMd);
writeJson(outputs.outputTestAudit, outputTestAudit);
writeJson(outputs.noPublicUiAudit, noPublicUiAudit);
writeJson(outputs.noWordOutputAudit, noWordOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70R today Panchang context preview/output test generated.");
console.log(`✅ Preview date: ${record.date_key}.`);
console.log("✅ Readable preview JSON and Markdown created.");
console.log("✅ Public output, Word output, UI, backend and Supabase remain blocked.");
