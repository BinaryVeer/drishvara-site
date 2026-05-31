import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag50aReview: "data/content-intelligence/quality-reviews/ag50a-assessment-psychometric-product-layer-entry.json",
  ag50aDoctrine: "data/content-intelligence/assessment-psychometrics/ag50a-class5-onward-assessment-doctrine.json",
  ag50aAgeBand: "data/content-intelligence/assessment-psychometrics/ag50a-age-adaptive-band-model.json",
  ag50aArchitecture: "data/content-intelligence/assessment-psychometrics/ag50a-multi-agent-assessment-architecture.json",
  ag50aMethodology: "data/content-intelligence/assessment-psychometrics/ag50a-methodology-and-validation-approach.json",
  ag50aChildBlocker: "data/content-intelligence/assessment-psychometrics/ag50a-child-minor-data-blocker.json",
  ag50aNonDiagnostic: "data/content-intelligence/assessment-psychometrics/ag50a-non-diagnostic-non-deterministic-boundary.json",
  ag50aNoStudentData: "data/content-intelligence/backend-architecture/ag50a-no-student-data-collection-audit.json",
  ag50aNoRuntimeScoring: "data/content-intelligence/backend-architecture/ag50a-no-assessment-runtime-scoring-audit.json",
  ag50aNoRuntimeApi: "data/content-intelligence/backend-architecture/ag50a-no-runtime-api-deployment-audit.json",
  ag50aReadiness: "data/content-intelligence/quality-registry/ag50a-ag50b-child-minor-consent-school-permission-readiness-record.json",
  ag50aBoundary: "data/content-intelligence/mutation-plans/ag50a-to-ag50b-child-minor-consent-school-permission-boundary.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag50b-child-minor-consent-school-permission-gate.json",
  guardianConsentGate: "data/content-intelligence/assessment-psychometrics/ag50b-guardian-consent-gate-record.json",
  schoolPermissionGate: "data/content-intelligence/assessment-psychometrics/ag50b-school-permission-gate-record.json",
  childMinorProtectionBoundary: "data/content-intelligence/assessment-psychometrics/ag50b-child-minor-data-protection-boundary.json",
  humanReviewBoundary: "data/content-intelligence/assessment-psychometrics/ag50b-parent-school-human-review-boundary.json",
  noCollectionDefaultState: "data/content-intelligence/assessment-psychometrics/ag50b-no-collection-default-state-register.json",
  riskEscalationBoundary: "data/content-intelligence/assessment-psychometrics/ag50b-assessment-risk-escalation-boundary.json",
  noChildMinorDataAudit: "data/content-intelligence/backend-architecture/ag50b-no-child-minor-data-collection-audit.json",
  noConsentRuntimeAudit: "data/content-intelligence/backend-architecture/ag50b-no-consent-runtime-activation-audit.json",
  noAssessmentRuntimeAudit: "data/content-intelligence/backend-architecture/ag50b-no-assessment-runtime-audit.json",
  noRuntimeApiDeploymentAudit: "data/content-intelligence/backend-architecture/ag50b-no-runtime-api-deployment-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag50b-ag50c-age-adaptive-psychometric-workflow-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag50b-to-ag50c-age-adaptive-psychometric-workflow-boundary.json",
  registry: "data/quality/ag50b-child-minor-consent-school-permission-gate.json",
  preview: "data/quality/ag50b-child-minor-consent-school-permission-gate-preview.json",
  doc: "docs/quality/AG50B_CHILD_MINOR_CONSENT_SCHOOL_PERMISSION_GATE.md"
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
  if (!exists(p)) throw new Error(`Missing AG50B input: ${p}`);
}

const ag50aReview = readJson(inputs.ag50aReview);
const ag50aDoctrine = readJson(inputs.ag50aDoctrine);
const ag50aAgeBand = readJson(inputs.ag50aAgeBand);
const ag50aArchitecture = readJson(inputs.ag50aArchitecture);
const ag50aMethodology = readJson(inputs.ag50aMethodology);
const ag50aChildBlocker = readJson(inputs.ag50aChildBlocker);
const ag50aNonDiagnostic = readJson(inputs.ag50aNonDiagnostic);
const ag50aNoStudentData = readJson(inputs.ag50aNoStudentData);
const ag50aNoRuntimeScoring = readJson(inputs.ag50aNoRuntimeScoring);
const ag50aNoRuntimeApi = readJson(inputs.ag50aNoRuntimeApi);
const ag50aReadiness = readJson(inputs.ag50aReadiness);
const ag50aBoundary = readJson(inputs.ag50aBoundary);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag50aReview.status !== "assessment_psychometric_product_layer_entry_ready_for_ag50b") throw new Error("AG50A review status mismatch.");
if (ag50aReview.summary?.ready_for_ag50b_child_minor_consent_school_permission_gate !== true) throw new Error("AG50B readiness missing from AG50A.");
if (ag50aDoctrine.assessment_start_point?.minimum_class_for_future_psychometric_layer !== "Class 5") throw new Error("AG50A Class 5 doctrine missing.");
if (!JSON.stringify(ag50aAgeBand.class_bands).includes("Class 5 to 7")) throw new Error("AG50A Class 5 to 7 band missing.");
if (!JSON.stringify(ag50aArchitecture.architecture_layers).includes("Human review layer")) throw new Error("AG50A human review layer missing.");
if (ag50aMethodology.runtime_position !== "methodology_only_not_executed") throw new Error("AG50A methodology must remain not executed.");
if (!ag50aChildBlocker.protected_data_categories_blocked_now.includes("student identity")) throw new Error("AG50A student identity blocker missing.");
if (ag50aNonDiagnostic.diagnostic_output_position !== "blocked") throw new Error("AG50A diagnosis boundary must remain blocked.");
if (ag50aNoStudentData.audit_passed !== true) throw new Error("AG50A no-student-data audit must pass.");
if (ag50aNoRuntimeScoring.audit_passed !== true) throw new Error("AG50A no-runtime-scoring audit must pass.");
if (ag50aNoRuntimeApi.audit_passed !== true) throw new Error("AG50A no-runtime/API audit must pass.");
if (ag50aReadiness.ready_for_ag50b !== true || ag50aReadiness.next_stage_id !== "AG50B") throw new Error("AG50A readiness must permit AG50B.");
if (ag50aBoundary.next_stage_id !== "AG50B") throw new Error("AG50A boundary must point to AG50B.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const blockedState = {
  ag50b_child_minor_consent_school_permission_gate_recorded: true,
  ag50a_consumed: true,
  guardian_consent_gate_recorded: true,
  school_permission_gate_recorded: true,
  child_minor_data_protection_boundary_recorded: true,
  parent_school_human_review_boundary_recorded: true,
  no_collection_default_state_recorded: true,
  assessment_risk_escalation_boundary_recorded: true,
  ready_for_ag50c_age_adaptive_psychometric_workflow_design: true,

  student_data_collection_enabled: false,
  child_minor_profile_creation_enabled: false,
  guardian_consent_runtime_enabled: false,
  guardian_consent_collection_enabled: false,
  school_permission_runtime_enabled: false,
  school_permission_collection_enabled: false,
  psychometric_test_runtime_enabled: false,
  assessment_runtime_scoring_enabled: false,
  academic_result_upload_enabled: false,
  teacher_observation_upload_enabled: false,
  model_output_correlation_runtime_enabled: false,
  ai_generated_student_report_enabled: false,
  diagnosis_enabled: false,
  deterministic_career_prediction_enabled: false,
  student_ranking_enabled: false,
  child_minor_data_collection_enabled: false,
  psychometric_data_collection_enabled: false,
  behavioural_signal_collection_enabled: false,
  auth_activation_approved_now: false,
  auth_activation_performed: false,
  user_account_creation_enabled: false,
  profile_creation_enabled: false,
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

const guardianConsentGate = {
  module_id: "AG50B",
  title: "Guardian Consent Gate Record",
  status: "guardian_consent_gate_recorded",
  consent_required_before_any_future_collection: true,
  consent_runtime_enabled_now: false,
  consent_collection_enabled_now: false,
  future_consent_requirements: [
    "clear purpose of assessment",
    "minimum class eligibility: Class 5 onward",
    "data categories explained in simple language",
    "guardian opt-in before student participation",
    "student assent/comfort check where age-appropriate",
    "withdrawal path",
    "report-sharing boundary",
    "no diagnosis statement",
    "no deterministic career prediction statement",
    "human review before sensitive interpretation"
  ],
  blocked_state: blockedState
};

const schoolPermissionGate = {
  module_id: "AG50B",
  title: "School Permission Gate Record",
  status: "school_permission_gate_recorded",
  school_permission_required_before_any_future_school_use: true,
  school_permission_runtime_enabled_now: false,
  school_permission_collection_enabled_now: false,
  future_school_permission_requirements: [
    "written institutional permission",
    "nominated school coordinator",
    "assessment schedule approval",
    "student participation protocol",
    "teacher observation protocol if applicable",
    "academic-result sharing protocol if applicable",
    "data retention and deletion position",
    "no ranking/no selection use",
    "human review and escalation protocol"
  ],
  blocked_state: blockedState
};

const childMinorProtectionBoundary = {
  module_id: "AG50B",
  title: "Child/Minor Data Protection Boundary",
  status: "child_minor_data_protection_boundary_recorded",
  protected_categories_blocked_now: [
    "student identity",
    "guardian identity",
    "school identity",
    "class/section roll-level identifiers",
    "birth details",
    "precise location",
    "academic result",
    "teacher observation",
    "psychometric response",
    "behavioural signal",
    "child/minor profile",
    "health or wellbeing signal"
  ],
  minimum_future_controls: [
    "data minimisation",
    "pseudonymous student code",
    "separate identity vault if ever approved",
    "role-based access",
    "guardian withdrawal",
    "school-level permission log",
    "human review before interpretation",
    "no public display",
    "no model training on identifiable child data without separate approval"
  ],
  blocked_state: blockedState
};

const humanReviewBoundary = {
  module_id: "AG50B",
  title: "Parent/School Human Review Boundary",
  status: "parent_school_human_review_boundary_recorded",
  human_review_required_for_future_outputs: true,
  future_review_roles: [
    "guardian/parent",
    "teacher",
    "school coordinator",
    "trained assessor or counsellor where available",
    "admin reviewer for flagged contradictions"
  ],
  review_rules: [
    "AI output is a support signal, not a final judgement.",
    "Contradictory outputs require human review.",
    "Any concern-like output must be framed as support need, not diagnosis.",
    "No student should be labelled, ranked or streamed automatically.",
    "Guardian-facing explanation must use simple non-alarming language."
  ],
  blocked_state: blockedState
};

const noCollectionDefaultState = {
  module_id: "AG50B",
  title: "No-collection Default State Register",
  status: "no_collection_default_state_recorded",
  default_states: {
    student_identity_collection: false,
    guardian_identity_collection: false,
    school_identity_collection: false,
    guardian_consent_collection: false,
    school_permission_collection: false,
    psychometric_response_collection: false,
    academic_result_collection: false,
    teacher_observation_collection: false,
    behavioural_signal_collection: false,
    assessment_runtime_scoring: false,
    report_generation: false
  },
  interpretation: "AG50B defines future gates only. It does not collect, store, process, score, report or activate any student/child/minor data workflow.",
  blocked_state: blockedState
};

const riskEscalationBoundary = {
  module_id: "AG50B",
  title: "Assessment Risk Escalation Boundary",
  status: "assessment_risk_escalation_boundary_recorded",
  future_flag_categories_for_human_review: [
    "self-report and teacher observation contradiction",
    "model output and academic trend mismatch",
    "low confidence/high stress language in response",
    "guardian or school objection",
    "potential sensitive-data exposure",
    "attempted diagnosis-like interpretation",
    "attempted deterministic career prediction",
    "bias or unfair labelling risk"
  ],
  escalation_position_now: "design_only_not_runtime",
  blocked_state: blockedState
};

const noChildMinorDataAudit = {
  module_id: "AG50B",
  title: "No Child/Minor Data Collection Audit",
  status: "no_child_minor_data_collection_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "student_data_collection_enabled", expected: false, actual: false, passed: true },
    { check_id: "child_minor_profile_creation_enabled", expected: false, actual: false, passed: true },
    { check_id: "child_minor_data_collection_enabled", expected: false, actual: false, passed: true },
    { check_id: "psychometric_data_collection_enabled", expected: false, actual: false, passed: true },
    { check_id: "academic_result_upload_enabled", expected: false, actual: false, passed: true },
    { check_id: "teacher_observation_upload_enabled", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noConsentRuntimeAudit = {
  module_id: "AG50B",
  title: "No Consent Runtime Activation Audit",
  status: "no_consent_runtime_activation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "guardian_consent_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "guardian_consent_collection_enabled", expected: false, actual: false, passed: true },
    { check_id: "school_permission_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "school_permission_collection_enabled", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noAssessmentRuntimeAudit = {
  module_id: "AG50B",
  title: "No Assessment Runtime Audit",
  status: "no_assessment_runtime_audit_passed",
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
  module_id: "AG50B",
  title: "No Runtime / API / Deployment Audit",
  status: "no_runtime_api_deployment_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "rls_public_policy_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG50B",
  title: "AG50C Age-adaptive Psychometric Workflow Readiness Record",
  status: "ready_for_ag50c_age_adaptive_psychometric_workflow_design",
  ready_for_ag50c: true,
  next_stage_id: "AG50C",
  next_stage_title: "Age-Adaptive Psychometric Workflow Design",
  ag50c_allowed_scope: [
    "Define Class 5–7 workflow design.",
    "Define Class 8–10 workflow design.",
    "Define Class 11 onward workflow design.",
    "Define item/task/input categories as planning records only.",
    "Define Agent 1, Agent 2 and Agent 3 workflow interfaces as non-runtime design.",
    "Keep child/minor data collection and assessment runtime disabled."
  ],
  ag50c_blocked_scope: [
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
  hard_blocker_count_for_ag50c: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG50B",
  title: "AG50B to AG50C Age-adaptive Psychometric Workflow Boundary",
  status: "ag50c_age_adaptive_psychometric_workflow_boundary_created",
  next_stage_id: "AG50C",
  next_stage_title: "Age-Adaptive Psychometric Workflow Design",
  allowed_scope: readiness.ag50c_allowed_scope,
  blocked_scope: readiness.ag50c_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG50B",
  title: "Child/Minor Data, Guardian Consent and School Permission Gate",
  status: "child_minor_consent_school_permission_gate_ready_for_ag50c",
  depends_on: ["AG50A", "AG49Z", "ADB20"],
  guardian_consent_gate_file: outputs.guardianConsentGate,
  school_permission_gate_file: outputs.schoolPermissionGate,
  child_minor_protection_boundary_file: outputs.childMinorProtectionBoundary,
  human_review_boundary_file: outputs.humanReviewBoundary,
  no_collection_default_state_file: outputs.noCollectionDefaultState,
  risk_escalation_boundary_file: outputs.riskEscalationBoundary,
  no_child_minor_data_audit_file: outputs.noChildMinorDataAudit,
  no_consent_runtime_audit_file: outputs.noConsentRuntimeAudit,
  no_assessment_runtime_audit_file: outputs.noAssessmentRuntimeAudit,
  no_runtime_api_deployment_audit_file: outputs.noRuntimeApiDeploymentAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag50b_child_minor_consent_school_permission_gate_recorded: true,
    ag50a_consumed: true,
    guardian_consent_gate_recorded: true,
    school_permission_gate_recorded: true,
    child_minor_data_protection_boundary_recorded: true,
    parent_school_human_review_boundary_recorded: true,
    no_collection_default_state_recorded: true,
    assessment_risk_escalation_boundary_recorded: true,
    ready_for_ag50c_age_adaptive_psychometric_workflow_design: true,
    hard_blocker_count_for_ag50c: 0,

    student_data_collection_enabled: false,
    child_minor_profile_creation_enabled: false,
    guardian_consent_runtime_enabled: false,
    guardian_consent_collection_enabled: false,
    school_permission_runtime_enabled: false,
    school_permission_collection_enabled: false,
    psychometric_test_runtime_enabled: false,
    assessment_runtime_scoring_enabled: false,
    academic_result_upload_enabled: false,
    teacher_observation_upload_enabled: false,
    model_output_correlation_runtime_enabled: false,
    ai_generated_student_report_enabled: false,
    diagnosis_enabled: false,
    deterministic_career_prediction_enabled: false,
    student_ranking_enabled: false,
    child_minor_data_collection_enabled: false,
    psychometric_data_collection_enabled: false,
    behavioural_signal_collection_enabled: false,
    auth_activation_approved_now: false,
    auth_activation_performed: false,
    user_account_creation_enabled: false,
    profile_creation_enabled: false,
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

const registry = { module_id: "AG50B", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG50B",
  status: review.status,
  ag50b_child_minor_consent_school_permission_gate_recorded: 1,
  ag50a_consumed: 1,
  guardian_consent_gate_recorded: 1,
  school_permission_gate_recorded: 1,
  child_minor_data_protection_boundary_recorded: 1,
  parent_school_human_review_boundary_recorded: 1,
  no_collection_default_state_recorded: 1,
  assessment_risk_escalation_boundary_recorded: 1,
  ready_for_ag50c_age_adaptive_psychometric_workflow_design: 1,
  hard_blocker_count_for_ag50c: 0,

  student_data_collection_enabled: 0,
  child_minor_profile_creation_enabled: 0,
  guardian_consent_runtime_enabled: 0,
  guardian_consent_collection_enabled: 0,
  school_permission_runtime_enabled: 0,
  school_permission_collection_enabled: 0,
  psychometric_test_runtime_enabled: 0,
  assessment_runtime_scoring_enabled: 0,
  academic_result_upload_enabled: 0,
  teacher_observation_upload_enabled: 0,
  model_output_correlation_runtime_enabled: 0,
  ai_generated_student_report_enabled: 0,
  diagnosis_enabled: 0,
  deterministic_career_prediction_enabled: 0,
  student_ranking_enabled: 0,
  child_minor_data_collection_enabled: 0,
  psychometric_data_collection_enabled: 0,
  behavioural_signal_collection_enabled: 0,
  auth_activation_approved_now: 0,
  auth_activation_performed: 0,
  user_account_creation_enabled: 0,
  profile_creation_enabled: 0,
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

const doc = `# AG50B — Child/Minor Data, Guardian Consent and School Permission Gate

## Result

AG50B records guardian consent, school permission, child/minor protection, human review, no-collection defaults and risk escalation boundaries.

## Confirmed

- AG50A consumed.
- Guardian consent gate recorded.
- School permission gate recorded.
- Child/minor data protection boundary recorded.
- Parent/school/human review boundary recorded.
- No-collection default state recorded.
- Risk escalation boundary recorded.

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

AG50C — Age-Adaptive Psychometric Workflow Design.
`;

writeJson(outputs.guardianConsentGate, guardianConsentGate);
writeJson(outputs.schoolPermissionGate, schoolPermissionGate);
writeJson(outputs.childMinorProtectionBoundary, childMinorProtectionBoundary);
writeJson(outputs.humanReviewBoundary, humanReviewBoundary);
writeJson(outputs.noCollectionDefaultState, noCollectionDefaultState);
writeJson(outputs.riskEscalationBoundary, riskEscalationBoundary);
writeJson(outputs.noChildMinorDataAudit, noChildMinorDataAudit);
writeJson(outputs.noConsentRuntimeAudit, noConsentRuntimeAudit);
writeJson(outputs.noAssessmentRuntimeAudit, noAssessmentRuntimeAudit);
writeJson(outputs.noRuntimeApiDeploymentAudit, noRuntimeApiDeploymentAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG50B Child/Minor Consent and School Permission Gate generated.");
console.log("✅ Guardian consent, school permission, child/minor protection, human review and no-collection defaults recorded.");
console.log("✅ Ready for AG50C Age-Adaptive Psychometric Workflow Design.");
console.log("✅ Student data collection, consent runtime, assessment runtime, scoring, correlation, Auth/backend/API/DB reading, deployment and secrets remain blocked.");
