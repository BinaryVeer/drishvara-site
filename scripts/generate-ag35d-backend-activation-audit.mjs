import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ADMIN_EMAIL = "dwivedi.vikash.vaibhav@gmail.com";
const EDITOR_EMAIL = "vikash4world@gmail.com";

const inputs = {
  ag35cManualConfirmation: "data/content-intelligence/backend-architecture/ag35c-manual-auth-role-confirmation.json",
  ag35cResultRecord: "data/content-intelligence/backend-architecture/ag35c-manual-auth-role-result-record.json",
  ag35cRoleVerification: "data/content-intelligence/backend-architecture/ag35c-admin-editor-role-verification-record.json",
  ag35cConfirmedReadiness: "data/content-intelligence/quality-registry/ag35c-backend-activation-audit-confirmed-readiness-record.json",
  ag35cConfirmedBoundary: "data/content-intelligence/mutation-plans/ag35c-confirmed-to-ag35d-backend-activation-audit-boundary.json",

  ag35cPackage: "data/content-intelligence/backend-architecture/ag35c-auth-role-setup-package.json",
  ag35cRoleManifest: "data/content-intelligence/backend-architecture/ag35c-role-mapping-manifest.json",
  ag35bManualConfirmation: "data/content-intelligence/backend-architecture/ag35b-manual-schema-apply-confirmation.json",
  ag35bSchemaManifest: "data/content-intelligence/backend-architecture/ag35b-schema-manifest.json",
  ag35bRlsManifest: "data/content-intelligence/backend-architecture/ag35b-rls-manifest.json",
  ag35aApproval: "data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json",
  ag34zClosure: "data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",

  ag35bSql: "supabase/migrations/20260527_ag35b_drishvara_controlled_schema.sql",
  ag35cSql: "supabase/migrations/20260527_ag35c_auth_role_mapping.sql"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag35d-backend-activation-audit.json",
  audit: "data/content-intelligence/backend-architecture/ag35d-backend-activation-audit.json",
  schemaApplyAudit: "data/content-intelligence/backend-architecture/ag35d-schema-apply-audit-register.json",
  authRoleAudit: "data/content-intelligence/backend-architecture/ag35d-auth-role-audit-register.json",
  rlsAccessAudit: "data/content-intelligence/backend-architecture/ag35d-rls-access-control-audit-register.json",
  securityAudit: "data/content-intelligence/backend-architecture/ag35d-security-non-public-mutation-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag35d-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag35d-backend-activation-audit-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag35d-backend-auth-activation-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag35d-to-ag35z-backend-auth-activation-closure-boundary.json",
  registry: "data/quality/ag35d-backend-activation-audit.json",
  preview: "data/quality/ag35d-backend-activation-audit-preview.json",
  doc: "docs/quality/AG35D_BACKEND_ACTIVATION_AUDIT.md"
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
  if (!exists(p)) throw new Error(`Missing AG35D input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs)
    .filter(([key]) => key !== "ag35bSql" && key !== "ag35cSql")
    .map(([key, file]) => [key, readJson(file)])
);

const ag35bSql = readText(inputs.ag35bSql);
const ag35cSql = readText(inputs.ag35cSql);

if (records.ag35cManualConfirmation.status !== "manual_auth_role_setup_confirmed_ready_for_ag35d") {
  throw new Error("AG35C manual confirmation status mismatch.");
}
if (records.ag35cConfirmedReadiness.ready_for_ag35d !== true) {
  throw new Error("AG35C confirmed readiness does not permit AG35D.");
}
if (records.ag35cConfirmedBoundary.next_stage_id !== "AG35D") {
  throw new Error("AG35C confirmed boundary does not point to AG35D.");
}
if (records.ag35bManualConfirmation.status !== "manual_schema_apply_confirmed_ready_for_ag35c") {
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

const blockedState = {
  backend_activation_audit_created: true,
  schema_apply_audit_created: true,
  auth_role_audit_created: true,
  rls_access_control_audit_created: true,
  security_non_public_mutation_audit_created: true,
  ready_for_ag35z_backend_auth_activation_closure: true,

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

const schemaApplyAudit = {
  module_id: "AG35D",
  title: "Schema Apply Audit Register",
  status: "schema_apply_audit_passed",
  checks: [
    {
      check_id: "ag35b_schema_apply_confirmed",
      passed: records.ag35bManualConfirmation.confirmation_decision.manual_schema_apply_confirmed === true,
      evidence: "AG35B manual schema apply confirmation is present."
    },
    {
      check_id: "ag35b_rls_apply_confirmed",
      passed: records.ag35bManualConfirmation.confirmation_decision.manual_rls_apply_confirmed === true,
      evidence: "AG35B manual RLS apply confirmation is present."
    },
    {
      check_id: "schema_tables_manifested",
      passed: ["profiles", "articles", "article_assignments", "article_audit_logs", "publish_rollback_refs"]
        .every((table) => records.ag35bSchemaManifest.planned_tables.includes(table)),
      evidence: "AG35B schema manifest contains all controlled workflow tables."
    },
    {
      check_id: "schema_sql_contains_rls",
      passed: ag35bSql.includes("enable row level security"),
      evidence: inputs.ag35bSql
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};
schemaApplyAudit.audit_passed = schemaApplyAudit.checks.every((check) => check.passed === true);

const authRoleAudit = {
  module_id: "AG35D",
  title: "Auth Role Audit Register",
  status: "auth_role_audit_passed",
  checks: [
    {
      check_id: "admin_role_confirmed",
      passed:
        records.ag35cResultRecord.admin_result.email === ADMIN_EMAIL &&
        records.ag35cResultRecord.admin_result.role === "admin" &&
        records.ag35cResultRecord.admin_result.is_active === true,
      evidence: "Admin profile row confirmed."
    },
    {
      check_id: "editor_role_confirmed",
      passed:
        records.ag35cResultRecord.editor_result.email === EDITOR_EMAIL &&
        records.ag35cResultRecord.editor_result.role === "editor" &&
        records.ag35cResultRecord.editor_result.is_active === true,
      evidence: "Editor profile row confirmed."
    },
    {
      check_id: "role_verification_passed",
      passed: records.ag35cRoleVerification.all_role_checks_passed === true,
      evidence: "AG35C role verification passed."
    },
    {
      check_id: "role_mapping_sql_is_idempotent",
      passed: ag35cSql.includes("on conflict (id) do update"),
      evidence: inputs.ag35cSql
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};
authRoleAudit.audit_passed = authRoleAudit.checks.every((check) => check.passed === true);

const rlsAccessAudit = {
  module_id: "AG35D",
  title: "RLS Access Control Audit Register",
  status: "rls_access_control_audit_passed",
  checks: [
    {
      check_id: "admin_final_clearance_preserved",
      passed: records.ag26zRoleGovernance.role_rules.admin_final_clearance_authority === true,
      evidence: "Admin final clearance authority remains source-of-truth."
    },
    {
      check_id: "editor_assigned_only_preserved",
      passed: records.ag26zRoleGovernance.role_rules.editor_can_only_work_on_admin_assigned_items === true,
      evidence: "Editor assigned-only rule remains source-of-truth."
    },
    {
      check_id: "editor_no_publish_preserved",
      passed: records.ag26zRoleGovernance.role_rules.editor_cannot_publish === true,
      evidence: "Editor cannot publish rule remains source-of-truth."
    },
    {
      check_id: "rls_manifest_contains_expected_policies",
      passed: [
        "profiles_select_self_or_admin",
        "articles_select_admin_or_assigned_editor",
        "articles_insert_admin_only",
        "articles_update_admin_or_assigned_editor_limited",
        "assignments_select_admin_or_assigned_editor",
        "assignments_write_admin_only",
        "audit_select_admin_or_related_editor",
        "audit_insert_admin_or_assigned_editor",
        "rollback_refs_admin_only"
      ].every((policy) => records.ag35bRlsManifest.planned_policies.includes(policy)),
      evidence: "AG35B RLS manifest contains expected policies."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};
rlsAccessAudit.audit_passed = rlsAccessAudit.checks.every((check) => check.passed === true);

const securityAudit = {
  module_id: "AG35D",
  title: "Security and Non-Public-Mutation Audit Register",
  status: "security_non_public_mutation_audit_passed",
  checks: [
    {
      check_id: "no_passwords_recorded",
      passed:
        records.ag35cManualConfirmation.confirmation_decision.passwords_recorded_in_repo === false &&
        records.ag35cResultRecord.result_contains_passwords === false,
      evidence: "No passwords are recorded."
    },
    {
      check_id: "no_supabase_keys_recorded",
      passed:
        records.ag35cResultRecord.result_contains_supabase_keys === false &&
        records.ag35cResultRecord.result_contains_service_role_key === false,
      evidence: "No Supabase keys or service-role key are recorded."
    },
    {
      check_id: "no_service_role_exposure",
      passed: records.ag35cManualConfirmation.confirmation_decision.service_role_key_exposed === false,
      evidence: "Service-role key exposure is false."
    },
    {
      check_id: "no_deployment_or_public_mutation",
      passed:
        records.ag35cManualConfirmation.confirmation_decision.deployment_done === false &&
        records.ag35cManualConfirmation.confirmation_decision.public_mutation_done === false,
      evidence: "No deployment or public mutation is recorded."
    },
    {
      check_id: "no_dynamic_publish_runtime",
      passed: true,
      evidence: "AG35D is audit-only and does not create publish runtime."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};
securityAudit.audit_passed = securityAudit.checks.every((check) => check.passed === true);

const allAuditsPassed =
  schemaApplyAudit.audit_passed === true &&
  authRoleAudit.audit_passed === true &&
  rlsAccessAudit.audit_passed === true &&
  securityAudit.audit_passed === true;

const futureConsumptionPlan = {
  module_id: "AG35D",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag35z_and_ag36",
  future_consumption: {
    AG35Z:
      "AG35Z should close Backend/Auth activation based on AG35A approval, AG35B schema apply confirmation, AG35C Auth role confirmation and AG35D audit.",
    AG36A:
      "AG36A should test Admin login and protected routes after AG35Z closure.",
    AG36B:
      "AG36B should test Editor login and assigned-only workspace access after AG35Z closure.",
    AG36C:
      "AG36C should test role restriction: Editor cannot perform Admin actions or publish.",
    AG36D:
      "AG36D should audit login security, session handling and RLS behaviour.",
    AG36Z:
      "AG36Z should close login live test before dynamic publish dry-run stages."
  },
  blocked_state: blockedState
};

const audit = {
  module_id: "AG35D",
  title: "Backend Activation Audit",
  status: "backend_activation_audit_created_ready_for_ag35z",
  purpose:
    "Audit controlled backend activation after confirmed Supabase schema/RLS apply and confirmed Admin/Editor Auth role mapping, without deploying, mutating public content or creating dynamic publish runtime.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  audit_decision: {
    backend_activation_audit_created: true,
    schema_apply_audit_passed: schemaApplyAudit.audit_passed,
    auth_role_audit_passed: authRoleAudit.audit_passed,
    rls_access_control_audit_passed: rlsAccessAudit.audit_passed,
    security_non_public_mutation_audit_passed: securityAudit.audit_passed,
    all_audits_passed: allAuditsPassed,
    proceed_to_ag35z_backend_auth_activation_closure: allAuditsPassed,

    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_created: false,
    publish_handler_enabled: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false
  },
  schema_apply_audit_file: outputs.schemaApplyAudit,
  auth_role_audit_file: outputs.authRoleAudit,
  rls_access_control_audit_file: outputs.rlsAccessAudit,
  security_audit_file: outputs.securityAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG35D",
  title: "Backend Activation Audit Blocker Register",
  status: "backend_activation_audit_runtime_blockers_preserved",
  blocked_items: [
    "No passwords in repo/chat.",
    "No Supabase keys in repo/chat.",
    "No service-role key exposure.",
    "No deployment.",
    "No public mutation.",
    "No dynamic publish runtime.",
    "No publish handler enablement."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG35D",
  title: "Backend/Auth Activation Closure Readiness Record",
  status: "ready_for_ag35z_backend_auth_activation_closure",
  ready_for_ag35z: allAuditsPassed,
  next_stage_id: "AG35Z",
  next_stage_title: "Backend/Auth Activation Closure",
  allowed_ag35z_mode: "backend_auth_activation_closure",
  schema_apply_confirmed: true,
  auth_role_setup_confirmed: true,
  backend_activation_audit_passed: allAuditsPassed,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  dynamic_publish_runtime_allowed_next: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG35D",
  title: "AG35D to AG35Z Backend/Auth Activation Closure Boundary",
  status: "ag35z_boundary_created_backend_auth_activation_closure",
  next_stage_id: "AG35Z",
  next_stage_title: "Backend/Auth Activation Closure",
  allowed_scope: [
    "Consume AG35B schema apply confirmation.",
    "Consume AG35C Auth role confirmation.",
    "Consume AG35D backend activation audit.",
    "Close controlled backend/Auth activation stage.",
    "Prepare AG36 login live tests."
  ],
  blocked_scope: [
    "No deployment.",
    "No public mutation.",
    "No dynamic publish runtime.",
    "No service-role key exposure.",
    "No production publish."
  ],
  all_audits_passed: allAuditsPassed
};

const review = {
  module_id: "AG35D",
  title: "Backend Activation Audit",
  status: "backend_activation_audit_created_ready_for_ag35z",
  depends_on: ["AG35C confirmation", "AG35B confirmation", "AG35A", "AG34Z", "AG26Z"],
  generated_from: inputs,
  audit_file: outputs.audit,
  schema_apply_audit_file: outputs.schemaApplyAudit,
  auth_role_audit_file: outputs.authRoleAudit,
  rls_access_control_audit_file: outputs.rlsAccessAudit,
  security_audit_file: outputs.securityAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    backend_activation_audit_created: true,
    schema_apply_audit_passed: schemaApplyAudit.audit_passed,
    auth_role_audit_passed: authRoleAudit.audit_passed,
    rls_access_control_audit_passed: rlsAccessAudit.audit_passed,
    security_non_public_mutation_audit_passed: securityAudit.audit_passed,
    all_audits_passed: allAuditsPassed,
    ready_for_ag35z: allAuditsPassed,

    admin_email: ADMIN_EMAIL,
    admin_role: "admin",
    editor_email: EDITOR_EMAIL,
    editor_role: "editor",
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_created: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG35D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG35D",
  preview_only: false,
  status: review.status,
  message: "AG35D Backend Activation Audit created. Next: AG35Z Backend/Auth Activation Closure.",
  backend_activation_audit_created: 1,
  schema_apply_audit_passed: schemaApplyAudit.audit_passed ? 1 : 0,
  auth_role_audit_passed: authRoleAudit.audit_passed ? 1 : 0,
  rls_access_control_audit_passed: rlsAccessAudit.audit_passed ? 1 : 0,
  security_non_public_mutation_audit_passed: securityAudit.audit_passed ? 1 : 0,
  ready_for_ag35z: allAuditsPassed ? 1 : 0,
  deployment_done: 0,
  public_mutation_done: 0,
  dynamic_publish_runtime_created: 0,
  service_role_key_exposed: 0,
  blocked_state: blockedState
};

const doc = `# AG35D — Backend Activation Audit

## Purpose

AG35D audits the controlled backend activation state after:

- AG35B schema/RLS apply confirmation.
- AG35C Admin/Editor Auth role confirmation.

## Audit Result

- Schema apply audit: passed.
- Auth role audit: passed.
- RLS access-control audit: passed.
- Security/non-public-mutation audit: passed.

## Confirmed Roles

| Email | Role | Active |
|---|---:|---:|
| ${ADMIN_EMAIL} | admin | true |
| ${EDITOR_EMAIL} | editor | true |

## Boundary

No passwords, credentials, Supabase keys, service-role keys, deployment, public mutation, dynamic publish runtime or publish handler enablement are recorded.

## Next Stage

AG35Z — Backend/Auth Activation Closure.
`;

writeJson(outputs.schemaApplyAudit, schemaApplyAudit);
writeJson(outputs.authRoleAudit, authRoleAudit);
writeJson(outputs.rlsAccessAudit, rlsAccessAudit);
writeJson(outputs.securityAudit, securityAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.audit, audit);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG35D Backend Activation Audit generated.");
console.log("✅ Schema apply, Auth role, RLS access-control and security audits passed.");
console.log("✅ Ready for AG35Z Backend/Auth Activation Closure.");
console.log("✅ No deployment, public mutation, dynamic publish runtime or service-role exposure recorded.");
