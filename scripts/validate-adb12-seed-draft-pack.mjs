import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ ADB12 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb11-seed-source-planning-boundary.json",
  "data/content-intelligence/seed-planning/adb11-seed-pack-catalogue.json",
  "data/content-intelligence/backend-architecture/adb11-no-seed-insert-audit.json",
  "data/content-intelligence/backend-architecture/adb11-no-runtime-activation-audit.json",
  "data/content-intelligence/quality-registry/adb11-adb12-seed-draft-pack-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb11-to-adb12-seed-draft-pack-boundary.json",

  "data/content-intelligence/quality-reviews/adb12-seed-draft-pack-generation.json",
  "data/content-intelligence/seed-drafts/adb12-seed-draft-pack-manifest.json",
  "data/content-intelligence/seed-drafts/adb12-sp01-source-authority-draft-pack.json",
  "data/content-intelligence/seed-drafts/adb12-sp02-panchanga-master-draft-pack.json",
  "data/content-intelligence/seed-drafts/adb12-sp03-calculation-profile-draft-pack.json",
  "data/content-intelligence/seed-drafts/adb12-sp04-location-profile-draft-pack.json",
  "data/content-intelligence/seed-drafts/adb12-sp05-festival-vrat-observance-draft-pack.json",
  "data/content-intelligence/seed-drafts/adb12-sp06-word-sutra-mantra-reflection-draft-pack.json",
  "data/content-intelligence/seed-drafts/adb12-sp07-validation-learning-draft-pack.json",
  "data/content-intelligence/backend-architecture/adb12-draft-only-no-insert-audit.json",
  "data/content-intelligence/seed-planning/adb12-source-review-gate.json",
  "data/content-intelligence/backend-architecture/adb12-no-runtime-activation-audit.json",
  "data/content-intelligence/quality-registry/adb12-adb13-seed-draft-validation-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb12-to-adb13-seed-draft-validation-boundary.json",
  "data/quality/adb12-seed-draft-pack-generation.json",
  "data/quality/adb12-seed-draft-pack-generation-preview.json",
  "docs/quality/ADB12_SEED_DRAFT_PACK_GENERATION.md",
  "scripts/generate-adb12-seed-draft-pack.mjs",
  "scripts/validate-adb12-seed-draft-pack.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb11Review = readJson("data/content-intelligence/quality-reviews/adb11-seed-source-planning-boundary.json");
const adb11Catalogue = readJson("data/content-intelligence/seed-planning/adb11-seed-pack-catalogue.json");
const adb11NoSeed = readJson("data/content-intelligence/backend-architecture/adb11-no-seed-insert-audit.json");
const adb11NoRuntime = readJson("data/content-intelligence/backend-architecture/adb11-no-runtime-activation-audit.json");
const adb11Readiness = readJson("data/content-intelligence/quality-registry/adb11-adb12-seed-draft-pack-readiness-record.json");
const adb11Boundary = readJson("data/content-intelligence/mutation-plans/adb11-to-adb12-seed-draft-pack-boundary.json");

if (adb11Review.status !== "seed_source_planning_ready_for_adb12") fail("ADB11 review status mismatch.");
if (adb11Review.summary.ready_for_adb12_seed_draft_pack !== true) fail("ADB11 readiness summary missing.");
if (adb11Catalogue.total_seed_packs_planned !== 7) fail("ADB11 catalogue must plan 7 packs.");
if (adb11NoSeed.audit_passed !== true) fail("ADB11 no-seed audit must pass.");
if (adb11NoRuntime.audit_passed !== true) fail("ADB11 no-runtime audit must pass.");
if (adb11Readiness.ready_for_adb12 !== true) fail("ADB11 readiness must permit ADB12.");
if (adb11Boundary.next_stage_id !== "ADB12") fail("ADB11 boundary must point to ADB12.");

const review = readJson("data/content-intelligence/quality-reviews/adb12-seed-draft-pack-generation.json");
const manifest = readJson("data/content-intelligence/seed-drafts/adb12-seed-draft-pack-manifest.json");
const sp01 = readJson("data/content-intelligence/seed-drafts/adb12-sp01-source-authority-draft-pack.json");
const sp02 = readJson("data/content-intelligence/seed-drafts/adb12-sp02-panchanga-master-draft-pack.json");
const sp03 = readJson("data/content-intelligence/seed-drafts/adb12-sp03-calculation-profile-draft-pack.json");
const sp04 = readJson("data/content-intelligence/seed-drafts/adb12-sp04-location-profile-draft-pack.json");
const sp05 = readJson("data/content-intelligence/seed-drafts/adb12-sp05-festival-vrat-observance-draft-pack.json");
const sp06 = readJson("data/content-intelligence/seed-drafts/adb12-sp06-word-sutra-mantra-reflection-draft-pack.json");
const sp07 = readJson("data/content-intelligence/seed-drafts/adb12-sp07-validation-learning-draft-pack.json");
const draftOnlyAudit = readJson("data/content-intelligence/backend-architecture/adb12-draft-only-no-insert-audit.json");
const sourceReviewGate = readJson("data/content-intelligence/seed-planning/adb12-source-review-gate.json");
const noRuntimeAudit = readJson("data/content-intelligence/backend-architecture/adb12-no-runtime-activation-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb12-adb13-seed-draft-validation-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb12-to-adb13-seed-draft-validation-boundary.json");
const preview = readJson("data/quality/adb12-seed-draft-pack-generation-preview.json");
const pkg = readJson("package.json");

if (review.status !== "seed_draft_pack_generated_ready_for_adb13") fail("ADB12 review status mismatch.");
for (const key of [
  "adb12_seed_draft_pack_generated",
  "adb11_consumed",
  "seven_seed_draft_packs_generated",
  "draft_seed_json_files_generated",
  "source_review_gate_recorded",
  "ready_for_adb13_seed_draft_validation"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.total_draft_packs_generated !== 7) fail("ADB12 must generate 7 packs.");
if (review.summary.hard_blocker_count_for_adb13 !== 0) fail("ADB13 blocker count must be zero.");
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

if (manifest.total_draft_packs_generated !== 7) fail("Manifest must list 7 draft packs.");
if (manifest.generation_type !== "json_draft_only") fail("Manifest generation type must be json_draft_only.");
if (manifest.insert_sql_generated !== false) fail("Manifest must not generate INSERT SQL.");
if (manifest.copy_command_generated !== false) fail("Manifest must not generate COPY command.");
if (manifest.seed_data_inserted !== false) fail("Manifest must not insert seed data.");

for (const pack of [sp01, sp02, sp03, sp04, sp05, sp06, sp07]) {
  if (pack.status !== "draft_only_not_inserted") fail(`${pack.pack_id} must be draft_only_not_inserted.`);
  if (pack.insertion_status !== "not_approved") fail(`${pack.pack_id} insertion must be not approved.`);
  if (pack.draft_only !== true) fail(`${pack.pack_id} must be draft-only.`);
}

if (!JSON.stringify(sp01.records.source_authorities).includes("SRC-CLASSICAL-PANCHANGA-BASIS")) fail("SP01 missing classical Panchanga source authority.");
if (!JSON.stringify(sp01.records.source_authorities).includes("SRC-NITYANAND-MISHRA-STYLE-DISCIPLINE")) fail("SP01 missing Nityanand Mishra discipline context.");
if (!JSON.stringify(sp02.records.panchang_element_master).includes("EL-TITHI")) fail("SP02 missing Tithi master element.");
if (!JSON.stringify(sp03.records.panchanga_formula_rules).includes("tithi_from_moon_sun_angular_separation")) fail("SP03 missing Tithi formula rule.");
if (sp03.runtime_execution_status !== "disabled") fail("SP03 runtime execution must be disabled.");
if (sp04.event_window_generation_status !== "not_generated") fail("SP04 event windows must not be generated.");
if (!JSON.stringify(sp05.records.regional_calendar_profiles).includes("REG-EAST-BIHAR-MITHILA-DRAFT")) fail("SP05 missing Bihar/Mithila regional profile.");
if (!JSON.stringify(sp06.records.claim_risk_register).includes("NO_DETERMINISTIC_PREDICTION")) fail("SP06 missing non-deterministic claim risk.");
if (!JSON.stringify(sp07.records.methodology_activation_audits).includes("runtime_enabled")) fail("SP07 missing runtime activation audit record.");

if (draftOnlyAudit.audit_passed !== true) fail("Draft-only audit must pass.");
if (draftOnlyAudit.failed_checks.length !== 0) fail("Draft-only audit failed checks must be zero.");

if (sourceReviewGate.insertion_allowed_after_this_stage !== false) fail("Source review gate must not allow insertion.");
if (!JSON.stringify(sourceReviewGate.review_requirements_before_insert).includes("public_use_allowed remains false")) fail("Source review gate must preserve public_use_allowed false.");

if (noRuntimeAudit.audit_passed !== true) fail("No runtime audit must pass.");
if (noRuntimeAudit.failed_checks.length !== 0) fail("No runtime failed checks must be zero.");

if (readiness.status !== "ready_for_adb13_seed_draft_validation") fail("Readiness status mismatch.");
if (readiness.ready_for_adb13 !== true) fail("ADB13 readiness must be true.");
if (readiness.next_stage_id !== "ADB13") fail("Readiness must point to ADB13.");
if (!readiness.adb13_blocked_scope.includes("Seed insertion")) fail("ADB13 must keep seed insertion blocked.");

if (boundary.next_stage_id !== "ADB13") fail("Boundary must point to ADB13.");
if (!JSON.stringify(boundary.allowed_scope).includes("Validate draft seed pack structure")) fail("ADB13 validation scope missing.");

if (preview.total_draft_packs_generated !== 7) fail("Preview total draft packs must be 7.");
for (const key of [
  "adb12_seed_draft_pack_generated",
  "adb11_consumed",
  "seven_seed_draft_packs_generated",
  "draft_seed_json_files_generated",
  "source_review_gate_recorded",
  "ready_for_adb13_seed_draft_validation"
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

if (!pkg.scripts?.["generate:adb12"]) fail("Missing package script: generate:adb12");
if (!pkg.scripts?.["validate:adb12"]) fail("Missing package script: validate:adb12");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb12")) fail("validate:project must include validate:adb12.");

pass("ADB12 Seed Draft Pack Generation is present.");
pass("ADB11 seed source planning is consumed.");
pass("Seven seed draft JSON packs are generated.");
pass("Source authority draft pack is valid.");
pass("Panchanga master draft pack is valid.");
pass("Calculation profile draft pack is valid.");
pass("Location profile draft pack is valid.");
pass("Festival/Vrat draft pack is valid.");
pass("Word/Sutra/Mantra draft pack is valid.");
pass("Validation learning draft pack is valid.");
pass("Draft-only no-insert audit is valid.");
pass("Source review gate is valid.");
pass("No runtime activation audit is valid.");
pass("ADB13 Seed Draft Validation readiness is valid.");
