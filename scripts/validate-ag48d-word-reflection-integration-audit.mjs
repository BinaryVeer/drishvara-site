import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG48D validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag48a-word-bank-rotation-consumption.json",
  "data/content-intelligence/word-reflection/ag48a-word-bank-consumption-record.json",
  "data/content-intelligence/word-reflection/ag48a-rotation-policy-consumption-record.json",
  "data/content-intelligence/word-reflection/ag48a-word-approval-status-boundary.json",
  "data/content-intelligence/word-reflection/ag48a-repeat-control-boundary.json",
  "data/content-intelligence/word-reflection/ag48a-reflection-readiness-seed-record.json",
  "data/content-intelligence/backend-architecture/ag48a-no-personalisation-auth-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag48a-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag48a-no-public-word-generation-audit.json",

  "data/content-intelligence/quality-reviews/ag48b-multilingual-language-safety-review.json",
  "data/content-intelligence/word-reflection/ag48b-multilingual-field-safety-audit.json",
  "data/content-intelligence/word-reflection/ag48b-sanskrit-hindi-english-meaning-boundary.json",
  "data/content-intelligence/word-reflection/ag48b-transliteration-script-integrity-boundary.json",
  "data/content-intelligence/word-reflection/ag48b-language-toggle-stability-review.json",
  "data/content-intelligence/word-reflection/ag48b-unreviewed-sanskrit-mantra-publication-blocker.json",
  "data/content-intelligence/word-reflection/ag48b-reflection-language-safety-handoff.json",
  "data/content-intelligence/backend-architecture/ag48b-no-personalisation-auth-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag48b-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag48b-no-public-language-generation-audit.json",

  "data/content-intelligence/quality-reviews/ag48c-reflection-homepage-integration.json",
  "data/content-intelligence/word-reflection/ag48c-reflection-prompt-integration-record.json",
  "data/content-intelligence/word-reflection/ag48c-homepage-discover-reflect-surface-map.json",
  "data/content-intelligence/word-reflection/ag48c-static-reflection-display-boundary.json",
  "data/content-intelligence/word-reflection/ag48c-discover-read-reflect-flow-readiness-record.json",
  "data/content-intelligence/word-reflection/ag48c-no-personalisation-reflection-boundary.json",
  "data/content-intelligence/word-reflection/ag48c-ag48d-integration-gap-register.json",
  "data/content-intelligence/backend-architecture/ag48c-no-personalisation-auth-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag48c-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag48c-no-public-reflection-generation-audit.json",
  "data/content-intelligence/quality-registry/ag48c-ag48d-word-reflection-integration-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag48c-to-ag48d-word-reflection-integration-audit-boundary.json",

  "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag48d-word-reflection-integration-audit.json",
  "data/content-intelligence/word-reflection/ag48d-integrated-word-reflection-audit.json",
  "data/content-intelligence/word-reflection/ag48d-language-and-toggle-continuity-audit.json",
  "data/content-intelligence/word-reflection/ag48d-homepage-surface-integration-audit.json",
  "data/content-intelligence/word-reflection/ag48d-public-use-and-review-gate-audit.json",
  "data/content-intelligence/word-reflection/ag48d-ag48z-closure-gap-register.json",
  "data/content-intelligence/backend-architecture/ag48d-no-personalisation-auth-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag48d-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag48d-no-public-word-reflection-output-audit.json",
  "data/content-intelligence/quality-registry/ag48d-ag48z-word-reflection-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag48d-to-ag48z-word-reflection-closure-boundary.json",
  "data/quality/ag48d-word-reflection-integration-audit.json",
  "data/quality/ag48d-word-reflection-integration-audit-preview.json",
  "docs/quality/AG48D_WORD_REFLECTION_INTEGRATION_AUDIT.md",
  "scripts/generate-ag48d-word-reflection-integration-audit.mjs",
  "scripts/validate-ag48d-word-reflection-integration-audit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag48aReview = readJson("data/content-intelligence/quality-reviews/ag48a-word-bank-rotation-consumption.json");
const ag48aApproval = readJson("data/content-intelligence/word-reflection/ag48a-word-approval-status-boundary.json");
const ag48aReflection = readJson("data/content-intelligence/word-reflection/ag48a-reflection-readiness-seed-record.json");
const ag48aNoAuth = readJson("data/content-intelligence/backend-architecture/ag48a-no-personalisation-auth-activation-audit.json");
const ag48aNoRuntime = readJson("data/content-intelligence/backend-architecture/ag48a-no-runtime-api-deployment-audit.json");
const ag48aNoPublic = readJson("data/content-intelligence/backend-architecture/ag48a-no-public-word-generation-audit.json");

const ag48bReview = readJson("data/content-intelligence/quality-reviews/ag48b-multilingual-language-safety-review.json");
const ag48bToggle = readJson("data/content-intelligence/word-reflection/ag48b-language-toggle-stability-review.json");
const ag48bMantraBlocker = readJson("data/content-intelligence/word-reflection/ag48b-unreviewed-sanskrit-mantra-publication-blocker.json");
const ag48bNoAuth = readJson("data/content-intelligence/backend-architecture/ag48b-no-personalisation-auth-activation-audit.json");
const ag48bNoRuntime = readJson("data/content-intelligence/backend-architecture/ag48b-no-runtime-api-deployment-audit.json");
const ag48bNoPublic = readJson("data/content-intelligence/backend-architecture/ag48b-no-public-language-generation-audit.json");

const ag48cReview = readJson("data/content-intelligence/quality-reviews/ag48c-reflection-homepage-integration.json");
const ag48cPrompt = readJson("data/content-intelligence/word-reflection/ag48c-reflection-prompt-integration-record.json");
const ag48cHomepageMap = readJson("data/content-intelligence/word-reflection/ag48c-homepage-discover-reflect-surface-map.json");
const ag48cFlow = readJson("data/content-intelligence/word-reflection/ag48c-discover-read-reflect-flow-readiness-record.json");
const ag48cGapRegister = readJson("data/content-intelligence/word-reflection/ag48c-ag48d-integration-gap-register.json");
const ag48cNoAuth = readJson("data/content-intelligence/backend-architecture/ag48c-no-personalisation-auth-activation-audit.json");
const ag48cNoRuntime = readJson("data/content-intelligence/backend-architecture/ag48c-no-runtime-api-deployment-audit.json");
const ag48cNoPublic = readJson("data/content-intelligence/backend-architecture/ag48c-no-public-reflection-generation-audit.json");
const ag48cReadiness = readJson("data/content-intelligence/quality-registry/ag48c-ag48d-word-reflection-integration-audit-readiness-record.json");
const ag48cBoundary = readJson("data/content-intelligence/mutation-plans/ag48c-to-ag48d-word-reflection-integration-audit-boundary.json");

if (ag48aReview.status !== "word_bank_rotation_consumed_ready_for_ag48b") fail("AG48A status mismatch.");
if (ag48aApproval.default_public_use_allowed !== false) fail("AG48A public-use default must remain false.");
if (ag48aReflection.reflection_position.public_generated_reflection_disabled_now !== true) fail("AG48A generated reflection must remain disabled.");
if (ag48aNoAuth.audit_passed !== true) fail("AG48A no-auth audit must pass.");
if (ag48aNoRuntime.audit_passed !== true) fail("AG48A no-runtime audit must pass.");
if (ag48aNoPublic.audit_passed !== true) fail("AG48A no-public audit must pass.");

if (ag48bReview.status !== "multilingual_language_safety_ready_for_ag48c") fail("AG48B status mismatch.");
if (ag48bToggle.language_toggle_runtime_mutation_enabled !== false) fail("AG48B toggle runtime mutation must be disabled.");
if (ag48bToggle.needs_later_ui_smoke_test !== true) fail("AG48B must require later UI smoke test.");
if (ag48bMantraBlocker.unreviewed_sanskrit_mantra_publication_allowed !== false) fail("AG48B Sanskrit/mantra blocker must remain false.");
if (ag48bNoAuth.audit_passed !== true) fail("AG48B no-auth audit must pass.");
if (ag48bNoRuntime.audit_passed !== true) fail("AG48B no-runtime audit must pass.");
if (ag48bNoPublic.audit_passed !== true) fail("AG48B no-public audit must pass.");

if (ag48cReview.status !== "reflection_homepage_integration_ready_for_ag48d") fail("AG48C status mismatch.");
if (ag48cPrompt.integration_boundary.use_public_generation_engine !== false) fail("AG48C public generation engine must remain disabled.");
if (ag48cHomepageMap.display_policy.homepage_runtime_query_enabled !== false) fail("AG48C homepage runtime query must be disabled.");
if (ag48cFlow.requires_later_ui_smoke_test !== true) fail("AG48C must require later UI smoke test.");
if (ag48cGapRegister.ag48d_audit_allowed !== true) fail("AG48D audit must be allowed.");
if (ag48cGapRegister.blocking_gaps_for_ag48d.length !== 0) fail("AG48D blocking gaps must be zero.");
if (ag48cNoAuth.audit_passed !== true) fail("AG48C no-auth audit must pass.");
if (ag48cNoRuntime.audit_passed !== true) fail("AG48C no-runtime audit must pass.");
if (ag48cNoPublic.audit_passed !== true) fail("AG48C no-public audit must pass.");
if (ag48cReadiness.ready_for_ag48d !== true) fail("AG48C readiness must permit AG48D.");
if (ag48cBoundary.next_stage_id !== "AG48D") fail("AG48C boundary must point to AG48D.");

const review = readJson("data/content-intelligence/quality-reviews/ag48d-word-reflection-integration-audit.json");
const integratedAudit = readJson("data/content-intelligence/word-reflection/ag48d-integrated-word-reflection-audit.json");
const languageToggleContinuityAudit = readJson("data/content-intelligence/word-reflection/ag48d-language-and-toggle-continuity-audit.json");
const homepageSurfaceAudit = readJson("data/content-intelligence/word-reflection/ag48d-homepage-surface-integration-audit.json");
const publicUseReviewGateAudit = readJson("data/content-intelligence/word-reflection/ag48d-public-use-and-review-gate-audit.json");
const ag48zClosureGapRegister = readJson("data/content-intelligence/word-reflection/ag48d-ag48z-closure-gap-register.json");
const noPersonalisationAuthAudit = readJson("data/content-intelligence/backend-architecture/ag48d-no-personalisation-auth-activation-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag48d-no-runtime-api-deployment-audit.json");
const noPublicOutputAudit = readJson("data/content-intelligence/backend-architecture/ag48d-no-public-word-reflection-output-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag48d-ag48z-word-reflection-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag48d-to-ag48z-word-reflection-closure-boundary.json");
const preview = readJson("data/quality/ag48d-word-reflection-integration-audit-preview.json");
const pkg = readJson("package.json");

if (review.status !== "word_reflection_integration_audit_ready_for_ag48z") fail("AG48D review status mismatch.");

for (const key of [
  "ag48d_word_reflection_integration_audit_recorded",
  "ag48a_ag48b_ag48c_consumed",
  "word_rotation_language_reflection_boundaries_consistent",
  "homepage_reflection_surface_audited",
  "public_use_review_gate_audited",
  "ag48z_closure_gap_register_recorded",
  "ready_for_ag48z_word_reflection_closure"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag48z !== 0) fail("AG48Z blocker count must be zero.");

for (const key of [
  "word_publication_approved_now",
  "word_publication_executed",
  "public_word_generated_now",
  "reflection_publication_approved_now",
  "public_reflection_generated_now",
  "reviewed_static_reflection_runtime_enabled_now",
  "user_personalised_reflection_enabled",
  "personalisation_auth_activation_approved",
  "personalisation_auth_activation_performed",
  "unreviewed_sanskrit_mantra_publication_allowed",
  "auto_translation_publication_allowed",
  "auto_transliteration_publication_allowed",
  "language_toggle_runtime_mutation_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_generated_word_reflection_output",
  "public_content_generated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (integratedAudit.status !== "integrated_word_reflection_audit_passed") fail("Integrated audit status mismatch.");
if (integratedAudit.audit_result !== "passed") fail("Integrated audit must pass.");

if (languageToggleContinuityAudit.status !== "language_toggle_continuity_audit_passed") fail("Language continuity audit status mismatch.");
if (languageToggleContinuityAudit.later_ui_smoke_test_required !== true) fail("Later UI smoke test must be required.");
if (languageToggleContinuityAudit.audit_result !== "passed") fail("Language continuity audit must pass.");

if (homepageSurfaceAudit.status !== "homepage_surface_integration_audit_passed") fail("Homepage surface audit status mismatch.");
if (!homepageSurfaceAudit.blocked_v01_surface_position.includes("AI-generated daily reflection")) fail("AI-generated daily reflection must be blocked.");
if (!homepageSurfaceAudit.blocked_v01_surface_position.includes("live database-fed word rotation")) fail("Live database-fed rotation must be blocked.");

if (publicUseReviewGateAudit.status !== "public_use_review_gate_audit_passed") fail("Public-use review gate audit status mismatch.");
if (publicUseReviewGateAudit.default_public_use_allowed !== false) fail("Default public use must be false.");

if (ag48zClosureGapRegister.status !== "ag48z_closure_gap_register_recorded") fail("AG48Z closure gap register status mismatch.");
if (ag48zClosureGapRegister.blocking_gaps_for_ag48z.length !== 0) fail("AG48Z blocking gaps must be zero.");
if (ag48zClosureGapRegister.ag48z_closure_allowed !== true) fail("AG48Z closure must be allowed.");

if (noPersonalisationAuthAudit.audit_passed !== true) fail("No personalisation/Auth audit must pass.");
if (noPersonalisationAuthAudit.failed_checks.length !== 0) fail("No personalisation/Auth failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (noPublicOutputAudit.audit_passed !== true) fail("No public output audit must pass.");
if (noPublicOutputAudit.failed_checks.length !== 0) fail("No public output failed checks must be zero.");

if (readiness.status !== "ready_for_ag48z_word_reflection_closure") fail("AG48Z readiness status mismatch.");
if (readiness.ready_for_ag48z !== true) fail("AG48Z readiness must be true.");
if (readiness.next_stage_id !== "AG48Z") fail("Readiness must point to AG48Z.");
if (!readiness.ag48z_allowed_scope.includes("Create handoff to AG49A User/Profile Model Consumption and Gap Review.")) fail("AG48Z must hand off to AG49A.");

if (boundary.next_stage_id !== "AG48Z") fail("Boundary must point to AG48Z.");

for (const key of [
  "ag48d_word_reflection_integration_audit_recorded",
  "ag48a_ag48b_ag48c_consumed",
  "word_rotation_language_reflection_boundaries_consistent",
  "homepage_reflection_surface_audited",
  "public_use_review_gate_audited",
  "ag48z_closure_gap_register_recorded",
  "ready_for_ag48z_word_reflection_closure"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "word_publication_approved_now",
  "word_publication_executed",
  "public_word_generated_now",
  "reflection_publication_approved_now",
  "public_reflection_generated_now",
  "reviewed_static_reflection_runtime_enabled_now",
  "user_personalised_reflection_enabled",
  "personalisation_auth_activation_approved",
  "personalisation_auth_activation_performed",
  "unreviewed_sanskrit_mantra_publication_allowed",
  "auto_translation_publication_allowed",
  "auto_transliteration_publication_allowed",
  "language_toggle_runtime_mutation_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_generated_word_reflection_output",
  "public_content_generated"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag48d"]) fail("Missing package script: generate:ag48d");
if (!pkg.scripts?.["validate:ag48d"]) fail("Missing package script: validate:ag48d");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag48d")) fail("validate:project must include validate:ag48d.");

pass("AG48D Word/Reflection Integration Audit is present.");
pass("AG48A, AG48B and AG48C inputs are consumed.");
pass("Integrated word/reflection audit is valid.");
pass("Language and toggle continuity audit is valid.");
pass("Homepage surface integration audit is valid.");
pass("Public-use and review gate audit is valid.");
pass("AG48Z closure gap register is valid.");
pass("No personalisation/Auth activation audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("No public word/reflection output audit is valid.");
pass("AG48Z Word and Reflection Closure readiness is valid.");
