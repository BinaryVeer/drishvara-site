import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag23eReview: "data/content-intelligence/quality-reviews/ag23e-daily-homepage-data-schema.json",
  ag23eSchema: "data/content-intelligence/homepage/ag23e-daily-homepage-data-schema.json",
  ag23eFirstLightSchema: "data/content-intelligence/homepage/ag23e-first-light-card-schema.json",
  ag23eReadiness: "data/content-intelligence/quality-registry/ag23e-first-light-source-verification-readiness-record.json",
  ag23eBoundary: "data/content-intelligence/mutation-plans/ag23e-to-ag23f-first-light-source-verification-plan-boundary.json",
  ag23bSourceBands: "data/content-intelligence/homepage/ag23b-first-light-source-band-plan.json",
  ag23bSafetyRules: "data/content-intelligence/homepage/ag23b-first-light-freshness-and-safety-rules.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag23f-first-light-source-verification-plan.json",
  plan: "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  sourceCategories: "data/content-intelligence/homepage/ag23f-allowed-source-categories.json",
  verificationWorkflow: "data/content-intelligence/homepage/ag23f-source-verification-workflow.json",
  rejectionRules: "data/content-intelligence/homepage/ag23f-unsupported-claim-rejection-rules.json",
  blocker: "data/content-intelligence/quality-registry/ag23f-source-verification-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag23f-topic-scoring-model-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag23f-to-ag23g-first-light-topic-scoring-model-boundary.json",
  registry: "data/quality/ag23f-first-light-source-verification-plan.json",
  preview: "data/quality/ag23f-first-light-source-verification-plan-preview.json",
  doc: "docs/quality/AG23F_FIRST_LIGHT_SOURCE_VERIFICATION_PLAN.md"
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
  if (!exists(p)) throw new Error(`Missing AG23F input: ${p}`);
}

const ag23eReview = readJson(inputs.ag23eReview);
const ag23eSchema = readJson(inputs.ag23eSchema);
const ag23eReadiness = readJson(inputs.ag23eReadiness);
const ag23eBoundary = readJson(inputs.ag23eBoundary);
const sourceBands = readJson(inputs.ag23bSourceBands);
const safetyRules = readJson(inputs.ag23bSafetyRules);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag23eReview.status !== "daily_homepage_data_schema_created_ready_for_ag23f") {
  throw new Error("AG23E review is not ready for AG23F.");
}
if (ag23eSchema.status !== "daily_homepage_data_schema_created_ready_for_ag23f") {
  throw new Error("AG23E schema status mismatch.");
}
if (ag23eReadiness.ready_for_ag23f !== true) {
  throw new Error("AG23E readiness does not allow AG23F.");
}
if (ag23eBoundary.next_stage_id !== "AG23F") {
  throw new Error("AG23E boundary does not point to AG23F.");
}

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

const sourceCategories = {
  module_id: "AG23F",
  title: "Allowed Source Categories",
  status: "allowed_source_categories_created_no_fetching",
  categories: [
    {
      category: "official_primary",
      use_for: "policy, public programme, institutional or government claims",
      minimum_requirement: "direct official page, circular, report, release or portal record"
    },
    {
      category: "reputed_news_reference",
      use_for: "daily signal context and public-interest developments",
      minimum_requirement: "credible outlet with clear date, author/source attribution and non-sensational framing"
    },
    {
      category: "knowledge_reference",
      use_for: "science, health, education and explanatory topics",
      minimum_requirement: "reputed institutional, academic, educational or technical source"
    },
    {
      category: "cultural_calendar_reference",
      use_for: "festival, panchang, observance and cultural timing context",
      minimum_requirement: "careful wording; avoid presenting interpretive traditions as universal fact"
    }
  ],
  inherited_source_bands: sourceBands.source_bands.map((x) => x.band),
  blocked_state: blockedState
};

const verificationWorkflow = {
  module_id: "AG23F",
  title: "Source Verification Workflow",
  status: "source_verification_workflow_created_no_live_check",
  workflow_steps: [
    "Identify the signal claim.",
    "Classify claim type: official, current event, knowledge, cultural/calendar, reflection.",
    "Assign minimum acceptable source category.",
    "Check date/freshness requirement.",
    "Check whether claim wording is factual, interpretive or reflective.",
    "Mark verification status: verified, needs_review, hold or reject.",
    "Only verified or reviewed signals may move to AG23G topic scoring later."
  ],
  verification_status_values: ["verified", "needs_review", "hold", "reject"],
  no_live_check_now: true,
  blocked_state: blockedState
};

const rejectionRules = {
  module_id: "AG23F",
  title: "Unsupported Claim Rejection Rules",
  status: "unsupported_claim_rejection_rules_created",
  reject_or_hold_when: [
    "Signal depends only on unverified social media posts.",
    "Source is unavailable, broken, parked, spam-like or irrelevant.",
    "Claim uses breaking-news certainty without reliable confirmation.",
    "Health, legal, financial or safety-sensitive claim lacks authoritative support.",
    "Religious/cultural statement is framed as universal fact without qualification.",
    "Topic is high-risk, defamatory, sensational or unsuitable for Drishvara tone."
  ],
  inherited_safety_rules: safetyRules.rules,
  blocked_state: blockedState
};

const plan = {
  module_id: "AG23F",
  title: "First Light Source and Verification Plan",
  status: "first_light_source_verification_plan_created_ready_for_ag23g",
  purpose: "Define how First Light signals will be source-reviewed before scoring or conversion into homepage/article candidates.",
  verification_model: "planning_only_non_live",
  source_categories_file: outputs.sourceCategories,
  verification_workflow_file: outputs.verificationWorkflow,
  rejection_rules_file: outputs.rejectionRules,
  future_allowed_output: "verified_or_review_ready_signal_candidates_for_ag23g_scoring",
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG23F",
  title: "Source Verification Blocker Register",
  status: "source_verification_operations_blocked_pending_ag23g",
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
  module_id: "AG23F",
  title: "Topic Scoring Model Readiness Record",
  status: "ready_for_ag23g_first_light_topic_scoring_model",
  ready_for_ag23g: true,
  next_stage_id: "AG23G",
  next_stage_title: "First Light Topic Scoring Model",
  source_verification_plan_created: true,
  source_categories_created: true,
  verification_workflow_created: true,
  rejection_rules_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG23F",
  title: "AG23F to AG23G First Light Topic Scoring Model Boundary",
  status: "ag23g_boundary_created_not_started",
  next_stage_id: "AG23G",
  next_stage_title: "First Light Topic Scoring Model",
  allowed_scope: [
    "Define relevance, freshness, Drishvara fit, reference readiness, series potential and risk scoring.",
    "Use source verification status as scoring gate.",
    "Keep non-live and non-mutating."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG23F",
  title: "First Light Source and Verification Plan",
  status: "first_light_source_verification_plan_created_ready_for_ag23g",
  depends_on: ["AG23E"],
  generated_from: inputs,
  plan_file: outputs.plan,
  source_categories_file: outputs.sourceCategories,
  verification_workflow_file: outputs.verificationWorkflow,
  rejection_rules_file: outputs.rejectionRules,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    source_verification_plan_created: true,
    source_categories_created: true,
    verification_workflow_created: true,
    rejection_rules_created: true,
    ready_for_ag23g: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG23F",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG23F",
  preview_only: true,
  status: review.status,
  message: "AG23F source verification plan created. Next: AG23G First Light Topic Scoring Model.",
  blocked_state: blockedState
};

const doc = `# AG23F — First Light Source and Verification Plan

## Purpose

AG23F defines how First Light signals will be source-reviewed before scoring or conversion.

## Verification Model

Signals must be classified by claim type and checked against acceptable source categories. Unsupported, risky or unverified claims must be held or rejected.

## Source Categories

- Official primary sources.
- Reputed news references.
- Knowledge references.
- Cultural/calendar references.

## Blocked State

No live feed, scraping, external API call, runtime write, homepage mutation, article generation, GitHub write, deployment, publishing, or Supabase/Auth/backend activation is performed.

## Next Stage

AG23G — First Light Topic Scoring Model.
`;

writeJson(outputs.review, review);
writeJson(outputs.plan, plan);
writeJson(outputs.sourceCategories, sourceCategories);
writeJson(outputs.verificationWorkflow, verificationWorkflow);
writeJson(outputs.rejectionRules, rejectionRules);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG23F First Light Source and Verification Plan generated.");
console.log("✅ Source categories, verification workflow and rejection rules created.");
console.log("✅ No live feed, scraping, API call, runtime write, GitHub write or publishing performed.");
console.log("✅ AG23G First Light Topic Scoring Model boundary created.");
