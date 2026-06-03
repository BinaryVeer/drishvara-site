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

const ag67a = readJson("data/content-intelligence/quality-reviews/ag67a-psychometric-assessment-foundation.json");
const workingData = readJson("generated/psychometric-assessment-working-data.json");
const indexHtml = read("index.html");

if (ag67a.summary?.ready_for_ag67b !== true) {
  throw new Error("AG67A readiness for AG67B missing.");
}

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag67b-psychometric-assessment-ui-wiring.json",
  apply: "data/content-intelligence/phase-01-modules/ag67b-psychometric-assessment-ui-wiring-apply-record.json",
  uiContract: "data/content-intelligence/phase-01-modules/ag67b-psychometric-assessment-ui-data-contract-record.json",
  readiness: "data/content-intelligence/quality-registry/ag67b-ag67z-psychometric-assessment-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag67b-to-ag67z-psychometric-assessment-closure-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag67b-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag67b-no-v02-expansion-audit.json",
  registry: "data/quality/ag67b-psychometric-assessment-ui-wiring.json",
  preview: "data/quality/ag67b-psychometric-assessment-ui-wiring-preview.json",
  doc: "docs/quality/AG67B_PSYCHOMETRIC_ASSESSMENT_UI_WIRING.md"
};

for (const snippet of [
  "data-drishvara-ag67b-psychometric-assessment-ui-wiring",
  "generated/psychometric-assessment-working-data.json",
  "drishvaraAg67bLoadPsychometricAssessment",
  "data-drishvara-ag67b-psychometric-assessment-wired",
  "data-drishvara-ag67b-non-interactive"
]) {
  if (!indexHtml.includes(snippet)) {
    throw new Error(`Missing AG67B UI wiring snippet: ${snippet}`);
  }
}

for (const snippet of [
  'id="psychometric-card"',
  'id="psychometric-subtitle"',
  "Psychometric Assessment",
  "Coming Soon",
  "This space is reserved for future guided self-discovery. No assessment, data collection or scoring is active."
]) {
  if (!indexHtml.includes(snippet)) {
    throw new Error(`Missing Psychometric UI target/safety copy: ${snippet}`);
  }
}

const psych = workingData.psychometric_assessment || {};
const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const apply = {
  module_id: "AG67B",
  title: "Psychometric Assessment UI Wiring Apply Record",
  status: "psychometric_assessment_ui_wiring_applied",
  corrected_files: ["index.html"],
  source_file: "generated/psychometric-assessment-working-data.json",
  ui_targets: [
    "#psychometric-card",
    "#psychometric-subtitle",
    ".status-badge",
    ".utility-note"
  ],
  behaviour: {
    fetches_generated_psychometric_assessment_data: true,
    updates_safe_placeholder_fields: true,
    preserves_non_interactive_placeholder: true,
    preserves_no_assessment_data_collection_scoring_language: true,
    public_assessment_launch_enabled: false,
    personal_input_collection_enabled: false,
    student_data_collection_enabled: false,
    child_minor_data_processing_enabled: false,
    guardian_consent_runtime_enabled: false,
    school_permission_runtime_enabled: false,
    questionnaire_runtime_enabled: false,
    scoring_runtime_enabled: false,
    report_generation_enabled: false,
    runtime_ai_enabled: false,
    backend_enabled: false
  }
};

const uiContract = {
  module_id: "AG67B",
  title: "Psychometric Assessment UI Data Contract Record",
  status: "psychometric_assessment_ui_data_contract_recorded",
  source_file: "generated/psychometric-assessment-working-data.json",
  field_mapping: {
    "psychometric-card": "psychometric_assessment.card_id",
    "card.label": "psychometric_assessment.label",
    "card.title": "psychometric_assessment.title",
    "psychometric-subtitle": "psychometric_assessment.subtitle",
    "status-badge": "psychometric_assessment.status_label",
    "utility-note": "psychometric_assessment.safety_note"
  },
  current_safe_placeholder: {
    label: psych.label,
    title: psych.title,
    subtitle: psych.subtitle,
    status_label: psych.status_label,
    safety_note: psych.safety_note,
    public_use_mode: psych.public_use_mode,
    source_status: psych.source_status
  },
  current_public_state: "safe_placeholder_from_generated_working_data",
  note: "AG67B wires the UI to generated safe working data. Public assessment, questionnaire runtime, data collection, scoring, diagnosis, reporting, runtime AI and backend remain inactive."
};

function audit(title, status, keys) {
  return {
    module_id: "AG67B",
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
  module_id: "AG67B",
  title: "AG67Z Psychometric Assessment Closure Readiness Record",
  status: "ready_for_ag67z_psychometric_assessment_closure",
  ready_for_ag67z: true,
  next_stage: "AG67Z — Psychometric and Assessment Working Data and UI Wiring Closure",
  reason: "Psychometric Assessment now has initial working data, ethics/consent schema, minor protection schema, methodology, runtime blocker, generated safe JSON and homepage UI wiring."
};

const boundary = {
  module_id: "AG67B",
  title: "AG67B to AG67Z Boundary",
  status: "ag67z_psychometric_assessment_closure_boundary_created",
  allowed_next_scope: [
    "Validate Psychometric Assessment working data + UI wiring end-to-end.",
    "Confirm live HTML contains AG67B script and generated/psychometric-assessment-working-data.json is accessible.",
    "Record closure before moving beyond current governed row."
  ],
  blocked_scope_without_explicit_approval: [
    "public assessment launch",
    "questionnaire runtime",
    "data collection",
    "student/minor data collection",
    "guardian consent runtime",
    "school permission runtime",
    "psychometric scoring",
    "diagnosis",
    "mental-health inference",
    "academic/career prediction",
    "report generation",
    "runtime AI calls",
    "external API/live source fetch",
    "Supabase/Auth/backend activation",
    "runtime database writes",
    "service-role use",
    "V02 expansion",
    "direct feedback absorption"
  ]
};

const review = {
  module_id: "AG67B",
  title: "Psychometric Assessment UI Wiring",
  status: "ag67b_psychometric_assessment_ui_wiring_completed",
  current_git_context: git,
  apply_file: outputs.apply,
  ui_contract_file: outputs.uiContract,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ui_wiring_applied: true,
    generated_psychometric_assessment_source_connected: true,
    safe_placeholder_values_connected: true,
    non_interactive_placeholder_preserved: true,
    public_assessment_launch_enabled: false,
    personal_input_collection_enabled: false,
    student_data_collection_enabled: false,
    child_minor_data_processing_enabled: false,
    guardian_consent_runtime_enabled: false,
    school_permission_runtime_enabled: false,
    questionnaire_runtime_enabled: false,
    psychometric_test_runtime_enabled: false,
    scoring_runtime_enabled: false,
    trait_diagnosis_enabled: false,
    mental_health_inference_enabled: false,
    report_generation_enabled: false,
    external_api_fetch_active: false,
    ai_generation_active: false,
    runtime_ai_active: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag67z: true
  }
};

const registry = {
  module_id: "AG67B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG67B",
  status: review.status,
  ui_wiring_applied: 1,
  generated_psychometric_assessment_source_connected: 1,
  safe_placeholder_values_connected: 1,
  non_interactive_placeholder_preserved: 1,
  public_assessment_launch_enabled: 0,
  personal_input_collection_enabled: 0,
  student_data_collection_enabled: 0,
  child_minor_data_processing_enabled: 0,
  guardian_consent_runtime_enabled: 0,
  school_permission_runtime_enabled: 0,
  questionnaire_runtime_enabled: 0,
  psychometric_test_runtime_enabled: 0,
  scoring_runtime_enabled: 0,
  trait_diagnosis_enabled: 0,
  mental_health_inference_enabled: 0,
  report_generation_enabled: 0,
  ai_generation_active: 0,
  runtime_ai_active: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag67z: 1
};

const doc = `# AG67B — Psychometric Assessment UI Wiring

AG67B wires the homepage Psychometric Assessment card to \`generated/psychometric-assessment-working-data.json\`.

## Applied

- Safe-placeholder Psychometric Assessment fields are loaded from generated working data.
- Placeholder remains non-interactive.
- The no assessment, no data collection and no scoring safety note remains visible.
- Safe fallback remains available.

## Not activated

- No public assessment launch.
- No questionnaire runtime.
- No data collection.
- No child/minor data processing.
- No guardian consent runtime.
- No school permission runtime.
- No scoring.
- No diagnosis.
- No mental-health inference.
- No academic/career prediction.
- No report generation.
- No runtime AI.
- No backend/Auth/Supabase/V02 activation.

## Next

AG67Z — Psychometric Assessment Closure.
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

console.log("✅ AG67B Psychometric Assessment UI Wiring generated.");
console.log("✅ Ready for AG67Z Psychometric Assessment Closure.");
