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
  console.error(`❌ AG24D validation failed: ${msg}`);
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
  "data/content-intelligence/quality-registry/ag24c-educational-series-structure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24c-to-ag24d-educational-series-structure-plan-boundary.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  "data/content-intelligence/quality-reviews/ag24d-educational-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24d-tuesday-learning-series-structure.json",
  "data/content-intelligence/episodes/ag24d-educational-chapter-model.json",
  "data/content-intelligence/episodes/ag24d-educational-series-archetype-registry.json",
  "data/content-intelligence/episodes/ag24d-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag24d-educational-series-structure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag24d-burning-topic-series-structure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24d-to-ag24e-burning-topic-series-structure-plan-boundary.json",
  "data/quality/ag24d-educational-series-structure-plan.json",
  "data/quality/ag24d-educational-series-structure-plan-preview.json",
  "docs/quality/AG24D_EDUCATIONAL_SERIES_STRUCTURE_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag24d-educational-series-structure-plan.json");
const plan = readJson("data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json");
const tuesday = readJson("data/content-intelligence/episodes/ag24d-tuesday-learning-series-structure.json");
const chapterModel = readJson("data/content-intelligence/episodes/ag24d-educational-chapter-model.json");
const archetypes = readJson("data/content-intelligence/episodes/ag24d-educational-series-archetype-registry.json");
const consumption = readJson("data/content-intelligence/episodes/ag24d-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag24d-educational-series-structure-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag24d-burning-topic-series-structure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag24d-to-ag24e-burning-topic-series-structure-plan-boundary.json");
const registry = readJson("data/quality/ag24d-educational-series-structure-plan.json");
const preview = readJson("data/quality/ag24d-educational-series-structure-plan-preview.json");
const ag24cReadiness = readJson("data/content-intelligence/quality-registry/ag24c-educational-series-structure-readiness-record.json");
const ag24cCalendar = readJson("data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json");
const ag24b = readJson("data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json");
const pkg = readJson("package.json");

if (review.status !== "educational_series_structure_plan_created_ready_for_ag24e") fail("Review status mismatch.");
if (plan.status !== "educational_series_structure_plan_created_ready_for_ag24e") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.structure_scope.target_lane !== "tuesday_learning") fail("Target lane must be tuesday_learning.");
if (plan.structure_scope.season_length_weeks !== 12) fail("Season length must be 12 weeks.");
if (plan.structure_scope.chapter_count !== 12) fail("Chapter count must be 12.");
if (plan.structure_scope.topic_selection_status !== "not_selected") fail("Topic selection must remain not_selected.");
if (plan.topic_assignment_allowed_in_ag24d !== false) fail("Topic assignment must be blocked.");
if (plan.episode_generation_allowed_in_ag24d !== false) fail("Episode generation must be blocked.");
if (plan.article_generation_allowed_in_ag24d !== false) fail("Article generation must be blocked.");
if (tuesday.source_calendar_lane !== "tuesday_learning") fail("Tuesday structure must consume tuesday_learning lane.");
if (tuesday.season_length_weeks !== 12) fail("Tuesday season must be 12 weeks.");
if (tuesday.episode_count !== 12) fail("Tuesday episode count must be 12.");
if (tuesday.required_topic_gate.scoring_stage !== "AG24B") fail("Tuesday gate must require AG24B.");
if (tuesday.required_topic_gate.required_decision !== "strong_series_candidate") fail("Tuesday gate must require strong_series_candidate.");
if (tuesday.required_topic_gate.minimum_total_score !== 25) fail("Tuesday gate must require score 25.");
if (chapterModel.chapter_frames.length !== 12) fail("Chapter model must contain 12 chapter frames.");
if (chapterModel.minimum_episode_count_for_series !== 8) fail("Minimum episode count must be 8.");
if (chapterModel.preferred_episode_count_for_season !== 12) fail("Preferred episode count must be 12.");
if (archetypes.archetypes.length < 5) fail("At least five educational archetype templates must be present.");
if (!consumption.future_consumption?.future_dynamic_site) fail("Future dynamic site consumption note missing.");
if (blocker.status !== "educational_series_operations_blocked_pending_ag24e") fail("Blocker register status mismatch.");
if (readiness.ready_for_ag24e !== true) fail("AG24E readiness missing.");
if (boundary.next_stage_id !== "AG24E") fail("AG24E boundary missing.");
if (review.summary.prior_ag_records_consumed !== true) fail("Prior AG records must be consumed.");
if (review.summary.educational_series_structure_created !== true) fail("Educational structure summary missing.");
if (review.summary.topic_assignment_done !== false) fail("Topic assignment must remain false.");
if (review.summary.episode_generation_done !== false) fail("Episode generation must remain false.");
if (review.summary.article_generation_done !== false) fail("Article generation must remain false.");
if (ag24cReadiness.ready_for_ag24d !== true) fail("AG24C readiness must allow AG24D.");
if (ag24cCalendar.calendar_scope.total_reserved_slots !== 36) fail("AG24C source calendar must contain 36 slots.");
if (ag24b.stage !== "AG24B") fail("AG24B source stage mismatch.");
if (registry.status !== "educational_series_structure_plan_created_ready_for_ag24e") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.chapter_count !== 12) fail("Preview must record 12 chapters.");
if (preview.selected_topics !== 0) fail("Preview must record 0 selected topics.");
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
  "data/content-intelligence/quality-registry/ag24c-educational-series-structure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24c-to-ag24d-educational-series-structure-plan-boundary.json",
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
  if (archetype.allowed_lane !== "tuesday_learning") fail(`${archetype.archetype_id} must remain in tuesday_learning lane.`);
  if (!archetype.selection_gate.includes("AG24B")) fail(`${archetype.archetype_id} must require AG24B scoring.`);
}

if (!pkg.scripts?.["generate:ag24d"]) fail("Missing generate:ag24d script.");
if (!pkg.scripts?.["validate:ag24d"]) fail("Missing validate:ag24d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag24d")) fail("validate:project must include validate:ag24d.");

pass("AG24D Educational Series Structure Plan is present.");
pass("Tuesday Learning lane and 12-chapter educational model are valid.");
pass("Educational archetype templates are present without topic selection.");
pass("Prior AG24A/AG24B/AG24C/AG23G/AG23F/AG23Z records are consumed.");
pass("AG24E Burning Topic Series Structure Plan boundary is ready.");
pass("No topic selection, episode/article generation, GitHub write, deployment or publishing is enabled.");
