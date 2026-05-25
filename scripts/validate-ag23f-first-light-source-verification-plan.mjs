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
  console.error(`❌ AG23F validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag23e-daily-homepage-data-schema.json",
  "data/content-intelligence/quality-reviews/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/homepage/ag23f-allowed-source-categories.json",
  "data/content-intelligence/homepage/ag23f-source-verification-workflow.json",
  "data/content-intelligence/homepage/ag23f-unsupported-claim-rejection-rules.json",
  "data/content-intelligence/quality-registry/ag23f-source-verification-blocker-register.json",
  "data/content-intelligence/quality-registry/ag23f-topic-scoring-model-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag23f-to-ag23g-first-light-topic-scoring-model-boundary.json",
  "data/quality/ag23f-first-light-source-verification-plan.json",
  "data/quality/ag23f-first-light-source-verification-plan-preview.json",
  "docs/quality/AG23F_FIRST_LIGHT_SOURCE_VERIFICATION_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag23f-first-light-source-verification-plan.json");
const plan = readJson("data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json");
const categories = readJson("data/content-intelligence/homepage/ag23f-allowed-source-categories.json");
const workflow = readJson("data/content-intelligence/homepage/ag23f-source-verification-workflow.json");
const rules = readJson("data/content-intelligence/homepage/ag23f-unsupported-claim-rejection-rules.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag23f-topic-scoring-model-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag23f-to-ag23g-first-light-topic-scoring-model-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "first_light_source_verification_plan_created_ready_for_ag23g") fail("Review status mismatch.");
if (plan.status !== "first_light_source_verification_plan_created_ready_for_ag23g") fail("Plan status mismatch.");
if (categories.categories.length < 4) fail("Source categories incomplete.");
if (workflow.workflow_steps.length < 6) fail("Verification workflow incomplete.");
if (rules.reject_or_hold_when.length < 6) fail("Rejection rules incomplete.");
if (readiness.ready_for_ag23g !== true) fail("AG23G readiness missing.");
if (boundary.next_stage_id !== "AG23G") fail("AG23G boundary missing.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag23f"]) fail("Missing generate:ag23f script.");
if (!pkg.scripts?.["validate:ag23f"]) fail("Missing validate:ag23f script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag23f")) fail("validate:project must include validate:ag23f.");

pass("AG23F First Light Source and Verification Plan is present.");
pass("Source categories, workflow and rejection rules are defined.");
pass("AG23G First Light Topic Scoring Model boundary is ready.");
pass("No live feed, scraping, API call, runtime write, GitHub write, deployment or publishing is enabled.");
