import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG52A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/ag-roadmap/ag51z-post-ag51-roadmap-checkpoint-handoff.json",
  "data/content-intelligence/quality-registry/ag51z-post-ag51-roadmap-checkpoint-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag51z-to-post-ag51-roadmap-checkpoint-boundary.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag52a-secret-environment-service-role-safety-audit.json",
  "data/content-intelligence/security-compliance/ag52a-source-consumption-record.json",
  "data/content-intelligence/security-compliance/ag52a-repo-secret-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-environment-file-handling-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-service-role-key-safety-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-browser-public-config-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-local-config-gitignore-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-secret-environment-service-role-safety-boundary.json",
  "data/content-intelligence/backend-architecture/ag52a-no-backend-auth-runtime-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag52a-no-service-role-use-audit.json",
  "data/content-intelligence/backend-architecture/ag52a-no-deployment-public-exposure-audit.json",
  "data/content-intelligence/quality-registry/ag52a-ag52b-rls-grants-public-exposure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag52a-to-ag52b-rls-grants-public-exposure-boundary.json",
  "data/quality/ag52a-secret-environment-service-role-safety-audit.json",
  "data/quality/ag52a-secret-environment-service-role-safety-audit-preview.json",
  "docs/quality/AG52A_SECRET_ENVIRONMENT_SERVICE_ROLE_SAFETY_AUDIT.md",
  "scripts/generate-ag52a-secret-environment-service-role-safety-audit.mjs",
  "scripts/validate-ag52a-secret-environment-service-role-safety-audit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag51zReview = readJson("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json");
const ag51zHandoff = readJson("data/content-intelligence/ag-roadmap/ag51z-post-ag51-roadmap-checkpoint-handoff.json");
const ag51zReadiness = readJson("data/content-intelligence/quality-registry/ag51z-post-ag51-roadmap-checkpoint-readiness-record.json");
const ag51zBoundary = readJson("data/content-intelligence/mutation-plans/ag51z-to-post-ag51-roadmap-checkpoint-boundary.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") fail("AG51Z review status mismatch.");
if (ag51zHandoff.next_stage_id !== "POST_AG51_ROADMAP_CHECKPOINT") fail("AG51Z handoff must point to checkpoint.");
if (ag51zReadiness.ready_for_post_ag51_checkpoint !== true) fail("Post-AG51 readiness must be true.");
if (ag51zBoundary.next_stage_id !== "POST_AG51_ROADMAP_CHECKPOINT") fail("Post-AG51 boundary mismatch.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag52a-secret-environment-service-role-safety-audit.json");
const consumptionRecord = readJson("data/content-intelligence/security-compliance/ag52a-source-consumption-record.json");
const repoSecretAudit = readJson("data/content-intelligence/security-compliance/ag52a-repo-secret-exposure-audit-record.json");
const environmentAudit = readJson("data/content-intelligence/security-compliance/ag52a-environment-file-handling-audit-record.json");
const serviceRoleAudit = readJson("data/content-intelligence/security-compliance/ag52a-service-role-key-safety-audit-record.json");
const browserPublicConfigAudit = readJson("data/content-intelligence/security-compliance/ag52a-browser-public-config-exposure-audit-record.json");
const localConfigGitignoreAudit = readJson("data/content-intelligence/security-compliance/ag52a-local-config-gitignore-audit-record.json");
const secretSafetyBoundary = readJson("data/content-intelligence/security-compliance/ag52a-secret-environment-service-role-safety-boundary.json");
const noBackendAuthRuntimeAudit = readJson("data/content-intelligence/backend-architecture/ag52a-no-backend-auth-runtime-activation-audit.json");
const noServiceRoleUseAudit = readJson("data/content-intelligence/backend-architecture/ag52a-no-service-role-use-audit.json");
const noDeploymentExposureAudit = readJson("data/content-intelligence/backend-architecture/ag52a-no-deployment-public-exposure-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag52a-ag52b-rls-grants-public-exposure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag52a-to-ag52b-rls-grants-public-exposure-boundary.json");
const preview = readJson("data/quality/ag52a-secret-environment-service-role-safety-audit-preview.json");
const pkg = readJson("package.json");

if (review.status !== "secret_environment_service_role_safety_audit_ready_for_ag52b") {
  fail("AG52A must be ready for AG52B. Review generated blocker details in AG52A audit files.");
}

for (const key of [
  "ag52a_secret_environment_service_role_safety_audit_recorded",
  "ag51z_consumed",
  "repo_secret_exposure_audit_recorded",
  "environment_file_handling_audit_recorded",
  "service_role_key_safety_audit_recorded",
  "browser_public_config_exposure_audit_recorded",
  "local_config_gitignore_audit_recorded",
  "secret_safety_boundary_recorded",
  "ready_for_ag52b_rls_grants_public_exposure_audit"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag52b !== 0) fail("AG52B blocker count must be zero.");

for (const key of [
  "secret_committed_to_repo",
  "env_file_committed_to_repo",
  "browser_public_secret_exposed",
  "service_role_key_exposed",
  "service_role_key_used",
  "service_role_key_required_for_current_stage",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "rls_grant_mutation_enabled",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "public_dashboard_exposed",
  "public_content_mutation_enabled",
  "content_publishing_enabled"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (consumptionRecord.status !== "source_consumption_recorded") fail("Consumption record status mismatch.");
if (!consumptionRecord.consumed_required_sources.includes("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json")) fail("AG51Z review must be consumed.");

for (const key of [
  "adb16_runtime_decision_candidates",
  "adb17_engine_contract_candidates",
  "adb18_validation_protocol_candidates",
  "adb19_non_public_runtime_candidates",
  "adb20_api_runtime_deferral_candidates"
]) {
  if (!Object.prototype.hasOwnProperty.call(consumptionRecord.discovered_context_sources, key)) {
    fail(`ADB context not recorded in AG52A consumption record: ${key}`);
  }
}

if (repoSecretAudit.audit_passed !== true) fail("Repo secret exposure audit must pass.");
if (repoSecretAudit.secret_candidate_count !== 0) fail("Repo secret candidate count must be zero.");

if (environmentAudit.audit_passed !== true) fail("Environment file handling audit must pass.");
if (environmentAudit.env_like_files_detected.length !== 0) fail("No committed env-like files should be detected.");

if (serviceRoleAudit.audit_passed !== true) fail("Service-role key safety audit must pass.");
if (serviceRoleAudit.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");
if (serviceRoleAudit.service_role_key_used_now !== false) fail("Service-role key must not be used.");

if (browserPublicConfigAudit.audit_passed !== true) fail("Browser/public config exposure audit must pass.");
if (browserPublicConfigAudit.public_config_candidate_files.length !== 0) fail("Public config candidate files must be zero.");

if (localConfigGitignoreAudit.status !== "local_config_gitignore_audit_recorded") fail("Local config gitignore audit status mismatch.");
if (localConfigGitignoreAudit.audit_passed !== true) fail("Local config gitignore audit must pass.");

if (secretSafetyBoundary.status !== "secret_environment_service_role_safety_boundary_recorded") fail("Secret safety boundary status mismatch.");
if (!secretSafetyBoundary.boundary_rules.includes("No service-role key is required or used.")) fail("No service-role boundary rule missing.");
if (!secretSafetyBoundary.boundary_rules.includes("No RLS/grant mutation is performed.")) fail("No RLS/grant mutation boundary rule missing.");

if (noBackendAuthRuntimeAudit.audit_passed !== true) fail("No backend/Auth runtime audit must pass.");
if (noBackendAuthRuntimeAudit.failed_checks.length !== 0) fail("No backend/Auth runtime failed checks must be zero.");

if (noServiceRoleUseAudit.audit_passed !== true) fail("No service-role use audit must pass.");
if (noServiceRoleUseAudit.failed_checks.length !== 0) fail("No service-role use failed checks must be zero.");

if (noDeploymentExposureAudit.audit_passed !== true) fail("No deployment exposure audit must pass.");
if (noDeploymentExposureAudit.failed_checks.length !== 0) fail("No deployment exposure failed checks must be zero.");

if (readiness.status !== "ready_for_ag52b_rls_grants_public_exposure_audit") fail("AG52B readiness status mismatch.");
if (readiness.ready_for_ag52b !== true) fail("AG52B readiness must be true.");
if (readiness.next_stage_id !== "AG52B") fail("Readiness must point to AG52B.");
if (!readiness.ag52b_allowed_scope.includes("Review schema/RLS/grant/public exposure records as audit planning.")) fail("AG52B allowed scope missing.");
if (!readiness.ag52b_blocked_scope.includes("RLS/grant mutation")) fail("AG52B must block RLS/grant mutation.");

if (boundary.next_stage_id !== "AG52B") fail("Boundary must point to AG52B.");

for (const key of [
  "ag52a_secret_environment_service_role_safety_audit_recorded",
  "ag51z_consumed",
  "repo_secret_exposure_audit_recorded",
  "environment_file_handling_audit_recorded",
  "service_role_key_safety_audit_recorded",
  "browser_public_config_exposure_audit_recorded",
  "local_config_gitignore_audit_recorded",
  "secret_safety_boundary_recorded",
  "ready_for_ag52b_rls_grants_public_exposure_audit"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "secret_committed_to_repo",
  "env_file_committed_to_repo",
  "browser_public_secret_exposed",
  "service_role_key_exposed",
  "service_role_key_used",
  "service_role_key_required_for_current_stage",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "rls_grant_mutation_enabled",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "public_dashboard_exposed",
  "public_content_mutation_enabled",
  "content_publishing_enabled"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (preview.secret_candidate_count !== 0) fail("Preview secret candidate count must be zero.");
if (preview.env_like_file_count !== 0) fail("Preview env-like file count must be zero.");
if (preview.public_config_candidate_count !== 0) fail("Preview public config candidate count must be zero.");

if (!pkg.scripts?.["generate:ag52a"]) fail("Missing package script: generate:ag52a");
if (!pkg.scripts?.["validate:ag52a"]) fail("Missing package script: validate:ag52a");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag52a")) fail("validate:project must include validate:ag52a.");

pass("AG52A Secret, Environment and Service-role Safety Audit is present.");
pass("AG51Z checkpoint is consumed.");
pass("Repo secret exposure audit is valid.");
pass("Environment file handling audit is valid.");
pass("Service-role key safety audit is valid.");
pass("Browser/public config exposure audit is valid.");
pass("Local config and .gitignore audit is valid.");
pass("Secret/environment/service-role safety boundary is valid.");
pass("No backend/Auth runtime activation audit is valid.");
pass("No service-role use audit is valid.");
pass("No deployment/public exposure audit is valid.");
pass("AG52B RLS, grants and public exposure audit readiness is valid.");
