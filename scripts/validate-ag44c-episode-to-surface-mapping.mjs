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
  console.error(`❌ AG44C validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag44b-weekly-rhythm-calendar-alignment.json",
  "data/content-intelligence/episodes/ag44b-weekly-rhythm-model.json",
  "data/content-intelligence/episodes/ag44b-calendar-consumption-map.json",
  "data/content-intelligence/episodes/ag44b-series-structure-alignment-map.json",
  "data/content-intelligence/backend-architecture/ag44b-no-duplicate-weekly-rhythm-audit-register.json",
  "data/content-intelligence/backend-architecture/ag44b-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag44b-episode-to-surface-mapping-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag44b-to-ag44c-episode-surface-mapping-boundary.json",

  "data/content-intelligence/quality-reviews/ag44c-episode-to-surface-mapping.json",
  "data/content-intelligence/episodes/ag44c-episode-to-surface-mapping-model.json",
  "data/content-intelligence/homepage/ag44c-homepage-surface-consumption-map.json",
  "data/content-intelligence/episodes/ag44c-featured-reads-surface-consumption-map.json",
  "data/content-intelligence/episodes/ag44c-badge-navigation-timing-plan.json",
  "data/content-intelligence/backend-architecture/ag44c-no-duplicate-surface-mapping-audit-register.json",
  "data/content-intelligence/backend-architecture/ag44c-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag44c-episodic-continuity-repetition-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag44c-to-ag44d-continuity-repetition-audit-boundary.json",
  "data/quality/ag44c-episode-to-surface-mapping.json",
  "data/quality/ag44c-episode-to-surface-mapping-preview.json",
  "docs/quality/AG44C_EPISODE_TO_SURFACE_MAPPING.md",
  "scripts/generate-ag44c-episode-to-surface-mapping.mjs",
  "scripts/validate-ag44c-episode-to-surface-mapping.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag44bReview = readJson("data/content-intelligence/quality-reviews/ag44b-weekly-rhythm-calendar-alignment.json");
const ag44bRhythmModel = readJson("data/content-intelligence/episodes/ag44b-weekly-rhythm-model.json");
const ag44bCalendarConsumption = readJson("data/content-intelligence/episodes/ag44b-calendar-consumption-map.json");
const ag44bSeriesAlignment = readJson("data/content-intelligence/episodes/ag44b-series-structure-alignment-map.json");
const ag44bNoDuplicateAudit = readJson("data/content-intelligence/backend-architecture/ag44b-no-duplicate-weekly-rhythm-audit-register.json");
const ag44bNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag44b-no-mutation-audit-register.json");
const ag44bReadiness = readJson("data/content-intelligence/quality-registry/ag44b-episode-to-surface-mapping-readiness-record.json");
const ag44bBoundary = readJson("data/content-intelligence/mutation-plans/ag44b-to-ag44c-episode-surface-mapping-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag44c-episode-to-surface-mapping.json");
const surfaceMap = readJson("data/content-intelligence/episodes/ag44c-episode-to-surface-mapping-model.json");
const homepageConsumption = readJson("data/content-intelligence/homepage/ag44c-homepage-surface-consumption-map.json");
const featuredReadsConsumption = readJson("data/content-intelligence/episodes/ag44c-featured-reads-surface-consumption-map.json");
const badgeNavigationPlan = readJson("data/content-intelligence/episodes/ag44c-badge-navigation-timing-plan.json");
const noDuplicateAudit = readJson("data/content-intelligence/backend-architecture/ag44c-no-duplicate-surface-mapping-audit-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag44c-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag44c-episodic-continuity-repetition-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag44c-to-ag44d-continuity-repetition-audit-boundary.json");
const preview = readJson("data/quality/ag44c-episode-to-surface-mapping-preview.json");
const pkg = readJson("package.json");

if (ag44bReview.status !== "weekly_rhythm_calendar_aligned_ready_for_ag44c") fail("AG44B review status mismatch.");
if (ag44bReview.summary.ready_for_ag44c !== true) fail("AG44B readiness summary missing.");
if (ag44bRhythmModel.status !== "weekly_rhythm_model_aligned") fail("AG44B rhythm model status mismatch.");
for (const key of ["tuesday", "friday", "sunday"]) {
  if (!ag44bRhythmModel.rhythm_model[key]) fail(`AG44B rhythm key missing: ${key}`);
}
if (ag44bCalendarConsumption.calendar_result.rhythm_alignment_possible !== true) fail("AG44B calendar rhythm alignment missing.");
if (ag44bSeriesAlignment.alignment_result.tuesday_friday_sunday_rhythm_mapped !== true) fail("AG44B series alignment missing.");
if (ag44bNoDuplicateAudit.status !== "no_duplicate_weekly_rhythm_audit_passed_for_ag44b") fail("AG44B no-duplicate audit mismatch.");
if (ag44bNoMutationAudit.status !== "no_mutation_audit_passed_for_ag44b") fail("AG44B no-mutation audit mismatch.");
if (ag44bReadiness.ready_for_ag44c !== true) fail("AG44B readiness must permit AG44C.");
if (ag44bBoundary.next_stage_id !== "AG44C") fail("AG44B boundary must point to AG44C.");

if (review.status !== "episode_to_surface_mapping_ready_for_ag44d") fail("Review status mismatch.");
if (review.summary.ag44c_episode_surface_mapping_completed !== true) fail("AG44C mapping complete flag missing.");
if (review.summary.ag44b_consumed !== true) fail("AG44B consumption flag missing.");
if (review.summary.ag23_homepage_first_light_sources_consumed !== true) fail("AG23 homepage/First Light consumption missing.");
if (review.summary.ag25_featured_reads_sources_consumed !== true) fail("AG25 Featured Reads consumption missing.");
if (review.summary.ready_for_ag44d !== true) fail("AG44D readiness missing.");
if (review.summary.hard_blocker_count_for_ag44d !== 0) fail("AG44D hard blocker count must be zero.");
if (review.summary.duplicate_episode_surface_system_created !== false) fail("Duplicate episode surface system must be false.");

if (surfaceMap.status !== "episode_to_surface_mapping_model_created") fail("Surface map status mismatch.");
if (surfaceMap.result.episode_surface_mapping_recorded !== true) fail("Episode surface mapping flag missing.");
if (surfaceMap.result.new_public_surface_created !== false) fail("New public surface must not be created.");
if (surfaceMap.result.duplicate_episode_surface_system_created !== false) fail("Duplicate surface system must not be created.");
if (!Array.isArray(surfaceMap.rhythm_to_surface_mapping) || surfaceMap.rhythm_to_surface_mapping.length !== 3) fail("Expected three rhythm-to-surface mappings.");
for (const item of surfaceMap.rhythm_to_surface_mapping) {
  if (item.public_activation_now !== false) fail(`Public activation must remain false for ${item.rhythm_key}`);
  if (item.mutation_now !== false) fail(`Mutation must remain false for ${item.rhythm_key}`);
}

if (homepageConsumption.status !== "homepage_first_light_sources_consumed_for_episode_surface_mapping") fail("Homepage consumption status mismatch.");
if (homepageConsumption.homepage_mapping_result.homepage_mutated !== false) fail("Homepage must not be mutated.");
if (homepageConsumption.homepage_mapping_result.runtime_activation_now !== false) fail("Runtime activation must remain false.");

if (featuredReadsConsumption.status !== "featured_reads_sources_consumed_for_episode_surface_mapping") fail("Featured Reads consumption status mismatch.");
if (featuredReadsConsumption.featured_reads_mapping_result.featured_reads_surface_available !== true) fail("Featured Reads surface availability missing.");
if (featuredReadsConsumption.featured_reads_mapping_result.listing_mutated !== false) fail("Listing must not be mutated.");
if (featuredReadsConsumption.featured_reads_mapping_result.public_activation_now !== false) fail("Public activation must remain false.");

if (badgeNavigationPlan.status !== "badge_navigation_timing_plan_recorded") fail("Badge navigation plan status mismatch.");
if (badgeNavigationPlan.mutation_now !== false) fail("Badge plan must not mutate now.");
if (!Array.isArray(badgeNavigationPlan.planned_badges) || badgeNavigationPlan.planned_badges.length !== 3) fail("Expected three planned badges.");
for (const badge of badgeNavigationPlan.planned_badges) {
  if (badge.enabled_now !== false) fail(`Badge must remain disabled now: ${badge.rhythm_key}`);
}

if (noDuplicateAudit.status !== "no_duplicate_surface_mapping_audit_passed_for_ag44c") fail("No-duplicate audit status mismatch.");
if (noDuplicateAudit.failed_checks.length !== 0) fail("No-duplicate failed checks must be zero.");
for (const check of noDuplicateAudit.checks) {
  if (check.passed !== true) fail(`No-duplicate check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag44c") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag44d !== true) fail("Readiness must permit AG44D.");
if (readiness.next_stage_id !== "AG44D") fail("Next stage must be AG44D.");
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

if (boundary.next_stage_id !== "AG44D") fail("Boundary must point to AG44D.");

if (preview.ag44c_episode_surface_mapping_completed !== 1) fail("Preview mapping flag missing.");
if (preview.ready_for_ag44d !== 1) fail("Preview AG44D readiness missing.");
if (preview.duplicate_episode_surface_system_created !== 0) fail("Preview duplicate system must be zero.");
if (preview.article_mutated !== 0) fail("Article mutation must be zero.");
if (preview.episode_generated !== 0) fail("Episode generation must be zero.");
if (preview.topic_promoted !== 0) fail("Topic promotion must be zero.");
if (preview.homepage_mutated !== 0) fail("Homepage mutation must be zero.");
if (preview.featured_reads_mutated !== 0) fail("Featured Reads mutation must be zero.");
if (preview.reference_fetch_executed !== 0) fail("Reference fetch must be zero.");
if (preview.image_generation_executed !== 0) fail("Image generation must be zero.");
if (preview.public_publishing_operation_performed !== 0) fail("Publishing must be zero.");
if (preview.database_write_performed !== 0) fail("Database write must be zero.");
if (preview.deployment_performed !== 0) fail("Deployment must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Backend activation must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Service-role exposure must be zero.");

if (!pkg.scripts?.["generate:ag44c"]) fail("Missing package script: generate:ag44c");
if (!pkg.scripts?.["validate:ag44c"]) fail("Missing package script: validate:ag44c");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag44c")) fail("validate:project must include validate:ag44c.");

pass("AG44C Episode-to-Surface Mapping is present.");
pass("AG44B and existing AG23/AG25 public-surface sources are consumed.");
pass("Tuesday / Friday / Sunday episode-to-surface mapping is valid.");
pass("Badge and navigation timing plan is recorded without public activation.");
pass("No duplicate episode surface system is created.");
pass("No-mutation audit is valid.");
pass("AG44D Episodic Continuity and Repetition Audit readiness is valid.");
pass("No episode/article generation, topic promotion, homepage/Featured Reads mutation, reference fetch, image generation, public mutation, deployment, database/backend activation or service-role exposure is recorded.");
