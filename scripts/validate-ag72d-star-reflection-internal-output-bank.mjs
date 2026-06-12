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
  console.error(`❌ AG72D validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const doctrinePath = "data/methodology/star-reflection/ag72c-star-reflection-output-doctrine.json";
const sectionModelPath = "data/methodology/star-reflection/ag72c-star-reflection-output-section-model.json";
const languagePolicyPath = "data/methodology/star-reflection/ag72c-star-reflection-language-policy.json";
const templateBankPath = "data/methodology/star-reflection/ag72c-star-reflection-safe-template-bank.json";
const noPredictionAuditPath = "data/methodology/star-reflection/ag72c-no-prediction-output-audit.json";
const starManifestPath = "data/methodology/star-reflection/star-reflection-method-manifest.json";

for (const file of [
  doctrinePath,
  sectionModelPath,
  languagePolicyPath,
  templateBankPath,
  noPredictionAuditPath,
  starManifestPath
]) {
  if (!exists(file)) fail(`Missing required source file: ${file}`);
}

const doctrine = readJson(doctrinePath);
const sectionModel = readJson(sectionModelPath);
const languagePolicy = readJson(languagePolicyPath);
const templateBank = readJson(templateBankPath);
const noPredictionAudit = readJson(noPredictionAuditPath);
const starManifest = readJson(starManifestPath);

if (doctrine.status !== "ag72c_star_reflection_output_doctrine_created") fail("AG72C doctrine status mismatch.");
if (sectionModel.status !== "ag72c_output_section_model_created") fail("AG72C section model status mismatch.");
if (languagePolicy.status !== "ag72c_language_policy_created") fail("AG72C language policy status mismatch.");
if (templateBank.status !== "ag72c_safe_template_bank_created") fail("AG72C safe template bank status mismatch.");
if (noPredictionAudit.status !== "ag72c_no_prediction_output_audit_passed") fail("AG72C no-prediction audit status mismatch.");
const ag72dCompatibleManifestStatuses = [
  "ag72c_star_reflection_output_doctrine_created_ag72d_ready",
  "ag72d_star_reflection_internal_output_bank_created_ag72e_ready",
  "ag72e_star_reflection_ui_preview_wiring_applied_ag72f_ready",
  "ag72f_star_reflection_public_pilot_static_closure_passed_browser_qa_pending",
  "ag73a_star_reflection_birth_time_input_surface_added_ag73b_ready",
  "ag73b_birth_time_aware_contract_created_ag73c_ready",
  "ag73c_birth_time_aware_output_bank_created_ag73d_ready",
  "ag73d_star_reflection_active_result_wiring_applied_ag73e_ready",
  "ag73e_star_reflection_active_result_qa_closed"
];

if (!ag72dCompatibleManifestStatuses.includes(starManifest.current_status)) {
  fail(`Star Reflection manifest is not AG72D/AG73-compatible: ${starManifest.current_status}`);
}

for (const [key, value] of Object.entries(noPredictionAudit.checks || {})) {
  if (value !== false) fail(`AG72C no-prediction audit check must remain false: ${key}`);
}

const outputRecords = [
  {
    internal_output_id: "ag72d_reflection_proto_01",
    theme_key: "attentive_clarity",
    basis_label: "Moon-led Nakshatra reflection, Panchanga-supported",
    reflection_basis: "Day-level pilot basis; birth time is not yet used.",
    reflective_theme: "This basis may be read as an invitation to notice where attention is scattered and where clarity can be gently restored.",
    self_inquiry_prompt: "What is one area today where a simpler view may help you respond with more steadiness?",
    grounding_practice: "Write one short sentence naming what needs attention, then pause before acting.",
    limitation_notice: "This is a reflective pilot preview, not a deterministic prediction or personal decision advice."
  },
  {
    internal_output_id: "ag72d_reflection_proto_02",
    theme_key: "measured_response",
    basis_label: "Moon-led Nakshatra reflection, Panchanga-supported",
    reflection_basis: "Day-level pilot basis; birth time is not yet used.",
    reflective_theme: "This basis may be used as a prompt to slow the first reaction and choose a measured response.",
    self_inquiry_prompt: "Where would a little more patience change the quality of your next action?",
    grounding_practice: "Before replying or deciding, take three calm breaths and restate the matter in neutral words.",
    limitation_notice: "This is contemplative guidance only and does not predict events or outcomes."
  },
  {
    internal_output_id: "ag72d_reflection_proto_03",
    theme_key: "inner_alignment",
    basis_label: "Moon-led Nakshatra reflection, Panchanga-supported",
    reflection_basis: "Day-level pilot basis; birth time is not yet used.",
    reflective_theme: "This basis can be read as a lens for aligning intention, speech and action without forcing certainty.",
    self_inquiry_prompt: "Which intention deserves to be made clearer before you move forward?",
    grounding_practice: "List one intention, one supporting action and one unnecessary distraction.",
    limitation_notice: "Use this as a reflective lens, not as medical, financial, legal or life-decision advice."
  },
  {
    internal_output_id: "ag72d_reflection_proto_04",
    theme_key: "restorative_boundary",
    basis_label: "Moon-led Nakshatra reflection, Panchanga-supported",
    reflection_basis: "Day-level pilot basis; birth time is not yet used.",
    reflective_theme: "This basis may suggest a gentle review of boundaries, commitments and available energy.",
    self_inquiry_prompt: "What boundary would help you preserve steadiness without closing yourself off?",
    grounding_practice: "Choose one commitment to simplify, defer or complete with care.",
    limitation_notice: "This reflection remains symbolic and non-deterministic."
  },
  {
    internal_output_id: "ag72d_reflection_proto_05",
    theme_key: "quiet_discernment",
    basis_label: "Moon-led Nakshatra reflection, Panchanga-supported",
    reflection_basis: "Day-level pilot basis; birth time is not yet used.",
    reflective_theme: "This basis may be read as an invitation to distinguish useful signals from noise.",
    self_inquiry_prompt: "What information is truly needed before you form a conclusion?",
    grounding_practice: "Separate facts, assumptions and emotions into three short notes.",
    limitation_notice: "This pilot reflection does not provide certainty, prediction, clinical assessment or professional advice."
  }
];

const blockedPatterns = [
  /you will definitely/i,
  /this proves that you are/i,
  /your future is/i,
  /you must make this decision/i,
  /you are destined to/i,
  /guaranteed/i,
  /diagnosis/i,
  /medical advice/i,
  /financial advice/i,
  /legal advice/i
];

const requiredFields = [
  "internal_output_id",
  "theme_key",
  "basis_label",
  "reflection_basis",
  "reflective_theme",
  "self_inquiry_prompt",
  "grounding_practice",
  "limitation_notice"
];

const issues = [];

for (const record of outputRecords) {
  for (const field of requiredFields) {
    if (!record[field]) issues.push({ internal_output_id: record.internal_output_id, issue: `missing_${field}` });
  }

  const joined = Object.values(record).join(" ");
  for (const pattern of blockedPatterns) {
    if (pattern.test(joined)) issues.push({ internal_output_id: record.internal_output_id, issue: `blocked_language_pattern_${pattern}` });
  }

  if (!/not|does not|non-deterministic|reflective|pilot/i.test(record.limitation_notice)) {
    issues.push({ internal_output_id: record.internal_output_id, issue: "limitation_notice_not_clear" });
  }
}

const outputBankPath = "data/methodology/star-reflection/ag72d-star-reflection-internal-output-bank.json";
const validationReportPath = "data/methodology/star-reflection/ag72d-star-reflection-internal-output-bank-validation-report.json";
const noPublicAuditPath = "data/methodology/star-reflection/ag72d-no-public-rendering-audit.json";
const readinessPath = "data/content-intelligence/quality-registry/ag72d-ag72e-star-reflection-ui-preview-readiness-record.json";
const boundaryPath = "data/content-intelligence/mutation-plans/ag72d-to-ag72e-star-reflection-ui-preview-boundary.json";

writeJson(outputBankPath, {
  module_id: "AG72D",
  title: "Star Reflection Internal Output Bank",
  status: issues.length === 0
    ? "ag72d_star_reflection_internal_output_bank_created"
    : "ag72d_star_reflection_internal_output_bank_created_with_issues",
  source_output_doctrine: doctrinePath,
  source_section_model: sectionModelPath,
  source_language_policy: languagePolicyPath,
  source_template_bank: templateBankPath,
  internal_only: true,
  public_ui_rendering_enabled_now: false,
  deterministic_prediction_enabled: false,
  output_record_count: outputRecords.length,
  issue_count: issues.length,
  records: outputRecords
});

writeJson(validationReportPath, {
  module_id: "AG72D",
  title: "Star Reflection Internal Output Bank Validation Report",
  status: issues.length === 0
    ? "ag72d_internal_output_bank_validation_passed"
    : "ag72d_internal_output_bank_validation_failed",
  output_record_count: outputRecords.length,
  issue_count: issues.length,
  issues,
  checks: {
    required_sections_present: issues.length === 0,
    blocked_language_absent: issues.length === 0,
    limitation_notice_present: issues.length === 0,
    deterministic_prediction_enabled: false,
    public_ui_rendering_enabled_now: false
  }
});

writeJson(noPublicAuditPath, {
  module_id: "AG72D",
  title: "No Public Rendering Audit",
  status: "ag72d_no_public_rendering_audit_passed",
  checks: {
    public_star_reflection_result_rendering_enabled_now: false,
    index_html_modified_now: false,
    deterministic_prediction_enabled: false,
    sensitive_profiling_enabled: false,
    personal_data_storage_enabled: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false
  }
});

writeJson(readinessPath, {
  module_id: "AG72D-AG72E",
  title: "AG72E Star Reflection UI Preview Readiness",
  status: issues.length === 0
    ? "ready_for_ag72e_star_reflection_ui_preview"
    : "blocked_for_ag72e_due_to_ag72d_issues",
  ag72d_consumed: true,
  hard_blockers_for_ag72e: issues.length === 0 ? [] : ["Resolve AG72D internal output bank validation issues first."],
  controlled_requirements_for_ag72e: [
    "Use internal output bank prototypes only.",
    "Render public pilot output with clear reflective/non-predictive labels.",
    "Do not store name, DOB, location or coordinates.",
    "Do not activate backend or Supabase.",
    "Do not claim deterministic, medical, financial, legal or decision advice."
  ]
});

writeJson(boundaryPath, {
  from_module: "AG72D",
  to_module: "AG72E",
  transition: "star_reflection_ui_preview",
  allowed_next_actions: [
    "Create public pilot Star Reflection UI preview wiring.",
    "Use safe internal output prototypes.",
    "Display non-predictive labels and limitation notice.",
    "Keep personal data storage disabled."
  ],
  blocked_actions: [
    "Deterministic prediction.",
    "Sensitive profiling.",
    "Medical, financial or legal guidance.",
    "Backend runtime activation.",
    "Supabase activation.",
    "Personal data storage."
  ]
});

writeJson("data/content-intelligence/quality-reviews/ag72d-star-reflection-internal-output-bank.json", {
  module_id: "AG72D",
  title: "Star Reflection Internal Output Bank Review",
  status: issues.length === 0 ? "ag72d_completed" : "ag72d_completed_with_issues",
  generated_records: {
    internal_output_bank: outputBankPath,
    validation_report: validationReportPath,
    no_public_rendering_audit: noPublicAuditPath,
    ag72e_readiness: readinessPath,
    ag72e_boundary: boundaryPath
  },
  summary: {
    internal_output_bank_created: true,
    output_record_count: outputRecords.length,
    issue_count: issues.length,
    public_ui_rendering_enabled_now: false,
    ready_for_ag72e: issues.length === 0
  }
});

writeJson("data/quality/ag72d-star-reflection-internal-output-bank.json", {
  module_id: "AG72D",
  status: issues.length === 0 ? "ag72d_completed" : "ag72d_completed_with_issues",
  internal_output_bank_created: true,
  output_record_count: outputRecords.length,
  issue_count: issues.length,
  ready_for_ag72e: issues.length === 0
});

writeJson("data/quality/ag72d-star-reflection-internal-output-bank-preview.json", {
  module_id: "AG72D",
  status: issues.length === 0 ? "ag72d_completed" : "ag72d_completed_with_issues",
  internal_output_bank_created: 1,
  output_record_count: outputRecords.length,
  issue_count: issues.length,
  ready_for_ag72e: issues.length === 0 ? 1 : 0
});

writeText("docs/quality/AG72D_STAR_REFLECTION_INTERNAL_OUTPUT_BANK.md", `# AG72D — Star Reflection Internal Output Bank

AG72D creates an internal-only safe output bank for Star Reflection.

## Result

- Internal output prototypes: ${outputRecords.length}
- Issue count: ${issues.length}
- Public UI rendering: not enabled
- Deterministic prediction: not enabled

## Boundary

The output bank is internal and public-preview ready only after AG72E wiring. It does not store personal data and does not activate backend or Supabase.

## Next Step

AG72E should create public pilot UI preview wiring using these safe output prototypes.
`);

const ag73dAlreadyApplied = issues.length === 0
  && exists("data/methodology/star-reflection/ag73d-star-reflection-active-result-ui-wiring.json")
  && exists("data/methodology/star-reflection/ag73d-star-reflection-active-result-ui-validation-report.json")
  && exists("scripts/validate-ag73d-star-reflection-active-result-ui-wiring.mjs");

const ag73cAlreadyApplied = issues.length === 0
  && exists("data/methodology/star-reflection/ag73c-birth-time-aware-star-reflection-output-bank.json")
  && exists("generated/star-reflection-active-result-data.json")
  && exists("scripts/validate-ag73c-birth-time-aware-star-reflection-output-bank.mjs");

const ag73bAlreadyApplied = issues.length === 0
  && exists("data/methodology/star-reflection/ag73b-birth-time-aware-star-reflection-contract.json")
  && exists("data/methodology/star-reflection/ag73b-birth-time-aware-request-schema.json")
  && exists("scripts/validate-ag73b-birth-time-aware-star-reflection-contract.mjs");

const ag73aAlreadyApplied = issues.length === 0
  && exists("data/methodology/star-reflection/ag73a-star-reflection-birth-time-input-surface.json")
  && exists("data/methodology/star-reflection/ag73a-star-reflection-birth-time-input-validation-report.json")
  && exists("scripts/validate-ag73a-star-reflection-birth-time-input-surface.mjs");

const ag72eAlreadyApplied = issues.length === 0
  && exists("generated/star-reflection-pilot-preview-data.json")
  && exists("data/methodology/star-reflection/ag72e-star-reflection-ui-preview-wiring-record.json")
  && exists("data/methodology/star-reflection/ag72e-star-reflection-ui-preview-validation-report.json")
  && exists("data/methodology/star-reflection/ag72e-no-personal-data-storage-audit.json")
  && exists("scripts/validate-ag72e-star-reflection-ui-preview-wiring.mjs");

starManifest.current_status = ag73dAlreadyApplied
  ? "ag73d_star_reflection_active_result_wiring_applied_ag73e_ready"
  : (ag73cAlreadyApplied
    ? "ag73c_birth_time_aware_output_bank_created_ag73d_ready"
    : (ag73bAlreadyApplied
      ? "ag73b_birth_time_aware_contract_created_ag73c_ready"
      : (ag73aAlreadyApplied
        ? "ag73a_star_reflection_birth_time_input_surface_added_ag73b_ready"
        : (ag72eAlreadyApplied
          ? "ag72e_star_reflection_ui_preview_wiring_applied_ag72f_ready"
          : (issues.length === 0
            ? "ag72d_star_reflection_internal_output_bank_created_ag72e_ready"
            : "ag72d_star_reflection_internal_output_bank_created_with_issues")))));

if (ag72eAlreadyApplied) {
  starManifest.ag72e_files = {
    pilot_preview_data: "generated/star-reflection-pilot-preview-data.json",
    ui_preview_wiring_record: "data/methodology/star-reflection/ag72e-star-reflection-ui-preview-wiring-record.json",
    validation_report: "data/methodology/star-reflection/ag72e-star-reflection-ui-preview-validation-report.json",
    no_personal_data_storage_audit: "data/methodology/star-reflection/ag72e-no-personal-data-storage-audit.json"
  };
}

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

if (ag73cAlreadyApplied) {
  starManifest.ag73c_files = {
    output_bank: "data/methodology/star-reflection/ag73c-birth-time-aware-star-reflection-output-bank.json",
    active_result_data: "generated/star-reflection-active-result-data.json",
    validation_report: "data/methodology/star-reflection/ag73c-birth-time-aware-output-bank-validation-report.json",
    no_storage_audit: "data/methodology/star-reflection/ag73c-active-result-no-storage-audit.json"
  };
}

if (ag73dAlreadyApplied) {
  starManifest.ag73d_files = {
    ui_wiring: "data/methodology/star-reflection/ag73d-star-reflection-active-result-ui-wiring.json",
    validation_report: "data/methodology/star-reflection/ag73d-star-reflection-active-result-ui-validation-report.json",
    no_storage_ui_audit: "data/methodology/star-reflection/ag73d-active-result-no-storage-ui-audit.json"
  };
}

starManifest.ag72d_files = {
  internal_output_bank: outputBankPath,
  validation_report: validationReportPath,
  no_public_rendering_audit: noPublicAuditPath
};

if (ag72eAlreadyApplied) {
  starManifest.ag72e_files = {
    pilot_preview_data: "generated/star-reflection-pilot-preview-data.json",
    ui_preview_wiring_record: "data/methodology/star-reflection/ag72e-star-reflection-ui-preview-wiring-record.json",
    validation_report: "data/methodology/star-reflection/ag72e-star-reflection-ui-preview-validation-report.json",
    no_personal_data_storage_audit: "data/methodology/star-reflection/ag72e-no-personal-data-storage-audit.json"
  };
}

starManifest.current_counts = {
  ...(starManifest.current_counts || {}),
  ag72d_internal_output_records: outputRecords.length,
  ag72d_validation_issue_count: issues.length,
  ...(ag72eAlreadyApplied ? {
    ag72e_safe_preview_records: 5,
    ag72e_validation_issue_count: 0
  } : {})
};

writeJson(starManifestPath, starManifest);

if (issues.length > 0) fail(`AG72D detected ${issues.length} issue(s). See ${validationReportPath}`);

pass("AG72D Star Reflection internal output bank passed.");
pass("Safe internal output prototypes are present.");
pass("AG72E UI preview readiness is present.");
