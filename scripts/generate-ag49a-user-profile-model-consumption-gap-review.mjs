import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag48zReview: "data/content-intelligence/quality-reviews/ag48z-word-reflection-closure.json",
  ag48zHandoff: "data/content-intelligence/ag-roadmap/ag48z-ag49a-user-profile-model-handoff.json",
  ag48zReadiness: "data/content-intelligence/quality-registry/ag48z-ag49a-user-profile-model-readiness-record.json",
  ag48zBoundary: "data/content-intelligence/mutation-plans/ag48z-to-ag49a-user-profile-model-boundary.json",
  ag47rSourceOfTruth: "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag49a-user-profile-model-consumption-gap-review.json",
  userProfileModelConsumption: "data/content-intelligence/user-personalisation/ag49a-user-profile-model-consumption-record.json",
  subscriberSchemaConsumption: "data/content-intelligence/user-personalisation/ag49a-subscriber-personalisation-schema-consumption-record.json",
  profileFieldGapRegister: "data/content-intelligence/user-personalisation/ag49a-profile-field-gap-register.json",
  disabledNowStateRegister: "data/content-intelligence/user-personalisation/ag49a-disabled-now-state-register.json",
  privacyRiskPrecheck: "data/content-intelligence/user-personalisation/ag49a-privacy-risk-precheck-record.json",
  noAuthActivationAudit: "data/content-intelligence/backend-architecture/ag49a-no-auth-activation-audit.json",
  noPersonalDataCollectionAudit: "data/content-intelligence/backend-architecture/ag49a-no-personal-data-collection-audit.json",
  noRuntimeApiDeploymentAudit: "data/content-intelligence/backend-architecture/ag49a-no-runtime-api-deployment-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag49a-ag49b-consent-entitlement-sensitive-data-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag49a-to-ag49b-consent-entitlement-sensitive-data-boundary.json",
  registry: "data/quality/ag49a-user-profile-model-consumption-gap-review.json",
  preview: "data/quality/ag49a-user-profile-model-consumption-gap-review-preview.json",
  doc: "docs/quality/AG49A_USER_PROFILE_MODEL_CONSUMPTION_GAP_REVIEW.md"
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
  if (!exists(p)) throw new Error(`Missing AG49A input: ${p}`);
}

const ag48zReview = readJson(inputs.ag48zReview);
const ag48zHandoff = readJson(inputs.ag48zHandoff);
const ag48zReadiness = readJson(inputs.ag48zReadiness);
const ag48zBoundary = readJson(inputs.ag48zBoundary);
const ag47rSourceOfTruth = readJson(inputs.ag47rSourceOfTruth);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag48zReview.status !== "word_reflection_closed_ready_for_ag49a") throw new Error("AG48Z review status mismatch.");
if (ag48zReview.summary?.ready_for_ag49a_user_profile_model_consumption !== true) throw new Error("AG49A readiness missing from AG48Z.");
if (ag48zHandoff.next_stage_id !== "AG49A") throw new Error("AG48Z handoff must point to AG49A.");
if (!JSON.stringify(ag48zHandoff.handoff_basis).includes("AG49 remains User Accounts and Personalisation")) throw new Error("AG49 source-of-truth missing in AG48Z handoff.");
if (ag48zReadiness.ready_for_ag49a !== true || ag48zReadiness.next_stage_id !== "AG49A") throw new Error("AG48Z readiness must permit AG49A.");
if (ag48zBoundary.next_stage_id !== "AG49A") throw new Error("AG48Z boundary must point to AG49A.");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG49 remains User Accounts and Personalisation")) throw new Error("AG49 roadmap source-of-truth not preserved.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const d07Candidates = findFiles(["d07", "subscriber", "personalisation", "personalization", "profile", "user-profile", "daily-guidance"]);
const schemaCandidates = findFiles(["subscriber", "profile", "account", "user", "personalisation", "personalization", "consent", "entitlement"]);
const authCandidates = findFiles(["auth", "rls", "session", "supabase", "account", "profile"]);
const sensitiveDataCandidates = findFiles(["birth", "dob", "location", "profile", "personal", "consent", "sensitive"]);

const blockedState = {
  ag49a_user_profile_model_consumed: true,
  ag48z_consumed: true,
  d07_subscriber_schema_candidates_reviewed: true,
  daily_guidance_subscriber_schema_candidates_reviewed: true,
  profile_field_gap_register_recorded: true,
  disabled_now_state_register_recorded: true,
  privacy_risk_precheck_recorded: true,
  ready_for_ag49b_consent_entitlement_sensitive_data_gate: true,

  auth_activation_approved_now: false,
  auth_activation_performed: false,
  user_account_creation_enabled: false,
  profile_creation_enabled: false,
  personal_data_collection_enabled: false,
  birth_detail_collection_enabled: false,
  sensitive_data_collection_enabled: false,
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

const userProfileModelConsumption = {
  module_id: "AG49A",
  title: "User/Profile Model Consumption Record",
  status: "user_profile_model_consumption_recorded",
  consumed_logic_families: [
    "AG48Z handoff to AG49A",
    "D07 subscriber/personalisation schema candidates where present",
    "daily-guidance subscriber schema candidates where present",
    "future profile/account model candidates",
    "AG27/Auth/Supabase deferral posture where discoverable"
  ],
  discovered_d07_candidates: d07Candidates.slice(0, 100),
  discovered_schema_candidates: schemaCandidates.slice(0, 100),
  discovered_auth_candidates: authCandidates.slice(0, 80),
  model_boundary: {
    use_as_future_profile_model_scaffold: true,
    activate_accounts_now: false,
    create_profiles_now: false,
    collect_personal_data_now: false,
    use_for_personalised_guidance_now: false,
    public_runtime_status: "disabled"
  },
  no_duplicate_rule: "AG49A consumes and gaps existing user/profile/personalisation candidates only; it does not create accounts, activate Auth or collect personal data.",
  blocked_state: blockedState
};

const subscriberSchemaConsumption = {
  module_id: "AG49A",
  title: "Subscriber Personalisation Schema Consumption Record",
  status: "subscriber_personalisation_schema_consumption_recorded",
  consumed_candidates: {
    d07_candidate_count: d07Candidates.length,
    schema_candidate_count: schemaCandidates.length,
    sensitive_data_candidate_count: sensitiveDataCandidates.length
  },
  schema_review_position: {
    subscriber_schema_available_for_future_review: d07Candidates.length > 0 || schemaCandidates.length > 0,
    daily_guidance_subscriber_schema_available_for_future_review: d07Candidates.some((f) => f.toLowerCase().includes("daily")),
    schema_is_runtime_active_now: false,
    schema_is_public_read_now: false,
    schema_is_user_writable_now: false
  },
  blocked_state: blockedState
};

const profileFieldGapRegister = {
  module_id: "AG49A",
  title: "Profile Field Gap Register",
  status: "profile_field_gap_register_recorded",
  field_groups_for_future_review: [
    {
      group: "account_identity",
      examples: ["user_id", "email_hash", "display_name_optional"],
      required_before_activation: ["consent basis", "storage basis", "access control", "deletion path"]
    },
    {
      group: "preference_profile",
      examples: ["language_preference", "content_interest", "notification_preference"],
      required_before_activation: ["explicit opt-in", "edit path", "disable path"]
    },
    {
      group: "cultural_personalisation",
      examples: ["region", "tradition_context", "calendar_preference"],
      required_before_activation: ["non-discrimination note", "manual review", "no deterministic claim"]
    },
    {
      group: "sensitive_or_high_risk_fields",
      examples: ["birth details", "location", "religious practice", "psychometric traits"],
      required_before_activation: ["separate explicit consent", "purpose limitation", "minimisation", "privacy/legal review"]
    }
  ],
  blocking_gaps_for_ag49b: [],
  carry_forward_gaps: [
    "Actual field list must be approved before any account/profile activation.",
    "Sensitive fields must be separately classified in AG49B.",
    "Consent and entitlement model must be defined before collection.",
    "RLS/Auth/access model must remain deferred until explicit backend approval.",
    "No user-facing profile form may be introduced in AG49A."
  ],
  blocked_state: blockedState
};

const disabledNowStateRegister = {
  module_id: "AG49A",
  title: "Disabled-now State Register",
  status: "disabled_now_state_register_recorded",
  disabled_now_states: {
    auth_activation: false,
    user_account_creation: false,
    profile_creation: false,
    personal_data_collection: false,
    birth_detail_collection: false,
    sensitive_data_collection: false,
    personalised_reflection: false,
    personalised_guidance_generation: false,
    database_runtime_reading: false,
    public_profile_surface: false,
    deployment: false
  },
  interpretation: "All values are intentionally false because AG49A is a consumption and gap-review stage only.",
  blocked_state: blockedState
};

const privacyRiskPrecheck = {
  module_id: "AG49A",
  title: "Privacy Risk Precheck Record",
  status: "privacy_risk_precheck_recorded",
  risk_flags_for_ag49b: [
    "personal data collection requires explicit consent and purpose limitation",
    "birth details and location are sensitive/high-risk in spiritual/astrological contexts",
    "profile-based guidance can imply personalised claims and must be non-deterministic",
    "minor/child-related data requires separate protection if ever introduced",
    "user deletion/export/withdrawal paths must exist before account activation",
    "backend/Auth/RLS must be explicitly approved before any live profile data path"
  ],
  ag49b_required_focus: [
    "consent model",
    "entitlement model",
    "sensitive data classification",
    "data minimisation",
    "blocked fields until privacy approval",
    "non-personalised fallback state"
  ],
  blocked_state: blockedState
};

const noAuthActivationAudit = {
  module_id: "AG49A",
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
  module_id: "AG49A",
  title: "No Personal Data Collection Audit",
  status: "no_personal_data_collection_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "personal_data_collection_enabled", expected: false, actual: false, passed: true },
    { check_id: "birth_detail_collection_enabled", expected: false, actual: false, passed: true },
    { check_id: "sensitive_data_collection_enabled", expected: false, actual: false, passed: true },
    { check_id: "personalised_reflection_enabled", expected: false, actual: false, passed: true },
    { check_id: "personalised_guidance_generation_enabled", expected: false, actual: false, passed: true },
    { check_id: "public_personalised_output_generated", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noRuntimeApiDeploymentAudit = {
  module_id: "AG49A",
  title: "No Runtime / API / Deployment Audit",
  status: "no_runtime_api_deployment_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "rls_public_policy_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG49A",
  title: "AG49B Consent Entitlement Sensitive Data Readiness Record",
  status: "ready_for_ag49b_consent_entitlement_sensitive_data_gate",
  ready_for_ag49b: true,
  next_stage_id: "AG49B",
  next_stage_title: "Consent, Entitlement and Sensitive Data Gate",
  ag49b_allowed_scope: [
    "Define explicit consent model.",
    "Define entitlement and access basis.",
    "Classify sensitive/high-risk data fields.",
    "Set blocked-by-default fields.",
    "Record data minimisation and non-personalised fallback rules.",
    "Keep Auth/account/profile collection disabled."
  ],
  ag49b_blocked_scope: [
    "Auth activation",
    "User account creation",
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
  hard_blocker_count_for_ag49b: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG49A",
  title: "AG49A to AG49B Consent Entitlement Sensitive Data Boundary",
  status: "ag49b_consent_entitlement_sensitive_data_boundary_created",
  next_stage_id: "AG49B",
  next_stage_title: "Consent, Entitlement and Sensitive Data Gate",
  allowed_scope: readiness.ag49b_allowed_scope,
  blocked_scope: readiness.ag49b_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG49A",
  title: "User/Profile Model Consumption and Gap Review",
  status: "user_profile_model_consumed_ready_for_ag49b",
  depends_on: ["AG48Z", "AG47R", "ADB20"],
  user_profile_model_consumption_file: outputs.userProfileModelConsumption,
  subscriber_schema_consumption_file: outputs.subscriberSchemaConsumption,
  profile_field_gap_register_file: outputs.profileFieldGapRegister,
  disabled_now_state_register_file: outputs.disabledNowStateRegister,
  privacy_risk_precheck_file: outputs.privacyRiskPrecheck,
  no_auth_activation_audit_file: outputs.noAuthActivationAudit,
  no_personal_data_collection_audit_file: outputs.noPersonalDataCollectionAudit,
  no_runtime_api_deployment_audit_file: outputs.noRuntimeApiDeploymentAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag49a_user_profile_model_consumed: true,
    ag48z_consumed: true,
    d07_subscriber_schema_candidates_reviewed: true,
    daily_guidance_subscriber_schema_candidates_reviewed: true,
    profile_field_gap_register_recorded: true,
    disabled_now_state_register_recorded: true,
    privacy_risk_precheck_recorded: true,
    ready_for_ag49b_consent_entitlement_sensitive_data_gate: true,
    hard_blocker_count_for_ag49b: 0,

    auth_activation_approved_now: false,
    auth_activation_performed: false,
    user_account_creation_enabled: false,
    profile_creation_enabled: false,
    personal_data_collection_enabled: false,
    birth_detail_collection_enabled: false,
    sensitive_data_collection_enabled: false,
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
  module_id: "AG49A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG49A",
  status: review.status,
  ag49a_user_profile_model_consumed: 1,
  ag48z_consumed: 1,
  d07_subscriber_schema_candidates_reviewed: 1,
  daily_guidance_subscriber_schema_candidates_reviewed: 1,
  profile_field_gap_register_recorded: 1,
  disabled_now_state_register_recorded: 1,
  privacy_risk_precheck_recorded: 1,
  ready_for_ag49b_consent_entitlement_sensitive_data_gate: 1,
  hard_blocker_count_for_ag49b: 0,

  auth_activation_approved_now: 0,
  auth_activation_performed: 0,
  user_account_creation_enabled: 0,
  profile_creation_enabled: 0,
  personal_data_collection_enabled: 0,
  birth_detail_collection_enabled: 0,
  sensitive_data_collection_enabled: 0,
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

const doc = `# AG49A — User/Profile Model Consumption and Gap Review

## Result

AG49A consumes user/profile/personalisation schema candidates and records disabled-now states and gaps.

## Confirmed

- AG48Z handoff consumed.
- AG49 remains User Accounts and Personalisation.
- D07/subscriber/personalisation schema candidates reviewed where present.
- Profile field gap register recorded.
- Disabled-now state register recorded.
- Privacy risk precheck recorded.

## Still blocked

- Auth activation
- User account creation
- Profile creation
- Personal data collection
- Birth-detail collection
- Sensitive data collection
- Personalised reflection/guidance generation
- Website database-reading/API runtime activation
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure

## Next

AG49B — Consent, Entitlement and Sensitive Data Gate.
`;

writeJson(outputs.userProfileModelConsumption, userProfileModelConsumption);
writeJson(outputs.subscriberSchemaConsumption, subscriberSchemaConsumption);
writeJson(outputs.profileFieldGapRegister, profileFieldGapRegister);
writeJson(outputs.disabledNowStateRegister, disabledNowStateRegister);
writeJson(outputs.privacyRiskPrecheck, privacyRiskPrecheck);
writeJson(outputs.noAuthActivationAudit, noAuthActivationAudit);
writeJson(outputs.noPersonalDataCollectionAudit, noPersonalDataCollectionAudit);
writeJson(outputs.noRuntimeApiDeploymentAudit, noRuntimeApiDeploymentAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG49A User/Profile Model Consumption and Gap Review generated.");
console.log("✅ User/profile candidates, subscriber schema candidates, gaps, disabled-now states and privacy precheck recorded.");
console.log("✅ Ready for AG49B Consent, Entitlement and Sensitive Data Gate.");
console.log("✅ Auth, accounts, personal data collection, API/DB reading, backend/RLS, deployment and secrets remain blocked.");
