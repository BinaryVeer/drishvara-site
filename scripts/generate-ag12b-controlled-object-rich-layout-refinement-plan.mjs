import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag12aReview: "data/content-intelligence/quality-reviews/ag12a-object-rich-article-layout-production-readiness-audit.json",
  ag12aAudit: "data/content-intelligence/audit-records/ag12a-object-rich-article-layout-production-readiness-audit-report.json",
  ag12aDensity: "data/content-intelligence/object-registry/ag12a-object-sequence-density-record.json",
  ag12aReadiness: "data/content-intelligence/quality-registry/ag12a-layout-production-readiness-record.json",
  ag12aBoundary: "data/content-intelligence/mutation-plans/ag12a-to-ag12b-controlled-object-rich-layout-refinement-boundary.json",
  ag11gApply: "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag12b-controlled-object-rich-layout-refinement-plan.json");
const planPath = path.join(root, "data/content-intelligence/mutation-plans/ag12b-controlled-object-rich-layout-refinement-plan.json");
const densityRulePath = path.join(root, "data/content-intelligence/object-registry/ag12b-object-density-production-rule-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag12b-refinement-decision-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag12b-to-ag12c-controlled-layout-refinement-apply-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/controlled-object-rich-layout-refinement-plan.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag12b-controlled-object-rich-layout-refinement-plan-learning.json");
const registryPath = path.join(root, "data/quality/ag12b-controlled-object-rich-layout-refinement-plan.json");
const previewPath = path.join(root, "data/quality/ag12b-controlled-object-rich-layout-refinement-plan-preview.json");
const docPath = path.join(root, "docs/quality/AG12B_CONTROLLED_OBJECT_RICH_LAYOUT_REFINEMENT_PLAN.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG12B input ${name}: ${relativePath}`);
}

const ag12aReview = readJson(inputs.ag12aReview);
const ag12aAudit = readJson(inputs.ag12aAudit);
const ag12aDensity = readJson(inputs.ag12aDensity);
const ag12aReadiness = readJson(inputs.ag12aReadiness);
const ag12aBoundary = readJson(inputs.ag12aBoundary);
const ag11gApply = readJson(inputs.ag11gApply);

if (ag12aReview.status !== "object_rich_article_layout_audit_completed_refinement_recommended") {
  throw new Error("AG12B requires AG12A review.");
}
if (ag12aReadiness.ready_for_ag12b !== true) {
  throw new Error("AG12B requires AG12A readiness.");
}
if (ag12aBoundary.next_stage_id !== "AG12B" || ag12aBoundary.explicit_approval_required !== true) {
  throw new Error("AG12B requires AG12A to AG12B explicit boundary.");
}

const selectedArticlePath = ag11gApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHash !== ag11gApply.post_insertion_hash) {
  throw new Error("AG12B requires article hash to remain AG11G post-insertion hash.");
}

const stageControls = {
  controlled_object_rich_layout_refinement_plan_only: true,
  refinement_decision_planning_performed_in_ag12b: true,
  production_density_rules_created_in_ag12b: true,
  selected_article_treatment_planned_in_ag12b: true,
  ag12c_boundary_created_in_ag12b: true,
  selected_article_read_performed: true,

  article_mutation_performed_in_ag12b: false,
  selected_article_file_write_performed_in_ag12b: false,
  object_generation_performed_in_ag12b: false,
  object_insertion_performed_in_ag12b: false,
  image_generation_performed_in_ag12b: false,
  data_fetch_performed_in_ag12b: false,
  reference_url_change_performed_in_ag12b: false,
  homepage_mutation_performed_in_ag12b: false,
  css_file_mutation_performed_in_ag12b: false,
  js_file_mutation_performed_in_ag12b: false,
  production_jsonl_append_performed_in_ag12b: false,
  database_write_performed_in_ag12b: false,
  supabase_write_performed_in_ag12b: false,
  backend_auth_supabase_activation_performed_in_ag12b: false,
  public_publishing_operation_performed_in_ag12b: false
};

const productionDensityRules = {
  module_id: "AG12B",
  title: "Object Density Production Rule Record",
  status: "production_density_rules_created",
  rule_principle: "Objects should improve comprehension, trust, memory, cost efficiency and reusable intelligence; object count should not be maximised by default.",
  default_density_rules: [
    {
      article_band: "short_read",
      approximate_words: "400-650",
      recommended_visible_objects: "0-1",
      maximum_visible_objects: 1,
      note: "Use one high-value support object only if it improves the visitor view."
    },
    {
      article_band: "standard_feature",
      approximate_words: "650-1000",
      recommended_visible_objects: "1-2",
      maximum_visible_objects: 2,
      note: "Prefer one visual object and one reader-support object."
    },
    {
      article_band: "long_feature",
      approximate_words: "1000-1600",
      recommended_visible_objects: "2-3",
      maximum_visible_objects: 3,
      note: "Use objects from different families only when each has a clear role."
    },
    {
      article_band: "deep_dive_or_explainer",
      approximate_words: "1600+",
      recommended_visible_objects: "3-4",
      maximum_visible_objects: 4,
      note: "Allow higher density only when the article structure can carry it."
    },
    {
      article_band: "capability_demo_or_internal_pilot",
      approximate_words: "any",
      recommended_visible_objects: "controlled exception",
      maximum_visible_objects: 7,
      note: "All object families may appear only for governed capability demonstration, not normal public density."
    }
  ],
  object_priority_rules: [
    "Hero/support image may remain near the relevant article segment.",
    "Chart/table should appear only when data or structured reading is genuinely useful.",
    "Infographic/diagram should not duplicate each other unless the article is a deep explainer.",
    "Map/geographic object should be schematic unless verified geographic data is available.",
    "Composite reader-lens card is useful near the close of an object-rich article.",
    "Visible credit, caption, source note and accessibility text remain mandatory."
  ],
  ...stageControls
};

const refinementPlan = {
  module_id: "AG12B",
  title: "Controlled Object-Rich Layout Refinement Plan",
  status: "controlled_refinement_plan_created_no_article_mutation",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12b: articleHash,
  ag12a_density_band: ag12aDensity.object_density_band,
  current_visible_object_count: ag12aDensity.object_count,
  planning_decision: {
    selected_article_classification: "object_rich_capability_pilot_not_default_production_density",
    publication_decision: "not_publish_ready_until_refinement_apply_and_post_refinement_audit",
    controlled_refinement_required: true,
    preferred_ag12c_treatment: "controlled_layout_refinement_apply",
    reason: "The article contains all seven object families. This is useful for validating capability, but normal public articles should follow density rules."
  },
  selected_article_refinement_options: [
    {
      option_id: "AG12B-OPTION-A",
      title: "Keep as internal capability pilot",
      production_recommendation: "not_for_normal_public_publish",
      mutation_required: false,
      note: "Useful for internal QA and demonstrating all object families."
    },
    {
      option_id: "AG12B-OPTION-B",
      title: "Refine for public production density",
      production_recommendation: "recommended",
      mutation_required: true,
      proposed_visible_object_count: "3-4",
      note: "Keep strongest objects visible and defer excess objects from the public reading flow."
    },
    {
      option_id: "AG12B-OPTION-C",
      title: "Convert into long explainer/demo article",
      production_recommendation: "possible_later",
      mutation_required: true,
      note: "Would require rewriting/sectioning, not just layout refinement."
    }
  ],
  recommended_ag12c_apply_scope: {
    mutation_required: true,
    allowed_mutation_type: "selected_article_layout_refinement_only",
    no_new_object_generation: true,
    no_new_object_insertion: true,
    no_css_js_mutation: true,
    no_backend_or_publish: true,
    target_result: "article remains readable and production-density rules are enforced."
  },
  ...stageControls
};

const readiness = {
  module_id: "AG12B",
  title: "Refinement Decision Readiness Record",
  status: "ready_for_ag12c_controlled_layout_refinement_apply",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12b: articleHash,
  controlled_refinement_required: true,
  ready_for_ag12c: true,
  ag12c_explicit_approval_required: true,
  publish_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  reason_publish_blocked: "AG12B is planning only. A controlled AG12C apply and AG12D post-refinement audit are required before production readiness closure.",
  ...stageControls
};

const boundary = {
  module_id: "AG12B",
  title: "AG12B to AG12C Controlled Layout Refinement Apply Boundary",
  status: "ag12c_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12b: articleHash,
  next_stage_id: "AG12C",
  next_stage_title: "Controlled Layout Refinement Apply",
  explicit_approval_required: true,
  ag12c_allowed_scope: [
    "Create backup before mutation.",
    "Apply controlled selected-article layout refinement only.",
    "Reduce or reorganise visible object density according to AG12B plan.",
    "Do not generate new objects.",
    "Do not add new references.",
    "Record pre/post hash and rollback readiness."
  ],
  ag12c_blocked_scope: [
    "No object generation.",
    "No new object insertion.",
    "No external data fetch.",
    "No CSS/JS mutation unless separately approved.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG12B",
  title: "Controlled Object-Rich Layout Refinement Plan Schema",
  status: "schema_controlled_object_rich_layout_refinement_plan_only",
  refinement_plan_allowed_in_ag12b: true,
  production_density_rules_allowed_in_ag12b: true,
  refinement_decision_allowed_in_ag12b: true,
  ag12c_boundary_allowed_in_ag12b: true,

  article_mutation_allowed_in_ag12b: false,
  object_generation_allowed_in_ag12b: false,
  object_insertion_allowed_in_ag12b: false,
  css_js_mutation_allowed_in_ag12b: false,
  data_fetch_allowed_in_ag12b: false,
  reference_url_change_allowed_in_ag12b: false,
  production_jsonl_append_allowed_in_ag12b: false,
  database_write_allowed_in_ag12b: false,
  supabase_write_allowed_in_ag12b: false,
  backend_auth_supabase_activation_allowed_in_ag12b: false,
  public_publishing_operation_allowed_in_ag12b: false,
  ...stageControls
};

const review = {
  module_id: "AG12B",
  title: "Controlled Object-Rich Layout Refinement Plan",
  status: "controlled_refinement_plan_created_no_article_mutation",
  depends_on: ["AG12A"],
  generated_from: inputs,
  plan_file: "data/content-intelligence/mutation-plans/ag12b-controlled-object-rich-layout-refinement-plan.json",
  density_rule_file: "data/content-intelligence/object-registry/ag12b-object-density-production-rule-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag12b-refinement-decision-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag12b-to-ag12c-controlled-layout-refinement-apply-boundary.json",
  schema_file: "data/content-intelligence/schema/controlled-object-rich-layout-refinement-plan.schema.json",
  summary: {
    selected_article_path: selectedArticlePath,
    article_hash_at_ag12b: articleHash,
    current_visible_object_count: ag12aDensity.object_count,
    controlled_refinement_required: true,
    ready_for_ag12c: true,
    next_stage_id: "AG12C",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG12B",
  title: "Controlled Object-Rich Layout Refinement Plan Learning",
  status: "learning_record_only",
  learning_points: [
    "All-object pilot density should not become the normal production default.",
    "Production article density should be governed by article length, article type and object value.",
    "AG12C should perform controlled layout refinement only if explicitly approved.",
    "AG12B should not mutate article files.",
    "A central production-density rule registry can reduce future decision cost."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG12B",
  title: "Controlled Object-Rich Layout Refinement Plan",
  status: "controlled_refinement_plan_created_no_article_mutation",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag12b-controlled-object-rich-layout-refinement-plan.json",
    plan: "data/content-intelligence/mutation-plans/ag12b-controlled-object-rich-layout-refinement-plan.json",
    density_rules: "data/content-intelligence/object-registry/ag12b-object-density-production-rule-record.json",
    readiness: "data/content-intelligence/quality-registry/ag12b-refinement-decision-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag12b-to-ag12c-controlled-layout-refinement-apply-boundary.json",
    schema: "data/content-intelligence/schema/controlled-object-rich-layout-refinement-plan.schema.json",
    learning: "data/content-intelligence/learning/ag12b-controlled-object-rich-layout-refinement-plan-learning.json",
    preview: "data/quality/ag12b-controlled-object-rich-layout-refinement-plan-preview.json",
    document: "docs/quality/AG12B_CONTROLLED_OBJECT_RICH_LAYOUT_REFINEMENT_PLAN.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG12B",
  preview_only: true,
  status: "controlled_refinement_plan_created_no_article_mutation",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12b: articleHash,
  current_object_count: ag12aDensity.object_count,
  recommended_action: "Proceed to AG12C only if controlled article layout refinement is approved.",
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG12B — Controlled Object-Rich Layout Refinement Plan

## Purpose

AG12B creates a controlled refinement plan for the object-rich pilot article.

AG12B is planning only. It does not mutate articles, generate objects, insert objects, change CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Planning Decision

The selected article is classified as an object-rich capability pilot, not the default production density for ordinary public articles.

## Recommended Production Rule

Normal public articles should usually carry fewer visible objects:

- Short read: 0–1 object
- Standard feature: 1–2 objects
- Long feature: 2–3 objects
- Deep explainer: 3–4 objects
- Capability/demo article: controlled exception only

## Recommended Next Step

Proceed to AG12C only if controlled layout refinement apply is approved.

## Publishing Boundary

Publishing remains blocked. Backend, Auth, database and Supabase activation remain blocked.

## Next Stage

AG12C — Controlled Layout Refinement Apply — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(planPath, refinementPlan);
writeJson(densityRulePath, productionDensityRules);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG12B controlled object-rich layout refinement plan artifacts generated.");
console.log("✅ Production object-density rules created.");
console.log("✅ Selected article classified as object-rich capability pilot, not default production density.");
console.log("✅ Controlled refinement required before publish readiness.");
console.log("✅ Article hash remains unchanged at AG11G post-insertion state.");
console.log("✅ No article mutation, object generation, object insertion, CSS/JS mutation, backend activation or publishing performed.");
console.log("✅ AG12C controlled layout refinement apply boundary created with explicit approval required.");
