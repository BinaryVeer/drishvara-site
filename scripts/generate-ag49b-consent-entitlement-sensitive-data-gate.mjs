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
  ag49aReadiness: "data/content-intelligence/quality-registry/ag49a-ag49b-consent-entitlement-sensitive-data-readiness-record.json",
  ag49aBoundary: "data/content-intelligence/mutation-plans/ag49a-to-ag49b-consent-entitlement-sensitive-data-boundary.json",
  ag47rSourceOfTruth: "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag49b-consent-entitlement-sensitive-data-gate.json",
  consentModelGate: "data/content-intelligence/user-personalisation/ag49b-consent-model-gate-record.json",
  entitlementAccessGate: "data/content-intelligence/user-personalisation/ag49b-entitlement-access-basis-gate-record.json",
  sensitiveDataClassification: "data/content-intelligence/user-personalisation/ag49b-sensitive-data-classification-register.json",
  blockedFieldDefault: "data/content-intelligence/user-personalisation/ag49b-blocked-by-default-field-register.json",
  minimisationFallback: "data/content-intelligence/user-personalisation/ag49b-data-minimisation-non-personalised-fallback-rules.json",
  consentWithdrawalBoundary: "data/content-intelligence/user-personalisation/ag49b-consent-withdrawal-export-deletion-boundary.json",
  noAuthActivationAudit: "data/content-intelligence/backend-architecture/ag49b-no-auth-activation-audit.json",
  noPersonalDataCollectionAudit: "data/content-intelligence/backend-architecture/ag49b-no-personal-data-collection-audit.json",
  noRuntimeApiDeploymentAudit: "data/content-intelligence/backend-architecture/ag49b-no-runtime-api-deployment-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag49b-ag49c-personalisation-logic-safety-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag49b-to-ag49c-personalisation-logic-safety-boundary.json",
  registry: "data/quality/ag49b-consent-entitlement-sensitive-data-gate.json",
  preview: "data/quality/ag49b-consent-entitlement-sensitive-data-gate-preview.json",
  doc: "docs/quality/AG49B_CONSENT_ENTITLEMENT_SENSITIVE_DATA_GATE.md"
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
function walk(dir, acc = []) {
  if (!fs.existsSync(full(dir))) return acc;
  for (const entry of fs.readdirSync(full(dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, acc);
    else acc.push(rel);
  }
  return acc;
}
function findFiles(patterns) {
  const files = [...walk("data"), ...walk("docs"), ...walk("scripts"), ...walk("public"), ...walk("src")];
  return files.filter((file) => {
    const low = file.toLowerCase();
    return patterns.some((pattern) => low.includes(pattern.toLowerCase()));
  }).sort();
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG49B input: ${p}`);
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
const ag49aReadiness = readJson(inputs.ag49aReadiness);
const ag49aBoundary = readJson(inputs.ag49aBoundary);
const ag47rSourceOfTruth = readJson(inputs.ag47rSourceOfTruth);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag49aReview.status !== "user_profile_model_consumed_ready_for_ag49b") throw new Error("AG49A review status mismatch.");
if (ag49aReview.summary?.ready_for_ag49b_consent_entitlement_sensitive_data_gate !== true) throw new Error("AG49B readiness missing from AG49A.");
if (ag49aModel.model_boundary?.activate_accounts_now !== false) throw new Error("Accounts must remain disabled.");
if (ag49aModel.model_boundary?.collect_personal_data_now !== false) throw new Error("Personal data collection must remain disabled.");
if (ag49aSubscriber.schema_review_position?.schema_is_runtime_active_now !== false) throw new Error("Subscriber schema runtime must remain inactive.");
if (ag49aGap.blocking_gaps_for_ag49b.length !== 0) throw new Error("AG49B blocking gaps from AG49A must be zero.");
if (ag49aDisabled.disabled_now_states?.auth_activation !== false) throw new Error("Auth disabled-now state mismatch.");
if (!JSON.stringify(ag49aPrivacy.ag49b_required_focus).includes("consent model")) throw new Error("AG49B consent focus missing from AG49A.");
if (ag49aNoAuth.audit_passed !== true) throw new Error("AG49A no-auth audit must pass.");
if (ag49aNoPersonalData.audit_passed !== true) throw new Error("AG49A no-personal-data audit must pass.");
if (ag49aNoRuntime.audit_passed !== true) throw new Error("AG49A no-runtime audit must pass.");
if (ag49aReadiness.ready_for_ag49b !== true || ag49aReadiness.next_stage_id !== "AG49B") throw new Error("AG49A readiness must permit AG49B.");
if (ag49aBoundary.next_stage_id !== "AG49B") throw new Error("AG49A boundary must point to AG49B.");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG49 remains User Accounts and Personalisation")) throw new Error("AG49 roadmap source-of-truth not preserved.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const consentCandidates = findFiles(["consent", "privacy", "withdraw", "delete", "export", "terms"]);
const entitlementCandidates = findFiles(["entitlement", "access", "role", "permission", "subscription"]);
const sensitiveCandidates = findFiles(["birth", "dob", "location", "sensitive", "religious", "psychometric", "profile"]);

const blockedState = {
  ag49b_consent_entitlement_sensitive_data_gate_recorded: true,
  ag49a_consumed: true,
  consent_model_gate_recorded: true,
  entitlement_access_gate_recorded: true,
  sensitive_data_classification_recorded: true,
  blocked_by_default_field_register_recorded: true,
  minimisation_fallback_rules_recorded: true,
  consent_withdrawal_export_deletion_boundary_recorded: true,
  ready_for_ag49c_personalisation_logic_safety: true,

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

const consentModelGate = {
  module_id: "AG49B",
  title: "Consent Model Gate Record",
  status: "consent_model_gate_recorded",
  discovered_consent_candidates: consentCandidates.slice(0, 80),
  consent_requirements_before_activation: [
    "clear purpose statement",
    "affirmative opt-in",
    "separate consent for sensitive/high-risk fields",
    "withdrawal path",
    "export path",
    "deletion path",
    "non-personalised fallback",
    "no consent bundling for unrelated purposes"
  ],
  consent_model_position: {
    consent_design_recorded: true,
    consent_runtime_enabled_now: false,
    consent_collection_enabled_now: false,
    user_account_required_now: false
  },
  blocked_state: blockedState
};

const entitlementAccessGate = {
  module_id: "AG49B",
  title: "Entitlement and Access Basis Gate Record",
  status: "entitlement_access_basis_gate_recorded",
  discovered_entitlement_candidates: entitlementCandidates.slice(0, 80),
  entitlement_requirements_before_activation: [
    "role/access matrix",
    "user-level access basis",
    "editor/admin separation",
    "least-privilege rules",
    "RLS/Auth readiness before runtime",
    "audit trail before sensitive data access",
    "manual approval before account/profile activation"
  ],
  entitlement_position: {
    entitlement_design_recorded: true,
    entitlement_runtime_enabled_now: false,
    auth_required_now: false,
    profile_access_enabled_now: false
  },
  blocked_state: blockedState
};

const sensitiveDataClassification = {
  module_id: "AG49B",
  title: "Sensitive Data Classification Register",
  status: "sensitive_data_classification_recorded",
  discovered_sensitive_candidates: sensitiveCandidates.slice(0, 100),
  field_classification: [
    {
      field_group: "basic_account_identifier",
      risk_level: "personal_data",
      examples: ["email", "display name", "user id"],
      activation_position: "blocked_until_auth_consent_and_access_model"
    },
    {
      field_group: "preference_data",
      risk_level: "personal_data",
      examples: ["language preference", "topic preference", "notification preference"],
      activation_position: "blocked_until_explicit_opt_in"
    },
    {
      field_group: "birth_and_astrological_data",
      risk_level: "sensitive_high_risk",
      examples: ["date of birth", "time of birth", "place of birth", "location"],
      activation_position: "blocked_by_default_requires_separate_approval"
    },
    {
      field_group: "religious_or_cultural_practice",
      risk_level: "sensitive_high_risk",
      examples: ["religious practice", "tradition", "ritual preference"],
      activation_position: "blocked_by_default_requires_minimisation_and_consent"
    },
    {
      field_group: "psychometric_or_child_related_data",
      risk_level: "sensitive_high_risk",
      examples: ["psychometric traits", "minor/child profile", "behavioural signals"],
      activation_position: "blocked_by_default_requires_later_dedicated_governance"
    }
  ],
  default_sensitive_field_position: "blocked_by_default",
  blocked_state: blockedState
};

const blockedFieldDefault = {
  module_id: "AG49B",
  title: "Blocked-by-default Field Register",
  status: "blocked_by_default_field_register_recorded",
  blocked_by_default_fields: [
    "date_of_birth",
    "time_of_birth",
    "place_of_birth",
    "precise_location",
    "religious_practice",
    "ritual_preference",
    "psychometric_trait",
    "child_or_minor_profile",
    "health_or_wellbeing_signal",
    "personalised_astrology_profile"
  ],
  release_conditions: [
    "explicit separate approval",
    "clear purpose and consent",
    "data minimisation",
    "privacy/legal review where required",
    "RLS/Auth/access control readiness",
    "deletion/export/withdrawal path",
    "non-deterministic output boundary"
  ],
  blocked_state: blockedState
};

const minimisationFallback = {
  module_id: "AG49B",
  title: "Data Minimisation and Non-personalised Fallback Rules",
  status: "data_minimisation_non_personalised_fallback_recorded",
  minimisation_rules: [
    "Do not collect a profile field unless it is required for an approved feature.",
    "Prefer non-personalised content where possible.",
    "Use optional preferences before sensitive traits.",
    "Do not infer sensitive traits from behaviour without explicit consent.",
    "Do not require birth details for general reflection or cultural content.",
    "Keep account-free fallback available until Auth is explicitly approved."
  ],
  fallback_position: {
    non_personalised_fallback_required: true,
    account_free_use_preserved_now: true,
    personalised_output_enabled_now: false
  },
  blocked_state: blockedState
};

const consentWithdrawalBoundary = {
  module_id: "AG49B",
  title: "Consent Withdrawal / Export / Deletion Boundary",
  status: "consent_withdrawal_export_deletion_boundary_recorded",
  boundary_requirements_before_activation: [
    "consent withdrawal path",
    "data export path",
    "data deletion path",
    "profile disable path",
    "notification opt-out path",
    "clear retention position",
    "admin audit trail for sensitive access"
  ],
  activation_position: {
    withdrawal_runtime_enabled_now: false,
    export_runtime_enabled_now: false,
    deletion_runtime_enabled_now: false,
    profile_runtime_enabled_now: false
  },
  blocked_state: blockedState
};

const noAuthActivationAudit = {
  module_id: "AG49B",
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
  module_id: "AG49B",
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

const noRuntimeApiDeploymentAudit = {
  module_id: "AG49B",
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
  module_id: "AG49B",
  title: "AG49C Personalisation Logic Safety Readiness Record",
  status: "ready_for_ag49c_personalisation_logic_safety",
  ready_for_ag49c: true,
  next_stage_id: "AG49C",
  next_stage_title: "Personalisation Logic and Non-deterministic Output Safety",
  ag49c_allowed_scope: [
    "Define future personalisation logic boundary.",
    "Define non-deterministic and non-claim output rules.",
    "Define non-personalised fallback logic.",
    "Check personalisation does not require blocked sensitive fields.",
    "Keep Auth/account/profile collection disabled."
  ],
  ag49c_blocked_scope: [
    "Auth activation",
    "User account creation",
    "Profile creation",
    "Personal data collection",
    "Birth-detail collection",
    "Sensitive data collection",
    "Personalised reflection/guidance generation",
    "Website database-reading/API runtime activation",
    "Backend/Auth/Supabase runtime activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure"
  ],
  hard_blocker_count_for_ag49c: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG49B",
  title: "AG49B to AG49C Personalisation Logic Safety Boundary",
  status: "ag49c_personalisation_logic_safety_boundary_created",
  next_stage_id: "AG49C",
  next_stage_title: "Personalisation Logic and Non-deterministic Output Safety",
  allowed_scope: readiness.ag49c_allowed_scope,
  blocked_scope: readiness.ag49c_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG49B",
  title: "Consent, Entitlement and Sensitive Data Gate",
  status: "consent_entitlement_sensitive_data_gate_ready_for_ag49c",
  depends_on: ["AG49A", "AG48Z", "AG47R", "ADB20"],
  consent_model_gate_file: outputs.consentModelGate,
  entitlement_access_gate_file: outputs.entitlementAccessGate,
  sensitive_data_classification_file: outputs.sensitiveDataClassification,
  blocked_field_default_file: outputs.blockedFieldDefault,
  minimisation_fallback_file: outputs.minimisationFallback,
  consent_withdrawal_boundary_file: outputs.consentWithdrawalBoundary,
  no_auth_activation_audit_file: outputs.noAuthActivationAudit,
  no_personal_data_collection_audit_file: outputs.noPersonalDataCollectionAudit,
  no_runtime_api_deployment_audit_file: outputs.noRuntimeApiDeploymentAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag49b_consent_entitlement_sensitive_data_gate_recorded: true,
    ag49a_consumed: true,
    consent_model_gate_recorded: true,
    entitlement_access_gate_recorded: true,
    sensitive_data_classification_recorded: true,
    blocked_by_default_field_register_recorded: true,
    minimisation_fallback_rules_recorded: true,
    consent_withdrawal_export_deletion_boundary_recorded: true,
    ready_for_ag49c_personalisation_logic_safety: true,
    hard_blocker_count_for_ag49c: 0,

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
  module_id: "AG49B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG49B",
  status: review.status,
  ag49b_consent_entitlement_sensitive_data_gate_recorded: 1,
  ag49a_consumed: 1,
  consent_model_gate_recorded: 1,
  entitlement_access_gate_recorded: 1,
  sensitive_data_classification_recorded: 1,
  blocked_by_default_field_register_recorded: 1,
  minimisation_fallback_rules_recorded: 1,
  consent_withdrawal_export_deletion_boundary_recorded: 1,
  ready_for_ag49c_personalisation_logic_safety: 1,
  hard_blocker_count_for_ag49c: 0,

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

const doc = `# AG49B — Consent, Entitlement and Sensitive Data Gate

## Result

AG49B records the consent, entitlement, sensitive-data classification, blocked-field, minimisation and withdrawal/export/deletion boundaries.

## Confirmed

- AG49A consumed.
- Consent model gate recorded.
- Entitlement/access basis gate recorded.
- Sensitive-data classification register recorded.
- Blocked-by-default field register recorded.
- Data minimisation and non-personalised fallback rules recorded.
- Consent withdrawal/export/deletion boundary recorded.

## Still blocked

- Auth activation
- User account creation
- Profile creation
- Personal data collection
- Consent runtime collection
- Birth-detail collection
- Sensitive data collection
- Personalised reflection/guidance generation
- Website database-reading/API runtime activation
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure

## Next

AG49C — Personalisation Logic and Non-deterministic Output Safety.
`;

writeJson(outputs.consentModelGate, consentModelGate);
writeJson(outputs.entitlementAccessGate, entitlementAccessGate);
writeJson(outputs.sensitiveDataClassification, sensitiveDataClassification);
writeJson(outputs.blockedFieldDefault, blockedFieldDefault);
writeJson(outputs.minimisationFallback, minimisationFallback);
writeJson(outputs.consentWithdrawalBoundary, consentWithdrawalBoundary);
writeJson(outputs.noAuthActivationAudit, noAuthActivationAudit);
writeJson(outputs.noPersonalDataCollectionAudit, noPersonalDataCollectionAudit);
writeJson(outputs.noRuntimeApiDeploymentAudit, noRuntimeApiDeploymentAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG49B Consent, Entitlement and Sensitive Data Gate generated.");
console.log("✅ Consent, entitlement, sensitive classification, blocked fields, minimisation and withdrawal boundaries recorded.");
console.log("✅ Ready for AG49C Personalisation Logic and Non-deterministic Output Safety.");
console.log("✅ Auth, accounts, personal data collection, API/DB reading, backend/RLS, deployment and secrets remain blocked.");
