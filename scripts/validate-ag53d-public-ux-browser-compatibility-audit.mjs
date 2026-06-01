import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG53D validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag53c-mobile-accessibility-qa.json",
  "data/content-intelligence/public-quality/ag53c-source-consumption-record.json",
  "data/content-intelligence/public-quality/ag53c-mobile-layout-readiness-record.json",
  "data/content-intelligence/public-quality/ag53c-accessibility-semantics-review-record.json",
  "data/content-intelligence/public-quality/ag53c-keyboard-focus-readiness-record.json",
  "data/content-intelligence/public-quality/ag53c-image-alt-text-readiness-record.json",
  "data/content-intelligence/public-quality/ag53c-readability-contrast-readiness-record.json",
  "data/content-intelligence/public-quality/ag53c-mobile-accessibility-qa-boundary.json",
  "data/content-intelligence/backend-architecture/ag53c-no-browser-automation-accessibility-crawler-audit.json",
  "data/content-intelligence/backend-architecture/ag53c-no-public-page-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag53c-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag53c-ag53d-public-ux-browser-compatibility-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag53c-to-ag53d-public-ux-browser-compatibility-boundary.json",

  "data/content-intelligence/quality-reviews/ag53b-seo-metadata-sitemap-robots-review.json",
  "data/content-intelligence/quality-reviews/ag53a-performance-page-weight-review.json",
  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag53d-public-ux-browser-compatibility-audit.json",
  "data/content-intelligence/public-quality/ag53d-source-consumption-record.json",
  "data/content-intelligence/public-quality/ag53d-public-ux-flow-readiness-record.json",
  "data/content-intelligence/public-quality/ag53d-navigation-reading-surface-review-record.json",
  "data/content-intelligence/public-quality/ag53d-browser-compatibility-planning-record.json",
  "data/content-intelligence/public-quality/ag53d-fallback-error-surface-readiness-record.json",
  "data/content-intelligence/public-quality/ag53d-public-ux-browser-compatibility-boundary.json",
  "data/content-intelligence/backend-architecture/ag53d-no-browser-automation-external-compatibility-api-audit.json",
  "data/content-intelligence/backend-architecture/ag53d-no-public-page-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag53d-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag53d-ag53z-public-quality-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag53d-to-ag53z-public-quality-closure-boundary.json",
  "data/quality/ag53d-public-ux-browser-compatibility-audit.json",
  "data/quality/ag53d-public-ux-browser-compatibility-audit-preview.json",
  "docs/quality/AG53D_PUBLIC_UX_BROWSER_COMPATIBILITY_AUDIT.md",
  "scripts/generate-ag53d-public-ux-browser-compatibility-audit.mjs",
  "scripts/validate-ag53d-public-ux-browser-compatibility-audit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag53cReview = readJson("data/content-intelligence/quality-reviews/ag53c-mobile-accessibility-qa.json");
const ag53cSourceConsumption = readJson("data/content-intelligence/public-quality/ag53c-source-consumption-record.json");
const ag53cMobileLayout = readJson("data/content-intelligence/public-quality/ag53c-mobile-layout-readiness-record.json");
const ag53cAccessibilitySemantics = readJson("data/content-intelligence/public-quality/ag53c-accessibility-semantics-review-record.json");
const ag53cKeyboardFocus = readJson("data/content-intelligence/public-quality/ag53c-keyboard-focus-readiness-record.json");
const ag53cImageAlt = readJson("data/content-intelligence/public-quality/ag53c-image-alt-text-readiness-record.json");
const ag53cReadabilityContrast = readJson("data/content-intelligence/public-quality/ag53c-readability-contrast-readiness-record.json");
const ag53cQaBoundary = readJson("data/content-intelligence/public-quality/ag53c-mobile-accessibility-qa-boundary.json");
const ag53cNoBrowserAutomation = readJson("data/content-intelligence/backend-architecture/ag53c-no-browser-automation-accessibility-crawler-audit.json");
const ag53cNoPublicMutation = readJson("data/content-intelligence/backend-architecture/ag53c-no-public-page-mutation-publishing-deployment-audit.json");
const ag53cNoBackendRuntime = readJson("data/content-intelligence/backend-architecture/ag53c-no-backend-auth-rls-database-runtime-audit.json");
const ag53cReadiness = readJson("data/content-intelligence/quality-registry/ag53c-ag53d-public-ux-browser-compatibility-readiness-record.json");
const ag53cBoundary = readJson("data/content-intelligence/mutation-plans/ag53c-to-ag53d-public-ux-browser-compatibility-boundary.json");

const ag53bReview = readJson("data/content-intelligence/quality-reviews/ag53b-seo-metadata-sitemap-robots-review.json");
const ag53aReview = readJson("data/content-intelligence/quality-reviews/ag53a-performance-page-weight-review.json");
const ag52zReview = readJson("data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json");
const ag52zCarryForward = readJson("data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json");
const ag51zReview = readJson("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag53cReview.status !== "mobile_accessibility_qa_ready_for_ag53d") fail("AG53C review status mismatch.");
if (ag53cSourceConsumption.status !== "source_consumption_recorded") fail("AG53C source consumption mismatch.");
for (const audit of [ag53cMobileLayout, ag53cAccessibilitySemantics, ag53cKeyboardFocus, ag53cImageAlt, ag53cReadabilityContrast]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}
if (!ag53cQaBoundary.boundary_rules.includes("No browser automation is run.")) fail("AG53C browser automation boundary missing.");
if (!ag53cQaBoundary.boundary_rules.includes("No public page, route, source, image or content mutation is performed.")) fail("AG53C public mutation boundary missing.");
for (const audit of [ag53cNoBrowserAutomation, ag53cNoPublicMutation, ag53cNoBackendRuntime]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}
if (ag53cReadiness.ready_for_ag53d !== true) fail("AG53C readiness must permit AG53D.");
if (ag53cBoundary.next_stage_id !== "AG53D") fail("AG53C boundary must point to AG53D.");

if (ag53bReview.status !== "seo_metadata_sitemap_robots_review_ready_for_ag53c") fail("AG53B review status mismatch.");
if (ag53aReview.status !== "performance_page_weight_review_ready_for_ag53b") fail("AG53A review status mismatch.");
if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") fail("AG52Z review status mismatch.");
if (!ag52zCarryForward.deferred_items.includes("deployment")) fail("Deployment deferral missing.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") fail("AG51Z status mismatch.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag53d-public-ux-browser-compatibility-audit.json");
const sourceConsumption = readJson("data/content-intelligence/public-quality/ag53d-source-consumption-record.json");
const publicUx = readJson("data/content-intelligence/public-quality/ag53d-public-ux-flow-readiness-record.json");
const navigationReading = readJson("data/content-intelligence/public-quality/ag53d-navigation-reading-surface-review-record.json");
const browserCompatibility = readJson("data/content-intelligence/public-quality/ag53d-browser-compatibility-planning-record.json");
const fallbackError = readJson("data/content-intelligence/public-quality/ag53d-fallback-error-surface-readiness-record.json");
const uxBoundary = readJson("data/content-intelligence/public-quality/ag53d-public-ux-browser-compatibility-boundary.json");
const noBrowserAutomation = readJson("data/content-intelligence/backend-architecture/ag53d-no-browser-automation-external-compatibility-api-audit.json");
const noPublicMutation = readJson("data/content-intelligence/backend-architecture/ag53d-no-public-page-mutation-publishing-deployment-audit.json");
const noBackendRuntime = readJson("data/content-intelligence/backend-architecture/ag53d-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag53d-ag53z-public-quality-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag53d-to-ag53z-public-quality-closure-boundary.json");
const preview = readJson("data/quality/ag53d-public-ux-browser-compatibility-audit-preview.json");
const pkg = readJson("package.json");

if (review.status !== "public_ux_browser_compatibility_audit_ready_for_ag53z") fail("AG53D review status mismatch.");

for (const key of [
  "ag53d_public_ux_browser_compatibility_audit_recorded",
  "ag53c_consumed",
  "public_ux_flow_review_recorded",
  "navigation_reading_surface_review_recorded",
  "browser_compatibility_planning_recorded",
  "fallback_error_surface_readiness_recorded",
  "public_ux_browser_compatibility_boundary_recorded",
  "ready_for_ag53z_public_quality_closure"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag53z !== 0) fail("AG53Z blocker count must be zero.");
if (sourceConsumption.status !== "source_consumption_recorded") fail("Source consumption status mismatch.");

for (const audit of [publicUx, navigationReading, browserCompatibility, fallbackError]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}

if (publicUx.review_position !== "static_public_ux_planning_only_no_browser_runtime") fail("Public UX review must remain static-only.");
if (navigationReading.review_position !== "static_navigation_reading_review_only_no_route_mutation") fail("Navigation/reading review must remain static-only.");
if (browserCompatibility.review_position !== "static_browser_compatibility_planning_only_no_browser_automation") fail("Browser compatibility review must remain static-only.");
if (fallbackError.review_position !== "static_fallback_review_only_no_error_runtime_scan") fail("Fallback/error review must remain static-only.");

if (!uxBoundary.boundary_rules.includes("No browser automation is run.")) fail("No browser automation boundary missing.");
if (!uxBoundary.boundary_rules.includes("No public page, route, source, image, metadata or content mutation is performed.")) fail("No public mutation boundary missing.");

for (const audit of [noBrowserAutomation, noPublicMutation, noBackendRuntime]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag53z_public_quality_closure") fail("AG53Z readiness status mismatch.");
if (readiness.ready_for_ag53z !== true) fail("AG53Z readiness must be true.");
if (readiness.next_stage_id !== "AG53Z") fail("Readiness must point to AG53Z.");
if (boundary.next_stage_id !== "AG53Z") fail("Boundary must point to AG53Z.");

for (const key of [
  "browser_automation_enabled",
  "external_browser_compatibility_api_enabled",
  "external_audit_api_enabled",
  "lighthouse_runtime_enabled",
  "external_fetch_enabled",
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
  "image_external_api_enabled",
  "crawler_runtime_enabled",
  "accessibility_crawler_runtime_enabled"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag53d"]) fail("Missing package script: generate:ag53d");
if (!pkg.scripts?.["validate:ag53d"]) fail("Missing package script: validate:ag53d");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag53d")) fail("validate:project must include validate:ag53d.");

pass("AG53D Public UX and Browser Compatibility Audit is present.");
pass("AG53C mobile/accessibility QA is consumed.");
pass("Public UX flow readiness is valid.");
pass("Navigation and reading surface review is valid.");
pass("Browser compatibility planning is valid.");
pass("Fallback and error surface readiness is valid.");
pass("Public UX/browser compatibility boundary is valid.");
pass("No browser automation/external compatibility API audit is valid.");
pass("No public mutation/publishing/deployment audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG53Z public quality closure readiness is valid.");
