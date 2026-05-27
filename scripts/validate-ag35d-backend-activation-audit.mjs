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
  console.error(`❌ AG35D validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag35c-manual-auth-role-confirmation.json",
  "data/content-intelligence/backend-architecture/ag35c-manual-auth-role-result-record.json",
  "data/content-intelligence/backend-architecture/ag35c-admin-editor-role-verification-record.json",
  "data/content-intelligence/quality-registry/ag35c-backend-activation-audit-confirmed-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag35c-confirmed-to-ag35d-backend-activation-audit-boundary.json",
  "data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json",
  "data/content-intelligence/backend-architecture/ag35b-schema-manifest.json",
  "data/content-intelligence/backend-architecture/ag35b-rls-manifest.json",
  "data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag35d-backend-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag35d-backend-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag35d-schema-apply-audit-register.json",
  "data/content-intelligence/backend-architecture/ag35d-auth-role-audit-register.json",
  "data/content-intelligence/backend-architecture/ag35d-rls-access-control-audit-register.json",
  "data/content-intelligence/backend-architecture/ag35d-security-non-public-mutation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag35d-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag35d-backend-activation-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag35d-backend-auth-activation-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag35d-to-ag35z-backend-auth-activation-closure-boundary.json",
  "data/quality/ag35d-backend-activation-audit.json",
  "data/quality/ag35d-backend-activation-audit-preview.json",
  "docs/quality/AG35D_BACKEND_ACTIVATION_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag35d-backend-activation-audit.json");
const audit = readJson("data/content-intelligence/backend-architecture/ag35d-backend-activation-audit.json");
const schemaAudit = readJson("data/content-intelligence/backend-architecture/ag35d-schema-apply-audit-register.json");
const authAudit = readJson("data/content-intelligence/backend-architecture/ag35d-auth-role-audit-register.json");
const rlsAudit = readJson("data/content-intelligence/backend-architecture/ag35d-rls-access-control-audit-register.json");
const securityAudit = readJson("data/content-intelligence/backend-architecture/ag35d-security-non-public-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag35d-backend-auth-activation-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag35d-to-ag35z-backend-auth-activation-closure-boundary.json");
const registry = readJson("data/quality/ag35d-backend-activation-audit.json");
const preview = readJson("data/quality/ag35d-backend-activation-audit-preview.json");

const ag35c = readJson("data/content-intelligence/backend-architecture/ag35c-manual-auth-role-confirmation.json");
const ag35cReadiness = readJson("data/content-intelligence/quality-registry/ag35c-backend-activation-audit-confirmed-readiness-record.json");
const ag35b = readJson("data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json");
const ag35a = readJson("data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "backend_activation_audit_created_ready_for_ag35z") fail("Review status mismatch.");
if (audit.status !== "backend_activation_audit_created_ready_for_ag35z") fail("Audit status mismatch.");
if (audit.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (audit.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

for (const item of [schemaAudit, authAudit, rlsAudit, securityAudit]) {
  if (item.audit_passed !== true) fail(`${item.title} must pass.`);
  for (const check of item.checks) {
    if (check.passed !== true) fail(`${item.title} check failed: ${check.check_id}`);
  }
}

if (audit.audit_decision.schema_apply_audit_passed !== true) fail("Schema audit decision missing.");
if (audit.audit_decision.auth_role_audit_passed !== true) fail("Auth role audit decision missing.");
if (audit.audit_decision.rls_access_control_audit_passed !== true) fail("RLS audit decision missing.");
if (audit.audit_decision.security_non_public_mutation_audit_passed !== true) fail("Security audit decision missing.");
if (audit.audit_decision.all_audits_passed !== true) fail("All audits must pass.");
if (audit.audit_decision.proceed_to_ag35z_backend_auth_activation_closure !== true) fail("AG35Z readiness missing.");

for (const flag of [
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_created",
  "publish_handler_enabled",
  "service_role_key_recorded",
  "service_role_key_exposed"
]) {
  if (audit.audit_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (readiness.ready_for_ag35z !== true) fail("AG35Z readiness missing.");
if (readiness.allowed_ag35z_mode !== "backend_auth_activation_closure") fail("AG35Z mode mismatch.");
if (readiness.schema_apply_confirmed !== true) fail("Schema apply confirmation missing.");
if (readiness.auth_role_setup_confirmed !== true) fail("Auth role confirmation missing.");
if (readiness.backend_activation_audit_passed !== true) fail("Backend activation audit passed flag missing.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.dynamic_publish_runtime_allowed_next !== false) fail("Dynamic publish runtime must remain false.");

if (boundary.next_stage_id !== "AG35Z") fail("Boundary must point to AG35Z.");
if (boundary.all_audits_passed !== true) fail("Boundary all audits passed missing.");

if (review.summary.admin_email !== ADMIN_EMAIL) fail("Review admin email mismatch.");
if (review.summary.editor_email !== EDITOR_EMAIL) fail("Review editor email mismatch.");
if (review.summary.all_audits_passed !== true) fail("Review all audits missing.");
if (review.summary.ready_for_ag35z !== true) fail("Review AG35Z readiness missing.");
if (review.summary.deployment_done !== false) fail("Review deployment must be false.");
if (review.summary.public_mutation_done !== false) fail("Review public mutation must be false.");
if (review.summary.dynamic_publish_runtime_created !== false) fail("Review dynamic publish runtime must be false.");
if (review.summary.service_role_key_exposed !== false) fail("Review service-role exposure must be false.");

if (ag35c.status !== "manual_auth_role_setup_confirmed_ready_for_ag35d") fail("AG35C source status mismatch.");
if (ag35cReadiness.ready_for_ag35d !== true) fail("AG35C readiness must allow AG35D.");
if (ag35b.status !== "manual_schema_apply_confirmed_ready_for_ag35c") fail("AG35B confirmation source mismatch.");
if (ag35a.approval_decision.controlled_activation_authorized !== true) fail("AG35A approval source mismatch.");

if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "backend_activation_audit_created_ready_for_ag35z") fail("Registry status mismatch.");
if (preview.ready_for_ag35z !== 1) fail("Preview AG35Z readiness missing.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.dynamic_publish_runtime_created !== 0) fail("Preview dynamic publish runtime must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag35d"]) fail("Missing generate:ag35d script.");
if (!pkg.scripts?.["validate:ag35d"]) fail("Missing validate:ag35d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag35d")) {
  fail("validate:project must include validate:ag35d.");
}

pass("AG35D Backend Activation Audit is present.");
pass("Schema apply, Auth role, RLS access-control and security audits are valid.");
pass("AG35Z Backend/Auth Activation Closure readiness is valid.");
pass("No deployment, public mutation, dynamic publish runtime or service-role exposure is recorded.");
