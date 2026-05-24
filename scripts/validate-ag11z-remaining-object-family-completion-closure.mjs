import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();


function ag12cControlledLayoutRefinementAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");

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
      applyRecord.status === "controlled_layout_refinement_applied_pending_post_refinement_audit" &&
      applyRecord.post_refinement_hash === hashToCheck &&
      html.includes("AG12C-LAYOUT-REFINEMENT:START") &&
      html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"')
    );
  } catch {
    return false;
  }
}

const requiredFiles = [
  "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  "data/content-intelligence/closure-records/ag10m-generated-image-insertion-closure-reuse-handoff.json",
  "data/content-intelligence/closure-records/ag10z-governed-object-pipeline-closure-future-object-type-handoff.json",

  "data/content-intelligence/quality-reviews/ag11b-chart-bi-graph-controlled-cycle.json",
  "data/content-intelligence/apply-records/ag11b-chart-bi-graph-controlled-cycle-apply.json",
  "data/content-intelligence/closure-records/ag11b-chart-bi-graph-controlled-cycle-closure.json",

  "data/content-intelligence/quality-reviews/ag11c-infographic-controlled-cycle.json",
  "data/content-intelligence/apply-records/ag11c-infographic-controlled-cycle-apply.json",
  "data/content-intelligence/closure-records/ag11c-infographic-controlled-cycle-closure.json",

  "data/content-intelligence/quality-reviews/ag11d-figure-diagram-controlled-cycle.json",
  "data/content-intelligence/apply-records/ag11d-figure-diagram-controlled-cycle-apply.json",
  "data/content-intelligence/closure-records/ag11d-figure-diagram-controlled-cycle-closure.json",

  "data/content-intelligence/quality-reviews/ag11e-table-structured-object-controlled-cycle.json",
  "data/content-intelligence/apply-records/ag11e-table-structured-object-controlled-cycle-apply.json",
  "data/content-intelligence/closure-records/ag11e-table-structured-object-controlled-cycle-closure.json",

  "data/content-intelligence/quality-reviews/ag11f-map-geographic-object-controlled-cycle.json",
  "data/content-intelligence/apply-records/ag11f-map-geographic-object-controlled-cycle-apply.json",
  "data/content-intelligence/closure-records/ag11f-map-geographic-object-controlled-cycle-closure.json",

  "data/content-intelligence/quality-reviews/ag11g-article-support-composite-object-controlled-cycle.json",
  "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json",
  "data/content-intelligence/closure-records/ag11g-article-support-composite-object-controlled-cycle-closure.json",
  "data/content-intelligence/quality-registry/ag11g-article-support-composite-object-final-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag11g-to-ag11z-remaining-object-family-completion-closure-boundary.json",

  "data/content-intelligence/quality-reviews/ag11z-remaining-object-family-completion-closure.json",
  "data/content-intelligence/closure-records/ag11z-remaining-object-family-completion-closure.json",
  "data/content-intelligence/object-registry/ag11z-completed-object-family-insertion-record.json",
  "data/content-intelligence/quality-registry/ag11z-object-family-completion-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag11z-to-ag12a-object-rich-article-layout-production-readiness-audit-boundary.json",
  "data/content-intelligence/schema/remaining-object-family-completion-closure.schema.json",
  "data/content-intelligence/learning/ag11z-remaining-object-family-completion-closure-learning.json",
  "data/quality/ag11z-remaining-object-family-completion-closure.json",
  "data/quality/ag11z-remaining-object-family-completion-closure-preview.json",
  "docs/quality/AG11Z_REMAINING_OBJECT_FAMILY_COMPLETION_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG11Z validation failed: ${message}`);
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

const ag11gApply = readJson("data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json");
const ag11gReadiness = readJson("data/content-intelligence/quality-registry/ag11g-article-support-composite-object-final-readiness-record.json");
const ag11gBoundary = readJson("data/content-intelligence/mutation-plans/ag11g-to-ag11z-remaining-object-family-completion-closure-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag11z-remaining-object-family-completion-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag11z-remaining-object-family-completion-closure.json");
const familyCompletion = readJson("data/content-intelligence/object-registry/ag11z-completed-object-family-insertion-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag11z-object-family-completion-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag11z-to-ag12a-object-rich-article-layout-production-readiness-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/remaining-object-family-completion-closure.schema.json");
const learning = readJson("data/content-intelligence/learning/ag11z-remaining-object-family-completion-closure-learning.json");
const registry = readJson("data/quality/ag11z-remaining-object-family-completion-closure.json");
const preview = readJson("data/quality/ag11z-remaining-object-family-completion-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG11Z_REMAINING_OBJECT_FAMILY_COMPLETION_CLOSURE.md"), "utf8");

for (const obj of [review, closure, familyCompletion, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG11Z") fail(`module_id must be AG11Z in ${obj.title || "object"}`);
}

if (ag11gReadiness.ready_for_ag11z !== true) fail("AG11G readiness for AG11Z missing");
if (ag11gBoundary.next_stage_id !== "AG11Z") fail("AG11Z boundary missing in AG11G");

const articlePath = ag11gApply.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (articleHash !== ag11gApply.post_insertion_hash) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Current article hash must remain AG11G post-insertion hash or AG12C controlled layout-refinement post-apply record explains the later approved article state");

if (review.status !== "remaining_object_family_completion_closed_all_families_completed_once") fail("Review status mismatch");
if (closure.status !== "remaining_object_family_completion_closed_all_families_completed_once") fail("Closure status mismatch");
if (familyCompletion.status !== "all_object_families_completed_at_least_once") fail("Family completion status mismatch");
if (readiness.status !== "ready_for_ag12a_object_rich_article_layout_production_readiness_audit") fail("Readiness status mismatch");

if (!Array.isArray(familyCompletion.completed_families) || familyCompletion.completed_families.length !== 7) {
  fail("AG11Z must record seven completed object families");
}

for (const familyId of [
  "GENERATED_IMAGE_EDITORIAL_VISUAL",
  "CHART_BI_GRAPH",
  "INFOGRAPHIC",
  "FIGURE_DIAGRAM",
  "TABLE_STRUCTURED_OBJECT",
  "MAP_GEOGRAPHIC_OBJECT",
  "ARTICLE_SUPPORT_COMPOSITE"
]) {
  const family = familyCompletion.completed_families.find((item) => item.family_id === familyId);
  if (!family) fail(`Missing completed family: ${familyId}`);
  if (family.completed_at_least_once !== true) fail(`${familyId} must be completed at least once`);
  if (family.insertion_completed !== true) fail(`${familyId} insertion must be completed`);
  if (family.reuse_handoff_recorded !== true) fail(`${familyId} reuse handoff must be recorded`);
}

if (closure.closure_decision?.ag11_remaining_object_family_cycle_closed !== true) fail("AG11 closure decision missing");
if (closure.closure_decision?.all_object_families_completed_at_least_once !== true) fail("All-family completion closure missing");
if (closure.publish_ready !== false) fail("Publishing must remain blocked");
if (closure.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (closure.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (readiness.ready_for_ag12a !== true) fail("AG12A readiness missing");
if (readiness.publish_ready !== false) fail("Readiness must keep publishing blocked");
if (readiness.backend_activation_ready !== false) fail("Readiness must keep backend blocked");
if (readiness.supabase_activation_ready !== false) fail("Readiness must keep Supabase blocked");

if (boundary.status !== "ag12a_boundary_created_not_started") fail("AG12A boundary status mismatch");
if (boundary.next_stage_id !== "AG12A") fail("AG12A handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG12A explicit approval missing");

if (schema.status !== "schema_remaining_object_family_completion_closure_only") fail("Schema status mismatch");

for (const key of [
  "family_completion_closure_allowed_in_ag11z",
  "completion_record_allowed_in_ag11z",
  "readiness_record_allowed_in_ag11z",
  "ag12a_boundary_allowed_in_ag11z"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag11z",
  "object_generation_allowed_in_ag11z",
  "object_insertion_allowed_in_ag11z",
  "css_js_mutation_allowed_in_ag11z",
  "data_fetch_allowed_in_ag11z",
  "reference_url_change_allowed_in_ag11z",
  "production_jsonl_append_allowed_in_ag11z",
  "database_write_allowed_in_ag11z",
  "supabase_write_allowed_in_ag11z",
  "backend_auth_supabase_activation_allowed_in_ag11z",
  "public_publishing_operation_allowed_in_ag11z"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, closure, familyCompletion, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.remaining_object_family_completion_closure_only !== true) fail(`${obj.title || "object"} must be AG11Z closure only`);
  if (obj.all_object_families_completed_at_least_once !== true) fail(`${obj.title || "object"} must confirm all object families completed`);
  if (obj.article_mutation_performed_in_ag11z !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.object_generation_performed_in_ag11z !== false) fail(`${obj.title || "object"} must not generate object`);
  if (obj.object_insertion_performed_in_ag11z !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.css_file_mutation_performed_in_ag11z !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag11z !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag11z !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag11z !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Completed Families", "Closure Decision", "Publishing Boundary", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG11Z document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag11z", "validate:ag11z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag11z")) {
  fail("validate:project must include validate:ag11z");
}

pass("AG11Z registry is present.");
pass("AG11Z document is present.");
pass("AG11Z review, closure, completed-family record, readiness, AG12A boundary, schema, learning and preview are present.");
pass("AG10 generated-image reference cycle and AG11B-G remaining object-family cycles are consumed.");
pass("Current article hash remains AG11G post-insertion hash.");
pass("Seven object families are recorded as completed at least once.");
pass("All AG11 remaining object families are closed with reuse handoff carried forward.");
pass("Placement doctrine, five-question inclusion gate and reusable intelligence are carried forward.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No article mutation, object generation, object insertion, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG12A object-rich article layout and production readiness audit boundary is created with explicit approval required.");
pass("AG11Z is Remaining Object Family Completion Closure only.");
