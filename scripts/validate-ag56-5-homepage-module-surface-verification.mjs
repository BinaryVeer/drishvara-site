import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG56.5 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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

  "data/content-intelligence/quality-reviews/ag56-5-homepage-module-surface-verification.json",
  "data/content-intelligence/content-loop/ag56-5-source-consumption-record.json",
  "data/content-intelligence/content-loop/ag56-5-homepage-surface-manifest-verification-record.json",
  "data/content-intelligence/content-loop/ag56-5-module-surface-placement-verification-record.json",
  "data/content-intelligence/content-loop/ag56-5-featured-reads-surface-verification-record.json",
  "data/content-intelligence/content-loop/ag56-5-homepage-module-surface-verification-boundary.json",
  "data/content-intelligence/backend-architecture/ag56-5-no-homepage-live-mutation-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag56-5-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag56-5-no-go-live-decision-audit.json",
  "data/content-intelligence/quality-registry/ag56-5-ag56-6-word-panchang-reflection-vedic-preview-smoke-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag56-5-to-ag56-6-word-panchang-reflection-vedic-preview-smoke-test-boundary.json",
  "data/quality/ag56-5-homepage-module-surface-verification.json",
  "data/quality/ag56-5-homepage-module-surface-verification-preview.json",
  "docs/quality/AG56_5_HOMEPAGE_MODULE_SURFACE_VERIFICATION.md",
  "scripts/generate-ag56-5-homepage-module-surface-verification.mjs",
  "scripts/validate-ag56-5-homepage-module-surface-verification.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag56_4Review = readJson("data/content-intelligence/quality-reviews/ag56-4-public-url-listing-verification.json");
const ag56_4ReservedUrl = readJson("data/content-intelligence/content-loop/ag56-4-reserved-url-verification-record.json");
const ag56_4Listing = readJson("data/content-intelligence/content-loop/ag56-4-listing-manifest-verification-record.json");
const ag56_4LabelRoute = readJson("data/content-intelligence/content-loop/ag56-4-article-label-route-status-record.json");
const ag56_4Boundary = readJson("data/content-intelligence/content-loop/ag56-4-public-url-listing-verification-boundary.json");
const ag56_4Readiness = readJson("data/content-intelligence/quality-registry/ag56-4-ag56-5-homepage-module-surface-verification-readiness-record.json");
const ag56_4BoundaryTo5 = readJson("data/content-intelligence/mutation-plans/ag56-4-to-ag56-5-homepage-module-surface-verification-boundary.json");

if (ag56_4Review.status !== "public_url_listing_verification_ready_for_ag56_5") fail("AG56.4 status mismatch.");
if (ag56_4Review.summary.ready_for_ag56_5_homepage_module_surface_verification !== true) fail("AG56.4 must be ready for AG56.5.");
if (ag56_4ReservedUrl.audit_passed !== true) fail("AG56.4 reserved URL verification must pass.");
if (ag56_4ReservedUrl.public_route_created_now !== false) fail("AG56.4 route must not be created.");
if (ag56_4ReservedUrl.actual_public_url_live_now !== false) fail("AG56.4 URL must not be live.");
if (ag56_4Listing.audit_passed !== true) fail("AG56.4 listing verification must pass.");
if (ag56_4Listing.public_listing_live_updated_now !== false) fail("AG56.4 listing must not be updated live.");
if (ag56_4Listing.homepage_live_updated_now !== false) fail("AG56.4 homepage must not be updated live.");
if (ag56_4LabelRoute.audit_passed !== true) fail("AG56.4 article label/route status must pass.");
if (ag56_4LabelRoute.route_status.route_created_now !== false) fail("AG56.4 route status must remain not created.");
if (!ag56_4Boundary.boundary_rules.includes("AG56.4 does not update homepage or module surfaces.")) fail("AG56.4 homepage/module boundary missing.");
if (ag56_4Readiness.ready_for_ag56_5 !== true) fail("AG56.4 readiness must permit AG56.5.");
if (ag56_4BoundaryTo5.next_stage_id !== "AG56.5") fail("AG56.4 boundary must point to AG56.5.");

for (const file of [
  "data/content-intelligence/backend-architecture/ag56-4-no-live-route-deployment-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag56-4-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag56-4-no-go-live-decision-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag56-5-homepage-module-surface-verification.json");
const source = readJson("data/content-intelligence/content-loop/ag56-5-source-consumption-record.json");
const homepage = readJson("data/content-intelligence/content-loop/ag56-5-homepage-surface-manifest-verification-record.json");
const modulePlacement = readJson("data/content-intelligence/content-loop/ag56-5-module-surface-placement-verification-record.json");
const featuredReads = readJson("data/content-intelligence/content-loop/ag56-5-featured-reads-surface-verification-record.json");
const verificationBoundary = readJson("data/content-intelligence/content-loop/ag56-5-homepage-module-surface-verification-boundary.json");
const noHomepageMutation = readJson("data/content-intelligence/backend-architecture/ag56-5-no-homepage-live-mutation-deployment-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag56-5-no-backend-auth-rls-database-runtime-audit.json");
const noGoLive = readJson("data/content-intelligence/backend-architecture/ag56-5-no-go-live-decision-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag56-5-ag56-6-word-panchang-reflection-vedic-preview-smoke-test-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag56-5-to-ag56-6-word-panchang-reflection-vedic-preview-smoke-test-boundary.json");
const preview = readJson("data/quality/ag56-5-homepage-module-surface-verification-preview.json");
const pkg = readJson("package.json");

if (review.status !== "homepage_module_surface_verification_ready_for_ag56_6") fail("AG56.5 review status mismatch.");

for (const key of [
  "ag56_5_homepage_module_surface_verification_recorded",
  "ag56_4_consumed",
  "homepage_surface_manifest_verified",
  "module_surface_placement_verified",
  "featured_reads_surface_verified",
  "homepage_module_surface_verification_completed",
  "ready_for_ag56_6_word_panchang_reflection_vedic_preview_smoke_test"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag56_6 !== 0) fail("AG56.6 hard blocker count must be zero.");
if (source.status !== "source_consumption_recorded") fail("Source consumption mismatch.");
if (!Object.prototype.hasOwnProperty.call(source.consumed_surface_context, "ag45_homepage_first_light_context")) fail("AG45 homepage context key missing.");
if (!Object.prototype.hasOwnProperty.call(source.consumed_surface_context, "ag46_featured_reads_context")) fail("AG46 Featured Reads context key missing.");

if (homepage.audit_passed !== true) fail("Homepage surface manifest verification must pass.");
if (homepage.homepage_candidate_slot.visibility !== "not_live") fail("Homepage candidate slot must remain not live.");
if (homepage.homepage_candidate_slot.slot_status !== "surface_manifest_ready_not_mutated") fail("Homepage slot status mismatch.");
if (homepage.live_homepage_updated_now !== false) fail("Homepage must not update live.");
if (homepage.homepage_surface_mutated_now !== false) fail("Homepage surface must not mutate.");
for (const check of homepage.verification_checks) {
  if (check.passed !== true) fail(`Homepage verification check failed: ${check.check_id}`);
}

if (modulePlacement.audit_passed !== true) fail("Module surface placement must pass.");
if (modulePlacement.module_surface_rows.length < 4) fail("Module placement rows must include required surfaces.");
if (modulePlacement.module_surface_mutated_now !== false) fail("Module surfaces must not mutate.");
if (!JSON.stringify(modulePlacement.module_surface_rows).includes("ready_for_ag56_6_preview_smoke_test")) fail("AG56.6 preview smoke-test placement missing.");

if (featuredReads.audit_passed !== true) fail("Featured Reads surface verification must pass.");
if (featuredReads.featured_reads_manifest_state.status !== "controlled_surface_manifest_only_not_live") fail("Featured Reads manifest must remain not live.");
if (featuredReads.featured_reads_manifest_state.live_listing_updated_now !== false) fail("Featured Reads listing must not update live.");
if (featuredReads.featured_reads_manifest_state.public_route_created_now !== false) fail("Featured Reads route must not be created.");
if (featuredReads.featured_reads_manifest_state.homepage_updated_now !== false) fail("Featured Reads homepage must not update.");

for (const rule of [
  "AG56.5 verifies homepage and module surface readiness records only.",
  "AG56.5 does not update the live homepage.",
  "AG56.5 does not update the live listing.",
  "AG56.5 does not create a live public route or URL.",
  "AG56.5 does not mutate Featured Reads, homepage or module surfaces.",
  "AG56.5 does not make a go-live decision."
]) {
  if (!verificationBoundary.boundary_rules.includes(rule)) fail(`Verification boundary missing: ${rule}`);
}

for (const audit of [noHomepageMutation, noBackend, noGoLive]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag56_6_word_panchang_reflection_vedic_preview_smoke_test") fail("AG56.6 readiness status mismatch.");
if (readiness.ready_for_ag56_6 !== true) fail("AG56.6 readiness must be true.");
if (readiness.next_stage_id !== "AG56.6") fail("Readiness must point to AG56.6.");
if (boundary.next_stage_id !== "AG56.6") fail("Boundary must point to AG56.6.");

for (const blocked of [
  "live Panchang calculation/API call",
  "live Word/reflection generation",
  "live Vedic guidance generation",
  "homepage live update",
  "public page mutation",
  "deployment or Vercel trigger",
  "live public check",
  "go-live decision",
  "backend/Auth/Supabase activation",
  "runtime database/API reading",
  "service-role use",
  "V02 expansion"
]) {
  if (!readiness.ag56_6_blocked_scope.includes(blocked)) fail(`AG56.6 blocked scope missing: ${blocked}`);
}

for (const key of [
  "live_homepage_updated",
  "live_listing_updated",
  "live_featured_reads_surface_updated",
  "public_route_created",
  "public_url_live",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_page_mutation_enabled",
  "homepage_surface_mutated_now",
  "module_surface_mutated_now",
  "featured_reads_manifest_mutated_now",
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
  "ag56_6_preview_smoke_test_executed",
  "panchang_live_calculation_enabled",
  "word_reflection_live_generation_enabled",
  "vedic_preview_live_generation_enabled",
  "ag56_8_go_live_decision_made",
  "actual_go_live_approval_granted",
  "v02_item_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag56-5"]) fail("Missing package script: generate:ag56-5");
if (!pkg.scripts?.["validate:ag56-5"]) fail("Missing package script: validate:ag56-5");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag56-5")) fail("validate:project must include validate:ag56-5.");

pass("AG56.5 Homepage and Module Surface Verification is present.");
pass("AG56.4 public URL/listing verification is consumed.");
pass("Homepage surface manifest verification is valid.");
pass("Module surface placement verification is valid.");
pass("Featured Reads surface verification is valid.");
pass("Homepage/module verification boundary is valid.");
pass("No homepage live mutation/deployment audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("No go-live decision audit is valid.");
pass("AG56.6 Word/Panchang/Reflection/Vedic preview smoke-test readiness is valid.");
