import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG66Z validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/star-reflection-working-data.json",
  "data/content-intelligence/quality-reviews/ag66a-star-reflection-foundation.json",
  "data/content-intelligence/quality-reviews/ag66b-star-reflection-ui-wiring.json",
  "scripts/generate-ag66z-star-reflection-closure.mjs",
  "scripts/validate-ag66z-star-reflection-closure.mjs",
  "data/content-intelligence/quality-reviews/ag66z-star-reflection-closure.json",
  "data/content-intelligence/closure-records/ag66z-star-reflection-working-data-and-ui-wiring-closure.json",
  "data/content-intelligence/phase-01-modules/ag66z-star-reflection-final-status-record.json",
  "data/content-intelligence/phase-01-modules/ag66z-star-reflection-live-verification-evidence-record.json",
  "data/content-intelligence/quality-registry/ag66z-ag67-psychometric-assessment-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag66z-to-ag67-psychometric-assessment-boundary.json",
  "data/content-intelligence/backend-architecture/ag66z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag66z-no-v02-expansion-audit.json",
  "data/quality/ag66z-star-reflection-closure.json",
  "data/quality/ag66z-star-reflection-closure-preview.json",
  "docs/quality/AG66Z_STAR_REFLECTION_CLOSURE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag66z"]) fail("Missing generate:ag66z script.");
if (!pkg.scripts?.["validate:ag66z"]) fail("Missing validate:ag66z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag66z")) fail("validate:project must include validate:ag66z.");

const indexHtml = read("index.html");
for (const snippet of [
  "data-drishvara-ag66b-star-reflection-ui-wiring",
  "generated/star-reflection-working-data.json",
  "drishvaraAg66bLoadStarReflection",
  "data-drishvara-ag66b-star-reflection-wired",
  "data-drishvara-ag66b-input-disabled"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing Star Reflection UI closure snippet: ${snippet}`);
}

const generated = readJson("generated/star-reflection-working-data.json");
const star = generated.star_reflection || {};

for (const [key, value] of Object.entries({
  public_ui_ready: generated.public_ui_ready,
  personal_input_collection_enabled: generated.personal_input_collection_enabled,
  name_collection_enabled: generated.name_collection_enabled,
  date_of_birth_collection_enabled: generated.date_of_birth_collection_enabled,
  birth_time_collection_enabled: generated.birth_time_collection_enabled,
  birth_location_collection_enabled: generated.birth_location_collection_enabled,
  consent_collection_enabled: generated.consent_collection_enabled,
  birth_detail_processing_enabled: generated.birth_detail_processing_enabled,
  astrology_calculation_active: generated.astrology_calculation_active,
  reflection_generation_active: generated.reflection_generation_active,
  horoscope_prediction_active: generated.horoscope_prediction_active,
  assessment_scoring_active: generated.assessment_scoring_active,
  deterministic_claim_active: generated.deterministic_claim_active,
  decision_guidance_active: generated.decision_guidance_active,
  external_api_fetch_active: generated.external_api_fetch_active,
  ai_generation_active: generated.ai_generation_active
})) {
  if (value !== false) fail(`${key} must be false.`);
}

if (star.safety_note !== "Reflective prompt only; not a personal prediction, assessment, or decision guide.") fail("Safety note mismatch.");
if (star.body !== "Personal input is disabled until consent, privacy and reflection-method governance are complete.") fail("Body mismatch.");
if (star.button_label !== "Reflection Method Under Review") fail("Button label mismatch.");

const review = readJson("data/content-intelligence/quality-reviews/ag66z-star-reflection-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag66z-star-reflection-working-data-and-ui-wiring-closure.json");
const finalStatus = readJson("data/content-intelligence/phase-01-modules/ag66z-star-reflection-final-status-record.json");
const liveEvidence = readJson("data/content-intelligence/phase-01-modules/ag66z-star-reflection-live-verification-evidence-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag66z-ag67-psychometric-assessment-readiness-record.json");
const preview = readJson("data/quality/ag66z-star-reflection-closure-preview.json");

if (review.status !== "ag66z_star_reflection_closure_completed") fail("Review status mismatch.");
if (review.summary.ag66a_foundation_completed !== true) fail("AG66A closure summary missing.");
if (review.summary.ag66b_ui_wiring_completed !== true) fail("AG66B closure summary missing.");
if (review.summary.star_reflection_row_closed_at_working_data_level !== true) fail("Row closure summary missing.");
if (review.summary.generated_star_reflection_source_connected !== true) fail("Generated source summary missing.");
if (review.summary.safe_preview_values_connected !== true) fail("Safe preview summary missing.");
if (review.summary.disabled_inputs_preserved !== true) fail("Disabled input summary missing.");

for (const key of [
  "personal_input_collection_enabled",
  "consent_collection_enabled",
  "birth_detail_processing_enabled",
  "astrology_calculation_active",
  "horoscope_prediction_active",
  "assessment_scoring_active",
  "deterministic_claim_active",
  "decision_guidance_active",
  "ai_generation_active",
  "backend_runtime_activated",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false in review summary.`);
}

if (review.summary.ready_for_ag67 !== true) fail("AG67 readiness missing.");
if (closure.status !== "ag66z_star_reflection_working_data_and_ui_wiring_closed") fail("Closure status mismatch.");
if (finalStatus.star_reflection.ui_wired_to_generated_data !== true) fail("Final status UI wiring missing.");
if (liveEvidence.evidence_from_operator_terminal.live_generated_star_reflection_json_accessible !== true) fail("Live JSON evidence missing.");
if (liveEvidence.evidence_from_operator_terminal.personal_input_collection_enabled !== false) fail("Live evidence personal input mismatch.");
if (readiness.ready_for_ag67 !== true) fail("AG67 readiness must be true.");
if (preview.ready_for_ag67 !== 1) fail("Preview AG67 readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag66z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag66z-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG66Z Star Reflection Closure is present.");
pass("AG66A foundation and AG66B UI wiring are closed.");
pass("Generated Star Reflection safe working data is connected and live evidence is recorded.");
pass("No personal input, prediction, assessment, runtime AI, backend or V02 action is recorded.");
pass("AG67 Psychometric and Assessment readiness is valid.");
