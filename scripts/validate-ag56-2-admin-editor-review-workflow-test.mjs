import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG56.2 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag56-1-controlled-dynamic-article-generation-test.json",
  "data/content-intelligence/content-loop/ag56-1-source-consumption-record.json",
  "data/content-intelligence/content-loop/ag56-1-signal-topic-selection-record.json",
  "data/content-intelligence/content-loop/ag56-1-topic-scoring-record.json",
  "data/content-intelligence/content-loop/ag56-1-article-episode-candidate-record.json",
  "data/content-intelligence/content-loop/ag56-1-reference-image-credit-status-record.json",
  "data/content-intelligence/content-loop/ag56-1-controlled-generation-boundary.json",
  "data/content-intelligence/backend-architecture/ag56-1-no-publish-deployment-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag56-1-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag56-1-no-admin-editor-approval-bypass-audit.json",
  "data/content-intelligence/quality-registry/ag56-1-ag56-2-admin-editor-review-workflow-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag56-1-to-ag56-2-admin-editor-review-workflow-boundary.json",

  "data/content-intelligence/quality-reviews/ag56-2-admin-editor-review-workflow-test.json",
  "data/content-intelligence/content-loop/ag56-2-source-consumption-record.json",
  "data/content-intelligence/content-loop/ag56-2-editor-correction-path-record.json",
  "data/content-intelligence/content-loop/ag56-2-submit-for-review-path-record.json",
  "data/content-intelligence/content-loop/ag56-2-final-approval-workflow-record.json",
  "data/content-intelligence/content-loop/ag56-2-review-decision-register.json",
  "data/content-intelligence/content-loop/ag56-2-admin-editor-review-workflow-boundary.json",
  "data/content-intelligence/backend-architecture/ag56-2-no-publish-deployment-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag56-2-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag56-2-no-publish-approval-bypass-audit.json",
  "data/content-intelligence/quality-registry/ag56-2-ag56-3-controlled-publish-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag56-2-to-ag56-3-controlled-publish-test-boundary.json",
  "data/quality/ag56-2-admin-editor-review-workflow-test.json",
  "data/quality/ag56-2-admin-editor-review-workflow-test-preview.json",
  "docs/quality/AG56_2_ADMIN_EDITOR_REVIEW_WORKFLOW_TEST.md",
  "scripts/generate-ag56-2-admin-editor-review-workflow-test.mjs",
  "scripts/validate-ag56-2-admin-editor-review-workflow-test.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag56_1Review = readJson("data/content-intelligence/quality-reviews/ag56-1-controlled-dynamic-article-generation-test.json");
const ag56_1Signal = readJson("data/content-intelligence/content-loop/ag56-1-signal-topic-selection-record.json");
const ag56_1Scoring = readJson("data/content-intelligence/content-loop/ag56-1-topic-scoring-record.json");
const ag56_1Candidate = readJson("data/content-intelligence/content-loop/ag56-1-article-episode-candidate-record.json");
const ag56_1ReferenceCredit = readJson("data/content-intelligence/content-loop/ag56-1-reference-image-credit-status-record.json");
const ag56_1Boundary = readJson("data/content-intelligence/content-loop/ag56-1-controlled-generation-boundary.json");
const ag56_1Readiness = readJson("data/content-intelligence/quality-registry/ag56-1-ag56-2-admin-editor-review-workflow-readiness-record.json");
const ag56_1BoundaryTo2 = readJson("data/content-intelligence/mutation-plans/ag56-1-to-ag56-2-admin-editor-review-workflow-boundary.json");

if (ag56_1Review.status !== "controlled_dynamic_article_generation_test_ready_for_ag56_2") fail("AG56.1 status mismatch.");
if (ag56_1Review.summary.ready_for_ag56_2_admin_editor_review_workflow_test !== true) fail("AG56.1 must be ready for AG56.2.");
if (ag56_1Signal.audit_passed !== true || ag56_1Signal.status !== "one_signal_topic_selected") fail("AG56.1 signal selection mismatch.");
if (ag56_1Scoring.audit_passed !== true) fail("AG56.1 scoring must pass.");
if (ag56_1Candidate.audit_passed !== true) fail("AG56.1 candidate must pass.");
if (ag56_1Candidate.publication_state !== "not_published_pending_ag56_2_admin_editor_review") fail("AG56.1 candidate must remain unpublished.");
if (ag56_1ReferenceCredit.reference_status.status !== "under_editorial_verification") fail("AG56.1 references must be under editorial verification.");
if (ag56_1ReferenceCredit.image_credit_status.status !== "no_image_selected_credit_pending") fail("AG56.1 image credit must be pending.");
if (!ag56_1Boundary.boundary_rules.includes("AG56.1 does not publish the candidate.")) fail("AG56.1 publish boundary missing.");
if (ag56_1Readiness.ready_for_ag56_2 !== true) fail("AG56.1 readiness must permit AG56.2.");
if (ag56_1BoundaryTo2.next_stage_id !== "AG56.2") fail("AG56.1 boundary must point to AG56.2.");

for (const file of [
  "data/content-intelligence/backend-architecture/ag56-1-no-publish-deployment-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag56-1-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag56-1-no-admin-editor-approval-bypass-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag56-2-admin-editor-review-workflow-test.json");
const source = readJson("data/content-intelligence/content-loop/ag56-2-source-consumption-record.json");
const correction = readJson("data/content-intelligence/content-loop/ag56-2-editor-correction-path-record.json");
const submit = readJson("data/content-intelligence/content-loop/ag56-2-submit-for-review-path-record.json");
const approval = readJson("data/content-intelligence/content-loop/ag56-2-final-approval-workflow-record.json");
const decision = readJson("data/content-intelligence/content-loop/ag56-2-review-decision-register.json");
const workflowBoundary = readJson("data/content-intelligence/content-loop/ag56-2-admin-editor-review-workflow-boundary.json");
const noPublish = readJson("data/content-intelligence/backend-architecture/ag56-2-no-publish-deployment-public-mutation-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag56-2-no-backend-auth-rls-database-runtime-audit.json");
const noApprovalBypass = readJson("data/content-intelligence/backend-architecture/ag56-2-no-publish-approval-bypass-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag56-2-ag56-3-controlled-publish-test-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag56-2-to-ag56-3-controlled-publish-test-boundary.json");
const preview = readJson("data/quality/ag56-2-admin-editor-review-workflow-test-preview.json");
const pkg = readJson("package.json");

if (review.status !== "admin_editor_review_workflow_test_ready_for_ag56_3") fail("AG56.2 review status mismatch.");

for (const key of [
  "ag56_2_admin_editor_review_workflow_test_recorded",
  "ag56_1_consumed",
  "ag26_admin_editor_context_consumed",
  "editor_correction_path_recorded",
  "submit_for_review_path_recorded",
  "final_approval_workflow_recorded",
  "review_decision_register_recorded",
  "admin_editor_review_workflow_completed",
  "candidate_ready_for_ag56_3_publish_test_decision",
  "ready_for_ag56_3_controlled_publish_test"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag56_3 !== 0) fail("AG56.3 blocker count must be zero.");
if (source.status !== "source_consumption_recorded") fail("Source consumption mismatch.");
if (!Object.prototype.hasOwnProperty.call(source.consumed_review_workflow_context, "ag26_admin_editor_manual_workflow")) fail("AG26 context key missing.");

if (correction.audit_passed !== true) fail("Editor correction path must pass.");
if (correction.candidate_id !== ag56_1Candidate.candidate_id) fail("Correction candidate ID mismatch.");
if (correction.public_candidate_mutated_now !== false) fail("Public candidate must not be mutated.");

if (submit.audit_passed !== true) fail("Submit-for-review path must pass.");
if (submit.simulated_review_queue.runtime_queue_enabled !== false) fail("Runtime queue must remain disabled.");
if (submit.simulated_review_queue.backend_queue_enabled !== false) fail("Backend queue must remain disabled.");
if (submit.simulated_review_queue.notification_sent !== false) fail("No notification should be sent.");

if (approval.audit_passed !== true) fail("Final approval workflow must pass.");
if (approval.approval_result !== "approved_for_ag56_3_publish_test_decision_only") fail("Approval result must be AG56.3 decision-only.");
if (approval.actual_publish_approval_granted_now !== false) fail("Actual publish approval must remain false.");
if (approval.final_public_approval_granted_now !== false) fail("Final public approval must remain false.");

if (decision.audit_passed !== true) fail("Review decision register must pass.");
if (decision.decision !== "READY_FOR_AG56_3_CONTROLLED_PUBLISH_TEST_DECISION_ONLY") fail("Decision must be AG56.3 decision-only.");
if (decision.hard_blocker_count_for_ag56_3 !== 0) fail("Decision hard blockers must be zero.");
for (const blocked of ["publish now", "create public URL now", "update listing now", "update homepage now", "deploy now", "activate backend runtime now", "make go-live decision now"]) {
  if (!decision.not_approved_actions.includes(blocked)) fail(`Decision not-approved action missing: ${blocked}`);
}

for (const rule of [
  "AG56.2 does not publish the candidate.",
  "AG56.2 does not create a public URL.",
  "AG56.2 does not update listing, homepage or public module surfaces.",
  "AG56.2 does not approve AG56.3 publish execution.",
  "AG56.3 controlled publish test remains blocked until explicit approval in that stage."
]) {
  if (!workflowBoundary.boundary_rules.includes(rule)) fail(`Workflow boundary missing: ${rule}`);
}

for (const audit of [noPublish, noBackend, noApprovalBypass]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag56_3_controlled_publish_test") fail("AG56.3 readiness status mismatch.");
if (readiness.ready_for_ag56_3 !== true) fail("AG56.3 readiness must be true.");
if (readiness.next_stage_id !== "AG56.3") fail("Readiness must point to AG56.3.");
if (boundary.next_stage_id !== "AG56.3") fail("Boundary must point to AG56.3.");

for (const blocked of [
  "publishing the article",
  "creating public URL",
  "updating listing",
  "updating homepage",
  "deployment or Vercel trigger",
  "live public check",
  "go-live decision",
  "backend/Auth/Supabase activation",
  "runtime database/API reading",
  "service-role use",
  "V02 expansion"
]) {
  if (!readiness.ag56_3_blocked_scope_before_explicit_approval.includes(blocked)) fail(`AG56.3 blocked scope missing: ${blocked}`);
}

for (const key of [
  "article_published",
  "public_url_created",
  "public_listing_updated",
  "homepage_updated",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_page_mutation_enabled",
  "ag56_3_publish_test_approved",
  "ag56_3_publish_test_executed",
  "ag56_8_go_live_decision_made",
  "actual_go_live_approval_granted",
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "deployment_approved",
  "deployment_performed",
  "github_release_created",
  "live_public_check_executed",
  "browser_automation_enabled",
  "external_audit_api_enabled",
  "runtime_generation_api_called",
  "runtime_review_queue_enabled",
  "runtime_admin_account_enabled",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "public_dashboard_exposed",
  "external_fetch_enabled",
  "v02_item_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag56-2"]) fail("Missing package script: generate:ag56-2");
if (!pkg.scripts?.["validate:ag56-2"]) fail("Missing package script: validate:ag56-2");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag56-2")) fail("validate:project must include validate:ag56-2.");

pass("AG56.2 Admin/Editor Review Workflow Test is present.");
pass("AG56.1 controlled article candidate is consumed.");
pass("Editor correction path is valid.");
pass("Submit-for-review path is valid.");
pass("Final approval workflow is valid and publish is not approved.");
pass("Review decision register is valid.");
pass("Admin/editor review workflow boundary is valid.");
pass("No publish/deployment/public mutation audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("No publish approval bypass audit is valid.");
pass("AG56.3 controlled publish test readiness is valid.");
