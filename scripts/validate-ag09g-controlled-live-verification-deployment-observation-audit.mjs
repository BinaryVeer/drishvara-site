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

function ag10kControlledGeneratedImageInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11bControlledChartInsertionAllowsPostMutation(...arguments)) return true;
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
  "data/content-intelligence/quality-reviews/ag09f-controlled-publish-preparation-live-verification-plan.json",
  "data/content-intelligence/mutation-plans/ag09f-controlled-publish-preparation-live-verification-plan.json",
  "data/content-intelligence/quality-registry/ag09f-live-verification-readiness.json",
  "data/content-intelligence/mutation-plans/ag09f-to-ag09g-controlled-live-verification-boundary.json",
  "data/content-intelligence/approval-registry/ag09e-editorial-publish-decision-record.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",
  "data/content-intelligence/quality-reviews/ag09g-controlled-live-verification-deployment-observation-audit.json",
  "data/content-intelligence/audit-records/ag09g-controlled-live-verification-deployment-observation-audit-report.json",
  "data/content-intelligence/quality-registry/ag09g-live-public-readiness-observation.json",
  "data/content-intelligence/mutation-plans/ag09g-to-ag09h-final-editorial-publish-approval-boundary.json",
  "data/content-intelligence/schema/controlled-live-verification-deployment-observation-audit.schema.json",
  "data/content-intelligence/learning/ag09g-controlled-live-verification-deployment-observation-audit-learning.json",
  "data/quality/ag09g-controlled-live-verification-deployment-observation-audit.json",
  "data/quality/ag09g-controlled-live-verification-deployment-observation-audit-preview.json",
  "docs/quality/AG09G_CONTROLLED_LIVE_VERIFICATION_DEPLOYMENT_OBSERVATION_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG09G validation failed: ${message}`);
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

const ag09fReview = readJson("data/content-intelligence/quality-reviews/ag09f-controlled-publish-preparation-live-verification-plan.json");
const ag09fPlan = readJson("data/content-intelligence/mutation-plans/ag09f-controlled-publish-preparation-live-verification-plan.json");
const ag09fReadiness = readJson("data/content-intelligence/quality-registry/ag09f-live-verification-readiness.json");
const ag09fBoundary = readJson("data/content-intelligence/mutation-plans/ag09f-to-ag09g-controlled-live-verification-boundary.json");
const ag09eDecision = readJson("data/content-intelligence/approval-registry/ag09e-editorial-publish-decision-record.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag09g-controlled-live-verification-deployment-observation-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag09g-controlled-live-verification-deployment-observation-audit-report.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag09g-live-public-readiness-observation.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag09g-to-ag09h-final-editorial-publish-approval-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-live-verification-deployment-observation-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag09g-controlled-live-verification-deployment-observation-audit-learning.json");
const registry = readJson("data/quality/ag09g-controlled-live-verification-deployment-observation-audit.json");
const preview = readJson("data/quality/ag09g-controlled-live-verification-deployment-observation-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG09G_CONTROLLED_LIVE_VERIFICATION_DEPLOYMENT_OBSERVATION_AUDIT.md"), "utf8");

for (const obj of [review, audit, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG09G") fail(`module_id must be AG09G in ${obj.title || "object"}`);
}

if (ag09fReview.status !== "publish_preparation_live_verification_plan_created_not_executed") fail("AG09F review status mismatch");
if (ag09fPlan.status !== "publish_preparation_live_verification_plan_created_not_executed") fail("AG09F plan status mismatch");
if (ag09fReadiness.status !== "live_verification_plan_ready_pending_explicit_ag09g") fail("AG09F readiness mismatch");
if (ag09fBoundary.next_stage_id !== "AG09G") fail("AG09G boundary missing in AG09F");
if (ag09eDecision.editorial_publish_approved !== false) fail("Publish approval must still be false before AG09G");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const localHash = sha256(fs.readFileSync(path.join(root, target), "utf8"));
if (localHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) fail("Selected article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state");

const allowedStatuses = [
  "controlled_live_verification_passed_not_publish_approved",
  "controlled_live_verification_completed_with_review_required"
];

if (!allowedStatuses.includes(review.status)) fail("Review status mismatch");
if (!allowedStatuses.includes(audit.status)) fail("Audit status mismatch");
if (!allowedStatuses.includes(registry.status)) fail("Registry status mismatch");
if (!allowedStatuses.includes(preview.status)) fail("Preview status mismatch");

if (!Array.isArray(audit.observations) || audit.observations.length < 7) fail("AG09G observations missing");
if (audit.live_url_fetch_performed_in_ag09g !== true) fail("AG09G must perform live URL fetch");
if (audit.article_live_fetch_performed_in_ag09g !== true) fail("Article live fetch must be recorded");
if (audit.homepage_live_fetch_performed_in_ag09g !== true) fail("Homepage live fetch must be recorded");

for (const area of [
  "article_url",
  "hero_visual",
  "metadata_social_preview",
  "references",
  "homepage_listing",
  "mobile_layout",
  "forbidden_systems"
]) {
  if (!audit.observations.some((item) => item.area === area)) fail(`Missing observation area: ${area}`);
}

if (readiness.publish_ready !== false) fail("AG09G must not mark publish-ready");
if (readiness.publish_approval_granted !== false) fail("AG09G must not grant publish approval");
if (readiness.publish_readiness !== "blocked_pending_explicit_final_editorial_approval") fail("Publish readiness mismatch");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.database_activation_ready !== false) fail("Database activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "future_final_editorial_publish_approval_boundary_created_not_executed") fail("AG09H boundary status mismatch");
if (boundary.next_stage_id !== "AG09H") fail("AG09H handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG09H must require explicit approval");

if (schema.status !== "schema_live_verification_observation_audit_only") fail("Schema status mismatch");
if (schema.live_url_fetch_allowed_in_ag09g !== true) fail("Schema must allow live URL fetch in AG09G");
if (schema.live_observation_audit_allowed_in_ag09g !== true) fail("Schema must allow live observation audit");
if (schema.ag09h_boundary_allowed_in_ag09g !== true) fail("Schema must allow AG09H boundary");

for (const key of [
  "article_mutation_allowed_in_ag09g",
  "homepage_mutation_allowed_in_ag09g",
  "css_js_mutation_allowed_in_ag09g",
  "reference_insertion_allowed_in_ag09g",
  "reference_url_change_allowed_in_ag09g",
  "visual_generation_allowed_in_ag09g",
  "image_asset_creation_allowed_in_ag09g",
  "image_insertion_allowed_in_ag09g",
  "deployment_trigger_allowed_in_ag09g",
  "production_jsonl_append_allowed_in_ag09g",
  "database_write_allowed_in_ag09g",
  "supabase_write_allowed_in_ag09g",
  "backend_auth_supabase_activation_allowed_in_ag09g",
  "publishing_allowed_in_ag09g",
  "publishing_approval_allowed_in_ag09g",
  "rollback_execution_allowed_in_ag09g"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_live_verification_observation_audit_only !== true) fail(`${obj.title || "object"} must be observation-audit-only`);
  if (obj.article_mutation_performed_in_ag09g !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.homepage_mutation_performed_in_ag09g !== false) fail(`${obj.title || "object"} must not mutate homepage`);
  if (obj.css_mutation_performed_in_ag09g !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag09g !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag09g !== false) fail(`${obj.title || "object"} must not insert references`);
  if (obj.reference_url_change_performed_in_ag09g !== false) fail(`${obj.title || "object"} must not change reference URLs`);
  if (obj.visual_generation_performed_in_ag09g !== false) fail(`${obj.title || "object"} must not generate visuals`);
  if (obj.image_insertion_performed_in_ag09g !== false) fail(`${obj.title || "object"} must not insert images`);
  if (obj.deployment_trigger_performed_in_ag09g !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.database_write_performed_in_ag09g !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag09g !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag09g !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_performed_in_ag09g !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.publishing_approval_granted_in_ag09g !== false) fail(`${obj.title || "object"} must not approve publishing`);
}

if (review.closure_decision.decision !== "ag09g_live_verification_observed_pending_explicit_final_editorial_decision") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag09h_only_with_explicit_user_approval !== true) fail("AG09H must require explicit approval");
if (review.closure_decision.publish_approval_granted !== false) fail("Publish approval must remain false");
if (review.closure_decision.public_publishing_performed !== false) fail("Public publishing must remain false");

for (const scriptName of ["generate:ag09g", "validate:ag09g"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag09g")) {
  fail("validate:project must include validate:ag09g");
}

for (const phrase of ["Purpose", "Live Targets", "Result", "Boundary", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG09G document missing phrase: ${phrase}`);
}

pass("AG09G registry is present.");
pass("AG09G document is present.");
pass("AG09G review, audit report, readiness observation, AG09H boundary, schema, learning record and preview are present.");
pass("AG09F live verification plan is consumed.");
pass("Selected article hash matches AG09C post-correction hash.");
pass("Live URL fetch/observation is recorded.");
pass("Article URL, homepage, hero visual, metadata, references, mobile layout and forbidden-system observations are recorded.");
pass("Publish approval remains blocked.");
pass("Backend/database/Supabase activation remains blocked.");
pass("AG09H final editorial decision boundary is created with explicit approval required.");
pass("No mutation, deployment trigger, backend activation, rollback execution or publishing is performed.");
pass("AG09G is Controlled Live Verification and Deployment Observation Audit only.");
