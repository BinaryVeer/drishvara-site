import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag24aDoctrine: "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  ag24aRhythm: "data/content-intelligence/episodes/ag24a-weekly-episodic-rhythm-doctrine.json",
  ag24aSeriesTypes: "data/content-intelligence/episodes/ag24a-series-type-registry.json",
  ag24bPlan: "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  ag24cCalendarPlan: "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  ag24cSlotSchema: "data/content-intelligence/episodes/ag24c-episode-slot-schema.json",
  ag24dStructurePlan: "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  ag24dChapterModel: "data/content-intelligence/episodes/ag24d-educational-chapter-model.json",
  ag24eReview: "data/content-intelligence/quality-reviews/ag24e-burning-topic-series-structure-plan.json",
  ag24eStructurePlan: "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  ag24eFridayStructure: "data/content-intelligence/episodes/ag24e-friday-world-lens-series-structure.json",
  ag24eContinuityModel: "data/content-intelligence/episodes/ag24e-burning-topic-continuity-model.json",
  ag24eConsumptionPlan: "data/content-intelligence/episodes/ag24e-future-consumption-plan.json",
  ag24eReadiness: "data/content-intelligence/quality-registry/ag24e-episode-metadata-schema-readiness-record.json",
  ag24eBoundary: "data/content-intelligence/mutation-plans/ag24e-to-ag24f-episode-metadata-schema-boundary.json",
  ag23gScoringModel: "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  ag23fVerificationPlan: "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  ag23zClosure: "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag24f-episode-metadata-schema.json",
  metadataSchema: "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  lifecycleRegistry: "data/content-intelligence/episodes/ag24f-episode-lifecycle-status-registry.json",
  seriesSeasonContract: "data/content-intelligence/episodes/ag24f-series-season-slot-metadata-contract.json",
  navigationReferenceRiskContract: "data/content-intelligence/episodes/ag24f-navigation-reference-risk-metadata-contract.json",
  consumptionPlan: "data/content-intelligence/episodes/ag24f-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag24f-episode-metadata-schema-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag24f-episode-index-navigation-scaffold-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag24f-to-ag24g-episode-index-navigation-scaffold-boundary.json",
  registry: "data/quality/ag24f-episode-metadata-schema.json",
  preview: "data/quality/ag24f-episode-metadata-schema-preview.json",
  doc: "docs/quality/AG24F_EPISODE_METADATA_SCHEMA.md"
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
  if (!exists(p)) throw new Error(`Missing AG24F input: ${p}`);
}

const ag24aDoctrine = readJson(inputs.ag24aDoctrine);
const ag24aRhythm = readJson(inputs.ag24aRhythm);
const ag24aSeriesTypes = readJson(inputs.ag24aSeriesTypes);
const ag24bPlan = readJson(inputs.ag24bPlan);
const ag24cCalendarPlan = readJson(inputs.ag24cCalendarPlan);
const ag24cSlotSchema = readJson(inputs.ag24cSlotSchema);
const ag24dStructurePlan = readJson(inputs.ag24dStructurePlan);
const ag24dChapterModel = readJson(inputs.ag24dChapterModel);
const ag24eReview = readJson(inputs.ag24eReview);
const ag24eStructurePlan = readJson(inputs.ag24eStructurePlan);
const ag24eFridayStructure = readJson(inputs.ag24eFridayStructure);
const ag24eContinuityModel = readJson(inputs.ag24eContinuityModel);
const ag24eConsumptionPlan = readJson(inputs.ag24eConsumptionPlan);
const ag24eReadiness = readJson(inputs.ag24eReadiness);
const ag24eBoundary = readJson(inputs.ag24eBoundary);
const ag23gScoringModel = readJson(inputs.ag23gScoringModel);
const ag23fVerificationPlan = readJson(inputs.ag23fVerificationPlan);
const ag23zClosure = readJson(inputs.ag23zClosure);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag24aDoctrine.status !== "episodic_content_doctrine_created_ready_for_ag24b") throw new Error("AG24A doctrine status mismatch.");
if (ag24bPlan.stage !== "AG24B") throw new Error("AG24B plan stage mismatch.");
if (ag24bPlan.status !== "governed_plan_only_non_active") throw new Error("AG24B plan must remain non-active.");
if (ag24cCalendarPlan.calendar_scope.total_reserved_slots !== 36) throw new Error("AG24C calendar must contain 36 reserved slots.");
if (!Array.isArray(ag24cSlotSchema.fields) || ag24cSlotSchema.fields.length < 18) throw new Error("AG24C slot schema incomplete.");
if (ag24dStructurePlan.status !== "educational_series_structure_plan_created_ready_for_ag24e") throw new Error("AG24D structure status mismatch.");
if (!Array.isArray(ag24dChapterModel.chapter_frames) || ag24dChapterModel.chapter_frames.length !== 12) throw new Error("AG24D chapter model must contain 12 frames.");
if (ag24eReview.status !== "burning_topic_series_structure_plan_created_ready_for_ag24f") throw new Error("AG24E review status mismatch.");
if (ag24eStructurePlan.status !== "burning_topic_series_structure_plan_created_ready_for_ag24f") throw new Error("AG24E structure status mismatch.");
if (ag24eReadiness.ready_for_ag24f !== true) throw new Error("AG24E readiness does not permit AG24F.");
if (ag24eBoundary.next_stage_id !== "AG24F") throw new Error("AG24E boundary does not point to AG24F.");
if (ag23gScoringModel.status !== "first_light_topic_scoring_model_created_ready_for_ag23h") throw new Error("AG23G scoring model status mismatch.");
if (ag23fVerificationPlan.status !== "first_light_source_verification_plan_created_ready_for_ag23g") throw new Error("AG23F verification plan status mismatch.");
if (ag23zClosure.closure_decision?.ag23_closed !== true) throw new Error("AG23Z closure not confirmed.");

const blockedState = {
  metadata_runtime_enabled: false,
  episode_index_created: false,
  navigation_scaffold_created: false,
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

const lifecycleStatuses = [
  {
    status_id: "reserved_not_selected",
    meaning: "Calendar slot exists but no topic has been selected.",
    public_allowed: false,
    publish_allowed: false
  },
  {
    status_id: "topic_candidate_scored",
    meaning: "A topic candidate has AG24B scoring evidence but is not yet selected.",
    public_allowed: false,
    publish_allowed: false
  },
  {
    status_id: "selected_for_planning",
    meaning: "A future editorial stage selected the topic for planning only.",
    public_allowed: false,
    publish_allowed: false
  },
  {
    status_id: "brief_ready",
    meaning: "A future brief may be ready for internal review only.",
    public_allowed: false,
    publish_allowed: false
  },
  {
    status_id: "draft_ready_for_review",
    meaning: "A future draft may be ready for Admin/Editor review only.",
    public_allowed: false,
    publish_allowed: false
  },
  {
    status_id: "returned_for_correction",
    meaning: "A future Admin/Editor workflow may return the item for correction.",
    public_allowed: false,
    publish_allowed: false
  },
  {
    status_id: "publish_candidate",
    meaning: "A future item may become a candidate for publication only after all gates.",
    public_allowed: false,
    publish_allowed: false
  }
];

const metadataFieldGroups = {
  identity: [
    "episode_id",
    "series_id",
    "season_id",
    "slot_id",
    "lane_id",
    "episode_no",
    "week",
    "day",
    "product_name",
    "planned_badge"
  ],
  series_context: [
    "series_type",
    "series_title",
    "series_archetype_id",
    "chapter_role",
    "continuity_role",
    "week_frame",
    "learning_question",
    "current_context"
  ],
  topic_scoring: [
    "topic_id",
    "topic_title",
    "topic_type",
    "ag24b_decision",
    "ag24b_total_score",
    "ag24b_score_breakdown",
    "topic_selection_status"
  ],
  source_and_references: [
    "source_verification_required",
    "source_status",
    "target_verified_references",
    "reference_pack_status",
    "reference_count",
    "under_editorial_verification",
    "unsupported_claims_blocked"
  ],
  risk_and_safety: [
    "risk_status",
    "sensitivity_risk",
    "repetition_risk",
    "health_or_legal_or_political_caution",
    "breaking_news_caution",
    "editorial_caution_note"
  ],
  navigation: [
    "previous_episode_id",
    "next_episode_id",
    "index_position",
    "series_total_episodes",
    "navigation_status"
  ],
  production_control: [
    "lifecycle_status",
    "public_visibility",
    "publish_approved",
    "article_generation_allowed",
    "backend_required",
    "supabase_required",
    "created_by",
    "contact_email"
  ]
};

const schemaFields = Object.entries(metadataFieldGroups).flatMap(([group, fields]) =>
  fields.map((field) => ({
    field,
    group,
    required_in_ag24f: true,
    value_status: ["topic_id", "topic_title", "topic_selection_status", "ag24b_total_score"].includes(field)
      ? "future_value_blocked"
      : "schema_only",
    public_allowed_in_ag24f: false
  }))
);

const seriesSeasonContract = {
  module_id: "AG24F",
  title: "Series, Season and Slot Metadata Contract",
  status: "series_season_slot_metadata_contract_created_no_runtime",
  supported_lanes: [
    {
      lane_id: "tuesday_learning",
      source_stage: "AG24D",
      metadata_focus: "chapter_role, learning_question, educational sequence"
    },
    {
      lane_id: "friday_world_lens",
      source_stage: "AG24E",
      metadata_focus: "continuity_role, current_context, source/risk status"
    },
    {
      lane_id: "sunday_deep_read",
      source_stage: "AG24C",
      metadata_focus: "reflection/deep-read identity; detailed structure deferred to later AG24 stage"
    }
  ],
  season_contract: {
    season_id_format: "ag24-season-01",
    episode_id_format: "ag24-{lane_id}-s01-e{episode_no}",
    slot_id_source: "AG24C slot_id",
    season_length_weeks: 12,
    reserved_slot_count: 36
  },
  blocked_state: blockedState
};

const navigationReferenceRiskContract = {
  module_id: "AG24F",
  title: "Navigation, Reference and Risk Metadata Contract",
  status: "navigation_reference_risk_metadata_contract_created_no_index",
  navigation_contract: {
    previous_next_required_for_index_scaffold: true,
    episode_index_not_created_in_ag24f: true,
    next_stage_for_index: "AG24G"
  },
  reference_contract: {
    target_verified_references_per_episode: 2,
    source_verification_stage: "AG23F",
    unresolved_status_label: "under_editorial_verification",
    fake_links_blocked: true,
    unsupported_breaking_news_claims_blocked: true
  },
  risk_contract: {
    sensitivity_risk_required: true,
    repetition_risk_required: true,
    health_legal_political_spiritual_caution_required_where_applicable: true,
    live_feed_scraping_api_blocked: true
  },
  blocked_state: blockedState
};

const metadataSchema = {
  module_id: "AG24F",
  title: "Episode Metadata Schema",
  status: "episode_metadata_schema_created_ready_for_ag24g",
  purpose: "Define non-runtime metadata fields for Drishvara episodic knowledge records so future index, navigation, conveyor and quality stages can consume consistent episode identity, source, risk, navigation and production-control fields.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: [
    inputs.ag24aDoctrine,
    inputs.ag24aRhythm,
    inputs.ag24aSeriesTypes,
    inputs.ag24bPlan,
    inputs.ag24cCalendarPlan,
    inputs.ag24cSlotSchema,
    inputs.ag24dStructurePlan,
    inputs.ag24dChapterModel,
    inputs.ag24eReview,
    inputs.ag24eStructurePlan,
    inputs.ag24eFridayStructure,
    inputs.ag24eContinuityModel,
    inputs.ag24eConsumptionPlan,
    inputs.ag24eReadiness,
    inputs.ag24eBoundary,
    inputs.ag23gScoringModel,
    inputs.ag23fVerificationPlan,
    inputs.ag23zClosure
  ],
  consumed_source_summary: {
    ag24a_status: ag24aDoctrine.status,
    ag24a_rhythm_status: ag24aRhythm.status || "consumed",
    ag24a_series_type_status: ag24aSeriesTypes.status || "consumed",
    ag24b_status: ag24bPlan.status,
    ag24c_reserved_slots: ag24cCalendarPlan.calendar_scope.total_reserved_slots,
    ag24d_status: ag24dStructurePlan.status,
    ag24e_status: ag24eStructurePlan.status,
    ag24e_ready_for_ag24f: ag24eReadiness.ready_for_ag24f === true,
    ag23g_status: ag23gScoringModel.status,
    ag23f_status: ag23fVerificationPlan.status,
    ag23z_closed: ag23zClosure.closure_decision?.ag23_closed === true
  },
  schema_scope: {
    metadata_runtime_enabled: false,
    total_field_groups: Object.keys(metadataFieldGroups).length,
    total_schema_fields: schemaFields.length,
    supported_lanes: ["tuesday_learning", "friday_world_lens", "sunday_deep_read"],
    lifecycle_status_count: lifecycleStatuses.length,
    index_creation_status: "blocked_until_ag24g"
  },
  metadata_field_groups: metadataFieldGroups,
  schema_fields: schemaFields,
  lifecycle_registry_file: outputs.lifecycleRegistry,
  series_season_contract_file: outputs.seriesSeasonContract,
  navigation_reference_risk_contract_file: outputs.navigationReferenceRiskContract,
  future_consumption_plan_file: outputs.consumptionPlan,
  public_visibility_default: false,
  publish_approved_default: false,
  article_generation_allowed_default: false,
  backend_required_default: false,
  supabase_required_default: false,
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder || "Supabase/Auth/backend remains deferred and must not be activated without explicit approval.",
  blocked_state: blockedState
};

const lifecycleRegistry = {
  module_id: "AG24F",
  title: "Episode Lifecycle Status Registry",
  status: "episode_lifecycle_status_registry_created_no_runtime",
  lifecycle_statuses: lifecycleStatuses,
  default_status: "reserved_not_selected",
  public_visibility_rule: "No AG24F lifecycle status permits public visibility.",
  publish_approval_rule: "No AG24F lifecycle status permits publishing.",
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG24F",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag24g_to_dynamic_site",
  future_consumption: {
    AG24G: "Episode Index and Navigation Scaffold should consume episode_id, series_id, season_id, lane_id, episode_no, previous/next fields and lifecycle status.",
    AG24H: "Episode Production Conveyor should use lifecycle_status, topic scoring fields, source status, risk status and production-control fields.",
    AG24I: "Episode Quality Audit should validate metadata completeness, no fake references, no public flags and source/risk consistency.",
    AG24Z: "Episodic Knowledge Engine Closure should preserve metadata schema as the core episode contract.",
    future_dynamic_site: "Later backend/Admin/Editor stages must consume AG24F metadata fields instead of inventing runtime schemas from scratch."
  },
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG24F",
  title: "Episode Metadata Schema Blocker Register",
  status: "episode_metadata_runtime_operations_blocked_pending_ag24g",
  blocked_items: [
    "No metadata runtime activation.",
    "No episode index creation.",
    "No navigation scaffold creation.",
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
  module_id: "AG24F",
  title: "Episode Index and Navigation Scaffold Readiness Record",
  status: "ready_for_ag24g_episode_index_navigation_scaffold",
  ready_for_ag24g: true,
  next_stage_id: "AG24G",
  next_stage_title: "Episode Index and Navigation Scaffold",
  episode_metadata_schema_created: true,
  lifecycle_registry_created: true,
  series_season_contract_created: true,
  navigation_reference_risk_contract_created: true,
  future_consumption_plan_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG24F",
  title: "AG24F to AG24G Episode Index and Navigation Scaffold Boundary",
  status: "ag24g_boundary_created_not_started",
  next_stage_id: "AG24G",
  next_stage_title: "Episode Index and Navigation Scaffold",
  allowed_scope: [
    "Consume AG24F episode metadata schema.",
    "Define non-active episode index structure.",
    "Define previous/next navigation scaffold.",
    "Keep all episode records non-public and non-mutating."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG24F",
  title: "Episode Metadata Schema",
  status: "episode_metadata_schema_created_ready_for_ag24g",
  depends_on: ["AG24A", "AG24B", "AG24C", "AG24D", "AG24E", "AG23G", "AG23F", "AG23Z"],
  generated_from: inputs,
  metadata_schema_file: outputs.metadataSchema,
  lifecycle_registry_file: outputs.lifecycleRegistry,
  series_season_contract_file: outputs.seriesSeasonContract,
  navigation_reference_risk_contract_file: outputs.navigationReferenceRiskContract,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    episode_metadata_schema_created: true,
    lifecycle_registry_created: true,
    series_season_contract_created: true,
    navigation_reference_risk_contract_created: true,
    total_schema_fields: schemaFields.length,
    metadata_runtime_enabled: false,
    episode_index_created: false,
    navigation_scaffold_created: false,
    topic_assignment_done: false,
    episode_generation_done: false,
    article_generation_done: false,
    ready_for_ag24g: true,
    prior_ag_records_consumed: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG24F",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG24F",
  preview_only: true,
  status: review.status,
  message: "AG24F episode metadata schema created. Next: AG24G Episode Index and Navigation Scaffold.",
  total_field_groups: Object.keys(metadataFieldGroups).length,
  total_schema_fields: schemaFields.length,
  supported_lanes: 3,
  lifecycle_statuses: lifecycleStatuses.length,
  episode_index_created: 0,
  navigation_scaffold_created: 0,
  selected_topics: 0,
  generated_episodes: 0,
  generated_articles: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG24F — Episode Metadata Schema

## Purpose

AG24F defines the non-runtime episode metadata schema for Drishvara's episodic knowledge engine.

## Consumed Source-of-Truth

- AG24A episodic content doctrine.
- AG24B topic selection and scoring engine plan.
- AG24C 12-week episode calendar plan and slot schema.
- AG24D educational series structure plan.
- AG24E burning topic series structure plan.
- AG23G First Light topic scoring model.
- AG23F source verification plan.
- AG23Z Homepage Daily Surface and First Light closure.

## Metadata Field Groups

- Identity.
- Series context.
- Topic scoring.
- Source and references.
- Risk and safety.
- Navigation.
- Production control.

## Runtime Boundary

AG24F creates schema records only. It does not create a runtime metadata system, episode index, navigation pages, episode files, article files, public index mutation, GitHub write, deployment, publishing, or Supabase/Auth/backend activation.

## Next Stage

AG24G — Episode Index and Navigation Scaffold.
`;

writeJson(outputs.review, review);
writeJson(outputs.metadataSchema, metadataSchema);
writeJson(outputs.lifecycleRegistry, lifecycleRegistry);
writeJson(outputs.seriesSeasonContract, seriesSeasonContract);
writeJson(outputs.navigationReferenceRiskContract, navigationReferenceRiskContract);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG24F Episode Metadata Schema generated.");
console.log("✅ Metadata field groups, lifecycle registry and navigation/reference/risk contracts created.");
console.log("✅ Prior AG24A/AG24B/AG24C/AG24D/AG24E/AG23G/AG23F/AG23Z records consumed.");
console.log("✅ No runtime metadata activation, index creation, generation, GitHub write, deployment or publishing performed.");
console.log("✅ AG24G Episode Index and Navigation Scaffold boundary created.");
