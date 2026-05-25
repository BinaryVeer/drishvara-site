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
  console.error(`❌ AG23Z validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag23i-homepage-daily-surface-audit.json",
  "data/content-intelligence/audit-records/ag23i-homepage-daily-surface-audit-report.json",
  "data/content-intelligence/go-live/ag23i-homepage-daily-surface-and-first-light-closure-decision-record.json",
  "data/content-intelligence/quality-registry/ag23i-homepage-daily-surface-and-first-light-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag23i-to-ag23z-homepage-daily-surface-and-first-light-closure-boundary.json",
  "data/content-intelligence/quality-reviews/ag23z-homepage-daily-surface-and-first-light-closure.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  "data/content-intelligence/homepage/ag23z-homepage-daily-surface-and-first-light-summary.json",
  "data/content-intelligence/quality-registry/ag23z-episodic-knowledge-engine-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag23z-to-ag24a-episodic-content-doctrine-boundary.json",
  "data/quality/ag23z-homepage-daily-surface-and-first-light-closure.json",
  "data/quality/ag23z-homepage-daily-surface-and-first-light-closure-preview.json",
  "docs/quality/AG23Z_HOMEPAGE_DAILY_SURFACE_AND_FIRST_LIGHT_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag23z-homepage-daily-surface-and-first-light-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json");
const summary = readJson("data/content-intelligence/homepage/ag23z-homepage-daily-surface-and-first-light-summary.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag23z-episodic-knowledge-engine-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag23z-to-ag24a-episodic-content-doctrine-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "ag23_homepage_daily_surface_and_first_light_closed_ready_for_ag24a") fail("Review status mismatch.");
if (closure.closure_decision.ag23_closed !== true) fail("AG23 closure missing.");
if (closure.closure_decision.proceed_to_ag24a_episodic_content_doctrine !== true) fail("AG24A handoff missing.");
if (summary.result.ready_for_ag24_episodic_knowledge_engine !== true) fail("AG24 readiness summary missing.");
if (readiness.ready_for_ag24a !== true) fail("AG24A readiness missing.");
if (boundary.next_stage_id !== "AG24A") fail("AG24A boundary missing.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag23z"]) fail("Missing generate:ag23z script.");
if (!pkg.scripts?.["validate:ag23z"]) fail("Missing validate:ag23z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag23z")) fail("validate:project must include validate:ag23z.");

pass("AG23Z Homepage Daily Surface and First Light Closure is present.");
pass("AG23A to AG23I chain is closed.");
pass("AG24A Episodic Content Doctrine boundary is ready.");
pass("No runtime write, homepage mutation, GitHub write, deployment or publishing is enabled.");
