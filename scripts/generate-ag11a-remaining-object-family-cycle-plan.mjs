import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag10zReview: "data/content-intelligence/quality-reviews/ag10z-governed-object-pipeline-closure-future-object-type-handoff.json",
  ag10zClosure: "data/content-intelligence/closure-records/ag10z-governed-object-pipeline-closure-future-object-type-handoff.json",
  ag10zFutureHandoff: "data/content-intelligence/object-registry/ag10z-future-object-family-handoff-record.json",
  ag10zReadiness: "data/content-intelligence/quality-registry/ag10z-final-object-pipeline-readiness-record.json",
  ag10zBoundary: "data/content-intelligence/mutation-plans/ag10z-to-ag11a-next-article-object-cycle-readiness-boundary.json",
  ag10mReuse: "data/content-intelligence/object-registry/ag10m-generated-image-reuse-handoff-record.json",
  ag10kApply: "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag11a-remaining-object-family-cycle-plan.json");
const cyclePlanPath = path.join(root, "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json");
const familyPlanPath = path.join(root, "data/content-intelligence/object-registry/ag11a-remaining-object-family-compact-cycle-plan.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag11a-remaining-object-family-cycle-readiness.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag11a-to-ag11b-chart-bi-graph-controlled-cycle-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/remaining-object-family-cycle-plan.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag11a-remaining-object-family-cycle-plan-learning.json");
const registryPath = path.join(root, "data/quality/ag11a-remaining-object-family-cycle-plan.json");
const previewPath = path.join(root, "data/quality/ag11a-remaining-object-family-cycle-plan-preview.json");
const docPath = path.join(root, "docs/quality/AG11A_REMAINING_OBJECT_FAMILY_CYCLE_PLAN.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG11A input ${name}: ${relativePath}`);
}

const ag10zReview = readJson(inputs.ag10zReview);
const ag10zClosure = readJson(inputs.ag10zClosure);
const ag10zFutureHandoff = readJson(inputs.ag10zFutureHandoff);
const ag10zReadiness = readJson(inputs.ag10zReadiness);
const ag10zBoundary = readJson(inputs.ag10zBoundary);
const ag10mReuse = readJson(inputs.ag10mReuse);
const ag10kApply = readJson(inputs.ag10kApply);

if (ag10zReview.status !== "ag10_governed_object_pipeline_closed_future_handoff_recorded") {
  throw new Error("AG11A requires AG10Z review closure.");
}
if (ag10zClosure.closure_decision?.ag10_pipeline_closed !== true) {
  throw new Error("AG11A requires AG10Z pipeline closure.");
}
if (ag10zReadiness.ready_for_ag11a !== true) {
  throw new Error("AG11A requires AG10Z readiness for AG11A.");
}
if (ag10zBoundary.next_stage_id !== "AG11A" || ag10zBoundary.explicit_approval_required !== true) {
  throw new Error("AG11A requires AG10Z to AG11A explicit boundary.");
}

const selectedArticlePath = ag10kApply.selected_article_path;
const assetPath = ag10kApply.asset_path;
const backupPath = ag10kApply.backup_path;

if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);
if (!exists(assetPath)) throw new Error(`Asset missing: ${assetPath}`);
if (!exists(backupPath)) throw new Error(`Backup missing: ${backupPath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
const assetHash = sha256(fs.readFileSync(path.join(root, assetPath), "utf8"));
const backupHash = sha256(fs.readFileSync(path.join(root, backupPath), "utf8"));

if (articleHash !== ag10kApply.post_insertion_hash) {
  throw new Error("AG11A article hash must remain AG10K post-insertion hash.");
}

const stageControls = {
  remaining_object_family_cycle_plan_only: true,
  selected_article_read_performed: true,
  asset_read_performed: true,
  backup_read_performed: true,

  article_mutation_performed_in_ag11a: false,
  selected_article_file_write_performed_in_ag11a: false,
  object_generation_performed_in_ag11a: false,
  object_insertion_performed_in_ag11a: false,
  image_generation_performed_in_ag11a: false,
  chart_generation_performed_in_ag11a: false,
  infographic_generation_performed_in_ag11a: false,
  figure_generation_performed_in_ag11a: false,
  diagram_generation_performed_in_ag11a: false,
  table_generation_performed_in_ag11a: false,
  map_generation_performed_in_ag11a: false,
  data_fetch_performed_in_ag11a: false,
  dataset_creation_performed_in_ag11a: false,
  reference_insertion_performed_in_ag11a: false,
  reference_url_change_performed_in_ag11a: false,
  homepage_mutation_performed_in_ag11a: false,
  css_file_mutation_performed_in_ag11a: false,
  js_file_mutation_performed_in_ag11a: false,
  production_jsonl_append_performed_in_ag11a: false,
  database_write_performed_in_ag11a: false,
  supabase_write_performed_in_ag11a: false,
  backend_auth_supabase_activation_performed_in_ag11a: false,
  public_publishing_operation_performed_in_ag11a: false
};

const compactSteps = [
  {
    step_no: 1,
    step_id: "candidate_source_data_finalisation",
    title: "Candidate + Source/Data Finalisation",
    purpose: "Select the object candidate, placement section, source/data basis, inclusion-gate result, caption/credit approach and mobile-placement logic."
  },
  {
    step_no: 2,
    step_id: "controlled_object_creation",
    title: "Controlled Object Creation",
    purpose: "Create one controlled object only, with source, rights, credit, hash and reuse record."
  },
  {
    step_no: 3,
    step_id: "controlled_article_insertion_apply",
    title: "Controlled Article Insertion Apply",
    purpose: "Insert only the approved object into the selected article after backup, with marker, caption, alt/accessibility text and credit."
  },
  {
    step_no: 4,
    step_id: "post_insertion_audit",
    title: "Post-Insertion Audit",
    purpose: "Audit marker count, object hash/content, caption, credit, article shape, mobile safety, rollback readiness and forbidden mutations."
  },
  {
    step_no: 5,
    step_id: "closure_reuse_handoff",
    title: "Closure + Reuse Handoff",
    purpose: "Close the object-family cycle and record reusable template, source logic, design pattern and future reuse conditions."
  }
];

const remainingObjectFamilies = [
  {
    cycle_id: "AG11B",
    family_id: "CHART_BI_GRAPH",
    family_name: "Charts, graphs and BI-style data visualizations",
    source_doctrine_stage: "AG10C",
    next_stage_title: "Chart / BI Graph Controlled Cycle",
    compact_cycle_step_count: compactSteps.length,
    compact_steps: compactSteps,
    priority: 1,
    reason: "Charts/graphs improve trust where articles use quantitative claims, but require source/data validation first.",
    first_cycle_candidate_rule: "Use only a simple chart backed by article-valid or separately recorded data. Avoid decorative charts."
  },
  {
    cycle_id: "AG11C",
    family_id: "INFOGRAPHIC",
    family_name: "Infographics",
    source_doctrine_stage: "AG10D",
    next_stage_title: "Infographic Controlled Cycle",
    compact_cycle_step_count: compactSteps.length,
    compact_steps: compactSteps,
    priority: 2,
    reason: "Infographics improve visitor comprehension where a concept has multiple steps or dimensions.",
    first_cycle_candidate_rule: "Use one compact, text-light infographic with mobile-safe structure."
  },
  {
    cycle_id: "AG11D",
    family_id: "FIGURE_DIAGRAM",
    family_name: "Figures and diagrams",
    source_doctrine_stage: "AG10E",
    next_stage_title: "Figure / Diagram Controlled Cycle",
    compact_cycle_step_count: compactSteps.length,
    compact_steps: compactSteps,
    priority: 3,
    reason: "Figures/diagrams explain systems, workflows and relationships without requiring numeric datasets.",
    first_cycle_candidate_rule: "Prefer one process or relationship diagram with clear nodes and accessibility labels."
  },
  {
    cycle_id: "AG11E",
    family_id: "TABLE_STRUCTURED_OBJECT",
    family_name: "Tables and structured objects",
    source_doctrine_stage: "AG10F",
    next_stage_title: "Table / Structured Object Controlled Cycle",
    compact_cycle_step_count: compactSteps.length,
    compact_steps: compactSteps,
    priority: 4,
    reason: "Tables add precision when comparison or structured summary is more useful than prose.",
    first_cycle_candidate_rule: "Use one compact table with mobile overflow control and no invented data."
  },
  {
    cycle_id: "AG11F",
    family_id: "MAP_GEOGRAPHIC_OBJECT",
    family_name: "Maps and geographic objects",
    source_doctrine_stage: "AG10G",
    next_stage_title: "Map / Geographic Object Controlled Cycle",
    compact_cycle_step_count: compactSteps.length,
    compact_steps: compactSteps,
    priority: 5,
    reason: "Maps are useful only when geographic context is materially relevant and source/licence clarity exists.",
    first_cycle_candidate_rule: "Use a non-misleading schematic or source-backed map only after location/source validation."
  },
  {
    cycle_id: "AG11G",
    family_id: "ARTICLE_SUPPORT_COMPOSITE",
    family_name: "Article-support composite objects",
    source_doctrine_stage: "AG10A-AG10B",
    next_stage_title: "Article-Support Composite Object Controlled Cycle",
    compact_cycle_step_count: compactSteps.length,
    compact_steps: compactSteps,
    priority: 6,
    reason: "Composite objects combine small structured blocks, icons, quote cards or summary cards where they improve readability.",
    first_cycle_candidate_rule: "Use only if it improves article shape without crowding the reading column."
  }
];

const completedReferenceFamily = {
  family_id: "GENERATED_IMAGE_EDITORIAL_VISUAL",
  family_name: "Generated images and editorial visuals",
  completed_reference_cycle: "AG10H-AG10M",
  completed_asset_path: assetPath,
  completed_asset_hash: assetHash,
  reuse_handoff_record: inputs.ag10mReuse,
  status: "completed_reference_family_for_future_reuse"
};

const standingInclusionGate = [
  "Will this improve what a visitor sees?",
  "Will this make articles more trustworthy?",
  "Will this make Drishvara memorable?",
  "Will this reduce future cost?",
  "Will this create reusable intelligence?"
];

const cyclePlan = {
  module_id: "AG11A",
  title: "Remaining Object Family Compact Cycle Plan",
  status: "remaining_object_family_compact_cycles_planned_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag11a: articleHash,
  asset_path_reference: assetPath,
  remaining_object_family_count: remainingObjectFamilies.length,
  compact_step_count_per_family: compactSteps.length,
  max_steps_per_family: 5,
  planning_decision: {
    complete_all_remaining_families: true,
    execute_one_family_at_a_time: true,
    no_family_cycle_more_than_five_steps: true,
    do_not_repeat_ag10_long_chain_for_each_family: true,
    first_family_to_execute: "AG11B",
    first_family_name: "Charts, graphs and BI-style data visualizations"
  },
  remaining_object_families: remainingObjectFamilies,
  completed_reference_family: completedReferenceFamily,
  standing_inclusion_gate: standingInclusionGate,
  ...stageControls
};

const familyPlan = {
  module_id: "AG11A",
  title: "Remaining Object Family Compact Cycle Plan Registry",
  status: "remaining_object_family_registry_created",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag11a: articleHash,
  remaining_object_families: remainingObjectFamilies,
  completed_reference_family: completedReferenceFamily,
  family_execution_order: remainingObjectFamilies.map((family) => ({
    cycle_id: family.cycle_id,
    family_id: family.family_id,
    family_name: family.family_name,
    priority: family.priority
  })),
  reuse_first_rule: "Before any new object creation, check AG10M/AG10Z reusable intelligence and existing approved internal assets.",
  source_first_rule: "Charts, maps and tables require source/data finalisation before creation.",
  article_shape_rule: "Every object must preserve justified reading flow, mobile width and existing article readability.",
  ...stageControls
};

const readiness = {
  module_id: "AG11A",
  title: "Remaining Object Family Cycle Readiness",
  status: "ready_for_ag11b_chart_bi_graph_controlled_cycle",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag11a: articleHash,
  remaining_object_family_count: remainingObjectFamilies.length,
  compact_step_count_per_family: compactSteps.length,
  ag10z_consumed: true,
  ag10_reusable_intelligence_available: true,
  ready_for_ag11b: true,
  publishing_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  explicit_ag11b_approval_required: true,
  ...stageControls
};

const boundary = {
  module_id: "AG11A",
  title: "AG11A to AG11B Chart / BI Graph Controlled Cycle Boundary",
  status: "ag11b_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag11a: articleHash,
  next_stage_id: "AG11B",
  next_stage_title: "Chart / BI Graph Controlled Cycle",
  explicit_approval_required: true,
  ag11b_allowed_scope: [
    "Run compact chart/BI graph cycle only.",
    "Perform candidate + source/data finalisation.",
    "Create one controlled chart object only after source/data validation.",
    "Insert only approved chart object after backup.",
    "Audit insertion and close chart cycle with reuse handoff."
  ],
  ag11b_blocked_scope: [
    "No uncontrolled chart generation.",
    "No data invention.",
    "No article mutation before controlled apply sub-step.",
    "No CSS/JS mutation unless separately approved.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG11A",
  title: "Remaining Object Family Cycle Plan Schema",
  status: "schema_remaining_object_family_cycle_plan_only",
  planning_allowed_in_ag11a: true,
  compact_cycle_definition_allowed_in_ag11a: true,
  future_family_handoff_allowed_in_ag11a: true,
  ag11b_boundary_allowed_in_ag11a: true,

  article_mutation_allowed_in_ag11a: false,
  object_generation_allowed_in_ag11a: false,
  object_insertion_allowed_in_ag11a: false,
  image_generation_allowed_in_ag11a: false,
  chart_generation_allowed_in_ag11a: false,
  infographic_generation_allowed_in_ag11a: false,
  table_generation_allowed_in_ag11a: false,
  figure_generation_allowed_in_ag11a: false,
  diagram_generation_allowed_in_ag11a: false,
  map_generation_allowed_in_ag11a: false,
  data_fetch_allowed_in_ag11a: false,
  dataset_creation_allowed_in_ag11a: false,
  reference_url_change_allowed_in_ag11a: false,
  homepage_mutation_allowed_in_ag11a: false,
  css_js_mutation_allowed_in_ag11a: false,
  production_jsonl_append_allowed_in_ag11a: false,
  database_write_allowed_in_ag11a: false,
  supabase_write_allowed_in_ag11a: false,
  backend_auth_supabase_activation_allowed_in_ag11a: false,
  public_publishing_operation_allowed_in_ag11a: false,
  ...stageControls
};

const review = {
  module_id: "AG11A",
  title: "Remaining Object Family Compact Cycle Plan",
  status: "remaining_object_family_compact_cycles_planned_not_started",
  depends_on: ["AG10Z", "AG10M", "AG10K"],
  generated_from: inputs,
  cycle_plan_file: "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  family_plan_file: "data/content-intelligence/object-registry/ag11a-remaining-object-family-compact-cycle-plan.json",
  readiness_file: "data/content-intelligence/quality-registry/ag11a-remaining-object-family-cycle-readiness.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag11a-to-ag11b-chart-bi-graph-controlled-cycle-boundary.json",
  schema_file: "data/content-intelligence/schema/remaining-object-family-cycle-plan.schema.json",
  learning_file: "data/content-intelligence/learning/ag11a-remaining-object-family-cycle-plan-learning.json",
  summary: {
    selected_article_path: selectedArticlePath,
    article_hash_at_ag11a: articleHash,
    remaining_object_family_count: remainingObjectFamilies.length,
    compact_step_count_per_family: compactSteps.length,
    next_stage_id: "AG11B",
    next_stage_title: "Chart / BI Graph Controlled Cycle",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG11A",
  title: "Remaining Object Family Cycle Plan Learning",
  status: "learning_record_only",
  learning_points: [
    "AG10 completed the doctrine for all object families but fully inserted only one generated/editorial SVG asset.",
    "Remaining families can now use compact 5-step cycles instead of repeating the long AG10 governance chain.",
    "Creation, insertion and audit should remain separate even in compact cycles.",
    "Charts, maps and tables must be source/data-first to avoid false precision.",
    "AG10M/AG10Z reusable intelligence should be checked before new object creation."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG11A",
  title: "Remaining Object Family Compact Cycle Plan",
  status: "remaining_object_family_compact_cycles_planned_not_started",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag11a-remaining-object-family-cycle-plan.json",
    cycle_plan: "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
    family_plan: "data/content-intelligence/object-registry/ag11a-remaining-object-family-compact-cycle-plan.json",
    readiness: "data/content-intelligence/quality-registry/ag11a-remaining-object-family-cycle-readiness.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag11a-to-ag11b-chart-bi-graph-controlled-cycle-boundary.json",
    schema: "data/content-intelligence/schema/remaining-object-family-cycle-plan.schema.json",
    learning: "data/content-intelligence/learning/ag11a-remaining-object-family-cycle-plan-learning.json",
    preview: "data/quality/ag11a-remaining-object-family-cycle-plan-preview.json",
    document: "docs/quality/AG11A_REMAINING_OBJECT_FAMILY_CYCLE_PLAN.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG11A",
  preview_only: true,
  status: "remaining_object_family_compact_cycles_planned_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag11a: articleHash,
  remaining_object_families: remainingObjectFamilies.map((family) => family.family_name),
  compact_step_count_per_family: compactSteps.length,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG11A — Remaining Object Family Compact Cycle Plan

## Purpose

AG11A plans compact completion cycles for the remaining object families after AG10 closed the master governed object-pipeline framework.

AG11A is planning only. It does not generate objects, insert objects, mutate articles, activate backend/Supabase or publish.

## Completed Reference Family

Generated image/editorial visual has already completed the full governed cycle through AG10H–AG10M.

- Completed asset: \`${assetPath}\`
- Asset hash: \`${assetHash}\`

## Remaining Families

AG11A plans compact five-step cycles for:

1. Charts, graphs and BI-style data visualizations
2. Infographics
3. Figures and diagrams
4. Tables and structured objects
5. Maps and geographic objects
6. Article-support composite objects

## Compact Cycle

Each remaining family will use five controls:

1. Candidate + Source/Data Finalisation
2. Controlled Object Creation
3. Controlled Article Insertion Apply
4. Post-Insertion Audit
5. Closure + Reuse Handoff

## Standing Inclusion Gate

Each family must again answer:

1. Will this improve what a visitor sees?
2. Will this make articles more trustworthy?
3. Will this make Drishvara memorable?
4. Will this reduce future cost?
5. Will this create reusable intelligence?

## Next Stage

AG11B — Chart / BI Graph Controlled Cycle — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(cyclePlanPath, cyclePlan);
writeJson(familyPlanPath, familyPlan);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG11A remaining object family compact cycle plan artifacts generated.");
console.log(`✅ Remaining object families planned: ${remainingObjectFamilies.length}`);
console.log(`✅ Compact steps per family: ${compactSteps.length}`);
console.log("✅ Generated image/editorial visual recorded as completed reference family.");
console.log("✅ AG11B chart/BI graph controlled cycle boundary created with explicit approval required.");
console.log("✅ No object generation, object insertion, article mutation, backend/Supabase activation or publishing performed.");
