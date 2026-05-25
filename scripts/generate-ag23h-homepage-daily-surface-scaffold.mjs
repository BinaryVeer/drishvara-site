import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag23gReview: "data/content-intelligence/quality-reviews/ag23g-first-light-topic-scoring-model.json",
  ag23gModel: "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  ag23gFields: "data/content-intelligence/homepage/ag23g-topic-score-fields.json",
  ag23gWeights: "data/content-intelligence/homepage/ag23g-topic-scoring-weights.json",
  ag23gThresholds: "data/content-intelligence/homepage/ag23g-topic-score-thresholds.json",
  ag23gRules: "data/content-intelligence/homepage/ag23g-topic-ranking-decision-rules.json",
  ag23gReadiness: "data/content-intelligence/quality-registry/ag23g-homepage-daily-surface-scaffold-readiness-record.json",
  ag23gBoundary: "data/content-intelligence/mutation-plans/ag23g-to-ag23h-homepage-daily-surface-scaffold-boundary.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag23h-homepage-daily-surface-scaffold.json",
  scaffold: "data/content-intelligence/homepage/ag23h-homepage-daily-surface-scaffold.json",
  routeTemplate: "data/content-intelligence/homepage/ag23h-discover-read-reflect-route-template.json",
  firstLightTemplate: "data/content-intelligence/homepage/ag23h-first-light-signal-template.json",
  scoreTemplate: "data/content-intelligence/homepage/ag23h-signal-score-template.json",
  dailySurfaceTemplate: "data/content-intelligence/homepage/ag23h-daily-surface-record-template.json",
  blocker: "data/content-intelligence/quality-registry/ag23h-homepage-daily-surface-scaffold-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag23h-homepage-daily-surface-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag23h-to-ag23i-homepage-daily-surface-audit-boundary.json",
  registry: "data/quality/ag23h-homepage-daily-surface-scaffold.json",
  preview: "data/quality/ag23h-homepage-daily-surface-scaffold-preview.json",
  doc: "docs/quality/AG23H_HOMEPAGE_DAILY_SURFACE_SCAFFOLD.md"
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
  if (!exists(p)) throw new Error(`Missing AG23H input: ${p}`);
}

const ag23gReview = readJson(inputs.ag23gReview);
const ag23gModel = readJson(inputs.ag23gModel);
const ag23gReadiness = readJson(inputs.ag23gReadiness);
const ag23gBoundary = readJson(inputs.ag23gBoundary);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag23gReview.status !== "first_light_topic_scoring_model_created_ready_for_ag23h") throw new Error("AG23G review is not ready for AG23H.");
if (ag23gModel.status !== "first_light_topic_scoring_model_created_ready_for_ag23h") throw new Error("AG23G model status mismatch.");
if (ag23gReadiness.ready_for_ag23h !== true) throw new Error("AG23G readiness does not allow AG23H.");
if (ag23gBoundary.next_stage_id !== "AG23H") throw new Error("AG23G boundary does not point to AG23H.");

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

const routeTemplate = {
  module_id: "AG23H",
  title: "Discover Read Reflect Route Template",
  status: "route_template_created_non_active",
  route_version: "discover_read_reflect_v1",
  movements: [
    { movement: "Discover", intended_blocks: ["first_light", "daily_signal_cards"], active_now: false },
    { movement: "Read", intended_blocks: ["featured_reads", "weekly_episode_candidates"], active_now: false },
    { movement: "Reflect", intended_blocks: ["founder_notebook", "today_guidance", "word_for_day", "panchang_festival_view"], active_now: false }
  ],
  blocked_state: blockedState
};

const firstLightTemplate = {
  module_id: "AG23H",
  title: "First Light Signal Template",
  status: "first_light_signal_template_created_non_active",
  fields: [
    "signal_id",
    "date_key",
    "signal_type",
    "region_scope",
    "headline",
    "one_line_signal",
    "why_it_matters",
    "source_category",
    "verification_status",
    "topic_score",
    "recommended_output_type",
    "visibility_status"
  ],
  visibility_status_values: ["hidden", "review_only", "approved_for_later_surface"],
  blocked_state: blockedState
};

const scoreTemplate = {
  module_id: "AG23H",
  title: "Signal Score Template",
  status: "signal_score_template_created_non_active",
  fields: [
    "public_relevance",
    "freshness",
    "drishvara_fit",
    "reference_availability",
    "series_potential",
    "visual_object_potential",
    "sensitivity_risk",
    "repetition_risk",
    "final_score",
    "decision_band"
  ],
  blocked_state: blockedState
};

const dailySurfaceTemplate = {
  module_id: "AG23H",
  title: "Daily Surface Record Template",
  status: "daily_surface_record_template_created_non_active",
  template: {
    date_key: "YYYY-MM-DD",
    route_version: "discover_read_reflect_v1",
    first_light: [],
    read_surface: [],
    reflection_surface: [],
    editorial_status: "draft",
    verification_status: "pending",
    runtime_enabled: false,
    publish_enabled: false
  },
  blocked_state: blockedState
};

const scaffold = {
  module_id: "AG23H",
  title: "Homepage Daily Surface Scaffold",
  status: "homepage_daily_surface_scaffold_created_ready_for_ag23i",
  scaffold_type: "non_active_templates_only",
  purpose: "Create non-active templates for daily homepage route, First Light signal, signal score and daily surface record.",
  route_template_file: outputs.routeTemplate,
  first_light_template_file: outputs.firstLightTemplate,
  score_template_file: outputs.scoreTemplate,
  daily_surface_template_file: outputs.dailySurfaceTemplate,
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG23H",
  title: "Homepage Daily Surface Scaffold Blocker Register",
  status: "homepage_daily_surface_scaffold_operations_blocked_pending_ag23i",
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
  module_id: "AG23H",
  title: "Homepage Daily Surface Audit Readiness Record",
  status: "ready_for_ag23i_homepage_daily_surface_audit",
  ready_for_ag23i: true,
  next_stage_id: "AG23I",
  next_stage_title: "Homepage Daily Surface Audit",
  scaffold_created: true,
  route_template_created: true,
  first_light_template_created: true,
  score_template_created: true,
  daily_surface_template_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG23H",
  title: "AG23H to AG23I Homepage Daily Surface Audit Boundary",
  status: "ag23i_boundary_created_not_started",
  next_stage_id: "AG23I",
  next_stage_title: "Homepage Daily Surface Audit",
  allowed_scope: [
    "Audit homepage daily surface scaffold.",
    "Audit route, First Light signal, score and daily surface templates.",
    "Confirm source safety and no live mutation."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG23H",
  title: "Homepage Daily Surface Scaffold",
  status: "homepage_daily_surface_scaffold_created_ready_for_ag23i",
  depends_on: ["AG23G"],
  generated_from: inputs,
  scaffold_file: outputs.scaffold,
  route_template_file: outputs.routeTemplate,
  first_light_template_file: outputs.firstLightTemplate,
  score_template_file: outputs.scoreTemplate,
  daily_surface_template_file: outputs.dailySurfaceTemplate,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    scaffold_created: true,
    route_template_created: true,
    first_light_template_created: true,
    score_template_created: true,
    daily_surface_template_created: true,
    ready_for_ag23i: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG23H", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG23H",
  preview_only: true,
  status: review.status,
  message: "AG23H homepage daily surface scaffold created. Next: AG23I Homepage Daily Surface Audit.",
  blocked_state: blockedState
};

const doc = `# AG23H — Homepage Daily Surface Scaffold

## Purpose

AG23H creates non-active templates for the Drishvara daily homepage surface.

## Scaffold Templates

- Discover → Read → Reflect route template.
- First Light signal template.
- Signal score template.
- Daily surface record template.

## Blocked State

No homepage mutation, runtime data write, live feed, scraping, external API call, article generation, GitHub write, deployment, publishing, or Supabase/Auth/backend activation is performed.

## Next Stage

AG23I — Homepage Daily Surface Audit.
`;

writeJson(outputs.review, review);
writeJson(outputs.scaffold, scaffold);
writeJson(outputs.routeTemplate, routeTemplate);
writeJson(outputs.firstLightTemplate, firstLightTemplate);
writeJson(outputs.scoreTemplate, scoreTemplate);
writeJson(outputs.dailySurfaceTemplate, dailySurfaceTemplate);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG23H Homepage Daily Surface Scaffold generated.");
console.log("✅ Route, First Light, score and daily surface templates created.");
console.log("✅ No runtime write, homepage mutation, GitHub write or publishing performed.");
console.log("✅ AG23I Homepage Daily Surface Audit boundary created.");
