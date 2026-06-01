import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG52B validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag52a-secret-environment-service-role-safety-audit.json",
  "data/content-intelligence/security-compliance/ag52a-source-consumption-record.json",
  "data/content-intelligence/security-compliance/ag52a-repo-secret-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-environment-file-handling-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-service-role-key-safety-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-browser-public-config-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-secret-environment-service-role-safety-boundary.json",
  "data/content-intelligence/backend-architecture/ag52a-no-backend-auth-runtime-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag52a-no-service-role-use-audit.json",
  "data/content-intelligence/backend-architecture/ag52a-no-deployment-public-exposure-audit.json",
  "data/content-intelligence/quality-registry/ag52a-ag52b-rls-grants-public-exposure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag52a-to-ag52b-rls-grants-public-exposure-boundary.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag52b-rls-grants-public-exposure-audit.json",
  "data/content-intelligence/security-compliance/ag52b-source-consumption-record.json",
  "data/content-intelligence/security-compliance/ag52b-rls-policy-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52b-grants-permissions-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52b-public-schema-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52b-anon-authenticated-role-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52b-api-public-surface-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52b-rls-grants-public-exposure-boundary.json",
  "data/content-intelligence/backend-architecture/ag52b-no-rls-grant-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag52b-no-runtime-database-api-reading-audit.json",
  "data/content-intelligence/backend-architecture/ag52b-no-backend-auth-deployment-audit.json",
  "data/content-intelligence/quality-registry/ag52b-ag52c-source-reference-image-disclaimer-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag52b-to-ag52c-source-reference-image-disclaimer-boundary.json",
  "data/quality/ag52b-rls-grants-public-exposure-audit.json",
  "data/quality/ag52b-rls-grants-public-exposure-audit-preview.json",
  "docs/quality/AG52B_RLS_GRANTS_PUBLIC_EXPOSURE_AUDIT.md",
  "scripts/generate-ag52b-rls-grants-public-exposure-audit.mjs",
  "scripts/validate-ag52b-rls-grants-public-exposure-audit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag52aReview = readJson("data/content-intelligence/quality-reviews/ag52a-secret-environment-service-role-safety-audit.json");
const ag52aConsumption = readJson("data/content-intelligence/security-compliance/ag52a-source-consumption-record.json");
const ag52aRepoSecretAudit = readJson("data/content-intelligence/security-compliance/ag52a-repo-secret-exposure-audit-record.json");
const ag52aEnvironmentAudit = readJson("data/content-intelligence/security-compliance/ag52a-environment-file-handling-audit-record.json");
const ag52aServiceRoleAudit = readJson("data/content-intelligence/security-compliance/ag52a-service-role-key-safety-audit-record.json");
const ag52aBrowserPublicAudit = readJson("data/content-intelligence/security-compliance/ag52a-browser-public-config-exposure-audit-record.json");
const ag52aSafetyBoundary = readJson("data/content-intelligence/security-compliance/ag52a-secret-environment-service-role-safety-boundary.json");
const ag52aNoBackendAuthRuntime = readJson("data/content-intelligence/backend-architecture/ag52a-no-backend-auth-runtime-activation-audit.json");
const ag52aNoServiceRoleUse = readJson("data/content-intelligence/backend-architecture/ag52a-no-service-role-use-audit.json");
const ag52aNoDeploymentExposure = readJson("data/content-intelligence/backend-architecture/ag52a-no-deployment-public-exposure-audit.json");
const ag52aReadiness = readJson("data/content-intelligence/quality-registry/ag52a-ag52b-rls-grants-public-exposure-readiness-record.json");
const ag52aBoundary = readJson("data/content-intelligence/mutation-plans/ag52a-to-ag52b-rls-grants-public-exposure-boundary.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag52aReview.status !== "secret_environment_service_role_safety_audit_ready_for_ag52b") fail("AG52A review status mismatch.");
if (ag52aConsumption.status !== "source_consumption_recorded") fail("AG52A consumption record mismatch.");
if (ag52aRepoSecretAudit.audit_passed !== true) fail("AG52A repo secret audit must pass.");
if (ag52aEnvironmentAudit.audit_passed !== true) fail("AG52A environment audit must pass.");
if (ag52aServiceRoleAudit.audit_passed !== true) fail("AG52A service-role audit must pass.");
if (ag52aBrowserPublicAudit.audit_passed !== true) fail("AG52A browser/public config audit must pass.");
if (!ag52aSafetyBoundary.boundary_rules.includes("No RLS/grant mutation is performed.")) fail("AG52A RLS/grant boundary missing.");
if (ag52aNoBackendAuthRuntime.audit_passed !== true) fail("AG52A no backend/Auth runtime audit must pass.");
if (ag52aNoServiceRoleUse.audit_passed !== true) fail("AG52A no service-role use audit must pass.");
if (ag52aNoDeploymentExposure.audit_passed !== true) fail("AG52A no deployment exposure audit must pass.");
if (ag52aReadiness.ready_for_ag52b !== true) fail("AG52A readiness must permit AG52B.");
if (ag52aBoundary.next_stage_id !== "AG52B") fail("AG52A boundary must point to AG52B.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag52b-rls-grants-public-exposure-audit.json");
const sourceConsumption = readJson("data/content-intelligence/security-compliance/ag52b-source-consumption-record.json");
const rlsPolicyAudit = readJson("data/content-intelligence/security-compliance/ag52b-rls-policy-exposure-audit-record.json");
const grantsAudit = readJson("data/content-intelligence/security-compliance/ag52b-grants-permissions-exposure-audit-record.json");
const publicSchemaAudit = readJson("data/content-intelligence/security-compliance/ag52b-public-schema-exposure-audit-record.json");
const anonAuthenticatedAudit = readJson("data/content-intelligence/security-compliance/ag52b-anon-authenticated-role-exposure-audit-record.json");
const apiPublicSurfaceAudit = readJson("data/content-intelligence/security-compliance/ag52b-api-public-surface-exposure-audit-record.json");
const rlsGrantBoundary = readJson("data/content-intelligence/security-compliance/ag52b-rls-grants-public-exposure-boundary.json");
const noRlsGrantMutationAudit = readJson("data/content-intelligence/backend-architecture/ag52b-no-rls-grant-mutation-audit.json");
const noRuntimeDatabaseAudit = readJson("data/content-intelligence/backend-architecture/ag52b-no-runtime-database-api-reading-audit.json");
const noBackendDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag52b-no-backend-auth-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag52b-ag52c-source-reference-image-disclaimer-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag52b-to-ag52c-source-reference-image-disclaimer-boundary.json");
const preview = readJson("data/quality/ag52b-rls-grants-public-exposure-audit-preview.json");
const pkg = readJson("package.json");

if (review.status !== "rls_grants_public_exposure_audit_ready_for_ag52c") fail("AG52B review status mismatch.");

for (const key of [
  "ag52b_rls_grants_public_exposure_audit_recorded",
  "ag52a_consumed",
  "rls_policy_exposure_audit_recorded",
  "grants_permissions_exposure_audit_recorded",
  "public_schema_exposure_audit_recorded",
  "anon_authenticated_role_exposure_audit_recorded",
  "api_public_surface_exposure_audit_recorded",
  "rls_grants_public_exposure_boundary_recorded",
  "ready_for_ag52c_source_reference_image_disclaimer_readiness"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag52c !== 0) fail("AG52C blocker count must be zero.");

for (const key of [
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "rls_public_policy_activation_approved",
  "rls_public_policy_activation_performed",
  "database_permission_change_enabled",
  "supabase_auth_backend_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "public_api_runtime_enabled",
  "public_dashboard_exposed",
  "deployment_approved",
  "deployment_performed",
  "content_publishing_enabled",
  "public_content_mutation_enabled"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (sourceConsumption.status !== "source_consumption_recorded") fail("Source consumption status mismatch.");
for (const key of [
  "adb08_execution_package_candidates",
  "adb09_final_execution_approval_candidates",
  "adb10_live_schema_execution_candidates",
  "adb14_seed_insertion_candidates",
  "adb20_api_runtime_deferral_candidates"
]) {
  if (!Object.prototype.hasOwnProperty.call(sourceConsumption.discovered_context_sources, key)) {
    fail(`ADB context not recorded: ${key}`);
  }
}

if (rlsPolicyAudit.audit_passed !== true) fail("RLS policy exposure audit must pass.");
if (rlsPolicyAudit.audit_position !== "planning_only_no_policy_execution_or_mutation") fail("RLS audit must remain planning-only.");

if (grantsAudit.audit_passed !== true) fail("Grants audit must pass.");
if (grantsAudit.audit_position !== "planning_only_no_grant_or_revoke_execution") fail("Grants audit must remain planning-only.");

if (publicSchemaAudit.audit_passed !== true) fail("Public schema audit must pass.");
if (publicSchemaAudit.live_database_checked_now !== false) fail("Live database must not be checked.");

if (anonAuthenticatedAudit.audit_passed !== true) fail("Anon/authenticated audit must pass.");
if (anonAuthenticatedAudit.live_role_permissions_checked_now !== false) fail("Live role permissions must not be checked.");

if (apiPublicSurfaceAudit.audit_passed !== true) fail("API/public surface audit must pass.");
if (apiPublicSurfaceAudit.audit_position !== "planning_only_no_runtime_api_or_database_reading") fail("API/public surface audit must remain planning-only.");

if (!rlsGrantBoundary.boundary_rules.includes("No GRANT or REVOKE statement is executed.")) fail("No GRANT/REVOKE boundary rule missing.");
if (!rlsGrantBoundary.boundary_rules.includes("No database permission is changed.")) fail("No database permission boundary rule missing.");

if (noRlsGrantMutationAudit.audit_passed !== true) fail("No RLS/grant mutation audit must pass.");
if (noRlsGrantMutationAudit.failed_checks.length !== 0) fail("No RLS/grant mutation failed checks must be zero.");

if (noRuntimeDatabaseAudit.audit_passed !== true) fail("No runtime DB/API audit must pass.");
if (noRuntimeDatabaseAudit.failed_checks.length !== 0) fail("No runtime DB/API failed checks must be zero.");

if (noBackendDeploymentAudit.audit_passed !== true) fail("No backend/deployment audit must pass.");
if (noBackendDeploymentAudit.failed_checks.length !== 0) fail("No backend/deployment failed checks must be zero.");

if (readiness.status !== "ready_for_ag52c_source_reference_image_disclaimer_readiness") fail("AG52C readiness status mismatch.");
if (readiness.ready_for_ag52c !== true) fail("AG52C readiness must be true.");
if (readiness.next_stage_id !== "AG52C") fail("Readiness must point to AG52C.");
if (!readiness.ag52c_blocked_scope.includes("RLS/grant mutation")) fail("AG52C must block RLS/grant mutation.");

if (boundary.next_stage_id !== "AG52C") fail("Boundary must point to AG52C.");

for (const key of [
  "ag52b_rls_grants_public_exposure_audit_recorded",
  "ag52a_consumed",
  "rls_policy_exposure_audit_recorded",
  "grants_permissions_exposure_audit_recorded",
  "public_schema_exposure_audit_recorded",
  "anon_authenticated_role_exposure_audit_recorded",
  "api_public_surface_exposure_audit_recorded",
  "rls_grants_public_exposure_boundary_recorded",
  "ready_for_ag52c_source_reference_image_disclaimer_readiness"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "rls_public_policy_activation_approved",
  "rls_public_policy_activation_performed",
  "database_permission_change_enabled",
  "supabase_auth_backend_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "public_api_runtime_enabled",
  "public_dashboard_exposed",
  "deployment_approved",
  "deployment_performed",
  "content_publishing_enabled",
  "public_content_mutation_enabled"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag52b"]) fail("Missing package script: generate:ag52b");
if (!pkg.scripts?.["validate:ag52b"]) fail("Missing package script: validate:ag52b");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag52b")) fail("validate:project must include validate:ag52b.");

pass("AG52B RLS, Grants and Public Exposure Audit is present.");
pass("AG52A security audit is consumed.");
pass("ADB08–ADB20 context discovery is recorded.");
pass("RLS policy exposure audit is valid.");
pass("Grants and permissions exposure audit is valid.");
pass("Public schema exposure audit is valid.");
pass("Anon/authenticated role exposure audit is valid.");
pass("API/public surface exposure audit is valid.");
pass("RLS/grants/public exposure boundary is valid.");
pass("No RLS/grant mutation audit is valid.");
pass("No runtime database/API reading audit is valid.");
pass("No backend/Auth/deployment audit is valid.");
pass("AG52C source/reference/image/disclaimer readiness is valid.");
