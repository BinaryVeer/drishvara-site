import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ADMIN_EMAIL = "dwivedi.vikash.vaibhav@gmail.com";
const EDITOR_EMAIL = "vikash4world@gmail.com";

const inputs = {
  ag35cReview: "data/content-intelligence/quality-reviews/ag35c-auth-role-setup.json",
  ag35cPackage: "data/content-intelligence/backend-architecture/ag35c-auth-role-setup-package.json",
  ag35cGuide: "data/content-intelligence/backend-architecture/ag35c-auth-user-creation-guide.json",
  ag35cManifest: "data/content-intelligence/backend-architecture/ag35c-role-mapping-manifest.json",
  ag35cManualGuide: "data/content-intelligence/backend-architecture/ag35c-manual-role-mapping-guide.json",
  ag35cReadiness: "data/content-intelligence/quality-registry/ag35c-backend-activation-audit-readiness-record.json",
  ag35cBoundary: "data/content-intelligence/mutation-plans/ag35c-to-ag35d-backend-activation-audit-boundary.json",
  ag35bConfirmation: "data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json",
  ag35aApproval: "data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",
  sqlFile: "supabase/migrations/20260527_ag35c_auth_role_mapping.sql"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag35c-manual-auth-role-confirmation.json",
  confirmation: "data/content-intelligence/backend-architecture/ag35c-manual-auth-role-confirmation.json",
  resultRecord: "data/content-intelligence/backend-architecture/ag35c-manual-auth-role-result-record.json",
  roleVerification: "data/content-intelligence/backend-architecture/ag35c-admin-editor-role-verification-record.json",
  readiness: "data/content-intelligence/quality-registry/ag35c-backend-activation-audit-confirmed-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag35c-confirmed-to-ag35d-backend-activation-audit-boundary.json",
  registry: "data/quality/ag35c-manual-auth-role-confirmation.json",
  preview: "data/quality/ag35c-manual-auth-role-confirmation-preview.json",
  doc: "docs/quality/AG35C_MANUAL_AUTH_ROLE_CONFIRMATION.md"
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

function readText(p) {
  return fs.readFileSync(full(p), "utf8");
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
  if (!exists(p)) throw new Error(`Missing AG35C confirmation input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs)
    .filter(([key]) => key !== "sqlFile")
    .map(([key, file]) => [key, readJson(file)])
);

const sql = readText(inputs.sqlFile);

if (records.ag35cPackage.status !== "controlled_auth_role_setup_package_created_pending_manual_user_creation_and_mapping") {
  throw new Error("AG35C package status mismatch.");
}
if (records.ag35cReadiness.ready_for_ag35d_after_manual_confirmation !== true) {
  throw new Error("AG35C readiness does not permit confirmation.");
}
if (records.ag35cBoundary.next_stage_id !== "AG35D") {
  throw new Error("AG35C boundary does not point to AG35D.");
}
if (records.ag35bConfirmation.status !== "manual_schema_apply_confirmed_ready_for_ag35c") {
  throw new Error("AG35B manual schema confirmation missing.");
}
if (records.ag35aApproval.approval_decision.controlled_activation_authorized !== true) {
  throw new Error("AG35A controlled activation approval missing.");
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
if (!sql.includes(ADMIN_EMAIL) || !sql.includes(EDITOR_EMAIL)) {
  throw new Error("AG35C SQL does not contain expected role emails.");
}

const blockedState = {
  manual_auth_role_confirmation_created: true,
  auth_users_confirmed_in_supabase: true,
  role_mapping_confirmed_in_profiles: true,
  admin_role_confirmed: true,
  editor_role_confirmed: true,
  ready_for_ag35d_backend_activation_audit: true,

  passwords_recorded: false,
  credentials_recorded: false,
  secrets_recorded: false,
  env_vars_recorded: false,
  service_role_key_recorded: false,
  service_role_key_exposed: false,
  deployment_triggered: false,
  public_mutation_done: false,
  dynamic_publish_runtime_created: false
};

const resultRecord = {
  module_id: "AG35C",
  title: "Manual Auth Role Result Record",
  status: "manual_auth_role_mapping_result_recorded_success",
  operator_reported_result: "Supabase profiles query returned two active rows: one admin and one editor.",
  apply_surface: "Supabase SQL Editor and Authentication users",
  apply_mode: "manual_operator_action",
  admin_result: {
    email: ADMIN_EMAIL,
    role: "admin",
    is_active: true
  },
  editor_result: {
    email: EDITOR_EMAIL,
    role: "editor",
    is_active: true
  },
  result_contains_passwords: false,
  result_contains_supabase_keys: false,
  result_contains_project_url: false,
  result_contains_service_role_key: false,
  blocked_state: blockedState
};

const roleVerification = {
  module_id: "AG35C",
  title: "Admin Editor Role Verification Record",
  status: "admin_editor_roles_verified_ready_for_ag35d",
  verified_roles: [
    {
      email: ADMIN_EMAIL,
      expected_role: "admin",
      observed_role: "admin",
      is_active: true,
      verification_passed: true
    },
    {
      email: EDITOR_EMAIL,
      expected_role: "editor",
      observed_role: "editor",
      is_active: true,
      verification_passed: true
    }
  ],
  governance_confirmed: {
    admin_final_clearance_authority: true,
    editor_assigned_only: true,
    editor_cannot_publish: true,
    editor_cannot_archive: true,
    public_cannot_access_private_queue_or_audit: true
  },
  all_role_checks_passed: true,
  blocked_state: blockedState
};

const confirmation = {
  module_id: "AG35C",
  title: "Manual Auth Role Confirmation",
  status: "manual_auth_role_setup_confirmed_ready_for_ag35d",
  purpose:
    "Record operator confirmation that Admin and Editor Auth users exist and public.profiles role mapping returned active admin/editor rows.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  confirmation_decision: {
    manual_auth_user_setup_confirmed: true,
    manual_role_mapping_sql_confirmed: true,
    admin_profile_confirmed: true,
    editor_profile_confirmed: true,
    proceed_to_ag35d_backend_activation_audit: true,

    passwords_recorded_in_repo: false,
    credentials_recorded_in_repo: false,
    secrets_recorded_in_repo: false,
    env_vars_recorded_in_repo: false,
    service_role_key_recorded_in_repo: false,
    service_role_key_exposed: false,
    deployment_done: false,
    public_mutation_done: false
  },
  result_record_file: outputs.resultRecord,
  role_verification_file: outputs.roleVerification,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG35C",
  title: "Backend Activation Audit Confirmed Readiness Record",
  status: "ready_for_ag35d_backend_activation_audit_after_auth_role_confirmation",
  ready_for_ag35d: true,
  next_stage_id: "AG35D",
  next_stage_title: "Backend Activation Audit",
  allowed_ag35d_mode: "backend_activation_audit_after_schema_and_auth_role_confirmation",
  manual_schema_apply_confirmed: true,
  manual_auth_role_setup_confirmed: true,
  admin_profile_confirmed: true,
  editor_profile_confirmed: true,
  public_mutation_allowed_next: false,
  deployment_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG35C",
  title: "AG35C Confirmed to AG35D Backend Activation Audit Boundary",
  status: "ag35d_boundary_confirmed_backend_activation_audit",
  next_stage_id: "AG35D",
  next_stage_title: "Backend Activation Audit",
  allowed_scope: [
    "Consume AG35B schema apply confirmation.",
    "Consume AG35C Auth role confirmation.",
    "Audit schema, RLS, profiles and role mapping readiness.",
    "Keep deployment and public mutation blocked.",
    "Prepare AG35Z closure only after audit passes."
  ],
  blocked_scope: [
    "No passwords in repo/chat.",
    "No Supabase keys in repo/chat.",
    "No service-role key exposure.",
    "No deployment.",
    "No public mutation.",
    "No dynamic publish runtime."
  ],
  manual_auth_role_setup_confirmed: true,
  controlled_activation_selected: true
};

const review = {
  module_id: "AG35C",
  title: "Manual Auth Role Confirmation",
  status: "manual_auth_role_setup_confirmed_ready_for_ag35d",
  depends_on: ["AG35C", "AG35B confirmation", "AG35A", "AG26Z"],
  generated_from: inputs,
  confirmation_file: outputs.confirmation,
  result_record_file: outputs.resultRecord,
  role_verification_file: outputs.roleVerification,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    manual_auth_user_setup_confirmed: true,
    manual_role_mapping_sql_confirmed: true,
    admin_email: ADMIN_EMAIL,
    admin_role: "admin",
    admin_is_active: true,
    editor_email: EDITOR_EMAIL,
    editor_role: "editor",
    editor_is_active: true,
    ready_for_ag35d: true,

    passwords_recorded: false,
    credentials_recorded: false,
    secrets_recorded: false,
    env_vars_recorded: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    deployment_done: false,
    public_mutation_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG35C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG35C",
  preview_only: false,
  status: review.status,
  message: "AG35C manual Auth role setup confirmed. Next: AG35D Backend Activation Audit.",
  manual_auth_user_setup_confirmed: 1,
  manual_role_mapping_sql_confirmed: 1,
  admin_email: ADMIN_EMAIL,
  admin_role: "admin",
  admin_is_active: 1,
  editor_email: EDITOR_EMAIL,
  editor_role: "editor",
  editor_is_active: 1,
  ready_for_ag35d: 1,
  passwords_recorded: 0,
  credentials_recorded: 0,
  secrets_recorded: 0,
  env_vars_recorded: 0,
  service_role_key_recorded: 0,
  service_role_key_exposed: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  blocked_state: blockedState
};

const doc = `# AG35C — Manual Auth Role Confirmation

## Confirmed Supabase Result

The manual role mapping returned two active profile rows:

| Email | Role | Active |
|---|---:|---:|
| ${ADMIN_EMAIL} | admin | true |
| ${EDITOR_EMAIL} | editor | true |

## Decision

AG35C manual Auth role setup is confirmed.

The project is ready for AG35D — Backend Activation Audit.

## Boundary

No passwords, credentials, Supabase keys, service-role keys, environment values, deployment or public mutation are recorded in this repository.

## Next Stage

AG35D — Backend Activation Audit.
`;

writeJson(outputs.resultRecord, resultRecord);
writeJson(outputs.roleVerification, roleVerification);
writeJson(outputs.confirmation, confirmation);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG35C manual Auth role confirmation generated.");
console.log("✅ Admin role confirmed:", ADMIN_EMAIL, "admin true");
console.log("✅ Editor role confirmed:", EDITOR_EMAIL, "editor true");
console.log("✅ Ready for AG35D Backend Activation Audit.");
console.log("✅ No passwords, secrets, env vars, service-role keys, deployment or public mutation recorded.");
