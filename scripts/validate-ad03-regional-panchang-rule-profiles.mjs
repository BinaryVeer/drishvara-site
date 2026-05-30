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
  console.error(`❌ AD03 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ad02-panchanga-ontology-canonical-field-model.json",
  "data/content-intelligence/ad-foundation/ad02-panchanga-canonical-ontology.json",
  "data/content-intelligence/ad-foundation/ad02-panchanga-core-element-model.json",
  "data/content-intelligence/ad-foundation/ad02-panchanga-supporting-field-model.json",
  "data/content-intelligence/ad-foundation/ad02-time-location-calculation-context-model.json",
  "data/content-intelligence/ad-foundation/ad02-regional-profile-placeholder-map.json",
  "data/content-intelligence/ad-foundation/ad02-database-field-planning-map.json",
  "data/content-intelligence/backend-architecture/ad02-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad02-ad03-regional-panchang-rule-profile-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad02-to-ad03-regional-panchang-rule-profiles-boundary.json",
  "data/content-intelligence/ad-foundation/ad01-regional-acceptance-doctrine.json",
  "data/content-intelligence/ad-foundation/ad01-source-confidence-model.json",
  "data/content-intelligence/ad-foundation/ad01-attribution-and-claim-boundary.json",

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
  "data/quality/ad03-regional-panchang-rule-profiles.json",
  "data/quality/ad03-regional-panchang-rule-profiles-preview.json",
  "docs/quality/AD03_REGIONAL_PANCHANG_RULE_PROFILES.md",
  "scripts/generate-ad03-regional-panchang-rule-profiles.mjs",
  "scripts/validate-ad03-regional-panchang-rule-profiles.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ad02Review = readJson("data/content-intelligence/quality-reviews/ad02-panchanga-ontology-canonical-field-model.json");
const ad02RegionalPlaceholder = readJson("data/content-intelligence/ad-foundation/ad02-regional-profile-placeholder-map.json");
const ad02NoMutationAudit = readJson("data/content-intelligence/backend-architecture/ad02-no-mutation-audit-register.json");
const ad02Readiness = readJson("data/content-intelligence/quality-registry/ad02-ad03-regional-panchang-rule-profile-readiness-record.json");
const ad02Boundary = readJson("data/content-intelligence/mutation-plans/ad02-to-ad03-regional-panchang-rule-profiles-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ad03-regional-panchang-rule-profiles.json");
const regionalProfileDoctrine = readJson("data/content-intelligence/ad-foundation/ad03-regional-panchang-rule-profile-doctrine.json");
const northIndiaProfile = readJson("data/content-intelligence/ad-foundation/ad03-north-india-general-rule-profile.json");
const eastIndiaBiharMithilaProfile = readJson("data/content-intelligence/ad-foundation/ad03-east-india-bihar-mithila-rule-profile.json");
const southIndianPanchangamProfile = readJson("data/content-intelligence/ad-foundation/ad03-south-indian-panchangam-rule-profile.json");
const locationSunriseProfile = readJson("data/content-intelligence/ad-foundation/ad03-location-specific-sunrise-rule-profile.json");
const regionalDifferenceMatrix = readJson("data/content-intelligence/ad-foundation/ad03-regional-difference-decision-matrix.json");
const sourceRequirementMap = readJson("data/content-intelligence/ad-foundation/ad03-regional-source-requirement-map.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ad03-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ad03-ad04-calendar-calculation-methodology-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ad03-to-ad04-calendar-calculation-methodology-boundary.json");
const preview = readJson("data/quality/ad03-regional-panchang-rule-profiles-preview.json");
const pkg = readJson("package.json");

if (ad02Review.status !== "panchanga_ontology_canonical_field_model_ready_for_ad03") fail("AD02 review status mismatch.");
if (ad02Review.summary.ready_for_ad03 !== true) fail("AD02 readiness summary missing.");
if (ad02NoMutationAudit.audit_passed !== true) fail("AD02 no-mutation audit must pass.");
if (ad02Readiness.ready_for_ad03 !== true) fail("AD02 readiness must permit AD03.");
if (ad02Boundary.next_stage_id !== "AD03") fail("AD02 boundary must point to AD03.");
for (const profile of ["north_india_general", "east_india_bihar_mithila", "south_indian_panchangam", "location_specific_sunrise_profile"]) {
  if (!JSON.stringify(ad02RegionalPlaceholder).includes(profile)) fail(`AD02 placeholder missing: ${profile}`);
}

if (review.status !== "regional_panchang_rule_profiles_ready_for_ad04") fail("AD03 review status mismatch.");
for (const key of [
  "ad03_regional_panchang_rule_profiles_recorded",
  "ad02_consumed",
  "regional_profile_doctrine_recorded",
  "north_india_profile_recorded",
  "east_india_bihar_mithila_profile_recorded",
  "south_indian_panchangam_profile_recorded",
  "location_specific_sunrise_profile_recorded",
  "regional_difference_matrix_recorded",
  "source_requirement_map_recorded",
  "ready_for_ad04"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_ad04 !== 0) fail("AD04 blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "panchang_prediction_generated", "panchang_calculation_executed", "festival_date_finalised", "regional_rule_applied_to_public_output", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (regionalProfileDoctrine.status !== "regional_panchang_rule_profile_doctrine_recorded") fail("Regional profile doctrine status mismatch.");
for (const profile of ["north_india_general", "east_india_bihar_mithila", "south_indian_panchangam", "location_specific_sunrise_profile"]) {
  if (!regionalProfileDoctrine.profile_groups.includes(profile)) fail(`Profile group missing: ${profile}`);
}
if (!JSON.stringify(regionalProfileDoctrine.doctrine_rules).includes("Regional differences are not errors")) fail("Regional differences doctrine missing.");
if (!JSON.stringify(regionalProfileDoctrine.doctrine_rules).includes("AD03 records rule-profile planning only")) fail("Planning-only doctrine missing.");

if (northIndiaProfile.status !== "north_india_general_rule_profile_recorded") fail("North India profile status mismatch.");
if (northIndiaProfile.regional_profile_id !== "north_india_general") fail("North India profile id mismatch.");
for (const phrase of ["Uttar Pradesh", "Kashi", "purnimanta", "sunrise tithi"]) {
  if (!JSON.stringify(northIndiaProfile).includes(phrase)) fail(`North India phrase missing: ${phrase}`);
}

if (eastIndiaBiharMithilaProfile.status !== "east_india_bihar_mithila_rule_profile_recorded") fail("East India/Bihar/Mithila profile status mismatch.");
if (eastIndiaBiharMithilaProfile.regional_profile_id !== "east_india_bihar_mithila") fail("East India profile id mismatch.");
for (const phrase of ["Bihar", "Mithila", "regional observance", "festival_vrata_decision_rule"]) {
  if (!JSON.stringify(eastIndiaBiharMithilaProfile).includes(phrase)) fail(`East India/Bihar/Mithila phrase missing: ${phrase}`);
}

if (southIndianPanchangamProfile.status !== "south_indian_panchangam_rule_profile_recorded") fail("South Indian profile status mismatch.");
if (southIndianPanchangamProfile.regional_profile_id !== "south_indian_panchangam") fail("South Indian profile id mismatch.");
for (const phrase of ["Tamil", "Telugu", "Kannada", "Malayalam", "amanta"]) {
  if (!JSON.stringify(southIndianPanchangamProfile).includes(phrase)) fail(`South Indian phrase missing: ${phrase}`);
}

if (locationSunriseProfile.status !== "location_specific_sunrise_rule_profile_recorded") fail("Location sunrise profile status mismatch.");
if (locationSunriseProfile.regional_profile_id !== "location_specific_sunrise_profile") fail("Location sunrise profile id mismatch.");
for (const field of ["latitude", "longitude", "timezone", "sunrise_reference", "local_day_start", "calculation_profile_id", "regional_profile_id"]) {
  if (!locationSunriseProfile.context_fields_required.includes(field)) fail(`Location context field missing: ${field}`);
}
if (!JSON.stringify(locationSunriseProfile.doctrine_rules).includes("AD03 does not calculate sunrise")) fail("No sunrise calculation rule missing.");

if (regionalDifferenceMatrix.status !== "regional_difference_decision_matrix_recorded") fail("Regional difference matrix status mismatch.");
for (const diff of ["amanta_vs_purnimanta_masa", "sunrise_tithi_vs_time_window_rule", "regional_festival_observance_variation", "language_and_display_convention", "place_based_sunrise_difference"]) {
  if (!JSON.stringify(regionalDifferenceMatrix.difference_types).includes(diff)) fail(`Difference type missing: ${diff}`);
}

if (sourceRequirementMap.status !== "regional_source_requirement_map_recorded") fail("Source requirement map status mismatch.");
for (const field of ["source_id", "source_title", "region_or_tradition", "supported_rule", "confidence_band", "verification_status"]) {
  if (!sourceRequirementMap.required_source_metadata.includes(field)) fail(`Source metadata field missing: ${field}`);
}
if (!JSON.stringify(sourceRequirementMap.source_rules).includes("Nityanand Mishra ji style discipline")) fail("Nityanand source rule missing.");
if (!JSON.stringify(sourceRequirementMap.source_rules).includes("cannot be used for final seed data")) fail("Unverified source restriction missing.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ad03") fail("No-mutation status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.status !== "ready_for_ad04_calendar_calculation_methodology") fail("Readiness status mismatch.");
if (readiness.ready_for_ad04 !== true) fail("Readiness must permit AD04.");
if (readiness.next_stage_id !== "AD04") fail("Readiness next stage must be AD04.");
if (readiness.ag47_resume_allowed_next !== false) fail("AG47 resume must remain blocked.");
if (readiness.panchang_prediction_allowed_next !== false) fail("Panchang prediction must remain blocked.");
if (readiness.panchang_calculation_allowed_next !== false) fail("Panchang calculation must remain blocked.");
if (readiness.sql_creation_allowed_next !== false) fail("SQL creation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AD04") fail("Boundary must point to AD04.");
if (!JSON.stringify(boundary.allowed_scope).includes("calculation methodology boundaries")) fail("Calculation methodology boundary missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("without executing calculations")) fail("No calculation execution boundary missing.");
if (!boundary.blocked_scope.includes("Panchang calculation execution")) fail("Panchang calculation blocked scope missing.");
if (!boundary.blocked_scope.includes("SQL execution")) fail("SQL execution blocked scope missing.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role exposure blocked scope missing.");

for (const key of [
  "ad03_regional_panchang_rule_profiles_recorded",
  "ad02_consumed",
  "regional_profile_doctrine_recorded",
  "north_india_profile_recorded",
  "east_india_bihar_mithila_profile_recorded",
  "south_indian_panchangam_profile_recorded",
  "location_specific_sunrise_profile_recorded",
  "regional_difference_matrix_recorded",
  "source_requirement_map_recorded",
  "ready_for_ad04"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_ad04 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "panchang_prediction_generated", "panchang_calculation_executed", "festival_date_finalised", "regional_rule_applied_to_public_output", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ad03"]) fail("Missing package script: generate:ad03");
if (!pkg.scripts?.["validate:ad03"]) fail("Missing package script: validate:ad03");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ad03")) fail("validate:project must include validate:ad03.");

pass("AD03 Regional Panchang Rule Profiles is present.");
pass("AD02 Panchanga ontology is consumed.");
pass("Regional profile doctrine is valid.");
pass("North India rule profile is valid.");
pass("East India / Bihar / Mithila rule profile is valid.");
pass("South Indian Panchangam rule profile is valid.");
pass("Location-specific sunrise profile is valid.");
pass("Regional difference decision matrix is valid.");
pass("Regional source requirement map is valid.");
pass("No-mutation audit is valid.");
pass("AD04 Classical Astronomical and Calendar Calculation Methodology readiness is valid.");
pass("No AG47 resume, Panchang calculation, prediction, SQL, DB write, backend activation, deployment or service-role exposure is recorded.");
