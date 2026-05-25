import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}
function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}
function fail(msg) {
  console.error(`❌ AG23B validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag23a-homepage-daily-route-doctrine.json",
  "data/content-intelligence/quality-reviews/ag23b-first-light-24-hour-signal-engine.json",
  "data/content-intelligence/homepage/ag23b-first-light-24-hour-signal-engine.json",
  "data/content-intelligence/homepage/ag23b-first-light-signal-type-registry.json",
  "data/content-intelligence/homepage/ag23b-first-light-source-band-plan.json",
  "data/content-intelligence/homepage/ag23b-first-light-freshness-and-safety-rules.json",
  "data/content-intelligence/quality-registry/ag23b-first-light-signal-engine-blocker-register.json",
  "data/content-intelligence/quality-registry/ag23b-signal-to-article-conversion-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag23b-to-ag23c-signal-to-article-conversion-logic-boundary.json",
  "data/quality/ag23b-first-light-24-hour-signal-engine.json",
  "data/quality/ag23b-first-light-24-hour-signal-engine-preview.json",
  "docs/quality/AG23B_FIRST_LIGHT_24_HOUR_SIGNAL_ENGINE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag23b-first-light-24-hour-signal-engine.json");
const engine = readJson("data/content-intelligence/homepage/ag23b-first-light-24-hour-signal-engine.json");
const signalTypes = readJson("data/content-intelligence/homepage/ag23b-first-light-signal-type-registry.json");
const sourceBands = readJson("data/content-intelligence/homepage/ag23b-first-light-source-band-plan.json");
const freshnessRules = readJson("data/content-intelligence/homepage/ag23b-first-light-freshness-and-safety-rules.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag23b-signal-to-article-conversion-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag23b-to-ag23c-signal-to-article-conversion-logic-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "first_light_24_hour_signal_engine_created_ready_for_ag23c") fail("Review status mismatch.");
if (engine.status !== "first_light_24_hour_signal_engine_created_pending_ag23c") fail("Engine status mismatch.");
if (signalTypes.signal_types.length < 6) fail("Signal type registry incomplete.");
if (sourceBands.source_bands.length < 4) fail("Source band plan incomplete.");
if (freshnessRules.rules.length < 5) fail("Freshness/safety rules incomplete.");
if (readiness.ready_for_ag23c !== true) fail("AG23C readiness missing.");
if (boundary.next_stage_id !== "AG23C") fail("AG23C boundary missing.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag23b"]) fail("Missing generate:ag23b script.");
if (!pkg.scripts?.["validate:ag23b"]) fail("Missing validate:ag23b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag23b")) fail("validate:project must include validate:ag23b.");

pass("AG23B First Light signal engine is present.");
pass("Signal types, source bands and safety rules are defined.");
pass("AG23C Signal-to-Article Conversion Logic boundary is ready.");
pass("No live feed, scraping, API call, GitHub write, deployment or publishing is enabled.");
