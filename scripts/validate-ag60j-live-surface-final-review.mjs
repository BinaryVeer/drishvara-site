import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG60J validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "assets/js/drishvara-language-runtime.js",
  "data/article-index.json",
  "generated/daily-context.json",
  "generated/sports-context.json",
  "data/content-intelligence/quality-reviews/ag60i-methodology-gated-module-correction-apply.json",
  "scripts/generate-ag60j-live-surface-final-review.mjs",
  "scripts/validate-ag60j-live-surface-final-review.mjs",
  "data/content-intelligence/quality-reviews/ag60j-live-surface-final-review.json",
  "data/content-intelligence/phase-01-modules/ag60j-live-surface-final-status-record.json",
  "data/content-intelligence/phase-01-modules/ag60j-first-visit-intro-video-identification-record.json",
  "data/content-intelligence/phase-01-modules/ag60j-first-light-ai-selection-readiness-record.json",
  "data/content-intelligence/phase-01-modules/ag60j-post-final-review-module-roadmap-record.json",
  "data/content-intelligence/quality-registry/ag60j-ag61-first-visit-intro-video-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag60j-to-ag61-first-visit-intro-video-boundary.json",
  "data/content-intelligence/backend-architecture/ag60j-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60j-no-v02-expansion-audit.json",
  "data/quality/ag60j-live-surface-final-review.json",
  "data/quality/ag60j-live-surface-final-review-preview.json",
  "docs/quality/AG60J_LIVE_SURFACE_FINAL_REVIEW.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag60j"]) fail("Missing generate:ag60j script.");
if (!pkg.scripts?.["validate:ag60j"]) fail("Missing validate:ag60j script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag60j")) fail("validate:project must include validate:ag60j.");

const indexHtml = read("index.html");
const runtime = read("assets/js/drishvara-language-runtime.js");

for (const snippet of [
  "AG60I-METHODOLOGY-GATED-MODULE-CORRECTION",
  "AG60I-FUTURE-AD-PLACEHOLDER-REMOVED",
  "AG60G-R2-DUPLICATE-FEATURED-READ-REMOVED",
  "AG60G_READING_SURFACE_HIERARCHY_CORRECTION",
  "First Light — 10 Daily Signals",
  "Featured Reads",
  "Today’s Reading Guide",
  "Indexed Reads",
  "Browse by Date",
  "Sports Desk",
  "Word of the Day",
  "Today’s Vedic Guidance",
  "Panchang & Festival View",
  "Upcoming Observance",
  "Star Reflection",
  "Psychometric Assessment",
  "Reflection Method Under Review",
  "Withheld until verified"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing public surface snippet: ${snippet}`);
}

for (const forbidden of [
  "06:13 AM",
  "06:54 PM",
  "02:19 AM",
  "11:49 AM",
  "Ashtami → Navami",
  "Purva Ashadha",
  "Shiva → Siddha",
  "Krishna Paksha",
  "ॐ शनैश्चराय नमः",
  "नीला / श्याम",
  "Reserved space for future ads",
  "data-drishvara-ag09c-public-experience-listing",
  "data-drishvara-ag60g-hidden-duplicate-featured-read",
  "ag60g-r1-prepaint",
  "UI STEP 3 INTEGRATION",
  "Integrated UI Step 3",
  "First Light — 24 Hrs across India"
]) {
  if (indexHtml.includes(forbidden)) fail(`Forbidden remnant found: ${forbidden}`);
}

for (const runtimeKey of [
  "Reflective preview only; weekday, colour, mantra and food logic require verified source methodology before activation.",
  "Active calculated Panchang pilot result is available for approved pilot locations and remains under verification.",
  "Curated linguistic preview; Sanskrit/Hindi meaning, usage and source methodology remain under editorial verification.",
  "Reflection Method Under Review",
  "Withheld until verified"
]) {
  if (!runtime.includes(runtimeKey)) fail(`Missing language runtime key: ${runtimeKey}`);
}

const articleIndex = readJson("data/article-index.json");
if ((articleIndex.publicTotal || 0) <= 0) fail("Article index publicTotal must be > 0.");
if (!Array.isArray(articleIndex.publicLatest) || !articleIndex.publicLatest.length) fail("publicLatest must contain records.");

const dailyContext = readJson("generated/daily-context.json");
if (!dailyContext.first_light?.selection_rule) fail("First Light selection rule must exist.");

const sportsContext = readJson("generated/sports-context.json");
if (sportsContext.status !== "prepared_surface") fail("Sports context must remain prepared_surface.");

const review = readJson("data/content-intelligence/quality-reviews/ag60j-live-surface-final-review.json");
const surfaceStatus = readJson("data/content-intelligence/phase-01-modules/ag60j-live-surface-final-status-record.json");
const introVideo = readJson("data/content-intelligence/phase-01-modules/ag60j-first-visit-intro-video-identification-record.json");
const firstLightAi = readJson("data/content-intelligence/phase-01-modules/ag60j-first-light-ai-selection-readiness-record.json");
const roadmap = readJson("data/content-intelligence/phase-01-modules/ag60j-post-final-review-module-roadmap-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag60j-ag61-first-visit-intro-video-readiness-record.json");
const preview = readJson("data/quality/ag60j-live-surface-final-review-preview.json");

if (review.status !== "ag60j_live_surface_final_review_completed") fail("Review status mismatch.");
if (review.summary.live_surface_safe_after_ag60i !== true) fail("Live surface summary missing.");
if (review.summary.intro_video_module_identified !== true) fail("Intro video identification summary missing.");
if (review.summary.first_light_ai_selection_needed !== true) fail("First Light AI selection summary missing.");
if (review.summary.ready_for_ag61 !== true) fail("AG61 readiness summary missing.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must remain false.");

if (surfaceStatus.homepage_surface.first_light.actual_ai_selection_engine_active !== false) fail("First Light AI engine must not be active yet.");
if (introVideo.status !== "intro_video_module_identified_not_yet_implemented") fail("Intro video status mismatch.");
if (firstLightAi.status !== "first_light_ai_selection_needed_not_yet_operational") fail("First Light AI status mismatch.");
if (!Array.isArray(roadmap.sequence) || roadmap.sequence.length < 8) fail("Post-AG60J roadmap sequence incomplete.");
if (readiness.ready_for_ag61 !== true) fail("AG61 readiness must be true.");
if (preview.ready_for_ag61 !== 1) fail("Preview AG61 readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag60j-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60j-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG60J Live Surface Final Review is present.");
pass("Live surface is safe after AG60I.");
pass("Intro Video Modal is identified for AG61.");
pass("First Light AI selection need is recorded but not activated.");
pass("Post-AG60J row-by-row operationalisation roadmap is recorded.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG61 First Visit Intro Video readiness is valid.");
