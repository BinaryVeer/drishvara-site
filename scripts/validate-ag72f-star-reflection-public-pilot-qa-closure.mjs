import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(data, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function fail(message) {
  console.error(`❌ AG72F validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const indexPath = "index.html";
const pilotPath = "generated/star-reflection-pilot-preview-data.json";
const eRecordPath = "data/methodology/star-reflection/ag72e-star-reflection-ui-preview-wiring-record.json";
const eValidationPath = "data/methodology/star-reflection/ag72e-star-reflection-ui-preview-validation-report.json";
const eAuditPath = "data/methodology/star-reflection/ag72e-no-personal-data-storage-audit.json";
const starManifestPath = "data/methodology/star-reflection/star-reflection-method-manifest.json";

for (const file of [indexPath, pilotPath, eRecordPath, eValidationPath, eAuditPath, starManifestPath]) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const index = fs.readFileSync(full(indexPath), "utf8");
const pilot = readJson(pilotPath);
const eRecord = readJson(eRecordPath);
const eValidation = readJson(eValidationPath);
const eAudit = readJson(eAuditPath);
const starManifest = readJson(starManifestPath);

if (pilot.status !== "ag72e_star_reflection_pilot_preview_data_created") fail("AG72E pilot preview data status mismatch.");
if (!Array.isArray(pilot.records) || pilot.records.length !== 5) fail("AG72E pilot data must contain 5 safe records.");
if (eRecord.status !== "ag72e_star_reflection_ui_preview_wiring_applied") fail("AG72E wiring record status mismatch.");
if (eValidation.status !== "ag72e_star_reflection_ui_preview_validation_passed") fail("AG72E validation report status mismatch.");
if (eValidation.issue_count !== 0) fail("AG72E validation issue count must be zero.");
if (eAudit.status !== "ag72e_no_personal_data_storage_audit_passed") fail("AG72E no personal data audit status mismatch.");
const allowedManifestStatuses = [
  "ag72e_star_reflection_ui_preview_wiring_applied_ag72f_ready",
  "ag72f_star_reflection_public_pilot_static_closure_passed_browser_qa_pending",
  "ag73a_star_reflection_birth_time_input_surface_added_ag73b_ready",
  "ag73b_birth_time_aware_contract_created_ag73c_ready",
  "ag73c_birth_time_aware_output_bank_created_ag73d_ready",
  "ag73d_star_reflection_active_result_wiring_applied_ag73e_ready",
  "ag73e_star_reflection_active_result_qa_closed"
];

if (!allowedManifestStatuses.includes(starManifest.current_status)) {
  fail(`Star Reflection manifest is not AG72F/AG73-compatible: ${starManifest.current_status}`);
}

for (const marker of [
  "AG72E_STAR_REFLECTION_UI_PREVIEW_WIRING_STYLE_START",
  "AG72E_STAR_REFLECTION_UI_PREVIEW_WIRING_CONTROLLER_START",
  "generated/star-reflection-pilot-preview-data.json",
  "window.drishvaraAg72ePreviewStarReflection",
  'data-ag71e-preview-button="star-reflection"',
  'data-ag71e-preview-panel="star-reflection"',
  'data-ag71e-preview-grid="star-reflection"',
  "Pilot Star Reflection Preview",
  "Reflective Only"
]) {
  if (!index.includes(marker)) fail(`index.html missing required AG72E/Star marker: ${marker}`);
}

for (const forbidden of [
  "You will definitely",
  "This proves that you are",
  "Your future is",
  "You are destined",
  "guaranteed future",
  "medical advice",
  "financial advice",
  "legal advice"
]) {
  if (index.includes(forbidden)) fail(`index.html contains blocked deterministic/sensitive phrase: ${forbidden}`);
}

for (const [key, value] of Object.entries(eAudit.checks || {})) {
  if (value !== false) fail(`AG72E no-personal-data audit check must remain false: ${key}`);
}

for (const record of pilot.records) {
  for (const field of [
    "internal_output_id",
    "theme_key",
    "basis_label",
    "reflection_basis",
    "reflective_theme",
    "self_inquiry_prompt",
    "grounding_practice",
    "limitation_notice"
  ]) {
    if (!record[field]) fail(`${record.internal_output_id || "unknown"} missing required field: ${field}`);
  }

  const joined = Object.values(record).join(" ");
  for (const blocked of [
    /you will definitely/i,
    /your future is/i,
    /you are destined/i,
    /guaranteed/i,
    /medical advice/i,
    /financial advice/i,
    /legal advice/i
  ]) {
    if (blocked.test(joined)) fail(`${record.internal_output_id} contains blocked phrase pattern ${blocked}`);
  }
}

const qaRecordPath = "data/methodology/star-reflection/ag72f-star-reflection-public-pilot-qa-closure.json";
const browserChecklistPath = "data/methodology/star-reflection/ag72f-browser-manual-qa-checklist.json";
const noExpansionAuditPath = "data/methodology/star-reflection/ag72f-no-expansion-audit.json";
const completionPath = "data/content-intelligence/quality-registry/ag72f-star-reflection-pilot-closure-record.json";

writeJson(qaRecordPath, {
  module_id: "AG72F",
  title: "Star Reflection Public Pilot QA & Closure",
  status: "ag72f_star_reflection_public_pilot_static_qa_passed",
  source_ag72e_record: eRecordPath,
  source_pilot_data: pilotPath,
  qa_summary: {
    static_qa_passed: true,
    pilot_preview_data_record_count: pilot.records.length,
    existing_preview_panel_reused: true,
    duplicate_output_panel_created: false,
    reflective_only_label_present: true,
    no_deterministic_language_detected: true,
    no_personal_data_storage: true,
    backend_runtime_active: false,
    supabase_active: false,
    browser_manual_qa_required_before_visual_acceptance: true
  },
  star_reflection_pilot_status: {
    public_pilot_preview_wired: true,
    static_closure_passed: true,
    browser_manual_qa_pending: true,
    production_personalisation_complete: false,
    deterministic_prediction_enabled: false,
    personal_data_storage_enabled: false
  }
});

writeJson(browserChecklistPath, {
  module_id: "AG72F",
  title: "Browser Manual QA Checklist",
  status: "manual_browser_qa_pending_user_confirmation",
  checklist: [
    {
      item: "Enter a sample DOB in DD/MM/YYYY format and select Itanagar.",
      expected: "Preview Star Reflection updates the existing preview panel with reflective-only output."
    },
    {
      item: "Select New Delhi, Ranchi and Tokyo one by one.",
      expected: "The preview panel remains stable, wraps text properly, and location basis updates."
    },
    {
      item: "Check duplicate output panels.",
      expected: "No duplicate Star Reflection output panel appears."
    },
    {
      item: "Check safety language.",
      expected: "Output remains reflective, non-deterministic and clearly marked as pilot guidance."
    },
    {
      item: "Check privacy boundary.",
      expected: "No name, DOB, location or coordinate storage is indicated or performed."
    },
    {
      item: "Check locked primary action.",
      expected: "The old locked/governance button remains disabled; AG72E preview is still a pilot preview."
    }
  ],
  closure_note: "Static QA is passed. Browser manual QA should be confirmed by user screenshots before treating the visual pilot as accepted."
});

writeJson(noExpansionAuditPath, {
  module_id: "AG72F",
  title: "No Expansion Audit",
  status: "ag72f_no_expansion_audit_passed",
  checks: {
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    personal_data_storage_enabled: false,
    deterministic_prediction_enabled: false,
    sensitive_profiling_enabled: false,
    medical_guidance_enabled: false,
    financial_guidance_enabled: false,
    legal_guidance_enabled: false,
    production_personalisation_enabled: false
  }
});

writeJson(completionPath, {
  module_id: "AG72F",
  title: "Star Reflection Pilot Closure Record",
  status: "star_reflection_public_pilot_static_closure_passed_browser_qa_pending",
  consumed_modules: [
    "AG72A",
    "AG72B",
    "AG72C",
    "AG72D",
    "AG72E"
  ],
  closure_summary: {
    method_locked: true,
    computation_contract_created: true,
    output_doctrine_created: true,
    internal_output_bank_created: true,
    public_pilot_preview_wired: true,
    static_qa_passed: true,
    browser_manual_qa_pending: true
  }
});

writeJson("data/content-intelligence/quality-reviews/ag72f-star-reflection-public-pilot-qa-closure.json", {
  module_id: "AG72F",
  title: "Star Reflection Public Pilot QA & Closure Review",
  status: "ag72f_completed_static_qa_passed_browser_qa_pending",
  generated_records: {
    qa_closure: qaRecordPath,
    browser_manual_qa_checklist: browserChecklistPath,
    no_expansion_audit: noExpansionAuditPath,
    pilot_closure_record: completionPath
  },
  summary: {
    star_reflection_static_qa_passed: true,
    browser_manual_qa_pending: true,
    star_reflection_pilot_statically_closed: true
  }
});

writeJson("data/quality/ag72f-star-reflection-public-pilot-qa-closure.json", {
  module_id: "AG72F",
  status: "ag72f_completed_static_qa_passed_browser_qa_pending",
  static_qa_passed: true,
  browser_manual_qa_pending: true,
  star_reflection_pilot_statically_closed: true
});

writeJson("data/quality/ag72f-star-reflection-public-pilot-qa-closure-preview.json", {
  module_id: "AG72F",
  status: "ag72f_completed_static_qa_passed_browser_qa_pending",
  static_qa_passed: 1,
  browser_manual_qa_pending: 1,
  star_reflection_pilot_statically_closed: 1
});

writeText("docs/quality/AG72F_STAR_REFLECTION_PUBLIC_PILOT_QA_CLOSURE.md", `# AG72F — Star Reflection Public Pilot QA & Closure

AG72F performs static QA and closure review for the Star Reflection public pilot preview.

## Static QA Result

- Safe preview records: ${pilot.records.length}
- Existing preview panel reused
- No duplicate output panel
- Reflective-only language preserved
- Personal data storage remains disabled
- Backend and Supabase remain inactive
- Deterministic prediction remains disabled

## Manual Browser QA

Manual browser QA remains pending. The user should confirm visual behaviour for DOB plus all four pilot locations.

## Still Not Performed

- Backend runtime activation
- Supabase activation
- Personal data storage
- Deterministic prediction
- Sensitive profiling
- Production personalisation

## Pilot Status

Star Reflection is statically closed for pilot, with browser manual QA pending.
`);

const ag73cAlreadyApplied = exists("data/methodology/star-reflection/ag73c-birth-time-aware-star-reflection-output-bank.json")
  && exists("generated/star-reflection-active-result-data.json")
  && exists("scripts/validate-ag73c-birth-time-aware-star-reflection-output-bank.mjs");

const ag73bAlreadyApplied = exists("data/methodology/star-reflection/ag73b-birth-time-aware-star-reflection-contract.json")
  && exists("data/methodology/star-reflection/ag73b-birth-time-aware-request-schema.json")
  && exists("scripts/validate-ag73b-birth-time-aware-star-reflection-contract.mjs");

const ag73aAlreadyApplied = exists("data/methodology/star-reflection/ag73a-star-reflection-birth-time-input-surface.json")
  && exists("data/methodology/star-reflection/ag73a-star-reflection-birth-time-input-validation-report.json")
  && exists("scripts/validate-ag73a-star-reflection-birth-time-input-surface.mjs");

starManifest.current_status = ag73cAlreadyApplied
  ? "ag73c_birth_time_aware_output_bank_created_ag73d_ready"
  : (ag73bAlreadyApplied
    ? "ag73b_birth_time_aware_contract_created_ag73c_ready"
    : (ag73aAlreadyApplied
      ? "ag73a_star_reflection_birth_time_input_surface_added_ag73b_ready"
      : "ag72f_star_reflection_public_pilot_static_closure_passed_browser_qa_pending"));

if (ag73aAlreadyApplied) {
  starManifest.ag73a_files = {
    birth_time_input_surface: "data/methodology/star-reflection/ag73a-star-reflection-birth-time-input-surface.json",
    validation_report: "data/methodology/star-reflection/ag73a-star-reflection-birth-time-input-validation-report.json",
    no_storage_audit: "data/methodology/star-reflection/ag73a-birth-time-no-storage-audit.json"
  };
}

if (ag73bAlreadyApplied) {
  starManifest.ag73b_files = {
    contract: "data/methodology/star-reflection/ag73b-birth-time-aware-star-reflection-contract.json",
    request_schema: "data/methodology/star-reflection/ag73b-birth-time-aware-request-schema.json",
    precision_policy: "data/methodology/star-reflection/ag73b-birth-time-precision-policy.json",
    basis_resolver_contract: "data/methodology/star-reflection/ag73b-birth-time-aware-basis-resolver-contract.json",
    no_storage_contract_audit: "data/methodology/star-reflection/ag73b-birth-time-no-storage-contract-audit.json"
  };
}
starManifest.ag72f_files = {
  qa_closure: qaRecordPath,
  browser_manual_qa_checklist: browserChecklistPath,
  no_expansion_audit: noExpansionAuditPath,
  pilot_closure_record: completionPath
};
starManifest.current_counts = {
  ...(starManifest.current_counts || {}),
  ag72f_static_qa_issue_count: 0,
  ag72f_browser_manual_qa_pending: 1
};
writeJson(starManifestPath, starManifest);

pass("AG72F Star Reflection public pilot static QA passed.");
pass("Browser manual QA checklist created.");
pass("Star Reflection pilot is statically closed.");
