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
  console.error(`❌ AG24C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24a-weekly-episodic-rhythm-doctrine.json",
  "data/content-intelligence/episodes/ag24a-series-type-registry.json",
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  "data/content-intelligence/quality-reviews/ag24c-12-week-episode-calendar-plan.json",
  "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  "data/content-intelligence/episodes/ag24c-weekly-lane-calendar-structure.json",
  "data/content-intelligence/episodes/ag24c-episode-slot-schema.json",
  "data/content-intelligence/episodes/ag24c-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag24c-12-week-episode-calendar-blocker-register.json",
  "data/content-intelligence/quality-registry/ag24c-educational-series-structure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24c-to-ag24d-educational-series-structure-plan-boundary.json",
  "data/quality/ag24c-12-week-episode-calendar-plan.json",
  "data/quality/ag24c-12-week-episode-calendar-plan-preview.json",
  "docs/quality/AG24C_12_WEEK_EPISODE_CALENDAR_PLAN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag24c-12-week-episode-calendar-plan.json");
const calendar = readJson("data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json");
const lanes = readJson("data/content-intelligence/episodes/ag24c-weekly-lane-calendar-structure.json");
const slotSchema = readJson("data/content-intelligence/episodes/ag24c-episode-slot-schema.json");
const consumption = readJson("data/content-intelligence/episodes/ag24c-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag24c-12-week-episode-calendar-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag24c-educational-series-structure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag24c-to-ag24d-educational-series-structure-plan-boundary.json");
const registry = readJson("data/quality/ag24c-12-week-episode-calendar-plan.json");
const preview = readJson("data/quality/ag24c-12-week-episode-calendar-plan-preview.json");
const ag24b = readJson("data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json");
const pkg = readJson("package.json");

if (review.status !== "twelve_week_episode_calendar_plan_created_ready_for_ag24d") fail("Review status mismatch.");
if (calendar.status !== "twelve_week_episode_calendar_plan_created_ready_for_ag24d") fail("Calendar status mismatch.");
if (calendar.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (calendar.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (calendar.calendar_scope.duration_weeks !== 12) fail("Calendar must be 12 weeks.");
if (calendar.calendar_scope.total_lanes !== 3) fail("Calendar must contain 3 lanes.");
if (calendar.calendar_scope.total_reserved_slots !== 36) fail("Calendar must reserve 36 slots.");
if (lanes.lanes.length !== 3) fail("Lane structure must contain 3 lanes.");
if (lanes.week_frames.length !== 12) fail("Week frames must contain 12 entries.");
if (slotSchema.fields.length < 18) fail("Episode slot schema incomplete.");
if (!consumption.future_consumption?.future_dynamic_site) fail("Future dynamic site consumption note missing.");
if (blocker.status !== "episode_calendar_operations_blocked_pending_ag24d") fail("Blocker register status mismatch.");
if (readiness.ready_for_ag24d !== true) fail("AG24D readiness missing.");
if (boundary.next_stage_id !== "AG24D") fail("AG24D boundary missing.");
if (review.summary.prior_ag_records_consumed !== true) fail("Prior AG records must be consumed.");
if (ag24b.stage !== "AG24B") fail("AG24B source stage mismatch.");
if (registry.status !== "twelve_week_episode_calendar_plan_created_ready_for_ag24d") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.total_reserved_slots !== 36) fail("Preview must record 36 slots.");

for (const expectedInput of [
  "data/content-intelligence/quality-reviews/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24a-weekly-episodic-rhythm-doctrine.json",
  "data/content-intelligence/episodes/ag24a-series-type-registry.json",
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json"
]) {
  if (!calendar.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Calendar did not consume expected input: ${expectedInput}`);
  }
}

let slotCount = 0;

for (const week of calendar.calendar_weeks) {
  if (week.status !== "reserved_structure_only") fail(`Week ${week.week} must remain reserved_structure_only.`);
  if (week.slots.length !== 3) fail(`Week ${week.week} must contain 3 slots.`);
  for (const slot of week.slots) {
    slotCount += 1;
    if (slot.slot_topic_status !== "reserved_not_selected") fail(`${slot.slot_id} must remain reserved_not_selected.`);
    if (slot.selected_topic_id !== null) fail(`${slot.slot_id} must not select topic id.`);
    if (slot.selected_topic_title !== null) fail(`${slot.slot_id} must not select topic title.`);
    if (slot.article_generation_allowed !== false) fail(`${slot.slot_id} must block article generation.`);
    if (slot.public_visibility !== false) fail(`${slot.slot_id} must block public visibility.`);
    if (slot.publish_approved !== false) fail(`${slot.slot_id} must block publish approval.`);
    if (slot.backend_required !== false) fail(`${slot.slot_id} must not require backend.`);
    if (slot.supabase_required !== false) fail(`${slot.slot_id} must not require Supabase.`);
    if (slot.target_verified_references !== 2) fail(`${slot.slot_id} must target two verified references.`);
    if (slot.requires_scoring_stage !== "AG24B") fail(`${slot.slot_id} must require AG24B scoring.`);
    if (slot.required_decision !== "strong_series_candidate") fail(`${slot.slot_id} must require strong_series_candidate.`);
    if (slot.minimum_score_for_promotion !== 25) fail(`${slot.slot_id} must require score 25.`);
  }
}

if (slotCount !== 36) fail("AG24C must contain exactly 36 reserved slots.");

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag24c"]) fail("Missing generate:ag24c script.");
if (!pkg.scripts?.["validate:ag24c"]) fail("Missing validate:ag24c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag24c")) fail("validate:project must include validate:ag24c.");

pass("AG24C 12-Week Episode Calendar Plan is present.");
pass("12-week, 3-lane, 36-slot structure is valid.");
pass("Prior AG24A/AG24B/AG23G/AG23F/AG23Z records are consumed.");
pass("AG24D Educational Series Structure Plan boundary is ready.");
pass("No topic selection, article generation, GitHub write, deployment or publishing is enabled.");
