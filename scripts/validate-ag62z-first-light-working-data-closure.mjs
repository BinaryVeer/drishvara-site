import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG62Z validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/first-light-working-data.json",
  "data/content-intelligence/quality-reviews/ag62a-first-light-working-data-foundation.json",
  "data/content-intelligence/quality-reviews/ag62b-first-light-ui-wiring.json",
  "scripts/generate-ag62z-first-light-working-data-closure.mjs",
  "scripts/validate-ag62z-first-light-working-data-closure.mjs",
  "data/content-intelligence/quality-reviews/ag62z-first-light-working-data-closure.json",
  "data/content-intelligence/closure-records/ag62z-first-light-working-data-and-ui-wiring-closure.json",
  "data/content-intelligence/phase-01-modules/ag62z-first-light-final-status-record.json",
  "data/content-intelligence/phase-01-modules/ag62z-first-light-live-verification-evidence-record.json",
  "data/content-intelligence/quality-registry/ag62z-ag63-word-of-the-day-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag62z-to-ag63-word-of-the-day-boundary.json",
  "data/content-intelligence/backend-architecture/ag62z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag62z-no-v02-expansion-audit.json",
  "data/quality/ag62z-first-light-working-data-closure.json",
  "data/quality/ag62z-first-light-working-data-closure-preview.json",
  "docs/quality/AG62Z_FIRST_LIGHT_WORKING_DATA_CLOSURE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag62z"]) fail("Missing generate:ag62z script.");
if (!pkg.scripts?.["validate:ag62z"]) fail("Missing validate:ag62z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag62z")) fail("validate:project must include validate:ag62z.");

const indexHtml = read("index.html");
for (const snippet of [
  "data-drishvara-ag62b-first-light-ui-wiring",
  "generated/first-light-working-data.json",
  "drishvaraAg62bLoadFirstLight"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing First Light UI closure snippet: ${snippet}`);
}

const generated = readJson("generated/first-light-working-data.json");
const items = generated.firstLight?.items || [];
if (!Array.isArray(items) || items.length !== 10) fail("First Light generated items must be 10.");
if (generated.source_collection_active !== false) fail("Source collection must be false.");
if (generated.ai_selection_active !== false) fail("AI selection must be false.");

const review = readJson("data/content-intelligence/quality-reviews/ag62z-first-light-working-data-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag62z-first-light-working-data-and-ui-wiring-closure.json");
const finalStatus = readJson("data/content-intelligence/phase-01-modules/ag62z-first-light-final-status-record.json");
const liveEvidence = readJson("data/content-intelligence/phase-01-modules/ag62z-first-light-live-verification-evidence-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag62z-ag63-word-of-the-day-readiness-record.json");
const preview = readJson("data/quality/ag62z-first-light-working-data-closure-preview.json");

if (review.status !== "ag62z_first_light_working_data_closure_completed") fail("Review status mismatch.");
if (review.summary.ag62a_foundation_completed !== true) fail("AG62A closure summary missing.");
if (review.summary.ag62b_ui_wiring_completed !== true) fail("AG62B closure summary missing.");
if (review.summary.generated_first_light_item_count !== 10) fail("Closure item count mismatch.");
if (review.summary.real_news_engine_active !== false) fail("Real news engine must be false.");
if (review.summary.ai_runtime_active !== false) fail("AI runtime must be false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must be false.");
if (review.summary.ready_for_ag63 !== true) fail("AG63 readiness missing.");

if (closure.status !== "ag62z_first_light_working_data_and_ui_wiring_closed") fail("Closure status mismatch.");
if (finalStatus.first_light.generated_item_count !== 10) fail("Final status item count mismatch.");
if (finalStatus.first_light.ui_wired_to_generated_data !== true) fail("UI wiring final status missing.");
if (liveEvidence.evidence_from_operator_terminal.live_generated_first_light_json_accessible !== true) fail("Live JSON evidence missing.");
if (liveEvidence.evidence_from_operator_terminal.live_item_count !== 10) fail("Live item count evidence mismatch.");
if (readiness.ready_for_ag63 !== true) fail("AG63 readiness must be true.");
if (preview.ready_for_ag63 !== 1) fail("Preview AG63 readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag62z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag62z-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG62Z First Light Working Data Closure is present.");
pass("AG62A foundation and AG62B UI wiring are closed.");
pass("Generated First Light working data contains 10 items.");
pass("Live verification evidence is recorded.");
pass("No real news engine, runtime AI, backend or V02 action is recorded.");
pass("AG63 Word of the Day readiness is valid.");
