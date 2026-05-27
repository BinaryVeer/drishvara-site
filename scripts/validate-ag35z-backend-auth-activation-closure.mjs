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
  console.error(`❌ AG35Z validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json",
  "data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json",
  "data/content-intelligence/backend-architecture/ag35c-manual-auth-role-confirmation.json",
  "data/content-intelligence/backend-architecture/ag35d-backend-activation-audit.json",
  "data/content-intelligence/quality-registry/ag35d-backend-auth-activation-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag35d-to-ag35z-backend-auth-activation-closure-boundary.json",
  "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  "data/content-intelligence/quality-reviews/ag35z-backend-auth-activation-closure.json",
  "data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json",
  "data/content-intelligence/backend-architecture/ag35z-activation-chain-register.json",
  "data/content-intelligence/backend-architecture/ag35z-backend-auth-closure-register.json",
  "data/content-intelligence/backend-architecture/ag35z-ag36-login-live-test-handoff-plan.json",
  "data/content-intelligence/backend-architecture/ag35z-post-activation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag35z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag35z-backend-auth-activation-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag35z-ag36-admin-login-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag35z-to-ag36a-admin-login-test-boundary.json",
  "data/quality/ag35z-backend-auth-activation-closure.json",
  "data/quality/ag35z-backend-auth-activation-closure-preview.json",
  "docs/quality/AG35Z_BACKEND_AUTH_ACTIVATION_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag35z-backend-auth-activation-closure.json");
const closure = readJson("data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json");
const chain = readJson("data/content-intelligence/backend-architecture/ag35z-activation-chain-register.json");
const closureRegister = readJson("data/content-intelligence/backend-architecture/ag35z-backend-auth-closure-register.json");
const handoff = readJson("data/content-intelligence/backend-architecture/ag35z-ag36-login-live-test-handoff-plan.json");
const activationBlocker = readJson("data/content-intelligence/backend-architecture/ag35z-post-activation-blocker-carry-forward.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag35z-ag36-admin-login-test-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag35z-to-ag36a-admin-login-test-boundary.json");
const registry = readJson("data/quality/ag35z-backend-auth-activation-closure.json");
const preview = readJson("data/quality/ag35z-backend-auth-activation-closure-preview.json");

const ag35a = readJson("data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json");
const ag35b = readJson("data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json");
const ag35c = readJson("data/content-intelligence/backend-architecture/ag35c-manual-auth-role-confirmation.json");
const ag35d = readJson("data/content-intelligence/backend-architecture/ag35d-backend-activation-audit.json");
const ag35dReadiness = readJson("data/content-intelligence/quality-registry/ag35d-backend-auth-activation-closure-readiness-record.json");
const ag35dBoundary = readJson("data/content-intelligence/mutation-plans/ag35d-to-ag35z-backend-auth-activation-closure-boundary.json");
const ag26zRole = readJson("data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json");
const pkg = readJson("package.json");

if (review.status !== "backend_auth_activation_closure_created_ready_for_ag36a") fail("Review status mismatch.");
if (closure.status !== "backend_auth_activation_closure_created_ready_for_ag36a") fail("Closure status mismatch.");
if (closure.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (closure.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");

if (closure.closure_decision.ag35_activation_chain_closed !== true) fail("AG35 chain closure missing.");
if (closure.closure_decision.backend_auth_activation_closed !== true) fail("Backend/Auth closure missing.");
if (closure.closure_decision.ready_for_ag36a_admin_login_test !== true) fail("AG36A readiness missing.");

for (const flag of [
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_created",
  "publish_handler_enabled",
  "service_role_key_recorded",
  "service_role_key_exposed",
  "passwords_recorded",
  "credentials_recorded",
  "secrets_recorded"
]) {
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (chain.chain_length !== 4) fail("AG35 chain length must be 4.");
for (const stage of ["AG35A", "AG35B", "AG35C", "AG35D"]) {
  if (!chain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage ${stage}.`);
}
if (chain.closed_successfully !== true) fail("Chain must be closed successfully.");

for (const [key, value] of Object.entries(closureRegister.closure_points)) {
  if (value !== true) fail(`Closure point must be true: ${key}`);
}

if (!handoff.ag36_sequence.includes("AG36A — Admin Login Test")) fail("AG36A sequence missing.");
if (!handoff.ag36_sequence.includes("AG36B — Editor Login Test")) fail("AG36B sequence missing.");

for (const [key, value] of Object.entries(activationBlocker.blocked_items)) {
  if (value !== false) fail(`Activation blocker must remain false: ${key}`);
}

if (readiness.ready_for_ag36a !== true) fail("AG36A readiness missing.");
if (readiness.allowed_ag36a_mode !== "admin_login_test_without_secret_recording") fail("AG36A mode mismatch.");
if (readiness.backend_auth_activation_closed !== true) fail("Backend/Auth activation closed flag missing.");
if (readiness.admin_profile_confirmed !== true) fail("Admin profile confirmation missing.");
if (readiness.editor_profile_confirmed !== true) fail("Editor profile confirmation missing.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.dynamic_publish_runtime_allowed_next !== false) fail("Dynamic publish runtime must remain false.");

if (boundary.next_stage_id !== "AG36A") fail("Boundary must point to AG36A.");
if (boundary.backend_auth_activation_closed !== true) fail("Boundary backend/Auth closure missing.");
if (boundary.controlled_activation_selected !== true) fail("Controlled activation boundary missing.");

if (review.summary.ready_for_ag36a !== true) fail("Review AG36A readiness missing.");
if (review.summary.admin_email !== ADMIN_EMAIL) fail("Review Admin email mismatch.");
if (review.summary.editor_email !== EDITOR_EMAIL) fail("Review Editor email mismatch.");
if (review.summary.deployment_done !== false) fail("Review deployment must be false.");
if (review.summary.public_mutation_done !== false) fail("Review public mutation must be false.");
if (review.summary.dynamic_publish_runtime_created !== false) fail("Review dynamic runtime must be false.");
if (review.summary.service_role_key_exposed !== false) fail("Review service-role exposure must be false.");

if (ag35a.approval_decision.controlled_activation_authorized !== true) fail("AG35A controlled activation source missing.");
if (ag35b.status !== "manual_schema_apply_confirmed_ready_for_ag35c") fail("AG35B source mismatch.");
if (ag35c.status !== "manual_auth_role_setup_confirmed_ready_for_ag35d") fail("AG35C source mismatch.");
if (ag35d.status !== "backend_activation_audit_created_ready_for_ag35z") fail("AG35D source mismatch.");
if (ag35d.audit_decision.all_audits_passed !== true) fail("AG35D all audits source missing.");
if (ag35dReadiness.ready_for_ag35z !== true) fail("AG35D readiness source missing.");
if (ag35dBoundary.next_stage_id !== "AG35Z") fail("AG35D boundary source mismatch.");

if (ag26zRole.role_rules.admin_final_clearance_authority !== true) fail("Admin final clearance missing.");
if (ag26zRole.role_rules.editor_can_only_work_on_admin_assigned_items !== true) fail("Editor assigned-only missing.");
if (ag26zRole.role_rules.editor_cannot_publish !== true) fail("Editor cannot publish missing.");

if (registry.status !== "backend_auth_activation_closure_created_ready_for_ag36a") fail("Registry status mismatch.");
if (preview.ready_for_ag36a !== 1) fail("Preview AG36A readiness missing.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.dynamic_publish_runtime_created !== 0) fail("Preview dynamic runtime must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag35z"]) fail("Missing generate:ag35z script.");
if (!pkg.scripts?.["validate:ag35z"]) fail("Missing validate:ag35z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag35z")) {
  fail("validate:project must include validate:ag35z.");
}

pass("AG35Z Backend/Auth Activation Closure is present.");
pass("AG35 activation chain is closed.");
pass("AG36A Admin Login Test readiness is valid.");
pass("Deployment, public mutation, dynamic publish runtime and service-role exposure remain blocked.");
