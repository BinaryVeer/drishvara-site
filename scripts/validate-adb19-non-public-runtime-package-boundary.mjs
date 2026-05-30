import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ ADB19 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb18-validation-protocol-seed-sufficiency.json",
  "data/content-intelligence/runtime-engine/adb18-seed-sufficiency-audit.json",
  "data/content-intelligence/runtime-engine/adb18-reference-panchang-comparison-protocol.json",
  "data/content-intelligence/runtime-engine/adb18-adb19-non-public-runtime-package-handoff.json",
  "data/content-intelligence/backend-architecture/adb18-no-runtime-execution-audit.json",
  "data/content-intelligence/backend-architecture/adb18-no-public-activation-audit.json",
  "data/content-intelligence/quality-registry/adb18-adb19-runtime-package-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb18-to-adb19-runtime-package-boundary.json",

  "data/content-intelligence/quality-reviews/adb19-non-public-runtime-package-boundary.json",
  "data/content-intelligence/runtime-engine/adb19-non-public-runtime-package-boundary.json",
  "data/content-intelligence/runtime-engine/adb19-future-dry-run-package-manifest.json",
  "data/content-intelligence/runtime-engine/adb19-dry-run-command-boundary.json",
  "data/content-intelligence/runtime-engine/adb19-runtime-result-capture-template.json",
  "data/content-intelligence/runtime-engine/adb19-non-public-storage-boundary.json",
  "data/content-intelligence/runtime-engine/adb19-runtime-rollback-stop-rules.json",
  "data/content-intelligence/backend-architecture/adb19-no-runtime-execution-audit.json",
  "data/content-intelligence/backend-architecture/adb19-no-public-activation-audit.json",
  "data/content-intelligence/backend-architecture/adb19-no-secret-exposure-audit.json",
  "data/content-intelligence/quality-registry/adb19-adb20-runtime-foundation-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb19-to-adb20-runtime-foundation-closure-boundary.json",
  "data/quality/adb19-non-public-runtime-package-boundary.json",
  "data/quality/adb19-non-public-runtime-package-boundary-preview.json",
  "docs/quality/ADB19_NON_PUBLIC_RUNTIME_PACKAGE_BOUNDARY.md",
  "scripts/generate-adb19-non-public-runtime-package-boundary.mjs",
  "scripts/validate-adb19-non-public-runtime-package-boundary.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb18Review = readJson("data/content-intelligence/quality-reviews/adb18-validation-protocol-seed-sufficiency.json");
const adb18SeedSufficiency = readJson("data/content-intelligence/runtime-engine/adb18-seed-sufficiency-audit.json");
const adb18Handoff = readJson("data/content-intelligence/runtime-engine/adb18-adb19-non-public-runtime-package-handoff.json");
const adb18NoRuntime = readJson("data/content-intelligence/backend-architecture/adb18-no-runtime-execution-audit.json");
const adb18NoPublic = readJson("data/content-intelligence/backend-architecture/adb18-no-public-activation-audit.json");
const adb18Readiness = readJson("data/content-intelligence/quality-registry/adb18-adb19-runtime-package-readiness-record.json");
const adb18Boundary = readJson("data/content-intelligence/mutation-plans/adb18-to-adb19-runtime-package-boundary.json");

if (adb18Review.status !== "validation_protocol_seed_sufficiency_ready_for_adb19") fail("ADB18 review status mismatch.");
if (adb18SeedSufficiency.sufficiency_result !== "sufficient_for_non_public_runtime_package_planning_not_execution") fail("ADB18 seed sufficiency mismatch.");
if (adb18Handoff.ready_for_adb19 !== true) fail("ADB18 handoff must permit ADB19.");
if (adb18NoRuntime.audit_passed !== true) fail("ADB18 no-runtime audit must pass.");
if (adb18NoPublic.audit_passed !== true) fail("ADB18 no-public audit must pass.");
if (adb18Readiness.ready_for_adb19 !== true) fail("ADB18 readiness must permit ADB19.");
if (adb18Boundary.next_stage_id !== "ADB19") fail("ADB18 boundary must point to ADB19.");

const review = readJson("data/content-intelligence/quality-reviews/adb19-non-public-runtime-package-boundary.json");
const runtimePackageBoundary = readJson("data/content-intelligence/runtime-engine/adb19-non-public-runtime-package-boundary.json");
const dryRunPackageManifest = readJson("data/content-intelligence/runtime-engine/adb19-future-dry-run-package-manifest.json");
const dryRunCommandBoundary = readJson("data/content-intelligence/runtime-engine/adb19-dry-run-command-boundary.json");
const resultCaptureTemplate = readJson("data/content-intelligence/runtime-engine/adb19-runtime-result-capture-template.json");
const nonPublicStorageBoundary = readJson("data/content-intelligence/runtime-engine/adb19-non-public-storage-boundary.json");
const rollbackAndStopRules = readJson("data/content-intelligence/runtime-engine/adb19-runtime-rollback-stop-rules.json");
const noRuntimeExecutionAudit = readJson("data/content-intelligence/backend-architecture/adb19-no-runtime-execution-audit.json");
const noPublicActivationAudit = readJson("data/content-intelligence/backend-architecture/adb19-no-public-activation-audit.json");
const noSecretExposureAudit = readJson("data/content-intelligence/backend-architecture/adb19-no-secret-exposure-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb19-adb20-runtime-foundation-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb19-to-adb20-runtime-foundation-closure-boundary.json");
const preview = readJson("data/quality/adb19-non-public-runtime-package-boundary-preview.json");
const pkg = readJson("package.json");

if (review.status !== "non_public_runtime_package_boundary_ready_for_adb20") fail("ADB19 review status mismatch.");

for (const key of [
  "adb19_non_public_runtime_package_boundary_recorded",
  "adb18_consumed",
  "future_dry_run_package_manifest_recorded",
  "dry_run_command_boundary_recorded",
  "runtime_result_capture_template_recorded",
  "non_public_storage_boundary_recorded",
  "rollback_stop_rules_recorded",
  "ready_for_adb20_runtime_foundation_closure",
  "dry_run_execution_package_prepared_for_future"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

for (const key of [
  "dry_run_command_generated_for_execution_now",
  "runtime_calculation_execution_approved_now",
  "runtime_calculation_executed",
  "computed_panchang_rows_written",
  "panchanga_trace_rows_written",
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

if (runtimePackageBoundary.status !== "non_public_runtime_package_boundary_recorded") fail("Runtime package boundary status mismatch.");
if (!runtimePackageBoundary.blocked_now.includes("Runtime calculation execution")) fail("Runtime calculation must be blocked.");
if (!runtimePackageBoundary.blocked_now.includes("AG47 resume before ADB20")) fail("AG47 must be blocked before ADB20.");

if (dryRunPackageManifest.package_prepared_for_execution_now !== false) fail("Dry-run package must not be prepared for execution now.");
if (dryRunPackageManifest.dry_run_scope.public_use_allowed !== false) fail("Dry-run public_use_allowed must be false.");
if (!dryRunPackageManifest.candidate_outputs.includes("panchanga_calculation_trace_logs")) fail("Trace-log output candidate missing.");

if (dryRunCommandBoundary.command_generation_status !== "not_generated_for_execution") fail("Execution command must not be generated.");
if (dryRunCommandBoundary.command_execution_status !== "not_executed") fail("Execution command must not execute.");

if (resultCaptureTemplate.capture_status_now !== "template_only") fail("Result capture must be template-only.");
if (!resultCaptureTemplate.future_result_fields.includes("public_use_allowed_all_false")) fail("Result capture template missing public flag check.");

if (nonPublicStorageBoundary.mandatory_future_row_defaults.public_use_allowed !== false) fail("Future row public flag must be false.");
if (!nonPublicStorageBoundary.prohibited_without_later_approval.includes("deployment")) fail("Deployment must remain prohibited.");

if (rollbackAndStopRules.future_stop_conditions.length < 5) fail("Rollback stop rules incomplete.");
if (!JSON.stringify(rollbackAndStopRules.rollback_policy).includes("No public output")) fail("Rollback policy must block public output.");

if (noRuntimeExecutionAudit.audit_passed !== true) fail("No-runtime execution audit must pass.");
if (noRuntimeExecutionAudit.failed_checks.length !== 0) fail("No-runtime failed checks must be zero.");

if (noPublicActivationAudit.audit_passed !== true) fail("No-public activation audit must pass.");
if (noPublicActivationAudit.failed_checks.length !== 0) fail("No-public failed checks must be zero.");

if (noSecretExposureAudit.audit_passed !== true) fail("No-secret exposure audit must pass.");
if (noSecretExposureAudit.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");

if (readiness.status !== "ready_for_adb20_runtime_foundation_closure") fail("ADB20 readiness status mismatch.");
if (readiness.ready_for_adb20 !== true) fail("ADB20 readiness must be true.");
if (readiness.next_stage_id !== "ADB20") fail("Readiness must point to ADB20.");
if (!readiness.adb20_allowed_scope.includes("Create AG47 return gate.")) fail("ADB20 must create AG47 return gate.");
if (!readiness.adb20_blocked_scope.includes("Runtime calculation execution")) fail("ADB20 must block runtime calculation.");

if (boundary.next_stage_id !== "ADB20") fail("Boundary must point to ADB20.");

for (const key of [
  "adb19_non_public_runtime_package_boundary_recorded",
  "adb18_consumed",
  "future_dry_run_package_manifest_recorded",
  "dry_run_command_boundary_recorded",
  "runtime_result_capture_template_recorded",
  "non_public_storage_boundary_recorded",
  "rollback_stop_rules_recorded",
  "ready_for_adb20_runtime_foundation_closure",
  "dry_run_execution_package_prepared_for_future"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "dry_run_command_generated_for_execution_now",
  "runtime_calculation_execution_approved_now",
  "runtime_calculation_executed",
  "computed_panchang_rows_written",
  "panchanga_trace_rows_written",
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

if (!pkg.scripts?.["generate:adb19"]) fail("Missing package script: generate:adb19");
if (!pkg.scripts?.["validate:adb19"]) fail("Missing package script: validate:adb19");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb19")) fail("validate:project must include validate:adb19.");

pass("ADB19 Non-public Runtime Package Boundary is present.");
pass("ADB18 validation protocol is consumed.");
pass("Future dry-run package manifest is valid.");
pass("Dry-run command boundary is valid.");
pass("Runtime result-capture template is valid.");
pass("Non-public storage boundary is valid.");
pass("Rollback and stop rules are valid.");
pass("No runtime execution audit is valid.");
pass("No public activation audit is valid.");
pass("No secret exposure audit is valid.");
pass("ADB20 Runtime Foundation Closure readiness is valid.");
