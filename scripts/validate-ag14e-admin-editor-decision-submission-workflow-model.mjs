import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag14d-public-signin-internal-admin-route-separation-apply.json",
  "data/content-intelligence/apply-records/ag14d-public-signin-internal-admin-route-separation-apply.json",
  "data/content-intelligence/admin-architecture/ag14d-public-signin-internal-admin-route-separation-record.json",
  "data/content-intelligence/quality-registry/ag14d-route-separation-apply-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14d-to-ag14e-admin-editor-decision-workflow-model-boundary.json",
  "data/content-intelligence/admin-architecture/ag14a-admin-editor-role-rights-matrix.json",
  "data/content-intelligence/admin-architecture/ag14a-admin-editor-workflow-state-model.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  "data/admin-review/index/admin-review-queue-index.json",

  "data/content-intelligence/quality-reviews/ag14e-admin-editor-decision-submission-workflow-model.json",
  "data/content-intelligence/admin-architecture/ag14e-admin-decision-state-transition-model.json",
  "data/content-intelligence/admin-architecture/ag14e-editor-submission-correction-workflow-model.json",
  "data/content-intelligence/admin-architecture/ag14e-audit-trail-versioning-model.json",
  "data/content-intelligence/admin-architecture/ag14e-queue-and-status-taxonomy-model.json",
  "data/content-intelligence/quality-registry/ag14e-workflow-model-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14e-to-ag14f-workflow-model-audit-secure-action-handler-readiness-boundary.json",
  "data/content-intelligence/schema/admin-editor-decision-submission-workflow-model.schema.json",
  "data/content-intelligence/learning/ag14e-admin-editor-decision-submission-workflow-model-learning.json",
  "data/quality/ag14e-admin-editor-decision-submission-workflow-model.json",
  "data/quality/ag14e-admin-editor-decision-submission-workflow-model-preview.json",
  "docs/quality/AG14E_ADMIN_EDITOR_DECISION_SUBMISSION_WORKFLOW_MODEL.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG14E validation failed: ${message}`);
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

const ag14dReview = readJson("data/content-intelligence/quality-reviews/ag14d-public-signin-internal-admin-route-separation-apply.json");
const ag14dRouteRecord = readJson("data/content-intelligence/admin-architecture/ag14d-public-signin-internal-admin-route-separation-record.json");
const ag14dReadiness = readJson("data/content-intelligence/quality-registry/ag14d-route-separation-apply-readiness-record.json");
const ag14dBoundary = readJson("data/content-intelligence/mutation-plans/ag14d-to-ag14e-admin-editor-decision-workflow-model-boundary.json");
const ag14aRoleRights = readJson("data/content-intelligence/admin-architecture/ag14a-admin-editor-role-rights-matrix.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag14e-admin-editor-decision-submission-workflow-model.json");
const adminDecision = readJson("data/content-intelligence/admin-architecture/ag14e-admin-decision-state-transition-model.json");
const editorWorkflow = readJson("data/content-intelligence/admin-architecture/ag14e-editor-submission-correction-workflow-model.json");
const auditVersioning = readJson("data/content-intelligence/admin-architecture/ag14e-audit-trail-versioning-model.json");
const queueTaxonomy = readJson("data/content-intelligence/admin-architecture/ag14e-queue-and-status-taxonomy-model.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag14e-workflow-model-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag14e-to-ag14f-workflow-model-audit-secure-action-handler-readiness-boundary.json");
const schema = readJson("data/content-intelligence/schema/admin-editor-decision-submission-workflow-model.schema.json");
const learning = readJson("data/content-intelligence/learning/ag14e-admin-editor-decision-submission-workflow-model-learning.json");
const registry = readJson("data/quality/ag14e-admin-editor-decision-submission-workflow-model.json");
const preview = readJson("data/quality/ag14e-admin-editor-decision-submission-workflow-model-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG14E_ADMIN_EDITOR_DECISION_SUBMISSION_WORKFLOW_MODEL.md"), "utf8");

for (const obj of [review, adminDecision, editorWorkflow, auditVersioning, queueTaxonomy, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG14E") fail(`module_id must be AG14E in ${obj.title || "object"}`);
}

if (ag14dReview.status !== "public_signin_internal_admin_route_separation_applied_pending_audit") fail("AG14D review status mismatch");
if (ag14dReadiness.ready_for_ag14e !== true) fail("AG14D readiness for AG14E missing");
if (ag14dBoundary.next_stage_id !== "AG14E") fail("AG14E boundary missing in AG14D");
if (ag14dRouteRecord.public_signin_route !== "signin.html") fail("AG14D public route mismatch");
if (ag14dRouteRecord.internal_admin_route !== "admin.html") fail("AG14D internal route mismatch");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const articleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (articleHash !== ag13zCandidate.article_hash) fail("Article hash must match AG13Z candidate hash");

if (review.status !== "admin_editor_decision_submission_workflow_model_defined") fail("Review status mismatch");
if (adminDecision.status !== "admin_decision_state_transition_model_defined") fail("Admin decision status mismatch");
if (editorWorkflow.status !== "editor_submission_correction_workflow_model_defined") fail("Editor workflow status mismatch");
if (auditVersioning.status !== "audit_trail_versioning_model_defined") fail("Audit/versioning status mismatch");
if (queueTaxonomy.status !== "queue_status_taxonomy_model_defined") fail("Queue taxonomy status mismatch");
if (readiness.status !== "ready_for_ag14f_workflow_model_audit_secure_action_handler_readiness") fail("Readiness status mismatch");

const adminActions = adminDecision.admin_actions.map((action) => action.action);
for (const action of ["archive", "return_for_correction", "publish", "publish_and_close"]) {
  if (!adminActions.includes(action)) fail(`Admin action missing: ${action}`);
  if (!ag14aRoleRights.admin_actions.includes(action)) fail(`Admin action not inherited from AG14A: ${action}`);
}

const returnAction = adminDecision.admin_actions.find((action) => action.action === "return_for_correction");
if (returnAction.creates_editor_task !== true) fail("Return for correction must create editor task");
if (returnAction.editor_queue_target !== "editor_correction_queue") fail("Return for correction must target editor correction queue");
if (!returnAction.required_fields.includes("admin_decision_remarks")) fail("Return for correction must require admin remarks");

const publishAction = adminDecision.admin_actions.find((action) => action.action === "publish");
if (publishAction.public_visibility_after_action !== true) fail("Publish must model public visibility true");
if (publishAction.execution_available_in_ag14e !== false) fail("Publish execution must be unavailable in AG14E");

const editorActions = editorWorkflow.editor_actions.map((action) => action.action);
for (const action of ["create_manual_article", "save_draft", "preview", "submit_to_admin", "edit_returned_article", "resubmit_to_admin"]) {
  if (!editorActions.includes(action)) fail(`Editor action missing: ${action}`);
}

const createAction = editorWorkflow.editor_actions.find((action) => action.action === "create_manual_article");
if (createAction.resulting_status !== "editor_draft") fail("Manual creation must result in editor_draft");
const resubmitAction = editorWorkflow.editor_actions.find((action) => action.action === "resubmit_to_admin");
if (resubmitAction.resulting_status !== "ready_for_admin_review") fail("Resubmit must return to Admin review");
if (!editorWorkflow.editor_blocked_actions.includes("publish")) fail("Editor must be blocked from publish");
if (!editorWorkflow.editor_blocked_actions.includes("publish_and_close")) fail("Editor must be blocked from publish_and_close");

for (const field of ["actor_role", "actor_identifier", "action", "timestamp", "pre_action_hash", "post_action_hash", "previous_status", "new_status"]) {
  if (!auditVersioning.audit_required_fields.includes(field)) fail(`Audit required field missing: ${field}`);
}
if (!auditVersioning.audit_record_required_for_actions.includes("publish_and_close")) fail("Audit must cover publish_and_close");
if (!auditVersioning.audit_record_required_for_actions.includes("resubmit_to_admin")) fail("Audit must cover resubmit_to_admin");

const queues = queueTaxonomy.queues.map((queue) => queue.queue);
for (const queue of ["admin_review_queue", "editor_draft_queue", "editor_correction_queue", "archive_queue", "published_queue"]) {
  if (!queues.includes(queue)) fail(`Queue missing: ${queue}`);
}
if (!queueTaxonomy.canonical_statuses.includes("published_closed")) fail("published_closed status missing");
if (!queueTaxonomy.canonical_statuses.includes("returned_for_correction")) fail("returned_for_correction status missing");

if (readiness.ready_for_ag14f !== true) fail("AG14F readiness missing");
if (readiness.real_auth_ready !== false) fail("Real auth must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag14f_boundary_created_not_started") fail("AG14F boundary status mismatch");
if (boundary.next_stage_id !== "AG14F") fail("AG14F handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG14F explicit approval missing");

if (schema.status !== "schema_admin_editor_decision_submission_workflow_model_only") fail("Schema status mismatch");

for (const key of [
  "admin_decision_model_allowed_in_ag14e",
  "editor_submission_workflow_allowed_in_ag14e",
  "audit_trail_versioning_model_allowed_in_ag14e",
  "queue_status_taxonomy_model_allowed_in_ag14e",
  "ag14f_boundary_allowed_in_ag14e"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "admin_action_execution_allowed_in_ag14e",
  "editor_action_execution_allowed_in_ag14e",
  "article_mutation_allowed_in_ag14e",
  "queue_mutation_allowed_in_ag14e",
  "public_visibility_switch_allowed_in_ag14e",
  "public_publishing_operation_allowed_in_ag14e",
  "real_credential_creation_allowed_in_ag14e",
  "hardcoded_password_allowed_in_ag14e",
  "password_hash_commit_allowed_in_ag14e",
  "auth_activation_allowed_in_ag14e",
  "backend_activation_allowed_in_ag14e",
  "supabase_activation_allowed_in_ag14e",
  "database_write_allowed_in_ag14e"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, adminDecision, editorWorkflow, auditVersioning, queueTaxonomy, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.admin_editor_decision_submission_workflow_model_only !== true) fail(`${obj.title || "object"} must be AG14E model only`);
  if (obj.admin_action_execution_performed_in_ag14e !== false) fail(`${obj.title || "object"} must not execute Admin action`);
  if (obj.editor_action_execution_performed_in_ag14e !== false) fail(`${obj.title || "object"} must not execute Editor action`);
  if (obj.article_mutation_performed_in_ag14e !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.public_visibility_switch_performed_in_ag14e !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_publishing_operation_performed_in_ag14e !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.auth_activation_performed_in_ag14e !== false) fail(`${obj.title || "object"} must not activate auth`);
  if (obj.backend_activation_performed_in_ag14e !== false) fail(`${obj.title || "object"} must not activate backend`);
  if (obj.supabase_activation_performed_in_ag14e !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

for (const phrase of ["Purpose", "Admin Actions", "Editor Actions", "Workflow Principle", "Audit and Versioning", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG14E document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag14e", "validate:ag14e"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag14e")) {
  fail("validate:project must include validate:ag14e");
}

pass("AG14E registry is present.");
pass("AG14E document is present.");
pass("AG14E review, Admin decision model, Editor workflow model, audit/versioning model, queue taxonomy, readiness, AG14F boundary, schema, learning and preview are present.");
pass("AG14D route separation and AG14A role-rights model are consumed.");
pass("Admin actions are modelled: Archive, Return for correction, Publish, Publish and close.");
pass("Editor actions are modelled: create, save, preview, submit, correct and resubmit.");
pass("Return for correction routes to manual Editor correction queue.");
pass("Editor publishing remains blocked.");
pass("Audit trail, versioning, queue taxonomy and status transitions are defined.");
pass("No Admin/Editor action execution, article mutation, visibility switch, Auth/backend/Supabase activation or publishing is performed.");
pass("AG14F Workflow Model Audit and Secure Action Handler Readiness boundary is created with explicit approval required.");
pass("AG14E is Admin Editor Decision and Submission Workflow Model only.");
