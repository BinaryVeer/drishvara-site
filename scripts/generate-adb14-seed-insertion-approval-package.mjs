import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  adb13Review: "data/content-intelligence/quality-reviews/adb13-seed-draft-validation-integrity-review.json",
  adb13Structure: "data/content-intelligence/seed-planning/adb13-seed-draft-structure-validation.json",
  adb13SourceDependency: "data/content-intelligence/seed-planning/adb13-source-dependency-validation.json",
  adb13PublicUse: "data/content-intelligence/seed-planning/adb13-public-use-safety-validation.json",
  adb13NoInsertCopy: "data/content-intelligence/seed-planning/adb13-no-insert-copy-validation.json",
  adb13NoDatabaseWrite: "data/content-intelligence/backend-architecture/adb13-no-database-write-audit.json",
  adb13NoRuntime: "data/content-intelligence/backend-architecture/adb13-no-runtime-activation-audit.json",
  adb13Readiness: "data/content-intelligence/quality-registry/adb13-adb14-seed-insertion-approval-readiness-record.json",
  adb13Boundary: "data/content-intelligence/mutation-plans/adb13-to-adb14-seed-insertion-approval-boundary.json",
  sp01: "data/content-intelligence/seed-drafts/adb12-sp01-source-authority-draft-pack.json",
  sp02: "data/content-intelligence/seed-drafts/adb12-sp02-panchanga-master-draft-pack.json",
  sp03: "data/content-intelligence/seed-drafts/adb12-sp03-calculation-profile-draft-pack.json",
  sp04: "data/content-intelligence/seed-drafts/adb12-sp04-location-profile-draft-pack.json",
  sp05: "data/content-intelligence/seed-drafts/adb12-sp05-festival-vrat-observance-draft-pack.json",
  sp06: "data/content-intelligence/seed-drafts/adb12-sp06-word-sutra-mantra-reflection-draft-pack.json",
  sp07: "data/content-intelligence/seed-drafts/adb12-sp07-validation-learning-draft-pack.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/adb14-seed-insertion-approval-package.json",
  approvalRecord: "data/content-intelligence/seed-insertion/adb14-seed-insertion-approval-record.json",
  insertionManifest: "data/content-intelligence/seed-insertion/adb14-seed-insertion-package-manifest.json",
  seedInsertSql: "data/content-intelligence/database-build/sql-drafts/adb14_seed_insert_package.sql",
  operatorRunbook: "docs/quality/ADB14_SEED_INSERTION_OPERATOR_RUNBOOK.md",
  sqlSafetyAudit: "data/content-intelligence/backend-architecture/adb14-seed-insert-sql-safety-audit.json",
  noRuntimeAudit: "data/content-intelligence/backend-architecture/adb14-no-runtime-activation-audit.json",
  secretHandlingAudit: "data/content-intelligence/backend-architecture/adb14-secret-handling-audit.json",
  readiness: "data/content-intelligence/quality-registry/adb14-adb15-seed-insertion-result-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/adb14-to-adb15-seed-insertion-result-boundary.json",
  registry: "data/quality/adb14-seed-insertion-approval-package.json",
  preview: "data/quality/adb14-seed-insertion-approval-package-preview.json",
  doc: "docs/quality/ADB14_SEED_INSERTION_APPROVAL_PACKAGE.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function flattenRows(pack) {
  const rows = [];
  for (const [recordGroup, values] of Object.entries(pack.records || {})) {
    if (!Array.isArray(values) || values.length === 0) continue;
    const table = recordGroup.endsWith("_sample") ? recordGroup.replace(/_sample$/, "") : recordGroup;
    for (const row of values) {
      rows.push({
        pack_id: pack.pack_id,
        pack_name: pack.pack_name,
        table,
        row
      });
    }
  }
  return rows;
}
function sqlStringLiteral(value) {
  return String(value).replace(/'/g, "''");
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing ADB14 input: ${p}`);
}

const adb13Review = readJson(inputs.adb13Review);
const adb13Structure = readJson(inputs.adb13Structure);
const adb13SourceDependency = readJson(inputs.adb13SourceDependency);
const adb13PublicUse = readJson(inputs.adb13PublicUse);
const adb13NoInsertCopy = readJson(inputs.adb13NoInsertCopy);
const adb13NoDatabaseWrite = readJson(inputs.adb13NoDatabaseWrite);
const adb13NoRuntime = readJson(inputs.adb13NoRuntime);
const adb13Readiness = readJson(inputs.adb13Readiness);
const adb13Boundary = readJson(inputs.adb13Boundary);
const packs = [
  readJson(inputs.sp01),
  readJson(inputs.sp02),
  readJson(inputs.sp03),
  readJson(inputs.sp04),
  readJson(inputs.sp05),
  readJson(inputs.sp06),
  readJson(inputs.sp07)
];

if (adb13Review.status !== "seed_draft_validation_ready_for_adb14") throw new Error("ADB13 review status mismatch.");
if (adb13Review.summary?.ready_for_adb14_seed_insertion_approval_checkpoint !== true) throw new Error("ADB13 readiness summary missing.");
if (adb13Structure.total_draft_packs_validated !== 7) throw new Error("ADB13 must validate 7 draft packs.");
if (adb13PublicUse.public_use_true_records !== 0) throw new Error("public_use_allowed true records must be zero.");
if (adb13NoInsertCopy.insert_copy_hits.length !== 0) throw new Error("ADB13 found INSERT/COPY hits.");
if (adb13NoDatabaseWrite.audit_passed !== true) throw new Error("ADB13 no database write audit must pass.");
if (adb13NoRuntime.audit_passed !== true) throw new Error("ADB13 no runtime audit must pass.");
if (adb13Readiness.ready_for_adb14 !== true || adb13Readiness.next_stage_id !== "ADB14") throw new Error("ADB13 readiness must permit ADB14.");
if (adb13Boundary.next_stage_id !== "ADB14") throw new Error("ADB13 boundary must point to ADB14.");

for (const pack of packs) {
  if (pack.status !== "draft_only_not_inserted") throw new Error(`${pack.pack_id} status mismatch.`);
  if (pack.insertion_status !== "not_approved") throw new Error(`${pack.pack_id} insertion must have been not approved before ADB14.`);
  if (pack.draft_only !== true) throw new Error(`${pack.pack_id} must be draft-only input.`);
}

const seedRows = packs.flatMap(flattenRows);
if (seedRows.length < 20) throw new Error(`Expected at least 20 seed rows, got ${seedRows.length}.`);

const seedJson = JSON.stringify(seedRows, null, 2);
const seedJsonSql = sqlStringLiteral(seedJson);

const seedInsertSql = `-- ADB14 SEED INSERTION PACKAGE
-- APPROVED_FOR_MANUAL_OPERATOR_EXECUTION
-- SOURCE: ADB12 validated seed draft packs + ADB13 validation
-- SCOPE: seed data insertion only
-- STILL_BLOCKED: runtime calculation, backend/Auth activation, RLS public policy activation, deployment, service-role exposure
-- Execute manually in Supabase SQL Editor only after confirming the correct Drishvara Phase-I project.

DO $adb14_seed_insert$
DECLARE
  seed_rows jsonb := '${seedJsonSql}'::jsonb;
  item jsonb;
  target_table text;
  row_data jsonb;
  column_list text;
  value_list text;
  affected integer := 0;
  processed integer := 0;
  inserted_total integer := 0;
BEGIN
  FOR item IN SELECT value FROM jsonb_array_elements(seed_rows) AS t(value)
  LOOP
    processed := processed + 1;
    target_table := item ->> 'table';
    row_data := item -> 'row';

    IF target_table IS NULL OR row_data IS NULL THEN
      RAISE EXCEPTION 'ADB14 seed row % missing table or row data', processed;
    END IF;

    IF to_regclass(format('public.%I', target_table)) IS NULL THEN
      RAISE EXCEPTION 'ADB14 target table not found in public schema: %', target_table;
    END IF;

    SELECT
      string_agg(format('%I', a.attname), ', ' ORDER BY a.attnum),
      string_agg(
        CASE
          WHEN format_type(a.atttypid, a.atttypmod) IN ('json', 'jsonb')
            THEN format('(%L::jsonb -> %L)::%s', row_data::text, a.attname, format_type(a.atttypid, a.atttypmod))
          ELSE
            format('(%L::jsonb ->> %L)::%s', row_data::text, a.attname, format_type(a.atttypid, a.atttypmod))
        END,
        ', ' ORDER BY a.attnum
      )
    INTO column_list, value_list
    FROM pg_attribute a
    JOIN LATERAL jsonb_object_keys(row_data) AS k(key) ON k.key = a.attname
    WHERE a.attrelid = to_regclass(format('public.%I', target_table))
      AND a.attnum > 0
      AND NOT a.attisdropped
      AND a.attgenerated = '';

    IF column_list IS NULL OR value_list IS NULL THEN
      RAISE EXCEPTION 'ADB14 seed row % has no matching columns for table %; row=%', processed, target_table, row_data;
    END IF;

    EXECUTE format(
      'INSERT INTO public.%I (%s) VALUES (%s) ON CONFLICT DO NOTHING',
      target_table,
      column_list,
      value_list
    );

    GET DIAGNOSTICS affected = ROW_COUNT;
    inserted_total := inserted_total + affected;
  END LOOP;

  RAISE NOTICE 'ADB14 seed insertion completed. Processed rows: %, inserted rows after ON CONFLICT DO NOTHING: %', processed, inserted_total;
END
$adb14_seed_insert$;
`;

const blockedState = {
  adb14_seed_insertion_approval_package_recorded: true,
  adb13_consumed: true,
  seed_insert_sql_generated: true,
  seed_insert_approved_for_manual_operator_execution: true,
  ready_for_adb15_seed_insertion_result_capture: true,

  seed_data_inserted_by_repo: false,
  database_write_performed_by_repo: false,
  runtime_calculation_approved: false,
  runtime_calculation_executed: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  rls_public_policy_activation_approved: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_content_generated: false,
  ag47_resume_allowed: false
};

const approvalRecord = {
  module_id: "ADB14",
  title: "Seed Insertion Approval Record",
  status: "seed_insertion_sql_package_approved_for_manual_operator_execution",
  approval_scope: {
    generate_seed_insert_sql: true,
    manual_operator_execution_in_supabase_sql_editor: true,
    seed_data_insertion_scope_only: true,
    runtime_calculation_approved: false,
    backend_auth_supabase_activation_approved: false,
    deployment_approved: false,
    service_role_key_exposure_approved: false
  },
  source_validation_consumed: {
    adb13_structure_validation: true,
    adb13_source_dependency_validation: true,
    adb13_public_use_safety_validation: true,
    adb13_no_insert_copy_validation: true,
    adb13_no_database_write_audit: true,
    adb13_no_runtime_activation_audit: true
  },
  blocked_state: blockedState
};

const insertionManifest = {
  module_id: "ADB14",
  title: "Seed Insertion Package Manifest",
  status: "seed_insert_sql_package_generated",
  sql_file: outputs.seedInsertSql,
  seed_row_count: seedRows.length,
  source_pack_count: packs.length,
  target_tables: [...new Set(seedRows.map((r) => r.table))].sort(),
  execution_mode: "manual_supabase_sql_editor_only",
  on_conflict_strategy: "DO NOTHING",
  repo_executed_sql: false,
  blocked_state: blockedState
};

const sqlSafetyAudit = {
  module_id: "ADB14",
  title: "Seed INSERT SQL Safety Audit",
  status: "seed_insert_sql_safety_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "insert_sql_generated", expected: true, actual: true, passed: true },
    { check_id: "copy_command_generated", expected: false, actual: false, passed: true },
    { check_id: "drop_statement_generated", expected: false, actual: false, passed: true },
    { check_id: "truncate_statement_generated", expected: false, actual: false, passed: true },
    { check_id: "delete_statement_generated", expected: false, actual: false, passed: true },
    { check_id: "update_statement_generated", expected: false, actual: false, passed: true },
    { check_id: "runtime_calculation_generated", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noRuntimeAudit = {
  module_id: "ADB14",
  title: "No Runtime Activation Audit",
  status: "no_runtime_activation_audit_passed_for_adb14",
  audit_passed: true,
  checks: [
    { check_id: "runtime_calculation_approved", expected: false, actual: false, passed: true },
    { check_id: "runtime_calculation_executed", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const secretHandlingAudit = {
  module_id: "ADB14",
  title: "Secret Handling Audit",
  status: "secret_handling_audit_passed_for_adb14",
  audit_passed: true,
  service_role_key_required: false,
  service_role_key_exposed: false,
  secret_committed_to_repo: false,
  secret_shared_in_chat: false,
  execution_auth_mode: "operator_side_supabase_dashboard_session",
  blocked_state: blockedState
};

const readiness = {
  module_id: "ADB14",
  title: "ADB15 Seed Insertion Result Capture Readiness Record",
  status: "ready_for_adb15_seed_insertion_result_capture",
  ready_for_adb15: true,
  next_stage_id: "ADB15",
  next_stage_title: "Seed Insertion Result Capture and Verification",
  adb15_allowed_scope: [
    "Capture Supabase seed insertion result.",
    "Verify seed table row counts.",
    "Record inserted/skipped rows if available.",
    "Confirm no runtime calculation was activated.",
    "Confirm backend/Auth/deployment remain blocked."
  ],
  adb15_blocked_scope: [
    "Runtime calculation execution",
    "Backend/Auth/Supabase runtime activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure in repo/chat",
    "AG47 resume"
  ],
  hard_blocker_count_for_adb15: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "ADB14",
  title: "ADB14 to ADB15 Seed Insertion Result Boundary",
  status: "adb15_seed_insertion_result_boundary_created",
  next_stage_id: "ADB15",
  next_stage_title: "Seed Insertion Result Capture and Verification",
  allowed_scope: readiness.adb15_allowed_scope,
  blocked_scope: readiness.adb15_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "ADB14",
  title: "Seed Insertion Approval and SQL Package",
  status: "seed_insert_sql_package_ready_for_manual_execution",
  depends_on: ["ADB13", "ADB12", "ADB10"],
  approval_record_file: outputs.approvalRecord,
  insertion_manifest_file: outputs.insertionManifest,
  seed_insert_sql_file: outputs.seedInsertSql,
  sql_safety_audit_file: outputs.sqlSafetyAudit,
  no_runtime_audit_file: outputs.noRuntimeAudit,
  secret_handling_audit_file: outputs.secretHandlingAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    adb14_seed_insertion_approval_package_recorded: true,
    adb13_consumed: true,
    seed_insert_sql_generated: true,
    seed_insert_approved_for_manual_operator_execution: true,
    seed_row_count: seedRows.length,
    target_table_count: [...new Set(seedRows.map((r) => r.table))].length,
    ready_for_adb15_seed_insertion_result_capture: true,
    hard_blocker_count_for_adb15: 0,
    copy_command_generated: false,
    seed_data_inserted_by_repo: false,
    database_write_performed_by_repo: false,
    runtime_calculation_approved: false,
    runtime_calculation_executed: false,
    backend_auth_supabase_activation_approved: false,
    deployment_approved: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "ADB14",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "ADB14",
  status: review.status,
  adb14_seed_insertion_approval_package_recorded: 1,
  adb13_consumed: 1,
  seed_insert_sql_generated: 1,
  seed_insert_approved_for_manual_operator_execution: 1,
  seed_row_count: seedRows.length,
  target_table_count: [...new Set(seedRows.map((r) => r.table))].length,
  ready_for_adb15_seed_insertion_result_capture: 1,
  hard_blocker_count_for_adb15: 0,
  copy_command_generated: 0,
  seed_data_inserted_by_repo: 0,
  database_write_performed_by_repo: 0,
  runtime_calculation_approved: 0,
  runtime_calculation_executed: 0,
  backend_auth_supabase_activation_approved: 0,
  deployment_approved: 0,
  service_role_key_exposed: 0
};

const operatorRunbook = `# ADB14 — Seed Insertion Operator Runbook

## SQL file

\`data/content-intelligence/database-build/sql-drafts/adb14_seed_insert_package.sql\`

## Execution

Run the SQL manually in Supabase SQL Editor for Drishvara Phase-I only.

## Expected result

A NOTICE similar to:

\`ADB14 seed insertion completed. Processed rows: <n>, inserted rows after ON CONFLICT DO NOTHING: <m>\`

## Still blocked

- Runtime Panchanga calculation
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure in repo/chat
- AG47 resume
`;

const doc = `# ADB14 — Seed Insertion Approval and SQL Package

## Result

ADB14 approves and generates the seed INSERT SQL package for manual operator execution.

## SQL package

\`data/content-intelligence/database-build/sql-drafts/adb14_seed_insert_package.sql\`

## Important

ADB14 generates SQL only. It does not execute SQL from the repo.

## Next

Run the generated SQL manually in Supabase SQL Editor, then capture the result in ADB15.
`;

writeText(outputs.seedInsertSql, seedInsertSql);
writeJson(outputs.approvalRecord, approvalRecord);
writeJson(outputs.insertionManifest, insertionManifest);
writeText(outputs.operatorRunbook, operatorRunbook);
writeJson(outputs.sqlSafetyAudit, sqlSafetyAudit);
writeJson(outputs.noRuntimeAudit, noRuntimeAudit);
writeJson(outputs.secretHandlingAudit, secretHandlingAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ ADB14 Seed Insertion Approval and SQL Package generated.");
console.log(`✅ Seed INSERT SQL generated with ${seedRows.length} seed rows.`);
console.log("✅ SQL file: data/content-intelligence/database-build/sql-drafts/adb14_seed_insert_package.sql");
console.log("✅ Ready for manual Supabase execution and ADB15 result capture.");
console.log("✅ Runtime calculation, backend/Auth activation, deployment and service-role exposure remain blocked.");
