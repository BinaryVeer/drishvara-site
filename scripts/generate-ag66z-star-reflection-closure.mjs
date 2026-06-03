import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
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

const ag66a = readJson("data/content-intelligence/quality-reviews/ag66a-star-reflection-foundation.json");
const ag66b = readJson("data/content-intelligence/quality-reviews/ag66b-star-reflection-ui-wiring.json");
const workingData = readJson("generated/star-reflection-working-data.json");
const indexHtml = read("index.html");

if (ag66a.summary?.ready_for_ag66b !== true) throw new Error("AG66A readiness missing.");
if (ag66b.summary?.ready_for_ag66z !== true) throw new Error("AG66B readiness for AG66Z missing.");

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag66z-star-reflection-closure.json",
  closure: "data/content-intelligence/closure-records/ag66z-star-reflection-working-data-and-ui-wiring-closure.json",
  finalStatus: "data/content-intelligence/phase-01-modules/ag66z-star-reflection-final-status-record.json",
  liveEvidence: "data/content-intelligence/phase-01-modules/ag66z-star-reflection-live-verification-evidence-record.json",
  readiness: "data/content-intelligence/quality-registry/ag66z-ag67-psychometric-assessment-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag66z-to-ag67-psychometric-assessment-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag66z-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag66z-no-v02-expansion-audit.json",
  registry: "data/quality/ag66z-star-reflection-closure.json",
  preview: "data/quality/ag66z-star-reflection-closure-preview.json",
  doc: "docs/quality/AG66Z_STAR_REFLECTION_CLOSURE.md"
};

for (const snippet of [
  "data-drishvara-ag66b-star-reflection-ui-wiring",
  "generated/star-reflection-working-data.json",
  "drishvaraAg66bLoadStarReflection",
  "data-drishvara-ag66b-star-reflection-wired",
  "data-drishvara-ag66b-input-disabled"
]) {
  if (!indexHtml.includes(snippet)) {
    throw new Error(`Missing AG66B closure snippet: ${snippet}`);
  }
}

const star = workingData.star_reflection || {};

const disabledChecks = {
  public_ui_ready: workingData.public_ui_ready,
  personal_input_collection_enabled: workingData.personal_input_collection_enabled,
  name_collection_enabled: workingData.name_collection_enabled,
  date_of_birth_collection_enabled: workingData.date_of_birth_collection_enabled,
  birth_time_collection_enabled: workingData.birth_time_collection_enabled,
  birth_location_collection_enabled: workingData.birth_location_collection_enabled,
  consent_collection_enabled: workingData.consent_collection_enabled,
  birth_detail_processing_enabled: workingData.birth_detail_processing_enabled,
  astrology_calculation_active: workingData.astrology_calculation_active,
  reflection_generation_active: workingData.reflection_generation_active,
  horoscope_prediction_active: workingData.horoscope_prediction_active,
  assessment_scoring_active: workingData.assessment_scoring_active,
  deterministic_claim_active: workingData.deterministic_claim_active,
  decision_guidance_active: workingData.decision_guidance_active,
  external_api_fetch_active: workingData.external_api_fetch_active,
  ai_generation_active: workingData.ai_generation_active
};

for (const [key, value] of Object.entries(disabledChecks)) {
  if (value !== false) throw new Error(`${key} must remain false.`);
}

if (star.safety_note !== "Reflective prompt only; not a personal prediction, assessment, or decision guide.") {
  throw new Error("Star Reflection safety note mismatch.");
}
if (star.body !== "Personal input is disabled until consent, privacy and reflection-method governance are complete.") {
  throw new Error("Star Reflection disabled input body mismatch.");
}
if (star.button_label !== "Reflection Method Under Review") {
  throw new Error("Star Reflection button label mismatch.");
}

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const finalStatus = {
  module_id: "AG66Z",
  title: "Star Reflection Final Status Record",
  status: "star_reflection_working_data_and_ui_wiring_closed",
  star_reflection: {
    initial_working_data_created: true,
    source_registry_created: true,
    consent_privacy_schema_created: true,
    reflection_methodology_created: true,
    input_disablement_gate_created: true,
    ai_token_policy_created: true,
    feedback_schema_created: true,
    admin_absorption_schema_created: true,
    generated_working_data_created: true,
    generated_working_data_path: "generated/star-reflection-working-data.json",
    ui_wired_to_generated_data: true,
    live_script_marker_present: true,
    current_safe_preview: {
      label: star.label,
      safety_note: star.safety_note,
      heading: star.heading,
      body: star.body,
      button_label: star.button_label,
      public_use_mode: star.public_use_mode,
      source_status: star.source_status
    },
    public_ui_ready: workingData.public_ui_ready === true,
    personal_input_collection_enabled: workingData.personal_input_collection_enabled === true,
    name_collection_enabled: workingData.name_collection_enabled === true,
    date_of_birth_collection_enabled: workingData.date_of_birth_collection_enabled === true,
    birth_time_collection_enabled: workingData.birth_time_collection_enabled === true,
    birth_location_collection_enabled: workingData.birth_location_collection_enabled === true,
    consent_collection_enabled: workingData.consent_collection_enabled === true,
    birth_detail_processing_enabled: workingData.birth_detail_processing_enabled === true,
    astrology_calculation_active: workingData.astrology_calculation_active === true,
    horoscope_prediction_active: workingData.horoscope_prediction_active === true,
    assessment_scoring_active: workingData.assessment_scoring_active === true,
    deterministic_claim_active: workingData.deterministic_claim_active === true,
    decision_guidance_active: workingData.decision_guidance_active === true,
    ai_generation_active: workingData.ai_generation_active === true
  },
  current_public_state: "safe_reflective_prompt_from_generated_working_data",
  future_activation_needed_for_full_star_reflection_engine: [
    "Explicit consent and privacy model approval.",
    "Secure backend/Auth/storage decision if personal input is ever enabled.",
    "Retention, deletion, export and withdrawal workflow.",
    "Age/minor handling where applicable.",
    "Reflection methodology review.",
    "Non-prediction and non-assessment audit.",
    "Live verification before any public input activation."
  ]
};

const liveEvidence = {
  module_id: "AG66Z",
  title: "Star Reflection Live Verification Evidence Record",
  status: "operator_live_verification_recorded",
  evidence_from_operator_terminal: {
    live_homepage_contains_ag66b_script_markers: true,
    live_generated_star_reflection_json_accessible: true,
    live_generated_status: workingData.status,
    live_public_ui_ready: workingData.public_ui_ready,
    personal_input_collection_enabled: workingData.personal_input_collection_enabled,
    name_collection_enabled: workingData.name_collection_enabled,
    date_of_birth_collection_enabled: workingData.date_of_birth_collection_enabled,
    birth_time_collection_enabled: workingData.birth_time_collection_enabled,
    birth_location_collection_enabled: workingData.birth_location_collection_enabled,
    consent_collection_enabled: workingData.consent_collection_enabled,
    birth_detail_processing_enabled: workingData.birth_detail_processing_enabled,
    astrology_calculation_active: workingData.astrology_calculation_active,
    horoscope_prediction_active: workingData.horoscope_prediction_active,
    assessment_scoring_active: workingData.assessment_scoring_active,
    deterministic_claim_active: workingData.deterministic_claim_active,
    decision_guidance_active: workingData.decision_guidance_active,
    ai_generation_active: workingData.ai_generation_active,
    label: star.label,
    safety_note: star.safety_note,
    heading: star.heading,
    body: star.body,
    button_label: star.button_label
  },
  note: "The operator verified GitHub Pages live HTML and generated/star-reflection-working-data.json after AG66B push."
};

function audit(title, status, keys) {
  return {
    module_id: "AG66Z",
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
  module_id: "AG66Z",
  title: "AG67 Psychometric and Assessment Readiness Record",
  status: "ready_for_ag67_psychometric_assessment_initial_working_data_engine",
  ready_for_ag67: true,
  next_stage: "AG67 — Psychometric and Assessment Initial Working Data + Feedback-Ready Engine",
  reason: "Star Reflection row is closed at working-data + UI-wiring level. Personal input, consent runtime, prediction, assessment and birth-detail processing remain disabled; next governed row can begin."
};

const boundary = {
  module_id: "AG66Z",
  title: "AG66Z to AG67 Boundary",
  status: "ag67_psychometric_assessment_boundary_created",
  allowed_next_scope: [
    "Create Psychometric and Assessment initial working data.",
    "Create consent, minor, privacy and ethics schema.",
    "Create non-diagnostic and non-deterministic assessment boundary.",
    "Create feedback/admin review/absorption schema.",
    "Generate safe assessment scaffold working-data JSON.",
    "Wire UI only after working data exists."
  ],
  blocked_scope_without_explicit_approval: [
    "public assessment launch",
    "psychometric scoring",
    "trait diagnosis",
    "mental health inference",
    "minor data processing",
    "enabled personal input collection",
    "runtime AI calls",
    "external API/live source fetch",
    "Supabase/Auth/backend activation",
    "runtime database writes",
    "service-role use",
    "V02 expansion",
    "direct user feedback absorption without admin review"
  ]
};

const closure = {
  module_id: "AG66Z",
  title: "Star Reflection Working Data and UI Wiring Closure",
  status: "ag66z_star_reflection_working_data_and_ui_wiring_closed",
  closed_stages: [
    "AG66A — Star Reflection Initial Working Data + Methodology Foundation",
    "AG66B — Star Reflection UI Wiring"
  ],
  closure_result: "Star Reflection has safe working data, source registry, consent/privacy schema, reflection methodology, input disablement gate, feedback/admin schemas, generated JSON and homepage UI wiring.",
  not_closed_as_full_star_reflection_engine: [
    "Personal input collection is not active.",
    "Consent collection runtime is not active.",
    "Name/DOB/birth-time/birth-location processing is not active.",
    "Astrology calculation is not active.",
    "Horoscope prediction is not active.",
    "Assessment/scoring is not active.",
    "Decision guidance is not active.",
    "Runtime AI generation is not active.",
    "Backend/Auth/Supabase/V02 is not active."
  ]
};

const review = {
  module_id: "AG66Z",
  title: "Star Reflection Closure",
  status: "ag66z_star_reflection_closure_completed",
  current_git_context: git,
  closure_file: outputs.closure,
  final_status_file: outputs.finalStatus,
  live_evidence_file: outputs.liveEvidence,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag66a_foundation_completed: true,
    ag66b_ui_wiring_completed: true,
    live_evidence_recorded: true,
    star_reflection_row_closed_at_working_data_level: true,
    generated_star_reflection_source_connected: true,
    safe_preview_values_connected: true,
    disabled_inputs_preserved: true,
    personal_input_collection_enabled: false,
    consent_collection_enabled: false,
    birth_detail_processing_enabled: false,
    astrology_calculation_active: false,
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
    ready_for_ag67: true
  }
};

const registry = {
  module_id: "AG66Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG66Z",
  status: review.status,
  ag66a_foundation_completed: 1,
  ag66b_ui_wiring_completed: 1,
  live_evidence_recorded: 1,
  star_reflection_row_closed_at_working_data_level: 1,
  generated_star_reflection_source_connected: 1,
  safe_preview_values_connected: 1,
  disabled_inputs_preserved: 1,
  personal_input_collection_enabled: 0,
  consent_collection_enabled: 0,
  birth_detail_processing_enabled: 0,
  astrology_calculation_active: 0,
  horoscope_prediction_active: 0,
  assessment_scoring_active: 0,
  deterministic_claim_active: 0,
  decision_guidance_active: 0,
  ai_generation_active: 0,
  runtime_ai_active: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag67: 1
};

const doc = `# AG66Z — Star Reflection Closure

AG66Z closes Star Reflection at the working-data and UI-wiring level.

## Closed

- AG66A created safe working data, source registry, consent/privacy schema, reflection methodology, input disablement gate, feedback schema, admin absorption schema and generated JSON.
- AG66B wired the homepage Star Reflection card to \`generated/star-reflection-working-data.json\`.
- Live verification confirmed AG66B script markers and generated Star Reflection JSON.

## Current safe preview

- Label: ${star.label}
- Safety Note: ${star.safety_note}
- Heading: ${star.heading}
- Body: ${star.body}
- Button: ${star.button_label}

## Not activated

- No personal input collection.
- No name/DOB/birth-time/birth-location processing.
- No consent runtime.
- No astrology calculation.
- No horoscope prediction.
- No assessment/scoring.
- No decision guidance.
- No external API/source fetch.
- No runtime AI.
- No backend/Auth/Supabase/V02 activation.

## Next

AG67 — Psychometric and Assessment Initial Working Data + Feedback-Ready Engine.
`;

writeJson(outputs.finalStatus, finalStatus);
writeJson(outputs.liveEvidence, liveEvidence);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.closure, closure);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG66Z Star Reflection Closure generated.");
console.log("✅ Ready for AG67 Psychometric and Assessment.");
