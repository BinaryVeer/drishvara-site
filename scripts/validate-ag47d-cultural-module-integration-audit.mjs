import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG47D validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag47a-panchang-method-location-basis-consumption.json",
  "data/content-intelligence/cultural-modules/ag47a-panchang-method-consumption-record.json",
  "data/content-intelligence/cultural-modules/ag47a-location-basis-consumption-record.json",
  "data/content-intelligence/cultural-modules/ag47a-source-validation-consumption-record.json",
  "data/content-intelligence/cultural-modules/ag47a-panchang-runtime-boundary-record.json",
  "data/content-intelligence/backend-architecture/ag47a-live-calculation-disabled-audit.json",
  "data/content-intelligence/backend-architecture/ag47a-no-api-db-activation-audit.json",

  "data/content-intelligence/quality-reviews/ag47b-festival-observance-registry-integration.json",
  "data/content-intelligence/cultural-modules/ag47b-observance-registry-consumption-record.json",
  "data/content-intelligence/cultural-modules/ag47b-festival-public-preview-display-rules.json",
  "data/content-intelligence/cultural-modules/ag47b-regional-manual-verification-notes.json",
  "data/content-intelligence/cultural-modules/ag47b-observance-safety-boundary-record.json",
  "data/content-intelligence/backend-architecture/ag47b-no-automated-observance-decision-audit.json",
  "data/content-intelligence/backend-architecture/ag47b-no-runtime-api-deployment-audit.json",

  "data/content-intelligence/quality-reviews/ag47c-vedic-guidance-sanskrit-integrity-safety.json",
  "data/content-intelligence/cultural-modules/ag47c-vedic-guidance-doctrine-consumption-record.json",
  "data/content-intelligence/cultural-modules/ag47c-sanskrit-mantra-integrity-gate.json",
  "data/content-intelligence/cultural-modules/ag47c-guidance-public-language-safety-rules.json",
  "data/content-intelligence/cultural-modules/ag47c-source-attribution-review-boundary.json",
  "data/content-intelligence/cultural-modules/ag47c-non-deterministic-guidance-boundary-record.json",
  "data/content-intelligence/backend-architecture/ag47c-no-guidance-generation-audit.json",
  "data/content-intelligence/backend-architecture/ag47c-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/quality-registry/ag47c-ag47d-cultural-module-integration-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag47c-to-ag47d-cultural-module-integration-audit-boundary.json",

  "data/content-intelligence/quality-reviews/ag47d-cultural-module-integration-audit.json",
  "data/content-intelligence/cultural-modules/ag47d-integrated-cultural-module-audit.json",
  "data/content-intelligence/cultural-modules/ag47d-homepage-discover-surface-readiness-audit.json",
  "data/content-intelligence/cultural-modules/ag47d-cross-module-safety-consistency-audit.json",
  "data/content-intelligence/cultural-modules/ag47d-source-review-continuity-audit.json",
  "data/content-intelligence/cultural-modules/ag47d-ag47z-closure-gap-register.json",
  "data/content-intelligence/backend-architecture/ag47d-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag47d-no-public-generated-cultural-output-audit.json",
  "data/content-intelligence/quality-registry/ag47d-ag47z-cultural-module-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag47d-to-ag47z-cultural-module-closure-boundary.json",
  "data/quality/ag47d-cultural-module-integration-audit.json",
  "data/quality/ag47d-cultural-module-integration-audit-preview.json",
  "docs/quality/AG47D_CULTURAL_MODULE_INTEGRATION_AUDIT.md",
  "scripts/generate-ag47d-cultural-module-integration-audit.mjs",
  "scripts/validate-ag47d-cultural-module-integration-audit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag47aReview = readJson("data/content-intelligence/quality-reviews/ag47a-panchang-method-location-basis-consumption.json");
const ag47aRuntime = readJson("data/content-intelligence/cultural-modules/ag47a-panchang-runtime-boundary-record.json");
const ag47aNoCalc = readJson("data/content-intelligence/backend-architecture/ag47a-live-calculation-disabled-audit.json");

const ag47bReview = readJson("data/content-intelligence/quality-reviews/ag47b-festival-observance-registry-integration.json");
const ag47bObservance = readJson("data/content-intelligence/cultural-modules/ag47b-observance-registry-consumption-record.json");
const ag47bNoDecision = readJson("data/content-intelligence/backend-architecture/ag47b-no-automated-observance-decision-audit.json");

const ag47cReview = readJson("data/content-intelligence/quality-reviews/ag47c-vedic-guidance-sanskrit-integrity-safety.json");
const ag47cMantraGate = readJson("data/content-intelligence/cultural-modules/ag47c-sanskrit-mantra-integrity-gate.json");
const ag47cNonDeterministic = readJson("data/content-intelligence/cultural-modules/ag47c-non-deterministic-guidance-boundary-record.json");
const ag47cNoGuidance = readJson("data/content-intelligence/backend-architecture/ag47c-no-guidance-generation-audit.json");
const ag47cReadiness = readJson("data/content-intelligence/quality-registry/ag47c-ag47d-cultural-module-integration-audit-readiness-record.json");
const ag47cBoundary = readJson("data/content-intelligence/mutation-plans/ag47c-to-ag47d-cultural-module-integration-audit-boundary.json");

if (ag47aReview.status !== "panchang_method_location_basis_ready_for_ag47b") fail("AG47A review status mismatch.");
if (ag47aRuntime.boundary.runtime_calculation_enabled !== false) fail("AG47A runtime calculation must remain disabled.");
if (ag47aNoCalc.audit_passed !== true) fail("AG47A no-calculation audit must pass.");

if (ag47bReview.status !== "festival_observance_registry_ready_for_ag47c") fail("AG47B review status mismatch.");
if (ag47bObservance.registry_boundary.use_as_automated_observance_decision_engine !== false) fail("AG47B automated decisioning must remain disabled.");
if (ag47bNoDecision.audit_passed !== true) fail("AG47B no-decision audit must pass.");

if (ag47cReview.status !== "vedic_guidance_sanskrit_safety_ready_for_ag47d") fail("AG47C review status mismatch.");
if (ag47cMantraGate.public_use_default !== false) fail("AG47C mantra public-use default must be false.");
if (ag47cNonDeterministic.boundary.predictive_guidance_allowed !== false) fail("AG47C predictive guidance must remain blocked.");
if (ag47cNoGuidance.audit_passed !== true) fail("AG47C no-guidance audit must pass.");
if (ag47cReadiness.ready_for_ag47d !== true) fail("AG47C readiness must permit AG47D.");
if (ag47cBoundary.next_stage_id !== "AG47D") fail("AG47C boundary must point to AG47D.");

const review = readJson("data/content-intelligence/quality-reviews/ag47d-cultural-module-integration-audit.json");
const integratedModuleAudit = readJson("data/content-intelligence/cultural-modules/ag47d-integrated-cultural-module-audit.json");
const surfaceIntegrationReadiness = readJson("data/content-intelligence/cultural-modules/ag47d-homepage-discover-surface-readiness-audit.json");
const crossModuleSafetyAudit = readJson("data/content-intelligence/cultural-modules/ag47d-cross-module-safety-consistency-audit.json");
const sourceReviewContinuityAudit = readJson("data/content-intelligence/cultural-modules/ag47d-source-review-continuity-audit.json");
const ag47ClosureGapRegister = readJson("data/content-intelligence/cultural-modules/ag47d-ag47z-closure-gap-register.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag47d-no-runtime-api-deployment-audit.json");
const noPublicGeneratedOutputAudit = readJson("data/content-intelligence/backend-architecture/ag47d-no-public-generated-cultural-output-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag47d-ag47z-cultural-module-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag47d-to-ag47z-cultural-module-closure-boundary.json");
const preview = readJson("data/quality/ag47d-cultural-module-integration-audit-preview.json");
const pkg = readJson("package.json");

if (review.status !== "cultural_module_integration_audit_ready_for_ag47z") fail("AG47D review status mismatch.");

for (const key of [
  "ag47d_cultural_module_integration_audit_recorded",
  "ag47a_ag47b_ag47c_consumed",
  "panchang_festival_vedic_boundaries_consistent",
  "homepage_discover_surface_readiness_audited",
  "cross_module_safety_consistency_audited",
  "source_review_continuity_audited",
  "ag47z_closure_gap_register_recorded",
  "ready_for_ag47z_cultural_module_closure"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag47z !== 0) fail("AG47Z blocker count must be zero.");

for (const key of [
  "runtime_panchang_calculation_approved_now",
  "runtime_panchang_calculation_executed",
  "automated_observance_decisioning_approved_now",
  "automated_observance_decisioning_executed",
  "automated_guidance_generation_approved_now",
  "automated_guidance_generation_executed",
  "invented_sanskrit_mantra_publication_allowed",
  "predictive_or_fear_based_claim_allowed",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_generated_cultural_output",
  "public_content_generated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (integratedModuleAudit.status !== "integrated_cultural_module_audit_passed") fail("Integrated module audit status mismatch.");
if (integratedModuleAudit.audit_result !== "passed") fail("Integrated module audit must pass.");
for (const area of ["panchang_method", "festival_observance", "vedic_guidance", "combined_public_use"]) {
  if (!JSON.stringify(integratedModuleAudit.integration_findings).includes(area)) fail(`Missing integration finding: ${area}`);
}

if (surfaceIntegrationReadiness.status !== "homepage_discover_surface_readiness_audit_recorded") fail("Surface readiness status mismatch.");
if (!surfaceIntegrationReadiness.blocked_surface_behavior_for_v01.includes("live Panchang calculation")) fail("Live Panchang calculation must be blocked on surface.");
if (!surfaceIntegrationReadiness.blocked_surface_behavior_for_v01.includes("database/API runtime read")) fail("DB/API runtime read must be blocked on surface.");

if (crossModuleSafetyAudit.status !== "cross_module_safety_consistency_audit_passed") fail("Cross-module safety audit status mismatch.");
for (const rule of ["No deterministic claim.", "No invented Sanskrit/mantra.", "No public generated cultural output."]) {
  if (!crossModuleSafetyAudit.consistent_rules.includes(rule)) fail(`Missing consistent safety rule: ${rule}`);
}

if (sourceReviewContinuityAudit.status !== "source_review_continuity_audit_passed") fail("Source review continuity status mismatch.");
if (!JSON.stringify(sourceReviewContinuityAudit.continuity_checks).includes("Sanskrit/mantra/source attribution")) fail("Sanskrit/mantra source continuity missing.");

if (ag47ClosureGapRegister.status !== "ag47z_closure_gap_register_recorded") fail("AG47Z closure gap register status mismatch.");
if (ag47ClosureGapRegister.blocking_gaps_for_ag47z.length !== 0) fail("AG47Z blocking gaps must be zero.");
if (ag47ClosureGapRegister.ag47z_closure_allowed !== true) fail("AG47Z closure must be allowed.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (noPublicGeneratedOutputAudit.audit_passed !== true) fail("No public generated output audit must pass.");
if (noPublicGeneratedOutputAudit.failed_checks.length !== 0) fail("No public generated output failed checks must be zero.");

if (readiness.status !== "ready_for_ag47z_cultural_module_closure") fail("AG47Z readiness status mismatch.");
if (readiness.ready_for_ag47z !== true) fail("AG47Z readiness must be true.");
if (readiness.next_stage_id !== "AG47Z") fail("Readiness must point to AG47Z.");
if (!readiness.ag47z_allowed_scope.includes("Create handoff to AG48A Word Bank and Rotation Consumption.")) fail("AG47Z must hand off to AG48A.");

if (boundary.next_stage_id !== "AG47Z") fail("Boundary must point to AG47Z.");

for (const key of [
  "ag47d_cultural_module_integration_audit_recorded",
  "ag47a_ag47b_ag47c_consumed",
  "panchang_festival_vedic_boundaries_consistent",
  "homepage_discover_surface_readiness_audited",
  "cross_module_safety_consistency_audited",
  "source_review_continuity_audited",
  "ag47z_closure_gap_register_recorded",
  "ready_for_ag47z_cultural_module_closure"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "runtime_panchang_calculation_approved_now",
  "runtime_panchang_calculation_executed",
  "automated_observance_decisioning_approved_now",
  "automated_observance_decisioning_executed",
  "automated_guidance_generation_approved_now",
  "automated_guidance_generation_executed",
  "invented_sanskrit_mantra_publication_allowed",
  "predictive_or_fear_based_claim_allowed",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_generated_cultural_output",
  "public_content_generated"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag47d"]) fail("Missing package script: generate:ag47d");
if (!pkg.scripts?.["validate:ag47d"]) fail("Missing package script: validate:ag47d");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag47d")) fail("validate:project must include validate:ag47d.");

pass("AG47D Cultural Module Integration Audit is present.");
pass("AG47A, AG47B and AG47C inputs are consumed.");
pass("Integrated cultural module audit is valid.");
pass("Homepage Discover surface readiness audit is valid.");
pass("Cross-module safety consistency audit is valid.");
pass("Source-review continuity audit is valid.");
pass("AG47Z closure gap register is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("No public generated cultural output audit is valid.");
pass("AG47Z readiness is valid.");
