import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ADMIN_EMAIL = "dwivedi.vikash.vaibhav@gmail.com";
const EDITOR_EMAIL = "vikash4world@gmail.com";

const inputs = {
  ag36cR1Package: "data/content-intelligence/backend-architecture/ag36c-r1-route-guard-wiring-package.json",
  ag36cR1GuardRecord: "data/content-intelligence/backend-architecture/ag36c-r1-admin-editor-route-guard-record.json",
  ag36cR1Readiness: "data/content-intelligence/quality-registry/ag36c-r1-role-restriction-manual-test-readiness-record.json",
  ag36bConfirmation: "data/content-intelligence/backend-architecture/ag36b-confirm-editor-login-success.json",
  ag36bRights: "data/content-intelligence/backend-architecture/ag36b-editor-rights-verification-record.json",
  ag36bReadiness: "data/content-intelligence/quality-registry/ag36b-role-restriction-test-readiness-record.json",
  ag36aConfirmation: "data/content-intelligence/backend-architecture/ag36a-confirm-admin-login-success.json",
  ag35zClosure: "data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag36c-confirm-role-restriction-test.json",
  confirmation: "data/content-intelligence/backend-architecture/ag36c-confirm-role-restriction-test.json",
  resultRecord: "data/content-intelligence/backend-architecture/ag36c-role-restriction-test-result-record.json",
  adminAccessRecord: "data/content-intelligence/backend-architecture/ag36c-admin-route-access-verification-record.json",
  editorBlockRecord: "data/content-intelligence/backend-architecture/ag36c-editor-admin-route-block-verification-record.json",
  blocker: "data/content-intelligence/quality-registry/ag36c-role-restriction-confirmation-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag36c-login-security-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag36c-confirmed-to-ag36d-login-security-audit-boundary.json",
  registry: "data/quality/ag36c-confirm-role-restriction-test.json",
  preview: "data/quality/ag36c-confirm-role-restriction-test-preview.json",
  doc: "docs/quality/AG36C_CONFIRM_ROLE_RESTRICTION_TEST.md"
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
  if (!exists(p)) throw new Error(`Missing AG36C confirmation input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag36cR1Package.status !== "route_guard_wiring_created_ready_for_manual_role_restriction_test") {
  throw new Error("AG36C-R1 package status mismatch.");
}
if (records.ag36cR1Readiness.ready_for_manual_role_restriction_test !== true) {
  throw new Error("AG36C-R1 manual role restriction readiness missing.");
}
if (records.ag36bConfirmation.status !== "editor_login_confirmed_ready_for_role_restriction_test") {
  throw new Error("AG36B confirmation status mismatch.");
}
if (records.ag36bReadiness.ready_for_ag36c !== true) {
  throw new Error("AG36B readiness does not permit AG36C.");
}
if (records.ag36aConfirmation.status !== "admin_login_confirmed_ready_for_editor_login_test") {
  throw new Error("AG36A confirmation status mismatch.");
}
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) {
  throw new Error("Editor assigned-only rule missing.");
}
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) {
  throw new Error("Editor no-publish rule missing.");
}
if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) {
  throw new Error("Admin final clearance rule missing.");
}

const blockedState = {
  role_restriction_test_confirmed: true,
  editor_admin_dashboard_blocked: true,
  admin_admin_dashboard_allowed: true,
  route_guard_operational: true,
  ready_for_ag36d_login_security_audit: true,

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
  admin_action_bypassed: false
};

const editorBlockRecord = {
  module_id: "AG36C-CONFIRM",
  title: "Editor Admin Route Block Verification Record",
  status: "editor_blocked_from_admin_dashboard",
  operator_reported_result: "Editor cannot access Admin dashboard.",
  tested_user_email: EDITOR_EMAIL,
  tested_user_role: "editor",
  tested_route: "admin-dashboard.html",
  expected_result: "blocked",
  observed_result: "blocked",
  observed_message: "Logged-in user vikash4world@gmail.com is not permitted to access this admin route.",
  required_role_observed: "admin",
  verification_passed: true,
  blocked_state: blockedState
};

const adminAccessRecord = {
  module_id: "AG36C-CONFIRM",
  title: "Admin Route Access Verification Record",
  status: "admin_allowed_to_access_admin_dashboard",
  operator_reported_result: "Admin can access Admin dashboard.",
  tested_user_email: ADMIN_EMAIL,
  tested_user_role: "admin",
  tested_route: "admin-dashboard.html",
  expected_result: "allowed",
  observed_result: "allowed",
  observed_surface: "Admin Review Queue",
  verification_passed: true,
  blocked_state: blockedState
};

const resultRecord = {
  module_id: "AG36C-CONFIRM",
  title: "Role Restriction Test Result Record",
  status: "role_restriction_test_passed",
  test_results: [
    {
      test_id: "editor_admin_dashboard_block",
      passed: true,
      expected: "Editor cannot access Admin dashboard.",
      observed: "Editor blocked from admin route."
    },
    {
      test_id: "admin_admin_dashboard_access",
      passed: true,
      expected: "Admin can access Admin dashboard.",
      observed: "Admin Review Queue opened."
    }
  ],
  all_role_restriction_checks_passed: true,
  result_contains_password: false,
  result_contains_token: false,
  result_contains_cookie: false,
  result_contains_supabase_key: false,
  result_contains_service_role_key: false,
  blocked_state: blockedState
};

const confirmation = {
  module_id: "AG36C-CONFIRM",
  title: "Role Restriction Test Confirmation",
  status: "role_restriction_test_confirmed_ready_for_login_security_audit",
  purpose:
    "Record manual confirmation that the Editor is blocked from the Admin dashboard and Admin can access the Admin dashboard after AG36C-R1 route guard wiring.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  confirmation_decision: {
    role_restriction_test_confirmed: true,
    editor_admin_dashboard_blocked: true,
    admin_admin_dashboard_allowed: true,
    route_guard_operational: true,
    proceed_to_ag36d_login_security_audit: true,

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
    publish_action_executed: false,
    admin_action_bypassed: false
  },
  result_record_file: outputs.resultRecord,
  admin_access_record_file: outputs.adminAccessRecord,
  editor_block_record_file: outputs.editorBlockRecord,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG36C-CONFIRM",
  title: "Role Restriction Confirmation Blocker Register",
  status: "role_restriction_confirmed_runtime_actions_still_blocked",
  blocked_items: [
    "No password in repo/chat.",
    "No token/cookie in repo/chat.",
    "No Supabase key in repo/chat.",
    "No service-role key exposure.",
    "No deployment.",
    "No public mutation.",
    "No publish action execution.",
    "No Admin review bypass.",
    "No dynamic publish runtime."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG36C-CONFIRM",
  title: "Login Security Audit Readiness Record",
  status: "ready_for_ag36d_login_security_audit",
  ready_for_ag36d: true,
  next_stage_id: "AG36D",
  next_stage_title: "Login Security Audit",
  admin_email: ADMIN_EMAIL,
  editor_email: EDITOR_EMAIL,
  admin_login_confirmed: true,
  editor_login_confirmed: true,
  role_restriction_test_confirmed: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  dynamic_publish_runtime_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG36C-CONFIRM",
  title: "AG36C Confirmed to AG36D Login Security Audit Boundary",
  status: "ag36d_login_security_audit_boundary_confirmed",
  next_stage_id: "AG36D",
  next_stage_title: "Login Security Audit",
  allowed_scope: [
    "Audit login security, session handling and route guard behaviour.",
    "Confirm no passwords, tokens, cookies, Supabase keys or service-role keys are recorded.",
    "Confirm deployment, public mutation and dynamic publish runtime remain blocked."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG36C-CONFIRM",
  title: "Role Restriction Test Confirmation",
  status: "role_restriction_test_confirmed_ready_for_login_security_audit",
  depends_on: ["AG36C-R1", "AG36B-CONFIRM", "AG36A-CONFIRM", "AG35Z"],
  generated_from: inputs,
  confirmation_file: outputs.confirmation,
  result_record_file: outputs.resultRecord,
  admin_access_record_file: outputs.adminAccessRecord,
  editor_block_record_file: outputs.editorBlockRecord,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    role_restriction_test_confirmed: true,
    editor_admin_dashboard_blocked: true,
    admin_admin_dashboard_allowed: true,
    ready_for_ag36d: true,
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
    publish_action_executed: false,
    admin_action_bypassed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG36C-CONFIRM",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG36C-CONFIRM",
  preview_only: false,
  status: review.status,
  message: "Role restriction test confirmed. Ready for AG36D login security audit.",
  role_restriction_test_confirmed: 1,
  editor_admin_dashboard_blocked: 1,
  admin_admin_dashboard_allowed: 1,
  ready_for_ag36d: 1,
  password_recorded: 0,
  token_recorded: 0,
  cookie_recorded: 0,
  supabase_key_recorded: 0,
  service_role_key_exposed: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  publish_action_executed: 0,
  admin_action_bypassed: 0
};

const doc = `# AG36C — Role Restriction Test Confirmation

## Confirmed Result

AG36C role restriction test passed.

## Manual Checks

| Test | Expected | Observed | Result |
|---|---|---|---|
| Editor opens Admin dashboard | Blocked | Blocked | Passed |
| Admin opens Admin dashboard | Allowed | Admin Review Queue opened | Passed |

## Confirmed Governance

- Editor cannot access Admin dashboard.
- Admin can access Admin dashboard.
- Admin remains final clearance authority.
- Editor cannot bypass Admin review.
- Editor cannot publish.

## Boundary

No passwords, tokens, cookies, Supabase keys, service-role keys, deployment, public mutation or publish actions are recorded.

## Next

AG36D — Login Security Audit.
`;

writeJson(outputs.editorBlockRecord, editorBlockRecord);
writeJson(outputs.adminAccessRecord, adminAccessRecord);
writeJson(outputs.resultRecord, resultRecord);
writeJson(outputs.confirmation, confirmation);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG36C role restriction test confirmation generated.");
console.log("✅ Editor blocked from Admin dashboard.");
console.log("✅ Admin allowed to access Admin dashboard.");
console.log("✅ Ready for AG36D Login Security Audit.");
console.log("✅ No password, token, key, deployment, public mutation or publish action recorded.");
