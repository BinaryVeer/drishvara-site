import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function fail(msg) {
  console.error(`❌ AG36D validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag36a-confirm-admin-login-success.json",
  "data/content-intelligence/backend-architecture/ag36b-confirm-editor-login-success.json",
  "data/content-intelligence/backend-architecture/ag36c-confirm-role-restriction-test.json",
  "data/content-intelligence/quality-registry/ag36c-login-security-audit-readiness-record.json",

  "data/content-intelligence/quality-reviews/ag36d-login-security-audit.json",
  "data/content-intelligence/backend-architecture/ag36d-login-security-audit.json",
  "data/content-intelligence/backend-architecture/ag36d-session-handling-audit-register.json",
  "data/content-intelligence/backend-architecture/ag36d-route-guard-security-audit-register.json",
  "data/content-intelligence/backend-architecture/ag36d-secret-and-local-config-audit-register.json",
  "data/content-intelligence/backend-architecture/ag36d-runtime-action-blocker-audit-register.json",
  "data/content-intelligence/quality-registry/ag36d-login-security-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag36d-login-live-test-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag36d-to-ag36z-login-live-test-closure-boundary.json",
  "data/quality/ag36d-login-security-audit.json",
  "data/quality/ag36d-login-security-audit-preview.json",
  "docs/quality/AG36D_LOGIN_SECURITY_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const audit = readJson("data/content-intelligence/backend-architecture/ag36d-login-security-audit.json");
const sessionAudit = readJson("data/content-intelligence/backend-architecture/ag36d-session-handling-audit-register.json");
const routeGuardAudit = readJson("data/content-intelligence/backend-architecture/ag36d-route-guard-security-audit-register.json");
const secretAudit = readJson("data/content-intelligence/backend-architecture/ag36d-secret-and-local-config-audit-register.json");
const runtimeAudit = readJson("data/content-intelligence/backend-architecture/ag36d-runtime-action-blocker-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag36d-login-live-test-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag36d-to-ag36z-login-live-test-closure-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag36d-login-security-audit.json");
const preview = readJson("data/quality/ag36d-login-security-audit-preview.json");
const pkg = readJson("package.json");

for (const item of [sessionAudit, routeGuardAudit, secretAudit, runtimeAudit]) {
  if (item.audit_passed !== true) fail(`${item.title} must pass.`);
  for (const check of item.checks) {
    if (check.passed !== true) fail(`${item.title} check failed: ${check.check_id}`);
  }
}

if (audit.status !== "login_security_audit_created_ready_for_ag36z") fail("Audit status mismatch.");
if (audit.audit_decision.all_audits_passed !== true) fail("All audits must pass.");
if (audit.audit_decision.proceed_to_ag36z_login_live_test_closure !== true) fail("AG36Z readiness missing.");

for (const flag of [
  "password_recorded",
  "token_recorded",
  "cookie_recorded",
  "supabase_key_recorded",
  "service_role_key_recorded",
  "service_role_key_exposed",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_created",
  "publish_action_executed"
]) {
  if (audit.audit_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (readiness.ready_for_ag36z !== true) fail("AG36Z readiness missing.");
if (readiness.next_stage_id !== "AG36Z") fail("Next stage must be AG36Z.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.dynamic_publish_runtime_allowed_next !== false) fail("Dynamic runtime must remain false.");

if (boundary.next_stage_id !== "AG36Z") fail("Boundary must point to AG36Z.");
if (review.summary.ready_for_ag36z !== true) fail("Review AG36Z readiness missing.");
if (preview.ready_for_ag36z !== 1) fail("Preview AG36Z readiness missing.");
if (preview.password_recorded !== 0) fail("Preview password must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");

if (!pkg.scripts?.["generate:ag36d"]) fail("Missing generate:ag36d script.");
if (!pkg.scripts?.["validate:ag36d"]) fail("Missing validate:ag36d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag36d")) {
  fail("validate:project must include validate:ag36d.");
}

pass("AG36D Login Security Audit is present.");
pass("Session, route guard, secret safety and runtime blocker audits are valid.");
pass("AG36Z Login Live Test Closure readiness is valid.");
pass("No password, token, key, deployment, public mutation or publish action is recorded.");
