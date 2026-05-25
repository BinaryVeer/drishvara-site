import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag24aDoctrine: "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  ag24bPlan: "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  ag24cCalendarPlan: "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  ag24dStructurePlan: "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  ag24eStructurePlan: "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  ag24fMetadataSchema: "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  ag24fLifecycleRegistry: "data/content-intelligence/episodes/ag24f-episode-lifecycle-status-registry.json",
  ag24gReview: "data/content-intelligence/quality-reviews/ag24g-episode-index-navigation-scaffold.json",
  ag24gScaffold: "data/content-intelligence/episodes/ag24g-episode-index-navigation-scaffold.json",
  ag24gIndexStructure: "data/content-intelligence/episodes/ag24g-non-active-episode-index-structure.json",
  ag24gNavigationContract: "data/content-intelligence/episodes/ag24g-previous-next-navigation-contract.json",
  ag24gLaneSeasonMap: "data/content-intelligence/episodes/ag24g-lane-season-navigation-map.json",
  ag24gConsumptionPlan: "data/content-intelligence/episodes/ag24g-future-consumption-plan.json",
  ag24gReadiness: "data/content-intelligence/quality-registry/ag24g-episode-production-conveyor-readiness-record.json",
  ag24gBoundary: "data/content-intelligence/mutation-plans/ag24g-to-ag24h-episode-production-conveyor-boundary.json",
  ag23gScoringModel: "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  ag23fVerificationPlan: "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  ag23zClosure: "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag24h-episode-production-conveyor.json",
  conveyor: "data/content-intelligence/episodes/ag24h-episode-production-conveyor.json",
  stageRegistry: "data/content-intelligence/episodes/ag24h-production-stage-registry.json",
  topicToBriefModel: "data/content-intelligence/episodes/ag24h-topic-to-brief-conveyor-model.json",
  editorialHandoffModel: "data/content-intelligence/episodes/ag24h-editorial-review-handoff-model.json",
  consumptionPlan: "data/content-intelligence/episodes/ag24h-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag24h-episode-production-conveyor-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag24h-episode-quality-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag24h-to-ag24i-episode-quality-audit-boundary.json",
  registry: "data/quality/ag24h-episode-production-conveyor.json",
  preview: "data/quality/ag24h-episode-production-conveyor-preview.json",
  doc: "docs/quality/AG24H_EPISODE_PRODUCTION_CONVEYOR.md"
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
  if (!exists(p)) throw new Error(`Missing AG24H input: ${p}`);
}

const ag24aDoctrine = readJson(inputs.ag24aDoctrine);
const ag24bPlan = readJson(inputs.ag24bPlan);
const ag24cCalendarPlan = readJson(inputs.ag24cCalendarPlan);
const ag24dStructurePlan = readJson(inputs.ag24dStructurePlan);
const ag24eStructurePlan = readJson(inputs.ag24eStructurePlan);
const ag24fMetadataSchema = readJson(inputs.ag24fMetadataSchema);
const ag24fLifecycleRegistry = readJson(inputs.ag24fLifecycleRegistry);
const ag24gReview = readJson(inputs.ag24gReview);
const ag24gScaffold = readJson(inputs.ag24gScaffold);
const ag24gIndexStructure = readJson(inputs.ag24gIndexStructure);
const ag24gNavigationContract = readJson(inputs.ag24gNavigationContract);
const ag24gLaneSeasonMap = readJson(inputs.ag24gLaneSeasonMap);
const ag24gConsumptionPlan = readJson(inputs.ag24gConsumptionPlan);
const ag24gReadiness = readJson(inputs.ag24gReadiness);
const ag24gBoundary = readJson(inputs.ag24gBoundary);
const ag23gScoringModel = readJson(inputs.ag23gScoringModel);
const ag23fVerificationPlan = readJson(inputs.ag23fVerificationPlan);
const ag23zClosure = readJson(inputs.ag23zClosure);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag24aDoctrine.status !== "episodic_content_doctrine_created_ready_for_ag24b") throw new Error("AG24A doctrine status mismatch.");
if (ag24bPlan.stage !== "AG24B") throw new Error("AG24B plan stage mismatch.");
if (ag24bPlan.status !== "governed_plan_only_non_active") throw new Error("AG24B plan must remain non-active.");
if (ag24cCalendarPlan.calendar_scope.total_reserved_slots !== 36) throw new Error("AG24C calendar must contain 36 reserved slots.");
if (ag24dStructurePlan.status !== "educational_series_structure_plan_created_ready_for_ag24e") throw new Error("AG24D structure status mismatch.");
if (ag24eStructurePlan.status !== "burning_topic_series_structure_plan_created_ready_for_ag24f") throw new Error("AG24E structure status mismatch.");
if (ag24fMetadataSchema.status !== "episode_metadata_schema_created_ready_for_ag24g") throw new Error("AG24F metadata schema status mismatch.");
if (ag24gReview.status !== "episode_index_navigation_scaffold_created_ready_for_ag24h") throw new Error("AG24G review status mismatch.");
if (ag24gScaffold.status !== "episode_index_navigation_scaffold_created_ready_for_ag24h") throw new Error("AG24G scaffold status mismatch.");
if (ag24gIndexStructure.total_index_entries !== 36) throw new Error("AG24G index must contain 36 entries.");
if (ag24gReadiness.ready_for_ag24h !== true) throw new Error("AG24G readiness does not permit AG24H.");
if (ag24gBoundary.next_stage_id !== "AG24H") throw new Error("AG24G boundary does not point to AG24H.");
if (ag23gScoringModel.status !== "first_light_topic_scoring_model_created_ready_for_ag23h") throw new Error("AG23G scoring model status mismatch.");
if (ag23fVerificationPlan.status !== "first_light_source_verification_plan_created_ready_for_ag23g") throw new Error("AG23F verification plan status mismatch.");
if (ag23zClosure.closure_decision?.ag23_closed !== true) throw new Error("AG23Z closure not confirmed.");

const blockedState = {
  production_conveyor_runtime_enabled: false,
  topic_selected_for_production: false,
  brief_generated: false,
  draft_generated: false,
  article_generated: false,
  episode_file_created: false,
  article_file_created: false,
  editor_queue_mutated: false,
  admin_queue_mutated: false,
  public_index_mutated: false,
  homepage_mutated: false,
  data_written_to_runtime: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false,
  supabase_auth_backend_activated: false
};

const productionStages = [
  {
    stage_id: "candidate_intake",
    order: 1,
    purpose: "Accept a future topic candidate from AG24B scoring or a later editorial selection stage.",
    required_input: ["AG24B topic score", "AG24G index slot", "AG24F metadata shell"],
    output_status: "planned_not_executed"
  },
  {
    stage_id: "topic_score_gate",
    order: 2,
    purpose: "Confirm strong_series_candidate decision, score 25+, and lane compatibility.",
    required_input: ["AG24B decision", "AG24B total score", "topic type", "lane id"],
    output_status: "planned_not_executed"
  },
  {
    stage_id: "source_reference_gate",
    order: 3,
    purpose: "Confirm source verification path, two-reference target, and editorial-verification status.",
    required_input: ["AG23F verification doctrine", "reference status", "source caution note"],
    output_status: "planned_not_executed"
  },
  {
    stage_id: "risk_safety_gate",
    order: 4,
    purpose: "Confirm sensitivity, repetition, health/legal/political/spiritual and breaking-news cautions.",
    required_input: ["risk flags", "sensitivity score", "editorial caution note"],
    output_status: "planned_not_executed"
  },
  {
    stage_id: "lane_structure_mapping",
    order: 5,
    purpose: "Map the candidate to Tuesday, Friday or Sunday lane structure and season position.",
    required_input: ["AG24C lane", "AG24D chapter model or AG24E continuity model", "AG24G index entry"],
    output_status: "planned_not_executed"
  },
  {
    stage_id: "brief_skeleton_preparation",
    order: 6,
    purpose: "Prepare a future brief skeleton without generating prose, article body or public output.",
    required_input: ["learning question or continuity role", "source/risk contract", "visual/object need"],
    output_status: "planned_not_executed"
  },
  {
    stage_id: "editorial_review_handoff",
    order: 7,
    purpose: "Define future handoff to editorial/Admin review without mutating queues.",
    required_input: ["metadata shell", "brief skeleton state", "blocked/public flags"],
    output_status: "planned_not_executed"
  },
  {
    stage_id: "quality_audit_precheck",
    order: 8,
    purpose: "Prepare AG24I quality audit inputs for future completeness, source and risk checks.",
    required_input: ["metadata completeness", "source status", "risk status", "navigation status"],
    output_status: "planned_not_executed"
  }
];

const topicToBriefModel = {
  module_id: "AG24H",
  title: "Topic-to-Brief Conveyor Model",
  status: "topic_to_brief_conveyor_model_created_no_generation",
  model_type: "non_active_planning_contract",
  allowed_candidate_sources: [
    "AG24B strong_series_candidate",
    "future manually reviewed editorial selection",
    "future First Light promoted signal after AG23F source gate"
  ],
  required_gates: [
    "AG24B score 25+",
    "AG23F source/reference gate",
    "AG24F metadata shell",
    "AG24G non-active index slot",
    "risk/safety gate"
  ],
  generated_brief_allowed: false,
  generated_draft_allowed: false,
  article_generation_allowed: false,
  blocked_state: blockedState
};

const editorialHandoffModel = {
  module_id: "AG24H",
  title: "Editorial Review Handoff Model",
  status: "editorial_review_handoff_model_created_no_queue_mutation",
  handoff_type: "future_non_active_contract",
  future_review_payload_fields: [
    "episode_id",
    "series_id",
    "slot_id",
    "lane_id",
    "topic_id",
    "topic_title",
    "ag24b_score",
    "source_status",
    "reference_pack_status",
    "risk_status",
    "brief_skeleton_status",
    "public_visibility",
    "publish_approved"
  ],
  queue_mutation_allowed: false,
  admin_queue_mutation_allowed: false,
  editor_queue_mutation_allowed: false,
  blocked_state: blockedState
};

const stageRegistry = {
  module_id: "AG24H",
  title: "Production Stage Registry",
  status: "production_stage_registry_created_no_runtime",
  stage_count: productionStages.length,
  stages: productionStages,
  runtime_execution_allowed: false,
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG24H",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag24i_to_dynamic_site",
  future_consumption: {
    AG24I: "Episode Quality Audit should consume AG24H stage registry, topic-to-brief model and editorial handoff model to verify that future production remains gated.",
    AG24Z: "Episodic Knowledge Engine Closure should preserve AG24H as the canonical topic-to-brief-to-review planning conveyor.",
    future_dynamic_site: "Later backend/Admin/Editor stages may translate AG24H conveyor stages into real workflows only after explicit activation approval."
  },
  blocked_state: blockedState
};

const conveyor = {
  module_id: "AG24H",
  title: "Episode Production Conveyor",
  status: "episode_production_conveyor_created_ready_for_ag24i",
  purpose: "Define the non-active topic-to-brief-to-review conveyor for future Drishvara episodes while blocking generation, queue mutation, public output, GitHub write, deployment, publishing and backend activation.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: [
    inputs.ag24aDoctrine,
    inputs.ag24bPlan,
    inputs.ag24cCalendarPlan,
    inputs.ag24dStructurePlan,
    inputs.ag24eStructurePlan,
    inputs.ag24fMetadataSchema,
    inputs.ag24fLifecycleRegistry,
    inputs.ag24gReview,
    inputs.ag24gScaffold,
    inputs.ag24gIndexStructure,
    inputs.ag24gNavigationContract,
    inputs.ag24gLaneSeasonMap,
    inputs.ag24gConsumptionPlan,
    inputs.ag24gReadiness,
    inputs.ag24gBoundary,
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
    ag24g_status: ag24gScaffold.status,
    ag24g_ready_for_ag24h: ag24gReadiness.ready_for_ag24h === true,
    ag23g_status: ag23gScoringModel.status,
    ag23f_status: ag23fVerificationPlan.status,
    ag23z_closed: ag23zClosure.closure_decision?.ag23_closed === true
  },
  conveyor_scope: {
    conveyor_type: "non_active_topic_to_brief_to_review_planning",
    production_stage_count: productionStages.length,
    total_index_entries_available: ag24gIndexStructure.total_index_entries,
    runtime_execution_status: "blocked",
    generation_status: "blocked",
    queue_mutation_status: "blocked"
  },
  stage_registry_file: outputs.stageRegistry,
  topic_to_brief_model_file: outputs.topicToBriefModel,
  editorial_handoff_model_file: outputs.editorialHandoffModel,
  future_consumption_plan_file: outputs.consumptionPlan,
  production_conveyor_runtime_enabled: false,
  brief_generation_allowed_in_ag24h: false,
  draft_generation_allowed_in_ag24h: false,
  article_generation_allowed_in_ag24h: false,
  queue_mutation_allowed_in_ag24h: false,
  public_visibility_default: false,
  publish_approved_default: false,
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder || "Supabase/Auth/backend remains deferred and must not be activated without explicit approval.",
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG24H",
  title: "Episode Production Conveyor Blocker Register",
  status: "episode_production_conveyor_operations_blocked_pending_ag24i",
  blocked_items: [
    "No production conveyor runtime activation.",
    "No topic selection for production.",
    "No brief generation.",
    "No draft generation.",
    "No article generation.",
    "No episode file creation.",
    "No article file creation.",
    "No Editor queue mutation.",
    "No Admin queue mutation.",
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
  module_id: "AG24H",
  title: "Episode Quality Audit Readiness Record",
  status: "ready_for_ag24i_episode_quality_audit",
  ready_for_ag24i: true,
  next_stage_id: "AG24I",
  next_stage_title: "Episode Quality Audit",
  production_conveyor_created: true,
  stage_registry_created: true,
  topic_to_brief_model_created: true,
  editorial_handoff_model_created: true,
  future_consumption_plan_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG24H",
  title: "AG24H to AG24I Episode Quality Audit Boundary",
  status: "ag24i_boundary_created_not_started",
  next_stage_id: "AG24I",
  next_stage_title: "Episode Quality Audit",
  allowed_scope: [
    "Consume AG24H conveyor and stage registry.",
    "Define quality audit checks for metadata completeness, source discipline, risk discipline and non-public controls.",
    "Keep all generation and publication blocked."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG24H",
  title: "Episode Production Conveyor",
  status: "episode_production_conveyor_created_ready_for_ag24i",
  depends_on: ["AG24A", "AG24B", "AG24C", "AG24D", "AG24E", "AG24F", "AG24G", "AG23G", "AG23F", "AG23Z"],
  generated_from: inputs,
  conveyor_file: outputs.conveyor,
  stage_registry_file: outputs.stageRegistry,
  topic_to_brief_model_file: outputs.topicToBriefModel,
  editorial_handoff_model_file: outputs.editorialHandoffModel,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    episode_production_conveyor_created: true,
    production_stage_registry_created: true,
    production_stage_count: productionStages.length,
    topic_to_brief_model_created: true,
    editorial_handoff_model_created: true,
    runtime_conveyor_enabled: false,
    topic_selected_for_production: false,
    brief_generated: false,
    draft_generated: false,
    episode_generation_done: false,
    article_generation_done: false,
    queue_mutation_done: false,
    ready_for_ag24i: true,
    prior_ag_records_consumed: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG24H",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG24H",
  preview_only: true,
  status: review.status,
  message: "AG24H episode production conveyor created. Next: AG24I Episode Quality Audit.",
  production_stage_count: productionStages.length,
  total_index_entries_available: ag24gIndexStructure.total_index_entries,
  runtime_conveyor_enabled: 0,
  selected_topics: 0,
  generated_briefs: 0,
  generated_drafts: 0,
  generated_episodes: 0,
  generated_articles: 0,
  queue_mutations: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG24H — Episode Production Conveyor

## Purpose

AG24H defines the non-active topic-to-brief-to-review production conveyor for Drishvara's episodic knowledge engine.

## Consumed Source-of-Truth

- AG24A episodic content doctrine.
- AG24B topic selection and scoring engine plan.
- AG24C 12-week episode calendar plan.
- AG24D educational series structure plan.
- AG24E burning topic series structure plan.
- AG24F episode metadata schema.
- AG24G episode index and navigation scaffold.
- AG23G First Light topic scoring model.
- AG23F source verification plan.
- AG23Z Homepage Daily Surface and First Light closure.

## Conveyor Stages

1. Candidate intake.
2. Topic score gate.
3. Source/reference gate.
4. Risk/safety gate.
5. Lane structure mapping.
6. Brief skeleton preparation.
7. Editorial review handoff.
8. Quality audit precheck.

## Runtime Boundary

AG24H does not select topics, generate briefs, generate drafts, generate articles, mutate queues, create files, write to GitHub, deploy, publish, or activate Supabase/Auth/backend.

## Next Stage

AG24I — Episode Quality Audit.
`;

writeJson(outputs.review, review);
writeJson(outputs.conveyor, conveyor);
writeJson(outputs.stageRegistry, stageRegistry);
writeJson(outputs.topicToBriefModel, topicToBriefModel);
writeJson(outputs.editorialHandoffModel, editorialHandoffModel);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG24H Episode Production Conveyor generated.");
console.log("✅ Stage registry, topic-to-brief model and editorial handoff model created.");
console.log("✅ Prior AG24A/AG24B/AG24C/AG24D/AG24E/AG24F/AG24G/AG23G/AG23F/AG23Z records consumed.");
console.log("✅ No topic selection, brief/draft/article generation, queue mutation, GitHub write, deployment or publishing performed.");
console.log("✅ AG24I Episode Quality Audit boundary created.");
