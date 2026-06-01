import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG56.1 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag55z-v01-release-candidate-closure.json",
  "data/content-intelligence/release-candidate/ag55z-v01-release-candidate-closure-record.json",
  "data/content-intelligence/release-candidate/ag55z-final-v01-release-candidate-posture-record.json",
  "data/content-intelligence/release-candidate/ag55z-carry-forward-release-candidate-deferral-register.json",
  "data/content-intelligence/ag-roadmap/ag55z-to-ag56-1-controlled-dynamic-article-generation-handoff.json",
  "data/content-intelligence/backend-architecture/ag55z-no-go-live-deployment-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag55z-no-ag56-dynamic-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag55z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag55z-ag56-1-controlled-dynamic-article-generation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag55z-to-ag56-1-controlled-dynamic-article-generation-boundary.json",

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
  "data/quality/ag56-1-controlled-dynamic-article-generation-test.json",
  "data/quality/ag56-1-controlled-dynamic-article-generation-test-preview.json",
  "docs/quality/AG56_1_CONTROLLED_DYNAMIC_ARTICLE_GENERATION_TEST.md",
  "scripts/generate-ag56-1-controlled-dynamic-article-generation-test.mjs",
  "scripts/validate-ag56-1-controlled-dynamic-article-generation-test.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag55zReview = readJson("data/content-intelligence/quality-reviews/ag55z-v01-release-candidate-closure.json");
const ag55zClosure = readJson("data/content-intelligence/release-candidate/ag55z-v01-release-candidate-closure-record.json");
const ag55zPosture = readJson("data/content-intelligence/release-candidate/ag55z-final-v01-release-candidate-posture-record.json");
const ag55zCarryForward = readJson("data/content-intelligence/release-candidate/ag55z-carry-forward-release-candidate-deferral-register.json");
const ag55zHandoff = readJson("data/content-intelligence/ag-roadmap/ag55z-to-ag56-1-controlled-dynamic-article-generation-handoff.json");
const ag55zReadiness = readJson("data/content-intelligence/quality-registry/ag55z-ag56-1-controlled-dynamic-article-generation-readiness-record.json");
const ag55zBoundary = readJson("data/content-intelligence/mutation-plans/ag55z-to-ag56-1-controlled-dynamic-article-generation-boundary.json");

if (ag55zReview.status !== "v01_release_candidate_closed_ready_for_ag56_1") fail("AG55Z status mismatch.");
if (ag55zReview.summary.ready_for_ag56_1_controlled_dynamic_article_generation_test !== true) fail("AG55Z must be ready for AG56.1.");
if (ag55zClosure.status !== "v01_release_candidate_closure_completed") fail("AG55Z closure mismatch.");
if (ag55zPosture.posture_summary.v01_release_candidate !== "closed_ready_for_AG56_1_controlled_test") fail("AG55Z posture mismatch.");
if (!ag55zCarryForward.deferred_items.includes("AG56.3 controlled publish test approval")) fail("AG56.3 approval deferral missing.");
if (ag55zHandoff.next_stage_id !== "AG56.1") fail("AG55Z handoff must point to AG56.1.");
if (ag55zReadiness.ready_for_ag56_1 !== true) fail("AG55Z readiness must permit AG56.1.");
if (ag55zBoundary.next_stage_id !== "AG56.1") fail("AG55Z boundary must point to AG56.1.");

for (const file of [
  "data/content-intelligence/backend-architecture/ag55z-no-go-live-deployment-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag55z-no-ag56-dynamic-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag55z-no-backend-auth-rls-database-runtime-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag56-1-controlled-dynamic-article-generation-test.json");
const source = readJson("data/content-intelligence/content-loop/ag56-1-source-consumption-record.json");
const signal = readJson("data/content-intelligence/content-loop/ag56-1-signal-topic-selection-record.json");
const scoring = readJson("data/content-intelligence/content-loop/ag56-1-topic-scoring-record.json");
const candidate = readJson("data/content-intelligence/content-loop/ag56-1-article-episode-candidate-record.json");
const refCredit = readJson("data/content-intelligence/content-loop/ag56-1-reference-image-credit-status-record.json");
const generationBoundary = readJson("data/content-intelligence/content-loop/ag56-1-controlled-generation-boundary.json");
const noPublish = readJson("data/content-intelligence/backend-architecture/ag56-1-no-publish-deployment-public-mutation-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag56-1-no-backend-auth-rls-database-runtime-audit.json");
const noApprovalBypass = readJson("data/content-intelligence/backend-architecture/ag56-1-no-admin-editor-approval-bypass-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag56-1-ag56-2-admin-editor-review-workflow-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag56-1-to-ag56-2-admin-editor-review-workflow-boundary.json");
const preview = readJson("data/quality/ag56-1-controlled-dynamic-article-generation-test-preview.json");
const pkg = readJson("package.json");

if (review.status !== "controlled_dynamic_article_generation_test_ready_for_ag56_2") fail("AG56.1 review status mismatch.");

for (const key of [
  "ag56_1_controlled_dynamic_article_generation_test_recorded",
  "ag55z_consumed",
  "ag43_topic_content_intelligence_consumed",
  "ag45_first_light_consumed",
  "ag46_long_form_standard_consumed",
  "one_signal_topic_selected",
  "topic_scoring_recorded",
  "one_article_episode_candidate_prepared",
  "reference_image_credit_status_recorded",
  "ready_for_ag56_2_admin_editor_review_workflow_test"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag56_2 !== 0) fail("AG56.2 blocker count must be zero.");
if (source.status !== "source_consumption_recorded") fail("Source consumption mismatch.");
if (source.consumed_existing_logic.ag43_topic_content_intelligence.length <= 0) fail("AG43 evidence missing.");
if (source.consumed_existing_logic.ag45_first_light.length <= 0) fail("AG45 evidence missing.");
if (source.consumed_existing_logic.ag46_long_form_standard.length <= 0) fail("AG46 evidence missing.");

if (signal.audit_passed !== true) fail("Signal/topic selection must pass.");
if (signal.status !== "one_signal_topic_selected") fail("Signal topic status mismatch.");
if (signal.selected_topic_position !== "candidate_only_pending_ag56_2_editor_review") fail("Selected topic must remain pending AG56.2.");

if (scoring.audit_passed !== true) fail("Topic scoring must pass.");
if (scoring.scored_signals.length !== 3) fail("Expected exactly 3 scored candidate signals.");
if (scoring.selected_signal_id !== signal.selected_signal.signal_id) fail("Selected signal mismatch.");

if (candidate.audit_passed !== true) fail("Article candidate must pass.");
if (candidate.candidate_id !== "AG56-1-CANDIDATE-001") fail("Candidate ID mismatch.");
if (candidate.publication_state !== "not_published_pending_ag56_2_admin_editor_review") fail("Candidate must remain unpublished.");
if (candidate.mandatory_next_step !== "AG56.2 Admin/Editor Review Workflow Test") fail("Candidate must point to AG56.2 review.");

for (const blocked of ["publishing", "public URL creation", "listing update", "homepage update", "live check", "deployment", "backend runtime activation"]) {
  if (!candidate.blocked_before_ag56_2.includes(blocked)) fail(`Candidate blocked-before-AG56.2 missing: ${blocked}`);
}

if (refCredit.audit_passed !== true) fail("Reference/image credit status must pass.");
if (refCredit.reference_status.status !== "under_editorial_verification") fail("Reference status must be under editorial verification.");
if (refCredit.reference_status.verified_reference_links_count !== 0) fail("Verified reference count must be zero at AG56.1.");
if (refCredit.image_credit_status.status !== "no_image_selected_credit_pending") fail("Image credit must remain pending.");
if (refCredit.image_credit_status.image_generated_now !== false) fail("No image generation allowed.");

for (const rule of [
  "AG56.1 prepares one article/episode candidate only.",
  "AG56.1 does not publish the candidate.",
  "AG56.1 does not create a public URL.",
  "AG56.1 does not update listing, homepage or public module surfaces.",
  "AG56.3 publish test remains blocked until explicit approval."
]) {
  if (!generationBoundary.boundary_rules.includes(rule)) fail(`Generation boundary missing: ${rule}`);
}

for (const audit of [noPublish, noBackend, noApprovalBypass]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag56_2_admin_editor_review_workflow_test") fail("AG56.2 readiness status mismatch.");
if (readiness.ready_for_ag56_2 !== true) fail("AG56.2 readiness must be true.");
if (readiness.next_stage_id !== "AG56.2") fail("Readiness must point to AG56.2.");
if (boundary.next_stage_id !== "AG56.2") fail("Boundary must point to AG56.2.");

for (const blocked of [
  "publishing the article",
  "public URL/listing verification",
  "homepage update",
  "deployment or Vercel trigger",
  "live public check",
  "AG56.3 controlled publish test",
  "go-live decision",
  "backend/Auth/Supabase activation",
  "runtime database/API reading",
  "service-role use"
]) {
  if (!readiness.ag56_2_blocked_scope.includes(blocked)) fail(`AG56.2 blocked scope missing: ${blocked}`);
}

for (const key of [
  "article_published",
  "public_url_created",
  "public_listing_updated",
  "homepage_updated",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_page_mutation_enabled",
  "ag56_2_admin_editor_review_completed",
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

if (!pkg.scripts?.["generate:ag56-1"]) fail("Missing package script: generate:ag56-1");
if (!pkg.scripts?.["validate:ag56-1"]) fail("Missing package script: validate:ag56-1");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag56-1")) fail("validate:project must include validate:ag56-1.");

pass("AG56.1 Controlled Dynamic Article Generation Test is present.");
pass("AG55Z V01 release candidate closure is consumed.");
pass("AG43 topic/content-intelligence evidence is consumed.");
pass("AG45 First Light evidence is consumed.");
pass("AG46 long-form/Featured Reads evidence is consumed.");
pass("Signal/topic selection is valid.");
pass("Topic scoring record is valid.");
pass("One article/episode candidate is prepared and unpublished.");
pass("Reference/image credit status is valid and pending editorial verification.");
pass("Controlled generation boundary is valid.");
pass("No publish/deployment/public mutation audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("No admin/editor approval bypass audit is valid.");
pass("AG56.2 admin/editor review workflow readiness is valid.");
