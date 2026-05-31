import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG50D validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag50c-age-adaptive-psychometric-workflow-design.json",
  "data/content-intelligence/assessment-psychometrics/ag50c-class5-7-workflow-design.json",
  "data/content-intelligence/assessment-psychometrics/ag50c-class8-10-workflow-design.json",
  "data/content-intelligence/assessment-psychometrics/ag50c-class11-onward-workflow-design.json",
  "data/content-intelligence/assessment-psychometrics/ag50c-item-task-input-category-map.json",
  "data/content-intelligence/assessment-psychometrics/ag50c-agent-interface-design-record.json",
  "data/content-intelligence/assessment-psychometrics/ag50c-human-review-support-output-boundary.json",
  "data/content-intelligence/assessment-psychometrics/ag50c-workflow-risk-control-register.json",
  "data/content-intelligence/backend-architecture/ag50c-no-student-data-collection-audit.json",
  "data/content-intelligence/backend-architecture/ag50c-no-assessment-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag50c-no-scoring-correlation-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag50c-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/quality-registry/ag50c-ag50d-model-output-academic-result-correlation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag50c-to-ag50d-model-output-academic-result-correlation-boundary.json",
  "data/content-intelligence/assessment-psychometrics/ag50a-methodology-and-validation-approach.json",
  "data/content-intelligence/assessment-psychometrics/ag50b-parent-school-human-review-boundary.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

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
  "data/quality/ag50d-model-output-academic-result-trait-correlation-design.json",
  "data/quality/ag50d-model-output-academic-result-trait-correlation-design-preview.json",
  "docs/quality/AG50D_MODEL_OUTPUT_ACADEMIC_RESULT_TRAIT_CORRELATION_DESIGN.md",
  "scripts/generate-ag50d-model-output-academic-result-correlation-design.mjs",
  "scripts/validate-ag50d-model-output-academic-result-correlation-design.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag50cReview = readJson("data/content-intelligence/quality-reviews/ag50c-age-adaptive-psychometric-workflow-design.json");
const ag50cItemTask = readJson("data/content-intelligence/assessment-psychometrics/ag50c-item-task-input-category-map.json");
const ag50cAgentInterface = readJson("data/content-intelligence/assessment-psychometrics/ag50c-agent-interface-design-record.json");
const ag50cSupportOutput = readJson("data/content-intelligence/assessment-psychometrics/ag50c-human-review-support-output-boundary.json");
const ag50cRiskControls = readJson("data/content-intelligence/assessment-psychometrics/ag50c-workflow-risk-control-register.json");
const ag50cNoStudentData = readJson("data/content-intelligence/backend-architecture/ag50c-no-student-data-collection-audit.json");
const ag50cNoAssessmentRuntime = readJson("data/content-intelligence/backend-architecture/ag50c-no-assessment-runtime-audit.json");
const ag50cNoScoringCorrelation = readJson("data/content-intelligence/backend-architecture/ag50c-no-scoring-correlation-runtime-audit.json");
const ag50cNoRuntimeApi = readJson("data/content-intelligence/backend-architecture/ag50c-no-runtime-api-deployment-audit.json");
const ag50cReadiness = readJson("data/content-intelligence/quality-registry/ag50c-ag50d-model-output-academic-result-correlation-readiness-record.json");
const ag50cBoundary = readJson("data/content-intelligence/mutation-plans/ag50c-to-ag50d-model-output-academic-result-correlation-boundary.json");
const ag50aMethodology = readJson("data/content-intelligence/assessment-psychometrics/ag50a-methodology-and-validation-approach.json");
const ag50bHumanReview = readJson("data/content-intelligence/assessment-psychometrics/ag50b-parent-school-human-review-boundary.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag50cReview.status !== "age_adaptive_psychometric_workflow_ready_for_ag50d") fail("AG50C review status mismatch.");
if (!ag50cItemTask.explicitly_blocked_now.includes("academic marks upload")) fail("Academic marks upload must be blocked.");
if (!JSON.stringify(ag50cAgentInterface.non_runtime_agent_interfaces).includes("Agent 2")) fail("Agent 2 interface missing.");
if (ag50cSupportOutput.report_generation_enabled_now !== false) fail("AG50C report generation must remain disabled.");
if (ag50cRiskControls.ag50d_design_allowed !== true) fail("AG50D design must be allowed.");
if (ag50cNoStudentData.audit_passed !== true) fail("AG50C no-student-data audit must pass.");
if (ag50cNoAssessmentRuntime.audit_passed !== true) fail("AG50C no-assessment-runtime audit must pass.");
if (ag50cNoScoringCorrelation.audit_passed !== true) fail("AG50C no-scoring-correlation audit must pass.");
if (ag50cNoRuntimeApi.audit_passed !== true) fail("AG50C no-runtime/API audit must pass.");
if (ag50cReadiness.ready_for_ag50d !== true) fail("AG50C readiness must permit AG50D.");
if (ag50cBoundary.next_stage_id !== "AG50D") fail("AG50C boundary must point to AG50D.");
if (!ag50aMethodology.statistical_methods_for_future_design.includes("multivariate regression")) fail("AG50A multivariate regression methodology missing.");
if (ag50bHumanReview.human_review_required_for_future_outputs !== true) fail("AG50B human review continuity missing.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag50d-model-output-academic-result-trait-correlation-design.json");
const modelOutputSchema = readJson("data/content-intelligence/assessment-psychometrics/ag50d-model-output-schema-category-design.json");
const academicLearningMap = readJson("data/content-intelligence/assessment-psychometrics/ag50d-academic-learning-indicator-map.json");
const statisticalDesign = readJson("data/content-intelligence/assessment-psychometrics/ag50d-statistical-correlation-regression-design.json");
const contradictionFlagging = readJson("data/content-intelligence/assessment-psychometrics/ag50d-contradiction-error-flagging-design.json");
const ethicsBoundary = readJson("data/content-intelligence/assessment-psychometrics/ag50d-correlation-ethics-and-interpretation-boundary.json");
const humanReviewHandoff = readJson("data/content-intelligence/assessment-psychometrics/ag50d-human-review-correlation-handoff-record.json");
const noDataUploadAudit = readJson("data/content-intelligence/backend-architecture/ag50d-no-student-academic-data-upload-audit.json");
const noCorrelationRuntimeAudit = readJson("data/content-intelligence/backend-architecture/ag50d-no-correlation-runtime-audit.json");
const noReportGenerationAudit = readJson("data/content-intelligence/backend-architecture/ag50d-no-student-report-generation-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag50d-no-runtime-api-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag50d-ag50z-assessment-psychometric-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag50d-to-ag50z-assessment-psychometric-closure-boundary.json");
const preview = readJson("data/quality/ag50d-model-output-academic-result-trait-correlation-design-preview.json");
const pkg = readJson("package.json");

if (review.status !== "model_output_academic_result_correlation_design_ready_for_ag50z") fail("AG50D review status mismatch.");

for (const key of [
  "ag50d_model_output_academic_result_correlation_design_recorded",
  "ag50c_consumed",
  "model_output_schema_category_design_recorded",
  "academic_learning_indicator_map_recorded",
  "statistical_correlation_regression_design_recorded",
  "contradiction_error_flagging_design_recorded",
  "correlation_ethics_interpretation_boundary_recorded",
  "human_review_correlation_handoff_recorded",
  "ready_for_ag50z_assessment_psychometric_closure"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag50z !== 0) fail("AG50Z blocker count must be zero.");

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

if (modelOutputSchema.status !== "model_output_schema_category_design_recorded") fail("Model output schema status mismatch.");
if (!modelOutputSchema.non_runtime_output_categories.includes("emotional_regulation_support_signal")) fail("Emotional regulation output signal missing.");
if (!modelOutputSchema.interpretation_rule.includes("support signals only")) fail("Support-signal interpretation rule missing.");
if (modelOutputSchema.runtime_enabled_now !== false) fail("Model output runtime must remain disabled.");

if (academicLearningMap.status !== "academic_learning_indicator_map_recorded") fail("Academic learning map status mismatch.");
if (!academicLearningMap.non_runtime_indicator_categories.includes("subject_wise_progress_band")) fail("Subject-wise progress category missing.");
if (academicLearningMap.mapping_position.academic_marks_upload_enabled_now !== false) fail("Academic marks upload must remain disabled.");
if (academicLearningMap.mapping_position.design_only_mapping_now !== true) fail("Academic mapping must be design-only.");

if (statisticalDesign.status !== "statistical_correlation_regression_design_recorded") fail("Statistical design status mismatch.");
for (const method of ["correlation analysis", "bivariate analysis", "multivariate regression", "trend analysis", "model-output versus actual-outcome comparison"]) {
  if (!statisticalDesign.future_methods_design_only.includes(method)) fail(`Statistical method missing: ${method}`);
}
if (statisticalDesign.runtime_enabled_now !== false) fail("Statistical runtime must remain disabled.");

if (contradictionFlagging.status !== "contradiction_error_flagging_design_recorded") fail("Contradiction flagging status mismatch.");
if (!contradictionFlagging.future_flag_categories.includes("model output and academic trend mismatch")) fail("Model-output academic mismatch flag missing.");
if (!contradictionFlagging.routing_rule.includes("human review")) fail("Human review routing rule missing.");
if (contradictionFlagging.runtime_enabled_now !== false) fail("Contradiction flagging runtime must remain disabled.");

if (ethicsBoundary.status !== "correlation_ethics_interpretation_boundary_recorded") fail("Ethics boundary status mismatch.");
if (!ethicsBoundary.interpretation_boundaries.includes("Correlation is not causation.")) fail("Correlation-is-not-causation rule missing.");
if (!ethicsBoundary.prohibited_uses.includes("student ranking")) fail("Student ranking must be prohibited.");

if (humanReviewHandoff.status !== "human_review_correlation_handoff_recorded") fail("Human review handoff status mismatch.");
if (!humanReviewHandoff.handoff_rules.includes("Use findings to support the student, not to label or rank.")) fail("Human review support-not-label rule missing.");
if (humanReviewHandoff.runtime_enabled_now !== false) fail("Human review handoff runtime must remain disabled.");

if (noDataUploadAudit.audit_passed !== true) fail("No data upload audit must pass.");
if (noDataUploadAudit.failed_checks.length !== 0) fail("No data upload failed checks must be zero.");

if (noCorrelationRuntimeAudit.audit_passed !== true) fail("No correlation runtime audit must pass.");
if (noCorrelationRuntimeAudit.failed_checks.length !== 0) fail("No correlation runtime failed checks must be zero.");

if (noReportGenerationAudit.audit_passed !== true) fail("No report generation audit must pass.");
if (noReportGenerationAudit.failed_checks.length !== 0) fail("No report generation failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (readiness.status !== "ready_for_ag50z_assessment_psychometric_closure") fail("AG50Z readiness status mismatch.");
if (readiness.ready_for_ag50z !== true) fail("AG50Z readiness must be true.");
if (readiness.next_stage_id !== "AG50Z") fail("Readiness must point to AG50Z.");
if (!readiness.ag50z_allowed_scope.includes("Close AG50 assessment/psychometric readiness.")) fail("AG50Z closure scope missing.");
if (!readiness.ag50z_blocked_scope.includes("Model-output correlation runtime")) fail("AG50Z must block correlation runtime.");

if (boundary.next_stage_id !== "AG50Z") fail("Boundary must point to AG50Z.");

for (const key of [
  "ag50d_model_output_academic_result_correlation_design_recorded",
  "ag50c_consumed",
  "model_output_schema_category_design_recorded",
  "academic_learning_indicator_map_recorded",
  "statistical_correlation_regression_design_recorded",
  "contradiction_error_flagging_design_recorded",
  "correlation_ethics_interpretation_boundary_recorded",
  "human_review_correlation_handoff_recorded",
  "ready_for_ag50z_assessment_psychometric_closure"
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

if (!pkg.scripts?.["generate:ag50d"]) fail("Missing package script: generate:ag50d");
if (!pkg.scripts?.["validate:ag50d"]) fail("Missing package script: validate:ag50d");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag50d")) fail("validate:project must include validate:ag50d.");

pass("AG50D Model Output, Academic Result and Trait Correlation Design is present.");
pass("AG50C inputs are consumed.");
pass("Model-output schema category design is valid.");
pass("Academic result and learning-indicator map is valid.");
pass("Statistical correlation/regression design is valid.");
pass("Contradiction and error flagging design is valid.");
pass("Correlation ethics and interpretation boundary is valid.");
pass("Human review correlation handoff is valid.");
pass("No student/academic data upload audit is valid.");
pass("No correlation runtime audit is valid.");
pass("No student report generation audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("AG50Z assessment/psychometric closure readiness is valid.");
