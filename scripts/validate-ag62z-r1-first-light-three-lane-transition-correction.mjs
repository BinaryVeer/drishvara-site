import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG62Z-R1 validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/first-light-working-data.json",
  "data/content-intelligence/quality-reviews/ag62z-first-light-working-data-closure.json",
  "data/content-intelligence/quality-reviews/ag63a-word-of-the-day-foundation.json",
  "scripts/generate-ag62z-r1-first-light-three-lane-transition-correction.mjs",
  "scripts/validate-ag62z-r1-first-light-three-lane-transition-correction.mjs",
  "data/content-intelligence/quality-reviews/ag62z-r1-first-light-three-lane-transition-correction.json",
  "data/content-intelligence/phase-01-modules/ag62z-r1-first-light-three-lane-transition-apply-record.json",
  "data/content-intelligence/phase-01-modules/ag62z-r1-first-light-visual-contract-record.json",
  "data/content-intelligence/quality-registry/ag62z-r1-ag63b-word-of-the-day-ui-wiring-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag62z-r1-to-ag63b-word-of-the-day-ui-wiring-boundary.json",
  "data/content-intelligence/backend-architecture/ag62z-r1-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag62z-r1-no-v02-expansion-audit.json",
  "data/quality/ag62z-r1-first-light-three-lane-transition-correction.json",
  "data/quality/ag62z-r1-first-light-three-lane-transition-correction-preview.json",
  "docs/quality/AG62Z_R1_FIRST_LIGHT_THREE_LANE_TRANSITION_CORRECTION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag62z-r1"]) fail("Missing generate:ag62z-r1 script.");
if (!pkg.scripts?.["validate:ag62z-r1"]) fail("Missing validate:ag62z-r1 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag62z-r1")) fail("validate:project must include validate:ag62z-r1.");

const indexHtml = read("index.html");

for (const snippet of [
  "data-drishvara-ag62z-r1-first-light-three-lane-transition",
  "data-drishvara-ag62z-r1-visible-lanes",
  "data-drishvara-ag62z-r1-transition-enabled",
  "data-drishvara-ag62z-r1-large-lane-cards",
  "drishvara-ag62z-r1-first-light-lane",
  "ROTATION_INTERVAL_MS",
  "min-height: 178px",
  "min-height: 190px",
  "min-height: 162px"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing AG62Z-R1 large-card UI snippet: ${snippet}`);
}

const generated = readJson("generated/first-light-working-data.json");
const items = generated.firstLight?.items || [];
if (!Array.isArray(items) || items.length !== 10) fail("Underlying First Light signals must remain 10.");

const review = readJson("data/content-intelligence/quality-reviews/ag62z-r1-first-light-three-lane-transition-correction.json");
const apply = readJson("data/content-intelligence/phase-01-modules/ag62z-r1-first-light-three-lane-transition-apply-record.json");
const visual = readJson("data/content-intelligence/phase-01-modules/ag62z-r1-first-light-visual-contract-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag62z-r1-ag63b-word-of-the-day-ui-wiring-readiness-record.json");
const preview = readJson("data/quality/ag62z-r1-first-light-three-lane-transition-correction-preview.json");

if (review.status !== "ag62z_r1_first_light_three_lane_transition_correction_completed") fail("Review status mismatch.");
if (review.summary.three_visible_lanes_required !== true) fail("Three-lane summary missing.");
if (review.summary.ten_underlying_signals_retained !== true) fail("Ten-signal retention summary missing.");
if (review.summary.visible_lanes !== 3) fail("Visible lanes must be 3.");
if (review.summary.underlying_signal_count !== 10) fail("Underlying signal count must be 10.");
if (review.summary.transition_enabled !== true) fail("Transition enabled summary missing.");
if (review.summary.large_lane_cards_enabled !== true) fail("Large lane card summary missing.");
if (review.summary.live_news_fetching_enabled !== false) fail("Live news fetching must remain false.");
if (review.summary.ai_runtime_active !== false) fail("AI runtime must remain false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must remain false.");
if (review.summary.ready_for_ag63b !== true) fail("AG63B readiness missing.");

if (apply.applied_contract.visible_lanes !== 3) fail("Apply visible lane count mismatch.");
if (apply.applied_contract.underlying_signal_count !== 10) fail("Apply underlying signal count mismatch.");
if (apply.applied_contract.large_lane_cards_enabled !== true) fail("Apply large lane flag missing.");
if (visual.lane_contract.length !== 3) fail("Visual contract must define 3 lanes.");
if (visual.card_sizing_rule.default_min_height_px !== 178) fail("Default min-height mismatch.");
if (readiness.ready_for_ag63b !== true) fail("AG63B readiness must be true.");
if (preview.visible_lanes !== 3) fail("Preview visible lanes must be 3.");
if (preview.large_lane_cards_enabled !== 1) fail("Preview large lane flag missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag62z-r1-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag62z-r1-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG62Z-R1 First Light large three-lane transition correction is present.");
pass("Public visual contract is corrected to 3 larger visible lanes.");
pass("10 underlying First Light signals are retained.");
pass("Transition behaviour and large card sizing are present.");
pass("No live fetch, runtime AI, backend or V02 action is recorded.");
pass("AG63B readiness remains valid.");
