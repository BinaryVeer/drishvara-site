import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG47B validation failed: ${message}`);
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
  "data/content-intelligence/quality-registry/ag47a-ag47b-festival-observance-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag47a-to-ag47b-festival-observance-boundary.json",
  "data/content-intelligence/ag-roadmap/ag47r-ag47a-to-ag47z-substage-plan.json",
  "data/content-intelligence/runtime-engine/adb20-ads-coverage-reconciliation.json",

  "data/content-intelligence/quality-reviews/ag47b-festival-observance-registry-integration.json",
  "data/content-intelligence/cultural-modules/ag47b-observance-registry-consumption-record.json",
  "data/content-intelligence/cultural-modules/ag47b-festival-public-preview-display-rules.json",
  "data/content-intelligence/cultural-modules/ag47b-regional-manual-verification-notes.json",
  "data/content-intelligence/cultural-modules/ag47b-observance-safety-boundary-record.json",
  "data/content-intelligence/backend-architecture/ag47b-no-automated-observance-decision-audit.json",
  "data/content-intelligence/backend-architecture/ag47b-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/quality-registry/ag47b-ag47c-vedic-guidance-sanskrit-safety-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag47b-to-ag47c-vedic-guidance-sanskrit-safety-boundary.json",
  "data/quality/ag47b-festival-observance-registry-integration.json",
  "data/quality/ag47b-festival-observance-registry-integration-preview.json",
  "docs/quality/AG47B_FESTIVAL_OBSERVANCE_REGISTRY_INTEGRATION.md",
  "scripts/generate-ag47b-festival-observance-registry.mjs",
  "scripts/validate-ag47b-festival-observance-registry.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag47aReview = readJson("data/content-intelligence/quality-reviews/ag47a-panchang-method-location-basis-consumption.json");
const ag47aRuntime = readJson("data/content-intelligence/cultural-modules/ag47a-panchang-runtime-boundary-record.json");
const ag47aNoCalc = readJson("data/content-intelligence/backend-architecture/ag47a-live-calculation-disabled-audit.json");
const ag47aNoApiDb = readJson("data/content-intelligence/backend-architecture/ag47a-no-api-db-activation-audit.json");
const ag47aReadiness = readJson("data/content-intelligence/quality-registry/ag47a-ag47b-festival-observance-readiness-record.json");
const ag47aBoundary = readJson("data/content-intelligence/mutation-plans/ag47a-to-ag47b-festival-observance-boundary.json");
const ag47rPlan = readJson("data/content-intelligence/ag-roadmap/ag47r-ag47a-to-ag47z-substage-plan.json");

if (ag47aReview.status !== "panchang_method_location_basis_ready_for_ag47b") fail("AG47A review status mismatch.");
if (ag47aRuntime.boundary.runtime_calculation_enabled !== false) fail("Runtime calculation must remain disabled.");
if (ag47aNoCalc.audit_passed !== true) fail("AG47A no-calculation audit must pass.");
if (ag47aNoApiDb.audit_passed !== true) fail("AG47A no API/DB audit must pass.");
if (ag47aReadiness.ready_for_ag47b !== true) fail("AG47A readiness must permit AG47B.");
if (ag47aBoundary.next_stage_id !== "AG47B") fail("AG47A boundary must point to AG47B.");
if (!JSON.stringify(ag47rPlan.substages).includes("AG47B")) fail("AG47R plan must include AG47B.");

const review = readJson("data/content-intelligence/quality-reviews/ag47b-festival-observance-registry-integration.json");
const observanceRegistryConsumption = readJson("data/content-intelligence/cultural-modules/ag47b-observance-registry-consumption-record.json");
const festivalDisplayRules = readJson("data/content-intelligence/cultural-modules/ag47b-festival-public-preview-display-rules.json");
const regionalManualVerificationNotes = readJson("data/content-intelligence/cultural-modules/ag47b-regional-manual-verification-notes.json");
const observanceSafetyBoundary = readJson("data/content-intelligence/cultural-modules/ag47b-observance-safety-boundary-record.json");
const noAutomatedDecisionAudit = readJson("data/content-intelligence/backend-architecture/ag47b-no-automated-observance-decision-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag47b-no-runtime-api-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag47b-ag47c-vedic-guidance-sanskrit-safety-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag47b-to-ag47c-vedic-guidance-sanskrit-safety-boundary.json");
const preview = readJson("data/quality/ag47b-festival-observance-registry-integration-preview.json");
const pkg = readJson("package.json");

if (review.status !== "festival_observance_registry_ready_for_ag47c") fail("AG47B review status mismatch.");

for (const key of [
  "ag47b_festival_observance_registry_integrated",
  "ag47a_consumed",
  "m02_m03_observance_logic_consumed",
  "d05_observance_source_validation_consumed",
  "public_preview_display_rules_recorded",
  "regional_manual_verification_notes_recorded",
  "observance_safety_boundary_recorded",
  "ready_for_ag47c_vedic_guidance_sanskrit_safety"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

for (const key of [
  "automated_festival_vrat_public_decisioning_approved_now",
  "automated_festival_vrat_public_decisioning_executed",
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
  "public_generated_observance_output",
  "public_content_generated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (observanceRegistryConsumption.status !== "observance_registry_consumption_recorded") fail("Observance registry status mismatch.");
if (observanceRegistryConsumption.registry_boundary.use_as_automated_observance_decision_engine !== false) fail("Automated observance decision engine must be false.");
if (observanceRegistryConsumption.registry_boundary.manual_editorial_verification_required !== true) fail("Manual editorial verification must be required.");

if (festivalDisplayRules.status !== "festival_public_preview_display_rules_recorded") fail("Festival display rules status mismatch.");
if (festivalDisplayRules.display_policy.automated_date_claim_allowed !== false) fail("Automated date claim must be blocked.");
if (festivalDisplayRules.display_policy.regional_difference_note_required !== true) fail("Regional difference note must be required.");
if (!festivalDisplayRules.blocked_public_language.includes("guaranteed observance date")) fail("Blocked public language must include guaranteed observance date.");

if (regionalManualVerificationNotes.status !== "regional_manual_verification_notes_recorded") fail("Regional notes status mismatch.");
if (regionalManualVerificationNotes.regional_handling_policy.east_india_bihar_mithila_profile !== "preserve regional variance explicitly") fail("Bihar/Mithila variance policy mismatch.");
if (!regionalManualVerificationNotes.manual_verification_required_for.includes("source disagreement")) fail("Source disagreement must require manual verification.");

if (observanceSafetyBoundary.status !== "observance_safety_boundary_recorded") fail("Safety boundary status mismatch.");
if (observanceSafetyBoundary.review_required_before_public_use !== true) fail("Review must be required before public use.");
if (!JSON.stringify(observanceSafetyBoundary.safety_rules).includes("No automated festival/vrat public decisioning")) fail("Automated decisioning safety rule missing.");

if (noAutomatedDecisionAudit.audit_passed !== true) fail("No automated decision audit must pass.");
if (noAutomatedDecisionAudit.failed_checks.length !== 0) fail("No automated decision failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (readiness.status !== "ready_for_ag47c_vedic_guidance_sanskrit_safety") fail("AG47C readiness status mismatch.");
if (readiness.ready_for_ag47c !== true) fail("AG47C readiness must be true.");
if (readiness.next_stage_id !== "AG47C") fail("Readiness must point to AG47C.");
if (!readiness.ag47c_blocked_scope.includes("Invented Sanskrit/mantra publication")) fail("AG47C must block invented Sanskrit/mantra publication.");

if (boundary.next_stage_id !== "AG47C") fail("Boundary must point to AG47C.");

for (const key of [
  "ag47b_festival_observance_registry_integrated",
  "ag47a_consumed",
  "m02_m03_observance_logic_consumed",
  "d05_observance_source_validation_consumed",
  "public_preview_display_rules_recorded",
  "regional_manual_verification_notes_recorded",
  "observance_safety_boundary_recorded",
  "ready_for_ag47c_vedic_guidance_sanskrit_safety"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "automated_festival_vrat_public_decisioning_approved_now",
  "automated_festival_vrat_public_decisioning_executed",
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
  "public_generated_observance_output",
  "public_content_generated"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag47b"]) fail("Missing package script: generate:ag47b");
if (!pkg.scripts?.["validate:ag47b"]) fail("Missing package script: validate:ag47b");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag47b")) fail("validate:project must include validate:ag47b.");

pass("AG47B Festival and Observance Registry Integration is present.");
pass("AG47A inputs are consumed.");
pass("Observance registry consumption is valid.");
pass("Festival public-preview display rules are valid.");
pass("Regional/manual verification notes are valid.");
pass("Observance safety boundary is valid.");
pass("No automated observance decision audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("AG47C readiness is valid.");
