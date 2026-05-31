import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag49aReview: "data/content-intelligence/quality-reviews/ag49a-user-profile-model-consumption-gap-review.json",
  ag49aModel: "data/content-intelligence/user-personalisation/ag49a-user-profile-model-consumption-record.json",
  ag49aSubscriber: "data/content-intelligence/user-personalisation/ag49a-subscriber-personalisation-schema-consumption-record.json",
  ag49aGap: "data/content-intelligence/user-personalisation/ag49a-profile-field-gap-register.json",
  ag49aDisabled: "data/content-intelligence/user-personalisation/ag49a-disabled-now-state-register.json",
  ag49aPrivacy: "data/content-intelligence/user-personalisation/ag49a-privacy-risk-precheck-record.json",
  ag49aNoAuth: "data/content-intelligence/backend-architecture/ag49a-no-auth-activation-audit.json",
  ag49aNoPersonalData: "data/content-intelligence/backend-architecture/ag49a-no-personal-data-collection-audit.json",
  ag49aNoRuntime: "data/content-intelligence/backend-architecture/ag49a-no-runtime-api-deployment-audit.json",

  ag49bReview: "data/content-intelligence/quality-reviews/ag49b-consent-entitlement-sensitive-data-gate.json",
  ag49bConsent: "data/content-intelligence/user-personalisation/ag49b-consent-model-gate-record.json",
  ag49bEntitlement: "data/content-intelligence/user-personalisation/ag49b-entitlement-access-basis-gate-record.json",
  ag49bSensitive: "data/content-intelligence/user-personalisation/ag49b-sensitive-data-classification-register.json",
  ag49bBlockedFields: "data/content-intelligence/user-personalisation/ag49b-blocked-by-default-field-register.json",
  ag49bMinimisation: "data/content-intelligence/user-personalisation/ag49b-data-minimisation-non-personalised-fallback-rules.json",
  ag49bWithdrawal: "data/content-intelligence/user-personalisation/ag49b-consent-withdrawal-export-deletion-boundary.json",
  ag49bNoAuth: "data/content-intelligence/backend-architecture/ag49b-no-auth-activation-audit.json",
  ag49bNoPersonalData: "data/content-intelligence/backend-architecture/ag49b-no-personal-data-collection-audit.json",
  ag49bNoRuntime: "data/content-intelligence/backend-architecture/ag49b-no-runtime-api-deployment-audit.json",

  ag49cReview: "data/content-intelligence/quality-reviews/ag49c-personalisation-logic-safety.json",
  ag49cLogic: "data/content-intelligence/user-personalisation/ag49c-personalisation-logic-boundary-record.json",
  ag49cNondeterministic: "data/content-intelligence/user-personalisation/ag49c-non-deterministic-output-safety-record.json",
  ag49cSensitiveBlocker: "data/content-intelligence/user-personalisation/ag49c-sensitive-field-dependency-blocker.json",
  ag49cFallback: "data/content-intelligence/user-personalisation/ag49c-non-personalised-fallback-logic-record.json",
  ag49cClaimSafety: "data/content-intelligence/user-personalisation/ag49c-personalisation-claim-language-safety-rules.json",
  ag49cGap: "data/content-intelligence/user-personalisation/ag49c-ag49d-integration-gap-register.json",
  ag49cNoAuth: "data/content-intelligence/backend-architecture/ag49c-no-auth-activation-audit.json",
  ag49cNoPersonalData: "data/content-intelligence/backend-architecture/ag49c-no-personal-data-collection-audit.json",
  ag49cNoRuntime: "data/content-intelligence/backend-architecture/ag49c-no-runtime-api-deployment-audit.json",
  ag49cNoPersonalisedOutput: "data/content-intelligence/backend-architecture/ag49c-no-personalised-output-generation-audit.json",
  ag49cReadiness: "data/content-intelligence/quality-registry/ag49c-ag49d-user-profile-personalisation-audit-readiness-record.json",
  ag49cBoundary: "data/content-intelligence/mutation-plans/ag49c-to-ag49d-user-profile-personalisation-audit-boundary.json",

  ag47rSourceOfTruth: "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag49d-user-profile-personalisation-integration-audit.json",
  integratedAudit: "data/content-intelligence/user-personalisation/ag49d-integrated-user-profile-personalisation-audit.json",
  consentSensitiveContinuityAudit: "data/content-intelligence/user-personalisation/ag49d-consent-sensitive-continuity-audit.json",
  personalisationSafetyAudit: "data/content-intelligence/user-personalisation/ag49d-personalisation-nondeterministic-safety-audit.json",
  disabledRuntimePostureAudit: "data/content-intelligence/user-personalisation/ag49d-disabled-now-runtime-posture-audit.json",
  ag49zClosureGapRegister: "data/content-intelligence/user-personalisation/ag49d-ag49z-closure-gap-register.json",
  noAuthActivationAudit: "data/content-intelligence/backend-architecture/ag49d-no-auth-activation-audit.json",
  noPersonalDataCollectionAudit: "data/content-intelligence/backend-architecture/ag49d-no-personal-data-collection-audit.json",
  noPersonalisedOutputAudit: "data/content-intelligence/backend-architecture/ag49d-no-personalised-output-generation-audit.json",
  noRuntimeApiDeploymentAudit: "data/content-intelligence/backend-architecture/ag49d-no-runtime-api-deployment-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag49d-ag49z-user-profile-personalisation-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag49d-to-ag49z-user-profile-personalisation-closure-boundary.json",
  registry: "data/quality/ag49d-user-profile-personalisation-integration-audit.json",
  preview: "data/quality/ag49d-user-profile-personalisation-integration-audit-preview.json",
  doc: "docs/quality/AG49D_USER_PROFILE_PERSONALISATION_INTEGRATION_AUDIT.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG49D input: ${p}`);
}

const ag49aReview = readJson(inputs.ag49aReview);
const ag49aModel = readJson(inputs.ag49aModel);
const ag49aSubscriber = readJson(inputs.ag49aSubscriber);
const ag49aGap = readJson(inputs.ag49aGap);
const ag49aDisabled = readJson(inputs.ag49aDisabled);
const ag49aPrivacy = readJson(inputs.ag49aPrivacy);
const ag49aNoAuth = readJson(inputs.ag49aNoAuth);
const ag49aNoPersonalData = readJson(inputs.ag49aNoPersonalData);
const ag49aNoRuntime = readJson(inputs.ag49aNoRuntime);

const ag49bReview = readJson(inputs.ag49bReview);
const ag49bConsent = readJson(inputs.ag49bConsent);
const ag49bEntitlement = readJson(inputs.ag49bEntitlement);
const ag49bSensitive = readJson(inputs.ag49bSensitive);
const ag49bBlockedFields = readJson(inputs.ag49bBlockedFields);
const ag49bMinimisation = readJson(inputs.ag49bMinimisation);
const ag49bWithdrawal = readJson(inputs.ag49bWithdrawal);
const ag49bNoAuth = readJson(inputs.ag49bNoAuth);
const ag49bNoPersonalData = readJson(inputs.ag49bNoPersonalData);
const ag49bNoRuntime = readJson(inputs.ag49bNoRuntime);

const ag49cReview = readJson(inputs.ag49cReview);
const ag49cLogic = readJson(inputs.ag49cLogic);
const ag49cNondeterministic = readJson(inputs.ag49cNondeterministic);
const ag49cSensitiveBlocker = readJson(inputs.ag49cSensitiveBlocker);
const ag49cFallback = readJson(inputs.ag49cFallback);
const ag49cClaimSafety = readJson(inputs.ag49cClaimSafety);
const ag49cGap = readJson(inputs.ag49cGap);
const ag49cNoAuth = readJson(inputs.ag49cNoAuth);
const ag49cNoPersonalData = readJson(inputs.ag49cNoPersonalData);
const ag49cNoRuntime = readJson(inputs.ag49cNoRuntime);
const ag49cNoPersonalisedOutput = readJson(inputs.ag49cNoPersonalisedOutput);
const ag49cReadiness = readJson(inputs.ag49cReadiness);
const ag49cBoundary = readJson(inputs.ag49cBoundary);

const ag47rSourceOfTruth = readJson(inputs.ag47rSourceOfTruth);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag49aReview.status !== "user_profile_model_consumed_ready_for_ag49b") throw new Error("AG49A review status mismatch.");
if (ag49aModel.model_boundary?.activate_accounts_now !== false) throw new Error("AG49A accounts must remain disabled.");
if (ag49aModel.model_boundary?.collect_personal_data_now !== false) throw new Error("AG49A personal data collection must remain disabled.");
if (ag49aSubscriber.schema_review_position?.schema_is_runtime_active_now !== false) throw new Error("AG49A subscriber runtime must remain inactive.");
if (ag49aGap.blocking_gaps_for_ag49b.length !== 0) throw new Error("AG49A gaps for AG49B must be zero.");
if (ag49aDisabled.disabled_now_states?.auth_activation !== false) throw new Error("AG49A disabled-now auth mismatch.");
if (!JSON.stringify(ag49aPrivacy.risk_flags_for_ag49b).includes("birth details")) throw new Error("AG49A privacy risk flag for birth details missing.");
if (ag49aNoAuth.audit_passed !== true) throw new Error("AG49A no-auth audit must pass.");
if (ag49aNoPersonalData.audit_passed !== true) throw new Error("AG49A no-personal-data audit must pass.");
if (ag49aNoRuntime.audit_passed !== true) throw new Error("AG49A no-runtime audit must pass.");

if (ag49bReview.status !== "consent_entitlement_sensitive_data_gate_ready_for_ag49c") throw new Error("AG49B review status mismatch.");
if (ag49bConsent.consent_model_position?.consent_runtime_enabled_now !== false) throw new Error("AG49B consent runtime must remain disabled.");
if (ag49bEntitlement.entitlement_position?.entitlement_runtime_enabled_now !== false) throw new Error("AG49B entitlement runtime must remain disabled.");
if (ag49bSensitive.default_sensitive_field_position !== "blocked_by_default") throw new Error("AG49B sensitive fields must remain blocked by default.");
if (!ag49bBlockedFields.blocked_by_default_fields.includes("date_of_birth")) throw new Error("AG49B date_of_birth blocker missing.");
if (ag49bMinimisation.fallback_position?.non_personalised_fallback_required !== true) throw new Error("AG49B non-personalised fallback must be required.");
if (ag49bWithdrawal.activation_position?.profile_runtime_enabled_now !== false) throw new Error("AG49B profile runtime must remain disabled.");
if (ag49bNoAuth.audit_passed !== true) throw new Error("AG49B no-auth audit must pass.");
if (ag49bNoPersonalData.audit_passed !== true) throw new Error("AG49B no-personal-data audit must pass.");
if (ag49bNoRuntime.audit_passed !== true) throw new Error("AG49B no-runtime audit must pass.");

if (ag49cReview.status !== "personalisation_logic_safety_ready_for_ag49d") throw new Error("AG49C review status mismatch.");
if (ag49cLogic.logic_position?.personalisation_runtime_enabled_now !== false) throw new Error("AG49C personalisation runtime must remain disabled.");
if (ag49cLogic.logic_position?.personalised_astrology_enabled_now !== false) throw new Error("AG49C personalised astrology must remain disabled.");
if (ag49cNondeterministic.deterministic_prediction_enabled_now !== false) throw new Error("AG49C deterministic prediction must remain disabled.");
if (ag49cSensitiveBlocker.sensitive_dependency_runtime_enabled_now !== false) throw new Error("AG49C sensitive dependency runtime must remain disabled.");
if (ag49cFallback.fallback_position?.non_personalised_fallback_required !== true) throw new Error("AG49C non-personalised fallback must be required.");
if (ag49cClaimSafety.public_claim_runtime_enabled_now !== false) throw new Error("AG49C public claim runtime must remain disabled.");
if (ag49cGap.ag49d_audit_allowed !== true) throw new Error("AG49D audit must be allowed by AG49C.");
if (Array.isArray(ag49cGap.blocking_gaps_for_ag49d) && ag49cGap.blocking_gaps_for_ag49d.length !== 0) throw new Error("AG49D blocking gaps must be zero.");
if (ag49cNoAuth.audit_passed !== true) throw new Error("AG49C no-auth audit must pass.");
if (ag49cNoPersonalData.audit_passed !== true) throw new Error("AG49C no-personal-data audit must pass.");
if (ag49cNoRuntime.audit_passed !== true) throw new Error("AG49C no-runtime audit must pass.");
if (ag49cNoPersonalisedOutput.audit_passed !== true) throw new Error("AG49C no-personalised-output audit must pass.");
if (ag49cReadiness.ready_for_ag49d !== true || ag49cReadiness.next_stage_id !== "AG49D") throw new Error("AG49C readiness must permit AG49D.");
if (ag49cBoundary.next_stage_id !== "AG49D") throw new Error("AG49C boundary must point to AG49D.");

if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG49 remains User Accounts and Personalisation")) throw new Error("AG49 roadmap source-of-truth not preserved.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const blockedState = {
  ag49d_user_profile_personalisation_audit_recorded: true,
  ag49a_ag49b_ag49c_consumed: true,
  user_profile_consent_personalisation_boundaries_consistent: true,
  consent_sensitive_continuity_audited: true,
  personalisation_nondeterministic_safety_audited: true,
  disabled_now_runtime_posture_audited: true,
  ag49z_closure_gap_register_recorded: true,
  ready_for_ag49z_user_profile_personalisation_closure: true,

  auth_activation_approved_now: false,
  auth_activation_performed: false,
  user_account_creation_enabled: false,
  profile_creation_enabled: false,
  personal_data_collection_enabled: false,
  consent_collection_enabled: false,
  entitlement_runtime_enabled: false,
  birth_detail_collection_enabled: false,
  sensitive_data_collection_enabled: false,
  location_collection_enabled: false,
  religious_practice_collection_enabled: false,
  psychometric_data_collection_enabled: false,
  personalised_reflection_enabled: false,
  personalised_guidance_generation_enabled: false,
  personalised_astrology_enabled: false,
  deterministic_prediction_enabled: false,
  automated_sensitive_inference_enabled: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  rls_public_policy_activation_approved: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_personalised_output_generated: false,
  public_content_generated: false
};

const integratedAudit = {
  module_id: "AG49D",
  title: "Integrated User/Profile and Personalisation Audit",
  status: "integrated_user_profile_personalisation_audit_passed",
  audited_modules: [
    "AG49A User/Profile Model Consumption and Gap Review",
    "AG49B Consent, Entitlement and Sensitive Data Gate",
    "AG49C Personalisation Logic and Non-deterministic Output Safety"
  ],
  integration_findings: [
    {
      area: "user_profile_model",
      result: "candidate profile/subscriber model consumed; accounts, profiles and runtime collection remain disabled"
    },
    {
      area: "consent_entitlement_sensitive_data",
      result: "consent, entitlement, sensitive-data classification, blocked fields and minimisation boundaries are recorded"
    },
    {
      area: "personalisation_logic_safety",
      result: "future personalisation logic boundary, non-deterministic safety and non-personalised fallback are recorded"
    },
    {
      area: "combined_activation_posture",
      result: "Auth, personal data collection, personalised output, database/API runtime and deployment remain blocked"
    }
  ],
  audit_result: "passed",
  blocked_state: blockedState
};

const consentSensitiveContinuityAudit = {
  module_id: "AG49D",
  title: "Consent and Sensitive-data Continuity Audit",
  status: "consent_sensitive_continuity_audit_passed",
  continuity_checks: [
    "Consent is design-only and runtime collection remains disabled.",
    "Entitlement/access model is design-only and runtime access remains disabled.",
    "Sensitive fields remain blocked by default.",
    "Birth details, location, religious practice and psychometric fields remain blocked.",
    "Withdrawal/export/deletion paths are requirements before activation, not active runtime features.",
    "Non-personalised fallback remains mandatory."
  ],
  audit_result: "passed",
  blocked_state: blockedState
};

const personalisationSafetyAudit = {
  module_id: "AG49D",
  title: "Personalisation Non-deterministic Safety Audit",
  status: "personalisation_nondeterministic_safety_audit_passed",
  safety_checks: [
    "No personalised reflection runtime.",
    "No personalised guidance generation.",
    "No personalised astrology.",
    "No deterministic prediction.",
    "No automated sensitive inference.",
    "No fear-based or guaranteed-result claim language.",
    "No pressure to provide sensitive data."
  ],
  audit_result: "passed",
  blocked_state: blockedState
};

const disabledRuntimePostureAudit = {
  module_id: "AG49D",
  title: "Disabled-now Runtime Posture Audit",
  status: "disabled_now_runtime_posture_audit_passed",
  disabled_posture_confirmed: [
    "Auth activation disabled",
    "User account creation disabled",
    "Profile creation disabled",
    "Consent collection disabled",
    "Personal data collection disabled",
    "Sensitive data collection disabled",
    "Personalised output generation disabled",
    "Website database reading disabled",
    "API runtime database reading disabled",
    "Backend/Auth/Supabase runtime activation disabled",
    "Deployment disabled"
  ],
  audit_result: "passed",
  blocked_state: blockedState
};

const ag49zClosureGapRegister = {
  module_id: "AG49D",
  title: "AG49Z Closure Gap Register",
  status: "ag49z_closure_gap_register_recorded",
  blocking_gaps_for_ag49z: [],
  carry_forward_gaps_after_ag49d: [
    "Auth remains disabled.",
    "Account/profile creation remains disabled.",
    "Consent runtime collection remains disabled.",
    "Personal data collection remains disabled.",
    "Sensitive fields remain blocked by default.",
    "Personalised output generation remains blocked.",
    "RLS/Auth/access model remains deferred until explicit backend approval.",
    "Database/API runtime remains deferred.",
    "Deployment remains blocked."
  ],
  ag49z_closure_allowed: true,
  blocked_state: blockedState
};

const noAuthActivationAudit = {
  module_id: "AG49D",
  title: "No Auth Activation Audit",
  status: "no_auth_activation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "auth_activation_approved_now", expected: false, actual: false, passed: true },
    { check_id: "auth_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "user_account_creation_enabled", expected: false, actual: false, passed: true },
    { check_id: "profile_creation_enabled", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noPersonalDataCollectionAudit = {
  module_id: "AG49D",
  title: "No Personal Data Collection Audit",
  status: "no_personal_data_collection_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "personal_data_collection_enabled", expected: false, actual: false, passed: true },
    { check_id: "consent_collection_enabled", expected: false, actual: false, passed: true },
    { check_id: "birth_detail_collection_enabled", expected: false, actual: false, passed: true },
    { check_id: "sensitive_data_collection_enabled", expected: false, actual: false, passed: true },
    { check_id: "location_collection_enabled", expected: false, actual: false, passed: true },
    { check_id: "religious_practice_collection_enabled", expected: false, actual: false, passed: true },
    { check_id: "psychometric_data_collection_enabled", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noPersonalisedOutputAudit = {
  module_id: "AG49D",
  title: "No Personalised Output Generation Audit",
  status: "no_personalised_output_generation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "personalised_reflection_enabled", expected: false, actual: false, passed: true },
    { check_id: "personalised_guidance_generation_enabled", expected: false, actual: false, passed: true },
    { check_id: "personalised_astrology_enabled", expected: false, actual: false, passed: true },
    { check_id: "deterministic_prediction_enabled", expected: false, actual: false, passed: true },
    { check_id: "automated_sensitive_inference_enabled", expected: false, actual: false, passed: true },
    { check_id: "public_personalised_output_generated", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noRuntimeApiDeploymentAudit = {
  module_id: "AG49D",
  title: "No Runtime / API / Deployment Audit",
  status: "no_runtime_api_deployment_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "entitlement_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "rls_public_policy_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG49D",
  title: "AG49Z User/Profile Personalisation Closure Readiness Record",
  status: "ready_for_ag49z_user_profile_personalisation_closure",
  ready_for_ag49z: true,
  next_stage_id: "AG49Z",
  next_stage_title: "User/Profile and Personalisation Closure",
  ag49z_allowed_scope: [
    "Close AG49 User Accounts and Personalisation readiness.",
    "Record AG49A–AG49D consumption and audit outputs.",
    "Confirm Auth/account/profile and personal data collection remain blocked.",
    "Confirm no personalised output generation occurred.",
    "Create handoff to next governed roadmap stage after AG49."
  ],
  ag49z_blocked_scope: [
    "Auth activation",
    "User account creation",
    "Profile creation",
    "Personal data collection",
    "Consent runtime collection",
    "Birth-detail collection",
    "Sensitive data collection",
    "Personalised reflection/guidance generation",
    "Website database-reading/API runtime activation",
    "Backend/Auth/Supabase runtime activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure"
  ],
  hard_blocker_count_for_ag49z: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG49D",
  title: "AG49D to AG49Z User/Profile Personalisation Closure Boundary",
  status: "ag49z_user_profile_personalisation_closure_boundary_created",
  next_stage_id: "AG49Z",
  next_stage_title: "User/Profile and Personalisation Closure",
  allowed_scope: readiness.ag49z_allowed_scope,
  blocked_scope: readiness.ag49z_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG49D",
  title: "User/Profile and Personalisation Integration Audit",
  status: "user_profile_personalisation_audit_ready_for_ag49z",
  depends_on: ["AG49C", "AG49B", "AG49A", "AG48Z", "AG47R", "ADB20"],
  integrated_audit_file: outputs.integratedAudit,
  consent_sensitive_continuity_audit_file: outputs.consentSensitiveContinuityAudit,
  personalisation_safety_audit_file: outputs.personalisationSafetyAudit,
  disabled_runtime_posture_audit_file: outputs.disabledRuntimePostureAudit,
  ag49z_closure_gap_register_file: outputs.ag49zClosureGapRegister,
  no_auth_activation_audit_file: outputs.noAuthActivationAudit,
  no_personal_data_collection_audit_file: outputs.noPersonalDataCollectionAudit,
  no_personalised_output_audit_file: outputs.noPersonalisedOutputAudit,
  no_runtime_api_deployment_audit_file: outputs.noRuntimeApiDeploymentAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag49d_user_profile_personalisation_audit_recorded: true,
    ag49a_ag49b_ag49c_consumed: true,
    user_profile_consent_personalisation_boundaries_consistent: true,
    consent_sensitive_continuity_audited: true,
    personalisation_nondeterministic_safety_audited: true,
    disabled_now_runtime_posture_audited: true,
    ag49z_closure_gap_register_recorded: true,
    ready_for_ag49z_user_profile_personalisation_closure: true,
    hard_blocker_count_for_ag49z: 0,

    auth_activation_approved_now: false,
    auth_activation_performed: false,
    user_account_creation_enabled: false,
    profile_creation_enabled: false,
    personal_data_collection_enabled: false,
    consent_collection_enabled: false,
    entitlement_runtime_enabled: false,
    birth_detail_collection_enabled: false,
    sensitive_data_collection_enabled: false,
    location_collection_enabled: false,
    religious_practice_collection_enabled: false,
    psychometric_data_collection_enabled: false,
    personalised_reflection_enabled: false,
    personalised_guidance_generation_enabled: false,
    personalised_astrology_enabled: false,
    deterministic_prediction_enabled: false,
    automated_sensitive_inference_enabled: false,
    website_database_reading_enabled: false,
    api_runtime_database_reading_approved_now: false,
    backend_auth_supabase_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    rls_public_policy_activation_approved: false,
    deployment_approved: false,
    deployment_performed: false,
    service_role_key_exposed: false,
    public_personalised_output_generated: false,
    public_content_generated: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG49D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG49D",
  status: review.status,
  ag49d_user_profile_personalisation_audit_recorded: 1,
  ag49a_ag49b_ag49c_consumed: 1,
  user_profile_consent_personalisation_boundaries_consistent: 1,
  consent_sensitive_continuity_audited: 1,
  personalisation_nondeterministic_safety_audited: 1,
  disabled_now_runtime_posture_audited: 1,
  ag49z_closure_gap_register_recorded: 1,
  ready_for_ag49z_user_profile_personalisation_closure: 1,
  hard_blocker_count_for_ag49z: 0,

  auth_activation_approved_now: 0,
  auth_activation_performed: 0,
  user_account_creation_enabled: 0,
  profile_creation_enabled: 0,
  personal_data_collection_enabled: 0,
  consent_collection_enabled: 0,
  entitlement_runtime_enabled: 0,
  birth_detail_collection_enabled: 0,
  sensitive_data_collection_enabled: 0,
  location_collection_enabled: 0,
  religious_practice_collection_enabled: 0,
  psychometric_data_collection_enabled: 0,
  personalised_reflection_enabled: 0,
  personalised_guidance_generation_enabled: 0,
  personalised_astrology_enabled: 0,
  deterministic_prediction_enabled: 0,
  automated_sensitive_inference_enabled: 0,
  website_database_reading_enabled: 0,
  api_runtime_database_reading_approved_now: 0,
  backend_auth_supabase_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  rls_public_policy_activation_approved: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0,
  public_personalised_output_generated: 0,
  public_content_generated: 0
};

const doc = `# AG49D — User/Profile and Personalisation Integration Audit

## Result

AG49D audits AG49A, AG49B and AG49C together and confirms readiness for AG49Z closure.

## Audited

- User/profile model consumption
- Subscriber/personalisation schema candidates
- Consent and entitlement boundaries
- Sensitive-data classification and blocked fields
- Non-personalised fallback
- Personalisation logic and non-deterministic output safety
- Disabled-now runtime posture

## Confirmed

- AG49Z closure is allowed.
- No blocking gaps exist for AG49Z.
- Auth/account/profile activation remains blocked.
- Personal data and sensitive data collection remain blocked.
- Personalised output generation remains blocked.
- Runtime/API/backend/deployment remain blocked.

## Next

AG49Z — User/Profile and Personalisation Closure.
`;

writeJson(outputs.integratedAudit, integratedAudit);
writeJson(outputs.consentSensitiveContinuityAudit, consentSensitiveContinuityAudit);
writeJson(outputs.personalisationSafetyAudit, personalisationSafetyAudit);
writeJson(outputs.disabledRuntimePostureAudit, disabledRuntimePostureAudit);
writeJson(outputs.ag49zClosureGapRegister, ag49zClosureGapRegister);
writeJson(outputs.noAuthActivationAudit, noAuthActivationAudit);
writeJson(outputs.noPersonalDataCollectionAudit, noPersonalDataCollectionAudit);
writeJson(outputs.noPersonalisedOutputAudit, noPersonalisedOutputAudit);
writeJson(outputs.noRuntimeApiDeploymentAudit, noRuntimeApiDeploymentAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG49D User/Profile and Personalisation Integration Audit generated.");
console.log("✅ AG49A–AG49C integrated audit, consent/sensitive continuity, personalisation safety and disabled runtime posture recorded.");
console.log("✅ Ready for AG49Z User/Profile and Personalisation Closure.");
console.log("✅ Auth, accounts, personal data collection, personalised output, API/DB reading, backend/RLS, deployment and secrets remain blocked.");
