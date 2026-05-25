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
  console.error(`❌ AG24G validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  "data/content-intelligence/episodes/ag24c-weekly-lane-calendar-structure.json",
  "data/content-intelligence/episodes/ag24c-episode-slot-schema.json",
  "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24d-educational-chapter-model.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-continuity-model.json",
  "data/content-intelligence/quality-reviews/ag24f-episode-metadata-schema.json",
  "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  "data/content-intelligence/episodes/ag24f-episode-lifecycle-status-registry.json",
  "data/content-intelligence/episodes/ag24f-series-season-slot-metadata-contract.json",
  "data/content-intelligence/episodes/ag24f-navigation-reference-risk-metadata-contract.json",
  "data/content-intelligence/quality-registry/ag24f-episode-index-navigation-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24f-to-ag24g-episode-index-navigation-scaffold-boundary.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  "data/content-intelligence/quality-reviews/ag24g-episode-index-navigation-scaffold.json",
  "data/content-intelligence/episodes/ag24g-episode-index-navigation-scaffold.json",
  "data/content-intelligence/episodes/ag24g-non-active-episode-index-structure.json",
  "data/content-intelligence/episodes/ag24g-previous-next-navigation-contract.json",
  "data/content-intelligence/episodes/ag24g-lane-season-navigation-map.json",
  "data/content-intelligence/episodes/ag24g-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag24g-episode-index-navigation-scaffold-blocker-register.json",
  "data/content-intelligence/quality-registry/ag24g-episode-production-conveyor-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24g-to-ag24h-episode-production-conveyor-boundary.json",
  "data/quality/ag24g-episode-index-navigation-scaffold.json",
  "data/quality/ag24g-episode-index-navigation-scaffold-preview.json",
  "docs/quality/AG24G_EPISODE_INDEX_NAVIGATION_SCAFFOLD.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag24g-episode-index-navigation-scaffold.json");
const scaffold = readJson("data/content-intelligence/episodes/ag24g-episode-index-navigation-scaffold.json");
const indexStructure = readJson("data/content-intelligence/episodes/ag24g-non-active-episode-index-structure.json");
const navigation = readJson("data/content-intelligence/episodes/ag24g-previous-next-navigation-contract.json");
const laneMap = readJson("data/content-intelligence/episodes/ag24g-lane-season-navigation-map.json");
const consumption = readJson("data/content-intelligence/episodes/ag24g-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag24g-episode-index-navigation-scaffold-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag24g-episode-production-conveyor-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag24g-to-ag24h-episode-production-conveyor-boundary.json");
const registry = readJson("data/quality/ag24g-episode-index-navigation-scaffold.json");
const preview = readJson("data/quality/ag24g-episode-index-navigation-scaffold-preview.json");
const ag24fReadiness = readJson("data/content-intelligence/quality-registry/ag24f-episode-index-navigation-scaffold-readiness-record.json");
const ag24fSchema = readJson("data/content-intelligence/episodes/ag24f-episode-metadata-schema.json");
const ag24cCalendar = readJson("data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json");
const pkg = readJson("package.json");

if (review.status !== "episode_index_navigation_scaffold_created_ready_for_ag24h") fail("Review status mismatch.");
if (scaffold.status !== "episode_index_navigation_scaffold_created_ready_for_ag24h") fail("Scaffold status mismatch.");
if (scaffold.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (scaffold.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (scaffold.scaffold_scope.index_type !== "non_active_internal_scaffold") fail("Index type must be non_active_internal_scaffold.");
if (scaffold.scaffold_scope.total_lanes !== 3) fail("Scaffold must contain 3 lanes.");
if (scaffold.scaffold_scope.total_weeks !== 12) fail("Scaffold must contain 12 weeks.");
if (scaffold.scaffold_scope.total_index_entries !== 36) fail("Scaffold must contain 36 entries.");
if (scaffold.public_index_created !== false) fail("Public index must not be created.");
if (scaffold.public_navigation_created !== false) fail("Public navigation must not be created.");
if (scaffold.runtime_navigation_enabled !== false) fail("Runtime navigation must be disabled.");
if (scaffold.article_generation_allowed_in_ag24g !== false) fail("Article generation must remain blocked.");

if (indexStructure.total_index_entries !== 36) fail("Index structure must contain 36 entries.");
if (indexStructure.expected_entries !== 36) fail("Index structure expected entries must be 36.");
if (indexStructure.entries.length !== 36) fail("Index entries must be exactly 36.");
if (indexStructure.public_index_created !== false) fail("Index structure public index must be false.");
if (indexStructure.public_navigation_created !== false) fail("Index structure public navigation must be false.");
if (indexStructure.runtime_navigation_enabled !== false) fail("Index structure runtime navigation must be false.");

for (const entry of indexStructure.entries) {
  if (entry.lifecycle_status !== "reserved_not_selected") fail(`${entry.episode_id} must remain reserved_not_selected.`);
  if (entry.topic_selection_status !== "not_selected") fail(`${entry.episode_id} must remain not_selected.`);
  if (entry.public_visibility !== false) fail(`${entry.episode_id} must not be public.`);
  if (entry.publish_approved !== false) fail(`${entry.episode_id} must not be publish approved.`);
  if (entry.article_generation_allowed !== false) fail(`${entry.episode_id} must block article generation.`);
  if (entry.backend_required !== false) fail(`${entry.episode_id} must not require backend.`);
  if (entry.supabase_required !== false) fail(`${entry.episode_id} must not require Supabase.`);
}

for (const lane of ["tuesday_learning", "friday_world_lens", "sunday_deep_read"]) {
  const laneEntries = indexStructure.entries.filter((entry) => entry.lane_id === lane);
  if (laneEntries.length !== 12) fail(`${lane} must contain 12 index entries.`);
  const first = laneEntries.find((entry) => entry.episode_no === 1);
  const last = laneEntries.find((entry) => entry.episode_no === 12);
  if (!first || first.previous_episode_id !== null) fail(`${lane} first episode must not have previous.`);
  if (!last || last.next_episode_id !== null) fail(`${lane} last episode must not have next.`);
}

if (navigation.navigation_scope.intra_lane_previous_next !== true) fail("Navigation must support intra-lane previous/next.");
if (navigation.navigation_scope.public_navigation_enabled !== false) fail("Public navigation must be disabled.");
if (navigation.navigation_scope.runtime_navigation_enabled !== false) fail("Runtime navigation must be disabled.");
if (laneMap.total_index_entries !== 36) fail("Lane map must record 36 entries.");
if (laneMap.lanes.length !== 3) fail("Lane map must contain 3 lanes.");
if (!consumption.future_consumption?.future_dynamic_site) fail("Future dynamic site consumption note missing.");
if (blocker.status !== "episode_index_navigation_operations_blocked_pending_ag24h") fail("Blocker register status mismatch.");
if (readiness.ready_for_ag24h !== true) fail("AG24H readiness missing.");
if (boundary.next_stage_id !== "AG24H") fail("AG24H boundary missing.");

if (review.summary.prior_ag_records_consumed !== true) fail("Prior AG records must be consumed.");
if (review.summary.episode_index_scaffold_created !== true) fail("Index scaffold summary missing.");
if (review.summary.total_index_entries !== 36) fail("Review must record 36 index entries.");
if (review.summary.public_index_created !== false) fail("Public index must remain false.");
if (review.summary.public_navigation_created !== false) fail("Public navigation must remain false.");
if (review.summary.runtime_navigation_enabled !== false) fail("Runtime navigation must remain false.");
if (review.summary.topic_assignment_done !== false) fail("Topic assignment must remain false.");
if (review.summary.episode_generation_done !== false) fail("Episode generation must remain false.");
if (review.summary.article_generation_done !== false) fail("Article generation must remain false.");

if (ag24fReadiness.ready_for_ag24g !== true) fail("AG24F readiness must allow AG24G.");
if (ag24fSchema.status !== "episode_metadata_schema_created_ready_for_ag24g") fail("AG24F source schema status mismatch.");
if (ag24cCalendar.calendar_scope.total_reserved_slots !== 36) fail("AG24C source calendar must contain 36 slots.");
if (registry.status !== "episode_index_navigation_scaffold_created_ready_for_ag24h") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.total_index_entries !== 36) fail("Preview must record 36 index entries.");
if (preview.public_index_created !== 0) fail("Preview must record 0 public index created.");
if (preview.public_navigation_created !== 0) fail("Preview must record 0 public navigation created.");
if (preview.runtime_navigation_enabled !== 0) fail("Preview must record 0 runtime navigation enabled.");
if (preview.selected_topics !== 0) fail("Preview must record 0 selected topics.");
if (preview.generated_episodes !== 0) fail("Preview must record 0 generated episodes.");
if (preview.generated_articles !== 0) fail("Preview must record 0 generated articles.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  "data/content-intelligence/episodes/ag24c-weekly-lane-calendar-structure.json",
  "data/content-intelligence/episodes/ag24c-episode-slot-schema.json",
  "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24d-educational-chapter-model.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-continuity-model.json",
  "data/content-intelligence/quality-reviews/ag24f-episode-metadata-schema.json",
  "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  "data/content-intelligence/episodes/ag24f-episode-lifecycle-status-registry.json",
  "data/content-intelligence/episodes/ag24f-series-season-slot-metadata-contract.json",
  "data/content-intelligence/episodes/ag24f-navigation-reference-risk-metadata-contract.json",
  "data/content-intelligence/episodes/ag24f-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag24f-episode-index-navigation-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24f-to-ag24g-episode-index-navigation-scaffold-boundary.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json"
]) {
  if (!scaffold.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Scaffold did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag24g"]) fail("Missing generate:ag24g script.");
if (!pkg.scripts?.["validate:ag24g"]) fail("Missing validate:ag24g script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag24g")) fail("validate:project must include validate:ag24g.");

pass("AG24G Episode Index and Navigation Scaffold is present.");
pass("36 non-active index entries and lane-season map are valid.");
pass("Previous/next navigation contract is valid and non-public.");
pass("Prior AG24A/AG24B/AG24C/AG24D/AG24E/AG24F/AG23G/AG23F/AG23Z records are consumed.");
pass("AG24H Episode Production Conveyor boundary is ready.");
pass("No public index, runtime navigation, generation, GitHub write, deployment or publishing is enabled.");
