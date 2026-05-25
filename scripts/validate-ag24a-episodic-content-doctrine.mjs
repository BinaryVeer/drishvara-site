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
  console.error(`❌ AG24A validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag23z-homepage-daily-surface-and-first-light-closure.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  "data/content-intelligence/homepage/ag23z-homepage-daily-surface-and-first-light-summary.json",
  "data/content-intelligence/quality-registry/ag23z-episodic-knowledge-engine-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag23z-to-ag24a-episodic-content-doctrine-boundary.json",
  "data/content-intelligence/homepage/ag23c-weekly-episode-candidate-logic.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/quality-reviews/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24a-weekly-episodic-rhythm-doctrine.json",
  "data/content-intelligence/episodes/ag24a-series-type-registry.json",
  "data/content-intelligence/episodes/ag24a-episodic-content-guardrails.json",
  "data/content-intelligence/quality-registry/ag24a-episodic-content-doctrine-blocker-register.json",
  "data/content-intelligence/quality-registry/ag24a-topic-selection-scoring-engine-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24a-to-ag24b-topic-selection-scoring-engine-plan-boundary.json",
  "data/quality/ag24a-episodic-content-doctrine.json",
  "data/quality/ag24a-episodic-content-doctrine-preview.json",
  "docs/quality/AG24A_EPISODIC_CONTENT_DOCTRINE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag24a-episodic-content-doctrine.json");
const doctrine = readJson("data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json");
const rhythm = readJson("data/content-intelligence/episodes/ag24a-weekly-episodic-rhythm-doctrine.json");
const seriesTypes = readJson("data/content-intelligence/episodes/ag24a-series-type-registry.json");
const guardrails = readJson("data/content-intelligence/episodes/ag24a-episodic-content-guardrails.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag24a-topic-selection-scoring-engine-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag24a-to-ag24b-topic-selection-scoring-engine-plan-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "episodic_content_doctrine_created_ready_for_ag24b") fail("Review status mismatch.");
if (doctrine.status !== "episodic_content_doctrine_created_ready_for_ag24b") fail("Doctrine status mismatch.");
if (rhythm.rhythm.length !== 3) fail("Weekly rhythm must include Tuesday, Friday and Sunday.");
if (seriesTypes.series_types.length < 4) fail("Series type registry incomplete.");
if (guardrails.guardrails.length < 6) fail("Guardrails incomplete.");
if (readiness.ready_for_ag24b !== true) fail("AG24B readiness missing.");
if (boundary.next_stage_id !== "AG24B") fail("AG24B boundary missing.");
if (review.summary.prior_ag_records_consumed !== true) fail("Prior AG records must be consumed.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag24a"]) fail("Missing generate:ag24a script.");
if (!pkg.scripts?.["validate:ag24a"]) fail("Missing validate:ag24a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag24a")) fail("validate:project must include validate:ag24a.");

pass("AG24A Episodic Content Doctrine is present.");
pass("Weekly rhythm, series types and guardrails are defined.");
pass("Prior AG23 records are consumed as source-of-truth.");
pass("AG24B Topic Selection and Scoring Engine Plan boundary is ready.");
pass("No episode/article generation, GitHub write, deployment or publishing is enabled.");
