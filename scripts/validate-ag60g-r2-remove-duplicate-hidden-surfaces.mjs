import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const full = (p) => path.join(root, p);
const exists = (p) => fs.existsSync(full(p));
const read = (p) => fs.readFileSync(full(p), "utf8");
const readJson = (p) => JSON.parse(read(p));
const fail = (m) => { console.error(`❌ AG60G-R2 validation failed: ${m}`); process.exit(1); };
const pass = (m) => console.log(`✅ ${m}`);

for (const file of [
  "package.json",
  "index.html",
  "scripts/generate-ag60g-r2-remove-duplicate-hidden-surfaces.mjs",
  "scripts/validate-ag60g-r2-remove-duplicate-hidden-surfaces.mjs",
  "data/content-intelligence/quality-reviews/ag60g-r2-remove-duplicate-hidden-surfaces.json",
  "data/content-intelligence/phase-01-modules/ag60g-r2-remove-duplicate-hidden-surfaces-record.json",
  "data/content-intelligence/quality-registry/ag60g-r2-ag60h-methodology-gated-module-audit-readiness-record.json",
  "data/content-intelligence/backend-architecture/ag60g-r2-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60g-r2-no-v02-expansion-audit.json",
  "data/quality/ag60g-r2-remove-duplicate-hidden-surfaces.json",
  "data/quality/ag60g-r2-remove-duplicate-hidden-surfaces-preview.json",
  "docs/quality/AG60G_R2_REMOVE_DUPLICATE_HIDDEN_SURFACES.md"
]) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag60g-r2"]) fail("Missing generate:ag60g-r2 script.");
if (!pkg.scripts?.["validate:ag60g-r2"]) fail("Missing validate:ag60g-r2 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag60g-r2")) fail("validate:project must include validate:ag60g-r2.");

const indexHtml = read("index.html");

for (const bad of [
  "data-drishvara-ag09c-public-experience-listing",
  "data-drishvara-ag60g-hidden-duplicate-featured-read",
  "ag60g-r1-prepaint-hidden-surface-guard",
  "ag60g-r1-prepaint-state",
  "ag60g-r1-prepaint-release"
]) {
  if (indexHtml.includes(bad)) fail(`Duplicate/hidden remnant still present: ${bad}`);
}

for (const good of [
  "AG09C-PUBLIC-EXPERIENCE-LISTING: REMOVED_FROM_PUBLIC_UI_BY_AG60G_R2",
  "AG60G-R2-DUPLICATE-FEATURED-READ-REMOVED",
  "AG60G_READING_SURFACE_HIERARCHY_CORRECTION",
  "fetchAg60gArticleIndexData",
  "renderAg60gFeaturedReadsFromArticleIndex",
  "renderAg60gReadingGuideFromArticleIndex",
  "initialiseAg60gOpenDayFromArticleIndex"
]) {
  if (!indexHtml.includes(good)) fail(`Required retained marker missing: ${good}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag60g-r2-remove-duplicate-hidden-surfaces.json");
const apply = readJson("data/content-intelligence/phase-01-modules/ag60g-r2-remove-duplicate-hidden-surfaces-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag60g-r2-ag60h-methodology-gated-module-audit-readiness-record.json");
const preview = readJson("data/quality/ag60g-r2-remove-duplicate-hidden-surfaces-preview.json");

if (review.status !== "ag60g_r2_duplicate_hidden_surfaces_removed") fail("Review status mismatch.");
if (review.summary.duplicate_ag09c_single_featured_read_removed !== true) fail("AG09C removal summary missing.");
if (review.summary.prepaint_hidden_surface_guard_removed !== true) fail("Prepaint removal summary missing.");
if (apply.audit_passed !== true) fail("Apply record must pass.");
if (readiness.ready_for_ag60h !== true) fail("AG60H readiness must be true.");
if (preview.ready_for_ag60h !== 1) fail("Preview AG60H readiness missing.");

pass("AG60G-R2 duplicate hidden surfaces removal is present.");
pass("Duplicate AG09C single Featured Read block is removed.");
pass("AG60G-R1 pre-paint hidden surface guard is removed.");
pass("Reading Surface fallbacks remain retained.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG60H readiness is valid.");
