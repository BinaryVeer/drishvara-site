import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG67Z validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/psychometric-assessment-working-data.json",
  "data/content-intelligence/quality-reviews/ag67a-psychometric-assessment-foundation.json",
  "data/content-intelligence/quality-reviews/ag67b-psychometric-assessment-ui-wiring.json",
  "data/content-intelligence/quality-reviews/ag67b-r1-assessment-client-doctrine.json",
  "scripts/generate-ag67z-psychometric-assessment-closure.mjs",
  "scripts/validate-ag67z-psychometric-assessment-closure.mjs",
  "data/content-intelligence/quality-reviews/ag67z-psychometric-assessment-closure.json",
  "data/content-intelligence/closure-records/ag67z-psychometric-assessment-working-data-ui-wiring-doctrine-closure.json",
  "data/content-intelligence/phase-01-modules/ag67z-psychometric-assessment-final-status-record.json",
  "data/content-intelligence/phase-01-modules/ag67z-psychometric-assessment-live-verification-evidence-record.json",
  "data/content-intelligence/mutation-plans/ag67z-to-next-governed-stage-boundary.json",
  "data/content-intelligence/backend-architecture/ag67z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag67z-no-v02-expansion-audit.json",
  "data/quality/ag67z-psychometric-assessment-closure.json",
  "data/quality/ag67z-psychometric-assessment-closure-preview.json",
  "docs/quality/AG67Z_PSYCHOMETRIC_ASSESSMENT_CLOSURE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag67z"]) fail("Missing generate:ag67z script.");
if (!pkg.scripts?.["validate:ag67z"]) fail("Missing validate:ag67z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag67z")) fail("validate:project must include validate:ag67z.");

const indexHtml = read("index.html");
for (const snippet of [
  "data-drishvara-ag67b-psychometric-assessment-ui-wiring",
  "generated/psychometric-assessment-working-data.json",
  "drishvaraAg67bLoadPsychometricAssessment",
  "data-drishvara-ag67b-psychometric-assessment-wired",
  "data-drishvara-ag67b-non-interactive"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing AG67B UI closure snippet: ${snippet}`);
}

const generated = readJson("generated/psychometric-assessment-working-data.json");
const psych = generated.psychometric_assessment || {};

for (const key of [
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
]) {
  if (generated[key] !== false) fail(`${key} must be false.`);
}

if (psych.card_id !== "psychometric-card") fail("Card ID mismatch.");
if (psych.status_label !== "Coming Soon") fail("Status label mismatch.");
if (psych.safety_note !== "This space is reserved for future guided self-discovery. No assessment, data collection or scoring is active.") fail("Safety note mismatch.");

const review = readJson("data/content-intelligence/quality-reviews/ag67z-psychometric-assessment-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag67z-psychometric-assessment-working-data-ui-wiring-doctrine-closure.json");
const finalStatus = readJson("data/content-intelligence/phase-01-modules/ag67z-psychometric-assessment-final-status-record.json");
const liveEvidence = readJson("data/content-intelligence/phase-01-modules/ag67z-psychometric-assessment-live-verification-evidence-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag67z-to-next-governed-stage-boundary.json");
const preview = readJson("data/quality/ag67z-psychometric-assessment-closure-preview.json");

if (review.status !== "ag67z_psychometric_assessment_closure_completed") fail("Review status mismatch.");
for (const key of [
  "ag67a_foundation_completed",
  "ag67b_ui_wiring_completed",
  "ag67b_r1_doctrine_completed",
  "live_evidence_recorded",
  "psychometric_assessment_row_closed_at_safe_working_data_level",
  "generated_psychometric_assessment_source_connected",
  "safe_placeholder_values_connected",
  "assessment_client_doctrine_preserved"
]) {
  if (review.summary[key] !== true) fail(`${key} missing in review summary.`);
}

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

if (review.summary.next_governed_stage_requires_user_confirmation !== true) fail("Next governed stage confirmation flag missing.");
if (closure.status !== "ag67z_psychometric_assessment_closed") fail("Closure status mismatch.");
if (!closure.closed_stages.some((stage) => stage.includes("AG67B-R1"))) fail("AG67B-R1 must be included in closure.");
if (finalStatus.doctrine_preserved.school_learning_pattern_grouping_prescription !== true) fail("School grouping doctrine not preserved.");
if (finalStatus.doctrine_preserved.company_peer_collaboration_recommendation !== true) fail("Company peer collaboration doctrine not preserved.");
if (finalStatus.doctrine_preserved.admin_only_star_assessment_concordance !== true) fail("Star concordance doctrine not preserved.");
if (liveEvidence.evidence_from_operator_terminal.live_generated_psychometric_assessment_json_accessible !== true) fail("Live JSON evidence missing.");
if (liveEvidence.evidence_from_operator_terminal.public_assessment_launch_enabled !== false) fail("Live assessment launch flag mismatch.");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
if (preview.next_governed_stage_requires_user_confirmation !== 1) fail("Preview next-stage confirmation missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag67z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag67z-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG67Z Psychometric Assessment Closure is present.");
pass("AG67A foundation, AG67B UI wiring and AG67B-R1 doctrine are closed.");
pass("Generated Psychometric Assessment safe working data remains connected and live evidence is recorded.");
pass("Assessment client doctrine, learning-pattern grouping, entitlement, verification and reporting models are preserved.");
pass("No assessment, data collection, scoring, report generation, runtime AI, backend or V02 action is recorded.");
pass("Next governed stage requires user confirmation.");
