import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG47R validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag47-governed-product-roadmap-return.json",
  "data/content-intelligence/ag-roadmap/ag47-governed-roadmap-return-record.json",
  "data/content-intelligence/ag-roadmap/ag47-adb-foundation-consumption-record.json",
  "data/content-intelligence/ag-roadmap/ag47-daily-surface-scope-map.json",
  "data/content-intelligence/ag-roadmap/ag47-ag48-to-ag53-product-sequence-plan.json",
  "data/content-intelligence/quality-registry/ag47-ag48-panchang-festival-surface-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag47-to-ag48-panchang-festival-surface-boundary.json",
  "data/content-intelligence/quality-reviews/adb20-runtime-foundation-closure-ag47-return-gate.json",

  "data/content-intelligence/quality-reviews/ag47r-roadmap-alignment-before-ag47a.json",
  "data/content-intelligence/ag-roadmap/ag47r-roadmap-alignment-record.json",
  "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  "data/content-intelligence/ag-roadmap/ag47r-forward-pointer-correction-record.json",
  "data/content-intelligence/ag-roadmap/ag47r-ag47-to-ag56-governing-stage-plan.json",
  "data/content-intelligence/ag-roadmap/ag47r-ag47a-to-ag47z-substage-plan.json",
  "data/content-intelligence/ag-roadmap/ag47r-no-duplication-and-consumption-rule.json",
  "data/content-intelligence/backend-architecture/ag47r-no-runtime-no-db-no-deployment-guard.json",
  "data/content-intelligence/quality-registry/ag47r-ag47a-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag47r-to-ag47a-boundary.json",
  "data/quality/ag47r-roadmap-alignment-before-ag47a.json",
  "data/quality/ag47r-roadmap-alignment-before-ag47a-preview.json",
  "docs/quality/AG47R_ROADMAP_ALIGNMENT_BEFORE_AG47A.md",
  "scripts/generate-ag47r-roadmap-alignment-before-ag47a.mjs",
  "scripts/validate-ag47r-roadmap-alignment-before-ag47a.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag47Review = readJson("data/content-intelligence/quality-reviews/ag47-governed-product-roadmap-return.json");
const ag47Readiness = readJson("data/content-intelligence/quality-registry/ag47-ag48-panchang-festival-surface-readiness-record.json");
const ag47Boundary = readJson("data/content-intelligence/mutation-plans/ag47-to-ag48-panchang-festival-surface-boundary.json");
const adb20Review = readJson("data/content-intelligence/quality-reviews/adb20-runtime-foundation-closure-ag47-return-gate.json");

if (ag47Review.status !== "governed_roadmap_return_ready_for_ag48") fail("AG47 return-gate status mismatch.");
if (ag47Review.summary.adb20_consumed !== true) fail("AG47 must consume ADB20.");
if (ag47Readiness.next_stage_id !== "AG48") fail("AG47 old pointer must exist for supersession record.");
if (ag47Boundary.next_stage_id !== "AG48") fail("AG47 old boundary must exist for supersession record.");
if (adb20Review.status !== "adb_runtime_foundation_closed_ready_for_ag47") fail("ADB20 status mismatch.");

const review = readJson("data/content-intelligence/quality-reviews/ag47r-roadmap-alignment-before-ag47a.json");
const alignmentRecord = readJson("data/content-intelligence/ag-roadmap/ag47r-roadmap-alignment-record.json");
const sourceOfTruth = readJson("data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json");
const correctionRecord = readJson("data/content-intelligence/ag-roadmap/ag47r-forward-pointer-correction-record.json");
const fullStagePlan = readJson("data/content-intelligence/ag-roadmap/ag47r-ag47-to-ag56-governing-stage-plan.json");
const ag47SubstagePlan = readJson("data/content-intelligence/ag-roadmap/ag47r-ag47a-to-ag47z-substage-plan.json");
const noDuplicationRule = readJson("data/content-intelligence/ag-roadmap/ag47r-no-duplication-and-consumption-rule.json");
const noActivationGuard = readJson("data/content-intelligence/backend-architecture/ag47r-no-runtime-no-db-no-deployment-guard.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag47r-ag47a-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag47r-to-ag47a-boundary.json");
const preview = readJson("data/quality/ag47r-roadmap-alignment-before-ag47a-preview.json");
const pkg = readJson("package.json");

if (review.status !== "roadmap_aligned_ready_for_ag47a") fail("AG47R review status mismatch.");

for (const key of [
  "ag47r_alignment_recorded",
  "ag47_return_gate_preserved",
  "ag47_forward_pointer_corrected_by_supersession",
  "v01_stage_plan_preserved",
  "ag47a_ready"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.total_governing_stages !== 10) fail("Expected 10 governing stages AG47–AG56.");
if (review.summary.total_governing_substages < 50) fail("Expected full substage plan to be recorded.");
if (review.summary.hard_blocker_count_for_ag47a !== 0) fail("AG47A blocker count must be zero.");

for (const key of [
  "runtime_calculation_execution_approved_now",
  "runtime_calculation_executed",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_content_generated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (alignmentRecord.status !== "ag47_roadmap_alignment_recorded") fail("Alignment record status mismatch.");
if (alignmentRecord.correction.corrected_forward_pointer !== "AG47R -> AG47A Panchang Method and Location Basis Consumption") fail("Corrected forward pointer mismatch.");

if (sourceOfTruth.status !== "v01_implementation_roadmap_preserved") fail("Source of truth status mismatch.");
for (const stage of ["AG47", "AG48", "AG49", "AG50", "AG51", "AG52", "AG53", "AG54", "AG55", "AG56"]) {
  if (!JSON.stringify(sourceOfTruth.governing_stages).includes(stage)) fail(`Source of truth missing ${stage}.`);
}
if (!JSON.stringify(sourceOfTruth.governing_rule).includes("AG48 remains Word of the Day and Reflection")) fail("AG48 preservation rule missing.");
if (!JSON.stringify(sourceOfTruth.governing_rule).includes("AG56 remains controlled dynamic content loop test")) fail("AG56 preservation rule missing.");

if (correctionRecord.status !== "forward_pointer_corrected_by_supersession") fail("Correction record status mismatch.");
if (correctionRecord.no_git_history_rewrite !== true) fail("Correction must avoid git history rewrite.");

if (fullStagePlan.status !== "governing_stage_plan_recorded") fail("Full stage plan status mismatch.");
if (fullStagePlan.stages.length !== 10) fail("Full stage plan must contain AG47–AG56.");
const stageText = JSON.stringify(fullStagePlan.stages);
for (const label of [
  "Panchang, Festival and Vedic Guidance Implementation Readiness",
  "Word of the Day and Reflection Implementation Readiness",
  "User Accounts and Personalisation Readiness",
  "Psychometric and Assessment Product Governance Scaffold",
  "Analytics, Monitoring and Editorial Dashboard Planning",
  "Security, Privacy, Source, Legal and Compliance Hardening",
  "Performance, SEO, Accessibility and Mobile QA",
  "Backup, Rollback, Migration and Release Operations",
  "Version 01 Release Candidate Freeze",
  "Version 01 Controlled Dynamic Content Loop Test and Go-Live"
]) {
  if (!stageText.includes(label)) fail(`Stage label missing: ${label}`);
}

if (ag47SubstagePlan.next_actual_stage !== "AG47A") fail("AG47 substage plan must point to AG47A.");
for (const sub of ["AG47A", "AG47B", "AG47C", "AG47D", "AG47Z"]) {
  if (!JSON.stringify(ag47SubstagePlan.substages).includes(sub)) fail(`AG47 substage missing: ${sub}`);
}

if (noDuplicationRule.status !== "no_duplication_consumption_rule_recorded") fail("No-duplication rule status mismatch.");
if (!JSON.stringify(noDuplicationRule.rules).includes("Each substage must produce delta output only")) fail("Delta-only rule missing.");

if (noActivationGuard.audit_passed !== true) fail("No-activation guard must pass.");
if (noActivationGuard.failed_checks.length !== 0) fail("No-activation guard failed checks must be zero.");

if (readiness.status !== "ready_for_ag47a_panchang_method_location_basis") fail("AG47A readiness status mismatch.");
if (readiness.ready_for_ag47a !== true) fail("AG47A readiness must be true.");
if (readiness.next_stage_id !== "AG47A") fail("Readiness must point to AG47A.");
if (!readiness.ag47a_blocked_scope.includes("Runtime Panchang calculation execution")) fail("AG47A must block runtime Panchang calculation.");

if (boundary.next_stage_id !== "AG47A") fail("Boundary must point to AG47A.");

for (const key of [
  "ag47r_alignment_recorded",
  "ag47_return_gate_preserved",
  "ag47_forward_pointer_corrected_by_supersession",
  "v01_stage_plan_preserved",
  "ag47a_ready"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

if (preview.total_governing_stages !== 10) fail("Preview governing stage count must be 10.");
if (preview.total_governing_substages < 50) fail("Preview substage count too low.");

for (const key of [
  "runtime_calculation_execution_approved_now",
  "runtime_calculation_executed",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_content_generated"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag47r"]) fail("Missing package script: generate:ag47r");
if (!pkg.scripts?.["validate:ag47r"]) fail("Missing package script: validate:ag47r");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag47r")) fail("validate:project must include validate:ag47r.");

pass("AG47R Roadmap Alignment Before AG47A is present.");
pass("AG47 return gate is preserved without rewriting history.");
pass("Forward pointer is corrected by supersession to AG47A.");
pass("Full AG47–AG56 V01 implementation roadmap is preserved.");
pass("AG47A–AG47Z substage plan is valid.");
pass("No-duplication consumption rule is valid.");
pass("No runtime/database/backend/deployment activation guard is valid.");
pass("AG47A readiness is valid.");
