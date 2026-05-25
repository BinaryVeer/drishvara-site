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
  console.error(`❌ AG24H validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  "data/content-intelligence/episodes/ag24g-episode-index-navigation-scaffold.json",
  "data/content-intelligence/episodes/ag24g-non-active-episode-index-structure.json",
  "data/content-intelligence/quality-registry/ag24g-episode-production-conveyor-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24g-to-ag24h-episode-production-conveyor-boundary.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  "data/content-intelligence/quality-reviews/ag24h-episode-production-conveyor.json",
  "data/content-intelligence/episodes/ag24h-episode-production-conveyor.json",
  "data/content-intelligence/episodes/ag24h-production-stage-registry.json",
  "data/content-intelligence/episodes/ag24h-topic-to-brief-conveyor-model.json",
  "data/content-intelligence/episodes/ag24h-editorial-review-handoff-model.json",
  "data/content-intelligence/episodes/ag24h-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag24h-episode-production-conveyor-blocker-register.json",
  "data/content-intelligence/quality-registry/ag24h-episode-quality-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24h-to-ag24i-episode-quality-audit-boundary.json",
  "data/quality/ag24h-episode-production-conveyor.json",
  "data/quality/ag24h-episode-production-conveyor-preview.json",
  "docs/quality/AG24H_EPISODE_PRODUCTION_CONVEYOR.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag24h-episode-production-conveyor.json");
const conveyor = readJson("data/content-intelligence/episodes/ag24h-episode-production-conveyor.json");
const stages = readJson("data/content-intelligence/episodes/ag24h-production-stage-registry.json");
const topicToBrief = readJson("data/content-intelligence/episodes/ag24h-topic-to-brief-conveyor-model.json");
const editorialHandoff = readJson("data/content-intelligence/episodes/ag24h-editorial-review-handoff-model.json");
const consumption = readJson("data/content-intelligence/episodes/ag24h-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag24h-episode-production-conveyor-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag24h-episode-quality-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag24h-to-ag24i-episode-quality-audit-boundary.json");
const registry = readJson("data/quality/ag24h-episode-production-conveyor.json");
const preview = readJson("data/quality/ag24h-episode-production-conveyor-preview.json");
const ag24gReadiness = readJson("data/content-intelligence/quality-registry/ag24g-episode-production-conveyor-readiness-record.json");
const ag24gIndex = readJson("data/content-intelligence/episodes/ag24g-non-active-episode-index-structure.json");
const pkg = readJson("package.json");

if (review.status !== "episode_production_conveyor_created_ready_for_ag24i") fail("Review status mismatch.");
if (conveyor.status !== "episode_production_conveyor_created_ready_for_ag24i") fail("Conveyor status mismatch.");
if (conveyor.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (conveyor.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (conveyor.conveyor_scope.conveyor_type !== "non_active_topic_to_brief_to_review_planning") fail("Conveyor type mismatch.");
if (conveyor.conveyor_scope.production_stage_count !== 8) fail("Conveyor must contain 8 stages.");
if (conveyor.conveyor_scope.total_index_entries_available !== 36) fail("Conveyor must see 36 index entries.");
if (conveyor.production_conveyor_runtime_enabled !== false) fail("Runtime conveyor must be disabled.");
if (conveyor.brief_generation_allowed_in_ag24h !== false) fail("Brief generation must be blocked.");
if (conveyor.draft_generation_allowed_in_ag24h !== false) fail("Draft generation must be blocked.");
if (conveyor.article_generation_allowed_in_ag24h !== false) fail("Article generation must be blocked.");
if (conveyor.queue_mutation_allowed_in_ag24h !== false) fail("Queue mutation must be blocked.");
if (conveyor.public_visibility_default !== false) fail("public_visibility default must be false.");
if (conveyor.publish_approved_default !== false) fail("publish_approved default must be false.");

if (stages.stage_count !== 8) fail("Stage registry must contain 8 stages.");
if (stages.stages.length !== 8) fail("Stage registry stages length must be 8.");
for (const stage of stages.stages) {
  if (stage.output_status !== "planned_not_executed") fail(`${stage.stage_id} must remain planned_not_executed.`);
}
if (stages.runtime_execution_allowed !== false) fail("Stage runtime execution must be false.");

if (topicToBrief.generated_brief_allowed !== false) fail("Topic-to-brief generated brief must be blocked.");
if (topicToBrief.generated_draft_allowed !== false) fail("Topic-to-brief generated draft must be blocked.");
if (topicToBrief.article_generation_allowed !== false) fail("Topic-to-brief article generation must be blocked.");
if (!topicToBrief.required_gates.includes("AG24B score 25+")) fail("AG24B score gate missing.");
if (!topicToBrief.required_gates.includes("AG23F source/reference gate")) fail("AG23F source gate missing.");

if (editorialHandoff.queue_mutation_allowed !== false) fail("Editorial handoff queue mutation must be blocked.");
if (editorialHandoff.admin_queue_mutation_allowed !== false) fail("Admin queue mutation must be blocked.");
if (editorialHandoff.editor_queue_mutation_allowed !== false) fail("Editor queue mutation must be blocked.");

if (!consumption.future_consumption?.future_dynamic_site) fail("Future dynamic site consumption note missing.");
if (blocker.status !== "episode_production_conveyor_operations_blocked_pending_ag24i") fail("Blocker register status mismatch.");
if (readiness.ready_for_ag24i !== true) fail("AG24I readiness missing.");
if (boundary.next_stage_id !== "AG24I") fail("AG24I boundary missing.");

if (review.summary.prior_ag_records_consumed !== true) fail("Prior AG records must be consumed.");
if (review.summary.episode_production_conveyor_created !== true) fail("Production conveyor summary missing.");
if (review.summary.production_stage_count !== 8) fail("Review must record 8 stages.");
if (review.summary.runtime_conveyor_enabled !== false) fail("Runtime conveyor must remain false.");
if (review.summary.topic_selected_for_production !== false) fail("Topic selection must remain false.");
if (review.summary.brief_generated !== false) fail("Brief generation must remain false.");
if (review.summary.draft_generated !== false) fail("Draft generation must remain false.");
if (review.summary.episode_generation_done !== false) fail("Episode generation must remain false.");
if (review.summary.article_generation_done !== false) fail("Article generation must remain false.");
if (review.summary.queue_mutation_done !== false) fail("Queue mutation must remain false.");

if (ag24gReadiness.ready_for_ag24h !== true) fail("AG24G readiness must allow AG24H.");
if (ag24gIndex.total_index_entries !== 36) fail("AG24G source index must contain 36 entries.");
if (registry.status !== "episode_production_conveyor_created_ready_for_ag24i") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.production_stage_count !== 8) fail("Preview must record 8 stages.");
if (preview.total_index_entries_available !== 36) fail("Preview must record 36 index entries.");
if (preview.runtime_conveyor_enabled !== 0) fail("Preview must record 0 runtime conveyor enabled.");
if (preview.selected_topics !== 0) fail("Preview must record 0 selected topics.");
if (preview.generated_briefs !== 0) fail("Preview must record 0 generated briefs.");
if (preview.generated_drafts !== 0) fail("Preview must record 0 generated drafts.");
if (preview.generated_episodes !== 0) fail("Preview must record 0 generated episodes.");
if (preview.generated_articles !== 0) fail("Preview must record 0 generated articles.");
if (preview.queue_mutations !== 0) fail("Preview must record 0 queue mutations.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  "data/content-intelligence/episodes/ag24f-episode-lifecycle-status-registry.json",
  "data/content-intelligence/quality-reviews/ag24g-episode-index-navigation-scaffold.json",
  "data/content-intelligence/episodes/ag24g-episode-index-navigation-scaffold.json",
  "data/content-intelligence/episodes/ag24g-non-active-episode-index-structure.json",
  "data/content-intelligence/episodes/ag24g-previous-next-navigation-contract.json",
  "data/content-intelligence/episodes/ag24g-lane-season-navigation-map.json",
  "data/content-intelligence/episodes/ag24g-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag24g-episode-production-conveyor-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24g-to-ag24h-episode-production-conveyor-boundary.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json"
]) {
  if (!conveyor.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Conveyor did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag24h"]) fail("Missing generate:ag24h script.");
if (!pkg.scripts?.["validate:ag24h"]) fail("Missing validate:ag24h script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag24h")) fail("validate:project must include validate:ag24h.");

pass("AG24H Episode Production Conveyor is present.");
pass("Production stage registry and topic-to-brief conveyor model are valid.");
pass("Editorial handoff model is valid and queue mutation remains blocked.");
pass("Prior AG24A/AG24B/AG24C/AG24D/AG24E/AG24F/AG24G/AG23G/AG23F/AG23Z records are consumed.");
pass("AG24I Episode Quality Audit boundary is ready.");
pass("No topic selection, brief/draft/article generation, queue mutation, GitHub write, deployment or publishing is enabled.");
