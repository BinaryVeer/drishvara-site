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
  console.error(`❌ AG23A validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag22z-repeatable-static-publishing-workflow-closure.json",
  "data/content-intelligence/closure-records/ag22z-repeatable-static-publishing-workflow-closure.json",
  "data/content-intelligence/mutation-plans/ag22z-to-ag23a-first-controlled-static-publish-candidate-gate-boundary.json",

  "data/content-intelligence/quality-reviews/ag23a-homepage-daily-route-doctrine.json",
  "data/content-intelligence/homepage/ag23a-homepage-daily-route-doctrine.json",
  "data/content-intelligence/homepage/ag23a-discover-read-reflect-route-map.json",
  "data/content-intelligence/homepage/ag23a-homepage-module-intent-map.json",
  "data/content-intelligence/quality-registry/ag23a-homepage-daily-route-blocker-register.json",
  "data/content-intelligence/quality-registry/ag23a-first-light-signal-engine-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag23a-to-ag23b-first-light-24-hour-signal-engine-boundary.json",
  "data/quality/ag23a-homepage-daily-route-doctrine.json",
  "data/quality/ag23a-homepage-daily-route-doctrine-preview.json",
  "docs/quality/AG23A_HOMEPAGE_DAILY_ROUTE_DOCTRINE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag22z = readJson("data/content-intelligence/quality-reviews/ag22z-repeatable-static-publishing-workflow-closure.json");
const review = readJson("data/content-intelligence/quality-reviews/ag23a-homepage-daily-route-doctrine.json");
const doctrine = readJson("data/content-intelligence/homepage/ag23a-homepage-daily-route-doctrine.json");
const route = readJson("data/content-intelligence/homepage/ag23a-discover-read-reflect-route-map.json");
const moduleMap = readJson("data/content-intelligence/homepage/ag23a-homepage-module-intent-map.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag23a-first-light-signal-engine-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag23a-to-ag23b-first-light-24-hour-signal-engine-boundary.json");
const pkg = readJson("package.json");

if (ag22z.status !== "ag22_repeatable_static_publishing_workflow_closed_ready_for_ag23a_candidate_gate") fail("AG22Z not ready.");
if (review.status !== "homepage_daily_route_doctrine_created_ready_for_ag23b") fail("Review status mismatch.");
if (doctrine.status !== "homepage_daily_route_doctrine_created_pending_ag23b") fail("Doctrine status mismatch.");
if (route.daily_journey.length !== 3) fail("Route must include Discover, Read, Reflect.");
if (route.daily_journey.map((x) => x.movement).join(" → ") !== "Discover → Read → Reflect") fail("Route order mismatch.");
if (moduleMap.modules.length < 5) fail("Module intent map incomplete.");
if (readiness.ready_for_ag23b !== true) fail("AG23B readiness missing.");
if (boundary.next_stage_id !== "AG23B") fail("AG23B boundary missing.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag23a"]) fail("Missing generate:ag23a script.");
if (!pkg.scripts?.["validate:ag23a"]) fail("Missing validate:ag23a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag23a")) fail("validate:project must include validate:ag23a.");

pass("AG23A homepage daily route doctrine is present.");
pass("Discover → Read → Reflect route is defined.");
pass("Homepage module intent map is present.");
pass("AG23B First Light 24-Hour Signal Engine boundary is ready.");
pass("No homepage mutation, GitHub write, deployment or publishing is enabled.");
