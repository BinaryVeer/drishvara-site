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
  console.error(`❌ AD08 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ad07-database-schema-planning.json",
  "data/content-intelligence/ad-foundation/ad07-ad-foundation-table-map.json",
  "data/content-intelligence/ad-foundation/ad07-table-relationship-index-map.json",
  "data/content-intelligence/backend-architecture/ad07-no-sql-no-db-write-audit.json",
  "data/content-intelligence/backend-architecture/ad07-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad07-ad08-seed-data-source-attribution-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad07-to-ad08-seed-data-source-attribution-boundary.json",

  "data/content-intelligence/quality-reviews/ad08-seed-data-source-attribution-register.json",
  "data/content-intelligence/ad-foundation/ad08-seed-data-doctrine.json",
  "data/content-intelligence/ad-foundation/ad08-source-authority-seed-manifest-template.json",
  "data/content-intelligence/ad-foundation/ad08-panchanga-master-seed-manifest-template.json",
  "data/content-intelligence/ad-foundation/ad08-regional-profile-seed-manifest-template.json",
  "data/content-intelligence/ad-foundation/ad08-corpus-seed-manifest-template.json",
  "data/content-intelligence/ad-foundation/ad08-guidance-rule-seed-manifest-template.json",
  "data/content-intelligence/ad-foundation/ad08-attribution-verification-workflow-map.json",
  "data/content-intelligence/backend-architecture/ad08-no-seed-no-fetch-audit.json",
  "data/content-intelligence/backend-architecture/ad08-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad08-ad09-kala-drishti-methodology-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad08-to-ad09-kala-drishti-methodology-boundary.json",
  "data/quality/ad08-seed-data-source-attribution-register.json",
  "data/quality/ad08-seed-data-source-attribution-register-preview.json",
  "docs/quality/AD08_SEED_DATA_SOURCE_ATTRIBUTION_REGISTER.md",
  "scripts/generate-ad08-seed-data-source-attribution-register.mjs",
  "scripts/validate-ad08-seed-data-source-attribution-register.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ad07Review = readJson("data/content-intelligence/quality-reviews/ad07-database-schema-planning.json");
const ad07NoSqlNoDbAudit = readJson("data/content-intelligence/backend-architecture/ad07-no-sql-no-db-write-audit.json");
const ad07NoMutationAudit = readJson("data/content-intelligence/backend-architecture/ad07-no-mutation-audit-register.json");
const ad07Readiness = readJson("data/content-intelligence/quality-registry/ad07-ad08-seed-data-source-attribution-readiness-record.json");
const ad07Boundary = readJson("data/content-intelligence/mutation-plans/ad07-to-ad08-seed-data-source-attribution-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ad08-seed-data-source-attribution-register.json");
const seedDoctrine = readJson("data/content-intelligence/ad-foundation/ad08-seed-data-doctrine.json");
const sourceAuthoritySeedManifest = readJson("data/content-intelligence/ad-foundation/ad08-source-authority-seed-manifest-template.json");
const panchangaMasterSeedManifest = readJson("data/content-intelligence/ad-foundation/ad08-panchanga-master-seed-manifest-template.json");
const regionalProfileSeedManifest = readJson("data/content-intelligence/ad-foundation/ad08-regional-profile-seed-manifest-template.json");
const corpusSeedManifest = readJson("data/content-intelligence/ad-foundation/ad08-corpus-seed-manifest-template.json");
const guidanceSeedManifest = readJson("data/content-intelligence/ad-foundation/ad08-guidance-rule-seed-manifest-template.json");
const attributionVerificationWorkflow = readJson("data/content-intelligence/ad-foundation/ad08-attribution-verification-workflow-map.json");
const noSeedNoFetchAudit = readJson("data/content-intelligence/backend-architecture/ad08-no-seed-no-fetch-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ad08-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ad08-ad09-kala-drishti-methodology-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ad08-to-ad09-kala-drishti-methodology-boundary.json");
const preview = readJson("data/quality/ad08-seed-data-source-attribution-register-preview.json");
const pkg = readJson("package.json");

if (ad07Review.status !== "database_schema_planning_ready_for_ad08") fail("AD07 review status mismatch.");
if (ad07Review.summary.ready_for_ad08 !== true) fail("AD07 readiness summary missing.");
if (ad07NoSqlNoDbAudit.audit_passed !== true) fail("AD07 no SQL/no DB audit must pass.");
if (ad07NoMutationAudit.audit_passed !== true) fail("AD07 no-mutation audit must pass.");
if (ad07Readiness.ready_for_ad08 !== true) fail("AD07 readiness must permit AD08.");
if (ad07Boundary.next_stage_id !== "AD08") fail("AD07 boundary must point to AD08.");

if (review.status !== "seed_data_source_attribution_register_ready_for_ad09") fail("AD08 review status mismatch.");
for (const key of [
  "ad08_seed_data_source_attribution_register_recorded",
  "ad07_consumed",
  "seed_doctrine_recorded",
  "source_authority_seed_manifest_template_recorded",
  "panchanga_master_seed_manifest_template_recorded",
  "regional_profile_seed_manifest_template_recorded",
  "corpus_seed_manifest_template_recorded",
  "guidance_rule_seed_manifest_template_recorded",
  "attribution_verification_workflow_recorded",
  "no_seed_no_fetch_audit_recorded",
  "ready_for_ad09"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_ad09 !== 0) fail("AD09 blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "seed_data_inserted", "seed_data_committed_to_database", "guidance_generated", "word_of_day_generated", "panchang_prediction_generated", "panchang_calculation_executed", "live_source_fetch_executed", "web_scraping_executed", "source_content_downloaded", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (seedDoctrine.status !== "seed_data_doctrine_recorded") fail("Seed doctrine status mismatch.");
for (const family of ["source_authority_seed_candidates", "panchanga_master_seed_candidates", "regional_profile_seed_candidates", "corpus_seed_candidates", "guidance_rule_seed_candidates"]) {
  if (!seedDoctrine.seed_families.includes(family)) fail(`Seed family missing: ${family}`);
}
if (!JSON.stringify(seedDoctrine.doctrine_rules).includes("does not insert seed data")) fail("No seed insertion doctrine missing.");

if (sourceAuthoritySeedManifest.status !== "source_authority_seed_manifest_template_recorded") fail("Source authority seed manifest status mismatch.");
for (const field of ["seed_candidate_id", "source_id", "source_title", "supported_claim", "source_confidence_band", "verification_status", "public_use_allowed"]) {
  if (!sourceAuthoritySeedManifest.template_fields.includes(field)) fail(`Source authority seed field missing: ${field}`);
}
if (sourceAuthoritySeedManifest.no_seed_inserted !== true) fail("Source authority no_seed_inserted must be true.");

if (panchangaMasterSeedManifest.status !== "panchanga_master_seed_manifest_template_recorded") fail("Panchanga master seed manifest status mismatch.");
for (const record of ["tithi_master", "nakshatra_master", "yoga_master", "karana_master", "vara_master", "rashi_master", "muhurta_rules"]) {
  if (!panchangaMasterSeedManifest.planned_record_types.includes(record)) fail(`Panchanga seed record type missing: ${record}`);
}
if (panchangaMasterSeedManifest.no_seed_inserted !== true) fail("Panchanga no_seed_inserted must be true.");

if (regionalProfileSeedManifest.status !== "regional_profile_seed_manifest_template_recorded") fail("Regional profile seed manifest status mismatch.");
for (const profile of ["north_india_general", "east_india_bihar_mithila", "south_indian_panchangam", "location_specific_sunrise_profile"]) {
  if (!regionalProfileSeedManifest.profile_targets.includes(profile)) fail(`Regional profile target missing: ${profile}`);
}
if (regionalProfileSeedManifest.no_seed_inserted !== true) fail("Regional no_seed_inserted must be true.");

if (corpusSeedManifest.status !== "corpus_seed_manifest_template_recorded") fail("Corpus seed manifest status mismatch.");
for (const record of ["word_corpus", "sanskrit_name_corpus", "sutra_quote_corpus", "reflection_prompt_rules"]) {
  if (!corpusSeedManifest.planned_record_types.includes(record)) fail(`Corpus seed record type missing: ${record}`);
}
if (!JSON.stringify(corpusSeedManifest.seed_rules).includes("must not reproduce long copyrighted passages")) fail("Corpus copyright seed rule missing.");
if (corpusSeedManifest.no_seed_inserted !== true) fail("Corpus no_seed_inserted must be true.");

if (guidanceSeedManifest.status !== "guidance_rule_seed_manifest_template_recorded") fail("Guidance seed manifest status mismatch.");
for (const record of ["vedic_guidance_rules", "star_reflection_rules", "guidance_context_links", "claim_risk_register"]) {
  if (!guidanceSeedManifest.planned_record_types.includes(record)) fail(`Guidance seed record type missing: ${record}`);
}
if (!JSON.stringify(guidanceSeedManifest.seed_rules).includes("non-deterministic")) fail("Guidance non-deterministic rule missing.");
if (guidanceSeedManifest.no_seed_inserted !== true) fail("Guidance no_seed_inserted must be true.");

if (attributionVerificationWorkflow.status !== "attribution_verification_workflow_recorded") fail("Attribution workflow status mismatch.");
for (const step of ["candidate_registration", "source_locator_check", "supported_claim_check", "confidence_band_assignment", "copyright_context_check", "claim_risk_safety_check", "editorial_review"]) {
  if (!JSON.stringify(attributionVerificationWorkflow.workflow_steps).includes(step)) fail(`Workflow step missing: ${step}`);
}
for (const blocked of ["candidate_only_to_public_use_without_verification", "source_pending_to_database_seed_without_review", "regional_rule_to_global_output_without_profile_metadata"]) {
  if (!attributionVerificationWorkflow.blocked_transitions.includes(blocked)) fail(`Blocked transition missing: ${blocked}`);
}

if (noSeedNoFetchAudit.status !== "no_seed_no_fetch_audit_passed_for_ad08") fail("No seed/no fetch audit status mismatch.");
if (noSeedNoFetchAudit.audit_passed !== true) fail("No seed/no fetch audit must pass.");
if (noSeedNoFetchAudit.failed_checks.length !== 0) fail("No seed/no fetch audit failed checks must be zero.");
for (const check of noSeedNoFetchAudit.checks) {
  if (check.passed !== true) fail(`No seed/no fetch check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ad08") fail("No-mutation status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.status !== "ready_for_ad09_kala_drishti_methodology_statement") fail("Readiness status mismatch.");
if (readiness.ready_for_ad09 !== true) fail("Readiness must permit AD09.");
if (readiness.next_stage_id !== "AD09") fail("Readiness next stage must be AD09.");
if (readiness.seed_data_insertion_allowed_next !== false) fail("Seed insertion must remain blocked.");
if (readiness.live_fetch_allowed_next !== false) fail("Live fetch must remain blocked.");
if (readiness.sql_creation_allowed_next !== false) fail("SQL creation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AD09") fail("Boundary must point to AD09.");
if (!JSON.stringify(boundary.allowed_scope).includes("Drishvara Kāla-Dṛṣṭi Method")) fail("Kāla-Dṛṣṭi methodology boundary missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("not deterministic prediction")) fail("Non-deterministic methodology boundary missing.");
if (!boundary.blocked_scope.includes("seed data insertion")) fail("Seed insertion blocked scope missing.");
if (!boundary.blocked_scope.includes("SQL execution")) fail("SQL execution blocked scope missing.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role exposure blocked scope missing.");

for (const key of [
  "ad08_seed_data_source_attribution_register_recorded",
  "ad07_consumed",
  "seed_doctrine_recorded",
  "source_authority_seed_manifest_template_recorded",
  "panchanga_master_seed_manifest_template_recorded",
  "regional_profile_seed_manifest_template_recorded",
  "corpus_seed_manifest_template_recorded",
  "guidance_rule_seed_manifest_template_recorded",
  "attribution_verification_workflow_recorded",
  "no_seed_no_fetch_audit_recorded",
  "ready_for_ad09"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_ad09 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "seed_data_inserted", "seed_data_committed_to_database", "guidance_generated", "word_of_day_generated", "panchang_prediction_generated", "panchang_calculation_executed", "live_source_fetch_executed", "web_scraping_executed", "source_content_downloaded", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ad08"]) fail("Missing package script: generate:ad08");
if (!pkg.scripts?.["validate:ad08"]) fail("Missing package script: validate:ad08");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ad08")) fail("validate:project must include validate:ad08.");

pass("AD08 Seed Data and Source Attribution Register is present.");
pass("AD07 database schema planning is consumed.");
pass("Seed data doctrine is valid.");
pass("Source authority seed manifest template is valid.");
pass("Panchanga master seed manifest template is valid.");
pass("Regional profile seed manifest template is valid.");
pass("Corpus seed manifest template is valid.");
pass("Guidance rule seed manifest template is valid.");
pass("Attribution and verification workflow is valid.");
pass("No seed / no fetch audit is valid.");
pass("No-mutation audit is valid.");
pass("AD09 Kāla-Dṛṣṭi Methodology Statement readiness is valid.");
pass("No seed insertion, live fetch, scraping, SQL, DB write, backend activation, deployment or service-role exposure is recorded.");
