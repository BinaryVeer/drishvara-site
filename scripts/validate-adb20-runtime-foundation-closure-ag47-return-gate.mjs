import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ ADB20 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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

  "data/content-intelligence/quality-reviews/adb20-runtime-foundation-closure-ag47-return-gate.json",
  "data/content-intelligence/runtime-engine/adb20-adb-runtime-foundation-closure-record.json",
  "data/content-intelligence/runtime-engine/adb20-ads-coverage-reconciliation.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  "data/content-intelligence/runtime-engine/adb20-ag47-return-gate.json",
  "data/content-intelligence/runtime-engine/adb20-future-runtime-return-instructions.json",
  "data/content-intelligence/backend-architecture/adb20-no-runtime-execution-audit.json",
  "data/content-intelligence/backend-architecture/adb20-no-public-activation-audit.json",
  "data/content-intelligence/backend-architecture/adb20-no-deployment-audit.json",
  "data/content-intelligence/backend-architecture/adb20-no-secret-exposure-audit.json",
  "data/content-intelligence/quality-registry/adb20-ag47-return-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb20-to-ag47-return-boundary.json",
  "data/quality/adb20-runtime-foundation-closure-ag47-return-gate.json",
  "data/quality/adb20-runtime-foundation-closure-ag47-return-gate-preview.json",
  "docs/quality/ADB20_RUNTIME_FOUNDATION_CLOSURE_AG47_RETURN_GATE.md",
  "scripts/generate-adb20-runtime-foundation-closure-ag47-return-gate.mjs",
  "scripts/validate-adb20-runtime-foundation-closure-ag47-return-gate.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb19Review = readJson("data/content-intelligence/quality-reviews/adb19-non-public-runtime-package-boundary.json");
const adb19Manifest = readJson("data/content-intelligence/runtime-engine/adb19-future-dry-run-package-manifest.json");
const adb19CommandBoundary = readJson("data/content-intelligence/runtime-engine/adb19-dry-run-command-boundary.json");
const adb19NoRuntime = readJson("data/content-intelligence/backend-architecture/adb19-no-runtime-execution-audit.json");
const adb19NoPublic = readJson("data/content-intelligence/backend-architecture/adb19-no-public-activation-audit.json");
const adb19NoSecret = readJson("data/content-intelligence/backend-architecture/adb19-no-secret-exposure-audit.json");
const adb19Readiness = readJson("data/content-intelligence/quality-registry/adb19-adb20-runtime-foundation-closure-readiness-record.json");
const adb19Boundary = readJson("data/content-intelligence/mutation-plans/adb19-to-adb20-runtime-foundation-closure-boundary.json");

if (adb19Review.status !== "non_public_runtime_package_boundary_ready_for_adb20") fail("ADB19 review status mismatch.");
if (adb19Manifest.package_prepared_for_execution_now !== false) fail("ADB19 dry-run package must not be executable now.");
if (adb19CommandBoundary.command_generation_status !== "not_generated_for_execution") fail("ADB19 command must not be generated for execution.");
if (adb19NoRuntime.audit_passed !== true) fail("ADB19 no-runtime audit must pass.");
if (adb19NoPublic.audit_passed !== true) fail("ADB19 no-public audit must pass.");
if (adb19NoSecret.service_role_key_exposed !== false) fail("ADB19 service-role key must not be exposed.");
if (adb19Readiness.ready_for_adb20 !== true) fail("ADB19 readiness must permit ADB20.");
if (adb19Boundary.next_stage_id !== "ADB20") fail("ADB19 boundary must point to ADB20.");

const review = readJson("data/content-intelligence/quality-reviews/adb20-runtime-foundation-closure-ag47-return-gate.json");
const closureRecord = readJson("data/content-intelligence/runtime-engine/adb20-adb-runtime-foundation-closure-record.json");
const adsCoverageReconciliation = readJson("data/content-intelligence/runtime-engine/adb20-ads-coverage-reconciliation.json");
const apiRuntimeDeferralRecord = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");
const ag47ReturnGate = readJson("data/content-intelligence/runtime-engine/adb20-ag47-return-gate.json");
const futureReturnInstructions = readJson("data/content-intelligence/runtime-engine/adb20-future-runtime-return-instructions.json");
const noRuntimeExecutionAudit = readJson("data/content-intelligence/backend-architecture/adb20-no-runtime-execution-audit.json");
const noPublicActivationAudit = readJson("data/content-intelligence/backend-architecture/adb20-no-public-activation-audit.json");
const noDeploymentAudit = readJson("data/content-intelligence/backend-architecture/adb20-no-deployment-audit.json");
const noSecretExposureAudit = readJson("data/content-intelligence/backend-architecture/adb20-no-secret-exposure-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb20-ag47-return-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb20-to-ag47-return-boundary.json");
const preview = readJson("data/quality/adb20-runtime-foundation-closure-ag47-return-gate-preview.json");
const pkg = readJson("package.json");

if (review.status !== "adb_runtime_foundation_closed_ready_for_ag47") fail("ADB20 review status mismatch.");

for (const key of [
  "adb20_runtime_foundation_closed",
  "adb19_consumed",
  "adb_schema_foundation_completed",
  "adb_seed_foundation_completed",
  "adb_runtime_planning_completed",
  "ads_coverage_reconciliation_completed",
  "ag47_return_gate_created",
  "ready_for_ag47"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.total_seed_rows_verified !== 45) fail("ADB20 must preserve 45 verified seed rows.");
if (review.summary.hard_blocker_count_for_ag47 !== 0) fail("AG47 blocker count must be zero.");

for (const key of [
  "api_runtime_database_reading_approved_now",
  "website_database_reading_enabled",
  "runtime_calculation_execution_approved_now",
  "runtime_calculation_executed",
  "computed_panchang_rows_written",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "rls_public_policy_activation_performed",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_content_generated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (closureRecord.status !== "adb_runtime_foundation_closed_ready_for_ag47") fail("Closure record status mismatch.");
for (const item of ["ADB10 live schema creation in Supabase", "ADB15 seed insertion result capture; 45 seed rows verified", "ADB19 non-public runtime package boundary"]) {
  if (!closureRecord.completed_scope.includes(item)) fail(`Closure completed scope missing: ${item}`);
}

if (adsCoverageReconciliation.status !== "ads_coverage_reconciliation_completed") fail("ADS reconciliation status mismatch.");
const adsText = JSON.stringify(adsCoverageReconciliation);
for (const adsId of ["ADS01", "ADS02", "ADS03", "ADS04", "ADS05", "ADS06", "ADS07", "ADS08", "API_RUNTIME"]) {
  if (!adsText.includes(adsId)) fail(`ADS reconciliation missing ${adsId}.`);
}
if (!adsText.includes("partially_covered")) fail("ADS reconciliation must record partial coverage items.");
if (!adsText.includes("deferred")) fail("ADS reconciliation must record deferred API/runtime.");

if (apiRuntimeDeferralRecord.status !== "api_runtime_database_reading_deferred") fail("API/runtime deferral status mismatch.");
if (apiRuntimeDeferralRecord.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");
if (apiRuntimeDeferralRecord.api_runtime_database_reading_approved_now !== false) fail("API/runtime database reading must not be approved.");

if (ag47ReturnGate.status !== "ag47_return_gate_created") fail("AG47 return gate status mismatch.");
if (ag47ReturnGate.ag47_return_allowed !== true) fail("AG47 return must be allowed.");
if (ag47ReturnGate.return_target !== "AG47") fail("AG47 return target mismatch.");

if (futureReturnInstructions.status !== "future_runtime_return_instructions_recorded") fail("Future return instructions status mismatch.");
if (!JSON.stringify(futureReturnInstructions.when_returning_after_ag_series).includes("Do not recreate seed source planning")) fail("Future return instructions must block duplication.");

if (noRuntimeExecutionAudit.audit_passed !== true) fail("No-runtime execution audit must pass.");
if (noRuntimeExecutionAudit.failed_checks.length !== 0) fail("No-runtime failed checks must be zero.");

if (noPublicActivationAudit.audit_passed !== true) fail("No-public activation audit must pass.");
if (noPublicActivationAudit.failed_checks.length !== 0) fail("No-public failed checks must be zero.");

if (noDeploymentAudit.audit_passed !== true) fail("No-deployment audit must pass.");
if (noDeploymentAudit.deployment_performed !== false) fail("Deployment must remain false.");

if (noSecretExposureAudit.audit_passed !== true) fail("No-secret exposure audit must pass.");
if (noSecretExposureAudit.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");

if (readiness.status !== "ready_to_return_to_ag47") fail("AG47 readiness status mismatch.");
if (readiness.ready_for_ag47 !== true) fail("AG47 readiness must be true.");
if (readiness.next_stage_id !== "AG47") fail("Readiness must point to AG47.");
if (!readiness.ag47_blocked_scope_by_default.includes("Website database-reading/API runtime activation")) fail("AG47 must block website DB reading by default.");

if (boundary.next_stage_id !== "AG47") fail("Boundary must point to AG47.");
if (!JSON.stringify(boundary.allowed_scope).includes("Resume AG roadmap from AG47")) fail("AG47 return scope missing.");

for (const key of [
  "adb20_runtime_foundation_closed",
  "adb19_consumed",
  "adb_schema_foundation_completed",
  "adb_seed_foundation_completed",
  "adb_runtime_planning_completed",
  "ads_coverage_reconciliation_completed",
  "ag47_return_gate_created",
  "ready_for_ag47"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.total_seed_rows_verified !== 45) fail("Preview total seed rows must be 45.");
for (const key of [
  "api_runtime_database_reading_approved_now",
  "website_database_reading_enabled",
  "runtime_calculation_execution_approved_now",
  "runtime_calculation_executed",
  "computed_panchang_rows_written",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "rls_public_policy_activation_performed",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_content_generated"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb20"]) fail("Missing package script: generate:adb20");
if (!pkg.scripts?.["validate:adb20"]) fail("Missing package script: validate:adb20");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb20")) fail("validate:project must include validate:adb20.");

pass("ADB20 Runtime Foundation Closure and AG47 Return Gate is present.");
pass("ADB19 non-public runtime package boundary is consumed.");
pass("ADB runtime foundation closure is valid.");
pass("ADS01–ADS08 plus API/Runtime reconciliation is valid.");
pass("API/runtime website database reading remains deferred.");
pass("AG47 return gate is valid.");
pass("Future runtime return instructions are valid.");
pass("No runtime execution audit is valid.");
pass("No public activation audit is valid.");
pass("No deployment audit is valid.");
pass("No secret exposure audit is valid.");
pass("AG47 Return readiness is valid.");
