import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag23zReview: "data/content-intelligence/quality-reviews/ag23z-homepage-daily-surface-and-first-light-closure.json",
  ag23zClosure: "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  ag23zSummary: "data/content-intelligence/homepage/ag23z-homepage-daily-surface-and-first-light-summary.json",
  ag23zReadiness: "data/content-intelligence/quality-registry/ag23z-episodic-knowledge-engine-readiness-record.json",
  ag23zBoundary: "data/content-intelligence/mutation-plans/ag23z-to-ag24a-episodic-content-doctrine-boundary.json",
  ag23cEpisodeLogic: "data/content-intelligence/homepage/ag23c-weekly-episode-candidate-logic.json",
  ag23gScoringModel: "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag24a-episodic-content-doctrine.json",
  doctrine: "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  rhythm: "data/content-intelligence/episodes/ag24a-weekly-episodic-rhythm-doctrine.json",
  seriesTypes: "data/content-intelligence/episodes/ag24a-series-type-registry.json",
  guardrails: "data/content-intelligence/episodes/ag24a-episodic-content-guardrails.json",
  blocker: "data/content-intelligence/quality-registry/ag24a-episodic-content-doctrine-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag24a-topic-selection-scoring-engine-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag24a-to-ag24b-topic-selection-scoring-engine-plan-boundary.json",
  registry: "data/quality/ag24a-episodic-content-doctrine.json",
  preview: "data/quality/ag24a-episodic-content-doctrine-preview.json",
  doc: "docs/quality/AG24A_EPISODIC_CONTENT_DOCTRINE.md"
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
  if (!exists(p)) throw new Error(`Missing AG24A input: ${p}`);
}

const ag23zReview = readJson(inputs.ag23zReview);
const ag23zClosure = readJson(inputs.ag23zClosure);
const ag23zSummary = readJson(inputs.ag23zSummary);
const ag23zReadiness = readJson(inputs.ag23zReadiness);
const ag23zBoundary = readJson(inputs.ag23zBoundary);
const ag23cEpisodeLogic = readJson(inputs.ag23cEpisodeLogic);
const ag23gScoringModel = readJson(inputs.ag23gScoringModel);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag23zReview.status !== "ag23_homepage_daily_surface_and_first_light_closed_ready_for_ag24a") throw new Error("AG23Z review is not ready for AG24A.");
if (ag23zClosure.closure_decision.proceed_to_ag24a_episodic_content_doctrine !== true) throw new Error("AG23Z closure does not hand off to AG24A.");
if (ag23zReadiness.ready_for_ag24a !== true) throw new Error("AG23Z readiness does not allow AG24A.");
if (ag23zBoundary.next_stage_id !== "AG24A") throw new Error("AG23Z boundary does not point to AG24A.");
if (ag23zSummary.result.ready_for_ag24_episodic_knowledge_engine !== true) throw new Error("AG23Z summary does not confirm AG24 readiness.");

const blockedState = {
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

const rhythm = {
  module_id: "AG24A",
  title: "Weekly Episodic Rhythm Doctrine",
  status: "weekly_episodic_rhythm_doctrine_created_no_generation",
  rhythm: [
    {
      day: "Tuesday",
      product: "Learning Series",
      purpose: "Teach evergreen topics chapter-wise.",
      examples: ["Vedic Mathematics", "mutations", "engines", "health diagnostics"],
      generate_now: false
    },
    {
      day: "Friday",
      product: "World Lens / Burning Topic",
      purpose: "Explain evolving public/world issues with continuity.",
      examples: ["AI regulation", "climate and water stress", "geopolitics", "sports governance"],
      generate_now: false
    },
    {
      day: "Sunday",
      product: "Deep Read / Weekly Lens",
      purpose: "Publish reflective flagship long-form reading.",
      examples: ["public systems", "society", "media behaviour", "culture", "human insight"],
      generate_now: false
    }
  ],
  blocked_state: blockedState
};

const seriesTypes = {
  module_id: "AG24A",
  title: "Series Type Registry",
  status: "series_type_registry_created_no_generation",
  series_types: [
    {
      series_type: "learning_series",
      cadence: "Tuesday",
      intended_depth: "8_to_12_plus_episodes",
      purpose: "Evergreen educational explanation."
    },
    {
      series_type: "world_lens",
      cadence: "Friday",
      intended_depth: "4_to_24_episodes_if_topic_evolves",
      purpose: "Burning/current issue explanation."
    },
    {
      series_type: "sunday_deep_read",
      cadence: "Sunday",
      intended_depth: "standalone_or_seasonal",
      purpose: "Reflective flagship insight."
    },
    {
      series_type: "public_systems_watch",
      cadence: "as_selected",
      intended_depth: "series_when_topic_has_governance_depth",
      purpose: "Public programme and delivery insight."
    }
  ],
  blocked_state: blockedState
};

const guardrails = {
  module_id: "AG24A",
  title: "Episodic Content Guardrails",
  status: "episodic_content_guardrails_created_no_generation",
  guardrails: [
    "No random episode generation without topic scoring.",
    "Each series must show 8–12 episode potential where applicable.",
    "Every episode topic must pass reference availability and source safety review.",
    "Burning topics must use careful wording and avoid unsupported breaking-news claims.",
    "Educational series should be chapter-wise and explanatory.",
    "Episodes remain inside Featured Reads/Reading Surface initially, differentiated by badges and episode metadata.",
    "No episode becomes public without later Admin/publish workflow."
  ],
  consumed_prior_logic: {
    ag23c_episode_candidate_rules: ag23cEpisodeLogic.episode_candidate_rules,
    ag23g_scoring_model: ag23gScoringModel.title
  },
  blocked_state: blockedState
};

const doctrine = {
  module_id: "AG24A",
  title: "Episodic Content Doctrine",
  status: "episodic_content_doctrine_created_ready_for_ag24b",
  purpose: "Define the doctrine for weekly episodes, educational series, burning topic series and Sunday flagship reads.",
  consumed_source_of_truth: [
    inputs.ag23zClosure,
    inputs.ag23zSummary,
    inputs.ag23cEpisodeLogic,
    inputs.ag23gScoringModel
  ],
  doctrine_principles: [
    "Episodes must create continuity and audience return value.",
    "Series selection must be governed by topic scoring, not random content generation.",
    "Learning Series, World Lens and Sunday Deep Read should remain connected to Discover → Read → Reflect.",
    "Episodes should initially remain within the Reading Surface / Featured Reads ecosystem using series badges.",
    "Backend/Auth/Supabase remains deferred unless later explicitly approved."
  ],
  rhythm_file: outputs.rhythm,
  series_type_registry_file: outputs.seriesTypes,
  guardrails_file: outputs.guardrails,
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG24A",
  title: "Episodic Content Doctrine Blocker Register",
  status: "episodic_content_doctrine_operations_blocked_pending_ag24b",
  blocked_items: [
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
  module_id: "AG24A",
  title: "Topic Selection and Scoring Engine Readiness Record",
  status: "ready_for_ag24b_topic_selection_scoring_engine_plan",
  ready_for_ag24b: true,
  next_stage_id: "AG24B",
  next_stage_title: "Topic Selection and Scoring Engine Plan",
  episodic_content_doctrine_created: true,
  weekly_rhythm_doctrine_created: true,
  series_type_registry_created: true,
  guardrails_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG24A",
  title: "AG24A to AG24B Topic Selection and Scoring Engine Plan Boundary",
  status: "ag24b_boundary_created_not_started",
  next_stage_id: "AG24B",
  next_stage_title: "Topic Selection and Scoring Engine Plan",
  allowed_scope: [
    "Plan topic scoring for relevance, evergreen value, audience benefit, references, series depth, visual potential, brand fit and risk.",
    "Consume AG23G topic scoring model.",
    "Keep planning-only and non-mutating."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG24A",
  title: "Episodic Content Doctrine",
  status: "episodic_content_doctrine_created_ready_for_ag24b",
  depends_on: ["AG23Z"],
  generated_from: inputs,
  doctrine_file: outputs.doctrine,
  rhythm_file: outputs.rhythm,
  series_type_registry_file: outputs.seriesTypes,
  guardrails_file: outputs.guardrails,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    episodic_content_doctrine_created: true,
    weekly_rhythm_doctrine_created: true,
    series_type_registry_created: true,
    guardrails_created: true,
    ready_for_ag24b: true,
    real_execution_done: false,
    prior_ag_records_consumed: true,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG24A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG24A",
  preview_only: true,
  status: review.status,
  message: "AG24A episodic content doctrine created. Next: AG24B Topic Selection and Scoring Engine Plan.",
  blocked_state: blockedState
};

const doc = `# AG24A — Episodic Content Doctrine

## Purpose

AG24A starts the Episodic Knowledge Engine series.

It defines weekly episodes, educational series, burning topic series and Sunday flagship reads.

## Consumed Source-of-Truth

AG24A consumes the closed AG23 Homepage Daily Surface and First Light chain, including signal-to-article logic and topic scoring model.

## Product Rhythm

- Tuesday — Learning Series.
- Friday — World Lens / Burning Topic.
- Sunday — Deep Read / Weekly Lens.

## Guardrail

No episode or article is generated in AG24A. This is doctrine and planning only.

## Next Stage

AG24B — Topic Selection and Scoring Engine Plan.
`;

writeJson(outputs.review, review);
writeJson(outputs.doctrine, doctrine);
writeJson(outputs.rhythm, rhythm);
writeJson(outputs.seriesTypes, seriesTypes);
writeJson(outputs.guardrails, guardrails);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG24A Episodic Content Doctrine generated.");
console.log("✅ Weekly rhythm, series types and guardrails created.");
console.log("✅ Prior AG23 records consumed as source-of-truth.");
console.log("✅ No episode/article generation, GitHub write or publishing performed.");
console.log("✅ AG24B Topic Selection and Scoring Engine Plan boundary created.");
