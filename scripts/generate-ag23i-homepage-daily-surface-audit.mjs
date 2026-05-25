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
  ag23hScaffold: "data/content-intelligence/homepage/ag23h-homepage-daily-surface-scaffold.json",
  ag23hRouteTemplate: "data/content-intelligence/homepage/ag23h-discover-read-reflect-route-template.json",
  ag23hFirstLightTemplate: "data/content-intelligence/homepage/ag23h-first-light-signal-template.json",
  ag23hScoreTemplate: "data/content-intelligence/homepage/ag23h-signal-score-template.json",
  ag23hDailyTemplate: "data/content-intelligence/homepage/ag23h-daily-surface-record-template.json",
  ag23hReadiness: "data/content-intelligence/quality-registry/ag23h-homepage-daily-surface-audit-readiness-record.json",
  ag23hBoundary: "data/content-intelligence/mutation-plans/ag23h-to-ag23i-homepage-daily-surface-audit-boundary.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag23i-homepage-daily-surface-audit.json",
  audit: "data/content-intelligence/audit-records/ag23i-homepage-daily-surface-audit-report.json",
  decision: "data/content-intelligence/go-live/ag23i-homepage-daily-surface-and-first-light-closure-decision-record.json",
  readiness: "data/content-intelligence/quality-registry/ag23i-homepage-daily-surface-and-first-light-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag23i-to-ag23z-homepage-daily-surface-and-first-light-closure-boundary.json",
  registry: "data/quality/ag23i-homepage-daily-surface-audit.json",
  preview: "data/quality/ag23i-homepage-daily-surface-audit-preview.json",
  doc: "docs/quality/AG23I_HOMEPAGE_DAILY_SURFACE_AUDIT.md"
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
  if (!exists(p)) throw new Error(`Missing AG23I input: ${p}`);
}

const ag23a = readJson(inputs.ag23aReview);
const ag23b = readJson(inputs.ag23bReview);
const ag23c = readJson(inputs.ag23cReview);
const ag23d = readJson(inputs.ag23dReview);
const ag23e = readJson(inputs.ag23eReview);
const ag23f = readJson(inputs.ag23fReview);
const ag23g = readJson(inputs.ag23gReview);
const ag23h = readJson(inputs.ag23hReview);
const scaffold = readJson(inputs.ag23hScaffold);
const routeTemplate = readJson(inputs.ag23hRouteTemplate);
const firstLightTemplate = readJson(inputs.ag23hFirstLightTemplate);
const scoreTemplate = readJson(inputs.ag23hScoreTemplate);
const dailyTemplate = readJson(inputs.ag23hDailyTemplate);
const ag23hReadiness = readJson(inputs.ag23hReadiness);
const ag23hBoundary = readJson(inputs.ag23hBoundary);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag23a.status !== "homepage_daily_route_doctrine_created_ready_for_ag23b") throw new Error("AG23A status mismatch.");
if (ag23b.status !== "first_light_24_hour_signal_engine_created_ready_for_ag23c") throw new Error("AG23B status mismatch.");
if (ag23c.status !== "signal_to_article_conversion_logic_created_ready_for_ag23d") throw new Error("AG23C status mismatch.");
if (ag23d.status !== "discover_read_reflect_mapping_created_ready_for_ag23e") throw new Error("AG23D status mismatch.");
if (ag23e.status !== "daily_homepage_data_schema_created_ready_for_ag23f") throw new Error("AG23E status mismatch.");
if (ag23f.status !== "first_light_source_verification_plan_created_ready_for_ag23g") throw new Error("AG23F status mismatch.");
if (ag23g.status !== "first_light_topic_scoring_model_created_ready_for_ag23h") throw new Error("AG23G status mismatch.");
if (ag23h.status !== "homepage_daily_surface_scaffold_created_ready_for_ag23i") throw new Error("AG23H status mismatch.");
if (ag23hReadiness.ready_for_ag23i !== true) throw new Error("AG23H readiness does not allow AG23I.");
if (ag23hBoundary.next_stage_id !== "AG23I") throw new Error("AG23H boundary does not point to AG23I.");

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

const checks = [
  {
    check_id: "AG23I-01",
    area: "chain_coherence",
    passed: true,
    note: "AG23A to AG23H records are present in the approved sequence."
  },
  {
    check_id: "AG23I-02",
    area: "route_coherence",
    passed: routeTemplate.movements?.length === 3 && routeTemplate.movements.map((x) => x.movement).join(" → ") === "Discover → Read → Reflect",
    note: "Homepage route remains Discover → Read → Reflect."
  },
  {
    check_id: "AG23I-03",
    area: "first_light_template",
    passed: firstLightTemplate.fields?.length >= 10 && firstLightTemplate.status === "first_light_signal_template_created_non_active",
    note: "First Light signal template is complete and non-active."
  },
  {
    check_id: "AG23I-04",
    area: "score_template",
    passed: scoreTemplate.fields?.length >= 8 && scoreTemplate.status === "signal_score_template_created_non_active",
    note: "Signal score template is complete and non-active."
  },
  {
    check_id: "AG23I-05",
    area: "daily_surface_template",
    passed: dailyTemplate.template?.runtime_enabled === false && dailyTemplate.template?.publish_enabled === false,
    note: "Daily surface template disables runtime and publish flags."
  },
  {
    check_id: "AG23I-06",
    area: "scaffold_safety",
    passed: scaffold.scaffold_type === "non_active_templates_only",
    note: "Scaffold is explicitly non-active templates only."
  },
  {
    check_id: "AG23I-07",
    area: "blocked_state",
    passed: Object.values(ag23h.blocked_state || {}).every((v) => v === false),
    note: "All real actions remain blocked."
  },
  {
    check_id: "AG23I-08",
    area: "supabase_defer",
    passed: scaffold.supabase_auth_backend_deferred === true,
    note: "Supabase/Auth/backend remains deferred."
  }
];

const failed = checks.filter((c) => c.passed !== true);
if (failed.length) {
  throw new Error(`AG23I audit failed: ${failed.map((c) => c.check_id).join(", ")}`);
}

const audit = {
  module_id: "AG23I",
  title: "Homepage Daily Surface Audit Report",
  status: "homepage_daily_surface_audit_passed",
  checks,
  failed_checks: failed,
  summary: {
    audit_passed: true,
    failed_checks: 0,
    chain_coherent: true,
    source_safety_preserved: true,
    scaffold_non_active: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const decision = {
  module_id: "AG23I",
  title: "Homepage Daily Surface and First Light Closure Decision Record",
  status: "homepage_daily_surface_audit_passed_ready_for_ag23z_closure",
  decision: {
    proceed_to_ag23z_homepage_daily_surface_and_first_light_closure: true,
    perform_homepage_mutation_now: false,
    perform_runtime_write_now: false,
    perform_live_feed_activation_now: false,
    perform_scraping_or_api_call_now: false,
    perform_article_generation_now: false,
    perform_github_write_now: false,
    perform_deployment_now: false,
    perform_publishing_now: false,
    activate_supabase_auth_backend_now: false
  },
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG23I",
  title: "Homepage Daily Surface and First Light Closure Readiness Record",
  status: "ready_for_ag23z_homepage_daily_surface_and_first_light_closure",
  ready_for_ag23z: true,
  next_stage_id: "AG23Z",
  next_stage_title: "Homepage Daily Surface and First Light Closure",
  audit_passed: true,
  real_execution_allowed_now: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG23I",
  title: "AG23I to AG23Z Homepage Daily Surface and First Light Closure Boundary",
  status: "ag23z_boundary_created_not_started",
  next_stage_id: "AG23Z",
  next_stage_title: "Homepage Daily Surface and First Light Closure",
  allowed_scope: [
    "Close AG23 homepage daily surface and First Light planning/scaffold chain.",
    "Summarise AG23A to AG23I outputs.",
    "Preserve non-live, non-mutating state.",
    "Create next boundary to AG24 Episodic Knowledge Engine."
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
  module_id: "AG23I",
  title: "Homepage Daily Surface Audit",
  status: "homepage_daily_surface_audit_passed_ready_for_ag23z_closure",
  depends_on: ["AG23H"],
  generated_from: inputs,
  audit_file: outputs.audit,
  decision_file: outputs.decision,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: audit.summary,
  blocked_state: blockedState
};

const registry = {
  module_id: "AG23I",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG23I",
  preview_only: true,
  status: review.status,
  message: "AG23I audit passed. Next: AG23Z Homepage Daily Surface and First Light Closure.",
  blocked_state: blockedState
};

const doc = `# AG23I — Homepage Daily Surface Audit

## Purpose

AG23I audits the AG23 homepage daily surface and First Light planning/scaffold chain.

## Audit Result

The AG23A–AG23H chain is coherent, non-live, and non-mutating. The Discover → Read → Reflect route, First Light signal template, scoring template and daily surface record template are present.

## Blocked State

No homepage mutation, runtime write, live feed, scraping, external API call, article generation, GitHub write, deployment, publishing, or Supabase/Auth/backend activation is performed.

## Next Stage

AG23Z — Homepage Daily Surface and First Light Closure.
`;

writeJson(outputs.review, review);
writeJson(outputs.audit, audit);
writeJson(outputs.decision, decision);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG23I Homepage Daily Surface Audit generated.");
console.log("✅ Audit passed with zero failed checks.");
console.log("✅ No runtime write, homepage mutation, GitHub write or publishing performed.");
console.log("✅ AG23Z Homepage Daily Surface and First Light Closure boundary created.");
