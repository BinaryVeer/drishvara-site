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
  console.error(`❌ AG23D validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag23c-signal-to-article-conversion-logic.json",
  "data/content-intelligence/quality-reviews/ag23d-discover-read-reflect-mapping.json",
  "data/content-intelligence/homepage/ag23d-discover-read-reflect-mapping.json",
  "data/content-intelligence/homepage/ag23d-homepage-movement-module-map.json",
  "data/content-intelligence/homepage/ag23d-signal-output-placement-map.json",
  "data/content-intelligence/homepage/ag23d-reflection-layer-map.json",
  "data/content-intelligence/quality-registry/ag23d-discover-read-reflect-mapping-blocker-register.json",
  "data/content-intelligence/quality-registry/ag23d-daily-homepage-data-schema-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag23d-to-ag23e-daily-homepage-data-schema-boundary.json",
  "data/quality/ag23d-discover-read-reflect-mapping.json",
  "data/quality/ag23d-discover-read-reflect-mapping-preview.json",
  "docs/quality/AG23D_DISCOVER_READ_REFLECT_MAPPING.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag23d-discover-read-reflect-mapping.json");
const mapping = readJson("data/content-intelligence/homepage/ag23d-discover-read-reflect-mapping.json");
const movement = readJson("data/content-intelligence/homepage/ag23d-homepage-movement-module-map.json");
const placement = readJson("data/content-intelligence/homepage/ag23d-signal-output-placement-map.json");
const reflection = readJson("data/content-intelligence/homepage/ag23d-reflection-layer-map.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag23d-daily-homepage-data-schema-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag23d-to-ag23e-daily-homepage-data-schema-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "discover_read_reflect_mapping_created_ready_for_ag23e") fail("Review status mismatch.");
if (mapping.status !== "discover_read_reflect_mapping_created_ready_for_ag23e") fail("Mapping status mismatch.");
if (mapping.route_order.join(" → ") !== "Discover → Read → Reflect") fail("Route order mismatch.");
if (movement.movements.length !== 3) fail("Movement map must contain three movements.");
if (placement.placements.length < 5) fail("Placement map incomplete.");
if (reflection.reflection_layers.length < 4) fail("Reflection layer map incomplete.");
if (readiness.ready_for_ag23e !== true) fail("AG23E readiness missing.");
if (boundary.next_stage_id !== "AG23E") fail("AG23E boundary missing.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag23d"]) fail("Missing generate:ag23d script.");
if (!pkg.scripts?.["validate:ag23d"]) fail("Missing validate:ag23d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag23d")) fail("validate:project must include validate:ag23d.");

pass("AG23D Discover/Read/Reflect mapping is present.");
pass("Movement, placement and reflection maps are defined.");
pass("AG23E Daily Homepage Data Schema boundary is ready.");
pass("No homepage mutation, article generation, GitHub write, deployment or publishing is enabled.");
