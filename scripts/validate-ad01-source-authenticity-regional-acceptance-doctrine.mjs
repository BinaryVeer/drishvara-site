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
  console.error(`❌ AD01 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ad00-astro-drishvara-data-foundation-opening.json",
  "data/content-intelligence/ad-foundation/ad00-astro-drishvara-data-foundation-opening-record.json",
  "data/content-intelligence/ad-foundation/ad00-source-study-intake-register.json",
  "data/content-intelligence/ad-foundation/ad00-database-first-doctrine.json",
  "data/content-intelligence/ad-foundation/ad00-kala-drishti-method-name-record.json",
  "data/content-intelligence/ad-foundation/ad00-ad-series-plan.json",
  "data/content-intelligence/backend-architecture/ad00-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad00-ad01-source-authenticity-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad00-to-ad01-source-authenticity-boundary.json",

  "data/content-intelligence/quality-reviews/ad01-source-authenticity-regional-acceptance-doctrine.json",
  "data/content-intelligence/ad-foundation/ad01-source-authenticity-hierarchy.json",
  "data/content-intelligence/ad-foundation/ad01-regional-acceptance-doctrine.json",
  "data/content-intelligence/ad-foundation/ad01-nityanand-mishra-style-discipline-record.json",
  "data/content-intelligence/ad-foundation/ad01-classical-panchanga-basis-register.json",
  "data/content-intelligence/ad-foundation/ad01-source-confidence-model.json",
  "data/content-intelligence/ad-foundation/ad01-attribution-and-claim-boundary.json",
  "data/content-intelligence/backend-architecture/ad01-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad01-ad02-panchanga-ontology-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad01-to-ad02-panchanga-ontology-boundary.json",
  "data/quality/ad01-source-authenticity-regional-acceptance-doctrine.json",
  "data/quality/ad01-source-authenticity-regional-acceptance-doctrine-preview.json",
  "docs/quality/AD01_SOURCE_AUTHENTICITY_REGIONAL_ACCEPTANCE_DOCTRINE.md",
  "scripts/generate-ad01-source-authenticity-regional-acceptance-doctrine.mjs",
  "scripts/validate-ad01-source-authenticity-regional-acceptance-doctrine.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ad00Review = readJson("data/content-intelligence/quality-reviews/ad00-astro-drishvara-data-foundation-opening.json");
const ad00NoMutationAudit = readJson("data/content-intelligence/backend-architecture/ad00-no-mutation-audit-register.json");
const ad00Readiness = readJson("data/content-intelligence/quality-registry/ad00-ad01-source-authenticity-readiness-record.json");
const ad00Boundary = readJson("data/content-intelligence/mutation-plans/ad00-to-ad01-source-authenticity-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ad01-source-authenticity-regional-acceptance-doctrine.json");
const sourceHierarchy = readJson("data/content-intelligence/ad-foundation/ad01-source-authenticity-hierarchy.json");
const regionalAcceptanceDoctrine = readJson("data/content-intelligence/ad-foundation/ad01-regional-acceptance-doctrine.json");
const nityanandMishraDisciplineRecord = readJson("data/content-intelligence/ad-foundation/ad01-nityanand-mishra-style-discipline-record.json");
const classicalPanchangaBasisRegister = readJson("data/content-intelligence/ad-foundation/ad01-classical-panchanga-basis-register.json");
const sourceConfidenceModel = readJson("data/content-intelligence/ad-foundation/ad01-source-confidence-model.json");
const attributionAndClaimBoundary = readJson("data/content-intelligence/ad-foundation/ad01-attribution-and-claim-boundary.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ad01-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ad01-ad02-panchanga-ontology-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ad01-to-ad02-panchanga-ontology-boundary.json");
const preview = readJson("data/quality/ad01-source-authenticity-regional-acceptance-doctrine-preview.json");
const pkg = readJson("package.json");

if (ad00Review.status !== "astro_drishvara_data_foundation_opened_ready_for_ad01") fail("AD00 review status mismatch.");
if (ad00Review.summary.ready_for_ad01 !== true) fail("AD00 readiness summary missing.");
if (ad00NoMutationAudit.audit_passed !== true) fail("AD00 no-mutation audit must pass.");
if (ad00Readiness.ready_for_ad01 !== true) fail("AD00 readiness must permit AD01.");
if (ad00Boundary.next_stage_id !== "AD01") fail("AD00 boundary must point to AD01.");

if (review.status !== "source_authenticity_regional_acceptance_doctrine_ready_for_ad02") fail("AD01 review status mismatch.");
for (const key of [
  "ad01_source_authenticity_regional_acceptance_doctrine_recorded",
  "ad00_consumed",
  "source_hierarchy_recorded",
  "regional_acceptance_doctrine_recorded",
  "nityanand_mishra_style_discipline_recorded",
  "classical_panchanga_basis_recorded",
  "source_confidence_model_recorded",
  "attribution_claim_boundary_recorded",
  "ready_for_ad02"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_ad02 !== 0) fail("AD02 blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "panchang_prediction_generated", "panchang_algorithm_claimed_from_person", "unverified_personal_attribution_made", "deterministic_prediction_claim_made", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (sourceHierarchy.status !== "source_authenticity_hierarchy_recorded") fail("Source hierarchy status mismatch.");
for (const tier of ["tier_1_classical_and_traditional_basis", "tier_2_regional_living_acceptance", "tier_3_modern_study_and_cross_verification", "tier_4_sanskritic_textual_discipline_and_editorial_style", "tier_5_editorial_reflection_layer"]) {
  if (!JSON.stringify(sourceHierarchy.hierarchy).includes(tier)) fail(`Source hierarchy tier missing: ${tier}`);
}
if (!JSON.stringify(sourceHierarchy.prohibited_source_usage).includes("viral astrology")) fail("Viral astrology prohibition missing.");
if (!JSON.stringify(sourceHierarchy.prohibited_source_usage).includes("Panchang method from a living scholar")) fail("Living scholar claim prohibition missing.");

if (regionalAcceptanceDoctrine.status !== "regional_acceptance_doctrine_recorded") fail("Regional acceptance doctrine status mismatch.");
for (const profile of ["north_india_general", "east_india_bihar_mithila", "south_indian_panchangam", "location_specific_sunrise_profile"]) {
  if (!JSON.stringify(regionalAcceptanceDoctrine.regional_profiles_to_prepare_in_ad03).includes(profile)) fail(`Regional profile missing: ${profile}`);
}
for (const phrase of ["Regional differences must be recorded as profiles", "Local sunrise", "region/profile metadata"]) {
  if (!JSON.stringify(regionalAcceptanceDoctrine.doctrine_rules).includes(phrase)) fail(`Regional doctrine phrase missing: ${phrase}`);
}

if (nityanandMishraDisciplineRecord.status !== "nityanand_mishra_style_discipline_recorded_with_caution") fail("Nityanand Mishra discipline status mismatch.");
if (!JSON.stringify(nityanandMishraDisciplineRecord.allowed_usage).includes("Sanskrit")) fail("Sanskrit discipline allowed usage missing.");
if (!JSON.stringify(nityanandMishraDisciplineRecord.prohibited_usage).includes("Panchang calculation algorithm")) fail("Panchang algorithm claim prohibition missing.");
if (!JSON.stringify(nityanandMishraDisciplineRecord.later_required_fields).includes("exact_claim_supported")) fail("Exact claim supported field missing.");

if (classicalPanchangaBasisRegister.status !== "classical_panchanga_basis_recorded") fail("Classical Panchanga basis status mismatch.");
for (const element of ["tithi", "vara", "nakshatra", "yoga", "karana"]) {
  if (!JSON.stringify(classicalPanchangaBasisRegister.core_panchanga_elements).includes(element)) fail(`Core Panchanga element missing: ${element}`);
}
for (const field of ["sunrise", "paksha", "samvat", "rashi", "ritu", "ayana", "chandrabalam", "tarabalam", "calculation_profile"]) {
  if (!classicalPanchangaBasisRegister.supporting_context_fields_for_ad02.includes(field)) fail(`Supporting AD02 field missing: ${field}`);
}

if (sourceConfidenceModel.status !== "source_confidence_model_recorded") fail("Source confidence model status mismatch.");
for (const band of ["A", "B", "C", "D", "E", "X"]) {
  if (!JSON.stringify(sourceConfidenceModel.confidence_bands).includes(`"band":"${band}"`) && !JSON.stringify(sourceConfidenceModel.confidence_bands).includes(`"band": "${band}"`)) fail(`Confidence band missing: ${band}`);
}
for (const field of ["source_id", "source_title", "supported_claim", "confidence_band", "verification_status"]) {
  if (!sourceConfidenceModel.required_metadata_for_source_records.includes(field)) fail(`Required source metadata missing: ${field}`);
}

if (attributionAndClaimBoundary.status !== "attribution_and_claim_boundary_recorded") fail("Attribution and claim boundary status mismatch.");
for (const phrase of ["Every methodology claim", "No living-scholar attribution", "reflective", "Avoid guaranteed outcome language", "Avoid fear-based"]) {
  if (!JSON.stringify(attributionAndClaimBoundary).includes(phrase)) fail(`Attribution/claim phrase missing: ${phrase}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ad01") fail("No-mutation status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.status !== "ready_for_ad02_panchanga_ontology_canonical_field_model") fail("Readiness status mismatch.");
if (readiness.ready_for_ad02 !== true) fail("Readiness must permit AD02.");
if (readiness.next_stage_id !== "AD02") fail("Readiness next stage must be AD02.");
if (readiness.ag47_resume_allowed_next !== false) fail("AG47 resume must remain blocked.");
if (readiness.panchang_prediction_allowed_next !== false) fail("Panchang prediction must remain blocked.");
if (readiness.sql_creation_allowed_next !== false) fail("SQL creation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AD02") fail("Boundary must point to AD02.");
if (!JSON.stringify(boundary.allowed_scope).includes("Tithi, Vara, Nakshatra, Yoga and Karana")) fail("AD02 core element boundary missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("calculation profile")) fail("AD02 calculation profile boundary missing.");
if (!boundary.blocked_scope.includes("SQL execution")) fail("SQL execution blocked scope missing.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role key blocked scope missing.");

for (const key of [
  "ad01_source_authenticity_regional_acceptance_doctrine_recorded",
  "ad00_consumed",
  "source_hierarchy_recorded",
  "regional_acceptance_doctrine_recorded",
  "nityanand_mishra_style_discipline_recorded",
  "classical_panchanga_basis_recorded",
  "source_confidence_model_recorded",
  "attribution_claim_boundary_recorded",
  "ready_for_ad02"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_ad02 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "panchang_prediction_generated", "panchang_algorithm_claimed_from_person", "unverified_personal_attribution_made", "deterministic_prediction_claim_made", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ad01"]) fail("Missing package script: generate:ad01");
if (!pkg.scripts?.["validate:ad01"]) fail("Missing package script: validate:ad01");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ad01")) fail("validate:project must include validate:ad01.");

pass("AD01 Source Authenticity and Regional Acceptance Doctrine is present.");
pass("AD00 foundation opening is consumed.");
pass("Source authenticity hierarchy is valid.");
pass("Regional acceptance doctrine is valid.");
pass("Nityanand Mishra ji style-discipline record is cautious and valid.");
pass("Classical Panchanga basis is valid.");
pass("Source confidence model is valid.");
pass("Attribution and claim boundary is valid.");
pass("No-mutation audit is valid.");
pass("AD02 Panchanga Ontology and Canonical Field Model readiness is valid.");
pass("No AG47 resume, public content generation, Panchang prediction, SQL, DB write, backend activation, deployment or service-role exposure is recorded.");
