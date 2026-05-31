import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG47C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag47b-festival-observance-registry-integration.json",
  "data/content-intelligence/cultural-modules/ag47b-observance-registry-consumption-record.json",
  "data/content-intelligence/cultural-modules/ag47b-festival-public-preview-display-rules.json",
  "data/content-intelligence/cultural-modules/ag47b-regional-manual-verification-notes.json",
  "data/content-intelligence/cultural-modules/ag47b-observance-safety-boundary-record.json",
  "data/content-intelligence/backend-architecture/ag47b-no-automated-observance-decision-audit.json",
  "data/content-intelligence/backend-architecture/ag47b-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/quality-registry/ag47b-ag47c-vedic-guidance-sanskrit-safety-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag47b-to-ag47c-vedic-guidance-sanskrit-safety-boundary.json",
  "data/content-intelligence/ag-roadmap/ag47r-ag47a-to-ag47z-substage-plan.json",
  "data/content-intelligence/runtime-engine/adb20-ads-coverage-reconciliation.json",

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
  "data/quality/ag47c-vedic-guidance-sanskrit-integrity-safety.json",
  "data/quality/ag47c-vedic-guidance-sanskrit-integrity-safety-preview.json",
  "docs/quality/AG47C_VEDIC_GUIDANCE_SANSKRIT_INTEGRITY_SAFETY.md",
  "scripts/generate-ag47c-vedic-guidance-sanskrit-safety.mjs",
  "scripts/validate-ag47c-vedic-guidance-sanskrit-safety.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag47bReview = readJson("data/content-intelligence/quality-reviews/ag47b-festival-observance-registry-integration.json");
const ag47bObservance = readJson("data/content-intelligence/cultural-modules/ag47b-observance-registry-consumption-record.json");
const ag47bSafety = readJson("data/content-intelligence/cultural-modules/ag47b-observance-safety-boundary-record.json");
const ag47bNoDecision = readJson("data/content-intelligence/backend-architecture/ag47b-no-automated-observance-decision-audit.json");
const ag47bNoRuntime = readJson("data/content-intelligence/backend-architecture/ag47b-no-runtime-api-deployment-audit.json");
const ag47bReadiness = readJson("data/content-intelligence/quality-registry/ag47b-ag47c-vedic-guidance-sanskrit-safety-readiness-record.json");
const ag47bBoundary = readJson("data/content-intelligence/mutation-plans/ag47b-to-ag47c-vedic-guidance-sanskrit-safety-boundary.json");
const ag47rPlan = readJson("data/content-intelligence/ag-roadmap/ag47r-ag47a-to-ag47z-substage-plan.json");

if (ag47bReview.status !== "festival_observance_registry_ready_for_ag47c") fail("AG47B review status mismatch.");
if (ag47bObservance.registry_boundary.use_as_automated_observance_decision_engine !== false) fail("Automated observance decision engine must remain false.");
if (ag47bSafety.review_required_before_public_use !== true) fail("AG47B review must be required before public use.");
if (ag47bNoDecision.audit_passed !== true) fail("AG47B no-decision audit must pass.");
if (ag47bNoRuntime.audit_passed !== true) fail("AG47B no-runtime audit must pass.");
if (ag47bReadiness.ready_for_ag47c !== true) fail("AG47B readiness must permit AG47C.");
if (ag47bBoundary.next_stage_id !== "AG47C") fail("AG47B boundary must point to AG47C.");
if (!JSON.stringify(ag47rPlan.substages).includes("AG47C")) fail("AG47R plan must include AG47C.");

const review = readJson("data/content-intelligence/quality-reviews/ag47c-vedic-guidance-sanskrit-integrity-safety.json");
const doctrineConsumption = readJson("data/content-intelligence/cultural-modules/ag47c-vedic-guidance-doctrine-consumption-record.json");
const sanskritMantraIntegrityGate = readJson("data/content-intelligence/cultural-modules/ag47c-sanskrit-mantra-integrity-gate.json");
const guidanceLanguageSafety = readJson("data/content-intelligence/cultural-modules/ag47c-guidance-public-language-safety-rules.json");
const sourceAttributionBoundary = readJson("data/content-intelligence/cultural-modules/ag47c-source-attribution-review-boundary.json");
const nonDeterministicGuidanceBoundary = readJson("data/content-intelligence/cultural-modules/ag47c-non-deterministic-guidance-boundary-record.json");
const noGuidanceGenerationAudit = readJson("data/content-intelligence/backend-architecture/ag47c-no-guidance-generation-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag47c-no-runtime-api-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag47c-ag47d-cultural-module-integration-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag47c-to-ag47d-cultural-module-integration-audit-boundary.json");
const preview = readJson("data/quality/ag47c-vedic-guidance-sanskrit-integrity-safety-preview.json");
const pkg = readJson("package.json");

if (review.status !== "vedic_guidance_sanskrit_safety_ready_for_ag47d") fail("AG47C review status mismatch.");

for (const key of [
  "ag47c_vedic_guidance_sanskrit_safety_recorded",
  "ag47b_consumed",
  "m00_source_doctrine_consumed",
  "d03_d04_daily_guidance_consumed",
  "d06_mantra_review_consumed",
  "sanskrit_mantra_integrity_gate_recorded",
  "source_attribution_review_boundary_recorded",
  "non_deterministic_guidance_boundary_recorded",
  "ready_for_ag47d_cultural_module_integration_audit"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

for (const key of [
  "automated_guidance_generation_approved_now",
  "automated_guidance_generation_executed",
  "invented_sanskrit_mantra_publication_allowed",
  "personalised_ritual_prescription_allowed",
  "fear_based_or_deterministic_claim_allowed",
  "runtime_panchang_calculation_approved_now",
  "runtime_panchang_calculation_executed",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_generated_guidance_output",
  "public_content_generated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (doctrineConsumption.status !== "vedic_guidance_doctrine_consumption_recorded") fail("Doctrine consumption status mismatch.");
if (doctrineConsumption.doctrine_boundary.use_as_automated_guidance_generator !== false) fail("Automated guidance generator must be false.");
if (doctrineConsumption.doctrine_boundary.manual_editorial_review_required !== true) fail("Manual editorial review must be required.");

if (sanskritMantraIntegrityGate.status !== "sanskrit_mantra_integrity_gate_recorded") fail("Sanskrit/mantra integrity status mismatch.");
if (sanskritMantraIntegrityGate.public_use_default !== false) fail("Sanskrit/mantra public-use default must be false.");
if (!JSON.stringify(sanskritMantraIntegrityGate.integrity_rules).includes("No invented Sanskrit")) fail("No invented Sanskrit rule missing.");
if (!sanskritMantraIntegrityGate.required_fields_before_public_use.includes("source_authority")) fail("source_authority required field missing.");

if (guidanceLanguageSafety.status !== "guidance_public_language_safety_rules_recorded") fail("Guidance language safety status mismatch.");
if (!guidanceLanguageSafety.blocked_public_language.includes("AI-generated mantra")) fail("AI-generated mantra blocked phrase missing.");
if (!guidanceLanguageSafety.required_disclaimers_or_notes.includes("Cultural reflection, not prediction")) fail("Cultural reflection disclaimer missing.");

if (sourceAttributionBoundary.status !== "source_attribution_review_boundary_recorded") fail("Source attribution status mismatch.");
if (sourceAttributionBoundary.source_policy.source_required_for_mantra !== true) fail("Source required for mantra must be true.");
if (sourceAttributionBoundary.source_policy.review_required_before_public_use !== true) fail("Review before public use must be true.");

if (nonDeterministicGuidanceBoundary.status !== "non_deterministic_guidance_boundary_recorded") fail("Non-deterministic boundary status mismatch.");
if (nonDeterministicGuidanceBoundary.boundary.predictive_guidance_allowed !== false) fail("Predictive guidance must be false.");
if (nonDeterministicGuidanceBoundary.boundary.automated_runtime_guidance_allowed_now !== false) fail("Automated runtime guidance must be false.");

if (noGuidanceGenerationAudit.audit_passed !== true) fail("No guidance generation audit must pass.");
if (noGuidanceGenerationAudit.failed_checks.length !== 0) fail("No guidance generation failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (readiness.status !== "ready_for_ag47d_cultural_module_integration_audit") fail("AG47D readiness status mismatch.");
if (readiness.ready_for_ag47d !== true) fail("AG47D readiness must be true.");
if (readiness.next_stage_id !== "AG47D") fail("Readiness must point to AG47D.");
if (!readiness.ag47d_blocked_scope.includes("Invented Sanskrit/mantra publication")) fail("AG47D must block invented Sanskrit/mantra publication.");

if (boundary.next_stage_id !== "AG47D") fail("Boundary must point to AG47D.");

for (const key of [
  "ag47c_vedic_guidance_sanskrit_safety_recorded",
  "ag47b_consumed",
  "m00_source_doctrine_consumed",
  "d03_d04_daily_guidance_consumed",
  "d06_mantra_review_consumed",
  "sanskrit_mantra_integrity_gate_recorded",
  "source_attribution_review_boundary_recorded",
  "non_deterministic_guidance_boundary_recorded",
  "ready_for_ag47d_cultural_module_integration_audit"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "automated_guidance_generation_approved_now",
  "automated_guidance_generation_executed",
  "invented_sanskrit_mantra_publication_allowed",
  "personalised_ritual_prescription_allowed",
  "fear_based_or_deterministic_claim_allowed",
  "runtime_panchang_calculation_approved_now",
  "runtime_panchang_calculation_executed",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_generated_guidance_output",
  "public_content_generated"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag47c"]) fail("Missing package script: generate:ag47c");
if (!pkg.scripts?.["validate:ag47c"]) fail("Missing package script: validate:ag47c");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag47c")) fail("validate:project must include validate:ag47c.");

pass("AG47C Vedic Guidance and Sanskrit Integrity Safety Gate is present.");
pass("AG47B inputs are consumed.");
pass("Vedic guidance doctrine consumption is valid.");
pass("Sanskrit/mantra integrity gate is valid.");
pass("Guidance public-language safety rules are valid.");
pass("Source attribution and review boundary is valid.");
pass("Non-deterministic guidance boundary is valid.");
pass("No guidance generation audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("AG47D readiness is valid.");
