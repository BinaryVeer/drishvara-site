import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();







function ag11fControlledMapInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11f-map-geographic-object-controlled-cycle-apply.json");

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
      applyRecord.status === "map_geographic_object_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.map_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag11eControlledTableInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11fControlledMapInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11e-table-structured-object-controlled-cycle-apply.json");

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
      applyRecord.status === "table_structured_object_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.table_title) &&
      html.includes(applyRecord.visible_credit) &&
      html.includes("AG11E-TABLE-001")
    );
  } catch {
    return false;
  }
}

function ag11dControlledFigureDiagramInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11eControlledTableInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11d-figure-diagram-controlled-cycle-apply.json");

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
      applyRecord.status === "figure_diagram_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.diagram_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag11cControlledInfographicInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11dControlledFigureDiagramInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11c-infographic-controlled-cycle-apply.json");

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
      applyRecord.status === "infographic_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.infographic_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag11bControlledChartInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11cControlledInfographicInsertionAllowsPostMutation(...arguments)) return true;
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
  "data/content-intelligence/quality-reviews/ag09g-controlled-live-verification-deployment-observation-audit.json",
  "data/content-intelligence/audit-records/ag09g-controlled-live-verification-deployment-observation-audit-report.json",
  "data/content-intelligence/quality-registry/ag09g-live-public-readiness-observation.json",
  "data/content-intelligence/mutation-plans/ag09g-to-ag09h-final-editorial-publish-approval-boundary.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",
  "data/content-intelligence/quality-reviews/ag09gm-manual-mobile-layout-observation-note.json",
  "data/content-intelligence/audit-records/ag09gm-manual-mobile-layout-observation-note.json",
  "data/content-intelligence/quality-registry/ag09gm-mobile-layout-manual-review-readiness.json",
  "data/content-intelligence/mutation-plans/ag09gm-to-ag09h-final-editorial-decision-boundary.json",
  "data/content-intelligence/schema/manual-mobile-layout-observation-note.schema.json",
  "data/content-intelligence/learning/ag09gm-manual-mobile-layout-observation-note-learning.json",
  "data/quality/ag09gm-manual-mobile-layout-observation-note.json",
  "data/quality/ag09gm-manual-mobile-layout-observation-note-preview.json",
  "docs/quality/AG09G_M_MANUAL_MOBILE_LAYOUT_OBSERVATION_NOTE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG09G-M validation failed: ${message}`);
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

const ag09gReview = readJson("data/content-intelligence/quality-reviews/ag09g-controlled-live-verification-deployment-observation-audit.json");
const ag09gAudit = readJson("data/content-intelligence/audit-records/ag09g-controlled-live-verification-deployment-observation-audit-report.json");
const ag09gBoundary = readJson("data/content-intelligence/mutation-plans/ag09g-to-ag09h-final-editorial-publish-approval-boundary.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag09gm-manual-mobile-layout-observation-note.json");
const note = readJson("data/content-intelligence/audit-records/ag09gm-manual-mobile-layout-observation-note.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag09gm-mobile-layout-manual-review-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag09gm-to-ag09h-final-editorial-decision-boundary.json");
const schema = readJson("data/content-intelligence/schema/manual-mobile-layout-observation-note.schema.json");
const learning = readJson("data/content-intelligence/learning/ag09gm-manual-mobile-layout-observation-note-learning.json");
const registry = readJson("data/quality/ag09gm-manual-mobile-layout-observation-note.json");
const preview = readJson("data/quality/ag09gm-manual-mobile-layout-observation-note-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG09G_M_MANUAL_MOBILE_LAYOUT_OBSERVATION_NOTE.md"), "utf8");

for (const obj of [review, note, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG09G-M") fail(`module_id must be AG09G-M in ${obj.title || "object"}`);
}

const allowedAg09gStatuses = [
  "controlled_live_verification_completed_with_review_required",
  "controlled_live_verification_passed_not_publish_approved"
];

if (!allowedAg09gStatuses.includes(ag09gReview.status)) fail("AG09G review status invalid");
if (!allowedAg09gStatuses.includes(ag09gAudit.status)) fail("AG09G audit status invalid");
if (ag09gBoundary.next_stage_id !== "AG09H") fail("AG09H boundary missing in AG09G");

const mobileObservation = ag09gAudit.observations.find((item) => item.area === "mobile_layout");
if (!mobileObservation) fail("AG09G mobile layout observation missing");
if (mobileObservation.status !== "manual_review_required") fail("AG09G-M expected manual mobile layout review requirement");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const currentHash = sha256(fs.readFileSync(path.join(root, target), "utf8"));
if (currentHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) fail("Selected article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state");

if (review.status !== "manual_mobile_layout_review_note_created_pending_human_confirmation") fail("Review status mismatch");
if (note.status !== "manual_mobile_layout_review_note_created_pending_human_confirmation") fail("Note status mismatch");
if (registry.status !== "manual_mobile_layout_review_note_created_pending_human_confirmation") fail("Registry status mismatch");
if (preview.status !== "manual_mobile_layout_review_note_created_pending_human_confirmation") fail("Preview status mismatch");

if (note.manual_review_required !== true) fail("Manual review must be required");
if (!Array.isArray(note.manual_checklist) || note.manual_checklist.length < 7) fail("Manual checklist must have at least 7 items");

for (const item of note.manual_checklist) {
  if (item.status !== "pending_manual_confirmation") fail(`Checklist item must remain pending: ${item.item_id}`);
}

if (readiness.status !== "manual_mobile_layout_confirmation_pending") fail("Readiness status mismatch");
if (readiness.ag09h_ready_for_final_approval !== false) fail("AG09H final approval must remain blocked");
if (readiness.ag09h_ready_for_hold_decision !== true) fail("AG09H hold decision must be allowed");
if (readiness.publish_ready !== false) fail("Publish ready must remain false");
if (readiness.publish_approval_granted !== false) fail("Publish approval must remain false");
if (readiness.publish_readiness !== "blocked_pending_manual_mobile_layout_confirmation_and_explicit_ag09h_decision") fail("Publish readiness mismatch");

if (boundary.status !== "final_editorial_decision_boundary_created_with_mobile_review_pending") fail("Boundary status mismatch");
if (boundary.next_stage_id !== "AG09H") fail("AG09H handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG09H must require explicit approval");

if (schema.status !== "schema_manual_mobile_observation_note_only") fail("Schema status mismatch");
if (schema.manual_mobile_layout_note_allowed_in_ag09gm !== true) fail("Schema must allow manual mobile note");
if (schema.manual_checklist_allowed_in_ag09gm !== true) fail("Schema must allow checklist");
if (schema.ag09h_boundary_allowed_in_ag09gm !== true) fail("Schema must allow AG09H boundary");

for (const key of [
  "article_mutation_allowed_in_ag09gm",
  "homepage_mutation_allowed_in_ag09gm",
  "css_js_mutation_allowed_in_ag09gm",
  "reference_insertion_allowed_in_ag09gm",
  "reference_url_change_allowed_in_ag09gm",
  "visual_generation_allowed_in_ag09gm",
  "image_asset_creation_allowed_in_ag09gm",
  "image_insertion_allowed_in_ag09gm",
  "live_url_fetch_allowed_in_ag09gm",
  "deployment_trigger_allowed_in_ag09gm",
  "production_jsonl_append_allowed_in_ag09gm",
  "database_write_allowed_in_ag09gm",
  "supabase_write_allowed_in_ag09gm",
  "backend_auth_supabase_activation_allowed_in_ag09gm",
  "publishing_allowed_in_ag09gm",
  "publishing_approval_allowed_in_ag09gm",
  "rollback_execution_allowed_in_ag09gm"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, note, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.manual_mobile_layout_observation_note_only !== true) fail(`${obj.title || "object"} must be note-only`);
  if (obj.article_mutation_performed_in_ag09gm !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.homepage_mutation_performed_in_ag09gm !== false) fail(`${obj.title || "object"} must not mutate homepage`);
  if (obj.css_mutation_performed_in_ag09gm !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag09gm !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag09gm !== false) fail(`${obj.title || "object"} must not insert references`);
  if (obj.visual_generation_performed_in_ag09gm !== false) fail(`${obj.title || "object"} must not generate visuals`);
  if (obj.image_insertion_performed_in_ag09gm !== false) fail(`${obj.title || "object"} must not insert images`);
  if (obj.live_url_fetch_performed_in_ag09gm !== false) fail(`${obj.title || "object"} must not fetch live URL`);
  if (obj.deployment_trigger_performed_in_ag09gm !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.backend_auth_supabase_activation_performed_in_ag09gm !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_performed_in_ag09gm !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.publishing_approval_granted_in_ag09gm !== false) fail(`${obj.title || "object"} must not approve publishing`);
}

if (review.closure_decision.decision !== "ag09gm_manual_mobile_layout_note_created_pending_human_confirmation") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag09h_only_with_explicit_user_approval !== true) fail("AG09H must require explicit approval");
if (review.closure_decision.final_publish_approval_allowed_now !== false) fail("Final approval must not be allowed now");
if (review.closure_decision.publish_approval_granted !== false) fail("Publish approval must remain false");

for (const scriptName of ["generate:ag09gm", "validate:ag09gm"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag09gm")) {
  fail("validate:project must include validate:ag09gm");
}

for (const phrase of ["Purpose", "Source Finding", "Manual Review Checklist", "Publish Boundary", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG09G-M document missing phrase: ${phrase}`);
}

pass("AG09G-M registry is present.");
pass("AG09G-M document is present.");
pass("AG09G-M review, observation note, readiness, AG09H boundary, schema, learning record and preview are present.");
pass("AG09G live audit is consumed.");
pass("Manual mobile layout review requirement is preserved.");
pass("Manual mobile checklist is created and remains pending human confirmation.");
pass("Final publish approval remains blocked.");
pass("AG09H hold decision is allowed, but final approval is blocked until manual confirmation.");
pass("No mutation, live fetch, deployment trigger, backend activation, rollback execution or publishing is performed.");
pass("AG09G-M is Manual Mobile Layout Observation Note only.");
