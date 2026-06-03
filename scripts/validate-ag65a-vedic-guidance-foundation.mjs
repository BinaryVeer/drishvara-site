import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG65A validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "data/content-intelligence/quality-reviews/ag64z-panchang-festival-closure.json",
  "scripts/generate-ag65a-vedic-guidance-foundation.mjs",
  "scripts/validate-ag65a-vedic-guidance-foundation.mjs",
  "data/content-intelligence/quality-reviews/ag65a-vedic-guidance-foundation.json",
  "data/content-intelligence/phase-01-modules/ag65a-vedic-guidance-source-consumption-record.json",
  "data/initial-working-data/vedic-guidance/ag65a-vedic-guidance-initial-working-data.json",
  "data/initial-working-data/vedic-guidance/ag65a-vedic-guidance-source-registry.json",
  "data/methodology/vedic-guidance/ag65a-vedic-guidance-rule-schema.json",
  "data/methodology/vedic-guidance/ag65a-vedic-guidance-methodology.json",
  "data/methodology/vedic-guidance/ag65a-mantra-integrity-and-publication-gate.json",
  "data/methodology/vedic-guidance/ag65a-vedic-guidance-ai-token-policy.json",
  "data/feedback/vedic-guidance/ag65a-vedic-guidance-user-feedback-schema.json",
  "data/feedback/vedic-guidance/ag65a-vedic-guidance-admin-review-absorption-schema.json",
  "generated/vedic-guidance-working-data.json",
  "data/content-intelligence/quality-registry/ag65a-ag65b-vedic-guidance-ui-wiring-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag65a-to-ag65b-vedic-guidance-ui-wiring-boundary.json",
  "data/content-intelligence/backend-architecture/ag65a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag65a-no-v02-expansion-audit.json",
  "data/quality/ag65a-vedic-guidance-foundation.json",
  "data/quality/ag65a-vedic-guidance-foundation-preview.json",
  "docs/quality/AG65A_VEDIC_GUIDANCE_FOUNDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag65a"]) fail("Missing generate:ag65a script.");
if (!pkg.scripts?.["validate:ag65a"]) fail("Missing validate:ag65a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag65a")) fail("validate:project must include validate:ag65a.");

const indexHtml = read("index.html");
for (const snippet of [
  "Today’s Vedic Guidance",
  "vedic-title-hi",
  "vedic-weekday-hi",
  "vedic-colour-hi",
  "vedic-food-hi",
  "vedic-mantra-hi",
  "vedic-note-en",
  "vedic-safety-note"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing Vedic UI target: ${snippet}`);
}

const initial = readJson("data/initial-working-data/vedic-guidance/ag65a-vedic-guidance-initial-working-data.json");
const registry = readJson("data/initial-working-data/vedic-guidance/ag65a-vedic-guidance-source-registry.json");
const ruleSchema = readJson("data/methodology/vedic-guidance/ag65a-vedic-guidance-rule-schema.json");
const methodology = readJson("data/methodology/vedic-guidance/ag65a-vedic-guidance-methodology.json");
const mantraGate = readJson("data/methodology/vedic-guidance/ag65a-mantra-integrity-and-publication-gate.json");
const aiPolicy = readJson("data/methodology/vedic-guidance/ag65a-vedic-guidance-ai-token-policy.json");
const feedback = readJson("data/feedback/vedic-guidance/ag65a-vedic-guidance-user-feedback-schema.json");
const admin = readJson("data/feedback/vedic-guidance/ag65a-vedic-guidance-admin-review-absorption-schema.json");
const generated = readJson("generated/vedic-guidance-working-data.json");
const review = readJson("data/content-intelligence/quality-reviews/ag65a-vedic-guidance-foundation.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag65a-ag65b-vedic-guidance-ui-wiring-readiness-record.json");
const preview = readJson("data/quality/ag65a-vedic-guidance-foundation-preview.json");

if (initial.status !== "initial_working_data_created_not_publicly_wired") fail("Initial working data status mismatch.");
if (initial.public_ui_activation_status !== "not_wired_in_ag65a") fail("Public UI must not be wired in AG65A.");

if (registry.live_source_fetching_enabled !== false) fail("Live source fetching must be false.");
if (registry.external_api_enabled !== false) fail("External API must be false.");
if (registry.panchang_dependency_active !== false) fail("Panchang dependency must be false.");

if (ruleSchema.rule_execution_active_now !== false) fail("Rule execution must be false.");
if (ruleSchema.panchang_dependent_logic_active_now !== false) fail("Panchang-dependent logic must be false.");

if (methodology.status !== "methodology_created_not_runtime_active") fail("Methodology status mismatch.");
if (!methodology.principles.some((rule) => rule.includes("not prediction"))) fail("Non-prediction rule missing.");
if (!methodology.principles.some((rule) => rule.includes("Do not publish mantra"))) fail("Mantra publication guardrail missing.");

if (mantraGate.mantra_publication_allowed_now !== false) fail("Mantra publication must be false.");
if (aiPolicy.ai_runtime_active !== false) fail("AI runtime must be false.");
if (aiPolicy.user_triggered_ai_allowed !== false) fail("User-triggered AI must be false.");
if (feedback.user_feedback_allowed_now !== false) fail("User feedback must not be active.");
if (admin.automatic_absorption_allowed !== false) fail("Automatic absorption must be false.");

if (generated.status !== "initial_vedic_guidance_ready_not_publicly_wired") fail("Generated data status mismatch.");
if (generated.public_ui_ready !== false) fail("Generated data public_ui_ready must be false.");
if (generated.rule_execution_active !== false) fail("Rule execution must be false.");
if (generated.panchang_dependent_logic_active !== false) fail("Panchang-dependent logic must be false.");
if (generated.external_api_fetch_active !== false) fail("External API fetch must be false.");
if (generated.ai_generation_active !== false) fail("AI generation must be false.");
if (generated.mantra_publication_allowed !== false) fail("Mantra publication must be false.");
if (generated.personal_prediction_active !== false) fail("Personal prediction must be false.");
if (generated.deterministic_claim_active !== false) fail("Deterministic claim must be false.");

const vedic = generated.vedic_guidance || {};
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
  if (JSON.stringify(generated).includes(forbidden)) fail(`Forbidden unverified Vedic value found: ${forbidden}`);
}

if (review.status !== "ag65a_vedic_guidance_foundation_completed") fail("Review status mismatch.");
if (review.summary.initial_working_data_created !== true) fail("Initial working summary missing.");
if (review.summary.source_registry_created !== true) fail("Source registry summary missing.");
if (review.summary.rule_schema_created !== true) fail("Rule schema summary missing.");
if (review.summary.methodology_created !== true) fail("Methodology summary missing.");
if (review.summary.mantra_integrity_gate_created !== true) fail("Mantra gate summary missing.");
if (review.summary.generated_vedic_guidance_data_created !== true) fail("Generated data summary missing.");
if (review.summary.ui_wired_now !== false) fail("UI wiring must be false in AG65A.");
if (review.summary.rule_execution_active !== false) fail("Rule execution must be false.");
if (review.summary.panchang_dependent_logic_active !== false) fail("Panchang-dependent logic must be false.");
if (review.summary.mantra_publication_allowed !== false) fail("Mantra publication must be false.");
if (review.summary.personal_prediction_active !== false) fail("Personal prediction must be false.");
if (review.summary.deterministic_claim_active !== false) fail("Deterministic claim must be false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must be false.");
if (review.summary.ready_for_ag65b !== true) fail("AG65B readiness missing.");

if (readiness.ready_for_ag65b !== true) fail("AG65B readiness must be true.");
if (preview.ready_for_ag65b !== 1) fail("Preview AG65B readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag65a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag65a-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG65A Today's Vedic Guidance Foundation is present.");
pass("Vedic Guidance UI targets are confirmed.");
pass("Initial working data, source registry, rule schema, methodology and mantra gate are present.");
pass("generated/vedic-guidance-working-data.json is created with safe withheld values.");
pass("No rule execution, mantra publication, prediction, runtime AI, backend or V02 action is recorded.");
pass("AG65B Today's Vedic Guidance UI Wiring readiness is valid.");
