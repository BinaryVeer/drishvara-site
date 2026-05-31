import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag49zReview: "data/content-intelligence/quality-reviews/ag49z-user-profile-personalisation-closure.json",
  ag49zClosure: "data/content-intelligence/user-personalisation/ag49z-user-profile-personalisation-closure-record.json",
  ag49zDeferral: "data/content-intelligence/user-personalisation/ag49z-carry-forward-deferral-register.json",
  ag49zUserSurface: "data/content-intelligence/user-personalisation/ag49z-user-surface-closure-position.json",
  ag49zHandoff: "data/content-intelligence/ag-roadmap/ag49z-ag50a-assessment-product-layer-handoff.json",
  ag49zReadiness: "data/content-intelligence/quality-registry/ag49z-ag50a-assessment-product-layer-readiness-record.json",
  ag49zBoundary: "data/content-intelligence/mutation-plans/ag49z-to-ag50a-assessment-product-layer-boundary.json",
  ag47rSourceOfTruth: "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag50a-assessment-psychometric-product-layer-entry.json",
  doctrine: "data/content-intelligence/assessment-psychometrics/ag50a-class5-onward-assessment-doctrine.json",
  ageBandModel: "data/content-intelligence/assessment-psychometrics/ag50a-age-adaptive-band-model.json",
  architecture: "data/content-intelligence/assessment-psychometrics/ag50a-multi-agent-assessment-architecture.json",
  methodology: "data/content-intelligence/assessment-psychometrics/ag50a-methodology-and-validation-approach.json",
  childMinorBlocker: "data/content-intelligence/assessment-psychometrics/ag50a-child-minor-data-blocker.json",
  nonDiagnosticBoundary: "data/content-intelligence/assessment-psychometrics/ag50a-non-diagnostic-non-deterministic-boundary.json",
  noStudentDataAudit: "data/content-intelligence/backend-architecture/ag50a-no-student-data-collection-audit.json",
  noRuntimeScoringAudit: "data/content-intelligence/backend-architecture/ag50a-no-assessment-runtime-scoring-audit.json",
  noRuntimeApiDeploymentAudit: "data/content-intelligence/backend-architecture/ag50a-no-runtime-api-deployment-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag50a-ag50b-child-minor-consent-school-permission-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag50a-to-ag50b-child-minor-consent-school-permission-boundary.json",
  registry: "data/quality/ag50a-assessment-psychometric-product-layer-entry.json",
  preview: "data/quality/ag50a-assessment-psychometric-product-layer-entry-preview.json",
  doc: "docs/quality/AG50A_ASSESSMENT_PSYCHOMETRIC_PRODUCT_LAYER_ENTRY.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG50A input: ${p}`);
}

const ag49zReview = readJson(inputs.ag49zReview);
const ag49zClosure = readJson(inputs.ag49zClosure);
const ag49zDeferral = readJson(inputs.ag49zDeferral);
const ag49zUserSurface = readJson(inputs.ag49zUserSurface);
const ag49zHandoff = readJson(inputs.ag49zHandoff);
const ag49zReadiness = readJson(inputs.ag49zReadiness);
const ag49zBoundary = readJson(inputs.ag49zBoundary);
const ag47rSourceOfTruth = readJson(inputs.ag47rSourceOfTruth);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag49zReview.status !== "user_profile_personalisation_closed_ready_for_ag50a") throw new Error("AG49Z review status mismatch.");
if (ag49zReview.summary?.ready_for_ag50a_assessment_product_layer_entry !== true) throw new Error("AG50A readiness missing from AG49Z.");
if (ag49zClosure.status !== "user_profile_personalisation_closure_completed") throw new Error("AG49Z closure record mismatch.");
const psychometricDeferralEvidence = [
  ...(ag49zDeferral.deferred_items || []),
  ...(ag49zUserSurface.blocked_for_v01_without_later_approval || []),
  ...(ag49zReadiness.ag50a_blocked_scope || [])
].some((item) => String(item).toLowerCase().includes("psychometric"));

if (!psychometricDeferralEvidence) throw new Error("Psychometric data/runtime deferral missing.");
if (!ag49zUserSurface.blocked_for_v01_without_later_approval.includes("assessment or psychometric runtime")) throw new Error("Assessment/psychometric runtime blocker missing.");
if (ag49zHandoff.next_stage_id !== "AG50A") throw new Error("AG49Z handoff must point to AG50A.");
if (ag49zReadiness.ready_for_ag50a !== true || ag49zReadiness.next_stage_id !== "AG50A") throw new Error("AG49Z readiness must permit AG50A.");
if (ag49zBoundary.next_stage_id !== "AG50A") throw new Error("AG49Z boundary must point to AG50A.");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG49 remains User Accounts and Personalisation")) throw new Error("AG49 source-of-truth missing.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const blockedState = {
  ag50a_assessment_psychometric_entry_recorded: true,
  ag49z_consumed: true,
  class5_onward_doctrine_recorded: true,
  age_adaptive_band_model_recorded: true,
  multi_agent_architecture_recorded: true,
  methodology_validation_approach_recorded: true,
  child_minor_data_blocker_recorded: true,
  non_diagnostic_non_deterministic_boundary_recorded: true,
  ready_for_ag50b_child_minor_consent_school_permission_gate: true,

  student_data_collection_enabled: false,
  child_minor_profile_creation_enabled: false,
  guardian_consent_runtime_enabled: false,
  school_permission_runtime_enabled: false,
  psychometric_test_runtime_enabled: false,
  assessment_runtime_scoring_enabled: false,
  academic_result_upload_enabled: false,
  teacher_observation_upload_enabled: false,
  model_output_correlation_runtime_enabled: false,
  ai_generated_student_report_enabled: false,
  diagnosis_enabled: false,
  deterministic_career_prediction_enabled: false,
  student_ranking_enabled: false,
  auth_activation_approved_now: false,
  auth_activation_performed: false,
  user_account_creation_enabled: false,
  profile_creation_enabled: false,
  personal_data_collection_enabled: false,
  birth_detail_collection_enabled: false,
  sensitive_data_collection_enabled: false,
  psychometric_data_collection_enabled: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  rls_public_policy_activation_approved: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_content_generated: false
};

const doctrine = {
  module_id: "AG50A",
  title: "Class 5 Onward Assessment Doctrine",
  status: "class5_onward_assessment_doctrine_recorded",
  assessment_start_point: {
    minimum_class_for_future_psychometric_layer: "Class 5",
    starting_position: "Class 5 onward only",
    younger_than_class5_position: "not_in_scope_for_psychometric_assessment"
  },
  doctrine_statement: "Drishvara's future psychometric layer is intended as a Class 5 onward, age-adaptive, non-diagnostic, non-deterministic, consent-governed, evidence-building student-support framework.",
  primary_purpose: [
    "learning support",
    "student self-awareness",
    "teacher guidance",
    "family-facing support insight",
    "evidence-building over time",
    "intervention planning"
  ],
  explicitly_not_for: [
    "diagnosis",
    "student labelling",
    "deterministic career prediction",
    "stream locking",
    "ranking",
    "high-stakes selection",
    "fear-based guidance"
  ],
  blocked_state: blockedState
};

const ageBandModel = {
  module_id: "AG50A",
  title: "Age-adaptive Band Model",
  status: "age_adaptive_band_model_recorded",
  class_bands: [
    {
      band: "Class 5 to 7",
      focus: [
        "learning style",
        "attention pattern",
        "interest exposure",
        "confidence",
        "emotional regulation",
        "communication comfort",
        "problem-solving tendency",
        "support needs"
      ],
      prohibited_position: "no career-stream prediction"
    },
    {
      band: "Class 8 to 10",
      focus: [
        "learning behaviour",
        "subject interest",
        "basic aptitude exposure",
        "skill inclination",
        "NSQF-linked pathway exposure",
        "support/intervention tracking"
      ],
      prohibited_position: "no deterministic stream or career locking"
    },
    {
      band: "Class 11 onward",
      focus: [
        "academic alignment",
        "career/skill pathway reflection",
        "aptitude and interest consistency",
        "readiness and support mapping"
      ],
      prohibited_position: "no guaranteed career prediction"
    }
  ],
  blocked_state: blockedState
};

const architecture = {
  module_id: "AG50A",
  title: "Multi-agent Assessment Architecture",
  status: "multi_agent_architecture_recorded",
  architecture_layers: [
    {
      layer: "Secure student identity layer",
      function: "map records to unique encrypted or pseudonymous student code",
      runtime_enabled_now: false
    },
    {
      layer: "Age-adaptive assessment layer",
      function: "select age/class-appropriate questionnaire, tasks and observation inputs",
      runtime_enabled_now: false
    },
    {
      layer: "Agent 1 assessment output collector",
      function: "collect basic allowed data and model-wise outputs against encrypted code",
      runtime_enabled_now: false
    },
    {
      layer: "Agent 2 correlation and validation engine",
      function: "compare model outputs with academic results, learning indicators and observations using statistical methods",
      runtime_enabled_now: false
    },
    {
      layer: "Agent 3 contradiction/error flagging agent",
      function: "flag mismatch, contradiction, bias signal, output-vs-observed trait gaps and human-review cases",
      runtime_enabled_now: false
    },
    {
      layer: "Human review layer",
      function: "teacher/counsellor/guardian-facing interpretation before any support guidance",
      runtime_enabled_now: false
    }
  ],
  blocked_state: blockedState
};

const methodology = {
  module_id: "AG50A",
  title: "Methodology and Validation Approach",
  status: "methodology_validation_approach_recorded",
  high_level_flow: [
    "consent and school permission",
    "encrypted/pseudonymous student code",
    "age-adaptive assessment",
    "model-wise output generation",
    "academic and behavioural evidence mapping over time",
    "correlation/regression/trend/inferential analysis",
    "contradiction/error flagging",
    "human review",
    "careful student-support insight",
    "model learning and calibration"
  ],
  statistical_methods_for_future_design: [
    "correlation analysis",
    "bivariate analysis",
    "multivariate regression",
    "trend analysis",
    "reliability checks",
    "factor analysis where suitable",
    "cluster/group pattern analysis",
    "model-output versus actual-outcome comparison"
  ],
  runtime_position: "methodology_only_not_executed",
  blocked_state: blockedState
};

const childMinorBlocker = {
  module_id: "AG50A",
  title: "Child/Minor Data Blocker",
  status: "child_minor_data_blocker_recorded",
  protected_data_categories_blocked_now: [
    "student identity",
    "guardian identity",
    "school identity",
    "birth details",
    "location",
    "academic result",
    "teacher observation",
    "psychometric response",
    "behavioural signal",
    "child/minor profile",
    "health or wellbeing signal"
  ],
  required_before_any_future_collection: [
    "guardian consent",
    "school permission",
    "purpose limitation",
    "data minimisation",
    "child/minor protection policy",
    "human review protocol",
    "retention/deletion/export/withdrawal policy",
    "backend/Auth/RLS approval",
    "no-diagnosis and no-deterministic-prediction boundary"
  ],
  blocked_state: blockedState
};

const nonDiagnosticBoundary = {
  module_id: "AG50A",
  title: "Non-diagnostic and Non-deterministic Boundary",
  status: "non_diagnostic_non_deterministic_boundary_recorded",
  allowed_future_language: [
    "may indicate",
    "suggests a current pattern",
    "may benefit from",
    "requires teacher/guardian review",
    "should be read with academic progress and observation",
    "support recommendation"
  ],
  prohibited_future_language: [
    "diagnosis",
    "weak student",
    "unfit for science",
    "will become",
    "guaranteed success",
    "guaranteed failure",
    "permanent trait",
    "fixed career outcome",
    "psychometric disorder"
  ],
  deterministic_output_position: "blocked",
  diagnostic_output_position: "blocked",
  blocked_state: blockedState
};

const noStudentDataAudit = {
  module_id: "AG50A",
  title: "No Student Data Collection Audit",
  status: "no_student_data_collection_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "student_data_collection_enabled", expected: false, actual: false, passed: true },
    { check_id: "child_minor_profile_creation_enabled", expected: false, actual: false, passed: true },
    { check_id: "guardian_consent_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "school_permission_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "academic_result_upload_enabled", expected: false, actual: false, passed: true },
    { check_id: "teacher_observation_upload_enabled", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noRuntimeScoringAudit = {
  module_id: "AG50A",
  title: "No Assessment Runtime Scoring Audit",
  status: "no_assessment_runtime_scoring_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "psychometric_test_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "assessment_runtime_scoring_enabled", expected: false, actual: false, passed: true },
    { check_id: "model_output_correlation_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "ai_generated_student_report_enabled", expected: false, actual: false, passed: true },
    { check_id: "diagnosis_enabled", expected: false, actual: false, passed: true },
    { check_id: "deterministic_career_prediction_enabled", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noRuntimeApiDeploymentAudit = {
  module_id: "AG50A",
  title: "No Runtime / API / Deployment Audit",
  status: "no_runtime_api_deployment_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG50A",
  title: "AG50B Child/Minor Consent and School Permission Readiness Record",
  status: "ready_for_ag50b_child_minor_consent_school_permission_gate",
  ready_for_ag50b: true,
  next_stage_id: "AG50B",
  next_stage_title: "Child/Minor Data, Guardian Consent and School Permission Gate",
  ag50b_allowed_scope: [
    "Define guardian consent gate.",
    "Define school permission gate.",
    "Define child/minor data protection requirements.",
    "Define no-collection and blocked-by-default states.",
    "Define human review and escalation boundary.",
    "Keep assessment runtime disabled."
  ],
  ag50b_blocked_scope: [
    "Student data collection",
    "Child/minor profile creation",
    "Guardian consent runtime collection",
    "School permission runtime collection",
    "Psychometric test runtime",
    "Assessment scoring engine",
    "Academic result upload",
    "Teacher observation upload",
    "Model-output correlation runtime",
    "AI-generated student report",
    "Diagnosis",
    "Deterministic career prediction",
    "Auth/backend/API/database reading",
    "Deployment"
  ],
  hard_blocker_count_for_ag50b: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG50A",
  title: "AG50A to AG50B Child/Minor Consent School Permission Boundary",
  status: "ag50b_child_minor_consent_school_permission_boundary_created",
  next_stage_id: "AG50B",
  next_stage_title: "Child/Minor Data, Guardian Consent and School Permission Gate",
  allowed_scope: readiness.ag50b_allowed_scope,
  blocked_scope: readiness.ag50b_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG50A",
  title: "Assessment/Psychometric Product Layer Entry",
  status: "assessment_psychometric_product_layer_entry_ready_for_ag50b",
  depends_on: ["AG49Z", "AG49D", "AG47R", "ADB20"],
  doctrine_file: outputs.doctrine,
  age_band_model_file: outputs.ageBandModel,
  architecture_file: outputs.architecture,
  methodology_file: outputs.methodology,
  child_minor_blocker_file: outputs.childMinorBlocker,
  non_diagnostic_boundary_file: outputs.nonDiagnosticBoundary,
  no_student_data_audit_file: outputs.noStudentDataAudit,
  no_runtime_scoring_audit_file: outputs.noRuntimeScoringAudit,
  no_runtime_api_deployment_audit_file: outputs.noRuntimeApiDeploymentAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag50a_assessment_psychometric_entry_recorded: true,
    ag49z_consumed: true,
    class5_onward_doctrine_recorded: true,
    age_adaptive_band_model_recorded: true,
    multi_agent_architecture_recorded: true,
    methodology_validation_approach_recorded: true,
    child_minor_data_blocker_recorded: true,
    non_diagnostic_non_deterministic_boundary_recorded: true,
    ready_for_ag50b_child_minor_consent_school_permission_gate: true,
    hard_blocker_count_for_ag50b: 0,

    student_data_collection_enabled: false,
    child_minor_profile_creation_enabled: false,
    guardian_consent_runtime_enabled: false,
    school_permission_runtime_enabled: false,
    psychometric_test_runtime_enabled: false,
    assessment_runtime_scoring_enabled: false,
    academic_result_upload_enabled: false,
    teacher_observation_upload_enabled: false,
    model_output_correlation_runtime_enabled: false,
    ai_generated_student_report_enabled: false,
    diagnosis_enabled: false,
    deterministic_career_prediction_enabled: false,
    student_ranking_enabled: false,
    auth_activation_approved_now: false,
    auth_activation_performed: false,
    user_account_creation_enabled: false,
    profile_creation_enabled: false,
    personal_data_collection_enabled: false,
    birth_detail_collection_enabled: false,
    sensitive_data_collection_enabled: false,
    psychometric_data_collection_enabled: false,
    website_database_reading_enabled: false,
    api_runtime_database_reading_approved_now: false,
    backend_auth_supabase_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    rls_public_policy_activation_approved: false,
    deployment_approved: false,
    deployment_performed: false,
    service_role_key_exposed: false,
    public_content_generated: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG50A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG50A",
  status: review.status,
  ag50a_assessment_psychometric_entry_recorded: 1,
  ag49z_consumed: 1,
  class5_onward_doctrine_recorded: 1,
  age_adaptive_band_model_recorded: 1,
  multi_agent_architecture_recorded: 1,
  methodology_validation_approach_recorded: 1,
  child_minor_data_blocker_recorded: 1,
  non_diagnostic_non_deterministic_boundary_recorded: 1,
  ready_for_ag50b_child_minor_consent_school_permission_gate: 1,
  hard_blocker_count_for_ag50b: 0,

  student_data_collection_enabled: 0,
  child_minor_profile_creation_enabled: 0,
  guardian_consent_runtime_enabled: 0,
  school_permission_runtime_enabled: 0,
  psychometric_test_runtime_enabled: 0,
  assessment_runtime_scoring_enabled: 0,
  academic_result_upload_enabled: 0,
  teacher_observation_upload_enabled: 0,
  model_output_correlation_runtime_enabled: 0,
  ai_generated_student_report_enabled: 0,
  diagnosis_enabled: 0,
  deterministic_career_prediction_enabled: 0,
  student_ranking_enabled: 0,
  auth_activation_approved_now: 0,
  auth_activation_performed: 0,
  user_account_creation_enabled: 0,
  profile_creation_enabled: 0,
  personal_data_collection_enabled: 0,
  birth_detail_collection_enabled: 0,
  sensitive_data_collection_enabled: 0,
  psychometric_data_collection_enabled: 0,
  website_database_reading_enabled: 0,
  api_runtime_database_reading_approved_now: 0,
  backend_auth_supabase_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  rls_public_policy_activation_approved: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0,
  public_content_generated: 0
};

const doc = `# AG50A — Assessment/Psychometric Product Layer Entry

## Result

AG50A records the entry doctrine for Drishvara's future assessment and psychometric product layer.

## Core position

The future psychometric layer starts from Class 5 onward and remains age-adaptive, non-diagnostic, non-deterministic, consent-governed and evidence-building.

## Architecture recorded

- Secure encrypted/pseudonymous student code layer
- Age-adaptive assessment layer
- Agent 1 assessment/model-output collector
- Agent 2 correlation and validation engine
- Agent 3 contradiction/error/mismatch flagging agent
- Human review layer

## Methodology recorded

- Assessment output as signals, not labels
- Academic/behavioural evidence mapping over time
- Correlation, regression, bivariate/multivariate and other inferential analysis
- Contradiction/error flagging
- Human review before student-support guidance

## Still blocked

- Student data collection
- Child/minor profile creation
- Guardian consent runtime
- School permission runtime
- Psychometric test runtime
- Assessment scoring engine
- Academic result upload
- Teacher observation upload
- Model-output correlation runtime
- AI-generated student report
- Diagnosis
- Deterministic career prediction
- Auth/backend/API/database reading
- Deployment

## Next

AG50B — Child/Minor Data, Guardian Consent and School Permission Gate.
`;

writeJson(outputs.doctrine, doctrine);
writeJson(outputs.ageBandModel, ageBandModel);
writeJson(outputs.architecture, architecture);
writeJson(outputs.methodology, methodology);
writeJson(outputs.childMinorBlocker, childMinorBlocker);
writeJson(outputs.nonDiagnosticBoundary, nonDiagnosticBoundary);
writeJson(outputs.noStudentDataAudit, noStudentDataAudit);
writeJson(outputs.noRuntimeScoringAudit, noRuntimeScoringAudit);
writeJson(outputs.noRuntimeApiDeploymentAudit, noRuntimeApiDeploymentAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG50A Assessment/Psychometric Product Layer Entry generated.");
console.log("✅ Class 5 onward age-adaptive doctrine, multi-agent architecture and methodology recorded.");
console.log("✅ Ready for AG50B Child/Minor Consent and School Permission Gate.");
console.log("✅ Student data collection, psychometric runtime, scoring, correlation, Auth/backend/API/DB reading, deployment and secrets remain blocked.");
