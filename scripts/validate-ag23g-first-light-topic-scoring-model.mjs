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
  console.error(`❌ AG23G validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/quality-reviews/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23g-topic-score-fields.json",
  "data/content-intelligence/homepage/ag23g-topic-scoring-weights.json",
  "data/content-intelligence/homepage/ag23g-topic-score-thresholds.json",
  "data/content-intelligence/homepage/ag23g-topic-ranking-decision-rules.json",
  "data/content-intelligence/quality-registry/ag23g-topic-scoring-model-blocker-register.json",
  "data/content-intelligence/quality-registry/ag23g-homepage-daily-surface-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag23g-to-ag23h-homepage-daily-surface-scaffold-boundary.json",
  "data/quality/ag23g-first-light-topic-scoring-model.json",
  "data/quality/ag23g-first-light-topic-scoring-model-preview.json",
  "docs/quality/AG23G_FIRST_LIGHT_TOPIC_SCORING_MODEL.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag23g-first-light-topic-scoring-model.json");
const model = readJson("data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json");
const fields = readJson("data/content-intelligence/homepage/ag23g-topic-score-fields.json");
const weights = readJson("data/content-intelligence/homepage/ag23g-topic-scoring-weights.json");
const thresholds = readJson("data/content-intelligence/homepage/ag23g-topic-score-thresholds.json");
const rules = readJson("data/content-intelligence/homepage/ag23g-topic-ranking-decision-rules.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag23g-homepage-daily-surface-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag23g-to-ag23h-homepage-daily-surface-scaffold-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "first_light_topic_scoring_model_created_ready_for_ag23h") fail("Review status mismatch.");
if (model.status !== "first_light_topic_scoring_model_created_ready_for_ag23h") fail("Model status mismatch.");
if (fields.fields.length < 8) fail("Score fields incomplete.");
if (weights.weights.length < 8) fail("Scoring weights incomplete.");
if (thresholds.thresholds.length < 3) fail("Thresholds incomplete.");
if (rules.rules.length < 5) fail("Ranking rules incomplete.");
if (readiness.ready_for_ag23h !== true) fail("AG23H readiness missing.");
if (boundary.next_stage_id !== "AG23H") fail("AG23H boundary missing.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag23g"]) fail("Missing generate:ag23g script.");
if (!pkg.scripts?.["validate:ag23g"]) fail("Missing validate:ag23g script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag23g")) fail("validate:project must include validate:ag23g.");

pass("AG23G First Light Topic Scoring Model is present.");
pass("Score fields, weights, thresholds and ranking rules are defined.");
pass("AG23H Homepage Daily Surface Scaffold boundary is ready.");
pass("No runtime write, homepage mutation, GitHub write, deployment or publishing is enabled.");
