import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function read(p) {
  return fs.readFileSync(full(p), "utf8");
}

function readJson(p) {
  return JSON.parse(read(p));
}

function fail(message) {
  console.error(`❌ AD04 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ad03-regional-panchang-rule-profiles.json",
  "data/content-intelligence/ad-foundation/ad03-regional-panchang-rule-profile-doctrine.json",
  "data/content-intelligence/ad-foundation/ad03-north-india-general-rule-profile.json",
  "data/content-intelligence/ad-foundation/ad03-east-india-bihar-mithila-rule-profile.json",
  "data/content-intelligence/ad-foundation/ad03-south-indian-panchangam-rule-profile.json",
  "data/content-intelligence/ad-foundation/ad03-location-specific-sunrise-rule-profile.json",
  "data/content-intelligence/ad-foundation/ad03-regional-difference-decision-matrix.json",
  "data/content-intelligence/ad-foundation/ad03-regional-source-requirement-map.json",
  "data/content-intelligence/backend-architecture/ad03-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad03-ad04-calendar-calculation-methodology-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad03-to-ad04-calendar-calculation-methodology-boundary.json",

  "data/content-intelligence/quality-reviews/ad04-calendar-calculation-methodology.json",
  "data/content-intelligence/ad-foundation/ad04-calendar-calculation-methodology-doctrine.json",
  "data/content-intelligence/ad-foundation/ad04-core-panchanga-element-calculation-boundary.json",
  "data/content-intelligence/ad-foundation/ad04-sunrise-location-methodology-boundary.json",
  "data/content-intelligence/ad-foundation/ad04-ayanamsha-correction-awareness-record.json",
  "data/content-intelligence/ad-foundation/ad04-regional-calculation-profile-map.json",
  "data/content-intelligence/ad-foundation/ad04-validation-cross-check-model.json",
  "data/content-intelligence/ad-foundation/ad04-calculation-non-execution-policy.json",
  "data/content-intelligence/backend-architecture/ad04-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad04-ad05-word-sutra-reflection-corpus-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad04-to-ad05-word-sutra-reflection-corpus-boundary.json",
  "data/quality/ad04-calendar-calculation-methodology.json",
  "data/quality/ad04-calendar-calculation-methodology-preview.json",
  "docs/quality/AD04_CALENDAR_CALCULATION_METHODOLOGY.md",
  "scripts/generate-ad04-calendar-calculation-methodology.mjs",
  "scripts/validate-ad04-calendar-calculation-methodology.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ad03Review = readJson("data/content-intelligence/quality-reviews/ad03-regional-panchang-rule-profiles.json");
const ad03NoMutationAudit = readJson("data/content-intelligence/backend-architecture/ad03-no-mutation-audit-register.json");
const ad03Readiness = readJson("data/content-intelligence/quality-registry/ad03-ad04-calendar-calculation-methodology-readiness-record.json");
const ad03Boundary = readJson("data/content-intelligence/mutation-plans/ad03-to-ad04-calendar-calculation-methodology-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ad04-calendar-calculation-methodology.json");
const calculationDoctrine = readJson("data/content-intelligence/ad-foundation/ad04-calendar-calculation-methodology-doctrine.json");
const coreElementCalculationBoundary = readJson("data/content-intelligence/ad-foundation/ad04-core-panchanga-element-calculation-boundary.json");
const sunriseLocationMethodology = readJson("data/content-intelligence/ad-foundation/ad04-sunrise-location-methodology-boundary.json");
const ayanamshaCorrectionAwareness = readJson("data/content-intelligence/ad-foundation/ad04-ayanamsha-correction-awareness-record.json");
const regionalCalculationProfileMap = readJson("data/content-intelligence/ad-foundation/ad04-regional-calculation-profile-map.json");
const validationCrossCheckModel = readJson("data/content-intelligence/ad-foundation/ad04-validation-cross-check-model.json");
const nonExecutionPolicy = readJson("data/content-intelligence/ad-foundation/ad04-calculation-non-execution-policy.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ad04-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ad04-ad05-word-sutra-reflection-corpus-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ad04-to-ad05-word-sutra-reflection-corpus-boundary.json");
const preview = readJson("data/quality/ad04-calendar-calculation-methodology-preview.json");
const pkg = readJson("package.json");

if (ad03Review.status !== "regional_panchang_rule_profiles_ready_for_ad04") fail("AD03 review status mismatch.");
if (ad03Review.summary.ready_for_ad04 !== true) fail("AD03 readiness summary missing.");
if (ad03NoMutationAudit.audit_passed !== true) fail("AD03 no-mutation audit must pass.");
if (ad03Readiness.ready_for_ad04 !== true) fail("AD03 readiness must permit AD04.");
if (ad03Boundary.next_stage_id !== "AD04") fail("AD03 boundary must point to AD04.");

if (review.status !== "calendar_calculation_methodology_ready_for_ad05") fail("AD04 review status mismatch.");
for (const key of [
  "ad04_calendar_calculation_methodology_recorded",
  "ad03_consumed",
  "calculation_doctrine_recorded",
  "core_element_calculation_boundary_recorded",
  "sunrise_location_methodology_recorded",
  "ayanamsha_correction_awareness_recorded",
  "regional_calculation_profile_map_recorded",
  "validation_cross_check_model_recorded",
  "calculation_non_execution_policy_recorded",
  "ready_for_ad05"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_ad05 !== 0) fail("AD05 blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "panchang_prediction_generated", "panchang_calculation_executed", "ephemeris_engine_integrated", "ayanamsha_selected_for_runtime", "festival_date_finalised", "panchang_daily_record_seeded", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (calculationDoctrine.status !== "calendar_calculation_methodology_doctrine_recorded") fail("Calculation doctrine status mismatch.");
for (const phrase of ["does not execute Panchanga calculations", "Sunrise and local place context", "Ayanamsha", "Festival and vrata date logic", "reflective/contextual"]) {
  if (!JSON.stringify(calculationDoctrine).includes(phrase)) fail(`Calculation doctrine phrase missing: ${phrase}`);
}

if (coreElementCalculationBoundary.status !== "core_panchanga_element_calculation_boundary_recorded") fail("Core element boundary status mismatch.");
for (const element of ["tithi", "vara", "nakshatra", "yoga", "karana"]) {
  if (!JSON.stringify(coreElementCalculationBoundary.core_elements).includes(element)) fail(`Core calculation boundary missing: ${element}`);
}
for (const field of ["gregorian_date", "location_id", "latitude", "longitude", "timezone", "sunrise_reference", "regional_profile_id", "calculation_profile_id", "source_id", "editorial_review_status"]) {
  if (!coreElementCalculationBoundary.universal_required_metadata_for_future_calculation.includes(field)) fail(`Future calculation metadata missing: ${field}`);
}

if (sunriseLocationMethodology.status !== "sunrise_location_methodology_recorded") fail("Sunrise methodology status mismatch.");
for (const phrase of ["sunrise-aware", "latitude", "longitude", "timezone", "AD04 does not compute sunrise"]) {
  if (!JSON.stringify(sunriseLocationMethodology).includes(phrase)) fail(`Sunrise methodology phrase missing: ${phrase}`);
}

if (ayanamshaCorrectionAwareness.status !== "ayanamsha_correction_awareness_recorded") fail("Ayanamsha awareness status mismatch.");
for (const phrase of ["No ayanamsha is selected for runtime", "No ephemeris library", "calculation_profile_id", "Comparative validation"]) {
  if (!JSON.stringify(ayanamshaCorrectionAwareness).includes(phrase)) fail(`Ayanamsha awareness phrase missing: ${phrase}`);
}

if (regionalCalculationProfileMap.status !== "regional_calculation_profile_map_recorded") fail("Regional calculation profile map status mismatch.");
for (const profile of ["north_india_general", "east_india_bihar_mithila", "south_indian_panchangam", "location_specific_sunrise_profile"]) {
  if (!JSON.stringify(regionalCalculationProfileMap.profile_links).includes(profile)) fail(`Regional calculation map missing: ${profile}`);
}
if (!JSON.stringify(regionalCalculationProfileMap.rule).includes("no profile is applied to public output")) fail("No public output profile application rule missing.");

if (validationCrossCheckModel.status !== "validation_cross_check_model_recorded") fail("Validation cross-check model status mismatch.");
for (const diff of ["source_difference", "regional_rule_difference", "calculation_profile_difference", "location_sunrise_difference", "festival_time_window_difference", "data_entry_error", "editorial_interpretation_difference"]) {
  if (!validationCrossCheckModel.discrepancy_types.includes(diff)) fail(`Discrepancy type missing: ${diff}`);
}
if (!JSON.stringify(validationCrossCheckModel.validation_requirements).includes("Nityanand Mishra ji style discipline")) fail("Nityanand validation caution missing.");

if (nonExecutionPolicy.status !== "calculation_non_execution_policy_recorded") fail("Non-execution policy status mismatch.");
for (const phrase of ["does not execute Panchanga calculations", "does not integrate an ephemeris library", "does not select ayanamsha", "does not finalise festival dates", "does not create SQL", "does not resume AG47"]) {
  if (!JSON.stringify(nonExecutionPolicy.non_execution_assertions).includes(phrase)) fail(`Non-execution assertion missing: ${phrase}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ad04") fail("No-mutation status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.status !== "ready_for_ad05_word_sutra_reflection_corpus_schema") fail("Readiness status mismatch.");
if (readiness.ready_for_ad05 !== true) fail("Readiness must permit AD05.");
if (readiness.next_stage_id !== "AD05") fail("Readiness next stage must be AD05.");
if (readiness.ag47_resume_allowed_next !== false) fail("AG47 resume must remain blocked.");
if (readiness.panchang_prediction_allowed_next !== false) fail("Panchang prediction must remain blocked.");
if (readiness.panchang_calculation_allowed_next !== false) fail("Panchang calculation must remain blocked.");
if (readiness.sql_creation_allowed_next !== false) fail("SQL creation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AD05") fail("Boundary must point to AD05.");
if (!JSON.stringify(boundary.allowed_scope).includes("Word of the Day")) fail("Word of the Day boundary missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("Nityanand Mishra ji style discipline")) fail("Nityanand style discipline boundary missing.");
if (!boundary.blocked_scope.includes("Panchang calculation execution")) fail("Panchang calculation blocked scope missing.");
if (!boundary.blocked_scope.includes("SQL execution")) fail("SQL execution blocked scope missing.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role exposure blocked scope missing.");

for (const key of [
  "ad04_calendar_calculation_methodology_recorded",
  "ad03_consumed",
  "calculation_doctrine_recorded",
  "core_element_calculation_boundary_recorded",
  "sunrise_location_methodology_recorded",
  "ayanamsha_correction_awareness_recorded",
  "regional_calculation_profile_map_recorded",
  "validation_cross_check_model_recorded",
  "calculation_non_execution_policy_recorded",
  "ready_for_ad05"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_ad05 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "panchang_prediction_generated", "panchang_calculation_executed", "ephemeris_engine_integrated", "ayanamsha_selected_for_runtime", "festival_date_finalised", "panchang_daily_record_seeded", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ad04"]) fail("Missing package script: generate:ad04");
if (!pkg.scripts?.["validate:ad04"]) fail("Missing package script: validate:ad04");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ad04")) fail("validate:project must include validate:ad04.");

pass("AD04 Classical Astronomical and Calendar Calculation Methodology is present.");
pass("AD03 regional profiles are consumed.");
pass("Calculation methodology doctrine is valid.");
pass("Core Panchanga element calculation boundary is valid.");
pass("Sunrise and location methodology is valid.");
pass("Ayanamsha and correction awareness record is valid.");
pass("Regional calculation profile map is valid.");
pass("Validation and cross-check model is valid.");
pass("Calculation non-execution policy is valid.");
pass("No-mutation audit is valid.");
pass("AD05 Word/Sutra/Reflection Corpus Schema readiness is valid.");
pass("No AG47 resume, Panchang calculation, prediction, SQL, DB write, backend activation, deployment or service-role exposure is recorded.");
