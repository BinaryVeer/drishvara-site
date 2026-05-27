import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ADMIN_EMAIL = "dwivedi.vikash.vaibhav@gmail.com";
const EDITOR_EMAIL = "vikash4world@gmail.com";

const inputs = {
  ag36aConfirm: "data/content-intelligence/backend-architecture/ag36a-confirm-admin-login-success.json",
  ag36aResult: "data/content-intelligence/backend-architecture/ag36a-admin-login-result-record.json",

  ag36bConfirm: "data/content-intelligence/backend-architecture/ag36b-confirm-editor-login-success.json",
  ag36bResult: "data/content-intelligence/backend-architecture/ag36b-editor-login-result-record.json",
  ag36bRights: "data/content-intelligence/backend-architecture/ag36b-editor-rights-verification-record.json",

  ag36cConfirm: "data/content-intelligence/backend-architecture/ag36c-confirm-role-restriction-test.json",
  ag36cResult: "data/content-intelligence/backend-architecture/ag36c-role-restriction-test-result-record.json",
  ag36cAdminAccess: "data/content-intelligence/backend-architecture/ag36c-admin-route-access-verification-record.json",
  ag36cEditorBlock: "data/content-intelligence/backend-architecture/ag36c-editor-admin-route-block-verification-record.json",

  ag36dAudit: "data/content-intelligence/backend-architecture/ag36d-login-security-audit.json",
  ag36dSessionAudit: "data/content-intelligence/backend-architecture/ag36d-session-handling-audit-register.json",
  ag36dRouteGuardAudit: "data/content-intelligence/backend-architecture/ag36d-route-guard-security-audit-register.json",
  ag36dSecretAudit: "data/content-intelligence/backend-architecture/ag36d-secret-and-local-config-audit-register.json",
  ag36dRuntimeAudit: "data/content-intelligence/backend-architecture/ag36d-runtime-action-blocker-audit-register.json",
  ag36dReadiness: "data/content-intelligence/quality-registry/ag36d-login-live-test-closure-readiness-record.json",
  ag36dBoundary: "data/content-intelligence/mutation-plans/ag36d-to-ag36z-login-live-test-closure-boundary.json",

  ag35zClosure: "data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag36z-login-live-test-closure.json",
  closure: "data/content-intelligence/backend-architecture/ag36z-login-live-test-closure.json",
  chainRegister: "data/content-intelligence/backend-architecture/ag36z-login-live-test-chain-register.json",
  usabilityRecord: "data/content-intelligence/backend-architecture/ag36z-admin-editor-login-usability-record.json",
  blockerCarryForward: "data/content-intelligence/backend-architecture/ag36z-post-login-blocker-carry-forward.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag36z-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag36z-login-live-test-closure-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag36z-dynamic-publish-dry-run-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag36z-to-ag37a-dynamic-publish-dry-run-boundary.json",
  registry: "data/quality/ag36z-login-live-test-closure.json",
  preview: "data/quality/ag36z-login-live-test-closure-preview.json",
  doc: "docs/quality/AG36Z_LOGIN_LIVE_TEST_CLOSURE.md"
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
  if (!exists(p)) throw new Error(`Missing AG36Z input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag36aConfirm.status !== "admin_login_confirmed_ready_for_editor_login_test") {
  throw new Error("AG36A Admin login confirmation missing.");
}
if (records.ag36bConfirm.status !== "editor_login_confirmed_ready_for_role_restriction_test") {
  throw new Error("AG36B Editor login confirmation missing.");
}
if (records.ag36cConfirm.status !== "role_restriction_test_confirmed_ready_for_login_security_audit") {
  throw new Error("AG36C role restriction confirmation missing.");
}
if (records.ag36dAudit.status !== "login_security_audit_created_ready_for_ag36z") {
  throw new Error("AG36D login security audit missing.");
}
if (records.ag36dAudit.audit_decision?.all_audits_passed !== true) {
  throw new Error("AG36D all audits must pass.");
}
if (records.ag36dReadiness.ready_for_ag36z !== true) {
  throw new Error("AG36D readiness does not permit AG36Z.");
}
if (records.ag36dBoundary.next_stage_id !== "AG36Z") {
  throw new Error("AG36D boundary does not point to AG36Z.");
}
if (records.ag36cResult.all_role_restriction_checks_passed !== true) {
  throw new Error("AG36C role restriction checks must pass.");
}
if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) {
  throw new Error("Admin final clearance rule missing.");
}
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) {
  throw new Error("Editor assigned-only rule missing.");
}
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) {
  throw new Error("Editor no-publish rule missing.");
}

const blockedState = {
  login_live_test_closure_created: true,
  ag36_login_chain_closed: true,
  admin_login_usable: true,
  editor_login_usable: true,
  role_restriction_passed: true,
  login_security_audit_passed: true,
  ready_for_ag37a_dynamic_publish_dry_run: true,

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

const chainRegister = {
  module_id: "AG36Z",
  title: "Login Live Test Chain Register",
  status: "ag36_login_live_test_chain_registered_for_closure",
  closed_chain: [
    {
      stage_id: "AG36A",
      title: "Admin Login Test",
      status: records.ag36aConfirm.status,
      result: "Admin login successful; Admin protected page opened.",
      file: inputs.ag36aConfirm
    },
    {
      stage_id: "AG36B",
      title: "Editor Login Test",
      status: records.ag36bConfirm.status,
      result: "Editor login successful; Editor protected dashboard opened.",
      file: inputs.ag36bConfirm
    },
    {
      stage_id: "AG36C",
      title: "Role Restriction Test",
      status: records.ag36cConfirm.status,
      result: "Editor blocked from Admin dashboard; Admin allowed to Admin dashboard.",
      file: inputs.ag36cConfirm
    },
    {
      stage_id: "AG36D",
      title: "Login Security Audit",
      status: records.ag36dAudit.status,
      result: "Session, route guard, secret safety and runtime blocker audits passed.",
      file: inputs.ag36dAudit
    }
  ],
  chain_length: 4,
  closed_successfully: true,
  blocked_state: blockedState
};

const usabilityRecord = {
  module_id: "AG36Z",
  title: "Admin Editor Login Usability Record",
  status: "admin_editor_login_usable_in_controlled_mode",
  admin_user: {
    email: ADMIN_EMAIL,
    role: "admin",
    login_confirmed: true,
    protected_dashboard_access_confirmed: true,
    observed_surface: "Admin Review Queue"
  },
  editor_user: {
    email: EDITOR_EMAIL,
    role: "editor",
    login_confirmed: true,
    protected_dashboard_access_confirmed: true,
    observed_surface: "Editor Dashboard",
    admin_dashboard_access_blocked: true
  },
  role_governance_confirmed: {
    admin_final_clearance_authority: true,
    editor_assigned_only: true,
    editor_cannot_publish: true,
    editor_cannot_bypass_admin_review: true
  },
  blocked_state: blockedState
};

const blockerCarryForward = {
  module_id: "AG36Z",
  title: "Post Login Blocker Carry Forward",
  status: "post_login_blockers_carried_forward_to_ag37",
  blocker_meaning:
    "Admin/Editor login is usable in controlled mode, but dynamic publish, public mutation, deployment and runtime article-state mutation remain blocked until governed AG37/AG38 stages.",
  blocked_items: {
    password_recorded: false,
    token_recorded: false,
    cookie_recorded: false,
    supabase_key_recorded: false,
    service_role_key_exposed: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_created: false,
    publish_action_executed: false,
    archive_action_executed: false,
    return_action_executed: false
  },
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG36Z",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag37_and_later",
  future_consumption: {
    AG37A:
      "AG37A should simulate Admin publish action against a test/non-public article only in dry-run mode.",
    AG37B:
      "AG37B should verify queue state changes in dry-run mode without public exposure.",
    AG37C:
      "AG37C should verify audit log shape and rollback record without writing public output.",
    AG37D:
      "AG37D should audit dry-run behaviour and confirm no unintended public exposure.",
    AG37Z:
      "AG37Z should close dynamic publish dry-run readiness before any first controlled dynamic apply.",
    AG38:
      "AG38 should not begin until AG37 is closed and an explicit final approval gate is passed."
  },
  blocked_state: blockedState
};

const closure = {
  module_id: "AG36Z",
  title: "Login Live Test Closure",
  status: "login_live_test_closure_created_ready_for_ag37a",
  purpose:
    "Close AG36 Admin/Editor Login Live Test after Admin login, Editor login, role restriction and login security audit are confirmed.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  closure_decision: {
    ag36_login_live_test_chain_closed: true,
    admin_login_usable: true,
    editor_login_usable: true,
    role_restriction_confirmed: true,
    login_security_audit_passed: true,
    proceed_to_ag37a_dynamic_publish_dry_run: true,

    password_recorded: false,
    token_recorded: false,
    cookie_recorded: false,
    supabase_key_recorded: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    env_vars_recorded: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_created: false,
    publish_action_executed: false
  },
  chain_register_file: outputs.chainRegister,
  usability_record_file: outputs.usabilityRecord,
  blocker_carry_forward_file: outputs.blockerCarryForward,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG36Z",
  title: "Login Live Test Closure Blocker Register",
  status: "login_live_test_closure_blockers_preserved_for_ag37",
  blocked_items: [
    "No password in repo/chat.",
    "No token/cookie in repo/chat.",
    "No Supabase key in repo/chat.",
    "No service-role key exposure.",
    "No deployment.",
    "No public mutation.",
    "No dynamic publish runtime yet.",
    "No publish/archive/return action execution yet."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG36Z",
  title: "Dynamic Publish Dry-run Readiness Record",
  status: "ready_for_ag37a_dynamic_publish_dry_run",
  ready_for_ag37a: true,
  next_stage_id: "AG37A",
  next_stage_title: "Dynamic Publish Dry-run",
  allowed_ag37a_mode: "dynamic_publish_dry_run_only_against_test_or_non_public_article",
  admin_login_confirmed: true,
  editor_login_confirmed: true,
  role_restriction_confirmed: true,
  login_security_audit_passed: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG36Z",
  title: "AG36Z to AG37A Dynamic Publish Dry-run Boundary",
  status: "ag37a_dynamic_publish_dry_run_boundary_created",
  next_stage_id: "AG37A",
  next_stage_title: "Dynamic Publish Dry-run",
  allowed_scope: [
    "Consume AG36Z login live test closure.",
    "Simulate Admin publish action against a test/non-public article.",
    "Keep action dry-run only.",
    "Record intended state changes and audit-log shape.",
    "Do not mutate public article state.",
    "Do not deploy.",
    "Do not expose a public article dynamically."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG36Z",
  title: "Login Live Test Closure",
  status: "login_live_test_closure_created_ready_for_ag37a",
  depends_on: ["AG36A-CONFIRM", "AG36B-CONFIRM", "AG36C-CONFIRM", "AG36D", "AG35Z"],
  generated_from: inputs,
  closure_file: outputs.closure,
  chain_register_file: outputs.chainRegister,
  usability_record_file: outputs.usabilityRecord,
  blocker_carry_forward_file: outputs.blockerCarryForward,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    login_live_test_closure_created: true,
    admin_login_usable: true,
    editor_login_usable: true,
    role_restriction_confirmed: true,
    login_security_audit_passed: true,
    ready_for_ag37a: true,
    admin_email: ADMIN_EMAIL,
    editor_email: EDITOR_EMAIL,

    password_recorded: false,
    token_recorded: false,
    cookie_recorded: false,
    supabase_key_recorded: false,
    service_role_key_exposed: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_created: false,
    publish_action_executed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG36Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG36Z",
  preview_only: false,
  status: review.status,
  message: "AG36Z Login Live Test Closure created. Ready for AG37A Dynamic Publish Dry-run.",
  login_live_test_closure_created: 1,
  admin_login_usable: 1,
  editor_login_usable: 1,
  role_restriction_confirmed: 1,
  login_security_audit_passed: 1,
  ready_for_ag37a: 1,
  password_recorded: 0,
  token_recorded: 0,
  cookie_recorded: 0,
  supabase_key_recorded: 0,
  service_role_key_exposed: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  dynamic_publish_runtime_created: 0,
  publish_action_executed: 0
};

const doc = `# AG36Z — Login Live Test Closure

## Closure Result

AG36 Admin/Editor Login Live Test is closed.

## Confirmed Chain

- AG36A — Admin login successful; Admin protected page opened.
- AG36B — Editor login successful; Editor protected dashboard opened.
- AG36C — Editor blocked from Admin dashboard; Admin allowed to Admin dashboard.
- AG36D — Login security audit passed.

## Current Capability

Admin/Editor login is usable in controlled mode.

## Still Blocked

- No passwords, tokens or cookies recorded.
- No Supabase keys or service-role keys recorded.
- No deployment.
- No public mutation.
- No dynamic publish runtime yet.
- No publish/archive/return action execution yet.

## Next Stage

AG37A — Dynamic Publish Dry-run.
`;

writeJson(outputs.chainRegister, chainRegister);
writeJson(outputs.usabilityRecord, usabilityRecord);
writeJson(outputs.blockerCarryForward, blockerCarryForward);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.closure, closure);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG36Z Login Live Test Closure generated.");
console.log("✅ Admin/Editor login live test chain closed.");
console.log("✅ Ready for AG37A Dynamic Publish Dry-run.");
console.log("✅ No password, token, key, deployment, public mutation or publish action recorded.");
