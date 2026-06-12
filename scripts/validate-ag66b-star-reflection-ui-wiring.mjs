import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG66B validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/star-reflection-working-data.json",
  "data/content-intelligence/quality-reviews/ag66a-star-reflection-foundation.json",
  "scripts/generate-ag66b-star-reflection-ui-wiring.mjs",
  "scripts/validate-ag66b-star-reflection-ui-wiring.mjs",
  "data/content-intelligence/quality-reviews/ag66b-star-reflection-ui-wiring.json",
  "data/content-intelligence/phase-01-modules/ag66b-star-reflection-ui-wiring-apply-record.json",
  "data/content-intelligence/phase-01-modules/ag66b-star-reflection-ui-data-contract-record.json",
  "data/content-intelligence/quality-registry/ag66b-ag66z-star-reflection-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag66b-to-ag66z-star-reflection-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ag66b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag66b-no-v02-expansion-audit.json",
  "data/quality/ag66b-star-reflection-ui-wiring.json",
  "data/quality/ag66b-star-reflection-ui-wiring-preview.json",
  "docs/quality/AG66B_STAR_REFLECTION_UI_WIRING.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag66b"]) fail("Missing generate:ag66b script.");
if (!pkg.scripts?.["validate:ag66b"]) fail("Missing validate:ag66b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag66b")) fail("validate:project must include validate:ag66b.");

const indexHtml = read("index.html");
const workingData = readJson("generated/star-reflection-working-data.json");

for (const snippet of [
  "data-drishvara-ag66b-star-reflection-ui-wiring",
  "generated/star-reflection-working-data.json",
  "drishvaraAg66bLoadStarReflection",
  "data-drishvara-ag66b-star-reflection-wired",
  "data-drishvara-ag66b-input-disabled"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing AG66B UI wiring snippet: ${snippet}`);
}

for (const snippet of [
  "Star Reflection",
  "What the stars say about you",
  "Reflective prompt only; not a personal prediction, assessment, or decision guide.",
  "data-ag73e-star-active-status",
  "Reflection Method Under Review"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing AG66/AG73E-compatible Star Reflection UI target: ${snippet}`);
}

if (workingData.status !== "initial_star_reflection_ready_not_publicly_wired") fail("Generated working data status mismatch.");
if (workingData.public_ui_ready !== false) fail("Generated working data public_ui_ready must remain false.");
if (workingData.personal_input_collection_enabled !== false) fail("Personal input collection must be false.");
if (workingData.name_collection_enabled !== false) fail("Name collection must be false.");
if (workingData.date_of_birth_collection_enabled !== false) fail("DOB collection must be false.");
if (workingData.birth_time_collection_enabled !== false) fail("Birth time collection must be false.");
if (workingData.birth_location_collection_enabled !== false) fail("Birth location collection must be false.");
if (workingData.consent_collection_enabled !== false) fail("Consent collection must be false.");
if (workingData.birth_detail_processing_enabled !== false) fail("Birth detail processing must be false.");
if (workingData.astrology_calculation_active !== false) fail("Astrology calculation must be false.");
if (workingData.reflection_generation_active !== false) fail("Reflection generation must be false.");
if (workingData.horoscope_prediction_active !== false) fail("Horoscope prediction must be false.");
if (workingData.assessment_scoring_active !== false) fail("Assessment scoring must be false.");
if (workingData.deterministic_claim_active !== false) fail("Deterministic claim must be false.");
if (workingData.decision_guidance_active !== false) fail("Decision guidance must be false.");
if (workingData.external_api_fetch_active !== false) fail("External API fetch must be false.");
if (workingData.ai_generation_active !== false) fail("AI generation must be false.");

const star = workingData.star_reflection || {};
if (star.safety_note !== "Reflective prompt only; not a personal prediction, assessment, or decision guide.") fail("Safety note mismatch.");
if (!["Personal input is disabled until consent, privacy and reflection-method governance are complete.", "Personal input is active for this static reflective result. Inputs are used only in this browser session and are not stored."].includes(star.body)) fail("Star Reflection body mismatch after AG73E compatibility.");
if (star.button_label !== "Reflection Method Under Review") fail("Button label mismatch.");

const review = readJson("data/content-intelligence/quality-reviews/ag66b-star-reflection-ui-wiring.json");
const apply = readJson("data/content-intelligence/phase-01-modules/ag66b-star-reflection-ui-wiring-apply-record.json");
const contract = readJson("data/content-intelligence/phase-01-modules/ag66b-star-reflection-ui-data-contract-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag66b-ag66z-star-reflection-closure-readiness-record.json");
const preview = readJson("data/quality/ag66b-star-reflection-ui-wiring-preview.json");

if (review.status !== "ag66b_star_reflection_ui_wiring_completed") fail("Review status mismatch.");
if (review.summary.ui_wiring_applied !== true) fail("UI wiring summary missing.");
if (review.summary.generated_star_reflection_source_connected !== true) fail("Generated source summary missing.");
if (review.summary.safe_preview_values_connected !== true) fail("Safe preview summary missing.");
if (review.summary.disabled_inputs_preserved !== true) fail("Disabled input summary missing.");
if (review.summary.personal_input_collection_enabled !== false) fail("Personal input collection must be false.");
if (review.summary.consent_collection_enabled !== false) fail("Consent collection must be false.");
if (review.summary.birth_detail_processing_enabled !== false) fail("Birth detail processing must be false.");
if (review.summary.astrology_calculation_active !== false) fail("Astrology calculation must be false.");
if (review.summary.horoscope_prediction_active !== false) fail("Horoscope prediction must be false.");
if (review.summary.assessment_scoring_active !== false) fail("Assessment scoring must be false.");
if (review.summary.deterministic_claim_active !== false) fail("Deterministic claim must be false.");
if (review.summary.decision_guidance_active !== false) fail("Decision guidance must be false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must be false.");
if (review.summary.ready_for_ag66z !== true) fail("AG66Z readiness missing.");

if (apply.behaviour.fetches_generated_star_reflection_data !== true) fail("Apply fetch behaviour missing.");
if (apply.behaviour.preserves_disabled_inputs !== true) fail("Apply disabled input behaviour missing.");
if (contract.current_safe_preview.button_label !== star.button_label) fail("Contract button mismatch.");
if (readiness.ready_for_ag66z !== true) fail("AG66Z readiness must be true.");
if (preview.ready_for_ag66z !== 1) fail("Preview AG66Z readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag66b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag66b-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG66B Star Reflection UI Wiring is present.");
pass("Homepage Star Reflection card is wired to generated/star-reflection-working-data.json.");
pass("Generated safe-preview data keeps all personal inputs disabled.");
pass("No prediction, assessment, personal input, runtime AI, backend or V02 action is recorded.");
pass("AG66Z Star Reflection Closure readiness is valid.");
