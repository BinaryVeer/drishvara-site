import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG53C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag53b-seo-metadata-sitemap-robots-review.json",
  "data/content-intelligence/public-quality/ag53b-source-consumption-record.json",
  "data/content-intelligence/public-quality/ag53b-seo-metadata-inventory-record.json",
  "data/content-intelligence/public-quality/ag53b-og-canonical-metadata-review-record.json",
  "data/content-intelligence/public-quality/ag53b-sitemap-robots-readiness-record.json",
  "data/content-intelligence/public-quality/ag53b-url-surface-readiness-record.json",
  "data/content-intelligence/public-quality/ag53b-static-seo-metadata-sitemap-robots-boundary.json",
  "data/content-intelligence/backend-architecture/ag53b-no-crawler-runtime-external-api-audit.json",
  "data/content-intelligence/backend-architecture/ag53b-no-metadata-sitemap-robots-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag53b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag53b-ag53c-mobile-accessibility-qa-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag53b-to-ag53c-mobile-accessibility-qa-boundary.json",

  "data/content-intelligence/quality-reviews/ag53a-performance-page-weight-review.json",
  "data/content-intelligence/public-quality/ag53a-public-html-asset-inventory-record.json",
  "data/content-intelligence/public-quality/ag53a-mobile-speed-risk-readiness-record.json",

  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

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
  "data/quality/ag53c-mobile-accessibility-qa.json",
  "data/quality/ag53c-mobile-accessibility-qa-preview.json",
  "docs/quality/AG53C_MOBILE_ACCESSIBILITY_QA.md",
  "scripts/generate-ag53c-mobile-accessibility-qa.mjs",
  "scripts/validate-ag53c-mobile-accessibility-qa.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag53bReview = readJson("data/content-intelligence/quality-reviews/ag53b-seo-metadata-sitemap-robots-review.json");
const ag53bSourceConsumption = readJson("data/content-intelligence/public-quality/ag53b-source-consumption-record.json");
const ag53bMetadataInventory = readJson("data/content-intelligence/public-quality/ag53b-seo-metadata-inventory-record.json");
const ag53bOgCanonical = readJson("data/content-intelligence/public-quality/ag53b-og-canonical-metadata-review-record.json");
const ag53bSitemapRobots = readJson("data/content-intelligence/public-quality/ag53b-sitemap-robots-readiness-record.json");
const ag53bUrlSurface = readJson("data/content-intelligence/public-quality/ag53b-url-surface-readiness-record.json");
const ag53bSeoBoundary = readJson("data/content-intelligence/public-quality/ag53b-static-seo-metadata-sitemap-robots-boundary.json");
const ag53bNoCrawler = readJson("data/content-intelligence/backend-architecture/ag53b-no-crawler-runtime-external-api-audit.json");
const ag53bNoMetadataMutation = readJson("data/content-intelligence/backend-architecture/ag53b-no-metadata-sitemap-robots-mutation-audit.json");
const ag53bNoBackendRuntime = readJson("data/content-intelligence/backend-architecture/ag53b-no-backend-auth-rls-database-runtime-audit.json");
const ag53bReadiness = readJson("data/content-intelligence/quality-registry/ag53b-ag53c-mobile-accessibility-qa-readiness-record.json");
const ag53bBoundary = readJson("data/content-intelligence/mutation-plans/ag53b-to-ag53c-mobile-accessibility-qa-boundary.json");

const ag53aReview = readJson("data/content-intelligence/quality-reviews/ag53a-performance-page-weight-review.json");
const ag53aPublicAssetInventory = readJson("data/content-intelligence/public-quality/ag53a-public-html-asset-inventory-record.json");
const ag53aMobileSpeedRisk = readJson("data/content-intelligence/public-quality/ag53a-mobile-speed-risk-readiness-record.json");

const ag52zReview = readJson("data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json");
const ag52zCarryForward = readJson("data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json");
const ag51zReview = readJson("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag53bReview.status !== "seo_metadata_sitemap_robots_review_ready_for_ag53c") fail("AG53B review status mismatch.");
if (ag53bSourceConsumption.status !== "source_consumption_recorded") fail("AG53B source consumption mismatch.");
for (const audit of [ag53bMetadataInventory, ag53bOgCanonical, ag53bSitemapRobots, ag53bUrlSurface]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}
if (!ag53bSeoBoundary.boundary_rules.includes("No public page, route, source or content mutation is performed.")) fail("AG53B public mutation boundary missing.");
for (const audit of [ag53bNoCrawler, ag53bNoMetadataMutation, ag53bNoBackendRuntime]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}
if (ag53bReadiness.ready_for_ag53c !== true) fail("AG53B readiness must permit AG53C.");
if (ag53bBoundary.next_stage_id !== "AG53C") fail("AG53B boundary must point to AG53C.");

if (ag53aReview.status !== "performance_page_weight_review_ready_for_ag53b") fail("AG53A review status mismatch.");
if (ag53aPublicAssetInventory.audit_passed !== true) fail("AG53A public asset inventory must pass.");
if (ag53aMobileSpeedRisk.audit_passed !== true) fail("AG53A mobile speed readiness must pass.");

if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") fail("AG52Z review status mismatch.");
if (!ag52zCarryForward.deferred_items.includes("deployment")) fail("Deployment deferral missing.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") fail("AG51Z status mismatch.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag53c-mobile-accessibility-qa.json");
const sourceConsumption = readJson("data/content-intelligence/public-quality/ag53c-source-consumption-record.json");
const mobileLayout = readJson("data/content-intelligence/public-quality/ag53c-mobile-layout-readiness-record.json");
const accessibilitySemantics = readJson("data/content-intelligence/public-quality/ag53c-accessibility-semantics-review-record.json");
const keyboardFocus = readJson("data/content-intelligence/public-quality/ag53c-keyboard-focus-readiness-record.json");
const imageAlt = readJson("data/content-intelligence/public-quality/ag53c-image-alt-text-readiness-record.json");
const readabilityContrast = readJson("data/content-intelligence/public-quality/ag53c-readability-contrast-readiness-record.json");
const qaBoundary = readJson("data/content-intelligence/public-quality/ag53c-mobile-accessibility-qa-boundary.json");
const noBrowserAutomation = readJson("data/content-intelligence/backend-architecture/ag53c-no-browser-automation-accessibility-crawler-audit.json");
const noPublicMutation = readJson("data/content-intelligence/backend-architecture/ag53c-no-public-page-mutation-publishing-deployment-audit.json");
const noBackendRuntime = readJson("data/content-intelligence/backend-architecture/ag53c-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag53c-ag53d-public-ux-browser-compatibility-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag53c-to-ag53d-public-ux-browser-compatibility-boundary.json");
const preview = readJson("data/quality/ag53c-mobile-accessibility-qa-preview.json");
const pkg = readJson("package.json");

if (review.status !== "mobile_accessibility_qa_ready_for_ag53d") fail("AG53C review status mismatch.");

for (const key of [
  "ag53c_mobile_accessibility_qa_recorded",
  "ag53b_consumed",
  "mobile_layout_readiness_recorded",
  "accessibility_semantics_review_recorded",
  "keyboard_focus_readiness_recorded",
  "image_alt_text_readiness_recorded",
  "readability_contrast_readiness_recorded",
  "mobile_accessibility_qa_boundary_recorded",
  "ready_for_ag53d_public_ux_browser_compatibility_audit"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag53d !== 0) fail("AG53D blocker count must be zero.");
if (sourceConsumption.status !== "source_consumption_recorded") fail("Source consumption status mismatch.");

for (const audit of [mobileLayout, accessibilitySemantics, keyboardFocus, imageAlt, readabilityContrast]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}

if (mobileLayout.review_position !== "static_repo_review_only_no_browser_mobile_runtime") fail("Mobile layout review must remain static-only.");
if (accessibilitySemantics.review_position !== "static_semantics_review_only_no_accessibility_crawler") fail("Accessibility semantics review must remain static-only.");
if (keyboardFocus.review_position !== "static_focus_readiness_only_no_keyboard_runtime_test") fail("Keyboard/focus review must remain static-only.");
if (imageAlt.review_position !== "static_image_alt_review_only_no_image_mutation") fail("Image alt review must remain static-only.");
if (readabilityContrast.review_position !== "static_readability_contrast_planning_only_no_visual_runtime_test") fail("Readability/contrast review must remain static-only.");

if (!qaBoundary.boundary_rules.includes("No browser automation is run.")) fail("No browser automation boundary missing.");
if (!qaBoundary.boundary_rules.includes("No public page, route, source, image or content mutation is performed.")) fail("No public mutation boundary missing.");

for (const audit of [noBrowserAutomation, noPublicMutation, noBackendRuntime]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag53d_public_ux_browser_compatibility_audit") fail("AG53D readiness status mismatch.");
if (readiness.ready_for_ag53d !== true) fail("AG53D readiness must be true.");
if (readiness.next_stage_id !== "AG53D") fail("Readiness must point to AG53D.");
if (boundary.next_stage_id !== "AG53D") fail("Boundary must point to AG53D.");

for (const key of [
  "browser_automation_enabled",
  "accessibility_crawler_runtime_enabled",
  "external_accessibility_api_enabled",
  "external_audit_api_enabled",
  "lighthouse_runtime_enabled",
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
  "external_fetch_enabled",
  "image_scraping_enabled",
  "image_external_api_enabled"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag53c"]) fail("Missing package script: generate:ag53c");
if (!pkg.scripts?.["validate:ag53c"]) fail("Missing package script: validate:ag53c");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag53c")) fail("validate:project must include validate:ag53c.");

pass("AG53C Mobile and Accessibility QA is present.");
pass("AG53B SEO metadata/sitemap/robots review is consumed.");
pass("Mobile layout readiness is valid.");
pass("Accessibility semantics review is valid.");
pass("Keyboard/focus readiness is valid.");
pass("Image alt text readiness is valid.");
pass("Readability/contrast readiness is valid.");
pass("Mobile/accessibility QA boundary is valid.");
pass("No browser automation/accessibility crawler audit is valid.");
pass("No public mutation/publishing/deployment audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG53D public UX/browser compatibility readiness is valid.");
