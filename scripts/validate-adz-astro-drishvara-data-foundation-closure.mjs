import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function read(p) {
  return fs.readFileSync(full(p), "utf8");
}

function readJson(p) {
  return JSON.parse(read(p));
}

function fail(message) {
  console.error(`❌ ADZ validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ad00-astro-drishvara-data-foundation-opening.json",
  "data/content-intelligence/quality-reviews/ad01-source-authenticity-regional-acceptance-doctrine.json",
  "data/content-intelligence/quality-reviews/ad02-panchanga-ontology-canonical-field-model.json",
  "data/content-intelligence/quality-reviews/ad03-regional-panchang-rule-profiles.json",
  "data/content-intelligence/quality-reviews/ad04-calendar-calculation-methodology.json",
  "data/content-intelligence/quality-reviews/ad05-word-sutra-reflection-corpus-schema.json",
  "data/content-intelligence/quality-reviews/ad06-vedic-guidance-star-reflection-rule-model.json",
  "data/content-intelligence/quality-reviews/ad07-database-schema-planning.json",
  "data/content-intelligence/quality-reviews/ad08-seed-data-source-attribution-register.json",
  "data/content-intelligence/quality-reviews/ad09-kala-drishti-methodology-statement.json",
  "data/content-intelligence/quality-reviews/ad10-safety-non-claim-cultural-integrity-audit.json",
  "data/content-intelligence/quality-registry/ad10-adz-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad10-to-adz-astro-drishvara-foundation-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ad10-no-mutation-audit-register.json",
  "data/content-intelligence/backend-architecture/ad10-no-runtime-no-public-activation-audit.json",

  "data/content-intelligence/quality-reviews/adz-astro-drishvara-data-foundation-closure.json",
  "data/content-intelligence/closure-records/adz-astro-drishvara-data-foundation-closure.json",
  "data/content-intelligence/ad-foundation/adz-source-of-truth-chain.json",
  "data/content-intelligence/ad-foundation/adz-foundation-scope-register.json",
  "data/content-intelligence/quality-registry/adz-adb01-database-build-approval-readiness-record.json",
  "data/content-intelligence/quality-registry/adz-carry-forward-register.json",
  "data/content-intelligence/backend-architecture/adz-no-duplicate-closure-audit-register.json",
  "data/content-intelligence/backend-architecture/adz-no-mutation-audit-register.json",
  "data/content-intelligence/mutation-plans/adz-to-adb01-database-build-approval-boundary.json",
  "data/quality/adz-astro-drishvara-data-foundation-closure.json",
  "data/quality/adz-astro-drishvara-data-foundation-closure-preview.json",
  "docs/quality/ADZ_ASTRO_DRISHVARA_DATA_FOUNDATION_CLOSURE.md",
  "scripts/generate-adz-astro-drishvara-data-foundation-closure.mjs",
  "scripts/validate-adz-astro-drishvara-data-foundation-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const expectedStatuses = {
  AD00: "astro_drishvara_data_foundation_opened_ready_for_ad01",
  AD01: "source_authenticity_regional_acceptance_doctrine_ready_for_ad02",
  AD02: "panchanga_ontology_canonical_field_model_ready_for_ad03",
  AD03: "regional_panchang_rule_profiles_ready_for_ad04",
  AD04: "calendar_calculation_methodology_ready_for_ad05",
  AD05: "word_sutra_reflection_corpus_schema_ready_for_ad06",
  AD06: "vedic_guidance_star_reflection_rule_model_ready_for_ad07",
  AD07: "database_schema_planning_ready_for_ad08",
  AD08: "seed_data_source_attribution_register_ready_for_ad09",
  AD09: "kala_drishti_methodology_statement_ready_for_ad10",
  AD10: "safety_non_claim_cultural_integrity_audit_ready_for_adz"
};

const reviewPaths = {
  AD00: "data/content-intelligence/quality-reviews/ad00-astro-drishvara-data-foundation-opening.json",
  AD01: "data/content-intelligence/quality-reviews/ad01-source-authenticity-regional-acceptance-doctrine.json",
  AD02: "data/content-intelligence/quality-reviews/ad02-panchanga-ontology-canonical-field-model.json",
  AD03: "data/content-intelligence/quality-reviews/ad03-regional-panchang-rule-profiles.json",
  AD04: "data/content-intelligence/quality-reviews/ad04-calendar-calculation-methodology.json",
  AD05: "data/content-intelligence/quality-reviews/ad05-word-sutra-reflection-corpus-schema.json",
  AD06: "data/content-intelligence/quality-reviews/ad06-vedic-guidance-star-reflection-rule-model.json",
  AD07: "data/content-intelligence/quality-reviews/ad07-database-schema-planning.json",
  AD08: "data/content-intelligence/quality-reviews/ad08-seed-data-source-attribution-register.json",
  AD09: "data/content-intelligence/quality-reviews/ad09-kala-drishti-methodology-statement.json",
  AD10: "data/content-intelligence/quality-reviews/ad10-safety-non-claim-cultural-integrity-audit.json"
};

for (const [stage, expectedStatus] of Object.entries(expectedStatuses)) {
  const review = readJson(reviewPaths[stage]);
  if (review.status !== expectedStatus) fail(`${stage} status mismatch.`);
}

const ad10Readiness = readJson("data/content-intelligence/quality-registry/ad10-adz-closure-readiness-record.json");
const ad10Boundary = readJson("data/content-intelligence/mutation-plans/ad10-to-adz-astro-drishvara-foundation-closure-boundary.json");
const ad10NoMutationAudit = readJson("data/content-intelligence/backend-architecture/ad10-no-mutation-audit-register.json");
const ad10NoRuntimeAudit = readJson("data/content-intelligence/backend-architecture/ad10-no-runtime-no-public-activation-audit.json");

if (ad10Readiness.ready_for_adz !== true) fail("AD10 readiness must permit ADZ.");
if (ad10Readiness.next_stage_id !== "ADZ") fail("AD10 readiness next stage must be ADZ.");
if (ad10Readiness.hard_blocker_count_for_adz !== 0) fail("ADZ hard blocker count from AD10 must be zero.");
if (ad10Boundary.next_stage_id !== "ADZ") fail("AD10 boundary must point to ADZ.");
if (!JSON.stringify(ad10Boundary.allowed_scope).includes("ADB01 database build approval checkpoint")) fail("AD10 boundary must include ADB01.");
if (ad10NoMutationAudit.audit_passed !== true) fail("AD10 no-mutation audit must pass.");
if (ad10NoRuntimeAudit.audit_passed !== true) fail("AD10 no-runtime audit must pass.");

const review = readJson("data/content-intelligence/quality-reviews/adz-astro-drishvara-data-foundation-closure.json");
const closureRecord = readJson("data/content-intelligence/closure-records/adz-astro-drishvara-data-foundation-closure.json");
const sourceOfTruthChain = readJson("data/content-intelligence/ad-foundation/adz-source-of-truth-chain.json");
const foundationScopeRegister = readJson("data/content-intelligence/ad-foundation/adz-foundation-scope-register.json");
const databaseBuildCheckpointReadiness = readJson("data/content-intelligence/quality-registry/adz-adb01-database-build-approval-readiness-record.json");
const carryForwardRegister = readJson("data/content-intelligence/quality-registry/adz-carry-forward-register.json");
const noDuplicateClosureAudit = readJson("data/content-intelligence/backend-architecture/adz-no-duplicate-closure-audit-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/adz-no-mutation-audit-register.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adz-to-adb01-database-build-approval-boundary.json");
const preview = readJson("data/quality/adz-astro-drishvara-data-foundation-closure-preview.json");
const pkg = readJson("package.json");

if (review.status !== "astro_drishvara_data_foundation_closed_ready_for_adb01") fail("ADZ review status mismatch.");
if (closureRecord.status !== "astro_drishvara_data_foundation_closed_ready_for_adb01") fail("ADZ closure record status mismatch.");
if (closureRecord.next_stage_id !== "ADB01") fail("Closure next stage must be ADB01.");

for (const key of [
  "adz_foundation_closure_recorded",
  "ad00_to_ad10_chain_closed",
  "source_of_truth_chain_recorded",
  "foundation_scope_register_recorded",
  "adb01_database_build_approval_readiness_recorded",
  "carry_forward_register_recorded",
  "no_duplicate_closure_audit_recorded",
  "ready_for_adb01"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_adb01 !== 0) fail("ADB01 hard blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "public_content_generated", "guidance_generated", "panchang_prediction_generated", "panchang_calculation_executed", "seed_data_inserted", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (sourceOfTruthChain.status !== "source_of_truth_chain_recorded") fail("Source-of-truth chain status mismatch.");
for (const stage of Object.keys(expectedStatuses)) {
  if (!JSON.stringify(sourceOfTruthChain.closed_chain).includes(stage)) fail(`Source-of-truth chain missing ${stage}.`);
}

if (foundationScopeRegister.status !== "foundation_scope_register_recorded") fail("Foundation scope status mismatch.");
for (const item of ["actual database build", "SQL migration drafting", "Supabase table creation", "AG47 resume"]) {
  if (!foundationScopeRegister.still_not_done.includes(item)) fail(`Still-not-done item missing: ${item}`);
}

if (databaseBuildCheckpointReadiness.status !== "ready_for_adb01_database_build_approval_checkpoint") fail("ADB01 readiness status mismatch.");
if (databaseBuildCheckpointReadiness.ready_for_adb01 !== true) fail("ADB01 readiness must be true.");
if (databaseBuildCheckpointReadiness.next_stage_id !== "ADB01") fail("ADB01 next stage mismatch.");
if (databaseBuildCheckpointReadiness.sql_creation_allowed_next !== false) fail("SQL creation must remain blocked.");
if (databaseBuildCheckpointReadiness.sql_execution_allowed_next !== false) fail("SQL execution must remain blocked.");
if (databaseBuildCheckpointReadiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (databaseBuildCheckpointReadiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (carryForwardRegister.status !== "adz_carry_forward_register_recorded") fail("Carry-forward register status mismatch.");
for (const item of ["non_prediction_boundary", "source_attribution_and_supported_claim", "regional_profile_handling", "no_runtime_no_sql_until_approval", "existing_supabase_schema_preservation", "service_role_key_safety"]) {
  if (!JSON.stringify(carryForwardRegister.carry_forward_items).includes(item)) fail(`Carry-forward item missing: ${item}`);
}

if (noDuplicateClosureAudit.status !== "no_duplicate_adz_closure_audit_passed") fail("No duplicate closure status mismatch.");
if (noDuplicateClosureAudit.audit_passed !== true) fail("No duplicate closure audit must pass.");
if (noDuplicateClosureAudit.duplicate_closure_found !== false) fail("Duplicate closure must be false.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_adz") fail("No-mutation status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (boundary.next_stage_id !== "ADB01") fail("Boundary must point to ADB01.");
if (!JSON.stringify(boundary.allowed_scope).includes("Open database build approval checkpoint")) fail("ADB01 opening scope missing.");
for (const blocked of ["SQL creation", "SQL execution", "database write", "service-role key exposure"]) {
  if (!boundary.blocked_scope_until_explicit_approval.includes(blocked)) fail(`Blocked scope missing: ${blocked}`);
}

for (const key of [
  "adz_foundation_closure_recorded",
  "ad00_to_ad10_chain_closed",
  "source_of_truth_chain_recorded",
  "foundation_scope_register_recorded",
  "adb01_database_build_approval_readiness_recorded",
  "carry_forward_register_recorded",
  "no_duplicate_closure_audit_recorded",
  "ready_for_adb01"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_adb01 !== 0) fail("Preview ADB01 hard blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "public_content_generated", "guidance_generated", "panchang_prediction_generated", "panchang_calculation_executed", "seed_data_inserted", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adz"]) fail("Missing package script: generate:adz");
if (!pkg.scripts?.["validate:adz"]) fail("Missing package script: validate:adz");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adz")) fail("validate:project must include validate:adz.");

pass("ADZ Astro-Drishvara Data Foundation Closure is present.");
pass("AD00 through AD10 chain is closed.");
pass("Source-of-truth chain is valid.");
pass("Foundation scope register is valid.");
pass("ADB01 Database Build Approval Checkpoint readiness is valid.");
pass("Carry-forward register is valid.");
pass("No duplicate closure audit is valid.");
pass("No-mutation audit is valid.");
pass("ADZ to ADB01 boundary is valid.");
pass("No SQL, DB write, Supabase table creation, backend activation, deployment or service-role exposure is recorded.");
