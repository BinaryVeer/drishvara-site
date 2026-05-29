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
  console.error(`❌ AG44B validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag44a-episodic-foundation-consumption.json",
  "data/content-intelligence/episodes/ag44a-episodic-foundation-consumption-map.json",
  "data/content-intelligence/backend-architecture/ag44a-existing-episode-source-audit.json",
  "data/content-intelligence/backend-architecture/ag44a-no-duplicate-episode-audit-register.json",
  "data/content-intelligence/backend-architecture/ag44a-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag44a-weekly-rhythm-calendar-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag44a-to-ag44b-weekly-rhythm-calendar-boundary.json",

  "data/content-intelligence/quality-reviews/ag44b-weekly-rhythm-calendar-alignment.json",
  "data/content-intelligence/episodes/ag44b-weekly-rhythm-model.json",
  "data/content-intelligence/episodes/ag44b-calendar-consumption-map.json",
  "data/content-intelligence/episodes/ag44b-series-structure-alignment-map.json",
  "data/content-intelligence/backend-architecture/ag44b-no-duplicate-weekly-rhythm-audit-register.json",
  "data/content-intelligence/backend-architecture/ag44b-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag44b-episode-to-surface-mapping-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag44b-to-ag44c-episode-surface-mapping-boundary.json",
  "data/quality/ag44b-weekly-rhythm-calendar-alignment.json",
  "data/quality/ag44b-weekly-rhythm-calendar-alignment-preview.json",
  "docs/quality/AG44B_WEEKLY_RHYTHM_CALENDAR_ALIGNMENT.md",
  "scripts/generate-ag44b-weekly-rhythm-calendar-alignment.mjs",
  "scripts/validate-ag44b-weekly-rhythm-calendar-alignment.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag44aReview = readJson("data/content-intelligence/quality-reviews/ag44a-episodic-foundation-consumption.json");
const ag44aFoundationMap = readJson("data/content-intelligence/episodes/ag44a-episodic-foundation-consumption-map.json");
const ag44aSourceAudit = readJson("data/content-intelligence/backend-architecture/ag44a-existing-episode-source-audit.json");
const ag44aNoDuplicateAudit = readJson("data/content-intelligence/backend-architecture/ag44a-no-duplicate-episode-audit-register.json");
const ag44aNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag44a-no-mutation-audit-register.json");
const ag44aReadiness = readJson("data/content-intelligence/quality-registry/ag44a-weekly-rhythm-calendar-readiness-record.json");
const ag44aBoundary = readJson("data/content-intelligence/mutation-plans/ag44a-to-ag44b-weekly-rhythm-calendar-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag44b-weekly-rhythm-calendar-alignment.json");
const rhythmModel = readJson("data/content-intelligence/episodes/ag44b-weekly-rhythm-model.json");
const calendarConsumption = readJson("data/content-intelligence/episodes/ag44b-calendar-consumption-map.json");
const seriesAlignment = readJson("data/content-intelligence/episodes/ag44b-series-structure-alignment-map.json");
const noDuplicateAudit = readJson("data/content-intelligence/backend-architecture/ag44b-no-duplicate-weekly-rhythm-audit-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag44b-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag44b-episode-to-surface-mapping-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag44b-to-ag44c-episode-surface-mapping-boundary.json");
const preview = readJson("data/quality/ag44b-weekly-rhythm-calendar-alignment-preview.json");
const pkg = readJson("package.json");

if (ag44aReview.status !== "episodic_foundation_consumed_ready_for_ag44b") fail("AG44A review status mismatch.");
if (ag44aReview.summary.ready_for_ag44b !== true) fail("AG44A readiness summary missing.");
if (ag44aFoundationMap.foundation_result.can_continue_to_weekly_rhythm_mapping !== true) fail("AG44A foundation map does not allow rhythm mapping.");
if (ag44aSourceAudit.audit_result.sufficient_existing_sources_for_ag44a !== true) fail("AG44A source audit insufficient.");
if (ag44aNoDuplicateAudit.status !== "no_duplicate_episode_audit_passed_for_ag44a") fail("AG44A no-duplicate audit mismatch.");
if (ag44aNoMutationAudit.status !== "no_mutation_audit_passed_for_ag44a") fail("AG44A no-mutation audit mismatch.");
if (ag44aReadiness.ready_for_ag44b !== true) fail("AG44A readiness must permit AG44B.");
if (ag44aBoundary.next_stage_id !== "AG44B") fail("AG44A boundary must point to AG44B.");

if (review.status !== "weekly_rhythm_calendar_aligned_ready_for_ag44c") fail("Review status mismatch.");
if (review.summary.ag44b_weekly_rhythm_aligned !== true) fail("Weekly rhythm aligned flag missing.");
if (review.summary.ag44a_consumed !== true) fail("AG44A consumption flag missing.");
if (review.summary.ag24c_calendar_consumed !== true) fail("AG24C calendar consumption missing.");
if (review.summary.ag24d_ag24e_series_structures_consumed !== true) fail("AG24D/AG24E series structure consumption missing.");
if (review.summary.ready_for_ag44c !== true) fail("AG44C readiness missing.");
if (review.summary.hard_blocker_count_for_ag44c !== 0) fail("AG44C hard blocker count must be zero.");
if (review.summary.duplicate_episode_system_created !== false) fail("Duplicate episode system must be false.");

if (rhythmModel.status !== "weekly_rhythm_model_aligned") fail("Rhythm model status mismatch.");
for (const key of ["tuesday", "friday", "sunday"]) {
  if (!rhythmModel.rhythm_model[key]) fail(`Missing rhythm key: ${key}`);
  if (rhythmModel.rhythm_model[key].activation_now !== false) fail(`Rhythm activation must be false for ${key}`);
}
if (rhythmModel.runtime_public_activation_now !== false) fail("Runtime public activation must remain false.");

if (calendarConsumption.status !== "calendar_sources_consumed_for_weekly_rhythm_alignment") fail("Calendar consumption status mismatch.");
if (calendarConsumption.calendar_result.twelve_week_calendar_source_available !== true) fail("Calendar source availability missing.");
if (calendarConsumption.calendar_result.rhythm_alignment_possible !== true) fail("Rhythm alignment possible flag missing.");
if (calendarConsumption.calendar_result.new_calendar_generated !== false) fail("New calendar must not be generated.");
if (calendarConsumption.calendar_result.public_schedule_mutated !== false) fail("Public schedule must not be mutated.");

if (seriesAlignment.status !== "series_structures_consumed_for_episode_rhythm") fail("Series alignment status mismatch.");
if (seriesAlignment.alignment_result.existing_series_structure_available !== true) fail("Series structure availability missing.");
if (seriesAlignment.alignment_result.tuesday_friday_sunday_rhythm_mapped !== true) fail("Tuesday/Friday/Sunday mapping missing.");
if (seriesAlignment.alignment_result.new_episode_series_created !== false) fail("New episode series must not be created.");
if (seriesAlignment.alignment_result.duplicate_episode_system_created !== false) fail("Duplicate episode system must not be created.");

if (noDuplicateAudit.status !== "no_duplicate_weekly_rhythm_audit_passed_for_ag44b") fail("No-duplicate audit status mismatch.");
if (noDuplicateAudit.failed_checks.length !== 0) fail("No-duplicate failed checks must be zero.");
for (const check of noDuplicateAudit.checks) {
  if (check.passed !== true) fail(`No-duplicate check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag44b") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag44c !== true) fail("Readiness must permit AG44C.");
if (readiness.next_stage_id !== "AG44C") fail("Next stage must be AG44C.");
if (readiness.article_mutation_allowed_next !== false) fail("Article mutation must remain blocked.");
if (readiness.episode_generation_allowed_next !== false) fail("Episode generation must remain blocked.");
if (readiness.topic_promotion_allowed_next !== false) fail("Topic promotion must remain blocked.");
if (readiness.homepage_mutation_allowed_next !== false) fail("Homepage mutation must remain blocked.");
if (readiness.featured_reads_mutation_allowed_next !== false) fail("Featured Reads mutation must remain blocked.");
if (readiness.reference_fetch_allowed_next !== false) fail("Reference fetch must remain blocked.");
if (readiness.image_generation_allowed_next !== false) fail("Image generation must remain blocked.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG44C") fail("Boundary must point to AG44C.");

if (preview.ag44b_weekly_rhythm_aligned !== 1) fail("Preview rhythm flag missing.");
if (preview.ready_for_ag44c !== 1) fail("Preview AG44C readiness missing.");
if (preview.duplicate_episode_system_created !== 0) fail("Preview duplicate system must be zero.");
if (preview.article_mutated !== 0) fail("Article mutation must be zero.");
if (preview.episode_generated !== 0) fail("Episode generation must be zero.");
if (preview.topic_promoted !== 0) fail("Topic promotion must be zero.");
if (preview.reference_fetch_executed !== 0) fail("Reference fetch must be zero.");
if (preview.image_generation_executed !== 0) fail("Image generation must be zero.");
if (preview.public_publishing_operation_performed !== 0) fail("Publishing must be zero.");
if (preview.database_write_performed !== 0) fail("Database write must be zero.");
if (preview.deployment_performed !== 0) fail("Deployment must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Backend activation must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Service-role exposure must be zero.");

if (!pkg.scripts?.["generate:ag44b"]) fail("Missing package script: generate:ag44b");
if (!pkg.scripts?.["validate:ag44b"]) fail("Missing package script: validate:ag44b");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag44b")) fail("validate:project must include validate:ag44b.");

pass("AG44B Weekly Rhythm and Calendar Alignment is present.");
pass("AG44A and existing AG24C/AG24D/AG24E episodic sources are consumed.");
pass("Tuesday / Friday / Sunday rhythm model is valid.");
pass("Calendar and series structure consumption maps are valid.");
pass("No duplicate episode system is created.");
pass("No-mutation audit is valid.");
pass("AG44C Episode-to-Surface Mapping readiness is valid.");
pass("No episode/article generation, topic promotion, reference fetch, image generation, public mutation, deployment, database/backend activation or service-role exposure is recorded.");
