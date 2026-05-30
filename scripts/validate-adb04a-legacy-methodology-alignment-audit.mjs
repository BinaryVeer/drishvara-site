import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error(`❌ ADB04A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/adb04-sql-draft-approval-checkpoint.json",
  "data/content-intelligence/database-build/adb04-sql-draft-approval-checkpoint.json",
  "data/content-intelligence/backend-architecture/adb04-no-sql-no-db-write-audit.json",
  "data/content-intelligence/backend-architecture/adb04-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb04-adb05-sql-migration-draft-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb04-to-adb05-sql-migration-draft-boundary.json",
  "data/content-intelligence/database-build/adb02-table-dictionary.json",
  "data/content-intelligence/database-build/adb02-field-dictionary.json",

  "data/methodology/methodology-index.json",
  "data/methodology/m00-source-doctrine.json",
  "data/methodology/m01-panchang-calculation-methodology.json",
  "data/methodology/m02-tithi-vrat-fasting-rule-methodology.json",
  "data/methodology/m03-festival-rule-registry.json",
  "data/methodology/m04-location-timezone-sunrise-basis.json",
  "data/methodology/m04a-periodic-validation-learning-register.json",
  "data/knowledge/daily-guidance/daily-guidance-engine-governance-d01.json",
  "data/knowledge/daily-guidance/word-of-day-bank-d02.json",
  "data/knowledge/daily-guidance/daily-guidance-rule-schema-d03.json",
  "data/knowledge/sanatan/panchang-source-policy-d01.json",
  "data/knowledge/sanatan/festival-observance-registry-d05.json",
  "data/knowledge/sanatan/mantra-source-registry-d06.json",
  "data/implementation/id01-supabase-logical-schema-rls-design-without-migration.json",

  "data/content-intelligence/quality-reviews/adb04a-legacy-methodology-alignment-audit.json",
  "data/content-intelligence/database-build/adb04a-legacy-methodology-knowledge-inventory.json",
  "data/content-intelligence/database-build/adb04a-methodology-knowledge-alignment-audit.json",
  "data/content-intelligence/database-build/adb04a-adb02-schema-extension-delta.json",
  "data/content-intelligence/database-build/adb04a-duplicate-prevention-map.json",
  "data/content-intelligence/database-build/adb04a-calculation-engine-schema-requirements.json",
  "data/content-intelligence/database-build/adb04a-revised-adb05-sql-draft-scope.json",
  "data/content-intelligence/backend-architecture/adb04a-sql-execution-deferral-register.json",
  "data/content-intelligence/backend-architecture/adb04a-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/adb04a-adb05-revised-sql-draft-readiness-record.json",
  "data/content-intelligence/mutation-plans/adb04a-to-adb05-revised-sql-migration-draft-boundary.json",
  "data/quality/adb04a-legacy-methodology-alignment-audit.json",
  "data/quality/adb04a-legacy-methodology-alignment-audit-preview.json",
  "docs/quality/ADB04A_LEGACY_METHODOLOGY_ALIGNMENT_AUDIT.md",
  "scripts/generate-adb04a-legacy-methodology-alignment-audit.mjs",
  "scripts/validate-adb04a-legacy-methodology-alignment-audit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const adb04Review = readJson("data/content-intelligence/quality-reviews/adb04-sql-draft-approval-checkpoint.json");
const adb04Approval = readJson("data/content-intelligence/database-build/adb04-sql-draft-approval-checkpoint.json");
const adb04NoSqlAudit = readJson("data/content-intelligence/backend-architecture/adb04-no-sql-no-db-write-audit.json");
const adb04NoMutationAudit = readJson("data/content-intelligence/backend-architecture/adb04-no-mutation-audit-register.json");
const adb04Readiness = readJson("data/content-intelligence/quality-registry/adb04-adb05-sql-migration-draft-readiness-record.json");
const adb04Boundary = readJson("data/content-intelligence/mutation-plans/adb04-to-adb05-sql-migration-draft-boundary.json");

if (adb04Review.status !== "sql_draft_approval_checkpoint_ready_for_adb05") fail("ADB04 review status mismatch.");
if (adb04Approval.approval_scope.sql_draft_generation_approved_for_adb05 !== true) fail("ADB04 SQL draft approval missing.");
if (adb04Approval.approval_scope.sql_execution_approved !== false) fail("ADB04 SQL execution must remain blocked.");
if (adb04NoSqlAudit.audit_passed !== true) fail("ADB04 no SQL/no DB audit must pass.");
if (adb04NoMutationAudit.audit_passed !== true) fail("ADB04 no-mutation audit must pass.");
if (adb04Readiness.ready_for_adb05 !== true) fail("ADB04 readiness must permit ADB05.");
if (adb04Boundary.next_stage_id !== "ADB05") fail("ADB04 boundary must point to ADB05.");

const review = readJson("data/content-intelligence/quality-reviews/adb04a-legacy-methodology-alignment-audit.json");
const legacyInventory = readJson("data/content-intelligence/database-build/adb04a-legacy-methodology-knowledge-inventory.json");
const alignmentAudit = readJson("data/content-intelligence/database-build/adb04a-methodology-knowledge-alignment-audit.json");
const adb02ExtensionDelta = readJson("data/content-intelligence/database-build/adb04a-adb02-schema-extension-delta.json");
const duplicatePreventionMap = readJson("data/content-intelligence/database-build/adb04a-duplicate-prevention-map.json");
const calculationEngineSchemaRequirements = readJson("data/content-intelligence/database-build/adb04a-calculation-engine-schema-requirements.json");
const revisedAdb05Scope = readJson("data/content-intelligence/database-build/adb04a-revised-adb05-sql-draft-scope.json");
const sqlExecutionDeferral = readJson("data/content-intelligence/backend-architecture/adb04a-sql-execution-deferral-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/adb04a-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/adb04a-adb05-revised-sql-draft-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/adb04a-to-adb05-revised-sql-migration-draft-boundary.json");
const preview = readJson("data/quality/adb04a-legacy-methodology-alignment-audit-preview.json");
const pkg = readJson("package.json");

if (review.status !== "legacy_methodology_alignment_ready_for_adb05") fail("ADB04A review status mismatch.");
for (const key of [
  "adb04a_legacy_methodology_alignment_recorded",
  "adb04_consumed",
  "m_series_consumed",
  "d_series_consumed",
  "id_series_consumed",
  "adb02_schema_extension_delta_recorded",
  "duplicate_prevention_map_recorded",
  "calculation_engine_schema_requirements_recorded",
  "revised_adb05_scope_recorded",
  "ready_for_adb05_revised_sql_draft"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}
if (review.summary.hard_blocker_count_for_adb05 !== 0) fail("ADB05 hard blocker count must be zero.");
for (const key of ["legacy_files_altered", "adb02_commit_rewritten", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "seed_data_inserted", "service_role_key_exposed", "panchang_calculation_executed"]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (legacyInventory.status !== "legacy_methodology_knowledge_inventory_recorded") fail("Legacy inventory status mismatch.");
for (const mod of ["M00", "M01", "M02", "M03", "M04", "M04A", "M10"]) {
  if (!JSON.stringify(legacyInventory.consumed_m_series_modules).includes(mod)) fail(`M-series module not consumed: ${mod}`);
}
for (const file of ["daily-guidance-engine-governance-d01", "word-of-day-bank-d02", "daily-guidance-rule-schema-d03", "festival-observance-registry-d05", "mantra-source-registry-d06"]) {
  if (!JSON.stringify(legacyInventory.consumed_d_series_files).includes(file)) fail(`D-series file not consumed: ${file}`);
}
if (!JSON.stringify(legacyInventory.consumed_id_series_files).includes("id01-supabase-logical-schema")) fail("ID01 not consumed.");

if (alignmentAudit.status !== "methodology_knowledge_alignment_audit_passed") fail("Alignment audit status mismatch.");
if (alignmentAudit.audit_result !== "passed_with_schema_extension_required") fail("Alignment audit result mismatch.");
for (const area of ["panchang_calculation_engine", "tithi_vrat_fasting_rules", "festival_observance_registry", "location_timezone_sunrise", "validation_learning"]) {
  if (!JSON.stringify(alignmentAudit.findings).includes(area)) fail(`Alignment area missing: ${area}`);
}

if (adb02ExtensionDelta.status !== "adb02_schema_extension_delta_recorded") fail("ADB02 extension status mismatch.");
if (adb02ExtensionDelta.treatment !== "additive_delta_to_committed_adb02_not_history_rewrite") fail("ADB02 treatment must be additive delta.");
for (const table of ["calculation_profiles", "ephemeris_profiles", "ayanamsha_profiles", "astronomical_input_snapshots", "panchanga_calculation_runs", "panchanga_calculation_trace_logs", "location_time_profiles", "festival_observance_rule_registry", "validation_learning_cycles"]) {
  if (!JSON.stringify(adb02ExtensionDelta.required_extension_table_groups).includes(table)) fail(`Extension table missing: ${table}`);
}
for (const field of ["ephemeris_source", "ayanamsha_source", "solar_longitude", "lunar_longitude", "interpolation_or_root_finding_method", "software_library_version"]) {
  if (!adb02ExtensionDelta.required_trace_fields_from_m01.includes(field)) fail(`M01 trace field missing: ${field}`);
}

if (duplicatePreventionMap.status !== "duplicate_prevention_map_recorded") fail("Duplicate prevention status mismatch.");
for (const phrase of ["Do not recreate M01", "Do not rewrite ADB02 history", "Do not create seed-insert scripts"]) {
  if (!JSON.stringify(duplicatePreventionMap.rules).includes(phrase)) fail(`Duplicate prevention rule missing: ${phrase}`);
}

if (calculationEngineSchemaRequirements.status !== "calculation_engine_schema_requirements_recorded") fail("Calculation engine requirements status mismatch.");
if (calculationEngineSchemaRequirements.engine_requirement !== "mandatory_for_drishvara_panchang_outputs") fail("Calculation engine must be mandatory.");
for (const formula of ["tithi_from_moon_sun_angular_separation", "nakshatra_from_sidereal_moon_longitude", "yoga_from_sidereal_sun_plus_moon_longitude", "karana_from_half_tithi_sequence", "sunrise_sunset_moonrise_event_window_support"]) {
  if (!calculationEngineSchemaRequirements.required_formula_support.includes(formula)) fail(`Formula support missing: ${formula}`);
}

if (revisedAdb05Scope.status !== "revised_adb05_sql_draft_scope_recorded") fail("Revised ADB05 scope status mismatch.");
if (revisedAdb05Scope.supersedes_direct_adb04_to_adb05_scope !== true) fail("ADB04A must supersede direct ADB04 to ADB05 scope.");
for (const input of ["ADB02 base schema dictionary", "ADB04A schema extension delta", "M00 through M10 methodology records", "D01 through D06 knowledge records", "ID01 and available ID02 implementation records"]) {
  if (!revisedAdb05Scope.adb05_must_consume.includes(input)) fail(`ADB05 required input missing: ${input}`);
}
for (const label of ["DRAFT_ONLY", "NOT_EXECUTED", "CONSUMES_ADB02_AND_ADB04A", "CONSUMES_M_D_ID_SERIES", "NO_SERVICE_ROLE_KEY", "NO_SEED_INSERT", "NO_RUNTIME_ENGINE_ACTIVATION"]) {
  if (!revisedAdb05Scope.required_draft_labels.includes(label)) fail(`ADB05 required label missing: ${label}`);
}

if (sqlExecutionDeferral.status !== "sql_execution_deferred_after_adb04a") fail("SQL execution deferral status mismatch.");
if (!JSON.stringify(sqlExecutionDeferral.deferral_rules).includes("ADB04A does not create SQL")) fail("ADB04A no-SQL rule missing.");
if (!JSON.stringify(sqlExecutionDeferral.deferral_rules).includes("ADB05 may create draft SQL only after consuming ADB04A delta")) fail("ADB05 delta-consumption rule missing.");

if (noMutationAudit.status !== "no_mutation_audit_passed_for_adb04a") fail("No-mutation status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.status !== "ready_for_adb05_revised_sql_migration_draft_generation") fail("Readiness status mismatch.");
if (readiness.ready_for_adb05 !== true) fail("ADB05 readiness must be true.");
if (readiness.next_stage_id !== "ADB05") fail("Readiness must point to ADB05.");
if (readiness.sql_draft_generation_allowed_next !== true) fail("SQL draft generation must remain allowed for ADB05.");
if (readiness.sql_execution_allowed_next !== false) fail("SQL execution must remain blocked.");
if (readiness.service_role_key_required_next !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "ADB05") fail("Boundary must point to ADB05.");
if (!JSON.stringify(boundary.allowed_scope).includes("Include ADB04A calculation-engine extension tables")) fail("ADB05 calculation-engine extension scope missing.");
if (!boundary.blocked_scope.includes("SQL execution")) fail("SQL execution must remain blocked.");
if (!boundary.blocked_scope.includes("service-role key exposure")) fail("Service-role key exposure must remain blocked.");

for (const key of [
  "adb04a_legacy_methodology_alignment_recorded",
  "adb04_consumed",
  "m_series_consumed",
  "d_series_consumed",
  "id_series_consumed",
  "adb02_schema_extension_delta_recorded",
  "duplicate_prevention_map_recorded",
  "calculation_engine_schema_requirements_recorded",
  "revised_adb05_scope_recorded",
  "ready_for_adb05_revised_sql_draft"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}
if (preview.hard_blocker_count_for_adb05 !== 0) fail("Preview blocker count must be zero.");
for (const key of ["legacy_files_altered", "adb02_commit_rewritten", "sql_file_created", "sql_executed", "database_write_performed", "supabase_table_created", "supabase_schema_modified", "seed_data_inserted", "service_role_key_exposed", "panchang_calculation_executed"]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:adb04a"]) fail("Missing package script: generate:adb04a");
if (!pkg.scripts?.["validate:adb04a"]) fail("Missing package script: validate:adb04a");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:adb04a")) fail("validate:project must include validate:adb04a.");

pass("ADB04A Legacy Methodology Alignment Audit is present.");
pass("ADB04 is consumed.");
pass("M-series methodology records are consumed.");
pass("D-series knowledge records are consumed.");
pass("ID-series implementation records are consumed.");
pass("ADB02 schema-extension delta is valid.");
pass("Duplicate prevention map is valid.");
pass("Calculation engine schema requirements are valid.");
pass("Revised ADB05 SQL draft scope is valid.");
pass("No legacy files altered and no ADB02 history rewrite recorded.");
pass("No SQL, DB write, Supabase activation, seed insert, runtime calculation or service-role exposure is recorded.");
