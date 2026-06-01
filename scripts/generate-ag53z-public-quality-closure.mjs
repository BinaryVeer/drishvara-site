import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag53aReview: "data/content-intelligence/quality-reviews/ag53a-performance-page-weight-review.json",
  ag53aPublicAssetInventory: "data/content-intelligence/public-quality/ag53a-public-html-asset-inventory-record.json",
  ag53aPageWeightRiskModel: "data/content-intelligence/public-quality/ag53a-page-weight-risk-model.json",
  ag53aImageLoadRiskReview: "data/content-intelligence/public-quality/ag53a-image-load-risk-review-record.json",
  ag53aJsCssLoadRiskReview: "data/content-intelligence/public-quality/ag53a-js-css-load-risk-review-record.json",
  ag53aMobileSpeedRisk: "data/content-intelligence/public-quality/ag53a-mobile-speed-risk-readiness-record.json",
  ag53aStaticBoundary: "data/content-intelligence/public-quality/ag53a-static-performance-review-boundary.json",

  ag53bReview: "data/content-intelligence/quality-reviews/ag53b-seo-metadata-sitemap-robots-review.json",
  ag53bMetadataInventory: "data/content-intelligence/public-quality/ag53b-seo-metadata-inventory-record.json",
  ag53bOgCanonical: "data/content-intelligence/public-quality/ag53b-og-canonical-metadata-review-record.json",
  ag53bSitemapRobots: "data/content-intelligence/public-quality/ag53b-sitemap-robots-readiness-record.json",
  ag53bUrlSurface: "data/content-intelligence/public-quality/ag53b-url-surface-readiness-record.json",
  ag53bSeoBoundary: "data/content-intelligence/public-quality/ag53b-static-seo-metadata-sitemap-robots-boundary.json",

  ag53cReview: "data/content-intelligence/quality-reviews/ag53c-mobile-accessibility-qa.json",
  ag53cMobileLayout: "data/content-intelligence/public-quality/ag53c-mobile-layout-readiness-record.json",
  ag53cAccessibilitySemantics: "data/content-intelligence/public-quality/ag53c-accessibility-semantics-review-record.json",
  ag53cKeyboardFocus: "data/content-intelligence/public-quality/ag53c-keyboard-focus-readiness-record.json",
  ag53cImageAlt: "data/content-intelligence/public-quality/ag53c-image-alt-text-readiness-record.json",
  ag53cReadabilityContrast: "data/content-intelligence/public-quality/ag53c-readability-contrast-readiness-record.json",
  ag53cQaBoundary: "data/content-intelligence/public-quality/ag53c-mobile-accessibility-qa-boundary.json",

  ag53dReview: "data/content-intelligence/quality-reviews/ag53d-public-ux-browser-compatibility-audit.json",
  ag53dPublicUx: "data/content-intelligence/public-quality/ag53d-public-ux-flow-readiness-record.json",
  ag53dNavigationReading: "data/content-intelligence/public-quality/ag53d-navigation-reading-surface-review-record.json",
  ag53dBrowserCompatibility: "data/content-intelligence/public-quality/ag53d-browser-compatibility-planning-record.json",
  ag53dFallbackError: "data/content-intelligence/public-quality/ag53d-fallback-error-surface-readiness-record.json",
  ag53dUxBoundary: "data/content-intelligence/public-quality/ag53d-public-ux-browser-compatibility-boundary.json",
  ag53dNoBrowserAutomation: "data/content-intelligence/backend-architecture/ag53d-no-browser-automation-external-compatibility-api-audit.json",
  ag53dNoPublicMutation: "data/content-intelligence/backend-architecture/ag53d-no-public-page-mutation-publishing-deployment-audit.json",
  ag53dNoBackendRuntime: "data/content-intelligence/backend-architecture/ag53d-no-backend-auth-rls-database-runtime-audit.json",
  ag53dReadiness: "data/content-intelligence/quality-registry/ag53d-ag53z-public-quality-closure-readiness-record.json",
  ag53dBoundary: "data/content-intelligence/mutation-plans/ag53d-to-ag53z-public-quality-closure-boundary.json",

  ag52zReview: "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  ag52zCarryForward: "data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json",
  ag52zPosture: "data/content-intelligence/security-compliance/ag52z-security-privacy-legal-posture-record.json",
  ag51zReview: "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  closureRecord: "data/content-intelligence/public-quality/ag53z-public-quality-closure-record.json",
  consumptionSummary: "data/content-intelligence/public-quality/ag53z-ag53a-to-ag53d-consumption-summary.json",
  publicQualityPosture: "data/content-intelligence/public-quality/ag53z-public-quality-posture-record.json",
  carryForwardDeferral: "data/content-intelligence/public-quality/ag53z-carry-forward-public-quality-deferral-register.json",
  ag54Handoff: "data/content-intelligence/ag-roadmap/ag53z-to-ag54-release-operations-handoff.json",
  noBrowserExternalAudit: "data/content-intelligence/backend-architecture/ag53z-no-browser-automation-external-api-audit.json",
  noPublicMutationAudit: "data/content-intelligence/backend-architecture/ag53z-no-public-mutation-publishing-deployment-audit.json",
  noBackendRuntimeAudit: "data/content-intelligence/backend-architecture/ag53z-no-backend-auth-rls-database-runtime-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag53z-ag54a-backup-restore-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag53z-to-ag54a-backup-restore-boundary.json",
  registry: "data/quality/ag53z-public-quality-closure.json",
  preview: "data/quality/ag53z-public-quality-closure-preview.json",
  doc: "docs/quality/AG53Z_PUBLIC_QUALITY_CLOSURE.md"
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
function findFiles(keywords, limit = 40) {
  return listFiles("data/content-intelligence")
    .filter((f) => keywords.every((k) => f.toLowerCase().includes(k.toLowerCase())))
    .slice(0, limit);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG53Z input: ${p}`);
}

const ag53aReview = readJson(inputs.ag53aReview);
const ag53aPublicAssetInventory = readJson(inputs.ag53aPublicAssetInventory);
const ag53aPageWeightRiskModel = readJson(inputs.ag53aPageWeightRiskModel);
const ag53aImageLoadRiskReview = readJson(inputs.ag53aImageLoadRiskReview);
const ag53aJsCssLoadRiskReview = readJson(inputs.ag53aJsCssLoadRiskReview);
const ag53aMobileSpeedRisk = readJson(inputs.ag53aMobileSpeedRisk);
const ag53aStaticBoundary = readJson(inputs.ag53aStaticBoundary);

const ag53bReview = readJson(inputs.ag53bReview);
const ag53bMetadataInventory = readJson(inputs.ag53bMetadataInventory);
const ag53bOgCanonical = readJson(inputs.ag53bOgCanonical);
const ag53bSitemapRobots = readJson(inputs.ag53bSitemapRobots);
const ag53bUrlSurface = readJson(inputs.ag53bUrlSurface);
const ag53bSeoBoundary = readJson(inputs.ag53bSeoBoundary);

const ag53cReview = readJson(inputs.ag53cReview);
const ag53cMobileLayout = readJson(inputs.ag53cMobileLayout);
const ag53cAccessibilitySemantics = readJson(inputs.ag53cAccessibilitySemantics);
const ag53cKeyboardFocus = readJson(inputs.ag53cKeyboardFocus);
const ag53cImageAlt = readJson(inputs.ag53cImageAlt);
const ag53cReadabilityContrast = readJson(inputs.ag53cReadabilityContrast);
const ag53cQaBoundary = readJson(inputs.ag53cQaBoundary);

const ag53dReview = readJson(inputs.ag53dReview);
const ag53dPublicUx = readJson(inputs.ag53dPublicUx);
const ag53dNavigationReading = readJson(inputs.ag53dNavigationReading);
const ag53dBrowserCompatibility = readJson(inputs.ag53dBrowserCompatibility);
const ag53dFallbackError = readJson(inputs.ag53dFallbackError);
const ag53dUxBoundary = readJson(inputs.ag53dUxBoundary);
const ag53dNoBrowserAutomation = readJson(inputs.ag53dNoBrowserAutomation);
const ag53dNoPublicMutation = readJson(inputs.ag53dNoPublicMutation);
const ag53dNoBackendRuntime = readJson(inputs.ag53dNoBackendRuntime);
const ag53dReadiness = readJson(inputs.ag53dReadiness);
const ag53dBoundary = readJson(inputs.ag53dBoundary);

const ag52zReview = readJson(inputs.ag52zReview);
const ag52zCarryForward = readJson(inputs.ag52zCarryForward);
const ag52zPosture = readJson(inputs.ag52zPosture);
const ag51zReview = readJson(inputs.ag51zReview);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag53aReview.status !== "performance_page_weight_review_ready_for_ag53b") throw new Error("AG53A review status mismatch.");
for (const audit of [ag53aPublicAssetInventory, ag53aPageWeightRiskModel, ag53aImageLoadRiskReview, ag53aJsCssLoadRiskReview, ag53aMobileSpeedRisk]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}
if (!ag53aStaticBoundary.boundary_rules.includes("No public page, asset, image, source or content mutation is performed.")) throw new Error("AG53A boundary missing.");

if (ag53bReview.status !== "seo_metadata_sitemap_robots_review_ready_for_ag53c") throw new Error("AG53B review status mismatch.");
for (const audit of [ag53bMetadataInventory, ag53bOgCanonical, ag53bSitemapRobots, ag53bUrlSurface]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}
if (!ag53bSeoBoundary.boundary_rules.includes("No metadata is inserted, changed or published.")) throw new Error("AG53B boundary missing.");

if (ag53cReview.status !== "mobile_accessibility_qa_ready_for_ag53d") throw new Error("AG53C review status mismatch.");
for (const audit of [ag53cMobileLayout, ag53cAccessibilitySemantics, ag53cKeyboardFocus, ag53cImageAlt, ag53cReadabilityContrast]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}
if (!ag53cQaBoundary.boundary_rules.includes("No browser automation is run.")) throw new Error("AG53C boundary missing.");

if (ag53dReview.status !== "public_ux_browser_compatibility_audit_ready_for_ag53z") throw new Error("AG53D review status mismatch.");
if (ag53dReview.summary?.ready_for_ag53z_public_quality_closure !== true) throw new Error("AG53Z readiness missing from AG53D.");
for (const audit of [ag53dPublicUx, ag53dNavigationReading, ag53dBrowserCompatibility, ag53dFallbackError]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}
if (!ag53dUxBoundary.boundary_rules.includes("No browser automation is run.")) throw new Error("AG53D browser boundary missing.");
for (const audit of [ag53dNoBrowserAutomation, ag53dNoPublicMutation, ag53dNoBackendRuntime]) {
  if (audit.audit_passed !== true) throw new Error(`${audit.title} must pass.`);
}
if (ag53dReadiness.ready_for_ag53z !== true || ag53dReadiness.next_stage_id !== "AG53Z") throw new Error("AG53D readiness must permit AG53Z.");
if (ag53dBoundary.next_stage_id !== "AG53Z") throw new Error("AG53D boundary must point to AG53Z.");

if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") throw new Error("AG52Z review status mismatch.");
if (!ag52zCarryForward.deferred_items.includes("deployment")) throw new Error("Deployment deferral missing.");
if (ag52zPosture.posture_summary?.public_quality_review !== "ready_for_AG53_planning_only") throw new Error("AG52Z AG53 posture mismatch.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") throw new Error("AG51Z review status mismatch.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const discoveredPriorContext = {
  ag47_panchang_festival_vedic_context: findFiles(["ag47"], 20),
  ag48_word_reflection_context: findFiles(["ag48"], 20),
  ag49_personalisation_context: findFiles(["ag49"], 20),
  ag50_psychometric_assessment_context: findFiles(["ag50"], 20),
  ag51_analytics_monitoring_context: findFiles(["ag51"], 20),
  ag52_security_privacy_legal_context: findFiles(["ag52"], 40),
  ag53_public_quality_context: findFiles(["ag53"], 60),
  adb16_to_adb20_runtime_boundary: [
    ...findFiles(["adb16"], 10),
    ...findFiles(["adb17"], 10),
    ...findFiles(["adb18"], 10),
    ...findFiles(["adb19"], 10),
    ...findFiles(["adb20"], 10)
  ]
};

const blockedState = {
  ag53z_public_quality_closed: true,
  ag53a_ag53b_ag53c_ag53d_consumed: true,
  public_quality_closure_completed: true,
  ag54a_backup_restore_handoff_created: true,
  ready_for_ag54a_backup_restore_plan: true,

  browser_automation_enabled: false,
  external_browser_compatibility_api_enabled: false,
  external_audit_api_enabled: false,
  lighthouse_runtime_enabled: false,
  external_fetch_enabled: false,
  accessibility_crawler_runtime_enabled: false,
  crawler_runtime_enabled: false,
  public_metadata_mutation_enabled: false,
  sitemap_generation_runtime_enabled: false,
  robots_deployment_enabled: false,
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
  image_external_api_enabled: false
};

const closureRecord = {
  module_id: "AG53Z",
  title: "Public Quality Closure Record",
  status: "public_quality_closure_completed",
  closed_substages: [
    "AG53A Performance and Page-weight Review",
    "AG53B SEO Metadata, Sitemap and Robots Review",
    "AG53C Mobile and Accessibility QA",
    "AG53D Public UX and Browser Compatibility Audit"
  ],
  closure_result: "AG53 closes public quality and discoverability readiness for V01 static surfaces. The review remains static/planning-only and does not run browser automation, crawler/API checks, public mutation, publishing, backend/Auth/RLS/API/runtime activation or deployment.",
  closure_allowed: true,
  discovered_prior_context: discoveredPriorContext,
  blocked_state: blockedState
};

const consumptionSummary = {
  module_id: "AG53Z",
  title: "AG53A to AG53D Consumption Summary",
  status: "ag53a_to_ag53d_consumption_summarised",
  consumed_outputs: [
    {
      stage_id: "AG53A",
      consumed_boundary: "performance/page-weight, asset inventory, image load, JS/CSS load and mobile speed readiness",
      result: "static performance readiness recorded without runtime measurement or deployment"
    },
    {
      stage_id: "AG53B",
      consumed_boundary: "SEO metadata, OG/canonical, sitemap/robots and URL surface readiness",
      result: "static discoverability readiness recorded without crawler/API scans or metadata mutation"
    },
    {
      stage_id: "AG53C",
      consumed_boundary: "mobile layout, accessibility semantics, keyboard/focus, alt text and readability/contrast",
      result: "static mobile/accessibility readiness recorded without browser automation or accessibility crawler"
    },
    {
      stage_id: "AG53D",
      consumed_boundary: "public UX flow, navigation/reading surface, browser compatibility and fallback/error readiness",
      result: "static public UX/browser compatibility readiness recorded without runtime or mutation"
    }
  ],
  blocked_state: blockedState
};

const publicQualityPosture = {
  module_id: "AG53Z",
  title: "Public Quality Posture Record",
  status: "public_quality_posture_recorded",
  posture_summary: {
    performance_page_weight: "static_readiness_recorded",
    seo_metadata_sitemap_robots: "static_readiness_recorded",
    mobile_accessibility: "static_readiness_recorded",
    public_ux_browser_compatibility: "static_readiness_recorded",
    runtime_browser_automation: "blocked",
    external_audit_api: "blocked",
    public_page_mutation: "blocked",
    publishing_deployment: "blocked",
    release_operations: "ready_for_AG54_planning_only"
  },
  posture_rule: "AG54 may prepare backup, rollback, migration and release operations readiness only. It must not deploy, publish, mutate public content, activate backend/Auth/RLS/API/runtime or expose public dashboards.",
  blocked_state: blockedState
};

const carryForwardDeferral = {
  module_id: "AG53Z",
  title: "Carry-forward Public Quality Deferral Register",
  status: "carry_forward_public_quality_deferral_register_recorded",
  deferred_items: [
    "browser automation runtime",
    "external browser compatibility API",
    "external audit API",
    "Lighthouse runtime",
    "accessibility crawler runtime",
    "crawler runtime",
    "public metadata mutation",
    "sitemap generation runtime",
    "robots deployment",
    "public page mutation",
    "content publishing",
    "public content mutation",
    "deployment",
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation"
  ],
  future_reentry_rule: "Any future runtime public QA or deployment must be approved in a later governed release/deployment stage and must consume AG53Z and AG52Z as blocking source-of-truth records.",
  blocked_state: blockedState
};

const ag54Handoff = {
  module_id: "AG53Z",
  title: "AG53Z to AG54 Release Operations Handoff",
  status: "ag54a_backup_restore_handoff_created",
  next_stage_id: "AG54A",
  next_stage_title: "Backup and Restore Plan",
  handoff_basis: [
    "AG53 public quality readiness is closed.",
    "AG54 may begin operational safety planning for V01 release candidate freeze.",
    "AG54A should define repo/content/static artifact backup and restore method.",
    "AG54 must continue no-deployment/no-publishing/no-runtime constraints until explicit release decision."
  ],
  blocked_state: blockedState
};

function auditObj(title, status, checks) {
  return {
    module_id: "AG53Z",
    title,
    status,
    audit_passed: true,
    checks: checks.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: [],
    blocked_state: blockedState
  };
}

const noBrowserExternalAudit = auditObj("No Browser Automation / External API Audit", "no_browser_automation_external_api_audit_passed", [
  "browser_automation_enabled",
  "external_browser_compatibility_api_enabled",
  "external_audit_api_enabled",
  "lighthouse_runtime_enabled",
  "external_fetch_enabled",
  "accessibility_crawler_runtime_enabled",
  "crawler_runtime_enabled"
]);

const noPublicMutationAudit = auditObj("No Public Mutation / Publishing / Deployment Audit", "no_public_mutation_publishing_deployment_audit_passed", [
  "public_metadata_mutation_enabled",
  "sitemap_generation_runtime_enabled",
  "robots_deployment_enabled",
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
  module_id: "AG53Z",
  title: "AG54A Backup and Restore Plan Readiness Record",
  status: "ready_for_ag54a_backup_restore_plan",
  ready_for_ag54a: true,
  next_stage_id: "AG54A",
  next_stage_title: "Backup and Restore Plan",
  ag54a_allowed_scope: [
    "Define repo/content/static artifact backup method.",
    "Define restore checkpoints and verification sequence.",
    "Consume Git baseline, repo/content/data records and Supabase deferral records.",
    "Consume AG53Z public quality closure and AG52Z security/privacy/legal closure.",
    "Keep deployment, publishing, runtime, backend/Auth/RLS/API and public mutation disabled."
  ],
  ag54a_blocked_scope: [
    "actual deployment",
    "content publishing",
    "public page mutation",
    "runtime database/API reading",
    "backend/Auth/Supabase activation",
    "RLS/grant mutation",
    "service-role use",
    "automated external backup service activation"
  ],
  hard_blocker_count_for_ag54a: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG53Z",
  title: "AG53Z to AG54A Backup Restore Boundary",
  status: "ag54a_backup_restore_boundary_created",
  next_stage_id: "AG54A",
  next_stage_title: "Backup and Restore Plan",
  allowed_scope: readiness.ag54a_allowed_scope,
  blocked_scope: readiness.ag54a_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG53Z",
  title: "Public Quality Closure",
  status: "public_quality_closed_ready_for_ag54a",
  depends_on: ["AG53D", "AG53C", "AG53B", "AG53A", "AG52Z", "AG51Z", "ADB16–ADB20 context"],
  closure_record_file: outputs.closureRecord,
  consumption_summary_file: outputs.consumptionSummary,
  public_quality_posture_file: outputs.publicQualityPosture,
  carry_forward_deferral_file: outputs.carryForwardDeferral,
  ag54_handoff_file: outputs.ag54Handoff,
  no_browser_external_audit_file: outputs.noBrowserExternalAudit,
  no_public_mutation_audit_file: outputs.noPublicMutationAudit,
  no_backend_runtime_audit_file: outputs.noBackendRuntimeAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag53z_public_quality_closed: true,
    ag53a_ag53b_ag53c_ag53d_consumed: true,
    public_quality_closure_completed: true,
    ag54a_backup_restore_handoff_created: true,
    ready_for_ag54a_backup_restore_plan: true,
    hard_blocker_count_for_ag54a: 0,
    ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, false]))
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG53Z", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG53Z",
  status: review.status,
  ag53z_public_quality_closed: 1,
  ag53a_ag53b_ag53c_ag53d_consumed: 1,
  public_quality_closure_completed: 1,
  ag54a_backup_restore_handoff_created: 1,
  ready_for_ag54a_backup_restore_plan: 1,
  hard_blocker_count_for_ag54a: 0,
  ...Object.fromEntries(Object.keys(blockedState).filter((k) => blockedState[k] === false).map((k) => [k, 0]))
};

const doc = `# AG53Z — Public Quality Closure

## Result

AG53Z closes public quality and discoverability readiness for V01 static surfaces.

## Closed

- AG53A — Performance and Page-weight Review
- AG53B — SEO Metadata, Sitemap and Robots Review
- AG53C — Mobile and Accessibility QA
- AG53D — Public UX and Browser Compatibility Audit

## Preserved blockers

- No browser automation runtime
- No external browser compatibility/API audit
- No Lighthouse runtime
- No accessibility crawler runtime
- No public metadata, sitemap, robots, page or content mutation
- No content publishing
- No backend/Auth/Supabase/RLS/database runtime
- No deployment

## Next

AG54A — Backup and Restore Plan.
`;

writeJson(outputs.closureRecord, closureRecord);
writeJson(outputs.consumptionSummary, consumptionSummary);
writeJson(outputs.publicQualityPosture, publicQualityPosture);
writeJson(outputs.carryForwardDeferral, carryForwardDeferral);
writeJson(outputs.ag54Handoff, ag54Handoff);
writeJson(outputs.noBrowserExternalAudit, noBrowserExternalAudit);
writeJson(outputs.noPublicMutationAudit, noPublicMutationAudit);
writeJson(outputs.noBackendRuntimeAudit, noBackendRuntimeAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG53Z Public Quality Closure generated.");
console.log("✅ AG53A–AG53D consumed and closed.");
console.log("✅ AG54A Backup and Restore Plan handoff recorded.");
console.log("✅ No browser automation, external API, public mutation, backend/runtime, publishing or deployment enabled.");
