import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG64Z validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/panchang-festival-working-data.json",
  "data/content-intelligence/quality-reviews/ag64a-panchang-festival-foundation.json",
  "data/content-intelligence/quality-reviews/ag64b-panchang-festival-ui-wiring.json",
  "scripts/generate-ag64z-panchang-festival-closure.mjs",
  "scripts/validate-ag64z-panchang-festival-closure.mjs",
  "data/content-intelligence/quality-reviews/ag64z-panchang-festival-closure.json",
  "data/content-intelligence/closure-records/ag64z-panchang-festival-working-data-and-ui-wiring-closure.json",
  "data/content-intelligence/phase-01-modules/ag64z-panchang-festival-final-status-record.json",
  "data/content-intelligence/phase-01-modules/ag64z-panchang-festival-live-verification-evidence-record.json",
  "data/content-intelligence/quality-registry/ag64z-ag65-vedic-guidance-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag64z-to-ag65-vedic-guidance-boundary.json",
  "data/content-intelligence/backend-architecture/ag64z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag64z-no-v02-expansion-audit.json",
  "data/quality/ag64z-panchang-festival-closure.json",
  "data/quality/ag64z-panchang-festival-closure-preview.json",
  "docs/quality/AG64Z_PANCHANG_FESTIVAL_CLOSURE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag64z"]) fail("Missing generate:ag64z script.");
if (!pkg.scripts?.["validate:ag64z"]) fail("Missing validate:ag64z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag64z")) fail("validate:project must include validate:ag64z.");

const indexHtml = read("index.html");
for (const snippet of [
  "data-drishvara-ag64b-panchang-festival-ui-wiring",
  "generated/panchang-festival-working-data.json",
  "drishvaraAg64bLoadPanchangFestival"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing Panchang/Festival UI closure snippet: ${snippet}`);
}

const generated = readJson("generated/panchang-festival-working-data.json");
const pan = generated.panchang || {};
const obs = generated.observance || {};

if (generated.live_calculation_active !== false) fail("Live calculation must be false.");
if (generated.external_api_fetch_active !== false) fail("External API fetch must be false.");
if (generated.ai_generation_active !== false) fail("AI generation must be false.");
if (generated.dynamic_observance_selection_active !== false) fail("Dynamic observance selection must be false.");
if (pan.tithi !== "Withheld until verified") fail("Tithi must remain withheld.");
if (pan.nakshatra !== "Withheld until verified") fail("Nakshatra must remain withheld.");
if (pan.yoga !== "Withheld until verified") fail("Yoga must remain withheld.");
if (pan.paksha !== "Withheld until verified") fail("Paksha must remain withheld.");
if (obs.public_ready !== false) fail("Observance public_ready must be false.");

const review = readJson("data/content-intelligence/quality-reviews/ag64z-panchang-festival-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag64z-panchang-festival-working-data-and-ui-wiring-closure.json");
const finalStatus = readJson("data/content-intelligence/phase-01-modules/ag64z-panchang-festival-final-status-record.json");
const liveEvidence = readJson("data/content-intelligence/phase-01-modules/ag64z-panchang-festival-live-verification-evidence-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag64z-ag65-vedic-guidance-readiness-record.json");
const preview = readJson("data/quality/ag64z-panchang-festival-closure-preview.json");

if (review.status !== "ag64z_panchang_festival_closure_completed") fail("Review status mismatch.");
if (review.summary.ag64a_foundation_completed !== true) fail("AG64A closure summary missing.");
if (review.summary.ag64b_ui_wiring_completed !== true) fail("AG64B closure summary missing.");
if (review.summary.panchang_festival_row_closed_at_working_data_level !== true) fail("Row closure summary missing.");
if (review.summary.generated_panchang_festival_source_connected !== true) fail("Generated source summary missing.");
if (review.summary.exact_values_withheld !== true) fail("Exact withheld summary missing.");
if (review.summary.live_calculation_active !== false) fail("Live calculation must be false.");
if (review.summary.external_api_fetch_active !== false) fail("External API must be false.");
if (review.summary.ai_generation_active !== false) fail("AI generation must be false.");
if (review.summary.exact_panchang_values_published !== false) fail("Exact values must be false.");
if (review.summary.festival_date_decision_published !== false) fail("Festival date decision must be false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must be false.");
if (review.summary.ready_for_ag65 !== true) fail("AG65 readiness missing.");

if (closure.status !== "ag64z_panchang_festival_working_data_and_ui_wiring_closed") fail("Closure status mismatch.");
if (finalStatus.panchang_festival.ui_wired_to_generated_data !== true) fail("Final status UI wiring missing.");
if (liveEvidence.evidence_from_operator_terminal.live_generated_panchang_festival_json_accessible !== true) fail("Live JSON evidence missing.");
if (liveEvidence.evidence_from_operator_terminal.tithi !== "Withheld until verified") fail("Live evidence tithi mismatch.");
if (readiness.ready_for_ag65 !== true) fail("AG65 readiness must be true.");
if (preview.ready_for_ag65 !== 1) fail("Preview AG65 readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag64z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag64z-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG64Z Panchang & Festival Closure is present.");
pass("AG64A foundation and AG64B UI wiring are closed.");
pass("Generated Panchang/Festival safe working data is connected and live evidence is recorded.");
pass("No live calculation, exact Panchang values, festival date decision, external API, runtime AI, backend or V02 action is recorded.");
pass("AG65 Today's Vedic Guidance readiness is valid.");
