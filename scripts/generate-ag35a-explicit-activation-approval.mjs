import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag34zReview: "data/content-intelligence/quality-reviews/ag34z-backend-activation-readiness-closure.json",
  ag34zClosure: "data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure.json",
  ag34zSourceChain: "data/content-intelligence/backend-architecture/ag34z-ag34-source-chain-register.json",
  ag34zClosureRegister: "data/content-intelligence/backend-architecture/ag34z-backend-activation-readiness-closure-register.json",
  ag34zActivationBlocker: "data/content-intelligence/backend-architecture/ag34z-activation-blocker-carry-forward.json",
  ag34zAg35Handoff: "data/content-intelligence/backend-architecture/ag34z-ag35-explicit-activation-approval-handoff-plan.json",
  ag34zReadiness: "data/content-intelligence/quality-registry/ag34z-ag35-explicit-activation-approval-readiness-record.json",
  ag34zBoundary: "data/content-intelligence/mutation-plans/ag34z-to-ag35a-explicit-activation-approval-boundary.json",

  ag34dAudit: "data/content-intelligence/backend-architecture/ag34d-backend-readiness-audit.json",
  ag34dReadiness: "data/content-intelligence/quality-registry/ag34d-backend-activation-readiness-closure-record.json",

  ag33zClosure: "data/content-intelligence/backend-architecture/ag33z-dynamic-publish-scaffold-closure.json",
  ag33zActivationBlocker: "data/content-intelligence/backend-architecture/ag33z-activation-blocker-carry-forward.json",

  ag29zClosure: "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  ag28Blueprint: "data/content-intelligence/backend-architecture/ag28-backend-auth-architecture-blueprint.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag35a-explicit-activation-approval.json",
  approval: "data/content-intelligence/backend-architecture/ag35a-explicit-activation-approval.json",
  controlledActivationDecision: "data/content-intelligence/backend-architecture/ag35a-controlled-activation-decision-record.json",
  riskAcknowledgement: "data/content-intelligence/backend-architecture/ag35a-activation-risk-acknowledgement-record.json",
  activationControlPlan: "data/content-intelligence/backend-architecture/ag35a-controlled-activation-control-plan.json",
  nonExecutionAudit: "data/content-intelligence/backend-architecture/ag35a-approval-non-execution-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag35a-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag35a-controlled-activation-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag35a-supabase-schema-apply-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag35a-to-ag35b-supabase-schema-apply-boundary.json",
  registry: "data/quality/ag35a-explicit-activation-approval.json",
  preview: "data/quality/ag35a-explicit-activation-approval-preview.json",
  doc: "docs/quality/AG35A_EXPLICIT_ACTIVATION_APPROVAL.md"
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

function allFalse(obj) {
  return Object.values(obj || {}).every((value) => value === false);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG35A input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([key, file]) => [key, readJson(file)]));

if (records.ag34zClosure.status !== "backend_activation_readiness_closure_created_ready_for_ag35a") throw new Error("AG34Z closure status mismatch.");
if (records.ag34zReadiness.ready_for_ag35a !== true) throw new Error("AG34Z readiness does not permit AG35A.");
if (records.ag34zReadiness.allowed_ag35a_mode !== "explicit_activation_approval_stop_point_only") throw new Error("AG35A mode mismatch.");
if (records.ag34zReadiness.explicit_user_approval_required_next !== true) throw new Error("AG35A explicit approval requirement missing.");
if (records.ag34zBoundary.next_stage_id !== "AG35A") throw new Error("AG34Z boundary does not point to AG35A.");
if (records.ag34zAg35Handoff.explicit_approval_required_before_real_activation !== true) throw new Error("AG35 handoff approval requirement missing.");

if (records.ag34dAudit.audit_decision?.all_audits_passed !== true) throw new Error("AG34D all audits must pass.");
if (!allFalse(records.ag34zActivationBlocker.blocked_activation_items)) throw new Error("AG34Z activation blockers must remain false before AG35A approval.");
if (!allFalse(records.ag33zActivationBlocker.blocked_activation_items)) throw new Error("AG33Z activation blockers must remain false before AG35A approval.");

if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) throw new Error("Admin final clearance missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("Editor assigned-only rule missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) throw new Error("Editor no-publish rule missing.");

const blockedState = {
  explicit_activation_approval_record_created: true,
  controlled_activation_approved_by_user: true,
  ag35b_schema_apply_allowed_next: true,

  supabase_project_created_now: false,
  supabase_connected_now: false,
  auth_enabled_now: false,
  real_admin_login_created_now: false,
  real_editor_login_created_now: false,
  test_admin_created_now: false,
  test_editor_created_now: false,
  credential_created_now: false,
  runtime_backend_created_now: false,
  database_table_created_now: false,
  database_constraint_created_now: false,
  database_index_created_now: false,
  database_write_done_now: false,
  sql_generated_now: false,
  sql_applied_now: false,
  migration_generated_now: false,
  migration_applied_now: false,
  rls_policy_created_now: false,
  rls_policy_applied_now: false,
  secrets_created_now: false,
  env_vars_written_now: false,
  service_role_key_created_now: false,
  service_role_key_stored_now: false,
  service_role_key_exposed_now: false,
  server_route_created_now: false,
  api_route_created_now: false,
  route_guard_runtime_created_now: false,
  session_runtime_created_now: false,
  assignment_query_created_now: false,
  queue_runtime_created_now: false,
  audit_runtime_created_now: false,
  rollback_runtime_created_now: false,
  publish_handler_runtime_created_now: false,
  github_write_performed_now: false,
  deployment_triggered_now: false,
  published_now: false,
  public_mutation_done_now: false,
  supabase_auth_backend_activated_now: false
};

const controlledActivationDecision = {
  module_id: "AG35A",
  title: "Controlled Activation Decision Record",
  status: "controlled_activation_approved_ready_for_ag35b",
  explicit_user_approval_received: true,
  approval_basis:
    "User confirmed that controlled activation should begin considering the amount of effort already placed.",
  approved_activation_mode: "controlled_staged_activation",
  approved_next_stage: "AG35B — Supabase Schema Apply",
  approval_scope_now: [
    "Begin controlled activation sequence.",
    "Move from readiness-only planning to controlled schema-apply stage.",
    "Keep secrets out of repository and chat.",
    "Keep Auth users, credentials, public mutation and deployment blocked until their respective stages."
  ],
  not_performed_in_ag35a: [
    "No Supabase project creation.",
    "No Supabase connection.",
    "No database/schema apply.",
    "No Auth/user creation.",
    "No secrets or env vars written.",
    "No deployment.",
    "No public mutation."
  ],
  blocked_state: blockedState
};

const riskAcknowledgement = {
  module_id: "AG35A",
  title: "Activation Risk Acknowledgement Record",
  status: "activation_risks_acknowledged_for_controlled_sequence",
  acknowledged_risk_domains: [
    "Database schema/RLS may affect future runtime access.",
    "Secrets must never be committed to Git or pasted into code.",
    "Service-role key must remain server-only.",
    "Auth users and role setup must be verified before login tests.",
    "Public mutation must not occur until dry-run and audit stages pass.",
    "Rollback reference and audit logs must be preserved before publish actions."
  ],
  risk_controls_required: [
    "Stage-by-stage execution only.",
    "No skipping AG35B, AG35C, AG35D and AG35Z.",
    "No frontend exposure of service role key.",
    "No public publish until later dry-run and public-surface checks.",
    "Run project validation after every stage.",
    "Commit each activation stage separately."
  ],
  blocked_state: blockedState
};

const activationControlPlan = {
  module_id: "AG35A",
  title: "Controlled Activation Control Plan",
  status: "controlled_activation_control_plan_created_for_ag35b",
  control_sequence: [
    "AG35A — Explicit Activation Approval",
    "AG35B — Supabase Schema Apply",
    "AG35C — Auth Role Setup",
    "AG35D — Backend Activation Audit",
    "AG35Z — Backend/Auth Activation Closure",
    "AG36A — Admin Login Test",
    "AG36B — Editor Login Test",
    "AG36C — Role Restriction Test",
    "AG36D — Login Security Audit",
    "AG36Z — Login Live Test Closure"
  ],
  ag35b_controls: [
    "AG35B may prepare/apply schema only under controlled instructions.",
    "No service role key should be committed.",
    "No public mutation should occur.",
    "No Auth user creation should occur in AG35B.",
    "RLS policy scope must remain aligned with Admin final authority and Editor assigned-only/no-publish governance."
  ],
  still_blocked_until_later: [
    "Auth role setup until AG35C.",
    "Activation audit until AG35D.",
    "Login tests until AG36.",
    "Dynamic publish dry-run until AG37.",
    "First dynamic publish until AG38."
  ],
  blocked_state: blockedState
};

const nonExecutionAudit = {
  module_id: "AG35A",
  title: "Approval Non-Execution Audit Register",
  status: "approval_non_execution_audit_passed",
  checks: [
    { check_id: "approval_record_only", passed: true, evidence: "AG35A records explicit approval and next-stage readiness." },
    { check_id: "no_supabase_connection", passed: true, evidence: "No Supabase project connection is attempted in AG35A." },
    { check_id: "no_schema_apply", passed: true, evidence: "No database schema, SQL, migration or RLS policy is generated/applied in AG35A." },
    { check_id: "no_auth_user_or_credential", passed: true, evidence: "No Auth users, credentials or invitations are created." },
    { check_id: "no_secret_or_env_write", passed: true, evidence: "No secrets or environment variables are written." },
    { check_id: "no_public_mutation", passed: true, evidence: "No GitHub write, deployment, publishing or public mutation is performed." },
    { check_id: "governance_preserved", passed: true, evidence: "Admin final authority and Editor assigned-only/no-publish governance remain preserved." }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG35A",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag35b",
  future_consumption: {
    AG35B:
      "AG35B should consume this explicit approval and proceed with controlled Supabase schema apply instructions. Secrets must remain outside repo and public mutation must remain blocked.",
    AG35C:
      "AG35C should configure Auth roles only after schema prerequisites are ready.",
    AG35D:
      "AG35D should audit activation after approved activation steps.",
    AG35Z:
      "AG35Z should close Backend/Auth activation before AG36 login live tests.",
    AG36:
      "AG36 should test Admin login, Editor login and role restrictions only after AG35 closure."
  },
  blocked_state: blockedState
};

const approval = {
  module_id: "AG35A",
  title: "Explicit Activation Approval",
  status: "explicit_activation_approval_recorded_ready_for_ag35b",
  purpose:
    "Record explicit approval to begin controlled backend activation sequence, while keeping AG35A itself non-executing and preparing AG35B Supabase Schema Apply boundary.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag34z_status: records.ag34zClosure.status,
    ag34d_status: records.ag34dAudit.status,
    ag33z_status: records.ag33zClosure.status,
    ag29z_status: records.ag29zClosure.status,
    ag28_status: records.ag28Blueprint.status,
    admin_final_clearance_preserved: true,
    editor_assigned_only_preserved: true,
    editor_no_publish_preserved: true
  },
  approval_decision: {
    explicit_user_approval_received: true,
    controlled_activation_authorized: true,
    proceed_to_ag35b_supabase_schema_apply: true,

    supabase_project_created_in_ag35a: false,
    supabase_connected_in_ag35a: false,
    auth_enabled_in_ag35a: false,
    database_created_in_ag35a: false,
    database_write_done_in_ag35a: false,
    sql_generated_in_ag35a: false,
    sql_applied_in_ag35a: false,
    migration_generated_in_ag35a: false,
    migration_applied_in_ag35a: false,
    rls_policy_created_in_ag35a: false,
    rls_policy_applied_in_ag35a: false,
    secrets_created_in_ag35a: false,
    env_vars_written_in_ag35a: false,
    service_role_key_created_in_ag35a: false,
    service_role_key_exposed_in_ag35a: false,
    user_created_in_ag35a: false,
    credential_created_in_ag35a: false,
    server_route_created_in_ag35a: false,
    api_route_created_in_ag35a: false,
    runtime_handler_created_in_ag35a: false,
    github_write_done_in_ag35a: false,
    deployment_done_in_ag35a: false,
    public_mutation_done_in_ag35a: false
  },
  controlled_activation_decision_file: outputs.controlledActivationDecision,
  risk_acknowledgement_file: outputs.riskAcknowledgement,
  activation_control_plan_file: outputs.activationControlPlan,
  non_execution_audit_file: outputs.nonExecutionAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG35A",
  title: "Controlled Activation Blocker Register",
  status: "controlled_activation_blockers_carried_to_ag35b",
  blocked_now_in_ag35a: [
    "No Supabase project creation.",
    "No Supabase connection.",
    "No Auth activation.",
    "No user or credential creation.",
    "No database/schema apply.",
    "No SQL/migration/RLS application.",
    "No secrets or env vars written.",
    "No service-role key handling.",
    "No server/API route runtime.",
    "No GitHub write or deployment.",
    "No publishing or public mutation."
  ],
  allowed_next_in_ag35b: [
    "Controlled schema apply preparation.",
    "Controlled Supabase schema apply instructions.",
    "Schema/RLS application only under AG35B-controlled boundary.",
    "No Auth user creation until AG35C.",
    "No public mutation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG35A",
  title: "Supabase Schema Apply Readiness Record",
  status: "ready_for_ag35b_supabase_schema_apply",
  ready_for_ag35b: true,
  next_stage_id: "AG35B",
  next_stage_title: "Supabase Schema Apply",
  allowed_ag35b_mode: "controlled_supabase_schema_apply",
  explicit_user_approval_received: true,
  controlled_activation_authorized: true,
  schema_apply_allowed_next: true,

  auth_activation_allowed_now: false,
  user_creation_allowed_now: false,
  credential_creation_allowed_now: false,
  secret_write_allowed_now: false,
  public_mutation_allowed_now: false,
  deployment_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG35A",
  title: "AG35A to AG35B Supabase Schema Apply Boundary",
  status: "ag35b_boundary_created_controlled_supabase_schema_apply",
  next_stage_id: "AG35B",
  next_stage_title: "Supabase Schema Apply",
  allowed_scope: [
    "Consume AG35A explicit approval record.",
    "Prepare controlled Supabase schema apply step.",
    "Use AG29 schema/RLS planning and AG34 readiness controls.",
    "Keep service role key outside repo and frontend.",
    "Keep Auth user creation blocked until AG35C.",
    "Keep public mutation blocked."
  ],
  blocked_scope: [
    "No public mutation.",
    "No deployment.",
    "No production publish.",
    "No service role exposure.",
    "No Auth user creation in AG35B.",
    "No credentials in repo.",
    "No unreviewed schema/RLS application."
  ],
  explicit_approval_received: true,
  controlled_activation_selected: true
};

const review = {
  module_id: "AG35A",
  title: "Explicit Activation Approval",
  status: "explicit_activation_approval_recorded_ready_for_ag35b",
  depends_on: ["AG34Z", "AG34D", "AG33Z", "AG29Z", "AG28", "AG26Z"],
  generated_from: inputs,
  approval_file: outputs.approval,
  controlled_activation_decision_file: outputs.controlledActivationDecision,
  risk_acknowledgement_file: outputs.riskAcknowledgement,
  activation_control_plan_file: outputs.activationControlPlan,
  non_execution_audit_file: outputs.nonExecutionAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    explicit_activation_approval_recorded: true,
    controlled_activation_authorized: true,
    ready_for_ag35b: true,

    supabase_project_created: false,
    supabase_connected: false,
    auth_enabled: false,
    user_created: false,
    credential_created: false,
    database_created: false,
    database_write_done: false,
    sql_generated: false,
    sql_applied: false,
    migration_generated: false,
    migration_applied: false,
    rls_policy_created: false,
    rls_policy_applied: false,
    secrets_created: false,
    env_vars_written: false,
    service_role_key_created: false,
    service_role_key_exposed: false,
    server_routes_created: false,
    api_routes_created: false,
    github_write_done: false,
    deployment_done: false,
    public_mutation_done: false,
    real_execution_done_in_ag35a: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG35A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG35A",
  preview_only: true,
  status: review.status,
  message: "AG35A Explicit Activation Approval recorded. Next: AG35B Supabase Schema Apply.",
  explicit_activation_approval_recorded: 1,
  controlled_activation_authorized: 1,
  ready_for_ag35b: 1,
  supabase_project_created: 0,
  supabase_connected: 0,
  auth_enabled: 0,
  user_created: 0,
  credential_created: 0,
  database_objects_created: 0,
  database_write_done: 0,
  sql_generated: 0,
  sql_applied: 0,
  migrations_generated: 0,
  migrations_applied: 0,
  rls_policies_created: 0,
  rls_policies_applied: 0,
  secrets_created: 0,
  env_vars_written: 0,
  service_role_key_created: 0,
  service_role_key_exposed: 0,
  server_routes_created: 0,
  api_routes_created: 0,
  github_write_done: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  blocked_state: blockedState
};

const doc = `# AG35A — Explicit Activation Approval

## Purpose

AG35A records explicit approval to begin controlled backend activation.

## Approval Decision

Controlled activation is authorized.

The next stage is AG35B — Supabase Schema Apply.

## Important Boundary

AG35A is approval-record only.

No Supabase project creation, Supabase connection, Auth activation, user creation, credentials, database schema apply, SQL/migration/RLS application, secrets, environment variables, service-role key, server/API route, deployment, publishing or public mutation is performed in AG35A.

## Controls for AG35B

- Keep secrets outside the repository.
- Do not expose service-role key to frontend.
- Do not create Auth users until AG35C.
- Do not perform public mutation.
- Use AG29 schema/RLS planning and AG34 readiness controls.
- Validate and commit separately.

## Next Stage

AG35B — Supabase Schema Apply.
`;

writeJson(outputs.review, review);
writeJson(outputs.approval, approval);
writeJson(outputs.controlledActivationDecision, controlledActivationDecision);
writeJson(outputs.riskAcknowledgement, riskAcknowledgement);
writeJson(outputs.activationControlPlan, activationControlPlan);
writeJson(outputs.nonExecutionAudit, nonExecutionAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG35A Explicit Activation Approval generated.");
console.log("✅ Controlled activation approval recorded.");
console.log("✅ AG35B Supabase Schema Apply boundary created.");
console.log("✅ No Supabase/Auth/backend activation, database, RLS, secrets, accounts, deployment or public mutation performed in AG35A.");
