import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag25aReview: "data/content-intelligence/quality-reviews/ag25a-featured-reads-inventory-gap-audit.json",
  ag25aAudit: "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-gap-audit.json",
  ag25aInventory: "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json",
  ag25aGapRegister: "data/content-intelligence/featured-reads/ag25a-featured-reads-gap-register.json",
  ag25aCategorySummary: "data/content-intelligence/featured-reads/ag25a-category-card-summary-inventory.json",
  ag25bReview: "data/content-intelligence/quality-reviews/ag25b-reference-verification-strengthening.json",
  ag25bPlan: "data/content-intelligence/featured-reads/ag25b-reference-verification-strengthening-plan.json",
  ag25bWorklist: "data/content-intelligence/featured-reads/ag25b-reference-verification-worklist.json",
  ag25bReadiness: "data/content-intelligence/quality-registry/ag25b-image-credit-attribution-completion-readiness-record.json",
  ag25bBoundary: "data/content-intelligence/mutation-plans/ag25b-to-ag25c-image-credit-attribution-completion-boundary.json",
  ag25UmbrellaPlan: "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  ag25QualityModel: "data/content-intelligence/featured-reads/ag25-featured-reads-quality-strengthening-model.json",
  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  ag27DecisionCheckpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag25c-image-credit-attribution-completion.json",
  plan: "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-completion-plan.json",
  worklist: "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-worklist.json",
  attributionSchema: "data/content-intelligence/featured-reads/ag25c-attribution-status-schema.json",
  priorityRegister: "data/content-intelligence/featured-reads/ag25c-object-credit-priority-register.json",
  consumptionPlan: "data/content-intelligence/featured-reads/ag25c-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag25c-image-credit-attribution-completion-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag25c-featured-reads-layout-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag25c-to-ag25d-featured-reads-layout-audit-boundary.json",
  registry: "data/quality/ag25c-image-credit-attribution-completion.json",
  preview: "data/quality/ag25c-image-credit-attribution-completion-preview.json",
  doc: "docs/quality/AG25C_IMAGE_CREDIT_ATTRIBUTION_COMPLETION.md"
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
  if (!exists(p)) throw new Error(`Missing AG25C input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag25aReview.status !== "featured_reads_inventory_gap_audit_created_ready_for_ag25b") throw new Error("AG25A review status mismatch.");
if (records.ag25aAudit.status !== "featured_reads_inventory_gap_audit_created_ready_for_ag25b") throw new Error("AG25A audit status mismatch.");
if (records.ag25bReview.status !== "reference_verification_strengthening_created_ready_for_ag25c") throw new Error("AG25B review status mismatch.");
if (records.ag25bPlan.status !== "reference_verification_strengthening_created_ready_for_ag25c") throw new Error("AG25B plan status mismatch.");
if (records.ag25bReadiness.ready_for_ag25c !== true) throw new Error("AG25B readiness does not permit AG25C.");
if (records.ag25bBoundary.next_stage_id !== "AG25C") throw new Error("AG25B boundary does not point to AG25C.");
if (records.ag25UmbrellaPlan.status !== "featured_reads_production_strengthening_created_ready_for_ag26") throw new Error("AG25 umbrella plan status mismatch.");
if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z closure status mismatch.");
if (records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("Backend must remain deferred.");

const blockedState = {
  image_credit_runtime_enabled: false,
  attribution_runtime_enabled: false,
  article_file_mutated: false,
  image_credit_written_to_article: false,
  attribution_written_to_article: false,
  image_generation_triggered: false,
  image_file_mutated: false,
  layout_changed: false,
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

const workItems = articles
  .filter((article) => article.image_count > 0 || article.figure_count > 0 || article.object_count > 0)
  .map((article) => {
    const needsCredit = article.object_count > 0 && article.image_credit_signal_detected !== true;
    const priority =
      needsCredit && article.image_count > 0 ? "high" :
      needsCredit ? "medium" :
      "low";

    return {
      path: article.path,
      category: article.category,
      title: article.title,
      image_count: article.image_count,
      figure_count: article.figure_count,
      table_count: article.table_count,
      object_count: article.object_count,
      image_credit_signal_detected: article.image_credit_signal_detected,
      requires_credit_or_attribution_completion: needsCredit,
      priority,
      planned_attribution_status: article.image_credit_signal_detected
        ? "credit_signal_present_unverified"
        : "needs_credit_or_editorial_attribution_review",
      runtime_attribution_check_performed: false,
      article_mutation_performed: false,
      image_mutation_performed: false,
      next_action: needsCredit
        ? "prioritise_for_AG25C_image_credit_attribution_completion"
        : "preserve_for_future_manual_credit_review"
    };
  });

const priorityRegister = {
  module_id: "AG25C",
  title: "Object Credit Priority Register",
  status: "object_credit_priority_register_created_no_article_mutation",
  total_object_articles: workItems.length,
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

const attributionSchema = {
  module_id: "AG25C",
  title: "Attribution Status Schema",
  status: "attribution_status_schema_created_no_runtime",
  allowed_statuses: [
    "credit_signal_present_unverified",
    "verified_credit_present",
    "needs_credit_or_editorial_attribution_review",
    "public_domain_or_generated_asset_pending_note",
    "source_unknown_under_editorial_verification",
    "blocked_missing_required_credit"
  ],
  required_future_fields: [
    "asset_id",
    "asset_type",
    "asset_location",
    "credit_text",
    "source_url",
    "licence_or_usage_note",
    "verification_status",
    "editorial_note"
  ],
  attribution_rules: [
    "Every article image/object should have a credit, source note, generated-asset note or editorial-verification status.",
    "Generated images should still carry generation/ownership/editorial note.",
    "Externally sourced images should not be treated as usable without source/credit review.",
    "Credit completion must not distort article layout or card display."
  ],
  runtime_attribution_check_enabled: false,
  blocked_state: blockedState
};

const worklist = {
  module_id: "AG25C",
  title: "Image Credit and Attribution Worklist",
  status: "image_credit_attribution_worklist_created_ready_for_ag25d",
  total_work_items: workItems.length,
  items_requiring_credit_or_attribution_completion: workItems.filter((item) => item.requires_credit_or_attribution_completion).length,
  items_with_credit_signal_present: workItems.filter((item) => item.image_credit_signal_detected).length,
  work_items: workItems,
  runtime_attribution_check_performed: false,
  article_mutation_performed: false,
  image_mutation_performed: false,
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG25C",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag25d_to_ag25z",
  future_consumption: {
    AG25D: "Featured Reads Layout Audit should consume image/object credit worklist and ensure attribution blocks do not break article width, card layout or mobile readability.",
    AG25Z: "Featured Reads Production Readiness Closure should close AG25A-AG25D with unresolved attribution items preserved.",
    AG26A: "Editor Workspace UX Plan should later consume attribution status fields as manual correction inputs."
  },
  blocked_state: blockedState
};

const plan = {
  module_id: "AG25C",
  title: "Image Credit and Attribution Completion",
  status: "image_credit_attribution_completion_created_ready_for_ag25d",
  purpose:
    "Create a non-mutating image/object credit and attribution completion plan from AG25A inventory and AG25B reference strengthening without writing article files, changing images, changing layout, publishing or activating backend systems.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag25a_status: records.ag25aAudit.status,
    ag25b_status: records.ag25bPlan.status,
    total_article_files_scanned: records.ag25aInventory.total_article_files_scanned,
    object_articles_detected: workItems.length,
    items_requiring_credit_or_attribution_completion: worklist.items_requiring_credit_or_attribution_completion,
    ag25_quality_model_status: records.ag25QualityModel.status,
    ag24z_status: records.ag24zClosure.status,
    backend_deferred: records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred === true
  },
  completion_scope: {
    stage_type: "image_credit_attribution_completion_plan",
    total_work_items: workItems.length,
    items_requiring_credit_or_attribution_completion: worklist.items_requiring_credit_or_attribution_completion,
    runtime_attribution_status: "blocked",
    article_mutation_status: "blocked",
    layout_mutation_status: "blocked",
    next_stage: "AG25D"
  },
  attribution_status_schema_file: outputs.attributionSchema,
  image_credit_worklist_file: outputs.worklist,
  priority_register_file: outputs.priorityRegister,
  future_consumption_plan_file: outputs.consumptionPlan,
  runtime_attribution_check_allowed_in_ag25c: false,
  article_file_mutation_allowed_in_ag25c: false,
  image_file_mutation_allowed_in_ag25c: false,
  image_generation_allowed_in_ag25c: false,
  layout_change_allowed_in_ag25c: false,
  publication_allowed_in_ag25c: false,
  deployment_allowed_in_ag25c: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG25C",
  title: "Image Credit and Attribution Completion Blocker Register",
  status: "image_credit_attribution_operations_blocked_pending_ag25d",
  blocked_items: [
    "No runtime attribution check.",
    "No article file mutation.",
    "No image credit write to article.",
    "No attribution write to article.",
    "No image generation trigger.",
    "No image file mutation.",
    "No layout change.",
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
  module_id: "AG25C",
  title: "Featured Reads Layout Audit Readiness Record",
  status: "ready_for_ag25d_featured_reads_layout_audit",
  ready_for_ag25d: true,
  next_stage_id: "AG25D",
  next_stage_title: "Featured Reads Layout Audit",
  attribution_status_schema_created: true,
  image_credit_worklist_created: true,
  priority_register_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG25C",
  title: "AG25C to AG25D Featured Reads Layout Audit Boundary",
  status: "ag25d_boundary_created_not_started",
  next_stage_id: "AG25D",
  next_stage_title: "Featured Reads Layout Audit",
  allowed_scope: [
    "Consume AG25A inventory, AG25B reference worklist and AG25C attribution worklist.",
    "Audit Featured Reads layout readiness, card readiness, article width and mobile safety.",
    "Keep article mutation, public mutation, deployment, publishing and backend activation blocked."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG25C",
  title: "Image Credit and Attribution Completion",
  status: "image_credit_attribution_completion_created_ready_for_ag25d",
  depends_on: ["AG25A", "AG25B", "AG25", "AG24Z", "AG27"],
  generated_from: inputs,
  plan_file: outputs.plan,
  worklist_file: outputs.worklist,
  attribution_status_schema_file: outputs.attributionSchema,
  priority_register_file: outputs.priorityRegister,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    image_credit_attribution_completion_created: true,
    total_work_items: workItems.length,
    items_requiring_credit_or_attribution_completion: worklist.items_requiring_credit_or_attribution_completion,
    ready_for_ag25d: true,
    runtime_attribution_check_done: false,
    article_file_mutation_done: false,
    image_file_mutation_done: false,
    image_generation_done: false,
    layout_change_done: false,
    public_mutation_done: false,
    deployment_done: false,
    publishing_done: false,
    backend_activation_done: false,
    real_execution_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG25C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG25C",
  preview_only: true,
  status: review.status,
  message: "AG25C Image Credit and Attribution Completion created. Next: AG25D Featured Reads Layout Audit.",
  total_work_items: workItems.length,
  items_requiring_credit_or_attribution_completion: worklist.items_requiring_credit_or_attribution_completion,
  runtime_attribution_checks: 0,
  mutated_articles: 0,
  mutated_images: 0,
  layout_changes: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG25C — Image Credit and Attribution Completion

## Purpose

AG25C creates a non-mutating image/object credit and attribution completion plan for Featured Reads.

## Consumed Source-of-Truth

- AG25A Featured Reads Inventory and Gap Audit.
- AG25B Reference Verification Strengthening.
- AG25 umbrella Featured Reads Production Strengthening record.
- AG24Z Episodic Knowledge Engine Closure.
- AG27 backend decision checkpoint confirming Supabase/Auth/backend remains deferred.

## Output

AG25C creates:

- Image credit and attribution worklist.
- Attribution status schema.
- Object credit priority register.
- AG25D handoff boundary.

## Non-Mutation Boundary

AG25C does not edit articles, write credits, change images, trigger image generation, change layout, mutate public pages, deploy, publish or activate Supabase/Auth/backend.

## Next Stage

AG25D — Featured Reads Layout Audit.
`;

writeJson(outputs.review, review);
writeJson(outputs.plan, plan);
writeJson(outputs.worklist, worklist);
writeJson(outputs.attributionSchema, attributionSchema);
writeJson(outputs.priorityRegister, priorityRegister);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG25C Image Credit and Attribution Completion generated.");
console.log(`✅ Object/article work items: ${workItems.length}`);
console.log(`✅ Items requiring credit or attribution completion: ${worklist.items_requiring_credit_or_attribution_completion}`);
console.log("✅ No article mutation, image mutation, layout change, deployment, publishing or backend activation performed.");
console.log("✅ AG25D Featured Reads Layout Audit boundary created.");
