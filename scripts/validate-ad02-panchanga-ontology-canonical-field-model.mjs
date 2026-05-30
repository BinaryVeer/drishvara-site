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
  console.error(`❌ AD02 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ad01-source-authenticity-regional-acceptance-doctrine.json",
  "data/content-intelligence/ad-foundation/ad01-source-authenticity-hierarchy.json",
  "data/content-intelligence/ad-foundation/ad01-regional-acceptance-doctrine.json",
  "data/content-intelligence/ad-foundation/ad01-classical-panchanga-basis-register.json",
  "data/content-intelligence/ad-foundation/ad01-source-confidence-model.json",
  "data/content-intelligence/ad-foundation/ad01-attribution-and-claim-boundary.json",
  "data/content-intelligence/backend-architecture/ad01-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad01-ad02-panchanga-ontology-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad01-to-ad02-panchanga-ontology-boundary.json",
  "data/content-intelligence/ad-foundation/ad00-database-first-doctrine.json",
  "data/content-intelligence/ad-foundation/ad00-kala-drishti-method-name-record.json",

  "data/content-intelligence/quality-reviews/ad02-panchanga-ontology-canonical-field-model.json",
  "data/content-intelligence/ad-foundation/ad02-panchanga-canonical-ontology.json",
  "data/content-intelligence/ad-foundation/ad02-panchanga-core-element-model.json",
  "data/content-intelligence/ad-foundation/ad02-panchanga-supporting-field-model.json",
  "data/content-intelligence/ad-foundation/ad02-time-location-calculation-context-model.json",
  "data/content-intelligence/ad-foundation/ad02-label-display-and-language-model.json",
  "data/content-intelligence/ad-foundation/ad02-regional-profile-placeholder-map.json",
  "data/content-intelligence/ad-foundation/ad02-database-field-planning-map.json",
  "data/content-intelligence/backend-architecture/ad02-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad02-ad03-regional-panchang-rule-profile-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad02-to-ad03-regional-panchang-rule-profiles-boundary.json",
  "data/quality/ad02-panchanga-ontology-canonical-field-model.json",
  "data/quality/ad02-panchanga-ontology-canonical-field-model-preview.json",
  "docs/quality/AD02_PANCHANGA_ONTOLOGY_CANONICAL_FIELD_MODEL.md",
  "scripts/generate-ad02-panchanga-ontology-canonical-field-model.mjs",
  "scripts/validate-ad02-panchanga-ontology-canonical-field-model.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ad01Review = readJson("data/content-intelligence/quality-reviews/ad01-source-authenticity-regional-acceptance-doctrine.json");
const ad01ClassicalBasis = readJson("data/content-intelligence/ad-foundation/ad01-classical-panchanga-basis-register.json");
const ad01NoMutationAudit = readJson("data/content-intelligence/backend-architecture/ad01-no-mutation-audit-register.json");
const ad01Readiness = readJson("data/content-intelligence/quality-registry/ad01-ad02-panchanga-ontology-readiness-record.json");
const ad01Boundary = readJson("data/content-intelligence/mutation-plans/ad01-to-ad02-panchanga-ontology-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ad02-panchanga-ontology-canonical-field-model.json");
const canonicalOntology = readJson("data/content-intelligence/ad-foundation/ad02-panchanga-canonical-ontology.json");
const coreElementModel = readJson("data/content-intelligence/ad-foundation/ad02-panchanga-core-element-model.json");
const supportingFieldModel = readJson("data/content-intelligence/ad-foundation/ad02-panchanga-supporting-field-model.json");
const timeLocationModel = readJson("data/content-intelligence/ad-foundation/ad02-time-location-calculation-context-model.json");
const labelDisplayModel = readJson("data/content-intelligence/ad-foundation/ad02-label-display-and-language-model.json");
const regionalProfilePlaceholder = readJson("data/content-intelligence/ad-foundation/ad02-regional-profile-placeholder-map.json");
const databaseFieldPlanningMap = readJson("data/content-intelligence/ad-foundation/ad02-database-field-planning-map.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ad02-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ad02-ad03-regional-panchang-rule-profile-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ad02-to-ad03-regional-panchang-rule-profiles-boundary.json");
const preview = readJson("data/quality/ad02-panchanga-ontology-canonical-field-model-preview.json");
const pkg = readJson("package.json");

if (ad01Review.status !== "source_authenticity_regional_acceptance_doctrine_ready_for_ad02") fail("AD01 review status mismatch.");
if (ad01Review.summary.ready_for_ad02 !== true) fail("AD01 readiness summary missing.");
if (ad01NoMutationAudit.audit_passed !== true) fail("AD01 no-mutation audit must pass.");
if (ad01Readiness.ready_for_ad02 !== true) fail("AD01 readiness must permit AD02.");
if (ad01Boundary.next_stage_id !== "AD02") fail("AD01 boundary must point to AD02.");
for (const element of ["tithi", "vara", "nakshatra", "yoga", "karana"]) {
  if (!JSON.stringify(ad01ClassicalBasis.core_panchanga_elements).includes(element)) fail(`AD01 classical basis missing: ${element}`);
}

if (review.status !== "panchanga_ontology_canonical_field_model_ready_for_ad03") fail("AD02 review status mismatch.");
for (const key of [
  "ad02_panchanga_ontology_recorded",
  "ad01_consumed",
  "core_panchanga_elements_recorded",
  "supporting_panchanga_fields_recorded",
  "time_location_context_recorded",
  "label_display_language_model_recorded",
  "regional_profile_placeholder_recorded",
  "database_field_planning_map_recorded",
  "ready_for_ad03"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_ad03 !== 0) fail("AD03 blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "panchang_prediction_generated", "panchang_calculation_executed", "panchang_daily_record_seeded", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (canonicalOntology.status !== "panchanga_canonical_ontology_recorded") fail("Canonical ontology status mismatch.");
for (const group of ["panchanga_core_elements", "time_and_location_context", "calendar_context", "regional_profile_context", "source_and_review_context"]) {
  if (!canonicalOntology.core_element_groups.includes(group)) fail(`Canonical ontology group missing: ${group}`);
}
if (!JSON.stringify(canonicalOntology.canonical_principles).includes("Separate concept identity from calculation method")) fail("Concept/calculation separation principle missing.");

if (coreElementModel.status !== "panchanga_core_element_model_recorded") fail("Core element model status mismatch.");
for (const element of ["tithi", "vara", "nakshatra", "yoga", "karana"]) {
  if (!JSON.stringify(coreElementModel.elements).includes(`"key":"${element}"`) && !JSON.stringify(coreElementModel.elements).includes(`"key": "${element}"`)) fail(`Core element missing: ${element}`);
}
for (const label of ["तिथि", "नक्षत्र", "योग", "करण"]) {
  if (!JSON.stringify(coreElementModel.elements).includes(label)) fail(`Sanskrit label missing: ${label}`);
}
if (!JSON.stringify(coreElementModel.elements).includes("ad04_calculation_note_required")) fail("AD04 calculation note requirement missing.");

if (supportingFieldModel.status !== "panchanga_supporting_field_model_recorded") fail("Supporting field model status mismatch.");
for (const field of ["sunrise", "sunset", "moonrise", "moonset", "paksha", "masa", "samvat", "ayana", "ritu", "rahu_kala", "abhijit_muhurta", "chandrabalam", "tarabalam", "regional_profile_id", "calculation_profile_id"]) {
  if (!JSON.stringify(supportingFieldModel.supporting_fields).includes(field)) fail(`Supporting field missing: ${field}`);
}

if (timeLocationModel.status !== "time_location_calculation_context_recorded") fail("Time/location model status mismatch.");
for (const field of ["location_id", "latitude", "longitude", "timezone", "sunrise_reference", "calculation_profile_id", "regional_profile_id"]) {
  if (!JSON.stringify(timeLocationModel.context_fields).includes(field)) fail(`Time/location field missing: ${field}`);
}
if (!JSON.stringify(timeLocationModel.doctrine_rules).includes("AD02 does not calculate")) fail("No-calculation doctrine missing.");

if (labelDisplayModel.status !== "label_display_language_model_recorded") fail("Label display model status mismatch.");
for (const layer of ["internal_key", "sanskrit_devanagari_label", "english_label", "public_explanation", "editorial_guidance_text"]) {
  if (!JSON.stringify(labelDisplayModel.label_layers).includes(layer)) fail(`Label layer missing: ${layer}`);
}
if (!JSON.stringify(labelDisplayModel.doctrine_rules).includes("Public labels must not expose internal developer keys")) fail("Internal key public exposure rule missing.");

if (regionalProfilePlaceholder.status !== "regional_profile_placeholder_map_recorded") fail("Regional profile placeholder status mismatch.");
for (const profile of ["north_india_general", "east_india_bihar_mithila", "south_indian_panchangam", "location_specific_sunrise_profile"]) {
  if (!JSON.stringify(regionalProfilePlaceholder.profiles_to_define_in_ad03).includes(profile)) fail(`Regional placeholder missing: ${profile}`);
}

if (databaseFieldPlanningMap.status !== "database_field_planning_map_recorded") fail("Database planning map status mismatch.");
for (const table of ["panchang_element_master", "panchang_daily_records", "regional_calendar_profiles", "source_authorities", "methodology_notes"]) {
  if (!JSON.stringify(databaseFieldPlanningMap.planned_tables_no_sql).includes(table)) fail(`Planned table missing: ${table}`);
}
if (!JSON.stringify(databaseFieldPlanningMap.field_mapping_principles).includes("AD02 creates no SQL file")) fail("No SQL planning principle missing.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ad02") fail("No-mutation status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.status !== "ready_for_ad03_regional_panchang_rule_profiles") fail("Readiness status mismatch.");
if (readiness.ready_for_ad03 !== true) fail("Readiness must permit AD03.");
if (readiness.next_stage_id !== "AD03") fail("Readiness next stage must be AD03.");
if (readiness.ag47_resume_allowed_next !== false) fail("AG47 resume must remain blocked.");
if (readiness.panchang_prediction_allowed_next !== false) fail("Panchang prediction must remain blocked.");
if (readiness.panchang_calculation_allowed_next !== false) fail("Panchang calculation must remain blocked.");
if (readiness.sql_creation_allowed_next !== false) fail("SQL creation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AD03") fail("Boundary must point to AD03.");
if (!JSON.stringify(boundary.allowed_scope).includes("North India")) fail("North India boundary missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("Bihar/Mithila/East India")) fail("Bihar/Mithila boundary missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("South Indian Panchangam")) fail("South Indian boundary missing.");
if (!boundary.blocked_scope.includes("Panchang calculation execution")) fail("Panchang calculation blocked scope missing.");
if (!boundary.blocked_scope.includes("SQL execution")) fail("SQL execution blocked scope missing.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role exposure blocked scope missing.");

for (const key of [
  "ad02_panchanga_ontology_recorded",
  "ad01_consumed",
  "core_panchanga_elements_recorded",
  "supporting_panchanga_fields_recorded",
  "time_location_context_recorded",
  "label_display_language_model_recorded",
  "regional_profile_placeholder_recorded",
  "database_field_planning_map_recorded",
  "ready_for_ad03"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_ad03 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "panchang_prediction_generated", "panchang_calculation_executed", "panchang_daily_record_seeded", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ad02"]) fail("Missing package script: generate:ad02");
if (!pkg.scripts?.["validate:ad02"]) fail("Missing package script: validate:ad02");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ad02")) fail("validate:project must include validate:ad02.");

pass("AD02 Panchanga Ontology and Canonical Field Model is present.");
pass("AD01 source doctrine is consumed.");
pass("Canonical Panchanga ontology is valid.");
pass("Tithi, Vara, Nakshatra, Yoga and Karana core element model is valid.");
pass("Supporting Panchanga field model is valid.");
pass("Time/location/calculation context model is valid.");
pass("Label/display/language model is valid.");
pass("Regional profile placeholder map is valid.");
pass("Database field planning map is valid without SQL.");
pass("No-mutation audit is valid.");
pass("AD03 Regional Panchang Rule Profiles readiness is valid.");
pass("No AG47 resume, Panchang calculation, prediction, SQL, DB write, backend activation, deployment or service-role exposure is recorded.");
