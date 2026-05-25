import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  ag24zSourceChain: "data/content-intelligence/episodes/ag24z-ag24-source-chain-register.json",
  ag24zAg25Handoff: "data/content-intelligence/episodes/ag24z-ag25-featured-reads-handoff-plan.json",
  ag25UmbrellaPlan: "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  ag25SourceGate: "data/content-intelligence/featured-reads/ag25-featured-reads-source-reference-gate-model.json",
  ag25QualityModel: "data/content-intelligence/featured-reads/ag25-featured-reads-quality-strengthening-model.json",
  ag26UmbrellaPlan: "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  ag27DecisionCheckpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag25a-featured-reads-inventory-gap-audit.json",
  audit: "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-gap-audit.json",
  inventory: "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json",
  gapRegister: "data/content-intelligence/featured-reads/ag25a-featured-reads-gap-register.json",
  categoryCardSummary: "data/content-intelligence/featured-reads/ag25a-category-card-summary-inventory.json",
  consumptionPlan: "data/content-intelligence/featured-reads/ag25a-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag25a-featured-reads-inventory-gap-audit-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag25a-reference-verification-strengthening-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag25a-to-ag25b-reference-verification-strengthening-boundary.json",
  registry: "data/quality/ag25a-featured-reads-inventory-gap-audit.json",
  preview: "data/quality/ag25a-featured-reads-inventory-gap-audit-preview.json",
  doc: "docs/quality/AG25A_FEATURED_READS_INVENTORY_GAP_AUDIT.md"
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
  if (!exists(p)) throw new Error(`Missing AG25A input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z closure status mismatch.");
if (records.ag24zClosure.closure_decision?.ready_for_ag25 !== true) throw new Error("AG24Z does not permit AG25.");
if (records.ag24zSourceChain.chain_length !== 9) throw new Error("AG24 source chain must contain 9 stages.");
if (records.ag25UmbrellaPlan.status !== "featured_reads_production_strengthening_created_ready_for_ag26") throw new Error("AG25 umbrella plan status mismatch.");
if (records.ag26UmbrellaPlan.status !== "admin_editor_manual_workflow_strengthening_created_ready_for_ag27") throw new Error("AG26 umbrella plan status mismatch.");
if (records.ag27DecisionCheckpoint.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") throw new Error("AG27 backend decision checkpoint status mismatch.");
if (records.ag27DecisionCheckpoint.checkpoint_decision?.backend_activation_approved !== false) throw new Error("Backend must remain unapproved.");

const blockedState = {
  inventory_runtime_enabled: false,
  article_file_mutated: false,
  reference_verified_runtime: false,
  image_credit_written: false,
  layout_changed: false,
  card_changed: false,
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

const articleRoot = path.join(root, "articles");

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      acc.push(full);
    }
  }

  return acc;
}

function rel(p) {
  return path.relative(root, p).split(path.sep).join("/");
}

function matchCount(text, regex) {
  return (text.match(regex) || []).length;
}

function firstMatch(text, regex) {
  const match = text.match(regex);
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

const articleFiles = walk(articleRoot);

const articles = articleFiles.map((file) => {
  const text = fs.readFileSync(file, "utf8");
  const repoPath = rel(file);
  const parts = repoPath.split("/");
  const category = parts.length >= 3 ? parts[1] : "uncategorized";

  const title =
    firstMatch(text, /<title[^>]*>([\s\S]*?)<\/title>/i) ||
    firstMatch(text, /<h1[^>]*>([\s\S]*?)<\/h1>/i);

  const description =
    firstMatch(text, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
    firstMatch(text, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i);

  const externalUrls = Array.from(new Set(text.match(/https?:\/\/[^"'<>\s)]+/g) || []));
  const imageCount = matchCount(text, /<img\b/gi);
  const figureCount = matchCount(text, /<figure\b/gi);
  const tableCount = matchCount(text, /<table\b/gi);
  const objectCount = imageCount + figureCount + tableCount + matchCount(text, /<svg\b|<canvas\b/gi);
  const creditSignal = /credit|attribution|image source|photo source|source:/i.test(text);
  const cardSignal = /card|featured|read-card|article-card/i.test(text);
  const summarySignal = Boolean(description) || /summary|excerpt|dek|subtitle/i.test(text);

  const gaps = [];
  if (!title) gaps.push("missing_title");
  if (!summarySignal) gaps.push("missing_summary_or_description");
  if (externalUrls.length < 2) gaps.push("fewer_than_two_reference_urls");
  if (imageCount > 0 && !creditSignal) gaps.push("image_credit_or_attribution_not_detected");
  if (objectCount === 0) gaps.push("no_object_image_table_figure_detected");
  if (!cardSignal) gaps.push("featured_card_signal_not_detected");

  return {
    path: repoPath,
    category,
    title: title || null,
    description_present: Boolean(description),
    external_url_count: externalUrls.length,
    reference_target_met: externalUrls.length >= 2,
    image_count: imageCount,
    figure_count: figureCount,
    table_count: tableCount,
    object_count: objectCount,
    image_credit_signal_detected: creditSignal,
    summary_signal_detected: summarySignal,
    featured_card_signal_detected: cardSignal,
    gap_count: gaps.length,
    gaps
  };
});

const categoryMap = new Map();

for (const article of articles) {
  if (!categoryMap.has(article.category)) {
    categoryMap.set(article.category, {
      category: article.category,
      article_count: 0,
      articles_with_reference_target_met: 0,
      articles_with_credit_signal: 0,
      articles_with_summary_signal: 0,
      articles_with_card_signal: 0,
      total_gaps: 0
    });
  }

  const row = categoryMap.get(article.category);
  row.article_count += 1;
  if (article.reference_target_met) row.articles_with_reference_target_met += 1;
  if (article.image_credit_signal_detected) row.articles_with_credit_signal += 1;
  if (article.summary_signal_detected) row.articles_with_summary_signal += 1;
  if (article.featured_card_signal_detected) row.articles_with_card_signal += 1;
  row.total_gaps += article.gap_count;
}

const categories = Array.from(categoryMap.values()).sort((a, b) => a.category.localeCompare(b.category));

const gapItems = articles
  .filter((article) => article.gap_count > 0)
  .map((article) => ({
    path: article.path,
    category: article.category,
    gap_count: article.gap_count,
    gaps: article.gaps,
    next_relevant_stage: article.gaps.includes("fewer_than_two_reference_urls")
      ? "AG25B"
      : article.gaps.includes("image_credit_or_attribution_not_detected")
        ? "AG25C"
        : article.gaps.includes("missing_summary_or_description") || article.gaps.includes("featured_card_signal_not_detected")
          ? "AG25A/AG25D"
          : "AG25D"
  }));

const inventory = {
  module_id: "AG25A",
  title: "Featured Reads Inventory Register",
  status: "featured_reads_inventory_created_no_mutation",
  article_root: "articles",
  total_article_files_scanned: articles.length,
  total_categories_detected: categories.length,
  articles,
  blocked_state: blockedState
};

const gapRegister = {
  module_id: "AG25A",
  title: "Featured Reads Gap Register",
  status: "featured_reads_gap_register_created_ready_for_ag25b",
  total_articles_with_gaps: gapItems.length,
  total_gap_count: gapItems.reduce((sum, item) => sum + item.gap_count, 0),
  gap_items: gapItems,
  gap_type_summary: gapItems.reduce((acc, item) => {
    for (const gap of item.gaps) acc[gap] = (acc[gap] || 0) + 1;
    return acc;
  }, {}),
  blocked_state: blockedState
};

const categoryCardSummary = {
  module_id: "AG25A",
  title: "Category, Card and Summary Inventory",
  status: "category_card_summary_inventory_created_no_public_mutation",
  categories,
  category_count: categories.length,
  card_summary_findings: {
    articles_missing_summary_or_description: articles.filter((a) => !a.summary_signal_detected).length,
    articles_missing_featured_card_signal: articles.filter((a) => !a.featured_card_signal_detected).length,
    articles_with_detected_objects: articles.filter((a) => a.object_count > 0).length,
    articles_without_detected_objects: articles.filter((a) => a.object_count === 0).length
  },
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG25A",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag25b_to_ag25z",
  future_consumption: {
    AG25B: "Reference Verification Strengthening should consume AG25A inventory and gap register, prioritising items with fewer_than_two_reference_urls.",
    AG25C: "Image Credit and Attribution Completion should consume AG25A image/object and credit-signal gaps.",
    AG25D: "Featured Reads Layout Audit should consume object, card, summary and layout-readiness findings.",
    AG25Z: "Featured Reads Production Readiness Closure should close AG25A-AG25D as the detailed Featured Reads strengthening chain.",
    AG26A: "Editor Workspace UX Plan should later consume unresolved correction needs and manual correction fields."
  },
  blocked_state: blockedState
};

const audit = {
  module_id: "AG25A",
  title: "Featured Reads Inventory and Gap Audit",
  status: "featured_reads_inventory_gap_audit_created_ready_for_ag25b",
  purpose:
    "Create a non-mutating inventory and gap audit of existing Featured Reads/article files, categories, references, image credits, objects, summaries and card-readiness signals.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag24z_status: records.ag24zClosure.status,
    ag25_umbrella_status: records.ag25UmbrellaPlan.status,
    ag26_umbrella_status: records.ag26UmbrellaPlan.status,
    ag27_status: records.ag27DecisionCheckpoint.status,
    backend_deferred: records.ag27DecisionCheckpoint.checkpoint_decision?.backend_deferred === true
  },
  audit_scope: {
    stage_type: "inventory_gap_audit",
    article_files_scanned: articles.length,
    categories_detected: categories.length,
    articles_with_gaps: gapItems.length,
    total_gap_count: gapRegister.total_gap_count,
    mutation_status: "blocked",
    next_stage: "AG25B"
  },
  inventory_file: outputs.inventory,
  gap_register_file: outputs.gapRegister,
  category_card_summary_file: outputs.categoryCardSummary,
  future_consumption_plan_file: outputs.consumptionPlan,
  article_file_mutation_allowed_in_ag25a: false,
  reference_verification_runtime_allowed_in_ag25a: false,
  public_mutation_allowed_in_ag25a: false,
  publication_allowed_in_ag25a: false,
  deployment_allowed_in_ag25a: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG25A",
  title: "Featured Reads Inventory and Gap Audit Blocker Register",
  status: "featured_reads_inventory_gap_operations_blocked_pending_ag25b",
  blocked_items: [
    "No article file mutation.",
    "No reference verification runtime.",
    "No image credit write.",
    "No layout change.",
    "No card change.",
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
  module_id: "AG25A",
  title: "Reference Verification Strengthening Readiness Record",
  status: "ready_for_ag25b_reference_verification_strengthening",
  ready_for_ag25b: true,
  next_stage_id: "AG25B",
  next_stage_title: "Reference Verification Strengthening",
  inventory_created: true,
  gap_register_created: true,
  category_card_summary_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG25A",
  title: "AG25A to AG25B Reference Verification Strengthening Boundary",
  status: "ag25b_boundary_created_not_started",
  next_stage_id: "AG25B",
  next_stage_title: "Reference Verification Strengthening",
  allowed_scope: [
    "Consume AG25A inventory and gap register.",
    "Prioritise articles with fewer than two detected references.",
    "Plan reference verification strengthening.",
    "Keep all article mutation, public mutation, deployment, publishing and backend activation blocked."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG25A",
  title: "Featured Reads Inventory and Gap Audit",
  status: "featured_reads_inventory_gap_audit_created_ready_for_ag25b",
  depends_on: ["AG24Z", "AG25", "AG26", "AG27"],
  generated_from: inputs,
  audit_file: outputs.audit,
  inventory_file: outputs.inventory,
  gap_register_file: outputs.gapRegister,
  category_card_summary_file: outputs.categoryCardSummary,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    inventory_gap_audit_created: true,
    article_files_scanned: articles.length,
    categories_detected: categories.length,
    articles_with_gaps: gapItems.length,
    total_gap_count: gapRegister.total_gap_count,
    ready_for_ag25b: true,
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
  module_id: "AG25A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG25A",
  preview_only: true,
  status: review.status,
  message: "AG25A Featured Reads Inventory and Gap Audit created. Next: AG25B Reference Verification Strengthening.",
  article_files_scanned: articles.length,
  categories_detected: categories.length,
  articles_with_gaps: gapItems.length,
  total_gap_count: gapRegister.total_gap_count,
  mutated_articles: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG25A — Featured Reads Inventory and Gap Audit

## Purpose

AG25A creates a non-mutating inventory and gap audit for Featured Reads/article readiness.

## Consumed Source-of-Truth

- AG24Z Episodic Knowledge Engine Closure.
- AG25 umbrella Featured Reads Production Strengthening record.
- AG26 umbrella Admin/Editor Manual Workflow Strengthening record.
- AG27 backend decision checkpoint confirming Supabase/Auth/backend remains deferred.

## Audit Scope

AG25A checks article files for:

- categories,
- reference-count signal,
- image/object presence,
- image credit or attribution signal,
- summary or description signal,
- Featured Read/card signal,
- gap type and next relevant stage.

## Non-Mutation Boundary

AG25A does not edit article files, verify links at runtime, write image credits, change layout, change cards, mutate public pages, deploy, publish or activate Supabase/Auth/backend.

## Next Stage

AG25B — Reference Verification Strengthening.
`;

writeJson(outputs.review, review);
writeJson(outputs.audit, audit);
writeJson(outputs.inventory, inventory);
writeJson(outputs.gapRegister, gapRegister);
writeJson(outputs.categoryCardSummary, categoryCardSummary);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG25A Featured Reads Inventory and Gap Audit generated.");
console.log(`✅ Article files scanned: ${articles.length}`);
console.log(`✅ Categories detected: ${categories.length}`);
console.log(`✅ Articles with gaps: ${gapItems.length}`);
console.log("✅ No article mutation, public mutation, deployment, publishing or backend activation performed.");
console.log("✅ AG25B Reference Verification Strengthening boundary created.");
