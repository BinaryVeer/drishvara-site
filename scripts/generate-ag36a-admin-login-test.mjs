import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ADMIN_EMAIL = "dwivedi.vikash.vaibhav@gmail.com";
const EDITOR_EMAIL = "vikash4world@gmail.com";

const inputs = {
  ag35zReview: "data/content-intelligence/quality-reviews/ag35z-backend-auth-activation-closure.json",
  ag35zClosure: "data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json",
  ag35zChain: "data/content-intelligence/backend-architecture/ag35z-activation-chain-register.json",
  ag35zClosureRegister: "data/content-intelligence/backend-architecture/ag35z-backend-auth-closure-register.json",
  ag35zHandoff: "data/content-intelligence/backend-architecture/ag35z-ag36-login-live-test-handoff-plan.json",
  ag35zBlocker: "data/content-intelligence/backend-architecture/ag35z-post-activation-blocker-carry-forward.json",
  ag35zReadiness: "data/content-intelligence/quality-registry/ag35z-ag36-admin-login-test-readiness-record.json",
  ag35zBoundary: "data/content-intelligence/mutation-plans/ag35z-to-ag36a-admin-login-test-boundary.json",

  ag35cConfirmation: "data/content-intelligence/backend-architecture/ag35c-manual-auth-role-confirmation.json",
  ag35cRoleVerification: "data/content-intelligence/backend-architecture/ag35c-admin-editor-role-verification-record.json",
  ag35dAudit: "data/content-intelligence/backend-architecture/ag35d-backend-activation-audit.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag36a-admin-login-test.json",
  package: "data/content-intelligence/backend-architecture/ag36a-admin-login-test-package.json",
  manualGuide: "data/content-intelligence/backend-architecture/ag36a-admin-login-manual-test-guide.json",
  checklist: "data/content-intelligence/backend-architecture/ag36a-admin-login-test-checklist.json",
  nonSecretAudit: "data/content-intelligence/backend-architecture/ag36a-non-secret-login-test-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag36a-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag36a-admin-login-test-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag36a-editor-login-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag36a-to-ag36b-editor-login-test-boundary.json",
  registry: "data/quality/ag36a-admin-login-test.json",
  preview: "data/quality/ag36a-admin-login-test-preview.json",
  doc: "docs/quality/AG36A_ADMIN_LOGIN_TEST.md"
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
  if (!exists(p)) throw new Error(`Missing AG36A input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([key, file]) => [key, readJson(file)]));

if (records.ag35zClosure.status !== "backend_auth_activation_closure_created_ready_for_ag36a") {
  throw new Error("AG35Z closure status mismatch.");
}
if (records.ag35zReadiness.ready_for_ag36a !== true) {
  throw new Error("AG35Z readiness does not permit AG36A.");
}
if (records.ag35zReadiness.allowed_ag36a_mode !== "admin_login_test_without_secret_recording") {
  throw new Error("AG36A mode mismatch.");
}
if (records.ag35zBoundary.next_stage_id !== "AG36A") {
  throw new Error("AG35Z boundary does not point to AG36A.");
}
if (records.ag35dAudit.audit_decision?.all_audits_passed !== true) {
  throw new Error("AG35D all audits must pass before AG36A.");
}
if (records.ag35cRoleVerification.all_role_checks_passed !== true) {
  throw new Error("AG35C role verification must pass before AG36A.");
}
if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) {
  throw new Error("Admin final clearance missing.");
}
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) {
  throw new Error("Editor assigned-only rule missing.");
}
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) {
  throw new Error("Editor no-publish rule missing.");
}

const blockedState = {
  admin_login_test_package_created: true,
  admin_manual_login_test_guide_created: true,
  admin_login_test_checklist_created: true,
  admin_login_test_performed_by_script: false,
  admin_password_recorded: false,
  auth_token_recorded: false,
  supabase_key_recorded: false,
  service_role_key_recorded: false,
  service_role_key_exposed: false,
  env_vars_recorded: false,
  deployment_triggered: false,
  public_mutation_done: false,
  dynamic_publish_runtime_created: false,
  publish_handler_enabled: false
};

const manualGuide = {
  module_id: "AG36A",
  title: "Admin Login Manual Test Guide",
  status: "admin_login_manual_test_guide_created_pending_operator_test",
  admin_test_email: ADMIN_EMAIL,
  test_mode: "manual_operator_login_test_without_secret_recording",
  manual_steps: [
    "Open the Admin login surface or protected Admin route available in the current app/runtime.",
    "Use the Admin test email configured in Supabase Auth.",
    "Enter credentials only in the app/Supabase login UI; do not paste credentials into chat, terminal, repo or files.",
    "Confirm whether Admin login succeeds.",
    "Confirm whether the Admin protected page/route is reachable.",
    "Confirm no publish, deployment or public mutation action is triggered.",
    "Share only the visible success/error status, not credentials, tokens, keys, cookies or URLs containing secrets."
  ],
  expected_result: {
    admin_auth_user_exists: true,
    admin_profile_role: "admin",
    admin_is_active: true,
    protected_admin_surface_reachable_after_login: "to_be_confirmed_manually",
    credentials_recorded: false,
    tokens_recorded: false
  },
  blocked_state: blockedState
};

const checklist = {
  module_id: "AG36A",
  title: "Admin Login Test Checklist",
  status: "admin_login_test_checklist_created_pending_manual_result",
  checklist_items: [
    {
      check_id: "admin_user_exists",
      expected: "Admin Supabase Auth user exists.",
      current_basis: "AG35C manual role confirmation.",
      manual_check_required: true
    },
    {
      check_id: "admin_profile_role_active",
      expected: "public.profiles row shows admin and is_active true.",
      current_basis: "AG35C role verification.",
      manual_check_required: false
    },
    {
      check_id: "admin_login_success",
      expected: "Admin login succeeds in app/runtime.",
      current_basis: "Pending AG36A manual login result.",
      manual_check_required: true
    },
    {
      check_id: "admin_protected_surface_reachable",
      expected: "Admin protected page/route is reachable after login.",
      current_basis: "Pending AG36A manual login result.",
      manual_check_required: true
    },
    {
      check_id: "no_public_mutation",
      expected: "No publish/deploy/public mutation occurs during test.",
      current_basis: "AG36A blocker.",
      manual_check_required: true
    }
  ],
  blocked_state: blockedState
};

const nonSecretAudit = {
  module_id: "AG36A",
  title: "Non-Secret Login Test Audit Register",
  status: "non_secret_login_test_audit_passed_for_package_stage",
  checks: [
    {
      check_id: "no_password_recorded",
      passed: true,
      evidence: "AG36A package records no password."
    },
    {
      check_id: "no_token_or_cookie_recorded",
      passed: true,
      evidence: "AG36A package records no Auth token or cookie."
    },
    {
      check_id: "no_supabase_key_recorded",
      passed: true,
      evidence: "AG36A package records no Supabase key."
    },
    {
      check_id: "no_service_role_exposure",
      passed: true,
      evidence: "Service-role exposure remains blocked."
    },
    {
      check_id: "no_deployment_or_public_mutation",
      passed: true,
      evidence: "Deployment and public mutation remain blocked."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG36A",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag36a_confirmation_and_ag36b",
  future_consumption: {
    AG36A_manual_confirmation:
      "After Admin login is manually tested, record confirmation without credentials, tokens, cookies, keys or secret-bearing URLs.",
    AG36B:
      "AG36B should test Editor login and Editor workspace access after AG36A Admin login confirmation.",
    AG36C:
      "AG36C should test role restriction: Editor cannot perform Admin actions, publish, archive or access global queue.",
    AG36D:
      "AG36D should audit login security, session handling and RLS behaviour.",
    AG36Z:
      "AG36Z should close login live tests before AG37 dynamic publish dry-run."
  },
  blocked_state: blockedState
};

const packageRecord = {
  module_id: "AG36A",
  title: "Admin Login Test Package",
  status: "admin_login_test_package_created_pending_manual_admin_login_result",
  purpose:
    "Create controlled Admin login test package after AG35 Backend/Auth activation closure, without recording credentials, tokens, Supabase keys, deployment actions, public mutation or dynamic publish runtime.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  selected_test_user: {
    admin_email: ADMIN_EMAIL,
    expected_role: "admin",
    expected_is_active: true
  },
  package_decision: {
    admin_login_test_package_created: true,
    manual_admin_login_test_required: true,
    proceed_to_manual_admin_login_test: true,

    admin_login_test_performed_by_script: false,
    password_recorded: false,
    token_recorded: false,
    supabase_key_recorded: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    env_vars_recorded: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_created: false
  },
  manual_guide_file: outputs.manualGuide,
  checklist_file: outputs.checklist,
  non_secret_audit_file: outputs.nonSecretAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG36A",
  title: "Admin Login Test Blocker Register",
  status: "admin_login_test_blockers_preserved_pending_manual_result",
  blocked_items: [
    "No password in repo/chat.",
    "No Auth token in repo/chat.",
    "No cookie/session value in repo/chat.",
    "No Supabase anon key in repo/chat.",
    "No service-role key exposure.",
    "No env var recording.",
    "No deployment.",
    "No public mutation.",
    "No dynamic publish runtime.",
    "No publish handler enablement."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG36A",
  title: "Editor Login Test Readiness Record",
  status: "ready_for_ag36b_after_manual_admin_login_confirmation",
  ready_for_ag36b_after_manual_confirmation: true,
  next_stage_id: "AG36B",
  next_stage_title: "Editor Login Test",
  allowed_ag36b_mode: "editor_login_test_without_secret_recording",
  admin_login_package_created: true,
  manual_admin_login_confirmation_required_before_ag36b: true,
  editor_email: EDITOR_EMAIL,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  dynamic_publish_runtime_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG36A",
  title: "AG36A to AG36B Editor Login Test Boundary",
  status: "ag36b_boundary_created_pending_manual_admin_login_confirmation",
  next_stage_id: "AG36B",
  next_stage_title: "Editor Login Test",
  allowed_scope: [
    "Consume AG36A Admin login test package.",
    "Proceed after Admin login manual confirmation.",
    "Test Editor login and workspace route without recording credentials/tokens/secrets.",
    "Keep deployment, public mutation and dynamic publish runtime blocked."
  ],
  blocked_scope: blocker.blocked_items,
  manual_admin_login_confirmation_required: true
};

const review = {
  module_id: "AG36A",
  title: "Admin Login Test",
  status: "admin_login_test_package_created_pending_manual_admin_login_result",
  depends_on: ["AG35Z", "AG35D", "AG35C confirmation", "AG26Z"],
  generated_from: inputs,
  package_file: outputs.package,
  manual_guide_file: outputs.manualGuide,
  checklist_file: outputs.checklist,
  non_secret_audit_file: outputs.nonSecretAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    admin_login_test_package_created: true,
    admin_email: ADMIN_EMAIL,
    expected_admin_role: "admin",
    manual_admin_login_test_pending: true,
    ready_for_manual_admin_login_test: true,

    password_recorded: false,
    token_recorded: false,
    supabase_key_recorded: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    env_vars_recorded: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_created: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG36A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG36A",
  preview_only: false,
  status: review.status,
  message: "AG36A Admin Login Test package created. Manual Admin login confirmation is pending.",
  admin_login_test_package_created: 1,
  manual_admin_login_test_pending: 1,
  admin_email: ADMIN_EMAIL,
  password_recorded: 0,
  token_recorded: 0,
  supabase_key_recorded: 0,
  service_role_key_exposed: 0,
  env_vars_recorded: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  dynamic_publish_runtime_created: 0,
  blocked_state: blockedState
};

const doc = `# AG36A — Admin Login Test Package

## Purpose

AG36A creates the controlled Admin login test package after AG35 Backend/Auth activation closure.

## Admin Test User

- ${ADMIN_EMAIL}
- Expected role: admin
- Expected active status: true

## Manual Test

Use the app/runtime Admin login surface and confirm whether Admin login succeeds and the protected Admin surface is reachable.

Do not record passwords, tokens, cookies, Supabase keys, service-role keys, environment values, deployment output or secret-bearing URLs.

## Still Blocked

- No deployment.
- No public mutation.
- No dynamic publish runtime.
- No publish handler enablement.
- No service-role key exposure.

## Next

After manual Admin login confirmation, proceed to AG36B — Editor Login Test.
`;

writeJson(outputs.manualGuide, manualGuide);
writeJson(outputs.checklist, checklist);
writeJson(outputs.nonSecretAudit, nonSecretAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.package, packageRecord);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG36A Admin Login Test package generated.");
console.log(`✅ Admin test email: ${ADMIN_EMAIL}`);
console.log("✅ Manual Admin login confirmation is pending.");
console.log("✅ No passwords, tokens, keys, env vars, deployment or public mutation recorded.");
