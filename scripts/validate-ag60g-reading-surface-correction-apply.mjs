import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG60G validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "data/article-index.json",
  "data/content-intelligence/quality-reviews/ag60f-reading-surface-hierarchy-check.json",
  "scripts/generate-ag60g-reading-surface-correction-apply.mjs",
  "scripts/validate-ag60g-reading-surface-correction-apply.mjs",
  "data/content-intelligence/quality-reviews/ag60g-reading-surface-correction-apply.json",
  "data/content-intelligence/phase-01-modules/ag60g-reading-surface-correction-apply-record.json",
  "data/content-intelligence/phase-01-modules/ag60g-reading-surface-final-hierarchy-record.json",
  "data/content-intelligence/quality-registry/ag60g-ag60h-methodology-gated-module-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag60g-to-ag60h-methodology-gated-module-audit-boundary.json",
  "data/content-intelligence/backend-architecture/ag60g-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60g-no-v02-expansion-audit.json",
  "data/quality/ag60g-reading-surface-correction-apply.json",
  "data/quality/ag60g-reading-surface-correction-apply-preview.json",
  "docs/quality/AG60G_READING_SURFACE_CORRECTION_APPLY.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag60g"]) fail("Missing generate:ag60g script.");
if (!pkg.scripts?.["validate:ag60g"]) fail("Missing validate:ag60g script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag60g")) fail("validate:project must include validate:ag60g.");

const indexHtml = read("index.html");
for (const snippet of [
  "AG60G_READING_SURFACE_HIERARCHY_CORRECTION",
  "fetchAg60gArticleIndexData",
  "renderAg60gFeaturedReadsFromArticleIndex",
  "renderAg60gReadingGuideFromArticleIndex",
  "initialiseAg60gOpenDayFromArticleIndex",
  "AG60G-R2-DUPLICATE-FEATURED-READ-REMOVED",
  "publicLatest",
  "publicByDate",
  "publicTopics"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing AG60G index snippet: ${snippet}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag60g-reading-surface-correction-apply.json");
const apply = readJson("data/content-intelligence/phase-01-modules/ag60g-reading-surface-correction-apply-record.json");
const hierarchy = readJson("data/content-intelligence/phase-01-modules/ag60g-reading-surface-final-hierarchy-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag60g-ag60h-methodology-gated-module-audit-readiness-record.json");
const preview = readJson("data/quality/ag60g-reading-surface-correction-apply-preview.json");

if (review.status !== "ag60g_reading_surface_correction_applied") fail("Review status mismatch.");
if (review.summary.featured_reads_article_index_fallback_active !== true) fail("Featured Reads fallback summary missing.");
if (review.summary.reading_guide_article_index_fallback_active !== true) fail("Reading Guide fallback summary missing.");
if (review.summary.browse_by_date_public_index_connection_active !== true) fail("Browse by Date source connection summary missing.");
if (review.summary.duplicate_ag09c_single_featured_read_hidden !== true) fail("Duplicate AG09C hidden/removal summary missing.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must remain false.");
if (apply.audit_passed !== true) fail("Apply record must pass.");
if (hierarchy.status !== "reading_surface_hierarchy_corrected") fail("Hierarchy status mismatch.");
if (readiness.ready_for_ag60h !== true) fail("AG60H readiness must be true.");
if (preview.ready_for_ag60h !== 1) fail("Preview AG60H readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag60g-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60g-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG60G Reading Surface Correction Apply is present.");
pass("Featured Reads and Today’s Reading Guide have article-index fallback.");
pass("Indexed Reads and Browse by Date are source-aligned.");
pass("Duplicate AG09C single Featured Read is removed for public-surface optimisation.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG60H Methodology-Gated Module Audit readiness is valid.");
