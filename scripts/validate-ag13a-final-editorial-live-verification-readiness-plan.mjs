import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag12z-object-rich-production-readiness-closure.json",
  "data/content-intelligence/closure-records/ag12z-object-rich-production-readiness-closure.json",
  "data/content-intelligence/object-registry/ag12z-refined-article-production-state-record.json",
  "data/content-intelligence/quality-registry/ag12z-production-readiness-final-record.json",
  "data/content-intelligence/mutation-plans/ag12z-to-ag13a-final-editorial-live-verification-boundary.json",
  "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json",

  "data/content-intelligence/quality-reviews/ag13a-final-editorial-live-verification-readiness-plan.json",
  "data/content-intelligence/mutation-plans/ag13a-final-editorial-live-verification-readiness-plan.json",
  "data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-checklist-record.json",
  "data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag13a-to-ag13b-final-editorial-live-verification-audit-boundary.json",
  "data/content-intelligence/schema/final-editorial-live-verification-readiness-plan.schema.json",
  "data/content-intelligence/learning/ag13a-final-editorial-live-verification-readiness-plan-learning.json",
  "data/quality/ag13a-final-editorial-live-verification-readiness-plan.json",
  "data/quality/ag13a-final-editorial-live-verification-readiness-plan-preview.json",
  "docs/quality/AG13A_FINAL_EDITORIAL_LIVE_VERIFICATION_READINESS_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG13A validation failed: ${message}`);
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

const ag12zReview = readJson("data/content-intelligence/quality-reviews/ag12z-object-rich-production-readiness-closure.json");
const ag12zState = readJson("data/content-intelligence/object-registry/ag12z-refined-article-production-state-record.json");
const ag12zReadiness = readJson("data/content-intelligence/quality-registry/ag12z-production-readiness-final-record.json");
const ag12zBoundary = readJson("data/content-intelligence/mutation-plans/ag12z-to-ag13a-final-editorial-live-verification-boundary.json");
const ag12cApply = readJson("data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag13a-final-editorial-live-verification-readiness-plan.json");
const plan = readJson("data/content-intelligence/mutation-plans/ag13a-final-editorial-live-verification-readiness-plan.json");
const checklist = readJson("data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-checklist-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag13a-to-ag13b-final-editorial-live-verification-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/final-editorial-live-verification-readiness-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag13a-final-editorial-live-verification-readiness-plan-learning.json");
const registry = readJson("data/quality/ag13a-final-editorial-live-verification-readiness-plan.json");
const preview = readJson("data/quality/ag13a-final-editorial-live-verification-readiness-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG13A_FINAL_EDITORIAL_LIVE_VERIFICATION_READINESS_PLAN.md"), "utf8");

for (const obj of [review, plan, checklist, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG13A") fail(`module_id must be AG13A in ${obj.title || "object"}`);
}

if (ag12zReview.status !== "object_rich_article_production_readiness_closed_ready_for_final_editorial_live_verification") fail("AG12Z review status mismatch");
if (ag12zReadiness.ready_for_ag13a !== true) fail("AG12Z readiness for AG13A missing");
if (ag12zBoundary.next_stage_id !== "AG13A") fail("AG13A boundary missing in AG12Z");

const articlePath = ag12cApply.selected_article_path;
const backupPath = ag12cApply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Rollback backup missing: ${backupPath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
const backupHash = sha256(fs.readFileSync(path.join(root, backupPath), "utf8"));

if (articleHash !== ag12cApply.post_refinement_hash) fail("Current article hash must remain AG12C post-refinement hash");
if (backupHash !== ag12cApply.pre_refinement_hash) fail("Backup hash must remain AG12C pre-refinement hash");

if (review.status !== "final_editorial_live_verification_readiness_plan_created_no_mutation") fail("Review status mismatch");
if (plan.status !== "final_editorial_live_verification_readiness_plan_created_no_mutation") fail("Plan status mismatch");
if (checklist.status !== "final_editorial_live_verification_checklist_created") fail("Checklist status mismatch");
if (readiness.status !== "ready_for_ag13b_final_editorial_live_verification_audit") fail("Readiness status mismatch");

if (!Array.isArray(checklist.desktop_preview_checks) || checklist.desktop_preview_checks.length < 5) fail("Desktop preview checklist incomplete");
if (!Array.isArray(checklist.mobile_preview_checks) || checklist.mobile_preview_checks.length < 5) fail("Mobile preview checklist incomplete");
if (!Array.isArray(checklist.editorial_checks) || checklist.editorial_checks.length < 4) fail("Editorial checklist incomplete");
if (!Array.isArray(checklist.governance_checks) || checklist.governance_checks.length < 4) fail("Governance checklist incomplete");

if (plan.ag12z_state_consumed.primary_visible_object_count !== ag12zState.primary_visible_object_count) fail("AG12Z primary object count not consumed correctly");
if (plan.ag12z_state_consumed.collapsed_pilot_object_count !== ag12zState.collapsed_pilot_object_count) fail("AG12Z collapsed object count not consumed correctly");
if (plan.readiness_decision.ready_for_final_editorial_live_verification_audit !== true) fail("Plan must be ready for AG13B audit");
if (plan.readiness_decision.publish_ready !== false) fail("Plan must not mark publish ready");

if (readiness.ready_for_ag13b !== true) fail("AG13B readiness missing");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.publish_approval_required !== true) fail("Publish approval must remain required");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag13b_boundary_created_not_started") fail("AG13B boundary status mismatch");
if (boundary.next_stage_id !== "AG13B") fail("AG13B handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG13B explicit approval missing");

if (schema.status !== "schema_final_editorial_live_verification_readiness_plan_only") fail("Schema status mismatch");

for (const key of [
  "final_editorial_plan_allowed_in_ag13a",
  "live_verification_checklist_allowed_in_ag13a",
  "readiness_record_allowed_in_ag13a",
  "ag13b_boundary_allowed_in_ag13a"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag13a",
  "object_generation_allowed_in_ag13a",
  "object_insertion_allowed_in_ag13a",
  "object_removal_allowed_in_ag13a",
  "css_js_mutation_allowed_in_ag13a",
  "data_fetch_allowed_in_ag13a",
  "reference_url_change_allowed_in_ag13a",
  "database_write_allowed_in_ag13a",
  "supabase_write_allowed_in_ag13a",
  "backend_auth_supabase_activation_allowed_in_ag13a",
  "public_publishing_operation_allowed_in_ag13a"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, plan, checklist, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.final_editorial_live_verification_readiness_plan_only !== true) fail(`${obj.title || "object"} must be AG13A planning only`);
  if (obj.article_mutation_performed_in_ag13a !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.object_generation_performed_in_ag13a !== false) fail(`${obj.title || "object"} must not generate object`);
  if (obj.object_insertion_performed_in_ag13a !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.object_removal_performed_in_ag13a !== false) fail(`${obj.title || "object"} must not remove object`);
  if (obj.css_file_mutation_performed_in_ag13a !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag13a !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag13a !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag13a !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Readiness Position", "Verification Scope", "Publishing Boundary", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG13A document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag13a", "validate:ag13a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag13a")) {
  fail("validate:project must include validate:ag13a");
}

pass("AG13A registry is present.");
pass("AG13A document is present.");
pass("AG13A review, readiness plan, verification checklist, readiness record, AG13B boundary, schema, learning and preview are present.");
pass("AG12Z closure and refined article state are consumed.");
pass("Current article hash remains AG12C/AG12D/AG12Z post-refinement hash.");
pass("Desktop, mobile, editorial and governance verification checklist is created.");
pass("Article is ready for AG13B final editorial/live verification audit but not publish-approved.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No article mutation, object generation, object insertion/removal, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG13B final editorial/live verification audit boundary is created with explicit approval required.");
pass("AG13A is Final Editorial and Live Verification Readiness Plan only.");
