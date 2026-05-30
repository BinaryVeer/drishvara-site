import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ ADB17 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb16-runtime-calculation-decision-checkpoint.json",
  "data/content-intelligence/runtime-engine/adb16-runtime-calculation-decision-record.json",
  "data/content-intelligence/runtime-engine/adb16-calculation-engine-route-decision.json",
  "data/content-intelligence/runtime-engine/adb16-dry-run-scope-decision.json",
  "data/content-intelligence/runtime-engine/adb16-location-ayanamsha-decision.json",
  "data/content-intelligence/runtime-engine/adb16-runtime-storage-boundary-decision.json",
  "data/content-intelligence/quality-registry/adb16-adb17-engine-contract-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb16-to-adb17-engine-contract-boundary.json",

  "data/content-intelligence/quality-reviews/adb17-engine-contract-dry-run-profile.json",
  "data/content-intelligence/runtime-engine/adb17-calculation-engine-contract.json",
  "data/content-intelligence/runtime-engine/adb17-panchanga-formula-coverage-contract.json",
  "data/content-intelligence/runtime-engine/adb17-non-public-dry-run-profile.json",
  "data/content-intelligence/runtime-engine/adb17-input-output-contract.json",
  "data/content-intelligence/runtime-engine/adb17-trace-log-contract.json",
  "data/content-intelligence/runtime-engine/adb17-adb18-validation-handoff.json",
  "data/content-intelligence/backend-architecture/adb17-no-runtime-execution-audit.json",
  "data/content-intelligence/backend-architecture/adb17-no-public-activation-audit.json",
  "data/content-intelligence/quality-registry/adb17-adb18-validation-protocol-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb17-to-adb18-validation-protocol-boundary.json",
  "data/quality/adb17-engine-contract-dry-run-profile.json",
  "data/quality/adb17-engine-contract-dry-run-profile-preview.json",
  "docs/quality/ADB17_ENGINE_CONTRACT_DRY_RUN_PROFILE.md",
  "scripts/generate-adb17-engine-contract-dry-run-profile.mjs",
  "scripts/validate-adb17-engine-contract-dry-run-profile.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb16Review = readJson("data/content-intelligence/quality-reviews/adb16-runtime-calculation-decision-checkpoint.json");
const adb16Decision = readJson("data/content-intelligence/runtime-engine/adb16-runtime-calculation-decision-record.json");
const adb16Readiness = readJson("data/content-intelligence/quality-registry/adb16-adb17-engine-contract-readiness-record.json");
const adb16Boundary = readJson("data/content-intelligence/mutation-plans/adb16-to-adb17-engine-contract-boundary.json");

if (adb16Review.status !== "runtime_engine_planning_decided_ready_for_adb17") fail("ADB16 review status mismatch.");
if (adb16Review.summary.runtime_engine_planning_approved !== true) fail("ADB16 engine planning must be approved.");
if (adb16Decision.decision.runtime_calculation_execution_approved_now !== false) fail("ADB16 runtime execution must remain deferred.");
if (adb16Readiness.ready_for_adb17 !== true) fail("ADB16 readiness must permit ADB17.");
if (adb16Boundary.next_stage_id !== "ADB17") fail("ADB16 boundary must point to ADB17.");

const review = readJson("data/content-intelligence/quality-reviews/adb17-engine-contract-dry-run-profile.json");
const engineContract = readJson("data/content-intelligence/runtime-engine/adb17-calculation-engine-contract.json");
const formulaCoverageContract = readJson("data/content-intelligence/runtime-engine/adb17-panchanga-formula-coverage-contract.json");
const dryRunProfile = readJson("data/content-intelligence/runtime-engine/adb17-non-public-dry-run-profile.json");
const inputOutputContract = readJson("data/content-intelligence/runtime-engine/adb17-input-output-contract.json");
const traceLogContract = readJson("data/content-intelligence/runtime-engine/adb17-trace-log-contract.json");
const validationHandOff = readJson("data/content-intelligence/runtime-engine/adb17-adb18-validation-handoff.json");
const noRuntimeExecutionAudit = readJson("data/content-intelligence/backend-architecture/adb17-no-runtime-execution-audit.json");
const noPublicActivationAudit = readJson("data/content-intelligence/backend-architecture/adb17-no-public-activation-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb17-adb18-validation-protocol-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb17-to-adb18-validation-protocol-boundary.json");
const preview = readJson("data/quality/adb17-engine-contract-dry-run-profile-preview.json");
const pkg = readJson("package.json");

if (review.status !== "engine_contract_dry_run_profile_ready_for_adb18") fail("ADB17 review status mismatch.");

for (const key of [
  "adb17_engine_contract_recorded",
  "adb16_consumed",
  "formula_coverage_contract_recorded",
  "dry_run_profile_recorded",
  "input_output_contract_recorded",
  "trace_log_contract_recorded",
  "adb18_validation_handoff_recorded",
  "ready_for_adb18_validation_protocol"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

for (const key of [
  "runtime_calculation_execution_approved_now",
  "runtime_calculation_executed",
  "computed_panchang_rows_written",
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

if (engineContract.execution_status !== "not_executed_in_adb17") fail("Engine must not execute in ADB17.");
for (const output of ["tithi_candidate", "nakshatra_candidate", "yoga_candidate", "karana_candidate", "vara_candidate", "rashi_candidate"]) {
  if (!engineContract.required_engine_outputs.includes(output)) fail(`Engine output missing: ${output}`);
}

if (formulaCoverageContract.coverage_status !== "contract_only_not_executed") fail("Formula coverage must be contract-only.");
for (const key of ["tithi_from_moon_sun_angular_separation", "nakshatra_from_sidereal_moon_longitude", "yoga_from_sun_moon_longitude_sum", "karana_from_half_tithi", "vara_from_local_sunrise_boundary", "rashi_from_sidereal_moon_longitude"]) {
  if (!JSON.stringify(formulaCoverageContract.required_formula_families).includes(key)) fail(`Formula key missing: ${key}`);
}

if (dryRunProfile.dry_run_status !== "planned_not_executed") fail("Dry-run must be planned, not executed.");
if (dryRunProfile.public_flags.public_use_allowed !== false) fail("Dry-run public_use_allowed must be false.");
if (dryRunProfile.ayanamsha_strategy.hardcoded_final_ayanamsha !== false) fail("Ayanamsha must not be final-hardcoded.");

if (inputOutputContract.database_write_status_now !== "not_approved_in_adb17") fail("Database write must not be approved in ADB17.");
if (!inputOutputContract.candidate_output_tables.includes("panchanga_calculation_trace_logs")) fail("Trace logs output table missing.");
if (inputOutputContract.required_output_controls.public_use_allowed !== false) fail("Output public flag must be false.");

if (traceLogContract.trace_write_status_now !== "not_executed_in_adb17") fail("Trace logging must not execute in ADB17.");
for (const field of ["sun_longitude", "moon_longitude", "formula_rule_id", "variance_against_reference"]) {
  if (!traceLogContract.required_trace_fields.includes(field)) fail(`Trace field missing: ${field}`);
}

if (validationHandOff.ready_for_adb18 !== true) fail("ADB18 handoff must be ready.");
if (!JSON.stringify(validationHandOff.required_adb18_checks).includes("Seed sufficiency")) fail("ADB18 seed sufficiency handoff missing.");

if (noRuntimeExecutionAudit.audit_passed !== true) fail("No-runtime execution audit must pass.");
if (noRuntimeExecutionAudit.failed_checks.length !== 0) fail("No-runtime execution failed checks must be zero.");

if (noPublicActivationAudit.audit_passed !== true) fail("No-public activation audit must pass.");
if (noPublicActivationAudit.failed_checks.length !== 0) fail("No-public activation failed checks must be zero.");

if (readiness.status !== "ready_for_adb18_validation_protocol") fail("ADB18 readiness status mismatch.");
if (readiness.ready_for_adb18 !== true) fail("ADB18 readiness must be true.");
if (readiness.next_stage_id !== "ADB18") fail("Readiness must point to ADB18.");
if (!readiness.adb18_blocked_scope.includes("Runtime calculation execution")) fail("ADB18 must block runtime calculation.");
if (!readiness.adb18_blocked_scope.includes("AG47 resume before ADB20")) fail("ADB18 must block AG47 before ADB20.");

if (boundary.next_stage_id !== "ADB18") fail("Boundary must point to ADB18.");

for (const key of [
  "adb17_engine_contract_recorded",
  "adb16_consumed",
  "formula_coverage_contract_recorded",
  "dry_run_profile_recorded",
  "input_output_contract_recorded",
  "trace_log_contract_recorded",
  "adb18_validation_handoff_recorded",
  "ready_for_adb18_validation_protocol"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "runtime_calculation_execution_approved_now",
  "runtime_calculation_executed",
  "computed_panchang_rows_written",
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

if (!pkg.scripts?.["generate:adb17"]) fail("Missing package script: generate:adb17");
if (!pkg.scripts?.["validate:adb17"]) fail("Missing package script: validate:adb17");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb17")) fail("validate:project must include validate:adb17.");

pass("ADB17 Calculation Engine Contract and Dry-run Profile is present.");
pass("ADB16 runtime decision is consumed.");
pass("Calculation engine contract is valid.");
pass("Formula coverage contract is valid.");
pass("Non-public dry-run profile is valid.");
pass("Input/output contract is valid.");
pass("Trace-log contract is valid.");
pass("ADB18 validation handoff is valid.");
pass("No runtime execution audit is valid.");
pass("No public activation audit is valid.");
pass("ADB18 Validation Protocol readiness is valid.");
