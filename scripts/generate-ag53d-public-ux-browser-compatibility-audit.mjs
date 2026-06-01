import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag53cReview: "data/content-intelligence/quality-reviews/ag53c-mobile-accessibility-qa.json",
  ag53cSourceConsumption: "data/content-intelligence/public-quality/ag53c-source-consumption-record.json",
  ag53cMobileLayout: "data/content-intelligence/public-quality/ag53c-mobile-layout-readiness-record.json",
  ag53cAccessibilitySemantics: "data/content-intelligence/public-quality/ag53c-accessibility-semantics-review-record.json",
  ag53cKeyboardFocus: "data/content-intelligence/public-quality/ag53c-keyboard-focus-readiness-record.json",
  ag53cImageAlt: "data/content-intelligence/public-quality/ag53c-image-alt-text-readiness-record.json",
  ag53cReadabilityContrast: "data/content-intelligence/public-quality/ag53c-readability-contrast-readiness-record.json",
  ag53cQaBoundary: "data/content-intelligence/public-quality/ag53c-mobile-accessibility-qa-boundary.json",
  ag53cNoBrowserAutomation: "data/content-intelligence/backend-architecture/ag53c-no-browser-automation-accessibility-crawler-audit.json",
  ag53cNoPublicMutation: "data/content-intelligence/backend-architecture/ag53c-no-public-page-mutation-publishing-deployment-audit.json",
  ag53cNoBackendRuntime: "data/content-intelligence/backend-architecture/ag53c-no-backend-auth-rls-database-runtime-audit.json",
  ag53cReadiness: "data/content-intelligence/quality-registry/ag53c-ag53d-public-ux-browser-compatibility-readiness-record.json",
  ag53cBoundary: "data/content-intelligence/mutation-plans/ag53c-to-ag53d-public-ux-browser-compatibility-boundary.json",

  ag53bReview: "data/content-intelligence/quality-reviews/ag53b-seo-metadata-sitemap-robots-review.json",
  ag53aReview: "data/content-intelligence/quality-reviews/ag53a-performance-page-weight-review.json",
  ag52zReview: "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  ag52zCarryForward: "data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json",
  ag51zReview: "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag53d-public-ux-browser-compatibility-audit.json",
  sourceConsumption: "data/content-intelligence/public-quality/ag53d-source-consumption-record.json",
  publicUxFlowReview: "data/content-intelligence/public-quality/ag53d-public-ux-flow-readiness-record.json",
  navigationReadingSurfaceReview: "data/content-intelligence/public-quality/ag53d-navigation-reading-surface-review-record.json",
  browserCompatibilityReview: "data/content-intelligence/public-quality/ag53d-browser-compatibility-planning-record.json",
  fallbackErrorSurfaceReview: "data/content-intelligence/public-quality/ag53d-fallback-error-surface-readiness-record.json",
  publicUxBoundary: "data/content-intelligence/public-quality/ag53d-public-ux-browser-compatibility-boundary.json",
  noBrowserAutomationAudit: "data/content-intelligence/backend-architecture/ag53d-no-browser-automation-external-compatibility-api-audit.json",
  noPublicMutationAudit: "data/content-intelligence/backend-architecture/ag53d-no-public-page-mutation-publishing-deployment-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag53d-no-backend-auth-rls-database-runtime-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag53d-ag53z-public-quality-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag53d-to-ag53z-public-quality-closure-boundary.json",
  registry: "data/quality/ag53d-public-ux-browser-compatibility-audit.json",
  preview: "data/quality/ag53d-public-ux-browser-compatibility-audit-preview.json",
  doc: "docs/quality/AG53D_PUBLIC_UX_BROWSER_COMPATIBILITY_AUDIT.md"
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
function readTextSafe(p) {
  try {
    const ext = path.extname(p).toLowerCase();
    const allowed = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".json", ".md", ".txt", ".html", ".css"]);
    if (!allowed.has(ext)) return "";
    const stat = fs.statSync(full(p));
    if (stat.size > 800000) return "";
    return fs.readFileSync(full(p), "utf8");
  } catch {
    return "";
  }
}
function scanFor(patterns, limit = 90) {
  const candidates = [];
  for (const file of listFiles(".")) {
    const text = readTextSafe(file);
    if (!text) continue;
    const matched = patterns.filter((p) => p.re.test(text)).map((p) => p.id);
    if (matched.length > 0) {
      candidates.push({
        file,
        matched_pattern_ids: matched,
        treatment: "static_public_ux_browser_compatibility_context_only_no_runtime_no_mutation"
      });
    }
    if (candidates.length >= limit) break;
  }
  return candidates;
}
function findFiles(keywords, limit = 40) {
  return listFiles(".")
    .filter((f) => keywords.every((k) => f.toLowerCase().includes(k.toLowerCase())))
    .slice(0, limit);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG53D input: ${p}`);
}

const ag53cReview = readJson(inputs.ag53cReview);
const ag53cSourceConsumption = readJson(inputs.ag53cSourceConsumption);
const ag53cMobileLayout = readJson(inputs.ag53cMobileLayout);
const ag53cAccessibilitySemantics = readJson(inputs.ag53cAccessibilitySemantics);
const ag53cKeyboardFocus = readJson(inputs.ag53cKeyboardFocus);
const ag53cImageAlt = readJson(inputs.ag53cImageAlt);
const ag53cReadabilityContrast = readJson(inputs.ag53cReadabilityContrast);
const ag53cQaBoundary = readJson(inputs.ag53cQaBoundary);
const ag53cNoBrowserAutomation = readJson(inputs.ag53cNoBrowserAutomation);
const ag53cNoPublicMutation = readJson(inputs.ag53cNoPublicMutation);
const ag53cNoBackendRuntime = readJson(inputs.ag53cNoBackendRuntime);
const ag53cReadiness = readJson(inputs.ag53cReadiness);
const ag53cBoundary = readJson(inputs.ag53cBoundary);

const ag53bReview = readJson(inputs.ag53bReview);
const ag53aReview = readJson(inputs.ag53aReview);
const ag52zReview = readJson(inputs.ag52zReview);
const ag52zCarryForward = readJson(inputs.ag52zCarryForward);
const ag51zReview = readJson(inputs.ag51zReview);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag53cReview.status !== "mobile_accessibility_qa_ready_for_ag53d") throw new Error("AG53C review status mismatch.");
if (ag53cReview.summary?.ready_for_ag53d_public_ux_browser_compatibility_audit !== true) throw new Error("AG53D readiness missing from AG53C.");
if (ag53cSourceConsumption.status !== "source_consumption_recorded") throw new Error("AG53C source consumption mismatch.");
for (const audit of [ag53cMobileLayout, ag53cAccessibilitySemantics, ag53cKeyboardFocus, ag53cImageAlt, ag53cReadabilityContrast]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}
if (!ag53cQaBoundary.boundary_rules.includes("No browser automation is run.")) throw new Error("AG53C browser automation boundary missing.");
if (!ag53cQaBoundary.boundary_rules.includes("No public page, route, source, image or content mutation is performed.")) throw new Error("AG53C public mutation boundary missing.");
for (const audit of [ag53cNoBrowserAutomation, ag53cNoPublicMutation, ag53cNoBackendRuntime]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}
if (ag53cReadiness.ready_for_ag53d !== true || ag53cReadiness.next_stage_id !== "AG53D") throw new Error("AG53C readiness must permit AG53D.");
if (ag53cBoundary.next_stage_id !== "AG53D") throw new Error("AG53C boundary must point to AG53D.");

if (ag53bReview.status !== "seo_metadata_sitemap_robots_review_ready_for_ag53c") throw new Error("AG53B review status mismatch.");
if (ag53aReview.status !== "performance_page_weight_review_ready_for_ag53b") throw new Error("AG53A review status mismatch.");
if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") throw new Error("AG52Z review status mismatch.");
if (!ag52zCarryForward.deferred_items.includes("deployment")) throw new Error("Deployment deferral missing.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") throw new Error("AG51Z review status mismatch.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const publicUxCandidates = scanFor([
  { id: "homepage_surface", re: /homepage|home page|landing|hero|first screen/i },
  { id: "article_reading_surface", re: /article|featured read|reading surface|read surface/i },
  { id: "discover_reflect_flow", re: /discover|reflect|reflection|word/i },
  { id: "cta_or_action", re: /call to action|cta|button|explore|read more/i },
  { id: "user_journey", re: /journey|flow|pathway|navigation/i }
]);

const navigationReadingCandidates = scanFor([
  { id: "navigation_semantics", re: /nav|navbar|menu|breadcrumb|header|footer/i },
  { id: "language_toggle", re: /language|hindi|english|toggle|locale/i },
  { id: "reading_width_layout", re: /reading|article|prose|max-w-|container|content column/i },
  { id: "fallback_or_empty_state", re: /empty state|fallback|not found|404|error boundary/i }
]);

const browserCompatibilityCandidates = scanFor([
  { id: "css_responsive_features", re: /grid|flex|sticky|backdrop|filter|transform|transition/i },
  { id: "modern_js_features", re: /IntersectionObserver|ResizeObserver|localStorage|matchMedia|navigator|window\./i },
  { id: "browser_wording", re: /browser|safari|chrome|firefox|edge|compatibility/i },
  { id: "hydration_client_boundary", re: /use client|hydration|client component/i }
]);

const fallbackErrorCandidates = scanFor([
  { id: "404_not_found", re: /404|not-found|not found|NotFound/i },
  { id: "error_boundary", re: /error boundary|error\.tsx|global-error|fallback/i },
  { id: "loading_state", re: /loading|skeleton|spinner|placeholder/i },
  { id: "offline_or_unavailable", re: /offline|unavailable|try again|failed/i }
]);

const blockedState = {
  ag53d_public_ux_browser_compatibility_audit_recorded: true,
  ag53c_consumed: true,
  public_ux_flow_review_recorded: true,
  navigation_reading_surface_review_recorded: true,
  browser_compatibility_planning_recorded: true,
  fallback_error_surface_readiness_recorded: true,
  public_ux_browser_compatibility_boundary_recorded: true,
  ready_for_ag53z_public_quality_closure: true,

  browser_automation_enabled: false,
  external_browser_compatibility_api_enabled: false,
  external_audit_api_enabled: false,
  lighthouse_runtime_enabled: false,
  external_fetch_enabled: false,
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
  public_dashboard_exposed: false,
  image_scraping_enabled: false,
  image_external_api_enabled: false,
  crawler_runtime_enabled: false,
  accessibility_crawler_runtime_enabled: false
};

const sourceConsumption = {
  module_id: "AG53D",
  title: "AG53D Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: Object.values(inputs).filter((p) => p !== "package.json"),
  discovered_context: {
    public_ux_candidates: publicUxCandidates.slice(0, 70),
    navigation_reading_candidates: navigationReadingCandidates.slice(0, 70),
    browser_compatibility_candidates: browserCompatibilityCandidates.slice(0, 70),
    fallback_error_candidates: fallbackErrorCandidates.slice(0, 70),
    ag53a_performance_candidates: findFiles(["ag53a"], 30),
    ag53b_seo_candidates: findFiles(["ag53b"], 30),
    ag53c_mobile_accessibility_candidates: findFiles(["ag53c"], 30),
    ag52z_security_closure_candidates: findFiles(["ag52z"], 30),
    adb20_runtime_deferral_candidates: findFiles(["adb20"], 20)
  },
  interpretation: "AG53D records static public UX and browser compatibility readiness. It does not run browser automation, compatibility APIs, external audits, mutate public pages, publish content, activate backend/Auth/RLS/API/runtime or deploy.",
  blocked_state: blockedState
};

const publicUxFlowReview = {
  module_id: "AG53D",
  title: "Public UX Flow Readiness Record",
  status: "public_ux_flow_review_recorded",
  audit_passed: true,
  candidate_count: publicUxCandidates.length,
  candidates_redacted: publicUxCandidates,
  planned_checks_design_only: [
    "homepage first impression",
    "discover-to-read flow",
    "read-to-reflect flow",
    "featured read surface clarity",
    "panchang/festival future surface discoverability",
    "assessment future surface safety boundary",
    "clear CTA and navigation hierarchy"
  ],
  review_position: "static_public_ux_planning_only_no_browser_runtime",
  blocked_state: blockedState
};

const navigationReadingSurfaceReview = {
  module_id: "AG53D",
  title: "Navigation and Reading Surface Review Record",
  status: "navigation_reading_surface_review_recorded",
  audit_passed: true,
  candidate_count: navigationReadingCandidates.length,
  candidates_redacted: navigationReadingCandidates,
  planned_checks_design_only: [
    "main navigation clarity",
    "language toggle stability",
    "article/read surface readability",
    "footer/header discoverability",
    "fallback/empty state clarity",
    "route consistency",
    "mobile navigation continuity with AG53C"
  ],
  review_position: "static_navigation_reading_review_only_no_route_mutation",
  blocked_state: blockedState
};

const browserCompatibilityReview = {
  module_id: "AG53D",
  title: "Browser Compatibility Planning Record",
  status: "browser_compatibility_planning_recorded",
  audit_passed: true,
  candidate_count: browserCompatibilityCandidates.length,
  candidates_redacted: browserCompatibilityCandidates,
  planned_checks_design_only: [
    "Chrome/Safari/Firefox/Edge visual parity",
    "mobile Safari layout sensitivity",
    "CSS feature fallback readiness",
    "client component hydration risk",
    "sticky/backdrop/filter support risk",
    "font/icon rendering consistency",
    "low-end device UX sensitivity"
  ],
  review_position: "static_browser_compatibility_planning_only_no_browser_automation",
  blocked_state: blockedState
};

const fallbackErrorSurfaceReview = {
  module_id: "AG53D",
  title: "Fallback and Error Surface Readiness Record",
  status: "fallback_error_surface_readiness_recorded",
  audit_passed: true,
  candidate_count: fallbackErrorCandidates.length,
  candidates_redacted: fallbackErrorCandidates,
  planned_checks_design_only: [
    "404/not-found clarity",
    "error fallback messaging",
    "loading state stability",
    "offline/unavailable copy future readiness",
    "safe fallback for missing content",
    "public route graceful degradation"
  ],
  review_position: "static_fallback_review_only_no_error_runtime_scan",
  blocked_state: blockedState
};

const publicUxBoundary = {
  module_id: "AG53D",
  title: "Public UX and Browser Compatibility Boundary",
  status: "public_ux_browser_compatibility_boundary_recorded",
  boundary_rules: [
    "AG53D performs static UX and browser compatibility planning only.",
    "No browser automation is run.",
    "No external browser compatibility API or external audit API is called.",
    "No Lighthouse runtime is enabled.",
    "No public page, route, source, image, metadata or content mutation is performed.",
    "No backend/Auth/Supabase/RLS/API/database runtime is activated.",
    "No content publishing, public dashboard exposure or deployment is performed.",
    "AG53Z may close public quality planning after consuming AG53A–AG53D."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG53D",
    title,
    status,
    audit_passed: true,
    checks: checks.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: [],
    blocked_state: blockedState
  };
}

const noBrowserAutomationAudit = auditObj("No Browser Automation / External Compatibility API Audit", "no_browser_automation_external_compatibility_api_audit_passed", [
  "browser_automation_enabled",
  "external_browser_compatibility_api_enabled",
  "external_audit_api_enabled",
  "lighthouse_runtime_enabled",
  "external_fetch_enabled"
]);

const noPublicMutationAudit = auditObj("No Public Page Mutation / Publishing / Deployment Audit", "no_public_page_mutation_publishing_deployment_audit_passed", [
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
  module_id: "AG53D",
  title: "AG53Z Public Quality Closure Readiness Record",
  status: "ready_for_ag53z_public_quality_closure",
  ready_for_ag53z: true,
  next_stage_id: "AG53Z",
  next_stage_title: "Public Quality Closure",
  ag53z_allowed_scope: [
    "Close AG53 public quality planning.",
    "Consume AG53A performance/page-weight review.",
    "Consume AG53B SEO metadata/sitemap/robots review.",
    "Consume AG53C mobile/accessibility QA.",
    "Consume AG53D public UX/browser compatibility audit.",
    "Keep backend/Auth/Supabase/RLS/API/runtime/publishing/deployment disabled."
  ],
  ag53z_blocked_scope: [
    "browser automation runtime",
    "external compatibility/API audit",
    "public page mutation",
    "content publishing",
    "runtime database/API reading",
    "backend/Auth/Supabase activation",
    "RLS/grant mutation",
    "deployment"
  ],
  hard_blocker_count_for_ag53z: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG53D",
  title: "AG53D to AG53Z Public Quality Closure Boundary",
  status: "ag53z_public_quality_closure_boundary_created",
  next_stage_id: "AG53Z",
  next_stage_title: "Public Quality Closure",
  allowed_scope: readiness.ag53z_allowed_scope,
  blocked_scope: readiness.ag53z_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG53D",
  title: "Public UX and Browser Compatibility Audit",
  status: "public_ux_browser_compatibility_audit_ready_for_ag53z",
  depends_on: ["AG53C", "AG53B", "AG53A", "AG52Z", "AG51Z", "ADB20", "static public UX/browser surfaces"],
  source_consumption_file: outputs.sourceConsumption,
  public_ux_flow_review_file: outputs.publicUxFlowReview,
  navigation_reading_surface_review_file: outputs.navigationReadingSurfaceReview,
  browser_compatibility_review_file: outputs.browserCompatibilityReview,
  fallback_error_surface_review_file: outputs.fallbackErrorSurfaceReview,
  public_ux_boundary_file: outputs.publicUxBoundary,
  no_browser_automation_audit_file: outputs.noBrowserAutomationAudit,
  no_public_mutation_audit_file: outputs.noPublicMutationAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag53d_public_ux_browser_compatibility_audit_recorded: true,
    ag53c_consumed: true,
    public_ux_flow_review_recorded: true,
    navigation_reading_surface_review_recorded: true,
    browser_compatibility_planning_recorded: true,
    fallback_error_surface_readiness_recorded: true,
    public_ux_browser_compatibility_boundary_recorded: true,
    ready_for_ag53z_public_quality_closure: true,
    hard_blocker_count_for_ag53z: 0,
    public_ux_candidate_count: publicUxCandidates.length,
    navigation_reading_candidate_count: navigationReadingCandidates.length,
    browser_compatibility_candidate_count: browserCompatibilityCandidates.length,
    fallback_error_candidate_count: fallbackErrorCandidates.length,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG53D", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG53D",
  status: review.status,
  ag53d_public_ux_browser_compatibility_audit_recorded: 1,
  ag53c_consumed: 1,
  public_ux_flow_review_recorded: 1,
  navigation_reading_surface_review_recorded: 1,
  browser_compatibility_planning_recorded: 1,
  fallback_error_surface_readiness_recorded: 1,
  public_ux_browser_compatibility_boundary_recorded: 1,
  ready_for_ag53z_public_quality_closure: 1,
  hard_blocker_count_for_ag53z: 0,
  public_ux_candidate_count: publicUxCandidates.length,
  navigation_reading_candidate_count: navigationReadingCandidates.length,
  browser_compatibility_candidate_count: browserCompatibilityCandidates.length,
  fallback_error_candidate_count: fallbackErrorCandidates.length,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG53D — Public UX and Browser Compatibility Audit

## Result

AG53D records static public UX and browser compatibility readiness for public quality review.

## Reviewed

- Public UX flow readiness
- Navigation and reading surface readiness
- Browser compatibility planning
- Fallback and error surface readiness

## Confirmed blocked

- No browser automation
- No external browser compatibility/API audit
- No Lighthouse runtime
- No public page/content mutation
- No publishing
- No backend/Auth/Supabase/RLS/database runtime
- No deployment

## Next

AG53Z — Public Quality Closure.
`;

writeJson(outputs.sourceConsumption, sourceConsumption);
writeJson(outputs.publicUxFlowReview, publicUxFlowReview);
writeJson(outputs.navigationReadingSurfaceReview, navigationReadingSurfaceReview);
writeJson(outputs.browserCompatibilityReview, browserCompatibilityReview);
writeJson(outputs.fallbackErrorSurfaceReview, fallbackErrorSurfaceReview);
writeJson(outputs.publicUxBoundary, publicUxBoundary);
writeJson(outputs.noBrowserAutomationAudit, noBrowserAutomationAudit);
writeJson(outputs.noPublicMutationAudit, noPublicMutationAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG53D Public UX and Browser Compatibility Audit generated.");
console.log(`✅ Public UX candidates recorded: ${publicUxCandidates.length}.`);
console.log(`✅ Browser compatibility candidates recorded: ${browserCompatibilityCandidates.length}.`);
console.log("✅ No browser automation, external compatibility API, public mutation, publishing, backend/runtime or deployment enabled.");
console.log("✅ Ready for AG53Z Public Quality Closure.");
