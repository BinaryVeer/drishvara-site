import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ADMIN_EMAIL = "dwivedi.vikash.vaibhav@gmail.com";
const EDITOR_EMAIL = "vikash4world@gmail.com";

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
  console.error(`❌ AG35C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json",
  "data/content-intelligence/quality-registry/ag35b-auth-role-setup-confirmed-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag35b-confirmed-to-ag35c-auth-role-setup-boundary.json",
  "data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "supabase/migrations/20260527_ag35c_auth_role_mapping.sql",
  "data/content-intelligence/quality-reviews/ag35c-auth-role-setup.json",
  "data/content-intelligence/backend-architecture/ag35c-auth-role-setup-package.json",
  "data/content-intelligence/backend-architecture/ag35c-auth-user-creation-guide.json",
  "data/content-intelligence/backend-architecture/ag35c-role-mapping-manifest.json",
  "data/content-intelligence/backend-architecture/ag35c-manual-role-mapping-guide.json",
  "data/content-intelligence/backend-architecture/ag35c-auth-role-setup-non-execution-audit-register.json",
  "data/content-intelligence/backend-architecture/ag35c-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag35c-auth-role-setup-blocker-register.json",
  "data/content-intelligence/quality-registry/ag35c-backend-activation-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag35c-to-ag35d-backend-activation-audit-boundary.json",
  "data/quality/ag35c-auth-role-setup.json",
  "data/quality/ag35c-auth-role-setup-preview.json",
  "docs/quality/AG35C_AUTH_ROLE_SETUP.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag35c-auth-role-setup.json");
const packageRecord = readJson("data/content-intelligence/backend-architecture/ag35c-auth-role-setup-package.json");
const guide = readJson("data/content-intelligence/backend-architecture/ag35c-auth-user-creation-guide.json");
const manifest = readJson("data/content-intelligence/backend-architecture/ag35c-role-mapping-manifest.json");
const manualGuide = readJson("data/content-intelligence/backend-architecture/ag35c-manual-role-mapping-guide.json");
const nonExecution = readJson("data/content-intelligence/backend-architecture/ag35c-auth-role-setup-non-execution-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag35c-backend-activation-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag35c-to-ag35d-backend-activation-audit-boundary.json");
const preview = readJson("data/quality/ag35c-auth-role-setup-preview.json");
const registry = readJson("data/quality/ag35c-auth-role-setup.json");
const sql = readText("supabase/migrations/20260527_ag35c_auth_role_mapping.sql");
const ag35b = readJson("data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json");
const ag35bReadiness = readJson("data/content-intelligence/quality-registry/ag35b-auth-role-setup-confirmed-readiness-record.json");
const ag35a = readJson("data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "controlled_auth_role_setup_package_created_pending_manual_user_creation_and_mapping") fail("Review status mismatch.");
if (packageRecord.status !== "controlled_auth_role_setup_package_created_pending_manual_user_creation_and_mapping") fail("Package status mismatch.");
if (packageRecord.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (packageRecord.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (ag35b.status !== "manual_schema_apply_confirmed_ready_for_ag35c") fail("AG35B confirmation source mismatch.");
if (ag35bReadiness.ready_for_ag35c !== true) fail("AG35B readiness must allow AG35C.");
if (ag35a.approval_decision.controlled_activation_authorized !== true) fail("AG35A controlled activation missing.");

if (packageRecord.selected_test_users.admin_test_email !== ADMIN_EMAIL) fail("Admin test email mismatch.");
if (packageRecord.selected_test_users.editor_test_email !== EDITOR_EMAIL) fail("Editor test email mismatch.");
if (guide.admin_test_email !== ADMIN_EMAIL) fail("Guide Admin email mismatch.");
if (guide.editor_test_email !== EDITOR_EMAIL) fail("Guide Editor email mismatch.");

if (!sql.includes(ADMIN_EMAIL)) fail("SQL missing Admin email.");
if (!sql.includes(EDITOR_EMAIL)) fail("SQL missing Editor email.");
if (!sql.includes("'admin'")) fail("SQL missing admin role.");
if (!sql.includes("'editor'")) fail("SQL missing editor role.");
if (!sql.includes("from auth.users")) fail("SQL must map from auth.users.");
if (!sql.includes("on conflict (id) do update")) fail("SQL must be idempotent.");
if (!sql.includes("select")) fail("SQL must include final select verification.");

for (const forbidden of [
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE",
  "password =",
  "password:",
  "apikey",
  "eyJ"
]) {
  if (sql.includes(forbidden)) fail(`SQL contains forbidden secret-like string: ${forbidden}`);
}

if (guide.auth_users_created_by_script !== false) fail("Auth users must not be created by script.");
if (guide.passwords_recorded !== false) fail("Passwords must not be recorded.");
if (guide.credentials_recorded !== false) fail("Credentials must not be recorded.");

if (manifest.role_mapping_sql_applied_by_script !== false) fail("Role mapping must not be applied by script.");
if (manualGuide.manual_apply_performed_by_script !== false) fail("Manual apply must not be performed by script.");
if (manualGuide.supabase_connected_by_script !== false) fail("Supabase must not be connected by script.");

if (nonExecution.audit_passed !== true) fail("Non-execution audit must pass.");
for (const check of nonExecution.checks) {
  if (check.passed !== true) fail(`Non-execution check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag35d_after_manual_confirmation !== true) fail("AG35D readiness missing.");
if (readiness.manual_auth_user_creation_required !== true) fail("Manual Auth user creation requirement missing.");
if (readiness.manual_role_mapping_sql_required !== true) fail("Manual role mapping SQL requirement missing.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");

if (boundary.next_stage_id !== "AG35D") fail("Boundary must point to AG35D.");
if (boundary.manual_confirmation_required_before_ag35d !== true) fail("Manual confirmation requirement missing.");

if (review.summary.admin_test_email_recorded !== ADMIN_EMAIL) fail("Review Admin email mismatch.");
if (review.summary.editor_test_email_recorded !== EDITOR_EMAIL) fail("Review Editor email mismatch.");
if (review.summary.role_mapping_sql_applied_by_script !== false) fail("Review must not mark SQL applied by script.");
if (review.summary.deployment_done !== false) fail("Review deployment must be false.");
if (review.summary.public_mutation_done !== false) fail("Review public mutation must be false.");

if (preview.admin_test_email !== ADMIN_EMAIL) fail("Preview Admin email mismatch.");
if (preview.editor_test_email !== EDITOR_EMAIL) fail("Preview Editor email mismatch.");
if (preview.auth_users_created_by_script !== 0) fail("Preview user creation must be 0.");
if (preview.passwords_recorded !== 0) fail("Preview passwords must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service role exposure must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");

if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "controlled_auth_role_setup_package_created_pending_manual_user_creation_and_mapping") fail("Registry status mismatch.");

if (!pkg.scripts?.["generate:ag35c"]) fail("Missing generate:ag35c script.");
if (!pkg.scripts?.["validate:ag35c"]) fail("Missing validate:ag35c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag35c")) fail("validate:project must include validate:ag35c.");

pass("AG35C Auth Role Setup package is present.");
pass("Admin and Editor test emails are recorded correctly.");
pass("Role mapping SQL is safe, idempotent and contains no secrets/passwords.");
pass("No Auth users, credentials, secrets, deployment or public mutation are created by script.");
