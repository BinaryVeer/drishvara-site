import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag09eReview: "data/content-intelligence/quality-reviews/ag09e-editorial-publish-decision-boundary.json",
  ag09eDecision: "data/content-intelligence/approval-registry/ag09e-editorial-publish-decision-record.json",
  ag09eReadiness: "data/content-intelligence/quality-registry/ag09e-editorial-publish-readiness-boundary.json",
  ag09eBoundary: "data/content-intelligence/mutation-plans/ag09e-to-ag09f-controlled-publish-preparation-boundary.json",
  ag09dAudit: "data/content-intelligence/audit-records/ag09d-post-correction-public-experience-audit-report.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag09f-controlled-publish-preparation-live-verification-plan.json");
const planPath = path.join(root, "data/content-intelligence/mutation-plans/ag09f-controlled-publish-preparation-live-verification-plan.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag09f-live-verification-readiness.json");
const nextBoundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag09f-to-ag09g-controlled-live-verification-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/controlled-publish-preparation-live-verification-plan.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag09f-controlled-publish-preparation-live-verification-plan-learning.json");
const registryPath = path.join(root, "data/quality/ag09f-controlled-publish-preparation-live-verification-plan.json");
const previewPath = path.join(root, "data/quality/ag09f-controlled-publish-preparation-live-verification-plan-preview.json");
const docPath = path.join(root, "docs/quality/AG09F_CONTROLLED_PUBLISH_PREPARATION_LIVE_VERIFICATION_PLAN.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG09F input ${name}: ${relativePath}`);
  }
}

const ag09eReview = readJson(inputs.ag09eReview);
const ag09eDecision = readJson(inputs.ag09eDecision);
const ag09eReadiness = readJson(inputs.ag09eReadiness);
const ag09eBoundary = readJson(inputs.ag09eBoundary);
const ag09dAudit = readJson(inputs.ag09dAudit);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag09eReview.status !== "editorial_publish_decision_boundary_created_not_approved") {
  throw new Error("AG09F requires AG09E decision boundary to be created and not approved.");
}

if (ag09eDecision.editorial_publish_candidate !== true) {
  throw new Error("AG09F requires article to be an editorial publish candidate.");
}

if (ag09eDecision.editorial_publish_approved !== false) {
  throw new Error("AG09F cannot proceed if AG09E already approved publishing.");
}

if (ag09eReadiness.status !== "eligible_for_editorial_publish_consideration_not_approved") {
  throw new Error("AG09F requires AG09E readiness boundary.");
}

if (ag09eBoundary.next_stage_id !== "AG09F" || ag09eBoundary.explicit_approval_required !== true) {
  throw new Error("AG09F requires AG09E to AG09F explicit boundary.");
}

if (ag09dAudit.status !== "post_correction_public_experience_audit_passed") {
  throw new Error("AG09F requires AG09D audit to pass.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) {
  throw new Error(`Selected article missing: ${selectedArticlePath}`);
}

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG09F selected article hash must match AG09C post-correction hash.");
}

const liveArticleUrl = `https://drishvara.com/${selectedArticlePath}`;

const noMutationControls = {
  publish_preparation_plan_only: true,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag09f: false,
  selected_article_file_write_performed_in_ag09f: false,
  homepage_mutation_performed_in_ag09f: false,
  css_mutation_performed_in_ag09f: false,
  js_mutation_performed_in_ag09f: false,
  reference_insertion_performed_in_ag09f: false,
  reference_url_change_performed_in_ag09f: false,
  visual_generation_performed_in_ag09f: false,
  image_asset_creation_performed_in_ag09f: false,
  image_insertion_performed_in_ag09f: false,
  live_url_fetch_performed_in_ag09f: false,
  deployment_trigger_performed_in_ag09f: false,
  production_jsonl_append_performed_in_ag09f: false,
  database_write_performed_in_ag09f: false,
  supabase_write_performed_in_ag09f: false,
  backend_auth_supabase_activation_performed_in_ag09f: false,
  public_publishing_performed_in_ag09f: false,
  publishing_approval_granted_in_ag09f: false,
  rollback_execution_performed_in_ag09f: false
};

const preparationChecks = [
  {
    check_id: "AG09F-CHECK-001",
    group: "source_readiness",
    name: "ag09e_decision_boundary_consumed",
    status: ag09eReview.status === "editorial_publish_decision_boundary_created_not_approved" ? "planned_ready" : "blocked",
    evidence: ag09eReview.status
  },
  {
    check_id: "AG09F-CHECK-002",
    group: "source_readiness",
    name: "ag09d_public_experience_audit_passed",
    status: ag09dAudit.status === "post_correction_public_experience_audit_passed" ? "planned_ready" : "blocked",
    evidence: ag09dAudit.status
  },
  {
    check_id: "AG09F-CHECK-003",
    group: "article_integrity",
    name: "selected_article_hash_matches_ag09c",
    status: articleHash === ag09cApply.post_correction_hash ? "planned_ready" : "blocked",
    evidence: articleHash
  },
  {
    check_id: "AG09F-CHECK-004",
    group: "publish_boundary",
    name: "publish_approval_remains_blocked",
    status: ag09eDecision.editorial_publish_approved === false ? "planned_ready" : "blocked",
    evidence: ag09eDecision.editorial_publish_approved
  },
  {
    check_id: "AG09F-CHECK-005",
    group: "system_boundary",
    name: "backend_database_supabase_activation_remains_blocked",
    status:
      ag09eReadiness.backend_activation_ready === false &&
      ag09eReadiness.database_activation_ready === false &&
      ag09eReadiness.supabase_activation_ready === false
        ? "planned_ready"
        : "blocked",
    evidence: {
      backend_activation_ready: ag09eReadiness.backend_activation_ready,
      database_activation_ready: ag09eReadiness.database_activation_ready,
      supabase_activation_ready: ag09eReadiness.supabase_activation_ready
    }
  }
];

const preparationReady = preparationChecks.every((check) => check.status === "planned_ready");

const liveVerificationChecklist = [
  {
    item_id: "AG09F-LIVE-001",
    area: "article_url",
    check: "Open the live article URL and confirm HTTP 200 / page loads.",
    target: liveArticleUrl,
    execution_status: "planned_not_executed"
  },
  {
    item_id: "AG09F-LIVE-002",
    area: "article_rendering",
    check: "Confirm title, article body, reference section, hero SVG, caption and visual credit render correctly.",
    target: liveArticleUrl,
    execution_status: "planned_not_executed"
  },
  {
    item_id: "AG09F-LIVE-003",
    area: "homepage_listing",
    check: "Open homepage and confirm the AG09C listing card/link is visible and points to the selected article.",
    target: "https://drishvara.com/",
    execution_status: "planned_not_executed"
  },
  {
    item_id: "AG09F-LIVE-004",
    area: "metadata",
    check: "Inspect rendered HTML and confirm canonical, description, OG and Twitter metadata exist.",
    target: liveArticleUrl,
    execution_status: "planned_not_executed"
  },
  {
    item_id: "AG09F-LIVE-005",
    area: "mobile_layout",
    check: "Check mobile viewport for overflow, distorted visual, broken text flow or card deformation.",
    target: liveArticleUrl,
    execution_status: "planned_not_executed"
  },
  {
    item_id: "AG09F-LIVE-006",
    area: "forbidden_systems",
    check: "Confirm no backend/Auth/Supabase/database path is activated as part of static article readiness.",
    target: "static deployment boundary",
    execution_status: "planned_not_executed"
  },
  {
    item_id: "AG09F-LIVE-007",
    area: "publish_decision",
    check: "Confirm final editorial publish approval remains a separate explicit decision after live verification.",
    target: "approval boundary",
    execution_status: "planned_not_executed"
  }
];

const plan = {
  module_id: "AG09F",
  title: "Controlled Publish Preparation and Live Verification Plan",
  status: preparationReady
    ? "publish_preparation_live_verification_plan_created_not_executed"
    : "publish_preparation_live_verification_plan_review_required",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09f: articleHash,
  live_article_url: liveArticleUrl,
  generated_from: inputs,
  preparation_checks: preparationChecks,
  live_verification_checklist: liveVerificationChecklist,
  manual_observation_requirements: [
    "Use browser visual review before final publish decision.",
    "Check desktop and mobile widths.",
    "Check that article page and homepage listing both resolve.",
    "Check that visible references and image credit are not confusing.",
    "Check that metadata/social preview tags are present in served HTML.",
    "Record evidence before any final publish approval."
  ],
  publish_preparation_principles: [
    "AG09F prepares verification only; it does not approve publishing.",
    "AG09F performs no live URL fetch.",
    "AG09F performs no file mutation.",
    "AG09F does not activate backend/Auth/Supabase/database systems.",
    "AG09F creates AG09G handoff for controlled live verification."
  ],
  ...noMutationControls
};

const readiness = {
  module_id: "AG09F",
  title: "Live Verification Readiness",
  status: preparationReady
    ? "live_verification_plan_ready_pending_explicit_ag09g"
    : "live_verification_plan_review_required",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09f: articleHash,
  live_article_url: liveArticleUrl,
  preparation_ready: preparationReady,
  publish_ready: false,
  publish_approval_granted: false,
  publish_readiness: "blocked_pending_live_verification_and_explicit_editorial_approval",
  live_url_fetch_performed: false,
  backend_activation_ready: false,
  database_activation_ready: false,
  supabase_activation_ready: false,
  ...noMutationControls
};

const nextBoundary = {
  module_id: "AG09F",
  title: "AG09F to AG09G Controlled Live Verification Boundary",
  status: "future_live_verification_boundary_created_not_executed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09f: articleHash,
  next_stage_id: "AG09G",
  next_stage_title: "Controlled Live Verification and Deployment Observation Audit",
  explicit_approval_required: true,
  ag09g_allowed_scope: [
    "Verify live article URL availability.",
    "Verify homepage/listing discoverability.",
    "Verify visible hero visual, caption and credit.",
    "Verify reference and metadata presence.",
    "Record manual or automated observation results.",
    "Keep final publish approval separate."
  ],
  ag09g_blocked_scope: [
    "No new article mutation.",
    "No homepage mutation.",
    "No CSS/JS mutation.",
    "No reference URL change.",
    "No new visual/image generation or insertion.",
    "No production JSONL append.",
    "No database/Supabase/backend/Auth activation.",
    "No final publish approval unless separately approved."
  ],
  ...noMutationControls
};

const schema = {
  module_id: "AG09F",
  title: "Controlled Publish Preparation and Live Verification Plan Schema",
  status: "schema_publish_preparation_plan_only",
  publish_preparation_plan_allowed_in_ag09f: true,
  live_verification_checklist_allowed_in_ag09f: true,
  ag09g_boundary_allowed_in_ag09f: true,
  article_mutation_allowed_in_ag09f: false,
  homepage_mutation_allowed_in_ag09f: false,
  css_js_mutation_allowed_in_ag09f: false,
  reference_insertion_allowed_in_ag09f: false,
  reference_url_change_allowed_in_ag09f: false,
  visual_generation_allowed_in_ag09f: false,
  image_asset_creation_allowed_in_ag09f: false,
  image_insertion_allowed_in_ag09f: false,
  live_url_fetch_allowed_in_ag09f: false,
  deployment_trigger_allowed_in_ag09f: false,
  production_jsonl_append_allowed_in_ag09f: false,
  database_write_allowed_in_ag09f: false,
  supabase_write_allowed_in_ag09f: false,
  backend_auth_supabase_activation_allowed_in_ag09f: false,
  publishing_allowed_in_ag09f: false,
  publishing_approval_allowed_in_ag09f: false,
  rollback_execution_allowed_in_ag09f: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09f: articleHash,
  live_article_url: liveArticleUrl,
  preparation_ready: preparationReady,
  checklist_item_count: liveVerificationChecklist.length,
  publish_readiness: readiness.publish_readiness,
  publish_approval_granted: false,
  public_publishing_performed: false,
  next_stage_id: "AG09G",
  next_stage_title: "Controlled Live Verification and Deployment Observation Audit",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG09F",
  title: "Controlled Publish Preparation and Live Verification Plan",
  status: plan.status,
  depends_on: ["AG09E", "AG09D", "AG09C"],
  generated_from: inputs,
  summary,
  plan_file: "data/content-intelligence/mutation-plans/ag09f-controlled-publish-preparation-live-verification-plan.json",
  readiness_file: "data/content-intelligence/quality-registry/ag09f-live-verification-readiness.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag09f-to-ag09g-controlled-live-verification-boundary.json",
  schema_file: "data/content-intelligence/schema/controlled-publish-preparation-live-verification-plan.schema.json",
  learning_file: "data/content-intelligence/learning/ag09f-controlled-publish-preparation-live-verification-plan-learning.json",
  closure_decision: {
    decision: preparationReady
      ? "ag09f_publish_preparation_plan_created_pending_explicit_live_verification"
      : "ag09f_publish_preparation_plan_review_required",
    proceed_to_ag09g_only_with_explicit_user_approval: true,
    publish_approval_granted: false,
    public_publishing_performed: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG09F",
  title: "Controlled Publish Preparation and Live Verification Plan Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "Publish preparation must remain separate from publish approval.",
    "Live verification should be planned before any final editorial publish decision.",
    "A static article may be deployed through GitHub/Vercel but still not editorially publish-approved.",
    "Backend/Auth/Supabase/database activation remains outside static article readiness."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG09F",
  title: "Controlled Publish Preparation and Live Verification Plan",
  status: plan.status,
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag09f-controlled-publish-preparation-live-verification-plan.json",
    plan: "data/content-intelligence/mutation-plans/ag09f-controlled-publish-preparation-live-verification-plan.json",
    readiness: "data/content-intelligence/quality-registry/ag09f-live-verification-readiness.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag09f-to-ag09g-controlled-live-verification-boundary.json",
    schema: "data/content-intelligence/schema/controlled-publish-preparation-live-verification-plan.schema.json",
    learning: "data/content-intelligence/learning/ag09f-controlled-publish-preparation-live-verification-plan-learning.json",
    preview: "data/quality/ag09f-controlled-publish-preparation-live-verification-plan-preview.json",
    document: "docs/quality/AG09F_CONTROLLED_PUBLISH_PREPARATION_LIVE_VERIFICATION_PLAN.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG09F",
  preview_only: true,
  status: plan.status,
  summary,
  preparation_checks: preparationChecks,
  live_verification_checklist: liveVerificationChecklist,
  ag09g_handoff: nextBoundary,
  ...noMutationControls
};

const doc = `# AG09F — Controlled Publish Preparation and Live Verification Plan

## Purpose

AG09F prepares the live-verification and final public-readiness checklist after AG09E.

AG09F is planning-only. It does not mutate files, fetch the live site, trigger deployment, activate backend/Auth/Supabase/database systems, approve publishing or publish anything.

## Target

- Selected article: \`${selectedArticlePath}\`
- Article hash: \`${articleHash}\`
- Planned live URL: \`${liveArticleUrl}\`

## Verification Checklist

AG09F records planned checks for article URL, homepage listing, metadata/social preview, hero visual, references, mobile layout and forbidden-system boundaries.

## Publish Boundary

Publishing remains blocked pending live verification and explicit editorial approval.

## Next Stage

AG09G — Controlled Live Verification and Deployment Observation Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(planPath, plan);
writeJson(readinessPath, readiness);
writeJson(nextBoundaryPath, nextBoundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG09F attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG09F controlled publish preparation and live verification plan artifacts generated.");
console.log(`✅ Planned live URL: ${liveArticleUrl}`);
console.log(`✅ Live verification checklist items: ${liveVerificationChecklist.length}`);
console.log("✅ Publish approval remains blocked.");
console.log("✅ No mutation, live fetch, deployment trigger, backend activation or publishing performed.");
console.log("✅ AG09G handoff created with explicit approval required.");
