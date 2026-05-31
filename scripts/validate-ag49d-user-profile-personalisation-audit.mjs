import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG49D validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag49a-user-profile-model-consumption-gap-review.json",
  "data/content-intelligence/user-personalisation/ag49a-user-profile-model-consumption-record.json",
  "data/content-intelligence/user-personalisation/ag49a-subscriber-personalisation-schema-consumption-record.json",
  "data/content-intelligence/user-personalisation/ag49a-profile-field-gap-register.json",
  "data/content-intelligence/user-personalisation/ag49a-disabled-now-state-register.json",
  "data/content-intelligence/user-personalisation/ag49a-privacy-risk-precheck-record.json",
  "data/content-intelligence/backend-architecture/ag49a-no-auth-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag49a-no-personal-data-collection-audit.json",
  "data/content-intelligence/backend-architecture/ag49a-no-runtime-api-deployment-audit.json",

  "data/content-intelligence/quality-reviews/ag49b-consent-entitlement-sensitive-data-gate.json",
  "data/content-intelligence/user-personalisation/ag49b-consent-model-gate-record.json",
  "data/content-intelligence/user-personalisation/ag49b-entitlement-access-basis-gate-record.json",
  "data/content-intelligence/user-personalisation/ag49b-sensitive-data-classification-register.json",
  "data/content-intelligence/user-personalisation/ag49b-blocked-by-default-field-register.json",
  "data/content-intelligence/user-personalisation/ag49b-data-minimisation-non-personalised-fallback-rules.json",
  "data/content-intelligence/user-personalisation/ag49b-consent-withdrawal-export-deletion-boundary.json",
  "data/content-intelligence/backend-architecture/ag49b-no-auth-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag49b-no-personal-data-collection-audit.json",
  "data/content-intelligence/backend-architecture/ag49b-no-runtime-api-deployment-audit.json",

  "data/content-intelligence/quality-reviews/ag49c-personalisation-logic-safety.json",
  "data/content-intelligence/user-personalisation/ag49c-personalisation-logic-boundary-record.json",
  "data/content-intelligence/user-personalisation/ag49c-non-deterministic-output-safety-record.json",
  "data/content-intelligence/user-personalisation/ag49c-sensitive-field-dependency-blocker.json",
  "data/content-intelligence/user-personalisation/ag49c-non-personalised-fallback-logic-record.json",
  "data/content-intelligence/user-personalisation/ag49c-personalisation-claim-language-safety-rules.json",
  "data/content-intelligence/user-personalisation/ag49c-ag49d-integration-gap-register.json",
  "data/content-intelligence/backend-architecture/ag49c-no-auth-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag49c-no-personal-data-collection-audit.json",
  "data/content-intelligence/backend-architecture/ag49c-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag49c-no-personalised-output-generation-audit.json",
  "data/content-intelligence/quality-registry/ag49c-ag49d-user-profile-personalisation-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag49c-to-ag49d-user-profile-personalisation-audit-boundary.json",
  "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag49d-user-profile-personalisation-integration-audit.json",
  "data/content-intelligence/user-personalisation/ag49d-integrated-user-profile-personalisation-audit.json",
  "data/content-intelligence/user-personalisation/ag49d-consent-sensitive-continuity-audit.json",
  "data/content-intelligence/user-personalisation/ag49d-personalisation-nondeterministic-safety-audit.json",
  "data/content-intelligence/user-personalisation/ag49d-disabled-now-runtime-posture-audit.json",
  "data/content-intelligence/user-personalisation/ag49d-ag49z-closure-gap-register.json",
  "data/content-intelligence/backend-architecture/ag49d-no-auth-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag49d-no-personal-data-collection-audit.json",
  "data/content-intelligence/backend-architecture/ag49d-no-personalised-output-generation-audit.json",
  "data/content-intelligence/backend-architecture/ag49d-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/quality-registry/ag49d-ag49z-user-profile-personalisation-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag49d-to-ag49z-user-profile-personalisation-closure-boundary.json",
  "data/quality/ag49d-user-profile-personalisation-integration-audit.json",
  "data/quality/ag49d-user-profile-personalisation-integration-audit-preview.json",
  "docs/quality/AG49D_USER_PROFILE_PERSONALISATION_INTEGRATION_AUDIT.md",
  "scripts/generate-ag49d-user-profile-personalisation-audit.mjs",
  "scripts/validate-ag49d-user-profile-personalisation-audit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag49aReview = readJson("data/content-intelligence/quality-reviews/ag49a-user-profile-model-consumption-gap-review.json");
const ag49aModel = readJson("data/content-intelligence/user-personalisation/ag49a-user-profile-model-consumption-record.json");
const ag49aDisabled = readJson("data/content-intelligence/user-personalisation/ag49a-disabled-now-state-register.json");
const ag49aNoAuth = readJson("data/content-intelligence/backend-architecture/ag49a-no-auth-activation-audit.json");
const ag49aNoPersonalData = readJson("data/content-intelligence/backend-architecture/ag49a-no-personal-data-collection-audit.json");
const ag49aNoRuntime = readJson("data/content-intelligence/backend-architecture/ag49a-no-runtime-api-deployment-audit.json");

const ag49bReview = readJson("data/content-intelligence/quality-reviews/ag49b-consent-entitlement-sensitive-data-gate.json");
const ag49bConsent = readJson("data/content-intelligence/user-personalisation/ag49b-consent-model-gate-record.json");
const ag49bEntitlement = readJson("data/content-intelligence/user-personalisation/ag49b-entitlement-access-basis-gate-record.json");
const ag49bSensitive = readJson("data/content-intelligence/user-personalisation/ag49b-sensitive-data-classification-register.json");
const ag49bBlockedFields = readJson("data/content-intelligence/user-personalisation/ag49b-blocked-by-default-field-register.json");
const ag49bMinimisation = readJson("data/content-intelligence/user-personalisation/ag49b-data-minimisation-non-personalised-fallback-rules.json");
const ag49bNoAuth = readJson("data/content-intelligence/backend-architecture/ag49b-no-auth-activation-audit.json");
const ag49bNoPersonalData = readJson("data/content-intelligence/backend-architecture/ag49b-no-personal-data-collection-audit.json");
const ag49bNoRuntime = readJson("data/content-intelligence/backend-architecture/ag49b-no-runtime-api-deployment-audit.json");

const ag49cReview = readJson("data/content-intelligence/quality-reviews/ag49c-personalisation-logic-safety.json");
const ag49cLogic = readJson("data/content-intelligence/user-personalisation/ag49c-personalisation-logic-boundary-record.json");
const ag49cNondeterministic = readJson("data/content-intelligence/user-personalisation/ag49c-non-deterministic-output-safety-record.json");
const ag49cSensitiveBlocker = readJson("data/content-intelligence/user-personalisation/ag49c-sensitive-field-dependency-blocker.json");
const ag49cFallback = readJson("data/content-intelligence/user-personalisation/ag49c-non-personalised-fallback-logic-record.json");
const ag49cGap = readJson("data/content-intelligence/user-personalisation/ag49c-ag49d-integration-gap-register.json");
const ag49cNoAuth = readJson("data/content-intelligence/backend-architecture/ag49c-no-auth-activation-audit.json");
const ag49cNoPersonalData = readJson("data/content-intelligence/backend-architecture/ag49c-no-personal-data-collection-audit.json");
const ag49cNoRuntime = readJson("data/content-intelligence/backend-architecture/ag49c-no-runtime-api-deployment-audit.json");
const ag49cNoPersonalisedOutput = readJson("data/content-intelligence/backend-architecture/ag49c-no-personalised-output-generation-audit.json");
const ag49cReadiness = readJson("data/content-intelligence/quality-registry/ag49c-ag49d-user-profile-personalisation-audit-readiness-record.json");
const ag49cBoundary = readJson("data/content-intelligence/mutation-plans/ag49c-to-ag49d-user-profile-personalisation-audit-boundary.json");
const ag47rSourceOfTruth = readJson("data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag49aReview.status !== "user_profile_model_consumed_ready_for_ag49b") fail("AG49A review status mismatch.");
if (ag49aModel.model_boundary.activate_accounts_now !== false) fail("AG49A accounts must remain disabled.");
if (ag49aModel.model_boundary.collect_personal_data_now !== false) fail("AG49A personal data collection must remain disabled.");
if (ag49aDisabled.disabled_now_states.auth_activation !== false) fail("AG49A auth disabled-now mismatch.");
if (ag49aNoAuth.audit_passed !== true) fail("AG49A no-auth audit must pass.");
if (ag49aNoPersonalData.audit_passed !== true) fail("AG49A no-personal-data audit must pass.");
if (ag49aNoRuntime.audit_passed !== true) fail("AG49A no-runtime audit must pass.");

if (ag49bReview.status !== "consent_entitlement_sensitive_data_gate_ready_for_ag49c") fail("AG49B review status mismatch.");
if (ag49bConsent.consent_model_position.consent_runtime_enabled_now !== false) fail("AG49B consent runtime must remain disabled.");
if (ag49bEntitlement.entitlement_position.entitlement_runtime_enabled_now !== false) fail("AG49B entitlement runtime must remain disabled.");
if (ag49bSensitive.default_sensitive_field_position !== "blocked_by_default") fail("Sensitive fields must be blocked by default.");
if (!ag49bBlockedFields.blocked_by_default_fields.includes("date_of_birth")) fail("date_of_birth must remain blocked.");
if (ag49bMinimisation.fallback_position.non_personalised_fallback_required !== true) fail("Non-personalised fallback must be required.");
if (ag49bNoAuth.audit_passed !== true) fail("AG49B no-auth audit must pass.");
if (ag49bNoPersonalData.audit_passed !== true) fail("AG49B no-personal-data audit must pass.");
if (ag49bNoRuntime.audit_passed !== true) fail("AG49B no-runtime audit must pass.");

if (ag49cReview.status !== "personalisation_logic_safety_ready_for_ag49d") fail("AG49C review status mismatch.");
if (ag49cLogic.logic_position.personalisation_runtime_enabled_now !== false) fail("AG49C personalisation runtime must be disabled.");
if (ag49cLogic.logic_position.personalised_astrology_enabled_now !== false) fail("AG49C personalised astrology must be disabled.");
if (ag49cNondeterministic.deterministic_prediction_enabled_now !== false) fail("AG49C deterministic prediction must be disabled.");
if (ag49cSensitiveBlocker.sensitive_dependency_runtime_enabled_now !== false) fail("AG49C sensitive dependency runtime must be disabled.");
if (ag49cFallback.fallback_position.non_personalised_fallback_required !== true) fail("AG49C fallback must be required.");
if (ag49cGap.ag49d_audit_allowed !== true) fail("AG49D audit must be allowed.");
if (ag49cGap.blocking_gaps_for_ag49d.length !== 0) fail("AG49D blocking gaps must be zero.");
if (ag49cNoAuth.audit_passed !== true) fail("AG49C no-auth audit must pass.");
if (ag49cNoPersonalData.audit_passed !== true) fail("AG49C no-personal-data audit must pass.");
if (ag49cNoRuntime.audit_passed !== true) fail("AG49C no-runtime audit must pass.");
if (ag49cNoPersonalisedOutput.audit_passed !== true) fail("AG49C no-personalised-output audit must pass.");
if (ag49cReadiness.ready_for_ag49d !== true) fail("AG49C readiness must permit AG49D.");
if (ag49cBoundary.next_stage_id !== "AG49D") fail("AG49C boundary must point to AG49D.");

if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG49 remains User Accounts and Personalisation")) fail("AG49 source-of-truth missing.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag49d-user-profile-personalisation-integration-audit.json");
const integratedAudit = readJson("data/content-intelligence/user-personalisation/ag49d-integrated-user-profile-personalisation-audit.json");
const consentSensitiveContinuityAudit = readJson("data/content-intelligence/user-personalisation/ag49d-consent-sensitive-continuity-audit.json");
const personalisationSafetyAudit = readJson("data/content-intelligence/user-personalisation/ag49d-personalisation-nondeterministic-safety-audit.json");
const disabledRuntimePostureAudit = readJson("data/content-intelligence/user-personalisation/ag49d-disabled-now-runtime-posture-audit.json");
const ag49zClosureGapRegister = readJson("data/content-intelligence/user-personalisation/ag49d-ag49z-closure-gap-register.json");
const noAuthActivationAudit = readJson("data/content-intelligence/backend-architecture/ag49d-no-auth-activation-audit.json");
const noPersonalDataCollectionAudit = readJson("data/content-intelligence/backend-architecture/ag49d-no-personal-data-collection-audit.json");
const noPersonalisedOutputAudit = readJson("data/content-intelligence/backend-architecture/ag49d-no-personalised-output-generation-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag49d-no-runtime-api-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag49d-ag49z-user-profile-personalisation-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag49d-to-ag49z-user-profile-personalisation-closure-boundary.json");
const preview = readJson("data/quality/ag49d-user-profile-personalisation-integration-audit-preview.json");
const pkg = readJson("package.json");

if (review.status !== "user_profile_personalisation_audit_ready_for_ag49z") fail("AG49D review status mismatch.");

for (const key of [
  "ag49d_user_profile_personalisation_audit_recorded",
  "ag49a_ag49b_ag49c_consumed",
  "user_profile_consent_personalisation_boundaries_consistent",
  "consent_sensitive_continuity_audited",
  "personalisation_nondeterministic_safety_audited",
  "disabled_now_runtime_posture_audited",
  "ag49z_closure_gap_register_recorded",
  "ready_for_ag49z_user_profile_personalisation_closure"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag49z !== 0) fail("AG49Z blocker count must be zero.");

for (const key of [
  "auth_activation_approved_now",
  "auth_activation_performed",
  "user_account_creation_enabled",
  "profile_creation_enabled",
  "personal_data_collection_enabled",
  "consent_collection_enabled",
  "entitlement_runtime_enabled",
  "birth_detail_collection_enabled",
  "sensitive_data_collection_enabled",
  "location_collection_enabled",
  "religious_practice_collection_enabled",
  "psychometric_data_collection_enabled",
  "personalised_reflection_enabled",
  "personalised_guidance_generation_enabled",
  "personalised_astrology_enabled",
  "deterministic_prediction_enabled",
  "automated_sensitive_inference_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_personalised_output_generated",
  "public_content_generated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (integratedAudit.status !== "integrated_user_profile_personalisation_audit_passed") fail("Integrated audit status mismatch.");
if (integratedAudit.audit_result !== "passed") fail("Integrated audit must pass.");

if (consentSensitiveContinuityAudit.status !== "consent_sensitive_continuity_audit_passed") fail("Consent/sensitive continuity status mismatch.");
if (consentSensitiveContinuityAudit.audit_result !== "passed") fail("Consent/sensitive continuity audit must pass.");
if (!JSON.stringify(consentSensitiveContinuityAudit.continuity_checks).includes("Sensitive fields remain blocked by default")) fail("Sensitive continuity check missing.");

if (personalisationSafetyAudit.status !== "personalisation_nondeterministic_safety_audit_passed") fail("Personalisation safety audit status mismatch.");
if (personalisationSafetyAudit.audit_result !== "passed") fail("Personalisation safety audit must pass.");
if (!personalisationSafetyAudit.safety_checks.includes("No deterministic prediction.")) fail("No deterministic prediction safety check missing.");

if (disabledRuntimePostureAudit.status !== "disabled_now_runtime_posture_audit_passed") fail("Disabled runtime posture status mismatch.");
if (disabledRuntimePostureAudit.audit_result !== "passed") fail("Disabled runtime posture audit must pass.");
if (!disabledRuntimePostureAudit.disabled_posture_confirmed.includes("Auth activation disabled")) fail("Auth disabled posture missing.");

if (ag49zClosureGapRegister.status !== "ag49z_closure_gap_register_recorded") fail("AG49Z closure gap register status mismatch.");
if (ag49zClosureGapRegister.blocking_gaps_for_ag49z.length !== 0) fail("AG49Z blocking gaps must be zero.");
if (ag49zClosureGapRegister.ag49z_closure_allowed !== true) fail("AG49Z closure must be allowed.");

if (noAuthActivationAudit.audit_passed !== true) fail("No Auth activation audit must pass.");
if (noAuthActivationAudit.failed_checks.length !== 0) fail("No Auth failed checks must be zero.");

if (noPersonalDataCollectionAudit.audit_passed !== true) fail("No personal data collection audit must pass.");
if (noPersonalDataCollectionAudit.failed_checks.length !== 0) fail("No personal-data failed checks must be zero.");

if (noPersonalisedOutputAudit.audit_passed !== true) fail("No personalised output audit must pass.");
if (noPersonalisedOutputAudit.failed_checks.length !== 0) fail("No personalised output failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (readiness.status !== "ready_for_ag49z_user_profile_personalisation_closure") fail("AG49Z readiness status mismatch.");
if (readiness.ready_for_ag49z !== true) fail("AG49Z readiness must be true.");
if (readiness.next_stage_id !== "AG49Z") fail("Readiness must point to AG49Z.");
if (!readiness.ag49z_allowed_scope.includes("Close AG49 User Accounts and Personalisation readiness.")) fail("AG49Z closure scope missing.");
if (!readiness.ag49z_blocked_scope.includes("Personalised reflection/guidance generation")) fail("AG49Z must block personalised output generation.");

if (boundary.next_stage_id !== "AG49Z") fail("Boundary must point to AG49Z.");

for (const key of [
  "ag49d_user_profile_personalisation_audit_recorded",
  "ag49a_ag49b_ag49c_consumed",
  "user_profile_consent_personalisation_boundaries_consistent",
  "consent_sensitive_continuity_audited",
  "personalisation_nondeterministic_safety_audited",
  "disabled_now_runtime_posture_audited",
  "ag49z_closure_gap_register_recorded",
  "ready_for_ag49z_user_profile_personalisation_closure"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "auth_activation_approved_now",
  "auth_activation_performed",
  "user_account_creation_enabled",
  "profile_creation_enabled",
  "personal_data_collection_enabled",
  "consent_collection_enabled",
  "entitlement_runtime_enabled",
  "birth_detail_collection_enabled",
  "sensitive_data_collection_enabled",
  "location_collection_enabled",
  "religious_practice_collection_enabled",
  "psychometric_data_collection_enabled",
  "personalised_reflection_enabled",
  "personalised_guidance_generation_enabled",
  "personalised_astrology_enabled",
  "deterministic_prediction_enabled",
  "automated_sensitive_inference_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_personalised_output_generated",
  "public_content_generated"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag49d"]) fail("Missing package script: generate:ag49d");
if (!pkg.scripts?.["validate:ag49d"]) fail("Missing package script: validate:ag49d");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag49d")) fail("validate:project must include validate:ag49d.");

pass("AG49D User/Profile and Personalisation Integration Audit is present.");
pass("AG49A, AG49B and AG49C inputs are consumed.");
pass("Integrated user/profile personalisation audit is valid.");
pass("Consent and sensitive-data continuity audit is valid.");
pass("Personalisation non-deterministic safety audit is valid.");
pass("Disabled-now runtime posture audit is valid.");
pass("AG49Z closure gap register is valid.");
pass("No Auth activation audit is valid.");
pass("No personal data collection audit is valid.");
pass("No personalised output generation audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("AG49Z User/Profile Personalisation Closure readiness is valid.");
