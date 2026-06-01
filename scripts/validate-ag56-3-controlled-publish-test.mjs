import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG56.3 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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
  "data/content-intelligence/content-loop/ag56-1-article-episode-candidate-record.json",
  "data/content-intelligence/content-loop/ag56-1-reference-image-credit-status-record.json",
  "data/content-intelligence/quality-reviews/ag55z-v01-release-candidate-closure.json",

  "data/content-intelligence/quality-reviews/ag56-3-controlled-publish-test.json",
  "data/content-intelligence/content-loop/ag56-3-source-consumption-record.json",
  "data/content-intelligence/content-loop/ag56-3-explicit-approval-gate-record.json",
  "data/content-intelligence/content-loop/ag56-3-controlled-publish-test-artifact-record.json",
  "data/content-intelligence/content-loop/ag56-3-public-url-listing-manifest-record.json",
  "data/content-intelligence/content-loop/ag56-3-reference-image-display-status-record.json",
  "data/content-intelligence/content-loop/ag56-3-controlled-publish-test-boundary.json",
  "data/content-intelligence/backend-architecture/ag56-3-no-deployment-live-public-check-audit.json",
  "data/content-intelligence/backend-architecture/ag56-3-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag56-3-no-go-live-decision-audit.json",
  "data/content-intelligence/quality-registry/ag56-3-ag56-4-public-url-listing-verification-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag56-3-to-ag56-4-public-url-listing-verification-boundary.json",
  "data/quality/ag56-3-controlled-publish-test.json",
  "data/quality/ag56-3-controlled-publish-test-preview.json",
  "docs/quality/AG56_3_CONTROLLED_PUBLISH_TEST.md",
  "scripts/generate-ag56-3-controlled-publish-test.mjs",
  "scripts/validate-ag56-3-controlled-publish-test.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag56_2Review = readJson("data/content-intelligence/quality-reviews/ag56-2-admin-editor-review-workflow-test.json");
const ag56_2Correction = readJson("data/content-intelligence/content-loop/ag56-2-editor-correction-path-record.json");
const ag56_2Submit = readJson("data/content-intelligence/content-loop/ag56-2-submit-for-review-path-record.json");
const ag56_2Approval = readJson("data/content-intelligence/content-loop/ag56-2-final-approval-workflow-record.json");
const ag56_2Decision = readJson("data/content-intelligence/content-loop/ag56-2-review-decision-register.json");
const ag56_2Boundary = readJson("data/content-intelligence/content-loop/ag56-2-admin-editor-review-workflow-boundary.json");
const ag56_2Readiness = readJson("data/content-intelligence/quality-registry/ag56-2-ag56-3-controlled-publish-test-readiness-record.json");
const ag56_2BoundaryTo3 = readJson("data/content-intelligence/mutation-plans/ag56-2-to-ag56-3-controlled-publish-test-boundary.json");

if (ag56_2Review.status !== "admin_editor_review_workflow_test_ready_for_ag56_3") fail("AG56.2 status mismatch.");
if (ag56_2Review.summary.ready_for_ag56_3_controlled_publish_test !== true) fail("AG56.2 must be ready for AG56.3.");
if (ag56_2Correction.audit_passed !== true) fail("AG56.2 correction must pass.");
if (ag56_2Submit.audit_passed !== true) fail("AG56.2 submit must pass.");
if (ag56_2Approval.audit_passed !== true) fail("AG56.2 approval workflow must pass.");
if (ag56_2Approval.approval_result !== "approved_for_ag56_3_publish_test_decision_only") fail("AG56.2 approval result mismatch.");
if (ag56_2Approval.actual_publish_approval_granted_now !== false) fail("AG56.2 must not have granted actual publish approval.");
if (ag56_2Decision.decision !== "READY_FOR_AG56_3_CONTROLLED_PUBLISH_TEST_DECISION_ONLY") fail("AG56.2 decision mismatch.");
if (ag56_2Decision.hard_blocker_count_for_ag56_3 !== 0) fail("AG56.2 hard blockers for AG56.3 must be zero.");
if (!ag56_2Boundary.boundary_rules.includes("AG56.3 controlled publish test remains blocked until explicit approval in that stage.")) fail("AG56.2 explicit approval boundary missing.");
if (ag56_2Readiness.ready_for_ag56_3 !== true) fail("AG56.2 readiness must permit AG56.3.");
if (ag56_2BoundaryTo3.next_stage_id !== "AG56.3") fail("AG56.2 boundary must point to AG56.3.");

for (const file of [
  "data/content-intelligence/backend-architecture/ag56-2-no-publish-deployment-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag56-2-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag56-2-no-publish-approval-bypass-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag56-3-controlled-publish-test.json");
const source = readJson("data/content-intelligence/content-loop/ag56-3-source-consumption-record.json");
const approvalGate = readJson("data/content-intelligence/content-loop/ag56-3-explicit-approval-gate-record.json");
const artifact = readJson("data/content-intelligence/content-loop/ag56-3-controlled-publish-test-artifact-record.json");
const manifest = readJson("data/content-intelligence/content-loop/ag56-3-public-url-listing-manifest-record.json");
const refImage = readJson("data/content-intelligence/content-loop/ag56-3-reference-image-display-status-record.json");
const publishBoundary = readJson("data/content-intelligence/content-loop/ag56-3-controlled-publish-test-boundary.json");
const noDeploymentLive = readJson("data/content-intelligence/backend-architecture/ag56-3-no-deployment-live-public-check-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag56-3-no-backend-auth-rls-database-runtime-audit.json");
const noGoLive = readJson("data/content-intelligence/backend-architecture/ag56-3-no-go-live-decision-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag56-3-ag56-4-public-url-listing-verification-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag56-3-to-ag56-4-public-url-listing-verification-boundary.json");
const preview = readJson("data/quality/ag56-3-controlled-publish-test-preview.json");
const pkg = readJson("package.json");

if (review.status !== "controlled_publish_test_ready_for_ag56_4") fail("AG56.3 review status mismatch.");

for (const key of [
  "ag56_3_controlled_publish_test_recorded",
  "ag56_2_consumed",
  "explicit_operator_approval_gate_recorded",
  "controlled_publish_test_approved_for_static_artifact",
  "controlled_publish_test_artifact_created",
  "public_url_listing_manifest_recorded",
  "reference_image_display_status_recorded",
  "ready_for_ag56_4_public_url_listing_verification"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag56_4 !== 0) fail("AG56.4 hard blocker count must be zero.");
if (source.status !== "source_consumption_recorded") fail("Source consumption mismatch.");

if (approvalGate.audit_passed !== true) fail("Explicit approval gate must pass.");
if (approvalGate.approval_scope !== "controlled_publish_test_artifact_only") fail("Approval scope must be controlled artifact only.");
if (approvalGate.actual_live_publish_approved_now !== false) fail("Live publish must not be approved.");
if (approvalGate.deployment_approved_now !== false) fail("Deployment must not be approved.");
if (approvalGate.go_live_approved_now !== false) fail("Go-live must not be approved.");

if (artifact.audit_passed !== true) fail("Controlled publish artifact must pass.");
if (artifact.publish_test_id !== "AG56-3-PUBLISH-TEST-001") fail("Publish test ID mismatch.");
if (artifact.artifact_state !== "controlled_publish_test_artifact_not_live") fail("Artifact must remain not live.");
if (artifact.live_site_article_published_now !== false) fail("Live article must not be published.");
if (artifact.public_url_created_now !== false) fail("Public URL must not be created.");
if (artifact.listing_updated_now !== false) fail("Listing must not be updated.");
if (artifact.homepage_updated_now !== false) fail("Homepage must not be updated.");

if (manifest.audit_passed !== true) fail("URL/listing manifest must pass.");
if (manifest.intended_public_path !== "/reads/attention-rhythm-after-endless-feeds") fail("Intended path mismatch.");
if (manifest.listing_manifest_entry.status !== "controlled_publish_test_manifest_only_pending_ag56_4_verification") fail("Listing manifest status mismatch.");
if (manifest.listing_manifest_entry.route_created_now !== false) fail("Route must not be created now.");
if (manifest.listing_manifest_entry.listing_mutated_now !== false) fail("Listing must not mutate now.");
if (manifest.listing_manifest_entry.homepage_mutated_now !== false) fail("Homepage must not mutate now.");

if (refImage.audit_passed !== true) fail("Reference/image display status must pass.");
if (refImage.reference_display_status.verified_reference_links_count !== 0) fail("Verified reference count must remain zero.");
if (refImage.reference_display_status.live_reference_links_added_now !== false) fail("Live reference links must not be added.");
if (refImage.image_display_status.image_selected_now !== false) fail("Image must not be selected now.");
if (refImage.image_display_status.image_generated_now !== false) fail("Image must not be generated now.");

for (const rule of [
  "AG56.3 creates a controlled publish-test artifact record only.",
  "AG56.3 does not deploy or trigger Vercel/GitHub release.",
  "AG56.3 does not create a live public URL.",
  "AG56.3 does not update the live public listing.",
  "AG56.3 does not update the live homepage.",
  "AG56.3 does not make a go-live decision."
]) {
  if (!publishBoundary.boundary_rules.includes(rule)) fail(`Publish boundary missing: ${rule}`);
}

for (const audit of [noDeploymentLive, noBackend, noGoLive]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag56_4_public_url_listing_verification") fail("AG56.4 readiness status mismatch.");
if (readiness.ready_for_ag56_4 !== true) fail("AG56.4 readiness must be true.");
if (readiness.next_stage_id !== "AG56.4") fail("Readiness must point to AG56.4.");
if (boundary.next_stage_id !== "AG56.4") fail("Boundary must point to AG56.4.");

for (const blocked of [
  "deployment or Vercel trigger",
  "homepage live update",
  "go-live decision",
  "backend/Auth/Supabase activation",
  "runtime database/API reading",
  "service-role use",
  "V02 expansion"
]) {
  if (!readiness.ag56_4_blocked_scope.includes(blocked)) fail(`AG56.4 blocked scope missing: ${blocked}`);
}

for (const key of [
  "live_site_article_published",
  "actual_public_url_live",
  "public_listing_live_updated",
  "homepage_live_updated",
  "deployment_approved",
  "deployment_performed",
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "github_release_created",
  "live_public_check_executed",
  "browser_automation_enabled",
  "external_audit_api_enabled",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "runtime_publish_queue_enabled",
  "runtime_cms_enabled",
  "public_dashboard_exposed",
  "external_fetch_enabled",
  "ag56_4_live_verification_executed",
  "ag56_5_homepage_surface_verification_executed",
  "ag56_8_go_live_decision_made",
  "actual_go_live_approval_granted",
  "v02_item_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag56-3"]) fail("Missing package script: generate:ag56-3");
if (!pkg.scripts?.["validate:ag56-3"]) fail("Missing package script: validate:ag56-3");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag56-3")) fail("validate:project must include validate:ag56-3.");

pass("AG56.3 Controlled Publish Test is present.");
pass("AG56.2 admin/editor review workflow is consumed.");
pass("Explicit approval gate is valid and limited to controlled artifact.");
pass("Controlled publish-test artifact is valid and not live.");
pass("Public URL/listing manifest is valid and pending AG56.4 verification.");
pass("Reference/image display status is valid.");
pass("Controlled publish-test boundary is valid.");
pass("No deployment/live public check audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("No go-live decision audit is valid.");
pass("AG56.4 public URL and listing verification readiness is valid.");
