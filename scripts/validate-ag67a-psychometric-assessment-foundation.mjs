import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG67A validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "data/content-intelligence/quality-reviews/ag66z-star-reflection-closure.json",
  "scripts/generate-ag67a-psychometric-assessment-foundation.mjs",
  "scripts/validate-ag67a-psychometric-assessment-foundation.mjs",
  "data/content-intelligence/quality-reviews/ag67a-psychometric-assessment-foundation.json",
  "data/content-intelligence/phase-01-modules/ag67a-psychometric-assessment-source-consumption-record.json",
  "data/initial-working-data/psychometric-assessment/ag67a-psychometric-assessment-initial-working-data.json",
  "data/initial-working-data/psychometric-assessment/ag67a-psychometric-assessment-source-registry.json",
  "data/methodology/psychometric-assessment/ag67a-psychometric-assessment-ethics-consent-schema.json",
  "data/methodology/psychometric-assessment/ag67a-child-minor-protection-schema.json",
  "data/methodology/psychometric-assessment/ag67a-psychometric-assessment-methodology.json",
  "data/methodology/psychometric-assessment/ag67a-assessment-runtime-blocker.json",
  "data/methodology/psychometric-assessment/ag67a-psychometric-assessment-ai-token-policy.json",
  "data/feedback/psychometric-assessment/ag67a-psychometric-assessment-user-feedback-schema.json",
  "data/feedback/psychometric-assessment/ag67a-psychometric-assessment-admin-review-absorption-schema.json",
  "generated/psychometric-assessment-working-data.json",
  "data/content-intelligence/quality-registry/ag67a-ag67b-psychometric-assessment-ui-wiring-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag67a-to-ag67b-psychometric-assessment-ui-wiring-boundary.json",
  "data/content-intelligence/backend-architecture/ag67a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag67a-no-v02-expansion-audit.json",
  "data/quality/ag67a-psychometric-assessment-foundation.json",
  "data/quality/ag67a-psychometric-assessment-foundation-preview.json",
  "docs/quality/AG67A_PSYCHOMETRIC_ASSESSMENT_FOUNDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag67a"]) fail("Missing generate:ag67a script.");
if (!pkg.scripts?.["validate:ag67a"]) fail("Missing validate:ag67a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag67a")) fail("validate:project must include validate:ag67a.");

const indexHtml = read("index.html");
for (const snippet of [
  'id="psychometric-card"',
  "Psychometric Assessment",
  'id="psychometric-subtitle"',
  "Coming Soon",
  "This space is reserved for future guided self-discovery. No assessment, data collection or scoring is active."
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing Psychometric UI target: ${snippet}`);
}

const initial = readJson("data/initial-working-data/psychometric-assessment/ag67a-psychometric-assessment-initial-working-data.json");
const registry = readJson("data/initial-working-data/psychometric-assessment/ag67a-psychometric-assessment-source-registry.json");
const ethics = readJson("data/methodology/psychometric-assessment/ag67a-psychometric-assessment-ethics-consent-schema.json");
const minor = readJson("data/methodology/psychometric-assessment/ag67a-child-minor-protection-schema.json");
const methodology = readJson("data/methodology/psychometric-assessment/ag67a-psychometric-assessment-methodology.json");
const blocker = readJson("data/methodology/psychometric-assessment/ag67a-assessment-runtime-blocker.json");
const aiPolicy = readJson("data/methodology/psychometric-assessment/ag67a-psychometric-assessment-ai-token-policy.json");
const feedback = readJson("data/feedback/psychometric-assessment/ag67a-psychometric-assessment-user-feedback-schema.json");
const admin = readJson("data/feedback/psychometric-assessment/ag67a-psychometric-assessment-admin-review-absorption-schema.json");
const generated = readJson("generated/psychometric-assessment-working-data.json");
const review = readJson("data/content-intelligence/quality-reviews/ag67a-psychometric-assessment-foundation.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag67a-ag67b-psychometric-assessment-ui-wiring-readiness-record.json");
const preview = readJson("data/quality/ag67a-psychometric-assessment-foundation-preview.json");

if (initial.status !== "initial_working_data_created_not_publicly_wired") fail("Initial working data status mismatch.");
if (initial.public_ui_activation_status !== "not_wired_in_ag67a") fail("Public UI must not be wired in AG67A.");

if (registry.live_source_fetching_enabled !== false) fail("Live source fetching must be false.");
if (registry.external_api_enabled !== false) fail("External API must be false.");
if (registry.psychometric_library_enabled !== false) fail("Psychometric library must be false.");
if (registry.scoring_model_enabled !== false) fail("Scoring model must be false.");

if (ethics.consent_collection_enabled_now !== false) fail("Consent collection must be false.");
if (ethics.personal_input_collection_enabled_now !== false) fail("Personal input collection must be false.");
if (ethics.assessment_runtime_enabled_now !== false) fail("Assessment runtime must be false.");

if (minor.minor_data_processing_enabled_now !== false) fail("Minor data processing must be false.");
if (minor.guardian_consent_runtime_enabled_now !== false) fail("Guardian consent runtime must be false.");
if (minor.school_permission_runtime_enabled_now !== false) fail("School permission runtime must be false.");

if (methodology.status !== "methodology_created_not_runtime_active") fail("Methodology status mismatch.");
if (!methodology.principles.some((rule) => rule.includes("Do not launch questionnaire"))) fail("Questionnaire/scoring guardrail missing.");
if (!methodology.principles.some((rule) => rule.includes("Do not process child/minor/student data"))) fail("Child/minor guardrail missing.");

if (blocker.public_assessment_enabled_now !== false) fail("Public assessment must be false.");
if (blocker.questionnaire_runtime_enabled_now !== false) fail("Questionnaire runtime must be false.");
if (blocker.scoring_runtime_enabled_now !== false) fail("Scoring runtime must be false.");
if (blocker.report_generation_enabled_now !== false) fail("Report generation must be false.");

if (aiPolicy.ai_runtime_active !== false) fail("AI runtime must be false.");
if (aiPolicy.user_triggered_ai_allowed !== false) fail("User-triggered AI must be false.");
if (feedback.user_feedback_allowed_now !== false) fail("User feedback must not be active.");
if (admin.automatic_absorption_allowed !== false) fail("Automatic absorption must be false.");

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
  if (generated[key] !== false) fail(`${key} must be false.`);
}

const psych = generated.psychometric_assessment || {};
if (psych.card_id !== "psychometric-card") fail("Psychometric card id mismatch.");
if (psych.status_label !== "Coming Soon") fail("Status label mismatch.");
if (psych.safety_note !== "This space is reserved for future guided self-discovery. No assessment, data collection or scoring is active.") fail("Safety note mismatch.");

if (review.status !== "ag67a_psychometric_assessment_foundation_completed") fail("Review status mismatch.");
if (review.summary.initial_working_data_created !== true) fail("Initial working summary missing.");
if (review.summary.ethics_consent_schema_created !== true) fail("Ethics consent summary missing.");
if (review.summary.minor_protection_schema_created !== true) fail("Minor protection summary missing.");
if (review.summary.assessment_methodology_created !== true) fail("Methodology summary missing.");
if (review.summary.runtime_blocker_created !== true) fail("Runtime blocker summary missing.");
if (review.summary.generated_psychometric_assessment_data_created !== true) fail("Generated data summary missing.");
if (review.summary.ui_wired_now !== false) fail("UI wiring must be false in AG67A.");

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

if (review.summary.ready_for_ag67b !== true) fail("AG67B readiness missing.");
if (readiness.ready_for_ag67b !== true) fail("AG67B readiness must be true.");
if (preview.ready_for_ag67b !== 1) fail("Preview AG67B readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag67a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag67a-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG67A Psychometric and Assessment Foundation is present.");
pass("Psychometric Assessment UI targets are confirmed.");
pass("Initial working data, ethics/consent schema, minor protection schema, methodology and runtime blocker are present.");
pass("generated/psychometric-assessment-working-data.json is created with assessment runtime disabled.");
pass("No assessment launch, data collection, scoring, diagnosis, runtime AI, backend or V02 action is recorded.");
pass("AG67B Psychometric and Assessment UI Wiring readiness is valid.");
