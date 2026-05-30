import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG47 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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

  "data/content-intelligence/quality-reviews/ag47-governed-product-roadmap-return.json",
  "data/content-intelligence/ag-roadmap/ag47-governed-roadmap-return-record.json",
  "data/content-intelligence/ag-roadmap/ag47-adb-foundation-consumption-record.json",
  "data/content-intelligence/ag-roadmap/ag47-daily-surface-scope-map.json",
  "data/content-intelligence/ag-roadmap/ag47-ads-gap-carry-forward-map.json",
  "data/content-intelligence/ag-roadmap/ag47-ag48-to-ag53-product-sequence-plan.json",
  "data/content-intelligence/backend-architecture/ag47-no-runtime-no-backend-activation-guard.json",
  "data/content-intelligence/backend-architecture/ag47-no-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag47-no-public-content-generation-audit.json",
  "data/content-intelligence/quality-registry/ag47-ag48-panchang-festival-surface-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag47-to-ag48-panchang-festival-surface-boundary.json",
  "data/quality/ag47-governed-product-roadmap-return.json",
  "data/quality/ag47-governed-product-roadmap-return-preview.json",
  "docs/quality/AG47_GOVERNED_PRODUCT_ROADMAP_RETURN.md",
  "scripts/generate-ag47-governed-product-roadmap-return.mjs",
  "scripts/validate-ag47-governed-product-roadmap-return.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb20Review = readJson("data/content-intelligence/quality-reviews/adb20-runtime-foundation-closure-ag47-return-gate.json");
const adb20Ads = readJson("data/content-intelligence/runtime-engine/adb20-ads-coverage-reconciliation.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");
const adb20Gate = readJson("data/content-intelligence/runtime-engine/adb20-ag47-return-gate.json");
const adb20Ready = readJson("data/content-intelligence/quality-registry/adb20-ag47-return-readiness-record.json");
const adb20Boundary = readJson("data/content-intelligence/mutation-plans/adb20-to-ag47-return-boundary.json");

if (adb20Review.status !== "adb_runtime_foundation_closed_ready_for_ag47") fail("ADB20 review status mismatch.");
if (adb20Review.summary.ready_for_ag47 !== true) fail("ADB20 must be ready for AG47.");
if (adb20Review.summary.total_seed_rows_verified !== 45) fail("ADB20 must preserve 45 verified seed rows.");
if (adb20Ads.status !== "ads_coverage_reconciliation_completed") fail("ADS reconciliation must be completed.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website database reading must remain disabled.");
if (adb20Gate.ag47_return_allowed !== true) fail("AG47 return gate must be allowed.");
if (adb20Ready.ready_for_ag47 !== true) fail("ADB20 readiness must permit AG47.");
if (adb20Boundary.next_stage_id !== "AG47") fail("ADB20 boundary must point to AG47.");

const review = readJson("data/content-intelligence/quality-reviews/ag47-governed-product-roadmap-return.json");
const returnRecord = readJson("data/content-intelligence/ag-roadmap/ag47-governed-roadmap-return-record.json");
const adbFoundationConsumption = readJson("data/content-intelligence/ag-roadmap/ag47-adb-foundation-consumption-record.json");
const dailySurfaceScope = readJson("data/content-intelligence/ag-roadmap/ag47-daily-surface-scope-map.json");
const adsGapCarryForward = readJson("data/content-intelligence/ag-roadmap/ag47-ads-gap-carry-forward-map.json");
const productSequencePlan = readJson("data/content-intelligence/ag-roadmap/ag47-ag48-to-ag53-product-sequence-plan.json");
const nonActivationGuard = readJson("data/content-intelligence/backend-architecture/ag47-no-runtime-no-backend-activation-guard.json");
const noDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag47-no-deployment-audit.json");
const noPublicContentAudit = readJson("data/content-intelligence/backend-architecture/ag47-no-public-content-generation-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag47-ag48-panchang-festival-surface-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag47-to-ag48-panchang-festival-surface-boundary.json");
const preview = readJson("data/quality/ag47-governed-product-roadmap-return-preview.json");
const pkg = readJson("package.json");

if (review.status !== "governed_roadmap_return_ready_for_ag48") fail("AG47 review status mismatch.");

for (const key of [
  "ag47_governed_return_recorded",
  "adb20_consumed",
  "adb_foundation_preserved_as_source_of_truth",
  "ads_gaps_carried_forward",
  "daily_surface_sequence_recorded",
  "ready_for_ag48_panchang_festival_surface"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.total_seed_rows_verified_from_adb !== 45) fail("AG47 must preserve 45 ADB seed rows.");
if (review.summary.hard_blocker_count_for_ag48 !== 0) fail("AG48 blocker count must be zero.");

for (const key of [
  "runtime_calculation_execution_approved_now",
  "runtime_calculation_executed",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
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

if (returnRecord.status !== "governed_product_roadmap_return_recorded") fail("Return record status mismatch.");
if (!JSON.stringify(returnRecord.current_baseline_status).includes("45 rows")) fail("Return record must preserve 45 rows.");

if (adbFoundationConsumption.status !== "adb_foundation_consumed_without_redesign") fail("ADB consumption status mismatch.");
if (!JSON.stringify(adbFoundationConsumption.preserved_decisions).includes("Do not recreate seed planning")) fail("Anti-duplication decision missing.");

if (dailySurfaceScope.status !== "daily_surface_scope_map_recorded") fail("Daily surface scope status mismatch.");
for (const surface of ["SURFACE-PANCHANG-FESTIVAL", "SURFACE-VEDIC-GUIDANCE", "SURFACE-WORD-REFLECTION", "SURFACE-STAR-REFLECTION"]) {
  if (!JSON.stringify(dailySurfaceScope.product_surface_families).includes(surface)) fail(`Missing surface: ${surface}`);
}

if (adsGapCarryForward.status !== "ads_gap_carry_forward_recorded") fail("ADS gap carry-forward status mismatch.");
for (const adsId of ["ADS03", "ADS04", "ADS05", "ADS06", "ADS07", "API_RUNTIME"]) {
  if (!JSON.stringify(adsGapCarryForward.carried_forward_gaps).includes(adsId)) fail(`Missing carried-forward gap: ${adsId}`);
}

if (productSequencePlan.status !== "ag48_to_ag53_product_sequence_recorded") fail("Product sequence status mismatch.");
for (const stage of ["AG48", "AG49", "AG50", "AG51", "AG52", "AG53"]) {
  if (!JSON.stringify(productSequencePlan.planned_sequence).includes(stage)) fail(`Product sequence missing ${stage}`);
}

if (nonActivationGuard.status !== "no_runtime_no_backend_activation_guard_recorded") fail("Non-activation guard status mismatch.");
if (!JSON.stringify(nonActivationGuard.guardrails).includes("No website database-reading/API runtime")) fail("DB reading guard missing.");

if (noDeploymentAudit.audit_passed !== true) fail("No-deployment audit must pass.");
if (noDeploymentAudit.deployment_performed !== false) fail("Deployment must remain false.");

if (noPublicContentAudit.audit_passed !== true) fail("No-public-content audit must pass.");
if (noPublicContentAudit.public_content_generated !== false) fail("Public content generation must remain false.");

if (readiness.status !== "ready_for_ag48_panchang_festival_surface") fail("AG48 readiness status mismatch.");
if (readiness.ready_for_ag48 !== true) fail("AG48 readiness must be true.");
if (readiness.next_stage_id !== "AG48") fail("Readiness must point to AG48.");
if (!readiness.ag48_blocked_scope.includes("Website database-reading/API runtime activation.")) fail("AG48 must block website DB reading.");

if (boundary.next_stage_id !== "AG48") fail("Boundary must point to AG48.");

for (const key of [
  "ag47_governed_return_recorded",
  "adb20_consumed",
  "adb_foundation_preserved_as_source_of_truth",
  "ads_gaps_carried_forward",
  "daily_surface_sequence_recorded",
  "ready_for_ag48_panchang_festival_surface"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.total_seed_rows_verified_from_adb !== 45) fail("Preview must preserve 45 rows.");

for (const key of [
  "runtime_calculation_execution_approved_now",
  "runtime_calculation_executed",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
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

if (!pkg.scripts?.["generate:ag47"]) fail("Missing package script: generate:ag47");
if (!pkg.scripts?.["validate:ag47"]) fail("Missing package script: validate:ag47");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag47")) fail("validate:project must include validate:ag47.");

pass("AG47 Governed Product Roadmap Return is present.");
pass("ADB20 closure is consumed.");
pass("ADB foundation is preserved as source-of-truth.");
pass("Daily surface scope map is valid.");
pass("ADS gap carry-forward map is valid.");
pass("AG48 to AG53 product sequence is valid.");
pass("No runtime/backend activation guard is valid.");
pass("No deployment audit is valid.");
pass("No public content generation audit is valid.");
pass("AG48 Panchang/Festival Surface readiness is valid.");
