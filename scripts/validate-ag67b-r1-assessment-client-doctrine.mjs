import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG67B-R1 validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "generated/psychometric-assessment-working-data.json",
  "data/content-intelligence/quality-reviews/ag67a-psychometric-assessment-foundation.json",
  "data/content-intelligence/quality-reviews/ag67b-psychometric-assessment-ui-wiring.json",
  "scripts/generate-ag67b-r1-assessment-client-doctrine.mjs",
  "scripts/validate-ag67b-r1-assessment-client-doctrine.mjs",
  "data/content-intelligence/quality-reviews/ag67b-r1-assessment-client-doctrine.json",
  "data/content-intelligence/phase-01-modules/ag67b-r1-adaptive-verification-client-entitlement-prescription-doctrine.json",
  "data/methodology/psychometric-assessment/ag67b-r1-assessment-client-operating-model.json",
  "data/methodology/psychometric-assessment/ag67b-r1-teacher-manager-verification-model.json",
  "data/methodology/psychometric-assessment/ag67b-r1-unique-assessment-code-identity-separation-model.json",
  "data/methodology/psychometric-assessment/ag67b-r1-client-entitlement-quota-model.json",
  "data/methodology/psychometric-assessment/ag67b-r1-learning-pattern-grouping-and-peer-collaboration-model.json",
  "data/methodology/psychometric-assessment/ag67b-r1-report-generation-and-delivery-model.json",
  "data/methodology/psychometric-assessment/ag67b-r1-admin-only-star-assessment-concordance-model.json",
  "data/methodology/psychometric-assessment/ag67b-r1-prescription-engine-doctrine.json",
  "data/content-intelligence/quality-registry/ag67b-r1-ag67z-psychometric-assessment-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag67b-r1-to-ag67z-psychometric-assessment-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ag67b-r1-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag67b-r1-no-v02-expansion-audit.json",
  "data/quality/ag67b-r1-assessment-client-doctrine.json",
  "data/quality/ag67b-r1-assessment-client-doctrine-preview.json",
  "docs/quality/AG67B_R1_ASSESSMENT_CLIENT_DOCTRINE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag67b-r1"]) fail("Missing generate:ag67b-r1 script.");
if (!pkg.scripts?.["validate:ag67b-r1"]) fail("Missing validate:ag67b-r1 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag67b-r1")) fail("validate:project must include validate:ag67b-r1.");

const generated = readJson("generated/psychometric-assessment-working-data.json");
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
  "academic_prediction_enabled",
  "career_prediction_enabled",
  "student_ranking_enabled",
  "report_generation_enabled",
  "external_api_fetch_active",
  "ai_generation_active"
]) {
  if (generated[key] !== false) fail(`${key} must remain false.`);
}

const doctrine = readJson("data/content-intelligence/phase-01-modules/ag67b-r1-adaptive-verification-client-entitlement-prescription-doctrine.json");
const operating = readJson("data/methodology/psychometric-assessment/ag67b-r1-assessment-client-operating-model.json");
const verification = readJson("data/methodology/psychometric-assessment/ag67b-r1-teacher-manager-verification-model.json");
const identity = readJson("data/methodology/psychometric-assessment/ag67b-r1-unique-assessment-code-identity-separation-model.json");
const entitlement = readJson("data/methodology/psychometric-assessment/ag67b-r1-client-entitlement-quota-model.json");
const grouping = readJson("data/methodology/psychometric-assessment/ag67b-r1-learning-pattern-grouping-and-peer-collaboration-model.json");
const reportModel = readJson("data/methodology/psychometric-assessment/ag67b-r1-report-generation-and-delivery-model.json");
const star = readJson("data/methodology/psychometric-assessment/ag67b-r1-admin-only-star-assessment-concordance-model.json");
const prescription = readJson("data/methodology/psychometric-assessment/ag67b-r1-prescription-engine-doctrine.json");
const review = readJson("data/content-intelligence/quality-reviews/ag67b-r1-assessment-client-doctrine.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag67b-r1-ag67z-psychometric-assessment-closure-readiness-record.json");
const preview = readJson("data/quality/ag67b-r1-assessment-client-doctrine-preview.json");

if (doctrine.status !== "doctrine_recorded_no_runtime_activation") fail("Doctrine status mismatch.");
if (!doctrine.client_paths.some((p) => p.path === "individual")) fail("Individual path missing.");
if (!doctrine.client_paths.some((p) => p.path === "school_institution")) fail("School/institution path missing.");
if (!doctrine.client_paths.some((p) => p.path === "company_organisation")) fail("Company/organisation path missing.");

if (!operating.school_institution_flow.includes("learning-pattern grouping prescription")) fail("School learning-pattern grouping flow missing.");
if (!operating.company_organisation_flow.includes("manager verification forms")) fail("Company manager verification flow missing.");

if (verification.scale["5"].percentage !== 100) fail("Verification scale 5 mismatch.");
if (verification.scale["1"].percentage !== 0) fail("Verification scale 1 mismatch.");
if (!verification.interpretation.some((b) => b.band === "80_and_above")) fail("Verification 80+ band missing.");

if (!identity.printed_report_rule.includes("code-only")) fail("Code-only report rule missing.");
if (!identity.code_examples.includes("DV-SCH-CL10-A-023")) fail("School code example missing.");

if (entitlement.quota_rule.bonus_percentage !== 2) fail("2% bonus quota rule missing.");
if (entitlement.blocked_now.includes("assessment page activation") !== true) fail("Assessment activation blocked status missing.");

if (grouping.school_institution_rule.terminology !== "Learning-Pattern Grouping Prescription") fail("School grouping terminology mismatch.");
if (grouping.school_institution_rule.formula !== "total_assessed_learners_in_class_or_cohort / number_of_sections_or_groups = target_group_size") fail("School grouping formula mismatch.");
if (grouping.school_institution_rule.example.total_students !== 50) fail("School grouping example students mismatch.");
if (grouping.school_institution_rule.example.sections !== 2) fail("School grouping example sections mismatch.");
if (grouping.school_institution_rule.example.target_group_size !== 25) fail("School grouping target group size mismatch.");
if (grouping.school_institution_rule.not_pairwise_peer_bonding !== true) fail("School not-pairwise rule missing.");
if (grouping.school_institution_rule.not_automatic_section_allocation !== true) fail("School automatic allocation blocker missing.");
if (grouping.company_organisation_rule.formula !== "department_size <= 20 ? top_3_recommendations : top_5_recommendations") fail("Company top-N formula mismatch.");

if (!reportModel.student_employee_individual_report.includes("code-only report")) fail("Code-only student/employee report missing.");
if (!reportModel.verification_csv.includes("name plus code")) fail("Verification CSV name+code rule missing.");
if (!reportModel.class_department_report.includes("3-5 priority recommendations")) fail("3-5 priority recommendations missing.");

if (star.terminology !== "Internal Star–Assessment Concordance Review") fail("Star concordance terminology mismatch.");
if (star.visibility.admin_reviewer !== true) fail("Admin visibility missing.");
if (star.visibility.school_client !== false) fail("School client must not see star concordance.");
if (star.rule.similarity_75_or_above !== "positive_concordance_candidate_admin_review_required") fail("75% concordance rule mismatch.");
if (star.rule.below_75 !== "neutral_no_concordance") fail("Below 75 rule mismatch.");
if (star.rule.negative_reinforcement_from_assessment_to_star_methodology !== false) fail("Negative reinforcement must be false.");

if (!prescription.school_prescription.includes("learning-pattern grouping prescription")) fail("School prescription grouping missing.");
if (!prescription.syllabus_upload_future_flow.includes("chapter-wise teaching-method prescription")) fail("Syllabus teaching method flow missing.");

if (review.status !== "ag67b_r1_assessment_client_doctrine_recorded") fail("Review status mismatch.");
for (const key of [
  "doctrine_recorded",
  "individual_path_recorded",
  "school_institution_path_recorded",
  "company_organisation_path_recorded",
  "client_entitlement_model_recorded",
  "unique_assessment_code_model_recorded",
  "teacher_manager_verification_model_recorded",
  "learning_pattern_grouping_model_recorded",
  "company_peer_collaboration_model_recorded",
  "star_concordance_admin_only_model_recorded",
  "prescription_engine_doctrine_recorded",
  "report_delivery_model_recorded"
]) {
  if (review.summary[key] !== true) fail(`${key} missing in review summary.`);
}

for (const key of [
  "public_assessment_launch_enabled",
  "data_collection_enabled",
  "scoring_runtime_enabled",
  "report_generation_enabled",
  "ai_generation_active",
  "backend_runtime_activated",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false in review summary.`);
}

if (review.summary.ready_for_ag67z !== true) fail("AG67Z readiness missing.");
if (readiness.ready_for_ag67z !== true) fail("AG67Z readiness must be true.");
if (preview.ready_for_ag67z !== 1) fail("Preview AG67Z readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag67b-r1-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag67b-r1-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG67B-R1 assessment client doctrine is present.");
pass("Individual, school/institution and company/organisation pathways are recorded.");
pass("Teacher/manager verification, unique code, entitlement, report and prescription models are valid.");
pass("School learning-pattern grouping uses class/cohort divided by sections/groups, not pair-wise peer bonding.");
pass("Company peer-collaboration top 3/top 5 rule is valid.");
pass("Admin-only star-assessment concordance and no-negative-reinforcement rule are valid.");
pass("No assessment, scoring, reports, runtime AI, backend or V02 action is recorded.");
pass("AG67Z readiness is valid.");
