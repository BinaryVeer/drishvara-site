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

function fail(msg) {
  console.error(`❌ AG35C manual confirmation validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag35c-auth-role-setup-package.json",
  "data/content-intelligence/backend-architecture/ag35c-role-mapping-manifest.json",
  "data/content-intelligence/quality-registry/ag35c-backend-activation-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag35c-to-ag35d-backend-activation-audit-boundary.json",
  "data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json",
  "data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag35c-manual-auth-role-confirmation.json",
  "data/content-intelligence/backend-architecture/ag35c-manual-auth-role-confirmation.json",
  "data/content-intelligence/backend-architecture/ag35c-manual-auth-role-result-record.json",
  "data/content-intelligence/backend-architecture/ag35c-admin-editor-role-verification-record.json",
  "data/content-intelligence/quality-registry/ag35c-backend-activation-audit-confirmed-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag35c-confirmed-to-ag35d-backend-activation-audit-boundary.json",
  "data/quality/ag35c-manual-auth-role-confirmation.json",
  "data/quality/ag35c-manual-auth-role-confirmation-preview.json",
  "docs/quality/AG35C_MANUAL_AUTH_ROLE_CONFIRMATION.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const confirmation = readJson("data/content-intelligence/backend-architecture/ag35c-manual-auth-role-confirmation.json");
const result = readJson("data/content-intelligence/backend-architecture/ag35c-manual-auth-role-result-record.json");
const roleVerification = readJson("data/content-intelligence/backend-architecture/ag35c-admin-editor-role-verification-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag35c-backend-activation-audit-confirmed-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag35c-confirmed-to-ag35d-backend-activation-audit-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag35c-manual-auth-role-confirmation.json");
const preview = readJson("data/quality/ag35c-manual-auth-role-confirmation-preview.json");
const pkg = readJson("package.json");

const ag35cPackage = readJson("data/content-intelligence/backend-architecture/ag35c-auth-role-setup-package.json");
const ag35b = readJson("data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json");
const ag35a = readJson("data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");

if (confirmation.status !== "manual_auth_role_setup_confirmed_ready_for_ag35d") fail("Confirmation status mismatch.");
if (confirmation.confirmation_decision.manual_auth_user_setup_confirmed !== true) fail("Manual Auth user setup must be confirmed.");
if (confirmation.confirmation_decision.manual_role_mapping_sql_confirmed !== true) fail("Manual role mapping SQL must be confirmed.");
if (confirmation.confirmation_decision.admin_profile_confirmed !== true) fail("Admin profile must be confirmed.");
if (confirmation.confirmation_decision.editor_profile_confirmed !== true) fail("Editor profile must be confirmed.");
if (confirmation.confirmation_decision.proceed_to_ag35d_backend_activation_audit !== true) fail("AG35D readiness missing.");

for (const flag of [
  "passwords_recorded_in_repo",
  "credentials_recorded_in_repo",
  "secrets_recorded_in_repo",
  "env_vars_recorded_in_repo",
  "service_role_key_recorded_in_repo",
  "service_role_key_exposed",
  "deployment_done",
  "public_mutation_done"
]) {
  if (confirmation.confirmation_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (result.admin_result.email !== ADMIN_EMAIL || result.admin_result.role !== "admin" || result.admin_result.is_active !== true) {
  fail("Admin result mismatch.");
}
if (result.editor_result.email !== EDITOR_EMAIL || result.editor_result.role !== "editor" || result.editor_result.is_active !== true) {
  fail("Editor result mismatch.");
}
if (result.result_contains_passwords !== false) fail("Result must not contain passwords.");
if (result.result_contains_supabase_keys !== false) fail("Result must not contain Supabase keys.");
if (result.result_contains_service_role_key !== false) fail("Result must not contain service role key.");

if (roleVerification.all_role_checks_passed !== true) fail("Role checks must pass.");
for (const row of roleVerification.verified_roles) {
  if (row.verification_passed !== true) fail(`Role verification failed for ${row.email}`);
}

if (readiness.ready_for_ag35d !== true) fail("AG35D readiness missing.");
if (readiness.allowed_ag35d_mode !== "backend_activation_audit_after_schema_and_auth_role_confirmation") {
  fail("AG35D mode mismatch.");
}
if (readiness.manual_schema_apply_confirmed !== true) fail("Schema confirmation missing.");
if (readiness.manual_auth_role_setup_confirmed !== true) fail("Auth role confirmation missing.");
if (readiness.admin_profile_confirmed !== true) fail("Admin profile readiness missing.");
if (readiness.editor_profile_confirmed !== true) fail("Editor profile readiness missing.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");

if (boundary.next_stage_id !== "AG35D") fail("Boundary must point to AG35D.");
if (boundary.manual_auth_role_setup_confirmed !== true) fail("Boundary confirmation missing.");
if (boundary.controlled_activation_selected !== true) fail("Controlled activation boundary missing.");

if (review.summary.admin_email !== ADMIN_EMAIL) fail("Review admin email mismatch.");
if (review.summary.admin_role !== "admin") fail("Review admin role mismatch.");
if (review.summary.admin_is_active !== true) fail("Review admin active mismatch.");
if (review.summary.editor_email !== EDITOR_EMAIL) fail("Review editor email mismatch.");
if (review.summary.editor_role !== "editor") fail("Review editor role mismatch.");
if (review.summary.editor_is_active !== true) fail("Review editor active mismatch.");
if (review.summary.ready_for_ag35d !== true) fail("Review AG35D readiness missing.");

if (preview.ready_for_ag35d !== 1) fail("Preview AG35D readiness missing.");
if (preview.admin_role !== "admin") fail("Preview admin role mismatch.");
if (preview.editor_role !== "editor") fail("Preview editor role mismatch.");
if (preview.service_role_key_exposed !== 0) fail("Preview service role exposure must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");

if (ag35cPackage.selected_test_users.admin_test_email !== ADMIN_EMAIL) fail("AG35C package admin email mismatch.");
if (ag35cPackage.selected_test_users.editor_test_email !== EDITOR_EMAIL) fail("AG35C package editor email mismatch.");
if (ag35b.status !== "manual_schema_apply_confirmed_ready_for_ag35c") fail("AG35B confirmation source mismatch.");
if (ag35a.approval_decision.controlled_activation_authorized !== true) fail("AG35A approval source mismatch.");

if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (!pkg.scripts?.["generate:ag35c-confirm"]) fail("Missing generate:ag35c-confirm script.");
if (!pkg.scripts?.["validate:ag35c-confirm"]) fail("Missing validate:ag35c-confirm script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag35c-confirm")) {
  fail("validate:project must include validate:ag35c-confirm.");
}

pass("AG35C manual Auth role confirmation is present.");
pass("Admin and Editor role rows are recorded correctly.");
pass("AG35D Backend Activation Audit confirmed readiness is valid.");
pass("No passwords, credentials, secrets, service-role keys, deployment or public mutation are recorded.");
