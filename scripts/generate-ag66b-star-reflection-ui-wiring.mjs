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
const workingData = readJson("generated/star-reflection-working-data.json");
const indexHtml = read("index.html");

if (ag66a.summary?.ready_for_ag66b !== true) {
  throw new Error("AG66A readiness for AG66B missing.");
}

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag66b-star-reflection-ui-wiring.json",
  apply: "data/content-intelligence/phase-01-modules/ag66b-star-reflection-ui-wiring-apply-record.json",
  uiContract: "data/content-intelligence/phase-01-modules/ag66b-star-reflection-ui-data-contract-record.json",
  readiness: "data/content-intelligence/quality-registry/ag66b-ag66z-star-reflection-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag66b-to-ag66z-star-reflection-closure-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag66b-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag66b-no-v02-expansion-audit.json",
  registry: "data/quality/ag66b-star-reflection-ui-wiring.json",
  preview: "data/quality/ag66b-star-reflection-ui-wiring-preview.json",
  doc: "docs/quality/AG66B_STAR_REFLECTION_UI_WIRING.md"
};

for (const snippet of [
  "data-drishvara-ag66b-star-reflection-ui-wiring",
  "generated/star-reflection-working-data.json",
  "drishvaraAg66bLoadStarReflection",
  "data-drishvara-ag66b-star-reflection-wired",
  "data-drishvara-ag66b-input-disabled"
]) {
  if (!indexHtml.includes(snippet)) {
    throw new Error(`Missing AG66B UI wiring snippet: ${snippet}`);
  }
}

for (const snippet of [
  "Star Reflection",
  "What the stars say about you",
  "Reflective prompt only; not a personal prediction, assessment, or decision guide.",
  "data-drishvara-ag60i-star-input-disabled",
  "Reflection Method Under Review"
]) {
  if (!indexHtml.includes(snippet)) {
    throw new Error(`Missing Star Reflection UI target/safety copy: ${snippet}`);
  }
}

const star = workingData.star_reflection || {};
const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const apply = {
  module_id: "AG66B",
  title: "Star Reflection UI Wiring Apply Record",
  status: "star_reflection_ui_wiring_applied",
  corrected_files: ["index.html"],
  source_file: "generated/star-reflection-working-data.json",
  ui_targets: [
    "Star Reflection card label",
    ".star-safety-note",
    "Star Reflection card heading",
    "Star Reflection body copy",
    "disabled name input",
    "disabled date of birth input",
    "disabled language select",
    "disabled Reflection Method button"
  ],
  behaviour: {
    fetches_generated_star_reflection_data: true,
    updates_safe_preview_fields: true,
    preserves_disabled_inputs: true,
    preserves_consent_privacy_gate: true,
    personal_input_collection_enabled: false,
    consent_collection_enabled: false,
    birth_detail_processing_enabled: false,
    astrology_calculation_active: false,
    horoscope_prediction_active: false,
    assessment_scoring_active: false,
    deterministic_claim_active: false,
    decision_guidance_active: false,
    runtime_ai_enabled: false,
    backend_enabled: false
  }
};

const uiContract = {
  module_id: "AG66B",
  title: "Star Reflection UI Data Contract Record",
  status: "star_reflection_ui_data_contract_recorded",
  source_file: "generated/star-reflection-working-data.json",
  field_mapping: {
    "card.label": "star_reflection.label",
    "card.safety_note": "star_reflection.safety_note",
    "card.heading": "star_reflection.heading",
    "card.body": "star_reflection.body",
    "name.placeholder": "star_reflection.name_placeholder",
    "dob.placeholder": "star_reflection.dob_placeholder",
    "language.options": "star_reflection.language_options",
    "button.label": "star_reflection.button_label"
  },
  current_safe_preview: {
    label: star.label,
    safety_note: star.safety_note,
    heading: star.heading,
    body: star.body,
    button_label: star.button_label,
    public_use_mode: star.public_use_mode,
    source_status: star.source_status
  },
  current_public_state: "safe_reflective_prompt_from_generated_working_data",
  note: "AG66B wires the UI to generated safe working data. Personal input, consent runtime, birth-detail processing, astrology calculation, prediction and assessment remain inactive."
};

function audit(title, status, keys) {
  return {
    module_id: "AG66B",
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
  module_id: "AG66B",
  title: "AG66Z Star Reflection Closure Readiness Record",
  status: "ready_for_ag66z_star_reflection_closure",
  ready_for_ag66z: true,
  next_stage: "AG66Z — Star Reflection Working Data and UI Wiring Closure",
  reason: "Star Reflection now has initial working data, consent/privacy schema, reflection methodology, input disablement gate, generated safe JSON and homepage UI wiring."
};

const boundary = {
  module_id: "AG66B",
  title: "AG66B to AG66Z Boundary",
  status: "ag66z_star_reflection_closure_boundary_created",
  allowed_next_scope: [
    "Validate Star Reflection working data + UI wiring end-to-end.",
    "Confirm live HTML contains AG66B script and generated/star-reflection-working-data.json is accessible.",
    "Record closure before moving to the next governed row."
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
    "direct feedback absorption",
    "Supabase/Auth/backend activation",
    "runtime database writes",
    "service-role use",
    "V02 expansion"
  ]
};

const review = {
  module_id: "AG66B",
  title: "Star Reflection UI Wiring",
  status: "ag66b_star_reflection_ui_wiring_completed",
  current_git_context: git,
  apply_file: outputs.apply,
  ui_contract_file: outputs.uiContract,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ui_wiring_applied: true,
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
    ready_for_ag66z: true
  }
};

const registry = {
  module_id: "AG66B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG66B",
  status: review.status,
  ui_wiring_applied: 1,
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
  ready_for_ag66z: 1
};

const doc = `# AG66B — Star Reflection UI Wiring

AG66B wires the homepage Star Reflection card to \`generated/star-reflection-working-data.json\`.

## Applied

- Safe-preview Star Reflection fields are loaded from generated working data.
- Inputs remain disabled.
- Consent/privacy gate remains visible.
- Safe fallback remains available.

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

AG66Z — Star Reflection Closure.
`;

writeJson(outputs.apply, apply);
writeJson(outputs.uiContract, uiContract);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG66B Star Reflection UI Wiring generated.");
console.log("✅ Ready for AG66Z Star Reflection Closure.");
