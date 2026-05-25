import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag22zReview: "data/content-intelligence/quality-reviews/ag22z-repeatable-static-publishing-workflow-closure.json",
  ag22zClosure: "data/content-intelligence/closure-records/ag22z-repeatable-static-publishing-workflow-closure.json",
  ag22zSummary: "data/content-intelligence/go-live/ag22z-repeatable-static-publishing-workflow-summary.json",
  ag22zReadiness: "data/content-intelligence/quality-registry/ag22z-first-controlled-static-publish-readiness-record.json",
  ag22zBoundary: "data/content-intelligence/mutation-plans/ag22z-to-ag23a-first-controlled-static-publish-candidate-gate-boundary.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag23a-homepage-daily-route-doctrine.json",
  doctrine: "data/content-intelligence/homepage/ag23a-homepage-daily-route-doctrine.json",
  route: "data/content-intelligence/homepage/ag23a-discover-read-reflect-route-map.json",
  moduleMap: "data/content-intelligence/homepage/ag23a-homepage-module-intent-map.json",
  blocker: "data/content-intelligence/quality-registry/ag23a-homepage-daily-route-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag23a-first-light-signal-engine-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag23a-to-ag23b-first-light-24-hour-signal-engine-boundary.json",
  registry: "data/quality/ag23a-homepage-daily-route-doctrine.json",
  preview: "data/quality/ag23a-homepage-daily-route-doctrine-preview.json",
  doc: "docs/quality/AG23A_HOMEPAGE_DAILY_ROUTE_DOCTRINE.md"
};

function exists(p) {
  return fs.existsSync(path.join(root, p));
}
function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG23A input: ${p}`);
}

const ag22zReview = readJson(inputs.ag22zReview);
const ag22zClosure = readJson(inputs.ag22zClosure);
const ag22zReadiness = readJson(inputs.ag22zReadiness);
const ag22zBoundary = readJson(inputs.ag22zBoundary);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag22zReview.status !== "ag22_repeatable_static_publishing_workflow_closed_ready_for_ag23a_candidate_gate") {
  throw new Error("AG22Z review is not ready for AG23A.");
}
if (ag22zClosure.closure_decision.proceed_to_ag23a_first_controlled_static_publish_candidate_gate !== true) {
  throw new Error("AG22Z closure does not hand off to AG23A.");
}
if (ag22zReadiness.ready_for_ag23a !== true) {
  throw new Error("AG22Z readiness does not allow AG23A.");
}
if (ag22zBoundary.next_stage_id !== "AG23A") {
  throw new Error("AG22Z boundary does not point to AG23A.");
}

const blockedState = {
  homepage_mutated: false,
  first_light_live_feed_enabled: false,
  news_scraping_enabled: false,
  article_generated: false,
  article_file_created: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  live_smoke_test_performed: false,
  article_published: false,
  supabase_auth_backend_activated: false
};

const route = {
  module_id: "AG23A",
  title: "Discover Read Reflect Route Map",
  status: "homepage_daily_route_map_created_no_homepage_mutation",
  route_name: "Discover → Read → Reflect",
  daily_journey: [
    { movement: "Discover", role: "Surface curated daily signals.", planned_modules: ["First Light", "Daily Signal Cards"], live_now: false },
    { movement: "Read", role: "Move signals into deeper reading.", planned_modules: ["Featured Reads", "Weekly Article Episodes"], live_now: false },
    { movement: "Reflect", role: "Create return value through reflection.", planned_modules: ["Founder Notebook", "Today’s Guidance", "Word for the Day", "Panchang"], live_now: false }
  ],
  blocked_state: blockedState
};

const moduleMap = {
  module_id: "AG23A",
  title: "Homepage Module Intent Map",
  status: "homepage_module_intent_map_created_no_ui_mutation",
  modules: [
    { module: "First Light", movement: "Discover", purpose: "Curated 24-hour signal scan, not random breaking news." },
    { module: "Featured Reads", movement: "Read", purpose: "Deeper articles from selected signals and planned topics." },
    { module: "Weekly Article Episodes", movement: "Read", purpose: "Long-running topics such as Vedic Mathematics, engines, mutations, diagnostics and global issues." },
    { module: "Founder Notebook", movement: "Reflect", purpose: "Founder-led observation and editorial voice." },
    { module: "Today’s Vedic Guidance / Word / Panchang", movement: "Reflect", purpose: "Daily return-value modules without mixing with news claims." }
  ],
  blocked_state: blockedState
};

const doctrine = {
  module_id: "AG23A",
  title: "Homepage Daily Route Doctrine",
  status: "homepage_daily_route_doctrine_created_pending_ag23b",
  realignment_note: "AG22Z boundary used the earlier title 'First Controlled Static Publish Candidate Gate'. AG23A realigns AG23 to the agreed Homepage Daily Surface and First Light planning series.",
  agreed_ag23_series: [
    "AG23A — Homepage Daily Route Doctrine",
    "AG23B — First Light 24-Hour Signal Engine",
    "AG23C — Signal-to-Article Conversion Logic",
    "AG23D — Discover/Read/Reflect Mapping",
    "AG23E — Daily Homepage Data Schema",
    "AG23F — First Light Source and Verification Plan",
    "AG23G — First Light Topic Scoring Model",
    "AG23H — Homepage Daily Surface Scaffold",
    "AG23I — Homepage Daily Surface Audit",
    "AG23Z — Homepage Daily Surface and First Light Closure"
  ],
  route_principle: "Homepage should move as one daily surface: Discover → Read → Reflect.",
  editorial_principles: [
    "Curate signals; do not chase random breaking news.",
    "Separate factual signal from reflective interpretation.",
    "Convert strong signals into article briefs or episode candidates.",
    "Avoid unsupported claims and unverified source-dependent content.",
    "Keep Supabase/Auth/backend deferred under hybrid staged path."
  ],
  route_file: outputs.route,
  module_map_file: outputs.moduleMap,
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG23A",
  title: "Homepage Daily Route Blocker Register",
  status: "homepage_daily_route_operations_blocked_pending_ag23b",
  blocked_items: [
    "No homepage mutation.",
    "No First Light live feed.",
    "No news scraping.",
    "No article generation.",
    "No article file creation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No Supabase/Auth/backend activation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG23A",
  title: "First Light Signal Engine Readiness Record",
  status: "ready_for_ag23b_first_light_24_hour_signal_engine",
  ready_for_ag23b: true,
  next_stage_id: "AG23B",
  next_stage_title: "First Light 24-Hour Signal Engine",
  doctrine_created: true,
  route_map_created: true,
  module_intent_map_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG23A",
  title: "AG23A to AG23B First Light 24-Hour Signal Engine Boundary",
  status: "ag23b_boundary_created_not_started",
  next_stage_id: "AG23B",
  next_stage_title: "First Light 24-Hour Signal Engine",
  allowed_scope: [
    "Define First Light signal categories.",
    "Define curated India, regional and world signal inputs.",
    "Define signal freshness and source-safety rules.",
    "Keep it planning-only and non-live."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG23A",
  title: "Homepage Daily Route Doctrine",
  status: "homepage_daily_route_doctrine_created_ready_for_ag23b",
  depends_on: ["AG22Z"],
  generated_from: inputs,
  doctrine_file: outputs.doctrine,
  route_file: outputs.route,
  module_map_file: outputs.moduleMap,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    ag23_series_realigned: true,
    homepage_route_defined: true,
    discover_read_reflect_defined: true,
    ready_for_ag23b: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG23A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG23A",
  preview_only: true,
  status: review.status,
  message: "AG23A route doctrine created. Next: AG23B First Light 24-Hour Signal Engine.",
  blocked_state: blockedState
};

const doc = `# AG23A — Homepage Daily Route Doctrine

## Purpose

AG23A defines the daily homepage journey for Drishvara.

The route is:

**Discover → Read → Reflect**

## Realignment Note

AG22Z created an AG23A boundary using the earlier title "First Controlled Static Publish Candidate Gate". AG23A now realigns the AG23 series to the agreed Homepage Daily Surface and First Light planning path.

## Blocked State

No homepage mutation, live feed, scraping, article generation, GitHub write, deployment, publishing, or Supabase/Auth/backend activation is performed.

## Next Stage

AG23B — First Light 24-Hour Signal Engine.
`;

writeJson(outputs.review, review);
writeJson(outputs.doctrine, doctrine);
writeJson(outputs.route, route);
writeJson(outputs.moduleMap, moduleMap);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG23A Homepage Daily Route Doctrine generated.");
console.log("✅ Discover → Read → Reflect route defined.");
console.log("✅ AG23 series realigned to homepage/First Light planning.");
console.log("✅ No homepage mutation, GitHub write, deployment or publishing performed.");
console.log("✅ AG23B First Light 24-Hour Signal Engine boundary created.");
