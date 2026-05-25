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
  console.error(`❌ AG23C validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag23b-first-light-24-hour-signal-engine.json",
  "data/content-intelligence/quality-reviews/ag23c-signal-to-article-conversion-logic.json",
  "data/content-intelligence/homepage/ag23c-signal-to-article-conversion-logic.json",
  "data/content-intelligence/homepage/ag23c-signal-scoring-fields.json",
  "data/content-intelligence/homepage/ag23c-article-brief-template.json",
  "data/content-intelligence/homepage/ag23c-weekly-episode-candidate-logic.json",
  "data/content-intelligence/quality-registry/ag23c-signal-to-article-conversion-blocker-register.json",
  "data/content-intelligence/quality-registry/ag23c-discover-read-reflect-mapping-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag23c-to-ag23d-discover-read-reflect-mapping-boundary.json",
  "data/quality/ag23c-signal-to-article-conversion-logic.json",
  "data/quality/ag23c-signal-to-article-conversion-logic-preview.json",
  "docs/quality/AG23C_SIGNAL_TO_ARTICLE_CONVERSION_LOGIC.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag23c-signal-to-article-conversion-logic.json");
const logic = readJson("data/content-intelligence/homepage/ag23c-signal-to-article-conversion-logic.json");
const scoring = readJson("data/content-intelligence/homepage/ag23c-signal-scoring-fields.json");
const brief = readJson("data/content-intelligence/homepage/ag23c-article-brief-template.json");
const episode = readJson("data/content-intelligence/homepage/ag23c-weekly-episode-candidate-logic.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag23c-discover-read-reflect-mapping-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag23c-to-ag23d-discover-read-reflect-mapping-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "signal_to_article_conversion_logic_created_ready_for_ag23d") fail("Review status mismatch.");
if (logic.status !== "signal_to_article_conversion_logic_created_ready_for_ag23d") fail("Logic status mismatch.");
if (scoring.fields.length < 6) fail("Scoring fields incomplete.");
if (brief.template_fields.length < 8) fail("Article brief template incomplete.");
if (episode.episode_candidate_rules.length < 5) fail("Episode candidate logic incomplete.");
if (readiness.ready_for_ag23d !== true) fail("AG23D readiness missing.");
if (boundary.next_stage_id !== "AG23D") fail("AG23D boundary missing.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag23c"]) fail("Missing generate:ag23c script.");
if (!pkg.scripts?.["validate:ag23c"]) fail("Missing validate:ag23c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag23c")) fail("validate:project must include validate:ag23c.");

pass("AG23C signal-to-article conversion logic is present.");
pass("Scoring fields and article brief template are defined.");
pass("Weekly episode candidate logic is defined.");
pass("AG23D Discover/Read/Reflect Mapping boundary is ready.");
pass("No article generation, homepage mutation, GitHub write, deployment or publishing is enabled.");
