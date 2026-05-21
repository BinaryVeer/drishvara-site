import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag09g-controlled-live-verification-deployment-observation-audit.json",
  "data/content-intelligence/audit-records/ag09g-controlled-live-verification-deployment-observation-audit-report.json",
  "data/content-intelligence/quality-reviews/ag09gm-manual-mobile-layout-observation-note.json",
  "data/content-intelligence/audit-records/ag09gm-manual-mobile-layout-observation-note.json",
  "data/content-intelligence/quality-registry/ag09gm-mobile-layout-manual-review-readiness.json",
  "data/content-intelligence/mutation-plans/ag09gm-to-ag09h-final-editorial-decision-boundary.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",
  "data/content-intelligence/quality-reviews/ag09h-final-editorial-publish-approval-decision.json",
  "data/content-intelligence/approval-registry/ag09h-final-editorial-publish-approval-decision.json",
  "data/content-intelligence/quality-registry/ag09h-final-editorial-readiness-record.json",
  "data/content-intelligence/closure-records/ag09h-final-editorial-publish-approval-closure.json",
  "data/content-intelligence/schema/final-editorial-publish-approval-decision.schema.json",
  "data/content-intelligence/learning/ag09h-final-editorial-publish-approval-decision-learning.json",
  "data/quality/ag09h-final-editorial-publish-approval-decision.json",
  "data/quality/ag09h-final-editorial-publish-approval-decision-preview.json",
  "docs/quality/AG09H_FINAL_EDITORIAL_PUBLISH_APPROVAL_DECISION.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG09H validation failed: ${message}`);
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

const ag09gAudit = readJson("data/content-intelligence/audit-records/ag09g-controlled-live-verification-deployment-observation-audit-report.json");
const ag09gmReview = readJson("data/content-intelligence/quality-reviews/ag09gm-manual-mobile-layout-observation-note.json");
const ag09gmBoundary = readJson("data/content-intelligence/mutation-plans/ag09gm-to-ag09h-final-editorial-decision-boundary.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag09h-final-editorial-publish-approval-decision.json");
const approval = readJson("data/content-intelligence/approval-registry/ag09h-final-editorial-publish-approval-decision.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag09h-final-editorial-readiness-record.json");
const closure = readJson("data/content-intelligence/closure-records/ag09h-final-editorial-publish-approval-closure.json");
const schema = readJson("data/content-intelligence/schema/final-editorial-publish-approval-decision.schema.json");
const learning = readJson("data/content-intelligence/learning/ag09h-final-editorial-publish-approval-decision-learning.json");
const registry = readJson("data/quality/ag09h-final-editorial-publish-approval-decision.json");
const preview = readJson("data/quality/ag09h-final-editorial-publish-approval-decision-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG09H_FINAL_EDITORIAL_PUBLISH_APPROVAL_DECISION.md"), "utf8");

for (const obj of [review, approval, readiness, closure, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG09H") fail(`module_id must be AG09H in ${obj.title || "object"}`);
}

if (ag09gAudit.observation_summary.failed !== 0) fail("AG09G must have zero failed observations");
if (ag09gmReview.status !== "manual_mobile_layout_review_note_created_pending_human_confirmation") fail("AG09G-M review status mismatch");
if (ag09gmBoundary.next_stage_id !== "AG09H") fail("AG09H boundary missing");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const currentHash = sha256(fs.readFileSync(path.join(root, target), "utf8"));
if (currentHash !== ag09cApply.post_correction_hash) fail("Selected article hash must match AG09C post-correction hash");

if (review.status !== "final_editorial_publish_approval_recorded") fail("Review status mismatch");
if (approval.status !== "final_editorial_publish_approval_recorded") fail("Approval status mismatch");
if (registry.status !== "final_editorial_publish_approval_recorded") fail("Registry status mismatch");
if (preview.status !== "final_editorial_publish_approval_recorded") fail("Preview status mismatch");

if (approval.final_editorial_publish_approved !== true) fail("Final editorial approval must be true");
if (approval.editorial_publish_approved_for_static_article !== true) fail("Static article editorial approval must be true");
if (approval.public_publishing_performed_in_ag09h !== false) fail("AG09H must not perform public publishing operation");
if (approval.deployment_trigger_performed_in_ag09h !== false) fail("AG09H must not trigger deployment");
if (approval.backend_activation_performed_in_ag09h !== false) fail("AG09H must not activate backend");

if (approval.user_manual_confirmation.confirmation_status !== "confirmed") fail("Manual mobile confirmation must be recorded");
if (approval.user_manual_confirmation.target_article_confirmed !== true) fail("Target article confirmation missing");
if (approval.user_manual_confirmation.links_working_confirmed !== true) fail("Links confirmation missing");
if (approval.user_manual_confirmation.mobile_layout_acceptable_confirmed !== true) fail("Mobile layout confirmation missing");

for (const check of approval.approval_checks) {
  if (check.status !== "passed") fail(`Approval check failed: ${check.check_id}`);
}

if (readiness.status !== "final_editorial_static_article_approved") fail("Readiness status mismatch");
if (readiness.final_editorial_publish_approved !== true) fail("Readiness must mark final approval true");
if (readiness.publish_ready_for_static_article !== true) fail("Static article must be publish-ready editorially");
if (readiness.public_publishing_performed !== false) fail("Public publishing operation must remain false");
if (readiness.deployment_trigger_performed !== false) fail("Deployment trigger must remain false");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain false");
if (readiness.database_activation_ready !== false) fail("Database activation must remain false");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain false");

if (closure.status !== "ag09_final_editorial_approval_closed_static_article") fail("Closure status mismatch");
if (closure.closed_chain !== true) fail("AG09 chain must be closed");

if (schema.status !== "schema_final_editorial_decision_only") fail("Schema status mismatch");
if (schema.final_editorial_decision_allowed_in_ag09h !== true) fail("Schema must allow final decision");
if (schema.manual_mobile_confirmation_allowed_in_ag09h !== true) fail("Schema must allow manual confirmation");
if (schema.static_article_editorial_approval_allowed_in_ag09h !== true) fail("Schema must allow static article approval");

for (const key of [
  "article_mutation_allowed_in_ag09h",
  "homepage_mutation_allowed_in_ag09h",
  "css_js_mutation_allowed_in_ag09h",
  "reference_insertion_allowed_in_ag09h",
  "reference_url_change_allowed_in_ag09h",
  "visual_generation_allowed_in_ag09h",
  "image_asset_creation_allowed_in_ag09h",
  "image_insertion_allowed_in_ag09h",
  "infographic_generation_allowed_in_ag09h",
  "graph_generation_allowed_in_ag09h",
  "table_generation_allowed_in_ag09h",
  "figure_generation_allowed_in_ag09h",
  "live_url_fetch_allowed_in_ag09h",
  "deployment_trigger_allowed_in_ag09h",
  "production_jsonl_append_allowed_in_ag09h",
  "database_write_allowed_in_ag09h",
  "supabase_write_allowed_in_ag09h",
  "backend_auth_supabase_activation_allowed_in_ag09h",
  "rollback_execution_allowed_in_ag09h"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, approval, readiness, closure, schema, learning, registry, preview]) {
  if (obj.final_editorial_decision_only !== true) fail(`${obj.title || "object"} must be decision-only`);
  if (obj.article_mutation_performed_in_ag09h !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.homepage_mutation_performed_in_ag09h !== false) fail(`${obj.title || "object"} must not mutate homepage`);
  if (obj.css_mutation_performed_in_ag09h !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag09h !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag09h !== false) fail(`${obj.title || "object"} must not insert references`);
  if (obj.visual_generation_performed_in_ag09h !== false) fail(`${obj.title || "object"} must not generate visual`);
  if (obj.image_insertion_performed_in_ag09h !== false) fail(`${obj.title || "object"} must not insert image`);
  if (obj.deployment_trigger_performed_in_ag09h !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.database_write_performed_in_ag09h !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag09h !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag09h !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
}

if (review.closure_decision.decision !== "ag09h_final_editorial_static_article_approval_recorded") fail("Closure decision mismatch");
if (review.closure_decision.ag09_chain_closed !== true) fail("AG09 chain must close");

for (const scriptName of ["generate:ag09h", "validate:ag09h"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag09h")) {
  fail("validate:project must include validate:ag09h");
}

for (const phrase of ["Purpose", "Decision", "Manual Mobile Confirmation", "Object Scope", "Closure"]) {
  if (!docText.includes(phrase)) fail(`AG09H document missing phrase: ${phrase}`);
}

pass("AG09H registry is present.");
pass("AG09H document is present.");
pass("AG09H review, approval record, readiness, closure, schema, learning record and preview are present.");
pass("AG09G and AG09G-M evidence are consumed.");
pass("Manual mobile confirmation is recorded.");
pass("Final editorial approval is recorded for the static article.");
pass("Additional objects are deferred to future governed object-pipeline cycle.");
pass("No mutation, deployment trigger, live fetch, backend activation, rollback execution or publishing operation is performed.");
pass("AG09H closes the AG09 public-experience and final editorial decision chain.");
