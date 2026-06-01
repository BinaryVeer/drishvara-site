import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG56.4 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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

  "data/content-intelligence/quality-reviews/ag56-4-public-url-listing-verification.json",
  "data/content-intelligence/content-loop/ag56-4-source-consumption-record.json",
  "data/content-intelligence/content-loop/ag56-4-reserved-url-verification-record.json",
  "data/content-intelligence/content-loop/ag56-4-listing-manifest-verification-record.json",
  "data/content-intelligence/content-loop/ag56-4-article-label-route-status-record.json",
  "data/content-intelligence/content-loop/ag56-4-public-url-listing-verification-boundary.json",
  "data/content-intelligence/backend-architecture/ag56-4-no-live-route-deployment-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag56-4-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag56-4-no-go-live-decision-audit.json",
  "data/content-intelligence/quality-registry/ag56-4-ag56-5-homepage-module-surface-verification-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag56-4-to-ag56-5-homepage-module-surface-verification-boundary.json",
  "data/quality/ag56-4-public-url-listing-verification.json",
  "data/quality/ag56-4-public-url-listing-verification-preview.json",
  "docs/quality/AG56_4_PUBLIC_URL_LISTING_VERIFICATION.md",
  "scripts/generate-ag56-4-public-url-listing-verification.mjs",
  "scripts/validate-ag56-4-public-url-listing-verification.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag56_3Review = readJson("data/content-intelligence/quality-reviews/ag56-3-controlled-publish-test.json");
const ag56_3Approval = readJson("data/content-intelligence/content-loop/ag56-3-explicit-approval-gate-record.json");
const ag56_3Artifact = readJson("data/content-intelligence/content-loop/ag56-3-controlled-publish-test-artifact-record.json");
const ag56_3Manifest = readJson("data/content-intelligence/content-loop/ag56-3-public-url-listing-manifest-record.json");
const ag56_3RefImage = readJson("data/content-intelligence/content-loop/ag56-3-reference-image-display-status-record.json");
const ag56_3Boundary = readJson("data/content-intelligence/content-loop/ag56-3-controlled-publish-test-boundary.json");
const ag56_3Readiness = readJson("data/content-intelligence/quality-registry/ag56-3-ag56-4-public-url-listing-verification-readiness-record.json");
const ag56_3BoundaryTo4 = readJson("data/content-intelligence/mutation-plans/ag56-3-to-ag56-4-public-url-listing-verification-boundary.json");

if (ag56_3Review.status !== "controlled_publish_test_ready_for_ag56_4") fail("AG56.3 status mismatch.");
if (ag56_3Review.summary.ready_for_ag56_4_public_url_listing_verification !== true) fail("AG56.3 must be ready for AG56.4.");
if (ag56_3Approval.audit_passed !== true) fail("AG56.3 approval gate must pass.");
if (ag56_3Approval.approval_scope !== "controlled_publish_test_artifact_only") fail("AG56.3 approval scope mismatch.");
if (ag56_3Approval.actual_live_publish_approved_now !== false) fail("AG56.3 must not approve live publish.");
if (ag56_3Artifact.audit_passed !== true) fail("AG56.3 artifact must pass.");
if (ag56_3Artifact.artifact_state !== "controlled_publish_test_artifact_not_live") fail("AG56.3 artifact must remain not live.");
if (ag56_3Artifact.public_url_created_now !== false) fail("AG56.3 public URL must not be created.");
if (ag56_3Artifact.listing_updated_now !== false) fail("AG56.3 listing must not be updated.");
if (ag56_3Artifact.homepage_updated_now !== false) fail("AG56.3 homepage must not be updated.");
if (ag56_3Manifest.audit_passed !== true) fail("AG56.3 manifest must pass.");
if (ag56_3Manifest.listing_manifest_entry.status !== "controlled_publish_test_manifest_only_pending_ag56_4_verification") fail("AG56.3 manifest status mismatch.");
if (ag56_3RefImage.audit_passed !== true) fail("AG56.3 reference/image must pass.");
if (!ag56_3Boundary.boundary_rules.includes("AG56.3 does not create a live public URL.")) fail("AG56.3 live URL boundary missing.");
if (ag56_3Readiness.ready_for_ag56_4 !== true) fail("AG56.3 readiness must permit AG56.4.");
if (ag56_3BoundaryTo4.next_stage_id !== "AG56.4") fail("AG56.3 boundary must point to AG56.4.");

for (const file of [
  "data/content-intelligence/backend-architecture/ag56-3-no-deployment-live-public-check-audit.json",
  "data/content-intelligence/backend-architecture/ag56-3-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag56-3-no-go-live-decision-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag56-4-public-url-listing-verification.json");
const source = readJson("data/content-intelligence/content-loop/ag56-4-source-consumption-record.json");
const url = readJson("data/content-intelligence/content-loop/ag56-4-reserved-url-verification-record.json");
const listing = readJson("data/content-intelligence/content-loop/ag56-4-listing-manifest-verification-record.json");
const labelRoute = readJson("data/content-intelligence/content-loop/ag56-4-article-label-route-status-record.json");
const verificationBoundary = readJson("data/content-intelligence/content-loop/ag56-4-public-url-listing-verification-boundary.json");
const noLiveRoute = readJson("data/content-intelligence/backend-architecture/ag56-4-no-live-route-deployment-public-mutation-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag56-4-no-backend-auth-rls-database-runtime-audit.json");
const noGoLive = readJson("data/content-intelligence/backend-architecture/ag56-4-no-go-live-decision-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag56-4-ag56-5-homepage-module-surface-verification-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag56-4-to-ag56-5-homepage-module-surface-verification-boundary.json");
const preview = readJson("data/quality/ag56-4-public-url-listing-verification-preview.json");
const pkg = readJson("package.json");

if (review.status !== "public_url_listing_verification_ready_for_ag56_5") fail("AG56.4 review status mismatch.");

for (const key of [
  "ag56_4_public_url_listing_verification_recorded",
  "ag56_3_consumed",
  "reserved_url_path_verified_against_manifest",
  "listing_manifest_verified",
  "article_label_route_status_recorded",
  "public_url_listing_verification_completed",
  "ready_for_ag56_5_homepage_module_surface_verification"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag56_5 !== 0) fail("AG56.5 hard blocker count must be zero.");
if (source.status !== "source_consumption_recorded") fail("Source consumption mismatch.");

if (url.audit_passed !== true) fail("Reserved URL verification must pass.");
if (url.intended_public_path !== "/reads/attention-rhythm-after-endless-feeds") fail("Reserved URL path mismatch.");
if (url.public_route_created_now !== false) fail("Public route must not be created.");
if (url.actual_public_url_live_now !== false) fail("Actual public URL must not be live.");
if (url.live_public_check_executed_now !== false) fail("Live public check must not execute.");

if (listing.audit_passed !== true) fail("Listing manifest verification must pass.");
if (listing.public_listing_live_updated_now !== false) fail("Public listing must not be live-updated.");
if (listing.homepage_live_updated_now !== false) fail("Homepage must not be live-updated.");
for (const check of listing.verification_checks) {
  if (check.passed !== true) fail(`Listing verification check failed: ${check.check_id}`);
}

if (labelRoute.audit_passed !== true) fail("Article label/route status must pass.");
if (labelRoute.route_status.route_created_now !== false) fail("Route must not be created.");
if (labelRoute.route_status.live_url_available_now !== false) fail("Live URL must not be available.");
if (!labelRoute.article_labels_verified.includes("Not live")) fail("Not-live label missing.");
if (labelRoute.false_link_guard.invented_reference_links_added !== false) fail("Invented reference links must be false.");
if (labelRoute.false_link_guard.unverified_reference_links_published !== false) fail("Unverified links must not be published.");
if (labelRoute.false_link_guard.image_without_credit_published !== false) fail("Image without credit must not be published.");

for (const rule of [
  "AG56.4 verifies reserved path and listing manifest only.",
  "AG56.4 does not create a live public URL.",
  "AG56.4 does not update live listing.",
  "AG56.4 does not update homepage or module surfaces.",
  "AG56.4 does not deploy or trigger Vercel/GitHub release.",
  "AG56.4 does not make a go-live decision."
]) {
  if (!verificationBoundary.boundary_rules.includes(rule)) fail(`Verification boundary missing: ${rule}`);
}

for (const audit of [noLiveRoute, noBackend, noGoLive]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag56_5_homepage_module_surface_verification") fail("AG56.5 readiness status mismatch.");
if (readiness.ready_for_ag56_5 !== true) fail("AG56.5 readiness must be true.");
if (readiness.next_stage_id !== "AG56.5") fail("Readiness must point to AG56.5.");
if (boundary.next_stage_id !== "AG56.5") fail("Boundary must point to AG56.5.");

for (const blocked of [
  "live homepage update",
  "live listing update",
  "deployment or Vercel trigger",
  "live public check",
  "go-live decision",
  "backend/Auth/Supabase activation",
  "runtime database/API reading",
  "service-role use",
  "V02 expansion"
]) {
  if (!readiness.ag56_5_blocked_scope.includes(blocked)) fail(`AG56.5 blocked scope missing: ${blocked}`);
}

for (const key of [
  "live_site_article_published",
  "actual_public_url_live",
  "public_route_created",
  "public_listing_live_updated",
  "homepage_live_updated",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_page_mutation_enabled",
  "deployment_approved",
  "deployment_performed",
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "github_release_created",
  "live_public_check_executed",
  "browser_automation_enabled",
  "external_audit_api_enabled",
  "homepage_surface_mutated_now",
  "module_surface_mutated_now",
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
  "ag56_5_homepage_surface_verification_executed",
  "ag56_8_go_live_decision_made",
  "actual_go_live_approval_granted",
  "v02_item_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag56-4"]) fail("Missing package script: generate:ag56-4");
if (!pkg.scripts?.["validate:ag56-4"]) fail("Missing package script: validate:ag56-4");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag56-4")) fail("validate:project must include validate:ag56-4.");

pass("AG56.4 Public URL and Listing Verification is present.");
pass("AG56.3 controlled publish-test artifact is consumed.");
pass("Reserved URL/path verification is valid.");
pass("Listing manifest verification is valid.");
pass("Article label and route status record is valid.");
pass("Public URL/listing verification boundary is valid.");
pass("No live route/deployment/public mutation audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("No go-live decision audit is valid.");
pass("AG56.5 homepage and module surface verification readiness is valid.");
