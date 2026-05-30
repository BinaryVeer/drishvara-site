import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG47A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag47r-roadmap-alignment-before-ag47a.json",
  "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  "data/content-intelligence/ag-roadmap/ag47r-ag47a-to-ag47z-substage-plan.json",
  "data/content-intelligence/ag-roadmap/ag47r-no-duplication-and-consumption-rule.json",
  "data/content-intelligence/quality-registry/ag47r-ag47a-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag47r-to-ag47a-boundary.json",
  "data/content-intelligence/runtime-engine/adb20-ads-coverage-reconciliation.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  "data/content-intelligence/runtime-engine/adb20-adb-runtime-foundation-closure-record.json",

  "data/content-intelligence/quality-reviews/ag47a-panchang-method-location-basis-consumption.json",
  "data/content-intelligence/cultural-modules/ag47a-panchang-method-consumption-record.json",
  "data/content-intelligence/cultural-modules/ag47a-location-basis-consumption-record.json",
  "data/content-intelligence/cultural-modules/ag47a-source-validation-consumption-record.json",
  "data/content-intelligence/cultural-modules/ag47a-panchang-runtime-boundary-record.json",
  "data/content-intelligence/backend-architecture/ag47a-live-calculation-disabled-audit.json",
  "data/content-intelligence/backend-architecture/ag47a-no-api-db-activation-audit.json",
  "data/content-intelligence/quality-registry/ag47a-ag47b-festival-observance-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag47a-to-ag47b-festival-observance-boundary.json",
  "data/quality/ag47a-panchang-method-location-basis-consumption.json",
  "data/quality/ag47a-panchang-method-location-basis-consumption-preview.json",
  "docs/quality/AG47A_PANCHANG_METHOD_LOCATION_BASIS_CONSUMPTION.md",
  "scripts/generate-ag47a-panchang-method-location-basis.mjs",
  "scripts/validate-ag47a-panchang-method-location-basis.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag47rReview = readJson("data/content-intelligence/quality-reviews/ag47r-roadmap-alignment-before-ag47a.json");
const ag47rSubstagePlan = readJson("data/content-intelligence/ag-roadmap/ag47r-ag47a-to-ag47z-substage-plan.json");
const ag47rReadiness = readJson("data/content-intelligence/quality-registry/ag47r-ag47a-readiness-record.json");
const ag47rBoundary = readJson("data/content-intelligence/mutation-plans/ag47r-to-ag47a-boundary.json");
const adb20Ads = readJson("data/content-intelligence/runtime-engine/adb20-ads-coverage-reconciliation.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag47rReview.status !== "roadmap_aligned_ready_for_ag47a") fail("AG47R status mismatch.");
if (ag47rSubstagePlan.next_actual_stage !== "AG47A") fail("AG47R must point to AG47A.");
if (ag47rReadiness.ready_for_ag47a !== true) fail("AG47A readiness must be true.");
if (ag47rBoundary.next_stage_id !== "AG47A") fail("AG47R boundary must point to AG47A.");
if (adb20Ads.status !== "ads_coverage_reconciliation_completed") fail("ADB20 ADS reconciliation missing.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag47a-panchang-method-location-basis-consumption.json");
const methodConsumption = readJson("data/content-intelligence/cultural-modules/ag47a-panchang-method-consumption-record.json");
const locationBasis = readJson("data/content-intelligence/cultural-modules/ag47a-location-basis-consumption-record.json");
const sourceValidationConsumption = readJson("data/content-intelligence/cultural-modules/ag47a-source-validation-consumption-record.json");
const panchangRuntimeBoundary = readJson("data/content-intelligence/cultural-modules/ag47a-panchang-runtime-boundary-record.json");
const liveCalculationDisabledAudit = readJson("data/content-intelligence/backend-architecture/ag47a-live-calculation-disabled-audit.json");
const noApiDbActivationAudit = readJson("data/content-intelligence/backend-architecture/ag47a-no-api-db-activation-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag47a-ag47b-festival-observance-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag47a-to-ag47b-festival-observance-boundary.json");
const preview = readJson("data/quality/ag47a-panchang-method-location-basis-consumption-preview.json");
const pkg = readJson("package.json");

if (review.status !== "panchang_method_location_basis_ready_for_ag47b") fail("AG47A review status mismatch.");

for (const key of [
  "ag47a_panchang_method_location_basis_consumed",
  "ag47r_consumed",
  "adb20_ads_consumed",
  "method_boundary_confirmed",
  "location_basis_boundary_confirmed",
  "source_validation_consumed",
  "live_calculation_disabled_confirmed",
  "ready_for_ag47b_festival_observance_registry"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

for (const key of [
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
  "public_generated_panchang_output",
  "public_content_generated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (methodConsumption.status !== "panchang_method_consumption_recorded") fail("Method consumption status mismatch.");
if (methodConsumption.method_boundary.use_as_live_calculation_engine !== false) fail("Method must not be used as live engine.");
if (methodConsumption.method_boundary.live_calculation_status !== "disabled") fail("Live calculation must be disabled.");

if (locationBasis.status !== "location_basis_consumption_recorded") fail("Location basis status mismatch.");
if (locationBasis.first_preview_policy.live_location_calculation_enabled_now !== false) fail("Live location calculation must be disabled.");

if (sourceValidationConsumption.status !== "source_validation_consumption_recorded") fail("Source validation status mismatch.");
if (sourceValidationConsumption.source_policy.invented_panchang_claims_allowed !== false) fail("Invented Panchang claims must be blocked.");

if (panchangRuntimeBoundary.status !== "panchang_runtime_boundary_recorded") fail("Runtime boundary status mismatch.");
if (panchangRuntimeBoundary.boundary.runtime_calculation_enabled !== false) fail("Runtime calculation must be disabled.");
if (panchangRuntimeBoundary.boundary.website_reads_database !== false) fail("Website must not read DB.");
if (panchangRuntimeBoundary.boundary.public_generated_output_enabled !== false) fail("Public generated output must be disabled.");

if (liveCalculationDisabledAudit.audit_passed !== true) fail("Live calculation disabled audit must pass.");
if (liveCalculationDisabledAudit.failed_checks.length !== 0) fail("Live calculation audit failed checks must be zero.");

if (noApiDbActivationAudit.audit_passed !== true) fail("No API/DB activation audit must pass.");
if (noApiDbActivationAudit.failed_checks.length !== 0) fail("No API/DB audit failed checks must be zero.");

if (readiness.status !== "ready_for_ag47b_festival_observance_registry") fail("AG47B readiness status mismatch.");
if (readiness.ready_for_ag47b !== true) fail("AG47B readiness must be true.");
if (readiness.next_stage_id !== "AG47B") fail("Readiness must point to AG47B.");

if (boundary.next_stage_id !== "AG47B") fail("Boundary must point to AG47B.");

for (const key of [
  "ag47a_panchang_method_location_basis_consumed",
  "ag47r_consumed",
  "adb20_ads_consumed",
  "method_boundary_confirmed",
  "location_basis_boundary_confirmed",
  "source_validation_consumed",
  "live_calculation_disabled_confirmed",
  "ready_for_ag47b_festival_observance_registry"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
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
  "public_generated_panchang_output",
  "public_content_generated"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag47a"]) fail("Missing package script: generate:ag47a");
if (!pkg.scripts?.["validate:ag47a"]) fail("Missing package script: validate:ag47a");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag47a")) fail("validate:project must include validate:ag47a.");

pass("AG47A Panchang Method and Location Basis Consumption is present.");
pass("AG47R and ADB20 inputs are consumed.");
pass("Panchang method boundary is valid.");
pass("Location basis boundary is valid.");
pass("Source validation consumption is valid.");
pass("Runtime boundary keeps live calculation disabled.");
pass("No API/DB activation audit is valid.");
pass("AG47B Festival Observance readiness is valid.");
