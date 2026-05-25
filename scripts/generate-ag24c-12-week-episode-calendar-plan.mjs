import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag24aReview: "data/content-intelligence/quality-reviews/ag24a-episodic-content-doctrine.json",
  ag24aDoctrine: "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  ag24aRhythm: "data/content-intelligence/episodes/ag24a-weekly-episodic-rhythm-doctrine.json",
  ag24aSeriesTypes: "data/content-intelligence/episodes/ag24a-series-type-registry.json",
  ag24bPlan: "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  ag23gScoringModel: "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  ag23fVerificationPlan: "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  ag23zClosure: "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag24c-12-week-episode-calendar-plan.json",
  calendarPlan: "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  laneStructure: "data/content-intelligence/episodes/ag24c-weekly-lane-calendar-structure.json",
  slotSchema: "data/content-intelligence/episodes/ag24c-episode-slot-schema.json",
  consumptionPlan: "data/content-intelligence/episodes/ag24c-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag24c-12-week-episode-calendar-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag24c-educational-series-structure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag24c-to-ag24d-educational-series-structure-plan-boundary.json",
  registry: "data/quality/ag24c-12-week-episode-calendar-plan.json",
  preview: "data/quality/ag24c-12-week-episode-calendar-plan-preview.json",
  doc: "docs/quality/AG24C_12_WEEK_EPISODE_CALENDAR_PLAN.md"
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
  if (!exists(p)) {
    throw new Error(`Missing AG24C input: ${p}`);
  }
}

const ag24aReview = readJson(inputs.ag24aReview);
const ag24aDoctrine = readJson(inputs.ag24aDoctrine);
const ag24aRhythm = readJson(inputs.ag24aRhythm);
const ag24aSeriesTypes = readJson(inputs.ag24aSeriesTypes);
const ag24bPlan = readJson(inputs.ag24bPlan);
const ag23gScoringModel = readJson(inputs.ag23gScoringModel);
const ag23fVerificationPlan = readJson(inputs.ag23fVerificationPlan);
const ag23zClosure = readJson(inputs.ag23zClosure);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag24aReview.status !== "episodic_content_doctrine_created_ready_for_ag24b") {
  throw new Error("AG24A review is not ready.");
}
if (ag24aDoctrine.status !== "episodic_content_doctrine_created_ready_for_ag24b") {
  throw new Error("AG24A doctrine status mismatch.");
}
if (ag24bPlan.stage !== "AG24B") {
  throw new Error("AG24B plan stage mismatch.");
}
if (ag24bPlan.status !== "governed_plan_only_non_active") {
  throw new Error("AG24B plan must remain non-active.");
}
if (ag23gScoringModel.status !== "first_light_topic_scoring_model_created_ready_for_ag23h") {
  throw new Error("AG23G scoring model status mismatch.");
}
if (ag23fVerificationPlan.status !== "first_light_source_verification_plan_created_ready_for_ag23g") {
  throw new Error("AG23F verification plan status mismatch.");
}
if (ag23zClosure.closure_decision?.ag23_closed !== true) {
  throw new Error("AG23Z closure not confirmed.");
}

const blockedState = {
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

const weekFrames = [
  "Orientation and promise",
  "Historical or conceptual background",
  "Core mechanism or central concept",
  "Evidence, sources and verification",
  "Case example or lived/public context",
  "Visual explanation and object-rich learning",
  "Application and practical interpretation",
  "Complexity, limitations and contradictions",
  "Comparison with adjacent ideas or systems",
  "Future direction and emerging questions",
  "Reader synthesis and reflective takeaway",
  "Season consolidation and next-season bridge"
];

const lanes = [
  {
    lane_id: "tuesday_learning",
    day: "Tuesday",
    product_name: "Tuesday Learning Series",
    primary_role: "Teach one evergreen topic chapter-wise.",
    allowed_topic_types: ["evergreen_educational_series", "public_systems_insight"],
    required_scoring_stage: "AG24B",
    required_decision: "strong_series_candidate",
    minimum_score_for_promotion: 25
  },
  {
    lane_id: "friday_world_lens",
    day: "Friday",
    product_name: "Friday World Lens / Burning Topic",
    primary_role: "Explain evolving public or world issues with context and continuity.",
    allowed_topic_types: ["burning_current_topic", "first_light_promoted_signal", "public_systems_insight"],
    required_scoring_stage: "AG24B",
    required_decision: "strong_series_candidate",
    minimum_score_for_promotion: 25
  },
  {
    lane_id: "sunday_deep_read",
    day: "Sunday",
    product_name: "Sunday Deep Read / Weekly Lens",
    primary_role: "Create a reflective flagship read connecting events, knowledge and meaning.",
    allowed_topic_types: ["reflective_cultural_topic", "public_systems_insight", "first_light_promoted_signal"],
    required_scoring_stage: "AG24B",
    required_decision: "strong_series_candidate",
    minimum_score_for_promotion: 25
  }
];

function pad(n) {
  return String(n).padStart(2, "0");
}

const calendarWeeks = Array.from({ length: 12 }, (_, idx) => {
  const week = idx + 1;
  return {
    week,
    week_frame: weekFrames[idx],
    status: "reserved_structure_only",
    slots: lanes.map((lane) => ({
      slot_id: `ag24c-w${pad(week)}-${lane.lane_id}`,
      week,
      day: lane.day,
      lane_id: lane.lane_id,
      product_name: lane.product_name,
      planned_badge: `${lane.product_name} — Season 1 — Episode ${pad(week)}`,
      editorial_purpose: lane.primary_role,
      week_frame: weekFrames[idx],
      allowed_topic_types: lane.allowed_topic_types,
      requires_scoring_stage: lane.required_scoring_stage,
      required_decision: lane.required_decision,
      minimum_score_for_promotion: lane.minimum_score_for_promotion,
      slot_topic_status: "reserved_not_selected",
      selected_topic_id: null,
      selected_topic_title: null,
      target_verified_references: 2,
      article_generation_allowed: false,
      public_visibility: false,
      publish_approved: false,
      backend_required: false,
      supabase_required: false
    }))
  };
});

const laneStructure = {
  module_id: "AG24C",
  title: "Weekly Lane Calendar Structure",
  status: "weekly_lane_calendar_structure_created_no_topic_selection",
  duration_weeks: 12,
  total_lanes: 3,
  total_reserved_slots: 36,
  lanes,
  week_frames: weekFrames,
  blocked_state: blockedState
};

const slotSchema = {
  module_id: "AG24C",
  title: "Episode Slot Schema",
  status: "episode_slot_schema_created_no_generation",
  fields: [
    "slot_id",
    "week",
    "day",
    "lane_id",
    "product_name",
    "planned_badge",
    "editorial_purpose",
    "week_frame",
    "allowed_topic_types",
    "requires_scoring_stage",
    "required_decision",
    "minimum_score_for_promotion",
    "slot_topic_status",
    "selected_topic_id",
    "selected_topic_title",
    "target_verified_references",
    "article_generation_allowed",
    "public_visibility",
    "publish_approved"
  ],
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG24C",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag24d_to_dynamic_site",
  future_consumption: {
    AG24D: "Educational Series Structure Plan should consume Tuesday Learning lane, week frames, selection gates and slot schema.",
    AG24E: "Burning Topic Series Structure Plan should consume Friday World Lens lane and continuity rules.",
    AG24F: "Episode Metadata Schema should translate lane, slot, badge, season and week-frame fields.",
    AG24G: "Episode Index and Navigation Scaffold should consume planned badges and week/episode ordering.",
    AG24H: "Episode Production Conveyor should consume the calendar as the scheduling boundary.",
    AG24I: "Episode Quality Audit should confirm no slot becomes random, unsupported or public without gates.",
    future_dynamic_site: "Later backend/Admin/Editor stages must consume this calendar plan as source-of-truth instead of redesigning weekly rhythm."
  },
  blocked_state: blockedState
};

const calendarPlan = {
  module_id: "AG24C",
  title: "12-Week Episode Calendar Plan",
  status: "twelve_week_episode_calendar_plan_created_ready_for_ag24d",
  purpose: "Create a non-active 12-week episode calendar structure for Drishvara episodes using AG24B scoring and AG24A rhythm doctrine.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: [
    inputs.ag24aReview,
    inputs.ag24aDoctrine,
    inputs.ag24aRhythm,
    inputs.ag24aSeriesTypes,
    inputs.ag24bPlan,
    inputs.ag23gScoringModel,
    inputs.ag23fVerificationPlan,
    inputs.ag23zClosure
  ],
  consumed_source_summary: {
    ag24a_rhythm_status: ag24aRhythm.status || "consumed",
    ag24a_series_type_status: ag24aSeriesTypes.status || "consumed",
    ag24b_status: ag24bPlan.status,
    ag23g_status: ag23gScoringModel.status,
    ag23f_status: ag23fVerificationPlan.status,
    ag23z_closed: ag23zClosure.closure_decision?.ag23_closed === true
  },
  calendar_scope: {
    duration_weeks: 12,
    total_lanes: 3,
    total_reserved_slots: 36,
    season_label: "Season 1",
    slot_status: "reserved_not_selected"
  },
  calendar_weeks: calendarWeeks,
  lane_structure_file: outputs.laneStructure,
  slot_schema_file: outputs.slotSchema,
  future_consumption_plan_file: outputs.consumptionPlan,
  topic_assignment_allowed_in_ag24c: false,
  article_generation_allowed_in_ag24c: false,
  target_verified_references_per_episode: 2,
  no_unsupported_breaking_news_claims: true,
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder || "Supabase/Auth/backend remains deferred and must not be activated without explicit approval.",
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG24C",
  title: "12-Week Episode Calendar Blocker Register",
  status: "episode_calendar_operations_blocked_pending_ag24d",
  blocked_items: [
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
  module_id: "AG24C",
  title: "Educational Series Structure Readiness Record",
  status: "ready_for_ag24d_educational_series_structure_plan",
  ready_for_ag24d: true,
  next_stage_id: "AG24D",
  next_stage_title: "Educational Series Structure Plan",
  calendar_plan_created: true,
  lane_structure_created: true,
  slot_schema_created: true,
  future_consumption_plan_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG24C",
  title: "AG24C to AG24D Educational Series Structure Plan Boundary",
  status: "ag24d_boundary_created_not_started",
  next_stage_id: "AG24D",
  next_stage_title: "Educational Series Structure Plan",
  allowed_scope: [
    "Consume Tuesday Learning lane and week-frame structure.",
    "Define chapter-wise educational series structure.",
    "Keep planning-only and non-mutating."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG24C",
  title: "12-Week Episode Calendar Plan",
  status: "twelve_week_episode_calendar_plan_created_ready_for_ag24d",
  depends_on: ["AG24A", "AG24B", "AG23G", "AG23F", "AG23Z"],
  generated_from: inputs,
  calendar_plan_file: outputs.calendarPlan,
  lane_structure_file: outputs.laneStructure,
  slot_schema_file: outputs.slotSchema,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    twelve_week_calendar_created: true,
    total_reserved_slots: 36,
    topic_assignment_done: false,
    article_generation_done: false,
    ready_for_ag24d: true,
    prior_ag_records_consumed: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG24C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG24C",
  preview_only: true,
  status: review.status,
  message: "AG24C 12-week episode calendar plan created. Next: AG24D Educational Series Structure Plan.",
  total_reserved_slots: 36,
  total_weeks: 12,
  total_lanes: 3,
  selected_topics: 0,
  generated_articles: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG24C — 12-Week Episode Calendar Plan

## Purpose

AG24C creates the non-active 12-week episode calendar structure for Drishvara.

## Consumed Source-of-Truth

- AG24A episodic content doctrine.
- AG24A weekly episodic rhythm doctrine.
- AG24A series type registry.
- AG24B topic selection and scoring engine plan.
- AG23G First Light topic scoring model.
- AG23F source verification plan.
- AG23Z Homepage Daily Surface and First Light closure.

## Calendar Rhythm

- Tuesday — Learning Series.
- Friday — World Lens / Burning Topic.
- Sunday — Deep Read / Weekly Lens.

## Output

AG24C reserves 36 structural slots across 12 weeks and 3 lanes. Each slot remains \`reserved_not_selected\`.

## Blocked State

No final topic selection, episode generation, article generation, file creation, GitHub write, deployment, publishing, homepage mutation, public index mutation, runtime write, or Supabase/Auth/backend activation is performed.

## Next Stage

AG24D — Educational Series Structure Plan.
`;

writeJson(outputs.review, review);
writeJson(outputs.calendarPlan, calendarPlan);
writeJson(outputs.laneStructure, laneStructure);
writeJson(outputs.slotSchema, slotSchema);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG24C 12-Week Episode Calendar Plan generated.");
console.log("✅ 12-week, 3-lane, 36-slot calendar structure created.");
console.log("✅ Prior AG24A/AG24B/AG23G/AG23F/AG23Z records consumed.");
console.log("✅ No topic selection, generation, GitHub write, deployment or publishing performed.");
console.log("✅ AG24D Educational Series Structure Plan boundary created.");
