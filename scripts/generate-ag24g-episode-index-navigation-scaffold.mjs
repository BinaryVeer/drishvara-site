import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag24aDoctrine: "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  ag24bPlan: "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  ag24cCalendarPlan: "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  ag24cLaneStructure: "data/content-intelligence/episodes/ag24c-weekly-lane-calendar-structure.json",
  ag24cSlotSchema: "data/content-intelligence/episodes/ag24c-episode-slot-schema.json",
  ag24dStructurePlan: "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  ag24dChapterModel: "data/content-intelligence/episodes/ag24d-educational-chapter-model.json",
  ag24eStructurePlan: "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  ag24eContinuityModel: "data/content-intelligence/episodes/ag24e-burning-topic-continuity-model.json",
  ag24fReview: "data/content-intelligence/quality-reviews/ag24f-episode-metadata-schema.json",
  ag24fMetadataSchema: "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  ag24fLifecycleRegistry: "data/content-intelligence/episodes/ag24f-episode-lifecycle-status-registry.json",
  ag24fSeriesSeasonContract: "data/content-intelligence/episodes/ag24f-series-season-slot-metadata-contract.json",
  ag24fNavigationRiskContract: "data/content-intelligence/episodes/ag24f-navigation-reference-risk-metadata-contract.json",
  ag24fConsumptionPlan: "data/content-intelligence/episodes/ag24f-future-consumption-plan.json",
  ag24fReadiness: "data/content-intelligence/quality-registry/ag24f-episode-index-navigation-scaffold-readiness-record.json",
  ag24fBoundary: "data/content-intelligence/mutation-plans/ag24f-to-ag24g-episode-index-navigation-scaffold-boundary.json",
  ag23gScoringModel: "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  ag23fVerificationPlan: "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  ag23zClosure: "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag24g-episode-index-navigation-scaffold.json",
  scaffold: "data/content-intelligence/episodes/ag24g-episode-index-navigation-scaffold.json",
  indexStructure: "data/content-intelligence/episodes/ag24g-non-active-episode-index-structure.json",
  navigationContract: "data/content-intelligence/episodes/ag24g-previous-next-navigation-contract.json",
  laneSeasonMap: "data/content-intelligence/episodes/ag24g-lane-season-navigation-map.json",
  consumptionPlan: "data/content-intelligence/episodes/ag24g-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag24g-episode-index-navigation-scaffold-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag24g-episode-production-conveyor-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag24g-to-ag24h-episode-production-conveyor-boundary.json",
  registry: "data/quality/ag24g-episode-index-navigation-scaffold.json",
  preview: "data/quality/ag24g-episode-index-navigation-scaffold-preview.json",
  doc: "docs/quality/AG24G_EPISODE_INDEX_NAVIGATION_SCAFFOLD.md"
};

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG24G input: ${p}`);
}

const ag24aDoctrine = readJson(inputs.ag24aDoctrine);
const ag24bPlan = readJson(inputs.ag24bPlan);
const ag24cCalendarPlan = readJson(inputs.ag24cCalendarPlan);
const ag24cLaneStructure = readJson(inputs.ag24cLaneStructure);
const ag24cSlotSchema = readJson(inputs.ag24cSlotSchema);
const ag24dStructurePlan = readJson(inputs.ag24dStructurePlan);
const ag24dChapterModel = readJson(inputs.ag24dChapterModel);
const ag24eStructurePlan = readJson(inputs.ag24eStructurePlan);
const ag24eContinuityModel = readJson(inputs.ag24eContinuityModel);
const ag24fReview = readJson(inputs.ag24fReview);
const ag24fMetadataSchema = readJson(inputs.ag24fMetadataSchema);
const ag24fLifecycleRegistry = readJson(inputs.ag24fLifecycleRegistry);
const ag24fSeriesSeasonContract = readJson(inputs.ag24fSeriesSeasonContract);
const ag24fNavigationRiskContract = readJson(inputs.ag24fNavigationRiskContract);
const ag24fConsumptionPlan = readJson(inputs.ag24fConsumptionPlan);
const ag24fReadiness = readJson(inputs.ag24fReadiness);
const ag24fBoundary = readJson(inputs.ag24fBoundary);
const ag23gScoringModel = readJson(inputs.ag23gScoringModel);
const ag23fVerificationPlan = readJson(inputs.ag23fVerificationPlan);
const ag23zClosure = readJson(inputs.ag23zClosure);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag24aDoctrine.status !== "episodic_content_doctrine_created_ready_for_ag24b") throw new Error("AG24A doctrine status mismatch.");
if (ag24bPlan.stage !== "AG24B") throw new Error("AG24B plan stage mismatch.");
if (ag24bPlan.status !== "governed_plan_only_non_active") throw new Error("AG24B plan must remain non-active.");
if (ag24cCalendarPlan.calendar_scope.total_reserved_slots !== 36) throw new Error("AG24C calendar must contain 36 reserved slots.");
if (ag24cLaneStructure.total_lanes !== 3) throw new Error("AG24C lane structure must contain 3 lanes.");
if (!Array.isArray(ag24cSlotSchema.fields) || ag24cSlotSchema.fields.length < 18) throw new Error("AG24C slot schema incomplete.");
if (ag24dStructurePlan.status !== "educational_series_structure_plan_created_ready_for_ag24e") throw new Error("AG24D structure status mismatch.");
if (!Array.isArray(ag24dChapterModel.chapter_frames) || ag24dChapterModel.chapter_frames.length !== 12) throw new Error("AG24D chapter model must contain 12 frames.");
if (ag24eStructurePlan.status !== "burning_topic_series_structure_plan_created_ready_for_ag24f") throw new Error("AG24E structure status mismatch.");
if (!Array.isArray(ag24eContinuityModel.continuity_frames) || ag24eContinuityModel.continuity_frames.length !== 12) throw new Error("AG24E continuity model must contain 12 frames.");
if (ag24fReview.status !== "episode_metadata_schema_created_ready_for_ag24g") throw new Error("AG24F review status mismatch.");
if (ag24fMetadataSchema.status !== "episode_metadata_schema_created_ready_for_ag24g") throw new Error("AG24F metadata schema status mismatch.");
if (ag24fReadiness.ready_for_ag24g !== true) throw new Error("AG24F readiness does not permit AG24G.");
if (ag24fBoundary.next_stage_id !== "AG24G") throw new Error("AG24F boundary does not point to AG24G.");
if (ag23gScoringModel.status !== "first_light_topic_scoring_model_created_ready_for_ag23h") throw new Error("AG23G scoring model status mismatch.");
if (ag23fVerificationPlan.status !== "first_light_source_verification_plan_created_ready_for_ag23g") throw new Error("AG23F verification plan status mismatch.");
if (ag23zClosure.closure_decision?.ag23_closed !== true) throw new Error("AG23Z closure not confirmed.");

const blockedState = {
  public_episode_index_created: false,
  public_navigation_created: false,
  runtime_navigation_enabled: false,
  episode_topic_selected: false,
  episode_generated: false,
  article_generated: false,
  episode_file_created: false,
  article_file_created: false,
  public_index_mutated: false,
  homepage_mutated: false,
  data_written_to_runtime: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false,
  supabase_auth_backend_activated: false
};

const laneOrder = ["tuesday_learning", "friday_world_lens", "sunday_deep_read"];
const laneLabels = {
  tuesday_learning: "Tuesday Learning Series",
  friday_world_lens: "Friday World Lens / Burning Topic",
  sunday_deep_read: "Sunday Deep Read / Weekly Lens"
};

function pad(n) {
  return String(n).padStart(2, "0");
}

const allSlots = ag24cCalendarPlan.calendar_weeks.flatMap((week) => week.slots);

const indexEntries = allSlots.map((slot) => {
  const lanePosition = laneOrder.indexOf(slot.lane_id);
  const previousEpisodeNo = slot.week > 1 ? slot.week - 1 : null;
  const nextEpisodeNo = slot.week < 12 ? slot.week + 1 : null;

  return {
    episode_id: `ag24-${slot.lane_id}-s01-e${pad(slot.week)}`,
    series_id: `ag24-${slot.lane_id}-season-01`,
    season_id: "ag24-season-01",
    slot_id: slot.slot_id,
    lane_id: slot.lane_id,
    lane_label: laneLabels[slot.lane_id] || slot.product_name,
    week: slot.week,
    episode_no: slot.week,
    day: slot.day,
    product_name: slot.product_name,
    planned_badge: slot.planned_badge,
    week_frame: slot.week_frame,
    index_position: (slot.week - 1) * laneOrder.length + lanePosition + 1,
    previous_episode_id: previousEpisodeNo ? `ag24-${slot.lane_id}-s01-e${pad(previousEpisodeNo)}` : null,
    next_episode_id: nextEpisodeNo ? `ag24-${slot.lane_id}-s01-e${pad(nextEpisodeNo)}` : null,
    lifecycle_status: "reserved_not_selected",
    topic_selection_status: "not_selected",
    public_visibility: false,
    publish_approved: false,
    article_generation_allowed: false,
    backend_required: false,
    supabase_required: false
  };
});

const laneSeasonMap = {
  module_id: "AG24G",
  title: "Lane and Season Navigation Map",
  status: "lane_season_navigation_map_created_non_active",
  season_id: "ag24-season-01",
  total_lanes: 3,
  total_weeks: 12,
  total_index_entries: indexEntries.length,
  lanes: laneOrder.map((lane_id) => ({
    lane_id,
    lane_label: laneLabels[lane_id],
    season_id: "ag24-season-01",
    episode_count: indexEntries.filter((entry) => entry.lane_id === lane_id).length,
    first_episode_id: `ag24-${lane_id}-s01-e01`,
    last_episode_id: `ag24-${lane_id}-s01-e12`,
    source_stage:
      lane_id === "tuesday_learning"
        ? "AG24D"
        : lane_id === "friday_world_lens"
          ? "AG24E"
          : "AG24C"
  })),
  blocked_state: blockedState
};

const navigationContract = {
  module_id: "AG24G",
  title: "Previous / Next Navigation Contract",
  status: "previous_next_navigation_contract_created_non_active",
  navigation_scope: {
    intra_lane_previous_next: true,
    cross_lane_navigation: "deferred",
    public_navigation_enabled: false,
    runtime_navigation_enabled: false
  },
  rules: [
    "Each lane has exactly 12 reserved episode positions.",
    "Previous and next navigation is intra-lane only in AG24G.",
    "Week 1 has no previous episode.",
    "Week 12 has no next episode.",
    "Navigation records remain non-active and must not create public links.",
    "No episode route, article route or public page is created in AG24G."
  ],
  blocked_state: blockedState
};

const indexStructure = {
  module_id: "AG24G",
  title: "Non-active Episode Index Structure",
  status: "non_active_episode_index_structure_created_no_public_index",
  index_type: "non_active_internal_scaffold",
  total_index_entries: indexEntries.length,
  expected_entries: 36,
  supported_lanes: laneOrder,
  entries: indexEntries,
  public_index_created: false,
  public_navigation_created: false,
  runtime_navigation_enabled: false,
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG24G",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag24h_to_dynamic_site",
  future_consumption: {
    AG24H: "Episode Production Conveyor should consume the non-active index entries, lifecycle status, previous/next navigation and lane-season map as scheduling inputs.",
    AG24I: "Episode Quality Audit should validate index completeness, navigation coherence, non-public status and metadata consistency.",
    AG24Z: "Episodic Knowledge Engine Closure should preserve AG24G as the canonical non-active episode index scaffold.",
    future_dynamic_site: "Later backend/Admin/Editor stages must translate AG24G index entries into runtime navigation only after explicit backend/static activation approval."
  },
  blocked_state: blockedState
};

const scaffold = {
  module_id: "AG24G",
  title: "Episode Index and Navigation Scaffold",
  status: "episode_index_navigation_scaffold_created_ready_for_ag24h",
  purpose: "Create a non-active internal episode index and previous/next navigation scaffold using AG24F metadata schema and AG24C reserved slots, without creating public pages, runtime navigation, article files, publishing or backend activation.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: [
    inputs.ag24aDoctrine,
    inputs.ag24bPlan,
    inputs.ag24cCalendarPlan,
    inputs.ag24cLaneStructure,
    inputs.ag24cSlotSchema,
    inputs.ag24dStructurePlan,
    inputs.ag24dChapterModel,
    inputs.ag24eStructurePlan,
    inputs.ag24eContinuityModel,
    inputs.ag24fReview,
    inputs.ag24fMetadataSchema,
    inputs.ag24fLifecycleRegistry,
    inputs.ag24fSeriesSeasonContract,
    inputs.ag24fNavigationRiskContract,
    inputs.ag24fConsumptionPlan,
    inputs.ag24fReadiness,
    inputs.ag24fBoundary,
    inputs.ag23gScoringModel,
    inputs.ag23fVerificationPlan,
    inputs.ag23zClosure
  ],
  consumed_source_summary: {
    ag24a_status: ag24aDoctrine.status,
    ag24b_status: ag24bPlan.status,
    ag24c_reserved_slots: ag24cCalendarPlan.calendar_scope.total_reserved_slots,
    ag24d_status: ag24dStructurePlan.status,
    ag24e_status: ag24eStructurePlan.status,
    ag24f_status: ag24fMetadataSchema.status,
    ag24f_ready_for_ag24g: ag24fReadiness.ready_for_ag24g === true,
    ag23g_status: ag23gScoringModel.status,
    ag23f_status: ag23fVerificationPlan.status,
    ag23z_closed: ag23zClosure.closure_decision?.ag23_closed === true
  },
  scaffold_scope: {
    index_type: "non_active_internal_scaffold",
    total_lanes: 3,
    total_weeks: 12,
    total_index_entries: indexEntries.length,
    public_index_status: "not_created",
    runtime_navigation_status: "blocked",
    article_generation_status: "blocked"
  },
  index_structure_file: outputs.indexStructure,
  navigation_contract_file: outputs.navigationContract,
  lane_season_map_file: outputs.laneSeasonMap,
  future_consumption_plan_file: outputs.consumptionPlan,
  public_index_created: false,
  public_navigation_created: false,
  runtime_navigation_enabled: false,
  article_generation_allowed_in_ag24g: false,
  target_verified_references_per_episode: 2,
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder || "Supabase/Auth/backend remains deferred and must not be activated without explicit approval.",
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG24G",
  title: "Episode Index and Navigation Scaffold Blocker Register",
  status: "episode_index_navigation_operations_blocked_pending_ag24h",
  blocked_items: [
    "No public episode index creation.",
    "No public navigation creation.",
    "No runtime navigation activation.",
    "No final episode topic selection.",
    "No episode generation.",
    "No article generation.",
    "No episode file creation.",
    "No article file creation.",
    "No public index mutation.",
    "No homepage mutation.",
    "No runtime data write.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No Supabase/Auth/backend activation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG24G",
  title: "Episode Production Conveyor Readiness Record",
  status: "ready_for_ag24h_episode_production_conveyor",
  ready_for_ag24h: true,
  next_stage_id: "AG24H",
  next_stage_title: "Episode Production Conveyor",
  episode_index_scaffold_created: true,
  navigation_contract_created: true,
  lane_season_map_created: true,
  future_consumption_plan_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG24G",
  title: "AG24G to AG24H Episode Production Conveyor Boundary",
  status: "ag24h_boundary_created_not_started",
  next_stage_id: "AG24H",
  next_stage_title: "Episode Production Conveyor",
  allowed_scope: [
    "Consume AG24G non-active index entries.",
    "Define topic-to-brief-to-review production conveyor.",
    "Use AG24F lifecycle and production-control fields.",
    "Keep all generation and publication blocked unless explicitly approved in later governed stages."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG24G",
  title: "Episode Index and Navigation Scaffold",
  status: "episode_index_navigation_scaffold_created_ready_for_ag24h",
  depends_on: ["AG24A", "AG24B", "AG24C", "AG24D", "AG24E", "AG24F", "AG23G", "AG23F", "AG23Z"],
  generated_from: inputs,
  scaffold_file: outputs.scaffold,
  index_structure_file: outputs.indexStructure,
  navigation_contract_file: outputs.navigationContract,
  lane_season_map_file: outputs.laneSeasonMap,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    episode_index_scaffold_created: true,
    non_active_index_entries_created: true,
    total_index_entries: indexEntries.length,
    navigation_contract_created: true,
    lane_season_map_created: true,
    public_index_created: false,
    public_navigation_created: false,
    runtime_navigation_enabled: false,
    topic_assignment_done: false,
    episode_generation_done: false,
    article_generation_done: false,
    ready_for_ag24h: true,
    prior_ag_records_consumed: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG24G",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG24G",
  preview_only: true,
  status: review.status,
  message: "AG24G episode index and navigation scaffold created. Next: AG24H Episode Production Conveyor.",
  total_index_entries: indexEntries.length,
  total_lanes: 3,
  total_weeks: 12,
  public_index_created: 0,
  public_navigation_created: 0,
  runtime_navigation_enabled: 0,
  selected_topics: 0,
  generated_episodes: 0,
  generated_articles: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG24G — Episode Index and Navigation Scaffold

## Purpose

AG24G creates a non-active internal episode index and previous/next navigation scaffold for Drishvara's episodic knowledge engine.

## Consumed Source-of-Truth

- AG24A episodic content doctrine.
- AG24B topic selection and scoring engine plan.
- AG24C 12-week episode calendar plan and slot schema.
- AG24D educational series structure plan.
- AG24E burning topic series structure plan.
- AG24F episode metadata schema.
- AG23G First Light topic scoring model.
- AG23F source verification plan.
- AG23Z Homepage Daily Surface and First Light closure.

## Scaffold Output

AG24G creates 36 non-active index entries across:

- Tuesday Learning Series.
- Friday World Lens / Burning Topic.
- Sunday Deep Read / Weekly Lens.

Each entry remains \`reserved_not_selected\`, non-public and non-publishable.

## Runtime Boundary

AG24G does not create public pages, public navigation, episode routes, article routes, article files, GitHub writes, deployment, publishing, or Supabase/Auth/backend activation.

## Next Stage

AG24H — Episode Production Conveyor.
`;

writeJson(outputs.review, review);
writeJson(outputs.scaffold, scaffold);
writeJson(outputs.indexStructure, indexStructure);
writeJson(outputs.navigationContract, navigationContract);
writeJson(outputs.laneSeasonMap, laneSeasonMap);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG24G Episode Index and Navigation Scaffold generated.");
console.log("✅ 36 non-active index entries, lane-season map and previous/next navigation contract created.");
console.log("✅ Prior AG24A/AG24B/AG24C/AG24D/AG24E/AG24F/AG23G/AG23F/AG23Z records consumed.");
console.log("✅ No public index, runtime navigation, generation, GitHub write, deployment or publishing performed.");
console.log("✅ AG24H Episode Production Conveyor boundary created.");
