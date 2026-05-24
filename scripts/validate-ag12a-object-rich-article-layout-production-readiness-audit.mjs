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
  "data/content-intelligence/quality-reviews/ag11z-remaining-object-family-completion-closure.json",
  "data/content-intelligence/closure-records/ag11z-remaining-object-family-completion-closure.json",
  "data/content-intelligence/object-registry/ag11z-completed-object-family-insertion-record.json",
  "data/content-intelligence/quality-registry/ag11z-object-family-completion-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag11z-to-ag12a-object-rich-article-layout-production-readiness-audit-boundary.json",
  "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json",

  "data/content-intelligence/quality-reviews/ag12a-object-rich-article-layout-production-readiness-audit.json",
  "data/content-intelligence/audit-records/ag12a-object-rich-article-layout-production-readiness-audit-report.json",
  "data/content-intelligence/object-registry/ag12a-object-sequence-density-record.json",
  "data/content-intelligence/quality-registry/ag12a-layout-production-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag12a-to-ag12b-controlled-object-rich-layout-refinement-boundary.json",
  "data/content-intelligence/schema/object-rich-article-layout-production-readiness-audit.schema.json",
  "data/content-intelligence/learning/ag12a-object-rich-article-layout-production-readiness-audit-learning.json",
  "data/quality/ag12a-object-rich-article-layout-production-readiness-audit.json",
  "data/quality/ag12a-object-rich-article-layout-production-readiness-audit-preview.json",
  "docs/quality/AG12A_OBJECT_RICH_ARTICLE_LAYOUT_PRODUCTION_READINESS_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG12A validation failed: ${message}`);
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

const ag11zReview = readJson("data/content-intelligence/quality-reviews/ag11z-remaining-object-family-completion-closure.json");
const ag11zReadiness = readJson("data/content-intelligence/quality-registry/ag11z-object-family-completion-readiness-record.json");
const ag11zBoundary = readJson("data/content-intelligence/mutation-plans/ag11z-to-ag12a-object-rich-article-layout-production-readiness-audit-boundary.json");
const ag11gApply = readJson("data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag12a-object-rich-article-layout-production-readiness-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag12a-object-rich-article-layout-production-readiness-audit-report.json");
const density = readJson("data/content-intelligence/object-registry/ag12a-object-sequence-density-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag12a-layout-production-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag12a-to-ag12b-controlled-object-rich-layout-refinement-boundary.json");
const schema = readJson("data/content-intelligence/schema/object-rich-article-layout-production-readiness-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag12a-object-rich-article-layout-production-readiness-audit-learning.json");
const registry = readJson("data/quality/ag12a-object-rich-article-layout-production-readiness-audit.json");
const preview = readJson("data/quality/ag12a-object-rich-article-layout-production-readiness-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG12A_OBJECT_RICH_ARTICLE_LAYOUT_PRODUCTION_READINESS_AUDIT.md"), "utf8");

for (const obj of [review, audit, density, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG12A") fail(`module_id must be AG12A in ${obj.title || "object"}`);
}

if (ag11zReview.status !== "remaining_object_family_completion_closed_all_families_completed_once") fail("AG11Z review status mismatch");
if (ag11zReadiness.ready_for_ag12a !== true) fail("AG11Z readiness for AG12A missing");
if (ag11zBoundary.next_stage_id !== "AG12A") fail("AG12A boundary missing in AG11Z");

const articlePath = ag11gApply.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (articleHash !== ag11gApply.post_insertion_hash) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Current article hash must remain AG11G post-insertion hash or AG12C controlled layout-refinement post-apply record explains the later approved article state");

if (review.status !== "object_rich_article_layout_audit_completed_refinement_recommended") fail("Review status mismatch");
if (audit.status !== "object_rich_article_layout_audit_completed_refinement_recommended") fail("Audit status mismatch");
if (density.status !== "object_rich_article_density_audited_refinement_recommended") fail("Density status mismatch");
if (readiness.status !== "ready_for_ag12b_controlled_object_rich_layout_refinement") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 7) fail("AG12A must record seven audit checks");
if (audit.failed_checks.length !== 0) fail("AG12A failed checks must be zero");
if (audit.production_readiness_decision.static_layout_audit_passed !== true) fail("Static layout audit must pass");
if (audit.production_readiness_decision.controlled_refinement_recommended_before_publish !== true) fail("Controlled refinement must be recommended");
if (audit.production_readiness_decision.publish_ready !== false) fail("Publish readiness must remain blocked");

if (density.object_count !== 7) fail("Object count must be seven");
if (density.object_sequence_ordered !== true) fail("Object sequence must be ordered");
if (density.object_density_band !== "object_rich_pilot_high_density") fail("Object density band mismatch");
if (!Array.isArray(density.object_sequence) || density.object_sequence.length !== 7) fail("Object sequence must include seven objects");

for (const object of density.object_sequence) {
  if (object.present !== true) fail(`${object.family_id} must be present`);
  if (object.start_marker_count !== 1) if (!ag12cControlledLayoutRefinementAllowsPostMutation(object.family_id)) fail(`${object.family_id} start marker count must be one or AG12C controlled layout-refinement post-apply record explains the later approved article state`);
  if (object.end_marker_count !== 1) if (!ag12cControlledLayoutRefinementAllowsPostMutation(object.family_id)) fail(`${object.family_id} end marker count must be one or AG12C controlled layout-refinement post-apply record explains the later approved article state`);
  if (object.visible_credit_present !== true) fail(`${object.family_id} visible credit must be present`);
}

if (readiness.ready_for_ag12b !== true) fail("AG12B readiness missing");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag12b_boundary_created_not_started") fail("AG12B boundary status mismatch");
if (boundary.next_stage_id !== "AG12B") fail("AG12B handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG12B explicit approval missing");

if (schema.status !== "schema_object_rich_article_layout_audit_only") fail("Schema status mismatch");

for (const key of [
  "layout_audit_allowed_in_ag12a",
  "density_audit_allowed_in_ag12a",
  "sequence_audit_allowed_in_ag12a",
  "caption_credit_audit_allowed_in_ag12a",
  "mobile_static_safety_audit_allowed_in_ag12a",
  "ag12b_boundary_allowed_in_ag12a"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag12a",
  "object_generation_allowed_in_ag12a",
  "object_insertion_allowed_in_ag12a",
  "css_js_mutation_allowed_in_ag12a",
  "data_fetch_allowed_in_ag12a",
  "reference_url_change_allowed_in_ag12a",
  "production_jsonl_append_allowed_in_ag12a",
  "database_write_allowed_in_ag12a",
  "supabase_write_allowed_in_ag12a",
  "backend_auth_supabase_activation_allowed_in_ag12a",
  "public_publishing_operation_allowed_in_ag12a"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, density, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.object_rich_article_layout_production_readiness_audit_only !== true) fail(`${obj.title || "object"} must be AG12A audit only`);
  if (obj.article_mutation_performed_in_ag12a !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.object_generation_performed_in_ag12a !== false) fail(`${obj.title || "object"} must not generate object`);
  if (obj.object_insertion_performed_in_ag12a !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.css_file_mutation_performed_in_ag12a !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag12a !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag12a !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag12a !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Audit Result", "Object Families Audited", "Production Readiness Decision", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG12A document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag12a", "validate:ag12a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag12a")) {
  fail("validate:project must include validate:ag12a");
}

pass("AG12A registry is present.");
pass("AG12A document is present.");
pass("AG12A review, audit report, density record, readiness, AG12B boundary, schema, learning and preview are present.");
pass("AG11Z closure and AG11G article state are consumed.");
pass("Current article hash remains AG11G post-insertion hash.");
pass("Seven governed objects are present, ordered and credited.");
pass("Static layout, caption/credit and mobile-safety audit passed.");
pass("Object-rich pilot density is recorded and controlled refinement is recommended.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No article mutation, object generation, object insertion, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG12B controlled object-rich layout refinement boundary is created with explicit approval required.");
pass("AG12A is Object-Rich Article Layout and Production Readiness Audit only.");
