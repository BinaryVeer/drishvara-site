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
  console.error(`❌ AD00 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag46z-featured-reads-production-strengthening-closure.json",
  "data/content-intelligence/closure-records/ag46z-featured-reads-production-strengthening-closure.json",
  "data/content-intelligence/homepage/ag46z-homepage-three-movement-route-ownership-map.json",
  "data/content-intelligence/quality-registry/ag46z-carry-forward-register.json",
  "data/content-intelligence/backend-architecture/ag46z-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag46z-next-governed-stage-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag46z-to-next-governed-stage-boundary.json",
  "data/content-intelligence/quality-reviews/ag45z-daily-signal-surface-first-light-closure.json",
  "data/content-intelligence/quality-reviews/ag44z-episodic-knowledge-engine-closure.json",

  "data/content-intelligence/quality-reviews/ad00-astro-drishvara-data-foundation-opening.json",
  "data/content-intelligence/reflection-layer/ad00-ag47-pause-record.json",
  "data/content-intelligence/ad-foundation/ad00-astro-drishvara-data-foundation-opening-record.json",
  "data/content-intelligence/ad-foundation/ad00-source-study-intake-register.json",
  "data/content-intelligence/ad-foundation/ad00-existing-supabase-schema-snapshot-record.json",
  "data/content-intelligence/ad-foundation/ad00-database-first-doctrine.json",
  "data/content-intelligence/ad-foundation/ad00-kala-drishti-method-name-record.json",
  "data/content-intelligence/ad-foundation/ad00-ad-series-plan.json",
  "data/content-intelligence/backend-architecture/ad00-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad00-ad01-source-authenticity-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad00-to-ad01-source-authenticity-boundary.json",
  "data/quality/ad00-astro-drishvara-data-foundation-opening.json",
  "data/quality/ad00-astro-drishvara-data-foundation-opening-preview.json",
  "docs/quality/AD00_ASTRO_DRISHVARA_DATA_FOUNDATION_OPENING.md",
  "scripts/generate-ad00-astro-drishvara-data-foundation-opening.mjs",
  "scripts/validate-ad00-astro-drishvara-data-foundation-opening.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag46zReview = readJson("data/content-intelligence/quality-reviews/ag46z-featured-reads-production-strengthening-closure.json");
const ag46zRouteOwnership = readJson("data/content-intelligence/homepage/ag46z-homepage-three-movement-route-ownership-map.json");
const ag46zNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag46z-no-mutation-audit-register.json");
const ag46zReadiness = readJson("data/content-intelligence/quality-registry/ag46z-next-governed-stage-readiness-record.json");
const ag46zBoundary = readJson("data/content-intelligence/mutation-plans/ag46z-to-next-governed-stage-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ad00-astro-drishvara-data-foundation-opening.json");
const ag47PauseRecord = readJson("data/content-intelligence/reflection-layer/ad00-ag47-pause-record.json");
const foundationOpeningRecord = readJson("data/content-intelligence/ad-foundation/ad00-astro-drishvara-data-foundation-opening-record.json");
const sourceStudyIntake = readJson("data/content-intelligence/ad-foundation/ad00-source-study-intake-register.json");
const oldSupabaseSnapshotRecord = readJson("data/content-intelligence/ad-foundation/ad00-existing-supabase-schema-snapshot-record.json");
const databaseFirstDoctrine = readJson("data/content-intelligence/ad-foundation/ad00-database-first-doctrine.json");
const methodologyNameRecord = readJson("data/content-intelligence/ad-foundation/ad00-kala-drishti-method-name-record.json");
const adSeriesPlan = readJson("data/content-intelligence/ad-foundation/ad00-ad-series-plan.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ad00-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ad00-ad01-source-authenticity-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ad00-to-ad01-source-authenticity-boundary.json");
const preview = readJson("data/quality/ad00-astro-drishvara-data-foundation-opening-preview.json");
const pkg = readJson("package.json");

if (ag46zReview.status !== "featured_reads_production_strengthening_closure_ready_for_next_governed_stage") fail("AG46Z review status mismatch.");
if (ag46zReview.summary.reflection_layer_deferred !== true) fail("AG46Z must defer Reflection Layer.");
if (ag46zNoMutationAudit.audit_passed !== true) fail("AG46Z no-mutation audit must pass.");
if (ag46zReadiness.next_stage_id !== "AG47") fail("AG46Z readiness must point to AG47.");
if (ag46zBoundary.next_stage_id !== "AG47") fail("AG46Z boundary must point to AG47.");
if (!JSON.stringify(ag46zRouteOwnership).includes("Reflection Layer is not AG46 scope")) fail("AG46Z route ownership must defer Reflection Layer.");

if (review.status !== "astro_drishvara_data_foundation_opened_ready_for_ad01") fail("AD00 review status mismatch.");
for (const key of [
  "ad00_astro_drishvara_data_foundation_opened",
  "ag47_paused_pending_ad_foundation",
  "ad_series_required_before_ag47_resume",
  "old_supabase_schema_snapshot_preserved_for_later_mapping",
  "database_first_doctrine_recorded",
  "kala_drishti_method_name_recorded",
  "source_study_intake_recorded",
  "ready_for_ad01"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_ad01 !== 0) fail("AD01 blocker count must be zero.");
for (const key of ["ag47_generated", "homepage_mutated", "public_content_generated", "panchang_prediction_generated", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (ag47PauseRecord.status !== "ag47_paused_pending_ad_foundation") fail("AG47 pause record status mismatch.");
if (ag47PauseRecord.paused_stage_id !== "AG47") fail("Paused stage must be AG47.");
if (!JSON.stringify(ag47PauseRecord.resume_condition).includes("ADZ")) fail("AG47 resume condition must require ADZ.");

if (foundationOpeningRecord.status !== "astro_drishvara_data_foundation_opened") fail("Foundation opening status mismatch.");
if (foundationOpeningRecord.foundation_name !== "AD — Astro-Drishvara Data Foundation") fail("Foundation name mismatch.");
if (foundationOpeningRecord.preferred_methodology_name !== "Drishvara Kāla-Dṛṣṭi Method") fail("Methodology name mismatch.");

if (sourceStudyIntake.status !== "source_study_intake_recorded") fail("Source study intake status mismatch.");
for (const phrase of ["Today's Panchang - Shree Salasar Balaji Mandir.pdf", "1998BASI...26...75S.pdf", "nityananda_misra_style_discipline", "Bihar", "Uttar Pradesh", "South Indian Panchangam"]) {
  if (!JSON.stringify(sourceStudyIntake).includes(phrase)) fail(`Source intake phrase missing: ${phrase}`);
}
for (const field of ["tithi_nakshatra_yoga_karana", "chandrabalam_tarabalam", "panchang_day_starts_with_sunrise_note"]) {
  if (!JSON.stringify(sourceStudyIntake).includes(field)) fail(`Panchang field group missing: ${field}`);
}

if (oldSupabaseSnapshotRecord.status !== "existing_supabase_schema_snapshot_preserved_for_later_mapping") fail("Old Supabase snapshot status mismatch.");
for (const table of ["articles", "article_scriptural_references", "media_assets", "contributors", "publication_runs", "locations"]) {
  if (!JSON.stringify(oldSupabaseSnapshotRecord).includes(table)) fail(`Existing Supabase table missing: ${table}`);
}
if (!JSON.stringify(oldSupabaseSnapshotRecord.later_use).includes("AD07")) fail("Old schema must be carried to AD07.");
if (!JSON.stringify(oldSupabaseSnapshotRecord.later_use).includes("AG56")) fail("Old schema must be carried to AG56.");

if (databaseFirstDoctrine.status !== "database_first_doctrine_recorded") fail("Database-first doctrine status mismatch.");
for (const table of ["source_authorities", "panchang_daily_records", "nakshatra_master", "word_corpus", "vedic_guidance_rules", "star_reflection_rules"]) {
  if (!databaseFirstDoctrine.likely_future_tables.includes(table)) fail(`Future AD table missing: ${table}`);
}
if (!JSON.stringify(databaseFirstDoctrine.doctrine_rules).includes("Service-role keys must never be exposed")) fail("Service-role doctrine missing.");

if (methodologyNameRecord.status !== "kala_drishti_method_name_recorded") fail("Methodology name status mismatch.");
if (methodologyNameRecord.method_name !== "Drishvara Kāla-Dṛṣṭi Method") fail("Methodology method_name mismatch.");
if (!JSON.stringify(methodologyNameRecord.internal_method_layers).includes("regional_acceptance_profiles")) fail("Regional acceptance layer missing.");
if (!JSON.stringify(methodologyNameRecord.public_short_explanation_draft).includes("not deterministic prediction")) fail("Non-deterministic wording missing.");

if (adSeriesPlan.status !== "ad_series_plan_recorded") fail("AD series status mismatch.");
for (const stage of ["AD00", "AD01", "AD02", "AD03", "AD04", "AD05", "AD06", "AD07", "AD08", "AD09", "AD10", "ADZ"]) {
  if (!JSON.stringify(adSeriesPlan.sequence).includes(stage)) fail(`AD sequence missing: ${stage}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ad00") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.status !== "ready_for_ad01_source_authenticity_regional_acceptance_doctrine") fail("Readiness status mismatch.");
if (readiness.ready_for_ad01 !== true) fail("Readiness must permit AD01.");
if (readiness.next_stage_id !== "AD01") fail("Readiness next stage must be AD01.");
if (readiness.ag47_resume_allowed_next !== false) fail("AG47 resume must remain blocked.");
if (readiness.sql_creation_allowed_next !== false) fail("SQL creation must remain blocked.");
if (readiness.sql_execution_allowed_next !== false) fail("SQL execution must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AD01") fail("Boundary must point to AD01.");
if (!JSON.stringify(boundary.allowed_scope).includes("Nityanand Mishra ji")) fail("Nityanand Mishra ji boundary missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("Bihar")) fail("Bihar regional boundary missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("South Indian Panchangam")) fail("South Indian boundary missing.");
if (!boundary.blocked_scope.includes("AG47 resume")) fail("AG47 resume block missing.");
if (!boundary.blocked_scope.includes("SQL execution")) fail("SQL execution block missing.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role exposure block missing.");

for (const key of [
  "ad00_astro_drishvara_data_foundation_opened",
  "ag47_paused_pending_ad_foundation",
  "ad_series_required_before_ag47_resume",
  "old_supabase_schema_snapshot_preserved_for_later_mapping",
  "database_first_doctrine_recorded",
  "kala_drishti_method_name_recorded",
  "source_study_intake_recorded",
  "ready_for_ad01"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_ad01 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["ag47_generated", "homepage_mutated", "public_content_generated", "panchang_prediction_generated", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ad00"]) fail("Missing package script: generate:ad00");
if (!pkg.scripts?.["validate:ad00"]) fail("Missing package script: validate:ad00");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ad00")) fail("validate:project must include validate:ad00.");

pass("AD00 Astro-Drishvara Data Foundation Opening is present.");
pass("AG47 is paused pending AD foundation.");
pass("Database-first doctrine is recorded.");
pass("Source-study intake includes Panchang sample, Panchanga research paper, Nityanand Mishra ji style discipline and regional traditions.");
pass("Existing Supabase schema snapshot is preserved for later AD07 / AG49 / AG52 / AG55 / AG56 mapping.");
pass("Drishvara Kāla-Dṛṣṭi Method name is recorded.");
pass("AD series plan is valid.");
pass("No-mutation audit is valid.");
pass("AD01 Source Authenticity and Regional Acceptance Doctrine readiness is valid.");
pass("No AG47 generation, public content generation, SQL, DB write, Supabase/backend activation, deployment or service-role exposure is recorded.");
