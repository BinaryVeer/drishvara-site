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
  console.error(`❌ AG23E validation failed: ${msg}`);
  process.exit(1);
}
function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag23d-discover-read-reflect-mapping.json",
  "data/content-intelligence/quality-reviews/ag23e-daily-homepage-data-schema.json",
  "data/content-intelligence/homepage/ag23e-daily-homepage-data-schema.json",
  "data/content-intelligence/homepage/ag23e-first-light-card-schema.json",
  "data/content-intelligence/homepage/ag23e-read-surface-schema.json",
  "data/content-intelligence/homepage/ag23e-reflection-surface-schema.json",
  "data/content-intelligence/quality-registry/ag23e-daily-homepage-data-schema-blocker-register.json",
  "data/content-intelligence/quality-registry/ag23e-first-light-source-verification-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag23e-to-ag23f-first-light-source-verification-plan-boundary.json",
  "data/quality/ag23e-daily-homepage-data-schema.json",
  "data/quality/ag23e-daily-homepage-data-schema-preview.json",
  "docs/quality/AG23E_DAILY_HOMEPAGE_DATA_SCHEMA.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag23e-daily-homepage-data-schema.json");
const schema = readJson("data/content-intelligence/homepage/ag23e-daily-homepage-data-schema.json");
const firstLight = readJson("data/content-intelligence/homepage/ag23e-first-light-card-schema.json");
const readSurface = readJson("data/content-intelligence/homepage/ag23e-read-surface-schema.json");
const reflection = readJson("data/content-intelligence/homepage/ag23e-reflection-surface-schema.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag23e-first-light-source-verification-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag23e-to-ag23f-first-light-source-verification-plan-boundary.json");
const pkg = readJson("package.json");

if (review.status !== "daily_homepage_data_schema_created_ready_for_ag23f") fail("Review status mismatch.");
if (schema.status !== "daily_homepage_data_schema_created_ready_for_ag23f") fail("Schema status mismatch.");
if (schema.homepage_route.join(" → ") !== "Discover → Read → Reflect") fail("Homepage route mismatch.");
if (firstLight.fields.length < 10) fail("First Light schema incomplete.");
if (readSurface.fields.length < 10) fail("Read surface schema incomplete.");
if (reflection.fields.length < 8) fail("Reflection schema incomplete.");
if (readiness.ready_for_ag23f !== true) fail("AG23F readiness missing.");
if (boundary.next_stage_id !== "AG23F") fail("AG23F boundary missing.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag23e"]) fail("Missing generate:ag23e script.");
if (!pkg.scripts?.["validate:ag23e"]) fail("Missing validate:ag23e script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag23e")) fail("validate:project must include validate:ag23e.");

pass("AG23E Daily Homepage Data Schema is present.");
pass("First Light, Read surface and Reflection schemas are defined.");
pass("AG23F First Light Source and Verification Plan boundary is ready.");
pass("No homepage mutation, runtime write, GitHub write, deployment or publishing is enabled.");
