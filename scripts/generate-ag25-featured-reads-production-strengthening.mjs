import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag24zReview: "data/content-intelligence/quality-reviews/ag24z-episodic-knowledge-engine-closure.json",
  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  ag24zSourceChain: "data/content-intelligence/episodes/ag24z-ag24-source-chain-register.json",
  ag24zNonActivation: "data/content-intelligence/episodes/ag24z-non-activation-closure-register.json",
  ag24zAg25Handoff: "data/content-intelligence/episodes/ag24z-ag25-featured-reads-handoff-plan.json",
  ag24zReadiness: "data/content-intelligence/quality-registry/ag24z-featured-reads-production-strengthening-readiness-record.json",
  ag24zBoundary: "data/content-intelligence/mutation-plans/ag24z-to-ag25-featured-reads-production-strengthening-boundary.json",
  ag24bPlan: "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  ag24fMetadataSchema: "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  ag24iAuditPlan: "data/content-intelligence/episodes/ag24i-episode-quality-audit-plan.json",
  ag23fVerificationPlan: "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  ag23gScoringModel: "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  ag23zClosure: "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag25-featured-reads-production-strengthening.json",
  plan: "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  sourceGateModel: "data/content-intelligence/featured-reads/ag25-featured-reads-source-reference-gate-model.json",
  productionControlModel: "data/content-intelligence/featured-reads/ag25-featured-reads-production-control-model.json",
  qualityStrengtheningModel: "data/content-intelligence/featured-reads/ag25-featured-reads-quality-strengthening-model.json",
  consumptionPlan: "data/content-intelligence/featured-reads/ag25-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag25-featured-reads-production-strengthening-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag25-admin-editor-manual-workflow-strengthening-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag25-to-ag26-admin-editor-manual-workflow-strengthening-boundary.json",
  registry: "data/quality/ag25-featured-reads-production-strengthening.json",
  preview: "data/quality/ag25-featured-reads-production-strengthening-preview.json",
  doc: "docs/quality/AG25_FEATURED_READS_PRODUCTION_STRENGTHENING.md"
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
  if (!exists(p)) throw new Error(`Missing AG25 input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z closure status mismatch.");
if (records.ag24zClosure.closure_decision?.ready_for_ag25 !== true) throw new Error("AG24Z does not permit AG25.");
if (records.ag24zReadiness.ready_for_ag25 !== true) throw new Error("AG24Z readiness does not permit AG25.");
if (records.ag24zBoundary.next_stage_id !== "AG25") throw new Error("AG24Z boundary does not point to AG25.");
if (records.ag24zSourceChain.chain_length !== 9) throw new Error("AG24 source chain must contain 9 stages.");
if (records.ag24bPlan.status !== "governed_plan_only_non_active") throw new Error("AG24B plan must remain non-active.");
if (records.ag24fMetadataSchema.status !== "episode_metadata_schema_created_ready_for_ag24g") throw new Error("AG24F metadata schema status mismatch.");
if (records.ag24iAuditPlan.status !== "episode_quality_audit_created_ready_for_ag24z") throw new Error("AG24I audit plan status mismatch.");
if (records.ag23zClosure.closure_decision?.ag23_closed !== true) throw new Error("AG23Z closure not confirmed.");

const blockedState = {
  featured_read_selected_for_publication: false,
  featured_read_generated: false,
  article_file_created: false,
  image_generation_triggered: false,
  reference_fetch_runtime_enabled: false,
  live_scraping_enabled: false,
  external_api_call_enabled: false,
  public_index_mutated: false,
  homepage_mutated: false,
  category_page_mutated: false,
  sitemap_feed_mutated: false,
  data_written_to_runtime: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false,
  supabase_auth_backend_activated: false
};

const strengtheningPrinciples = [
  {
    principle_id: "consume_ag24_source_chain",
    title: "Consume AG24 source chain",
    rule: "AG25 must use AG24Z closure, AG24B scoring, AG24F metadata and AG24I audit controls as source-of-truth.",
    status: "defined"
  },
  {
    principle_id: "two_reference_discipline",
    title: "Two-reference discipline",
    rule: "Each future Featured Read should target two verified references or be clearly marked under editorial verification.",
    status: "defined"
  },
  {
    principle_id: "no_random_links",
    title: "No random or fake references",
    rule: "Broken, parked, spam-like, unrelated or invented links must not be treated as verified references.",
    status: "defined"
  },
  {
    principle_id: "image_credit_required",
    title: "Image credit required",
    rule: "Future article images must carry image credit/attribution or editorial-verification status.",
    status: "defined"
  },
  {
    principle_id: "object_layout_guard",
    title: "Object and layout guard",
    rule: "Images, tables, figures, graphs and infographics must preserve readability, article width and mobile layout.",
    status: "defined"
  },
  {
    principle_id: "cost_first_production",
    title: "Cost-first production",
    rule: "Candidate scoring and editorial planning should occur before expensive generation, image creation or API-backed workflows.",
    status: "defined"
  },
  {
    principle_id: "non_activation",
    title: "Non-activation",
    rule: "AG25 is planning/strengthening only and must not publish, deploy, mutate public pages or activate backend systems.",
    status: "defined"
  }
];

const sourceGateModel = {
  module_id: "AG25",
  title: "Featured Reads Source and Reference Gate Model",
  status: "source_reference_gate_model_created_no_runtime_fetch",
  target_verified_references_per_featured_read: 2,
  allowed_reference_statuses: [
    "verified",
    "partially_verified",
    "under_editorial_verification"
  ],
  blocked_reference_conditions: [
    "broken link",
    "parked domain",
    "spam-like source",
    "irrelevant keyword-only match",
    "unreachable source",
    "unsupported breaking-news claim",
    "invented citation"
  ],
  source_quality_basis: [
    "official or primary source where possible",
    "credible institutional or academic source where possible",
    "reputable editorial source where appropriate",
    "direct relevance to article claim",
    "reachable and responsive link"
  ],
  runtime_reference_fetch_enabled: false,
  blocked_state: blockedState
};

const productionControlModel = {
  module_id: "AG25",
  title: "Featured Reads Production Control Model",
  status: "production_control_model_created_no_generation",
  production_flow: [
    "candidate intake",
    "topic/scoring review",
    "source/reference gate",
    "risk/sensitivity gate",
    "image/object planning",
    "metadata preparation",
    "editorial verification",
    "quality audit handoff"
  ],
  generation_allowed_in_ag25: false,
  image_generation_allowed_in_ag25: false,
  article_file_creation_allowed_in_ag25: false,
  github_write_allowed_in_ag25: false,
  deploy_allowed_in_ag25: false,
  publish_allowed_in_ag25: false,
  blocked_state: blockedState
};

const qualityStrengtheningModel = {
  module_id: "AG25",
  title: "Featured Reads Quality Strengthening Model",
  status: "quality_strengthening_model_created_no_public_mutation",
  quality_checks: [
    "topic relevance and originality",
    "AG24B scoring compatibility",
    "reference availability and credibility",
    "source-claim alignment",
    "risk and sensitivity review",
    "image/object attribution readiness",
    "mobile-safe layout readiness",
    "metadata completeness",
    "non-public and no-publish flags",
    "cost-control gate before generation"
  ],
  consumed_quality_sources: [
    inputs.ag24iAuditPlan,
    inputs.ag24fMetadataSchema,
    inputs.ag23fVerificationPlan
  ],
  public_mutation_allowed: false,
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG25",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag26_and_dynamic_site",
  future_consumption: {
    AG26: "Admin/Editor Manual Workflow Strengthening should consume AG25 source gates, production controls and quality checks as manual review workflow inputs.",
    AG27: "Supabase/Auth/Backend Decision Checkpoint must revisit backend activation only after static/manual governance is complete.",
    future_dynamic_site: "Later dynamic publishing stages must translate AG25 controls into runtime production rules only after explicit approval."
  },
  blocked_state: blockedState
};

const plan = {
  module_id: "AG25",
  title: "Featured Reads Production Strengthening",
  status: "featured_reads_production_strengthening_created_ready_for_ag26",
  purpose: "Strengthen Featured Reads production governance by carrying forward AG24 scoring, metadata, source/reference and quality audit controls without generating articles, publishing, deploying or activating backend systems.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag24z_status: records.ag24zClosure.status,
    ag24z_ready_for_ag25: records.ag24zClosure.closure_decision?.ready_for_ag25 === true,
    ag24_chain_length: records.ag24zSourceChain.chain_length,
    ag24b_status: records.ag24bPlan.status,
    ag24f_status: records.ag24fMetadataSchema.status,
    ag24i_status: records.ag24iAuditPlan.status,
    ag23z_closed: records.ag23zClosure.closure_decision?.ag23_closed === true
  },
  strengthening_scope: {
    stage_type: "governed_production_strengthening_plan",
    featured_read_generation_status: "blocked",
    article_file_creation_status: "blocked",
    public_mutation_status: "blocked",
    backend_activation_status: "deferred",
    next_stage: "AG26"
  },
  strengthening_principles: strengtheningPrinciples,
  source_gate_model_file: outputs.sourceGateModel,
  production_control_model_file: outputs.productionControlModel,
  quality_strengthening_model_file: outputs.qualityStrengtheningModel,
  future_consumption_plan_file: outputs.consumptionPlan,
  featured_read_generation_allowed_in_ag25: false,
  publication_allowed_in_ag25: false,
  public_visibility_default: false,
  publish_approved_default: false,
  supabase_auth_backend_deferred: true,
  supabase_reminder: records.supabaseReminder.reminder || "Supabase/Auth/backend remains deferred and must not be activated without explicit approval.",
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG25",
  title: "Featured Reads Production Strengthening Blocker Register",
  status: "featured_reads_operations_blocked_pending_ag26",
  blocked_items: [
    "No featured read selected for publication.",
    "No featured read generated.",
    "No article file creation.",
    "No image generation trigger.",
    "No reference-fetch runtime.",
    "No live scraping.",
    "No external API call.",
    "No public index mutation.",
    "No homepage mutation.",
    "No category page mutation.",
    "No sitemap/feed mutation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No Supabase/Auth/backend activation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG25",
  title: "Admin Editor Manual Workflow Strengthening Readiness Record",
  status: "ready_for_ag26_admin_editor_manual_workflow_strengthening",
  ready_for_ag26: true,
  next_stage_id: "AG26",
  next_stage_title: "Admin/Editor Manual Workflow Strengthening",
  featured_reads_strengthening_created: true,
  source_gate_model_created: true,
  production_control_model_created: true,
  quality_strengthening_model_created: true,
  future_consumption_plan_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG25",
  title: "AG25 to AG26 Admin/Editor Manual Workflow Strengthening Boundary",
  status: "ag26_boundary_created_not_started",
  next_stage_id: "AG26",
  next_stage_title: "Admin/Editor Manual Workflow Strengthening",
  allowed_scope: [
    "Consume AG25 source/reference gate model.",
    "Consume AG25 production control model.",
    "Consume AG25 quality strengthening model.",
    "Translate controls into manual Admin/Editor workflow planning.",
    "Remain non-publish/non-deploy/no-backend unless separately approved."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG25",
  title: "Featured Reads Production Strengthening",
  status: "featured_reads_production_strengthening_created_ready_for_ag26",
  depends_on: ["AG24Z", "AG24B", "AG24F", "AG24I", "AG23F", "AG23G", "AG23Z"],
  generated_from: inputs,
  plan_file: outputs.plan,
  source_gate_model_file: outputs.sourceGateModel,
  production_control_model_file: outputs.productionControlModel,
  quality_strengthening_model_file: outputs.qualityStrengtheningModel,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    featured_reads_strengthening_created: true,
    ag24z_consumed: true,
    source_gate_model_created: true,
    production_control_model_created: true,
    quality_strengthening_model_created: true,
    ready_for_ag26: true,
    featured_read_generation_done: false,
    article_file_creation_done: false,
    public_mutation_done: false,
    backend_activation_done: false,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG25",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG25",
  preview_only: true,
  status: review.status,
  message: "AG25 Featured Reads Production Strengthening created. Next: AG26 Admin/Editor Manual Workflow Strengthening.",
  strengthening_principles: strengtheningPrinciples.length,
  source_gate_created: true,
  production_control_created: true,
  quality_strengthening_created: true,
  generated_featured_reads: 0,
  generated_articles: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG25 — Featured Reads Production Strengthening

## Purpose

AG25 strengthens Featured Reads production governance using AG24 source-chain closure, scoring, metadata and quality controls.

## Consumed Source-of-Truth

- AG24Z Episodic Knowledge Engine Closure.
- AG24B Topic Selection and Scoring Engine Plan.
- AG24F Episode Metadata Schema.
- AG24I Episode Quality Audit.
- AG23F Source Verification Plan.
- AG23G First Light Topic Scoring Model.
- AG23Z Homepage Daily Surface and First Light Closure.

## Strengthening Scope

AG25 defines source/reference gates, production controls and quality strengthening rules for future Featured Reads.

## Non-Activation Boundary

AG25 does not generate Featured Reads, create article files, trigger image generation, mutate public pages, write to GitHub, deploy, publish, or activate Supabase/Auth/backend.

## Next Stage

AG26 — Admin/Editor Manual Workflow Strengthening.
`;

writeJson(outputs.review, review);
writeJson(outputs.plan, plan);
writeJson(outputs.sourceGateModel, sourceGateModel);
writeJson(outputs.productionControlModel, productionControlModel);
writeJson(outputs.qualityStrengtheningModel, qualityStrengtheningModel);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG25 Featured Reads Production Strengthening generated.");
console.log("✅ Source/reference gate, production control and quality strengthening models created.");
console.log("✅ AG24Z closure and AG24/AG23 governance records consumed.");
console.log("✅ No featured read generation, article file creation, GitHub write, deployment, publishing or backend activation performed.");
console.log("✅ AG26 Admin/Editor Manual Workflow Strengthening boundary created.");
