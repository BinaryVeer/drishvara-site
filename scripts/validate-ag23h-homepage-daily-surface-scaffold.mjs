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
  console.error(`❌ AG23H validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/quality-reviews/ag23h-homepage-daily-surface-scaffold.json",
  "data/content-intelligence/homepage/ag23h-homepage-daily-surface-scaffold.json",
  "data/content-intelligence/homepage/ag23h-discover-read-reflect-route-template.json",
  "data/content-intelligence/homepage/ag23h-first-light-signal-template.json",
  "data/content-intelligence/homepage/ag23h-signal-score-template.json",
  "data/content-intelligence/homepage/ag23h-daily-surface-record-template.json",
  "data/content-intelligence/quality-registry/ag23h-homepage-daily-surface-scaffold-blocker-register.json",
  "data/content-intelligence/quality-registry/ag23h-homepage-daily-surface-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag23h-to-ag23i-homepage-daily-surface-audit-boundary.json",
  "data/quality/ag23h-homepage-daily-surface-scaffold.json",
  "data/quality/ag23h-homepage-daily-surface-scaffold-preview.json",
  "docs/quality/AG23H_HOMEPAGE_DAILY_SURFACE_SCAFFOLD.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag23h-homepage-daily-surface-scaffold.json");
const scaffold = readJson("data/content-intelligence/homepage/ag23h-homepage-daily-surface-scaffold.json");
const route = readJson("data/content-intelligence/homepage/ag23h-discover-read-reflect-route-template.json");
const firstLight = readJson("data/content-intelligence/homepage/ag23h-first-light-signal-template.json");
const score = readJson("data/content-intelligence/homepage/ag23h-signal-score-template.json");
const daily = readJson("data/content-intelligence/homepage/ag23h-daily-surface-record-template.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag23h-homepage-daily-surface-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag23h-to-ag23i-homepage-daily-surface-audit-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "homepage_daily_surface_scaffold_created_ready_for_ag23i") fail("Review status mismatch.");
if (scaffold.status !== "homepage_daily_surface_scaffold_created_ready_for_ag23i") fail("Scaffold status mismatch.");
if (route.movements.length !== 3) fail("Route template must include three movements.");
if (firstLight.fields.length < 10) fail("First Light template incomplete.");
if (score.fields.length < 8) fail("Score template incomplete.");
if (daily.template.runtime_enabled !== false || daily.template.publish_enabled !== false) fail("Daily surface template must remain non-runtime and non-publish.");
if (readiness.ready_for_ag23i !== true) fail("AG23I readiness missing.");
if (boundary.next_stage_id !== "AG23I") fail("AG23I boundary missing.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag23h"]) fail("Missing generate:ag23h script.");
if (!pkg.scripts?.["validate:ag23h"]) fail("Missing validate:ag23h script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag23h")) fail("validate:project must include validate:ag23h.");

pass("AG23H Homepage Daily Surface Scaffold is present.");
pass("Route, First Light, score and daily surface templates are defined.");
pass("AG23I Homepage Daily Surface Audit boundary is ready.");
pass("No runtime write, homepage mutation, GitHub write, deployment or publishing is enabled.");
