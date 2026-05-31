import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG49B validation failed: ${message}`);
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
  "data/content-intelligence/quality-registry/ag49a-ag49b-consent-entitlement-sensitive-data-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag49a-to-ag49b-consent-entitlement-sensitive-data-boundary.json",
  "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

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
  "data/quality/ag49b-consent-entitlement-sensitive-data-gate.json",
  "data/quality/ag49b-consent-entitlement-sensitive-data-gate-preview.json",
  "docs/quality/AG49B_CONSENT_ENTITLEMENT_SENSITIVE_DATA_GATE.md",
  "scripts/generate-ag49b-consent-entitlement-sensitive-data-gate.mjs",
  "scripts/validate-ag49b-consent-entitlement-sensitive-data-gate.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag49aReview = readJson("data/content-intelligence/quality-reviews/ag49a-user-profile-model-consumption-gap-review.json");
const ag49aModel = readJson("data/content-intelligence/user-personalisation/ag49a-user-profile-model-consumption-record.json");
const ag49aSubscriber = readJson("data/content-intelligence/user-personalisation/ag49a-subscriber-personalisation-schema-consumption-record.json");
const ag49aGap = readJson("data/content-intelligence/user-personalisation/ag49a-profile-field-gap-register.json");
const ag49aDisabled = readJson("data/content-intelligence/user-personalisation/ag49a-disabled-now-state-register.json");
const ag49aPrivacy = readJson("data/content-intelligence/user-personalisation/ag49a-privacy-risk-precheck-record.json");
const ag49aNoAuth = readJson("data/content-intelligence/backend-architecture/ag49a-no-auth-activation-audit.json");
const ag49aNoPersonalData = readJson("data/content-intelligence/backend-architecture/ag49a-no-personal-data-collection-audit.json");
const ag49aNoRuntime = readJson("data/content-intelligence/backend-architecture/ag49a-no-runtime-api-deployment-audit.json");
const ag49aReadiness = readJson("data/content-intelligence/quality-registry/ag49a-ag49b-consent-entitlement-sensitive-data-readiness-record.json");
const ag49aBoundary = readJson("data/content-intelligence/mutation-plans/ag49a-to-ag49b-consent-entitlement-sensitive-data-boundary.json");
const ag47rSourceOfTruth = readJson("data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag49aReview.status !== "user_profile_model_consumed_ready_for_ag49b") fail("AG49A review status mismatch.");
if (ag49aModel.model_boundary.activate_accounts_now !== false) fail("AG49A accounts must remain disabled.");
if (ag49aModel.model_boundary.collect_personal_data_now !== false) fail("AG49A personal data collection must remain disabled.");
if (ag49aSubscriber.schema_review_position.schema_is_runtime_active_now !== false) fail("AG49A subscriber runtime must remain inactive.");
if (ag49aGap.blocking_gaps_for_ag49b.length !== 0) fail("AG49A blocking gaps for AG49B must be zero.");
for (const [key, value] of Object.entries(ag49aDisabled.disabled_now_states)) {
  if (value !== false) fail(`AG49A disabled state ${key} must be false.`);
}
if (!JSON.stringify(ag49aPrivacy.ag49b_required_focus).includes("consent model")) fail("AG49A AG49B consent focus missing.");
if (ag49aNoAuth.audit_passed !== true) fail("AG49A no-auth audit must pass.");
if (ag49aNoPersonalData.audit_passed !== true) fail("AG49A no-personal-data audit must pass.");
if (ag49aNoRuntime.audit_passed !== true) fail("AG49A no-runtime audit must pass.");
if (ag49aReadiness.ready_for_ag49b !== true) fail("AG49A readiness must permit AG49B.");
if (ag49aBoundary.next_stage_id !== "AG49B") fail("AG49A boundary must point to AG49B.");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG49 remains User Accounts and Personalisation")) fail("AG49 source-of-truth missing.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag49b-consent-entitlement-sensitive-data-gate.json");
const consentModelGate = readJson("data/content-intelligence/user-personalisation/ag49b-consent-model-gate-record.json");
const entitlementAccessGate = readJson("data/content-intelligence/user-personalisation/ag49b-entitlement-access-basis-gate-record.json");
const sensitiveDataClassification = readJson("data/content-intelligence/user-personalisation/ag49b-sensitive-data-classification-register.json");
const blockedFieldDefault = readJson("data/content-intelligence/user-personalisation/ag49b-blocked-by-default-field-register.json");
const minimisationFallback = readJson("data/content-intelligence/user-personalisation/ag49b-data-minimisation-non-personalised-fallback-rules.json");
const consentWithdrawalBoundary = readJson("data/content-intelligence/user-personalisation/ag49b-consent-withdrawal-export-deletion-boundary.json");
const noAuthActivationAudit = readJson("data/content-intelligence/backend-architecture/ag49b-no-auth-activation-audit.json");
const noPersonalDataCollectionAudit = readJson("data/content-intelligence/backend-architecture/ag49b-no-personal-data-collection-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag49b-no-runtime-api-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag49b-ag49c-personalisation-logic-safety-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag49b-to-ag49c-personalisation-logic-safety-boundary.json");
const preview = readJson("data/quality/ag49b-consent-entitlement-sensitive-data-gate-preview.json");
const pkg = readJson("package.json");

if (review.status !== "consent_entitlement_sensitive_data_gate_ready_for_ag49c") fail("AG49B review status mismatch.");

for (const key of [
  "ag49b_consent_entitlement_sensitive_data_gate_recorded",
  "ag49a_consumed",
  "consent_model_gate_recorded",
  "entitlement_access_gate_recorded",
  "sensitive_data_classification_recorded",
  "blocked_by_default_field_register_recorded",
  "minimisation_fallback_rules_recorded",
  "consent_withdrawal_export_deletion_boundary_recorded",
  "ready_for_ag49c_personalisation_logic_safety"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag49c !== 0) fail("AG49C blocker count must be zero.");

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

if (consentModelGate.status !== "consent_model_gate_recorded") fail("Consent model gate status mismatch.");
if (consentModelGate.consent_model_position.consent_runtime_enabled_now !== false) fail("Consent runtime must remain disabled.");
if (!consentModelGate.consent_requirements_before_activation.includes("separate consent for sensitive/high-risk fields")) fail("Sensitive separate consent requirement missing.");

if (entitlementAccessGate.status !== "entitlement_access_basis_gate_recorded") fail("Entitlement/access gate status mismatch.");
if (entitlementAccessGate.entitlement_position.entitlement_runtime_enabled_now !== false) fail("Entitlement runtime must remain disabled.");
if (!entitlementAccessGate.entitlement_requirements_before_activation.includes("RLS/Auth readiness before runtime")) fail("RLS/Auth requirement missing.");

if (sensitiveDataClassification.status !== "sensitive_data_classification_recorded") fail("Sensitive classification status mismatch.");
if (sensitiveDataClassification.default_sensitive_field_position !== "blocked_by_default") fail("Sensitive fields must be blocked by default.");
if (!JSON.stringify(sensitiveDataClassification.field_classification).includes("birth_and_astrological_data")) fail("Birth/astrological classification missing.");
if (!JSON.stringify(sensitiveDataClassification.field_classification).includes("psychometric_or_child_related_data")) fail("Psychometric/child classification missing.");

if (blockedFieldDefault.status !== "blocked_by_default_field_register_recorded") fail("Blocked-field register status mismatch.");
for (const field of ["date_of_birth", "time_of_birth", "place_of_birth", "psychometric_trait", "child_or_minor_profile"]) {
  if (!blockedFieldDefault.blocked_by_default_fields.includes(field)) fail(`Blocked-by-default field missing: ${field}`);
}

if (minimisationFallback.status !== "data_minimisation_non_personalised_fallback_recorded") fail("Minimisation/fallback status mismatch.");
if (minimisationFallback.fallback_position.non_personalised_fallback_required !== true) fail("Non-personalised fallback must be required.");
if (minimisationFallback.fallback_position.personalised_output_enabled_now !== false) fail("Personalised output must remain disabled.");

if (consentWithdrawalBoundary.status !== "consent_withdrawal_export_deletion_boundary_recorded") fail("Consent withdrawal boundary status mismatch.");
if (consentWithdrawalBoundary.activation_position.withdrawal_runtime_enabled_now !== false) fail("Withdrawal runtime must remain disabled.");
if (!consentWithdrawalBoundary.boundary_requirements_before_activation.includes("data deletion path")) fail("Deletion path requirement missing.");

if (noAuthActivationAudit.audit_passed !== true) fail("No Auth activation audit must pass.");
if (noAuthActivationAudit.failed_checks.length !== 0) fail("No Auth failed checks must be zero.");

if (noPersonalDataCollectionAudit.audit_passed !== true) fail("No personal data collection audit must pass.");
if (noPersonalDataCollectionAudit.failed_checks.length !== 0) fail("No personal-data failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (readiness.status !== "ready_for_ag49c_personalisation_logic_safety") fail("AG49C readiness status mismatch.");
if (readiness.ready_for_ag49c !== true) fail("AG49C readiness must be true.");
if (readiness.next_stage_id !== "AG49C") fail("Readiness must point to AG49C.");
if (!readiness.ag49c_allowed_scope.includes("Define future personalisation logic boundary.")) fail("AG49C personalisation logic scope missing.");
if (!readiness.ag49c_blocked_scope.includes("Birth-detail collection")) fail("AG49C must block birth-detail collection.");

if (boundary.next_stage_id !== "AG49C") fail("Boundary must point to AG49C.");

for (const key of [
  "ag49b_consent_entitlement_sensitive_data_gate_recorded",
  "ag49a_consumed",
  "consent_model_gate_recorded",
  "entitlement_access_gate_recorded",
  "sensitive_data_classification_recorded",
  "blocked_by_default_field_register_recorded",
  "minimisation_fallback_rules_recorded",
  "consent_withdrawal_export_deletion_boundary_recorded",
  "ready_for_ag49c_personalisation_logic_safety"
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

if (!pkg.scripts?.["generate:ag49b"]) fail("Missing package script: generate:ag49b");
if (!pkg.scripts?.["validate:ag49b"]) fail("Missing package script: validate:ag49b");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag49b")) fail("validate:project must include validate:ag49b.");

pass("AG49B Consent, Entitlement and Sensitive Data Gate is present.");
pass("AG49A inputs are consumed.");
pass("Consent model gate is valid.");
pass("Entitlement/access gate is valid.");
pass("Sensitive data classification is valid.");
pass("Blocked-by-default field register is valid.");
pass("Data minimisation and non-personalised fallback rules are valid.");
pass("Consent withdrawal/export/deletion boundary is valid.");
pass("No Auth activation audit is valid.");
pass("No personal data collection audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("AG49C personalisation logic safety readiness is valid.");
