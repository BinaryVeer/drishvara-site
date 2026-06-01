import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ AG57B validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag57a-pre-live-defect-clearance-file-mapping.json",
  "data/content-intelligence/pre-live/ag57a-to-ag57b-correction-target-plan.json",
  "data/content-intelligence/quality-registry/ag57a-ag57b-public-ui-content-correction-readiness-record.json",

  "data/content-intelligence/quality-reviews/ag57b-public-ui-content-correction.json",
  "data/content-intelligence/pre-live/ag57b-public-ui-content-correction-apply-record.json",
  "data/content-intelligence/pre-live/ag57b-defect-clearance-record.json",
  "data/content-intelligence/pre-live/ag57b-source-file-delta-record.json",
  "data/content-intelligence/quality-registry/ag57b-ag57c-defect-clearance-validation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag57b-to-ag57c-defect-clearance-validation-boundary.json",
  "data/quality/ag57b-public-ui-content-correction.json",
  "data/quality/ag57b-public-ui-content-correction-preview.json",
  "docs/quality/AG57B_PUBLIC_UI_CONTENT_CORRECTION.md",
  "scripts/apply-ag57b-public-ui-content-correction.mjs",
  "scripts/validate-ag57b-public-ui-content-correction.mjs",
  "index.html",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag57a = readJson("data/content-intelligence/quality-reviews/ag57a-pre-live-defect-clearance-file-mapping.json");
const ag57aPlan = readJson("data/content-intelligence/pre-live/ag57a-to-ag57b-correction-target-plan.json");
const ag57aReady = readJson("data/content-intelligence/quality-registry/ag57a-ag57b-public-ui-content-correction-readiness-record.json");

if (ag57a.status !== "pre_live_defect_clearance_file_mapping_ready_for_ag57b") fail("AG57A status mismatch.");
if (ag57aPlan.ag57b_must_apply_actual_changes !== true) fail("AG57B actual-change requirement missing.");
if (ag57aReady.ready_for_ag57b !== true) fail("AG57B readiness missing.");

const indexHtml = read("index.html");

for (const bad of [
  "UI Step 3 Integration",
  "From signal to reading to reflection",
  "Fetching live events...",
  "Fetching tournament cards...",
  "Fetching major updates...",
  "Fetching featured sports article..."
]) {
  if (indexHtml.includes(bad)) fail(`Bad public text remains in index.html: ${bad}`);
}

for (const good of [
  "Discover → Read → Reflect",
  "From daily signals to deeper reading and reflection",
  "First Light — 10 Daily Signals",
  "Default daily selection: 10 signals — 6 India-focused and 4 international",
  "Live-event cards will appear after editorial activation.",
  "Tournament cards are held for verified sports context.",
  "Major sports updates will appear after editorial review.",
  "Featured sports reading will appear after curation.",
  "General reflective preview only; no deterministic prediction or live calculation is active.",
  "Preview status: source and regional-method verification required before any live Panchang output.",
  "Curated language preview; meanings remain editorially reviewed before public expansion.",
  "Reflective prompt only; not a personal prediction, assessment, or decision guide."
]) {
  if (!indexHtml.includes(good)) fail(`Expected corrected public text missing in index.html: ${good}`);
}

if (exists("assets/js/drishvara-language-runtime.js")) {
  const runtime = read("assets/js/drishvara-language-runtime.js");
  for (const good of [
    "From daily signals to deeper reading and reflection",
    "Prepared surface",
    "First Light — 10 Daily Signals",
    "General reflective preview only; no deterministic prediction or live calculation is active.",
    "Preview status: source and regional-method verification required before any live Panchang output."
  ]) {
    if (!runtime.includes(good)) fail(`Language runtime missing corrected key: ${good}`);
  }
}

const generatedDailyContextDir = full("generated/daily-context");
if (fs.existsSync(generatedDailyContextDir)) {
  const files = fs.readdirSync(generatedDailyContextDir).filter((f) => f.endsWith(".json"));
  if (files.length === 0) fail("No generated daily-context files found.");
  for (const f of files) {
    const obj = readJson(`generated/daily-context/${f}`);
    if (obj.first_light?.selection_rule?.default_total !== 10) fail(`${f} missing default_total 10.`);
    if (obj.first_light?.selection_rule?.india_focused !== 6) fail(`${f} missing india_focused 6.`);
    if (obj.first_light?.selection_rule?.international !== 4) fail(`${f} missing international 4.`);
  }
}

const review = readJson("data/content-intelligence/quality-reviews/ag57b-public-ui-content-correction.json");
const apply = readJson("data/content-intelligence/pre-live/ag57b-public-ui-content-correction-apply-record.json");
const clearance = readJson("data/content-intelligence/pre-live/ag57b-defect-clearance-record.json");
const delta = readJson("data/content-intelligence/pre-live/ag57b-source-file-delta-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag57b-ag57c-defect-clearance-validation-readiness-record.json");
const preview = readJson("data/quality/ag57b-public-ui-content-correction-preview.json");
const pkg = readJson("package.json");

if (review.status !== "public_ui_content_correction_applied_ready_for_ag57c") fail("AG57B review status mismatch.");
if (review.summary.actual_source_changes_applied !== true) fail("Actual source changes summary missing.");
if (review.summary.corrected_defect_count !== 5) fail("Corrected defect count must be 5.");
if (review.summary.deployment_performed !== false) fail("Deployment must remain false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (review.summary.service_role_used !== false) fail("Service role must remain false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must remain false.");

if (apply.actual_source_changes_applied !== true) fail("Apply record must show actual changes.");
if (clearance.corrected_defects.length !== 5) fail("Five corrected defects required.");
if (!delta.changed_files.includes("index.html")) fail("index.html must be in changed file delta.");
if (readiness.ready_for_ag57c !== true) fail("AG57C readiness missing.");
if (preview.actual_source_changes_applied !== 1) fail("Preview actual-change flag missing.");

if (!pkg.scripts?.["apply:ag57b"]) fail("Missing package script: apply:ag57b");
if (!pkg.scripts?.["validate:ag57b"]) fail("Missing package script: validate:ag57b");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag57b")) fail("validate:project must include validate:ag57b.");

pass("AG57B Public UI-Content Correction Patch is present.");
pass("Actual index.html public-copy corrections are valid.");
pass("Daily Signal 10 / 6 / 4 rule is visible and recorded.");
pass("Sports Desk stable fallback text is valid.");
pass("Word/Panchang/Vedic/Star Reflection safety notes are valid.");
pass("Generated daily context selection-rule metadata is valid.");
pass("No deployment/backend/runtime/service-role/V02 action is recorded.");
pass("AG57C defect clearance validation readiness is valid.");
