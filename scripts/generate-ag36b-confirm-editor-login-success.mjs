import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ADMIN_EMAIL = "dwivedi.vikash.vaibhav@gmail.com";
const EDITOR_EMAIL = "vikash4world@gmail.com";

const inputs = {
  ag36aConfirmation: "data/content-intelligence/backend-architecture/ag36a-confirm-admin-login-success.json",
  ag36aResult: "data/content-intelligence/backend-architecture/ag36a-admin-login-result-record.json",
  ag36aEditorReadiness: "data/content-intelligence/quality-registry/ag36a-confirmed-editor-login-test-readiness-record.json",
  ag36bR1Package: "data/content-intelligence/backend-architecture/ag36b-r1-editor-live-auth-wiring-package.json",
  ag36bR1Readiness: "data/content-intelligence/quality-registry/ag36b-r1-editor-live-auth-test-readiness-record.json",
  ag35zClosure: "data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json",
  ag35cRoleVerification: "data/content-intelligence/backend-architecture/ag35c-admin-editor-role-verification-record.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag36b-confirm-editor-login-success.json",
  confirmation: "data/content-intelligence/backend-architecture/ag36b-confirm-editor-login-success.json",
  resultRecord: "data/content-intelligence/backend-architecture/ag36b-editor-login-result-record.json",
  rightsVerification: "data/content-intelligence/backend-architecture/ag36b-editor-rights-verification-record.json",
  blocker: "data/content-intelligence/quality-registry/ag36b-editor-login-confirmation-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag36b-role-restriction-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag36b-confirmed-to-ag36c-role-restriction-test-boundary.json",
  registry: "data/quality/ag36b-confirm-editor-login-success.json",
  preview: "data/quality/ag36b-confirm-editor-login-success-preview.json",
  doc: "docs/quality/AG36B_CONFIRM_EDITOR_LOGIN_SUCCESS.md"
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
  if (!exists(p)) throw new Error(`Missing AG36B confirmation input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag36aConfirmation.status !== "admin_login_confirmed_ready_for_editor_login_test") {
  throw new Error("AG36A confirmation status mismatch.");
}
if (records.ag36aEditorReadiness.ready_for_manual_editor_login_test !== true) {
  throw new Error("AG36A editor login readiness missing.");
}
if (records.ag36bR1Package.status !== "editor_live_auth_wiring_package_created_pending_manual_config_and_test") {
  throw new Error("AG36B-R1 package status mismatch.");
}
if (records.ag36bR1Readiness.ready_for_manual_editor_login_test !== true) {
  throw new Error("AG36B-R1 manual editor login readiness missing.");
}
if (records.ag35zClosure.status !== "backend_auth_activation_closure_created_ready_for_ag36a") {
  throw new Error("AG35Z closure status mismatch.");
}
if (records.ag35cRoleVerification.all_role_checks_passed !== true) {
  throw new Error("AG35C role verification must pass.");
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
  editor_login_confirmed: true,
  editor_protected_page_opened: true,
  editor_rights_surface_observed: true,
  role_restriction_test_ready: true,

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
  return_action_executed: false,
  admin_action_bypassed: false
};

const resultRecord = {
  module_id: "AG36B-CONFIRM",
  title: "Editor Login Result Record",
  status: "editor_login_success_editor_protected_page_opened",
  operator_reported_result: "Editor login successful; Editor protected page opened.",
  observed_surface: "Editor Dashboard",
  editor_email: EDITOR_EMAIL,
  editor_role_expected: "editor",
  protected_page_opened: true,
  result_contains_password: false,
  result_contains_token: false,
  result_contains_cookie: false,
  result_contains_supabase_key: false,
  result_contains_service_role_key: false,
  blocked_state: blockedState
};

const rightsVerification = {
  module_id: "AG36B-CONFIRM",
  title: "Editor Rights Verification Record",
  status: "editor_rights_surface_observed_ready_for_ag36c",
  observed_allowed_rights: [
    "Create manual article",
    "Save draft",
    "Edit returned article",
    "Preview",
    "Submit to Admin",
    "Resubmit to Admin"
  ],
  observed_blocked_rights: [
    "Publish",
    "Publish and close",
    "Approve public visibility",
    "Bypass Admin review"
  ],
  governance_confirmed: {
    editor_assigned_only: true,
    editor_cannot_publish: true,
    editor_cannot_bypass_admin_review: true,
    admin_final_clearance_authority: true
  },
  role_restriction_test_still_required: true,
  blocked_state: blockedState
};

const confirmation = {
  module_id: "AG36B-CONFIRM",
  title: "Editor Login Success Confirmation",
  status: "editor_login_confirmed_ready_for_role_restriction_test",
  purpose:
    "Record manual confirmation that Editor login succeeded and the Editor protected dashboard opened after AG36B-R1 local Supabase Auth wiring.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  confirmation_decision: {
    editor_login_success_confirmed: true,
    editor_protected_page_opened: true,
    editor_rights_surface_observed: true,
    proceed_to_ag36c_role_restriction_test: true,

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
  rights_verification_file: outputs.rightsVerification,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG36B-CONFIRM",
  title: "Editor Login Confirmation Blocker Register",
  status: "editor_login_confirmed_runtime_actions_still_blocked",
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
  module_id: "AG36B-CONFIRM",
  title: "Role Restriction Test Readiness Record",
  status: "ready_for_ag36c_role_restriction_test",
  ready_for_ag36c: true,
  next_stage_id: "AG36C",
  next_stage_title: "Role Restriction Test",
  admin_email: ADMIN_EMAIL,
  editor_email: EDITOR_EMAIL,
  admin_login_confirmed: true,
  editor_login_confirmed: true,
  editor_rights_surface_observed: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  dynamic_publish_runtime_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG36B-CONFIRM",
  title: "AG36B Confirmed to AG36C Role Restriction Test Boundary",
  status: "ag36c_role_restriction_test_boundary_confirmed",
  next_stage_id: "AG36C",
  next_stage_title: "Role Restriction Test",
  allowed_scope: [
    "Test that Editor cannot perform Admin-only actions.",
    "Test that Editor cannot publish.",
    "Test that Editor cannot bypass Admin review.",
    "Record only safe success/error observations.",
    "Do not record password, token, cookie, Supabase key, service-role key or secret-bearing URL."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG36B-CONFIRM",
  title: "Editor Login Success Confirmation",
  status: "editor_login_confirmed_ready_for_role_restriction_test",
  depends_on: ["AG36A-CONFIRM", "AG36B-R1", "AG35Z", "AG26Z"],
  generated_from: inputs,
  confirmation_file: outputs.confirmation,
  result_record_file: outputs.resultRecord,
  rights_verification_file: outputs.rightsVerification,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    editor_login_success_confirmed: true,
    editor_protected_page_opened: true,
    editor_rights_surface_observed: true,
    ready_for_ag36c: true,
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
  module_id: "AG36B-CONFIRM",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG36B-CONFIRM",
  preview_only: false,
  status: review.status,
  message: "Editor login confirmed. Ready for AG36C role restriction test.",
  editor_login_success_confirmed: 1,
  editor_protected_page_opened: 1,
  editor_rights_surface_observed: 1,
  ready_for_ag36c: 1,
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

const doc = `# AG36B — Editor Login Success Confirmation

## Confirmed Result

Editor login succeeded and the Editor protected dashboard opened.

## Observed Surface

Editor Dashboard.

## Observed Editor Rights

Allowed:

- Create manual article.
- Save draft.
- Edit returned article.
- Preview.
- Submit to Admin.
- Resubmit to Admin.

Blocked:

- Publish.
- Publish and close.
- Approve public visibility.
- Bypass Admin review.

## Boundary

No passwords, tokens, cookies, Supabase keys, service-role keys, deployment, public mutation or publish actions are recorded.

## Next

AG36C — Role Restriction Test.
`;

writeJson(outputs.resultRecord, resultRecord);
writeJson(outputs.rightsVerification, rightsVerification);
writeJson(outputs.confirmation, confirmation);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG36B Editor login success confirmation generated.");
console.log("✅ Editor protected dashboard opened.");
console.log("✅ Ready for AG36C Role Restriction Test.");
console.log("✅ No password, token, key, deployment, public mutation or publish action recorded.");
