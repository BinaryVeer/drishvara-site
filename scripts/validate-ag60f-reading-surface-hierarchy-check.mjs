import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG60F validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "data/article-index.json",
  "data/content-intelligence/quality-reviews/ag60e-live-module-recheck.json",
  "scripts/generate-ag60f-reading-surface-hierarchy-check.mjs",
  "scripts/validate-ag60f-reading-surface-hierarchy-check.mjs",
  "data/content-intelligence/quality-reviews/ag60f-reading-surface-hierarchy-check.json",
  "data/content-intelligence/phase-01-modules/ag60f-reading-surface-hierarchy-record.json",
  "data/content-intelligence/phase-01-modules/ag60f-indexed-reads-source-record.json",
  "data/content-intelligence/phase-01-modules/ag60f-reading-surface-blocker-register.json",
  "data/content-intelligence/quality-registry/ag60f-ag60g-reading-surface-correction-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag60f-to-ag60g-reading-surface-correction-boundary.json",
  "data/content-intelligence/backend-architecture/ag60f-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60f-no-v02-expansion-audit.json",
  "data/quality/ag60f-reading-surface-hierarchy-check.json",
  "data/quality/ag60f-reading-surface-hierarchy-check-preview.json",
  "docs/quality/AG60F_READING_SURFACE_HIERARCHY_CHECK.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag60f"]) fail("Missing generate:ag60f script.");
if (!pkg.scripts?.["validate:ag60f"]) fail("Missing validate:ag60f script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag60f")) fail("validate:project must include validate:ag60f.");

const indexHtml = read("index.html");
for (const requiredSnippet of [
  "Featured Reads",
  "Today’s Reading Guide",
  "Indexed Reads",
  "Latest from Drishvara",
  "Browse by Date",
  'fetch("data/article-index.json"',
  "indexData.publicLatest",
  "indexData.publishedItems",
  "AG60G_READING_SURFACE_HIERARCHY_CORRECTION"
]) {
  if (!indexHtml.includes(requiredSnippet)) fail(`Missing reading surface snippet: ${requiredSnippet}`);
}

const ag09cPresent = indexHtml.includes("AG09C-PUBLIC-EXPERIENCE-LISTING");
const ag09cRemoved = indexHtml.includes("AG60G-R2-DUPLICATE-FEATURED-READ-REMOVED");
if (!ag09cPresent && !ag09cRemoved) fail("AG09C single Featured Read must be present historically or removed by AG60G-R2.");

const articleIndex = readJson("data/article-index.json");
if ((articleIndex.publicTotal || 0) <= 0) fail("article-index publicTotal must be > 0.");
if (!Array.isArray(articleIndex.publicLatest) || articleIndex.publicLatest.length === 0) fail("publicLatest must have records.");
if (!articleIndex.publicByDate || typeof articleIndex.publicByDate !== "object") fail("publicByDate must exist.");
if (!articleIndex.publicTopics || typeof articleIndex.publicTopics !== "object") fail("publicTopics must exist.");

const review = readJson("data/content-intelligence/quality-reviews/ag60f-reading-surface-hierarchy-check.json");
const hierarchy = readJson("data/content-intelligence/phase-01-modules/ag60f-reading-surface-hierarchy-record.json");
const articleSource = readJson("data/content-intelligence/phase-01-modules/ag60f-indexed-reads-source-record.json");
const blocker = readJson("data/content-intelligence/phase-01-modules/ag60f-reading-surface-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag60f-ag60g-reading-surface-correction-readiness-record.json");
const preview = readJson("data/quality/ag60f-reading-surface-hierarchy-check-preview.json");

if (review.status !== "ag60f_reading_surface_hierarchy_checked") fail("Review status mismatch.");
if (review.summary.article_index_valid !== true) fail("Article index valid summary missing.");
if (review.summary.indexed_reads_source_active !== true) fail("Indexed Reads active summary missing.");
if (review.summary.ready_for_ag60g !== true) fail("AG60G readiness missing.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must remain false.");

if (hierarchy.surfaces.indexed_reads.current_source !== "data/article-index.json publicLatest with fallback chain") fail("Indexed Reads hierarchy source mismatch.");
if (articleSource.source_path !== "data/article-index.json") fail("Article source path mismatch.");
if (articleSource.rendering_rule !== "publicLatest -> publishedItems.slice(0,6) -> latest -> items.slice(0,6)") fail("Rendering rule mismatch.");
if (!Array.isArray(blocker.blockers) || blocker.blockers.length !== 5) fail("Expected five reading-surface blockers.");
if (readiness.ready_for_ag60g !== true) fail("AG60G readiness must be true.");
if (preview.ready_for_ag60g !== 1) fail("Preview AG60G readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag60f-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60f-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG60F Reading Surface Hierarchy Check is present.");
pass("Indexed Reads source is verified at data/article-index.json.");
pass("Featured Reads, Reading Guide, Indexed Reads, Browse by Date and AG09C single Featured Read hierarchy is recorded.");
pass("Five reading-surface blockers are recorded.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG60G Reading Surface Correction readiness is valid.");
