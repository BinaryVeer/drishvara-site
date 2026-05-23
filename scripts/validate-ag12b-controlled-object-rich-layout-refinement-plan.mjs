import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag12a-object-rich-article-layout-production-readiness-audit.json",
  "data/content-intelligence/audit-records/ag12a-object-rich-article-layout-production-readiness-audit-report.json",
  "data/content-intelligence/object-registry/ag12a-object-sequence-density-record.json",
  "data/content-intelligence/quality-registry/ag12a-layout-production-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag12a-to-ag12b-controlled-object-rich-layout-refinement-boundary.json",
  "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json",

  "data/content-intelligence/quality-reviews/ag12b-controlled-object-rich-layout-refinement-plan.json",
  "data/content-intelligence/mutation-plans/ag12b-controlled-object-rich-layout-refinement-plan.json",
  "data/content-intelligence/object-registry/ag12b-object-density-production-rule-record.json",
  "data/content-intelligence/quality-registry/ag12b-refinement-decision-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag12b-to-ag12c-controlled-layout-refinement-apply-boundary.json",
  "data/content-intelligence/schema/controlled-object-rich-layout-refinement-plan.schema.json",
  "data/content-intelligence/learning/ag12b-controlled-object-rich-layout-refinement-plan-learning.json",
  "data/quality/ag12b-controlled-object-rich-layout-refinement-plan.json",
  "data/quality/ag12b-controlled-object-rich-layout-refinement-plan-preview.json",
  "docs/quality/AG12B_CONTROLLED_OBJECT_RICH_LAYOUT_REFINEMENT_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG12B validation failed: ${message}`);
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

const ag12aReview = readJson("data/content-intelligence/quality-reviews/ag12a-object-rich-article-layout-production-readiness-audit.json");
const ag12aReadiness = readJson("data/content-intelligence/quality-registry/ag12a-layout-production-readiness-record.json");
const ag12aBoundary = readJson("data/content-intelligence/mutation-plans/ag12a-to-ag12b-controlled-object-rich-layout-refinement-boundary.json");
const ag12aDensity = readJson("data/content-intelligence/object-registry/ag12a-object-sequence-density-record.json");
const ag11gApply = readJson("data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag12b-controlled-object-rich-layout-refinement-plan.json");
const plan = readJson("data/content-intelligence/mutation-plans/ag12b-controlled-object-rich-layout-refinement-plan.json");
const densityRules = readJson("data/content-intelligence/object-registry/ag12b-object-density-production-rule-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag12b-refinement-decision-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag12b-to-ag12c-controlled-layout-refinement-apply-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-object-rich-layout-refinement-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag12b-controlled-object-rich-layout-refinement-plan-learning.json");
const registry = readJson("data/quality/ag12b-controlled-object-rich-layout-refinement-plan.json");
const preview = readJson("data/quality/ag12b-controlled-object-rich-layout-refinement-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG12B_CONTROLLED_OBJECT_RICH_LAYOUT_REFINEMENT_PLAN.md"), "utf8");

for (const obj of [review, plan, densityRules, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG12B") fail(`module_id must be AG12B in ${obj.title || "object"}`);
}

if (ag12aReview.status !== "object_rich_article_layout_audit_completed_refinement_recommended") fail("AG12A review status mismatch");
if (ag12aReadiness.ready_for_ag12b !== true) fail("AG12A readiness for AG12B missing");
if (ag12aBoundary.next_stage_id !== "AG12B") fail("AG12B boundary missing in AG12A");

const articlePath = ag11gApply.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (articleHash !== ag11gApply.post_insertion_hash) fail("Current article hash must remain AG11G post-insertion hash");

if (review.status !== "controlled_refinement_plan_created_no_article_mutation") fail("Review status mismatch");
if (plan.status !== "controlled_refinement_plan_created_no_article_mutation") fail("Plan status mismatch");
if (densityRules.status !== "production_density_rules_created") fail("Density rule status mismatch");
if (readiness.status !== "ready_for_ag12c_controlled_layout_refinement_apply") fail("Readiness status mismatch");

if (plan.current_visible_object_count !== ag12aDensity.object_count) fail("Plan object count must match AG12A density");
if (plan.planning_decision.controlled_refinement_required !== true) fail("Controlled refinement must be required");
if (plan.planning_decision.selected_article_classification !== "object_rich_capability_pilot_not_default_production_density") fail("Selected article classification mismatch");
if (!Array.isArray(plan.selected_article_refinement_options) || plan.selected_article_refinement_options.length !== 3) fail("Three refinement options must be recorded");

if (!Array.isArray(densityRules.default_density_rules) || densityRules.default_density_rules.length !== 5) fail("Five production density rules must be recorded");
if (!densityRules.default_density_rules.some((rule) => rule.article_band === "capability_demo_or_internal_pilot" && rule.maximum_visible_objects === 7)) {
  fail("Capability/demo exception rule must allow seven objects");
}

if (readiness.ready_for_ag12c !== true) fail("AG12C readiness missing");
if (readiness.controlled_refinement_required !== true) fail("Readiness must confirm controlled refinement required");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag12c_boundary_created_not_started") fail("AG12C boundary status mismatch");
if (boundary.next_stage_id !== "AG12C") fail("AG12C handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG12C explicit approval missing");

if (schema.status !== "schema_controlled_object_rich_layout_refinement_plan_only") fail("Schema status mismatch");

for (const key of [
  "refinement_plan_allowed_in_ag12b",
  "production_density_rules_allowed_in_ag12b",
  "refinement_decision_allowed_in_ag12b",
  "ag12c_boundary_allowed_in_ag12b"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag12b",
  "object_generation_allowed_in_ag12b",
  "object_insertion_allowed_in_ag12b",
  "css_js_mutation_allowed_in_ag12b",
  "data_fetch_allowed_in_ag12b",
  "reference_url_change_allowed_in_ag12b",
  "production_jsonl_append_allowed_in_ag12b",
  "database_write_allowed_in_ag12b",
  "supabase_write_allowed_in_ag12b",
  "backend_auth_supabase_activation_allowed_in_ag12b",
  "public_publishing_operation_allowed_in_ag12b"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, plan, densityRules, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_object_rich_layout_refinement_plan_only !== true) fail(`${obj.title || "object"} must be AG12B planning only`);
  if (obj.article_mutation_performed_in_ag12b !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.object_generation_performed_in_ag12b !== false) fail(`${obj.title || "object"} must not generate object`);
  if (obj.object_insertion_performed_in_ag12b !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.css_file_mutation_performed_in_ag12b !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag12b !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag12b !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag12b !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Planning Decision", "Recommended Production Rule", "Recommended Next Step", "Publishing Boundary", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG12B document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag12b", "validate:ag12b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag12b")) {
  fail("validate:project must include validate:ag12b");
}

pass("AG12B registry is present.");
pass("AG12B document is present.");
pass("AG12B review, refinement plan, production density rules, readiness, AG12C boundary, schema, learning and preview are present.");
pass("AG12A audit and AG11G article state are consumed.");
pass("Current article hash remains AG11G post-insertion hash.");
pass("Selected article is classified as object-rich capability pilot, not default production density.");
pass("Production object-density rules are created.");
pass("Controlled refinement is required before publish readiness.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No article mutation, object generation, object insertion, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG12C controlled layout refinement apply boundary is created with explicit approval required.");
pass("AG12B is Controlled Object-Rich Layout Refinement Plan only.");
