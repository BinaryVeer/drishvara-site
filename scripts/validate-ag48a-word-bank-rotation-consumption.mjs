import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG48A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag47z-panchang-festival-vedic-closure.json",
  "data/content-intelligence/ag-roadmap/ag47z-ag48a-word-bank-rotation-handoff.json",
  "data/content-intelligence/quality-registry/ag47z-ag48a-word-bank-rotation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag47z-to-ag48a-word-bank-rotation-boundary.json",
  "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  "data/content-intelligence/runtime-engine/adb20-ads-coverage-reconciliation.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag48a-word-bank-rotation-consumption.json",
  "data/content-intelligence/word-reflection/ag48a-word-bank-consumption-record.json",
  "data/content-intelligence/word-reflection/ag48a-rotation-policy-consumption-record.json",
  "data/content-intelligence/word-reflection/ag48a-word-approval-status-boundary.json",
  "data/content-intelligence/word-reflection/ag48a-repeat-control-boundary.json",
  "data/content-intelligence/word-reflection/ag48a-reflection-readiness-seed-record.json",
  "data/content-intelligence/backend-architecture/ag48a-no-personalisation-auth-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag48a-no-runtime-api-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag48a-no-public-word-generation-audit.json",
  "data/content-intelligence/quality-registry/ag48a-ag48b-multilingual-language-safety-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag48a-to-ag48b-multilingual-language-safety-boundary.json",
  "data/quality/ag48a-word-bank-rotation-consumption.json",
  "data/quality/ag48a-word-bank-rotation-consumption-preview.json",
  "docs/quality/AG48A_WORD_BANK_ROTATION_CONSUMPTION.md",
  "scripts/generate-ag48a-word-bank-rotation-consumption.mjs",
  "scripts/validate-ag48a-word-bank-rotation-consumption.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag47zReview = readJson("data/content-intelligence/quality-reviews/ag47z-panchang-festival-vedic-closure.json");
const ag47zHandoff = readJson("data/content-intelligence/ag-roadmap/ag47z-ag48a-word-bank-rotation-handoff.json");
const ag47zReadiness = readJson("data/content-intelligence/quality-registry/ag47z-ag48a-word-bank-rotation-readiness-record.json");
const ag47zBoundary = readJson("data/content-intelligence/mutation-plans/ag47z-to-ag48a-word-bank-rotation-boundary.json");
const ag47rSourceOfTruth = readJson("data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag47zReview.status !== "panchang_festival_vedic_closed_ready_for_ag48a") fail("AG47Z review status mismatch.");
if (ag47zHandoff.next_stage_id !== "AG48A") fail("AG47Z handoff must point to AG48A.");
if (ag47zReadiness.ready_for_ag48a !== true) fail("AG47Z readiness must permit AG48A.");
if (ag47zBoundary.next_stage_id !== "AG48A") fail("AG47Z boundary must point to AG48A.");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG48 remains Word of the Day and Reflection")) fail("AG48 roadmap preservation missing.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag48a-word-bank-rotation-consumption.json");
const wordBankConsumption = readJson("data/content-intelligence/word-reflection/ag48a-word-bank-consumption-record.json");
const rotationPolicyConsumption = readJson("data/content-intelligence/word-reflection/ag48a-rotation-policy-consumption-record.json");
const approvalStatusBoundary = readJson("data/content-intelligence/word-reflection/ag48a-word-approval-status-boundary.json");
const repeatControlBoundary = readJson("data/content-intelligence/word-reflection/ag48a-repeat-control-boundary.json");
const reflectionReadinessSeed = readJson("data/content-intelligence/word-reflection/ag48a-reflection-readiness-seed-record.json");
const noPersonalisationAuthAudit = readJson("data/content-intelligence/backend-architecture/ag48a-no-personalisation-auth-activation-audit.json");
const noRuntimeApiDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag48a-no-runtime-api-deployment-audit.json");
const noPublicGenerationAudit = readJson("data/content-intelligence/backend-architecture/ag48a-no-public-word-generation-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag48a-ag48b-multilingual-language-safety-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag48a-to-ag48b-multilingual-language-safety-boundary.json");
const preview = readJson("data/quality/ag48a-word-bank-rotation-consumption-preview.json");
const pkg = readJson("package.json");

if (review.status !== "word_bank_rotation_consumed_ready_for_ag48b") fail("AG48A review status mismatch.");

for (const key of [
  "ag48a_word_bank_rotation_consumed",
  "ag47z_consumed",
  "d02_word_bank_consumed",
  "word_of_day_preflight_consumed",
  "rotation_policy_consumed",
  "approval_status_boundary_recorded",
  "repeat_control_boundary_recorded",
  "reflection_readiness_seed_recorded",
  "ready_for_ag48b_multilingual_language_safety"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag48b !== 0) fail("AG48B blocker count must be zero.");

for (const key of [
  "word_publication_approved_now",
  "word_publication_executed",
  "public_word_generated_now",
  "unreviewed_sanskrit_mantra_publication_allowed",
  "personalisation_auth_activation_approved",
  "personalisation_auth_activation_performed",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_generated_word_output",
  "public_content_generated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (wordBankConsumption.status !== "word_bank_consumption_recorded") fail("Word bank consumption status mismatch.");
if (wordBankConsumption.consumption_boundary.use_as_public_generation_engine !== false) fail("Word bank must not be public generation engine.");
if (wordBankConsumption.consumption_boundary.editorial_review_required_before_public_use !== true) fail("Editorial review before public use must be required.");

if (rotationPolicyConsumption.status !== "rotation_policy_consumption_recorded") fail("Rotation policy status mismatch.");
if (rotationPolicyConsumption.rotation_boundary.live_rotation_enabled_now !== false) fail("Live rotation must remain disabled.");
if (rotationPolicyConsumption.rotation_boundary.approved_items_only_required !== true) fail("Approved-items-only rule must be required.");

if (approvalStatusBoundary.status !== "word_approval_status_boundary_recorded") fail("Approval boundary status mismatch.");
if (approvalStatusBoundary.default_public_use_allowed !== false) fail("Default public use must be false.");
if (!JSON.stringify(approvalStatusBoundary.approval_rules).includes("Only approved/reviewed words")) fail("Approved/reviewed words rule missing.");

if (repeatControlBoundary.status !== "repeat_control_boundary_recorded") fail("Repeat-control boundary status mismatch.");
if (repeatControlBoundary.live_repeat_control_execution_now !== false) fail("Live repeat-control execution must be false.");

if (reflectionReadinessSeed.status !== "reflection_readiness_seed_recorded") fail("Reflection readiness status mismatch.");
if (reflectionReadinessSeed.reflection_position.user_personalised_reflection_disabled_now !== true) fail("User personalised reflection must be disabled.");
if (reflectionReadinessSeed.reflection_position.public_generated_reflection_disabled_now !== true) fail("Public generated reflection must be disabled.");

if (noPersonalisationAuthAudit.audit_passed !== true) fail("No personalisation/Auth audit must pass.");
if (noPersonalisationAuthAudit.failed_checks.length !== 0) fail("No personalisation/Auth failed checks must be zero.");

if (noRuntimeApiDeploymentAudit.audit_passed !== true) fail("No runtime/API/deployment audit must pass.");
if (noRuntimeApiDeploymentAudit.failed_checks.length !== 0) fail("No runtime/API/deployment failed checks must be zero.");

if (noPublicGenerationAudit.audit_passed !== true) fail("No public word generation audit must pass.");
if (noPublicGenerationAudit.failed_checks.length !== 0) fail("No public generation failed checks must be zero.");

if (readiness.status !== "ready_for_ag48b_multilingual_language_safety") fail("AG48B readiness status mismatch.");
if (readiness.ready_for_ag48b !== true) fail("AG48B readiness must be true.");
if (readiness.next_stage_id !== "AG48B") fail("Readiness must point to AG48B.");
if (!readiness.ag48b_allowed_scope.includes("Check Sanskrit/Hindi/English meanings.")) fail("AG48B must check Sanskrit/Hindi/English meanings.");

if (boundary.next_stage_id !== "AG48B") fail("Boundary must point to AG48B.");

for (const key of [
  "ag48a_word_bank_rotation_consumed",
  "ag47z_consumed",
  "d02_word_bank_consumed",
  "word_of_day_preflight_consumed",
  "rotation_policy_consumed",
  "approval_status_boundary_recorded",
  "repeat_control_boundary_recorded",
  "reflection_readiness_seed_recorded",
  "ready_for_ag48b_multilingual_language_safety"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "word_publication_approved_now",
  "word_publication_executed",
  "public_word_generated_now",
  "unreviewed_sanskrit_mantra_publication_allowed",
  "personalisation_auth_activation_approved",
  "personalisation_auth_activation_performed",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_generated_word_output",
  "public_content_generated"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag48a"]) fail("Missing package script: generate:ag48a");
if (!pkg.scripts?.["validate:ag48a"]) fail("Missing package script: validate:ag48a");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag48a")) fail("validate:project must include validate:ag48a.");

pass("AG48A Word Bank and Rotation Consumption is present.");
pass("AG47Z handoff and AG48 source-of-truth are consumed.");
pass("Word bank consumption is valid.");
pass("Rotation policy consumption is valid.");
pass("Approval status boundary is valid.");
pass("Repeat control boundary is valid.");
pass("Reflection readiness seed is valid.");
pass("No personalisation/Auth activation audit is valid.");
pass("No runtime/API/deployment audit is valid.");
pass("No public word generation audit is valid.");
pass("AG48B multilingual language safety readiness is valid.");
