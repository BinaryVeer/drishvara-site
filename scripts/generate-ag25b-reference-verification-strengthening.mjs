import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag25aReview: "data/content-intelligence/quality-reviews/ag25a-featured-reads-inventory-gap-audit.json",
  ag25aAudit: "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-gap-audit.json",
  ag25aInventory: "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json",
  ag25aGapRegister: "data/content-intelligence/featured-reads/ag25a-featured-reads-gap-register.json",
  ag25aCategorySummary: "data/content-intelligence/featured-reads/ag25a-category-card-summary-inventory.json",
  ag25aReadiness: "data/content-intelligence/quality-registry/ag25a-reference-verification-strengthening-readiness-record.json",
  ag25aBoundary: "data/content-intelligence/mutation-plans/ag25a-to-ag25b-reference-verification-strengthening-boundary.json",
  ag25UmbrellaPlan: "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  ag25SourceGate: "data/content-intelligence/featured-reads/ag25-featured-reads-source-reference-gate-model.json",
  ag25QualityModel: "data/content-intelligence/featured-reads/ag25-featured-reads-quality-strengthening-model.json",
  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  ag23fVerificationPlan: "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  ag27DecisionCheckpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag25b-reference-verification-strengthening.json",
  plan: "data/content-intelligence/featured-reads/ag25b-reference-verification-strengthening-plan.json",
  worklist: "data/content-intelligence/featured-reads/ag25b-reference-verification-worklist.json",
  referenceStatusSchema: "data/content-intelligence/featured-reads/ag25b-reference-status-schema.json",
  priorityRegister: "data/content-intelligence/featured-reads/ag25b-reference-priority-register.json",
  consumptionPlan: "data/content-intelligence/featured-reads/ag25b-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag25b-reference-verification-strengthening-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag25b-image-credit-attribution-completion-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag25b-to-ag25c-image-credit-attribution-completion-boundary.json",
  registry: "data/quality/ag25b-reference-verification-strengthening.json",
  preview: "data/quality/ag25b-reference-verification-strengthening-preview.json",
  doc: "docs/quality/AG25B_REFERENCE_VERIFICATION_STRENGTHENING.md"
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
  if (!exists(p)) throw new Error(`Missing AG25B input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag25aReview.status !== "featured_reads_inventory_gap_audit_created_ready_for_ag25b") throw new Error("AG25A review status mismatch.");
if (records.ag25aAudit.status !== "featured_reads_inventory_gap_audit_created_ready_for_ag25b") throw new Error("AG25A audit status mismatch.");
if (records.ag25aReadiness.ready_for_ag25b !== true) throw new Error("AG25A readiness does not permit AG25B.");
if (records.ag25aBoundary.next_stage_id !== "AG25B") throw new Error("AG25A boundary does not point to AG25B.");
if (records.ag25UmbrellaPlan.status !== "featured_reads_production_strengthening_created_ready_for_ag26") throw new Error("AG25 umbrella plan status mismatch.");
if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z closure status mismatch.");
if (records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("Backend must remain deferred.");

const blockedState = {
  reference_runtime_verification_enabled: false,
  external_link_fetch_enabled: false,
  live_scraping_enabled: false,
  article_file_mutated: false,
  reference_written_to_article: false,
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

const articles = records.ag25aInventory.articles || [];

const workItems = articles.map((article) => {
  const missingReferenceTarget = article.external_url_count < 2;
  const priority =
    article.external_url_count === 0 ? "high" :
    article.external_url_count === 1 ? "medium" :
    "low";

  return {
    path: article.path,
    category: article.category,
    title: article.title,
    current_external_url_count: article.external_url_count,
    target_verified_references: 2,
    reference_target_met_by_count_signal: article.external_url_count >= 2,
    requires_reference_strengthening: missingReferenceTarget,
    priority,
    planned_reference_status: article.external_url_count >= 2 ? "count_signal_present_unverified" : "needs_reference_addition_or_editorial_verification",
    runtime_link_check_performed: false,
    article_mutation_performed: false,
    next_action:
      article.external_url_count >= 2
        ? "preserve_for_future_manual_verification"
        : "prioritise_for_AG25B_reference_strengthening"
  };
});

const priorityRegister = {
  module_id: "AG25B",
  title: "Reference Priority Register",
  status: "reference_priority_register_created_no_runtime_fetch",
  total_articles: workItems.length,
  high_priority_count: workItems.filter((item) => item.priority === "high").length,
  medium_priority_count: workItems.filter((item) => item.priority === "medium").length,
  low_priority_count: workItems.filter((item) => item.priority === "low").length,
  work_items_by_priority: {
    high: workItems.filter((item) => item.priority === "high").map((item) => item.path),
    medium: workItems.filter((item) => item.priority === "medium").map((item) => item.path),
    low: workItems.filter((item) => item.priority === "low").map((item) => item.path)
  },
  blocked_state: blockedState
};

const referenceStatusSchema = {
  module_id: "AG25B",
  title: "Reference Status Schema",
  status: "reference_status_schema_created_no_runtime_fetch",
  target_verified_references_per_featured_read: 2,
  allowed_statuses: [
    "verified",
    "partially_verified",
    "count_signal_present_unverified",
    "needs_reference_addition_or_editorial_verification",
    "under_editorial_verification",
    "blocked_broken_or_spam_source"
  ],
  blocked_reference_conditions: [
    "broken link",
    "parked domain",
    "spam-like source",
    "unreachable source",
    "irrelevant source",
    "invented citation",
    "unsupported breaking-news claim"
  ],
  verification_fields_for_future_manual_review: [
    "reference_url",
    "reference_title",
    "source_type",
    "claim_supported",
    "reachability_status",
    "credibility_status",
    "editorial_note"
  ],
  runtime_fetch_enabled: false,
  blocked_state: blockedState
};

const worklist = {
  module_id: "AG25B",
  title: "Reference Verification Worklist",
  status: "reference_verification_worklist_created_ready_for_ag25c",
  total_work_items: workItems.length,
  items_requiring_reference_strengthening: workItems.filter((item) => item.requires_reference_strengthening).length,
  items_with_two_or_more_reference_count_signal: workItems.filter((item) => item.reference_target_met_by_count_signal).length,
  work_items: workItems,
  runtime_link_check_performed: false,
  article_mutation_performed: false,
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG25B",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag25c_to_ag25z",
  future_consumption: {
    AG25C: "Image Credit and Attribution Completion should consume AG25B worklist while separately addressing image/object credit gaps from AG25A.",
    AG25D: "Featured Reads Layout Audit should use reference status to ensure references do not break article readability or card layout.",
    AG25Z: "Featured Reads Production Readiness Closure should close AG25A-AG25D with reference status preserved.",
    AG26A: "Editor Workspace UX Plan should later consume reference fields as manual correction inputs."
  },
  blocked_state: blockedState
};

const plan = {
  module_id: "AG25B",
  title: "Reference Verification Strengthening",
  status: "reference_verification_strengthening_created_ready_for_ag25c",
  purpose:
    "Strengthen Featured Reads reference governance by creating a non-runtime worklist, status schema and priority register from AG25A inventory without checking live links, mutating articles, publishing or activating backend systems.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag25a_status: records.ag25aAudit.status,
    article_files_scanned: records.ag25aInventory.total_article_files_scanned,
    articles_with_gaps: records.ag25aGapRegister.total_articles_with_gaps,
    ag25_source_gate_status: records.ag25SourceGate.status,
    ag24z_status: records.ag24zClosure.status,
    backend_deferred: records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred === true
  },
  strengthening_scope: {
    stage_type: "reference_verification_strengthening_plan",
    total_work_items: workItems.length,
    items_requiring_reference_strengthening: worklist.items_requiring_reference_strengthening,
    runtime_reference_fetch_status: "blocked",
    article_mutation_status: "blocked",
    next_stage: "AG25C"
  },
  reference_status_schema_file: outputs.referenceStatusSchema,
  reference_worklist_file: outputs.worklist,
  priority_register_file: outputs.priorityRegister,
  future_consumption_plan_file: outputs.consumptionPlan,
  runtime_reference_fetch_allowed_in_ag25b: false,
  external_link_check_allowed_in_ag25b: false,
  article_file_mutation_allowed_in_ag25b: false,
  publication_allowed_in_ag25b: false,
  deployment_allowed_in_ag25b: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG25B",
  title: "Reference Verification Strengthening Blocker Register",
  status: "reference_verification_operations_blocked_pending_ag25c",
  blocked_items: [
    "No runtime reference verification.",
    "No external link fetch.",
    "No live scraping.",
    "No article file mutation.",
    "No reference write to article.",
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
  module_id: "AG25B",
  title: "Image Credit and Attribution Completion Readiness Record",
  status: "ready_for_ag25c_image_credit_attribution_completion",
  ready_for_ag25c: true,
  next_stage_id: "AG25C",
  next_stage_title: "Image Credit and Attribution Completion",
  reference_status_schema_created: true,
  reference_worklist_created: true,
  priority_register_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG25B",
  title: "AG25B to AG25C Image Credit and Attribution Completion Boundary",
  status: "ag25c_boundary_created_not_started",
  next_stage_id: "AG25C",
  next_stage_title: "Image Credit and Attribution Completion",
  allowed_scope: [
    "Consume AG25A image/object credit gaps.",
    "Consume AG25B reference status schema and worklist.",
    "Plan image credit and attribution completion without writing article files.",
    "Keep public mutation, deployment, publishing and backend activation blocked."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG25B",
  title: "Reference Verification Strengthening",
  status: "reference_verification_strengthening_created_ready_for_ag25c",
  depends_on: ["AG25A", "AG25", "AG24Z", "AG23F", "AG27"],
  generated_from: inputs,
  plan_file: outputs.plan,
  worklist_file: outputs.worklist,
  reference_status_schema_file: outputs.referenceStatusSchema,
  priority_register_file: outputs.priorityRegister,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    reference_verification_strengthening_created: true,
    total_work_items: workItems.length,
    items_requiring_reference_strengthening: worklist.items_requiring_reference_strengthening,
    ready_for_ag25c: true,
    runtime_reference_fetch_done: false,
    external_link_check_done: false,
    article_file_mutation_done: false,
    public_mutation_done: false,
    deployment_done: false,
    publishing_done: false,
    backend_activation_done: false,
    real_execution_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG25B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG25B",
  preview_only: true,
  status: review.status,
  message: "AG25B Reference Verification Strengthening created. Next: AG25C Image Credit and Attribution Completion.",
  total_work_items: workItems.length,
  items_requiring_reference_strengthening: worklist.items_requiring_reference_strengthening,
  runtime_reference_fetches: 0,
  external_link_checks: 0,
  mutated_articles: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG25B — Reference Verification Strengthening

## Purpose

AG25B creates a non-runtime reference verification strengthening model for Featured Reads.

## Consumed Source-of-Truth

- AG25A Featured Reads Inventory and Gap Audit.
- AG25 umbrella Featured Reads Production Strengthening record.
- AG24Z Episodic Knowledge Engine Closure.
- AG23F Source Verification Plan.
- AG27 backend decision checkpoint confirming Supabase/Auth/backend remains deferred.

## Output

AG25B creates:

- Reference verification worklist.
- Reference status schema.
- Reference priority register.
- AG25C handoff boundary.

## Non-Mutation Boundary

AG25B does not fetch links, scrape sources, verify links at runtime, edit article files, write references, mutate public pages, deploy, publish or activate Supabase/Auth/backend.

## Next Stage

AG25C — Image Credit and Attribution Completion.
`;

writeJson(outputs.review, review);
writeJson(outputs.plan, plan);
writeJson(outputs.worklist, worklist);
writeJson(outputs.referenceStatusSchema, referenceStatusSchema);
writeJson(outputs.priorityRegister, priorityRegister);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG25B Reference Verification Strengthening generated.");
console.log(`✅ Work items: ${workItems.length}`);
console.log(`✅ Items requiring reference strengthening: ${worklist.items_requiring_reference_strengthening}`);
console.log("✅ No runtime link fetch, article mutation, public mutation, deployment, publishing or backend activation performed.");
console.log("✅ AG25C Image Credit and Attribution Completion boundary created.");
