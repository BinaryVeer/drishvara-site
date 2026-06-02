import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG60E validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "data/article-index.json",
  "generated/daily-context.json",
  "generated/sports-context.json",
  "scripts/generate-ag60e-live-module-recheck.mjs",
  "scripts/validate-ag60e-live-module-recheck.mjs",
  "data/content-intelligence/quality-reviews/ag60e-live-module-recheck.json",
  "data/content-intelligence/phase-01-modules/ag60e-live-module-status-record.json",
  "data/content-intelligence/phase-01-modules/ag60e-article-index-verification-record.json",
  "data/content-intelligence/quality-registry/ag60e-ag60f-reading-surface-hierarchy-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag60e-to-ag60f-reading-surface-hierarchy-boundary.json",
  "data/content-intelligence/backend-architecture/ag60e-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60e-no-v02-expansion-audit.json",
  "data/quality/ag60e-live-module-recheck.json",
  "data/quality/ag60e-live-module-recheck-preview.json",
  "docs/quality/AG60E_LIVE_MODULE_RECHECK.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag60e"]) fail("Missing generate:ag60e script.");
if (!pkg.scripts?.["validate:ag60e"]) fail("Missing validate:ag60e script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag60e")) fail("validate:project must include validate:ag60e.");

const index = read("index.html");
if (!index.includes('fetch("data/article-index.json"')) fail("Homepage must fetch data/article-index.json.");
if (index.includes("data/articles/index.json")) fail("Homepage must not use wrong data/articles/index.json path.");

const articleIndex = readJson("data/article-index.json");
if ((articleIndex.publicTotal || 0) <= 0) fail("article-index publicTotal must be > 0.");
if (!Array.isArray(articleIndex.publicLatest) || articleIndex.publicLatest.length === 0) fail("article-index publicLatest must contain records.");
if (!Array.isArray(articleIndex.items) || articleIndex.items.length === 0) fail("article-index items must contain records.");

const review = readJson("data/content-intelligence/quality-reviews/ag60e-live-module-recheck.json");
const status = readJson("data/content-intelligence/phase-01-modules/ag60e-live-module-status-record.json");
const articleRecord = readJson("data/content-intelligence/phase-01-modules/ag60e-article-index-verification-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag60e-ag60f-reading-surface-hierarchy-readiness-record.json");
const preview = readJson("data/quality/ag60e-live-module-recheck-preview.json");

if (review.status !== "ag60e_live_module_recheck_completed") fail("Review status mismatch.");
if (review.summary.article_index_valid !== true) fail("Article index must be valid in review summary.");
if (review.summary.ready_for_ag60f !== true) fail("AG60F readiness must be true.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must remain false.");

if (status.article_index.source_path !== "data/article-index.json") fail("Status must record data/article-index.json.");
if (articleRecord.path !== "data/article-index.json") fail("Article record path mismatch.");
if (articleRecord.publicTotal <= 0) fail("Article record publicTotal must be > 0.");
if (readiness.ready_for_ag60f !== true) fail("Readiness must be true.");
if (preview.article_index_valid !== 1) fail("Preview article index valid must be 1.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag60e-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60e-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG60E Live Module Recheck is present.");
pass("Correct article index path data/article-index.json is verified.");
pass("Article index has public records and publicLatest records.");
pass("First Light, Sports, Reading Surface and methodology-gated module statuses are recorded.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG60F Reading Surface Hierarchy readiness is valid.");
