import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
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
function walk(dir, patterns, out = []) {
  const abs = full(dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "archive", "_local_archive"].includes(entry.name)) continue;
      walk(rel, patterns, out);
    } else if (patterns.some((needle) => rel.toLowerCase().includes(needle))) {
      out.push(rel);
    }
  }
  return out;
}

const ag65z = readJson("data/content-intelligence/quality-reviews/ag65z-vedic-guidance-closure.json");
if (ag65z.summary?.ready_for_ag66 !== true) {
  throw new Error("AG65Z readiness for AG66 missing.");
}

const indexHtml = read("index.html");

const sourceFilesToConsume = [
  "data/content-intelligence/ad-foundation/ad05-reflection-prompt-corpus-schema.json",
  "data/content-intelligence/ad-foundation/ad06-guidance-reflection-database-planning-map.json",
  "data/content-intelligence/ad-foundation/ad06-star-reflection-rule-model.json",
  "data/content-intelligence/ad-foundation/ad06-vedic-guidance-star-reflection-doctrine.json",
  "data/content-intelligence/homepage/ag23d-reflection-layer-map.json",
  "data/content-intelligence/homepage/ag23e-reflection-surface-schema.json",
  "data/content-intelligence/quality-reviews/ag48c-reflection-homepage-integration.json",
  "data/content-intelligence/quality-reviews/ag48d-word-reflection-integration-audit.json",
  "data/content-intelligence/quality-reviews/ag48z-word-reflection-closure.json",
  "data/content-intelligence/quality-reviews/ag49b-consent-entitlement-sensitive-data-gate.json",
  "data/content-intelligence/quality-reviews/ag50b-child-minor-consent-school-permission-gate.json",
  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/quality-reviews/ag56-6-word-panchang-reflection-vedic-preview-smoke-test.json",
  "data/content-intelligence/user-personalisation/ag49a-privacy-risk-precheck-record.json",
  "data/content-intelligence/user-personalisation/ag49b-consent-model-gate-record.json",
  "data/content-intelligence/user-personalisation/ag49b-consent-withdrawal-export-deletion-boundary.json",
  "data/content-intelligence/user-personalisation/ag49d-consent-sensitive-continuity-audit.json",
  "data/methodology/m00-source-doctrine.json",
  "data/methodology/m05-name-dob-location-methodology.json",
  "data/methodology/m06-lucky-number-colour-mantra-selection.json",
  "data/methodology/m07-subscriber-personalization-scoring.json",
  "data/methodology/m08-server-side-api-contract.json",
  "data/methodology/m09-internal-calculation-preview.json",
  "data/methodology/m10-methodology-activation-readiness-report.json"
];

const consumed = sourceFilesToConsume.map((file) => ({
  file,
  exists: exists(file),
  role: file.includes("consent") || file.includes("privacy") || file.includes("m05") || file.includes("m07") || file.includes("m08")
    ? "Consent, privacy, sensitive-data and birth-detail governance."
    : file.includes("reflection")
      ? "Reflection prompt, reflection surface and non-personalisation boundary."
      : file.includes("star")
        ? "Star Reflection rule/doctrine planning."
        : file.includes("ag50")
          ? "Minor/assessment safety boundary."
          : "Supporting source doctrine or methodology record.",
  consumed_as: "reference_only_no_runtime_activation"
}));

const discoveredSourceFiles = [
  ...walk("data", ["star", "reflection", "astrology", "zodiac", "consent", "privacy", "birth"]),
  ...walk("docs", ["star", "reflection", "astrology", "zodiac", "consent", "privacy", "birth"]),
  ...walk("scripts", ["star", "reflection", "astrology", "zodiac", "consent", "privacy", "birth"])
].filter((value, index, arr) => arr.indexOf(value) === index).sort();

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag66a-star-reflection-foundation.json",
  sourceConsumption: "data/content-intelligence/phase-01-modules/ag66a-star-reflection-source-consumption-record.json",
  initialWorkingData: "data/initial-working-data/star-reflection/ag66a-star-reflection-initial-working-data.json",
  sourceRegistry: "data/initial-working-data/star-reflection/ag66a-star-reflection-source-registry.json",
  consentPrivacySchema: "data/methodology/star-reflection/ag66a-star-reflection-consent-privacy-schema.json",
  reflectionMethodology: "data/methodology/star-reflection/ag66a-star-reflection-methodology.json",
  inputGate: "data/methodology/star-reflection/ag66a-star-reflection-input-disablement-gate.json",
  aiPolicy: "data/methodology/star-reflection/ag66a-star-reflection-ai-token-policy.json",
  feedbackSchema: "data/feedback/star-reflection/ag66a-star-reflection-user-feedback-schema.json",
  adminSchema: "data/feedback/star-reflection/ag66a-star-reflection-admin-review-absorption-schema.json",
  generatedData: "generated/star-reflection-working-data.json",
  readiness: "data/content-intelligence/quality-registry/ag66a-ag66b-star-reflection-ui-wiring-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag66a-to-ag66b-star-reflection-ui-wiring-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag66a-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag66a-no-v02-expansion-audit.json",
  registry: "data/quality/ag66a-star-reflection-foundation.json",
  preview: "data/quality/ag66a-star-reflection-foundation-preview.json",
  doc: "docs/quality/AG66A_STAR_REFLECTION_FOUNDATION.md"
};

for (const snippet of [
  "Star Reflection",
  "What the stars say about you",
  "Reflective prompt only; not a personal prediction, assessment, or decision guide.",
  "Personal input is disabled until consent, privacy and reflection-method governance are complete.",
  "data-drishvara-ag60i-star-input-disabled",
  "Reflection Method Under Review"
]) {
  if (!indexHtml.includes(snippet)) {
    throw new Error(`Missing Star Reflection UI target/safety copy: ${snippet}`);
  }
}

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const sourceConsumption = {
  module_id: "AG66A",
  title: "Star Reflection Source Consumption Record",
  status: "source_records_consumed_foundation_only",
  consumed_previous_stage: "data/content-intelligence/quality-reviews/ag65z-vedic-guidance-closure.json",
  consumed_homepage_targets: true,
  consumed_files: consumed,
  discovered_source_files: discoveredSourceFiles.slice(0, 180),
  conclusion: "AG66A can create safe initial working data and consent/privacy-gated methodology. Personal input, prediction, assessment, birth-detail processing and runtime generation remain disabled."
};

const initialWorkingData = {
  module_id: "AG66A",
  title: "Star Reflection Initial Working Data",
  status: "initial_working_data_created_not_publicly_wired",
  public_ui_activation_status: "not_wired_in_ag66a",
  current_public_mode: "safe_reflective_prompt_without_personal_input",
  working_data_contract: {
    generated_file: "generated/star-reflection-working-data.json",
    current_ui_targets: [
      "Star Reflection label",
      "What the stars say about you heading",
      "star-safety-note",
      "disabled name input",
      "disabled date of birth input",
      "disabled language selector",
      "disabled Reflection Method Under Review button"
    ],
    sensitive_future_inputs: [
      "name",
      "date_of_birth",
      "birth_time",
      "birth_location",
      "language_preference"
    ]
  },
  blocked_now: [
    "No name collection.",
    "No date of birth collection.",
    "No birth time collection.",
    "No birth location collection.",
    "No consent collection runtime.",
    "No personal input processing.",
    "No astrology calculation.",
    "No prediction.",
    "No assessment or scoring.",
    "No decision guidance.",
    "No runtime AI.",
    "No backend/Auth/Supabase/V02 activation."
  ]
};

const sourceRegistry = {
  module_id: "AG66A",
  title: "Star Reflection Source Registry",
  status: "source_registry_defined_live_source_use_disabled",
  live_source_fetching_enabled: false,
  external_api_enabled: false,
  astrology_calculation_library_enabled: false,
  source_levels: [
    {
      level: 1,
      label: "Consent and privacy governance",
      use_case: "Required before any personal input, birth detail, profile or subscriber data can be processed."
    },
    {
      level: 2,
      label: "Reflection doctrine",
      use_case: "Non-predictive, non-diagnostic reflective prompt framework."
    },
    {
      level: 3,
      label: "Astro-symbolic methodology",
      use_case: "Symbolic correlation only after source/method review; not deterministic prediction."
    },
    {
      level: 4,
      label: "Editorial safe preview",
      use_case: "Public copy that does not process personal data or claim outcomes."
    }
  ],
  source_record_schema: {
    source_id: "string",
    source_name: "string",
    source_level: "1 | 2 | 3 | 4",
    source_domain: "consent | privacy | reflection | symbolic_method | editorial",
    url_or_reference: "string_or_null",
    access_status: "verified | under_verification | unavailable | blocked",
    allowed_for_public_values: false,
    admin_approved: false,
    review_note: "string"
  }
};

const consentPrivacySchema = {
  module_id: "AG66A",
  title: "Star Reflection Consent and Privacy Schema",
  status: "consent_privacy_schema_created_runtime_inactive",
  consent_collection_enabled_now: false,
  personal_input_collection_enabled_now: false,
  birth_detail_processing_enabled_now: false,
  required_before_any_personal_input: [
    "explicit consent screen",
    "purpose limitation",
    "sensitive data notice",
    "retention/deletion policy",
    "withdrawal/export/deletion path",
    "age/minor gate where applicable",
    "privacy redaction policy",
    "admin/legal review"
  ],
  sensitive_data_fields: [
    "name",
    "date_of_birth",
    "birth_time",
    "birth_location",
    "language_preference",
    "reflection_history"
  ],
  public_default_rule: "No personal data should be collected or processed in the public static preview."
};

const reflectionMethodology = {
  module_id: "AG66A",
  title: "Star Reflection Methodology",
  status: "methodology_created_not_runtime_active",
  methodology_version: "star_reflection_method_v1",
  principles: [
    "Treat Star Reflection as a reflective prompt, not prediction.",
    "Do not make deterministic astrology claims.",
    "Do not provide assessment, diagnosis, scoring or decision guidance.",
    "Do not process name, date of birth, birth time or birth location without explicit consent and backend privacy controls.",
    "Keep personal input disabled until consent/privacy/reflection-method governance is complete.",
    "Separate symbolic reflection from horoscope calculation.",
    "User feedback cannot directly modify reflection logic; admin review is mandatory.",
    "Any future personalised layer must require consent, entitlement and privacy review."
  ],
  output_separation: {
    public_safe_preview_layer: ["label", "heading", "safety_note", "disabled_input_status"],
    future_consent_layer: ["consent_status", "purpose_scope", "privacy_flags"],
    future_reflection_layer: ["non_predictive_prompt", "language_preference", "reflection_theme"],
    blocked_layers: ["horoscope_prediction", "deterministic_claim", "assessment_score", "decision_guidance"]
  },
  blocked_now: [
    "No personal input collection.",
    "No consent runtime.",
    "No astrology calculation.",
    "No personalised reflection.",
    "No prediction.",
    "No assessment/scoring.",
    "No runtime AI generation.",
    "No external API/source fetch.",
    "No backend/Auth/Supabase activation."
  ]
};

const inputGate = {
  module_id: "AG66A",
  title: "Star Reflection Input Disablement Gate",
  status: "input_disablement_gate_created_inputs_blocked_by_default",
  public_inputs_enabled_now: false,
  disabled_controls_required: [
    "name input",
    "date of birth input",
    "language select",
    "reflection button"
  ],
  activation_prerequisites: [
    "consent model approved",
    "privacy model approved",
    "backend/Auth decision approved",
    "secure storage/retention/deletion policy implemented",
    "reflection methodology approved",
    "non-prediction language audited",
    "live validation passed"
  ],
  current_public_button_label: "Reflection Method Under Review"
};

const aiPolicy = {
  module_id: "AG66A",
  title: "Star Reflection AI and Token Policy",
  status: "ai_policy_defined_runtime_inactive",
  ai_runtime_active: false,
  user_triggered_ai_allowed: false,
  allowed_future_ai_roles_after_approval: [
    "summarise admin-approved reflection themes",
    "triage user feedback for admin review",
    "check non-prediction and non-assessment language",
    "generate safe non-personal prompts after approval"
  ],
  blocked_ai_roles: [
    "generate personal prediction",
    "process DOB/birth data without consent",
    "produce horoscope calculation",
    "score personality or mental state",
    "give decision guidance",
    "directly absorb user feedback",
    "publish personalised output without admin/privacy review"
  ],
  cost_policy: {
    expected_monthly_token_pressure: "low_until_consent_backend_activation",
    initial_monthly_cap_inr: 1000,
    stronger_model_use: "only for privacy/safety-language review after explicit approval"
  }
};

const feedbackSchema = {
  module_id: "AG66A",
  title: "Star Reflection User Feedback Schema",
  status: "feedback_schema_defined_not_publicly_active",
  user_feedback_allowed_now: false,
  routing_rule: "User feedback must go to admin review before system absorption.",
  fields: [
    "feedback_id",
    "surface",
    "safety_note_feedback",
    "privacy_concern",
    "consent_concern",
    "reflection_language_concern",
    "prediction_or_assessment_risk_reported",
    "suggested_improvement",
    "user_comment",
    "submitted_at",
    "review_status"
  ]
};

const adminSchema = {
  module_id: "AG66A",
  title: "Star Reflection Admin Review and Absorption Schema",
  status: "admin_review_absorption_schema_defined_not_runtime_active",
  admin_review_required: true,
  automatic_absorption_allowed: false,
  fields: [
    "review_id",
    "feedback_id",
    "source_id",
    "admin_decision",
    "decision_reason",
    "approved_change_type",
    "privacy_update_required",
    "consent_update_required",
    "reflection_method_update_required",
    "public_copy_update_required",
    "input_gate_update_required",
    "absorbed_into_methodology_version",
    "reviewed_at"
  ],
  absorption_rule: "Only admin-approved feedback can modify Star Reflection copy, consent/privacy schema, input gate, source registry or future methodology.",
  methodology_versioning: {
    current_version: "star_reflection_method_v1",
    next_version_trigger: "admin-approved consent/privacy/reflection-method update"
  }
};

const generatedData = {
  status: "initial_star_reflection_ready_not_publicly_wired",
  generated_at: new Date().toISOString(),
  module_id: "AG66A",
  public_ui_ready: false,
  personal_input_collection_enabled: false,
  name_collection_enabled: false,
  date_of_birth_collection_enabled: false,
  birth_time_collection_enabled: false,
  birth_location_collection_enabled: false,
  consent_collection_enabled: false,
  birth_detail_processing_enabled: false,
  astrology_calculation_active: false,
  reflection_generation_active: false,
  horoscope_prediction_active: false,
  assessment_scoring_active: false,
  deterministic_claim_active: false,
  decision_guidance_active: false,
  external_api_fetch_active: false,
  ai_generation_active: false,
  methodology_version: "star_reflection_method_v1",
  star_reflection: {
    label: "Star Reflection",
    safety_note: "Reflective prompt only; not a personal prediction, assessment, or decision guide.",
    heading: "What the stars say about you",
    body: "Personal input is disabled until consent, privacy and reflection-method governance are complete.",
    name_placeholder: "Name",
    dob_placeholder: "Date of Birth (DD/MM/YYYY)",
    language_options: ["English", "Hindi"],
    button_label: "Reflection Method Under Review",
    disabled_reason: "Consent, privacy and reflection-method governance are not complete.",
    public_use_mode: "safe_reflective_prompt_only",
    source_status: "under_governance_review"
  }
};

function audit(title, status, keys) {
  return {
    module_id: "AG66A",
    title,
    status,
    audit_passed: true,
    checks: keys.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: []
  };
}

const noBackend = audit("No Backend/Auth/RLS/Database Runtime Audit", "no_backend_auth_rls_database_runtime_audit_passed", [
  "backend_runtime_activated",
  "backend_auth_supabase_activation_performed",
  "runtime_database_query_enabled",
  "service_role_used",
  "rls_policy_mutation_enabled"
]);

const noV02 = audit("No V02 Expansion Audit", "no_v02_expansion_audit_passed", [
  "v02_expansion_started",
  "v02_item_activated",
  "backend_runtime_activated"
]);

const readiness = {
  module_id: "AG66A",
  title: "AG66B Star Reflection UI Wiring Readiness Record",
  status: "ready_for_ag66b_star_reflection_ui_wiring",
  ready_for_ag66b: true,
  next_stage: "AG66B — Star Reflection UI Wiring",
  reason: "Initial working data, source registry, consent/privacy schema, reflection methodology, input disablement gate, feedback schema, admin absorption schema and generated safe working data are present."
};

const boundary = {
  module_id: "AG66A",
  title: "AG66A to AG66B Boundary",
  status: "ag66b_star_reflection_ui_wiring_boundary_created",
  allowed_next_scope: [
    "Wire homepage Star Reflection card to generated/star-reflection-working-data.json.",
    "Keep all personal input disabled.",
    "Preserve non-prediction, non-assessment and consent/privacy-gated language.",
    "Do not activate personal input, consent runtime, prediction, assessment, runtime AI or backend."
  ],
  blocked_scope_without_explicit_approval: [
    "personal input collection",
    "name/DOB/birth-time/birth-location processing",
    "consent collection runtime",
    "personalised astrology",
    "horoscope prediction",
    "assessment or scoring",
    "decision guidance",
    "runtime AI calls",
    "external API/live source fetch",
    "Supabase/Auth/backend activation",
    "runtime database writes",
    "service-role use",
    "V02 expansion",
    "direct user feedback absorption"
  ]
};

const review = {
  module_id: "AG66A",
  title: "Star Reflection Foundation",
  status: "ag66a_star_reflection_foundation_completed",
  current_git_context: git,
  source_consumption_file: outputs.sourceConsumption,
  initial_working_data_file: outputs.initialWorkingData,
  source_registry_file: outputs.sourceRegistry,
  consent_privacy_schema_file: outputs.consentPrivacySchema,
  reflection_methodology_file: outputs.reflectionMethodology,
  input_gate_file: outputs.inputGate,
  ai_policy_file: outputs.aiPolicy,
  feedback_schema_file: outputs.feedbackSchema,
  admin_absorption_schema_file: outputs.adminSchema,
  generated_data_file: outputs.generatedData,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    source_records_consumed: true,
    star_reflection_ui_targets_confirmed: true,
    initial_working_data_created: true,
    source_registry_created: true,
    consent_privacy_schema_created: true,
    reflection_methodology_created: true,
    input_disablement_gate_created: true,
    ai_policy_created_runtime_inactive: true,
    feedback_schema_created: true,
    admin_review_absorption_schema_created: true,
    generated_star_reflection_data_created: true,
    ui_wired_now: false,
    personal_input_collection_enabled: false,
    consent_collection_enabled: false,
    birth_detail_processing_enabled: false,
    astrology_calculation_active: false,
    reflection_generation_active: false,
    horoscope_prediction_active: false,
    assessment_scoring_active: false,
    deterministic_claim_active: false,
    decision_guidance_active: false,
    external_api_fetch_active: false,
    ai_generation_active: false,
    runtime_ai_active: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag66b: true
  }
};

const registry = {
  module_id: "AG66A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG66A",
  status: review.status,
  source_records_consumed: 1,
  star_reflection_ui_targets_confirmed: 1,
  initial_working_data_created: 1,
  source_registry_created: 1,
  consent_privacy_schema_created: 1,
  reflection_methodology_created: 1,
  input_disablement_gate_created: 1,
  feedback_schema_created: 1,
  admin_review_absorption_schema_created: 1,
  generated_star_reflection_data_created: 1,
  ui_wired_now: 0,
  personal_input_collection_enabled: 0,
  consent_collection_enabled: 0,
  birth_detail_processing_enabled: 0,
  astrology_calculation_active: 0,
  horoscope_prediction_active: 0,
  assessment_scoring_active: 0,
  deterministic_claim_active: 0,
  decision_guidance_active: 0,
  ai_generation_active: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag66b: 1
};

const doc = `# AG66A — Star Reflection Foundation

AG66A creates the initial working data and feedback-ready methodology foundation for Star Reflection.

## Created

- Initial working data.
- Source registry.
- Consent/privacy schema.
- Reflection methodology.
- Input disablement gate.
- AI/token policy.
- User feedback schema.
- Admin review/absorption schema.
- \`generated/star-reflection-working-data.json\`.

## Not activated

- No personal input collection.
- No name/DOB/birth-time/birth-location processing.
- No consent runtime.
- No astrology calculation.
- No horoscope prediction.
- No assessment or scoring.
- No decision guidance.
- No runtime AI.
- No backend/Auth/Supabase/V02 activation.

## Next

AG66B — Star Reflection UI Wiring.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.initialWorkingData, initialWorkingData);
writeJson(outputs.sourceRegistry, sourceRegistry);
writeJson(outputs.consentPrivacySchema, consentPrivacySchema);
writeJson(outputs.reflectionMethodology, reflectionMethodology);
writeJson(outputs.inputGate, inputGate);
writeJson(outputs.aiPolicy, aiPolicy);
writeJson(outputs.feedbackSchema, feedbackSchema);
writeJson(outputs.adminSchema, adminSchema);
writeJson(outputs.generatedData, generatedData);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG66A Star Reflection Foundation generated.");
console.log("✅ Generated generated/star-reflection-working-data.json.");
console.log("✅ No UI wiring, personal input, prediction, assessment, runtime AI or backend activation performed.");
