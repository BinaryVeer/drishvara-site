import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag14dReview: "data/content-intelligence/quality-reviews/ag14d-public-signin-internal-admin-route-separation-apply.json",
  ag14dApply: "data/content-intelligence/apply-records/ag14d-public-signin-internal-admin-route-separation-apply.json",
  ag14dRouteRecord: "data/content-intelligence/admin-architecture/ag14d-public-signin-internal-admin-route-separation-record.json",
  ag14dReadiness: "data/content-intelligence/quality-registry/ag14d-route-separation-apply-readiness-record.json",
  ag14dBoundary: "data/content-intelligence/mutation-plans/ag14d-to-ag14e-admin-editor-decision-workflow-model-boundary.json",
  ag14aRoleRights: "data/content-intelligence/admin-architecture/ag14a-admin-editor-role-rights-matrix.json",
  ag14aWorkflow: "data/content-intelligence/admin-architecture/ag14a-admin-editor-workflow-state-model.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  ag13zQueueIndex: "data/admin-review/index/admin-review-queue-index.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag14e-admin-editor-decision-submission-workflow-model.json");
const adminDecisionPath = path.join(root, "data/content-intelligence/admin-architecture/ag14e-admin-decision-state-transition-model.json");
const editorWorkflowPath = path.join(root, "data/content-intelligence/admin-architecture/ag14e-editor-submission-correction-workflow-model.json");
const auditVersioningPath = path.join(root, "data/content-intelligence/admin-architecture/ag14e-audit-trail-versioning-model.json");
const queueTaxonomyPath = path.join(root, "data/content-intelligence/admin-architecture/ag14e-queue-and-status-taxonomy-model.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag14e-workflow-model-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag14e-to-ag14f-workflow-model-audit-secure-action-handler-readiness-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/admin-editor-decision-submission-workflow-model.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag14e-admin-editor-decision-submission-workflow-model-learning.json");
const registryPath = path.join(root, "data/quality/ag14e-admin-editor-decision-submission-workflow-model.json");
const previewPath = path.join(root, "data/quality/ag14e-admin-editor-decision-submission-workflow-model-preview.json");
const docPath = path.join(root, "docs/quality/AG14E_ADMIN_EDITOR_DECISION_SUBMISSION_WORKFLOW_MODEL.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG14E input ${name}: ${relativePath}`);
}

const ag14dReview = readJson(inputs.ag14dReview);
const ag14dApply = readJson(inputs.ag14dApply);
const ag14dRouteRecord = readJson(inputs.ag14dRouteRecord);
const ag14dReadiness = readJson(inputs.ag14dReadiness);
const ag14dBoundary = readJson(inputs.ag14dBoundary);
const ag14aRoleRights = readJson(inputs.ag14aRoleRights);
const ag14aWorkflow = readJson(inputs.ag14aWorkflow);
const ag13zCandidate = readJson(inputs.ag13zCandidate);
const ag13zQueueIndex = readJson(inputs.ag13zQueueIndex);

if (ag14dReview.status !== "public_signin_internal_admin_route_separation_applied_pending_audit") {
  throw new Error("AG14E requires AG14D review.");
}
if (ag14dReadiness.ready_for_ag14e !== true) {
  throw new Error("AG14E requires AG14D readiness.");
}
if (ag14dBoundary.next_stage_id !== "AG14E" || ag14dBoundary.explicit_approval_required !== true) {
  throw new Error("AG14E requires AG14D to AG14E explicit boundary.");
}
if (ag14dRouteRecord.public_signin_route !== "signin.html" || ag14dRouteRecord.internal_admin_route !== "admin.html") {
  throw new Error("AG14E requires route separation from AG14D.");
}

const selectedArticlePath = ag13zCandidate.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG14E requires article hash to match AG13Z candidate hash.");
}

const stageControls = {
  admin_editor_decision_submission_workflow_model_only: true,
  admin_decision_model_created_in_ag14e: true,
  editor_submission_workflow_created_in_ag14e: true,
  audit_trail_versioning_model_created_in_ag14e: true,
  queue_status_taxonomy_created_in_ag14e: true,
  ag14f_boundary_created_in_ag14e: true,
  selected_article_read_performed: true,

  admin_action_execution_performed_in_ag14e: false,
  editor_action_execution_performed_in_ag14e: false,
  article_mutation_performed_in_ag14e: false,
  queue_mutation_performed_in_ag14e: false,
  public_visibility_switch_performed_in_ag14e: false,
  public_publishing_operation_performed_in_ag14e: false,
  real_credential_created_in_ag14e: false,
  hardcoded_password_created_in_ag14e: false,
  password_hash_created_in_repo_in_ag14e: false,
  auth_activation_performed_in_ag14e: false,
  backend_activation_performed_in_ag14e: false,
  supabase_activation_performed_in_ag14e: false,
  database_write_performed_in_ag14e: false,
  deployment_trigger_performed_in_ag14e: false
};

const adminDecisionModel = {
  module_id: "AG14E",
  title: "Admin Decision State Transition Model",
  status: "admin_decision_state_transition_model_defined",
  source_admin_actions: ag14aRoleRights.admin_actions,
  admin_role_principle: "Admin alone controls public visibility and final publication decision.",
  admin_actions: [
    {
      action: "archive",
      allowed_from_statuses: ["ready_for_admin_review", "submitted_to_admin", "resubmitted_to_admin", "returned_for_correction"],
      resulting_status: "archived",
      public_visibility_after_action: false,
      required_fields: ["admin_decision_remarks", "archive_reason"],
      creates_editor_task: false,
      closes_admin_review: true,
      audit_required: true,
      execution_available_in_ag14e: false
    },
    {
      action: "return_for_correction",
      allowed_from_statuses: ["ready_for_admin_review", "submitted_to_admin", "resubmitted_to_admin"],
      resulting_status: "returned_for_correction",
      public_visibility_after_action: false,
      required_fields: ["admin_decision_remarks", "correction_category", "correction_priority"],
      creates_editor_task: true,
      editor_queue_target: "editor_correction_queue",
      closes_admin_review: false,
      audit_required: true,
      execution_available_in_ag14e: false
    },
    {
      action: "publish",
      allowed_from_statuses: ["ready_for_admin_review", "submitted_to_admin", "resubmitted_to_admin"],
      resulting_status: "published",
      public_visibility_after_action: true,
      required_fields: ["admin_decision_remarks", "publish_confirmation"],
      creates_editor_task: false,
      closes_admin_review: false,
      audit_required: true,
      execution_available_in_ag14e: false
    },
    {
      action: "publish_and_close",
      allowed_from_statuses: ["ready_for_admin_review", "submitted_to_admin", "resubmitted_to_admin"],
      resulting_status: "published_closed",
      public_visibility_after_action: true,
      required_fields: ["admin_decision_remarks", "publish_confirmation", "closure_confirmation"],
      creates_editor_task: false,
      closes_admin_review: true,
      audit_required: true,
      execution_available_in_ag14e: false
    }
  ],
  correction_categories: [
    "editorial_issue",
    "reference_issue",
    "object_layout_issue",
    "mobile_preview_issue",
    "tone_positioning_issue",
    "publish_risk_issue",
    "metadata_seo_issue",
    "other"
  ],
  correction_priorities: ["low", "medium", "high", "blocker"],
  hard_publish_blockers: [
    "missing_admin_approval",
    "missing_audit_trail",
    "missing_article_hash",
    "missing_rollback_record",
    "known_broken_reference",
    "missing_required_credit",
    "mobile_layout_failed",
    "unsupported_claim_flagged"
  ],
  ...stageControls
};

const editorSubmissionWorkflow = {
  module_id: "AG14E",
  title: "Editor Submission and Correction Workflow Model",
  status: "editor_submission_correction_workflow_model_defined",
  source_editor_actions: ag14aRoleRights.editor_actions,
  editor_role_principle: "Editor can create and correct content manually, but cannot publish.",
  editor_actions: [
    {
      action: "create_manual_article",
      allowed_from_statuses: ["none"],
      resulting_status: "editor_draft",
      public_visibility_after_action: false,
      required_fields: ["title", "category", "body", "editor_identifier"],
      admin_review_required: true,
      execution_available_in_ag14e: false
    },
    {
      action: "save_draft",
      allowed_from_statuses: ["editor_draft", "editor_revision"],
      resulting_status: "same_status",
      public_visibility_after_action: false,
      required_fields: ["draft_content", "editor_identifier"],
      admin_review_required: false,
      execution_available_in_ag14e: false
    },
    {
      action: "preview",
      allowed_from_statuses: ["editor_draft", "editor_revision", "returned_for_correction"],
      resulting_status: "same_status",
      public_visibility_after_action: false,
      required_fields: ["preview_mode"],
      admin_review_required: false,
      execution_available_in_ag14e: false
    },
    {
      action: "submit_to_admin",
      allowed_from_statuses: ["editor_draft"],
      resulting_status: "ready_for_admin_review",
      intermediate_status: "submitted_to_admin",
      public_visibility_after_action: false,
      required_fields: ["editor_submission_remarks", "article_version", "article_hash"],
      admin_review_required: true,
      execution_available_in_ag14e: false
    },
    {
      action: "edit_returned_article",
      allowed_from_statuses: ["returned_for_correction"],
      resulting_status: "editor_revision",
      public_visibility_after_action: false,
      required_fields: ["admin_return_reference", "editor_identifier"],
      admin_review_required: true,
      execution_available_in_ag14e: false
    },
    {
      action: "resubmit_to_admin",
      allowed_from_statuses: ["editor_revision"],
      resulting_status: "ready_for_admin_review",
      intermediate_status: "resubmitted_to_admin",
      public_visibility_after_action: false,
      required_fields: ["editor_revision_remarks", "corrected_article_version", "corrected_article_hash"],
      admin_review_required: true,
      execution_available_in_ag14e: false
    }
  ],
  editor_blocked_actions: [
    "publish",
    "publish_and_close",
    "approve_public_visibility",
    "delete_audit_trail",
    "reset_admin_credential"
  ],
  manual_article_required_sections: [
    "title",
    "category",
    "summary",
    "body",
    "references_or_source_notes",
    "caption_credit_alt_text_if_objects_used",
    "seo_title",
    "seo_description",
    "editor_submission_remarks"
  ],
  ...stageControls
};

const auditTrailVersioning = {
  module_id: "AG14E",
  title: "Audit Trail and Versioning Model",
  status: "audit_trail_versioning_model_defined",
  audit_record_required_for_actions: [
    "archive",
    "return_for_correction",
    "publish",
    "publish_and_close",
    "create_manual_article",
    "save_draft",
    "submit_to_admin",
    "edit_returned_article",
    "resubmit_to_admin"
  ],
  audit_required_fields: [
    "audit_id",
    "article_id",
    "article_origin",
    "version",
    "actor_role",
    "actor_identifier",
    "action",
    "decision_or_submission_remarks",
    "timestamp",
    "previous_status",
    "new_status",
    "pre_action_hash",
    "post_action_hash",
    "public_visibility_before",
    "public_visibility_after",
    "hard_blockers_at_action_time"
  ],
  versioning_rules: [
    {
      version: "v1",
      meaning: "Original pipeline-generated or editor-created draft.",
      created_by: "pipeline_or_editor"
    },
    {
      version: "v2",
      meaning: "First editor correction after Admin return.",
      created_by: "editor"
    },
    {
      version: "v3_plus",
      meaning: "Further corrections if Admin returns again.",
      created_by: "editor"
    }
  ],
  hash_rules: [
    "Every submit/resubmit/publish/archive decision must record pre/post article hash.",
    "Admin must see version identity before publish decision.",
    "Returned-for-correction tasks must preserve Admin remarks and prior version hash.",
    "Archived items must retain full content, score, remarks and audit trail for future intelligence."
  ],
  audit_storage_recommendation: "Static JSON audit records first; secure database/Supabase audit table later after explicit Auth/backend activation.",
  ...stageControls
};

const queueStatusTaxonomy = {
  module_id: "AG14E",
  title: "Queue and Status Taxonomy Model",
  status: "queue_status_taxonomy_model_defined",
  seed_queue_source: inputs.ag13zQueueIndex,
  seed_candidate: {
    article_id: ag13zCandidate.article_id,
    status: ag13zCandidate.status,
    publish_readiness_score: ag13zCandidate.publish_readiness_score,
    public_visibility: ag13zCandidate.public_visibility,
    publish_approved: ag13zCandidate.publish_approved
  },
  queues: [
    {
      queue: "admin_review_queue",
      statuses: ["ready_for_admin_review", "submitted_to_admin", "resubmitted_to_admin"],
      visible_to: ["admin"],
      public_visibility: false
    },
    {
      queue: "editor_draft_queue",
      statuses: ["editor_draft"],
      visible_to: ["editor"],
      public_visibility: false
    },
    {
      queue: "editor_correction_queue",
      statuses: ["returned_for_correction", "editor_revision"],
      visible_to: ["editor", "admin"],
      public_visibility: false
    },
    {
      queue: "archive_queue",
      statuses: ["archived"],
      visible_to: ["admin"],
      public_visibility: false
    },
    {
      queue: "published_queue",
      statuses: ["published", "published_closed"],
      visible_to: ["admin", "public_if_published"],
      public_visibility: true
    }
  ],
  canonical_statuses: [
    "pipeline_verified",
    "editor_draft",
    "submitted_to_admin",
    "ready_for_admin_review",
    "returned_for_correction",
    "editor_revision",
    "resubmitted_to_admin",
    "archived",
    "published",
    "published_closed"
  ],
  visibility_principle: "No article becomes public merely by being generated, edited or submitted. Public visibility requires Admin publish or publish_and_close action through a future secure action handler.",
  ...stageControls
};

const readiness = {
  module_id: "AG14E",
  title: "Workflow Model Readiness Record",
  status: "ready_for_ag14f_workflow_model_audit_secure_action_handler_readiness",
  ready_for_ag14f: true,
  ag14f_explicit_approval_required: true,
  workflow_model_complete: true,
  admin_decision_model_defined: true,
  editor_submission_model_defined: true,
  audit_trail_versioning_defined: true,
  queue_status_taxonomy_defined: true,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  publish_ready: false,
  reason: "AG14E defines the workflow model only. AG14F should audit the model and define secure action handler readiness without executing actions.",
  ...stageControls
};

const boundary = {
  module_id: "AG14E",
  title: "AG14E to AG14F Workflow Model Audit and Secure Action Handler Readiness Boundary",
  status: "ag14f_boundary_created_not_started",
  next_stage_id: "AG14F",
  next_stage_title: "Admin Editor Workflow Model Audit and Secure Action Handler Readiness",
  explicit_approval_required: true,
  ag14f_allowed_scope: [
    "Audit Admin decision workflow model.",
    "Audit Editor creation/correction/submission workflow model.",
    "Audit audit-trail and versioning rules.",
    "Define secure action handler readiness requirements.",
    "Confirm no actions are executable until secure backend/Auth path is approved."
  ],
  ag14f_blocked_scope: [
    "No real credential creation.",
    "No hardcoded passwords.",
    "No Auth/backend/Supabase activation.",
    "No Admin action execution.",
    "No Editor action execution.",
    "No article publishing.",
    "No public visibility switch for article candidates."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG14E",
  title: "Admin Editor Decision Submission Workflow Model Schema",
  status: "schema_admin_editor_decision_submission_workflow_model_only",
  admin_decision_model_allowed_in_ag14e: true,
  editor_submission_workflow_allowed_in_ag14e: true,
  audit_trail_versioning_model_allowed_in_ag14e: true,
  queue_status_taxonomy_model_allowed_in_ag14e: true,
  ag14f_boundary_allowed_in_ag14e: true,

  admin_action_execution_allowed_in_ag14e: false,
  editor_action_execution_allowed_in_ag14e: false,
  article_mutation_allowed_in_ag14e: false,
  queue_mutation_allowed_in_ag14e: false,
  public_visibility_switch_allowed_in_ag14e: false,
  public_publishing_operation_allowed_in_ag14e: false,
  real_credential_creation_allowed_in_ag14e: false,
  hardcoded_password_allowed_in_ag14e: false,
  password_hash_commit_allowed_in_ag14e: false,
  auth_activation_allowed_in_ag14e: false,
  backend_activation_allowed_in_ag14e: false,
  supabase_activation_allowed_in_ag14e: false,
  database_write_allowed_in_ag14e: false,
  ...stageControls
};

const review = {
  module_id: "AG14E",
  title: "Admin Editor Decision and Submission Workflow Model",
  status: "admin_editor_decision_submission_workflow_model_defined",
  depends_on: ["AG14D"],
  generated_from: inputs,
  admin_decision_model_file: "data/content-intelligence/admin-architecture/ag14e-admin-decision-state-transition-model.json",
  editor_workflow_file: "data/content-intelligence/admin-architecture/ag14e-editor-submission-correction-workflow-model.json",
  audit_versioning_file: "data/content-intelligence/admin-architecture/ag14e-audit-trail-versioning-model.json",
  queue_taxonomy_file: "data/content-intelligence/admin-architecture/ag14e-queue-and-status-taxonomy-model.json",
  readiness_file: "data/content-intelligence/quality-registry/ag14e-workflow-model-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag14e-to-ag14f-workflow-model-audit-secure-action-handler-readiness-boundary.json",
  schema_file: "data/content-intelligence/schema/admin-editor-decision-submission-workflow-model.schema.json",
  summary: {
    admin_actions_defined: adminDecisionModel.admin_actions.map((a) => a.action),
    editor_actions_defined: editorSubmissionWorkflow.editor_actions.map((a) => a.action),
    queues_defined: queueStatusTaxonomy.queues.map((q) => q.queue),
    ready_for_ag14f: true,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG14E",
  title: "Admin Editor Decision Submission Workflow Model Learning",
  status: "learning_record_only",
  learning_points: [
    "Return for correction should route to manual Editor correction workspace, not automatic regeneration.",
    "Editor can manually create original articles but cannot publish them.",
    "Admin publish and publish_and_close are different: publish may keep item manageable, publish_and_close closes the workflow.",
    "Archive must retain intelligence, score, remarks and version history.",
    "Workflow action execution requires a secure handler and must not run from static client code."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG14E",
  title: "Admin Editor Decision and Submission Workflow Model",
  status: "admin_editor_decision_submission_workflow_model_defined",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag14e-admin-editor-decision-submission-workflow-model.json",
    admin_decision_model: "data/content-intelligence/admin-architecture/ag14e-admin-decision-state-transition-model.json",
    editor_workflow: "data/content-intelligence/admin-architecture/ag14e-editor-submission-correction-workflow-model.json",
    audit_versioning: "data/content-intelligence/admin-architecture/ag14e-audit-trail-versioning-model.json",
    queue_taxonomy: "data/content-intelligence/admin-architecture/ag14e-queue-and-status-taxonomy-model.json",
    readiness: "data/content-intelligence/quality-registry/ag14e-workflow-model-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag14e-to-ag14f-workflow-model-audit-secure-action-handler-readiness-boundary.json",
    schema: "data/content-intelligence/schema/admin-editor-decision-submission-workflow-model.schema.json",
    learning: "data/content-intelligence/learning/ag14e-admin-editor-decision-submission-workflow-model-learning.json",
    preview: "data/quality/ag14e-admin-editor-decision-submission-workflow-model-preview.json",
    document: "docs/quality/AG14E_ADMIN_EDITOR_DECISION_SUBMISSION_WORKFLOW_MODEL.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG14E",
  preview_only: true,
  status: "admin_editor_decision_submission_workflow_model_defined",
  admin_actions: adminDecisionModel.admin_actions.map((a) => a.action),
  editor_actions: editorSubmissionWorkflow.editor_actions.map((a) => a.action),
  queues: queueStatusTaxonomy.queues.map((q) => q.queue),
  real_auth_active: false,
  action_execution_available: false,
  publish_ready: false,
  ready_for_ag14f: true,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG14E — Admin Editor Decision and Submission Workflow Model

## Purpose

AG14E defines the Admin and Editor workflow model.

AG14E is model-only. It does not execute Admin actions, execute Editor actions, mutate articles, switch public visibility, create credentials, activate Auth/backend/Supabase/database systems or publish anything.

## Admin Actions

- Archive
- Return for correction
- Publish
- Publish and close

## Editor Actions

- Create manual article
- Save draft
- Preview
- Submit to Admin
- Edit returned article
- Resubmit to Admin

## Workflow Principle

Pipeline can generate. Editor can create and correct. Admin alone can publish. Archive preserves intelligence and audit evidence.

## Audit and Versioning

Every future action must record actor, role, remarks, status transition, pre/post hashes, version and visibility state.

## Next Stage

AG14F — Admin Editor Workflow Model Audit and Secure Action Handler Readiness — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(adminDecisionPath, adminDecisionModel);
writeJson(editorWorkflowPath, editorSubmissionWorkflow);
writeJson(auditVersioningPath, auditTrailVersioning);
writeJson(queueTaxonomyPath, queueStatusTaxonomy);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG14E Admin Editor Decision and Submission Workflow Model generated.");
console.log("✅ Admin actions defined: Archive, Return for correction, Publish, Publish and close.");
console.log("✅ Editor actions defined: Create manual article, Save draft, Preview, Submit/Resubmit to Admin.");
console.log("✅ Audit trail, versioning and queue/status taxonomy defined.");
console.log("✅ No action execution, article mutation, credential creation, Auth/backend/Supabase activation or publishing performed.");
console.log("✅ AG14F Workflow Model Audit and Secure Action Handler Readiness boundary created with explicit approval required.");
