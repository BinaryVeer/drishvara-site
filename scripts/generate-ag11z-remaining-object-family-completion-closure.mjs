import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag11aPlan: "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",

  ag10mClosure: "data/content-intelligence/closure-records/ag10m-generated-image-insertion-closure-reuse-handoff.json",
  ag10zClosure: "data/content-intelligence/closure-records/ag10z-governed-object-pipeline-closure-future-object-type-handoff.json",

  ag11bReview: "data/content-intelligence/quality-reviews/ag11b-chart-bi-graph-controlled-cycle.json",
  ag11bApply: "data/content-intelligence/apply-records/ag11b-chart-bi-graph-controlled-cycle-apply.json",
  ag11bClosure: "data/content-intelligence/closure-records/ag11b-chart-bi-graph-controlled-cycle-closure.json",

  ag11cReview: "data/content-intelligence/quality-reviews/ag11c-infographic-controlled-cycle.json",
  ag11cApply: "data/content-intelligence/apply-records/ag11c-infographic-controlled-cycle-apply.json",
  ag11cClosure: "data/content-intelligence/closure-records/ag11c-infographic-controlled-cycle-closure.json",

  ag11dReview: "data/content-intelligence/quality-reviews/ag11d-figure-diagram-controlled-cycle.json",
  ag11dApply: "data/content-intelligence/apply-records/ag11d-figure-diagram-controlled-cycle-apply.json",
  ag11dClosure: "data/content-intelligence/closure-records/ag11d-figure-diagram-controlled-cycle-closure.json",

  ag11eReview: "data/content-intelligence/quality-reviews/ag11e-table-structured-object-controlled-cycle.json",
  ag11eApply: "data/content-intelligence/apply-records/ag11e-table-structured-object-controlled-cycle-apply.json",
  ag11eClosure: "data/content-intelligence/closure-records/ag11e-table-structured-object-controlled-cycle-closure.json",

  ag11fReview: "data/content-intelligence/quality-reviews/ag11f-map-geographic-object-controlled-cycle.json",
  ag11fApply: "data/content-intelligence/apply-records/ag11f-map-geographic-object-controlled-cycle-apply.json",
  ag11fClosure: "data/content-intelligence/closure-records/ag11f-map-geographic-object-controlled-cycle-closure.json",

  ag11gReview: "data/content-intelligence/quality-reviews/ag11g-article-support-composite-object-controlled-cycle.json",
  ag11gApply: "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json",
  ag11gClosure: "data/content-intelligence/closure-records/ag11g-article-support-composite-object-controlled-cycle-closure.json",
  ag11gReadiness: "data/content-intelligence/quality-registry/ag11g-article-support-composite-object-final-readiness-record.json",
  ag11gBoundary: "data/content-intelligence/mutation-plans/ag11g-to-ag11z-remaining-object-family-completion-closure-boundary.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag11z-remaining-object-family-completion-closure.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag11z-remaining-object-family-completion-closure.json");
const familyCompletionPath = path.join(root, "data/content-intelligence/object-registry/ag11z-completed-object-family-insertion-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag11z-object-family-completion-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag11z-to-ag12a-object-rich-article-layout-production-readiness-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/remaining-object-family-completion-closure.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag11z-remaining-object-family-completion-closure-learning.json");
const registryPath = path.join(root, "data/quality/ag11z-remaining-object-family-completion-closure.json");
const previewPath = path.join(root, "data/quality/ag11z-remaining-object-family-completion-closure-preview.json");
const docPath = path.join(root, "docs/quality/AG11Z_REMAINING_OBJECT_FAMILY_COMPLETION_CLOSURE.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG11Z input ${name}: ${relativePath}`);
}

const ag11aPlan = readJson(inputs.ag11aPlan);
const ag10mClosure = readJson(inputs.ag10mClosure);
const ag10zClosure = readJson(inputs.ag10zClosure);

const ag11bReview = readJson(inputs.ag11bReview);
const ag11bApply = readJson(inputs.ag11bApply);
const ag11bClosure = readJson(inputs.ag11bClosure);

const ag11cReview = readJson(inputs.ag11cReview);
const ag11cApply = readJson(inputs.ag11cApply);
const ag11cClosure = readJson(inputs.ag11cClosure);

const ag11dReview = readJson(inputs.ag11dReview);
const ag11dApply = readJson(inputs.ag11dApply);
const ag11dClosure = readJson(inputs.ag11dClosure);

const ag11eReview = readJson(inputs.ag11eReview);
const ag11eApply = readJson(inputs.ag11eApply);
const ag11eClosure = readJson(inputs.ag11eClosure);

const ag11fReview = readJson(inputs.ag11fReview);
const ag11fApply = readJson(inputs.ag11fApply);
const ag11fClosure = readJson(inputs.ag11fClosure);

const ag11gReview = readJson(inputs.ag11gReview);
const ag11gApply = readJson(inputs.ag11gApply);
const ag11gClosure = readJson(inputs.ag11gClosure);
const ag11gReadiness = readJson(inputs.ag11gReadiness);
const ag11gBoundary = readJson(inputs.ag11gBoundary);

if (ag11gReview.status !== "article_support_composite_object_controlled_cycle_closed_reuse_handoff_recorded") {
  throw new Error("AG11Z requires AG11G closure review.");
}
if (ag11gReadiness.ready_for_ag11z !== true) {
  throw new Error("AG11Z requires AG11G readiness.");
}
if (ag11gBoundary.next_stage_id !== "AG11Z" || ag11gBoundary.explicit_approval_required !== true) {
  throw new Error("AG11Z requires AG11G to AG11Z explicit boundary.");
}

const selectedArticlePath = ag11gApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag11gApply.post_insertion_hash) {
  throw new Error("AG11Z requires article hash to remain AG11G post-insertion hash.");
}

const completedFamilies = [
  {
    family_id: "GENERATED_IMAGE_EDITORIAL_VISUAL",
    completed_stage: "AG10H-AG10M",
    closure_status: ag10mClosure.status,
    source_closure_file: inputs.ag10mClosure,
    completed_at_least_once: true,
    insertion_completed: true,
    reuse_handoff_recorded: true
  },
  {
    family_id: "CHART_BI_GRAPH",
    completed_stage: "AG11B",
    review_status: ag11bReview.status,
    apply_status: ag11bApply.status,
    closure_status: ag11bClosure.status,
    source_apply_file: inputs.ag11bApply,
    completed_at_least_once: true,
    insertion_completed: true,
    reuse_handoff_recorded: true
  },
  {
    family_id: "INFOGRAPHIC",
    completed_stage: "AG11C",
    review_status: ag11cReview.status,
    apply_status: ag11cApply.status,
    closure_status: ag11cClosure.status,
    source_apply_file: inputs.ag11cApply,
    completed_at_least_once: true,
    insertion_completed: true,
    reuse_handoff_recorded: true
  },
  {
    family_id: "FIGURE_DIAGRAM",
    completed_stage: "AG11D",
    review_status: ag11dReview.status,
    apply_status: ag11dApply.status,
    closure_status: ag11dClosure.status,
    source_apply_file: inputs.ag11dApply,
    completed_at_least_once: true,
    insertion_completed: true,
    reuse_handoff_recorded: true
  },
  {
    family_id: "TABLE_STRUCTURED_OBJECT",
    completed_stage: "AG11E",
    review_status: ag11eReview.status,
    apply_status: ag11eApply.status,
    closure_status: ag11eClosure.status,
    source_apply_file: inputs.ag11eApply,
    completed_at_least_once: true,
    insertion_completed: true,
    reuse_handoff_recorded: true
  },
  {
    family_id: "MAP_GEOGRAPHIC_OBJECT",
    completed_stage: "AG11F",
    review_status: ag11fReview.status,
    apply_status: ag11fApply.status,
    closure_status: ag11fClosure.status,
    source_apply_file: inputs.ag11fApply,
    completed_at_least_once: true,
    insertion_completed: true,
    reuse_handoff_recorded: true
  },
  {
    family_id: "ARTICLE_SUPPORT_COMPOSITE",
    completed_stage: "AG11G",
    review_status: ag11gReview.status,
    apply_status: ag11gApply.status,
    closure_status: ag11gClosure.status,
    source_apply_file: inputs.ag11gApply,
    completed_at_least_once: true,
    insertion_completed: true,
    reuse_handoff_recorded: true
  }
];

const expectedStatuses = {
  CHART_BI_GRAPH: "chart_bi_graph_inserted_audited_closed",
  INFOGRAPHIC: "infographic_inserted_audited_closed",
  FIGURE_DIAGRAM: "figure_diagram_inserted_audited_closed",
  TABLE_STRUCTURED_OBJECT: "table_structured_object_inserted_audited_closed",
  MAP_GEOGRAPHIC_OBJECT: "map_geographic_object_inserted_audited_closed",
  ARTICLE_SUPPORT_COMPOSITE: "article_support_composite_object_inserted_audited_closed"
};

for (const family of completedFamilies) {
  if (family.family_id !== "GENERATED_IMAGE_EDITORIAL_VISUAL") {
    if (family.apply_status !== expectedStatuses[family.family_id]) {
      throw new Error(`${family.family_id} apply status is not closed/audited.`);
    }
  }
}

const stageControls = {
  remaining_object_family_completion_closure_only: true,
  object_family_completion_audit_performed_in_ag11z: true,
  all_remaining_ag11_families_completed: true,
  all_object_families_completed_at_least_once: true,
  selected_article_read_performed: true,

  article_mutation_performed_in_ag11z: false,
  selected_article_file_write_performed_in_ag11z: false,
  object_generation_performed_in_ag11z: false,
  object_insertion_performed_in_ag11z: false,
  image_generation_performed_in_ag11z: false,
  chart_generation_performed_in_ag11z: false,
  infographic_generation_performed_in_ag11z: false,
  figure_diagram_generation_performed_in_ag11z: false,
  table_generation_performed_in_ag11z: false,
  map_generation_performed_in_ag11z: false,
  composite_object_generation_performed_in_ag11z: false,
  data_fetch_performed_in_ag11z: false,
  reference_url_change_performed_in_ag11z: false,
  homepage_mutation_performed_in_ag11z: false,
  css_file_mutation_performed_in_ag11z: false,
  js_file_mutation_performed_in_ag11z: false,
  production_jsonl_append_performed_in_ag11z: false,
  database_write_performed_in_ag11z: false,
  supabase_write_performed_in_ag11z: false,
  backend_auth_supabase_activation_performed_in_ag11z: false,
  public_publishing_operation_performed_in_ag11z: false
};

const familyCompletionRecord = {
  module_id: "AG11Z",
  title: "Completed Object Family Insertion Record",
  status: "all_object_families_completed_at_least_once",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag11z: articleHash,
  total_completed_object_families: completedFamilies.length,
  completed_families: completedFamilies,
  ag11_remaining_families_completed: [
    "CHART_BI_GRAPH",
    "INFOGRAPHIC",
    "FIGURE_DIAGRAM",
    "TABLE_STRUCTURED_OBJECT",
    "MAP_GEOGRAPHIC_OBJECT",
    "ARTICLE_SUPPORT_COMPOSITE"
  ],
  ag10_reference_family_completed: "GENERATED_IMAGE_EDITORIAL_VISUAL",
  placement_doctrine_carried_forward: true,
  reuse_intelligence_carried_forward: true,
  five_question_inclusion_gate_carried_forward: true,
  ...stageControls
};

const closure = {
  module_id: "AG11Z",
  title: "Remaining Object Family Completion Closure",
  status: "remaining_object_family_completion_closed_all_families_completed_once",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag11z: articleHash,
  closure_decision: {
    ag11_remaining_object_family_cycle_closed: true,
    all_ag11_remaining_families_completed: true,
    all_object_families_completed_at_least_once: true,
    generated_image_reference_family_from_ag10_counted: true,
    no_further_object_family_pilot_required_before_layout_audit: true
  },
  completed_family_record_file: "data/content-intelligence/object-registry/ag11z-completed-object-family-insertion-record.json",
  next_recommended_stage: "AG12A",
  next_recommended_stage_title: "Object-Rich Article Layout and Production Readiness Audit",
  publish_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  ...stageControls
};

const readiness = {
  module_id: "AG11Z",
  title: "Object Family Completion Readiness Record",
  status: "ready_for_ag12a_object_rich_article_layout_production_readiness_audit",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag11z: articleHash,
  all_object_families_completed_at_least_once: true,
  ready_for_ag12a: true,
  ag12a_explicit_approval_required: true,
  publish_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  reason_publish_blocked: "Object-family insertion is complete, but object-rich article layout, density, mobile readability and production readiness audit must be completed before any publish decision.",
  ...stageControls
};

const boundary = {
  module_id: "AG11Z",
  title: "AG11Z to AG12A Object-Rich Article Layout and Production Readiness Audit Boundary",
  status: "ag12a_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag11z: articleHash,
  next_stage_id: "AG12A",
  next_stage_title: "Object-Rich Article Layout and Production Readiness Audit",
  explicit_approval_required: true,
  ag12a_allowed_scope: [
    "Audit object-rich article layout after multiple object insertions.",
    "Review reading density, object sequence, mobile behavior, object captions, visible credits and article shape.",
    "Record whether any layout refinement is needed.",
    "Prepare controlled refinement boundary only if required."
  ],
  ag12a_blocked_scope: [
    "No article mutation in AG12A unless a separate controlled apply stage is approved later.",
    "No object generation.",
    "No object insertion.",
    "No CSS/JS mutation unless separately approved.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG11Z",
  title: "Remaining Object Family Completion Closure Schema",
  status: "schema_remaining_object_family_completion_closure_only",
  family_completion_closure_allowed_in_ag11z: true,
  completion_record_allowed_in_ag11z: true,
  readiness_record_allowed_in_ag11z: true,
  ag12a_boundary_allowed_in_ag11z: true,

  article_mutation_allowed_in_ag11z: false,
  object_generation_allowed_in_ag11z: false,
  object_insertion_allowed_in_ag11z: false,
  css_js_mutation_allowed_in_ag11z: false,
  data_fetch_allowed_in_ag11z: false,
  reference_url_change_allowed_in_ag11z: false,
  production_jsonl_append_allowed_in_ag11z: false,
  database_write_allowed_in_ag11z: false,
  supabase_write_allowed_in_ag11z: false,
  backend_auth_supabase_activation_allowed_in_ag11z: false,
  public_publishing_operation_allowed_in_ag11z: false,
  ...stageControls
};

const review = {
  module_id: "AG11Z",
  title: "Remaining Object Family Completion Closure",
  status: "remaining_object_family_completion_closed_all_families_completed_once",
  depends_on: ["AG10M", "AG10Z", "AG11A", "AG11B", "AG11C", "AG11D", "AG11E", "AG11F", "AG11G"],
  generated_from: inputs,
  closure_file: "data/content-intelligence/closure-records/ag11z-remaining-object-family-completion-closure.json",
  family_completion_file: "data/content-intelligence/object-registry/ag11z-completed-object-family-insertion-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag11z-object-family-completion-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag11z-to-ag12a-object-rich-article-layout-production-readiness-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/remaining-object-family-completion-closure.schema.json",
  summary: {
    selected_article_path: selectedArticlePath,
    article_hash_at_ag11z: articleHash,
    completed_object_family_count: completedFamilies.length,
    ag11_remaining_family_count: 6,
    all_object_families_completed_at_least_once: true,
    next_stage_id: "AG12A",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG11Z",
  title: "Remaining Object Family Completion Closure Learning",
  status: "learning_record_only",
  learning_points: [
    "AG10 created the governed object-pipeline doctrine and completed the generated-image/editorial visual reference cycle.",
    "AG11 compact cycles completed charts, infographics, figures/diagrams, tables, maps and article-support composite objects.",
    "Placement tuning is now mandatory for every object family.",
    "Latest article-state compatibility should be replaced later with a more central latest-approved-article-state registry to reduce validator patch size.",
    "Before publishing, object-rich article layout and mobile readability should be audited as a separate AG12A stage."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG11Z",
  title: "Remaining Object Family Completion Closure",
  status: "remaining_object_family_completion_closed_all_families_completed_once",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag11z-remaining-object-family-completion-closure.json",
    closure: "data/content-intelligence/closure-records/ag11z-remaining-object-family-completion-closure.json",
    family_completion: "data/content-intelligence/object-registry/ag11z-completed-object-family-insertion-record.json",
    readiness: "data/content-intelligence/quality-registry/ag11z-object-family-completion-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag11z-to-ag12a-object-rich-article-layout-production-readiness-audit-boundary.json",
    schema: "data/content-intelligence/schema/remaining-object-family-completion-closure.schema.json",
    learning: "data/content-intelligence/learning/ag11z-remaining-object-family-completion-closure-learning.json",
    preview: "data/quality/ag11z-remaining-object-family-completion-closure-preview.json",
    document: "docs/quality/AG11Z_REMAINING_OBJECT_FAMILY_COMPLETION_CLOSURE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG11Z",
  preview_only: true,
  status: "remaining_object_family_completion_closed_all_families_completed_once",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag11z: articleHash,
  completed_families: completedFamilies.map((family) => ({
    family_id: family.family_id,
    completed_stage: family.completed_stage,
    completed_at_least_once: family.completed_at_least_once
  })),
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG11Z — Remaining Object Family Completion Closure

## Purpose

AG11Z closes the remaining object-family completion cycle.

AG11Z is closure only. It does not mutate articles, generate objects, insert objects, change CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Completed Families

The following object families have completed at least one governed insertion cycle:

1. Generated image / editorial visual — AG10H–AG10M
2. Chart / BI graph — AG11B
3. Infographic — AG11C
4. Figure / diagram — AG11D
5. Table / structured object — AG11E
6. Map / geographic object — AG11F
7. Article-support composite object — AG11G

## Closure Decision

All object families are now completed at least once. Placement tuning, source/credit handling, accessibility records, rollback readiness and reuse handoff have been carried forward.

## Publishing Boundary

Publishing remains blocked. Backend, Auth, database and Supabase activation remain blocked.

## Next Stage

AG12A — Object-Rich Article Layout and Production Readiness Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(closurePath, closure);
writeJson(familyCompletionPath, familyCompletionRecord);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG11Z remaining object family completion closure artifacts generated.");
console.log(`✅ Completed object families recorded: ${completedFamilies.length}`);
console.log("✅ All remaining AG11 object families completed at least once.");
console.log("✅ Generated image/editorial visual AG10 reference family carried forward.");
console.log("✅ Publishing, backend and Supabase activation remain blocked.");
console.log("✅ No article mutation, object generation, object insertion, CSS/JS mutation, backend activation or publishing performed.");
console.log("✅ AG12A object-rich article layout and production readiness audit boundary created with explicit approval required.");
