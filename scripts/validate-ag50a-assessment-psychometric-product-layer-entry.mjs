import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG50A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag49z-user-profile-personalisation-closure.json",
  "data/content-intelligence/user-personalisation/ag49z-user-profile-personalisation-closure-record.json",
  "data/content-intelligence/user-personalisation/ag49z-carry-forward-deferral-register.json",
  "data/content-intelligence/user-personalisation/ag49z-user-surface-closure-position.json",
  "data/content-intelligence/ag-roadmap/ag49z-ag50a-assessment-product-layer-handoff.json",
  "data/content-intelligence/quality-registry/ag49z-ag50a-assessment-product-layer-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag49z-to-ag50a-assessment-product-layer-boundary.json",
  "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

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
  "data/quality/ag50a-assessment-psychometric-product-layer-entry.json",
  "data/quality/ag50a-assessment-psychometric-product-layer-entry-preview.json",
  "docs/quality/AG50A_ASSESSMENT_PSYCHOMETRIC_PRODUCT_LAYER_ENTRY.md",
  "scripts/generate-ag50a-assessment-psychometric-product-layer-entry.mjs",
  "scripts/validate-ag50a-assessment-psychometric-product-layer-entry.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag49zReview = readJson("data/content-intelligence/quality-reviews/ag49z-user-profile-personalisation-closure.json");
const ag49zClosure = readJson("data/content-intelligence/user-personalisation/ag49z-user-profile-personalisation-closure-record.json");
const ag49zDeferral = readJson("data/content-intelligence/user-personalisation/ag49z-carry-forward-deferral-register.json");
const ag49zUserSurface = readJson("data/content-intelligence/user-personalisation/ag49z-user-surface-closure-position.json");
const ag49zHandoff = readJson("data/content-intelligence/ag-roadmap/ag49z-ag50a-assessment-product-layer-handoff.json");
const ag49zReadiness = readJson("data/content-intelligence/quality-registry/ag49z-ag50a-assessment-product-layer-readiness-record.json");
const ag49zBoundary = readJson("data/content-intelligence/mutation-plans/ag49z-to-ag50a-assessment-product-layer-boundary.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag49zReview.status !== "user_profile_personalisation_closed_ready_for_ag50a") fail("AG49Z review status mismatch.");
if (ag49zClosure.status !== "user_profile_personalisation_closure_completed") fail("AG49Z closure status mismatch.");
const psychometricDeferralEvidence = [
  ...(ag49zDeferral.deferred_items || []),
  ...(ag49zUserSurface.blocked_for_v01_without_later_approval || []),
  ...(ag49zReadiness.ag50a_blocked_scope || [])
].some((item) => String(item).toLowerCase().includes("psychometric"));

if (!psychometricDeferralEvidence) fail("Psychometric data/runtime deferral must be evidenced.");
if (!ag49zUserSurface.blocked_for_v01_without_later_approval.includes("assessment or psychometric runtime")) fail("Assessment/psychometric runtime must be blocked.");
if (ag49zHandoff.next_stage_id !== "AG50A") fail("AG49Z handoff must point to AG50A.");
if (ag49zReadiness.ready_for_ag50a !== true) fail("AG49Z readiness must permit AG50A.");
if (ag49zBoundary.next_stage_id !== "AG50A") fail("AG49Z boundary must point to AG50A.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag50a-assessment-psychometric-product-layer-entry.json");
const doctrine = readJson("data/content-intelligence/assessment-psychometrics/ag50a-class5-onward-assessment-doctrine.json");
const ageBandModel = readJson("data/content-intelligence/assessment-psychometrics/ag50a-age-adaptive-band-model.json");
const architecture = readJson("data/content-intelligence/assessment-psychometrics/ag50a-multi-agent-assessment-architecture.json");
const methodology = readJson("data/content-intelligence/assessment-psychometrics/ag50a-methodology-and-validation-approach.json");
const childMinorBlocker = readJson("data/content-intelligence/assessment-psychometrics/ag50a-child-minor-data-blocker.json");
const nonDiagnosticBoundary = readJson("data/content-intelligence/assessment-psychometrics/ag50a-non-diagnostic-non-deterministic-boundary.json");
const noStudentDataAudit = readJson("data/content-intelligence/backend-architecture/ag50a-no-student-data-collection-audit.json");
const noRuntimeScoringAudit = readJson("data/content-intelligence/backend-architecture/ag50a-no-assessment-runtime-scoring-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag50a-no-runtime-api-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag50a-ag50b-child-minor-consent-school-permission-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag50a-to-ag50b-child-minor-consent-school-permission-boundary.json");
const preview = readJson("data/quality/ag50a-assessment-psychometric-product-layer-entry-preview.json");
const pkg = readJson("package.json");

if (review.status !== "assessment_psychometric_product_layer_entry_ready_for_ag50b") fail("AG50A review status mismatch.");

for (const key of [
  "ag50a_assessment_psychometric_entry_recorded",
  "ag49z_consumed",
  "class5_onward_doctrine_recorded",
  "age_adaptive_band_model_recorded",
  "multi_agent_architecture_recorded",
  "methodology_validation_approach_recorded",
  "child_minor_data_blocker_recorded",
  "non_diagnostic_non_deterministic_boundary_recorded",
  "ready_for_ag50b_child_minor_consent_school_permission_gate"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag50b !== 0) fail("AG50B blocker count must be zero.");

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
  "ai_generated_student_report_enabled",
  "diagnosis_enabled",
  "deterministic_career_prediction_enabled",
  "student_ranking_enabled",
  "auth_activation_approved_now",
  "auth_activation_performed",
  "user_account_creation_enabled",
  "profile_creation_enabled",
  "personal_data_collection_enabled",
  "birth_detail_collection_enabled",
  "sensitive_data_collection_enabled",
  "psychometric_data_collection_enabled",
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

if (doctrine.status !== "class5_onward_assessment_doctrine_recorded") fail("Doctrine status mismatch.");
if (doctrine.assessment_start_point.minimum_class_for_future_psychometric_layer !== "Class 5") fail("Minimum class must be Class 5.");
if (!doctrine.explicitly_not_for.includes("diagnosis")) fail("Diagnosis must be explicitly excluded.");
if (!doctrine.explicitly_not_for.includes("deterministic career prediction")) fail("Deterministic career prediction must be excluded.");

if (ageBandModel.status !== "age_adaptive_band_model_recorded") fail("Age-band model status mismatch.");
if (!JSON.stringify(ageBandModel.class_bands).includes("Class 5 to 7")) fail("Class 5 to 7 band missing.");
if (!JSON.stringify(ageBandModel.class_bands).includes("no career-stream prediction")) fail("Class 5-7 career prediction blocker missing.");

if (architecture.status !== "multi_agent_architecture_recorded") fail("Architecture status mismatch.");
for (const layer of ["Agent 1 assessment output collector", "Agent 2 correlation and validation engine", "Agent 3 contradiction/error flagging agent", "Human review layer"]) {
  if (!JSON.stringify(architecture.architecture_layers).includes(layer)) fail(`Architecture missing ${layer}.`);
}

if (methodology.status !== "methodology_validation_approach_recorded") fail("Methodology status mismatch.");
for (const method of ["correlation analysis", "multivariate regression", "model-output versus actual-outcome comparison"]) {
  if (!methodology.statistical_methods_for_future_design.includes(method)) fail(`Methodology missing ${method}.`);
}
if (methodology.runtime_position !== "methodology_only_not_executed") fail("Methodology must be not executed.");

if (childMinorBlocker.status !== "child_minor_data_blocker_recorded") fail("Child/minor blocker status mismatch.");
for (const field of ["student identity", "academic result", "psychometric response", "child/minor profile"]) {
  if (!childMinorBlocker.protected_data_categories_blocked_now.includes(field)) fail(`Blocked child/minor category missing: ${field}`);
}

if (nonDiagnosticBoundary.status !== "non_diagnostic_non_deterministic_boundary_recorded") fail("Non-diagnostic boundary status mismatch.");
if (nonDiagnosticBoundary.deterministic_output_position !== "blocked") fail("Deterministic output must be blocked.");
if (nonDiagnosticBoundary.diagnostic_output_position !== "blocked") fail("Diagnostic output must be blocked.");

if (noStudentDataAudit.audit_passed !== true) fail("No student data audit must pass.");
if (noStudentDataAudit.failed_checks.length !== 0) fail("No student data failed checks must be zero.");

if (noRuntimeScoringAudit.audit_passed !== true) fail("No runtime scoring audit must pass.");
if (noRuntimeScoringAudit.failed_checks.length !== 0) fail("No runtime scoring failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (readiness.status !== "ready_for_ag50b_child_minor_consent_school_permission_gate") fail("AG50B readiness status mismatch.");
if (readiness.ready_for_ag50b !== true) fail("AG50B readiness must be true.");
if (readiness.next_stage_id !== "AG50B") fail("Readiness must point to AG50B.");
if (!readiness.ag50b_allowed_scope.includes("Define guardian consent gate.")) fail("Guardian consent gate scope missing.");
if (!readiness.ag50b_blocked_scope.includes("Psychometric test runtime")) fail("AG50B must block psychometric runtime.");

if (boundary.next_stage_id !== "AG50B") fail("Boundary must point to AG50B.");

for (const key of [
  "ag50a_assessment_psychometric_entry_recorded",
  "ag49z_consumed",
  "class5_onward_doctrine_recorded",
  "age_adaptive_band_model_recorded",
  "multi_agent_architecture_recorded",
  "methodology_validation_approach_recorded",
  "child_minor_data_blocker_recorded",
  "non_diagnostic_non_deterministic_boundary_recorded",
  "ready_for_ag50b_child_minor_consent_school_permission_gate"
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
  "ai_generated_student_report_enabled",
  "diagnosis_enabled",
  "deterministic_career_prediction_enabled",
  "student_ranking_enabled",
  "auth_activation_approved_now",
  "auth_activation_performed",
  "user_account_creation_enabled",
  "profile_creation_enabled",
  "personal_data_collection_enabled",
  "birth_detail_collection_enabled",
  "sensitive_data_collection_enabled",
  "psychometric_data_collection_enabled",
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

if (!pkg.scripts?.["generate:ag50a"]) fail("Missing package script: generate:ag50a");
if (!pkg.scripts?.["validate:ag50a"]) fail("Missing package script: validate:ag50a");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag50a")) fail("validate:project must include validate:ag50a.");

pass("AG50A Assessment/Psychometric Product Layer Entry is present.");
pass("AG49Z handoff is consumed.");
pass("Class 5 onward assessment doctrine is valid.");
pass("Age-adaptive band model is valid.");
pass("Multi-agent architecture is valid.");
pass("Methodology and validation approach is valid.");
pass("Child/minor data blocker is valid.");
pass("Non-diagnostic and non-deterministic boundary is valid.");
pass("No student data collection audit is valid.");
pass("No assessment runtime scoring audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("AG50B child/minor consent and school permission readiness is valid.");
