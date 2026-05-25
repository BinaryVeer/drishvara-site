import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag24aDoctrine: "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  ag24aRhythm: "data/content-intelligence/episodes/ag24a-weekly-episodic-rhythm-doctrine.json",
  ag24aSeriesTypes: "data/content-intelligence/episodes/ag24a-series-type-registry.json",
  ag24bPlan: "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  ag24cReview: "data/content-intelligence/quality-reviews/ag24c-12-week-episode-calendar-plan.json",
  ag24cCalendarPlan: "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  ag24cLaneStructure: "data/content-intelligence/episodes/ag24c-weekly-lane-calendar-structure.json",
  ag24cSlotSchema: "data/content-intelligence/episodes/ag24c-episode-slot-schema.json",
  ag24cConsumptionPlan: "data/content-intelligence/episodes/ag24c-future-consumption-plan.json",
  ag24dReview: "data/content-intelligence/quality-reviews/ag24d-educational-series-structure-plan.json",
  ag24dStructurePlan: "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  ag24dTuesdayStructure: "data/content-intelligence/episodes/ag24d-tuesday-learning-series-structure.json",
  ag24dChapterModel: "data/content-intelligence/episodes/ag24d-educational-chapter-model.json",
  ag24dConsumptionPlan: "data/content-intelligence/episodes/ag24d-future-consumption-plan.json",
  ag24dReadiness: "data/content-intelligence/quality-registry/ag24d-burning-topic-series-structure-readiness-record.json",
  ag24dBoundary: "data/content-intelligence/mutation-plans/ag24d-to-ag24e-burning-topic-series-structure-plan-boundary.json",
  ag23gScoringModel: "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  ag23fVerificationPlan: "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  ag23zClosure: "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag24e-burning-topic-series-structure-plan.json",
  structurePlan: "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  fridayWorldLensStructure: "data/content-intelligence/episodes/ag24e-friday-world-lens-series-structure.json",
  continuityModel: "data/content-intelligence/episodes/ag24e-burning-topic-continuity-model.json",
  archetypeRegistry: "data/content-intelligence/episodes/ag24e-burning-topic-archetype-registry.json",
  consumptionPlan: "data/content-intelligence/episodes/ag24e-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag24e-burning-topic-series-structure-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag24e-episode-metadata-schema-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag24e-to-ag24f-episode-metadata-schema-boundary.json",
  registry: "data/quality/ag24e-burning-topic-series-structure-plan.json",
  preview: "data/quality/ag24e-burning-topic-series-structure-plan-preview.json",
  doc: "docs/quality/AG24E_BURNING_TOPIC_SERIES_STRUCTURE_PLAN.md"
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
  if (!exists(p)) throw new Error(`Missing AG24E input: ${p}`);
}

const ag24aDoctrine = readJson(inputs.ag24aDoctrine);
const ag24aRhythm = readJson(inputs.ag24aRhythm);
const ag24aSeriesTypes = readJson(inputs.ag24aSeriesTypes);
const ag24bPlan = readJson(inputs.ag24bPlan);
const ag24cReview = readJson(inputs.ag24cReview);
const ag24cCalendarPlan = readJson(inputs.ag24cCalendarPlan);
const ag24cLaneStructure = readJson(inputs.ag24cLaneStructure);
const ag24cSlotSchema = readJson(inputs.ag24cSlotSchema);
const ag24cConsumptionPlan = readJson(inputs.ag24cConsumptionPlan);
const ag24dReview = readJson(inputs.ag24dReview);
const ag24dStructurePlan = readJson(inputs.ag24dStructurePlan);
const ag24dTuesdayStructure = readJson(inputs.ag24dTuesdayStructure);
const ag24dChapterModel = readJson(inputs.ag24dChapterModel);
const ag24dConsumptionPlan = readJson(inputs.ag24dConsumptionPlan);
const ag24dReadiness = readJson(inputs.ag24dReadiness);
const ag24dBoundary = readJson(inputs.ag24dBoundary);
const ag23gScoringModel = readJson(inputs.ag23gScoringModel);
const ag23fVerificationPlan = readJson(inputs.ag23fVerificationPlan);
const ag23zClosure = readJson(inputs.ag23zClosure);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag24aDoctrine.status !== "episodic_content_doctrine_created_ready_for_ag24b") throw new Error("AG24A doctrine status mismatch.");
if (ag24bPlan.stage !== "AG24B") throw new Error("AG24B plan stage mismatch.");
if (ag24bPlan.status !== "governed_plan_only_non_active") throw new Error("AG24B plan must remain non-active.");
if (ag24cReview.status !== "twelve_week_episode_calendar_plan_created_ready_for_ag24d") throw new Error("AG24C review status mismatch.");
if (ag24cCalendarPlan.calendar_scope.total_reserved_slots !== 36) throw new Error("AG24C must have 36 reserved slots.");
if (ag24cLaneStructure.total_lanes !== 3) throw new Error("AG24C lane structure must have 3 lanes.");
if (ag24dReview.status !== "educational_series_structure_plan_created_ready_for_ag24e") throw new Error("AG24D review status mismatch.");
if (ag24dStructurePlan.status !== "educational_series_structure_plan_created_ready_for_ag24e") throw new Error("AG24D structure status mismatch.");
if (ag24dReadiness.ready_for_ag24e !== true) throw new Error("AG24D readiness does not permit AG24E.");
if (ag24dBoundary.next_stage_id !== "AG24E") throw new Error("AG24D boundary does not point to AG24E.");
if (ag23gScoringModel.status !== "first_light_topic_scoring_model_created_ready_for_ag23h") throw new Error("AG23G scoring model status mismatch.");
if (ag23fVerificationPlan.status !== "first_light_source_verification_plan_created_ready_for_ag23g") throw new Error("AG23F verification plan status mismatch.");
if (ag23zClosure.closure_decision?.ag23_closed !== true) throw new Error("AG23Z closure not confirmed.");

const blockedState = {
  burning_topic_selected: false,
  burning_series_activated: false,
  live_signal_feed_enabled: false,
  live_scraping_enabled: false,
  external_api_call_enabled: false,
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

const continuityFrames = [
  {
    episode_no: 1,
    continuity_role: "Issue orientation",
    purpose: "Define the topic, why it matters now, what is known, and what is not yet established."
  },
  {
    episode_no: 2,
    continuity_role: "Background and timeline",
    purpose: "Trace the relevant background, chronology and institutional/public context."
  },
  {
    episode_no: 3,
    continuity_role: "Key actors and forces",
    purpose: "Explain institutions, groups, technologies, policies, markets or social forces involved."
  },
  {
    episode_no: 4,
    continuity_role: "Evidence and source map",
    purpose: "Separate verified facts, credible reporting, official records, expert interpretation and open questions."
  },
  {
    episode_no: 5,
    continuity_role: "Public impact lens",
    purpose: "Explain impact on citizens, systems, economy, environment, governance, culture or everyday life."
  },
  {
    episode_no: 6,
    continuity_role: "Comparative perspective",
    purpose: "Compare with another country, sector, historical case, policy model or institutional response."
  },
  {
    episode_no: 7,
    continuity_role: "Risk, misinformation and uncertainty",
    purpose: "Record disputed claims, misinformation risks, unknowns, limitations and editorial cautions."
  },
  {
    episode_no: 8,
    continuity_role: "Scenario pathways",
    purpose: "Describe possible future pathways without pretending prediction certainty."
  },
  {
    episode_no: 9,
    continuity_role: "Governance and accountability view",
    purpose: "Explain who can act, what mechanisms exist, and what accountability questions matter."
  },
  {
    episode_no: 10,
    continuity_role: "Human and ethical dimension",
    purpose: "Connect the issue to human consequences, values, equity, trust and social meaning."
  },
  {
    episode_no: 11,
    continuity_role: "Reader synthesis",
    purpose: "Help the reader consolidate the moving issue and understand what to watch next."
  },
  {
    episode_no: 12,
    continuity_role: "Season review and continuation decision",
    purpose: "Close, extend, archive or convert the topic into a future deep-read/learning series candidate."
  }
];

const burningArchetypes = [
  {
    archetype_id: "ai_regulation_and_society",
    label: "AI Regulation and Society",
    status: "template_only_not_selected",
    topic_type: "burning_current_topic",
    allowed_lane: "friday_world_lens",
    selection_gate: "AG24B strong_series_candidate with score 25 or above; AG23G First Light bridge allowed only with source verification",
    source_caution: "Regulatory and technology claims require official, institutional or credible expert/editorial sources.",
    object_potential: ["regulation timeline", "risk-control matrix", "actor map", "comparison table"]
  },
  {
    archetype_id: "climate_water_stress_and_public_systems",
    label: "Climate, Water Stress and Public Systems",
    status: "template_only_not_selected",
    topic_type: "burning_current_topic",
    allowed_lane: "friday_world_lens",
    selection_gate: "AG24B strong_series_candidate with score 25 or above; source and uncertainty gates mandatory",
    source_caution: "Climate, water and public-system claims require careful separation of observed data, projections and interpretation.",
    object_potential: ["impact pathway", "water stress map concept", "source reliability table", "scenario matrix"]
  },
  {
    archetype_id: "global_conflict_and_geopolitical_shifts",
    label: "Global Conflict and Geopolitical Shifts",
    status: "template_only_not_selected",
    topic_type: "burning_current_topic",
    allowed_lane: "friday_world_lens",
    selection_gate: "AG24B strong_series_candidate with score 25 or above; high-sensitivity risk review required",
    source_caution: "Conflict topics require high factual caution, no propaganda amplification and no unsupported breaking-news claims.",
    object_potential: ["timeline", "actor map", "claim verification table", "scenario pathways"]
  },
  {
    archetype_id: "sports_governance_and_society",
    label: "Sports Governance and Society",
    status: "template_only_not_selected",
    topic_type: "burning_current_topic",
    allowed_lane: "friday_world_lens",
    selection_gate: "AG24B strong_series_candidate with score 25 or above",
    source_caution: "Sporting, institutional and public-facing claims require verified event records and credible reporting.",
    object_potential: ["event timeline", "institutional map", "rules explainer", "impact matrix"]
  },
  {
    archetype_id: "public_health_alert_and_system_response",
    label: "Public Health Alert and System Response",
    status: "template_only_not_selected",
    topic_type: "burning_current_topic",
    allowed_lane: "friday_world_lens",
    selection_gate: "AG24B strong_series_candidate with score 25 or above; health safety framing mandatory",
    source_caution: "Health-related topics must not provide diagnosis/treatment advice and must rely on official or credible medical/public health sources.",
    object_potential: ["response flow", "risk communication table", "do/don't disclaimer box", "institutional responsibility map"]
  },
  {
    archetype_id: "media_society_and_public_trust",
    label: "Media, Society and Public Trust",
    status: "template_only_not_selected",
    topic_type: "burning_current_topic",
    allowed_lane: "friday_world_lens",
    selection_gate: "AG24B strong_series_candidate with score 25 or above",
    source_caution: "Media/society claims require avoiding overgeneralisation and distinguishing evidence from interpretation.",
    object_potential: ["narrative flow", "claim-type table", "public trust map", "reflection box"]
  }
];

const fridayWorldLensStructure = {
  module_id: "AG24E",
  title: "Friday World Lens / Burning Topic Series Structure",
  status: "friday_world_lens_series_structure_created_no_topic_selection",
  source_calendar_lane: "friday_world_lens",
  source_calendar_file: inputs.ag24cCalendarPlan,
  season_length_weeks: 12,
  episode_count: 12,
  required_topic_gate: {
    scoring_stage: "AG24B",
    required_decision: "strong_series_candidate",
    minimum_total_score: 25,
    first_light_bridge_allowed: true,
    source_verification_stage: "AG23F",
    topic_bank_allowed_without_rescore: false
  },
  continuity_frames: continuityFrames,
  burning_archetypes: burningArchetypes.map((item) => item.archetype_id),
  blocked_state: blockedState
};

const continuityModel = {
  module_id: "AG24E",
  title: "Burning Topic Continuity Model",
  status: "burning_topic_continuity_model_created_no_live_feed",
  required_continuity_fields: [
    "episode_no",
    "continuity_role",
    "current_context",
    "what_changed_since_last_episode",
    "verified_facts",
    "source_requirement",
    "uncertainty_note",
    "risk_or_sensitivity_note",
    "visual_or_object_need",
    "reader_watchpoint",
    "previous_next_position"
  ],
  continuity_frames: continuityFrames,
  minimum_episode_count_for_series: 8,
  preferred_episode_count_for_season: 12,
  live_update_rule: "No live feed, scraping or API-driven update is allowed in AG24E. Any future update must pass manual source verification and editorial review.",
  blocked_state: blockedState
};

const archetypeRegistry = {
  module_id: "AG24E",
  title: "Burning Topic Archetype Registry",
  status: "burning_topic_archetype_registry_created_no_topic_selection",
  archetypes: burningArchetypes,
  use_rule: "Archetypes are examples/templates only. No archetype becomes a selected topic without AG24B scoring, AG23F source checks and later editorial selection.",
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG24E",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag24f_to_dynamic_site",
  future_consumption: {
    AG24F: "Episode Metadata Schema should convert lane, series_type, source_status, risk_status, continuity_role, current_context and previous/next fields into metadata.",
    AG24G: "Episode Index and Navigation Scaffold should use continuity order, Friday lane identity and episode status fields.",
    AG24H: "Episode Production Conveyor should use the AG24E continuity model before any burning-topic brief/draft generation.",
    AG24I: "Episode Quality Audit should verify source freshness, no unsupported breaking claims, continuity coherence and risk discipline.",
    AG24Z: "Episodic Knowledge Engine Closure should preserve Tuesday, Friday and Sunday series structures.",
    future_dynamic_site: "Later backend/Admin/Editor stages must consume the AG24E burning-topic continuity model as source-of-truth for Friday World Lens workflows."
  },
  blocked_state: blockedState
};

const structurePlan = {
  module_id: "AG24E",
  title: "Burning Topic Series Structure Plan",
  status: "burning_topic_series_structure_plan_created_ready_for_ag24f",
  purpose: "Define continuity format for evolving public/world topics through the Friday World Lens lane without selecting topics, enabling live feeds, scraping, API calls, article generation, publication or backend activation.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: [
    inputs.ag24aDoctrine,
    inputs.ag24aRhythm,
    inputs.ag24aSeriesTypes,
    inputs.ag24bPlan,
    inputs.ag24cReview,
    inputs.ag24cCalendarPlan,
    inputs.ag24cLaneStructure,
    inputs.ag24cSlotSchema,
    inputs.ag24cConsumptionPlan,
    inputs.ag24dReview,
    inputs.ag24dStructurePlan,
    inputs.ag24dTuesdayStructure,
    inputs.ag24dChapterModel,
    inputs.ag24dConsumptionPlan,
    inputs.ag24dReadiness,
    inputs.ag24dBoundary,
    inputs.ag23gScoringModel,
    inputs.ag23fVerificationPlan,
    inputs.ag23zClosure
  ],
  consumed_source_summary: {
    ag24a_status: ag24aDoctrine.status,
    ag24a_rhythm_status: ag24aRhythm.status || "consumed",
    ag24a_series_type_status: ag24aSeriesTypes.status || "consumed",
    ag24b_status: ag24bPlan.status,
    ag24c_status: ag24cCalendarPlan.status,
    ag24d_status: ag24dStructurePlan.status,
    ag24d_ready_for_ag24e: ag24dReadiness.ready_for_ag24e === true,
    ag23g_status: ag23gScoringModel.status,
    ag23f_status: ag23fVerificationPlan.status,
    ag23z_closed: ag23zClosure.closure_decision?.ag23_closed === true
  },
  structure_scope: {
    target_lane: "friday_world_lens",
    season_length_weeks: 12,
    continuity_episode_count: 12,
    archetype_count: burningArchetypes.length,
    topic_selection_status: "not_selected",
    live_feed_status: "blocked",
    episode_generation_status: "blocked"
  },
  friday_world_lens_structure_file: outputs.fridayWorldLensStructure,
  continuity_model_file: outputs.continuityModel,
  archetype_registry_file: outputs.archetypeRegistry,
  future_consumption_plan_file: outputs.consumptionPlan,
  continuity_frames: continuityFrames,
  burning_archetypes: burningArchetypes,
  topic_assignment_allowed_in_ag24e: false,
  live_signal_feed_allowed_in_ag24e: false,
  scraping_allowed_in_ag24e: false,
  external_api_call_allowed_in_ag24e: false,
  episode_generation_allowed_in_ag24e: false,
  article_generation_allowed_in_ag24e: false,
  target_verified_references_per_episode: 2,
  no_unsupported_breaking_news_claims: true,
  source_verification_required: true,
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder || "Supabase/Auth/backend remains deferred and must not be activated without explicit approval.",
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG24E",
  title: "Burning Topic Series Structure Blocker Register",
  status: "burning_topic_series_operations_blocked_pending_ag24f",
  blocked_items: [
    "No final burning topic selection.",
    "No burning topic series activation.",
    "No live signal feed.",
    "No scraping.",
    "No external API call.",
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
  module_id: "AG24E",
  title: "Episode Metadata Schema Readiness Record",
  status: "ready_for_ag24f_episode_metadata_schema",
  ready_for_ag24f: true,
  next_stage_id: "AG24F",
  next_stage_title: "Episode Metadata Schema",
  burning_topic_series_structure_created: true,
  friday_world_lens_structure_created: true,
  continuity_model_created: true,
  archetype_registry_created: true,
  future_consumption_plan_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG24E",
  title: "AG24E to AG24F Episode Metadata Schema Boundary",
  status: "ag24f_boundary_created_not_started",
  next_stage_id: "AG24F",
  next_stage_title: "Episode Metadata Schema",
  allowed_scope: [
    "Consume Tuesday Learning, Friday World Lens and Sunday Deep Read lane structures.",
    "Define metadata fields for series, season, episode, category, status, references and navigation.",
    "Include source verification and risk-status metadata for burning-topic episodes.",
    "Keep planning-only and non-mutating."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG24E",
  title: "Burning Topic Series Structure Plan",
  status: "burning_topic_series_structure_plan_created_ready_for_ag24f",
  depends_on: ["AG24A", "AG24B", "AG24C", "AG24D", "AG23G", "AG23F", "AG23Z"],
  generated_from: inputs,
  structure_plan_file: outputs.structurePlan,
  friday_world_lens_structure_file: outputs.fridayWorldLensStructure,
  continuity_model_file: outputs.continuityModel,
  archetype_registry_file: outputs.archetypeRegistry,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    burning_topic_series_structure_created: true,
    friday_world_lens_lane_consumed: true,
    continuity_model_created: true,
    archetype_templates_created: true,
    topic_assignment_done: false,
    live_feed_enabled: false,
    scraping_enabled: false,
    external_api_call_enabled: false,
    episode_generation_done: false,
    article_generation_done: false,
    ready_for_ag24f: true,
    prior_ag_records_consumed: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG24E",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG24E",
  preview_only: true,
  status: review.status,
  message: "AG24E burning topic series structure plan created. Next: AG24F Episode Metadata Schema.",
  target_lane: "friday_world_lens",
  continuity_episode_count: 12,
  archetype_count: burningArchetypes.length,
  selected_topics: 0,
  live_feeds: 0,
  generated_episodes: 0,
  generated_articles: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG24E — Burning Topic Series Structure Plan

## Purpose

AG24E defines the non-active continuity structure for Drishvara's Friday World Lens / Burning Topic Series.

## Consumed Source-of-Truth

- AG24A episodic content doctrine.
- AG24A weekly episodic rhythm doctrine.
- AG24A series type registry.
- AG24B topic selection and scoring engine plan.
- AG24C 12-week episode calendar plan.
- AG24D educational series structure plan.
- AG23G First Light topic scoring model.
- AG23F source verification plan.
- AG23Z Homepage Daily Surface and First Light closure.

## Burning Topic Series Scope

AG24E uses the Friday World Lens lane from AG24C and defines a continuity model for evolving public/world topics. It does not select a final topic, enable live feeds, scrape sources, call APIs, generate episodes, generate articles, publish, deploy, or activate backend systems.

## Example Burning Topic Archetypes

- AI Regulation and Society.
- Climate, Water Stress and Public Systems.
- Global Conflict and Geopolitical Shifts.
- Sports Governance and Society.
- Public Health Alert and System Response.
- Media, Society and Public Trust.

These are templates only. No archetype becomes a selected topic without AG24B scoring, AG23F source checks and later editorial review.

## Continuity Model

The 12-part continuity model covers issue orientation, background, actors, evidence, public impact, comparison, risk and uncertainty, scenarios, governance, human/ethical dimension, reader synthesis, and continuation decision.

## Blocked State

No final topic selection, live feed, scraping, API call, series activation, episode generation, article generation, file creation, GitHub write, deployment, publishing, homepage mutation, public index mutation, runtime write, or Supabase/Auth/backend activation is performed.

## Next Stage

AG24F — Episode Metadata Schema.
`;

writeJson(outputs.review, review);
writeJson(outputs.structurePlan, structurePlan);
writeJson(outputs.fridayWorldLensStructure, fridayWorldLensStructure);
writeJson(outputs.continuityModel, continuityModel);
writeJson(outputs.archetypeRegistry, archetypeRegistry);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG24E Burning Topic Series Structure Plan generated.");
console.log("✅ Friday World Lens lane, 12-part continuity model and burning topic archetype templates created.");
console.log("✅ Prior AG24A/AG24B/AG24C/AG24D/AG23G/AG23F/AG23Z records consumed.");
console.log("✅ No topic selection, live feed, scraping, API call, generation, GitHub write, deployment or publishing performed.");
console.log("✅ AG24F Episode Metadata Schema boundary created.");
