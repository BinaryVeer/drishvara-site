import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ AG57C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag57b-public-ui-content-correction.json",
  "data/content-intelligence/pre-live/ag57b-public-ui-content-correction-apply-record.json",
  "data/content-intelligence/pre-live/ag57b-defect-clearance-record.json",
  "data/content-intelligence/pre-live/ag57b-source-file-delta-record.json",
  "data/content-intelligence/quality-registry/ag57b-ag57c-defect-clearance-validation-readiness-record.json",

  "data/content-intelligence/quality-reviews/ag57c-defect-clearance-validation.json",
  "data/content-intelligence/pre-live/ag57c-source-consumption-record.json",
  "data/content-intelligence/pre-live/ag57c-defect-clearance-validation-record.json",
  "data/content-intelligence/pre-live/ag57c-public-copy-validation-record.json",
  "data/content-intelligence/pre-live/ag57c-daily-signal-rule-validation-record.json",
  "data/content-intelligence/pre-live/ag57c-safety-boundary-validation-record.json",
  "data/content-intelligence/quality-registry/ag57c-ag57z-pre-live-defect-clearance-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag57c-to-ag57z-pre-live-defect-clearance-closure-boundary.json",
  "data/quality/ag57c-defect-clearance-validation.json",
  "data/quality/ag57c-defect-clearance-validation-preview.json",
  "docs/quality/AG57C_DEFECT_CLEARANCE_VALIDATION.md",
  "scripts/generate-ag57c-defect-clearance-validation.mjs",
  "scripts/validate-ag57c-defect-clearance-validation.mjs",
  "index.html",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const indexHtml = read("index.html");

for (const bad of [
  "UI Step 3 Integration",
  "From signal to reading to reflection",
  "Fetching live events...",
  "Fetching tournament cards...",
  "Fetching major updates...",
  "Fetching featured sports article..."
]) {
  if (indexHtml.includes(bad)) fail(`Bad public text remains: ${bad}`);
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
  if (!indexHtml.includes(good)) fail(`Expected corrected text missing: ${good}`);
}

const dailyDir = full("generated/daily-context");
if (!fs.existsSync(dailyDir)) fail("generated/daily-context missing.");
const dailyFiles = fs.readdirSync(dailyDir).filter((f) => f.endsWith(".json"));
if (dailyFiles.length === 0) fail("No daily context files found.");
for (const file of dailyFiles) {
  const obj = readJson(`generated/daily-context/${file}`);
  if (obj.first_light?.selection_rule?.default_total !== 10) fail(`${file} missing default_total 10.`);
  if (obj.first_light?.selection_rule?.india_focused !== 6) fail(`${file} missing india_focused 6.`);
  if (obj.first_light?.selection_rule?.international !== 4) fail(`${file} missing international 4.`);
}

const ag57b = readJson("data/content-intelligence/quality-reviews/ag57b-public-ui-content-correction.json");
if (ag57b.status !== "public_ui_content_correction_applied_ready_for_ag57c") fail("AG57B status mismatch.");

const review = readJson("data/content-intelligence/quality-reviews/ag57c-defect-clearance-validation.json");
const validation = readJson("data/content-intelligence/pre-live/ag57c-defect-clearance-validation-record.json");
const publicCopy = readJson("data/content-intelligence/pre-live/ag57c-public-copy-validation-record.json");
const signalRule = readJson("data/content-intelligence/pre-live/ag57c-daily-signal-rule-validation-record.json");
const safety = readJson("data/content-intelligence/pre-live/ag57c-safety-boundary-validation-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag57c-ag57z-pre-live-defect-clearance-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag57c-to-ag57z-pre-live-defect-clearance-closure-boundary.json");
const preview = readJson("data/quality/ag57c-defect-clearance-validation-preview.json");
const pkg = readJson("package.json");

if (review.status !== "defect_clearance_validation_ready_for_ag57z") fail("AG57C review status mismatch.");
if (review.summary.all_ag56z_pre_live_defects_validated_cleared !== true) fail("All defects cleared summary missing.");
if (review.summary.cleared_defect_count !== 5) fail("Cleared defect count must be 5.");
if (review.summary.remaining_defect_count !== 0) fail("Remaining defect count must be 0.");
if (review.summary.deployment_performed !== false) fail("Deployment must remain false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (review.summary.service_role_used !== false) fail("Service role must remain false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must remain false.");

if (validation.audit_passed !== true) fail("Validation record must pass.");
if (validation.cleared_defect_count !== 5) fail("Validation cleared defect count must be 5.");
if (validation.remaining_defect_count !== 0) fail("Validation remaining defect count must be 0.");
for (const item of validation.validated_defects) {
  if (item.cleared !== true) fail(`Defect not cleared: ${item.defect_id}`);
}

if (publicCopy.audit_passed !== true || publicCopy.public_copy_defects_cleared !== true) fail("Public copy validation failed.");
if (signalRule.audit_passed !== true || signalRule.daily_signal_rule_cleared !== true) fail("Signal rule validation failed.");
if (safety.audit_passed !== true || safety.safety_boundary_cleared !== true) fail("Safety boundary validation failed.");

if (readiness.ready_for_ag57z !== true) fail("AG57Z readiness missing.");
if (readiness.remaining_defect_count !== 0) fail("AG57Z readiness must have zero remaining defects.");
if (boundary.status !== "ag57z_pre_live_defect_clearance_closure_boundary_created") fail("AG57Z boundary mismatch.");

if (preview.all_ag56z_pre_live_defects_validated_cleared !== 1) fail("Preview all-defects-cleared missing.");
if (preview.remaining_defect_count !== 0) fail("Preview remaining defect count must be zero.");

if (!pkg.scripts?.["generate:ag57c"]) fail("Missing package script: generate:ag57c");
if (!pkg.scripts?.["validate:ag57c"]) fail("Missing package script: validate:ag57c");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag57c")) fail("validate:project must include validate:ag57c.");

pass("AG57C Defect Clearance Validation is present.");
pass("All five AG56Z pre-live defects are validated as cleared.");
pass("Public copy validation is valid.");
pass("Daily Signal 10 / 6 / 4 validation is valid.");
pass("Sports Desk fallback validation is valid.");
pass("Word/Panchang/Vedic/Star Reflection safety validation is valid.");
pass("AG57Z pre-live defect clearance closure readiness is valid.");
