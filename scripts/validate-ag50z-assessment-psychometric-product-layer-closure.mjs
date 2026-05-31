import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG50Z validation failed: ${message}`);
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

  "data/content-intelligence/quality-reviews/ag50b-child-minor-consent-school-permission-gate.json",
  "data/content-intelligence/assessment-psychometrics/ag50b-guardian-consent-gate-record.json",
  "data/content-intelligence/assessment-psychometrics/ag50b-school-permission-gate-record.json",
  "data/content-intelligence/assessment-psychometrics/ag50b-child-minor-data-protection-boundary.json",
  "data/content-intelligence/assessment-psychometrics/ag50b-parent-school-human-review-boundary.json",
  "data/content-intelligence/assessment-psychometrics/ag50b-no-collection-default-state-register.json",

  "data/content-intelligence/quality-reviews/ag50c-age-adaptive-psychometric-workflow-design.json",
  "data/content-intelligence/assessment-psychometrics/ag50c-class5-7-workflow-design.json",
  "data/content-intelligence/assessment-psychometrics/ag50c-class8-10-workflow-design.json",
  "data/content-intelligence/assessment-psychometrics/ag50c-class11-onward-workflow-design.json",
  "data/content-intelligence/assessment-psychometrics/ag50c-item-task-input-category-map.json",
  "data/content-intelligence/assessment-psychometrics/ag50c-agent-interface-design-record.json",
  "data/content-intelligence/assessment-psychometrics/ag50c-human-review-support-output-boundary.json",
  "data/content-intelligence/assessment-psychometrics/ag50c-workflow-risk-control-register.json",

  "data/content-intelligence/quality-reviews/ag50d-model-output-academic-result-trait-correlation-design.json",
  "data/content-intelligence/assessment-psychometrics/ag50d-model-output-schema-category-design.json",
  "data/content-intelligence/assessment-psychometrics/ag50d-academic-learning-indicator-map.json",
  "data/content-intelligence/assessment-psychometrics/ag50d-statistical-correlation-regression-design.json",
  "data/content-intelligence/assessment-psychometrics/ag50d-contradiction-error-flagging-design.json",
  "data/content-intelligence/assessment-psychometrics/ag50d-correlation-ethics-and-interpretation-boundary.json",
  "data/content-intelligence/assessment-psychometrics/ag50d-human-review-correlation-handoff-record.json",
  "data/content-intelligence/backend-architecture/ag50d-no-student-academic-data-upload-audit.json",
  "data/content-intelligence/backend-architecture/ag50d-no-correlation-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag50d-no-student-report-generation-audit.json",
  "data/content-intelligence/backend-architecture/ag50d-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/quality-registry/ag50d-ag50z-assessment-psychometric-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag50d-to-ag50z-assessment-psychometric-closure-boundary.json",

  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag50z-assessment-psychometric-product-layer-closure.json",
  "data/content-intelligence/assessment-psychometrics/ag50z-assessment-psychometric-closure-record.json",
  "data/content-intelligence/assessment-psychometrics/ag50z-ag50a-to-ag50d-consumption-summary.json",
  "data/content-intelligence/assessment-psychometrics/ag50z-carry-forward-deferral-register.json",
  "data/content-intelligence/assessment-psychometrics/ag50z-assessment-surface-closure-position.json",
  "data/content-intelligence/ag-roadmap/ag50z-post-ag50-roadmap-checkpoint-handoff.json",
  "data/content-intelligence/backend-architecture/ag50z-no-student-data-collection-audit.json",
  "data/content-intelligence/backend-architecture/ag50z-no-assessment-runtime-scoring-audit.json",
  "data/content-intelligence/backend-architecture/ag50z-no-correlation-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag50z-no-student-report-generation-audit.json",
  "data/content-intelligence/backend-architecture/ag50z-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag50z-no-secret-exposure-audit.json",
  "data/content-intelligence/quality-registry/ag50z-post-ag50-roadmap-checkpoint-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag50z-to-post-ag50-roadmap-checkpoint-boundary.json",
  "data/quality/ag50z-assessment-psychometric-product-layer-closure.json",
  "data/quality/ag50z-assessment-psychometric-product-layer-closure-preview.json",
  "docs/quality/AG50Z_ASSESSMENT_PSYCHOMETRIC_PRODUCT_LAYER_CLOSURE.md",
  "scripts/generate-ag50z-assessment-psychometric-product-layer-closure.mjs",
  "scripts/validate-ag50z-assessment-psychometric-product-layer-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag50aReview = readJson("data/content-intelligence/quality-reviews/ag50a-assessment-psychometric-product-layer-entry.json");
const ag50aDoctrine = readJson("data/content-intelligence/assessment-psychometrics/ag50a-class5-onward-assessment-doctrine.json");
const ag50aNonDiagnostic = readJson("data/content-intelligence/assessment-psychometrics/ag50a-non-diagnostic-non-deterministic-boundary.json");

const ag50bReview = readJson("data/content-intelligence/quality-reviews/ag50b-child-minor-consent-school-permission-gate.json");
const ag50bGuardian = readJson("data/content-intelligence/assessment-psychometrics/ag50b-guardian-consent-gate-record.json");
const ag50bSchool = readJson("data/content-intelligence/assessment-psychometrics/ag50b-school-permission-gate-record.json");
const ag50bHumanReview = readJson("data/content-intelligence/assessment-psychometrics/ag50b-parent-school-human-review-boundary.json");

const ag50cReview = readJson("data/content-intelligence/quality-reviews/ag50c-age-adaptive-psychometric-workflow-design.json");
const ag50cClass57 = readJson("data/content-intelligence/assessment-psychometrics/ag50c-class5-7-workflow-design.json");
const ag50cSupportOutput = readJson("data/content-intelligence/assessment-psychometrics/ag50c-human-review-support-output-boundary.json");
const ag50cRiskControls = readJson("data/content-intelligence/assessment-psychometrics/ag50c-workflow-risk-control-register.json");

const ag50dReview = readJson("data/content-intelligence/quality-reviews/ag50d-model-output-academic-result-trait-correlation-design.json");
const ag50dModelOutputSchema = readJson("data/content-intelligence/assessment-psychometrics/ag50d-model-output-schema-category-design.json");
const ag50dAcademicLearningMap = readJson("data/content-intelligence/assessment-psychometrics/ag50d-academic-learning-indicator-map.json");
const ag50dStatisticalDesign = readJson("data/content-intelligence/assessment-psychometrics/ag50d-statistical-correlation-regression-design.json");
const ag50dEthicsBoundary = readJson("data/content-intelligence/assessment-psychometrics/ag50d-correlation-ethics-and-interpretation-boundary.json");
const ag50dNoDataUpload = readJson("data/content-intelligence/backend-architecture/ag50d-no-student-academic-data-upload-audit.json");
const ag50dNoCorrelationRuntime = readJson("data/content-intelligence/backend-architecture/ag50d-no-correlation-runtime-audit.json");
const ag50dNoReportGeneration = readJson("data/content-intelligence/backend-architecture/ag50d-no-student-report-generation-audit.json");
const ag50dNoRuntimeApi = readJson("data/content-intelligence/backend-architecture/ag50d-no-runtime-api-deployment-audit.json");
const ag50dReadiness = readJson("data/content-intelligence/quality-registry/ag50d-ag50z-assessment-psychometric-closure-readiness-record.json");
const ag50dBoundary = readJson("data/content-intelligence/mutation-plans/ag50d-to-ag50z-assessment-psychometric-closure-boundary.json");

const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag50aReview.status !== "assessment_psychometric_product_layer_entry_ready_for_ag50b") fail("AG50A review status mismatch.");
if (ag50aDoctrine.assessment_start_point.minimum_class_for_future_psychometric_layer !== "Class 5") fail("Class 5 doctrine missing.");
if (ag50aNonDiagnostic.diagnostic_output_position !== "blocked") fail("Diagnosis boundary must remain blocked.");

if (ag50bReview.status !== "child_minor_consent_school_permission_gate_ready_for_ag50c") fail("AG50B review status mismatch.");
if (ag50bGuardian.consent_runtime_enabled_now !== false) fail("Guardian consent runtime must remain disabled.");
if (ag50bSchool.school_permission_runtime_enabled_now !== false) fail("School permission runtime must remain disabled.");
if (ag50bHumanReview.human_review_required_for_future_outputs !== true) fail("Human review must be required.");

if (ag50cReview.status !== "age_adaptive_psychometric_workflow_ready_for_ag50d") fail("AG50C review status mismatch.");
if (ag50cClass57.runtime_position !== "design_only_not_executed") fail("Class 5-7 workflow must remain design-only.");
if (ag50cSupportOutput.report_generation_enabled_now !== false) fail("Report generation must remain disabled.");
if (ag50cRiskControls.ag50d_design_allowed !== true) fail("AG50D design must be allowed.");

if (ag50dReview.status !== "model_output_academic_result_correlation_design_ready_for_ag50z") fail("AG50D review status mismatch.");
if (ag50dModelOutputSchema.runtime_enabled_now !== false) fail("Model output runtime must remain disabled.");
if (ag50dAcademicLearningMap.mapping_position.academic_marks_upload_enabled_now !== false) fail("Academic marks upload must remain disabled.");
if (ag50dStatisticalDesign.runtime_enabled_now !== false) fail("Statistical runtime must remain disabled.");
if (!ag50dEthicsBoundary.interpretation_boundaries.includes("Correlation is not causation.")) fail("Correlation ethics boundary missing.");
if (ag50dNoDataUpload.audit_passed !== true) fail("AG50D no data upload audit must pass.");
if (ag50dNoCorrelationRuntime.audit_passed !== true) fail("AG50D no correlation runtime audit must pass.");
if (ag50dNoReportGeneration.audit_passed !== true) fail("AG50D no report generation audit must pass.");
if (ag50dNoRuntimeApi.audit_passed !== true) fail("AG50D no runtime/API audit must pass.");
if (ag50dReadiness.ready_for_ag50z !== true) fail("AG50D readiness must permit AG50Z.");
if (ag50dBoundary.next_stage_id !== "AG50Z") fail("AG50D boundary must point to AG50Z.");

if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag50z-assessment-psychometric-product-layer-closure.json");
const closureRecord = readJson("data/content-intelligence/assessment-psychometrics/ag50z-assessment-psychometric-closure-record.json");
const consumptionSummary = readJson("data/content-intelligence/assessment-psychometrics/ag50z-ag50a-to-ag50d-consumption-summary.json");
const carryForwardDeferralRegister = readJson("data/content-intelligence/assessment-psychometrics/ag50z-carry-forward-deferral-register.json");
const assessmentSurfaceClosure = readJson("data/content-intelligence/assessment-psychometrics/ag50z-assessment-surface-closure-position.json");
const postAg50Handoff = readJson("data/content-intelligence/ag-roadmap/ag50z-post-ag50-roadmap-checkpoint-handoff.json");
const noStudentDataAudit = readJson("data/content-intelligence/backend-architecture/ag50z-no-student-data-collection-audit.json");
const noAssessmentRuntimeAudit = readJson("data/content-intelligence/backend-architecture/ag50z-no-assessment-runtime-scoring-audit.json");
const noCorrelationRuntimeAudit = readJson("data/content-intelligence/backend-architecture/ag50z-no-correlation-runtime-audit.json");
const noReportGenerationAudit = readJson("data/content-intelligence/backend-architecture/ag50z-no-student-report-generation-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag50z-no-runtime-api-deployment-audit.json");
const noSecretExposureAudit = readJson("data/content-intelligence/backend-architecture/ag50z-no-secret-exposure-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag50z-post-ag50-roadmap-checkpoint-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag50z-to-post-ag50-roadmap-checkpoint-boundary.json");
const preview = readJson("data/quality/ag50z-assessment-psychometric-product-layer-closure-preview.json");
const pkg = readJson("package.json");

if (review.status !== "assessment_psychometric_product_layer_closed_ready_for_post_ag50_checkpoint") fail("AG50Z review status mismatch.");

for (const key of [
  "ag50z_assessment_psychometric_product_layer_closed",
  "ag50a_ag50b_ag50c_ag50d_consumed",
  "assessment_psychometric_closure_completed",
  "post_ag50_roadmap_checkpoint_handoff_created",
  "ready_for_post_ag50_roadmap_checkpoint"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_post_ag50_checkpoint !== 0) fail("Post-AG50 checkpoint blocker count must be zero.");

for (const key of [
  "student_data_collection_enabled",
  "child_minor_profile_creation_enabled",
  "guardian_consent_runtime_enabled",
  "school_permission_runtime_enabled",
  "psychometric_test_runtime_enabled",
  "assessment_runtime_scoring_enabled",
  "academic_result_upload_enabled",
  "teacher_observation_upload_enabled",
  "model_output_correlation_runtime_enabled",
  "model_output_generation_runtime_enabled",
  "statistical_analysis_runtime_enabled",
  "trait_correlation_runtime_enabled",
  "contradiction_flagging_runtime_enabled",
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

if (closureRecord.status !== "assessment_psychometric_closure_completed") fail("Closure record status mismatch.");
if (closureRecord.closure_allowed !== true) fail("Closure must be allowed.");
if (!closureRecord.closure_result.includes("Class 5 onward")) fail("Class 5 onward closure doctrine missing.");

for (const stage of ["AG50A", "AG50B", "AG50C", "AG50D"]) {
  if (!JSON.stringify(consumptionSummary.consumed_outputs).includes(stage)) fail(`Consumption summary missing ${stage}.`);
}

for (const item of ["student data collection", "assessment scoring engine", "model-output correlation runtime", "AI-generated student report", "deployment"]) {
  if (!carryForwardDeferralRegister.deferred_items.includes(item)) fail(`Carry-forward deferral missing: ${item}`);
}

if (!assessmentSurfaceClosure.blocked_without_later_approval.includes("student-facing assessment form")) fail("Student-facing assessment form must remain blocked.");
if (!assessmentSurfaceClosure.blocked_without_later_approval.includes("correlation/statistical runtime")) fail("Correlation/statistical runtime must remain blocked.");

if (postAg50Handoff.status !== "post_ag50_roadmap_checkpoint_handoff_created") fail("Post-AG50 handoff status mismatch.");
if (postAg50Handoff.next_stage_id !== "POST_AG50_ROADMAP_CHECKPOINT") fail("Post-AG50 handoff must point to checkpoint.");

if (noStudentDataAudit.audit_passed !== true) fail("No student data audit must pass.");
if (noStudentDataAudit.failed_checks.length !== 0) fail("No student data failed checks must be zero.");

if (noAssessmentRuntimeAudit.audit_passed !== true) fail("No assessment runtime audit must pass.");
if (noAssessmentRuntimeAudit.failed_checks.length !== 0) fail("No assessment runtime failed checks must be zero.");

if (noCorrelationRuntimeAudit.audit_passed !== true) fail("No correlation runtime audit must pass.");
if (noCorrelationRuntimeAudit.failed_checks.length !== 0) fail("No correlation runtime failed checks must be zero.");

if (noReportGenerationAudit.audit_passed !== true) fail("No report generation audit must pass.");
if (noReportGenerationAudit.failed_checks.length !== 0) fail("No report generation failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (noSecretExposureAudit.audit_passed !== true) fail("No secret exposure audit must pass.");
if (noSecretExposureAudit.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");

if (readiness.status !== "ready_for_post_ag50_roadmap_checkpoint") fail("Post-AG50 readiness status mismatch.");
if (readiness.ready_for_post_ag50_checkpoint !== true) fail("Post-AG50 readiness must be true.");
if (readiness.next_stage_id !== "POST_AG50_ROADMAP_CHECKPOINT") fail("Readiness must point to post-AG50 checkpoint.");

if (boundary.next_stage_id !== "POST_AG50_ROADMAP_CHECKPOINT") fail("Boundary must point to post-AG50 checkpoint.");

for (const key of [
  "ag50z_assessment_psychometric_product_layer_closed",
  "ag50a_ag50b_ag50c_ag50d_consumed",
  "assessment_psychometric_closure_completed",
  "post_ag50_roadmap_checkpoint_handoff_created",
  "ready_for_post_ag50_roadmap_checkpoint"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "student_data_collection_enabled",
  "child_minor_profile_creation_enabled",
  "guardian_consent_runtime_enabled",
  "school_permission_runtime_enabled",
  "psychometric_test_runtime_enabled",
  "assessment_runtime_scoring_enabled",
  "academic_result_upload_enabled",
  "teacher_observation_upload_enabled",
  "model_output_correlation_runtime_enabled",
  "model_output_generation_runtime_enabled",
  "statistical_analysis_runtime_enabled",
  "trait_correlation_runtime_enabled",
  "contradiction_flagging_runtime_enabled",
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

if (!pkg.scripts?.["generate:ag50z"]) fail("Missing package script: generate:ag50z");
if (!pkg.scripts?.["validate:ag50z"]) fail("Missing package script: validate:ag50z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag50z")) fail("validate:project must include validate:ag50z.");

pass("AG50Z Assessment/Psychometric Product Layer Closure is present.");
pass("AG50A–AG50D outputs are consumed.");
pass("Assessment/psychometric closure record is valid.");
pass("Carry-forward deferral register is valid.");
pass("Assessment surface closure position is valid.");
pass("Post-AG50 roadmap checkpoint handoff is valid.");
pass("No student data collection audit is valid.");
pass("No assessment runtime/scoring audit is valid.");
pass("No correlation runtime audit is valid.");
pass("No student report generation audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("No secret exposure audit is valid.");
pass("Post-AG50 roadmap checkpoint readiness is valid.");
