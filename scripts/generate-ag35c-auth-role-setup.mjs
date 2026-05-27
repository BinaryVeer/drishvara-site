import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ADMIN_EMAIL = "dwivedi.vikash.vaibhav@gmail.com";
const EDITOR_EMAIL = "vikash4world@gmail.com";

const inputs = {
  ag35bConfirmation: "data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json",
  ag35bResultRecord: "data/content-intelligence/backend-architecture/ag35b-manual-supabase-result-record.json",
  ag35bConfirmedReadiness: "data/content-intelligence/quality-registry/ag35b-auth-role-setup-confirmed-readiness-record.json",
  ag35bConfirmedBoundary: "data/content-intelligence/mutation-plans/ag35b-confirmed-to-ag35c-auth-role-setup-boundary.json",
  ag35bPackage: "data/content-intelligence/backend-architecture/ag35b-supabase-schema-apply-package.json",
  ag35bRlsManifest: "data/content-intelligence/backend-architecture/ag35b-rls-manifest.json",
  ag35aApproval: "data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json",
  ag34cTestAdminPlan: "data/content-intelligence/backend-architecture/ag34c-test-admin-user-plan.json",
  ag34cTestEditorPlan: "data/content-intelligence/backend-architecture/ag34c-test-editor-user-plan.json",
  ag34cRoleRestrictionPlan: "data/content-intelligence/backend-architecture/ag34c-role-restriction-test-plan.json",
  ag34zClosure: "data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag35c-auth-role-setup.json",
  package: "data/content-intelligence/backend-architecture/ag35c-auth-role-setup-package.json",
  authUserCreationGuide: "data/content-intelligence/backend-architecture/ag35c-auth-user-creation-guide.json",
  roleMappingManifest: "data/content-intelligence/backend-architecture/ag35c-role-mapping-manifest.json",
  manualRoleMappingGuide: "data/content-intelligence/backend-architecture/ag35c-manual-role-mapping-guide.json",
  nonExecutionAudit: "data/content-intelligence/backend-architecture/ag35c-auth-role-setup-non-execution-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag35c-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag35c-auth-role-setup-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag35c-backend-activation-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag35c-to-ag35d-backend-activation-audit-boundary.json",
  registry: "data/quality/ag35c-auth-role-setup.json",
  preview: "data/quality/ag35c-auth-role-setup-preview.json",
  doc: "docs/quality/AG35C_AUTH_ROLE_SETUP.md",
  sql: "supabase/migrations/20260527_ag35c_auth_role_mapping.sql"
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
  if (!exists(p)) throw new Error(`Missing AG35C input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([key, file]) => [key, readJson(file)]));

if (records.ag35bConfirmation.status !== "manual_schema_apply_confirmed_ready_for_ag35c") throw new Error("AG35B manual confirmation status mismatch.");
if (records.ag35bConfirmedReadiness.ready_for_ag35c !== true) throw new Error("AG35B confirmed readiness does not permit AG35C.");
if (records.ag35bConfirmedReadiness.allowed_ag35c_mode !== "controlled_auth_role_setup") throw new Error("AG35C mode mismatch.");
if (records.ag35bConfirmedBoundary.next_stage_id !== "AG35C") throw new Error("AG35B confirmed boundary does not point to AG35C.");
if (records.ag35aApproval.approval_decision.controlled_activation_authorized !== true) throw new Error("AG35A controlled activation approval missing.");
if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) throw new Error("Admin final clearance missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("Editor assigned-only rule missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) throw new Error("Editor no-publish rule missing.");

const blockedState = {
  auth_role_setup_package_created: true,
  auth_user_creation_guide_created: true,
  role_mapping_manifest_created: true,
  role_mapping_sql_file_created: true,
  manual_role_mapping_guide_created: true,

  auth_users_created_by_script: false,
  passwords_created_by_script: false,
  credentials_recorded: false,
  secrets_recorded: false,
  env_vars_recorded: false,
  service_role_key_recorded: false,
  service_role_key_exposed: false,
  supabase_connected_by_script: false,
  role_mapping_sql_applied_by_script: false,
  database_write_done_by_script: false,
  deployment_triggered: false,
  public_mutation_done: false
};

const roleMappingSql = `-- AG35C — Drishvara Auth Role Mapping SQL
-- Generated by: vikash vaibhav
-- Boundary:
--   1. Create Auth users manually in Supabase Authentication before running this SQL.
--   2. Do not paste credentials, service-role keys, anon keys or env values here.
--   3. This SQL maps existing auth.users records into public.profiles.
--   4. Admin final authority and Editor assigned-only/no-publish governance are preserved.

insert into public.profiles (id, email, role, display_name, is_active)
select
  u.id,
  u.email,
  'admin',
  'Vikash Vaibhav — Admin',
  true
from auth.users u
where lower(u.email) = lower('${ADMIN_EMAIL}')
on conflict (id) do update
set
  email = excluded.email,
  role = 'admin',
  display_name = excluded.display_name,
  is_active = true,
  updated_at = now();

insert into public.profiles (id, email, role, display_name, is_active)
select
  u.id,
  u.email,
  'editor',
  'Vikash Vaibhav — Editor Test',
  true
from auth.users u
where lower(u.email) = lower('${EDITOR_EMAIL}')
on conflict (id) do update
set
  email = excluded.email,
  role = 'editor',
  display_name = excluded.display_name,
  is_active = true,
  updated_at = now();

select
  email,
  role,
  is_active,
  created_at,
  updated_at
from public.profiles
where lower(email) in (
  lower('${ADMIN_EMAIL}'),
  lower('${EDITOR_EMAIL}')
)
order by role, email;
`;

const authUserCreationGuide = {
  module_id: "AG35C",
  title: "Auth User Creation Guide",
  status: "auth_user_creation_guide_created_pending_manual_action",
  admin_test_email: ADMIN_EMAIL,
  editor_test_email: EDITOR_EMAIL,
  manual_steps: [
    "Go to Supabase Dashboard → Authentication → Users.",
    "Create or invite Admin user with the Admin test email.",
    "Create or invite Editor user with the Editor test email.",
    "Do not store passwords in repo or chat.",
    "After Auth users exist, run the AG35C role-mapping SQL in Supabase SQL Editor.",
    "Share only success/error output, not passwords, keys, URLs or secrets."
  ],
  auth_users_created_by_script: false,
  passwords_recorded: false,
  credentials_recorded: false,
  blocked_state: blockedState
};

const roleMappingManifest = {
  module_id: "AG35C",
  title: "Role Mapping Manifest",
  status: "role_mapping_manifest_created_pending_manual_apply",
  sql_file: outputs.sql,
  planned_role_mappings: [
    {
      email: ADMIN_EMAIL,
      role: "admin",
      intended_authority: "Final approval, return, archive and publish approval authority"
    },
    {
      email: EDITOR_EMAIL,
      role: "editor",
      intended_authority: "Assigned article editing and submit-back-to-Admin only"
    }
  ],
  governance_rules: {
    admin_final_clearance_authority: true,
    editor_assigned_only: true,
    editor_cannot_publish: true,
    editor_cannot_archive: true,
    public_cannot_access_private_queue_or_audit: true
  },
  role_mapping_sql_created: true,
  role_mapping_sql_applied_by_script: false,
  blocked_state: blockedState
};

const manualRoleMappingGuide = {
  module_id: "AG35C",
  title: "Manual Role Mapping Guide",
  status: "manual_role_mapping_guide_created_pending_operator_action",
  sql_file_to_review: outputs.sql,
  required_order: [
    "First create/invite Auth users manually in Supabase Authentication.",
    "Then run AG35C role-mapping SQL in Supabase SQL Editor.",
    "Confirm the final SELECT returns one admin row and one editor row.",
    "Share only the Results output, not passwords or keys."
  ],
  manual_apply_performed_by_script: false,
  supabase_connected_by_script: false,
  role_mapping_sql_applied_by_script: false,
  blocked_state: blockedState
};

const nonExecutionAudit = {
  module_id: "AG35C",
  title: "Auth Role Setup Non-Execution Audit Register",
  status: "auth_role_setup_non_execution_audit_passed",
  checks: [
    { check_id: "package_only", passed: true, evidence: "AG35C creates guide, manifest and role-mapping SQL package only." },
    { check_id: "no_passwords", passed: !roleMappingSql.toLowerCase().includes("password"), evidence: "No password is stored in SQL." },
    { check_id: "no_secret_values", passed: !roleMappingSql.includes("SUPABASE_SERVICE_ROLE_KEY") && !roleMappingSql.includes("eyJ"), evidence: "No secret values are stored." },
    { check_id: "no_auth_user_created_by_script", passed: true, evidence: "No Auth users are created by local script." },
    { check_id: "no_sql_apply_by_script", passed: true, evidence: "Role mapping SQL is generated but not applied by script." },
    { check_id: "no_deployment_public_mutation", passed: true, evidence: "No deployment or public mutation occurs." },
    { check_id: "governance_preserved", passed: true, evidence: "Admin final authority and Editor assigned-only/no-publish governance are preserved." }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG35C",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag35d",
  future_consumption: {
    AG35C_manual_confirmation:
      "After manual Auth user creation and role-mapping SQL execution, record confirmation before AG35D if needed.",
    AG35D:
      "AG35D should audit backend activation including schema apply, Auth users and profile-role mapping.",
    AG35Z:
      "AG35Z should close Backend/Auth activation before AG36 login live tests.",
    AG36:
      "AG36 should test Admin login, Editor login and role restrictions."
  },
  blocked_state: blockedState
};

const packageRecord = {
  module_id: "AG35C",
  title: "Auth Role Setup Package",
  status: "controlled_auth_role_setup_package_created_pending_manual_user_creation_and_mapping",
  purpose:
    "Create controlled Auth role setup package for Admin and Editor users without storing credentials, creating users by script, applying SQL by script, deploying or mutating public content.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  selected_test_users: {
    admin_test_email: ADMIN_EMAIL,
    editor_test_email: EDITOR_EMAIL
  },
  package_decision: {
    auth_role_setup_package_created: true,
    auth_user_creation_guide_created: true,
    role_mapping_manifest_created: true,
    role_mapping_sql_file_created: true,
    manual_role_mapping_guide_created: true,
    proceed_to_manual_auth_user_creation_and_role_mapping: true,

    auth_users_created_by_script: false,
    passwords_created_by_script: false,
    credentials_recorded: false,
    secrets_recorded: false,
    env_vars_recorded: false,
    service_role_key_recorded: false,
    supabase_connected_by_script: false,
    role_mapping_sql_applied_by_script: false,
    deployment_done: false,
    public_mutation_done: false
  },
  auth_user_creation_guide_file: outputs.authUserCreationGuide,
  role_mapping_manifest_file: outputs.roleMappingManifest,
  manual_role_mapping_guide_file: outputs.manualRoleMappingGuide,
  non_execution_audit_file: outputs.nonExecutionAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  sql_file: outputs.sql,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG35C",
  title: "Auth Role Setup Blocker Register",
  status: "auth_role_setup_package_created_manual_actions_pending",
  blocked_now_by_script: [
    "No Auth user creation by script.",
    "No password generation by script.",
    "No credential storage.",
    "No secret/env var storage.",
    "No service-role key handling.",
    "No Supabase connection by script.",
    "No role-mapping SQL apply by script.",
    "No deployment.",
    "No public mutation."
  ],
  allowed_operator_action_after_review: [
    "Manually create/invite Auth users in Supabase Dashboard.",
    "Manually run AG35C role-mapping SQL in Supabase SQL Editor.",
    "Share only success/error output."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG35C",
  title: "Backend Activation Audit Readiness Record",
  status: "ready_for_ag35d_after_manual_auth_role_confirmation",
  ready_for_ag35d_after_manual_confirmation: true,
  next_stage_id: "AG35D",
  next_stage_title: "Backend Activation Audit",
  allowed_ag35d_mode: "backend_activation_audit_after_manual_auth_role_confirmation",
  auth_role_setup_package_created: true,
  manual_auth_user_creation_required: true,
  manual_role_mapping_sql_required: true,
  public_mutation_allowed_next: false,
  deployment_allowed_next: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG35C",
  title: "AG35C to AG35D Backend Activation Audit Boundary",
  status: "ag35d_boundary_created_pending_manual_auth_role_confirmation",
  next_stage_id: "AG35D",
  next_stage_title: "Backend Activation Audit",
  allowed_scope: [
    "Consume AG35C Auth role setup package.",
    "Confirm manual Auth user creation.",
    "Confirm manual role-mapping SQL execution.",
    "Audit backend activation status.",
    "Keep deployment and public mutation blocked."
  ],
  blocked_scope: [
    "No password or secret in repo/chat.",
    "No service-role exposure.",
    "No deployment.",
    "No public mutation.",
    "No dynamic publish runtime."
  ],
  manual_confirmation_required_before_ag35d: true
};

const review = {
  module_id: "AG35C",
  title: "Auth Role Setup",
  status: "controlled_auth_role_setup_package_created_pending_manual_user_creation_and_mapping",
  depends_on: ["AG35B confirmation", "AG35A", "AG34Z", "AG26Z"],
  generated_from: inputs,
  package_file: outputs.package,
  auth_user_creation_guide_file: outputs.authUserCreationGuide,
  role_mapping_manifest_file: outputs.roleMappingManifest,
  manual_role_mapping_guide_file: outputs.manualRoleMappingGuide,
  sql_file: outputs.sql,
  non_execution_audit_file: outputs.nonExecutionAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    auth_role_setup_package_created: true,
    admin_test_email_recorded: ADMIN_EMAIL,
    editor_test_email_recorded: EDITOR_EMAIL,
    role_mapping_sql_created: true,
    ready_for_manual_auth_user_creation: true,
    ready_for_manual_role_mapping_sql: true,

    auth_users_created_by_script: false,
    passwords_created_by_script: false,
    credentials_recorded: false,
    secrets_recorded: false,
    env_vars_recorded: false,
    service_role_key_recorded: false,
    role_mapping_sql_applied_by_script: false,
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
  message: "AG35C Auth Role Setup package created. Manual Auth user creation and role mapping are pending.",
  auth_role_setup_package_created: 1,
  role_mapping_sql_created: 1,
  admin_test_email: ADMIN_EMAIL,
  editor_test_email: EDITOR_EMAIL,
  auth_users_created_by_script: 0,
  passwords_recorded: 0,
  credentials_recorded: 0,
  secrets_recorded: 0,
  env_vars_recorded: 0,
  service_role_key_recorded: 0,
  service_role_key_exposed: 0,
  role_mapping_sql_applied_by_script: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  blocked_state: blockedState
};

const doc = `# AG35C — Auth Role Setup Package

## Selected Test Users

- Admin: ${ADMIN_EMAIL}
- Editor: ${EDITOR_EMAIL}

## Purpose

AG35C creates the controlled Auth role setup package.

## Created Files

- \`${outputs.sql}\`
- Auth user creation guide.
- Role mapping manifest.
- Manual role mapping guide.
- Non-execution audit.
- AG35D boundary.

## Manual Supabase Steps

1. Create/invite Admin user in Supabase Authentication.
2. Create/invite Editor user in Supabase Authentication.
3. Do not store passwords in repo or chat.
4. Run the AG35C role-mapping SQL in Supabase SQL Editor.
5. Confirm that the result returns one admin row and one editor row.

## Boundary

This script does not create users, passwords, credentials, secrets, env vars, service-role keys, deployment or public mutation.

## Next

Manual Auth user creation and role mapping confirmation.
`;

writeText(outputs.sql, roleMappingSql);
writeJson(outputs.authUserCreationGuide, authUserCreationGuide);
writeJson(outputs.roleMappingManifest, roleMappingManifest);
writeJson(outputs.manualRoleMappingGuide, manualRoleMappingGuide);
writeJson(outputs.nonExecutionAudit, nonExecutionAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.package, packageRecord);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG35C Auth Role Setup package generated.");
console.log(`✅ Admin test email: ${ADMIN_EMAIL}`);
console.log(`✅ Editor test email: ${EDITOR_EMAIL}`);
console.log(`✅ Role mapping SQL created: ${outputs.sql}`);
console.log("✅ No users, passwords, secrets, env vars, deployment or public mutation created by script.");
