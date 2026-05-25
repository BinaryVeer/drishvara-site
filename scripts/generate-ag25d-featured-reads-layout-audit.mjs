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
  ag25cReview: "data/content-intelligence/quality-reviews/ag25c-image-credit-attribution-completion.json",
  ag25cPlan: "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-completion-plan.json",
  ag25cWorklist: "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-worklist.json",
  ag25cAttributionSchema: "data/content-intelligence/featured-reads/ag25c-attribution-status-schema.json",
  ag25cReadiness: "data/content-intelligence/quality-registry/ag25c-featured-reads-layout-audit-readiness-record.json",
  ag25cBoundary: "data/content-intelligence/mutation-plans/ag25c-to-ag25d-featured-reads-layout-audit-boundary.json",
  ag25UmbrellaPlan: "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  ag25QualityModel: "data/content-intelligence/featured-reads/ag25-featured-reads-quality-strengthening-model.json",
  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  ag27DecisionCheckpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag25d-featured-reads-layout-audit.json",
  plan: "data/content-intelligence/featured-reads/ag25d-featured-reads-layout-audit-plan.json",
  worklist: "data/content-intelligence/featured-reads/ag25d-layout-readiness-worklist.json",
  cardModel: "data/content-intelligence/featured-reads/ag25d-card-summary-layout-check-model.json",
  mobileModel: "data/content-intelligence/featured-reads/ag25d-mobile-article-width-audit-model.json",
  consumptionPlan: "data/content-intelligence/featured-reads/ag25d-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag25d-featured-reads-layout-audit-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag25d-featured-reads-production-readiness-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag25d-to-ag25z-featured-reads-production-readiness-closure-boundary.json",
  registry: "data/quality/ag25d-featured-reads-layout-audit.json",
  preview: "data/quality/ag25d-featured-reads-layout-audit-preview.json",
  doc: "docs/quality/AG25D_FEATURED_READS_LAYOUT_AUDIT.md"
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
  if (!exists(p)) throw new Error(`Missing AG25D input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag25aReview.status !== "featured_reads_inventory_gap_audit_created_ready_for_ag25b") throw new Error("AG25A review status mismatch.");
if (records.ag25bReview.status !== "reference_verification_strengthening_created_ready_for_ag25c") throw new Error("AG25B review status mismatch.");
if (records.ag25cReview.status !== "image_credit_attribution_completion_created_ready_for_ag25d") throw new Error("AG25C review status mismatch.");
if (records.ag25cPlan.status !== "image_credit_attribution_completion_created_ready_for_ag25d") throw new Error("AG25C plan status mismatch.");
if (records.ag25cReadiness.ready_for_ag25d !== true) throw new Error("AG25C readiness does not permit AG25D.");
if (records.ag25cBoundary.next_stage_id !== "AG25D") throw new Error("AG25C boundary does not point to AG25D.");
if (records.ag25UmbrellaPlan.status !== "featured_reads_production_strengthening_created_ready_for_ag26") throw new Error("AG25 umbrella plan status mismatch.");
if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z closure status mismatch.");
if (records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("Backend must remain deferred.");

const blockedState = {
  layout_audit_runtime_enabled: false,
  article_file_mutated: false,
  layout_changed: false,
  card_changed: false,
  summary_changed: false,
  css_changed: false,
  mobile_layout_changed: false,
  image_position_changed: false,
  table_position_changed: false,
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
const referenceWorkItems = records.ag25bWorklist.work_items || [];
const attributionWorkItems = records.ag25cWorklist.work_items || [];

const refMap = new Map(referenceWorkItems.map((item) => [item.path, item]));
const attrMap = new Map(attributionWorkItems.map((item) => [item.path, item]));

const workItems = articles.map((article) => {
  const refItem = refMap.get(article.path);
  const attrItem = attrMap.get(article.path);

  const layoutFlags = [];
  if (!article.summary_signal_detected) layoutFlags.push("summary_or_description_missing");
  if (!article.featured_card_signal_detected) layoutFlags.push("featured_card_signal_missing");
  if (article.object_count === 0) layoutFlags.push("no_object_or_visual_element_detected");
  if (article.object_count > 0 && article.image_credit_signal_detected !== true) layoutFlags.push("object_credit_signal_missing");
  if (refItem?.requires_reference_strengthening === true) layoutFlags.push("reference_strengthening_pending");
  if (attrItem?.requires_credit_or_attribution_completion === true) layoutFlags.push("attribution_completion_pending");

  const priority =
    layoutFlags.includes("summary_or_description_missing") || layoutFlags.includes("featured_card_signal_missing")
      ? "high"
      : layoutFlags.length >= 2
        ? "medium"
        : "low";

  return {
    path: article.path,
    category: article.category,
    title: article.title,
    summary_signal_detected: article.summary_signal_detected,
    featured_card_signal_detected: article.featured_card_signal_detected,
    object_count: article.object_count,
    image_count: article.image_count,
    table_count: article.table_count,
    reference_strengthening_pending: refItem?.requires_reference_strengthening === true,
    attribution_completion_pending: attrItem?.requires_credit_or_attribution_completion === true,
    layout_flags: layoutFlags,
    layout_gap_count: layoutFlags.length,
    priority,
    layout_audit_status: layoutFlags.length > 0 ? "layout_review_needed" : "layout_signal_present_unverified",
    runtime_layout_check_performed: false,
    article_mutation_performed: false,
    layout_mutation_performed: false,
    next_action: layoutFlags.length > 0
      ? "prioritise_for_AG25D_layout_audit_and_AG25Z_closure"
      : "preserve_for_future_manual_layout_review"
  };
});

const cardModel = {
  module_id: "AG25D",
  title: "Card and Summary Layout Check Model",
  status: "card_summary_layout_check_model_created_no_card_mutation",
  required_future_card_fields: [
    "title",
    "summary_or_description",
    "category",
    "featured_badge_or_card_signal",
    "hero_or_object_status",
    "reference_status",
    "credit_status",
    "editorial_note"
  ],
  card_rules: [
    "Featured Read cards should carry a readable title and short summary.",
    "Cards should not depend on unsupported runtime data.",
    "Card text should not be generated or rewritten in AG25D.",
    "Card readiness gaps should be preserved for AG25Z and future manual workflow stages."
  ],
  card_mutation_allowed: false,
  blocked_state: blockedState
};

const mobileModel = {
  module_id: "AG25D",
  title: "Mobile Article Width Audit Model",
  status: "mobile_article_width_audit_model_created_no_layout_mutation",
  layout_rules: [
    "Article body width should remain readable on desktop and mobile.",
    "Images, tables, figures, graphs and infographics should not overflow the reading column.",
    "Attribution blocks should remain readable and not deform the article shape.",
    "Tables and figures should stay centrally aligned where vertical flow is more suitable.",
    "Text wrapping around non-hero objects may be used later only if it preserves readability."
  ],
  future_manual_check_fields: [
    "article_width_status",
    "object_overflow_status",
    "mobile_layout_status",
    "hero_image_position_status",
    "table_alignment_status",
    "attribution_block_layout_status"
  ],
  runtime_layout_check_enabled: false,
  css_mutation_allowed: false,
  blocked_state: blockedState
};

const worklist = {
  module_id: "AG25D",
  title: "Layout Readiness Worklist",
  status: "layout_readiness_worklist_created_ready_for_ag25z",
  total_work_items: workItems.length,
  items_requiring_layout_review: workItems.filter((item) => item.layout_gap_count > 0).length,
  high_priority_count: workItems.filter((item) => item.priority === "high").length,
  medium_priority_count: workItems.filter((item) => item.priority === "medium").length,
  low_priority_count: workItems.filter((item) => item.priority === "low").length,
  work_items: workItems,
  runtime_layout_check_performed: false,
  article_mutation_performed: false,
  layout_mutation_performed: false,
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG25D",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag25z_and_ag26a",
  future_consumption: {
    AG25Z: "Featured Reads Production Readiness Closure should consume AG25A inventory, AG25B references, AG25C attribution and AG25D layout worklists.",
    AG26A: "Editor Workspace UX Plan should later consume unresolved layout/card/summary correction fields.",
    AG26B: "Admin Workspace UX Plan should consume closure-level readiness and blocker records."
  },
  blocked_state: blockedState
};

const plan = {
  module_id: "AG25D",
  title: "Featured Reads Layout Audit",
  status: "featured_reads_layout_audit_created_ready_for_ag25z",
  purpose:
    "Create a non-mutating Featured Reads layout audit plan using AG25A inventory, AG25B reference status and AG25C attribution status without changing article layout, cards, summaries, CSS, public pages, deployment or backend systems.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag25a_status: records.ag25aAudit.status,
    ag25b_status: records.ag25bPlan.status,
    ag25c_status: records.ag25cPlan.status,
    total_article_files_scanned: records.ag25aInventory.total_article_files_scanned,
    layout_work_items: workItems.length,
    layout_review_items: worklist.items_requiring_layout_review,
    ag25_quality_model_status: records.ag25QualityModel.status,
    ag24z_status: records.ag24zClosure.status,
    backend_deferred: records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred === true
  },
  audit_scope: {
    stage_type: "featured_reads_layout_audit_plan",
    total_work_items: workItems.length,
    items_requiring_layout_review: worklist.items_requiring_layout_review,
    runtime_layout_status: "blocked",
    article_mutation_status: "blocked",
    layout_mutation_status: "blocked",
    next_stage: "AG25Z"
  },
  layout_worklist_file: outputs.worklist,
  card_summary_layout_check_model_file: outputs.cardModel,
  mobile_article_width_audit_model_file: outputs.mobileModel,
  future_consumption_plan_file: outputs.consumptionPlan,
  runtime_layout_check_allowed_in_ag25d: false,
  article_file_mutation_allowed_in_ag25d: false,
  layout_change_allowed_in_ag25d: false,
  card_change_allowed_in_ag25d: false,
  summary_change_allowed_in_ag25d: false,
  css_change_allowed_in_ag25d: false,
  publication_allowed_in_ag25d: false,
  deployment_allowed_in_ag25d: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG25D",
  title: "Featured Reads Layout Audit Blocker Register",
  status: "featured_reads_layout_audit_operations_blocked_pending_ag25z",
  blocked_items: [
    "No runtime layout audit.",
    "No article file mutation.",
    "No layout change.",
    "No card change.",
    "No summary change.",
    "No CSS change.",
    "No mobile layout change.",
    "No image/table/figure position change.",
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
  module_id: "AG25D",
  title: "Featured Reads Production Readiness Closure Readiness Record",
  status: "ready_for_ag25z_featured_reads_production_readiness_closure",
  ready_for_ag25z: true,
  next_stage_id: "AG25Z",
  next_stage_title: "Featured Reads Production Readiness Closure",
  layout_worklist_created: true,
  card_summary_layout_check_model_created: true,
  mobile_article_width_audit_model_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG25D",
  title: "AG25D to AG25Z Featured Reads Production Readiness Closure Boundary",
  status: "ag25z_boundary_created_not_started",
  next_stage_id: "AG25Z",
  next_stage_title: "Featured Reads Production Readiness Closure",
  allowed_scope: [
    "Consume AG25A inventory/gap audit.",
    "Consume AG25B reference verification strengthening.",
    "Consume AG25C image credit and attribution completion.",
    "Consume AG25D layout audit.",
    "Close the detailed AG25A-AG25D Featured Reads readiness chain.",
    "Keep public mutation, deployment, publishing and backend activation blocked."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG25D",
  title: "Featured Reads Layout Audit",
  status: "featured_reads_layout_audit_created_ready_for_ag25z",
  depends_on: ["AG25A", "AG25B", "AG25C", "AG25", "AG24Z", "AG27"],
  generated_from: inputs,
  plan_file: outputs.plan,
  worklist_file: outputs.worklist,
  card_summary_layout_check_model_file: outputs.cardModel,
  mobile_article_width_audit_model_file: outputs.mobileModel,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    featured_reads_layout_audit_created: true,
    total_work_items: workItems.length,
    items_requiring_layout_review: worklist.items_requiring_layout_review,
    ready_for_ag25z: true,
    runtime_layout_check_done: false,
    article_file_mutation_done: false,
    layout_change_done: false,
    card_change_done: false,
    summary_change_done: false,
    css_change_done: false,
    public_mutation_done: false,
    deployment_done: false,
    publishing_done: false,
    backend_activation_done: false,
    real_execution_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG25D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG25D",
  preview_only: true,
  status: review.status,
  message: "AG25D Featured Reads Layout Audit created. Next: AG25Z Featured Reads Production Readiness Closure.",
  total_work_items: workItems.length,
  items_requiring_layout_review: worklist.items_requiring_layout_review,
  runtime_layout_checks: 0,
  mutated_articles: 0,
  layout_changes: 0,
  card_changes: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG25D — Featured Reads Layout Audit

## Purpose

AG25D creates a non-mutating layout audit plan for Featured Reads.

## Consumed Source-of-Truth

- AG25A Featured Reads Inventory and Gap Audit.
- AG25B Reference Verification Strengthening.
- AG25C Image Credit and Attribution Completion.
- AG25 umbrella Featured Reads Production Strengthening record.
- AG24Z Episodic Knowledge Engine Closure.
- AG27 backend decision checkpoint confirming Supabase/Auth/backend remains deferred.

## Output

AG25D creates:

- Layout readiness worklist.
- Card and summary layout check model.
- Mobile article width audit model.
- AG25Z production readiness closure boundary.

## Non-Mutation Boundary

AG25D does not edit articles, change cards, change summaries, change CSS, change object positions, mutate public pages, deploy, publish or activate Supabase/Auth/backend.

## Next Stage

AG25Z — Featured Reads Production Readiness Closure.
`;

writeJson(outputs.review, review);
writeJson(outputs.plan, plan);
writeJson(outputs.worklist, worklist);
writeJson(outputs.cardModel, cardModel);
writeJson(outputs.mobileModel, mobileModel);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG25D Featured Reads Layout Audit generated.");
console.log(`✅ Layout work items: ${workItems.length}`);
console.log(`✅ Items requiring layout review: ${worklist.items_requiring_layout_review}`);
console.log("✅ No article mutation, layout change, card change, deployment, publishing or backend activation performed.");
console.log("✅ AG25Z Featured Reads Production Readiness Closure boundary created.");
