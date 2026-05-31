import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG47Z validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  "data/content-intelligence/ag-roadmap/ag47r-ag47a-to-ag47z-substage-plan.json",

  "data/content-intelligence/quality-reviews/ag47a-panchang-method-location-basis-consumption.json",
  "data/content-intelligence/cultural-modules/ag47a-panchang-method-consumption-record.json",
  "data/content-intelligence/cultural-modules/ag47a-panchang-runtime-boundary-record.json",

  "data/content-intelligence/quality-reviews/ag47b-festival-observance-registry-integration.json",
  "data/content-intelligence/cultural-modules/ag47b-observance-registry-consumption-record.json",
  "data/content-intelligence/cultural-modules/ag47b-observance-safety-boundary-record.json",

  "data/content-intelligence/quality-reviews/ag47c-vedic-guidance-sanskrit-integrity-safety.json",
  "data/content-intelligence/cultural-modules/ag47c-sanskrit-mantra-integrity-gate.json",
  "data/content-intelligence/cultural-modules/ag47c-non-deterministic-guidance-boundary-record.json",

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

  "data/content-intelligence/runtime-engine/adb20-ads-coverage-reconciliation.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag47z-panchang-festival-vedic-closure.json",
  "data/content-intelligence/cultural-modules/ag47z-panchang-festival-vedic-closure-record.json",
  "data/content-intelligence/cultural-modules/ag47z-ag47a-to-ag47d-consumption-summary.json",
  "data/content-intelligence/cultural-modules/ag47z-carry-forward-deferral-register.json",
  "data/content-intelligence/cultural-modules/ag47z-public-surface-closure-position.json",
  "data/content-intelligence/ag-roadmap/ag47z-ag48a-word-bank-rotation-handoff.json",
  "data/content-intelligence/backend-architecture/ag47z-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag47z-no-public-generated-cultural-output-audit.json",
  "data/content-intelligence/backend-architecture/ag47z-no-secret-exposure-audit.json",
  "data/content-intelligence/quality-registry/ag47z-ag48a-word-bank-rotation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag47z-to-ag48a-word-bank-rotation-boundary.json",
  "data/quality/ag47z-panchang-festival-vedic-closure.json",
  "data/quality/ag47z-panchang-festival-vedic-closure-preview.json",
  "docs/quality/AG47Z_PANCHANG_FESTIVAL_VEDIC_CLOSURE.md",
  "scripts/generate-ag47z-panchang-festival-vedic-closure.mjs",
  "scripts/validate-ag47z-panchang-festival-vedic-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag47rSourceOfTruth = readJson("data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG48 remains Word of the Day and Reflection")) fail("AG48 source-of-truth rule missing.");

const ag47aRuntime = readJson("data/content-intelligence/cultural-modules/ag47a-panchang-runtime-boundary-record.json");
const ag47bObservance = readJson("data/content-intelligence/cultural-modules/ag47b-observance-registry-consumption-record.json");
const ag47cMantraGate = readJson("data/content-intelligence/cultural-modules/ag47c-sanskrit-mantra-integrity-gate.json");
const ag47dReview = readJson("data/content-intelligence/quality-reviews/ag47d-cultural-module-integration-audit.json");
const ag47dGapRegister = readJson("data/content-intelligence/cultural-modules/ag47d-ag47z-closure-gap-register.json");
const ag47dReadiness = readJson("data/content-intelligence/quality-registry/ag47d-ag47z-cultural-module-closure-readiness-record.json");
const ag47dBoundary = readJson("data/content-intelligence/mutation-plans/ag47d-to-ag47z-cultural-module-closure-boundary.json");

if (ag47aRuntime.boundary.runtime_calculation_enabled !== false) fail("AG47A runtime calculation must remain disabled.");
if (ag47bObservance.registry_boundary.use_as_automated_observance_decision_engine !== false) fail("AG47B automated observance engine must remain disabled.");
if (ag47cMantraGate.public_use_default !== false) fail("AG47C mantra public-use default must remain false.");
if (ag47dReview.status !== "cultural_module_integration_audit_ready_for_ag47z") fail("AG47D review status mismatch.");
if (ag47dGapRegister.ag47z_closure_allowed !== true) fail("AG47Z closure must be allowed.");
if (ag47dGapRegister.blocking_gaps_for_ag47z.length !== 0) fail("AG47Z blocking gaps must be zero.");
if (ag47dReadiness.ready_for_ag47z !== true) fail("AG47D readiness must permit AG47Z.");
if (ag47dBoundary.next_stage_id !== "AG47Z") fail("AG47D boundary must point to AG47Z.");

const review = readJson("data/content-intelligence/quality-reviews/ag47z-panchang-festival-vedic-closure.json");
const closureRecord = readJson("data/content-intelligence/cultural-modules/ag47z-panchang-festival-vedic-closure-record.json");
const consumptionSummary = readJson("data/content-intelligence/cultural-modules/ag47z-ag47a-to-ag47d-consumption-summary.json");
const carryForwardDeferralRegister = readJson("data/content-intelligence/cultural-modules/ag47z-carry-forward-deferral-register.json");
const publicSurfaceClosure = readJson("data/content-intelligence/cultural-modules/ag47z-public-surface-closure-position.json");
const ag48aHandoff = readJson("data/content-intelligence/ag-roadmap/ag47z-ag48a-word-bank-rotation-handoff.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag47z-no-runtime-api-deployment-audit.json");
const noPublicGeneratedOutputAudit = readJson("data/content-intelligence/backend-architecture/ag47z-no-public-generated-cultural-output-audit.json");
const noSecretExposureAudit = readJson("data/content-intelligence/backend-architecture/ag47z-no-secret-exposure-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag47z-ag48a-word-bank-rotation-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag47z-to-ag48a-word-bank-rotation-boundary.json");
const preview = readJson("data/quality/ag47z-panchang-festival-vedic-closure-preview.json");
const pkg = readJson("package.json");

if (review.status !== "panchang_festival_vedic_closed_ready_for_ag48a") fail("AG47Z review status mismatch.");

for (const key of [
  "ag47z_panchang_festival_vedic_closed",
  "ag47a_ag47b_ag47c_ag47d_consumed",
  "cultural_module_closure_completed",
  "ag48a_word_bank_rotation_handoff_created",
  "ready_for_ag48a_word_bank_rotation_consumption"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag48a !== 0) fail("AG48A blocker count must be zero.");

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

if (closureRecord.status !== "panchang_festival_vedic_closure_completed") fail("Closure record status mismatch.");
if (closureRecord.closure_allowed !== true) fail("Closure must be allowed.");

for (const stage of ["AG47A", "AG47B", "AG47C", "AG47D"]) {
  if (!JSON.stringify(consumptionSummary.consumed_outputs).includes(stage)) fail(`Consumption summary missing ${stage}.`);
}

if (!carryForwardDeferralRegister.deferred_items.includes("Runtime Panchang calculation execution")) fail("Runtime Panchang calculation must be deferred.");
if (!carryForwardDeferralRegister.deferred_items.includes("Website database/API runtime reading")) fail("Website DB/API runtime reading must be deferred.");
if (!carryForwardDeferralRegister.deferred_items.includes("Deployment")) fail("Deployment must be deferred.");

if (!publicSurfaceClosure.blocked_for_v01_without_later_approval.includes("live Panchang calculation card")) fail("Live Panchang card must be blocked.");
if (!publicSurfaceClosure.blocked_for_v01_without_later_approval.includes("database/API runtime-driven cultural module")) fail("DB/API cultural runtime must be blocked.");

if (ag48aHandoff.status !== "ag48a_word_bank_rotation_handoff_created") fail("AG48A handoff status mismatch.");
if (ag48aHandoff.next_stage_id !== "AG48A") fail("AG48A handoff must point to AG48A.");
if (!JSON.stringify(ag48aHandoff.handoff_basis).includes("AG48 remains Word of the Day and Reflection")) fail("AG48 source-of-truth handoff missing.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (noPublicGeneratedOutputAudit.audit_passed !== true) fail("No public generated output audit must pass.");
if (noPublicGeneratedOutputAudit.failed_checks.length !== 0) fail("No public generated output failed checks must be zero.");

if (noSecretExposureAudit.audit_passed !== true) fail("No-secret exposure audit must pass.");
if (noSecretExposureAudit.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");

if (readiness.status !== "ready_for_ag48a_word_bank_rotation_consumption") fail("AG48A readiness status mismatch.");
if (readiness.ready_for_ag48a !== true) fail("AG48A readiness must be true.");
if (readiness.next_stage_id !== "AG48A") fail("Readiness must point to AG48A.");
if (!readiness.ag48a_allowed_scope.includes("Consume D02 word-of-day bank.")) fail("AG48A must consume D02 word-of-day bank.");

if (boundary.next_stage_id !== "AG48A") fail("Boundary must point to AG48A.");

for (const key of [
  "ag47z_panchang_festival_vedic_closed",
  "ag47a_ag47b_ag47c_ag47d_consumed",
  "cultural_module_closure_completed",
  "ag48a_word_bank_rotation_handoff_created",
  "ready_for_ag48a_word_bank_rotation_consumption"
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

if (!pkg.scripts?.["generate:ag47z"]) fail("Missing package script: generate:ag47z");
if (!pkg.scripts?.["validate:ag47z"]) fail("Missing package script: validate:ag47z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag47z")) fail("validate:project must include validate:ag47z.");

pass("AG47Z Panchang/Festival/Vedic Closure is present.");
pass("AG47A–AG47D outputs are consumed.");
pass("Cultural module closure record is valid.");
pass("Carry-forward deferral register is valid.");
pass("Public surface closure position is valid.");
pass("AG48A Word Bank and Rotation handoff is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("No public generated cultural output audit is valid.");
pass("No secret exposure audit is valid.");
pass("AG48A readiness is valid.");
