import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG49C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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
  "data/content-intelligence/quality-registry/ag49b-ag49c-personalisation-logic-safety-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag49b-to-ag49c-personalisation-logic-safety-boundary.json",
  "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

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
  "data/quality/ag49c-personalisation-logic-safety.json",
  "data/quality/ag49c-personalisation-logic-safety-preview.json",
  "docs/quality/AG49C_PERSONALISATION_LOGIC_SAFETY.md",
  "scripts/generate-ag49c-personalisation-logic-safety.mjs",
  "scripts/validate-ag49c-personalisation-logic-safety.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag49bReview = readJson("data/content-intelligence/quality-reviews/ag49b-consent-entitlement-sensitive-data-gate.json");
const ag49bConsent = readJson("data/content-intelligence/user-personalisation/ag49b-consent-model-gate-record.json");
const ag49bEntitlement = readJson("data/content-intelligence/user-personalisation/ag49b-entitlement-access-basis-gate-record.json");
const ag49bSensitive = readJson("data/content-intelligence/user-personalisation/ag49b-sensitive-data-classification-register.json");
const ag49bBlockedFields = readJson("data/content-intelligence/user-personalisation/ag49b-blocked-by-default-field-register.json");
const ag49bMinimisation = readJson("data/content-intelligence/user-personalisation/ag49b-data-minimisation-non-personalised-fallback-rules.json");
const ag49bNoAuth = readJson("data/content-intelligence/backend-architecture/ag49b-no-auth-activation-audit.json");
const ag49bNoPersonalData = readJson("data/content-intelligence/backend-architecture/ag49b-no-personal-data-collection-audit.json");
const ag49bNoRuntime = readJson("data/content-intelligence/backend-architecture/ag49b-no-runtime-api-deployment-audit.json");
const ag49bReadiness = readJson("data/content-intelligence/quality-registry/ag49b-ag49c-personalisation-logic-safety-readiness-record.json");
const ag49bBoundary = readJson("data/content-intelligence/mutation-plans/ag49b-to-ag49c-personalisation-logic-safety-boundary.json");
const ag47rSourceOfTruth = readJson("data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag49bReview.status !== "consent_entitlement_sensitive_data_gate_ready_for_ag49c") fail("AG49B review status mismatch.");
if (ag49bConsent.consent_model_position.consent_runtime_enabled_now !== false) fail("Consent runtime must remain disabled.");
if (ag49bEntitlement.entitlement_position.entitlement_runtime_enabled_now !== false) fail("Entitlement runtime must remain disabled.");
if (ag49bSensitive.default_sensitive_field_position !== "blocked_by_default") fail("Sensitive fields must be blocked by default.");
if (!ag49bBlockedFields.blocked_by_default_fields.includes("date_of_birth")) fail("date_of_birth must be blocked by default.");
if (ag49bMinimisation.fallback_position.non_personalised_fallback_required !== true) fail("Non-personalised fallback must be required.");
if (ag49bNoAuth.audit_passed !== true) fail("AG49B no-auth audit must pass.");
if (ag49bNoPersonalData.audit_passed !== true) fail("AG49B no-personal-data audit must pass.");
if (ag49bNoRuntime.audit_passed !== true) fail("AG49B no-runtime audit must pass.");
if (ag49bReadiness.ready_for_ag49c !== true) fail("AG49B readiness must permit AG49C.");
if (ag49bBoundary.next_stage_id !== "AG49C") fail("AG49B boundary must point to AG49C.");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG49 remains User Accounts and Personalisation")) fail("AG49 source-of-truth missing.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag49c-personalisation-logic-safety.json");
const personalisationLogicBoundary = readJson("data/content-intelligence/user-personalisation/ag49c-personalisation-logic-boundary-record.json");
const nonDeterministicOutputSafety = readJson("data/content-intelligence/user-personalisation/ag49c-non-deterministic-output-safety-record.json");
const sensitiveFieldDependencyBlocker = readJson("data/content-intelligence/user-personalisation/ag49c-sensitive-field-dependency-blocker.json");
const nonPersonalisedFallbackLogic = readJson("data/content-intelligence/user-personalisation/ag49c-non-personalised-fallback-logic-record.json");
const claimLanguageSafetyRules = readJson("data/content-intelligence/user-personalisation/ag49c-personalisation-claim-language-safety-rules.json");
const integrationGapRegister = readJson("data/content-intelligence/user-personalisation/ag49c-ag49d-integration-gap-register.json");
const noAuthActivationAudit = readJson("data/content-intelligence/backend-architecture/ag49c-no-auth-activation-audit.json");
const noPersonalDataCollectionAudit = readJson("data/content-intelligence/backend-architecture/ag49c-no-personal-data-collection-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag49c-no-runtime-api-deployment-audit.json");
const noPersonalisedOutputAudit = readJson("data/content-intelligence/backend-architecture/ag49c-no-personalised-output-generation-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag49c-ag49d-user-profile-personalisation-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag49c-to-ag49d-user-profile-personalisation-audit-boundary.json");
const preview = readJson("data/quality/ag49c-personalisation-logic-safety-preview.json");
const pkg = readJson("package.json");

if (review.status !== "personalisation_logic_safety_ready_for_ag49d") fail("AG49C review status mismatch.");

for (const key of [
  "ag49c_personalisation_logic_safety_recorded",
  "ag49b_consumed",
  "personalisation_logic_boundary_recorded",
  "non_deterministic_output_safety_recorded",
  "sensitive_field_dependency_blocker_recorded",
  "non_personalised_fallback_logic_recorded",
  "claim_language_safety_rules_recorded",
  "integration_gap_register_recorded",
  "ready_for_ag49d_user_profile_personalisation_audit"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag49d !== 0) fail("AG49D blocker count must be zero.");

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

if (personalisationLogicBoundary.status !== "personalisation_logic_boundary_recorded") fail("Personalisation logic boundary status mismatch.");
if (personalisationLogicBoundary.logic_position.personalisation_runtime_enabled_now !== false) fail("Personalisation runtime must remain disabled.");
if (personalisationLogicBoundary.logic_position.personalised_astrology_enabled_now !== false) fail("Personalised astrology must remain disabled.");
if (!personalisationLogicBoundary.blocked_inputs_without_later_approval.includes("date of birth")) fail("date of birth must be blocked input.");

if (nonDeterministicOutputSafety.status !== "non_deterministic_output_safety_recorded") fail("Non-deterministic safety status mismatch.");
if (nonDeterministicOutputSafety.deterministic_prediction_enabled_now !== false) fail("Deterministic prediction must remain disabled.");
if (!nonDeterministicOutputSafety.output_safety_rules.includes("Personalised output must not make deterministic predictions.")) fail("Deterministic output safety rule missing.");

if (sensitiveFieldDependencyBlocker.status !== "sensitive_field_dependency_blocker_recorded") fail("Sensitive dependency blocker status mismatch.");
if (sensitiveFieldDependencyBlocker.sensitive_dependency_runtime_enabled_now !== false) fail("Sensitive dependency runtime must remain disabled.");
if (!JSON.stringify(sensitiveFieldDependencyBlocker.blocked_dependency_rules).includes("birth details")) fail("Birth-detail dependency blocker missing.");

if (nonPersonalisedFallbackLogic.status !== "non_personalised_fallback_logic_recorded") fail("Fallback logic status mismatch.");
if (nonPersonalisedFallbackLogic.fallback_position.non_personalised_fallback_required !== true) fail("Non-personalised fallback must be required.");
if (nonPersonalisedFallbackLogic.fallback_position.public_personalised_output_enabled_now !== false) fail("Public personalised output must remain disabled.");

if (claimLanguageSafetyRules.status !== "claim_language_safety_rules_recorded") fail("Claim-language safety status mismatch.");
if (!claimLanguageSafetyRules.blocked_language_patterns.includes("guaranteed result")) fail("Guaranteed-result language must be blocked.");
if (claimLanguageSafetyRules.public_claim_runtime_enabled_now !== false) fail("Public claim runtime must remain disabled.");

if (integrationGapRegister.status !== "ag49d_integration_gap_register_recorded") fail("Integration gap register status mismatch.");
if (integrationGapRegister.blocking_gaps_for_ag49d.length !== 0) fail("AG49D blocking gaps must be zero.");
if (integrationGapRegister.ag49d_audit_allowed !== true) fail("AG49D audit must be allowed.");

if (noAuthActivationAudit.audit_passed !== true) fail("No Auth activation audit must pass.");
if (noAuthActivationAudit.failed_checks.length !== 0) fail("No Auth failed checks must be zero.");

if (noPersonalDataCollectionAudit.audit_passed !== true) fail("No personal data collection audit must pass.");
if (noPersonalDataCollectionAudit.failed_checks.length !== 0) fail("No personal-data failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (noPersonalisedOutputAudit.audit_passed !== true) fail("No personalised output audit must pass.");
if (noPersonalisedOutputAudit.failed_checks.length !== 0) fail("No personalised output failed checks must be zero.");

if (readiness.status !== "ready_for_ag49d_user_profile_personalisation_audit") fail("AG49D readiness status mismatch.");
if (readiness.ready_for_ag49d !== true) fail("AG49D readiness must be true.");
if (readiness.next_stage_id !== "AG49D") fail("Readiness must point to AG49D.");
if (!readiness.ag49d_allowed_scope.includes("Audit AG49A–AG49C outputs together.")) fail("AG49D audit scope missing.");
if (!readiness.ag49d_blocked_scope.includes("Personalised reflection/guidance generation")) fail("AG49D must block personalised output generation.");

if (boundary.next_stage_id !== "AG49D") fail("Boundary must point to AG49D.");

for (const key of [
  "ag49c_personalisation_logic_safety_recorded",
  "ag49b_consumed",
  "personalisation_logic_boundary_recorded",
  "non_deterministic_output_safety_recorded",
  "sensitive_field_dependency_blocker_recorded",
  "non_personalised_fallback_logic_recorded",
  "claim_language_safety_rules_recorded",
  "integration_gap_register_recorded",
  "ready_for_ag49d_user_profile_personalisation_audit"
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

if (!pkg.scripts?.["generate:ag49c"]) fail("Missing package script: generate:ag49c");
if (!pkg.scripts?.["validate:ag49c"]) fail("Missing package script: validate:ag49c");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag49c")) fail("validate:project must include validate:ag49c.");

pass("AG49C Personalisation Logic and Non-deterministic Output Safety is present.");
pass("AG49B inputs are consumed.");
pass("Personalisation logic boundary is valid.");
pass("Non-deterministic output safety is valid.");
pass("Sensitive field dependency blocker is valid.");
pass("Non-personalised fallback logic is valid.");
pass("Claim-language safety rules are valid.");
pass("Integration gap register is valid.");
pass("No Auth activation audit is valid.");
pass("No personal data collection audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("No personalised output generation audit is valid.");
pass("AG49D user/profile personalisation audit readiness is valid.");
