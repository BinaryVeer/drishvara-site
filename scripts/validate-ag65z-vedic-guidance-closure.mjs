import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG65Z validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/vedic-guidance-working-data.json",
  "data/content-intelligence/quality-reviews/ag65a-vedic-guidance-foundation.json",
  "data/content-intelligence/quality-reviews/ag65b-vedic-guidance-ui-wiring.json",
  "scripts/generate-ag65z-vedic-guidance-closure.mjs",
  "scripts/validate-ag65z-vedic-guidance-closure.mjs",
  "data/content-intelligence/quality-reviews/ag65z-vedic-guidance-closure.json",
  "data/content-intelligence/closure-records/ag65z-vedic-guidance-working-data-and-ui-wiring-closure.json",
  "data/content-intelligence/phase-01-modules/ag65z-vedic-guidance-final-status-record.json",
  "data/content-intelligence/phase-01-modules/ag65z-vedic-guidance-live-verification-evidence-record.json",
  "data/content-intelligence/quality-registry/ag65z-ag66-star-reflection-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag65z-to-ag66-star-reflection-boundary.json",
  "data/content-intelligence/backend-architecture/ag65z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag65z-no-v02-expansion-audit.json",
  "data/quality/ag65z-vedic-guidance-closure.json",
  "data/quality/ag65z-vedic-guidance-closure-preview.json",
  "docs/quality/AG65Z_VEDIC_GUIDANCE_CLOSURE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag65z"]) fail("Missing generate:ag65z script.");
if (!pkg.scripts?.["validate:ag65z"]) fail("Missing validate:ag65z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag65z")) fail("validate:project must include validate:ag65z.");

const indexHtml = read("index.html");
for (const snippet of [
  "data-drishvara-ag65b-vedic-guidance-ui-wiring",
  "generated/vedic-guidance-working-data.json",
  "drishvaraAg65bLoadVedicGuidance"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing Vedic Guidance UI closure snippet: ${snippet}`);
}

const generated = readJson("generated/vedic-guidance-working-data.json");
const vg = generated.vedic_guidance || {};

if (generated.rule_execution_active !== false) fail("Rule execution must be false.");
if (generated.panchang_dependent_logic_active !== false) fail("Panchang-dependent logic must be false.");
if (generated.external_api_fetch_active !== false) fail("External API fetch must be false.");
if (generated.ai_generation_active !== false) fail("AI generation must be false.");
if (generated.mantra_publication_allowed !== false) fail("Mantra publication must be false.");
if (generated.personal_prediction_active !== false) fail("Personal prediction must be false.");
if (generated.deterministic_claim_active !== false) fail("Deterministic claim must be false.");

if (vg.weekday_hindi !== "विधि सत्यापनाधीन") fail("Weekday must remain verification-gated.");
if (vg.suggested_colour_hindi !== "स्रोत सत्यापन के बाद प्रकाशित") fail("Colour must remain verification-gated.");
if (vg.mantra_hindi !== "मंत्र प्रदर्शन स्रोत-सत्यापन के पश्चात") fail("Mantra must remain withheld.");

const review = readJson("data/content-intelligence/quality-reviews/ag65z-vedic-guidance-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag65z-vedic-guidance-working-data-and-ui-wiring-closure.json");
const finalStatus = readJson("data/content-intelligence/phase-01-modules/ag65z-vedic-guidance-final-status-record.json");
const liveEvidence = readJson("data/content-intelligence/phase-01-modules/ag65z-vedic-guidance-live-verification-evidence-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag65z-ag66-star-reflection-readiness-record.json");
const preview = readJson("data/quality/ag65z-vedic-guidance-closure-preview.json");

if (review.status !== "ag65z_vedic_guidance_closure_completed") fail("Review status mismatch.");
if (review.summary.ag65a_foundation_completed !== true) fail("AG65A closure summary missing.");
if (review.summary.ag65b_ui_wiring_completed !== true) fail("AG65B closure summary missing.");
if (review.summary.vedic_guidance_row_closed_at_working_data_level !== true) fail("Row closure summary missing.");
if (review.summary.generated_vedic_guidance_source_connected !== true) fail("Generated source summary missing.");
if (review.summary.safe_preview_values_connected !== true) fail("Safe preview summary missing.");
if (review.summary.rule_execution_active !== false) fail("Rule execution must be false.");
if (review.summary.panchang_dependent_logic_active !== false) fail("Panchang-dependent logic must be false.");
if (review.summary.mantra_publication_allowed !== false) fail("Mantra publication must be false.");
if (review.summary.personal_prediction_active !== false) fail("Personal prediction must be false.");
if (review.summary.deterministic_claim_active !== false) fail("Deterministic claim must be false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must be false.");
if (review.summary.ready_for_ag66 !== true) fail("AG66 readiness missing.");

if (closure.status !== "ag65z_vedic_guidance_working_data_and_ui_wiring_closed") fail("Closure status mismatch.");
if (finalStatus.vedic_guidance.ui_wired_to_generated_data !== true) fail("Final status UI wiring missing.");
if (liveEvidence.evidence_from_operator_terminal.live_generated_vedic_guidance_json_accessible !== true) fail("Live JSON evidence missing.");
if (liveEvidence.evidence_from_operator_terminal.mantra_hindi !== "मंत्र प्रदर्शन स्रोत-सत्यापन के पश्चात") fail("Live evidence mantra mismatch.");
if (readiness.ready_for_ag66 !== true) fail("AG66 readiness must be true.");
if (preview.ready_for_ag66 !== 1) fail("Preview AG66 readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag65z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag65z-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG65Z Today's Vedic Guidance Closure is present.");
pass("AG65A foundation and AG65B UI wiring are closed.");
pass("Generated Vedic Guidance safe working data is connected and live evidence is recorded.");
pass("No rule execution, mantra publication, prediction, runtime AI, backend or V02 action is recorded.");
pass("AG66 Star Reflection readiness is valid.");
