import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG53Z validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag53a-performance-page-weight-review.json",
  "data/content-intelligence/quality-reviews/ag53b-seo-metadata-sitemap-robots-review.json",
  "data/content-intelligence/quality-reviews/ag53c-mobile-accessibility-qa.json",
  "data/content-intelligence/quality-reviews/ag53d-public-ux-browser-compatibility-audit.json",
  "data/content-intelligence/public-quality/ag53a-public-html-asset-inventory-record.json",
  "data/content-intelligence/public-quality/ag53b-seo-metadata-inventory-record.json",
  "data/content-intelligence/public-quality/ag53c-mobile-layout-readiness-record.json",
  "data/content-intelligence/public-quality/ag53d-public-ux-flow-readiness-record.json",
  "data/content-intelligence/backend-architecture/ag53d-no-browser-automation-external-compatibility-api-audit.json",
  "data/content-intelligence/backend-architecture/ag53d-no-public-page-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag53d-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag53d-ag53z-public-quality-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag53d-to-ag53z-public-quality-closure-boundary.json",
  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json",
  "data/content-intelligence/security-compliance/ag52z-security-privacy-legal-posture-record.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  "data/content-intelligence/public-quality/ag53z-public-quality-closure-record.json",
  "data/content-intelligence/public-quality/ag53z-ag53a-to-ag53d-consumption-summary.json",
  "data/content-intelligence/public-quality/ag53z-public-quality-posture-record.json",
  "data/content-intelligence/public-quality/ag53z-carry-forward-public-quality-deferral-register.json",
  "data/content-intelligence/ag-roadmap/ag53z-to-ag54-release-operations-handoff.json",
  "data/content-intelligence/backend-architecture/ag53z-no-browser-automation-external-api-audit.json",
  "data/content-intelligence/backend-architecture/ag53z-no-public-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag53z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag53z-ag54a-backup-restore-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag53z-to-ag54a-backup-restore-boundary.json",
  "data/quality/ag53z-public-quality-closure.json",
  "data/quality/ag53z-public-quality-closure-preview.json",
  "docs/quality/AG53Z_PUBLIC_QUALITY_CLOSURE.md",
  "scripts/generate-ag53z-public-quality-closure.mjs",
  "scripts/validate-ag53z-public-quality-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag53aReview = readJson("data/content-intelligence/quality-reviews/ag53a-performance-page-weight-review.json");
const ag53bReview = readJson("data/content-intelligence/quality-reviews/ag53b-seo-metadata-sitemap-robots-review.json");
const ag53cReview = readJson("data/content-intelligence/quality-reviews/ag53c-mobile-accessibility-qa.json");
const ag53dReview = readJson("data/content-intelligence/quality-reviews/ag53d-public-ux-browser-compatibility-audit.json");
const ag53dReadiness = readJson("data/content-intelligence/quality-registry/ag53d-ag53z-public-quality-closure-readiness-record.json");
const ag53dBoundary = readJson("data/content-intelligence/mutation-plans/ag53d-to-ag53z-public-quality-closure-boundary.json");

if (ag53aReview.status !== "performance_page_weight_review_ready_for_ag53b") fail("AG53A status mismatch.");
if (ag53bReview.status !== "seo_metadata_sitemap_robots_review_ready_for_ag53c") fail("AG53B status mismatch.");
if (ag53cReview.status !== "mobile_accessibility_qa_ready_for_ag53d") fail("AG53C status mismatch.");
if (ag53dReview.status !== "public_ux_browser_compatibility_audit_ready_for_ag53z") fail("AG53D status mismatch.");
if (ag53dReview.summary.ready_for_ag53z_public_quality_closure !== true) fail("AG53D must be ready for AG53Z.");
if (ag53dReadiness.ready_for_ag53z !== true) fail("AG53D readiness must permit AG53Z.");
if (ag53dBoundary.next_stage_id !== "AG53Z") fail("AG53D boundary must point to AG53Z.");

for (const file of [
  "data/content-intelligence/public-quality/ag53a-public-html-asset-inventory-record.json",
  "data/content-intelligence/public-quality/ag53b-seo-metadata-inventory-record.json",
  "data/content-intelligence/public-quality/ag53c-mobile-layout-readiness-record.json",
  "data/content-intelligence/public-quality/ag53d-public-ux-flow-readiness-record.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

for (const file of [
  "data/content-intelligence/backend-architecture/ag53d-no-browser-automation-external-compatibility-api-audit.json",
  "data/content-intelligence/backend-architecture/ag53d-no-public-page-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag53d-no-backend-auth-rls-database-runtime-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const ag52zReview = readJson("data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json");
const ag52zCarryForward = readJson("data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json");
const ag52zPosture = readJson("data/content-intelligence/security-compliance/ag52z-security-privacy-legal-posture-record.json");
const ag51zReview = readJson("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") fail("AG52Z status mismatch.");
if (!ag52zCarryForward.deferred_items.includes("deployment")) fail("Deployment deferral missing from AG52Z.");
if (ag52zPosture.posture_summary.public_quality_review !== "ready_for_AG53_planning_only") fail("AG52Z public quality posture mismatch.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") fail("AG51Z status mismatch.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json");
const closureRecord = readJson("data/content-intelligence/public-quality/ag53z-public-quality-closure-record.json");
const consumptionSummary = readJson("data/content-intelligence/public-quality/ag53z-ag53a-to-ag53d-consumption-summary.json");
const postureRecord = readJson("data/content-intelligence/public-quality/ag53z-public-quality-posture-record.json");
const carryForward = readJson("data/content-intelligence/public-quality/ag53z-carry-forward-public-quality-deferral-register.json");
const ag54Handoff = readJson("data/content-intelligence/ag-roadmap/ag53z-to-ag54-release-operations-handoff.json");
const noBrowserExternal = readJson("data/content-intelligence/backend-architecture/ag53z-no-browser-automation-external-api-audit.json");
const noPublicMutation = readJson("data/content-intelligence/backend-architecture/ag53z-no-public-mutation-publishing-deployment-audit.json");
const noBackendRuntime = readJson("data/content-intelligence/backend-architecture/ag53z-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag53z-ag54a-backup-restore-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag53z-to-ag54a-backup-restore-boundary.json");
const preview = readJson("data/quality/ag53z-public-quality-closure-preview.json");
const pkg = readJson("package.json");

if (review.status !== "public_quality_closed_ready_for_ag54a") fail("AG53Z review status mismatch.");

for (const key of [
  "ag53z_public_quality_closed",
  "ag53a_ag53b_ag53c_ag53d_consumed",
  "public_quality_closure_completed",
  "ag54a_backup_restore_handoff_created",
  "ready_for_ag54a_backup_restore_plan"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag54a !== 0) fail("AG54A blocker count must be zero.");
if (closureRecord.status !== "public_quality_closure_completed") fail("Closure record status mismatch.");
if (closureRecord.closure_allowed !== true) fail("Closure must be allowed.");

for (const stage of ["AG53A", "AG53B", "AG53C", "AG53D"]) {
  if (!JSON.stringify(consumptionSummary.consumed_outputs).includes(stage)) fail(`Consumption summary missing ${stage}.`);
}

if (postureRecord.posture_summary.release_operations !== "ready_for_AG54_planning_only") fail("AG54 posture handoff mismatch.");
if (ag54Handoff.next_stage_id !== "AG54A") fail("AG54 handoff must point to AG54A.");
if (readiness.ready_for_ag54a !== true) fail("AG54A readiness must be true.");
if (readiness.next_stage_id !== "AG54A") fail("Readiness must point to AG54A.");
if (boundary.next_stage_id !== "AG54A") fail("Boundary must point to AG54A.");

for (const item of [
  "browser automation runtime",
  "external browser compatibility API",
  "external audit API",
  "public page mutation",
  "content publishing",
  "deployment",
  "backend/Auth/Supabase activation",
  "runtime database/API reading",
  "RLS/grant mutation"
]) {
  if (!carryForward.deferred_items.includes(item)) fail(`Carry-forward missing: ${item}`);
}

for (const audit of [noBrowserExternal, noPublicMutation, noBackendRuntime]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

for (const key of [
  "browser_automation_enabled",
  "external_browser_compatibility_api_enabled",
  "external_audit_api_enabled",
  "lighthouse_runtime_enabled",
  "external_fetch_enabled",
  "accessibility_crawler_runtime_enabled",
  "crawler_runtime_enabled",
  "public_metadata_mutation_enabled",
  "sitemap_generation_runtime_enabled",
  "robots_deployment_enabled",
  "public_page_mutation_enabled",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "deployment_approved",
  "deployment_performed",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "public_dashboard_exposed",
  "image_scraping_enabled",
  "image_external_api_enabled"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag53z"]) fail("Missing package script: generate:ag53z");
if (!pkg.scripts?.["validate:ag53z"]) fail("Missing package script: validate:ag53z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag53z")) fail("validate:project must include validate:ag53z.");

pass("AG53Z Public Quality Closure is present.");
pass("AG53A–AG53D outputs are consumed.");
pass("Public quality closure record is valid.");
pass("Public quality posture and carry-forward deferral register are valid.");
pass("AG54A backup/restore handoff is valid.");
pass("No browser automation/external API audit is valid.");
pass("No public mutation/publishing/deployment audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG54A backup and restore readiness is valid.");
