import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ ADB13 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb12-seed-draft-pack-generation.json",
  "data/content-intelligence/seed-drafts/adb12-seed-draft-pack-manifest.json",
  "data/content-intelligence/backend-architecture/adb12-draft-only-no-insert-audit.json",
  "data/content-intelligence/quality-registry/adb12-adb13-seed-draft-validation-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb12-to-adb13-seed-draft-validation-boundary.json",

  "data/content-intelligence/quality-reviews/adb13-seed-draft-validation-integrity-review.json",
  "data/content-intelligence/seed-planning/adb13-seed-draft-structure-validation.json",
  "data/content-intelligence/seed-planning/adb13-source-dependency-validation.json",
  "data/content-intelligence/seed-planning/adb13-public-use-safety-validation.json",
  "data/content-intelligence/seed-planning/adb13-no-insert-copy-validation.json",
  "data/content-intelligence/seed-planning/adb13-sanskrit-mantra-review-validation.json",
  "data/content-intelligence/seed-planning/adb13-regional-variation-validation.json",
  "data/content-intelligence/backend-architecture/adb13-no-database-write-audit.json",
  "data/content-intelligence/backend-architecture/adb13-no-runtime-activation-audit.json",
  "data/content-intelligence/quality-registry/adb13-adb14-seed-insertion-approval-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb13-to-adb14-seed-insertion-approval-boundary.json",
  "data/quality/adb13-seed-draft-validation-integrity-review.json",
  "data/quality/adb13-seed-draft-validation-integrity-review-preview.json",
  "docs/quality/ADB13_SEED_DRAFT_VALIDATION_INTEGRITY_REVIEW.md",
  "scripts/generate-adb13-seed-draft-validation.mjs",
  "scripts/validate-adb13-seed-draft-validation.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb12Review = readJson("data/content-intelligence/quality-reviews/adb12-seed-draft-pack-generation.json");
const adb12Manifest = readJson("data/content-intelligence/seed-drafts/adb12-seed-draft-pack-manifest.json");
const adb12DraftOnlyAudit = readJson("data/content-intelligence/backend-architecture/adb12-draft-only-no-insert-audit.json");
const adb12Readiness = readJson("data/content-intelligence/quality-registry/adb12-adb13-seed-draft-validation-readiness-record.json");
const adb12Boundary = readJson("data/content-intelligence/mutation-plans/adb12-to-adb13-seed-draft-validation-boundary.json");

if (adb12Review.status !== "seed_draft_pack_generated_ready_for_adb13") fail("ADB12 review status mismatch.");
if (adb12Review.summary.ready_for_adb13_seed_draft_validation !== true) fail("ADB12 readiness summary missing.");
if (adb12Manifest.total_draft_packs_generated !== 7) fail("ADB12 manifest must contain 7 packs.");
if (adb12Manifest.insert_sql_generated !== false) fail("ADB12 must not generate INSERT SQL.");
if (adb12Manifest.copy_command_generated !== false) fail("ADB12 must not generate COPY.");
if (adb12Manifest.seed_data_inserted !== false) fail("ADB12 must not insert seed data.");
if (adb12DraftOnlyAudit.audit_passed !== true) fail("ADB12 draft-only audit must pass.");
if (adb12Readiness.ready_for_adb13 !== true) fail("ADB12 readiness must permit ADB13.");
if (adb12Boundary.next_stage_id !== "ADB13") fail("ADB12 boundary must point to ADB13.");

const review = readJson("data/content-intelligence/quality-reviews/adb13-seed-draft-validation-integrity-review.json");
const structureValidation = readJson("data/content-intelligence/seed-planning/adb13-seed-draft-structure-validation.json");
const sourceDependencyValidation = readJson("data/content-intelligence/seed-planning/adb13-source-dependency-validation.json");
const publicUseSafetyValidation = readJson("data/content-intelligence/seed-planning/adb13-public-use-safety-validation.json");
const noInsertCopyValidation = readJson("data/content-intelligence/seed-planning/adb13-no-insert-copy-validation.json");
const sanskritMantraValidation = readJson("data/content-intelligence/seed-planning/adb13-sanskrit-mantra-review-validation.json");
const regionalVariationValidation = readJson("data/content-intelligence/seed-planning/adb13-regional-variation-validation.json");
const noDatabaseWriteAudit = readJson("data/content-intelligence/backend-architecture/adb13-no-database-write-audit.json");
const noRuntimeActivationAudit = readJson("data/content-intelligence/backend-architecture/adb13-no-runtime-activation-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb13-adb14-seed-insertion-approval-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb13-to-adb14-seed-insertion-approval-boundary.json");
const preview = readJson("data/quality/adb13-seed-draft-validation-integrity-review-preview.json");
const pkg = readJson("package.json");

if (review.status !== "seed_draft_validation_ready_for_adb14") fail("ADB13 review status mismatch.");

for (const key of [
  "adb13_seed_draft_validation_recorded",
  "adb12_consumed",
  "seed_draft_structure_validation_passed",
  "source_dependency_validation_passed",
  "public_use_safety_validation_passed",
  "no_insert_copy_validation_passed",
  "sanskrit_mantra_review_validation_passed",
  "regional_variation_validation_passed",
  "seven_seed_draft_packs_validated",
  "ready_for_adb14_seed_insertion_approval_checkpoint"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.total_draft_packs_validated !== 7) fail("ADB13 must validate 7 packs.");
if (review.summary.hard_blocker_count_for_adb14 !== 0) fail("ADB14 blocker count must be zero.");
if (review.summary.public_use_true_records !== 0) fail("Public-use true records must be zero.");
if (review.summary.insert_copy_hit_count !== 0) fail("INSERT/COPY hit count must be zero.");

for (const key of [
  "insert_sql_generated",
  "copy_command_generated",
  "seed_insert_approved",
  "seed_data_inserted",
  "database_write_performed",
  "runtime_calculation_approved",
  "runtime_calculation_executed",
  "backend_auth_supabase_activation_approved",
  "deployment_approved",
  "service_role_key_exposed"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (structureValidation.status !== "seed_draft_structure_validation_passed") fail("Structure validation status mismatch.");
if (structureValidation.total_draft_packs_validated !== 7) fail("Structure validation must cover 7 packs.");
if (structureValidation.missing_pack_ids.length !== 0) fail("Missing pack ids must be zero.");
if (structureValidation.invalid_draft_status_packs.length !== 0) fail("Invalid draft statuses must be zero.");

if (sourceDependencyValidation.status !== "source_dependency_validation_passed") fail("Source dependency status mismatch.");
if (!sourceDependencyValidation.source_authorities_detected.includes("SRC-CLASSICAL-PANCHANGA-BASIS")) fail("Classical Panchanga source authority missing.");
if (!sourceDependencyValidation.source_authorities_detected.includes("SRC-NITYANAND-MISHRA-STYLE-DISCIPLINE")) fail("Nityanand Mishra discipline source context missing.");

if (publicUseSafetyValidation.status !== "public_use_safety_validation_passed") fail("Public-use validation status mismatch.");
if (publicUseSafetyValidation.public_use_true_records !== 0) fail("Public-use true records must be zero.");
if (publicUseSafetyValidation.public_use_allowed_default_false_confirmed !== true) fail("Public-use default false must be confirmed.");

if (noInsertCopyValidation.status !== "no_insert_copy_validation_passed") fail("No INSERT/COPY status mismatch.");
if (noInsertCopyValidation.insert_copy_hits.length !== 0) fail("No INSERT/COPY validation must have zero hits.");
if (noInsertCopyValidation.seed_data_inserted !== false) fail("Seed data inserted must be false.");

if (sanskritMantraValidation.status !== "sanskrit_mantra_review_validation_passed") fail("Sanskrit/mantra validation status mismatch.");
for (const check of sanskritMantraValidation.checks) {
  if (check.passed !== true) fail(`Sanskrit/mantra check failed: ${check.check_id}`);
}

if (regionalVariationValidation.status !== "regional_variation_validation_passed") fail("Regional variation status mismatch.");
if (regionalVariationValidation.validation_result !== "passed") fail("Regional variation validation must pass.");
if (regionalVariationValidation.regional_difference_preserved !== true) fail("Regional difference must be preserved.");

if (noDatabaseWriteAudit.audit_passed !== true) fail("No database write audit must pass.");
if (noDatabaseWriteAudit.failed_checks.length !== 0) fail("No database write failed checks must be zero.");

if (noRuntimeActivationAudit.audit_passed !== true) fail("No runtime activation audit must pass.");
if (noRuntimeActivationAudit.failed_checks.length !== 0) fail("No runtime activation failed checks must be zero.");

if (readiness.status !== "ready_for_adb14_seed_insertion_approval_checkpoint") fail("ADB14 readiness status mismatch.");
if (readiness.ready_for_adb14 !== true) fail("ADB14 readiness must be true.");
if (readiness.next_stage_id !== "ADB14") fail("Readiness must point to ADB14.");
if (!readiness.adb14_blocked_scope_by_default.includes("Actual seed insertion")) fail("ADB14 must block actual seed insertion by default.");
if (!readiness.adb14_blocked_scope_by_default.includes("Runtime calculation execution")) fail("ADB14 must block runtime calculation by default.");

if (boundary.next_stage_id !== "ADB14") fail("Boundary must point to ADB14.");
if (!JSON.stringify(boundary.allowed_scope).includes("Open seed insertion approval checkpoint")) fail("ADB14 approval checkpoint scope missing.");

if (preview.total_draft_packs_validated !== 7) fail("Preview total draft packs must be 7.");
if (preview.public_use_true_records !== 0) fail("Preview public-use true records must be zero.");
if (preview.insert_copy_hit_count !== 0) fail("Preview INSERT/COPY hit count must be zero.");

for (const key of [
  "adb13_seed_draft_validation_recorded",
  "adb12_consumed",
  "seed_draft_structure_validation_passed",
  "source_dependency_validation_passed",
  "public_use_safety_validation_passed",
  "no_insert_copy_validation_passed",
  "sanskrit_mantra_review_validation_passed",
  "regional_variation_validation_passed",
  "seven_seed_draft_packs_validated",
  "ready_for_adb14_seed_insertion_approval_checkpoint"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "insert_sql_generated",
  "copy_command_generated",
  "seed_insert_approved",
  "seed_data_inserted",
  "database_write_performed",
  "runtime_calculation_approved",
  "runtime_calculation_executed",
  "backend_auth_supabase_activation_approved",
  "deployment_approved",
  "service_role_key_exposed"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb13"]) fail("Missing package script: generate:adb13");
if (!pkg.scripts?.["validate:adb13"]) fail("Missing package script: validate:adb13");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb13")) fail("validate:project must include validate:adb13.");

pass("ADB13 Seed Draft Validation and Integrity Review is present.");
pass("ADB12 seed draft packs are consumed.");
pass("Seven seed draft packs are structurally valid.");
pass("Source dependency validation is valid.");
pass("Public-use safety validation is valid.");
pass("No INSERT/COPY validation is valid.");
pass("Sanskrit/mantra review validation is valid.");
pass("Regional variation validation is valid.");
pass("No database write audit is valid.");
pass("No runtime activation audit is valid.");
pass("ADB14 Seed Insertion Approval Checkpoint readiness is valid.");
