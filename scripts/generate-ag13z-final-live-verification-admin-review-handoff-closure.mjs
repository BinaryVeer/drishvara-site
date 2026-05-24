import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag13cReview: "data/content-intelligence/quality-reviews/ag13c-controlled-live-preview-observation-audit.json",
  ag13cAudit: "data/content-intelligence/audit-records/ag13c-controlled-live-preview-observation-audit-report.json",
  ag13cObservation: "data/content-intelligence/quality-registry/ag13c-live-preview-observation-record.json",
  ag13cReadiness: "data/content-intelligence/quality-registry/ag13c-final-publish-decision-readiness-record.json",
  ag13cBoundary: "data/content-intelligence/mutation-plans/ag13c-to-ag13z-final-live-verification-publish-decision-closure-boundary.json",
  ag12cApply: "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json",
  ag12zState: "data/content-intelligence/object-registry/ag12z-refined-article-production-state-record.json"
};

const articleId = "enhancing-public-healthcare-delivery-digital-innovation";
const adminQueuePathRel = `data/admin-review/queue/${articleId}.json`;
const adminQueueIndexPathRel = "data/admin-review/index/admin-review-queue-index.json";

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag13z-final-live-verification-admin-review-handoff-closure.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag13z-final-live-verification-admin-review-handoff-closure.json");
const candidatePath = path.join(root, adminQueuePathRel);
const queueIndexPath = path.join(root, adminQueueIndexPathRel);
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag13z-admin-review-handoff-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag13z-to-ag14a-admin-review-queue-architecture-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/final-live-verification-admin-review-handoff-closure.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag13z-final-live-verification-admin-review-handoff-closure-learning.json");
const registryPath = path.join(root, "data/quality/ag13z-final-live-verification-admin-review-handoff-closure.json");
const previewPath = path.join(root, "data/quality/ag13z-final-live-verification-admin-review-handoff-closure-preview.json");
const docPath = path.join(root, "docs/quality/AG13Z_FINAL_LIVE_VERIFICATION_ADMIN_REVIEW_HANDOFF_CLOSURE.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG13Z input ${name}: ${relativePath}`);
}

const ag13cReview = readJson(inputs.ag13cReview);
const ag13cAudit = readJson(inputs.ag13cAudit);
const ag13cObservation = readJson(inputs.ag13cObservation);
const ag13cReadiness = readJson(inputs.ag13cReadiness);
const ag13cBoundary = readJson(inputs.ag13cBoundary);
const ag12cApply = readJson(inputs.ag12cApply);
const ag12zState = readJson(inputs.ag12zState);

if (ag13cReview.status !== "controlled_live_preview_observation_audit_passed") {
  throw new Error("AG13Z requires AG13C review.");
}
if (ag13cAudit.failed_checks.length !== 0) {
  throw new Error("AG13Z requires AG13C audit to pass with zero failed checks.");
}
if (ag13cReadiness.ready_for_ag13z !== true) {
  throw new Error("AG13Z requires AG13C readiness.");
}
if (ag13cBoundary.next_stage_id !== "AG13Z" || ag13cBoundary.explicit_approval_required !== true) {
  throw new Error("AG13Z requires AG13C to AG13Z explicit boundary.");
}

const selectedArticlePath = ag12cApply.selected_article_path;
const backupPath = ag12cApply.backup_path;

if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);
if (!exists(backupPath)) throw new Error(`Rollback backup missing: ${backupPath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
const backupHash = sha256(fs.readFileSync(path.join(root, backupPath), "utf8"));

if (articleHash !== ag12cApply.post_refinement_hash) {
  throw new Error("AG13Z requires local article hash to remain AG12C post-refinement hash.");
}
if (backupHash !== ag12cApply.pre_refinement_hash) {
  throw new Error("AG13Z requires rollback backup hash to remain AG12C pre-refinement hash.");
}

const scoreBreakdown = {
  content_editorial_readiness: 17,
  reference_and_credit_readiness: 17,
  object_layout_readiness: 18,
  live_preview_readiness: 20,
  rollback_and_governance_readiness: 10,
  admin_handoff_readiness: 10
};

const publishReadinessScore = Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0);

const hardBlockers = [];
const warnings = [
  "This candidate is not public-publish approved by AG13Z.",
  "Admin manual review is mandatory before any future public visibility decision.",
  "Current selected article is a pre-existing live static article; future generated articles should be routed to admin-only review before public exposure."
];

const stageControls = {
  final_live_verification_admin_review_handoff_closure_only: true,
  final_live_verification_closed_in_ag13z: true,
  admin_review_candidate_created_in_ag13z: true,
  publish_readiness_score_created_in_ag13z: true,
  admin_queue_index_created_in_ag13z: true,
  ag14a_boundary_created_in_ag13z: true,
  selected_article_read_performed: true,

  article_mutation_performed_in_ag13z: false,
  selected_article_file_write_performed_in_ag13z: false,
  object_generation_performed_in_ag13z: false,
  object_insertion_performed_in_ag13z: false,
  object_removal_performed_in_ag13z: false,
  image_generation_performed_in_ag13z: false,
  live_fetch_performed_in_ag13z: false,
  deployment_trigger_performed_in_ag13z: false,
  reference_url_change_performed_in_ag13z: false,
  homepage_mutation_performed_in_ag13z: false,
  css_file_mutation_performed_in_ag13z: false,
  js_file_mutation_performed_in_ag13z: false,
  production_jsonl_append_performed_in_ag13z: false,
  database_write_performed_in_ag13z: false,
  supabase_write_performed_in_ag13z: false,
  backend_auth_supabase_activation_performed_in_ag13z: false,
  public_publishing_operation_performed_in_ag13z: false
};

const adminCandidate = {
  module_id: "AG13Z",
  record_type: "admin_review_candidate_packet",
  article_id: articleId,
  title: "Enhancing Public Healthcare Delivery through Digital Innovation",
  category: "policy",
  status: "ready_for_admin_review",
  admin_visibility: "admin_review_only",
  public_visibility: false,
  publish_approved: false,
  publish_readiness_score: publishReadinessScore,
  score_out_of: 100,
  score_breakdown: scoreBreakdown,
  hard_blockers: hardBlockers,
  warnings,
  recommended_admin_action: "manual_review_required",
  available_admin_actions: [
    "archive",
    "return_for_correction",
    "publish",
    "publish_and_close"
  ],
  selected_article_path: selectedArticlePath,
  live_preview_url: ag13cObservation.live_url,
  live_preview_http_status: ag13cObservation.http_status,
  article_hash: articleHash,
  rollback_backup_path: backupPath,
  rollback_backup_hash: backupHash,
  refined_layout_state: {
    primary_visible_object_count: ag12zState.primary_visible_object_count,
    collapsed_pilot_object_count: ag12zState.collapsed_pilot_object_count,
    original_governed_markers_preserved_once: ag12zState.original_governed_markers_preserved_once,
    captions_credits_accessibility_preserved: ag12zState.captions_credits_accessibility_preserved
  },
  verification_summary: {
    ag13c_live_observation_passed: true,
    marker_level_live_validation_passed: ag13cObservation.observation_decision.marker_level_live_validation_passed,
    ready_for_admin_review: true,
    ready_for_automatic_public_publish: false
  },
  admin_decision: {
    decision_status: "pending_admin_decision",
    decision_by: null,
    decision_at: null,
    decision_remarks: null
  },
  current_selected_article_note: "This record is created for the currently governed article. Future generated articles should use the same queue packet structure before public visibility.",
  ...stageControls
};

const queueIndex = {
  module_id: "AG13Z",
  record_type: "admin_review_queue_index",
  status: "admin_review_queue_seeded",
  queue_scope: "static_governed_admin_review_queue_seed",
  total_candidates: 1,
  candidates: [
    {
      article_id: adminCandidate.article_id,
      title: adminCandidate.title,
      category: adminCandidate.category,
      status: adminCandidate.status,
      publish_readiness_score: adminCandidate.publish_readiness_score,
      public_visibility: adminCandidate.public_visibility,
      publish_approved: adminCandidate.publish_approved,
      candidate_file: adminQueuePathRel,
      live_preview_url: adminCandidate.live_preview_url
    }
  ],
  allowed_statuses: [
    "ready_for_admin_review",
    "returned_for_correction",
    "archived",
    "published",
    "published_closed"
  ],
  allowed_admin_actions: adminCandidate.available_admin_actions,
  ...stageControls
};

const readiness = {
  module_id: "AG13Z",
  title: "Admin Review Handoff Readiness Record",
  status: "ready_for_ag14a_admin_review_queue_architecture",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag13z: articleHash,
  admin_candidate_file: adminQueuePathRel,
  admin_queue_index_file: adminQueueIndexPathRel,
  publish_readiness_score: publishReadinessScore,
  hard_blockers_count: hardBlockers.length,
  ready_for_ag14a: true,
  ag14a_explicit_approval_required: true,
  publish_ready: false,
  publish_approval_required: true,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  reason_publish_blocked: "AG13Z hands the article to Admin Review Queue. Admin manual approval and future publishing-control architecture are required before public publish decision.",
  ...stageControls
};

const closure = {
  module_id: "AG13Z",
  title: "Final Live Verification and Admin Review Handoff Closure",
  status: "final_live_verification_closed_admin_review_handoff_created",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag13z: articleHash,
  closure_decision: {
    final_live_verification_closed: true,
    live_preview_observation_passed: true,
    admin_review_candidate_created: true,
    publish_readiness_score_created: true,
    ready_for_admin_review: true,
    publish_ready: false,
    publish_requires_admin_decision: true
  },
  admin_handoff: {
    candidate_file: adminQueuePathRel,
    queue_index_file: adminQueueIndexPathRel,
    admin_status: "ready_for_admin_review",
    available_admin_actions: adminCandidate.available_admin_actions
  },
  next_recommended_stage: "AG14A",
  next_recommended_stage_title: "Admin Review Queue and Publishing Control Architecture",
  ...stageControls
};

const boundary = {
  module_id: "AG13Z",
  title: "AG13Z to AG14A Admin Review Queue Architecture Boundary",
  status: "ag14a_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag13z: articleHash,
  next_stage_id: "AG14A",
  next_stage_title: "Admin Review Queue and Publishing Control Architecture",
  explicit_approval_required: true,
  ag14a_allowed_scope: [
    "Design admin review queue architecture.",
    "Define admin login/dashboard placement in current Drishvara UI.",
    "Define visibility states and admin decision model.",
    "Prepare Admin Review Queue UI scaffold boundary.",
    "Keep backend/Auth/Supabase activation blocked unless separately approved."
  ],
  ag14a_blocked_scope: [
    "No article mutation.",
    "No automatic publishing.",
    "No public visibility switch.",
    "No object generation.",
    "No CSS/JS mutation unless separately approved.",
    "No backend/Auth/Supabase/database activation unless separately approved."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG13Z",
  title: "Final Live Verification Admin Review Handoff Closure Schema",
  status: "schema_final_live_verification_admin_review_handoff_closure_only",
  final_live_verification_closure_allowed_in_ag13z: true,
  admin_candidate_packet_allowed_in_ag13z: true,
  admin_queue_index_allowed_in_ag13z: true,
  publish_readiness_score_allowed_in_ag13z: true,
  ag14a_boundary_allowed_in_ag13z: true,

  article_mutation_allowed_in_ag13z: false,
  automatic_publish_allowed_in_ag13z: false,
  public_visibility_switch_allowed_in_ag13z: false,
  object_generation_allowed_in_ag13z: false,
  object_insertion_allowed_in_ag13z: false,
  object_removal_allowed_in_ag13z: false,
  live_fetch_allowed_in_ag13z: false,
  deployment_trigger_allowed_in_ag13z: false,
  css_js_mutation_allowed_in_ag13z: false,
  reference_url_change_allowed_in_ag13z: false,
  database_write_allowed_in_ag13z: false,
  supabase_write_allowed_in_ag13z: false,
  backend_auth_supabase_activation_allowed_in_ag13z: false,
  public_publishing_operation_allowed_in_ag13z: false,
  ...stageControls
};

const review = {
  module_id: "AG13Z",
  title: "Final Live Verification and Admin Review Handoff Closure",
  status: "final_live_verification_closed_admin_review_handoff_created",
  depends_on: ["AG13C"],
  generated_from: inputs,
  closure_file: "data/content-intelligence/closure-records/ag13z-final-live-verification-admin-review-handoff-closure.json",
  admin_candidate_file: adminQueuePathRel,
  admin_queue_index_file: adminQueueIndexPathRel,
  readiness_file: "data/content-intelligence/quality-registry/ag13z-admin-review-handoff-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag13z-to-ag14a-admin-review-queue-architecture-boundary.json",
  schema_file: "data/content-intelligence/schema/final-live-verification-admin-review-handoff-closure.schema.json",
  summary: {
    selected_article_path: selectedArticlePath,
    article_hash_at_ag13z: articleHash,
    admin_candidate_created: true,
    publish_readiness_score: publishReadinessScore,
    hard_blockers_count: hardBlockers.length,
    publish_ready: false,
    ready_for_ag14a: true,
    next_stage_id: "AG14A",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG13Z",
  title: "Final Live Verification Admin Review Handoff Closure Learning",
  status: "learning_record_only",
  learning_points: [
    "Final live verification should hand off to admin review, not automatically publish.",
    "Admin review requires visibility states, decision actions and audit trail.",
    "Archived articles should remain available for learning and future reuse.",
    "Publish readiness score should support admin judgment but never replace admin approval.",
    "Future generated articles should be queued as admin-only before public visibility."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG13Z",
  title: "Final Live Verification and Admin Review Handoff Closure",
  status: "final_live_verification_closed_admin_review_handoff_created",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag13z-final-live-verification-admin-review-handoff-closure.json",
    closure: "data/content-intelligence/closure-records/ag13z-final-live-verification-admin-review-handoff-closure.json",
    admin_candidate: adminQueuePathRel,
    admin_queue_index: adminQueueIndexPathRel,
    readiness: "data/content-intelligence/quality-registry/ag13z-admin-review-handoff-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag13z-to-ag14a-admin-review-queue-architecture-boundary.json",
    schema: "data/content-intelligence/schema/final-live-verification-admin-review-handoff-closure.schema.json",
    learning: "data/content-intelligence/learning/ag13z-final-live-verification-admin-review-handoff-closure-learning.json",
    preview: "data/quality/ag13z-final-live-verification-admin-review-handoff-closure-preview.json",
    document: "docs/quality/AG13Z_FINAL_LIVE_VERIFICATION_ADMIN_REVIEW_HANDOFF_CLOSURE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG13Z",
  preview_only: true,
  status: "final_live_verification_closed_admin_review_handoff_created",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag13z: articleHash,
  admin_candidate_file: adminQueuePathRel,
  publish_readiness_score: publishReadinessScore,
  hard_blockers: hardBlockers,
  warnings,
  publish_ready: false,
  ready_for_ag14a: true,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG13Z — Final Live Verification and Admin Review Handoff Closure

## Purpose

AG13Z closes the final live verification chain and creates an Admin Review handoff packet.

AG13Z does not mutate articles, generate objects, insert objects, remove objects, change CSS/JS, fetch live URLs, trigger deployment, activate backend/Auth/Supabase/database systems or publish anything.

## Closure Result

The article has passed live verification and is handed to Admin Review Queue.

## Admin Review Candidate

Candidate file:

\`${adminQueuePathRel}\`

Queue index:

\`${adminQueueIndexPathRel}\`

## Publish Readiness

Publish readiness score: ${publishReadinessScore}/100

Hard blockers: ${hardBlockers.length}

Status: ready for admin review, not publish-approved.

## Admin Actions Planned

- Archive
- Return for correction
- Publish
- Publish and close

## Publishing Boundary

Publishing remains blocked. Backend, Auth, database and Supabase activation remain blocked.

## Next Stage

AG14A — Admin Review Queue and Publishing Control Architecture — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(closurePath, closure);
writeJson(candidatePath, adminCandidate);
writeJson(queueIndexPath, queueIndex);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG13Z final live verification and admin review handoff closure artifacts generated.");
console.log("✅ Admin Review Candidate Packet created.");
console.log(`✅ Candidate: ${adminQueuePathRel}`);
console.log(`✅ Publish readiness score: ${publishReadinessScore}/100`);
console.log("✅ Admin actions prepared: Archive, Return for correction, Publish, Publish and close.");
console.log("✅ Publishing remains blocked pending Admin decision.");
console.log("✅ Backend and Supabase activation remain blocked.");
console.log("✅ No article mutation, public visibility switch, deployment trigger or publishing performed.");
console.log("✅ AG14A Admin Review Queue Architecture boundary created with explicit approval required.");
