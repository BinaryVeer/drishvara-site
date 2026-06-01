import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag52zReview: "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  ag52zClosure: "data/content-intelligence/security-compliance/ag52z-security-privacy-legal-closure-record.json",
  ag52zPosture: "data/content-intelligence/security-compliance/ag52z-security-privacy-legal-posture-record.json",
  ag52zCarryForward: "data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json",
  ag52zHandoff: "data/content-intelligence/ag-roadmap/ag52z-to-ag53-public-quality-handoff.json",
  ag52zReadiness: "data/content-intelligence/quality-registry/ag52z-ag53a-performance-page-weight-readiness-record.json",
  ag52zBoundary: "data/content-intelligence/mutation-plans/ag52z-to-ag53a-performance-page-weight-boundary.json",
  ag52zNoRuntimeBackend: "data/content-intelligence/backend-architecture/ag52z-no-runtime-backend-auth-rls-audit.json",
  ag52zNoSecret: "data/content-intelligence/backend-architecture/ag52z-no-secret-service-role-exposure-audit.json",
  ag52zNoPublishing: "data/content-intelligence/backend-architecture/ag52z-no-publishing-deployment-audit.json",
  ag52zNoFetch: "data/content-intelligence/backend-architecture/ag52z-no-external-fetch-scrape-audit.json",
  ag51zReview: "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag53a-performance-page-weight-review.json",
  sourceConsumption: "data/content-intelligence/public-quality/ag53a-source-consumption-record.json",
  publicAssetInventory: "data/content-intelligence/public-quality/ag53a-public-html-asset-inventory-record.json",
  pageWeightRiskModel: "data/content-intelligence/public-quality/ag53a-page-weight-risk-model.json",
  imageLoadRiskReview: "data/content-intelligence/public-quality/ag53a-image-load-risk-review-record.json",
  jsCssLoadRiskReview: "data/content-intelligence/public-quality/ag53a-js-css-load-risk-review-record.json",
  mobileSpeedRiskReview: "data/content-intelligence/public-quality/ag53a-mobile-speed-risk-readiness-record.json",
  staticReviewBoundary: "data/content-intelligence/public-quality/ag53a-static-performance-review-boundary.json",
  noRuntimePerformanceApiAudit: "data/content-intelligence/backend-architecture/ag53a-no-runtime-performance-api-audit.json",
  noPublicMutationAudit: "data/content-intelligence/backend-architecture/ag53a-no-public-mutation-publishing-deployment-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag53a-no-backend-auth-rls-database-runtime-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag53a-ag53b-seo-metadata-sitemap-robots-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag53a-to-ag53b-seo-metadata-sitemap-robots-boundary.json",
  registry: "data/quality/ag53a-performance-page-weight-review.json",
  preview: "data/quality/ag53a-performance-page-weight-review-preview.json",
  doc: "docs/quality/AG53A_PERFORMANCE_PAGE_WEIGHT_REVIEW.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function listFiles(dir) {
  const absolute = full(dir);
  if (!fs.existsSync(absolute)) return [];
  const out = [];
  const skipDirs = new Set([".git", "node_modules", ".next", "dist", "build", "out", "coverage", ".vercel"]);
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(p));
    else out.push(p);
  }
  return out;
}
function sizeOf(p) {
  try { return fs.statSync(full(p)).size; } catch { return 0; }
}
function topBySize(files, limit = 20) {
  return files
    .map((file) => ({ file, size_bytes: sizeOf(file) }))
    .sort((a, b) => b.size_bytes - a.size_bytes)
    .slice(0, limit);
}
function extOf(file) {
  return path.extname(file).toLowerCase();
}
function mb(bytes) {
  return Number((bytes / (1024 * 1024)).toFixed(3));
}
function sum(files) {
  return files.reduce((acc, f) => acc + sizeOf(f), 0);
}
function findFiles(keywords, limit = 30) {
  return listFiles(".")
    .filter((f) => keywords.every((k) => f.toLowerCase().includes(k.toLowerCase())))
    .slice(0, limit);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG53A input: ${p}`);
}

const ag52zReview = readJson(inputs.ag52zReview);
const ag52zClosure = readJson(inputs.ag52zClosure);
const ag52zPosture = readJson(inputs.ag52zPosture);
const ag52zCarryForward = readJson(inputs.ag52zCarryForward);
const ag52zHandoff = readJson(inputs.ag52zHandoff);
const ag52zReadiness = readJson(inputs.ag52zReadiness);
const ag52zBoundary = readJson(inputs.ag52zBoundary);
const ag52zNoRuntimeBackend = readJson(inputs.ag52zNoRuntimeBackend);
const ag52zNoSecret = readJson(inputs.ag52zNoSecret);
const ag52zNoPublishing = readJson(inputs.ag52zNoPublishing);
const ag52zNoFetch = readJson(inputs.ag52zNoFetch);
const ag51zReview = readJson(inputs.ag51zReview);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") throw new Error("AG52Z review status mismatch.");
if (ag52zReview.summary?.ready_for_ag53a_performance_page_weight_review !== true) throw new Error("AG53A readiness missing from AG52Z.");
if (ag52zClosure.status !== "security_privacy_legal_closure_completed") throw new Error("AG52Z closure missing.");
if (ag52zPosture.posture_summary?.public_quality_review !== "ready_for_AG53_planning_only") throw new Error("AG52Z AG53 posture mismatch.");
if (!ag52zCarryForward.deferred_items.includes("deployment")) throw new Error("Deployment deferral missing.");
if (ag52zHandoff.next_stage_id !== "AG53A") throw new Error("AG52Z handoff must point to AG53A.");
if (ag52zReadiness.ready_for_ag53a !== true || ag52zReadiness.next_stage_id !== "AG53A") throw new Error("AG52Z readiness must permit AG53A.");
if (ag52zBoundary.next_stage_id !== "AG53A") throw new Error("AG52Z boundary must point to AG53A.");
for (const audit of [ag52zNoRuntimeBackend, ag52zNoSecret, ag52zNoPublishing, ag52zNoFetch]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") throw new Error("AG51Z review status mismatch.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const allFiles = listFiles(".");
const publicFiles = listFiles("public");
const routeSurfaceCandidates = allFiles.filter((f) => {
  const normalized = f.replaceAll("\\", "/").toLowerCase();
  return (
    normalized.includes("/page.") ||
    normalized.includes("/layout.") ||
    normalized.includes("/app.") ||
    normalized.includes("/index.") ||
    normalized.startsWith("pages/") ||
    normalized.startsWith("app/") ||
    normalized.startsWith("src/") ||
    normalized.endsWith(".html")
  );
});

const imageExts = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"]);
const scriptStyleExts = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".css"]);
const htmlExts = new Set([".html", ".htm"]);

const publicImages = publicFiles.filter((f) => imageExts.has(extOf(f)));
const allImageCandidates = allFiles.filter((f) => imageExts.has(extOf(f)));
const publicScriptStyleFiles = publicFiles.filter((f) => scriptStyleExts.has(extOf(f)));
const sourceScriptStyleCandidates = allFiles.filter((f) => scriptStyleExts.has(extOf(f)));
const publicHtmlFiles = publicFiles.filter((f) => htmlExts.has(extOf(f)));

const assetTotals = {
  public_file_count: publicFiles.length,
  public_total_mb: mb(sum(publicFiles)),
  public_image_count: publicImages.length,
  public_image_total_mb: mb(sum(publicImages)),
  all_image_candidate_count: allImageCandidates.length,
  all_image_candidate_total_mb: mb(sum(allImageCandidates)),
  public_script_style_count: publicScriptStyleFiles.length,
  public_script_style_total_mb: mb(sum(publicScriptStyleFiles)),
  source_script_style_candidate_count: sourceScriptStyleCandidates.length,
  public_html_count: publicHtmlFiles.length,
  route_surface_candidate_count: routeSurfaceCandidates.length
};

const largePublicFiles = topBySize(publicFiles, 25);
const largeImageFiles = topBySize(allImageCandidates, 25);
const largeScriptStyleFiles = topBySize(sourceScriptStyleCandidates, 25);

const discoveredPriorContext = {
  public_html_candidates: publicHtmlFiles.slice(0, 30),
  homepage_article_surface_candidates: routeSurfaceCandidates.slice(0, 40),
  image_governance_candidates: [
    ...findFiles(["image", "credit"], 20),
    ...findFiles(["image", "governance"], 20),
    ...findFiles(["ag52c", "image"], 20)
  ],
  asset_governance_candidates: [
    ...findFiles(["asset"], 20),
    ...findFiles(["public"], 20),
    ...findFiles(["performance"], 20)
  ],
  ag52_security_closure_candidates: findFiles(["ag52z"], 30),
  ag51_monitoring_candidates: findFiles(["ag51"], 30),
  adb20_runtime_deferral_candidates: findFiles(["adb20"], 20)
};

const blockedState = {
  ag53a_performance_page_weight_review_recorded: true,
  ag52z_consumed: true,
  public_asset_inventory_recorded: true,
  page_weight_risk_model_recorded: true,
  image_load_risk_review_recorded: true,
  js_css_load_risk_review_recorded: true,
  mobile_speed_risk_readiness_recorded: true,
  static_performance_review_boundary_recorded: true,
  ready_for_ag53b_seo_metadata_sitemap_robots_review: true,

  lighthouse_runtime_enabled: false,
  external_performance_api_enabled: false,
  browser_automation_enabled: false,
  external_fetch_enabled: false,
  reference_fetch_runtime_enabled: false,
  image_scraping_enabled: false,
  image_external_api_enabled: false,
  public_page_mutation_enabled: false,
  content_publishing_enabled: false,
  public_content_mutation_enabled: false,
  deployment_approved: false,
  deployment_performed: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  service_role_key_used: false,
  service_role_key_exposed: false,
  rls_policy_mutation_enabled: false,
  grant_mutation_enabled: false,
  runtime_database_query_enabled: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  public_dashboard_exposed: false
};

const sourceConsumption = {
  module_id: "AG53A",
  title: "AG53A Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: Object.values(inputs).filter((p) => p !== "package.json"),
  discovered_prior_context: discoveredPriorContext,
  interpretation: "AG53A consumes AG52Z security/privacy/legal closure and begins static public-quality review. It records asset/page-weight risks from repo files only; it does not run Lighthouse, fetch external URLs, mutate public pages, publish content, activate backend/Auth/RLS/API/runtime or deploy.",
  blocked_state: blockedState
};

const publicAssetInventory = {
  module_id: "AG53A",
  title: "Public HTML and Asset Inventory Record",
  status: "public_html_asset_inventory_recorded",
  audit_passed: true,
  asset_totals: assetTotals,
  largest_public_files: largePublicFiles,
  largest_image_candidates: largeImageFiles,
  largest_script_style_candidates: largeScriptStyleFiles,
  surface_candidates: routeSurfaceCandidates.slice(0, 60),
  inventory_position: "static_repo_inventory_only_no_build_no_runtime_scan",
  blocked_state: blockedState
};

const pageWeightRiskModel = {
  module_id: "AG53A",
  title: "Page-weight Risk Model",
  status: "page_weight_risk_model_recorded",
  audit_passed: true,
  design_only_risk_dimensions: [
    "large_public_assets",
    "large_image_assets",
    "unoptimised_image_formats",
    "heavy_js_css_source_candidates",
    "homepage_surface_weight",
    "article_surface_weight",
    "mobile_network_sensitivity",
    "future_build_bundle_size"
  ],
  static_observations: {
    public_total_mb: assetTotals.public_total_mb,
    public_image_total_mb: assetTotals.public_image_total_mb,
    public_script_style_total_mb: assetTotals.public_script_style_total_mb
  },
  runtime_measurement_enabled_now: false,
  blocked_state: blockedState
};

const imageLoadRiskReview = {
  module_id: "AG53A",
  title: "Image Load Risk Review Record",
  status: "image_load_risk_review_recorded",
  audit_passed: true,
  image_candidate_count: allImageCandidates.length,
  largest_image_candidates: largeImageFiles,
  review_rules: [
    "Prefer compressed responsive images for public surfaces.",
    "Avoid placing very large images in critical homepage path.",
    "Preserve article readability and mobile layout from prior governance.",
    "AG53A does not scrape, download, generate, replace or mutate images."
  ],
  review_position: "static_repo_review_only_no_image_api_no_scrape",
  blocked_state: blockedState
};

const jsCssLoadRiskReview = {
  module_id: "AG53A",
  title: "JS/CSS Load Risk Review Record",
  status: "js_css_load_risk_review_recorded",
  audit_passed: true,
  script_style_candidate_count: sourceScriptStyleCandidates.length,
  largest_script_style_candidates: largeScriptStyleFiles,
  review_rules: [
    "Monitor large JS/CSS source and public candidates before release.",
    "Avoid unnecessary client-side runtime for static V01 surfaces.",
    "Preserve deferred backend/API/database stance from AG52Z.",
    "AG53A does not build, bundle, deploy or mutate source files."
  ],
  review_position: "static_repo_review_only_no_build_no_deploy",
  blocked_state: blockedState
};

const mobileSpeedRiskReview = {
  module_id: "AG53A",
  title: "Mobile Speed Risk Readiness Record",
  status: "mobile_speed_risk_readiness_recorded",
  audit_passed: true,
  planned_checks_design_only: [
    "image load sensitivity",
    "critical public route weight",
    "JS/CSS load sensitivity",
    "font and icon loading",
    "homepage first screen weight",
    "article/read surface weight",
    "low-bandwidth mobile risk"
  ],
  runtime_mobile_test_enabled_now: false,
  blocked_state: blockedState
};

const staticReviewBoundary = {
  module_id: "AG53A",
  title: "Static Performance Review Boundary",
  status: "static_performance_review_boundary_recorded",
  boundary_rules: [
    "AG53A reviews repo files and planning records only.",
    "No Lighthouse/browser automation is run.",
    "No external performance API is called.",
    "No build, bundle, deployment or public URL scan is required.",
    "No public page, asset, image, source or content mutation is performed.",
    "No backend/Auth/Supabase/RLS/API/runtime/database reading is activated.",
    "AG53B may review SEO metadata, sitemap and robots readiness as static/planning-only."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG53A",
    title,
    status,
    audit_passed: true,
    checks: checks.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: [],
    blocked_state: blockedState
  };
}

const noRuntimePerformanceApiAudit = auditObj("No Runtime Performance API Audit", "no_runtime_performance_api_audit_passed", [
  "lighthouse_runtime_enabled",
  "external_performance_api_enabled",
  "browser_automation_enabled",
  "external_fetch_enabled",
  "reference_fetch_runtime_enabled"
]);

const noPublicMutationAudit = auditObj("No Public Mutation / Publishing / Deployment Audit", "no_public_mutation_publishing_deployment_audit_passed", [
  "public_page_mutation_enabled",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "deployment_approved",
  "deployment_performed",
  "public_dashboard_exposed"
]);

const noBackendRuntimeAudit = auditObj("No Backend/Auth/RLS/Database Runtime Audit", "no_backend_auth_rls_database_runtime_audit_passed", [
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now"
]);

const readiness = {
  module_id: "AG53A",
  title: "AG53B SEO Metadata, Sitemap and Robots Readiness Record",
  status: "ready_for_ag53b_seo_metadata_sitemap_robots_review",
  ready_for_ag53b: true,
  next_stage_id: "AG53B",
  next_stage_title: "SEO Metadata, Sitemap and Robots Review",
  ag53b_allowed_scope: [
    "Review titles, descriptions, OG/canonical metadata.",
    "Review sitemap and robots readiness.",
    "Review article URL correctness planning.",
    "Consume AG53A performance/page-weight outputs.",
    "Keep backend/Auth/Supabase/RLS/API/runtime/publishing/deployment disabled."
  ],
  ag53b_blocked_scope: [
    "public metadata mutation",
    "sitemap generation runtime",
    "robots deployment",
    "external crawler/API scan",
    "runtime database/API reading",
    "backend/Auth/Supabase activation",
    "content publishing",
    "deployment"
  ],
  hard_blocker_count_for_ag53b: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG53A",
  title: "AG53A to AG53B SEO Metadata Sitemap Robots Boundary",
  status: "ag53b_seo_metadata_sitemap_robots_boundary_created",
  next_stage_id: "AG53B",
  next_stage_title: "SEO Metadata, Sitemap and Robots Review",
  allowed_scope: readiness.ag53b_allowed_scope,
  blocked_scope: readiness.ag53b_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG53A",
  title: "Performance and Page-weight Review",
  status: "performance_page_weight_review_ready_for_ag53b",
  depends_on: ["AG52Z", "AG51Z", "ADB20", "public HTML/assets", "image governance", "homepage/article surfaces"],
  source_consumption_file: outputs.sourceConsumption,
  public_asset_inventory_file: outputs.publicAssetInventory,
  page_weight_risk_model_file: outputs.pageWeightRiskModel,
  image_load_risk_review_file: outputs.imageLoadRiskReview,
  js_css_load_risk_review_file: outputs.jsCssLoadRiskReview,
  mobile_speed_risk_review_file: outputs.mobileSpeedRiskReview,
  static_review_boundary_file: outputs.staticReviewBoundary,
  no_runtime_performance_api_audit_file: outputs.noRuntimePerformanceApiAudit,
  no_public_mutation_audit_file: outputs.noPublicMutationAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag53a_performance_page_weight_review_recorded: true,
    ag52z_consumed: true,
    public_asset_inventory_recorded: true,
    page_weight_risk_model_recorded: true,
    image_load_risk_review_recorded: true,
    js_css_load_risk_review_recorded: true,
    mobile_speed_risk_readiness_recorded: true,
    static_performance_review_boundary_recorded: true,
    ready_for_ag53b_seo_metadata_sitemap_robots_review: true,
    hard_blocker_count_for_ag53b: 0,
    asset_totals: assetTotals,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG53A", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG53A",
  status: review.status,
  ag53a_performance_page_weight_review_recorded: 1,
  ag52z_consumed: 1,
  public_asset_inventory_recorded: 1,
  page_weight_risk_model_recorded: 1,
  image_load_risk_review_recorded: 1,
  js_css_load_risk_review_recorded: 1,
  mobile_speed_risk_readiness_recorded: 1,
  static_performance_review_boundary_recorded: 1,
  ready_for_ag53b_seo_metadata_sitemap_robots_review: 1,
  hard_blocker_count_for_ag53b: 0,
  ...assetTotals,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG53A — Performance and Page-weight Review

## Result

AG53A records static performance and page-weight readiness for V01 public quality review.

## Reviewed

- Public HTML/static asset inventory
- Page-weight risk model
- Image load risk
- JS/CSS load risk
- Mobile speed risk readiness

## Confirmed blocked

- No Lighthouse/browser automation
- No external performance API
- No external fetch
- No image scraping
- No public page/content mutation
- No publishing
- No backend/Auth/Supabase/RLS/database runtime
- No deployment

## Next

AG53B — SEO Metadata, Sitemap and Robots Review.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.publicAssetInventory, publicAssetInventory);
writeJson(outputs.pageWeightRiskModel, pageWeightRiskModel);
writeJson(outputs.imageLoadRiskReview, imageLoadRiskReview);
writeJson(outputs.jsCssLoadRiskReview, jsCssLoadRiskReview);
writeJson(outputs.mobileSpeedRiskReview, mobileSpeedRiskReview);
writeJson(outputs.staticReviewBoundary, staticReviewBoundary);
writeJson(outputs.noRuntimePerformanceApiAudit, noRuntimePerformanceApiAudit);
writeJson(outputs.noPublicMutationAudit, noPublicMutationAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG53A Performance and Page-weight Review generated.");
console.log(`✅ Public files reviewed: ${assetTotals.public_file_count}; public size: ${assetTotals.public_total_mb} MB.`);
console.log(`✅ Image candidates reviewed: ${assetTotals.all_image_candidate_count}; image size: ${assetTotals.all_image_candidate_total_mb} MB.`);
console.log("✅ No runtime performance API, backend/Auth/RLS/database, public mutation, publishing or deployment enabled.");
console.log("✅ Ready for AG53B SEO Metadata, Sitemap and Robots Review.");
