import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag24aReview: "data/content-intelligence/quality-reviews/ag24a-episodic-content-doctrine.json",
  ag24aDoctrine: "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  ag24bPlan: "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  ag24cReview: "data/content-intelligence/quality-reviews/ag24c-12-week-episode-calendar-plan.json",
  ag24cCalendarPlan: "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  ag24dReview: "data/content-intelligence/quality-reviews/ag24d-educational-series-structure-plan.json",
  ag24dStructurePlan: "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  ag24eReview: "data/content-intelligence/quality-reviews/ag24e-burning-topic-series-structure-plan.json",
  ag24eStructurePlan: "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  ag24fReview: "data/content-intelligence/quality-reviews/ag24f-episode-metadata-schema.json",
  ag24fMetadataSchema: "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  ag24gReview: "data/content-intelligence/quality-reviews/ag24g-episode-index-navigation-scaffold.json",
  ag24gScaffold: "data/content-intelligence/episodes/ag24g-episode-index-navigation-scaffold.json",
  ag24hReview: "data/content-intelligence/quality-reviews/ag24h-episode-production-conveyor.json",
  ag24hConveyor: "data/content-intelligence/episodes/ag24h-episode-production-conveyor.json",
  ag24iReview: "data/content-intelligence/quality-reviews/ag24i-episode-quality-audit.json",
  ag24iAuditPlan: "data/content-intelligence/episodes/ag24i-episode-quality-audit-plan.json",
  ag24iReadiness: "data/content-intelligence/quality-registry/ag24i-episodic-knowledge-engine-closure-readiness-record.json",
  ag24iBoundary: "data/content-intelligence/mutation-plans/ag24i-to-ag24z-episodic-knowledge-engine-closure-boundary.json",
  ag23gScoringModel: "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  ag23fVerificationPlan: "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  ag23zClosure: "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag24z-episodic-knowledge-engine-closure.json",
  closure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  sourceChain: "data/content-intelligence/episodes/ag24z-ag24-source-chain-register.json",
  nonActivation: "data/content-intelligence/episodes/ag24z-non-activation-closure-register.json",
  ag25Handoff: "data/content-intelligence/episodes/ag24z-ag25-featured-reads-handoff-plan.json",
  consumptionPlan: "data/content-intelligence/episodes/ag24z-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag24z-episodic-knowledge-engine-closure-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag24z-featured-reads-production-strengthening-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag24z-to-ag25-featured-reads-production-strengthening-boundary.json",
  registry: "data/quality/ag24z-episodic-knowledge-engine-closure.json",
  preview: "data/quality/ag24z-episodic-knowledge-engine-closure-preview.json",
  doc: "docs/quality/AG24Z_EPISODIC_KNOWLEDGE_ENGINE_CLOSURE.md"
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
  if (!exists(p)) throw new Error(`Missing AG24Z input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag24aDoctrine.status !== "episodic_content_doctrine_created_ready_for_ag24b") throw new Error("AG24A doctrine status mismatch.");
if (records.ag24bPlan.status !== "governed_plan_only_non_active") throw new Error("AG24B plan status mismatch.");
if (records.ag24cCalendarPlan.status !== "twelve_week_episode_calendar_plan_created_ready_for_ag24d") throw new Error("AG24C calendar status mismatch.");
if (records.ag24cCalendarPlan.calendar_scope.total_reserved_slots !== 36) throw new Error("AG24C must have 36 reserved slots.");
if (records.ag24dStructurePlan.status !== "educational_series_structure_plan_created_ready_for_ag24e") throw new Error("AG24D structure status mismatch.");
if (records.ag24eStructurePlan.status !== "burning_topic_series_structure_plan_created_ready_for_ag24f") throw new Error("AG24E structure status mismatch.");
if (records.ag24fMetadataSchema.status !== "episode_metadata_schema_created_ready_for_ag24g") throw new Error("AG24F metadata status mismatch.");
if (records.ag24gScaffold.status !== "episode_index_navigation_scaffold_created_ready_for_ag24h") throw new Error("AG24G scaffold status mismatch.");
if (records.ag24hConveyor.status !== "episode_production_conveyor_created_ready_for_ag24i") throw new Error("AG24H conveyor status mismatch.");
if (records.ag24iAuditPlan.status !== "episode_quality_audit_created_ready_for_ag24z") throw new Error("AG24I audit status mismatch.");
if (records.ag24iReadiness.ready_for_ag24z !== true) throw new Error("AG24I readiness does not permit AG24Z.");
if (records.ag24iBoundary.next_stage_id !== "AG24Z") throw new Error("AG24I boundary does not point to AG24Z.");
if (records.ag23zClosure.closure_decision?.ag23_closed !== true) throw new Error("AG23Z closure not confirmed.");

const blockedState = {
  ag24_chain_closed: true,
  public_publish_enabled: false,
  article_generation_enabled: false,
  episode_generation_enabled: false,
  topic_selection_enabled: false,
  live_feed_enabled: false,
  scraping_enabled: false,
  external_api_call_enabled: false,
  runtime_navigation_enabled: false,
  production_conveyor_runtime_enabled: false,
  quality_audit_runtime_enabled: false,
  public_index_mutated: false,
  homepage_mutated: false,
  data_written_to_runtime: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false,
  supabase_auth_backend_activated: false
};

const stageChain = [
  { stage_id: "AG24A", title: "Episodic Content Doctrine", status: records.ag24aDoctrine.status, file: inputs.ag24aDoctrine },
  { stage_id: "AG24B", title: "Topic Selection and Scoring Engine Plan", status: records.ag24bPlan.status, file: inputs.ag24bPlan },
  { stage_id: "AG24C", title: "12-Week Episode Calendar Plan", status: records.ag24cCalendarPlan.status, file: inputs.ag24cCalendarPlan },
  { stage_id: "AG24D", title: "Educational Series Structure Plan", status: records.ag24dStructurePlan.status, file: inputs.ag24dStructurePlan },
  { stage_id: "AG24E", title: "Burning Topic Series Structure Plan", status: records.ag24eStructurePlan.status, file: inputs.ag24eStructurePlan },
  { stage_id: "AG24F", title: "Episode Metadata Schema", status: records.ag24fMetadataSchema.status, file: inputs.ag24fMetadataSchema },
  { stage_id: "AG24G", title: "Episode Index and Navigation Scaffold", status: records.ag24gScaffold.status, file: inputs.ag24gScaffold },
  { stage_id: "AG24H", title: "Episode Production Conveyor", status: records.ag24hConveyor.status, file: inputs.ag24hConveyor },
  { stage_id: "AG24I", title: "Episode Quality Audit", status: records.ag24iAuditPlan.status, file: inputs.ag24iAuditPlan }
];

const sourceChain = {
  module_id: "AG24Z",
  title: "AG24 Source Chain Register",
  status: "ag24_source_chain_registered_for_closure",
  chain_length: stageChain.length,
  closed_chain: stageChain,
  external_dependencies_consumed: [
    inputs.ag23fVerificationPlan,
    inputs.ag23gScoringModel,
    inputs.ag23zClosure
  ],
  blocked_state: blockedState
};

const nonActivation = {
  module_id: "AG24Z",
  title: "Non-Activation Closure Register",
  status: "non_activation_closure_confirmed",
  closure_guards: {
    no_topic_selection: true,
    no_episode_generation: true,
    no_article_generation: true,
    no_public_index_mutation: true,
    no_homepage_mutation: true,
    no_runtime_navigation: true,
    no_live_feed: true,
    no_scraping: true,
    no_external_api_call: true,
    no_github_write_automation: true,
    no_deploy: true,
    no_publish: true,
    no_supabase: true,
    no_auth: true,
    no_backend_activation: true
  },
  blocked_state: blockedState
};

const ag25Handoff = {
  module_id: "AG24Z",
  title: "AG25 Featured Reads Production Strengthening Handoff Plan",
  status: "ag25_handoff_created_not_started",
  next_stage_id: "AG25",
  next_stage_title: "Featured Reads Production Strengthening",
  handoff_assets: [
    "AG24A doctrine for episodic rhythm and guardrails",
    "AG24B topic scoring engine",
    "AG24C 12-week calendar and 36-slot structure",
    "AG24D Tuesday Learning educational structure",
    "AG24E Friday World Lens burning-topic continuity model",
    "AG24F episode metadata schema",
    "AG24G non-active index and navigation scaffold",
    "AG24H production conveyor",
    "AG24I quality audit checklist and source/risk controls"
  ],
  handoff_constraints: [
    "AG25 must not ignore AG24 records.",
    "AG25 must remain non-publish/non-deploy unless separately approved.",
    "AG25 must preserve source verification and two-reference discipline.",
    "AG25 must preserve non-Supabase/non-backend status unless explicitly activated later."
  ],
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG24Z",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag25_and_later_dynamic_site",
  future_consumption: {
    AG25: "Featured Reads Production Strengthening should consume AG24 closure records and translate applicable topic scoring, metadata, reference and quality gates into featured-read production strengthening.",
    AG26: "Admin/Editor Manual Workflow Strengthening should later consume AG24H/AG24I workflow and quality concepts without activating backend prematurely.",
    AG27: "Supabase/Auth/Backend Decision Checkpoint must explicitly revisit the deferred backend decision before any activation.",
    future_dynamic_site: "Later backend/Admin/Editor stages must translate AG24 records into runtime objects only after explicit approval."
  },
  blocked_state: blockedState
};

const closure = {
  module_id: "AG24Z",
  title: "Episodic Knowledge Engine Closure",
  status: "episodic_knowledge_engine_closed_ready_for_ag25",
  purpose: "Close the AG24 Episodic Knowledge Engine planning chain as a governed, non-active foundation for Drishvara's future episodic content workflows.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_stage_chain: stageChain,
  closure_decision: {
    ag24_closed: true,
    ready_for_ag25: true,
    next_stage_id: "AG25",
    next_stage_title: "Featured Reads Production Strengthening",
    static_github_controlled_path_preserved: true,
    supabase_auth_backend_deferred: true,
    no_public_mutation_done: true,
    no_runtime_activation_done: true
  },
  closure_summary: {
    stages_closed: stageChain.length,
    calendar_reserved_slots: records.ag24cCalendarPlan.calendar_scope.total_reserved_slots,
    metadata_schema_created: true,
    index_scaffold_created: true,
    production_conveyor_created: true,
    quality_audit_created: true,
    topic_selection_done: false,
    episode_generation_done: false,
    article_generation_done: false,
    public_publish_done: false,
    backend_activation_done: false
  },
  source_chain_file: outputs.sourceChain,
  non_activation_closure_file: outputs.nonActivation,
  ag25_handoff_plan_file: outputs.ag25Handoff,
  future_consumption_plan_file: outputs.consumptionPlan,
  supabase_reminder: records.supabaseReminder.reminder || "Supabase/Auth/backend remains deferred and must not be activated without explicit approval.",
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG24Z",
  title: "Episodic Knowledge Engine Closure Blocker Register",
  status: "ag24_closed_runtime_operations_blocked_pending_ag25",
  blocked_items: [
    "No AG24 runtime activation.",
    "No topic selection.",
    "No episode generation.",
    "No article generation.",
    "No public index mutation.",
    "No homepage mutation.",
    "No runtime navigation activation.",
    "No GitHub write automation.",
    "No deployment trigger.",
    "No publishing.",
    "No Supabase/Auth/backend activation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG24Z",
  title: "Featured Reads Production Strengthening Readiness Record",
  status: "ready_for_ag25_featured_reads_production_strengthening",
  ready_for_ag25: true,
  next_stage_id: "AG25",
  next_stage_title: "Featured Reads Production Strengthening",
  ag24_closure_created: true,
  source_chain_registered: true,
  non_activation_closure_confirmed: true,
  ag25_handoff_plan_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG24Z",
  title: "AG24Z to AG25 Featured Reads Production Strengthening Boundary",
  status: "ag25_boundary_created_not_started",
  next_stage_id: "AG25",
  next_stage_title: "Featured Reads Production Strengthening",
  allowed_scope: [
    "Consume AG24 source chain and closure record.",
    "Strengthen Featured Reads production planning.",
    "Carry forward source verification, metadata and quality gates.",
    "Remain non-publish/non-deploy/no-backend unless separately approved."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG24Z",
  title: "Episodic Knowledge Engine Closure",
  status: "episodic_knowledge_engine_closed_ready_for_ag25",
  depends_on: ["AG24A", "AG24B", "AG24C", "AG24D", "AG24E", "AG24F", "AG24G", "AG24H", "AG24I", "AG23F", "AG23G", "AG23Z"],
  generated_from: inputs,
  closure_file: outputs.closure,
  source_chain_file: outputs.sourceChain,
  non_activation_closure_file: outputs.nonActivation,
  ag25_handoff_file: outputs.ag25Handoff,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    ag24_closed: true,
    ready_for_ag25: true,
    stages_closed: stageChain.length,
    prior_ag_records_consumed: true,
    real_execution_done: false,
    public_publish_done: false,
    backend_activation_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG24Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG24Z",
  preview_only: true,
  status: review.status,
  message: "AG24Z episodic knowledge engine closure created. Next: AG25 Featured Reads Production Strengthening.",
  stages_closed: stageChain.length,
  ready_for_ag25: true,
  topic_selection_done: 0,
  generated_episodes: 0,
  generated_articles: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG24Z — Episodic Knowledge Engine Closure

## Purpose

AG24Z closes the AG24 Episodic Knowledge Engine planning chain.

## Closed Chain

- AG24A — Episodic Content Doctrine.
- AG24B — Topic Selection and Scoring Engine Plan.
- AG24C — 12-Week Episode Calendar Plan.
- AG24D — Educational Series Structure Plan.
- AG24E — Burning Topic Series Structure Plan.
- AG24F — Episode Metadata Schema.
- AG24G — Episode Index and Navigation Scaffold.
- AG24H — Episode Production Conveyor.
- AG24I — Episode Quality Audit.

## Closure Finding

AG24 is closed as a governed, non-active, non-publishing, no-deploy, no-Supabase and no-backend planning foundation.

## Handoff

Next stage: AG25 — Featured Reads Production Strengthening.

AG25 must consume AG24 records as source-of-truth and must not redesign the episodic foundation from scratch.

## Blocked State

No topic selection, episode generation, article generation, public index mutation, homepage mutation, GitHub write automation, deployment, publishing, runtime activation or Supabase/Auth/backend activation is performed.
`;

writeJson(outputs.review, review);
writeJson(outputs.closure, closure);
writeJson(outputs.sourceChain, sourceChain);
writeJson(outputs.nonActivation, nonActivation);
writeJson(outputs.ag25Handoff, ag25Handoff);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG24Z Episodic Knowledge Engine Closure generated.");
console.log("✅ AG24A-AG24I source chain registered and closed.");
console.log("✅ Non-activation closure confirmed.");
console.log("✅ AG25 Featured Reads Production Strengthening handoff created.");
console.log("✅ No topic selection, generation, GitHub write, deployment, publishing or backend activation performed.");
