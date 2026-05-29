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
  console.error(`❌ AG45A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag44z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/closure-records/ag44z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/quality-registry/ag44z-next-governed-stage-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag44z-to-next-governed-stage-boundary.json",

  "data/content-intelligence/quality-reviews/ag45a-daily-signal-surface-first-light-doctrine.json",
  "data/content-intelligence/daily-surface/ag45a-daily-signal-surface-doctrine.json",
  "data/content-intelligence/homepage/ag45a-first-light-ui-space-model.json",
  "data/content-intelligence/daily-surface/ag45a-signal-selection-doctrine.json",
  "data/content-intelligence/daily-surface/ag45a-northeast-watch-doctrine.json",
  "data/content-intelligence/daily-surface/ag45a-source-attribution-title-subtitle-doctrine.json",
  "data/content-intelligence/daily-surface/ag45a-video-of-the-day-doctrine.json",
  "data/content-intelligence/homepage/ag45a-card-transition-doctrine.json",
  "data/content-intelligence/backend-architecture/ag45a-daily-signal-metadata-schema-plan.json",
  "data/content-intelligence/backend-architecture/ag45a-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag45a-source-credibility-model-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag45a-to-ag45b-source-credibility-model-boundary.json",
  "data/quality/ag45a-daily-signal-surface-first-light-doctrine.json",
  "data/quality/ag45a-daily-signal-surface-first-light-doctrine-preview.json",
  "docs/quality/AG45A_DAILY_SIGNAL_SURFACE_FIRST_LIGHT_DOCTRINE.md",
  "scripts/generate-ag45a-daily-signal-surface-first-light-doctrine.mjs",
  "scripts/validate-ag45a-daily-signal-surface-first-light-doctrine.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag44zReview = readJson("data/content-intelligence/quality-reviews/ag44z-episodic-knowledge-engine-closure.json");
const ag44zClosure = readJson("data/content-intelligence/closure-records/ag44z-episodic-knowledge-engine-closure.json");
const ag44zReadiness = readJson("data/content-intelligence/quality-registry/ag44z-next-governed-stage-readiness-record.json");
const ag44zBoundary = readJson("data/content-intelligence/mutation-plans/ag44z-to-next-governed-stage-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag45a-daily-signal-surface-first-light-doctrine.json");
const doctrine = readJson("data/content-intelligence/daily-surface/ag45a-daily-signal-surface-doctrine.json");
const firstLightModel = readJson("data/content-intelligence/homepage/ag45a-first-light-ui-space-model.json");
const signalSelectionDoctrine = readJson("data/content-intelligence/daily-surface/ag45a-signal-selection-doctrine.json");
const northeastDoctrine = readJson("data/content-intelligence/daily-surface/ag45a-northeast-watch-doctrine.json");
const attributionDoctrine = readJson("data/content-intelligence/daily-surface/ag45a-source-attribution-title-subtitle-doctrine.json");
const videoDoctrine = readJson("data/content-intelligence/daily-surface/ag45a-video-of-the-day-doctrine.json");
const transitionDoctrine = readJson("data/content-intelligence/homepage/ag45a-card-transition-doctrine.json");
const backendSchemaPlan = readJson("data/content-intelligence/backend-architecture/ag45a-daily-signal-metadata-schema-plan.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag45a-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag45a-source-credibility-model-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag45a-to-ag45b-source-credibility-model-boundary.json");
const preview = readJson("data/quality/ag45a-daily-signal-surface-first-light-doctrine-preview.json");
const pkg = readJson("package.json");

if (ag44zClosure.next_stage_id !== "AG45") fail("AG44Z closure must point to AG45.");
if (ag44zReadiness.next_stage_id !== "AG45") fail("AG44Z readiness must point to AG45.");
if (ag44zBoundary.next_stage_id !== "AG45") fail("AG44Z boundary must point to AG45.");
if (!JSON.stringify(ag44zReadiness).includes("Homepage Daily Surface and First Light Activation")) fail("AG44Z readiness must name AG45 homepage activation.");
if (!JSON.stringify(ag44zBoundary).includes("Homepage Daily Surface and First Light Activation")) fail("AG44Z boundary must name AG45 homepage activation.");
if (ag44zReview.summary.ag56_dynamic_content_loop_still_deferred !== true) fail("AG56 deferral must remain true.");

if (review.status !== "daily_signal_surface_first_light_doctrine_ready_for_ag45b") fail("Review status mismatch.");
if (review.summary.ten_signal_model_recorded !== true) fail("Ten-signal model missing.");
if (review.summary.india_six_world_four_default_recorded !== true) fail("6 India / 4 World rule missing.");
if (review.summary.northeast_watch_doctrine_recorded !== true) fail("Northeast doctrine missing.");
if (review.summary.video_of_the_day_doctrine_recorded !== true) fail("Video doctrine missing.");
if (review.summary.transition_doctrine_recorded !== true) fail("Transition doctrine missing.");
if (review.summary.ready_for_ag45b !== true) fail("AG45B readiness missing.");
if (review.summary.hard_blocker_count_for_ag45b !== 0) fail("AG45B hard blocker count must be zero.");
if (review.summary.homepage_mutated !== false) fail("Homepage mutation must remain false.");
if (review.summary.daily_signal_fetch_executed !== false) fail("Daily signal fetch must remain false.");
if (review.summary.news_scraping_executed !== false) fail("News scraping must remain false.");
if (review.summary.video_popup_activated !== false) fail("Video popup must not activate.");
if (review.summary.database_write_performed !== false) fail("Database write must remain false.");

if (doctrine.status !== "daily_signal_surface_doctrine_recorded_ready_for_ag45b") fail("Doctrine status mismatch.");
if (doctrine.core_rules.length < 8) fail("Doctrine core rules insufficient.");
if (!JSON.stringify(doctrine).includes("10 signals")) fail("Doctrine must include 10 signals.");
if (!JSON.stringify(doctrine).includes("6 India")) fail("Doctrine must include 6 India.");
if (!JSON.stringify(doctrine).includes("4 international")) fail("Doctrine must include 4 international.");

if (firstLightModel.status !== "first_light_ui_space_doctrine_recorded") fail("First Light model status mismatch.");
if (firstLightModel.existing_homepage_fit.top_right_first_light_box_is_compact_entry_point !== true) fail("First Light compact entry rule missing.");
if (firstLightModel.existing_homepage_fit.daily_surface_uses_fixed_space_and_no_layout_shift !== true) fail("Fixed space/no layout shift rule missing.");
if (firstLightModel.intended_visible_surface.visible_card_count_at_once !== 3) fail("Visible card count should be 3.");
if (firstLightModel.intended_visible_surface.full_signal_count_stored !== 10) fail("Full signal count should be 10.");

if (signalSelectionDoctrine.daily_signal_count !== 10) fail("Daily signal count must be 10.");
if (signalSelectionDoctrine.default_distribution.india_signals !== 6) fail("India signal count must be 6.");
if (signalSelectionDoctrine.default_distribution.international_signals !== 4) fail("International signal count must be 4.");
if (!JSON.stringify(signalSelectionDoctrine).includes("Northeast")) fail("Signal doctrine must include Northeast.");

if (northeastDoctrine.status !== "northeast_watch_doctrine_recorded") fail("Northeast doctrine status mismatch.");
for (const state of ["Arunachal Pradesh", "Assam", "Manipur", "Sikkim"]) {
  if (!northeastDoctrine.region_scope.includes(state)) fail(`Northeast state missing: ${state}`);
}
if (!JSON.stringify(northeastDoctrine).includes("China-related regional implications")) fail("China-related regional implications watch theme missing.");

if (attributionDoctrine.status !== "source_attribution_title_subtitle_doctrine_recorded") fail("Attribution doctrine status mismatch.");
if (!JSON.stringify(attributionDoctrine).includes("Palki Sharma")) fail("Credible anchor/explainer example missing.");
if (!JSON.stringify(attributionDoctrine).includes("Ranganathan")) fail("Public commentator example missing.");
if (!JSON.stringify(attributionDoctrine).includes("Drishvara title")) fail("Drishvara title rule missing.");
if (!JSON.stringify(attributionDoctrine).includes("Subtitle")) fail("Subtitle rule missing.");

if (videoDoctrine.status !== "video_of_the_day_doctrine_recorded") fail("Video doctrine status mismatch.");
if (videoDoctrine.public_experience.activate_now !== false) fail("Video must not activate now.");
if (videoDoctrine.public_experience.muted_by_default !== true) fail("Video must be muted by default.");
if (videoDoctrine.public_experience.skippable !== true) fail("Video must be skippable.");
if (!JSON.stringify(videoDoctrine.safety_exclusions).includes("adult or explicit content")) fail("Adult/explicit exclusion missing.");

if (transitionDoctrine.status !== "card_transition_doctrine_recorded") fail("Transition doctrine status mismatch.");
for (const transition of ["Blinds", "Peel-off", "Ripple"]) {
  if (!transitionDoctrine.transition_options.includes(transition)) fail(`Transition missing: ${transition}`);
}
if (transitionDoctrine.activate_now !== false) fail("Transitions must not activate now.");
if (!JSON.stringify(transitionDoctrine.fixed_space_rules).includes("No homepage layout shift")) fail("No layout shift rule missing.");

if (backendSchemaPlan.status !== "metadata_schema_plan_recorded_no_database_write") fail("Backend schema plan status mismatch.");
for (const field of ["drishvara_title", "drishvara_subtitle", "publisher_name", "reporter_name", "source_url", "inference_tags", "verification_status"]) {
  if (!backendSchemaPlan.planned_fields.includes(field)) fail(`Planned metadata field missing: ${field}`);
}
if (backendSchemaPlan.database_write_now !== false) fail("Database write must be false.");
if (backendSchemaPlan.supabase_activation_now !== false) fail("Supabase activation must be false.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag45a") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag45b !== true) fail("Readiness must permit AG45B.");
if (readiness.next_stage_id !== "AG45B") fail("Readiness next stage must be AG45B.");
if (readiness.daily_signal_fetch_allowed_next !== false) fail("Daily signal fetch must remain blocked.");
if (readiness.news_scraping_allowed_next !== false) fail("News scraping must remain blocked.");
if (readiness.homepage_mutation_allowed_next !== false) fail("Homepage mutation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG45B") fail("Boundary must point to AG45B.");

if (preview.ag45a_daily_signal_surface_doctrine_recorded !== 1) fail("Preview doctrine flag missing.");
if (preview.ten_signal_model_recorded !== 1) fail("Preview ten-signal flag missing.");
if (preview.northeast_watch_doctrine_recorded !== 1) fail("Preview Northeast flag missing.");
if (preview.video_of_the_day_doctrine_recorded !== 1) fail("Preview video doctrine flag missing.");
if (preview.transition_doctrine_recorded !== 1) fail("Preview transition doctrine flag missing.");
if (preview.ready_for_ag45b !== 1) fail("Preview AG45B readiness missing.");
if (preview.homepage_mutated !== 0) fail("Preview homepage mutation must be zero.");
if (preview.daily_signal_fetch_executed !== 0) fail("Preview fetch must be zero.");
if (preview.news_scraping_executed !== 0) fail("Preview scraping must be zero.");
if (preview.image_fetch_executed !== 0) fail("Preview image fetch must be zero.");
if (preview.video_fetch_executed !== 0) fail("Preview video fetch must be zero.");
if (preview.video_popup_activated !== 0) fail("Preview popup activation must be zero.");
if (preview.database_write_performed !== 0) fail("Preview database write must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Preview backend activation must be zero.");
if (preview.deployment_performed !== 0) fail("Preview deployment must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Preview service role exposure must be zero.");

if (!pkg.scripts?.["generate:ag45a"]) fail("Missing package script: generate:ag45a");
if (!pkg.scripts?.["validate:ag45a"]) fail("Missing package script: validate:ag45a");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag45a")) fail("validate:project must include validate:ag45a.");

pass("AG45A Daily Signal Surface and First Light Doctrine is present.");
pass("AG44Z and homepage/First Light sources are consumed.");
pass("10-signal model with 6 India, Northeast Watch and 4 international signals is recorded.");
pass("First Light compact UI space and fixed-container transition doctrine are valid.");
pass("Source attribution, Drishvara title/subtitle and inference metadata doctrine are valid.");
pass("Video-of-the-day doctrine is recorded without activation.");
pass("No-mutation audit is valid.");
pass("AG45B Source, Publisher, Reporter and Anchor Credibility Model readiness is valid.");
pass("No live fetch, scraping, image/video fetch, homepage mutation, popup activation, database/backend activation, deployment or service-role exposure is recorded.");
