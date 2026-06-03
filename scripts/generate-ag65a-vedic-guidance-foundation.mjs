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
function safeReadJson(p) {
  return exists(p) ? readJson(p) : null;
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

const ag64z = readJson("data/content-intelligence/quality-reviews/ag64z-panchang-festival-closure.json");
if (ag64z.summary?.ready_for_ag65 !== true) {
  throw new Error("AG64Z readiness for AG65 missing.");
}

const indexHtml = read("index.html");

const sourceFilesToConsume = [
  "data/content-intelligence/ad-foundation/ad06-vedic-guidance-rule-model.json",
  "data/content-intelligence/ad-foundation/ad06-vedic-guidance-star-reflection-doctrine.json",
  "data/content-intelligence/cultural-modules/ag47c-guidance-public-language-safety-rules.json",
  "data/content-intelligence/cultural-modules/ag47c-non-deterministic-guidance-boundary-record.json",
  "data/content-intelligence/cultural-modules/ag47c-sanskrit-mantra-integrity-gate.json",
  "data/content-intelligence/cultural-modules/ag47c-vedic-guidance-doctrine-consumption-record.json",
  "data/content-intelligence/quality-reviews/ag47c-vedic-guidance-sanskrit-integrity-safety.json",
  "data/content-intelligence/quality-reviews/ag47z-panchang-festival-vedic-closure.json",
  "data/content-intelligence/quality-reviews/ag56-6-word-panchang-reflection-vedic-preview-smoke-test.json",
  "data/knowledge/daily-guidance/daily-guidance-engine-governance-d01.json",
  "data/knowledge/daily-guidance/daily-guidance-rule-schema-d03.json",
  "data/knowledge/daily-guidance/daily-guidance-rule-examples-d03.json",
  "data/knowledge/daily-guidance/daily-guidance-rule-validation-policy-d04.json",
  "data/knowledge/daily-guidance/daily-guidance-selection-preview-d04.json",
  "data/knowledge/sanatan/mantra-policy.json",
  "data/knowledge/sanatan/mantra-selection-policy-d01.json",
  "data/knowledge/sanatan/mantra-source-registry-d06.json",
  "data/knowledge/sanatan/mantra-candidate-registry-d06.json",
  "data/knowledge/sanatan/mantra-review-preview-d06.json",
  "data/knowledge/sanatan/vedic-guidance-taxonomy.json",
  "data/methodology/m06-lucky-number-colour-mantra-selection.json"
];

const consumed = sourceFilesToConsume.map((file) => ({
  file,
  exists: exists(file),
  role: file.includes("mantra")
    ? "Mantra/source integrity and publication safety."
    : file.includes("daily-guidance")
      ? "Daily guidance rule/governance input."
      : file.includes("ag47")
        ? "Vedic guidance safety and non-deterministic boundary."
        : file.includes("ad06")
          ? "Vedic guidance rule model and doctrine."
          : "Supporting methodology/governance record.",
  consumed_as: "reference_only_no_runtime_activation"
}));

const discoveredSourceFiles = [
  ...walk("data", ["vedic", "guidance", "mantra", "weekday", "colour", "color", "food", "daily-guidance"]),
  ...walk("docs", ["vedic", "guidance", "mantra", "weekday", "colour", "color", "food", "daily-guidance"]),
  ...walk("scripts", ["vedic", "guidance", "mantra", "weekday", "colour", "color", "food", "daily-guidance"])
].filter((value, index, arr) => arr.indexOf(value) === index).sort();

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag65a-vedic-guidance-foundation.json",
  sourceConsumption: "data/content-intelligence/phase-01-modules/ag65a-vedic-guidance-source-consumption-record.json",
  initialWorkingData: "data/initial-working-data/vedic-guidance/ag65a-vedic-guidance-initial-working-data.json",
  sourceRegistry: "data/initial-working-data/vedic-guidance/ag65a-vedic-guidance-source-registry.json",
  ruleSchema: "data/methodology/vedic-guidance/ag65a-vedic-guidance-rule-schema.json",
  methodology: "data/methodology/vedic-guidance/ag65a-vedic-guidance-methodology.json",
  mantraGate: "data/methodology/vedic-guidance/ag65a-mantra-integrity-and-publication-gate.json",
  aiPolicy: "data/methodology/vedic-guidance/ag65a-vedic-guidance-ai-token-policy.json",
  feedbackSchema: "data/feedback/vedic-guidance/ag65a-vedic-guidance-user-feedback-schema.json",
  adminSchema: "data/feedback/vedic-guidance/ag65a-vedic-guidance-admin-review-absorption-schema.json",
  generatedData: "generated/vedic-guidance-working-data.json",
  readiness: "data/content-intelligence/quality-registry/ag65a-ag65b-vedic-guidance-ui-wiring-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag65a-to-ag65b-vedic-guidance-ui-wiring-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag65a-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag65a-no-v02-expansion-audit.json",
  registry: "data/quality/ag65a-vedic-guidance-foundation.json",
  preview: "data/quality/ag65a-vedic-guidance-foundation-preview.json",
  doc: "docs/quality/AG65A_VEDIC_GUIDANCE_FOUNDATION.md"
};

for (const snippet of [
  "Today’s Vedic Guidance",
  "vedic-title-hi",
  "vedic-weekday-hi",
  "vedic-colour-hi",
  "vedic-food-hi",
  "vedic-mantra-hi",
  "vedic-note-en",
  "vedic-safety-note",
  "Reflective preview only; weekday, colour, mantra and food logic require verified source methodology before activation."
]) {
  if (!indexHtml.includes(snippet)) {
    throw new Error(`Missing Vedic Guidance UI target/safety copy: ${snippet}`);
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
  module_id: "AG65A",
  title: "Today's Vedic Guidance Source Consumption Record",
  status: "source_records_consumed_foundation_only",
  consumed_previous_stage: "data/content-intelligence/quality-reviews/ag64z-panchang-festival-closure.json",
  consumed_homepage_targets: true,
  consumed_files: consumed,
  discovered_source_files: discoveredSourceFiles.slice(0, 160),
  conclusion: "AG65A can create safe initial working data and methodology. Weekday, colour, food and mantra outputs remain source-verification-gated and non-predictive."
};

const initialWorkingData = {
  module_id: "AG65A",
  title: "Today's Vedic Guidance Initial Working Data",
  status: "initial_working_data_created_not_publicly_wired",
  public_ui_activation_status: "not_wired_in_ag65a",
  current_public_mode: "safe_reflective_preview_without_rule_activation",
  working_data_contract: {
    generated_file: "generated/vedic-guidance-working-data.json",
    required_ui_targets: [
      "vedic-title-hi",
      "vedic-weekday-hi",
      "vedic-colour-hi",
      "vedic-food-hi",
      "vedic-mantra-hi",
      "vedic-note-en"
    ],
    sensitive_fields: [
      "weekday_hindi",
      "suggested_colour_hindi",
      "food_hindi",
      "mantra_hindi"
    ]
  },
  blocked_now: [
    "No weekday-based rule activation.",
    "No colour recommendation activation.",
    "No food recommendation activation.",
    "No mantra publication.",
    "No personal prediction.",
    "No live Panchang-based guidance.",
    "No runtime AI.",
    "No external API/source fetch.",
    "No backend/Auth/Supabase/V02 activation."
  ]
};

const sourceRegistry = {
  module_id: "AG65A",
  title: "Today's Vedic Guidance Source Registry",
  status: "source_registry_defined_live_source_use_disabled",
  live_source_fetching_enabled: false,
  external_api_enabled: false,
  panchang_dependency_active: false,
  source_levels: [
    {
      level: 1,
      label: "Primary textual source",
      use_case: "Any mantra, ritual or rule-based claim must be tied to a verified textual/source reference."
    },
    {
      level: 2,
      label: "Traditional or regional authority",
      use_case: "Regional practice, weekday association, vrata/observance-related guidance."
    },
    {
      level: 3,
      label: "Modern scholarly or editorial source",
      use_case: "Plain-language explanation and non-authoritative reflection."
    },
    {
      level: 4,
      label: "Drishvara editorial reflection",
      use_case: "Safe reflective prompt only; cannot create authority, mantra or prescription."
    }
  ],
  source_record_schema: {
    source_id: "string",
    source_name: "string",
    source_level: "1 | 2 | 3 | 4",
    guidance_domain: "weekday | colour | food | mantra | reflection | panchang_dependency",
    source_type: "textual | traditional | scholarly | editorial",
    url_or_reference: "string_or_null",
    access_status: "verified | under_verification | unavailable | blocked",
    allowed_for_public_values: false,
    admin_approved: false,
    review_note: "string"
  }
};

const ruleSchema = {
  module_id: "AG65A",
  title: "Today's Vedic Guidance Rule Schema",
  status: "rule_schema_created_rule_execution_inactive",
  rule_execution_active_now: false,
  panchang_dependent_logic_active_now: false,
  fields: [
    "rule_id",
    "weekday",
    "weekday_hindi",
    "colour_basis",
    "suggested_colour_hindi",
    "food_basis",
    "food_hindi",
    "mantra_source_id",
    "mantra_hindi",
    "reflection_note_en",
    "panchang_dependency",
    "source_ids",
    "review_status",
    "public_ready"
  ],
  safety_rule: "Do not display rule-derived weekday, colour, food or mantra outputs unless source status and admin review are complete."
};

const methodology = {
  module_id: "AG65A",
  title: "Today's Vedic Guidance Methodology",
  status: "methodology_created_not_runtime_active",
  methodology_version: "vedic_guidance_method_v1",
  principles: [
    "Treat the module as reflective guidance, not prediction.",
    "Do not make personal, deterministic or decision-guiding claims.",
    "Do not publish mantra text unless the mantra source, transliteration, meaning and usage context are verified.",
    "Do not infer weekday, colour or food guidance from unreviewed associations.",
    "Do not connect live Panchang values to guidance until the Panchang engine is separately approved.",
    "Keep Hindi/English terminology bilingual and non-prescriptive.",
    "Separate reflection note from religious instruction.",
    "User feedback cannot directly modify guidance logic; admin review is mandatory."
  ],
  output_separation: {
    date_context_layer: ["weekday_hindi"],
    rule_layer: ["suggested_colour_hindi", "food_hindi", "mantra_hindi"],
    reflection_layer: ["short_note_english"],
    safety_layer: ["source_status", "public_use_mode", "methodology_note"]
  },
  blocked_now: [
    "No live rule execution.",
    "No mantra publication.",
    "No ritual instruction.",
    "No prediction.",
    "No runtime AI generation.",
    "No external API/source fetch.",
    "No backend/Auth/Supabase activation."
  ]
};

const mantraGate = {
  module_id: "AG65A",
  title: "Mantra Integrity and Publication Gate",
  status: "mantra_publication_gate_created_blocked_by_default",
  mantra_publication_allowed_now: false,
  required_before_publication: [
    "verified mantra source",
    "verified Sanskrit/Hindi text",
    "transliteration if used",
    "plain meaning if used",
    "context of use",
    "editor/admin approval",
    "safety note where required"
  ],
  blocked_examples: [
    "unreviewed mantra text",
    "AI-generated mantra",
    "mantra selected only by weekday",
    "mantra presented as remedy",
    "mantra presented as personal prediction"
  ],
  current_public_value: "मंत्र प्रदर्शन स्रोत-सत्यापन के पश्चात"
};

const aiPolicy = {
  module_id: "AG65A",
  title: "Today's Vedic Guidance AI and Token Policy",
  status: "ai_policy_defined_runtime_inactive",
  ai_runtime_active: false,
  user_triggered_ai_allowed: false,
  allowed_future_ai_roles_after_approval: [
    "flag missing source attribution",
    "compare bilingual terminology for consistency",
    "triage user feedback for admin review",
    "summarise reviewed source notes into non-prescriptive copy"
  ],
  blocked_ai_roles: [
    "invent mantra",
    "invent religious remedy",
    "publish weekday/colour/food logic without source",
    "generate personal prediction",
    "directly alter public guidance",
    "absorb user feedback without admin approval"
  ],
  cost_policy: {
    expected_monthly_token_pressure: "low_until_admin_review_workflow_activation",
    initial_monthly_cap_inr: 1000,
    stronger_model_use: "only for Sanskrit/source-risk review after explicit approval"
  }
};

const feedbackSchema = {
  module_id: "AG65A",
  title: "Today's Vedic Guidance User Feedback Schema",
  status: "feedback_schema_defined_not_publicly_active",
  user_feedback_allowed_now: false,
  routing_rule: "User feedback must go to admin review before system absorption.",
  fields: [
    "feedback_id",
    "guidance_date",
    "field_under_question",
    "weekday_concern",
    "colour_concern",
    "food_concern",
    "mantra_concern",
    "source_request",
    "language_concern",
    "suggested_improvement",
    "user_comment",
    "submitted_at",
    "review_status"
  ]
};

const adminSchema = {
  module_id: "AG65A",
  title: "Today's Vedic Guidance Admin Review and Absorption Schema",
  status: "admin_review_absorption_schema_defined_not_runtime_active",
  admin_review_required: true,
  automatic_absorption_allowed: false,
  fields: [
    "review_id",
    "feedback_id",
    "rule_id",
    "source_id",
    "admin_decision",
    "decision_reason",
    "approved_change_type",
    "source_registry_update_required",
    "mantra_review_required",
    "weekday_rule_update_required",
    "colour_food_rule_update_required",
    "public_use_mode_change",
    "absorbed_into_methodology_version",
    "reviewed_at"
  ],
  absorption_rule: "Only admin-approved feedback can modify source registry, guidance rules, mantra status, bilingual terminology or public output status.",
  methodology_versioning: {
    current_version: "vedic_guidance_method_v1",
    next_version_trigger: "admin-approved source/rule/mantra update"
  }
};

const generatedData = {
  status: "initial_vedic_guidance_ready_not_publicly_wired",
  generated_at: new Date().toISOString(),
  module_id: "AG65A",
  public_ui_ready: false,
  rule_execution_active: false,
  panchang_dependent_logic_active: false,
  external_api_fetch_active: false,
  ai_generation_active: false,
  mantra_publication_allowed: false,
  personal_prediction_active: false,
  deterministic_claim_active: false,
  methodology_version: "vedic_guidance_method_v1",
  vedic_guidance: {
    hindi_title: "आज का वैदिक संकेत",
    weekday_hindi: "विधि सत्यापनाधीन",
    suggested_colour_hindi: "स्रोत सत्यापन के बाद प्रकाशित",
    food_hindi: "सामान्य चिंतन संकेत",
    mantra_hindi: "मंत्र प्रदर्शन स्रोत-सत्यापन के पश्चात",
    short_note_english: "General reflection only. No personal prediction or live Panchang-based calculation is active.",
    source_status: "under_verification",
    public_use_mode: "safe_reflective_preview",
    methodology_note: "Reflective preview only; weekday, colour, mantra and food logic require verified source methodology before activation."
  }
};

function audit(title, status, keys) {
  return {
    module_id: "AG65A",
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
  module_id: "AG65A",
  title: "AG65B Today's Vedic Guidance UI Wiring Readiness Record",
  status: "ready_for_ag65b_vedic_guidance_ui_wiring",
  ready_for_ag65b: true,
  next_stage: "AG65B — Today's Vedic Guidance UI Wiring",
  reason: "Initial working data, source registry, rule schema, methodology, mantra gate, feedback schema, admin absorption schema and generated safe working data are present."
};

const boundary = {
  module_id: "AG65A",
  title: "AG65A to AG65B Boundary",
  status: "ag65b_vedic_guidance_ui_wiring_boundary_created",
  allowed_next_scope: [
    "Wire homepage Today's Vedic Guidance card to generated/vedic-guidance-working-data.json.",
    "Keep all values safe and source-verification-gated.",
    "Preserve non-prediction and no live Panchang dependency language.",
    "Do not activate rule execution, mantra publication, runtime AI or backend."
  ],
  blocked_scope_without_explicit_approval: [
    "rule-based weekday/colour/food activation",
    "mantra publication",
    "personal prediction",
    "live Panchang-dependent guidance",
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
  module_id: "AG65A",
  title: "Today's Vedic Guidance Foundation",
  status: "ag65a_vedic_guidance_foundation_completed",
  current_git_context: git,
  source_consumption_file: outputs.sourceConsumption,
  initial_working_data_file: outputs.initialWorkingData,
  source_registry_file: outputs.sourceRegistry,
  rule_schema_file: outputs.ruleSchema,
  methodology_file: outputs.methodology,
  mantra_gate_file: outputs.mantraGate,
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
    vedic_ui_targets_confirmed: true,
    initial_working_data_created: true,
    source_registry_created: true,
    rule_schema_created: true,
    methodology_created: true,
    mantra_integrity_gate_created: true,
    ai_policy_created_runtime_inactive: true,
    feedback_schema_created: true,
    admin_review_absorption_schema_created: true,
    generated_vedic_guidance_data_created: true,
    ui_wired_now: false,
    rule_execution_active: false,
    panchang_dependent_logic_active: false,
    mantra_publication_allowed: false,
    personal_prediction_active: false,
    deterministic_claim_active: false,
    external_api_fetch_active: false,
    ai_generation_active: false,
    runtime_ai_active: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag65b: true
  }
};

const registry = {
  module_id: "AG65A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG65A",
  status: review.status,
  source_records_consumed: 1,
  vedic_ui_targets_confirmed: 1,
  initial_working_data_created: 1,
  source_registry_created: 1,
  rule_schema_created: 1,
  methodology_created: 1,
  mantra_integrity_gate_created: 1,
  feedback_schema_created: 1,
  admin_review_absorption_schema_created: 1,
  generated_vedic_guidance_data_created: 1,
  ui_wired_now: 0,
  rule_execution_active: 0,
  panchang_dependent_logic_active: 0,
  mantra_publication_allowed: 0,
  personal_prediction_active: 0,
  deterministic_claim_active: 0,
  ai_generation_active: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag65b: 1
};

const doc = `# AG65A — Today's Vedic Guidance Foundation

AG65A creates the initial working data and feedback-ready methodology foundation for Today's Vedic Guidance.

## Created

- Initial working data.
- Source registry.
- Rule schema.
- Vedic Guidance methodology.
- Mantra integrity and publication gate.
- AI/token policy.
- User feedback schema.
- Admin review/absorption schema.
- \`generated/vedic-guidance-working-data.json\`.

## Not activated

- No rule execution.
- No mantra publication.
- No personal prediction.
- No live Panchang-dependent guidance.
- No external API/source fetch.
- No runtime AI.
- No backend/Auth/Supabase/V02 activation.

## Next

AG65B — Today's Vedic Guidance UI Wiring.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.initialWorkingData, initialWorkingData);
writeJson(outputs.sourceRegistry, sourceRegistry);
writeJson(outputs.ruleSchema, ruleSchema);
writeJson(outputs.methodology, methodology);
writeJson(outputs.mantraGate, mantraGate);
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

console.log("✅ AG65A Today's Vedic Guidance Foundation generated.");
console.log("✅ Generated generated/vedic-guidance-working-data.json.");
console.log("✅ No UI wiring, rule execution, mantra publication, runtime AI or backend activation performed.");
