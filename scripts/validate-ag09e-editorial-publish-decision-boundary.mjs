import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();


function ag10kControlledGeneratedImageInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json");

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
      applyRecord.status === "generated_image_inserted_pending_post_insertion_audit" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag09d-post-correction-public-experience-audit.json",
  "data/content-intelligence/audit-records/ag09d-post-correction-public-experience-audit-report.json",
  "data/content-intelligence/quality-registry/ag09d-public-experience-readiness-record.json",
  "data/content-intelligence/quality-registry/ag09d-rollback-readiness-record.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",
  "data/content-intelligence/quality-reviews/ag09e-editorial-publish-decision-boundary.json",
  "data/content-intelligence/approval-registry/ag09e-editorial-publish-decision-record.json",
  "data/content-intelligence/quality-registry/ag09e-editorial-publish-readiness-boundary.json",
  "data/content-intelligence/mutation-plans/ag09e-to-ag09f-controlled-publish-preparation-boundary.json",
  "data/content-intelligence/schema/editorial-publish-decision-boundary.schema.json",
  "data/content-intelligence/learning/ag09e-editorial-publish-decision-boundary-learning.json",
  "data/quality/ag09e-editorial-publish-decision-boundary.json",
  "data/quality/ag09e-editorial-publish-decision-boundary-preview.json",
  "docs/quality/AG09E_EDITORIAL_PUBLISH_DECISION_BOUNDARY.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG09E validation failed: ${message}`);
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

const ag09dReview = readJson("data/content-intelligence/quality-reviews/ag09d-post-correction-public-experience-audit.json");
const ag09dAudit = readJson("data/content-intelligence/audit-records/ag09d-post-correction-public-experience-audit-report.json");
const ag09dReadiness = readJson("data/content-intelligence/quality-registry/ag09d-public-experience-readiness-record.json");
const ag09dRollback = readJson("data/content-intelligence/quality-registry/ag09d-rollback-readiness-record.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag09e-editorial-publish-decision-boundary.json");
const decision = readJson("data/content-intelligence/approval-registry/ag09e-editorial-publish-decision-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag09e-editorial-publish-readiness-boundary.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag09e-to-ag09f-controlled-publish-preparation-boundary.json");
const schema = readJson("data/content-intelligence/schema/editorial-publish-decision-boundary.schema.json");
const learning = readJson("data/content-intelligence/learning/ag09e-editorial-publish-decision-boundary-learning.json");
const registry = readJson("data/quality/ag09e-editorial-publish-decision-boundary.json");
const preview = readJson("data/quality/ag09e-editorial-publish-decision-boundary-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG09E_EDITORIAL_PUBLISH_DECISION_BOUNDARY.md"), "utf8");

for (const obj of [review, decision, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG09E") fail(`module_id must be AG09E in ${obj.title || "object"}`);
}

if (ag09dReview.status !== "post_correction_public_experience_audit_passed") fail("AG09D review must pass");
if (ag09dAudit.status !== "post_correction_public_experience_audit_passed") fail("AG09D audit must pass");
if (ag09dReadiness.status !== "public_experience_corrections_audited_pending_editorial_publish_decision") fail("AG09D readiness mismatch");
if (ag09dRollback.status !== "rollback_ready_not_executed") fail("AG09D rollback readiness mismatch");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const html = fs.readFileSync(path.join(root, target), "utf8");
const currentHash = sha256(html);
if (currentHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) fail("Article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state");

if (review.status !== "editorial_publish_decision_boundary_created_not_approved") fail("Review status mismatch");
if (decision.status !== "editorial_publish_decision_boundary_created_not_approved") fail("Decision status mismatch");
if (registry.status !== "editorial_publish_decision_boundary_created_not_approved") fail("Registry status mismatch");
if (preview.status !== "editorial_publish_decision_boundary_created_not_approved") fail("Preview status mismatch");

if (readiness.status !== "eligible_for_editorial_publish_consideration_not_approved") fail("Readiness status mismatch");
if (readiness.eligible_for_editorial_publish_consideration !== true) fail("Article must be eligible for editorial consideration");
if (readiness.publish_ready !== false) fail("AG09E must not mark publish-ready");
if (readiness.publish_approval_granted !== false) fail("Publish approval must not be granted");
if (readiness.publish_readiness !== "blocked_pending_explicit_editorial_publish_approval") fail("Publish readiness mismatch");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.database_activation_ready !== false) fail("Database activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (decision.editorial_publish_candidate !== true) fail("Decision must mark editorial publish candidate true");
if (decision.editorial_publish_approved !== false) fail("Editorial publish approved must remain false");
if (decision.public_publishing_performed !== false) fail("Public publishing must not be performed");
if (decision.publish_decision_required_from_user !== true) fail("Decision must require user approval");

for (const check of decision.eligibility_checks) {
  if (check.status !== "passed") fail(`Eligibility check failed: ${check.check_id}`);
}

if (boundary.status !== "future_publish_preparation_boundary_created_not_executed") fail("AG09F boundary status mismatch");
if (boundary.next_stage_id !== "AG09F") fail("AG09F handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG09F must require explicit approval");

if (schema.status !== "schema_decision_boundary_only") fail("Schema status mismatch");
if (schema.editorial_decision_record_allowed_in_ag09e !== true) fail("Schema must allow decision record");
if (schema.publish_readiness_boundary_allowed_in_ag09e !== true) fail("Schema must allow readiness boundary");
if (schema.future_publish_preparation_boundary_allowed_in_ag09e !== true) fail("Schema must allow AG09F boundary");

for (const key of [
  "article_mutation_allowed_in_ag09e",
  "homepage_mutation_allowed_in_ag09e",
  "css_js_mutation_allowed_in_ag09e",
  "reference_insertion_allowed_in_ag09e",
  "visual_generation_allowed_in_ag09e",
  "image_insertion_allowed_in_ag09e",
  "live_url_fetch_allowed_in_ag09e",
  "production_jsonl_append_allowed_in_ag09e",
  "database_write_allowed_in_ag09e",
  "supabase_write_allowed_in_ag09e",
  "backend_auth_supabase_activation_allowed_in_ag09e",
  "publishing_allowed_in_ag09e",
  "publishing_approval_allowed_in_ag09e",
  "rollback_execution_allowed_in_ag09e"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, decision, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.editorial_publish_decision_boundary_only !== true) fail(`${obj.title || "object"} must be decision-boundary-only`);
  if (obj.article_mutation_performed_in_ag09e !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.homepage_mutation_performed_in_ag09e !== false) fail(`${obj.title || "object"} must not mutate homepage`);
  if (obj.css_mutation_performed_in_ag09e !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag09e !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag09e !== false) fail(`${obj.title || "object"} must not insert references`);
  if (obj.visual_generation_performed_in_ag09e !== false) fail(`${obj.title || "object"} must not generate visual`);
  if (obj.image_insertion_performed_in_ag09e !== false) fail(`${obj.title || "object"} must not insert image`);
  if (obj.live_url_fetch_performed_in_ag09e !== false) fail(`${obj.title || "object"} must not fetch live URL`);
  if (obj.database_write_performed_in_ag09e !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag09e !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag09e !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_performed_in_ag09e !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.publishing_approval_granted_in_ag09e !== false) fail(`${obj.title || "object"} must not approve publishing`);
}

if (review.closure_decision.decision !== "ag09e_decision_boundary_created_pending_explicit_publish_preparation_approval") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag09f_only_with_explicit_user_approval !== true) fail("AG09F must require explicit approval");
if (review.closure_decision.publish_approval_granted !== false) fail("Publish approval must not be granted");

for (const scriptName of ["generate:ag09e", "validate:ag09e"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag09e")) {
  fail("validate:project must include validate:ag09e");
}

for (const phrase of ["Purpose", "Decision Result", "Boundary", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG09E document missing phrase: ${phrase}`);
}

pass("AG09E registry is present.");
pass("AG09E document is present.");
pass("AG09E review, decision record, readiness boundary, AG09F boundary, schema, learning record and preview are present.");
pass("AG09D audit and readiness are consumed and passed.");
pass("Selected article hash matches AG09C post-correction hash.");
pass("Article is marked eligible for editorial publish consideration but not approved.");
pass("Publishing approval remains blocked.");
pass("Backend/database/Supabase activation remains blocked.");
pass("AG09F controlled publish preparation boundary is created with explicit approval required.");
pass("No mutation, live fetch, backend activation, rollback execution or publishing is performed.");
pass("AG09E is Editorial Publish Decision Boundary only.");
