import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG67B validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/psychometric-assessment-working-data.json",
  "data/content-intelligence/quality-reviews/ag67a-psychometric-assessment-foundation.json",
  "scripts/generate-ag67b-psychometric-assessment-ui-wiring.mjs",
  "scripts/validate-ag67b-psychometric-assessment-ui-wiring.mjs",
  "data/content-intelligence/quality-reviews/ag67b-psychometric-assessment-ui-wiring.json",
  "data/content-intelligence/phase-01-modules/ag67b-psychometric-assessment-ui-wiring-apply-record.json",
  "data/content-intelligence/phase-01-modules/ag67b-psychometric-assessment-ui-data-contract-record.json",
  "data/content-intelligence/quality-registry/ag67b-ag67z-psychometric-assessment-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag67b-to-ag67z-psychometric-assessment-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ag67b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag67b-no-v02-expansion-audit.json",
  "data/quality/ag67b-psychometric-assessment-ui-wiring.json",
  "data/quality/ag67b-psychometric-assessment-ui-wiring-preview.json",
  "docs/quality/AG67B_PSYCHOMETRIC_ASSESSMENT_UI_WIRING.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag67b"]) fail("Missing generate:ag67b script.");
if (!pkg.scripts?.["validate:ag67b"]) fail("Missing validate:ag67b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag67b")) fail("validate:project must include validate:ag67b.");

const indexHtml = read("index.html");
const workingData = readJson("generated/psychometric-assessment-working-data.json");

for (const snippet of [
  "data-drishvara-ag67b-psychometric-assessment-ui-wiring",
  "generated/psychometric-assessment-working-data.json",
  "drishvaraAg67bLoadPsychometricAssessment",
  "data-drishvara-ag67b-psychometric-assessment-wired",
  "data-drishvara-ag67b-non-interactive"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing AG67B UI wiring snippet: ${snippet}`);
}

for (const snippet of [
  'id="psychometric-card"',
  'id="psychometric-subtitle"',
  "Psychometric Assessment",
  "Coming Soon",
  "This space is reserved for future guided self-discovery. No assessment, data collection or scoring is active."
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing Psychometric UI target: ${snippet}`);
}

const falseFlags = [
  "public_ui_ready",
  "public_assessment_launch_enabled",
  "personal_input_collection_enabled",
  "student_data_collection_enabled",
  "child_minor_data_processing_enabled",
  "guardian_consent_runtime_enabled",
  "school_permission_runtime_enabled",
  "questionnaire_runtime_enabled",
  "psychometric_test_runtime_enabled",
  "scoring_runtime_enabled",
  "trait_diagnosis_enabled",
  "mental_health_inference_enabled",
  "academic_prediction_enabled",
  "career_prediction_enabled",
  "student_ranking_enabled",
  "report_generation_enabled",
  "external_api_fetch_active",
  "ai_generation_active"
];

for (const key of falseFlags) {
  if (workingData[key] !== false) fail(`${key} must be false.`);
}

const psych = workingData.psychometric_assessment || {};
if (psych.card_id !== "psychometric-card") fail("Card id mismatch.");
if (psych.status_label !== "Coming Soon") fail("Status label mismatch.");
if (psych.safety_note !== "This space is reserved for future guided self-discovery. No assessment, data collection or scoring is active.") fail("Safety note mismatch.");

const review = readJson("data/content-intelligence/quality-reviews/ag67b-psychometric-assessment-ui-wiring.json");
const apply = readJson("data/content-intelligence/phase-01-modules/ag67b-psychometric-assessment-ui-wiring-apply-record.json");
const contract = readJson("data/content-intelligence/phase-01-modules/ag67b-psychometric-assessment-ui-data-contract-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag67b-ag67z-psychometric-assessment-closure-readiness-record.json");
const preview = readJson("data/quality/ag67b-psychometric-assessment-ui-wiring-preview.json");

if (review.status !== "ag67b_psychometric_assessment_ui_wiring_completed") fail("Review status mismatch.");
if (review.summary.ui_wiring_applied !== true) fail("UI wiring summary missing.");
if (review.summary.generated_psychometric_assessment_source_connected !== true) fail("Generated source summary missing.");
if (review.summary.safe_placeholder_values_connected !== true) fail("Safe placeholder summary missing.");
if (review.summary.non_interactive_placeholder_preserved !== true) fail("Non-interactive summary missing.");

for (const key of [
  "public_assessment_launch_enabled",
  "personal_input_collection_enabled",
  "student_data_collection_enabled",
  "child_minor_data_processing_enabled",
  "guardian_consent_runtime_enabled",
  "school_permission_runtime_enabled",
  "questionnaire_runtime_enabled",
  "psychometric_test_runtime_enabled",
  "scoring_runtime_enabled",
  "trait_diagnosis_enabled",
  "mental_health_inference_enabled",
  "report_generation_enabled",
  "ai_generation_active",
  "backend_runtime_activated",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false in review summary.`);
}

if (apply.behaviour.fetches_generated_psychometric_assessment_data !== true) fail("Apply fetch behaviour missing.");
if (apply.behaviour.preserves_non_interactive_placeholder !== true) fail("Non-interactive apply behaviour missing.");
if (contract.current_safe_placeholder.safety_note !== psych.safety_note) fail("Contract safety note mismatch.");
if (readiness.ready_for_ag67z !== true) fail("AG67Z readiness must be true.");
if (preview.ready_for_ag67z !== 1) fail("Preview AG67Z readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag67b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag67b-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG67B Psychometric Assessment UI Wiring is present.");
pass("Homepage Psychometric Assessment card is wired to generated/psychometric-assessment-working-data.json.");
pass("Generated safe-placeholder data keeps assessment, data collection and scoring disabled.");
pass("No assessment launch, data collection, scoring, diagnosis, runtime AI, backend or V02 action is recorded.");
pass("AG67Z Psychometric Assessment Closure readiness is valid.");
