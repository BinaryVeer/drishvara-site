import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ ADB18 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb17-engine-contract-dry-run-profile.json",
  "data/content-intelligence/runtime-engine/adb17-calculation-engine-contract.json",
  "data/content-intelligence/runtime-engine/adb17-panchanga-formula-coverage-contract.json",
  "data/content-intelligence/runtime-engine/adb17-non-public-dry-run-profile.json",
  "data/content-intelligence/runtime-engine/adb17-input-output-contract.json",
  "data/content-intelligence/runtime-engine/adb17-trace-log-contract.json",
  "data/content-intelligence/quality-registry/adb17-adb18-validation-protocol-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb17-to-adb18-validation-protocol-boundary.json",

  "data/content-intelligence/quality-reviews/adb18-validation-protocol-seed-sufficiency.json",
  "data/content-intelligence/runtime-engine/adb18-seed-sufficiency-audit.json",
  "data/content-intelligence/runtime-engine/adb18-reference-panchang-comparison-protocol.json",
  "data/content-intelligence/runtime-engine/adb18-formula-coverage-validation-protocol.json",
  "data/content-intelligence/runtime-engine/adb18-location-sunrise-ayanamsha-validation-protocol.json",
  "data/content-intelligence/runtime-engine/adb18-dry-run-acceptance-thresholds.json",
  "data/content-intelligence/runtime-engine/adb18-runtime-risk-register.json",
  "data/content-intelligence/runtime-engine/adb18-adb19-non-public-runtime-package-handoff.json",
  "data/content-intelligence/backend-architecture/adb18-no-runtime-execution-audit.json",
  "data/content-intelligence/backend-architecture/adb18-no-public-activation-audit.json",
  "data/content-intelligence/quality-registry/adb18-adb19-runtime-package-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb18-to-adb19-runtime-package-boundary.json",
  "data/quality/adb18-validation-protocol-seed-sufficiency.json",
  "data/quality/adb18-validation-protocol-seed-sufficiency-preview.json",
  "docs/quality/ADB18_VALIDATION_PROTOCOL_SEED_SUFFICIENCY.md",
  "scripts/generate-adb18-validation-protocol-seed-sufficiency.mjs",
  "scripts/validate-adb18-validation-protocol-seed-sufficiency.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb17Review = readJson("data/content-intelligence/quality-reviews/adb17-engine-contract-dry-run-profile.json");
const adb17EngineContract = readJson("data/content-intelligence/runtime-engine/adb17-calculation-engine-contract.json");
const adb17InputOutput = readJson("data/content-intelligence/runtime-engine/adb17-input-output-contract.json");
const adb17Readiness = readJson("data/content-intelligence/quality-registry/adb17-adb18-validation-protocol-readiness-record.json");
const adb17Boundary = readJson("data/content-intelligence/mutation-plans/adb17-to-adb18-validation-protocol-boundary.json");

if (adb17Review.status !== "engine_contract_dry_run_profile_ready_for_adb18") fail("ADB17 review status mismatch.");
if (adb17EngineContract.execution_status !== "not_executed_in_adb17") fail("ADB17 engine must not execute.");
if (adb17InputOutput.database_write_status_now !== "not_approved_in_adb17") fail("ADB17 database write must not be approved.");
if (adb17Readiness.ready_for_adb18 !== true) fail("ADB17 readiness must permit ADB18.");
if (adb17Boundary.next_stage_id !== "ADB18") fail("ADB17 boundary must point to ADB18.");

const review = readJson("data/content-intelligence/quality-reviews/adb18-validation-protocol-seed-sufficiency.json");
const seedSufficiencyAudit = readJson("data/content-intelligence/runtime-engine/adb18-seed-sufficiency-audit.json");
const referenceComparisonProtocol = readJson("data/content-intelligence/runtime-engine/adb18-reference-panchang-comparison-protocol.json");
const formulaValidationProtocol = readJson("data/content-intelligence/runtime-engine/adb18-formula-coverage-validation-protocol.json");
const locationSunriseAyanamshaProtocol = readJson("data/content-intelligence/runtime-engine/adb18-location-sunrise-ayanamsha-validation-protocol.json");
const dryRunAcceptanceThresholds = readJson("data/content-intelligence/runtime-engine/adb18-dry-run-acceptance-thresholds.json");
const runtimeRiskRegister = readJson("data/content-intelligence/runtime-engine/adb18-runtime-risk-register.json");
const adb19Handoff = readJson("data/content-intelligence/runtime-engine/adb18-adb19-non-public-runtime-package-handoff.json");
const noRuntimeExecutionAudit = readJson("data/content-intelligence/backend-architecture/adb18-no-runtime-execution-audit.json");
const noPublicActivationAudit = readJson("data/content-intelligence/backend-architecture/adb18-no-public-activation-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb18-adb19-runtime-package-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb18-to-adb19-runtime-package-boundary.json");
const preview = readJson("data/quality/adb18-validation-protocol-seed-sufficiency-preview.json");
const pkg = readJson("package.json");

if (review.status !== "validation_protocol_seed_sufficiency_ready_for_adb19") fail("ADB18 review status mismatch.");

for (const key of [
  "adb18_validation_protocol_recorded",
  "adb17_consumed",
  "seed_sufficiency_audit_recorded",
  "reference_comparison_protocol_recorded",
  "formula_validation_protocol_recorded",
  "location_sunrise_ayanamsha_protocol_recorded",
  "dry_run_acceptance_thresholds_recorded",
  "runtime_risk_register_recorded",
  "adb19_runtime_package_handoff_recorded",
  "ready_for_adb19_runtime_package_boundary"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.total_seed_rows_available !== 45) fail("ADB18 must record 45 seed rows.");
for (const key of [
  "runtime_calculation_execution_approved_now",
  "runtime_calculation_executed",
  "computed_panchang_rows_written",
  "dry_run_package_executed",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_content_generated",
  "ag47_resume_now"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (seedSufficiencyAudit.total_seed_rows_available !== 45) fail("Seed sufficiency must record 45 rows.");
if (seedSufficiencyAudit.sufficiency_result !== "sufficient_for_non_public_runtime_package_planning_not_execution") fail("Seed sufficiency result mismatch.");
if (!seedSufficiencyAudit.insufficient_for.includes("public Panchang output")) fail("Public Panchang must remain insufficient.");

if (referenceComparisonProtocol.comparison_execution_status !== "not_executed_in_adb18") fail("Reference comparison must not execute.");
if (referenceComparisonProtocol.minimum_reference_count_before_public_use !== 2) fail("Minimum reference count must be 2.");

if (formulaValidationProtocol.coverage_result !== "sufficient_for_protocol_not_execution") fail("Formula validation must be protocol-only.");
for (const key of ["tithi_from_moon_sun_angular_separation", "nakshatra_from_sidereal_moon_longitude", "vara_from_local_sunrise_boundary"]) {
  if (!JSON.stringify(formulaValidationProtocol.formula_checks).includes(key)) fail(`Formula validation missing: ${key}`);
}

if (locationSunriseAyanamshaProtocol.validation_execution_status !== "not_executed_in_adb18") fail("Location/ayanamsha validation must not execute.");
if (locationSunriseAyanamshaProtocol.ayanamsha_validation.final_ayanamsha_hardcoded !== false) fail("Final ayanamsha must not be hardcoded.");

if (dryRunAcceptanceThresholds.dry_run_scope !== "7_day_initial_window_internal_only") fail("Dry-run scope mismatch.");
if (dryRunAcceptanceThresholds.public_release_threshold !== "not_defined_until_later_public_activation_stage") fail("Public release threshold must not be defined.");

if (runtimeRiskRegister.risks.length < 4) fail("Runtime risk register must have at least 4 risks.");

if (adb19Handoff.ready_for_adb19 !== true) fail("ADB19 handoff must be ready.");
if (!JSON.stringify(adb19Handoff.adb19_package_requirements).includes("non-public dry-run package boundary")) fail("ADB19 package handoff missing.");

if (noRuntimeExecutionAudit.audit_passed !== true) fail("No-runtime execution audit must pass.");
if (noRuntimeExecutionAudit.failed_checks.length !== 0) fail("No-runtime failed checks must be zero.");

if (noPublicActivationAudit.audit_passed !== true) fail("No-public activation audit must pass.");
if (noPublicActivationAudit.failed_checks.length !== 0) fail("No-public failed checks must be zero.");

if (readiness.status !== "ready_for_adb19_runtime_package_boundary") fail("ADB19 readiness status mismatch.");
if (readiness.ready_for_adb19 !== true) fail("ADB19 readiness must be true.");
if (readiness.next_stage_id !== "ADB19") fail("Readiness must point to ADB19.");
if (!readiness.adb19_blocked_scope.includes("Runtime calculation execution")) fail("ADB19 must block runtime calculation.");
if (!readiness.adb19_blocked_scope.includes("AG47 resume before ADB20")) fail("ADB19 must block AG47 before ADB20.");

if (boundary.next_stage_id !== "ADB19") fail("Boundary must point to ADB19.");

for (const key of [
  "adb18_validation_protocol_recorded",
  "adb17_consumed",
  "seed_sufficiency_audit_recorded",
  "reference_comparison_protocol_recorded",
  "formula_validation_protocol_recorded",
  "location_sunrise_ayanamsha_protocol_recorded",
  "dry_run_acceptance_thresholds_recorded",
  "runtime_risk_register_recorded",
  "adb19_runtime_package_handoff_recorded",
  "ready_for_adb19_runtime_package_boundary"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.total_seed_rows_available !== 45) fail("Preview seed rows must be 45.");
for (const key of [
  "runtime_calculation_execution_approved_now",
  "runtime_calculation_executed",
  "computed_panchang_rows_written",
  "dry_run_package_executed",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_content_generated",
  "ag47_resume_now"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb18"]) fail("Missing package script: generate:adb18");
if (!pkg.scripts?.["validate:adb18"]) fail("Missing package script: validate:adb18");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb18")) fail("validate:project must include validate:adb18.");

pass("ADB18 Dry-run Validation Protocol and Seed Sufficiency Audit is present.");
pass("ADB17 engine contract is consumed.");
pass("Seed sufficiency audit is valid.");
pass("Reference Panchang comparison protocol is valid.");
pass("Formula validation protocol is valid.");
pass("Location/sunrise/ayanamsha validation protocol is valid.");
pass("Dry-run acceptance thresholds are valid.");
pass("Runtime risk register is valid.");
pass("ADB19 handoff is valid.");
pass("No runtime execution audit is valid.");
pass("No public activation audit is valid.");
pass("ADB19 Runtime Package readiness is valid.");
