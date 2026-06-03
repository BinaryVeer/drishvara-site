import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG64B validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/panchang-festival-working-data.json",
  "data/content-intelligence/quality-reviews/ag64a-panchang-festival-foundation.json",
  "scripts/generate-ag64b-panchang-festival-ui-wiring.mjs",
  "scripts/validate-ag64b-panchang-festival-ui-wiring.mjs",
  "data/content-intelligence/quality-reviews/ag64b-panchang-festival-ui-wiring.json",
  "data/content-intelligence/phase-01-modules/ag64b-panchang-festival-ui-wiring-apply-record.json",
  "data/content-intelligence/phase-01-modules/ag64b-panchang-festival-ui-data-contract-record.json",
  "data/content-intelligence/quality-registry/ag64b-ag64z-panchang-festival-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag64b-to-ag64z-panchang-festival-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ag64b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag64b-no-v02-expansion-audit.json",
  "data/quality/ag64b-panchang-festival-ui-wiring.json",
  "data/quality/ag64b-panchang-festival-ui-wiring-preview.json",
  "docs/quality/AG64B_PANCHANG_FESTIVAL_UI_WIRING.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag64b"]) fail("Missing generate:ag64b script.");
if (!pkg.scripts?.["validate:ag64b"]) fail("Missing validate:ag64b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag64b")) fail("validate:project must include validate:ag64b.");

const indexHtml = read("index.html");
const workingData = readJson("generated/panchang-festival-working-data.json");

for (const snippet of [
  "data-drishvara-ag64b-panchang-festival-ui-wiring",
  "generated/panchang-festival-working-data.json",
  "drishvaraAg64bLoadPanchangFestival",
  "data-drishvara-ag64b-panchang-working-data",
  "data-drishvara-ag64b-exact-values-withheld",
  "data-drishvara-ag64b-panchang-festival-wired"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing AG64B UI wiring snippet: ${snippet}`);
}

for (const id of [
  'id="panchang-place-select"',
  'id="panchang-sunrise"',
  'id="panchang-sunset"',
  'id="panchang-moonrise"',
  'id="panchang-moonset"',
  'id="panchang-tithi"',
  'id="panchang-nakshatra"',
  'id="panchang-yoga"',
  'id="panchang-paksha"',
  'id="upcoming-observance-title"',
  'id="upcoming-observance-name"',
  'id="upcoming-observance-note"'
]) {
  if (!indexHtml.includes(id)) fail(`Missing Panchang/Festival UI target: ${id}`);
}

if (workingData.status !== "initial_panchang_festival_ready_not_publicly_wired") fail("Generated working data status mismatch.");
if (workingData.public_ui_ready !== false) fail("Generated working data public_ui_ready must remain false.");
if (workingData.live_calculation_active !== false) fail("Live calculation must be false.");
if (workingData.external_api_fetch_active !== false) fail("External API fetch must be false.");
if (workingData.ai_generation_active !== false) fail("AI generation must be false.");
if (workingData.dynamic_observance_selection_active !== false) fail("Dynamic observance selection must be false.");
if (workingData.panchang.tithi !== "Withheld until verified") fail("Tithi must remain withheld.");
if (workingData.panchang.nakshatra !== "Withheld until verified") fail("Nakshatra must remain withheld.");
if (workingData.panchang.yoga !== "Withheld until verified") fail("Yoga must remain withheld.");
if (workingData.panchang.paksha !== "Withheld until verified") fail("Paksha must remain withheld.");
if (workingData.observance.public_ready !== false) fail("Observance public_ready must be false.");

for (const forbidden of [
  "06:13 AM",
  "06:54 PM",
  "02:19 AM",
  "11:49 AM",
  "Ashtami → Navami",
  "Purva Ashadha",
  "Shiva → Siddha",
  "Krishna Paksha"
]) {
  if (JSON.stringify(workingData).includes(forbidden)) fail(`Forbidden exact Panchang value found: ${forbidden}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag64b-panchang-festival-ui-wiring.json");
const apply = readJson("data/content-intelligence/phase-01-modules/ag64b-panchang-festival-ui-wiring-apply-record.json");
const contract = readJson("data/content-intelligence/phase-01-modules/ag64b-panchang-festival-ui-data-contract-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag64b-ag64z-panchang-festival-closure-readiness-record.json");
const preview = readJson("data/quality/ag64b-panchang-festival-ui-wiring-preview.json");

if (review.status !== "ag64b_panchang_festival_ui_wiring_completed") fail("Review status mismatch.");
if (review.summary.ui_wiring_applied !== true) fail("UI wiring summary missing.");
if (review.summary.generated_panchang_festival_source_connected !== true) fail("Generated source summary missing.");
if (review.summary.exact_values_withheld !== true) fail("Exact value withheld summary missing.");
if (review.summary.live_calculation_active !== false) fail("Live calculation summary must be false.");
if (review.summary.external_api_fetch_active !== false) fail("External API summary must be false.");
if (review.summary.ai_generation_active !== false) fail("AI generation summary must be false.");
if (review.summary.exact_panchang_values_published !== false) fail("Exact values must be false.");
if (review.summary.festival_date_decision_published !== false) fail("Festival date decision must be false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must be false.");
if (review.summary.ready_for_ag64z !== true) fail("AG64Z readiness missing.");

if (apply.behaviour.fetches_generated_panchang_festival_data !== true) fail("Apply fetch behaviour missing.");
if (apply.behaviour.exact_values_remain_withheld !== true) fail("Apply withheld behaviour missing.");
if (contract.exact_values_withheld !== true) fail("Contract exact withheld missing.");
if (readiness.ready_for_ag64z !== true) fail("AG64Z readiness must be true.");
if (preview.ready_for_ag64z !== 1) fail("Preview AG64Z readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag64b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag64b-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG64B Panchang & Festival UI Wiring is present.");
pass("Homepage Panchang/Festival card is wired to generated/panchang-festival-working-data.json.");
pass("Generated safe-preview data keeps exact Panchang values withheld.");
pass("No live calculation, external API, runtime AI, backend or V02 action is recorded.");
pass("AG64Z Panchang & Festival Closure readiness is valid.");
