import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG53A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/security-compliance/ag52z-security-privacy-legal-closure-record.json",
  "data/content-intelligence/security-compliance/ag52z-security-privacy-legal-posture-record.json",
  "data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json",
  "data/content-intelligence/ag-roadmap/ag52z-to-ag53-public-quality-handoff.json",
  "data/content-intelligence/quality-registry/ag52z-ag53a-performance-page-weight-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag52z-to-ag53a-performance-page-weight-boundary.json",
  "data/content-intelligence/backend-architecture/ag52z-no-runtime-backend-auth-rls-audit.json",
  "data/content-intelligence/backend-architecture/ag52z-no-secret-service-role-exposure-audit.json",
  "data/content-intelligence/backend-architecture/ag52z-no-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag52z-no-external-fetch-scrape-audit.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag53a-performance-page-weight-review.json",
  "data/content-intelligence/public-quality/ag53a-source-consumption-record.json",
  "data/content-intelligence/public-quality/ag53a-public-html-asset-inventory-record.json",
  "data/content-intelligence/public-quality/ag53a-page-weight-risk-model.json",
  "data/content-intelligence/public-quality/ag53a-image-load-risk-review-record.json",
  "data/content-intelligence/public-quality/ag53a-js-css-load-risk-review-record.json",
  "data/content-intelligence/public-quality/ag53a-mobile-speed-risk-readiness-record.json",
  "data/content-intelligence/public-quality/ag53a-static-performance-review-boundary.json",
  "data/content-intelligence/backend-architecture/ag53a-no-runtime-performance-api-audit.json",
  "data/content-intelligence/backend-architecture/ag53a-no-public-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag53a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag53a-ag53b-seo-metadata-sitemap-robots-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag53a-to-ag53b-seo-metadata-sitemap-robots-boundary.json",
  "data/quality/ag53a-performance-page-weight-review.json",
  "data/quality/ag53a-performance-page-weight-review-preview.json",
  "docs/quality/AG53A_PERFORMANCE_PAGE_WEIGHT_REVIEW.md",
  "scripts/generate-ag53a-performance-page-weight-review.mjs",
  "scripts/validate-ag53a-performance-page-weight-review.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag52zReview = readJson("data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json");
const ag52zClosure = readJson("data/content-intelligence/security-compliance/ag52z-security-privacy-legal-closure-record.json");
const ag52zPosture = readJson("data/content-intelligence/security-compliance/ag52z-security-privacy-legal-posture-record.json");
const ag52zCarryForward = readJson("data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json");
const ag52zHandoff = readJson("data/content-intelligence/ag-roadmap/ag52z-to-ag53-public-quality-handoff.json");
const ag52zReadiness = readJson("data/content-intelligence/quality-registry/ag52z-ag53a-performance-page-weight-readiness-record.json");
const ag52zBoundary = readJson("data/content-intelligence/mutation-plans/ag52z-to-ag53a-performance-page-weight-boundary.json");
const ag51zReview = readJson("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") fail("AG52Z review status mismatch.");
if (ag52zClosure.status !== "security_privacy_legal_closure_completed") fail("AG52Z closure status mismatch.");
if (ag52zPosture.posture_summary.public_quality_review !== "ready_for_AG53_planning_only") fail("AG52Z public-quality posture mismatch.");
if (!ag52zCarryForward.deferred_items.includes("deployment")) fail("Deployment deferral missing.");
if (ag52zHandoff.next_stage_id !== "AG53A") fail("AG52Z handoff must point to AG53A.");
if (ag52zReadiness.ready_for_ag53a !== true) fail("AG52Z readiness must permit AG53A.");
if (ag52zBoundary.next_stage_id !== "AG53A") fail("AG52Z boundary must point to AG53A.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") fail("AG51Z status mismatch.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

for (const file of [
  "data/content-intelligence/backend-architecture/ag52z-no-runtime-backend-auth-rls-audit.json",
  "data/content-intelligence/backend-architecture/ag52z-no-secret-service-role-exposure-audit.json",
  "data/content-intelligence/backend-architecture/ag52z-no-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag52z-no-external-fetch-scrape-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag53a-performance-page-weight-review.json");
const sourceConsumption = readJson("data/content-intelligence/public-quality/ag53a-source-consumption-record.json");
const inventory = readJson("data/content-intelligence/public-quality/ag53a-public-html-asset-inventory-record.json");
const pageWeight = readJson("data/content-intelligence/public-quality/ag53a-page-weight-risk-model.json");
const imageLoad = readJson("data/content-intelligence/public-quality/ag53a-image-load-risk-review-record.json");
const jsCss = readJson("data/content-intelligence/public-quality/ag53a-js-css-load-risk-review-record.json");
const mobileSpeed = readJson("data/content-intelligence/public-quality/ag53a-mobile-speed-risk-readiness-record.json");
const boundaryRecord = readJson("data/content-intelligence/public-quality/ag53a-static-performance-review-boundary.json");
const noPerformanceApi = readJson("data/content-intelligence/backend-architecture/ag53a-no-runtime-performance-api-audit.json");
const noMutation = readJson("data/content-intelligence/backend-architecture/ag53a-no-public-mutation-publishing-deployment-audit.json");
const noBackendRuntime = readJson("data/content-intelligence/backend-architecture/ag53a-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag53a-ag53b-seo-metadata-sitemap-robots-readiness-record.json");
const nextBoundary = readJson("data/content-intelligence/mutation-plans/ag53a-to-ag53b-seo-metadata-sitemap-robots-boundary.json");
const preview = readJson("data/quality/ag53a-performance-page-weight-review-preview.json");
const pkg = readJson("package.json");

if (review.status !== "performance_page_weight_review_ready_for_ag53b") fail("AG53A review status mismatch.");

for (const key of [
  "ag53a_performance_page_weight_review_recorded",
  "ag52z_consumed",
  "public_asset_inventory_recorded",
  "page_weight_risk_model_recorded",
  "image_load_risk_review_recorded",
  "js_css_load_risk_review_recorded",
  "mobile_speed_risk_readiness_recorded",
  "static_performance_review_boundary_recorded",
  "ready_for_ag53b_seo_metadata_sitemap_robots_review"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag53b !== 0) fail("AG53B blocker count must be zero.");
if (sourceConsumption.status !== "source_consumption_recorded") fail("Source consumption status mismatch.");
if (!Object.prototype.hasOwnProperty.call(sourceConsumption.discovered_prior_context, "homepage_article_surface_candidates")) fail("Homepage/article context must be recorded.");

for (const audit of [inventory, pageWeight, imageLoad, jsCss, mobileSpeed]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}

if (inventory.inventory_position !== "static_repo_inventory_only_no_build_no_runtime_scan") fail("Inventory must remain static-only.");
if (pageWeight.runtime_measurement_enabled_now !== false) fail("Runtime measurement must remain disabled.");
if (imageLoad.review_position !== "static_repo_review_only_no_image_api_no_scrape") fail("Image review must remain static-only.");
if (jsCss.review_position !== "static_repo_review_only_no_build_no_deploy") fail("JS/CSS review must remain static-only.");
if (mobileSpeed.runtime_mobile_test_enabled_now !== false) fail("Runtime mobile test must remain disabled.");

if (!boundaryRecord.boundary_rules.includes("No Lighthouse/browser automation is run.")) fail("No Lighthouse boundary missing.");
if (!boundaryRecord.boundary_rules.includes("No public page, asset, image, source or content mutation is performed.")) fail("No public mutation boundary missing.");

for (const audit of [noPerformanceApi, noMutation, noBackendRuntime]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag53b_seo_metadata_sitemap_robots_review") fail("AG53B readiness status mismatch.");
if (readiness.ready_for_ag53b !== true) fail("AG53B readiness must be true.");
if (readiness.next_stage_id !== "AG53B") fail("Readiness must point to AG53B.");
if (nextBoundary.next_stage_id !== "AG53B") fail("Boundary must point to AG53B.");

for (const key of [
  "lighthouse_runtime_enabled",
  "external_performance_api_enabled",
  "browser_automation_enabled",
  "external_fetch_enabled",
  "reference_fetch_runtime_enabled",
  "image_scraping_enabled",
  "image_external_api_enabled",
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
  "public_dashboard_exposed"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag53a"]) fail("Missing package script: generate:ag53a");
if (!pkg.scripts?.["validate:ag53a"]) fail("Missing package script: validate:ag53a");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag53a")) fail("validate:project must include validate:ag53a.");

pass("AG53A Performance and Page-weight Review is present.");
pass("AG52Z security/privacy/legal closure is consumed.");
pass("Public HTML/static asset inventory is valid.");
pass("Page-weight risk model is valid.");
pass("Image load risk review is valid.");
pass("JS/CSS load risk review is valid.");
pass("Mobile speed risk readiness is valid.");
pass("Static performance review boundary is valid.");
pass("No runtime performance API audit is valid.");
pass("No public mutation/publishing/deployment audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG53B SEO metadata/sitemap/robots readiness is valid.");
