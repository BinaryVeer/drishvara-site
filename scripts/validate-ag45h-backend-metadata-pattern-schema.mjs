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
  console.error(`❌ AG45H validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag45a-daily-signal-metadata-schema-plan.json",
  "data/content-intelligence/daily-surface/ag45c-daily-signal-selection-model.json",
  "data/content-intelligence/daily-surface/ag45c-topic-diversity-inference-scoring-model.json",
  "data/content-intelligence/daily-surface/ag45d-signal-inference-metadata-map.json",
  "data/content-intelligence/daily-surface/ag45e-verification-status-bands-model.json",
  "data/content-intelligence/daily-surface/ag45f-future-video-generator-source-learning-model.json",
  "data/content-intelligence/quality-reviews/ag45g-homepage-card-transition-behaviour.json",
  "data/content-intelligence/homepage/ag45g-homepage-daily-signal-space-model.json",
  "data/content-intelligence/homepage/ag45g-signal-card-grouping-model.json",
  "data/content-intelligence/backend-architecture/ag45g-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45g-backend-metadata-pattern-schema-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45g-to-ag45h-backend-metadata-pattern-schema-boundary.json",
  "scripts/validate-ag27-supabase-auth-backend-decision-checkpoint.mjs",

  "data/content-intelligence/quality-reviews/ag45h-backend-metadata-pattern-schema.json",
  "data/content-intelligence/backend-architecture/ag45h-daily-signal-metadata-schema-plan.json",
  "data/content-intelligence/backend-architecture/ag45h-yearly-pattern-study-schema-plan.json",
  "data/content-intelligence/daily-surface/ag45h-inference-traceability-model.json",
  "data/content-intelligence/backend-architecture/ag45h-retention-privacy-safety-model.json",
  "data/content-intelligence/backend-architecture/ag45h-backend-activation-deferral-register.json",
  "data/content-intelligence/backend-architecture/ag45h-no-sql-no-db-write-audit.json",
  "data/content-intelligence/backend-architecture/ag45h-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45h-legal-safety-reputation-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45h-to-ag45i-legal-safety-reputation-audit-boundary.json",
  "data/quality/ag45h-backend-metadata-pattern-schema.json",
  "data/quality/ag45h-backend-metadata-pattern-schema-preview.json",
  "docs/quality/AG45H_BACKEND_METADATA_PATTERN_SCHEMA.md",
  "scripts/generate-ag45h-backend-metadata-pattern-schema.mjs",
  "scripts/validate-ag45h-backend-metadata-pattern-schema.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag45aBackendSchemaPlan = readJson("data/content-intelligence/backend-architecture/ag45a-daily-signal-metadata-schema-plan.json");
const ag45cSelectionModel = readJson("data/content-intelligence/daily-surface/ag45c-daily-signal-selection-model.json");
const ag45cDiversityScoring = readJson("data/content-intelligence/daily-surface/ag45c-topic-diversity-inference-scoring-model.json");
const ag45dMetadataMap = readJson("data/content-intelligence/daily-surface/ag45d-signal-inference-metadata-map.json");
const ag45eVerificationStatusModel = readJson("data/content-intelligence/daily-surface/ag45e-verification-status-bands-model.json");
const ag45fFutureVideoGeneratorModel = readJson("data/content-intelligence/daily-surface/ag45f-future-video-generator-source-learning-model.json");
const ag45gReview = readJson("data/content-intelligence/quality-reviews/ag45g-homepage-card-transition-behaviour.json");
const ag45gHomepageSpaceModel = readJson("data/content-intelligence/homepage/ag45g-homepage-daily-signal-space-model.json");
const ag45gCardGroupingModel = readJson("data/content-intelligence/homepage/ag45g-signal-card-grouping-model.json");
const ag45gNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45g-no-mutation-audit-register.json");
const ag45gReadiness = readJson("data/content-intelligence/quality-registry/ag45g-backend-metadata-pattern-schema-readiness-record.json");
const ag45gBoundary = readJson("data/content-intelligence/mutation-plans/ag45g-to-ag45h-backend-metadata-pattern-schema-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag45h-backend-metadata-pattern-schema.json");
const metadataSchemaPlan = readJson("data/content-intelligence/backend-architecture/ag45h-daily-signal-metadata-schema-plan.json");
const yearlyPatternSchemaPlan = readJson("data/content-intelligence/backend-architecture/ag45h-yearly-pattern-study-schema-plan.json");
const inferenceTraceabilityModel = readJson("data/content-intelligence/daily-surface/ag45h-inference-traceability-model.json");
const retentionSafetyModel = readJson("data/content-intelligence/backend-architecture/ag45h-retention-privacy-safety-model.json");
const backendDeferralRegister = readJson("data/content-intelligence/backend-architecture/ag45h-backend-activation-deferral-register.json");
const noSqlDbWriteAudit = readJson("data/content-intelligence/backend-architecture/ag45h-no-sql-no-db-write-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45h-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag45h-legal-safety-reputation-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag45h-to-ag45i-legal-safety-reputation-audit-boundary.json");
const preview = readJson("data/quality/ag45h-backend-metadata-pattern-schema-preview.json");
const pkg = readJson("package.json");

for (const field of ["date", "rank", "region_scope", "drishvara_title", "drishvara_subtitle", "source_url", "canonical_url", "credibility_score", "theme_tags", "inference_tags", "pattern_value", "reference_value", "verification_status"]) {
  if (!ag45aBackendSchemaPlan.planned_fields.includes(field)) fail(`AG45A planned field missing: ${field}`);
}
if (ag45cSelectionModel.selection_count.total_daily_signals !== 10) fail("AG45C signal count must be 10.");
if (!JSON.stringify(ag45cDiversityScoring).includes("inference_value_for_future_articles")) fail("AG45C inference scoring missing.");
if (!JSON.stringify(ag45dMetadataMap).includes("inference_tags")) fail("AG45D inference tags missing.");
if (ag45eVerificationStatusModel.default_status_for_ag45e !== "metadata_only_not_fetched") fail("AG45E default verification status mismatch.");
if (ag45fFutureVideoGeneratorModel.metadata_only_now !== true) fail("AG45F future generator model must remain metadata-only.");
if (ag45gReview.status !== "homepage_card_transition_behaviour_ready_for_ag45h") fail("AG45G review status mismatch.");
if (ag45gReview.summary.ready_for_ag45h !== true) fail("AG45G readiness summary missing.");
if (ag45gHomepageSpaceModel.activate_now !== false) fail("AG45G homepage must not activate.");
if (ag45gCardGroupingModel.total_signal_count !== 10) fail("AG45G must preserve 10 stored signals.");
if (ag45gCardGroupingModel.visible_cards_at_once !== 3) fail("AG45G must preserve 3 visible cards.");
if (ag45gNoMutationAudit.status !== "no_mutation_audit_passed_for_ag45g") fail("AG45G no-mutation audit mismatch.");
if (ag45gReadiness.ready_for_ag45h !== true) fail("AG45G readiness must permit AG45H.");
if (ag45gBoundary.next_stage_id !== "AG45H") fail("AG45G boundary must point to AG45H.");

if (review.status !== "backend_metadata_pattern_schema_ready_for_ag45i") fail("Review status mismatch.");
if (review.summary.ag45h_backend_metadata_pattern_schema_recorded !== true) fail("AG45H summary flag missing.");
if (review.summary.metadata_schema_plan_recorded !== true) fail("Metadata schema summary missing.");
if (review.summary.yearly_pattern_study_schema_recorded !== true) fail("Yearly pattern summary missing.");
if (review.summary.inference_traceability_model_recorded !== true) fail("Inference traceability summary missing.");
if (review.summary.retention_privacy_safety_model_recorded !== true) fail("Retention/privacy/safety summary missing.");
if (review.summary.backend_activation_deferral_recorded !== true) fail("Backend deferral summary missing.");
if (review.summary.no_sql_no_db_write_audit_recorded !== true) fail("No SQL/DB audit summary missing.");
if (review.summary.ready_for_ag45i !== true) fail("AG45I readiness missing.");
if (review.summary.hard_blocker_count_for_ag45i !== 0) fail("AG45I blocker count must be zero.");
if (review.summary.sql_file_created !== false) fail("SQL file creation must be false.");
if (review.summary.sql_migration_created !== false) fail("SQL migration creation must be false.");
if (review.summary.database_write_performed !== false) fail("Database write must be false.");
if (review.summary.supabase_table_created !== false) fail("Supabase table creation must be false.");
if (review.summary.backend_auth_supabase_activation_performed !== false) fail("Backend activation must be false.");
if (review.summary.service_role_key_exposed !== false) fail("Service-role exposure must be false.");

if (metadataSchemaPlan.status !== "daily_signal_metadata_schema_plan_recorded_no_sql_no_db_write") fail("Metadata schema plan status mismatch.");
if (metadataSchemaPlan.table_creation_now !== false) fail("Table creation must be false.");
if (metadataSchemaPlan.sql_creation_now !== false) fail("SQL creation must be false.");
if (metadataSchemaPlan.database_write_now !== false) fail("Database write now must be false.");
if (metadataSchemaPlan.backend_activation_now !== false) fail("Backend activation now must be false.");
for (const field of ["signal_id", "drishvara_title", "source_url", "image_credit", "video_credit", "inference_tags", "pattern_value", "verification_status"]) {
  if (!JSON.stringify(metadataSchemaPlan.planned_field_groups).includes(field)) fail(`Metadata schema field missing: ${field}`);
}

if (yearlyPatternSchemaPlan.status !== "yearly_pattern_study_schema_recorded_no_sql_no_db_write") fail("Yearly pattern schema status mismatch.");
for (const windowName of ["daily", "monthly", "quarterly", "half_yearly", "yearly"]) {
  if (!yearlyPatternSchemaPlan.analysis_windows.includes(windowName)) fail(`Analysis window missing: ${windowName}`);
}
if (!yearlyPatternSchemaPlan.planned_pattern_fields.includes("source_diversity")) fail("Source diversity pattern field missing.");
if (!yearlyPatternSchemaPlan.northeast_specific_pattern_fields.includes("northeast_daily_presence_rate")) fail("Northeast presence pattern field missing.");
if (!JSON.stringify(yearlyPatternSchemaPlan.future_use_cases).includes("future article planning")) fail("Future article planning use case missing.");

if (inferenceTraceabilityModel.status !== "inference_traceability_model_recorded") fail("Inference traceability status mismatch.");
for (const step of ["source_credibility_result", "drishvara_title", "drishvara_subtitle", "source_attribution", "theme_tags", "verification_status"]) {
  if (!inferenceTraceabilityModel.trace_chain.includes(step)) fail(`Trace chain step missing: ${step}`);
}
if (!JSON.stringify(inferenceTraceabilityModel.safeguards).includes("Do not create new factual claims from metadata alone")) fail("No new factual claims safeguard missing.");

if (retentionSafetyModel.status !== "retention_privacy_safety_model_recorded") fail("Retention safety status mismatch.");
if (retentionSafetyModel.data_scope.public_source_metadata_only !== true) fail("Public source metadata-only scope missing.");
if (retentionSafetyModel.data_scope.personal_user_data_included !== false) fail("Personal user data must be false.");
if (retentionSafetyModel.data_scope.raw_scraped_article_text_included !== false) fail("Raw scraped article text must be false.");
if (!JSON.stringify(retentionSafetyModel.safety_controls).includes("service-role keys must never be recorded")) fail("Service-role key safety control missing.");

if (backendDeferralRegister.status !== "backend_activation_deferred_no_sql_no_db_write") fail("Backend deferral status mismatch.");
for (const stage of ["AG49", "AG52", "AG55", "AG56"]) {
  if (!backendDeferralRegister.deferred_to_later_stages.includes(stage)) fail(`Deferred stage missing: ${stage}`);
}
if (!JSON.stringify(backendDeferralRegister.deferral_rules).includes("No Supabase table is created")) fail("No Supabase table rule missing.");
if (!JSON.stringify(backendDeferralRegister.deferral_rules).includes("No SQL migration is created")) fail("No SQL migration rule missing.");

if (noSqlDbWriteAudit.status !== "no_sql_no_database_write_audit_passed_for_ag45h") fail("No SQL/DB audit status mismatch.");
if (noSqlDbWriteAudit.audit_passed !== true) fail("No SQL/DB audit must pass.");
if (noSqlDbWriteAudit.failed_checks.length !== 0) fail("No SQL/DB audit failed checks must be zero.");
for (const check of noSqlDbWriteAudit.checks) {
  if (check.passed !== true) fail(`No SQL/DB audit check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag45h") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag45i !== true) fail("Readiness must permit AG45I.");
if (readiness.next_stage_id !== "AG45I") fail("Readiness next stage must be AG45I.");
if (readiness.sql_creation_allowed_next !== false) fail("SQL creation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG45I") fail("Boundary must point to AG45I.");

if (preview.ag45h_backend_metadata_pattern_schema_recorded !== 1) fail("Preview AG45H flag missing.");
if (preview.metadata_schema_plan_recorded !== 1) fail("Preview metadata schema flag missing.");
if (preview.yearly_pattern_study_schema_recorded !== 1) fail("Preview yearly pattern flag missing.");
if (preview.inference_traceability_model_recorded !== 1) fail("Preview inference traceability flag missing.");
if (preview.backend_activation_deferral_recorded !== 1) fail("Preview backend deferral flag missing.");
if (preview.no_sql_no_db_write_audit_recorded !== 1) fail("Preview no SQL/DB audit flag missing.");
if (preview.ready_for_ag45i !== 1) fail("Preview AG45I readiness missing.");
if (preview.sql_file_created !== 0) fail("Preview SQL file creation must be zero.");
if (preview.sql_migration_created !== 0) fail("Preview SQL migration must be zero.");
if (preview.database_write_performed !== 0) fail("Preview DB write must be zero.");
if (preview.supabase_table_created !== 0) fail("Preview Supabase table must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Preview backend activation must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be zero.");
if (preview.homepage_mutated !== 0) fail("Preview homepage mutation must be zero.");
if (preview.public_card_rendering_activated !== 0) fail("Preview public card rendering must be zero.");
if (preview.deployment_performed !== 0) fail("Preview deployment must be zero.");

if (!pkg.scripts?.["generate:ag45h"]) fail("Missing package script: generate:ag45h");
if (!pkg.scripts?.["validate:ag45h"]) fail("Missing package script: validate:ag45h");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag45h")) fail("validate:project must include validate:ag45h.");

pass("AG45H Backend Metadata and Yearly Pattern-Study Schema is present.");
pass("AG45G homepage card transition planning is consumed.");
pass("Daily Signal metadata schema plan is valid and planning-only.");
pass("Yearly pattern-study schema is valid.");
pass("Inference traceability model is valid.");
pass("Retention, privacy and safety model is valid.");
pass("Backend activation deferral is valid.");
pass("No SQL / no database write audit is valid.");
pass("No-mutation audit is valid.");
pass("AG45I Legal, Safety and Reputation-Risk Audit readiness is valid.");
pass("No SQL, database write, Supabase table, backend activation, homepage mutation, deployment or service-role exposure is recorded.");
