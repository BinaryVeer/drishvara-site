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
  console.error(`❌ AD09 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ad08-seed-data-source-attribution-register.json",
  "data/content-intelligence/backend-architecture/ad08-no-seed-no-fetch-audit.json",
  "data/content-intelligence/backend-architecture/ad08-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad08-ad09-kala-drishti-methodology-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad08-to-ad09-kala-drishti-methodology-boundary.json",

  "data/content-intelligence/quality-reviews/ad09-kala-drishti-methodology-statement.json",
  "data/content-intelligence/ad-foundation/ad09-internal-kala-drishti-methodology-statement.json",
  "data/content-intelligence/ad-foundation/ad09-public-kala-drishti-methodology-statement.json",
  "data/content-intelligence/ad-foundation/ad09-methodology-layer-map.json",
  "data/content-intelligence/ad-foundation/ad09-source-regional-positioning-statement.json",
  "data/content-intelligence/ad-foundation/ad09-non-prediction-boundary-statement.json",
  "data/content-intelligence/ad-foundation/ad09-database-first-methodology-map.json",
  "data/content-intelligence/backend-architecture/ad09-no-generation-no-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ad09-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ad09-ad10-safety-cultural-integrity-readiness-record.json",
  "data/content-intelligence/mutation-plans/ad09-to-ad10-safety-cultural-integrity-boundary.json",
  "data/quality/ad09-kala-drishti-methodology-statement.json",
  "data/quality/ad09-kala-drishti-methodology-statement-preview.json",
  "docs/quality/AD09_KALA_DRISHTI_METHODOLOGY_STATEMENT.md",
  "scripts/generate-ad09-kala-drishti-methodology-statement.mjs",
  "scripts/validate-ad09-kala-drishti-methodology-statement.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ad08Review = readJson("data/content-intelligence/quality-reviews/ad08-seed-data-source-attribution-register.json");
const ad08NoSeedNoFetchAudit = readJson("data/content-intelligence/backend-architecture/ad08-no-seed-no-fetch-audit.json");
const ad08NoMutationAudit = readJson("data/content-intelligence/backend-architecture/ad08-no-mutation-audit-register.json");
const ad08Readiness = readJson("data/content-intelligence/quality-registry/ad08-ad09-kala-drishti-methodology-readiness-record.json");
const ad08Boundary = readJson("data/content-intelligence/mutation-plans/ad08-to-ad09-kala-drishti-methodology-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ad09-kala-drishti-methodology-statement.json");
const internalMethodologyStatement = readJson("data/content-intelligence/ad-foundation/ad09-internal-kala-drishti-methodology-statement.json");
const publicMethodologyStatement = readJson("data/content-intelligence/ad-foundation/ad09-public-kala-drishti-methodology-statement.json");
const methodologyLayerMap = readJson("data/content-intelligence/ad-foundation/ad09-methodology-layer-map.json");
const sourceAndRegionalPositioning = readJson("data/content-intelligence/ad-foundation/ad09-source-regional-positioning-statement.json");
const nonPredictionBoundary = readJson("data/content-intelligence/ad-foundation/ad09-non-prediction-boundary-statement.json");
const databaseFirstMethodologyMap = readJson("data/content-intelligence/ad-foundation/ad09-database-first-methodology-map.json");
const noGenerationNoRuntimeAudit = readJson("data/content-intelligence/backend-architecture/ad09-no-generation-no-runtime-audit.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ad09-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ad09-ad10-safety-cultural-integrity-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ad09-to-ad10-safety-cultural-integrity-boundary.json");
const preview = readJson("data/quality/ad09-kala-drishti-methodology-statement-preview.json");
const pkg = readJson("package.json");

if (ad08Review.status !== "seed_data_source_attribution_register_ready_for_ad09") fail("AD08 review status mismatch.");
if (ad08Review.summary.ready_for_ad09 !== true) fail("AD08 readiness summary missing.");
if (ad08NoSeedNoFetchAudit.audit_passed !== true) fail("AD08 no seed/no fetch audit must pass.");
if (ad08NoMutationAudit.audit_passed !== true) fail("AD08 no-mutation audit must pass.");
if (ad08Readiness.ready_for_ad09 !== true) fail("AD08 readiness must permit AD09.");
if (ad08Boundary.next_stage_id !== "AD09") fail("AD08 boundary must point to AD09.");

if (review.status !== "kala_drishti_methodology_statement_ready_for_ad10") fail("AD09 review status mismatch.");
for (const key of [
  "ad09_kala_drishti_methodology_statement_recorded",
  "ad00_to_ad08_consumed",
  "internal_methodology_statement_recorded",
  "public_methodology_statement_recorded",
  "methodology_layer_map_recorded",
  "source_regional_positioning_recorded",
  "non_prediction_boundary_recorded",
  "database_first_methodology_map_recorded",
  "no_generation_no_runtime_audit_recorded",
  "ready_for_ad10"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_ad10 !== 0) fail("AD10 blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "methodology_published_publicly", "guidance_generated", "word_of_day_generated", "panchang_prediction_generated", "deterministic_prediction_generated", "panchang_calculation_executed", "seed_data_inserted", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (internalMethodologyStatement.status !== "internal_kala_drishti_methodology_statement_recorded") fail("Internal methodology status mismatch.");
if (internalMethodologyStatement.method_name !== "Drishvara Kāla-Dṛṣṭi Method") fail("Internal method name mismatch.");
for (const layer of ["source_authenticity_layer", "panchanga_ontology_layer", "regional_profile_layer", "guidance_star_reflection_rule_layer", "database_first_traceability_layer"]) {
  if (!internalMethodologyStatement.governing_layers.includes(layer)) fail(`Internal governing layer missing: ${layer}`);
}

if (publicMethodologyStatement.status !== "public_methodology_statement_draft_recorded_not_published") fail("Public methodology status mismatch.");
if (!JSON.stringify(publicMethodologyStatement.public_statement_draft).includes("does not claim to predict fixed outcomes")) fail("Public non-prediction wording missing.");
if (publicMethodologyStatement.publication_status !== "not_published_in_ad09") fail("Publication status must remain not published.");

if (methodologyLayerMap.status !== "methodology_layer_map_recorded") fail("Methodology layer map status mismatch.");
for (const stage of ["AD01", "AD02", "AD03", "AD04", "AD05", "AD06", "AD07", "AD08"]) {
  if (!JSON.stringify(methodologyLayerMap.layers).includes(stage)) fail(`Methodology layer missing source stage: ${stage}`);
}

if (sourceAndRegionalPositioning.status !== "source_regional_positioning_statement_recorded") fail("Source/regional positioning status mismatch.");
for (const phrase of ["Bihar", "Mithila", "Uttar Pradesh", "South Indian Panchangam", "Nityanand Mishra ji"]) {
  if (!JSON.stringify(sourceAndRegionalPositioning.statement_points).includes(phrase)) fail(`Source/regional phrase missing: ${phrase}`);
}

if (nonPredictionBoundary.status !== "non_prediction_boundary_statement_recorded") fail("Non-prediction boundary status mismatch.");
for (const phrase of ["does not promise fixed outcomes", "does not provide medical, legal, financial or safety advice", "does not claim a live Panchang calculation"]) {
  if (!JSON.stringify(nonPredictionBoundary.boundary_rules).includes(phrase)) fail(`Non-prediction boundary phrase missing: ${phrase}`);
}

if (databaseFirstMethodologyMap.status !== "database_first_methodology_map_recorded") fail("Database-first methodology map status mismatch.");
for (const target of ["AD10", "ADZ", "ADB01", "AG47", "AG49", "AG52", "AG55", "AG56"]) {
  if (!databaseFirstMethodologyMap.later_consumers.includes(target)) fail(`Later consumer missing: ${target}`);
}

if (noGenerationNoRuntimeAudit.status !== "no_generation_no_runtime_audit_passed_for_ad09") fail("No-generation audit status mismatch.");
if (noGenerationNoRuntimeAudit.audit_passed !== true) fail("No-generation audit must pass.");
if (noGenerationNoRuntimeAudit.failed_checks.length !== 0) fail("No-generation audit failed checks must be zero.");
for (const check of noGenerationNoRuntimeAudit.checks) {
  if (check.passed !== true) fail(`No-generation check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ad09") fail("No-mutation status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.status !== "ready_for_ad10_safety_non_claim_cultural_integrity_audit") fail("Readiness status mismatch.");
if (readiness.ready_for_ad10 !== true) fail("Readiness must permit AD10.");
if (readiness.next_stage_id !== "AD10") fail("Readiness next stage must be AD10.");
if (readiness.methodology_publication_allowed_next !== false) fail("Methodology publication must remain blocked.");
if (readiness.guidance_generation_allowed_next !== false) fail("Guidance generation must remain blocked.");
if (readiness.sql_creation_allowed_next !== false) fail("SQL creation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AD10") fail("Boundary must point to AD10.");
if (!JSON.stringify(boundary.allowed_scope).includes("non-prediction language")) fail("AD10 non-prediction scope missing.");
if (!JSON.stringify(boundary.allowed_scope).includes("Prepare ADZ closure readiness")) fail("ADZ readiness boundary missing.");
if (!boundary.blocked_scope.includes("methodology publication")) fail("Methodology publication blocked scope missing.");
if (!boundary.blocked_scope.includes("SQL execution")) fail("SQL execution blocked scope missing.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role exposure blocked scope missing.");

for (const key of [
  "ad09_kala_drishti_methodology_statement_recorded",
  "ad00_to_ad08_consumed",
  "internal_methodology_statement_recorded",
  "public_methodology_statement_recorded",
  "methodology_layer_map_recorded",
  "source_regional_positioning_recorded",
  "non_prediction_boundary_recorded",
  "database_first_methodology_map_recorded",
  "no_generation_no_runtime_audit_recorded",
  "ready_for_ad10"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_ad10 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["ag47_resume_allowed", "homepage_mutated", "public_content_generated", "methodology_published_publicly", "guidance_generated", "word_of_day_generated", "panchang_prediction_generated", "deterministic_prediction_generated", "panchang_calculation_executed", "seed_data_inserted", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "backend_auth_supabase_activation_performed", "deployment_performed", "service_role_key_exposed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ad09"]) fail("Missing package script: generate:ad09");
if (!pkg.scripts?.["validate:ad09"]) fail("Missing package script: validate:ad09");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ad09")) fail("validate:project must include validate:ad09.");

pass("AD09 Drishvara Kāla-Dṛṣṭi Methodology Statement is present.");
pass("AD00 through AD08 are consumed.");
pass("Internal methodology statement is valid.");
pass("Public methodology statement draft is valid and not published.");
pass("Methodology layer map is valid.");
pass("Source and regional positioning statement is valid.");
pass("Non-prediction boundary is valid.");
pass("Database-first methodology map is valid.");
pass("No generation / no runtime audit is valid.");
pass("No-mutation audit is valid.");
pass("AD10 Safety, Non-claim and Cultural Integrity Audit readiness is valid.");
pass("No publication, public content generation, Panchang calculation, SQL, DB write, backend activation, deployment or service-role exposure is recorded.");
