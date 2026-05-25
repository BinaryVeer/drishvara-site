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
  ag24cReadiness: "data/content-intelligence/quality-registry/ag24c-educational-series-structure-readiness-record.json",
  ag24cBoundary: "data/content-intelligence/mutation-plans/ag24c-to-ag24d-educational-series-structure-plan-boundary.json",
  ag23gScoringModel: "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  ag23fVerificationPlan: "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  ag23zClosure: "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag24d-educational-series-structure-plan.json",
  structurePlan: "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  tuesdayLearningStructure: "data/content-intelligence/episodes/ag24d-tuesday-learning-series-structure.json",
  chapterModel: "data/content-intelligence/episodes/ag24d-educational-chapter-model.json",
  archetypeRegistry: "data/content-intelligence/episodes/ag24d-educational-series-archetype-registry.json",
  consumptionPlan: "data/content-intelligence/episodes/ag24d-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag24d-educational-series-structure-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag24d-burning-topic-series-structure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag24d-to-ag24e-burning-topic-series-structure-plan-boundary.json",
  registry: "data/quality/ag24d-educational-series-structure-plan.json",
  preview: "data/quality/ag24d-educational-series-structure-plan-preview.json",
  doc: "docs/quality/AG24D_EDUCATIONAL_SERIES_STRUCTURE_PLAN.md"
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
  if (!exists(p)) throw new Error(`Missing AG24D input: ${p}`);
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
const ag24cReadiness = readJson(inputs.ag24cReadiness);
const ag24cBoundary = readJson(inputs.ag24cBoundary);
const ag23gScoringModel = readJson(inputs.ag23gScoringModel);
const ag23fVerificationPlan = readJson(inputs.ag23fVerificationPlan);
const ag23zClosure = readJson(inputs.ag23zClosure);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag24aDoctrine.status !== "episodic_content_doctrine_created_ready_for_ag24b") throw new Error("AG24A doctrine status mismatch.");
if (ag24bPlan.stage !== "AG24B") throw new Error("AG24B plan stage mismatch.");
if (ag24bPlan.status !== "governed_plan_only_non_active") throw new Error("AG24B plan must remain non-active.");
if (ag24cReview.status !== "twelve_week_episode_calendar_plan_created_ready_for_ag24d") throw new Error("AG24C review status mismatch.");
if (ag24cCalendarPlan.status !== "twelve_week_episode_calendar_plan_created_ready_for_ag24d") throw new Error("AG24C calendar status mismatch.");
if (ag24cCalendarPlan.calendar_scope.total_reserved_slots !== 36) throw new Error("AG24C must have 36 reserved slots.");
if (ag24cLaneStructure.total_lanes !== 3) throw new Error("AG24C lane structure must have 3 lanes.");
if (ag24cReadiness.ready_for_ag24d !== true) throw new Error("AG24C readiness does not permit AG24D.");
if (ag24cBoundary.next_stage_id !== "AG24D") throw new Error("AG24C boundary does not point to AG24D.");
if (ag23gScoringModel.status !== "first_light_topic_scoring_model_created_ready_for_ag23h") throw new Error("AG23G scoring model status mismatch.");
if (ag23fVerificationPlan.status !== "first_light_source_verification_plan_created_ready_for_ag23g") throw new Error("AG23F verification plan status mismatch.");
if (ag23zClosure.closure_decision?.ag23_closed !== true) throw new Error("AG23Z closure not confirmed.");

const blockedState = {
  educational_topic_selected: false,
  educational_series_activated: false,
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

const chapterFrames = [
  {
    chapter_no: 1,
    chapter_role: "Orientation and promise",
    purpose: "Introduce the learning question, season promise, reader benefit and scope boundary."
  },
  {
    chapter_no: 2,
    chapter_role: "Historical or conceptual background",
    purpose: "Explain origin, vocabulary and why the concept matters."
  },
  {
    chapter_no: 3,
    chapter_role: "Core mechanism or central concept",
    purpose: "Teach the basic structure or mechanism in simple but disciplined form."
  },
  {
    chapter_no: 4,
    chapter_role: "Evidence, sources and verification",
    purpose: "Show how the topic is known, sourced, debated or verified."
  },
  {
    chapter_no: 5,
    chapter_role: "Case example or lived/public context",
    purpose: "Translate the concept into an example, public system, historical case or practical scenario."
  },
  {
    chapter_no: 6,
    chapter_role: "Visual explanation and object-rich learning",
    purpose: "Use diagrams, tables, concept maps, timelines or examples to improve understanding."
  },
  {
    chapter_no: 7,
    chapter_role: "Application and practical interpretation",
    purpose: "Explain how readers can apply the concept or interpret related real-world situations."
  },
  {
    chapter_no: 8,
    chapter_role: "Complexity, limitations and contradictions",
    purpose: "Record caveats, competing views, limitations and misuse risks."
  },
  {
    chapter_no: 9,
    chapter_role: "Comparison with adjacent ideas or systems",
    purpose: "Compare with related concepts, schools, methods, systems or interpretations."
  },
  {
    chapter_no: 10,
    chapter_role: "Future direction and emerging questions",
    purpose: "Discuss what is changing, unresolved or likely to matter next."
  },
  {
    chapter_no: 11,
    chapter_role: "Reader synthesis and reflective takeaway",
    purpose: "Help the reader consolidate what was learned and reflect on its meaning."
  },
  {
    chapter_no: 12,
    chapter_role: "Season consolidation and next-season bridge",
    purpose: "Summarise the season and prepare continuation, archive, or adjacent series planning."
  }
];

const educationalArchetypes = [
  {
    archetype_id: "vedic_mathematics_learning_series",
    label: "Vedic Mathematics Learning Series",
    status: "template_only_not_selected",
    topic_type: "evergreen_educational_series",
    allowed_lane: "tuesday_learning",
    selection_gate: "AG24B strong_series_candidate with score 25 or above",
    source_caution: "No unsupported scriptural attribution; Sanskrit and historical claims require source discipline.",
    object_potential: ["worked examples", "method comparison table", "step diagram", "practice box"]
  },
  {
    archetype_id: "genetics_mutations_learning_series",
    label: "Genetics and Mutations Learning Series",
    status: "template_only_not_selected",
    topic_type: "evergreen_educational_series",
    allowed_lane: "tuesday_learning",
    selection_gate: "AG24B strong_series_candidate with score 25 or above",
    source_caution: "Scientific and health-related claims require credible references and non-medical-advice framing.",
    object_potential: ["gene-to-trait flow diagram", "mutation type table", "risk disclaimer box", "case timeline"]
  },
  {
    archetype_id: "engines_and_technology_learning_series",
    label: "Engines and Technology Evolution Learning Series",
    status: "template_only_not_selected",
    topic_type: "evergreen_educational_series",
    allowed_lane: "tuesday_learning",
    selection_gate: "AG24B strong_series_candidate with score 25 or above",
    source_caution: "Technical claims must separate simplified explanation from engineering precision.",
    object_potential: ["mechanism diagram", "timeline", "component table", "system map"]
  },
  {
    archetype_id: "health_diagnosis_fundamentals_learning_series",
    label: "Health Diagnosis Fundamentals Learning Series",
    status: "template_only_not_selected",
    topic_type: "evergreen_educational_series",
    allowed_lane: "tuesday_learning",
    selection_gate: "AG24B strong_series_candidate with score 25 or above",
    source_caution: "Must not provide diagnosis or treatment advice; must remain educational and source-backed.",
    object_potential: ["process flow", "test-purpose table", "red-flag disclaimer", "example interpretation box"]
  },
  {
    archetype_id: "ai_for_public_systems_learning_series",
    label: "AI for Public Systems Learning Series",
    status: "template_only_not_selected",
    topic_type: "public_systems_insight",
    allowed_lane: "tuesday_learning",
    selection_gate: "AG24B strong_series_candidate with score 25 or above",
    source_caution: "Public-system claims require policy, institutional, technical or credible editorial source checks.",
    object_potential: ["governance flow", "risk-control matrix", "case comparison", "implementation map"]
  }
];

const tuesdayLearningStructure = {
  module_id: "AG24D",
  title: "Tuesday Learning Series Structure",
  status: "tuesday_learning_series_structure_created_no_topic_selection",
  source_calendar_lane: "tuesday_learning",
  source_calendar_file: inputs.ag24cCalendarPlan,
  season_length_weeks: 12,
  episode_count: 12,
  required_topic_gate: {
    scoring_stage: "AG24B",
    required_decision: "strong_series_candidate",
    minimum_total_score: 25,
    topic_bank_allowed_without_rescore: false
  },
  chapter_frames: chapterFrames,
  educational_archetypes: educationalArchetypes.map((item) => item.archetype_id),
  blocked_state: blockedState
};

const chapterModel = {
  module_id: "AG24D",
  title: "Educational Chapter Model",
  status: "educational_chapter_model_created_no_episode_generation",
  required_chapter_fields: [
    "chapter_no",
    "chapter_role",
    "learning_question",
    "core_concept",
    "source_requirement",
    "visual_or_object_need",
    "reader_takeaway",
    "risk_or_caution",
    "previous_next_position"
  ],
  chapter_frames: chapterFrames,
  minimum_episode_count_for_series: 8,
  preferred_episode_count_for_season: 12,
  blocked_state: blockedState
};

const archetypeRegistry = {
  module_id: "AG24D",
  title: "Educational Series Archetype Registry",
  status: "educational_series_archetype_registry_created_no_topic_selection",
  archetypes: educationalArchetypes,
  use_rule: "Archetypes are examples/templates only. No archetype becomes a selected topic without AG24B scoring and later editorial selection.",
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG24D",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag24e_to_dynamic_site",
  future_consumption: {
    AG24E: "Burning Topic Series Structure Plan should consume AG24D's continuity lessons but focus on evolving public/world topics through the Friday World Lens lane.",
    AG24F: "Episode Metadata Schema should convert chapter_no, chapter_role, learning_question, lane_id, season and source-gate fields into metadata.",
    AG24G: "Episode Index and Navigation Scaffold should use chapter order and previous/next position from AG24D.",
    AG24H: "Episode Production Conveyor should use the AG24D chapter model before draft generation.",
    AG24I: "Episode Quality Audit should verify educational sequence, source discipline, visual usefulness, non-randomness and no unsupported claims.",
    future_dynamic_site: "Later backend/Admin/Editor stages must consume the AG24D educational structure as source-of-truth for Tuesday Learning workflows."
  },
  blocked_state: blockedState
};

const structurePlan = {
  module_id: "AG24D",
  title: "Educational Series Structure Plan",
  status: "educational_series_structure_plan_created_ready_for_ag24e",
  purpose: "Define chapter-wise teaching structure for Tuesday Learning Series using AG24C calendar lanes and AG24B scoring gates, without selecting topics or generating episodes.",
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
    inputs.ag24cReadiness,
    inputs.ag24cBoundary,
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
    ag24c_ready_for_ag24d: ag24cReadiness.ready_for_ag24d === true,
    ag23g_status: ag23gScoringModel.status,
    ag23f_status: ag23fVerificationPlan.status,
    ag23z_closed: ag23zClosure.closure_decision?.ag23_closed === true
  },
  structure_scope: {
    target_lane: "tuesday_learning",
    season_length_weeks: 12,
    chapter_count: 12,
    archetype_count: educationalArchetypes.length,
    topic_selection_status: "not_selected",
    episode_generation_status: "blocked"
  },
  tuesday_learning_structure_file: outputs.tuesdayLearningStructure,
  chapter_model_file: outputs.chapterModel,
  archetype_registry_file: outputs.archetypeRegistry,
  future_consumption_plan_file: outputs.consumptionPlan,
  chapter_frames: chapterFrames,
  educational_archetypes: educationalArchetypes,
  topic_assignment_allowed_in_ag24d: false,
  episode_generation_allowed_in_ag24d: false,
  article_generation_allowed_in_ag24d: false,
  target_verified_references_per_episode: 2,
  no_unsupported_educational_claims: true,
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder || "Supabase/Auth/backend remains deferred and must not be activated without explicit approval.",
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG24D",
  title: "Educational Series Structure Blocker Register",
  status: "educational_series_operations_blocked_pending_ag24e",
  blocked_items: [
    "No final educational topic selection.",
    "No educational series activation.",
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
  module_id: "AG24D",
  title: "Burning Topic Series Structure Readiness Record",
  status: "ready_for_ag24e_burning_topic_series_structure_plan",
  ready_for_ag24e: true,
  next_stage_id: "AG24E",
  next_stage_title: "Burning Topic Series Structure Plan",
  educational_series_structure_created: true,
  tuesday_learning_structure_created: true,
  chapter_model_created: true,
  archetype_registry_created: true,
  future_consumption_plan_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG24D",
  title: "AG24D to AG24E Burning Topic Series Structure Plan Boundary",
  status: "ag24e_boundary_created_not_started",
  next_stage_id: "AG24E",
  next_stage_title: "Burning Topic Series Structure Plan",
  allowed_scope: [
    "Consume AG24D continuity and chapter-sequencing lessons.",
    "Define Friday World Lens / Burning Topic continuity format.",
    "Keep planning-only and non-mutating."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG24D",
  title: "Educational Series Structure Plan",
  status: "educational_series_structure_plan_created_ready_for_ag24e",
  depends_on: ["AG24A", "AG24B", "AG24C", "AG23G", "AG23F", "AG23Z"],
  generated_from: inputs,
  structure_plan_file: outputs.structurePlan,
  tuesday_learning_structure_file: outputs.tuesdayLearningStructure,
  chapter_model_file: outputs.chapterModel,
  archetype_registry_file: outputs.archetypeRegistry,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    educational_series_structure_created: true,
    tuesday_learning_lane_consumed: true,
    chapter_model_created: true,
    archetype_templates_created: true,
    topic_assignment_done: false,
    episode_generation_done: false,
    article_generation_done: false,
    ready_for_ag24e: true,
    prior_ag_records_consumed: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG24D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG24D",
  preview_only: true,
  status: review.status,
  message: "AG24D educational series structure plan created. Next: AG24E Burning Topic Series Structure Plan.",
  target_lane: "tuesday_learning",
  chapter_count: 12,
  archetype_count: educationalArchetypes.length,
  selected_topics: 0,
  generated_episodes: 0,
  generated_articles: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG24D — Educational Series Structure Plan

## Purpose

AG24D defines the non-active chapter-wise teaching structure for Drishvara's Tuesday Learning Series.

## Consumed Source-of-Truth

- AG24A episodic content doctrine.
- AG24A weekly episodic rhythm doctrine.
- AG24A series type registry.
- AG24B topic selection and scoring engine plan.
- AG24C 12-week episode calendar plan.
- AG23G First Light topic scoring model.
- AG23F source verification plan.
- AG23Z Homepage Daily Surface and First Light closure.

## Educational Series Scope

AG24D uses the Tuesday Learning lane from AG24C and defines a 12-chapter educational arc. It does not select a final topic.

## Example Educational Archetypes

- Vedic Mathematics Learning Series.
- Genetics and Mutations Learning Series.
- Engines and Technology Evolution Learning Series.
- Health Diagnosis Fundamentals Learning Series.
- AI for Public Systems Learning Series.

These are templates only. No archetype becomes a selected topic without AG24B scoring and later editorial review.

## Blocked State

No final topic selection, series activation, episode generation, article generation, file creation, GitHub write, deployment, publishing, homepage mutation, public index mutation, runtime write, or Supabase/Auth/backend activation is performed.

## Next Stage

AG24E — Burning Topic Series Structure Plan.
`;

writeJson(outputs.review, review);
writeJson(outputs.structurePlan, structurePlan);
writeJson(outputs.tuesdayLearningStructure, tuesdayLearningStructure);
writeJson(outputs.chapterModel, chapterModel);
writeJson(outputs.archetypeRegistry, archetypeRegistry);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG24D Educational Series Structure Plan generated.");
console.log("✅ Tuesday Learning lane, 12-chapter model and educational archetype templates created.");
console.log("✅ Prior AG24A/AG24B/AG24C/AG23G/AG23F/AG23Z records consumed.");
console.log("✅ No topic selection, generation, GitHub write, deployment or publishing performed.");
console.log("✅ AG24E Burning Topic Series Structure Plan boundary created.");
