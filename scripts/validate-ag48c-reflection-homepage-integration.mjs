import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG48C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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
  "data/content-intelligence/quality-registry/ag48b-ag48c-reflection-homepage-integration-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag48b-to-ag48c-reflection-homepage-integration-boundary.json",

  "data/content-intelligence/word-reflection/ag48a-reflection-readiness-seed-record.json",
  "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

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
  "data/quality/ag48c-reflection-homepage-integration.json",
  "data/quality/ag48c-reflection-homepage-integration-preview.json",
  "docs/quality/AG48C_REFLECTION_HOMEPAGE_INTEGRATION.md",
  "scripts/generate-ag48c-reflection-homepage-integration.mjs",
  "scripts/validate-ag48c-reflection-homepage-integration.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag48bReview = readJson("data/content-intelligence/quality-reviews/ag48b-multilingual-language-safety-review.json");
const ag48bFieldAudit = readJson("data/content-intelligence/word-reflection/ag48b-multilingual-field-safety-audit.json");
const ag48bToggle = readJson("data/content-intelligence/word-reflection/ag48b-language-toggle-stability-review.json");
const ag48bMantraBlocker = readJson("data/content-intelligence/word-reflection/ag48b-unreviewed-sanskrit-mantra-publication-blocker.json");
const ag48bReflectionHandoff = readJson("data/content-intelligence/word-reflection/ag48b-reflection-language-safety-handoff.json");
const ag48bNoAuth = readJson("data/content-intelligence/backend-architecture/ag48b-no-personalisation-auth-activation-audit.json");
const ag48bNoRuntime = readJson("data/content-intelligence/backend-architecture/ag48b-no-runtime-api-deployment-audit.json");
const ag48bNoPublicGeneration = readJson("data/content-intelligence/backend-architecture/ag48b-no-public-language-generation-audit.json");
const ag48bReadiness = readJson("data/content-intelligence/quality-registry/ag48b-ag48c-reflection-homepage-integration-readiness-record.json");
const ag48bBoundary = readJson("data/content-intelligence/mutation-plans/ag48b-to-ag48c-reflection-homepage-integration-boundary.json");
const ag48aReflection = readJson("data/content-intelligence/word-reflection/ag48a-reflection-readiness-seed-record.json");
const ag47rSourceOfTruth = readJson("data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag48bReview.status !== "multilingual_language_safety_ready_for_ag48c") fail("AG48B review status mismatch.");
if (ag48bFieldAudit.field_review_requirements.public_use_allowed_default !== false) fail("AG48B public-use default must be false.");
if (ag48bToggle.language_toggle_runtime_mutation_enabled !== false) fail("AG48B toggle runtime mutation must be disabled.");
if (ag48bMantraBlocker.unreviewed_sanskrit_mantra_publication_allowed !== false) fail("Unreviewed Sanskrit/mantra must remain blocked.");
if (ag48bReflectionHandoff.ready_for_ag48c !== true) fail("AG48B reflection handoff must permit AG48C.");
if (ag48bNoAuth.audit_passed !== true) fail("AG48B no-auth audit must pass.");
if (ag48bNoRuntime.audit_passed !== true) fail("AG48B no-runtime audit must pass.");
if (ag48bNoPublicGeneration.audit_passed !== true) fail("AG48B no-public-generation audit must pass.");
if (ag48bReadiness.ready_for_ag48c !== true) fail("AG48B readiness must permit AG48C.");
if (ag48bBoundary.next_stage_id !== "AG48C") fail("AG48B boundary must point to AG48C.");
if (ag48aReflection.reflection_position.public_generated_reflection_disabled_now !== true) fail("AG48A generated reflection must remain disabled.");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG48 remains Word of the Day and Reflection")) fail("AG48 roadmap source-of-truth missing.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag48c-reflection-homepage-integration.json");
const reflectionPromptIntegration = readJson("data/content-intelligence/word-reflection/ag48c-reflection-prompt-integration-record.json");
const homepageSurfaceMap = readJson("data/content-intelligence/word-reflection/ag48c-homepage-discover-reflect-surface-map.json");
const staticDisplayBoundary = readJson("data/content-intelligence/word-reflection/ag48c-static-reflection-display-boundary.json");
const navigationFlowReadiness = readJson("data/content-intelligence/word-reflection/ag48c-discover-read-reflect-flow-readiness-record.json");
const noPersonalisationBoundary = readJson("data/content-intelligence/word-reflection/ag48c-no-personalisation-reflection-boundary.json");
const integrationGapRegister = readJson("data/content-intelligence/word-reflection/ag48c-ag48d-integration-gap-register.json");
const noPersonalisationAuthAudit = readJson("data/content-intelligence/backend-architecture/ag48c-no-personalisation-auth-activation-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag48c-no-runtime-api-deployment-audit.json");
const noPublicGenerationAudit = readJson("data/content-intelligence/backend-architecture/ag48c-no-public-reflection-generation-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag48c-ag48d-word-reflection-integration-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag48c-to-ag48d-word-reflection-integration-audit-boundary.json");
const preview = readJson("data/quality/ag48c-reflection-homepage-integration-preview.json");
const pkg = readJson("package.json");

if (review.status !== "reflection_homepage_integration_ready_for_ag48d") fail("AG48C review status mismatch.");

for (const key of [
  "ag48c_reflection_homepage_integration_recorded",
  "ag48b_consumed",
  "reflection_prompt_integration_recorded",
  "homepage_discover_reflect_surface_mapped",
  "static_reflection_display_boundary_recorded",
  "discover_read_reflect_flow_recorded",
  "no_personalisation_reflection_boundary_recorded",
  "integration_gap_register_recorded",
  "ready_for_ag48d_word_reflection_integration_audit"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag48d !== 0) fail("AG48D blocker count must be zero.");

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

if (reflectionPromptIntegration.status !== "reflection_prompt_integration_recorded") fail("Reflection prompt integration status mismatch.");
if (reflectionPromptIntegration.integration_boundary.use_public_generation_engine !== false) fail("Reflection must not use public generation engine.");
if (reflectionPromptIntegration.integration_boundary.use_user_personalisation_engine !== false) fail("Reflection must not use personalisation engine.");

if (homepageSurfaceMap.status !== "homepage_discover_reflect_surface_map_recorded") fail("Homepage surface map status mismatch.");
if (homepageSurfaceMap.display_policy.homepage_runtime_query_enabled !== false) fail("Homepage runtime query must be disabled.");
if (homepageSurfaceMap.display_policy.public_generated_output_allowed !== false) fail("Public generated output must be disabled.");

if (staticDisplayBoundary.status !== "static_reflection_display_boundary_recorded") fail("Static display boundary status mismatch.");
if (!staticDisplayBoundary.blocked_display_elements_without_later_approval.includes("AI-generated daily reflection")) fail("AI-generated daily reflection must be blocked.");
if (!staticDisplayBoundary.blocked_display_elements_without_later_approval.includes("live database-fed word rotation")) fail("Live database-fed rotation must be blocked.");

if (navigationFlowReadiness.status !== "discover_read_reflect_flow_readiness_recorded") fail("Flow readiness status mismatch.");
if (navigationFlowReadiness.flow_activation_now !== false) fail("Flow activation must be false now.");
if (navigationFlowReadiness.requires_later_ui_smoke_test !== true) fail("Later UI smoke test must be required.");

if (noPersonalisationBoundary.status !== "no_personalisation_reflection_boundary_recorded") fail("No-personalisation boundary status mismatch.");
if (noPersonalisationBoundary.user_personalised_reflection_enabled !== false) fail("User-personalised reflection must be disabled.");
if (noPersonalisationBoundary.auth_required_now !== false) fail("Auth must not be required now.");

if (integrationGapRegister.status !== "ag48d_integration_gap_register_recorded") fail("Integration gap register status mismatch.");
if (integrationGapRegister.blocking_gaps_for_ag48d.length !== 0) fail("AG48D blocking gaps must be zero.");
if (integrationGapRegister.ag48d_audit_allowed !== true) fail("AG48D audit must be allowed.");

if (noPersonalisationAuthAudit.audit_passed !== true) fail("No personalisation/Auth audit must pass.");
if (noPersonalisationAuthAudit.failed_checks.length !== 0) fail("No personalisation/Auth failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (noPublicGenerationAudit.audit_passed !== true) fail("No public reflection generation audit must pass.");
if (noPublicGenerationAudit.failed_checks.length !== 0) fail("No public generation failed checks must be zero.");

if (readiness.status !== "ready_for_ag48d_word_reflection_integration_audit") fail("AG48D readiness status mismatch.");
if (readiness.ready_for_ag48d !== true) fail("AG48D readiness must be true.");
if (readiness.next_stage_id !== "AG48D") fail("Readiness must point to AG48D.");
if (!readiness.ag48d_allowed_scope.includes("Audit AG48A–AG48C outputs together.")) fail("AG48D audit scope missing.");

if (boundary.next_stage_id !== "AG48D") fail("Boundary must point to AG48D.");

for (const key of [
  "ag48c_reflection_homepage_integration_recorded",
  "ag48b_consumed",
  "reflection_prompt_integration_recorded",
  "homepage_discover_reflect_surface_mapped",
  "static_reflection_display_boundary_recorded",
  "discover_read_reflect_flow_recorded",
  "no_personalisation_reflection_boundary_recorded",
  "integration_gap_register_recorded",
  "ready_for_ag48d_word_reflection_integration_audit"
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

if (!pkg.scripts?.["generate:ag48c"]) fail("Missing package script: generate:ag48c");
if (!pkg.scripts?.["validate:ag48c"]) fail("Missing package script: validate:ag48c");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag48c")) fail("validate:project must include validate:ag48c.");

pass("AG48C Reflection Prompt and Homepage Integration is present.");
pass("AG48B inputs are consumed.");
pass("Reflection prompt integration record is valid.");
pass("Homepage Discover/Reflect surface map is valid.");
pass("Static reflection display boundary is valid.");
pass("Discover→Read→Reflect flow readiness is valid.");
pass("No-personalisation reflection boundary is valid.");
pass("Integration gap register is valid.");
pass("No personalisation/Auth activation audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("No public reflection generation audit is valid.");
pass("AG48D Word/Reflection Integration Audit readiness is valid.");
