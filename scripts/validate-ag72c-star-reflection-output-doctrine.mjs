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
  console.error(`❌ AG72C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const computationContractPath = "data/methodology/star-reflection/ag72b-star-reflection-computation-contract.json";
const basisResolverPath = "data/methodology/star-reflection/ag72b-star-reflection-basis-resolver-contract.json";
const requestSchemaPath = "data/methodology/star-reflection/ag72b-star-reflection-request-schema.json";
const limitationPolicyPath = "data/methodology/star-reflection/ag72b-star-reflection-limitation-policy.json";
const noPredictionAuditPath = "data/methodology/star-reflection/ag72b-no-prediction-computation-audit.json";
const starManifestPath = "data/methodology/star-reflection/star-reflection-method-manifest.json";

for (const file of [
  computationContractPath,
  basisResolverPath,
  requestSchemaPath,
  limitationPolicyPath,
  noPredictionAuditPath,
  starManifestPath
]) {
  if (!exists(file)) fail(`Missing required source file: ${file}`);
}

const computationContract = readJson(computationContractPath);
const basisResolver = readJson(basisResolverPath);
const requestSchema = readJson(requestSchemaPath);
const limitationPolicy = readJson(limitationPolicyPath);
const noPredictionAudit = readJson(noPredictionAuditPath);
const starManifest = readJson(starManifestPath);

if (computationContract.status !== "ag72b_star_reflection_computation_contract_created") fail("AG72B computation contract status mismatch.");
if (basisResolver.status !== "ag72b_basis_resolver_contract_created") fail("AG72B basis resolver status mismatch.");
if (requestSchema.status !== "ag72b_request_schema_created") fail("AG72B request schema status mismatch.");
if (limitationPolicy.status !== "ag72b_limitation_policy_created") fail("AG72B limitation policy status mismatch.");
if (noPredictionAudit.status !== "ag72b_no_prediction_computation_audit_passed") fail("AG72B no-prediction audit status mismatch.");
if (starManifest.current_status !== "ag72b_star_reflection_computation_contract_created_ag72c_ready") fail("Star Reflection manifest is not AG72C-ready.");

for (const [key, value] of Object.entries(noPredictionAudit.checks || {})) {
  if (value !== false) fail(`AG72B no-prediction audit check must remain false: ${key}`);
}

const doctrinePath = "data/methodology/star-reflection/ag72c-star-reflection-output-doctrine.json";
const sectionModelPath = "data/methodology/star-reflection/ag72c-star-reflection-output-section-model.json";
const languagePolicyPath = "data/methodology/star-reflection/ag72c-star-reflection-language-policy.json";
const templateBankPath = "data/methodology/star-reflection/ag72c-star-reflection-safe-template-bank.json";
const noPredictionOutputAuditPath = "data/methodology/star-reflection/ag72c-no-prediction-output-audit.json";
const readinessPath = "data/content-intelligence/quality-registry/ag72c-ag72d-star-reflection-internal-output-bank-readiness-record.json";
const boundaryPath = "data/content-intelligence/mutation-plans/ag72c-to-ag72d-star-reflection-internal-output-bank-boundary.json";

writeJson(doctrinePath, {
  module_id: "AG72C",
  title: "Star Reflection Output Doctrine",
  status: "ag72c_star_reflection_output_doctrine_created",
  source_computation_contract: computationContractPath,
  doctrine_summary: {
    output_nature: "reflective_non_deterministic_symbolic_guidance",
    primary_basis_label: "Moon-led Nakshatra reflection",
    supporting_basis_label: "Panchanga-supported location-aware context",
    birth_time_absent_handling: "day_level_reflection_only",
    personal_prediction_allowed: false,
    sensitive_profile_allowed: false,
    public_ui_rendering_enabled_now: false
  },
  mandatory_public_language: [
    "This is a reflective pilot preview, not a deterministic prediction.",
    "Birth time is not yet used; interpretation remains day-level.",
    "Panchanga and regional method verification remain part of the pilot process.",
    "Use this as contemplative guidance, not as advice for medical, financial, legal or life decisions."
  ],
  output_must_include: [
    "basis_label",
    "limitation_notice",
    "reflective_theme",
    "self_inquiry_prompt",
    "grounding_suggestion",
    "non_prediction_disclaimer"
  ],
  output_must_not_include: [
    "fixed future prediction",
    "guaranteed event",
    "diagnosis",
    "sensitive trait claim",
    "relationship certainty",
    "career certainty",
    "medical advice",
    "financial advice",
    "legal advice"
  ],
  next_step: {
    module_id: "AG72D",
    title: "Star Reflection Internal Output Bank",
    purpose: "Create internal safe output prototypes using the AG72C doctrine before any public UI wiring."
  }
});

writeJson(sectionModelPath, {
  module_id: "AG72C",
  title: "Star Reflection Output Section Model",
  status: "ag72c_output_section_model_created",
  sections: [
    {
      section_id: "basis",
      label: "Reflection Basis",
      purpose: "Explain Moon-led/Nakshatra-oriented and Panchanga-supported basis.",
      required: true,
      allowed_content: "method label, location/date basis, day-level limitation"
    },
    {
      section_id: "theme",
      label: "Reflective Theme",
      purpose: "Offer a symbolic theme derived from the basis.",
      required: true,
      allowed_content: "non-deterministic symbolic framing"
    },
    {
      section_id: "self_inquiry",
      label: "Question for Reflection",
      purpose: "Invite introspection without prediction.",
      required: true,
      allowed_content: "open-ended question"
    },
    {
      section_id: "practice",
      label: "Grounding Practice",
      purpose: "Suggest a simple contemplative or journaling action.",
      required: true,
      allowed_content: "general wellness-neutral practice, not medical treatment"
    },
    {
      section_id: "limits",
      label: "Pilot Limitation",
      purpose: "State birth-time and production limitation.",
      required: true,
      allowed_content: "day-level, under verification, non-predictive disclaimer"
    }
  ],
  prohibited_sections: [
    "prediction",
    "diagnosis",
    "compatibility verdict",
    "financial luck",
    "health forecast",
    "legal decision",
    "career certainty"
  ]
});

writeJson(languagePolicyPath, {
  module_id: "AG72C",
  title: "Star Reflection Language Policy",
  status: "ag72c_language_policy_created",
  allowed_phrasing_patterns: [
    "You may reflect on...",
    "This basis can be read as a prompt to notice...",
    "A useful question today may be...",
    "This suggests a reflective theme of...",
    "Because birth time is not yet used, keep this as day-level guidance..."
  ],
  blocked_phrasing_patterns: [
    "You will definitely...",
    "This proves that you are...",
    "Your future is...",
    "You must make this decision...",
    "You are destined to...",
    "This confirms your health/wealth/relationship outcome..."
  ],
  tone_requirements: {
    calm: true,
    non_authoritative: true,
    reflective: true,
    culturally_respectful: true,
    non_fatalistic: true
  },
  sensitive_area_policy: {
    medical: "blocked",
    financial: "blocked",
    legal: "blocked",
    mental_health_diagnosis: "blocked",
    protected_or_sensitive_attribute_inference: "blocked"
  }
});

writeJson(templateBankPath, {
  module_id: "AG72C",
  title: "Star Reflection Safe Template Bank",
  status: "ag72c_safe_template_bank_created",
  templates: [
    {
      template_id: "ag72c_basis_notice",
      section: "basis",
      text: "Reflection basis: Moon-led Nakshatra context, supported by Panchanga and location/timezone basis. Birth time is not yet used, so this remains a day-level pilot reflection."
    },
    {
      template_id: "ag72c_theme_template",
      section: "theme",
      text: "Today’s symbolic theme may be read as {theme_key}. Treat it as a reflective lens, not as a prediction."
    },
    {
      template_id: "ag72c_self_inquiry_template",
      section: "self_inquiry",
      text: "A useful question for reflection: {reflection_question}"
    },
    {
      template_id: "ag72c_practice_template",
      section: "practice",
      text: "A simple grounding practice: {grounding_practice}"
    },
    {
      template_id: "ag72c_limits_template",
      section: "limits",
      text: "Pilot limitation: this does not provide deterministic, medical, financial, legal or personal decision advice."
    }
  ],
  template_variables_allowed: [
    "theme_key",
    "reflection_question",
    "grounding_practice",
    "basis_label",
    "location_label",
    "date_basis"
  ],
  template_variables_blocked: [
    "guaranteed_future_event",
    "diagnosis",
    "sensitive_trait",
    "financial_outcome",
    "medical_outcome",
    "relationship_verdict"
  ]
});

writeJson(noPredictionOutputAuditPath, {
  module_id: "AG72C",
  title: "No Prediction Output Audit",
  status: "ag72c_no_prediction_output_audit_passed",
  checks: {
    deterministic_prediction_enabled: false,
    public_ui_result_rendering_enabled_now: false,
    sensitive_profiling_enabled: false,
    medical_guidance_enabled: false,
    financial_guidance_enabled: false,
    legal_guidance_enabled: false,
    diagnosis_enabled: false,
    personal_data_storage_enabled: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false
  }
});

writeJson(readinessPath, {
  module_id: "AG72C-AG72D",
  title: "AG72D Star Reflection Internal Output Bank Readiness",
  status: "ready_for_ag72d_star_reflection_internal_output_bank",
  ag72c_consumed: true,
  hard_blockers_for_ag72d: [],
  controlled_requirements_for_ag72d: [
    "Use AG72C section model and language policy.",
    "Create internal-only output prototypes.",
    "Keep public UI rendering blocked.",
    "Use non-deterministic reflective language.",
    "Include limitation notice in every output.",
    "Do not store personal data.",
    "Do not activate backend or Supabase."
  ]
});

writeJson(boundaryPath, {
  from_module: "AG72C",
  to_module: "AG72D",
  transition: "star_reflection_internal_output_bank",
  allowed_next_actions: [
    "Create internal safe output prototypes.",
    "Map theme keys to approved reflective templates.",
    "Validate all outputs against no-prediction language policy."
  ],
  blocked_actions: [
    "Public Star Reflection result rendering.",
    "Personalised deterministic prediction.",
    "Sensitive profiling.",
    "Backend runtime activation.",
    "Supabase activation.",
    "Personal data storage."
  ]
});

writeJson("data/content-intelligence/quality-reviews/ag72c-star-reflection-output-doctrine.json", {
  module_id: "AG72C",
  title: "Star Reflection Output Doctrine Review",
  status: "ag72c_completed",
  generated_records: {
    output_doctrine: doctrinePath,
    section_model: sectionModelPath,
    language_policy: languagePolicyPath,
    safe_template_bank: templateBankPath,
    no_prediction_output_audit: noPredictionOutputAuditPath,
    ag72d_readiness: readinessPath,
    ag72d_boundary: boundaryPath
  },
  summary: {
    doctrine_created: true,
    section_model_created: true,
    language_policy_created: true,
    safe_template_bank_created: true,
    public_ui_result_rendering_enabled_now: false,
    ready_for_ag72d: true
  }
});

writeJson("data/quality/ag72c-star-reflection-output-doctrine.json", {
  module_id: "AG72C",
  status: "ag72c_completed",
  doctrine_created: true,
  public_ui_result_rendering_enabled_now: false,
  ready_for_ag72d: true
});

writeJson("data/quality/ag72c-star-reflection-output-doctrine-preview.json", {
  module_id: "AG72C",
  status: "ag72c_completed",
  doctrine_created: 1,
  public_ui_result_rendering_enabled_now: 0,
  ready_for_ag72d: 1
});

writeText("docs/quality/AG72C_STAR_REFLECTION_OUTPUT_DOCTRINE.md", `# AG72C — Star Reflection Output Doctrine

AG72C defines the safe output doctrine for Star Reflection.

## Output Nature

Star Reflection output must remain reflective, non-deterministic and symbolic. It may use Moon-led Nakshatra context, Panchanga support and location/timezone basis, but must not claim certainty.

## Required Sections

- Reflection Basis
- Reflective Theme
- Question for Reflection
- Grounding Practice
- Pilot Limitation

## Blocked

- Deterministic prediction
- Diagnosis
- Sensitive profiling
- Medical, financial or legal advice
- Career or relationship certainty
- Public UI result rendering before internal output bank validation

## Next Step

AG72D should create an internal-only safe output bank using this doctrine.
`);

starManifest.current_status = "ag72c_star_reflection_output_doctrine_created_ag72d_ready";
starManifest.ag72c_files = {
  output_doctrine: doctrinePath,
  section_model: sectionModelPath,
  language_policy: languagePolicyPath,
  safe_template_bank: templateBankPath,
  no_prediction_output_audit: noPredictionOutputAuditPath
};
starManifest.current_counts = {
  ...(starManifest.current_counts || {}),
  ag72c_doctrine_records: 1,
  ag72c_template_records: 5,
  ag72c_no_prediction_audit_records: 1
};
writeJson(starManifestPath, starManifest);

pass("AG72C Star Reflection output doctrine passed.");
pass("Safe section model and language policy are present.");
pass("AG72D internal output bank is ready.");
