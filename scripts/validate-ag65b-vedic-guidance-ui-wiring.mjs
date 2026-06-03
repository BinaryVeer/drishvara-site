import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG65B validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/vedic-guidance-working-data.json",
  "data/content-intelligence/quality-reviews/ag65a-vedic-guidance-foundation.json",
  "scripts/generate-ag65b-vedic-guidance-ui-wiring.mjs",
  "scripts/validate-ag65b-vedic-guidance-ui-wiring.mjs",
  "data/content-intelligence/quality-reviews/ag65b-vedic-guidance-ui-wiring.json",
  "data/content-intelligence/phase-01-modules/ag65b-vedic-guidance-ui-wiring-apply-record.json",
  "data/content-intelligence/phase-01-modules/ag65b-vedic-guidance-ui-data-contract-record.json",
  "data/content-intelligence/quality-registry/ag65b-ag65z-vedic-guidance-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag65b-to-ag65z-vedic-guidance-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ag65b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag65b-no-v02-expansion-audit.json",
  "data/quality/ag65b-vedic-guidance-ui-wiring.json",
  "data/quality/ag65b-vedic-guidance-ui-wiring-preview.json",
  "docs/quality/AG65B_VEDIC_GUIDANCE_UI_WIRING.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag65b"]) fail("Missing generate:ag65b script.");
if (!pkg.scripts?.["validate:ag65b"]) fail("Missing validate:ag65b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag65b")) fail("validate:project must include validate:ag65b.");

const indexHtml = read("index.html");
const workingData = readJson("generated/vedic-guidance-working-data.json");

for (const snippet of [
  "data-drishvara-ag65b-vedic-guidance-ui-wiring",
  "generated/vedic-guidance-working-data.json",
  "drishvaraAg65bLoadVedicGuidance",
  "data-drishvara-ag65b-vedic-methodology-note",
  "data-drishvara-ag65b-vedic-guidance-wired"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing AG65B UI wiring snippet: ${snippet}`);
}

for (const id of [
  'id="vedic-title-hi"',
  'id="vedic-weekday-hi"',
  'id="vedic-colour-hi"',
  'id="vedic-food-hi"',
  'id="vedic-mantra-hi"',
  'id="vedic-note-en"'
]) {
  if (!indexHtml.includes(id)) fail(`Missing Vedic Guidance UI target: ${id}`);
}

if (workingData.status !== "initial_vedic_guidance_ready_not_publicly_wired") fail("Generated working data status mismatch.");
if (workingData.public_ui_ready !== false) fail("Generated working data public_ui_ready must remain false.");
if (workingData.rule_execution_active !== false) fail("Rule execution must be false.");
if (workingData.panchang_dependent_logic_active !== false) fail("Panchang-dependent logic must be false.");
if (workingData.external_api_fetch_active !== false) fail("External API fetch must be false.");
if (workingData.ai_generation_active !== false) fail("AI generation must be false.");
if (workingData.mantra_publication_allowed !== false) fail("Mantra publication must be false.");
if (workingData.personal_prediction_active !== false) fail("Personal prediction must be false.");
if (workingData.deterministic_claim_active !== false) fail("Deterministic claim must be false.");

const vedic = workingData.vedic_guidance || {};
if (vedic.weekday_hindi !== "विधि सत्यापनाधीन") fail("Weekday must remain verification-gated.");
if (vedic.suggested_colour_hindi !== "स्रोत सत्यापन के बाद प्रकाशित") fail("Colour must remain verification-gated.");
if (vedic.food_hindi !== "सामान्य चिंतन संकेत") fail("Food must remain general reflective signal.");
if (vedic.mantra_hindi !== "मंत्र प्रदर्शन स्रोत-सत्यापन के पश्चात") fail("Mantra must remain withheld.");

for (const forbidden of [
  "ॐ शनैश्चराय नमः",
  "नीला / श्याम",
  "सरल, स्थिर और मिताहार",
  "A day for patience, steadiness, and responsible movement."
]) {
  if (JSON.stringify(workingData).includes(forbidden)) fail(`Forbidden unverified Vedic value found: ${forbidden}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag65b-vedic-guidance-ui-wiring.json");
const apply = readJson("data/content-intelligence/phase-01-modules/ag65b-vedic-guidance-ui-wiring-apply-record.json");
const contract = readJson("data/content-intelligence/phase-01-modules/ag65b-vedic-guidance-ui-data-contract-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag65b-ag65z-vedic-guidance-closure-readiness-record.json");
const preview = readJson("data/quality/ag65b-vedic-guidance-ui-wiring-preview.json");

if (review.status !== "ag65b_vedic_guidance_ui_wiring_completed") fail("Review status mismatch.");
if (review.summary.ui_wiring_applied !== true) fail("UI wiring summary missing.");
if (review.summary.generated_vedic_guidance_source_connected !== true) fail("Generated source summary missing.");
if (review.summary.safe_preview_values_connected !== true) fail("Safe preview summary missing.");
if (review.summary.rule_execution_active !== false) fail("Rule execution summary must be false.");
if (review.summary.panchang_dependent_logic_active !== false) fail("Panchang-dependent logic must be false.");
if (review.summary.mantra_publication_allowed !== false) fail("Mantra publication must be false.");
if (review.summary.personal_prediction_active !== false) fail("Personal prediction must be false.");
if (review.summary.deterministic_claim_active !== false) fail("Deterministic claim must be false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must be false.");
if (review.summary.ready_for_ag65z !== true) fail("AG65Z readiness missing.");

if (apply.behaviour.fetches_generated_vedic_guidance_data !== true) fail("Apply fetch behaviour missing.");
if (apply.behaviour.mantra_publication_allowed !== false) fail("Apply mantra publication must be false.");
if (contract.current_safe_preview.mantra_hindi !== vedic.mantra_hindi) fail("Contract mantra mismatch.");
if (readiness.ready_for_ag65z !== true) fail("AG65Z readiness must be true.");
if (preview.ready_for_ag65z !== 1) fail("Preview AG65Z readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag65b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag65b-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG65B Today's Vedic Guidance UI Wiring is present.");
pass("Homepage Vedic Guidance card is wired to generated/vedic-guidance-working-data.json.");
pass("Generated safe-preview data keeps weekday/colour/food/mantra source-verification-gated.");
pass("No rule execution, mantra publication, prediction, runtime AI, backend or V02 action is recorded.");
pass("AG65Z Today's Vedic Guidance Closure readiness is valid.");
