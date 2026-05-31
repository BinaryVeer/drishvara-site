import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG49A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag48z-word-reflection-closure.json",
  "data/content-intelligence/ag-roadmap/ag48z-ag49a-user-profile-model-handoff.json",
  "data/content-intelligence/quality-registry/ag48z-ag49a-user-profile-model-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag48z-to-ag49a-user-profile-model-boundary.json",
  "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

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
  "data/quality/ag49a-user-profile-model-consumption-gap-review.json",
  "data/quality/ag49a-user-profile-model-consumption-gap-review-preview.json",
  "docs/quality/AG49A_USER_PROFILE_MODEL_CONSUMPTION_GAP_REVIEW.md",
  "scripts/generate-ag49a-user-profile-model-consumption-gap-review.mjs",
  "scripts/validate-ag49a-user-profile-model-consumption-gap-review.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag48zReview = readJson("data/content-intelligence/quality-reviews/ag48z-word-reflection-closure.json");
const ag48zHandoff = readJson("data/content-intelligence/ag-roadmap/ag48z-ag49a-user-profile-model-handoff.json");
const ag48zReadiness = readJson("data/content-intelligence/quality-registry/ag48z-ag49a-user-profile-model-readiness-record.json");
const ag48zBoundary = readJson("data/content-intelligence/mutation-plans/ag48z-to-ag49a-user-profile-model-boundary.json");
const ag47rSourceOfTruth = readJson("data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag48zReview.status !== "word_reflection_closed_ready_for_ag49a") fail("AG48Z review status mismatch.");
if (ag48zHandoff.next_stage_id !== "AG49A") fail("AG48Z handoff must point to AG49A.");
if (ag48zReadiness.ready_for_ag49a !== true) fail("AG48Z readiness must permit AG49A.");
if (ag48zBoundary.next_stage_id !== "AG49A") fail("AG48Z boundary must point to AG49A.");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG49 remains User Accounts and Personalisation")) fail("AG49 roadmap source-of-truth missing.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag49a-user-profile-model-consumption-gap-review.json");
const userProfileModelConsumption = readJson("data/content-intelligence/user-personalisation/ag49a-user-profile-model-consumption-record.json");
const subscriberSchemaConsumption = readJson("data/content-intelligence/user-personalisation/ag49a-subscriber-personalisation-schema-consumption-record.json");
const profileFieldGapRegister = readJson("data/content-intelligence/user-personalisation/ag49a-profile-field-gap-register.json");
const disabledNowStateRegister = readJson("data/content-intelligence/user-personalisation/ag49a-disabled-now-state-register.json");
const privacyRiskPrecheck = readJson("data/content-intelligence/user-personalisation/ag49a-privacy-risk-precheck-record.json");
const noAuthActivationAudit = readJson("data/content-intelligence/backend-architecture/ag49a-no-auth-activation-audit.json");
const noPersonalDataCollectionAudit = readJson("data/content-intelligence/backend-architecture/ag49a-no-personal-data-collection-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag49a-no-runtime-api-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag49a-ag49b-consent-entitlement-sensitive-data-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag49a-to-ag49b-consent-entitlement-sensitive-data-boundary.json");
const preview = readJson("data/quality/ag49a-user-profile-model-consumption-gap-review-preview.json");
const pkg = readJson("package.json");

if (review.status !== "user_profile_model_consumed_ready_for_ag49b") fail("AG49A review status mismatch.");

for (const key of [
  "ag49a_user_profile_model_consumed",
  "ag48z_consumed",
  "d07_subscriber_schema_candidates_reviewed",
  "daily_guidance_subscriber_schema_candidates_reviewed",
  "profile_field_gap_register_recorded",
  "disabled_now_state_register_recorded",
  "privacy_risk_precheck_recorded",
  "ready_for_ag49b_consent_entitlement_sensitive_data_gate"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag49b !== 0) fail("AG49B blocker count must be zero.");

for (const key of [
  "auth_activation_approved_now",
  "auth_activation_performed",
  "user_account_creation_enabled",
  "profile_creation_enabled",
  "personal_data_collection_enabled",
  "birth_detail_collection_enabled",
  "sensitive_data_collection_enabled",
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

if (userProfileModelConsumption.status !== "user_profile_model_consumption_recorded") fail("User/profile consumption status mismatch.");
if (userProfileModelConsumption.model_boundary.activate_accounts_now !== false) fail("Accounts must not activate.");
if (userProfileModelConsumption.model_boundary.collect_personal_data_now !== false) fail("Personal data must not be collected.");
if (userProfileModelConsumption.model_boundary.use_for_personalised_guidance_now !== false) fail("Personalised guidance must remain disabled.");

if (subscriberSchemaConsumption.status !== "subscriber_personalisation_schema_consumption_recorded") fail("Subscriber schema consumption status mismatch.");
if (subscriberSchemaConsumption.schema_review_position.schema_is_runtime_active_now !== false) fail("Schema runtime must not be active.");
if (subscriberSchemaConsumption.schema_review_position.schema_is_user_writable_now !== false) fail("Schema user write must not be active.");

if (profileFieldGapRegister.status !== "profile_field_gap_register_recorded") fail("Profile field gap register status mismatch.");
if (profileFieldGapRegister.blocking_gaps_for_ag49b.length !== 0) fail("AG49B blocking gaps must be zero.");
if (!JSON.stringify(profileFieldGapRegister.field_groups_for_future_review).includes("sensitive_or_high_risk_fields")) fail("Sensitive/high-risk field group missing.");

if (disabledNowStateRegister.status !== "disabled_now_state_register_recorded") fail("Disabled-now register status mismatch.");
for (const [key, value] of Object.entries(disabledNowStateRegister.disabled_now_states)) {
  if (value !== false) fail(`Disabled-now state ${key} must be false.`);
}

if (privacyRiskPrecheck.status !== "privacy_risk_precheck_recorded") fail("Privacy risk precheck status mismatch.");
if (!JSON.stringify(privacyRiskPrecheck.risk_flags_for_ag49b).includes("birth details")) fail("Birth-detail risk flag missing.");
if (!privacyRiskPrecheck.ag49b_required_focus.includes("consent model")) fail("Consent model focus missing.");

if (noAuthActivationAudit.audit_passed !== true) fail("No Auth activation audit must pass.");
if (noAuthActivationAudit.failed_checks.length !== 0) fail("No Auth activation failed checks must be zero.");

if (noPersonalDataCollectionAudit.audit_passed !== true) fail("No personal data collection audit must pass.");
if (noPersonalDataCollectionAudit.failed_checks.length !== 0) fail("No personal data collection failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (readiness.status !== "ready_for_ag49b_consent_entitlement_sensitive_data_gate") fail("AG49B readiness status mismatch.");
if (readiness.ready_for_ag49b !== true) fail("AG49B readiness must be true.");
if (readiness.next_stage_id !== "AG49B") fail("Readiness must point to AG49B.");
if (!readiness.ag49b_allowed_scope.includes("Define explicit consent model.")) fail("AG49B explicit consent scope missing.");
if (!readiness.ag49b_blocked_scope.includes("Birth-detail collection")) fail("AG49B must block birth-detail collection.");

if (boundary.next_stage_id !== "AG49B") fail("Boundary must point to AG49B.");

for (const key of [
  "ag49a_user_profile_model_consumed",
  "ag48z_consumed",
  "d07_subscriber_schema_candidates_reviewed",
  "daily_guidance_subscriber_schema_candidates_reviewed",
  "profile_field_gap_register_recorded",
  "disabled_now_state_register_recorded",
  "privacy_risk_precheck_recorded",
  "ready_for_ag49b_consent_entitlement_sensitive_data_gate"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "auth_activation_approved_now",
  "auth_activation_performed",
  "user_account_creation_enabled",
  "profile_creation_enabled",
  "personal_data_collection_enabled",
  "birth_detail_collection_enabled",
  "sensitive_data_collection_enabled",
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

if (!pkg.scripts?.["generate:ag49a"]) fail("Missing package script: generate:ag49a");
if (!pkg.scripts?.["validate:ag49a"]) fail("Missing package script: validate:ag49a");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag49a")) fail("validate:project must include validate:ag49a.");

pass("AG49A User/Profile Model Consumption and Gap Review is present.");
pass("AG48Z handoff and AG49 source-of-truth are consumed.");
pass("User/profile model consumption is valid.");
pass("Subscriber/personalisation schema consumption is valid.");
pass("Profile field gap register is valid.");
pass("Disabled-now state register is valid.");
pass("Privacy risk precheck is valid.");
pass("No Auth activation audit is valid.");
pass("No personal data collection audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("AG49B consent/entitlement/sensitive-data readiness is valid.");
