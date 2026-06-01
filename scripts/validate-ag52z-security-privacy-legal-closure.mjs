import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG52Z validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag52a-secret-environment-service-role-safety-audit.json",
  "data/content-intelligence/quality-reviews/ag52b-rls-grants-public-exposure-audit.json",
  "data/content-intelligence/quality-reviews/ag52c-source-reference-image-disclaimer-readiness.json",
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
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/security-compliance/ag52z-security-privacy-legal-closure-record.json",
  "data/content-intelligence/security-compliance/ag52z-ag52a-to-ag52d-consumption-summary.json",
  "data/content-intelligence/security-compliance/ag52z-security-privacy-legal-posture-record.json",
  "data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json",
  "data/content-intelligence/ag-roadmap/ag52z-to-ag53-public-quality-handoff.json",
  "data/content-intelligence/backend-architecture/ag52z-no-runtime-backend-auth-rls-audit.json",
  "data/content-intelligence/backend-architecture/ag52z-no-secret-service-role-exposure-audit.json",
  "data/content-intelligence/backend-architecture/ag52z-no-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag52z-no-external-fetch-scrape-audit.json",
  "data/content-intelligence/quality-registry/ag52z-ag53a-performance-page-weight-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag52z-to-ag53a-performance-page-weight-boundary.json",
  "data/quality/ag52z-security-privacy-legal-closure.json",
  "data/quality/ag52z-security-privacy-legal-closure-preview.json",
  "docs/quality/AG52Z_SECURITY_PRIVACY_LEGAL_CLOSURE.md",
  "scripts/generate-ag52z-security-privacy-legal-closure.mjs",
  "scripts/validate-ag52z-security-privacy-legal-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag52aReview = readJson("data/content-intelligence/quality-reviews/ag52a-secret-environment-service-role-safety-audit.json");
const ag52bReview = readJson("data/content-intelligence/quality-reviews/ag52b-rls-grants-public-exposure-audit.json");
const ag52cReview = readJson("data/content-intelligence/quality-reviews/ag52c-source-reference-image-disclaimer-readiness.json");
const ag52dReview = readJson("data/content-intelligence/quality-reviews/ag52d-security-compliance-closure-audit.json");
const ag52dRiskRegister = readJson("data/content-intelligence/security-compliance/ag52d-combined-security-compliance-risk-register.json");
const ag52dReadiness = readJson("data/content-intelligence/quality-registry/ag52d-ag52z-security-privacy-legal-closure-readiness-record.json");
const ag52dBoundary = readJson("data/content-intelligence/mutation-plans/ag52d-to-ag52z-security-privacy-legal-closure-boundary.json");
const ag51zReview = readJson("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag52aReview.status !== "secret_environment_service_role_safety_audit_ready_for_ag52b") fail("AG52A status mismatch.");
if (ag52bReview.status !== "rls_grants_public_exposure_audit_ready_for_ag52c") fail("AG52B status mismatch.");
if (ag52cReview.status !== "source_reference_image_disclaimer_readiness_ready_for_ag52d") fail("AG52C status mismatch.");
if (ag52dReview.status !== "security_compliance_closure_audit_ready_for_ag52z") fail("AG52D status mismatch.");
if (ag52dReview.summary.ready_for_ag52z_security_privacy_legal_closure !== true) fail("AG52D must be ready for AG52Z.");
if (ag52dRiskRegister.current_hard_blocker_count !== 0) fail("AG52D risk register blockers must be zero.");
if (ag52dReadiness.ready_for_ag52z !== true) fail("AG52D readiness must permit AG52Z.");
if (ag52dBoundary.next_stage_id !== "AG52Z") fail("AG52D boundary must point to AG52Z.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") fail("AG51Z status mismatch.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

for (const file of [
  "data/content-intelligence/security-compliance/ag52d-ag52a-secret-environment-service-role-audit.json",
  "data/content-intelligence/security-compliance/ag52d-ag52b-rls-grants-public-exposure-audit.json",
  "data/content-intelligence/security-compliance/ag52d-ag52c-source-reference-image-disclaimer-audit.json",
  "data/content-intelligence/security-compliance/ag52d-security-compliance-closure-readiness-audit-record.json"
]) {
  const audit = readJson(file);
  if (audit.audit_result !== "passed") fail(`${file} must pass.`);
}

for (const file of [
  "data/content-intelligence/backend-architecture/ag52d-no-runtime-backend-rls-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag52d-no-service-role-secret-exposure-audit.json",
  "data/content-intelligence/backend-architecture/ag52d-no-publishing-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag52d-no-external-fetch-scrape-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json");
const closureRecord = readJson("data/content-intelligence/security-compliance/ag52z-security-privacy-legal-closure-record.json");
const consumptionSummary = readJson("data/content-intelligence/security-compliance/ag52z-ag52a-to-ag52d-consumption-summary.json");
const postureRecord = readJson("data/content-intelligence/security-compliance/ag52z-security-privacy-legal-posture-record.json");
const carryForward = readJson("data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json");
const ag53Handoff = readJson("data/content-intelligence/ag-roadmap/ag52z-to-ag53-public-quality-handoff.json");
const noRuntimeAudit = readJson("data/content-intelligence/backend-architecture/ag52z-no-runtime-backend-auth-rls-audit.json");
const noSecretAudit = readJson("data/content-intelligence/backend-architecture/ag52z-no-secret-service-role-exposure-audit.json");
const noPublishAudit = readJson("data/content-intelligence/backend-architecture/ag52z-no-publishing-deployment-audit.json");
const noFetchAudit = readJson("data/content-intelligence/backend-architecture/ag52z-no-external-fetch-scrape-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag52z-ag53a-performance-page-weight-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag52z-to-ag53a-performance-page-weight-boundary.json");
const preview = readJson("data/quality/ag52z-security-privacy-legal-closure-preview.json");
const pkg = readJson("package.json");

if (review.status !== "security_privacy_legal_closed_ready_for_ag53a") fail("AG52Z review status mismatch.");

for (const key of [
  "ag52z_security_privacy_legal_closed",
  "ag52a_ag52b_ag52c_ag52d_consumed",
  "security_privacy_legal_closure_completed",
  "ag53a_performance_page_weight_handoff_created",
  "ready_for_ag53a_performance_page_weight_review"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag53a !== 0) fail("AG53A blocker count must be zero.");
if (closureRecord.status !== "security_privacy_legal_closure_completed") fail("Closure record status mismatch.");
if (closureRecord.closure_allowed !== true) fail("Closure must be allowed.");

for (const stage of ["AG52A", "AG52B", "AG52C", "AG52D"]) {
  if (!JSON.stringify(consumptionSummary.consumed_outputs).includes(stage)) fail(`Consumption summary missing ${stage}.`);
}

if (postureRecord.posture_summary.public_quality_review !== "ready_for_AG53_planning_only") fail("AG53 posture handoff mismatch.");
if (ag53Handoff.next_stage_id !== "AG53A") fail("AG53 handoff must point to AG53A.");
if (readiness.ready_for_ag53a !== true) fail("AG53A readiness must be true.");
if (readiness.next_stage_id !== "AG53A") fail("Readiness must point to AG53A.");
if (boundary.next_stage_id !== "AG53A") fail("Boundary must point to AG53A.");

for (const item of [
  "backend/Auth/Supabase activation",
  "service-role use",
  "runtime database/API reading",
  "RLS/grant mutation",
  "reference fetching runtime",
  "image scraping/external image API",
  "content publishing",
  "deployment"
]) {
  if (!carryForward.deferred_items.includes(item)) fail(`Carry-forward missing: ${item}`);
}

for (const audit of [noRuntimeAudit, noSecretAudit, noPublishAudit, noFetchAudit]) {
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

if (!pkg.scripts?.["generate:ag52z"]) fail("Missing package script: generate:ag52z");
if (!pkg.scripts?.["validate:ag52z"]) fail("Missing package script: validate:ag52z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag52z")) fail("validate:project must include validate:ag52z.");

pass("AG52Z Security/Privacy/Legal Closure is present.");
pass("AG52A–AG52D outputs are consumed.");
pass("Security/privacy/legal closure record is valid.");
pass("Security posture and carry-forward deferral register are valid.");
pass("AG53A public quality handoff is valid.");
pass("No runtime/backend/Auth/RLS audit is valid.");
pass("No secret/service-role exposure audit is valid.");
pass("No publishing/deployment audit is valid.");
pass("No external fetch/scrape audit is valid.");
pass("AG53A performance/page-weight readiness is valid.");
