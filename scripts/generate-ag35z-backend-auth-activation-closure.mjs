import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ADMIN_EMAIL = "dwivedi.vikash.vaibhav@gmail.com";
const EDITOR_EMAIL = "vikash4world@gmail.com";

const inputs = {
  ag35aApproval: "data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json",

  ag35bPackage: "data/content-intelligence/backend-architecture/ag35b-supabase-schema-apply-package.json",
  ag35bManualConfirmation: "data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json",
  ag35bResultRecord: "data/content-intelligence/backend-architecture/ag35b-manual-supabase-result-record.json",
  ag35bSchemaManifest: "data/content-intelligence/backend-architecture/ag35b-schema-manifest.json",
  ag35bRlsManifest: "data/content-intelligence/backend-architecture/ag35b-rls-manifest.json",

  ag35cPackage: "data/content-intelligence/backend-architecture/ag35c-auth-role-setup-package.json",
  ag35cManualConfirmation: "data/content-intelligence/backend-architecture/ag35c-manual-auth-role-confirmation.json",
  ag35cResultRecord: "data/content-intelligence/backend-architecture/ag35c-manual-auth-role-result-record.json",
  ag35cRoleVerification: "data/content-intelligence/backend-architecture/ag35c-admin-editor-role-verification-record.json",

  ag35dAudit: "data/content-intelligence/backend-architecture/ag35d-backend-activation-audit.json",
  ag35dSchemaAudit: "data/content-intelligence/backend-architecture/ag35d-schema-apply-audit-register.json",
  ag35dAuthRoleAudit: "data/content-intelligence/backend-architecture/ag35d-auth-role-audit-register.json",
  ag35dRlsAudit: "data/content-intelligence/backend-architecture/ag35d-rls-access-control-audit-register.json",
  ag35dSecurityAudit: "data/content-intelligence/backend-architecture/ag35d-security-non-public-mutation-audit-register.json",
  ag35dReadiness: "data/content-intelligence/quality-registry/ag35d-backend-auth-activation-closure-readiness-record.json",
  ag35dBoundary: "data/content-intelligence/mutation-plans/ag35d-to-ag35z-backend-auth-activation-closure-boundary.json",

  ag34zClosure: "data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag35z-backend-auth-activation-closure.json",
  closure: "data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json",
  activationChainRegister: "data/content-intelligence/backend-architecture/ag35z-activation-chain-register.json",
  backendAuthClosureRegister: "data/content-intelligence/backend-architecture/ag35z-backend-auth-closure-register.json",
  loginReadinessHandoff: "data/content-intelligence/backend-architecture/ag35z-ag36-login-live-test-handoff-plan.json",
  activationBlocker: "data/content-intelligence/backend-architecture/ag35z-post-activation-blocker-carry-forward.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag35z-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag35z-backend-auth-activation-closure-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag35z-ag36-admin-login-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag35z-to-ag36a-admin-login-test-boundary.json",
  registry: "data/quality/ag35z-backend-auth-activation-closure.json",
  preview: "data/quality/ag35z-backend-auth-activation-closure-preview.json",
  doc: "docs/quality/AG35Z_BACKEND_AUTH_ACTIVATION_CLOSURE.md"
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
  if (!exists(p)) throw new Error(`Missing AG35Z input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([key, file]) => [key, readJson(file)]));

if (records.ag35aApproval.status !== "explicit_activation_approval_recorded_ready_for_ag35b") {
  throw new Error("AG35A approval status mismatch.");
}
if (records.ag35aApproval.approval_decision.controlled_activation_authorized !== true) {
  throw new Error("AG35A controlled activation approval missing.");
}
if (records.ag35bManualConfirmation.status !== "manual_schema_apply_confirmed_ready_for_ag35c") {
  throw new Error("AG35B manual schema confirmation missing.");
}
if (records.ag35cManualConfirmation.status !== "manual_auth_role_setup_confirmed_ready_for_ag35d") {
  throw new Error("AG35C manual Auth role confirmation missing.");
}
if (records.ag35dAudit.status !== "backend_activation_audit_created_ready_for_ag35z") {
  throw new Error("AG35D audit status mismatch.");
}
if (records.ag35dAudit.audit_decision?.all_audits_passed !== true) {
  throw new Error("AG35D all audits must pass.");
}
if (records.ag35dReadiness.ready_for_ag35z !== true) {
  throw new Error("AG35D readiness does not permit AG35Z.");
}
if (records.ag35dBoundary.next_stage_id !== "AG35Z") {
  throw new Error("AG35D boundary does not point to AG35Z.");
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
  backend_auth_activation_closure_created: true,
  ag35_activation_chain_closed: true,
  schema_apply_closed: true,
  auth_role_setup_closed: true,
  backend_activation_audit_closed: true,
  ag36_login_live_test_ready: true,

  passwords_recorded: false,
  credentials_recorded: false,
  secrets_recorded: false,
  env_vars_recorded: false,
  service_role_key_recorded: false,
  service_role_key_exposed: false,
  deployment_triggered: false,
  public_mutation_done: false,
  dynamic_publish_runtime_created: false,
  publish_handler_enabled: false,
  public_article_mutation_enabled: false
};

const activationChainRegister = {
  module_id: "AG35Z",
  title: "Activation Chain Register",
  status: "ag35_activation_chain_registered_for_closure",
  closed_chain: [
    {
      stage_id: "AG35A",
      title: "Explicit Activation Approval",
      status: records.ag35aApproval.status,
      file: inputs.ag35aApproval
    },
    {
      stage_id: "AG35B",
      title: "Supabase Schema Apply Package and Manual Apply Confirmation",
      status: records.ag35bManualConfirmation.status,
      file: inputs.ag35bManualConfirmation
    },
    {
      stage_id: "AG35C",
      title: "Auth Role Setup Package and Manual Confirmation",
      status: records.ag35cManualConfirmation.status,
      file: inputs.ag35cManualConfirmation
    },
    {
      stage_id: "AG35D",
      title: "Backend Activation Audit",
      status: records.ag35dAudit.status,
      file: inputs.ag35dAudit
    }
  ],
  chain_length: 4,
  closed_successfully: true,
  blocked_state: blockedState
};

const backendAuthClosureRegister = {
  module_id: "AG35Z",
  title: "Backend/Auth Closure Register",
  status: "backend_auth_activation_closed_ready_for_ag36",
  closure_points: {
    explicit_activation_approval_completed: true,
    schema_rls_apply_confirmed: true,
    admin_auth_role_confirmed: true,
    editor_auth_role_confirmed: true,
    backend_activation_audit_passed: true,
    admin_final_clearance_preserved: true,
    editor_assigned_only_preserved: true,
    editor_no_publish_preserved: true,
    login_live_test_ready: true,
    deployment_still_blocked: true,
    public_mutation_still_blocked: true,
    dynamic_publish_runtime_still_blocked: true,
    service_role_key_exposure_still_blocked: true
  },
  confirmed_profiles: [
    {
      email: ADMIN_EMAIL,
      role: "admin",
      is_active: true
    },
    {
      email: EDITOR_EMAIL,
      role: "editor",
      is_active: true
    }
  ],
  blocked_state: blockedState
};

const loginReadinessHandoff = {
  module_id: "AG35Z",
  title: "AG36 Login Live Test Handoff Plan",
  status: "ag36_login_live_test_handoff_created",
  ag36_sequence: [
    "AG36A — Admin Login Test",
    "AG36B — Editor Login Test",
    "AG36C — Role Restriction Test",
    "AG36D — Login Security Audit",
    "AG36Z — Login Live Test Closure"
  ],
  ag36a_scope: [
    "Test Admin login with configured Supabase Auth user.",
    "Confirm Admin can reach protected Admin route/page.",
    "Confirm no deployment/public mutation occurs during test.",
    "Record result without passwords, tokens or secrets."
  ],
  ag36b_scope: [
    "Test Editor login with configured Supabase Auth user.",
    "Confirm Editor can reach Editor workspace route/page.",
    "Confirm Editor remains assigned-only and cannot publish.",
    "Record result without passwords, tokens or secrets."
  ],
  still_blocked_until_later: [
    "Dynamic publish dry-run until AG37.",
    "First controlled dynamic publish until AG38.",
    "Public mutation until explicit AG38 approval.",
    "Deployment/public launch changes unless separately approved."
  ],
  blocked_state: blockedState
};

const activationBlocker = {
  module_id: "AG35Z",
  title: "Post-Activation Blocker Carry Forward",
  status: "post_activation_blockers_carried_forward_to_ag36",
  blocked_items: {
    passwords_recorded: false,
    credentials_recorded: false,
    secrets_recorded: false,
    env_vars_recorded: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    deployment_triggered: false,
    public_mutation_done: false,
    dynamic_publish_runtime_created: false,
    publish_handler_enabled: false,
    public_article_mutation_enabled: false
  },
  meaning:
    "Backend/Auth activation is closed for schema and role readiness, but public mutation, deployment and dynamic publish runtime remain blocked until later governed stages.",
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG35Z",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag36_and_later",
  future_consumption: {
    AG36A:
      "AG36A should consume AG35Z and test Admin login/protected Admin route without recording secrets.",
    AG36B:
      "AG36B should test Editor login/protected Editor workspace and assigned-only access.",
    AG36C:
      "AG36C should verify Editor cannot access Admin actions, publish, archive or global queue.",
    AG36D:
      "AG36D should audit login security, route protection and RLS behaviour.",
    AG36Z:
      "AG36Z should close login live tests before AG37 dynamic publish dry-run.",
    AG37:
      "AG37 should perform dynamic publish dry-run only after AG36 closure."
  },
  blocked_state: blockedState
};

const closure = {
  module_id: "AG35Z",
  title: "Backend/Auth Activation Closure",
  status: "backend_auth_activation_closure_created_ready_for_ag36a",
  purpose:
    "Close AG35 controlled Backend/Auth activation after explicit approval, schema/RLS apply confirmation, Auth role confirmation and backend activation audit, while keeping deployment, public mutation and dynamic publish runtime blocked.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  closure_decision: {
    ag35_activation_chain_closed: true,
    backend_auth_activation_closed: true,
    explicit_activation_approval_closed: true,
    schema_rls_apply_closed: true,
    auth_role_setup_closed: true,
    backend_activation_audit_closed: true,
    ready_for_ag36a_admin_login_test: true,

    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_created: false,
    publish_handler_enabled: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    passwords_recorded: false,
    credentials_recorded: false,
    secrets_recorded: false
  },
  activation_chain_register_file: outputs.activationChainRegister,
  backend_auth_closure_register_file: outputs.backendAuthClosureRegister,
  login_readiness_handoff_file: outputs.loginReadinessHandoff,
  activation_blocker_file: outputs.activationBlocker,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG35Z",
  title: "Backend/Auth Activation Closure Blocker Register",
  status: "backend_auth_activation_closure_blockers_preserved_for_ag36",
  blocked_items: [
    "No passwords in repo/chat.",
    "No credentials in repo/chat.",
    "No Supabase keys in repo/chat.",
    "No service-role key exposure.",
    "No deployment.",
    "No public mutation.",
    "No dynamic publish runtime.",
    "No publish handler enablement.",
    "No public article mutation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG35Z",
  title: "AG36 Admin Login Test Readiness Record",
  status: "ready_for_ag36a_admin_login_test",
  ready_for_ag36a: true,
  next_stage_id: "AG36A",
  next_stage_title: "Admin Login Test",
  allowed_ag36a_mode: "admin_login_test_without_secret_recording",
  backend_auth_activation_closed: true,
  admin_profile_confirmed: true,
  editor_profile_confirmed: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  dynamic_publish_runtime_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG35Z",
  title: "AG35Z to AG36A Admin Login Test Boundary",
  status: "ag36a_boundary_created_admin_login_test_without_secret_recording",
  next_stage_id: "AG36A",
  next_stage_title: "Admin Login Test",
  allowed_scope: [
    "Consume AG35Z Backend/Auth Activation Closure.",
    "Test Admin login with manually configured Supabase Auth user.",
    "Confirm protected Admin route/page behaviour.",
    "Record only success/error status, no passwords/tokens/secrets.",
    "Keep deployment, public mutation and dynamic publish runtime blocked."
  ],
  blocked_scope: blocker.blocked_items,
  backend_auth_activation_closed: true,
  controlled_activation_selected: true
};

const review = {
  module_id: "AG35Z",
  title: "Backend/Auth Activation Closure",
  status: "backend_auth_activation_closure_created_ready_for_ag36a",
  depends_on: ["AG35D", "AG35C confirmation", "AG35B confirmation", "AG35A", "AG34Z"],
  generated_from: inputs,
  closure_file: outputs.closure,
  activation_chain_register_file: outputs.activationChainRegister,
  backend_auth_closure_register_file: outputs.backendAuthClosureRegister,
  login_readiness_handoff_file: outputs.loginReadinessHandoff,
  activation_blocker_file: outputs.activationBlocker,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    backend_auth_activation_closure_created: true,
    ag35_activation_chain_closed: true,
    schema_rls_apply_confirmed: true,
    auth_role_setup_confirmed: true,
    backend_activation_audit_passed: true,
    ready_for_ag36a: true,

    admin_email: ADMIN_EMAIL,
    admin_role: "admin",
    editor_email: EDITOR_EMAIL,
    editor_role: "editor",

    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_created: false,
    publish_handler_enabled: false,
    service_role_key_exposed: false,
    passwords_recorded: false,
    credentials_recorded: false,
    secrets_recorded: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG35Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG35Z",
  preview_only: false,
  status: review.status,
  message: "AG35Z Backend/Auth Activation Closure created. Next: AG36A Admin Login Test.",
  backend_auth_activation_closure_created: 1,
  ag35_activation_chain_closed: 1,
  ready_for_ag36a: 1,
  deployment_done: 0,
  public_mutation_done: 0,
  dynamic_publish_runtime_created: 0,
  publish_handler_enabled: 0,
  service_role_key_exposed: 0,
  passwords_recorded: 0,
  credentials_recorded: 0,
  secrets_recorded: 0,
  blocked_state: blockedState
};

const doc = `# AG35Z — Backend/Auth Activation Closure

## Purpose

AG35Z closes the controlled Backend/Auth activation chain.

## Closed Chain

- AG35A — Explicit Activation Approval.
- AG35B — Supabase Schema/RLS Apply and Manual Confirmation.
- AG35C — Auth Role Setup and Manual Confirmation.
- AG35D — Backend Activation Audit.

## Confirmed Profiles

| Email | Role | Active |
|---|---:|---:|
| ${ADMIN_EMAIL} | admin | true |
| ${EDITOR_EMAIL} | editor | true |

## Closure Decision

Backend/Auth activation readiness is closed and ready for AG36 login live tests.

## Still Blocked

- No passwords, credentials or secrets in repo/chat.
- No service-role key exposure.
- No deployment.
- No public mutation.
- No dynamic publish runtime.
- No publish handler enablement.

## Next Stage

AG36A — Admin Login Test.
`;

writeJson(outputs.activationChainRegister, activationChainRegister);
writeJson(outputs.backendAuthClosureRegister, backendAuthClosureRegister);
writeJson(outputs.loginReadinessHandoff, loginReadinessHandoff);
writeJson(outputs.activationBlocker, activationBlocker);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.closure, closure);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG35Z Backend/Auth Activation Closure generated.");
console.log("✅ AG35 activation chain closed.");
console.log("✅ Ready for AG36A Admin Login Test.");
console.log("✅ Deployment, public mutation and dynamic publish runtime remain blocked.");
