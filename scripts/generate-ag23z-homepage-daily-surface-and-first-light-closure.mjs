import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag23aReview: "data/content-intelligence/quality-reviews/ag23a-homepage-daily-route-doctrine.json",
  ag23bReview: "data/content-intelligence/quality-reviews/ag23b-first-light-24-hour-signal-engine.json",
  ag23cReview: "data/content-intelligence/quality-reviews/ag23c-signal-to-article-conversion-logic.json",
  ag23dReview: "data/content-intelligence/quality-reviews/ag23d-discover-read-reflect-mapping.json",
  ag23eReview: "data/content-intelligence/quality-reviews/ag23e-daily-homepage-data-schema.json",
  ag23fReview: "data/content-intelligence/quality-reviews/ag23f-first-light-source-verification-plan.json",
  ag23gReview: "data/content-intelligence/quality-reviews/ag23g-first-light-topic-scoring-model.json",
  ag23hReview: "data/content-intelligence/quality-reviews/ag23h-homepage-daily-surface-scaffold.json",
  ag23iReview: "data/content-intelligence/quality-reviews/ag23i-homepage-daily-surface-audit.json",
  ag23iAudit: "data/content-intelligence/audit-records/ag23i-homepage-daily-surface-audit-report.json",
  ag23iDecision: "data/content-intelligence/go-live/ag23i-homepage-daily-surface-and-first-light-closure-decision-record.json",
  ag23iReadiness: "data/content-intelligence/quality-registry/ag23i-homepage-daily-surface-and-first-light-closure-readiness-record.json",
  ag23iBoundary: "data/content-intelligence/mutation-plans/ag23i-to-ag23z-homepage-daily-surface-and-first-light-closure-boundary.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag23z-homepage-daily-surface-and-first-light-closure.json",
  closure: "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  summary: "data/content-intelligence/homepage/ag23z-homepage-daily-surface-and-first-light-summary.json",
  readiness: "data/content-intelligence/quality-registry/ag23z-episodic-knowledge-engine-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag23z-to-ag24a-episodic-content-doctrine-boundary.json",
  registry: "data/quality/ag23z-homepage-daily-surface-and-first-light-closure.json",
  preview: "data/quality/ag23z-homepage-daily-surface-and-first-light-closure-preview.json",
  doc: "docs/quality/AG23Z_HOMEPAGE_DAILY_SURFACE_AND_FIRST_LIGHT_CLOSURE.md"
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
  if (!exists(p)) throw new Error(`Missing AG23Z input: ${p}`);
}

const ag23a = readJson(inputs.ag23aReview);
const ag23b = readJson(inputs.ag23bReview);
const ag23c = readJson(inputs.ag23cReview);
const ag23d = readJson(inputs.ag23dReview);
const ag23e = readJson(inputs.ag23eReview);
const ag23f = readJson(inputs.ag23fReview);
const ag23g = readJson(inputs.ag23gReview);
const ag23h = readJson(inputs.ag23hReview);
const ag23i = readJson(inputs.ag23iReview);
const audit = readJson(inputs.ag23iAudit);
const decision = readJson(inputs.ag23iDecision);
const readinessI = readJson(inputs.ag23iReadiness);
const boundaryI = readJson(inputs.ag23iBoundary);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag23a.status !== "homepage_daily_route_doctrine_created_ready_for_ag23b") throw new Error("AG23A status mismatch.");
if (ag23b.status !== "first_light_24_hour_signal_engine_created_ready_for_ag23c") throw new Error("AG23B status mismatch.");
if (ag23c.status !== "signal_to_article_conversion_logic_created_ready_for_ag23d") throw new Error("AG23C status mismatch.");
if (ag23d.status !== "discover_read_reflect_mapping_created_ready_for_ag23e") throw new Error("AG23D status mismatch.");
if (ag23e.status !== "daily_homepage_data_schema_created_ready_for_ag23f") throw new Error("AG23E status mismatch.");
if (ag23f.status !== "first_light_source_verification_plan_created_ready_for_ag23g") throw new Error("AG23F status mismatch.");
if (ag23g.status !== "first_light_topic_scoring_model_created_ready_for_ag23h") throw new Error("AG23G status mismatch.");
if (ag23h.status !== "homepage_daily_surface_scaffold_created_ready_for_ag23i") throw new Error("AG23H status mismatch.");
if (ag23i.status !== "homepage_daily_surface_audit_passed_ready_for_ag23z_closure") throw new Error("AG23I status mismatch.");
if (!Array.isArray(audit.failed_checks) || audit.failed_checks.length !== 0) throw new Error("AG23I audit has failed checks.");
if (decision.decision.proceed_to_ag23z_homepage_daily_surface_and_first_light_closure !== true) throw new Error("AG23I decision does not allow AG23Z.");
if (readinessI.ready_for_ag23z !== true) throw new Error("AG23I readiness does not allow AG23Z.");
if (boundaryI.next_stage_id !== "AG23Z") throw new Error("AG23I boundary does not point to AG23Z.");

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

const completedStages = [
  "AG23A — Homepage Daily Route Doctrine",
  "AG23B — First Light 24-Hour Signal Engine",
  "AG23C — Signal-to-Article Conversion Logic",
  "AG23D — Discover/Read/Reflect Mapping",
  "AG23E — Daily Homepage Data Schema",
  "AG23F — First Light Source and Verification Plan",
  "AG23G — First Light Topic Scoring Model",
  "AG23H — Homepage Daily Surface Scaffold",
  "AG23I — Homepage Daily Surface Audit"
];

const summary = {
  module_id: "AG23Z",
  title: "Homepage Daily Surface and First Light Summary",
  status: "homepage_daily_surface_and_first_light_chain_closed",
  completed_stages: completedStages,
  result: {
    homepage_route_doctrine_created: true,
    first_light_signal_engine_created: true,
    signal_to_article_logic_created: true,
    discover_read_reflect_mapping_created: true,
    daily_homepage_schema_created: true,
    source_verification_plan_created: true,
    topic_scoring_model_created: true,
    non_active_scaffold_created: true,
    audit_passed: true,
    ready_for_ag24_episodic_knowledge_engine: true,
    real_execution_done: false
  },
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder,
  blocked_state: blockedState
};

const closure = {
  module_id: "AG23Z",
  title: "Homepage Daily Surface and First Light Closure",
  status: "ag23_homepage_daily_surface_and_first_light_closed_ready_for_ag24a",
  closure_decision: {
    ag23_closed: true,
    proceed_to_ag24a_episodic_content_doctrine: true,
    perform_homepage_mutation_now: false,
    perform_runtime_write_now: false,
    perform_live_feed_activation_now: false,
    perform_article_generation_now: false,
    perform_github_write_now: false,
    perform_deployment_now: false,
    perform_publishing_now: false,
    activate_supabase_auth_backend_now: false
  },
  summary_file: outputs.summary,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG23Z",
  title: "Episodic Knowledge Engine Readiness Record",
  status: "ready_for_ag24a_episodic_content_doctrine",
  ready_for_ag24a: true,
  next_stage_id: "AG24A",
  next_stage_title: "Episodic Content Doctrine",
  ag23_closed: true,
  real_execution_allowed_now: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG23Z",
  title: "AG23Z to AG24A Episodic Content Doctrine Boundary",
  status: "ag24a_boundary_created_not_started",
  next_stage_id: "AG24A",
  next_stage_title: "Episodic Content Doctrine",
  allowed_scope: [
    "Define weekly episodes, educational series, burning topic series and Sunday flagship reads.",
    "Define Tuesday Learning, Friday World Lens and Sunday Deep Read doctrine.",
    "Keep planning-only and non-mutating."
  ],
  blocked_scope: [
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
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG23Z",
  title: "Homepage Daily Surface and First Light Closure",
  status: "ag23_homepage_daily_surface_and_first_light_closed_ready_for_ag24a",
  depends_on: completedStages.map((x) => x.split(" — ")[0]),
  generated_from: inputs,
  closure_file: outputs.closure,
  summary_file: outputs.summary,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  blocked_state: blockedState
};

const registry = {
  module_id: "AG23Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG23Z",
  preview_only: true,
  status: review.status,
  message: "AG23 homepage daily surface and First Light chain closed. Next: AG24A Episodic Content Doctrine.",
  blocked_state: blockedState
};

const doc = `# AG23Z — Homepage Daily Surface and First Light Closure

## Purpose

AG23Z closes the AG23 homepage daily surface and First Light planning/scaffold chain.

## Completed Chain

- AG23A — Homepage Daily Route Doctrine
- AG23B — First Light 24-Hour Signal Engine
- AG23C — Signal-to-Article Conversion Logic
- AG23D — Discover/Read/Reflect Mapping
- AG23E — Daily Homepage Data Schema
- AG23F — First Light Source and Verification Plan
- AG23G — First Light Topic Scoring Model
- AG23H — Homepage Daily Surface Scaffold
- AG23I — Homepage Daily Surface Audit

## Result

The homepage daily surface is now governed at doctrine, schema, verification, scoring and non-active scaffold level.

## Blocked State

No homepage mutation, runtime write, live feed, scraping, external API call, article generation, GitHub write, deployment, publishing, or Supabase/Auth/backend activation was performed.

## Next Stage

AG24A — Episodic Content Doctrine.
`;

writeJson(outputs.review, review);
writeJson(outputs.closure, closure);
writeJson(outputs.summary, summary);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG23Z Homepage Daily Surface and First Light Closure generated.");
console.log("✅ AG23A to AG23I chain closed.");
console.log("✅ AG24A Episodic Content Doctrine boundary created.");
console.log("✅ No runtime write, homepage mutation, GitHub write or publishing performed.");
