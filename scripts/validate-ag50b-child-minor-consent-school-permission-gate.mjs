import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG50B validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag50a-assessment-psychometric-product-layer-entry.json",
  "data/content-intelligence/assessment-psychometrics/ag50a-class5-onward-assessment-doctrine.json",
  "data/content-intelligence/assessment-psychometrics/ag50a-age-adaptive-band-model.json",
  "data/content-intelligence/assessment-psychometrics/ag50a-multi-agent-assessment-architecture.json",
  "data/content-intelligence/assessment-psychometrics/ag50a-methodology-and-validation-approach.json",
  "data/content-intelligence/assessment-psychometrics/ag50a-child-minor-data-blocker.json",
  "data/content-intelligence/assessment-psychometrics/ag50a-non-diagnostic-non-deterministic-boundary.json",
  "data/content-intelligence/backend-architecture/ag50a-no-student-data-collection-audit.json",
  "data/content-intelligence/backend-architecture/ag50a-no-assessment-runtime-scoring-audit.json",
  "data/content-intelligence/backend-architecture/ag50a-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/quality-registry/ag50a-ag50b-child-minor-consent-school-permission-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag50a-to-ag50b-child-minor-consent-school-permission-boundary.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag50b-child-minor-consent-school-permission-gate.json",
  "data/content-intelligence/assessment-psychometrics/ag50b-guardian-consent-gate-record.json",
  "data/content-intelligence/assessment-psychometrics/ag50b-school-permission-gate-record.json",
  "data/content-intelligence/assessment-psychometrics/ag50b-child-minor-data-protection-boundary.json",
  "data/content-intelligence/assessment-psychometrics/ag50b-parent-school-human-review-boundary.json",
  "data/content-intelligence/assessment-psychometrics/ag50b-no-collection-default-state-register.json",
  "data/content-intelligence/assessment-psychometrics/ag50b-assessment-risk-escalation-boundary.json",
  "data/content-intelligence/backend-architecture/ag50b-no-child-minor-data-collection-audit.json",
  "data/content-intelligence/backend-architecture/ag50b-no-consent-runtime-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag50b-no-assessment-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag50b-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/quality-registry/ag50b-ag50c-age-adaptive-psychometric-workflow-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag50b-to-ag50c-age-adaptive-psychometric-workflow-boundary.json",
  "data/quality/ag50b-child-minor-consent-school-permission-gate.json",
  "data/quality/ag50b-child-minor-consent-school-permission-gate-preview.json",
  "docs/quality/AG50B_CHILD_MINOR_CONSENT_SCHOOL_PERMISSION_GATE.md",
  "scripts/generate-ag50b-child-minor-consent-school-permission-gate.mjs",
  "scripts/validate-ag50b-child-minor-consent-school-permission-gate.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag50aReview = readJson("data/content-intelligence/quality-reviews/ag50a-assessment-psychometric-product-layer-entry.json");
const ag50aDoctrine = readJson("data/content-intelligence/assessment-psychometrics/ag50a-class5-onward-assessment-doctrine.json");
const ag50aNoStudentData = readJson("data/content-intelligence/backend-architecture/ag50a-no-student-data-collection-audit.json");
const ag50aNoRuntimeScoring = readJson("data/content-intelligence/backend-architecture/ag50a-no-assessment-runtime-scoring-audit.json");
const ag50aNoRuntimeApi = readJson("data/content-intelligence/backend-architecture/ag50a-no-runtime-api-deployment-audit.json");
const ag50aReadiness = readJson("data/content-intelligence/quality-registry/ag50a-ag50b-child-minor-consent-school-permission-readiness-record.json");
const ag50aBoundary = readJson("data/content-intelligence/mutation-plans/ag50a-to-ag50b-child-minor-consent-school-permission-boundary.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag50aReview.status !== "assessment_psychometric_product_layer_entry_ready_for_ag50b") fail("AG50A review status mismatch.");
if (ag50aDoctrine.assessment_start_point.minimum_class_for_future_psychometric_layer !== "Class 5") fail("AG50A Class 5 doctrine missing.");
if (ag50aNoStudentData.audit_passed !== true) fail("AG50A no-student-data audit must pass.");
if (ag50aNoRuntimeScoring.audit_passed !== true) fail("AG50A no-runtime-scoring audit must pass.");
if (ag50aNoRuntimeApi.audit_passed !== true) fail("AG50A no-runtime/API audit must pass.");
if (ag50aReadiness.ready_for_ag50b !== true) fail("AG50A readiness must permit AG50B.");
if (ag50aBoundary.next_stage_id !== "AG50B") fail("AG50A boundary must point to AG50B.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag50b-child-minor-consent-school-permission-gate.json");
const guardianConsentGate = readJson("data/content-intelligence/assessment-psychometrics/ag50b-guardian-consent-gate-record.json");
const schoolPermissionGate = readJson("data/content-intelligence/assessment-psychometrics/ag50b-school-permission-gate-record.json");
const childMinorProtectionBoundary = readJson("data/content-intelligence/assessment-psychometrics/ag50b-child-minor-data-protection-boundary.json");
const humanReviewBoundary = readJson("data/content-intelligence/assessment-psychometrics/ag50b-parent-school-human-review-boundary.json");
const noCollectionDefaultState = readJson("data/content-intelligence/assessment-psychometrics/ag50b-no-collection-default-state-register.json");
const riskEscalationBoundary = readJson("data/content-intelligence/assessment-psychometrics/ag50b-assessment-risk-escalation-boundary.json");
const noChildMinorDataAudit = readJson("data/content-intelligence/backend-architecture/ag50b-no-child-minor-data-collection-audit.json");
const noConsentRuntimeAudit = readJson("data/content-intelligence/backend-architecture/ag50b-no-consent-runtime-activation-audit.json");
const noAssessmentRuntimeAudit = readJson("data/content-intelligence/backend-architecture/ag50b-no-assessment-runtime-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag50b-no-runtime-api-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag50b-ag50c-age-adaptive-psychometric-workflow-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag50b-to-ag50c-age-adaptive-psychometric-workflow-boundary.json");
const preview = readJson("data/quality/ag50b-child-minor-consent-school-permission-gate-preview.json");
const pkg = readJson("package.json");

if (review.status !== "child_minor_consent_school_permission_gate_ready_for_ag50c") fail("AG50B review status mismatch.");

for (const key of [
  "ag50b_child_minor_consent_school_permission_gate_recorded",
  "ag50a_consumed",
  "guardian_consent_gate_recorded",
  "school_permission_gate_recorded",
  "child_minor_data_protection_boundary_recorded",
  "parent_school_human_review_boundary_recorded",
  "no_collection_default_state_recorded",
  "assessment_risk_escalation_boundary_recorded",
  "ready_for_ag50c_age_adaptive_psychometric_workflow_design"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag50c !== 0) fail("AG50C blocker count must be zero.");

for (const key of [
  "student_data_collection_enabled",
  "child_minor_profile_creation_enabled",
  "guardian_consent_runtime_enabled",
  "guardian_consent_collection_enabled",
  "school_permission_runtime_enabled",
  "school_permission_collection_enabled",
  "psychometric_test_runtime_enabled",
  "assessment_runtime_scoring_enabled",
  "academic_result_upload_enabled",
  "teacher_observation_upload_enabled",
  "model_output_correlation_runtime_enabled",
  "ai_generated_student_report_enabled",
  "diagnosis_enabled",
  "deterministic_career_prediction_enabled",
  "student_ranking_enabled",
  "child_minor_data_collection_enabled",
  "psychometric_data_collection_enabled",
  "behavioural_signal_collection_enabled",
  "auth_activation_approved_now",
  "auth_activation_performed",
  "user_account_creation_enabled",
  "profile_creation_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_content_generated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (guardianConsentGate.status !== "guardian_consent_gate_recorded") fail("Guardian consent gate status mismatch.");
if (guardianConsentGate.consent_runtime_enabled_now !== false) fail("Guardian consent runtime must remain disabled.");
if (!guardianConsentGate.future_consent_requirements.includes("guardian opt-in before student participation")) fail("Guardian opt-in requirement missing.");

if (schoolPermissionGate.status !== "school_permission_gate_recorded") fail("School permission gate status mismatch.");
if (schoolPermissionGate.school_permission_runtime_enabled_now !== false) fail("School permission runtime must remain disabled.");
if (!schoolPermissionGate.future_school_permission_requirements.includes("no ranking/no selection use")) fail("No ranking/no selection school rule missing.");

if (childMinorProtectionBoundary.status !== "child_minor_data_protection_boundary_recorded") fail("Child/minor protection boundary status mismatch.");
for (const field of ["student identity", "academic result", "psychometric response", "child/minor profile"]) {
  if (!childMinorProtectionBoundary.protected_categories_blocked_now.includes(field)) fail(`Child/minor protected category missing: ${field}`);
}

if (humanReviewBoundary.status !== "parent_school_human_review_boundary_recorded") fail("Human review boundary status mismatch.");
if (humanReviewBoundary.human_review_required_for_future_outputs !== true) fail("Human review must be required.");
if (!humanReviewBoundary.review_rules.includes("AI output is a support signal, not a final judgement.")) fail("Support-signal review rule missing.");

if (noCollectionDefaultState.status !== "no_collection_default_state_recorded") fail("No-collection default state status mismatch.");
for (const [key, value] of Object.entries(noCollectionDefaultState.default_states)) {
  if (value !== false) fail(`No-collection default ${key} must be false.`);
}

if (riskEscalationBoundary.status !== "assessment_risk_escalation_boundary_recorded") fail("Risk escalation boundary status mismatch.");
if (!riskEscalationBoundary.future_flag_categories_for_human_review.includes("attempted deterministic career prediction")) fail("Career prediction escalation flag missing.");

if (noChildMinorDataAudit.audit_passed !== true) fail("No child/minor data audit must pass.");
if (noChildMinorDataAudit.failed_checks.length !== 0) fail("No child/minor data failed checks must be zero.");

if (noConsentRuntimeAudit.audit_passed !== true) fail("No consent runtime audit must pass.");
if (noConsentRuntimeAudit.failed_checks.length !== 0) fail("No consent runtime failed checks must be zero.");

if (noAssessmentRuntimeAudit.audit_passed !== true) fail("No assessment runtime audit must pass.");
if (noAssessmentRuntimeAudit.failed_checks.length !== 0) fail("No assessment runtime failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (readiness.status !== "ready_for_ag50c_age_adaptive_psychometric_workflow_design") fail("AG50C readiness status mismatch.");
if (readiness.ready_for_ag50c !== true) fail("AG50C readiness must be true.");
if (readiness.next_stage_id !== "AG50C") fail("Readiness must point to AG50C.");
if (!readiness.ag50c_allowed_scope.includes("Define Class 5–7 workflow design.")) fail("AG50C Class 5-7 workflow scope missing.");
if (!readiness.ag50c_blocked_scope.includes("Psychometric test runtime")) fail("AG50C must block psychometric runtime.");

if (boundary.next_stage_id !== "AG50C") fail("Boundary must point to AG50C.");

for (const key of [
  "ag50b_child_minor_consent_school_permission_gate_recorded",
  "ag50a_consumed",
  "guardian_consent_gate_recorded",
  "school_permission_gate_recorded",
  "child_minor_data_protection_boundary_recorded",
  "parent_school_human_review_boundary_recorded",
  "no_collection_default_state_recorded",
  "assessment_risk_escalation_boundary_recorded",
  "ready_for_ag50c_age_adaptive_psychometric_workflow_design"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "student_data_collection_enabled",
  "child_minor_profile_creation_enabled",
  "guardian_consent_runtime_enabled",
  "guardian_consent_collection_enabled",
  "school_permission_runtime_enabled",
  "school_permission_collection_enabled",
  "psychometric_test_runtime_enabled",
  "assessment_runtime_scoring_enabled",
  "academic_result_upload_enabled",
  "teacher_observation_upload_enabled",
  "model_output_correlation_runtime_enabled",
  "ai_generated_student_report_enabled",
  "diagnosis_enabled",
  "deterministic_career_prediction_enabled",
  "student_ranking_enabled",
  "child_minor_data_collection_enabled",
  "psychometric_data_collection_enabled",
  "behavioural_signal_collection_enabled",
  "auth_activation_approved_now",
  "auth_activation_performed",
  "user_account_creation_enabled",
  "profile_creation_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_content_generated"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag50b"]) fail("Missing package script: generate:ag50b");
if (!pkg.scripts?.["validate:ag50b"]) fail("Missing package script: validate:ag50b");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag50b")) fail("validate:project must include validate:ag50b.");

pass("AG50B Child/Minor Consent and School Permission Gate is present.");
pass("AG50A inputs are consumed.");
pass("Guardian consent gate is valid.");
pass("School permission gate is valid.");
pass("Child/minor data protection boundary is valid.");
pass("Parent/school human review boundary is valid.");
pass("No-collection default state is valid.");
pass("Assessment risk escalation boundary is valid.");
pass("No child/minor data collection audit is valid.");
pass("No consent runtime activation audit is valid.");
pass("No assessment runtime audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("AG50C age-adaptive psychometric workflow readiness is valid.");
