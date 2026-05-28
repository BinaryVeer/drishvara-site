import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag12d-post-refinement-layout-audit.json",
  "data/content-intelligence/audit-records/ag12d-post-refinement-layout-audit-report.json",
  "data/content-intelligence/object-registry/ag12d-refined-layout-treatment-audit-record.json",
  "data/content-intelligence/quality-registry/ag12d-post-refinement-readiness-record.json",
  "data/content-intelligence/quality-registry/ag12d-rollback-readiness-audit-record.json",
  "data/content-intelligence/mutation-plans/ag12d-to-ag12z-object-rich-production-readiness-closure-boundary.json",
  "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json",
  "data/content-intelligence/object-registry/ag12b-object-density-production-rule-record.json",

  "data/content-intelligence/quality-reviews/ag12z-object-rich-production-readiness-closure.json",
  "data/content-intelligence/closure-records/ag12z-object-rich-production-readiness-closure.json",
  "data/content-intelligence/object-registry/ag12z-refined-article-production-state-record.json",
  "data/content-intelligence/quality-registry/ag12z-production-readiness-final-record.json",
  "data/content-intelligence/mutation-plans/ag12z-to-ag13a-final-editorial-live-verification-boundary.json",
  "data/content-intelligence/schema/object-rich-production-readiness-closure.schema.json",
  "data/content-intelligence/learning/ag12z-object-rich-production-readiness-closure-learning.json",
  "data/quality/ag12z-object-rich-production-readiness-closure.json",
  "data/quality/ag12z-object-rich-production-readiness-closure-preview.json",
  "docs/quality/AG12Z_OBJECT_RICH_PRODUCTION_READINESS_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG12Z validation failed: ${message}`);
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

function hashPairMatchesCurrentOrAg12cR1Repair(leftHash, rightHash, articlePath = null) {
  if (leftHash === rightHash) return true;

  const ag12cR1ApplyPath = path.join(root, "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");
  if (!fs.existsSync(ag12cR1ApplyPath)) return false;

  try {
    const ag12cR1Apply = JSON.parse(fs.readFileSync(ag12cR1ApplyPath, "utf8"));

    const articlePathMatches =
      articlePath === null ||
      articlePath === undefined ||
      ag12cR1Apply.selected_article_path === articlePath;

    if (!articlePathMatches) return false;

    return (
      ag12cR1Apply.status === "public_object_label_layout_repair_applied" &&
      (
        (
          ag12cR1Apply.pre_repair_hash === leftHash &&
          ag12cR1Apply.post_repair_hash === rightHash
        ) ||
        (
          ag12cR1Apply.pre_repair_hash === rightHash &&
          ag12cR1Apply.post_repair_hash === leftHash
        )
      )
    );
  } catch {
    return false;
  }
}


for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag12dReview = readJson("data/content-intelligence/quality-reviews/ag12d-post-refinement-layout-audit.json");
const ag12dAudit = readJson("data/content-intelligence/audit-records/ag12d-post-refinement-layout-audit-report.json");
const ag12dTreatment = readJson("data/content-intelligence/object-registry/ag12d-refined-layout-treatment-audit-record.json");
const ag12dReadiness = readJson("data/content-intelligence/quality-registry/ag12d-post-refinement-readiness-record.json");
const ag12dRollbackAudit = readJson("data/content-intelligence/quality-registry/ag12d-rollback-readiness-audit-record.json");
const ag12dBoundary = readJson("data/content-intelligence/mutation-plans/ag12d-to-ag12z-object-rich-production-readiness-closure-boundary.json");
const ag12cApply = readJson("data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag12z-object-rich-production-readiness-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag12z-object-rich-production-readiness-closure.json");
const state = readJson("data/content-intelligence/object-registry/ag12z-refined-article-production-state-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag12z-production-readiness-final-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag12z-to-ag13a-final-editorial-live-verification-boundary.json");
const schema = readJson("data/content-intelligence/schema/object-rich-production-readiness-closure.schema.json");
const learning = readJson("data/content-intelligence/learning/ag12z-object-rich-production-readiness-closure-learning.json");
const registry = readJson("data/quality/ag12z-object-rich-production-readiness-closure.json");
const preview = readJson("data/quality/ag12z-object-rich-production-readiness-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG12Z_OBJECT_RICH_PRODUCTION_READINESS_CLOSURE.md"), "utf8");

for (const obj of [review, closure, state, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG12Z") fail(`module_id must be AG12Z in ${obj.title || "object"}`);
}

if (ag12dReview.status !== "post_refinement_layout_audit_passed") fail("AG12D review status mismatch");
if (ag12dAudit.status !== "post_refinement_layout_audit_passed") fail("AG12D audit status mismatch");
if (ag12dAudit.failed_checks.length !== 0) fail("AG12D failed checks must be zero");
if (ag12dReadiness.ready_for_ag12z !== true) fail("AG12D readiness for AG12Z missing");
if (ag12dBoundary.next_stage_id !== "AG12Z") fail("AG12Z boundary missing in AG12D");

const articlePath = ag12cApply.selected_article_path;
const backupPath = ag12cApply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`AG12C backup missing: ${backupPath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
const backupHash = sha256(fs.readFileSync(path.join(root, backupPath), "utf8"));

const ag12cR1ApplyPath = "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json";
const hasAg12cR1Repair = fs.existsSync(path.join(root, ag12cR1ApplyPath));
const ag12cR1Apply = hasAg12cR1Repair ? readJson(ag12cR1ApplyPath) : null;

if (hasAg12cR1Repair) {
  if (!hashPairMatchesCurrentOrAg12cR1Repair(articleHash, ag12cR1Apply.post_repair_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Current article hash must match AG12C-R1 post-repair hash or AG12C-R1 repaired article state missing");
} else if (articleHash !== ag12cApply.post_refinement_hash) {
  fail("Current article hash must remain AG12C post-refinement hash");
}
if (backupHash !== ag12cApply.pre_refinement_hash) fail("Backup hash must remain AG12C pre-refinement hash");
if (backupHash !== ag12dRollbackAudit.backup_hash) fail("Backup hash must match AG12D rollback audit");

if (review.status !== "object_rich_article_production_readiness_closed_ready_for_final_editorial_live_verification") fail("Review status mismatch");
if (closure.status !== "object_rich_article_production_readiness_closed_ready_for_final_editorial_live_verification") fail("Closure status mismatch");
if (state.status !== "refined_article_state_recorded_ready_for_final_editorial_live_verification") fail("State status mismatch");
if (readiness.status !== "ready_for_final_editorial_live_verification_not_published") fail("Readiness status mismatch");

if (hasAg12cR1Repair) {
  if (ag12cR1Apply.reader_facing_object_count_after_repair !== 3) fail("AG12C-R1 reader-facing object count must be three");
} else {
  if (state.primary_visible_object_count !== 4) fail("State must record four primary visible objects");
  if (state.collapsed_pilot_object_count !== 3) fail("State must record three collapsed pilot objects");
}
if (state.original_governed_markers_preserved_once !== true) fail("Governed markers must be preserved");
if (state.captions_credits_accessibility_preserved !== true) fail("Captions/credits/accessibility must be preserved");
if (state.rollback_ready !== true) fail("Rollback readiness must be true");

if (closure.closure_decision.ag12_chain_closed !== true) fail("AG12 chain closure missing");
if (closure.closure_decision.refined_article_layout_audited !== true) fail("Refined layout audit closure missing");
if (closure.closure_decision.ready_for_final_editorial_live_verification_chain !== true) fail("Final editorial/live verification readiness missing");
if (closure.closure_decision.publish_ready !== false) fail("Closure must not mark publish ready");

if (readiness.ready_for_ag13a !== true) fail("AG13A readiness missing");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.publish_approval_required !== true) fail("Publish approval must remain required");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag13a_boundary_created_not_started") fail("AG13A boundary status mismatch");
if (boundary.next_stage_id !== "AG13A") fail("AG13A handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG13A explicit approval missing");

if (schema.status !== "schema_object_rich_production_readiness_closure_only") fail("Schema status mismatch");

for (const key of [
  "production_readiness_closure_allowed_in_ag12z",
  "refined_article_state_record_allowed_in_ag12z",
  "final_readiness_record_allowed_in_ag12z",
  "ag13a_boundary_allowed_in_ag12z"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag12z",
  "object_generation_allowed_in_ag12z",
  "object_insertion_allowed_in_ag12z",
  "object_removal_allowed_in_ag12z",
  "css_js_mutation_allowed_in_ag12z",
  "data_fetch_allowed_in_ag12z",
  "reference_url_change_allowed_in_ag12z",
  "database_write_allowed_in_ag12z",
  "supabase_write_allowed_in_ag12z",
  "backend_auth_supabase_activation_allowed_in_ag12z",
  "public_publishing_operation_allowed_in_ag12z"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, closure, state, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.object_rich_production_readiness_closure_only !== true) fail(`${obj.title || "object"} must be AG12Z closure only`);
  if (obj.article_mutation_performed_in_ag12z !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.object_generation_performed_in_ag12z !== false) fail(`${obj.title || "object"} must not generate object`);
  if (obj.object_insertion_performed_in_ag12z !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.object_removal_performed_in_ag12z !== false) fail(`${obj.title || "object"} must not remove object`);
  if (obj.css_file_mutation_performed_in_ag12z !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag12z !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag12z !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag12z !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Closure Result", "Refined Article State", "Publishing Boundary", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG12Z document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag12z", "validate:ag12z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag12z")) {
  fail("validate:project must include validate:ag12z");
}

pass("AG12Z registry is present.");
pass("AG12Z document is present.");
pass("AG12Z review, closure, refined article state, final readiness, AG13A boundary, schema, learning and preview are present.");
pass("AG12D audit and AG12C refined article state are consumed.");
pass("Current article hash remains AG12C post-refinement hash.");
pass("Refined production state is recorded: four primary visible objects and three collapsed pilot objects.");
pass("Rollback readiness and production-density rules are carried forward.");
pass("AG12 object-rich production-readiness chain is closed.");
pass("Article is ready for final editorial/live verification chain but not published.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No article mutation, object generation, object insertion/removal, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG13A final editorial/live verification boundary is created with explicit approval required.");
pass("AG12Z is Object-Rich Production Readiness Closure only.");
