import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(full(p), "utf8"));
}

function fail(message) {
  console.error(`❌ AG52D validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag52a-secret-environment-service-role-safety-audit.json",
  "data/content-intelligence/quality-reviews/ag52b-rls-grants-public-exposure-audit.json",
  "data/content-intelligence/quality-reviews/ag52c-source-reference-image-disclaimer-readiness.json",

  "data/content-intelligence/security-compliance/ag52a-repo-secret-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-environment-file-handling-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-service-role-key-safety-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-browser-public-config-exposure-audit-record.json",

  "data/content-intelligence/security-compliance/ag52b-rls-policy-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52b-grants-permissions-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52b-public-schema-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52b-anon-authenticated-role-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52b-api-public-surface-exposure-audit-record.json",

  "data/content-intelligence/security-compliance/ag52c-source-reference-readiness-record.json",
  "data/content-intelligence/security-compliance/ag52c-image-credit-attribution-readiness-record.json",
  "data/content-intelligence/security-compliance/ag52c-disclaimer-public-use-readiness-record.json",
  "data/content-intelligence/security-compliance/ag52c-editorial-verification-readiness-record.json",
  "data/content-intelligence/security-compliance/ag52c-public-use-source-image-disclaimer-boundary.json",
  "data/content-intelligence/quality-registry/ag52c-ag52d-security-compliance-closure-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag52c-to-ag52d-security-compliance-closure-audit-boundary.json",

  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag52d-security-compliance-closure-audit.json",
  "data/content-intelligence/security-compliance/ag52d-ag52a-secret-environment-service-role-audit.json",
  "data/content-intelligence/security-compliance/ag52d-ag52b-rls-grants-public-exposure-audit.json",
  "data/content-intelligence/security-compliance/ag52d-ag52c-source-reference-image-disclaimer-audit.json",
  "data/content-intelligence/security-compliance/ag52d-combined-security-compliance-risk-register.json",
  "data/content-intelligence/security-compliance/ag52d-security-compliance-closure-readiness-audit-record.json",
  "data/content-intelligence/backend-architecture/ag52d-no-runtime-backend-rls-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag52d-no-service-role-secret-exposure-audit.json",
  "data/content-intelligence/backend-architecture/ag52d-no-publishing-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag52d-no-external-fetch-scrape-audit.json",
  "data/content-intelligence/quality-registry/ag52d-ag52z-security-privacy-legal-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag52d-to-ag52z-security-privacy-legal-closure-boundary.json",
  "data/quality/ag52d-security-compliance-closure-audit.json",
  "data/quality/ag52d-security-compliance-closure-audit-preview.json",
  "docs/quality/AG52D_SECURITY_COMPLIANCE_CLOSURE_AUDIT.md",
  "scripts/generate-ag52d-security-compliance-closure-audit.mjs",
  "scripts/validate-ag52d-security-compliance-closure-audit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag52aReview = readJson("data/content-intelligence/quality-reviews/ag52a-secret-environment-service-role-safety-audit.json");
const ag52bReview = readJson("data/content-intelligence/quality-reviews/ag52b-rls-grants-public-exposure-audit.json");
const ag52cReview = readJson("data/content-intelligence/quality-reviews/ag52c-source-reference-image-disclaimer-readiness.json");

if (ag52aReview.status !== "secret_environment_service_role_safety_audit_ready_for_ag52b") {
  fail("AG52A review status mismatch.");
}

if (ag52bReview.status !== "rls_grants_public_exposure_audit_ready_for_ag52c") {
  fail("AG52B review status mismatch.");
}

if (ag52cReview.status !== "source_reference_image_disclaimer_readiness_ready_for_ag52d") {
  fail("AG52C review status mismatch.");
}

const ag52cReadiness = readJson("data/content-intelligence/quality-registry/ag52c-ag52d-security-compliance-closure-audit-readiness-record.json");
const ag52cBoundary = readJson("data/content-intelligence/mutation-plans/ag52c-to-ag52d-security-compliance-closure-audit-boundary.json");

if (ag52cReadiness.ready_for_ag52d !== true) fail("AG52C readiness must permit AG52D.");
if (ag52cBoundary.next_stage_id !== "AG52D") fail("AG52C boundary must point to AG52D.");

const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");
if (adb20Api.website_database_reading_enabled !== false) {
  fail("Website DB reading must remain disabled.");
}

const auditInputs = [
  "data/content-intelligence/security-compliance/ag52a-repo-secret-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-environment-file-handling-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-service-role-key-safety-audit-record.json",
  "data/content-intelligence/security-compliance/ag52a-browser-public-config-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52b-rls-policy-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52b-grants-permissions-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52b-public-schema-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52b-anon-authenticated-role-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52b-api-public-surface-exposure-audit-record.json",
  "data/content-intelligence/security-compliance/ag52c-source-reference-readiness-record.json",
  "data/content-intelligence/security-compliance/ag52c-image-credit-attribution-readiness-record.json",
  "data/content-intelligence/security-compliance/ag52c-disclaimer-public-use-readiness-record.json",
  "data/content-intelligence/security-compliance/ag52c-editorial-verification-readiness-record.json"
];

for (const file of auditInputs) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must have audit_passed=true.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag52d-security-compliance-closure-audit.json");
const ag52aAudit = readJson("data/content-intelligence/security-compliance/ag52d-ag52a-secret-environment-service-role-audit.json");
const ag52bAudit = readJson("data/content-intelligence/security-compliance/ag52d-ag52b-rls-grants-public-exposure-audit.json");
const ag52cAudit = readJson("data/content-intelligence/security-compliance/ag52d-ag52c-source-reference-image-disclaimer-audit.json");
const riskRegister = readJson("data/content-intelligence/security-compliance/ag52d-combined-security-compliance-risk-register.json");
const closureAudit = readJson("data/content-intelligence/security-compliance/ag52d-security-compliance-closure-readiness-audit-record.json");
const noRuntimeAudit = readJson("data/content-intelligence/backend-architecture/ag52d-no-runtime-backend-rls-deployment-audit.json");
const noSecretAudit = readJson("data/content-intelligence/backend-architecture/ag52d-no-service-role-secret-exposure-audit.json");
const noPublishingAudit = readJson("data/content-intelligence/backend-architecture/ag52d-no-publishing-public-mutation-audit.json");
const noFetchAudit = readJson("data/content-intelligence/backend-architecture/ag52d-no-external-fetch-scrape-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag52d-ag52z-security-privacy-legal-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag52d-to-ag52z-security-privacy-legal-closure-boundary.json");
const preview = readJson("data/quality/ag52d-security-compliance-closure-audit-preview.json");
const pkg = readJson("package.json");

if (review.status !== "security_compliance_closure_audit_ready_for_ag52z") {
  fail("AG52D review status mismatch.");
}

for (const key of [
  "ag52d_security_compliance_closure_audit_recorded",
  "ag52a_ag52b_ag52c_consumed",
  "ag52a_security_audit_passed",
  "ag52b_exposure_audit_passed",
  "ag52c_readiness_audit_passed",
  "combined_security_compliance_risk_register_recorded",
  "security_compliance_closure_readiness_audit_passed",
  "ready_for_ag52z_security_privacy_legal_closure"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag52z !== 0) fail("AG52Z blocker count must be zero.");
if (riskRegister.current_hard_blocker_count !== 0) fail("Combined risk register blocker count must be zero.");

for (const audit of [ag52aAudit, ag52bAudit, ag52cAudit, closureAudit]) {
  if (audit.audit_result !== "passed") fail(`${audit.title} must pass.`);
  if (Array.isArray(audit.blocking_gaps) && audit.blocking_gaps.length !== 0) {
    fail(`${audit.title} blocking gaps must be zero.`);
  }
}

for (const audit of [noRuntimeAudit, noSecretAudit, noPublishingAudit, noFetchAudit]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

for (const key of [
  "secret_committed_to_repo",
  "env_file_committed_to_repo",
  "browser_public_secret_exposed",
  "service_role_key_exposed",
  "service_role_key_used",
  "service_role_key_required_for_current_stage",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "rls_public_policy_activation_approved",
  "database_permission_change_enabled",
  "supabase_auth_backend_activation_approved",
  "backend_auth_supabase_activation_performed",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "reference_fetch_runtime_enabled",
  "automated_external_link_checking_enabled",
  "automated_reference_verification_enabled",
  "image_scraping_enabled",
  "image_external_api_enabled",
  "disclaimer_runtime_injection_enabled",
  "public_page_mutation_enabled",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_dashboard_exposed",
  "deployment_approved",
  "deployment_performed"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (readiness.status !== "ready_for_ag52z_security_privacy_legal_closure") {
  fail("AG52Z readiness status mismatch.");
}

if (readiness.ready_for_ag52z !== true) fail("AG52Z readiness must be true.");
if (readiness.next_stage_id !== "AG52Z") fail("Readiness must point to AG52Z.");
if (boundary.next_stage_id !== "AG52Z") fail("Boundary must point to AG52Z.");

if (!pkg.scripts?.["generate:ag52d"]) fail("Missing package script: generate:ag52d");
if (!pkg.scripts?.["validate:ag52d"]) fail("Missing package script: validate:ag52d");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag52d")) {
  fail("validate:project must include validate:ag52d.");
}

pass("AG52D Security and Compliance Closure Audit is present.");
pass("AG52A secret/environment/service-role safety audit is consumed.");
pass("AG52B RLS/grants/public exposure audit is consumed.");
pass("AG52C source/reference/image/disclaimer readiness audit is consumed.");
pass("Combined security/compliance risk register is valid.");
pass("Security/compliance closure readiness audit is valid.");
pass("No runtime/backend/RLS/deployment audit is valid.");
pass("No service-role/secret exposure audit is valid.");
pass("No publishing/public mutation audit is valid.");
pass("No external fetch/scrape audit is valid.");
pass("AG52Z security/privacy/legal closure readiness is valid.");
