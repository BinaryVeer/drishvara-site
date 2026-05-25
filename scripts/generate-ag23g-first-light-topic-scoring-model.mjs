import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag23fReview: "data/content-intelligence/quality-reviews/ag23f-first-light-source-verification-plan.json",
  ag23fPlan: "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  ag23fReadiness: "data/content-intelligence/quality-registry/ag23f-topic-scoring-model-readiness-record.json",
  ag23fBoundary: "data/content-intelligence/mutation-plans/ag23f-to-ag23g-first-light-topic-scoring-model-boundary.json",
  ag23cScoring: "data/content-intelligence/homepage/ag23c-signal-scoring-fields.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag23g-first-light-topic-scoring-model.json",
  model: "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  fields: "data/content-intelligence/homepage/ag23g-topic-score-fields.json",
  weights: "data/content-intelligence/homepage/ag23g-topic-scoring-weights.json",
  thresholds: "data/content-intelligence/homepage/ag23g-topic-score-thresholds.json",
  rules: "data/content-intelligence/homepage/ag23g-topic-ranking-decision-rules.json",
  blocker: "data/content-intelligence/quality-registry/ag23g-topic-scoring-model-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag23g-homepage-daily-surface-scaffold-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag23g-to-ag23h-homepage-daily-surface-scaffold-boundary.json",
  registry: "data/quality/ag23g-first-light-topic-scoring-model.json",
  preview: "data/quality/ag23g-first-light-topic-scoring-model-preview.json",
  doc: "docs/quality/AG23G_FIRST_LIGHT_TOPIC_SCORING_MODEL.md"
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
  if (!exists(p)) throw new Error(`Missing AG23G input: ${p}`);
}

const ag23fReview = readJson(inputs.ag23fReview);
const ag23fPlan = readJson(inputs.ag23fPlan);
const ag23fReadiness = readJson(inputs.ag23fReadiness);
const ag23fBoundary = readJson(inputs.ag23fBoundary);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag23fReview.status !== "first_light_source_verification_plan_created_ready_for_ag23g") throw new Error("AG23F review is not ready for AG23G.");
if (ag23fPlan.status !== "first_light_source_verification_plan_created_ready_for_ag23g") throw new Error("AG23F plan status mismatch.");
if (ag23fReadiness.ready_for_ag23g !== true) throw new Error("AG23F readiness does not allow AG23G.");
if (ag23fBoundary.next_stage_id !== "AG23G") throw new Error("AG23F boundary does not point to AG23G.");

const blockedState = {
  homepage_mutated: false,
  data_written_to_runtime: false,
  live_feed_enabled: false,
  news_scraping_enabled: false,
  external_api_called: false,
  article_generated: false,
  article_file_created: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  article_published: false,
  supabase_auth_backend_activated: false
};

const scoreFields = [
  { field: "public_relevance", score_range: "0_to_5", direction: "positive" },
  { field: "freshness", score_range: "0_to_5", direction: "positive" },
  { field: "drishvara_fit", score_range: "0_to_5", direction: "positive" },
  { field: "reference_availability", score_range: "0_to_5", direction: "positive" },
  { field: "series_potential", score_range: "0_to_5", direction: "positive" },
  { field: "visual_object_potential", score_range: "0_to_5", direction: "positive" },
  { field: "sensitivity_risk", score_range: "0_to_minus_5", direction: "negative" },
  { field: "repetition_risk", score_range: "0_to_minus_5", direction: "negative" }
];

const fields = {
  module_id: "AG23G",
  title: "Topic Score Fields",
  status: "topic_score_fields_created_no_runtime_scoring",
  fields: scoreFields,
  blocked_state: blockedState
};

const weights = {
  module_id: "AG23G",
  title: "Topic Scoring Weights",
  status: "topic_scoring_weights_created_no_runtime_scoring",
  weights: [
    { field: "public_relevance", weight: 5 },
    { field: "freshness", weight: 4 },
    { field: "drishvara_fit", weight: 5 },
    { field: "reference_availability", weight: 5 },
    { field: "series_potential", weight: 4 },
    { field: "visual_object_potential", weight: 3 },
    { field: "sensitivity_risk", weight: -5 },
    { field: "repetition_risk", weight: -3 }
  ],
  blocked_state: blockedState
};

const thresholds = {
  module_id: "AG23G",
  title: "Topic Score Thresholds",
  status: "topic_score_thresholds_created_no_runtime_scoring",
  thresholds: [
    { score_band: "25_plus", decision: "strong_article_or_series_candidate" },
    { score_band: "18_to_24", decision: "topic_bank_or_first_light_only" },
    { score_band: "below_18", decision: "hold_or_reject_for_now" }
  ],
  blocked_state: blockedState
};

const rules = {
  module_id: "AG23G",
  title: "Topic Ranking Decision Rules",
  status: "topic_ranking_rules_created_no_runtime_scoring",
  rules: [
    "Source verification status must not be reject.",
    "Strong scores require reference availability and Drishvara fit.",
    "Series candidates require series potential and educational depth.",
    "High sensitivity risk requires hold or additional review.",
    "Homepage First Light-only signals may remain useful without becoming articles.",
    "No topic is generated or published by scoring alone."
  ],
  blocked_state: blockedState
};

const model = {
  module_id: "AG23G",
  title: "First Light Topic Scoring Model",
  status: "first_light_topic_scoring_model_created_ready_for_ag23h",
  purpose: "Define non-runtime topic scoring for First Light signals before homepage scaffold planning.",
  scoring_formula: "positive_score_total_minus_risk_penalties",
  score_fields_file: outputs.fields,
  scoring_weights_file: outputs.weights,
  thresholds_file: outputs.thresholds,
  decision_rules_file: outputs.rules,
  future_output: "ranked_signal_candidates_for_homepage_daily_surface_scaffold",
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG23G",
  title: "Topic Scoring Model Blocker Register",
  status: "topic_scoring_operations_blocked_pending_ag23h",
  blocked_items: [
    "No homepage mutation.",
    "No runtime data write.",
    "No live feed.",
    "No scraping.",
    "No external API call.",
    "No article generation.",
    "No article file creation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No Supabase/Auth/backend activation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG23G",
  title: "Homepage Daily Surface Scaffold Readiness Record",
  status: "ready_for_ag23h_homepage_daily_surface_scaffold",
  ready_for_ag23h: true,
  next_stage_id: "AG23H",
  next_stage_title: "Homepage Daily Surface Scaffold",
  topic_scoring_model_created: true,
  score_fields_created: true,
  scoring_weights_created: true,
  thresholds_created: true,
  ranking_rules_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG23G",
  title: "AG23G to AG23H Homepage Daily Surface Scaffold Boundary",
  status: "ag23h_boundary_created_not_started",
  next_stage_id: "AG23H",
  next_stage_title: "Homepage Daily Surface Scaffold",
  allowed_scope: [
    "Create non-active homepage daily surface scaffold.",
    "Create templates for route, First Light signal and signal score.",
    "Keep non-live and non-mutating."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG23G",
  title: "First Light Topic Scoring Model",
  status: "first_light_topic_scoring_model_created_ready_for_ag23h",
  depends_on: ["AG23F"],
  generated_from: inputs,
  model_file: outputs.model,
  score_fields_file: outputs.fields,
  scoring_weights_file: outputs.weights,
  thresholds_file: outputs.thresholds,
  decision_rules_file: outputs.rules,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    topic_scoring_model_created: true,
    score_fields_created: true,
    scoring_weights_created: true,
    thresholds_created: true,
    ranking_rules_created: true,
    ready_for_ag23h: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG23G", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG23G",
  preview_only: true,
  status: review.status,
  message: "AG23G topic scoring model created. Next: AG23H Homepage Daily Surface Scaffold.",
  blocked_state: blockedState
};

const doc = `# AG23G — First Light Topic Scoring Model

## Purpose

AG23G defines the non-runtime topic scoring model for First Light signals.

## Score Fields

Public relevance, freshness, Drishvara fit, reference availability, series potential, visual/object potential, sensitivity risk and repetition risk.

## Thresholds

- 25+ = strong article or series candidate.
- 18–24 = topic bank or First Light-only.
- Below 18 = hold or reject for now.

## Blocked State

No runtime scoring, homepage mutation, scraping, API call, article generation, GitHub write, deployment, publishing, or Supabase/Auth/backend activation is performed.

## Next Stage

AG23H — Homepage Daily Surface Scaffold.
`;

writeJson(outputs.review, review);
writeJson(outputs.model, model);
writeJson(outputs.fields, fields);
writeJson(outputs.weights, weights);
writeJson(outputs.thresholds, thresholds);
writeJson(outputs.rules, rules);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG23G First Light Topic Scoring Model generated.");
console.log("✅ Score fields, scoring weights, thresholds and ranking decision rules created.");
console.log("✅ No runtime write, homepage mutation, GitHub write or publishing performed.");
console.log("✅ AG23H Homepage Daily Surface Scaffold boundary created.");
