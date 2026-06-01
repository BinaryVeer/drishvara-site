import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG52C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag52a-secret-environment-service-role-safety-audit.json",
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
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag52c-source-reference-image-disclaimer-readiness.json",
  "data/content-intelligence/security-compliance/ag52c-source-consumption-record.json",
  "data/content-intelligence/security-compliance/ag52c-source-reference-readiness-record.json",
  "data/content-intelligence/security-compliance/ag52c-image-credit-attribution-readiness-record.json",
  "data/content-intelligence/security-compliance/ag52c-disclaimer-public-use-readiness-record.json",
  "data/content-intelligence/security-compliance/ag52c-editorial-verification-readiness-record.json",
  "data/content-intelligence/security-compliance/ag52c-public-use-source-image-disclaimer-boundary.json",
  "data/content-intelligence/backend-architecture/ag52c-no-reference-fetch-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag52c-no-image-scrape-external-api-audit.json",
  "data/content-intelligence/backend-architecture/ag52c-no-publishing-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag52c-no-backend-rls-deployment-audit.json",
  "data/content-intelligence/quality-registry/ag52c-ag52d-security-compliance-closure-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag52c-to-ag52d-security-compliance-closure-audit-boundary.json",
  "data/quality/ag52c-source-reference-image-disclaimer-readiness.json",
  "data/quality/ag52c-source-reference-image-disclaimer-readiness-preview.json",
  "docs/quality/AG52C_SOURCE_REFERENCE_IMAGE_DISCLAIMER_READINESS.md",
  "scripts/generate-ag52c-source-reference-image-disclaimer-readiness.mjs",
  "scripts/validate-ag52c-source-reference-image-disclaimer-readiness.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag52aReview = readJson("data/content-intelligence/quality-reviews/ag52a-secret-environment-service-role-safety-audit.json");
const ag52bReview = readJson("data/content-intelligence/quality-reviews/ag52b-rls-grants-public-exposure-audit.json");
const ag52bRlsPolicyAudit = readJson("data/content-intelligence/security-compliance/ag52b-rls-policy-exposure-audit-record.json");
const ag52bGrantsAudit = readJson("data/content-intelligence/security-compliance/ag52b-grants-permissions-exposure-audit-record.json");
const ag52bPublicSchemaAudit = readJson("data/content-intelligence/security-compliance/ag52b-public-schema-exposure-audit-record.json");
const ag52bAnonAuthenticatedAudit = readJson("data/content-intelligence/security-compliance/ag52b-anon-authenticated-role-exposure-audit-record.json");
const ag52bApiPublicSurfaceAudit = readJson("data/content-intelligence/security-compliance/ag52b-api-public-surface-exposure-audit-record.json");
const ag52bRlsGrantBoundary = readJson("data/content-intelligence/security-compliance/ag52b-rls-grants-public-exposure-boundary.json");
const ag52bNoRlsGrantMutation = readJson("data/content-intelligence/backend-architecture/ag52b-no-rls-grant-mutation-audit.json");
const ag52bNoRuntimeDatabase = readJson("data/content-intelligence/backend-architecture/ag52b-no-runtime-database-api-reading-audit.json");
const ag52bNoBackendDeployment = readJson("data/content-intelligence/backend-architecture/ag52b-no-backend-auth-deployment-audit.json");
const ag52bReadiness = readJson("data/content-intelligence/quality-registry/ag52b-ag52c-source-reference-image-disclaimer-readiness-record.json");
const ag52bBoundary = readJson("data/content-intelligence/mutation-plans/ag52b-to-ag52c-source-reference-image-disclaimer-boundary.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag52aReview.status !== "secret_environment_service_role_safety_audit_ready_for_ag52b") fail("AG52A review status mismatch.");
if (ag52bReview.status !== "rls_grants_public_exposure_audit_ready_for_ag52c") fail("AG52B review status mismatch.");
if (ag52bRlsPolicyAudit.audit_passed !== true) fail("AG52B RLS policy audit must pass.");
if (ag52bGrantsAudit.audit_passed !== true) fail("AG52B grants audit must pass.");
if (ag52bPublicSchemaAudit.audit_passed !== true) fail("AG52B public schema audit must pass.");
if (ag52bAnonAuthenticatedAudit.audit_passed !== true) fail("AG52B anon/authenticated audit must pass.");
if (ag52bApiPublicSurfaceAudit.audit_passed !== true) fail("AG52B API/public surface audit must pass.");
if (!ag52bRlsGrantBoundary.boundary_rules.includes("No database/API runtime read is enabled.")) fail("AG52B runtime DB/API boundary missing.");
if (ag52bNoRlsGrantMutation.audit_passed !== true) fail("AG52B no RLS/grant mutation audit must pass.");
if (ag52bNoRuntimeDatabase.audit_passed !== true) fail("AG52B no runtime database audit must pass.");
if (ag52bNoBackendDeployment.audit_passed !== true) fail("AG52B no backend/deployment audit must pass.");
if (ag52bReadiness.ready_for_ag52c !== true) fail("AG52B readiness must permit AG52C.");
if (ag52bBoundary.next_stage_id !== "AG52C") fail("AG52B boundary must point to AG52C.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag52c-source-reference-image-disclaimer-readiness.json");
const sourceConsumption = readJson("data/content-intelligence/security-compliance/ag52c-source-consumption-record.json");
const sourceReferenceReadiness = readJson("data/content-intelligence/security-compliance/ag52c-source-reference-readiness-record.json");
const imageCreditReadiness = readJson("data/content-intelligence/security-compliance/ag52c-image-credit-attribution-readiness-record.json");
const disclaimerReadiness = readJson("data/content-intelligence/security-compliance/ag52c-disclaimer-public-use-readiness-record.json");
const editorialVerificationReadiness = readJson("data/content-intelligence/security-compliance/ag52c-editorial-verification-readiness-record.json");
const publicUseBoundary = readJson("data/content-intelligence/security-compliance/ag52c-public-use-source-image-disclaimer-boundary.json");
const noRuntimeFetchAudit = readJson("data/content-intelligence/backend-architecture/ag52c-no-reference-fetch-runtime-audit.json");
const noImageScrapeAudit = readJson("data/content-intelligence/backend-architecture/ag52c-no-image-scrape-external-api-audit.json");
const noPublishingMutationAudit = readJson("data/content-intelligence/backend-architecture/ag52c-no-publishing-mutation-audit.json");
const noBackendDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag52c-no-backend-rls-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag52c-ag52d-security-compliance-closure-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag52c-to-ag52d-security-compliance-closure-audit-boundary.json");
const preview = readJson("data/quality/ag52c-source-reference-image-disclaimer-readiness-preview.json");
const pkg = readJson("package.json");

if (review.status !== "source_reference_image_disclaimer_readiness_ready_for_ag52d") fail("AG52C review status mismatch.");

for (const key of [
  "ag52c_source_reference_image_disclaimer_readiness_recorded",
  "ag52b_consumed",
  "source_reference_readiness_recorded",
  "image_credit_attribution_readiness_recorded",
  "disclaimer_public_use_readiness_recorded",
  "editorial_verification_readiness_recorded",
  "public_use_source_image_disclaimer_boundary_recorded",
  "ready_for_ag52d_security_compliance_closure_audit"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag52d !== 0) fail("AG52D blocker count must be zero.");

for (const key of [
  "reference_fetch_runtime_enabled",
  "automated_external_link_checking_enabled",
  "automated_reference_verification_enabled",
  "image_scraping_enabled",
  "image_external_api_enabled",
  "disclaimer_runtime_injection_enabled",
  "public_page_mutation_enabled",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "rls_public_policy_activation_approved",
  "database_permission_change_enabled",
  "supabase_auth_backend_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "deployment_approved",
  "deployment_performed",
  "public_dashboard_exposed"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (sourceConsumption.status !== "source_consumption_recorded") fail("Source consumption status mismatch.");
if (!Object.prototype.hasOwnProperty.call(sourceConsumption.discovered_context_sources, "reference_candidates")) fail("Reference candidates not recorded.");

if (sourceReferenceReadiness.audit_passed !== true) fail("Source/reference readiness must pass.");
if (sourceReferenceReadiness.readiness_position !== "planning_only_no_reference_fetch_runtime") fail("Source/reference readiness must remain planning-only.");

if (imageCreditReadiness.audit_passed !== true) fail("Image-credit readiness must pass.");
if (imageCreditReadiness.readiness_position !== "planning_only_no_image_scraping_or_external_api") fail("Image-credit readiness must remain planning-only.");

if (disclaimerReadiness.audit_passed !== true) fail("Disclaimer readiness must pass.");
if (disclaimerReadiness.readiness_position !== "planning_only_no_runtime_disclaimer_injection") fail("Disclaimer readiness must remain planning-only.");

if (editorialVerificationReadiness.audit_passed !== true) fail("Editorial verification readiness must pass.");
if (!editorialVerificationReadiness.planned_statuses_design_only.includes("source_under_editorial_verification")) fail("Editorial verification status missing.");

if (!publicUseBoundary.boundary_rules.includes("No reference fetching runtime is enabled.")) fail("No reference fetch boundary missing.");
if (!publicUseBoundary.boundary_rules.includes("No public page mutation or content publishing is performed.")) fail("No public mutation/publishing boundary missing.");

if (noRuntimeFetchAudit.audit_passed !== true) fail("No reference fetch runtime audit must pass.");
if (noRuntimeFetchAudit.failed_checks.length !== 0) fail("No reference fetch failed checks must be zero.");

if (noImageScrapeAudit.audit_passed !== true) fail("No image scrape audit must pass.");
if (noImageScrapeAudit.failed_checks.length !== 0) fail("No image scrape failed checks must be zero.");

if (noPublishingMutationAudit.audit_passed !== true) fail("No publishing mutation audit must pass.");
if (noPublishingMutationAudit.failed_checks.length !== 0) fail("No publishing mutation failed checks must be zero.");

if (noBackendDeploymentAudit.audit_passed !== true) fail("No backend/RLS/deployment audit must pass.");
if (noBackendDeploymentAudit.failed_checks.length !== 0) fail("No backend/RLS/deployment failed checks must be zero.");

if (readiness.status !== "ready_for_ag52d_security_compliance_closure_audit") fail("AG52D readiness status mismatch.");
if (readiness.ready_for_ag52d !== true) fail("AG52D readiness must be true.");
if (readiness.next_stage_id !== "AG52D") fail("Readiness must point to AG52D.");
if (!readiness.ag52d_blocked_scope.includes("Content publishing")) fail("AG52D must block content publishing.");

if (boundary.next_stage_id !== "AG52D") fail("Boundary must point to AG52D.");

for (const key of [
  "ag52c_source_reference_image_disclaimer_readiness_recorded",
  "ag52b_consumed",
  "source_reference_readiness_recorded",
  "image_credit_attribution_readiness_recorded",
  "disclaimer_public_use_readiness_recorded",
  "editorial_verification_readiness_recorded",
  "public_use_source_image_disclaimer_boundary_recorded",
  "ready_for_ag52d_security_compliance_closure_audit"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "reference_fetch_runtime_enabled",
  "automated_external_link_checking_enabled",
  "automated_reference_verification_enabled",
  "image_scraping_enabled",
  "image_external_api_enabled",
  "disclaimer_runtime_injection_enabled",
  "public_page_mutation_enabled",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "rls_public_policy_activation_approved",
  "database_permission_change_enabled",
  "supabase_auth_backend_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "deployment_approved",
  "deployment_performed",
  "public_dashboard_exposed"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag52c"]) fail("Missing package script: generate:ag52c");
if (!pkg.scripts?.["validate:ag52c"]) fail("Missing package script: validate:ag52c");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag52c")) fail("validate:project must include validate:ag52c.");

pass("AG52C Source, Reference, Image Credit and Disclaimer Readiness is present.");
pass("AG52B RLS/grants/public exposure audit is consumed.");
pass("Source/reference readiness is valid.");
pass("Image-credit/attribution readiness is valid.");
pass("Disclaimer/public-use readiness is valid.");
pass("Editorial verification readiness is valid.");
pass("Public-use source/image/disclaimer boundary is valid.");
pass("No reference fetch runtime audit is valid.");
pass("No image scrape / external API audit is valid.");
pass("No publishing/public page mutation audit is valid.");
pass("No backend/RLS/deployment audit is valid.");
pass("AG52D security and compliance closure audit readiness is valid.");
