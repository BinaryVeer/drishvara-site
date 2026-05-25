import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function fail(msg) {
  console.error(`❌ AG24E validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24a-weekly-episodic-rhythm-doctrine.json",
  "data/content-intelligence/episodes/ag24a-series-type-registry.json",
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  "data/content-intelligence/quality-reviews/ag24c-12-week-episode-calendar-plan.json",
  "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  "data/content-intelligence/episodes/ag24c-weekly-lane-calendar-structure.json",
  "data/content-intelligence/episodes/ag24c-episode-slot-schema.json",
  "data/content-intelligence/episodes/ag24c-future-consumption-plan.json",
  "data/content-intelligence/quality-reviews/ag24d-educational-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24d-tuesday-learning-series-structure.json",
  "data/content-intelligence/episodes/ag24d-educational-chapter-model.json",
  "data/content-intelligence/episodes/ag24d-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag24d-burning-topic-series-structure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24d-to-ag24e-burning-topic-series-structure-plan-boundary.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  "data/content-intelligence/quality-reviews/ag24e-burning-topic-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24e-friday-world-lens-series-structure.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-continuity-model.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-archetype-registry.json",
  "data/content-intelligence/episodes/ag24e-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag24e-burning-topic-series-structure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag24e-episode-metadata-schema-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24e-to-ag24f-episode-metadata-schema-boundary.json",
  "data/quality/ag24e-burning-topic-series-structure-plan.json",
  "data/quality/ag24e-burning-topic-series-structure-plan-preview.json",
  "docs/quality/AG24E_BURNING_TOPIC_SERIES_STRUCTURE_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag24e-burning-topic-series-structure-plan.json");
const plan = readJson("data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json");
const friday = readJson("data/content-intelligence/episodes/ag24e-friday-world-lens-series-structure.json");
const continuity = readJson("data/content-intelligence/episodes/ag24e-burning-topic-continuity-model.json");
const archetypes = readJson("data/content-intelligence/episodes/ag24e-burning-topic-archetype-registry.json");
const consumption = readJson("data/content-intelligence/episodes/ag24e-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag24e-burning-topic-series-structure-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag24e-episode-metadata-schema-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag24e-to-ag24f-episode-metadata-schema-boundary.json");
const registry = readJson("data/quality/ag24e-burning-topic-series-structure-plan.json");
const preview = readJson("data/quality/ag24e-burning-topic-series-structure-plan-preview.json");
const ag24dReadiness = readJson("data/content-intelligence/quality-registry/ag24d-burning-topic-series-structure-readiness-record.json");
const ag24dPlan = readJson("data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json");
const ag24cCalendar = readJson("data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json");
const ag24b = readJson("data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json");
const pkg = readJson("package.json");

if (review.status !== "burning_topic_series_structure_plan_created_ready_for_ag24f") fail("Review status mismatch.");
if (plan.status !== "burning_topic_series_structure_plan_created_ready_for_ag24f") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.structure_scope.target_lane !== "friday_world_lens") fail("Target lane must be friday_world_lens.");
if (plan.structure_scope.season_length_weeks !== 12) fail("Season length must be 12 weeks.");
if (plan.structure_scope.continuity_episode_count !== 12) fail("Continuity episode count must be 12.");
if (plan.structure_scope.topic_selection_status !== "not_selected") fail("Topic selection must remain not_selected.");
if (plan.structure_scope.live_feed_status !== "blocked") fail("Live feed must remain blocked.");
if (plan.topic_assignment_allowed_in_ag24e !== false) fail("Topic assignment must be blocked.");
if (plan.live_signal_feed_allowed_in_ag24e !== false) fail("Live signal feed must be blocked.");
if (plan.scraping_allowed_in_ag24e !== false) fail("Scraping must be blocked.");
if (plan.external_api_call_allowed_in_ag24e !== false) fail("External API call must be blocked.");
if (plan.episode_generation_allowed_in_ag24e !== false) fail("Episode generation must be blocked.");
if (plan.article_generation_allowed_in_ag24e !== false) fail("Article generation must be blocked.");
if (plan.no_unsupported_breaking_news_claims !== true) fail("Unsupported breaking-news claims must be blocked.");
if (plan.source_verification_required !== true) fail("Source verification must be required.");

if (friday.source_calendar_lane !== "friday_world_lens") fail("Friday structure must consume friday_world_lens lane.");
if (friday.season_length_weeks !== 12) fail("Friday season must be 12 weeks.");
if (friday.episode_count !== 12) fail("Friday episode count must be 12.");
if (friday.required_topic_gate.scoring_stage !== "AG24B") fail("Friday gate must require AG24B.");
if (friday.required_topic_gate.required_decision !== "strong_series_candidate") fail("Friday gate must require strong_series_candidate.");
if (friday.required_topic_gate.minimum_total_score !== 25) fail("Friday gate must require score 25.");
if (friday.required_topic_gate.source_verification_stage !== "AG23F") fail("Friday gate must require AG23F source verification.");

if (continuity.continuity_frames.length !== 12) fail("Continuity model must contain 12 frames.");
if (continuity.minimum_episode_count_for_series !== 8) fail("Minimum episode count must be 8.");
if (continuity.preferred_episode_count_for_season !== 12) fail("Preferred episode count must be 12.");
if (!String(continuity.live_update_rule || "").includes("No live feed")) fail("Continuity model must block live feed.");

if (archetypes.archetypes.length < 6) fail("At least six burning topic archetype templates must be present.");
if (!consumption.future_consumption?.future_dynamic_site) fail("Future dynamic site consumption note missing.");
if (blocker.status !== "burning_topic_series_operations_blocked_pending_ag24f") fail("Blocker register status mismatch.");
if (readiness.ready_for_ag24f !== true) fail("AG24F readiness missing.");
if (boundary.next_stage_id !== "AG24F") fail("AG24F boundary missing.");
if (review.summary.prior_ag_records_consumed !== true) fail("Prior AG records must be consumed.");
if (review.summary.burning_topic_series_structure_created !== true) fail("Burning topic structure summary missing.");
if (review.summary.topic_assignment_done !== false) fail("Topic assignment must remain false.");
if (review.summary.live_feed_enabled !== false) fail("Live feed must remain false.");
if (review.summary.scraping_enabled !== false) fail("Scraping must remain false.");
if (review.summary.external_api_call_enabled !== false) fail("External API call must remain false.");
if (review.summary.episode_generation_done !== false) fail("Episode generation must remain false.");
if (review.summary.article_generation_done !== false) fail("Article generation must remain false.");

if (ag24dReadiness.ready_for_ag24e !== true) fail("AG24D readiness must allow AG24E.");
if (ag24dPlan.status !== "educational_series_structure_plan_created_ready_for_ag24e") fail("AG24D source plan status mismatch.");
if (ag24cCalendar.calendar_scope.total_reserved_slots !== 36) fail("AG24C source calendar must contain 36 slots.");
if (ag24b.stage !== "AG24B") fail("AG24B source stage mismatch.");
if (registry.status !== "burning_topic_series_structure_plan_created_ready_for_ag24f") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.continuity_episode_count !== 12) fail("Preview must record 12 continuity episodes.");
if (preview.selected_topics !== 0) fail("Preview must record 0 selected topics.");
if (preview.live_feeds !== 0) fail("Preview must record 0 live feeds.");
if (preview.generated_episodes !== 0) fail("Preview must record 0 generated episodes.");
if (preview.generated_articles !== 0) fail("Preview must record 0 generated articles.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24a-weekly-episodic-rhythm-doctrine.json",
  "data/content-intelligence/episodes/ag24a-series-type-registry.json",
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  "data/content-intelligence/quality-reviews/ag24c-12-week-episode-calendar-plan.json",
  "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  "data/content-intelligence/episodes/ag24c-weekly-lane-calendar-structure.json",
  "data/content-intelligence/episodes/ag24c-episode-slot-schema.json",
  "data/content-intelligence/episodes/ag24c-future-consumption-plan.json",
  "data/content-intelligence/quality-reviews/ag24d-educational-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24d-tuesday-learning-series-structure.json",
  "data/content-intelligence/episodes/ag24d-educational-chapter-model.json",
  "data/content-intelligence/episodes/ag24d-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag24d-burning-topic-series-structure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24d-to-ag24e-burning-topic-series-structure-plan-boundary.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

for (const archetype of archetypes.archetypes) {
  if (archetype.status !== "template_only_not_selected") fail(`${archetype.archetype_id} must remain template_only_not_selected.`);
  if (archetype.allowed_lane !== "friday_world_lens") fail(`${archetype.archetype_id} must remain in friday_world_lens lane.`);
  if (!archetype.selection_gate.includes("AG24B")) fail(`${archetype.archetype_id} must require AG24B scoring.`);
}

if (!pkg.scripts?.["generate:ag24e"]) fail("Missing generate:ag24e script.");
if (!pkg.scripts?.["validate:ag24e"]) fail("Missing validate:ag24e script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag24e")) fail("validate:project must include validate:ag24e.");

pass("AG24E Burning Topic Series Structure Plan is present.");
pass("Friday World Lens lane and 12-part continuity model are valid.");
pass("Burning topic archetype templates are present without topic selection.");
pass("Prior AG24A/AG24B/AG24C/AG24D/AG23G/AG23F/AG23Z records are consumed.");
pass("AG24F Episode Metadata Schema boundary is ready.");
pass("No topic selection, live feed, scraping, API call, episode/article generation, GitHub write, deployment or publishing is enabled.");
