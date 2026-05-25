import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag23bReview: "data/content-intelligence/quality-reviews/ag23b-first-light-24-hour-signal-engine.json",
  ag23bEngine: "data/content-intelligence/homepage/ag23b-first-light-24-hour-signal-engine.json",
  ag23bSignalTypes: "data/content-intelligence/homepage/ag23b-first-light-signal-type-registry.json",
  ag23bSourceBands: "data/content-intelligence/homepage/ag23b-first-light-source-band-plan.json",
  ag23bFreshnessRules: "data/content-intelligence/homepage/ag23b-first-light-freshness-and-safety-rules.json",
  ag23bReadiness: "data/content-intelligence/quality-registry/ag23b-signal-to-article-conversion-readiness-record.json",
  ag23bBoundary: "data/content-intelligence/mutation-plans/ag23b-to-ag23c-signal-to-article-conversion-logic-boundary.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag23c-signal-to-article-conversion-logic.json",
  conversionLogic: "data/content-intelligence/homepage/ag23c-signal-to-article-conversion-logic.json",
  scoringFields: "data/content-intelligence/homepage/ag23c-signal-scoring-fields.json",
  articleBriefTemplate: "data/content-intelligence/homepage/ag23c-article-brief-template.json",
  episodeCandidateLogic: "data/content-intelligence/homepage/ag23c-weekly-episode-candidate-logic.json",
  blocker: "data/content-intelligence/quality-registry/ag23c-signal-to-article-conversion-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag23c-discover-read-reflect-mapping-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag23c-to-ag23d-discover-read-reflect-mapping-boundary.json",
  registry: "data/quality/ag23c-signal-to-article-conversion-logic.json",
  preview: "data/quality/ag23c-signal-to-article-conversion-logic-preview.json",
  doc: "docs/quality/AG23C_SIGNAL_TO_ARTICLE_CONVERSION_LOGIC.md"
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
  if (!exists(p)) throw new Error(`Missing AG23C input: ${p}`);
}

const ag23bReview = readJson(inputs.ag23bReview);
const ag23bEngine = readJson(inputs.ag23bEngine);
const ag23bSignalTypes = readJson(inputs.ag23bSignalTypes);
const ag23bReadiness = readJson(inputs.ag23bReadiness);
const ag23bBoundary = readJson(inputs.ag23bBoundary);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag23bReview.status !== "first_light_24_hour_signal_engine_created_ready_for_ag23c") {
  throw new Error("AG23B review is not ready for AG23C.");
}
if (ag23bEngine.status !== "first_light_24_hour_signal_engine_created_pending_ag23c") {
  throw new Error("AG23B engine status mismatch.");
}
if (ag23bReadiness.ready_for_ag23c !== true) {
  throw new Error("AG23B readiness does not allow AG23C.");
}
if (ag23bBoundary.next_stage_id !== "AG23C") {
  throw new Error("AG23B boundary does not point to AG23C.");
}

const blockedState = {
  homepage_mutated: false,
  first_light_live_feed_enabled: false,
  news_scraping_enabled: false,
  external_api_called: false,
  article_generated: false,
  article_brief_written_to_public: false,
  article_file_created: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  article_published: false,
  supabase_auth_backend_activated: false
};

const scoringFields = {
  module_id: "AG23C",
  title: "Signal Scoring Fields",
  status: "signal_scoring_fields_created_no_runtime_scoring",
  fields: [
    { field: "relevance", weight_hint: 20, purpose: "How strongly the signal fits Drishvara’s public value." },
    { field: "freshness", weight_hint: 15, purpose: "Whether the signal is still timely within the intended daily window." },
    { field: "source_quality", weight_hint: 20, purpose: "Whether the signal is supported by credible/available references." },
    { field: "drishvara_fit", weight_hint: 20, purpose: "Whether the signal supports insight, explanation or reflection." },
    { field: "series_potential", weight_hint: 15, purpose: "Whether the topic can sustain weekly or multi-part treatment." },
    { field: "risk_control", weight_hint: 10, purpose: "Whether the signal can be handled without unsupported or sensitive claims." }
  ],
  blocked_state: blockedState
};

const articleBriefTemplate = {
  module_id: "AG23C",
  title: "Article Brief Template",
  status: "article_brief_template_created_no_article_generation",
  template_fields: [
    "signal_id",
    "signal_type",
    "working_title",
    "one_line_signal",
    "why_it_matters",
    "possible_featured_read_angle",
    "reference_requirement",
    "image_or_visual_need",
    "risk_note",
    "recommended_output_type"
  ],
  recommended_output_types: [
    "daily_homepage_signal_card",
    "short_featured_read",
    "long_featured_read",
    "weekly_episode_candidate",
    "hold_for_later"
  ],
  blocked_state: blockedState
};

const episodeCandidateLogic = {
  module_id: "AG23C",
  title: "Weekly Episode Candidate Logic",
  status: "weekly_episode_candidate_logic_created_no_generation",
  purpose: "Identify signals/topics suitable for 8–12+ week series without generating episodes now.",
  episode_candidate_rules: [
    "Topic has educational depth.",
    "Topic can be broken into weekly chapters.",
    "Topic has durable audience value beyond one day.",
    "Topic can be supported by credible references.",
    "Topic can connect Discover → Read → Reflect without becoming random news commentary."
  ],
  example_topic_families: [
    "Vedic Mathematics and working methods",
    "Evolution of engines",
    "Mutations and biological explanation",
    "Health diagnostics and public understanding",
    "Global issue explainers",
    "India public programme explainers"
  ],
  blocked_state: blockedState
};

const conversionLogic = {
  module_id: "AG23C",
  title: "Signal-to-Article Conversion Logic",
  status: "signal_to_article_conversion_logic_created_ready_for_ag23d",
  purpose: "Define how First Light signals may become homepage cards, article briefs or weekly episode candidates.",
  conversion_path: [
    "Signal intake from First Light registry",
    "Signal safety and source-quality check",
    "Signal scoring",
    "Output classification",
    "Article brief template preparation",
    "Episode candidate flagging",
    "Discover/Read/Reflect mapping in AG23D"
  ],
  decision_rules: [
    {
      outcome: "daily_homepage_signal_card",
      condition: "Signal is timely and useful but not deep enough for full article."
    },
    {
      outcome: "featured_read_brief",
      condition: "Signal has strong relevance, source quality and Drishvara fit."
    },
    {
      outcome: "weekly_episode_candidate",
      condition: "Signal has high series potential and educational depth."
    },
    {
      outcome: "hold_or_reject",
      condition: "Signal has weak source support, high risk or low Drishvara fit."
    }
  ],
  source_signal_types: ag23bSignalTypes.signal_types.map((x) => x.signal_type),
  scoring_fields_file: outputs.scoringFields,
  article_brief_template_file: outputs.articleBriefTemplate,
  episode_candidate_logic_file: outputs.episodeCandidateLogic,
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG23C",
  title: "Signal-to-Article Conversion Blocker Register",
  status: "signal_to_article_conversion_operations_blocked_pending_ag23d",
  blocked_items: [
    "No homepage mutation.",
    "No live First Light feed.",
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
  module_id: "AG23C",
  title: "Discover Read Reflect Mapping Readiness Record",
  status: "ready_for_ag23d_discover_read_reflect_mapping",
  ready_for_ag23d: true,
  next_stage_id: "AG23D",
  next_stage_title: "Discover/Read/Reflect Mapping",
  conversion_logic_created: true,
  scoring_fields_created: true,
  article_brief_template_created: true,
  episode_candidate_logic_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG23C",
  title: "AG23C to AG23D Discover Read Reflect Mapping Boundary",
  status: "ag23d_boundary_created_not_started",
  next_stage_id: "AG23D",
  next_stage_title: "Discover/Read/Reflect Mapping",
  allowed_scope: [
    "Map signal outcomes to Discover, Read and Reflect movements.",
    "Define where homepage modules should appear in the daily journey.",
    "Keep mapping non-live and non-mutating."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG23C",
  title: "Signal-to-Article Conversion Logic",
  status: "signal_to_article_conversion_logic_created_ready_for_ag23d",
  depends_on: ["AG23B"],
  generated_from: inputs,
  conversion_logic_file: outputs.conversionLogic,
  scoring_fields_file: outputs.scoringFields,
  article_brief_template_file: outputs.articleBriefTemplate,
  episode_candidate_logic_file: outputs.episodeCandidateLogic,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    conversion_logic_created: true,
    scoring_fields_created: true,
    article_brief_template_created: true,
    weekly_episode_logic_created: true,
    ready_for_ag23d: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG23C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG23C",
  preview_only: true,
  status: review.status,
  message: "AG23C conversion logic created. Next: AG23D Discover/Read/Reflect Mapping.",
  blocked_state: blockedState
};

const doc = `# AG23C — Signal-to-Article Conversion Logic

## Purpose

AG23C defines how First Light signals may become homepage signal cards, article briefs or weekly episode candidates.

## Conversion Path

1. Signal intake from First Light.
2. Source-quality and safety check.
3. Signal scoring.
4. Output classification.
5. Article brief preparation.
6. Weekly episode candidate flagging.
7. Discover/Read/Reflect mapping in AG23D.

## Weekly Episode Logic

Topics with educational depth and multi-week potential can be marked for long-running series, such as Vedic Mathematics, engines, mutations, diagnostics, global issue explainers and public programme explainers.

## Blocked State

No article generation, homepage mutation, GitHub write, deployment, publishing, scraping, external API call, or Supabase/Auth/backend activation is performed.

## Next Stage

AG23D — Discover/Read/Reflect Mapping.
`;

writeJson(outputs.review, review);
writeJson(outputs.conversionLogic, conversionLogic);
writeJson(outputs.scoringFields, scoringFields);
writeJson(outputs.articleBriefTemplate, articleBriefTemplate);
writeJson(outputs.episodeCandidateLogic, episodeCandidateLogic);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG23C Signal-to-Article Conversion Logic generated.");
console.log("✅ Scoring fields, article brief template and weekly episode candidate logic created.");
console.log("✅ No article generation, homepage mutation, GitHub write or publishing performed.");
console.log("✅ AG23D Discover/Read/Reflect Mapping boundary created.");
