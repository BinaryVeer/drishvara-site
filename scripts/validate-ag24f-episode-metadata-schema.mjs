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
  console.error(`❌ AG24F validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  "data/content-intelligence/episodes/ag24c-episode-slot-schema.json",
  "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24d-educational-chapter-model.json",
  "data/content-intelligence/quality-reviews/ag24e-burning-topic-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24e-friday-world-lens-series-structure.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-continuity-model.json",
  "data/content-intelligence/quality-registry/ag24e-episode-metadata-schema-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24e-to-ag24f-episode-metadata-schema-boundary.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  "data/content-intelligence/quality-reviews/ag24f-episode-metadata-schema.json",
  "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  "data/content-intelligence/episodes/ag24f-episode-lifecycle-status-registry.json",
  "data/content-intelligence/episodes/ag24f-series-season-slot-metadata-contract.json",
  "data/content-intelligence/episodes/ag24f-navigation-reference-risk-metadata-contract.json",
  "data/content-intelligence/episodes/ag24f-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag24f-episode-metadata-schema-blocker-register.json",
  "data/content-intelligence/quality-registry/ag24f-episode-index-navigation-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24f-to-ag24g-episode-index-navigation-scaffold-boundary.json",
  "data/quality/ag24f-episode-metadata-schema.json",
  "data/quality/ag24f-episode-metadata-schema-preview.json",
  "docs/quality/AG24F_EPISODE_METADATA_SCHEMA.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag24f-episode-metadata-schema.json");
const schema = readJson("data/content-intelligence/episodes/ag24f-episode-metadata-schema.json");
const lifecycle = readJson("data/content-intelligence/episodes/ag24f-episode-lifecycle-status-registry.json");
const seriesContract = readJson("data/content-intelligence/episodes/ag24f-series-season-slot-metadata-contract.json");
const navRiskContract = readJson("data/content-intelligence/episodes/ag24f-navigation-reference-risk-metadata-contract.json");
const consumption = readJson("data/content-intelligence/episodes/ag24f-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag24f-episode-metadata-schema-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag24f-episode-index-navigation-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag24f-to-ag24g-episode-index-navigation-scaffold-boundary.json");
const registry = readJson("data/quality/ag24f-episode-metadata-schema.json");
const preview = readJson("data/quality/ag24f-episode-metadata-schema-preview.json");
const ag24eReadiness = readJson("data/content-intelligence/quality-registry/ag24e-episode-metadata-schema-readiness-record.json");
const ag24ePlan = readJson("data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json");
const ag24cCalendar = readJson("data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json");
const ag24b = readJson("data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json");
const pkg = readJson("package.json");

if (review.status !== "episode_metadata_schema_created_ready_for_ag24g") fail("Review status mismatch.");
if (schema.status !== "episode_metadata_schema_created_ready_for_ag24g") fail("Schema status mismatch.");
if (schema.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (schema.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (schema.schema_scope.metadata_runtime_enabled !== false) fail("Metadata runtime must be disabled.");
if (schema.schema_scope.total_field_groups < 7) fail("Schema must contain at least 7 field groups.");
if (schema.schema_scope.total_schema_fields < 40) fail("Schema must contain at least 40 fields.");
if (schema.schema_scope.supported_lanes.length !== 3) fail("Schema must support 3 lanes.");
if (schema.public_visibility_default !== false) fail("public_visibility default must be false.");
if (schema.publish_approved_default !== false) fail("publish_approved default must be false.");
if (schema.article_generation_allowed_default !== false) fail("article_generation_allowed default must be false.");
if (schema.backend_required_default !== false) fail("backend_required default must be false.");
if (schema.supabase_required_default !== false) fail("supabase_required default must be false.");

for (const group of ["identity", "series_context", "topic_scoring", "source_and_references", "risk_and_safety", "navigation", "production_control"]) {
  if (!schema.metadata_field_groups[group]) fail(`Missing metadata field group: ${group}`);
}

if (lifecycle.default_status !== "reserved_not_selected") fail("Default lifecycle status must be reserved_not_selected.");
if (lifecycle.lifecycle_statuses.length < 7) fail("Lifecycle registry must contain at least 7 statuses.");
for (const item of lifecycle.lifecycle_statuses) {
  if (item.public_allowed !== false) fail(`${item.status_id} must not allow public visibility.`);
  if (item.publish_allowed !== false) fail(`${item.status_id} must not allow publishing.`);
}

if (seriesContract.season_contract.reserved_slot_count !== 36) fail("Series contract must preserve 36 reserved slots.");
if (seriesContract.supported_lanes.length !== 3) fail("Series contract must support 3 lanes.");
if (navRiskContract.navigation_contract.episode_index_not_created_in_ag24f !== true) fail("Episode index must not be created in AG24F.");
if (navRiskContract.reference_contract.target_verified_references_per_episode !== 2) fail("Reference target must remain 2.");
if (navRiskContract.reference_contract.fake_links_blocked !== true) fail("Fake links must be blocked.");
if (navRiskContract.risk_contract.live_feed_scraping_api_blocked !== true) fail("Live feed/scraping/API must be blocked.");
if (!consumption.future_consumption?.future_dynamic_site) fail("Future dynamic site consumption note missing.");
if (blocker.status !== "episode_metadata_runtime_operations_blocked_pending_ag24g") fail("Blocker register status mismatch.");
if (readiness.ready_for_ag24g !== true) fail("AG24G readiness missing.");
if (boundary.next_stage_id !== "AG24G") fail("AG24G boundary missing.");

if (review.summary.prior_ag_records_consumed !== true) fail("Prior AG records must be consumed.");
if (review.summary.episode_metadata_schema_created !== true) fail("Metadata schema summary missing.");
if (review.summary.metadata_runtime_enabled !== false) fail("Metadata runtime must remain false.");
if (review.summary.episode_index_created !== false) fail("Episode index must remain false.");
if (review.summary.navigation_scaffold_created !== false) fail("Navigation scaffold must remain false.");
if (review.summary.topic_assignment_done !== false) fail("Topic assignment must remain false.");
if (review.summary.episode_generation_done !== false) fail("Episode generation must remain false.");
if (review.summary.article_generation_done !== false) fail("Article generation must remain false.");

if (ag24eReadiness.ready_for_ag24f !== true) fail("AG24E readiness must allow AG24F.");
if (ag24ePlan.status !== "burning_topic_series_structure_plan_created_ready_for_ag24f") fail("AG24E source plan status mismatch.");
if (ag24cCalendar.calendar_scope.total_reserved_slots !== 36) fail("AG24C source calendar must contain 36 slots.");
if (ag24b.stage !== "AG24B") fail("AG24B source stage mismatch.");
if (registry.status !== "episode_metadata_schema_created_ready_for_ag24g") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.episode_index_created !== 0) fail("Preview must record 0 episode index created.");
if (preview.navigation_scaffold_created !== 0) fail("Preview must record 0 navigation scaffold created.");
if (preview.selected_topics !== 0) fail("Preview must record 0 selected topics.");
if (preview.generated_episodes !== 0) fail("Preview must record 0 generated episodes.");
if (preview.generated_articles !== 0) fail("Preview must record 0 generated articles.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  "data/content-intelligence/episodes/ag24c-episode-slot-schema.json",
  "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24d-educational-chapter-model.json",
  "data/content-intelligence/quality-reviews/ag24e-burning-topic-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24e-friday-world-lens-series-structure.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-continuity-model.json",
  "data/content-intelligence/episodes/ag24e-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag24e-episode-metadata-schema-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24e-to-ag24f-episode-metadata-schema-boundary.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json"
]) {
  if (!schema.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Schema did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag24f"]) fail("Missing generate:ag24f script.");
if (!pkg.scripts?.["validate:ag24f"]) fail("Missing validate:ag24f script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag24f")) fail("validate:project must include validate:ag24f.");

pass("AG24F Episode Metadata Schema is present.");
pass("Metadata field groups, lifecycle statuses and lane contracts are valid.");
pass("Navigation/reference/risk metadata contract is valid.");
pass("Prior AG24A/AG24B/AG24C/AG24D/AG24E/AG23G/AG23F/AG23Z records are consumed.");
pass("AG24G Episode Index and Navigation Scaffold boundary is ready.");
pass("No metadata runtime, episode index, navigation scaffold, generation, GitHub write, deployment or publishing is enabled.");
