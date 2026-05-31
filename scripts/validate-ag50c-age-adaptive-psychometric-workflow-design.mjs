import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG50C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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

  "data/content-intelligence/assessment-psychometrics/ag50a-class5-onward-assessment-doctrine.json",
  "data/content-intelligence/assessment-psychometrics/ag50a-age-adaptive-band-model.json",
  "data/content-intelligence/assessment-psychometrics/ag50a-multi-agent-assessment-architecture.json",
  "data/content-intelligence/assessment-psychometrics/ag50a-methodology-and-validation-approach.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

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
  "data/quality/ag50c-age-adaptive-psychometric-workflow-design.json",
  "data/quality/ag50c-age-adaptive-psychometric-workflow-design-preview.json",
  "docs/quality/AG50C_AGE_ADAPTIVE_PSYCHOMETRIC_WORKFLOW_DESIGN.md",
  "scripts/generate-ag50c-age-adaptive-psychometric-workflow-design.mjs",
  "scripts/validate-ag50c-age-adaptive-psychometric-workflow-design.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag50bReview = readJson("data/content-intelligence/quality-reviews/ag50b-child-minor-consent-school-permission-gate.json");
const ag50bGuardian = readJson("data/content-intelligence/assessment-psychometrics/ag50b-guardian-consent-gate-record.json");
const ag50bSchool = readJson("data/content-intelligence/assessment-psychometrics/ag50b-school-permission-gate-record.json");
const ag50bProtection = readJson("data/content-intelligence/assessment-psychometrics/ag50b-child-minor-data-protection-boundary.json");
const ag50bHumanReview = readJson("data/content-intelligence/assessment-psychometrics/ag50b-parent-school-human-review-boundary.json");
const ag50bNoCollection = readJson("data/content-intelligence/assessment-psychometrics/ag50b-no-collection-default-state-register.json");
const ag50bNoChildData = readJson("data/content-intelligence/backend-architecture/ag50b-no-child-minor-data-collection-audit.json");
const ag50bNoConsentRuntime = readJson("data/content-intelligence/backend-architecture/ag50b-no-consent-runtime-activation-audit.json");
const ag50bNoAssessmentRuntime = readJson("data/content-intelligence/backend-architecture/ag50b-no-assessment-runtime-audit.json");
const ag50bNoRuntimeApi = readJson("data/content-intelligence/backend-architecture/ag50b-no-runtime-api-deployment-audit.json");
const ag50bReadiness = readJson("data/content-intelligence/quality-registry/ag50b-ag50c-age-adaptive-psychometric-workflow-readiness-record.json");
const ag50bBoundary = readJson("data/content-intelligence/mutation-plans/ag50b-to-ag50c-age-adaptive-psychometric-workflow-boundary.json");
const ag50aDoctrine = readJson("data/content-intelligence/assessment-psychometrics/ag50a-class5-onward-assessment-doctrine.json");
const ag50aAgeBand = readJson("data/content-intelligence/assessment-psychometrics/ag50a-age-adaptive-band-model.json");
const ag50aArchitecture = readJson("data/content-intelligence/assessment-psychometrics/ag50a-multi-agent-assessment-architecture.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag50bReview.status !== "child_minor_consent_school_permission_gate_ready_for_ag50c") fail("AG50B review status mismatch.");
if (ag50bGuardian.consent_runtime_enabled_now !== false) fail("Guardian consent runtime must remain disabled.");
if (ag50bSchool.school_permission_runtime_enabled_now !== false) fail("School permission runtime must remain disabled.");
if (!ag50bProtection.protected_categories_blocked_now.includes("psychometric response")) fail("Psychometric response protection missing.");
if (ag50bHumanReview.human_review_required_for_future_outputs !== true) fail("Human review must be required.");
for (const [key, value] of Object.entries(ag50bNoCollection.default_states || {})) {
  if (value !== false) fail(`AG50B no-collection default must be false: ${key}`);
}
if (ag50bNoChildData.audit_passed !== true) fail("AG50B no-child-data audit must pass.");
if (ag50bNoConsentRuntime.audit_passed !== true) fail("AG50B no-consent-runtime audit must pass.");
if (ag50bNoAssessmentRuntime.audit_passed !== true) fail("AG50B no-assessment-runtime audit must pass.");
if (ag50bNoRuntimeApi.audit_passed !== true) fail("AG50B no-runtime/API audit must pass.");
if (ag50bReadiness.ready_for_ag50c !== true) fail("AG50B readiness must permit AG50C.");
if (ag50bBoundary.next_stage_id !== "AG50C") fail("AG50B boundary must point to AG50C.");
if (ag50aDoctrine.assessment_start_point.minimum_class_for_future_psychometric_layer !== "Class 5") fail("Class 5 doctrine missing.");
if (!JSON.stringify(ag50aAgeBand.class_bands).includes("Class 5 to 7")) fail("Class 5 to 7 AG50A band missing.");
if (!JSON.stringify(ag50aArchitecture.architecture_layers).includes("Agent 3 contradiction/error flagging agent")) fail("Agent 3 architecture missing.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag50c-age-adaptive-psychometric-workflow-design.json");
const class57Workflow = readJson("data/content-intelligence/assessment-psychometrics/ag50c-class5-7-workflow-design.json");
const class810Workflow = readJson("data/content-intelligence/assessment-psychometrics/ag50c-class8-10-workflow-design.json");
const class11OnwardWorkflow = readJson("data/content-intelligence/assessment-psychometrics/ag50c-class11-onward-workflow-design.json");
const itemTaskInputMap = readJson("data/content-intelligence/assessment-psychometrics/ag50c-item-task-input-category-map.json");
const agentInterfaceDesign = readJson("data/content-intelligence/assessment-psychometrics/ag50c-agent-interface-design-record.json");
const supportOutputBoundary = readJson("data/content-intelligence/assessment-psychometrics/ag50c-human-review-support-output-boundary.json");
const workflowRiskControls = readJson("data/content-intelligence/assessment-psychometrics/ag50c-workflow-risk-control-register.json");
const noStudentDataAudit = readJson("data/content-intelligence/backend-architecture/ag50c-no-student-data-collection-audit.json");
const noAssessmentRuntimeAudit = readJson("data/content-intelligence/backend-architecture/ag50c-no-assessment-runtime-audit.json");
const noScoringCorrelationAudit = readJson("data/content-intelligence/backend-architecture/ag50c-no-scoring-correlation-runtime-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag50c-no-runtime-api-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag50c-ag50d-model-output-academic-result-correlation-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag50c-to-ag50d-model-output-academic-result-correlation-boundary.json");
const preview = readJson("data/quality/ag50c-age-adaptive-psychometric-workflow-design-preview.json");
const pkg = readJson("package.json");

if (review.status !== "age_adaptive_psychometric_workflow_ready_for_ag50d") fail("AG50C review status mismatch.");

for (const key of [
  "ag50c_age_adaptive_workflow_design_recorded",
  "ag50b_consumed",
  "class5_7_workflow_design_recorded",
  "class8_10_workflow_design_recorded",
  "class11_onward_workflow_design_recorded",
  "item_task_input_category_map_recorded",
  "agent_interface_design_recorded",
  "support_output_boundary_recorded",
  "workflow_risk_controls_recorded",
  "ready_for_ag50d_model_output_academic_result_correlation_design"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag50d !== 0) fail("AG50D blocker count must be zero.");

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

if (class57Workflow.status !== "class5_7_workflow_design_recorded") fail("Class 5-7 workflow status mismatch.");
if (!class57Workflow.future_focus_domains.includes("emotional regulation")) fail("Class 5-7 emotional regulation focus missing.");
if (!class57Workflow.prohibited_use.includes("career-stream prediction")) fail("Class 5-7 career prediction blocker missing.");

if (class810Workflow.status !== "class8_10_workflow_design_recorded") fail("Class 8-10 workflow status mismatch.");
if (!class810Workflow.future_focus_domains.includes("NSQF-linked pathway exposure")) fail("Class 8-10 NSQF exposure focus missing.");
if (!class810Workflow.prohibited_use.includes("deterministic stream locking")) fail("Class 8-10 stream locking blocker missing.");

if (class11OnwardWorkflow.status !== "class11_onward_workflow_design_recorded") fail("Class 11 onward workflow status mismatch.");
if (!class11OnwardWorkflow.future_focus_domains.includes("career/skill pathway reflection")) fail("Class 11 onward pathway reflection focus missing.");
if (!class11OnwardWorkflow.prohibited_use.includes("guaranteed career prediction")) fail("Class 11 onward career guarantee blocker missing.");

if (itemTaskInputMap.status !== "item_task_input_category_map_recorded") fail("Item/task map status mismatch.");
if (!JSON.stringify(itemTaskInputMap.planned_input_categories).includes("academic_result_category")) fail("Academic result category must be design-only mapped.");
if (!itemTaskInputMap.explicitly_blocked_now.includes("academic marks upload")) fail("Academic marks upload must be blocked.");

if (agentInterfaceDesign.status !== "agent_interface_design_recorded") fail("Agent interface design status mismatch.");
for (const agent of ["Agent 1", "Agent 2", "Agent 3", "Human review layer"]) {
  if (!JSON.stringify(agentInterfaceDesign.non_runtime_agent_interfaces).includes(agent)) fail(`Missing ${agent} interface.`);
}

if (supportOutputBoundary.status !== "support_output_boundary_recorded") fail("Support output boundary status mismatch.");
if (supportOutputBoundary.human_review_required_before_student_facing_report !== true) fail("Human review before report must be required.");
if (supportOutputBoundary.report_generation_enabled_now !== false) fail("Report generation must remain disabled.");
if (!supportOutputBoundary.prohibited_output_style.includes("diagnosis")) fail("Diagnosis output must be prohibited.");

if (workflowRiskControls.status !== "workflow_risk_controls_recorded") fail("Workflow risk controls status mismatch.");
if (workflowRiskControls.blocking_gaps_for_ag50d.length !== 0) fail("AG50D blocking gaps must be zero.");
if (workflowRiskControls.ag50d_design_allowed !== true) fail("AG50D design must be allowed.");

if (noStudentDataAudit.audit_passed !== true) fail("No student data audit must pass.");
if (noStudentDataAudit.failed_checks.length !== 0) fail("No student data failed checks must be zero.");

if (noAssessmentRuntimeAudit.audit_passed !== true) fail("No assessment runtime audit must pass.");
if (noAssessmentRuntimeAudit.failed_checks.length !== 0) fail("No assessment runtime failed checks must be zero.");

if (noScoringCorrelationAudit.audit_passed !== true) fail("No scoring/correlation runtime audit must pass.");
if (noScoringCorrelationAudit.failed_checks.length !== 0) fail("No scoring/correlation failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (readiness.status !== "ready_for_ag50d_model_output_academic_result_correlation_design") fail("AG50D readiness status mismatch.");
if (readiness.ready_for_ag50d !== true) fail("AG50D readiness must be true.");
if (readiness.next_stage_id !== "AG50D") fail("Readiness must point to AG50D.");
if (!readiness.ag50d_allowed_scope.includes("Define correlation, regression, bivariate/multivariate and trend-analysis design.")) fail("AG50D statistical design scope missing.");
if (!readiness.ag50d_blocked_scope.includes("Model-output correlation runtime")) fail("AG50D must block correlation runtime.");

if (boundary.next_stage_id !== "AG50D") fail("Boundary must point to AG50D.");

for (const key of [
  "ag50c_age_adaptive_workflow_design_recorded",
  "ag50b_consumed",
  "class5_7_workflow_design_recorded",
  "class8_10_workflow_design_recorded",
  "class11_onward_workflow_design_recorded",
  "item_task_input_category_map_recorded",
  "agent_interface_design_recorded",
  "support_output_boundary_recorded",
  "workflow_risk_controls_recorded",
  "ready_for_ag50d_model_output_academic_result_correlation_design"
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

if (!pkg.scripts?.["generate:ag50c"]) fail("Missing package script: generate:ag50c");
if (!pkg.scripts?.["validate:ag50c"]) fail("Missing package script: validate:ag50c");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag50c")) fail("validate:project must include validate:ag50c.");

pass("AG50C Age-Adaptive Psychometric Workflow Design is present.");
pass("AG50B inputs are consumed.");
pass("Class 5–7 workflow design is valid.");
pass("Class 8–10 workflow design is valid.");
pass("Class 11 onward workflow design is valid.");
pass("Item/task/input category map is valid.");
pass("Agent interface design is valid.");
pass("Human-reviewed support-output boundary is valid.");
pass("Workflow risk controls are valid.");
pass("No student data collection audit is valid.");
pass("No assessment runtime audit is valid.");
pass("No scoring/correlation runtime audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("AG50D model-output academic-result correlation design readiness is valid.");
