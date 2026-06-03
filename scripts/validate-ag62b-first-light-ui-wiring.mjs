import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG62B validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/first-light-working-data.json",
  "data/content-intelligence/quality-reviews/ag62a-first-light-working-data-foundation.json",
  "scripts/generate-ag62b-first-light-ui-wiring.mjs",
  "scripts/validate-ag62b-first-light-ui-wiring.mjs",
  "data/content-intelligence/quality-reviews/ag62b-first-light-ui-wiring.json",
  "data/content-intelligence/phase-01-modules/ag62b-first-light-ui-wiring-apply-record.json",
  "data/content-intelligence/phase-01-modules/ag62b-first-light-ui-data-contract-record.json",
  "data/content-intelligence/quality-registry/ag62b-ag62z-first-light-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag62b-to-ag62z-first-light-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ag62b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag62b-no-v02-expansion-audit.json",
  "data/quality/ag62b-first-light-ui-wiring.json",
  "data/quality/ag62b-first-light-ui-wiring-preview.json",
  "docs/quality/AG62B_FIRST_LIGHT_UI_WIRING.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag62b"]) fail("Missing generate:ag62b script.");
if (!pkg.scripts?.["validate:ag62b"]) fail("Missing validate:ag62b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag62b")) fail("validate:project must include validate:ag62b.");

const indexHtml = read("index.html");
const generated = readJson("generated/first-light-working-data.json");

for (const snippet of [
  "data-drishvara-ag62b-first-light-ui-wiring",
  "generated/first-light-working-data.json",
  "renderAg62bFirstLight",
  "drishvaraAg62bLoadFirstLight",
  "data-drishvara-ag62b-first-light-item"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing AG62B UI wiring snippet: ${snippet}`);
}

if (!Array.isArray(generated.firstLight?.items) || generated.firstLight.items.length !== 10) {
  fail("Generated First Light data must contain exactly 10 items.");
}
if (generated.source_collection_active !== false) fail("Source collection must remain false.");
if (generated.ai_selection_active !== false) fail("AI selection must remain false.");

const review = readJson("data/content-intelligence/quality-reviews/ag62b-first-light-ui-wiring.json");
const apply = readJson("data/content-intelligence/phase-01-modules/ag62b-first-light-ui-wiring-apply-record.json");
const contract = readJson("data/content-intelligence/phase-01-modules/ag62b-first-light-ui-data-contract-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag62b-ag62z-first-light-closure-readiness-record.json");
const preview = readJson("data/quality/ag62b-first-light-ui-wiring-preview.json");

if (review.status !== "ag62b_first_light_ui_wiring_completed") fail("Review status mismatch.");
if (review.summary.ui_wiring_applied !== true) fail("UI wiring summary missing.");
if (review.summary.working_data_source_connected !== true) fail("Working data source summary missing.");
if (review.summary.generated_first_light_item_count !== 10) fail("Generated item count summary mismatch.");
if (review.summary.live_news_fetching_enabled !== false) fail("Live news fetching must be false.");
if (review.summary.ai_runtime_active !== false) fail("AI runtime must be false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must be false.");
if (review.summary.ready_for_ag62z !== true) fail("AG62Z readiness missing.");

if (apply.audit_passed !== true) fail("Apply record must pass.");
if (apply.behaviour.fetches_generated_working_data !== true) fail("Fetch behaviour missing.");
if (contract.current_item_count !== 10) fail("Data contract item count mismatch.");
if (readiness.ready_for_ag62z !== true) fail("AG62Z readiness must be true.");
if (preview.ready_for_ag62z !== 1) fail("Preview AG62Z readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag62b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag62b-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG62B First Light UI Wiring is present.");
pass("Homepage is wired to generated/first-light-working-data.json.");
pass("Generated First Light data contains 10 working-data slots.");
pass("No live news fetch, runtime AI, backend or V02 action is recorded.");
pass("AG62Z First Light Closure readiness is valid.");
