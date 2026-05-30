import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ ADB11 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb10-live-schema-execution-result-capture.json",
  "data/content-intelligence/database-build/adb10-critical-table-verification-result.json",
  "data/content-intelligence/backend-architecture/adb10-no-seed-no-runtime-audit.json",
  "data/content-intelligence/quality-registry/adb10-adb11-seed-source-planning-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb10-to-adb11-seed-source-planning-boundary.json",

  "data/content-intelligence/quality-reviews/adb11-seed-source-planning-boundary.json",
  "data/content-intelligence/seed-planning/adb11-seed-source-planning-doctrine.json",
  "data/content-intelligence/seed-planning/adb11-seed-pack-catalogue.json",
  "data/content-intelligence/seed-planning/adb11-source-authority-seed-plan.json",
  "data/content-intelligence/seed-planning/adb11-panchanga-master-seed-plan.json",
  "data/content-intelligence/seed-planning/adb11-calculation-profile-seed-plan.json",
  "data/content-intelligence/seed-planning/adb11-location-profile-seed-plan.json",
  "data/content-intelligence/seed-planning/adb11-festival-vrat-seed-plan.json",
  "data/content-intelligence/seed-planning/adb11-word-sutra-mantra-seed-plan.json",
  "data/content-intelligence/seed-planning/adb11-seed-validation-review-workflow.json",
  "data/content-intelligence/backend-architecture/adb11-seed-loading-boundary.json",
  "data/content-intelligence/backend-architecture/adb11-no-seed-insert-audit.json",
  "data/content-intelligence/backend-architecture/adb11-no-runtime-activation-audit.json",
  "data/content-intelligence/quality-registry/adb11-adb12-seed-draft-pack-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb11-to-adb12-seed-draft-pack-boundary.json",
  "data/quality/adb11-seed-source-planning-boundary.json",
  "data/quality/adb11-seed-source-planning-boundary-preview.json",
  "docs/quality/ADB11_SEED_SOURCE_PLANNING_BOUNDARY.md",
  "scripts/generate-adb11-seed-source-planning-boundary.mjs",
  "scripts/validate-adb11-seed-source-planning-boundary.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb10Review = readJson("data/content-intelligence/quality-reviews/adb10-live-schema-execution-result-capture.json");
const adb10TableVerification = readJson("data/content-intelligence/database-build/adb10-critical-table-verification-result.json");
const adb10NoSeedNoRuntime = readJson("data/content-intelligence/backend-architecture/adb10-no-seed-no-runtime-audit.json");
const adb10Readiness = readJson("data/content-intelligence/quality-registry/adb10-adb11-seed-source-planning-readiness-record.json");
const adb10Boundary = readJson("data/content-intelligence/mutation-plans/adb10-to-adb11-seed-source-planning-boundary.json");

if (adb10Review.status !== "live_schema_execution_captured_ready_for_adb11") fail("ADB10 review status mismatch.");
if (adb10Review.summary.ready_for_adb11_seed_source_planning !== true) fail("ADB10 readiness summary missing.");
if (adb10TableVerification.matched_table_count !== 17) fail("ADB10 table verification must be 17.");
if (adb10NoSeedNoRuntime.audit_passed !== true) fail("ADB10 no seed/no runtime audit must pass.");
if (adb10Readiness.ready_for_adb11 !== true) fail("ADB10 readiness must permit ADB11.");
if (adb10Boundary.next_stage_id !== "ADB11") fail("ADB10 boundary must point to ADB11.");

const review = readJson("data/content-intelligence/quality-reviews/adb11-seed-source-planning-boundary.json");
const seedSourcePlanningDoctrine = readJson("data/content-intelligence/seed-planning/adb11-seed-source-planning-doctrine.json");
const seedPackCatalogue = readJson("data/content-intelligence/seed-planning/adb11-seed-pack-catalogue.json");
const sourceAuthoritySeedPlan = readJson("data/content-intelligence/seed-planning/adb11-source-authority-seed-plan.json");
const panchangaMasterSeedPlan = readJson("data/content-intelligence/seed-planning/adb11-panchanga-master-seed-plan.json");
const calculationProfileSeedPlan = readJson("data/content-intelligence/seed-planning/adb11-calculation-profile-seed-plan.json");
const locationProfileSeedPlan = readJson("data/content-intelligence/seed-planning/adb11-location-profile-seed-plan.json");
const festivalVratSeedPlan = readJson("data/content-intelligence/seed-planning/adb11-festival-vrat-seed-plan.json");
const wordSutraMantraSeedPlan = readJson("data/content-intelligence/seed-planning/adb11-word-sutra-mantra-seed-plan.json");
const validationReviewWorkflow = readJson("data/content-intelligence/seed-planning/adb11-seed-validation-review-workflow.json");
const loadingBoundary = readJson("data/content-intelligence/backend-architecture/adb11-seed-loading-boundary.json");
const noSeedInsertAudit = readJson("data/content-intelligence/backend-architecture/adb11-no-seed-insert-audit.json");
const noRuntimeActivationAudit = readJson("data/content-intelligence/backend-architecture/adb11-no-runtime-activation-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb11-adb12-seed-draft-pack-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb11-to-adb12-seed-draft-pack-boundary.json");
const preview = readJson("data/quality/adb11-seed-source-planning-boundary-preview.json");
const pkg = readJson("package.json");

if (review.status !== "seed_source_planning_ready_for_adb12") fail("ADB11 review status mismatch.");
for (const key of [
  "adb11_seed_source_planning_recorded",
  "adb10_consumed",
  "seed_pack_catalogue_recorded",
  "source_authority_seed_plan_recorded",
  "panchanga_master_seed_plan_recorded",
  "calculation_profile_seed_plan_recorded",
  "location_profile_seed_plan_recorded",
  "festival_vrat_seed_plan_recorded",
  "word_sutra_mantra_seed_plan_recorded",
  "validation_review_workflow_recorded",
  "seed_loading_boundary_recorded",
  "ready_for_adb12_seed_draft_pack"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.seed_pack_count !== 7) fail("Seed pack count must be 7.");
if (review.summary.hard_blocker_count_for_adb12 !== 0) fail("ADB12 blocker count must be zero.");
for (const key of [
  "seed_insert_approved",
  "seed_data_inserted",
  "insert_sql_generated",
  "copy_command_generated",
  "runtime_calculation_approved",
  "runtime_calculation_executed",
  "backend_auth_supabase_activation_approved",
  "deployment_approved",
  "service_role_key_exposed"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (seedSourcePlanningDoctrine.status !== "seed_source_planning_doctrine_recorded") fail("Seed doctrine status mismatch.");
if (!JSON.stringify(seedSourcePlanningDoctrine.doctrine).includes("No seed row may be inserted")) fail("Seed doctrine must block insertion.");

if (seedPackCatalogue.total_seed_packs_planned !== 7) fail("Seed pack catalogue must have 7 packs.");
for (const pack of ["ADB12-SP01", "ADB12-SP02", "ADB12-SP03", "ADB12-SP04", "ADB12-SP05", "ADB12-SP06", "ADB12-SP07"]) {
  if (!JSON.stringify(seedPackCatalogue.seed_packs).includes(pack)) fail(`Seed pack missing: ${pack}`);
}

if (sourceAuthoritySeedPlan.insertion_status !== "not_approved") fail("Source authority seed insertion must not be approved.");
if (!sourceAuthoritySeedPlan.required_fields_before_insert.includes("source_id")) fail("Source authority seed plan missing source_id.");

if (panchangaMasterSeedPlan.insertion_status !== "not_approved") fail("Panchanga master seed insertion must not be approved.");
if (!panchangaMasterSeedPlan.target_tables.includes("tithi_master")) fail("Panchanga master plan missing tithi_master.");

if (calculationProfileSeedPlan.runtime_execution_status !== "disabled") fail("Calculation profile runtime must be disabled.");
if (calculationProfileSeedPlan.insertion_status !== "not_approved") fail("Calculation profile insertion must not be approved.");

if (locationProfileSeedPlan.event_window_generation_status !== "not_generated") fail("Event windows must not be generated.");
if (locationProfileSeedPlan.insertion_status !== "not_approved") fail("Location profile insertion must not be approved.");

if (festivalVratSeedPlan.insertion_status !== "not_approved") fail("Festival/vrat insertion must not be approved.");
if (!festivalVratSeedPlan.target_tables.includes("festival_observance_rule_registry")) fail("Festival/vrat plan missing observance registry.");

if (wordSutraMantraSeedPlan.insertion_status !== "not_approved") fail("Word/sutra/mantra insertion must not be approved.");
if (!wordSutraMantraSeedPlan.target_tables.includes("mantra_source_review_registry")) fail("Word/sutra/mantra plan missing mantra registry.");

if (!JSON.stringify(validationReviewWorkflow.approval_gates).includes("ADB14 seed insertion approval checkpoint")) fail("Validation workflow missing insertion approval checkpoint.");

if (loadingBoundary.status !== "seed_loading_boundary_recorded") fail("Loading boundary status mismatch.");
for (const blocked of ["INSERT SQL generation", "COPY command generation", "Seed data insertion", "Runtime Panchanga calculation"]) {
  if (!loadingBoundary.blocked_now.includes(blocked)) fail(`Loading boundary missing blocked item: ${blocked}`);
}

if (noSeedInsertAudit.audit_passed !== true) fail("No seed insert audit must pass.");
if (noSeedInsertAudit.failed_checks.length !== 0) fail("No seed insert failed checks must be zero.");

if (noRuntimeActivationAudit.audit_passed !== true) fail("No runtime activation audit must pass.");
if (noRuntimeActivationAudit.failed_checks.length !== 0) fail("No runtime activation failed checks must be zero.");

if (readiness.status !== "ready_for_adb12_seed_draft_pack_generation") fail("Readiness status mismatch.");
if (readiness.ready_for_adb12 !== true) fail("ADB12 readiness must be true.");
if (readiness.next_stage_id !== "ADB12") fail("Readiness must point to ADB12.");
if (!readiness.adb12_blocked_scope.includes("Seed insertion")) fail("ADB12 must keep seed insertion blocked.");
if (!readiness.adb12_blocked_scope.includes("Runtime calculation execution")) fail("ADB12 must keep runtime calculation blocked.");

if (boundary.next_stage_id !== "ADB12") fail("Boundary must point to ADB12.");
if (!JSON.stringify(boundary.allowed_scope).includes("Generate draft seed data files only")) fail("ADB12 draft-only seed scope missing.");

for (const key of [
  "adb11_seed_source_planning_recorded",
  "adb10_consumed",
  "seed_pack_catalogue_recorded",
  "source_authority_seed_plan_recorded",
  "panchanga_master_seed_plan_recorded",
  "calculation_profile_seed_plan_recorded",
  "location_profile_seed_plan_recorded",
  "festival_vrat_seed_plan_recorded",
  "word_sutra_mantra_seed_plan_recorded",
  "validation_review_workflow_recorded",
  "seed_loading_boundary_recorded",
  "ready_for_adb12_seed_draft_pack"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.seed_pack_count !== 7) fail("Preview seed pack count must be 7.");
for (const key of [
  "seed_insert_approved",
  "seed_data_inserted",
  "insert_sql_generated",
  "copy_command_generated",
  "runtime_calculation_approved",
  "runtime_calculation_executed",
  "backend_auth_supabase_activation_approved",
  "deployment_approved",
  "service_role_key_exposed"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb11"]) fail("Missing package script: generate:adb11");
if (!pkg.scripts?.["validate:adb11"]) fail("Missing package script: validate:adb11");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb11")) fail("validate:project must include validate:adb11.");

pass("ADB11 Seed Data Source Planning and Loading Boundary is present.");
pass("ADB10 live schema result is consumed.");
pass("Seed pack catalogue with 7 draft-pack families is valid.");
pass("Source authority seed plan is valid.");
pass("Panchanga master seed plan is valid.");
pass("Calculation profile seed plan is valid.");
pass("Location profile seed plan is valid.");
pass("Festival/Vrat seed plan is valid.");
pass("Word/Sutra/Mantra seed plan is valid.");
pass("Seed validation workflow is valid.");
pass("Seed loading boundary blocks insertion.");
pass("No seed insert audit is valid.");
pass("No runtime activation audit is valid.");
pass("ADB12 Seed Draft Pack readiness is valid.");
