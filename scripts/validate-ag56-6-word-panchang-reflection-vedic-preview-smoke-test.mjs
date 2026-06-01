import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG56.6 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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

  "data/content-intelligence/quality-reviews/ag56-6-word-panchang-reflection-vedic-preview-smoke-test.json",
  "data/content-intelligence/content-loop/ag56-6-source-consumption-record.json",
  "data/content-intelligence/content-loop/ag56-6-word-preview-smoke-test-record.json",
  "data/content-intelligence/content-loop/ag56-6-panchang-preview-smoke-test-record.json",
  "data/content-intelligence/content-loop/ag56-6-reflection-preview-smoke-test-record.json",
  "data/content-intelligence/content-loop/ag56-6-vedic-preview-smoke-test-record.json",
  "data/content-intelligence/content-loop/ag56-6-preview-module-compatibility-record.json",
  "data/content-intelligence/content-loop/ag56-6-preview-smoke-test-boundary.json",
  "data/content-intelligence/backend-architecture/ag56-6-no-live-generation-api-calculation-audit.json",
  "data/content-intelligence/backend-architecture/ag56-6-no-deployment-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag56-6-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag56-6-ag56-7-audit-log-rollback-readiness-verification-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag56-6-to-ag56-7-audit-log-rollback-readiness-verification-boundary.json",
  "data/quality/ag56-6-word-panchang-reflection-vedic-preview-smoke-test.json",
  "data/quality/ag56-6-word-panchang-reflection-vedic-preview-smoke-test-preview.json",
  "docs/quality/AG56_6_WORD_PANCHANG_REFLECTION_VEDIC_PREVIEW_SMOKE_TEST.md",
  "scripts/generate-ag56-6-word-panchang-reflection-vedic-preview-smoke-test.mjs",
  "scripts/validate-ag56-6-word-panchang-reflection-vedic-preview-smoke-test.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag56_5Review = readJson("data/content-intelligence/quality-reviews/ag56-5-homepage-module-surface-verification.json");
const ag56_5Homepage = readJson("data/content-intelligence/content-loop/ag56-5-homepage-surface-manifest-verification-record.json");
const ag56_5Module = readJson("data/content-intelligence/content-loop/ag56-5-module-surface-placement-verification-record.json");
const ag56_5Featured = readJson("data/content-intelligence/content-loop/ag56-5-featured-reads-surface-verification-record.json");
const ag56_5Boundary = readJson("data/content-intelligence/content-loop/ag56-5-homepage-module-surface-verification-boundary.json");
const ag56_5Readiness = readJson("data/content-intelligence/quality-registry/ag56-5-ag56-6-word-panchang-reflection-vedic-preview-smoke-test-readiness-record.json");
const ag56_5BoundaryTo6 = readJson("data/content-intelligence/mutation-plans/ag56-5-to-ag56-6-word-panchang-reflection-vedic-preview-smoke-test-boundary.json");

if (ag56_5Review.status !== "homepage_module_surface_verification_ready_for_ag56_6") fail("AG56.5 status mismatch.");
if (ag56_5Review.summary.ready_for_ag56_6_word_panchang_reflection_vedic_preview_smoke_test !== true) fail("AG56.5 must be ready for AG56.6.");
if (ag56_5Homepage.audit_passed !== true) fail("AG56.5 homepage manifest must pass.");
if (ag56_5Homepage.live_homepage_updated_now !== false) fail("AG56.5 homepage must not update live.");
if (ag56_5Module.audit_passed !== true) fail("AG56.5 module placement must pass.");
if (ag56_5Module.module_surface_mutated_now !== false) fail("AG56.5 module surface must not mutate.");
if (ag56_5Featured.audit_passed !== true) fail("AG56.5 Featured Reads verification must pass.");
if (ag56_5Featured.featured_reads_manifest_state.status !== "controlled_surface_manifest_only_not_live") fail("AG56.5 Featured Reads surface must remain not live.");
if (!ag56_5Boundary.boundary_rules.includes("AG56.5 does not make a go-live decision.")) fail("AG56.5 go-live boundary missing.");
if (ag56_5Readiness.ready_for_ag56_6 !== true) fail("AG56.5 readiness must permit AG56.6.");
if (ag56_5BoundaryTo6.next_stage_id !== "AG56.6") fail("AG56.5 boundary must point to AG56.6.");

for (const file of [
  "data/content-intelligence/backend-architecture/ag56-5-no-homepage-live-mutation-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag56-5-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag56-5-no-go-live-decision-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag56-6-word-panchang-reflection-vedic-preview-smoke-test.json");
const source = readJson("data/content-intelligence/content-loop/ag56-6-source-consumption-record.json");
const word = readJson("data/content-intelligence/content-loop/ag56-6-word-preview-smoke-test-record.json");
const panchang = readJson("data/content-intelligence/content-loop/ag56-6-panchang-preview-smoke-test-record.json");
const reflection = readJson("data/content-intelligence/content-loop/ag56-6-reflection-preview-smoke-test-record.json");
const vedic = readJson("data/content-intelligence/content-loop/ag56-6-vedic-preview-smoke-test-record.json");
const compatibility = readJson("data/content-intelligence/content-loop/ag56-6-preview-module-compatibility-record.json");
const smokeBoundary = readJson("data/content-intelligence/content-loop/ag56-6-preview-smoke-test-boundary.json");
const noLiveGeneration = readJson("data/content-intelligence/backend-architecture/ag56-6-no-live-generation-api-calculation-audit.json");
const noDeploymentMutation = readJson("data/content-intelligence/backend-architecture/ag56-6-no-deployment-public-mutation-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag56-6-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag56-6-ag56-7-audit-log-rollback-readiness-verification-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag56-6-to-ag56-7-audit-log-rollback-readiness-verification-boundary.json");
const preview = readJson("data/quality/ag56-6-word-panchang-reflection-vedic-preview-smoke-test-preview.json");
const pkg = readJson("package.json");

if (review.status !== "word_panchang_reflection_vedic_preview_smoke_test_ready_for_ag56_7") fail("AG56.6 review status mismatch.");

for (const key of [
  "ag56_6_word_panchang_reflection_vedic_preview_smoke_test_recorded",
  "ag56_5_consumed",
  "ag47_panchang_festival_vedic_context_consumed",
  "ag48_word_reflection_context_consumed",
  "word_preview_smoke_test_recorded",
  "panchang_preview_smoke_test_recorded",
  "reflection_preview_smoke_test_recorded",
  "vedic_preview_smoke_test_recorded",
  "preview_module_compatibility_recorded",
  "ready_for_ag56_7_audit_log_rollback_readiness_verification"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag56_7 !== 0) fail("AG56.7 hard blocker count must be zero.");
if (source.status !== "source_consumption_recorded") fail("Source consumption mismatch.");
if (!Object.prototype.hasOwnProperty.call(source.consumed_preview_context, "ag47_panchang_festival_vedic_context")) fail("AG47 context key missing.");
if (!Object.prototype.hasOwnProperty.call(source.consumed_preview_context, "ag48_word_reflection_context")) fail("AG48 context key missing.");

if (word.audit_passed !== true) fail("Word preview must pass.");
if (word.preview_state !== "static_preview_record_only_not_live") fail("Word preview must remain static only.");
if (word.live_word_generation_enabled_now !== false) fail("Word live generation must remain disabled.");
if (word.public_surface_mutated_now !== false) fail("Word surface must not mutate.");

if (panchang.audit_passed !== true) fail("Panchang preview must pass.");
if (panchang.preview_mode !== "static_placeholder_preview_only") fail("Panchang must remain static placeholder only.");
if (panchang.live_panchang_calculation_enabled_now !== false) fail("Live Panchang calculation must remain disabled.");
if (panchang.live_panchang_api_called_now !== false) fail("Panchang API must not be called.");

if (reflection.audit_passed !== true) fail("Reflection preview must pass.");
if (reflection.preview_state !== "static_preview_record_only_not_live") fail("Reflection preview must remain static only.");
if (reflection.live_reflection_generation_enabled_now !== false) fail("Reflection live generation must remain disabled.");
if (reflection.public_surface_mutated_now !== false) fail("Reflection surface must not mutate.");

if (vedic.audit_passed !== true) fail("Vedic preview must pass.");
if (vedic.guidance_boundary !== "general_reflective_non_diagnostic_non_deterministic") fail("Vedic guidance boundary mismatch.");
if (vedic.live_vedic_guidance_generation_enabled_now !== false) fail("Vedic live generation must remain disabled.");
if (vedic.live_astrology_api_called_now !== false) fail("Astrology API must not be called.");

if (compatibility.audit_passed !== true) fail("Preview module compatibility must pass.");
if (compatibility.compatibility_matrix.length !== 4) fail("Compatibility matrix must contain four preview modules.");
if (compatibility.overall_position !== "preview_smoke_test_passed_static_non_live") fail("Compatibility position mismatch.");
for (const row of compatibility.compatibility_matrix) {
  if (row.surface_compatible !== true) fail(`Compatibility failed for ${row.module}`);
  if (row.live_mutation !== false) fail(`Live mutation must be false for ${row.module}`);
}

for (const rule of [
  "AG56.6 smoke-tests static preview records only.",
  "AG56.6 does not enable live Word generation.",
  "AG56.6 does not calculate Panchang live or call Panchang APIs.",
  "AG56.6 does not generate live Vedic guidance or call astrology APIs.",
  "AG56.6 does not update homepage, article, listing or public module surfaces.",
  "AG56.6 does not make a go-live decision."
]) {
  if (!smokeBoundary.boundary_rules.includes(rule)) fail(`Smoke-test boundary missing: ${rule}`);
}

for (const audit of [noLiveGeneration, noDeploymentMutation, noBackend]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag56_7_audit_log_rollback_readiness_verification") fail("AG56.7 readiness status mismatch.");
if (readiness.ready_for_ag56_7 !== true) fail("AG56.7 readiness must be true.");
if (readiness.next_stage_id !== "AG56.7") fail("Readiness must point to AG56.7.");
if (boundary.next_stage_id !== "AG56.7") fail("Boundary must point to AG56.7.");

for (const blocked of [
  "actual rollback execution",
  "git revert/reset execution",
  "runtime audit-log activation",
  "deployment or Vercel trigger",
  "live public check",
  "public page mutation",
  "go-live decision",
  "backend/Auth/Supabase activation",
  "runtime database/API reading",
  "service-role use",
  "V02 expansion"
]) {
  if (!readiness.ag56_7_blocked_scope.includes(blocked)) fail(`AG56.7 blocked scope missing: ${blocked}`);
}

for (const key of [
  "live_word_generation_enabled",
  "live_reflection_generation_enabled",
  "live_panchang_calculation_enabled",
  "live_panchang_api_called",
  "live_vedic_guidance_generation_enabled",
  "live_astrology_api_called",
  "automated_external_fetch_enabled",
  "homepage_live_updated",
  "public_page_mutation_enabled",
  "public_content_mutation_enabled",
  "content_publishing_enabled",
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
  "ag56_7_audit_log_rollback_verification_executed",
  "rollback_operation_executed",
  "audit_log_runtime_enabled",
  "ag56_8_go_live_decision_made",
  "actual_go_live_approval_granted",
  "v02_item_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag56-6"]) fail("Missing package script: generate:ag56-6");
if (!pkg.scripts?.["validate:ag56-6"]) fail("Missing package script: validate:ag56-6");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag56-6")) fail("validate:project must include validate:ag56-6.");

pass("AG56.6 Word/Panchang/Reflection/Vedic Preview Smoke Test is present.");
pass("AG56.5 homepage/module surface verification is consumed.");
pass("Word preview smoke test is valid.");
pass("Panchang preview smoke test is valid.");
pass("Reflection preview smoke test is valid.");
pass("Vedic preview smoke test is valid.");
pass("Preview module compatibility record is valid.");
pass("Preview smoke-test boundary is valid.");
pass("No live generation/API calculation audit is valid.");
pass("No deployment/public mutation audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG56.7 audit-log and rollback readiness verification readiness is valid.");
