import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG49Z validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",

  "data/content-intelligence/quality-reviews/ag49a-user-profile-model-consumption-gap-review.json",
  "data/content-intelligence/user-personalisation/ag49a-user-profile-model-consumption-record.json",
  "data/content-intelligence/user-personalisation/ag49a-subscriber-personalisation-schema-consumption-record.json",
  "data/content-intelligence/user-personalisation/ag49a-profile-field-gap-register.json",
  "data/content-intelligence/user-personalisation/ag49a-disabled-now-state-register.json",
  "data/content-intelligence/user-personalisation/ag49a-privacy-risk-precheck-record.json",

  "data/content-intelligence/quality-reviews/ag49b-consent-entitlement-sensitive-data-gate.json",
  "data/content-intelligence/user-personalisation/ag49b-consent-model-gate-record.json",
  "data/content-intelligence/user-personalisation/ag49b-entitlement-access-basis-gate-record.json",
  "data/content-intelligence/user-personalisation/ag49b-sensitive-data-classification-register.json",
  "data/content-intelligence/user-personalisation/ag49b-blocked-by-default-field-register.json",
  "data/content-intelligence/user-personalisation/ag49b-data-minimisation-non-personalised-fallback-rules.json",
  "data/content-intelligence/user-personalisation/ag49b-consent-withdrawal-export-deletion-boundary.json",

  "data/content-intelligence/quality-reviews/ag49c-personalisation-logic-safety.json",
  "data/content-intelligence/user-personalisation/ag49c-personalisation-logic-boundary-record.json",
  "data/content-intelligence/user-personalisation/ag49c-non-deterministic-output-safety-record.json",
  "data/content-intelligence/user-personalisation/ag49c-sensitive-field-dependency-blocker.json",
  "data/content-intelligence/user-personalisation/ag49c-non-personalised-fallback-logic-record.json",
  "data/content-intelligence/user-personalisation/ag49c-personalisation-claim-language-safety-rules.json",

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

  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag49z-user-profile-personalisation-closure.json",
  "data/content-intelligence/user-personalisation/ag49z-user-profile-personalisation-closure-record.json",
  "data/content-intelligence/user-personalisation/ag49z-ag49a-to-ag49d-consumption-summary.json",
  "data/content-intelligence/user-personalisation/ag49z-carry-forward-deferral-register.json",
  "data/content-intelligence/user-personalisation/ag49z-user-surface-closure-position.json",
  "data/content-intelligence/ag-roadmap/ag49z-ag50a-assessment-product-layer-handoff.json",
  "data/content-intelligence/backend-architecture/ag49z-no-auth-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag49z-no-personal-data-collection-audit.json",
  "data/content-intelligence/backend-architecture/ag49z-no-personalised-output-generation-audit.json",
  "data/content-intelligence/backend-architecture/ag49z-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag49z-no-secret-exposure-audit.json",
  "data/content-intelligence/quality-registry/ag49z-ag50a-assessment-product-layer-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag49z-to-ag50a-assessment-product-layer-boundary.json",
  "data/quality/ag49z-user-profile-personalisation-closure.json",
  "data/quality/ag49z-user-profile-personalisation-closure-preview.json",
  "docs/quality/AG49Z_USER_PROFILE_PERSONALISATION_CLOSURE.md",
  "scripts/generate-ag49z-user-profile-personalisation-closure.mjs",
  "scripts/validate-ag49z-user-profile-personalisation-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag47rSourceOfTruth = readJson("data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG49 remains User Accounts and Personalisation")) fail("AG49 source-of-truth missing.");

const ag49aReview = readJson("data/content-intelligence/quality-reviews/ag49a-user-profile-model-consumption-gap-review.json");
const ag49aModel = readJson("data/content-intelligence/user-personalisation/ag49a-user-profile-model-consumption-record.json");
const ag49aDisabled = readJson("data/content-intelligence/user-personalisation/ag49a-disabled-now-state-register.json");

const ag49bReview = readJson("data/content-intelligence/quality-reviews/ag49b-consent-entitlement-sensitive-data-gate.json");
const ag49bConsent = readJson("data/content-intelligence/user-personalisation/ag49b-consent-model-gate-record.json");
const ag49bSensitive = readJson("data/content-intelligence/user-personalisation/ag49b-sensitive-data-classification-register.json");
const ag49bBlockedFields = readJson("data/content-intelligence/user-personalisation/ag49b-blocked-by-default-field-register.json");

const ag49cReview = readJson("data/content-intelligence/quality-reviews/ag49c-personalisation-logic-safety.json");
const ag49cLogic = readJson("data/content-intelligence/user-personalisation/ag49c-personalisation-logic-boundary-record.json");
const ag49cNondeterministic = readJson("data/content-intelligence/user-personalisation/ag49c-non-deterministic-output-safety-record.json");
const ag49cSensitiveBlocker = readJson("data/content-intelligence/user-personalisation/ag49c-sensitive-field-dependency-blocker.json");

const ag49dReview = readJson("data/content-intelligence/quality-reviews/ag49d-user-profile-personalisation-integration-audit.json");
const ag49dIntegratedAudit = readJson("data/content-intelligence/user-personalisation/ag49d-integrated-user-profile-personalisation-audit.json");
const ag49dRuntimeAudit = readJson("data/content-intelligence/user-personalisation/ag49d-disabled-now-runtime-posture-audit.json");
const ag49dGapRegister = readJson("data/content-intelligence/user-personalisation/ag49d-ag49z-closure-gap-register.json");
const ag49dNoAuth = readJson("data/content-intelligence/backend-architecture/ag49d-no-auth-activation-audit.json");
const ag49dNoPersonalData = readJson("data/content-intelligence/backend-architecture/ag49d-no-personal-data-collection-audit.json");
const ag49dNoPersonalisedOutput = readJson("data/content-intelligence/backend-architecture/ag49d-no-personalised-output-generation-audit.json");
const ag49dNoRuntime = readJson("data/content-intelligence/backend-architecture/ag49d-no-runtime-api-deployment-audit.json");
const ag49dReadiness = readJson("data/content-intelligence/quality-registry/ag49d-ag49z-user-profile-personalisation-closure-readiness-record.json");
const ag49dBoundary = readJson("data/content-intelligence/mutation-plans/ag49d-to-ag49z-user-profile-personalisation-closure-boundary.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag49aReview.status !== "user_profile_model_consumed_ready_for_ag49b") fail("AG49A review status mismatch.");
if (ag49aModel.model_boundary.activate_accounts_now !== false) fail("AG49A accounts must remain disabled.");
if (ag49aModel.model_boundary.collect_personal_data_now !== false) fail("AG49A personal data collection must remain disabled.");
if (ag49aDisabled.disabled_now_states.auth_activation !== false) fail("AG49A auth disabled-now mismatch.");

if (ag49bReview.status !== "consent_entitlement_sensitive_data_gate_ready_for_ag49c") fail("AG49B review status mismatch.");
if (ag49bConsent.consent_model_position.consent_runtime_enabled_now !== false) fail("AG49B consent runtime must remain disabled.");
if (ag49bSensitive.default_sensitive_field_position !== "blocked_by_default") fail("Sensitive fields must remain blocked by default.");
if (!ag49bBlockedFields.blocked_by_default_fields.includes("date_of_birth")) fail("date_of_birth must remain blocked.");

if (ag49cReview.status !== "personalisation_logic_safety_ready_for_ag49d") fail("AG49C review status mismatch.");
if (ag49cLogic.logic_position.personalisation_runtime_enabled_now !== false) fail("AG49C personalisation runtime must remain disabled.");
if (ag49cLogic.logic_position.personalised_astrology_enabled_now !== false) fail("AG49C personalised astrology must remain disabled.");
if (ag49cNondeterministic.deterministic_prediction_enabled_now !== false) fail("AG49C deterministic prediction must remain disabled.");
if (ag49cSensitiveBlocker.sensitive_dependency_runtime_enabled_now !== false) fail("AG49C sensitive dependency runtime must remain disabled.");

if (ag49dReview.status !== "user_profile_personalisation_audit_ready_for_ag49z") fail("AG49D review status mismatch.");
if (ag49dIntegratedAudit.audit_result !== "passed") fail("AG49D integrated audit must pass.");
if (ag49dRuntimeAudit.audit_result !== "passed") fail("AG49D runtime posture audit must pass.");
if (ag49dGapRegister.ag49z_closure_allowed !== true) fail("AG49Z closure must be allowed.");
if (ag49dGapRegister.blocking_gaps_for_ag49z.length !== 0) fail("AG49Z blocking gaps must be zero.");
if (ag49dNoAuth.audit_passed !== true) fail("AG49D no-auth audit must pass.");
if (ag49dNoPersonalData.audit_passed !== true) fail("AG49D no-personal-data audit must pass.");
if (ag49dNoPersonalisedOutput.audit_passed !== true) fail("AG49D no-personalised-output audit must pass.");
if (ag49dNoRuntime.audit_passed !== true) fail("AG49D no-runtime audit must pass.");
if (ag49dReadiness.ready_for_ag49z !== true) fail("AG49D readiness must permit AG49Z.");
if (ag49dBoundary.next_stage_id !== "AG49Z") fail("AG49D boundary must point to AG49Z.");

if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag49z-user-profile-personalisation-closure.json");
const closureRecord = readJson("data/content-intelligence/user-personalisation/ag49z-user-profile-personalisation-closure-record.json");
const consumptionSummary = readJson("data/content-intelligence/user-personalisation/ag49z-ag49a-to-ag49d-consumption-summary.json");
const carryForwardDeferralRegister = readJson("data/content-intelligence/user-personalisation/ag49z-carry-forward-deferral-register.json");
const userSurfaceClosure = readJson("data/content-intelligence/user-personalisation/ag49z-user-surface-closure-position.json");
const ag50aHandoff = readJson("data/content-intelligence/ag-roadmap/ag49z-ag50a-assessment-product-layer-handoff.json");
const noAuthActivationAudit = readJson("data/content-intelligence/backend-architecture/ag49z-no-auth-activation-audit.json");
const noPersonalDataCollectionAudit = readJson("data/content-intelligence/backend-architecture/ag49z-no-personal-data-collection-audit.json");
const noPersonalisedOutputAudit = readJson("data/content-intelligence/backend-architecture/ag49z-no-personalised-output-generation-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag49z-no-runtime-api-deployment-audit.json");
const noSecretExposureAudit = readJson("data/content-intelligence/backend-architecture/ag49z-no-secret-exposure-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag49z-ag50a-assessment-product-layer-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag49z-to-ag50a-assessment-product-layer-boundary.json");
const preview = readJson("data/quality/ag49z-user-profile-personalisation-closure-preview.json");
const pkg = readJson("package.json");

if (review.status !== "user_profile_personalisation_closed_ready_for_ag50a") fail("AG49Z review status mismatch.");

for (const key of [
  "ag49z_user_profile_personalisation_closed",
  "ag49a_ag49b_ag49c_ag49d_consumed",
  "user_profile_personalisation_closure_completed",
  "ag50a_assessment_product_layer_handoff_created",
  "ready_for_ag50a_assessment_product_layer_entry"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag50a !== 0) fail("AG50A blocker count must be zero.");

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
  "assessment_runtime_enabled",
  "psychometric_runtime_enabled",
  "model_output_correlation_runtime_enabled",
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

if (closureRecord.status !== "user_profile_personalisation_closure_completed") fail("Closure record status mismatch.");
if (closureRecord.closure_allowed !== true) fail("Closure must be allowed.");

for (const stage of ["AG49A", "AG49B", "AG49C", "AG49D"]) {
  if (!JSON.stringify(consumptionSummary.consumed_outputs).includes(stage)) fail(`Consumption summary missing ${stage}.`);
}

if (!carryForwardDeferralRegister.deferred_items.includes("Auth activation")) fail("Auth activation must be deferred.");
if (!carryForwardDeferralRegister.deferred_items.includes("Personal data collection")) fail("Personal data collection must be deferred.");
if (!carryForwardDeferralRegister.deferred_items.includes("Deployment")) fail("Deployment must be deferred.");

if (!userSurfaceClosure.blocked_for_v01_without_later_approval.includes("profile form")) fail("Profile form must be blocked.");
if (!userSurfaceClosure.blocked_for_v01_without_later_approval.includes("assessment or psychometric runtime")) fail("Assessment/psychometric runtime must be blocked.");

if (ag50aHandoff.status !== "ag50a_assessment_product_layer_handoff_created") fail("AG50A handoff status mismatch.");
if (ag50aHandoff.next_stage_id !== "AG50A") fail("AG50A handoff must point to AG50A.");

if (noAuthActivationAudit.audit_passed !== true) fail("No Auth activation audit must pass.");
if (noAuthActivationAudit.failed_checks.length !== 0) fail("No Auth failed checks must be zero.");

if (noPersonalDataCollectionAudit.audit_passed !== true) fail("No personal data collection audit must pass.");
if (noPersonalDataCollectionAudit.failed_checks.length !== 0) fail("No personal-data failed checks must be zero.");

if (noPersonalisedOutputAudit.audit_passed !== true) fail("No personalised output audit must pass.");
if (noPersonalisedOutputAudit.failed_checks.length !== 0) fail("No personalised-output failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (noSecretExposureAudit.audit_passed !== true) fail("No-secret exposure audit must pass.");
if (noSecretExposureAudit.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");

if (readiness.status !== "ready_for_ag50a_assessment_product_layer_entry") fail("AG50A readiness status mismatch.");
if (readiness.ready_for_ag50a !== true) fail("AG50A readiness must be true.");
if (readiness.next_stage_id !== "AG50A") fail("Readiness must point to AG50A.");
if (!readiness.ag50a_allowed_scope.includes("Define assessment-side product doctrine.")) fail("AG50A assessment doctrine scope missing.");
if (!readiness.ag50a_blocked_scope.includes("Psychometric data collection")) fail("AG50A must block psychometric data collection.");

if (boundary.next_stage_id !== "AG50A") fail("Boundary must point to AG50A.");

for (const key of [
  "ag49z_user_profile_personalisation_closed",
  "ag49a_ag49b_ag49c_ag49d_consumed",
  "user_profile_personalisation_closure_completed",
  "ag50a_assessment_product_layer_handoff_created",
  "ready_for_ag50a_assessment_product_layer_entry"
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
  "assessment_runtime_enabled",
  "psychometric_runtime_enabled",
  "model_output_correlation_runtime_enabled",
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

if (!pkg.scripts?.["generate:ag49z"]) fail("Missing package script: generate:ag49z");
if (!pkg.scripts?.["validate:ag49z"]) fail("Missing package script: validate:ag49z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag49z")) fail("validate:project must include validate:ag49z.");

pass("AG49Z User/Profile and Personalisation Closure is present.");
pass("AG49A–AG49D outputs are consumed.");
pass("User/profile personalisation closure record is valid.");
pass("Carry-forward deferral register is valid.");
pass("User surface closure position is valid.");
pass("AG50A Assessment Product Layer handoff is valid.");
pass("No Auth activation audit is valid.");
pass("No personal data collection audit is valid.");
pass("No personalised output generation audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("No secret exposure audit is valid.");
pass("AG50A readiness is valid.");
