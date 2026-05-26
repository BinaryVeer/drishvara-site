import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function readText(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

function fail(msg) {
  console.error(`❌ AG35B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json",
  "data/content-intelligence/backend-architecture/ag35a-controlled-activation-decision-record.json",
  "data/content-intelligence/backend-architecture/ag35a-controlled-activation-control-plan.json",
  "data/content-intelligence/backend-architecture/ag35a-approval-non-execution-audit-register.json",
  "data/content-intelligence/quality-registry/ag35a-supabase-schema-apply-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag35a-to-ag35b-supabase-schema-apply-boundary.json",
  "data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure.json",
  "data/content-intelligence/backend-architecture/ag34z-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag34b-service-role-protection-plan.json",
  "data/content-intelligence/backend-architecture/ag34c-role-restriction-test-plan.json",
  "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-register.json",
  "data/content-intelligence/backend-architecture/ag31a-article-state-transition-map.json",
  "data/content-intelligence/backend-architecture/ag31c-audit-log-model.json",
  "data/content-intelligence/backend-architecture/ag31c-audit-log-field-schema.json",
  "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "supabase/migrations/20260527_ag35b_drishvara_controlled_schema.sql",
  "data/content-intelligence/quality-reviews/ag35b-supabase-schema-apply.json",
  "data/content-intelligence/backend-architecture/ag35b-supabase-schema-apply-package.json",
  "data/content-intelligence/backend-architecture/ag35b-schema-manifest.json",
  "data/content-intelligence/backend-architecture/ag35b-rls-manifest.json",
  "data/content-intelligence/backend-architecture/ag35b-manual-supabase-apply-guide.json",
  "data/content-intelligence/backend-architecture/ag35b-schema-apply-non-execution-audit-register.json",
  "data/content-intelligence/backend-architecture/ag35b-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag35b-schema-apply-blocker-register.json",
  "data/content-intelligence/quality-registry/ag35b-auth-role-setup-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag35b-to-ag35c-auth-role-setup-boundary.json",
  "data/quality/ag35b-supabase-schema-apply.json",
  "data/quality/ag35b-supabase-schema-apply-preview.json",
  "docs/quality/AG35B_SUPABASE_SCHEMA_APPLY.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag35b-supabase-schema-apply.json");
const packageRecord = readJson("data/content-intelligence/backend-architecture/ag35b-supabase-schema-apply-package.json");
const schemaManifest = readJson("data/content-intelligence/backend-architecture/ag35b-schema-manifest.json");
const rlsManifest = readJson("data/content-intelligence/backend-architecture/ag35b-rls-manifest.json");
const manualApplyGuide = readJson("data/content-intelligence/backend-architecture/ag35b-manual-supabase-apply-guide.json");
const nonExecution = readJson("data/content-intelligence/backend-architecture/ag35b-schema-apply-non-execution-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag35b-auth-role-setup-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag35b-to-ag35c-auth-role-setup-boundary.json");
const preview = readJson("data/quality/ag35b-supabase-schema-apply-preview.json");
const registry = readJson("data/quality/ag35b-supabase-schema-apply.json");
const sql = readText("supabase/migrations/20260527_ag35b_drishvara_controlled_schema.sql");

const ag35a = readJson("data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json");
const ag35aReadiness = readJson("data/content-intelligence/quality-registry/ag35a-supabase-schema-apply-readiness-record.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "controlled_supabase_schema_apply_package_created_pending_manual_apply") fail("Review status mismatch.");
if (packageRecord.status !== "controlled_supabase_schema_apply_package_created_pending_manual_apply") fail("Package status mismatch.");
if (packageRecord.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (packageRecord.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (ag35a.status !== "explicit_activation_approval_recorded_ready_for_ag35b") fail("AG35A source status mismatch.");
if (ag35aReadiness.ready_for_ag35b !== true) fail("AG35A readiness must allow AG35B.");
if (ag35aReadiness.allowed_ag35b_mode !== "controlled_supabase_schema_apply") fail("AG35B mode mismatch.");

for (const table of ["profiles", "articles", "article_assignments", "article_audit_logs", "publish_rollback_refs"]) {
  if (!schemaManifest.planned_tables.includes(table)) fail(`Missing table in schema manifest: ${table}`);
  if (!sql.includes(`public.${table}`)) fail(`SQL missing table reference: public.${table}`);
}

for (const policy of [
  "profiles_select_self_or_admin",
  "articles_select_admin_or_assigned_editor",
  "articles_insert_admin_only",
  "articles_update_admin_or_assigned_editor_limited",
  "assignments_select_admin_or_assigned_editor",
  "assignments_write_admin_only",
  "audit_select_admin_or_related_editor",
  "audit_insert_admin_or_assigned_editor",
  "rollback_refs_admin_only"
]) {
  if (!rlsManifest.planned_policies.includes(policy)) fail(`Missing RLS policy in manifest: ${policy}`);
  if (!sql.includes(policy)) fail(`SQL missing RLS policy: ${policy}`);
}

if (!sql.includes("enable row level security")) fail("SQL must enable RLS.");
if (!sql.includes("assigned_editor_id = auth.uid()")) fail("SQL must include assigned-editor restriction.");
if (!sql.includes("role = 'admin'")) fail("SQL must include admin role condition.");
if (!sql.includes("status in ('draft', 'admin_review', 'returned', 'editor_submitted', 'publish_approved', 'published', 'archived')")) fail("SQL must include article state constraint.");

for (const forbidden of [
  "SUPABASE_SERVICE_ROLE_KEY=",
  "NEXT_PUBLIC_SUPABASE",
  "service_role",
  "password",
  "apikey",
  "eyJ"
]) {
  if (sql.includes(forbidden)) fail(`SQL contains forbidden secret-like string: ${forbidden}`);
}

if (schemaManifest.sql_generated_now !== true) fail("SQL generated flag must be true.");
if (schemaManifest.migration_generated_now !== true) fail("Migration generated flag must be true.");
if (schemaManifest.sql_applied_now !== false) fail("SQL applied flag must be false.");
if (schemaManifest.migration_applied_now !== false) fail("Migration applied flag must be false.");
if (schemaManifest.database_write_done_now !== false) fail("Database write flag must be false.");

if (rlsManifest.rls_policy_created_now !== true) fail("RLS generated flag must be true.");
if (rlsManifest.rls_policy_applied_now !== false) fail("RLS applied flag must be false.");
if (rlsManifest.governance_rules.admin_final_clearance_authority !== true) fail("Admin final clearance governance missing.");
if (rlsManifest.governance_rules.editor_assigned_only !== true) fail("Editor assigned-only governance missing.");
if (rlsManifest.governance_rules.editor_cannot_publish !== true) fail("Editor no-publish governance missing.");
if (rlsManifest.governance_rules.service_role_not_frontend_exposed !== true) fail("Service-role protection missing.");

if (manualApplyGuide.manual_apply_performed_by_script !== false) fail("Manual apply must not be performed by script.");
if (manualApplyGuide.supabase_connected_now !== false) fail("Supabase must not be connected.");
if (manualApplyGuide.sql_applied_now !== false) fail("SQL must not be applied.");
if (manualApplyGuide.migration_applied_now !== false) fail("Migration must not be applied.");

if (nonExecution.audit_passed !== true) fail("Non-execution audit must pass.");
for (const check of nonExecution.checks) {
  if (check.passed !== true) fail(`Non-execution check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag35c !== true) fail("AG35C readiness missing.");
if (readiness.manual_apply_required_before_runtime_use !== true) fail("Manual apply requirement missing.");
for (const flag of [
  "auth_activation_allowed_now",
  "user_creation_allowed_now",
  "credential_creation_allowed_now",
  "secret_write_allowed_now",
  "public_mutation_allowed_now",
  "deployment_allowed_now"
]) {
  if (readiness[flag] !== false) fail(`${flag} must be false.`);
}

if (boundary.next_stage_id !== "AG35C") fail("Boundary must point to AG35C.");
if (boundary.schema_package_created !== true) fail("Boundary must confirm schema package.");
if (boundary.manual_apply_required_before_runtime_use !== true) fail("Boundary must require manual apply before runtime use.");

if (review.summary.sql_generated !== true) fail("Review summary must mark SQL generated.");
if (review.summary.sql_applied_by_script !== false) fail("Review summary must not mark SQL applied.");
if (review.summary.migration_generated !== true) fail("Review summary must mark migration generated.");
if (review.summary.migration_applied_by_script !== false) fail("Review summary must not mark migration applied.");
if (review.summary.rls_policy_generated !== true) fail("Review summary must mark RLS generated.");
if (review.summary.rls_policy_applied_by_script !== false) fail("Review summary must not mark RLS applied.");

for (const zeroField of [
  "supabase_project_created",
  "supabase_connected",
  "auth_enabled",
  "user_created",
  "credential_created",
  "database_objects_created_by_script",
  "database_write_done_by_script",
  "sql_applied_by_script",
  "migrations_applied_by_script",
  "rls_policies_applied_by_script",
  "secrets_created",
  "env_vars_written",
  "service_role_key_created",
  "service_role_key_exposed",
  "server_routes_created",
  "api_routes_created",
  "github_write_done",
  "deployment_done",
  "public_mutation_done"
]) {
  if (preview[zeroField] !== 0) fail(`Preview ${zeroField} must be 0.`);
}

if (preview.sql_generated !== 1) fail("Preview SQL generated must be 1.");
if (preview.migrations_generated !== 1) fail("Preview migrations generated must be 1.");
if (preview.rls_policies_generated !== 1) fail("Preview RLS generated must be 1.");

if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "controlled_supabase_schema_apply_package_created_pending_manual_apply") fail("Registry status mismatch.");

if (!pkg.scripts?.["generate:ag35b"]) fail("Missing generate:ag35b script.");
if (!pkg.scripts?.["validate:ag35b"]) fail("Missing validate:ag35b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag35b")) fail("validate:project must include validate:ag35b.");

pass("AG35B Controlled Supabase Schema Apply Package is present.");
pass("SQL migration file, schema manifest and RLS manifest are valid.");
pass("No secrets, Supabase connection, SQL apply, Auth user, env var, deployment or public mutation is performed by script.");
pass("Manual Supabase apply review is required before runtime use.");
pass("AG35C Auth Role Setup boundary is ready.");
