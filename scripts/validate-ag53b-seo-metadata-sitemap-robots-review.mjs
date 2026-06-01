import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG53B validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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

  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json",
  "data/content-intelligence/security-compliance/ag52z-security-privacy-legal-posture-record.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

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
  "data/quality/ag53b-seo-metadata-sitemap-robots-review.json",
  "data/quality/ag53b-seo-metadata-sitemap-robots-review-preview.json",
  "docs/quality/AG53B_SEO_METADATA_SITEMAP_ROBOTS_REVIEW.md",
  "scripts/generate-ag53b-seo-metadata-sitemap-robots-review.mjs",
  "scripts/validate-ag53b-seo-metadata-sitemap-robots-review.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag53aReview = readJson("data/content-intelligence/quality-reviews/ag53a-performance-page-weight-review.json");
const ag53aInventory = readJson("data/content-intelligence/public-quality/ag53a-public-html-asset-inventory-record.json");
const ag53aPageWeight = readJson("data/content-intelligence/public-quality/ag53a-page-weight-risk-model.json");
const ag53aImageLoad = readJson("data/content-intelligence/public-quality/ag53a-image-load-risk-review-record.json");
const ag53aJsCss = readJson("data/content-intelligence/public-quality/ag53a-js-css-load-risk-review-record.json");
const ag53aMobileSpeed = readJson("data/content-intelligence/public-quality/ag53a-mobile-speed-risk-readiness-record.json");
const ag53aBoundary = readJson("data/content-intelligence/public-quality/ag53a-static-performance-review-boundary.json");
const ag53aNoRuntime = readJson("data/content-intelligence/backend-architecture/ag53a-no-runtime-performance-api-audit.json");
const ag53aNoMutation = readJson("data/content-intelligence/backend-architecture/ag53a-no-public-mutation-publishing-deployment-audit.json");
const ag53aNoBackend = readJson("data/content-intelligence/backend-architecture/ag53a-no-backend-auth-rls-database-runtime-audit.json");
const ag53aReadiness = readJson("data/content-intelligence/quality-registry/ag53a-ag53b-seo-metadata-sitemap-robots-readiness-record.json");
const ag53aNextBoundary = readJson("data/content-intelligence/mutation-plans/ag53a-to-ag53b-seo-metadata-sitemap-robots-boundary.json");

const ag52zReview = readJson("data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json");
const ag52zCarryForward = readJson("data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json");
const ag52zPosture = readJson("data/content-intelligence/security-compliance/ag52z-security-privacy-legal-posture-record.json");
const ag51zReview = readJson("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag53aReview.status !== "performance_page_weight_review_ready_for_ag53b") fail("AG53A review status mismatch.");
if (ag53aInventory.audit_passed !== true) fail("AG53A asset inventory must pass.");
if (ag53aPageWeight.audit_passed !== true) fail("AG53A page-weight model must pass.");
if (ag53aImageLoad.audit_passed !== true) fail("AG53A image load review must pass.");
if (ag53aJsCss.audit_passed !== true) fail("AG53A JS/CSS review must pass.");
if (ag53aMobileSpeed.audit_passed !== true) fail("AG53A mobile speed review must pass.");
if (!ag53aBoundary.boundary_rules.includes("No public page, asset, image, source or content mutation is performed.")) fail("AG53A public mutation boundary missing.");
if (ag53aNoRuntime.audit_passed !== true) fail("AG53A no runtime performance API audit must pass.");
if (ag53aNoMutation.audit_passed !== true) fail("AG53A no public mutation audit must pass.");
if (ag53aNoBackend.audit_passed !== true) fail("AG53A no backend runtime audit must pass.");
if (ag53aReadiness.ready_for_ag53b !== true) fail("AG53A readiness must permit AG53B.");
if (ag53aNextBoundary.next_stage_id !== "AG53B") fail("AG53A boundary must point to AG53B.");

if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") fail("AG52Z review status mismatch.");
if (!ag52zCarryForward.deferred_items.includes("deployment")) fail("Deployment deferral missing.");
if (ag52zPosture.posture_summary.public_quality_review !== "ready_for_AG53_planning_only") fail("AG52Z AG53 posture mismatch.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") fail("AG51Z status mismatch.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag53b-seo-metadata-sitemap-robots-review.json");
const sourceConsumption = readJson("data/content-intelligence/public-quality/ag53b-source-consumption-record.json");
const metadataInventory = readJson("data/content-intelligence/public-quality/ag53b-seo-metadata-inventory-record.json");
const ogCanonical = readJson("data/content-intelligence/public-quality/ag53b-og-canonical-metadata-review-record.json");
const sitemapRobots = readJson("data/content-intelligence/public-quality/ag53b-sitemap-robots-readiness-record.json");
const urlSurface = readJson("data/content-intelligence/public-quality/ag53b-url-surface-readiness-record.json");
const seoBoundary = readJson("data/content-intelligence/public-quality/ag53b-static-seo-metadata-sitemap-robots-boundary.json");
const noCrawler = readJson("data/content-intelligence/backend-architecture/ag53b-no-crawler-runtime-external-api-audit.json");
const noMetadataMutation = readJson("data/content-intelligence/backend-architecture/ag53b-no-metadata-sitemap-robots-mutation-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag53b-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag53b-ag53c-mobile-accessibility-qa-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag53b-to-ag53c-mobile-accessibility-qa-boundary.json");
const preview = readJson("data/quality/ag53b-seo-metadata-sitemap-robots-review-preview.json");
const pkg = readJson("package.json");

if (review.status !== "seo_metadata_sitemap_robots_review_ready_for_ag53c") fail("AG53B review status mismatch.");

for (const key of [
  "ag53b_seo_metadata_sitemap_robots_review_recorded",
  "ag53a_consumed",
  "seo_metadata_inventory_recorded",
  "og_canonical_metadata_review_recorded",
  "sitemap_robots_readiness_recorded",
  "url_surface_readiness_recorded",
  "static_seo_metadata_sitemap_robots_boundary_recorded",
  "ready_for_ag53c_mobile_accessibility_qa"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag53c !== 0) fail("AG53C blocker count must be zero.");
if (sourceConsumption.status !== "source_consumption_recorded") fail("Source consumption status mismatch.");
if (!Object.prototype.hasOwnProperty.call(sourceConsumption.discovered_context, "metadata_candidates")) fail("Metadata candidates must be recorded.");

for (const audit of [metadataInventory, ogCanonical, sitemapRobots, urlSurface]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}

if (metadataInventory.review_position !== "static_repo_review_only_no_metadata_mutation") fail("Metadata inventory must remain static-only.");
if (ogCanonical.review_position !== "static_planning_only_no_public_page_mutation") fail("OG/canonical review must remain planning-only.");
if (sitemapRobots.review_position !== "static_readiness_only_no_sitemap_generation_no_robots_deployment") fail("Sitemap/robots review must remain static-only.");
if (urlSurface.review_position !== "static_route_context_only_no_router_mutation_no_deploy") fail("URL surface review must remain static-only.");

if (!seoBoundary.boundary_rules.includes("No metadata is inserted, changed or published.")) fail("No metadata mutation boundary missing.");
if (!seoBoundary.boundary_rules.includes("No crawler, external SEO API or external fetch is run.")) fail("No crawler/API boundary missing.");

for (const audit of [noCrawler, noMetadataMutation, noBackend]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag53c_mobile_accessibility_qa") fail("AG53C readiness status mismatch.");
if (readiness.ready_for_ag53c !== true) fail("AG53C readiness must be true.");
if (readiness.next_stage_id !== "AG53C") fail("Readiness must point to AG53C.");
if (boundary.next_stage_id !== "AG53C") fail("Boundary must point to AG53C.");

for (const key of [
  "public_metadata_mutation_enabled",
  "sitemap_generation_runtime_enabled",
  "robots_deployment_enabled",
  "external_crawler_api_enabled",
  "crawler_runtime_enabled",
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
  "reference_fetch_runtime_enabled",
  "automated_external_link_checking_enabled",
  "image_scraping_enabled",
  "image_external_api_enabled"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag53b"]) fail("Missing package script: generate:ag53b");
if (!pkg.scripts?.["validate:ag53b"]) fail("Missing package script: validate:ag53b");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag53b")) fail("validate:project must include validate:ag53b.");

pass("AG53B SEO Metadata, Sitemap and Robots Review is present.");
pass("AG53A performance/page-weight review is consumed.");
pass("SEO metadata inventory is valid.");
pass("Open Graph/canonical metadata review is valid.");
pass("Sitemap/robots readiness is valid.");
pass("URL surface readiness is valid.");
pass("Static SEO metadata/sitemap/robots boundary is valid.");
pass("No crawler runtime/external API audit is valid.");
pass("No metadata/sitemap/robots mutation audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG53C mobile/accessibility QA readiness is valid.");
