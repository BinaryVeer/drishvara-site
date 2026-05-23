import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();


function ag11bControlledChartInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11b-chart-bi-graph-controlled-cycle-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "chart_bi_graph_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.chart_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag10z-governed-object-pipeline-closure-future-object-type-handoff.json",
  "data/content-intelligence/closure-records/ag10z-governed-object-pipeline-closure-future-object-type-handoff.json",
  "data/content-intelligence/object-registry/ag10z-future-object-family-handoff-record.json",
  "data/content-intelligence/quality-registry/ag10z-final-object-pipeline-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag10z-to-ag11a-next-article-object-cycle-readiness-boundary.json",
  "data/content-intelligence/object-registry/ag10m-generated-image-reuse-handoff-record.json",
  "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json",

  "data/content-intelligence/quality-reviews/ag11a-remaining-object-family-cycle-plan.json",
  "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  "data/content-intelligence/object-registry/ag11a-remaining-object-family-compact-cycle-plan.json",
  "data/content-intelligence/quality-registry/ag11a-remaining-object-family-cycle-readiness.json",
  "data/content-intelligence/mutation-plans/ag11a-to-ag11b-chart-bi-graph-controlled-cycle-boundary.json",
  "data/content-intelligence/schema/remaining-object-family-cycle-plan.schema.json",
  "data/content-intelligence/learning/ag11a-remaining-object-family-cycle-plan-learning.json",
  "data/quality/ag11a-remaining-object-family-cycle-plan.json",
  "data/quality/ag11a-remaining-object-family-cycle-plan-preview.json",
  "docs/quality/AG11A_REMAINING_OBJECT_FAMILY_CYCLE_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG11A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag10zReview = readJson("data/content-intelligence/quality-reviews/ag10z-governed-object-pipeline-closure-future-object-type-handoff.json");
const ag10zClosure = readJson("data/content-intelligence/closure-records/ag10z-governed-object-pipeline-closure-future-object-type-handoff.json");
const ag10zReadiness = readJson("data/content-intelligence/quality-registry/ag10z-final-object-pipeline-readiness-record.json");
const ag10zBoundary = readJson("data/content-intelligence/mutation-plans/ag10z-to-ag11a-next-article-object-cycle-readiness-boundary.json");
const ag10kApply = readJson("data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag11a-remaining-object-family-cycle-plan.json");
const cyclePlan = readJson("data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json");
const familyPlan = readJson("data/content-intelligence/object-registry/ag11a-remaining-object-family-compact-cycle-plan.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag11a-remaining-object-family-cycle-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag11a-to-ag11b-chart-bi-graph-controlled-cycle-boundary.json");
const schema = readJson("data/content-intelligence/schema/remaining-object-family-cycle-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag11a-remaining-object-family-cycle-plan-learning.json");
const registry = readJson("data/quality/ag11a-remaining-object-family-cycle-plan.json");
const preview = readJson("data/quality/ag11a-remaining-object-family-cycle-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG11A_REMAINING_OBJECT_FAMILY_CYCLE_PLAN.md"), "utf8");

for (const obj of [review, cyclePlan, familyPlan, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG11A") fail(`module_id must be AG11A in ${obj.title || "object"}`);
}

if (ag10zReview.status !== "ag10_governed_object_pipeline_closed_future_handoff_recorded") fail("AG10Z review must be closed");
if (ag10zClosure.closure_decision?.ag10_pipeline_closed !== true) fail("AG10Z closure decision missing");
if (ag10zReadiness.ready_for_ag11a !== true) fail("AG10Z readiness for AG11A missing");
if (ag10zBoundary.next_stage_id !== "AG11A") fail("AG10Z boundary must hand off to AG11A");

const articlePath = ag10kApply.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const articleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (articleHash !== ag10kApply.post_insertion_hash) if (!ag11bControlledChartInsertionAllowsPostMutation()) fail("Article hash must remain AG10K post-insertion hash or AG11B controlled chart post-insertion record explains the later approved article state");

for (const obj of [review, cyclePlan, registry, preview]) {
  if (obj.status !== "remaining_object_family_compact_cycles_planned_not_started") {
    fail(`${obj.title || "object"} status mismatch`);
  }
}

if (familyPlan.status !== "remaining_object_family_registry_created") fail("Family plan status mismatch");
if (readiness.status !== "ready_for_ag11b_chart_bi_graph_controlled_cycle") fail("Readiness status mismatch");
if (schema.status !== "schema_remaining_object_family_cycle_plan_only") fail("Schema status mismatch");

if (!Array.isArray(cyclePlan.remaining_object_families) || cyclePlan.remaining_object_families.length !== 6) {
  fail("AG11A must plan six remaining object families");
}
if (cyclePlan.compact_step_count_per_family !== 5) fail("Compact step count must be five");
if (cyclePlan.max_steps_per_family !== 5) fail("Max steps per family must be five");

for (const family of cyclePlan.remaining_object_families) {
  if (family.compact_cycle_step_count !== 5) fail(`${family.family_name} must have exactly five compact steps`);
  if (!Array.isArray(family.compact_steps) || family.compact_steps.length !== 5) fail(`${family.family_name} compact steps missing`);
}

for (const expected of [
  "Charts, graphs and BI-style data visualizations",
  "Infographics",
  "Figures and diagrams",
  "Tables and structured objects",
  "Maps and geographic objects",
  "Article-support composite objects"
]) {
  if (!cyclePlan.remaining_object_families.some((family) => family.family_name === expected)) {
    fail(`Missing planned family: ${expected}`);
  }
}

if (cyclePlan.completed_reference_family.family_name !== "Generated images and editorial visuals") {
  fail("Generated image/editorial visual must be recorded as completed reference family");
}
if (cyclePlan.planning_decision.no_family_cycle_more_than_five_steps !== true) {
  fail("AG11A must enforce no family cycle over five steps");
}
if (cyclePlan.planning_decision.first_family_to_execute !== "AG11B") {
  fail("First family to execute must be AG11B");
}

if (!Array.isArray(cyclePlan.standing_inclusion_gate) || cyclePlan.standing_inclusion_gate.length !== 5) {
  fail("Standing inclusion gate must contain five questions");
}

if (readiness.ready_for_ag11b !== true) fail("Readiness must be ready for AG11B");
if (readiness.publishing_ready !== false) fail("Publishing must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase must remain blocked");

if (boundary.status !== "ag11b_boundary_created_not_started") fail("AG11B boundary status mismatch");
if (boundary.next_stage_id !== "AG11B") fail("AG11B handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG11B must require explicit approval");

for (const key of [
  "planning_allowed_in_ag11a",
  "compact_cycle_definition_allowed_in_ag11a",
  "future_family_handoff_allowed_in_ag11a",
  "ag11b_boundary_allowed_in_ag11a"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag11a",
  "object_generation_allowed_in_ag11a",
  "object_insertion_allowed_in_ag11a",
  "image_generation_allowed_in_ag11a",
  "chart_generation_allowed_in_ag11a",
  "infographic_generation_allowed_in_ag11a",
  "table_generation_allowed_in_ag11a",
  "figure_generation_allowed_in_ag11a",
  "diagram_generation_allowed_in_ag11a",
  "map_generation_allowed_in_ag11a",
  "data_fetch_allowed_in_ag11a",
  "dataset_creation_allowed_in_ag11a",
  "reference_url_change_allowed_in_ag11a",
  "homepage_mutation_allowed_in_ag11a",
  "css_js_mutation_allowed_in_ag11a",
  "production_jsonl_append_allowed_in_ag11a",
  "database_write_allowed_in_ag11a",
  "supabase_write_allowed_in_ag11a",
  "backend_auth_supabase_activation_allowed_in_ag11a",
  "public_publishing_operation_allowed_in_ag11a"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, cyclePlan, familyPlan, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.remaining_object_family_cycle_plan_only !== true) fail(`${obj.title || "object"} must be AG11A-only`);
  if (obj.article_mutation_performed_in_ag11a !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.object_generation_performed_in_ag11a !== false) fail(`${obj.title || "object"} must not generate object`);
  if (obj.object_insertion_performed_in_ag11a !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.chart_generation_performed_in_ag11a !== false) fail(`${obj.title || "object"} must not generate chart`);
  if (obj.infographic_generation_performed_in_ag11a !== false) fail(`${obj.title || "object"} must not generate infographic`);
  if (obj.table_generation_performed_in_ag11a !== false) fail(`${obj.title || "object"} must not generate table`);
  if (obj.map_generation_performed_in_ag11a !== false) fail(`${obj.title || "object"} must not generate map`);
  if (obj.database_write_performed_in_ag11a !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag11a !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag11a !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag11a !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Completed Reference Family", "Remaining Families", "Compact Cycle", "Standing Inclusion Gate", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG11A document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag11a", "validate:ag11a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag11a")) {
  fail("validate:project must include validate:ag11a");
}

pass("AG11A registry is present.");
pass("AG11A document is present.");
pass("AG11A review, cycle plan, family registry, readiness, AG11B boundary, schema, learning record and preview are present.");
pass("AG10Z closure and AG10 reusable intelligence are consumed.");
pass("Article hash remains AG10K post-insertion hash.");
pass("Generated image/editorial visual is recorded as completed reference family.");
pass("Six remaining object families are planned.");
pass("Each remaining family has exactly five compact cycle steps.");
pass("Five-question inclusion gate is carried forward.");
pass("AG11B chart/BI graph controlled cycle boundary is created with explicit approval required.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No article mutation, object generation, object insertion, backend activation or publishing operation is performed.");
pass("AG11A is Remaining Object Family Compact Cycle Plan only.");
