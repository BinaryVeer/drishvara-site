import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG48Z validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",

  "data/content-intelligence/quality-reviews/ag48a-word-bank-rotation-consumption.json",
  "data/content-intelligence/word-reflection/ag48a-word-approval-status-boundary.json",
  "data/content-intelligence/word-reflection/ag48a-reflection-readiness-seed-record.json",

  "data/content-intelligence/quality-reviews/ag48b-multilingual-language-safety-review.json",
  "data/content-intelligence/word-reflection/ag48b-language-toggle-stability-review.json",
  "data/content-intelligence/word-reflection/ag48b-unreviewed-sanskrit-mantra-publication-blocker.json",

  "data/content-intelligence/quality-reviews/ag48c-reflection-homepage-integration.json",
  "data/content-intelligence/word-reflection/ag48c-reflection-prompt-integration-record.json",
  "data/content-intelligence/word-reflection/ag48c-homepage-discover-reflect-surface-map.json",
  "data/content-intelligence/word-reflection/ag48c-static-reflection-display-boundary.json",
  "data/content-intelligence/word-reflection/ag48c-discover-read-reflect-flow-readiness-record.json",
  "data/content-intelligence/word-reflection/ag48c-no-personalisation-reflection-boundary.json",

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

  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag48z-word-reflection-closure.json",
  "data/content-intelligence/word-reflection/ag48z-word-reflection-closure-record.json",
  "data/content-intelligence/word-reflection/ag48z-ag48a-to-ag48d-consumption-summary.json",
  "data/content-intelligence/word-reflection/ag48z-carry-forward-deferral-register.json",
  "data/content-intelligence/word-reflection/ag48z-public-surface-closure-position.json",
  "data/content-intelligence/ag-roadmap/ag48z-ag49a-user-profile-model-handoff.json",
  "data/content-intelligence/backend-architecture/ag48z-no-personalisation-auth-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag48z-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag48z-no-public-word-reflection-output-audit.json",
  "data/content-intelligence/backend-architecture/ag48z-no-secret-exposure-audit.json",
  "data/content-intelligence/quality-registry/ag48z-ag49a-user-profile-model-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag48z-to-ag49a-user-profile-model-boundary.json",
  "data/quality/ag48z-word-reflection-closure.json",
  "data/quality/ag48z-word-reflection-closure-preview.json",
  "docs/quality/AG48Z_WORD_REFLECTION_CLOSURE.md",
  "scripts/generate-ag48z-word-reflection-closure.mjs",
  "scripts/validate-ag48z-word-reflection-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag47rSourceOfTruth = readJson("data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG48 remains Word of the Day and Reflection")) fail("AG48 source-of-truth missing.");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG49 remains User Accounts and Personalisation")) fail("AG49 source-of-truth missing.");

const ag48aReview = readJson("data/content-intelligence/quality-reviews/ag48a-word-bank-rotation-consumption.json");
const ag48aApproval = readJson("data/content-intelligence/word-reflection/ag48a-word-approval-status-boundary.json");
const ag48aReflection = readJson("data/content-intelligence/word-reflection/ag48a-reflection-readiness-seed-record.json");

const ag48bReview = readJson("data/content-intelligence/quality-reviews/ag48b-multilingual-language-safety-review.json");
const ag48bToggle = readJson("data/content-intelligence/word-reflection/ag48b-language-toggle-stability-review.json");
const ag48bMantraBlocker = readJson("data/content-intelligence/word-reflection/ag48b-unreviewed-sanskrit-mantra-publication-blocker.json");

const ag48cReview = readJson("data/content-intelligence/quality-reviews/ag48c-reflection-homepage-integration.json");
const ag48cPrompt = readJson("data/content-intelligence/word-reflection/ag48c-reflection-prompt-integration-record.json");
const ag48cHomepageMap = readJson("data/content-intelligence/word-reflection/ag48c-homepage-discover-reflect-surface-map.json");
const ag48cStaticDisplay = readJson("data/content-intelligence/word-reflection/ag48c-static-reflection-display-boundary.json");
const ag48cFlow = readJson("data/content-intelligence/word-reflection/ag48c-discover-read-reflect-flow-readiness-record.json");
const ag48cNoPersonalisation = readJson("data/content-intelligence/word-reflection/ag48c-no-personalisation-reflection-boundary.json");

const ag48dReview = readJson("data/content-intelligence/quality-reviews/ag48d-word-reflection-integration-audit.json");
const ag48dIntegratedAudit = readJson("data/content-intelligence/word-reflection/ag48d-integrated-word-reflection-audit.json");
const ag48dLanguageAudit = readJson("data/content-intelligence/word-reflection/ag48d-language-and-toggle-continuity-audit.json");
const ag48dPublicUseAudit = readJson("data/content-intelligence/word-reflection/ag48d-public-use-and-review-gate-audit.json");
const ag48dGapRegister = readJson("data/content-intelligence/word-reflection/ag48d-ag48z-closure-gap-register.json");
const ag48dReadiness = readJson("data/content-intelligence/quality-registry/ag48d-ag48z-word-reflection-closure-readiness-record.json");
const ag48dBoundary = readJson("data/content-intelligence/mutation-plans/ag48d-to-ag48z-word-reflection-closure-boundary.json");

const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag48aReview.status !== "word_bank_rotation_consumed_ready_for_ag48b") fail("AG48A review status mismatch.");
if (ag48aApproval.default_public_use_allowed !== false) fail("AG48A public-use default must be false.");
if (ag48aReflection.reflection_position.public_generated_reflection_disabled_now !== true) fail("AG48A generated reflection must remain disabled.");

if (ag48bReview.status !== "multilingual_language_safety_ready_for_ag48c") fail("AG48B review status mismatch.");
if (ag48bToggle.needs_later_ui_smoke_test !== true) fail("AG48B UI smoke test must remain required.");
if (ag48bMantraBlocker.unreviewed_sanskrit_mantra_publication_allowed !== false) fail("AG48B unreviewed Sanskrit/mantra must remain blocked.");

if (ag48cReview.status !== "reflection_homepage_integration_ready_for_ag48d") fail("AG48C review status mismatch.");
if (ag48cPrompt.integration_boundary.use_public_generation_engine !== false) fail("AG48C public generation engine must remain disabled.");
if (ag48cHomepageMap.display_policy.homepage_runtime_query_enabled !== false) fail("AG48C homepage runtime query must remain disabled.");
if (ag48cStaticDisplay.public_display_status_now !== "not_published") fail("AG48C public display must remain not published.");
if (ag48cFlow.requires_later_ui_smoke_test !== true) fail("AG48C later UI smoke test must remain required.");
if (ag48cNoPersonalisation.user_personalised_reflection_enabled !== false) fail("AG48C personalised reflection must remain disabled.");

if (ag48dReview.status !== "word_reflection_integration_audit_ready_for_ag48z") fail("AG48D review status mismatch.");
if (ag48dIntegratedAudit.audit_result !== "passed") fail("AG48D integrated audit must pass.");
if (ag48dLanguageAudit.later_ui_smoke_test_required !== true) fail("AG48D later UI smoke test must remain required.");
if (ag48dPublicUseAudit.default_public_use_allowed !== false) fail("AG48D public-use default must remain false.");
if (ag48dGapRegister.ag48z_closure_allowed !== true) fail("AG48Z closure must be allowed.");
if (ag48dGapRegister.blocking_gaps_for_ag48z.length !== 0) fail("AG48Z blocking gaps must be zero.");
if (ag48dReadiness.ready_for_ag48z !== true) fail("AG48D readiness must permit AG48Z.");
if (ag48dBoundary.next_stage_id !== "AG48Z") fail("AG48D boundary must point to AG48Z.");

if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag48z-word-reflection-closure.json");
const closureRecord = readJson("data/content-intelligence/word-reflection/ag48z-word-reflection-closure-record.json");
const consumptionSummary = readJson("data/content-intelligence/word-reflection/ag48z-ag48a-to-ag48d-consumption-summary.json");
const carryForwardDeferralRegister = readJson("data/content-intelligence/word-reflection/ag48z-carry-forward-deferral-register.json");
const publicSurfaceClosure = readJson("data/content-intelligence/word-reflection/ag48z-public-surface-closure-position.json");
const ag49aHandoff = readJson("data/content-intelligence/ag-roadmap/ag48z-ag49a-user-profile-model-handoff.json");
const noPersonalisationAuthAudit = readJson("data/content-intelligence/backend-architecture/ag48z-no-personalisation-auth-activation-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag48z-no-runtime-api-deployment-audit.json");
const noPublicOutputAudit = readJson("data/content-intelligence/backend-architecture/ag48z-no-public-word-reflection-output-audit.json");
const noSecretExposureAudit = readJson("data/content-intelligence/backend-architecture/ag48z-no-secret-exposure-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag48z-ag49a-user-profile-model-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag48z-to-ag49a-user-profile-model-boundary.json");
const preview = readJson("data/quality/ag48z-word-reflection-closure-preview.json");
const pkg = readJson("package.json");

if (review.status !== "word_reflection_closed_ready_for_ag49a") fail("AG48Z review status mismatch.");

for (const key of [
  "ag48z_word_reflection_closed",
  "ag48a_ag48b_ag48c_ag48d_consumed",
  "word_reflection_closure_completed",
  "ag49a_user_profile_model_handoff_created",
  "ready_for_ag49a_user_profile_model_consumption"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag49a !== 0) fail("AG49A blocker count must be zero.");

for (const key of [
  "public_word_publication_approved_now",
  "public_word_publication_executed",
  "public_reflection_publication_approved_now",
  "public_reflection_publication_executed",
  "public_word_generated_now",
  "public_reflection_generated_now",
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

if (closureRecord.status !== "word_reflection_closure_completed") fail("Closure record status mismatch.");
if (closureRecord.closure_allowed !== true) fail("Closure must be allowed.");

for (const stage of ["AG48A", "AG48B", "AG48C", "AG48D"]) {
  if (!JSON.stringify(consumptionSummary.consumed_outputs).includes(stage)) fail(`Consumption summary missing ${stage}.`);
}

if (!carryForwardDeferralRegister.deferred_items.includes("Public Word of the Day publication")) fail("Public word publication must be deferred.");
if (!carryForwardDeferralRegister.deferred_items.includes("Personalised reflection")) fail("Personalised reflection must be deferred.");
if (!carryForwardDeferralRegister.deferred_items.includes("Deployment")) fail("Deployment must be deferred.");

if (!publicSurfaceClosure.blocked_for_v01_without_later_approval.includes("AI-generated daily reflection")) fail("AI-generated daily reflection must be blocked.");
if (!publicSurfaceClosure.blocked_for_v01_without_later_approval.includes("live database/API word rotation")) fail("Live database/API word rotation must be blocked.");

if (ag49aHandoff.status !== "ag49a_user_profile_model_handoff_created") fail("AG49A handoff status mismatch.");
if (ag49aHandoff.next_stage_id !== "AG49A") fail("AG49A handoff must point to AG49A.");
if (!JSON.stringify(ag49aHandoff.handoff_basis).includes("AG49 remains User Accounts and Personalisation")) fail("AG49 source-of-truth handoff missing.");

if (noPersonalisationAuthAudit.audit_passed !== true) fail("No personalisation/Auth audit must pass.");
if (noPersonalisationAuthAudit.failed_checks.length !== 0) fail("No personalisation/Auth failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (noPublicOutputAudit.audit_passed !== true) fail("No public output audit must pass.");
if (noPublicOutputAudit.failed_checks.length !== 0) fail("No public output failed checks must be zero.");

if (noSecretExposureAudit.audit_passed !== true) fail("No-secret exposure audit must pass.");
if (noSecretExposureAudit.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");

if (readiness.status !== "ready_for_ag49a_user_profile_model_consumption") fail("AG49A readiness status mismatch.");
if (readiness.ready_for_ag49a !== true) fail("AG49A readiness must be true.");
if (readiness.next_stage_id !== "AG49A") fail("Readiness must point to AG49A.");
if (!readiness.ag49a_allowed_scope.includes("Consume D07 subscriber personalisation schema.")) fail("AG49A must consume D07 subscriber personalisation schema.");

if (boundary.next_stage_id !== "AG49A") fail("Boundary must point to AG49A.");

for (const key of [
  "ag48z_word_reflection_closed",
  "ag48a_ag48b_ag48c_ag48d_consumed",
  "word_reflection_closure_completed",
  "ag49a_user_profile_model_handoff_created",
  "ready_for_ag49a_user_profile_model_consumption"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "public_word_publication_approved_now",
  "public_word_publication_executed",
  "public_reflection_publication_approved_now",
  "public_reflection_publication_executed",
  "public_word_generated_now",
  "public_reflection_generated_now",
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

if (!pkg.scripts?.["generate:ag48z"]) fail("Missing package script: generate:ag48z");
if (!pkg.scripts?.["validate:ag48z"]) fail("Missing package script: validate:ag48z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag48z")) fail("validate:project must include validate:ag48z.");

pass("AG48Z Word and Reflection Closure is present.");
pass("AG48A–AG48D outputs are consumed.");
pass("Word/reflection closure record is valid.");
pass("Carry-forward deferral register is valid.");
pass("Public surface closure position is valid.");
pass("AG49A User/Profile Model handoff is valid.");
pass("No personalisation/Auth activation audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("No public word/reflection output audit is valid.");
pass("No secret exposure audit is valid.");
pass("AG49A readiness is valid.");
