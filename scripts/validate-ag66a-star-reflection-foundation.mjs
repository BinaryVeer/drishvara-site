import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG66A validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "data/content-intelligence/quality-reviews/ag65z-vedic-guidance-closure.json",
  "scripts/generate-ag66a-star-reflection-foundation.mjs",
  "scripts/validate-ag66a-star-reflection-foundation.mjs",
  "data/content-intelligence/quality-reviews/ag66a-star-reflection-foundation.json",
  "data/content-intelligence/phase-01-modules/ag66a-star-reflection-source-consumption-record.json",
  "data/initial-working-data/star-reflection/ag66a-star-reflection-initial-working-data.json",
  "data/initial-working-data/star-reflection/ag66a-star-reflection-source-registry.json",
  "data/methodology/star-reflection/ag66a-star-reflection-consent-privacy-schema.json",
  "data/methodology/star-reflection/ag66a-star-reflection-methodology.json",
  "data/methodology/star-reflection/ag66a-star-reflection-input-disablement-gate.json",
  "data/methodology/star-reflection/ag66a-star-reflection-ai-token-policy.json",
  "data/feedback/star-reflection/ag66a-star-reflection-user-feedback-schema.json",
  "data/feedback/star-reflection/ag66a-star-reflection-admin-review-absorption-schema.json",
  "generated/star-reflection-working-data.json",
  "data/content-intelligence/quality-registry/ag66a-ag66b-star-reflection-ui-wiring-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag66a-to-ag66b-star-reflection-ui-wiring-boundary.json",
  "data/content-intelligence/backend-architecture/ag66a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag66a-no-v02-expansion-audit.json",
  "data/quality/ag66a-star-reflection-foundation.json",
  "data/quality/ag66a-star-reflection-foundation-preview.json",
  "docs/quality/AG66A_STAR_REFLECTION_FOUNDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag66a"]) fail("Missing generate:ag66a script.");
if (!pkg.scripts?.["validate:ag66a"]) fail("Missing validate:ag66a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag66a")) fail("validate:project must include validate:ag66a.");

const indexHtml = read("index.html");
for (const snippet of [
  "Star Reflection",
  "What the stars say about you",
  "Reflective prompt only; not a personal prediction, assessment, or decision guide.",
  "Personal input is disabled until consent, privacy and reflection-method governance are complete.",
  "data-drishvara-ag60i-star-input-disabled",
  "Reflection Method Under Review"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing Star Reflection UI target: ${snippet}`);
}

const initial = readJson("data/initial-working-data/star-reflection/ag66a-star-reflection-initial-working-data.json");
const registry = readJson("data/initial-working-data/star-reflection/ag66a-star-reflection-source-registry.json");
const consentPrivacy = readJson("data/methodology/star-reflection/ag66a-star-reflection-consent-privacy-schema.json");
const methodology = readJson("data/methodology/star-reflection/ag66a-star-reflection-methodology.json");
const inputGate = readJson("data/methodology/star-reflection/ag66a-star-reflection-input-disablement-gate.json");
const aiPolicy = readJson("data/methodology/star-reflection/ag66a-star-reflection-ai-token-policy.json");
const feedback = readJson("data/feedback/star-reflection/ag66a-star-reflection-user-feedback-schema.json");
const admin = readJson("data/feedback/star-reflection/ag66a-star-reflection-admin-review-absorption-schema.json");
const generated = readJson("generated/star-reflection-working-data.json");
const review = readJson("data/content-intelligence/quality-reviews/ag66a-star-reflection-foundation.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag66a-ag66b-star-reflection-ui-wiring-readiness-record.json");
const preview = readJson("data/quality/ag66a-star-reflection-foundation-preview.json");

if (initial.status !== "initial_working_data_created_not_publicly_wired") fail("Initial working data status mismatch.");
if (initial.public_ui_activation_status !== "not_wired_in_ag66a") fail("Public UI must not be wired in AG66A.");

if (registry.live_source_fetching_enabled !== false) fail("Live source fetching must be false.");
if (registry.external_api_enabled !== false) fail("External API must be false.");
if (registry.astrology_calculation_library_enabled !== false) fail("Astrology calculation library must be false.");

if (consentPrivacy.consent_collection_enabled_now !== false) fail("Consent collection must be false.");
if (consentPrivacy.personal_input_collection_enabled_now !== false) fail("Personal input collection must be false.");
if (consentPrivacy.birth_detail_processing_enabled_now !== false) fail("Birth detail processing must be false.");

if (methodology.status !== "methodology_created_not_runtime_active") fail("Methodology status mismatch.");
if (!methodology.principles.some((rule) => rule.includes("not prediction"))) fail("Non-prediction rule missing.");
if (!methodology.principles.some((rule) => rule.includes("Do not process name"))) fail("Personal input processing guardrail missing.");

if (inputGate.public_inputs_enabled_now !== false) fail("Public inputs must be disabled.");
if (aiPolicy.ai_runtime_active !== false) fail("AI runtime must be false.");
if (aiPolicy.user_triggered_ai_allowed !== false) fail("User-triggered AI must be false.");
if (feedback.user_feedback_allowed_now !== false) fail("User feedback must not be active.");
if (admin.automatic_absorption_allowed !== false) fail("Automatic absorption must be false.");

if (generated.status !== "initial_star_reflection_ready_not_publicly_wired") fail("Generated data status mismatch.");
if (generated.public_ui_ready !== false) fail("Generated data public_ui_ready must be false.");
if (generated.personal_input_collection_enabled !== false) fail("Personal input collection must be false.");
if (generated.name_collection_enabled !== false) fail("Name collection must be false.");
if (generated.date_of_birth_collection_enabled !== false) fail("DOB collection must be false.");
if (generated.birth_time_collection_enabled !== false) fail("Birth time collection must be false.");
if (generated.birth_location_collection_enabled !== false) fail("Birth location collection must be false.");
if (generated.consent_collection_enabled !== false) fail("Consent collection must be false.");
if (generated.birth_detail_processing_enabled !== false) fail("Birth detail processing must be false.");
if (generated.astrology_calculation_active !== false) fail("Astrology calculation must be false.");
if (generated.reflection_generation_active !== false) fail("Reflection generation must be false.");
if (generated.horoscope_prediction_active !== false) fail("Horoscope prediction must be false.");
if (generated.assessment_scoring_active !== false) fail("Assessment scoring must be false.");
if (generated.deterministic_claim_active !== false) fail("Deterministic claim must be false.");
if (generated.decision_guidance_active !== false) fail("Decision guidance must be false.");
if (generated.external_api_fetch_active !== false) fail("External API fetch must be false.");
if (generated.ai_generation_active !== false) fail("AI generation must be false.");

const star = generated.star_reflection || {};
if (star.safety_note !== "Reflective prompt only; not a personal prediction, assessment, or decision guide.") fail("Safety note mismatch.");
if (star.body !== "Personal input is disabled until consent, privacy and reflection-method governance are complete.") fail("Disabled input body mismatch.");
if (star.button_label !== "Reflection Method Under Review") fail("Button label mismatch.");

for (const forbidden of [
  "You will",
  "prediction",
  "lucky",
  "career result",
  "marriage result",
  "health outcome"
]) {
  if (forbidden !== "prediction" && JSON.stringify(star).toLowerCase().includes(forbidden.toLowerCase())) {
    fail(`Forbidden deterministic phrase found: ${forbidden}`);
  }
}

if (review.status !== "ag66a_star_reflection_foundation_completed") fail("Review status mismatch.");
if (review.summary.initial_working_data_created !== true) fail("Initial working summary missing.");
if (review.summary.source_registry_created !== true) fail("Source registry summary missing.");
if (review.summary.consent_privacy_schema_created !== true) fail("Consent/privacy schema summary missing.");
if (review.summary.reflection_methodology_created !== true) fail("Methodology summary missing.");
if (review.summary.input_disablement_gate_created !== true) fail("Input gate summary missing.");
if (review.summary.generated_star_reflection_data_created !== true) fail("Generated data summary missing.");
if (review.summary.ui_wired_now !== false) fail("UI wiring must be false in AG66A.");
if (review.summary.personal_input_collection_enabled !== false) fail("Personal input collection must be false.");
if (review.summary.consent_collection_enabled !== false) fail("Consent collection must be false.");
if (review.summary.birth_detail_processing_enabled !== false) fail("Birth detail processing must be false.");
if (review.summary.astrology_calculation_active !== false) fail("Astrology calculation must be false.");
if (review.summary.horoscope_prediction_active !== false) fail("Horoscope prediction must be false.");
if (review.summary.assessment_scoring_active !== false) fail("Assessment scoring must be false.");
if (review.summary.deterministic_claim_active !== false) fail("Deterministic claim must be false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must be false.");
if (review.summary.ready_for_ag66b !== true) fail("AG66B readiness missing.");

if (readiness.ready_for_ag66b !== true) fail("AG66B readiness must be true.");
if (preview.ready_for_ag66b !== 1) fail("Preview AG66B readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag66a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag66a-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG66A Star Reflection Foundation is present.");
pass("Star Reflection UI targets are confirmed.");
pass("Initial working data, consent/privacy schema, reflection methodology and input gate are present.");
pass("generated/star-reflection-working-data.json is created with personal input disabled.");
pass("No personal input, prediction, assessment, runtime AI, backend or V02 action is recorded.");
pass("AG66B Star Reflection UI Wiring readiness is valid.");
