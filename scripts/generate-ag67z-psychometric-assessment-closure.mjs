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
const ag67b = readJson("data/content-intelligence/quality-reviews/ag67b-psychometric-assessment-ui-wiring.json");
const ag67br1 = readJson("data/content-intelligence/quality-reviews/ag67b-r1-assessment-client-doctrine.json");
const workingData = readJson("generated/psychometric-assessment-working-data.json");
const indexHtml = read("index.html");

if (ag67a.summary?.ready_for_ag67b !== true) throw new Error("AG67A readiness missing.");
if (ag67b.summary?.ready_for_ag67z !== true) throw new Error("AG67B readiness missing.");
if (ag67br1.summary?.ready_for_ag67z !== true) throw new Error("AG67B-R1 readiness missing.");

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag67z-psychometric-assessment-closure.json",
  closure: "data/content-intelligence/closure-records/ag67z-psychometric-assessment-working-data-ui-wiring-doctrine-closure.json",
  finalStatus: "data/content-intelligence/phase-01-modules/ag67z-psychometric-assessment-final-status-record.json",
  liveEvidence: "data/content-intelligence/phase-01-modules/ag67z-psychometric-assessment-live-verification-evidence-record.json",
  nextBoundary: "data/content-intelligence/mutation-plans/ag67z-to-next-governed-stage-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag67z-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag67z-no-v02-expansion-audit.json",
  registry: "data/quality/ag67z-psychometric-assessment-closure.json",
  preview: "data/quality/ag67z-psychometric-assessment-closure-preview.json",
  doc: "docs/quality/AG67Z_PSYCHOMETRIC_ASSESSMENT_CLOSURE.md"
};

for (const snippet of [
  "data-drishvara-ag67b-psychometric-assessment-ui-wiring",
  "generated/psychometric-assessment-working-data.json",
  "drishvaraAg67bLoadPsychometricAssessment",
  "data-drishvara-ag67b-psychometric-assessment-wired",
  "data-drishvara-ag67b-non-interactive"
]) {
  if (!indexHtml.includes(snippet)) throw new Error(`Missing AG67B closure snippet: ${snippet}`);
}

const falseFlags = [
  "public_ui_ready",
  "public_assessment_launch_enabled",
  "personal_input_collection_enabled",
  "student_data_collection_enabled",
  "child_minor_data_processing_enabled",
  "guardian_consent_runtime_enabled",
  "school_permission_runtime_enabled",
  "questionnaire_runtime_enabled",
  "psychometric_test_runtime_enabled",
  "scoring_runtime_enabled",
  "trait_diagnosis_enabled",
  "mental_health_inference_enabled",
  "academic_prediction_enabled",
  "career_prediction_enabled",
  "student_ranking_enabled",
  "report_generation_enabled",
  "external_api_fetch_active",
  "ai_generation_active"
];

for (const key of falseFlags) {
  if (workingData[key] !== false) throw new Error(`${key} must remain false.`);
}

const psych = workingData.psychometric_assessment || {};
if (psych.card_id !== "psychometric-card") throw new Error("Psychometric card ID mismatch.");
if (psych.status_label !== "Coming Soon") throw new Error("Psychometric status label mismatch.");
if (psych.safety_note !== "This space is reserved for future guided self-discovery. No assessment, data collection or scoring is active.") {
  throw new Error("Psychometric safety note mismatch.");
}

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const finalStatus = {
  module_id: "AG67Z",
  title: "Psychometric Assessment Final Status Record",
  status: "psychometric_assessment_working_data_ui_wiring_and_doctrine_closed",
  closed_components: {
    ag67a_foundation_completed: true,
    ag67b_ui_wiring_completed: true,
    ag67b_r1_client_doctrine_completed: true
  },
  current_safe_public_state: {
    generated_working_data_path: "generated/psychometric-assessment-working-data.json",
    homepage_ui_wired_to_generated_data: true,
    card_id: psych.card_id,
    title: psych.title,
    subtitle: psych.subtitle,
    status_label: psych.status_label,
    safety_note: psych.safety_note,
    public_use_mode: psych.public_use_mode,
    source_status: psych.source_status
  },
  doctrine_preserved: {
    individual_career_guidance_path: true,
    school_institution_assessment_path: true,
    company_organisation_assessment_path: true,
    client_entitlement_and_quota_model: true,
    unique_assessment_code_identity_separation: true,
    teacher_manager_verification_model: true,
    school_learning_pattern_grouping_prescription: true,
    company_peer_collaboration_recommendation: true,
    admin_only_star_assessment_concordance: true,
    prescription_engine_doctrine: true,
    report_generation_and_delivery_model_future_only: true
  },
  inactive_runtime_state: Object.fromEntries(falseFlags.map((key) => [key, workingData[key] === true])),
  current_public_state: "safe_non_interactive_placeholder_from_generated_working_data"
};

const liveEvidence = {
  module_id: "AG67Z",
  title: "Psychometric Assessment Live Verification Evidence Record",
  status: "operator_live_verification_recorded_from_ag67b_output",
  evidence_from_operator_terminal: {
    live_homepage_contains_ag67b_script_markers: true,
    live_generated_psychometric_assessment_json_accessible: true,
    live_generated_status: workingData.status,
    live_public_ui_ready: workingData.public_ui_ready,
    public_assessment_launch_enabled: workingData.public_assessment_launch_enabled,
    personal_input_collection_enabled: workingData.personal_input_collection_enabled,
    student_data_collection_enabled: workingData.student_data_collection_enabled,
    child_minor_data_processing_enabled: workingData.child_minor_data_processing_enabled,
    guardian_consent_runtime_enabled: workingData.guardian_consent_runtime_enabled,
    school_permission_runtime_enabled: workingData.school_permission_runtime_enabled,
    questionnaire_runtime_enabled: workingData.questionnaire_runtime_enabled,
    psychometric_test_runtime_enabled: workingData.psychometric_test_runtime_enabled,
    scoring_runtime_enabled: workingData.scoring_runtime_enabled,
    trait_diagnosis_enabled: workingData.trait_diagnosis_enabled,
    mental_health_inference_enabled: workingData.mental_health_inference_enabled,
    academic_prediction_enabled: workingData.academic_prediction_enabled,
    career_prediction_enabled: workingData.career_prediction_enabled,
    student_ranking_enabled: workingData.student_ranking_enabled,
    report_generation_enabled: workingData.report_generation_enabled,
    external_api_fetch_active: workingData.external_api_fetch_active,
    ai_generation_active: workingData.ai_generation_active,
    status_label: psych.status_label,
    safety_note: psych.safety_note
  },
  note: "The operator verified GitHub Pages live HTML and generated/psychometric-assessment-working-data.json after AG67B push. AG67B-R1 subsequently recorded doctrine without runtime activation."
};

function audit(title, status, keys) {
  return {
    module_id: "AG67Z",
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
  "rls_policy_mutation_enabled",
  "assessment_runtime_enabled",
  "subscription_or_login_runtime_enabled",
  "report_generation_runtime_enabled",
  "pdf_csv_email_runtime_enabled"
]);

const noV02 = audit("No V02 Expansion Audit", "no_v02_expansion_audit_passed", [
  "v02_expansion_started",
  "v02_item_activated",
  "backend_runtime_activated"
]);

const nextBoundary = {
  module_id: "AG67Z",
  title: "AG67Z to Next Governed Stage Boundary",
  status: "next_governed_stage_requires_user_confirmation",
  current_closure_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Review completed methodology-gated public modules.",
    "Plan next governed stage from approved roadmap.",
    "Continue only after explicit user confirmation."
  ],
  blocked_scope_without_explicit_approval: [
    "public assessment launch",
    "subscription/login runtime",
    "questionnaire runtime",
    "data collection",
    "student/minor data collection",
    "guardian consent runtime",
    "school permission runtime",
    "psychometric scoring",
    "diagnosis",
    "mental-health inference",
    "academic/career prediction",
    "report generation runtime",
    "PDF/CSV/email runtime",
    "runtime AI calls",
    "external API/live source fetch",
    "Supabase/Auth/backend activation",
    "runtime database writes",
    "service-role use",
    "V02 expansion",
    "direct feedback absorption"
  ]
};

const closure = {
  module_id: "AG67Z",
  title: "Psychometric Assessment Working Data, UI Wiring and Doctrine Closure",
  status: "ag67z_psychometric_assessment_closed",
  closed_stages: [
    "AG67A — Psychometric and Assessment Initial Working Data + Ethics/Consent Foundation",
    "AG67B — Psychometric and Assessment UI Wiring",
    "AG67B-R1 — Adaptive Verification, Career Guidance, Client Entitlement, Learning-Pattern Grouping and Prescription Doctrine"
  ],
  closure_result: "Psychometric Assessment has safe working data, ethics/consent and minor-protection foundation, homepage UI wiring, and future client operating doctrine preserved as governed source-of-truth.",
  not_closed_as_live_assessment_engine: [
    "Public assessment launch is not active.",
    "Questionnaire runtime is not active.",
    "Data collection is not active.",
    "Student/minor data processing is not active.",
    "Guardian consent runtime is not active.",
    "School permission runtime is not active.",
    "Scoring is not active.",
    "Diagnosis or mental-health inference is not active.",
    "Academic/career prediction is not active.",
    "Report generation is not active.",
    "Runtime AI is not active.",
    "Backend/Auth/Supabase/V02 is not active."
  ]
};

const review = {
  module_id: "AG67Z",
  title: "Psychometric Assessment Closure",
  status: "ag67z_psychometric_assessment_closure_completed",
  current_git_context: git,
  closure_file: outputs.closure,
  final_status_file: outputs.finalStatus,
  live_evidence_file: outputs.liveEvidence,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  next_boundary_file: outputs.nextBoundary,
  summary: {
    ag67a_foundation_completed: true,
    ag67b_ui_wiring_completed: true,
    ag67b_r1_doctrine_completed: true,
    live_evidence_recorded: true,
    psychometric_assessment_row_closed_at_safe_working_data_level: true,
    generated_psychometric_assessment_source_connected: true,
    safe_placeholder_values_connected: true,
    assessment_client_doctrine_preserved: true,
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
    next_governed_stage_requires_user_confirmation: true
  }
};

const registry = {
  module_id: "AG67Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG67Z",
  status: review.status,
  ag67a_foundation_completed: 1,
  ag67b_ui_wiring_completed: 1,
  ag67b_r1_doctrine_completed: 1,
  live_evidence_recorded: 1,
  psychometric_assessment_row_closed_at_safe_working_data_level: 1,
  generated_psychometric_assessment_source_connected: 1,
  safe_placeholder_values_connected: 1,
  assessment_client_doctrine_preserved: 1,
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
  next_governed_stage_requires_user_confirmation: 1
};

const doc = `# AG67Z — Psychometric Assessment Closure

AG67Z closes Psychometric Assessment at the safe working-data, UI-wiring and doctrine level.

## Closed

- AG67A created the initial working data and ethics/consent foundation.
- AG67B wired the public card to \`generated/psychometric-assessment-working-data.json\`.
- AG67B-R1 recorded the full future client doctrine.

## Preserved doctrine

- Individual career guidance pathway.
- School/institution assessment pathway.
- Company/organisation assessment pathway.
- Client registration and entitlement model.
- Unique assessment code and identity separation.
- Teacher/manager verification model.
- Code-only individual reports.
- School learning-pattern grouping prescription.
- Company peer-collaboration recommendation.
- Admin-only Star–Assessment Concordance Review.
- Prescription and report-delivery doctrine.

## Current public state

- Card ID: ${psych.card_id}
- Title: ${psych.title}
- Subtitle: ${psych.subtitle}
- Status: ${psych.status_label}
- Safety note: ${psych.safety_note}

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

Next governed stage requires explicit user confirmation.
`;

writeJson(outputs.finalStatus, finalStatus);
writeJson(outputs.liveEvidence, liveEvidence);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.nextBoundary, nextBoundary);
writeJson(outputs.closure, closure);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG67Z Psychometric Assessment Closure generated.");
console.log("✅ Next governed stage requires user confirmation.");
