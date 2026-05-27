import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ADMIN_EMAIL = "dwivedi.vikash.vaibhav@gmail.com";
const EDITOR_EMAIL = "vikash4world@gmail.com";

const inputs = {
  ag36aPackage: "data/content-intelligence/backend-architecture/ag36a-admin-login-test-package.json",
  ag36aR1Package: "data/content-intelligence/backend-architecture/ag36a-r1-admin-live-auth-wiring-package.json",
  ag36aR1Readiness: "data/content-intelligence/quality-registry/ag36a-r1-admin-live-auth-test-readiness-record.json",
  ag36bR1Package: "data/content-intelligence/backend-architecture/ag36b-r1-editor-live-auth-wiring-package.json",
  ag35zClosure: "data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json",
  ag35cRoleVerification: "data/content-intelligence/backend-architecture/ag35c-admin-editor-role-verification-record.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag36a-confirm-admin-login-success.json",
  confirmation: "data/content-intelligence/backend-architecture/ag36a-confirm-admin-login-success.json",
  resultRecord: "data/content-intelligence/backend-architecture/ag36a-admin-login-result-record.json",
  blocker: "data/content-intelligence/quality-registry/ag36a-admin-login-confirmation-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag36a-confirmed-editor-login-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag36a-confirmed-to-ag36b-manual-editor-login-test-boundary.json",
  registry: "data/quality/ag36a-confirm-admin-login-success.json",
  preview: "data/quality/ag36a-confirm-admin-login-success-preview.json",
  doc: "docs/quality/AG36A_CONFIRM_ADMIN_LOGIN_SUCCESS.md"
};

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(full(p), "utf8"));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG36A confirmation input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag36aPackage.status !== "admin_login_test_package_created_pending_manual_admin_login_result") {
  throw new Error("AG36A package status mismatch.");
}
if (records.ag36aR1Package.status !== "admin_live_auth_wiring_package_created_pending_manual_config_and_test") {
  throw new Error("AG36A-R1 package status mismatch.");
}
if (records.ag36bR1Package.status !== "editor_live_auth_wiring_package_created_pending_manual_config_and_test") {
  throw new Error("AG36B-R1 package status mismatch.");
}
if (records.ag35zClosure.status !== "backend_auth_activation_closure_created_ready_for_ag36a") {
  throw new Error("AG35Z closure status mismatch.");
}
if (records.ag35cRoleVerification.all_role_checks_passed !== true) {
  throw new Error("AG35C role verification must pass.");
}

const blockedState = {
  admin_login_confirmed: true,
  admin_protected_page_opened: true,
  editor_login_test_ready: true,

  password_recorded: false,
  auth_token_recorded: false,
  cookie_recorded: false,
  supabase_url_recorded: false,
  supabase_anon_key_recorded: false,
  supabase_service_role_key_recorded: false,
  supabase_service_role_key_exposed: false,
  env_vars_recorded: false,
  deployment_triggered: false,
  public_mutation_done: false,
  dynamic_publish_runtime_created: false,
  publish_action_executed: false,
  archive_action_executed: false,
  return_action_executed: false
};

const resultRecord = {
  module_id: "AG36A-CONFIRM",
  title: "Admin Login Result Record",
  status: "admin_login_success_admin_protected_page_opened",
  operator_reported_result: "Admin login successful; Admin protected page opened.",
  observed_surface: "Admin Review Queue",
  admin_email: ADMIN_EMAIL,
  admin_role_expected: "admin",
  protected_page_opened: true,
  action_buttons_not_to_be_used_now: true,
  result_contains_password: false,
  result_contains_token: false,
  result_contains_cookie: false,
  result_contains_supabase_key: false,
  result_contains_service_role_key: false,
  blocked_state: blockedState
};

const confirmation = {
  module_id: "AG36A-CONFIRM",
  title: "Admin Login Success Confirmation",
  status: "admin_login_confirmed_ready_for_editor_login_test",
  purpose:
    "Record manual confirmation that Admin login succeeded and the Admin protected page opened after AG36A-R1 local Supabase Auth wiring.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  confirmation_decision: {
    admin_login_success_confirmed: true,
    admin_protected_page_opened: true,
    proceed_to_editor_login_test: true,

    password_recorded_in_repo: false,
    token_recorded_in_repo: false,
    cookie_recorded_in_repo: false,
    supabase_key_recorded_in_repo: false,
    service_role_key_recorded_in_repo: false,
    service_role_key_exposed: false,
    env_vars_recorded_in_repo: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_created: false,
    publish_action_executed: false
  },
  result_record_file: outputs.resultRecord,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG36A-CONFIRM",
  title: "Admin Login Confirmation Blocker Register",
  status: "admin_login_confirmed_runtime_actions_still_blocked",
  blocked_items: [
    "No password in repo/chat.",
    "No token/cookie in repo/chat.",
    "No Supabase key in repo/chat.",
    "No service-role key exposure.",
    "No deployment.",
    "No public mutation.",
    "No publish/archive/return action execution.",
    "No dynamic publish runtime."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG36A-CONFIRM",
  title: "Editor Login Test Readiness Record",
  status: "ready_for_manual_editor_login_test",
  ready_for_manual_editor_login_test: true,
  next_stage_id: "AG36B-CONFIRM",
  next_stage_title: "Manual Editor Login Confirmation",
  editor_email: EDITOR_EMAIL,
  admin_login_confirmed: true,
  editor_login_wiring_present: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  dynamic_publish_runtime_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG36A-CONFIRM",
  title: "AG36A Confirmed to AG36B Manual Editor Login Test Boundary",
  status: "editor_login_test_boundary_confirmed",
  next_stage_id: "AG36B-CONFIRM",
  next_stage_title: "Manual Editor Login Confirmation",
  allowed_scope: [
    "Test Editor login in browser.",
    "Confirm Editor protected page/workspace opens.",
    "Record only success/error status.",
    "Do not record password, token, cookie, Supabase key, service-role key or secret-bearing URL."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG36A-CONFIRM",
  title: "Admin Login Success Confirmation",
  status: "admin_login_confirmed_ready_for_editor_login_test",
  depends_on: ["AG36A", "AG36A-R1", "AG36B-R1", "AG35Z"],
  generated_from: inputs,
  confirmation_file: outputs.confirmation,
  result_record_file: outputs.resultRecord,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    admin_login_success_confirmed: true,
    admin_protected_page_opened: true,
    ready_for_manual_editor_login_test: true,
    admin_email: ADMIN_EMAIL,
    editor_email: EDITOR_EMAIL,

    password_recorded: false,
    token_recorded: false,
    cookie_recorded: false,
    supabase_key_recorded: false,
    service_role_key_exposed: false,
    env_vars_recorded: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_created: false,
    publish_action_executed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG36A-CONFIRM",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG36A-CONFIRM",
  preview_only: false,
  status: review.status,
  message: "Admin login confirmed. Ready for Editor login test.",
  admin_login_success_confirmed: 1,
  admin_protected_page_opened: 1,
  ready_for_manual_editor_login_test: 1,
  password_recorded: 0,
  token_recorded: 0,
  cookie_recorded: 0,
  supabase_key_recorded: 0,
  service_role_key_exposed: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  publish_action_executed: 0
};

const doc = `# AG36A — Admin Login Success Confirmation

## Confirmed Result

Admin login succeeded and the Admin protected page opened.

## Observed Surface

Admin Review Queue.

## Boundary

No passwords, tokens, cookies, Supabase keys, service-role keys, deployment, public mutation or publish actions are recorded.

## Next

AG36B-CONFIRM — Manual Editor Login Confirmation.
`;

writeJson(outputs.resultRecord, resultRecord);
writeJson(outputs.confirmation, confirmation);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG36A Admin login success confirmation generated.");
console.log("✅ Admin protected page opened.");
console.log("✅ Ready for manual Editor login test.");
console.log("✅ No password, token, key, deployment, public mutation or publish action recorded.");
