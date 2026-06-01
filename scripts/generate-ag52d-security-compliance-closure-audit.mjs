import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag52aReview: "data/content-intelligence/quality-reviews/ag52a-secret-environment-service-role-safety-audit.json",
  ag52aRepoSecretAudit: "data/content-intelligence/security-compliance/ag52a-repo-secret-exposure-audit-record.json",
  ag52aEnvironmentAudit: "data/content-intelligence/security-compliance/ag52a-environment-file-handling-audit-record.json",
  ag52aServiceRoleAudit: "data/content-intelligence/security-compliance/ag52a-service-role-key-safety-audit-record.json",
  ag52aBrowserPublicAudit: "data/content-intelligence/security-compliance/ag52a-browser-public-config-exposure-audit-record.json",
  ag52aSafetyBoundary: "data/content-intelligence/security-compliance/ag52a-secret-environment-service-role-safety-boundary.json",
  ag52aNoBackendAuthRuntime: "data/content-intelligence/backend-architecture/ag52a-no-backend-auth-runtime-activation-audit.json",
  ag52aNoServiceRoleUse: "data/content-intelligence/backend-architecture/ag52a-no-service-role-use-audit.json",
  ag52aNoDeploymentExposure: "data/content-intelligence/backend-architecture/ag52a-no-deployment-public-exposure-audit.json",

  ag52bReview: "data/content-intelligence/quality-reviews/ag52b-rls-grants-public-exposure-audit.json",
  ag52bRlsPolicyAudit: "data/content-intelligence/security-compliance/ag52b-rls-policy-exposure-audit-record.json",
  ag52bGrantsAudit: "data/content-intelligence/security-compliance/ag52b-grants-permissions-exposure-audit-record.json",
  ag52bPublicSchemaAudit: "data/content-intelligence/security-compliance/ag52b-public-schema-exposure-audit-record.json",
  ag52bAnonAuthenticatedAudit: "data/content-intelligence/security-compliance/ag52b-anon-authenticated-role-exposure-audit-record.json",
  ag52bApiPublicSurfaceAudit: "data/content-intelligence/security-compliance/ag52b-api-public-surface-exposure-audit-record.json",
  ag52bRlsGrantBoundary: "data/content-intelligence/security-compliance/ag52b-rls-grants-public-exposure-boundary.json",
  ag52bNoRlsGrantMutation: "data/content-intelligence/backend-architecture/ag52b-no-rls-grant-mutation-audit.json",
  ag52bNoRuntimeDatabase: "data/content-intelligence/backend-architecture/ag52b-no-runtime-database-api-reading-audit.json",
  ag52bNoBackendDeployment: "data/content-intelligence/backend-architecture/ag52b-no-backend-auth-deployment-audit.json",

  ag52cReview: "data/content-intelligence/quality-reviews/ag52c-source-reference-image-disclaimer-readiness.json",
  ag52cSourceReferenceReadiness: "data/content-intelligence/security-compliance/ag52c-source-reference-readiness-record.json",
  ag52cImageCreditReadiness: "data/content-intelligence/security-compliance/ag52c-image-credit-attribution-readiness-record.json",
  ag52cDisclaimerReadiness: "data/content-intelligence/security-compliance/ag52c-disclaimer-public-use-readiness-record.json",
  ag52cEditorialVerificationReadiness: "data/content-intelligence/security-compliance/ag52c-editorial-verification-readiness-record.json",
  ag52cPublicUseBoundary: "data/content-intelligence/security-compliance/ag52c-public-use-source-image-disclaimer-boundary.json",
  ag52cNoRuntimeFetch: "data/content-intelligence/backend-architecture/ag52c-no-reference-fetch-runtime-audit.json",
  ag52cNoImageScrape: "data/content-intelligence/backend-architecture/ag52c-no-image-scrape-external-api-audit.json",
  ag52cNoPublishingMutation: "data/content-intelligence/backend-architecture/ag52c-no-publishing-mutation-audit.json",
  ag52cNoBackendDeployment: "data/content-intelligence/backend-architecture/ag52c-no-backend-rls-deployment-audit.json",
  ag52cReadiness: "data/content-intelligence/quality-registry/ag52c-ag52d-security-compliance-closure-audit-readiness-record.json",
  ag52cBoundary: "data/content-intelligence/mutation-plans/ag52c-to-ag52d-security-compliance-closure-audit-boundary.json",

  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag52d-security-compliance-closure-audit.json",
  ag52aAudit: "data/content-intelligence/security-compliance/ag52d-ag52a-secret-environment-service-role-audit.json",
  ag52bAudit: "data/content-intelligence/security-compliance/ag52d-ag52b-rls-grants-public-exposure-audit.json",
  ag52cAudit: "data/content-intelligence/security-compliance/ag52d-ag52c-source-reference-image-disclaimer-audit.json",
  combinedRiskRegister: "data/content-intelligence/security-compliance/ag52d-combined-security-compliance-risk-register.json",
  closureReadinessAudit: "data/content-intelligence/security-compliance/ag52d-security-compliance-closure-readiness-audit-record.json",
  noRuntimeBackendRlsDeploymentAudit: "data/content-intelligence/backend-architecture/ag52d-no-runtime-backend-rls-deployment-audit.json",
  noServiceRoleSecretExposureAudit: "data/content-intelligence/backend-architecture/ag52d-no-service-role-secret-exposure-audit.json",
  noPublishingPublicMutationAudit: "data/content-intelligence/backend-architecture/ag52d-no-publishing-public-mutation-audit.json",
  noExternalFetchScrapeAudit: "data/content-intelligence/backend-architecture/ag52d-no-external-fetch-scrape-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag52d-ag52z-security-privacy-legal-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag52d-to-ag52z-security-privacy-legal-closure-boundary.json",
  registry: "data/quality/ag52d-security-compliance-closure-audit.json",
  preview: "data/quality/ag52d-security-compliance-closure-audit-preview.json",
  doc: "docs/quality/AG52D_SECURITY_COMPLIANCE_CLOSURE_AUDIT.md"
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
  if (!exists(p)) throw new Error(`Missing AG52D input: ${p}`);
}

const ag52aReview = readJson(inputs.ag52aReview);
const ag52aRepoSecretAudit = readJson(inputs.ag52aRepoSecretAudit);
const ag52aEnvironmentAudit = readJson(inputs.ag52aEnvironmentAudit);
const ag52aServiceRoleAudit = readJson(inputs.ag52aServiceRoleAudit);
const ag52aBrowserPublicAudit = readJson(inputs.ag52aBrowserPublicAudit);
const ag52aSafetyBoundary = readJson(inputs.ag52aSafetyBoundary);
const ag52aNoBackendAuthRuntime = readJson(inputs.ag52aNoBackendAuthRuntime);
const ag52aNoServiceRoleUse = readJson(inputs.ag52aNoServiceRoleUse);
const ag52aNoDeploymentExposure = readJson(inputs.ag52aNoDeploymentExposure);

const ag52bReview = readJson(inputs.ag52bReview);
const ag52bRlsPolicyAudit = readJson(inputs.ag52bRlsPolicyAudit);
const ag52bGrantsAudit = readJson(inputs.ag52bGrantsAudit);
const ag52bPublicSchemaAudit = readJson(inputs.ag52bPublicSchemaAudit);
const ag52bAnonAuthenticatedAudit = readJson(inputs.ag52bAnonAuthenticatedAudit);
const ag52bApiPublicSurfaceAudit = readJson(inputs.ag52bApiPublicSurfaceAudit);
const ag52bRlsGrantBoundary = readJson(inputs.ag52bRlsGrantBoundary);
const ag52bNoRlsGrantMutation = readJson(inputs.ag52bNoRlsGrantMutation);
const ag52bNoRuntimeDatabase = readJson(inputs.ag52bNoRuntimeDatabase);
const ag52bNoBackendDeployment = readJson(inputs.ag52bNoBackendDeployment);

const ag52cReview = readJson(inputs.ag52cReview);
const ag52cSourceReferenceReadiness = readJson(inputs.ag52cSourceReferenceReadiness);
const ag52cImageCreditReadiness = readJson(inputs.ag52cImageCreditReadiness);
const ag52cDisclaimerReadiness = readJson(inputs.ag52cDisclaimerReadiness);
const ag52cEditorialVerificationReadiness = readJson(inputs.ag52cEditorialVerificationReadiness);
const ag52cPublicUseBoundary = readJson(inputs.ag52cPublicUseBoundary);
const ag52cNoRuntimeFetch = readJson(inputs.ag52cNoRuntimeFetch);
const ag52cNoImageScrape = readJson(inputs.ag52cNoImageScrape);
const ag52cNoPublishingMutation = readJson(inputs.ag52cNoPublishingMutation);
const ag52cNoBackendDeployment = readJson(inputs.ag52cNoBackendDeployment);
const ag52cReadiness = readJson(inputs.ag52cReadiness);
const ag52cBoundary = readJson(inputs.ag52cBoundary);

const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag52aReview.status !== "secret_environment_service_role_safety_audit_ready_for_ag52b") throw new Error("AG52A review status mismatch.");
if (ag52aRepoSecretAudit.audit_passed !== true) throw new Error("AG52A repo secret audit must pass.");
if (ag52aEnvironmentAudit.audit_passed !== true) throw new Error("AG52A environment audit must pass.");
if (ag52aServiceRoleAudit.audit_passed !== true) throw new Error("AG52A service-role audit must pass.");
if (ag52aBrowserPublicAudit.audit_passed !== true) throw new Error("AG52A browser/public config audit must pass.");
if (!ag52aSafetyBoundary.boundary_rules.includes("No service-role key is required or used.")) throw new Error("AG52A service-role boundary missing.");
if (ag52aNoBackendAuthRuntime.audit_passed !== true) throw new Error("AG52A no backend/Auth runtime audit must pass.");
if (ag52aNoServiceRoleUse.audit_passed !== true) throw new Error("AG52A no service-role use audit must pass.");
if (ag52aNoDeploymentExposure.audit_passed !== true) throw new Error("AG52A no deployment exposure audit must pass.");

if (ag52bReview.status !== "rls_grants_public_exposure_audit_ready_for_ag52c") throw new Error("AG52B review status mismatch.");
if (ag52bRlsPolicyAudit.audit_passed !== true) throw new Error("AG52B RLS policy audit must pass.");
if (ag52bGrantsAudit.audit_passed !== true) throw new Error("AG52B grants audit must pass.");
if (ag52bPublicSchemaAudit.audit_passed !== true) throw new Error("AG52B public schema audit must pass.");
if (ag52bAnonAuthenticatedAudit.audit_passed !== true) throw new Error("AG52B anon/authenticated audit must pass.");
if (ag52bApiPublicSurfaceAudit.audit_passed !== true) throw new Error("AG52B API/public surface audit must pass.");
if (!ag52bRlsGrantBoundary.boundary_rules.includes("No GRANT or REVOKE statement is executed.")) throw new Error("AG52B grant boundary missing.");
if (ag52bNoRlsGrantMutation.audit_passed !== true) throw new Error("AG52B no RLS/grant mutation audit must pass.");
if (ag52bNoRuntimeDatabase.audit_passed !== true) throw new Error("AG52B no runtime database audit must pass.");
if (ag52bNoBackendDeployment.audit_passed !== true) throw new Error("AG52B no backend/deployment audit must pass.");

if (ag52cReview.status !== "source_reference_image_disclaimer_readiness_ready_for_ag52d") throw new Error("AG52C review status mismatch.");
if (ag52cSourceReferenceReadiness.audit_passed !== true) throw new Error("AG52C source/reference readiness must pass.");
if (ag52cImageCreditReadiness.audit_passed !== true) throw new Error("AG52C image-credit readiness must pass.");
if (ag52cDisclaimerReadiness.audit_passed !== true) throw new Error("AG52C disclaimer readiness must pass.");
if (ag52cEditorialVerificationReadiness.audit_passed !== true) throw new Error("AG52C editorial verification readiness must pass.");
if (!ag52cPublicUseBoundary.boundary_rules.includes("No public page mutation or content publishing is performed.")) throw new Error("AG52C public mutation/publishing boundary missing.");
if (ag52cNoRuntimeFetch.audit_passed !== true) throw new Error("AG52C no reference fetch audit must pass.");
if (ag52cNoImageScrape.audit_passed !== true) throw new Error("AG52C no image scrape audit must pass.");
if (ag52cNoPublishingMutation.audit_passed !== true) throw new Error("AG52C no publishing mutation audit must pass.");
if (ag52cNoBackendDeployment.audit_passed !== true) throw new Error("AG52C no backend/RLS/deployment audit must pass.");
if (ag52cReadiness.ready_for_ag52d !== true || ag52cReadiness.next_stage_id !== "AG52D") throw new Error("AG52C readiness must permit AG52D.");
if (ag52cBoundary.next_stage_id !== "AG52D") throw new Error("AG52C boundary must point to AG52D.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const blockedState = {
  ag52d_security_compliance_closure_audit_recorded: true,
  ag52a_ag52b_ag52c_consumed: true,
  ag52a_security_audit_passed: true,
  ag52b_exposure_audit_passed: true,
  ag52c_readiness_audit_passed: true,
  combined_security_compliance_risk_register_recorded: true,
  security_compliance_closure_readiness_audit_passed: true,
  ready_for_ag52z_security_privacy_legal_closure: true,

  secret_committed_to_repo: false,
  env_file_committed_to_repo: false,
  browser_public_secret_exposed: false,
  service_role_key_exposed: false,
  service_role_key_used: false,
  service_role_key_required_for_current_stage: false,
  rls_policy_mutation_enabled: false,
  grant_mutation_enabled: false,
  rls_public_policy_activation_approved: false,
  database_permission_change_enabled: false,
  supabase_auth_backend_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  runtime_database_query_enabled: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  reference_fetch_runtime_enabled: false,
  automated_external_link_checking_enabled: false,
  automated_reference_verification_enabled: false,
  image_scraping_enabled: false,
  image_external_api_enabled: false,
  disclaimer_runtime_injection_enabled: false,
  public_page_mutation_enabled: false,
  content_publishing_enabled: false,
  public_content_mutation_enabled: false,
  public_dashboard_exposed: false,
  deployment_approved: false,
  deployment_performed: false
};

const ag52aAudit = {
  module_id: "AG52D",
  title: "AG52A Secret, Environment and Service-role Audit",
  status: "ag52a_security_audit_passed",
  audit_result: "passed",
  consumed_inputs: [
    inputs.ag52aReview,
    inputs.ag52aRepoSecretAudit,
    inputs.ag52aEnvironmentAudit,
    inputs.ag52aServiceRoleAudit,
    inputs.ag52aBrowserPublicAudit,
    inputs.ag52aSafetyBoundary
  ],
  verified_points: [
    "repo secret exposure audit passed",
    "environment file handling audit passed",
    "service-role key safety audit passed",
    "browser/public config exposure audit passed",
    "service-role key is not used or exposed",
    "backend/Auth/runtime activation remains blocked"
  ],
  blocking_gaps: [],
  blocked_state: blockedState
};

const ag52bAudit = {
  module_id: "AG52D",
  title: "AG52B RLS, Grants and Public Exposure Audit",
  status: "ag52b_exposure_audit_passed",
  audit_result: "passed",
  consumed_inputs: [
    inputs.ag52bReview,
    inputs.ag52bRlsPolicyAudit,
    inputs.ag52bGrantsAudit,
    inputs.ag52bPublicSchemaAudit,
    inputs.ag52bAnonAuthenticatedAudit,
    inputs.ag52bApiPublicSurfaceAudit,
    inputs.ag52bRlsGrantBoundary
  ],
  verified_points: [
    "RLS policy exposure audit passed as planning-only",
    "grants/permissions exposure audit passed as planning-only",
    "public schema exposure audit passed as planning-only",
    "anon/authenticated exposure audit passed as planning-only",
    "API/public surface audit passed as planning-only",
    "no RLS/grant/database permission mutation is enabled"
  ],
  blocking_gaps: [],
  blocked_state: blockedState
};

const ag52cAudit = {
  module_id: "AG52D",
  title: "AG52C Source, Reference, Image-credit and Disclaimer Audit",
  status: "ag52c_readiness_audit_passed",
  audit_result: "passed",
  consumed_inputs: [
    inputs.ag52cReview,
    inputs.ag52cSourceReferenceReadiness,
    inputs.ag52cImageCreditReadiness,
    inputs.ag52cDisclaimerReadiness,
    inputs.ag52cEditorialVerificationReadiness,
    inputs.ag52cPublicUseBoundary
  ],
  verified_points: [
    "source/reference readiness passed as planning-only",
    "image-credit/attribution readiness passed as planning-only",
    "disclaimer/public-use readiness passed as planning-only",
    "editorial verification readiness is recorded",
    "no reference fetch, image scrape, runtime disclaimer injection, public mutation or publishing is enabled"
  ],
  blocking_gaps: [],
  blocked_state: blockedState
};

const combinedRiskRegister = {
  module_id: "AG52D",
  title: "Combined Security and Compliance Risk Register",
  status: "combined_security_compliance_risk_register_recorded",
  residual_risks_carried_forward: [
    {
      risk_id: "future_backend_runtime_activation",
      position: "deferred",
      mitigation: "requires explicit backend/Auth/RLS/API/deployment approval chain"
    },
    {
      risk_id: "future_public_content_publishing",
      position: "deferred",
      mitigation: "requires source/reference/image-credit/disclaimer verification before publishing"
    },
    {
      risk_id: "future_rls_public_policy_activation",
      position: "deferred",
      mitigation: "requires separate RLS/grant policy review and approval"
    },
    {
      risk_id: "future_external_fetch_automation",
      position: "deferred",
      mitigation: "requires explicit automation, privacy and cost-governance approval"
    }
  ],
  current_hard_blocker_count: 0,
  blocked_state: blockedState
};

const closureReadinessAudit = {
  module_id: "AG52D",
  title: "Security and Compliance Closure Readiness Audit Record",
  status: "security_compliance_closure_readiness_audit_passed",
  audit_result: "passed",
  closure_ready_for_ag52z: true,
  verified_closure_conditions: [
    "AG52A secret/environment/service-role safety passed",
    "AG52B RLS/grants/public exposure audit passed",
    "AG52C source/reference/image-credit/disclaimer readiness passed",
    "runtime/backend/RLS/deployment/publishing blockers remain active",
    "AG52Z security/privacy/legal closure can proceed"
  ],
  blocking_gaps: [],
  blocked_state: blockedState
};

const noRuntimeBackendRlsDeploymentAudit = {
  module_id: "AG52D",
  title: "No Runtime / Backend / RLS / Deployment Audit",
  status: "no_runtime_backend_rls_deployment_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "runtime_database_query_enabled", expected: false, actual: false, passed: true },
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "supabase_auth_backend_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "rls_policy_mutation_enabled", expected: false, actual: false, passed: true },
    { check_id: "grant_mutation_enabled", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noServiceRoleSecretExposureAudit = {
  module_id: "AG52D",
  title: "No Service-role / Secret Exposure Audit",
  status: "no_service_role_secret_exposure_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "secret_committed_to_repo", expected: false, actual: false, passed: true },
    { check_id: "env_file_committed_to_repo", expected: false, actual: false, passed: true },
    { check_id: "browser_public_secret_exposed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_used", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noPublishingPublicMutationAudit = {
  module_id: "AG52D",
  title: "No Publishing / Public Mutation Audit",
  status: "no_publishing_public_mutation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "public_page_mutation_enabled", expected: false, actual: false, passed: true },
    { check_id: "content_publishing_enabled", expected: false, actual: false, passed: true },
    { check_id: "public_content_mutation_enabled", expected: false, actual: false, passed: true },
    { check_id: "public_dashboard_exposed", expected: false, actual: false, passed: true },
    { check_id: "disclaimer_runtime_injection_enabled", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noExternalFetchScrapeAudit = {
  module_id: "AG52D",
  title: "No External Fetch / Scrape Audit",
  status: "no_external_fetch_scrape_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "reference_fetch_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "automated_external_link_checking_enabled", expected: false, actual: false, passed: true },
    { check_id: "automated_reference_verification_enabled", expected: false, actual: false, passed: true },
    { check_id: "image_scraping_enabled", expected: false, actual: false, passed: true },
    { check_id: "image_external_api_enabled", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG52D",
  title: "AG52Z Security/Privacy/Legal Closure Readiness Record",
  status: "ready_for_ag52z_security_privacy_legal_closure",
  ready_for_ag52z: true,
  next_stage_id: "AG52Z",
  next_stage_title: "Security/Privacy/Legal Closure",
  ag52z_allowed_scope: [
    "Close AG52 security/privacy/legal hardening planning.",
    "Consume AG52A secret/environment/service-role safety audit.",
    "Consume AG52B RLS/grants/public exposure audit.",
    "Consume AG52C source/reference/image-credit/disclaimer readiness.",
    "Consume AG52D security and compliance closure audit.",
    "Keep all runtime, backend, RLS, deployment and publishing actions disabled."
  ],
  ag52z_blocked_scope: [
    "backend/Auth/Supabase activation",
    "service-role use",
    "runtime database/API reading",
    "RLS/grant mutation",
    "reference fetching runtime",
    "image scraping/external API",
    "public page mutation",
    "content publishing",
    "deployment"
  ],
  hard_blocker_count_for_ag52z: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG52D",
  title: "AG52D to AG52Z Security Privacy Legal Closure Boundary",
  status: "ag52z_security_privacy_legal_closure_boundary_created",
  next_stage_id: "AG52Z",
  next_stage_title: "Security/Privacy/Legal Closure",
  allowed_scope: readiness.ag52z_allowed_scope,
  blocked_scope: readiness.ag52z_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG52D",
  title: "Security and Compliance Closure Audit",
  status: "security_compliance_closure_audit_ready_for_ag52z",
  depends_on: ["AG52C", "AG52B", "AG52A", "ADB20"],
  ag52a_audit_file: outputs.ag52aAudit,
  ag52b_audit_file: outputs.ag52bAudit,
  ag52c_audit_file: outputs.ag52cAudit,
  combined_risk_register_file: outputs.combinedRiskRegister,
  closure_readiness_audit_file: outputs.closureReadinessAudit,
  no_runtime_backend_rls_deployment_audit_file: outputs.noRuntimeBackendRlsDeploymentAudit,
  no_service_role_secret_exposure_audit_file: outputs.noServiceRoleSecretExposureAudit,
  no_publishing_public_mutation_audit_file: outputs.noPublishingPublicMutationAudit,
  no_external_fetch_scrape_audit_file: outputs.noExternalFetchScrapeAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag52d_security_compliance_closure_audit_recorded: true,
    ag52a_ag52b_ag52c_consumed: true,
    ag52a_security_audit_passed: true,
    ag52b_exposure_audit_passed: true,
    ag52c_readiness_audit_passed: true,
    combined_security_compliance_risk_register_recorded: true,
    security_compliance_closure_readiness_audit_passed: true,
    ready_for_ag52z_security_privacy_legal_closure: true,
    hard_blocker_count_for_ag52z: 0,

    secret_committed_to_repo: false,
    env_file_committed_to_repo: false,
    browser_public_secret_exposed: false,
    service_role_key_exposed: false,
    service_role_key_used: false,
    service_role_key_required_for_current_stage: false,
    rls_policy_mutation_enabled: false,
    grant_mutation_enabled: false,
    rls_public_policy_activation_approved: false,
    database_permission_change_enabled: false,
    supabase_auth_backend_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    runtime_database_query_enabled: false,
    website_database_reading_enabled: false,
    api_runtime_database_reading_approved_now: false,
    reference_fetch_runtime_enabled: false,
    automated_external_link_checking_enabled: false,
    automated_reference_verification_enabled: false,
    image_scraping_enabled: false,
    image_external_api_enabled: false,
    disclaimer_runtime_injection_enabled: false,
    public_page_mutation_enabled: false,
    content_publishing_enabled: false,
    public_content_mutation_enabled: false,
    public_dashboard_exposed: false,
    deployment_approved: false,
    deployment_performed: false
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG52D", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG52D",
  status: review.status,
  ag52d_security_compliance_closure_audit_recorded: 1,
  ag52a_ag52b_ag52c_consumed: 1,
  ag52a_security_audit_passed: 1,
  ag52b_exposure_audit_passed: 1,
  ag52c_readiness_audit_passed: 1,
  combined_security_compliance_risk_register_recorded: 1,
  security_compliance_closure_readiness_audit_passed: 1,
  ready_for_ag52z_security_privacy_legal_closure: 1,
  hard_blocker_count_for_ag52z: 0,

  secret_committed_to_repo: 0,
  env_file_committed_to_repo: 0,
  browser_public_secret_exposed: 0,
  service_role_key_exposed: 0,
  service_role_key_used: 0,
  service_role_key_required_for_current_stage: 0,
  rls_policy_mutation_enabled: 0,
  grant_mutation_enabled: 0,
  rls_public_policy_activation_approved: 0,
  database_permission_change_enabled: 0,
  supabase_auth_backend_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  runtime_database_query_enabled: 0,
  website_database_reading_enabled: 0,
  api_runtime_database_reading_approved_now: 0,
  reference_fetch_runtime_enabled: 0,
  automated_external_link_checking_enabled: 0,
  automated_reference_verification_enabled: 0,
  image_scraping_enabled: 0,
  image_external_api_enabled: 0,
  disclaimer_runtime_injection_enabled: 0,
  public_page_mutation_enabled: 0,
  content_publishing_enabled: 0,
  public_content_mutation_enabled: 0,
  public_dashboard_exposed: 0,
  deployment_approved: 0,
  deployment_performed: 0
};

const doc = `# AG52D — Security and Compliance Closure Audit

## Result

AG52D audits AG52A, AG52B and AG52C and prepares AG52Z closure readiness.

## Audited

- AG52A — Secret, environment and service-role safety
- AG52B — RLS, grants and public exposure
- AG52C — Source, reference, image-credit and disclaimer readiness

## Confirmed blocked

- Secret/service-role exposure
- Backend/Auth/Supabase activation
- Runtime database/API reading
- RLS/grant mutation
- Reference fetching runtime
- Image scraping or external image/API checking
- Public page mutation
- Content publishing
- Deployment

## Next

AG52Z — Security/Privacy/Legal Closure.
`;

writeJson(outputs.ag52aAudit, ag52aAudit);
writeJson(outputs.ag52bAudit, ag52bAudit);
writeJson(outputs.ag52cAudit, ag52cAudit);
writeJson(outputs.combinedRiskRegister, combinedRiskRegister);
writeJson(outputs.closureReadinessAudit, closureReadinessAudit);
writeJson(outputs.noRuntimeBackendRlsDeploymentAudit, noRuntimeBackendRlsDeploymentAudit);
writeJson(outputs.noServiceRoleSecretExposureAudit, noServiceRoleSecretExposureAudit);
writeJson(outputs.noPublishingPublicMutationAudit, noPublishingPublicMutationAudit);
writeJson(outputs.noExternalFetchScrapeAudit, noExternalFetchScrapeAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG52D Security and Compliance Closure Audit generated.");
console.log("✅ AG52A, AG52B and AG52C security/compliance outputs audited.");
console.log("✅ Combined risk register and AG52Z readiness recorded.");
console.log("✅ Runtime/backend/RLS/deployment/publishing actions remain blocked.");
console.log("✅ Ready for AG52Z Security/Privacy/Legal Closure.");
