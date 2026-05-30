import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ ADB16 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb15-seed-insertion-result-capture.json",
  "data/content-intelligence/seed-insertion/adb15-row-count-verification-result.json",
  "data/content-intelligence/seed-insertion/adb15-seed-foundation-status-record.json",
  "data/content-intelligence/backend-architecture/adb15-no-runtime-activation-audit.json",
  "data/content-intelligence/backend-architecture/adb15-secret-handling-audit.json",
  "data/content-intelligence/backend-architecture/adb15-no-deployment-audit.json",
  "data/content-intelligence/quality-registry/adb15-adb16-runtime-decision-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb15-to-adb16-runtime-decision-boundary.json",

  "data/content-intelligence/quality-reviews/adb16-runtime-calculation-decision-checkpoint.json",
  "data/content-intelligence/runtime-engine/adb16-runtime-calculation-decision-record.json",
  "data/content-intelligence/runtime-engine/adb16-adb17-to-adb20-runtime-foundation-plan.json",
  "data/content-intelligence/runtime-engine/adb16-calculation-engine-route-decision.json",
  "data/content-intelligence/runtime-engine/adb16-dry-run-scope-decision.json",
  "data/content-intelligence/runtime-engine/adb16-location-ayanamsha-decision.json",
  "data/content-intelligence/runtime-engine/adb16-runtime-storage-boundary-decision.json",
  "data/content-intelligence/backend-architecture/adb16-no-runtime-execution-audit.json",
  "data/content-intelligence/backend-architecture/adb16-no-public-activation-audit.json",
  "data/content-intelligence/quality-registry/adb16-adb17-engine-contract-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb16-to-adb17-engine-contract-boundary.json",
  "data/quality/adb16-runtime-calculation-decision-checkpoint.json",
  "data/quality/adb16-runtime-calculation-decision-checkpoint-preview.json",
  "docs/quality/ADB16_RUNTIME_CALCULATION_DECISION_CHECKPOINT.md",
  "scripts/generate-adb16-runtime-calculation-decision-checkpoint.mjs",
  "scripts/validate-adb16-runtime-calculation-decision-checkpoint.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb15Review = readJson("data/content-intelligence/quality-reviews/adb15-seed-insertion-result-capture.json");
const adb15RowCount = readJson("data/content-intelligence/seed-insertion/adb15-row-count-verification-result.json");
const adb15SeedStatus = readJson("data/content-intelligence/seed-insertion/adb15-seed-foundation-status-record.json");
const adb15NoRuntime = readJson("data/content-intelligence/backend-architecture/adb15-no-runtime-activation-audit.json");
const adb15Secret = readJson("data/content-intelligence/backend-architecture/adb15-secret-handling-audit.json");
const adb15NoDeployment = readJson("data/content-intelligence/backend-architecture/adb15-no-deployment-audit.json");
const adb15Readiness = readJson("data/content-intelligence/quality-registry/adb15-adb16-runtime-decision-readiness-record.json");
const adb15Boundary = readJson("data/content-intelligence/mutation-plans/adb15-to-adb16-runtime-decision-boundary.json");

if (adb15Review.status !== "seed_insertion_captured_ready_for_adb16_decision") fail("ADB15 review status mismatch.");
if (adb15RowCount.total_seed_rows_observed !== 45) fail("ADB15 total seed rows must be 45.");
if (adb15SeedStatus.status !== "basic_seed_foundation_available") fail("ADB15 seed foundation must be available.");
if (adb15NoRuntime.audit_passed !== true) fail("ADB15 no-runtime audit must pass.");
if (adb15Secret.service_role_key_exposed !== false) fail("ADB15 service-role key must not be exposed.");
if (adb15NoDeployment.deployment_performed !== false) fail("ADB15 deployment must remain false.");
if (adb15Readiness.ready_for_adb16 !== true) fail("ADB15 readiness must permit ADB16.");
if (adb15Boundary.next_stage_id !== "ADB16") fail("ADB15 boundary must point to ADB16.");

const review = readJson("data/content-intelligence/quality-reviews/adb16-runtime-calculation-decision-checkpoint.json");
const decisionRecord = readJson("data/content-intelligence/runtime-engine/adb16-runtime-calculation-decision-record.json");
const adb16ToAdb20Plan = readJson("data/content-intelligence/runtime-engine/adb16-adb17-to-adb20-runtime-foundation-plan.json");
const engineRouteDecision = readJson("data/content-intelligence/runtime-engine/adb16-calculation-engine-route-decision.json");
const dryRunScopeDecision = readJson("data/content-intelligence/runtime-engine/adb16-dry-run-scope-decision.json");
const locationAyanamshaDecision = readJson("data/content-intelligence/runtime-engine/adb16-location-ayanamsha-decision.json");
const storageBoundaryDecision = readJson("data/content-intelligence/runtime-engine/adb16-runtime-storage-boundary-decision.json");
const noRuntimeExecutionAudit = readJson("data/content-intelligence/backend-architecture/adb16-no-runtime-execution-audit.json");
const noPublicActivationAudit = readJson("data/content-intelligence/backend-architecture/adb16-no-public-activation-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb16-adb17-engine-contract-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb16-to-adb17-engine-contract-boundary.json");
const preview = readJson("data/quality/adb16-runtime-calculation-decision-checkpoint-preview.json");
const pkg = readJson("package.json");

if (review.status !== "runtime_engine_planning_decided_ready_for_adb17") fail("ADB16 review status mismatch.");

for (const key of [
  "adb16_runtime_decision_recorded",
  "adb15_consumed",
  "runtime_engine_planning_approved",
  "adb17_engine_contract_ready",
  "adb17_to_adb20_compact_path_recorded"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.total_seed_rows_available !== 45) fail("ADB16 must record 45 seed rows available.");
if (review.summary.hard_blocker_count_for_adb17 !== 0) fail("ADB17 blocker count must be zero.");

for (const key of [
  "runtime_calculation_execution_approved_now",
  "runtime_calculation_executed",
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

if (decisionRecord.status !== "runtime_engine_planning_approved_runtime_execution_deferred") fail("Decision record status mismatch.");
if (decisionRecord.decision.runtime_engine_planning_approved !== true) fail("Runtime engine planning must be approved.");
if (decisionRecord.decision.runtime_calculation_execution_approved_now !== false) fail("Runtime execution must remain deferred.");
if (decisionRecord.decision.public_runtime_activation_approved_now !== false) fail("Public runtime must remain blocked.");

if (adb16ToAdb20Plan.status !== "compact_runtime_foundation_path_recorded") fail("ADB17-ADB20 plan status mismatch.");
for (const stage of ["ADB17", "ADB18", "ADB19", "ADB20"]) {
  if (!JSON.stringify(adb16ToAdb20Plan.stages).includes(stage)) fail(`ADB16 plan missing ${stage}.`);
}

if (engineRouteDecision.selected_route !== "internal_calculation_engine_with_reviewed_ephemeris_and_ayanamsha_profiles") fail("Engine route mismatch.");
if (engineRouteDecision.runtime_execution_status !== "deferred_until_later_stage") fail("Runtime execution must be deferred.");

if (dryRunScopeDecision.approved_for_planning_only !== true) fail("Dry-run must be approved for planning only.");
if (dryRunScopeDecision.execution_status !== "not_executed_in_adb16") fail("Dry-run must not execute in ADB16.");

if (locationAyanamshaDecision.ayanamsha_strategy.hardcoded_final_ayanamsha !== false) fail("Ayanamsha must not be hardcoded final.");
if (locationAyanamshaDecision.ayanamsha_strategy.comparison_required_before_public_use !== true) fail("Ayanamsha comparison must be required.");

if (!storageBoundaryDecision.blocked_future_outputs_without_later_approval.includes("homepage Panchang card")) fail("Homepage Panchang output must remain blocked.");
if (storageBoundaryDecision.required_default_flags_for_future_runtime_rows.public_use_allowed !== false) fail("Future runtime rows must default public_use_allowed false.");

if (noRuntimeExecutionAudit.audit_passed !== true) fail("No-runtime execution audit must pass.");
if (noRuntimeExecutionAudit.failed_checks.length !== 0) fail("No-runtime execution failed checks must be zero.");

if (noPublicActivationAudit.audit_passed !== true) fail("No-public activation audit must pass.");
if (noPublicActivationAudit.failed_checks.length !== 0) fail("No-public activation failed checks must be zero.");

if (readiness.status !== "ready_for_adb17_engine_contract") fail("ADB17 readiness status mismatch.");
if (readiness.ready_for_adb17 !== true) fail("ADB17 readiness must be true.");
if (readiness.next_stage_id !== "ADB17") fail("Readiness must point to ADB17.");
if (!readiness.adb17_blocked_scope.includes("Runtime calculation execution")) fail("ADB17 must block runtime calculation.");
if (!readiness.adb17_blocked_scope.includes("AG47 resume before ADB20")) fail("ADB17 must block AG47 resume before ADB20.");

if (boundary.next_stage_id !== "ADB17") fail("Boundary must point to ADB17.");
if (!JSON.stringify(boundary.allowed_scope).includes("Define calculation-engine input/output contract")) fail("ADB17 engine contract scope missing.");

for (const key of [
  "adb16_runtime_decision_recorded",
  "adb15_consumed",
  "runtime_engine_planning_approved",
  "adb17_engine_contract_ready",
  "adb17_to_adb20_compact_path_recorded"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.total_seed_rows_available !== 45) fail("Preview seed rows must be 45.");
for (const key of [
  "runtime_calculation_execution_approved_now",
  "runtime_calculation_executed",
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

if (!pkg.scripts?.["generate:adb16"]) fail("Missing package script: generate:adb16");
if (!pkg.scripts?.["validate:adb16"]) fail("Missing package script: validate:adb16");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb16")) fail("validate:project must include validate:adb16.");

pass("ADB16 Runtime Calculation Decision Checkpoint is present.");
pass("ADB15 seed insertion result is consumed.");
pass("Runtime engine planning is approved while runtime execution remains deferred.");
pass("ADB17 to ADB20 compact runtime foundation path is recorded.");
pass("Calculation engine route decision is valid.");
pass("Dry-run scope decision is valid.");
pass("Location and ayanamsha decision is valid.");
pass("Runtime storage boundary decision is valid.");
pass("No runtime execution audit is valid.");
pass("No public activation audit is valid.");
pass("ADB17 Engine Contract readiness is valid.");
